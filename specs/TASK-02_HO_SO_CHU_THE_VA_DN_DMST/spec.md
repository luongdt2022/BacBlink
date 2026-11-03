# Đặc Tả Yêu Cầu Kỹ Thuật (spec.md) — TASK-02: Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST

**Epic**: TASK-02 Hồ Sơ Chủ Thể & 304 Doanh Nghiệp ĐMST  
**Version**: 1.12.0  
**Status**: In Implementation (CR-2026-024-PART2 Approved)  
**Last Updated**: 2026-11-03  
> **Ánh xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/) & `Specification/BASIC_DESIGN_NACENTECH.md` Mục 27  
> **Căn cứ pháp lý & Dữ liệu gốc (SSOT)**: 
> 1. Sheet `DN ĐMST` (225 dòng dữ liệu, 10 nhóm trường) trong `Nacentwin_20260924_bo_loc_da_sua.xlsx`.
> 2. Kho dữ liệu thực tế 304 Doanh nghiệp có MST từ `Specification/01_DATA_RAW/Khảo sát 304 DN-final-2408.xlsx`.
> 3. Quyết định PO `PO-DEC-20261008-05` (Phê duyệt nạp 304 DN thật, mô hình Hybrid Schema và Wireframe 5 màn hình).
> 4. Quyết định PO `PO-DEC-20261103-02` (Chuẩn hóa side effect phê duyệt nâng cấp DN ĐMST cấp Tỉnh - CR-2026-024-PART2).
> 5. Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân (PDPD).

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
- **`REQ-02-013` [Bàn làm việc Edit Profile & Route Alias Danh bạ]**: Cung cấp route chuyên biệt `/portal/enterprise/profile/edit` phục vụ Bàn làm việc Tự quản trị & Chỉnh sửa hồ sơ 10 nhóm trường theo `wireframe_chinh_sua_ho_so_dn.html`, đồng thời mở route alias `/doanh-nghiep-dmst` kết nối trực tiếp vào Danh bạ 304 DN theo `wireframe_danh_ba_dn_dmst.html`.

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

---

## Spec Delta v2 (CR-2026-010): Nâng Cấp Toàn Diện Danh Bạ 34 Tỉnh Thành Trọng Điểm, Icon Thương Hiệu & Thông Tin Cốt Lõi

> **Căn cứ thay đổi**: Quyết định PO phê duyệt ngày 12/10/2026 rà soát màn hình `http://localhost:3000/doanh-nghiep-dmst` đối chiếu 1:1 với `wireframe_danh_ba_dn_dmst.html`. Đồng bộ phạm vi toàn dự án là **34 tỉnh/thành trọng điểm**.

### 6.1 Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)
- **`REQ-02-014` [Bao Phủ 34 Tỉnh/Thành Trọng Điểm & Alias Địa Bàn Thông Minh]**:
  - Giao diện tra cứu tích hợp danh mục chuẩn **34 Tỉnh/Thành phố Trọng Điểm** (`PROVINCES_34`) thuộc phạm vi Đề tài CSDL Quốc gia NacenTwin.
  - Backend API hỗ trợ cơ chế giải quyết alias địa bàn: truy vấn `Hồ Chí Minh` hoặc `TP. Hồ Chí Minh` tự động khớp với cả dữ liệu lưu trữ `TPHCM`; hỗ trợ `Huế` $\leftrightarrow$ `Thừa Thiên Huế`, `Đắk Lắk` $\leftrightarrow$ `Đắc Lắc`; chuẩn hóa đối soát Unicode NFC/NFD đối với `Hà Nội` và các tỉnh có dấu tiếng Việt.
- **`REQ-02-015` [Ánh Xạ Lĩnh Vực TT17 Thông Minh]**:
  - Bộ lọc Lĩnh vực TT17 (`SectorCode`) tự động liên thông truy vấn giữa mã chuẩn (`LV01`..`LV17`) và tên phân ngành thực tế (`main_sector_name`) của 304 DN, đảm bảo không trả về rỗng khi dữ liệu hạt nhân chưa gán `sector_code`.
- **`REQ-02-016` [Hệ Thống Icon / Avatar Nhận Diện Thương Hiệu Doanh Nghiệp]**:
  - Mỗi thẻ doanh nghiệp bắt buộc hiển thị Khối Biểu Trưng Thương Hiệu (Tech Avatar Badge): Render Logo nếu có URL; tự động sinh Initial Avatar Badge (chữ cái đầu tên giao dịch) kết hợp Icon công nghệ theo ngành (`Cpu`, `FlaskConical`, `Wrench`, `Sprout`, `Zap`, `Factory`) trên nền Gradient công nghệ.
- **`REQ-02-017` [Chuẩn Hóa 5 Khối Thông Tin Cốt Lõi Trên Thẻ Card]**:
  - Thẻ Card hiển thị đầy đủ 5 tầng thông tin cốt lõi: (1) Nhận diện & Loại hình chủ thể; (2) Địa bàn & Lĩnh vực TT17; (3) Năng lực R&D, SHTT & Chuỗi giá trị; (4) Điểm TNI & Tag phân loại nhu cầu; (5) Cặp nút hành động (Xem hồ sơ & Kết nối).
- **`REQ-02-018` [Bộ Điều Khiển Sắp Xếp & Phân Trang Động]**:
  - Bổ sung Dropdown sắp xếp đa tiêu chí (TNI cao nhất, SHTT nhiều nhất, Tên A-Z, Mới nhất).
  - Thuật toán phân trang hiển thị linh hoạt trang đầu, trang cuối, trang hiện tại $\pm 1$ và dấu chấm lửng `...`.
- **`REQ-02-019` [Triệt Tiêu Zero-Mock Tại Modal Kết Nối]**:
  - Xóa bỏ giả lập `setTimeout`; kết nối trực tiếp với backend hoặc lưu trữ phiên làm việc thực tế với phản hồi minh bạch cho người dùng.

### 6.2 Quy Tắc Nghiệp Vụ Mới (Business Rules)
- **`BR-02-008` [Toàn Vẹn Phân Tầng TNI]**: Khi người dùng chọn lọc mức "TNI Cao", hệ thống bắt buộc phải truy vấn cả mức `HIGH` và `VERY_HIGH` (điểm TNI $\ge 75$), không được phép bỏ sót các doanh nghiệp điểm cao nhất.
- **`BR-02-009` [Bảo Mật & Minh Bạch Đề Xuất Kết Nối]**: Mọi yêu cầu kết nối từ công chúng phải lưu vết thời gian, nội dung đề xuất và người nhận; thông tin định danh cá nhân tuân thủ Nghị định 13/2023/NĐ-CP (PDPD Masking).

---

## Spec Delta v3 (CR-2026-012): Bộ Tiêu Chí Đánh Giá & Chấm Điểm Mức Độ Đổi Mới Sáng Tạo Doanh Nghiệp (Thang 100 Điểm, 8 Nhóm Tiêu Chí)

> **Căn cứ thay đổi**: 
> 1. Quyết định PO `PO-DEC-20261014-03` (14/10/2026) phê duyệt chuẩn hóa bộ tiêu chí ĐMST.
> 2. Tài liệu Thiết kế cơ sở: [`Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/THIET_KE_CO_SO_BO_TIEU_CHI_CHAM_DIEM_DN_DMST.md`](../../../../Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/THIET_KE_CO_SO_BO_TIEU_CHI_CHAM_DIEM_DN_DMST.md).
> 3. Bảng tiêu chí gốc: [`Specification/01_DATA_RAW/Nhóm tiêu chí.xlsx`](../../../../Specification/01_DATA_RAW/Nho%CC%81m%20tie%CC%82u%20chi%CC%81.xlsx) (8 nhóm, 37 tiêu chí, 100 điểm).
> 4. Bộ câu hỏi khảo sát 304 DN: [`Specification/01_DATA_RAW/Khảo sát 304 DN-final-2408.xlsx`](../../../../Specification/01_DATA_RAW/Kha%CC%89o%20sa%CC%81t%20304%20DN-final-2408.xlsx) (C11 $\rightarrow$ C36).

