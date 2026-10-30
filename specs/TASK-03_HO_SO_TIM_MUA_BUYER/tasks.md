# Danh Sách Công Việc Kỹ Thuật (tasks.md): TASK-03 — Hồ Sơ Tìm Mua & Nhu Cầu Buyer

> **Mã phân hệ**: `TASK-03_HO_SO_TIM_MUA_BUYER`  
> **Quy chuẩn thực thi**: Tuần tự từng màn hình và từng luồng công việc  
> **Kiểm định chất lượng**: Bàn giao QC kiểm định Black-box 4 tầng đạt 100% Green trước khi đóng Epic

---

## Phase 1: Nền Tảng Domain, CSDL & Thuật Toán TNI (Foundation & Domain Engine)

- [x] **T-03.01** `[BE]` `[CONTRACT]` Định nghĩa Enums & Value Objects: `TniClassification`, `TniResult`, `DemandItemStatus` trong Domain.
- [x] **T-03.02** `[BE]` Cài đặt Domain Service `TniCalculationEngine`: Công thức $\text{TNI} = \text{ROUND}((35K + 30L + 20N + 15O)/5, 0)$ và 4 ngưỡng xếp loại (VERY_HIGH, HIGH, MEDIUM, LOW).
- [x] **T-03.03** `[BE]` Cập nhật Entities `DemandSurvey` và `DemandItem` ánh xạ đúng thiết kế CSDL `THIET_KE_CSDL_DEMAND_VA_TNI.md`.
- [x] **T-03.04** `[BE]` Tạo EF Core Migration cho 2 bảng `demand_surveys` và `demand_items` trên PostgreSQL.
- [x] **T-03.05** `[BE]` `[TEST]` Viết bộ Unit Test `TniCalculationEngineTests` bao phủ 100% `BR-TNI-01` $\rightarrow$ `BR-TNI-04` (min, max, invalid inputs).

---

## Phase 2: Luồng 1 & Màn hình 1 — Phiếu Khảo Sát Sâu DNNVV & Realtime TNI (`/khao-sat-nhu-cau`)

- [x] **T-03.06** `[BE]` Xây dựng Application Command `SubmitDeepSurveyCommand` & API `POST /api/v1/demands/surveys`.
- [x] **T-03.07** `[FE]` Xây dựng Component `TniRealtimeCalculator.tsx` hiển thị 4 thanh trượt/radio $K, L, N, O$ và badge điểm TNI đổi màu theo thời gian thực.
- [x] **T-03.08** `[FE]` Xây dựng Màn hình 1: `src/app/khao-sat-nhu-cau/page.tsx` hoàn thiện 7 phần (A $\rightarrow$ G) theo đúng `wireframe_phieu_khao_sat_dnnvv.html`.
- [x] **T-03.09** `[FE]` Tích hợp API nộp phiếu, thông báo nộp thành công và cấp mã định danh `SUR-XXXXX`.

---

## Phase 3: Luồng 2 & Màn hình 2, 3 — Buyer Workspace & Tạo Nhanh Bài Toán (`/portal/buyer/demands`)

- [x] **T-03.10** `[BE]` Xây dựng API `POST /api/v1/demands/items` (Tạo bài toán nhanh) và `GET /api/v1/buyer/demands` (Lấy danh sách bài toán bên mua).
- [x] **T-03.11** `[FE]` Xây dựng Màn hình 3: Component `QuickDemandModal.tsx` tạo nhanh bài toán kỹ thuật kèm tính điểm TNI.
- [x] **T-03.12** `[FE]` Xây dựng Màn hình 2: `src/app/portal/buyer/demands/page.tsx` gồm hàng KPI Cards, bảng danh sách Demand Tickets, tích hợp `<Async>` 5 trạng thái UX và nút mở Radar Matching.

---

## Phase 4: Luồng 3 & Màn hình 5 — Cổng Thẩm Định & Phân Luồng Sở KH&CN (`/gov/demands`)

- [x] **T-03.13** `[BE]` Xây dựng APIs: `GET /api/v1/gov/demands`, `POST /api/v1/gov/demands/{id}/verify`, `POST /api/v1/gov/demands/{id}/assign-expert`.
- [x] **T-03.14** `[FE]` Xây dựng Màn hình 5: `src/app/gov/demands/page.tsx` cho cán bộ Sở thẩm định hồ sơ, gắn cờ cảnh báo SLA 24h đối với bài toán $TNI \ge 80$, và chỉ định chuyên gia tư vấn.

