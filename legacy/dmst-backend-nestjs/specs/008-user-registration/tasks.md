# Tasks: User Registration for User Site

**Input**: Design documents from `/specs/008-user-registration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Không tạo test task riêng vì spec không yêu cầu TDD; kiểm thử độc lập cho từng user story được mô tả trong mỗi phase.

**Organization**: Tasks được nhóm theo user story để mỗi story có thể triển khai và kiểm thử độc lập.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể chạy song song (khác file, không phụ thuộc task chưa hoàn thành)
- **[Story]**: User story tương ứng (US1, US2, US3)
- Mỗi task chứa đường dẫn file cụ thể

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Chuẩn bị cấu hình và skeleton tài liệu để triển khai tính năng

- [X] T001 Bổ sung biến cấu hình kích hoạt tài khoản vào `.env.example`
- [X] T002 Cập nhật đọc cấu hình mail/activation link trong `src/config/mail.config.ts`
- [X] T003 [P] Tạo tài liệu trạng thái UI đăng ký cho frontend tích hợp trong `docs/user-site-registration-flow.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hạ tầng lõi bắt buộc trước khi làm các user story

**⚠️ CRITICAL**: Không bắt đầu user story cho đến khi phase này hoàn tất

- [X] T004 Tạo entity token kích hoạt trong `src/auth/entities/activation-token.entity.ts`
- [X] T005 Đăng ký entity token kích hoạt vào module trong `src/auth/auth.module.ts`
- [X] T006 Tạo migration cho bảng token kích hoạt trong `src/database/migrations/1774500000000-createActivationTokens.ts`
- [X] T007 [P] Tạo DTO dùng chung cho kích hoạt và gửi lại kích hoạt trong `src/auth/dto/activate-account.dto.ts`
- [X] T008 [P] Tạo DTO dùng chung cho gửi lại email kích hoạt trong `src/auth/dto/resend-activation.dto.ts`
- [X] T009 Tạo service quản lý token kích hoạt trong `src/auth/services/account-activation.service.ts`
- [X] T010 [P] Thêm key/thông điệp response cho luồng đăng ký-kích hoạt trong `src/auth/constants/auth-response-key.enum.ts`
- [X] T011 Tạo helper giới hạn tần suất đăng ký/kích hoạt lại trong `src/auth/services/registration-rate-limit.service.ts`

**Checkpoint**: Foundation sẵn sàng - có thể triển khai user stories

---

## Phase 3: User Story 1 - Tạo tài khoản mới (Priority: P1) 🎯 MVP

**Goal**: Người dùng có thể đăng ký tài khoản mới và nhận thông báo cần kích hoạt email

**Independent Test**: Gửi `POST /auth/register` với dữ liệu hợp lệ nhận `201`, tài khoản tạo ở trạng thái chưa kích hoạt, email trùng trả lỗi rõ ràng

### Implementation for User Story 1

- [X] T012 [P] [US1] Cập nhật ràng buộc dữ liệu đăng ký trong `src/auth/dto/register.dto.ts`
- [X] T013 [US1] Sửa luồng tạo user để tránh hash mật khẩu lặp trong `src/users/services/users.service.ts`
- [X] T014 [US1] Cập nhật xử lý đăng ký trả về trạng thái pending activation trong `src/auth/auth.service.ts`
- [X] T015 [P] [US1] Bổ sung endpoint/docs swagger cho đăng ký trong `src/auth/auth.controller.ts`
- [X] T016 [P] [US1] Thêm template email kích hoạt tài khoản trong `src/mail/templates/account-activation.hbs`
- [X] T017 [US1] Thêm hàm enqueue gửi email kích hoạt trong `src/mail/mail.service.ts`
- [X] T018 [US1] Đồng bộ contract API đăng ký trong `specs/008-user-registration/contracts/registration-api.yaml`

**Checkpoint**: User Story 1 chạy độc lập và sẵn sàng demo MVP

---

## Phase 4: User Story 2 - Kích hoạt tài khoản (Priority: P2)

**Goal**: Người dùng kích hoạt tài khoản qua token và có thể yêu cầu gửi lại email kích hoạt khi token hết hạn

**Independent Test**: Gửi `POST /auth/activate` với token hợp lệ nhận `200`; token hết hạn/sai nhận lỗi hợp lệ; `POST /auth/resend-activation` gửi lại email trong giới hạn tần suất

### Implementation for User Story 2

- [X] T019 [P] [US2] Tạo DTO request kích hoạt token trong `src/auth/dto/activate-account.dto.ts`
- [X] T020 [P] [US2] Tạo DTO request gửi lại kích hoạt trong `src/auth/dto/resend-activation.dto.ts`
- [X] T021 [US2] Triển khai logic tạo-xác thực-vô hiệu token trong `src/auth/services/account-activation.service.ts`
- [X] T022 [US2] Thêm endpoint kích hoạt tài khoản trong `src/auth/auth.controller.ts`
- [X] T023 [US2] Thêm endpoint gửi lại email kích hoạt trong `src/auth/auth.controller.ts`
- [X] T024 [US2] Triển khai logic activate/resend trong `src/auth/auth.service.ts`
- [X] T025 [US2] Bổ sung nội dung email resend kích hoạt trong `src/mail/templates/account-activation.hbs`
- [X] T026 [US2] Đồng bộ contract activate/resend trong `specs/008-user-registration/contracts/registration-api.yaml`

