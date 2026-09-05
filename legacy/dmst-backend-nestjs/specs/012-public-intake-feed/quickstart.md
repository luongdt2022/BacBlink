# Quickstart: Public Intake Feed Validation

## Prerequisites

- NestJS app running locally, for example with `npm run start:dev`
- API prefix/version configured so routes resolve under `/api/v1`
- Valid JWTs for at least two regular users: User A and User B
- Seed data or test data that includes:
  - at least one `published` intake owned by User B
  - at least one `draft` intake owned by User B
  - at least one intake owned by User A
  - optional variation in `type`, `sectorId`, and `title/content` for filter checks

---

## 1. Retrieve the first discovery page

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "<published-intake-id>",
      "title": "...",
      "status": "published",
      "userId": "<user-b-id>"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Verify:

- No record in `data` belongs to User A
- No record in `data` has `status = draft`

---

## 2. Confirm requester-owned intakes are excluded

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=20" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: User A's own intake IDs are absent even if they are `published`.

---

## 3. Confirm drafts from other users are excluded

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=20" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: User B's draft intake is absent; only User B's published intake appears.

---

## 4. Filter by type

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&type=challenge" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: Every returned record has `"type": "challenge"` and still belongs to another user.

---

## 5. Filter by sector

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&sectorId=<sector-uuid>" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: Only published intakes from other users in the specified sector are returned.

---

## 6. Search by keyword

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&search=robot" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: Every returned record matches the keyword search and still satisfies published + other-user rules.

---

## 7. Combined filters (`type` + `sectorId` + `search`)

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&type=ip&sectorId=<sector-uuid>&search=ai" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**:

- Every record has `"type": "ip"`
- Every record belongs to `<sector-uuid>`
- Every record matches keyword `ai`
- Every record still satisfies `published` + other-user rules

---

## 8. Search keyword case variation

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&search=Robot" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: Result set behavior is consistent with `search=robot` for equivalent content (case-insensitive matching).

---

## 9. Pagination while filtering

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=2&limit=5&type=challenge" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**:

- Returned records still satisfy `type=challenge`
- `total`, `page`, `limit`, `totalPages` are computed from the filtered dataset
- No overlap with page 1 records for the same filter set

---

## 10. Invalid filter value rejected (validation)

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&type=invalid-type" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 400)**: Request fails validation because `type` must be `ip` or `challenge`.

---

## 11. Invalid sectorId rejected (validation)

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&sectorId=not-a-uuid" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 400)**: Request fails validation because `sectorId` must be a valid UUID.

---

## 12. Empty result set

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10&search=no-match-keyword" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:

```json
{
  "success": true,
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

---

## 13. Out-of-range page

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=99&limit=10" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: HTTP 200 with an empty `data` array and valid pagination metadata.

---

## 14. Unauthenticated request rejected

```bash
curl "http://localhost:3013/api/v1/my/intakes/discover?page=1&limit=10"
```

**Expected (HTTP 401)**.
