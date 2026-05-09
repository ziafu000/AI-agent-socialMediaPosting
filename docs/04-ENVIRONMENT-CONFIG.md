# 04 — Environment Configuration

## Root `.env`

File path:

```text
.env
```

Purpose:

Configure Docker services.

Content:

```env
# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=ai_social_saas
MYSQL_USER=ai_social_user
MYSQL_PASSWORD=ai_social_password
MYSQL_PORT=3306

# n8n
N8N_PORT=5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
N8N_ENCRYPTION_KEY=replace_with_a_long_random_string
```

## Frontend `.env.local`

File path:

```text
apps/web/.env.local
```

During n8n test mode:

```env
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=http://localhost:5678/webhook-test/create-customer
```

After activating workflow in n8n:

```env
NEXT_PUBLIC_N8N_CREATE_CUSTOMER_WEBHOOK_URL=http://localhost:5678/webhook/create-customer
```

## Environment naming rule

Frontend public variables must start with:

```text
NEXT_PUBLIC_
```

Backend-only secrets must not start with `NEXT_PUBLIC_`.

## Security rules

Never commit:

- `.env`
- `.env.local`
- Real passwords
- Real API keys
- n8n encryption key

Commit:

- `.env.example`
- Documentation
- Placeholder values only

## n8n encryption key

Use a stable `N8N_ENCRYPTION_KEY` in local development once credentials are created.

If the key changes after credentials are saved, n8n may not be able to decrypt existing credentials.
