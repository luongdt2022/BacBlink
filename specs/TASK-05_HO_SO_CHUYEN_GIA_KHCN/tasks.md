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

---

## Phase 20: Delta v16 — Không Gian Quản Trị Tài Khoản Chuyên Gia (Account Workspace) [CR-2026-013]

- [x] `T127` **[FE][LAYOUT][REQ-EXP-ACC-001]** Cập nhật `expertNavItems` trong `src/app/portal/layout.tsx`: Thêm item đầu tiên `Tài khoản Chuyên gia` (`/portal/expert/account`, icon `ShieldCheck` hoặc `UserCheck`), cấu trúc lại Sidebar thành 6 mục theo đúng Quyết định PO-DEC-20261014-01.
- [x] `T128` **[FE][UI][REQ-EXP-ACC-001..003]** Xây dựng trang `src/app/portal/expert/account/page.tsx` bám sát `wireframe_expert_account.html`, bọc `RoleGuard(VERIFIED_EXPERT)`, xử lý 5 UX states qua `<Async>`, triển khai đầy đủ 5 khối chức năng: Khối 1 (Định danh khoa học & QĐ phê duyệt cấp Sở), Khối 2 (Thiết lập sẵn sàng tiếp nhận tư vấn On/Off), Khối 3 (Thước đo hoàn thiện hồ sơ Completeness Engine 5 trụ cột), Khối 4 (Bảo mật, Active Sessions đa thiết bị và Định danh Zalo Mini App), Khối 5 (Tùy chọn trải nghiệm & Cấu hình thông báo SLA Deal Room).
- [x] `T129` **[FE][TEST][AC-ACC-01..02]** Cập nhật test `src/app/portal/layout.test.tsx` (kiểm chứng item 1/6 `Tài khoản Chuyên gia` cho vai trò `VERIFIED_EXPERT`) và viết Vitest component test cho `src/app/portal/expert/account/page.tsx` (kiểm chứng 5 UX states, tương tác toggle và render 5 khối chức năng).
- [x] `T130` **[INT][GUARD-RAILS][GATE-5]** Chạy kiểm thử hồi quy `npm test`, kiểm tra TypeScript compiler và nghiệm thu hoàn tất xuất xưởng `[x]`.

---

## Phase 21: Delta v17 — Chuẩn Hóa Bàn Làm Việc Chuyên Gia, Hộp Thư Tư Vấn 3 Tab & Kanban TRL 1-9 [PO-DEC-20261014-02]

- [x] `T131` **[FE-TASK-05-DELTA-01][FE][LAYOUT][REQ-EXP-UI-007] Sửa layout.tsx & Triệt tiêu lỗi active menu**
  - **Mục tiêu**: Tái cấu trúc thanh Sidebar Workspace Chuyên gia thành 6 mục độc lập và cài đặt thuật toán xác định active menu chính xác tuyệt đối.
  - **Hành động kỹ thuật**:
    + Thêm hàm `resolveExpertActiveMenu(pathname: string): string` xuất khẩu trong `src/app/portal/layout.tsx` (hoặc module router helper) với 6 key tương ứng: `account`, `profile`, `profile-edit`, `consultations`, `radar`, `projects`.
    + Cập nhật mảng `expertNavItems` gán `key` rõ ràng cho từng item:
      1. `account` (`/portal/expert/account`, `ShieldCheck`)
      2. `profile` (`/portal/expert/profile`, `LayoutDashboard`)
      3. `profile-edit` (`/portal/expert/profile/edit`, `GraduationCap`)
      4. `consultations` (`/portal/expert/consultations`, `Inbox`)
      5. `radar` (`/portal/matching/radar`, `Sparkles`)
      6. `projects` (`/portal/expert/projects`, `Kanban`)
    + Thay đổi cơ chế so khớp `isActive`: Đối với chuyên gia, so sánh `item.key === resolveExpertActiveMenu(pathname)`.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Truy cập `/portal/expert/consultations`: Chỉ mục "Hộp Thư Tư Vấn & Kết Nối" sáng màu active (`bg-brand-700 text-white`), mục "Dự án Đồng hành & Hợp tác" không bị active nhầm.
    + Truy cập `/portal/expert/projects`: Chỉ mục "Dự án Đồng hành & Hợp tác" sáng màu active.
    + Không có bất kỳ liên kết nào của Chuyên gia trỏ về `/portal/opportunities/pipeline?type=consulting` hay `/portal/opportunities/pipeline`.

- [x] `T132` **[FE-TASK-05-DELTA-02][FE][UI][REQ-EXP-UI-008][BR-EXP-011..012] Xây dựng trang Hộp thư tư vấn /portal/expert/consultations**
  - **Mục tiêu**: Xây dựng phân hệ Hộp thư tư vấn 3 tab nghiệp vụ theo chuẩn wireframe `wireframe_quan_ly_yeu_cau_tu_van_chuyen_gia.html`.
  - **Hành động kỹ thuật**:
    + Tạo mới trang `src/app/portal/expert/consultations/page.tsx` bọc `RoleGuard(["VERIFIED_EXPERT", "EXPERT"])`.
    + Cài đặt thanh tab 3 trạng thái với Badge đếm bản ghi động: Tab 1 "Lời Mời Chờ Xử Lý (03)", Tab 2 "Lịch Hẹn Sắp Tới (02)", Tab 3 "Đã Hoàn Thành (14)".
    + Tab 1: Render các thẻ lời mời tư vấn với bộ đếm ngược SLA 48h (tự động chuyển màu đỏ khi $\le 24$h), phân biệt nguồn Cấp Sở (Quỹ ĐMST chi trả thù lao) vs Doanh nghiệp đặt trực tiếp (kèm điểm TNI ĐMST), Modal "Đồng ý tư vấn & Chọn lịch hẹn" (chọn ngày/giờ/link Zoom), Modal "Từ chối tư vấn & Nêu lý do bắt buộc".
    + Tab 2: Render thẻ lịch hẹn trực tuyến, link Zoom/Meet, tính toán thời gian nút "Vào Phòng Họp" (sáng nút trước 15 phút, hiển thị countdown nếu chưa tới giờ họp), liên kết tải tệp đính kèm pre-read.
    + Tab 3: Render thẻ lịch sử tư vấn, nút xem/tải Biên bản tư vấn kỹ thuật (MoA), đánh giá 2 chiều (5 sao) và nhãn trạng thái quyết toán thù lao (`ĐÃ QUYẾT TOÁN THÙ LAO` / `ĐANG ĐỐI SOÁT HỒ SƠ`).
    + Tích hợp 5 UX states qua component `<Async>`.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Chuyển tab mượt mà, đúng badge số lượng.
    + Thẻ có thời gian còn $\le 24$h hiển thị viền đỏ và text cảnh báo `Còn XX giờ để phản hồi`.
    + Nhấn chấp thuận mở modal, submit cập nhật danh sách và chuyển lịch sang Tab 2.
    + Nhấn từ chối mở modal, chặn submit nếu chưa nhập lý do từ chối.
    + Nút "Vào Phòng Họp" bị disable kèm countdown nếu thời gian họp còn cách $> 15$ phút.

