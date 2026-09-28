---
tags: [homelab, monitoring, prometheus, grafana]
---

# Monitoring Stack

Part of [[Homelab MOC]]. Covers Prometheus + Grafana + Control API. Power
specifics live in [[Power Monitoring]]; wake/shutdown logic lives in
[[Node Power Control]].

## Why it lives on Ocra, in Docker Compose, not in k3s

Ocra is always on. If Prometheus/Grafana lived inside k3s and the node
serving them went to sleep, the dashboard — and the WOL "wake" button inside
it — would be unavailable exactly when needed to wake something. Deployed via
plain Docker Compose on Ocra instead, independent of the k3s cluster's own
health.

## What the dashboard shows

One Grafana dashboard (**HomeLab — Nodes, Power & Control**), one page:

- **Status** — online/offline per node (on-demand nodes correctly read
  offline while asleep).
- **Resources** — CPU, memory, temperature, availability over time
  (`node_exporter`).
- **Processes** — top CPU/memory consumers per node (`process-exporter`).
- **GPU** — real watts, utilization, temp, memory on Sadida's RTX 3050
  (`nvidia_gpu_exporter`) — the one *measured*, non-modelled power number.
- **Energy** — modelled watts/kWh/USD cost per node, editable tariff.
- **Grid power** — real measured watts for the whole fleet (Shelly plug),
  compared live against the model, plus outage detection.
- **UPS** — battery charge/load/on-line status (CyberPower, via NUT).
- **Control** — wake/shutdown buttons wired to the Control API.
- **Idle auto-shutdown** — live mode + per-node idle state table.

The electricity rate is a **Grafana textbox variable**
(`$rate_usd_kwh`, default `0.24`) — every cost panel recalculates instantly
when it changes. Deliberate: Puerto Rico rates move often.

## Architecture

```
                     ┌─────────────────── Ocra (24/7) ───────────────────┐
   scrapes  ┌──────► │  Prometheus → recording rules (watts/kWh/cost)     │
            │        │      └──► Grafana ──(Button Panel)──► Control API │
 each node  │        └───────────────────▲───────────────────▲──────────┘
 exporters ─┤                            │ scrapes            │ scrapes
   ┌────────┴───────────────┐   ┌────────┴────────┐   ┌───────┴──────────┐
   │ node_exporter +         │   │ shelly-exporter  │   │ nut-exporter      │
   │ process-exporter (all)  │   │ (Ocra) ← Shelly  │   │ (Ocra) ← upsd     │
   │ nvidia GPU exp (Sadida) │   │ plug             │   │ (Aery) :3493      │
   └──────────────────────────┘   └──────────────────┘   └────────────────────┘
```

## Phased roadmap (all shipped except Phase 5)

| Phase | Deliverable | Status |
| --- | --- | --- |
| 0 | Prometheus + Grafana on Ocra, `node_exporter` everywhere, base dashboard, first-pass power model | ✅ |
| 1 | Control API wrapping `scripts/wol/*` + Grafana buttons | ✅ |
| 2 | `process-exporter` + `nvidia_gpu_exporter` on Sadida | ✅ |
| 3 | Real fleet-wide measurement — Shelly plug, outage detection | ✅ |
| 4 | UPS battery visibility — CyberPower via NUT | ✅ |
| 5 | Refined power model (factor in disk/network I/O) + efficiency dashboard | Open |

A cancelled phase: Synology SNMP support for Aery — no longer needed since
Aery was rebuilt from Synology DSM to plain Debian.

## Known gaps

- **Request counts not wired yet.** Traffic into the automation stack
  (Telegram → n8n → Hermes) lives in `Productivity_Tools/`, a separate
  repo/agent. Scrape jobs for Hermes `/metrics` and n8n's `N8N_METRICS=true`
  are already written and commented out in `prometheus.yml`, waiting on that
  side to expose them.
- **Control button panel indirection.** The wake/shutdown buttons use the
  Business Forms panel submitting to a static datasource-proxy URL (its REST
  API mode doesn't support `${payload.x}` template substitution in the URL
  field). If buttons stop submitting after a plugin upgrade, check
  `getPayload` and that URL first.

## Verify it's healthy

```bash
sudo docker compose ps
curl -s localhost:9090/-/healthy                            # Prometheus
curl -s localhost:8090/health                                # Control API
curl -s localhost:9090/api/v1/targets | grep -o '"job":"[^"]*"' | sort -u
```
Expected jobs: `nodes`, `process-exporter`, `nvidia-gpu-exporter`,
`control-api`, `prometheus`, `shelly-power`, `nut-ups`, `idle-shutdown`,
`wake-proxy`, `k3s-autowake`.

Grafana: `http://ocra.stegosaurus-panga.ts.net:3000` → folder **HomeLab** →
dashboard **HomeLab — Nodes, Power & Control**.

## Related

- [[Power Monitoring]]
- [[Node Power Control]]
- [[Nodes and Network]]
