# SPEC: Add Status Filter to Intakes List API & UI

## 1. Problem

- Backend API `GET /admin/intakes` chưa hỗ trợ filter theo `status`
- Frontend filter `status` đang là **client-side** (lọc sau khi nhận data về)
- Số count trên filter tabs (Tất cả / Nháp / Đã công bố) **không chính xác** — được tính từ page hiện tại (10 items), không phải tổng toàn bộ

## 2. Solution

### Backend API

**Endpoint:** `GET /api/v1/admin/intakes`

**Thêm query param:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `draft \| published \| all` (optional) | Filter theo trạng thái |

**Thêm response field:**

```typescript
interface IntakeListResponse {
  data: IntakeListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  totalByStatus: {
    draft: number
    published: number
  }
}
```

- `total` — tổng số items **đã filter** theo status (nếu có)
- `totalByStatus` — count theo từng status, dùng cho filter tabs

---

### Frontend

#### `intakeService.ts`
- Thêm `status?: IntakeStatus | 'all'` vào `IntakeListParams`
- Thêm `totalByStatus` vào `IntakeListResponse`

#### `useIntakesList.ts`
- Truyền `status` xuống API (thay vì filter client-side ở line 84-88)
- Sử dụng `totalByStatus` từ response thay vì tính client-side
- Trả thêm `totalByStatus` trong return type

#### `IntakesPage.tsx`
- Truyền `totalByStatus` ra `IntakesFilters`

#### `IntakesFilters.tsx`
- Nhận `totalByStatus` thay vì `totalCount`, `draftCount`, `publishedCount` riêng lẻ

## 3. Files to change

| File | Change |
|------|--------|
| `src/services/intakeService.ts` | Thêm `status` param + `totalByStatus` response |
| `src/features/intakes/hooks/useIntakesList.ts` | Pass `status` xuống API, use `totalByStatus` |
| `src/features/intakes/pages/IntakesPage.tsx` | Pass `totalByStatus` ra filters |
| `src/features/intakes/components/IntakesFilters.tsx` | Nhận `totalByStatus`, compute counts |
