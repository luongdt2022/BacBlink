# Đặc Tả Kỹ Thuật (Spec Kit): TASK-03 — Hồ Sơ Tìm Mua & Nhu Cầu Chuyển Giao Công Nghệ (Buyer)

> **Mã phân hệ**: `TASK-03_HO_SO_TIM_MUA_BUYER`  
> **Căn cứ nguồn**: Sheet `T.mua SP` (356 dòng), Sheet `tìm mua 7.10` (109 dòng), Quyết định PO `PO-DEC-20261008-01` & `PO-DEC-20261008-03`  
> **Phê duyệt phạm vi**: 6 Màn hình & 5 Luồng công việc (Chốt bởi PO ngày 10/10/2026)  
> **Cơ chế liên kết**: Ánh xạ 1:1 với `Specification/02_BASIC_DESIGN/TASK-03_HO_SO_TIM_MUA_BUYER/`  
> **Hiến pháp áp dụng**: `.specify/memory/constitution.md`

---

## 1. TỔNG QUAN HỆ THỐNG & MỤC TIÊU (OVERVIEW)

TASK-03 là phân hệ thu thập, quản trị và số hóa **Nhu cầu Đổi mới Công nghệ / Bài toán Kỹ thuật** từ các doanh nghiệp, hợp tác xã (Bên Mua / Buyer). Phân hệ đóng vai trò tạo nguồn dữ liệu đầu vào chuẩn hóa (Demand Tickets) phục vụ động cơ Matching Cung–Cầu (`TASK-08`) và mạng lưới tư vấn chuyên gia (`TASK-05`).

### Nguyên tắc bất biến (Core Invariants):
1. **Tách bạch dữ liệu thời điểm**: Dữ liệu khảo sát (khoảng doanh thu, khoảng lao động, điểm nghẽn tại thời điểm) không được phép ghi đè lên dữ liệu pháp nhân Master Profile (`TASK-02`).
2. **SSOT Tính toán TNI tại Backend**: Điểm Technology Need Index (TNI) được tính toán và kiểm soát tại Domain Service của Backend, Client chỉ hiển thị preview và không được phép ghi đè.
3. **Bảo vệ dữ liệu nhạy cảm (PDPD NĐ 13/2023/NĐ-CP)**: Số điện thoại, Email, Ngân sách cụ thể và Tài liệu hiện trạng kỹ thuật được ẩn danh hoàn toàn trên sàn công khai; chỉ mở khi có sự chấp thuận kết nối 2 chiều (Opt-in Handshake).

---

## 2. DANH MỤC 6 MÀN HÌNH (SCREENS SPECIFICATION)

### SC-03-01: Phiếu Khảo Sát Sâu Nhu Cầu Đổi Mới Công Nghệ DNNVV (`/khao-sat-nhu-cau`)
- **Tác nhân**: Doanh nghiệp, Hợp tác xã (Công khai hoặc Đã đăng nhập).
- **Cấu trúc 7 phần**:
  - **Phần A (Thông tin doanh nghiệp)**: Tên DN, MST, địa chỉ, người liên hệ, ngành hoạt động, quy mô lao động dạng khoảng, doanh thu 3 năm dạng khoảng.
  - **Phần B (Hiện trạng công nghệ)**: Danh mục máy móc/dây chuyền, năm đầu tư, nguồn gốc xuất xứ, tự đánh giá 8 tiêu chí hiện trạng (1–5).
  - **Phần C (Điểm nghẽn kỹ thuật)**: Chọn tối đa 5 điểm nghẽn nghiêm trọng nhất kèm mức độ 1–5.
  - **Phần D (Năng lực tiếp nhận - TAR)**: Đánh giá nhân lực kỹ thuật, năng lực vận hành và hấp thụ chuyển giao.
  - **Phần E (Dòng nhu cầu & TNI Calculator)**:
    - Nhập bài toán, công đoạn, mục tiêu kỳ vọng.
    - Chọn mã Lĩnh vực (`LV01–LV18`), mã Nhóm CN (`CN01–CN48`), mã Nhu cầu (`NC01–NC25`), khoảng ngân sách (7 mức).
    - Bộ 4 thanh trượt/radio: $K$ (Cấp thiết 35%), $L$ (Tác động 30%), $N$ (Khả năng tài chính 20%), $O$ (Sẵn sàng tiếp nhận 15%).
    - **Widget Realtime TNI**: Tự động tính điểm TNI (0–100) và đổi màu Badge (Đỏ/Cam/Vàng/Xám) tức thời.
  - **Phần F (Công nghệ mới & Hỗ trợ)**: Tự động hóa, chuyển đổi số, công nghệ xanh; nhu cầu hỗ trợ từ Nhà nước.
  - **Phần G (Xác nhận & Cam kết)**: Người khai, ngày nộp, cam kết bảo mật.