---

## Phase 5: Luồng 4 & Màn hình 4 — Sàn Nhu Cầu Công Khai & Bảo Mật PDPD (`/nhu-cau-cong-nghe`)

- [x] **T-03.15** `[BE]` Xây dựng Public APIs `GET /api/v1/public/demands` và `GET /api/v1/public/demands/{id}` thực hiện che giấu 100% PII (SĐT, Email, Ngân sách chi tiết).
- [x] **T-03.16** `[FE]` Xây dựng Màn hình 4: `src/app/nhu-cau-cong-nghe/page.tsx` (Danh sách thẻ bài toán, bộ lọc đa tiêu chí) và `src/app/nhu-cau-cong-nghe/[id]/page.tsx` (Chi tiết bài toán, nút Gửi đề xuất chào bán).

---

## Phase 6: Luồng 5 & Màn hình 6 — Kênh Triển Lãm & Hội Chợ (`/trien-lam/dang-ky-tham-quan`)

- [x] **T-03.17** `[BE]` Xây dựng API `POST /api/v1/trien-lam/dang-ky` tiếp nhận thông tin khách tham quan và bài toán tại hội chợ.
- [x] **T-03.18** `[FE]` Xây dựng Màn hình 6: `src/app/trien-lam/dang-ky-tham-quan/page.tsx` thu thập nhu cầu tại triển lãm (ICE Cung Việt Xô, VIMEXPO, AUTOEXPO).

---

## Phase 7: Bàn Giao QC Kiểm Định Black-Box 4 Tầng & Gate 4/5 Sign-Off

- [x] **T-03.19** `[QC-TEST]` Tầng 1 (Invariants): Chạy Unit Test `TniCalculationEngineTests` đạt 100% Pass.
- [x] **T-03.20** `[QC-TEST]` Tầng 2 (API Contract): Kiểm định DTOs giữa Backend và Frontend không bị lệch contract.
- [x] **T-03.21** `[QC-TEST]` Tầng 3 (DB Integration): Kiểm định lưu trữ CSDL PostgreSQL, kiểm tra tính toàn vẹn và cách ly với Master DN `TASK-02`.
- [x] **T-03.22** `[QC-TEST]` Tầng 4 (Playwright E2E Black-box): Xây dựng và thực thi trọn bộ kịch bản E2E `test_task03_buyer_demands_blackbox.py` bao phủ cả 6 màn hình và 5 luồng công việc đạt 100% Pass.
- [x] **T-03.23** `[PO-GATE]` Nghiệm thu Gate 4 & Gate 5 Sign-off, cập nhật `ROADMAP.md` và `TRACEABILITY.md`.

---

## Phase 8: Delta v2 — Tối Ưu Hóa Sàn Nhu Cầu Công Khai & Phân Quyền Hành Động

- [x] **T-03.24** `[FE]` Tối ưu giao diện Hero Banner: Thêm overlay gradient tối màu, `relative z-10`, khắc phục lỗi text mờ tịt (đạt chuẩn WCAG AA), thêm khối Quick Metrics (140+ Bài toán, 68.5+ Tỷ ngân sách, 24 Giờ hỗ trợ).
- [x] **T-03.25** `[FE]` Mở rộng Combobox Lĩnh vực: Tích hợp `getActiveSectors()` từ `master-data-client.ts`, hiển thị đầy đủ 10 Lĩnh vực TT17 kèm fallback an toàn.
- [x] **T-03.26** `[FE]` Chuẩn hóa thẻ bài toán (Humanized Cards): Ẩn mã hồ sơ hash/ID thô (`DMD-202610-0FF52B`), hiển thị tên tiếng Việt của lĩnh vực, hiển thị định danh doanh nghiệp ẩn danh theo chuẩn PDPD masking.
- [x] **T-03.27** `[FE]` Phân quyền nút bấm & Bảo vệ vai trò (Role Guards): Tích hợp `authClient` kiểm tra quyền khi bấm "Đăng Nhanh Bài Toán", dẫn hướng khách vãng lai hoặc mở modal cho Doanh nghiệp; gắn auth headers vào `QuickDemandModal.tsx`.
- [x] **T-03.28** `[QC-TEST]` Kiểm thử hồi quy giao diện, kiểm chứng độ tương phản, kiểm tra bộ lọc và sự kiện nút bấm.

