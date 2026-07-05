# 07 - n8n Workflows

## Active workflows

| Workflow | Webhook path |
|---|---|
| Create Customer | `/webhook/create-customer` |
| Save Brand Profile | `/webhook/save-brand-profile` |
| Create Post | `/webhook/create-post` |
| Update Brand Profile | `/webhook/update-brand-profile` |
| Update Post | `/webhook/update-post` |
| List Customers | `/webhook/list-customers` |
| Get Customer Detail | `/webhook/get-customer-detail` |
| List Brand Profiles | `/webhook/list-brand-profiles` |
| List Posts | `/webhook/list-posts` |
| List Scheduled Posts | `/webhook/list-scheduled-posts` |
| List Workflow Logs | `/webhook/list-workflow-logs` |
| Run Schedule Simulation | `/webhook/run-schedule-simulation` |
| Dashboard Summary | `/webhook/dashboard-summary` |
| Generate Content Ideas | `/webhook/generate-content-ideas` |
| Generate Caption | `/webhook/generate-caption` |
| Rewrite Caption | `/webhook/rewrite-caption` |
| Schedule Post | `/webhook/schedule-post` |
| Review Post | `/webhook/review-post` |

The exported workflow state is tracked in:

```text
n8n/workflows/local-active-workflows.json
```

## Standard workflow pattern

```text
Webhook -> Validate Input -> Is Valid -> [Logic] -> Respond to Webhook
                                      -> Respond Validation Error (400)
```

## AI workflows

All 3 AI workflows call an OpenAI-compatible endpoint via `this.helpers.httpRequest()` inside a Code node.

Env vars used inside Code nodes:

```text
.NINEROUTER_API_KEY
.NINEROUTER_API_URL
.NINEROUTER_API_MODEL
```

These are readable because `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` is set in docker-compose.yml.

### Generate Content Ideas

```text
POST /webhook/generate-content-ideas
```

Flow:

```text
Webhook -> Validate Input -> Call 9Router Ideas -> Respond to Webhook
                          -> Respond Validation Error
```

Disconnected fallback stub node `Generate Stub Ideas` is kept inside the workflow but not connected.

### Generate Caption

```text
POST /webhook/generate-caption
```

Flow:

```text
Webhook -> Validate Input -> Call 9Router Caption -> Respond to Webhook
                          -> Respond Validation Error
```

Disconnected fallback stub node `Generate Stub Caption` is kept inside the workflow but not connected.

### Rewrite Caption

```text
POST /webhook/rewrite-caption
```

Flow:

```text
Webhook -> Validate Input -> Call 9Router Rewrite -> Respond to Webhook
                          -> Respond Validation Error
```

Disconnected fallback stub node `Rewrite Stub Caption` is kept inside the workflow but not connected.

## Schedule Post workflow

```text
POST /webhook/schedule-post
```

Flow:

```text
Webhook -> Validate Input -> Find Post -> Post Found -> Update Schedule -> Log Schedule -> Respond to Webhook
                          -> Respond Validation Error
                                                     -> Respond Post Not Found (404)
```

Updates post to `status = scheduled`, stores `scheduled_at`, writes workflow log row.

## Review Post workflow

```text
POST /webhook/review-post
```

Flow:

```text
Webhook -> Validate Input -> Find Post -> Validate Transition -> Transition Valid -> Update Review Status -> Log Review -> Respond to Webhook
                          -> Respond Validation Error
                                       -> Respond Post Not Found (404)
                                                               -> Respond Transition Error (400)
```

Supported actions:

```text
approve : needs_review -> approved
reject  : needs_review -> cancelled
cancel  : draft/needs_review/approved/scheduled -> cancelled
```

Writes workflow log rows with event types: `approve_post`, `reject_post`, `cancel_post`.

## Validation and error handling

Validation is active on all input workflows. Invalid input returns HTTP 400.

Standard error response shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Reason here"
}
```

## Importing and activating workflows

```powershell
docker cp "path\to\local-active-workflows.json" ai_social_n8n:/tmp/workflows.json
docker exec ai_social_n8n n8n import:workflow --input=/tmp/workflows.json
```

After import, publish each workflow individually (n8n v2.x deprecates --all):

```powershell
docker exec ai_social_n8n n8n publish:workflow --id=<workflow-id>
```

Then restart n8n:

```powershell
docker restart ai_social_n8n
```

## MySQL credential inside n8n

Inside Docker, n8n must connect to MySQL using:

```text
Host: mysql
Port: 3306
```

Do not use `localhost` as MySQL host inside n8n containers.

## Data consistency rules

- Save Brand Profile: upserts on `customer_id + brand_name`
- Create Post: duplicate-safe on identical payload
- Update Brand Profile: returns 404 if row not found
- Update Post: returns 404 if row not found
