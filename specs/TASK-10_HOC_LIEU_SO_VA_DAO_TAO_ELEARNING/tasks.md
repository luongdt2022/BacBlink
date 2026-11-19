# DANH SÁCH ĐẦU VIỆC KỸ THUẬT (TASKS BREAKDOWN)
## PHÂN HỆ: HỌC LIỆU SỐ & ĐÀO TẠO E-LEARNING (TASK-10)

> **Mã Epic**: `TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING`  
> **Version**: 1.2.0 | **Status**: In Implementation (CR-BACLINK-006)  
> **Tổng số tasks**: 36 tasks chia 6 Phases tuần tự (30/30 tasks giai đoạn 1-5 hoàn tất [x]; Phase 6 CR-BACLINK-006 đang triển khai).  
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

---

### PHASE 5: DELTA V1.1 — NÂNG CẤP KHÔNG GIAN HỌC TẬP TƯƠNG TÁC 8 THÀNH PHẦN & PIPELINE ETL 50 BÀI HỌC (CR-2026-028 & PO-DEC-20261110-02) (7 TASKS)

- [x] `T-10.24` `[PERSISTENCE]`: Fact-Sheet & Non-Destructive EF Core Migration Mở Rộng Schema `lms.*`.
  - Nộp Fact-Sheet Tier-1 tại `.nacen/facts/FACT-CR-2026-028-LMS-INTERACTIVE-DELTA.md` và `.facts/` theo chuẩn `fact-forcing-guard`.
  - Cấu hình Fluent API trong `LmsEntityConfiguration.cs`: 11 cột mới cho `lms.learning_materials` (tất cả Nullable hoặc có DEFAULT VALUE: `cluster_code`, `cluster_name`, `step_number`, `target_audience`, `preparation_notes`, `expected_outcome`, `pass_score_percent DEFAULT 80`, `learning_objectives_json`, `learning_roadmap_json`, `knowledge_summary_json`, `practice_workbook_json`).
  - Định nghĩa Fluent API cho 5 bảng con mới: `lms.learning_micro_videos`, `lms.learning_in_video_quizzes`, `lms.learning_practice_rubrics`, `lms.learning_faqs`, `lms.learner_practice_evaluations`.
  - Đăng ký các `DbSet<...>` vào `NacenTechDbContext.cs`.
  - Sinh migration `AddLmsInteractiveWorkbookAnd30CoursesDelta` và cập nhật CSDL PostgreSQL 16 thật.
  - *Kiểm chứng*: Kết nối PostgreSQL 16 (port 55440) kiểm tra đủ 13 bảng schema `lms.*` và 11 cột mới, 18 indexes hoạt động bình thường, không làm gián đoạn bảng hiện hữu.

- [x] `T-10.25` `[BE]`: Cập Nhật Domain Entity `LearningMaterial` & Khởi Tạo 5 Thực Thể Con Mới (`REQ-EL-009..011`, `BR-EL-07..09`).
  - Mở rộng Aggregate `LearningMaterial.cs` với 11 trường dữ liệu mới và các phương thức cập nhật nội dung tương tác.
  - Tạo mới 5 Domain Entities tại `SourceCode/backend/modules/lms/Domain/`: `LearningMicroVideo.cs`, `LearningInVideoQuiz.cs`, `LearningPracticeRubric.cs`, `LearningFaq.cs`, `LearnerPracticeEvaluation.cs`.
  - Cài đặt và cưỡng chế các Domain Invariants: Validate Cụm (`CLUSTER_A`..`CLUSTER_F`), Bước lộ trình ($1..7$), PassScorePercent ($50..100$, mặc định 80/60), Rubric điểm ($0, 1, 2$), giới hạn tối đa 3 micro-videos, 6 in-video quizzes, 7 rubrics, 8 FAQs cho mỗi bài học.
  - *Kiểm chứng*: `dotnet build SourceCode/backend/NacenTech.sln` thành công 0 lỗi; xUnit test Domain Invariants pass 100% (278/278 tests GREEN).

