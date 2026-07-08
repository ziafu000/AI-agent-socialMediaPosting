# 07 - n8n Workflows

## Active Workflows (18 Total)

| Workflow | Webhook Path | Multi-Tenant |
|---|---|---|
| Create Customer | `/webhook/create-customer` | ⚠️ Needs `user_id` |
| Save Brand Profile | `/webhook/save-brand-profile` | ⚠️ Needs `user_id` |
| Create Post | `/webhook/create-post` | ⚠️ Needs `user_id` |
| Update Brand Profile | `/webhook/update-brand-profile` | ⚠️ Needs `user_id` |
| Update Post | `/webhook/update-post` | ⚠️ Needs `user_id` |
| List Customers | `/webhook/list-customers` | ⚠️ Needs `user_id` |
| Get Customer Detail | `/webhook/get-customer-detail` | ⚠️ Needs `user_id` |
| List Brand Profiles | `/webhook/list-brand-profiles` | ⚠️ Needs `user_id` |
| List Posts | `/webhook/list-posts` | ⚠️ Needs `user_id` |
| List Scheduled Posts | `/webhook/list-scheduled-posts` | ⚠️ Needs `user_id` |
| List Workflow Logs | `/webhook/list-workflow-logs` | ✅ Global (no user_id) |
| Run Schedule Simulation | `/webhook/run-schedule-simulation` | ⚠️ Needs `user_id` |
| Dashboard Summary | `/webhook/dashboard-summary` | ⚠️ Needs `user_id` |
| Generate Content Ideas | `/webhook/generate-content-ideas` | ⚠️ Needs `user_id` |
| Generate Caption | `/webhook/generate-caption` | ⚠️ Needs `user_id` |
| Rewrite Caption | `/webhook/rewrite-caption` | ⚠️ Needs `user_id` |
| Schedule Post | `/webhook/schedule-post` | ⚠️ Needs `user_id` |
| Review Post | `/webhook/review-post` | ⚠️ Needs `user_id` |

**Workflow Backup:** `n8n/workflows/local-active-workflows.json`

⚠️ **All workflows need updating for production multi-tenancy** - See [19-AUTHENTICATION-IMPLEMENTATION.md](19-AUTHENTICATION-IMPLEMENTATION.md)

---

## Multi-Tenant Workflow Pattern (Production-Ready)

**Required for ALL workflows** (except workflow_logs which is global):

```text
Webhook Trigger
    ↓
Validate user_id (Code Node) ← NEW - Validate authentication
    ↓
IF: user_id valid?
    ├─ No → Respond 401 Unauthorized
    └─ Yes → Validate Input
                ↓
             IF: Input valid?
                ├─ No → Respond 400 Validation Error
                └─ Yes → [Business Logic with user_id filter]
                            ↓
                         Respond to Webhook
```

### Step 1: Add user_id Validation Node

**Insert IMMEDIATELY after Webhook Trigger** in every workflow:

**Node Name:** "Validate user_id"  
**Node Type:** Code  
**Code:**

```javascript
// Extract user_id from request body
const userId = $input.all()[0].json.body.user_id;

// Validate user_id exists and is non-empty
if (!userId || typeof userId !== 'string' || userId.trim() === '') {
  return {
    success: false,
    message: 'Unauthorized',
    error: 'Missing or invalid user_id',
    statusCode: 401
  };
}

// Pass through with validated user_id
return {
  user_id: userId.trim(),
  ...($input.all()[0].json.body)
};
```

### Step 2: Add IF Node for Auth Check

**Node Name:** "Check Auth"  
**Node Type:** IF  
**Condition:** `{{ $json.statusCode === 401 }}`

- **True Branch:** → Respond 401 Error
- **False Branch:** → Continue to existing validation

### Step 3: Update ALL SQL Queries

**Pattern for SELECT queries:**

```sql
-- Before (NO tenant isolation - SECURITY RISK!)
SELECT * FROM customers;

-- After (WITH tenant isolation - SECURE)
SELECT * FROM customers 
WHERE user_id = '{{ $json.user_id }}';
```

**Pattern for INSERT queries:**

```sql
-- Before
INSERT INTO customers (name, email) 
VALUES ('{{ $json.name }}', '{{ $json.email }}');

-- After (include user_id)
INSERT INTO customers (user_id, name, email)
VALUES ('{{ $json.user_id }}', '{{ $json.name }}', '{{ $json.email }}');
```

**Pattern for UPDATE/DELETE queries:**

```sql
-- Before (ANYONE can update ANY record - SECURITY RISK!)
UPDATE posts 
SET status = 'scheduled' 
WHERE id = {{ $json.id }};

-- After (only owner can update - SECURE)
UPDATE posts 
SET status = 'scheduled'
WHERE id = {{ $json.id }} AND user_id = '{{ $json.user_id }}';
```

---

## Standard Workflow Pattern (Local Dev - Needs Migration)

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
