# ADR 0006 — PostgreSQL-backed jobs

## Decision

Webhooks and reconciliation use a `Job` table. Claims use PostgreSQL row
locking with skip-locked semantics, and stale processing leases become
claimable again. No Redis in the foundation.

## Why

The workload is modest. One managed database is enough for durability,
concurrency-safe claims, and crash recovery.
