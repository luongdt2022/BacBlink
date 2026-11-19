# Feature Specification: Tách Hoàn Toàn Routes IP và Challenge

**Feature Branch**: `012-split-ip-challenge-routes`
**Created**: 2026-04-08
**Updated**: 2026-04-09
**Status**: Draft
**Input**: User clarification: "bỏ route intake, challenge và ip là 2 phần riêng biệt"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quản lý IP độc lập (Priority: P1)

Người dùng muốn thao tác IP trong không gian route riêng, không đi qua route intake cũ.

**Independent Test**: Truy cập `/ips`, tạo mới tại `/ips/create`, mở chi tiết `/ips/:id`, chỉnh sửa `/ips/:id/edit` và xác nhận flow hoàn chỉnh.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** truy cập `/ips`, **Then** hiển thị danh sách IP
2. **Given** người dùng ở `/ips`, **When** nhấn "Tạo IP mới", **Then** chuyển đến `/ips/create`
3. **Given** người dùng lưu form tại `/ips/create`, **When** lưu thành công, **Then** quay về `/ips`
4. **Given** người dùng mở một IP, **When** xem hoặc sửa, **Then** điều hướng qua `/ips/:id` và `/ips/:id/edit`

---

### User Story 2 - Quản lý Challenge độc lập (Priority: P1)

Người dùng muốn thao tác Challenge trong không gian route riêng, không đi qua route intake cũ.

**Independent Test**: Truy cập `/challenges`, tạo mới tại `/challenges/create`, mở chi tiết `/challenges/:id`, chỉnh sửa `/challenges/:id/edit` và xác nhận flow hoàn chỉnh.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** truy cập `/challenges`, **Then** hiển thị danh sách Challenge
2. **Given** người dùng ở `/challenges`, **When** nhấn "Tạo Challenge mới", **Then** chuyển đến `/challenges/create`
3. **Given** người dùng lưu form tại `/challenges/create`, **When** lưu thành công, **Then** quay về `/challenges`
4. **Given** người dùng mở một Challenge, **When** xem hoặc sửa, **Then** điều hướng qua `/challenges/:id` và `/challenges/:id/edit`

---

### User Story 3 - Loại bỏ hoàn toàn route intake cũ (Priority: P2)

Người dùng không còn truy cập được các route thao tác cũ dưới `/intakes/*`.

**Independent Test**: Truy cập `/intakes`, `/intakes/create`, `/intakes/edit?id=...`, `/intakes/detail?id=...` và xác nhận không còn vào flow nghiệp vụ cũ.

**Acceptance Scenarios**:

1. **Given** người dùng truy cập route cũ `/intakes/*`, **When** route được resolve, **Then** hệ thống không hiển thị UI thao tác intake cũ
2. **Given** ứng dụng có điều hướng nội bộ, **When** người dùng thao tác create/detail/edit, **Then** mọi link phải nằm trong namespace `/ips/*` hoặc `/challenges/*`

---

### Edge Cases

- Khi truy cập route namespace không khớp loại dữ liệu (ví dụ mở challenge bằng `/ips/:id`), hệ thống cần xử lý an toàn (redirect hoặc thông báo lỗi)
- Query-string legacy `?id=` không còn là contract chính cho detail/edit
- Deep link trực tiếp vào `/ips/:id`, `/ips/:id/edit`, `/challenges/:id`, `/challenges/:id/edit` phải hoạt động ổn định

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống phải cung cấp danh sách IP tại `/ips`
- **FR-002**: Hệ thống phải cung cấp danh sách Challenge tại `/challenges`
- **FR-003**: Hệ thống phải cung cấp route tạo IP `/ips/create` với type cố định `ip`
- **FR-004**: Hệ thống phải cung cấp route tạo Challenge `/challenges/create` với type cố định `challenge`
- **FR-005**: Hệ thống phải cung cấp route sửa IP `/ips/:id/edit`
- **FR-006**: Hệ thống phải cung cấp route sửa Challenge `/challenges/:id/edit`
- **FR-007**: Hệ thống phải cung cấp route chi tiết IP `/ips/:id`
- **FR-008**: Hệ thống phải cung cấp route chi tiết Challenge `/challenges/:id`
- **FR-009**: Hệ thống phải loại bỏ route thao tác cũ dưới `/intakes/*` khỏi router
- **FR-010**: Sau khi lưu thành công, IP flow quay về `/ips` và Challenge flow quay về `/challenges`

### Key Entities

- **Intake (IP)**: Hồ sơ sở hữu trí tuệ, có `type = 'ip'`
- **Intake (Challenge)**: Hồ sơ thử thách, có `type = 'challenge'`
- **Sector**: Lĩnh vực liên quan, dùng chung cho cả IP và Challenge

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng hoàn tất tạo mới IP qua `/ips/create` trong một flow liên tục
- **SC-002**: Người dùng hoàn tất tạo mới Challenge qua `/challenges/create` trong một flow liên tục
- **SC-003**: Tất cả link nội bộ create/detail/edit chỉ còn thuộc `/ips/*` và `/challenges/*`
- **SC-004**: Không có lỗi 404 trên các route mới `/ips/*` và `/challenges/*`
- **SC-005**: Không còn route thao tác nghiệp vụ dưới `/intakes/*`

## Assumptions

- Backend API không đổi, vẫn dùng entity intake với field `type`
- Chỉ thay đổi frontend routing/navigation và tái sử dụng component hiện có
- Cơ chế phân quyền hiện tại tiếp tục áp dụng cho cả 2 namespace
