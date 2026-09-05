# Research: GitHub Self-Hosted Runner CD

**Feature**: 002-github-runner-cd
**Date**: 2026-03-24

## Decision Log

### 1. Workflow trigger

- **Decision**: `on: push: branches: [master]` — triggers on every direct push and merge to `master`
- **Rationale**: Standard, minimal trigger that exactly matches the spec requirement. No CI steps means no need for a more complex trigger (e.g., `workflow_run`).
- **Alternatives considered**: `on: pull_request` (rejected — triggers before merge, not after); manual `workflow_dispatch` only (rejected — defeats the purpose of automation).

### 2. Runner target label

- **Decision**: `runs-on: self-hosted`
- **Rationale**: Uses the default label assigned to all self-hosted runners. More specific labels (e.g., `[self-hosted, linux]`) can be added if the repo has multiple runners in the future.
- **Alternatives considered**: GitHub-hosted `ubuntu-latest` (rejected — would require SSH into server to deploy, adding complexity and secrets; self-hosted runner already has server access).

### 3. Deploy step strategy: call `deploy.sh` vs inline steps

- **Decision**: Inline named steps in the workflow (not `bash deploy.sh`)
- **Rationale**: Named steps make each phase of the deploy visible as a separate entry in the GitHub Actions log, directly fulfilling FR-005 (step-level failure traceability). Calling a single shell script would show one opaque step regardless of where the failure occurred.
- **Alternatives considered**: `bash deploy.sh` single step (rejected — poor traceability, all output in one log section); new `deploy.sh` wrapping workflow (rejected — redundant abstraction).

### 4. Working directory: runner workspace vs existing server repo

- **Decision**: All deploy steps run in the existing server repo at `/home/sotatek/projects/dmst/dmst-rag` (not the runner's default checkout workspace)
- **Rationale**: The spec explicitly states "everything else stays the same" — same directory, same Docker image/container names. The existing repo is already cloned and configured. Using `actions/checkout` into a runner workspace would require duplicating Docker build context and `.env` file setup.
- **How**: Each workflow step uses `working-directory: /home/sotatek/projects/dmst/dmst-rag` or `cd` inline.
- **Alternatives considered**: `actions/checkout` to runner workspace (rejected — breaks `.env` file path, model_cache volume mounts, and all path assumptions in deploy logic).

### 5. Concurrency control

- **Decision**: `concurrency: group: cd-master, cancel-in-progress: true`
- **Rationale**: If two pushes land in quick succession, cancelling the older in-progress run prevents two deploys from racing against each other (e.g., two `docker stop/run` cycles colliding). The latest commit wins.
- **Alternatives considered**: Queue (no cancel) — GitHub Actions doesn't support native queuing in basic tier; no concurrency control (rejected — race condition risk on rapid pushes).

### 6. Git stash handling in workflow

- **Decision**: Preserve the `git stash`/`git stash pop` logic as a named step
- **Rationale**: The server directory may have the `.env` file or `model_cache/` symlinks that are not tracked but could be considered "local modifications" by git. Stashing protects these while preserving the deploy flow.
- **Alternatives considered**: `git reset --hard` (rejected — would destroy `.env`/config files); skip stash entirely (risky — `git pull` could fail on modified files).

### 7. Failure isolation — keep old container running on build failure

- **Decision**: Separate the "build" step from the "stop old container" step; stop/remove container only after a successful build
- **Rationale**: FR-005 and SC-005 require that if the Docker build fails, the old container keeps running. By placing stop/rm after build, a build failure leaves the previous container untouched.
- **Alternatives considered**: Stop container before build (rejected — causes downtime even for build failures).

### 8. No secrets required

- **Decision**: No GitHub repository secrets needed
- **Rationale**: The self-hosted runner runs directly on the server with Docker socket access. No Docker Hub push, no SSH, no registry credentials. The `.env` file lives on the server filesystem and is read at runtime.
- **Alternatives considered**: Passing env vars as GitHub secrets (rejected — unnecessary complexity; runner already has local file access).
