# 16 - Current State

## 1. Project Identity

**Project name:** `AI_Automation_socialMedia`

**Project type:** Local MVP for an AI Social Media Automation SaaS / service system.

**Main goal:**  
Build a working internal/local system where a frontend can collect customer/brand/post data, send it to n8n webhooks, and store/manage the data in MySQL.

This project is **not a new project**. It already has source code, docs, Docker setup, MySQL schema/data, n8n workflows, and a Next.js frontend.

---

## 2. Current Architecture

Current architecture:

```text
Next.js Frontend
        ↓
n8n Webhooks
        ↓
MySQL Database
```

### Main responsibilities

| Layer | Role |
|---|---|
| **Next.js frontend** | UI pages, forms, dashboard, customer/post/brand profile views |
| **n8n** | Backend automation layer, webhook handlers, workflow logic |
| **MySQL** | Stores customers, brand profiles, posts, workflow logs |
| **Docker Compose** | Runs MySQL, n8n, and Adminer locally |
| **DBeaver/Adminer** | Used to inspect and verify database data |

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

Danger command:

```powershell
docker compose down -v
```

Do **not** run `docker compose down -v` unless MySQL and n8n backups are already verified, because `-v` removes Docker volumes and may delete local MySQL/n8n data.

---

## 4. Important Local Files

These files are important and should be preserved during migration:

```text
.env
apps/web/.env.local
docker-compose.yml
docker/mysql/init/001_init.sql
n8n/workflows/local-active-workflows.json
n8n_data_backup.tar.gz
migration-backup/
docs/
```

### Sensitive files

The following files must **not** be committed to public GitHub:

```text
.env
.env.local
apps/web/.env.local
migration-backup/
*.tar.gz
n8n_data_backup.tar.gz
*credentials*.json
mysql*.sql
```

Recommended `.gitignore` entries:

```gitignore
.env
.env.local
apps/web/.env.local

migration-backup/
*.tar.gz
n8n_data_backup.tar.gz
*credentials*.json
mysql*.sql

node_modules/
.next/
dist/
build/
.cache/
.turbo/
```

---

## 5. Environment Variables

Important `.env` values include:

```text
MYSQL_ROOT_PASSWORD
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD

N8N_BASIC_AUTH_USER
N8N_BASIC_AUTH_PASSWORD
N8N_ENCRYPTION_KEY
```

Important `apps/web/.env.local` values include webhook URLs such as:

```text
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL
NEXT_PUBLIC_N8N_LIST_CUSTOMERS_WEBHOOK_URL
NEXT_PUBLIC_N8N_DASHBOARD_SUMMARY_WEBHOOK_URL
NEXT_PUBLIC_N8N_GENERATE_CAPTION_WEBHOOK_URL
NEXT_PUBLIC_N8N_REWRITE_CAPTION_WEBHOOK_URL
```

`N8N_ENCRYPTION_KEY` is critical. Keep the same key when restoring n8n data; otherwise old encrypted n8n credentials may not decrypt correctly.

---

## 6. Database State

Main database:

```text
ai_social_saas
```

Main tables:

```text
customers
brand_profiles
posts
workflow_logs
```

### Table roles

| Table | Purpose |
|---|---|
| `customers` | Stores customers/client records |
| `brand_profiles` | Stores brand voice, audience, CTA, products/services |
| `posts` | Stores generated/scheduled/post draft data |
| `workflow_logs` | Stores n8n workflow activity logs |

### Verify database

Replace `<MYSQL_ROOT_PASSWORD>` with the real value from `.env`.

```powershell
docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> ai_social_saas -e "SHOW TABLES; SELECT COUNT(*) AS customers FROM customers; SELECT COUNT(*) AS brand_profiles FROM brand_profiles; SELECT COUNT(*) AS posts FROM posts; SELECT COUNT(*) AS logs FROM workflow_logs;"
```

Do not run destructive SQL such as `DROP`, `DELETE`, or mass `UPDATE` unless explicitly approved.

