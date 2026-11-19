# Data Model: Manual Intake Match Button

**Branch**: `005-manual-intake-match` | **Date**: 2026-03-31

## Frontend Data Shapes

### ComputeMatchesResponse

Shape returned by `POST /my/intakes/:id/compute-matches` on HTTP 200.

```typescript
interface ComputeMatchesResponse {
  success: boolean;
  data: {
    matchCount: number;
  };
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Always `true` on 200 |
| `data.matchCount` | `number` | Number of intake matches computed and stored |

### Existing Intake shape (relevant fields)

No changes to the `Intake` interface. The relevant fields already present:

| Field | Type | Used for |
|-------|------|---------|
| `id` | `string` | Passed to `computeMatches(id)` |
| `status` | `'draft' \| 'published'` | Gate condition — button only shown when `'published'` |

## Component State (IntakeDetailPage additions)

| State var | Type | Initial | Description |
|-----------|------|---------|-------------|
| `isMatching` | `boolean` | `false` | True while POST is in-flight; disables button |

## State Transitions

```
button clicked (intake.status === 'published')
  └─► isMatching=true, toast.loading() → toastId
      └─► POST /my/intakes/:id/compute-matches
          ├─► success (200)
          │     └─► toast.dismiss(toastId)
          │         toast.success("Tìm thấy N kết quả phù hợp")
          │         isMatching=false
          └─► failure (4xx/5xx/network)
                └─► toast.dismiss(toastId)
                    toast.error("Không thể tìm kiếm kết quả. Vui lòng thử lại.")
                    isMatching=false
```

## Validation Rules

- Button rendered only when `intake.status === 'published'`
- Button `disabled` prop set to `isMatching` to prevent concurrent requests
- No client-side ownership validation (enforced by `/my/` endpoint server-side)
