# Kế Hoạch Kiến Trúc & Kỹ Thuật (Implementation Plan)
# TASK-09: ĐÁNH GIÁ TRÌNH ĐỘ & NĂNG LỰC CÔNG NGHỆ SẢN XUẤT (TT17)

> **Mã Epic**: `TASK-09_DANH_GIA_TRINH_DO_NANG_LUC_CONG_NGHE_TT17`  
> **Kiến trúc áp dụng**: Clean Architecture .NET 10 + Next.js 15 App Router + Hybrid JSONB (`ADR-0013`)  
> **Trạng thái**: Đã phê duyệt kỹ thuật

---

## 1. THIẾT KẾ HỢP ĐỒNG API (CONTRACT-FIRST)

### 1.1. Endpoints
- `GET /api/v1/assessments/tt17/current`: Lấy thông tin bản đánh giá của năm hiện tại hoặc bản nháp gần nhất của DN.
- `GET /api/v1/assessments/tt17/history`: Lấy danh sách lịch sử các kỳ đánh giá (Yearly Snapshots) của DN.
- `GET /api/v1/assessments/tt17/{id}`: Lấy chi tiết hồ sơ đánh giá và điểm số theo ID.
- `POST /api/v1/assessments/tt17`: Khởi tạo kỳ đánh giá mới cho một năm cụ thể.
- `PUT /api/v1/assessments/tt17/{id}/draft`: Lưu nháp (Auto-Save Debounce) toàn bộ dữ liệu Phụ lục I.
- `POST /api/v1/assessments/tt17/{id}/calculate`: Gọi Engine tính điểm tức thời (Real-time Calculator) mà không cần ghi DB.
- `POST /api/v1/assessments/tt17/{id}/submit`: Đóng băng hồ sơ thành Snapshot bất biến và chuyển sang trạng thái `SUBMITTED`.
- `GET /api/v1/gov/assessments/tt17`: [Cán bộ Sở] Lấy danh sách hàng đợi hồ sơ địa bàn (`ScopeId`).
- `POST /api/v1/gov/assessments/tt17/{id}/review`: [Cán bộ Sở] Thẩm định hồ sơ (`APPROVE`, `REJECT`, `REQUEST_CHANGES`, hiệu chỉnh điểm).

### 1.2. Cấu trúc DTO Lõi
```csharp
public sealed class Tt17AssessmentDto
{
    public Guid Id { get; set; }
    public Guid EnterpriseId { get; set; }
    public string EnterpriseName { get; set; } = "";
    public string TaxCode { get; set; } = "";
    public int AssessmentYear { get; set; }
    public string Status { get; set; } = "DRAFT";
    public string ScopeType { get; set; } = "PROVINCE";
    public string ScopeId { get; set; } = "";
    public Tt17SurveyDataDto SurveyData { get; set; } = new();
    public Tt17ScoreResultDto ScoreResult { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
}

public sealed class Tt17ScoreResultDto
{
    public double ScoreT { get; set; } // Max 30
    public double ScoreE { get; set; } // Max 20
    public double ScoreO { get; set; } // Max 19
    public double ScoreR { get; set; } // Max 17
    public double ScoreI { get; set; } // Max 14
    public double TotalScore { get; set; } // Max 100
    public double SyncCoefficient { get; set; } // T_ĐB
    public string Classification { get; set; } = ""; // LAC_HAU, TRUNG_BINH, TRUNG_BINH_TIEN_TIEN, TIEN_TIEN, CAN_THAM_DINH
    public List<CriterionScoreDto> Criteria { get; set; } = new(); // 26 tiêu chí
    public List<string> Bottlenecks { get; set; } = new(); // Danh sách mã điểm nghẽn
}
```

---

## 2. THIẾT KẾ BACKEND .NET 10 (CLEAN ARCHITECTURE)

- **Domain Layer (`NacenTech.Modules.Assessment`)**:
  - `Tt17Assessment`: Aggregate Root quản lý vòng đời hồ sơ, kiểm tra điều kiện chuyển trạng thái.
  - Value Objects & Models: `SurveyData`, `ScoreResult`, `MachineryItem`, `CriterionScore`.
  - Domain Invariants: Kiểm tra tính hợp lệ chuỗi 3 năm tài chính, công thức lũy thừa $T_{ĐB}$.
- **Application Layer**:
  - `Tt17ScoringEngine`: Hiện thực hóa chính xác thuật toán 26 tiêu chí, chia 5 nhóm T-E-O-R-I.
  - Commands & Queries: `CreateAssessmentCommand`, `SaveDraftCommand`, `SubmitAssessmentCommand`, `ReviewAssessmentCommand`, `GetAssessmentByIdQuery`.
  - Phân quyền: Cưỡng chế 3D Scoped RBAC qua `ICurrentActor.ValidateScopeAccess()`.
- **Infrastructure / Persistence Layer**:
  - EF Core Configuration sử dụng kiểu cột PostgreSQL `jsonb` cho `SurveyData` và `ScoreResult`.
  - Áp dụng `ValueComparer` để EF Core Change Tracker nhận diện đúng khi mảng JSONB thay đổi.

---

## 3. THIẾT KẾ FRONTEND NEXT.JS 15 (UI/UX 4 MÀN HÌNH)

- **Kiến trúc Component**:
  - `src/app/(portal)/assessments/tt17/page.tsx`: Màn 1 — Dashboard lịch sử và trung tâm đánh giá.
  - `src/app/(portal)/assessments/tt17/wizard/page.tsx`: Màn 2 — Form Wizard 6 bước + Sticky Realtime Calculator.
  - `src/app/(portal)/assessments/tt17/[id]/report/page.tsx`: Màn 3 — Báo cáo Phụ lục II/IV + Radar Chart + Điểm nghẽn liên thông TASK-03.
  - `src/app/gov/assessments/tt17/page.tsx`: Màn 4 — Cổng thẩm định hồ sơ của Sở KH&CN theo địa bàn.
- **Thư viện & Công nghệ**:
  - `react-hook-form` quản lý trạng thái form khối lớn với `useFieldArray` cho danh mục máy móc động.
  - `recharts` hoặc SVG thuần để vẽ biểu đồ mạng nhện Radar Chart 5 đỉnh chuẩn nét.
  - Component chuẩn `<Async>` bọc toàn bộ giao diện đảm bảo 5 trạng thái UX (Loading, Empty, Error, Success, Partial).
  - Tuân thủ nghiêm ngặt Design Token System (`slate`, `emerald`, `brand`, font $\ge$ 12px).
