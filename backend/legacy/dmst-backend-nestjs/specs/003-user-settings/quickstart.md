# Quickstart: Personalized User Settings

## Prerequisites

- NestJS app running (or `npm run start:dev`)
- Valid JWT token for a test user
- Migration applied: `npm run migration:run`

## 1. Read Default Settings (New User)

```bash
curl -X GET http://localhost:3013/my/settings \
  -H "Authorization: Bearer <token>"
```

Expected:
```json
{ "matchingAuto": true }
```

## 2. Turn Off Auto-Matching

```bash
curl -X PATCH http://localhost:3013/my/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "matchingAuto": false }'
```

Expected:
```json
{ "matchingAuto": false }
```

## 3. Verify Setting Is Per-User

Log in as a different user, read their settings:

```bash
curl -X GET http://localhost:3013/my/settings \
  -H "Authorization: Bearer <token-user-b>"
```

Expected: `{ "matchingAuto": true }` (User B's setting is independent of User A's)

## 4. Verify Auto-Matching Is Gated

With `matchingAuto = false`, create an intake and check no match job runs:

```bash
curl -X POST http://localhost:3013/my/intakes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Test", "content": "...", "type": "ip", "sectorIds": [] }'
```

Wait ~30 seconds. Query `intake_matches` table and confirm no new matches appear for this
intake. Then set `matchingAuto = true`, create another intake, and confirm matches do appear.

## 5. Verify Migration

```bash
docker compose exec backend_app npm run migration:run:prod
# Should show: No migrations are pending (after first run)

# Or check table exists:
docker compose exec postgres psql -U postgres -d dmst_poc \
  -c "SELECT * FROM user_settings LIMIT 5;"
```
