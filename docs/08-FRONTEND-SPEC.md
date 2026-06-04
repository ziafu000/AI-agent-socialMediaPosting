# 08 — Frontend Specification

## Framework

Use Next.js with:

- App Router
- TypeScript
- Tailwind CSS

## First frontend page

File path:

```text
apps/web/src/app/page.tsx
```

Purpose:

Display a basic form to create a customer.

## Form fields

| Field | Type | Required |
|---|---|---|
| `name` | text | yes |
| `email` | email | yes |
| `company_name` | text | no |
| `industry` | text | no |

## Frontend environment variable

```env
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=http://localhost:5678/webhook-test/create-customer
```

## Request from frontend to n8n

Method:

```text
POST
```

Headers:

```json
{
  "Content-Type": "application/json"
}
```

Body:

```json
{
  "name": "Demo Customer",
  "email": "demo@example.com",
  "company_name": "Demo Spa",
  "industry": "Beauty & Spa"
}
```

## Expected success response

```json
{
  "success": true,
  "message": "Customer saved successfully"
}
```

## Basic UI layout

Use a clean centered card.

```text
Page background: light gray
Card: white, rounded, shadow
Title: AI Social SaaS
Subtitle: Demo frontend gửi thông tin khách hàng sang n8n
Inputs: full width
Button: full width
Result: code block
```

## UX states

The page must handle:

- Empty form
- Loading state
- Success response
- Error response

## Current pages

The frontend now includes:

```text
/app/customers
/app/brand-profile
/app/brand-profiles
/app/brand-profiles/[id]
/app/posts
/app/posts/list
/app/posts/[id]
/app/scheduled-posts
/app/schedule-simulator
/app/content-planner
/app/workflow-logs
/app/dashboard
/app/approvals
```

Current content planner behavior:

- manual planner mode creates deterministic ideas in the browser
- AI mode calls `generate-content-ideas`
- individual ideas can call `generate-caption`
- individual generated captions can call `rewrite-caption`

Current scheduling behavior:

- post edit page can update post content/status
- post edit page can call the dedicated `schedule-post` workflow
- scheduled posts list shows posts with `status = scheduled`

Current approval behavior:

- `/approvals` lists review-related posts
- posts with `needs_review` can be approved or rejected
- draft, needs review, approved, and scheduled posts can be cancelled
- approval actions call the dedicated `review-post` workflow

## Future pages

Later milestones may add:

```text
/app/social-accounts
/app/calendar
/app/settings
/app/billing
```
