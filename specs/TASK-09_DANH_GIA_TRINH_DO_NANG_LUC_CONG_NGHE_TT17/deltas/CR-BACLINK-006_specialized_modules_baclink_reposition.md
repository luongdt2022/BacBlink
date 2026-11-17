# Change Request: CR-BACLINK-006 Tái Định Vị Các Phân Hệ Chuyên Sâu Sang BACLINK (Ban Cố Vấn Kỹ Thuật, Đánh Giá Năng Lực Nhà Máy & CĐS, Đào Tạo Hội Viên LMS, Chứng Thực Số BACLINK Trust/ZKP)

**CR-ID**: `CR-BACLINK-006`  
**Epic Chủ Đạo**: `TASK-09_DANH_GIA_TRINH_DO_NANG_LUC_CONG_NGHE_TT17`  
**Cross-Epic Impact**: `TASK-05_HO_SO_CHUYEN_GIA_KHCN`, `TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING`, `TASK-11_HA_TANG_BLOCKCHAIN_NDACHAIN_VA_ZKPROOF`  
**Status**: `APPROVED` (Batch `P0-B5` — 2026-11-17)  
**Target Version**: `TASK-05` (`1.22.0`) · `TASK-09` (`1.7.0`) · `TASK-10` (`1.2.0`) · `TASK-11` (`1.1.0`)  
**Author**: Senior Business Analyst (`nacen-ba`) / Phê duyệt: PO (`nacen-po-pm`)  
**Date**: `2026-11-17`  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- [`Specification/BASIC_DESIGN_BACLINK.md`](../../../../Specification/BASIC_DESIGN_BACLINK.md) (Mục 4.1, 6, 9.1, 9.2 — `PO-DEC-BACLINK-01`, `PO-DEC-BACLINK-02`, `PO-DEC-BACLINK-04`, `PO-DEC-BACLINK-05`).
- [`SourceCode/backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md`](../../../backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md) (Mục 2.1, 2.2, 2.4, 2.5, 4).
- [`SourceCode/docs/open-questions.md`](../../../docs/open-questions.md) (**Q1** — Ban Cố vấn Kỹ thuật dùng RBAC 3 cấp không tạo role JWT thứ 4; **Q2** — Ánh xạ trọng số `Tt17ScoringEngine` sang 8 ngành `IND_*`).
- [`SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`](../../SPEC_MANAGEMENT_CONSTITUTION.md).

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is)**:
  1. **`TASK-05` (Chuyên gia KH&CN)**: Danh bạ `/experts` và Workspace `/portal/expert/*` định vị theo "Chuyên gia KH&CN Bộ KH&CN", dùng `PROVINCIAL_ADMIN` / `ScopeTypes.Province` thẩm định 2 cấp Sở KH&CN, và `ExpertController.cs` (dòng 285, 421, 589) đang kiểm tra cứng `Actor.PlatformRole == VERIFIED_EXPERT` / `"EXPERT"`.
  2. **`TASK-09` (Đánh giá TT17)**: Giao diện `/assessments/tt17*`, `/admin/assessments/tt17`, `/admin/assessments/records` và template Word `.docx` (`survey-docx-exporter.ts`, `tt17-docx-template-filler.ts`) mang thương hiệu `NacenTech`/`Bộ KH&CN`; `Tt17ScoringEngine.cs` chỉ nhận mã VSIC `C.10`–`C.32` (chưa ánh xạ 8 mã ngành `IND_*` của BACLINK); `AssessmentsController.cs` (dòng 430, 462) mở `[AllowAnonymous]` cho `/api/v1|v2/gov/assessments/tt17*` và mặc định `NormalizeScopeId` = `"HN"`, `IndustryCode` = `"C.10"`.
  3. **`TASK-10` (Học liệu số & LMS)**: Cổng `/elearning` và `/admin/elearning` định vị theo "Kho học liệu số ĐMST theo QĐ 1993/QĐ-BKHCN", chứng nhận số mang tên `NACENTECH`, và luồng quản lý giảng viên tham chiếu `VERIFIED_EXPERT`.
  4. **`TASK-11` (Blockchain & ZKProof)**: `/admin/blockchain`, `/blockchain/verify` và `<BlockchainZkpBadge />` hiển thị nhãn `NacenTech Node` / `Sở KH&CN` thay vì định danh chứng thực của Hiệp hội BACLINK.

