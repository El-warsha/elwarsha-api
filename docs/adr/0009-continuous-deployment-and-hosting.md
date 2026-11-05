# ADR 0009 — Continuous deployment and co-located worker architecture

## Decision

Adopt a cost-free, automated Continuous Deployment (CD) and hosting architecture for the ElWarsha backend services:

1. **Persistent Relational Persistence**:
   - Host the PostgreSQL database on [Neon](https://neon.tech) Serverless PostgreSQL rather than platform-managed ephemeral databases that delete data after 30 days.
   - Use Neon's pooled connection endpoint (`sslmode=require&channel_binding=require`) for Prisma connection pooling.

2. **Unified Single-Container Compute Execution**:
   - Co-locate the HTTP API (`dist/main.js`) and the background worker (`dist/worker.js`) inside a single production container using `CMD ["sh", "-c", "node dist/worker.js & node dist/main.js"]`.
   - Both processes share identical dependencies, codebase assets, and Prisma connections while operating on separate concerns (inbound HTTP on port 3001/`PORT` vs polling `Job` table with skip-locked leases).
   - This eliminates the need for a separate paid worker instance tier on container PaaS (e.g., Render or Koyeb) while fully preserving asynchronous webhook and background reconciliation capabilities.

3. **Optimized Docker Build Packaging**:
   - Remove `.yarn` directory copies from the Docker build context. Yarn 4 with `node-modules` linker installs dependencies via `corepack enable`, `package.json`, `yarn.lock`, and `.yarnrc.yml` directly without relying on uncommitted cache artifacts.

4. **Continuous Deployment Pipeline**:
   - Continuous deployment triggers automatically on pushes to `main` (and `cd-setup`).
   - The deployment workflow verifies tests (`yarn validate:ci`), executes Prisma database schema migrations (`yarn prisma:deploy`), and triggers container redeployment via an authenticated Deploy Hook.

## Why

1. **Sustainability on Free Tiers**: Combining API and worker processes into a single 512MB RAM container keeps the platform 100% operational on permanent free tiers without incurring subscription costs for separate background workers or databases.
2. **Persistence Integrity**: External serverless PostgreSQL guarantees that student cohorts, applications, and task submissions are never wiped by 30-day trial limitations.
3. **Migration Safety**: Running `prisma migrate deploy` prior to updating the running container prevents schema mismatches between API code and database structure.

## Notes

- In production (`NODE_ENV=production`), `API_ORIGIN` and `WEB_ORIGIN` environment variables are strictly enforced by `loadEnv` to maintain CORS boundaries and OAuth callback validation.
- If workload scales or background processing throughput exceeds single-node capacity, the entrypoint can be decoupled back into separate web and worker services by configuring dedicated service commands in `render.yaml`.
