# 21 - Deployment Guide (Free Tier)

Step-by-step guide to deploy AI Social SaaS to production using **100% free infrastructure**.

**Target Cost:** $0/month for first 1,000 users

---

## Prerequisites

Before starting deployment:
- [ ] Phase 5A (Security) completed locally and tested
- [ ] All authentication working with Clerk
- [ ] Database has `user_id` columns
- [ ] n8n workflows updated for multi-tenancy
- [ ] GitHub repository with latest code pushed

**Estimated Time:** 4-6 hours (one-time setup)

---

## Part 1: Database Deployment (Railway - FREE)

### Option A: Railway (Recommended)

**Free Tier:** 512MB RAM, 1GB storage, $5 free credit/month

**Step 1: Create Railway Account**
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify email

**Step 2: Create MySQL Database**
1. Click "New Project"
2. Select "Provision MySQL"
3. Wait for deployment (~2 minutes)
4. Note the connection details:
   - `MYSQL_HOST`
   - `MYSQL_PORT` (usually 3306)
   - `MYSQL_USER` (usually root)
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE` (usually railway)

**Step 3: Export Local Data**
```bash
# Export from local Docker MySQL
docker exec ai_social_mysql mysqldump -uroot -p<YOUR_LOCAL_PASSWORD> ai_social_saas > local_backup.sql
```

**Step 4: Import Data to Railway**
```bash
# Connect to Railway MySQL
mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u root -p<MYSQL_PASSWORD> railway

# Create database
CREATE DATABASE ai_social_saas;
USE ai_social_saas;

# Import data
SOURCE local_backup.sql;

# Verify
SHOW TABLES;
SELECT COUNT(*) FROM customers;
```

**Step 5: Configure Connection Pooling**

In Railway dashboard:
- Variables → Add Variable
- Key: `MYSQL_CONN_LIMIT`
- Value: `10`

---

### Option B: PlanetScale (Alternative)

**Free Tier:** 5GB storage, 1 billion row reads/month

**Setup:**
```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Login
pscale auth login

# Create database
pscale database create ai-social-saas --region us-east

# Create branch
pscale branch create ai-social-saas main

# Get connection string
pscale connection-string ai-social-saas main
```

---

## Part 2: n8n Deployment (Fly.io - FREE)

**Free Tier:** 3 shared VMs with 256MB RAM each

**Step 1: Install Fly.io CLI**

Windows (PowerShell):
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

Mac/Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

**Step 2: Create Fly.io Account**
```bash
fly auth signup
# Or login: fly auth login
```

**Step 3: Create fly.toml Configuration**

Create `fly.toml` in project root:

```toml
app = "ai-social-n8n"
primary_region = "sin"  # Singapore, change to nearest region

[build]
  image = "docker.n8n.io/n8nio/n8n:2.19.5"

[env]
  N8N_PORT = "5678"
  N8N_PROTOCOL = "https"
  N8N_HOST = "ai-social-n8n.fly.dev"
  WEBHOOK_URL = "https://ai-social-n8n.fly.dev"
  GENERIC_TIMEZONE = "Asia/Ho_Chi_Minh"
  TZ = "Asia/Ho_Chi_Minh"
  N8N_BASIC_AUTH_ACTIVE = "true"
  N8N_BLOCK_ENV_ACCESS_IN_NODE = "false"

[http_service]
  internal_port = 5678
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1

[mounts]
  source = "n8n_data"
  destination = "/home/node/.n8n"
```

**Step 4: Launch n8n on Fly.io**

```bash
# Launch (creates app and volume)
fly launch --no-deploy

# Create persistent volume
fly volumes create n8n_data --region sin --size 3

# Set secrets (CRITICAL: use SAME encryption key as local!)
fly secrets set N8N_ENCRYPTION_KEY="<YOUR_LOCAL_N8N_ENCRYPTION_KEY>"
fly secrets set N8N_BASIC_AUTH_USER="admin"
fly secrets set N8N_BASIC_AUTH_PASSWORD="<STRONG_PASSWORD>"
fly secrets set NINEROUTER_API_KEY="<YOUR_API_KEY>"
fly secrets set NINEROUTER_API_URL="<YOUR_API_URL>"
fly secrets set NINEROUTER_API_MODEL="<YOUR_MODEL>"

# Deploy
fly deploy

# Check status
fly status

# View logs
fly logs
```

**Step 5: Configure MySQL Connection in n8n**

1. Open `https://ai-social-n8n.fly.dev` (your app URL)
2. Login with basic auth
3. Go to Credentials → Add Credential → MySQL
4. Fill in Railway connection details:
   - **Host:** `<RAILWAY_MYSQL_HOST>` (NOT `mysql`, NOT `localhost`)
   - **Port:** `3306`
   - **Database:** `ai_social_saas`
   - **User:** `root`
   - **Password:** `<RAILWAY_MYSQL_PASSWORD>`
