# Technical Plan: TASK-07 Phân Quyền & Năng Lực Quản Trị Admin

**Feature**: `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Version**: 1.12.0  
**Status**: Completed (Shipped Gate 5)  

---

## 1. Kiến Trúc Kỹ Thuật (Architecture & Module Design)

Phân hệ Quản trị Admin và Phê duyệt Phân cấp được tích hợp trực tiếp vào kiến trúc Modular Monolith của `NacenTwinBE`:

```text
SourceCode/backend/
├── modules/
│   └── identity/                          # Quản lý Thực thể Person, Roles, Scopes, Auth
│       ├── Domain/
│       │   ├── Person.cs                  # [ĐÃ NÂNG CẤP]: ScopeType, ScopeId, 10 Roles
│       │   ├── ApprovalRequest.cs         # Hàng đợi thẩm định hồ sơ (Optimistic Lock)
│       │   ├── OrganizationUnit.cs        # Cây đơn vị 3 cấp (Trung ương - Tỉnh - Cơ sở)
│       │   └── ApprovalAuditLog.cs        # Nhật ký kiểm toán bất biến Cấp độ 3
│       ├── Application/
│       │   ├── ApprovalService.cs         # Use cases: Duyệt, Từ chối, Yêu cầu bổ sung
│       │   ├── OrganizationTreeService.cs # Use cases: Quản trị cây tổ chức & khởi tạo Sở
│       │   └── Contracts.cs               # DTOs & Validation Rules
│       └── Infrastructure/
│           └── Persistence/Configurations.cs # EF Core Entity Mapping & PostgreSQL Indexes
└── apps/
    └── api/
        └── Controllers/
            ├── ApprovalController.cs       # Endpoints duyệt 5 luồng nghiệp vụ
            └── OrganizationUnitController.cs# Endpoints quản trị cây đơn vị 63 tỉnh
```

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (Database Schema - Non-Destructive)

### 2.1. Bảng Hàng Đợi Phê Duyệt (`approval_requests`)
```sql
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES persons(id),
    request_type VARCHAR(50) NOT NULL, -- 'ACCOUNT', 'SHOP', 'EXPERT', 'DEMAND', 'INSTITUTION'
    scope_type VARCHAR(50) NOT NULL,    -- 'GLOBAL', 'PROVINCE', 'SECTOR', 'ORG_UNIT'
    scope_id VARCHAR(100) NULL,         -- 'HN', 'SG', 'CNTT', hoặc UUID Viện
    payload_json JSONB NOT NULL,        -- Dữ liệu ĐKKD, LLKH, bài toán nhu cầu
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'
    version INT NOT NULL DEFAULT 1,     -- Optimistic Locking Column
    assigned_officer_id UUID NULL REFERENCES persons(id),
    reviewed_by_id UUID NULL REFERENCES persons(id),
    review_note TEXT NULL,
    sla_deadline_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approval_scope ON approval_requests(scope_type, scope_id, status);
CREATE INDEX idx_approval_sla ON approval_requests(status, sla_deadline_utc);
```

### 2.2. Bảng Cây Đơn Vị Hành Chính & Cơ Sở Liên Kết (`organization_units`)
```sql
CREATE TABLE organization_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,   -- 'SO-KHCN-HN', 'DH-BACHKHOA-HN'
    name VARCHAR(255) NOT NULL,
    unit_type VARCHAR(30) NOT NULL,     -- 'NATIONAL', 'PROVINCIAL', 'INSTITUTION'
    parent_id UUID NULL REFERENCES organization_units(id),
    province_id VARCHAR(10) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_org_parent ON organization_units(parent_id);
```

### 2.3. Bảng Nhật Ký Kiểm Toán Bất Biến (`approval_audit_logs`)
```sql
CREATE TABLE approval_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID NOT NULL REFERENCES persons(id),
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,       -- 'APPROVE_SHOP', 'REJECT_EXPERT', 'INIT_PROVINCE_ADMIN'
    target_entity VARCHAR(50) NOT NULL, -- 'approval_requests', 'organization_units'
    target_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    details_json JSONB NULL,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON approval_audit_logs(actor_id, created_at_utc);
