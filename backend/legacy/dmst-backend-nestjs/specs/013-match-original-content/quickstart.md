# Quickstart: Match on Original Content Validation

## Prerequisites

- NestJS app running (`npm run start:dev`)
- Redis, BGE-M3, and Elasticsearch running
- Valid JWT for at least two users (User A, User B) and an admin JWT
- At least one published intake per user in the same sector with `content` set
- **Beautification is NOT required** — matching works on original `content`

---

## 1. User triggers matching on a published intake (no beautify required)

```bash
# Create a published intake — do NOT call /beautify
curl -X POST http://localhost:3013/my/intakes/<ip-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:
```json
{
  "success": true,
  "data": { "message": "Matching has been queued" }
}
```

**Wait ~10 seconds, then verify DB**:
```sql
SELECT COUNT(*) FROM intake_matches
WHERE ip_intake_id = '<ip-intake-id>';
-- Expected: N rows (published challenges from other users)
```

---

## 2. Verify matching uses original content (not beautified)

```bash
# Beautify the same intake
curl -X POST http://localhost:3013/my/intakes/<ip-intake-id>/beautify \
  -H "Authorization: Bearer <token-user-a>"

# Trigger matching again
curl -X POST http://localhost:3013/my/intakes/<ip-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: Same match results as step 1 (beautify does not change matching).

---

## 3. Reject match on draft intake (unchanged)

```bash
curl -X POST http://localhost:3013/my/intakes/<draft-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 422)**:
```json
{
  "statusCode": 422,
  "message": "Intake <id> must be published before matching can be performed"
}
```

---

## 4. Reject match when intake has no content

```bash
# Create a published intake with no content field, then:
curl -X POST http://localhost:3013/my/intakes/<no-content-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 422)**:
```json
{
  "statusCode": 422,
  "message": "Intake <no-content-intake-id> has no content to match"
}
```

---

## 5. Reject match on another user's intake (unchanged)

```bash
curl -X POST http://localhost:3013/my/intakes/<user-b-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 404)**.

---

## 6. Admin triggers matching without beautify

```bash
curl -X POST http://localhost:3013/admin/intakes/<challenge-intake-id>/compute-matches \
  -H "Authorization: Bearer <admin-token>"
```

**Expected (HTTP 200)** — identical shape to scenario 1.

---

## 7. Verify own-user intakes excluded from results

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

## 8. Verify only published intakes appear as matches

```sql
SELECT COUNT(*) FROM intake_matches im
JOIN intakes ch ON ch.id = im.challenge_intake_id
WHERE im.ip_intake_id = '<ip-intake-id>'
  AND ch.status != 'published';
-- Expected: 0
```

---

## 9. Unauthenticated request rejected

```bash
curl -X POST http://localhost:3013/my/intakes/<id>/compute-matches
```

**Expected (HTTP 401)**.

---

## Recommended test sequence

1. Create published IP intake (User A) with content → `POST /my/intakes`
2. Create published Challenge intake (User B) with content
3. Trigger manual match → `POST /my/intakes/:id/compute-matches` (User A)
4. Wait ~10 seconds → verify `intake_matches` (scenarios 7 & 8)
5. Now beautify User A's intake → `POST /my/intakes/:id/beautify`
6. Re-trigger match → verify same results (scenario 2)
7. Repeat from admin → `POST /admin/intakes/:id/compute-matches`
