# Quickstart: Matching Filter Validation

## Prerequisites

- NestJS app running (`npm run start:dev`)
- Valid JWT tokens for at least two different users (User A and User B)
- Both users have `matchingAuto=true` (default)

## 1. Verify cross-user filter: own intakes are never matched

**Setup**: Create a published IP intake as User A, and a published Challenge intake also as User A.

```bash
# Create an IP intake as User A
curl -X POST http://localhost:3013/my/intakes \
  -H "Authorization: Bearer <token-user-a>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My IP","content":"IP solution content","type":"ip","sectorIds":["<sector-id>"]}'

# Publish User A's IP intake (admin route or PATCH status)
# Create a Challenge intake as User A
curl -X POST http://localhost:3013/my/intakes \
  -H "Authorization: Bearer <token-user-a>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Challenge","content":"challenge content","type":"challenge","sectorIds":["<sector-id>"]}'
```

**Wait ~60 seconds** for the AI pipeline to complete (LLM → chunk/embed → ES index → computeMatches).

**Check**: Query `intake_matches` and confirm User A's IP intake has NO match pointing to
User A's own challenge:

```sql
SELECT * FROM intake_matches im
JOIN intakes ip_i ON ip_i.id = im.ip_intake_id
JOIN intakes ch_i ON ch_i.id = im.challenge_intake_id
WHERE ip_i.user_id = ch_i.user_id;
-- Expected: 0 rows
```

## 2. Verify published filter: draft intakes are never matched

**Setup**: Create a published IP intake as User A, and a DRAFT Challenge intake as User B.

```bash
# Create a Challenge intake as User B (status defaults to draft)
curl -X POST http://localhost:3013/my/intakes \
  -H "Authorization: Bearer <token-user-b>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Draft Challenge","content":"draft challenge content","type":"challenge","sectorIds":["<sector-id>"]}'
```

**Wait ~60 seconds** after User A's IP intake pipeline completes.

**Check**: Query `intake_matches` and confirm User B's DRAFT challenge is NOT referenced:

```sql
SELECT COUNT(*) FROM intake_matches im
JOIN intakes ch ON ch.id = im.challenge_intake_id
WHERE ch.status = 'draft';
-- Expected: 0
```

## 3. Verify published cross-user intakes DO get matched

**Setup**: User B publishes their challenge intake.

```bash
# Publish User B's challenge (via admin or status update)
# Then trigger computeMatches for User A's IP intake (by updating content)
curl -X PATCH http://localhost:3013/my/intakes/<ip-intake-id> \
  -H "Authorization: Bearer <token-user-a>" \
  -H "Content-Type: application/json" \
  -d '{"content":"updated IP content to trigger re-pipeline"}'
```

**Wait ~60 seconds**.

**Check**: User A's IP intake now has a match pointing to User B's PUBLISHED challenge:

```sql
SELECT im.*, ch.status, ch.user_id
FROM intake_matches im
JOIN intakes ch ON ch.id = im.challenge_intake_id
WHERE im.ip_intake_id = '<ip-intake-id>'
  AND ch.status = 'published';
-- Expected: 1+ rows (User B's challenge should appear)
```

## 4. Verify matchingAuto=off gate still works

```bash
# Turn off auto-matching for User A
curl -X PATCH http://localhost:3013/my/settings \
  -H "Authorization: Bearer <token-user-a>" \
  -H "Content-Type: application/json" \
  -d '{"matchingAuto": false}'

# Create a new intake as User A
curl -X POST http://localhost:3013/my/intakes \
  -H "Authorization: Bearer <token-user-a>" \
  -H "Content-Type: application/json" \
  -d '{"title":"No Match IP","content":"...","type":"ip","sectorIds":["<sector-id>"]}'
```

**Wait ~60 seconds**. Confirm no new rows appear in `intake_matches` for this new intake:

```sql
SELECT * FROM intake_matches WHERE ip_intake_id = '<new-intake-id>';
-- Expected: 0 rows
```