### 7.1 Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)
- **`REQ-02-020` [Bộ Tiêu Chí ĐMST 8 Nhóm & 37 Tiêu Chí]**:
  - Hệ thống hỗ trợ bộ tiêu chí chuẩn hóa 100 điểm trên 8 nhóm năng lực:
    1. *Quản trị (12đ)*: `QT1` (4đ - C15), `QT2` (3đ - C12), `QT3` (2đ - C16), `QT4` (3đ - C20).
    2. *R&D và Công nghệ (18đ)*: `CN1` (5đ - C22), `CN2` (4đ - C14), `CN3` (3đ - C22), `CN4` (4đ - C22), `CN5` (2đ - C31).
    3. *Sản phẩm / Quy trình (20đ)*: `SP1` (5đ - C17), `SP2` (4đ - C18), `SP3` (5đ - C19), `SP4` (3đ - C32), `SP5` (3đ - C23+C34).
    4. *Sở hữu trí tuệ (10đ)*: `IP1` (5đ - C31), `IP2` (3đ - C31), `IP3` (2đ - Tự khai).
    5. *Chuyển đổi số (10đ)*: `S1` (2đ - C24), `S2` (2đ - C25), `S3` (2đ - C26), `S4` (3đ - C27), `S5` (1đ - C16).
    6. *Thị trường (15đ)*: `TT1` (5đ - C33), `TT2` (2đ - C21), `TT3` (3đ - C34), `TT4` (2đ - C35), `TT5` (2đ - C36), `TT6` (1đ - C32+C34).
    7. *Nhân lực (7đ)*: `NL1` (2đ - C11), `NL2` (3đ - C12), `NL3` (2đ - C13).
    8. *Liên kết (8đ)*: `LK1` (2đ - C28 ĐH+Viện), `LK2` (1đ - C28 DN), `LK3` (1đ - C28 Tổ chức hỗ trợ), `LK4` (1đ - C28 Quỹ/C30), `LK5` (1đ - C28 NN/C29), `LK6` (2đ - C28 Quốc tế).
- **`REQ-02-021` [Phân Tầng Năng Lực ĐMST 3 Cấp Độ & Nhóm Chưa Đánh Giá]**:
  - `LEADING` (Dẫn đầu): Điểm $\ge 75$ $\rightarrow$ Gán Huy hiệu Vàng ĐMST.
  - `DEVELOPING` (Đang phát triển): Điểm $50 - 74$ $\rightarrow$ Gán Huy hiệu Bạc ĐMST.
  - `POTENTIAL` (Tiềm năng): Điểm $< 50$ $\rightarrow$ Gán Huy hiệu Đồng ĐMST.
  - `UNRATED` (Chưa đánh giá): Doanh nghiệp chưa hoàn thành phiếu khảo sát hoặc chưa có kỳ đánh giá được duyệt, thống kê riêng và không tự tiện gán mức.
- **`REQ-02-022` [Engine Tính Điểm Tự Động Từ Khảo Sát 304 DN]**:
  - Backend cung cấp module/service tính toán tự động điểm của 36/37 tiêu chí từ mảng dữ liệu JSONB `demand_surveys.survey_answers` của 304 DN thật, lưu kết quả vào schema `enterprise.innovation_evaluations`.
- **`REQ-02-023` [Trực Quan Hóa Radar Chart 8 Trục & Bộ Lọc Phân Tầng]**:
  - Giao diện chi tiết doanh nghiệp (`/enterprises/[taxCode]`) bổ sung Tab *"Năng Lực ĐMST"* hiển thị Biểu đồ Radar Chart 8 trục và bảng điểm thành phần.
  - Danh bạ Doanh nghiệp (`/doanh-nghiep-dmst` và `/enterprises`) bổ sung Dropdown lọc theo mức ĐMST: Tất cả / Dẫn đầu / Đang phát triển / Tiềm năng / Chưa đánh giá.

### 7.2 Quy Tắc Nghiệp Vụ Bổ Sung (Business Rules)
- **`BR-02-010` [Lưu Trữ Lịch Sử Đánh Giá Bất Biến Theo Kỳ]**:
  - Mỗi kỳ đánh giá được lưu độc lập kèm `evaluation_year` và `criteria_version = 'v1.0'`. Kỳ đánh giá mới không được ghi đè kỳ đánh giá cũ.
- **`BR-02-011` [Bảo Vệ Dữ Liệu Nhạy Cảm PDPD & Phân Quyền 3D Scoped RBAC]**:
  - Khách vãng lai và người dùng công chúng chỉ được xem Tổng điểm, Xếp hạng và Radar Chart 8 trục.
  - CẤM hiển thị công khai chi tiết số liệu doanh thu (C33), ngân sách R&D (C15) và thông tin liên hệ cá nhân.
  - Chỉ `ENTERPRISE_OWNER` và `PROVINCIAL_ADMIN` (thuộc đúng địa bàn tỉnh) mới có quyền xem toàn bộ 37 tiêu chí và minh chứng.

### 7.3 Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **`AC-02-010`**: Given doanh nghiệp thuộc tập 304 DN có câu trả lời C11-C36 trong CSDL, When gọi API tính điểm ĐMST, Then trả về tổng điểm trong dải 0-100 và điểm chi tiết của 8 nhóm.
- **`AC-02-011`**: Given người dùng truy cập trang `/enterprises/[taxCode]`, When mở tab "Năng Lực ĐMST", Then hiển thị Radar Chart 8 trục với đầy đủ 8 đỉnh năng lực và nhãn Huy hiệu tương ứng.
- **`AC-02-012`**: Given người dùng trên trang `/doanh-nghiep-dmst`, When chọn bộ lọc "Dẫn đầu", Then danh sách chỉ hiển thị các doanh nghiệp có điểm $\ge 75$.

---

## Spec Delta v4 (CR-2026-015): Chủ Thể Doanh Nghiệp Thống Nhất & Kích Hoạt Năng Lực Đa Tầng (Unified Enterprise & Progressive Capability Tiers: Buyer / Seller / Dual Mode)

> **Mã thay đổi**: `CR-2026-015`  
> **Căn cứ nghiệp vụ**: 
> 1. Quyết định PO về Bản sắc Doanh nghiệp Thống nhất & Nâng cấp năng lực linh hoạt (Progressive Capability Tiers).
> 2. Triết lý Chuỗi Giá Trị Chiến Lược (Michael Porter Strategic Value Chain): Mỗi Doanh nghiệp là một Chủ thể Pháp nhân Duy nhất (Single Legal Entity) tham gia đồng thời cả 2 chuỗi hoạt động Cung ứng Đầu ra (Seller / Outbound Logistics & Operations) và Tiếp nhận Đầu vào (Buyer / Inbound Logistics & Procurement).
> 3. Nguyên tắc Kim Tự Tháp Barbara Minto: Quy hoạch năng lực từ tổng quan đến chi tiết, liên kết chặt chẽ các tầng năng lực Level 0 $\rightarrow$ Level 1 $\rightarrow$ Level 2.
> 4. Hiến pháp NacenTech về Tính toàn vẹn dữ liệu SSOT và Non-destructive Delta.

### 8.1 User Stories & Khung Năng Lực Đa Tầng (Progressive Capability Levels)

- **Là** một Chủ Doanh nghiệp (Enterprise Owner), **Tôi muốn** chỉ cần duy trì DUY NHẤT một Hồ sơ Doanh nghiệp pháp nhân trên toàn sàn Nacentwin **Để** loại bỏ hoàn toàn việc phải đăng ký hay khai báo thông tin trùng lặp khi tham gia các vai trò khác nhau.
  - *Acceptance Scenario:* Given Doanh nghiệp đã có hồ sơ tại bảng `enterprise.enterprises`, When Doanh nghiệp đăng ký mở rộng năng lực Bên Mua (Buyer) hoặc Bên Bán (Seller), Then hệ thống tự động kế thừa 100% thông tin pháp nhân và liên hệ hiện có mà không sinh thêm bản ghi doanh nghiệp mới.

- **Là** một Doanh nghiệp Đổi mới sáng tạo toàn diện (Dual Mode Enterprise), **Tôi muốn** chuyển đổi qua lại giữa Bàn làm việc Bên Mua (`/portal/buyer/demands`) và Bàn làm việc Bên Bán (`/portal/seller/dashboard`) thông qua Bộ chuyển đổi ngữ cảnh (Context/Role Switcher) trên thanh điều hướng **Để** vừa quản trị các bài toán kỹ thuật cần giải quyết, vừa quản lý danh mục công nghệ và giải pháp chào bán ra thị trường trong cùng một phiên làm việc.
  - *Acceptance Scenario:* Given tài khoản sở hữu cả 2 năng lực Buyer và Seller, When người dùng click chuyển đổi vai trò trên Role Switcher, Then giao diện điều hướng ngay lập tức đến Workspace tương ứng với đầy đủ quyền hạn mà không yêu cầu đăng xuất hoặc xác thực lại.

- **Là** Cán bộ Kiểm thử & Đánh giá (QA / PO / Giám khảo Đề tài), **Tôi muốn** đăng nhập vào 2 tài khoản demo định danh chuẩn hóa (`buyer.user@demo.nacentech.vn` và `seller.user@demo.nacentech.vn`) **Để** trực tiếp kiểm tra và nghiệm thu các luồng nghiệp vụ tương tác thực tế giữa 2 doanh nghiệp thật trong CSDL 304 DN.
  - *Acceptance Scenario:* Given đăng nhập bằng `buyer.user@demo.nacentech.vn`, When vào trang thông tin cá nhân hoặc khảo sát, Then hệ thống hiển thị chính xác Doanh nghiệp CÔNG TY TNHH TRƯỜNG HOAN (MST: `0100255428`, Hà Nội). Given đăng nhập bằng `seller.user@demo.nacentech.vn`, Then hiển thị CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN (MST: `0108992134`, Hà Nội).

