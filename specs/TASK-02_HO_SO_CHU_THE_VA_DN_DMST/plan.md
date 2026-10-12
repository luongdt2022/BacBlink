# Kế Hoạch Kỹ Thuật (plan.md) — TASK-02: Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST

> **Mã phân hệ**: `TASK-02`  
> **Kiến trúc**: Clean Architecture, Modular Monolith .NET Core 8/10, Next.js 15 Tailwind CSS  
> **CSDL**: PostgreSQL 16+ (Schemas `enterprise` & `demand`)  
> **Tài liệu đặc tả**: [`spec.md`](spec.md)  
> **Bộ kiểm thử**: xUnit Invariants, PostgreSQL Integration, Vitest, Playwright E2E

---

## 1. THIẾT KẾ CONTRACT-FIRST (APIS & DTOS)

### 1.1 Danh Sách Endpoints V1

| Mã API | Giao Thức & Đường Dẫn | Quyền Truy Cập (RBAC) | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **`API-02-001`** | `GET /api/v1/enterprises` | Công khai (`PUBLIC_USER` / Ẩn danh) | Danh bạ tra cứu doanh nghiệp công khai (Lọc theo tỉnh, ngành TT17, quy mô, TNI, phân trang). |
| **`API-02-002`** | `GET /api/v1/enterprises/{taxCode}` | Công khai (Có PDPD Masking) | Xem hồ sơ chi tiết công khai của doanh nghiệp theo MST (Doanh thu & SĐT bị ẩn). |
| **`API-02-003`** | `GET /api/v1/portal/enterprise/profile` | Doanh nghiệp (`ENTERPRISE`, `INNOVATIVE_ENTERPRISE`) | Lấy toàn bộ 10 nhóm trường hồ sơ của doanh nghiệp hiện đang đăng nhập (Đầy đủ dữ liệu thật). |
| **`API-02-004`** | `PUT /api/v1/portal/enterprise/profile` | Doanh nghiệp (Owner) | Cập nhật dữ liệu 10 nhóm trường của doanh nghiệp; tự động ghi `system_audit_logs`. |
| **`API-02-005`** | `POST /api/v1/portal/enterprise/submit-verification` | Doanh nghiệp (Owner) | Nộp hồ sơ đề nghị Sở KH&CN thẩm định cấp Verified Badge (Kiểm tra điều kiện `BR-02-003`). |
| **`API-02-006`** | `GET /api/v1/admin/enterprises/dashboard` | Admin / Cán bộ Sở (`PROVINCIAL_ADMIN`, `SUPER_ADMIN`) | Thống kê phân tích kho CSDL 304 DN theo địa bàn, ngành TT17, phân tầng TNI, top khó khăn. |
| **`API-02-007`** | `POST /api/v1/gov/enterprises/{id}/approve` | Cán bộ Sở (`PROVINCIAL_ADMIN` đúng ScopeId) | Phê duyệt hồ sơ doanh nghiệp cấp tỉnh, cấp Verified Badge và ghi audit log. |
| **`API-02-008`** | `POST /api/v1/gov/enterprises/{id}/reject` | Cán bộ Sở (`PROVINCIAL_ADMIN` đúng ScopeId) | Từ chối hoặc yêu cầu bổ sung hồ sơ kèm lý do. |

### 1.2 Chi Tiết DTO Contracts

#### DTO `EnterprisePublicDirectoryDto`:
```json
{
  "items": [
    {
      "id": "e8112d52-8637-4d95-a52b-2fa7e6bf4455",
      "name": "CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC",
      "taxCode": "2400120030",
      "subjectType": "ENTERPRISE",
      "provinceCity": "Lạng Sơn",
      "mainSectorName": "Nông nghiệp công nghệ cao, nông nghiệp số",
      "sectorCode": "LV05",
      "workforceScale": "50-dưới 100 người",
      "isVerified": true,
      "tniScore": 62.5,
      "tniClassification": "MEDIUM",
      "ipCount": 0,
      "status": "ACTIVE"
    }
  ],
  "totalCount": 304,
  "page": 1,
  "pageSize": 9,
  "totalPages": 34
}
```

#### DTO `EnterprisePublicDetailDto`:
```json
{
  "id": "e8112d52-8637-4d95-a52b-2fa7e6bf4455",
  "name": "CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC",
  "taxCode": "2400120030",
  "subjectType": "ENTERPRISE",
  "establishedDate": null,
  "provinceCity": "Lạng Sơn",
  "addressDetail": "Lạng Sơn",
  "website": null,
  "isVerified": true,
  "mainSectorName": "Nông nghiệp công nghệ cao, nông nghiệp số",
  "ownershipType": "Nhà nước",
  "workforceScale": "50-dưới 100 người",
  "revenueRange": "[BẢO MẬT]",
  "operatingZone": "Ngoài các khu trên",
  "highQualificationRatio": "10–30%",
  "tniScore": 62.5,
  "tniClassification": "MEDIUM",
  "hasRdUnit": false,
  "hasRdBudget": false,
  "isExporting": false,
  "inValueChain": false,
  "topBottlenecks": ["Thiếu vốn", "Thiếu thông tin", "Khó tiếp cận chính sách hỗ trợ"],
  "supportNeeds": ["Hỗ trợ tài chính", "Hỗ trợ đào tạo nhân lực", "Hỗ trợ kết nối đối tác"],
  "projects": [],
  "intellectualProperties": []
}
```