**Checkpoint**: User Stories 1 và 2 đều hoạt động độc lập

---

## Phase 5: User Story 3 - Nhận lỗi rõ ràng khi đăng ký thất bại (Priority: P3)

**Goal**: Người dùng nhận thông báo lỗi nhất quán, dễ hiểu và retry được cho mọi nhánh thất bại đăng ký/kích hoạt

**Independent Test**: Kiểm thử các case invalid input, duplicate email, rate-limit, token sai/hết hạn và xác nhận response có `message` rõ ràng cho frontend hiển thị

### Implementation for User Story 3

- [X] T027 [US3] Chuẩn hóa mapping lỗi đăng ký-kích hoạt sang message thân thiện trong `src/auth/auth.service.ts`
- [X] T028 [US3] Áp dụng giới hạn tần suất cho register/resend trong `src/auth/services/registration-rate-limit.service.ts`
- [X] T029 [US3] Tích hợp kiểm tra rate limit vào controller endpoints trong `src/auth/auth.controller.ts`
- [X] T030 [P] [US3] Cập nhật hướng dẫn hiển thị lỗi theo mã nghiệp vụ cho frontend trong `docs/user-site-registration-flow.md`
- [X] T031 [US3] Cập nhật quickstart cho các kịch bản lỗi và retry trong `specs/008-user-registration/quickstart.md`

**Checkpoint**: Cả 3 user stories hoàn chỉnh và kiểm thử độc lập được

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hoàn thiện tài liệu và rà soát chất lượng toàn feature

- [X] T032 [P] Cập nhật ghi chú thiết kế cuối cùng trong `specs/008-user-registration/research.md`
- [X] T033 [P] Rà soát nhất quán data model với implementation notes trong `specs/008-user-registration/data-model.md`
- [X] T034 Đồng bộ lại kế hoạch triển khai sau khi chốt tasks trong `specs/008-user-registration/plan.md`
- [X] T035 Xác nhận lại luồng chạy thủ công end-to-end trong `specs/008-user-registration/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Bắt đầu ngay
- **Phase 2 (Foundational)**: Phụ thuộc Phase 1 và chặn toàn bộ user stories
- **Phase 3 (US1)**: Phụ thuộc Phase 2
- **Phase 4 (US2)**: Phụ thuộc Phase 2
- **Phase 5 (US3)**: Phụ thuộc Phase 3 và Phase 4
- **Phase 6 (Polish)**: Phụ thuộc các phase user story đã chọn hoàn tất

### User Story Dependencies

- **US1 (P1)**: Không phụ thuộc user story khác, chỉ cần foundation
- **US2 (P2)**: Không phụ thuộc US1 ở mức code, chỉ cần foundation (có thể test độc lập bằng tài khoản pending activation)
- **US3 (P3)**: Phụ thuộc US1 + US2 vì chuẩn hóa lỗi cần phủ đủ các luồng đăng ký và kích hoạt

### Within Each User Story

- DTO/Model trước -> Service -> Controller/Endpoint -> Contract/docs sync
- Hoàn tất checkpoint của từng story trước khi chuyển ưu tiên tiếp theo

### Parallel Opportunities

- Phase 1: T003 có thể chạy song song với T001, T002
- Phase 2: T007, T008, T010 chạy song song; T009 sau T004/T005; T011 sau T001/T002
- US1: T012, T015, T016 chạy song song; T017 sau T016; T014 sau T013
- US2: T019, T020 chạy song song; T022 và T023 sau T021; T024 sau T022/T023
- US3: T030 chạy song song với T027/T028/T029

---

## Parallel Example: User Story 1

```bash
Task: "T012 [US1] Update validation in src/auth/dto/register.dto.ts"
Task: "T015 [US1] Update swagger endpoint docs in src/auth/auth.controller.ts"
Task: "T016 [US1] Add activation email template in src/mail/templates/account-activation.hbs"
```

## Parallel Example: User Story 2

```bash
Task: "T019 [US2] Create activate DTO in src/auth/dto/activate-account.dto.ts"
Task: "T020 [US2] Create resend DTO in src/auth/dto/resend-activation.dto.ts"
Task: "T021 [US2] Implement token logic in src/auth/services/account-activation.service.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T027 [US3] Normalize error mapping in src/auth/auth.service.ts"
Task: "T030 [US3] Update frontend error guide in docs/user-site-registration-flow.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Hoàn tất Phase 1 và Phase 2
2. Hoàn tất Phase 3 (US1)
3. Validate độc lập bằng checklist của US1
4. Demo/deploy MVP

### Incremental Delivery

1. Setup + Foundation
2. Ship US1 (MVP)
3. Ship US2 (activation/resend)
4. Ship US3 (error UX + retry)
5. Polish cuối cùng

### Parallel Team Strategy

1. Cả team hoàn thành Setup + Foundation
2. Sau foundation:
   - Dev A: US1
   - Dev B: US2
3. Khi US1/US2 xong, Dev C xử lý US3 và polish

---

## Notes

- `[P]` chỉ dùng cho task khác file và không phụ thuộc task chưa xong
- `[USx]` chỉ xuất hiện ở phase user story
- Mỗi user story có tiêu chí kiểm thử độc lập rõ ràng
- Mức MVP đề xuất: hoàn thành US1 trước
