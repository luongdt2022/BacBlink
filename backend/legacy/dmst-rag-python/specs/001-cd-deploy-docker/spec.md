# Feature Specification: CD Deploy Docker

**Feature Branch**: `001-cd-deploy-docker`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "tôi cần thực hiện deploy repo này lên server, viết một quy trình cd không cần ci thực hiện quy trình đơn giản là git checkout về nhánh master pull code mới nhất sau chạy build docker, thư mục trên server /home/sotatek/projects/dmst/dmst-rag"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Latest Code to Server (Priority: P1)

A developer wants to deploy the latest version of the codebase to the production server by running a single deployment script. The script checks out the `master` branch, pulls the latest code, and rebuilds the Docker containers.

**Why this priority**: This is the core deployment workflow — without it, there is no CD pipeline.

**Independent Test**: Run the deploy script on the server and verify that the Docker containers are rebuilt and running with the latest code from `master`.

**Acceptance Scenarios**:

1. **Given** the server has the repository cloned at `/home/sotatek/projects/dmst/dmst-rag`, **When** the deploy script is executed, **Then** it switches to the `master` branch, pulls the latest changes from remote, and rebuilds Docker containers.
2. **Given** the deploy script runs successfully, **When** Docker build completes, **Then** the new containers are running and the previous containers are replaced.
3. **Given** there are no new changes on `master`, **When** the deploy script is executed, **Then** it completes without error and containers reflect the current state.

---

### User Story 2 - Handle Deploy Failures Gracefully (Priority: P2)

A developer needs to know when deployment fails and why, so they can take corrective action quickly.

**Why this priority**: Silent failures leave the server in an unknown state. Clear error reporting prevents extended downtime.

**Independent Test**: Simulate a failure condition (e.g., network error on `git pull`, Docker build error) and confirm the script exits with a non-zero code and prints an informative error message.

**Acceptance Scenarios**:

1. **Given** the `git pull` fails due to a network or merge conflict, **When** the deploy script encounters the error, **Then** it stops execution, reports the error, and does not proceed to Docker build.
2. **Given** the Docker build fails, **When** the build step errors out, **Then** the script reports the failure with the relevant error output.

---

### Edge Cases

- What happens when the working tree has local uncommitted changes on the server?
- What happens if Docker is not running when the script is executed?
- What happens if the remote `master` branch has diverged and a fast-forward pull is not possible?
- What happens if Docker image build fails midway?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The deploy script MUST switch the repository to the `master` branch before pulling.
- **FR-002**: The deploy script MUST pull the latest code from the remote `master` branch.
- **FR-003**: The deploy script MUST build Docker images using the project's Docker configuration after pulling.
- **FR-004**: The deploy script MUST stop and restart (or recreate) containers after a successful build so the new image is active.
- **FR-005**: The deploy script MUST exit with a non-zero status code and print an error message when any step fails.
- **FR-006**: The deploy script MUST be executable from the server directory `/home/sotatek/projects/dmst/dmst-rag`.
- **FR-007**: The deploy script MUST NOT require any CI/CD platform (GitHub Actions, Jenkins, GitLab CI, etc.) to run — it is triggered manually or via a simple cron/SSH call.
- **FR-008**: The deploy script SHOULD log each step (checkout, pull, build, restart) with timestamps so the operator can review progress.

### Assumptions

- The repository is already cloned on the server at `/home/sotatek/projects/dmst/dmst-rag`.
- The server has `git` and `docker` (or `docker compose`) installed and accessible in `PATH`.
- The `master` branch is the single deployment target (no environment-specific branches required).
- Docker Compose is used to orchestrate containers (assumed from typical project structure; adjust if using plain `docker build`/`docker run`).
- The user executing the script has sufficient permissions to run Docker commands on the server.
- No rollback mechanism is required in this iteration; failures require manual intervention.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A complete deployment (checkout + pull + build + restart) completes end-to-end when triggered manually on the server.
- **SC-002**: The deploy script runs without any additional arguments or interactive prompts — a single command is sufficient.
- **SC-003**: When any step fails, the script exits immediately and a clear error message is printed to the terminal within 5 seconds of the failure.
- **SC-004**: After a successful deploy, the running containers reflect the code from the latest commit on `master`.
- **SC-005**: The deployment process requires no CI/CD platform dependency — it can be triggered by a direct SSH session or cron job.
