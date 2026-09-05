# API Contract: Manual Intake Match

**Feature**: `005-manual-intake-match`
**Base URL**: `{VITE_API_BASE_URL}/api/v1`
**Authentication**: Bearer JWT token required

---

## POST /my/intakes/:id/compute-matches

Triggers the matching algorithm for the authenticated user's intake. Returns the number of matches found and stored.

### Request

```
POST /api/v1/my/intakes/:id/compute-matches
Authorization: Bearer <token>
```

| Parameter | In | Required | Description |
|-----------|-----|----------|-------------|
| `id` | path | Yes | UUID of the intake to match |

No request body required.

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "matchCount": 3
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` on success |
| `data.matchCount` | `number` | Number of matches computed and stored |

### Error Responses

| Status | When | UI behaviour |
|--------|------|-------------|
| 401 | Token missing or invalid | Redirect to login (handled by auth layer) |
| 404 | Intake not found or belongs to another user | Show error toast |
| 422 | Intake is not in `published` status | Button hidden before reaching this (status gate on frontend) |
| 500 | Server / embedding / Elasticsearch error | Show error toast |

---

## Frontend API Client

**File**: `src/features/intakes/api/intake.ts`

```typescript
// computeMatches(id: string): Promise<{ matchCount: number }>
// Throws on non-ok responses so the caller can show an error toast
```

Uses `getAuthHeaders()` from `src/services/api/client.ts`.
