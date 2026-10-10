# ADR-0014: Phân Cấp Thẩm Định Hồ Sơ Chào Bán Công Nghệ Cho Sở KH&CN & Cơ Chế Hậu Kiểm Trung Ương

- **Trạng thái**: Đã chấp thuận (Accepted)
- **Ngày quyết định**: 2026-10-10
- **Phân hệ tác động**: `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC` & `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`
- **Người đề xuất**: PO/PM (`nacen-po-pm`) & TechLead SA (`nacen-techlead-sa`)

---

## 1. Bối Cảnh (Context)
Trong giai đoạn đầu phát triển (MVP), hệ thống `TASK-04` áp dụng cơ chế tự động duyệt (`Auto-approve` $\rightarrow$ `APPROVED`) ngay khi Doanh nghiệp hoàn thành form đăng tải chào bán công nghệ, đồng thời không gắn với cơ quan quản lý nhà nước nào.

Khi chuyển giao sang sản phẩm thương mại chính thức phục vụ Cổng ĐMST Quốc gia liên thông 63 tỉnh/thành:
1. **Rủi ro pháp lý & bảo hộ SHTT**: Doanh nghiệp có thể đăng tải giải pháp chưa được thẩm định, vi phạm bản quyền hoặc giả mạo số văn bằng SHTT.
2. **Quy chế quản lý nhà nước về KH&CN**: Cần cơ quan quản lý chuyên môn cấp cơ sở (Sở KH&CN địa phương theo địa bàn doanh nghiệp) thẩm định TRL và tính xác thực trước khi công bố niêm yết trên Sàn giao dịch công nghệ công khai.
3. **Cơ chế hậu kiểm**: Cơ quan quản lý Trung ương (Bộ KH&CN / Quản trị viên cấp cao) cần quyền thu hồi lập tức nếu phát hiện vi phạm.

---

## 2. Quyết Định Kiến Trúc (Decision)
1. **Bãi bỏ cơ chế Auto-Approve**:
   - Trạng thái khởi tạo của mọi hồ sơ chào bán mới chuyển từ `APPROVED` sang `PENDING`.
   - `PublishedAtUtc` chỉ được gán giá trị thời gian thực khi Lãnh đạo Sở KH&CN ký duyệt `APPROVE`.
2. **Bắt buộc liên kết Cơ Quan Quản Lý & Cam Kết Pháp Lý**:
   - Doanh nghiệp bắt buộc phải chọn 1 trong 63 Sở KH&CN tiếp nhận thẩm định (`managingAuthorityId`, `scopeType = "PROVINCE"`, `scopeId`).
   - Bắt buộc tích chọn cam kết pháp lý (`legalConsent = true`) chịu trách nhiệm về quyền sở hữu trí tuệ trước pháp luật.
3. **Tích hợp Cổng Tác Nghiệp Cấp 2 (`/gov`)**:
   - Hồ sơ ở trạng thái `PENDING` được tự động chuyển về hàng đợi kiểm duyệt phân cấp theo địa bàn của Lãnh đạo Sở KH&CN.
   - Cán bộ/Lãnh đạo Sở thực hiện thẩm định theo 3 trạng thái: `APPROVE`, `REJECT`, hoặc `REQUEST_CHANGES` (yêu cầu bổ sung có lý do $\ge$ 10 ký tự).
4. **Cơ chế Hậu Kiểm Trung Ương (`REVOKE`)**:
   - Quản trị viên Trung ương (`SUPER_ADMIN`, `OPERATOR_ADMIN`) có thẩm quyền thu hồi hồ sơ đã niêm yết bất kỳ lúc nào nếu phát hiện khiếu nại hoặc sai phạm (`BR-SELLER-06`).

---

## 3. Hệ Quả & Lợi Ích (Consequences)
- **Tích cực**:
  - Đảm bảo 100% tính pháp lý và chất lượng công nghệ được niêm yết trên sàn.
  - Phân định rõ ràng trách nhiệm quản lý nhà nước cấp cơ sở và thẩm quyền của 63 Sở KH&CN.
  - Tận dụng triệt để hạ tầng phân quyền 3D Scoped RBAC đã xây dựng ở `TASK-07`.
- **Thách thức**:
  - Thời gian niêm yết công nghệ phụ thuộc vào SLA thẩm định của Sở KH&CN địa phương (khuyến nghị tối đa 48h).
  - Cần quy trình thông báo (notification/email) realtime khi trạng thái hồ sơ thay đổi.
