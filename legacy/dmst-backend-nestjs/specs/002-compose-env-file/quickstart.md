# Quickstart: Explicit Env File for Docker Compose Deployment

## Validation Steps

### 1. Verify `env_file` is required

```bash
grep -A3 "env_file:" docker-compose.yml
```

Expected output includes `required: true` (not `required: false`).

### 2. Verify `--env-file` in workflow

```bash
grep "docker compose" .github/workflows/deploy.yml
```

Expected: `build` and `up` lines include `--env-file .env`.

### 3. Test fail-fast behaviour (env file missing)

```bash
mv .env .env.bak
docker compose --env-file .env up -d --no-deps backend_app
# Expected: error about missing .env file
mv .env.bak .env
```

### 4. Test successful deployment (env file present)

Trigger a deployment:

```bash
git commit --allow-empty -m "chore: test env-file fix"
git push origin main
```

Then verify env vars inside the container:

```bash
docker compose exec backend_app env | grep -E "DB_HOST|REDIS_HOST|JWT_SECRET"
```

Expected: variables resolved from `.env`, not empty or defaults.
