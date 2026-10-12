# Implementation Tasks: TASK-05 Hồ Sơ Chuyên Gia KH&CN & AI Scan LLKH

**Feature**: `TASK-05_HO_SO_CHUYEN_GIA_KHCN`  
**Spec Reference**: [`spec.md`](./spec.md) | **Plan Reference**: [`plan.md`](./plan.md)  
**Status**: Delta v3 đã đặc tả; chưa triển khai migration/code  

---

## Phase 1: API Contracts & Shared DTOs [CONTRACT]

- [x] T001 [CONTRACT] Định nghĩa DTOs nộp hồ sơ nâng cấp chuyên gia `SubmitExpertUpgradeRequest` và `ExpertProfileDto` trong `modules/brokerage/Application/Contracts.cs`.
- [x] T002 [CONTRACT] Định nghĩa mã lỗi nghiệp vụ chuẩn `ExpertErrorCodes` (`ERR_DEGREE_REQUIRED`, `ERR_PDPD_CONSENT_REQUIRED`, `ERR_PENDING_REQUEST_EXISTS`).
- [x] T003 [CONTRACT] Định nghĩa interface `IExpertService` cho các use cases nộp hồ sơ, tra cứu profile cá nhân và mô phỏng AI-to-Text scan CV.

---

## Phase 2: Triển Khai Backend & CSDL [BE] (Thực thi tại `SourceCode/backend/`)

- [x] T004 [BE] Tạo thực thể `ExpertProfile` kế thừa `AggregateRoot` trong `modules/brokerage/Domain/ExpertProfile.cs` đầy đủ các trường học hàm, học vị, CCCD, công trình khoa học.
- [x] T005 [BE] Khai báo EF Core Configuration cho bảng `expert_profiles` trong `modules/brokerage/Infrastructure/Persistence/Configurations.cs` và thiết lập các chỉ mục.
- [x] T006 [BE] Cài đặt `ExpertService` trong `modules/brokerage/Application/ExpertService.cs`: xác thực điều kiện học vị, kiểm tra consent PDPD, lưu profile và liên thông tạo yêu cầu vào hàng đợi duyệt `approval_requests` (`TASK-07`).
- [x] T007 [BE] Tạo `ExpertController` trong `apps/api/V1Compat/ExpertController.cs` cung cấp endpoints:
  - `POST /api/v1/experts/upgrade-request`: Tiếp nhận hồ sơ nâng hạng.
  - `GET /api/v1/experts/my-profile`: Lấy trạng thái hồ sơ cá nhân.
  - `POST /api/v1/experts/ai-cv-scan`: Mô phỏng trích xuất AI-to-Text từ tệp LLKH.
- [x] T008 [BE] Viết bộ Unit Tests kiểm chứng trong `tests/invariants/ExpertProfileInvariantsTests.cs` bao phủ 100% các Business Rules (`BR-EXP-001` đến `BR-EXP-006`).

---

## Phase 3: Khởi Tạo Nền Tảng Frontend Base [FE] (Thực thi tại `SourceCode/frontend/`)

- [x] T009 [FE] Khởi tạo dự án Next.js 15 App Router + TypeScript + Tailwind CSS trong thư mục `SourceCode/frontend/`.
- [x] T010 [FE] Cài đặt hệ thống UI Primitives và component `<Async>` chuẩn 5 trạng thái UX (Loading, Empty, Error, Success, Partial).
- [x] T011 [FE] Cài đặt `auth-client.ts` tự động quản lý Bearer JWT token, interceptors và giải mã thông tin `UserContext`.
- [x] T012 [FE] Xây dựng trang Đăng nhập (`/login`) và Đăng ký (`/register`) kết nối trực tiếp với Backend API `api/v1/auth/*`.

---

## Phase 4: Xây Dựng Giao Diện Wizard Nâng Hạng Chuyên Gia [FE] (Thực thi tại `SourceCode/frontend/`)

- [x] T013 [FE] Xây dựng trang `/profile/upgrade/expert` với thanh tiến trình Wizard Stepper 3 bước responsive.
- [x] T014 [FE] Cài đặt Form Bước 1: Khai báo định danh, CCCD, ảnh chân dung, học hàm (GS/PGS), học vị (TS/ThS) và cơ quan công tác.
- [x] T015 [FE] Cài đặt Form Bước 2: Lĩnh vực chuyên môn trụ cột, tích hợp nút quét AI CV Parser bóc tách tự động 94 trường chuẩn hóa.
- [x] T016 [FE] Cài đặt Form Bước 3: Danh mục công trình khoa học, bằng sáng chế, cam kết PDPD (Nghị định 13/2023/NĐ-CP) và nộp hồ sơ thẩm định.

