# Change Request: CR-BACLINK-004 Chuyển Đổi Nội Dung Cổng Công Khai BACLINK (Trang Chủ, Giới Thiệu QĐ 1652, Sự Kiện Giao Thương, Dịch Vụ & Hướng Dẫn 3 Cấp)

**CR-ID**: CR-BACLINK-004  
**Epic**: TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME  
**Status**: APPROVED  
**Target Version**: 1.4.0  
**Author**: Senior Business Analyst (`nacen-ba`)  
**Date**: 2026-11-17  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- [`Specification/BASIC_DESIGN_BACLINK.md`](../../../../Specification/BASIC_DESIGN_BACLINK.md) (Mục 1, 3, 6, 9.2 — `PO-DEC-BACLINK-01`, `PO-DEC-BACLINK-02`, `PO-DEC-BACLINK-05`).
- [`SourceCode/backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md`](../../../backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md) (Mục 2.3, 2.5).
- [`SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`](../../SPEC_MANAGEMENT_CONSTITUTION.md).

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

- **Hiện trạng cũ (Current State / As-Is)**:
  1. Trang chủ (`/`), Giới thiệu (`/gioi-thieu`), Ma trận (`/matrix`), Sự kiện (`/trien-lam`), Dịch vụ (`/dich-vu-khac`) và Hướng dẫn (`/huong-dan`) đang mang nhận diện `NacenTech` / `NacenTwin`, quy chiếu Thông tư 17/2019/TT-BKHCN, 10–18 mã lĩnh vực `LV*`, 34 tỉnh/Sở KH&CN và 15 triển lãm KH&CN cũ.
  2. Tài liệu hướng dẫn (`/huong-dan`, `guide-data.ts`) vẫn mô tả quy trình đa cấp `/gov/*`, phân quyền 10 roles và thẩm định 2 cấp Sở KH&CN – Trung ương.
  3. Dữ liệu sự kiện và chỉ số trang chủ cần đồng bộ nguồn dữ liệu thật cho hệ sinh thái công nghiệp tỉnh Bắc Ninh theo nguyên tắc **Zero-Mock** (`seed_baclink_demo_data.sql`).
- **Đề xuất mới (Proposed State / To-Be)**:
  1. Chuyển đổi toàn diện Cổng công khai `TASK-01` sang **Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)** thành lập theo **Quyết định số 1652/QĐ-UBND ngày 16/06/2025**, trụ sở **Số 7, đường Lý Thái Tổ, phường Suối Hoa, TP. Bắc Ninh**, Đại hội lần thứ I (2025–2028), Ban Chấp hành 28 thành viên, phương châm **"Liên kết - Hợp tác - Đổi mới - Hội nhập"**, thương hiệu **"Công nghiệp xanh - Tử tế - Bắc Ninh"**.
  2. Trang chủ BACLINK (`/`) giữ cơ chế **Zero-Mock**: 4 KPI động từ PostgreSQL (`GET /api/v1/portal/stats`), quy trình 4 bước, khối KCN trọng điểm Bắc Ninh & Hội viên tiêu biểu, sector chips nạp động 8 ngành công nghiệp `IND_*`.
  3. Trang Sự kiện (`/trien-lam`, `/trien-lam/dang-ky-tham-quan`) chuyển sang **Xúc tiến Giao thương FDI–Nội địa & Hội chợ Công nghiệp Bắc Ninh** với 3 sự kiện thực tế nạp từ PostgreSQL qua `seed_baclink_demo_data.sql`.
  4. Trang Dịch vụ (`/dich-vu-khac`) tái định vị thành **Dịch vụ Hỗ trợ Hội viên BACLINK** (tư vấn kết nối FDI, chuẩn hóa ISO/IATF/Lean/ESG, Radar AI ghép nối, Đánh giá Năng lực Nhà máy & CĐS) và giữ tinh gọn Card 03 (`REQ-01-SRV-01`).
  5. Trang Hướng dẫn (`/huong-dan`) cấu trúc lại hoàn toàn theo đúng **3 cấp phân quyền (`ADMIN` – `ENTERPRISE` Dual-Mode – `PUBLIC_USER`)**, gỡ bỏ 100% đường dẫn và hướng dẫn `/gov/*`.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Changes)

