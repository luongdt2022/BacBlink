# Data Model: Explicit Env File for Docker Compose Deployment

This feature modifies two configuration files only. No database entities involved.

---

## Change 1: `docker-compose.yml` — `backend_app.env_file`

| Property | Before | After |
|----------|--------|-------|
| `path` | `.env` | `.env` (unchanged) |
| `required` | `false` | `true` |

**Effect**: Docker Compose exits with an error if `.env` is absent when `up` is called,
instead of silently proceeding.

---

## Change 2: `.github/workflows/deploy.yml` — deploy job steps

| Step | Before | After |
|------|--------|-------|
| Build Docker image | `docker compose build backend_app` | `docker compose --env-file .env build backend_app` |
| Recreate backend container | `docker compose up -d --no-deps --force-recreate backend_app` | `docker compose --env-file .env up -d --no-deps --force-recreate backend_app` |
| Run database migrations | `docker compose exec backend_app npm run migration:run:prod` | unchanged |

**Note**: `--env-file` is placed immediately after `docker compose` and before the
subcommand (`build`, `up`). This is the correct Docker Compose v2 flag position.

---

## No Other Changes

- `Dockerfile` — not affected
- `postgres`, `redis`, `elasticsearch` services — not affected (they use
  `${VAR:-default}` substitution which is covered by the `--env-file` CLI flag)
- `package.json` — not affected
