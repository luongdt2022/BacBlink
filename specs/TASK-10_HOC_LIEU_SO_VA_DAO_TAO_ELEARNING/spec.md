# ĐẶC TẢ YÊU CẦU KỸ THUẬT (SPECIFICATION)
## PHÂN HỆ: HỌC LIỆU SỐ & ĐÀO TẠO E-LEARNING (TASK-10)

> **Mã Epic**: `TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING`  
> **Phiên bản**: v1.0 (Living Spec)  
> **Ánh xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING/README.md`](../../Specification/02_BASIC_DESIGN/TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING/README.md)  
> **Nguồn căn cứ**:  
> - SRS v1.0: `Specification/01_DATA_RAW/NACENTECH_SRS_V1.0.docx` (Mục 2.3 `US-EL-01` $\rightarrow$ `US-EL-06`)  
> - Master Excel: `Tài liệu BA phần mềm Nacentwin 19.10.xlsx` (`HOME1` R48–R51)  
> - Quyết định kiến trúc PO: `PO-DEC-20261102-01` $\rightarrow$ `PO-DEC-20261102-06` (Phương án A Native Module)  

---

### MỤC 1: TỔNG QUAN HỆ THỐNG & RANH GIỚI NGHIỆP VỤ

1. **Mục tiêu**: Xây dựng kho học liệu số 5 thành phần chuẩn hóa và nền tảng đào tạo trực tuyến e-learning phục vụ chuyển giao tri thức đổi mới sáng tạo, kết nối chuyên gia tư vấn (`R50`) và đào tạo tri thức tự động cho Trợ lý ảo AI NacenTwin (`R51`).
2. **Kiến trúc Dual-Surface**:
   - **Bề mặt 1 (`/elearning` & `/elearning/[id]`)**: Cổng Học Liệu Số Công Khai & Không gian học tập tương tác (KPIs, Lộ trình 3 cấp `Loại A -> B -> B+`, bộ lọc, Video streaming HTTP 206, Quiz tương tác có chấm điểm).
   - **Bề mặt 2 (`/portal/expert/elearning` & `/admin/elearning`)**: Bàn làm việc Quản lý Học liệu số chuẩn 10 cột, Form 4 Tabs A–B–C–D, Modal Gỡ bài có lý do và Xóa mềm.

---

### MỤC 2: TÁC NHÂN & MA TRẬN PHÂN QUYỀN (3D SCOPED RBAC)

| Mã Quyền (Action) | Quyền Hạn Nghiệp Vụ | `ADMIN` (`GLOBAL`) | `VERIFIED_EXPERT` (`SELF` / `PUBLIC`) | `LEARNER` / `BUYER` / `SELLER` | Khách vãng lai (`ANONYMOUS`) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `LmsReadCatalog` | Xem danh mục học tập & chi tiết bài học `PUBLISHED` | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| `LmsReadManagement` | Xem bảng quản lý mọi trạng thái (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`) | ✅ Có | ✅ Có | ❌ Không | ❌ Không |
| `LmsCreate` | Đăng mới học liệu số (4 Tabs A–D) | ✅ Có | ✅ Có | ❌ Không | ❌ Không |
| `LmsUpdate` | Chỉnh sửa học liệu số (Khóa chính chủ `created_by`) | ✅ Mọi bài | ✅ Chỉ bài của mình | ❌ Không | ❌ Không |
| `LmsUnpublish` | Gỡ học liệu công khai kèm lý do $\le 250$ ký tự | ✅ Mọi bài | ✅ Chỉ bài của mình | ❌ Không | ❌ Không |
| `LmsDelete` | Xóa mềm học liệu (`is_deleted = true`) | ✅ Mọi bài | ✅ Chỉ bài của mình | ❌ Không | ❌ Không |
| `LmsSubmitQuiz` | Làm bài Quiz tự kiểm tra & ghi nhận điểm số | ✅ Có | ✅ Có | ✅ Có (Lưu DB) | Xem thử (Không lưu DB) |

---

### MỤC 3: YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

