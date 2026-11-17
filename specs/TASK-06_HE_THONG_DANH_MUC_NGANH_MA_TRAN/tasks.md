# Implementation Tasks: TASK-06 Hệ Thống Danh Mục Ngành & Ma Trận TT17

**Feature**: `TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`  
**Spec Reference**: [`spec.md`](./spec.md) | **Plan Reference**: [`plan.md`](./plan.md)  
**Version**: 1.13.0 (Delta v4 - CR-BACLINK-003)  
**Status**: In Implementation  

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
- [x] T019 [API][DB][REQ-MD-SECTOR-001] Remove CoreSectors static fallback; ensure DB empty response remains empty.
- [x] T020 [API][DB] Resolve TT17/category and matrix field labels from current taxonomy, filter inactive/unknown sector codes from active-facing matrix.
- [x] T021 [FE] Admin taxonomy list/count/filter uses API response only; loading/empty/error states; create persists through API before optimistic UI update.
- [x] T022 [FE] Admin TT17, matrix and filter options load taxonomy/API at runtime; remove duplicated sector and category arrays.
- [x] T023 [TEST] Verify runtime add/rename/deactivate/empty/error taxonomy through integration and browser black-box cases.


---

## Phase 5: Delta v3 (CR-2026-010) — Thiết Lập Nguồn Chân Lý Duy Nhất (SSOT) & Cấm Mảng Ngành Tĩnh

- [x] **T-06.024** `[ARCH]` Thiết lập quy chuẩn SSOT cho Taxonomy Lĩnh Vực: Bảo đảm `policy.taxonomy_terms` là nơi lưu trữ duy nhất, runtime qua `/api/v1/master-data/sectors?activeOnly=true`.
  - Tiêu chí kiểm chứng:
    - [x] Không có fallback mảng tĩnh khi DB trả về rỗng.
    - [x] Rà soát toàn bộ các components không còn mảng ngành tự chế `SEC-*` hay `AG, FOOD...`.
- [x] **T-06.025** `[TEST]` Bổ sung Invariant Test `SectorMasterDataInvariantsTests.cs` kiểm tra tính bất biến SSOT của 10 Lĩnh vực chuẩn TT17 và cấm mảng static (`BR-SEC-005`).
  - Tiêu chí kiểm chứng:
    - [x] Invariant test xác nhận đúng 10 mã `LV` chuẩn.
    - [x] 100% test suites pass.

---

## Phase 6: BACLINK Refactor Delta (CR-BACLINK-003) — 8 Ngành BACLINK (`IND_*`), Địa Bàn/KCN Bắc Ninh & Tách Endpoint Locations

- [x] `T-06.BL.01` **[DB]** Tạo migration SQL phi phá hủy deactivate `LV*` (`UPDATE policy.taxonomy_terms SET is_active = false WHERE kind = 'SECTOR' AND code LIKE 'LV%'`, tuyệt đối không `DELETE`) và upsert 8 ngành BACLINK (`IND_ELEC`..`IND_LOG`) + 8+1 Địa bàn & KCN trọng điểm Bắc Ninh (`kind = 'LOCATION'`) (`REQ-BACLINK-TAX-001`, `REQ-BACLINK-TAX-002`, `BR-BACLINK-TAX-001`):
  - Tệp: `SourceCode/backend/infra/migrations/20261117_baclink_taxonomy_sectors_locations.sql`.
  - Kiểm chứng: Áp dụng lên PostgreSQL local và xác nhận `SELECT code, is_active FROM policy.taxonomy_terms WHERE kind IN ('SECTOR', 'LOCATION');`.
- [x] `T-06.BL.02` **[BE]** Bổ sung `TaxonomyKinds.Location = "LOCATION"` trong `Contracts.cs` & `TaxonomyService.cs` và xóa `FallbackSectors` static mock trong `TaxonomyControllers.cs` (`REQ-BACLINK-TAX-003`, `BR-BACLINK-TAX-002`):
  - Tệp: `SourceCode/backend/modules/policy/Application/Contracts.cs`, `SourceCode/backend/modules/policy/Application/TaxonomyService.cs`, `SourceCode/backend/apps/api/V1Compat/TaxonomyControllers.cs`.
  - Kiểm chứng: `dotnet test SourceCode/backend/tests/integration/NacenTech.Tests.Integration.csproj --filter "FullyQualifiedName~MasterDataSectorIntegrationTests"`.
