# 09 — Backend Contract

## Current backend style

n8n acts as the backend automation layer.

The frontend communicates with n8n using HTTP webhooks.

## Contract 1 — Create Customer

### Endpoint

Test mode:

```text
POST http://localhost:5678/webhook-test/create-customer
```

Active workflow mode:

```text
POST http://localhost:5678/webhook/create-customer
```

### Request body

```json
{
  "name": "string",
  "email": "string",
  "company_name": "string",
  "industry": "string"
}
```

### Required fields

```text
name
email
```

### Success response

```json
{
  "success": true,
  "message": "Customer saved successfully"
}
```

### Error response

Current standardized shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Reason here"
}
```

Possible status codes now used:

- `400` for validation failure
- `404` when an update target record does not exist

## Contract 2 — Save Brand Profile

Not implemented yet.

Planned endpoint:

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

## Contract 3 — Generate Content Ideas

Not implemented yet.

Planned endpoint:

```text
POST http://localhost:5678/webhook/generate-content-ideas
```

Request body:

```json
{
  "customer_id": 1,
  "brand_profile_id": 1,
  "platforms": ["facebook", "instagram"],
  "number_of_posts": 30
}
```

Expected response:

```json
{
  "success": true,
  "posts": [
    {
      "platform": "facebook",
      "topic": "3 common skincare mistakes",
      "content_pillar": "education",
      "goal": "build_trust"
    }
  ]
}
```
