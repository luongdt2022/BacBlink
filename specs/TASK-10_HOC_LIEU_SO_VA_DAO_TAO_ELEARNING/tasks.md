# DANH SÁCH ĐẦU VIỆC KỸ THUẬT (TASKS BREAKDOWN)
## PHÂN HỆ: HỌC LIỆU SỐ & ĐÀO TẠO E-LEARNING (TASK-10)

> **Mã Epic**: `TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING`  
> **Tổng số tasks**: 23 tasks chia 4 Phases tuần tự (Thi công từng đợt để chống tràn ngữ cảnh).  
> **Căn cứ kế hoạch**: [`spec.md`](spec.md), [`plan.md`](plan.md).  

---

### PHASE 1: KERNEL, MEDIA STREAMING, DOMAIN MODEL & EF CORE MIGRATION (6 TASKS)

- [x] `T10-01` `[BE]`: Mở rộng Kernel & PolicyEngine cho `LEARNING_MATERIAL`.
  - Bổ sung `SubjectKind.LearningMaterial` vào `SourceCode/backend/packages/kernel/Domain/SubjectRef.cs`.
  - Khai báo 6 Actions (`LmsCreate`, `LmsReadManagement`, `LmsUpdate`, `LmsUnpublish`, `LmsDelete`, `LmsSubmitQuiz`) trong `SourceCode/backend/packages/policy-engine/Actions.cs`.
  - Cập nhật ma trận phân quyền trong `DecisionTable.cs`: `ADMIN` toàn quyền, `VERIFIED_EXPERT` chỉ sửa/gỡ/xóa bài do mình tạo (`Resource.OwnerPersonId == Actor.PersonId`).
  - *Kiểm chứng*: `dotnet build SourceCode/backend/NacenTech.sln` thành công 0 lỗi; xUnit test PolicyEngine pass.

- [x] `T10-02` `[BE]`: Nâng cấp Media Storage, HTTP Range 206 Streaming & Giới hạn Upload 1GB.
  - Cập nhật `GetFile` tại `MiscControllers.cs` trả về `Results.Stream(..., enableRangeProcessing: true)`.
  - Bổ sung MIME types cho `.mp4` (`video/mp4`), `.pptx`, `.docx`, `.pdf`.
  - Cấu hình `RequestSizeLimit(1_073_741_824)` (1GB) cho endpoint upload media LMS.
  - *Kiểm chứng*: Gửi curl request có header `Range: bytes=0-1023` trả về HTTP `206 Partial Content`.

- [x] `T10-03` `[BE]`: Khởi tạo Module `modules/lms` & Tầng Domain `LearningMaterial` Aggregate.
  - Tạo project `SourceCode/backend/modules/lms/NacenTech.Lms.csproj` và đăng ký vào `ModuleRegistry.cs`.
  - Cài đặt Aggregate `LearningMaterial` và các thực thể con (`LearningMaterialInstructor`, `LearningQuizQuestion`, `LearningAttachment`, `LearningDbLink`, `LearningModerationLog`, `LearnerProgress`, `LearnerQuizAttempt`).
  - Cưỡng chế các quy tắc nghiệp vụ `BR-EL-01`..`BR-EL-06` (validate Nháp vs Công khai, Quiz $\le 10$ câu, cờ cảnh báo độ dài phương án $> 2\times$, DB Links $\le 5$, chặn xóa bài `PUBLISHED`).
  - *Kiểm chứng*: `dotnet build` xanh; unit tests Domain khởi tạo thành công.

- [x] `T10-04` `[BE]`: Cấu hình EF Core Fluent API `LmsEntityConfiguration`.
  - Tạo `SourceCode/backend/modules/lms/Infrastructure/LmsEntityConfiguration.cs` cấu hình schema `lms`, độ dài cột, khóa ngoại cascade, `IsConcurrencyToken()` cho `version`, và 8 bảng CSDL.
  - Đăng ký các `DbSet<...>` vào `NacenTechDbContext.cs`.
  - *Kiểm chứng*: Chạy script `clean-arch-guard` kiểm tra 0 rò rỉ EF Core lên tầng Domain.

- [x] `T10-05` `[BE]`: Tạo và Áp dụng Non-Destructive EF Core Migration `AddLmsModuleSchema`.
  - Lập Fact-Sheet tại `.nacen/facts/FACT_TASK10_LMS_SCHEMA.md` theo chuẩn `fact-forcing-guard.py`.
  - Sinh migration `AddLmsModuleSchema` và chạy cập nhật CSDL PostgreSQL 16 thật.
  - *Kiểm chứng*: Kết nối PostgreSQL kiểm tra đủ 8 bảng trong schema `lms.*` và 12 indexes.

