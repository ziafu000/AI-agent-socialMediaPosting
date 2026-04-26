# 03 — Repository Structure

## Root folder

```text
ai-social-saas/
├── apps/
│   └── web/
├── docker/
│   └── mysql/
│       └── init/
├── docs/
├── .env
├── .env.example
├── .gitignore
├── .nvmrc
├── docker-compose.yml
├── package.json
└── README.md
```

## Folder purposes

### `apps/web`

Next.js frontend app.

Contains:

- Pages
- Components
- Client form
- Frontend environment config

### `docker/mysql/init`

Initial SQL scripts for MySQL.

Files in this folder run automatically only when the MySQL volume is created for the first time.

Example:

```text
docker/mysql/init/001_init.sql
```

### `docs`

Project planning and AI coding documents.

These documents explain the architecture, conventions, roadmap, and contracts.

## Root files

### `.env`

Local secrets and local config.

Never commit this file.

### `.env.example`

Safe template for environment variables.

Commit this file.

### `.gitignore`

Prevents secrets, node modules, build folders, and local files from being committed.

### `.nvmrc`

Pins the Node.js major version.

### `docker-compose.yml`

Runs local infrastructure:

- MySQL
- n8n
- Adminer

### `package.json`

Optional root-level scripts.

Useful scripts:

```json
{
  "scripts": {
    "dev:web": "cd apps/web && npm run dev",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:logs:n8n": "docker logs -f ai_social_n8n",
    "docker:logs:mysql": "docker logs -f ai_social_mysql"
  }
}
```