- **5 UX States**: Empty, Loading, Success, Error, Submitting.

### SC-03-02: Bàn Làm Việc Quản Trị Nhu Cầu Bên Mua (`/portal/buyer/demands`)
- **Tác nhân**: Đại diện Doanh nghiệp / Chủ hồ sơ mua đã đăng nhập (`BUYER_REPRESENTATIVE`).
- **Thành phần**:
  - Hàng KPI Cards: Bài toán đang mở, Điểm TNI trung bình, Nguồn cung tiềm năng đã ghép, Chuyên gia Sở chỉ định.
  - Bảng quản trị Demand Tickets: Mã ticket, tên bài toán, lĩnh vực, ngân sách, badge TNI, trạng thái hồ sơ.
  - Lối tắt: Mở Radar Matching sang `TASK-08` hoặc Đăng bài toán mới.

### SC-03-03: Modal Tạo Nhanh Bài Toán Nhu Cầu (`QuickDemandModal`)
- **Tác nhân**: Doanh nghiệp đã đăng nhập cần đăng lẻ 1 bài toán kỹ thuật mới.
- **Thành phần**:
  - Tiêu đề bài toán & Công đoạn sản xuất.
  - Mô tả vấn đề & Mục tiêu kỳ vọng.
  - Chọn danh mục 3 tầng: `LV01–LV18`, `CN01–CN48`, `NC01–NC25`.
  - Chọn khoảng ngân sách (7 mức) và thời gian mong muốn.
  - Đánh giá nhanh 4 tham số $K, L, N, O$ thang điểm 1–5 để sinh điểm TNI.

### SC-03-04: Danh Mục & Chi Tiết Nhu Cầu Tìm Mua Công Khai (`/nhu-cau-cong-nghe` & `/[id]`)
- **Tác nhân**: Khách vãng lai, Bên Bán (Seller), Chuyên gia KH&CN.
- **Bảo mật PDPD**:
  - Hiển thị bài toán, ngành nghề, mục tiêu kỳ vọng, địa bàn triển khai và badge TNI.
  - Ẩn hoàn toàn SĐT, Email, Tên người phụ trách, Ngân sách chi tiết và File hiện trạng.
  - Nút "Gửi Đề Xuất Giải Pháp" kích hoạt luồng đề nghị kết nối.