- [x] `T-10.26` `[BE]`: Mở Rộng DTOs, Application Services & REST APIs Phục Vụ 8 Thành Phần Tương Tác (`REQ-EL-009..011`, `BR-EL-07..09`, `PO-DEC-20261110-02`).
  - Mở rộng `LmsDtos.cs`: Bổ sung `MicroVideoDto`, `InVideoQuizDto`, `PracticeRubricDto`, `FaqDto`, `PracticeEvaluationResultDto`, `SubmitPracticeEvaluationRequest`; mở rộng `LmsMaterialFilterRequest` (`ClusterCode`, `StepNumber`) và `LearningMaterialDetailDto`.
  - Nâng cấp `LmsCatalogService.cs`:
    * Hỗ trợ lọc đồng thời theo `clusterCode` và `stepNumber` tại `GetCatalogAsync`.
    * Trả về đầy đủ dữ liệu 8 thành phần tại `GetCatalogDetailAsync` (ẩn đáp án đúng in-video quiz với người học chưa trả lời).
    * Phương thức `SubmitPracticeEvaluationAsync` theo `BR-EL-08`: Tính điểm 7 tiêu chí thang 0–1–2 ($S = \sum p_i$, $0 \le S \le 14$). Khi $S \ge 11 \rightarrow$ mở khóa 2 nút CTA phản biện Chuyên gia (`R50`) và tạo hồ sơ nhu cầu (`TASK-03`); lưu bản ghi vào `lms.learner_practice_evaluations`.
    * Cập nhật `SubmitQuizAttemptAsync` theo `BR-EL-09` & `Draft 1.docx`: Đạt tỷ lệ $\ge 60\%$ (hoặc `pass_score_percent` của bài) ghi nhận `is_completed = true` và tăng `completion_count`.
  - Cập nhật `LmsController.cs`: Khai báo endpoint `POST /api/v1/lms/catalog/{id}/practice-evaluations` có kiểm tra Scoped RBAC `LmsSubmitPractice`.
  - *Kiểm chứng*: Swagger UI hiển thị endpoint mới; LMS Integration Test kiểm chứng đúng logic ngưỡng 11/14 điểm và ghi nhận hoàn thành trên PostgreSQL container thật.

- [x] `T-10.27` `[ETL]`: Xây Dựng Pipeline ETL Nạp 50 Khóa Học Học Thuật & 100 Tài Liệu Đính Kèm Chuẩn BA (`REQ-EL-012`, `BR-EL-09`, `PO-DEC-20261110-02`).
  - Tuân thủ chỉ đạo PO: KHÔNG tự render/tạo video .mp4 bằng script (video bài giảng thực tế do Chuyên gia trực tiếp upload qua Bàn làm việc quản trị `/portal/expert/elearning` & `/admin/elearning`).
  - Tạo kịch bản `scripts/etl_lms_30_courses.py` (và `scripts/import_elearning_courses.py`):
    * Bóc tách toàn diện 30 file Excel trong `Specification/01_DATA_RAW/New temp/*.xlsx` đủ 8 sheets (Tổng quan, Call sheet 3 micro-videos, Câu hỏi tương tác Q1-Q6, Tóm tắt kiến thức, Bài tập tự luyện 10 trắc nghiệm + 3 tự luận, Phiếu thực hành 3 phần A-B-C, Bảng tự chấm 7 tiêu chí, Hỏi đáp 8 FAQs).
    * Bóc tách 20 bài học Đồ họa (`ĐH`) từ `Draft 1.docx` (Bảng 4.4 và Phụ lục 1 với đầy đủ đề cương 5 ý chính, chuẩn hóa metadata Cụm A–F, Mô-đun M1–M8, Lộ trình LT1–LT5, Biểu mẫu BM01–BM13, Công cụ TĐG01–TĐG05, 4 vai trò chuyên gia).
    * Xuất bản 100 tệp tài liệu thực tế (.pdf Tóm tắt & .docx Phiếu thực hành) vào `SourceCode/backend/storage/lms/docs/` có mã băm SHA-256.
    * Nạp PostgreSQL thật và đồng bộ 50 vector search chunks 1024d vào `matching.search_chunks`.
  - *Kiểm chứng*: Chạy script ETL nạp thành công 50/50 bài học (`EL-001` -> `EL-050`); kiểm tra CSDL có 50 bài học, 150 micro-videos, 226 in-video quizzes, 500 câu trắc nghiệm, 350 rubrics, 400 FAQs, 100 tài liệu đính kèm, 50 vector chunks.