---

## Phase 9: Delta v3 — Chuẩn Hóa Toàn Diện Phiếu Khảo Sát Sâu DNNVV 7 Phần (A -> G)

- [x] **T-03.29** `[BE]` `[PERSISTENCE]` Tạo EF Core Migration `AddDeepSurveyFullSpecification` bổ sung các cột pháp nhân và cột `jsonb survey_details` vào bảng `demand.demand_surveys`.
- [x] **T-03.30** `[BE]` `[CONTRACT]` Cập nhật DTO `SubmitDeepSurveyRequest` và mapping logic trong `DemandController.cs` để lưu trữ đầy đủ 7 phần dữ liệu.
- [x] **T-03.31** `[FE]` Xây dựng Stepper Wizard Navigation & LocalStorage Draft Persistence cho trang `/khao-sat-nhu-cau`.
- [x] **T-03.32** `[FE]` Cài đặt Bước 1 & 2: Form Phần A (Thông tin DN đầy đủ) và Phần B (Bảng thiết bị động + Bảng 8 tiêu chí hiện trạng).
- [x] **T-03.33** `[FE]` Cài đặt Bước 3 & 4: Form Phần C (Danh mục điểm nghẽn tối đa 5 điểm) và Phần D (Năng lực tiếp nhận nhân lực & TAR).
- [x] **T-03.34** `[FE]` Cài đặt Bước 5: Form Phần E cho phép thêm/xóa nhiều bài toán kỹ thuật, nhúng bộ tính điểm `TniRealtimeCalculator` cho từng bài toán.
- [x] **T-03.35** `[FE]` Cài đặt Bước 6 & 7: Form Phần F (Định hướng & Hỗ trợ) và Phần G (Trang Review tổng hợp, người ký xác nhận, PDPD Consent).
- [x] **T-03.36** `[FE]` Tích hợp toàn trình nộp phiếu API `POST /api/v1/demands/surveys`, hiển thị mã phiếu `SUR-XXXXX` và điều hướng về Bàn làm việc Buyer.
- [x] **T-03.37** `[TEST]` Viết bộ kiểm thử Frontend Vitest và Backend Integration Test kiểm tra toàn vẹn dữ liệu 7 phần.

---

## Phase 10: Delta v4 — Tự Động Hóa Định Danh, Tra Cứu MST & Tối Ưu Kênh Triển Lãm

- [x] **T-03.38** `[BE]` Xây dựng API `GET /api/v1/enterprises/lookup-tax/{taxCode}` (Hybrid Lookup: Tra cứu CSDL nội bộ `enterprise.enterprises` trước, nếu không có fallback sang VietQR Business API `https://api.vietqr.io/v2/business/{taxCode}`, trích xuất tự động Tỉnh/Thành phố).
- [x] **T-03.39** `[BE]` Nâng cấp `POST /api/v1/demands/surveys` trong `DemandController.cs`: Tự động gọi `IPersonService.ProvisionAsync` cấp tài khoản `PlatformRoles.Buyer` cho người nộp ẩn danh/chưa có tài khoản tại triển lãm, phản hồi thông tin tài khoản tạm thời.
- [x] **T-03.40** `[FE]` Bổ sung nút bấm 🔍 Tra Cứu MST tại Bước 1 (Phần A) form `/khao-sat-nhu-cau`, tự động điền Tên DN, Tỉnh thành, Địa chỉ theo kết quả tra cứu kèm trạng thái loading và toast thông báo.
- [x] **T-03.41** `[FE]` Cài đặt Smart Pre-fill cho Doanh nghiệp đã đăng nhập: Tự động gọi `fetchMyEnterpriseProfile()` khi phát hiện auth token hợp lệ, điền sẵn thông tin DN vào Bước 1 và hiển thị Banner UX thông báo.
- [x] **T-03.42** `[FE]` Cập nhật Success View tại Bước 7: Phân biệt người dùng vãng lai tại triển lãm (hiển thị thông tin tài khoản được cấp tự động: username/email, mật khẩu tạm thời kèm nút Đăng Nhập) và người dùng đã đăng nhập (nút điều hướng về Bàn làm việc).
- [x] **T-03.43** `[TEST]` Bổ sung bộ kiểm thử Frontend Vitest (`page.test.tsx`) kiểm chứng 3 kịch bản: Tra cứu MST tự động điền form, Doanh nghiệp đã đăng nhập tự động điền dữ liệu, Nộp thành công hiển thị tài khoản được cấp.

