# Data Model: Tách Hoàn Toàn Namespace IP/Challenge

## Domain Entity: Intake (không đổi schema)

Feature không thay đổi schema backend. Entity vẫn là `Intake` với trường `type`.

| Field | Type | Constraints | Routing Role |
|-------|------|-------------|--------------|
| id | `string` | required, UUID | Path param cho detail/edit |
| type | `'ip' \| 'challenge'` | required | Quyết định namespace (`/ips` hoặc `/challenges`) |
| title | `string` | required | Hiển thị list/detail |
| status | `'draft' \| 'published'` | required | Không đổi |

## UI Route Context Models

### 1. `ListRouteContext`

| Field | Type | Description |
|-------|------|-------------|
| namespace | `'ips' \| 'challenges'` | Route list gốc theo loại |
| typeFilter | `'ip' \| 'challenge'` | Filter cố định theo namespace |

### 2. `CreateRouteContext`

| Field | Type | Description |
|-------|------|-------------|
| namespace | `'ips' \| 'challenges'` | Namespace hiện tại |
| forcedType | `'ip' \| 'challenge'` | Type bị khóa theo route create |

### 3. `EditDetailRouteContext`

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Lấy từ URL param |
| namespace | `'ips' \| 'challenges'` | Namespace route hiện tại |
| expectedType | `'ip' \| 'challenge'` | Dùng để validate dữ liệu load |

## Route Matrix (target state)

| Route | Context | Expected Type |
|-------|---------|---------------|
| `/ips` | `ListRouteContext` | `ip` |
| `/ips/create` | `CreateRouteContext` | `ip` |
| `/ips/:id` | `EditDetailRouteContext` | `ip` |
| `/ips/:id/edit` | `EditDetailRouteContext` | `ip` |
| `/challenges` | `ListRouteContext` | `challenge` |
| `/challenges/create` | `CreateRouteContext` | `challenge` |
| `/challenges/:id` | `EditDetailRouteContext` | `challenge` |
| `/challenges/:id/edit` | `EditDetailRouteContext` | `challenge` |

## Removed Legacy Routes

- `/intakes`
- `/intakes/create`
- `/intakes/edit`
- `/intakes/detail`
