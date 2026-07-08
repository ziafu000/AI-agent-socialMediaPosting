# AI Social SaaS

**Status:** Working local MVP, preparing for production-ready multi-tenant SaaS.

This project is an AI-powered social media automation platform. The current system runs locally with a Next.js frontend, n8n webhooks, and MySQL in Docker. Production docs describe the target direction, not the implemented state unless explicitly marked current.

## Current Mission

Stabilize the documentation and then implement the production readiness foundation:

1. Authentication
2. Tenant isolation
3. Internal API security
4. Production deployment

## Documentation Index

### Read First
1. [AGENT_PROJECT_BRIEF.md](docs/AGENT_PROJECT_BRIEF.md) - Short context for coding agents
2. [16-CURRENT-STATE.md](docs/16-CURRENT-STATE.md) - Canonical current state
3. [12-ROADMAP.md](docs/12-ROADMAP.md) - Canonical roadmap

### Production Readiness
4. [18-PRODUCTION-READINESS-ROADMAP.md](docs/18-PRODUCTION-READINESS-ROADMAP.md) - Detailed production plan
5. [19-AUTHENTICATION-IMPLEMENTATION.md](docs/19-AUTHENTICATION-IMPLEMENTATION.md) - Auth implementation guide
6. [20-PRODUCTION-CHECKLIST.md](docs/20-PRODUCTION-CHECKLIST.md) - Verification checklist
7. [21-DEPLOYMENT-GUIDE.md](docs/21-DEPLOYMENT-GUIDE.md) - Deployment guide

### Technical Reference
8. [02-TECH-STACK-VERSIONS.md](docs/02-TECH-STACK-VERSIONS.md)
9. [03-REPO-STRUCTURE.md](docs/03-REPO-STRUCTURE.md)
10. [04-ENVIRONMENT-CONFIG.md](docs/04-ENVIRONMENT-CONFIG.md)
11. [05-DOCKER-SETUP.md](docs/05-DOCKER-SETUP.md)
12. [06-DATABASE-SCHEMA.md](docs/06-DATABASE-SCHEMA.md)
13. [07-N8N-WORKFLOWS.md](docs/07-N8N-WORKFLOWS.md)
14. [08-FRONTEND-SPEC.md](docs/08-FRONTEND-SPEC.md)
15. [09-BACKEND-CONTRACT.md](docs/09-BACKEND-CONTRACT.md)
16. [10-CODING-CONVENTIONS.md](docs/10-CODING-CONVENTIONS.md)
17. [11-GIT-WORKFLOW.md](docs/11-GIT-WORKFLOW.md)
18. [13-TROUBLESHOOTING.md](docs/13-TROUBLESHOOTING.md)
19. [15-LAPTOP-MIGRATION.md](docs/15-LAPTOP-MIGRATION.md)

## Current Architecture

```text
Next.js Frontend (localhost:3000)
  -> n8n Webhooks (localhost:5678)
  -> MySQL Database (localhost:3306)
  -> Docker Compose
```

## Target Production Architecture

```text
Vercel Frontend
  -> authenticated API layer / protected n8n calls
  -> Fly.io n8n
  -> Railway MySQL
  -> Upstash Redis
```

## Completed Local MVP Milestones

- Phase 0: Local skeleton
- Phase 1: Brand profile management
- Phase 2: Post draft management
- Phase 3: AI content generation via 9router
- Phase 4: Scheduling simulation
- Phase 4.5: Approval workflow
- Dashboard, workflow logs, validation, data consistency scripts

## Current Limitations

- No authentication yet
- No `user_id` tenant isolation in the actual database yet
- No `api_keys` table yet
- Frontend still calls n8n webhook URLs directly
- Production deployment is not implemented yet
- Some older docs may describe target behavior; verify against code and schema

## Next Milestone

Phase 5A: Security Foundation.

- Clerk authentication
- Add `user_id` schema migration
- Add internal API key validation
- Update frontend request flow
- Update n8n workflows to filter by `user_id`

## Quick Start

```bash
npm run docker:up
npm run dev:web
```

Access:

- Frontend: http://localhost:3000
- n8n: http://localhost:5678
- MySQL: localhost:3306

## Safety Notes

Do not commit secrets from `.env` or `apps/web/.env.local`.
Do not run destructive Docker or database commands without explicit approval.
