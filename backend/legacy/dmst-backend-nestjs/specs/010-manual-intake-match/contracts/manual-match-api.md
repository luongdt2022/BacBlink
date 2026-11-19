# API Contract: Manual Intake Match

**Feature**: 010-manual-intake-match
**Date**: 2026-03-31 (updated 2026-03-31)

---

## Endpoint 1: User — Trigger Manual Match

**Route**: `POST /my/intakes/:id/compute-matches`
**Auth**: `JwtAuthGuard` (Bearer token, regular user)
**Ownership**: User must own the intake

### Request

```
POST /my/intakes/:id/compute-matches
Authorization: Bearer <user-jwt>
```

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `id`      | path     | uuid | yes      | Intake UUID |

No request body.

### Success Response — HTTP 200

```json
{
  "success": true,
  "data": {
    "message": "Matching has been queued"
  }
}
```

The response is returned immediately. Matching runs asynchronously in the `intakes-queue` via BullMQ.

### Error Responses

| HTTP | Condition |
|------|-----------|
| 401  | Missing or invalid JWT |
| 404  | Intake not found, or belongs to a different user |
| 422  | Intake is not published (`status !== 'published'`) |
| 422  | Intake has no `aiProcessedContent` — beautify must be run first |

**422 body — not published:**
```json
{
  "statusCode": 422,
  "message": "Intake <id> must be published before matching can be performed"
}
```

**422 body — no aiProcessedContent:**
```json
{
  "statusCode": 422,
  "message": "Intake <id> has no AI-processed content — please run /beautify first"
}
```

---

## Endpoint 2: Admin — Trigger Manual Match (any intake)

**Route**: `POST /admin/intakes/:id/compute-matches`
**Auth**: `AdminAuthGuard` (Bearer token, admin role)
**Ownership**: No ownership check

### Request

```
POST /admin/intakes/:id/compute-matches
Authorization: Bearer <admin-jwt>
```

### Success Response — HTTP 200

```json
{
  "success": true,
  "data": {
    "message": "Matching has been queued"
  }
}
```

### Error Responses

| HTTP | Condition |
|------|-----------|
| 401  | Missing or invalid admin JWT |
| 403  | Token valid but user is not admin |
| 404  | Intake not found |
| 422  | Intake is not published |
| 422  | Intake has no `aiProcessedContent` |

---

## Matching Behaviour (shared)

### Pre-conditions (validated synchronously before enqueuing)
1. Intake must exist
2. `status === 'published'`
3. `aiProcessedContent` must be non-null and non-empty — call `POST /:id/beautify` first if missing

### Async execution (in `intakes-queue`)
1. Build query text from `aiProcessTitle ?? title` + first 1500 chars of `aiProcessedContent`
2. Embed via BGE-M3
3. Hybrid kNN + BM25 search in Elasticsearch for opposite type in same sectors
4. Post-filter: keep only published candidates owned by a different user
5. Delete existing `intake_matches` rows for this intake, insert new rows
6. Log match count

### Notes
- If `aiProcessedContent` is absent when the job runs (e.g. from automatic pipeline), the job silently skips — no error thrown in the queue
- The `user_settings.matchingAuto` flag is ignored for manual triggers
- Future: notification module will hook into `IntakesProcessor` after step 6 to notify the intake owner
