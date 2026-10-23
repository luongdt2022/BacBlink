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
| **`TASK-03`** | Hồ sơ Tìm Mua (Buyer) | Sheet `T.mua SP` (356 dòng dữ liệu) | [`specs/TASK-03_HO_SO_TIM_MUA_BUYER`](./TASK-03_HO_SO_TIM_MUA_BUYER/) | `REQ-BUY-*`, `BR-SURVEY-*`, `DB-DEMAND-*` | ✅ Hoàn thành (Delta v8 Shipped) |
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
| **Delta v3: Bộ Tiêu Chí ĐMST 8 Nhóm (100đ, 37 tiêu chí), Radar Chart 8 Trục & Phân Tầng Vàng/Bạc/Đồng (CR-2026-012)** | `REQ-02-020..023`, `BR-02-010..011`, `AC-02-010..012` | T-02.39–T-02.51 | `InnovationRatingEngine.cs`, `EnterpriseInnovationEvaluation.cs`, `EnterpriseController.cs`, `RadarChart.tsx`, `/enterprises/[taxCode]`, `/doanh-nghiep-dmst` | Unit Invariants (11/11 + 115/115 tests Pass); DB Integration 305 DN (23 LEADING, 112 DEVELOPING, 169 POTENTIAL, 1 UNRATED); Playwright E2E `test_task02_innovation_rating_e2e.py` 6/6 Pass 100% |

---

## 14. TASK-02 / TASK-03: CR-2026-015 & CR-2026-016 — Chủ Thể Doanh Nghiệp Thống Nhất & Kích Hoạt Năng Lực Đa Tầng (Buyer / Seller / Dual Mode)

| Yêu Cầu / Quy Tắc | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Bản sắc DN Thống nhất SSOT & MST Nullable** | `REQ-02-015` (`REQ-02-025`), `BR-02-006` (`BR-02-012`), `BR-02-013`, `AC-02-014` | T-02.52–T-02.54, T-02.59 | `enterprise.enterprises`, `Enterprise.cs`, `EnterpriseConfiguration.cs`, `EnterpriseService.cs` | DB Migration Partial Unique Index `tax_code IS NOT NULL`; Unit Test lưu NULL thành công, chặn duplicate MST trả về 409 Conflict |
| **Kích hoạt Năng lực Đa tầng & Role Switcher** | `REQ-02-014` (`REQ-02-024`), `BR-02-014`, `AC-02-013` | T-02.55–T-02.57, T-02.59 | `role-switcher.tsx`, `navbar.tsx`, `portal/layout.tsx`, `EnterpriseController.cs` | E2E Switcher chuyển vai trò $< 300\text{ms}$, bảo toàn phiên đăng nhập và định danh pháp nhân |
| **Định danh Cặp tài khoản Demo Chuẩn hóa** | `REQ-02-016` (`REQ-02-026`), `FR-Delta-16`, `AC-02-015`, `AC-03-07` | T-02.58, T-02.60 | `seed_identity_demo_accounts.sql`, `EnterpriseService.cs`, `EnterpriseController.cs` | Login `buyer.user@demo.nacentech.vn` $\rightarrow$ TRƯỜNG HOAN (0100255428); Login `seller.user@demo.nacentech.vn` $\rightarrow$ TÂN TIẾN (0108992134); API trả 200 OK |
| **Bắt buộc Tự động điền 100% Hồ sơ Khảo sát** | `FR-Delta-15`, `BR-03-005`, `BR-03-006`, `AC-03-06` | T-03.54–T-03.57 | `src/app/khao-sat-nhu-cau/page.tsx`, `page.test.tsx`, `enterprise-client.ts` | Vitest + Playwright E2E nạp 100% dữ liệu pháp nhân khi đã đăng nhập; Zero-friction sang Bước 2; Hỗ trợ đồng bộ 2 chiều |

---

