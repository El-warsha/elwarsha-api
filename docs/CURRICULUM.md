# Eight-week progression

Each week connects one concept across React, NestJS/PostgreSQL, and GitHub.
Assignments are pull requests against this repository. GitHub reviews and
required checks decide eligibility. One qualifying PR is merged each week.

Work is a sequence of small tasks, not one feature-sized change. Each task has
one objective, one observable behavior, expected files, and one focused check.
See [`LEARNING.md`](LEARNING.md).

## Week 1 — Architecture and modularity

**Outcome:** Trace a request from HTTP entry to the module that owns it.

**Prerequisites:** Node 22, Corepack/Yarn, Docker Compose Postgres, local setup
from the README.

**Entry points:** `src/main.ts`, `src/app.module.ts`, `src/modules/*`,
[`ARCHITECTURE.md`](ARCHITECTURE.md), [`MODULE_MAP.md`](MODULE_MAP.md).

| Order | Small task                                                              | Observable behavior                                  | Focused check                         |
| ----- | ----------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| 1.1   | Map Nest modules to domain rows in the module map                       | Written map of path → ownership                      | Review of the map, no code change     |
| 1.2   | Follow `GET /api/v1/products` through controller and repository         | Can name each file in the path                       | Manual request after `yarn start:dev` |
| 1.3   | Name one forbidden cross-module import and the allowed identity exports | Correct example of `AuthGuard` / `RequireCapability` | Code-reading check                    |

**Core increment for the weekly PR:** 1.2 plus a short architecture note in the
PR reflection. Do not refactor module boundaries this week.

**Stretch:** Sketch where a future submissions module would sit without
implementing it.

**Evidence:** PR reflection names the request path and the owning module.

**Reflection:** Which boundary would you be most likely to break, and why?

## Week 2 — State and data modeling

**Outcome:** Read and extend the Prisma contract without leaking `@prisma/client`
types into application code.

**Prerequisites:** Week 1. Schema literacy from `prisma/schema.prisma`.

**Entry points:** `prisma/schema.prisma`, `src/domain/models.ts`,
`src/modules/catalog/catalog.repository.ts`, ADR 0002.

| Order | Small task                                                                                 | Observable behavior                              | Focused check                     |
| ----- | ------------------------------------------------------------------------------------------ | ------------------------------------------------ | --------------------------------- |
| 2.1   | Trace Product → Engagement → Assignment relations                                          | Drawn or listed relation path                    | Schema review                     |
| 2.2   | Add or adjust a domain field that already exists in schema and expose it in a catalog read | Response includes the field                      | One catalog unit or e2e assertion |
| 2.3   | Confirm the client type matches the new read shape                                         | `packages/client/src/index.ts` updated if needed | Type comparison                   |

**Core increment:** 2.2 only. Split a migration and a client bump into 2.3 if
both are required.

**Stretch:** Propose a Submission read model without writing a migration.

**Evidence:** Focused test plus, if the public API changed, a client bump.

**Reflection:** What would leak if a controller imported a Prisma enum?

## Week 3 — Asynchronous data flow

**Outcome:** Follow a GitHub webhook from HTTP accept to a PostgreSQL job.

**Prerequisites:** Week 2. Worker running locally.

**Entry points:** `src/modules/github/github.controller.ts`,
`src/modules/github/github.service.ts`, `src/infrastructure/jobs/job.service.ts`,
`src/worker.ts`, ADR 0005, ADR 0006.

| Order | Small task                                         | Observable behavior                                 | Focused check                   |
| ----- | -------------------------------------------------- | --------------------------------------------------- | ------------------------------- |
| 3.1   | Trace accept → enqueue → claim                     | Named job type and payload                          | Code-reading check              |
| 3.2   | Cover one webhook verifier or enqueue failure path | Failing signature or duplicate delivery is rejected | `yarn test src/modules/github`  |
| 3.3   | Observe the worker claim a queued job              | Delivery moves toward processed                     | Local worker log + database row |

**Core increment:** 3.2. Do not implement full PR snapshot sync this week.

**Stretch:** Document what `processDelivery` still does not persist.

**Evidence:** Focused GitHub module test.

**Reflection:** Why is enqueue-on-accept safer than doing GitHub I/O in the HTTP
request?

## Week 4 — Authentication and authorization

**Outcome:** Prove a route is gated by a session and a capability.

**Prerequisites:** Week 1. Fake identity provider.

**Entry points:** `src/modules/identity/*`, `src/domain/roles.ts`, ADR 0003,
ADR 0004.

