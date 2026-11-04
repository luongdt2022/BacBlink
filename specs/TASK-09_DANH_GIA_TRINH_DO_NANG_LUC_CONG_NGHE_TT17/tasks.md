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

---

### Phase 4: Delta Khảo Sát Public Intake & Tự Động Cấp Tài Khoản Doanh Nghiệp [DELTA-TT17]
- [x] T-09.18 [FE] Cập nhật Form Wizard (`/assessments/tt17/wizard`): Mở truy cập Public không bắt buộc đăng nhập, bổ sung các trường bắt buộc Mục A (Người liên hệ, Email, Số điện thoại) và thông báo cấp tài khoản sau khi nộp.
- [x] T-09.19 [FE] Cập nhật Hub Trung Tâm (`/assessments/tt17`): Triệt tiêu mock data khi chưa đăng nhập hoặc chưa có hồ sơ; hiển thị Hero Banner Khảo Sát Tự Chẩn Đoán + CTA lớn *"Bắt Đầu Kê Khai Khảo Sát"*.
- [x] T-09.20 [BE] Nâng cấp Controller Endpoint `POST /api/v1/assessments/tt17/submit`: Kiểm tra MST và tự động tạo mới `EnterpriseProfile` + tài khoản Doanh nghiệp `ENTERPRISE` khi nộp bài vãng lai (Auto-Provisioning).
- [x] T-09.21 [FE] Bổ sung Widget Card liên kết *"Đánh Giá Trình Độ & Năng Lực Công Nghệ (TT17)"* tại trang Hồ Sơ Doanh Nghiệp (`/portal/enterprise/profile`).
- [x] T-09.22 [QC] Kiểm thử luồng toàn trình: Mở Wizard vãng lai $\rightarrow$ Nhập thông tin & tính điểm $\rightarrow$ Submit bài $\rightarrow$ Kiểm chứng tự động tạo tài khoản DN & chuyển sang trang Báo cáo (Đạt chuẩn 100% Pass Vitest & xUnit).

---

### Phase 5: Delta Đồng Bộ Form Nhu Cầu & Zero-Mock 26 Tiêu Chí [DELTA-TT17-V2]
- [x] T-09.23 [FE] Cập nhật `src/services/api/assessment-tt17.ts`: Chuẩn hóa `calculateLocalScore`, loại bỏ hardcode `s08 = 4.0đ`, tự động tính toán tốc độ tăng năng suất lao động từ `financialSeries` và tỷ lệ nhân lực R&D khớp 100% với backend.
- [x] T-09.24 [FE] Cập nhật `src/app/(portal)/assessments/tt17/wizard/page.tsx`: Thêm hook `useEffect` nạp `fetchMyEnterpriseProfile()` từ CSDL khi có session đăng nhập, tự điền Mục A và hiển thị banner xanh ngọc.
- [x] T-09.25 [FE] Cập nhật `src/app/(portal)/assessments/tt17/wizard/page.tsx`: Bổ sung nút *"Tra cứu MST"* và sự kiện `Enter` gọi `lookupTaxCode(taxCode)` từ `@/lib/enterprise-client`, tự động điền Tên DN, Tỉnh thành, Địa chỉ.
- [x] T-09.26 [FE] Cập nhật `src/app/(portal)/assessments/tt17/wizard/page.tsx`: Bổ sung Modal chúc mừng và hiển thị tài khoản doanh nghiệp được cấp tự động (Email, Mật khẩu tạm thời, Nút Đăng nhập ngay, Nút Xem Báo cáo Phụ lục IV).
- [x] T-09.27 [QC] Bổ sung Unit & Integration test cases trong `src/test/assessment-tt17.test.tsx` kiểm thử 4 cơ chế mới, chạy đạt 100% PASS.

---

