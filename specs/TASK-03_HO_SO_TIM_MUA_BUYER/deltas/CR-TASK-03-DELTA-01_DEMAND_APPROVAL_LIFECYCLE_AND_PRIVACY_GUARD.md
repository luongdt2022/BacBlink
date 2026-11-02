# Change Request: CR-TASK-03-DELTA-01 Chuẩn Hóa Vòng Đời Trạng Thái Bài Toán Nhu Cầu, Thẩm Định Sở KH&CN & Rào Chắn Quyền Riêng Tư (PDPD Preview Guard)

**CR-ID**: CR-TASK-03-DELTA-01  
**Phân hệ chủ quản**: `TASK-03_HO_SO_TIM_MUA_BUYER`  
**Phân hệ phối hợp**: `TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN` (Cổng công vụ `/gov/demands`), `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
**Trạng thái**: `SHIPPED` (Ký duyệt nghiệm thu Gate 5 bởi PO ngày 02/11/2026)  
**Phiên bản mục tiêu (Target SemVer)**: `1.14.0`  
**Tác giả**: Product Owner kiêm Senior BA NacenTech (`nacen-po-pm`)  
**Ngày ban hành**: 02/11/2026  
**Căn cứ pháp lý & Thiết kế cơ sở**:
- Quyết định `PO-DEC-20261102-04` tại [`Specification/BASIC_DESIGN_NACENTECH.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/BASIC_DESIGN_NACENTECH.md) Mục 22.
- Hiến pháp Quản trị Đặc tả Spec Kit tại [`SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md).
- Nghị định 13/2023/NĐ-CP của Chính phủ về Bảo vệ Dữ liệu Cá nhân (PDPD).
- Quy chế vận hành sàn giao dịch công nghệ điện tử NacenTwin ban hành theo Quyết định Ban Quản lý Đổi mới sáng tạo.

---

## 1. Tuyên Bố Thay Đổi (Change Statement & Căn Cứ PO)

### 1.1. Hiện trạng Cũ (As-Is / Current State)
- Khi Doanh nghiệp hoặc Khách hàng đại chúng (`PUBLIC_USER`, ví dụ `public1`) đăng bài toán nhu cầu kỹ thuật qua API `POST /api/v1/demands/items`, CSDL lưu đúng `Status = 'PENDING'` và `IsPublicListed = false`.
- Tuy nhiên:
  1. Trên giao diện chi tiết bài toán ([`SourceCode/frontend/src/app/nhu-cau-cong-nghe/[id]/page.tsx`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/SourceCode/frontend/src/app/nhu-cau-cong-nghe/[id]/page.tsx#L309)), trạng thái đang bị **hardcode** cố định nhãn `{isCommercialOrder ? "ĐƠN MUA HÀNG THƯƠNG MẠI" : "ĐANG MỞ TÌM CUNG"}` mà hoàn toàn không đọc trường `item.status`.
  2. Người tạo bài toán khi mở xem lại không thấy bất kỳ thông báo hay Banner nào cho biết bài toán đang trong quy trình chờ Cán bộ Sở KH&CN thẩm định.
  3. Người dùng không rõ đơn vị / tài khoản nào có trách nhiệm phê duyệt bài toán này.
  4. Endpoint API [`GET /api/v1/public/demands/{id}`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/SourceCode/backend/apps/api/V1Compat/DemandController.cs#L629) dùng `[AllowAnonymous]` và trả về toàn bộ dữ liệu của bài toán `PENDING` cho bất kỳ ai truy cập, không có rào chắn bảo vệ bản nháp (Draft/Pending Preview Guard) cho chính chủ sở hữu theo chuẩn PDPD.

### 1.2. Hậu quả & Nỗi đau Nghiệp vụ (Business Friction & Pain Points)
1. **Gây hiểu lầm nghiêm trọng về trạng thái niêm yết**: Người dùng tưởng bài toán đã được mở công khai tìm cung trong khi trên thực tế nó đang nằm ở trạng thái chờ duyệt trong CSDL và chưa xuất hiện trên Sàn.
2. **Thiếu cơ chế tương tác và hướng dẫn người dùng**: Người đăng không biết bước tiếp theo phải làm gì, ai sẽ duyệt bài toán của mình.
3. **Rủi ro rò rỉ thông tin trước khi thẩm tra**: Bất kỳ người dùng vãng lai nào có link UUID đều có thể xem bài toán đang chờ duyệt và form chào giải pháp vẫn mở, gây rác dữ liệu chào bán cho các bài toán chưa được kiểm chứng.

### 1.3. Đề Xuất Thay Đổi Chuẩn Hóa (To-Be / Proposed State)
1. **Làm rõ thẩm quyền phê duyệt**: Mọi bài toán nhu cầu khởi tạo mới (`status = 'PENDING'`) tự động chuyển về phân hệ Cán bộ Quản lý Nhà nước tại Cổng `/gov/demands`. Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN` tại địa bàn) hoặc Quản trị viên (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`) có thẩm quyền bấm "Phê duyệt & Niêm yết" (chuyển sang `VERIFIED` và `IsPublicListed = true`) hoặc "Gán chuyên gia" tư vấn 1-1.
2. **Xóa bỏ hoàn toàn mã hardcode hiển thị trạng thái**: Trang chi tiết `/nhu-cau-cong-nghe/[id]` đọc trực tiếp `item.status` và hiển thị đúng 4 Badge:
   - `PENDING`: Badge vàng hổ phách `CHỜ SỞ KH&CN THẨM ĐỊNH`.
   - `VERIFIED`: Badge xanh lục `ĐANG MỞ TÌM CUNG`.
   - `CONNECTED`: Badge xanh dương `ĐÃ KẾT NỐI CUNG - CẦU`.
   - `CLOSED`: Badge xám `ĐÃ ĐÓNG HỒ SƠ`.
3. **Bổ sung Banner cảnh báo cho Chủ bài toán**: Khi `item.status === 'PENDING'`, hiển thị Banner nổi bật ở đầu trang: *"Hồ sơ bài toán nhu cầu đã được tiếp nhận và đang trong quá trình thẩm định của Cán bộ Sở KH&CN trước khi niêm yết rộng rãi."*
4. **Bảo vệ quyền riêng tư & Tạm khóa chào bán**: Khóa form chào giá khi bài toán đang `PENDING`. Đối với khách vãng lai không phải chủ bài toán và không phải cán bộ quản lý, hiển thị màn hình thông báo hồ sơ đang thẩm định, bảo vệ bí mật kinh doanh theo Nghị định 13/2023/NĐ-CP.

---

## 2. Đánh Giá Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt Kiến Trúc | Mức Độ Tác Động | Chi Tiết Ảnh Hưởng | Biện Pháp Can Thiệp & Kế Thừa |
| :--- | :---: | :--- | :--- |
| **1. Basic Design (`Specification/`)** | **ĐÃ HOÀN TẤT** | Bổ sung Phụ lục Quyết định `PO-DEC-20261102-04`. | Đã cập nhật tại `BASIC_DESIGN_NACENTECH.md` Mục 22. |
| **2. Living Spec (`SourceCode/specs/`)** | **CAO** | Bổ sung `REQ-BUYER-DMD-004`, `BR-DMD-STAT-01`, `BR-DMD-PRIV-01`, `API-DMD-PRIV-01`, `UI-DMD-STAT-01`, `TEST-DMD-PRIV-01`. Bump SemVer lên `1.14.0`. | Cập nhật `SourceCode/specs/TASK-03.../spec.md`, `plan.md`, `tasks.md`. |
| **3. CSDL PostgreSQL (`Schema`)** | **KHÔNG** | Bảng `demand.demand_items` đã có sẵn các cột `status`, `is_public_listed`, `created_by`. | Không cần migration mới; tận dụng 100% cột CSDL sẵn có. |
| **4. Backend API (`.NET / C#`)** | **TRUNG BÌNH** | Endpoint `GET /api/v1/public/demands/{id}`: Trả về cờ `isPendingReview`, `canViewDraft` hoặc ẩn thông tin nhạy cảm khi bài toán `PENDING` và người xem không phải tác giả/admin. | Cập nhật `DemandController.cs`. |
| **5. Frontend Web Portal (`Next.js / React`)** | **CAO** | `SourceCode/frontend/src/app/nhu-cau-cong-nghe/[id]/page.tsx`: Xóa bỏ hardcode, render 4 badge chuẩn, render Banner thông báo chờ duyệt, khóa form chào bán khi `PENDING`. | Cập nhật Component chi tiết bài toán. |
| **6. Testing & QC Automation** | **CAO** | Bộ test case 4 tầng kiểm thử: Chủ bài toán xem bản preview, Khách ngoài xem cảnh báo, Cán bộ Sở duyệt bài toán và chuyển trạng thái sàn. | Bổ sung test suites Vitest & Playwright E2E. |

---

## 3. Đặc Tả Yêu Cầu Nghiệp Vụ Với Các Mỏ Neo Bất Biến (Immutable Anchors)

### 3.1. [ADD] `REQ-BUYER-DMD-004`: Vòng Đời Trạng Thái Bài Toán & Quản Trị Thẩm Định Sở KH&CN
- **Mô tả**: Mọi bài toán nhu cầu công nghệ nộp lên hệ thống bắt buộc tuân theo máy trạng thái nghiêm ngặt gồm 4 pha: `PENDING` $\rightarrow$ `VERIFIED` $\rightarrow$ `CONNECTED` $\rightarrow$ `CLOSED`.
- **Thẩm quyền**: Chỉ Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN`) hoặc Quản trị viên (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`) mới có quyền phê duyệt đưa bài toán lên Sàn.

