# Implementation Tasks: TASK-06 Hệ Thống Danh Mục Ngành & Ma Trận TT17

**Feature**: `TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`  
**Spec Reference**: [`spec.md`](./spec.md) | **Plan Reference**: [`plan.md`](./plan.md)  
**Status**: Converged & Verified (100%)  

---

## Phase 1: Master Data Endpoints & Services (Backend)

- [x] T001 [BE] Tạo `MasterDataControllers.cs` tại `apps/api/V1Compat/` cung cấp endpoints:
  - `GET /api/v1/master-data/sectors`: Trả về danh sách 18 ngành công nghiệp trọng điểm.
  - `POST /api/v1/master-data/sectors`: Thêm ngành mới có kiểm tra quyền Admin.
  - `GET /api/v1/master-data/tt17`: Trả về 10 phân ngành chế biến chế tạo nhóm C Thông tư 17.
  - `GET /api/v1/master-data/matrix`: Trả về 109 cặp quan hệ Lĩnh vực - Công nghệ (1-5 sao).
  - `GET /api/v1/master-data/exhibitions`: Trả về 15 triển lãm quốc tế chuyên ngành.
- [x] T002 [BE] Khai báo chính sách phân quyền `MASTER_DATA_MANAGE` trong `config/policies/authorization-rules.v1.json`.

---

## Phase 2: Giao Diện Quản Trị Danh Mục Ngành (Frontend)

- [x] T003 [FE] Xây dựng trang Quản trị Danh mục Ngành `src/app/admin/sectors/page.tsx` (`UI-MASTER-SECTOR-001`) theo cấu trúc 4 Tabs.
- [x] T004 [FE] Xây dựng Tab "18 Nhóm Ngành Trọng Điểm" kèm Modal thêm ngành mới.
- [x] T005 [FE] Xây dựng Tab "10 Phân Ngành TT17" hiển thị các chỉ số kinh tế kỹ thuật tham chiếu.
- [x] T006 [FE] Xây dựng Tab "Ma Trận 109 Cặp LV-CN" hỗ trợ bộ lọc theo Lĩnh vực (LV01-LV15) và hiển thị số sao.
- [x] T007 [FE] Xây dựng Tab "15 Triển Lãm Quốc Tế" hiển thị danh mục sự kiện thương mại.

---

## Phase 3: Kiểm Thử Toàn Diện & Quality Gate

- [x] T008 [INT] Viết Invariant Tests `SectorMasterDataInvariantsTests.cs` kiểm chứng 18 ngành, 10 phân ngành TT17 và ma trận 109 cặp.
- [x] T009 [INT] Viết Frontend Vitest component test cho `sectors/page.tsx`.
- [x] T010 [INT] Chạy kiểm thử hồi quy toàn bộ hệ thống (`dotnet test`, `pnpm test`, `tsc --noEmit`).

---

## Phase 4: Delta v2 — Đồng Bộ Danh Mục 10 Lĩnh Vực Chuẩn `LV` & Tái Cấu Trúc CSDL (WBS)

- [x] T011 [DB/SA] Tạo Migration EF Core `AddCodeAndMetadataToTaxonomyTerms` bổ sung cột `code VARCHAR(50)`, `metadata JSONB DEFAULT '{}'`, unique index `(kind, code)` và index `code` trên bảng `policy.taxonomy_terms`.
- [x] T012 [DB/BE] Viết migration/seed script nạp đúng 10 bản ghi Lĩnh vực chuẩn (`LV01, LV05, LV07, LV08, LV11, LV12, LV14, LV15, LV16, LV17`) kèm metadata TT17 vào `policy.taxonomy_terms` (hoãn 8 mã khuyết theo chỉ đạo User).
- [x] T013 [BE] Cập nhật Domain Entity `TaxonomyTerm.cs` và `TaxonomyService` để hỗ trợ thuộc tính `Code` và `Metadata`.
- [x] T014 [BE] Refactor `MasterDataControllers.cs`: Loại bỏ mảng tĩnh `StaticSectors`, chuyển sang truy vấn động từ CSDL qua `ITaxonomyService` lọc theo `Kind = Sector` trả về 10 Lĩnh vực chuẩn.
- [x] T015 [BE/SEC] Chuẩn hóa Scoped RBAC trong `authorization-rules.v1.json` và `GovernanceControllers.cs`: Đổi các scope mẫu từ `SEC-*` sang `LV*` (`LV07`, `LV05`, `LV01`...).
- [x] T016 [FE] Cập nhật Web UI `src/app/admin/sectors/page.tsx` và `src/app/admin/roles/page.tsx`: Chỉ hiển thị 10 Lĩnh vực chuẩn `LV`, form nhập liệu và validation sang mã chuẩn `LV*`, loại bỏ các ngành tự chế `SEC-*`.
- [x] T017 [TEST] Cập nhật bài test Invariant `MasterDataAndRolesInvariantsTests.cs` (`Sectors_MasterData_ShouldDefine10CoreSectors`) và `SectorMasterDataInvariantsTests.cs` kiểm tra đúng 10 Lĩnh vực chuẩn `LV`.
- [x] T018 [TEST] Chạy kiểm thử hồi quy toàn diện 3 tầng (`dotnet test`, `pnpm test`, `tsc --noEmit`) đảm bảo 100% Green và không đứt gãy tính truy vết.



## Delta CR-2026-005 — Sector taxonomy runtime
- [ ] T019 [API][DB][REQ-MD-SECTOR-001] Remove CoreSectors static fallback; ensure DB empty response remains empty.
- [ ] T020 [API][DB] Resolve TT17/category and matrix field labels from current taxonomy, filter inactive/unknown sector codes from active-facing matrix.
- [ ] T021 [FE] Admin taxonomy list/count/filter uses API response only; loading/empty/error states; create persists through API before optimistic UI update.
- [ ] T022 [FE] Admin TT17, matrix and filter options load taxonomy/API at runtime; remove duplicated sector and category arrays.
- [ ] T023 [TEST] Verify runtime add/rename/deactivate/empty/error taxonomy through integration and browser black-box cases.
