# 16 - Current State

This file is the canonical source of truth for the current implementation state.
If another document conflicts with this file, verify the code/schema/workflows first and update the stale document.

## Project Identity

**Project name:** `AI_Automation_socialMedia`

**Project type:** Working local MVP, preparing for production-ready multi-tenant SaaS.

**Current phase:** Phase 5A planning / documentation cleanup before implementation.

**Main goal:** Convert the local MVP into a production-ready SaaS with authentication, tenant isolation, internal API security, and cloud deployment.

## Current Local Architecture

```text
Next.js Frontend (localhost:3000)
  -> n8n Webhooks (localhost:5678)
  -> MySQL Database (localhost:3306)
  -> Docker Compose
```

Expected local services:

```text
Frontend: http://localhost:3000
n8n:      http://localhost:5678
Adminer:  http://localhost:8080
MySQL:    localhost:3306
```

Local containers:

```text
ai_social_mysql
ai_social_n8n
ai_social_adminer
```

## Target Production Architecture

```text
Vercel Frontend
  -> authenticated API layer / protected n8n calls
  -> Fly.io n8n
  -> Railway MySQL
  -> Upstash Redis
```

Target services:

| Layer | Current | Target |
|---|---|---|
| Frontend | Local Next.js | Vercel |
| Automation/API | Local n8n Docker | Fly.io n8n |
| Database | Local MySQL Docker | Railway MySQL |
| Cache | None | Upstash Redis |
| Auth | None | Clerk |
| Monitoring | None | Sentry + uptime monitor |

## Current Implementation Status

Completed local MVP:

- Customer management
- Brand profile management
- Post draft management
- AI content ideas and caption generation via 9router
- Caption rewrite
- Scheduling simulation
- Approval workflow
- Dashboard summary
- Workflow logs
- Data consistency scripts
- 18 local n8n workflows

Not implemented yet:

- Authentication
- `user_id` tenant isolation in the actual database
- `api_keys` table
- Internal API key validation
- Next.js API proxy layer
- Production deployment
- Redis caching
- Monitoring / CI/CD
- Real social media publishing

## Important Local Files

```text
README.md
AGENTS.md
docs/AGENT_PROJECT_BRIEF.md
docker-compose.yml
docker/mysql/init/001_init.sql
apps/web/src/lib/n8n-client.ts
n8n/workflows/local-active-workflows.json
n8n/workflows/README.md
```

Secrets must not be committed:

```text
.env
.env.local
apps/web/.env.local
*credentials*.json
mysql*.sql
migration-backup/
*.tar.gz
```

## Database State

Main database: `ai_social_saas`

Actual current schema is defined in:

```text
docker/mysql/init/001_init.sql
```

Current tables:

| Table | Purpose | Current tenant isolation |
|---|---|---|
| `customers` | Customer/client records | Missing `user_id` |
| `brand_profiles` | Brand configuration | Missing `user_id` |
| `posts` | Draft/scheduled/reviewed posts | Missing `user_id` |
| `workflow_logs` | Workflow activity logs | Global logs |

Target schema is documented in `docs/06-DATABASE-SCHEMA.md`, but it is not fully implemented yet.

## Frontend State

Frontend location:

```text
apps/web
```

The frontend currently calls n8n webhooks directly through:

```text
apps/web/src/lib/n8n-client.ts
```

Current routes include:

```text
/
/dashboard
/customers
/customers/[id]
/brand-profile
/brand-profiles
/brand-profiles/[id]
/posts
/posts/list
/posts/[id]
/content-planner
/workflow-logs
/scheduled-posts
/schedule-simulator
/approvals
```

Target production frontend changes:

- Add Clerk provider and auth routes
- Protect private routes
- Stop exposing direct n8n webhook URLs to browser code where possible
- Add a server-side API layer or equivalent secure mediation
- Attach authenticated user context to tenant-scoped operations

## n8n State

Local n8n URL:

```text
http://localhost:5678
```

Active workflow export:

```text
n8n/workflows/local-active-workflows.json
```

Current workflow count: 18.

Current workflows include customer, brand profile, post, scheduling, approval, dashboard, logs, and AI content generation flows.

All tenant-scoped workflows still need to be updated for authentication and `user_id` filtering.

## AI Provider

AI workflows use 9router through environment variables:

```text
NINEROUTER_API_KEY
NINEROUTER_API_URL
NINEROUTER_API_MODEL
```

n8n Code nodes require:

```yaml
N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

## Safe Commands

Start local infrastructure:

```powershell
docker compose up -d
```

Stop local infrastructure without deleting volumes:

```powershell
docker compose down
```

Run frontend:

```powershell
npm run dev:web
```

Dangerous command, requires explicit approval:

```powershell
docker compose down -v
```

## Next Immediate Work

Phase 5A: Security Foundation.

Recommended order:

1. Finalize docs/contracts for current vs target behavior
2. Design `user_id` database migration
3. Add Clerk authentication to frontend
4. Add secure server-side request layer or internal API protection
5. Update all n8n workflows for `user_id` validation and filtering
6. Verify tenant isolation before production deployment

## Future Work

After Phase 5A:

- Phase 5B: Production infrastructure deployment
- Phase 5C: Caching, rate limiting, performance
- Phase 5D: Monitoring and CI/CD
- Phase 6: Real social media publishing
- Phase 7: Team workspaces
- Phase 8: Analytics
- Phase 9: Billing