- [x] `T133` **[FE-TASK-05-DELTA-03][FE][UI][REQ-EXP-UI-009..010][BR-EXP-013] Xây dựng trang Kanban Dự án Đồng hành /portal/expert/projects**
  - **Mục tiêu**: Xây dựng bảng Kanban đàm phán và đồng hành R&D dài hạn 5 cột TRL 1-9, loại bỏ dứt điểm chức năng sai thẩm quyền và chữ "Trống" thô thiển.
  - **Hành động kỹ thuật**:
    + Tạo mới trang `src/app/portal/expert/projects/page.tsx` bọc `RoleGuard(["VERIFIED_EXPERT", "EXPERT"])`.
    + Loại bỏ hoàn toàn nút "Giám sát Sở KH&CN"; thay bằng bộ công cụ chuyên gia: Bộ lọc Lĩnh vực TT17, Bộ lọc Thang đo TRL (`All`, `TRL 1-3`, `TRL 4-6`, `TRL 7-9`), Ô tìm kiếm dự án, Nút "Xuất Báo Cáo Tiến Độ Đồng Hành".
    + Xây dựng 5 cột Kanban: `INTAKE_NDA` (Tiếp nhận & Ký NDA), `DEAL_ROOM` (Đàm phán Deal Room 1-1), `TRL_ASSESSMENT` (Thẩm định TRL), `MOU_SIGNED` (Ký kết Thỏa thuận MOU), `TRANSFER_COMPLETED` (Đồng hành Chuyển giao & Nghiệm thu).
    + Xây dựng thẻ dự án TRL (`ExpertProjectCard`): Mã `PRJ-EXP-YYYY-XXXX`, badge trạng thái bảo mật (`CHỜ KÝ NDA`, `NDA ĐÃ KÝ`, `DỰ THẢO MOU`, `ĐANG NGHIỆM THU`), thanh đo TRL kép (`[TRL Hiện tại] -> [TRL Mục tiêu]`), đối tác DN, kinh phí R&D dự kiến, deadline SLA mốc thẩm định, nút [VÀO DEAL ROOM 1-1].
    + Triệt tiêu hoàn toàn chữ "Trống" thô sơ trên các cột: Chuẩn hóa 5 UX states cho từng cột qua component `<Async>` (Loading Skeleton, Ideal thẻ TRL, Empty State nét đứt có icon + CTA "Khám Phá Radar Cơ Hội AI" dẫn về `/portal/matching/radar`, Error State + Retry, Filtered Empty + Reset).
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Giao diện tuyệt đối không tồn tại nút "Giám sát Sở KH&CN".
    + Tuyệt đối không xuất hiện chữ "Trống" thô sơ ở bất kỳ cột Kanban nào khi không có dữ liệu.
    + Cột rỗng hiển thị hộp nét đứt thẩm mỹ có nút CTA chuyển về Radar AI.
    + Thẻ dự án hiển thị trực quan lộ trình nâng cấp TRL (ví dụ TRL 4 -> TRL 6).
    + Bộ lọc TRL và Lĩnh vực lọc chính xác danh sách dự án trên các cột.

- [x] `T134` **[FE-TASK-05-DELTA-04][FE][SEC][REQ-EXP-UI-007][BR-EXP-014] Cập nhật RoleGuard mở quyền song song EXPERT & VERIFIED_EXPERT**
  - **Mục tiêu**: Phân định rõ ràng ma trận phân quyền Scoped RBAC và bảo vệ an toàn PII chuyên gia theo Nghị định 13/2023/NĐ-CP.
  - **Hành động kỹ thuật**:
    + Cấu hình RoleGuard tại `src/app/portal/layout.tsx` và các tuyến trang chuyên gia hỗ trợ cả `VERIFIED_EXPERT` và `EXPERT`.
    + Tại `/portal/expert/consultations` và `/portal/expert/projects`: Kiểm tra trạng thái người dùng. Nếu là `EXPERT` (hồ sơ đang chờ duyệt cấp Sở), hiển thị Banner cảnh báo màu hổ phách giải thích tài khoản đang chờ phê duyệt, khóa các chức năng ký biên bản hoặc nhận ủy thác tư vấn có thù lao Quỹ ĐMST.
    + Đảm bảo người dùng công chúng hoặc doanh nghiệp không xem được SĐT/Email cá nhân của chuyên gia trên danh bạ trước khi phiên tư vấn được chấp thuận.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Người dùng `VERIFIED_EXPERT` thao tác không giới hạn trên cả 6 màn hình.
    + Người dùng `EXPERT` xem được thông tin nhưng thấy banner hướng dẫn chờ duyệt tại trang Consultations và Projects.
    + Người dùng `BUYER` / `USER` truy cập các route `/portal/expert/*` bị RoleGuard chặn và điều hướng về trang thông báo quyền truy cập.

- [x] `T135` **[TEST-TASK-05-DELTA-01][FE][TEST][REQ-EXP-UI-007..010] Unit test & Component test cho các màn hình và router helper**
  - **Mục tiêu**: Bảo đảm chất lượng mã nguồn, độ tin cậy của router helper và ngăn ngừa lỗi hồi quy (regression) bằng kiểm thử tự động.
  - **Hành động kỹ thuật**:
    + Bổ sung unit tests cho hàm `resolveExpertActiveMenu` trong `src/app/portal/layout.test.tsx` (kiểm tra đầy đủ 6 routes và loại trừ xung đột active giữa consultations và projects).
    + Viết file test mới `src/app/portal/expert/consultations/consultations.test.tsx`: kiểm tra render 3 tab, chuyển tab, cảnh báo SLA $\le 24$h, hiển thị modal chấp thuận/từ chối, trạng thái rỗng và lỗi.
    + Viết file test mới `src/app/portal/expert/projects/projects.test.tsx`: kiểm tra 5 cột TRL, assertion không chứa text "Giám sát Sở KH&CN", assertion không chứa text "Trống", kiểm tra render thẻ TRL và CTA dẫn về Radar AI.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Chạy `npm test` trong `SourceCode/frontend` vượt qua 100% test suites (0 fail).
    + Chạy `pnpm build` hoặc `npm run build` không phát sinh bất kỳ lỗi TypeScript compiler nào.





---

## Giai Đoạn Delta v17: Tối Ưu Hóa UI/UX Danh Bạ Chuyên Gia & Bộ Lọc Đa Tiêu Chí [CR-2026-016]

