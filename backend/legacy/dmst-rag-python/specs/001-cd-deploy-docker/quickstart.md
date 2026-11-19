# Quickstart: CD Deploy Docker

**Feature**: 001-cd-deploy-docker
**Date**: 2026-03-24

## What This Feature Delivers

A single `deploy.sh` shell script placed at the repository root. Running it on the server performs a complete deployment: pulls latest `master`, rebuilds the Docker image, and restarts the container.

## Prerequisites (Server)

- Repository already cloned at `/home/sotatek/projects/dmst/dmst-rag`
- `git` available in `PATH`
- `docker` available in `PATH` and the executing user has Docker socket access
- (Optional) `.env` file at `/home/sotatek/projects/dmst/dmst-rag/.env` for environment variables

## Deploy

```bash
# SSH into server, then:
cd /home/sotatek/projects/dmst/dmst-rag
bash deploy.sh
```

Or make it executable once:

```bash
chmod +x deploy.sh
./deploy.sh
```

## What the Script Does (in order)

1. Stashes any local changes (if present)
2. Checks out `master` branch
3. Pulls latest code from remote
4. Builds Docker image tagged `dmst-rag:latest`
5. Stops and removes the existing container (if running)
6. Starts a new container from the updated image
7. Restores stashed changes (if any were stashed)

## Checking the Running Container

```bash
docker ps -f name=dmst-rag
docker logs dmst-rag --tail 50
```

## What to Do on Failure

The script exits immediately on any failure and prints a timestamped error. Check:
- `git status` — is there a merge conflict preventing pull?
- `docker build` output — did the image build fail?
- `docker logs dmst-rag` — did the container crash on start?
