# Research: Personalized User Settings

## 1. Storage Model: Single Row vs Key-Value Table

**Decision**: One row per user in a dedicated `user_settings` table (columnar model),
not a key-value pair table.

**Rationale**:
- The set of settings is small, known upfront, and typed (`matching_auto` is boolean).
- A columnar model is type-safe: no runtime string-to-boolean coercion, no need to
  validate key names at query time, no JSON/JSONB parsing.
- TypeORM entity maps directly: `matchingAuto: boolean` — simple to read and write.
- Adding a new setting = new nullable column + migration (follows constitution IV).
- A key-value table introduces a `setting_key` enum/string and a `value text` column
  requiring runtime type coercion — unnecessary complexity for this scale.

**Alternatives considered**:
- **JSONB column on `users`** — simpler migration but mixes concerns; querying/indexing
  individual settings harder; rejected per constitution V (simplicity without the
  entanglement of user profile data).
- **Key-value table** — flexible but over-engineered for ≤10 known settings; adds runtime
  validation overhead (rejected per constitution V).

---

## 2. Module Placement: New Module vs Extend UsersModule

**Decision**: Add `UserSetting` entity and `UserSettingsService` to the existing
`UsersModule`. No new module created.

**Rationale**:
- Settings are a sub-domain of users — they have no meaning outside the user context.
- Creating a new `UserSettingsModule` for a single entity and service violates
  Constitution V (Simplicity) — unnecessary module boundary for tightly coupled data.
- `UsersModule` already exports `UsersService`; adding `UserSettingsService` follows
  the same pattern.

**New files within the users module**:
- `src/users/user-setting.entity.ts`
- `src/users/services/user-settings.service.ts`
- `src/users/controllers/user-settings.controller.ts`

---

## 3. Default Value Strategy

**Decision**: Use a database-level default (`DEFAULT TRUE`) on the `matching_auto` column,
plus a "get-or-create" pattern in `UserSettingsService.getSettings()`.

**Rationale**:
- Existing users have no row in `user_settings` yet. Rather than a backfill migration,
  the service creates a default row on first access (upsert pattern).
- New registrations can optionally auto-create a settings row, but it is not required —
  lazy creation keeps the registration flow unchanged.
- The database default ensures correct values even if a row is created without explicitly
  setting `matching_auto`.

---

## 4. Controlling Auto-Matching in the AI Pipeline

**Decision**: Check `matchingAuto` inside `IntakesService.applyChunkEmbedding()`, before
calling `computeMatches(intakeId)`.

**Rationale**:
- `computeMatches` is the only step in the pipeline that produces `intake_matches` — it
  is the precise step to gate.
- The intake entity has `userId`, so `applyChunkEmbedding` can load the user setting via
  `UserSettingsService.getSettings(userId)` before deciding whether to call `computeMatches`.
- `IntakesService` importing `UserSettingsService` is a valid cross-module dependency per
  Constitution I (cross-module access through the owning service, not the repository).
- `IntakesModule` must import `UsersModule` (or export `UserSettingsService` explicitly).

**Code touch point** (`intakes.service.ts` ~line 117):
```
// Before: void this.computeMatches(intakeId)
// After:
const intake = await this.intakeRepository.findOne(...)
if (intake.userId) {
  const settings = await this.userSettingsService.getSettings(intake.userId)
  if (settings.matchingAuto) void this.computeMatches(intakeId)
} else {
  void this.computeMatches(intakeId)  // no user = always match (admin/seed intakes)
}
```

---

## 5. API Route Design

**Decision**: `GET /my/settings` and `PATCH /my/settings` under `JwtAuthGuard`.

**Rationale**: Follows the existing `/my/*` convention used by `user-intakes.controller.ts`.
Returns and accepts a flat settings object `{ matchingAuto: boolean }`. `PATCH` is partial
by design — only provided fields are updated.

**Response shape** (GET and PATCH both return):
```json
{ "matchingAuto": true }
```
