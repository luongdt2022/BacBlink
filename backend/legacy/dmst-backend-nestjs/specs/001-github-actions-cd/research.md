# Research: GitHub Actions CD — Self-Hosted Runner

## 1. Self-hosted Runner Working Directory Behaviour

**Decision**: Use `working-directory` at the job level combined with `actions/checkout`
pointing to an explicit path.

**Rationale**: On a self-hosted runner the workspace is typically a subdirectory under the
runner's `_work` folder, not the server's deployment directory. We need the workflow to
operate on the actual deployment path (`/home/sotatek/projects/dmst/dmst-backend`) rather
than a fresh checkout clone, because the `.env` file with production secrets lives there.

**Approach chosen**: Run `git pull` directly in the deployment directory rather than using
`actions/checkout`. This keeps secrets in place, avoids re-cloning, and is the standard
pattern for self-hosted runner CD on a single-environment server.

**Alternatives considered**:
- `actions/checkout` with `path:` — would write to runner workspace, not deployment dir;
  requires copying `.env` manually each run (rejected: fragile).
- rsync from workspace to deployment dir — extra step, same result (rejected: unnecessary complexity).

---

## 2. Docker Build & Restart Strategy

**Decision**: `docker compose build backend_app` then
`docker compose up -d --no-deps --force-recreate backend_app`.

**Rationale**:
- `--no-deps` prevents accidental restarts of postgres/redis/elasticsearch (which hold
  persistent volumes and have their own restart policies).
- `--force-recreate` ensures the container picks up the newly built image even if the
  image tag hasn't changed.
- Separating `build` from `up` makes the failure point clear in workflow logs.

**Alternatives considered**:
- `docker compose up -d --build` — builds and restarts all services; risky if postgres
  or redis get a brief downtime (rejected).
- Manual `docker build` + `docker run` — bypasses Compose networking and env_file handling
  (rejected).

---

## 3. Migration Execution Timing

**Decision**: Run `docker compose exec backend_app npm run migration:run:prod` as a
separate step *after* `docker compose up`.

**Rationale**:
- `migration:run:prod` uses `dist/database/data-source.js` (compiled JS), which is
  baked into the container image. The container must be running before `exec` works.
- TypeORM's migration runner is idempotent — already-applied migrations are skipped.
- Running inside the container ensures the correct DB connection env vars are loaded
  from the container's environment (sourced from `.env` via `env_file`).

**Confirmed**: `package.json` line 38:
```
"migration:run:prod": "npm run typeorm:prod -- migration:run"
"typeorm:prod": "node ./node_modules/typeorm/cli.js -d ./dist/database/data-source.js"
```
No script changes needed.

---

## 4. Docker Network Strategy

**Decision**: Declare a named bridge network `dmst_network` in `docker-compose.yml`
with `driver: bridge` and attach all services to it via `networks:` stanzas.

**Rationale**:
- Compose's auto-generated default network name is
  `<project_name>_default` (where `<project_name>` is derived from the directory name
  or `COMPOSE_PROJECT_NAME`). This name is fragile across different deployment directories
  and non-obvious for external services to reference.
- An explicit named network with `name: dmst_network` remains stable regardless of
  where `docker compose` is invoked.
- Future services (BGE-M3 at `http://localhost:8003` today, but potentially containerized)
  can join by declaring `external: true` for `dmst_network`.

**Alternatives considered**:
- Keep default network — works today but breaks external service joining and is
  environment-dependent (rejected).
- Use `network_mode: host` — removes isolation and port mapping (rejected: security).

---

## 5. Concurrency & Safety

**Decision**: Add a `concurrency` group to the workflow scoped to the branch, with
`cancel-in-progress: true`.

**Rationale**: If two pushes reach `main` before the first run finishes, cancelling
the older run prevents a stale image from overwriting a newer one. The newer run always
wins.

---

## 6. Dockerfile Review Findings

The existing `Dockerfile` is production-ready as-is:
- Stage 1 (`builder`): `node:22-alpine`, installs all deps (`npm ci`), runs `npm run build` → `dist/`
- Stage 2 (`production`): copies only `dist/` and production deps, runs as non-root `appuser`
- `HUSKY=0` disables git hooks during CI install
- No dev dependencies in final image (`npm ci --omit=dev`)
- `uploads/` directory created with correct ownership

**No changes required to `Dockerfile`.**