- [x] `T-10.28` `[FE]`: Nâng Cấp Cổng Học Liệu Số Công Khai (`/elearning`) Bộ Lọc Đa Chiều 6 Cụm, 8 Mô-Đun & 5 Lộ Trình (`REQ-EL-009`, `PO-DEC-20261110-02`).
  - Cập nhật `src/lib/api/lms.ts`: Bổ sung các trường DTOs mới và filter params `clusterCode` (`A`..`F`), `moduleCode` (`M1`..`M8`), `roadmapCode` (`LT1`..`LT5`), `deliveryFormat` (`CG`/`ĐH`), `functionGroup` (`ORIENTATION`/`SPOTLIGHT`/`SKILLS`), `levelCode` (`CB`/`TC`/`NC`).
  - Cải tạo trang `src/app/elearning/page.tsx`:
    * Thêm thanh Tab Bar lọc theo 5 Lộ trình học (`LT1`: Nền tảng, `LT2`: Doanh nghiệp bên cầu, `LT3`: Cán bộ hỗ trợ/Sở KH&CN, `LT4`: Viện/Trường bên cung, `LT5`: Chuyên đề tự chọn).
    * Thêm bộ lọc Dropdown theo 8 Mô-đun năng lực (`M1`–`M8`), 6 Cụm chuyên đề (`A`–`F`), Hình thức (`Chuyên gia CG` vs `Đồ họa ĐH`) và 3 Nhóm chức năng video (`Định hướng công nghệ`, `Technology Spotlight`, `Kỹ năng nghiệp vụ`).
    * Hiển thị danh mục 50 bài học thực chiến (`EL-001`..`EL-050`) với thẻ Card chuẩn hóa hiển thị nhãn Cụm, Mô-đun, Hình thức, Cấp độ, Chuyên gia phụ trách, Huy hiệu **"✨ Đã nạp tri thức AI"** và thời lượng.
    * Bọc qua component `<Async>` đảm bảo đủ 5 UX states (Loading skeleton, Empty state có nút xóa bộ lọc, Error retry, Success, Updating).
  - *Kiểm chứng*: Thao tác lọc đa chiều tức thời trên UI, responsive mượt mà trên 3 viewports.

- [x] `T-10.29` `[FE]`: Xây Dựng Không Gian Học Tập Tương Tác 8 Thành Phần, Thực Hành 13 Biểu Mẫu, Tự Đánh Giá & Chứng Nhận Số (`/elearning/[id]` — `REQ-EL-010`, `REQ-EL-011`, `BR-EL-07`, `BR-EL-08`, `BR-EL-09`).
  - Tái cấu trúc trang `/elearning/[id]/page.tsx` thành Không Gian Học Tập Tương Tác:
    * Component `MicroVideoPlaylistPlayer`: Phát Playlist 3 Micro-Videos HTTP 206 kèm CALL SHEET phân cảnh (cho bài CG) hoặc trình phát video chuyên đề (cho bài ĐH).
    * Component `InVideoQuizModal`: Tự động dừng video khi chạm mốc `triggerSeconds` (`BR-EL-07`), khóa tua; trả lời sai hiện giải thích và chọn lại, trả lời đúng mới mở khóa phát tiếp.
    * Component `InteractivePracticeWorkbook`: Form thực hành trực tuyến hỗ trợ 13 Biểu mẫu (`BM01`–`BM13`) và 3 câu tự luận tình huống kèm nút xem "Gợi ý đối chiếu của Chuyên gia".
    * Component `SelfAssessmentRadar`: Tích hợp 5 Công cụ Tự đánh giá (`TĐG01`–`TĐG05`) với Radar Chart 5 trục SVG canvas thuần gợi ý lộ trình học phù hợp.
    * Component `PracticeRubricSelfScoring`: Bảng tự chấm điểm 7 tiêu chí định lượng (thang 0–1–2). Khi tổng điểm $S \ge 11/14$, tự động mở khóa 2 nút CTA: *"Gửi Chuyên gia phản biện"* (`R50` sang `TASK-05`) và *"Tạo Hồ sơ Nhu cầu Công nghệ"* (pre-fill sang `TASK-03`).
    * Component `CertificateClaimModal`: Modal nhận Chứng nhận hoàn thành số NACENTECH khi hoàn thành 100% bài học của lộ trình `LT1`..`LT5` (`LmsReceiveCertificate`), có mã định danh duy nhất và QR xác thực trực tuyến.
    * Component `KnowledgeSummaryTab`: Bảng tóm tắt kiến thức cốt lõi (Core Takeaways).
    * Component `FaqAccordionTab`: Khung 8 câu hỏi đáp thực tế có tìm kiếm nhanh.
    * Tab `Trắc nghiệm cuối bài`: Chế độ làm bài trắc nghiệm kèm thông báo đạt chuẩn khi $\ge 60\%$ theo `BR-EL-09` mới (tối thiểu 6/10 câu đúng, tối đa 3 lần làm lại).
  - *Kiểm chứng*: Kiểm thử tương tác sống trên trình duyệt: video dừng đúng mốc giây, pop-up quiz khóa đúng chuẩn, tự chấm điểm $\ge 11$ mở khóa CTA, nộp quiz $\ge 60\%$ ghi nhận hoàn thành, modal cấp Chứng nhận số hoạt động chính xác. Đạt Ruthless Visual QA $\ge 8.5/10$.

