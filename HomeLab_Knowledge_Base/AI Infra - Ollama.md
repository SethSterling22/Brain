---
tags: [homelab, ai, ollama]
---

# AI Infra — Ollama

Part of [[Homelab MOC]].

> **Ownership note:** this note describes the *infrastructure* boundary only
> (Ollama as a host service, GPU passthrough). The automation logic that
> calls it — n8n workflows, the Hermes gateway, intent classification — lives
> in `Productivity_Tools/`, a separate repo/agent. Do not conflate the two;
> see [[Homelab MOC]]'s ownership section.

## The split

- **Ollama runs locally on Sadida** — the only GPU node (RTX 3050, passed
  through via VT-d, see `docs/proxmox-gpu-passthrough.md`). Installed as a
  local host service, not containerized, listening on port `11434`.
- **Ocra is the 24/7 "brain"** — a Docker Compose stack (n8n + Hermes gateway
  + PostgreSQL + a Tailscale sidecar) that talks to Ollama over Tailscale.

Models pulled today: `qwen3:1.7b` and `qwen3.5:4b`, via
`scripts/ai/pull-models.sh`.

## Request flow

```
Telegram → n8n (Ocra) → Hermes gateway (Ocra :8080) → classify intent via Ollama (qwen3:1.7b)
                                                      → route to either:
                                                          - Ollama again (qwen3.5:4b) for a full response, or
                                                          - the Claude API
```

Hermes decides per-request whether the local model is sufficient or the
request should go to the Claude API instead.

## In-cluster access

Workloads running *inside* k3s reach Ollama through an `ExternalName`
Kubernetes Service rather than talking to Sadida directly:

```
k3s/manifests/ai/ollama.yaml → ollama.ai.svc.cluster.local:11434 → Sadida (Tailscale)
```

`k3s/manifests/ai/apps.yaml` deploys an optional chat web UI (**OpenClaw**)
against that same Service, at `/openclaw`.

## Why this split, not Ollama-in-k3s

Sadida is the only GPU host, and its GPU is used via host-level passthrough,
not a Kubernetes device plugin — running Ollama as a plain host service was
simpler than wiring GPU scheduling into k3s for a single-node use case.
Ocra, meanwhile, needs to be reachable 24/7 regardless of whether the k3s
cluster or Sadida itself is mid-restart, which is the same "always-on brain"
reasoning documented in [[Monitoring Stack]] for why the monitoring server
also lives on Ocra rather than in k3s.

## Related

- [[Nodes and Network]]
- [[k3s Cluster]]
- [[Node Power Control]] — Sadida's wake/shutdown safety rules matter a lot
  here: it's simultaneously the Proxmox hypervisor, the k3s control-plane,
  *and* the GPU host, so getting its wake-on-LAN wrong is unusually costly.
