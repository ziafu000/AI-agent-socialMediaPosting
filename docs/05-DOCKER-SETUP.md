# 05 — Docker Setup

## Goal

Run local infrastructure with one command:

```bash
docker compose up -d
```

## Services

| Service | Container name | Port | Purpose |
|---|---|---:|---|
| MySQL | `ai_social_mysql` | `3306` | Main database |
| n8n | `ai_social_n8n` | `5678` | Automation backend |
| Adminer | `ai_social_adminer` | `8080` | Optional DB viewer |

## `docker-compose.yml`

File path:

```text
docker-compose.yml
```

Content:

```yaml
services:
  mysql:
    image: mysql:8.4
    container_name: ai_social_mysql
    restart: unless-stopped
    command: --default-time-zone=+07:00
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      TZ: Asia/Ho_Chi_Minh
    ports:
      - "${MYSQL_PORT}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
    networks:
      - ai_social_network

  n8n:
    image: docker.n8n.io/n8nio/n8n:2.19.5
    container_name: ai_social_n8n
    user: "0:0"
    restart: unless-stopped
    ports:
      - "${N8N_PORT}:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:${N8N_PORT}
      - N8N_USER_FOLDER=/home/node
      - GENERIC_TIMEZONE=Asia/Ho_Chi_Minh
      - TZ=Asia/Ho_Chi_Minh
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - mysql
    networks:
      - ai_social_network

  adminer:
    image: adminer:4.8.1-standalone
    container_name: ai_social_adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - ai_social_network

volumes:
  mysql_data:
  n8n_data:

networks:
  ai_social_network:
    name: ai_social_network
    driver: bridge
```

## First run

```bash
cp .env.example .env
# edit .env values

docker compose up -d
```

## Check containers

```bash
docker ps
```

Expected containers:

```text
ai_social_mysql
ai_social_n8n
ai_social_adminer
```

## Open services

```text
Frontend: http://localhost:3000
n8n:      http://localhost:5678
Adminer:  http://localhost:8080
MySQL:    localhost:3306
```

## Stop services

```bash
docker compose down
```

## Reset database completely

Warning: this deletes local MySQL data.

```bash
docker compose down -v
docker compose up -d
```

Use this when SQL init changes and you want MySQL to rerun `docker/mysql/init/001_init.sql`.