### SC-03-05: Cổng Cán Bộ Thẩm Định & Phân Luồng Nhu Cầu (`/gov/demands`)
- **Tác nhân**: Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN`), Quản trị viên (`SUPER_ADMIN`).
- **Thành phần**:
  - Danh sách hồ sơ khảo sát chờ duyệt (`SUBMITTED`).
  - Đối soát mã số thuế với CSDL Master 304 DN (`TASK-02`).
  - Thao tác: Duyệt niêm yết công khai (`VERIFIED`), Yêu cầu bổ sung, hoặc Chỉ định chuyên gia tư vấn 1-1 (SLA 24h đối với $TNI \ge 80$).

### SC-03-06: Form Đăng Ký Tham Quan Triển Lãm & Gửi Nhu Cầu Hội Chợ (`/trien-lam/dang-ky-tham-quan`)
- **Tác nhân**: Khách tham quan hội chợ (ICE Cung Việt Xô, VIMEXPO, AUTOEXPO).
- **Thành phần**: Thông tin cá nhân/doanh nghiệp, ngành nghề quan tâm, mục đích tham quan (B2B, tìm nhà cung cấp, tìm hiểu công nghệ mới).

---

## 3. DANH MỤC 5 LUỒNG CÔNG VIỆC (WORKFLOWS SPECIFICATION)

### WF-01: Khảo Sát Sâu Toàn Diện & Phân Rã Demand Tickets
1. Doanh nghiệp điền phiếu khảo sát 7 phần tại `SC-03-01`.
2. Frontend tính nhẩm TNI thời gian thực để người dùng nắm được mức độ ưu tiên.
3. Bấm nộp phiếu $\rightarrow$ API `POST /api/v1/demands/surveys`.
4. Backend lưu `demand_surveys` (trạng thái `SUBMITTED`) và phân rã các dòng nhu cầu thành $1..n$ `demand_items` gắn kèm điểm TNI do Backend tính toán.

### WF-02: Đăng Bài Toán Nhanh & Tính Điểm TNI Chuẩn Hóa
1. Doanh nghiệp mở `QuickDemandModal` tại `SC-03-02`.
2. Điền thông số bài toán, chọn danh mục và chấm điểm 4 tham số $K, L, N, O$.
3. API `POST /api/v1/demands/items` $\rightarrow$ Validate $1 \le K, L, N, O \le 5$.
4. Domain Service tính $\text{TNI} = \text{ROUND}((35K + 30L + 20N + 15O)/5, 0)$ và lưu `demand_items`.

### WF-03: Thẩm Định, Sàng Lọc & Phân Luồng Triage (Sở KH&CN)
1. Cán bộ Sở mở `SC-03-05` xem danh sách hồ sơ mới.
2. Kiểm tra tính xác thực của doanh nghiệp và bài toán.
3. Bấm duyệt $\rightarrow$ Chuyển trạng thái sang `VERIFIED`, cho phép niêm yết công khai trên `SC-03-04`.
4. Nếu bài toán có $TNI \ge 80$, hệ thống kích hoạt cảnh báo SLA 24h để cán bộ chỉ định chuyên gia tư vấn 1-1.

### WF-04: Khám Phá Công Khai & Bảo Mật Dữ Liệu Nhạy Cảm (PDPD Handshake)
1. Bên Bán (Seller) tìm kiếm bài toán trên sàn công khai `SC-03-04`.
2. Seller bấm "Gửi Đề Xuất Giải Pháp" $\rightarrow$ Tạo bản ghi đề nghị kết nối.
3. Bên Mua nhận thông báo trong `SC-03-02`.
4. Bên Mua bấm "Chấp thuận kết nối" (Opt-in) $\rightarrow$ Hệ thống mới mở khóa SĐT, Email và Tài liệu hiện trạng cho Seller (Bàn giao sang `TASK-08`).

### WF-05: Thu Thập & Chuyển Đổi Nhu Cầu Tại Triển Lãm (Expo Ingestion)
1. Khách tham quan điền form tại `SC-03-06`.
2. Hệ thống lưu hồ sơ khảo sát sơ bộ dạng `EXPO`.
3. Cán bộ quản trị xuất danh sách và hỗ trợ doanh nghiệp kích hoạt tài khoản chính thức.

---

## 4. QUY TẮC NGHIỆP VỤ BẮT BUỘC (BUSINESS RULES)

- **BR-TNI-01 (Công thức toán học)**:
  $$\text{TNI} = \text{ROUND}\left(\frac{K \times 35 + L \times 30 + N \times 20 + O \times 15}{5}, 0\right)$$
- **BR-TNI-02 (Thang xếp loại 4 mức)**:
  - $\ge 80$: `VERY_HIGH` (Nhu cầu rất cao — Ưu tiên đặc biệt / Tư vấn 1-1).
  - $65–79$: `HIGH` (Nhu cầu cao — Ghép nối đợt 1).
  - $50–64$: `MEDIUM` (Nhu cầu trung bình — Gợi ý sàn).
  - $< 50$: `LOW` (Nhu cầu thấp — Lưu hồ sơ).
- **BR-TNI-03 (SSOT Backend)**: Client không được phép gửi trường `tni_score` lên server. Backend luôn tự tính và gán giá trị.
- **BR-TNI-04 (Ràng buộc đầu vào)**: $1 \le K, L, N, O \le 5$. Nếu giá trị nằm ngoài khoảng, Backend trả về lỗi `400 Bad Request` kèm ProblemDetails.
- **BR-03-001 (Cách ly dữ liệu khoảng)**: Doanh thu và lao động ở khảo sát là dạng khoảng (Range/Enum), không được phép ghi đè lên các trường số liệu chính xác của `TASK-02`.
- **BR-03-002 (Vòng đời trạng thái)**: `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `VERIFIED` $\rightarrow$ `CLOSED`. Chỉ hồ sơ `VERIFIED` mới được hiển thị trên sàn công khai.
- **BR-03-003 (Bảo vệ PII)**: Public API chỉ trả về `is_public_listed = true` với SĐT, Email và Ngân sách chi tiết đã được Masking / Ẩn.

---

## 5. TIÊU CHÍ NGHIỆM THU ĐẦU CUỐI (ACCEPTANCE CRITERIA)

