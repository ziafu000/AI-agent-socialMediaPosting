# 04 - Environment Configuration

## Overview

The project uses different environment configurations for local development and production deployment.

**Local Development:** Docker Compose with `.env` files  
**Production:** Cloud services (Railway, Fly.io, Vercel) with secrets management

---

## Local Development Configuration

### Root .env

File path: `.env`

Purpose: Configure local Docker services and AI provider credentials.

**Content:**

```env
# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=ai_social_saas
MYSQL_USER=ai_social_user
MYSQL_PASSWORD=ai_social_password
MYSQL_PORT=3306

# n8n
N8N_PORT=5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
N8N_ENCRYPTION_KEY=replace_with_a_long_random_string

# 9router AI
NINEROUTER_API_KEY=replace_with_9router_api_key
NINEROUTER_API_URL=http://host.docker.internal:<port>/v1/chat/completions
NINEROUTER_API_MODEL=replace_with_model_name
```

**Important networking rule for AI URL:**

From inside n8n Docker container, use `host.docker.internal` instead of `localhost`.

Example:
```env
NINEROUTER_API_URL=http://host.docker.internal:20128/v1/chat/completions
```

**Important for Docker setup:**

`docker-compose.yml` sets `N8N_USER_FOLDER=/home/node` to store n8n data in the mounted volume at `/home/node/.n8n`. Keep this setting when recreating containers.

### Frontend .env.local

File path: `apps/web/.env.local`

Purpose: Configure frontend API endpoints for local development.

**Content (Local Development):**

```env
# n8n Webhook URLs (Local)
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=http://localhost:5678/webhook/create-customer
NEXT_PUBLIC_N8N_LIST_CUSTOMERS_WEBHOOK_URL=http://localhost:5678/webhook/list-customers
NEXT_PUBLIC_N8N_GET_CUSTOMER_DETAIL_WEBHOOK_URL=http://localhost:5678/webhook/get-customer-detail
NEXT_PUBLIC_N8N_SAVE_BRAND_PROFILE_WEBHOOK_URL=http://localhost:5678/webhook/save-brand-profile
NEXT_PUBLIC_N8N_LIST_BRAND_PROFILES_WEBHOOK_URL=http://localhost:5678/webhook/list-brand-profiles
NEXT_PUBLIC_N8N_UPDATE_BRAND_PROFILE_WEBHOOK_URL=http://localhost:5678/webhook/update-brand-profile
NEXT_PUBLIC_N8N_CREATE_POST_WEBHOOK_URL=http://localhost:5678/webhook/create-post
NEXT_PUBLIC_N8N_UPDATE_POST_WEBHOOK_URL=http://localhost:5678/webhook/update-post
NEXT_PUBLIC_N8N_SCHEDULE_POST_WEBHOOK_URL=http://localhost:5678/webhook/schedule-post
NEXT_PUBLIC_N8N_REVIEW_POST_WEBHOOK_URL=http://localhost:5678/webhook/review-post
NEXT_PUBLIC_N8N_LIST_POSTS_WEBHOOK_URL=http://localhost:5678/webhook/list-posts
NEXT_PUBLIC_N8N_LIST_SCHEDULED_POSTS_WEBHOOK_URL=http://localhost:5678/webhook/list-scheduled-posts
NEXT_PUBLIC_N8N_LIST_WORKFLOW_LOGS_WEBHOOK_URL=http://localhost:5678/webhook/list-workflow-logs
NEXT_PUBLIC_N8N_GENERATE_CONTENT_IDEAS_WEBHOOK_URL=http://localhost:5678/webhook/generate-content-ideas
NEXT_PUBLIC_N8N_GENERATE_CAPTION_WEBHOOK_URL=http://localhost:5678/webhook/generate-caption
NEXT_PUBLIC_N8N_REWRITE_CAPTION_WEBHOOK_URL=http://localhost:5678/webhook/rewrite-caption
NEXT_PUBLIC_N8N_RUN_SCHEDULE_SIMULATION_WEBHOOK_URL=http://localhost:5678/webhook/run-schedule-simulation
NEXT_PUBLIC_N8N_DASHBOARD_SUMMARY_WEBHOOK_URL=http://localhost:5678/webhook/dashboard-summary
```

