# Kế hoạch Kỹ thuật (plan.md) - TASK-02: Hồ Sơ Chủ Thể & Doanh Nghiệp ĐMST

## 1. Thiết Kế Contract-First (APIs & DTOs)

### API-02-001: Lấy thông tin hồ sơ doanh nghiệp
- **Endpoint**: `GET /api/v1/enterprises/{id}`
- **Response DTO**:
  ```json
  {
    "id": "uuid",
    "subjectType": "INNOVATIVE_ENTERPRISE",
    "legalName": "string",
    "addressInfo": { "province": "string", "addressLine": "string" },
    "status": "ACTIVE",
    "intellectualProperties": [
      { "id": "uuid", "type": "PATENT", "title": "string" }
    ]
  }
  ```

### API-02-002: Cập nhật thông tin cơ bản
- **Endpoint**: `PUT /api/v1/enterprises/{id}/basic-info`
- **Request DTO**: (Chứa legalName, addressInfo, fields cơ bản)

### Error Codes (RFC 7807)
- `ENT-404`: Không tìm thấy chủ thể.
- `ENT-409`: Mã số định danh (MST) đã tồn tại.

## 2. Backend Architecture Plan
- **Module**: `SourceCode/backend/modules/enterprise/NacenTech.Modules.Enterprise/`
- **EF Core Mapping**:
  - `Enterprise` entity làm Aggregate Root.
  - Các Entity con: `EnterpriseIdentifier`, `EnterpriseInnovationProject`, `EnterpriseIntellectualProperty`.
  - Bảng Log tập trung: `SystemAuditLog` hứng event thông qua EF Core Interceptor (SaveChangeInterceptor).
- **Security & RBAC**:
  - Xác thực qua `ICurrentActor`.
  - Quyền xem tài chính được kiểm soát bằng Policy.

## 3. Cấu trúc Giao diện (Frontend)
- Trang Danh bạ Doanh nghiệp / Viện trường (Grid/List View).
- Trang Chi tiết Hồ sơ (Tabs: Thông tin chung, Năng lực KH&CN, SHTT, Dự án).
- Sử dụng Component `<Async>` cho 5 trạng thái UX (Loading, Empty, Error, Success).
