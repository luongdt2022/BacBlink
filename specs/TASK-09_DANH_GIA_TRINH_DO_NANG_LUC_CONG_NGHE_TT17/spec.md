# Đặc Tả Yêu Cầu Kỹ Thuật (Feature Specification)
# TASK-09: ĐÁNH GIÁ TRÌNH ĐỘ & NĂNG LỰC CÔNG NGHỆ SẢN XUẤT (TT17)

> **Mã Epic**: `TASK-09_DANH_GIA_TRINH_DO_NANG_LUC_CONG_NGHE_TT17`  
> **Căn cứ pháp lý**: [Thông tư 17/2019/TT-BKHCN](https://congbao.chinhphu.vn/van-ban/thong-tu-so-17-2019-tt-bkhcn-30405/29385.htm) của Bộ Khoa học và Công nghệ  
> **Phạm vi áp dụng**: Doanh nghiệp ngành công nghiệp chế biến, chế tạo (mã ngành C.10 – C.32 theo VSIC)  
> **Trạng thái**: 🟡 In-Progress (Đang thực hiện Spec Kit & Phát triển)  
> **Độ ưu tiên**: P1 (Trọng tâm Đánh giá Năng lực Doanh nghiệp Sản xuất)

---

## 1. TỔNG QUAN & MỤC TIÊU NGHIỆP VỤ (EXECUTIVE SUMMARY)

### 1.1. Bối Cảnh
Thông tư 17/2019/TT-BKHCN quy định phương pháp đánh giá trình độ và năng lực công nghệ sản xuất thông qua hệ thống **26 tiêu chí** phân thành **5 nhóm T-E-O-R-I** (Thang 100 điểm). Phân hệ `TASK-09` số hóa toàn trình từ việc doanh nghiệp kê khai trực tuyến, tự động tính điểm, tính hệ số đồng bộ $T_{ĐB}$, vẽ biểu đồ mạng nhện (Radar Chart), chuẩn đoán điểm nghẽn công nghệ và liên thông sang phân hệ tìm mua giải pháp (`TASK-03`).

### 1.2. Mục Tiêu Nghiệp Vụ
1. **Số hóa Phụ lục I**: Cung cấp Form Wizard 6 bước tương ứng với Mục A $\rightarrow$ Mục E của Thông tư 17, hỗ trợ chuỗi số liệu tài chính 3 năm và danh mục thiết bị động.
2. **Realtime Calculator Engine**: Tính toán tức thời điểm số 26 tiêu chí, tổng điểm $\tau$ và hệ số đồng bộ $T_{ĐB}$ ngay khi người dùng nhập liệu.
3. **Phân cấp 4 Mức Trình Độ Công Nghệ (Điều 9)**:
   - **Lạc hậu**: $\tau < 35$ và $T_{ĐB} < 0,30$.
   - **Trung bình**: $35 \le \tau < 60$ và $T_{ĐB} \ge 0,30$.
   - **Trung bình tiên tiến**: $60 \le \tau < 75$ và $T_{ĐB} \ge 0,50$.
   - **Tiên tiến**: $\tau \ge 75$ và $T_{ĐB} \ge 0,65$.
   - *Lệch pha (Không thỏa mãn đồng thời)*: Trạng thái *"Cần thẩm định chuyên gia"*.
4. **Lưu trữ Bất Biến (Yearly Snapshot)**: Mỗi lần nộp hồ sơ đánh giá đóng gói thành một bản chụp bất biến theo năm (`ADR-0013`) phục vụ thanh tra và lưu vết.
5. **Cổng Thẩm Định Cấp 2 (`/gov`)**: Lãnh đạo Sở KH&CN và Hội đồng chuyên gia thẩm định minh chứng và phê duyệt Báo cáo chính thức (Phụ lục IV).

---

## 2. TÁC NHÂN & MA TRẬN PHÂN QUYỀN (ACTORS & 3D SCOPED RBAC)

| Tác Nhân | Vai Trò Hệ Thống | Phạm Vi Quyền Hạn | Hành Động Cho Phép |
| :--- | :--- | :---: | :--- |
| **Doanh Nghiệp Sản Xuất** | `ENTERPRISE` / `PUBLIC_USER` | `OWNER` | Tạo mới, Lưu nháp (Draft), Xem Realtime Score, Nộp hồ sơ (Submit Snapshot), Xem báo cáo Phụ lục IV của DN mình. |
| **Chuyên Gia Đánh Giá** | `VERIFIED_EXPERT` | `SECTOR` / `PROVINCE` | Xem hồ sơ được phân công, đối soát minh chứng, chấm điểm phản biện độc lập, gửi nhận xét. |
| **Cán Bộ Sở KH&CN** | `PROVINCIAL_ADMIN` / `CLUSTER_ADMIN` | `PROVINCE` | Quản lý hàng đợi hồ sơ địa bàn, yêu cầu doanh nghiệp giải trình, ký duyệt cấp chứng nhận Phụ lục IV. |
| **Quản Trị Viên Trung Ương** | `SUPER_ADMIN` / `OPERATOR_ADMIN` | `GLOBAL` | Toàn quyền kiểm tra, cấu hình tham số ngành, thanh tra và thu hồi chứng nhận vi phạm. |

---

## 3. DANH SÁCH YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

- **`REQ-09-001` (Dashboard Lịch Sử Kỳ Đánh Giá)**: Hiển thị danh sách các kỳ đánh giá theo năm (2024, 2025, 2026), kết quả xếp loại, radar chart mini và trạng thái hồ sơ.
- **`REQ-09-002` (Form Wizard Kê Khai Phụ Lục I)**: Thiết kế 6 bước nhập liệu chia 2 cột:
  - *Bước 1 (Mục A)*: Thông tin DN, năm đánh giá, tổng nguồn vốn, lao động $M$, mã ngành chế biến chế tạo C.10 $\rightarrow$ C.32.
  - *Bước 2 (Mục B - Nhóm T)*: Hiện trạng công nghệ & thiết bị (TC01–TC07, tối đa 30 điểm). Danh mục máy móc động, khấu hao $K_{kh}$, tỷ lệ tự động hóa.
  - *Bước 3 (Mục C - Nhóm E)*: Hiệu quả khai thác (TC08–TC12, tối đa 20 điểm). Chuỗi số liệu 3 năm ($G_{sp}, G_{dt}, M_{tt}$), tiêu hao năng lượng.
  - *Bước 4 (Mục D - Nhóm O)*: Năng lực tổ chức & quản lý (TC13–TC17, tối đa 19 điểm). ISO, ERP/MES, chuyển đổi số.
  - *Bước 5 (Mục Đ - Nhóm R)*: Nghiên cứu & phát triển (TC18–TC22, tối đa 17 điểm). Kinh phí R&D, nhân lực $M_{r\&d}$, phòng thí nghiệm.
  - *Bước 6 (Mục E - Nhóm I)*: Đổi mới sáng tạo (TC23–TC26, tối đa 14 điểm). Bằng SHTT, sản phẩm mới, liên kết Viện/Trường.
- **`REQ-09-003` (Sticky Realtime Calculator)**: Sidebar bên phải tự động tính toán điểm 26 tiêu chí, tổng điểm $\tau$, hệ số $T_{ĐB}$ và cập nhật Radar Chart ngay khi người dùng nhập dữ liệu.
- **`REQ-09-004` (Lưu Nháp Tự Động - Auto-Save Draft)**: Cơ chế debounce 500ms lưu dữ liệu an toàn vào CSDL PostgreSQL qua cấu trúc Hybrid JSONB.
- **`REQ-09-005` (Báo Cáo Phân Tích & Chuẩn Đoán Điểm Nghẽn)**:
  - Trình bày phiếu chấm điểm Phụ lục II.
  - Biểu đồ mạng nhện Radar Chart so sánh điểm DN với chuẩn trung bình ngành.
  - Tự động bóc tách các tiêu chí yếu nhất (dưới 40% điểm) thành danh sách "Điểm Nghẽn Công Nghệ".
  - Nút bấm liên thông: *"Đẩy điểm nghẽn sang Sàn Nhu Cầu Tìm Mua Công Nghệ (TASK-03)"*.
- **`REQ-09-006` (Cổng Thẩm Định Cấp 2 Của Sở KH&CN)**:
  - Hàng đợi hồ sơ đánh giá của tỉnh/thành (`/gov/assessments/tt17`).
  - Giao diện đối soát số liệu tự khai vs minh chứng đính kèm.
  - Điều chỉnh điểm có lưu vết Audit Trail và phê duyệt ban hành Báo cáo chính thức Phụ lục IV.
- **`REQ-09-007` (Khảo Sát Public Intake & Tự Động Tạo Tài Khoản - Auto-Provisioning)**:
  - Cho phép người dùng vãng lai hoặc Doanh nghiệp mở form kê khai trực tiếp tại `/assessments/tt17/wizard` mà không cần đăng nhập trước.
  - Form thu thập bắt buộc tại Mục A: Tên DN, Mã số thuế (MST), Người đại diện liên hệ, Email, Số điện thoại.
  - Tại trang Hub `/assessments/tt17`: Nếu chưa đăng nhập hoặc chưa có bản đánh giá, hiển thị Hero Banner Khảo Sát + nút CTA lớn kêu gọi tự chẩn đoán công nghệ (Zero Mock Leak - không hiển thị điểm số của doanh nghiệp mẫu).
  - Khi bấm *"Nộp Hồ Sơ Đánh Giá"*: Hệ thống tự động kiểm tra MST; nếu chưa có tài khoản sẽ tự động tạo hồ sơ Doanh nghiệp và cấp tài khoản `ENTERPRISE`, gắn kết quả đánh giá và chuyển sang màn hình Báo cáo Phụ lục IV.
- **`REQ-09-008` (Tự Động Đồng Bộ Từ CSDL & Tra Cứu MST Qua API - Pre-fill & Tax Lookup)**:
  - Khi người dùng đã có phiên đăng nhập (`ENTERPRISE`, `BUYER`, `SELLER`): Wizard tự động gọi `fetchMyEnterpriseProfile()` để điền sẵn toàn bộ Mục A và hiển thị banner thông báo xanh ngọc.
  - Tích hợp nút *"Tra cứu MST"* cạnh ô nhập Mã số thuế và sự kiện phím tắt `Enter`: Gọi API `lookupTaxCode(taxCode)` tra cứu dữ liệu Cổng VietQR / CSDL Quốc gia, tự động điền Tên DN, Tỉnh thành, Địa chỉ nhà máy và thông báo kết quả qua Toast.
- **`REQ-09-009` (Modal Chúc Mừng & Xác Nhận Cấp Tài Khoản Tự Động)**:
  - Khi khách vãng lai nộp bài đánh giá thành công (`autoProvisioned = true`), Wizard hiển thị Modal chúc mừng trang trọng chứa Mã hồ sơ khảo sát, Hộp thông báo màu hổ phách ghi rõ Tên đăng nhập (Email), Mật khẩu tạm thời, Nút *"Đăng Nhập Ngay Vào Hệ Thống"* và Nút *"Xem Báo Cáo Đánh Giá Phụ Lục IV"*.
- **`REQ-09-010` (Tái Cấu Trúc Giao Diện Wizard 6 Bước Theo "Phiếu Thu Thập Thực Tế")**:
  - Tái cấu trúc 6 bước kê khai bám sát 1:1 `Phiếu thu thập` trong file Excel SSOT 19.10:
    - *Bước 1 (Mục A - Định danh & Phân ngành)*: Tự động tra cứu MST, chọn 1 trong 23 mã ngành C.10 $\rightarrow$ C.32 (tự động nạp bộ hệ số $K_{chuẩn 1 \rightarrow 4}$), quy mô vốn và lao động.
    - *Bước 2 (Mục B - Máy móc, Thiết bị & Chuyển giao)*: Danh mục 03 dây chuyền chính, Nguyên giá $G_{bđ}$, Giá trị còn lại $G_{sx}$, Đầu tư mở rộng $G_{tbm1}$, Thay thế bảo dưỡng $G_{tbm2}$, Thiết bị số hóa $G_{sh}$, Checkbox loại chuyển giao công nghệ. Có Tooltip hướng dẫn lấy số liệu từ Mã 211 Bảng cân đối kế toán & Danh mục TSCĐ.
    - *Bước 3 (Mục C - Hoạt động SXKD 3 Năm)*: Component bảng lưới Financial Matrix Grid nhập chuỗi số liệu 3 năm ($G_{sp}, G_{dt}, G_{cp}, P_{tt}, P$), Chi phí điện/than/xăng dầu $G_{nl}$, Chi phí nguyên vật liệu $G_{nvl}$, Checkbox chuẩn chất lượng SP (ISO/TCVN) và sáng kiến cải tiến Kaizen.
    - *Bước 4 (Mục D - Nhân lực & Quản trị Môi trường)*: Cơ cấu lao động ($M, M_{tt}, M_{bc}, M_{ql}$), Chi phí đào tạo $G_{đthl}$, Checkbox 6 hệ thống quản lý (MES, ERP, PLM, PDM, PPS, SCM), SCADA/MDC, Chứng chỉ ISO 9001/14001, xử lý chất thải.
    - *Bước 5 (Mục Đ - CNTT & Năng lực R&D)*: Hạ tầng CNTT, Chi phí phần mềm/CNTT $G_{tt}$, Cơ sở R&D, Nhân lực R&D $M_{r\&d}$, Chi phí R&D $G_{R\&D}$, Quỹ phát triển KH&CN.
    - *Bước 6 (Mục E - Đổi mới Sáng tạo & Chuyển đổi số 4.0)*: Doanh thu SP mới, Văn bằng SHTT sáng chế/GPHI, Hợp tác Viện/Trường, Chiến lược 4.0, Checkbox 11 công nghệ 4.0 (Cloud, Robot, AR/VR, IoT, Big Data, Blockchain, In 3D...) và mức độ triển khai.
- **`REQ-09-011` (Bảng Master Data Định Mức 23 Ngành Chế Biến Chế Tạo - `assessment.industry_benchmarks`)**:
  - Lưu trữ 23 mã ngành VSIC (C.10 $\rightarrow$ C.32) cùng 4 hệ số định mức trung bình:
    * $K_{chuẩn 1}$: Hệ số tự động hóa trung bình (triệu đồng/lao động).
    * $K_{chuẩn 2}$: Hệ số chi phí năng lượng trung bình ($G_{nl} / G_{dt}$).
    * $K_{chuẩn 3}$: Hệ số chi phí nguyên vật liệu trung bình ($G_{nvl} / G_{dt}$).
    * $K_{chuẩn 4}$: Năng suất lao động trung bình (triệu đồng/người/năm).
  - Cung cấp API `GET /api/v1/assessments/tt17/benchmarks` trả về danh mục 23 ngành và hệ số benchmark để Frontend tính live score đồng bộ 100% với Backend.

---

## 4. QUY TẮC NGHIỆP VỤ BẤT BIẾN (BUSINESS RULES)

- **`BR-09-001 (Ràng buộc chuỗi 3 năm)`**: Các chỉ tiêu tài chính và sản xuất ($G_{sp}, G_{dt}, M_{tt}$) bắt buộc phải nhập đủ số liệu dương ($\ge 0$) cho 3 năm liền kề trước năm đánh giá.
- **`BR-09-002 (Phân nhánh quy mô TC20)`**: Tiêu chí TC20 (Kinh phí R&D) bắt buộc phân nhánh theo Tổng nguồn vốn BCTC và Tổng số lao động $M$ theo quy định Thông tư 17.
- **`BR-09-003 (Công thức hệ số đồng bộ)`**:
  $$T_{ĐB} = \left(\frac{T}{30}\right)^{0,30} \times \left(\frac{E}{20}\right)^{0,20} \times \left(\frac{O}{19}\right)^{0,19} \times \left(\frac{R}{17}\right)^{0,17} \times \left(\frac{I}{14}\right)^{0,14}$$
  Nếu bất kỳ nhóm điểm nào bằng 0, hệ số đồng bộ $T_{ĐB} = 0$.
- **`BR-09-004 (Xếp loại kép có điều kiện)`**: Chỉ xếp loại khi thỏa mãn đồng thời cả 2 điều kiện $\tau$ và $T_{ĐB}$. Trường hợp lệch pha phải gán nhãn *"Cần thẩm định chuyên gia"*.
- **`BR-09-005 (Tính bất biến của Snapshot)`**: Khi hồ sơ chuyển sang trạng thái `SUBMITTED`, toàn bộ dữ liệu khảo sát và điểm số được đóng băng thành bản chụp cố định của năm đánh giá, không bị ảnh hưởng nếu thông tin pháp nhân thay đổi.
- **`BR-09-006 (Cô lập dữ liệu địa bàn)`**: Cán bộ Sở KH&CN chỉ được thẩm định hồ sơ của doanh nghiệp có cơ sở sản xuất trên địa bàn tỉnh mình (`ScopeId`). Mọi truy cập chéo địa bàn bị chặn HTTP 403 Forbidden.
- **`BR-09-007 (Auto-Provisioning khi Nộp bài Khảo sát vãng lai)`**: Khi người dùng chưa đăng nhập nộp hồ sơ đánh giá với MST và Email hợp lệ:
  1. Kiểm tra CSDL `enterprise_profiles`: Nếu MST chưa tồn tại, tự động tạo mới `EnterpriseProfile`.
  2. Tạo mới tài khoản người dùng với role `ENTERPRISE` liên kết với Email và Enterprise này.
  3. Gắn `enterprise_id` vào bản đánh giá `tt17_evaluations`, đóng băng trạng thái `SUBMITTED` và cấp quyền truy cập.
- **`BR-09-008 (Tính toán Tự động Năng suất Lao động TC08 & Zero-Mock Engine)`**: Tuyệt đối không gán cứng giá trị cho TC08 (`s08 = 4.0`); hệ thống bắt buộc tính toán tự động tốc độ tăng năng suất lao động bình quân từ chuỗi tài chính 3 năm, đồng bộ 100% giữa Frontend và Backend Engine.
- **`BR-09-009 (Bộ Quy Tắc Phòng Vệ Mẫu Số Bằng 0 & Phân Nhánh An Toàn - Defensive Division Rules)`**:
  1. Nếu $G_{bđ} = 0 \rightarrow K_{kh} = 0\%$ (chấm 1 điểm).
  2. Nếu $M_{tt} = 0 \rightarrow K_{tđh} = 0$ (chấm 1 điểm), $K_{ns} = 0$ (chấm 1 điểm).
  3. Nếu $G_{dt} = 0 \rightarrow K_{cđ} = 0, K_{nl} = 0, K_{nvl} = 0, K_{tt} = 0, K_{R\&D} = 0$.
  4. Tuyệt đối không sinh lỗi `NaN` hoặc `Infinity` trên giao diện người dùng; hiển thị cảnh báo hướng dẫn người dùng nhập doanh thu để hệ thống tính toán các chỉ số kinh tế.

---

## 5. YÊU CẦU DỮ LIỆU & SCHEMA CSDL (HYBRID JSONB ADR-0013)

### Bảng 1: `assessment.tt17_evaluations`
- `id`: UUID (Primary Key)
- `enterprise_id`: UUID (Khóa ngoại tham chiếu `enterprise.profiles`)
- `assessment_year`: INT (Năm đánh giá, ví dụ: 2026)
- `status`: VARCHAR(30) (`DRAFT`, `SUBMITTED`, `IN_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`)
- `scope_type`: VARCHAR(20) (`PROVINCE`)
- `scope_id`: VARCHAR(10) (Mã tỉnh/thành: `HN`, `HP`, `HCM`...)
- `survey_data_json`: JSONB (Lưu trữ toàn bộ thông tin kê khai Phiếu thu thập: máy móc, chuỗi tài chính 3 năm, điện/năng lượng, nguyên vật liệu, cơ cấu lao động, chứng chỉ, CNTT, R&D, CĐS)
- `scores_json`: JSONB (Chi tiết điểm 26 tiêu chí, điểm 5 nhóm T-E-O-R-I, tổng điểm $\tau$, hệ số $T_{ĐB}$, xếp loại)
- `reviewer_id`: UUID (Nullable - Cán bộ thẩm định)
- `review_notes`: TEXT (Nhận xét của Hội đồng thẩm định)
- `audit_trail_json`: JSONB (Lịch sử điều chỉnh điểm)
- `created_at`, `updated_at`, `submitted_at`, `approved_at`: TIMESTAMPTZ
- **Unique Constraint**: `(enterprise_id, assessment_year)` — Mỗi doanh nghiệp chỉ có 1 bản đánh giá chính thức cho mỗi năm.

### Bảng 2: `assessment.industry_benchmarks` (Master Data Định Mức 23 Ngành)
- `industry_code`: VARCHAR(10) (Primary Key, ví dụ: `C.10`, `C.11` ... `C.32`)
- `industry_name`: VARCHAR(255) (Tên ngành công nghiệp chế biến chế tạo)
- `k_chuan_1`: NUMERIC(10,2) (Hệ số tự động hóa trung bình - triệu đồng/lao động)
- `k_chuan_2`: NUMERIC(6,4) (Hệ số chi phí năng lượng trung bình)
- `k_chuan_3`: NUMERIC(6,4) (Hệ số chi phí nguyên vật liệu trung bình)
- `k_chuan_4`: NUMERIC(10,2) (Năng suất lao động trung bình - triệu đồng/người/năm)
- `created_at`, `updated_at`: TIMESTAMPTZ

