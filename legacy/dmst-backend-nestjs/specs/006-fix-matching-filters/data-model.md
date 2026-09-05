# Data Model: Matching Filter — Cross-User & Published Only

**Branch**: `006-fix-matching-filters` | **Date**: 2026-03-27

## No new entities or schema changes

This feature adds no new tables, columns, or migrations. All required data fields
already exist on the `intakes` table:

| Field | Type | Purpose in this feature |
|-------|------|--------------------------|
| `id` | UUID PK | Identifies each candidate intake |
| `user_id` | UUID nullable FK → users | Cross-user exclusion filter (null = seed/admin) |
| `status` | enum (`draft`, `published`) | Published-status filter |
| `type` | enum (`ip`, `challenge`) | Existing opposite-type filter (unchanged) |

## Existing entities used (read-only)

### Intake (`intakes` table)
Used in `computeMatches` to:
1. Fetch the source intake's `userId` (owner to exclude from candidates)
2. Post-filter ES candidate hits: `status = 'published' AND user_id != sourceUserId`

### IntakeMatch (`intake_matches` table)
No structural change. After the fix, rows in this table are guaranteed to satisfy:
- `ip_intake_id.user_id ≠ challenge_intake_id.user_id` (when both are non-null)
- Both referenced intakes had `status = 'published'` at compute time

## Validation query (post-deploy check)

```sql
-- Confirm no self-user matches exist (should return 0 rows)
SELECT COUNT(*) FROM intake_matches im
JOIN intakes ip_i ON ip_i.id = im.ip_intake_id
JOIN intakes ch_i ON ch_i.id = im.challenge_intake_id
WHERE ip_i.user_id IS NOT NULL
  AND ch_i.user_id IS NOT NULL
  AND ip_i.user_id = ch_i.user_id;

-- Confirm no draft intakes are referenced (should return 0 rows)
SELECT COUNT(*) FROM intake_matches im
JOIN intakes ip_i ON ip_i.id = im.ip_intake_id
JOIN intakes ch_i ON ch_i.id = im.challenge_intake_id
WHERE ip_i.status = 'draft' OR ch_i.status = 'draft';
```
