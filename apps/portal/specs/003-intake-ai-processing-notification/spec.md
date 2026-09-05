# Feature Specification: Intake AI Processing Notification

**Feature Branch**: `003-intake-ai-processing-notification`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "ở front end user site mình cần, thêm 1 thông báo sau khi tạo xong intake, khi người dùng tạo xong intake phía backend cần xử lý bằng AI nên, khi tạo xong giúp mình toast 1 cái thông báo 5 giây bảo là đang chờ AI xử lý nội dung và app của chúng ta sẽ thông báo cho người dùng sau khi hoàn thiện, đồng thời ở màn list thêm status cho việc chờ AI xử lý (bạn cần check code backend để xem đấy là key nào và show lên trên item ở màn list intake phía user site) đồng thời cũng tạm disable item đấy không cho click vào vội"

## User Scenarios & Testing

### User Story 1 - Toast notification on intake creation (Priority: P1)

Authenticated user creates an intake (draft or published). Since AI processing is triggered asynchronously (fire-and-forget), the frontend must immediately notify the user that their content is being processed.

**Acceptance Scenarios**:

1. **Given** the user submits the intake form (save draft or publish), **When** the API returns successfully, **Then** a Sonner toast appears for 5 seconds with message: "Đang chờ AI xử lý nội dung. App sẽ thông báo cho bạn khi hoàn thiện."
2. **Given** the user submits the intake form, **When** the API returns an error, **Then** the toast does NOT appear; the error toast shows instead.

### User Story 2 - AI processing status badge in intake list (Priority: P1)

Authenticated user views their intake list. Items that are still being processed by AI should show a visible status indicator and be non-interactive.

**Acceptance Scenarios**:

1. **Given** the user is on the intake list page, **When** an intake item has `aiProcessingStatus === 'processing'`, **Then** a badge labeled "Đang xử lý AI" (amber/yellow) is displayed in the "Trạng thái" column.
2. **Given** the user is on the intake list page, **When** an intake item has `aiProcessingStatus === 'completed'`, **Then** the normal status badge (draft/published) is shown without the AI badge.
3. **Given** the user is on the intake list page, **When** an intake item has `aiProcessingStatus === 'failed'`, **Then** a badge labeled "Xử lý AI thất bại" (red) is displayed.
4. **Given** the user is on the intake list page, **When** an intake item has `aiProcessingStatus === 'processing'` or `aiProcessingStatus === null'` (no content), **Then** the row is visually dimmed/opacity-reduced and the entire row click is disabled (no navigation on row click).
5. **Given** the user is on the intake list page, **When** the list is filtered (status, type, search), **Then** the AI status badge remains visible on matching items.

## Requirements

### Functional Requirements

- **FR-001**: After a successful `POST /api/v1/my/intakes` or `PATCH /api/v1/my/intakes/:id` API call, display a Sonner toast for 5 seconds with message: "Đang chờ AI xử lý nội dung. App sẽ thông báo cho bạn khi hoàn thiện."
- **FR-002**: The `IntakeListItem` interface in `src/features/intakes/api/intake.ts` MUST include `aiProcessingStatus: 'processing' | 'completed' | 'failed' | null`.
- **FR-003**: The `GET /api/v1/my/intakes` API response already includes `aiProcessingStatus` — frontend must consume it in the list item.
- **FR-004**: The `IntakesPage.tsx` table's "Trạng thái" column MUST show an AI processing badge alongside the draft/published status when applicable.
- **FR-005**: When `aiProcessingStatus === 'processing'` or `aiProcessingStatus` is `null` and there is no content (indicating AI has not run), the list row MUST be:
  - Visually dimmed (`opacity-50`, `cursor-not-allowed`)
  - Non-clickable (row `onClick` is disabled)
- **FR-006**: The edit/delete action buttons in the row MUST remain functional even when AI processing is in progress.

### Backend Changes Required

No backend changes are required. The relevant fields already exist on the `Intake` entity:

- `aiProcessingStatus: AiProcessingStatus | null` — enum values: `processing`, `completed`, `failed`
- The `findMyIntakes()` method already returns full `Intake` entities (not stripped `IntakeListItem`), so `aiProcessingStatus` is included in the API response.

However, the `IntakeListItem` type in `src/features/intakes/api/intake.ts` does NOT include `aiProcessingStatus`, so it must be added.

### Frontend Changes Required

**File**: `src/features/intakes/api/intake.ts`

- Add `aiProcessingStatus` field to `IntakeListItem` interface (type: `'processing' | 'completed' | 'failed' | null`)

**File**: `src/features/intakes/pages/IntakesPage.tsx`

- Import `Loader2` icon from `lucide-react` for the AI processing indicator
- Create a `AiProcessingBadge` component to show AI status (`processing`, `failed`, `completed`)
- Modify the "Trạng thái" column to show both the existing `StatusBadge` and the `AiProcessingBadge` when applicable
- Modify `handleRowClick` to skip navigation when `aiProcessingStatus === 'processing'` or `null`
- Apply `opacity-50 cursor-not-allowed` to the `<tr>` element when AI is processing
- Stop event propagation on the row click when AI is processing

**File**: `src/features/intakes/pages/IntakeFormPage.tsx`

- After `createIntake()` or `updateIntake()` success, call `toast('Đang chờ AI xử lý nội dung. App sẽ thông báo cho bạn khi hoàn thiện.', { duration: 5000 })`
- Both `handleSaveDraft` and `handlePublish` need this toast

## Technical Notes

- The `aiProcessingStatus` is only set to `'processing'` when the intake has `content` (see `intakes.service.ts` create/update methods). Intakes without content will have `null` — these should also be disabled from clicking.
- The toast is non-blocking — it does NOT prevent navigation to the intake list.
- The "AI đang xử lý" badge should appear in a second row or adjacent to the existing status badge in the "Trạng thái" column. Use amber/orange for `processing`, green for `completed` (no badge needed), and red for `failed`.
- The `IntakeListItem` is currently returned from `getMyIntakes()` with the full `Intake` object, so all fields from `Intake` entity are available — but TypeScript typing is wrong and must be fixed.

## Success Criteria

- **SC-001**: Creating or updating an intake shows a 5-second Sonner toast: "Đang chờ AI xử lý nội dung. App sẽ thông báo cho bạn khi hoàn thiện."
- **SC-002**: Intake items with `aiProcessingStatus === 'processing'` show an amber "Đang xử lý AI" badge in the list.
- **SC-003**: Intake items with `aiProcessingStatus === 'failed'` show a red "Xử lý AI thất bại" badge in the list.
- **SC-004**: Intake items with AI processing status of `processing` or `null` (no content) have the row dimmed and non-clickable.
- **SC-005**: Edit and delete buttons remain functional even when AI is processing.
- **SC-006**: `npm test && npm run lint` passes with no new errors.
