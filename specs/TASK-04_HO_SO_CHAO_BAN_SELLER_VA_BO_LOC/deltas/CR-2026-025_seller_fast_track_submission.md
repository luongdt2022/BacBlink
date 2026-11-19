# Change Request: CR-2026-025 Hoàn Thiện Cơ Chế Nộp Nhanh Fast-Track Hồ Sơ Chào Bán (Seller Fast-Track Submission Enhancement)

**CR-ID**: CR-2026-025  
**Epic**: TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC  
**Status**: COMPLETED / SHIPPED  
**Target Version**: 1.12.0  
**Người đề xuất**: Trưởng ban Kiểm định Chất lượng Độc lập (`nacen-qc`)  
**Người điều phối & phê duyệt**: Product Owner kiêm Project Manager (`nacen-po-pm`)  
**Ngày hoàn thành**: 2026-11-04  
**Căn cứ**: Biên bản kiểm thử Black-box thực tế ngày 04/11/2026; Hiến pháp Quản lý Đặc tả `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.  

---

### 1. Bối Cảnh & Vấn Đề (Why)

- **Hiện trạng trước sửa đổi (As-Is Finding)**:
  - Trên màn hình tạo hồ sơ chào bán dành cho Seller (`/portal/seller/technologies/create`), tại **Bước 1 (Thông tin bắt buộc)**, nút `[Gửi chờ duyệt ngay (Fast-Track)]` khi nhấn trực tiếp lúc chưa hoàn thiện Bước 1 sẽ mở modal xác nhận mà không có validation chặn trước.
  - Khi người dùng bấm xác nhận trong modal, hàm `handleSubmitReview` bị chặn bởi validation Bước 1 nhưng modal không đóng, không hiển thị lỗi bên trong modal, khiến người dùng lầm tưởng nút bị đơ/chết (silent dead-click).
  - Khi gọi `createSellerOffer`, hàm trả về `{ success: false, message }` nhưng component không throw error nếu API thất bại, dẫn đến xử lý trạng thái thiếu nhất quán.

---

### 2. Chi Tiết Thực Thi Kỹ Thuật (To-Be Implementation)

#### 2.1. Phía Frontend & Modal Component
1. **`SourceCode/frontend/src/components/seller/FastTrackSubmitModal.tsx`**:
   - Bổ sung prop `errorMessage?: string | null`.
   - Hiển thị hộp cảnh báo màu đỏ (`AlertCircle`) ngay bên trong modal nếu phát sinh lỗi trong quá trình nộp hồ sơ, loại bỏ hoàn toàn hiện tượng nút đơ không phản hồi.
2. **`SourceCode/frontend/src/app/portal/seller/technologies/create/page.tsx`**:
   - Triển khai hàm `handleOpenFastTrackModal`:
     - Kiểm tra `validateStep1()`.
     - Nếu Bước 1 chưa hợp lệ: Chặn mở modal, cuộn trang lên đầu, hiển thị thông báo lỗi rõ ràng: *"Vui lòng hoàn thiện các trường bắt buộc ở Bước 1 trước khi gửi hồ sơ Fast-Track."*
     - Nếu Bước 1 hợp lệ: Mở `FastTrackSubmitModal`.
   - Cập nhật toàn bộ các nút kích hoạt Fast-Track (tại Topbar, Bước 1, Bước 2, Bước 3) sang sử dụng `handleOpenFastTrackModal`.
   - Trong `handleSubmitReview`: Xử lý kiểm tra kết quả `res.success` từ `createSellerOffer`, nếu thất bại thì throw error và hiển thị thông báo lỗi vào modal.

---

### 3. Kiểm Thử & Nghiệm Thu (Quality Gate 4 Verification)

| STT | Tầng kiểm thử | Kịch bản kiểm thử | Kết quả |
| :---: | :---: | :--- | :---: |
| **1** | **Unit / Component Test** | Chạy Vitest trên `page.test.tsx` kiểm tra: (1) Chặn mở modal khi Bước 1 thiếu trường; (2) Mở modal khi Bước 1 hợp lệ; (3) Đồng bộ Sở KH&CN tiếp nhận thẩm định. | **7/7 PASS (100%)** |
| **2** | **Black-box E2E Test** | `tmp/test_fast_track_local.py`: Đăng nhập Seller $\rightarrow$ Bấm Fast-Track khi form trống (bị chặn & báo lỗi) $\rightarrow$ Điền Bước 1 $\rightarrow$ Bấm Fast-Track $\rightarrow$ Xác nhận trong modal $\rightarrow$ Gọi API `POST /api/v1/portal/seller/technologies` $\rightarrow$ Redirect về danh sách Seller với trạng thái `PENDING`. | **100% PASS** |
| **3** | **Data Persistence & Isolation** | Bản ghi hồ sơ mới lưu thành công trong CSDL, mang mã hồ sơ `PENDING`, không rò rỉ ra trang công khai trước khi có phê duyệt của Sở KH&CN. | **PASS** |