---

## Phase 5: Tích Hợp Toàn Trình & Nghiệm Thu [INT]

- [x] T017 [INT] Chạy kiểm thử tích hợp luồng toàn trình: Thành viên đăng ký $\rightarrow$ Đăng nhập $\rightarrow$ Điền Wizard 3 bước $\rightarrow$ Nộp hồ sơ $\rightarrow$ Kích hoạt `PENDING_APPROVAL` và đẩy vào hàng đợi duyệt của TASK-07.
- [x] T018 [BE] Kiểm tra bất biến Domain Model và quy tắc nghiệp vụ `ExpertProfileInvariantsTests.cs`.
- [x] T019 [FE] Chạy `pnpm build` xác nhận Next.js 15 biên dịch hoàn toàn sạch (0 lỗi TS / Linting, 7 routes static prerendered).
- [x] T020 [INT] Nghiệm thu hội tụ (Converge) và cập nhật tiến độ lên Master Roadmap (`specs/ROADMAP.md`).

---

## Phase 6: Delta v2 — Triển Khai Zalo Mini App & Backend Intake Endpoint

- [x] T021 [CONFIG] Cập nhật định danh ứng dụng `app-config.json` trong `SourceCode/ZaloMiniApp/`: `title` ("Viện NacenTech — Sổ tay Chuyên gia KH&CN"), màu nhận diện `#1d4ed8`, cấp quyền Zalo SDK (`scope.userInfo`, `scope.userPhonenumber`).
- [x] T022 [CONFIG] Cấu hình `vite.config.ts` trong `SourceCode/ZaloMiniApp/`: thiết lập proxy dev `/api` trỏ về API Backend .NET Core và cố định tên bundle (`index.module.js`, `vendor.module.js`, `index.css`) khớp chuẩn `app-config.json`.
- [x] T023 [BE] Cập nhật Domain `ExpertProfile` và cấu hình EF Core trong `SourceCode/backend/`: thêm cột `phone`, `email`, `mastered_tech_codes`, `draft_source`, `magic_link_token`, `magic_link_expires_at_utc` và cho phép `person_id` nullable ở giai đoạn sơ bộ.
- [x] T024 [BE] Cấu hình CORS Policy trên Backend .NET Core cho phép origin Zalo (`https://h5.zdn.vn`, `https://mini.zalo.me`) và tạo endpoint `POST /api/v1/public/experts/quick-intake` nhận `multipart/form-data` sinh Magic Link.
- [x] T025 [ZALO] Tích hợp Zalo SDK trong `SourceCode/ZaloMiniApp/src/pages/home.tsx`: gọi `getUserInfo` và `getPhoneNumber` tự động điền Họ tên và SĐT, dựng form 7 trường cốt lõi + multi-select 34 nhóm công nghệ chuẩn hóa theo `wireframe_zalo_input_form.html`.
- [x] T026 [ZALO] Xây dựng component `src/components/ai-progress.tsx` mô phỏng thanh tiến trình AI đọc hiểu CV thời gian thực và modal thông báo tiếp nhận thành công kèm Magic Link.
- [x] T027 [ZALO] Xây dựng module `src/api/expert.ts` kết nối trực tiếp endpoint backend `quick-intake`, tinh chỉnh `src/pages/me.tsx` (profile + quan tâm OA Viện) và gỡ bỏ các trang barcode cũ.
- [x] T028 [INT] Kiểm thử đóng gói `npm run build` trong `SourceCode/ZaloMiniApp/` ra thư mục `www/` (0 lỗi build TS, asset khớp app-config), chạy test hồi quy backend .NET và cập nhật ROADMAP.md & TRACEABILITY.md.

---

## Phase 7: Delta v3 — Hoàn chỉnh Data Model, Chứng từ và AI Ingestion