### 8.2 Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)

- **`REQ-02-014` [Kích Hoạt Năng Lực Đa Tầng & Bộ Chuyển Đổi Vai Trò (Progressive Capability Tiers & Context Switcher)]**:
  *(Mã tiếp nối hệ thống: `REQ-02-024` | PO Ref: `REQ-02-014`)*
  - Hệ thống hỗ trợ mô hình Nâng cấp Năng lực Tiến triển 3 cấp bậc cho Chủ thể Doanh nghiệp:
    1. **Level 0 (Basic Enterprise — Doanh Nghiệp Cơ Bản)**: Doanh nghiệp có hồ sơ pháp nhân cơ bản trong hệ thống. Có quyền tra cứu danh bạ, xem sàn nhu cầu và sàn chào bán công khai; chưa kích hoạt Bàn làm việc chuyên biệt.
    2. **Level 1 Buyer (Năng Lực Bên Mua)**: Kích hoạt khi doanh nghiệp nộp phiếu khảo sát nhu cầu, đăng bài toán kỹ thuật, hoặc nhấn "Kích hoạt vai trò Mua". Cấp quyền truy cập Bàn làm việc Bên Mua (`/portal/buyer/demands`), quản trị bài toán và nhận kết nối giải pháp.
    3. **Level 1 Seller (Năng Lực Bên Bán)**: Kích hoạt khi doanh nghiệp đăng tải hồ sơ chào bán công nghệ/thiết bị, hoặc nhấn "Kích hoạt vai trò Bán". Cấp quyền truy cập Bàn làm việc Bên Bán (`/portal/seller/dashboard`), quản trị danh mục công nghệ và SHTT.
    4. **Level 2 Dual Mode (Năng Lực Kép — ĐMST Toàn Diện)**: Kích hoạt khi doanh nghiệp thỏa mãn đồng thời cả 2 năng lực Buyer và Seller.
  - Trên giao diện Header và thanh điều hướng Bàn làm việc của Doanh nghiệp Level 2 Dual Mode, bắt buộc hiển thị **Bộ chuyển đổi ngữ cảnh (Context/Role Switcher Dropdown)** cho phép chuyển đổi 1-click giữa `[Bàn làm việc Bên Mua]` và `[Bàn làm việc Bên Bán]` mượt mà, lưu trạng thái vai trò tích cực (`active_role`) vào session/client-state.

- **`REQ-02-015` [Bản Sắc Doanh Nghiệp Thống Nhất SSOT & Xử Lý Kỹ Thuật MST Nullable]**:
  *(Mã tiếp nối hệ thống: `REQ-02-025` | PO Ref: `REQ-02-015`)*
  - Thực thể Doanh nghiệp được quy tụ DUY NHẤT tại bảng `enterprise.enterprises`. Tất cả các phân hệ liên quan (Tìm mua `TASK-03`, Chào bán `TASK-04`, Đánh giá ĐMST `TASK-02`, Kết nối `TASK-08`) đều liên kết khóa ngoại/tham chiếu đến `enterprise_id` hoặc `tax_code` của bảng này.
  - Thông tin định danh pháp nhân cốt lõi (MST, Tên doanh nghiệp, Tỉnh/thành phố, Địa chỉ chi tiết, Người đại diện/liên hệ, SĐT, Email, Ngành nghề chính, Quy mô) là duy nhất và nhất quán trên toàn hệ sinh thái.
  - **Kỹ thuật MST Nullability**: 
    - Cho phép tạo hồ sơ nháp (`DRAFT`) hoặc đăng ký sơ bộ khi doanh nghiệp chưa kịp bổ sung MST. Trường `tax_code` chấp nhận giá trị `NULL`.
    - Backend và Database áp dụng ràng buộc **Unique Constraint / Unique Partial Index** trên cột `tax_code` với điều kiện `tax_code IS NOT NULL`. Đảm bảo mọi MST khi đã được điền là DUY NHẤT trên toàn hệ thống, không bị xung đột khi có nhiều bản ghi `NULL`.

- **`REQ-02-016` [Định Danh & Ánh Xạ Cặp Tài Khoản Demo Buyer / Seller]**:
  *(Mã tiếp nối hệ thống: `REQ-02-026` | PO Ref: `REQ-02-016`)*
  - Hệ thống cấu hình cố định cơ chế ánh xạ dữ liệu (Seeding & Data Mapping) cho 2 tài khoản demo tiêu chuẩn:
    1. Tài khoản Demo Bên Mua:
       - Email: `buyer.user@demo.nacentech.vn`
       - Mật khẩu mặc định: `Demo@2026`
       - Gắn kết pháp nhân: **CÔNG TY TNHH TRƯỜNG HOAN**
       - Mã số thuế (MST): `0100255428`
       - Địa bàn: **Hà Nội**
       - Trạng thái năng lực khởi tạo: `BUYER` (Level 1 Buyer, sẵn sàng kích hoạt Dual Mode).
    2. Tài khoản Demo Bên Bán:
       - Email: `seller.user@demo.nacentech.vn`
       - Mật khẩu mặc định: `Demo@2026`
       - Gắn kết pháp nhân: **CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN**
       - Mã số thuế (MST): `0108992134`
       - Địa bàn: **Hà Nội**
       - Trạng thái năng lực khởi tạo: `SELLER` (Level 1 Seller, sẵn sàng kích hoạt Dual Mode).

### 8.3 Quy Tắc Nghiệp Vụ Mới (Business Rules)

- **`BR-02-006` [Quy Tắc Quản Lý Tính Duy Nhất Của Mã Số Thuế (TaxCode Nullability Invariant)]**:
  *(Mã tiếp nối hệ thống: `BR-02-012` | PO Ref: `BR-02-006`)*
  - Khi lưu trữ hồ sơ doanh nghiệp vào bảng `enterprise.enterprises`:
    - Nếu người dùng để trống hoặc truyền chuỗi rỗng (`""`), chuỗi chỉ chứa khoảng trắng (`"   "`), Backend Domain Service / Model Binder bắt buộc phải chuẩn hóa và chuyển thành `NULL` trước khi ghi vào Database.
    - CẤM lưu chuỗi rỗng `""` vào cột `tax_code` để tránh vi phạm lỗi Duplicate Key trên SQL Unique Constraint.
    - Khi `tax_code` khác `NULL`, hệ thống kích hoạt kiểm tra tính duy nhất. Nếu MST đã tồn tại trên một bản ghi khác, hệ thống chặn giao dịch và trả về lỗi `409 Conflict` kèm thông báo: *"Mã số thuế này đã được đăng ký trong hệ thống."*
- **`BR-02-013` [Nguyên Tắc Pháp Nhân Duy Nhất Trong Chuỗi Giá Trị (Single Legal Entity SSOT)]**:
  - Mỗi pháp nhân Doanh nghiệp chỉ có 1 bản ghi duy nhất tại `enterprise.enterprises`. Mọi hành động kích hoạt năng lực Bên Mua, Bên Bán, hay chỉnh sửa thông tin liên hệ đều tham chiếu và cập nhật vào chính bản ghi này, không tạo thêm bản ghi doanh nghiệp trùng lặp.
- **`BR-02-014` [Bảo Toàn Trạng Thái Ngữ Cảnh Vai Trò Kép (Dual-Role Context Invariant)]**:
  - Đối với tài khoản Doanh nghiệp đạt Level 2 Dual Mode, việc chuyển đổi giữa vai trò Mua và Bán chỉ thay đổi ngữ cảnh giao diện và phân quyền thao tác (Buyer Workspace vs Seller Workspace), không làm thay đổi định danh pháp nhân hay quyền sở hữu dữ liệu của Doanh nghiệp.

### 8.4 Tiêu Chuẩn Chấp Thuận Định Lượng (Acceptance Criteria)

- **`AC-02-013` (AC-TIER-01 — Chuyển Đổi Vai Trò Kép Mượt Mà)**:
  - Given tài khoản đã kích hoạt cả 2 năng lực Buyer và Seller (Level 2 Dual Mode),
  - When người dùng bấm chuyển đổi vai trò trên Context Switcher Header,
  - Then giao diện điều hướng ngay lập tức đến Workspace tương ứng trong thời gian $< 300\text{ms}$ mà không phát sinh phiên đăng nhập mới.
