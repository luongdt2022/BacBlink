# Ma Trận Truy Vết Kỹ Thuật (Traceability Matrix) — Nacentwin (NacenTech)

> **Mục đích**: Đảm bảo nguyên tắc **Truy vết khép kín (Closed-loop Traceability)** 2 chiều giữa:
> 1. Thiết Kế Cơ Sở (Basic Design) tại `../../Specification/02_BASIC_DESIGN/` & dữ liệu Excel gốc.
> 2. Các Epics Detail Design (`specs/TASK-XX_...`), bản thiết kế (`plan.md`), đầu việc (`tasks.md`), mã nguồn Backend (`backend/`), mã nguồn Frontend (`frontend/`) và bộ kiểm thử (`tests/`).

---

## 1. MA TRẬN ÁNH XẠ TỔNG THỂ (BASIC DESIGN TO DETAIL DESIGN)

| Mã Task BD | Tên Phân Hệ | Tài Liệu Nguồn Gốc (Excel / Basic Design) | Thư Mục Detail Design (Spec Kit) | Phạm Vi Mã Định Danh | Trạng Thái Kỹ Thuật |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **`TASK-00`** | Platform Foundation & Common | Hiến pháp kỹ thuật, Clean Architecture | [`specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON`](./TASK-00_PLATFORM_FOUNDATION_VA_COMMON/) | `ARCH-*`, `DB-INIT-*`, `API-BASE-*`, `FR-COMM-*`, `FR-RBAC-*` | 🟡 Foundation shipped; vòng đời account 10 role mở |
| **`TASK-01`** | Tổng quan & Kiến trúc Home | Sheet `HOME1` + `Giới thiệu` (60 dòng) | [`specs/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME`](./TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/) | `REQ-HOME-*`, `BR-HOME-*`, `API-PORTAL-*`, `UI-LANDING-*`, `UI-TECHMART-*` | ✅ Hoàn tất (Gate 4/5 Shipped) |
| **`TASK-02`** | Hồ sơ Doanh nghiệp ĐMST & 304 DN Thật | Sheet `DN ĐMST` (225 dòng dữ liệu) + 304 DN thật | [`specs/TASK-02_HO_SO_CHU_THE_VA_DN_DMST`](./TASK-02_HO_SO_CHU_THE_VA_DN_DMST/) | `REQ-02-*`, `BR-02-*`, `DB-ENT-*`, `API-ENT-*`, `UI-ENT-*` | ✅ Hoàn tất (Gate 4/5 Shipped) |
| **`TASK-03`** | Hồ sơ Tìm Mua (Buyer) | Sheet `T.mua SP` (356 dòng dữ liệu) | [`specs/TASK-03_HO_SO_TIM_MUA_BUYER`](./TASK-03_HO_SO_TIM_MUA_BUYER/) | `REQ-BUY-*`, `BR-SURVEY-*`, `DB-DEMAND-*` | ⚪ Dự kiến |
| **`TASK-04`** | Hồ sơ Chào Bán & Bộ Lọc | Sheet `C.bán SP` + `Bo_loc_Cban` (1,568 dòng) | [`specs/TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`](./TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC/) | `REQ-04-*`, `BR-SELLER-*`, `API-04-*`, `UI-04-*` | ✅ Hoàn tất (Gate 4 Pass) |
| **`TASK-05`** | Hồ sơ Chuyên gia KH&CN & AI Scan LLKH | Sheet `C.gia` (94 dòng dữ liệu) | [`specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN`](./TASK-05_HO_SO_CHUYEN_GIA_KHCN/) | `REQ-EXP-*`, `BR-EXP-*`, `API-EXP-*`, `UI-EXP-*` | ✅ Delta v12 Hoàn tất (Gate 4/5 Pass) |
| **`TASK-06`** | Danh Mục Ngành & Ma Trận | Sheet `Ngành` + `Ma trận LV-CN` (161 dòng) | [`specs/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`](./TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/) | `REQ-SEC-*`, `BR-SEC-*`, `API-MASTER-*`, `UI-MASTER-*` | 🟡 Đã đặc tả (Ready) |
| **`TASK-07`** | Phân Quyền & Quản Trị Admin | Sheet `Admin` (6 dòng quyền hạt nhân) | [`specs/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`](./TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/) | `REQ-ADM-*`, `BR-ADM-*`, `API-GOV-*`, `UI-ADMIN-*`, `UI-ORG-*` | ✅ Delta v4 Hoàn tất |