- [ ] T029 [BE][REQ-EXP-DB-001][DB-EXP-001] Tạo aggregate/bảng con cho đào tạo, công tác, publications (tối đa 5), patents, practical projects, research projects và awards; map FK, ordering và validation.
- [ ] T030 [BE][REQ-EXP-DB-002][DB-EXP-002][SEC-EXP-001] Tạo `expert_identity_private` và `expert_documents`; mã hóa PII, metadata/checksum/malware status và policy truy cập chứng từ.
- [ ] T031 [BE][REQ-EXP-DB-003][DB-EXP-003][AI-EXP-001] Tạo `expert_ai_ingestions`, unified status lifecycle và magic-link token hash/one-time use; thay việc lưu tên tệp bằng storage reference thực.
- [ ] T032 [BE][DB-EXP-004] Tạo migration non-destructive `CreateExpertProfileAndEvidenceSchema`, FK/index/partial unique index; cập nhật EF snapshot và kiểm chứng apply trên database sạch.
- [ ] T033 [BE][REQ-EXP-DB-005][API-EXP-001] Tách DTO public/owner/admin, mở rộng contracts cho hồ sơ/bảng con/chứng từ và danh mục chuẩn; cập nhật endpoint intake, submit và review theo BR-EXP-011 đến BR-EXP-015.
- [ ] T034 [BE][REQ-EXP-DB-004][API-EXP-002] Liên thông transaction với `approval_requests` TASK-07 và ghi `expert_profile_status_history`; không cấp role EXPERT trước approval thành công.
- [ ] T035 [FE][REQ-EXP-DB-005][UI-EXP-001] Bổ sung form/review cho chứng từ, các danh mục hồ sơ khoa học, consent versioned, danh mục chuẩn và trạng thái AI; bảo đảm 5 trạng thái UX.
- [ ] T036 [TEST][INT] Viết unit/DB integration/API contract tests cho FK, partial uniqueness, PII masking, upload validation, token one-time, status transitions và atomic approval; chạy regression backend/frontend.
- [ ] T037 [INT] Cập nhật TRACEABILITY/ROADMAP sau khi migration và test pass; chỉ khi đó đánh dấu Delta v3 hoàn tất.

---

## Phase 8: Delta v4 — Hợp nhất DB, Zalo Mini App và Web Portal

- [ ] T038 [BE][REQ-EXP-INT-001][API-EXP-003] Tạo canonical owner/draft DTO và endpoint đọc/cập nhật/submit profile; loại bỏ mapping Web payload cũ sai tên trường.
- [ ] T039 [BE][REQ-EXP-INT-002][API-EXP-004] Bổ sung API transaction cho collections/chứng từ/consent và projection public/owner/admin an toàn PII.
- [ ] T040 [BE][REQ-EXP-INT-003][API-EXP-005] Nối quick-intake với `expert_documents`, `expert_ai_ingestions`, tracking code và Magic Link hash/one-time use.
- [ ] T041 [ZALO][REQ-EXP-INT-003][UI-EXP-002] Đồng bộ client Zalo theo quick-intake response/status chuẩn, polling ingestion và handoff Magic Link.
- [ ] T042 [FE][REQ-EXP-INT-001][REQ-EXP-INT-004][UI-EXP-003] Thay Web payload bằng canonical contract; thêm draft review, chứng từ/collections và 5 UX states thật.
- [ ] T043 [TEST][REQ-EXP-INT-005] Viết API contract, integration và E2E tests cho Zalo → Web → approval; chạy build/regression hai client.

---

## Phase 9: Delta v5 — Trang Chi Tiết Chuyên Gia (Public Web, Owner Portal, Zalo Handoff)