| Order | Small task                                                       | Observable behavior                           | Focused check         |
| ----- | ---------------------------------------------------------------- | --------------------------------------------- | --------------------- |
| 4.1   | Sign in through the fake adapter and inspect `/api/v1/auth/me`   | Session cookie and actor payload              | Manual `/me` request  |
| 4.2   | Add or tighten one capability check on an existing catalog route | Unauthorized or forbidden response is correct | One authz test        |
| 4.3   | Logout revokes the session                                       | Later `/me` fails                             | Focused identity test |

**Core increment:** 4.2 only. Capability sets stay identical unless an ADR
changes.

**Stretch:** Explain how Auth0 would replace the fake adapter without changing
the cookie contract.

**Evidence:** Authz test for the single route.

**Reflection:** Where should a new capability be declared so controllers stay
thin?

## Week 5 — Validation and reliability

**Outcome:** Return the shared error envelope and reject invalid input at the
boundary.

**Prerequisites:** Weeks 3–4.

**Entry points:** `src/common/http-exception.filter.ts`, `src/common/errors.ts`,
`src/config/env.ts`.

| Order | Small task                                                       | Observable behavior                       | Focused check                                            |
| ----- | ---------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------- |
| 5.1   | Trigger one `AppError` and confirm the envelope shape            | `{ error: { code, message, requestId } }` | One HTTP test                                            |
| 5.2   | Validate one request or env value with existing Zod/env patterns | Invalid value fails closed                | `yarn test src/config/env.spec.ts` or a new focused spec |
| 5.3   | Add retry or lastError visibility for one failed job path        | Failed job remains retryable              | Job service test                                         |

**Core increment:** 5.1 or 5.2, not both in one PR.

**Stretch:** Propose a webhook payload schema without inventing GitHub fields.

**Evidence:** Test that asserts the envelope or the rejected input.

**Reflection:** What must never leak in `error.message`?

## Week 6 — Testing

**Outcome:** Add the smallest test that would have caught a real regression.

**Prerequisites:** Weeks 4–5. Vitest unit and e2e configs.

**Entry points:** `src/**/*.spec.ts`, `test/app.e2e-spec.ts`, `vitest.config.ts`.

| Order | Small task                                                            | Observable behavior                                     | Focused check                          |
| ----- | --------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| 6.1   | Choose one untested branch in identity, catalog, or github            | Named missing assertion                                 | Review of the gap                      |
| 6.2   | Write one unit test for that branch                                   | Spec fails before the fix or documents current behavior | The new spec file                      |
| 6.3   | Promote a happy-path HTTP check only if the unit test cannot reach it | E2E covers that one path                                | `yarn test:e2e` at the week checkpoint |

**Core increment:** 6.2.

**Stretch:** Convert a manual week-1 request into an e2e assertion.

**Evidence:** The new spec, run in isolation.

**Reflection:** What would a flaky e2e hide that a unit test would show?

## Week 7 — Performance

**Outcome:** Remove one unnecessary query or payload field on a read path.

**Prerequisites:** Week 2 catalog reads.

**Entry points:** `src/modules/catalog/catalog.repository.ts`,
`src/common/pagination.ts`.

| Order | Small task                                                               | Observable behavior                            | Focused check              |
| ----- | ------------------------------------------------------------------------ | ---------------------------------------------- | -------------------------- |
| 7.1   | Count queries or payload fields on one list endpoint                     | Written before/after count                     | Review                     |
| 7.2   | Apply one focused change (select list, pagination use, or dropped field) | Same contract or a documented client bump      | Focused catalog test       |
| 7.3   | Confirm the worker is not polling harder                                 | Claim interval unchanged unless an ADR says so | Code review of `worker.ts` |

**Core increment:** 7.2.

**Stretch:** Identify an N+1 that does not exist yet and write it down.

**Evidence:** Before/after note plus the focused test.

**Reflection:** When is pagination the wrong first optimization?

## Week 8 — Delivery

**Outcome:** Ship one increment that matches CI locally.

**Prerequisites:** All prior weeks. `yarn validate:ci`.

**Entry points:** `.github/workflows/ci.yml`, `Dockerfile`, `render.yaml`,
ADR 0007.

| Order | Small task                                                             | Observable behavior | Focused check      |
| ----- | ---------------------------------------------------------------------- | ------------------- | ------------------ |
| 8.1   | Run `yarn validate` and fix only format/lint/type noise you introduced | Fast loop green     | `yarn validate`    |
| 8.2   | Run `yarn validate:ci` against local Postgres                          | CI-parity green     | `yarn validate:ci` |
| 8.3   | Confirm PR template reflection and client-bump checklist               | Template complete   | Review             |

**Core increment:** 8.2 after a small, already-scoped product change from an
earlier week that was not merged.

**Stretch:** Read the Dockerfile production stage and note why workspaces focus
is not used.

**Evidence:** CI-parity command output summarized in the PR.

**Reflection:** Which check would you trust least without a human review?