#### DTO `EnterpriseDashboardStatsDto`:
```json
{
  "totalEnterprises": 304,
  "verifiedCount": 304,
  "byProvince": [
    { "province": "Lạng Sơn", "count": 6 },
    { "province": "Hà Nội", "count": 82 }
  ],
  "bySector": [
    { "sector": "Nông nghiệp công nghệ cao, nông nghiệp số", "count": 45 },
    { "sector": "Công nghệ thông tin, chuyển đổi số", "count": 88 }
  ],
  "byTniClassification": [
    { "classification": "HIGH", "count": 52 },
    { "classification": "MEDIUM", "count": 184 },
    { "classification": "LOW", "count": 68 }
  ],
  "topBottlenecks": [
    { "name": "Thiếu vốn", "count": 192 },
    { "name": "Thiếu thông tin", "count": 145 },
    { "name": "Khó tiếp cận chính sách hỗ trợ", "count": 128 }
  ]
}
```

---

## 2. BACKEND ARCHITECTURE PLAN (`SourceCode/backend/`)

### 2.1 Cấu Trúc Thư Mục Module `NacenTech.Modules.Enterprise`
```text
modules/enterprise/NacenTech.Modules.Enterprise/
├── Domain/
│   ├── Enterprise.cs                 # Aggregate Root chính
│   ├── EnterpriseProject.cs          # Thực thể Hoạt động / Dự án ĐMST (1-N)
│   ├── EnterpriseIpAsset.cs          # Thực thể Bằng sáng chế / SHTT (1-N)
│   ├── DemandSurvey.cs               # Thực thể Khảo sát ĐMST & Điểm TNI (304 DN)
│   └── Enums.cs                      # SubjectType, VerificationStatus, TniLevel
├── Application/
│   ├── Contracts/                    # DTOs request/response
│   ├── Queries/                      # GetPublicEnterprises, GetDetail, GetDashboardStats
│   ├── Commands/                     # UpsertProfile, SubmitVerification, ApproveEnterprise
│   └── EnterpriseService.cs          # Nghiệp vụ lõi & BR-02-* validation
├── Infrastructure/
│   ├── Persistence/
│   │   ├── EnterpriseDbContext.cs    # DbContext với Schemas enterprise & demand
│   │   ├── Configurations.cs         # Fluent API mapping & GIN Index
│   │   └── Migrations/               # EF Core Migrations
│   └── Seeders/
│       └── Enterprise304DataSeeder.cs# Tự động nạp seed_304_dn_real_data.sql nếu trống
└── Presentation/
    └── V1Compat/
        └── EnterpriseController.cs   # RESTful Endpoints
```

### 2.2 Schema CSDL PostgreSQL (Hybrid Design)
1. **Bảng `enterprise.enterprises`**:
   - `id` UUID PRIMARY KEY
   - `tax_code` VARCHAR(20) UNIQUE NOT NULL (Index B-Tree)
   - `name` VARCHAR(255) NOT NULL
   - `subject_type` VARCHAR(50) NOT NULL
   - `province_city` VARCHAR(100) NOT NULL (Index B-Tree)
   - `main_sector_name` VARCHAR(255) (Index B-Tree)
   - `ownership_type` VARCHAR(50)
   - `workforce_scale` VARCHAR(50)
   - `revenue_range` VARCHAR(50) (PDPD Protected)
   - `operating_zone` VARCHAR(50)
   - `high_qualification_ratio` VARCHAR(20)
   - `status` VARCHAR(30) DEFAULT 'ACTIVE'
   - `verification_status` VARCHAR(30) DEFAULT 'DRAFT'
   - `created_at`, `updated_at` TIMESTAMPTZ

2. **Bảng `demand.demand_surveys`**:
   - `id` UUID PRIMARY KEY
   - `enterprise_id` UUID REFERENCES `enterprise.enterprises(id)`
   - `survey_code` VARCHAR(50) UNIQUE NOT NULL
   - `survey_year` INT DEFAULT 2024
   - `has_rd_unit`, `has_tech_training`, `has_machinery_upgrade`, `has_rd_budget` BOOLEAN
   - `is_exporting`, `in_value_chain` BOOLEAN
   - `top_bottlenecks` TEXT[]
   - `support_needs` TEXT[]
   - `recommendations` TEXT
   - `tni_score` NUMERIC(5,2)
   - `tni_classification` VARCHAR(20)
   - `survey_answers` JSONB (GIN Index)

---

## 3. FRONTEND ARCHITECTURE PLAN (`SourceCode/frontend/`)