- **`AC-02-014` (AC-TIER-02 — Toàn Vẹn Ràng Buộc MST Nullable)**:
  - Given hệ thống cho phép tạo nhiều bản ghi hồ sơ nháp có `tax_code = NULL`,
  - When tạo bản ghi mới với `tax_code = ""` hoặc `"  "`,
  - Then CSDL lưu trữ giá trị `NULL` thành công.
  - When cập nhật hoặc tạo bản ghi mới với `tax_code` trùng với một MST đã có trong CSDL,
  - Then hệ thống từ chối và báo lỗi 409 Conflict chống trùng lặp.
- **`AC-02-015` (AC-TIER-03 — Xác Thực Ánh Xạ Tài Khoản Demo Chuẩn)**:
  - Given đăng nhập bằng tài khoản `buyer.user@demo.nacentech.vn`,
  - When kiểm tra thông tin pháp nhân liên kết,
  - Then hệ thống trả về đúng CÔNG TY TNHH TRƯỜNG HOAN (MST: `0100255428`).
  - Given đăng nhập bằng tài khoản `seller.user@demo.nacentech.vn`,
  - When kiểm tra thông tin pháp nhân liên kết,
  - Then hệ thống trả về đúng CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN (MST: `0108992134`).

---

## 9. DELTA CR-2026-019 / CR-008 — SEARCHABLE AUTOCOMPLETE COMBOBOX TỈNH THÀNH

- **Mục tiêu**: Chuyển đổi combobox/select địa bàn hoạt động (tỉnh/thành phố) từ dropdown tĩnh sang Searchable Autocomplete (Popover + Search input), hỗ trợ tìm kiếm gõ ký tự tiếng Việt có dấu/không dấu (diacritics-insensitive).
- **Phạm vi tác động**:
  1. `src/components/common/searchable-province-combobox.tsx`: Component dùng chung.
  2. `src/app/enterprises/page.tsx`: Bộ lọc Danh bạ Doanh nghiệp ĐMST và route alias `/doanh-nghiep-dmst`.
  3. `src/app/portal/enterprise/profile/page.tsx`: Biểu mẫu cập nhật hồ sơ doanh nghiệp.
- **Acceptance Criteria**:
  - `AC-02-016`: Gõ ký tự không dấu (ví dụ: "ha noi", "da nang") tự động lọc và gợi ý chính xác "Hà Nội", "Đà Nẵng". Chọn mục cập nhật state và kích hoạt tìm kiếm danh bạ tức thì.

---

## Spec Delta v5 (CR-2026-020): Phiếu Khảo Sát 43 Câu Hỏi Đánh Giá Năng Lực ĐMST & Tính Toán TNI Toàn Diện

