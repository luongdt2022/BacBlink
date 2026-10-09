# Đặc Tả Yêu Cầu Kỹ Thuật (spec.md) — TASK-02: Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST

> **Mã phân hệ**: `TASK-02`  
> **Ánh xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/)  
> **Căn cứ pháp lý & Dữ liệu gốc (SSOT)**: 
> 1. Sheet `DN ĐMST` (225 dòng dữ liệu, 10 nhóm trường) trong `Nacentwin_20260924_bo_loc_da_sua.xlsx`.
> 2. Kho dữ liệu thực tế 304 Doanh nghiệp có MST từ `Specification/01_DATA_RAW/Khảo sát 304 DN-final-2408.xlsx`.
> 3. Quyết định PO `PO-DEC-20261008-05` (Phê duyệt nạp 304 DN thật, mô hình Hybrid Schema và Wireframe 5 màn hình).
> 4. Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân (PDPD).

---

## 1. USER STORIES & ƯU TIÊN TRIỂN KHAI

### P1 (Must-Have) — Định Danh Doanh Nghiệp SSOT & CSDL Thực Nghiệm 304 DN
- **Là** một Doanh nghiệp, HTX hoặc Viện/Trường, **Tôi muốn** đăng ký và định danh hồ sơ chủ thể bằng Mã Số Thuế (MST) duy nhất **Để** thiết lập "Căn cước số" tham gia hệ sinh thái Nacentwin.
  - *Why this priority:* Định danh duy nhất là hạt nhân SSOT cho toàn hệ thống, tránh trùng lặp dữ liệu và là tiền đề cho phân hệ Chào bán (Seller) và Tìm mua (Buyer).
  - *Independent Test:* Nhập MST hợp lệ -> Kiểm tra tính duy nhất -> Nạp hoặc tạo hồ sơ thành công.
  - *Acceptance Scenario:* Given MST chưa tồn tại trong hệ thống, When người dùng đăng ký hồ sơ với MST và tên doanh nghiệp, Then hệ thống khởi tạo bản ghi trong schema `enterprise.enterprises` với trạng thái `PENDING_VERIFICATION`.

- **Là** một Cán bộ quản lý Nhà nước (Sở KH&CN / Bộ KH&CN), **Tôi muốn** tra cứu và khai thác kho CSDL thực nghiệm 304 Doanh nghiệp đã được làm sạch **Để** nắm bắt hiện trạng năng lực công nghệ và nhu cầu đổi mới sáng tạo thực tế trên địa bàn 34 tỉnh/thành.
  - *Why this priority:* Đem lại giá trị tức thời cho dự án bằng dữ liệu khảo sát thực nghiệm có MST thật, không sử dụng dữ liệu giả lập.
  - *Independent Test:* Chạy API tra cứu 304 DN -> Trả về danh sách phân trang, lọc được theo tỉnh thành và 10 ngành TT17.

### P2 (Must-Have) — Kê Khai 10 Nhóm Trường Năng Lực KH&CN & Sở Hữu Trí Tuệ
- **Là** Chủ hồ sơ Doanh nghiệp, **Tôi muốn** kê khai đầy đủ 10 nhóm trường (Quy mô, Nhân sự R&D, Dự án ĐMST, Bằng độc quyền sáng chế/GPHI, Nhu cầu hỗ trợ) **Để** chứng minh năng lực công nghệ và đủ điều kiện được cấp Huy hiệu Xác thực (Verified Badge).
  - *Why this priority:* Phản ánh trung thực 225 trường dữ liệu của Master Excel, phân biệt Nacentwin với các trang danh bạ doanh nghiệp thông thường.
  - *Independent Test:* Thêm mới 1 dự án R&D và 1 bằng độc quyền sáng chế -> Lưu thành công vào bảng quan hệ 1-N.
  - *Acceptance Scenario:* Given hồ sơ đang ở trạng thái nháp (`DRAFT`), When người dùng nhập đủ các trường bắt buộc (Nhóm 1, 3, 4) và nhấn "Nộp hồ sơ", Then trạng thái chuyển sang `SUBMITTED` và kích hoạt luồng phê duyệt Maker-Checker.

