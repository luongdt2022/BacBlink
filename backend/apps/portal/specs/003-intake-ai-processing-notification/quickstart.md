# Quickstart: Intake AI Processing Notification

## Feature Overview

After creating or updating an intake, show a 5-second toast: "Đang chờ AI xử lý nội dung. App sẽ thông báo cho bạn khi hoàn thiện."
In the intake list, display AI processing status badges and disable click on processing items.

## Files to Change

### 1. `src/features/intakes/api/intake.ts`
Add `aiProcessingStatus` to `IntakeListItem`:

```typescript
export type AiProcessingStatus = 'processing' | 'completed' | 'failed' | null;

export interface IntakeListItem {
  // ... existing fields ...
  aiProcessingStatus: AiProcessingStatus; // NEW
}
```

### 2. `src/features/intakes/pages/IntakeFormPage.tsx`
Add toast after successful create/update. In both `handleSaveDraft` and `handlePublish`:

```typescript
import { toast } from 'sonner';

// After await createIntake(...) or await updateIntake(...)
toast(
  'Đang chờ AI xử lý nội dung. App sẽ thông báo cho bạn khi hoàn thiện.',
  { duration: 5000 }
);
```

### 3. `src/features/intakes/pages/IntakesPage.tsx`

**Add import:**
```typescript
import { Loader2 } from 'lucide-react';
```

**Add AiProcessingBadge component:**
```typescript
function AiProcessingBadge({ status }: { status: string | null }) {
  if (status === 'processing') {
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        <Loader2 className="h-3 w-3 animate-spin" />
        Đang xử lý AI
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        Xử lý AI thất bại
      </span>
    );
  }
  return null; // completed or null (no content) — no badge needed
}
```

**Modify row rendering:**
- Add `isProcessing` condition:
```typescript
const isProcessing = intake.aiProcessingStatus === 'processing' || intake.aiProcessingStatus === null;
```
- Apply to `<tr>`: `className={isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`
- Modify `handleRowClick`: skip navigation when `isProcessing`
- Add `AiProcessingBadge` in the status column