- **Đề xuất mới (To-Be)**:
  1. **`TASK-05` (Ban Cố vấn Kỹ thuật Hiệp hội BACLINK — Quyết định Q1)**: Tái định vị thành **Ban Cố vấn Kỹ thuật Hiệp hội BACLINK** (chuyên gia sản xuất, tự động hóa, Lean/5S, ISO/IATF, ESG). Tuân thủ nghiêm ngặt RBAC **3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`)**, **KHÔNG tạo role thứ 4** trong JWT: tài khoản cố vấn dùng `PUBLIC_USER` hoặc `ENTERPRISE` gắn bản ghi `ExpertProfile (Status = APPROVED)`; quyền truy cập `/portal/expert/*` kiểm tra theo `ExpertProfile` đã duyệt (`person_id == Actor.PersonId`) hoặc `ADMIN`. Thẩm định cố vấn do `ADMIN` duyệt tập trung 1 cấp.
  2. **`TASK-09` (Đánh giá Năng lực Nhà máy & Chuyển đổi số BACLINK — Quyết định Q2)**: Bảo toàn engine tính điểm 26 tiêu chí T-E-O-R-I (`Tt17ScoringEngine`), bổ sung **bảng ánh xạ mặc định từ 8 mã ngành `IND_*` (`IND_ELEC`..`IND_LOG`)** sang bộ trọng số công nghiệp tương ứng kèm fallback bộ trọng số cân bằng chuẩn BACLINK; cập nhật template xuất Word `.docx` và UI sang **Hiệp hội BACLINK**; khóa `[AllowAnonymous]` trên `/api/v1|v2/gov/assessments/tt17*`.
  3. **`TASK-10` (Đào tạo Hội viên BACLINK — LMS)**: Tái định vị sang **LMS Đào tạo Hội viên BACLINK** với các chuyên đề thực chiến sản xuất công nghiệp (*Lean/5S*, *ISO 9001/IATF 16949*, *MES/ERP*, *ESG/Công nghiệp xanh*); đồng bộ quyền giảng viên theo `ExpertProfile (Status = APPROVED)` + `ADMIN`; đổi chứng nhận số sang **Hiệp hội BACLINK**; nạp 6 khóa học mẫu công nghiệp qua `seed_baclink_demo_data.sql` (Zero-Mock).
  4. **`TASK-11` (Chứng thực Hồ sơ & MOU số BACLINK Trust/ZKP)**: Bảo toàn toàn bộ lõi mật mã RFC 8785, SHA-256, AES-256-GCM, ECDSA P-256, Merkle Tree, Outbox Pattern và NDAChain Gateway (`did:nda`); tái định vị toàn bộ UI/Nhãn/Giấy chứng nhận mật mã sang **BACLINK Trust/ZKP** cho 4 sự kiện cốt lõi BACLINK (`TASK-02`, `TASK-04`, `TASK-08`, `TASK-09`).

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn Theo Từng Epic (Standardized Changes)

#### 2.1. `TASK-05` — Ban Cố Vấn Kỹ Thuật Hiệp Hội BACLINK (`PO-DEC-BACLINK-04`, Q1)
- **[ADD] `REQ-05-BL-01` [Tái Định Vị Ban Cố Vấn Kỹ Thuật BACLINK & Bộ Lọc Bắc Ninh]**:
  - Các route `/experts`, `/experts/[expertCode]`, `/portal/expert/*`, `/profile/upgrade/expert` sử dụng danh xưng **Ban Cố vấn Kỹ thuật Hiệp hội BACLINK** (chuyên gia sản xuất, tự động hóa, Lean/5S, ISO/IATF 16949, ESG).
  - Bộ lọc danh bạ công khai `/experts` chuyển từ 18 ngành TT17 & 34 tỉnh sang **8 ngành công nghiệp `IND_*`** và **Địa bàn / KCN Bắc Ninh** (nạp từ Master Data API, Zero-Mock).
- **[ADD] `REQ-05-BL-02` [Thẩm Định Cố Vấn 1 Cấp Bởi `ADMIN` & Tích Hợp Seed Demo]**:
  - `ADMIN` Hiệp hội phê duyệt/từ chối/thu hồi hồ sơ Ban Cố vấn Kỹ thuật tập trung 1 cấp tại `/admin/approvals`; loại bỏ bước duyệt Sở KH&CN / `PROVINCIAL_ADMIN` trong `ExpertController.cs` và `ExpertApprovalSynchronizer.cs`.
  - Nạp 5 hồ sơ cố vấn kỹ thuật công nghiệp mẫu vào `brokerage.expert_profiles` thông qua `seed_baclink_demo_data.sql` (Zero-Mock).
- **[ADD] `BR-05-BL-01` [Bảo Toàn RBAC 3 Cấp — Không Tạo Role JWT Thứ 4 (Q1)]**:
  - Tuân thủ `open-questions.md` Q1: tuyệt đối KHÔNG thêm role thứ 4 (`EXPERT` / `VERIFIED_EXPERT`) vào `PlatformRoles` mới hay JWT claim.
  - Cố vấn kỹ thuật mang `PlatformRole` là `PUBLIC_USER` hoặc `ENTERPRISE` gắn bản ghi `brokerage.expert_profiles (Status = APPROVED)`.
  - Các endpoint `/api/v1/portal/expert/*` (`ExpertController.cs`) và route UI `/portal/expert/*` MUST cho phép truy cập khi `Actor.PlatformRole == ADMIN` HOẶC người dùng có `ExpertProfile` đã duyệt (`person_id == Actor.PersonId && status == APPROVED`), thay cho kiểm tra cứng `VERIFIED_EXPERT`.
- **[ADD] `BR-05-BL-02` [Bảo Vệ PII & Chống IDOR Hai Chiều Tư Vấn]**:
  - Giữ nguyên cơ chế chống IDOR (`requester_person_id == Actor.PersonId`, `expertProfile.person_id == Actor.PersonId`) và che chắn PII liên hệ theo NĐ 13/2023/NĐ-CP.
- **[ADD] `AC-05-BL-01` .. `AC-05-BL-03`**.

#### 2.2. `TASK-09` — Đánh Giá Năng Lực Nhà Máy & Chuyển Đổi Số BACLINK (`PO-DEC-BACLINK-04`, Q2)
- **[ADD] `REQ-09-BL-01` [Tái Định Vị Đánh Giá Năng Lực Nhà Máy & Chuyển Đổi Số BACLINK]**:
  - Các màn hình `/assessments/tt17`, `/assessments/tt17/wizard`, `/assessments/tt17/[id]`, `/admin/assessments/tt17`, `/admin/assessments/records` hiển thị tiêu đề và ngữ cảnh **Đánh giá Năng lực Nhà máy & Chuyển đổi số BACLINK**, bảo toàn đủ 26 tiêu chí T-E-O-R-I, Radar Chart, tính hệ số đồng bộ $T_{ĐB}$ và Yearly Snapshot.
- **[ADD] `REQ-09-BL-02` [Cập Nhật Template Xuất Word `.docx` Sang Thương Hiệu BACLINK]**:
  - Cập nhật tiêu đề, cơ quan chủ quản, chân trang và biểu mẫu xuất Word `.docx` trong `survey-docx-exporter.ts`, `tt17-docx-template-filler.ts` và các mẫu thực địa tại `/admin/assessments/records` sang **Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)** chuẩn A4 OpenXML Unicode, kích thước $\ge 15\text{ KB}$, không corrupt XML.
- **[ADD] `BR-09-BL-01` [Bảng Ánh Xạ Trọng Số Từ 8 Ngành `IND_*` Trong `Tt17ScoringEngine` (Q2)]**:
  - Tuân thủ `open-questions.md` Q2: giữ nguyên engine tính điểm `Tt17ScoringEngine` (`Benchmarks` `C.10`–`C.32`) và bổ sung bảng ánh xạ mặc định từ 8 mã ngành `IND_*` của BACLINK sang bộ trọng số công nghiệp tương ứng:

| Mã Ngành BACLINK | Tên Ngành Công Nghiệp BACLINK | Mã Ngành Ánh Xạ Mặc Định (`Tt17ScoringEngine`) | Nhóm Chỉ Số Tham Chiếu (`KChuan1..4`) |
| :--- | :--- | :---: | :--- |
| `IND_ELEC` | Điện tử, Bán dẫn & Thiết bị điện | `C.26` | Sản phẩm điện tử, máy vi tính và quang học |
| `IND_MECH` | Cơ khí chính xác, Khuôn mẫu & Chế tạo máy | `C.25` | Sản xuất sản phẩm từ kim loại đúc sẵn |
| `IND_AUTO` | Tự động hóa, Robot & Smart Factory | `C.28` | Sản xuất máy móc, thiết bị chuyên dụng |
| `IND_PLAS` | Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp | `C.22` | Sản xuất sản phẩm từ cao su và plastic |
| `IND_MAT` | Vật liệu mới & Công nghiệp hỗ trợ | `C.24` | Sản xuất kim loại & vật liệu nền |
| `IND_IT` | CNTT, Phần mềm công nghiệp & MES/ERP | `C.26` | Công nghệ cao & thiết bị điện tử/điều khiển |
| `IND_GREEN` | Công nghiệp xanh, Năng lượng sạch & ESG | `C.32` | Công nghiệp chế biến, chế tạo khác |
| `IND_LOG` | Logistics công nghiệp, Kho vận & Chuỗi cung ứng | `C.29` | Sản xuất phương tiện & hạ tầng vận tải |
| *(Fallback)* | Mã ngành ngoài bảng hoặc chưa xác định | `C.28` / Bộ cân bằng BACLINK | Bộ trọng số cân bằng chuẩn BACLINK (`KChuan1=250, KChuan2=0.07, KChuan3=0.55, KChuan4=150`) |

- **[ADD] `BR-09-BL-02` [Khóa `/gov/assessments/tt17*` Anonymous & Duyệt 1 Cấp `ADMIN`]**:
  - Gỡ `[AllowAnonymous]` khỏi `GET /api/v1|v2/gov/assessments/tt17` và `/dashboard` trong `AssessmentsController.cs` (trả `401/403/410`); chuyển quy trình nghiệm thu đánh giá về 1 cấp `ADMIN` BACLINK; `NormalizeScopeId` không còn mặc định `"HN"` mà chuẩn hóa theo `"GLOBAL"` / địa bàn Bắc Ninh.
- **[ADD] `AC-09-BL-01` .. `AC-09-BL-03`**.

#### 2.3. `TASK-10` — Đào Tạo Hội Viên BACLINK (LMS) (`PO-DEC-BACLINK-04`, Q1)
- **[ADD] `REQ-10-BL-01` [Cổng Đào Tạo Hội Viên BACLINK — Chuyên Đề Công Nghiệp]**:
  - Các route `/elearning`, `/elearning/[id]`, `/portal/expert/elearning`, `/admin/elearning` tái định vị sang **Đào tạo Hội viên BACLINK (LMS)** với 4 nhóm chuyên đề công nghiệp trọng tâm: **Lean Manufacturing & 5S**, **ISO 9001 & IATF 16949**, **Hệ thống quản trị sản xuất MES/ERP**, **Chuyển đổi xanh & ESG**.
  - Nạp 6 khóa học mẫu công nghiệp qua `seed_baclink_demo_data.sql` (Zero-Mock), giữ nguyên không gian tương tác 8 thành phần, HTTP 206 streaming, In-Video Quiz và AI RAG indexing.
- **[ADD] `REQ-10-BL-02` [Chứng Nhận Số Trực Tuyến Hiệp Hội BACLINK]**:
  - Cập nhật mẫu Chứng nhận số hoàn thành khóa học/lộ trình từ `NACENTECH` sang **Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)**; thay nhãn `QĐ 1993/QĐ-BKHCN` trên UI đại chúng bằng khung chương trình đào tạo Hội viên BACLINK.
- **[ADD] `BR-10-BL-01` [Phân Quyền Giảng Viên LMS Không Tách Role Thứ 4]**:
  - Quyền tạo/sửa/quản lý bài giảng tại `/portal/expert/elearning` và `LmsController.cs` cấp cho `ADMIN` hoặc tài khoản `PUBLIC_USER`/`ENTERPRISE` sở hữu `ExpertProfile (Status = APPROVED)` và đúng chủ sở hữu (`created_by == Actor.PersonId`), đồng bộ Q1.
- **[ADD] `BR-10-BL-02` [Zero-Mock Dữ Liệu Học Liệu & Giảng Viên]**:
  - Toàn bộ danh sách khóa học và giảng viên cố vấn trên `/elearning` truy vấn trực tiếp PostgreSQL thật (`lms.*`, `brokerage.expert_profiles`) qua `<Async>` đủ 5 UX States.
- **[ADD] `AC-10-BL-01` .. `AC-10-BL-03`**.

#### 2.4. `TASK-11` — Chứng Thực Hồ Sơ Năng Lực & MOU Số BACLINK Trust/ZKP (`PO-DEC-BACLINK-04`)
- **[ADD] `REQ-11-BL-01` [Tái Định Vị Hạ Tầng Chứng Thực BACLINK Trust/ZKP]**:
  - Các route `/admin/blockchain`, `/blockchain/verify` và component `<BlockchainZkpBadge />` mang nhận diện **BACLINK Trust/ZKP — Chứng thực Hồ sơ Năng lực & MOU số**, hiển thị trực quan trên 4 thực thể BACLINK: Sản phẩm & Năng lực (`TASK-04`), Thỏa thuận MOU Deal Room (`TASK-08`), Báo cáo Đánh giá Năng lực Nhà máy (`TASK-09`), Hồ sơ DN Hội viên (`TASK-02`).
- **[ADD] `BR-11-BL-01` [Bảo Toàn Lõi Mật Mã & Đổi Nhãn Node Xác Thực BACLINK]**:
  - Giữ nguyên 100% lõi mật mã học RFC 8785 (JCS), SHA-256, ZKP Commitment + Salt AES-256-GCM, Merkle Tree, ECDSA P-256, Outbox ($\le 15\text{ms}$), NDAChain Gateway (`did:nda`) và PDPD NĐ 13/2023 (`NFR-BC-003`).
  - Thay chuỗi hiển thị `NacenTech Node` / `Sở KH&CN` trên UI `/blockchain/verify`, `/admin/blockchain`, `<BlockchainZkpBadge />` và PDF Giấy chứng nhận mật mã bằng **BACLINK Trust Node — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh**.
- **[ADD] `AC-11-BL-01` .. `AC-11-BL-03`**.

---

### 3. Ma Trận Tác Động Liên Phân Hệ (Cross-Surface & Cross-Epic Impact Matrix)

| Epic | Bề mặt / Thành phần | Đường dẫn tệp xác thực | Thay đổi cần thực hiện |
| :--- | :--- | :--- | :--- |
| **`TASK-05`** | Ban Cố vấn FE | `SourceCode/frontend/src/app/experts/page.tsx`<br>`SourceCode/frontend/src/app/experts/[expertCode]/page.tsx`<br>`SourceCode/frontend/src/app/portal/expert/**`<br>`SourceCode/frontend/src/app/profile/upgrade/expert/page.tsx` | Đổi nhãn sang Ban Cố vấn Kỹ thuật BACLINK; lọc `IND_*` & KCN Bắc Ninh; mở `/portal/expert/*` cho `PUBLIC_USER`/`ENTERPRISE` có `ExpertProfile (APPROVED)` hoặc `ADMIN`. |
| **`TASK-05`** | Ban Cố vấn BE | `SourceCode/backend/apps/api/V1Compat/ExpertController.cs`<br>`SourceCode/backend/modules/brokerage/Application/ExpertService.cs`<br>`SourceCode/backend/modules/brokerage/Application/ExpertApprovalSynchronizer.cs` | Thay kiểm tra cứng `VERIFIED_EXPERT` bằng `ExpertProfile (APPROVED)` hoặc `ADMIN` (Q1); bỏ `ProvincialAdmin` / `ScopeTypes.Province`; duyệt 1 cấp bởi `ADMIN`. |
| **`TASK-09`** | Đánh giá Năng lực BE | `SourceCode/backend/modules/assessment/NacenTech.Modules.Assessment/Application/Tt17ScoringEngine.cs`<br>`SourceCode/backend/apps/api/V2/AssessmentsController.cs` | Thêm bảng ánh xạ 8 mã `IND_*` $\rightarrow$ trọng số công nghiệp + fallback BACLINK (Q2); gỡ `[AllowAnonymous]` khỏi `/gov/assessments/tt17*`; bỏ mặc định `"HN"`. |
| **`TASK-09`** | Đánh giá Năng lực FE & DOCX | `SourceCode/frontend/src/app/(portal)/assessments/tt17/**`<br>`SourceCode/frontend/src/app/admin/assessments/tt17/page.tsx`<br>`SourceCode/frontend/src/services/survey-docx-exporter.ts`<br>`SourceCode/frontend/src/services/tt17-docx-template-filler.ts` | Đổi UI sang Đánh giá Năng lực Nhà máy & CĐS BACLINK; cập nhật template Word `.docx` sang pháp nhân Hiệp hội BACLINK chuẩn A4 OpenXML. |
| **`TASK-10`** | LMS Đào tạo Hội viên FE & BE | `SourceCode/frontend/src/app/elearning/**`<br>`SourceCode/frontend/src/app/portal/expert/elearning/page.tsx`<br>`SourceCode/frontend/src/app/admin/elearning/page.tsx`<br>`SourceCode/backend/modules/lms/Api/LmsController.cs`<br>`SourceCode/backend/modules/lms/Domain/LmsConstants.cs` | Đổi nhãn sang Đào tạo Hội viên BACLINK (Lean/5S, ISO/IATF, MES, ESG); chứng nhận số BACLINK; kiểm tra quyền giảng viên theo `ExpertProfile (APPROVED)` + `ADMIN`; seed 6 khóa học mẫu. |
| **`TASK-11`** | BACLINK Trust/ZKP FE & BE | `SourceCode/frontend/src/app/admin/blockchain/page.tsx`<br>`SourceCode/frontend/src/components/blockchain/BlockchainZkpBadge.tsx`<br>`SourceCode/backend/modules/blockchain/Api/BlockchainAdminController.cs`<br>`SourceCode/backend/modules/blockchain/Domain/Invariants/BlockchainBusinessRules.cs` | Bảo toàn lõi mật mã RFC 8785/ZKP/Merkle/NDAChain; đổi toàn bộ nhãn UI, `<BlockchainZkpBadge />` và chứng nhận sang **BACLINK Trust/ZKP**; kiểm chứng 4 tầng (`blockchain/page.test.tsx`, backend tests). |
| **Seed DB** | Dữ liệu Demo Zero-Mock | `SourceCode/backend/scripts/seed_baclink_demo_data.sql` | Seed idempotent 5 cố vấn kỹ thuật (`TASK-05`), 6 khóa học LMS công nghiệp (`TASK-10`) và liên kết chứng thực (`TASK-11`). |