- [x] `T-06.BL.03` **[BE]** Mở validation `IND_*` (`^IND_[A-Z0-9_]+$`) tại `CreateSector` & `UpdateMatrixPair` (`POST/PUT matrix`), cập nhật ma trận cho 8 ngành `IND_*`, và bổ sung endpoint công khai `[AllowAnonymous] GET /api/v1/master-data/locations` (`?type=AREA|KCN`) tại `MasterDataControllers.cs` (`REQ-BACLINK-TAX-001`, `REQ-BACLINK-TAX-003`):
  - Tệp: `SourceCode/backend/apps/api/V1Compat/MasterDataControllers.cs`.
  - Kiểm chứng: `dotnet test SourceCode/backend/tests/invariants/NacenTech.Tests.Invariants.csproj --filter "FullyQualifiedName~SectorMasterDataInvariantsTests"`.
- [x] `T-06.BL.04` **[BE]** Bổ sung bảng ánh xạ trọng số Đánh giá Năng lực từ 8 ngành `IND_ELEC`..`IND_LOG` trong `Tt17ScoringEngine.cs` & `AssessmentsController.cs` (fallback bộ trọng số cân bằng chuẩn BACLINK) (`BR-BACLINK-TAX-003`):
  - Tệp: `SourceCode/backend/modules/assessment/NacenTech.Modules.Assessment/Application/Tt17ScoringEngine.cs`, `SourceCode/backend/apps/api/V2/AssessmentsController.cs`.
  - Kiểm chứng: `dotnet test SourceCode/backend/tests/NacenTech.Modules.Assessment.Tests/NacenTech.Modules.Assessment.Tests.csproj`.
- [x] `T-06.BL.05` **[FE]** Cập nhật `master-data-client.ts` gọi `/api/v1/master-data/locations` thay cho `/api/v1/governance/org-units/public-provinces`, thêm `getBacNinhLocations()` với TTL cache + dedup và reject lỗi (Zero-Static-Array Fallback) (`REQ-BACLINK-TAX-003`, `BR-BACLINK-TAX-002`):
  - Tệp: `SourceCode/frontend/src/lib/master-data-client.ts`.
  - Kiểm chứng: `cd SourceCode/frontend && npx vitest run src/lib/master-data-client.test.ts`.
- [x] `T-06.BL.06` **[FE]** Thay `PROVINCES_34` (`34 Tỉnh / Sở KH&CN`) bằng danh mục 8+1 Địa bàn & KCN trọng điểm Bắc Ninh trong `provinces.ts` và `searchable-province-combobox.tsx` (`REQ-BACLINK-TAX-002`, `BR-BACLINK-TAX-002`):
  - Tệp: `SourceCode/frontend/src/lib/constants/provinces.ts`, `SourceCode/frontend/src/components/common/searchable-province-combobox.tsx`.
  - Kiểm chứng: `cd SourceCode/frontend && npx tsc --noEmit`.
- [x] `T-06.BL.07` **[FE]** Cập nhật `/admin/sectors` và `/matrix` sang 8 ngành công nghiệp BACLINK (`IND_*`), validation `^IND_[A-Z0-9_]+$`, hiển thị Địa bàn/KCN Bắc Ninh và `invalidateSectorsCache()` sau CRUD (`REQ-BACLINK-TAX-001`, `REQ-BACLINK-TAX-002`):
  - Tệp: `SourceCode/frontend/src/app/admin/sectors/page.tsx`, `SourceCode/frontend/src/app/matrix/page.tsx`.
  - Kiểm chứng: `cd SourceCode/frontend && npx vitest run src/app/admin/sectors/page.test.tsx`.
- [x] `T-06.BL.08` **[TEST]** Cập nhật & chạy Invariant/Integration/Vitest tests kiểm chứng 8 ngành `IND_*`, `LV*` bị deactivate phi phá hủy (`is_active = false`), `GET /api/v1/master-data/locations`, `Tt17ScoringEngine` 8 ngành `IND_*`, và `master-data-client.test.ts` (`TEST-BACLINK-003`):
  - Tệp: `SourceCode/backend/tests/invariants/SectorMasterDataInvariantsTests.cs`, `SourceCode/backend/tests/invariants/MasterDataAndRolesInvariantsTests.cs`, `SourceCode/backend/tests/integration/MasterDataSectorIntegrationTests.cs`, `SourceCode/backend/tests/NacenTech.Modules.Assessment.Tests/Tt17ScoringEngineTests.cs`, `SourceCode/frontend/src/lib/master-data-client.test.ts`, `SourceCode/frontend/src/app/admin/sectors/page.test.tsx`.
  - Kiểm chứng: `dotnet test SourceCode/backend/NacenTech.slnx --filter "FullyQualifiedName~SectorMasterDataInvariantsTests|MasterDataAndRolesInvariantsTests|MasterDataSectorIntegrationTests|Tt17ScoringEngineTests"` và `cd SourceCode/frontend && npx vitest run src/lib/master-data-client.test.ts src/app/admin/sectors/page.test.tsx && npx tsc --noEmit`.