---

## 2. QUY CHUẨN ĐỒNG BỘ MÃ ĐỊNH DANH (IDENTIFIER STANDARDIZATION)

Mọi yêu cầu kỹ thuật phải được giữ nguyên vẹn mã định danh khi bóc tách sang `spec.md`, `plan.md`, `tasks.md` và mã nguồn:

| Tiền Tố | Loại Yêu Cầu | Vị Trí Trong Spec Kit | File Mã Nguồn BE (`backend/`) | File Mã Nguồn FE (`frontend/`) | Kiểm Thử Bắt Buộc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`REQ-`** | Yêu cầu chức năng người dùng | `spec.md` (User Stories) | Domain Service / UseCase | View / Page Component | Acceptance Criteria / E2E Test |
| **`BR-`** | Quy tắc nghiệp vụ & điều kiện ràng buộc | `spec.md` & `plan.md` | Domain Entities / Validators | Client Validators | Unit Test (100% rules coverage) |
| **`DB-`** | Bảng dữ liệu & khóa ngoại | `plan.md` (Schema) | EF Core Entity & Migration | DTO Type definition | Migration & DB Integration Test |
| **`API-`** | Điểm cuối dịch vụ & hợp đồng giao tiếp | `plan.md` (OpenAPI Contracts) | FastEndpoints / Controllers | API Client / SDK Service | API Contract & Integration Test |
| **`UI-`** | Giao diện & 5 trạng thái UX | `spec.md` & `plan.md` (Wireframes) | - | UI Component (`<Async>`) | Visual QA & Component Test |
| **`NFR-`** | Yêu cầu phi chức năng (tốc độ, bảo mật) | `spec.md` (Success Criteria) | Caching, Middleware, Query | Lazy load, Asset bundle | Load Test / Security Scan |

---

## 3. NGUYÊN TẮC BẢO ĐẢM TRUY VẾT KHÉP KÍN

1. **Không có Task mồ côi (No Orphan Tasks)**: Mỗi task trong `tasks.md` của bất kỳ Epic nào đều phải được gắn thẻ tham chiếu rõ ràng đến ít nhất một mã `REQ-`, `BR-`, `DB-`, `API-` hoặc `UI-`.
2. **Không có Code mồ côi (No Orphan Code)**: Mọi endpoint API trong `backend/` hoặc màn hình trong `frontend/` đều phải tương ứng với mã yêu cầu đã xác định.
3. **Đồng bộ khi có Thay Đổi (Change Request - `/speckit-delta`)**:
   - Khi Basic Design thay đổi: Cập nhật tài liệu BD tương ứng -> Kích hoạt `/speckit-delta` -> Cập nhật `spec.md`, `plan.md`, `tasks.md` -> Cập nhật `TRACEABILITY.md`.

---

## 4. Delta v5: Traceability trang Chi Tiết Chuyên Gia

## 4a. Delta v10: Nguồn chân lý RBAC 10 role / 4 tầng

| Nguồn / requirement | Detail design | Task | Trạng thái kiểm chứng |
| :--- | :--- | :--- | :--- |
| Ma trận 10 role, 4 tầng, 3D scope | `TASK-00` FR-RBAC-001..004; Basic Design `TASK-07` | T-00.17–25 | DB/domain/JWT/policy đã có; cần giữ regression test |
| Public account tự kích hoạt `PUBLIC_USER` | `TASK-00` FR-RBAC-006 | T-00.41–43 | Pass integration + FE test |
| Provision/gán role+scope có audit | `TASK-00` FR-RBAC-007, BR-RBAC-006 | T-00.41–42 | Pass authorization + PostgreSQL integration |
| Đăng ký/provision → login cho 10 role | `AC-DELTA-05` | T-00.44 | Pass PostgreSQL integration 2/2, frontend redirect 10 role 12/12 |

