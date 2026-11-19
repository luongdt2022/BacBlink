# Tasks: Public Intake Feed

**Input**: Design documents from `/specs/012-public-intake-feed/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No dedicated test tasks generated. The specification did not explicitly request TDD or test-first delivery.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the feature documentation and implementation entry points.

- [X] T001 Review feature design artifacts in `specs/012-public-intake-feed/plan.md`, `specs/012-public-intake-feed/spec.md`, and `specs/012-public-intake-feed/contracts/public-intake-feed-api.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared endpoint shape and service entry point before any story-specific behavior is added.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T002 Add the authenticated discovery route skeleton to `src/intakes/user-intakes.controller.ts`
- [X] T003 Add the discovery service method signature and return contract to `src/intakes/intakes.service.ts`

**Checkpoint**: Controller and service have a stable entry point for discovery-feed implementation.

---

## Phase 3: User Story 1 - Browse published intakes from other users (Priority: P1) 🎯 MVP

**Goal**: Deliver an authenticated paginated feed that returns only published intakes owned by other users.

**Independent Test**: Call `GET /api/v1/my/intakes/discover?page=1&limit=10` with a valid user JWT and confirm every result is `published`, belongs to another user, and includes paginated metadata.

### Implementation for User Story 1

- [X] T004 [US1] Implement the base discovery query for `published` intakes owned by other users in `src/intakes/intakes.service.ts`
- [X] T005 [US1] Return the standard paginated response shape from the discovery endpoint in `src/intakes/user-intakes.controller.ts`
- [X] T006 [US1] Ensure discovery items include existing list-ready relations and owner-identifying summary fields in `src/intakes/intakes.service.ts`
- [X] T007 [US1] Verify the MVP behavior against `specs/012-public-intake-feed/quickstart.md` and update any contract notes in `specs/012-public-intake-feed/contracts/public-intake-feed-api.md`

**Checkpoint**: User Story 1 is independently functional and can be demoed as the MVP.

---

## Phase 4: User Story 2 - Refine the discovery feed with filters (Priority: P2)

**Goal**: Support the same core filtering experience as the personal intake list for discovery browsing.

**Independent Test**: Call the discovery endpoint with `type`, `sectorId`, and `search` filters independently and confirm each request only returns matching published intakes from other users.

### Implementation for User Story 2

- [X] T008 [P] [US2] Apply `type` filtering to the discovery query in `src/intakes/intakes.service.ts`
- [X] T009 [P] [US2] Apply `sectorId` filtering to the discovery query in `src/intakes/intakes.service.ts`
- [X] T010 [P] [US2] Apply keyword `search` filtering to the discovery query in `src/intakes/intakes.service.ts`
- [X] T011 [US2] Reconcile the controller query handling with reused `QueryIntakeDto` validation in `src/intakes/user-intakes.controller.ts`
- [X] T012 [US2] Validate filtered request examples and response expectations in `specs/012-public-intake-feed/quickstart.md`

**Checkpoint**: User Story 2 works independently on top of the MVP endpoint and can be validated with filter-specific requests.

---

## Phase 5: User Story 3 - Handle empty and changing result sets safely (Priority: P3)

**Goal**: Ensure the discovery feed remains predictable when no records match or visibility changes remove records from the feed.

**Independent Test**: Request an empty result set and an out-of-range page, then confirm the endpoint still returns HTTP 200 with valid pagination metadata and no ineligible records.

### Implementation for User Story 3

- [X] T013 [US3] Ensure empty and out-of-range pages return a valid paginated response in `src/intakes/intakes.service.ts`
- [X] T014 [US3] Ensure newly ineligible records are excluded by the live discovery query rules in `src/intakes/intakes.service.ts`
- [X] T015 [US3] Confirm endpoint behavior for empty-state scenarios in `src/intakes/user-intakes.controller.ts`
- [X] T016 [US3] Validate empty-result, out-of-range, and unauthenticated scenarios in `specs/012-public-intake-feed/quickstart.md`

**Checkpoint**: All user stories are independently functional and the endpoint behaves predictably for edge cases.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, documentation, and regression-safety checks across all stories.

- [X] T017 [P] Update Swagger decorators and endpoint summary text for the discovery route in `src/intakes/user-intakes.controller.ts`
- [X] T018 Run implementation validation with `npm test` and `npm run lint` from `/home/zen/projects/dmst-backend`
- [X] T019 [P] Update feature execution notes or response examples if implementation changed the design contract in `specs/012-public-intake-feed/contracts/public-intake-feed-api.md` and `specs/012-public-intake-feed/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: US1**: Depends on Phase 2; establishes the MVP
- **Phase 4: US2**: Depends on Phase 3 because filters build on the working discovery endpoint
- **Phase 5: US3**: Depends on Phase 3 and should be completed after Phase 4 to validate final query behavior
- **Phase 6: Polish**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational work
- **US2 (P2)**: Depends on US1 endpoint and query path existing
- **US3 (P3)**: Depends on US1 endpoint and final query rules; should validate after US2 filter behavior is in place

### Within Each User Story

- Service query logic before controller finalization
- Core endpoint behavior before documentation refresh
- Quickstart validation after implementation changes are complete

### Parallel Opportunities

- `T008`, `T009`, and `T010` can run in parallel because they modify distinct filter branches within `src/intakes/intakes.service.ts`
- `T017` and `T019` can run in parallel during polish because they touch different documentation concerns

---

## Parallel Example: User Story 2

```bash
Task: "T008 [US2] Apply type filtering to the discovery query in src/intakes/intakes.service.ts"
Task: "T009 [US2] Apply sectorId filtering to the discovery query in src/intakes/intakes.service.ts"
Task: "T010 [US2] Apply keyword search filtering to the discovery query in src/intakes/intakes.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the MVP with the first quickstart scenario
5. Stop for review if an early delivery is desired

### Incremental Delivery

1. Deliver US1 to establish the discovery endpoint
2. Add US2 filters without changing the base response contract
3. Add US3 empty-state and visibility-change handling
4. Finish with Swagger, lint, tests, and quickstart validation

### Parallel Team Strategy

1. One developer completes Phase 2 to establish the controller/service seam
2. Once US1 is stable:
   - Developer A handles `type` and `sectorId` filters
   - Developer B handles `search` and quickstart updates
3. Final polish is shared after endpoint behavior is locked

---

## Notes

- MVP scope is **User Story 1** only
- Total tasks: **19**
- Task count by story:
  - **US1**: 4 tasks
  - **US2**: 5 tasks
  - **US3**: 4 tasks
- Remaining tasks are setup, foundational, and polish
- All tasks follow the required checklist format with IDs, labels, and file paths