> **Mã CR**: `CR-2026-020`  
> **Căn cứ**: Kế hoạch tổng thể `MASTER-PLAN-CR-2026-020-SURVEY43Q`, Tài liệu Thiết kế cơ sở [`BD_DELTA_CR_020_PHIEU_KHAO_SAT_43_CAU.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/BD_DELTA_CR_020_PHIEU_KHAO_SAT_43_CAU.md) và Wireframe [`wireframe_khao_sat_dmst_43_cau.html`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/wireframe_khao_sat_dmst_43_cau.html).  
> **Dữ liệu SSOT**: `Specification/01_DATA_RAW/Khảo sát 304 DN-final-2408.xlsx` (43 câu hỏi) & `SourceCode/backend/modules/enterprise/NacenTech.Modules.Enterprise/Application/InnovationRatingEngine.cs`.

### 10.1 Yêu Cầu Chức Năng Mới (Functional Requirements)

- **`REQ-02-025` [Giao Diện Khảo Sát Wizard 5 Bước Chuẩn Hóa 43 Câu Hỏi]**:
  - Hệ thống cung cấp route chuyên biệt `/khao-sat-dmst` (và đồng bộ tương thích `/khao-sat-nhu-cau`) tổ chức theo mô hình Wizard 5 bước tuần tự:
    - **Bước 1 (Câu 1 – 11)**: Định danh pháp nhân & Quy mô nền tảng (Tên DN, MST, Địa chỉ, Email, SĐT, Tỉnh thành, Ngành chính, Sở hữu, Lao động, Doanh thu, Tỷ lệ ĐH).
    - **Bước 2 (Câu 12 – 16)**: Quản trị & Nguồn lực ĐMST (Bộ phận R&D, Đào tạo 12 tháng, Đầu tư máy móc 3 năm, Ngân sách R&D, Nền tảng quản trị số ERP/CRM/HRM).
    - **Bước 3 (Câu 17 – 27)**: Đổi mới Sản phẩm, Quy trình & Chuyển đổi số (SP mới, Cải tiến SP, Quy trình mới, Đổi mới tổ chức, Đổi mới marketing, Mua công nghệ, Hiệu quả ĐMST, Chiến lược CĐS, Khâu số hóa, Công nghệ số tiên tiến).
    - **Bước 4 (Câu 28 – 36)**: Hợp tác Hệ sinh thái, Sở hữu trí tuệ & Thị trường (Hợp tác 7 đối tượng Viện/Trường/Quỹ/Nhà nước/Quốc tế, Hỗ trợ nhà nước, Tiếp cận vốn, Bằng Sáng chế/GPHI, Doanh thu SP mới, Xuất khẩu, Chuỗi giá trị).
    - **Bước 5 (Câu 37 – 43)**: Nhu cầu Công nghệ, Chỉ số TNI & Kiến nghị (Top rào cản, Nhu cầu hỗ trợ, Thang điểm 1-5 sao cho 8 loại thông tin công nghệ, Sẵn sàng phỏng vấn sâu, Sẵn sàng cập nhật CSDL, Tính năng sàn mong muốn, Textarea kiến nghị tự do).
  - Có thanh tiến trình (Progress Bar), chỉ báo phần trăm hoàn thành (20%, 40%, 60%, 80%, 100%), hỗ trợ điều hướng [Quay lại] và [Tiếp tục].

- **`REQ-02-026` [Cơ Chế Tự Động Điền Autofill Từ Hồ Sơ Đã Đăng Nhập & Khóa MST]**:
  - Khi người dùng đăng nhập tài khoản sở hữu hồ sơ doanh nghiệp (ví dụ tài khoản Demo Bên Mua `buyer.user@demo.nacentech.vn` với Công ty TNHH Trường Hoan, MST `0100255428`):
    - Hook `useEnterpriseAutofill` tự động kích hoạt gọi `GET /api/v1/surveys/innovation-demand/prefill` để lấy thông tin pháp nhân.
    - Điền sẵn toàn bộ Bước 1 (C01 - C11), các cờ R&D (C12, C15), thông tin xuất khẩu (C35), chuỗi giá trị (C36).
    - Bắt buộc khóa trường Mã số thuế (`tax_code` / `C02`) ở trạng thái `read-only`/`disabled` kèm huy hiệu xác thực: `[✓ Đã xác thực từ Hồ sơ Pháp nhân SSOT]`.
  - Đối với Khách vãng lai: Cho phép nhập MST; hỗ trợ tự động tra cứu hồ sơ công khai theo MST (Debounce 500ms) để gợi ý điền nhanh hoặc đăng nhập.

- **`REQ-02-027` [Entry Points Liên Thông Từ Trang Chủ Và Danh Bạ Doanh Nghiệp]**:
  - **Trên Trang Chủ (`src/app/page.tsx` & Header)**:
    - Bổ sung liên kết trên Header Navigation: *"Khảo sát ĐMST"* kèm badge `"43 câu"` dẫn sang `/khao-sat-dmst`.
    - Bổ sung 1 Thẻ hành động nhanh (Quick Action Card) tại khu vực giải pháp nổi bật trên Home: *"Đánh giá Năng lực Đổi mới sáng tạo (43 tiêu chuẩn)"* kèm nút CTA `[Bắt đầu khảo sát →]`.
  - **Trên Danh Bạ Doanh Nghiệp (`src/app/enterprises/page.tsx` & `/doanh-nghiep-dmst`)**:
    - Bổ sung Banner kêu gọi hành động (CTA Banner) ở đầu trang: *"Doanh nghiệp của bạn chưa có Điểm ĐMST & Huy hiệu Xác thực trên Nacentwin? Làm bài khảo sát 43 câu ngay để hiển thị trên CSDL Quốc gia và kết nối công nghệ"* kèm nút `[Làm khảo sát ngay (15 phút) ⚡]`.

- **`REQ-02-028` [Lưu Nháp Tức Thời LocalStorage & Khôi Phục Phiên Làm Việc]**:
  - Tự động serialize toàn bộ giá trị 43 câu hỏi vào `localStorage` của trình duyệt theo key: `nacentwin_survey_43q_draft_{userId || 'guest'}` với cơ chế Debounce 600ms sau mỗi thao tác nhập liệu.
  - Hiển thị nhãn trạng thái thời gian thực: `[✓ Đã lưu nháp tự động lúc HH:mm:ss]`.
  - Khi tải lại trang (F5) hoặc mở lại trình duyệt trong vòng 7 ngày, hệ thống hiển thị thông báo khôi phục phiên làm dở để người dùng tiếp tục không bị mất dữ liệu.

---

### 10.2 Quy Tắc Nghiệp Vụ Mới (Business Rules)

- **`BR-02-015` [Quy Tắc Autofill & Khóa Trường Định Danh Mã Số Thuế]**:
  - Khi phiên làm việc là người dùng đã đăng nhập (`isAuthenticated == true`), trường `tax_code` là bất biến (Immutable), cấm người dùng sửa đổi trên UI.
  - Backend API (`POST /api/v1/surveys/innovation-demand/submit`) bắt buộc kiểm tra đối chiếu: `tax_code` gửi lên phải trùng khớp với mã số thuế của Doanh nghiệp liên kết trong Identity Token. Mọi hành vi cố tình giả mạo hoặc gửi sai lệch MST đều bị chặn với mã lỗi `403 Forbidden` (`ERR_TAX_CODE_MISMATCH`).
- **`BR-02-016` [Data Binding Tức Thời Sang Engine ĐMST & Thuật Toán TNI Trong 1 Transaction]**:
  - Thao tác nộp phiếu khảo sát thành công kích hoạt đồng thời 3 hành động trong một Database Transaction:
    1. Ghi nhận dữ liệu 43 câu hỏi dạng JSONB vào `demand.demand_surveys`.
    2. Kích hoạt `InnovationRatingEngine.Calculate()` tính toán điểm 8 nhóm năng lực (Quản trị 12đ, R&D & CN 18đ, SP/Quy trình 20đ, SHTT 10đ, CĐS 10đ, Thị trường 15đ, Nhân lực 7đ, Liên kết 8đ), xếp hạng Huy hiệu (`LEADING`, `DEVELOPING`, `POTENTIAL`, `UNRATED`), lưu bản ghi vào `enterprise.innovation_evaluations` và cập nhật `enterprises.latest_innovation_score`.
    3. Kích hoạt `TniCalculationEngine.Calculate()` trích xuất 4 tham số $K, L, N, O$ (thang 1 - 5) theo công thức $TNI = \text{ROUND}((K \times 35 + L \times 30 + N \times 20 + O \times 15) / 5)$, phân loại 4 cấp độ và cập nhật vào `enterprises.tni_score` và `enterprises.tni_classification`.
- **`BR-02-017` [Toàn Vẹn Dữ Liệu JSONB & Bảo Mật PII Theo Nghị Định 13/2023]**:
  - Toàn bộ 43 trường câu hỏi khảo sát được lưu trữ bảo toàn (Zero Data Loss) trong cột `survey_answers` kiểu JSONB của bảng `demand_surveys`.
  - Doanh thu năm (C09), ngân sách R&D (C15) và số điện thoại người liên hệ (C04) trong phiếu khảo sát được bảo vệ theo `BR-02-002`, không hiển thị công khai ra bên ngoài khi chưa được Chủ sở hữu cấp phép.

---

### 10.3 Tiêu Chuẩn Chấp Thuận Định Lượng (Acceptance Criteria)

- **`AC-02-016` (AC-TIER-01 — Autofill Happy Path Với Tài Khoản Đã Đăng Nhập)**:
  - Given người dùng đăng nhập tài khoản `buyer.user@demo.nacentech.vn`,
  - When truy cập trang `/khao-sat-dmst`,
  - Then Bước 1 tự động hiển thị:
    - Tên DN: `CÔNG TY TNHH TRƯỜNG HOAN`
    - Mã số thuế: `0100255428` ở trạng thái `read-only`/`disabled` kèm huy hiệu `[✓ Đã xác thực từ Hồ sơ Pháp nhân SSOT]`
    - Tỉnh thành: `Hà Nội`, Ngành: `Nông nghiệp công nghệ cao, nông nghiệp số (LV01)`
    - Cờ R&D và ngân sách tại Bước 2 hiển thị đúng trạng thái hiện tại của hồ sơ.
- **`AC-02-017` (AC-TIER-02 — Chấm Điểm Tức Thời Sau Khi Nộp Khảo Sát)**:
  - Given người dùng điền đầy đủ các câu hỏi bắt buộc từ Bước 1 đến Bước 5,
  - When bấm nút *"Nộp Phiếu Khảo Sát"*,
  - Then hệ thống xử lý hoàn tất trong thời gian $< 500\text{ms}$,
  - And trả về kết quả gồm:
    - Điểm ĐMST tổng hợp (thang 100), xếp hạng phân tầng và biểu đồ Radar Chart 8 trục.
    - Điểm TNI (thang 100) và phân loại nhu cầu (Rất cao, Cao, Trung bình, Thấp).
  - And truy vấn trực tiếp CSDL PostgreSQL xác nhận bản ghi `enterprise.innovation_evaluations` và `demand.demand_surveys` đã được tạo mới thành công, trường `enterprises.latest_innovation_score` và `enterprises.tni_score` được cập nhật chính xác.
- **`AC-02-018` (AC-TIER-03 — Điều Hướng Mượt Mà Từ Home & Danh Bạ)**:
  - Given người dùng đang ở Trang chủ (`/`) hoặc Danh bạ Doanh nghiệp (`/enterprises` hoặc `/doanh-nghiep-dmst`),
  - When bấm vào Quick Action Card trên Home hoặc Banner CTA trên Danh bạ,
  - Then hệ thống điều hướng đến trang `/khao-sat-dmst` trong thời gian $< 200\text{ms}$ mà không phát sinh lỗi trang trắng, không reload toàn bộ trang (Client-side routing).

---

## 11. DELTA CR-021: BỘ LỌC TRÌNH ĐỘ TT17 & ĐIỂM ĐÁNH GIÁ NĂNG LỰC TRÊN CARD DN

> **Mã CR**: `CR-2026-021-TT17-FILTER-CARD`  
> **Căn cứ pháp lý & Thiết kế cơ sở**:
> 1. Thông tư số 17/2019/TT-BKHCN ngày 10/12/2019 của Bộ KH&CN (Điều 9, Điều 10 về phân loại trình độ & năng lực công nghệ).
> 2. Tài liệu Thiết kế cơ sở Delta: [`Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/BD_DELTA_CR_021_BO_LOC_VA_DIEM_TT17.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/02_BASIC_DESIGN/TASK-02_HO_SO_CHU_THE_VA_DN_DMST/BD_DELTA_CR_021_BO_LOC_VA_DIEM_TT17.md).
> 3. Quyết định PO: Giai đoạn Gate 1 (DoR Approved) ngày 28/10/2026.
> 4. Phạm vi màn hình: Danh bạ Doanh nghiệp ĐMST (`/enterprises` và alias `/doanh-nghiep-dmst`).

### 11.1 Yêu Cầu Chức Năng (Functional Requirements)

- **`REQ-02-DELTA-01` [Bộ Lọc Trình Độ Công Nghệ TT17 Đa Phân Hạng]**:
  - Hệ thống bổ sung Bộ lọc Trình độ công nghệ TT17 trên Sidebar Danh bạ Doanh nghiệp (`EnterprisesDirectoryView.tsx`), hỗ trợ lọc tức thời theo 5 phân hạng chuẩn hóa:
    1. **`TIEN_TIEN`**: Tiên tiến (Tổng điểm $\tau \ge 75$ và Hệ số đồng bộ $T_{ĐB} \ge 0.65$).
    2. **`TRUNG_BINH_TIEN_TIEN`**: Trung bình tiên tiến ($60 \le \tau < 75$ và $T_{ĐB} \ge 0.50$, hoặc $\tau \ge 75$ nhưng $T_{ĐB} < 0.65$).
    3. **`TRUNG_BINH`**: Trung bình ($35 \le \tau < 60$ và $T_{ĐB} \ge 0.30$, hoặc $60 \le \tau < 75$ nhưng $T_{ĐB} < 0.50$).
    4. **`LAC_HAU`**: Lạc hậu ($\tau < 35$ hoặc vi phạm hệ số đồng bộ $T_{ĐB} < 0.30$).
    5. **`UNRATED`**: Chưa đánh giá (Doanh nghiệp chưa hoàn thành khảo sát 26 tiêu chí TT17).
  - Tích hợp liên hoàn với các bộ lọc hiện hữu (Địa bàn 34 tỉnh, 11 lĩnh vực công nghệ, Loại hình chủ thể, Phân tầng TNI, Mức độ ĐMST); cập nhật query param `tt17Classification` trên URL và nút "Xóa tất cả".