| Wireframe / requirement | Detail design | Task | Kiểm chứng |
| :--- | :--- | :--- | :--- |
| Public/Full, PDPD mask | `REQ-EXP-DETAIL-001..002`, `BR-EXP-020..022` | T045–T049 | deny-list, authorization/audit, E2E boundary |
| Hero, tags, timeline, 5 tabs | `REQ-EXP-DETAIL-003`, `BR-EXP-023` | T044, T046, T048 | filters, component/visual tests |
| CTA kết nối tư vấn | `REQ-EXP-DETAIL-004` | T050 | success hoặc Partial test |
| Zalo handoff | `REQ-EXP-DETAIL-005` | T051 | link builder/E2E |
| Audit và public safe URL | `REQ-EXP-DETAIL-006`, `BR-EXP-024` | T045, T052–T053 | audit/URL/code tests |

### Delta v5 implementation evidence

- Backend: `modules/brokerage/Domain/ExpertProfile*.cs`, `Application/Contracts.cs`, `Application/ExpertService.cs`, `Infrastructure/Persistence/Configurations.cs`, `apps/api/V1Compat/ExpertController.cs`.
- Migrations: `20260928081146_AddExpertPublicDetailProjection`, `20260928082615_AddExpertPrivateDetailAndAchievementMetadata` — applied to local PostgreSQL.
- Web: `src/app/experts/[expertCode]/page.tsx`, `src/app/portal/expert/profile/page.tsx`, `src/components/expert-detail/`.
- Tests: `backend/tests/invariants/ExpertProfileInvariantsTests.cs`; `frontend/src/components/expert-detail/profile-detail.test.tsx` (Vitest 2/2).

---

## 5. Delta v6: Traceability Đăng nhập thật → Owner Detail

| Gap / requirement | Detail design | Task | Kiểm chứng |
| :--- | :--- | :--- | :--- |
| API base thống nhất, không fallback mock | `REQ-EXP-AUTH-001`, `BR-EXP-025` | T057 | Web unit/component: lỗi login không tạo session; request đi API base |
| Role/scope thật trong JWT và login response | `REQ-EXP-AUTH-002`, `BR-EXP-026` | T054, T059 | API contract/JWT claims, portal redirect |
| Person–ExpertProfile ownership fixture | `REQ-EXP-AUTH-003`, `BR-EXP-027..029` | T055–T056, T059 | DB fixture idempotent, owner isolation |
| Guard và recovery Owner route | `REQ-EXP-AUTH-004`, `BR-EXP-026..028` | T056, T058, T060 | 401/403/404 UI/API, E2E real login → Full Detail |
| E2E/development isolation | `REQ-EXP-AUTH-005`, `BR-EXP-029` | T055, T060 | fixture không production/no secret log; regression public/Zalo |

---

## 6. Delta v8: Dashboard tác nghiệp chuyên gia

| Requirement | Detail design | Task | Implementation / verification |
| :--- | :--- | :--- | :--- |
| Dashboard riêng theo `VERIFIED_EXPERT` | `REQ-EXP-DASH-001` | T069 | `src/app/portal/page.tsx`, role branch giữ dashboard chung cho role khác |
| Trạng thái và việc cần làm từ Owner Detail | `REQ-EXP-DASH-002`, `BR-EXP-033` | T069 | `src/components/expert-detail/expert-dashboard.tsx`, Loading/Error/Retry/Empty |
| Không có marketplace ở expert dashboard | `REQ-EXP-DASH-003`, `BR-EXP-032` | T069–T070 | `expert-dashboard.test.tsx`, assertion không render Gian hàng Công nghệ |

