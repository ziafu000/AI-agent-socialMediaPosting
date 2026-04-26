# 13 — Troubleshooting

## Docker containers do not start

Run:

```bash
docker compose logs
```

Check specific service:

```bash
docker logs -f ai_social_mysql
docker logs -f ai_social_n8n
```

## Port already in use

If MySQL port is busy:

```text
Port 3306 is already allocated
```

Solution:

Change `.env`:

```env
MYSQL_PORT=3307
```

Then DBeaver should connect to port `3307`.

## n8n cannot connect to MySQL

Inside n8n credentials, use:

```text
Host: mysql
```

Not:

```text
Host: localhost
```

Reason:

`localhost` inside the n8n container means the n8n container itself, not the MySQL container.

## DBeaver cannot connect to MySQL

Use:

```text
Host: localhost
Port: 3306
Database: ai_social_saas
Username: ai_social_user
Password: ai_social_password
```

Check container:

```bash
docker ps
```

Check MySQL logs:

```bash
docker logs -f ai_social_mysql
```

## SQL init file did not run

MySQL init scripts only run when the database volume is created for the first time.

If you changed:

```text
docker/mysql/init/001_init.sql
```

and want it to rerun:

```bash
docker compose down -v
docker compose up -d
```

Warning:

This deletes local MySQL data.

## Frontend gets fetch error

Check:

- n8n is running
- frontend env variable is correct
- n8n workflow is in test mode if using `/webhook-test/`
- workflow is active if using `/webhook/`

## n8n test webhook does not respond

In n8n, click:

```text
Listen for test event
```

Then submit from frontend.

The test URL only works while n8n is waiting for a test event.

## n8n active webhook does not respond

Activate the workflow in n8n.

Then use:

```text
/webhook/create-customer
```

not:

```text
/webhook-test/create-customer
```

## Credentials broke after restart

If n8n credentials cannot be decrypted, check whether `N8N_ENCRYPTION_KEY` changed.

Keep the same key in `.env` after credentials are created.
