# BÁO CÁO KIỂM ĐỊNH CHẤT LƯỢNG & SĂN LỖI 4 TẦNG (QC DEFECT AUDIT REPORT)
> **Phân hệ:** `TASK-03_HO_SO_TIM_MUA_BUYER` & `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
> **Quy chuẩn:** Spec Kit Framework, Kỷ luật Zero-Mock, Đối soát CSDL PostgreSQL thật (`Deep DB Verification`)  
> **Người thực hiện:** Trưởng ban Kiểm định Chất lượng Độc lập (QC Specialist - `nacen-qc`)  
> **Ngày thực hiện:** 22/10/2026 | **Phiên bản:** v1.0.0

---

## I. TỔNG QUAN KẾT QUẢ THỰC THI (EXECUTIVE SUMMARY)

| Chỉ Số Đánh Giá | Giá Trị Thực Tế | Tỷ Lệ (%) | Đánh Giá Cổng Chất Lượng Gate 4 |
| :--- | :---: | :---: | :--- |
| **Tổng số kịch bản kiểm thử (Total Test Cases)** | **22** | 100% | Phủ kín 4 tầng và 5 bước hành trình |
| **Số ca ĐẠT (PASS)** | **16** | 72.7% | Happy Path & Validation cơ bản hoạt động |
| **Số ca TRƯỢT (FAIL)** | **6** | 27.3% | Phát hiện nhiều lỗi bảo mật và vi phạm nghiệp vụ |
| **Tổng số Khuyết tật / Lỗi phát hiện (Defects)** | **6 Bugs** | — | **4 CRITICAL, 1 MAJOR, 1 MINOR** |
| **KẾT LUẬN CỦA TRƯỞNG BAN QC** | **FAIL GATE 4** | — | **TỪ CHỐI XUẤT XƯỞNG (DO TỒN TẠI 4 LỖI CRITICAL)** |

---

## II. MA TRẬN KẾT QUẢ THEO 4 TẦNG KIỂM THỬ

| Tầng Kiểm Thử | Số Test Cases | PASS | FAIL | Trọng Tâm Khảo Sát & Kết Quả |
| :--- | :---: | :---: | :---: | :--- |
| **Tầng 1: Control & Input Validation** | 6 | 6 | 0 | Chặn dữ liệu rỗng, format email, biên $K, L, N, O \notin [1..5]$ thành công. |
| **Tầng 2: Màn hình & 5 UX States** | 3 | 3 | 0 | Responsive 3 Viewports tốt, load đủ 10 Lĩnh vực TT17, render tiêu đề chuẩn. |
| **Tầng 3: Nghiệp vụ ẩn & CSDL Deep DB** | 7 | 2 | 5 | Tính toán SSOT TNI đúng; phát hiện 3 lỗ hổng bảo mật cấp cao và 1 lỗi mock ngầm. |
| **Tầng 4: Hành trình E2E 5 Bước** | 6 | 5 | 1 | Luồng E2E 5 bước chạy thông suốt trên UI & DB; phát hiện 1 lỗi DOM trùng thẻ `<main>`. |

---

## III. BẢNG CHI TIẾT 6 KHUYẾT TẬT / BUGS PHÁT HIỆN ĐƯỢC

### 🔴 BUG #01 [CRITICAL]: Rò rỉ dữ liệu bài toán `PENDING` ra sàn công khai
- **Mã kiểm thử:** `TC-DMD-T3-003`
- **Vị trí mã nguồn:** `SourceCode/backend/apps/api/V1Compat/DemandController.cs#L370`
- **Mô tả:** Hàm `GetPublicDemands` (`GET /api/v1/public/demands`) truy vấn bảng `demand.demand_items` mà **hoàn toàn không có bộ lọc** `status == 'VERIFIED'` hoặc `is_public_listed == true`.
- **Hậu quả:** Bài toán vừa tạo ở trạng thái `PENDING` (chưa qua cán bộ Sở phê duyệt) đã ngay lập tức bị niêm yết ra ngoài internet, vi phạm nghiêm trọng quy tắc nghiệp vụ `BR-03-002`.
- **Kỳ vọng:** `query = query.Where(i => i.Status == DemandItemStatuses.Verified && i.IsPublicListed);`
- **Thực tế:** Toàn bộ bản ghi nháp và chờ duyệt đều bị trả về trong JSON công khai.

