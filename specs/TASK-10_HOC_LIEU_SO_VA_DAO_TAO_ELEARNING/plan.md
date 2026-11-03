# KẾ HOẠCH KIẾN TRÚC KỸ THUẬT (TECHNICAL PLAN)
## PHÂN HỆ: HỌC LIỆU SỐ & ĐÀO TẠO E-LEARNING (TASK-10)

> **Mã Epic**: `TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING`  
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