```

---

## 3. API Contracts (Contract-First Design)

### 3.1. Hàng Đợi Thẩm Định Hồ Sơ Phân Cấp
- **Endpoint**: `GET /api/v1/governance/approvals`
- **Quyền hạn**: `PROVINCE_OFFICER`, `PROVINCE_LEADER`, `SECTOR_SPECIALIST`, `SECTOR_LEADER`, `NACEN_ADMIN`, `SUPER_ADMIN`.
- **Query Params**: `type`, `status`, `page`, `page_size`.
- **Logic**: Tự động áp dụng Row-Level Security theo `ICurrentActor.ScopeType` và `ScopeId`.

### 3.2. Phê Duyệt / Từ Chối Hồ Sơ (Optimistic Locking)
- **Endpoint**: `PUT /api/v1/governance/approvals/{id}/review`
- **Request Body**:
  ```json
  {
    "action": "APPROVE", 
    "expectedVersion": 1,
    "reviewNote": "Hồ sơ ĐKKD hợp lệ, mã số thuế khớp cơ sở dữ liệu quốc gia."
  }
  ```
- **Responses**:
  - `200 OK`: Duyệt thành công, cập nhật trạng thái và trả về `newVersion = 2`.
  - `409 Conflict`: Hồ sơ đã bị cán bộ khác xử lý trước đó (`ERR_RECORD_ALREADY_MODIFIED`).
  - `422 Unprocessable Entity`: Từ chối mà không nhập lý do $\ge 10$ ký tự.

---

## 4. Frontend UI/UX Standards (5 Trạng Thái UX qua `<Async>`)

1. **Empty State**: Khi hàng đợi của Tỉnh/Ngành không còn hồ sơ nào cần duyệt $\rightarrow$ Hiển thị hình minh họa hòm thư xanh kèm thông điệp: *"Hiện không có hồ sơ nào cần phê duyệt trên địa bàn/ngành của bạn."*
2. **Loading State**: Sử dụng Table Skeleton Shimmer cho bảng danh sách hồ sơ; nút bấm hành động chuyển Spinner và khóa click để chống nhấn đúp.
3. **Error State**: Nếu phát sinh lỗi 409 Conflict $\rightarrow$ Hiển thị Toast đỏ: *"Hồ sơ này đã được một cán bộ khác xử lý trước đó. Hệ thống đang tự động tải lại danh sách mới nhất."*
4. **Success State**: Khi phê duyệt thành công $\rightarrow$ Toast xanh lá 3 giây: *"Đã phê duyệt hồ sơ thành công và chuyển trạng thái hoạt động cho chủ thể."*
5. **Partial State**: Hiển thị cảnh báo vàng nếu kết nối mạng chập chờn khi đang tải tài liệu scan đính kèm.

---

## 5. Plan Delta v4: Phân Cấp Phê Duyệt Chuyên Gia Cho Cấp 2 & Trung Ương Hậu Kiểm

### 5.1. Backend Architecture & Contract Delta
1. **Mở rộng `SubmitExpertUpgradeRequest`**:
   - Bổ sung `string? ScopeType` (mặc định `"PROVINCE"`) và `string? ScopeId` (mã tỉnh, ví dụ: `"HP"`, `"HN"`, `"HCM"`).
   - Trong `ExpertService.SubmitUpgradeAsync`: Sau khi lưu `ExpertProfile`, đồng bộ tạo một `ApprovalRequest` loại `EXPERT` vào hàng đợi duyệt phân cấp với đúng `ScopeType`, `ScopeId`, và SLA 48h.
2. **Hỗ trợ Action `REVOKE_EXPERT` trong `ApprovalService`**:
   - Cho phép `SUPER_ADMIN` thu hồi quyết định phê duyệt chuyên gia nếu phát hiện sai phạm.
   - Khi `REVOKE_EXPERT`: Chuyển trạng thái hồ sơ sang `REJECTED`, hạ cấp quyền tài khoản `Person` về `PUBLIC_USER`, và ghi vết `ApprovalAuditLog` hành vi `REVOKE_EXPERT` kèm lý do.

### 5.2. Frontend UI/UX Surface Delta
1. **Wizard Nâng Cấp Chuyên Gia (`/profile/upgrade/expert`)**:
   - Bổ sung Select Box: *"Cơ quan / Sở KH&CN tiếp nhận thẩm định"* với danh sách 34 tỉnh thành trọng điểm KH&CN và NacenTech Trung ương.
   - Mặc định đề xuất Sở KH&CN theo địa bàn cư trú/công tác của chuyên gia.
2. **Cổng Tác Nghiệp Cấp 2 (`/gov`)**:
   - Chuyển đổi bảng Mockup thành Hàng đợi duyệt sống kết nối API `/api/v1/approvals`.
   - Lọc tự động theo `ScopeId` của Cán bộ Sở (Row-Level Security).
   - Review Modal chi tiết thông tin hồ sơ chuyên gia, nút [Phê duyệt cấp tỉnh] (`APPROVE`) và [Từ chối] (`REJECT`, validate $\ge 10$ ký tự).
3. **Trung Ương Hậu Kiểm (`/admin/approvals`)**:
   - Bổ sung bộ lọc hồ sơ theo Tỉnh/Địa bàn cho Super Admin.


---

## 6. Plan Delta v5: Vận Hành Cây Hành Chính 3 Cấp Online & Full CRUD (CR-2026-006)

### 6.1. Backend Architecture & Contracts Delta
1. **Mở rộng `Contracts.cs`**:
   - Bổ sung record `UpdateOrganizationUnitCommand(string Name, string? ProvinceId)`.
   - Bổ sung vào interface `IOrganizationTreeService`:
     - `Task<OrganizationUnitDto> UpdateUnitAsync(Guid id, UpdateOrganizationUnitCommand cmd, ICurrentActor actor, string ipAddress, CancellationToken ct);`
     - `Task DeactivateUnitAsync(Guid id, ICurrentActor actor, string ipAddress, CancellationToken ct);`
2. **Triển khai `OrganizationTreeService.cs`**:
   - `UpdateUnitAsync`: Kiểm tra quyền quản trị (`SuperAdmin`, `OperatorAdmin`, `Admin`), tìm đơn vị theo `id`, gọi `unit.Update(cmd.Name, cmd.ProvinceId)`, ghi `ApprovalAuditLog` (`UPDATE_ORG_UNIT`), gọi `uow.CommitAsync`.
   - `DeactivateUnitAsync`:
     - Kiểm tra quyền quản trị (`SuperAdmin`, `OperatorAdmin`, `Admin`).
     - Tìm đơn vị theo `id`.
     - **Cưỡng chế quy tắc `BR-TREE-003`**: Kiểm tra trong CSDL xem có node con nào có `ParentId == id && Status == OrganizationUnitStatuses.Active`. Nếu có, ném `ConflictException("Không thể vô hiệu hóa đơn vị khi còn cơ sở con trực thuộc đang hoạt động. Vui lòng vô hiệu hóa các cơ sở con trước.")`.
     - Chuyển `unit.Deactivate()`, ghi `ApprovalAuditLog` (`DEACTIVATE_ORG_UNIT`), gọi `uow.CommitAsync`.
   - **Tự động Seed dữ liệu gốc (Auto-Seed Baseline)**: Trong `GetOrgTreeAsync`: Nếu bảng `identity.organization_units` rỗng (`Count == 0`), tự động nạp node gốc Trung ương (`NACENTECH-CENTRAL`) và các Sở Tỉnh mẫu (Hà Nội, TP.HCM, Hải Phòng, Đà Nẵng, Bắc Ninh) cùng Viện nghiên cứu cơ sở để người dùng có ngay cây thực tế khi truy cập lần đầu.
3. **Mở rộng `OrganizationUnitController` (`GovernanceControllers.cs`)**:
   - `PUT /api/v1/governance/org-units/{id:guid}`: Nhận `UpdateOrganizationUnitCommand`, gọi `UpdateUnitAsync`, trả về `200 OK`.
   - `DELETE /api/v1/governance/org-units/{id:guid}`: Gọi `DeactivateUnitAsync`, trả về `200 OK` (soft delete / vô hiệu hóa). Trả về `409 Conflict` nếu vi phạm `BR-TREE-003`.

### 6.2. Frontend UI/UX Surface Delta
1. **Loại bỏ Mock Tĩnh**: Xóa bỏ hoàn toàn mảng `INITIAL_ORG_TREE` trong `SourceCode/frontend/src/app/admin/org-tree/page.tsx`.
2. **Tích hợp API Thực Tế**:
   - Tải danh sách cây tổ chức từ `GET /api/v1/governance/org-units/tree`.
   - Hiển thị theo chuẩn 5 trạng thái UX qua `<Async>` (Loading Skeleton, Empty State khi chưa có dữ liệu, Error State kèm nút Thử lại, Success State hiển thị cây 3 tầng phân cấp).
3. **Thao Tác CRUD Trực Quan**:
   - **Thêm đơn vị (POST)**: Modal thêm đơn vị hỗ trợ chọn cấp bậc (Sở Tỉnh Cấp 2 hoặc Cơ sở Cấp 3) và chọn đơn vị cha (`ParentId`).
   - **Sửa đơn vị (PUT)**: Nút "Chỉnh sửa" mở modal cho phép sửa Tên đơn vị và Mã tỉnh liên kết.
   - **Vô hiệu hóa / Xóa (DELETE)**: Nút "Vô hiệu hóa" mở modal xác nhận cảnh báo an toàn. Nếu backend trả về 409 Conflict (`BR-TREE-003`), hiển thị banner cảnh báo đỏ rõ ràng.

---

## 7. Plan Delta v7 (CR-2026-020): Trung Tâm Phê Duyệt Toàn Quốc & Năng Lực Vượt Cấp (Admin Override)

### 7.1. Clean Architecture & Domain Design
Áp dụng mẫu thiết kế DDD & Clean Architecture trong Modular Monolith `NacenTwinBE`:

```text
SourceCode/backend/modules/identity/
├── Domain/
│   ├── ApprovalRequest.cs            # Mở rộng trường Override, SLA và State Machine
│   ├── Events/
│   │   └── ApprovalOverriddenDomainEvent.cs # Domain Event khi thực hiện override
│   └── Specifications/
│       └── CentralApprovalQueueSpecification.cs # Spec lọc 63 tỉnh & SLA
├── Application/
│   ├── DTOs/
│   │   ├── OverrideApprovalCommand.cs
│   │   ├── ApprovalQueueQueryFilter.cs
│   │   └── CentralApprovalItemDto.cs
│   └── Services/
│       ├── IApprovalService.cs        # Thêm method GetCentralApprovalQueue & OverrideApprove
│       └── ApprovalService.cs
├── Infrastructure/
│   ├── Persistence/
│   │   └── Configurations.cs          # Mapping Concurrency Token (xmin/RowVersion) & Indexes
│   └── BackgroundJobs/
│       └── ApprovalSlaMonitorWorker.cs # Background Worker quét SLA 72 working hours (15 phút/lần)
└── API (apps/api/Controllers)/
    └── ApprovalController.cs          # Endpoints: GET central-queue & POST {id}/override
