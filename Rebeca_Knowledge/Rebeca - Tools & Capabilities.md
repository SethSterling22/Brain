---
title: Rebeca — Tools & Capabilities
tags: [rebeca, tools, manifest]
updated: 2026-09-27
---

# Rebeca — Tools & Capabilities

Everything Rebeca can do is a **tool descriptor** in
`assistant-core/tools.manifest.json` (bind-mounted + hot-reloaded). Related:
[[Rebeca - Assistant Core]] · [[Rebeca - Linear & Tasks]] ·
[[Rebeca - Homelab & Metrics]].

## Endpoint types

- **`builtin`** — in-process JS in `tools.js` (`BUILTINS`). Needs a rebuild.
- **`hermes_tool`** — `POST HERMES_URL/tool/<name>` (brain, fs, shell).
- **`n8n_webhook`** — `POST N8N_WEBHOOK_BASE/tool/<name>` (external integrations).
- **`http`** — any URL.

## Current tools (by category)

### Linear — see [[Rebeca - Linear & Tasks]]
- **create_task** (n8n) — create an issue; optional `project` + `parent` (subtask).
- **create_plan** (builtin) — parent task + subtasks in one step; optional `project`
  (existing id) or `new_project` (creates it).
- **create_project** (n8n) — create a Linear project.
- **list_tasks** (n8n) — all active issues grouped by project, subtasks nested.
- **list_projects** (n8n) — active projects.
- **update_task** (n8n) — title/description/priority/due/project/parent.
- **complete_task** (n8n) — change state (resolves per-team stateId by name).

### Calendario
- **create_event** (n8n) — Google Calendar event (ISO 8601, -04:00).
- **list_today_events** (n8n) — upcoming events (now → +7 days).

### Notas / Brain
- **save_note** (Hermes) — write a note to the git-backed vault; auto-indexes to Qdrant.
- **search_brain** (Hermes) — browse the folder/note tree.
- **search_brain_semantic** (builtin) — RAG search grounded in the notes.

### Web
- **web_search** (builtin) — SearXNG metasearch (weather, news, current facts).

### Homelab
- **query_metrics** (builtin) — run PromQL against Prometheus.

## Descriptor shape

```jsonc
{
  "name": "create_task",
  "description": "What/when to use it — drives tool choice.",
  "input_schema": { "type": "object", "properties": { ... }, "required": [...] },
  "endpoint": { "type": "n8n_webhook", "path": "/tool/create_task" },
  "channels": ["dashboard", "telegram"],
  "category": "Linear",
  "icon": "check-square"
}
```

`category` groups them in the dashboard's Capabilities panel; clicking a chip
inserts `/toolname` into the chat input.

## Adding a tool

1. Build the backend: an n8n Webhook sub-workflow, a Hermes tool, or a builtin in
   `tools.js`.
2. Add the descriptor to the manifest (+ `category`).
3. `git pull` → assistant-core hot-reloads the manifest (rebuild only for builtins/code).

Invoked directly by the dashboard via `POST /tools/invoke` (task widget, command
palette). Command palette = Ctrl-K.
