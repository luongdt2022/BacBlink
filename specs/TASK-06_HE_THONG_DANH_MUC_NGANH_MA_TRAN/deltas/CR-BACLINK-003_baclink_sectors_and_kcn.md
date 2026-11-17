# Change Request: CR-BACLINK-003 Chuyển Đổi Sang 8 Ngành Công Nghiệp BACLINK (`IND_*`), Địa Bàn & KCN Bắc Ninh Và Tách Endpoint Locations

**CR-ID**: `CR-BACLINK-003`  
**Epic**: `TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`  
**Status**: `APPROVED` (Batch `P0-B3` — 2026-11-17)  
**Target Version**: `1.13.0`  
**Author**: Senior BA (`nacen-ba`) / Phê duyệt: PO (`nacen-po-pm`)  
**Date**: `2026-11-17`  
**Căn cứ pháp lý & Kiến trúc**:
- `Specification/BASIC_DESIGN_BACLINK.md` (Mục 1.3, 4.1, 6, 9.2: `PO-DEC-BACLINK-01`).
- `SourceCode/backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md` (Mục 2.4, 2.5, 4).
- `SourceCode/docs/open-questions.md` (Q2 — Mapping trọng số Đánh giá Năng lực từ 8 ngành `IND_*`).
- `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.

---

### 1. Bối Cảnh & Lý Do Thay Đổi (As-Is vs To-Be)

- **Hiện trạng cũ (As-Is)**:
  1. Bảng `policy.taxonomy_terms` đang active 10 ngành TT17 mã `LV01..LV17`; `MasterDataControllers.cs` (dòng 212 và 318) chặn cứng `!normalizedCode.StartsWith("LV")` ở cả `POST /api/v1/master-data/sectors` và `POST /api/v1/master-data/matrix`.
  2. `SourceCode/frontend/src/lib/constants/provinces.ts` đang định nghĩa danh mục toàn quốc `PROVINCES_34` (34 Tỉnh/Thành phố kèm tên `Sở KH&CN ...`).
  3. `SourceCode/frontend/src/lib/master-data-client.ts` (dòng 52) gọi ké endpoint `GET /api/v1/governance/org-units/public-provinces` nằm trong `GovernanceControllers.cs` (đối tượng đang thuộc diện vô hiệu hóa theo `CR-BACLINK-002`).

- **Đề xuất mới (To-Be)**:
  1. **Deactivate phi phá hủy ngành cũ `LV*`**: Giữ nguyên bản ghi `LV*` trong `policy.taxonomy_terms` với `is_active = false` để bảo toàn khóa ngoại và giải mã lịch sử qua `ITaxonomyNameResolver` (không `DELETE`).
  2. **Mở chuẩn 8 Ngành Công nghiệp BACLINK (`IND_*`)**: Nạp và kích hoạt 8 ngành chuẩn BACLINK (`IND_ELEC`, `IND_MECH`, `IND_AUTO`, `IND_PLAS`, `IND_MAT`, `IND_IT`, `IND_GREEN`, `IND_LOG`), đồng thời mở validation tại `MasterDataControllers.cs` cho phép mã `IND_*`.
  3. **Ánh xạ Đánh giá Năng lực (`Tt17ScoringEngine`)**: Bổ sung bảng mapping mặc định từ 8 mã ngành `IND_*` sang bộ trọng số công nghiệp tương ứng (fallback bộ trọng số cân bằng chuẩn BACLINK) để `TASK-09` tính điểm 26 tiêu chí không bị lỗi khi chọn ngành `IND_*` (`open-questions.md` Q2).
  4. **Thay `PROVINCES_34` bằng Địa bàn & KCN Bắc Ninh**: Chuẩn hóa danh mục **8 Địa bàn Bắc Ninh + 1 nhóm đối tác ngoài tỉnh** (`TP_BN`, `TU_SON`, `QUE_VO`, `THUAN_THANH`, `YEN_PHONG`, `TIEN_DU`, `GIA_BINH`, `LUONG_TAI`, `NGOAI_TINH`) và danh mục **KCN trọng điểm Bắc Ninh** (Yên Phong I/II, Quế Võ I/II/III, VSIP Bắc Ninh, Tiên Sơn, Đại Đồng - Hoàn Sơn, Hanaka, Thuận Thành, Gia Bình).
  5. **Tách Public Locations Endpoint khỏi `GovernanceControllers`**: Tạo endpoint công khai chuẩn `GET /api/v1/master-data/locations` tại `MasterDataControllers.cs` trả về Địa bàn & KCN Bắc Ninh từ CSDL/Master Data; cập nhật `master-data-client.ts` tiêu thụ endpoint mới trước khi khóa `/api/v1/governance/org-units/*`.

---

### 2. Ma Trận Tác Động Đa Bề Mặt & Liên Epic (Cross-Surface & Cross-Epic Impact Matrix)

| Bề mặt / Thành phần | Tệp Nguồn Chính | Hiện Trạng (As-Is) | Thay Đổi Cần Làm (To-Be) |
| :--- | :--- | :--- | :--- |
| **DB Taxonomy & Migration** | `policy.taxonomy_terms`, `backend/scripts/seed_baclink_demo_data.sql` | Active `LV01..LV17`; chưa có `IND_*` và `LOCATION`/`INDUSTRIAL_PARK` Bắc Ninh | `UPDATE ... SET is_active = false WHERE kind = 'SECTOR' AND code LIKE 'LV%'`; seed/upsert 8 mã `IND_ELEC`..`IND_LOG` + Địa bàn & KCN Bắc Ninh (`is_active = true`). |
| **Backend MasterData API** | `apps/api/V1Compat/MasterDataControllers.cs`, `apps/api/V1Compat/TaxonomyControllers.cs`, `modules/policy/*` | Chặn cứng `StartsWith("LV")` ở `POST sectors` và `POST matrix`; chưa có `/master-data/locations` | Cho phép mã ngành `IND_*` (giữ tương thích đọc `LV*` lịch sử nếu `activeOnly=false`); thêm `GET /api/v1/master-data/locations` (`[AllowAnonymous]`) trả Địa bàn & KCN Bắc Ninh. |
| **Backend Governance Decoupling** | `apps/api/V1Compat/GovernanceControllers.cs` | Đang chứa `GET public-provinces` và `KeyProvinces34` | Tách logic tra cứu địa bàn công khai sang `MasterDataControllers`; vô hiệu hóa `public-provinces` / `org-units` theo lộ trình `CR-BACLINK-002`. |
| **Backend Assessment Mapping** | `modules/assessment/*`, `apps/api/V2/AssessmentsController.cs` | Mặc định `IndustryCode = "C.10"` / map theo `LV*` | Bổ sung mapping mặc định từ `IND_ELEC`..`IND_LOG` sang bộ trọng số tính điểm (`open-questions.md` Q2). |
| **Frontend Constants & Client** | `src/lib/constants/provinces.ts`, `src/lib/master-data-client.ts`, `src/components/common/searchable-province-combobox.tsx` | Export `PROVINCES_34` (34 tỉnh + Sở KH&CN); gọi `/api/v1/governance/org-units/public-provinces` | Thay `PROVINCES_34` bằng **Địa bàn & KCN Bắc Ninh** (cung cấp alias/adapter tương thích nếu cần để tránh gãy import trước khi cập nhật tiêu thụ); `master-data-client.ts` gọi `/api/v1/master-data/locations`. |
| **Frontend Admin Sectors UI** | `src/app/admin/sectors/page.tsx`, `src/app/matrix/page.tsx` | Quản lý 10 ngành `LV*` và ma trận TT17 cũ | Quản lý **8 Ngành Công nghiệp BACLINK (`IND_*`)**, Địa bàn/KCN Bắc Ninh và ma trận năng lực liên kết; gọi `invalidateSectorsCache()` khi CRUD. |
| **Consuming Epics** | `TASK-01`, `TASK-02`, `TASK-03`, `TASK-04`, `TASK-08`, `TASK-09` | Filter theo `PROVINCES_34` và `LV01..LV17` | Chuyển toàn bộ bộ lọc sang `GET /api/v1/sectors` (`IND_*`) và `GET /api/v1/master-data/locations` (Địa bàn/KCN Bắc Ninh). |

---

### 3. Chi Tiết Thay Đổi Quy Chuẩn (Immutable Anchors)

- **[ADD] `REQ-BACLINK-TAX-001` (8 Ngành Công Nghiệp BACLINK `IND_*` & Deactivate `LV*`)**:
  - Deactivate phi phá hủy các bản ghi ngành cũ: `UPDATE policy.taxonomy_terms SET is_active = false WHERE kind = 'SECTOR' AND code LIKE 'LV%'`.
  - Kích hoạt 8 ngành công nghiệp chuẩn BACLINK:
    1. `IND_ELEC` — Điện tử, Bán dẫn & Thiết bị điện
    2. `IND_MECH` — Cơ khí chính xác, Khuôn mẫu & Chế tạo máy
    3. `IND_AUTO` — Tự động hóa, Robot & Smart Factory
    4. `IND_PLAS` — Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp
    5. `IND_MAT` — Vật liệu mới & Công nghiệp hỗ trợ
    6. `IND_IT` — Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP
    7. `IND_GREEN` — Công nghiệp xanh, Năng lượng sạch & ESG
    8. `IND_LOG` — Logistics công nghiệp, Kho vận & Chuỗi cung ứng
  - `MasterDataControllers.cs` (`POST /api/v1/master-data/sectors` và `POST /api/v1/master-data/matrix`) MUST bỏ ràng buộc cứng `StartsWith("LV")` và chấp nhận mã chuẩn `IND_*` (`^IND_[A-Z0-9_]+$`).
- **[ADD] `REQ-BACLINK-TAX-002` (Danh Mục 8+1 Địa Bàn & KCN Trọng Điểm Bắc Ninh)**:
  - Thay thế bộ `PROVINCES_34` bằng danh mục **Địa bàn & KCN tỉnh Bắc Ninh**:
    - 8 Địa bàn Bắc Ninh + 1 nhóm ngoài tỉnh: `TP_BN` (TP. Bắc Ninh), `TU_SON` (TP. Từ Sơn), `QUE_VO` (TX. Quế Võ), `THUAN_THANH` (TX. Thuận Thành), `YEN_PHONG` (H. Yên Phong), `TIEN_DU` (H. Tiên Du), `GIA_BINH` (H. Gia Bình), `LUONG_TAI` (H. Lương Tài), `NGOAI_TINH` (Đối tác FDI / Ngoài tỉnh).
    - Danh mục KCN trọng điểm: Yên Phong I, Yên Phong II-C, Quế Võ I, Quế Võ II, Quế Võ III, VSIP Bắc Ninh, Tiên Sơn, Đại Đồng - Hoàn Sơn, Hanaka, Thuận Thành I/II/III, Gia Bình.
- **[ADD] `REQ-BACLINK-TAX-003` (Tách Public Locations Endpoint Khỏi `GovernanceControllers`)**:
  - Cung cấp endpoint công khai chuẩn `GET /api/v1/master-data/locations` trên `MasterDataControllers.cs` (trả về danh sách Địa bàn & KCN Bắc Ninh, hỗ trợ lọc `type=AREA|KCN`).
  - Cập nhật `src/lib/master-data-client.ts` gọi `/api/v1/master-data/locations` thay cho `/api/v1/governance/org-units/public-provinces` (kèm in-memory TTL cache + deduplication tương tự `getActiveSectors`).
- **[ADD] `BR-BACLINK-TAX-001` (Không Xóa Cứng Lịch Sử `LV*`)**:
  - Nghiêm cấm `DELETE` các bản ghi `LV*` trong `policy.taxonomy_terms`; chỉ chuyển `is_active = false` để `ITaxonomyNameResolver` vẫn giải mã được dữ liệu lịch sử khi truy vấn không lọc `activeOnly`.
- **[ADD] `BR-BACLINK-TAX-002` (Zero-Static-Array Fallback Trên UI)**:
  - Tuân thủ `BR-SEC-005` và Kỷ luật Zero-Mock: UI lấy danh mục ngành và địa bàn/KCN từ runtime API (`/api/v1/sectors`, `/api/v1/master-data/locations`), tuyệt đối không dùng fallback array trong khối `catch`. Danh mục tĩnh trong `constants/` chỉ đóng vai trò metadata cấu trúc/nhãn phụ trợ đồng bộ với DB seed, không chứa dữ liệu 34 tỉnh/Sở KH&CN.
- **[ADD] `BR-BACLINK-TAX-003` (Ánh Xạ Trọng Số Đánh Giá Năng Lực Từ 8 Ngành `IND_*`)**:
  - `Tt17ScoringEngine` (`TASK-09`) MUST ánh xạ hợp lệ 8 mã ngành `IND_ELEC`..`IND_LOG` sang bộ trọng số đánh giá năng lực nhà máy (fallback bộ trọng số cân bằng chuẩn BACLINK nếu không khớp phân ngành cụ thể).
- **[ADD] `TEST-BACLINK-003` (Kiểm Chứng Taxonomy `IND_*`, Locations Bắc Ninh & Cache)**:
  - Integration/Unit test Backend kiểm chứng `GET /api/v1/sectors?activeOnly=true` trả đúng 8 ngành `IND_*` (không trả `LV*`), `POST /api/v1/master-data/sectors` chấp nhận `IND_*`, `GET /api/v1/master-data/locations` trả Địa bàn & KCN Bắc Ninh.
  - Vitest Frontend kiểm chứng `master-data-client.ts` gọi `/api/v1/master-data/locations` và `provinces.ts` / combobox không còn `PROVINCES_34` / `Sở KH&CN`.

---

### 4. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)

- **`AC-CR-BACLINK-003.1`**: `GET /api/v1/sectors?activeOnly=true` trả về đúng 8 ngành `IND_ELEC`..`IND_LOG` (`isActive = true`); các bản ghi `LV*` vẫn tồn tại trong DB với `is_active = false`.
- **`AC-CR-BACLINK-003.2`**: `POST /api/v1/master-data/sectors` và `POST /api/v1/master-data/matrix` chấp nhận mã `IND_*` cho `ADMIN`, không còn báo lỗi `Mã ngành chuẩn phải bắt đầu bằng tiền tố 'LV'`.
- **`AC-CR-BACLINK-003.3`**: `GET /api/v1/master-data/locations` trả `200 OK` gồm 8+1 Địa bàn và danh mục KCN Bắc Ninh; `master-data-client.ts` không còn gọi `/api/v1/governance/org-units/public-provinces`.
- **`AC-CR-BACLINK-003.4`**: Codebase Frontend không còn hiển thị danh sách 34 tỉnh / `Sở KH&CN` trên các bộ lọc và combobox địa bàn.
- **`AC-CR-BACLINK-003.5`**: `Tt17ScoringEngine` chấm điểm thành công 100% cho hồ sơ doanh nghiệp gắn bất kỳ mã ngành nào trong `IND_ELEC`..`IND_LOG`.