### P3 (Should-Have) — Danh Bạ Tra Cứu Công Khai & Bảo Mật Dữ Liệu PII
- **Là** một Đối tác / Doanh nghiệp tìm kiếm công nghệ, **Tôi muốn** tra cứu danh bạ doanh nghiệp ĐMST công khai với bộ lọc đa trục và xem hồ sơ năng lực **Để** tìm kiếm cơ hội hợp tác cung ứng hoặc chuyển giao công nghệ.
  - *Why this priority:* Mở rộng kết nối thị trường, hiện thực hóa giá trị kết nối cung - cầu.
  - *Independent Test:* Truy cập `/enterprises`, lọc theo tỉnh "Hà Nội" và ngành "Công nghệ thông tin" -> Trả về danh sách thẻ doanh nghiệp kèm Verified Badge.
  - *Acceptance Scenario:* Given người dùng chưa đăng nhập hoặc chưa được kết nối, When xem hồ sơ chi tiết tại `/enterprises/[taxCode]`, Then doanh thu năm, kinh phí R&D và SĐT người liên hệ bị MASK (`[BẢO MẬT]`).

### P4 (Should-Have) — Cổng Thẩm Định Phân Cấp Sở KH&CN (3D Scoped RBAC)
- **Là** Cán bộ Sở KH&CN Tỉnh (`PROVINCIAL_ADMIN`), **Tôi muốn** thẩm định các hồ sơ doanh nghiệp có trụ sở tại địa phương mình và phê duyệt cấp Verified Badge **Để** nâng cao độ tin cậy của thông tin trên sàn.
  - *Why this priority:* Đảm bảo phân cấp quản lý nhà nước đúng thẩm quyền, ngăn chặn doanh nghiệp mạo danh hoặc khai báo sai lệch.
  - *Independent Test:* Cán bộ Sở Hà Nội chỉ nhìn thấy và duyệt được các doanh nghiệp thuộc tỉnh Hà Nội.

---

## 2. FUNCTIONAL REQUIREMENTS (YÊU CẦU CHỨC NĂNG)