1. **AC-01**: Cả 6 màn hình render mượt mà, đầy đủ 5 trạng thái UX qua component `<Async>`.
2. **AC-02**: Widget Realtime TNI trên cả 2 màn hình khai báo tính chính xác 100% công thức định lượng $K, L, N, O$.
3. **AC-03**: Backend Unit Test bao phủ 100% các ca biên của `TniCalculationEngine` (min = 20, max = 100, invalid < 1 hoặc > 5 bị từ chối).
4. **AC-04**: Public API che giấu 100% thông tin PII nhạy cảm theo đúng chuẩn PDPD.
5. **AC-05**: Bộ test Playwright E2E Black-box kiểm thử thông suốt 5 luồng công việc đạt 100% Green.

---

## Spec Delta v2: Cải Tiến Giao Diện & Trải Nghiệm Sàn Nhu Cầu Công Khai (SC-03-04)

> **Căn cứ thay đổi**: Đánh giá thực nghiệm giao diện `localhost:3000/nhu-cau-cong-nghe` ngày 12/10/2026, đối soát 1:1 với `wireframe_san_nhu_cau_cong_nghe.html` và chỉ đạo trực tiếp từ PO.

### 1. Bối cảnh & Mục tiêu
- **Khắc phục lỗi tương phản WCAG AA**: Nền banner `bg-brand-700` và ảnh nền vi mạch làm mờ tịt tiêu đề H1 và văn bản giới thiệu. Bổ sung overlay gradient tối màu và ép định dạng chữ trắng tương phản cao.
- **Chuẩn hóa thông tin hiển thị (Zero Technical Jargon on UI)**:
  - Ẩn hoàn toàn các mã hồ sơ kỹ thuật ngẫu nhiên/hash (ví dụ `DMD-202610-0FF52B`) khỏi vị trí tiêu đề chính của Card.
  - Thay thế mã phân loại thô (`LV08`, `LV07`) bằng tên tiếng Việt chính thức của 10 Lĩnh vực công nghệ Thông tư 17.
  - Bổ sung định danh Doanh nghiệp ẩn danh theo chuẩn PDPD Nghị định 13/2023/NĐ-CP (ví dụ: `[Doanh nghiệp Cơ khí - Hải Phòng] (PDPD Masked)`).
- **Mở rộng Combobox Lĩnh vực**: Nạp đầy đủ 10 Lĩnh vực TT17 từ API `/api/v1/sectors` (thay thế 3 option hardcode cũ).
- **Phân quyền nút bấm theo vai trò (Role-Based Action Boundaries)**:
  - Nút "Đăng Nhanh Bài Toán": Kiểm tra phiên đăng nhập `BUYER` / `INNOVATION_ENTITY`. Nếu khách vãng lai, hiển thị dẫn hướng đăng nhập hoặc gợi ý điền form khảo sát.
  - Nút "Chi tiết & Chào giải pháp": Đảm bảo dẫn hướng thông suốt cho `SELLER` và `EXPERT`.

### 2. Yêu cầu Chức năng Mới (FR-Delta-01 -> FR-Delta-04)
- **FR-Delta-01**: Hero Banner hiển thị khối Quick Metrics (140+ Bài toán đang tìm, 68.5+ Tỷ ngân sách mua, 24 Giờ hỗ trợ kết nối) với độ tương phản WCAG AA đạt chuẩn.
- **FR-Delta-02**: Combobox Bộ lọc Lĩnh vực nạp động toàn bộ danh mục 10 Lĩnh vực TT17 kèm fallback an toàn.
- **FR-Delta-03**: Bổ sung bộ lọc Ngân sách đầu tư (5 mức) và bộ lọc Mức độ cấp thiết TNI.
- **FR-Delta-04**: Thẻ Card hiển thị đầy đủ thông tin nghiệp vụ: Tên lĩnh vực tiếng Việt, Ngân sách chuẩn hóa, Nhãn doanh nghiệp PDPD masked, nút Bookmark và CTA nộp giải pháp.

### 3. Quy tắc Nghiệp vụ Bổ Sung
- **BR-Delta-01 (PDPD Masking Presentation)**: Sàn công khai tuyệt đối không hiển thị mã hash nội bộ, MST, SĐT, Email của Doanh nghiệp. Chỉ hiển thị định danh dạng `[Loại hình - Lĩnh vực - Địa bàn] (PDPD Masked)`.
- **BR-Delta-02 (Role Action Guard)**: Khách vãng lai chưa xác thực khi thực hiện thao tác tạo bài toán nhanh phải được chuyển hướng đăng nhập văn minh hoặc hướng dẫn sử dụng Phiếu khảo sát công khai.