- [x] T044 [BE][REQ-EXP-DETAIL-001][REQ-EXP-DETAIL-003][DB-EXP-005] Migrate `expert_code`, visibility/readiness/public bio, private ciphertext detail và metadata thành tựu (ngày cấp/TRL sáng chế; thời gian, tổ chức, kinh phí đề tài; kết quả áp dụng; cấp/nội dung giải thưởng); apply trên PostgreSQL local.
- [x] T045 [BE][REQ-EXP-DETAIL-002][REQ-EXP-DETAIL-006][SEC-EXP-002] Tạo private access audit, owner/admin policy và document download authorized streaming; không expose storage key.
- [x] T046 [BE][REQ-EXP-DETAIL-001][API-EXP-006] Tạo `ExpertPublicDetailDto` + `GET /api/v1/public/experts/{expertCode}` filter `APPROVED`/`PUBLIC`; PII được tách DTO và có deny-list theo mapping.
- [x] T047 [BE][REQ-EXP-DETAIL-002][API-EXP-007] Tạo `ExpertPrivateDetailDto`, owner/admin detail endpoints; enforce owner/admin policy và audit private read.
- [x] T048 [FE][REQ-EXP-DETAIL-001][REQ-EXP-DETAIL-003][UI-EXP-004] Xây dựng `/experts/[expertCode]`: hero, tags, timeline, contact mask, 5 tabs, share và responsive theo wireframe.
- [x] T049 [FE][REQ-EXP-DETAIL-002][UI-EXP-005] Xây dựng `/portal/expert/profile`: private panel, evidence access, edit/PDPD handoff, guard; tách cache/DTO public.
- [x] T050 [FE][REQ-EXP-DETAIL-004][UI-EXP-006] CTA tư vấn gửi notification tạm thời tới các tài khoản quản trị NacenTech; lỗi/cấu hình thiếu hiển thị Error, không giả lập success.
- [x] T051 [ZALO][REQ-EXP-DETAIL-005][UI-EXP-007] Thêm deep link `Xem hồ sơ` trong `SourceCode/ZaloMiniApp/src/pages/me.tsx`; không đưa token/PII vào URL.
- [x] T052 [TEST][BR-EXP-020][BR-EXP-021][BR-EXP-022][BR-EXP-023][BR-EXP-024] Unit contract test PII deny-list/immutable expert code, invariant test publish rule, EF pending-model check và PostgreSQL schema/index verification.
- [x] T053 [TEST][UI-EXP-004][UI-EXP-005][UI-EXP-006][UI-EXP-007] Cài Vitest + Testing Library; component tests Public profile/404/CTA pass 2/2; build backend/Web/Zalo sạch.

---

## Phase 10: Delta v6 — Đăng nhập thật và Owner Detail E2E

- [x] T054 [BE][REQ-EXP-AUTH-002][BR-EXP-026][API-EXP-AUTH-001] Chuẩn hóa portal login để account active `VERIFIED_EXPERT` nhận JWT thật; giữ admin login giới hạn nhóm admin; response login trả role/scope/fullName chuẩn, không ép role thành legacy `user`.
- [x] T055 [BE][REQ-EXP-AUTH-003][BR-EXP-027][BR-EXP-028] Tạo fixture/command Development idempotent liên kết Person chuyên gia thật với `CG-NACEN-DEMOIT01`; password qua development secret, không hard-code/không log. Chỉ tạo migration non-destructive nếu kiểm tra schema môi trường đích thiếu unique/index cần thiết.
- [x] T056 [BE][REQ-EXP-AUTH-003][REQ-EXP-AUTH-004][API-EXP-AUTH-002] Khóa Owner Detail theo `sub`/`PersonId`, map rõ 401/403/404 và bảo toàn public PII deny-list/audit hiện có.
- [x] T057 [FE][REQ-EXP-AUTH-001][BR-EXP-025][UI-EXP-AUTH-001] Dùng canonical API base cho Login/Register; xóa fallback `DEMO_ACCOUNTS`/`mock-jwt-token`; chỉ lưu session sau response JWT hợp lệ và hiển thị lỗi network/4xx/5xx thật.
- [x] T058 [FE][REQ-EXP-AUTH-004][BR-EXP-026][UI-EXP-AUTH-002] Áp RoleGuard/session recovery cho `/portal/expert/profile`; owner API gọi Bearer thật, 401 clear session/CTA login, 403/404/Error phân biệt 5 UX states.
- [x] T059 [TEST][REQ-EXP-AUTH-001][REQ-EXP-AUTH-002][REQ-EXP-AUTH-003][BR-EXP-025..029] Unit/API/DB integration cho login role/scope/JWT, fixture idempotent, owner isolation và không mock session; component tests login/owner states pass.
- [x] T060 [E2E][REQ-EXP-AUTH-004][REQ-EXP-AUTH-005] Local E2E account chuyên gia thật → login → `/portal` → `/portal/expert/profile` Full Detail pass; negative sai mật khẩu/token invalid, owner isolation và token recovery pass; regression public/Web/Zalo build pass.

---

## Phase 11: Delta v7 — Owner Workspace View/Edit/Completeness

