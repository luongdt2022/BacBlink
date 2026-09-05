# Implementation Plan: Intake Form UX Update

**Branch**: `006-intake-form-ux` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-intake-form-ux/spec.md`

## Summary

Replace the two-button (Lưu nháp / Công bố) action pattern in the intake create/edit sidebar with a status selector (Nháp / Công khai) and a single "Lưu" button. Elevate the action card visually so it stands out from surrounding form fields. All changes are confined to a single file: `src/features/intakes/pages/IntakeFormPage.tsx`.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict) + React 18
**Primary Dependencies**: Tailwind CSS, shadcn/ui, lucide-react, sonner
**Storage**: N/A (no local persistence — state driven by backend API on load/save)
**Testing**: No tests requested
**Target Platform**: Web SPA (Vite)
**Project Type**: Frontend web application
**Performance Goals**: Standard web app responsiveness
**Constraints**: No new imports unless absolutely required; no new files; no backend changes
**Scale/Scope**: 1 file modified — `src/features/intakes/pages/IntakeFormPage.tsx`

## Constitution Check

Constitution file contains only template placeholders — no active project-specific gates to enforce. Proceeding without violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-intake-form-ux/
├── plan.md          ✓ (this file)
├── research.md      ✓
├── data-model.md    ✓
├── quickstart.md    ✓
└── tasks.md         (created by /speckit.tasks)
```

### Source Code

```text
src/features/intakes/pages/
└── IntakeFormPage.tsx    ← ONLY file modified
```

## Implementation Design

### Status Selector

Reuse the exact same button-group pattern as the existing "Loại" (IP/Challenge) selector:

```tsx
<div className="grid grid-cols-2 gap-2">
  <button type="button" onClick={() => setStatus('draft')}
    className={status === 'draft' ? 'border-primary bg-primary/5 text-primary ...' : '...'}
  >
    <Save className="h-4 w-4" /> Nháp
  </button>
  <button type="button" onClick={() => setStatus('published')}
    className={status === 'published' ? 'border-primary bg-primary/5 text-primary ...' : '...'}
  >
    <Globe className="h-4 w-4" /> Công khai
  </button>
</div>
```

All icons (`Save`, `Globe`) are already imported.

### Unified Save Handler

Remove `handleSaveDraft`. Rename `handlePublish` to `handleSave`. Branch on `status` state:

```typescript
const handleSave = async () => {
  if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
  if (status === 'published' && !content.trim()) {
    toast.error('Vui lòng nhập nội dung công khai'); return;
  }
  // ... same save/update logic, use status from state
};
```

### Action Card Styling

Change the action section `div` from:
```html
<div class="space-y-2 border-t border-gray-200 p-4">
```
to:
```html
<div class="space-y-3 rounded-t-xl bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
```

This floats the card above the scrollable content with a subtle top shadow.

## Complexity Tracking

No constitution violations. No complexity justification needed.