```

#### 1. Mở rộng Entity `ApprovalRequest` & State Machine
- Thêm các trường dữ liệu:
  ```csharp
  public bool IsOverride { get; private set; } = false;
  public string? OverrideReason { get; private set; }
  public Guid? OverriddenByUserId { get; private set; }
  public DateTimeOffset? OverriddenAt { get; private set; }
  public bool IsSlaBreached { get; private set; } = false;
  public double SlaOverdueHours { get; private set; } = 0;
  public bool IsNationalPriority { get; private set; } = false;
  public uint RowVersion { get; private set; } // Map tới xmin của PostgreSQL
  ```
- **Phương thức Domain Invariant & State Transition**:
  ```csharp
  public void ExecuteAdminOverride(Guid actorId, string actorRole, string reason, bool confirmCommitment, DateTimeOffset now)
  {
      if (actorRole != "SUPER_ADMIN" && actorRole != "OPERATOR_ADMIN")
          throw new UnauthorizedAccessException("Chỉ SuperAdmin hoặc OperatorAdmin mới có quyền phê duyệt vượt cấp.");

      if (Status != ApprovalStatuses.PendingReview && Status != ApprovalStatuses.PendingApproval)
          throw new InvalidOperationException($"Không thể can thiệp hồ sơ ở trạng thái {Status}.");

      if (!IsSlaBreached && !IsNationalPriority)
          throw new InvalidOperationException("Chỉ được duyệt vượt cấp khi hồ sơ đã quá hạn SLA cấp Sở (>72h làm việc) hoặc có cờ trọng điểm Quốc gia.");

      if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 20)
          throw new ArgumentException("Lý do can thiệp giải trình bắt buộc phải có độ dài tối thiểu 20 ký tự.");

      if (!confirmCommitment)
          throw new ArgumentException("Bắt buộc phải tích chọn cam kết trách nhiệm giải trình trước Bộ KH&CN.");

      IsOverride = true;
      OverrideReason = reason.Trim();
      OverriddenByUserId = actorId;
      OverriddenAt = now;
      Status = ApprovalStatuses.Approved;
      UpdatedAt = now;
      Version++;

      AddDomainEvent(new ApprovalOverriddenDomainEvent(
          Id, actorId, actorRole, ScopeType, ScopeId, OverrideReason, now));
  }

  public void MarkSlaBreached(double overdueHours, DateTimeOffset now)
  {
      if (!IsSlaBreached)
      {
          IsSlaBreached = true;
          SlaOverdueHours = Math.Max(0, overdueHours);
          UpdatedAt = now;
      }
  }
  ```

#### 2. Domain Event `ApprovalOverriddenDomainEvent`
```csharp
public sealed record ApprovalOverriddenDomainEvent(
    Guid RequestId,
    Guid ActorId,
    string ActorRole,
    string ScopeType,
    string? ScopeId,
    string Reason,
    DateTimeOffset OverriddenAt
) : IDomainEvent;
```

---

### 7.2. Infrastructure, Database Migration & Concurrency Token Design

#### 1. Migration EF Core Phi Phá Hủy (`Add_Approval_Override_And_Sla_Fields`)
Toàn bộ các cột bổ sung đều có giá trị mặc định (Default Value) an toàn hoặc chấp nhận Nullable, tuyệt đối không gây lock bảng lâu hoặc làm gián đoạn hệ thống đang chạy:

```sql
-- Migration: Add_Approval_Override_And_Sla_Fields (Idempotent DDL)
ALTER TABLE approval_requests
    ADD COLUMN IF NOT EXISTS is_override BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS override_reason TEXT NULL,
    ADD COLUMN IF NOT EXISTS overridden_by_user_id UUID NULL REFERENCES persons(id),
    ADD COLUMN IF NOT EXISTS overridden_at_utc TIMESTAMP WITH TIME ZONE NULL,
    ADD COLUMN IF NOT EXISTS is_sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sla_overdue_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_national_priority BOOLEAN NOT NULL DEFAULT FALSE;

-- Chỉ mục tối ưu hóa cho Trung tâm Phê duyệt Toàn quốc & Cảnh báo SLA
CREATE INDEX IF NOT EXISTS idx_approval_sla_breach 
    ON approval_requests(is_sla_breached, status) 
    WHERE is_sla_breached = TRUE;

CREATE INDEX IF NOT EXISTS idx_approval_central_queue 
    ON approval_requests(scope_type, scope_id, request_type, status, created_at_utc);
```

#### 2. Optimistic Concurrency Control (Chặn Race Condition khi Cán bộ Sở & Admin cùng duyệt)
- Sử dụng cơ chế Concurrency Token kết hợp `xmin` của PostgreSQL và trường `version` trong EF Core:
```csharp
// Trong IdentityDbContext / Configurations.cs
builder.Entity<ApprovalRequest>(b =>
{
    b.ToTable("approval_requests");
    b.Property(x => x.RowVersion).IsRowVersion(); // Npgsql map trực tiếp tới system column xmin
    b.Property(x => x.Version).IsConcurrencyToken();
});
```
- Khi Cán bộ Sở và SuperAdmin cùng mở 1 hồ sơ và cùng bấm xác nhận tại cùng 1 mili-giây:
  1. Transaction của người submit trước được commit thành công, thay đổi `status = 'APPROVED'` và làm tăng `xmin` trên PostgreSQL row.
  2. Transaction của người submit sau gửi kèm `expectedVersion` cũ hoặc EF Core phát hiện giá trị `xmin` đã thay đổi $\rightarrow$ Ném ngoại lệ `DbUpdateConcurrencyException`.
  3. Tầng Application bắt ngoại lệ này và trả về HTTP `409 Conflict` (`ERR_RECORD_ALREADY_MODIFIED`) kèm thông báo rõ ràng: *"Hồ sơ này vừa được Cán bộ Sở/Admin khác xử lý. Vui lòng tải lại dữ liệu mới nhất."*

---

### 7.3. Application Layer Contracts & Services

#### 1. DTOs & Validation
```csharp
public sealed record OverrideApprovalCommand(
    [Required, MinLength(20, ErrorMessage = "Lý do can thiệp giải trình phải từ 20 ký tự trở lên")]
    string OverrideReason,
    [Required]
    bool ConfirmCommitment,
    [Required]
    int ExpectedVersion
);

public sealed record ApprovalQueueQueryFilter(
    string? ProvinceId,
    string? RequestType,
    string? SlaStatus, // 'ALL', 'NORMAL', 'WARNING', 'BREACHED'
    string? SearchTerm,
    int Page = 1,
    int PageSize = 20
);

