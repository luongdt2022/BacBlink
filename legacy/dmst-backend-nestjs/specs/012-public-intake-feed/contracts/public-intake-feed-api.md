# API Contract: Public Intake Feed

**Feature**: 012-public-intake-feed  
**Date**: 2026-04-03

---

## Endpoint: User Discovery Feed

**Route**: `GET /my/intakes/discover`  
**Global Prefix**: `/${API_PREFIX}/${API_VERSION}`  
**Auth**: `JwtAuthGuard` (Bearer token, regular user)  
**Purpose**: Return published intakes created by other users, with pagination and filters similar to the personal intake list.

### Request

```http
GET /api/v1/my/intakes/discover?page=1&limit=10&type=ip&sectorId=<uuid>&search=robot
Authorization: Bearer <user-jwt>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | no | 1-based page number; defaults to existing list behavior |
| `limit` | integer | no | page size; uses existing list validation limits |
| `type` | `ip` \| `challenge` | no | Filter by intake type |
| `sectorId` | uuid | no | Filter by sector |
| `search` | string | no | Keyword search against discovery text fields |

### Discovery Rules

The server applies these rules regardless of client query:

1. Only `published` intakes are eligible
2. The requesting user's own intakes are excluded
3. Results are sorted newest first
4. Empty-result pages return HTTP 200 with an empty `data` array

### Success Response — HTTP 200

```json
{
  "success": true,
  "data": [
    {
      "id": "8c2f2dd3-7a5a-4f09-9a2e-1f776e1d2150",
      "title": "AI Drug Screening Workflow",
      "type": "ip",
      "status": "published",
      "userId": "3c928574-e8be-4c9e-b6f1-a540be92d54b",
      "createdAt": "2026-04-03T08:15:00.000Z",
      "attachments": [],
      "intakeSectors": []
    }
  ],
  "total": 27,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### Error Responses

| HTTP | Condition |
|------|-----------|
| 401 | Missing or invalid JWT |
| 400 | Invalid query parameter (e.g. malformed UUID, limit above max, page below 1) |

### Notes

- The endpoint intentionally does not return `totalByStatus` because all eligible results are already constrained to `published`
- The response shape follows the constitution rule for paginated lists
- This endpoint does not replace the existing public `GET /intakes`; it provides authenticated discovery semantics for signed-in users