- **`REQ-EL-001` (Tra cứu & Lọc Danh mục Quản lý `US-EL-01`)**: Hệ thống cung cấp bảng danh sách 10 bản ghi/trang, sắp xếp Ngày cập nhật giảm dần, lọc kết hợp AND giữa Từ khóa (Tiêu đề, Chuyên gia), Dropdown Loại bài (`Loại A`, `Loại B`, `Loại B+`) và Trạng thái (`Nháp`, `Công khai`, `Đã gỡ`).
- **`REQ-EL-002` (Biên soạn Form 4 Tabs A–D `US-EL-02`, `US-EL-04`)**:
  - *Tab A*: Tiêu đề ($\le 250$), Loại bài (`Loại A / B / B+`), Chuyên gia giảng dạy (Multi-select tối đa 10 người), Thời lượng phút ($1..300$), Mô tả Rich Text ($\le 5000$), Tệp video `.mp4 <= 1GB` (có tiến trình tải, hủy/thay thế, tự trích xuất thumbnail).
  - *Tab B*: Câu hỏi tự kiểm tra trắc nghiệm 4 đáp án A/B/C/D (tối đa 10 câu, kéo thả sắp xếp, giải thích đáp án, cảnh báo vàng khi $\max > 2 \times \min$).
  - *Tab C*: Công cụ thực hành (`.docx`, `.pdf <= 10MB`, tối đa 10 tệp), Phiếu tóm tắt (`.pdf <= 10MB`, 1 tệp), Tài liệu khác (`.pdf`, `.docx`, `.pptx <= 25MB`, tối đa 10 tệp).
  - *Tab D*: Liên kết cơ sở dữ liệu NacenTech (tối đa 5 liên kết URL hợp lệ).
- **`REQ-EL-003` (Xem Chi tiết & Video Streaming HTTP 206 `US-EL-03`)**: Phát video `.mp4` trực tiếp từ storage hỗ trợ tua nhanh qua HTTP Range 206; hiển thị Banner đỏ lý do gỡ bài khi `Đã gỡ` (không cho đóng); nút `Bổ sung` nhảy vào Tab thiếu nội dung.
- **`REQ-EL-004` (Chế độ Kép Trắc nghiệm `US-EL-03`)**: Cung cấp Chế độ Rà soát đáp án (Admin/Chuyên gia tô xanh đáp án đúng) và Chế độ Làm bài tự kiểm tra tương tác (Học viên nộp bài chấm điểm).
- **`REQ-EL-005` (Gỡ bài có Lý do `US-EL-05`)**: Popup bắt buộc nhập Lý do gỡ bài ($\le 250$ ký tự), chuyển trạng thái sang `Đã gỡ`, ẩn khỏi Cổng học tập công khai, lưu vết Audit Log.
- **`REQ-EL-006` (Xóa mềm `US-EL-06`)**: Khóa xóa bài đang `Công khai`; chỉ cho phép xóa bài `Nháp`/`Đã gỡ`; đánh dấu `is_deleted = true`, ẩn khỏi giao diện nhưng bảo lưu trong CSDL.
- **`REQ-EL-007` (Kết nối Chuyên gia Tư vấn `HOME1 R50`)**: Thẻ Chuyên gia giảng dạy tại trang chi tiết tích hợp nút CTA "Gửi yêu cầu tư vấn" dẫn trực tiếp luồng tư vấn của `TASK-05`.
- **`REQ-EL-008` (Đào tạo Tri thức Cho Agent AI `HOME1 R51`)**: Khi bài học `Công khai`, tự động băm chunks và nhúng vector 1024 chiều vào `matching.search_chunks` (`subject_kind = 'LEARNING_MATERIAL'`); tự động xóa vector khi gỡ bài hoặc xóa mềm.

---

### MỤC 4: QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

- **`BR-EL-01` (Validate theo Trạng thái Lưu `US-EL-02`)**:
  - Lưu `Nháp`: Chỉ bắt buộc `Tiêu đề bài học` + kiểm tra hợp lệ định dạng/dung lượng file và URL.
  - Lưu `Công khai`: Bắt buộc toàn bộ trường Tab A (gồm cả video bài học); công bố ngay lập tức không qua phê duyệt.
- **`BR-EL-02` (Chống Xung đột Cập nhật Optimistic Concurrency `US-EL-04`)**: Sử dụng token `version`. Nếu bản ghi đã bị cập nhật bởi phiên khác, trả về `409 Conflict` và toast thông báo *"Học liệu đã được người khác cập nhật trước đó. Vui lòng tải lại trang."*
- **`BR-EL-03` (Cảnh báo Chuyển về Nháp `US-EL-04`)**: Khi bài học đang `Công khai` mà người dùng chuyển sang `Nháp` và bấm Lưu, bắt buộc hiển thị Popup xác nhận cảnh báo ngừng cung cấp cho học viên.
- **`BR-EL-04` (Cảnh báo Chênh lệch Phương án Trắc nghiệm `US-EL-02`)**: Khi thêm/sửa câu hỏi trắc nghiệm, nếu $\max(\text{length}) > 2 \times \min(\text{length})$ giữa 4 phương án A/B/C/D, hiển thị cảnh báo vàng *"Độ dài các phương án chênh lệch lớn, có thể gợi ý đáp án"* nhưng không chặn lưu.
- **`BR-EL-05` (Giới hạn Số lượng Cấu phần)**:
  - Tối đa 10 Chuyên gia giảng dạy / bài học.
  - Tối đa 10 Câu hỏi trắc nghiệm / bài học (vượt quá 10 câu thì disable nút Thêm).
  - Tối đa 5 Liên kết cơ sở dữ liệu / bài học.
  - Tối đa 10 tệp Công cụ thực hành, 1 tệp Phiếu tóm tắt, 10 tệp Tài liệu khác.