## 15. TASK-04 Delta v6: Tái Cấu Trúc Form Tạo/Sửa Hồ Sơ Chào Bán Seller Đồng Bộ Wireframe Gốc & 4 Lớp Trường Excel Master

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Triết lý Form 4 bước & Cổng nộp nhanh Bước 1** | `REQ-04-010`, `BR-SELLER-08`, `AC-04-020` | T-04.69, T-04.70, T-04.75 | `TechnologyOffersController.cs`, `FormStepper.tsx`, `FastTrackSubmitModal.tsx` | UI Action Bar kích hoạt nút Submit ngay Bước 1, kiểm thử Fast-track Pass |
| **Bước 1: 6 Trường lõi & Combobox 18 Ngành (Ẩn mã LV)** | `REQ-04-011`, `UI-04-021`, `AC-04-022` | T-04.71 | `Step1CoreFields.tsx`, `SearchableCombobox.tsx` | Kiểm thử ẩn mã LV.., hiển thị trực quan 18 ngành tiếng Việt |
| **Bước 1: Nạp chủ thể DN & PDPD Data Masking** | `REQ-04-012`, `BR-SELLER-14`, `AC-04-023` | T-04.72 | `SellerIdentityCard.tsx`, `enterprise-client.ts` | Tự động điền 100% thông tin pháp nhân; che SĐT/Email đối với công khai |
| **Bước 1: Nhúng công bố giá (Fixed, Range, Contact)** | `REQ-04-013`, `BR-SELLER-04`, `UI-04-023` | T-04.73 | `InlinePricingCard.tsx` | Validate giá cụ thể > 0, khoảng giá min-max, loại tiền VND/USD, ĐVT |
| **Bước 1: Khung tương tác TRL vàng 9 cấp (Reactive)** | `REQ-04-014`, `BR-SELLER-09`, `UI-04-022`, `AC-04-021` | T-04.74 | `ReactiveYellowTrlPanel.tsx`, `TrlRadioGrid.tsx` | Tự động bung mở khi chuyển giao = Có; bắt buộc chọn TRL 1-9 mới cho nộp |
| **Bước 2: Lớp 2 Kỹ thuật chung theo loại (TB/SP vs GP)** | `REQ-04-015`, `BR-SELLER-10`, `UI-04-024`, `AC-04-024` | T-04.66, T-04.67, T-04.76 | `Tier2CommonTechnicalForm.tsx`, `SellerTechnologyOffer.cs` | Render đúng 8 trường vật lý thiết bị hoặc 3 trường giải pháp số |
| **Bước 2: Lớp 3 Thông số 18 ngành Excel Master** | `REQ-04-016`, `BR-SELLER-11`, `UI-04-024`, `AC-04-025` | T-04.66, T-04.77 | `Tier3SectorDynamicForm.tsx`, `Bo_loc_Cban` | Tự động nạp danh mục thông số chuẩn theo ngành đã chọn |
| **Bước 2: Bảng Key-Value thêm thông số tự do** | `REQ-04-017`, `UI-04-024`, `DB-04-002`, `AC-04-026` | T-04.66, T-04.78 | `DynamicSpecKeyValueTable.tsx`, `offer_spec_values` | Thêm/xóa dòng, chặn trùng lặp, lưu `TIER_3_CUSTOM` thành công |
| **Bước 3: Lớp 4 Điều kiện thương mại & Chuyển giao** | `REQ-04-018`, `BR-SELLER-12`, `UI-04-025`, `AC-04-027` | T-04.66, T-04.67, T-04.79 | `Tier4CommercialForm.tsx`, `seller_technology_offers` | Lưu KT-66, GIA-74..78, GIA-80..81 vào DB; hiển thị trang chi tiết |
| **Bước 4: Pháp lý Bộ tứ SHTT & Minh chứng DataRoom** | `REQ-04-019`, `REQ-04-020`, `BR-SELLER-13`, `AC-04-028` | T-04.66, T-04.80, T-04.81 | `IpQuadDigitizationCard.tsx`, `DataRoomFileManager.tsx` | Quyền xem 3 cấp (PUBLIC, AFTER_CONNECTION, ADMIN_ONLY); chặn tải trái phép |
| **Bước 4: Chọn Sở KH&CN Cấp 2 & Cam kết pháp lý** | `REQ-04-021`, `BR-SELLER-05`, `UI-04-026` | T-04.70, T-04.75 | `ProvincialGovAuthoritySelect.tsx`, `ApprovalRequest.cs` | Bắt buộc chọn Sở và cam kết pháp lý; sinh phiếu duyệt Cổng Cấp 2 `/gov` |
| **Cơ chế Lưu nháp DRAFT, LocalStorage & Trợ lý AI** | `REQ-04-022`, `BR-SELLER-08`, `AC-04-029` | T-04.82, T-04.83 | `DraftManager.tsx`, `AiAssistantCard.tsx` | Lưu nháp chỉ cần title >= 3 ký tự; phục hồi form 30s; AI suggester fallback |
| **Kiểm thử Toàn diện & Quality Gate Delta v6** | `AC-04-020..030`, `QC-4-TIERS` | T-04.84–T-04.86 | `SellerOfferRulesValidatorTests.cs`, `page.test.tsx`, `tests/qc_gate4_delta_v6_verification.py` | 100% xUnit Pass (37 tests), Vitest 3/3 Pass, Direct DB Verification & Playwright 3 kịch bản Pass (15/15 tests) |

