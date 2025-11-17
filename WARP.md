# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TRAC Erzurum Operatör ve Çevrim Yönetim Sistemi - A web application for managing amateur radio operator nets and tracking participation. This is a volunteer-led open source project developed by TA9MFE with support from TRAC Erzurum.

The project is a monorepo containing two git submodules:
- **trac-portal-api**: NestJS backend API (TypeScript)
- **trac-portal-ui**: Nuxt 3 frontend (Vue.js + Vuetify)

## Architecture

### Project Structure

The repository uses **git submodules** for API and UI components:
- `trac-portal-api/` - Backend API submodule
- `trac-portal-ui/` - Frontend UI submodule

### Backend (trac-portal-api)

Built with **NestJS** and TypeScript. Main modules:
- `auth/` - Authentication (JWT + Google OAuth)
- `user/` - User management
- `operator/` - Amateur radio operator profiles
- `net/` - Net management with attendee tracking
- `qth/` - QTH (location) data
- `dashboard/` - Dashboard data aggregation
- `shared/` - Shared utilities and filters

**Key Technologies:**
- TypeORM for PostgreSQL database access
- Passport.js with JWT and Google OAuth strategies
- Express session management with cookies
- Global validation pipe with class-validator

**Database:** PostgreSQL 16

### Frontend (trac-portal-ui)

Built with **Nuxt 3** (SSR enabled) and Vuetify 3 component library.

**Key Technologies:**
- Vue 3 with TypeScript
- Vuetify 3 for UI components
- i18n for internationalization (default: Turkish)
- Composables for shared logic
- SSR with Nitro server

## Common Commands

### Development Setup

**Full stack with Docker (recommended):**
```powershell
# Copy environment variables
Copy-Item .env.example .env
# Edit .env with your values

# Start all services (UI, API, DB)
docker-compose -f docker-compose.local.yml up --build -d
```

**Backend development (trac-portal-api):**
```powershell
cd trac-portal-api
yarn install
yarn start:dev  # Watch mode
```

**Frontend development (trac-portal-ui):**
```powershell
cd trac-portal-ui
yarn install
yarn dev  # Dev server on localhost:3000
```

### Testing

**Backend:**
```powershell
cd trac-portal-api
yarn test           # Unit tests
yarn test:watch     # Watch mode
yarn test:cov       # With coverage
yarn test:e2e       # E2E tests
```

**Frontend:**
Note: Test commands not currently defined in package.json

### Linting & Type Checking

**Backend:**
```powershell
cd trac-portal-api
yarn lint           # ESLint with auto-fix
yarn format         # Prettier formatting
```

**Frontend:**
```powershell
cd trac-portal-ui
yarn lint           # ESLint
yarn lint:fix       # ESLint with auto-fix
yarn typecheck      # TypeScript type checking
```

### Database Migrations (Backend)

```powershell
cd trac-portal-api
yarn migration:generate src/migrations/MigrationName  # Generate migration
yarn migration:create src/migrations/MigrationName    # Create empty migration
yarn migration:run                                     # Run pending migrations
yarn migration:revert                                  # Revert last migration
```

### Build & Production

**Backend:**
```powershell
cd trac-portal-api
yarn build          # Build for production
yarn start:prod     # Run production build
```

**Frontend:**
```powershell
cd trac-portal-ui
yarn build          # Build for production
yarn preview        # Preview production build
yarn start:prod     # Run production server
```

## Development Guidelines

### Branch Strategy
- `master` - Production branch (protected)
- `dev` - Development branch (protected)
- All feature branches should be created from `dev`
- PRs should target `dev` branch

### Branch Naming
- Features: `feature/description`
- Bug fixes: `fix/description`
- Hotfixes: `hotfix/description`

### Commit Messages
- Write in English
- Be descriptive and concise
- Format: `feat: add attendee list feature`

### Code Style
- **Both projects use ESLint and Prettier** - run linting before committing
- Backend uses TypeScript with strict mode
- Frontend uses Vue 3 Composition API
- Follow existing code patterns in each submodule

### Pull Requests
- Each PR should address a single concern
- Ensure all CI/CD checks pass
- At least one approval required to merge
- No merge conflicts
- Update documentation if adding new features

## Environment Variables

Copy `.env.example` to `.env` and configure:

**Required Variables:**
- `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL credentials
- `JWT_SECRET` - JWT token signing secret
- `COOKIE_SECRET` - Cookie parsing secret
- `SESSION_SECRET` - Express session secret
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `DOMAIN` - Application domain

**Optional:**
- `PORT` - Application port (default: 80)
- `NODE_ENV` - Environment mode (development/production)
- `JWT_EXPIRES_IN` - JWT expiration (default: 24h)

## CI/CD

GitHub Actions automatically builds and publishes Docker images to GitHub Container Registry (ghcr.io):

- **Dev builds**: Triggered on push to `dev` branch, tagged as `dev-build.{build_id}` and `dev`
- **Release builds**: Triggered on new git tags, tagged as the tag name and `latest`

## Docker Services

The application runs as three services:
- **ui**: Nginx serving Nuxt 3 frontend (ports 80/443)
- **api**: NestJS backend (internal port 8000)
- **db**: PostgreSQL 16 database (internal port 5432)

Health checks are configured for API and database services.

## Authentication Flow

1. User authenticates via Google OAuth
2. Backend validates with Google and creates/updates user record
3. JWT token issued and stored in httpOnly cookie
4. Frontend uses cookie for authenticated API requests
5. Guards protect routes based on user roles (ADMIN, MODERATOR, USER)

## Key Patterns

### Backend Module Pattern
Each module typically contains:
- `entities/` - TypeORM entities
- `controllers/` - REST endpoints
- `services/` - Business logic
- `dto/` - Data transfer objects
- `guards/` - Route guards for authorization

### Frontend Structure
- `pages/` - File-based routing
- `components/` - Reusable Vue components
- `composables/` - Composition API composables
- `middleware/` - Route middleware
- `plugins/` - Nuxt plugins
- `layouts/` - Page layouts

## License

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
- ✅ Can share and adapt
- ✅ Must provide attribution
- ❌ Cannot use commercially
- ✅ Must share adaptations under same license
