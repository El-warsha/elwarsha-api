# ADR 0003 — Auth0 identity and NestJS sessions

## Decision

Auth0 is the managed OIDC provider. NestJS owns the callback and issues opaque
HttpOnly cookies backed by PostgreSQL sessions. Tests use a fake identity
adapter. Authorization requests use a short-lived, HttpOnly state cookie, and
callbacks use the configured public `API_ORIGIN`.

## Why

Passwords never enter ElWarsha. Authorization and membership stay in our
database.
