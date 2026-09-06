# ElWarsha API

NestJS modular monolith for the ElWarsha platform. This repository is the source
of truth for identity sessions, authorization, catalog reads, GitHub webhook
ingestion, and PostgreSQL-backed jobs.

The frontend lives in the sibling [`ElWarsha-web`](../ElWarsha-web) repository
and pins `@elwarsha/api-client@0.1.0`.

This repo is also the eight-week backend training product. AI coaches first,
then pair-programs in small increments. See [`docs/LEARNING.md`](docs/LEARNING.md).

## Docs

- [`AGENTS.md`](AGENTS.md) — implementation and agent rules
- [`docs/LEARNING.md`](docs/LEARNING.md) — Coach / Pair / Ship contract
- [`docs/CURRICULUM.md`](docs/CURRICULUM.md) — eight-week small-task sequence
- [`docs/templates/LEARNING_TAKEAWAY.md`](docs/templates/LEARNING_TAKEAWAY.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/MODULE_MAP.md`](docs/MODULE_MAP.md)
- [`docs/adr/`](docs/adr/) — decisions

## Local setup

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

In a second terminal:

```bash
yarn start:dev:worker
```

API: `http://localhost:3001`  
OpenAPI: `http://localhost:3001/api/docs`

The default identity provider is the fake adapter. Sign-in through
`/api/v1/auth/login` creates a session for the seeded participant.

## Scripts

| Command                 | Purpose                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `yarn start:dev`        | API watch mode                                                  |
| `yarn start:dev:worker` | Job worker                                                      |
| `yarn validate`         | Fast loop: format, lint, typecheck, generate, unit tests, build |
| `yarn validate:ci`      | CI parity; needs Postgres                                       |
| `yarn test`             | Unit tests                                                      |
| `yarn test:e2e`         | HTTP e2e tests                                                  |
| `yarn prisma:migrate`   | Create a developer migration                                    |
| `yarn client:build`     | Snapshot the versioned TypeScript client                        |

Each small learning task names one focused test command. Use `yarn validate`
at a week checkpoint and `yarn validate:ci` before a qualifying PR.

## Applicant data

Do not commit spreadsheets, form exports, or other personal data. `*.csv` is
ignored. Local learning journals in `.learning/` are also ignored.
