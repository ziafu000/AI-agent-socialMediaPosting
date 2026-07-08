# 00 — AI Coding Instructions

## Role

You are helping build a SaaS skeleton for an AI social media automation product.

The user is still learning Docker, GitHub, database design, and full-stack development. Explain changes clearly and avoid unnecessary complexity.

## Main rule

Build in small working milestones. Do not jump to advanced SaaS features before the local skeleton works.

## Current Target

Transform from local MVP to production-ready SaaS:

```text
Phase 5A (Week 1-2): Security Foundation
- Add Clerk authentication
- Implement tenant isolation (user_id in all tables)
- Add API key validation

Phase 5B (Week 3-4): Infrastructure
- Deploy to Railway (MySQL), Fly.io (n8n), Vercel (frontend)
- All free tiers

Phase 5C (Week 5-6): Performance
- Add Upstash Redis caching
- Implement rate limiting

Phase 5D (Week 7-8): Monitoring
- Sentry error tracking
- UptimeRobot monitoring
- GitHub Actions CI/CD
```

**Cost Target:** $0/month for first 1,000 users

## Now In Scope (Production Readiness)

These are now part of the active roadmap:

- ✅ Authentication (Clerk - free tier)
- ✅ Multi-tenancy and data isolation
- ✅ Production deployment (Vercel + Fly.io + Railway - free tiers)
- ✅ API security and rate limiting
- ✅ Caching layer (Upstash Redis - free tier)
- ✅ Monitoring and observability (Sentry + UptimeRobot - free tiers)

## Still Out of Scope

Do not add these unless explicitly requested:

- Payment system (Phase 9)
- Real social media posting (Phase 6)
- Team workspaces (Phase 7)
- Advanced analytics (Phase 8)
- Complex ORM migrations
- Kubernetes or microservices
- Custom backend (keep n8n)

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
