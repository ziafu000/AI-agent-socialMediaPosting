# AI Social SaaS — Markdown Planning Pack

This folder contains the planning and technical specification documents for the first local skeleton of the AI social media automation SaaS.

The goal is to give an AI coding assistant enough context to help build the project consistently.

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

## Project goal

Build a local development skeleton with:

- GitHub repository
- Docker Compose
- n8n local on Docker
- MySQL database on Docker
- DBeaver database management
- Basic Next.js frontend
- Frontend calls n8n webhook
- n8n writes customer data into MySQL

## First success condition

The MVP skeleton is successful when:

```text
Frontend form submit
→ n8n webhook receives request
→ n8n inserts customer into MySQL
→ DBeaver shows the inserted customer
```

## Current local status

Implemented:

- Phase 0 local skeleton
- Brand profile management
- Post draft management
- Content planning without AI
- Scheduling simulation
- Workflow logs
- Customers list and detail
- Dashboard summary
- Dashboard polish
- Validation and error handling
- Data consistency cleanup

Validation and error handling currently includes:

- frontend payload validation before calling n8n
- standardized error shape: `{ success: false, message, error }`
- n8n validation gates on create and update workflows
- exported local n8n workflows tracked in `n8n/workflows/`

Data consistency cleanup currently includes:

- duplicate-safe save behavior for brand profiles
- duplicate-safe create behavior for identical post drafts
- not-found error response on update workflows
- local audit script: `npm run data:consistency:report`
