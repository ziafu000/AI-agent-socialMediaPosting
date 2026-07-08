# 09 - Backend Contract

This document separates the current local n8n contract from the target production contract.

## Current Backend Style

The current backend is implemented mainly as n8n workflows exposed through webhooks.

Current request flow:

```text
Next.js browser client -> n8n webhook -> MySQL
```

The current local MVP works, but it is not a production security boundary.

## Current Contract Rules

Current local endpoints:
- Do not require authentication.
- Do not require `user_id`.
- Trust direct webhook requests from the frontend.
- Use current table relationships such as `customer_id`, `brand_profile_id`, and `post_id`.

The actual database schema source is:
- `docker/mysql/init/001_init.sql`

## Current Entity Contracts

### Customers

Core fields:
- `id`
- `name`
- `email`
- `phone`
- `company`
- `industry`
- `status`
- `notes`
- timestamps

Current limitation:
- `email` is globally unique.
- There is no `user_id` owner column yet.

### Brand Profiles

Core fields:
- `id`
- `customer_id`
- `brand_name`
- `brand_voice`
- `target_audience`
- `industry`
- `brand_colors`
- `logo_url`
- `website_url`
- `social_handles`
- `content_guidelines`
- timestamps

Current limitation:
- Ownership is only indirect through `customer_id`.
- There is no tenant isolation yet.

### Posts

Core fields:
- `id`
- `customer_id`
- `brand_profile_id`
- `title`
- `content`
- `platform`
- `status`
- `scheduled_at`
- `published_at`
- `ai_generated`
- `metadata`
- timestamps

Current statuses:
- `draft`
- `scheduled`
- `published`
- `failed`

Current limitation:
- No real social media publishing integration is implemented yet.
- Post ownership is not isolated by authenticated user yet.

### Workflow Logs

Core fields:
- `id`
- `workflow_name`
- `execution_id`
- `status`
- `input_data`
- `output_data`
- `error_message`
- timestamps

Current use:
- Operational logging for n8n workflows.

## Current API Response Shape

Keep responses predictable for frontend code:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

Error shape:

```json
{
  "success": false,
  "error": "Human-readable error"
}
```

## Current Limitations

The current backend contract is local-MVP only:
- No authentication.
- No tenant/user isolation.
- No internal API key validation.
- No server-side Next.js API boundary.
- Direct browser access to webhook URLs.
- n8n SQL queries are not consistently scoped by authenticated user.

## Target Phase 5A Contract

Phase 5A should define a production-safe internal contract between Next.js server routes and n8n.

Target request flow:

```text
Browser -> Next.js API route -> n8n protected webhook -> MySQL
```

Target rules:
- Browser never sends trusted `user_id` directly to n8n.
- Next.js verifies the authenticated session.
- Next.js derives `user_id` from Clerk/server-side auth.
- Next.js forwards trusted `user_id` to n8n.
- Next.js includes internal auth when calling n8n.
- n8n rejects requests without valid internal auth.
- n8n queries must filter tenant-scoped tables by `user_id`.

## Target Protected Request Metadata

Recommended server-to-n8n metadata:
- `user_id` - trusted authenticated user id
- `request_id` - optional trace id
- `source` - expected internal caller identifier
- internal auth header or API key

Do not trust equivalent fields when they come directly from browser requests.

## Target Error Semantics

Recommended production errors:
- `401` - missing or invalid user session at Next.js boundary
- `403` - internal auth failed or user cannot access resource
- `404` - resource not found within current user's tenant scope
- `409` - unique constraint or state conflict
- `422` - validation error
- `500` - unexpected workflow/server error

## Migration Rules

During Phase 5A, keep every endpoint labeled as either current or target.

Do not update only one layer. Contract-impacting changes must be synchronized across:
- database schema
- n8n workflows
- frontend request client/API routes
- documentation

Safe migration order:
1. Add `user_id` target schema and migration plan.
2. Add authentication to frontend/server routes.
3. Add internal auth to n8n entrypoints.
4. Update SQL queries to filter by `user_id`.
5. Move frontend calls behind Next.js server routes.
6. Verify tenant isolation with at least two users.

## Out of Scope Until After Phase 5A

Do not prioritize these until tenant isolation and internal API security are complete:
- Real social platform posting APIs
- Multi-workspace billing plans
- Advanced analytics
- External customer self-service portals
- Large-scale queue optimization