### 3.2. [ADD] `BR-DMD-STAT-01`: Quy Tắc Chuyển Đổi & Hiển Thị 4 Trạng Thái (Status Badges)
1. **`PENDING` (Chờ thẩm định)**:
   - Hiển thị Badge: `CHỜ SỞ KH&CN THẨM ĐỊNH` với phong cách Visual Badge màu vàng hổ phách (`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300`).
   - Phụ đề trạng thái: *"Hồ sơ đang được Cán bộ Sở KH&CN thẩm định trước khi niêm yết"*.
2. **`VERIFIED` (Đã phê duyệt niêm yết sàn)**:
   - Hiển thị Badge: `ĐANG MỞ TÌM CUNG` với phong cách Visual Badge màu xanh lục (`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300`).
   - Phụ đề trạng thái: *"Đang mở tiếp nhận giải pháp công nghệ từ Viện/Trường/Doanh nghiệp"*.
3. **`CONNECTED` (Đã kết nối)**:
   - Hiển thị Badge: `ĐÃ KẾT NỐI CUNG - CẦU` màu xanh dương (`bg-blue-50 text-blue-700 border-blue-200`).
4. **`CLOSED` (Đã đóng)**:
   - Hiển thị Badge: `ĐÃ ĐÓNG HỒ SƠ` màu xám trung tính (`bg-slate-100 text-slate-700 border-slate-300`).

