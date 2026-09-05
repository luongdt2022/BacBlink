# Research: CD Deploy Docker

**Feature**: 001-cd-deploy-docker
**Date**: 2026-03-24

## Decision Log

### 1. Orchestration: Plain Docker vs Docker Compose

- **Decision**: Plain `docker` CLI commands (`docker build`, `docker stop`, `docker rm`, `docker run`)
- **Rationale**: The repository contains only a `Dockerfile` — no `docker-compose.yml` exists. Adding Compose would introduce unnecessary complexity for a single-container service.
- **Alternatives considered**: Docker Compose (rejected — no existing config, adds dependency); Kubernetes (rejected — far too complex for this scope).

### 2. Script Language

- **Decision**: Bash (`deploy.sh`)
- **Rationale**: Server runs Linux; Bash is universally available, no additional runtime needed. Script will use `set -euo pipefail` for safe error handling.
- **Alternatives considered**: Python script (rejected — adds interpreter dependency risk); Makefile (rejected — less readable for operators unfamiliar with make).

### 3. Image Naming / Tagging

- **Decision**: Image tagged as `dmst-rag:latest` (overwritten on each deploy)
- **Rationale**: Simple and sufficient for a single-environment setup without versioned rollbacks. Git commit SHA can be added later if rollback is needed.
- **Alternatives considered**: Timestamped tags (rejected — no rollback requirement in this iteration).

### 4. Container Lifecycle

- **Decision**: Stop → remove old container → run new container (named `dmst-rag`)
- **Rationale**: Predictable, idempotent. Named container ensures the script can reliably reference the running instance.
- **Alternatives considered**: `docker restart` (rejected — doesn't pick up new image); `docker update` (rejected — doesn't apply image changes).

### 5. Port / Environment Configuration

- **Decision**: Deploy script passes `-p 8000:8000` and sources a `.env` file at the server path if present
- **Rationale**: The `Dockerfile` exposes port 8000 (uvicorn). Environment variables (API keys, model paths) are expected to vary per environment and should not be hardcoded in the script.
- **Alternatives considered**: Hardcoded env vars in script (rejected — secrets in shell scripts are a security risk).

### 6. Failure Handling

- **Decision**: `set -euo pipefail` + per-step echo with timestamps; exit non-zero on any failure
- **Rationale**: Bash strict mode ensures any failing command aborts the script immediately with a visible error. No silent failures.
- **Alternatives considered**: Manual `|| exit 1` on each line (more verbose, less reliable for pipelines).

### 7. Stale Working Tree (Local Changes on Server)

- **Decision**: Script runs `git stash` before `git checkout master && git pull`, then `git stash pop` only if stash was created
- **Rationale**: Avoids aborting deploy due to untracked/modified files while preserving any intentional server-side configuration files.
- **Alternatives considered**: `git checkout --force` (rejected — would destroy local changes); abort on dirty tree (too disruptive for routine deploys).

## Resolved Clarifications

All items from the spec were resolved via codebase inspection and the decisions above. No user input required.
