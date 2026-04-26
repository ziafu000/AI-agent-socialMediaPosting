# 07 — n8n Workflows

## Current workflow

Workflow name:

```text
Create Customer
```

Purpose:

```text
Receive customer form data from frontend and insert it into MySQL.
```

## Workflow diagram

```text
Webhook Trigger
  ↓
MySQL Execute Query
  ↓
Respond to Webhook
```

## Node 1 — Webhook

Node type:

```text
Webhook
```

Settings:

```text
HTTP Method: POST
Path: create-customer
Response mode: Respond to Webhook node
```

Test URL:

```text
http://localhost:5678/webhook-test/create-customer
```

Production/local active URL:

```text
http://localhost:5678/webhook/create-customer
```

## Expected request body

```json
{
  "name": "Demo Customer",
  "email": "demo@example.com",
  "company_name": "Demo Spa",
  "industry": "Beauty & Spa"
}
```

## Node 2 — MySQL credential

Credential type:

```text
MySQL
```

Inside n8n Docker container, use:

```text
Host: mysql
Port: 3306
Database: ai_social_saas
User: ai_social_user
Password: ai_social_password
```

Important:

```text
Do not use localhost as MySQL host inside n8n.
```

## Node 2 — MySQL query

Node type:

```text
MySQL
```

Operation:

```text
Execute Query
```

Query:

```sql
INSERT INTO customers (name, email, company_name, industry)
VALUES (
  '{{ $json.body.name }}',
  '{{ $json.body.email }}',
  '{{ $json.body.company_name }}',
  '{{ $json.body.industry }}'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  company_name = VALUES(company_name),
  industry = VALUES(industry);
```

## Node 3 — Respond to Webhook

Response body:

```json
{
  "success": true,
  "message": "Customer saved successfully"
}
```

## Validation rules for this workflow

The workflow should reject or fail clearly if:

- `name` is missing
- `email` is missing
- email format is invalid

For the first skeleton, this validation may be done later.

## Future workflows

### Save Brand Profile

```text
POST /webhook/save-brand-profile
```

### Generate Content Ideas

```text
POST /webhook/generate-content-ideas
```

### Generate Caption

```text
POST /webhook/generate-caption
```

### Schedule Post

```text
POST /webhook/schedule-post
```
