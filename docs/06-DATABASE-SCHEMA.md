# 06 - Database Schema

This document separates the actual local schema from the target production schema.
The actual source of truth for the current local database is `docker/mysql/init/001_init.sql`.

## Database Name

```text
ai_social_saas
```

## Current Local Schema

Status: implemented in local Docker MySQL.

Current tables:

| Table | Purpose | Current tenant isolation |
|---|---|---|
| `customers` | Customer/client records | Missing `user_id` |
| `brand_profiles` | Brand configuration | Missing `user_id` |
| `posts` | Draft, reviewed, scheduled, and simulated publishing state | Missing `user_id` |
| `workflow_logs` | n8n workflow activity logs | Global logs |

Important current limitations:

- `customers.email` is globally unique in the current local schema.
- `user_id` is not present yet.
- `api_keys` table is not present yet.
- Existing n8n SQL queries are not tenant-isolated yet.

## Target Production Schema

Status: target design, not fully implemented yet.

Tenant-scoped tables should include:

```text
user_id VARCHAR(255) NOT NULL
```

Target tenant-scoped tables:

- `customers`
- `brand_profiles`
- `posts`

Target security/support tables:

- `api_keys` or equivalent internal API authentication table/mechanism
- `workflow_logs` may remain global, but should avoid storing sensitive payloads where possible

## Target Table Changes

### `customers`

Target changes:

- Add `user_id`
- Replace globally unique `email` with unique `(user_id, email)`
- Add index on `user_id`

Target uniqueness:

```sql
UNIQUE KEY unique_user_email (user_id, email)
```

### `brand_profiles`

Target changes:

- Add `user_id`
- Add index on `user_id`
- Ensure referenced `customer_id` belongs to the same `user_id`
- Prefer tenant-aware lookup/update patterns

### `posts`

Target changes:

- Add `user_id`
- Add index on `user_id`
- Ensure referenced `customer_id` belongs to the same `user_id`
- All reads and updates must filter by both `id` and `user_id` where applicable

### `api_keys`

Target table, not implemented yet:

```sql
CREATE TABLE api_keys (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  INDEX idx_api_key (api_key),
  INDEX idx_user_id (user_id)
);
```

## Migration Direction

Do not modify production data or reset volumes without explicit approval.

Recommended migration order:

1. Add nullable or temporary-default `user_id` columns to tenant-scoped tables
2. Backfill existing local data to a known Clerk test user
3. Add indexes on `user_id`
4. Change app and n8n workflows to write/read `user_id`
5. Verify tenant isolation
6. Tighten constraints and remove temporary defaults
7. Add `api_keys` or approved internal auth mechanism

Example migration sketch:

```sql
ALTER TABLE customers ADD COLUMN user_id VARCHAR(255) NULL;
ALTER TABLE brand_profiles ADD COLUMN user_id VARCHAR(255) NULL;
ALTER TABLE posts ADD COLUMN user_id VARCHAR(255) NULL;

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

Use a reviewed migration file for real implementation. Do not rely only on editing `001_init.sql` if existing data must be preserved.

## Post Status Lifecycle

Normal path:

```text
draft -> needs_review -> approved -> scheduled -> publishing -> published
```

Failure path:

```text
scheduled -> publishing -> failed
```

Cancel path:

```text
draft/needs_review/approved/scheduled -> cancelled
```

## Local Database Access

DBeaver/Adminer connection:

```text
Host: localhost
Port: 3306
Database: ai_social_saas
Username: ai_social_user
Password: ai_social_password
```

Root login:

```text
Username: root
Password: rootpassword
```