- [x] `T136` **[BE-TASK-05-DELTA-v17-01][BE][API][REQ-EXP-DIR-MULTI-SELECT][BR-EXP-DIR-MULTI-FILTER] Mở rộng API GET /api/v1/public/experts hỗ trợ multi-filter (degrees, sectorCodes)**
  - **Mục tiêu**: Nâng cấp API công khai danh bạ chuyên gia hỗ trợ nhận lọc đa tiêu chí linh hoạt, giữ vững tính tương thích ngược hoàn toàn.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/backend/apps/api/V1Compat/ExpertController.cs` (`PublicExpertController`): Bổ sung tiếp nhận `degrees` và `sectorCodes` (hỗ trợ cả mảng query param lặp `degrees=GS&degrees=PGS` và chuỗi CSV `degrees=GS,PGS`), đồng thời duy trì tiếp nhận tham số đơn trị cũ `degree` và `sectorCode`.
    + Trong `SourceCode/backend/modules/brokerage/Application/ExpertService.cs` (`GetPublicDirectoryAsync`): Cập nhật query handler để áp dụng logic OR trong cùng nhóm tiêu chí (`degrees.Contains(Degree) || degrees.Contains(AcademicRank)` và `ExpertiseSectors.Any(s => sectorCodes.Contains(s))`), đồng thời áp dụng logic AND giữa các nhóm tiêu chí khác nhau (`Degrees`, `Sectors`, `ProvinceCode`, `AcceptingConsultation`, `Keyword`).
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Gọi `GET /api/v1/public/experts?degrees=GS,PGS`: Trả về chuyên gia có học hàm GS hoặc PGS (OR).
    + Gọi `GET /api/v1/public/experts?sectorCodes=LV01,LV05`: Trả về chuyên gia thuộc ngành LV01 hoặc LV05 (OR).
    + Gọi `GET /api/v1/public/experts?degree=GS`: Tương thích ngược thành công, trả về các GS.
    + Kết hợp `degrees=GS,PGS&sectorCodes=LV01&provinceCode=HN`: Trả về chuyên gia thỏa mãn đồng thời tất cả các nhóm tiêu chí (AND).

- [x] `T137` **[FE-TASK-05-DELTA-v17-01][FE][UI][REQ-EXP-DIR-TECH-LABEL][UI-EXP-DIR-CARD-POLISH] Xây dựng Technology Label Resolver & Tinh chỉnh Thẻ Chuyên Gia**
  - **Mục tiêu**: Xóa bỏ hoàn toàn chuỗi mã kỹ thuật thô (`TECH-...`) và font-mono trên Thẻ Chuyên gia; thay thế bằng nhãn tiếng Việt rõ nghĩa và font-sans trang nhã.
  - **Hành động kỹ thuật**:
    + Tạo mới tệp `SourceCode/frontend/src/lib/tech-label-resolver.ts` chứa từ điển 18 mã công nghệ Master Data tiếng Việt thân thiện (ví dụ `TECH-SUPERCRITICAL-CO2` $\rightarrow$ *"Chiết xuất CO2 siêu tới hạn"*, `TECH-AI-VISION` $\rightarrow$ *"Thị giác máy tính AI"*...) và hàm fallback chuyển đổi Title Case cho mã mới phát sinh ngoài từ điển.
    + Cập nhật component render thẻ chuyên gia trong `SourceCode/frontend/src/app/experts/page.tsx`: Sử dụng `resolveTechLabel(code)` để hiển thị nhãn công nghệ, thay thế `font-mono` bằng `font-sans` với badge style bo góc nhẹ (`bg-slate-100 text-slate-700 border border-slate-200`).
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Không xuất hiện bất kỳ chuỗi mã thô nào bắt đầu bằng `TECH-` trên thẻ chuyên gia.
    + Không có bất kỳ thẻ tag công nghệ nào sử dụng class `font-mono`.
    + Mã lạ chưa có trong từ điển tự động hiển thị dạng Title Case sạch đẹp.

- [x] `T138` **[FE-TASK-05-DELTA-v17-02][FE][UI][REQ-EXP-DIR-STATS-DISPLAY][BR-EXP-DIR-HIDE-ZERO-METRICS][UI-EXP-DIR-CARD-POLISH] Thiết kế Khối Chỉ Số Thành Tựu Thông Minh (Ẩn toàn bộ số 0)**
  - **Mục tiêu**: Triệt tiêu toàn bộ các ô hiển thị số liệu 0 xám xịt trên Thẻ Chuyên gia theo triết lý "Cái gì đẹp show ra, không có thì ẩn đi".
  - **Hành động kỹ thuật**:
    + Cập nhật logic render khối thống kê trong `SourceCode/frontend/src/app/experts/page.tsx`.
    + Loại bỏ layout cố định grid 3 cột đếm số cũ.
    + Chỉ hiển thị các Badge/Chip thành tựu cho các chỉ số có giá trị $> 0$ (`publicationCount > 0`, `patentCount > 0`, `projectCount > 0`).
    + Trường hợp chuyên gia chưa có chỉ số nào $> 0$ ($\sum = 0$): Ẩn hoàn toàn toàn bộ container khối chỉ số khỏi DOM, không để lại khoảng trống layout bất thường.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Tuyệt đối không xuất hiện con số "0" trong phần thành tựu trên bất kỳ thẻ chuyên gia nào.
    + Chuyên gia có $\sum = 0$ có layout thẻ gọn gàng, liền mạch với phần CTA footer bên dưới.
    + Chuyên gia có chỉ số $> 0$ hiển thị các Chip nổi bật kèm icon nhận diện chuyên ngành.

- [x] `T139` **[FE-TASK-05-DELTA-v17-03][FE][UI][REQ-EXP-DIR-MULTI-SELECT][BR-EXP-DIR-MULTI-FILTER][UI-EXP-DIR-FILTER-CHECKBOX] Chuyển đổi Bộ Lọc Học Vị & Lĩnh Vực sang Checkbox Đa Chọn và Đồng bộ URL**
  - **Mục tiêu**: Cho phép người dùng chọn cùng lúc nhiều học vị và nhiều ngành nghề, đồng bộ trạng thái 2 chiều với URL Search Parameters.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/frontend/src/app/experts/page.tsx`: Chuyển đổi radio button sang Checkbox cho 2 trục "Học hàm & Học vị" và "Lĩnh vực chuyên môn".
    + Quản lý state `selectedDegrees: string[]` và `selectedSectors: string[]`.
    + Hiển thị số lượng mục đang được chọn trên tiêu đề nhóm lọc: `Học hàm & Học vị (N)` và `Lĩnh vực chuyên môn (N)`.
    + Tích hợp ô tìm kiếm nhanh ngành nghề `sectorSearch` và giới hạn khung cuộn `max-h-52`.
    + Đồng bộ hóa 2 chiều state với URL Search Parameters (`degrees=...`, `sectorCodes=...`), đảm bảo F5 hoặc chia sẻ link giữ nguyên trạng thái lọc.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Có thể tích chọn đồng thời nhiều checkbox (ví dụ cả GS và PGS).
    + Tìm kiếm nhanh ngành nghề trong danh sách mượt mà.
    + URL cập nhật tham số tương ứng mỗi khi thay đổi checkbox.
    + Tải lại trang (F5) khôi phục chính xác các checkbox đã tích chọn trước đó.