public sealed record CentralApprovalItemDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string RequestType,
    string ScopeType,
    string? ScopeId,
    string? ProvinceName,
    string Status,
    int Version,
    bool IsSlaBreached,
    double SlaOverdueHours,
    bool IsOverride,
    string? OverrideReason,
    DateTimeOffset SlaDeadlineUtc,
    DateTimeOffset CreatedAtUtc
);
```

#### 2. Service Logic trong `ApprovalService.cs`
- `GetCentralApprovalQueueAsync(ApprovalQueueQueryFilter filter, ICurrentActor actor, CancellationToken ct)`:
  - Kiểm tra quyền: Bắt buộc Actor có vai trò `SUPER_ADMIN` hoặc `OPERATOR_ADMIN` (Tầng 0).
  - Áp dụng Specification: Cho phép xem toàn bộ hồ sơ toàn quốc (`Scope = GLOBAL`), lọc theo `ProvinceId` (63 tỉnh), `RequestType`, và trạng thái SLA (`is_sla_breached`).
- `OverrideApproveAsync(Guid id, OverrideApprovalCommand cmd, ICurrentActor actor, string ipAddress, CancellationToken ct)`:
  - Bắt buộc kiểm tra quyền Tầng 0.
  - Lấy entity `ApprovalRequest` theo `id`. Nếu không thấy $\rightarrow$ ném `NotFoundException`.
  - Kiểm tra `request.Version == cmd.ExpectedVersion`. Nếu khác $\rightarrow$ ném `ConflictException("ERR_RECORD_ALREADY_MODIFIED")`.
  - Thực thi phương thức domain `request.ExecuteAdminOverride(actor.Id, actor.Role, cmd.OverrideReason, cmd.ConfirmCommitment, DateTimeOffset.UtcNow)`.
  - Ghi bản ghi Audit Log bất biến vào `approval_audit_logs`:
    - `Action`: `"ADMIN_OVERRIDE_APPROVE"`
    - `TargetEntity`: `"approval_requests"`
    - `TargetId`: `id.ToString()`
    - `DetailsJson`: `{"reason": cmd.OverrideReason, "overriddenBy": actor.Id, "scopeId": request.ScopeId}`
  - Commit Unit of Work. Xử lý bắt `DbUpdateConcurrencyException` chuyển thành HTTP `409 Conflict`.

---

### 7.4. Background Service: `ApprovalSlaMonitorWorker`
- **Chu kỳ thực thi**: 15 phút một lần (`PeriodicTimer(TimeSpan.FromMinutes(15))`).
- **Thuật toán tính toán Giờ làm việc (Working Hours Calculation)**:
  - Định nghĩa khung giờ làm việc: 08:00 - 17:00 (8 tiếng làm việc/ngày, nghỉ trưa 12:00 - 13:00) từ Thứ Hai đến Thứ Sáu.
  - Loại trừ Thứ Bảy, Chủ Nhật và các ngày nghỉ lễ quốc gia cố định theo quy định Bộ LĐTBXH.
  - Hàm `CalculateWorkingHours(DateTimeOffset startUtc, DateTimeOffset endUtc)` tính chính xác tổng số giờ làm việc thực tế đã trôi qua.
- **Quy trình quét**:
  1. Truy vấn các `approval_requests` có `status IN ('PENDING_REVIEW', 'PENDING_APPROVAL')` và `is_sla_breached = FALSE`.
  2. Với từng bản ghi, tính `workingHoursPassed = CalculateWorkingHours(r.CreatedAtUtc, DateTimeOffset.UtcNow)`.
  3. Nếu `workingHoursPassed > 72.0`:
     - Gọi `r.MarkSlaBreached(workingHoursPassed - 72.0, DateTimeOffset.UtcNow)`.
  4. Lưu theo batch cập nhật CSDL.
  5. Bắn notification cảnh báo tới Cán bộ Sở phụ trách và đẩy số liệu lên Admin Dashboard.

---

### 7.5. API Endpoints Specification
1. **`GET /api/v1/admin/approvals/central-queue`**:
   - **Quyền hạn**: `SUPER_ADMIN`, `OPERATOR_ADMIN` (Policy: `RequireGlobalAdmin`).
   - **Query Params**: `provinceId`, `requestType`, `slaStatus`, `searchTerm`, `page`, `pageSize`.
   - **Response**: `200 OK` danh sách phân trang `PagedResult<CentralApprovalItemDto>`.
2. **`POST /api/v1/admin/approvals/{id}/override`**:
   - **Quyền hạn**: `SUPER_ADMIN`, `OPERATOR_ADMIN` (Policy: `RequireGlobalAdmin`).
   - **Body**: `OverrideApprovalCommand`.
   - **Responses**:
     - `200 OK`: Duyệt can thiệp thành công, trả về trạng thái `APPROVED` và `version` mới.
     - `400 / 422`: Vi phạm điều kiện nghiệp vụ (lý do < 20 ký tự, chưa quá hạn SLA/ưu tiên quốc gia, chưa tích cam kết).
     - `403 Forbidden`: Cán bộ cấp Sở cố tình gọi endpoint vượt cấp.
     - `404 NotFound`: Không tìm thấy mã hồ sơ.
     - `409 Conflict`: Hồ sơ đã bị cập nhật bởi cán bộ khác trước đó.

---

### 7.6. Kế Hoạch Kiến Trúc Delta v5: GovSidebarNav & Cấu Trúc Điều Hướng Cổng Sở KH&CN (`/gov`)

#### 1. Nguyên Tắc Thiết Kế Giao Diện
- Tách biệt logic điều hướng thành component độc lập: `GovSidebarNav` đặt tại `SourceCode/frontend/src/app/gov/layout.tsx` (hoặc module hóa tại `SourceCode/frontend/src/components/gov/gov-sidebar-nav.tsx`).
- Bố cục:
  - Cột trái: `aside` chứa `GovSidebarNav` (`w-72`, `sticky top-0 h-screen`, `border-r border-slate-200 dark:border-slate-800`, `bg-white dark:bg-slate-900`).
  - Cột phải: `main` chứa phần nội dung trang (`flex-1 min-w-0 bg-slate-50 dark:bg-slate-950`).
- Tích hợp 4 nhóm Accordion mở mặc định bằng `useState<Record<string, boolean>>`:
  - `group1: true` (Kiểm duyệt hồ sơ địa bàn)
  - `group2: true` (Thẩm định công nghệ TT17)
  - `group3: true` (Giám sát cung-cầu & SLA)
  - `group4: true` (Quản trị công vụ & nhân sự Sở)
- Hỗ trợ mobile/tablet: Hamburger toggle để mở Drawer trượt từ bên trái.

#### 2. Phân Tầng Scoped Token & Breadcrumb
- Lấy thông tin người dùng từ `authClient.getUser()`:
  - `user.fullName` / `user.email`
  - `user.platformRole`: `PROVINCIAL_ADMIN` (hoặc `PROVINCE_OFFICER`, `PROVINCE_LEADER`)
  - `user.scopeType`: `PROVINCE`
  - `user.scopeId`: Mã tỉnh (`HN`, `SG`, `HP`...)
- Ánh xạ mã tỉnh sang tên đầy đủ: `HN` $\rightarrow$ `Sở KH&CN Hà Nội`, `SG` $\rightarrow$ `Sở KH&CN TP.HCM`, v.v.
- Badge tiêu đề và Header bar chuẩn hóa Maker-Checker 2 cấp, phản ánh đúng thẩm quyền ký duyệt Cấp 2 của Lãnh đạo Sở.

---

## 8. Plan Delta v8 (CR-2026-021): Tinh Gọn Điều Hướng Breadcrumbs & Reactive URL State Engine

### 8.1. Bối Cảnh Kỹ Thuật & Vấn Đề Cần Giải Quyết
Trong đợt nâng cấp giao diện Quản trị Admin vừa qua (`CR-2026-020`), thanh điều hướng bên trái `AdminSidebarNav` đã được tích hợp đầy đủ cấu trúc Accordion 4 nhóm 8 phân hệ chuẩn wireframe. Tuy nhiên, hai vấn đề kỹ thuật phát sinh gây ảnh hưởng nghiêm trọng đến trải nghiệm vận hành:
1. **Trùng lặp thanh điều hướng (Redundant Navigation)**: Các trang con vẫn giữ nguyên thanh ngang `<AdminNav />` (`admin-nav.tsx`) chiếm 15% diện tích chiều dọc vô ích, chứa các liên kết nội bộ dev (`/dashboard`) gây phân tán người dùng và làm sai lệch chỉ dẫn của Sidebar.
2. **Lỗi bất đồng bộ URL State (URL State Desynchronization)**: Khi người dùng nhấp vào các menu con trên Sidebar (`/admin/approvals?tab=sla` hoặc `/admin/approvals?tab=override`), trang `/admin/approvals` không tự động chuyển đổi tab do đang sử dụng `window.history.pushState` và `window.addEventListener('popstate')` thay vì cơ chế Reactive hook chuẩn của Next.js App Router (`useSearchParams()`). Người dùng buộc phải ấn F5 mới cập nhật dữ liệu.
3. **Phân mảnh danh mục địa phương**: Bảng hàng duyệt và cây tổ chức đang tự định nghĩa mảng hardcode 63 tỉnh/thành phố (`PROVINCES_63`), vi phạm trực tiếp quy tắc kiến trúc `BR-ADMIN-34PROV` về tập trung quản trị trên 34 Tỉnh/Thành phố trọng điểm ĐMST.

### 8.2. Thiết Kế Kiến Trúc Thành Phần Frontend

#### 1. Component `AdminBreadcrumbs` Tái Sử Dụng
- **Vị trí tệp**: `SourceCode/frontend/src/components/admin/admin-breadcrumbs.tsx`.
- **Nguyên tắc thiết kế**: Tuân thủ nghiêm ngặt chuẩn tiếp cận WAI-ARIA breadcrumb pattern (`<nav aria-label="Breadcrumb">`, `<ol>`, `<li>`).
- **TypeScript Interface**:
  ```typescript
  export interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  export interface AdminBreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
  }
  ```
- **Hành vi & Layout**:
  - Node gốc luôn là biểu tượng `Home` (`lucide-react`) liên kết về Cổng Portal `/`.
  - Phân cách giữa các cấp bằng icon `ChevronRight` (`w-3.5 h-3.5 text-slate-300 dark:text-slate-600`).
  - Các node trung gian (như `Quản Trị Hệ Thống`) là thẻ `<Link href="/admin">` với hiệu ứng hover màu thương hiệu `hover:text-brand-600`.
  - Node cuối cùng (trang hiện tại) hiển thị dạng văn bản `font-semibold text-slate-800 dark:text-slate-200` có thuộc tính `aria-current="page"`.

#### 2. Kế Hoạch Dọn Dẹp `<AdminNav />` Trên 6 Trang Quản Trị
Gỡ bỏ hoàn toàn việc import và render component `<AdminNav />` trên 6 trang quản trị, thay thế bằng `<AdminBreadcrumbs />` với mảng items tương ứng:
1. `/admin/approvals` (`SourceCode/frontend/src/app/admin/approvals/page.tsx`):
   `items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Hàng Đợi Phê Duyệt Toàn Quốc" }]}`
