# Feature Specification: GitHub Self-Hosted Runner CD

**Feature Branch**: `002-github-runner-cd`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "update quá trình cd sử dụng github runner self hosted, mọi thông tin khác vẫn vậy"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Deploy on Push to Master (Priority: P1)

A developer pushes or merges code to the `master` branch on GitHub. Without any manual intervention, the server automatically receives the latest code, rebuilds the Docker image, and restarts the container. The developer can verify the deploy succeeded from the GitHub Actions run log.

**Why this priority**: This is the entire purpose of the feature — replacing the manual `deploy.sh` invocation with an automatic, event-driven workflow triggered by GitHub.

**Independent Test**: Push a commit to `master`, navigate to the repository's GitHub Actions tab, and confirm the CD workflow completes successfully. Then verify on the server that the container is running with the new code.

**Acceptance Scenarios**:

1. **Given** a developer pushes a commit to the `master` branch, **When** GitHub receives the push event, **Then** the CD workflow starts automatically on the self-hosted runner within 1 minute.
2. **Given** the CD workflow starts, **When** it executes, **Then** it checks out `master`, pulls the latest code, rebuilds the Docker image, stops the old container, and starts the new one — all in the server directory `/home/sotatek/projects/dmst/dmst-rag`.
3. **Given** the workflow completes successfully, **When** the developer checks GitHub Actions, **Then** the run is marked green with logs showing each deploy step.
4. **Given** a pull request is merged into `master`, **When** the merge commit is pushed, **Then** the CD workflow triggers and deploys the merged changes automatically.

---

### User Story 2 - Visible Failure Notification (Priority: P2)

When the CD workflow fails at any step (git pull error, Docker build error, container start error), the failure is clearly reported in the GitHub Actions run log so the developer knows immediately and can investigate.

**Why this priority**: Without visible failures, a broken deploy may go unnoticed. GitHub Actions natively surfaces failures, but each step must be structured so the failure is attributable to a specific step.

**Independent Test**: Introduce a deliberate error (e.g., corrupt the `Dockerfile` temporarily), push to `master`, and confirm the workflow run is marked red with a step-level failure message in the Actions log.

**Acceptance Scenarios**:

1. **Given** the Docker build fails, **When** the workflow encounters the error, **Then** the specific "Build Docker image" step is marked failed in the Actions log and the workflow stops.
2. **Given** the git pull fails, **When** the workflow encounters the error, **Then** the specific "Pull latest code" step is marked failed and downstream steps do not run.
3. **Given** the workflow fails, **When** the developer opens the Actions run, **Then** they see the exact step that failed and the error output without needing SSH access to the server.

---

### Edge Cases

- What happens if a second push to `master` occurs while a CD workflow is already running?
- What happens if the self-hosted runner is offline when a push is made?
- What happens if the Docker build fails midway — does the old container keep running?
- What happens if the runner loses connectivity to GitHub during a workflow run?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CD workflow MUST trigger automatically on every push to the `master` branch with no manual action required.
- **FR-002**: The CD workflow MUST run on the self-hosted GitHub Actions runner installed on the server.
- **FR-003**: The CD workflow MUST execute the full deploy sequence in the server directory `/home/sotatek/projects/dmst/dmst-rag`: checkout master → pull → docker build → stop old container → start new container.
- **FR-004**: The CD workflow MUST exit with a failure status and stop execution if any step fails, leaving the previous container running if the build step had not yet succeeded.
- **FR-005**: Each deploy step MUST be a named step in the workflow so failures are traceable to a specific operation in the GitHub Actions log.
- **FR-006**: The workflow MUST NOT require any secrets or credentials beyond what is available to the self-hosted runner on the server (no Docker Hub login, no SSH keys — runner runs locally).
- **FR-007**: The existing deploy logic (git stash for dirty trees, optional `.env` file for container env vars, `--restart unless-stopped` container flag) MUST be preserved in the new workflow.
- **FR-008**: Only one deploy workflow run SHOULD be active at a time — concurrent runs for the same branch SHOULD be cancelled or queued to prevent race conditions.

### Assumptions

- A GitHub Actions self-hosted runner is already registered (or will be registered) on the server and configured to run for this repository.
- The runner process runs as a user with Docker socket access and write access to `/home/sotatek/projects/dmst/dmst-rag`.
- The repository on the server at `/home/sotatek/projects/dmst/dmst-rag` is already cloned and has the correct remote configured.
- `master` is the only branch that triggers CD (no staging/development branch deploy required at this time).
- No CI (testing, linting) is required as part of this workflow — the workflow is CD-only.
- Container name `dmst-rag`, image `dmst-rag:latest`, and port `8000` remain unchanged from the previous deploy script.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A push to `master` triggers the CD workflow within 60 seconds with no manual steps required.
- **SC-002**: A successful end-to-end deploy (from push event to running container with new code) completes within the time the Docker build takes — no overhead beyond the build itself.
- **SC-003**: A failed deploy is surfaced as a red workflow run in GitHub Actions, with the failing step identified, within 30 seconds of the failure occurring.
- **SC-004**: The deploy workflow requires zero secrets or credentials configured beyond the self-hosted runner's local environment.
- **SC-005**: The previous container continues running if the Docker build step fails — no service interruption for build-time errors.
