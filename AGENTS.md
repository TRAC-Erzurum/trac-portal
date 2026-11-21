# AGENTS.md — trac-portal root (orchestration)

This file is for whoever orchestrates the program from the root repository. Agent docs are plain Markdown and tool-agnostic: any agent or tool may use them.

## 1. What this repo is

`TRAC-Erzurum/trac-portal` is the **root** repository. It holds issues, deployment-level configuration, and three git submodules, each its own GitHub repository.

| Path | GitHub repo | Stack | What lives there |
|------|-------------|-------|------------------|
| `trac-portal-api/` | TRAC-Erzurum/trac-portal-api | NestJS 11, TypeORM, PostgreSQL, yarn 1 | REST API under `/api`, OIDC provider at `/api/oidc`, auth, uploads |
| `trac-portal-ui/` | TRAC-Erzurum/trac-portal-ui | Vue 3, Vite, shadcn-vue (reka-ui), Tailwind, vue-i18n, Pinia, yarn 1 | Web UI served by nginx; `/api` proxied to the API |
| `mmdvm-link/` | TRAC-Erzurum/mmdvm-link | Python 3.11+, MQTT | Proof of concept: server and Pi-Star client for MMDVM link |

Root contents:
- `docker-compose.yml`: production topology for `api` and `ui` (see `docs/system/architecture.md`).
- `.env.example`: variable names and meaning (see `docs/system/configuration.md`). Never commit a real `.env`.
- `build.sh`, `update.sh`: server-side scripts that run from the deployment directory.
- `server/`: server helper scripts.
- `docs/`: human docs (Turkish) and agent-facing system and workflow docs (English).
- `.github/`: root issue and PR templates.

Issues live **only** in the root repo. PRs live in the repo where the change is.

## 2. Operating model

- **The root never contains application code.** Application changes happen inside a submodule.
- The root orchestrates: it plans work, writes task briefs, tracks issues, and bumps submodule pointers in root PRs (`chore: move submodules to ...`).
- Implementation agents work **inside one submodule**. They must find everything they need in that submodule's own `AGENTS.md` and `docs/conventions/`. They should not need the root's rules beyond the cross-repo contracts in `docs/system/contracts.md`.
- Any tool or agent may be used. Do not add tool-specific rule formats (`.cursor/`, `.github/agents/`, `.github/copilot-instructions.md`, `.idea/`, `.mdc`). The only allowed tool file is a one-line `CLAUDE.md` containing `@AGENTS.md`.
- Submodule paths are touched by implementation agents only. The root orchestrator must not stage, commit, or modify files inside submodule directories.

## 3. Workflow

Full flow, branch naming, commit style, and cross-repo order: [docs/workflow/development-flow.md](docs/workflow/development-flow.md).

Short version:
1. Issue in the root repo (use the `task` issue template for agent-workable tasks).
2. Branch `<type>/<short-slug>` in the affected submodule (or the root for root-only changes).
3. PR to the submodule `main`; review and merge.
4. Root PR bumping the submodule pointer.
5. Cross-repo features: API first, then UI, then the root bump.
6. Versions/tags `v0.x.y` trigger image builds in submodule CI. Deployment is manual, done by product owners.

Fill task briefs using [docs/workflow/task-brief-template.md](docs/workflow/task-brief-template.md).

## 4. Verify commands

"Done" means the repo's `verify` command passes. CI runs the same command.

| Repo | Command |
|------|---------|
| trac-portal-api | `yarn verify` (inside `trac-portal-api/`) |
| trac-portal-ui | `yarn verify` (inside `trac-portal-ui/`) |
| mmdvm-link | `python scripts/verify.py` (inside `mmdvm-link/`) |

The root has no application code to verify; root PRs are checked by reviewing the submodule pointer and the changed files.

## 5. Testing policy

Copied verbatim from the program rules. Every task brief must carry this policy.

> Tests are expensive; keep them to a minimum. Do not add tests by default and never add "write tests" as a routine acceptance criterion. Add a test only when it rests on a solid reason: authentication/authorization, data integrity or irreversible operations, non-trivial pure logic (parsing, date/time, state machines), or a production bug likely to recur. State that reason in one sentence in the PR description. End-to-end tests and any new test framework/infrastructure require explicit approval from the project owner. Do not write tests for trivial CRUD, getters, rendering/snapshots, or mock-heavy controller code. Existing tests stay and must pass.

Details and examples: [docs/workflow/testing-policy.md](docs/workflow/testing-policy.md).

## 6. Boundaries

For every agent, human or not:
- Never push to `main`, never force-push, never bypass branch protection or use administrative merge options.
- Never deploy. Never touch the production server.
- Never run migrations, seeds, or destructive commands against any database.
- Never read, print, or commit `.env` files or secrets. Never write secret values into code, docs, issues, PRs, or logs.
- Do not change unrelated files or dependencies. Preserve unrelated user changes.
- Stop and report when the scope must grow, when a decision is needed from the owner, or when the work cannot be completed safely.

Root-specific:
- Deployment is performed manually by product owners. Agents document it; they do not run it.
- `docker-compose.yml` and `update.sh` affect production. Changes to them require owner review before merge.
- Root PRs that bump submodule pointers must reference the submodule PR(s) they include.
- Do not commit to the root working tree while another agent is working in a submodule directory.

## 7. Recorded decisions

- **2026-11-21 — Agent docs are tool-agnostic.** `AGENTS.md` and plain Markdown are the canonical agent docs. Tool-specific rule files were removed; only a one-line `CLAUDE.md` shim (`@AGENTS.md`) is allowed.
- **2026-11-21 — Tests are minimal.** Tests are added only with a solid justification (see the testing policy). E2E tests and new test infrastructure need owner approval.
- **2026-11-21 — Agent docs are English; human docs are Turkish.** `AGENTS.md`, `docs/system/`, `docs/workflow/`, and submodule agent docs are English. `README.md` and `docs/gelistirici.md` stay Turkish.
- **2026-10-21 — Cloudflare migration (Workers + D1 / Containers) was researched and cancelled.** The only motive was cutting cost. Workers Paid at $5/month plus container fees is not worth it, and NestJS on Workers and D1 both need large rewrites. A TypeORM-to-Drizzle move would be acceptable; replacing NestJS is considered too risky. Any option with a recurring Cloudflare fee does not count as savings. If the topic returns, start from these findings instead of redoing the research.

## 8. Working with the owner

- When the owner asks for analysis or research ("analiz et", "bir bak", "neymiş"), deliver findings only. Do not add a plan, prototype, or next steps unless asked.
- Planning and execution are separate. Do not start implementation, create branches, or open PRs until the owner explicitly authorizes execution.
- Report verified facts separately from assumptions and recommendations. Do not claim a command, test, PR, or deployment succeeded unless its result was observed.

## 9. Index of deeper docs

- [docs/system/architecture.md](docs/system/architecture.md): components and runtime topology.
- [docs/system/contracts.md](docs/system/contracts.md): cross-repo contracts (routes, auth, roles, i18n).
- [docs/system/configuration.md](docs/system/configuration.md): environment variable names and meaning.
- [docs/workflow/development-flow.md](docs/workflow/development-flow.md): issues, branches, PRs, versions.
- [docs/workflow/task-brief-template.md](docs/workflow/task-brief-template.md): template for agent task briefs.
- [docs/workflow/testing-policy.md](docs/workflow/testing-policy.md): testing policy with examples.
- [docs/gelistirici.md](docs/gelistirici.md): developer guide (Turkish).
