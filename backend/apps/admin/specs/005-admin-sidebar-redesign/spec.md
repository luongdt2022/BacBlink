# Feature Specification: Admin Sidebar Redesign

**Feature Branch**: `005-admin-sidebar-redesign`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "Cải thiện giao diện sidebar admin cho đẹp hơn, đồng bộ với bộ nhận diện thương hiệu Nacentech"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Brand-Aligned Sidebar Header (Priority: P1)

Quản trị viên mở dashboard và nhìn thấy logo Nacentech chính thức cùng tagline thay vì text "Hệ thống ĐMST" và icon chữ cái "Đ" màu xanh dương.

**Why this priority**: Header sidebar là điểm nhìn đầu tiên — thiếu brand identity làm giảm tính chuyên nghiệp.

**Independent Test**: Mở dashboard, kiểm tra đầu sidebar hiển thị logo Nacentech và tagline "Nền tảng đổi mới sáng tạo".

**Acceptance Scenarios**:

1. **Given** admin vào dashboard, **When** nhìn vào đầu sidebar, **Then** thấy logo Nacentech và dòng "Nền tảng đổi mới sáng tạo".
2. **Given** header sidebar, **When** render, **Then** không còn icon "Đ" hay text cứng "Hệ thống ĐMST".

---

### User Story 2 - Brand Color Navigation (Priority: P1)

Các mục điều hướng dùng màu Deep Teal (brand primary) cho active state thay vì màu xanh dương hiện tại.

**Why this priority**: Màu xanh dương hiện tại sai brand Nacentech — đây là sai lệch nhận diện thương hiệu cốt lõi.

**Independent Test**: Click vào từng mục menu, xác nhận active state dùng màu teal, shadow cũng màu teal.

**Acceptance Scenarios**:

1. **Given** nav item active, **When** render, **Then** nền là Deep Teal (--primary), không phải xanh dương.
2. **Given** nav item hover, **When** di chuột, **Then** hiệu ứng dùng teal nhạt.
3. **Given** active item có shadow, **When** render, **Then** shadow màu teal.

---

### User Story 3 - Simplified User Section (Priority: P2)

Phần user info và logout cuối sidebar được đơn giản hóa — không có card lồng trong card.

**Why this priority**: Card-in-sidebar hiện tại tạo double-border rối mắt, không đồng bộ phong cách tối giản.

**Independent Test**: Nhìn cuối sidebar, xác nhận không có double-border, user info và logout hiển thị gọn.

**Acceptance Scenarios**:

1. **Given** admin đăng nhập, **When** nhìn cuối sidebar, **Then** thấy tên, role, nút logout không có card box lồng.
2. **Given** tên user dài, **When** render, **Then** tên truncate không vỡ layout.

---

### Edge Cases

- Tên user > 30 ký tự: truncate với ellipsis.
- Logo chưa load: không hiển thị broken image icon.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Header sidebar PHẢI thay thế icon "Đ" và text "Hệ thống ĐMST" bằng logo Nacentech chính thức.
- **FR-002**: Header sidebar PHẢI hiển thị tagline "Nền tảng đổi mới sáng tạo" bên dưới logo.
- **FR-003**: Active nav item PHẢI dùng màu Deep Teal (brand --primary), không phải xanh dương.
- **FR-004**: Shadow của active nav item PHẢI màu teal.
- **FR-005**: Hover nav item PHẢI dùng teal nhạt.
- **FR-006**: Phần user + logout PHẢI đơn giản hóa, không card-in-card.
- **FR-007**: Tên user dài PHẢI truncate, không vỡ layout.
- **FR-008**: Sidebar PHẢI nhất quán spacing, border-radius, font weight với sidebar dmst-user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Logo Nacentech hiển thị đúng 100% — không còn icon "Đ" hay text "Hệ thống ĐMST".
- **SC-002**: Không còn màu xanh dương (#0052CC) trong sidebar — 0 sai lệch brand color.
- **SC-003**: Phần bottom không double-border/card lồng nhau.
- **SC-004**: Sidebar admin và dmst-user nhìn đồng bộ phong cách khi đặt cạnh nhau.

## Assumptions

- Logo `NACENTECH_Main-Logo-G.png` đã có trong `public/logo/` của dmst-admin.
- Design token `--primary: #137f79` đã set trong `theme.css`.
- Sidebar không cần collapse/expand trong scope này — chỉ visual redesign.
- Danh sách menu items giữ nguyên, chỉ thay đổi styling.
- Chỉ desktop layout — mobile drawer ngoài scope.
