# Technical Plan: TASK-07 Phân Quyền & Năng Lực Quản Trị Admin

**Feature**: `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Status**: Ready for Implementation (Delta v2 Applied)  

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
   - Thêm nút [Thu hồi quyền chuyên gia] trên các hồ sơ đã được cấp tỉnh duyệt (`Status = APPROVED`), mở modal nhập lý do thu hồi vi phạm theo `BR-ADM-007`.