---

## Phase 11: Delta v5 — Hoàn Thiện Vòng Đời CRUD Bàn Làm Việc Bên Mua (Edit & Close Actions)

- [x] **T-03.44** `[BE]` `[DOMAIN]` Bổ sung phương thức `Update(...)` và `Close()` vào Domain Entity `DemandItem.cs`, tự động tính lại điểm `TniScore` và `TniClassification` qua `TniCalculationEngine`.
- [x] **T-03.45** `[BE]` `[API]` Xây dựng DTO `UpdateDemandItemRequest`, cài đặt endpoint `PUT /api/v1/buyer/demands/{id}` (kiểm tra guard chỉ sửa khi `PENDING` / `DRAFT`) và `POST /api/v1/buyer/demands/{id}/close` trong `DemandController.cs`.
- [x] **T-03.46** `[FE]` Xây dựng component `EditDemandModal.tsx` (`src/components/demand/EditDemandModal.tsx`) nạp dữ liệu bài toán hiện tại, hỗ trợ điều chỉnh 4 chỉ số $K, L, N, O$ hiển thị màu Badge TNI thời gian thực, submit `PUT /api/v1/buyer/demands/{id}`.
- [x] **T-03.47** `[FE]` Cập nhật `src/app/portal/buyer/demands/page.tsx`: Cột Thao tác hiển thị nút [Sửa] (khi `PENDING`), nút [Đóng bài toán] (khi chưa đóng), tích hợp `ConfirmModal` và tab bộ lọc bài toán `CLOSED`.
- [x] **T-03.48** `[TEST]` Bổ sung kiểm thử Unit Test cho `DemandItem` methods và test cases giao diện kiểm chứng hành vi Sửa và Đóng bài toán.

---

## Phase 12: Delta v6 (CR-006) — Tái Cấu Trúc Thứ Tự Tab Khảo Sát & Ràng Buộc Validation

- [x] **T-03.49** `[SPEC]` Ghi nhận Delta CR-006 vào `spec.md` và đồng bộ tài liệu kiến trúc.
- [x] **T-03.50** `[FE]` Tái cấu trúc Stepper Navigation và Form Sections trong `SourceCode/frontend/src/app/khao-sat-nhu-cau/page.tsx`: Đưa Tab E (Nhu Cầu & TNI) lên Bước 2; xếp Tab B, C, D vào các Bước 3, 4, 5.
- [x] **T-03.51** `[FE]` Cập nhật logic `validateStep`: Bắt buộc hoàn tất Bước 1 và Bước 2 (ít nhất 1 bài toán có nội dung); các Bước 3, 4, 5, 6 chuyển thành Optional (cho phép bỏ qua).
- [x] **T-03.52** `[FE]` Hỗ trợ nộp nhanh khảo sát sau khi hoàn thành Bước 1 và Bước 2, cho phép chuyển thẳng sang Bước 7 để ký và nộp.
- [x] **T-03.53** `[TEST]` Cập nhật và bổ sung Vitest trong `page.test.tsx` kiểm chứng thứ tự 7 bước mới, validation bắt buộc Bước 1 & 2, chuyển bước tùy chọn không bị chặn.

---

## Phase 13: Delta v7 (CR-2026-016) — Tự Động Nạp 100% Hồ Sơ Doanh Nghiệp & Đồng Bộ Demo Buyer

- [x] **T-03.54** `[FE]` `[INTEGRATION]` Hoàn thiện cơ chế Auto-Prefill 100% trong `src/app/khao-sat-nhu-cau/page.tsx`: Nạp toàn bộ 11 trường thông tin pháp nhân và người liên hệ từ `fetchMyEnterpriseProfile()` khi có session; hiển thị Alert Banner UX trang trọng; tự động bypass validation Bước 1 cho phép chuyển ngay sang Bước 2.
- [x] **T-03.55** `[FE]` `[COMPONENT]` Cài đặt cơ chế kiểm tra sai khác và hộp thoại xác nhận Đồng bộ ngược 2 chiều (Bi-directional Sync Modal) `BR-03-006`: Cho phép doanh nghiệp cập nhật các thay đổi tại Bước 1 vào hồ sơ gốc `enterprise.enterprises` khi nộp phiếu.
- [x] **T-03.56** `[TEST]` Bổ sung Unit Tests Vitest trong `src/app/khao-sat-nhu-cau/page.test.tsx` kiểm chứng: 100% dữ liệu pháp nhân được nạp đầy đủ khi đã đăng nhập, hiển thị Banner nạp hồ sơ, Bước 1 hợp lệ ngay lập tức và sẵn sàng chuyển Bước 2.
- [x] **T-03.57** `[TEST]` `[E2E]` Viết kịch bản kiểm thử E2E Playwright `test_task03_buyer_prefill_and_demo_e2e.py`: Đăng nhập bằng `buyer.user@demo.nacentech.vn` (mật khẩu `Demo@2026`), mở `/khao-sat-nhu-cau`, xác nhận tự động điền đúng 100% thông tin CÔNG TY TNHH TRƯỜNG HOAN (MST `0100255428`, Hà Nội).


