# Technical Plan: TASK-05 Hồ Sơ Chuyên Gia KH&CN & AI Scan LLKH

**Feature**: `TASK-05_HO_SO_CHUYEN_GIA_KHCN`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Status**: Cần hoàn tất DB Closure Plan trước khi triển khai/đánh dấu nghiệm thu  
**Basic Design Mapping**: [`Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/README.md`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/README.md)  
**Architecture Report Reference**: [`Reports/Bao_cao_giai_phap_cong_nghe_va_nen_tang_NacenTech.md`](../../Reports/Bao_cao_giai_phap_cong_nghe_va_nen_tang_NacenTech.md) (Mục 2.2 Module Brokerage & Identity)  

---

## 1. Kiến Trúc Kỹ Thuật (Architecture & Module Allocation)

Theo Báo cáo giải pháp công nghệ gốc (Mục 2.2, Module 3: Sổ tay Chuyên gia & Tư vấn), phân hệ được tổ chức trực tiếp vào schema `brokerage` của `NacenTwinBE`:

```text
SourceCode/
├── backend/
│   ├── modules/
│   │   └── brokerage/                         # Module Sổ tay Chuyên gia & Tư vấn
│   │       ├── Domain/
│   │       │   ├── ExpertProfile.cs           # Thực thể Hồ sơ Chuyên gia KH&CN
│   │       │   └── ExpertStatuses.cs          # PENDING_REVIEW, APPROVED, CHANGES_REQUESTED, REJECTED
│   │       ├── Application/
│   │       │   ├── IExpertService.cs          # Contract dịch vụ Chuyên gia
│   │       │   ├── ExpertService.cs           # UseCases: Nộp hồ sơ, Tra cứu, Cập nhật
│   │       │   └── Contracts.cs               # DTOs: SubmitUpgradeRequest, ExpertProfileDto
│   │       └── Infrastructure/
│   │           └── Persistence/
│   │               └── Configurations.cs      # EF Core Entity Mapping cho expert_profiles
│   └── apps/
│       └── api/
│           └── Controllers/
│               └── ExpertController.cs        # REST API endpoints cho Portal và App
└── frontend/                                  # NacenTwinFE (Next.js 15 App Router)
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx             # Màn hình Đăng nhập
    │   │   │   └── register/page.tsx          # Màn hình Đăng ký
    │   │   └── profile/
    │   │       └── upgrade/
    │   │           └── expert/page.tsx        # Wizard 3 bước Nâng cấp Chuyên gia
    │   ├── components/
    │   │   ├── ui/                            # Shadcn UI Primitives & <Async>
    │   │   └── expert/
    │   │       ├── Step1Identity.tsx          # Form Bước 1: Định danh & Học vị
    │   │       ├── Step2Competency.tsx        # Form Bước 2: Chuyên môn & AI Scan
    │   │       └── Step3Scientific.tsx        # Form Bước 3: Hồ sơ KH & Cam kết
    │   └── lib/
    │       ├── auth-client.ts                 # JWT Token Interceptor & Session Manager
    │       └── api-client.ts                  # Fetch / Axios wrapper
```

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (Database Schema)

### Bảng Hồ Sơ Chuyên Gia KH&CN (`expert_profiles`)
```sql
CREATE TABLE expert_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL UNIQUE REFERENCES persons(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    birth_year INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    id_card_number VARCHAR(20) NOT NULL,
    id_card_date DATE NOT NULL,
    id_card_files_json JSONB NULL,              -- URLs ảnh CCCD 2 mặt
    portrait_url TEXT NULL,                     -- URL ảnh chân dung
    academic_rank VARCHAR(50) NOT NULL DEFAULT 'NONE', -- 'GS', 'PGS', 'NONE'
    academic_rank_year INT NULL,
    degree VARCHAR(50) NOT NULL,                -- 'DOCTOR', 'MASTER', 'ENGINEER_BACHELOR'
    degree_year INT NOT NULL,
    degree_certificate_url TEXT NULL,
    organization_name VARCHAR(255) NOT NULL,
    organization_address VARCHAR(255) NULL,
    research_title VARCHAR(100) NULL,
    position_title VARCHAR(100) NULL,
    expertise_sectors TEXT[] NOT NULL DEFAULT '{}', -- 18 ngành trọng điểm TT17
    training_history_json JSONB NULL,           -- Danh sách quá trình đào tạo
    employment_history_json JSONB NULL,         -- Quá trình công tác
    publications_json JSONB NULL,               -- 5 công trình tiêu biểu
    patents_json JSONB NULL,                    -- Bằng sáng chế / GPHI
    practical_projects_json JSONB NULL,         -- Dự án ứng dụng thực tiễn
    consulting_summary TEXT NULL,
    is_project_leader BOOLEAN NOT NULL DEFAULT FALSE,
    is_main_contributor BOOLEAN NOT NULL DEFAULT FALSE,
    pdpd_consent_at_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'
    reviewer_note TEXT NULL,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expert_person ON expert_profiles(person_id);
CREATE INDEX idx_expert_status ON expert_profiles(status);
CREATE INDEX idx_expert_sectors ON expert_profiles USING GIN(expertise_sectors);
```

---

## 3. Hợp Đồng API (Contract-First Design)

### 3.1. Nộp Hồ Sơ Nâng Hạng Chuyên Gia
- **Endpoint**: `POST /api/v1/experts/upgrade-request`
- **Quyền hạn**: `[Authorize]` (Người dùng đã đăng nhập `USER` hoặc `GUEST`).
- **Request Body (JSON)**:
  ```json
  {
    "fullName": "Nguyễn Văn A",
    "birthYear": 1982,
    "gender": "male",
    "idCardNumber": "001082012345",
    "idCardDate": "2021-08-15",
    "academicRank": "PGS",
    "academicRankYear": 2022,
    "degree": "DOCTOR",
    "degreeYear": 2016,
    "organizationName": "Viện Công Nghệ Thông Tin",
    "organizationAddress": "18 Hoàng Quốc Việt, Hà Nội",
    "researchTitle": "Nghiên cứu viên cao cấp",
    "positionTitle": "Trưởng phòng Hệ thống thông minh",
    "expertiseSectors": [
      "Công nghệ thông tin & Chuyển đổi số",
      "Cơ khí chế tạo & Tự động hóa"
    ],
    "trainingHistory": [
      { "level": "Kỹ sư", "school": "ĐHBK Hà Nội", "major": "CNTT", "year": 2005 }
    ],
    "employmentHistory": [
      { "period": "2006-2012", "position": "Nghiên cứu viên", "org": "Viện CNTT" }
    ],
    "publications": [
      { "title": "Real-time Defect Detection", "role": "Tác giả chính", "journal": "IEEE Sensors Journal", "year": 2023 }
    ],
    "consultingSummary": "Chuyên gia cố vấn hệ thống IoT và Computer Vision công nghiệp.",
    "isProjectLeader": true,
    "isMainContributor": true,
    "pdpdConsent": true,
    "legalOath": true
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "isSuccess": true,
      "data": {
        "profileId": "8b52c084-25b4-4340-96f3-10d65b1bc701",
        "code": "EXP-2026-0925-HN08",
        "status": "PENDING_REVIEW",
        "submittedAtUtc": "2026-09-25T11:55:00Z"
      },
      "error": null
    }
    ```
  - `400 Bad Request`: Chưa đồng ý PDPD (`ERR_PDPD_CONSENT_REQUIRED`).
  - `409 Conflict`: Người dùng đã có hồ sơ đang chờ thẩm định (`ERR_PENDING_REQUEST_EXISTS`).

