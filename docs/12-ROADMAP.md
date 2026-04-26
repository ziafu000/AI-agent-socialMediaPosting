# 12 — Roadmap

## Phase 0 — Local skeleton

Goal:

```text
Frontend → n8n → MySQL works locally.
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

## Phase 1 — Brand profile management

Goal:

```text
Customer can save brand profile.
```

Tasks:

- Add brand profile form
- Create save brand profile n8n webhook
- Insert/update `brand_profiles`
- Display saved profile

## Phase 2 — Post draft management

Goal:

```text
Customer can create and view post drafts.
```

Tasks:

- Add posts table UI
- Add create post form
- Add post status field
- Add edit post page

## Phase 3 — AI content generation

Goal:

```text
Generate post ideas and captions using AI.
```

Tasks:

- Add AI prompt templates
- Add n8n AI workflow
- Save generated posts to MySQL
- Add regenerate/rewrite button

## Phase 4 — Scheduling simulation

Goal:

```text
User can set scheduled_at and status becomes scheduled.
```

Tasks:

- Add schedule date field
- Add scheduled status
- Create scheduled posts list
- Add workflow log entries

## Phase 5 — Real social posting

Goal:

```text
Scheduled posts can be sent to an external posting service.
```

Possible tools:

- Buffer
- Ayrshare
- Publer
- Direct APIs later

## Phase 6 — Authentication and SaaS structure

Goal:

```text
Multiple users and customers can use the app safely.
```

Tasks:

- Add auth
- Add workspaces
- Add workspace members
- Add access rules

## Phase 7 — Billing

Goal:

```text
Paid subscription controls usage limits.
```

Tasks:

- Add subscription table
- Add usage limits
- Add payment provider
- Add billing page

## Current completed milestones

Completed locally:

- Phase 0 local skeleton
- Phase 1 brand profile management
- Phase 2 post draft management
- Phase 4 scheduling simulation
- workflow logs
- customers list and detail
- dashboard summary
- validation and error handling
- data consistency cleanup

Next recommended milestone:

- dashboard polish