- [x] `T140` **[FE-TASK-05-DELTA-v17-04][FE][UI][REQ-EXP-DIR-PROVINCE-SCOPE][BR-EXP-DIR-PROVINCE-GOV-SCOPE] Chuẩn hóa Dropdown Địa Bàn về 34 Sở KH&CN Trọng Điểm (<optgroup> 3 Miền)**
  - **Mục tiêu**: Thu hẹp và chuẩn hóa danh mục địa bàn về đúng 34 Sở KH&CN trọng điểm thuộc mạng lưới liên thông NacenTech, phân chia trực quan theo 3 miền.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/frontend/src/app/experts/page.tsx`: Cập nhật cấu trúc `<select>` địa bàn với 3 nhóm `<optgroup>` dựa trên thuộc tính `region` (`NORTH`, `CENTRAL`, `SOUTH`) trả về từ API `GET /api/v1/governance/org-units/public-provinces`.
    + Ba nhóm miền: `Miền Bắc (12 Tỉnh/TP)`, `Miền Trung & Tây Nguyên (10 Tỉnh/TP)`, `Miền Nam (12 Tỉnh/TP)`.
    + Tùy chọn mặc định: `Tất cả địa bàn (34 Sở KH&CN)`.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Dropdown hiển thị rõ ràng 3 phân nhóm `<optgroup>` với đúng số lượng tỉnh thành chuẩn hóa.
    + Chọn một tỉnh (ví dụ Hà Nội) gửi đúng `provinceCode=HN` lên API và trả về đúng chuyên gia được gán scope địa bàn tương ứng.

- [x] `T141` **[FE-TASK-05-DELTA-v17-05][FE][UI][UI-EXP-DIR-FILTER-CHECKBOX] Cài đặt Thanh Active Filter Chips & Hoàn thiện 5 UX States**
  - **Mục tiêu**: Nâng cao tính tiện dụng với các Chip tiêu chí đang chọn có thể gỡ nhanh độc lập và bảo đảm hoàn hảo 5 trạng thái UX Enterprise.
  - **Hành động kỹ thuật**:
    + Xây dựng thanh Active Filter Chips nằm dưới thông tin số lượng kết quả: hiển thị từng Chip cho từ khóa tìm kiếm, từng học vị đã chọn, từng ngành đã chọn, địa bàn và trạng thái tư vấn.
    + Bấm `×` trên từng chip gỡ bỏ chính xác tiêu chí đó và tự động nạp lại danh bạ.
    + Nút `[Đặt lại bộ lọc]` trên thanh Chips và đầu Sidebar xóa sạch mọi tiêu chí về mặc định.
    + Đảm bảo 5 UX States: Loading (6 Skeleton Shimmer Cards), Ideal (Lưới Thẻ Chuyên gia 3 cột), Empty State (Hộp nét đứt thẩm mỹ có CTA Đặt lại bộ lọc), Error State (Card cảnh báo đỏ kèm CTA Thử lại), Updating transition mượt mà.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Bấm `×` trên một Chip học vị (ví dụ GS) chỉ bỏ chọn GS, giữ nguyên các học vị hoặc ngành nghề khác đang chọn.
    + Bấm `[Đặt lại bộ lọc]` xóa sạch URL query và khôi phục giao diện mặc định.
    + Mất mạng hoặc API lỗi hiển thị Error State đạt chuẩn kèm nút Thử lại.

- [x] `T142` **[TEST-TASK-05-DELTA-v17-01][TEST][BE] Unit tests Backend cho Multi-Filter Directory Query**
  - **Mục tiêu**: Kiểm thử tự động hóa logic kết hợp điều kiện OR và AND trên API và query handler.
  - **Hành động kỹ thuật**:
    + Viết test cases trong `SourceCode/backend/tests/integration/ExpertPublicDirectoryMultiFilterTests.cs`.
    + Kiểm tra parser nhận query dạng lặp, CSV và tham số đơn.
    + Kiểm tra kết quả truy vấn khớp logic OR nội bộ nhóm (nhiều degrees, nhiều sectorCodes) và AND liên nhóm.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Chạy `dotnet test` trong backend vượt qua 100% test cases mới.

- [x] `T143` **[TEST-TASK-05-DELTA-v17-02][TEST][FE] Unit & Component tests Frontend cho Resolver, Stats và Multi-Filter Checkbox**
  - **Mục tiêu**: Ngăn ngừa lỗi hồi quy UI/UX, bảo đảm không lộ mã thô, không render ô số 0 và kiểm thử đồng bộ trạng thái Checkbox.
  - **Hành động kỹ thuật**:
    + Viết unit test `SourceCode/frontend/src/lib/tech-label-resolver.test.ts` kiểm thử toàn diện từ điển 18 mã TT17 và fallback Title Case.
    + Cập nhật/Bổ sung component tests trong `SourceCode/frontend/src/app/experts/page.test.tsx` kiểm thử:
      * Không xuất hiện chuỗi `TECH-` trên thẻ.
      * Không xuất hiện thẻ đếm mang giá trị "0".
      * Thẻ của chuyên gia có $\sum = 0$ không render khối thành tựu.
      * Tích chọn nhiều checkbox cập nhật danh sách filter chips.
      * Dropdown địa bàn chứa đủ 3 `<optgroup>`.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Chạy `npm test` trong frontend vượt qua 100% test suites (0 fail).
    + Chạy `pnpm build` hoặc `npm run build` không phát sinh lỗi TypeScript.

- [x] `TASK-05-CR144` **[CR]** [P1] (Người gửi: a Lượng) Điều chỉnh combobox tỉnh — Mục filter : ĐỊa bàn tỉnh/ Thành phố, sửa thành  combobox có thể  nhập vào tìm kiếm để filter và checkbox có thể chọn được nhiều tỉnh

---

## Giai đoạn 9: Delta v2 — Tinh chỉnh Thẻ Chuyên gia & Social Proof Kết nối

- [x] `T145` **[BE-TASK-05-DELTA-v2-01][BE][DB][DOMAIN] Cập nhật Domain Entity ExpertProfile & Migration EF Core non-destructive cho connection_count**
  - **Mục tiêu**: Bổ sung trường `ConnectionCount` vào thực thể `ExpertProfile` và tạo migration cơ sở dữ liệu phi phá hủy.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/backend/modules/brokerage/Domain/ExpertProfile.cs`: Bổ sung thuộc tính `public int ConnectionCount { get; private set; } = 0;`, thêm các phương thức domain `SetConnectionCount(int count)` và `IncrementConnectionCount()`, đảm bảo giá trị không âm và tính đóng gói AggregateRoot.
    + Trong `SourceCode/backend/modules/brokerage/Infrastructure/Persistence/Configurations.cs`: Cập nhật `ExpertProfileConfiguration` ánh xạ cột `connection_count` kiểu `integer NOT NULL DEFAULT 0`.
    + Tạo migration EF Core mới `SourceCode/backend/packages/persistence/Migrations/20261021100000_AddExpertConnectionCount.cs` với `AddColumn` có `defaultValue: 0` và method `Down` an toàn.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Áp dụng migration vào cơ sở dữ liệu PostgreSQL thành công, không làm mất hoặc thay đổi dữ liệu của bất kỳ hồ sơ chuyên gia cũ nào.
    + Mọi bản ghi `expert_profiles` hiện hữu đều có `connection_count = 0`.

- [x] `T146` **[BE-TASK-05-DELTA-v2-02][BE][API][CONTRACT] Cập nhật Contracts.cs (ExpertPublicCardDto) và ExpertService.cs ánh xạ ConnectionCount**
  - **Mục tiêu**: Mở rộng DTO trả về cho danh bạ công khai và ánh xạ trường `ConnectionCount` tại Application Service, bảo đảm 100% tương thích ngược và bảo vệ dữ liệu PDPD.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/backend/modules/brokerage/Application/Contracts.cs`: Mở rộng record `ExpertPublicCardDto` thêm tham số `int ConnectionCount = 0` (mặc định 0).
    + Trong `SourceCode/backend/modules/brokerage/Application/ExpertService.cs`: Trong phương thức `GetPublicDirectoryAsync`, gán `ConnectionCount: p.ConnectionCount` khi khởi tạo `ExpertPublicCardDto`.
    + Tuân thủ nguyên tắc Clean Architecture: không rò rỉ `DbContext` ra khỏi tầng Service/Repository, chỉ expose DTOs qua API endpoint `GET /api/v1/public/experts`.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Gọi API `GET /api/v1/public/experts` trả về JSON chứa trường `connectionCount` dạng số nguyên cho từng phần tử thẻ chuyên gia.
    + Không phát sinh bất kỳ lỗi biên dịch nào ở các consumer gọi `ExpertPublicCardDto` trước đó.

- [x] `T147` **[FE-TASK-05-DELTA-v2-01][FE][UI][FR-DELTA-01] Cập nhật interface ExpertCardItem và Spotlight Rail trên Danh bạ Chuyên gia**
  - **Mục tiêu**: Bổ sung thông tin Ngành chuyên môn chính và tối đa 2 Chip công nghệ làm chủ cho từng chuyên gia trên Băng chuyền Chuyên gia Tiêu biểu & Nổi bật (Spotlight Rail).
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/frontend/src/app/experts/page.tsx`: Cập nhật interface `ExpertCardItem` bổ sung trường tùy chọn `connectionCount?: number`.
    + Cập nhật component Spotlight Rail (`featured-experts-rail`):
      * Thêm Badge Ngành chuyên môn chính (`primarySectorName` hoặc từ `primarySectorCode` qua `sectorOptions`) với style `bg-brand-50 text-brand-800 border-brand-200 text-xs px-2 py-0.5 rounded font-semibold`.
      * Thêm tối đa 02 Chip công nghệ (`masteredTechCodes`) được giải mã tiếng Việt thân thiện qua `resolveTechLabel(code)` với style `bg-slate-100 text-slate-700 border-slate-200 text-xs px-1.5 py-0.5 rounded truncate max-w-[130px]`.
      * Tinh chỉnh cấu trúc layout của thẻ Spotlight để không bị vỡ giao diện trên màn hình nhỏ.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Thẻ Spotlight hiển thị đầy đủ Ngành chuyên môn và tối đa 2 Chip công nghệ có nhãn tiếng Việt rõ nghĩa.
    + Không bị vỡ khung hình, không tràn chữ trên cả Desktop (1440px) và Mobile (390px).