---

## 7. Delta v9: CCCD không phải input Portal/Zalo

| Requirement | Task | Bằng chứng |
| :--- | :--- | :--- |
| CCCD nullable, giữ lịch sử | `REQ-EXP-PII-002`, T072 | `MakeExpertIdentityCardOptional`, domain nullable, PostgreSQL local verified |
| Không trả qua Portal DTO | `REQ-EXP-PII-003`, T073 | `Contracts.cs`, `ExpertService.cs`, invariant deny-list test |
| Không có input/display Web; Zalo giữ no-CCCD | `REQ-EXP-PII-001`, T074 | Expert Wizard, PrivatePanel, Zalo wireframe/source sweep |

---

## 8. Delta v6: Menu tài khoản và đăng xuất Web Portal

| Basic Design / requirement | Detail design | Task | Triển khai / kiểm chứng |
| :--- | :--- | :--- | :--- |
| Menu danh tính có Cài đặt và Đăng xuất | `REQ-SESSION-001`, `UI-SESSION-001` | T-00.45–46 | `frontend/src/components/common/navbar.tsx`; menu có `aria-expanded`, click ngoài/Escape, Settings và logout ở desktop/mobile |
| Logout từ Settings | `REQ-SESSION-002`, `BR-SESSION-001` | T-00.47 | `frontend/src/app/settings/page.tsx`; ConfirmModal, clear session, toast, redirect `/` |
| Hủy/xác nhận không hồi quy session | `AC-DELTA-06` | T-00.48 | `navbar.test.tsx`, `settings/page.test.tsx`; Vitest 49/49 pass |

---

## 9. TASK-07: Traceability Phân Quyền & Năng Lực Quản Trị Admin

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task | Mã Nguồn Triển Khai | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| Thực thể Hồ sơ Thẩm định & Optimistic Concurrency | `REQ-ADM-001`, `BR-ADM-002`, `DB-ADM-001` | T001, T004, T005 | `modules/identity/Domain/ApprovalRequest.cs`, `Configurations.cs`, migration `20261001170000_AddApprovalAndGovernanceTables.cs` | Invariant tests `GovernanceApprovalInvariantsTests.cs` (65/65 pass) |
| Cây tổ chức 3 cấp 63 tỉnh/thành & Đơn vị cơ sở | `REQ-ADM-002`, `BR-ADM-004`, `DB-ADM-002` | T002, T004, T009 | `modules/identity/Domain/OrganizationUnit.cs`, `OrganizationTreeService.cs` | DB seed 63 tỉnh, API `/governance/org-tree` response verified |
| Nhật ký kiểm toán bất biến (Append-only) | `REQ-ADM-003`, `BR-ADM-003`, `DB-ADM-003` | T003, T004, T010 | `modules/identity/Domain/ApprovalAuditLog.cs`, `ApprovalService.cs` | DB trigger/configuration, audit query endpoint |
| Dịch vụ kiểm duyệt 5 luồng & Side-effects | `REQ-ADM-001`, `BR-ADM-001`, `BR-ADM-002` | T006, T007, T008, T010 | `modules/identity/Application/ApprovalService.cs` | Unit test promotion `VERIFIED_EXPERT`, `SELLER`, account activation |
| Web API Endpoints & Phân quyền Scoped RBAC | `API-ADM-001..005`, `SEC-ADM-001..002` | T011, T012, T013 | `apps/api/V1Compat/GovernanceControllers.cs`, `authorization-rules.v1.json` | Live API E2E tested (Create $\rightarrow$ Review $\rightarrow$ Approve) |
| Dashboard Thẩm định Admin & 5 UX States | `UI-ADMIN-APPROVAL-001`, `UX-ADM-001` | T014, T015, T016 | `frontend/src/app/admin/approvals/page.tsx` | Vitest 51/51 pass, TypeScript `tsc --noEmit` pass |
| Kiểm thử bất biến: RLS, Concurrency 409, Audit | `BR-ADM-001`, `BR-ADM-002`, `BR-ADM-003` | T018, T019, T020 | `tests/invariants/GovernanceApprovalInvariantsTests.cs` | dotnet test (65/65 passed) |
| Ma trận 10 Roles & Quyền hạn | `REQ-ADM-ROLE-001`, `FR-ADM-004` | T021, T024 | `GovernanceControllers.cs`, `src/app/admin/roles/page.tsx` | Vitest & API Contract test |
| Gán vai trò & Scope cho tài khoản cán bộ | `REQ-ADM-ROLE-002`, `BR-ADM-008` | T022, T024 | `GovernanceControllers.cs`, `ApprovalService.cs` | Invariant escalation check & Audit test |
| Cây thư mục 34 tỉnh thành trọng điểm & 3 Miền | `REQ-ADM-TREE-001`, `FR-ADM-006` | T023, T025 | `OrganizationTreeService.cs`, `src/app/admin/org-tree/page.tsx` | Tree explorer & province stats verified |

