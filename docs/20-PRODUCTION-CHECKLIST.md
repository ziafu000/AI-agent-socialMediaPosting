# 20 - Production Checklist

Complete verification checklist for production deployment.

## Pre-Deployment Checklist

### Phase 5A: Security Foundation ✅

**Authentication (Clerk)**
- [ ] Clerk account created
- [ ] API keys obtained (publishable + secret)
- [ ] Environment variables set in `.env.local`
- [ ] ClerkProvider added to layout
- [ ] Sign-in page created at `/sign-in`
- [ ] Sign-up page created at `/sign-up`
- [ ] Middleware protecting all routes except auth pages
- [ ] UserButton component added to header
- [ ] Test: Can sign up with email
- [ ] Test: Can sign in with email
- [ ] Test: Can sign in with Google OAuth
- [ ] Test: Redirected to sign-in when not authenticated
- [ ] Test: Can sign out successfully

**Multi-Tenancy**
- [ ] `user_id` column added to `customers` table
- [ ] `user_id` column added to `brand_profiles` table
- [ ] `user_id` column added to `posts` table
- [ ] Indexes created on all `user_id` columns
- [ ] `api_keys` table created
- [ ] All frontend API calls include `user_id`
- [ ] All n8n workflows validate `user_id`
- [ ] All SELECT queries filter by `user_id`
- [ ] All INSERT queries include `user_id`
- [ ] All UPDATE queries check `user_id` ownership
- [ ] All DELETE queries check `user_id` ownership
- [ ] Test: User A cannot see User B's data
- [ ] Test: User A cannot modify User B's data
- [ ] Test: Requests without `user_id` return 401

**API Security**
- [ ] API key validation implemented
- [ ] All webhook endpoints validate authentication
- [ ] Error responses return proper status codes (401, 403, 404)
- [ ] Test: Invalid API key returns 401
- [ ] Test: Missing user_id returns 401

---

### Phase 5B: Infrastructure ✅

**Database (Railway/PlanetScale)**
- [ ] Railway/PlanetScale account created
- [ ] MySQL instance provisioned (free tier)
- [ ] Local data exported (`mysqldump`)
- [ ] Data imported to cloud database
- [ ] Connection tested from local machine
- [ ] Connection pooling configured
- [ ] Environment variables updated with production credentials
- [ ] Test: Can connect from n8n
- [ ] Test: All tables present
- [ ] Test: All data migrated correctly

**n8n (Fly.io)**
- [ ] Fly.io account created
- [ ] `fly.toml` configuration created
- [ ] n8n deployed to Fly.io (3 VMs)
- [ ] Environment variables configured
- [ ] Workflows exported from local
- [ ] Workflows imported to Fly.io n8n
- [ ] MySQL credentials configured (use cloud DB host, not `mysql`)
- [ ] All workflows activated
- [ ] Test: Can access n8n UI at `https://your-app.fly.dev`
- [ ] Test: Dashboard webhook returns 200
- [ ] Test: List customers webhook returns 200
- [ ] Test: Generate caption webhook returns 200
- [ ] Test: All 18 workflows responding

**Frontend (Vercel)**
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Build settings configured (Next.js detected automatically)
- [ ] Environment variables added to Vercel
- [ ] Production deployment successful
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Test: Can access frontend at Vercel URL
- [ ] Test: All pages load correctly
- [ ] Test: Authentication flow works
- [ ] Test: API calls reach Fly.io n8n
- [ ] Test: Data loads from Railway MySQL

**Environment Variables**
- [ ] All localhost URLs removed
- [ ] Production URLs configured:
  - `NEXT_PUBLIC_N8N_*_WEBHOOK_URL` → Fly.io URLs
  - `DATABASE_URL` → Railway/PlanetScale URL
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → Production key
  - `CLERK_SECRET_KEY` → Production secret (in Vercel secrets)
  - `N8N_ENCRYPTION_KEY` → Same key as local (critical!)
- [ ] `.env.example` updated with new structure
- [ ] GitHub Secrets configured for CI/CD
- [ ] Test: No hardcoded secrets in code

