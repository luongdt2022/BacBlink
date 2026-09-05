# Quickstart: GitHub Self-Hosted Runner CD

**Feature**: 002-github-runner-cd
**Date**: 2026-03-24

## What This Feature Delivers

A `.github/workflows/cd.yml` file that automatically deploys the latest `master` code to the server whenever a push or merge occurs. The deploy runs on a GitHub Actions self-hosted runner installed on the server — no manual SSH required.

## Prerequisites

### On the Server (one-time setup)

1. **Register the self-hosted runner** for this repository:
   - Go to GitHub repo → Settings → Actions → Runners → "New self-hosted runner"
   - Follow the Linux setup instructions (download, configure, install as service)
   - Ensure the runner service runs as a user with:
     - Docker socket access (`docker` group or root)
     - Read/write access to `/home/sotatek/projects/dmst/dmst-rag`

2. **Verify the repository is cloned** at `/home/sotatek/projects/dmst/dmst-rag` with the correct remote:
   ```bash
   cd /home/sotatek/projects/dmst/dmst-rag
   git remote -v   # should show the correct GitHub repo URL
   ```

3. **Verify Docker is accessible** from the runner user:
   ```bash
   docker ps   # should not require sudo
   ```

### In the Repository

- `.github/workflows/cd.yml` must be committed to `master`

## How Deployment Works

1. Developer pushes to `master` (or merges a PR)
2. GitHub sends a webhook to the self-hosted runner on the server
3. The runner executes the `cd.yml` workflow steps:
   - Stash any local server changes
   - `git checkout master` → `git pull origin master`
   - `docker build -t dmst-rag:latest .`
   - Stop and remove the old `dmst-rag` container
   - Start new container (`--restart unless-stopped`, port `8000`, optional `.env`)
   - Restore stashed changes
4. GitHub Actions shows the result as green (success) or red (failure with failing step highlighted)

## Verifying a Deploy

After a push to `master`:

1. Open GitHub → Actions tab → latest CD run
2. Check each step is green
3. On the server:
   ```bash
   docker ps -f name=dmst-rag
   docker logs dmst-rag --tail 50
   ```

## Simulating a Failure (Acceptance Test for US2)

1. Temporarily break the `Dockerfile` (e.g., add an invalid instruction)
2. Push to `master`
3. Observe: the "Build Docker image" step turns red in GitHub Actions
4. Verify: the old `dmst-rag` container is still running (build failed before stop/rm)
5. Fix the `Dockerfile`, push again — workflow should go green

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Workflow never starts | Is the runner service running on the server? (`systemctl status actions.runner.*`) |
| `git pull` step fails | Is there a merge conflict or authentication error? Check Actions log |
| `docker build` fails | Check Docker build output in the Actions step log |
| Container doesn't start | Check `docker logs dmst-rag` for startup errors |
| Old container still running after failure | Expected — build failed before stop/rm step (by design) |
