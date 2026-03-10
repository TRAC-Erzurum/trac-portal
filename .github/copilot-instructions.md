# TRAC Portal — Workspace Instructions

This is a monorepo for the TRAC Portal application (Turkish Radio Amateur Club portal).

## Repository Structure

| Folder | Purpose | Tech |
|--------|---------|------|
| `trac-portal-api/` | Backend REST API | NestJS 11, TypeORM, PostgreSQL |
| `trac-portal-ui/` | Frontend SPA | Vue 3, Vite, shadcn-vue, Tailwind CSS |
| `docs/` | Documentation | Markdown |
| `server/` | Server scripts | Bash |

## Agent Routing

- Changes in `trac-portal-api/` → delegate to `@nestjs-api`
- Changes in `trac-portal-ui/` → delegate to `@vue-frontend`

## Cross-Cutting Conventions

- **Language**: TypeScript for both frontend and backend
- **i18n**: Turkish is the primary language; English is supported. All user-facing strings must be translated in both locales.
- **Auth**: JWT stored in httpOnly cookies. Frontend sends credentials via `fetch` with `credentials: 'include'`. Backend validates via Passport JwtStrategy.
- **Roles**: `super_admin > admin > member > volunteer > guest` — consistent across both frontend and backend.
- **API contract**: Backend prefixes all routes with `/api`. Frontend Vite dev server proxies `/api` to `http://127.0.0.1:8000`.
- **Environment**: Use `.env` files for configuration. Never hardcode secrets, URLs, or environment-specific values.
- **Docker**: Both projects have Dockerfiles. `docker-compose.yml` at root orchestrates the full stack.