---

## Spec Delta v3: Chuẩn Hóa Toàn Diện Phiếu Khảo Sát Sâu Nhu Cầu DNNVV 7 Phần (SC-03-01)

> **Căn cứ thay đổi**: Quyết định PO phê duyệt Scope ngày 12/10/2026, đối soát 1:1 với Hồ sơ Thiết kế cơ sở gốc `SPEC_PHIEU_KHAO_SAT_NHU_CAU_CONG_NGHE_DNNVV.md` và `wireframe_phieu_khao_sat_dnnvv.html` (158KB).

### 1. Bối cảnh & Mục tiêu
- Thay thế bản nguyên mẫu rút gọn (MVP stub) bằng **Form Wizard 7 bước (A $\rightarrow$ G)** đạt chuẩn 100% trường dữ liệu nghiệp vụ:
  - **Phần A**: Thông tin pháp nhân và quy mô doanh nghiệp toàn diện (Tên, MST, Tỉnh/TP, Địa chỉ, Nhà máy khảo sát, Người liên hệ, Chức vụ, SĐT, Email, Ngành KD chính, Sản phẩm chủ lực, Quy mô lao động, Doanh thu 3 năm dạng khoảng).
  - **Phần B**: Hiện trạng thiết bị & Dây chuyền sản xuất (Bảng động nhiều thiết bị kèm công đoạn, năm, xuất xứ, khấu hao) và **Bảng Tự đánh giá 8 tiêu chí hiện trạng** thang điểm 1–5 (Cơ giới hóa, Đồng bộ, Hao phí năng lượng, Phụ thuộc thợ, Tỷ lệ lỗi, Số hóa MES/ERP, An toàn môi trường, Tự sửa chữa).
  - **Phần C**: Vấn đề & Điểm nghẽn công nghệ (Chọn tối đa 5 điểm nghẽn kèm mức độ nghiêm trọng 1–5, công đoạn khó nhất, nguyên nhân chủ yếu).
  - **Phần D**: Năng lực tiếp nhận & Hấp thụ công nghệ (Thống kê 6 nhóm nhân lực kỹ thuật, năng lực quản lý công nghệ, khả năng tự hấp thụ thang 1–5).
  - **Phần E**: Dòng nhu cầu & Bài toán kỹ thuật (Cho phép thêm $1..n$ Demand Tickets động, nguồn vốn, hình thức chuyển giao, nhúng bộ tính điểm TNI 4 chiều $K, L, N, O$ tự động cập nhật thời gian thực).
  - **Phần F**: Định hướng công nghệ mới & Nhu cầu hỗ trợ chung (Tự động hóa, Chuyển đổi số, Công nghệ xanh, mức độ cần hỗ trợ 1–5, đối tác mong muốn).
  - **Phần G**: Rà soát, Xác nhận & Đồng ý xử lý dữ liệu PDPD (Chế độ xem trước toàn văn, Họ tên người đại diện, Chức vụ, Cam kết Nghị định 13/2023/NĐ-CP).

### 2. Yêu cầu Chức năng Mới (FR-Delta-05 -> FR-Delta-08)
- **FR-Delta-05 (Multi-Step Wizard & Draft Persistence)**: Giao diện form chia làm 7 bước với Stepper trực quan, hỗ trợ nút "Quay lại", "Tiếp tục" kèm validation riêng từng bước, tự động lưu và khôi phục bản nháp vào `localStorage`.
- **FR-Delta-06 (Dynamic Equipment & 8-Criteria Evaluation Table)**: Hỗ trợ thêm/sửa/xóa dòng thiết bị ở Phần B; bảng chấm điểm 8 tiêu chí hiện trạng radio 1–5 tự động tính điểm trung bình hiện trạng.
- **FR-Delta-07 (Multiple Demand Items & Per-Item TNI Engine)**: Phần E cho phép thêm nhiều dòng bài toán kỹ thuật; mỗi bài toán sở hữu riêng bộ thanh trượt/chấm điểm 4 tham số $K, L, N, O$ và hiển thị điểm TNI cùng Badge phân loại.
- **FR-Delta-08 (Rich Data Payload Submission)**: Tích hợp API nộp phiếu, lưu trữ toàn vẹn 7 phần dữ liệu vào CSDL PostgreSQL, trả về mã phiếu `SUR-YYYYMMDD-XXXXX` và danh sách mã Demand Tickets khởi tạo.