---

## 10. TASK-06: Traceability Hệ Thống Danh Mục Ngành & Ma Trận TT17

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task | Mã Nguồn Triển Khai | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| Danh mục 18 nhóm ngành công nghệ trọng điểm | `REQ-SEC-001`, `BR-SEC-001..002` | T001, T003, T004 | `MasterDataControllers.cs`, `TaxonomyService.cs` | API contract & Invariant test |
| Bảng chuẩn hóa 10 phân ngành Thông tư 17 (Nhóm C) | `REQ-SEC-002` | T001, T005 | `MasterDataControllers.cs`, `src/app/admin/sectors/page.tsx` | Định mức kỹ thuật & TT17 values verified |
| Ma trận 109 cặp Lĩnh vực - Công nghệ (1-5 sao) | `REQ-SEC-003`, `BR-SEC-003` | T001, T006 | `MasterDataControllers.cs`, `src/app/admin/sectors/page.tsx` | 109 pairs integrity test |
| Danh mục 15 triển lãm quốc tế chuyên ngành | `REQ-SEC-004` | T001, T007 | `MasterDataControllers.cs`, `src/app/admin/sectors/page.tsx` | Component test |

## 11. TASK-05 Delta v11: Danh bạ taxonomy và compact UX

| Yêu cầu / Quy tắc | Spec | Task | Mã nguồn | Kiểm chứng |
| :--- | :--- | :--- | :--- | :--- |
| Số ngành lọc lấy đúng SECTOR active từ DB; baseline có 10 mã LV | `REQ-EXP-DIR-003`, `REQ-EXP-DIR-004` | T089, T092 | `TaxonomyControllers.cs`, `src/app/experts/page.tsx` | API response count và filter code; Pass |
| Lọc tỉnh theo scope tỉnh của chủ hồ sơ; hồ sơ thiếu scope không gán địa bàn | `REQ-EXP-DIR-005` | T090 | `ExpertService.cs`, `ExpertProvinceScopeLookup.cs`, `GovernanceControllers.cs` | DB integration cho scope và missing scope; Pass |
| Directory query filters và projection địa bàn công khai; consultation submit success/error contract | `API-EXP-DIR-002..004` | T090, T093 | `ExpertController.cs`, `GovernanceControllers.cs`, `src/app/experts/page.tsx` | API contract + DB integration; Pass |
| Control filter/sort khớp query thật; chỉ hồ sơ public/approved, PII deny-list | `BR-EXP-038`, `BR-EXP-039`, `BR-EXP-040` | T090, T092, T094 | `ExpertService.cs`, `ExpertController.cs` | Invariants + API contract; Pass |
| UI compact, responsive, đủ 5 trạng thái và kết nối modal báo đúng kết quả API | `REQ-EXP-DIR-006`, `UI-EXP-DIR-002`, `NFR-EXP-DIR-001` | T088, T091, T093, T095, T096 | `wireframe_danh_ba_chuyen_gia_v11.html`, `src/app/experts/page.tsx` | Vitest + Playwright 1440×900/390×844; Pass |
| Search parameter compatibility (`q` + legacy `query`, q wins when both exist) | `API-EXP-DIR-005`, `REQ-EXP-DIR-001` | T090, T098 | `backend/apps/api/V1Compat/ExpertController.cs`, `docs/02-detail-design/DD-02-task05-expert-directory-v11.md` | Invariant test `ExpertProfileInvariantsTests.cs`; Pass |

