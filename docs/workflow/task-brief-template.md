# Task brief template

Copy this template for every task given to an implementation agent (any tool, any model). The agent does not inherit the root `AGENTS.md`, so the brief must be complete on its own. Keep it short and concrete.

---

```markdown
# Task: <short title>

Root issue: TRAC-Erzurum/trac-portal#<number>

## Goal
<One or two sentences: what must be true when this is done, and why.>

## Context
- Relevant contracts: <e.g. /api prefix, cookie auth, roles, i18n> or "none"
- Related PRs or issues: <links or "none">
- Known constraints: <e.g. must keep existing endpoint shape>

## Repo and branch
- Repo: <trac-portal-api | trac-portal-ui | mmdvm-link>
- Base: `main` (fetch first)
- Branch: `<type>/<short-slug>`
- Work only in the repo directory. No git worktrees unless the orchestrator says so.

## Allowed files
- <paths or globs the agent may change>

## Out of scope
- Any file outside the allowed list.
- Dependency changes, unless listed here: <none | list>.
- Refactors not required by the goal.
- Anything under the root repo, submodule pointers, or other submodules.

## Acceptance criteria
- [ ] <observable behavior 1>
- [ ] <observable behavior 2>
- [ ] Existing tests still pass.

## Verify
Run and report the output:
- `<verify command for this repo>` (e.g. `yarn verify` or `python scripts/verify.py`)

## Testing policy
Tests are expensive; keep them to a minimum. Do not add tests by default and never treat "write tests" as an acceptance criterion. Add a test only when it rests on a solid reason: authentication/authorization, data integrity or irreversible operations, non-trivial pure logic (parsing, date/time, state machines), or a production bug likely to recur. State that reason in one sentence in the PR description. End-to-end tests and any new test framework or infrastructure require explicit owner approval. Do not write tests for trivial CRUD, getters, rendering/snapshots, or mock-heavy controller code. Existing tests stay and must pass.

Tests for this task: <none | list, each with its one-sentence justification>

## Boundaries
- Never push to `main`; never force-push; never bypass branch protection.
- Never deploy; never touch the production server.
- Never run migrations, seeds, or destructive commands against any database.
- Never read, print, or commit `.env` files or secrets.
- Preserve unrelated changes in the working tree.
- Stop and report if the scope must grow, if a product or security decision is needed, or if the work cannot be completed safely.

## Git and PR
- Commit with conventional commits and the root issue number, e.g. `fix: correct login redirect (#<number>)`.
- Stage files by explicit path.
- Push the branch and open a PR to `main` in this repo. The PR body includes: summary, changed files, verify output, the testing justification (if any), and `Closes TRAC-Erzurum/trac-portal#<number>` if this repo's PR should close the root issue, otherwise `Refs ...`.

## Required final report
Reply with:
1. Branch name and commit SHA(s).
2. PR URL.
3. Files changed (list).
4. Commands run and their result (pass/fail), including the verify command.
5. Tests added, with justification, or "none".
6. Deviations from this brief, and anything unresolved.
```

---

## Filling notes for the orchestrator

- Keep "Allowed files" tight; two agents must not edit the same file in parallel.
- Give cross-file or security-sensitive work to the most capable agent available; give mechanical, clearly bounded edits to a smaller one.
- Do not paste secrets or real `.env` values into a brief.