### 3.2. Tra Cứu Trạng Thái Hồ Sơ Chuyên Gia
- **Endpoint**: `GET /api/v1/experts/my-profile`
- **Quyền hạn**: `[Authorize]`
- **Response**: Trả về toàn bộ thông tin đã khai báo kèm trạng thái `status` và `reviewerNote` (nếu có yêu cầu sửa đổi).

### 3.3. Mô Phỏng Trích Xuất AI-to-Text LLKH
- **Endpoint**: `POST /api/v1/experts/ai-cv-scan`
- **Quyền hạn**: `[Authorize]`
- **Response**: Trả về dữ liệu JSON trích xuất tự động từ tệp PDF/Word để Client điền trước vào Form Bước 2.

---

## 4. Thiết Kế Frontend UI/UX (5 Trạng Thái UX qua `<Async>`)

1. **Loading State**:
   - Khi bấm "Chọn tệp LLKH để AI Scan tự động": Thanh tiến trình động 0% $\rightarrow$ 100% với thông báo trạng thái "Đang OCR bóc tách và phân tích ngữ nghĩa bằng mô hình BGE-M3...".
   - Khi tải form hồ sơ: Skeleton loader cho từng nhóm trường.
2. **Empty State**: Khi người dùng chưa có hồ sơ $\rightarrow$ Hiển thị Hero banner giới thiệu quyền lợi của Chuyên gia KH&CN và nút [Bắt đầu tạo hồ sơ].
3. **Error State**: Nếu thiếu trường bắt buộc hoặc file quá 20MB $\rightarrow$ Viền đỏ quanh trường kèm thông báo lỗi cụ thể.
4. **Success State**: Khi nộp xong $\rightarrow$ Modal chúc mừng, hiển thị mã tra cứu `EXP-2026-0925-HN08` và thời hạn SLA tối đa 48 giờ.
5. **Partial State**: Lưu nháp (Auto-save) dữ liệu từng bước vào LocalStorage để tránh mất dữ liệu nếu tải lại trang.

---

## 5. Plan Delta v2: Tích Hợp Zalo Mini App & Backend Intake Endpoint

### 5.1. Database Schema Delta (Non-destructive Migration)
Để hỗ trợ tiếp nhận hồ sơ sơ bộ từ Zalo Mini App và chuẩn hóa trường năng lực công nghệ:

```sql
-- Migration: AddMasteredTechAndZaloIntakeToExpertProfile
ALTER TABLE expert_profiles 
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS email VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS mastered_tech_codes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS draft_source VARCHAR(30) NOT NULL DEFAULT 'PORTAL', -- 'PORTAL', 'ZALO_MINI_APP'
  ADD COLUMN IF NOT EXISTS magic_link_token VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS magic_link_expires_at_utc TIMESTAMP WITH TIME ZONE NULL;

-- Cho phép person_id NULL ở giai đoạn sơ bộ (kết nối chính thức khi chuyên gia kích hoạt Magic Link)
ALTER TABLE expert_profiles ALTER COLUMN person_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expert_magic_link ON expert_profiles(magic_link_token);
```

### 5.2. Backend API Contracts & CORS Delta
1. **CORS Policy Webview Zalo**:
   Trong `Program.cs` cấu hình policy:
   ```csharp
   policy.WithOrigins("https://h5.zdn.vn", "https://mini.zalo.me")
         .AllowAnyHeader()
         .AllowAnyMethod();
   ```
2. **Endpoint Tiếp Nhận Sơ Bộ (Quick Intake)**:
   - **Route**: `POST /api/v1/public/experts/quick-intake`
   - **Content-Type**: `multipart/form-data`
   - **DTO**: `QuickExpertIntakeRequest` (`FullName`, `Phone`, `Email`, `HighestDegree`, `Organization`, `SectorCode`, `List<string> MasteredTechCodes`, `IFormFile CvFile`, `bool PdpdConsent`)
   - **Response**: `200 OK`
     ```json
     {
       "success": true,
       "trackingId": "DRAFT-EXP-2026-0814",
       "status": "AI_PROCESSING",
       "magicLinkUrl": "https://nacentwin.vn/verify-profile?token=...",
       "estimatedSeconds": 30
     }
     ```

### 5.3. Kiến Trúc Kỹ Thuật Zalo Mini App (`SourceCode/ZaloMiniApp/`)
1. **Cấu hình định danh (`app-config.json`)**:
   - `title`: "Viện NacenTech — Sổ tay Chuyên gia KH&CN"
   - `headerColor`: `#1d4ed8`
   - Khai báo permissions: `scope.userInfo`, `scope.userPhonenumber`
2. **Cấu hình đóng gói (`vite.config.ts`)**:
   - Duy trì cố định tên bundle (`assets/index.module.js`, `assets/vendor.module.js`, `assets/index.css`) khớp chuẩn `app-config.json`.
   - Proxy dev: `/api` trỏ về API Backend .NET Core `http://localhost:5000`.
3. **Mã nguồn giao diện (`src/`)**:
   - `src/pages/home.tsx`: Chuyển đổi mã nguồn từ [`wireframe_zalo_input_form.html`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_zalo_input_form.html).
   - Tích hợp Zalo SDK: Gọi `getUserInfo()` và `getPhoneNumber()` để tự động điền Họ tên và SĐT.
   - `src/components/ai-progress.tsx`: Thanh tiến trình giả lập / polling trạng thái AI Engine đọc hiểu CV.
   - `src/api/expert.ts`: Service gọi API `quick-intake` và kiểm tra trạng thái bóc tách.
   - `src/pages/me.tsx`: Giữ tab profile và nút "Quan tâm OA Viện NacenTech" (`followOA`).
   - Dọn dẹp: Gỡ bỏ các module tra cứu lô hàng cũ (`result.tsx`, `brand.tsx`, `history.tsx`, `qr.ts`).

