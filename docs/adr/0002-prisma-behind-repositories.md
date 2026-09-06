# ADR 0002 — Prisma behind repository interfaces

## Decision

Prisma is an infrastructure detail. Application code uses domain models and
repository ports.

## Why

Keeps tests and a future data-access change from leaking persistence types into
business rules.
