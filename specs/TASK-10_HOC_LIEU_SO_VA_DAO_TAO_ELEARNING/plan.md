# KẾ HOẠCH KIẾN TRÚC KỸ THUẬT (TECHNICAL PLAN)
## PHÂN HỆ: HỌC LIỆU SỐ & ĐÀO TẠO E-LEARNING (TASK-10)

> **Mã Epic**: `TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING`  
> **Phiên bản**: v1.1 (Completed — Gate 4 & Gate 5 Verified)  
> **Trạng thái**: Shipped 2026-11-10 (CR-2026-028 Completed)  
> **Kiến trúc áp dụng**: Clean Architecture .NET 10 LTS Modular Monolith + Next.js 15 App Router + PostgreSQL 16 + pgvector RAG  
> **Tài liệu đặc tả**: [`spec.md`](spec.md)  

---

### 1. KIẾN TRÚC TỔNG THỂ & PHÂN TẦNG CLEAN ARCHITECTURE

Tạo module mới `SourceCode/backend/modules/lms` độc lập, cấu trúc các tầng theo chuẩn NacenTech:
```text
SourceCode/backend/modules/lms/
├── NacenTech.Lms.csproj
├── Domain/
│   ├── LearningMaterial.cs (AggregateRoot - Guid v7, Concurrency Token version)
│   ├── LearningMaterialInstructor.cs (Chuyên gia giảng dạy)
│   ├── LearningQuizQuestion.cs (Câu hỏi trắc nghiệm A/B/C/D)
│   ├── LearningAttachment.cs (Tài liệu đính kèm)
│   ├── LearningDbLink.cs (Liên kết CSDL)
│   ├── LearningModerationLog.cs (Lịch sử hậu kiểm/gỡ bài)
│   ├── LearnerProgress.cs (Tiến độ học viên)
│   └── LearnerQuizAttempt.cs (Lịch sử làm bài)
├── Application/
│   ├── LmsManagementService.cs (CRUD quản trị, phân trang 10 bài, lọc AND)
│   ├── LmsCatalogService.cs (Cổng học tập công khai, KPIs, chi tiết 5 thành phần, chấm điểm)
│   ├── LmsMediaService.cs (Upload video <= 1GB, tài liệu, thumbnail)
│   └── LmsRagIndexer.cs (Tự động chunking & sinh vector 1024d vào matching.search_chunks)
├── Infrastructure/
│   ├── LmsEntityConfiguration.cs (EF Core Fluent API, schema lms, indexes)
│   └── LearningMaterialSubjectProvider.cs (Tích hợp Hybrid Vector Search)
└── Api/
    └── LmsController.cs (REST endpoints /api/v1/lms/*)
```

---

### 2. THIẾT KẾ SCHEMA CSDL POSTGRESQL (`lms.*`)

8 Bảng chuyên biệt thuộc schema `lms` được ánh xạ qua `NacenTechDbContext`:

