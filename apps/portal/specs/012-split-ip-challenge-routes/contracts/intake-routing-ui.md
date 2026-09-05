# UI Contract: Split Namespace for IP and Challenge

**Feature**: `012-split-ip-challenge-routes`

## Purpose

Định nghĩa contract UI/routing khi loại bỏ hoàn toàn route nghiệp vụ `/intakes/*` và dùng 2 namespace độc lập.

## Route Contract

| Route | View | Contract |
|-------|------|----------|
| `/ips` | IP List | Chỉ hiển thị bản ghi type `ip` |
| `/ips/create` | IP Create | Form lock type `ip` |
| `/ips/:id` | IP Detail | Chỉ hợp lệ cho record type `ip` |
| `/ips/:id/edit` | IP Edit | Chỉ hợp lệ cho record type `ip` |
| `/challenges` | Challenge List | Chỉ hiển thị bản ghi type `challenge` |
| `/challenges/create` | Challenge Create | Form lock type `challenge` |
| `/challenges/:id` | Challenge Detail | Chỉ hợp lệ cho record type `challenge` |
| `/challenges/:id/edit` | Challenge Edit | Chỉ hợp lệ cho record type `challenge` |

## Removed Legacy Contract

Các route sau không được khai báo trong router:

- `/intakes`
- `/intakes/create`
- `/intakes/edit`
- `/intakes/detail`

## Navigation Contract

| Action | Source Namespace | Destination |
|--------|------------------|-------------|
| Create new | `/ips` | `/ips/create` |
| Open detail | `/ips` | `/ips/:id` |
| Edit item | `/ips` | `/ips/:id/edit` |
| Create new | `/challenges` | `/challenges/create` |
| Open detail | `/challenges` | `/challenges/:id` |
| Edit item | `/challenges` | `/challenges/:id/edit` |

## Form Submit/Back Contract

- Submit success ở IP flow -> `/ips`
- Submit success ở Challenge flow -> `/challenges`
- Back action theo namespace hiện tại, không qua `/intakes`

## Error/Fallback Contract

1. Nếu `:id` không hợp lệ -> áp dụng fallback route an toàn.
2. Nếu namespace không khớp `type` của record load được -> redirect hoặc thông báo lỗi theo policy.
3. Không có redirect từ route legacy `/intakes/*` vào flow cũ.