- [x] `TASK-03-CR58` **[CR]** [P1] Test CR Tab 5 TNI — Kiem thu tao CR tu Dashboard
- [x] `TASK-03-CR59` **[CR]** [P1] Sửa nội dung tab form nhập nhu cầu — Các tab khác của nhu cầu , ngoài tab nhu cầu và thồn tin doanh nghiệp, có thể ghộp vào thành tab bổ sung và k bắt buộc, cho doanh nghiệp k điền cũng được

- [x] `TASK-03-CR60` **[CR]** [P1] (Người gửi: Trần Thị B (BA Lead)) Cải tiến giao diện hiển thị tổng mức đầu tư bài toán — Bổ sung tooltip giải thích cơ cấu vốn đầu tư công nghệ cho bài toán nhu cầu

- [ ] `TASK-03-CR61` **[CR]** [P2] (Người gửi: Tester) Test kết nối CR từ Web Portal — Kiểm tra proxy CR qua cổng 3000

---

## Phase 14: Delta v8 (CR-2026-017 / TASK-03-CR59) — Tái Cấu Trúc Form Khảo Sát Nhu Cầu 4 Tab Tinh Gọn

- [x] **T-03.58** `[FE]` `[UI/UX]` Tái cấu trúc Stepper Navigation Bar từ 7 bước xuống 4 tabs tinh gọn: Tab 1 (E. Nhu Cầu & TNI), Tab 2 (A. Doanh Nghiệp), Tab 3 (Thông Tin Bổ Sung), Tab 4 (G. Xác Nhận); cập nhật thanh tiến độ theo công thức `(currentStep / 4) * 100%`, cho phép click tự do giữa 4 tabs.
- [x] **T-03.59** `[FE]` `[COMPONENT]` Hợp nhất 4 phân mục B (Hiện trạng & 8 tiêu chí), C (Điểm nghẽn kỹ thuật), D (Năng lực TAR), F (Định hướng & Hỗ trợ) thành các khối chuyên đề rõ ràng trong Tab 3 (`currentStep === 3`), không làm đứt gãy UX và bảo toàn 100% các trường nhập liệu.
- [x] **T-03.60** `[FE]` `[LOGIC]` Chuẩn hóa logic Navigation & Validation cho 4 bước: Validation bắt buộc tại Tab 1 (ít nhất 1 bài toán), Tab 2 (pháp nhân hợp lệ) và Tab 4 (ký tên & PDPD); Tab 3 hoàn toàn tùy chọn; bổ sung nút fast-track tại Tab 2 chuyển thẳng sang Tab 4; khi submit thất bại tự động focus/cuộn về đúng tab bị thiếu.
- [x] **T-03.61** `[TEST]` Cập nhật bộ kiểm thử Unit Tests Vitest trong `src/app/khao-sat-nhu-cau/page.test.tsx` sang mô hình 4 tabs: kiểm tra tiêu đề và stepper 4 bước, kiểm thử validation Tab 1 & Tab 2, kiểm thử Tab 3 tùy chọn không chặn submit, kiểm thử fast-track từ Tab 2 sang Tab 4, kiểm thử free-click stepper, kiểm thử luồng submit toàn trình.
- [x] **T-03.62** `[TEST]` `[E2E]` Cập nhật kịch bản kiểm thử E2E Playwright `test_task03_buyer_deep_survey_blackbox.py` tương thích hoàn toàn với luồng 4 tabs.

---

## Phase 15: Delta v9 (CR-2026-018) — Làm Mịn Bàn Làm Việc Bài Toán Đổi Mới Công Nghệ & Nâng Cấp Modal

