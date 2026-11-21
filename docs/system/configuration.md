# Configuration

Environment variables used by the root deployment (`docker-compose.yml`, `.env.example`). This page lists names and meaning only. Never write real values into docs, issues, PRs, or commits. The real `.env` lives on the server.

Submodule-specific variables are documented in each submodule's own docs.

## Image selection

| Variable | Meaning |
|----------|---------|
| `API_TAG` | GHCR tag of the API image. Also passed to the API as `APP_VERSION`. |
| `UI_TAG` | GHCR tag of the UI image. Also passed to the API as `UI_VERSION`. |

## General

| Variable | Default in compose | Meaning |
|----------|--------------------|---------|
| `DOMAIN` | none | Public host name (no scheme). Used for the Traefik rule on `ui`, for `PUBLIC_API_ORIGIN`, and passed to both services. |
| `NODE_ENV` | `production` | Node environment. |
| `PORT` | `8000` | API listen port. |
| `PUBLIC_API_ORIGIN` | derived: `https://${DOMAIN}` | Origin used for the OIDC issuer. Set by compose, not by `.env`. |

## Database

| Variable | Default | Meaning |
|----------|---------|---------|
| `DB_HOST` | none (`.env.example` uses `postgres`) | PostgreSQL host reachable on the `data` network. |
| `DB_PORT` | `5432` | PostgreSQL port. |
| `DB_NAME` | none | Database name. |
| `DB_USERNAME` | none | Database user. (Older docs say `DB_USER`; compose uses `DB_USERNAME`.) |
| `DB_PASSWORD` | none | Database password. |
| `DB_SSL` | `false` | Whether the API uses SSL for the database connection. |

## Secrets and auth

| Variable | Default | Meaning |
|----------|---------|---------|
| `JWT_SECRET` | none | Signing key for session JWTs. |
| `JWT_EXPIRES_IN` | `24h` | JWT lifetime. |
| `SESSION_SECRET` | none | Session secret. |
| `COOKIE_SECRET` | none | Cookie signing secret. |

## Google OAuth

| Variable | Meaning |
|----------|---------|
| `GOOGLE_CLIENT_ID` | OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret. |
| `GOOGLE_CALLBACK_URL` | Callback URL registered with Google, for example `https://<DOMAIN>/api/auth/google/callback`. |

## Cloudflare R2 (uploads)

| Variable | Meaning |
|----------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account ID for R2. |
| `R2_BUCKET_NAME` | Bucket name (`.env.example` uses `trac-portal`). |
| `R2_ACCESS_KEY_ID` | R2 access key ID. |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key. |

## Integrations

| Variable | Meaning |
|----------|---------|
| `GITHUB_REPO_WEB_URL` | Web URL of the root repository, used for links in the app (`.env.example`: `github.com/TRAC-Erzurum/trac-portal`). |
| `GITHUB_APP_ID` | ID of the GitHub App used to forward feedback to issues. Feedback forwarding needs all three `GITHUB_APP_*` variables. |
| `GITHUB_APP_INSTALLATION_ID` | Installation ID of that App on the repository. |
| `GITHUB_APP_PRIVATE_KEY` | Private key of the App (PEM). Literal `\n` sequences are converted to newlines. Secret. |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side secret for bot verification. |

## Notes

- `.env.example` is the list of names developers copy; it has no real values and must stay that way.
- `.env.example` does not list `APP_VERSION`, `UI_VERSION`, or `PUBLIC_API_ORIGIN`; compose derives them.
- Compose passes the full API set to `api` and only `DOMAIN` to `ui`.
- A new variable needs: `.env.example` entry (name only), compose entry if the container needs it, and an entry in this file.
