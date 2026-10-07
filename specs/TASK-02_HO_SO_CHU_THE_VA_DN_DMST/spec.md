# Đặc tả Yêu cầu (spec.md) - TASK-02: Hồ Sơ Chủ Thể & Doanh Nghiệp ĐMST

## 1. User Stories (Phân loại theo mức ưu tiên)

### P1 (Must have) - Định danh & Quản lý cơ bản
- **Là** một tổ chức/doanh nghiệp (DN, Viện, HTX), **Tôi muốn** đăng ký và khai báo thông tin định danh pháp lý cơ bản (Tên, MST, Địa chỉ) **Để** thiết lập "Căn cước số" tham gia mạng lưới Nacentwin.
  - *Why this priority:* Nền tảng mọi tính năng khác, định danh duy nhất (SSOT).
  - *Independent Test:* Nhập MST/Quyết định thành lập -> Validate không trùng lặp -> Lưu thành công.
  - *Acceptance Scenarios:* Given người dùng chưa có tài khoản, When nhập đúng MST hợp lệ và email, Then hệ thống tạo hồ sơ và gửi link xác thực.

### P2 (Should have) - Đặc thù ĐMST và Năng lực KH&CN
- **Là** một DN ĐMST hoặc Viện/Trường, **Tôi muốn** kê khai chi tiết các dự án R&D, chứng nhận SHTT và phòng thí nghiệm **Để** chứng minh năng lực công nghệ với đối tác.
  - *Why this priority:* Điểm nhấn của TASK-02 so với danh bạ DN thường.
  - *Independent Test:* Thêm mới dự án R&D -> Lưu thành công. Thêm mới tài sản phòng lab -> Lưu thành công.
  - *Acceptance Scenarios:* Given hồ sơ đã tồn tại, When chủ thể vào tab "ĐMST", Then có thể thêm nhiều record dự án R&D.

## 2. Functional Requirements (Yêu cầu chức năng)

- **REQ-02-001**: Hệ thống cho phép phân loại 5 loại chủ thể: Doanh nghiệp, DN ĐMST, HTX, Viện/Trường, Hộ Kinh doanh.
- **REQ-02-002**: Quản lý thông tin định danh (Tên, MST/Mã số, Ngày thành lập).
- **REQ-02-003**: Cán bộ quản lý có thể xem lịch sử cập nhật (Audit Log) của hồ sơ.
- **REQ-02-004**: Quản lý thông tin người đại diện và thiết lập quyền ẩn/hiện thông tin liên hệ.
- **REQ-02-005**: Khai báo nhóm Năng lực KH&CN: Nguồn lực ĐMST, kinh phí, dự án, SHTT.

## 3. Business Rules (Quy tắc nghiệp vụ)

- **BR-02-001 [Định danh duy nhất]**: Mã số thuế (đối với DN) hoặc Mã quyết định thành lập (đối với Viện/Trường) phải là duy nhất trên toàn hệ thống.
- **BR-02-002 [Quyền riêng tư]**: Mặc định doanh thu và kinh phí ĐMST chỉ được xem bởi chủ thể và cán bộ quản lý cấp phép. Kết nối cung-cầu thành công cũng không tự mở thông tin này.
- **BR-02-003 [Nhập liệu bắt buộc]**: Khi gửi xác minh hồ sơ (Verified Badge), bắt buộc phải có thông tin Ngành hoạt động chính và Sản phẩm/dịch vụ chính.
- **BR-02-004 [Lưu vết]**: Bất kỳ thay đổi nào lên hồ sơ gốc phải được ghi lại Before/After vào `system_audit_logs`.

## 4. Các quyết định kỹ thuật / Làm rõ (Clarifications & Key Technical Decisions)
- Sử dụng mô hình DB chia 3 schema (`enterprise`, `demand`, `assessment`) như đã chốt trong ADR-0013.
- Áp dụng cấu trúc `system_audit_logs` thay vì Full Revisioning.
- Các bảng mở rộng `enterprise_intellectual_properties`, `enterprise_innovation_projects` giải quyết nhu cầu nhập đa dự án/bằng sáng chế.