---

## 16. TASK-03 Delta v8 (CR-2026-017 / TASK-03-CR59): Tái Cấu Trúc Form Khảo Sát Nhu Cầu 4 Tab Tinh Gọn (Lean 4-Step Wizard)

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Tái cấu trúc Stepper 4 Tabs tinh gọn & Free-click** | `FR-NEW-03-01`, `BR-NEW-03-01`, `AC-NEW-03-01`, `AC-NEW-03-05` | T-03.58 | `src/app/khao-sat-nhu-cau/page.tsx` | Stepper 4 tabs, hiển thị tiến độ (currentStep/4)*100%, cho phép click tự do không chặn |
| **Gộp 4 phân mục B, C, D, F vào Tab 3 (Unified Supplementary)** | `FR-NEW-03-01`, `BR-NEW-03-01`, `AC-NEW-03-03` | T-03.59 | `src/app/khao-sat-nhu-cau/page.tsx` | 4 Cards chuyên đề có nhãn trực quan, bảo toàn 100% trường dữ liệu, bỏ required chặn submit |
| **Navigation, Fast-track Skip Tab 2 $\rightarrow$ 4 & 3-Tier Validation** | `BR-NEW-03-01`, `AC-NEW-03-02`, `AC-NEW-03-04`, `AC-NEW-03-06` | T-03.60 | `src/app/khao-sat-nhu-cau/page.tsx` | Nút Fast-track chuyển thẳng Tab 4; validate khi submit tự cuộn về đúng tab thiếu dữ liệu |
| **Bộ kiểm thử Vitest Unit/Component Tests** | `AC-NEW-03-01..06` | T-03.61 | `src/app/khao-sat-nhu-cau/page.test.tsx` | 14/14 tests pass 100% (bao gồm 6 kịch bản mới về 4 tabs, fast-track, free-click, 3-tier validation) |
---

## 17. TASK-04 Delta v8: Tinh Gọn Diện Mạo Trực Quan & Tối Ưu Hóa Chiều Cao Card Chào Bán Công Nghệ

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Xóa bỏ badge lặp lại trên Thumbnail & Giữ 01 Badge Loại hình** | `REQ-DELTA-03`, `BR-OFFER-CARD-02`, `UI-CARD-02`, `AC-04-035` | T-04.92 | `src/app/chao-ban-cong-nghe/page.tsx` | Triệt tiêu hoàn toàn badge "Sẵn sàng chuyển giao" và "Thương phẩm sẵn có" trên thumbnail; chỉ giữ 01 badge góc trên bên phải hiển thị loại hình chào bán |
| **Gộp thông tin Pháp lý SHTT trên đúng 1 dòng duy nhất** | `REQ-DELTA-04`, `REQ-DELTA-05`, `BR-OFFER-CARD-02`, `UI-CARD-02`, `AC-04-035`, `AC-04-036` | T-04.93 | `src/app/chao-ban-cong-nghe/page.tsx` | Xóa bỏ huy hiệu "Xác thực Cục SHTT"; gộp hiển thị 1 dòng `[ShieldCheck] [Tên bảo hộ] • Số: {ipRegistrationNumber}` có `truncate` |
| **Thu nhỏ Mã hồ sơ & Tối ưu chiều cao Card (~20-25%)** | `REQ-DELTA-06`, `BR-OFFER-CARD-02`, `UI-CARD-02`, `AC-04-037` | T-04.92, T-04.93 | `src/app/chao-ban-cong-nghe/page.tsx` | Thu nhỏ `offerCode` (`text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase`); giảm padding từ `p-4 sm:p-5` xuống `p-3.5 sm:p-4`; nén card tiết kiệm ~40-50px chiều cao |
| **Bộ kiểm thử Vitest Unit/Component Tests Delta V8** | `AC-04-035..037` | T-04.94 | `src/app/chao-ban-cong-nghe/page.test.tsx` | 9/9 tests pass 100% (bao gồm Negative assertions: `queryByText("Sẵn sàng chuyển giao") === null`, `queryByText("Xác thực Cục SHTT") === null`, single-line IP, compact offerCode) |
| **Thẩm định Chất lượng Toán học tĩnh & Gate 4 Pass** | `AC-04-034..037`, `QC-4-TIERS` | T-04.95 | `src/test/qc-gate4-typography.test.ts`, TypeScript compiler | 13/13 tests Typography pass, `tsc --noEmit` 0 errors, layout responsive trên mọi viewport |

