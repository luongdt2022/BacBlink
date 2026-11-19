# Data Model: Notification System

**Feature**: 011-notification-system
**Date**: 2026-04-01

## New Entities

### `Notification`

**Table**: `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique identifier |
| `user_id` | `uuid` | FK → `users.id` ON DELETE CASCADE, NOT NULL | Recipient user |
| `type` | `enum` | NOT NULL | Notification category (see Type Enum) |
| `payload` | `jsonb` | NOT NULL | Type-specific structured content |
| `is_read` | `boolean` | NOT NULL, default `false` | Read/unread status |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

**Indexes**:
- `(user_id, is_read)` — for unread count and filtered list queries
- `(user_id, created_at DESC)` — for paginated list sorted newest-first (composite covering index)

**Relationships**:
- `ManyToOne` → `User` (FK `user_id`); `onDelete: CASCADE` so notifications are removed when user is deleted

---

## Type Enum

```
NotificationType:
  MATCH_FOUND   — system found partner intakes via matching pipeline
```

Future types can be added to this enum without a schema migration. Each new type defines its own payload shape in application code.

---

## Payload Schemas (per type)

### `MATCH_FOUND`

```json
{
  "message": "string",          // Human-readable notification text, e.g.:
                                 // "System found 5 matching partner intakes for your intake \"IP Title\"."
  "navigationPath": "string",   // Frontend route, e.g. "/intakes/{intakeId}/matches"
  "intakeId": "uuid",           // The intake that triggered matching
  "intakeTitle": "string",      // Display title (aiProcessTitle if available, else title)
  "matchCount": "number"        // Number of matches found (always > 0)
}
```

---

## No Schema Changes to Existing Tables

No existing tables are modified. The only schema change is adding the `notifications` table via migration.

---

## Migration

One migration is required: create the `notifications` table with indexes and FK constraint.

Migration name: `CreateNotificationsTable`

```sql
-- Up
CREATE TYPE notification_type AS ENUM ('match_found');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  payload JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_is_read ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at DESC);

-- Down
DROP TABLE notifications;
DROP TYPE notification_type;
```

> Note: TypeORM generates the migration automatically from entity diff via `npm run migration:generate -- --name=CreateNotificationsTable`. The SQL above is for illustration.
