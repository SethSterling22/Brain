---
title: Rebeca — Assistant Core
tags: [rebeca, assistant-core, backend]
updated: 2026-09-27
---

# Rebeca — Assistant Core

The `assistant-core` service (Node.js ESM + Fastify) is Rebeca's brain. Related:
[[Rebeca - Architecture]] · [[Rebeca - Model Routing]] · [[Rebeca - Tools & Capabilities]].

## Source files (`assistant-core/src/`)

- **`config.js`** — central config from env. Assistant name, system prompt (with PR
  timezone + planning/anti-duplication rules), Anthropic + Ollama settings, tool
  backends (Hermes, n8n webhook base, SearXNG), RAG (Qdrant/embeddings/brain),
  voice host lists, auth (Google OAuth, internal token, watch token), Prometheus,
  model routing (hosts + toggle).
- **`index.js`** — Fastify app + routes + the auth gate.
- **`agent.js`** — the tool-calling loop (below).
- **`llm.js`** — LLM adapter with a target chain + failover (see [[Rebeca - Model Routing]]).
- **`router.js`** — task classifier, routing table, `listModels`, `overrideChain`.
- **`tools.js`** — tool registry: loads the manifest, dispatches by endpoint type,
  builtins (`search_brain_semantic`, `web_search`, `query_metrics`, `create_plan`).
- **`memory.js` / `db.js`** — Postgres-backed conversation memory (in-memory fallback).
- **`rag.js`** — embeddings + Qdrant (index/search the brain).
- **`websearch.js`** — SearXNG client. **`metrics.js`** — Prometheus client.
- **`auth.js`** — Google OAuth helpers.
- **`public/`** — the dashboard (`index.html`), the watch UI (`watch.html`), `favicon.svg`.

## The agent loop (`agent.js`)

1. Store the user message; auto-name the session from the first message.
2. Load prior context from Postgres.
3. Decide the model: a **manual override** (dropdown) forces one model; otherwise
   the **router** classifies the turn and builds a failover chain.
4. Build the system prompt + inject the **current date/time** (PR) so relative dates
   resolve correctly.
5. Loop up to **`maxAgentSteps` (8)**: call the model → if tool calls, dispatch each
   and feed results back → else final answer.
6. Emit SSE events (`route`, `model`, `tool_call`, `tool_result`, `text`, `done`).

## HTTP API (key routes)

| Route | Purpose |
|---|---|
| `GET /health` | liveness + db + tool count + llm |
| `GET /tools` | the capability manifest (dashboard panel) |
| `POST /tools/invoke` | run a tool by name (task widget, command palette) |
| `GET /models` | available models across hosts (manual dropdown) |
| `POST /chat`, `POST /chat/stream` | chat (accepts optional `model` override) |
| `GET /chat/history`, `/chat/sessions`, `POST /chat/session/rename` | sessions |
| `GET /widgets/calendar`, `/widgets/brain-graph`, `/widgets/homelab` | dashboard widgets |
| `POST /voice/transcribe`, `/voice/speak` | STT/TTS proxy with host failover |
| `POST /brain/reindex`, `/brain/index-note` | RAG indexing |
| `GET /auth/login|callback|logout|me`, `GET /watch` | auth + watch page |

## Auth gate order (`onRequest`)

`/health` and `/auth/*` are open → **internal token** (n8n) → **watch token**
(scoped to watch endpoints) → **Google session cookie** (allowlisted email) →
else redirect/401. Details in [[Rebeca - Channels, Access & Security]].

## Memory

- Postgres tables `chat_session`, `chat_message`. Per-channel sessions.
- Startup migration retries with backoff (survives cold boots / power outages).
- Dashboard restores history on reload; conversation switcher lists by date.
