# Change Request: CR-BACLINK-005 Chuyển Đổi Danh Bạ DN Hội Viên Bắc Ninh, Sàn Sản Phẩm/Năng Lực, Bảng Nhu Cầu & Deal Room MOU (Cross-Epic)

**CR-ID**: CR-BACLINK-005  
**Epic Chủ Đạo**: TASK-02_HO_SO_CHU_THE_VA_DN_DMST  
**Cross-Epic Impact**: `TASK-03_HO_SO_TIM_MUA_BUYER`, `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`, `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
**Status**: APPROVED  
**Target Version**: `TASK-02` (`1.13.0`) · `TASK-03` (`1.16.0`) · `TASK-04` (`1.12.0`) · `TASK-08` (`1.16.0`)  
**Author**: Senior Business Analyst (`nacen-ba`)  
**Date**: 2026-11-17  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- [`Specification/BASIC_DESIGN_BACLINK.md`](../../../../Specification/BASIC_DESIGN_BACLINK.md) (Mục 1, 3, 6, 9.2 — `PO-DEC-BACLINK-01`, `PO-DEC-BACLINK-02`, `PO-DEC-BACLINK-03`, `PO-DEC-BACLINK-05`).
- [`SourceCode/backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md`](../../../backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md) (Mục 2.3, 2.5).
- [`SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`](../../SPEC_MANAGEMENT_CONSTITUTION.md).

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

- **Hiện trạng cũ (Current State / As-Is)**:
  1. **`TASK-02`**: Danh bạ `/doanh-nghiep-dmst` và `/enterprises` gắn với kho 304 DN ĐMST toàn quốc, lọc theo 34 tỉnh (`PROVINCES_34`) và 10–18 ngành TT17 (`LV01..LV18`), luồng phê duyệt nâng cấp DN gắn với `PROVINCIAL_ADMIN` và `ScopeTypes.Province`.
  2. **`TASK-03`**: Sàn `/nhu-cau-cong-nghe` và Workspace `/portal/buyer/demands` dùng thuật ngữ "Nhu cầu đổi mới công nghệ TT17", lọc theo 34 tỉnh/ngành `LV*`, kiểm duyệt `/gov/demands` mở `[AllowAnonymous]` hoặc kiểm tra `PROVINCIAL_ADMIN` / chặn `PlatformRoles.Buyer`.
  3. **`TASK-04`**: Sàn `/chao-ban-cong-nghe` và `/portal/seller/technologies/*` dùng thuật ngữ "Chào bán công nghệ / Bộ Tứ SHTT" lọc theo 18 ngành TT17 & 34 tỉnh, yêu cầu `ManagingAuthorityId` là Sở KH&CN và duyệt bởi `PROVINCIAL_ADMIN`/`CLUSTER_ADMIN`.
  4. **`TASK-08`**: `BrokerageMatchingEngineService` và `BrokerageControllers` phân nhánh cứng SQL isolation theo `PlatformRoles.Buyer` vs `PlatformRoles.Seller` và `PlatformRoles.ProvincialAdmin` (xung đột với `ADR-0018` Mục 2.3 khi 1 doanh nghiệp `ENTERPRISE` vận hành Dual-Mode qua `activeRole`), đồng thời `/api/v1/gov/opportunities` đang gắn `[AllowAnonymous]`.
- **Đề xuất mới (Proposed State / To-Be)**:
  1. **`TASK-02` (Danh bạ DN Hội viên Bắc Ninh & `seed_baclink_demo_data.sql` Zero-Mock)**: Tái định vị thành **Danh bạ Doanh nghiệp Hội viên Hiệp hội BACLINK**, lọc theo **8 địa bàn Bắc Ninh + 1 nhóm ngoài tỉnh**, **KCN trọng điểm Bắc Ninh** (Yên Phong I/II, Quế Võ I/II/III, VSIP Bắc Ninh, Tiên Sơn, Đại Đồng – Hoàn Sơn, Hanaka, Thuận Thành, Gia Bình), **8 ngành công nghiệp `IND_*`** và chứng chỉ (`ISO 9001`, `IATF 16949`, `ISO 14001`, `ESD`, `Lean/5S`, `ESG`). Nạp dữ liệu demo thật qua script idempotent `SourceCode/backend/scripts/seed_baclink_demo_data.sql` (Zero-Mock).
  2. **`TASK-03` (Bảng Nhu cầu tìm nhà cung ứng & đặt hàng gia công)**: Tái định vị thành **Bảng Nhu cầu Mua, Đặt hàng Gia công & Tìm nhà cung ứng công nghiệp Bắc Ninh**; lọc theo `IND_*` & Địa bàn/KCN Bắc Ninh; phê duyệt tập trung 1 cấp bởi `ADMIN` BACLINK; mọi `ENTERPRISE` ở chế độ `activeRole = 'BUYER'` đều tạo và quản lý được nhu cầu.
  3. **`TASK-04` (Sàn Sản phẩm & Năng lực sản xuất)**: Tái định vị thành **Sàn Sản phẩm & Năng lực Sản xuất / Gia công Công nghiệp Bắc Ninh**; lọc theo `IND_*`, Địa bàn/KCN Bắc Ninh, mức TRL 1–9 / Năng lực sản xuất & chứng chỉ; bỏ `ManagingAuthorityId` 34 Sở KH&CN; mọi `ENTERPRISE` ở chế độ `activeRole = 'SELLER'` đều đăng và quản lý được sản phẩm/năng lực; `ADMIN` duyệt 1 cấp.
  4. **`TASK-08` (Deal Room MOU & Radar AI theo `IND_*` & KCN Bắc Ninh, không phân tách `BUYER`/`SELLER` role)**: Không phân tách `BUYER`/`SELLER` role tại Identity (`user.role` giữ nguyên `'ENTERPRISE'`, `activeRole` điều hướng góc nhìn Mua/Bán trên `RoleSwitcher`); Radar AI ghép nối ưu tiên tương thích **ngành `IND_*` & KCN Bắc Ninh**; Deal Room MOU bảo toàn PDPD masking và chứng thực số, khóa toàn bộ endpoint `/gov/opportunities` cũ.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn Theo Từng Epic (Standardized Changes)

#### 2.1. `TASK-02` — Danh Bạ Doanh Nghiệp Hội Viên Bắc Ninh & `seed_baclink_demo_data.sql` (Zero-Mock)
- **[ADD] `REQ-02-BL-01` [Danh Bạ DN Hội Viên BACLINK Lọc Theo KCN, Địa Bàn & 8 Ngành `IND_*`]**:
  - Các route `/doanh-nghiep-dmst`, `/enterprises`, `/enterprises/[taxCode]` và component `EnterprisesDirectoryView.tsx` hiển thị **Danh bạ Doanh nghiệp Hội viên Hiệp hội BACLINK**, cho phép lọc theo 8 địa bàn Bắc Ninh + `NGOAI_TINH`, danh mục **KCN Bắc Ninh**, **8 ngành công nghiệp `IND_*`** và nhóm chứng chỉ nhà máy (`ISO 9001`, `IATF 16949`, `ESD`, `Lean/5S`, `ESG`).
- **[ADD] `REQ-02-BL-02` [Script SQL Seed Demo BACLINK Idempotent (`seed_baclink_demo_data.sql`)]**:
  - Cung cấp script `SourceCode/backend/scripts/seed_baclink_demo_data.sql` (`ON CONFLICT DO NOTHING / DO UPDATE`) nạp trực tiếp vào PostgreSQL thật:
    1. **5 tài khoản 3 cấp** (`@baclink.org.vn`): `admin@baclink.org.vn` (`ADMIN`), `member.hanelpt@baclink.org.vn`, `member.intech@baclink.org.vn`, `member.viqualita@baclink.org.vn` (`ENTERPRISE`), `guest@baclink.org.vn` (`PUBLIC_USER`).
    2. **10 DN Hội viên Bắc Ninh**: 3 DN thực tế tiêu biểu (**Hanel PT**, **INTECH Group**, **Viqualita**) + 7 DN mẫu minh họa đa KCN *(Cơ khí Chính xác Kinh Bắc, Nhựa Kỹ thuật Yên Phong, Tự động hóa & Robot VSIP, Bao bì Công nghiệp Quế Võ, Giải pháp Nhà máy Thông minh Từ Sơn, Logistics Công nghiệp Bắc Ninh, Vật liệu Xanh Tiên Sơn)* có gắn nhãn rõ dữ liệu demo mẫu.
    3. **Dữ liệu liên kết đầy đủ**: 10 sản phẩm/năng lực sản xuất (`TASK-04`), 8 nhu cầu đặt hàng (`TASK-03`), 3 sự kiện BACLINK (`TASK-01`), 6 khóa học LMS (`TASK-10`), 5 cố vấn kỹ thuật (`TASK-05`).
- **[ADD] `BR-02-BL-01` [Quy Tắc Zero-Mock Tuyệt Đối Trên Danh Bạ & Hồ Sơ DN]**:
  - Nghiêm cấm mảng dữ liệu giả trong khối `catch` hoặc fallback tĩnh tại Frontend (`EnterprisesDirectoryView.tsx`, `/enterprises/[taxCode]`). Mọi danh sách hiển thị phải đọc từ PostgreSQL thật và bọc `<Async>` đủ 5 UX States.
- **[MODIFY] `BR-02-BL-02` [Nâng Cấp DN Hội Viên 1 Cấp & Cấp Quyền `DUAL` Tự Động (`ADR-0018` Mục 2.3)]**:
  - Khi `ADMIN` duyệt đơn nâng cấp Hội viên tại `/admin/approvals`, `ApprovalService` gán `PlatformRole = "ENTERPRISE"`, `ScopeType = "GLOBAL"`, `ScopeId = null`, đồng thời kích hoạt `CapabilityTier = "DUAL"` (`IsBuyer = true`, `IsSeller = true`) cho thực thể `Enterprise` liên kết. Thay thế `PROVINCIAL_ADMIN` / `INNOVATION_ENTITY` / `ScopeTypes.Province` trong luồng duyệt mới.
- **[ADD] `AC-02-046` .. `AC-02-048`**.

#### 2.2. `TASK-03` — Bảng Nhu Cầu Tìm Nhà Cung Ứng & Đặt Hàng Gia Công (`Demand`)
- **[ADD] `REQ-03-BL-01` [Bảng Nhu Cầu Tìm Nhà Cung Ứng & Đặt Hàng Gia Công Bắc Ninh]**:
  - Các route `/nhu-cau-cong-nghe`, `/nhu-cau-cong-nghe/[id]`, `/khao-sat-nhu-cau`, `/khao-sat-doanh-nghiep`, `/portal/buyer/demands` tái định vị nhãn & trường lọc sang **Nhu cầu Mua, Đặt hàng Gia công & Tìm nhà cung ứng** theo **8 ngành `IND_*`** và **Địa bàn/KCN Bắc Ninh** (thay 18 ngành `LV*` & 34 tỉnh).
- **[ADD] `REQ-03-BL-02` [Khởi Tạo & Quản Lý Nhu Cầu Dưới Role `ENTERPRISE` Dual-Mode]**:
  - Tài khoản `ENTERPRISE` khi chuyển `RoleSwitcher` sang `activeRole = 'BUYER'` giữ nguyên `user.role = 'ENTERPRISE'` và thao tác đầy đủ CRUD bài toán nhu cầu tại `/portal/buyer/demands` (`QuickDemandModal`, `EditDemandModal`).
- **[ADD] `BR-03-BL-01` [Phê Duyệt Nhu Cầu 1 Cấp Bởi `ADMIN` & Khóa `/gov/demands` Anonymous]**:
  - Gỡ `[AllowAnonymous]` và logic `PROVINCIAL_ADMIN` khỏi `DemandController` (`/api/v1/gov/demands*` trả `401/403/410`); kiểm duyệt nhu cầu tập trung bởi `ADMIN` BACLINK; giữ nguyên cấm fallback `tniScore || 75` (`BR-TNI-VERIFY-01`) và đổi nhãn cơ quan bảo chứng mặc định sang `Hiệp hội BACLINK`.
- **[ADD] `BR-03-BL-02` [Tách Bạch `user.role = 'ENTERPRISE'` và `activeRole = 'BUYER'`]**:
  - Backend `DemandController` và `DemandService` cho phép mọi `ENTERPRISE` tạo/sửa/đóng nhu cầu của chính tổ chức mình (`CreatedBy == Actor.PersonId` hoặc `OrganizationId == Actor.OrganizationId`), không từ chối vì thiếu role `BUYER` riêng lẻ.
- **[ADD] `AC-03-BL-01` .. `AC-03-BL-03`**.

#### 2.3. `TASK-04` — Sàn Sản Phẩm & Năng Lực Sản Xuất (`TechnologyOffers`)
- **[ADD] `REQ-04-BL-01` [Sàn Sản Phẩm & Năng Lực Sản Xuất / Gia Công Công Nghiệp BACLINK]**:
  - Các route `/chao-ban-cong-nghe`, `/chao-ban-cong-nghe/[id]`, `/portal/seller/technologies/*` tái định vị sang **Sàn Sản phẩm & Năng lực Sản xuất** (linh kiện điện tử, gia công CNC/khuôn mẫu, nhựa kỹ thuật, tự động hóa, Smart Factory), lọc theo **8 ngành `IND_*`**, **Địa bàn/KCN Bắc Ninh**, mức TRL 1–9 / Năng lực sẵn sàng và chứng chỉ (`ISO 9001`, `IATF 16949`, `ESG`).
- **[ADD] `REQ-04-BL-02` [Đăng Sản Phẩm & Năng Lực Dưới Role `ENTERPRISE` Dual-Mode]**:
  - Tài khoản `ENTERPRISE` khi bật `RoleSwitcher` sang `activeRole = 'SELLER'` giữ nguyên `user.role = 'ENTERPRISE'` và thao tác đầy đủ tạo/sửa/ẩn-hiện sản phẩm tại `/portal/seller/technologies/*`.
- **[ADD] `BR-04-BL-01` [Bỏ Ràng Buộc `ManagingAuthorityId` 34 Sở & Duyệt 1 Cấp Bởi `ADMIN`]**:
  - `TechnologyOffersController` và `SellerOfferContracts` bỏ bắt buộc `ManagingAuthorityId` là Sở KH&CN và bỏ kiểm tra `Actor.ScopeId` theo tỉnh; thẩm định niêm yết & xác thực chỉ số thực hiện 1 cấp bởi `ADMIN` BACLINK; nhãn `<IndexVerificationBadge />` hiển thị cơ quan bảo chứng mặc định `Hiệp hội BACLINK`.
- **[ADD] `BR-04-BL-02` [Không Tách Role `SELLER` Khỏi `ENTERPRISE`]**:
  - Mọi `ENTERPRISE` được phép đăng bán và quản lý sản phẩm/năng lực của chính đơn vị mình (bảo toàn IDOR isolation theo `OrganizationId`/`OwnerPersonId`).
- **[ADD] `AC-04-059` .. `AC-04-061`**.

#### 2.4. `TASK-08` — Deal Room MOU & Radar AI Theo Ngành `IND_*` & KCN Bắc Ninh (Không Phân Tách `BUYER`/`SELLER` Role)
- **[ADD] `REQ-08-BL-01` [Radar AI Ghép Nối FDI–Nội Địa Theo Ngành `IND_*` & KCN Bắc Ninh]**:
  - Màn hình `/portal/matching/radar` và `BrokerageMatchingEngineService` hỗ trợ lọc và ưu tiên ghép nối cung–cầu theo **8 ngành `IND_*`** và **Địa bàn/KCN Bắc Ninh**, giữ cơ chế 4 trục XAI + PostgreSQL FTS Graceful Degradation và triệt tiêu 100% text mock.
- **[ADD] `REQ-08-BL-02` [Deal Room MOU & Pipeline Không Phân Tách `BUYER`/`SELLER` Role]**:
  - Các màn hình `/portal/matching/radar`, `/portal/seller/connection-requests`, `/portal/opportunities/pipeline`, `/portal/opportunities/[id]/deal-room` hoạt động xuyên suốt cho tài khoản `ENTERPRISE` thông qua `activeRole` (`BUYER` | `SELLER`) trên `RoleSwitcher`, không yêu cầu đăng nhập lại hay đổi `user.role`.
  - Deal Room MOU hỗ trợ đàm phán 1-1, mời Cố vấn Kỹ thuật Hiệp hội (`ADMIN` điều phối), giữ nguyên bảo vệ PII PDPD (chỉ Unmask SĐT/Email khi 2 bên chấp thuận kết nối) và gắn huy hiệu chứng thực `<BlockchainZkpBadge />` khi ký MOU.
- **[ADD] `BR-08-BL-01` [Loại Bỏ Phân Nhánh Role `BUYER`/`SELLER` Cứng Trong `BrokerageMatchingEngineService` (`ADR-0018` Mục 2.3)]**:
  - `BrokerageMatchingEngineService` và `BrokerageControllers` không phân nhánh isolation cứng theo `PlatformRoles.Buyer` vs `PlatformRoles.Seller` (vốn làm `ENTERPRISE` Dual-Mode mất quyền xem 1 trong 2 chiều). Thay vào đó:
    * Chiều cầu (`mode=buyer` hoặc `activeRole=BUYER`): lọc theo `DemandItems` thuộc `Actor.PersonId` / `Actor.OrganizationId`.
    * Chiều cung (`mode=seller` hoặc `activeRole=SELLER`): lọc theo `TechnologyOffers` thuộc `Actor.OrganizationId` / `Actor.PersonId`.
    * `ADMIN`: xem toàn sàn phục vụ điều phối; khóa `/api/v1/gov/opportunities` khỏi `[AllowAnonymous]` (trả `401/403/410`).
- **[ADD] `BR-08-BL-02` [Trọng Số Địa Lý KCN Bắc Ninh & Ngành `IND_*` Trong Radar Matching]**:
  - Trong `BrokerageMatchingEngineService`, khi đối sánh cặp Cung–Cầu cùng mã ngành `IND_*` hoặc cùng khu vực KCN Bắc Ninh, áp dụng cộng điểm tương thích ngành/địa bàn chuẩn hóa (giữ biên điểm `[0, 100]`) và trả về lý do giải trình XAI thật.
- **[ADD] `AC-08-BL-01` .. `AC-08-BL-03`**.

---

### 3. Ma Trận Tác Động Liên Phân Hệ (Cross-Surface & Cross-Epic Impact Matrix)

| Epic | Bề mặt / Thành phần | Đường dẫn tệp xác thực | Thay đổi cần thực hiện |
| :--- | :--- | :--- | :--- |
| **`TASK-02`** | Danh bạ & Hồ sơ DN FE | `SourceCode/frontend/src/components/enterprise/EnterprisesDirectoryView.tsx`<br>`SourceCode/frontend/src/app/doanh-nghiep-dmst/page.tsx`<br>`SourceCode/frontend/src/app/enterprises/page.tsx`<br>`SourceCode/frontend/src/app/enterprises/[taxCode]/page.tsx` | Đổi nhãn sang Hội viên BACLINK, bộ lọc 8 ngành `IND_*` & KCN Bắc Ninh, chứng chỉ ISO/IATF/ESG, Zero-Mock `<Async>`. |
| **`TASK-02`** | Enterprise & Seed BE | `SourceCode/backend/apps/api/V1Compat/EnterpriseController.cs`<br>`SourceCode/backend/modules/identity/Application/ApprovalService.cs`<br>`SourceCode/backend/scripts/seed_baclink_demo_data.sql` | Bỏ `MatchProvinceScope` & `/api/v1/gov/enterprises/*`; duyệt 1 cấp nâng `ENTERPRISE` + `DUAL`; tạo script SQL seed 10 DN Bắc Ninh + dữ liệu liên kết. |
| **`TASK-03`** | Sàn & Portal Nhu cầu FE | `SourceCode/frontend/src/app/nhu-cau-cong-nghe/page.tsx`<br>`SourceCode/frontend/src/app/nhu-cau-cong-nghe/[id]/page.tsx`<br>`SourceCode/frontend/src/app/khao-sat-nhu-cau/page.tsx`<br>`SourceCode/frontend/src/app/khao-sat-doanh-nghiep/page.tsx`<br>`SourceCode/frontend/src/app/portal/buyer/demands/page.tsx` | Đổi sang Bảng Nhu cầu tìm nhà cung ứng & đặt hàng gia công; bộ lọc `IND_*` & KCN; hoạt động với `user.role = 'ENTERPRISE'` + `activeRole = 'BUYER'`. |
| **`TASK-03`** | Demand BE | `SourceCode/backend/apps/api/V1Compat/DemandController.cs`<br>`SourceCode/backend/modules/demand/Application/DemandService.cs` | Khóa `/gov/demands*` khỏi `[AllowAnonymous]`; cho phép `ENTERPRISE` tạo/quản lý nhu cầu theo `OrganizationId`; duyệt 1 cấp bởi `ADMIN`. |
| **`TASK-04`** | Sàn & Portal Sản phẩm FE | `SourceCode/frontend/src/app/chao-ban-cong-nghe/page.tsx`<br>`SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx`<br>`SourceCode/frontend/src/app/portal/seller/technologies/page.tsx`<br>`SourceCode/frontend/src/app/portal/seller/technologies/create/page.tsx` | Đổi sang Sàn Sản phẩm & Năng lực sản xuất; bộ lọc `IND_*` & KCN; hoạt động với `user.role = 'ENTERPRISE'` + `activeRole = 'SELLER'`. |
| **`TASK-04`** | Technology BE | `SourceCode/backend/apps/api/V2/TechnologyOffersController.cs`<br>`SourceCode/backend/modules/technology/Application/TechnologyService.cs` | Bỏ bắt buộc `ManagingAuthorityId` 34 Sở & bỏ `Actor.ScopeId`; duyệt 1 cấp bởi `ADMIN` BACLINK; giữ IDOR isolation theo `OrganizationId`. |
| **`TASK-08`** | Radar, Pipeline & Deal Room FE | `SourceCode/frontend/src/app/portal/matching/radar/page.tsx`<br>`SourceCode/frontend/src/app/portal/opportunities/pipeline/page.tsx`<br>`SourceCode/frontend/src/app/portal/opportunities/[id]/deal-room/page.tsx`<br>`SourceCode/frontend/src/app/portal/seller/connection-requests/page.tsx` | Đổi filter sang `IND_*` & KCN Bắc Ninh; không tách role `BUYER`/`SELLER`, dùng `activeRole` của `ENTERPRISE` Dual-Mode; giữ PDPD masking & `<BlockchainZkpBadge />`. |
| **`TASK-08`** | Brokerage & Matching BE | `SourceCode/backend/modules/brokerage/Application/BrokerageMatchingEngineService.cs`<br>`SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs` | Gỡ phân nhánh cứng `PlatformRoles.Buyer` / `PlatformRoles.Seller` / `ProvincialAdmin`; lọc theo `OrganizationId`/`PersonId` + `activeRole`; khóa `/api/v1/gov/opportunities`. |
