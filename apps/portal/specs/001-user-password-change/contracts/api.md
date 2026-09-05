# API Contract: Password Change

## Endpoint

```
POST /api/v1/auth/change-password
```

### Authentication

Requires `Authorization: Bearer <access_token>` header (same as all existing auth-guarded endpoints).

### Request

**Content-Type:** `application/json`

```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | User's current password (plaintext) |
| `newPassword` | string | Yes | New password (plaintext) |
| `confirmPassword` | string | Yes | Must match `newPassword` exactly |

### Responses

#### 200 OK — Password changed successfully

```json
{
  "message": "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
}
```

#### 400 Bad Request — Validation error

Triggered by: password mismatch, complexity failure, new password equals current, new password equals previous.

```json
{
  "message": "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
  "error": "Bad Request"
}
```

**Or (passwords don't match):**
```json
{
  "message": "Xác nhận mật khẩu không khớp",
  "error": "Bad Request"
}
```

**Or (new password same as current):**
```json
{
  "message": "Mật khẩu mới không được trùng với mật khẩu hiện tại",
  "error": "Bad Request"
}
```

**Or (new password was recently used):**
```json
{
  "message": "Mật khẩu mới không được trùng với mật khẩu đã sử dụng gần nhất",
  "error": "Bad Request"
}
```

#### 401 Unauthorized — Wrong current password

```json
{
  "message": "Mật khẩu hiện tại không đúng",
  "error": "Unauthorized"
}
```

#### 401 Unauthorized — No/invalid token

```json
{
  "message": "Unauthorized"
}
```

## Usage Example

```bash
curl -X POST http://localhost:3001/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass456!",
    "confirmPassword": "NewPass456!"
  }'
```

## Flow

1. Client sends `POST /api/v1/auth/change-password` with current + new password
2. Backend verifies JWT token → returns `401` if invalid
3. Backend verifies `currentPassword` matches stored hash → returns `401` if wrong
4. Backend validates `newPassword` complexity → returns `400` if invalid
5. Backend checks `newPassword` ≠ `currentPassword` → returns `400` if same
6. Backend checks `newPassword` ≠ `previousPasswordHash` → returns `400` if match
7. Backend updates: `previousPasswordHash = currentPasswordHash`, `currentPasswordHash = newHash`
8. Backend returns `200`
9. Frontend clears `dmst_access_token` cookie, redirects to `/login`, shows success toast
