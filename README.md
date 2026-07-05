# AI Social SaaS - Markdown Planning Pack

This folder contains the planning and technical specification documents for the AI social media automation SaaS local MVP.

## Recommended reading order

1. `docs/00-AI-CODING-INSTRUCTIONS.md`
2. `docs/01-PROJECT-OVERVIEW.md`
3. `docs/02-TECH-STACK-VERSIONS.md`
4. `docs/03-REPO-STRUCTURE.md`
5. `docs/04-ENVIRONMENT-CONFIG.md`
6. `docs/05-DOCKER-SETUP.md`
7. `docs/06-DATABASE-SCHEMA.md`
8. `docs/07-N8N-WORKFLOWS.md`
9. `docs/08-FRONTEND-SPEC.md`
10. `docs/09-BACKEND-CONTRACT.md`
11. `docs/10-CODING-CONVENTIONS.md`
12. `docs/11-GIT-WORKFLOW.md`
13. `docs/12-ROADMAP.md`
14. `docs/13-TROUBLESHOOTING.md`
15. `docs/14-AI-PROMPTS.md`
16. `docs/15-LAPTOP-MIGRATION.md`
17. `docs/16-CURRENT-STATE.md`

## Architecture

```text
Next.js Frontend -> n8n Webhooks -> MySQL Database
```

Docker containers:

```text
ai_social_mysql   (port 3306)
ai_social_n8n     (port 5678)
ai_social_adminer (port 8080)
```

Frontend: `http://localhost:3000`

## Completed milestones

- Phase 0 local skeleton
- Phase 1 brand profile management
- Phase 2 post draft management
- Phase 3 AI content generation (via 9router, OpenAI-compatible)
- Phase 4 scheduling simulation
- Phase 4.5 approval workflow
- Dashboard, workflow logs, validation, data consistency

## Current AI status

AI generation (Generate Content Ideas, Generate Caption, Rewrite Caption) is wired to 9router via `this.helpers.httpRequest()` in n8n Code nodes.

Env vars used: `NINEROUTER_API_KEY`, `NINEROUTER_API_URL`, `NINEROUTER_API_MODEL`

Required n8n setting: `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`

## Next milestone

Phase 5 - Real social posting.

## First success condition

```text
Frontend form submit
-> n8n webhook receives request
-> n8n inserts customer into MySQL
-> DBeaver shows the inserted customer
```

Already achieved.