- [x] `T-10.30` `[TEST]`: Bộ Kiểm Thử 4 Tầng Toàn Diện & Kiểm Toán Zero-Mock Đạt Chuẩn Gate 4 & 5 (`REQ-EL-009..012`, `BR-EL-07..09`).
  - **Tầng 1 (Unit Invariants Test - xUnit/Vitest)**: Kiểm thử 100% quy tắc nghiệp vụ `BR-EL-07` (khóa video và pop-up quiz), `BR-EL-08` (ngưỡng 11/14 điểm mở khóa CTA kép), `BR-EL-09` (ngưỡng 60% hoàn thành trắc nghiệm cuối bài, tối đa 3 lần làm lại), cấp Chứng nhận số NACENTECH theo Lộ trình `LT1`..`LT5` (`LmsReceiveCertificate`).
  - **Tầng 2 (Contract & Schema Test)**: Kiểm tra tương thích DTOs giữa Backend .NET API và TypeScript Client, đối soát JSON schema cho 50 bài học, 8 Mô-đun, 5 Lộ trình, 13 Biểu mẫu và 5 Công cụ Tự đánh giá.
  - **Tầng 3 (DB Integration Test)**: Kiểm tra toàn vẹn dữ liệu 50 bài học (`EL-001`..`EL-050`) nạp vào PostgreSQL 16 thật, 100 tệp tài liệu trong `storage/lms/docs/` và 50 vector search chunks trong `matching.search_chunks`.
  - **Tầng 4 (Playwright E2E Visual QA Test)**: Chạy kịch bản E2E toàn trình trên Chromium sống: Lọc bài học theo Lộ trình `LT2` / Mô-đun `M1` $\rightarrow$ Mở bài $\rightarrow$ Xem video và giải câu hỏi Pop-up Quiz tại `triggerSeconds` $\rightarrow$ Làm bài thực hành BM / Tự đánh giá Radar $\rightarrow$ Tự chấm rubric $\ge 11/14$ điểm mở khóa CTA $\rightarrow$ Làm trắc nghiệm cuối bài đạt $\ge 60\%$ $\rightarrow$ Nhận Chứng nhận số NACENTECH $\rightarrow$ Đối soát CSDL thật ghi nhận `is_completed = true`.
  - Chạy các công cụ kiểm toán tĩnh: `guard-rails.sh`, `clean-arch-guard`, `spec-linter.py`, `traceability-auditor`.
  - *Kiểm chứng*: 100% Tests Green (0 failure), không mock ngầm, sẵn sàng ký duyệt Gate 4 & Gate 5.

---

## Phase 6: BACLINK Refactor Delta (CR-BACLINK-006)

- [x] `T-10.BL.01` `[DB]` Bổ sung seed idempotent 6 khóa học mẫu công nghiệp BACLINK (Lean Manufacturing & 5S, ISO 9001 & IATF 16949, MES/ERP, Chuyển đổi xanh & ESG) vào `lms.learning_materials` trong `SourceCode/backend/scripts/seed_baclink_demo_data.sql` (`REQ-10-BL-01`, `BR-10-BL-02`).
  - *Kiểm chứng*: Chạy `psql` nạp vào PostgreSQL thật 2 lần không lỗi, truy vấn `GET /api/v1/lms/catalog` trả về đủ khóa học BACLINK từ DB thật.