---

## 7. Frontend State

Frontend location:

```text
apps/web
```

Expected command:

```powershell
cd apps/web
npm install
npm run dev
```

Expected frontend URL:

```text
http://localhost:3000
```

If port `3000` is occupied, Next.js may use `3001`.

### Important pages

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

Do not delete or rename these pages unless explicitly requested.

---

## 8. n8n State

n8n runs as the backend automation layer.

Expected n8n container:

```text
ai_social_n8n
```

Expected n8n URL:

```text
http://localhost:5678
```

Expected workflows:

```text
Create Customer
Save Brand Profile
Create Post
List Workflow Logs
List Scheduled Posts
List Posts
Update Post
List Customers
Get Customer Detail
List Brand Profiles
Update Brand Profile
Run Schedule Simulation
Dashboard Summary
Generate Content Ideas
Generate Caption
Rewrite Caption
Schedule Post
Review Post
```

Important workflow backup files:

```text
n8n/workflows/local-active-workflows.json
n8n_data_backup.tar.gz
migration-backup/n8n/
```

### n8n MySQL credential rule

Inside Docker, n8n must connect to MySQL using:

```text
Host: mysql
Port: 3306
```

Do **not** use:

```text
Host: localhost
```

because `localhost` inside n8n points to the n8n container itself, not the MySQL container.

---

## 9. Important Webhooks

Expected production webhook paths:

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

Use production webhook URLs:

```text
http://localhost:5678/webhook/{path}
```

Do not use `/webhook-test/{path}` for normal app runtime.

---

## 10. Webhook Verification Commands

Test customers:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/list-customers" -ContentType "application/json" -Body "{}"
```

Test dashboard:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/dashboard-summary" -ContentType "application/json" -Body "{}"
```

Test generate caption:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/generate-caption" -ContentType "application/json" -Body '{"customer_id":1,"brand_profile_id":1,"brand_name":"Demo Spa","platform":"facebook","topic":"Acne treatment benefits","content_pillar":"education","goal":"build_trust"}'
```

Test rewrite caption:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/rewrite-caption" -ContentType "application/json" -Body '{"customer_id":1,"brand_profile_id":1,"brand_name":"Demo Spa","platform":"facebook","topic":"Acne treatment benefits","content_pillar":"education","goal":"build_trust","current_caption":"Existing caption text","current_hashtags":"#facebook #education","rewrite_style":"shorter"}'
```

---

## 11. Current Migration Status

The project was restored after moving to a new SSD.

Known restore process:

1. Install Git, Node.js, Docker Desktop, VS Code, and DBeaver.
2. Restore or clone project into:

```text
D:\Billy\Coding\Project\AI_Automation_socialMedia
```

3. Restore:

```text
.env
apps/web/.env.local
```

4. Run:

```powershell
docker compose up -d
```

5. Restore MySQL dump into `ai_social_saas`.
6. Restore n8n data from:

```text
n8n_data_backup.tar.gz
```

7. Restart n8n.
8. Publish/activate workflows if needed.
9. Run frontend:

```powershell
cd apps/web
npm install
npm run dev
```

---

## 12. Known Issues From Migration

### 12.1 PowerShell blocks npm

Symptom:

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system
```

Fix:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Or temporary workaround:

```powershell
npm.cmd install
npm.cmd run dev
```

### 12.2 MySQL dump encoding issue

Symptom:

```text
ERROR: ASCII '\0' appeared in the statement
```

Cause: SQL dump file may be UTF-16.

Fix: convert dump to UTF-8 before restoring.

```powershell
$src = "E:\AI_AUTOMATION_MIGRATION_BACKUP\mysql-ai-social-saas.sql"
$dst = "E:\AI_AUTOMATION_MIGRATION_BACKUP\mysql-ai-social-saas-utf8.sql"

