# Tasks: Tách Hoàn Toàn Namespace IP và Challenge

**Input**: Design documents from `/specs/012-split-ip-challenge-routes/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Không thêm test-suite mới; xác nhận bằng `npm test && npm run lint` + manual smoke theo quickstart.

**Organization**: Nhóm theo user story để triển khai độc lập từng phần.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể làm song song
- **[Story]**: `US1`, `US2`, `US3`
- Mỗi task có file path cụ thể

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Cập nhật route contract và transition decisions trong `specs/012-split-ip-challenge-routes/plan.md` và `specs/012-split-ip-challenge-routes/contracts/intake-routing-ui.md`
- [X] T002 [P] Cập nhật map điều hướng menu cho `/ips` và `/challenges` trong `src/app/config/routes.ts`
- [X] T003 [P] Tạo/chuẩn hóa wrapper pages cho 2 namespace trong `src/features/intakes/pages/CreateIpPage.tsx`, `src/features/intakes/pages/CreateChallengePage.tsx`, `src/features/intakes/pages/IpDetailPage.tsx`, `src/features/intakes/pages/ChallengeDetailPage.tsx`, `src/features/intakes/pages/IpEditPage.tsx`, `src/features/intakes/pages/ChallengeEditPage.tsx`

---

## Phase 2: Foundational (Blocking)

- [X] T004 Refactor `IntakeFormPage` thành route-driven theo `forcedType`, `intakeId`, `backPath` trong `src/features/intakes/pages/IntakeFormPage.tsx`
- [X] T005 Refactor `IntakeDetailPage` thành route-driven theo `intakeId`, `expectedType`, `backPath`, `editPath` trong `src/features/intakes/pages/IntakeDetailPage.tsx`
- [X] T006 [P] Thêm helper route builder cho namespace-specific links trong `src/features/intakes/utils/intakeRoutes.ts`
- [X] T007 Cập nhật route tree: remove `/intakes*`, add `/ips*` + `/challenges*` trong `src/app/router/routes.tsx`

---

## Phase 3: User Story 1 - Quản lý IP độc lập (Priority: P1) 🎯 MVP

**Goal**: Toàn bộ flow IP nằm trong namespace `/ips/*`.

**Independent Test**: Đi qua `/ips` -> `/ips/create` -> `/ips/:id` -> `/ips/:id/edit` và lưu thành công.

- [X] T008 [US1] Tạo route list IP `/ips` và wiring page/filter tương ứng trong `src/app/router/routes.tsx` và `src/features/intakes/pages/IntakesPage.tsx`
- [X] T009 [US1] Hoàn thiện flow tạo IP (`/ips/create`) bằng wrapper `CreateIpPage` trong `src/features/intakes/pages/CreateIpPage.tsx` và `src/features/intakes/pages/IntakeFormPage.tsx`
- [X] T010 [US1] Hoàn thiện flow detail/edit IP (`/ips/:id`, `/ips/:id/edit`) trong `src/features/intakes/pages/IpDetailPage.tsx`, `src/features/intakes/pages/IpEditPage.tsx`, `src/features/intakes/pages/IntakeDetailPage.tsx`
- [X] T011 [US1] Cập nhật toàn bộ điều hướng nội bộ IP sang `/ips/*` trong `src/features/intakes/pages/IntakesPage.tsx` và `src/features/intakes/pages/IntakeDetailPage.tsx`

---

## Phase 4: User Story 2 - Quản lý Challenge độc lập (Priority: P1)

**Goal**: Toàn bộ flow Challenge nằm trong namespace `/challenges/*`.

**Independent Test**: Đi qua `/challenges` -> `/challenges/create` -> `/challenges/:id` -> `/challenges/:id/edit` và lưu thành công.

- [X] T012 [US2] Tạo route list Challenge `/challenges` và wiring page/filter tương ứng trong `src/app/router/routes.tsx` và `src/features/intakes/pages/IntakesPage.tsx`
- [X] T013 [US2] Hoàn thiện flow tạo Challenge (`/challenges/create`) bằng wrapper `CreateChallengePage` trong `src/features/intakes/pages/CreateChallengePage.tsx` và `src/features/intakes/pages/IntakeFormPage.tsx`
- [X] T014 [US2] Hoàn thiện flow detail/edit Challenge (`/challenges/:id`, `/challenges/:id/edit`) trong `src/features/intakes/pages/ChallengeDetailPage.tsx`, `src/features/intakes/pages/ChallengeEditPage.tsx`, `src/features/intakes/pages/IntakeDetailPage.tsx`
- [X] T015 [US2] Cập nhật toàn bộ điều hướng nội bộ Challenge sang `/challenges/*` trong `src/features/intakes/pages/IntakesPage.tsx` và `src/features/intakes/pages/IntakeDetailPage.tsx`

---

## Phase 5: User Story 3 - Loại bỏ hoàn toàn route intake cũ (Priority: P2)

**Goal**: Không còn route nghiệp vụ `/intakes/*`.

**Independent Test**: Truy cập `/intakes`, `/intakes/create`, `/intakes/edit`, `/intakes/detail` và xác nhận không còn flow nghiệp vụ cũ.

- [X] T016 [US3] Xóa route declarations legacy `/intakes*` trong `src/app/router/routes.tsx`
- [X] T017 [US3] Xóa legacy menu/path mapping liên quan `/intakes*` trong `src/app/config/routes.ts`
- [X] T018 [US3] Xóa hoặc thay mọi điều hướng code-level trỏ tới `/intakes*` trong `src/features/intakes/pages/IntakesPage.tsx`, `src/features/intakes/pages/IntakeFormPage.tsx`, `src/features/intakes/pages/IntakeDetailPage.tsx`

---

## Phase 6: Polish & Cross-Cutting

- [X] T019 Đồng bộ tài liệu triển khai và test notes trong `specs/012-split-ip-challenge-routes/quickstart.md`
- [ ] T020 Chạy `npm test && npm run lint` từ `D:\SOTATEK\dmst-user`
- [ ] T021 Thực hiện manual smoke toàn bộ route `/ips/*` và `/challenges/*` theo `specs/012-split-ip-challenge-routes/quickstart.md`

---

## Dependencies & Execution Order

- Phase 1 -> Phase 2 -> Phase 3/4 (song song được) -> Phase 5 -> Phase 6
- US1 và US2 độc lập sau Foundational
- US3 chạy sau khi US1/US2 đã migrate đầy đủ để tránh đứt flow

## Parallel Opportunities

- T002 và T003
- T006 song song với phần còn lại của Phase 2
- US1 và US2 có thể chia team xử lý song song

## Implementation Strategy

### MVP

1. Phase 1
2. Phase 2
3. Phase 3 (US1)

### Incremental

1. Hoàn tất US1
2. Hoàn tất US2
3. Cắt hẳn legacy bằng US3
4. Polish + validation

## Notes

- Tất cả task tuân thủ format checklist bắt buộc.
- Không dùng `/intakes` trong scope feature này.