⚠️ **Do not use `/webhook-test/` paths for normal app runtime** - these only work when n8n is in test mode.

---

## Production Configuration

### Production Environment Variables (Vercel Frontend)

Configure in Vercel Dashboard → Settings → Environment Variables:

```env
# Clerk Authentication (FREE tier - 10k MAU)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# n8n Webhook URLs (Production - Fly.io)
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/create-customer
NEXT_PUBLIC_N8N_LIST_CUSTOMERS_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/list-customers
NEXT_PUBLIC_N8N_GET_CUSTOMER_DETAIL_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/get-customer-detail
NEXT_PUBLIC_N8N_SAVE_BRAND_PROFILE_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/save-brand-profile
NEXT_PUBLIC_N8N_LIST_BRAND_PROFILES_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/list-brand-profiles
NEXT_PUBLIC_N8N_UPDATE_BRAND_PROFILE_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/update-brand-profile
NEXT_PUBLIC_N8N_CREATE_POST_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/create-post
NEXT_PUBLIC_N8N_UPDATE_POST_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/update-post
NEXT_PUBLIC_N8N_SCHEDULE_POST_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/schedule-post
NEXT_PUBLIC_N8N_REVIEW_POST_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/review-post
NEXT_PUBLIC_N8N_LIST_POSTS_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/list-posts
NEXT_PUBLIC_N8N_LIST_SCHEDULED_POSTS_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/list-scheduled-posts
NEXT_PUBLIC_N8N_LIST_WORKFLOW_LOGS_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/list-workflow-logs
NEXT_PUBLIC_N8N_GENERATE_CONTENT_IDEAS_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/generate-content-ideas
NEXT_PUBLIC_N8N_GENERATE_CAPTION_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/generate-caption
NEXT_PUBLIC_N8N_REWRITE_CAPTION_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/rewrite-caption
NEXT_PUBLIC_N8N_RUN_SCHEDULE_SIMULATION_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/run-schedule-simulation
NEXT_PUBLIC_N8N_DASHBOARD_SUMMARY_WEBHOOK_URL=https://your-app-name.fly.dev/webhook/dashboard-summary

# Upstash Redis (FREE tier - caching)
UPSTASH_REDIS_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_TOKEN=xxxxx

# Sentry (FREE tier - error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o1234567.ingest.sentry.io/1234567
SENTRY_AUTH_TOKEN=xxxxx

# BetterStack (FREE tier - logging)
BETTERSTACK_SOURCE_URL=https://in.logs.betterstack.com/xxxxx
```

### Production Secrets (Fly.io n8n)

Configure via `fly secrets set`:

```bash
# Critical: Use SAME encryption key as local!
fly secrets set N8N_ENCRYPTION_KEY="your_exact_local_encryption_key_here"

# Basic Auth for n8n UI
fly secrets set N8N_BASIC_AUTH_USER="admin"
fly secrets set N8N_BASIC_AUTH_PASSWORD="strong_password_here"

# AI Provider
fly secrets set NINEROUTER_API_KEY="your_api_key"
fly secrets set NINEROUTER_API_URL="your_api_url"
fly secrets set NINEROUTER_API_MODEL="your_model"
```

### Production Database (Railway MySQL)

Railway provides connection details in dashboard:

```env
MYSQL_HOST=containers-xxx.railway.app
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=xxxxx
MYSQL_DATABASE=railway
```

**Connection String Format:**
```
mysql://root:password@containers-xxx.railway.app:3306/railway
```

---

## Environment Naming Convention

Frontend public variables must start with:

```text
NEXT_PUBLIC_
```

Backend-only secrets must NOT start with `NEXT_PUBLIC_`.

---

## Security Rules

### Never Commit:
- `.env`
- `.env.local`
- `apps/web/.env.local`
- Real passwords
- Real API keys
- n8n encryption key

### Always Commit:
- `.env.example`
- `.env.local.example`
- Documentation
- Placeholder values only

---

## n8n Encryption Key (CRITICAL)

