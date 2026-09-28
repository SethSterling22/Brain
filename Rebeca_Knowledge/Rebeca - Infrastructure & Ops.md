---
title: Rebeca — Infrastructure & Ops
tags: [rebeca, infra, docker, runbook]
updated: 2026-09-27
---

# Rebeca — Infrastructure & Ops

Hosts, deployment and the runbook of issues we've hit. Related:
[[Rebeca - Architecture]] · [[Rebeca - Model Routing]] · [[Rebeca - Homelab & Metrics]].

## Hosts

- **Ocra** — always-on host running the Docker Compose stack (assistant-core, n8n,
  Hermes, Postgres, Qdrant, SearXNG, Tailscale sidecar). Also runs the homelab
  monitoring stack (Prometheus, Grafana, exporters, Caddy edge). Tailnet name of the
  stack sidecar: `ocra-n8n` (the physical host is `ocra`).
- **Sadida** — laptop, RTX 3050 Mobile 4 GB, i5-12500H, 31 GB RAM. Always-on GPU:
  Ollama (light models + embeddings), Whisper/Piper fallback.
- **omarchy** — desktop, ~8 GB VRAM. Strong Ollama models + preferred Whisper/Piper,
  when powered on. Tailnet `omarchy.stegosaurus-panga.ts.net` (100.72.211.80).
- Other homelab nodes seen in metrics: sacro, aery, etc.

## Repos & deployment

- Main repo: `Productivity_Tools` (GitHub `SethSterling22/Productivity_Tools`).
- The Cowork working copy is on a workstation; **push from there** → `git pull` on
  Ocra. (Ocra's deploy checkout is `~/Productivity_Tools`, not `~/Projects/...`.)
- Rebuild assistant-core (code/frontend changes):
  ```bash
  cd ~/Productivity_Tools/n8n && git pull
  sudo docker compose up -d --build --no-deps assistant-core
  ```
- Manifest-only changes hot-reload (bind-mounted) after `git pull` — no rebuild.
- n8n workflow changes: import/update the JSON in n8n and **activate**.

## Networking model

- assistant-core, n8n, Hermes use `network_mode: service:tailscale` → they share the
  Tailscale container's netns and talk over `localhost`.
- Postgres/Qdrant/SearXNG on `n8n_network`, resolved by Docker DNS.
- Ollama/Whisper/Piper reached by Tailscale MagicDNS.

## Runbook — issues we hit & fixes

- **502 on the dashboard after a power outage** → assistant-core couldn't reach
  Postgres/Hermes because the shared netns desynced (containers pointed at the *old*
  tailscale container id after `restart: always` reordered them on boot).
  **Fix:** `sudo docker compose up -d --force-recreate --no-deps hermes-gateway assistant-core n8n`
  (re-attaches them to the live tailscale netns).
- **DB migration `EAI_AGAIN postgres` on cold boot** → assistant-core started before
  Postgres. **Fixed** by widening the migration retry/backoff (self-heals). Manual
  option: recreate assistant-core once Postgres is healthy.
- **Requests always go to Sadida even with omarchy on** / `ollama:omarchy` shows red →
  omarchy's Ollama bound to `127.0.0.1`. **Fix on omarchy:**
  `OLLAMA_HOST=0.0.0.0:11434` (systemd override) + `ufw allow in on tailscale0 to any port 11434`.
- **Watch funnel dropped after outage** → re-run
  `tailscale funnel --bg --https=10000 http://127.0.0.1:4000`.
- **Container DNS `ENOTFOUND`** (older) → Tailscale "Override DNS servers" was on;
  turn it off / `tailscale set --accept-dns`.
- **n8n `$env` blocked** → use a **Header Auth credential** on HTTP nodes instead of
  `{{ $env.* }}`.
- **Telegram "can't parse entities"** → send with Parse Mode = None / de-Markdown.

## Open / optional hardening

- A **systemd oneshot at boot** running `docker compose up -d` so the netns self-heals
  after outages (avoids the manual `--force-recreate`).
- Decide whether "general" chat should prefer Claude vs local (tune the routing table).
- Citations rule + tool-retry-on-error in the agent loop (from the Sep-2026 review).