---

## 18. TASK-04 Delta v9: Chuẩn Hóa Hiển Thị Trung Thực Theo CSDL (Zero-Mock DataRoom & Dynamic Specs) & Định Tuyến Thẩm Định Cấp Tỉnh Thông Minh

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Triệt phá Mock DataRoom & Empty State chuẩn UX** | `REQ-DELTA-07`, `BR-OFFER-DATAROOM-01`, `UI-DELTA-04-03`, `AC-04-038` | T-04.97 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Xóa bỏ vĩnh viễn mảng 3 file PDF ảo (`Teaser_Tom_Tat_Giai_Phap.pdf`, `Ho_So_SHTT_...pdf`, `Ket_Qua_Kiem_Dinh_TRL...pdf`); Hiển thị khối Empty State `DataRoomEmptyState` với Icon `FolderSearch`, text "Chưa có tài liệu công khai trong DataRoom" & nút CTA "Yêu cầu tài liệu qua Kết nối chuyển giao" |
| **Hiển thị TRL trung thực theo CSDL (Zero Fallback)** | `REQ-DELTA-08`, `BR-OFFER-SPECS-01`, `UI-DELTA-04-04`, `AC-04-039` | T-04.98 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Xóa bỏ triệt để các fallback `offer.trlLevel \|\| 7`, `offer.trlLevel \|\| 8`; Nếu `hasTechTransfer = false` hoặc không có TRL hiển thị "Hàng hóa thương mại / Không áp dụng TRL" và ẩn badge TRL; Chỉ hiển thị TRL khi có chuyển giao và `trlLevel` hợp lệ |
| **Hiển thị trung thực Tình trạng Pháp lý SHTT** | `REQ-DELTA-09`, `BR-OFFER-IP-01`, `UI-DELTA-04-04`, `AC-04-040` | T-04.99 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Xóa bỏ cụm từ tự xưng "Đã thẩm định hồ sơ SHTT hợp pháp" và fallback "Đã thẩm định"; Phân biệt minh bạch: có số văn bằng / `TRADE_SECRET` ("Bí quyết công nghệ / Bí mật kinh doanh") / chưa đăng ký bảo hộ ("Chưa đăng ký bảo hộ SHTT hoặc là bí quyết kinh doanh") |
| **Quy cách & Đơn vị chuyển giao nguyên văn từ CSDL** | `REQ-DELTA-10`, `BR-OFFER-SPECS-01`, `AC-04-041` | T-04.100 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Hiển thị nguyên văn `offer.unit` do Seller nhập; nếu null/rỗng hiển thị chuỗi trung tính "Đang cập nhật quy cách"; xóa bỏ chuỗi fallback "Theo gói giải pháp chuyển giao và đào tạo tích hợp" |
| **Bộ kiểm thử Vitest Unit/Component Tests Delta v9** | `AC-04-038..041` | T-04.101 | `src/app/chao-ban-cong-nghe/[id]/page.test.tsx` | 12/12 tests pass 100% (bao gồm Negative assertions: không có 3 file PDF mock, không fallback TRL 7/8, không có text "Đã thẩm định", không fallback gói giải pháp) |
| **Thẩm định Chất lượng Toán học tĩnh & Gate 4/5 Pass** | `AC-04-038..041`, `QC-4-TIERS` | T-04.102 | `src/app/chao-ban-cong-nghe/[id]/page.tsx`, `pnpm build` | `tsc --noEmit` 0 errors, Next.js 15 build tĩnh 63/63 routes pass 100%, đối soát truy vết 100% khép kín |
| **Mở rộng Catalog Sở KH&CN & Helper nhận diện địa bàn** | `REQ-DELTA-04-03`, `REQ-DELTA-04-04`, `BR-DELTA-04-01`, `AC-DELTA-04-03`, `AC-DELTA-04-04` | T-04.103, T-04.104 | `services/api/technology-offer.ts` | Bổ sung `VN-TN` (Sở KH&CN tỉnh Thái Nguyên) và 34 tỉnh ĐMST; Xây dựng helper 3 cấp `resolveDefaultAuthority` |
| **Tích hợp UI Bước 1, FastTrack Modal & Sync 2 chiều** | `REQ-DELTA-04-01`, `REQ-DELTA-04-02`, `UI-DELTA-04-01`, `UI-DELTA-04-02`, `AC-DELTA-04-01`, `AC-DELTA-04-02` | T-04.105, T-04.106 | `SellerIdentityCard.tsx`, `FastTrackSubmitModal.tsx`, `create/page.tsx`, `[id]/edit/page.tsx` | Đưa Combobox chọn Sở lên Bước 1, hiển thị Smart Badge địa bàn; Đồng bộ 2 chiều giữa Bước 1, Bước 4 và FastTrack Modal |

