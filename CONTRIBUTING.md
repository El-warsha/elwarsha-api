# Contributing

1. Create a focused branch from your fork. One assignment increment per PR.
2. For cohort work, follow [`docs/LEARNING.md`](docs/LEARNING.md): attempt first
   (Coach), then agree on a small Pair increment. Maintainer implementation
   requests skip coaching.
3. Keep Prisma types inside `src/infrastructure`. Other modules may import only
   `AuthGuard` and `RequireCapability` from identity.
4. Add or update tests for authorization, jobs, and contract changes. Run the
   task-named command after each increment, `yarn validate` at a week
   checkpoint, and `yarn validate:ci` before a qualifying PR.
5. If the public API changes, bump `@elwarsha/api-client` and tell
   `ElWarsha-web` to pin the new version.
6. Complete the PR learning reflection. Reviewers and required checks decide
   eligibility.
7. Do not commit `.env`, secrets, applicant CSVs, or `.learning/`.
