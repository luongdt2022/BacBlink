# Feature Specification: GitHub Actions CD — Self-Hosted Runner

**Feature Branch**: `001-github-actions-cd`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Thiết lập CD cho project sử dụng GitHub Actions runner self-hosted,
thư mục server: /home/sotatek/projects/dmst/dmst-backend, pull main, docker build, label backend,
chạy migration:run:prod trên container backend_app, tạo network chung cho các service."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Automatic Deployment on Push to Main (Priority: P1)

A developer merges a PR into the `main` branch. The self-hosted runner on the production server
automatically pulls the latest code, rebuilds the Docker image, recreates the `backend_app`
container, and runs database migrations — all without manual SSH access to the server.

**Why this priority**: This is the core value of the CD pipeline. All other stories depend on
this working correctly first.

**Independent Test**: Push a trivial change to `main`. Verify the GitHub Actions workflow run
completes successfully and the running container reflects the new commit.

**Acceptance Scenarios**:

1. **Given** code is merged to `main`, **When** the GitHub Actions workflow triggers on the
   self-hosted runner labelled `backend`, **Then** the runner pulls the latest `main` commit,
   builds a new Docker image, and restarts `backend_app` within 10 minutes.

2. **Given** the new image is running, **When** the migration step executes, **Then**
   `migration:run:prod` completes inside the `backend_app` container with exit code 0 and
   output is captured in the workflow log.

3. **Given** the Docker build fails, **When** the workflow encounters the error, **Then**
   all subsequent steps are skipped, the existing running container is NOT replaced, and the
   failure is clearly reported in the GitHub Actions UI.

---

### User Story 2 — Shared Docker Network Across Services (Priority: P2)

All services defined in the Compose file (backend_app, postgres, redis, elasticsearch)
communicate over an explicitly named Docker network rather than the implicit Compose default.
This enables future services (e.g., BGE-M3 embedding server) to join the same network by name.

**Why this priority**: An explicit network is a prerequisite for reliable inter-service
communication and future extensibility. It also makes network topology observable.

**Independent Test**: After `docker compose up -d`, all four containers appear in
`docker network inspect dmst_network` and `backend_app` can reach the other services by
their Compose service hostnames.

**Acceptance Scenarios**:

1. **Given** `docker compose up` completes, **When** `docker network inspect dmst_network`
   runs, **Then** all four service containers (backend_app, postgres, redis, elasticsearch)
   are listed as connected endpoints.

2. **Given** a future external service declares `external: true` for `dmst_network`,
   **When** it starts, **Then** it can resolve `backend_app`, `postgres`, `redis`, and
   `elasticsearch` by hostname without any additional configuration.

---

### Edge Cases

- What happens if the self-hosted runner is offline when a push to `main` occurs?
  The workflow job queues in GitHub and runs once the runner reconnects (up to GitHub's
  6-hour job timeout), or the run times out and must be re-triggered manually.
- What happens if `migration:run:prod` fails after the new container is already running?
  The workflow step fails and reports the error; the container stays up with the new image
  but operators are alerted via the workflow failure notification to investigate manually.
- What happens if two pushes to `main` occur in rapid succession?
  Both workflow runs are queued. A `concurrency` group can be configured to cancel the
  in-progress run and keep only the latest, preventing double-deployment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CD workflow MUST trigger automatically on every push to the `main` branch.
- **FR-002**: The workflow MUST run exclusively on a self-hosted runner with label `backend`.
- **FR-003**: All workflow steps MUST execute in the project directory
  `/home/sotatek/projects/dmst/dmst-backend` on the runner.
- **FR-004**: The workflow MUST pull the latest code from `main` into the server directory
  before building.
- **FR-005**: The workflow MUST build the Docker image using the existing `Dockerfile` and
  `docker-compose.yml` (target: production stage).
- **FR-006**: After a successful build, the workflow MUST recreate and restart only the
  `backend_app` container without restarting unchanged services (postgres, redis, elasticsearch).
- **FR-007**: After the container is running, the workflow MUST execute
  `npm run migration:run:prod` inside the `backend_app` container and capture its output
  in the workflow log.
- **FR-008**: If any step fails, all subsequent steps MUST be skipped (fail-fast).
- **FR-009**: The `docker-compose.yml` MUST declare an explicit named Docker network
  (`dmst_network`) and attach all four services to it.
- **FR-010**: The named network MUST be managed by Compose (not `external: true`) so it is
  created automatically on first `docker compose up`.
- **FR-011**: The `Dockerfile` multi-stage build MUST be confirmed correct: builder stage
  compiles TypeScript, production stage excludes dev dependencies and runs as a non-root user.

### Key Entities

- **GitHub Actions Workflow** (`.github/workflows/deploy.yml`): Defines the trigger, runner
  label, working directory, and ordered deployment steps.
- **docker-compose.yml**: Compose service definitions updated with the explicit named network.
- **Dockerfile**: Two-stage production image (builder → production) — reviewed, no changes
  expected unless issues are found.
- **Self-hosted Runner**: GitHub Actions runner registered on the production server with
  label `backend` (assumed pre-installed; registration is out of scope).

### Assumptions

- The self-hosted runner is already installed and registered on the server with label `backend`.
- A `.env` file with production environment variables exists at the working directory on the server.
- `docker` and `docker compose` (v2 plugin) are installed and accessible on the runner's PATH.
- The `migration:run:prod` script exists in `package.json` (to be verified; if missing,
  added as part of this feature).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every merge to `main` triggers an automated deployment with zero manual
  server access required.
- **SC-002**: The full pipeline (pull → build → restart → migrate) completes within
  10 minutes for a typical application change.
- **SC-003**: A failed build or migration is visible as a red workflow run in the GitHub
  Actions UI within 1 minute of the failure, with no silent partial deployments.
- **SC-004**: All four services communicate by hostname after deployment — confirmed by
  the application health check passing on container startup.
- **SC-005**: Future services can join the shared network by name without modifying
  existing service definitions.