---

## 19. TASK-04 Delta v10: Phân Nhánh Nghiệp Vụ Tường Minh Giữa Sản Phẩm Thương Mại & Công Nghệ Chuyển Giao (14 Business Controls)

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Phân nhánh Header Badges, Hero CTA & Cam kết bảo mật** | `REQ-DELTA-11`, `BR-OFFER-COMMERCIAL-01`, `UI-DELTA-04-05`, `AC-04-042` | T-04.109 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Cờ `isCommercialProduct`: Badge "Sản phẩm thương mại", CTA Hero "Đặt mua sản phẩm / Kết nối thương mại" (`ShoppingBag`), Hero Note mở báo giá sỉ; Triệt tiêu chuỗi chuyển giao công nghệ trên Hero |
| **Phân nhánh Sidebar Thẻ Giá, CTA Sidebar, Nút DataRoom & Đầu mối** | `REQ-DELTA-12`, `BR-OFFER-COMMERCIAL-01`, `UI-DELTA-04-05`, `AC-04-043` | T-04.110 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Tiêu đề "GIÁ BÁN NIÊM YẾT / THƯƠNG MẠI", nút "Đặt Mua Hàng / Yêu Cầu Báo Giá Sỉ", nút "Xem Hồ Sơ Chất Lượng & ATTP", đầu mối "Đầu Mối Kinh Doanh & Phân Phối" |
| **Phân nhánh Nội dung Tab 1 (Tổng quan) & Tab 2 (Thông số kỹ thuật)** | `REQ-DELTA-13`, `BR-OFFER-COMMERCIAL-02`, `UI-DELTA-04-05`, `AC-04-044` | T-04.111 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Tab 1: "Công Dụng & Giá Trị Mang Lại Cho Khách Hàng"; Tab 2: "Sản phẩm thương phẩm thương mại (Không bao gồm chuyển giao công nghệ/quy trình sản xuất)", "Bán hàng thương phẩm / Hợp đồng cung ứng đại lý", "Đơn vị sản xuất / Chế biến" |
| **Tái cấu trúc Modal Kết nối Đặt hàng B2B & Mở rộng Dải Ngân sách** | `REQ-DELTA-14`, `BR-OFFER-COMMERCIAL-03`, `UI-DELTA-04-06`, `AC-04-045` | T-04.112 | `src/app/chao-ban-cong-nghe/[id]/page.tsx` | Tiêu đề "Gửi Yêu Cầu Đặt Mua / Kết Nối Thương Mại", 4 hình thức B2B (`PURCHASE_COMMERCIAL`, `SUPPLY_CONTRACT`, `DISTRIBUTION_AGENT`, `SAMPLE_ORDER`), dải ngân sách nhỏ (`UNDER_20M`, `20M_100M`, `100M_500M`), đóng gói tiền tố `[Đề xuất thương mại: ...]` |
| **Bộ kiểm thử Vitest Unit/Component Tests Delta v10** | `AC-04-042..046` | T-04.113 | `src/app/chao-ban-cong-nghe/[id]/page.test.tsx` | 17/17 tests pass 100% (bao gồm 5 test cases Delta v10: kiểm tra 14 controls, Negative Assertions không li-xăng/TTO/chuyển giao trên hàng hóa, và Zero Regression cho hồ sơ R&D) |
| **Thẩm định Chất lượng Toán học tĩnh & Gate 4/5 Pass** | `AC-04-042..046`, `QC-4-TIERS` | T-04.114 | `src/app/chao-ban-cong-nghe/[id]/page.tsx`, `pnpm build` | `tsc --noEmit` 0 errors, Next.js 15 build tĩnh 63/63 routes pass 100%, đối soát truy vết 100% khép kín 114/114 tasks hoàn tất |