---

### Phase 5C: Performance ✅

**Caching (Upstash Redis)**
- [ ] Upstash account created
- [ ] Redis database created (free tier)
- [ ] Environment variables added (`UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`)
- [ ] `@upstash/redis` package installed
- [ ] Cache helper functions created
- [ ] Caching implemented for:
  - [ ] Customer lists (5min TTL)
  - [ ] Brand profiles (10min TTL)
  - [ ] Posts lists (2min TTL)
  - [ ] Dashboard summary (1min TTL)
- [ ] Test: Cache hit on second request
- [ ] Test: Cache invalidation on data update
- [ ] Monitor: Cache hit rate >90%

**Rate Limiting**
- [ ] `@upstash/ratelimit` package installed
- [ ] Rate limiting middleware created
- [ ] Limits configured: 10 requests per 10 seconds
- [ ] Test: 11th request in 10s returns 429
- [ ] Test: Requests reset after window expires

**Database Optimization**
- [ ] Missing indexes identified and added
- [ ] Slow queries identified (`EXPLAIN` analysis)
- [ ] Connection pooling configured
- [ ] Test: Query response times <100ms
- [ ] Test: No connection pool exhaustion under load

---

### Phase 5D: Monitoring ✅

**Error Tracking (Sentry)**
- [ ] Sentry account created (free tier)
- [ ] Project created for frontend
- [ ] `@sentry/nextjs` installed
- [ ] Sentry initialized in `sentry.client.config.ts`
- [ ] Source maps uploaded
- [ ] Test: Trigger test error, appears in Sentry
- [ ] Alerts configured for high error rates
- [ ] Team members invited

**Logging (BetterStack)**
- [ ] BetterStack account created (free tier)
- [ ] Source created for application logs
- [ ] Logger utility created
- [ ] Critical paths instrumented:
  - [ ] Authentication failures
  - [ ] API errors
  - [ ] Database connection issues
  - [ ] n8n workflow failures
- [ ] Test: Logs appear in BetterStack dashboard
- [ ] Search and filtering working

**Uptime Monitoring (UptimeRobot)**
- [ ] UptimeRobot account created (free)
- [ ] Monitors created for:
  - [ ] Frontend (HTTPS check)
  - [ ] n8n health endpoint
  - [ ] Database connectivity
- [ ] Check interval: 5 minutes
- [ ] Alert contacts configured (email)
- [ ] Test: Receive alert when service down
- [ ] Public status page created (optional)

**Metrics (Grafana Cloud)**
- [ ] Grafana Cloud account created (free tier)
- [ ] Prometheus integration configured
- [ ] Metrics endpoint exposed (`/api/metrics`)
- [ ] Dashboards created for:
  - [ ] Request latency
  - [ ] Error rates
  - [ ] Cache hit rates
  - [ ] Database query times
- [ ] Alerts configured for anomalies
- [ ] Test: Metrics flowing to Grafana

**Testing & CI/CD**
- [ ] Unit tests written (Vitest)
- [ ] Test coverage >70% for critical paths
- [ ] GitHub Actions workflow created
- [ ] CI pipeline runs on PR
- [ ] Automated deployments configured
- [ ] Pre-deployment health checks passing
- [ ] Test: Push to main triggers deployment
- [ ] Test: Failed tests block deployment

---

## Post-Deployment Verification

### Smoke Tests (Run After Each Deployment)

**Authentication Flow**
```bash
# Test sign-up
curl https://your-app.vercel.app/sign-up

# Test protected route redirect
curl -I https://your-app.vercel.app/dashboard
# Should return 307 redirect to /sign-in
```

**API Endpoints**
```bash
# Replace with your production URLs and valid user_id

# Dashboard summary
curl -X POST https://your-n8n.fly.dev/webhook/dashboard-summary \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_2xxx"}'

# List customers
curl -X POST https://your-n8n.fly.dev/webhook/list-customers \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_2xxx"}'

# Generate caption (AI)
curl -X POST https://your-n8n.fly.dev/webhook/generate-caption \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_2xxx",
    "customer_id": 1,
    "brand_profile_id": 1,
    "brand_name": "Demo",
    "platform": "facebook",
    "topic": "Test",
    "content_pillar": "education",
    "goal": "build_trust"
  }'
```

