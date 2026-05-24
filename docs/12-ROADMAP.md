# 12 - Roadmap

## Phase 0 - Local skeleton

Goal:

```text
Frontend -> n8n -> MySQL works locally.
```

Tasks:

- Create GitHub repo
- Add Docker Compose
- Run MySQL container
- Run n8n container
- Connect DBeaver to MySQL
- Create Next.js frontend
- Create customer form
- Create n8n webhook
- Insert customer into MySQL

Done when:

```text
Submitting frontend form creates a customer row in MySQL.
```

Current status:

```text
Complete.
```

## Phase 1 - Brand profile management

Goal:

```text
Customer can save and update brand profile data.
```

Tasks:

- Add brand profile form
- Create save brand profile n8n webhook
- Insert/update `brand_profiles`
- Display saved profiles
- Add edit brand profile flow

Current status:

```text
Complete.
```

## Phase 2 - Post draft management

Goal:

```text
Customer can create, view, and edit post drafts.
```

Tasks:

- Add posts table UI
- Add create post form
- Add post status field
- Add edit post page
- Add duplicate-safe draft creation
- Add not-found handling for updates

Current status:

```text
Complete.
```

## Phase 3 - AI content generation

Goal:

```text
Generate post ideas and captions through stable n8n AI-compatible contracts.
```

Completed tasks:

- Add content planner AI mode
- Add `generate-content-ideas` n8n stub workflow
- Add `generate-caption` n8n stub workflow
- Add `rewrite-caption` n8n stub workflow
- Add frontend controls for idea generation, caption generation, and caption rewrite
- Keep contracts stable so production can replace only the stub generator node
- Add temporary connected DeepSeek model nodes
- Keep old stub nodes in n8n as disconnected fallback nodes

Remaining production tasks:

- Replace temporary DeepSeek model nodes with the final production model/provider
- Add stable production API key/credential management

Current status:

```text
Temporary DeepSeek-backed model integration is wired.
The current temporary API key returns 402 until billing/credit is available.
```

## Phase 4 - Scheduling simulation

Goal:

```text
User can set scheduled_at and status becomes scheduled.
```

Tasks:

- Add schedule date field
- Add scheduled status
- Create scheduled posts list
- Add dedicated `schedule-post` workflow
- Add workflow log entries
- Add schedule simulation flow that marks due scheduled posts as published

Current status:

```text
Local scheduling and schedule simulation are complete.
Real social publishing is still pending.
```

## Phase 4.5 - Approval workflow

Goal:

```text
Posts can move through review before scheduling or publishing.
```

Tasks:

- Add approve action for `needs_review` posts
- Add reject/cancel action
- Add review-focused UI
- Add n8n workflow logging for approval decisions
- Keep status transitions explicit and validated

Current status:

```text
Complete.
```

## Phase 5 - Real social posting

Goal:

```text
Scheduled posts can be sent to an external posting service.
```

Possible tools:

- Buffer
- Ayrshare
- Publer
- Direct APIs later

Current status:

```text
Not started.
```

## Phase 6 - Authentication and SaaS structure

Goal:

```text
Multiple users and customers can use the app safely.
```

Tasks:

- Add auth
- Add workspaces
- Add workspace members
- Add access rules

Current status:

```text
Not started.
```

## Phase 7 - Billing

Goal:

```text
Paid subscription controls usage limits.
```

Tasks:

- Add subscription table
- Add usage limits
- Add payment provider
- Add billing page

Current status:

```text
Not started.
```

## Current completed milestones

Completed locally:

- Phase 0 local skeleton
- Phase 1 brand profile management
- Phase 2 post draft management
- Phase 3 AI content generation with temporary DeepSeek model nodes
- Phase 4 scheduling simulation
- Content planning without AI
- Generate content ideas model workflow
- Generate caption model workflow
- Rewrite caption model workflow
- Dedicated schedule post workflow
- Workflow logs
- Customers list and detail
- Dashboard summary
- Dashboard polish
- Validation and error handling
- Data consistency cleanup
- Approval workflow
- Laptop migration guide

## Next recommended milestone

- Phase 5 real social posting

## Future major milestones

- Replace temporary DeepSeek nodes with final production AI provider
- Calendar view
- Social accounts
- Real social posting
- Analytics and reporting
- Authentication and workspaces
- Billing
