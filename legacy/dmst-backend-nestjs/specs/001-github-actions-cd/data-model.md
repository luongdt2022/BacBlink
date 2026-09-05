# Data Model: GitHub Actions CD — Self-Hosted Runner

This feature delivers configuration files, not database entities. The "data model" describes
the structure and relationships of the configuration artefacts.

---

## Artefact: GitHub Actions Workflow (`.github/workflows/deploy.yml`)

| Field | Value |
|-------|-------|
| Trigger | `push` to branch `main` |
| Runner label | `backend` (self-hosted) |
| Concurrency group | `deploy-main`, cancel-in-progress: true |
| Working directory | `/home/sotatek/projects/dmst/dmst-backend` |

### Steps (ordered, fail-fast)

| Step | Command | Failure behaviour |
|------|---------|-------------------|
| Pull latest code | `git pull origin main` | Abort; no container change |
| Build image | `docker compose build backend_app` | Abort; existing container untouched |
| Recreate container | `docker compose up -d --no-deps --force-recreate backend_app` | Abort |
| Run migrations | `docker compose exec backend_app npm run migration:run:prod` | Workflow fails; container stays running |

---

## Artefact: Docker Compose Network (`dmst_network`)

| Property | Value |
|----------|-------|
| Network name | `dmst_network` |
| Driver | `bridge` |
| Managed by | Compose (not external) |
| Attached services | `backend_app`, `postgres`, `redis`, `elasticsearch` |

### Service hostname resolution (via network)

| Service | Hostname reachable as |
|---------|-----------------------|
| backend_app | `backend_app` |
| postgres | `postgres` |
| redis | `redis` |
| elasticsearch | `elasticsearch` |

---

## Artefact: `docker-compose.yml` Changes

| Section | Change |
|---------|--------|
| Top-level `networks:` | Add `dmst_network:` with `driver: bridge` and `name: dmst_network` |
| Each service `networks:` | Add `- dmst_network` to all four services |

No other changes to `docker-compose.yml`.

---

## Artefact: `package.json` (verification only)

`migration:run:prod` and `typeorm:prod` scripts confirmed present. **No changes required.**

---

## Artefact: `Dockerfile` (review only)

Multi-stage build confirmed production-ready. **No changes required.**
