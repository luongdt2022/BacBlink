# Implementation Plan: TASK-06 Hệ Thống Danh Mục Ngành & Ma Trận TT17 (Delta v2)

**Feature**: `TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`  
**Spec Reference**: [`spec.md`](./spec.md)  
**Status**: Delta v2 Converged (10 Lĩnh vực chuẩn `LV`)  

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
