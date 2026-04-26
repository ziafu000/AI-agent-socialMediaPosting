# 14 — AI Prompts for Coding Assistant

## Prompt 1 — Build local skeleton

```text
You are helping me build the local skeleton for an AI social media SaaS.

Read these docs first:
- README.md
- docs/00-AI-CODING-INSTRUCTIONS.md
- docs/01-PROJECT-OVERVIEW.md
- docs/02-TECH-STACK-VERSIONS.md
- docs/03-REPO-STRUCTURE.md
- docs/04-ENVIRONMENT-CONFIG.md
- docs/05-DOCKER-SETUP.md
- docs/06-DATABASE-SCHEMA.md
- docs/07-N8N-WORKFLOWS.md
- docs/08-FRONTEND-SPEC.md
- docs/09-BACKEND-CONTRACT.md
- docs/10-CODING-CONVENTIONS.md

Your task: help me create the project files step by step.

Do not add auth, payment, OpenAI, or social posting yet.
The first goal is:
Frontend form → n8n webhook → MySQL insert → verify in DBeaver.

For every step, show:
1. File path
2. Full file content or exact patch
3. Command to run
4. Expected result
5. How to verify
```

## Prompt 2 — Debug Docker setup

```text
I am building the local skeleton from these docs.
Docker Compose is not working.

Please debug step by step.
Ask me for command output only when necessary.
Prioritize these checks:
- docker ps
- docker compose logs
- .env values
- port conflicts
- container names
- Docker network
- MySQL initialization
- n8n startup logs

Do not rewrite the whole project. Fix the smallest issue first.
```

## Prompt 3 — Build frontend customer form

```text
Using the project docs, help me build the first Next.js page.

Goal:
Create a customer form with fields:
- name
- email
- company_name
- industry

On submit, send POST request to:
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL

Show loading, success, and error state.
Use TypeScript and Tailwind.
Do not add a component library yet.
```

## Prompt 4 — Build n8n create customer workflow

```text
Using the project docs, guide me to create the n8n workflow named Create Customer.

Workflow:
Webhook Trigger → MySQL Execute Query → Respond to Webhook

Use:
- POST /create-customer
- MySQL host inside n8n: mysql
- Database: ai_social_saas
- User: ai_social_user

Give me exact node settings and SQL query.
```

## Prompt 5 — Add brand profile next

```text
Now the customer form works.
Help me implement the next milestone: brand profile.

Goal:
Frontend brand profile form → n8n webhook → MySQL insert/update into brand_profiles.

Follow the existing conventions.
Do not add auth yet.
```