1. **`lms.learning_materials`**:
   - `id uuid PRIMARY KEY`, `material_code varchar(30) UNIQUE NOT NULL`.
   - `title varchar(250) NOT NULL`, `lesson_type varchar(20) NOT NULL` (`Loại A`, `Loại B`, `Loại B+`).
   - `sector_code varchar(30) NULL` (Tham chiếu logic `policy.taxonomy_terms.term_code` `LV01..LV17`).
   - `duration_minutes int NOT NULL CHECK (duration_minutes >= 1 AND duration_minutes <= 300)`.
   - `description_html text NOT NULL`.
   - `video_storage_key varchar(500) NULL`, `video_file_name varchar(255) NULL`, `video_file_size bigint NULL CHECK (video_file_size IS NULL OR video_file_size <= 1073741824)`.
   - `video_sha256 varchar(64) NULL`, `thumbnail_url varchar(500) NULL`.
   - `status varchar(20) NOT NULL DEFAULT 'DRAFT'` (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`).
   - `unpublish_reason varchar(250) NULL`, `unpublished_by uuid NULL`, `unpublished_by_name varchar(150) NULL`, `unpublished_at timestamptz NULL`.
   - `published_at timestamptz NULL`, `published_by uuid NULL`.
   - `created_by uuid NOT NULL`, `created_by_name varchar(150) NOT NULL`, `updated_by uuid NULL`, `updated_by_name varchar(150) NULL`.
   - `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()`.
   - `is_deleted boolean NOT NULL DEFAULT FALSE`, `deleted_by uuid NULL`, `deleted_at timestamptz NULL`.
   - `version int NOT NULL DEFAULT 1` (`IsConcurrencyToken()`).
   - `rag_indexed_at timestamptz NULL`, `rag_chunk_count int NOT NULL DEFAULT 0`.
2. **`lms.learning_material_instructors`**:
   - `id uuid PRIMARY KEY`, `material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE`.
   - `expert_profile_id uuid NOT NULL` (Tham chiếu logic `brokerage.expert_profiles.id`).
   - `full_name varchar(150) NOT NULL`, `title_degree varchar(150) NULL`, `org_name varchar(250) NULL`, `avatar_url varchar(500) NULL`.
   - `display_order int NOT NULL CHECK (display_order >= 1 AND display_order <= 10)`.
   - `UNIQUE(material_id, expert_profile_id)`.
3. **`lms.learning_quiz_questions`**:
   - `id uuid PRIMARY KEY`, `material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE`.
   - `display_order int NOT NULL CHECK (display_order >= 1 AND display_order <= 10)`.
   - `question_text varchar(500) NOT NULL`, `option_a varchar(200) NOT NULL`, `option_b varchar(200) NOT NULL`, `option_c varchar(200) NOT NULL`, `option_d varchar(200) NOT NULL`.
   - `correct_option char(1) NOT NULL CHECK (correct_option IN ('A','B','C','D'))`.
   - `explanation varchar(1000) NOT NULL`, `has_length_warning boolean NOT NULL DEFAULT FALSE`.
   - `UNIQUE(material_id, display_order)`.
4. **`lms.learning_attachments`**:
   - `id uuid PRIMARY KEY`, `material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE`.
   - `category varchar(30) NOT NULL CHECK (category IN ('PRACTICE_TOOL', 'SUMMARY_SHEET', 'POLICY_DOC'))`.
   - `file_name varchar(255) NOT NULL`, `storage_key varchar(500) NOT NULL`, `content_type varchar(100) NOT NULL`.
   - `file_size_bytes bigint NOT NULL`, `sha256_hash varchar(64) NULL`, `display_order int NOT NULL DEFAULT 1`, `uploaded_at timestamptz NOT NULL DEFAULT now()`.
5. **`lms.learning_db_links`**:
   - `id uuid PRIMARY KEY`, `material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE`.
   - `display_label varchar(100) NULL`, `description varchar(250) NULL`, `target_url varchar(500) NOT NULL`.
   - `target_entity_type varchar(50) NULL`, `display_order int NOT NULL CHECK (display_order >= 1 AND display_order <= 5)`.
6. **`lms.learning_moderation_logs`**:
   - `id uuid PRIMARY KEY`, `material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE`.
   - `action varchar(30) NOT NULL`, `reason varchar(250) NULL`, `actor_id uuid NOT NULL`, `actor_name varchar(150) NOT NULL`, `occurred_at timestamptz NOT NULL DEFAULT now()`.
7. **`lms.learner_progress`**:
   - `id uuid PRIMARY KEY`, `material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE`.
   - `person_id uuid NOT NULL`, `watched_seconds int NOT NULL DEFAULT 0`, `progress_percent int NOT NULL DEFAULT 0`.
   - `best_quiz_score int NOT NULL DEFAULT 0`, `quiz_attempts_count int NOT NULL DEFAULT 0`, `is_completed boolean NOT NULL DEFAULT FALSE`.
   - `last_accessed_at timestamptz NOT NULL DEFAULT now()`, `completed_at timestamptz NULL`.
   - `UNIQUE(material_id, person_id)`.
8. **`lms.learner_quiz_attempts`**:
   - `id uuid PRIMARY KEY`, `material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE`.
   - `person_id uuid NOT NULL`, `total_questions int NOT NULL`, `correct_answers int NOT NULL`, `score_percent int NOT NULL`.
   - `answers_json jsonb NOT NULL`, `submitted_at timestamptz NOT NULL DEFAULT now()`.

---

### 3. TÍCH HỢP HTTP 206 RANGE STREAMING & AI RAG VECTOR (1024D)

1. **HTTP 206 Partial Content Streaming**:
   - Tại `FileContentController` (`MiscControllers.cs`), cập nhật `GetFile`:
     ```csharp
     return Results.Stream(stream, contentType, fileName, enableRangeProcessing: true);
     ```
   - Trình duyệt HTML5 `<video>` tự động gửi header `Range: bytes=0-1024000` và tua mượt mà không tải toàn bộ file 1GB vào RAM.
2. **AI RAG Vector Indexing (`matching.search_chunks`)**:
   - Khi bài học chuyển sang `PUBLISHED`, `LmsRagIndexer` gọi `UpsertChunkAsync` đưa vào bảng `matching.search_chunks`:
     - `subject_kind = 'LEARNING_MATERIAL'`
     - `subject_id = material.Id`
     - `body = $"{material.Title} {material.DescriptionHtml} {quizQuestionsAndExplanations}"`
     - Sinh vector `BAAI/bge-m3` 1024 chiều vào cột `embedding`.
   - Khi gỡ bài hoặc xóa mềm: Tự động xóa sạch chunks tương ứng để Trợ lý ảo AI không trả về dữ liệu đã gỡ.

---

### 4. DANH MỤC RESTFUL API CONTRACTS (`/api/v1/lms`)

| Phương thức | Đường dẫn API | Chức năng & Xử lý Nghiệp vụ | Mã HTTP Trả về |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/lms/catalog` | Cổng học viên: Danh mục bài `PUBLISHED` + KPI strip + Bộ lọc | `200 OK` |
| `GET` | `/api/v1/lms/materials` | Bàn quản trị: Danh mục 10 bài/trang mọi trạng thái (`US-EL-01`) | `200 OK`, `401`, `403` |
| `GET` | `/api/v1/lms/materials/{id}` | Chi tiết học liệu 5 thành phần (Chế độ xem hoặc rà soát `US-EL-03`) | `200 OK`, `404` |
| `POST` | `/api/v1/lms/materials` | Tạo mới học liệu 4 Tabs A–D (`US-EL-02`, validate Nháp vs Công khai) | `201 Created`, `400` |
| `PUT` | `/api/v1/lms/materials/{id}` | Cập nhật học liệu (`US-EL-04`, kiểm tra `version` chống ghi đè) | `200 OK`, `400`, `409` |
| `POST` | `/api/v1/lms/materials/{id}/unpublish` | Gỡ công khai kèm lý do $\le 250$ ký tự (`US-EL-05`) | `200 OK`, `400`, `403` |
| `DELETE` | `/api/v1/lms/materials/{id}` | Xóa mềm `is_deleted = true` (`US-EL-06`, chặn xóa bài đang công khai) | `200 OK`, `400`, `403` |
| `POST` | `/api/v1/lms/media/upload` | Upload video `.mp4 <= 1GB` và các tệp đính kèm | `200 OK`, `400`, `413` |
| `POST` | `/api/v1/lms/materials/{id}/quiz-attempts` | Chấm điểm bài làm trắc nghiệm của học viên | `200 OK`, `400` |
| `GET` | `/api/v1/lms/instructors/lookup` | Tìm kiếm chuyên gia đã duyệt từ `brokerage.expert_profiles` | `200 OK` |

---

### MỤC 5: PLAN DELTA V1.1 — THIẾT KẾ KHÔNG GIAN HỌC TẬP TƯƠNG TÁC 8 THÀNH PHẦN, KHUNG 50 BÀI HỌC, 8 MÔ-ĐUN / 5 LỘ TRÌNH & PIPELINE ETL (CR-2026-028)

#### 5.1. THIẾT KẾ NON-DESTRUCTIVE DATABASE SCHEMA DELTA (SCHEMA `lms.*`)

Nhằm hiện thực hóa Khung chương trình đào tạo số cấp quốc gia (QĐ 1993/QĐ-BKHCN, Báo cáo chuyên đề `Draft 1.docx`), hỗ trợ 50 bài học (`EL-001`..`EL-050`), 8 Mô-đun năng lực, 5 Lộ trình học và bảo tồn 100% dữ liệu đang chạy, CSDL PostgreSQL 16 mở rộng theo hướng phi phá hủy:

##### 1. Mở rộng bảng `lms.learning_materials` (17 cột Nullable / Default Value):
- `cluster_code varchar(20) NULL`: Mã Cụm chuyên đề (`CLUSTER_A`..`CLUSTER_F`: Cụm A 10 bài, Cụm B 10 bài, Cụm C 10 bài, Cụm D 6 bài, Cụm E 10 bài, Cụm F 4 bài).
- `cluster_name varchar(250) NULL`: Tên hiển thị Cụm chuyên đề.
- `step_number int NULL CHECK (step_number IS NULL OR (step_number >= 1 AND step_number <= 7))`: Bước trong Lộ trình 7 bước.
- `module_code varchar(20) NULL`: Mã Mô-đun năng lực (`M1`..`M8` theo Khung 8 Mô-đun, 31 giờ học).
- `delivery_format varchar(20) NULL`: Hình thức triển khai (`CG`: Chuyên gia đứng giảng 30 bài, `ĐH`: Video đồ họa/chuyên đề 20 bài).
- `function_group varchar(50) NULL`: Nhóm chức năng video (`ORIENTATION`: Định hướng công nghệ 15 bài, `SPOTLIGHT`: Technology Spotlight 10 bài, `SKILLS`: Kỹ năng nghiệp vụ 25 bài).
- `level_code varchar(20) NULL`: Cấp độ bài học (`CB`: Cơ bản, `TC`: Tiêu chuẩn, `NC`: Nâng cao).
- `target_audience text NULL`: Đối tượng người học mục tiêu.
- `preparation_notes text NULL`: Ghi chú chuẩn bị trước khi học.
- `expected_outcome text NULL`: Kết quả đầu ra kỳ vọng đáp ứng Chuẩn đầu ra (`CĐR1`..`CĐR10`).
- `pass_score_percent int NOT NULL DEFAULT 60`: Ngưỡng điểm đạt trắc nghiệm cuối bài (chuẩn $\ge 60\%$ theo `BR-EL-09` mới).
- `learning_objectives_json jsonb NULL`: Danh sách mục tiêu học tập chi tiết (mảng chuỗi JSON).
- `learning_roadmap_json jsonb NULL`: Lộ trình học phân đoạn dạng JSON (LT1..LT5).
- `knowledge_summary_json jsonb NULL`: Cấu trúc tóm tắt kiến thức cốt lõi (Core Takeaways, bảng đối soát thực hành).
- `practice_workbook_json jsonb NULL`: Đề bài thực hành trực tuyến (Phần A: Đo lường mục tiêu KPI, Phần B: Root cause, Phần C: Yêu cầu kỹ thuật) và 3 câu tự luận tình huống kèm gợi ý chuyên gia.
- `practice_forms_json jsonb NULL`: 13 Biểu mẫu thực hành chuẩn hóa (`BM01`–`BM13`) dạng JSON.
- `self_assessments_json jsonb NULL`: 5 Công cụ Tự đánh giá năng lực (`TĐG01`–`TĐG05`) kèm ma trận Radar Chart 5 trục.
- *Chỉ mục mới*:
  - `CREATE INDEX ix_learning_materials_cluster_code ON lms.learning_materials(cluster_code);`
  - `CREATE INDEX ix_learning_materials_step_number ON lms.learning_materials(step_number);`
  - `CREATE INDEX ix_learning_materials_module_code ON lms.learning_materials(module_code);`
  - `CREATE INDEX ix_learning_materials_delivery_format ON lms.learning_materials(delivery_format);`

##### 2. Tạo mới 6 Bảng Con Chuyên Biệt (Schema `lms.*`):

```sql
-- 1. Bảng Playlist 3 Micro-Videos kèm kịch bản phân cảnh CALL SHEET (dành cho 30 bài CG)
CREATE TABLE IF NOT EXISTS lms.learning_micro_videos (
    id uuid PRIMARY KEY,
    material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
    video_order int NOT NULL CHECK (video_order >= 1 AND video_order <= 3),
    video_code varchar(30) NOT NULL,
    title varchar(250) NOT NULL,
    duration_seconds int NOT NULL DEFAULT 0,
    video_storage_key varchar(500) NULL,
    video_file_name varchar(255) NULL,
    thumbnail_url varchar(500) NULL,
    call_sheet_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_learning_micro_videos_order UNIQUE (material_id, video_order)
);
CREATE INDEX IF NOT EXISTS ix_learning_micro_videos_material ON lms.learning_micro_videos(material_id);

-- 2. Bảng In-Video Pop-up Quizzes (Q1–Q6 dừng hình video tại trigger_seconds)
CREATE TABLE IF NOT EXISTS lms.learning_in_video_quizzes (
    id uuid PRIMARY KEY,
    material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
    micro_video_id uuid NULL REFERENCES lms.learning_micro_videos(id) ON DELETE CASCADE,
    quiz_code varchar(20) NOT NULL,
    trigger_seconds int NOT NULL CHECK (trigger_seconds >= 0),
    after_scene varchar(50) NULL,
    question_text varchar(500) NOT NULL,
    option_a varchar(250) NOT NULL,
    option_b varchar(250) NOT NULL,
    option_c varchar(250) NOT NULL,
    option_d varchar(250) NOT NULL,
    correct_option char(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    explanation varchar(1000) NOT NULL,
    display_order int NOT NULL DEFAULT 1,
    CONSTRAINT uq_learning_in_video_quizzes_code UNIQUE (material_id, quiz_code)
);
CREATE INDEX IF NOT EXISTS ix_learning_in_video_quizzes_trigger ON lms.learning_in_video_quizzes(material_id, trigger_seconds);

-- 3. Bảng Tiêu chí Rubric Tự Chấm Điểm Thực Hành (7 tiêu chí thang 0-1-2)
CREATE TABLE IF NOT EXISTS lms.learning_practice_rubrics (
    id uuid PRIMARY KEY,
    material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
    criterion_number int NOT NULL CHECK (criterion_number >= 1 AND criterion_number <= 7),
    criterion_name varchar(250) NOT NULL,
    description_score_0 varchar(500) NOT NULL,
    description_score_1 varchar(500) NOT NULL,
    description_score_2 varchar(500) NOT NULL,
    weight_multiplier int NOT NULL DEFAULT 1,
    CONSTRAINT uq_learning_practice_rubrics_criterion UNIQUE (material_id, criterion_number)
);
CREATE INDEX IF NOT EXISTS ix_learning_practice_rubrics_material ON lms.learning_practice_rubrics(material_id);

-- 4. Bảng 13 Biểu Mẫu Thực Hành Chuẩn Hóa (BM01–BM13)
CREATE TABLE IF NOT EXISTS lms.learning_practice_forms (
    id uuid PRIMARY KEY,
    form_code varchar(20) NOT NULL,
    form_title varchar(250) NOT NULL,
    material_id uuid NULL REFERENCES lms.learning_materials(id) ON DELETE SET NULL,
    template_storage_key varchar(500) NULL,
    instructions_html text NULL,
    display_order int NOT NULL DEFAULT 1,
    CONSTRAINT uq_learning_practice_forms_code UNIQUE (form_code)
);
CREATE INDEX IF NOT EXISTS ix_learning_practice_forms_material ON lms.learning_practice_forms(material_id);

-- 5. Bảng Hỏi Đáp Thường Gặp (8 câu FAQ/bài học)
CREATE TABLE IF NOT EXISTS lms.learning_faqs (
    id uuid PRIMARY KEY,
    material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
    question_number int NOT NULL CHECK (question_number >= 1 AND question_number <= 8),
    question_text varchar(500) NOT NULL,
    answer_text text NOT NULL,
    display_order int NOT NULL DEFAULT 1,
    CONSTRAINT uq_learning_faqs_question UNIQUE (material_id, question_number)
);
CREATE INDEX IF NOT EXISTS ix_learning_faqs_material ON lms.learning_faqs(material_id);

-- 6. Bảng Cấp Chứng Nhận Số NACENTECH Trực Tuyến (LmsReceiveCertificate)
CREATE TABLE IF NOT EXISTS lms.learning_certificates (
    id uuid PRIMARY KEY,
    person_id uuid NOT NULL,
    roadmap_code varchar(20) NOT NULL,
    certificate_code varchar(50) NOT NULL,
    holder_name varchar(150) NOT NULL,
    classification varchar(30) NOT NULL,
    average_score int NOT NULL,
    qr_verification_url varchar(500) NOT NULL,
    issued_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_learning_certificates_code UNIQUE (certificate_code)
);
CREATE INDEX IF NOT EXISTS ix_learning_certificates_person ON lms.learning_certificates(person_id);

-- 7. Bảng Lưu Kết Quả Tự Chấm Điểm & Nộp Bài Thực Hành của Học Viên
CREATE TABLE IF NOT EXISTS lms.learner_practice_evaluations (
    id uuid PRIMARY KEY,
    material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
    person_id uuid NOT NULL,
    rubric_scores_json jsonb NOT NULL,
    essay_answers_json jsonb NULL,
    total_score int NOT NULL CHECK (total_score >= 0 AND total_score <= 14),
    max_score int NOT NULL DEFAULT 14,
    pass_threshold int NOT NULL DEFAULT 11,
    is_unlocked_cta boolean NOT NULL DEFAULT FALSE,
    expert_consultation_requested boolean NOT NULL DEFAULT FALSE,
    demand_profile_created boolean NOT NULL DEFAULT FALSE,
    submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_learner_practice_evaluations_person_material ON lms.learner_practice_evaluations(material_id, person_id);
```

---

#### 5.2. THIẾT KẾ MỞ RỘNG DTOS & API CONTRACTS

##### 1. Mở rộng DTOs trong `LmsDtos.cs`:
- **`LmsMaterialFilterRequest`**:
  ```csharp
  public string? ClusterCode { get; set; }     // CLUSTER_A .. CLUSTER_F
  public int? StepNumber { get; set; }         // 1 .. 7
  public string? ModuleCode { get; set; }      // M1 .. M8
  public string? RoadmapCode { get; set; }     // LT1 .. LT5
  public string? DeliveryFormat { get; set; }  // CG, DH
  public string? FunctionGroup { get; set; }   // ORIENTATION, SPOTLIGHT, SKILLS
  public string? LevelCode { get; set; }       // CB, TC, NC
  ```
- **DTOs Thực thể mới**:
  ```csharp
  public sealed record CertificateDto(
      Guid Id,
      string CertificateCode,
      string RoadmapCode,
      string HolderName,
      string Classification,
      int AverageScore,
      string QrVerificationUrl,
      DateTimeOffset IssuedAt);

  public sealed class ClaimCertificateRequest
  {
      public string RoadmapCode { get; set; } = string.Empty; // LT1 .. LT5
  }

  public sealed record PracticeFormDto(
      Guid Id,
      string FormCode,
      string FormTitle,
      Guid? MaterialId,
      string? TemplateStorageKey,
      string? InstructionsHtml,
      int DisplayOrder);

  public sealed record SelfAssessmentToolDto(
      string ToolCode,
      string ToolTitle,
      IReadOnlyList<string> Dimensions,
      IReadOnlyList<string> RecommendedRoadmaps);

  public sealed record MicroVideoDto(
      Guid? Id,
      int VideoOrder,
      string VideoCode,
      string Title,
      int DurationSeconds,
      string? VideoStorageKey,
      string? VideoFileName,
      string? ThumbnailUrl,
      string? CallSheetJson,
      string? VideoDownloadUrl = null);

  public sealed record InVideoQuizDto(
      Guid? Id,
      Guid? MicroVideoId,
      string QuizCode,
      int TriggerSeconds,
      string? AfterScene,
      string QuestionText,
      string OptionA,
      string OptionB,
      string OptionC,
      string OptionD,
      char CorrectOption,
      string Explanation,
      int DisplayOrder);

  public sealed record PracticeRubricDto(
      Guid? Id,
      int CriterionNumber,
      string CriterionName,
      string DescriptionScore0,
      string DescriptionScore1,
      string DescriptionScore2,
      int WeightMultiplier = 1);

  public sealed record FaqDto(
      Guid? Id,
      int QuestionNumber,
      string QuestionText,
      string AnswerText,
      int DisplayOrder);

  public sealed class SubmitPracticeEvaluationRequest
  {
      public Dictionary<int, int> RubricScores { get; set; } = []; // CriterionNumber (1..7) -> Score (0,1,2)
      public Dictionary<string, string>? EssayAnswers { get; set; } // "PartA", "PartB", "PartC"
      public bool RequestExpertConsultation { get; set; }
      public bool CreateDemandProfile { get; set; }
  }

  public sealed record PracticeEvaluationResultDto(
      int TotalScore,
      int MaxScore,
      int PassThreshold,
      bool IsUnlockedCta,
      bool UnlockedExpertReviewCta,
      bool UnlockedDemandCreateCta,
      string FeedbackMessage,
      DateTimeOffset SubmittedAt);
  ```
- **Mở rộng `LearningMaterialDetailDto`**:
  - Bổ sung `ClusterCode`, `ClusterName`, `StepNumber`, `ModuleCode`, `DeliveryFormat`, `FunctionGroup`, `LevelCode`, `TargetAudience`, `PreparationNotes`, `ExpectedOutcome`, `PassScorePercent`.
  - Bổ sung `string? LearningObjectivesJson`, `string? LearningRoadmapJson`, `string? KnowledgeSummaryJson`, `string? PracticeWorkbookJson`, `string? PracticeFormsJson`, `string? SelfAssessmentsJson`.
  - Bổ sung các mảng cấu phần: `IReadOnlyList<MicroVideoDto> MicroVideos`, `IReadOnlyList<InVideoQuizDto> InVideoQuizzes`, `IReadOnlyList<PracticeRubricDto> PracticeRubrics`, `IReadOnlyList<FaqDto> Faqs`.

##### 2. Chi Tiết Xử Lý Nghiệp Vụ Tại Application & Controller:
- **`GET /api/v1/lms/catalog`**:
  - Hỗ trợ lọc đa chiều đồng thời theo `clusterCode`, `moduleCode` (`M1`–`M8`), `roadmapCode` (`LT1`–`LT5`), `deliveryFormat` (`CG`/`ĐH`), `functionGroup` và `levelCode`.
  - Trả về danh sách 50 bài học `PUBLISHED` kèm 4 thẻ KPI động.
- **`GET /api/v1/lms/catalog/{id}`**:
  - Trả về đầy đủ dữ liệu 8 thành phần: Video playlist 3 micro-videos (đối với bài CG) hoặc video đơn (đối với bài ĐH), In-video quizzes (ẩn đáp án đúng với người học chưa trả lời), Bảng tự chấm 7 tiêu chí, Bảng tóm tắt kiến thức, Đề bài thực hành trực tuyến 13 biểu mẫu, 8 câu FAQ, 10 câu trắc nghiệm cuối bài.
- **`POST /api/v1/lms/catalog/{id}/practice-evaluations`**:
  - Cưỡng chế quy tắc `BR-EL-08`: Mỗi tiêu chí nhận điểm $0, 1, 2$. Tổng điểm $S = \sum_{i=1}^{7} p_i$ ($0 \le S \le 14$).
  - Nếu $S < 11$: `IsUnlockedCta = false`, khóa 2 nút CTA phản biện và tạo nhu cầu.
  - Nếu $S \ge 11$: `IsUnlockedCta = true`, mở khóa 2 nút CTA:
    * CTA 1: Gửi yêu cầu phản biện Chuyên gia (`R50` kết nối `TASK-05`).
    * CTA 2: Tạo hồ sơ nhu cầu công nghệ (`TASK-03`).
  - Lưu bản ghi vào bảng `lms.learner_practice_evaluations`.
- **Cập nhật `POST /api/v1/lms/catalog/{id}/quiz-attempts`**:
  - Cưỡng chế quy tắc `BR-EL-09` mới: Đạt tỷ lệ $\ge 60\%$ (tối thiểu 6/10 câu đúng; học viên được làm lại tối đa 3 lần) mới ghi nhận `passed = true`, cập nhật `learner_progress.is_completed = true` và tăng `learning_materials.completion_count += 1`.
- **Endpoint Cấp Chứng Nhận Số `POST /api/v1/lms/certificates/claim`**:
  - Cưỡng chế quy tắc `BR-EL-09`: Kiểm tra học viên đã hoàn thành 100% bài học bắt buộc trong Lộ trình `LT1`..`LT5`.
  - Xếp loại: `Đạt` (70–79đ), `Khá` (80–89đ), `Xuất sắc` (90–100đ).
  - Sinh mã Chứng nhận số duy nhất `NACENTECH-CERT-{RoadmapCode}-{PersonIdShort}-{Year}` và cấp mã QR xác thực trực tuyến.

---

#### 5.3. THIẾT KẾ PIPELINE ETL NẠP 50 BÀI HỌC HỌC THUẬT & TÀI LIỆU ĐÍNH KÈM (`scripts/etl_lms_30_courses.py`)

Xây dựng kịch bản ETL nạp toàn bộ **50 bài học (`EL-001`..`EL-050`)** theo Khung chương trình đào tạo số cấp quốc gia (QĐ 1993/QĐ-BKHCN):
- **30 bài Chuyên gia `CG`**: Bóc tách từ 30 file Excel chuẩn BA tại `Specification/01_DATA_RAW/New temp/*.xlsx`.
- **20 bài Đồ họa `ĐH`**: Bóc tách từ Báo cáo chuyên đề `Specification/01_DATA_RAW/Bao cao chuyen de Khung chuong trinh dao tao so NV nguon cung cong nghe_Draft 1.docx` (Bảng 4.4 & Phụ lục 1).

##### 1. Nguyên Tắc Xử Lý Media & Học Thuật (Theo Chỉ Đạo PO & Product Leader):
- **Phạm vi Video**: **KHÔNG** tự render/tạo file video .mp4 bằng script (bỏ bước sinh video tự động từ CALL SHEET). Video bài giảng thực tế sẽ do Chuyên gia trực tiếp upload lên hệ thống qua giao diện quản trị (`/portal/expert/elearning` & `/admin/elearning`).
- **Trọng tâm Pipeline ETL**: Tập trung 100% bóc tách và nạp đầy đủ nội dung học thuật từ 30 file Excel và file Word Báo cáo chuyên đề `Draft 1.docx`:
  1. **Thông tin bài học & Metadata**: Mã bài `EL-001`..`EL-050`, Cụm chuyên đề A–F, 8 Mô-đun `M1`–`M8`, 5 Lộ trình `LT1`–`LT5`, Hình thức (`CG` / `ĐH`), Nhóm chức năng (`Định hướng` / `Technology Spotlight` / `Kỹ năng`), Cấp độ (`CB` / `TC` / `NC`), Lead Expert.
  2. **30 Bài Chuyên gia `CG` (Từ 30 Excel `New temp/*.xlsx`)**:
     * Sheet `CALL SHEET`: Metadata 3 micro-videos kèm kịch bản phân cảnh L1, L2, L3 lưu dạng JSON `call_sheet_json`.
     * Sheet `CÂU HỎI TƯƠNG TÁC`: 6 câu hỏi Pop-up Quiz tương tác (Q1–Q6) kèm `triggerSeconds`, `afterScene`, 4 lựa chọn A/B/C/D, đáp án đúng và giải thích củng cố kiến thức.
     * Sheet `TÓM TẮT KIẾN THỨC`: Bảng tóm tắt kiến thức cốt lõi (Core Takeaways).
     * Sheet `BÀI TẬP TỰ LUYỆN`: 10 câu trắc nghiệm cuối bài (giải mã công thức Excel cột I) + 3 câu tự luận tình huống có gợi ý đối chiếu chuyên gia.
     * Sheet `PHIẾU THỰC HÀNH`: Đề bài thực hành trực tuyến 3 phần A, B, C và 13 biểu mẫu `BM01`–`BM13`.
     * Sheet `BẢNG TỰ CHẤM...`: Bảng tự chấm điểm 7 tiêu chí định lượng thang 0–1–2, tổng điểm tối đa 14đ, ngưỡng đạt $\ge 11/14$ điểm.
     * Sheet `HỎI ĐÁP`: Đầy đủ 8 câu hỏi đáp thường gặp (FAQ)/bài.
  3. **20 Bài Đồ Họa `ĐH` (Từ `Draft 1.docx` Bảng 4.4 & Phụ lục 1)**:
     * Nạp metadata, mục tiêu, lộ trình, nội dung kịch bản đồ họa, bài trắc nghiệm cuối bài và câu hỏi thực hành tình huống.

##### 2. Xuất Bản 100 Tệp Tài Liệu Cẩm Nang Đính Kèm (`storage/lms/docs/`):
- Tự động xuất bản 100 tệp tài liệu cẩm nang đính kèm (.pdf Tóm tắt kiến thức cốt lõi & .docx Phiếu thực hành BM01–BM13) cho 50 bài học vào thư mục `storage/lms/docs/` và tính mã băm SHA-256 lưu vào bảng `lms.learning_attachments`.

##### 3. Nạp CSDL PostgreSQL 16 & Huấn Luyện AI RAG (1024d):
- Nạp trực tiếp vào PostgreSQL 16 (port 55440): 50 bài học chính, 90 micro-videos (metadata & CALL SHEET), 180 in-video quizzes, 500 câu trắc nghiệm cuối bài, 210 tiêu chí rubric, 400 FAQ và 100 tệp tài liệu.
- Tự động băm văn bản tóm tắt, FAQ và nội dung thực hành thành các chunks có nghĩa, nhúng vector 1024 chiều (`BAAI/bge-m3`) vào bảng `matching.search_chunks` (`subject_kind = 'LEARNING_MATERIAL'`) để Trợ lý ảo AI NacenTwin (`R51`) trả lời ngay lập tức.