---

## 6. Plan Delta v3: Hoàn chỉnh Data Model, Chứng từ và AI Ingestion (28/09/2026)

### 6.1. Kết luận và nguyên tắc thiết kế

Thiết kế cũ có bảng lõi `expert_profiles`, nhưng chưa đủ để lưu toàn bộ trường của Basic Design v2.2 và chưa có EF migration áp dụng vào database. Không dùng một cột JSONB cho toàn bộ hồ sơ: các danh mục có thể lặp, cần hiển thị công khai, lọc hoặc kiểm chứng phải được chuẩn hóa thành bảng con. JSONB chỉ giữ nguyên văn dữ liệu AI trích xuất và payload kỹ thuật có version.

Mọi bảng bên dưới đặt trong schema `brokerage`; tất cả thời điểm là UTC, có `created_at`, `updated_at`, `version` (optimistic concurrency) theo chuẩn platform. Tệp không lưu blob trong PostgreSQL: chỉ lưu object key/URI, checksum, MIME, kích thước và trạng thái quét mã độc.

### 6.2. Ma trận bao phủ trường

| Nhóm trường trong Basic Design | Đã có trong model hiện tại | Còn thiếu / sai lệch phải đóng |
| :--- | :--- | :--- |
| Định danh: họ tên, năm sinh, giới tính, CCCD, ngày cấp, học hàm/học vị, tổ chức, chức danh | Có phần lớn ở `ExpertProfile` | Thiếu nơi cấp CCCD (nếu được BA bổ sung), mã hồ sơ bền vững; số CCCD hiện lưu plain text, trái yêu cầu mã hóa AES-256 của `spec.md`. |
| Chứng từ: ảnh chân dung, CCCD hai mặt, văn bằng, CV/LLKH | `CvFileUrl` duy nhất | Thiếu `id_card_files_json`, `portrait_url`, `degree_certificate_url` trong entity/EF/API; không có metadata, checksum, trạng thái kiểm tra tệp hoặc phân quyền tải tệp. |
| Chuyên môn: 18 ngành, OECD, công nghệ làm chủ | Có `expertise_sectors`, `mastered_tech_codes` | Thiếu `oecd_fields`; hiện dùng text tự do thay vì FK/mã danh mục chuẩn TASK-06, nên không đảm bảo được tính hợp lệ và truy vấn liên ngành. |
| Đào tạo, công tác | Có 2 JSON string | Chưa chuẩn hóa từng dòng (bậc, cơ sở, chuyên ngành, từ/năm đến, vị trí, địa chỉ); không thể kiểm tra, tìm kiếm hay audit dữ liệu AI và dữ liệu chuyên gia chỉnh sửa. |
| Công trình khoa học | Có `publications_json` | Thiếu trường chỉ mục ISI/Scopus/DOI và bảng con để giới hạn tối đa 5 công trình, tránh JSON không hợp lệ. |
| Sáng chế, ứng dụng thực tế, đề tài 5 năm, giải thưởng | Không có trong entity/API dù schema cũ có 2 JSON đầu tiên | Thiếu hoàn toàn `patents`, `practical_projects`, `research_projects`, `awards`; schema cũ cũng chưa có đề tài và giải thưởng. |
| Dịch vụ tư vấn & lịch sẵn sàng | Có `consulting_summary` | Thiếu loại dịch vụ, hình thức làm việc, phạm vi/khu vực, thời lượng/khung giờ; không đáp ứng mục tiêu kết nối doanh nghiệp của Basic Design. |
| Pháp lý & quy trình duyệt | Có `pdpd_consent_at`, `status`, `reviewer_note`, 2 checkbox nhiệm vụ | Thiếu `legal_oath` và thời điểm cam kết; chưa liên kết có ràng buộc với `approval_requests`; thiếu lịch sử chuyển trạng thái/review. |
| Zalo + AI | Có phone, email, nguồn, magic token/hạn, CV filename | Thiếu `zalo_user_id` (nếu dùng SDK), tracking code lưu bền, trạng thái `AI_PROCESSING`/`AI_PREFILLED` nhất quán, job/phiên bản AI, kết quả confidence, lỗi và dữ liệu prefill. Endpoint hiện chỉ giữ tên file, không upload/lưu file. |
| Migration và ràng buộc vật lý | Có EF configuration nhưng snapshot/migrations chưa có `ExpertProfile` | Chưa có migration tạo bảng; unique index `person_id` cần partial unique index (`WHERE person_id IS NOT NULL`) để hỗ trợ nhiều draft chưa gắn người dùng; cần FK tới `persons` và các danh mục. |

### 6.3. Target schema bắt buộc

1. **`expert_profiles` (aggregate root)** — bổ sung `expert_code` (unique, immutable), `person_id` nullable FK, `submission_source`, `zalo_user_id` nullable, `profile_status`, `visibility_status`, `oecd_field_codes`, `mastered_tech_codes`, summary tư vấn, hai đăng ký nhiệm vụ và timestamps. `profile_status` dùng một enum thống nhất: `DRAFT`, `AI_PROCESSING`, `AI_PREFILLED`, `PENDING_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`, `ARCHIVED`.
2. **`expert_identity_private` (1:1)** — `expert_profile_id` PK/FK; các giá trị mã hóa ở tầng ứng dụng: CCCD, ngày/nơi cấp, điện thoại, email. Tách khỏi profile công khai; log truy cập dữ liệu nhạy cảm qua audit module.
3. **`expert_documents`** — nhiều chứng từ với `document_type` (`PORTRAIT`, `ID_FRONT`, `ID_BACK`, `DEGREE_CERTIFICATE`, `CV_LLKH`, `EVIDENCE`), `storage_key`, `sha256`, `mime_type`, `size_bytes`, `malware_scan_status`, `uploaded_by`, `retention_until`. Ràng buộc chỉ một ảnh portrait active, hai mặt CCCD và một văn bằng active khi nộp chính thức.
4. **`expert_training_records`** và **`expert_employment_records`** — lưu từng dòng đào tạo/công tác, theo thứ tự hiển thị; công tác có `from_date`, `to_date`, `organization`, `organization_address`, `position_title`.
5. **`expert_publications`**, **`expert_patents`**, **`expert_practical_projects`**, **`expert_research_projects`**, **`expert_awards`** — FK `expert_profile_id`, các trường đã nêu tại Basic Design; publication có `display_order` và constraint tối đa 5 bản ghi active/profile.
6. **`expert_service_offerings`** và **`expert_availability`** — danh mục dịch vụ, hình thức làm việc, khu vực và thời lượng/khung giờ để thực hiện matchmaking với doanh nghiệp.
7. **`expert_consents`** — mỗi phiên bản văn bản PDPD/`LEGAL_OATH`, `accepted_at_utc`, `policy_version`, `source`, `ip_hash` (không lưu IP thô nếu không có căn cứ lưu trữ), `actor_ref`.
8. **`expert_ai_ingestions`** — input document, provider/model/version, trạng thái, request/result JSONB, confidence, error code, processed timestamps; tất cả kết quả AI phải chờ chuyên gia xác nhận trước khi thành dữ liệu chính thức.
9. **`expert_profile_status_history`** — from/to status, reason, changed_by, approval_request_id nullable FK. Đây là liên kết truy vết với `TASK-07`, không nhân bản luồng phê duyệt.

