# 12 - Roadmap

This is the canonical roadmap. It separates completed local MVP work from target production work.

## Completed: Local MVP

### Phase 0 - Local Skeleton

**Status:** Complete

Goal: Next.js frontend, n8n, and MySQL work locally through Docker Compose.

### Phase 1 - Brand Profile Management

**Status:** Complete

Goal: Create, list, and update customer brand profiles.

### Phase 2 - Post Draft Management

**Status:** Complete

Goal: Create, list, and update post drafts.

### Phase 3 - AI Content Generation

**Status:** Complete

Goal: Generate content ideas, captions, and caption rewrites through 9router.

### Phase 4 - Scheduling Simulation

**Status:** Complete

Goal: Store scheduled post state locally. Real publishing is intentionally deferred.

### Phase 4.5 - Approval Workflow

**Status:** Complete

Goal: Move posts through review, approval, rejection, cancellation, and scheduling states.

## Current Focus: Phase 5 - Production Readiness

Phase 5 must be completed before real production use.

### Phase 5A - Security Foundation

**Status:** Not implemented yet

Goal: Add authentication, tenant isolation, and secure backend boundaries.

Tasks:

- [ ] Add Clerk authentication
- [ ] Add `user_id` migration for tenant-scoped tables
- [ ] Add `api_keys` or equivalent internal API validation
- [ ] Stop relying on public browser-to-n8n trust for protected operations
- [ ] Update frontend request flow
- [ ] Update all tenant-scoped n8n workflows to validate and filter by `user_id`
- [ ] Verify zero cross-tenant data access

Exit criteria:

- Authenticated users can only see their own customers, brand profiles, and posts
- All tenant-scoped reads and writes include `user_id`
- Direct unauthenticated access to protected workflows is blocked or rejected

### Phase 5B - Production Infrastructure

**Status:** Pending Phase 5A

Goal: Deploy the app to production-ready free/low-cost infrastructure.

Tasks:

- [ ] Deploy frontend to Vercel
- [ ] Deploy n8n to Fly.io
- [ ] Deploy MySQL to Railway or another managed MySQL provider
- [ ] Configure environment variables per environment
- [ ] Import and activate n8n workflows
- [ ] Verify all production webhooks and database connections

Exit criteria:

- No production dependency on localhost URLs
- Production services are reachable over HTTPS
- All core workflows pass smoke tests

### Phase 5C - Performance and Abuse Protection

**Status:** Pending Phase 5B

Goal: Make production usage stable under early customer load.

Tasks:

- [ ] Add rate limiting
- [ ] Add caching where useful, likely with Upstash Redis
- [ ] Add missing database indexes
- [ ] Review n8n/MySQL connection behavior
- [ ] Add graceful error handling for rate limits and provider failures

### Phase 5D - Monitoring and Delivery

**Status:** Pending Phase 5B

Goal: Add basic observability and deployment safety.

Tasks:

- [ ] Add error tracking
- [ ] Add uptime monitoring
- [ ] Add CI checks
- [ ] Add deployment verification checklist
- [ ] Document incident and rollback steps

## Future Phases

### Phase 6 - Real Social Media Publishing

**Status:** Future

Goal: Publish scheduled posts to real platforms through Buffer, Ayrshare, Meta Graph API, or another approved provider.

Do not start until Phase 5A tenant isolation is complete.

### Phase 7 - Team Workspaces

**Status:** Future

Goal: Add workspace/team collaboration and role-based access.

### Phase 8 - Analytics and Reporting

**Status:** Future

Goal: Track content performance and generate reports.

### Phase 9 - Billing

**Status:** Future

Goal: Add subscriptions, usage limits, and billing portal.

## Current Recommended Next Step

Implement Phase 5A Security Foundation.

Start with database migration design and Clerk authentication plan before editing workflows.
