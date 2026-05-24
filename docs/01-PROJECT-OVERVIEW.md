# 01 — Project Overview

## Product idea

The long-term product is an AI automation SaaS for social media content operations.

It will eventually help customers:

- Create a brand profile
- Generate content ideas
- Generate captions
- Approve posts
- Schedule posts
- Track post status
- Generate reports

## Current phase

This project has moved beyond the first local skeleton.

Current local scope includes:

- Customer create/list/detail
- Brand profile create/list/update
- Post draft create/list/update
- Content planning without AI
- AI model content idea generation through n8n
- AI model caption generation through n8n
- AI model caption rewrite through n8n
- Dedicated post scheduling workflow
- Approval workflow for review decisions
- Scheduled post list
- Schedule simulation
- Dashboard summary
- Workflow logs
- Frontend and n8n validation/error handling

It is still not the full SaaS. Final production AI setup, real social publishing,
authentication, workspaces, and billing are future milestones.

## Local skeleton architecture

```text
Browser
  ↓
Next.js frontend
  ↓ HTTP POST
n8n webhook
  ↓ SQL insert
MySQL database
  ↑
DBeaver database client
```

## Why n8n is used

n8n is the first automation backend layer.

It currently handles:

- Webhook receiving
- Simple workflow logic
- Database insert/update
- Workflow logging
- Schedule simulation
- Temporary DeepSeek-backed AI generation
- Dedicated post scheduling
- Approval decisions

Later, it may handle:

- Final production AI model calls
- Real scheduled publishing workflows
- Social posting workflows

## Why MySQL is used

MySQL stores SaaS data:

- Customers
- Brand profiles
- Posts
- Publishing status
- Workflow logs

## Why Docker is used

Docker gives a repeatable local environment.

Instead of installing MySQL and n8n directly on the machine, Docker runs them as containers.

## First MVP workflow

```text
User opens frontend at localhost:3000
User fills customer form
User clicks submit
Frontend sends POST request to n8n webhook
n8n inserts customer into MySQL
User opens DBeaver and sees new customer row
```

## First database entities

Start with these tables:

- `customers`
- `brand_profiles`
- `posts`
- `workflow_logs`

## Future entities

Later phases may add:

- `users`
- `workspaces`
- `social_accounts`
- `content_calendars`
- `subscriptions`
- `analytics_snapshots`
