---
tags: [homelab, networking, tls, caddy, edge]
---

# Public Access — Edge (No-IP + Caddy)

Part of [[Homelab MOC]]. The one deliberate exception to "everything is
Tailscale/LAN-only" in this lab. Lives in `edge/` — a separate Docker Compose
project from `monitoring/`, on purpose, so it stays easy to audit/tear down
without touching anything internal-only. Confirmed working end-to-end as of
**2026-09-24**.

## Why it exists

Replaces a Synology-style "No-IP + port forwarding" setup the user relied on
previously, now that Aery is plain Debian instead of Synology DSM. Goal:
flexibly expose *any* future service, not just Nextcloud, behind one TLS
certificate.

## Architecture (steady state)

```
Internet
   │  resolves aeryserver.ddns.net → current public IP (No-IP, ddclient keeps it updated)
   ▼
ISP gateway (DZS, PPPoE)         — forwards 80/8443/8444-8448 → 192.168.1.10
   ▼
Deco M5 (second router)          — forwards the same ports    → 192.168.68.107 (Ocra)
   ▼
Ocra — Caddy (edge/docker-compose.yaml)
   │  one Caddyfile site block per exposed port, all sharing ONE certificate
   │  for the hostname (Caddy dedupes automatically — no extra cert per port)
   │
   ├─ :8443 → reverse_proxy 100.107.52.17:8093 (wake-proxy, itself on Ocra)
   │             └─ wake-proxy → 100.98.226.8:8080 (Aery, Nextcloud) — see [[Node Power Control]]
   │
   └─ :8444-8448 → reserved range, one block per future service:
                    - always-on node → reverse_proxy straight to its Tailscale IP
                    - on-demand node → reverse_proxy to its own wake-proxy-style hop first
```

**Decision rule for any new service:** is the target node always on? If yes,
point Caddy straight at its Tailscale IP. If no (on-demand/WOL), it needs a
wake-proxy-style hop in front of it first, same pattern as Aery — see
[[Node Power Control]].

### Files involved

| File | Purpose |
| --- | --- |
| `edge/docker-compose.yaml` | Caddy (auto TLS) + ddclient (No-IP updater). `caddy.ports` lists every exposed port — must match both the Caddyfile and the router rules. |
| `edge/Caddyfile` | One site block per port; template comment documents the 4-step process for adding a new one. |
| `edge/.env` | `ACME_EMAIL`, `NOIP_HOSTNAME` (`aeryserver.ddns.net`). |
| `edge/ddclient/ddclient.conf` | No-IP credentials (gitignored — plaintext password). |
| `edge/README.md` | Full setup + security notes. |

### Adding a new service (the actual recipe)

1. Get the target's **Tailscale IP** (never LAN IP — see
   [[Nodes and Network]]'s addressing convention).
2. Check if it's 24/7 or on-demand (`scripts/wol/README.md`). On-demand needs
   a wake-proxy hop first.
3. Pick a free port from the reserved range (8444–8448 — already forwarded
   on both routers).
4. Add a Caddyfile block reusing `{$NOIP_HOSTNAME}`, new port, new backend.
5. `docker compose up -d --force-recreate caddy`.
6. Test from outside the LAN with Tailscale **off** (mobile data) — testing
   from inside your own network is unreliable (see NAT loopback below).

No router trip needed as long as the port is inside the already-forwarded
reserved range.

## Security boundary

Never expose through this stack: Proxmox's web UI/SSH on Sadida, the k3s API
server, or the Control API (it can power nodes off remotely — a bearer token
is not a substitute for not putting it on the internet). Only expose
services with their own login (Nextcloud has one); don't expose Grafana,
Portainer, etc. this way without extra hardening. Crowdsec/fail2ban in front
of Caddy is a noted future hardening step, not done yet.

---

## Lessons learned — the troubleshooting story

Getting TLS working through this double-NAT connection took several wrong
turns worth keeping, because each one is a generically useful diagnostic
pattern, not just a one-off fix.

### 1. "Timeout during connect" vs. "Connection refused" mean different things

Caddy's ACME logs kept alternating between the two on the `http-01`
challenge (port 80):
- **Timeout during connect** = the packet is silently dropped somewhere —
  consistent with a missing/misrouted port-forward, or a firewall that drops
  rather than rejects.
- **Connection refused** = a TCP RST came back — something *did* receive the
  packet and actively rejected it. Progress, not a new failure: it means the
  path is at least reaching a device that responds.

Also: the IP address embedded in Let's Encrypt's error detail
(e.g. `"38.92.202.177: Fetching http://...: Timeout"`) is **the IP the ACME
server resolved for your hostname and tried to connect to** — i.e. it
reflects *your own* current public IP at the moment of that attempt, not a
Let's Encrypt server's own address. This mattered a lot below.

### 2. Double-NAT topology, mapped explicitly

```
ISP gateway (DZS, PPPoE, eth0.v203.ppp)  — port-forwards → 192.168.1.10
Deco M5 (second router)                  — port-forwards → 192.168.68.107 (Ocra)
```

Both layers need a matching rule for any port to reach Ocra from outside.
Confirmed both were correctly configured (not a stale rule pointing at a
decommissioned Synology IP, which was the first suspicion once Aery got
migrated off Synology).

### 3. Red herring: browser-from-inside-your-own-LAN test

