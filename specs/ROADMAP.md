# Master Roadmap & Epic Registry: Hệ Thống Phần Mềm Nacentwin (NacenTech)

> **Mục đích**: Là nguồn thông tin duy nhất (Single Source of Truth) quản lý toàn bộ vòng đời, tiến độ và liên kết tài liệu của tất cả các Epics trong dự án.  
> **Cơ chế liên kết**: Ánh xạ chuẩn 1:1 với các Tasks Thiết Kế Cơ Sở (Basic Design) tại [Specification (GitHub)](https://github.com/NacenTwin/NacenTwin-Docs) hoặc local `../../Specification/02_BASIC_DESIGN/`.  
> **Hiến pháp áp dụng**: `.specify/memory/constitution.md`  
> **Ma trận truy vết**: `specs/TRACEABILITY.md`

---

## 1. BẢNG ĐIỀU PHỐI TOÀN BỘ EPICS (MASTER REGISTRY)

| Mã Epic | Nhóm | Tên Phân Hệ Kỹ Thuật | Thư Mục Spec Kit | Ánh Xạ Basic Design | Trạng Thái | Tiến Độ | Ghi Chú / Trọng Tâm Kỹ Thuật |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **`TASK-00`** | **Foundation** | Khung Dự Án, Kiến Trúc & Common Kernel | [`specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON`](./TASK-00_PLATFORM_FOUNDATION_VA_COMMON/) | *Hạ tầng kỹ thuật* | ✅ **Delta v6 hoàn tất** | Nền tảng + identity lifecycle + session UX | Contract v2, public `PUBLIC_USER`, provision/assignment có audit, menu tài khoản và logout Web Portal đã hội tụ (T-00.41–48). |
| **`TASK-01`** | **Domain** | Tổng Quan Hệ Thống & Kiến Trúc Home | [`specs/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME`](./TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/) | [`TASK-01`](../../Specification/02_BASIC_DESIGN/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME) | ⚪ **Dự Kiến** | 0% | SiteMap, Menu điều hướng, Portal Landing, Chatbot AI định hướng kết nối cung cầu |
| **`TASK-02`** | **Domain** | Hồ Sơ Chủ Thể & Doanh Nghiệp ĐMST | [`specs/TASK-02_HO_SO_CHU_THE_VA_DN_DMST`](./TASK-02_HO_SO_CHU_THE_VA_DN_DMST/) | [`TASK-02`](../../Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST) | 🔵 **Đang thi công** | 5% | 10 nhóm trường (225 fields), định danh pháp lý MST, hồ sơ năng lực KH&CN, văn bằng SHTT |
| **`TASK-03`** | **Domain** | Hồ Sơ Tìm Mua / Nhu Cầu (Buyer) | [`specs/TASK-03_HO_SO_TIM_MUA_BUYER`](./TASK-03_HO_SO_TIM_MUA_BUYER/) | [`TASK-03`](../../Specification/02_BASIC_DESIGN/TASK-03_HO_SO_TIM_MUA_BUYER) | 🔵 **Đang thi công** | 0% | Phiếu khảo sát nhu cầu đổi mới công nghệ DNNVV, đăng ký tham quan triển lãm |
| **`TASK-04`** | **Domain** | Hồ Sơ Chào Bán (Seller) & Bộ Lọc 18 Ngành | [`specs/TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`](./TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC/) | [`TASK-04`](../../Specification/02_BASIC_DESIGN/TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC) | ⚪ **Dự Kiến** | 0% | **Domain Lõi**: Hồ sơ 4 lớp, Engine lọc 1,479 quy tắc, thang đo TRL 1-9 khi chuyển giao |
| **`TASK-05`** | **Domain** | Hồ Sơ Chuyên Gia KH&CN & AI Scan LLKH | [`specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN`](./TASK-05_HO_SO_CHUYEN_GIA_KHCN/) | [`TASK-05`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN) | ✅ **Delta v12 hoàn tất (Gate 4/5 Pass)** | 100% (T001–T113) | Đồng bộ triệt để taxonomy động từ DB (10 mã LV TT17), phân trang/lọc đa tiêu chí, địa bàn theo scope, form consultation tích hợp API, fix dứt điểm 4 lỗi test black-box (TC-C2-12, TC-C3-11, TC-C4-06, TC-C4-08), 95/95 invariants pass, dataset fixture 14 chuyên gia đã sẵn sàng. |
| **`TASK-06`** | **Domain** | Danh Mục Ngành TT17 & Ma Trận LV-CN | [`specs/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`](./TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/) | [`TASK-06`](../../Specification/02_BASIC_DESIGN/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN) | 🔄 **Delta v12 đang hội tụ; v2 đã nghiệm thu lịch sử** | T019–T023 chưa nghiệm thu | **Master Data & AI Invariant**: Đã đồng bộ triệt để 10 Lĩnh vực chuẩn `LV` từ file Excel (`LV01, LV05, LV07, LV08, LV11, LV12, LV14, LV15, LV16, LV17`), triệt tiêu 100% mã `SEC-*` tự chế, nâng cấp CSDL `policy.taxonomy_terms` (`code`, `metadata`), Scoped RBAC và giao diện Web Admin. |
| **`TASK-07`** | **Domain** | Phân Quyền & Năng Lực Quản Trị Admin | [`specs/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`](./TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/) | [`TASK-07`](../../Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN) | ✅ **Delta v4 hoàn tất** | 100% | 10 Roles 3D Scoped RBAC, Phân cấp Duyệt Chuyên gia Cấp 2 cho Lãnh đạo Sở KH&CN, Cổng Tác Nghiệp Cấp 2 `/gov`, Action `REVOKE_EXPERT` Hậu kiểm Trung ương theo BR-ADM-007 (T001–T031). |
| **`TASK-09`** | **Domain** | Đánh Giá Trình Độ Năng Lực Công Nghệ TT17 | [`specs/TASK-09_DANH_GIA_TRINH_DO_NANG_LUC_CONG_NGHE_TT17`](./TASK-09_DANH_GIA_TRINH_DO_NANG_LUC_CONG_NGHE_TT17/) | [`TASK-09`](../../Specification/02_BASIC_DESIGN/TASK-09_DANH_GIA_TRINH_DO_NANG_LUC_CONG_NGHE_TT17) | 🔵 **Đang thi công** | 0% | Form TT17 5 nhóm (T-E-O-R-I), Auto-scoring engine, Hybrid JSONB cho list máy móc, Snapshot năm |

---

## 2. QUY ƯỚC ĐẶT TÊN & BỘ 3 TÀI LIỆU BẮT BUỘC

1. **Quy tắc đặt tên thư mục Detail Design**:
   - `specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON` (Khung dự án & thư viện dùng chung).
   - `specs/TASK-XX_<TEN_GIONG_BASIC_DESIGN>` (Khớp tên 1:1 với thư mục tại `../../Specification/02_BASIC_DESIGN/`).
2. **Bộ 3 tài liệu bắt buộc trong mỗi Epic**:
   - `spec.md`: Đặc tả yêu cầu kỹ thuật, trích dẫn trực tiếp nguồn từ Basic Design, User Stories, `REQ-*`, `BR-*`.
   - `plan.md`: Thiết kế chi tiết: API Contracts (Contract-First), DB Schema, Backend Architecture, Frontend UI/UX (5 UX States).
   - `tasks.md`: Phân rã đầu việc có tag `[BE]`, `[FE]`, `[INT]` kèm lệnh test kiểm chứng.

---

## 3. THỨ TỰ TRIỂN KHAI TỐI ƯU (RECOMMENDED EXECUTION SEQUENCE)

```text
Giai đoạn 0: TASK-00 (Foundation & Common Kernel)
   ↓
Giai đoạn 1: TASK-06 (Master Data Danh mục ngành & Ma trận - Khóa ngoại bắt buộc)
   ↓
Giai đoạn 2: TASK-07 (Phân quyền & Kiểm duyệt Admin)
   ↓
Giai đoạn 3: TASK-02 (Hồ sơ DN ĐMST) → TASK-04 (Hồ sơ Seller & Bộ Lọc) → TASK-03 (Buyer) → TASK-05 (Chuyên gia)
   ↓
Giai đoạn 4: TASK-01 (Tổng quan & Giao diện Trang chủ Portal kết nối toàn hệ thống)
```

---

## 4. LỊCH SỬ THAY ĐỔI ROADMAP

| Thời Gian | Epic Bị Tác Động | Loại Thay Đổi | Mô Tả Chi Tiết Thay Đổi | Người / Công Cụ |
| :--- | :--- | :--- | :--- | :--- |
| **2026-10-09** | **TASK-05** | **Hoàn thành Delta v11 & Delta v12 (CR-2026-005) — Nghiệm thu Gate 4 & Gate 5 Sign-off** | Sửa dứt điểm 4 điểm nghẽn test black-box (TC-C2-12 regex collision, TC-C3-11/C4-06/C4-08 unwrap ExpertPublicDirectoryDto), tạo dataset fixture idempotent 14 chuyên gia (`seed_delta_v12_e2e_dataset.sql`), 95/95 Invariants pass 100%, đánh dấu hoàn tất 26/26 task Phase 16 & 17 (T088–T113). Đóng Epic xuất xưởng. | PO/PM (`nacen-po-pm`) |
| **2026-10-07** | **TASK-05** | **CR-2026-005 — Delta v11 đang hội tụ** | Hội tụ `/experts`: ngành lấy số record SECTOR active từ DB (baseline migration hiện seed 10 mã LV), sửa nguồn/lọc địa bàn, kết nối modal với API tiếp nhận hiện hữu, tinh gọn giao diện và giữ 5 UX states. Phát hiện query legacy `query` vs client `q`, thêm task T098. Đang triển khai; nghiệm thu còn chờ Gate 4. | PO/PM + `wf-delta` |
| **2026-10-06** | **TASK-05** | **Hoàn thành Delta v10: Danh bạ Tìm kiếm & Lọc Chuyên gia Công Khai (`/experts` & `/chuyen-gia`)** | Triển khai thành công toàn diện: (1) Basic Design v2.7 & Wireframe HTML `wireframe_danh_ba_chuyen_gia.html`; (2) Spec Delta v10 & Plan Delta v10; (3) Backend API `GET /api/v1/public/experts` với phân trang & lọc đa tiêu chí; (4) Frontend `/experts` (Grid thẻ, Bộ lọc 4 trục TT17/Học vị/34 Tỉnh thành, Modal kết nối, 5 UX states); (5) Route alias `/chuyen-gia` redirect `/experts`; (6) Quality Gate: 83/83 Invariants pass, 89/89 Vitest pass, Next.js 15 build static prerender 0 lỗi. | PO/PM Autopilot (`speckit-autopilot`) |
| **2026-10-06** | **TASK-07 & TASK-05** | **Hoàn thành Delta v4 Phân Cấp Duyệt Chuyên Gia Cấp 2 & Trung Ương Hậu Kiểm** | Nghiệm thu đóng Delta v4: Hoàn tất 5/5 tasks (T027–T031). (1) Wizard TASK-05 bổ sung chọn Sở KH&CN tiếp nhận thẩm định; (2) Backend DTO nhận ScopeType/ScopeId và tự động tạo ApprovalRequest với SLA 48h; (3) Cổng Tác Nghiệp Cấp 2 `/gov` & `/gov/approvals` hoạt động sống với Row-Level Security tự động theo ScopeId cán bộ Sở; (4) Action `REVOKE_EXPERT` cho Super Admin theo BR-ADM-007; (5) Quality Gate 82/82 Invariants pass, 86/86 Vitest pass. | PO/PM (`tc-po`) |
| **2026-10-05** | **TASK-06** | **Nghiệm thu Gate 5 Hoàn tất Delta v2** | Nghiệm thu đóng Delta v2: Hoàn tất 8/8 tasks (T011–T018). Schema CSDL `policy.taxonomy_terms` đã thêm `code`, `metadata`; nạp 10 Lĩnh vực chuẩn `LV01..LV17`; triệt tiêu 100% `SEC-*`; API & Scoped RBAC đồng bộ; Web Admin `/admin/sectors` & `/admin/roles` sạch đẹp; Quality Gate 70/70 Invariants pass, 37/37 Contracts pass, TypeScript 0 lỗi. | PO/PM (`tc-po`) |
| **2026-10-05** | **TASK-06** | **Chỉ đạo User: Tinh gọn 10 Lĩnh Vực Chuẩn `LV`** | Theo lệnh User: Bỏ toàn bộ 8 mã khuyết (`LV02, LV03, LV04, LV06, LV09, LV10, LV13, LV18`) chưa có trong Excel, chỉ triển khai 10 Lĩnh vực chuẩn xác thực trong Excel (`LV01, LV05, LV07, LV08, LV11, LV12, LV14, LV15, LV16, LV17`), triệt tiêu `SEC-*` và nâng cấp CSDL. | User & PO/PM (`tc-po`) |
| **2026-10-05** | **TASK-06** | **Kích hoạt Delta v2 Đồng bộ Lĩnh Vực Chuẩn `LV`** | Phê duyệt kế hoạch loại bỏ mã tự chế `SEC-*`, đồng bộ toàn hệ thống sang mã `LV` khớp SSOT file Excel gốc và ma trận 109 cặp CN; nâng cấp schema `policy.taxonomy_terms` (thêm `code`, `metadata`); chuẩn hóa Scoped RBAC và giao diện Web. | PO/PM (`tc-po`) |
| **2026-10-02** | **TASK-06 & TASK-07** | **Hội tụ hoàn tất TASK-06 & Delta v3 TASK-07** | Hoàn thành trọn vẹn Basic Design, Wireframe, Spec Kit (spec/plan/tasks), Backend APIs, Frontend UIs (`/admin/roles`, `/admin/org-tree`, `/admin/sectors`, `/admin/approvals`), Admin Navigation Hub, Invariants Tests 70/70 pass và Vitest 51/51 pass. | `/speckit-autopilot` & `/speckit-delta` |
| **2026-10-01** | **TASK-07** | **Hoàn thành Autopilot TASK-07 Admin Governance** | Triển khai trọn vẹn T001–T020: ApprovalRequest, OrganizationUnit, ApprovalAuditLog, EF Core migration, ApprovalService (5 luồng kiểm duyệt Maker-Checker), OrganizationTreeService (63 tỉnh), API endpoints v1, Web Admin UI Approvals (`/admin/approvals`) & Org Tree (`/admin/org-tree`), Invariants 65/65 pass, Vitest 51/51 pass. | `/speckit-autopilot` |
| **2026-09-30** | **TASK-00** | **Hoàn thành Delta v6 Menu tài khoản & đăng xuất** | Triển khai menu danh tính Header có Settings/Logout, logout xác nhận tại Header và Settings, xóa session local và regression Vitest 49/49. Không thay API, DB hay migration. | `/speckit-delta` |
| **2026-09-29** | **TASK-05** | **Khởi tạo Delta v6 Real Authentication & Owner E2E** | Đóng 3 gap: Web relative login/fallback mock, login response làm mất `VERIFIED_EXPERT`, và Person–ExpertProfile demo chưa liên kết. Append Phase 10 T054–T060; TASK-00 chỉ là dependency JWT/RBAC, không tạo Epic mới. | `/speckit-delta` |
| **2026-09-29** | **TASK-05** | **Autopilot Phase 10 — phần thực thi chính** | Hoàn tất T054–T058: JWT role/scope thật, fixture Development không chứa secret, Person–ExpertProfile ownership, canonical API base, bỏ mock login và RoleGuard Owner. Web build/test 4/4, backend build, Zalo build đều pass; real browser E2E login → Owner Full Detail pass. | `/speckit-autopilot` |
| **2026-09-29** | **TASK-05** | **Converge Delta v6** | Hoàn tất T059–T060: PostgreSQL integration test cho role/scope/JWT và owner isolation; component token-recovery; local browser E2E và regression Backend/Web/Zalo pass. | `/speckit-autopilot` |
| **2026-09-29** | **TASK-05** | **Detail Design Delta v7 Owner Workspace** | Bổ sung Information Architecture, wireframe, user stories, API contracts và state matrix cho View/Edit/completeness/yêu cầu tư vấn. Chỉ quy hoạch đơn tư vấn/hợp đồng Post-MVP, không tạo Epic mới. | `/speckit-specify` (fallback SRS authoring) |
| **2026-09-29** | **TASK-05** | **Delta v8 Dashboard chuyên gia** | Thay `/portal` đa vai trò bằng dashboard riêng cho `VERIFIED_EXPERT`: trạng thái hồ sơ, việc cần làm, thông báo và lối tắt; không hiển thị marketplace. Không thay DB/API/RBAC. | `/speckit-delta` |
| **2026-09-29** | **TASK-05** | **Delta v9 CCCD PII convergence** | Áp dụng Decision Record v2.5: CCCD giữ dữ liệu lịch sử nhưng không bắt buộc/hiển thị qua Portal/Zalo; migration nullable và contract deny-list. | `/speckit-delta` |
| **2026-09-29** | **TASK-05** | **Converge Delta v9 CCCD PII** | Hoàn tất T071–T075: migration PostgreSQL nullable, API contract deny-list, Web/Zalo regression và build/test pass. Phiên Development trước khi restart bị vô hiệu theo khóa ký phiên, không liên quan contract CCCD. | `/speckit-delta` |
| **2026-09-28** | **TASK-05** | **Hoàn thành Delta v5 Expert Detail Page** | Hoàn tất T044–T053: migrations `AddExpertPublicDetailProjection` + `AddExpertPrivateDetailAndAchievementMetadata`, Public/Owner/Admin APIs, private audit/download, notification CTA, Web/Zalo và Vitest 2/2. | `/speckit-delta` |
| **2026-09-28** | **TASK-05** | **Triển khai Delta v5 (phần 1)** | Apply migration `AddExpertPublicDetailProjection` trên PostgreSQL local; hoàn thành API public/owner/admin, audit/download bảo vệ, Web Public/Owner pages, CTA Partial và Zalo handoff. | `/speckit-delta` |
| **2026-09-28** | **TASK-05** | **Khởi tạo Delta v5 Expert Detail Page** | Đối soát wireframe Sổ tay Chuyên gia: tách Public Web/Owner Full, projection API, PII/audit, DB gap, Web detail và Zalo handoff thành Phase 9 (T044–T053). | `/speckit-delta` |
| **2026-09-28** | **TASK-05** | **Khởi tạo Delta v3 DB Closure** | Đối soát Detail Design ↔ model ↔ migration; bổ sung yêu cầu về schema chuẩn hóa, PII/chứng từ, AI ingestion, consent, trạng thái và task migration/test non-destructive. | `/speckit-delta` |
| **2026-09-25** | **TASK-05** | **Hoàn Thành Delta v2 Zalo Mini App** | Hoàn tất toàn bộ 8 tasks Phase 6 (T021-T028), build ZMP www/ sạch 0 lỗi, CORS Zalo webview, endpoint quick-intake, nghiệm thu hội tụ Definition of Done | Spec Kit Converge |
| **2026-09-25** | **TASK-05** | **Khởi Tạo Delta v2 Zalo Mini App** | Phân tích tác động, bổ sung Spec Delta v2, Plan Delta v2 và phân rã 8 tasks Phase 6 tích hợp Zalo Mini App (< 2 phút) & Backend Intake Endpoint | Spec Kit Delta |
| **2026-09-25** | **TASK-00** | **Hoàn Thành Delta v4 Path-Based 4 Portals** | Xây dựng 4 Cổng trỏ đường dẫn (`/`, `/portal`, `/gov`, `/admin`), RoleGuard & Login Gateway Router | Spec Kit Delta |
| **2026-09-25** | **TASK-00** | **Hoàn Thành Delta v3 Frontend Common** | Đóng gói Dialog, ConfirmModal, Toast, Theme Dark/Light, Fontsize Scaler, i18n, Navbar & Footer | Spec Kit Delta |
| **2026-09-25** | **TASK-05** | **Triển Khai Hoàn Thành (Autopilot)** | Hoàn tất toàn trình 5 giai đoạn: Contracts, Backend .NET, Unit Invariants, Frontend Next.js 15, Wizard 3 bước, 5 UX States | Spec Kit Autopilot |
| **2026-09-25** | **TASK-05** | **Đặc Tả Kỹ Thuật (Spec Kit)** | Khởi tạo spec.md cho Wizard 3 bước nâng hạng Chuyên gia chuẩn Bộ KH&CN và AI-to-Text scan LLKH | Spec Kit Specify |
| **2026-09-25** | **TASK-07** | **Đặc Tả Kỹ Thuật (Spec Kit)** | Khởi tạo trọn vẹn bộ 3 Spec Kit (spec.md, plan.md, tasks.md) nạp từ SRS-001 và 10 Roles Scoped RBAC | Spec Kit Specify & Delta |
| **2026-09-25** | **Toàn bộ Roadmap** | **Chuẩn hóa 1:1 với Basic Design** | Đồng bộ toàn bộ danh mục Epics khớp 1:1 với 7 Tasks Basic Design + bổ sung TASK-00 Foundation | Spec Kit Autopilot |
