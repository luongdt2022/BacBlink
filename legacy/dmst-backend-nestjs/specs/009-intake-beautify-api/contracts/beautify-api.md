# API Contract: Intake Beautification

**Branch**: `009-intake-beautify-api` | **Date**: 2026-03-30

## User endpoint

```
POST /my/intakes/:id/beautify
Authorization: Bearer <jwt>
```

**Path params**: `id` — UUID of the intake (must be owned by the authenticated user)

**Request body**: none

**Success response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "original title",
    "aiProcessTitle": "AI-generated B2B title",
    "aiProcessedContent": "<h1>...</h1>",
    "aiProcessingStatus": "completed"
  }
}
```

**Error responses**:

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid JWT |
| 403 | Intake exists but belongs to another user |
| 404 | Intake not found |
| 422 | Intake has no content |
| 500 | AI service error or unparseable response |

---

## Admin endpoint

```
POST /admin/intakes/:id/beautify
Authorization: Bearer <admin-jwt>
```

**Path params**: `id` — UUID of any intake

**Request body**: none

**Success response**: same shape as user endpoint (`200 OK`)

**Error responses**:

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid JWT |
| 403 | Token is not an admin token |
| 404 | Intake not found |
| 422 | Intake has no content |
| 500 | AI service error or unparseable response |

---

## Notes

- Both endpoints are idempotent within a session: calling twice produces a new LLM result
  each time (not cached).
- The endpoint does NOT trigger chunk-embed or matching pipeline steps.
- Response follows the project-wide `{ success, data }` envelope convention.
