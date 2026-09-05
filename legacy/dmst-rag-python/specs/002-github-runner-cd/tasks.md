# Tasks: GitHub Self-Hosted Runner CD

**Input**: Design documents from `/specs/002-github-runner-cd/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the GitHub Actions directory structure and workflow skeleton.

- [x] T001 Create directory `.github/workflows/` at repository root
- [x] T002 Create `.github/workflows/cd.yml` with the workflow `name`, `on: push: branches: [master]` trigger, and `concurrency: group: cd-master, cancel-in-progress: true` block

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the job-level configuration that all steps depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add `jobs.deploy` block to `.github/workflows/cd.yml`: set `name: Deploy dmst-rag`, `runs-on: self-hosted`, and the `env` block with `REPO_DIR`, `IMAGE_NAME`, `CONTAINER_NAME`, `HOST_PORT`, `CONTAINER_PORT`

**Checkpoint**: Workflow file is valid YAML with trigger, concurrency, and job-level env — ready for steps.

---

## Phase 3: User Story 1 - Automatic Deploy on Push to Master (Priority: P1) 🎯 MVP

**Goal**: Full end-to-end deploy triggered by a push to `master`, running on the self-hosted runner in the existing server repo directory — git stash → checkout → pull → docker build → stop/rm old container → run new container → stash pop → status check.

**Independent Test**: Push any commit to `master`, open GitHub → Actions tab, confirm the CD workflow run completes green. Then SSH to server and run `docker ps -f name=dmst-rag` to confirm the container is up with the latest image.

### Implementation for User Story 1

- [x] T004 [US1] Add step `Stash local changes` to `.github/workflows/cd.yml`: `working-directory: ${{ env.REPO_DIR }}`, check dirty tree with `git diff --quiet && git diff --cached --quiet`, if dirty run `git stash push -m "cd-stash-$(date +%s)"` and set `STASHED=true` in `$GITHUB_ENV`, else set `STASHED=false`
- [x] T005 [US1] Add step `Checkout master` to `.github/workflows/cd.yml`: `working-directory: ${{ env.REPO_DIR }}`, run `git checkout master`
- [x] T006 [US1] Add step `Pull latest code` to `.github/workflows/cd.yml`: `working-directory: ${{ env.REPO_DIR }}`, run `git pull origin master`
- [x] T007 [US1] Add step `Build Docker image` to `.github/workflows/cd.yml`: `working-directory: ${{ env.REPO_DIR }}`, run `docker build -t "$IMAGE_NAME" .`
- [x] T008 [US1] Add step `Stop old container` to `.github/workflows/cd.yml`: run `docker stop "$CONTAINER_NAME" || true`
- [x] T009 [US1] Add step `Remove old container` to `.github/workflows/cd.yml`: run `docker rm "$CONTAINER_NAME" || true`
- [x] T010 [US1] Add step `Start new container` to `.github/workflows/cd.yml`: `working-directory: ${{ env.REPO_DIR }}`, detect `.env` file and populate `ENV_ARGS`, run `docker run -d --name "$CONTAINER_NAME" --restart unless-stopped -p "$HOST_PORT:$CONTAINER_PORT" "${ENV_ARGS[@]}" "$IMAGE_NAME"`
- [x] T011 [US1] Add step `Restore stashed changes` to `.github/workflows/cd.yml`: add `if: env.STASHED == 'true'` condition, `working-directory: ${{ env.REPO_DIR }}`, run `git stash pop || echo "WARNING: git stash pop failed — check manually"`
- [x] T012 [US1] Add step `Verify container is running` to `.github/workflows/cd.yml`: run `docker ps -f "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`

**Checkpoint**: Commit `cd.yml` to `master`, push, and confirm the Actions workflow runs end-to-end with all steps green. Container `dmst-rag` is running on port 8000 with the latest code.

---

## Phase 4: User Story 2 - Visible Failure Notification (Priority: P2)

