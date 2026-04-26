# 06 — Database Schema

## Database name

```text
ai_social_saas
```

## Initial SQL file

File path:

```text
docker/mysql/init/001_init.sql
```

## SQL schema

```sql
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brand_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  target_audience TEXT,
  brand_voice TEXT,
  products_services TEXT,
  default_cta TEXT,
  words_to_use TEXT,
  words_to_avoid TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  platform VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  caption TEXT,
  hashtags TEXT,
  status ENUM('draft', 'needs_review', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled') DEFAULT 'draft',
  scheduled_at DATETIME NULL,
  published_at DATETIME NULL,
  external_post_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workflow_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  status ENUM('success', 'failed') NOT NULL,
  input_payload JSON NULL,
  output_payload JSON NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (name, email, company_name, industry)
VALUES
('Demo Customer', 'demo@example.com', 'Demo Spa', 'Beauty & Spa')
ON DUPLICATE KEY UPDATE email = email;
```

## Table purposes

### `customers`

Stores client/customer identity.

Initial fields:

- Name
- Email
- Company name
- Industry

### `brand_profiles`

Stores brand configuration for AI content generation.

One customer can have multiple brand profiles later, but initially use one profile per customer.

### `posts`

Stores generated or scheduled social posts.

The status field controls the publishing workflow.

### `workflow_logs`

Stores important n8n workflow events.

Useful for debugging.

## Status lifecycle for posts

```text
draft
→ needs_review
→ approved
→ scheduled
→ publishing
→ published
```

Failure path:

```text
scheduled
→ publishing
→ failed
```

Cancel path:

```text
draft/needs_review/approved/scheduled
→ cancelled
```

## DBeaver connection

Use:

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