---

### 🔴 BUG #02 [CRITICAL]: API Phê duyệt của Cán bộ Sở mở toang không phân quyền (`[AllowAnonymous]`)
- **Mã kiểm thử:** `TC-DMD-T3-004`
- **Vị trí mã nguồn:** `SourceCode/backend/apps/api/V1Compat/DemandController.cs#L617` & `L630`
- **Mô tả:** Các endpoint hành chính của Sở KH&CN gồm `POST /api/v1/gov/demands/{id}/verify` và `POST /api/v1/gov/demands/{id}/assign-expert` được gắn attribute `[AllowAnonymous]`.
- **Hậu quả:** Bất kỳ ai trên internet (kể cả khách vãng lai không đăng nhập) đều có thể gửi HTTP POST để tự phê duyệt hoặc gán chuyên gia cho bất kỳ bài toán nào trong hệ thống (Lỗ hổng Broken Object Level Authorization & Missing RoleGuard).
- **Kỳ vọng:** Yêu cầu đăng nhập và có quyền `[Authorize(Roles = $"{PlatformRoles.ProvincialAdmin},{PlatformRoles.SuperAdmin}")]`.
- **Thực tế:** Gửi request không token vẫn nhận phản hồi `200 OK: "Phê duyệt bài toán niêm yết lên sàn thành công."`.

---

### 🔴 BUG #03 [CRITICAL]: Lỗ hổng IDOR làm lộ toàn bộ bài toán nội bộ của mọi doanh nghiệp
- **Mã kiểm thử:** `TC-DMD-T3-005`
- **Vị trí mã nguồn:** `SourceCode/backend/apps/api/V1Compat/DemandController.cs#L261`
- **Mô tả:** API Bàn làm việc Bên Mua `GET /api/v1/buyer/demands` gắn `[AllowAnonymous]` và không lọc theo `CreatedBy == Actor.PersonId`.
- **Hậu quả:** Khách vãng lai hoặc Doanh nghiệp đối thủ có thể xem trộm danh sách bài toán nội bộ, công đoạn lỗi, và điểm TNI của tất cả các doanh nghiệp khác trên sàn.
- **Kỳ vọng:** Bắt buộc `[Authorize(Roles = PlatformRoles.Buyer)]` và lọc `query = query.Where(i => i.CreatedBy == Actor.PersonId);`.
- **Thực tế:** Khách lạ truy vấn lấy được danh sách bài toán của toàn bộ doanh nghiệp.

---

### 🔴 BUG #04 [CRITICAL]: Mock ngầm thông tin Bên Mua bằng dữ liệu tĩnh ('0901234567', 'buyer@company.vn')
- **Mã kiểm thử:** `TC-DMD-T3-006`
- **Vị trí mã nguồn:** `SourceCode/backend/apps/api/V1Compat/DemandController.cs#L705-L707`
- **Mô tả:** Trong phương thức `SubmitSolutionOffer` (`POST /api/v1/public/demands/{id}/offer`), khi tạo bản ghi Cơ hội hợp tác trong bảng `brokerage.opportunities`, backend chèn cứng dữ liệu giả:
  ```csharp
  'Đại diện Bên Mua (PDPD Masked)', '0901234567', 'buyer@company.vn'
  ```
