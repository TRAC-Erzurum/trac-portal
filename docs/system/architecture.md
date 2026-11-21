# Architecture

Components, repositories, and the production runtime topology of the TRAC Portal program.

## Components

| Component | Repo | Stack | Role |
|-----------|------|-------|------|
| API | `trac-portal-api` (submodule) | NestJS 11, TypeORM, PostgreSQL | REST API under `/api`, auth (JWT cookie, Google OAuth), OIDC provider at `/api/oidc`, uploads under `/uploads` |
| UI | `trac-portal-ui` (submodule) | Vue 3, Vite, shadcn-vue, Tailwind, vue-i18n, Pinia | Single-page web app, served by nginx in its container |
| MMDVM link | `mmdvm-link` (submodule) | Python 3.11+, MQTT | Proof of concept: server and Pi-Star client for MMDVM link traffic. Not part of the web runtime below |
| Root | `trac-portal` | Docker Compose, shell scripts | Issues, production compose file, deployment helper scripts, docs |

Each submodule is its own GitHub repository. Each one's CI builds a Docker image and pushes it to GHCR.

## Runtime topology (production)

Defined in the root `docker-compose.yml`.

- **`api` container** (`trac-portal-api`, image `ghcr.io/trac-erzurum/trac-portal-api:${API_TAG}`).
  - Networks: `internal` (shared with `ui`) and external `data` (PostgreSQL).
  - Listens on `PORT` (default 8000). It is not published through Traefik; the UI container's nginx proxies `/api/` and `/uploads/` to `http://api:8000`.
  - Healthcheck: `wget` against `http://localhost:8000/api/health`, every 10 s, 5 s timeout, 5 retries, 40 s start period.
  - Memory limit: 768 MB.
  - Host volumes: `/opt/stacks/trac-portal/volumes/uploads` mapped to `/app/uploads`, and `/opt/stacks/trac-portal/volumes/backups` mapped to `/app/backup`.
  - `extra_hosts`: `afet.yerlisu.com:host-gateway` (see below).
- **`ui` container** (`trac-portal-ui`, image `ghcr.io/trac-erzurum/trac-portal-ui:${UI_TAG}`).
  - Networks: `internal` and external `edge` (Traefik).
  - Starts only after `api` reports healthy (`depends_on: condition: service_healthy`).
  - Healthcheck: `wget` against `http://127.0.0.1:80/`, every 30 s.
  - Memory limit: 512 MB.
  - Traefik labels: router `trac` matches `Host(${DOMAIN})` on entrypoint `websecure`, service port 80, network `edge`.
- **Traefik** runs on the host and terminates TLS for `DOMAIN`. It is not defined in this repo; it is external and shared with other services on the same host. The `edge` network is external and must exist.
- **PostgreSQL** runs on the host as a shared service, reachable on the external `data` network. It is not defined in this repo. `DB_HOST` points at it.
- Both services use `restart: unless-stopped`.

Request path in production: browser → Traefik (TLS, `DOMAIN`) → `ui` nginx → `/api/*` and `/uploads/*` proxied to `api:8000` → PostgreSQL over `data`.

## Images and versions

- Images come from GHCR. Tags `v0.x.y` trigger image builds in each submodule's CI.
- Production uses the tags pinned in the server's `.env` (`UI_TAG`, `API_TAG`). Version changes are made by product owners during manual deployment.
- `update.sh` and `build.sh` run on the server from the deployment directory (the one containing `docker-compose.yml`). They are not part of the application runtime.

## The afet.yerlisu.com host mapping

The API's `extra_hosts` entry maps `afet.yerlisu.com` to `host-gateway`. Observation sharing posts to the Afet Haberleşme Portalı, which runs on the same host behind the same Traefik. Requests that go out through Cloudflare receive a bot-challenge 403 for server-originated traffic. Resolving the name to the host sends them straight to Traefik. TLS remains valid because Traefik holds the same certificate. Do not remove this entry without checking the observation-sharing feature.

## Local development

Local development runs the API and UI separately, outside Docker. Each submodule's README describes its setup. The UI dev server proxies `/api` to `http://127.0.0.1:8000`. The root `docker-compose.yml` is production-only; it expects the external `edge` and `data` networks.
