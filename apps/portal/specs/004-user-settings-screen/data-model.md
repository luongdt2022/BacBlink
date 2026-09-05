# Data Model: User Settings Screen

**Branch**: `004-user-settings-screen` | **Date**: 2026-03-27

## Frontend Data Shapes

### UserSettings

Represents the settings object returned by `GET /my/settings` and echoed by `PATCH /my/settings`.

```typescript
interface UserSettings {
  matchingAuto: boolean;
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `matchingAuto` | `boolean` | `true` | Whether the system automatically runs matching jobs when the user creates a new intake |

### UpdateSettingsRequest

Payload sent to `PATCH /my/settings`.

```typescript
interface UpdateSettingsRequest {
  matchingAuto: boolean;
}
```

### Component State

`SettingsPage` local state shape:

| State var | Type | Initial | Description |
|-----------|------|---------|-------------|
| `settings` | `UserSettings \| null` | `null` | Loaded settings; null while loading |
| `isLoading` | `boolean` | `true` | True while initial GET is in-flight |
| `isSaving` | `boolean` | `false` | True while PATCH is in-flight |
| `error` | `string \| null` | `null` | Error message shown inline if GET fails |

## State Transitions

```
mount
  └─► isLoading=true
      └─► GET /my/settings
          ├─► success → settings=response, isLoading=false
          └─► failure → error=message, isLoading=false

toggle clicked (settings loaded)
  └─► optimistic: settings.matchingAuto flipped, isSaving=true
      └─► PATCH /my/settings { matchingAuto: newValue }
          ├─► success → isSaving=false, toast.success()
          └─► failure → settings.matchingAuto reverted, isSaving=false, toast.error()
```

## Backend Entities (reference only — no frontend changes required)

The backend stores settings in a `user_settings` table. This is documented in the backend spec (`003-user-settings`). The frontend consumes the API only; it does not manage backend schema.

| DB Column | Maps to | Notes |
|-----------|---------|-------|
| `matching_auto` | `matchingAuto` | camelCase in JSON response |

## Validation Rules

- `matchingAuto` is a required boolean. No other validation needed on the frontend (the toggle can only produce `true` or `false`).
- The toggle is disabled while `isSaving` is true to prevent duplicate concurrent requests.
