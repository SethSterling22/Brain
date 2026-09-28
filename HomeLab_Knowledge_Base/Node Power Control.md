---
tags: [homelab, power-control, automation]
---

# Node Power Control

Part of [[Homelab MOC]]. Covers manual wake/shutdown, the Control API's
safety model, autonomous idle shutdown, and autonomous wake-on-demand. See
[[Nodes and Network]] for the WOL hardware quirks per node.

## Three layers, from lowest to highest level

1. **`scripts/wol/`** — the raw scripts (`wake.sh`, `shutdown.sh`,
   `status.sh`), runnable by hand from Sadida.
2. **Control API** (`monitoring/control-api/`) — an authenticated HTTP
   service on Ocra wrapping those scripts, driven by Grafana buttons.
3. **Autonomous daemons** — idle-shutdown (sleep) and wake-proxy /
   k3s-autowake (wake) — call the Control API on their own, no human click.

## Control API

Runs with **host networking** (required — WOL magic packets are UDP
broadcasts to `192.168.68.255`; a bridged container can't broadcast onto the
LAN).

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/health` | Liveness + effective config, no auth |
| GET | `/metrics` | Prometheus counters |
| GET | `/nodes` | Allowlist + per-node permissions |
| POST | `/control/wake/:node` | Sends the magic packet |
| POST | `/control/shutdown/:node` | Drains from k3s, then powers off (`?skip_drain=true` to skip) |
| GET | `/control/status` | Output of `status.sh` |

### Safety model (four layers)

1. **No shell strings ever** — every script call uses `execFile` with an
   argv array; a node name can't be interpreted as a shell command.
2. **Hardcoded allowlist** — only the six known node names are accepted.
3. **Shutdown is opt-in per node**, blocked by default for:
   - `sadida` — k3s control-plane + Ollama/GPU host + the Proxmox hypervisor
     itself (wake enabled, shutdown not).
   - `ocra` — runs Prometheus/Grafana/the Control API itself; shutting it
     off from its own dashboard would kill the dashboard mid-request.
   - `aery` — Nextcloud + storage other nodes mount.

   Each override requires deliberately setting
   `CONTROL_API_ALLOW_SHUTDOWN_<NODE>=true`.
4. **Bearer token** on every control endpoint, constant-time compared, on
   top of the service only being reachable over Tailscale. The token lives
   in the Grafana **datasource** config, not the dashboard JSON — stays
   server-side, never reaches the browser.

### Sadida specifically — added 2026-08, highest blast radius

If Sadida doesn't come back from a poweroff, you lose the k3s API/scheduler
*and* the GPU *and* the hypervisor itself, until someone physically presses
the power button. Wake is enabled and considered safe to try (worst case: it
just doesn't respond, no data loss). **Shutdown stays blocked** until
`CONTROL_API_ALLOW_SHUTDOWN_SADIDA=true` is deliberately set — and that
should only happen *after* a real poweroff→WOL→rejoin-k3s test succeeds,
which has **not been done yet** (unlike Aery/Sacro below, whose WOL behavior
is fully characterized). Sadida also has no `seth` user (Proxmox's only
account is `root`), so the Control API's SSH key is authorized on `root`
directly — `sudo` needs no password for root via PAM.

## Idle auto-shutdown

A daemon (`monitoring/idle-shutdown/`) watches per-node rx+tx traffic and
calls the Control API's shutdown endpoint once a node has been idle past a
configurable timeout.

Safety layers (this one acts with no human in the loop, so it's stricter
than the button-driven Control API path):
1. **Dry-run by default** (`IDLE_SHUTDOWN_DRY_RUN=true`) — only logs/exposes
   a metric, never actually powers anything off until explicitly disabled.
2. **Explicit per-node opt-in list** (`IDLE_SHUTDOWN_NODES`), independent of
   the Control API's own allowlist.
3. **Idleness must hold across the WHOLE timeout window**, not as an
   average — a brief real burst of traffic isn't smoothed away.
4. **No data ⇒ leave it alone** — a node Prometheus has no data for (already
   off, or genuinely unreachable) is never treated as "idle."
5. Reuses the Control API's own shutdown path — no new SSH/WOL surface.

**Before enabling Aery specifically:** its shutdown is blocked by default;
lifting the block (`CONTROL_API_ALLOW_SHUTDOWN_AERY=true`) must happen only
*after* verifying WOL actually wakes it back up — which, per
[[Nodes and Network]], is now confirmed fixed and working.

## Wake-on-demand (the mirror direction)

Two daemons, because Aery and the k3s workers have genuinely different
"someone wants this node" signals.

### wake-proxy — Aery / Nextcloud

A reverse proxy on Ocra, listening on `:8093`. Point Nextcloud clients at
Ocra instead of Aery directly. Per request: a raw TCP connect check against
Aery; if up, proxy straight through; if not, fire a rate-limited wake call
at the Control API and serve a small auto-refreshing "waking up" holding
page — no request is ever held open for the full boot duration.

**Why the outbound Host header is rewritten** to the backend's own raw
Tailscale `TARGET_HOST:TARGET_PORT` (`100.98.226.8:8080`, never a MagicDNS
or Funnel hostname): Nextcloud checks the `Host` header against its own
`trusted_domains` allowlist. Rewriting it to the hostname/IP Nextcloud
already trusts means zero Nextcloud-side config change is needed just to
put this proxy in front of it. See
`monitoring/wake-proxy/wake-proxy.js` line ~157 for the exact rewrite.

| Endpoint | Port | Purpose |
| --- | --- | --- |
| `/*` | 8093 | Public entry point |
| `:8094/health` | 8094 | Liveness |
| `:8094/status` | 8094 | Reachability check, wake cooldown, counters |
| `:8094/metrics` | 8094 | Prometheus counters |

### k3s-autowake — Sram / Xelor / Sacro

No single HTTP endpoint means "someone wants a k3s worker," so this polls
the Kubernetes API for Pods stuck `Pending` with
`PodScheduled: False, reason: Unschedulable` — the scheduler already tried
and failed to fit them. When that happens and at least one managed node is
not `Ready`, it wakes one (simplest useful behavior for 2–3 on-demand
workers; doesn't compute which pod fits where).

Config: `K3S_AUTOWAKE_NODES` (default `sram,xelor,sacro`), check interval
30s, wake cooldown 180s (long enough to cover a full boot + k3s join).

### Why waking has a lighter safety model than shutdown

Waking a node is not destructive — worst case it wakes something that turns
out not to be needed, costing electricity, never data loss or an unexpected
outage. Both daemons still cooldown per node purely to avoid hammering the
Control API/WOL during a boot that's already in progress.

## Related

- [[Nodes and Network]] — per-node WOL hardware quirks
- [[Monitoring Stack]]
- [[Public Access - Edge]] — wake-proxy is reused as-is for public Nextcloud
  access, no changes needed on that side
