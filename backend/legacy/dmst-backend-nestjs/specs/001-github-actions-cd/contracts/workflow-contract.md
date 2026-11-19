# Contract: CD Workflow Interface

## Trigger Contract

| Property | Value |
|----------|-------|
| Event | `push` |
| Branch filter | `refs/heads/main` |
| Manual trigger | `workflow_dispatch` (optional, for emergency re-runs) |

## Runner Contract

| Property | Value |
|----------|-------|
| Runner type | `self-hosted` |
| Required label | `backend` |
| OS assumption | Linux (Ubuntu/Debian) |
| Required tools | `git`, `docker`, `docker compose` (v2 plugin) |
| Required files | `.env` at `/home/sotatek/projects/dmst/dmst-backend/.env` |

## Environment Contract (server-side)

The following MUST exist on the server before the workflow runs:

| Item | Location | Notes |
|------|----------|-------|
| Deployment directory | `/home/sotatek/projects/dmst/dmst-backend` | Must be a git repo tracking `origin/main` |
| Production env file | `<deploy_dir>/.env` | Must contain all vars from `.env.example` |
| Docker socket | `/var/run/docker.sock` | Runner user must be in `docker` group |

## Step Output Contract

Each step MUST write its output to the GitHub Actions log. Steps MUST exit non-zero on
failure so GitHub Actions marks the step — and job — as failed.

| Step | Success condition | Failure action |
|------|------------------|----------------|
| git pull | Exit code 0 | Job fails; all downstream steps skipped |
| docker compose build | Exit code 0 | Job fails; existing container unchanged |
| docker compose up | Exit code 0, `backend_app` container running | Job fails |
| migration:run:prod | Exit code 0 | Job fails; warning in workflow summary |

## Docker Network Contract

```
Network name  : dmst_network
Driver        : bridge
Compose-managed: yes (created on first `docker compose up`)
External use  : other services may declare `external: true` and name `dmst_network`
```

### Joining the network from an external compose file

```yaml
networks:
  dmst_network:
    external: true
    name: dmst_network
```

Once joined, the service can reach DMST backend services by hostname:
`postgres`, `redis`, `elasticsearch`, `backend_app`.