- **`REQ-02-001` [Phân loại Chủ thể]**: Hệ thống hỗ trợ 5 loại hình chủ thể: Doanh nghiệp (`ENTERPRISE`), DN ĐMST (`INNOVATIVE_ENTERPRISE`), Hợp tác xã (`COOPERATIVE`), Viện/Trường (`INSTITUTE_UNIVERSITY`), Hộ kinh doanh (`HOUSEHOLD_BUSINESS`).
- **`REQ-02-002` [Thông tin Định danh & Nguồn nhập]**: Quản lý Tên đăng ký, Mã số thuế (MST) duy nhất, Ngày thành lập, Trụ sở chính, Website, Logo, hình thức nhập (Tự khai hoặc Cán bộ khảo sát nhập hộ).
- **`REQ-02-003` [Người đại diện & Đầu mối liên hệ]**: Quản lý Họ tên, Chức vụ, Bộ phận, Số điện thoại, Email. Áp dụng cờ cấu hình quyền hiển thị (`IsContactPublic`).
- **`REQ-02-004` [Ngành nghề & Quy mô]**: Quản lý ngành hoạt động chính, lĩnh vực công nghệ chuẩn TT17 (10 mã `LV` từ CSDL động), tổng lao động, lao động kỹ thuật, doanh thu năm gần nhất, thị trường (Trong nước / Quốc tế).
- **`REQ-02-005` [Nguồn lực ĐMST & R&D]**: Bộ phận chuyên trách ĐMST, số nhân sự nghiên cứu, kế hoạch ĐMST, kinh phí dành cho ĐMST, cơ sở vật chất/phần mềm phục vụ ĐMST.
- **`REQ-02-006` [Dự án ĐMST]**: Hỗ trợ 1 chủ thể có N hoạt động/dự án ĐMST (Tên, mục tiêu, điểm đổi mới, tiến độ, thời gian bắt đầu/kết thúc, đối tác phối hợp).
- **`REQ-02-007` [Sở hữu Trí tuệ & Minh chứng]**: Quản lý danh mục bằng độc quyền sáng chế, giải pháp hữu ích, nhãn hiệu, kiểu dáng công nghiệp và tài liệu/hình ảnh đính kèm.
- **`REQ-02-008` [Đánh giá Mức độ ĐMST & Điểm TNI]**: Lưu trữ lịch sử đánh giá theo kỳ, bộ tiêu chí, điểm số, phân loại (Tiềm năng, Đang phát triển, Dẫn đầu) và kết quả tính toán chỉ số TNI (Urgency K, Impact L, Capacity N, Readiness O).
- **`REQ-02-009` [Nhu cầu Hỗ trợ ĐMST]**: Quản lý các nội dung cần hỗ trợ (Tài chính, đào tạo, chuyển giao công nghệ, tiếp cận quỹ đầu tư, giải pháp mặt bằng).
- **`REQ-02-010` [Danh bạ & Tra cứu Công khai]**: Cung cấp giao diện tra cứu `/enterprises` với bộ lọc 5 chiều (Địa bàn 63 tỉnh, 10 ngành TT17, loại hình, quy mô, xếp hạng ĐMST/TNI), phân trang Server-side.
- **`REQ-02-011` [Dashboard Phân tích 304 DN]**: Cung cấp biểu đồ trực quan phân tích 304 DN theo địa bàn, ngành nghề, dải doanh thu, mức độ chuyển đổi số và top rào cản công nghệ.
- **`REQ-02-012` [Thẩm định Maker-Checker & Audit Log]**: Cán bộ Sở KH&CN thẩm định hồ sơ, cấp Verified Badge hoặc yêu cầu bổ sung. Mọi thay đổi dữ liệu tự động ghi Before/After vào `system_audit_logs`.

---

## 3. BUSINESS RULES (QUY TẮC NGHIỆP VỤ)

- **`BR-02-001` [Định danh duy nhất SSOT]**: Mã số thuế (`tax_code`) là khóa định danh duy nhất của doanh nghiệp trên toàn hệ thống. Không cho phép 2 chủ thể có cùng MST.
- **`BR-02-002` [Bảo vệ dữ liệu nhạy cảm PII/Tài chính]**: 
  - Doanh thu năm (`revenue_range`), kinh phí ĐMST (`rd_budget`) và SĐT người liên hệ mặc định là thông tin riêng tư.
  - Chỉ Chủ sở hữu (`Owner`) và Cán bộ quản lý có thẩm quyền (`ADMIN`, `PROVINCIAL_ADMIN` quản lý địa bàn) mới được xem giá trị thực.
  - Trên API công chúng và giao diện khách, các trường này trả về `null` hoặc chuỗi bị che `[BẢO MẬT]`.
- **`BR-02-003` [Điều kiện gửi thẩm định hồ sơ]**: Hồ sơ chỉ được phép chuyển từ trạng thái `DRAFT` sang `SUBMITTED` khi đã điền đầy đủ: Loại chủ thể, Tên doanh nghiệp, MST hợp lệ, Địa chỉ tỉnh/thành, Ngành chính và Thông tin người liên hệ.
- **`BR-02-004` [Nhật ký kiểm toán bất biến]**: Mọi thao tác Create/Update/Delete/Verify trên hồ sơ doanh nghiệp phải ghi nhận bản ghi kiểm toán bất biến (`system_audit_logs`) lưu vết ActorId, Timestamp, Action và Payload Before/After.
- **`BR-02-005` [Phân cấp thẩm định theo địa bàn]**: Cán bộ Sở KH&CN mang vai trò `PROVINCIAL_ADMIN` chỉ có quyền thẩm định và duyệt hồ sơ của các doanh nghiệp có trụ sở chính thuộc phạm vi tỉnh (`ScopeId`) do mình phụ trách.
- **`BR-02-006` [Khai thác CSDL 304 DN Thực nghiệm]**: Dữ liệu từ kho 304 DN được định danh là dữ liệu khảo sát chính thức (`survey_type = 'OFFLINE_BATCH_2408'`), được tự động kích hoạt trạng thái `VERIFIED` và gán điểm TNI tính toán từ công thức chuẩn.
- **`BR-02-007` [Liên thông Hạt nhân sang Phân hệ Khác]**: Thông tin định danh của `enterprises` được tái sử dụng trực tiếp khi doanh nghiệp đăng ký làm Bên Mua (`TASK-03`) hoặc Bên Bán (`TASK-04`), loại bỏ hoàn toàn việc bắt doanh nghiệp gõ lại thông tin.