---

## 20. TASK-01 Delta v2: Tươi Mới & Đa Dạng Hóa Cung - Cầu Trang Chủ (Zero Key Warning & Interleaved Rotation)

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Dọn dẹp CSDL & Đánh chỉ mục truy vấn Home** | `REQ-01-DELTA-02`, `BR-01-DELTA-02` | T-01.19 | `demand.demand_items`, `technology.seller_technology_offers` | `UPDATE is_public_listed = false` cho 5 bài toán test trùng lặp; chỉ mục composite `ix_demand_items_home`, `ix_seller_offers_home`; CSDL 100% độc bản |
| **Xoay tua xác định theo ngày & Bốc luân phiên đa ngành Cầu** | `REQ-01-DELTA-01`, `BR-01-DELTA-01`, `API-01-DELTA-01` | T-01.20 | `DemandController.cs`, `InterleavedRotation.cs` | Tham số `rotate=true`, `limit=6`, Deterministic Daily Rotation (`seed = yyyyMMdd`), DistinctBy `TechnicalProblem`, tối đa 2 items/ngành |
| **Xoay tua xác định theo ngày & Bốc luân phiên đa ngành Cung** | `REQ-01-DELTA-01`, `BR-01-DELTA-01`, `API-01-DELTA-02` | T-01.21 | `TechnologyOffersController.cs`, `InterleavedRotation.cs` | Tham số `rotate=true`, DistinctBy `Title`, Interleaved Sector Selection cho cả PostgreSQL và In-memory fallback |
| **Mở rộng Media Map đa ngành 17 Lĩnh vực chuẩn KH&CN** | `REQ-01-DELTA-03`, `BR-01-DELTA-04` | T-01.22 | `technology-media.ts` | Phủ kín 17 mã ngành `LV01`–`LV17`, 4 bậc fallback hình ảnh (Ảnh thật -> Ngành -> Từ khóa tiếng Việt -> Default) kèm gallery 4 ảnh |
| **Nâng cấp SDK Client SDK** | `REQ-01-DELTA-01`, `API-01-DELTA-01..02` | T-01.23 | `portal-client.ts`, `technology-offer.ts` | Hỗ trợ query params `{ rotate?: boolean, limit?: number }` đồng bộ |
| **Refactor UI Trang Chủ, triệt tiêu React Key Collision** | `REQ-01-DELTA-04`, `UI-01-DELTA-01..02` | T-01.24 | `src/app/page.tsx` | Khóa render độc nhất `key={`${item.type}-${item.id || item.itemCode || idx}-${idx}`}`, lọc Client-side Set deduplication, gọi API `rotate=true&limit=6` |
| **Bộ kiểm thử toàn diện 4 tầng Gate 4** | `SC-DELTA-01..04`, `QC-4-TIERS` | T-01.25 | Invariants, Vitest, E2E | Invariants 5/5 pass, Vitest 6/6 pass, Playwright E2E 5/5 ca pass 100%, 0 duplicate titles, 0 console key warnings |

---

## 21. TASK-00 Delta v11 (CR-2026-014): Chuẩn Hóa Dynamic Navigation, Dual Mode Switcher & Seller TT17 Integration

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Phân giải nhãn hồ sơ động theo chủ thể (Không Hardcode)** | `REQ-NAV-004`, `AC-DELTA-17` | `T-00.64` | `src/app/portal/layout.tsx` (`resolveProfileLabel`) | Nhận diện động: Viện/Trường $\rightarrow$ `Hồ sơ Viện / Trường`, HTX $\rightarrow$ `Hồ sơ Hợp tác xã`, ĐMST $\rightarrow$ `Hồ sơ Doanh nghiệp ĐMST`, Doanh nghiệp $\rightarrow$ `Hồ sơ Doanh nghiệp`; Vitest `QC-TEST-01..04` PASS |
| **Tích hợp module Đánh giá TT17 cho Seller Workspace** | `REQ-NAV-005`, `AC-DELTA-18` | `T-00.63` | `src/app/portal/layout.tsx` (`sellerNavItems`) | Bổ sung `{ href: "/assessments/tt17", label: "Đánh giá Năng lực TT17", icon: FileCheck }`; Vitest `QC-TEST-01` PASS |
| **Rút gọn nhãn Chế độ kép (Dual Mode Switcher), triệt tiêu lỗi truncate** | `REQ-NAV-006`, `AC-DELTA-19` | `T-00.62` | `src/components/common/role-switcher.tsx` | Nhãn `Bên Mua` và `Bên Bán` hiển thị sắc nét không bị dấu ba chấm `(...)`; Vitest `QC-TEST-05..06` PASS |
| **Bản vẽ Wireframe Basic Design HTML tương tác** | `PO-DEC-20261023-01` | - | `Specification/02_BASIC_DESIGN/TASK-00_PLATFORM_FOUNDATION_VA_COMMON/wireframe_workspace_seller_dual_mode.html` | Bản vẽ HTML trực quan mô phỏng chuyển đổi Dual Mode và dropdown giả lập loại hình chủ thể |
| **Bộ kiểm thử tự động chuyên biệt & hồi quy Gate 4** | `AC-DELTA-17..20`, `QC-4-TIERS` | `T-00.65` | `src/app/portal/portal-navigation-delta.test.tsx`, `src/app/portal/layout.test.tsx` | 16/16 Vitest tests PASS 100% (10 tests layout + 6 tests delta chuyên biệt) |

