# BỘ TEST CASE KIỂM THỬ 4 TẦNG & SỰ KIỆN LUỒNG: TASK-05 HỒ SƠ CHUYÊN GIA KH&CN

> **Dự án:** Hệ sinh thái Đổi mới sáng tạo & Chuyển giao công nghệ NacenTech  
> **Phân hệ:** TASK-05 (Hồ Sơ Chuyên Gia KH&CN & AI Scan LLKH)  
> **Quy chuẩn:** Spec Kit Framework & 4-Tier Testing Pyramid (Cấp độ 1: Control/Validation -> Cấp độ 2: Móc xích/5 UX States -> Cấp độ 3: Nghiệp vụ ẩn/DB/RBAC/IDOR -> Cấp độ 4: E2E User Journey & Handoff)  
> **Ngày phê duyệt:** 06/10/2026 | **Phiên bản:** v1.0.0 (Living Test Specification)

---

## I. MÔ HÌNH VÒNG ĐỜI & KIỂM TOÁN SỰ KIỆN (STATE MACHINE & EVENTS)

### 1. Bảng Chuyển Trạng Thái (State Transition Table)
```
[Khởi tạo] 
    └── DRAFT: Người dùng bắt đầu khai báo (Web hoặc Zalo)
         ├── AI_PROCESSING: Khi tải lên CV (OCR & Semantic Extraction)
         ├── AI_PREFILLED: AI trích xuất xong (>= 85% độ chính xác)
         └── PENDING_REVIEW: Chuyên gia tick PDPD & bấm [NỘP HỒ SƠ]
              ├── CHANGES_REQUESTED: Hội đồng/Sở yêu cầu bổ sung
              │    └── PENDING_REVIEW: Chuyên gia cập nhật & nộp lại
              ├── REJECTED: Không đạt tiêu chuẩn khoa học
              └── APPROVED: Hội đồng duyệt -> Cấp Role VERIFIED_EXPERT & Sinh expertCode
                   └── PUBLIC_PUBLISHED: Niêm yết Public Directory (/experts/{expertCode})
```

### 2. Danh Mục Domain Events
1. **`ExpertZaloIntakeReceived`**: Zalo Mini App gửi hồ sơ sơ bộ, sinh `MagicLinkTokenHash` (TTL 72h).
2. **`ExpertAiCvScanCompleted`**: AI bóc tách xong tệp CV, chuyển sang `AI_PREFILLED`.
3. **`ExpertProfileSubmitted`**: Nộp hồ sơ chính thức, khóa form (`BR-EXP-006`), đẩy vào `approval_requests` (`TASK-07`).
4. **`ExpertApprovalDecided`**: Hội đồng ra quyết định (APPROVED / CHANGES_REQUESTED). Cấp quyền `VERIFIED_EXPERT`.
5. **`ExpertDirectoryPublished`**: Niêm yết hồ sơ công khai, kích hoạt URL `/experts/{expertCode}`.

---

## II. MA TRẬN TEST CASE 4 TẦNG CHI TIẾT

### TẦNG 1: KIỂM TRA TỪNG CONTROL, INPUT & VALIDATION ĐƠN LẺ

| Mã Test Case | Màn hình / Control | Dữ liệu đầu vào (Input) | Thao tác | Kết quả kỳ vọng (Expected Output) |
| :--- | :--- | :--- | :--- | :--- |
| **`TC-EXP-T1-001`** | Web B1 / Họ và tên | Để trống ô Họ và tên | Bấm [Tiếp tục: Bước 2] | Hiển thị thông báo lỗi: *"Vui lòng nhập họ và tên đầy đủ."*. Chặn chuyển bước. |
| **`TC-EXP-T1-002`** | Web B1 / CCCD | Soát mã nguồn & giao diện | Tìm trường CCCD | **Tuyệt đối không có trường CCCD** (Tuân thủ triệt để Delta v9 & PDPD Nghị định 13). |
| **`TC-EXP-T1-003`** | Web B1 / Học vị | Chọn học vị trong dropdown | Chọn "TS" / "PGS" / "GS" | Lưu đúng giá trị enum tương ứng (`DOCTOR`, `MASTER`, `ENGINEER_BACHELOR`). |
| **`TC-EXP-T1-004`** | Web B2 / Tệp CV tải lên | File CV mẫu PDF hợp lệ (2.4 MB) | Bấm [Sử dụng CV mẫu] | Tên tệp hiện lên, trạng thái sẵn sàng quét. |
| **`TC-EXP-T1-005`** | Web B2 / Dung lượng file | File dung lượng > 20MB | Kéo thả vào uploader | Báo lỗi giới hạn dung lượng tệp (`BR-EXP-003`). |
| **`TC-EXP-T1-006`** | Web B3 / Năm công bố | Nhập năm công bố > 2026 (VD: 2030) | Bấm [+ Thêm công trình] | Báo lỗi inline: *"Năm công bố không được lớn hơn năm 2026."*. Chặn thêm. |
| **`TC-EXP-T1-007`** | Web B3 / Cam kết PDPD | Bỏ chọn checkbox PDPD | Bấm [Gửi hồ sơ nâng hạng] | Nút submit bị vô hiệu hóa hoặc báo lỗi bắt buộc đồng ý PDPD (`BR-EXP-004`). |

---

### TẦNG 2: MÓC XÍCH GIỮA CÁC CONTROL & 5 TRẠNG THÁI UX

