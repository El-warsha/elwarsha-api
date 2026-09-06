# AGENTS.md — ElWarsha API

Canonical implementation rules for `ElWarsha-api`.

Precedence: ADRs (`docs/adr/*`) > `AGENTS.md` > routed docs.

This repository is also a junior eight-week training product. Follow
[`docs/LEARNING.md`](docs/LEARNING.md) for how AI teaches, sizes work, and
writes private takeaways.

## Documentation map

| Need                | Source                                                                       |
| ------------------- | ---------------------------------------------------------------------------- |
| How AI teaches      | [`docs/LEARNING.md`](docs/LEARNING.md)                                       |
| System shape        | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                               |
| Domain → Nest paths | [`docs/MODULE_MAP.md`](docs/MODULE_MAP.md)                                   |
| Weekly outcomes     | [`docs/CURRICULUM.md`](docs/CURRICULUM.md)                                   |
| Why decisions exist | [`docs/adr/`](docs/adr/)                                                     |
| Change narrative    | [`docs/history/foundation.md`](docs/history/foundation.md)                   |
| Takeaway template   | [`docs/templates/LEARNING_TAKEAWAY.md`](docs/templates/LEARNING_TAKEAWAY.md) |

## Contracts

Do not invent Auth0, GitHub, or database fields. If a field is not here, it
does not exist yet:

- Database: [`prisma/schema.prisma`](prisma/schema.prisma)
- Public TypeScript client: [`packages/client/src/index.ts`](packages/client/src/index.ts)
- Runtime env: [`.env.example`](.env.example) and [`src/config/env.ts`](src/config/env.ts)

User-facing errors use `{ error: { code, message, requestId } }` from
[`src/common/http-exception.filter.ts`](src/common/http-exception.filter.ts).

## Generated and local-only

Do not hand-edit generated output. Do not commit secrets or learner journals.

| Path                            | Produced by                | Commit?            |
| ------------------------------- | -------------------------- | ------------------ |
| Prisma client in `node_modules` | `yarn prisma:generate`     | no                 |
| `dist/`                         | `yarn build`               | no                 |
| `packages/client/dist/`         | `yarn client:build`        | no                 |
| `openapi.json`                  | `yarn openapi:export`      | generated artifact |
| `.env`                          | copied from `.env.example` | no                 |
| `.learning/`                    | post-task takeaways        | no; local only     |

## Guardrails

- Application services depend on repository interfaces and domain models. Never
  import `@prisma/client` types outside `src/infrastructure`. Feature modules
  may inject `PrismaService` only inside a repository or adapter, not in
  controllers. Target new persistence through ports in `src/infrastructure`.
- Features/modules do not import each other's internals. Other modules may
  import only `AuthGuard` and `RequireCapability` from
  `src/modules/identity/auth.guard.ts`.
- Authentication is OIDC behind a NestJS adapter. The browser receives only an
  opaque HttpOnly session cookie.
- Authorization uses fixed membership roles mapped to capabilities. Role
  capability sets are currently identical by design; do not invent
  differentiation.
- GitHub is authoritative for reviews and checks. Webhook signatures must be
  verified before any write.
- Durable jobs live in PostgreSQL. Do not add Redis unless an ADR says so.
- Tests are required for non-trivial changes.

## Learning mode

Default for cohort assignments: **Coach**, then **Pair**.

1. Read `.learning/index.md` and any relevant prior takeaways if they exist.
2. State the next small increment: one objective, one observable behavior,
   expected files, and one focused verification command.
3. Wait for the learner to attempt or agree before writing code.
4. Give the shortest useful hint first. Add depth only when asked or a
   specific gap appears.
5. After agreement, implement only that increment. Stop for review after the
   focused check passes.
6. After the increment is verified, write a concise local takeaway using
   [`docs/templates/LEARNING_TAKEAWAY.md`](docs/templates/LEARNING_TAKEAWAY.md).
   Record only new concepts, corrections, or a new application. Link prior
   takeaways instead of repeating explanations or resources.

Explicit maintainer requests (“implement this”, “fix CI”, “update docs”) use
normal implementation mode. Do not coach those unless asked.

Do not silently complete assessed assignment work. Required checks and human
GitHub review decide eligibility.

## Setup

```bash
corepack enable
cp .env.example .env
docker compose up -d
yarn install
yarn prisma:generate
yarn prisma:deploy
yarn prisma:seed
yarn start:dev
```

Worker (second terminal): `yarn start:dev:worker`.

API: `http://localhost:3001`
OpenAPI: `http://localhost:3001/api/docs`

Default identity is the fake adapter. `/api/v1/auth/login` creates a session
for the seeded participant.

## Validation

| Command                                                            | When                                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Task-named test (for example `yarn test src/domain/roles.spec.ts`) | After each small increment                                                           |
| `yarn validate`                                                    | Fast loop: format, lint, typecheck, Prisma generate, unit tests, build. No database. |
| `yarn validate:ci`                                                 | Integration checkpoint and CI parity. Needs Postgres and `.env`.                     |

## Documentation updates

If a change alters system shape, update `docs/ARCHITECTURE.md`. If it changes
why the system is shaped that way, add or update an ADR and a
`docs/history/` entry.