### 3.3. [ADD] `BR-DMD-PRIV-01`: Rào Chắn Quyền Riêng Tư & Bảo Vệ Bản Nháp (PDPD Preview Guard)
1. Khi bài toán ở trạng thái `PENDING`:
   - **Tác giả (Chính chủ bài toán có `Actor.PersonId == item.CreatedBy`)**: Được phép xem toàn bộ nội dung bài toán dưới dạng "Bản xem trước của tác giả (Author Preview)". Đầu trang hiển thị Banner cảnh báo màu vàng nổi bật.
   - **Cán bộ Sở / Quản trị viên (`PROVINCIAL_ADMIN`, `SUPER_ADMIN`, `ADMIN`)**: Được phép xem toàn bộ nội dung để phục vụ công tác thẩm định.
   - **Khách ngoài (Khách vãng lai hoặc tài khoản khác)**: Giao diện hiển thị hộp thông báo an toàn: *"Bài toán công nghệ này đang trong quá trình thẩm định của Sở KH&CN và chưa được niêm yết công khai trên Sàn."* Ẩn thông tin kỹ thuật nhạy cảm và ẩn form gửi chào giá.
2. Form "Chào bán giải pháp cho bài toán này" ở chân trang bắt buộc tạm khóa khi bài toán đang ở trạng thái `PENDING`.

### 3.4. [ADD] `API-DMD-PRIV-01`: Hợp Đồng API Chi Tiết Bài Toán (`GET /api/v1/public/demands/{id}`)
- Trả về các thuộc tính bổ sung phục vụ phân quyền giao diện:
  * `status`: Trạng thái thực tế trong CSDL (`PENDING`, `VERIFIED`, `CONNECTED`, `CLOSED`).
  * `isOwner`: `boolean` — `true` nếu người dùng đăng nhập hiện tại là người tạo bài toán.
  * `isPendingReview`: `boolean` — `true` nếu bài toán đang ở trạng thái `PENDING`.
  * `canSubmitOffer`: `boolean` — `true` chỉ khi `status === 'VERIFIED'`.

### 3.5. [ADD] `UI-DMD-STAT-01`: Thành Phần Giao Diện Banner Cảnh Báo Chờ Duyệt (`PendingApprovalBanner`)
- Thiết kế Banner chuẩn UX:
  * Icon: `Clock` hoặc `AlertCircle` màu hổ phách.
  * Tiêu đề: **Hồ Sơ Nhu Cầu Đang Chờ Thẩm Định**.
  * Nội dung: *"Bài toán công nghệ này đã được hệ thống tiếp nhận thành công và đang được Cán bộ Sở Khoa học & Công nghệ thẩm tra sơ bộ. Sau khi được phê duyệt, bài toán sẽ chính thức xuất hiện trên Sàn giao dịch để các Nhà cung ứng và Viện/Trường gửi hồ sơ giải pháp."*

### 3.6. [ADD] `TEST-DMD-PRIV-01`: Bộ Kiểm Thử Xác Thực Trạng Thái & Preview Guard
- **Test 1**: Tạo bài toán qua `POST /api/v1/demands/items`, xác thực CSDL lưu `status = 'PENDING'`.
- **Test 2**: Đăng nhập `public1` xem chi tiết bài toán thấy Badge `CHỜ SỞ KH&CN THẨM ĐỊNH` và Banner cảnh báo.
- **Test 3**: Khách vãng lai xem bài toán `PENDING` không thấy form gửi chào giải pháp.
- **Test 4**: Cán bộ Sở Hà Nội (`hanoi.admin@demo.nacentech.vn`) vào `/gov/demands` duyệt bài toán $\rightarrow$ Trạng thái chuyển `VERIFIED`, trang chi tiết hiển thị `ĐANG MỞ TÌM CUNG`.