### 6.4. Ràng buộc, chỉ mục và bảo mật bắt buộc

- FK từ mã ngành/OECD/công nghệ sang master data TASK-06; không nhận nhãn text tự do làm dữ liệu chuẩn.
- Partial unique index: `person_id WHERE person_id IS NOT NULL`; unique index với `expert_code`; unique index có điều kiện với `zalo_user_id` chỉ khi BA phê duyệt dùng Zalo ID làm định danh.
- Index cho `profile_status`, `visibility_status`, GIN trên các mảng mã ngành/OECD/công nghệ; index `magic_link_token_hash` thay vì lưu token raw.
- Token Magic Link lưu hash SHA-256/HMAC, one-time use, có `used_at_utc`; endpoint chỉ nhận token thô và so sánh hash.
- Số CCCD, điện thoại, email và URL/chứng từ riêng tư phải được mã hóa tại application layer, phân quyền theo purpose; response public/portal không được trả CCCD. `ExpertProfileDto` phải tách DTO owner/admin/public.
- Kiểm tra MIME + magic bytes, virus scan async và checksum trước khi trạng thái chuyển `PENDING_REVIEW`; không lấy `IFormFile.FileName` làm `CvFileUrl`.

### 6.5. Thứ tự triển khai và Definition of Done

1. Chốt enum/trường còn mở với BA, đặc biệt: nơi cấp CCCD, danh mục OECD, mức công khai, danh mục dịch vụ và chính sách lưu hồ sơ/tệp.
2. Cập nhật domain entities, EF configurations và API contracts theo schema mục 6.3; loại bỏ DTO trả `Guid.Empty` cho draft chưa gắn `person_id`.
3. Tạo migration `CreateExpertProfileAndEvidenceSchema` bao gồm schema/bảng/FK/index/partial index; cập nhật `NacenTechDbContextModelSnapshot`; chạy migration trên database sạch và môi trường tích hợp.
4. Cập nhật intake Zalo thành upload thực, tạo `expert_documents` + `expert_ai_ingestions`, trả tracking code được lưu DB; tách trạng thái AI khỏi trạng thái phê duyệt.
5. Cập nhật luồng portal/TASK-07: nộp chính thức tạo `approval_requests` và `expert_profile_status_history` trong một transaction; chỉ approval hoàn tất mới gán role `EXPERT`.
6. Viết DB integration tests cho FK, partial uniqueness, mã hóa/không lộ PII, upload validation, token one-time và tất cả chuyển trạng thái; chỉ khi migration, tests và mapping field-to-DB đạt 100% mới đổi TASK-05 sang `Implemented/Verified`.

---

## 7. Plan Delta v4: Hợp nhất DB — Zalo Mini App — Web Portal

### 7.1 Contract chuẩn

`ExpertProfileDraftDto` là contract đọc chung cho owner; `SubmitExpertProfileRequest` là contract Web canonical; `QuickExpertIntakeRequest` giữ tối giản cho Zalo. Không reuse DTO public cho owner/admin. API cần cung cấp: tạo/cập nhật draft, upload document theo `documentType`, lấy draft bằng Magic Link, submit chính thức và lấy profile owner.

### 7.2 Luồng hai kênh

1. **Zalo:** quick-intake → document `CV_LLKH` → `expert_ai_ingestions` → `AI_PREFILLED` → Magic Link.
2. **Web:** nạp draft/Magic Link → nhập định danh, collections và chứng từ → xác nhận PDPD/legal oath → transaction submit + approval request TASK-07.
3. Hai UI dùng một status enum; mọi lỗi API hiển thị Error/Partial, không fallback success.

### 7.3 Compatibility và kiểm thử

- Giữ route quick-intake hiện hữu; bổ sung fields nullable/default, không phá Zalo app cũ.
- Web payload cũ phải được thay bằng canonical field names trước khi bật submit thật.
- Contract tests kiểm tra JSON Web/Zalo, upload type, token expiry và PII masking; E2E kiểm tra Zalo draft được Web đọc/submit.

---

## 8. Plan Delta v5: Implement trang Chi Tiết Chuyên Gia từ wireframe

### 8.1 Route và phân quyền

| Bề mặt | Route/UI | API | Quyền |
| :--- | :--- | :--- | :--- |
| Public Web | `/experts/[expertCode]` | `GET /api/v1/public/experts/{expertCode}` | Anonymous; Approved + Public |
| Owner Portal | `/portal/expert/profile` | `GET /api/v1/experts/me/detail` | Owner authenticated |
| Admin đối soát | Portal có guard | `GET /api/v1/admin/experts/{expertCode}/detail` | Permission TASK-07 cụ thể |
| Zalo Mini App | nút `Xem hồ sơ` ở `me.tsx` | deep link Public/Portal | không render Full data |

### 8.2 DB gap cần đóng

1. `expert_profiles`: `expert_code` unique immutable, `visibility_status` (`PRIVATE`, `PUBLIC`), `is_accepting_consultation`, `public_bio`; metrics tính từ dữ liệu thật, không persist/mock.
2. Các collection (publications, patents, practical projects, research projects, awards, đào tạo, công tác): `is_public`, `is_active`, `display_order` cùng metadata để render (DOI/indexing; số/cấp bằng/TRL; cấp đề tài/kết quả/vai trò; kết quả tư vấn; cấp/năm giải thưởng).
3. `expert_documents`: portrait public tách evidence private; signed download URL chỉ do endpoint có quyền phát, không serialize `storage_key`.
4. Dùng audit module platform hoặc tạo `expert_private_access_audits` cho `EXPERT_PRIVATE_PROFILE`/`EXPERT_DOCUMENT`, lưu actor/purpose/occurred_at.
5. Chưa tự suy đoán schema cho hội đồng/chứng nhận, trợ lý, lãnh đạo cơ quan, tài khoản/thù lao: phải chốt BA; nếu chưa có dữ liệu chuẩn hiển thị Partial.