- **[ADD] `REQ-01-BL-01` [Trang Chủ BACLINK Zero-Mock & 8 Chip Ngành `IND_*`]**:
  - Hero banner: *"Kết Nối Chuỗi Cung Ứng & Nâng Tầm Công Nghiệp Bắc Ninh"*.
  - 4 thẻ KPI đọc động từ `GET /api/v1/portal/stats` bọc qua `<Async>` đủ 5 UX States (không fallback số giả): (1) Doanh nghiệp Hội viên BACLINK, (2) Sản phẩm & Năng lực sản xuất, (3) Nhu cầu tìm nhà cung ứng, (4) Giao dịch & MOU thành công.
  - Quy trình 4 bước BACLINK: (1) Đăng ký Hội viên $\rightarrow$ (2) Chuẩn hóa Hồ sơ & Năng lực $\rightarrow$ (3) Ghép nối AI Nội địa–FDI $\rightarrow$ (4) Ký kết MOU & Chứng thực số.
  - Khối Đối tác & KCN Bắc Ninh (Yên Phong I/II, Quế Võ I/II/III, VSIP Bắc Ninh, Tiên Sơn, Đại Đồng – Hoàn Sơn, Hanaka, Thuận Thành, Gia Bình) + Hội viên tiêu biểu + 8 sector chips nạp động từ danh mục ngành `IND_*`.
- **[ADD] `REQ-01-BL-02` [Trang Giới Thiệu Pháp Nhân QĐ 1652 & Ma Trận Ngành/KCN]**:
  - `/gioi-thieu` hiển thị đầy đủ thông tin pháp lý **Quyết định số 1652/QĐ-UBND ngày 16/06/2025**, trụ sở Số 7 Lý Thái Tổ, P. Suối Hoa, TP. Bắc Ninh, Đại hội lần I (2025–2028), BCH 28 thành viên, phương châm, định vị thương hiệu, Điều lệ & Quyền lợi Hội viên BACLINK.
  - `/matrix` hiển thị Ma trận **8 Ngành công nghiệp `IND_*` × Địa bàn/KCN Bắc Ninh** thay cho ma trận 18 ngành TT17 & 59 cặp LV-CN cũ.
- **[ADD] `REQ-01-BL-03` [Sự Kiện Xúc Tiến Giao Thương FDI–Nội Địa Bắc Ninh]**:
  - `/trien-lam` và `/trien-lam/dang-ky-tham-quan` đổi thành **Sự kiện Xúc tiến Giao thương & Hội chợ Công nghiệp BACLINK**, nạp dữ liệu thật từ PostgreSQL (`seed_baclink_demo_data.sql` với 3 sự kiện: *Diễn đàn Quản trị bền vững*, *Ngày hội Kết nối Chuỗi cung ứng FDI–Nội địa Bắc Ninh 2026*, *Hội thảo Chuyển đổi xanh & ESG*).
  - Giữ cơ chế đăng ký tham quan, đặt gian hàng & lịch hẹn B2B qua `POST /api/v1/events/register` (hoặc `/api/v1/trien-lam/dang-ky`).
- **[ADD] `REQ-01-BL-04` [Dịch Vụ Hỗ Trợ Hội Viên & Hướng Dẫn Thao Tác 3 Cấp]**:
  - `/dich-vu-khac` hiển thị các dịch vụ hỗ trợ Hội viên BACLINK (Tư vấn kết nối FDI, Chuẩn hóa ISO/IATF/Lean/ESG, Radar AI ghép nối đơn hàng, Đánh giá Năng lực Nhà máy & CĐS), giữ nguyên cấu trúc tinh gọn của Card 03 theo `REQ-01-SRV-01` (chỉ 1 CTA chính trỏ `/khao-sat-dmst`).
  - `/huong-dan` (`guide-data.ts`) chỉ trình bày hướng dẫn cho **3 cấp**: `ADMIN` (Ban Quản trị Hiệp hội duyệt 1 cấp tại `/admin/*`), `ENTERPRISE` (Hội viên Dual-Mode chuyển đổi `RoleSwitcher` Bên Mua ↔ Bên Bán tại `/portal/*`), `PUBLIC_USER` (Khách/Đối tác tra cứu công khai & nộp hồ sơ gia nhập tại `/profile/upgrade`). Gỡ bỏ 100% mục hướng dẫn `/gov/*` và 34 Sở KH&CN.
