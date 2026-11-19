# BÁO CÁO TOÀN DIỆN 82 TEST CASES & NGHIỆM THU HOTFIX (FULL 82 QC TEST SUITE REPORT)
> **Phân hệ:** `TASK-03_HO_SO_TIM_MUA_BUYER` (Nhu cầu Tìm mua) & `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI` (Kết nối Cung–Cầu & Deal Room)  
> **Quy chuẩn:** Spec Kit Framework, Kỷ luật Zero-Mock, Đối soát CSDL PostgreSQL thật (`Deep DB Verification`), Playwright Chromium  
> **Người thực hiện:** Trưởng ban Kiểm định Chất lượng Độc lập (QC Specialist - `nacen-qc`)  
> **Ngày thực hiện:** 22/10/2026 | **Tình trạng nghiệm thu:** 🟢 **100% PASS GATE 4 (82/82 TEST CASES GREEN — 0 BUG TỒN ĐỌNG)**

---

## I. TỔNG HỢP KẾT QUẢ KIỂM THỬ TOÀN TRÌNH 82 TEST CASES (SAU 3 SPRINTS HOTFIX)

| Giai đoạn Luồng Nghiệp Vụ | Tổng Test Cases | Số Ca ĐẠT (PASS) | Số Ca TRƯỢT (FAIL) | Tỷ Lệ Đạt (%) | Tình Trạng |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Giai đoạn 1: Đăng nhập & Xác thực vai trò** | 12 | 12 | 0 | **100.0%** | 🟢 ĐẠT |
| **Giai đoạn 2: Đăng bài toán nhu cầu & Chỉ số TNI** | 20 | 20 | 0 | **100.0%** | 🟢 ĐẠT |
| **Giai đoạn 3: Thẩm định & Phê duyệt của Cán bộ Sở** | 15 | 15 | 0 | **100.0%** | 🟢 ĐẠT |
| **Giai đoạn 4: Khám phá bài toán & Sàn công khai PDPD** | 17 | 17 | 0 | **100.0%** | 🟢 ĐẠT |
| **Giai đoạn 5: Kết nối nhu cầu, Pipeline Kanban & Deal Room** | 18 | 18 | 0 | **100.0%** | 🟢 ĐẠT |
| **TỔNG CỘNG TOÀN DIỆN 5 GIAI ĐOẠN** | **82** | **82** | **0** | **100.0%** | 🟢 **HOÀN TOÀN ĐẠT CHUẨN XUẤT XƯỞNG** |

---

## II. MA TRẬN 16 BUGS ĐÃ KHẮC PHỤC TRIỆT ĐỂ (VERIFIED FIXED)

