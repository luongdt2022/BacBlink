# Implementation Plan: User Registration for User Site

**Branch**: `008-user-registration` | **Date**: 2026-03-27 | **Spec**: [/home/anhbui/projects/dmst/dmst-backend/specs/008-user-registration/spec.md](/home/anhbui/projects/dmst/dmst-backend/specs/008-user-registration/spec.md)
**Input**: Feature specification from `/specs/008-user-registration/spec.md`

## Summary

Bổ sung và hoàn thiện luồng đăng ký tài khoản cho user site theo mô hình xác thực email: người dùng gửi form đăng ký, hệ thống tạo tài khoản ở trạng thái chưa kích hoạt, gửi email kích hoạt bất đồng bộ, hỗ trợ kích hoạt lại khi token hết hạn, đồng thời cung cấp contract rõ ràng để frontend tích hợp đầy đủ màn hình đăng ký và xác nhận.

## Technical Context

**Language/Version**: TypeScript 5.x trên Node.js, NestJS 11  
**Primary Dependencies**: NestJS modules, TypeORM, class-validator, JWT, BullMQ, Mail service (Nodemailer), Cache/Redis  
**Storage**: PostgreSQL (dữ liệu người dùng và xác thực kích hoạt), Redis (rate limiting/tạm thời)  
**Testing**: Jest (unit/integration API), supertest cho endpoint auth  
**Target Platform**: Backend API chạy Linux server; client là user-facing web frontend  
**Project Type**: Web service (backend API cho frontend)  
**Performance Goals**: 95% request đăng ký hợp lệ phản hồi trong <= 2 giây; không blocking HTTP bởi tác vụ gửi mail  
**Constraints**: Tuân thủ response/error contract hiện có; giới hạn tần suất đăng ký; migration bắt buộc cho thay đổi schema  
**Scale/Scope**: Luồng public registration cho user role; xử lý ổn định cho khối lượng đăng ký hàng ngày ở mức sản phẩm production

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Module Cohesion & Domain Ownership**: PASS  
  Thiết kế giữ `AuthModule` điều phối luồng đăng ký/kích hoạt, truy cập user qua `UsersService`, gửi mail qua `MailService`, không truy cập chéo repository giữa module.
- **II. API Contract Stability**: PASS  
  Endpoint mới thuộc nhóm public `/auth/*`; response shape cho single-resource giữ nhất quán, lỗi chuẩn hóa có `message`; Swagger decorators sẽ được bổ sung cho endpoint mới.
- **III. Async AI Pipeline Integrity**: PASS (N/A)  
  Feature không can thiệp pipeline AI/BullMQ của intake processing.
- **IV. Migration-Gated Schema Changes**: PASS  
  Bất kỳ thay đổi entity/schema cho activation token hoặc trạng thái kích hoạt phải đi kèm migration TypeORM.
- **V. Simplicity & Minimal Complexity**: PASS  
  Tái sử dụng module/service hiện có; không thêm abstraction layer mới nếu chỉ có một consumer.

### Post-Design Re-check

- **I. Module Cohesion & Domain Ownership**: PASS (design artifacts giữ ownership theo module hiện có).
- **II. API Contract Stability**: PASS (contracts/registration-api.yaml chuẩn hóa response và lỗi có `message`).
- **III. Async AI Pipeline Integrity**: PASS (không chạm luồng AI).
- **IV. Migration-Gated Schema Changes**: PASS (data model xác định thay đổi schema đi kèm migration).
- **V. Simplicity & Minimal Complexity**: PASS (không thêm layer dư thừa, tái sử dụng service hiện có).

## Project Structure

### Documentation (this feature)

```text
specs/008-user-registration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── registration-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   └── guards/
├── users/
│   ├── user.entity.ts
│   ├── services/users.service.ts
│   └── dto/
├── mail/
│   ├── mail.service.ts
│   ├── mail.module.ts
│   ├── queue/mail.processor.ts
│   └── templates/
├── database/
│   └── migrations/
└── shared/
    └── interfaces/api-response.interface.ts

test/
└── (e2e and integration test configs)
```

**Structure Decision**: Dùng cấu trúc single backend project hiện có. Frontend user site tích hợp qua contract API trong `specs/008-user-registration/contracts/registration-api.yaml`; không tạo thư mục frontend mới trong repo backend này.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Task Sync Notes

- `tasks.md` đã bám theo 3 user story độc lập (US1/US2/US3) với thứ tự ưu tiên P1 -> P2 -> P3.
- Contract và quickstart đã được đồng bộ theo prefix endpoint `/api/v1/auth/*`.
