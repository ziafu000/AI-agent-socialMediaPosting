# 00 — AI Coding Instructions

## Role

You are helping build a SaaS skeleton for an AI social media automation product.

The user is still learning Docker, GitHub, database design, and full-stack development. Explain changes clearly and avoid unnecessary complexity.

## Main rule

Build in small working milestones. Do not jump to advanced SaaS features before the local skeleton works.

## Current target

Create a local development project where:

```text
Next.js frontend
→ calls n8n webhook
→ n8n inserts customer data
→ MySQL stores data
→ DBeaver can inspect the data
```

## Do not add yet

Do not add these unless explicitly requested:

- Payment system
- Authentication
- OpenAI API integration
- Social media posting API
- Kubernetes
- Production deployment
- Advanced analytics
- Multi-role permission system
- Complex ORM migrations
- Microservices

## Preferred implementation style

Use simple, readable code.

Prefer:

- Clear folder names
- Explicit environment variables
- Simple SQL first
- Direct API contracts
- Small components
- Step-by-step setup

Avoid:

- Over-engineering
- Hidden magic
- Unexplained abstractions
- Adding many libraries without reason

## Output format when coding

When modifying or creating files, always show:

1. File path
2. Full file content or exact patch
3. Command to run
4. Expected result
5. How to verify

Example:

```text
File: apps/web/src/app/page.tsx
Purpose: Basic customer form that calls n8n webhook.
```

## Naming convention

Use the project name:

```text
ai-social-saas
```

Use container names:

```text
ai_social_mysql
ai_social_n8n
ai_social_adminer
```

Use Docker network name:

```text
ai_social_network
```

## Development principle

Every milestone must be testable.

Bad:

```text
Let's build the whole SaaS.
```

Good:

```text
Let's first make the frontend submit data to n8n and confirm the row appears in MySQL.
```