### 8.3 API contracts

- `ExpertPublicDetailDto`: `expertCode`, identity được phép public, verification/readiness, organization/title, `publicBio`, tags, metrics, timelines, contact instruction, 5 public collections và CTA availability. Không có PII key.
- `ExpertPrivateDetailDto`: Public DTO + private identity/contact/bank/remuneration/PDPD/documents/roles/organization detail; chỉ server-side permission mapping tạo DTO này.
- Public query lọc status/visibility/record visibility ngay tại database và trả `404` khi không public.
- Owner/admin query dùng policy rõ ràng và log private read; download document tách endpoint có authorization + audit.
- CTA chỉ gọi endpoint khi contract module nhận yêu cầu được xác nhận; còn thiếu thì UI `Partial`.

### 8.4 Frontend Web, Zalo và test

Tạo feature `src/features/expert-detail/` với `ExpertHero`, `VerificationAndAvailabilityBadge`, `ExpertMetrics`, `TimelineCard`, `ContactCard`, `AchievementTabs`, `ConsultationCta`, `PrivateProfilePanel`, `ProfileDetailAsyncState`.

- Public page chỉ tải Public DTO: hero/tags/metrics/timeline/contact mask/5 tabs/CTA/share; desktop 1/3–2/3, mobile một cột, tabs ngang scroll.
- Owner page tải private DTO sau guard; edit/PDPD handoff dùng luồng hiện có; private cache không dùng lại cho public page.
- Đủ 5 UX states: loading skeleton, error retry, empty per tab/timeline, success, partial khi metadata/CTA chưa sẵn.
- `me.tsx` Zalo chỉ deep link: approved+public → Public Web; owner draft/approved → Portal xác thực; không raw token/PII trong URL.
- Test migration/index unique code, query filter, public JSON deny-list, owner/admin auth/audit, signed document download, component/E2E/visual responsive và Zalo link builder.

### 8.5 Thứ tự triển khai / Definition of Done

1. Chốt BA field chưa chuẩn ở §8.2 và module đích của CTA.
2. Migration/domain/query projection → API + auth/audit tests → Public Web → Owner panel → Zalo handoff.
3. Hoàn thành khi public response zero PII, owner/admin có authorization + audit, đủ 5 UX states và build/test 3 bề mặt sạch.

---

## 9. Plan Delta v6: Xác thực thật và Owner Detail E2E (29/09/2026)

### 9.1. Phạm vi, ranh giới Epic và tác động

Delta này thuộc **TASK-05** vì hoàn tất hành trình nghiệp vụ của chuyên gia: đăng nhập → Portal → Full Owner Detail. Không tạo Epic mới. Nó tái sử dụng và chỉnh phần hợp đồng JWT/RBAC chung của TASK-00, nhưng không thay đổi mục tiêu, UI hay backlog của TASK-00. Zalo Mini App và Public Detail không đổi chức năng trong Delta này; chỉ chạy regression để bảo đảm không bị ảnh hưởng.

Hiện trạng cần thay thế:

1. `login/page.tsx` gọi relative `/api/v1/auth/login` dù Web không có reverse proxy/API route tương ứng.
2. Nhánh `catch` tạo `mock-jwt-token` và mock user cho mọi lỗi, che lấp lỗi backend.
3. `V1Mappers.SanitizedUser` ép mọi PlatformRole về `user`/`admin`, trong khi Web cần nhận `VERIFIED_EXPERT` thật để điều hướng/guard.
4. Demo profile công khai chưa gắn `PersonId` của account chuyên gia, nên Owner endpoint đúng bảo mật nhưng không thể trả profile đó.

Không cần DB migration nếu database hiện hữu đã có `persons.id`, `expert_profiles.person_id` unique và nullable/linked theo migration trước. Nếu kiểm tra môi trường mục tiêu cho thấy constraint chưa tồn tại, chỉ tạo migration bổ sung non-destructive để thêm index/unique constraint tương đương; không sửa migration đã apply.

### 9.2. Backend identity và API contract

1. Tách use case login portal khỏi login admin: portal login xác thực account active và phát JWT với **PlatformRole thật**; admin login vẫn chỉ chấp nhận nhóm admin. Không dùng parameter `requiredRole = USER` để từ chối `VERIFIED_EXPERT`.
2. Chuẩn hóa response login thành `AuthSessionDto`:

```json
{
  "accessToken": "<backend-signed-jwt>",
  "user": {
    "id": "uuid",
    "email": "expert.demo@local.test",
    "fullName": "PGS.TS. Nguyễn Minh An",
    "role": "VERIFIED_EXPERT",
    "scopeType": "SECTOR",
    "scopeId": "CN_THONG_TIN"
  }
}
```

`role` phải là `PlatformRole` chuẩn, không còn adapter legacy `user`/`admin` cho endpoint login Web. Nếu legacy consumer cần shape cũ, tách adapter/versioned endpoint thay vì làm sai contract mới.

3. JWT tiếp tục có `sub`, `role`, `scope_type`, `scope_id`; `GET /api/v1/experts/me/detail` dùng `sub` qua `HttpCurrentActor.PersonId`. Endpoint không nhận personId/expertCode từ client, không có khả năng đọc chéo owner.
4. Giữ `GET /api/v1/public/experts/{expertCode}` anonymous và PII deny-list nguyên vẹn. Owner API trả 401 (không/invalid token), 403 (authenticated nhưng role không đủ) hoặc 404 (không có profile gắn actor) theo contract đã chốt, không trả partial PII.

### 9.3. Dữ liệu và fixture development

- Tạo fixture/command development idempotent, không nằm trong EF production migration: tìm hoặc tạo Person theo email cấu hình; kích hoạt account; gán `PlatformRole = VERIFIED_EXPERT`, scope; rồi gắn chính `persons.id` vào `ExpertProfile.ExpertCode = CG-NACEN-DEMOIT01`.
- Fixture dùng secret/biến môi trường Development cho password. Không commit password, hash hoặc secret mới; không ghi password ra console/log.
- Chạy lại fixture không tạo Person/Profile mới và không đụng profile khác. Đây là dữ liệu nghiệm thu local, không phải seed triển khai production.

### 9.4. Web Portal và UX

