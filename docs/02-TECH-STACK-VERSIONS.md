# 02 — Tech Stack and Version Policy

## Version policy

Use pinned or major-pinned versions. Avoid `latest` for core services once the skeleton works.

Reason:

```text
latest can change unexpectedly
→ Docker image behavior changes
→ local environment breaks
→ n8n workflow or database connection becomes unstable
```

## Recommended versions for local skeleton

| Tool | Recommended version | Reason |
|---|---:|---|
| Node.js | `22 LTS` or `24 LTS` | Stable LTS runtime for Next.js |
| Next.js | `16.x` | Current modern App Router stack |
| React | `19.x` | Matches modern Next.js 16 setup |
| TypeScript | `5.x` | Required by modern Next.js |
| MySQL Docker image | `mysql:8.4` | Stable MySQL LTS-style line, easy local support |
| n8n Docker image | pin after first pull, for example `n8nio/n8n:1.x.x` | Avoid workflow breakage from auto-updates |
| Adminer | `adminer:5` or `adminer:latest` for local only | Optional browser database viewer |
| Docker Compose | Docker Desktop built-in compose v2 | Standard local workflow |

## Node version rule

Use one Node version for the whole project.

Create `.nvmrc`:

```text
22
```

or:

```text
24
```

Recommended for this project:

```text
22
```

Why choose Node 22 first:

- It is LTS.
- It is widely supported.
- Next.js 16 only needs Node.js 20.9 or newer.
- It avoids possible early ecosystem issues around newer runtimes.

## package manager rule

Use one package manager only.

Recommended:

```text
npm
```

Do not mix:

- `npm`
- `yarn`
- `pnpm`
- `bun`

Unless the project intentionally migrates later.

## Docker image pinning rule

During first setup, this is acceptable:

```yaml
image: docker.n8n.io/n8nio/n8n:latest
```

After it works, inspect version in n8n UI or container and pin it:

```yaml
image: docker.n8n.io/n8nio/n8n:1.xx.x
```

For MySQL, use:

```yaml
image: mysql:8.4
```

## Why not MySQL 9 immediately?

The first goal is local stability and tutorial compatibility.

MySQL 8.4 is a safer starting point for common tools, examples, and DBeaver connections.

## Compatibility matrix

| Component | Connects to | Connection method |
|---|---|---|
| Frontend | n8n | HTTP webhook URL |
| n8n | MySQL | Docker network host `mysql` |
| DBeaver | MySQL | Host `localhost`, port `3306` |
| Adminer | MySQL | Docker network host `mysql` |

## Important local networking rule

From your laptop:

```text
MySQL host = localhost
```

From inside n8n container:

```text
MySQL host = mysql
```

Do not use `localhost` inside n8n credentials for MySQL.