- [x] `T148` **[FE-TASK-05-DELTA-v2-02][FE][UI][FR-DELTA-02][FR-DELTA-03][BR-DELTA-01] Cập nhật Thẻ Chuyên gia: Pill Badge +N công nghệ, chuẩn hóa min-height và Social Proof Badge**
  - **Mục tiêu**: Chuẩn hóa thẩm mỹ Thẻ Chuyên gia (Expert Card), thay thế số `+1` text trần bằng Pill Badge chuẩn, cân bằng nhịp điệu thị giác và bổ sung Badge Social Proof theo điều kiện nghiêm ngặt.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/frontend/src/app/experts/page.tsx`:
      * Thay thế phần tử text trần `+{expert.masteredTechCodes.length - 2}` bằng Pill Badge chuẩn thiết kế: `bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2 py-0.5 rounded-full font-medium dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700` hiển thị chuỗi `+{expert.masteredTechCodes.length - 2} công nghệ`.
      * Cố định nhịp điệu thị giác: Họ tên chuyên gia `min-h-[44px]` với `line-clamp-2`; Cơ quan công tác `min-h-[20px]` `truncate`; Khối Ngành & Chip công nghệ `min-h-[64px]`; Nút CTA ghim ở đáy thẻ (`mt-auto`).
      * Cài đặt Social Proof Badge: Hiển thị `🤝 {expert.connectionCount} lượt kết nối` (kèm icon `Users`) với style `bg-blue-50 text-blue-700 border-blue-200 text-caption font-bold px-2 py-0.5 rounded`.
      * Cưỡng chế quy tắc `BR-DELTA-01`: CHỈ render badge Social Proof khi `expert.connectionCount !== undefined && expert.connectionCount > 0`. Tuyệt đối ẩn khỏi DOM khi `= 0` hoặc rỗng/undefined.
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Thẻ có $> 2$ công nghệ hiển thị Pill Badge `+N công nghệ` bo tròn, không còn số lơ lửng text trần.
    + Các thẻ cạnh nhau trong cùng hàng có chiều cao đồng đều, nút CTA thẳng hàng ngang.
    + Chuyên gia có `connectionCount > 0` hiển thị Badge xanh dương uy tín; chuyên gia có `connectionCount == 0` hoàn toàn không có badge này trong DOM (không xuất hiện chữ "0 lượt kết nối").

- [x] `T149` **[TEST-TASK-05-DELTA-v2-01][TEST][BE][FE] Bộ kiểm thử Unit Test & Vitest Regression Tests bảo vệ 3 tính năng Delta v2**
  - **Mục tiêu**: Xây dựng bộ kiểm thử tự động toàn diện từ Backend Domain đến Frontend UI Component, bảo vệ hệ thống trước lỗi hồi quy.
  - **Hành động kỹ thuật**:
    + Backend xUnit: Bổ sung test cases trong `SourceCode/backend/tests/invariants/ExpertProfileInvariantsTests.cs` kiểm tra domain property `ConnectionCount`, phương thức `SetConnectionCount` (chặn số âm), `IncrementConnectionCount`, và ánh xạ DTO trong `ExpertService`.
    + Frontend Vitest: Cập nhật `SourceCode/frontend/src/app/experts/page.test.tsx`:
      * Test Spotlight Rail hiển thị badge ngành và chip công nghệ giải mã tiếng Việt.
      * Test thẻ chuyên gia hiển thị Pill Badge `+N công nghệ` khi danh sách công nghệ $> 2$.
      * Test chuyên gia có `connectionCount > 0` hiển thị Social Proof Badge.
      * Test chuyên gia có `connectionCount = 0` hoặc `undefined` KHÔNG render badge và không có text "0 lượt kết nối".
  - **Tiêu chí kiểm chứng (Dev & QC)**:
    + Chạy `dotnet test` trong Backend: 100% tests pass.
    + Chạy `npm test` trong Frontend: 100% tests pass (0 fail).
    + Chạy `pnpm build` hoặc `npm run build`: biên dịch sạch 0 lỗi TypeScript.

---

## Giai đoạn 10: Delta v1.3 — Chuẩn hóa Menu Workspace Chuyên gia 7 mục & Hợp đồng Thù lao Disabled [CR-2026-006]

- [x] `T150` **[BA-TASK-05-DELTA-v1.3-01][BA][SPEC] Đặc tả Basic Design Delta & Living Spec Kit 7 mục Menu Workspace Chuyên gia**
  - **Mục tiêu**: Cập nhật SSOT Basic Design Delta và Spec Kit phản ánh quyết định PO-DEC-20261023-01 về menu 7 mục, mục Hợp đồng & Thù lao disabled kèm notification toast, và Phương án A cho quản trị thù lao tư vấn.
  - **Hành động kỹ thuật**:
    + Cập nhật `Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md` bổ sung Mục 8 và tái cấu trúc Mục 2.
    + Cập nhật `SourceCode/specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN/spec.md` bổ sung Mục 19 với REQ-EXP-NAV-001, REQ-EXP-NAV-002, REQ-EXP-NAV-003, BR-EXP-NAV-001 đến BR-EXP-NAV-003, Gherkin ACs và Traceability.
  - **Tiêu chí kiểm chứng**: Tài liệu được phê duyệt bởi PO.

- [x] `T151` **[FE-TASK-05-DELTA-v1.3-01][FE][NAV] Mở rộng type ExpertMenuKey và resolver resolveExpertActiveMenu**
  - **Mục tiêu**: Bổ sung key `contracts` và cơ chế phân giải route độc lập, triệt tiêu xung đột với các route khác.
  - **Hành động kỹ thuật**:
    + Cập nhật `SourceCode/frontend/src/lib/expert-nav.ts`: thêm `"contracts"` vào `ExpertMenuKey`.
    + Bổ sung logic phân giải `cleanPath === "/portal/expert/contracts"` và `cleanPath.startsWith("/portal/expert/contracts/")`.
  - **Tiêu chí kiểm chứng**: Chạy Vitest `src/lib/expert-nav.test.ts` pass 7/7 test cases.

- [x] `T152` **[FE-TASK-05-DELTA-v1.3-02][FE][UI] Tái cấu trúc expertNavItems 7 mục 3 khối và xử lý Disabled Item Toast**
  - **Mục tiêu**: Hiển thị menu chuyên gia theo đúng 3 khối logic, hỗ trợ badge số lượng, badge mới và badge "Sắp ra mắt" kèm toast notification khi click.
  - **Hành động kỹ thuật**:
    + Mở rộng interface `NavItem` trong `SourceCode/frontend/src/app/portal/layout.tsx` với `disabled`, `disabledMessage`, `badge`, `badgeType`.
    + Cập nhật mảng `expertNavItems` đủ 7 mục theo đúng thứ tự PO phê duyệt.
    + Xử lý render mục disabled dưới dạng `<button type="button">` có `aria-disabled="true"`, `onClick` gọi `toast.info` thông báo "Tính năng Hợp đồng & Thù lao đang được phát triển theo lộ trình".
  - **Tiêu chí kiểm chứng**: Thao tác click không navigate, hiển thị toast chính xác, bàn phím điều hướng a11y đầy đủ.

- [x] `T153` **[TEST-TASK-05-DELTA-v1.3-01][TEST][FE] Bộ kiểm thử Unit & Component Tests cho Layout và Resolver Menu 7 mục**
  - **Mục tiêu**: Bảo đảm tính đúng đắn của logic điều hướng, triệt tiêu hồi quy và xác thực hành vi click disabled.
  - **Hành động kỹ thuật**:
    + Mở rộng `SourceCode/frontend/src/lib/expert-nav.test.ts` kiểm thử route `/portal/expert/contracts`.
    + Mở rộng `SourceCode/frontend/src/app/portal/layout.test.tsx` kiểm thử render đủ 7 mục, aria-disabled, badge "Sắp ra mắt" và spy `mockToastInfo` khi click.
  - **Tiêu chí kiểm chứng**: 100% tests pass (17/17 tests), 0 regressions.

---

## Giai đoạn 11: Delta v1.4 — Chuẩn hóa Trải nghiệm Dashboard, Triệt tiêu Hardcode Account & Chuẩn hóa Toast [CR-2026-007]

- [x] `T154` **[BA-TASK-05-DELTA-v1.4-01][BA][SPEC] Đặc tả Basic Design Delta & Spec Kit CR-2026-007**
  - **Mục tiêu**: Cập nhật SSOT Basic Design Delta Mục 9 và Spec Kit Mục 20 phản ánh quyết định PO-DEC-20261023-02 (Dashboard landing, Zero-hardcode phone, Toast standard).
  - **Hành động kỹ thuật**: Cập nhật `BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md` và `spec.md`.
  - **Tiêu chí kiểm chứng**: Tài liệu được phê duyệt bởi PO.

- [x] `T155` **[FE-TASK-05-DELTA-v1.4-01][FE][DASH] Chuyển đổi Landing Component profile/page.tsx sang ExpertDashboard & sửa link To-Do**
  - **Mục tiêu**: Render đúng component `ExpertDashboard` tại `/portal/expert/profile` và sửa toàn bộ link To-Do trỏ về `/portal/expert/profile/edit`.
  - **Hành động kỹ thuật**:
    + Cập nhật `SourceCode/frontend/src/app/portal/expert/profile/page.tsx`: import và render `ExpertDashboard`.
    + Cập nhật `SourceCode/frontend/src/components/expert-detail/expert-dashboard.tsx`:
      * Sửa `expertDashboardTodos`: đổi `href: "/profile/upgrade/expert"` thành `href: "/portal/expert/profile/edit"`.
      * Sửa khối thao tác nhanh: nút "Xem hồ sơ của tôi" mở trang public `/experts/${detail.publicProfile.expertCode}` (nếu có) hoặc xem chi tiết `/portal/expert/profile/edit`.
  - **Tiêu chí kiểm chứng**: Truy cập `/portal/expert/profile` hiển thị Dashboard chào mừng và việc cần làm; click nút "Bổ sung" điều hướng tới `/portal/expert/profile/edit`.

- [x] `T156` **[FE-TASK-05-DELTA-v1.4-02][FE][ACC] Triệt tiêu fake phone 0912****89, gán nhãn minh họa session và lưu preference vào localStorage trong account/page.tsx**
  - **Mục tiêu**: Loại bỏ dữ liệu giả lập, minh bạch thông tin PDPD và lưu trữ bền vững cài đặt cá nhân.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/frontend/src/app/portal/expert/account/page.tsx`:
      * Sửa hàm `maskPhone`: nếu không có số điện thoại, trả về `"Chưa cập nhật"` (hoặc `"Chưa đăng ký số điện thoại"`), tuyệt đối không bịa số `0912****89`.
      * Khối Active Sessions: thêm nhãn phụ `(Mô phỏng phiên thiết bị)`.
      * Khối Preferences: khi người dùng chọn theme hoặc cỡ chữ, lưu vào `localStorage.setItem("expert_theme_pref", ...)` và `localStorage.setItem("expert_fontsize_pref", ...)`, đọc lại khi mount.
  - **Tiêu chí kiểm chứng**: Chuyên gia chưa có SĐT không thấy số giả; F5 trình duyệt giữ nguyên theme và cỡ chữ đã chọn.