1. Trích `API_BASE` vào client dùng chung và dùng nó cho login, register, profile detail và CTA; URL chỉ lấy từ `NEXT_PUBLIC_API_BASE_URL`, development default `http://localhost:5080`.
2. Xóa toàn bộ `DEMO_ACCOUNTS`/mock fallback khỏi luồng production. Có thể giữ thông tin hướng dẫn tài khoản local ở tài liệu developer, không đưa credential vào UI bundle.
3. Login chỉ `setSession` sau response API hợp lệ có JWT/user đủ trường. 4xx/5xx/network hiển thị message an toàn; không tự điều hướng.
4. Bọc `/portal/expert/profile` bằng `RoleGuard` cho `VERIFIED_EXPERT` (admin theo policy rõ ràng nếu UI admin dùng route riêng). Khi owner API trả 401, clear session và hiển thị CTA Login; 403/404/Error phải phân biệt thông báo, có Retry khi phù hợp. Giữ đủ Loading, Error, Empty, Success, Partial.

### 9.5. Kiểm thử và Definition of Done

| Tầng | Kiểm chứng bắt buộc |
| :--- | :--- |
| Backend unit/contract | Portal login chấp nhận expert active; admin restriction; response giữ role/scope; token JWT claims; no mock token; owner lookup theo `sub`. |
| DB integration | Fixture idempotent; `PersonId` của profile demo là account fixture; unique ownership; owner khác không đọc được. |
| Web component | Login gọi API base đúng; lỗi không tạo localStorage session; valid response điều hướng đúng; owner page gửi Bearer token và hiển thị 401/403/404. |
| E2E local | Login account expert thật → `/portal` → `/portal/expert/profile` → Full detail `CG-NACEN-DEMOIT01`; login sai/token hết hạn bị chặn. |
| Regression | Public profile PII deny-list, CTA, Zalo deep link, `dotnet test`, `pnpm test`, `pnpm build`, Zalo build. |

Definition of Done: không còn chuỗi `mock-jwt-token` hay fallback mock account trong frontend production; API/Web/DB local chạy cùng config; E2E bằng account được Backend cấp JWT pass; public profile vẫn không expose PII.

## 10. Plan Delta v7: Không gian tác nghiệp của Chuyên gia

### 10.1. Information architecture và route

| Nhóm chức năng | Route / bề mặt | Chủ thể | Trạng thái |
| :--- | :--- | :--- | :--- |
| Tổng quan | `/portal/expert/profile` | Owner | Triển khai mở rộng Owner Detail hiện hữu |
| Hồ sơ của tôi | `/portal/expert/profile`, `/profile/upgrade/expert` | Owner | View thật đã có; Edit/lưu nháp/nộp lại cần canonical contract |
| Năng lực chuyên môn | phần Đào tạo/Công tác/Thành tựu/Dịch vụ trong Owner workspace | Owner | Collections hiện hữu; hoàn thiện thao tác edit ở T063 |
| Yêu cầu tư vấn & kết nối | `/portal/expert/consultations` | Owner | Mới thiết kế; tích hợp với bounded context Matching & Advisory |
| Thông báo | widget Owner workspace và inbox chung | Owner | Thông báo hồ sơ hiện hữu; mở rộng notification tư vấn |

Không đưa Quick Portal Switcher vào Navbar phát hành. Role là claim do backend phát; mọi thay đổi role thuộc TASK-07.

### 10.2. Hợp đồng API

| API | Trạng thái | Mục đích và quyền |
| :--- | :--- | :--- |
| `GET /api/v1/experts/me/detail` | Đã có | Full owner projection/audit, chỉ theo `sub` |
| `GET /api/v1/experts/me/completeness` | Mới thiết kế | Trả progress, nhóm thiếu và CTA key; chỉ Owner/Admin theo policy; không đưa PII raw vào lý do |
| `PATCH /api/v1/experts/me/draft` | Mới thiết kế | Lưu nháp trường owner được sửa, optimistic version và audit |
| `POST /api/v1/experts/me/submit` | Mới thiết kế | Nộp lại profile hợp lệ, liên thông approval TASK-07 |
| `GET /api/v1/experts/me/consultation-requests` | Mới thiết kế | Danh sách yêu cầu tư vấn/kết nối mà owner nhận; không phải order thương mại |
| `PATCH /api/v1/experts/me/consultation-requests/{id}` | Mới thiết kế | Owner xác nhận/từ chối/đề nghị lịch làm việc theo state machine Matching & Advisory |

### 10.3. Completeness và trạng thái

Backend là nguồn tính completeness. Input gồm profile core, contact private, consent, chứng từ active và collections chuyên môn. Response chỉ trả `percentage`, `items[]` (`group`, `severity`, `message`, `editAnchor`) và `reviewStatus`; frontend không tự suy diễn dữ liệu nhạy cảm.

| Trạng thái profile | Xem | Sửa/lưu nháp | Nộp lại | Thông báo |
| :--- | :--- | :--- | :--- | :--- |
| `DRAFT`, `AI_PREFILLED`, `CHANGES_REQUESTED` | Full owner | Cho phép | Khi đủ điều kiện | Danh sách thiếu/lý do review |
| `PENDING_REVIEW` | Full owner read-only | Khóa | Không | Đang thẩm định |
| `APPROVED` | Full + Public preview | Chỉ thông tin không cần tái thẩm định | Theo policy Task-07 | Sẵn sàng tư vấn / yêu cầu mới |
| `REJECTED`, `ARCHIVED` | Full owner | Theo quyết định Task-07 | Không mặc định | Lý do và CTA phù hợp |

### 10.4. UI/UX và 5 trạng thái

Owner workspace theo `wireframe_expert_owner_workspace.html`: header View/Edit/Public View; Completeness card; Private Detail; Năng lực chuyên môn; widget Thông báo. Mỗi nhóm có Loading, Empty, Error+Retry, Success và Partial độc lập. `Bổ sung ngay` dùng `editAnchor` để mở đúng nhóm wizard, không chuyển role/session.

Yêu cầu tư vấn dùng list/detail response: Empty khi chưa có, Partial khi chưa có lịch, Error retry khi notification service/API lỗi; nội dung yêu cầu chỉ hiển thị cho Owner/admin đúng scope.

### 10.5. Non-destructive data và kiểm thử

- Không migration cho “đơn hàng” hay payment. Nếu Matching & Advisory chưa có aggregate request, tạo liên kết/foreign key non-destructive ở module sở hữu, không nhét bảng commerce vào Brokerage.
- DB/API integration: owner isolation, completeness no-PII, profile lock, optimistic version, submit-to-approval và consultation request scope.
- Web: component tests completeness/Partial/locked edit, owner navigation, consultation Empty/Error; E2E login → workspace → Edit/submit lại theo trạng thái fixture.

## 11. Plan Delta v8: Dashboard chuyên gia theo role

### 11.1. Tác động và dữ liệu

