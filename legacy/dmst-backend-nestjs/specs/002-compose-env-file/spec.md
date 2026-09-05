# Feature Specification: Explicit Env File for Docker Compose Deployment

**Feature Branch**: `002-compose-env-file`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "khi build docker xong hiện tại hệ thống không chỉ định file env,
sử dụng docker compose env file"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Deployment Fails Fast When Env File Is Missing (Priority: P1)

An operator triggers a deployment (push to `main` or manual workflow dispatch). If the
production env file is absent from the server, the deployment MUST stop immediately with a
clear error before any container is built or started — rather than silently continuing with
missing configuration values.

**Why this priority**: A silent deployment with missing env vars leads to a running container
that immediately crashes or behaves incorrectly in production. Fail-fast prevents a bad state
from ever being reached.

**Independent Test**: Remove or rename the `.env` file on the server, trigger a deployment,
and confirm the workflow fails at the first Docker Compose step with an error about the
missing env file — and that no container is rebuilt or restarted.

**Acceptance Scenarios**:

1. **Given** the `.env` file does not exist on the server, **When** the deployment workflow
   runs, **Then** the Docker Compose command exits with a non-zero code and the workflow
   step fails, stopping all subsequent steps.

2. **Given** the `.env` file exists and contains all required variables, **When** the
   deployment workflow runs, **Then** all Docker Compose commands succeed and use the
   env file values.

---

### User Story 2 — Env File Is Explicitly Passed to All Docker Compose Commands (Priority: P2)

Every `docker compose` command in the deployment pipeline (build, up, exec) explicitly
references the env file by path, so the correct configuration is loaded regardless of the
working directory or shell environment at the time of execution.

**Why this priority**: Without an explicit env file reference, Docker Compose relies on
auto-discovery rules that can silently fall back to defaults or empty values if the file is
not in the expected location, causing hard-to-diagnose configuration drift.

**Independent Test**: Inspect the deployment workflow file — every `docker compose` invocation
MUST include `--env-file .env` (or equivalent explicit reference). Run a deployment and
confirm all env vars (DB credentials, Redis host, ports) are resolved correctly in the
running container.

**Acceptance Scenarios**:

1. **Given** the deployment workflow runs, **When** each `docker compose` step executes,
   **Then** the env file path is explicitly passed and the resolved variable values in
   the containers match the values in the `.env` file on the server.

2. **Given** the `.env` file is located at the project working directory on the server,
   **When** `docker compose build` or `docker compose up` is called with `--env-file .env`,
   **Then** all `${VARIABLE:-default}` substitutions in the Compose file use the values
   from `.env`, not the defaults.

---

### Edge Cases

- What happens if the `.env` file exists but is empty?
  Deployment proceeds; services use defaults defined in `docker-compose.yml`. No error —
  this is acceptable since defaults are intentionally provided.
- What happens if `.env` has incorrect variable names (typos)?
  Docker Compose silently ignores unknown variables; the container uses defaults. This is
  outside this feature's scope (no runtime validation of env var names required).
- What happens if the deployment is triggered manually (`workflow_dispatch`) while on a
  different working directory?
  The `defaults.run.working-directory` in the workflow ensures all steps run from the
  correct project path, making relative `--env-file .env` safe.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `env_file` entry in the `backend_app` service definition MUST be set to
  `required: true` so that the absence of the env file causes an immediate, visible failure.
- **FR-002**: The deployment workflow MUST pass `--env-file .env` explicitly to every
  `docker compose` command that runs in the deployment pipeline.
- **FR-003**: The env file requirement applies to all three Docker Compose commands in the
  pipeline: `build`, `up`, and `exec`.
- **FR-004**: When the env file is missing and the deployment runs, the workflow MUST fail
  at the first step that references the env file — no container rebuild or restart MUST
  occur before the failure.

### Key Entities

- **`.env` file**: The production environment variable file residing at the project working
  directory on the server. Contains secrets and configuration values for all services.
- **Deployment workflow** (`.github/workflows/deploy.yml`): The CD pipeline that runs
  `docker compose` commands and must explicitly reference the env file.
- **`docker-compose.yml`**: The Compose service definition where the `env_file` directive
  for `backend_app` controls runtime env loading.

### Assumptions

- The `.env` file resides at `/home/sotatek/projects/dmst/dmst-backend/.env` on the server.
- The workflow's `defaults.run.working-directory` is already set to that path, so
  `--env-file .env` resolves correctly as a relative path.
- The `docker compose exec` command does not need `--env-file` since it runs inside an
  already-running container; the flag applies only to `build` and `up`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A deployment triggered with a missing env file fails within the first
  Docker Compose step — zero containers are rebuilt or restarted before the failure.
- **SC-002**: Every `docker compose` command in the deployment pipeline explicitly
  references the env file — verifiable by reading the workflow file (0 undeclared
  invocations).
- **SC-003**: A successful deployment with the env file present produces a running
  `backend_app` container whose environment variables match the values in `.env` —
  verifiable with `docker compose exec backend_app env`.
