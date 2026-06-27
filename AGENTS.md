# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

`rpg2d` is a monorepo for a 2D RPG authoring stack:

- `packages/database` — PostgreSQL data access (Kysely)
- `packages/schema` — Zod schemas
- `packages/engine` — game engine
- `apps/api` — backend API
- `apps/editor` — authoring UI
- `apps/runtime` — game runtime

Package manager: **pnpm** (workspace root). Node.js **>= 24**.

## Common commands

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm test:database
pnpm db:migrate
```

Database tests live in `packages/database/tests` and require PostgreSQL.

## Cursor Cloud specific instructions

Cloud Agents need PostgreSQL for `packages/database` integration tests.

### Prerequisites

1. **Secrets**: `DATABASE_URL` must be set in [Cloud Agents Secrets](https://cursor.com/dashboard/cloud-agents).
   - Example value (matches `docker-compose.yml`): `postgresql://rpg2d:rpg2d@127.0.0.1:5432/rpg2d`
   - Use **Runtime Secret** so the connection string is not exposed in logs.
2. **Environment**: `.cursor/environment.json` starts Docker and runs `docker compose up postgres` in a shared terminal.

### Startup checklist

Before running database tests:

```bash
# Wait until PostgreSQL is ready
until pg_isready -h 127.0.0.1 -p 5432; do sleep 1; done

# Run database package tests
pnpm test:database
```

If the `postgres` terminal is not running, start it manually:

```bash
docker compose up postgres
```

### How database tests work

- `packages/database/tests/setup/setup.ts` runs migrations before tests.
- Integration tests truncate tables between cases via helpers in `packages/database/tests/repositories/domain/helpers/`.
- `DATABASE_URL` is read by `pg-client`; do not commit credentials to the repository.

### Parallelism note

Database integration tests share the `public` schema. If tests flake under parallel workers, run:

```bash
cd packages/database && pnpm vitest run --maxWorkers=1
```

### Running the apps (dev mode)

Use the scripts in the root `package.json` (`pnpm dev:runtime`, `pnpm dev:editor`, `pnpm dev:api`, or `pnpm dev:edit` for all three). Non-obvious notes:

- **runtime** (`pnpm dev:runtime`, http://localhost:5174): the playable 2D RPG. It defaults to **mock mode**, serving `fixtures/resources/**` via MSW, so it needs **no backend, DB, or auth**. The game canvas stays **black until you click the on-screen `START` button**; afterwards move the hero with the keyboard **arrow keys**. It relies on `SharedArrayBuffer`/`crossOriginIsolated`, which the Vite COOP/COEP headers already provide. Use `?mode=api` to hit the real API instead of mocks.
- **editor** (`pnpm dev:editor`, http://localhost:5173): authoring UI; proxies `/api` to the API on :3000. Full login needs Auth0 vars (see `apps/api/.env.example`).
- **api** (`pnpm dev:api`, http://localhost:3000): Hono API; needs Auth0 + DB config for full functionality.

### Known pre-existing failures (not caused by your changes)

CI on `main` is currently red. Before assuming you broke something, verify against a clean checkout:

- `pnpm lint` reports pre-existing errors (unused vars, `react-refresh`, `preserve-caught-error`).
- `pnpm typecheck` fails in `apps/runtime` (TS 6 `baseUrl` deprecation, TS5101); typecheck is not part of CI.
- `pnpm test:schema` has 1 failing validation test; `pnpm test:database` has multiple failing repository tests (e.g. fixtures inserting a duplicate user) that fail even per-file in isolation. `pnpm test:engine` and `pnpm test:api` pass cleanly.

### What not to change without explicit request

When working on repository test migrations, avoid changing production code under:

- `packages/database/src`
- `packages/schema`
- `packages/sharedTypes` / `types`
- migrations and schema definitions
