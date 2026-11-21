# Cross-repo contracts

Rules that the API and UI must both follow. A change to any of these is a cross-repo change: plan it with the API first, then the UI (see [development-flow.md](../workflow/development-flow.md)).

## Routes and proxy

- The API prefixes **all** routes with `/api` (`app.setGlobalPrefix('api')`). Health check: `GET /api/health`.
- Uploaded files are served under `/uploads` by the API.
- In production, the UI container's nginx proxies `/api/` and `/uploads/` to the API service. Traefik only routes to the UI container.
- In local development, the UI dev server proxies `/api` to `http://127.0.0.1:8000`.
- The UI must call the API with relative `/api/...` paths. A hardcoded API host is only for local setups (see `docs/gelistirici.md`).

## Authentication and cookies

- Sessions are a JWT stored in an **httpOnly cookie** set by the API. Client code must not depend on reading the token from JavaScript.
- Cookie options (including `domain` when configured) are set by the API's auth controller. Changing cookie name, path, domain, `sameSite`, or `secure` affects both repos and must be coordinated.
- Google OAuth is supported. The callback URL is configured with `GOOGLE_CALLBACK_URL` (see [configuration.md](configuration.md)).
- Secrets used by auth (`JWT_SECRET`, `COOKIE_SECRET`, `SESSION_SECRET`) are server-side only.

## OIDC provider

- The API acts as an OpenID Connect provider. The issuer is `<origin>/api/oidc`, with origin from `PUBLIC_API_ORIGIN` (`https://${DOMAIN}` in production).
- The UI and API share the same `DOMAIN` origin behind Traefik; the consent page depends on this. Do not split them onto different origins without a plan.

## Roles

Roles are defined in the API (`src/auth/enums/role.enum.ts`) and mirrored in the UI (`src/lib/ui-helpers.ts`, route `meta.minRole`). There are two kinds:

- **GlobalRole** (portal-wide): `guest`, `super_admin`.
- **BranchRole** (per branch membership): `president`, `admin`, `member`, `volunteer`.

Rank, highest first: `super_admin` 60 > `president` 50 > `admin` 40 > `member` 30 > `volunteer` 20 > `guest` 10.

`@Roles(X)` in the API means minimum rank: a request passes if the user's effective role ranks at or above `X`. The UI route `meta.minRole` follows the same meaning.

The API decides access; the UI only hides or shows routes. A role change must update both repos. Adding a role is a cross-repo contract change that needs owner approval.

## Feedback

- `POST /api/feedback` (public, as before) saves the record first. Response: `{ success: true, id, issueUrl? }`. `id` is always present; `issueUrl` only when the GitHub issue was created on this request. A GitHub failure does not fail the request.
- Errors `error.feedbackGithubFailed` and `error.feedbackNotConfigured` are not returned by `POST /api/feedback`. The UI must not depend on them there.
- Admin routes (`SUPER_ADMIN` only; other roles get 403):
  - `GET /api/feedback?category=&githubStatus=&limit=&offset=` returns `{ data, total, limit, offset }`, newest first. `limit` defaults to 50, max 100.
  - `GET /api/feedback/:id` returns one record (404 `error.notFound`).
  - `POST /api/feedback/:id/forward` retries forwarding for one record. Errors: `error.feedbackAlreadySent`, `error.feedbackSecurityNotForwardable`, `error.feedbackNotConfigured` (503), `error.notFound`.
  - `POST /api/feedback/forward-pending` runs one batch now and returns `{ processed, sent, failed }`. 503 `error.feedbackNotConfigured` when the GitHub App variables are missing.
- Security reports are never forwarded to GitHub. They stay in the portal only.
- Issues created by the GitHub App contain a link to the portal record at `/admin/feedback/:id` (the UI route). The UI must keep this route and the `SUPER_ADMIN` guard on it.
- New error keys `error.feedbackAlreadySent` and `error.feedbackSecurityNotForwardable` need entries in both locales.

## Net plans (net schedulers)

- `GET /api/net-schedulers` accepts `status=active|inactive` (default `active`). `inactive` returns paused and ended plans. Any other value returns 400 `error.invalidData`.
- Every scheduler from `GET /api/net-schedulers` and `GET /api/net-schedulers/:id` has a computed `status`: `'active' | 'paused' | 'ended'`. It is not stored.
- `POST /api/net-schedulers/:id/end` (branch `member` or higher, same membership rule as update) sets `endDate` to yesterday (GMT+3) and returns the updated plan. Already ended plans return 400 `error.schedulerAlreadyEnded`.
- `PATCH /api/net-schedulers/:id` with `isActive: true` on an ended plan returns 400 `error.schedulerAlreadyEnded`.
- `DELETE /api/net-schedulers/:id` requires a `SUPER_ADMIN` or a member of the plan's branch. Non-members get 403 `error.notBranchMember`.
- New i18n key `error.schedulerAlreadyEnded` needs entries in both locales.

## Internationalization

- Turkish is the primary UI language; English is supported.
- Every user-facing string must exist in both locales (`trac-portal-ui/src/i18n/locales/tr.json` and `en.json`).

## Versioning

- The API receives `APP_VERSION` and the UI receives `UI_VERSION` at runtime, derived from `API_TAG` and `UI_TAG` in the root compose file.
- Image tags follow `v0.x.y`. Root PRs record the submodule commits being promoted.