- **`REQ-02-DELTA-02` [Tiêu Chí Sắp Xếp `tt17_desc` — Điểm Trình Độ TT17 Cao Nhất]**:
  - Dropdown Sắp xếp tại thanh công cụ phía trên Grid bổ sung tùy chọn:
    - Nhãn hiển thị: `"Điểm trình độ TT17 cao nhất"` (Value: `tt17_desc`).
    - Vị trí: Đặt ở vị trí ưu tiên thứ 2 (ngay sau `"Chỉ số TNI cao nhất"`).
  - Khi kích hoạt `sortBy=tt17_desc`, hệ thống sắp xếp danh sách doanh nghiệp giảm dần theo Điểm đánh giá TT17 (`LatestTt17Score DESC NULLS LAST`), sau đó sắp xếp phụ theo Hệ số đồng bộ (`LatestTt17SyncCoeff DESC NULLS LAST`).

- **`REQ-02-DELTA-03` [Hiển Thị Trình Độ & Điểm Số TT17 Trên Thẻ Doanh Nghiệp (Enterprise Card)]**:
  - Nâng cấp layout thẻ doanh nghiệp tại Grid kết quả tra cứu:
    - **Tại Tầng 1 (Header Card)**: Hiển thị Huy hiệu phân hạng TT17 bên cạnh MST và Huy hiệu Đã xác thực:
      - `TIEN_TIEN`: Badge màu xanh dương (`bg-sky-50 text-sky-700 border-sky-300`) với nhãn `🚀 Tiên tiến (TT17)`.
      - `TRUNG_BINH_TIEN_TIEN`: Badge màu ngọc bích (`bg-emerald-50 text-emerald-700 border-emerald-300`) với nhãn `⚡ TB Tiên tiến (TT17)`.
      - `TRUNG_BINH`: Badge màu xám slate (`bg-slate-100 text-slate-700 border-slate-300`) với nhãn `⚙️ Trung bình (TT17)`.
      - `LAC_HAU`: Badge màu hồng đậm (`bg-rose-50 text-rose-700 border-rose-300`) với nhãn `⚠️ Lạc hậu (TT17)`.
    - **Tại Tầng 4 (Metric Dashboard Card)**: Tái cấu trúc thành Hộp chỉ số 2 cột song hành đối quát 2 trục:
      - *Cột 1*: **Chỉ số Nhu cầu TNI** (Trục Cầu — Thang 100đ, mức độ cấp thiết và phân tầng nhu cầu).
      - *Cột 2*: **Trình độ Công nghệ TT17** (Trục Cung/Năng lực — Điểm $\tau/100$, phân hạng chính thức và Hệ số đồng bộ $T_{ĐB}$). Đối với doanh nghiệp chưa đánh giá, hiển thị `--/100` kèm chú thích mờ `"Chưa đánh giá TT17"`.

---

### 11.2 Quy Tắc Nghiệp Vụ (Business Rules)

- **`BR-02-DELTA-01` [Quy Tắc Phân Hạng TT17 Chuẩn Điều 10 TT 17/2019/TT-BKHCN & Hệ Số Đồng Bộ $T_{ĐB}$]**:
  - Tổng điểm đánh giá $\tau$ là tổng đại số của 5 nhóm tiêu chí (thang điểm 100):
    $$\tau = T + E + O + R + I \quad (0 \le \tau \le 100)$$
    Trong đó: $T \le 30$ (Hiện trạng thiết bị), $E \le 20$ (Khai thác CN), $O \le 19$ (Tổ chức/quản lý), $R \le 17$ (Nghiên cứu/phát triển), $I \le 14$ (Đổi mới sáng tạo).
  - Hệ số đồng bộ công nghệ $T_{ĐB}$ được tính theo trung bình nhân có trọng số của 5 nhóm:
    $$T_{ĐB} = \left(\frac{T}{30}\right)^{0,30} \times \left(\frac{E}{20}\right)^{0,20} \times \left(\frac{O}{19}\right)^{0,19} \times \left(\frac{R}{17}\right)^{0,17} \times \left(\frac{I}{14}\right)^{0,14}$$
  - **Quy tắc hạ bậc phân loại bắt buộc**:
    1. Nếu $\tau \ge 75$: Đạt hạng **Tiên tiến** NẾU $T_{ĐB} \ge 0.65$. Nếu $T_{ĐB} < 0.65$, tự động hạ xuống hạng **Trung bình tiên tiến**.
    2. Nếu $60 \le \tau < 75$: Đạt hạng **Trung bình tiên tiến** NẾU $T_{ĐB} \ge 0.50$. Nếu $T_{ĐB} < 0.50$, tự động hạ xuống hạng **Trung bình**.
    3. Nếu $35 \le \tau < 60$: Đạt hạng **Trung bình** NẾU $T_{ĐB} \ge 0.30$. Nếu $T_{ĐB} < 0.30$, tự động hạ xuống hạng **Lạc hậu**.
    4. Nếu $\tau < 35$: Luôn xếp hạng **Lạc hậu**.

---

### 11.3 Thiết Kế Dữ Liệu & Hợp Đồng DTO (Database & DTO Contracts)

- **`DB-02-DELTA-01` [Ánh Xạ Dữ Liệu Đánh Giá TT17 Sang `EnterprisePublicDirectoryItemDto`]**:
  - Hợp đồng DTO `EnterprisePublicDirectoryItemDto` trong `NacenTech.Modules.Enterprise.Application` được mở rộng với 3 trường dữ liệu:
    ```csharp
    public sealed record EnterprisePublicDirectoryItemDto(
        Guid Id,
        string Name,
        string? TaxCode,
        string SubjectType,
        string ProvinceCity,
        string MainSectorName,
        string? SectorCode,
        string? WorkforceScale,
        bool IsVerified,
        decimal? TniScore,
        string? TniClassification,
        int IpCount,
        string Status,
        string? OwnershipType = null,
        string? OperatingZone = null,
        bool HasRdUnit = false,
        bool IsExporting = false,
        bool InValueChain = false,
        IReadOnlyList<string>? TopBottlenecks = null,
        IReadOnlyList<string>? SupportNeeds = null,
        decimal? InnovationScore = null,
        string? InnovationTier = null,
        string? InnovationBadge = null,
        string? Website = null,
        // Bổ sung các trường TT17 theo DB-02-DELTA-01:
        decimal? Tt17Score = null,
        string? Tt17Classification = null,
        decimal? Tt17SyncCoefficient = null
    );
    ```
  - Tại tầng Persistence (`EfEnterpriseRepository.cs`), truy vấn `SearchAsync` nạp trực tiếp giá trị `LatestTt17Score`, `LatestTt17Tier`, `LatestTt17SyncCoeff` từ bảng `enterprise.enterprises` (được đồng bộ tự động từ phân hệ `assessment.tt17_assessments`), đảm bảo thời gian truy vấn $< 200\text{ms}$ cho 304 DN.

---

### 11.4 Quy Chuẩn Giao Diện & 5 Trạng Thái UX (UI/UX Specification)

- **`UI-02-DELTA-01` [Chuẩn Hóa 5 UX States Cho Bộ Lọc & Danh Bạ TT17]**:
  - Giao diện component `EnterprisesDirectoryView.tsx` xử lý triệt để 5 trạng thái UX qua bộ wrapper thống nhất:
    1. **Loading State**: Hiển thị lưới 6 Skeleton Card nhấp nháy (Shimmer/Pulse) giữ nguyên tỷ lệ chiều cao, bố cục Badge Tầng 1 và Box Tầng 4 dạng placeholder màu xám mờ.
    2. **Empty State**: Khi người dùng áp bộ lọc phân hạng TT17 mà không có doanh nghiệp nào phù hợp, hiển thị minh họa Empty State với thông điệp: *"Không tìm thấy doanh nghiệp nào thuộc phân hạng TT17 đã chọn trên địa bàn này"* kèm nút bấm `[Xóa bộ lọc TT17]` và `[Khám phá tất cả DN]`.
    3. **Error State**: Khi kết nối API gặp sự cố hoặc timeout, hiển thị Card lỗi màu hổ phách/đỏ nhạt kèm thông báo tiếng Việt rõ nghĩa và nút `[Thử tải lại]`.
    4. **Success State**: Hiển thị danh sách doanh nghiệp phân trang (9 DN/trang), gắn Badge TT17 Tầng 1 và Box điểm 2 cột Tầng 4 sắc nét, phản hồi chuyển trang $< 300\text{ms}$.
    5. **Partial State**: Đối với doanh nghiệp đã có hồ sơ và điểm TNI nhưng chưa đánh giá TT17, Card không hiển thị lỗi mà hiển thị box Trình độ TT17 ở trạng thái nhạt `--/100` kèm dòng chữ `Chưa đánh giá TT17` và gợi ý liên kết đến trang khảo sát.

