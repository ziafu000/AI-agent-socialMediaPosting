# 15 - Laptop Migration Guide

This guide explains how to move the full local project to a new laptop without losing code, MySQL data, n8n workflows, or n8n credentials.

## What Must Be Migrated

GitHub alone is not enough.

You need to preserve these four groups:

```text
1. Source code
2. Local env files
3. MySQL database data
4. n8n workflows and credentials
```

## Important Rules

Do not run this when you care about keeping local data:

```powershell
docker compose down -v
```

The `-v` flag removes Docker volumes. That can delete MySQL data and n8n data.

Before migrating, create backup files outside Docker and keep them in a safe place such as an external drive or private cloud folder.

Do not commit decrypted credential backups to a public GitHub repo.

## Current Project Runtime

Expected containers:

```text
ai_social_mysql
ai_social_n8n
ai_social_adminer
```

Expected important files:

```text
.env
apps/web/.env.local
n8n/workflows/local-active-workflows.json
```

Important n8n value:

```text
N8N_ENCRYPTION_KEY
```

Keep the same `N8N_ENCRYPTION_KEY` on the new laptop. If this key changes, old encrypted n8n credentials may not decrypt correctly.

## Part 1 - Final Git Backup On Old Laptop

Check current status:

```powershell
git status
```

Commit all project changes you want to keep:

```powershell
git add .
git commit -m "backup before laptop migration"
git push
```

Confirm local branch is clean:

```powershell
git status
```

Expected result:

```text
nothing to commit, working tree clean
```

## Part 2 - Backup Local Env Files

Copy these files somewhere safe:

```text
.env
apps/web/.env.local
```

These files are usually not pushed to GitHub because they contain local secrets.

They include values such as:

```text
MYSQL_ROOT_PASSWORD
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
N8N_BASIC_AUTH_USER
N8N_BASIC_AUTH_PASSWORD
N8N_ENCRYPTION_KEY
NEXT_PUBLIC_N8N_*_WEBHOOK_URL
```

Create a local migration backup folder:

```powershell
New-Item -ItemType Directory -Force .\migration-backup
New-Item -ItemType Directory -Force .\migration-backup\n8n
```

Copy env files into it:

```powershell
Copy-Item .\.env .\migration-backup\.env
Copy-Item .\apps\web\.env.local .\migration-backup\.env.local
```

## Part 3 - Backup n8n Workflows

Export workflows from the live n8n container:

```powershell
docker exec ai_social_n8n n8n export:workflow --all --output=/tmp/all-workflows.json
docker cp ai_social_n8n:/tmp/all-workflows.json .\migration-backup\n8n\all-workflows.json
```

Also refresh the project-tracked workflow backup:

```powershell
docker cp ai_social_n8n:/tmp/all-workflows.json .\n8n\workflows\local-active-workflows.json
```

Commit this refreshed workflow backup if it changed:

```powershell
git add .\n8n\workflows\local-active-workflows.json
git commit -m "backup active n8n workflows before migration"
git push
```

## Part 4 - Backup n8n Credentials

Export decrypted credentials from n8n:

```powershell
docker exec ai_social_n8n n8n export:credentials --all --decrypted --output=/tmp/all-credentials.json
docker cp ai_social_n8n:/tmp/all-credentials.json .\migration-backup\n8n\all-credentials.json
```

This file can contain passwords and API keys.

Keep it private.

Do not commit it to a public repository.

## Part 5 - Backup MySQL Database

Use the root password from `.env`.

Example command:

```powershell
docker exec ai_social_mysql mysqldump -uroot -p<MYSQL_ROOT_PASSWORD> ai_social_saas > .\migration-backup\mysql-ai-social-saas.sql
```

Replace:

```text
<MYSQL_ROOT_PASSWORD>
```

with the actual `MYSQL_ROOT_PASSWORD` value from `.env`.

Verify the dump file exists:

```powershell
Get-Item .\migration-backup\mysql-ai-social-saas.sql
```

## Part 6 - Copy Backup Folder Somewhere Safe

At minimum, keep this folder:

```text
migration-backup/
  .env
  .env.local
  mysql-ai-social-saas.sql
  n8n/
    all-workflows.json
    all-credentials.json
```

Recommended:

```text
External drive
Private cloud folder
Private encrypted archive
```

Do not rely only on the old laptop disk.

## Part 7 - Prepare New Laptop

Install:

```text
Git
Docker Desktop
Node.js LTS
VS Code or preferred editor
DBeaver, optional
```

Then clone the repo:

```powershell
git clone <YOUR_GITHUB_REPO_URL>
cd AI_Automation_socialMedia
```

Restore env files:

```powershell
Copy-Item <BACKUP_FOLDER>\.env .\.env
Copy-Item <BACKUP_FOLDER>\.env.local .\apps\web\.env.local
```

Replace:

```text
<BACKUP_FOLDER>
```

with the real backup folder path.

## Part 8 - Start Docker On New Laptop

Start the stack:

```powershell
docker compose up -d
```

Check containers:

```powershell
docker ps
```

Expected containers:

```text
ai_social_mysql
ai_social_n8n
ai_social_adminer
```

## Part 9 - Restore MySQL Database

Copy the SQL dump into the MySQL container:

```powershell
docker cp <BACKUP_FOLDER>\mysql-ai-social-saas.sql ai_social_mysql:/tmp/mysql-ai-social-saas.sql
```

Restore it:

```powershell
docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> ai_social_saas -e "source /tmp/mysql-ai-social-saas.sql"
```

Verify tables have data:

```powershell
docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> ai_social_saas -e "SELECT COUNT(*) AS customers FROM customers; SELECT COUNT(*) AS posts FROM posts; SELECT COUNT(*) AS logs FROM workflow_logs;"
```

