# Quickstart: Manual Intake Match API Validation

## Prerequisites

- NestJS app running (`npm run start:dev`)
- Redis running (BullMQ `intakes-queue` must be active)
- BGE-M3 and Elasticsearch running
- Valid JWT for at least two regular users (User A, User B) and an admin JWT
- At least one published intake per user in the same sector with `content` set

---

## 1. User triggers manual match on own published intake

```bash
curl -X POST http://localhost:3013/my/intakes/<ip-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected response (HTTP 200) — immediate:**
```json
{
  "success": true,
  "data": {
    "message": "Matching has been queued"
  }
}
```

**Wait ~10 seconds for queue job to complete, then verify in DB:**
```sql
SELECT COUNT(*) FROM intake_matches
WHERE ip_intake_id = '<ip-intake-id>';
-- Expected: N rows (published challenges from other users)
```

---

## 2. Reject match on draft intake

```bash
curl -X POST http://localhost:3013/my/intakes/<draft-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 422):**
```json
{
  "statusCode": 422,
  "message": "Intake <id> must be published before matching can be performed"
}
```

---

## 3. Reject match on another user's intake

```bash
curl -X POST http://localhost:3013/my/intakes/<user-b-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 404):**
```json
{
  "statusCode": 404,
  "message": "Intake with ID <id> not found"
}
```

---

## 4. Admin triggers manual match on any published intake

```bash
curl -X POST http://localhost:3013/admin/intakes/<challenge-intake-id>/compute-matches \
  -H "Authorization: Bearer <admin-token>"
```

**Expected (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "message": "Matching has been queued"
  }
}
```

---

## 5. Admin: reject match on draft intake

```bash
curl -X POST http://localhost:3013/admin/intakes/<draft-intake-id>/compute-matches \
  -H "Authorization: Bearer <admin-token>"
```

**Expected (HTTP 422).**

---

## 6. Verify own-user intakes excluded from results (after queue job completes)

```sql
SELECT im.ip_intake_id, im.challenge_intake_id,
       ip_i.user_id AS ip_owner, ch_i.user_id AS ch_owner
FROM intake_matches im
JOIN intakes ip_i ON ip_i.id = im.ip_intake_id
JOIN intakes ch_i ON ch_i.id = im.challenge_intake_id
WHERE im.ip_intake_id = '<ip-intake-id>'
  AND ip_i.user_id = ch_i.user_id;
-- Expected: 0 rows
```

---

## 7. Verify only published intakes appear as matches

```sql
SELECT COUNT(*) FROM intake_matches im
JOIN intakes ch ON ch.id = im.challenge_intake_id
WHERE im.ip_intake_id = '<ip-intake-id>'
  AND ch.status != 'published';
-- Expected: 0
```

---

## 8. Unauthenticated request rejected

```bash
curl -X POST http://localhost:3013/my/intakes/<id>/compute-matches
```

**Expected (HTTP 401).**

---

## Recommended test sequence

1. Create published IP intake (User A) with content → `POST /my/intakes`
2. Create published Challenge intake (User B) with content
3. Trigger manual match → `POST /my/intakes/:id/compute-matches` (User A)
4. Wait ~10 seconds → verify `intake_matches` via SQL (scenarios 6 & 7)
5. Repeat from admin → `POST /admin/intakes/:id/compute-matches`
