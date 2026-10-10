# Danh Sách Nhiệm Vụ Triển Khai (Implementation Tasks)
# TASK-09: ĐÁNH GIÁ TRÌNH ĐỘ & NĂNG LỰC CÔNG NGHỆ SẢN XUẤT (TT17)

> **Mã Epic**: `TASK-09_DANH_GIA_TRINH_DO_NANG_LUC_CONG_NGHE_TT17`  
> **Trạng thái**: 🟢 Đã hoàn thành 100% (Shipped & Verified) — Đạt chuẩn Quality Gate 4 & 5

---

### Phase 1: Hợp Đồng DTOs & Domain Engine Backend [CONTRACT][BE]
- [x] T-09.1 [CONTRACT] Định nghĩa cấu trúc DTOs (`Tt17AssessmentDto`, `Tt17SurveyDataDto`, `Tt17ScoreResultDto`, `CriterionScoreDto`) trong `NacenTech.Contracts`.
- [x] T-09.2 [BE] Nâng cấp Domain Entity `Tt17Assessment` trong `NacenTech.Modules.Assessment` hỗ trợ đầy đủ SurveyData (6 bước) và ScoreResult.
- [x] T-09.3 [BE] Hoàn thiện thuật toán tính điểm `Tt17ScoringEngine`: tính chính xác 26 tiêu chí, tổng điểm $\tau$, hệ số $T_{ĐB}$, xếp loại 4 cấp và bóc tách danh sách điểm nghẽn.
- [x] T-09.4 [BE] Viết bộ Unit Tests xUnit cho `Tt17ScoringEngine` bao phủ 100% các quy tắc `BR-09-001` $\rightarrow$ `BR-09-004` (kể cả biên điểm âm, điểm 0, lệch pha).
- [x] T-09.5 [BE] Xây dựng các UseCases và Controller API `/api/v1/assessments/tt17` (current, history, draft, calculate, submit, review).
- [x] T-09.6 [BE] Cấu hình EF Core Mapping Hybrid JSONB và kiểm tra lưu/đọc dữ liệu với Postgres Container.

---

### Phase 2: Frontend 4 Màn Hình Chuyên Sâu [FE]
- [x] T-09.7 [FE] Xây dựng Service Client & Types `src/services/api/assessment-tt17.ts` kết nối với API backend.
- [x] T-09.8 [FE] Xây dựng Màn 1: Dashboard Trung Tâm & Lịch Sử Đánh Giá (`/assessments/tt17`).
- [x] T-09.9 [FE] Xây dựng Màn 2: Form Wizard Kê Khai Phụ Lục I (6 Bước) + Sticky Realtime Calculator & Radar Chart (`/assessments/tt17/wizard`).
- [x] T-09.10 [FE] Xây dựng Màn 3: Báo Cáo Phân Tích Chi Tiết & Điểm Nghẽn Công Nghệ (`/assessments/tt17/[id]/report`) có nút liên thông sang `TASK-03`.
- [x] T-09.11 [FE] Xây dựng Màn 4: Cổng Thẩm Định Hồ Sơ Của Sở KH&CN (`/gov/assessments/tt17`) theo địa bàn.
- [x] T-09.12 [FE] Chuẩn hóa 5 UX States qua `<Async>`, kiểm tra 100% không vi phạm token `blue-*` và font chữ $\ge$ 12px.

---

### Phase 3: Kiểm Thử Toàn Diện & Quality Gate 4 [QC]
- [x] T-09.13 [QC] **Tầng 1 (Unit Test)**: Chạy toàn bộ Unit Tests của Engine tính điểm đạt 100% Pass (5/5 tests xUnit).
- [x] T-09.14 [QC] **Tầng 2 (Contract Test)**: Kiểm tra tương thích schema DTO giữa BE và FE qua test suite `test_task09_technology_assessment_tt17_blackbox.py`.
- [x] T-09.15 [QC] **Tầng 3 (Integration Test)**: Kiểm thử luồng Lưu nháp $\rightarrow$ Nộp Snapshot bất biến trong DB $\rightarrow$ Sở KH&CN thẩm định APPROVE.
- [x] T-09.16 [QC] **Tầng 4 (Playwright E2E Black-box)**: Viết và chạy kịch bản E2E kiểm thử toàn trình qua 4 màn hình (100% PASS trong 18s).
- [x] T-09.17 [INT] Cập nhật Living Docs, `ROADMAP.md` và trình nghiệm thu Gate 5.
