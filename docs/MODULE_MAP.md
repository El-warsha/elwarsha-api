# Module map

Domain concepts map to Nest modules. Status is what the foundation implements,
not the long-term product.

| Domain      | Nest path                 | Owns                                          | Foundation status                                                            |
| ----------- | ------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| Identity    | `src/modules/identity`    | Users, identities, sessions, memberships      | Login, session, `/me`, logout                                                |
| Products    | `src/modules/catalog`     | Long-lived products and upstream repos        | `GET /api/v1/products`                                                       |
| Cohorts     | `src/modules/catalog`     | Time-bounded cohorts                          | Read nested on engagements                                                   |
| Engagements | `src/modules/catalog`     | Cohort-product pairing                        | `GET /api/v1/engagements`                                                    |
| Assignments | `src/modules/catalog`     | Weekly work items                             | `GET /api/v1/assignments`                                                    |
| Submissions | schema only               | Candidate PRs                                 | `Submission` in Prisma; no HTTP module                                       |
| GitHub      | `src/modules/github`      | Webhooks and future PR/review/check snapshots | Signature, persist delivery, enqueue. `processDelivery` marks processed only |
| Jobs        | `src/infrastructure/jobs` | Durable worker queue                          | Enqueue, claim, complete, retry                                              |
| Health      | `src/modules/health`      | Liveness and readiness                        | `healthz`, `readyz`                                                          |

Shared authorization exports (`AuthGuard`, `RequireCapability`) live in
identity and are the only allowed cross-module imports.
