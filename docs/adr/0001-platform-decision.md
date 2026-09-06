# ADR 0001 — NestJS modular monolith on PostgreSQL

## Decision

Use NestJS with separate API and worker processes, Prisma, and PostgreSQL.

## Why

The domain is relational. GitHub webhooks and reconciliation are durable
backend workflows. A modular monolith gives enterprise boundaries without
microservice overhead.

## Notes

The HTTP and worker processes are built with Nest 12 and the Nest CLI. Lint is
oxlint. Tests run on Vitest 4.
