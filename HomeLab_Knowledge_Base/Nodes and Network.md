---
tags: [homelab, network, infrastructure]
---

# Nodes and Network

Part of [[Homelab MOC]].

## The six nodes

| Node | OS | Role | Always on? |
| --- | --- | --- | --- |
| **Sadida** | Proxmox VE 8 (Debian 13 Trixie kernel) | Hypervisor · k3s control-plane · **Ollama** (local host service, GPU RTX 3050) | Yes |
| **Aery** | Debian 13 Trixie (bare metal) | **Nextcloud** · file storage / NFS · backup; also a k3s worker | Yes |
| **Sram** | Debian 13 Trixie (bare metal) | k3s worker · dev environments (no GPU) | Yes |
| **Ocra** | Debian 13 Trixie (bare metal) | **24/7 automation brain** — Docker Compose: n8n + Hermes gateway + PostgreSQL + Tailscale; also the monitoring server and the public edge proxy; also a k3s worker | Yes |
| **Xelor** | Debian 13 Trixie (bare metal) | k3s worker, on-demand · staging/CI | No (WOL) |
| **Sacro** | Debian 13 Trixie (bare metal) | k3s worker, on-demand · observability | No (WOL, via suspend — see below) |

Aery was originally a Synology DSM NAS; it was rebuilt into plain Debian
running Nextcloud, which is why it now takes the same tooling
(`node_exporter`, Ansible playbooks) as every other node instead of a
special-cased SNMP path.

## Addressing

Two address families are in play, and mixing them up is the single most
common source of confusion when wiring a new service to a node:

| Node | LAN IP | Tailscale IP | Notes |
| --- | --- | --- | --- |
| Sadida | `192.168.68.10` | `100.123.206.35` | |
| Aery | `192.168.68.190` | `100.98.226.8` | |
| Sram | `192.168.68.108` | `100.87.145.104` | |
| Ocra | *(drifts — was seen at .100 → .103)* | `100.107.52.17` | The only WiFi-connected node; LAN IP is not stable, so everything addresses it by Tailscale IP instead |
| Xelor | `192.168.68.114` | `100.92.255.18` | On-demand |
| Sacro | `192.168.68.115` | `100.127.196.32` | On-demand |

**Convention used throughout the repo: address backends by raw Tailscale IP,
never LAN IP and never MagicDNS hostname**, for two concrete reasons hit in
practice: LAN IPs drift (Ocra's did), and MagicDNS has been observed
resolving incorrectly *specifically from Ocra* (a hostname briefly fell
through to an unrelated public anycast IP instead of failing loudly). Every
`.env.example`, Ansible inventory, and the `edge/Caddyfile` all repeat this
same reasoning verbatim — it's a deliberate, load-bearing convention, not an
oversight.

MagicDNS names do exist and work fine everywhere else (e.g.
`sadida.stegosaurus-panga.ts.net`) — `stegosaurus-panga` is the tailnet name.
They're used freely in documentation/URLs a human types, just not hardcoded
into configs that matter operationally.

## Wake-on-LAN mechanics

Magic packets are Layer 2 broadcasts — they only travel over Ethernet within
the same broadcast domain (same switch). This is why:
- Every WOL target must be on Ethernet, not WiFi.
- **Ocra is not a WOL target at all** — it's the one WiFi-connected node, so
  it's structurally excluded. Its Tailscale IP is used only for
  ping-liveness checks, never for a magic packet.
- Sadida (the box sending the packets) must be on the same switch as every
  target.

Per-node WOL quirks, each a real hardware/driver issue that was diagnosed and
either fixed or permanently worked around:

- **Aery** originally couldn't wake from poweroff *or* suspend. Root cause:
  the mainline `alx` driver for its Qualcomm Atheros QCA8171 NIC never
  implemented WOL upstream. Fixed with a DKMS patch
  ([AndiWeiss/alx-wol](https://github.com/AndiWeiss/alx-wol)) — confirmed
  working from both suspend (8s to wake) and full poweroff (42s to wake),
  rejoining k3s automatically each time.
- **Sacro** wakes fine from *suspend* (`Wake-on: g` already active, correct
  driver) but **never** from a full poweroff/hibernate — its InsydeH20 BIOS
  simply doesn't route standby power to the NIC in that state. This is a
  hardware limitation with no driver fix, so `shutdown.sh` permanently uses
  `systemctl suspend` for Sacro instead of `shutdown -h now`.
- **Sadida** WOL is wired into the scripts (MAC `08:8f:c3:59:e9:9d`) and wake
  is enabled from the dashboard, but a full poweroff→WOL round-trip has
  **never been tested** — treat it as unverified until someone deliberately
  runs the test described in [[Node Power Control]].

## Home network topology — double NAT

This matters for anything in [[Public Access - Edge]]. The home network has
**two NAT layers** in series:

```
Internet
   │
   ▼
ISP gateway (DZS ONT/router, PPPoE — interface eth0.v203.ppp)
   │  port-forwards → 192.168.1.10
   ▼
Deco M5 mesh router (creates the real LAN)
   │  port-forwards → 192.168.68.107 (Ocra)
   ▼
192.168.68.0/24  ← the LAN table above, and the k3s subnet
```

The ISP-provided gateway is a **DZS** device — these are typically
white-labeled/ISP-customized firmware with no useful public manual; treat its
admin UI as ground truth over any generic documentation. Both NAT layers need
a matching port-forward rule for any port you want reachable from the public
internet; see [[Public Access - Edge]] for the specific rules in place and
the debugging journey that confirmed this chain works end-to-end.

## Related

- [[k3s Cluster]]
- [[Node Power Control]]
- [[Public Access - Edge]]
