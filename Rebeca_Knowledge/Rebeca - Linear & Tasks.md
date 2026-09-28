---
title: Rebeca — Linear & Tasks
tags: [rebeca, linear, tasks, planning]
updated: 2026-09-27
---

# Rebeca — Linear & Tasks

Task management on **Linear** (team "Sebastian Sterling", issues `SEB-*`). Related:
[[Rebeca - Tools & Capabilities]] · [[Rebeca - Infrastructure & Ops]].

## Tools & n8n workflows

- **`create_task` / `create_event` / `list_today_events`** live in the
  `assistant tools (Rebeca)` workflow (`n8n/tools/assistant_tools.workflow.json`).
- **`list_tasks` / `list_projects` / `create_project` / `update_task` /
  `complete_task`** live in the `Linear tools` workflow
  (`n8n/tools/linear_tasks.workflow.json`).
- All Linear HTTP nodes use the **`Header Auth - Linear`** credential
  (id `9DsrffbpiAKa8uGY`, header `Authorization` = Linear API key).
- **`create_plan`** is a **builtin** in assistant-core that orchestrates
  `create_project` (optional) + `create_task` (parent) + `create_task` (children
  with `parent` = parent id).

## Key configuration in n8n (set these)

- **`LINEAR_TEAM_ID`** — your team UUID, hard-set in the `Build task` node and in the
  `Linear — create project` node.
- **`LINEAR_ASSIGNEE_ID`** — your Linear user id, in the `Build task` node, so new
  tasks are auto-assigned to you. Get it with the `Linear — whoami` mini-workflow
  (`n8n/tools/linear_whoami.workflow.json`, manual trigger → `viewer{id}`), or
  `curl … {viewer{id}}`.

## Hierarchy & projects

- `list_tasks` returns `{ projects: [ { name, tasks: [ { id, ref, title, state,
  priority, url, children:[…] } ] } ] }`. Subtasks (`parent` set) are nested under
  their parent, not duplicated. Issues with no project → "Sin proyecto".
- It fetches **all active issues** (filter `completedAt:null, canceledAt:null`), not
  just assigned — because issues are often created unassigned.
- `create_task` accepts `project` (id) and `parent` (id) → subtasks / project filing.
- `create_plan` accepts `project` (existing id) or `new_project` (name to create).

## Planning flow (with approval)

For a planning request, Rebeca (via Claude) **first shows the proposed plan** —
project + parent + subtasks — as text and **asks for approval**. Only after the user
approves does she call **`create_plan` once**. She must NOT also call `create_task`
for the same items (that duplicated tasks in an early version) nor `list_tasks` to
verify, and she ends with a confirmation. This is enforced in the system prompt +
by routing planning to Claude (see [[Rebeca - Model Routing]]).

## Dashboard task widget

- **Preview** (sidebar "Tareas"): scrollable, grouped by project (collapsible), with
  nested subtasks and a check-off to complete.
- **Expanded gestor** (⛶ button → modal): the full tree; click a task to edit
  **title / state / priority** inline (`update_task` + `complete_task`) or complete it.
- Uses `POST /tools/invoke`.

## Linear GraphQL notes

- Issue create: `issueCreate(input: IssueCreateInput!)` with `teamId`, optional
  `assigneeId`, `projectId`, `parentId`. Returns `issue { id identifier title url }`
  (the **id** is needed as `parentId` for subtasks).
- Project create: `projectCreate(input:{ name, description, teamIds:[teamId] })`.
- State change: states are **per-team**; `complete_task` queries the issue's team
  states and resolves the target `stateId` by name (default "Done"/type completed).
