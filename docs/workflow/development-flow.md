# Development flow

How work moves from an idea to production in the TRAC Portal program.

## Where things live

- **Issues:** only in the root repo, `TRAC-Erzurum/trac-portal`.
- **Code changes:** in the submodule where the change is (`trac-portal-api`, `trac-portal-ui`, `mmdvm-link`).
- **Pull requests:** in the same repo as the change, targeting `main`. Root PRs bump submodule pointers or change root files.
- **`main` is protected.** No direct pushes, no force-pushes, no bypassing protection.

## Steps

1. **Issue in the root repo.** Describe the goal and acceptance criteria. For agent-workable tasks, use the `task` issue template, which lists the affected repos.
2. **Branch in the affected submodule.** Name it `<type>/<short-slug>`, for example `feat/observation-share-menu` or `fix/login-redirect`. `<type>` is a conventional-commit type.
3. **Implement and verify.** Run the repo's `verify` command (see the root `AGENTS.md`, section 4). Follow the repo's own `AGENTS.md`.
4. **PR to the submodule `main`.** The PR body states what changed, the verify result, and the root issue it closes or relates to. Follow the testing policy: a new test needs one sentence of justification in the PR.
5. **Review and merge.** Merge is done by a human reviewer after review and green CI. Do not merge only because CI is green.
6. **Root bump PR.** After the submodule PR merges, open a root PR that moves the submodule pointer to the merged commit. Title: `chore: move <submodule> to <what changed> (#<root issue>)`. The root PR template lists the included submodule PRs.
7. **Release tag, when needed.** Tags `v0.x.y` in a submodule trigger the GHCR image build. Root `.env` tags (`UI_TAG`, `API_TAG`) select images for deployment.
8. **Deployment.** Performed manually by product owners after a final test on the server. Agents and contributors do not deploy.

## Cross-repo features

When a feature changes both API and UI:

1. Plan in one root issue with a sub-task per repo.
2. **API first:** implement and merge the API change, keeping the old UI working.
3. **UI second:** consume the new API, merge.
4. **Root bump:** move both submodule pointers in a root PR (or one per repo, if they land separately).

Contract changes (routes, cookies, roles, OIDC, i18n keys) follow [docs/system/contracts.md](../system/contracts.md) and must be stated in both PRs.

## Branches and commits

- Branch names: `<type>/<short-slug>` (lowercase, hyphens). Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`.
- Commits: conventional commits, with the root issue number in the subject, for example `feat: add observation sharing menu (#124)`.
- Commit trailers follow the repo's and the tool's attribution rules; they never override the rules in `AGENTS.md`.
- Never commit `.env` files, secrets, or generated build output.

## Versions

- Submodule releases use `v0.x.y` tags. A tag push triggers the image build.
- Root `.env` (on the server) pins `API_TAG` and `UI_TAG` to those tags.
- A version bump is a deployment decision, made by product owners.

## Who decides what

- Scope, product behavior, and anything touching authorization, data migration, or security invariants: owner decision. Ask before implementing.
- Test infrastructure, E2E tests, and new dependencies: owner approval.
- Changes to `docker-compose.yml` and `update.sh`: owner review before merge.
