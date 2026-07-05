# 01 - Project Overview

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
- AI content idea generation via 9router (OpenAI-compatible)
- AI caption generation via 9router
- AI caption rewrite via 9router
- Dedicated post scheduling workflow
- Approval workflow for review decisions
- Scheduled post list
- Schedule simulation
- Dashboard summary
- Workflow logs
- Frontend and n8n validation/error handling

It is still not the full SaaS. Real social publishing, authentication, workspaces, and billing are future milestones.

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
DBeaver / Adminer database client
```

## Why n8n is used

n8n is the backend automation layer.

It currently handles:

- Webhook receiving
- Simple workflow logic
- Database insert/update
- Workflow logging
- Schedule simulation
- AI generation via 9router API (OpenAI-compatible endpoint)
- Dedicated post scheduling
- Approval decisions

Later, it may handle:

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

## First database entities

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
