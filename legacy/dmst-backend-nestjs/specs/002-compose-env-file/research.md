# Research: Explicit Env File for Docker Compose Deployment

## 1. Docker Compose `--env-file` vs `env_file` Service Directive

**Decision**: Two separate changes needed — they serve different purposes.

| Mechanism | Where | What it does |
|-----------|-------|--------------|
| `--env-file .env` CLI flag | `docker compose build/up` | Loads vars for `${VAR}` substitution *inside the compose file itself* (e.g., `${DB_NAME:-dmst_poc}`, `${PORT:-3013}`) |
| `env_file:` service directive | `docker-compose.yml` `backend_app` | Injects vars into the *container runtime environment* |

Both must be correct for full env coverage:
- Without `--env-file`: `${DB_NAME:-dmst_poc}` in compose resolves to the default even if `.env` has a different value.
- Without `env_file:`: the container process never sees `JWT_SECRET`, `AI_DEFAULT_PROVIDER`, etc.

**Rationale**: Making both explicit and required eliminates two silent-failure paths.

---

## 2. `env_file.required: false` → `required: true`

**Decision**: Change to `required: true` in the `backend_app` service definition.

**Rationale**: `required: false` was appropriate during early development (local dev without
a `.env`). In production CI/CD, a missing `.env` is always an operator error, not a
legitimate state. Failing fast surfaces the problem immediately instead of letting the
container start with empty secrets.

**Impact**: Local development with no `.env` file will now need to create one (copying from
`.env.example`). This is the correct expectation.

**Alternatives considered**:
- Keep `required: false` and only add `--env-file` CLI flag — does not protect against
  missing file; container starts with empty secrets (rejected).

---

## 3. Which `docker compose` Commands Need `--env-file`

**Decision**: Add `--env-file .env` to `build` and `up` only. Not `exec`.

| Command | Needs `--env-file`? | Reason |
|---------|--------------------|-|
| `docker compose build backend_app` | ✅ Yes | Build args and compose-level var substitution |
| `docker compose up -d ...` | ✅ Yes | Compose-level var substitution for port mapping, image tags |
| `docker compose exec backend_app ...` | ❌ No | Container is already running; its env is already set |

**Rationale**: `docker compose exec` runs a command inside an existing container. The
container's environment was already populated at `up` time via `env_file:` and `environment:`.
Adding `--env-file` to `exec` would have no effect on the container env.

---

## 4. Relative vs Absolute Path for `--env-file`

**Decision**: Use `--env-file .env` (relative path).

**Rationale**: The workflow's `defaults.run.working-directory` is already set to
`/home/sotatek/projects/dmst/dmst-backend`. All `run:` steps execute in that directory,
so `.env` resolves correctly without hardcoding the absolute path. This also keeps the
workflow portable if the deploy path changes (only `working-directory` needs updating).
