---
title: Rebeca — Model Routing
tags: [rebeca, llm, routing, ollama]
updated: 2026-09-27
---

# Rebeca — Model Routing

Task-specialized routing across LLM hosts, with Claude as last resort. Related:
[[Rebeca - Assistant Core]] · [[Rebeca - Infrastructure & Ops]].

## Hosts

| Host | GPU / VRAM | Availability | Role |
|---|---|---|---|
| **Sadida** | RTX 3050 Mobile, 4 GB | always on | fast / default light tier (one model at a time) |
| **omarchy** | ~8 GB | when the desktop is on | strong tier (reasoning, coding) |
| **Claude** | cloud (`claude-sonnet-5`) | always | last resort for the hardest / planning |

Ollama swaps models in/out of VRAM on demand, so each host holds one active model at
a time. Sadida has light versions of each specialist; omarchy the strong versions.
The router prefers omarchy and falls back to Sadida, then Claude.

## Category → chain (default table, in `router.js`)

| Category | Chain (failover order) |
|---|---|
| **trivial** (greetings) | `sadida/qwen3:1.7b` → `sadida/qwen3.5:4b` → Claude |
| **general** (default + tools) | `sadida/qwen3.5:4b` → Claude |
| **reasoning** (math/logic) | `omarchy/deepseek-r1:8b` → `sadida/deepseek-r1:1.5b` → Claude |
| **coding** | `omarchy/qwen2.5-coder:7b` → `sadida/qwen2.5-coder:3b` → Claude |
| **complex / planning** | Claude → `sadida/qwen3.5:4b` |

- Planning ("planificar/desglosa/hoja de ruta…") is classified as **complex → Claude**
  so plans are clean and confirmed. See [[Rebeca - Linear & Tasks]].
- Classification is cheap heuristics (keywords + length). No extra latency.

## Installed models

- **Sadida (4 GB):** `qwen3:1.7b`, `qwen3.5:4b`, `deepseek-r1:1.5b`,
  `qwen2.5-coder:3b`, `nomic-embed-text` (embeddings — do NOT delete).
- **omarchy (8 GB):** `deepseek-r1:8b`, `qwen2.5-coder:7b` (+ optional `qwen3:8b`).
- Note: `qwen3-coder` on Ollama only ships 30B/480B (too big); use the dense
  `qwen2.5-coder` series for small coders.

## Failover mechanics (`llm.js`)

`runModel({..., chain})` tries each target in order. Ollama hosts are **health-gated**
(`GET /api/tags`, 1.5 s) so a powered-off omarchy is skipped fast; on any error it
falls to the next target. Without a chain it keeps the legacy "Claude primary,
Ollama fallback".

## Manual model selector (dashboard)

- A combined control in the header: it is both the **selector** and the **last-used
  indicator**. In `auto · router` it shows what the router picked (`auto · model @host`).
- `GET /models` auto-discovers models per host (`/api/tags`) + Claude; unavailable
  ones are greyed. New models a host pulls appear automatically.
- Choosing a model forces it with **no fallback** (to test that model). Persisted in
  `localStorage`; reverts to auto if the forced model becomes unavailable.

## Config / tuning (env)

- `MODEL_ROUTING=on|off` · `OLLAMA_SADIDA_URL` · `OLLAMA_OMARCHY_URL`
- `MODEL_ROUTES` — JSON to override the table
- `ASSISTANT_MODEL` — the Claude model (currently `claude-sonnet-5`)
- `MAX_AGENT_STEPS` (default 8)

## Common issue

If requests always go to Sadida even with omarchy on: omarchy's Ollama is bound to
`127.0.0.1`. Fix on omarchy: `OLLAMA_HOST=0.0.0.0:11434` + open port 11434 on
`tailscale0`. See [[Rebeca - Infrastructure & Ops]].