- [x] `T157` **[FE-TASK-05-DELTA-v1.4-03][FE][TOAST] Thay thế 100% lệnh alert() bằng useToast() trong consultations/page.tsx và matching/radar/page.tsx**
  - **Mục tiêu**: Nâng cao trải nghiệm người dùng, tuân thủ Design System và không gây chặn trình duyệt.
  - **Hành động kỹ thuật**:
    + Trong `SourceCode/frontend/src/app/portal/expert/consultations/page.tsx`: import `useToast`, thay `alert(...)` tại dòng 96 bằng `toast.warning(...)`.
    + Trong `SourceCode/frontend/src/app/portal/matching/radar/page.tsx`: import `useToast`, thay `alert(...)` tại dòng 89 bằng `toast.error(...)`.
  - **Tiêu chí kiểm chứng**: Thao tác không bật popup native alert, hiển thị toast toast-notification của hệ thống.

- [x] `T158` **[TEST-TASK-05-DELTA-v1.4-01][TEST][FE] Cập nhật và bổ sung Vitest unit & component tests cho Dashboard, Account, Consultations và Radar**
  - **Mục tiêu**: Đảm bảo 100% test pass, kiểm chứng không còn alert, không còn fake phone.
  - **Hành động kỹ thuật**: Chạy toàn bộ test suites frontend, cập nhật test snapshots và assertions.
  - **Tiêu chí kiểm chứng**: Vitest chạy 100% Green, 0 Errors.

---

## Giai đoạn 12: Delta v1.5 — Zero-Mock Backend Integration Cho Hộp Thư Tư Vấn & Dự Án Đồng Hành [CR-2026-008]

- [x] `T159` **[BA-TASK-05-DELTA-v1.5-01][BA][SPEC] Đặc tả Basic Design Delta & Spec Kit CR-2026-008**
  - **Mục tiêu**: Cập nhật SSOT Basic Design Delta Mục 10 và Spec Kit Mục 21 ghi nhận PO-DEC-20261023-03 (Zero-Mock Endpoints cho Consultations và Projects).
  - **Hành động kỹ thuật**: Cập nhật `BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md` và `spec.md`.
  - **Tiêu chí kiểm chứng**: Tài liệu được phê duyệt bởi PO.

- [x] `T160` **[BE-TASK-05-DELTA-v1.5-01][BE][API] Xây dựng Backend Endpoints cho Hộp thư Tư vấn và Dự án Đồng hành trong ExpertController.cs**
  - **Mục tiêu**: Cung cấp các API thực tế có kiểm soát Scoped RBAC, kết nối CSDL và xử lý giao dịch.
  - **Hành động kỹ thuật**:
    + Thêm `GET /api/v1/experts/me/consultations`: truy vấn danh sách ticket tư vấn theo person ID của chuyên gia, bao gồm 3 tab và thông tin thù lao tư vấn.
    + Thêm `POST /api/v1/experts/me/consultations/{id:guid}/respond`: tiếp nhận hoặc từ chối lịch hẹn.
    + Thêm `GET /api/v1/experts/me/projects`: truy vấn các cơ hội Kanban TRL 1-9 liên kết chuyên gia.
  - **Tiêu chí kiểm chứng**: `dotnet build` và `dotnet test` vượt qua 100% test suites.