- [x] `T10-06` `[Test]`: Bộ Unit Tests (xUnit) cho Domain Invariants `BR-EL-*`.
  - Viết bộ test xUnit trong `SourceCode/backend/tests/NacenTech.Domain.Tests/` kiểm thử 100% quy tắc nghiệp vụ `BR-EL-01` $\rightarrow$ `BR-EL-06`.
  - *Kiểm chứng*: `dotnet test` đạt 100% PASS cho toàn bộ test cases LMS Domain.

---

### PHASE 2: APPLICATION SERVICES, REST APIS, RBAC & AI RAG INDEXING (6 TASKS)

- [x] `T10-07` `[BE]`: Xây dựng `LmsManagementService` (CRUD Quản trị `US-EL-01`, `02`, `04`, `05`, `06`).
  - Phân trang 10 bài/trang, sắp xếp Ngày cập nhật giảm dần, lọc kết hợp AND (`keyword`, `lessonType`, `status`).
  - Bắt xung đột cập nhật Optimistic Concurrency `version` (`409 Conflict`).
  - Gỡ bài kèm lý do $\le 250$ ký tự (`US-EL-05`) và Xóa mềm `is_deleted = true` (`US-EL-06`).
  - *Kiểm chứng*: Unit test Service pass các trường hợp thành công và ngoại lệ.

- [x] `T10-08` `[BE]`: Xây dựng `LmsMediaService` xử lý Upload Video & Tài liệu đính kèm.
  - Endpoint `POST /api/v1/lms/media/upload` hỗ trợ video `.mp4 <= 1GB` và tài liệu `.docx/.pdf/.pptx <= 50MB`.
  - Lưu vào `IObjectStorage` và trả về `storageKey`, `downloadUrl`, `fileSize`.
  - *Kiểm chứng*: Upload thử 1 file video và 1 file tài liệu, kiểm tra lưu storage thành công.

- [x] `T10-09` `[BE]`: Tích hợp AI RAG Vector Indexing (`LmsRagIndexer` — `HOME1 R51`).
  - Khi học liệu `PUBLISHED`, tự động băm chunks và sinh vector 1024d qua `IEmbeddingGeneratorPort` lưu vào `matching.search_chunks` (`subject_kind = 'LEARNING_MATERIAL'`).
  - Tự động xóa vector chunks khi học liệu bị gỡ bài (`US-EL-05`) hoặc xóa mềm (`US-EL-06`).
  - *Kiểm chứng*: Xuất bản bài học kiểm tra có bản ghi vector trong `matching.search_chunks`; gỡ bài kiểm tra bản ghi bị xóa sạch.

- [x] `T10-10` `[BE]`: Xây dựng `LmsCatalogService` (Cổng học tập công khai, KPIs & Chấm điểm Quiz).
  - API `GET /api/v1/lms/catalog`: Trả về danh sách bài `PUBLISHED` + 4 thẻ KPI động từ PostgreSQL.
  - API `GET /api/v1/lms/materials/{id}`: Trả về chi tiết 5 thành phần (ẩn đáp án đúng với người học thường).
  - API `POST /api/v1/lms/materials/{id}/quiz-attempts`: Chấm điểm Quiz và lưu `lms.learner_quiz_attempts`.
  - *Kiểm chứng*: Gọi API trả về đúng cấu trúc DTO và chấm điểm chính xác.

- [x] `T10-11` `[BE]`: Xây dựng `LmsController` (`/api/v1/lms/*`) & Tra cứu Chuyên gia.
  - Triển khai đầy đủ các endpoints RESTful và gán attribute Scoped RBAC.
  - Endpoint `GET /api/v1/lms/instructors/lookup?q=...` tra cứu chuyên gia từ `brokerage.expert_profiles`.
  - *Kiểm chứng*: Swagger UI hiển thị đủ các endpoints, test gọi HTTP thành công.

- [x] `T10-12` `[Test]`: Bộ Integration Tests & Scoped RBAC Fuzzing cho LMS Backend.
  - Viết test tích hợp trên CSDL PostgreSQL 16 thật.
  - Kiểm thử bảo mật chống IDOR: Chuyên gia B cố sửa/gỡ bài của Chuyên gia A bị từ chối `403`.
  - *Kiểm chứng*: 100% Integration Tests PASS trên DB PostgreSQL thật.