---

## 4. CROSS-SURFACE IMPACT MATRIX (MA TRẬN LAN TRUYỀN BỀ MẶT)

| Bề Mặt Tác Động | Thành Phần Kỹ Thuật | Phạm Vi Tác Động Trong TASK-02 | Ghi Chú Tránh Xung Đột |
| :--- | :--- | :--- | :--- |
| **Basic Design** | `Specification/02_BASIC_DESIGN/TASK-02/` | Khớp 100% với 3 Wireframe: `wireframe_ho_so_dn_dmst.html`, `wireframe_public_dn_dmst.html`, `wireframe_dashboard_304_dn.html`. | Đã được PO phê duyệt theo PO-DEC-20261008-05. |
| **Database Schema** | PostgreSQL local | Tạo schema `enterprise` và bảng `enterprises`, `enterprise_projects`, `enterprise_ips`. Tạo bảng `demand_surveys` cho TNI. | Áp dụng EF Core Migration non-destructive. |
| **Backend API** | `SourceCode/backend/modules/enterprise/` | Bổ sung đầy đủ Endpoints V1: Public Directory, Profile Detail, Update 10 groups, Dashboard Stats, Approval Action. | Tuân thủ Result Pattern và Contract-First. |
| **Frontend Web** | `SourceCode/frontend/src/app/` | Dựng 5 màn hình: `/enterprises`, `/enterprises/[taxCode]`, `/portal/enterprise/profile`, `/admin/enterprises/dashboard`, `/gov/approvals/enterprises`. | Chuẩn hóa 5 UX states `<Async>`, Next.js 15 Tailwind. |
| **Zalo Mini App** | `SourceCode/ZaloMiniApp/` | *Ngoài scope MVP của TASK-02* (Zalo tập trung vào TASK-05 Chuyên gia theo quyết định PO). | Không triển khai form doanh nghiệp trên Zalo. |
| **Phân Quyền RBAC** | `modules/identity/` | Tích hợp 10 roles và Scoped RBAC `PROVINCIAL_ADMIN` cho việc duyệt doanh nghiệp cấp tỉnh. | Sử dụng ICurrentActor và ScopeType. |
| **Kiểm Thử 4 Tầng** | Backend & Frontend Tests | Unit Invariants cho `BR-02-*`, Integration Test với 304 DN thật, E2E Playwright black-box. | Đảm bảo 100% Green. |

---

## 5. SUCCESS CRITERIA (TIÊU CHÍ THÀNH CÔNG ĐỊNH LƯỢNG)

- **`SC-02-001`**: 304 Doanh nghiệp thực tế được nạp thành công vào PostgreSQL với 100% tính toàn vẹn (0 lỗi khóa ngoại, 0 lỗi trùng lặp MST).
- **`SC-02-002`**: API tra cứu danh bạ `/api/v1/enterprises` phản hồi dưới 200ms với dataset 304 DN có index.
- **`SC-02-003`**: 100% Business Rules (`BR-02-001` đến `BR-02-007`) được bao phủ bởi Unit Invariant Tests.
- **`SC-02-004`**: Giao diện hiển thị chuẩn xác đầy đủ 5 trạng thái UX (Loading, Empty, Error, Success, Partial) trên cả Desktop 1440px và Mobile 390px.