---

### 11.5 Tiêu Chuẩn Chấp Thuận Định Lượng (Acceptance Criteria)

- **`AC-02-DELTA-01` (AC-TIER-01 — Lọc Phân Hạng TT17 Chính Xác)**:
  - Given người dùng đang ở trang `/enterprises` hoặc `/doanh-nghiep-dmst`,
  - When chọn phân hạng `"Tiên tiến (≥ 75đ & T_ĐB ≥ 0.65)"` trên bộ lọc TT17,
  - Then danh sách trả về 100% doanh nghiệp có `Tt17Classification == 'TIEN_TIEN'`,
  - And URL cập nhật tham số `?tt17Classification=TIEN_TIEN` mà không tải lại toàn trang.

- **`AC-02-DELTA-02` (AC-TIER-02 — Sắp Xếp Giảm Dần Theo Điểm TT17)**:
  - Given người dùng chọn tùy chọn `"Điểm trình độ TT17 cao nhất"` trên Menu Sắp xếp,
  - When danh sách hiển thị kết quả,
  - Then thứ tự doanh nghiệp tuân thủ nghiêm ngặt: Doanh nghiệp có `Tt17Score` cao hơn đứng trước; trường hợp cùng điểm số thì doanh nghiệp có `Tt17SyncCoefficient` cao hơn đứng trước; các doanh nghiệp chưa đánh giá (`Tt17Score == null`) xếp cuối cùng.

- **`AC-02-DELTA-03` (AC-TIER-03 — Hiển Thị Song Hành 2 Trục TT17 & TNI Trên Card)**:
  - Given một doanh nghiệp đã có kết quả đánh giá TT17 và khảo sát TNI,
  - When Card doanh nghiệp render trên màn hình,
  - Then Tầng 1 hiển thị Badge phân hạng TT17 với màu sắc và nhãn tương ứng,
  - And Tầng 4 chia 2 cột rõ rệt: Cột trái hiển thị Chỉ số TNI và phân loại nhu cầu; Cột phải hiển thị Điểm TT17 ($\tau$) và Hệ số đồng bộ ($T_{ĐB}$).

- **`AC-02-DELTA-04` (AC-TIER-04 — Tuân Thủ Luật Hạ Bậc Đồng Bộ BR-02-DELTA-01)**:
  - Given doanh nghiệp có tổng điểm $\tau = 80$ nhưng hệ số đồng bộ $T_{ĐB} = 0.58$ ($< 0.65$),
  - When hệ thống tính toán và hiển thị phân hạng,
  - Then phân hạng bị hạ xuống `TRUNG_BINH_TIEN_TIEN`, Badge hiển thị `⚡ TB Tiên tiến (TT17)`, tuyệt đối không được gán nhãn `TIEN_TIEN`.

---

### 11.6 Ma Trận Truy Vết Toàn Trình (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Dữ Liệu & Hợp Đồng (DB) | Giao Diện Người Dùng (UI) | Tiêu Chuẩn Chấp Thuận (AC) |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-02-DELTA-01`** | `BR-02-DELTA-01` | `DB-02-DELTA-01` | `UI-02-DELTA-01` | `AC-02-DELTA-01` |
| **`REQ-02-DELTA-02`** | `BR-02-DELTA-01` | `DB-02-DELTA-01` | `UI-02-DELTA-01` | `AC-02-DELTA-02` |
| **`REQ-02-DELTA-03`** | `BR-02-DELTA-01` | `DB-02-DELTA-01` | `UI-02-DELTA-01` | `AC-02-DELTA-03`, `AC-02-DELTA-04` |

---

## 12. PHỤ LỤC DELTA V4 (CR-2026-011): CHUẨN HÓA TAXONOMY 10 LĨNH VỰC TT17 & TRIỆT TIÊU MẢNG TĨNH SAI LỆCH MÃ TẠI DANH BẠ DOANH NGHIỆP

### 12.1 Bối Cảnh & Mục Tiêu Phẫu Thuật
- **Phát hiện lỗi nghiêm trọng**: `EnterprisesDirectoryView.tsx` đang sử dụng mảng tĩnh `SECTORS_TT17` với 11 phần tử gán sai lệch mã hoàn toàn so với CSDL PostgreSQL (`LV01` thành Cơ khí, `LV05` thành Nông nghiệp, `LV07` thành Y Dược...).
- **Mục tiêu**: Xóa bỏ 100% mảng tĩnh này, chuyển sang nạp động từ service `getActiveSectors()` (`@/lib/master-data-client`), khôi phục tính chính xác tuyệt đối của bộ lọc Lĩnh vực công nghệ cho 304 DN.

### 12.2 Danh Mục 10 Lĩnh Vực Công Nghệ Chuẩn TT17 SSOT
Danh sách nạp động từ CSDL PostgreSQL (`policy.taxonomy_terms` với `kind = 'SECTOR'`, `is_active = true`):
1. `LV01`: **Nông nghiệp**
2. `LV05`: **Chế biến thực phẩm – đồ uống**
3. `LV07`: **Cơ khí – chế tạo – công nghiệp hỗ trợ**
4. `LV08`: **Điện – điện tử – tự động hóa**
5. `LV11`: **Nước – môi trường – chất thải**
6. `LV12`: **Xây dựng – vật liệu – hạ tầng**
7. `LV14`: **Logistics – vận tải – kho bãi**
8. `LV15`: **Du lịch – khách sạn – nhà hàng**
9. `LV16`: **CNTT – viễn thông – chuyển đổi số**
10. `LV17`: **Khoa học – công nghệ – đổi mới sáng tạo**

### 12.3 Đặc Tả Yêu Cầu Kỹ Thuật Chi Tiết
- **`REQ-02-DELTA-04` (Nạp Động Taxonomy Ngành Khớp 1:1 CSDL)**:
  - Component `EnterprisesDirectoryView` nạp danh mục ngành thông qua `getActiveSectors()`.
  - Dropdown lọc ngành gồm tùy chọn mặc định `{ code: "", name: "Tất cả lĩnh vực công nghệ" }` và 10 lĩnh vực chuẩn.
  - Cấm khai báo mảng tĩnh, cấm gán nhãn sai lệch mã.
- **`REQ-02-DELTA-05` (Zero-Mock Dashboard Thống Kê Doanh Nghiệp)**:
  - Trang `/admin/enterprises/dashboard` nạp 100% số liệu từ endpoint `GET /api/v1/admin/enterprises/dashboard`.
  - Số liệu `totalEnterprises`, `verifiedCount`, phân bổ `byProvince`, `bySector`, `byTni` phải được truy vấn thời gian thực từ bảng `enterprise.enterprises`.
- **`AC-02-DELTA-05` (Kiểm Thử Khớp Mã Ngành Thực Tế)**:
  - Given người dùng lọc theo "Nông nghiệp" tại Danh bạ Doanh nghiệp,
  - When hệ thống thực hiện truy vấn,
  - Then tham số gửi lên API là `sectorCode=LV01`, và danh sách chỉ hiển thị các doanh nghiệp nông nghiệp thực sự.

---

## 13. PHỤ LỤC DELTA V6 (CR-2026-024-PART2): NÂNG CẤP VÀ CẤP QUYỀN DN ĐMST QUA CỔNG KIỂM DUYỆT CẤP TỈNH (ENTERPRISE APPROVAL & ROLE UPGRADE)