### 3.1 Cấu Trúc Routes & Components
```text
src/app/
├── enterprises/
│   ├── page.tsx                      # MÀN HÌNH 1: Danh bạ tra cứu công khai
│   └── [taxCode]/
│       └── page.tsx                  # MÀN HÌNH 2: Hồ sơ chi tiết công khai (PDPD masked)
├── portal/
│   └── enterprise/
│       └── profile/
│           └── page.tsx              # MÀN HÌNH 3: Kê khai 10 nhóm trường (Owner Workspace)
├── admin/
│   └── enterprises/
│       └── dashboard/
│           └── page.tsx              # MÀN HÌNH 4: Dashboard thống kê 304 DN & TNI
└── gov/
    └── approvals/
        └── enterprises/
            └── page.tsx              # MÀN HÌNH 5: Cổng thẩm định cấp tỉnh (Maker-Checker)
```

### 3.2 Chuẩn Hóa 5 Trạng Thái UX (`<Async>`)
- **Loading**: Skeleton Card cho danh bạ `/enterprises`, Skeleton Tabs cho trang chi tiết.
- **Empty**: Hiển thị illustration rỗng khi bộ lọc không có doanh nghiệp nào phù hợp.
- **Error**: Khung thông báo lỗi thân thiện kèm nút "Thử lại".
- **Success**: Hiển thị dữ liệu trơn tru kèm Verified Badge.
- **Partial**: Phân trang linh hoạt 9 thẻ/trang trên Desktop, Infinite Pagination trên Mobile.

---

## 4. PLAN DELTA V2 (CR-2026-010): THIẾT KẾ KỸ THUẬT NÂNG CẤP DANH BẠ 34 TỈNH TRỌNG ĐIỂM & THÔNG TIN CỐT LÕI

### 4.1 Mở Rộng DTO `EnterprisePublicDirectoryItemDto`
```csharp
public sealed record EnterprisePublicDirectoryItemDto(
    Guid Id,
    string Name,
    string TaxCode,
    string SubjectType,
    string ProvinceCity,
    string MainSectorName,
    string? SectorCode,
    string? WorkforceScale,
    bool IsVerified,
    decimal? TniScore,
    string? TniClassification,
    int IpCount,
    string Status,
    string? OwnershipType,
    string? OperatingZone,
    bool HasRdUnit,
    bool IsExporting,
    bool InValueChain,
    IReadOnlyList<string> TopBottlenecks,
    IReadOnlyList<string> SupportNeeds
);
```

### 4.2 Thiết Kế Chuẩn Hóa Lọc Địa Bàn & Ngành Tại Backend
- **Tỉnh/Thành (`EfEnterpriseRepository.cs`)**:
  - Khi `query.Province` chứa `"hồ chí minh"` hoặc `"tphcm"`:
    `qry = qry.Where(x => x.ProvinceCity.ToLower().Contains("tphcm") || x.ProvinceCity.ToLower().Contains("hồ chí minh"));`
  - Chuẩn hóa Unicode NFC đối với chuỗi tìm kiếm địa phương.
- **Lĩnh vực TT17 (`SectorCode`)**:
  - Ánh xạ từ điển:
    `LV01` $\rightarrow$ `cơ khí, chế tạo, tự động hóa`  
    `LV05` $\rightarrow$ `nông nghiệp`  
    `LV07` $\rightarrow$ `y - dược, sinh học, thiết bị y tế`  
    `LV08` $\rightarrow$ `thông tin, chuyển đổi số`  
    `LV11` $\rightarrow$ `vật liệu`  
    `LV12` $\rightarrow$ `năng lượng, môi trường`  
    `LV14` $\rightarrow$ `điện - điện tử, viễn thông`  
    `LV15` $\rightarrow$ `thực phẩm, đồ uống`  
    `LV16` $\rightarrow$ `dệt may, da giày`  
    `LV17` $\rightarrow$ `logistics`  
    và `chế biến, chế tạo` $\rightarrow$ `LV01`.
  - Truy vấn linh hoạt: `x.SectorCode == query.SectorCode || [khớp từ khóa trong MainSectorName]`.
- **Phân tầng TNI**:
  - Khi lọc `query.TniClassification == "HIGH"`: Khớp cả `x.TniClassification == "HIGH" || x.TniClassification == "VERY_HIGH" || x.TniScore >= 75`.
- **Sắp xếp (`SortBy`)**:
  - Mặc định: `tni_desc` (`TniScore DESC`).
  - `ip_desc`: `IntellectualProperties.Count DESC, TniScore DESC`.
  - `name_asc`: `Name ASC`.
  - `recent`: `CreatedAt DESC`.

### 4.3 Thiết Kế Frontend Enterprise Avatar & Core Card UI
- Component `EnterpriseAvatar`:
  - Input: `name`, `sectorCode`, `mainSectorName`, `taxCode`.
  - Output: Avatar Badge $48 \times 48\text{ px}$, bo tròn `rounded-2xl`, chữ cái đầu in hoa cỡ lớn, huy hiệu icon ngành ở góc nhỏ, màu Gradient theo ngành (Blue cho Cơ khí, Green cho Nông nghiệp, Purple cho CNTT, Emerald cho Môi trường...).
- Phân trang động (Dynamic Pagination Component) có Ellipsis `...`.

