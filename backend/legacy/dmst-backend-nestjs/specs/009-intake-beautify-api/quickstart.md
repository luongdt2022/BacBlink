# Quickstart: Intake AI Beautification Endpoint

## Prerequisites

- NestJS app running (`npm run start:dev`)
- Valid JWT for a regular user (User A) and an admin
- An intake with title and content belonging to User A

## 1. User beautifies their own intake

```bash
curl -X POST http://localhost:3013/my/intakes/<intake-id>/beautify \
  -H "Authorization: Bearer <token-user-a>"
```

Expected `200`:
```json
{
  "success": true,
  "data": {
    "id": "<intake-id>",
    "title": "original title",
    "aiProcessTitle": "AI-generated B2B title",
    "aiProcessedContent": "<h1>...</h1>",
    "aiProcessingStatus": "completed"
  }
}
```

Verify DB:
```sql
SELECT ai_process_title, ai_processed_content, ai_processing_status
FROM intakes WHERE id = '<intake-id>';
-- Must match the response values
```

## 2. User cannot beautify another user's intake

```bash
curl -X POST http://localhost:3013/my/intakes/<other-user-intake-id>/beautify \
  -H "Authorization: Bearer <token-user-a>"
```

Expected: `404` (intake not found for this user) or `403`.

## 3. Admin beautifies any intake

```bash
curl -X POST http://localhost:3013/admin/intakes/<any-intake-id>/beautify \
  -H "Authorization: Bearer <admin-token>"
```

Expected `200` with the same shape as scenario 1.

## 4. Intake with no content returns error

```bash
# Create or use an intake with no content, then:
curl -X POST http://localhost:3013/my/intakes/<no-content-intake-id>/beautify \
  -H "Authorization: Bearer <token-user-a>"
```

Expected: `422` Unprocessable Entity — no AI call made, DB unchanged.

## 5. Unauthenticated request is rejected

```bash
curl -X POST http://localhost:3013/my/intakes/<intake-id>/beautify
```

Expected: `401` Unauthorized.
