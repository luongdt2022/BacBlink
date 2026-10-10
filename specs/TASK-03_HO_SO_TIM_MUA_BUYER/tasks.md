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
