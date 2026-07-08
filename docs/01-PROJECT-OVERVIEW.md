# 01 - Project Overview

## Product Vision

**AI automation SaaS for social media content operations** - transitioning from local MVP to production-ready multi-tenant platform.

### Target Market
- Small businesses and solopreneurs (1-10 social accounts)
- Marketing agencies managing multiple clients
- Content creators needing consistent posting

### Value Proposition
- **AI-powered content generation** using cost-effective models (9router)
- **Multi-tenant architecture** for agency use cases
- **Free tier** for first 1,000 users (zero infrastructure cost)
- **Scalable** to 10,000+ users with minimal operational overhead

## Core Features (Current + Planned)

### ✅ Completed (Local MVP)
- Customer account management
- Brand profile configuration (voice, audience, products)
- AI content idea generation (via 9router)
- AI caption generation and rewriting
- Post draft management with status lifecycle
- Approval workflow (draft → review → approved → scheduled)
- Schedule simulation
- Dashboard analytics
- Workflow logging for debugging

### 🚧 In Progress (Production Readiness - Weeks 1-8)
- **Authentication** - Clerk (free tier: 10k MAU)
- **Multi-tenancy** - Full data isolation per user
- **API Security** - API key validation, rate limiting
- **Cloud Deployment** - Vercel + Fly.io + Railway (all free tiers)
- **Caching** - Upstash Redis (free tier)
- **Monitoring** - Sentry + UptimeRobot + Grafana (all free tiers)

### 📋 Future Phases
- **Phase 5**: Real social media posting (Buffer/Ayrshare integration)
- **Phase 6**: Team workspaces and collaboration
- **Phase 7**: Usage-based billing for premium features
- **Phase 8**: Advanced analytics and reporting

## Architecture Evolution

### Current (Local Development)
```text
Next.js Frontend (localhost:3000)
    ↓ HTTP POST
n8n Webhooks (localhost:5678)
    ↓ SQL queries
MySQL Database (localhost:3306)
    ↑
DBeaver/Adminer (inspection)
```

**Infrastructure:** Docker Compose (dev-only)
**Cost:** $0 (local machine)
**Scalability:** Single-user, non-isolated

### Target (Production - Week 4)
```text
Vercel Frontend (Global CDN)
    ↓ HTTPS + Auth
Fly.io n8n (3 VMs, multi-region)
    ↓ Connection pooling
Railway MySQL (Managed, auto-backup)
    ↕
Upstash Redis (Global cache)
```

**Infrastructure:** Serverless + managed services
**Cost:** $0/month (free tiers for first 1,000 users)
**Scalability:** Horizontal (auto-scaling to 10k+ users)

### Technology Choices (Cost-Optimized)

**Why n8n:**
- Open-source workflow automation
- Visual workflow editor (non-technical users can modify)
- Self-hostable (no vendor lock-in)
- Free on Fly.io (3 VMs)

**Why MySQL:**
- Proven reliability for SaaS
- Strong foreign key support (multi-tenancy)
- Free on Railway (1GB) / PlanetScale (5GB)
- Easy replication for scaling

**Why Clerk:**
- Free up to 10,000 MAU
- Built-in social login
- No backend auth code needed
- Secure by default

**Why Upstash Redis:**
- Serverless (no connection pooling needed)
- Free tier: 10,000 commands/day
- Global replication
- REST API (works from edge functions)

**Why Vercel:**
- Free unlimited deployments
- Global CDN included
- Automatic SSL
- Zero-config Next.js optimization

## Database Schema

### Core Tables (Multi-Tenant Ready)
```sql
-- All tables include user_id for tenant isolation
customers (id, user_id, name, email, company_name, industry)
brand_profiles (id, user_id, customer_id, brand_name, target_audience, brand_voice...)
posts (id, user_id, customer_id, platform, topic, caption, status, scheduled_at...)
workflow_logs (id, workflow_name, event_type, status, input_payload, output_payload...)
```

### Future Tables (Phase 6+)
```sql
users (id, clerk_user_id, email, role, created_at)
workspaces (id, name, owner_user_id, plan_tier)
workspace_members (workspace_id, user_id, role)
api_keys (id, user_id, api_key, created_at)
social_accounts (id, user_id, platform, access_token, expires_at)
subscriptions (id, user_id, plan_tier, stripe_subscription_id)
```

## Cost Structure & Scalability

| Users | Monthly Cost | Bottleneck |
|-------|--------------|------------|
| 0-1,000 | **$0** | Free tiers sufficient |
| 1,000-10,000 | **$30** | MySQL storage, Redis commands |
| 10,000-50,000 | **$131** | n8n compute, Clerk MAU |
| 50,000+ | **$500+** | Requires dedicated infrastructure |

**Key Insight:** Architecture designed to maximize free tier coverage while maintaining production-grade reliability.