- **`BR-EL-06` (Bảo vệ Quyền Sở Hữu Chính Chủ)**: Chỉ `ADMIN` hoặc chính Chuyên gia tạo bài học (`created_by == Actor.PersonId`) mới có quyền Sửa, Gỡ bài hoặc Xóa học liệu.

---

### MỤC 5: YÊU CẦU DỮ LIỆU & GIAO DIỆN (DATA & UI/UX)

- **Chuẩn hóa 5 UX States**: 100% màn hình Cổng học tập và Bàn quản trị bọc qua component chuẩn `<Async>` (Loading skeleton, Empty state có nút xóa lọc, Error retry, Success, Updating).
- **Responsive 3 Viewports**: Mobile (375px), Tablet (768px), Desktop (1440px) không vỡ layout, table hỗ trợ cuộn ngang hoặc card view trên mobile.
- **Database Schema**: 8 bảng chuyên biệt thuộc schema `lms.*` và 1 bảng tích hợp `matching.search_chunks` (xem chi tiết tại `plan.md`).

---

### MỤC 6: YÊU CẦU PHI CHỨC NĂNG (NFR)

- **Hiệu năng Streaming**: Trình phát video tải qua HTTP Range 206 với TTFB $\le 200\text{ms}$, không nạp toàn bộ file vào RAM server.
- **Dung lượng & An toàn**: Hỗ trợ tệp video $\le 1\text{GB}$, tài liệu $\le 25\text{MB}$/tệp; băm SHA-256 kiểm tra toàn vẹn.
- **Bảo mật**: Chống lỗ hổng IDOR trên toàn bộ API; áp dụng chuẩn chính sách bản quyền mã nguồn mở D2-146 (MIT, Apache 2.0).

---

### MỤC 7: MA TRẬN TRUY VẾT KHÉP KÍN (TRACEABILITY MATRIX)

| Yêu cầu Chức năng | Quy tắc Nghiệp vụ | Bảng CSDL | Endpoint API | Màn hình UI | Kiểm thử (Tests) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-EL-001` (Tra cứu Quản lý) | `BR-EL-01`, `06` | `lms.learning_materials` | `GET /api/v1/lms/materials` | `/portal/expert/elearning`, `/admin/elearning` | `test_lms_management_list` |
| `REQ-EL-002` (Form 4 Tabs) | `BR-EL-01`, `04`, `05` | `lms.learning_*` (5 bảng) | `POST/PUT /api/v1/lms/materials` | Form Modal 4 Tabs A–D | `test_lms_form_validation` |
| `REQ-EL-003` (Xem & Streaming) | `BR-EL-01` | `lms.learning_materials` | `GET /files/{key}`, `GET /api/v1/lms/materials/{id}` | `/elearning/[id]` | `test_lms_video_streaming_206` |
| `REQ-EL-004` (Quiz Chế độ kép) | `BR-EL-04`, `05` | `lms.learning_quiz_questions`, `lms.learner_*` | `POST /api/v1/lms/materials/{id}/quiz-attempts` | Tab Quiz `/elearning/[id]` | `test_lms_dual_mode_quiz` |
| `REQ-EL-005` (Gỡ bài có lý do) | `BR-EL-06` | `lms.learning_moderation_logs` | `POST /api/v1/lms/materials/{id}/unpublish` | Modal Gỡ bài | `test_lms_unpublish_audit` |
| `REQ-EL-006` (Xóa mềm) | `BR-EL-06` | `lms.learning_materials` | `DELETE /api/v1/lms/materials/{id}` | Modal Xóa mềm | `test_lms_soft_delete` |
| `REQ-EL-007` (Tư vấn `R50`) | - | `brokerage.expert_profiles` | `GET /api/v1/lms/instructors/lookup` | Thẻ Giảng viên `/elearning/[id]` | `test_lms_expert_consult_cta` |
| `REQ-EL-008` (AI RAG `R51`) | - | `matching.search_chunks` | Auto Index on Publish | Huy hiệu AI RAG `/elearning` | `test_lms_rag_indexing` |
