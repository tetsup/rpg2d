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

### What not to change without explicit request

When working on repository test migrations, avoid changing production code under:

- `packages/database/src`
- `packages/schema`
- `packages/sharedTypes` / `types`
- migrations and schema definitions