---

### PHASE 3: FRONTEND DUAL-SURFACE UI (NEXT.JS 15 APP ROUTER, `<ASYNC>`, FORM 4 TABS) (6 TASKS)

- [x] `T10-13` `[FE]`: Typed Client `src/lib/api/lms.ts` & Cập nhật Sidebar Navigation.
  - Khai báo DTOs, interfaces và hàm gọi API (có hỗ trợ progress bar tải video và hủy tải).
  - Bổ sung menu **"Đào tạo & Học liệu số"** vào Sidebar Chuyên gia (`/portal/layout.tsx`) và Admin (`/admin/layout.tsx`).
  - *Kiểm chứng*: `npm run build` hoặc `tsc --noEmit` 0 lỗi; Sidebar hiển thị đúng.

- [x] `T10-14` `[FE]`: Bề mặt 1 — Cổng Học Liệu Số Công Khai (`src/app/elearning/page.tsx`).
  - Thay thế trang tĩnh `[module]/page.tsx`.
  - Hero Banner + 4 KPI Strip động từ PostgreSQL + Nút Quản trị học liệu cho Admin/Chuyên gia.
  - Sơ đồ Lộ trình học tập 3 bước tương tác (`Loại A` $\rightarrow$ `Loại B` $\rightarrow$ `Loại B+`).
  - Bộ lọc kết hợp + Chuyển đổi Lưới Thẻ / Bảng Danh Sách + Huy hiệu **"✨ Đã nạp tri thức AI"**.
  - *Kiểm chứng*: Trang nạp dữ liệu động từ API, bọc qua `<Async>` đủ 5 UX states.

- [x] `T10-15` `[FE]`: Bề mặt 2 — Bàn Làm Việc Quản Trị Học Liệu (`US-EL-01`, `05`, `06`).
  - Xây dựng component `LmsManagementWorkspace` gắn tại `/portal/expert/elearning` và `/admin/elearning`.
  - Bảng 10 cột chuẩn `US-EL-01`, 10 bài/trang, bộ lọc `Loại bài` & `Trạng thái`, sắp xếp ngày cập nhật.
  - Modal Gỡ công khai (`US-EL-05`) bắt buộc nhập lý do ($\le 250$ ký tự) và Modal Xóa mềm (`US-EL-06`).
  - *Kiểm chứng*: Thao tác lọc, gỡ bài, xóa mềm hoạt động mượt mà trên UI.

- [x] `T10-16` `[FE]`: Form Biên Soạn Học Liệu 4 Tabs A–D (Phần 1: Khung 4 Tabs, Tab A, Auto-Thumbnail).
  - Xây dựng `LmsMaterialForm` dùng chung cho Tạo mới (`US-EL-02`) và Cập nhật (`US-EL-04`).
  - Khung 4 Tabs có Badge đỏ đếm số lỗi từng Tab, tự động nhảy tới Tab lỗi đầu tiên.
  - Tab A: Tiêu đề, Loại bài, Lĩnh vực TT17, Multi-select tối đa 10 chuyên gia, Thời lượng, Upload Video `.mp4` kèm tự động trích xuất thumbnail bằng HTML5 canvas.
  - Popup Cảnh báo chuyển về Nháp khi bài đang Công khai (`BR-EL-03`).
  - *Kiểm chứng*: Tải video `.mp4` lên tự sinh ảnh đại diện; lưu nháp chỉ cần Tiêu đề.

- [x] `T10-17` `[FE]`: Form Biên Soạn Học Liệu 4 Tabs A–D (Phần 2: Tab B Câu hỏi, Tab C Tài liệu, Tab D Liên kết CSDL).
  - Tab B: Quản lý câu hỏi trắc nghiệm (tối đa 10 câu, kéo thả sắp xếp, cảnh báo vàng khi độ dài phương án $> 2\times$).
  - Tab C: 3 bộ uploader tải tệp (Công cụ thực hành $\le 10\text{MB}$, Phiếu tóm tắt $\le 10\text{MB}$, Tài liệu khác $\le 25\text{MB}$).
  - Tab D: Thêm tối đa 5 liên kết CSDL NacenTech.
  - *Kiểm chứng*: Cảnh báo vàng hiển thị khi phương án trắc nghiệm chênh lệch độ dài; khóa nút thêm ở câu thứ 10 và liên kết thứ 5.

