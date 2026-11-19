# API Contract: compute-matches (Updated)

**Feature**: 013-match-original-content
**Affected endpoints**:
- `POST /my/intakes/:id/compute-matches`
- `POST /admin/intakes/:id/compute-matches`

## Response shapes — UNCHANGED

### 200 OK
```json
{
  "success": true,
  "data": {
    "message": "Matching has been queued"
  }
}
```

### 404 Not Found (unchanged)
```json
{
  "statusCode": 404,
  "message": "Intake with ID <id> not found"
}
```

### 422 — Draft intake (unchanged)
```json
{
  "statusCode": 422,
  "message": "Intake <id> must be published before matching can be performed"
}
```

### 422 — No content (CHANGED message)

**Before**: `"Intake <id> has no AI-processed content — please run /beautify first"`

**After**: `"Intake <id> has no content to match"`

**Trigger condition changed**: Was triggered when `aiProcessedContent` was null. Now triggered when `content` is null or empty. An intake with `content` set but no `aiProcessedContent` now returns **200**, not 422.

## Matching behavior — CHANGED

| Aspect | Before | After |
|--------|--------|-------|
| Query vector built from | `aiProcessTitle ?? title` + `aiProcessedContent ?? content` | `title` + `content` (always original) |
| BM25 fields | `text`, `intake_title`, `ai_process_title` | `text`, `intake_title` only |
| Beautify required | Yes (422 if not run) | No |
| `matchingAuto` gate | Unchanged | Unchanged |

## findMatchingChallenges — CHANGED (same logic)

`GET /my/intakes/:id/find-challenges` also uses original `title` + `content` for the query. Response shape is unchanged.