$content = [System.IO.File]::ReadAllText($src, [System.Text.Encoding]::Unicode)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($dst, $content, $utf8NoBom)
```

Then restore UTF-8 file.

### 12.3 n8n `update:workflow --all` deprecation

Newer n8n versions may show:

```text
Workflow publishing via "update:workflow --all" is no longer supported.
Please publish workflows individually using: publish:workflow --id=<workflow-id>
```

If webhook returns `404`, check whether workflows are published/active in the n8n UI or publish workflows individually.

### 12.4 Docker cannot mount external drive path

If Docker cannot see files from `E:\`, copy the backup file into the project folder first, then mount the project folder.

Example:

```powershell
Copy-Item "E:\AI_AUTOMATION_MIGRATION_BACKUP\n8n\n8n_data_backup.tar.gz" "D:\Billy\Coding\Project\AI_Automation_socialMedia\n8n_data_backup.tar.gz" -Force
```

---

## 13. n8n Restore Command

After copying `n8n_data_backup.tar.gz` into the project root:

```powershell
cd "D:\Billy\Coding\Project\AI_Automation_socialMedia"

docker compose down

docker run --rm -v "ai_automation_socialmedia_n8n_data:/data" -v "D:\Billy\Coding\Project\AI_Automation_socialMedia:/backup" alpine sh -c "rm -rf /data/* /data/.[!.]* /data/..?* 2>/dev/null || true; tar xzf /backup/n8n_data_backup.tar.gz -C /data; find /data -maxdepth 2 -type f | head -30"

docker compose up -d
```

If the n8n volume name is different, check it with:

```powershell
docker volume ls | findstr n8n
```

Then replace `ai_automation_socialmedia_n8n_data` with the real volume name.

---

## 14. MySQL Restore Command

Copy dump into container:

```powershell
docker cp "E:\AI_AUTOMATION_MIGRATION_BACKUP\mysql-ai-social-saas-utf8.sql" ai_social_mysql:/tmp/mysql-ai-social-saas-utf8.sql
```

Restore:

```powershell
docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> --default-character-set=utf8mb4 ai_social_saas -e "source /tmp/mysql-ai-social-saas-utf8.sql"
```

Alternative restore from host file:

```powershell
cmd /c "docker exec -i -e MYSQL_PWD=<MYSQL_ROOT_PASSWORD> ai_social_mysql mysql --default-character-set=utf8mb4 -u root ai_social_saas < E:\AI_AUTOMATION_MIGRATION_BACKUP\mysql-ai-social-saas-utf8.sql"
```

---

## 15. Current Development Rules

This project must be continued carefully.

Do not:

```text
- Treat as a new project
- Rewrite the whole project
- Delete existing feature/page/workflow/schema/docs
- Change architecture without approval
- Add auth/payment/OpenAI/social posting unless explicitly requested
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

## 16. Current Recommended Next Steps

Before building new features:

1. Verify Docker containers:

```powershell
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
```

2. Verify MySQL data:

```powershell
docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> ai_social_saas -e "SHOW TABLES; SELECT COUNT(*) AS customers FROM customers; SELECT COUNT(*) AS posts FROM posts; SELECT COUNT(*) AS logs FROM workflow_logs;"
```

3. Verify n8n webhooks:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/list-customers" -ContentType "application/json" -Body "{}"
```

4. Verify frontend:

```powershell
cd apps/web
npm install
npm run dev
```

5. Open:

```text
http://localhost:3000
```

6. Test pages:

```text
/dashboard
/customers
/brand-profiles
/posts/list
/content-planner
/workflow-logs
/scheduled-posts
/approvals
```

---

## 17. Role of Codex Going Forward

Codex should be treated as a careful project continuation assistant.

Codex must:

```text
1. Read README.md and docs/ before working
2. Treat current source code as source of truth
3. Avoid large refactors
4. Avoid deleting existing features
5. Work by small milestones
6. Report files inspected and changed
7. Provide commands and verification steps
8. Stop after task completion
```

If Codex is uncertain, it should ask instead of guessing deeply.