- [x] **T-03.63** `[FE]` `[HEADER]` Chuẩn hóa tiêu đề `/portal/buyer/demands` sang `Bàn Làm Việc Bài Toán Đổi Mới Công Nghệ`, thay badge `TASK-03` bằng `BÊN MUA CÔNG NGHỆ`.
- [x] **T-03.64** `[FE]` `[PAGINATION]` Tích hợp phân trang `pageSize = 5` cho bảng danh sách bài toán, hỗ trợ chuyển trang, hiển thị tổng số và reset trang khi đổi tab lọc.
- [x] **T-03.65** `[FE]` `[MODAL]` Nâng cấp `QuickDemandModal.tsx`: Thêm bộ chọn Target TRL (TRL 1-3, 4-6, 7-9), Checkbox Bảo mật ẩn danh (Confidential Mode), Hạn chót nhận đề xuất (Deadline) và file đính kèm RFP.
- [x] **T-03.66** `[DOC]` `[WIREFRAME]` Đồng bộ Wireframe Basic Design `wireframe_quan_ly_nhu_cau_buyer.html` loại bỏ badge `TASK-03`, thêm phân trang và các trường TRL/Ẩn danh.
- [x] **T-03.67** `[TEST]` `[QC]` Bổ sung Unit Tests kiểm chứng Header sạch dev badge, phân trang hoạt động và Modal có đầy đủ các trường mới; chạy Vitest 100% PASS (5/5 tests green).



---

## Giai Đoạn Delta v1.1: Mở Quyền Đăng Nhu Cầu Cho PUBLIC_USER (CR-TASK-03-DELTA-01)

- [x] **T-03.DEL-01** `[FE]` Cập nhật `handleOpenQuickDemand` tại `nhu-cau-cong-nghe/page.tsx` cho phép `PUBLIC_USER` & `USER`.
- [x] **T-03.DEL-02** `[FE]` Cập nhật thông báo thân thiện cho Guest khi bấm đăng bài toán, dẫn hướng đăng ký/đăng nhập công chúng.
- [x] **T-03.DEL-03** `[FE]` Cập nhật `portal/layout.tsx` bổ sung menu "Bài toán Đã Đăng" (`/portal/buyer/demands`) vào `publicNavItems`.
- [x] **T-03.DEL-04** `[FE]` `[TEST]` Cập nhật và chạy Vitest Unit test (`nhu-cau-cong-nghe/page.test.tsx`, `portal/layout.test.tsx`).
- [x] **T-03.DEL-05** `[QC]` Kịch bản kiểm thử 4 tầng Blackbox Zero-Mock trên CSDL PostgreSQL thật với tài khoản `public.user@demo.nacentech.vn`.


---

## Phase 16: Delta v10 (CR-2026-010) — Triệt Tiêu 100% Mock Số Tĩnh Tại Sàn Nhu Cầu & Tích Hợp `<Async>`

- [x] **T-03.68** `[FE]` Refactor Hero Quick Metrics trong `SourceCode/frontend/src/app/nhu-cau-cong-nghe/page.tsx`:
  - Loại bỏ hoàn toàn 3 khối số liệu tĩnh hardcode `"142"`, `"68.5 tỷ"`, `"24 Giờ"`.
  - Tích hợp hook/fetch `portalClient.getStats()` để nạp động:
    * Khối 1: `totalDemands` (Bài toán đang tìm).
    * Khối 2: Tổng ngân sách mua (tính từ `totalEstimatedValueMillionVnd` hoặc tổng các bài toán thật, định dạng Tỷ / Triệu VNĐ).
    * Khối 3: `totalSuccessfulConnections` (Lượt kết nối thành công & MOU).
  - Bọc khối qua component `<Async>` chuẩn hóa 5 UX States (Loading skeleton pulse, Error retry, Empty 0, Success, Updating).
  - Tiêu chí kiểm chứng:
    - [x] Không còn bất kỳ chuỗi `"142"`, `"68.5"`, `"24 Giờ"` hardcode trong file.
    - [x] Khi API chưa có dữ liệu, hiển thị trung thực `0` hoặc `"0 VNĐ"`.
    - [x] Khi API gặp lỗi, hiển thị khối thông báo kèm nút `[Tải lại số liệu]`.