### 13.1 Bối Cảnh & Mục Tiêu Phẫu Thuật Nghiệp Vụ
- **Hiện trạng cũ (As-Is)** [VERIFIED]:
  * Khi người dùng nộp yêu cầu nâng cấp vai trò Doanh nghiệp ĐMST (`INSTITUTION`), backend tạo bản ghi vào `identity.approval_requests` với `ScopeType = 'PROVINCE'`, `ScopeId = '<ProvinceCode>'` (ví dụ `"HN"`, `"HCM"`).
  * Khi Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN`) phê duyệt hồ sơ trên Cổng Công Vụ (`/gov/approvals`), backend cố gắng parse `ScopeId` sang Guid (`Guid.TryParse(request.ScopeId, out var orgId)`), dẫn đến thất bại vì `ScopeId` là chuỗi mã tỉnh.
  * Backend hoàn toàn không gán role `INNOVATION_ENTITY` cho người dùng (`Person`), cũng không tạo mới hoặc liên kết thực thể `Enterprise` trong CSDL.
  * Hậu quả: Tài khoản người dùng vẫn bị kẹt vĩnh viễn ở `PUBLIC_USER`, không thể truy cập Bàn làm việc Doanh nghiệp (`/portal/enterprise/profile`), và không được cấp Huy hiệu Xác thực.
- **Mục tiêu đề xuất (To-Be)** [PROPOSAL]:
  * Chuẩn hóa side effect: Khi phê duyệt hồ sơ `INSTITUTION`, tự động thăng hạng role `INNOVATION_ENTITY` kèm Scope Tỉnh cho tài khoản người nộp.
  * Tự động trích xuất `taxCode` và `companyName` từ `PayloadJson` để tạo mới hoặc liên kết thực thể `Enterprise` ở trạng thái xác thực `VERIFIED` (`IsVerified = true`, `VerificationStatus = "VERIFIED"`, `OwnerPersonId = user.Id`).

### 13.2 Quy Chuẩn Nghiệp Vụ & Yêu Cầu Kỹ Thuật Chi Tiết

- **`REQ-02-011` [Thẩm Định & Phê Duyệt Nâng Cấp Doanh Nghiệp ĐMST Cấp Tỉnh Từ Cổng Công Vụ]**:
  - Cán bộ/Lãnh đạo Sở KH&CN (`PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) tại Cổng Công Vụ (`/gov/approvals`, Tab ĐƠN VỊ / DOANH NGHIỆP ĐMST) tiếp nhận, thẩm định hồ sơ nâng cấp loại `INSTITUTION` thuộc phạm vi tỉnh quản lý.
  - Khi phê duyệt (`APPROVE`), hệ thống tự động kích hoạt chuỗi side effects: thăng hạng vai trò `INNOVATION_ENTITY` và tạo/liên kết thực thể `Enterprise` đã xác thực (`IsVerified = true`).
  - Khi từ chối (`REJECT`) hoặc yêu cầu sửa đổi (`REQUEST_CHANGES`), cán bộ bắt buộc nhập lý do tối thiểu 10 ký tự; trạng thái vai trò người dùng được giữ nguyên.

- **`BR-02-007` [Chuẩn Hóa Liên Thông Hạt Nhân & Kích Hoạt Quyền Hạn Doanh Nghiệp ĐMST Khi Thẩm Định Cấp Tỉnh Phê Duyệt]**:
  1. Khi hồ sơ nâng cấp `INSTITUTION` được phê duyệt:
     - **Thăng hạng vai trò**: Gọi `person.AssignRoleAndScope(PlatformRoles.InnovationEntity, request.ScopeType, request.ScopeId)` để nâng cấp tài khoản nộp đơn thành `INNOVATION_ENTITY` với phạm vi cấp Tỉnh (`ScopeType = "PROVINCE"`, `ScopeId = request.ScopeId`).
     - **Trích xuất thông tin định danh**: Trích xuất `taxCode` và `companyName` (hoặc `orgName`) từ `request.PayloadJson`.
     - **Đồng bộ thực thể `Enterprise`**:
       * Nếu `taxCode` đã tồn tại trong CSDL `enterprise.enterprises`: Liên kết `OwnerPersonId = request.UserId`, chuyển trạng thái `Status = "ACTIVE"`, `VerificationStatus = "VERIFIED"`, `IsVerified = true`, gọi `Approve(...)`.
       * Nếu `taxCode` chưa tồn tại trong CSDL: Khởi tạo mới bản ghi `Enterprise` với các thông tin đã trích xuất, `OwnerPersonId = request.UserId`, `Status = "ACTIVE"`, `VerificationStatus = "VERIFIED"`, `IsVerified = true`.
  2. Tuyệt đối không parse `ScopeId` sang Guid khi `ScopeType == ScopeTypes.Province`.
  3. Khi hồ sơ bị thu hồi (`REVOKE`), hệ thống hạ cấp tài khoản về `PUBLIC_USER` và hủy kích hoạt `IsVerified = false` của doanh nghiệp liên kết.

- **`API-02-008` [Hợp Đồng Endpoint Phê Duyệt Nâng Cấp DN ĐMST (Review Approval Contract)]**:
  - Route: `POST /api/v1/governance/approvals/{id}/review`
  - Headers: `Authorization: Bearer <token>` (Yêu cầu vai trò `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`, `SUPER_ADMIN`, `OPERATOR_ADMIN`)
  - Request Body:
    ```json
    {
      "action": "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "REVOKE",
      "reviewNote": "string (>= 10 ký tự nếu REJECT, REQUEST_CHANGES, REVOKE)",
      "expectedVersion": 1
    }
    ```
  - Xử lý Atomicity: Cập nhật `approval_requests`, thăng hạng `Person`, và tạo/kích hoạt `Enterprise` trong cùng một Database Transaction.

- **`TEST-02-009` [Bộ Kiểm Thử Bất Biến & Tích Hợp Duyệt Nâng Cấp DN ĐMST]**:
  - Test Invariant: Đảm bảo khi duyệt `INSTITUTION` với `ScopeId` là chuỗi mã tỉnh (ví dụ `"HN"`), không ném exception format Guid, tài khoản chuyển thành `INNOVATION_ENTITY`.
  - Test Integration: Gửi hồ sơ nâng cấp kèm MST và tên DN -> Cán bộ Sở duyệt -> Kiểm tra CSDL thực tế: `Person.PlatformRole == "INNOVATION_ENTITY"`, `Enterprise.OwnerPersonId == Person.Id`, `Enterprise.IsVerified == true`.
  - Test Revoke: SuperAdmin thu hồi -> Tài khoản hạ cấp `PUBLIC_USER`, doanh nghiệp chuyển `IsVerified == false`.

### 13.3 Tiêu Chuẩn Chấp Thuận Định Lượng (Acceptance Criteria)

- **`AC-02-040` (Thăng Hạng Role INNOVATION_ENTITY Cấp Tỉnh)**:
  - Given người dùng mang vai trò `PUBLIC_USER` nộp hồ sơ nâng cấp loại `INSTITUTION` với địa bàn `"HN"`,
  - When Cán bộ Sở Hà Nội (`PROVINCIAL_ADMIN`, Scope `"HN"`) phê duyệt hồ sơ (`APPROVE`),
  - Then tài khoản người dùng được gán vai trò `INNOVATION_ENTITY`, `ScopeType = "PROVINCE"`, `ScopeId = "HN"`.

- **`AC-02-041` (Trích Xuất PayloadJson & Liên Kết OwnerPersonId)**:
  - Given hồ sơ `INSTITUTION` chứa `payloadJson` có `taxCode` và `companyName`,
  - When hệ thống thực thi side effect phê duyệt,
  - Then hệ thống trích xuất chính xác `taxCode` và `companyName`, gán `OwnerPersonId = request.UserId` cho thực thể `Enterprise`.

- **`AC-02-042` (Kích Hoạt Trạng Thái Doanh Nghiệp VERIFIED)**:
  - Given thực thể doanh nghiệp được liên kết hoặc tạo mới từ yêu cầu duyệt,
  - When side effect hoàn tất,
  - Then thuộc tính `IsVerified` của doanh nghiệp mang giá trị `true`, `VerificationStatus = "VERIFIED"`, `Status = "ACTIVE"`.

- **`AC-02-043` (Xử Lý ScopeId Chuỗi Không Phải Guid)**:
  - Given hồ sơ nâng cấp có `ScopeId` là chuỗi mã tỉnh (ví dụ `"HN"`, `"HCM"`),
  - When hàm xử lý side effect được triệu gọi,
  - Then hệ thống xử lý trơn tru mà không dùng `Guid.TryParse`, không gây lỗi hoặc bỏ qua bước kích hoạt quyền hạn.

- **`AC-02-044` (Quyền Truy Cập Tức Thời Bàn Làm Việc Doanh Nghiệp)**:
  - Given người dùng vừa được phê duyệt nâng cấp thành công,
  - When người dùng đăng nhập hoặc làm mới token tại `/portal/enterprise/profile`,
  - Then người dùng được cấp quyền truy cập Bàn làm việc Doanh nghiệp 10 nhóm trường mà không bị từ chối 403 Forbidden.

- **`AC-02-045` (Kiểm Toán Bất Biến Before/After Đầy Đủ)**:
  - Given hành động phê duyệt hồ sơ `INSTITUTION`,
  - When giao dịch lưu trữ CSDL hoàn tất,
  - Then một bản ghi `identity.approval_audit_logs` được tạo mới với `action = "REVIEW_APPROVE"`, ghi nhận đầy đủ ActorId, Role, Timestamp, IP và Payload chi tiết.

### 13.4 Ma Trận Truy Vết Toàn Trình (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Hợp Đồng API (API) | Kịch Bản Kiểm Thử (TEST) | Tiêu Chuẩn Chấp Thuận (AC) |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-040` (Thăng hạng Role INNOVATION_ENTITY) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-041` (Trích xuất Payload & Liên kết Owner) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-042` (Kích hoạt Enterprise VERIFIED) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-043` (ScopeId String Handler) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-044` (Truy cập Portal Enterprise) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-045` (Kiểm toán Audit Log) |




