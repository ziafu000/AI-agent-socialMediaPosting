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

This phase is not the full SaaS.

This phase is only the local technical skeleton.

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

At the beginning, it will handle:

- Webhook receiving
- Simple workflow logic
- Database insert/update
- Later: AI calls
- Later: scheduled workflows
- Later: social posting workflows

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
