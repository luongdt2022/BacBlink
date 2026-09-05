# Quickstart: GitHub Actions CD — Self-Hosted Runner

## Prerequisites

1. Self-hosted GitHub Actions runner installed on the server with label `backend`.
2. Runner registered to this repository (Settings → Actions → Runners).
3. `/home/sotatek/projects/dmst/dmst-backend` is a git repo with `origin` pointing to
   the GitHub remote.
4. `.env` file present at `/home/sotatek/projects/dmst/dmst-backend/.env`.
5. Runner OS user is in the `docker` group (`sudo usermod -aG docker <runner-user>`).

## Validation Steps

### 1. Verify Docker Network

After deploying, confirm all services share the named network:

```bash
docker network inspect dmst_network
```

Expected: all four containers (`backend_app`, `postgres`, `redis`, `elasticsearch`) listed
under `Containers`.

### 2. Verify Backend Starts Cleanly

```bash
docker compose logs backend_app --tail=50
```

Expected: NestJS startup messages, no connection errors.

### 3. Trigger a Deployment

Push any change to `main`:

```bash
git commit --allow-empty -m "chore: trigger CD test"
git push origin main
```

Navigate to **GitHub → Actions → Deploy to Production** and confirm:
- All 4 steps show green checkmarks.
- Migration step output shows `No migrations are pending` or lists applied migrations.

### 4. Verify Migration Ran

```bash
docker compose exec backend_app npm run migration:run:prod
```

Expected output: `No migrations are pending` (idempotent re-run confirms migrations applied).

## Rollback

If a deployment produces a broken container:

```bash
cd /home/sotatek/projects/dmst/dmst-backend
git log --oneline -5          # find last good commit SHA
git checkout <sha>            # or: git revert HEAD
docker compose build backend_app
docker compose up -d --no-deps --force-recreate backend_app
docker compose exec backend_app npm run migration:run:prod
```