- [x] `T-10.BL.02` `[BE]` Cập nhật `SourceCode/backend/config/policies/authorization-rules.v1.json` (`LMS_CREATE`, `OWNER_LMS_MANAGE`) và `SourceCode/backend/modules/lms/Api/LmsController.cs` (dòng 156–250) thực thi Q1 (`BR-10-BL-01`):
  - Kiểm tra `IsAdmin || HasApprovedExpertProfileAsync(personId, ct)` (`brokerage.expert_profiles.status = 'APPROVED'`) trước khi cho phép `LmsCreate`/`LmsReadManagement`/`LmsUpdate`/`LmsUnpublish`/`LmsDelete`, giữ kiểm tra chính chủ `CreatedBy == personId`; đổi nhãn `"Chuyên gia NacenTech"` (dòng 180, 198) sang `"Cố vấn Kỹ thuật BACLINK"`.
  - *Kiểm chứng*: `dotnet build SourceCode/backend/NacenTech.slnx` 0 lỗi; `PUBLIC_USER`/`ENTERPRISE` chưa duyệt cố vấn gọi `POST /api/v1/lms/materials` bị chặn `403 Forbidden`; cố vấn `APPROVED` tạo và sửa bài của mình `201/200 OK` (sửa bài người khác `403`).

- [x] `T-10.BL.03` `[FE]` Tái định vị cổng `/elearning` (`SourceCode/frontend/src/app/elearning/page.tsx`) và workspace quản lý (`/portal/expert/elearning/page.tsx`, `/admin/elearning/page.tsx`) sang **Đào tạo Hội viên BACLINK (LMS)** (`REQ-10-BL-01`, `BR-10-BL-01`, `BR-10-BL-02`):
  - Thay nhãn `QĐ 1993/QĐ-BKHCN` bằng khung đào tạo 4 chuyên đề công nghiệp BACLINK; bỏ kiểm tra cứng `ROLES.VERIFIED_EXPERT` (dòng 194) thay bằng `ADMIN` hoặc `ExpertProfile (APPROVED)`; bảo toàn `<Async>` 5 UX States Zero-Mock.
  - *Kiểm chứng*: `npx tsc --noEmit` 0 lỗi; `/elearning` hiển thị danh sách khóa học từ PostgreSQL thật.

- [x] `T-10.BL.04` `[FE]` Cập nhật trang học chi tiết & chứng nhận số (`SourceCode/frontend/src/app/elearning/[id]/page.tsx`) sang **Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)** (`REQ-10-BL-02`, `BR-10-BL-01`, `AC-10-BL-02`):
  - Đổi mẫu mã chứng nhận số (dòng 1062) sang `CERT-2026-{materialCode}-BACLINK` và tên đơn vị cấp chứng nhận sang Hiệp hội BACLINK; đồng bộ kiểm tra quyền sửa bài (dòng 261) không phụ thuộc `VERIFIED_EXPERT`; bảo toàn nguyên vẹn 8 thành phần học tập tương tác, HTTP 206 streaming, In-Video Quiz và Rubric 11/14.
  - *Kiểm chứng*: `npx tsc --noEmit` 0 lỗi; hoàn thành bài học hiển thị chứng nhận số BACLINK.

- [x] `T-10.BL.05` `[TEST]` Kiểm thử 4 tầng cho `TASK-10` (`AC-10-BL-01`..`AC-10-BL-03`):
  - xUnit (`LmsBackendIntegrationTests.cs`, `LmsDomainInvariantsTests.cs`) xác minh phân quyền giảng viên theo `ExpertProfile (APPROVED)` vs non-expert (`403`) và IDOR `CreatedBy != personId` (`403`).
  - Vitest & Playwright E2E xác minh `/elearning` tải 6 khóa học công nghiệp thật từ DB, học/quiz $\ge 60\%$ nhận chứng nhận BACLINK.
  - *Kiểm chứng*: `dotnet test` & `npx vitest run` & Playwright E2E pass 100%, Zero-Mock.

