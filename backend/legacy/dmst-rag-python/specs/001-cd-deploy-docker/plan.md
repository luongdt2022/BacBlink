# Implementation Plan: CD Deploy Docker

**Branch**: `001-cd-deploy-docker` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-cd-deploy-docker/spec.md`

## Summary

Create a single `deploy.sh` Bash script at the repository root that performs a complete, no-CI deployment to the server at `/home/sotatek/projects/dmst/dmst-rag`. The script: stashes local changes (if any), checks out `master`, pulls latest code, builds the Docker image (`dmst-rag:latest`), stops and removes the old container, starts the new one, and restores stashed changes. Failure at any step exits immediately with a non-zero code and a timestamped error message.

## Technical Context

**Language/Version**: Bash (POSIX sh compatible, `#!/usr/bin/env bash`)
**Primary Dependencies**: `git`, `docker` (plain Docker CLI — no Compose)
**Storage**: N/A
**Testing**: Manual smoke test (run script on server, verify container is up with latest code)
**Target Platform**: Linux server (Ubuntu/Debian assumed)
**Project Type**: Ops/deployment script (CLI tool)
**Performance Goals**: Full deploy completes in under 5 minutes (dominated by Docker build time)
**Constraints**: No interactive prompts; single command invocation; no CI/CD platform dependency
**Scale/Scope**: Single server, single container, single environment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is a blank template — no organizational principles are defined. No gate violations. The following self-imposed quality gates apply:

- [x] Script uses `set -euo pipefail` — no silent failures
- [x] No secrets hardcoded — `.env` file sourced optionally
- [x] Single responsibility — one script, one job
- [x] Idempotent — safe to run multiple times in succession

## Project Structure

### Documentation (this feature)

```text
specs/001-cd-deploy-docker/
├── plan.md         ← this file
├── research.md     ← Phase 0 decisions
├── data-model.md   ← operational config & state transitions
├── quickstart.md   ← operator runbook
└── tasks.md        ← Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
/                          ← repo root
└── deploy.sh              ← NEW: deployment script
```

The script is placed at the repository root so it travels with the code and is available immediately after `git pull`.

**Structure Decision**: Single-file addition to repository root. No new directories needed.

## Phase 0: Research (complete)

See [research.md](research.md) for all decisions. Key findings:

| Topic | Decision |
|-------|----------|
| Orchestration | Plain `docker` CLI (no Compose — none exists in repo) |
| Script language | Bash with `set -euo pipefail` |
| Image tagging | `dmst-rag:latest` (overwritten on each deploy) |
| Container lifecycle | stop → rm → run (named container `dmst-rag`) |
| Port | `8000:8000` (matches `Dockerfile EXPOSE 8000`) |
| Env vars | Optional `.env` file sourced if present |
| Dirty working tree | `git stash` before pull, `git stash pop` after |

## Phase 1: Design (complete)

See [data-model.md](data-model.md) for operational config and state transition diagram.
See [quickstart.md](quickstart.md) for operator runbook.

No external interface contracts — this is an internal ops script.

### deploy.sh Design

```bash
#!/usr/bin/env bash
set -euo pipefail

# Configuration
REPO_DIR="/home/sotatek/projects/dmst/dmst-rag"
IMAGE_NAME="dmst-rag:latest"
CONTAINER_NAME="dmst-rag"
HOST_PORT="8000"
CONTAINER_PORT="8000"
ENV_FILE="$REPO_DIR/.env"

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
fail() { log "ERROR: $*"; exit 1; }

# Step 1 — Enter repo
cd "$REPO_DIR" || fail "Cannot cd into $REPO_DIR"

# Step 2 — Stash local changes if any
STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  log "Stashing local changes..."
  git stash push -m "deploy-stash-$(date +%s)"
  STASHED=true
fi

# Step 3 — Checkout master & pull
log "Checking out master..."
git checkout master || fail "git checkout master failed"
log "Pulling latest code..."
git pull origin master || fail "git pull failed"

# Step 4 — Build Docker image
log "Building Docker image $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" . || fail "docker build failed"

# Step 5 — Stop & remove old container
if docker ps -q -f name="^${CONTAINER_NAME}$" | grep -q .; then
  log "Stopping container $CONTAINER_NAME..."
  docker stop "$CONTAINER_NAME" || true
fi
if docker ps -aq -f name="^${CONTAINER_NAME}$" | grep -q .; then
  log "Removing container $CONTAINER_NAME..."
  docker rm "$CONTAINER_NAME" || true
fi

# Step 6 — Run new container
ENV_ARGS=()
if [[ -f "$ENV_FILE" ]]; then
  log "Loading env from $ENV_FILE..."
  ENV_ARGS=(--env-file "$ENV_FILE")
fi
log "Starting container $CONTAINER_NAME..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  "${ENV_ARGS[@]}" \
  "$IMAGE_NAME" || fail "docker run failed"

# Step 7 — Restore stash
if [[ "$STASHED" == true ]]; then
  log "Restoring stashed changes..."
  git stash pop || log "WARNING: git stash pop failed — check manually"
fi

log "Deploy complete. Container $CONTAINER_NAME is running."
docker ps -f "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Post-Design Constitution Check

- [x] `set -euo pipefail` — immediate exit on any failure (FR-005)
- [x] No secrets in script — env file sourced optionally (security)
- [x] Single command, no interactive prompts (SC-002)
- [x] Logs each step with timestamps (FR-008)
- [x] No CI/CD dependency (FR-007)
- [x] Named container enables idempotent repeated runs

No violations. Ready for task generation.