2. `/admin/roles` (`SourceCode/frontend/src/app/admin/roles/page.tsx`):
   `items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Quản Lý 10 Vai Trò" }]}`
3. `/admin/org-tree` (`SourceCode/frontend/src/app/admin/org-tree/page.tsx`):
   `items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Cây Thư Mục 34 Tỉnh/Thành" }]}`
4. `/admin/sectors` (`SourceCode/frontend/src/app/admin/sectors/page.tsx`):
   `items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Danh Mục Lĩnh Vực & TT17" }]}`
5. `/admin/audit-logs` (`SourceCode/frontend/src/app/admin/audit-logs/page.tsx`):
   `items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Nhật Ký Kiểm Toán Cấp Độ 3" }]}`
6. `/admin/system-config` (`SourceCode/frontend/src/app/admin/system-config/page.tsx`):
   `items={[{ label: "Trang chủ", href: "/" }, { label: "Quản Trị Hệ Thống", href: "/admin" }, { label: "Cấu Hình Hệ Thống & Tham Số SLA" }]}`
- **Lưu ý dọn dẹp**: Xóa bỏ các liên kết dev `/dashboard` ("Agent Orchestrator & CR") khỏi giao diện người dùng. Giữ lại file `admin-nav.tsx` hoặc chuyển đổi an toàn thành wrapper nếu còn module cũ phụ thuộc.

#### 3. Reactive URL State Engine cho `approvals/page.tsx`
- **Hook tích hợp**: Sử dụng `useSearchParams()` và `useRouter()` từ `next/navigation`.
- **Cơ chế đồng bộ hai chiều (Two-Way Reactive Synchronization)**:
  ```typescript
  // 1. Đọc reactive state từ Next.js App Router query params
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab")?.toLowerCase();
  const navTab = useMemo<"all" | "sla" | "override">(() => {
    if (tabParam === "sla" || tabParam === "override") return tabParam;
    return "all";
  }, [tabParam]);

  // 2. Chuyển tab trên giao diện mà không làm mất các filter khác
  const handleSwitchNavTab = useCallback((tab: "all" | "sla" | "override") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.set("page", "1"); // Tự động reset về trang 1
    const queryString = params.toString();
    router.push(queryString ? `/admin/approvals?${queryString}` : "/admin/approvals", { scroll: false });
  }, [router, searchParams]);
  ```
- **Bảo Vệ Client Deopt Bằng `<Suspense>`**:
  Theo tiêu chuẩn của Next.js App Router, việc truy cập `useSearchParams()` trong Client Component cần được bọc trong ranh giới `<Suspense>`.
  - Tách logic trang thành `AdminApprovalsContent`.
  - Export chính của trang:
    ```typescript
    export default function AdminApprovalsPage() {
      return (
        <Suspense fallback={<AdminApprovalsSkeleton />}>
          <AdminApprovalsContent />
        </Suspense>
      );
    }
    ```
- **Kết quả đạt được**:
  - Khi Admin nhấp link trên Sidebar (`/admin/approvals?tab=sla`), `useSearchParams` lập tức kích hoạt re-render, tab chuyển sang "Cảnh báo Quá hạn SLA Sở Tỉnh" trong 0ms mà không reload trang.
  - Khi bấm nút tab trên UI, URL đồng bộ ngay lập tức, hỗ trợ copy-paste link ca trực có chứa trạng thái `tab`, `provinceFilter`.