- [x] `T161` **[FE-TASK-05-DELTA-v1.5-01][FE][API] Tạo API Client Services trong frontend/src/services/api/**
  - **Mục tiêu**: Tạo các module client gọi API backend chuẩn xác, có xử lý lỗi và kiểu dữ liệu TypeScript.
  - **Hành động kỹ thuật**:
    + Tạo `src/services/api/expert-consultations.ts`.
    + Tạo `src/services/api/expert-projects.ts`.
  - **Tiêu chí kiểm chứng**: Typescript biên dịch sạch, không lỗi import.

- [x] `T162` **[FE-TASK-05-DELTA-v1.5-02][FE][UI] Triệt tiêu Mock Data trong Hộp thư Tư vấn consultations/page.tsx**
  - **Mục tiêu**: Xóa bỏ hoàn toàn hằng số mock tĩnh, chuyển sang fetch dữ liệu thật từ API và hỗ trợ 5 UX States.
  - **Hành động kỹ thuật**: Thay `INITIAL_PENDING_CONSULTATIONS`, `INITIAL_SCHEDULED_CONSULTATIONS`, `INITIAL_COMPLETED_CONSULTATIONS` bằng API call.
  - **Tiêu chí kiểm chứng**: Giao diện load dữ liệu động qua `<Async>`, tương tác accept/reject gửi request backend thật.

- [x] `T163` **[FE-TASK-05-DELTA-v1.5-03][FE][UI] Triệt tiêu Mock Data trong Dự án Đồng hành projects/page.tsx**
  - **Mục tiêu**: Xóa bỏ `INITIAL_EXPERT_PROJECTS`, kết nối trực tiếp với endpoint dự án TRL thật từ Backend.
  - **Hành động kỹ thuật**: Thay `INITIAL_EXPERT_PROJECTS` bằng `expertProjectsApi.getMyProjects()`.
  - **Tiêu chí kiểm chứng**: Không còn mảng tĩnh trong component, hiển thị empty state chuẩn khi chưa có dự án.

- [x] `T164` **[TEST-TASK-05-DELTA-v1.5-01][TEST][FULL] Bộ kiểm thử hồi quy Backend & Frontend xác nhận Zero-Mock 100%**
  - **Mục tiêu**: Đảm bảo 100% test pass ở cả Backend .NET và Frontend Next.js.
  - **Hành động kỹ thuật**: Chạy `dotnet test` và `pnpm test`.
  - **Tiêu chí kiểm chứng**: 100% tests pass, không mock ngầm.

---

## Giai đoạn Delta v1.3: Smart AI CV Onboarding

- [x] `T-DELTA-01` **[BE][PROMPT][REQ-EXP-CV-002] Thiết kế & chuẩn hóa Structured Output Prompt cho AI CV Extractor (Google Gemini Multimodal API)**
  - **Mục tiêu**: Xây dựng system prompt và JSON Schema chặt chẽ trích xuất toàn diện 94 trường dữ liệu từ tệp CV/LLKH (PDF, DOCX, Ảnh scan) khớp Sheet `C.gia`.
  - **Hành động kỹ thuật**:
    + Định nghĩa JSON Schema đầu ra cho Gemini API bao gồm: `personalInfo` (22 trường), `expertiseAndHistory` (36 trường), `scientificAchievements` (36 trường).
    + Tối ưu hóa prompt nhận diện tiếng Việt khoa học, phân loại học vị (TS/ThS/KS), nhận dạng 18 ngành TT17 và cấu trúc bảng công trình nghiên cứu.
  - **Tiêu chí kiểm chứng**: Payload trả về đúng định dạng JSON 100%, không bị parse error.

- [x] `T-DELTA-02` **[BE][API][REQ-EXP-CV-002][BR-EXP-CV-02][BR-EXP-CV-03] Xây dựng Endpoint phân tích CV in-memory `POST /api/v1/experts/ai-cv-scan`**
  - **Mục tiêu**: Tiếp nhận tệp CV từ client, xử lý in-memory tuân thủ Nghị định 13/2023/NĐ-CP (PDPD) và trả về Draft Payload kèm confidence score.
  - **Hành động kỹ thuật**:
    + Tạo controller action nhận `multipart/form-data` (file $\le 20$MB), kiểm tra MIME type & magic bytes.
    + Tích hợp Gemini API client với timeout 30s và cơ chế fallback (Zero-Lock Fallback).
    + Trả về `ExpertProfileDraftDto` có danh sách `highlightFields` và độ tin cậy trích xuất.
  - **Tiêu chí kiểm chứng**: Endpoint trả về HTTP 200 kèm DTO khi thành công; trả về HTTP 422/504 chuẩn khi file lỗi mà không crash server.

- [x] `T-DELTA-03` **[FE][UI][REQ-EXP-CV-001][UI-EXP-CV-01] Nâng cấp Hero Dropzone Quét CV tại Bước 1 của Wizard `/profile/upgrade/expert`**
  - **Mục tiêu**: Cập nhật Stepper và đưa Hero Dropzone lên đầu Bước 1 theo đúng bản dựng Basic Design `wireframe_expert_upgrade.html`.
  - **Hành động kỹ thuật**:
    + Đổi tên 3 bước Stepper: Bước 1: "Quét CV & Định danh", Bước 2: "Năng lực Chuyên môn", Bước 3: "Công bố & Cam kết".
    + Xây dựng component `AiCvHeroDropzone` hỗ trợ kéo thả tệp, chọn tệp từ máy, hiển thị badge bóc tách 94 trường Sheet C.gia và chip bảo mật PDPD.
  - **Tiêu chí kiểm chứng**: Giao diện responsive trên cả Desktop và Mobile, hiển thị chuẩn Tailwind CSS khớp wireframe.

- [x] `T-DELTA-04` **[FE][STATE][REQ-EXP-CV-003][BR-EXP-CV-01][BR-EXP-CV-04] Tích hợp cơ chế Non-destructive Auto-fill và Human-in-the-Loop**
  - **Mục tiêu**: Tự động đổ dữ liệu trích xuất vào form cả 3 bước mà không ghi đè dữ liệu người dùng đã nhập.
  - **Hành động kỹ thuật**:
    + Viết hàm merge dữ liệu `mergeCvDraftToFormState(currentForm, aiDraft)`: chỉ ghi vào các field rỗng, giữ nguyên field đã có giá trị.
    + Đánh dấu visual badge `"✨ AI Gợi Ý"` và viền highlight màu xanh lá nhạt cho các ô do AI điền.
    + Đảm bảo người dùng có thể tự do chỉnh sửa, xóa và kiểm duyệt lại trước khi submit hồ sơ.
  - **Tiêu chí kiểm chứng**: Các trường người dùng gõ trước khi scan được bảo tồn 100%; các trường trống được điền chuẩn xác.

- [x] `T-DELTA-05` **[FE][UX][REQ-EXP-CV-004][UI-EXP-CV-02] Hoàn thiện 5 UX States cho AI CV Scanner và luồng nhập tay không gián đoạn**
  - **Mục tiêu**: Đảm bảo trải nghiệm mượt mà qua 5 trạng thái UX: Idle, Scanning Shimmer, Error Fallback Toast, Success Auto-fill, và Partial Review.
  - **Hành động kỹ thuật**:
    + State 1 (Idle): Dropzone sẵn sàng nhận tệp kèm phân cách "Hoặc nhập liệu thủ công từng bước bên dưới".
    + State 2 (Scanning): Hiển thị thanh tiến trình 0% $\rightarrow$ 100% kèm Skeleton Shimmer.
    + State 3 (Success): Hiển thị thông báo bóc tách thành công số trường và tự động fill form.
    + State 4 (Error): Toast thông báo lỗi nhẹ nhàng khi AI timeout/quá tải, giữ nguyên form nhập tay (Zero-Lock).
    + State 5 (Partial): Hiển thị cảnh báo các trường có confidence thấp để chuyên gia chú ý kiểm tra.
  - **Tiêu chí kiểm chứng**: Khi tắt mạng hoặc giả lập lỗi API, form không bị đóng băng, người dùng chuyển bước và nhập tay bình thường.

- [x] `T-DELTA-06` **[TEST][E2E][TEST-TASK-05-DELTA-v1.3-01] Bộ kiểm thử Unit & Playwright E2E cho luồng Smart AI CV Onboarding**
  - **Mục tiêu**: Kiểm chứng toàn diện logic Non-destructive Auto-fill, Zero-Lock Fallback và tương tác form 3 bước.
  - **Hành động kỹ thuật**:
    + Unit tests (Vitest): Kiểm tra hàm `mergeCvDraftToFormState` với các edge cases (field đã có dữ liệu, format ngày tháng, danh mục mảng động).
    + Component tests: Kiểm tra các trạng thái UX của Hero Dropzone.
    + E2E tests (Playwright): Kịch bản tải lên CV $\rightarrow$ bóc tách thành công $\rightarrow$ kiểm tra dữ liệu điền ở cả 3 bước $\rightarrow$ chỉnh sửa thủ công $\rightarrow$ nộp hồ sơ.
    + Edge-case test: Kịch bản upload file lỗi $\rightarrow$ kiểm chứng Zero-Lock, form nhập tay thông suốt.
  - **Tiêu chí kiểm chứng**: 100% test cases Green, không shallow assertions.

---

## Giai đoạn 20: Delta CR-2026-011 — Chuẩn Hóa Taxonomy 10 Lĩnh Vực TT17 Cho Form Công Nghệ, Hướng Dẫn & Bộ Lọc Chuyên Gia [FE][TEST]

- [x] `T-DELTA-07` **[FE] Chuẩn hóa nhãn Stepper Bước 2 tại Form Tạo & Sửa Công Nghệ Seller (`create/page.tsx` & `[id]/edit/page.tsx`)**
  - **Mục tiêu**: Đổi nhãn Stepper Bước 2 từ "Bước 2: Thông số kỹ thuật & 18 Ngành TT17" thành "Bước 2: Thông số kỹ thuật & 10 Lĩnh Vực TT17".
  - **Hành động kỹ thuật**:
    + Sửa dòng 725 tại `app/portal/seller/technologies/create/page.tsx`.
    + Sửa dòng 717 tại `app/portal/seller/technologies/[id]/edit/page.tsx`.
  - **Tiêu chí kiểm chứng**: Giao diện form hiển thị nhãn "Bước 2: Thông số kỹ thuật & 10 Lĩnh Vực TT17", các trường spec động hoạt động bình thường.

- [x] `T-DELTA-08` **[FE] Chuẩn hóa toàn bộ thuật ngữ "18 ngành" trong Trang Hướng Dẫn (`guide-data.ts`)**
  - **Mục tiêu**: Thay thế 8 vị trí đề cập "18 ngành" sang "10 Lĩnh Vực TT17" / "10 Lĩnh Vực kỹ thuật".
  - **Hành động kỹ thuật**:
    + Cập nhật các chuỗi tại dòng 227, 244, 247, 336, 566, 669, 796, 1064 của `app/huong-dan/guide-data.ts`.
  - **Tiêu chí kiểm chứng**: Không còn sót bất kỳ chuỗi "18 ngành" nào trong tệp `guide-data.ts`.

- [x] `T-DELTA-09` **[FE] Chuẩn hóa nhãn Menu Admin Layout (`admin/layout.tsx`)**
  - **Mục tiêu**: Sửa nhãn menu từ "Danh mục 18 Ngành TT17 & TRL" thành "Danh mục 10 Lĩnh Vực TT17 & TRL".
  - **Hành động kỹ thuật**:
    + Sửa dòng 154 và cập nhật keywords tìm kiếm tại `app/admin/layout.tsx`.
  - **Tiêu chí kiểm chứng**: Sidebar Admin hiển thị nhãn "Danh mục 10 Lĩnh Vực TT17 & TRL".

- [x] `T-DELTA-10` **[FE][AUDIT] Xác thực bộ lọc Lĩnh vực tại Danh Bạ Chuyên Gia (`experts/page.tsx`)**
  - **Mục tiêu**: Đảm bảo bộ lọc nạp đúng 10 Lĩnh vực TT17 từ API `/api/v1/sectors` qua `getPublicExpertFilterOptions()`.
  - **Hành động kỹ thuật**:
    + Rà soát logic parse và gửi `sectorCodes` trong `experts/page.tsx`.
    + Đảm bảo không còn tham chiếu nhãn cũ "18 ngành".
  - **Tiêu chí kiểm chứng**: Dropdown lĩnh vực hiển thị đầy đủ 10 options chuẩn từ CSDL PostgreSQL.

- [x] `T-DELTA-11` **[TEST] Kiểm thử Component & Grep Static Verification**
  - **Mục tiêu**: Kiểm tra tự động toàn bộ codebase frontend không còn dư âm nhãn "18 Ngành TT17".
  - **Hành động kỹ thuật**:
    + Chạy grep toàn bộ thư mục `SourceCode/frontend/src/` đối soát chuỗi "18 Ngành TT17".
    + Chạy bộ kiểm thử regression đảm bảo form seller và trang hướng dẫn hoạt động ổn định.
  - **Tiêu chí kiểm chứng**: Grep trả về 0 kết quả cho chuỗi "18 Ngành TT17", 100% test cases Green.

---

## Giai đoạn 21: Delta CR-2026-012 — Mở Rộng Quyền Mua Hàng & Đăng Nhu Cầu Trong Workspace Chuyên Gia KH&CN [FE][TEST]

- [x] `T-DELTA-12` **[FE] Cập nhật thanh Sidebar Workspace Chuyên Gia 8 mục (`src/app/portal/layout.tsx`)**
  - **Mục tiêu**: Thêm mục số 5 "Đơn hàng & Nhu cầu đặt mua" vào Khối Tác nghiệp hàng ngày của Chuyên gia.
  - **Hành động kỹ thuật**:
    + Thêm item `{ href: "/portal/buyer/demands", label: "Đơn hàng & Nhu cầu đặt mua", icon: ShoppingBag, key: "orders-demands" }` vào mảng `expertNavItems` ngay sau mục Dự án Đồng hành & Hợp tác.
    + Đảm bảo route active logic highlight chính xác khi `pathname === "/portal/buyer/demands"`.
  - **Tiêu chí kiểm chứng**: Sidebar Chuyên gia hiển thị 8 mục menu, mục số 5 hiển thị icon `ShoppingBag` và chuyển đúng đến `/portal/buyer/demands`.

- [x] `T-DELTA-13` **[FE] Tinh chỉnh hiển thị tiêu đề và ngữ cảnh Chuyên gia tại Bàn làm việc (`src/app/portal/buyer/demands/page.tsx`)**
  - **Mục tiêu**: Đảm bảo giao diện 2 Tabs nhận diện linh hoạt khi người dùng đăng nhập là Chuyên gia KH&CN.
  - **Hành động kỹ thuật**:
    + Kiểm tra và điều chỉnh tiêu đề / phụ đề trang hiển thị phù hợp cho Chuyên gia: "Quản lý Đơn hàng & Nhu cầu Đặt mua của Chuyên gia".
    + Xác nhận 2 Tabs (Tab 1: Đơn mua thương mại, Tab 2: Nhu cầu R&D) hiển thị đầy đủ các nút tác nghiệp (Hủy đơn SUBMITTED, Đăng bài toán mới qua `QuickDemandModal`).
  - **Tiêu chí kiểm chứng**: Chuyên gia xem được đơn mua hàng hóa cá nhân và danh sách bài toán nghiên cứu cá nhân mà không gặp lỗi phân quyền.

- [x] `T-DELTA-14` **[FE] Xác thực liên kết CTA từ Modal Đặt Mua Thành Công (`src/app/chao-ban-cong-nghe/[id]/page.tsx`)**
  - **Mục tiêu**: Nút CTA "Theo dõi đơn hàng trong Workspace →" hoạt động mượt mà khi người đặt là Chuyên gia.
  - **Hành động kỹ thuật**:
    + Rà soát liên kết CTA tại dòng 1297 của `page.tsx` trỏ tới `/portal/buyer/demands?tab=commercial`.
    + Kiểm tra luồng đóng modal và chuyển hướng trong Workspace Chuyên gia.
  - **Tiêu chí kiểm chứng**: Chuyên gia bấm CTA sau khi đặt hàng thành công sẽ chuyển thẳng về Tab 1 của Workspace với Sidebar Chuyên gia active đúng mục 5.

- [x] `T-DELTA-15` **[TEST] Cập nhật bộ kiểm thử Vitest cho Sidebar Chuyên Gia (`src/app/portal/layout.test.tsx`)**
  - **Mục tiêu**: Kiểm thử tự động đảm bảo Workspace Chuyên gia có đủ 8 mục menu và active route chính xác.
  - **Hành động kỹ thuật**:
    + Cập nhật test case kiểm tra số lượng nav items của Chuyên gia (`VERIFIED_EXPERT` / `EXPERT`) là 8 mục.
    + Kiểm tra sự hiện diện của nhãn "Đơn hàng & Nhu cầu đặt mua" và liên kết `/portal/buyer/demands`.
  - **Tiêu chí kiểm chứng**: 100% test cases trong `layout.test.tsx` pass.

- [x] `T-DELTA-16` **[TEST][E2E] Kiểm thử toàn trình Đơn hàng & Nhu cầu cho vai trò Chuyên Gia**
  - **Mục tiêu**: Xác thực toàn trình luồng đặt mua sản phẩm, hiển thị Stepper 4 bước và đăng bài toán nhu cầu R&D.
  - **Hành động kỹ thuật**:
    + Chạy bộ test kiểm tra `buyer/demands/page.test.tsx` và `chao-ban-cong-nghe/[id]/page.test.tsx`.
    + Chạy script kiểm tra guard rails `./Agent/scripts/guard-rails.sh`.
  - **Tiêu chí kiểm chứng**: Toàn bộ kiểm thử xanh, không có lỗi biên dịch TypeScript, sẵn sàng xuất xưởng Gate 5.







