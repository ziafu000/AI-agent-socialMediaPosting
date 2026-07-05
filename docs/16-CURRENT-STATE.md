# 16 - Current State

## 1. Project Identity

**Project name:** `AI_Automation_socialMedia`

**Project type:** Local MVP for an AI Social Media Automation SaaS.

**Main goal:**
Build a working internal/local system where a frontend collects customer/brand/post data, sends it to n8n webhooks, stores/manages data in MySQL, and generates AI content via an OpenAI-compatible API.

This project is **not a new project**. It already has source code, docs, Docker setup, MySQL schema/data, n8n workflows, and a Next.js frontend.

---

## 2. Current Architecture

```text
Next.js Frontend
        ↓
n8n Webhooks
        ↓
MySQL Database
```

| Layer | Role |
|---|---|
| **Next.js frontend** | UI pages, forms, dashboard, customer/post/brand profile views |
| **n8n** | Backend automation layer, webhook handlers, workflow logic, AI API calls |
| **MySQL** | Stores customers, brand profiles, posts, workflow logs |
| **Docker Compose** | Runs MySQL, n8n, and Adminer locally |
| **DBeaver/Adminer** | Inspect and verify database data |

---

## 3. Runtime Containers

Expected Docker containers:

```text
ai_social_mysql
ai_social_n8n
ai_social_adminer
```

Expected local URLs:

```text
Frontend: http://localhost:3000
n8n:      http://localhost:5678
Adminer:  http://localhost:8080
```

Safe start command:

```powershell
docker compose up -d
```

Safe stop command:

```powershell
docker compose down
```

Danger command (deletes all volume data):

```powershell
docker compose down -v
```

---

## 4. Important Local Files

```text
.env
apps/web/.env.local
docker-compose.yml
docker/mysql/init/001_init.sql
n8n/workflows/local-active-workflows.json
docs/
```

Files that must not be committed:

```text
.env
.env.local
apps/web/.env.local
migration-backup/
*.tar.gz
*credentials*.json
mysql*.sql
```

---

## 5. Environment Variables

Root `.env` keys:

```text
MYSQL_ROOT_PASSWORD
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
MYSQL_PORT

N8N_PORT
N8N_BASIC_AUTH_USER
N8N_BASIC_AUTH_PASSWORD
N8N_ENCRYPTION_KEY

NINEROUTER_API_KEY
NINEROUTER_API_URL
NINEROUTER_API_MODEL
```

`apps/web/.env.local` keys (webhook URLs):

```text
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL
NEXT_PUBLIC_N8N_LIST_CUSTOMERS_WEBHOOK_URL
NEXT_PUBLIC_N8N_DASHBOARD_SUMMARY_WEBHOOK_URL
NEXT_PUBLIC_N8N_GENERATE_CAPTION_WEBHOOK_URL
NEXT_PUBLIC_N8N_REWRITE_CAPTION_WEBHOOK_URL
```

`N8N_ENCRYPTION_KEY` is critical. Keep the same key when restoring n8n data.

`NINEROUTER_API_URL` must use `host.docker.internal` (not `localhost`) when the AI service runs on the host machine.

---

## 6. Database State

Main database: `ai_social_saas`

| Table | Purpose |
|---|---|
| `customers` | Stores customer/client records |
| `brand_profiles` | Stores brand voice, audience, CTA, products/services |
| `posts` | Stores generated/scheduled/draft post data |
| `workflow_logs` | Stores n8n workflow activity logs |

Verify database:

```powershell
docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> ai_social_saas -e "SHOW TABLES; SELECT COUNT(*) AS customers FROM customers; SELECT COUNT(*) AS brand_profiles FROM brand_profiles; SELECT COUNT(*) AS posts FROM posts; SELECT COUNT(*) AS logs FROM workflow_logs;"
```

---

## 7. Frontend State

Location: `apps/web`

Run:

```powershell
cd apps/web
npm install
npm run dev
```

URL: `http://localhost:3000`

Pages:

```text
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

---

## 8. n8n State

Container: `ai_social_n8n`
URL: `http://localhost:5678`

Active workflows (18 total):

```text
Create Customer, Save Brand Profile, Create Post
List Customers, Get Customer Detail
List Brand Profiles, Update Brand Profile
List Posts, Update Post
List Scheduled Posts, List Workflow Logs
Run Schedule Simulation, Dashboard Summary
Generate Content Ideas, Generate Caption, Rewrite Caption
Schedule Post, Review Post
```

Workflow backup: `n8n/workflows/local-active-workflows.json`

### AI Code nodes

All 3 AI workflows use `this.helpers.httpRequest()` inside a Code node to call 9router.

Required docker-compose setting to allow env var access in Code nodes:

```yaml
- N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

Env vars used inside Code nodes:

```text
.NINEROUTER_API_KEY
.NINEROUTER_API_URL
.NINEROUTER_API_MODEL
```

### MySQL credential inside n8n

```text
Host: mysql
Port: 3306
```

Do not use `localhost` inside n8n for MySQL.

---

## 9. Webhook Paths

```text
/webhook/create-customer
/webhook/list-customers
/webhook/get-customer-detail
/webhook/save-brand-profile
/webhook/list-brand-profiles
/webhook/update-brand-profile
/webhook/create-post
/webhook/list-posts
/webhook/update-post
/webhook/list-workflow-logs
/webhook/list-scheduled-posts
/webhook/run-schedule-simulation
/webhook/dashboard-summary
/webhook/generate-content-ideas
/webhook/generate-caption
/webhook/rewrite-caption
/webhook/schedule-post
/webhook/review-post
```

Use production webhook URLs: `http://localhost:5678/webhook/{path}`

Do not use `/webhook-test/` for normal app runtime.

---

## 10. Quick Verify Commands

Check containers:

```powershell
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
```

Test webhook:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/list-customers" -ContentType "application/json" -Body "{}"
```

Test AI:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/generate-caption" -ContentType "application/json" -Body '{"customer_id":1,"brand_profile_id":1,"brand_name":"Demo","platform":"facebook","topic":"Test","content_pillar":"education","goal":"build_trust"}'
```

---

## 11. Current Development Rules

Do not:

```text
- Treat as a new project
- Rewrite the whole project
- Delete existing features/pages/workflows/schema/docs
- Change architecture without approval
- Add auth/payment/real social posting unless explicitly requested
- Drop database/table
- Remove env keys
- Commit secrets
```

Do:

```text
- Read README.md and docs/ first
- Inspect relevant files before editing
- Make small, controlled changes
- Preserve existing behavior
- Explain risks before major changes
- Ask before deleting or refactoring
- Provide verification commands
```

---

## 12. Completed Milestones

- Phase 0 local skeleton
- Phase 1 brand profile management
- Phase 2 post draft management
- Phase 3 AI content generation (9router, OpenAI-compatible)
- Phase 4 scheduling simulation
- Phase 4.5 approval workflow
- Dashboard summary and polish
- Validation and error handling
- Data consistency cleanup
- Workflow logs
- Laptop migration

## Next Recommended Step

Phase 5 - Real social posting.