#### 4. Danh Mục 34 Tỉnh/Thành Phố Trọng Điểm ĐMST Dùng Chung (`PROVINCES_34`)
- **Vị trí tệp**: `SourceCode/frontend/src/lib/constants/provinces.ts`.
- **Đặc tả dữ liệu**: Căn cứ tuyệt đối theo quy tắc `BR-ADMIN-34PROV` (Bắc 12, Trung & Tây Nguyên 10, Nam 12):
  ```typescript
  export interface ProvinceItem {
    code: string;
    name: string;
    fullName: string;
    region: "BAC" | "TRUNG_TAY_NGUYEN" | "NAM" | "ALL";
  }

  export const PROVINCES_34: ProvinceItem[] = [
    { code: "ALL", name: "Toàn quốc (34 Tỉnh/Thành phố trọng điểm ĐMST)", fullName: "Toàn quốc (34 Tỉnh/Thành phố trọng điểm ĐMST)", region: "ALL" },
    // Miền Bắc (12)
    { code: "HN", name: "Hà Nội", fullName: "Sở KH&CN TP. Hà Nội", region: "BAC" },
    { code: "HP", name: "Hải Phòng", fullName: "Sở KH&CN TP. Hải Phòng", region: "BAC" },
    { code: "BN", name: "Bắc Ninh", fullName: "Sở KH&CN Tỉnh Bắc Ninh", region: "BAC" },
    { code: "QN", name: "Quảng Ninh", fullName: "Sở KH&CN Tỉnh Quảng Ninh", region: "BAC" },
    { code: "HY", name: "Hưng Yên", fullName: "Sở KH&CN Tỉnh Hưng Yên", region: "BAC" },
    { code: "TNG", name: "Thái Nguyên", fullName: "Sở KH&CN Tỉnh Thái Nguyên", region: "BAC" },
    { code: "PT", name: "Phú Thọ", fullName: "Sở KH&CN Tỉnh Phú Thọ", region: "BAC" },
    { code: "NB", name: "Ninh Bình", fullName: "Sở KH&CN Tỉnh Ninh Bình", region: "BAC" },
    { code: "CB", name: "Cao Bằng", fullName: "Sở KH&CN Tỉnh Cao Bằng", region: "BAC" },
    { code: "TQ", name: "Tuyên Quang", fullName: "Sở KH&CN Tỉnh Tuyên Quang", region: "BAC" },
    { code: "LCA", name: "Lào Cai", fullName: "Sở KH&CN Tỉnh Lào Cai", region: "BAC" },
    { code: "LS", name: "Lạng Sơn", fullName: "Sở KH&CN Tỉnh Lạng Sơn", region: "BAC" },
    // Miền Trung & Tây Nguyên (10)
    { code: "TH", name: "Thanh Hóa", fullName: "Sở KH&CN Tỉnh Thanh Hóa", region: "TRUNG_TAY_NGUYEN" },
    { code: "NA", name: "Nghệ An", fullName: "Sở KH&CN Tỉnh Nghệ An", region: "TRUNG_TAY_NGUYEN" },
    { code: "HT", name: "Hà Tĩnh", fullName: "Sở KH&CN Tỉnh Hà Tĩnh", region: "TRUNG_TAY_NGUYEN" },
    { code: "QT", name: "Quảng Trị", fullName: "Sở KH&CN Tỉnh Quảng Trị", region: "TRUNG_TAY_NGUYEN" },
    { code: "TTH", name: "Thừa Thiên Huế", fullName: "Sở KH&CN Tỉnh Thừa Thiên Huế", region: "TRUNG_TAY_NGUYEN" },
    { code: "QNI", name: "Quảng Ngãi", fullName: "Sở KH&CN Tỉnh Quảng Ngãi", region: "TRUNG_TAY_NGUYEN" },
    { code: "KH", name: "Khánh Hòa", fullName: "Sở KH&CN Tỉnh Khánh Hòa", region: "TRUNG_TAY_NGUYEN" },
    { code: "DL", name: "Đắk Lắk", fullName: "Sở KH&CN Tỉnh Đắk Lắk", region: "TRUNG_TAY_NGUYEN" },
    { code: "GL", name: "Gia Lai", fullName: "Sở KH&CN Tỉnh Gia Lai", region: "TRUNG_TAY_NGUYEN" },
    { code: "LD", name: "Lâm Đồng", fullName: "Sở KH&CN Tỉnh Lâm Đồng", region: "TRUNG_TAY_NGUYEN" },
    // Miền Nam (12)
    { code: "SG", name: "TP. Hồ Chí Minh", fullName: "Sở KH&CN TP. Hồ Chí Minh", region: "NAM" },
    { code: "CT", name: "Cần Thơ", fullName: "Sở KH&CN TP. Cần Thơ", region: "NAM" },
    { code: "DNA", name: "Đồng Nai", fullName: "Sở KH&CN Tỉnh Đồng Nai", region: "NAM" },
    { code: "TN", name: "Tây Ninh", fullName: "Sở KH&CN Tỉnh Tây Ninh", region: "NAM" },
    { code: "VL", name: "Vĩnh Long", fullName: "Sở KH&CN Tỉnh Vĩnh Long", region: "NAM" },
    { code: "DT", name: "Đồng Tháp", fullName: "Sở KH&CN Tỉnh Đồng Tháp", region: "NAM" },
    { code: "AG", name: "An Giang", fullName: "Sở KH&CN Tỉnh An Giang", region: "NAM" },
    { code: "CM", name: "Cà Mau", fullName: "Sở KH&CN Tỉnh Cà Mau", region: "NAM" },
    { code: "DB", name: "Điện Biên", fullName: "Sở KH&CN Tỉnh Điện Biên", region: "NAM" },
    { code: "LC", name: "Lai Châu", fullName: "Sở KH&CN Tỉnh Lai Châu", region: "NAM" },
    { code: "SL", name: "Sơn La", fullName: "Sở KH&CN Tỉnh Sơn La", region: "NAM" },
  ];
  ```
- **Tích hợp**: Xuất khẩu danh mục này và dùng chung cho toàn bộ Cổng Admin (`approvals/page.tsx`, `org-tree/page.tsx`, v.v.), xóa bỏ hoàn toàn các biến cục bộ hardcode 63 tỉnh.

#### 5. Đính Chính Tiêu Đề & Nhãn Mác (UI Cleanliness & Fact Alignment)
- Sửa tiêu đề Banner `/admin/approvals`: *"TRUNG TÂM PHÊ DUYỆT TOÀN QUỐC & GIÁM SÁT 34 TỈNH/THÀNH PHỐ TRỌNG ĐIỂM ĐMST"*.
- Xóa bỏ từ khóa "Online CRUD" tại cây tổ chức `/admin/org-tree` $\rightarrow$ Đổi thành *"Quản Trị Cây Thư Mục & Phân Cấp Hành Chính 34 Tỉnh/Thành"*.
- Xóa bỏ triệt để các cụm từ "Tổng hành dinh" $\rightarrow$ Thống nhất danh xưng nghiệp vụ là *"Trung Tâm Quản Trị Hệ Thống"*.

---

## 6. Kế Hoạch Kỹ Thuật Delta v6 (CR-2026-022) — Tinh Chỉnh UI/UX 7 Màn Hình & Hồi Sinh Audit Logs / System Config

### 6.1. Thiết Kế Tầng Dữ Liệu & Hợp Đồng API Đợt 1 (Data & API Contracts)

#### A. DTOs & API Contract Tra Cứu Nhật Ký Kiểm Toán (`/admin/audit-logs`)
```typescript
export interface AuditLogItem {
  id: string;
  approvalId?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: "SUBMITTED" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "OVERRIDE_APPROVE" | "REVOKE";
  provinceCode?: string;
  provinceName?: string;
  requestType: "EXPERT" | "SHOP" | "DEMAND" | "ACCOUNT" | "FACILITY";
  targetTitle: string;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  searchTerm?: string;
  dateRange?: "all" | "today" | "7days" | "30days";
}
```
- **Backend Endpoint**: `GET /api/v1/governance/audit-logs` hoặc fallback đọc từ `approval_audit_logs`.
- **Client Cache**: Hỗ trợ xuất dữ liệu ra định dạng CSV chuẩn UTF-8 có BOM (hỗ trợ Excel tiếng Việt không lỗi font).