| Mã Test Case | Tên Kịch Bản Móc Xích / UX | Điều Kiện & Thao Tác | Kết Quả Kỳ Vọng (Expected Output) |
| :--- | :--- | :--- | :--- |
| **`TC-EXP-T2-001`** | **Móc xích Học vị $\rightarrow$ Academic Rank** | Chọn Học vị = "GS" hoặc "PGS" | Tự động cập nhật `academicRank = "GS"/"PGS"`, kích hoạt trường chọn năm công nhận. |
| **`TC-EXP-T2-002`** | **Móc xích AI CV Scan $\rightarrow$ Tự điền Form** | Kích hoạt quét AI CV | Thanh tiến trình chạy 0% -> 100%, tự động điền Quá trình công tác, Đơn vị, Học vị, Lĩnh vực và Công trình vào Form. |
| **`TC-EXP-T2-003`** | **UX State: Loading State** | Trong lúc AI đang bóc tách | Hiển thị hiệu ứng loading/progress bar, vô hiệu hóa nút submit chống duplicate click. |
| **`TC-EXP-T2-004`** | **UX State: Empty State** | Mở wizard khi chưa có hồ sơ nào | Hiển thị Wizard trống ở Bước 1, stepper sẵn sàng cho người dùng nhập liệu. |
| **`TC-EXP-T2-005`** | **UX State: Success State** | Gửi hồ sơ thành công | Chuyển sang màn hình xác nhận, hiển thị trạng thái `PENDING_REVIEW` với huy hiệu vàng. |
| **`TC-EXP-T2-006`** | **UX State: Error State** | Server lỗi 500 hoặc mất mạng | Component `<Async>` bắt lỗi mạng, hiển thị thông báo lỗi rõ ràng, giữ nguyên form không làm mất dữ liệu người dùng. |

---

### TẦNG 3: NGHIỆP VỤ ẨN, BẤT BIẾN CSDL & BẢO MẬT (3D RBAC / IDOR / PDPD)

| Mã Test Case | Loại Kiểm Định | Thao Tác Kiểm Thử Chuyên Sâu | Kết Quả Kỳ Vọng (Expected Output) |
| :--- | :--- | :--- | :--- |
| **`TC-EXP-T3-001`** | **Khóa Chỉnh Sửa Khi Chờ Duyệt (`BR-EXP-006`)** | Hồ sơ đang `PENDING_REVIEW`, truy cập form | Form chuyển sang chế độ Read-only hoặc thông báo hồ sơ đang thẩm định, chặn sửa. |
| **`TC-EXP-T3-002`** | **Bảo Vệ PII Trên Public Directory (`BR-EXP-021`)** | Truy cập `/experts/{expertCode}` khi chưa đăng nhập | Hiển thị hồ sơ công khai, **tuyệt đối không hiển thị** SĐT, Email cá nhân, địa chỉ nhà riêng hay tài khoản ngân hàng. |
| **`TC-EXP-T3-003`** | **Bảo Mật RoleGuard (/portal/expert/profile)** | Đăng nhập tài khoản `PUBLIC_USER` truy cập trang quản trị chuyên gia | Bị chặn và điều hướng về trang chủ hoặc yêu cầu nâng hạng. |
| **`TC-EXP-T3-004`** | **Zalo Magic Link Prefill (`BR-EXP-009`)** | Mở `/profile/upgrade/expert?draftToken=SAMPLE_TOKEN` | Tự động nạp thông tin sơ bộ từ Zalo (Họ tên, SĐT, Đơn vị, Ngành) vào Bước 1. |

---

### TẦNG 4: HÀNH TRÌNH E2E XUYÊN MÀN HÌNH (CROSS-SURFACE JOURNEY)

| Mã Test Case | Hành Trình Toàn Trình | Các Bước Thực Hiện | Điểm Kiểm Chứng Cuối Cùng |
| :--- | :--- | :--- | :--- |
| **`TC-EXP-T4-001`** | **Toàn Trình Nâng Hạng Chuyên Gia** | 1. Đăng nhập tài khoản `PUBLIC_USER`<br>2. Vào Wizard Bước 1 -> Nhập thông tin hợp lệ -> Tiếp tục<br>3. Bước 2: Tải CV mẫu, bấm quét AI CV -> Hoàn tất bóc tách -> Tiếp tục<br>4. Bước 3: Kiểm tra công trình, tick cam kết PDPD & Lời thề trung thực -> Bấm [Gửi hồ sơ]<br>5. Màn hình chuyển sang xác nhận hồ sơ `PENDING_REVIEW`. | Giao dịch nộp hồ sơ thành công 100%, không phát sinh lỗi ngoại lệ hay vỡ giao diện. |
| **`TC-EXP-T4-002`** | **Toàn Trình Phê Duyệt TASK-07** | 1. Đăng nhập tài khoản `SUPER_ADMIN`<br>2. Truy cập `/admin/approvals`<br>3. Tìm hồ sơ chuyên gia đang chờ duyệt -> Bấm Duyệt hồ sơ. | Hồ sơ chuyển sang `APPROVED`, quyền tài khoản nâng lên `VERIFIED_EXPERT`. |
| **`TC-EXP-T4-003`** | **Truy Cập Danh Bạ Công Khai** | Mở URL `/experts/CG-NACEN-DEMOIT01` ở chế độ Public | Render đầy đủ 5 tabs chuyên môn, thông tin học thuật hiển thị rõ ràng và an toàn dữ liệu. |