**Goal**: Each deploy step is independently named so that any failure is attributed to a specific step in the GitHub Actions log, and downstream steps do not run after a failure.

**Independent Test**: Break the `Dockerfile` temporarily (add an invalid line), push to `master`, and confirm: (a) the "Build Docker image" step is red in Actions, (b) "Stop old container" and "Start new container" steps are skipped, (c) the old container is still running on the server.

### Implementation for User Story 2

- [x] T013 [US2] Audit `.github/workflows/cd.yml`: verify that steps T004–T006 (git steps) do NOT use `|| true` — any git failure must propagate to the workflow as a failed step
- [x] T014 [US2] Audit `.github/workflows/cd.yml`: verify step T007 (docker build) does NOT use `|| true` — a build failure must mark that step red and stop the workflow
- [x] T015 [US2] Audit `.github/workflows/cd.yml`: verify steps T008–T009 (stop/rm) DO use `|| true` and include an inline comment explaining why (container may not exist on first deploy)
- [x] T016 [US2] Audit `.github/workflows/cd.yml`: verify step T010 (docker run) does NOT use `|| true` — a failed container start must mark that step red

**Checkpoint**: Run the simulated failure test from `quickstart.md` — broken Dockerfile → push → Actions shows red "Build Docker image" step, old container still running.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation.

- [x] T017 [P] Add a comment block at the top of `.github/workflows/cd.yml` describing the workflow purpose, trigger, and runner requirement
- [x] T018 [P] Update `README.md` Deployment section to mention that CD is now automatic on push to `master` via GitHub Actions, and link to the Actions tab and `quickstart.md` for runner setup
- [ ] T019 Run end-to-end validation per `quickstart.md`: push a real commit to `master`, confirm green Actions run, confirm `docker ps` shows updated container

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — `cd.yml` must exist before adding the job block
- **User Story 1 (Phase 3)**: Depends on Phase 2 — steps added to the job defined in Phase 2
- **User Story 2 (Phase 4)**: Audits work from Phase 3 — should run after Phase 3 is complete
- **Polish (Phase 5)**: Depends on Phase 3 + Phase 4

### User Story Dependencies

- **US1 (P1)**: Independent — implements the full deploy flow
- **US2 (P2)**: Audits and validates US1 — no new implementation, verifies error isolation behavior

### Within User Story 1

- T004 (stash) must be first step in the job
- T005 (checkout) → T006 (pull) → T007 (build) are sequential
- T008 (stop) and T009 (rm) follow T007 and must be sequential with each other
- T010 (run) follows T009
- T011 (stash pop) must be last git operation
- T012 (verify) is the final status step

### Parallel Opportunities

- T017 and T018 (Phase 5) can run in parallel — different files
- T013, T014, T015, T016 (Phase 4 audits) can be done in parallel — different steps being reviewed

---

## Parallel Example: User Story 2

```bash
# All audit tasks can be done in parallel (reading the same file, no writes conflict):
Task: "T013 - Audit git steps for missing || true"
Task: "T014 - Audit docker build step for missing || true"
Task: "T015 - Audit stop/rm steps for correct || true with comment"
Task: "T016 - Audit docker run step for missing || true"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 (T004–T012)
4. **STOP and VALIDATE**: Push to `master`, confirm green Actions run and container up
5. Automated CD is live

### Incremental Delivery

1. Phases 1–3 → Automated deploy on push (MVP)
2. Phase 4 → Failure isolation validated
3. Phase 5 → Documentation updated

---

## Notes

- [P] tasks = different files or independent operations, no blocking dependencies
- `cd.yml` is a single file — steps within it must be written sequentially (T004→T012 in order)
- No automated tests generated — acceptance is manual validation per `quickstart.md`
- `deploy.sh` is NOT removed — it remains for manual fallback deployment
- Self-hosted runner must be registered on the server before `cd.yml` can execute (one-time server setup, not a code task)
- Commit `cd.yml` to `master` to activate the workflow — it will trigger immediately on the commit that adds it
