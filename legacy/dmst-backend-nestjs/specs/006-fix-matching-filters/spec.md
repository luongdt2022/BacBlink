# Feature Specification: Matching Filter — Cross-User & Published Only

**Feature Branch**: `006-fix-matching-filters`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "chỉ matching với IP hoặc challenge của user khác, và IP/challenge của user khác ở chế độ công khai, user setting matching auto phải là on"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Matches computed only against other users' published intakes (Priority: P1)

When the system auto-computes matches for an intake (Step 4 of the AI pipeline), it must
only consider intakes that belong to a different user AND have a public (published) status.
Intakes owned by the same user or intakes still in draft status must never appear as match
candidates.

**Why this priority**: Privacy and relevance. A user matching against their own intakes is
meaningless. Matching against unpublished (draft) intakes exposes content the owner has not
yet made public.

**Independent Test**: Submit an intake as User A (with `matchingAuto=true`). After the AI
pipeline completes, query `intake_matches`. Confirm: no row points to User A's own intakes,
and no row points to any draft intake owned by any user.

**Acceptance Scenarios**:

1. **Given** User A has an IP intake that completes the AI pipeline and `matchingAuto=true`,
   **When** `computeMatches` runs,
   **Then** only challenge intakes owned by users other than User A AND with status=published
   appear in `intake_matches` for that IP.

2. **Given** User B has a challenge intake with status=draft,
   **When** User A's IP intake goes through `computeMatches`,
   **Then** User B's draft challenge does not appear in User A's `intake_matches`.

3. **Given** User A has both an IP intake and a challenge intake (published),
   **When** User A's IP intake runs `computeMatches`,
   **Then** User A's own challenge intake is excluded from the results.

4. **Given** an intake has no owner (seed/admin intake with userId=null),
   **When** `computeMatches` runs for that intake,
   **Then** matching proceeds against all published intakes of the opposite type regardless
   of ownership (no user to exclude).

---

### Edge Cases

- What if the intake owner has no matching published intakes of the opposite type from other
  users? The match list is empty — no error, no partial matches.
- What if an intake's userId is null (seed/admin created)? No cross-user exclusion filter is
  applied, but the published-status filter still applies to candidates.
- What if `matchingAuto` is off for the user? `computeMatches` is never called — this
  existing behaviour is unchanged.
- What if the intake being processed is itself in draft status? The pipeline still runs; the
  published constraint applies only to the candidate intakes, not the source intake.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST exclude the intake owner's own intakes from match candidates
  during `computeMatches`.
- **FR-002**: The system MUST exclude all draft-status intakes from match candidates during
  `computeMatches`, regardless of ownership.
- **FR-003**: When an intake has no owner (userId is null), the system MUST skip the
  cross-user filter and match against all published intakes of the opposite type.
- **FR-004**: The `matchingAuto` gate MUST remain in effect: if the intake owner's
  `matchingAuto` setting is off, `computeMatches` MUST NOT run at all.
- **FR-005**: All three filters (cross-user exclusion, published-status requirement, and
  `matchingAuto` gate) MUST be applied together — none can be bypassed independently.
- **FR-006**: The system MUST NOT change how matches are read or displayed; only the
  population of `intake_matches` is affected by this change.

### Key Entities

- **Intake**: Has an owner (`userId`, nullable) and a publication status (`draft` or
  `published`). Match candidates must have status=`published` and a different owner.
- **IntakeMatch**: A pre-computed pairing of one IP intake with one Challenge intake. After
  this change, each row is guaranteed to link intakes from different users, both published
  at compute time.
- **UserSetting**: Per-user toggle `matchingAuto` (on/off). Already gating `computeMatches`;
  no changes to this entity are required.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After the change, zero rows in `intake_matches` link two intakes that share
  the same non-null `userId`.
- **SC-002**: After the change, zero rows in `intake_matches` reference an intake with
  status=`draft`.
- **SC-003**: Existing published cross-user matches continue to be computed and stored
  without regression — match count for valid pairs is unchanged.
- **SC-004**: The `matchingAuto=off` gate continues to suppress all match computation; no
  matches are created for intakes whose owner has disabled auto-matching.

## Assumptions

- An intake is considered "public" when its `status` field equals `published`; no other
  visibility mechanism exists in this system.
- The cross-user filter uses the `userId` of the intake being processed (source intake),
  not the userId of an HTTP client or session.
- Seed/admin-created intakes (userId=null) are treated as ownerless: no user-exclusion
  filter is applied, but the published-status filter still applies to all candidates.
- Re-computing existing `intake_matches` rows (backfill) is out of scope; the new filters
  apply only to future `computeMatches` runs triggered by the AI pipeline.
- No changes are needed to the read/display endpoints for matches.
