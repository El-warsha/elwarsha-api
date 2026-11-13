# Module map

Domain concepts map to Nest modules. Status is what the foundation implements,
not the long-term product.

| Domain      | Nest path                 | Owns                                          | Foundation status                                                                |
| ----------- | ------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| Identity    | `src/modules/identity`    | Users, identities, sessions, memberships      | Login, session, `/me`, logout                                                    |
| Products    | `src/modules/catalog`     | Long-lived products and upstream repos        | `GET /api/v1/products`                                                           |
| Cohorts     | `src/modules/catalog`     | Time-bounded cohorts                          | Read nested on engagements                                                       |
| Engagements | `src/modules/catalog`     | Cohort-product pairing                        | `GET /api/v1/engagements`                                                        |
| Assignments | `src/modules/tasks`       | Weekly work items                             | `GET /api/v1/assignments`                                                        |
| Labels      | schema only               | Tags on assignments                           | `Label` and `AssignmentLabel` in Prisma; no HTTP module                          |
| Submissions | `src/modules/submissions` | Runtime PR reconciliation and snapshots       | `GET /api/v1/cohorts/:slug/assignments/:week/submissions`                        |
| GitHub      | `src/modules/github`      | Webhooks and future PR/review/check snapshots | Signature, persist delivery, enqueue. `HttpGithubAppClient` reads repository PRs |
| Jobs        | `src/infrastructure/jobs` | Durable worker queue                          | Enqueue, claim, complete, retry                                                  |
| Health      | `src/modules/health`      | Liveness and readiness                        | `healthz`, `readyz`                                                              |

Shared authorization exports (`AuthGuard`, `RequireCapability`) live in
identity and are the only identity symbols other modules may import.
`TasksModule` exports `TasksService`. Do not import `tasks.repository.ts` from
another module.
