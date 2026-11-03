# Change Request: CR-2026-022 Lưu Trữ Tệp CV Gốc Vào Storage & Cung Cấp Chu Kỳ Tải Chứng Từ Xác Minh Chuyên Gia

**CR-ID**: CR-2026-022  
**Epic**: `TASK-05_HO_SO_CHUYEN_GIA_KHCN`  
**Status**: APPLIED (Quality Gate 5 Approved)  
**Target Version**: 1.20.0  
**Author**: Product Owner & Lead BA (`nacen-basic-design`, `speckit-delta`)  
**Date**: 2026-11-02  
**Baseline Commit / Hash**: Living Spec v1.19.0  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- Basic Design Delta `Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BD_DELTA_CR_022_RAW_CV_STORAGE_AND_DOCUMENT_LIFECYCLE.md`.
- Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân (PDPD).
- 12 Tệp lý lịch khoa học thực tế trong `Specification/01_DATA_RAW/LLKH CN` và `Specification/01_DATA_RAW/pdf`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

1. **Thất thoát tệp đính kèm vật lý gốc**:
   - *Hiện trạng cũ (As-Is)*: Sau khi trích xuất dữ liệu, hệ thống chỉ lưu các trường văn bản vào CSDL PostgreSQL mà không lưu tệp nhị phân `.doc` / `.pdf` vào kho `IObjectStorage`. Bảng `brokerage.expert_documents` có 0 bản ghi.
   - *Đề xuất mới (To-Be)*: Lưu toàn bộ tệp CV gốc vào `storage/experts/documents/` với mã băm SHA-256 và sinh bản ghi quan hệ `expert_documents` với `document_type = 'CURRICULUM_VITAE'`.

2. **Cán bộ Sở không có căn cứ đối soát hồ sơ gốc**:
   - *Hiện trạng cũ (As-Is)*: Khi Cán bộ Sở xem hàng đợi phê duyệt `/governance/approvals`, không có nút bấm tải tệp CV gốc để đối soát chữ ký, con dấu và tính xác thực của hồ sơ.
   - *Đề xuất mới (To-Be)*: Endpoint `GET /api/v1/admin/experts/{expertCode}/documents/{documentId}/download` cho phép Cán bộ Sở tải trực tiếp tệp gốc.

3. **Hồ sơ chuyên gia bị cảnh báo "Thiếu chứng từ xác minh"**:
   - *Hiện trạng cũ (As-Is)*: Trang chi tiết cá nhân hiển thị cảnh báo màu vàng do `activeDocumentTypes` rỗng.
   - *Đề xuất mới (To-Be)*: Khi có bản ghi `CURRICULUM_VITAE`, hệ thống tự động xóa cảnh báo thiếu chứng từ và nâng điểm hoàn thiện hồ sơ lên Hạng A.

---

### 2. Chi Tiết Thay Đổi Yêu Cầu Kỹ Thuật (Standardized Requirements)

#### [ADD] `REQ-EXP-DOC-001`: Lưu Trữ Vật Lý Tệp CV Gốc Vào IObjectStorage
- Hệ thống MUST lưu trữ các tệp CV gốc (.doc, .docx, .pdf) vào thư mục `storage/experts/documents/` thông qua giao diện `IObjectStorage`.
- Khóa lưu trữ (StorageKey) có định dạng: `experts/documents/{guid:N}{ext}`.
- Hệ thống MUST tính toán và ghi nhận mã băm toàn vẹn SHA-256 cùng dung lượng tệp thực tế (`size_bytes`).

#### [ADD] `REQ-EXP-DOC-002`: Quản Lý Bản Ghi Quan Hệ `brokerage.expert_documents`
- Mỗi tệp CV gốc nạp vào hệ thống MUST tạo 1 bản ghi trong bảng `brokerage.expert_documents` với:
  - `document_type`: `'CURRICULUM_VITAE'`.
  - `storage_key`: Khóa lưu trữ tương đối trong `IObjectStorage`.
  - `sha256`: Chuỗi hex 64 ký tự của file gốc.
  - `mime_type`: `'application/pdf'` hoặc `'application/msword'`.
  - `malware_scan_status`: `'CLEAN'`.
  - `is_active`: `true`.

#### [ADD] `REQ-EXP-DOC-003`: Cung Cấp API Tải File Stream Kèm Bảo Mật Scoped RBAC & PDPD
- Endpoint Chuyên gia: `GET /api/v1/experts/me/documents/{documentId}/download`.
  - Yêu cầu Bearer Token hợp lệ của chính chủ (`PersonId == ExpertProfile.PersonId`).
  - Trả về `FileStreamResult` với Content-Type chuẩn và Content-Disposition `attachment; filename="..."`.
- Endpoint Cán bộ Quản trị: `GET /api/v1/admin/experts/{expertCode}/documents/{documentId}/download`.
  - Yêu cầu quyền `SUPER_ADMIN` hoặc `PROVINCIAL_ADMIN` / `PROVINCE_OFFICER` cùng phạm vi địa bàn với hồ sơ chuyên gia.

#### [ADD] `BR-EXP-DOC-001`: Quy Tắc Chống Rò Rỉ Tài Liệu & Chặn Tấn Công IDOR
- Khách vãng lai (`ANONYMOUS`) TUYỆT ĐỐI KHÔNG được phép tải tệp CV gốc (trả về HTTP 401).
- Chuyên gia này không thể tải tệp CV của chuyên gia khác qua endpoint `/me` (trả về HTTP 404).
- Cán bộ tỉnh A cố tình tải tài liệu của chuyên gia tỉnh B mà không có quyền MUST bị chặn với HTTP 403 Forbidden.

#### [ADD] `BR-EXP-DOC-002`: Tự Động Thỏa Mãn Tiêu Chí "Chứng Từ Xác Minh" (Completeness)
- Khi hồ sơ chuyên gia có ít nhất 1 bản ghi `expert_documents` loại `CURRICULUM_VITAE` đang active:
  - Trường `activeDocumentTypes` trong `ExpertPrivateDetailDto` chứa `["CURRICULUM_VITAE"]`.
  - Điểm hoàn thiện hồ sơ (`CompletenessScore`) tăng thêm trọng số chứng từ (+15 điểm), đạt $\ge 90$ điểm (Hạng Xuất Sắc).

---

### 3. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- **AC-CR-022.1**: Toàn bộ 12 tệp CV thực tế từ `Specification/01_DATA_RAW/` được lưu trữ an toàn trong `storage/experts/documents/`.
- **AC-CR-022.2**: Bảng `brokerage.expert_documents` có đúng 12 bản ghi tương ứng 12 chuyên gia, trạng thái `is_active = true`, `malware_scan_status = 'CLEAN'`.
- **AC-CR-022.3**: Checksum SHA-256 trong CSDL khớp 100% với file gốc vật lý.
- **AC-CR-022.4**: Gọi API tải tệp bằng token Chuyên gia trả về HTTP 200, tải trọn vẹn nội dung file.
- **AC-CR-022.5**: Gọi API tải tệp từ tài khoản lạ bị chặn 401/403/404, không rò rỉ dữ liệu.
- **AC-CR-022.6**: Giao diện cá nhân chuyên gia hiển thị liên kết tải tệp và không còn cảnh báo thiếu chứng từ.