- [x] T061 [FE][REQ-EXP-OWNER-001][REQ-EXP-OWNER-003] Bổ sung wireframe owner workspace, cảnh báo completeness trên Owner Detail và loại Quick Portal Switcher QA khỏi Navbar; đổi menu chuyên gia tới owner route thật.
- [ ] T062 [BE][REQ-EXP-OWNER-002][BR-EXP-030] Chuẩn hóa completeness API do backend tính và trả danh sách thiếu không lộ PII.
- [ ] T063 [FE][REQ-EXP-OWNER-001][BR-EXP-031] Thay wizard demo bằng edit contract thật, lưu nháp/nộp lại và điều hướng chính xác tới nhóm cần bổ sung.
- [ ] T064 [TEST][INT] Test completeness, quyền owner/admin, edit/re-submit và regression Web/Zalo.
- [ ] T065 [BE][REQ-EXP-OWNER-001][BR-EXP-030] Thêm owner completeness contract/API, server-side calculation và test PII/owner isolation.
- [ ] T066 [BE][REQ-EXP-OWNER-001][BR-EXP-031] Thêm canonical draft update/submit contract, optimistic version, profile-state guard và approval handoff.
- [ ] T067 [FE][REQ-EXP-OWNER-001] Xây dựng menu workspace: Tổng quan, Hồ sơ của tôi, Năng lực chuyên môn và Thông báo; điều hướng Edit theo `editAnchor`.
- [ ] T068 [TODO — PENDING PO][INT][REQ-EXP-OWNER-001] Yêu cầu tư vấn & kết nối: giữ menu `Sắp có`, chưa gọi API/không tạo dữ liệu. Chờ PO chốt cách mở rộng `CaseInvitation` cho `EXPERT_PROFILE` hoặc aggregate riêng; không triển khai order/hợp đồng/thanh toán.

---

## Phase 12: Delta v8 — Dashboard tác nghiệp chuyên gia

- [x] T069 [FE][REQ-EXP-DASH-001][REQ-EXP-DASH-002][BR-EXP-032][BR-EXP-033] Tách `/portal` theo role; render Dashboard chuyên gia từ Owner Detail với trạng thái hồ sơ, việc cần làm, thông báo Empty và lối tắt hồ sơ; giữ dashboard chung cho role khác.
- [x] T070 [TEST][REQ-EXP-DASH-001..003][BR-EXP-032..033] Thêm component test chứng minh expert chỉ thấy tác vụ hồ sơ, không thấy marketplace; chạy regression frontend build/test.

---

## Phase 13: Delta v9 — Đồng bộ PII CCCD Web/Zalo/API/DB

- [x] T071 [SPEC][REQ-EXP-PII-001..003][BR-EXP-034..035] Lập Cross-Surface Impact Matrix và Field Lifecycle theo Basic Design v2.5.
- [x] T072 [BE][DB][REQ-EXP-PII-002] Nới nullable CCCD/ngày cấp bằng migration non-destructive; bỏ validation/submit requirement, giữ dữ liệu lịch sử.
- [x] T073 [BE][API][REQ-EXP-PII-003] Loại CCCD khỏi Portal Owner/Admin DTO hiện hành và thêm contract deny-list test.
- [x] T074 [FE][ZALO][REQ-EXP-PII-001] Bỏ input/state/payload và hiển thị CCCD trên Web; xác nhận Zalo không có field.
- [x] T075 [INT][TEST][REQ-EXP-PII-001..003] Apply migration PostgreSQL thật, chạy backend test/build, frontend test/build và kiểm chứng browser. Bằng chứng: migration `20260929140000_MakeExpertIdentityCardOptional` đã áp dụng; backend invariant + API build, frontend test 7/7 + build pass; Owner UI và wizard đều không còn CCCD. Khi khởi động lại API Development, phiên JWT cũ bị hết hạn theo khóa ký mới; không phải lỗi contract CCCD.

---

## Phase 14: Hotfix & Khắc Phục Defect Black-Box Gate 4 [HOTFIX - PO COORDINATED]

> **Căn cứ tiếp nhận:** Báo cáo lỗi Black-Box Gate 4 từ QC (`Reports/BAO_CAO_DEFECT_BLACKBOX_TASK-05_TU_CHOI_GATE4.md`).  
> **Ưu tiên:** P0 (Chặn xuất xưởng toàn phân hệ TASK-05).  
> **Điều phối viên:** Product Owner (PO / Project Manager).