- **[ADD] `BR-01-BL-01` [Quy Tắc Zero Brand Leakage & Zero-Mock Trên Cổng Công Khai]**:
  - Tuyệt đối không còn chuỗi hiển thị `NacenTech`, `NacenTwin`, `Bộ KH&CN`, `34 Sở KH&CN`, `34 tỉnh` trên các route thuộc `TASK-01`.
  - Mọi KPI trang chủ và danh sách sự kiện MUST đọc từ PostgreSQL thật qua API và bọc `<Async>`; khi API lỗi chỉ hiển thị Error State kèm nút Thử lại.
- **[MODIFY] `BR-01-BL-02` [Cập Nhật Nhãn Bảo Chứng Công Khai `BR-BADGE-DISPLAY-01` Cho BACLINK]**:
  - Điều chỉnh chuỗi cơ quan bảo chứng mặc định trên giao diện công khai từ `'Sở KH&CN'` sang `'Hiệp hội BACLINK'` (`✓ TRL {X}/9 · Đã chứng thực` / `✓ Đã chứng thực bởi Hiệp hội BACLINK`), đồng thời giữ tương thích ngược nếu `VerifiedAuthorityName` có giá trị cụ thể từ DB.
- **[ADD] `AC-01-009` .. `AC-01-012`**: Tiêu chuẩn chấp thuận kiểm thử Trang chủ, Giới thiệu QĐ 1652, Sự kiện PostgreSQL seed, Dịch vụ & Hướng dẫn 3 cấp.

---

### 3. Ma Trận Tác Động (Cross-Surface & Cross-Epic Impact Matrix)

| Bề mặt / Thành phần | Đường dẫn tệp xác thực | Hiện trạng | Thay đổi cần thực hiện |
| :--- | :--- | :--- | :--- |
| **Trang chủ Public** | `SourceCode/frontend/src/app/page.tsx` | Hero, 4 bước, sector `LV*` và copy NacenTwin | Cập nhật copy BACLINK, 4 KPI động từ `/api/v1/portal/stats` qua `<Async>`, KCN Bắc Ninh & 8 chips `IND_*`. |
| **Giới thiệu & Ma trận** | `SourceCode/frontend/src/app/gioi-thieu/page.tsx`<br>`SourceCode/frontend/src/app/matrix/page.tsx` | Nội dung NacenTwin & ma trận TT17 cũ | Chuyển nội dung QĐ 1652/QĐ-UBND, BCH 28 thành viên, ma trận 8 ngành `IND_*` & KCN Bắc Ninh. |
| **Sự kiện Giao thương** | `SourceCode/frontend/src/app/trien-lam/page.tsx`<br>`SourceCode/frontend/src/app/trien-lam/dang-ky-tham-quan/page.tsx` | Triển lãm KH&CN Techmart cũ | Đổi sang Xúc tiến giao thương FDI–Nội địa BACLINK, hiển thị 3 sự kiện seed từ PostgreSQL. |
| **Dịch vụ & Hướng dẫn** | `SourceCode/frontend/src/app/dich-vu-khac/page.tsx`<br>`SourceCode/frontend/src/app/huong-dan/page.tsx`<br>`SourceCode/frontend/src/app/huong-dan/guide-data.ts` | Hướng dẫn có `/gov/*`, 10 roles, 34 Sở KH&CN | Đổi sang Dịch vụ Hội viên BACLINK & Hướng dẫn 3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`), xóa `/gov/*`. |
| **Backend Portal & Events** | `SourceCode/backend/apps/api/V1Compat/PortalControllers.cs`<br>`SourceCode/backend/modules/content/Application/TechmartEventService.cs`<br>`SourceCode/backend/modules/content/Application/AiAssistantService.cs` | Trả stats, events Techmart & AI prompt cũ | Đảm bảo đếm KPI thật theo dữ liệu BACLINK, trả danh sách sự kiện BACLINK từ DB và cập nhật context prompt trợ lý AI sang BACLINK. |
| **Database Seed** | `SourceCode/backend/scripts/seed_baclink_demo_data.sql` | Chưa có seed BACLINK | Bổ sung 3 sự kiện giao thương BACLINK idempotent vào bảng sự kiện của module `content`. |
| **Cross-Epic Impact** | `TASK-00` (`CR-BACLINK-001`), `TASK-06` (`CR-BACLINK-003`), `TASK-02/03/04/08` (`CR-BACLINK-005`) | Phụ thuộc taxonomy `IND_*`, KCN & navbar 3 cấp | Đồng bộ chip ngành `IND_*` từ `TASK-06`, role 3 cấp từ `TASK-00` và KPI thật từ `TASK-02/03/04/08`. |