### 3. Quy tắc Nghiệp vụ Bổ Sung
- **BR-Delta-03 (Max 5 Bottlenecks Invariant)**: Doanh nghiệp chỉ được chọn tối đa 5 điểm nghẽn kỹ thuật tại Phần C. Hệ thống tự động disable các checkbox còn lại khi đã đủ 5 lựa chọn.
- **BR-Delta-04 (Zero Data Loss on Step Transition)**: Dữ liệu đã nhập ở bất kỳ bước nào trong Wizard không bị mất khi chuyển đổi qua lại giữa các bước hoặc tải lại trang.
- **BR-Delta-05 (PDPD Consent Mandatory Gate)**: Nút "Nộp Phiếu Khảo Sát" ở Phần G chỉ được kích hoạt khi người dùng đã tích chọn đồng ý cam kết xử lý dữ liệu theo Nghị định 13/2023/NĐ-CP.

---

## Spec Delta v4: Mở Rộng Kênh Triển Lãm & Tự Động Hóa Định Danh Doanh Nghiệp (PO-DEC-20261012-01)

> **Căn cứ thay đổi**: Quyết định PO-DEC-20261012-01 ngày 12/10/2026 về mở rộng kênh thu thập nhu cầu tại Triển lãm Doanh nghiệp / Hội chợ Techmart, tối ưu trải nghiệm nhập liệu và tự động cấp quyền truy cập.

### 1. Bối cảnh & Mục tiêu
- **Phục vụ chiến dịch Triển lãm Doanh nghiệp & Techmart**: Cung cấp đường dẫn công khai / QR Code để khách tham quan quét và điền phiếu nhanh trên thiết bị di động.
- **Giảm ma sát nhập liệu**: Tự động tra cứu MST và tự động nạp hồ sơ có sẵn để rút ngắn thời gian hoàn thành Bước 1 xuống dưới 3 giây.
- **Giữ chân khách hàng sau sự kiện**: Tự động tạo tài khoản Bên Mua (`BUYER`) ngay khi nộp phiếu để doanh nghiệp đăng nhập theo dõi tiến độ matching và nhận tư vấn chuyên gia.

### 2. Yêu cầu Chức năng Mới (FR-Delta-09 -> FR-Delta-11)
- **FR-Delta-09 (Tax Code Auto-Lookup & Pre-fill)**:
  - Khi người dùng nhập đủ 10 hoặc 13 số MST (hoặc bấm biểu tượng 🔍 **"Tra cứu"** cạnh ô MST), hệ thống tự động gọi API tra cứu pháp nhân `GET /api/v1/enterprises/lookup-tax/{taxCode}`.
  - Tự động điền: Tên doanh nghiệp chính thức, Tỉnh/thành phố, Địa chỉ chi tiết trụ sở.
  - Hiển thị spinner loading 0.5s và thông báo toast kết quả tra cứu.
- **FR-Delta-10 (Smart Profile Pre-fill for Authenticated Enterprises)**:
  - Khi người dùng đã đăng nhập mở form `/khao-sat-nhu-cau`, hệ thống tự động kiểm tra phiên và gọi `GET /api/v1/portal/enterprise/profile`.
  - Tự động điền toàn bộ 100% dữ liệu đã có vào Bước 1 (Tên DN, MST, Tỉnh/thành, Địa chỉ, Người liên hệ, Chức vụ, SĐT, Email, Loại hình, Ngành nghề, Quy mô, Doanh thu).
  - Hiển thị Banner UX chào mừng thông báo dữ liệu đã được nạp sẵn từ hồ sơ cá nhân.
- **FR-Delta-11 (Exhibition On-the-Fly Account Auto-Provisioning)**:
  - Khi khách nộp phiếu ẩn danh tại triển lãm, API `POST /api/v1/demands/surveys` tự động kiểm tra `ContactEmail` trong bảng `identity.Persons`.
  - Nếu chưa có tài khoản: Tự động khởi tạo tài khoản mới với vai trò `BUYER`, sinh token kích hoạt / mật khẩu và gửi email chào mừng.
  - Tự động gán `PersonId` vừa tạo làm chủ sở hữu phiếu khảo sát `DemandSurvey` và các bài toán `DemandItem`.
  - Màn hình kết quả (Success View) thông báo tài khoản đã được cấp tự động kèm nút "Đăng nhập ngay để theo dõi tiến độ".

