# Data Model: GitHub Self-Hosted Runner CD

**Feature**: 002-github-runner-cd
**Date**: 2026-03-24

> This feature does not involve application data entities. The relevant "data" is operational configuration consumed by the GitHub Actions workflow.

## Workflow Configuration

### Static Constants (hardcoded in workflow)

| Variable | Value | Description |
|----------|-------|-------------|
| `REPO_DIR` | `/home/sotatek/projects/dmst/dmst-rag` | Server repo path — all steps run here |
| `IMAGE_NAME` | `dmst-rag:latest` | Docker image built and deployed |
| `CONTAINER_NAME` | `dmst-rag` | Running container name |
| `HOST_PORT` | `8000` | Host port forwarded to container |
| `CONTAINER_PORT` | `8000` | Container port (matches Dockerfile EXPOSE) |
| `ENV_FILE` | `$REPO_DIR/.env` | Optional env file for container secrets |

### Workflow Trigger Configuration

| Property | Value |
|----------|-------|
| Trigger event | `push` to `master` branch |
| Runner label | `self-hosted` |
| Concurrency group | `cd-master` |
| Cancel in-progress | `true` |

## Workflow State Transitions

```
[push to master]
  │
  ▼
[workflow queued on self-hosted runner]
  │   (cancels any in-progress CD run for cd-master group)
  ▼
[Step: Stash local changes]      ← if working tree is dirty
  │
  ▼
[Step: Checkout master]          git checkout master
  │
  ▼
[Step: Pull latest code]         git pull origin master
  │
  ▼
[Step: Build Docker image]       docker build -t dmst-rag:latest .
  │                              ← FAILURE HERE keeps old container running
  ▼
[Step: Stop old container]       docker stop dmst-rag  (|| true)
  │
  ▼
[Step: Remove old container]     docker rm dmst-rag    (|| true)
  │
  ▼
[Step: Start new container]      docker run -d --name dmst-rag ...
  │
  ▼
[Step: Restore stash]            git stash pop         (|| warn)
  │
  ▼
[workflow: success ✓]

On any named step failure → workflow exits red, downstream steps skipped
```

## Workflow File Location

```text
.github/
└── workflows/
    └── cd.yml      ← NEW: GitHub Actions workflow definition
```