- **Hậu quả:** Vi phạm nghiêm trọng Kỷ luật Zero-Mock. Khi Bên Bán gửi giải pháp, Bên Mua thật không nhận được thông tin vì dữ liệu liên hệ bị gán tĩnh về email và SĐT rác.
- **Kỳ vọng:** Đối soát thông tin Bên Mua thật từ `demand_items.created_by` hoặc hồ sơ pháp nhân liên kết trong `identity.persons` / `enterprise.enterprises`.
- **Thực tế:** Trong PostgreSQL, cột `buyer_contact_phone` luôn bị lưu là `'0901234567'`.

---

### 🟠 BUG #05 [MAJOR]: Vi phạm quy tắc chuyển bước tuần tự Kanban (`BR-BRK-06`)
- **Mã kiểm thử:** `TC-DMD-T3-007`
- **Vị trí mã nguồn:** `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs#L476-L485`
- **Mô tả:** API `PUT /api/v1/brokerage/opportunities/{id}/stage` chỉ kiểm tra xem giá trị `newStage` có nằm trong mảng `validStages` hay không, hoàn toàn không kiểm tra máy trạng thái (State Machine transition logic).
- **Hậu quả:** Người dùng có thể nhảy cóc từ `INITIATED` (Mới tiếp cận) thẳng sang `COMPLETED` (Hoàn thành chuyển giao) mà bỏ qua bước đàm phán và ký kết MOU.
- **Kỳ vọng:** Chặn nhảy cóc với lỗi `400 Bad Request` (`ERR_INVALID_STATE_TRANSITION`).
- **Thực tế:** Cho phép cập nhật thẳng từ `INITIATED` sang `COMPLETED` thành công.

---

### 🟡 BUG #06 [MINOR]: Vi phạm chuẩn ngữ nghĩa HTML5 & WCAG (Trùng 2 thẻ `<main>`)
- **Mã kiểm thử:** `TC-DMD-T4-004-DOM`
- **Vị trí mã nguồn:** `SourceCode/frontend/src/app/nhu-cau-cong-nghe/[id]/page.tsx` lồng trong layout chung
- **Mô tả:** Trang chi tiết bài toán `/nhu-cau-cong-nghe/[id]` render ra 2 thẻ `<main>` đồng cấp trên cùng một trang:
  1. `<main class="flex-1">`
  2. `<main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">`
- **Hậu quả:** Vi phạm chuẩn tiếp cận Accessibility WCAG AA và chuẩn ngữ nghĩa HTML5 (trình đọc màn hình Screen Reader của người khuyết thị bị xung đột landmark).
- **Kỳ vọng:** Chỉ có duy nhất 1 thẻ `<main>` trên tài liệu HTML; các khối bên trong sử dụng thẻ `<section>` hoặc `<div>`.
- **Thực tế:** Playwright Locator báo lỗi `strict mode violation: locator("main") resolved to 2 elements`.

---

## IV. ĐỀ XUẤT HÀNH ĐỘNG KHẮC PHỤC DÀNH CHO DEV (ACTIONABLE REMEDIATIONS)

1. **Vá ngay `DemandController.cs`**:
   - Thêm `query = query.Where(i => i.Status == DemandItemStatuses.Verified && i.IsPublicListed);` vào `GetPublicDemands`.
   - Bỏ `[AllowAnonymous]` tại `GetBuyerDemands`, `VerifyDemand`, `AssignExpert`. Thay bằng `[Authorize]` kèm phân quyền Scoped RBAC.
   - Truy vấn thông tin người tạo bài toán thật (`item.CreatedBy`) trong `SubmitSolutionOffer` thay cho chuỗi tĩnh `'0901234567'`.
2. **Vá `BrokerageControllers.cs`**:
   - Thêm bảng chuyển trạng thái hợp lệ (State Machine transition validation) cho `UpdateOpportunityStage`.
3. **Vá Frontend `[id]/page.tsx`**:
   - Đổi thẻ `<main>` cục bộ thành `<div className="...">` để không xung đột với thẻ `<main>` của Layout cha.