### Phase 6: Delta v3 — Tái Cấu Trúc Form Kê Khai Phụ Lục I Theo "Phiếu Thu Thập Thực Tế" & Tích Hợp Định Mức 23 Nhóm Ngành [DELTA-TT17-V3]
- [x] T-09.28 [SPEC] Hoàn thiện tài liệu `spec.md` & `BASIC_DESIGN_NACENTECH.md` bổ sung `REQ-09-010`, `REQ-09-011`, `BR-09-009` và Cross-Surface Impact Matrix.
- [x] T-09.29 [DB] Tạo script migration CSDL `master_industry_benchmarks.sql` chứa đầy đủ bảng `assessment.industry_benchmarks` và 23 bản ghi seed data C.10 $\rightarrow$ C.32 từ sheet `Nhóm ngành`.
- [x] T-09.30 [BE] Nâng cấp `Tt17ScoringEngine` trên Backend (.NET) ánh xạ toàn bộ công thức `Bảng khảo sát` và hệ số $K_{chuẩn 1 \rightarrow 4}$, xử lý an toàn mẫu số bằng 0 theo `BR-09-009`.
- [x] T-09.31 [BE] Viết bộ Unit Tests xUnit cho `Tt17ScoringEngine` bao phủ các ca biên (Gbd=0, Mtt=0, Gdt=0) và kiểm chứng tính toán đúng 26 tiêu chí.
- [x] T-09.32 [FE] Cập nhật TypeScript types & `calculateLocalScore()` trong `assessment-tt17.ts` tích hợp bộ hằng số 23 ngành, đồng bộ 100% với Backend.
- [x] T-09.33 [FE] Tái cấu trúc `AssessmentWizardPage` (`/assessments/tt17/wizard/page.tsx`): 6 bước thân thiện theo `Phiếu thu thập`, Financial Grid 3 năm, Tooltips kế toán dẫn chiếu BCTC, 5 UX states.
- [x] T-09.34 [QC] Viết và thực thi test suite kiểm thử toàn diện (Vitest Unit, DB Integration, Playwright E2E) đối soát điểm số 1:1 với Excel `Bảng khảo sát`.
- [x] T-09.35 [INT] Trình nghiệm thu Gate 5 (`po-gate`), cập nhật `ROADMAP.md` và `TRACEABILITY.md`.

---

### Phase 7: Quản Trị Bản Ghi Phiếu & Xuất Văn Bản DOCX Khảo Sát Thực Địa [CR-2026-021]
- [x] T-09.21 [FE] Tạo 2 file template DOCX mẫu trắng chuẩn A4 hành chính (`phieu_thu_thap_tt17_mau_trang.docx` và `phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx`) lưu tại `SourceCode/frontend/public/templates/surveys/`.
- [x] T-09.22 [FE] Xây dựng module/service sinh file Word (.docx) điền dữ liệu thực của DN (`SourceCode/frontend/src/services/survey-docx-exporter.ts`) bao gồm Phiếu TT17 (bảng 26 tiêu chí, xếp loại) và Phiếu Nhu cầu DNNVV.
- [x] T-09.23 [FE] Cập nhật menu Admin Sidebar trong `SourceCode/frontend/src/app/admin/layout.tsx` (Mục 1 TRUNG TÂM ĐIỀU HÀNH, link `/admin/assessments/records`, badge "Bản ghi DN").
- [x] T-09.24 [FE] Xây dựng trang `/admin/assessments/records/page.tsx` chuẩn 5 UX States qua `<Async>`, bộ lọc 34 tỉnh thành, loại phiếu, tìm kiếm MST/Tên DN, nút tải template trắng và nút xuất file Word từng dòng.
- [x] T-09.25 [Test] Viết Unit Test & Playwright E2E kiểm chứng tải file DOCX thật. Đã hoàn thành 100% Pass bộ test 4 tầng (Vitest 21/21 tests, Playwright E2E 9/9 tests).





---