## Part 10 - Restore n8n Credentials

Copy credentials into n8n:

```powershell
docker cp <BACKUP_FOLDER>\n8n\all-credentials.json ai_social_n8n:/tmp/all-credentials.json
```

Import credentials:

```powershell
docker exec ai_social_n8n n8n import:credentials --input=/tmp/all-credentials.json
```

If n8n requires assigning credentials to the current project, use:

```powershell
docker exec ai_social_n8n n8n import:credentials --input=/tmp/all-credentials.json --projectId=<N8N_PROJECT_ID>
```

You can find the project ID from n8n UI or by inspecting n8n data.

## Part 11 - Restore n8n Workflows

Copy workflows into n8n:

```powershell
docker cp <BACKUP_FOLDER>\n8n\all-workflows.json ai_social_n8n:/tmp/all-workflows.json
```

Import workflows:

```powershell
docker exec ai_social_n8n n8n import:workflow --input=/tmp/all-workflows.json
```

Activate all workflows:

```powershell
docker exec ai_social_n8n n8n update:workflow --all --active=true
docker restart ai_social_n8n
```

Wait 10-20 seconds after restart before testing production webhooks.

## Part 12 - Verify n8n Workflows

Export workflow list:

```powershell
docker exec ai_social_n8n n8n export:workflow --all --output=/tmp/verify-workflows.json
docker cp ai_social_n8n:/tmp/verify-workflows.json .\migration-backup\n8n\verify-workflows.json
```

Expected current count:

```text
16 workflows
```

Expected workflow names:

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
```

## Part 13 - Verify Webhooks

Test dashboard:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/dashboard-summary" -ContentType "application/json" -Body "{}"
```

Test customers:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/list-customers" -ContentType "application/json" -Body "{}"
```

Test AI model caption:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/generate-caption" -ContentType "application/json" -Body '{"customer_id":1,"brand_profile_id":1,"brand_name":"Demo Spa","platform":"facebook","topic":"Acne treatment benefits","content_pillar":"education","goal":"build_trust"}'
```

Test rewrite caption:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/rewrite-caption" -ContentType "application/json" -Body '{"customer_id":1,"brand_profile_id":1,"brand_name":"Demo Spa","platform":"facebook","topic":"Acne treatment benefits","content_pillar":"education","goal":"build_trust","current_caption":"Existing caption text","current_hashtags":"#facebook #education","rewrite_style":"shorter"}'
```

## Part 14 - Start Frontend

Install dependencies:

```powershell
cd .\apps\web
npm install
```

Run dev server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Important pages to test:

```text
/dashboard
/customers
/brand-profiles
/posts/list
/content-planner
/workflow-logs
/scheduled-posts
```

## Part 15 - Verify Timezone

Check MySQL time:

```powershell
docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> -e "SELECT NOW(), @@global.time_zone, @@session.time_zone;" ai_social_saas
```

Expected local target:

```text
GMT+7 / Asia/Ho_Chi_Minh behavior
```

If `NOW()` is still 7 hours behind local Vietnam time, check `docker-compose.yml` for:

```yaml
command: --default-time-zone=+07:00
environment:
  TZ: Asia/Ho_Chi_Minh
```

Then recreate only if needed:

```powershell
docker compose up -d --force-recreate mysql n8n
```

Before running the command above, make sure workflow and database backups already exist.

## Part 16 - Common Problems

### Workflows do not show in n8n UI

Run:

```powershell
docker exec ai_social_n8n n8n import:workflow --input=/tmp/all-workflows.json
docker exec ai_social_n8n n8n update:workflow --all --active=true
docker restart ai_social_n8n
```

Then refresh n8n UI.

### Webhook returns 404 not registered

Make sure the workflow is active:

```powershell
docker exec ai_social_n8n n8n update:workflow --all --active=true
docker restart ai_social_n8n
```

Wait 10-20 seconds before testing.

Use production URL:

```text
http://localhost:5678/webhook/{path}
```

Do not use this for active app runtime:

```text
http://localhost:5678/webhook-test/{path}
```

### MySQL credential missing in n8n

Symptom in logs:

```text
Credential with ID "... " does not exist for type "mySql"
```

Fix:

```powershell
docker exec ai_social_n8n n8n import:credentials --input=/tmp/all-credentials.json
docker restart ai_social_n8n
```

### Frontend says missing webhook URL

Check:

```text
apps/web/.env.local
```

It must contain all `NEXT_PUBLIC_N8N_*_WEBHOOK_URL` values.

Restart the frontend after editing `.env.local`.

### n8n cannot connect to MySQL

Inside n8n credentials, MySQL host must be:

```text
mysql
```

Not:

```text
localhost
```

Because n8n is running inside Docker.

## Final Migration Checklist

Before leaving old laptop:

```text
[ ] git status is clean
[ ] latest code pushed to GitHub
[ ] .env backed up
[ ] apps/web/.env.local backed up
[ ] n8n workflows exported
[ ] n8n credentials exported
[ ] MySQL dump exported
[ ] backup folder copied outside old laptop
```

On new laptop:

```text
[ ] repo cloned
[ ] .env restored
[ ] apps/web/.env.local restored
[ ] docker compose up -d successful
[ ] MySQL dump restored
[ ] n8n credentials imported
[ ] n8n workflows imported
[ ] workflows activated
[ ] n8n restarted
[ ] dashboard-summary webhook returns 200
[ ] list-customers webhook returns 200
[ ] generate-caption webhook returns 200
[ ] rewrite-caption webhook returns 200
[ ] frontend starts at localhost:3000
```
