---
title: Rebeca — Overview
tags: [rebeca, moc, assistant, homelab]
updated: 2026-09-27
---

# Rebeca — Overview (MOC)

**Rebeca** is Sebastian Sterling's self-hosted, local-first, multi-channel personal
assistant, built on top of an existing **n8n + Hermes gateway + Ollama** stack and
focused on the **homelab and personal productivity** (not work/Expert Radiology).

She runs an LLM tool-calling loop, keeps conversation memory, streams chat, does
voice (STT/TTS), answers grounded in a git-backed **second brain** (RAG) and the
**live web**, and manages tasks in **Linear**. She is reachable from a **web
dashboard**, a **Galaxy Watch**, and **Telegram**.

## Map of content

- [[Rebeca - Architecture]] — components, how they talk, diagrams
- [[Rebeca - Assistant Core]] — the brain service (agent loop, endpoints, memory)
- [[Rebeca - Model Routing]] — task-specialized routing across LLM hosts + manual selector
- [[Rebeca - Tools & Capabilities]] — the tool manifest and every capability
- [[Rebeca - Linear & Tasks]] — tasks, projects, subtasks, planning
- [[Rebeca - Homelab & Metrics]] — Prometheus metrics + homelab widget
- [[Rebeca - Voice & Watch]] — Whisper/Piper + the circular watch UI
- [[Rebeca - Channels, Access & Security]] — dashboard/watch/Telegram, Tailscale, auth
- [[Rebeca - Infrastructure & Ops]] — hosts, Docker, deploy, runbook

## One-line summary of the stack

```
Dashboard (tailnet) ─┐
Galaxy Watch (funnel) ├─► assistant-core (Rebeca) ─► LLM (Claude / Ollama)
Telegram (funnel→n8n)─┘        tools: builtin · Hermes (brain) · n8n (Linear, Calendar)
Knowledge: second brain (git) → embeddings (Ollama) → Qdrant (RAG)
Web: web_search → self-hosted SearXNG
Metrics: query_metrics → Prometheus
```

## Key facts

- **Primary LLM:** Claude (**`claude-sonnet-5`**), with local **Ollama** models as
  task-specialized alternatives and fallback. See [[Rebeca - Model Routing]].
- **Assistant name:** Rebeca. Timezone: America/Puerto_Rico (UTC-04:00).
- **Language:** replies in Spanish; code/files in English.
- **Ownership boundary:** Sebastian owns the automation/assistant layer; the
  infrastructure (Proxmox, k3s, Tailscale admin, GPU provisioning) is separate.