### 3. Quy tắc Nghiệp vụ Bổ Sung (BR-Delta-06 -> BR-Delta-08)
- **BR-Delta-06 (Hybrid Tax Lookup Fallback)**: Cơ chế tra cứu MST ưu tiên tìm trong CSDL nội bộ NacenTech (304 DN) trước; nếu không có mới gọi API VietQR Business Open API. Nếu cả 2 không có hoặc mạng lỗi, hệ thống không chặn form, cho phép người dùng nhập tay bình thường.
- **BR-Delta-07 (Idempotent Account Provisioning)**: Nếu email liên hệ hoặc MST đã tồn tại trong hệ thống Identity, hệ thống không tạo tài khoản trùng lặp mà tự động gán liên kết phiếu khảo sát vào tài khoản hiện hữu.
- **BR-Delta-08 (PDPD Privacy & Welcome Notification)**: Tài khoản tự tạo tại triển lãm được gửi email chào mừng kèm link thiết lập mật khẩu; thông tin SĐT/Email tiếp tục được ẩn danh trên sàn công khai theo chuẩn PDPD NĐ 13/2023/NĐ-CP.

---

## Spec Delta v5: Hoàn Thiện Vòng Đời CRUD & Quản Trị Bài Toán Bên Mua (Edit & Close Actions)

> **Căn cứ thay đổi**: Rà soát Kiến trúc 48 màn hình ngày 13/10/2026 về điểm nghẽn thiếu hành vi Chỉnh sửa và Đóng bài toán trên Bàn làm việc Bên Mua (`/portal/buyer/demands`).

### 1. Bối cảnh & Mục tiêu
- **Hoàn thiện vòng đời dữ liệu 5 bước**: Cung cấp đầy đủ các thao tác `[CREATE]`, `[READ]`, `[UPDATE]`, `[CLOSE/STATUS]` cho đại diện Bên Mua.
- **Cho phép sửa đổi bài toán chưa duyệt**: Giúp doanh nghiệp kịp thời bổ sung, điều chỉnh thông số kỹ thuật, công đoạn, ngân sách hoặc mức độ cấp thiết khi bài toán còn ở trạng thái `PENDING`.
- **Hỗ trợ đóng/rút bài toán**: Cho phép doanh nghiệp đóng bài toán khi đã kết nối thành công với nhà cung cấp hoặc thay đổi kế hoạch sản xuất kinh doanh.

### 2. Yêu cầu Chức năng Mới (FR-Delta-12 -> FR-Delta-14)
- **FR-Delta-12 (Edit Pending Demand Item)**:
  - Cột "Thao tác" trên Bàn làm việc Bên Mua (`/portal/buyer/demands`) hiển thị nút **[Chỉnh sửa]** (Icon Edit) đối với các bài toán có trạng thái `PENDING`.
  - Bấm nút mở `EditDemandModal` nạp sẵn toàn bộ dữ liệu hiện tại (Công đoạn, Bài toán, Giải pháp mong muốn, Mục tiêu, Lĩnh vực, Nhóm CN, Loại nhu cầu, Ngân sách, 4 chỉ số $K, L, N, O$).
  - Gửi dữ liệu cập nhật qua API `PUT /api/v1/buyer/demands/{id}`.
- **FR-Delta-13 (Realtime TNI Recalculation on Edit)**:
  - Trên Modal chỉnh sửa, khi người dùng trượt 4 thanh $K, L, N, O$, giao diện tự động tính nhẩm và cập nhật màu Badge TNI.
  - Khi lưu, Domain Service của Backend tự động tính toán lại $TNI = \text{ROUND}((35K + 30L + 20N + 15O)/5, 0)$ và cập nhật `TniScore`, `TniClassification`, `UpdatedAt`.
- **FR-Delta-14 (Close / Withdraw Demand Item)**:
  - Cột "Thao tác" hiển thị nút **[Đóng bài toán]** (Icon Archive/XCircle).
  - Mở `ConfirmModal` yêu cầu xác nhận với nội dung: *"Bạn có chắc chắn muốn đóng bài toán này? Bài toán sẽ được rút khỏi sàn công khai."*
  - Gửi yêu cầu qua API `POST /api/v1/buyer/demands/{id}/close`.
  - Bảng danh sách cập nhật ngay trạng thái `CLOSED` và tab bộ lọc có thể lọc bài toán đã đóng.

