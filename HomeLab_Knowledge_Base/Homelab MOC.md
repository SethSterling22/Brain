---
tags: [homelab, moc]
aliases: [HomeLab Architecture, Homelab Index]
---

# HomeLab Architecture — Map of Content

Source of truth for context: this note and its links summarize the state of
Sebastian's home lab as of **2026-09-27**, distilled from the
`HomeLab_Architecture` repository and the working sessions that built it.
Written for **Rebeca** (the second-brain assistant) to have full context
without re-reading the repo from scratch.

The lab is a 6-node cluster (k3s + Proxmox + Tailscale + Wake-on-LAN) with a
local AI stack backed by a GPU, full power/cost monitoring, and a public-facing
edge proxy for exposing selected services to the internet.

## Notes in this vault

- [[Nodes and Network]] — the six physical nodes, their roles, LAN/Tailscale
  addressing, and the double-NAT home network topology.
- [[k3s Cluster]] — control-plane, workers, manifests, ingress.
- [[AI Infra - Ollama]] — the local LLM stack (Ollama on Sadida, Ocra as the
  24/7 automation brain, how a Telegram message becomes a model response).
- [[Monitoring Stack]] — Prometheus + Grafana + Control API on Ocra, what it
  measures, and the phased roadmap that got it there.
- [[Power Monitoring]] — the Shelly smart plug and CyberPower UPS, real vs.
  modelled wattage, and the Prometheus counter-reset bug that inflated cost
  panels.
- [[Node Power Control]] — Wake-on-LAN, the Control API's safety model, idle
  auto-shutdown, and the two wake-on-demand daemons (wake-proxy, k3s-autowake).
- [[Public Access - Edge]] — exposing lab services to the public internet via
  No-IP + Caddy, and the full troubleshooting story behind getting TLS working
  through a double-NAT connection.
- [[Roadmap - Load Balancer]] — open, undecided item: MetalLB vs. the
  Tailscale Kubernetes Operator for a stable ingress entry point.

## Ownership boundary (important context for Rebeca)

This repository (`HomeLab_Architecture`) owns **infrastructure only**: nodes,
network, k3s, Proxmox, Tailscale, WOL, monitoring, and Ollama as a host
service. A separate stack — **n8n, the Hermes gateway, and the automation
agents (Chat/Claude/Note/Task)** — lives in `Productivity_Tools/` and is
intended to become its own repository, owned by a different agent. Anything
about workflow automation, Telegram routing logic, or agent skills belongs to
that other context, not this one.

## Snapshot — what's live right now

- 6 nodes: **Sadida** (Proxmox host, k3s control-plane, Ollama+GPU), **Aery**
  (Nextcloud, 24/7), **Ocra** (24/7 automation brain + monitoring server),
  **Sram** (24/7 k3s worker), **Xelor** and **Sacro** (on-demand k3s workers,
  Wake-on-LAN).
- Full Prometheus/Grafana monitoring with real (Shelly) and modelled power,
  UPS battery visibility, and one-click wake/shutdown from the dashboard.
- Public HTTPS access to Nextcloud (and any future service) via a No-IP
  hostname + Caddy reverse proxy running on Ocra, confirmed working end-to-end
  as of 2026-09-24.
- Open/undecided: which load-balancing approach (if any) to add in front of
  k3s services.
