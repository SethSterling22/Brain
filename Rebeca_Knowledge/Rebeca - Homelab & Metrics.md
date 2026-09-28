---
title: Rebeca — Homelab & Metrics
tags: [rebeca, homelab, prometheus, metrics]
updated: 2026-09-27
---

# Rebeca — Homelab & Metrics

Rebeca reads live homelab metrics from **Prometheus** (direct PromQL) for the
dashboard widget and for decision-making. Related: [[Rebeca - Tools & Capabilities]]
· [[Rebeca - Infrastructure & Ops]].

## Sources

- **Prometheus**: container `homelab_prometheus` at `http://ocra:9090` (env
  `PROMETHEUS_URL`).
- **node_exporter** (CPU/RAM/disk) + recording rules `node:cpu_utilization:ratio`,
  `node:memory_utilization:ratio`.
- **nvidia_gpu_exporter** (`nvidia_smi_*` metrics) — NOT DCGM.

## Homelab widget (`GET /widgets/homelab`)

Two halves:
- **Servicios** (left): up/down + count, from health checks of assistant-core,
  Hermes, n8n, Qdrant, SearXNG, Ollama (sadida/omarchy), Whisper, Piper.
- **Recursos** (right, scrollable): per-node bars (CPU / RAM / Disk / GPU / VRAM),
  red at ≥85%.

## Default metric panels (`metrics.js`)

| Panel | PromQL |
|---|---|
| CPU | `node:cpu_utilization:ratio * 100` |
| RAM | `node:memory_utilization:ratio * 100` |
| Disk / | `100 * (1 - node_filesystem_avail_bytes{mountpoint="/",fstype!~"tmpfs|overlay|squashfs"} / node_filesystem_size_bytes{...})` |
| GPU util | `nvidia_smi_utilization_gpu_ratio * 100` |
| VRAM | `100 * nvidia_smi_memory_used_bytes / nvidia_smi_memory_total_bytes` |

Series are labelled by the `node` label (falls back to instance host / GPU name).
Override the panels with the `METRICS_PANELS` env (JSON array of `{label,query,unit}`).

## `query_metrics` tool

A builtin that runs an arbitrary PromQL expression so Rebeca can reason over metrics
("is the GPU free?", "how full is Ocra's disk?", "which node is under load?").
Returns matching series with labels and values.

## Notes

- assistant-core lives in the Tailscale netns; it reaches Prometheus via the
  MagicDNS name `ocra` (host publishes 9090). If unreachable, use the FQDN
  `ocra.stegosaurus-panga.ts.net:9090`.
- GPU panels only show for the host running `nvidia_gpu_exporter`.
- Other homelab exporters present: `homelab_shelly_exporter` (8091),
  `nut_exporter` (9199, UPS), plus `homelab_control_api`, `wake_proxy`,
  `k3s_autowake`, `idle_shutdown`, Caddy edge, ddclient.
