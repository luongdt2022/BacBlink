# Data Model: User Password Change

## Entities

### User (existing entity — modified)

Represents the authenticated user account. One modification: add `previousPasswordHash`.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `string` (UUID) | Primary key | Existing |
| `email` | `string` | Unique, not null | Existing |
| `password` | `string` | Not null, bcrypt hash | Existing — current hashed password |
| `previousPasswordHash` | `string` \| `null` | Nullable | **New** — stores the hash of the previous password for history check (depth: 1). Reset to `null` on admin password reset. |
| `firstName` | `string` \| `null` | Nullable | Existing |
| `lastName` | `string` \| `null` | Nullable | Existing |
| `phone` | `string` \| `null` | Nullable | Existing |
| `organization` | `string` \| `null` | Nullable | Existing |
| `role` | `enum` | `'user'` \| `'admin'` | Existing |
| `isActive` | `boolean` | Default `true` | Existing |
| `createdAt` | `Date` | Auto-set | Existing |
| `updatedAt` | `Date` | Auto-updated | Existing |

### ChangePasswordDto (new DTO)

Request body for `POST /api/v1/auth/change-password`.

| Field | Type | Constraints | Validation |
|-------|------|-------------|------------|
| `currentPassword` | `string` | Required | `@IsString()`, `@IsNotEmpty()` |
| `newPassword` | `string` | Required | `@IsString()`, `@IsNotEmpty()`, `@Matches(regex, { message })` — complexity rule |
| `confirmPassword` | `string` | Required | `@IsString()`, `@IsNotEmpty()` |

### PasswordChangeResponse (response)

| Field | Type | Notes |
|-------|------|-------|
| `message` | `string` | Localized success message |

### ErrorResponse (standard error shape)

| Field | Type | Notes |
|-------|------|-------|
| `message` | `string` | Localized error message |
| `error` | `string` | HTTP error name (e.g., `"Unauthorized"`, `"Bad Request"`) |

## Validation Rules

| Rule | DTO/Service | Error |
|------|-------------|-------|
| `currentPassword` is correct | Service (`bcrypt.compare`) | `401 Unauthorized` — "Mật khẩu hiện tại không đúng" |
| `newPassword` complexity | DTO `@Matches` | `400 Bad Request` — "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt" |
| `newPassword` ≠ `currentPassword` | Service | `400 Bad Request` — "Mật khẩu mới không được trùng với mật khẩu hiện tại" |
| `newPassword` ≠ `previousPasswordHash` | Service (`bcrypt.compare`) | `400 Bad Request` — "Mật khẩu mới không được trùng với mật khẩu đã sử dụng gần nhất" |
| `confirmPassword` = `newPassword` | DTO `@ValidateIf` / custom validator | `400 Bad Request` — "Xác nhận mật khẩu không khớp" |