| STT | Mã Bug | Mức Độ | Giai Đoạn | Tên Khuyết Tật | Giải Pháp Khắc Phục Đã Kiểm Chứng | Trạng Thái |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **1** | `BUG-AUTH-01` | 🔴 **CRITICAL** | G1 | Bỏ qua token rác trên `GET /buyer/demands` | Gỡ `[AllowAnonymous]`, bắt buộc JWT Token hợp lệ (trả về 401 khi không auth). | 🟢 **FIXED** |
| **2** | `BUG-AUTH-02` | 🔴 **CRITICAL** | G1 | BUYER gọi duyệt bài của Sở | Chặn Role BUYER trên `VerifyDemand`, trả về 403 Forbidden. | 🟢 **FIXED** |
| **3** | `BUG-DMD-01` | 🟡 **MINOR** | G2 | Nút mở modal và phím ESC kẹt | Bổ sung `data-testid="btn-open-quick-demand"`, tối ưu focus ESC trong `QuickDemandModal`. | 🟢 **FIXED** |
| **4** | `BUG-DMD-02` | 🔴 **CRITICAL** | G2 | Lỗ hổng IDOR trên Bàn làm việc Bên Mua | Lọc bắt buộc `CreatedBy == Actor.PersonId` cho vai trò BUYER; chặn khách vãng lai. | 🟢 **FIXED** |
| **5** | `BUG-GOV-01` | 🟠 **MAJOR** | G3 | Bảng `/gov/demands` ẩn khung khi rỗng | Cố định thẻ `<table>` và `<thead>`, hiển thị hàng rỗng `<td colspan="5">` chuẩn `BR-03-004`. | 🟢 **FIXED** |
| **6** | `BUG-GOV-02` | 🟡 **MINOR** | G3 | Lệch nhãn bộ lọc trạng thái Tab | Chuẩn hóa 3 tab theo `BR-03-005`: `Tất cả`, `Chờ duyệt`, `Đã duyệt`. | 🟢 **FIXED** |
| **7** | `BUG-GOV-03` | 🔴 **CRITICAL** | G3 | API `VerifyDemand` mở `[AllowAnonymous]` | Bắt buộc xác thực Cán bộ Sở (`PROVINCIAL_ADMIN` / `SUPER_ADMIN`). | 🟢 **FIXED** |
| **8** | `BUG-GOV-04` | 🔴 **CRITICAL** | G3 | API `AssignExpert` mở `[AllowAnonymous]` | Bắt buộc xác thực Cán bộ Sở, chặn khách ẩn danh tự gán chuyên gia. | 🟢 **FIXED** |
| **9** | `BUG-PUB-01` | 🟡 **MINOR** | G4 | Ô tìm kiếm sàn thiếu placeholder & debounce | Chuẩn hóa placeholder `"Tìm kiếm tên bài toán..."` theo `BR-03-006` và debounce 300ms. | 🟢 **FIXED** |
| **10** | `BUG-PUB-02` | 🔴 **CRITICAL** | G4 | Lộ bài toán `PENDING` ra Sàn công khai | Lọc bắt buộc `Status == DemandItemStatuses.Verified && IsPublicListed` trên API công khai. | 🟢 **FIXED** |
| **11** | `BUG-PUB-03` | 🟡 **MINOR** | G4 | Trùng 2 thẻ `<main>` đồng cấp vi phạm WCAG | Đổi thẻ `<main>` cục bộ thành `<div>` trên trang chi tiết `/nhu-cau-cong-nghe/[id]`. | 🟢 **FIXED** |
| **12** | `BUG-BRK-01` | 🟠 **MAJOR** | G5 | Cột Kanban Pipeline thiếu heading | Đổi tiêu đề cột Kanban từ `<span>` thành `<h3>` chuẩn Semantic HTML. | 🟢 **FIXED** |
| **13** | `BUG-BRK-02` | 🟠 **MAJOR** | G5 | Nhảy cóc trạng thái Kanban vi phạm `BR-BRK-06` | Cài đặt Finite State Machine (FSM) chặt chẽ, từ chối nhảy cóc với lỗi `ERR_INVALID_STATE_TRANSITION`. | 🟢 **FIXED** |
| **14** | `BUG-BRK-03` | 🔴 **CRITICAL** | G5 | API Deal Room mở `[AllowAnonymous]` | Gỡ `[AllowAnonymous]`, bắt buộc JWT Token thành viên hợp lệ mới mở khóa tin nhắn đàm phán. | 🟢 **FIXED** |
| **15** | `BUG-BRK-04` | 🟠 **MAJOR** | G5 | Gửi tin nhắn Deal Room lỗi 400 | Cho phép nullable `SenderName` & `SenderRole`, fallback JWT Claims theo `BR-BRK-07`. | 🟢 **FIXED** |
| **16** | `BUG-BRK-05` | 🟠 **MAJOR** | G5 | Lưu dự thảo MOU lỗi 400 | Hỗ trợ dung sai DTO và tự động điền các điều khoản mẫu (Boilerplate Clauses) theo `BR-BRK-08`. | 🟢 **FIXED** |

---

## III. KẾT LUẬN & KIẾN NGHỊ NGHIỆM THU

1. **Hiệu quả phẫu thuật mã nguồn (Surgical Fix Quality):** Đội ngũ phát triển đã xử lý triệt để 100% các vi phạm kiến trúc, bảo mật (IDOR, RoleGuard, Leakage) và trải nghiệm người dùng theo đúng chỉ đạo của Product Owner (`PO_DEFECT_ANALYSIS_AND_ACTION_PLAN.md`).
2. **Kỷ luật Zero-Mock & Deep DB State:** Toàn bộ 82 Test Cases đã được kích hoạt trên môi trường thực tế (PostgreSQL 16 `nacentech`, API .NET Core net10.0, Frontend Next.js 16 và Playwright Chromium) với tỷ lệ hoàn thành **82/82 PASS (100.0%)**.
3. **Kiến nghị:** Kính trình Product Owner kiêm Project Manager (`nacen-po-pm`) dỡ bỏ Lệnh đóng băng xuất xưởng (Release Freeze) và chính thức **Ký Duyệt Quality Gate 4** để bàn giao phân hệ sang UAT.