**Performance**
```bash
# Measure response time
time curl -X POST https://your-n8n.fly.dev/webhook/dashboard-summary \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_2xxx"}'

# Should be <500ms
```

---

## Security Audit

**Pre-Launch Security Checklist**
- [ ] No secrets in git history (`git log --all --full-history --source --raw -- .env`)
- [ ] `.env` files in `.gitignore`
- [ ] No API keys in frontend code
- [ ] All API endpoints require authentication
- [ ] SQL injection protection (parameterized queries in n8n)
- [ ] XSS protection (React escapes by default)
- [ ] CSRF protection (Clerk handles)
- [ ] HTTPS enforced (Vercel + Fly.io default)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies up to date (`npm audit`)

**Penetration Testing**
- [ ] Test: Access dashboard without authentication (should fail)
- [ ] Test: Call API without user_id (should return 401)
- [ ] Test: User A try to access User B's data (should fail)
- [ ] Test: SQL injection attempts (should fail)
- [ ] Test: XSS attempts (should be escaped)
- [ ] Test: Rate limit bypass attempts (should be blocked)

---

## Cost Monitoring

**Free Tier Limits**
- [ ] Clerk: Monitor MAU (alert at 8,000 / 10,000 limit)
- [ ] Railway: Monitor storage (alert at 800MB / 1GB limit)
- [ ] Fly.io: Monitor VM usage (3 VMs free)
- [ ] Upstash: Monitor commands (alert at 8,000 / 10,000 daily)
- [ ] Sentry: Monitor errors (alert at 4,000 / 5,000 monthly)
- [ ] Vercel: Monitor bandwidth (100GB/month free)

**Usage Dashboard**
- [ ] Create spreadsheet to track weekly usage
- [ ] Set up billing alerts in each service
- [ ] Plan upgrade path when approaching limits

---

## Rollback Plan

**If Something Goes Wrong**

**Option 1: Quick Rollback (Vercel)**
```bash
# Revert to previous deployment
vercel rollback
```

**Option 2: Database Rollback**
```bash
# Restore from backup (Railway auto-backups daily)
# Via Railway dashboard: Deployments → Backups → Restore

# Or manual restore
mysql -h <host> -u root -p ai_social_saas < backup.sql
```

**Option 3: Full Local Fallback**
```bash
# Update .env.local to point back to local
# Restart local docker-compose
docker compose up -d

# Frontend continues on Vercel, points to local n8n
```

**Emergency Contacts**
- Railway support: https://railway.app/help
- Fly.io support: https://community.fly.io
- Vercel support: https://vercel.com/support
- Clerk support: https://clerk.com/support

---

## Go-Live Checklist

**Final Verification Before Public Launch**
- [ ] All Phase 5A-5D checklists complete
- [ ] Smoke tests passing
- [ ] Security audit complete
- [ ] Performance acceptable (<500ms API)
- [ ] Monitoring dashboards show green
- [ ] Team trained on incident response
- [ ] Rollback plan tested
- [ ] Backup strategy verified
- [ ] Cost monitoring in place
- [ ] User documentation updated

**Launch**
- [ ] Announce to internal team
- [ ] Invite first beta users (5-10)
- [ ] Monitor closely for 24 hours
- [ ] Gradually increase user count
- [ ] Reach 100 users milestone

**Week 1 Post-Launch**
- [ ] Review error logs daily
- [ ] Monitor cost usage
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Optimize slow queries

---

## Success Metrics (8-Week Target)

- ✅ 50+ active production users
- ✅ 99% uptime
- ✅ <1% error rate
- ✅ <500ms average API response time
- ✅ >90% cache hit rate
- ✅ Zero security incidents
- ✅ Zero data leaks between tenants
- ✅ Cost under $10/month

**If Metrics Met:** Ready for Phase 6 (Real Social Posting)

**If Metrics Not Met:** Iterate on problem areas before adding features
