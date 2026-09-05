# Data Model: CD Deploy Docker

**Feature**: 001-cd-deploy-docker
**Date**: 2026-03-24

> This feature does not involve application data entities (no database, no API schema changes).
> The relevant "data" is operational configuration consumed by the deploy script.

## Operational Configuration

### Deploy Script Inputs

| Variable | Source | Description | Default |
|----------|--------|-------------|---------|
| `REPO_DIR` | Hardcoded in script | Absolute path to the repository on the server | `/home/sotatek/projects/dmst/dmst-rag` |
| `IMAGE_NAME` | Hardcoded in script | Docker image name and tag | `dmst-rag:latest` |
| `CONTAINER_NAME` | Hardcoded in script | Docker container name | `dmst-rag` |
| `PORT` | Hardcoded in script | Host port mapped to container port 8000 | `8000` |
| `ENV_FILE` | Auto-detected | Path to `.env` file for container secrets | `$REPO_DIR/.env` (optional) |

### Script State Transitions

```
[idle]
  │
  ▼
[stash local changes]  ← if working tree is dirty
  │
  ▼
[git checkout master]
  │
  ▼
[git pull origin master]
  │
  ▼
[docker build -t dmst-rag:latest .]
  │
  ▼
[docker stop dmst-rag]  ← if container is running
  │
  ▼
[docker rm dmst-rag]    ← if container exists
  │
  ▼
[docker run -d ...]
  │
  ▼
[git stash pop]         ← if stash was created
  │
  ▼
[done]

On any step failure → print error + exit 1
```