- [x] T076 [BE][API][DEF-05-02] Rà soát và sửa triệt để lỗi HTTP 500 tại endpoint `GET /api/v1/public/experts/{expertCode}`; kiểm tra cấu hình proxy Next.js rewrite trỏ đúng service.
- [x] T077 [BE][API][DEF-05-01] Kiểm tra route mapping cho `POST /api/v1/experts/upgrade-request`; bảo đảm API trả đúng mã HTTP 200/400/422, không để lọt 404.
- [x] T078 [FE][UI][DEF-05-01][BR-EXP-016] Gỡ bỏ hoàn toàn logic fallback thành công giả mạo trong `ExpertUpgradeForm` (`page.tsx` dòng 511-518); hiển thị `<Async state="error">` kèm thông báo lỗi trung thực khi API sập.
- [x] T079 [FE][VALIDATION][DEF-05-03][DEF-05-04] Bổ sung ràng buộc Client: Năm sinh $1940 \le \text{Năm sinh} \le 2026$; Số điện thoại bắt buộc regex 10 chữ số chuẩn viễn thông Việt Nam (`/(84|0[3|5|7|8|9])+([0-9]{8})\b/`).
- [x] T080 [FE][SEC][DEF-05-05] Sanitize và escape toàn bộ dữ liệu đầu vào chuỗi ký tự (`fullName`, `institution`) chống lỗ hổng Stored XSS khi render.
- [x] T081 [QC][REGRESSION] Chạy lại kịch bản Pure Black-Box Playwright (`test_task05_expert_lifecycle_e2e.py`); xác nhận 100% 5 lỗi chuyển sang trạng thái CLOSED trước khi ký duyệt mở Gate 4.

---

## Phase 15: Delta v10 — Danh bạ Tìm kiếm & Lọc Chuyên gia Công Khai (`/experts` & `/chuyen-gia`)

- [x] T082 [CONTRACT][BE] Bổ sung DTO `ExpertPublicDirectoryDto` và `ExpertPublicCardDto` trong `modules/brokerage/Application/Contracts.cs` tuân thủ nghiêm ngặt bảo mật PII (ẩn CCCD, SĐT, Email).
- [x] T083 [BE][API] Cài đặt endpoint `GET /api/v1/public/experts` trong `ExpertController.cs` hỗ trợ tìm kiếm toàn văn (`q`), lọc theo học vị (`degree`), ngành TT17 (`sectorCode`), tỉnh thành (`provinceCode`) và phân trang (`page`, `pageSize`).
- [x] T084 [FE][UI] Xây dựng trang Danh bạ `/experts` (`SourceCode/frontend/src/app/experts/page.tsx`) theo wireframe `wireframe_danh_ba_chuyen_gia.html`: Khung tìm kiếm Hero, Sidebar bộ lọc 4 trục, Lưới 3 cột thẻ chuyên gia chuẩn hóa, Pagination và Connect Modal.
- [x] T085 [FE][ROUTE] Cấu hình điều hướng liên thông: Chuyển hướng hoặc render trực tiếp danh bạ cho route `/chuyen-gia` (`[module]/page.tsx`), đồng bộ hoàn hảo với Header Navbar.
- [x] T086 [TEST][BE] Bổ sung Unit Tests kiểm chứng endpoint `GET /api/v1/public/experts` trong `ExpertProfileInvariantsTests.cs`: lọc chính xác, chỉ trả về chuyên gia `APPROVED`, không rò rỉ PII.
- [x] T087 [TEST][FE] Bổ sung Vitest cho trang Danh bạ `/experts`: kiểm tra render 5 trạng thái UX qua `<Async>`, tương tác bộ lọc và modal kết nối.

## Phase 16: Delta v11 — Hội tụ taxonomy, địa bàn và trải nghiệm danh bạ