---

## 12. CR-2026-005 Delta v12 — Taxonomy ngành động toàn hệ thống

| Yêu cầu | Thiết kế | Task | Triển khai | Kiểm chứng |
| :--- | :--- | :--- | :--- | :--- |
| Danh sách, count và sector selection đọc DB taxonomy, không static fallback | CR-2026-005 §2.2; DD-02 v12 | T099–T105 | Home, experts, upgrade/CV, admin sectors/roles, GOV/login, public detail; `MasterDataControllers` | Fix TC-C2-12 subtitle regex collision; Next.js 15 build clean; Pass |
| TT17 categories đọc taxonomy CATEGORY; matrix labels resolve code runtime | CR-2026-005 §2.2; DD-02 v12 | T102–T103 | `/api/v1/master-data/tt17`, `/matrix` | Invariants 95/95 pass; Backend .NET 8 build clean; Pass |
| QC 4 tầng và visual/RBAC kiểm tra runtime add/rename/deactivate, empty/error | CR-2026-005 §4–6; wf-delta Step 6 | T106–T113 | Seed fixture 14 chuyên gia (`seed_delta_v12_e2e_dataset.sql`), fix unwrapping `ExpertPublicDirectoryDto` trong `delta_v12_blackbox.py` | Black-box 36/36 pass (0 fail, 14 unblocked by seed); Invariants 95/95 pass; Gate 4 & Gate 5 Sign-off hoàn tất |

---

## 13. TASK-02: Traceability Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST (Shipped)

| Yêu Cầu / Quy Tắc | Detail Design (`spec.md` / `plan.md`) | Task | Mã Nguồn Triển Khai | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| Định danh MST duy nhất, Seed 304 DN thật | `REQ-02-001..002`, `BR-02-001` | T-02.01–T-02.04 | `Enterprise.cs`, `seed_304_dn_real_data.sql` | DB Integration 304/304 DN nạp thành công; Pass |
| PDPD Data Masking doanh thu, SĐT công khai | `REQ-02-003`, `BR-02-002` | T-02.07 | `EnterpriseInvariants.cs`, `EnterpriseController.cs` | Invariant test `EnterpriseInvariantsTests.cs`, Contract test trả `[BẢO MẬT]`; Pass |
| Kê khai 10 nhóm trường, nộp Maker-Checker | `REQ-02-004..009`, `BR-02-003` | T-02.08–T-02.09 | `EnterpriseInvariants.cs`, `/portal/enterprise/profile` | Invariant check `ValidateSubmissionReadiness`; Pass |
| Dashboard 304 DN, phân tích TNI, rào cản | `REQ-02-011` | T-02.10, T-02.18 | `EnterpriseController.cs`, `/admin/enterprises/dashboard` | API Stats trả đúng 304 records, phân bổ 34 tỉnh/ngành; Pass |
| Cổng Thẩm định cấp Sở, 3D Scoped RBAC | `REQ-02-012`, `BR-02-005` | T-02.11, T-02.19 | `EnterpriseController.cs`, `/gov/approvals/enterprises` | Invariant scope check, Playwright E2E UI cấp Sở; Pass |
| Danh bạ 5 màn hình Next.js 15, 5 UX States | `REQ-02-010`, `UI-02-001..005` | T-02.14–T-02.19 | `src/app/enterprises/`, `src/services/enterpriseApi.ts` | Vitest + Playwright Black-box test `test_task02_enterprises_blackbox.py` Pass 100% |
