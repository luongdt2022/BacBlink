# Implementation Plan: TASK-06 Hệ Thống Danh Mục Ngành & Ma Trận TT17 (Delta v2)

**Feature**: `TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Version**: 1.13.0 (Delta v4 - CR-BACLINK-003)  
**Status**: In Implementation  

---

## 1. Kiến Trúc Backend (.NET Clean Architecture)

### 1.1. Module Policy / Taxonomy & Nâng Cấp Schema CSDL
- Nâng cấp bảng `policy.taxonomy_terms`:
  - Bổ sung cột `code VARCHAR(50)` và `metadata JSONB DEFAULT '{}'::jsonb`.
  - Tạo Unique Index `(kind, code)` và Index `code`.
- Seed data đúng 10 bản ghi Lĩnh vực chuẩn xác thực trong Excel:
  - `LV01`: Nông nghiệp
  - `LV05`: Chế biến thực phẩm – đồ uống
  - `LV07`: Cơ khí – chế tạo – công nghiệp hỗ trợ
  - `LV08`: Điện – điện tử – tự động hóa
  - `LV11`: Nước – môi trường – chất thải
  - `LV12`: Xây dựng – vật liệu – hạ tầng
  - `LV14`: Logistics – vận tải – kho bãi
  - `LV15`: Du lịch – khách sạn – nhà hàng
  - `LV16`: CNTT – viễn thông – chuyển đổi số
  - `LV17`: Khoa học – công nghệ – đổi mới sáng tạo
  *(8 mã khuyết LV02, LV03, LV04, LV06, LV09, LV10, LV13, LV18 tạm hoãn theo chỉ đạo User; triệt tiêu hoàn toàn SEC-*)*.

### 1.2. MasterData Controller (`apps/api/V1Compat/MasterDataControllers.cs`)
Cung cấp các REST endpoints động kết nối qua `ITaxonomyService`:
- `GET /api/v1/master-data/sectors`: Truy vấn từ CSDL trả về 10 Lĩnh vực chuẩn `LV`.
- `POST /api/v1/master-data/sectors`: Thêm mới hoặc cập nhật Lĩnh vực (Admin only).
- `GET /api/v1/master-data/tt17`: Trả về 10 phân ngành Thông tư 17 với các chỉ số kinh tế - kỹ thuật.
- `GET /api/v1/master-data/matrix`: Trả về danh sách quan hệ Lĩnh vực - Công nghệ.
- `GET /api/v1/master-data/exhibitions`: Trả về 15 hội chợ triển lãm.

---

## 2. Kiến Trúc Frontend (Next.js 15 & React 19)

### 2.1. Component Admin Sectors (`src/app/admin/sectors/page.tsx`)
- Áp dụng cấu trúc 4 Tabs chuẩn Wireframe `wireframe_quan_tri_danh_muc_nganh.html`:
  - Tab 1: 10 Lĩnh Vực Trọng Điểm Chuẩn `LV`.
  - Tab 2: 10 Phân Ngành Chế Biến Chế Tạo (TT17).
  - Tab 3: Ma Trận Các Cặp Lĩnh Vực - Công Nghệ (1-5 sao) kèm lọc theo 10 Lĩnh vực.
  - Tab 4: 15 Triển Lãm Quốc Tế Chuyên Ngành.
- Sử dụng component `<Async>` hiển thị đủ 5 trạng thái UX (Loading, Error, Empty, Success).
- Modal thêm/sửa ngành có validation mã ngành chuẩn `LV*` (`LV01..LV17`).

---

## 3. Kế Hoạch Kiểm Thử
1. **Unit & Invariants Tests**:
   - `MasterDataAndRolesInvariantsTests.cs` & `SectorMasterDataInvariantsTests.cs`: Kiểm chứng đúng 10 Lĩnh vực chuẩn `LV`, 10 phân ngành TT17 và ma trận liên kết.
2. **Frontend Vitest**:
   - `sectors.test.tsx`: Kiểm thử render tab, chuyển tab, bộ lọc 10 Lĩnh vực ma trận.
3. **Quality Gate**:
   - Chạy kiểm thử hồi quy 3 tầng: `dotnet test` (100% pass), `pnpm test` (100% pass), `tsc --noEmit` (0 error).



---

## 4. KẾ HOẠCH KIẾN TRÚC DELTA v3 (CR-2026-010): THIẾT LẬP TAXONOMY SSOT & ZERO-STATIC-ARRAY ENFORCEMENT

### 4.1. Nguồn Chân Lý Duy Nhất (SSOT Invariant)
- CSDL PostgreSQL bảng `policy.taxonomy_terms` (`kind = "SECTOR"`, `is_active = true`) là nguồn chân lý duy nhất cho toàn bộ hệ thống.
- Runtime API: `GET /api/v1/master-data/sectors?activeOnly=true`.
- Nghiêm cấm định nghĩa mảng ngành tĩnh trong mã nguồn Frontend hoặc Backend (`BR-SEC-005`).

### 4.2. Kiến Trúc Tra Cứu & Client Cache
- Cung cấp hàm chuẩn hóa `getActiveSectors()` trong `lib/master-data-client.ts`:
  + Gọi API `/api/v1/master-data/sectors?activeOnly=true`.
  + Trả về đúng 10 Lĩnh vực chuẩn TT17 (`LV01, LV05, LV07, LV08, LV11, LV12, LV14, LV15, LV16, LV17`).
  + Cache kết quả tại client memory để tránh gọi trùng lặp nhiều lần giữa các components.

---

## 5. KẾ HOẠCH KIẾN TRÚC DELTA v4 (`CR-BACLINK-003`): 8 NGÀNH CÔNG NGHIỆP BACLINK (`IND_*`), ĐỊA BÀN & KCN BẮC NINH VÀ TÁCH ENDPOINT LOCATIONS

*Căn cứ: [`CR-BACLINK-003`](./deltas/CR-BACLINK-003_baclink_sectors_and_kcn.md), [`ADR-0018`](../../backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md), [`open-questions.md`](../../docs/open-questions.md) (Q2).*

### 5.1. Non-Destructive PostgreSQL Taxonomy Migration (`REQ-BACLINK-TAX-001`, `REQ-BACLINK-TAX-002`, `BR-BACLINK-TAX-001`)
- Tạo script migration SQL idempotent `SourceCode/backend/infra/migrations/20261117_baclink_taxonomy_sectors_locations.sql` (kèm đồng bộ `SourceCode/backend/scripts/seed_baclink_demo_data.sql`):
  1. **Deactivate phi phá hủy ngành cũ `LV*`**: Thực thi `UPDATE policy.taxonomy_terms SET is_active = false WHERE kind = 'SECTOR' AND code LIKE 'LV%';` — **tuyệt đối không `DELETE`** để `ITaxonomyNameResolver` giải mã được dữ liệu lịch sử (`BR-BACLINK-TAX-001`).
  2. **Upsert 8 Ngành Công nghiệp chuẩn BACLINK (`is_active = true`)**: `IND_ELEC`, `IND_MECH`, `IND_AUTO`, `IND_PLAS`, `IND_MAT`, `IND_IT`, `IND_GREEN`, `IND_LOG` kèm `metadata` JSONB (`tt17Code`, `description`, `matrixPairsCount`).
  3. **Upsert Địa bàn & KCN Bắc Ninh (`kind = 'LOCATION'`, `is_active = true`)**:
     - 8+1 Địa bàn (`metadata->>'type' = 'AREA'`): `TP_BN`, `TU_SON`, `QUE_VO`, `THUAN_THANH`, `YEN_PHONG`, `TIEN_DU`, `GIA_BINH`, `LUONG_TAI`, `NGOAI_TINH`.
     - Danh mục KCN trọng điểm (`metadata->>'type' = 'KCN'`): Yên Phong I, Yên Phong II-C, Quế Võ I, Quế Võ II, Quế Võ III, VSIP Bắc Ninh, Tiên Sơn, Đại Đồng - Hoàn Sơn, Hanaka, Thuận Thành I/II/III, Gia Bình.

### 5.2. Backend Clean Architecture, MasterData API & Assessment Mapping
1. **Module Policy (`modules/policy/Application/Contracts.cs`, `TaxonomyService.cs`)**:
   - Bổ sung `TaxonomyKinds.Location = "LOCATION"` vào `TaxonomyKinds` và cho phép trong `TaxonomyService.CreateAsync` (dòng 78).
2. **`MasterDataControllers.cs` (`SourceCode/backend/apps/api/V1Compat/MasterDataControllers.cs`)**:
   - **Mở chuẩn `IND_*` (`REQ-BACLINK-TAX-001`)**: Sửa `CreateSector` (`POST /api/v1/master-data/sectors`, dòng 212) và `UpdateMatrixPair` (`PUT /api/v1/master-data/matrix` & bổ sung `[HttpPost("matrix")]`, dòng 318): bỏ ràng buộc cứng `!StartsWith("LV")`, áp dụng validation regex `^IND_[A-Z0-9_]+$` (giữ tương thích đọc `LV*` khi `activeOnly = false`). Cập nhật ma trận liên kết cho 8 mã `IND_*`.
   - **Tách Public Locations Endpoint (`REQ-BACLINK-TAX-003`)**: Bổ sung `[HttpGet("locations")]` `[AllowAnonymous]` (`GET /api/v1/master-data/locations?type=AREA|KCN`) đọc động từ `ITaxonomyService.ListAsync(TaxonomyKinds.Location, true, ct)` (không dùng static fallback array). Endpoint `public-provinces` tại `GovernanceControllers.cs` được tách và vô hiệu hóa theo `CR-BACLINK-002`.
3. **Triệt tiêu Static Fallback (`SourceCode/backend/apps/api/V1Compat/TaxonomyControllers.cs`)**:
   - Xóa mảng tĩnh `FallbackSectors` (dòng 15-25) và nhánh `catch` trả mock trong `SectorsController.List` (dòng 35-38), đảm bảo `GET /api/v1/sectors` tuân thủ tuyệt đối `BR-BACLINK-TAX-002` / `BR-SEC-005`.
4. **Mapping Trọng Số Đánh Giá Năng Lực (`BR-BACLINK-TAX-003`, `open-questions.md` Q2)**:
   - `SourceCode/backend/modules/assessment/NacenTech.Modules.Assessment/Application/Tt17ScoringEngine.cs` & `apps/api/V2/AssessmentsController.cs`: Bổ sung bảng ánh xạ mặc định từ 8 mã ngành `IND_ELEC`..`IND_LOG` sang bộ trọng số công nghiệp tương ứng (fallback bộ trọng số cân bằng chuẩn BACLINK) để engine chấm 26 tiêu chí chạy không lỗi với 100% ngành `IND_*`.

### 5.3. Kiến Trúc Frontend — MasterData Client, Địa Bàn Bắc Ninh & Admin Sectors UI
1. **MasterData Client (`SourceCode/frontend/src/lib/master-data-client.ts`)**:
   - Thay endpoint `/api/v1/governance/org-units/public-provinces` (dòng 52) bằng `/api/v1/master-data/locations` (`REQ-BACLINK-TAX-003`).
   - Bổ sung `getBacNinhLocations(options?: { type?: 'AREA' | 'KCN'; forceRefresh?: boolean })` dùng in-memory TTL cache + in-flight deduplication; giữ nguyên hành vi reject lỗi khi API thất bại, **tuyệt đối không** fallback mảng tĩnh trong `catch` (`BR-BACLINK-TAX-002`).
2. **Danh Mục Địa Bàn & Combobox (`src/lib/constants/provinces.ts`, `src/components/common/searchable-province-combobox.tsx`)**:
   - Thay `PROVINCES_34` (34 tỉnh / `Sở KH&CN`) bằng danh mục 8+1 Địa bàn & KCN Bắc Ninh (`REQ-BACLINK-TAX-002`), giữ adapter/alias import tương thích tạm thời để không làm gãy compile các consuming epics khi cập nhật tuần tự.
3. **Admin Sectors & Matrix UI (`src/app/admin/sectors/page.tsx`, `src/app/matrix/page.tsx`)**:
   - Cập nhật form CRUD ngành dùng mã chuẩn `IND_*` (`^IND_[A-Z0-9_]+$`), hiển thị 8 ngành BACLINK + Địa bàn/KCN Bắc Ninh và gọi `invalidateSectorsCache()` sau CRUD.

### 5.4. Chiến Lược Kiểm Thử (`TEST-BACLINK-003`)
- **Backend (`dotnet test`)**: `tests/integration/MasterDataSectorIntegrationTests.cs`, `tests/invariants/SectorMasterDataInvariantsTests.cs`, `tests/invariants/MasterDataAndRolesInvariantsTests.cs`, `tests/NacenTech.Modules.Assessment.Tests/Tt17ScoringEngineTests.cs` kiểm chứng: `GET /api/v1/sectors` trả 8 ngành `IND_*` (còn `LV*` với `is_active = false`), `POST sectors`/`matrix` chấp nhận `IND_*`, `GET /api/v1/master-data/locations` trả Địa bàn & KCN Bắc Ninh, `Tt17ScoringEngine` chấm điểm 8 ngành `IND_*`.
- **Frontend (`vitest`)**: `src/lib/master-data-client.test.ts` (assert gọi `/api/v1/master-data/locations`, zero fallback on error), `src/app/admin/sectors/page.test.tsx`.