- [x] `T10-18` `[FE]`: Màn Hình Chi Tiết Học Liệu 5 Thành Phần (`/elearning/[id]/page.tsx` — `US-EL-03`).
  - Banner đỏ lý do gỡ bài (không thể đóng khi `Đã gỡ`).
  - Thẻ Chuyên gia giảng dạy kèm nút CTA **"Gửi yêu cầu tư vấn" (`HOME1 R50`)**.
  - 5 Tabs nội dung (`Tổng quan`, `Video bài học` HTML5 Player HD, `Câu hỏi tự kiểm tra` Chế độ kép Rà soát/Làm bài, `Tài liệu` tải về thật, `Liên kết CSDL` mở tab mới).
  - *Kiểm chứng*: Phát video streaming mượt mà; chế độ rà soát đáp án và làm bài trắc nghiệm hoạt động chuẩn xác; đạt Visual QA $\ge 8.5/10$.

---

### PHASE 4: SEEDING DỮ LIỆU THẬT & KIỂM THỬ 4 TẦNG ZERO-MOCK (5 TASKS)

- [x] `T10-19` `[BE]`: Seeding Dữ Liệu Học Liệu Số Thật & Media Thật (`LmsDataSeeder`).
  - Tạo tối thiểu 6 học liệu mẫu thực tế trải đều Loại A, B, B+ và đủ 3 trạng thái (`Công khai`, `Nháp`, `Đã gỡ`).
  - Sinh tệp video `.mp4` thật và tài liệu `.pdf/.docx` thật vào thư mục storage để phát và tải về thành công.
  - Tự động chạy lập chỉ mục Vector RAG vào `matching.search_chunks`.
  - *Kiểm chứng*: Truy cập trang web thấy ngay 6 bài học mẫu, phát được video thật, tải được file thật.

- [x] `T10-20` `[Test]`: Bộ Kiểm Thử Đơn Vị Frontend (Vitest).
  - Viết test Vitest cho form 4 Tabs, cảnh báo độ dài phương án trắc nghiệm, và chế độ kép của Quiz.
  - *Kiểm chứng*: `npm run test` (Vitest `lms-components.test.tsx`) 11/11 tests PASS 100%.

- [x] `T10-21` `[Test]`: Playwright E2E Test — Luồng Quản Trị Học Liệu (`US-EL-01` $\rightarrow$ `US-EL-06`).
  - Kịch bản E2E trên trình duyệt sống: Đăng nhập `VERIFIED_EXPERT`/`ADMIN` $\rightarrow$ Xem bảng quản trị 10 cột $\rightarrow$ Đăng bài mới 4 Tabs $\rightarrow$ Xuất bản $\rightarrow$ Xem chi tiết chế độ rà soát $\rightarrow$ Gỡ bài nhập lý do $\rightarrow$ Xóa mềm.
  - Đối soát trạng thái trong CSDL PostgreSQL thật.
  - *Kiểm chứng*: Playwright test suite Quản trị PASS 100% trên Chromium sống.

- [x] `T10-22` `[Test]`: Playwright E2E Test — Luồng Học Viên, Video Streaming, Quiz Tương Tác & Tư Vấn (`R50`/`R51`).
  - Kịch bản E2E: Học viên truy cập `/elearning` $\rightarrow$ Xem KPI & Lộ trình 3 bước $\rightarrow$ Mở bài học $\rightarrow$ Phát video streaming $\rightarrow$ Làm bài Quiz tự kiểm tra & xem kết quả $\rightarrow$ Bấm nút "Gửi yêu cầu tư vấn" (`R50`).
  - *Kiểm chứng*: Playwright test suite Học viên 7/7 kịch bản PASS 100%.

- [x] `T10-23` `[Test]`: Kiểm Toán Toàn Diện Chốt Chặn (`guard-rails.sh`, `clean-arch-guard`, `traceability-auditor`).
  - Chạy toàn bộ các công cụ kiểm toán tĩnh và ma trận truy vết khép kín `REQ-* ↔ BR-* ↔ DB-* ↔ API-* ↔ UI-* ↔ Test`.
  - *Kiểm chứng*: 0 vi phạm kiến trúc, 0 lỗi biên dịch, TypeScript `tsc --noEmit` 0 lỗi, Spec Linter PASS 100%, sẵn sàng ký duyệt Gate 4 & Gate 5.