- [x] **T-03.69** `[FE]` Đồng bộ bộ lọc ngành trên Sàn Tìm Mua sang dùng `getActiveSectors()` từ `master-data-client.ts`, đảm bảo chỉ hiển thị 10 Lĩnh vực chuẩn TT17 (`LV01..LV17`).
  - Tiêu chí kiểm chứng:
    - [x] Bộ lọc nạp động từ `/api/v1/master-data/sectors?activeOnly=true`.
    - [x] Không có mã tiền tố lạ `SEC-*` hay viết tắt tiếng Anh.
- [x] **T-03.70** `[TEST]` Bổ sung Unit Test Vitest trong `SourceCode/frontend/src/app/nhu-cau-cong-nghe/page.test.tsx`:
  - Tiêu chí kiểm chứng:
    - [x] Khẳng định số liệu Hero nạp động từ `portalClient.getStats()`.
    - [x] Khẳng định trạng thái Loading, Empty và Error của Hero Metrics hoạt động chuẩn.
    - [x] Không có fallback ngầm sang số dummy.


---

## Giai Đoạn 6: Delta v1.2 — Quản Lý Đơn Hàng & Tiến Trình Đơn Mua Cho Public User (CR-TASK-03-DELTA-02)

> **Mã CR**: `CR-TASK-03-DELTA-02`  
> **Căn cứ**: Quyết định PO `PO-DEC-20261030-03` & Đặc tả Kỹ thuật `spec.md` Mục 13 (Section Delta v1.2).  
> **Mục tiêu**: Xóa bỏ hoàn toàn đơn hàng mồ côi (Zero Orphaned Orders), quản lý đơn đặt mua sản phẩm thương mại trên Bàn làm việc Bên Mua theo mô hình 2 Tabs độc lập, minh bạch hóa tiến trình qua Stepper 4 bước và dẫn hướng thông suốt từ trang chi tiết sản phẩm.

- [x] **Task 6.1** `[BE/API]` Nâng cấp Client API `services/api/technology-offer.ts` & Xác thực Backend `DemandController.cs`:
  - Mở rộng giao diện `CreateQuickDemandPayload` bổ sung các trường metadata: `offerId?: string`, `offerTitle?: string`, `offerCode?: string`, `isCommercialOrder?: boolean`.
  - Cập nhật hàm `submitQuickDemand`: Tự động trích xuất JWT Access Token qua `authClient.getToken()` và đính kèm Header `Authorization: Bearer <token>` vào request gửi tới `/api/v1/demands/items`.
  - Kiểm tra và đảm bảo endpoint `POST /api/v1/demands/items` tại `DemandController.cs` nhận diện chính xác `Actor.PersonId` để gán vào `demandItem.CreatedBy`, triệt tiêu hoàn toàn đơn hàng không có chủ sở hữu.
  - Tiêu chí nghiệm thu: `AC-ORD-01`, `AC-ORD-02`.

- [x] **Task 6.2** `[FE/Nav]` Cập nhật Sidebar Navigation `publicNavItems` trong `SourceCode/frontend/src/app/portal/layout.tsx`:
  - Đổi nhãn menu trỏ tới `/portal/buyer/demands` thành **`"Đơn hàng & Yêu cầu mua"`** trong danh sách `publicNavItems` (dành cho `PUBLIC_USER` / `USER`).
  - Đảm bảo icon `ShoppingBag` hiển thị chuẩn xác, active state đồng bộ khi truy cập các tab con của Bàn làm việc.
  - Tiêu chí nghiệm thu: `AC-ORD-03`.

