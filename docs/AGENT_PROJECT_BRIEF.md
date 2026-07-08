# Agent Project Brief

## Project

AI Social SaaS: local MVP for AI-powered social media automation, moving toward production-ready multi-tenant SaaS.

## Current Architecture

```text
Next.js frontend -> n8n webhooks -> MySQL -> Docker Compose
```

The current system is local-MVP first. Production docs describe the target unless explicitly marked current.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind
- Automation/API: n8n webhooks
- Database: MySQL 8.4
- AI provider: 9router using `NINEROUTER_*` environment variables
- Local runtime: Docker Compose

## Actual Current State

- Frontend directly calls n8n webhook URLs from `apps/web/src/lib/n8n-client.ts`.
- Actual database schema is in `docker/mysql/init/001_init.sql`.
- Current database tables: `customers`, `brand_profiles`, `posts`, `workflow_logs`.
- No authentication is implemented yet.
- No `user_id` tenant isolation is implemented yet.
- No `api_keys` table is implemented yet.
- No production deployment is implemented yet.
- Real social platform publishing is not implemented yet.

## Canonical Docs

Read these first, in order:

1. `README.md` - overview and documentation index
2. `docs/16-CURRENT-STATE.md` - canonical current state
3. `docs/12-ROADMAP.md` - canonical implementation order
4. `docs/06-DATABASE-SCHEMA.md` - current schema vs target schema
5. `docs/08-FRONTEND-SPEC.md` - current frontend vs Phase 5A target
6. `docs/09-BACKEND-CONTRACT.md` - current n8n contract vs Phase 5A target

Implementation source checks:
- `apps/web/src/lib/n8n-client.ts`
- `docker/mysql/init/001_init.sql`
- `n8n/workflows/README.md`
- `docker-compose.yml`
- root `package.json`

## Current Priority

Next recommended milestone: Phase 5A Security Foundation.

Do this before production deployment or real social media API integration:

1. Design safe `user_id` database migration.
2. Add Clerk authentication.
3. Add protected Next.js server API routes.
4. Add internal auth between Next.js and n8n.
5. Update n8n workflows to require trusted `user_id`.
6. Scope all tenant data queries by `user_id`.
7. Verify tenant isolation with at least two users.

## Target Production Direction

Target architecture:

```text
Vercel frontend -> protected server API -> Fly.io n8n -> Railway MySQL -> Upstash Redis
```

Target production capabilities:
- Authenticated users
- Tenant-isolated customer/brand/post data
- Internal API protection for n8n
- Production hosting
- Monitoring and backups

## Agent Rules For This Repo

- Treat current docs as intentionally split between current and target state.
- Do not assume target docs are implemented until code/schema confirm it.
- Do not delete files or reset data without explicit user approval.
- For docs changes, sync related roadmap/current-state/schema/frontend/backend docs together.
- Keep changes scoped and avoid unrelated refactors.
- Be careful with `.env`; it may contain secrets and should not be committed.