5. Test Connection → Save

**Step 6: Import Workflows**

```bash
# Export from local
docker exec ai_social_n8n n8n export:workflow --all --output=/tmp/all-workflows.json
docker cp ai_social_n8n:/tmp/all-workflows.json ./workflows-backup.json

# Import to Fly.io
# First, SSH into Fly.io container
fly ssh console

# Inside container:
curl -X POST http://localhost:5678/rest/workflows/import \
  -H "Content-Type: application/json" \
  -u admin:<PASSWORD> \
  -d @/tmp/workflows-backup.json

# Or use n8n CLI if available
n8n import:workflow --input=/tmp/workflows-backup.json

# Exit SSH
exit
```

**Step 7: Activate All Workflows**

Via n8n UI:
1. Go to Workflows
2. For each workflow, click → Activate
3. Verify webhook URLs show production format

**Step 8: Test n8n Deployment**

```bash
# Test dashboard summary
curl -X POST https://ai-social-n8n.fly.dev/webhook/dashboard-summary \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123"}'

# Should return JSON response, not error
```

---

## Part 3: Frontend Deployment (Vercel - FREE)

**Free Tier:** Unlimited deployments, 100GB bandwidth

**Step 1: Create Vercel Account**
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access repositories

**Step 2: Import Project**
1. Click "Add New" → "Project"
2. Select your GitHub repository
3. Vercel auto-detects Next.js settings

**Step 3: Configure Environment Variables**

In Vercel dashboard → Settings → Environment Variables, add:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# n8n Webhooks (Fly.io URLs)
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/create-customer
NEXT_PUBLIC_N8N_LIST_CUSTOMERS_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/list-customers
NEXT_PUBLIC_N8N_GET_CUSTOMER_DETAIL_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/get-customer-detail
NEXT_PUBLIC_N8N_SAVE_BRAND_PROFILE_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/save-brand-profile
NEXT_PUBLIC_N8N_LIST_BRAND_PROFILES_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/list-brand-profiles
NEXT_PUBLIC_N8N_UPDATE_BRAND_PROFILE_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/update-brand-profile
NEXT_PUBLIC_N8N_CREATE_POST_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/create-post
NEXT_PUBLIC_N8N_UPDATE_POST_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/update-post
NEXT_PUBLIC_N8N_SCHEDULE_POST_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/schedule-post
NEXT_PUBLIC_N8N_REVIEW_POST_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/review-post
NEXT_PUBLIC_N8N_LIST_POSTS_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/list-posts
NEXT_PUBLIC_N8N_LIST_SCHEDULED_POSTS_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/list-scheduled-posts
NEXT_PUBLIC_N8N_LIST_WORKFLOW_LOGS_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/list-workflow-logs
NEXT_PUBLIC_N8N_GENERATE_CONTENT_IDEAS_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/generate-content-ideas
NEXT_PUBLIC_N8N_GENERATE_CAPTION_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/generate-caption
NEXT_PUBLIC_N8N_REWRITE_CAPTION_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/rewrite-caption
NEXT_PUBLIC_N8N_RUN_SCHEDULE_SIMULATION_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/run-schedule-simulation
NEXT_PUBLIC_N8N_DASHBOARD_SUMMARY_WEBHOOK_URL=https://ai-social-n8n.fly.dev/webhook/dashboard-summary
```

**Step 4: Deploy**
1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. Vercel provides production URL: `https://your-project.vercel.app`

**Step 5: Test Deployment**
1. Visit production URL
2. Try signing up → Should redirect to Clerk
3. Sign in → Should load dashboard
4. Test creating a customer

---

## Part 4: Monitoring Setup (FREE Tier)

### Sentry (Error Tracking)

