# Tasks: CD Deploy Docker

**Input**: Design documents from `/specs/001-cd-deploy-docker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the script file and ensure it's in the right location.

- [x] T001 Create `deploy.sh` at repository root with the shebang line and `set -euo pipefail` safety options
- [x] T002 Define configuration block in `deploy.sh`: `REPO_DIR`, `IMAGE_NAME`, `CONTAINER_NAME`, `HOST_PORT`, `CONTAINER_PORT`, `ENV_FILE`
- [x] T003 [P] Define `log()` and `fail()` helper functions in `deploy.sh` for timestamped output and error exits

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core structure that all deployment steps build upon.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Add `cd "$REPO_DIR"` with fail guard as the first runtime step in `deploy.sh`
- [x] T005 Make `deploy.sh` executable: `chmod +x deploy.sh`

**Checkpoint**: Script file exists, is executable, enters the server repo directory on run.

---

## Phase 3: User Story 1 - Deploy Latest Code to Server (Priority: P1) 🎯 MVP

**Goal**: Full end-to-end deployment — git checkout master, pull, docker build, stop old container, run new container.

**Independent Test**: Run `bash deploy.sh` on the server at `/home/sotatek/projects/dmst/dmst-rag`; verify the container `dmst-rag` is running with the latest `master` code (`docker ps -f name=dmst-rag`, `docker logs dmst-rag --tail 20`).

### Implementation for User Story 1

- [x] T006 [US1] Add git stash logic to `deploy.sh`: detect dirty working tree, run `git stash push -m "deploy-stash-$(date +%s)"` and set `STASHED=true` flag
- [x] T007 [US1] Add `git checkout master` step to `deploy.sh` with `fail` guard
- [x] T008 [US1] Add `git pull origin master` step to `deploy.sh` with `fail` guard
- [x] T009 [US1] Add `docker build -t "$IMAGE_NAME" .` step to `deploy.sh` with `fail` guard
- [x] T010 [US1] Add container stop logic to `deploy.sh`: check if container is running with `docker ps -q -f name=...`, stop it if so
- [x] T011 [US1] Add container remove logic to `deploy.sh`: check if container exists with `docker ps -aq -f name=...`, remove it if so
- [x] T012 [US1] Add `docker run -d` step to `deploy.sh`: include `--name`, `--restart unless-stopped`, `-p "$HOST_PORT:$CONTAINER_PORT"`, optional `--env-file` (only if `$ENV_FILE` exists), and `"$IMAGE_NAME"`
- [x] T013 [US1] Add git stash pop logic to `deploy.sh`: run `git stash pop` (with warning-only on failure) if `STASHED=true`
- [x] T014 [US1] Add final status output to `deploy.sh`: print "Deploy complete" message and run `docker ps -f "name=$CONTAINER_NAME"` with table format

**Checkpoint**: Running `./deploy.sh` performs a full deploy cycle end-to-end. Container is up and serving on port 8000.

---

## Phase 4: User Story 2 - Handle Deploy Failures Gracefully (Priority: P2)

**Goal**: Any failure during deploy causes immediate exit with a clear, timestamped error message.

**Independent Test**: Introduce a simulated failure (e.g., temporarily break `REPO_DIR` path or provide an invalid `IMAGE_NAME`), run `./deploy.sh`, and confirm it exits non-zero with an informative error printed to stdout/stderr.

### Implementation for User Story 2

- [x] T015 [US2] Verify all git steps in `deploy.sh` pipe through `fail` on error (review T006–T008 — ensure no step silently continues on failure)
- [x] T016 [US2] Verify `docker build` in `deploy.sh` pipes through `fail` on error (review T009)
- [x] T017 [US2] Verify `docker run` in `deploy.sh` pipes through `fail` on error (review T012)
- [x] T018 [US2] Add `|| true` intentionally only to non-critical steps (container stop/rm) and document inline why they should not abort the script

**Checkpoint**: Simulate each failure mode from the spec edge cases; confirm script exits non-zero and error is visible in terminal within seconds.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, usability, and final validation.

- [x] T019 [P] Add a usage comment block at the top of `deploy.sh` explaining configuration variables and how to invoke the script
- [x] T020 [P] Update `README.md` with a "Deployment" section linking to `quickstart.md` and showing the single deploy command
- [ ] T021 Run end-to-end validation per `quickstart.md`: SSH to server, run `./deploy.sh`, check `docker ps`, check `docker logs dmst-rag --tail 50`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — implements the full deploy flow
- **User Story 2 (Phase 4)**: Can overlap with Phase 3 (failure handling is part of each step) — validate after Phase 3 is complete
- **Polish (Phase 5)**: Depends on Phase 3 + Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent — no dependency on US2
- **User Story 2 (P2)**: Validates/audits work from US1 — can be done alongside or after US1

### Within User Story 1

- T006–T008 (git steps) must be ordered sequentially
- T009 (docker build) depends on T008
- T010–T011 (stop/rm) can run after T009
- T012 (docker run) depends on T010–T011
- T013 (stash pop) is last
- T014 (status output) follows T012

### Parallel Opportunities

- T002 and T003 (Phase 1) can run in parallel — different parts of the script
- T019 and T020 (Phase 5) can run in parallel — different files

---

## Parallel Example: User Story 1

```bash
# Phase 1 parallel tasks:
Task: "T002 - Define configuration block in deploy.sh"
Task: "T003 - Define log() and fail() helpers in deploy.sh"

# Phase 5 parallel tasks:
Task: "T019 - Add usage comment block to deploy.sh"
Task: "T020 - Update README.md with Deployment section"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005)
3. Complete Phase 3: User Story 1 (T006–T014)
4. **STOP and VALIDATE**: Run `./deploy.sh` on server, confirm container is up
5. Ready to use immediately

### Incremental Delivery

1. Phases 1–3 → Working deploy script (MVP)
2. Phase 4 → Validated failure handling
3. Phase 5 → Documentation polished and README updated

---

## Notes

- [P] tasks = different files or independent sections, no blocking dependencies
- [Story] label maps each task to its user story for traceability
- `deploy.sh` is a single file — sequential tasks within the same file must not be parallelized
- No tests are generated — the spec does not request automated tests; manual validation via `quickstart.md` is the acceptance criterion
- Commit `deploy.sh` to the repo so it is available on the server after `git pull`
