---

description: "Task list for GitHub Actions CD — Self-Hosted Runner"
---

# Tasks: GitHub Actions CD — Self-Hosted Runner

**Input**: Design documents from `specs/001-github-actions-cd/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test tasks — not requested in the feature specification.

**Organization**: Tasks grouped by user story. US1 (workflow file) and US2 (network) are
independent and can be implemented in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths included in all descriptions

## Path Conventions

- Workflow: `.github/workflows/`
- Compose: `docker-compose.yml` (repo root)

---

## Phase 1: Setup

**Purpose**: Create directory structure required before writing any files.

- [x] T001 Create `.github/workflows/` directory in the repository root

---

## Phase 2: User Story 1 — Automatic Deployment on Push to Main (Priority: P1) 🎯 MVP

**Goal**: Every push to `main` triggers the self-hosted runner to pull, build, restart
`backend_app`, and run migrations automatically.

**Independent Test**: Push an empty commit to `main` (`git commit --allow-empty -m "test CD"`),
navigate to GitHub → Actions → Deploy to Production, confirm all 4 steps are green, and
verify migration output shows `No migrations are pending`.

### Implementation for User Story 1

- [x] T002 [US1] Create `.github/workflows/deploy.yml` with the following top-level structure:
  trigger on `push` to `main` plus `workflow_dispatch`, name `Deploy to Production`,
  concurrency group `deploy-main` with `cancel-in-progress: true`

- [x] T003 [US1] Add the `deploy` job to `.github/workflows/deploy.yml` with:
  `runs-on: [self-hosted, backend]`,
  `defaults.run.working-directory: /home/sotatek/projects/dmst/dmst-backend`

- [x] T004 [US1] Add the **Pull latest code** step to the deploy job in
  `.github/workflows/deploy.yml`:
  `run: git pull origin main`

- [x] T005 [US1] Add the **Build Docker image** step to the deploy job in
  `.github/workflows/deploy.yml`:
  `run: docker compose build backend_app`

- [x] T006 [US1] Add the **Recreate backend container** step to the deploy job in
  `.github/workflows/deploy.yml`:
  `run: docker compose up -d --no-deps --force-recreate backend_app`

- [x] T007 [US1] Add the **Run database migrations** step to the deploy job in
  `.github/workflows/deploy.yml`:
  `run: docker compose exec backend_app npm run migration:run:prod`

**Checkpoint**: `.github/workflows/deploy.yml` is complete. Push to `main` should trigger
a full deployment run. Verify in GitHub Actions UI.

---

## Phase 3: User Story 2 — Shared Docker Network Across Services (Priority: P2)

**Goal**: All four services share an explicit named Docker bridge network `dmst_network`,
enabling stable hostname resolution and future external service attachment.

**Independent Test**: Run `docker compose up -d`, then
`docker network inspect dmst_network` — confirm all four service containers are listed.
Run `docker compose exec backend_app ping -c1 postgres` to verify hostname resolution.

### Implementation for User Story 2

- [x] T008 [US2] Add the top-level `networks:` key to `docker-compose.yml` with the
  `dmst_network` definition:
  ```yaml
  networks:
    dmst_network:
      driver: bridge
      name: dmst_network
  ```

- [x] T009 [US2] Add `networks: [dmst_network]` stanza to the `backend_app` service in
  `docker-compose.yml` (under the `restart:` line)

- [x] T010 [US2] Add `networks: [dmst_network]` stanza to the `postgres` service in
  `docker-compose.yml` (under the `restart:` line)

- [x] T011 [US2] Add `networks: [dmst_network]` stanza to the `redis` service in
  `docker-compose.yml` (under the `restart:` line)

- [x] T012 [US2] Add `networks: [dmst_network]` stanza to the `elasticsearch` service in
  `docker-compose.yml` (under the `restart:` line)

**Checkpoint**: `docker compose up -d` brings up all services connected to `dmst_network`.
All four containers appear in `docker network inspect dmst_network`.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final review and validation.

- [x] T013 [P] Review complete `.github/workflows/deploy.yml` against
  `specs/001-github-actions-cd/contracts/workflow-contract.md` — confirm trigger, runner
  label, working-directory, step order, and fail-fast behaviour all match the contract

- [x] T014 [P] Review updated `docker-compose.yml` — confirm all four services have the
  `networks:` stanza, top-level `networks:` block is present, no services remain on the
  implicit default network

- [ ] T015 Run quickstart validation from `specs/001-github-actions-cd/quickstart.md`:
  verify `docker network inspect dmst_network`, check `docker compose logs backend_app`,
  and trigger a deployment by pushing to `main`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **User Story 1 (Phase 2)**: Depends on T001 (directory must exist before creating the file)
- **User Story 2 (Phase 3)**: Independent of Phase 2 — can start after T001 completes
- **Polish (Phase 4)**: Depends on Phases 2 and 3 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on T001 (directory creation)
- **User Story 2 (P2)**: Depends only on T001 (can be parallelised with US1 after setup)

### Within Each User Story

- T002 → T003 → T004 → T005 → T006 → T007 (sequential; all add to the same file)
- T008 → T009, T010, T011, T012 (T008 must be first; T009–T012 can be done in any order)

---

## Parallel Opportunities

```bash
# After T001 completes, both stories can proceed simultaneously:

# Developer A: User Story 1 (workflow file)
Task: "T002 Create deploy.yml skeleton"
Task: "T003 Add deploy job with runner and working-directory"
Task: "T004 Add git pull step"
Task: "T005 Add docker compose build step"
Task: "T006 Add docker compose up step"
Task: "T007 Add migration step"

# Developer B (or same session in parallel): User Story 2 (network)
Task: "T008 Add dmst_network definition to docker-compose.yml"
Task: "T009 Add network to backend_app"
Task: "T010 Add network to postgres"
Task: "T011 Add network to redis"
Task: "T012 Add network to elasticsearch"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 (create directory)
2. Complete Phase 2: T002–T007 (full workflow file)
3. **STOP and VALIDATE**: Push to `main`, confirm workflow succeeds in GitHub Actions UI
4. Deploy/demo the automated pipeline

### Incremental Delivery

1. T001 → Foundation ready
2. T002–T007 → CD pipeline live (MVP!)
3. T008–T012 → Network formalized
4. T013–T015 → Validated and documented

---

## Notes

- T009–T012 modify the same file (`docker-compose.yml`) so they are **not** marked `[P]`;
  complete them sequentially after T008
- T002–T007 also modify the same file (`.github/workflows/deploy.yml`) — sequential within US1
- T013 and T014 are marked `[P]` because they review different files simultaneously
- The self-hosted runner must be registered on the server before T015 can be validated;
  runner registration is out of scope per the spec assumptions
