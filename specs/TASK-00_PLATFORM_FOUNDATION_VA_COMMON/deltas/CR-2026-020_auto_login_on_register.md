# Change Request: CR-2026-020 Tự Động Đăng Nhập Sau Khi Đăng Ký Thành Công (Auto-Login On Register)

**CR-ID**: CR-2026-020  
**Epic**: TASK-00_PLATFORM_FOUNDATION_VA_COMMON  
**Status**: SHIPPED  
**Target Version**: 1.16.0  
**Author**: PO kiêm Lead BA (`nacen-po-pm` & `nacen-ba`)  
**Date**: 2026-11-02  
**Shipped Date**: 2026-11-02  
**QC Verification**: 100% Green (9/9 Register Tests Pass, 0 Regressions)  
**Căn cứ pháp lý & Thiết kế cơ sở**: Quyết định PO-DEC-20261102-01 tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 18; Nghị định 13/2023/NĐ-CP (PDPD).  

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)
- **Hiện trạng cũ (Current State / As-Is)**:
  - Khi người dùng hoàn thành biểu mẫu đăng ký thành viên tại `/register`, frontend gọi `POST /api/v1/auth/register`.
  - Backend tạo thành công tài khoản `PUBLIC_USER`, trạng thái `is_active = true`.
  - Frontend xóa sạch toàn bộ form, hiển thị thông báo màu xanh lá: *"Đăng ký thành công! Tài khoản công chúng của bạn đã sẵn sàng để đăng nhập. Thông tin trên form đã được xoá."* kèm nút bấm *"<- Đi đến trang Đăng nhập"*.
  - Người dùng buộc phải rời màn hình, sang `/login` rồi nhập lại toàn bộ Email và Mật khẩu vừa tạo.
- **Vấn đề / Nỗi đau (Friction)**:
  - Gây ma sát lớn (UX Friction), làm gián đoạn hành trình gia nhập của thành viên mới.
  - Tỷ lệ kích hoạt và chuyển đổi onboarding bị giảm sút.
- **Đề xuất mới (Proposed State / To-Be)**:
  - Ngay khi tài khoản được tạo thành công, hệ thống **tự động thiết lập phiên làm việc (Issue/Store JWT Session & User Context)**.
  - Hiển thị Toast thông báo chào mừng nồng nhiệt: *"Đăng ký thành công! Chào mừng bạn gia nhập NacenTech."*
  - Tự động điều hướng an toàn về Trang chủ (`/`) hoặc Không gian cá nhân (`/portal`).
  - Thanh Header lập tức cập nhật trạng thái đã đăng nhập (Hiển thị Avatar, Tên người dùng và Menu tài khoản).
  - Có cơ chế Fallback an toàn nếu bước auto-login gặp sự cố gián đoạn mạng.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Changes)

#### [ADD] REQ-AUTH-008: Tự Động Thiết Lập Phiên Đăng Nhập Sau Khi Đăng Ký
Khi người dùng đăng ký tài khoản thành công qua form đăng ký công chúng (`/register`), hệ thống MUST tự động khởi tạo phiên đăng nhập hợp lệ (JWT Bearer Token và UserContext), lưu trữ an toàn trong LocalStorage của client mà không yêu cầu người dùng phải tự gõ lại mật khẩu tại trang `/login`.

#### [ADD] BR-AUTH-009: Quy Tắc Xử Lý Phiên Làm Việc & Điều Hướng Sau Đăng Ký
1. **Tính nguyên tử (Atomicity)**:
   - Form đăng ký không được xóa trắng dữ liệu trước khi phiên đăng nhập được thiết lập thành công.
   - Nút "Đăng ký thành viên" phải được khóa (disable) và hiển thị spinner trong suốt tiến trình: Giai đoạn 1 (*"Đang tạo tài khoản..."*) $\rightarrow$ Giai đoạn 2 (*"Đang khởi tạo phiên làm việc..."*).
2. **Thiết lập phiên (`authClient.setSession`)**:
   - Client lưu `nacentwin_access_token` và `nacentwin_user_context` với vai trò chuẩn `PUBLIC_USER`, `scopeType = GLOBAL`.
3. **Điều hướng an toàn**:
   - Sử dụng `getRedirectPathByRole(user.role)` để điều hướng. Đối với `PUBLIC_USER`, hệ thống điều hướng về Trang chủ (`/`).
4. **Cơ chế Fallback khi gặp sự cố gián đoạn mạng**:
   - Nếu đăng ký thành công (HTTP 201) nhưng cuộc gọi tự động đăng nhập thất bại do mất kết nối mạng:
     * Hệ thống giữ lại dữ liệu form, không báo lỗi "đăng ký thất bại".
     * Hiển thị thông báo hướng dẫn: *"Tài khoản của bạn đã được tạo thành công! Vui lòng bấm để đăng nhập"* kèm liên kết chuyển hướng sang `/login?registered=true&email=<email>`.

#### [ADD] UI-AUTH-003: Giao Diện Trạng Thái Đăng Ký & Toast Thông Báo
- Không còn hiển thị banner tĩnh bắt người dùng bấm link quay lại trang login khi luồng auto-login hoạt động bình thường.
- Sử dụng `useToast().success("Đăng ký thành công! Chào mừng bạn gia nhập NacenTech.")` để cung cấp phản hồi tích cực.

#### [ADD] TEST-AUTH-004: Bộ Kịch Bản Kiểm Thử E2E & Đối Soát PostgreSQL
- **TC-01 (Happy Path)**: Nhập form hợp lệ $\rightarrow$ Submit $\rightarrow$ Tự động vào `/` $\rightarrow$ Header hiển thị đúng tên $\rightarrow$ CSDL PostgreSQL có `is_active = true`.
- **TC-02 (Boundary - Duplicate Email)**: Email đã tồn tại $\rightarrow$ Chặn, báo lỗi `Email is already in use`, không auto-login, giữ form.
- **TC-03 (Security)**: JWT Token tự sinh hợp lệ, gọi được `GET /api/v1/auth/me`.

---

### 3. Ma Trận Tác Động (Cross-Surface & Cross-Epic Impact)
- **Database Schema Impact**: None. (Bảng `Person` đã hỗ trợ sẵn `isActive = true` và `PlatformRoles.PublicUser`).
- **Backend API Contract Impact**: None. Endpoint `POST /api/v1/auth/register` và `POST /api/v1/auth/login` giữ nguyên 100% hợp đồng API v1.
- **Frontend UI Impact**:
  - `SourceCode/frontend/src/app/(auth)/register/page.tsx`: Cải tiến hàm `handleSubmit`, bổ sung chuỗi liên hoàn auto-login, setSession và điều hướng.
- **Consuming Epics**:
  - `TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME`: Nhận diện phiên đăng nhập ngay khi chuyển về Trang chủ.
  - `TASK-00_PLATFORM_FOUNDATION_VA_COMMON`: Header component cập nhật trạng thái session.

---

### 4. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)
- [ ] **AC-CR-020.1**: Sau khi bấm đăng ký, người dùng không cần nhập lại mật khẩu tại `/login`.
- [ ] **AC-CR-020.2**: LocalStorage có đủ `nacentwin_access_token` và `nacentwin_user_context`.
- [ ] **AC-CR-020.3**: Header trang web lập tức hiển thị avatar/tên người dùng đã đăng nhập.
- [ ] **AC-CR-020.4**: Không xảy ra lỗi đúp (Double submit).
- [ ] **AC-CR-020.5**: Fallback an toàn khi mạng bị ngắt giữa chừng.