### 3. Quy tắc Nghiệp vụ Bổ Sung (BR-Delta-09 -> BR-Delta-10)
- **BR-Delta-09 (Immutable Locked State for Verified Demands)**: Bài toán khi đã được Sở duyệt niêm yết (`VERIFIED`) hoặc đã đóng (`CLOSED`) thì nút [Chỉnh sửa] sẽ bị ẩn hoặc disabled. Doanh nghiệp chỉ có thể đóng bài toán chứ không thể sửa đổi thông số kỹ thuật đã thẩm định.
- **BR-Delta-10 (Soft Close Invariant)**: Hành động đóng bài toán chỉ cập nhật `Status = 'CLOSED'` và gỡ niêm yết công khai (`IsPublicListed = false`). Tuyệt đối cấm xóa cứng (Hard Delete) bản ghi khỏi CSDL nhằm phục vụ lưu trữ lịch sử và thống kê phân tích.

---

## 8. DELTA V6 (CR-006) — TÁI CẤU TRÚC THỨ TỰ TAB KHẢO SÁT & CHUẨN HÓA RÀNG BUỘC VALIDATION

> **Căn cứ**: Yêu cầu thay đổi `CR-006 [TASK-03]` từ Backlog ngày 17/10/2026.  
> **Mục tiêu**: Giảm thiểu ma sát (Friction) cho doanh nghiệp khi tham gia khảo sát nhu cầu, ưu tiên thu thập ngay bài toán công nghệ sau thông tin pháp nhân.

### 1. Cấu Trúc 7 Bước Mới (Reordered Stepper Structure)
1. **Bước 1 (Phần A — Thông tin chung doanh nghiệp)**: Tên DN, MST, Tỉnh/Thành phố, Địa chỉ, Người liên hệ, SĐT, Email. **[BẮT BUỘC / MANDATORY]**
2. **Bước 2 (Phần E — Nhu Cầu Đổi Mới Công Nghệ & TNI Calculator)**: Đưa từ Bước 5 lên Bước 2. Nhập bài toán kỹ thuật, công đoạn, mục tiêu kỳ vọng, phân loại danh mục (Lĩnh vực, Nhóm CN, Loại nhu cầu), ngân sách và tự chấm 4 chỉ số $K, L, N, O$ tính điểm TNI. Yêu cầu có ít nhất 1 bài toán. **[BẮT BUỘC / MANDATORY]**
3. **Bước 3 (Phần B — Hiện trạng công nghệ & 8 Tiêu chí)**: Danh mục máy móc, xuất xứ, năm đầu tư và tự chấm 8 tiêu chí hiện trạng. **[TÙY CHỌN / OPTIONAL]**
4. **Bước 4 (Phần C — Điểm nghẽn sản xuất)**: Điểm nghẽn kỹ thuật và công đoạn khó nhất. **[TÙY CHỌN / OPTIONAL]**
5. **Bước 5 (Phần D — Năng lực tiếp nhận công nghệ TAR)**: Nhân lực kỹ thuật và mức độ sẵn sàng hấp thụ công nghệ. **[TÙY CHỌN / OPTIONAL]**
6. **Bước 6 (Phần F — Định hướng công nghệ & Đề xuất hỗ trợ)**: Tự động hóa, chuyển đổi số, công nghệ xanh và nhu cầu hỗ trợ. **[TÙY CHỌN / OPTIONAL]**
7. **Bước 7 (Phần G — Ký xác nhận & Cam kết bảo mật PDPD)**: Họ tên người đại diện xác nhận và đồng thuận PDPD. **[BẮT BUỘC KHI NỘP / MANDATORY ON SUBMIT]**

### 2. Quy Tắc Validation (BR-Delta-11)
- **BR-Delta-11 (Mandatory Core + Optional Extension)**:
  - Chỉ bắt buộc dữ liệu tại Bước 1 (Thông tin liên hệ & pháp nhân) và Bước 2 (Tối thiểu 1 bài toán kỹ thuật có đầy đủ vấn đề & mục tiêu).
  - Các Bước 3, 4, 5, 6 hoàn toàn là dữ liệu mở rộng tùy chọn. Người dùng có thể nhấn "Tiếp tục" qua các bước này mà không bị chặn lỗi kể cả khi không điền bất kỳ trường nào.
  - Người dùng sau khi hoàn tất Bước 1 và Bước 2 có thể điều hướng thẳng đến Bước 7 để ký xác nhận và nộp phiếu ngay lập tức.
