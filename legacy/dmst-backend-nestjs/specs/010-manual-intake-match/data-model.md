# Data Model: Manual Intake Match API

**Feature**: 010-manual-intake-match
**Date**: 2026-03-31

## No Schema Changes Required

This feature introduces no new tables, columns, or migrations.
It reads and writes to the existing `intakes` and `intake_matches` tables.

---

## Entities Used (Read-Only Schema Reference)

### `intakes` (read)

| Field              | Type                         | Notes                              |
|--------------------|------------------------------|------------------------------------|
| `id`               | uuid PK                      |                                    |
| `user_id`          | uuid FK → users              | Owner of the intake                |
| `type`             | enum `ip` \| `challenge`     | Determines opposite-type search    |
| `status`           | enum `draft` \| `published`  | Must be `published` to match       |
| `title`            | varchar                      | Used in query text                 |
| `content`          | text                         | Used in query text                 |
| `ai_process_title` | varchar (nullable)           | Preferred over `title` in query    |
| `ai_processed_content` | text (nullable)          | Preferred over `content` in query  |

**Validation rule**: `status = 'published'` is required; otherwise the endpoint returns HTTP 422.

### `intake_matches` (write — delete + insert)

| Field                  | Type      | Notes                                   |
|------------------------|-----------|-----------------------------------------|
| `id`                   | uuid PK   | Auto-generated                          |
| `ip_intake_id`         | uuid FK   | References an IP-type intake            |
| `challenge_intake_id`  | uuid FK   | References a Challenge-type intake      |
| `score`                | float     | Hybrid ES score                         |
| `matched_chunk`        | text      | Best matching chunk text                |
| `chunk_index`          | int       | Position of the chunk                   |
| `computed_at`          | timestamp | Set on insert                           |

**Write pattern**: Delete all rows where `ip_intake_id = intakeId` (if IP type) or `challenge_intake_id = intakeId` (if Challenge type), then bulk insert new rows.

---

## Entity Relationships (unchanged)

```
intakes (1) ─── (many) intake_matches  [via ip_intake_id]
intakes (1) ─── (many) intake_matches  [via challenge_intake_id]
```

Each `intake_matches` row always links exactly one IP intake to one Challenge intake.
