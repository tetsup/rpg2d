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

## Agent implementation conventions

When implementing features in this repo:

- **Minimal scope**: implement only what the task requires. Do not add parallel abstractions, hooks, or layers "for future use".
- **Single responsibility**: keep data fetching in existing hooks (e.g. `useDocumentList`); keep label/thumbnail resolution in `lib/`; keep UI composition in `components/`.
- **Reuse before duplicate**: when picker and browse flows share behaviour, extend the same component rather than forking a second list stack.
- **Small diffs**: prefer extending existing code over new files; delete dead scaffolds instead of leaving them alongside replacements; avoid drive-by refactors unrelated to the task.

### Refactoring

When a change replaces or supersedes existing code:

1. **Remove obsolete modules**: delete files, exports, and imports that the refactor no longer uses (e.g. alias re-export shims, dead barrel files, superseded components). Update call sites to import from the canonical module directly.
2. **Do not delete intentional WIP**: skip removal when an unreferenced function, class, or module is clearly **in progress** and planned for near-term use in the same feature arc (e.g. scaffolded but not yet wired). If it is ambiguous whether something is dead or WIP, **ask the user** before deleting.
3. **Prefer direct imports over forwarding re-exports**: avoid `export { X } from '…'` (and alias shims like `export { A as B }`) unless there is a deliberate public API boundary. Consumers should import from the defining module.

### Before committing

Leaving fixes or follow-up work uncommitted is a common source of CI failures and false “done” reports. Before every commit (and before opening or updating a PR):

1. **No leftover diffs**: run `git status` and confirm there are no uncommitted changes that belong to the task (including lint fixes, import updates, and files created during the same session). Do not push or mark work complete while relevant changes still exist only in the working tree.
2. **Scope matches the request**: review the staged diff against what the user asked for. Each commit should implement the interpreted requirement—not unrelated refactors, extra abstractions, or “while I’m here” changes. If the diff grows beyond what the prompt reasonably implies, stop and either trim the change or **ask the user** before committing.
3. **Verify before you claim done**: run checks the task depends on (e.g. `pnpm lint` when touching lint-sensitive code, relevant tests) on the **committed** state when possible, not only on uncommitted local edits.
4. **When in doubt, ask first**: if requirements are ambiguous, the change set mixes several concerns, or you would need to commit something the user did not ask for (e.g. broad renames, new files, behaviour changes), confirm with the user instead of committing silently.
5. **Prune redundant code**: scan the diff (and related files) for unnecessary re-exports, alias-only shim files, duplicate barrels, and other dead scaffolding left behind by the change. Fix them in the same commit series when they are clearly obsolete—not intentional WIP (see **Refactoring** above).

### Git and PR language

Use a consistent split between machine-facing titles and human-facing descriptions:

- **Commit messages**: English (subject line and body).
- **PR titles**: English.
- **PR descriptions** (body, walkthrough, summary for reviewers): Japanese.

Keep English titles concise and factual; use the Japanese PR body for context, motivation, and testing notes aimed at maintainers.

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

# Enable pg_trgm and apply public-schema migrations (required once per fresh DB volume)
pnpm db:migrate

# Run database package tests
pnpm test:database
```

If the `postgres` terminal is not running, start it manually:

```bash
docker compose up postgres
```

After `docker compose down -v`, run `pnpm db:migrate` again before tests.

### How database tests work

- Each test file gets an isolated `test_<random>` schema; `packages/database/tests/setup/setup.ts` runs migrations into that schema before tests.
- The `pg_trgm` extension is **not** created during test migrations (to avoid parallel races). Migration `001_extensions` only checks that `pg_trgm` exists; run `pnpm db:migrate` on the default (`public`) schema first.
- Integration tests truncate tables between cases via helpers in `packages/database/tests/repositories/domain/helpers/`.
- `DATABASE_URL` is read by `pg-client`; do not commit credentials to the repository.
- Database integration tests run in parallel by default; no `--maxWorkers=1` workaround is needed when `pg_trgm` is already enabled.

### Running the apps (dev mode)

Use the scripts in the root `package.json` (`pnpm dev:runtime`, `pnpm dev:editor`, `pnpm dev:api`, or `pnpm dev:edit` for all three). Non-obvious notes:

- **runtime** (`pnpm dev:runtime`, http://localhost:5174): the playable 2D RPG. It defaults to **mock mode**, serving `fixtures/resources/**` via MSW, so it needs **no backend, DB, or auth**. The game canvas stays **black until you click the on-screen `START` button**; afterwards move the hero with the keyboard **arrow keys**. It relies on `SharedArrayBuffer`/`crossOriginIsolated`, which the Vite COOP/COEP headers already provide. Use `?mode=api` to hit the real API instead of mocks.
- **editor** (`pnpm dev:editor`, http://localhost:5173): authoring UI; proxies `/api` to the API on :3000. Full login needs Auth0 vars (see `.env.example` at the repo root).
- **api** (`pnpm dev:api`, http://localhost:3000): Hono API; needs Auth0 + DB config for full functionality.

### Known pre-existing failures (not caused by your changes)

CI on `main` is currently red. Before assuming you broke something, verify against a clean checkout:

- `pnpm lint` reports pre-existing errors (unused vars, `react-refresh`, `preserve-caught-error`).
- `pnpm typecheck` fails in `apps/runtime` (TS 6 `baseUrl` deprecation, TS5101); typecheck is not part of CI.
- `pnpm test:schema` has 1 failing validation test; `pnpm test:database` has 2 failing test files (5 tests total; e.g. `namespace-errors` removePermission, `resource` create/find). `pnpm test:engine` and `pnpm test:api` pass cleanly.

### What not to change without explicit request

When working on repository test migrations, avoid changing production code under:

- `packages/database/src`
- `packages/schema`
- `packages/sharedTypes` / `types`
- migrations and schema definitions
