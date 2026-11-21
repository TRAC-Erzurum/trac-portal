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

Global and branch roles are defined in the API (`src/auth/enums/role.enum.ts`) and mirrored in the UI (`src/lib/ui-helpers.ts`, route `meta.minRole`). The current rank order, highest first:

1. `super_admin` (global)
2. `president` (branch)
3. `admin` (branch)
4. `member` (branch)
5. `volunteer` (branch)
6. `guest` (global)

The API decides access; the UI only hides or shows routes. A role change must update both repos. Adding a role is a cross-repo contract change that needs owner approval.

## Internationalization

- Turkish is the primary UI language; English is supported.
- Every user-facing string must exist in both locales (`trac-portal-ui/src/i18n/locales/tr.json` and `en.json`).

## Versioning

- The API receives `APP_VERSION` and the UI receives `UI_VERSION` at runtime, derived from `API_TAG` and `UI_TAG` in the root compose file.
- Image tags follow `v0.x.y`. Root PRs record the submodule commits being promoted.