---

## 22. TASK-00 Delta v12 (CR-2026-015): Tối Ưu Hóa & Đồng Bộ Toàn Diện 7 Mục Chức Năng Workspace Seller

| Yêu Cầu Nghiệp Vụ / Rule | Detail Design (`spec.md` / `plan.md`) | Task Triển Khai | Mã Nguồn / Bề Mặt Tác Động | Kiểm Chứng & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Xây dựng Seller Dashboard chuyên biệt cho SELLER role** | `REQ-SELLER-001`, `AC-DELTA-21` | `T-00.66` | `src/components/portal/seller-dashboard.tsx`, `src/app/portal/page.tsx` | Hiển thị 4 KPI doanh nghiệp, Quick Actions, bảng Inbound Leads mới nhất; xóa bỏ vòng lặp 4-card điều hướng của Buyer; Vitest `WAVE1-TEST-01..03` PASS |
| **Triệt tiêu rò rỉ phân quyền liên kết `/gov/*` khỏi B2B Workspace** | `REQ-SELLER-003..004`, `AC-DELTA-24` | `T-00.66` | `src/app/portal/opportunities/pipeline/page.tsx`, `src/app/portal/matching/radar/page.tsx` | Xóa bỏ liên kết `/gov/opportunities` ("Giám Sát Sở KH&CN"); Vitest `WAVE1-TEST-02..03` PASS |
| **Dọn dẹp dev badges và bổ sung bộ lọc dải TRL tại Kho Công nghệ** | `REQ-SELLER-002`, `AC-DELTA-22..23` | `T-00.67` | `src/app/portal/seller/technologies/page.tsx` | Xóa bỏ `<header>` trùng lặp và badge `TASK-04`, `SELLER WORKSPACE`; tích hợp bộ lọc dropdown `trlFilter` (TRL 1-3, 4-6, 7-9); Vitest `QC-TEST-02A..02B` PASS |
| **Làm sạch cú pháp TeX tại trang Đánh giá Năng lực TT17** | `REQ-SELLER-006`, `AC-DELTA-25` | `T-00.67` | `src/app/(portal)/assessments/tt17/page.tsx` | Thay thế chuỗi thô `$T_{"ĐB"}$` thành `T_ĐB`; giao diện hiển thị chuyên nghiệp không bị dính ký tự toán học chưa render |
| **Nâng cấp Hồ sơ Doanh nghiệp sang ConfirmModal & Clean State** | `REQ-SELLER-007`, `AC-DELTA-26` | `T-00.68` | `src/app/portal/enterprise/profile/page.tsx` | Khởi tạo `highQualificationRatio: ""`; thay thế `window.confirm()` bằng `<ConfirmModal />` chuẩn Design System NacenTech; Vitest `QC-TEST-07A..07B` PASS |
| **Bộ kiểm thử toàn diện 4 test suites Gate 4/5 Pass** | `AC-DELTA-21..27`, `QC-4-TIERS` | `T-00.69` | `seller-workspace-delta-qc.test.tsx`, `seller-dashboard.test.tsx`, `portal-navigation-delta.test.tsx`, `layout.test.tsx` | 23/23 Vitest tests PASS 100% (100% Green, 0 errors) |









