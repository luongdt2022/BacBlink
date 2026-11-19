# Data Model: Intake Form UX Update

**Branch**: `006-intake-form-ux` | **Date**: 2026-04-01

## State Changes

This feature is purely a UI change. No new API endpoints, no new data entities, no schema changes.

### Modified State: `status`

Already exists in `IntakeFormPage` as `const [status, setStatus] = useState<IntakeStatus>('draft')`.

| Property | Type | Values | Default |
|----------|------|--------|---------|
| `status` | `IntakeStatus` | `'draft'` \| `'published'` | `'draft'` (new) / loaded from intake (edit) |

**Role change**: `status` was previously a read-only reflection of the saved intake status (only updated after a save). After this feature, it becomes the **user-controlled selector value** — the user can change it before saving, and `handleSave` reads it to decide what to do.

## Removed Handler

`handleSaveDraft` is removed. Its logic is merged into the unified `handleSave` function:

```
handleSave():
  if status === 'draft':
    → validate title only
    → call updateIntake/createIntake with status='draft'
    → toast: 'Đã lưu nháp thành công...'
  if status === 'published':
    → validate title + content
    → call updateIntake/createIntake with status='published'
    → toast: 'Đã công bố thông tin thành công...'
```

## No New Entities

No new database tables, API contracts, or TypeScript interfaces are introduced.