- [x] T088 [DELTA-01][BD][UIUX] Cập nhật Basic Design 2.3 và wireframe danh bạ theo quyết định PO: ngành lấy động từ SECTOR active, UI compact; cập nhật wireframe library.
- [x] T089 [DELTA-02][API][DATA] Dùng endpoint `GET /api/v1/sectors` làm nguồn taxonomy; xác minh count active trong DB (seed hiện có 10 `LV`), không hardcode danh sách trong view.
- [x] T090 [DELTA-03][BE][API] Hoàn thiện lọc danh bạ theo `sectorCode` và `provinceCode` thực từ scope tỉnh của chủ hồ sơ; không gán địa bàn mặc định khi thiếu scope; hỗ trợ `q` và alias `query`.
- [x] T091 [DELTA-04][FE][UI] Tinh gọn Hero, filter desktop/mobile, filter chips, card chuyên gia, pagination và query state; loại bỏ controls không có hành vi thật.
- [x] T092 [DELTA-05][FE][API] Dùng shared Master Data client cho taxonomy/province API; retry/error state, reset/clear đúng pagination và giữ bộ lọc khi retry.
- [x] T093 [DELTA-06][FE][API] Nối modal với `POST /api/v1/public/experts/{expertCode}/consultation-requests`; giữ lỗi/retry và copy đúng người nhận là NacenTech/admin.
- [x] T094 [DELTA-07][TEST][BE] Kiểm chứng dynamic taxonomy, sector/province filtering, chỉ approved/public, phân trang, alias `query` và deny-list PII.
- [x] T095 [DELTA-08][TEST][FE] Kiểm chứng desktop/mobile states, bộ lọc kết hợp, clear/reset, retry, pagination và không hiển thị success giả cho CTA kết nối.
- [x] T096 [DELTA-09][QC][E2E] Chạy API contract + PostgreSQL integration + Playwright visual/E2E cho `/experts` và alias `/chuyen-gia`; chụp 1440×900 và 390×844.
- [x] T097 [DELTA-10][DOC][TRACE] Cập nhật TRACEABILITY, ROADMAP và lịch sử thay đổi sau khi Gate 4 pass; chỉ khi đó đánh dấu Delta v11 hoàn tất.
- [x] T098 [DELTA-11][BE][API][TEST] Khớp tham số từ khóa legacy `query` và client `q` trên public directory; khi cùng gửi cả hai thì `q` ưu tiên.
  - *Kiểm chứng*: API contract/integration chứng minh `q` và `query` cho cùng tập kết quả tương đương; xung đột hai tham số chọn `q`; các query filter khác giữ nguyên.


---

## Phase 17: Delta v12 — Đồng bộ taxonomy ngành động toàn hệ thống [CR-2026-005]

- [x] T099 [FE][TASK-00][REQ-MD-SECTOR-001] Tạo shared active-sector master-data client và dùng tại Home; count/list/link filter lấy từ DB.
- [x] T100 [FE][TASK-05][REQ-EXP-DB-005] Nâng hạng chuyên gia dùng sector code active; bỏ default/các lựa chọn ngành tĩnh.
- [x] T101 [FE][AI][API][TASK-05] CV parser nạp danh mục sector tại runtime, prompt nhận code/name động và trả lỗi nếu API/taxonomy trống.
- [x] T102 [FE][BE][TASK-06] Admin taxonomy bỏ seed fallback/local-only create, dùng DB API; count, filter options và category list động.
- [x] T103 [DELTA-05] [BE][API][TASK-06] Xóa CoreSectors fallback; `/master-data/tt17` lấy category active từ taxonomy; matrix sector labels resolve runtime.
- [x] T104 [FE][TASK-07] Admin role sector scope chọn từ taxonomy active; thay nhãn/count tĩnh ở admin nav/dashboard/login/GOV.
- [x] T105 [FE][TASK-05] Public expert detail resolve sector codes thành names từ master data và giữ keywords riêng biệt.
- [x] T106 [DELTA-08] [TEST][EC] Cập nhật chiến lược/case cho toàn bộ bề mặt: DB/API taxonomy, empty/error behavior, runtime add/deactivate/rename, forms/projections, cross-surface visual + RBAC.
- [x] T107 [DELTA-09] [INT][TRACE] Chạy backend/frontend build, unit/contracts, PostgreSQL integration, Playwright E2E/visual và traceability; ghi evidence, không tick nếu môi trường không khả dụng.

- [x] T108 [DELTA-10][ZALO][REQ-MD-SECTOR-001][API-EXP-INTAKE-002] Remove SECTORS_18 and default 01; load active sectors via API, show loading/error/empty/retry, validate before submit; compile and cross-channel QC.

- [x] T113 [DELTA-13][BE] Implement signed72h hash-only draft token lookup with safeDTO and configuredfrontendURL; rejectexpired/tampered/legacytokens.
- [x] T109 [DELTA-13][BE] Claimoriginaldraft and consume onlyon successfulofficialsubmission atomicallywithapproval enqueue; preserveevidence andownerauthorization.
- [x] T110 [DELTA-13][FE] SendoptionalDraftToken duringofficialsubmission andpreserveruntimeindustryselection; honesterror/partialprefill.
- [x] T111 [DELTA-13][TEST] VerifyrealDB lookup/expiry/tampering/one-timeclaim/validationrollback plushandoffUI.

- [x] T112 [DELTA-12][BE][DB][API][TEST] Lưu SpecializedKeywords độc lập ExpertiseSectors; optional additive contract, text[] migration, draft/owner/admin/public roundtrip và kiểm chứng thực.

