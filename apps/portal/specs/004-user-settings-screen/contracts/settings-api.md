# API Contract: User Settings

**Feature**: `004-user-settings-screen`
**Base URL**: `{VITE_API_BASE_URL}/api/v1`
**Authentication**: Bearer JWT token required on all endpoints

---

## GET /my/settings

Retrieve the authenticated user's settings. Creates a default record if none exists.

### Request

```
GET /api/v1/my/settings
Authorization: Bearer <token>
```

### Response — 200 OK

```json
{
  "matchingAuto": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `matchingAuto` | `boolean` | Whether automatic matching is enabled for the user |

### Error Responses

| Status | When |
|--------|------|
| 401 | Token missing or invalid |

---

## PATCH /my/settings

Update the authenticated user's settings. Only provided fields are updated.

### Request

```
PATCH /api/v1/my/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "matchingAuto": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `matchingAuto` | `boolean` | No | New value for the auto-matching preference |

### Response — 200 OK

Returns the full updated settings object:

```json
{
  "matchingAuto": false
}
```

### Error Responses

| Status | When |
|--------|------|
| 400 | Invalid payload (e.g., non-boolean value) |
| 401 | Token missing or invalid |

---

## Frontend API Client (src/features/settings/api/settings.ts)

```typescript
// getMySettings(): Promise<UserSettings>
// updateMySettings(payload: UpdateSettingsRequest): Promise<UserSettings>
```

Both functions use `getAuthHeaders()` from `src/services/api/client.ts` and call the above endpoints. `updateMySettings` throws on non-ok responses so the caller can revert optimistic UI state.