Delta này chỉ thay Presentation Web. Không có migration, bảng, API endpoint hoặc thay đổi RBAC. `GET /api/v1/experts/me/detail` là nguồn owner-authorized hiện hữu; dashboard dẫn xuất ba nhóm cần làm từ contact, chứng từ active và công trình/sáng chế. Đây là projection UI tạm thời cho tới T062 completeness API server-side, không làm thay đổi trạng thái duyệt.

### 11.2. Điều hướng và 5 trạng thái UX

`/portal` đọc role session: `VERIFIED_EXPERT` render `ExpertDashboard`; role khác render `GeneralPortalDashboard` để bảo toàn hành vi cũ. `ExpertDashboard` có Loading, Error+Retry, Success; khối Thông báo dùng Empty khi không có thông báo thật. Không render các thẻ marketplace trong mọi trạng thái expert.

### 11.3. Kiểm thử

Component test mock Owner Detail: xác nhận danh sách todo, không có Gian hàng Công nghệ, và dữ liệu thật render. Frontend regression `pnpm test` và `pnpm build` phải pass.

## 12. Plan Delta v9: PII CCCD non-destructive

Migration `20260929140000_MakeExpertIdentityCardOptional` chỉ `ALTER ... DROP NOT NULL` tương đương cho `brokerage.expert_profiles.id_card_number` và `id_card_date`; không drop cột, xoá hay backfill dữ liệu. Domain sử dụng nullable values; Submit contract bỏ field; current Portal projections không chứa field. Web Wizard bỏ input/state/payload, Owner Private Panel bỏ display. Zalo đã đúng nên chỉ giữ regression. Test bắt buộc: profile nullable, Owner DTO deny-list, frontend no-input/build và migration apply trên PostgreSQL.

---

## 13. Plan Delta v10: Danh bạ Tìm kiếm & Lọc Chuyên gia Công Khai (`/experts` & `/chuyen-gia`)

### 13.1. Phạm vi Kiến trúc & Hợp đồng API (Contract-First)

1. **Backend API Endpoint**:
   - `GET /api/v1/public/experts`:
     - **Query Parameters**:
       - `q` (string, optional): Từ khóa tìm kiếm toàn văn.
       - `degree` (string, optional): Lọc theo học vị (GS, PGS, TS, ThS).
       - `sectorCode` (string, optional): Lọc theo mã ngành TT17 ("01" -> "18").
       - `provinceCode` (string, optional): Lọc theo mã địa bàn tỉnh/thành ("HN", "HCM", "DN"...).
       - `page` (int, default: 1): Số trang.
       - `pageSize` (int, default: 9): Số bản ghi/trang.
     - **Response Body (`ExpertPublicDirectoryDto`)**:
       - `items`: Danh sách thẻ chuyên gia `ExpertPublicCardDto` gồm: `expertCode`, `fullName`, `academicRank`, `degree`, `organizationName`, `sectorCode`, `sectorName`, `masteredTechCodes`, `provinceName`, `publicationCount`, `patentCount`, `projectCount`, `isVerified`.
       - `totalCount`: Tổng số chuyên gia khớp tiêu chí.
       - `page`, `pageSize`, `totalPages`.
     - **Security & PII Rules**: TUYỆT ĐỐI KHÔNG chứa CCCD, SĐT, Email cá nhân trong DTO trả về. Chỉ nạp các hồ sơ có `status == ExpertStatuses.APPROVED`.

2. **Frontend Architecture & Giao diện UX**:
   - **Tuyến đường (Routes)**:
     - Tạo thư mục trang: `SourceCode/frontend/src/app/experts/page.tsx` (Trang Danh bạ chính).
     - Điều hướng alias: `SourceCode/frontend/src/app/[module]/page.tsx` khi `module === "chuyen-gia"` sẽ chuyển hướng (redirect) hoặc render component Danh bạ Chuyên gia, giữ tính toàn vẹn với Navbar Header.
   - **Component phân rã**:
     - `ExpertHeroSearch`: Thanh tìm kiếm Hero, tag xu hướng.
     - `ExpertSidebarFilter`: Bộ lọc 4 trục (Học vị, 18 Ngành TT17, 34 Tỉnh thành, Chứng thực).
     - `ExpertCardGrid`: Lưới 3 cột render thẻ chuyên gia `ExpertCard`.
     - `ConnectModal`: Popup gửi yêu cầu kết nối nhanh (mô phỏng luồng tương tác với chuyên gia).
     - Bao phủ trọn vẹn 5 trạng thái UX qua chuẩn `<Async>`: Loading (Skeleton Cards), Empty (Không có kết quả), Error (Lỗi API + Retry), Success, Updating.

### 13.2. Kế hoạch Kiểm thử & Bảo vệ Regression
1. **Backend Invariants / Controller Tests**:
   - Test lọc danh bạ trả đúng hồ sơ `APPROVED`.
   - Test chặn rò rỉ PII: DTO không chứa CCCD, SĐT, Email.
   - Test phân trang và lọc theo query/sector/degree.
2. **Frontend Component & UI Tests**:
   - Test render đầy đủ bộ lọc và grid thẻ chuyên gia.
   - Test tìm kiếm và bấm nút [Xem hồ sơ chi tiết] chuyển tới `/experts/[expertCode]`.
   - Test modal gửi yêu cầu kết nối.

## 14. Plan Delta v11: Danh bạ theo taxonomy active và compact UI

### 14.1 Contract / nguồn dữ liệu
- Nạp `SECTOR` active từ `GET /api/v1/sectors`; FE không duy trì danh sách ngành hardcode. Hiển thị số lượng mục thực nhận và mã `code` đúng chuẩn `LVxx`.
- Tập trung nạp master data qua SDK dùng chung `frontend/src/lib/master-data-client.ts`; màn hình không tự khai báo mảng danh mục hoặc tự xử lý envelope khác nhau.
- Duy trì query `sectorCode` cho danh bạ. Bổ sung test contract/invariant để mã taxonomy lọc đúng hồ sơ public đã duyệt.
- Directory search giữ tham số `q` và nhận alias `query` theo contract REQ-EXP-DIR-001; nếu gửi cả hai, ưu tiên `q` để tương thích client hiện hành.
- Danh mục địa bàn lấy từ projection công khai tối thiểu của danh mục 34 tỉnh; không trả thông tin quản trị. Lọc dựa trên scope tỉnh thực của hồ sơ sở hữu bởi Person (`VERIFIED_EXPERT`, `PROVINCE` + `ScopeId`) qua API composition adapter để giữ ranh giới module; không gán địa bàn cho profile thiếu scope.
- Chỉ giữ filter/sort khi có query semantics thật. Các control chưa được hỗ trợ phải bỏ hoặc disable có giải thích, không giả vờ áp dụng.
- Nối CTA kết nối với `POST /api/v1/public/experts/{expertCode}/consultation-requests` đang tồn tại; báo thành công chỉ khi HTTP 202 và response thành công. Ghi rõ yêu cầu được chuyển tới NacenTech/admin để tránh tuyên bố sai là chuyên gia nhận trực tiếp.

