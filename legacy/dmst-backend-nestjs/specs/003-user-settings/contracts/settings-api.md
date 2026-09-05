# Contract: User Settings API

## GET /my/settings

**Description**: Retrieve the current authenticated user's settings. If the user has no
settings row yet, returns the system defaults.

**Auth**: `JwtAuthGuard` required (Bearer token)

**Request**: No body, no query params.

**Response 200**:
```json
{
  "matchingAuto": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `matchingAuto` | boolean | Whether the AI matching pipeline runs automatically after intake submission |

---

## PATCH /my/settings

**Description**: Update one or more of the current user's settings. Only provided fields
are updated (partial update). Returns the full settings object after update.

**Auth**: `JwtAuthGuard` required (Bearer token)

**Request body**:
```json
{
  "matchingAuto": false
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `matchingAuto` | boolean | optional | Must be `true` or `false` |

**Response 200** — full settings object after save:
```json
{
  "matchingAuto": false
}
```

**Response 400** — invalid field type:
```json
{
  "message": ["matchingAuto must be a boolean value"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Behaviour Notes

- `GET` is idempotent; it creates a default settings row on first call if none exists.
- `PATCH` with an empty body `{}` is a no-op and returns current settings unchanged.
- Unknown fields in the PATCH body are silently ignored (whitelist validation).
- No DELETE endpoint — settings always exist (at least with defaults) once a user is active.