#### B. DTOs & Lưu Trữ Cấu Hình Hệ Thống (`/admin/system-config`)
```typescript
export interface SystemConfigData {
  slaBaseHours: number; // 48, 72, 96
  officeHoursStart: string; // "08:00"
  officeHoursEnd: string; // "17:00"
  workingDays: string[]; // ["MON", "TUE", "WED", "THU", "FRI"]
  slaMonitorScanMinutes: number; // 15, 30, 60
  emailAlertEnabled: boolean;
  smsAlertEnabled: boolean;
  overrideMinReasonChars: number; // 20
  optimisticLockingEnabled: boolean;
  updatedAt?: string;
  updatedBy?: string;
}
```
- **Local Persistence & Sync**: Lưu vào `localStorage` key `nacentwin_system_config` và đồng bộ qua API khi có backend endpoint.

#### C. Universal Label Resolver Engine (`src/lib/label-resolver.ts`)
```typescript
export function resolveProvinceName(code?: string | null): string;
export function resolveSectorName(code?: string | null, sectorDict?: Record<string, string>): string;
export function resolveRequestTypeLabel(type?: string | null): string;
export function resolveRoleName(role?: string | null): string;
export function resolveActionBadge(action?: string | null): { label: string; colorClass: string };
```

### 6.2. Kế Hoạch Triển Khai Mã Nguồn Đợt 1
1. **`src/lib/label-resolver.ts`**: Tạo module dùng chung để phân giải 100% mã sang tên tiếng Việt tường minh.
2. **`src/app/admin/audit-logs/page.tsx`**: Viết lại toàn bộ component, thay thế khối placeholder tĩnh bằng Data Table chuẩn 5 UX states, filter, pagination và export CSV.
3. **`src/app/admin/system-config/page.tsx`**: Viết lại component, thay card tĩnh bằng Form cấu hình tương tác đầy đủ input, dropdown, toggle và nút Lưu với validation.
4. **`src/app/admin/page.tsx`**: Sửa nút chết `Chi tiết chính sách` trỏ về `/admin/roles`, chuẩn hóa nhãn Tầng 0.
5. **Kiểm thử**: Viết test unit `audit-logs/page.test.tsx` và `system-config/page.test.tsx`, đảm bảo 100% Green.

---

## 9. Kế Hoạch Kỹ Thuật Delta V6: Chuẩn Hóa Toàn Diện 7 Màn Hình Cổng Công Vụ Cấp Sở (`/gov/*`)

### 9.1. Kiến Trúc Thành Phần Tái Sử Dụng (Shared Gov Components)

#### 1. Module Giải Nghĩa Nhãn `GovLabelResolver` (`src/lib/gov-label-resolver.ts`)
Mở rộng từ `label-resolver.ts` để bao phủ toàn bộ các mã kỹ thuật xuất hiện trong phân hệ công vụ:
- `resolveSectorName(code: string, customDict?: Record<string, string>): string`
- `resolveProvinceName(code: string): string` (Tra cứu từ `PROVINCES_34`)
- `resolveTrlInfo(level: number | null | undefined): { label: string; desc: string; color: string }`
- `resolveIpStatusInfo(status: string | null | undefined): { label: string; desc: string; color: string }`
- `resolveTt17Classification(classification: string | null | undefined): { label: string; badgeClass: string }`
- `resolveTniUrgency(urgency: string | null | undefined): { label: string; badgeClass: string }`
- `resolveRoleDisplayName(role: string | null | undefined): string`

#### 2. Component `GovPageHeader` (`src/components/gov/gov-page-header.tsx`)
```typescript
export interface GovBreadcrumbItem {
  label: string;
  href?: string;
}

export interface GovPageHeaderProps {
  breadcrumbs: GovBreadcrumbItem[];
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  scopeCode?: string;
  slaText?: string; // Mặc định: "SLA ≤ 48h"
  makerCheckerText?: string; // Mặc định: "Maker-Checker 2 Cấp"
  actions?: React.ReactNode;
  className?: string;
}
```

### 9.2. Kế Hoạch Triển Khai 3 Đợt Không Tràn Context

#### Đợt 1: Xây Dựng Hạ Tầng Shared & Khóa Cứng Ranh Giới
1. Tạo `src/lib/gov-label-resolver.ts` với đầy đủ test unit `src/lib/gov-label-resolver.test.ts`.
2. Tạo `src/components/gov/gov-page-header.tsx` với test unit `src/components/gov/gov-page-header.test.tsx`.
3. Kiểm tra bảo đảm tính tương thích, 100% test pass.

#### Đợt 2: Nâng Cấp Nhóm Thẩm Định & Cấp Phép (Màn hình 1, 2, 3)
1. **Màn hình 1 (`src/app/gov/page.tsx`)**:
   - Tích hợp `GovPageHeader` và `GovLabelResolver`.
   - Giải nghĩa toàn bộ mã ngành, mã TRL, mã SHTT trên cả 5 tabs.
   - Kiểm tra ràng buộc lý do Từ chối/Yêu cầu bổ sung $\ge 10$ ký tự sau khi `.trim()`.
2. **Màn hình 2 (`src/app/gov/approvals/enterprises/page.tsx`)**:
   - Gỡ bỏ thẻ `<main>` lồng nhau gây padding kép; tích hợp `GovPageHeader`.
   - Hiển thị tiêu chí xác thực ĐMST (Mã số thuế, vốn, bằng độc quyền sáng chế).
   - Ràng buộc lý do từ chối $\ge 10$ ký tự.
3. **Màn hình 3 (`src/app/gov/assessments/tt17/page.tsx`)**:
   - Xóa bỏ triệt để hardcode `scopeId = "HP"`, lấy `user.scopeId`.
   - Nạp tên 23 ngành chế biến chế tạo C.10 $\rightarrow$ C.32.
   - Thêm bộ lọc phân loại công nghệ (Tiên tiến, Trung bình...) và tối ưu Drawer 26 tiêu chí.

#### Đợt 3: Nâng Cấp Nhóm Giám Sát, Nhân Sự & Kiểm Thử Toàn Trình (Màn hình 4, 5, 6, 7)
1. **Màn hình 4 (`src/app/gov/opportunities/page.tsx`)**:
   - Tích hợp `GovPageHeader`, giữ cán bộ trong không gian công vụ.
   - Bổ sung bộ lọc cơ hội ách tắc quá hạn SLA 48h.
2. **Màn hình 5 (`src/app/gov/demands/page.tsx`)**:
   - **Xóa bỏ triệt để mock**: Xóa UUID chuyên gia tĩnh `01a125a3-...`.
   - Tạo Modal chọn chuyên gia từ danh bạ chuyên gia thật của CSDL địa bàn.
   - Bổ sung bộ lọc theo chỉ số TNI (Cấp bách / Chiến lược) và debounce nút bấm.
3. **Màn hình 6 (`src/app/gov/settings/staff/page.tsx`)**:
   - Bổ sung vai trò `PROVINCE_OFFICER` (Maker) vào dropdown bổ nhiệm cán bộ bên cạnh `PROVINCIAL_ADMIN` (Checker).
   - Validate định dạng email và liên kết CSDL thật.
