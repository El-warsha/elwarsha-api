# Foundation history

## 2026-09-06 — Initial backend foundation

User request: implement the NestJS + PostgreSQL plan, including Auth0 boundary,
GitHub App integration, Yarn 4, and Render delivery.

Files: repository scaffold, Prisma schema, identity/catalog/github modules,
worker, OpenAPI client 0.1.0, CI, Render blueprint.

ADRs: 0001–0006.

## 2026-09-06 — CI and versioned client

Recorded ADR 0007: GitHub Actions runs format, lint, typecheck, Prisma deploy,
tests, and build. The TypeScript client is versioned at
`@elwarsha/api-client@0.1.0`.

## 2026-09-06 — Learning-centered agent setup

Documented Coach-then-Pair teaching, small-task curriculum, private `.learning/`
takeaways, and canonical `yarn validate` / `yarn validate:ci` commands. No
runtime architecture change.

## 2026-09-06 — Nest 12 tooling alignment

Moved the foundation onto Nest 12, `nest build` / `nest start --watch`, oxlint,
Vitest 4, and TypeScript 6. `APP_ENV` lives in `src/config/tokens.ts`. GitHub
and job services no longer import Prisma enums. CI seeds the database and runs
HTTP e2e tests.

## 2026-09-06 — Foundation hardening

Made Render deployment migrate before release and declare its runtime
configuration. Auth callbacks now use a configured origin and validated OAuth
state. Webhook persistence and enqueue are atomic and idempotent; job claims
use recoverable PostgreSQL leases.
