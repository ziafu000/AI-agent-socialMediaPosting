# 07 — n8n Workflows

## Current workflow scope

Active local workflows now include:

- `Create Customer`
- `Save Brand Profile`
- `Create Post`
- `Update Brand Profile`
- `Update Post`
- `List Customers`
- `Get Customer Detail`
- `List Brand Profiles`
- `List Posts`
- `List Scheduled Posts`
- `List Workflow Logs`
- `Run Schedule Simulation`
- `Dashboard Summary`

An additional importable stub workflow now exists for AI generation prototyping:

- `n8n/workflows/generate-content-ideas-stub-workflow.json`
- `n8n/workflows/generate-caption-stub-workflow.json`
- `n8n/workflows/rewrite-caption-stub-workflow.json`

The exported local workflow state is tracked in:

```text
n8n/workflows/local-active-workflows.json
```

The validation-patched export is generated into:

```text
n8n/workflows/local-active-workflows.validation.json
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

## Validation and error handling

Validation is now active on the main input workflows:

- `Create Customer`
- `Save Brand Profile`
- `Create Post`
- `Update Brand Profile`
- `Update Post`
- `Get Customer Detail`

Current behavior:

- invalid input returns HTTP `400`
- response shape is standardized:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Reason here"
}
```

- import/export patch helper:

```text
node scripts/patch-n8n-validation.mjs n8n/workflows/local-active-workflows.json n8n/workflows/local-active-workflows.validation.json
```

- after importing workflows, reactivate all and restart n8n:

```text
docker exec ai_social_n8n n8n update:workflow --all --active=true
docker restart ai_social_n8n
```

## Data consistency behavior

Current consistency rules:

- `Save Brand Profile` updates the latest existing row when `customer_id + brand_name` already exists
- `Create Post` avoids inserting another row for the same exact draft payload
- `Update Brand Profile` returns `404` if the target row does not exist
- `Update Post` returns `404` if the target row does not exist

Historical junk rows are not auto-deleted by the workflow patch.

Use this report before manual cleanup:

```text
npm run data:consistency:report
```

## Future workflows

### Generate Content Ideas

```text
POST /webhook/generate-content-ideas
```

The current intended implementation path is:

```text
Webhook -> Validate Input -> Generate Stub Ideas -> Respond to Webhook
```

The `Generate Stub Ideas` node is the only node that should need to change when
moving from stub output to a real model API.

### Generate Caption

```text
POST /webhook/generate-caption
```

The current intended implementation path is:

```text
Webhook -> Validate Input -> Generate Stub Caption -> Respond to Webhook
```

The `Generate Stub Caption` node is the only node that should need to change
when moving from stub output to a real model API.

### Rewrite Caption

```text
POST /webhook/rewrite-caption
```

The current intended implementation path is:

```text
Webhook -> Validate Input -> Rewrite Stub Caption -> Respond to Webhook
```

The `Rewrite Stub Caption` node is the only node that should need to change
when moving from stub output to a real model API.

### Schedule Post

```text
POST /webhook/schedule-post
```

Scheduling exists today through `Create Post` and `Update Post` by setting
`status = scheduled` and `scheduled_at`. A dedicated `schedule-post` webhook has
not been implemented yet.
