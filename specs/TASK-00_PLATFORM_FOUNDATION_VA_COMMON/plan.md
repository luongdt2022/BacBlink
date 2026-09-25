# Technical Plan: TASK-00 Platform Foundation & Common Architecture

**Feature**: `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Status**: Ready for Implementation  

---

## 1. Kiến Trúc Kỹ Thuật (Architecture Design)

Hệ thống Backend được tổ chức theo mô hình **Modular Monolith** với Clean Architecture:

```text
SourceCode/
├── backend/
│   ├── apps/
│   │   └── api/                     # Host Web API, Program.cs, Middleware, Swagger
│   ├── config/                      # appsettings.json, logging, cors
│   ├── modules/                     # Các module nghiệp vụ độc lập
│   │   ├── identity/                # Ánh xạ TASK-07 (Admin, IAM, Auth)
│   │   ├── technology/              # Ánh xạ TASK-04 (Seller & Bộ lọc)
│   │   ├── demand/                  # Ánh xạ TASK-03 (Buyer nhu cầu)
│   │   ├── expert/                  # Ánh xạ TASK-05 (Chuyên gia KH&CN)
│   │   └── master-data/             # Ánh xạ TASK-06 (Ngành TT17 & Ma trận)
│   ├── packages/                    # Thư viện dùng chung nội bộ
│   │   ├── kernel/                  # Domain primitives: Result, Error, Entity
│   │   ├── persistence/             # EF Core base DbContext, Interceptors
│   │   ├── contracts/               # Shared DTOs, Event interfaces
│   │   └── test-kit/                # Fixtures, test doubles, mock helpers
│   ├── infra/                       # Docker compose, DB scripts
│   └── NacenTech.slnx               # Solution file
└── frontend/                        # Dành cho UI Web / App (gắn Submodule sau)
```

---

## 2. API Contract & Response Wrapper Standard

Mọi response API trả về client đều tuân thủ hợp đồng chung (Contract-First):

### Thành công:
```json
{
  "isSuccess": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-09-25T09:50:00Z"
}
```

### Thất bại (RFC 7807 ProblemDetails):
```json
{
  "isSuccess": false,
  "data": null,
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "Không tìm thấy bản ghi yêu cầu.",
    "details": [
      { "field": "id", "issue": "Giá trị ID không hợp lệ." }
    ]
  },
  "timestamp": "2026-09-25T09:50:00Z"
}
```

---

## 3. Database Schema & Infrastructure Configuration

### Cấu hình Docker Compose (`backend/docker-compose.yml`):
- Service `postgres`: Image `postgres:16-alpine`, port `5432:5432`, volume persist `pgdata`.
- Service `redis`: Image `redis:7-alpine`, port `6379:6379` (caching & distributed lock).

### Audit Interceptor trong `packages/persistence`:
- Tự động bắt sự kiện `SavingChanges` để điền:
  - `CreatedAtUtc = DateTime.UtcNow`
  - `UpdatedAtUtc = DateTime.UtcNow`
  - `CreatedBy = currentUser.Id`
  - `UpdatedBy = currentUser.Id`

---

## 4. Chiến Lược Kiểm Thử (Testing Strategy)

1. **Unit Test (xUnit / FluentAssertions)**:
   - Test `Result<T>`: Success state, Failure state, null safety, error aggregation.
   - Test `AuditableEntity`: Kiểm tra gán Id, so sánh equality dựa trên Id.
2. **Integration Test**:
   - Khởi chạy Test Container PostgreSQL để kiểm chứng migration và `DbContextBase`.