### 14.2 Thiết kế UI/UX
- Cập nhật wireframe TASK-05 và thư viện `wireframe_tong_the_nacentwin.html` bằng nguồn HTML mới/đã cập nhật.
- Rút gọn Hero; đưa search thành một hàng rõ ràng; thu filter thành thanh tiêu chí + panel mở rộng (desktop), drawer/bottom sheet (mobile); filter đang chọn thành removable chips.
- Rút gọn card, bỏ decoration thừa, ưu tiên tên/học hàm, tổ chức, lĩnh vực, năng lực và CTA xem hồ sơ.
- Giữ Loading, Empty, Error, Success, Updating và retry; bảo đảm responsive 1440×900 và 390×844.

### 14.3. Surface implementation & verification
- Backend: directory filter phải áp dụng provinceCode thật; taxonomy endpoint hiện hữu là nguồn ngành; giữ DTO public tối thiểu và PII deny-list.
- Frontend: nạp taxonomy và tỉnh từ API, reset/clear filters, query-state/page reset nhất quán; bỏ sort chưa hoạt động và nối CTA với endpoint consultation request hiện hữu.
- Không cần migration nếu truy vấn Person scope đáp ứng; nếu kiểm chứng cho thấy không, dừng phần province và đề xuất schema delta trước khi đổi DB.
- QC: API/invariant (10 taxonomy active, sector/province filters, approved/public only, PII), FE tests (loading/error/retry/empty/query combination/pagination), contract và E2E screenshot desktop/mobile.

---

## 15. Plan Delta v14: Form Chỉnh Sửa Hồ Sơ Chuyên Gia & Completeness Engine

### 15.1. Domain & Kiến Trúc Tầng Ứng Dụng (Clean Architecture)
- **Domain Entity (`ExpertProfile.cs`)**:
  - Bổ sung phương thức `UpdateProfileDetails(...)` cho phép chủ hồ sơ cập nhật: `AcademicRank`, `AcademicRankYear`, `Degree`, `DegreeYear`, `OrganizationName`, `OrganizationAddress`, `ResearchTitle`, `PositionTitle`, `ExpertiseSectors`, `SpecializedKeywords`, `PublicBio`, `IsAcceptingConsultation`, `TrainingHistoryJson`, `EmploymentHistoryJson`, `PublicationsJson`, `ConsultingSummary`.
  - Cưỡng chế quy tắc bất biến: Ném ngoại lệ `ValidationException` nếu thiếu học vị, cơ quan, hoặc nếu hồ sơ đang trong trạng thái `PENDING_REVIEW` (`BR-EXP-042`).
  - Cập nhật thời điểm `UpdatedAtUtc = clock.UtcNow`.

- **Completeness Engine Logic (Thuật Toán Định Lượng)**:
  - Điểm tổng chuẩn hóa 100 điểm, chia đều 5 nhóm (mỗi nhóm 20 điểm):
    1. **Định danh & Pháp lý** (20đ): Có FullName, BirthYear hợp lệ, Gender, và đã xác nhận PDPD.
    2. **Học vị & Cơ quan** (20đ): Có Degree, DegreeYear, OrganizationName, và PositionTitle.
    3. **Lĩnh vực TT17 & Từ khóa** (20đ): Có ít nhất 1 mã trong `ExpertiseSectors` (10đ) và ít nhất 1 từ khóa trong `SpecializedKeywords` (10đ).
    4. **Thành tựu KH&CN** (20đ): Có dữ liệu công trình trong `PublicationsJson` hoặc `ExpertPublication` hoặc `ExpertPatent` (20đ).
    5. **Hồ sơ Công khai & Tư vấn** (20đ): Có `PublicBio` không rỗng (10đ) và đã kích hoạt `IsAcceptingConsultation` (10đ).
  - Phân hạng (`Grade`):
    - $\ge 90$: `EXCELLENT` (Xuất sắc)
    - $\ge 70$: `GOOD` (Khá tốt)
    - $\ge 50$: `BASIC` (Cơ bản)
    - $< 50$: `INCOMPLETE` (Chưa đạt)

### 15.2. Hợp Đồng API & DTOs
- `UpdateExpertProfileRequest`: Chứa toàn bộ các trường chuyên môn cho phép cập nhật.
- `ExpertCompletenessDto`: `Score` (int), `Grade` (string), `CompletedCriteria` (list string), `MissingCriteria` (list string), `Suggestions` (list string).
- Endpoint `PUT /api/v1/experts/my-profile`: Yêu cầu xác thực `[Authorize]`, kiểm tra role `VERIFIED_EXPERT`, validate `ExpertiseSectors` thuộc taxonomy active qua `ITaxonomyService`.
- Endpoint `GET /api/v1/experts/me/completeness`: Yêu cầu xác thực `[Authorize]`, trả về `ExpertCompletenessDto`.

### 15.3. Giao Diện Người Dùng & Trải Nghiệm 5 UX States
- Tạo trang `SourceCode/frontend/src/app/portal/expert/profile/edit/page.tsx` bọc `RoleGuard(VERIFIED_EXPERT)`:
  - Bố cục 3 khối chuẩn Wireframe `wireframe_chinh_sua_ho_so_chuyen_gia.html`:
    - Khối 1: Học Hàm, Học Vị & Cơ Quan Công Tác Chính.
    - Khối 2: Lĩnh Vực Chuyên Môn (10 LV TT17) & Từ Khóa Nghiên Cứu (`SpecializedKeywords`).
    - Khối 3: Danh Mục Công Trình Khoa Học, Sáng Chế & Đề Tài.
    - Status Bar: Thanh Completeness động & Công tắc bật/tắt nhận tư vấn.
  - Xử lý 5 UX states qua component chuẩn `<Async>`.
- Điều hướng:
  - Trang chi tiết `/portal/expert/profile`: Cập nhật nút "Chỉnh sửa hồ sơ" trỏ sang `/portal/expert/profile/edit`.
  - `CompletenessAlert`: Nạp dữ liệu thực tế từ `GET /api/v1/experts/me/completeness`.

### 15.4. Kế Hoạch Kiểm Thử
- Backend Invariants: Viết Unit tests cho `UpdateProfileDetails` và tính toán `Completeness` (đạt 100% các ngưỡng điểm).
- Frontend Vitest: Viết Component tests cho trang `edit/page.tsx` kiểm chứng render 5 UX states, tương tác form, và lưu thành công.

