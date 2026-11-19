# API Contracts: Stories

Base path: `/api/v1/stories`  
Auth: Bearer token (all endpoints require authentication)

---

## POST /api/v1/stories
**Create a story**

**Request body**:
```json
{
  "title": "string (required, max 255)",
  "type": "success | failure (required)",
  "content": "string (required, rich text)",
  "lesson": "string | null (required when type=failure)",
  "status": "draft | published (required)"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "title": "string",
  "type": "success | failure",
  "content": "string",
  "lesson": "string | null",
  "status": "draft | published",
  "isHidden": false,
  "authorId": "uuid",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Errors**: `400` validation fail | `401` unauthenticated

---

## GET /api/v1/stories
**List stories (public: published + not hidden; own drafts also visible)**

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | |
| `limit` | number | 20 | max 100 |
| `type` | `success\|failure` | — | filter by type |
| `status` | `draft\|published` | — | filter by status (own only for draft) |

**Response 200**:
```json
{
  "data": [ StoryListItem ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**Errors**: `401` unauthenticated

---

## GET /api/v1/stories/my
**List current user's own stories (all statuses)**

Same query params as above. Returns only stories authored by the caller.

---

## GET /api/v1/stories/:id
**Get story detail**

**Response 200**: Full `Story` object  
**Errors**: `401` unauthenticated | `403` hidden story (non-admin) | `404` not found

---

## PUT /api/v1/stories/:id
**Update story (owner only)**

**Request body**: Same as POST (all fields optional for update)  
**Response 200**: Updated `Story` object  
**Errors**: `400` validation | `401` | `403` not owner | `404`

---

## DELETE /api/v1/stories/:id
**Delete story (owner or admin)**

**Response 204**: No content  
**Errors**: `401` | `403` not owner/admin | `404`

---

## PATCH /api/v1/stories/:id/visibility *(admin only)*
**Toggle story visibility**

**Request body**:
```json
{ "isHidden": true }
```

**Response 200**: Updated `Story` object  
**Errors**: `401` | `403` not admin | `404`

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "lesson is required when type is failure",
  "error": "Bad Request"
}
```
