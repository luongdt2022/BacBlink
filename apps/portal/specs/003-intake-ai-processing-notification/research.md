# Research: Intake AI Processing Notification

## Decision 1: AI Processing Status Key in Backend

**Question**: What field tracks AI processing on an Intake entity?

**Answer**: `aiProcessingStatus` field on the `Intake` entity.

**Rationale**: The `Intake` entity (TypeORM) has two status fields relevant to AI:
- `aiProcessingStatus: AiProcessingStatus | null` — tracks the B2B marketing content processing pipeline
- `aiChunkingStatus: AiChunkingStatus | null` — tracks the chunk+embedding pipeline

The `aiProcessingStatus` is the correct field to display to users because it represents whether the AI has finished processing the intake content. It is set synchronously on intake creation/update (to `PROCESSING`), then updated asynchronously (to `COMPLETED` or `FAILED`).

The `create()` and `update()` methods in `intakes.service.ts` both set `aiProcessingStatus: AiProcessingStatus.PROCESSING` when content exists, then call `applyAiProcessing()` as a fire-and-forget async operation.

**Alternatives considered**:
- Using `aiChunkingStatus` — rejected because chunking is the second step, after AI processing. Users should be notified after the first step completes.
- Using `aiProcessedContent` nullability — rejected because it's indirect and confusing to explain to users.

## Decision 2: How to Show AI Status on Intake List

**Question**: Where in the list row should the AI status badge appear?

**Answer**: In the existing "Trạng thái" column, displayed alongside the draft/published badge.

**Rationale**: The "Trạng thái" column already exists and is the natural place to show all status-related information. Adding a second badge below the existing status badge keeps related information together without adding a new column.

**Alternatives considered**:
- Adding a new dedicated column for AI status — rejected because it adds visual complexity and the status is secondary to the main draft/published status.
- Tooltip on hover — rejected because badges are more visible and scannable.

## Decision 3: How to Disable Click on Processing Items

**Question**: How to prevent clicking on rows with `aiProcessingStatus === 'processing'`?

**Answer**: Two-layer approach:
1. Visual: Apply `opacity-50 cursor-not-allowed` to the `<tr>` element.
2. Functional: Skip navigation in `handleRowClick` when processing.

**Rationale**: The visual feedback prevents users from trying; the functional guard prevents accidental navigation. The edit/delete actions use `stopPropagation` so they are unaffected.

**Alternatives considered**:
- Only visual dimming — rejected because the user experience of clicking and seeing no navigation is confusing.
- Stopping propagation only — rejected because the visual dimming is the primary UX signal.

## Decision 4: Intake Without Content (`aiProcessingStatus === null`)

**Question**: Should intakes with no content (never had AI processing triggered) also be non-clickable?

**Answer**: Yes — dim and disable rows where `aiProcessingStatus === null`.

**Rationale**: An intake with no content has not gone through AI processing and likely lacks `aiProcessedContent`. Users should complete the intake (add content) before viewing details. This is a UX nudge to complete the intake first.

**Decision note**: Intakes with `status === 'draft'` and `aiProcessingStatus === null` may be intentional drafts — but for consistency, we disable all items where AI processing has not completed (either not run or still processing). Draft items with completed AI processing should remain clickable.

## Decision 5: Toast Duration

**Question**: Should the toast auto-dismiss or stay until dismissed?

**Answer**: 5 seconds auto-dismiss (`duration: 5000`).

**Rationale**: The user already knows the intake was created/updated (via success toast or navigation). The AI processing notification is informational and non-critical. A 5-second window is long enough to read and acknowledge without being persistent.

## Decision 6: Sonner vs Other Notification Libraries

**Question**: Which toast library is already used in the project?

**Answer**: Sonner (`sonner`).

**Rationale**: The project already has `sonner` installed and uses `toast()` from `sonner` throughout the codebase (e.g., in `IntakesPage.tsx`, `IntakeFormPage.tsx`). No new dependency needed.

## Technology & Patterns

- **Sonner**: `toast('message', { duration: 5000 })` — existing library
- **TypeScript**: `aiProcessingStatus: 'processing' | 'completed' | 'failed' | null` — aligns with backend enum
- **Tailwind CSS**: `opacity-50 cursor-not-allowed` for disabled rows
- **React pattern**: `stopPropagation` on action buttons; conditional `onClick` handler on row