Browsing to `http://aeryserver.ddns.net/` **from a device on the same LAN**
redirected to the router's own admin page. This looked like the ISP
gateway's remote-management web UI hijacking port 80 — a real phenomenon on
some ISP gateways — but turned out to be a **NAT hairpin/loopback**
artifact instead: many consumer routers can't cleanly handle a LAN device
addressing its own public IP and looping back in. **Conclusion: never trust
a same-LAN browser test of your own public hostname; it can fail for reasons
that have nothing to do with whether the outside world can reach you.**
`curl` run directly on Ocra itself, targeting its own public hostname, hit
the identical artifact (failed in 18ms — far too fast to be a real
round-trip).

The correct way to test reachability: **canyouseeme.org** (true external
TCP check) or a phone on mobile data with Tailscale fully off.

### 4. Red herring: CGNAT hypothesis

Floated when nothing else explained the failures: if the "public" IP is
actually a Carrier-Grade NAT address shared across ISP customers, no
port-forward would ever work. **Ruled out** by confirming the IP the ISP
gateway itself reports as "WAN IP" matches what an external site
(whatismyipaddress.com) sees — and, more concretely, by later confirming
port 80 *does* work end-to-end (see #6). Kept here because it's a legitimate
thing to check early in any similar double-NAT debugging session, via:
compare the gateway's own reported WAN IP against an external IP-checker.

### 5. The DZS gateway's own admin UI has no exposed "remote management" toggle

Checked directly in the ISP gateway's web UI (a DZS device — these are
ISP-firmware-customized, no useful public manual exists). Its menu
(Port Forwarding / Interfaces / PPPoE / Parental Control / Wireless) has no
visible remote-management setting — it's likely controlled by the ISP via
TR-069/ACS on their end, not exposed to the customer. A `DMZ` forwarding
type exists on the same screen as an alternative if a per-port rule ever
proves insufficient, though it wasn't ultimately needed here.

### 6. The real root cause: public IP churn + DNS lag, not misconfiguration

The actual fix required **no configuration change at all**. Comparing the
IPs embedded in successive failed ACME attempts (`38.92.202.177` →
`209.91.242.100`) against No-IP's own DNS record and an independent
IP-checker showed the household's **public IP had changed**, and there was
a window where `ddclient` (which checks every 5 minutes) hadn't yet updated
No-IP's record. During that window, Let's Encrypt was correctly trying to
reach a now-stale IP that used to be this network's, but wasn't anymore —
producing exactly the Timeout/Connection-refused mix seen. Once DNS caught
up to the new IP, the very next certificate-issuance attempt succeeded on
the first `http-01` try, with **zero router or Caddy changes**. Port
forwarding had been correct the entire time.

**Generalizable lesson:** on a residential connection without a static IP,
always check whether the failure timeline correlates with an IP change
before reconfiguring anything. `ddclient`'s 5-minute polling interval means
there's always a small window after an IP change where DNS is briefly wrong.

### 7. Isolating "is the public path even reachable" from Tailscale confusion

To rule out Tailscale interfering with the *test itself*, a temporary
Caddyfile block was added routing `:8444` straight to Grafana on Ocra's own
LAN IP (`192.168.68.107:3000`) — deliberately NOT going through Tailscale or
wake-proxy. Tested from a phone on mobile data with Tailscale fully off:
Grafana's login loaded. This confirmed the entire public path (router → Deco
→ Ocra → Caddy) works independently of anything Tailscale-related, and the
block was removed again afterward (Grafana isn't meant to stay exposed —
see the security section above).

### 8. Why Nextcloud briefly redirected to a `*.ts.net` URL

After the public path was confirmed working, a separate, unrelated wrinkle
turned up: loading `https://aeryserver.ddns.net:8443` sometimes redirected
the browser to `aery.stegosaurus-panga.ts.net` — a Tailscale MagicDNS/Funnel
-style hostname. Traced to **Nextcloud's own `config.php`** (likely
`overwritehost`, `overwrite.cli.url`, or `trusted_domains`, probably left
over from an earlier, separate `tailscale funnel` setup on Aery predating
this `edge/` work) — **not** wake-proxy, which was independently confirmed
(by reading `wake-proxy.js`) to rewrite the outbound `Host` header to Aery's
raw Tailscale IP (`100.98.226.8:8080`), never a `.ts.net` name. Nextcloud
generates absolute redirect/asset URLs from whatever hostname value it's
configured to trust, so if that value is a Funnel hostname, links resolve
correctly only for a client whose own device can resolve `.ts.net` names
(i.e. one with Tailscale/MagicDNS active) — explaining why the redirect
briefly seemed to depend on the *phone's* Tailscale state rather than
anything server-side. **Not yet fully cleaned up** — next step is checking
Aery's `config/config.php` for the exact stale value and removing it so
Nextcloud stays consistently on `aeryserver.ddns.net`.

## Certificate details

Real (production) Let's Encrypt certificate, issued **2026-09-24, 23:27:42
Puerto Rico time**, issuer `acme-v02.api.letsencrypt.org-directory` (not
staging). 90-day validity; Caddy auto-renews on its own — confirmed via
`"got renewal info"` log lines showing a computed renewal window well before
expiry. No manual renewal process needed.

## Related

- [[Nodes and Network]] — double-NAT topology, Tailscale addressing
  convention
- [[Node Power Control]] — wake-proxy internals, reused as-is here
- [[Roadmap - Load Balancer]]