---

## Phase 18: Delta v14 — Form Chỉnh Sửa Hồ Sơ Chuyên Gia & Completeness Engine [CR-2026-007]

- [x] `T114` **[BE][DOMAIN][REQ-EXP-EDIT-001][BR-EXP-041..043]** Thêm method `UpdateProfileDetails` và `CalculateCompleteness` trong `ExpertProfile.cs`; bảo đảm invariants về trạng thái `PENDING_REVIEW`, học vị và cơ quan bắt buộc.
- [x] `T115` **[BE][CONTRACT][REQ-EXP-EDIT-001..002]** Thêm DTO `UpdateExpertProfileRequest` và `ExpertCompletenessDto` trong `modules/brokerage/Application/Contracts.cs`.
- [x] `T116` **[BE][SERVICE][REQ-EXP-EDIT-001..002]** Cài đặt `UpdateMyProfileAsync` và `GetMyCompletenessAsync` trong `ExpertService.cs`.
- [x] `T117` **[BE][API][REQ-EXP-EDIT-001..002]** Bổ sung endpoints `PUT /api/v1/experts/my-profile` và `GET /api/v1/experts/me/completeness` trong `ExpertController.cs` kèm phân quyền `VERIFIED_EXPERT`, validation taxonomy và audit log.
- [x] `T118` **[BE][TEST][BR-EXP-041..043]** Viết Unit Invariants tests cho `UpdateProfileDetails`, `CalculateCompleteness` và validation trong `ExpertProfileInvariantsTests.cs`.
- [x] `T119` **[FE][CLIENT][REQ-EXP-EDIT-001..002]** Bổ sung các hàm client `updateMyExpertProfile` và `getMyExpertCompleteness` vào `src/lib/expert-detail.ts`.
- [x] `T120` **[FE][UI][REQ-EXP-EDIT-001..004]** Xây dựng trang `/portal/expert/profile/edit` bám sát `wireframe_chinh_sua_ho_so_chuyen_gia.html`, bọc `RoleGuard(VERIFIED_EXPERT)`, xử lý 5 UX states qua `<Async>`, và cập nhật nút link trên `/portal/expert/profile`.
- [x] `T121` **[FE][TEST][AC-EDIT-01..03]** Viết Vitest component test cho `edit/page.tsx` và regression test cho `profile-detail.tsx`, đảm bảo 100% tests pass.

---

## Phase 19: Delta v15 — Background Worker & In-App Notification Reminders [CR-2026-008]

- [x] `T122` **[BE][CONTRACT][REQ-EXP-REMIND-001]** Khai báo notification type `NotificationTypes.ExpertCompletenessReminder = "expert_completeness_reminder"` trong `modules/communication/Application/Contracts.cs`.
- [x] `T123` **[BE][WORKER][REQ-EXP-REMIND-002][BR-EXP-044..046]** Xây dựng `ExpertCompletenessReminderWorker` kế thừa `BackgroundService` tại `packages/persistence/Workers/ExpertCompletenessReminderWorker.cs`. Quét hồ sơ chuyên gia `Status == APPROVED` có `PersonId != null`, lọc điều kiện completeness `< 70%` hoặc stale `> 30 ngày`, kiểm tra chống spam/idempotency (tối đa 1 thông báo/chuyên gia trong 7 ngày), gửi in-app notification chi tiết kèm link dẫn về `/portal/expert/profile/edit`.
- [x] `T124` **[BE][DI][REQ-EXP-REMIND-003]** Đăng ký `ExpertCompletenessReminderWorker` vào `IServiceCollection` trong `packages/persistence/PersistenceServiceCollectionExtensions.cs` thông qua `AddNacenTechWorkers()`.
- [x] `T125` **[BE][TEST][BR-EXP-044..046]** Viết trọn bộ kiểm thử xUnit cho `ExpertCompletenessReminderWorker`: kiểm chứng chỉ duyệt `APPROVED`, lọc điểm `< 70%` và stale `> 30 ngày`, chặn gửi lặp trong vòng 7 ngày, tính toán chính xác số lượng thông báo được phát đi.
- [x] `T126` **[INT][GUARD-RAILS][GATE-5]** Chạy toàn bộ test suites (`dotnet test`, `npm test`), chạy `./Agent/scripts/guard-rails.sh`, tick `[x]` T122..T126, cập nhật `ROADMAP.md` và nghiệm thu xuất xưởng.