**Step 1: Create Sentry Account**
1. Go to [https://sentry.io](https://sentry.io)
2. Sign up (free tier: 5,000 errors/month)
3. Create project: "AI Social Frontend"

**Step 2: Install Sentry**
```bash
cd apps/web
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Step 3: Add to Vercel Environment**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=<from_sentry_dashboard>
```

### UptimeRobot (Uptime Monitoring)

**Setup:**
1. Go to [https://uptimerobot.com](https://uptimerobot.com)
2. Sign up (free: 50 monitors)
3. Add Monitor:
   - **Type:** HTTPS
   - **URL:** `https://your-project.vercel.app`
   - **Interval:** 5 minutes
   - **Alert:** Email when down
4. Add Monitor:
   - **Type:** HTTPS
   - **URL:** `https://ai-social-n8n.fly.dev/webhook/dashboard-summary`
   - **Method:** POST
   - **Body:** `{"user_id":"health_check"}`

### BetterStack (Logging)

**Setup:**
1. Go to [https://betterstack.com](https://betterstack.com)
2. Sign up (free tier: 1GB logs/month)
3. Create Source
4. Add endpoint to environment:
```env
BETTERSTACK_SOURCE_URL=https://in.logs.betterstack.com/xxxxx
```

---

## Part 5: CI/CD Setup (GitHub Actions - FREE)

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: apps/web/package-lock.json
      
      - name: Install dependencies
        run: |
          cd apps/web
          npm ci
      
      - name: Run tests
        run: |
          cd apps/web
          npm test
      
      - name: Build
        run: |
          cd apps/web
          npm run build

  deploy-vercel:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: apps/web
```

**Add GitHub Secrets:**
1. Go to repository → Settings → Secrets and variables → Actions
2. Add:
   - `VERCEL_TOKEN` (from Vercel account settings)
   - `VERCEL_ORG_ID` (from Vercel project settings)
   - `VERCEL_PROJECT_ID` (from Vercel project settings)

---

## Part 6: Custom Domain (Optional)

### Setup Custom Domain on Vercel

1. Buy domain from Namecheap/GoDaddy (~$10/year)
2. In Vercel → Settings → Domains
3. Add your domain: `yourdomain.com`
4. Configure DNS at your registrar:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

---

## Post-Deployment Verification

### Smoke Tests

**Test 1: Authentication**
```bash
# Visit your production URL
open https://your-project.vercel.app

# Try signing up
# Try signing in
# Check dashboard loads
```

**Test 2: API Endpoints**
```bash
# Test via production frontend
# Create a customer
# Create a brand profile
# Generate AI content
# Schedule a post
```

**Test 3: Data Isolation**
```bash
# Sign up User A
# Create customer for User A
# Sign out
# Sign up User B
# Verify User B cannot see User A's data
```

**Test 4: Performance**
```bash
# Use browser DevTools Network tab
# Dashboard should load < 500ms
# API calls should respond < 500ms
```

---

## Troubleshooting

### Issue: n8n workflows show "Not Found"
**Solution:**
```bash
fly ssh console
n8n update:workflow --all --active=true
exit
fly apps restart ai-social-n8n
```

### Issue: MySQL connection timeout from n8n
**Solution:**
- Check Railway MySQL is running
- Verify connection details in n8n credentials
- Use Railway's public host (not `localhost` or `mysql`)
- Check Railway firewall allows connections

### Issue: Vercel build fails
**Solution:**
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies

# Test build locally first:
cd apps/web
npm run build
```

### Issue: "Invalid publishable key" in production
**Solution:**
- Check Clerk dashboard → Production → API Keys
- Ensure using `pk_live_*` not `pk_test_*`
- Update Vercel environment variables
- Redeploy

---

## Rollback Procedure

**If deployment fails:**

1. **Vercel Rollback:**
```bash
vercel rollback
```

2. **Fly.io Rollback:**
```bash
fly releases list
fly releases rollback <version>
```

3. **Database Rollback:**
```bash
# Restore from Railway backup
# Railway dashboard → Deployments → Backups → Restore
```

---

## Cost Monitoring

**Set Usage Alerts:**

1. **Railway:** Settings → Usage → Alert at 800MB storage
2. **Fly.io:** Dashboard → Billing → Alert at $5
3. **Vercel:** Settings → Bandwidth → Alert at 80GB
4. **Clerk:** Dashboard → Billing → Alert at 8,000 MAU

**Weekly Check:**
- Railway: Check storage usage
- Fly.io: Check VM count (should stay at 1-3)
- Vercel: Check bandwidth usage
- Clerk: Check Monthly Active Users

---

## Success Criteria

After deployment, you should have:
- ✅ Frontend live on Vercel with custom domain
- ✅ n8n running on Fly.io with all 18 workflows active
- ✅ MySQL on Railway with all data migrated
- ✅ Authentication working via Clerk
- ✅ All API calls responding < 500ms
- ✅ Monitoring active (Sentry + UptimeRobot)
- ✅ CI/CD pipeline running
- ✅ Total cost: $0/month

**Next Steps:**
1. Invite 5-10 beta users
2. Monitor error rates and performance
3. Implement Phase 5C (Caching) if needed
4. Plan Phase 6 (Real Social Posting)

---

## Production URLs Checklist

Document your production URLs:

```
Frontend: https://your-project.vercel.app
n8n: https://ai-social-n8n.fly.dev
MySQL: <railway-host>:3306
Sentry: https://sentry.io/organizations/<org>/projects/<project>
UptimeRobot: https://uptimerobot.com/dashboard
```

Save these in your password manager and share with team.
