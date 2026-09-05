#!/usr/bin/env bash
# deploy.sh — CD deployment script for dmst-rag
#
# Usage:
#   bash deploy.sh        (or ./deploy.sh after chmod +x)
#
# Configuration (edit variables below as needed):
#   REPO_DIR        — absolute path to the repository on the server
#   IMAGE_NAME      — Docker image name:tag (overwritten on each deploy)
#   CONTAINER_NAME  — Docker container name
#   HOST_PORT       — host port to expose
#   CONTAINER_PORT  — container port (must match Dockerfile EXPOSE)
#   ENV_FILE        — path to .env file for runtime secrets (optional)
#
# Requirements:
#   - git and docker must be in PATH
#   - User must have Docker socket access
#   - Repository must already be cloned at REPO_DIR
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
REPO_DIR="/home/sotatek/projects/dmst/dmst-rag"
IMAGE_NAME="dmst-rag:latest"
CONTAINER_NAME="dmst-rag"
HOST_PORT="8000"
CONTAINER_PORT="8000"
ENV_FILE="$REPO_DIR/.env"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
fail() { log "ERROR: $*"; exit 1; }

# ---------------------------------------------------------------------------
# Step 1 — Enter repository directory
# ---------------------------------------------------------------------------
log "Entering repository at $REPO_DIR..."
cd "$REPO_DIR" || fail "Cannot cd into $REPO_DIR — is the repository cloned there?"

# ---------------------------------------------------------------------------
# Step 2 — Stash local changes (if any)
# ---------------------------------------------------------------------------
STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  log "Local changes detected — stashing..."
  git stash push -m "deploy-stash-$(date +%s)"
  STASHED=true
fi

# ---------------------------------------------------------------------------
# Step 3 — Checkout master and pull latest code
# ---------------------------------------------------------------------------
log "Checking out master branch..."
git checkout master || fail "git checkout master failed"

log "Pulling latest code from origin/master..."
git pull origin master || fail "git pull origin master failed"

# ---------------------------------------------------------------------------
# Step 4 — Build Docker image
# ---------------------------------------------------------------------------
log "Building Docker image $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" . || fail "docker build failed"

# ---------------------------------------------------------------------------
# Step 5 — Stop existing container (if running)
# ---------------------------------------------------------------------------
if docker ps -q -f "name=^${CONTAINER_NAME}$" | grep -q .; then
  log "Stopping container $CONTAINER_NAME..."
  docker stop "$CONTAINER_NAME" || true
fi

# ---------------------------------------------------------------------------
# Step 6 — Remove existing container (if present)
# ---------------------------------------------------------------------------
if docker ps -aq -f "name=^${CONTAINER_NAME}$" | grep -q .; then
  log "Removing container $CONTAINER_NAME..."
  docker rm "$CONTAINER_NAME" || true
fi

# ---------------------------------------------------------------------------
# Step 7 — Start new container
# ---------------------------------------------------------------------------
ENV_ARGS=()
if [[ -f "$ENV_FILE" ]]; then
  log "Loading environment variables from $ENV_FILE..."
  ENV_ARGS=(--env-file "$ENV_FILE")
fi

log "Starting container $CONTAINER_NAME..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  "${ENV_ARGS[@]}" \
  "$IMAGE_NAME" || fail "docker run failed — container did not start"

# ---------------------------------------------------------------------------
# Step 8 — Restore stashed changes (if any were stashed)
# ---------------------------------------------------------------------------
if [[ "$STASHED" == true ]]; then
  log "Restoring stashed changes..."
  git stash pop || log "WARNING: git stash pop failed — check 'git stash list' manually"
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
log "Deploy complete. Container $CONTAINER_NAME is running."
docker ps -f "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