4. **Màn hình 7 (`src/app/gov/approvals/page.tsx`)**:
   - Chuẩn hóa Hub chuyển hướng đồng bộ với `/gov`.
5. **Kiểm thử toàn diện**: Viết unit tests cho cả 7 màn hình, kiểm thử 5 UX states, chạy build Next.js 66 routes.

---

## 10. Plan Delta v10 (PO-DEC-20261026-GOV-TABLE-UX): Tối Ưu Bảng Thẩm Định Địa Bàn

### 10.1. Mục Tiêu Kỹ Thuật
1. **Chuẩn Hóa Mã Hồ Sơ Công Vụ**:
   - Bổ sung hàm `formatGovRecordCode(id, type, scopeCode)` tại `src/lib/gov-label-resolver.ts`.
   - Sinh mã định danh công vụ chuẩn mực: `CB-HN-C25347` (Chào bán), `CG-HN-A109F2` (Chuyên gia), `NC-HN-88E29E` (Nhu cầu), `DN-HN-825CDC` (Doanh nghiệp).
   - Tích hợp nút Copy mã với phản hồi trực quan (tooltip/icon check) và hiển thị UUID gốc khi hover.
2. **Xem Chi Tiết Đầy Đủ Trước Khi Phê Duyệt**:
   - Biến cột "Tên Sản Phẩm / Công Nghệ" thành liên kết/nút bấm mở modal thẩm định với đầy đủ thông số.
   - Bổ sung nút liên kết trực tiếp mở trang chi tiết sản phẩm trên sàn quốc gia (`/chao-ban-cong-nghe/[id]`) trong tab mới.
   - Đổi nút thao tác tại bảng thành "Xem Chi Tiết & Duyệt" để cán bộ nắm bắt toàn diện dữ liệu trước khi ký duyệt.
3. **Sắp Xếp & Lọc Tương Tác Trực Tiếp Trên Header Bảng (Interactive Column Headers)**:
   - Thêm trạng thái `sortConfig` (`key`, `direction`: `asc` | `desc` | `null`) cho các cột: Mã hồ sơ, Đơn vị nộp, Tên sản phẩm, Ngày nộp.
   - Thêm trạng thái `filterConfig` (`sector`, `status`) với dropdown popover chọn nhanh danh mục lĩnh vực và trạng thái xử lý.
   - Hiển thị thanh thông báo trạng thái lọc (Active Filter Bar) và nút "Xóa bộ lọc (Reset)".

---

## 11. Plan Delta v7 (CR-2026-023): Tái Thiết Kế Toàn Diện Màn Hình Phê Duyệt Tập Trung & Giám Sát SLA (`/admin/approvals`)

### 11.1. Kiến Trúc Bố Cục Full-Width Master Grid & Slide-over Drawer
- **Vấn đề cũ**: Màn hình bị chia cứng `lg:col-span-2` và `lg:col-span-1` khiến bảng danh sách bị dồn cục, các cột bị cắt xén, thiếu không gian cho cột Thời gian và Thao tác.
- **Thiết kế mới**:
  - Bảng danh sách chiếm **100% chiều rộng** (`w-full`), hiển thị rộng rãi, thoáng đãng.
  - Cột 1: Mã HS `#058915` (click copy full UUID) + Capsule Badge loại hồ sơ ngang 1 dòng (`whitespace-nowrap inline-flex items-center gap-1.5 h-6 px-2.5 py-0.5 rounded-full font-bold text-xs`).
  - Cột 2: Chủ thể & Đơn vị (tên đậm + đơn vị mờ, `truncate max-w-[240px]`).
  - Cột 3: Địa phương Sở KH&CN (hiển thị rõ tên tỉnh, ví dụ: `Sở KH&CN TP. Hà Nội`).
  - Cột 4: Ngày gửi & Trạng thái SLA (hiển thị đầy đủ ngày giờ và badge quá hạn đỏ/vàng).
  - Cột 5: Nút "Thẩm định" mở Slide-over Drawer.
  - **Slide-over Drawer**: Khi click chọn 1 hồ sơ, Drawer trượt từ mép phải ra màn hình (`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl`), có nút đóng `X` và nền mờ `backdrop-blur-xs`. Người dùng có thể đối soát hồ sơ và duyệt/từ chối ngay trên Drawer mà không làm mất dấu bảng danh sách.

### 11.2. Unified Filter Toolbar (Gộp Nhất Thể & Xóa Combobox Trùng Lặp)
- Gộp 2 dải tab thành **1 thanh Segmented Toolbar duy nhất**:
  - Nhóm tính chất: `Tất cả hàng đợi (count)` | `Cảnh báo SLA (count)` | `Can thiệp Tầng 0 (count)`.
  - Vạch ngăn cách dọc (`h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2`).
  - Nhóm danh mục: `Tất cả` | `Chào bán CN` | `Nhu cầu CN` | `Chuyên gia KH&CN` | `Doanh nghiệp ĐMST` | `Tài khoản`.
- Hàng điều khiển phụ: Ô tìm kiếm đa năng tích hợp icon Search + Dropdown chọn 34 Tỉnh/Thành phố. Xóa bỏ hoàn toàn combobox "Loại hồ sơ" và "Trạng thái SLA" trùng lặp.

### 11.3. Cấu Trúc Dữ Liệu & Payload Thẩm Định Doanh Nghiệp ĐMST (`FACILITY` / `ENTERPRISE`)
- **Bóc tách từ `payloadJson`**:
  ```typescript
  interface EnterpriseApprovalPayload {
    organizationName: string;      // Tên doanh nghiệp
    taxCode: string;               // Mã số thuế
    representativeName: string;    // Người đại diện pháp luật
    charterCapital: string;        // Vốn điều lệ
    innovationSector: string;      // Lĩnh vực ĐMST
    enterpriseCertNo?: string;     // Số giấy chứng nhận DN KH&CN / ĐMST
    licenseDocUrl?: string;        // Link file PDF Giấy phép ĐKKD
  }
  ```
- Trên Drawer thẩm định: Hiển thị mục kiểm tra tính pháp lý của Mã số thuế và liên kết tải/mở Giấy chứng nhận ĐMST.

### 11.4. Universal Label Resolver & Thuật Ngữ Chuẩn Hóa
- Cập nhật `src/lib/label-resolver.ts`:
  - `SHOP`: `"Chào Bán Công Nghệ"`
  - `DEMAND`: `"Nhu Cầu Công Nghệ"`
  - `EXPERT`: `"Chuyên Gia KH&CN"`
  - `FACILITY` / `ENTERPRISE`: `"Doanh Nghiệp ĐMST"`
  - `ACCOUNT`: `"Tài Khoản Tổ Chức"`
- Format mã hồ sơ rút gọn `#HS-xxxxxx` (lấy 6 ký tự hex cuối hoặc mã số định danh).

### 11.5. Phân Kỳ Thi Công 3 Waves Nguyên Tử Không Tràn Context
- **Wave 1**: Cập nhật từ điển `label-resolver.ts` & format mã hồ sơ rút gọn.
- **Wave 2**: Tái cấu trúc component `approvals/page.tsx` (Unified Toolbar, Full-width Grid, Capsule Badge, Enterprise Slide-over Drawer).
- **Wave 3**: Cập nhật bộ unit test `approvals/page.test.tsx` và `qc-edge-cases.test.tsx`, chạy toàn bộ test suite đạt 100% Green.




