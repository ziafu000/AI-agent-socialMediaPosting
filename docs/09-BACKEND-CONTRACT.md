# 09 - Backend Contract

## Current backend style

n8n acts as the backend automation layer.

The frontend communicates with n8n using HTTP webhooks.

Production/local active webhook URLs use:

```text
http://localhost:5678/webhook/{path}
```

Test-mode webhook URLs use:

```text
http://localhost:5678/webhook-test/{path}
```

## Common error response

Current standardized shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Reason here"
}
```

Status codes now used:

- `400` for validation failure
- `404` when an update target record does not exist

## Contract 1 - Create Customer

Implemented endpoint:

```text
POST http://localhost:5678/webhook/create-customer
```

Request body:

```json
{
  "name": "string",
  "email": "string",
  "company_name": "string",
  "industry": "string"
}
```

Required fields:

```text
name
email
```

Success response:

```json
{
  "success": true,
  "message": "Customer saved successfully"
}
```

Behavior:

- inserts a new customer
- updates the existing customer when `email` already exists

## Contract 2 - Save Brand Profile

Implemented endpoint:

```text
POST http://localhost:5678/webhook/save-brand-profile
```

Request body:

```json
{
  "customer_id": 1,
  "brand_name": "Demo Spa",
  "target_audience": "Women aged 25-40",
  "brand_voice": "Professional, friendly, trustworthy",
  "products_services": "Facial care, acne treatment, skincare consulting",
  "default_cta": "Message us for a free consultation",
  "words_to_use": "safe, gentle, expert",
  "words_to_avoid": "guaranteed cure, miracle"
}
```

Required fields:

```text
customer_id
brand_name
```

Success response:

```json
{
  "success": true,
  "message": "Brand profile saved successfully"
}
```

Behavior:

- updates the latest existing row when `customer_id + brand_name` already exists
- inserts a new row when no matching brand profile exists

## Contract 3 - Create Post

Implemented endpoint:

```text
POST http://localhost:5678/webhook/create-post
```

Request body:

```json
{
  "customer_id": 1,
  "platform": "facebook",
  "topic": "3 common skincare mistakes",
  "caption": "Post caption",
  "hashtags": "#skincare",
  "status": "draft",
  "scheduled_at": ""
}
```

Required fields:

```text
customer_id
platform
topic
status
```

Behavior:

- avoids inserting another row for the same exact post draft payload
- `status = scheduled` requires `scheduled_at`

## Contract 4 - Update Brand Profile

Implemented endpoint:

```text
POST http://localhost:5678/webhook/update-brand-profile
```

Returns `404` when the target brand profile does not exist.

## Contract 5 - Update Post

Implemented endpoint:

```text
POST http://localhost:5678/webhook/update-post
```

Returns `404` when the target post does not exist.

## Contract 6 - Read and Utility Endpoints

Implemented endpoints:

```text
POST http://localhost:5678/webhook/list-customers
POST http://localhost:5678/webhook/get-customer-detail
POST http://localhost:5678/webhook/list-brand-profiles
POST http://localhost:5678/webhook/list-posts
POST http://localhost:5678/webhook/list-scheduled-posts
POST http://localhost:5678/webhook/list-workflow-logs
POST http://localhost:5678/webhook/run-schedule-simulation
POST http://localhost:5678/webhook/dashboard-summary
```

## Contract 7 - Generate Content Ideas

Implemented as a stub-compatible production contract.

Current endpoint:

```text
POST http://localhost:5678/webhook/generate-content-ideas
```

Current request body:

```json
{
  "customer_id": 1,
  "brand_profile_id": 1,
  "platforms": ["facebook", "instagram"],
  "content_pillars": ["education", "trust"],
  "number_of_posts": 6,
  "campaign": "June skincare education",
  "offer": "Acne treatment package",
  "call_to_action": "Book a consultation"
}
```

Current response:

```json
{
  "success": true,
  "posts": [
    {
      "platform": "facebook",
      "topic": "3 common skincare mistakes",
      "content_pillar": "education",
      "goal": "build_trust",
      "caption": "Post draft text here",
      "hashtags": "#facebook #skincare"
    }
  ]
}
```

Behavior:

- the current workflow returns deterministic stub data through one generator node
- later production swap should replace only that generator node with a real model node
- frontend should treat this contract as stable and should not depend on whether the source is stub or model

## Contract 8 - Generate Caption

Implemented as a stub-compatible production contract.

Current endpoint:

```text
POST http://localhost:5678/webhook/generate-caption
```

Current request body:

```json
{
  "customer_id": 1,
  "brand_profile_id": 1,
  "brand_name": "Demo Spa",
  "target_audience": "Women aged 25-40",
  "brand_voice": "Professional and friendly",
  "default_cta": "Book a consultation",
  "words_to_use": "safe, expert",
  "platform": "facebook",
  "topic": "3 common skincare mistakes",
  "content_pillar": "education",
  "goal": "build_trust",
  "campaign": "June skincare education",
  "offer": "Acne treatment package",
  "call_to_action": "Book a consultation"
}
```

Current response:

```json
{
  "success": true,
  "caption": "Post draft text here",
  "hashtags": "#facebook #education #june"
}
```

Behavior:

- the current workflow returns deterministic stub caption data through one generator node
- later production swap should replace only that generator node with a real model node
- the content planner updates only the selected idea card when caption generation succeeds

## Contract 9 - Rewrite Caption

Implemented as a stub-compatible production contract.

Current endpoint:

```text
POST http://localhost:5678/webhook/rewrite-caption
```

Current request body extends `Generate Caption` with:

```json
{
  "current_caption": "Existing caption text",
  "current_hashtags": "#facebook #education",
  "rewrite_style": "shorter"
}
```

Allowed `rewrite_style` values:

```text
shorter
more_engaging
more_professional
more_sales_focused
```

Current response:

```json
{
  "success": true,
  "caption": "Rewritten caption text here",
  "hashtags": "#facebook #education"
}
```

Behavior:

- the current workflow returns deterministic stub rewrite data through one generator node
- later production swap should replace only that generator node with a real model node
- the content planner updates only the selected idea card when rewrite succeeds

## Contract 10 - Dedicated Schedule Post

Implemented endpoint:

```text
POST http://localhost:5678/webhook/schedule-post
```

Request body:

```json
{
  "id": 1,
  "scheduled_at": "2026-05-14T21:30"
}
```

Required fields:

```text
id
scheduled_at
```

Success response:

```json
{
  "success": true,
  "message": "Post scheduled successfully"
}
```

Behavior:

- validates the target post ID and schedule datetime
- returns `404` when the target post does not exist
- updates `posts.status` to `scheduled`
- updates `posts.scheduled_at`
- writes a `workflow_logs` row with `event_type = schedule_post`