⚠️ **Use a stable `N8N_ENCRYPTION_KEY` once credentials are created.**

If the key changes after credentials are saved, n8n may not be able to decrypt existing credentials.

When migrating local → production:
1. Copy exact key from local `.env`
2. Set same key in Fly.io secrets
3. Verify credentials decrypt after deployment

---

## Free Tier Service Limits

| Service | Free Tier | Production URL Pattern |
|---------|-----------|------------------------|
| **Clerk** | 10,000 MAU | clerk.com dashboard |
| **Railway MySQL** | 512MB RAM, 1GB storage | containers-xxx.railway.app:3306 |
| **Fly.io** | 3 VMs, 256MB RAM each | your-app.fly.dev |
| **Vercel** | Unlimited deploys, 100GB bandwidth | your-project.vercel.app |
| **Upstash Redis** | 10,000 commands/day | xxxxx.upstash.io |
| **Sentry** | 5,000 errors/month | sentry.io/organizations/xxx |
| **BetterStack** | 1GB logs/month | logs.betterstack.com |
| **UptimeRobot** | 50 monitors | uptimerobot.com |

**Total Cost:** $0/month for first 1,000 users

---

## Environment File Templates

### .env.example (Root)

```env
# MySQL
MYSQL_ROOT_PASSWORD=changeme
MYSQL_DATABASE=ai_social_saas
MYSQL_USER=ai_social_user
MYSQL_PASSWORD=changeme
MYSQL_PORT=3306

# n8n
N8N_PORT=5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=changeme
N8N_ENCRYPTION_KEY=generate_a_long_random_string_here

# AI Provider
NINEROUTER_API_KEY=your_api_key_here
NINEROUTER_API_URL=http://host.docker.internal:port/v1/chat/completions
NINEROUTER_API_MODEL=your_model_here
```

### apps/web/.env.local.example

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_or_live_xxxxx
CLERK_SECRET_KEY=sk_test_or_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# n8n Webhooks (change localhost to production URL when deployed)
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=http://localhost:5678/webhook/create-customer
# ... rest of webhook URLs
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All local `.env` values documented
- [ ] Production secrets set in respective services
- [ ] Same `N8N_ENCRYPTION_KEY` used in production
- [ ] All webhook URLs updated to production domains
- [ ] Clerk production keys obtained
- [ ] Database connection string tested
- [ ] No secrets committed to git

See [21-DEPLOYMENT-GUIDE.md](21-DEPLOYMENT-GUIDE.md) for full deployment instructions.

This makes n8n store workflow and credential data in the mounted n8n_data
volume at /home/node/.n8n. Keep this setting when recreating the n8n
container, otherwise workflows and credentials may appear missing after
docker compose up -d --force-recreate n8n.

## Frontend .env.local

File path:

```text
apps/web/.env.local
```

Content uses production webhook URLs:

```env
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=http://localhost:5678/webhook/create-customer
NEXT_PUBLIC_N8N_LIST_CUSTOMERS_WEBHOOK_URL=http://localhost:5678/webhook/list-customers
NEXT_PUBLIC_N8N_DASHBOARD_SUMMARY_WEBHOOK_URL=http://localhost:5678/webhook/dashboard-summary
NEXT_PUBLIC_N8N_GENERATE_CAPTION_WEBHOOK_URL=http://localhost:5678/webhook/generate-caption
NEXT_PUBLIC_N8N_REWRITE_CAPTION_WEBHOOK_URL=http://localhost:5678/webhook/rewrite-caption
```

Do not use /webhook-test/ paths for normal app runtime.

## Environment naming rule

Frontend public variables must start with:

```text
NEXT_PUBLIC_
```

Backend-only secrets must not start with NEXT_PUBLIC_.

## Security rules

Never commit:

- .env
- .env.local
- Real passwords
- Real API keys
- n8n encryption key

Commit:

- .env.example
- Documentation
- Placeholder values only

## n8n encryption key

Use a stable N8N_ENCRYPTION_KEY in local development once credentials are created.

If the key changes after credentials are saved, n8n may not be able to decrypt existing credentials.
