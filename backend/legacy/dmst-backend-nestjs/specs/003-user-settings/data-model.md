# Data Model: Personalized User Settings

## New Entity: `UserSetting`

**Table**: `user_settings`

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| `id` | UUID | PK | `gen_random_uuid()` | |
| `user_id` | UUID | FK → users.id, UNIQUE, NOT NULL | — | One row per user |
| `matching_auto` | BOOLEAN | NOT NULL | `TRUE` | Auto-trigger matching pipeline |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()` | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()` | |

**Unique constraint**: `user_settings_user_id_key` on `user_id` — enforces exactly one
settings row per user.

**Relation**: `UserSetting` belongs to `User` (ManyToOne). `User` has one `UserSetting`
(OneToOne from the settings side).

---

## Entity Relationships

```
users (existing)
  └── user_settings (new, 1:1)
        └── user_id FK → users.id
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `matching_auto` | MUST be a boolean; no other types accepted |

---

## Modified Entity: `User` (optional back-reference)

No changes to `User` entity required. The relation is navigated from `UserSetting → User`.
If a back-reference is needed in future, a `@OneToOne` can be added to `user.entity.ts`
without a migration.

---

## Modified Service: `IntakesService`

**Touch point**: `applyChunkEmbedding()` (~line 117 of `intakes.service.ts`)

Before calling `void this.computeMatches(intakeId)`, the service MUST:
1. Load the intake's `userId`.
2. Fetch `UserSetting` for that user via `UserSettingsService.getSettings(userId)`.
3. Only call `computeMatches` if `matchingAuto === true` (or if `userId` is null,
   meaning it is a seed/admin intake — always match in that case).

---

## Migration

**File**: `src/database/migrations/<timestamp>-addUserSettings.ts`

```sql
-- up
CREATE TABLE "user_settings" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"       UUID        NOT NULL,
  "matching_auto" BOOLEAN     NOT NULL DEFAULT TRUE,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "PK_user_settings" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_user_settings_user_id" UNIQUE ("user_id"),
  CONSTRAINT "FK_user_settings_user" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE
);

-- down
DROP TABLE "user_settings";
```