### Phase 8: Chuẩn Hóa Bộ Tam Hợp Phiếu Khảo Sát & Đánh Giá Doanh Nghiệp Thực Địa [CR-2026-026]
- [x] T-09.26 [FE] Cập nhật giao diện Header trang `/admin/assessments/records/page.tsx`: Mở rộng từ 2 nút lên cụm 3 nút tải mẫu Word (.docx) chuẩn A4 (TT17 màu Cyan, ĐMST 43Q màu Violet/Purple, Nhu cầu DNNVV màu Teal/Emerald).
- [x] T-09.27 [FE] Cập nhật dropdown `surveyTypeFilter` 4 lựa chọn (`ALL`, `TT17`, `INNOVATION`, `SME_DEMAND`).
- [x] T-09.28 [FE] Cài đặt logic Bộ lọc điều kiện động (Dynamic Context Filtering) cho cột 3: Hoán đổi tiêu đề và options theo ngữ cảnh (Xếp loại TT17 / Phân tầng ĐMST 8 nhóm / Cấp độ TNI).
- [x] T-09.29 [FE] Cập nhật hàm reset filters và phân loại bản ghi để bảo toàn tương thích đa nguồn.
- [x] T-09.30 [QC] Viết & chạy bộ kiểm thử Unit Test Vitest (`page.test.tsx`) và kịch bản Playwright E2E kiểm tra cả 3 nút tải file Word và chuyển đổi bộ lọc. (Đạt 8/8 Vitest tests pass 100%, 11/11 E2E tests pass 100%).

---

### GIAI ĐOẠN 8: CR-2026-027 — CHUẨN HÓA DỮ LIỆU BẢN GHI PHIẾU NHU CẦU DNNVV & XUẤT WORD (.DOCX) ĐỘNG

- [x] T-09.31 [BA/PO] Cập nhật Basic Design, soạn thảo Delta Spec `CR-2026-027.md`, cập nhật `spec.md` và `plan.md`.
- [x] T-09.32 [BE] Cập nhật `DemandController.cs`: Projection `items` vào DTO trả về của API `GET /api/v1/gov/demands/surveys`, fallback đồng bộ `tniScore` từ `items.Max(i => i.TniScore)` và gán `tniClassification`. (Đã test curl endpoint live: SUR-20261104-B12C06 trả TNI=86, VERY_HIGH, items=[AI Vision]).
- [x] T-09.33 [FE] Cập nhật `assessment-tt17.ts`: Khai báo interface `DemandSurveyDetailItem` và cập nhật `DemandSurveyItem` chứa `items?: DemandSurveyDetailItem[]`.
- [x] T-09.34 [FE] Cập nhật `records/page.tsx`: Nâng cấp Modal "Xem chi tiết" bóc tách toàn diện 7 khối thông tin (`items`, `surveyDetails`, máy móc, 8 tiêu chí, nhân lực, năng lực hấp thụ, định hướng).
- [x] T-09.35 [FE] Cập nhật `records/page.tsx`: Cột "ĐIỂM TT17 / XẾP LOẠI" hiển thị đúng điểm TNI (86) và xếp loại cấp thiết; đổi nhãn nút từng dòng thành `Xuất Word (.docx)`.
- [x] T-09.36 [FE] Cập nhật `survey-docx-exporter.ts`: Triển khai generator `exportDemandSmeDocx` nạp 100% dữ liệu thực tế từ `DemandSurveyItem` xuất file Word A4 chuẩn OpenXML.
- [x] T-09.37 [QC] Viết kịch bản kiểm thử Vitest & Playwright E2E: Verify API trả về `items`, verify modal 7 phần hiển thị dữ liệu, click xuất Word và giải nén kiểm tra nội dung file XML trong file DOCX. Đã hoàn thành 100% Pass: Vitest 11/11 tests pass, Playwright E2E 12/12 tests pass.
- [x] T-09.38 [QA/PO] Shadow Audit Zero-Mock, nghiệm thu evidence và ký Quality Gate 5 đóng CR-2026-027. Đã đối soát CSDL PostgreSQL thật, API live, xuất XML DOCX thật và biên bản nghiệm thu.