- [x] **Task 6.3** `[FE/UI]` Xây dựng Component `OrderTrackingStepper` và Tái Cấu Trúc Bàn Làm Việc 2 Tabs trong `SourceCode/frontend/src/app/portal/buyer/demands/page.tsx`:
  - Tạo mới component `OrderTrackingStepper.tsx` (`src/components/demand/OrderTrackingStepper.tsx`) thể hiện quy trình 4 bước:
    * Bước 1: `SUBMITTED` (Đã gửi đơn / Chờ tiếp nhận)
    * Bước 2: `PROCESSING` (Đang xử lý / Kiểm tra năng lực cung cấp)
    * Bước 3: `NEGOTIATING` (Đang đàm phán hợp đồng / báo giá)
    * Bước 4: `COMPLETED` (Hoàn tất giao dịch / Ký kết)
    * Xử lý hiển thị trực quan các trạng thái ngoại lệ: `CANCELLED` (Đã hủy) và `REJECTED` (Từ chối tiếp nhận).
  - Tái cấu trúc giao diện trang `/portal/buyer/demands` thành 2 Tabs cấp cao:
    * **Tab 1 — "Đơn mua sản phẩm thương mại" (`commercial`)**: Danh sách đơn đặt mua thiết bị/sản phẩm thương phẩm, tích hợp hiển thị trạng thái bằng `OrderTrackingStepper`, hỗ trợ nút Xem chi tiết đơn và Hủy đơn khi đang ở trạng thái `SUBMITTED`.
    * **Tab 2 — "Nhu cầu R&D / Bài toán công nghệ" (`demands`)**: Quản lý toàn bộ bài toán kỹ thuật chuyên sâu từ Khảo sát và Quick Demand, bảo toàn nguyên vẹn hàng 4 KPI Cards, điểm TNI, bộ lọc đa trạng thái và phân trang 5 bản ghi.
  - Hỗ trợ chuyển tab thông qua URL query parameter (ví dụ: `/portal/buyer/demands?tab=commercial`).
  - Tiêu chí nghiệm thu: `AC-ORD-03`, `AC-ORD-04`, `AC-ORD-05`.

- [x] **Task 6.4** `[FE/Modal]` Cập nhật Quick Demand Modal trên `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx`:
  - Trong sự kiện submit form: Đảm bảo truyền đầy đủ JWT Token từ `authClient` và các thông tin định danh sản phẩm (`offer.id`, `offer.title`, `offer.offerCode`).
  - Tại màn hình thông báo gửi thành công (`connectSuccess === true`):
    * Bổ sung nút CTA: **`"Theo dõi đơn hàng trong Workspace →"`** đặt cạnh nút "Hoàn tất & Đóng".
    * Thiết lập hành vi click CTA: Điều hướng người dùng trực tiếp tới `/portal/buyer/demands?tab=commercial` để xem đơn hàng vừa tạo.
  - Tiêu chí nghiệm thu: `AC-ORD-01`, `AC-ORD-03`.

- [x] **Task 6.5** `[Test/Unit]` Viết Bộ Kiểm Thử Unit Test Vitest Cho Client API & Stepper Component:
  - Tạo file kiểm thử `src/services/api/technology-offer.test.ts`:
    * Kiểm chứng `submitQuickDemand` tự động gắn Bearer Token khi user đã đăng nhập.
    * Kiểm chứng truyền đúng metadata sản phẩm (`offerId`, `offerTitle`, `offerCode`).
    * Kiểm chứng xử lý mã lỗi HTTP 401 khi token không hợp lệ hoặc hết hạn.
  - Tạo file kiểm thử `src/components/demand/OrderTrackingStepper.test.tsx`:
    * Kiểm chứng hiển thị đúng 4 bước và nhãn tương ứng.
    * Kiểm chứng bước hiện tại active, các bước trước có tick xanh hoàn thành.
    * Kiểm chứng hiển thị trạng thái `CANCELLED` khi đơn bị hủy.
  - Tiêu chí nghiệm thu: `AC-ORD-01`, `AC-ORD-04`.

- [x] **Task 6.6** `[Test/E2E]` Kịch Bản Kiểm Thử E2E Tự Động Toàn Trình (Playwright):
  - Xây dựng kịch bản kiểm thử luồng end-to-end:
    1. Đăng nhập với tài khoản `PUBLIC_USER` (`public.user@demo.nacentech.vn`).
    2. Truy cập trang chi tiết công nghệ `/chao-ban-cong-nghe/[id]` và mở modal đặt mua.
    3. Điền thông tin và nộp đơn thành công.
    4. Click nút CTA "Theo dõi đơn hàng trong Workspace", xác nhận chuyển hướng đúng `/portal/buyer/demands?tab=commercial`.
    5. Kiểm tra đơn hàng mới xuất hiện tại Tab 1 với mã đơn chuẩn hóa, thông tin sản phẩm chính xác và Stepper hiển thị bước 1 `SUBMITTED`.
    6. Kiểm tra chuyển sang Tab 2 dữ liệu bài toán R&D được cách ly độc lập, không bị ảnh hưởng.
  - Tiêu chí nghiệm thu: `AC-ORD-01`, `AC-ORD-03`, `AC-ORD-04`, `AC-ORD-05`.
