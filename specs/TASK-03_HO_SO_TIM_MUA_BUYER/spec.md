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
- **FR-Delta-01 [Dynamic Quick Metrics & Zero-Mock]**: Hero Banner hiển thị khối Quick Metrics nạp động thời gian thực từ CSDL PostgreSQL thông qua API (`totalDemands`: Tổng số bài toán nhu cầu `PUBLISHED`; `totalBudget`: Tổng ngân sách dự kiến của các bài toán công khai; `slaSupport`: Cam kết thời gian kết nối của nền tảng). Bắt buộc bọc qua component chuẩn `<Async>` hỗ trợ 5 UX States. Xóa bỏ vĩnh viễn các số tĩnh ảo tưởng (`142 bài toán`, `68.5 tỷ`).
- **FR-Delta-02 [Taxonomy SSOT Filter]**: Combobox Bộ lọc Lĩnh vực nạp động 100% từ Runtime API duy nhất `GET /api/v1/master-data/sectors?activeOnly=true` (10 Lĩnh vực TT17 chuẩn `LV01..LV17`). Tuyệt đối cấm dùng mảng tự chế 18 ngành hoặc mã khuyết.
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

---

## 9. DELTA V7 (CR-2026-016): BẮT BUỘC TỰ ĐỘNG ĐIỀN 100% THÔNG TIN HỒ SƠ DOANH NGHIỆP ĐÃ ĐĂNG NHẬP & LIÊN KẾT TÀI KHOẢN DEMO BUYER

> **Mã thay đổi**: `CR-2026-016`  
> **Căn cứ thay đổi**: 
> 1. Quyết định PO về Nguyên tắc Bất biến Tự động điền dữ liệu (Auto-Prefill Invariant) và Định danh tài khoản Demo.
> 2. Triết lý Barbara Minto Pyramid: Loại bỏ ma sát nhập liệu, tối ưu hóa hành trình người dùng (User Journey) từ tài khoản đã xác thực đến việc gửi bài toán kỹ thuật.
> 3. Kế thừa Bản sắc Doanh nghiệp Thống nhất SSOT (`TASK-02_HO_SO_CHU_THE_VA_DN_DMST`).

### 9.1 User Stories Cho Bên Mua Đã Xác Thực

- **Là** một Đại diện Doanh nghiệp đã đăng nhập vào hệ thống Nacentwin, **Tôi muốn** khi mở Form Khảo sát Nhu cầu Công nghệ (`/khao-sat-nhu-cau`), toàn bộ thông tin pháp nhân và người liên hệ đã được nạp sẵn 100% vào Bước 1 (Phần A) **Để** tôi có thể tiến thẳng vào Bước 2 kê khai bài toán kỹ thuật mà không phải gõ lại bất kỳ thông tin cơ bản nào.
  - *Acceptance Scenario:* Given người dùng đã đăng nhập với tài khoản doanh nghiệp có hồ sơ hợp lệ tại `enterprise.enterprises`, When truy cập `/khao-sat-nhu-cau`, Then Bước 1 tự động hiển thị đầy đủ Tên DN, MST, Tỉnh/thành, Địa chỉ, Người liên hệ, SĐT, Email, Ngành nghề, Quy mô và Doanh thu kèm biểu trưng "Dữ liệu nạp từ Hồ sơ Doanh nghiệp".

### 9.2 Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)

- **`FR-Delta-15` [Tự Động Nạp Toàn Diện 100% Dữ Liệu Hồ Sơ Doanh Nghiệp Vào Form Khảo Sát (`SC-03-01`)]**:
  - Khi trang `/khao-sat-nhu-cau` được nạp, hệ thống kiểm tra phiên đăng nhập:
    - Nếu đã đăng nhập (`isAuthenticated = true`) và có liên kết với doanh nghiệp: Hệ thống gọi API `GET /api/v1/portal/enterprise/profile` hoặc lấy thông tin từ Claims/Context của người dùng.
    - Tự động điền toàn bộ 100% các trường thông tin Bước 1 (Phần A):
      1. Tên doanh nghiệp (`enterprise_name`)
      2. Mã số thuế (`tax_code`)
      3. Tỉnh/Thành phố (`province_city`)
      4. Địa chỉ trụ sở chính (`headquarters_address`)
      5. Họ tên người liên hệ (`contact_person_name`)
      6. Chức vụ người liên hệ (`contact_person_role`)
      7. Số điện thoại (`contact_phone`)
      8. Email (`contact_email`)
      9. Ngành hoạt động chính (`main_sector_name`)
      10. Quy mô lao động (`employee_scale_range`)
      11. Dải doanh thu (`revenue_range`)
    - Hiển thị Alert Banner trang trọng: *"Dữ liệu pháp nhân & liên hệ đã được tự động nạp từ Hồ sơ Doanh nghiệp của bạn. Bạn có thể nhấn Tiếp tục để điền bài toán kỹ thuật."*
    - Tự động đánh dấu Bước 1 là Hợp lệ (Valid), cho phép người dùng click trực tiếp vào Bước 2 (hoặc Stepper Bước 2) ngay lập tức.
- **`FR-Delta-16` [Liên Kết Dữ Liệu Demo Buyer Tài Khoản Trường Hoan]**:
  - Đối với tài khoản kiểm thử tiêu chuẩn `buyer.user@demo.nacentech.vn`: Khi mở form khảo sát, hệ thống tự động nạp chính xác thông tin pháp nhân của **CÔNG TY TNHH TRƯỜNG HOAN** (MST: `0100255428`, Hà Nội).

### 9.3 Quy Tắc Nghiệp Vụ Bổ Sung (Business Rules)

- **`BR-03-005` [Quy Tắc Bất Biến Tự Động Nạp Hồ Sơ Doanh Nghiệp Đã Đăng Nhập (Auto-Prefill Invariant)]**:
  *(Quy tắc bổ sung bắt buộc từ PO)*
  - Bất kỳ tài khoản Doanh nghiệp nào đã đăng nhập khi mở Form Khảo sát Nhu cầu Công nghệ DNNVV (`SC-03-01`) **bắt buộc phải được tự động nạp 100% thông tin Doanh nghiệp và Người liên hệ** từ hồ sơ đã liên kết trong CSDL `enterprise.enterprises`.
  - Tuyệt đối CẤM hiển thị Form trắng hoặc bắt buộc người dùng gõ lại MST, Tên doanh nghiệp, Tỉnh/thành hay SĐT/Email khi phiên đăng nhập đã hợp lệ.
  - Trường hợp tài khoản mới chưa cập nhật đầy đủ hồ sơ, hệ thống nạp các trường đã có và chỉ yêu cầu điền bổ sung các trường còn khuyết.
- **`BR-03-006` [Đồng Bộ Ngược Hồ Sơ Pháp Nhân Khi Có Thay Đổi (Bi-directional Sync Invariant)]**:
  - Nếu Doanh nghiệp đã đăng nhập chủ động chỉnh sửa thông tin pháp nhân hoặc người liên hệ tại Bước 1 của Form Khảo sát và hoàn tất nộp phiếu: Hệ thống hiển thị hộp thoại xác nhận đồng bộ: *"Bạn có muốn cập nhật các thay đổi này vào Hồ sơ Doanh nghiệp chính thức không?"*. Nếu đồng ý, bản ghi tại `enterprise.enterprises` được cập nhật đồng thời, đảm bảo tính toàn vẹn SSOT.

### 9.4 Tiêu Chí Nghiệm Thu Bổ Sung (Acceptance Criteria)

- **`AC-03-06` (AC-PREFILL-01 — Tự Động Nạp 100% Khi Đã Đăng Nhập)**:
  - Given người dùng đã đăng nhập với tài khoản Doanh nghiệp hợp lệ,
  - When truy cập vào đường dẫn `/khao-sat-nhu-cau`,
  - Then Bước 1 (Phần A) hiển thị 100% dữ liệu pháp nhân đã điền sẵn, không có bất kỳ ô bắt buộc nào bị bỏ trống, và nút "Tiếp tục sang Bước 2" sẵn sàng kích hoạt.
- **`AC-03-07` (AC-PREFILL-02 — Kiểm Thử Với Tài Khoản Demo Buyer)**:
  - Given đăng nhập với tài khoản `buyer.user@demo.nacentech.vn` (Mật khẩu: `Demo@2026`),
  - When mở trang `/khao-sat-nhu-cau`,
  - Then ô MST hiển thị đúng `0100255428`, ô Tên Doanh nghiệp hiển thị đúng `CÔNG TY TNHH TRƯỜNG HOAN`, Tỉnh/thành phố hiển thị đúng `Hà Nội`.



---

## 10. SPEC DELTA V2 (CR-2026-017): TÁI CẤU TRÚC FORM KHẢO SÁT NHU CẦU 4 TAB TINH GỌN (LEAN 4-STEP WIZARD)

> **Mã thay đổi**: `CR-2026-017` / `SPEC-DELTA-V2-TASK03`  
> **Căn cứ thay đổi**: 
> 1. Chỉ đạo của PO/PM về tối ưu hóa tỷ lệ hoàn tất (Form Conversion Rate) phiếu khảo sát nhu cầu chuyển giao công nghệ.
> 2. Khung phân tích Michael Porter: Định vị trọng tâm giá trị vào **Nhu cầu công nghệ thực tế (Demand Tickets)** và **Năng lực tài chính/pháp nhân**, loại bỏ sự cồng kềnh hành chính của quy trình 7 bước dàn trải.
> 3. Nguyên lý Kim tự tháp Barbara Minto (Pyramid Principle): Gom cụm thông tin theo nhóm chủ đề logic (Gộp B, C, D, F thành cụm Hiện trạng & Năng lực mở rộng), tạo cấu trúc 4 bước rõ ràng: **Nhu Cầu $\rightarrow$ Doanh Nghiệp $\rightarrow$ Thông Tin Bổ Sung $\rightarrow$ Xác Nhận**.

### 10.1 Bối Cảnh & Căn Cứ Thay Đổi

- **Thực trạng**: Phiếu khảo sát sâu DNNVV (`SC-03-01`) theo thiết kế cũ trải dài trên 7 bước riêng biệt (A, E, B, C, D, F, G). Quy trình 7 bước tạo ra rào cản tâm lý lớn cho doanh nghiệp vừa và nhỏ (SMEs), làm tăng tỷ lệ bỏ cuộc giữa chừng (drop-off rate) và khiến trải nghiệm người dùng trở nên nặng nề.
- **Giải pháp tinh gọn**: Rút gọn cấu trúc Stepper từ **7 tab xuống 4 tab**, trong đó phân định dứt khoát giữa **Phần Bắt Buộc Cốt Lõi (Mandatory Core)** và **Phần Bổ Sung Tùy Chọn (Optional Extension)**:
  - **Tab 1 [Bắt buộc]**: `E. Nhu Cầu & Thuật Toán TNI` — Thu thập ngay bài toán kỹ thuật, mục tiêu kỳ vọng và bộ 4 tham số $K, L, N, O$ để tính điểm TNI thời gian thực.
  - **Tab 2 [Bắt buộc]**: `A. Thông Tin Doanh Nghiệp` — Thu thập thông tin định danh pháp nhân, người liên hệ, hỗ trợ Auto-Lookup MST và Smart Pre-fill 100% hồ sơ đã đăng nhập.
  - **Tab 3 [Tùy chọn]**: `Thông Tin Bổ Sung / Hiện Trạng & Năng Lực` — Hợp nhất 4 phân mục sâu:
    1. *Phân mục B*: Hiện trạng máy móc thiết bị & Tự chấm 8 tiêu chí.
    2. *Phân mục C*: Nhận diện điểm nghẽn kỹ thuật & Công đoạn khó nhất.
    3. *Phân mục D*: Năng lực tiếp nhận công nghệ (TAR) & Đội ngũ nhân lực kỹ thuật.
    4. *Phân mục F*: Định hướng đổi mới sáng tạo 3 năm tới & Đề xuất hỗ trợ từ Nhà nước.
  - **Tab 4 [Bắt buộc]**: `G. Rà Soát & Xác Nhận PDPD` — Bảng tổng hợp tóm tắt toàn bộ thông tin khảo sát, thông tin người ký và cam kết bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.

---

### 10.2 Ma Trận Tác Động Đa Bề Mặt (Cross-Surface Impact Matrix)

| Bề Mặt / Màn Hình | File Path | Hiện Trạng (7 Bước) | Thay Đổi Cần Làm (4 Tabs Tinh Gọn) |
| :--- | :--- | :--- | :--- |
| **SC-03-01: Form Khảo Sát Sâu** | `frontend/src/app/khao-sat-nhu-cau/page.tsx` | Stepper 7 bước (`currentStep` từ 1..7). Tiến độ tính theo `(currentStep / 7) * 100%`. Có 7 khối điều kiện rendering riêng. | - Tái cấu trúc thành 4 bước (`currentStep` từ 1..4).<br>- Tiến độ tính theo `(currentStep / 4) * 100%`.<br>- Gom 4 phân mục B, C, D, F vào Tab 3 thành các card phân nhóm mạch lạc.<br>- Cho phép click tự do vào bất kỳ Tab nào trên Stepper.<br>- Tab 2 có lối tắt "Bỏ qua bước tùy chọn & Đến nộp phiếu" nhảy thẳng sang Tab 4. |
| **Frontend Test Suite** | `frontend/src/app/khao-sat-nhu-cau/page.test.tsx` | 12 Vitest tests kiểm thử luồng 7 bước (`Bước 1/7..7/7`, nút `Tiếp tục Bước 2..7`). | - Cập nhật assertions tương thích với Stepper 4 bước (`Bước 1/4..4/4`).<br>- Cập nhật luồng chuyển bước (Next từ 1 $\rightarrow$ 2 $\rightarrow$ 3 $\rightarrow$ 4 và Skip từ 2 $\rightarrow$ 4).<br>- Bổ sung test kiểm chứng Tab 3 chứa đủ 4 phân mục B, C, D, F và không chặn submit khi để trống. |
| **E2E & QC Gate Verification** | `tests/qc_gate4_independent_verification.py` | Kiểm tra hành vi prefill và chuyển tiếp từ form khảo sát. | Bảo toàn các bộ định vị input và luồng điều hướng hợp lệ của Bước 1 & Bước 2. |
| **Backend API Contract** | `backend/apps/api/V1Compat/DemandController.cs` | Endpoint `POST /api/v1/demands/surveys` nhận DTO `SubmitDeepSurveyRequest` đầy đủ các trường của 7 phân mục. | **Giữ nguyên 100% không đổi**: Payload DTO đã có cấu trúc phẳng và hỗ trợ đầy đủ các trường tùy chọn của phân mục B, C, D, F. Không phát sinh breaking changes tại Backend/CSDL. |

---

### 10.3 Yêu Cầu Chức Năng Mới (FR-NEW-03-01)

- **`FR-NEW-03-01` [Tái Cấu Trúc Form Khảo Sát Nhu Cầu Thành 4 Tab Tinh Gọn]**:
  1. **Cấu Trúc Stepper 4 Bước**:
     - Stepper hiển thị chính xác 4 tab:
       * **Tab 1**: `E. Nhu Cầu & TNI` (Bắt buộc)
       * **Tab 2**: `A. Doanh Nghiệp` (Bắt buộc)
       * **Tab 3**: `Thông Tin Bổ Sung` (Tùy chọn)
       * **Tab 4**: `G. Xác Nhận` (Bắt buộc)
     - Thanh chỉ báo hoàn thành tính theo tỷ lệ phần trăm: `(currentStep / 4) * 100%` (25%, 50%, 75%, 100%).
  2. **Chi Tiết Nội Dung Từng Tab**:
     - **Tab 1 (`currentStep === 1`)**:
       * Kế thừa toàn bộ giao diện Danh mục bài toán kỹ thuật (Demand Tickets) và Widget Realtime TNI Calculator ($K, L, N, O$).
       * Cho phép Thêm bài toán mới, Xóa bài toán (giữ lại tối thiểu 1).
     - **Tab 2 (`currentStep === 2`)**:
       * Kế thừa toàn bộ khối Thông tin Doanh nghiệp & Quy mô sản xuất.
       * Tích hợp tính năng Tra cứu tự động MST (`lookup-tax`) và Tự động nạp 100% hồ sơ Doanh nghiệp đã đăng nhập (`isPrefilledFromSession`).
       * Hiển thị nút bấm lối tắt hành động kép: **"Tiếp tục Bước 3 (Điền thông tin bổ sung)"** và **"Bỏ qua bước tùy chọn & Đến nộp phiếu"** (Chuyển thẳng sang Tab 4).
     - **Tab 3 (`currentStep === 3`)**:
       * Khối giao diện hợp nhất (Unified Supplementary Container) hiển thị tuần tự 4 phân mục dưới dạng các thẻ nghiệp vụ chuyên đề có nhãn "Tùy chọn":
         - **Phân mục B**: Danh mục thiết bị, dây chuyền chủ lực & Bảng tự đánh giá 8 tiêu chí hiện trạng (1–5).
         - **Phân mục C**: Bảng nhận diện điểm nghẽn kỹ thuật (tối đa 5 điểm) & Công đoạn khó nhất, nguyên nhân chính.
         - **Phân mục D**: Thống kê đội ngũ nhân lực kỹ thuật, cơ chế R&D hiện có & Năng lực hấp thụ công nghệ (TAR).
         - **Phân mục F**: Nhu cầu tiếp cận công nghệ tiên tiến trong 3 năm tới & Nhu cầu đề xuất hỗ trợ từ Nhà nước.
       * Tại cuối Tab 3, cung cấp 2 nút điều hướng: **"Quay lại Bước 2"** và **"Tiếp tục sang Bước 4 (Rà soát & Nộp phiếu)"**.
     - **Tab 4 (`currentStep === 4`)**:
       * Bản tóm tắt phiếu khảo sát (Summary Review): Hiển thị số lượng bài toán kỹ thuật đã kê khai, tên doanh nghiệp, MST, trạng thái thông tin bổ sung (Đã điền / Để trống).
       * Họ tên người ký xác nhận, Chức vụ người ký, Ngày lập phiếu.
       * Checkbox cam kết tính xác thực & Chấp thuận điều khoản bảo vệ dữ liệu cá nhân (PDPD NĐ 13/2023/NĐ-CP).
       * Nút nộp phiếu: **"Hoàn Tất & Nộp Khảo Sát"**.

---

### 10.4 Quy Tắc Nghiệp Vụ Bổ Sung (BR-NEW-03-01)

- **`BR-NEW-03-01` [Quy Tắc Vận Hành Stepper 4 Bước, Tùy Chọn Mở Rộng & Validation Phân Tầng]**:
  1. **Quy Tắc Điều Hướng Tự Do (Free-click Tab Navigation Invariant)**:
     - Người dùng có quyền click trực tiếp vào bất kỳ tab nào (1, 2, 3 hoặc 4) trên thanh Stepper Navigation ở bất kỳ thời điểm nào để xem trước cấu trúc hoặc bổ sung thông tin mà không bị hệ thống chặn chuyển view.
  2. **Quy Tắc Ràng Buộc Tuần Tự (Step-by-Step Guard Invariant)**:
     - Khi người dùng sử dụng nút **"Tiếp tục"** ở chân trang:
       * *Từ Bước 1 sang Bước 2*: Bắt buộc người dùng phải nhập tối thiểu 1 bài toán kỹ thuật hợp lệ (có công đoạn, vấn đề kỹ thuật và mục tiêu kỳ vọng). Nếu chưa điền, hệ thống giữ nguyên tại Bước 1 và cuộn đến vị trí trường lỗi.
       * *Từ Bước 2 sang Bước 3*: Bắt buộc người dùng phải điền đầy đủ các thông tin pháp nhân cốt lõi (Tên doanh nghiệp, MST, Tỉnh/thành phố, Họ tên người liên hệ, SĐT, Email).
       * *Từ Bước 3 sang Bước 4*: **Tuyệt đối KHÔNG chặn**. Người dùng có thể nhấn "Tiếp tục sang Bước 4" kể cả khi không điền bất kỳ thông tin nào trong cả 4 phân mục B, C, D, F.
  3. **Quy Tắc Lối Tắt Fast-Track (Skip Optional Step Invariant)**:
     - Tại Bước 2, sau khi đã hoàn tất thông tin doanh nghiệp, người dùng được cung cấp nút **"Bỏ qua bước tùy chọn & Đến nộp phiếu"** để đi thẳng đến Bước 4 (Tab G) mà không cần phải duyệt qua Bước 3.
  4. **Quy Tắc Thẩm Định Nghiệm Thu Khi Nộp Phiếu (Final Submission Gatekeeping Invariant)**:
     - Khi người dùng bấm **"Hoàn Tất & Nộp Khảo Sát"** tại Bước 4, hệ thống kích hoạt cơ chế Validation toàn diện 3 tầng:
       * *Tầng 1 (Bài toán - Bước 1)*: Có ít nhất 1 bài toán hợp lệ. Nếu vi phạm $\rightarrow$ Báo lỗi và điều hướng về Bước 1.
       * *Tầng 2 (Doanh nghiệp - Bước 2)*: Đầy đủ Tên DN, MST, Tỉnh/thành, Người liên hệ, SĐT, Email hợp lệ. Nếu vi phạm $\rightarrow$ Báo lỗi và điều hướng về Bước 2.
       * *Tầng 3 (Xác nhận - Bước 4)*: Đã nhập Họ tên người ký, Chức vụ và đã tick chọn checkbox đồng thuận PDPD.
     - Dữ liệu tại Bước 3 (B, C, D, F) hoàn toàn không bắt buộc; các trường không điền sẽ được gửi dưới dạng `null` hoặc mảng rỗng `[]` lên API, backend tiếp nhận an toàn và không gây lỗi validation.

---

### 10.5 Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **`AC-NEW-03-01` [Cấu Trúc 4 Tab & Stepper Navigation Bar]**:
  - **Given** người dùng truy cập vào trang `/khao-sat-nhu-cau`,
  - **When** trang tải hoàn tất,
  - **Then** Stepper Navigation Bar hiển thị chính xác 4 nút tab:
    1. `E. Nhu Cầu & TNI` (Bước 1/4)
    2. `A. Doanh Nghiệp` (Bước 2/4)
    3. `Thông Tin Bổ Sung` (Bước 3/4)
    4. `G. Xác Nhận` (Bước 4/4)
  - **And** chỉ số tiến độ hiển thị đúng `Bước 1/4: E. Nhu Cầu & Thuật Toán TNI (Bắt buộc)` kèm thanh tiến độ 25%.

- **`AC-NEW-03-02` [Validation Chuyển Bước Tại Tab 1]**:
  - **Given** người dùng đang ở Tab 1 với form bài toán để trống,
  - **When** người dùng bấm nút "Tiếp tục Bước 2",
  - **Then** hệ thống không chuyển bước, giữ nguyên tại Tab 1 và hiển thị cảnh báo yêu cầu điền đầy đủ thông tin bài toán kỹ thuật.
  - **When** người dùng điền đầy đủ Công đoạn, Mô tả vấn đề, Mục tiêu kỳ vọng và bấm lại "Tiếp tục Bước 2",
  - **Then** hệ thống chuyển thành công sang Tab 2 (A. Doanh Nghiệp).

- **`AC-NEW-03-03` [Validation Chuyển Bước & Lối Tắt Fast-Track Tại Tab 2]**:
  - **Given** người dùng đang ở Tab 2 với các trường thông tin doanh nghiệp chưa điền,
  - **When** bấm "Tiếp tục Bước 3",
  - **Then** hệ thống báo lỗi các trường bắt buộc (Tên DN, MST, Tỉnh/thành, Đại diện, SĐT, Email) và không cho chuyển bước.
  - **When** thông tin doanh nghiệp đã được nạp đầy đủ (bằng tay hoặc qua Auto-Prefill),
  - **Then** người dùng có thể bấm "Tiếp tục Bước 3" để sang Tab 3, HOẶC bấm "Bỏ qua bước tùy chọn & Đến nộp phiếu" để nhảy thẳng sang Tab 4 (G. Xác Nhận).

- **`AC-NEW-03-04` [Tab 3 Hợp Nhất 4 Phân Mục Tùy Chọn & Không Bị Chặn]**:
  - **Given** người dùng chuyển vào Tab 3,
  - **When** quan sát giao diện,
  - **Then** Tab 3 hiển thị đầy đủ 4 phân mục:
    * Phân mục B: Thiết bị & 8 tiêu chí hiện trạng
    * Phân mục C: Điểm nghẽn sản xuất
    * Phân mục D: Năng lực tiếp nhận TAR
    * Phân mục F: Định hướng công nghệ & Hỗ trợ
  - **When** người dùng không điền bất kỳ thông tin nào trong Tab 3 và bấm nút "Tiếp tục sang Bước 4",
  - **Then** hệ thống cho phép chuyển mượt mà sang Tab 4 mà không hiển thị bất kỳ lỗi nào.

- **`AC-NEW-03-05` [Tab 4 Rà Soát, Cam Kết PDPD & Nộp Phiếu Thành Công]**:
  - **Given** người dùng đã hoàn thành hợp lệ Tab 1 và Tab 2, đang ở Tab 4,
  - **When** bấm "Hoàn Tất & Nộp Khảo Sát" nhưng chưa nhập người ký hoặc chưa tick cam kết PDPD,
  - **Then** hệ thống hiển thị thông báo lỗi yêu cầu hoàn tất xác nhận.
  - **When** người dùng nhập đầy đủ Người ký, Chức vụ và tick chọn cam kết bảo mật PDPD, sau đó bấm "Hoàn Tất & Nộp Khảo Sát",
  - **Then** hệ thống gửi yêu cầu `POST /api/v1/demands/surveys` thành công, chuyển sang màn hình Success View hiển thị mã phiếu `SUR-XXXXX` và mã bài toán `DMD-XXXXX`.

- **`AC-NEW-03-06` [Điều Hướng Tự Do Bằng Click Stepper (Free-Click Navigation)]**:
  - **Given** người dùng ở bất kỳ bước nào trong 4 tab,
  - **When** người dùng click chuột trực tiếp vào nút Tab 3 trên thanh Stepper Navigation,
  - **Then** giao diện chuyển ngay sang hiển thị nội dung Tab 3 mà không đòi hỏi dữ liệu của các tab trước đó phải được submit.

---

## 11. Spec Delta v2 (CR-2026-017): Làm Mịn Bàn Làm Việc Bài Toán Đổi Mới Công Nghệ & Nâng Cấp Modal Tạo Bài Toán

**Căn cứ phê duyệt:** Chỉ đạo của PO tại phiên làm việc ngày 23/10/2026; Triệt tiêu dev badge rác kỹ thuật, bổ sung phân trang bàn làm việc và các trường nghiệp vụ quan trọng cho bài toán công nghệ (Target TRL, Ẩn danh bảo mật, Thời hạn, File RFP).

### 11.1 Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)

- **REQ-BUYER-DMD-001 (Zero Dev Badges & Standardized Title)**:
  - Loại bỏ hoàn toàn badge `TASK-03` trên sub-header của `/portal/buyer/demands`.
  - Chuẩn hóa tiêu đề chính thành **`Bàn Làm Việc Bài Toán Đổi Mới Công Nghệ`** với badge nghiệp vụ **`BÊN MUA CÔNG NGHỆ`**.

- **REQ-BUYER-DMD-002 (Data Grid Pagination)**:
  - Bàn làm việc MUST hỗ trợ phân trang cho danh sách bài toán với kích thước trang chuẩn (`pageSize = 5` hoặc `10`).
  - Cung cấp thanh điều khiển phân trang: nút `Trang trước`, danh sách nút số trang `[1] [2]...`, nút `Trang sau`, và nhãn thông tin `Hiển thị X - Y trong tổng số Z bài toán`.
  - Đảm bảo khi chuyển tab lọc trạng thái (Tất cả, Đang mở, Chờ duyệt, Đã đóng, Đang theo dõi), trang hiện tại được tự động reset về trang 1.

- **REQ-BUYER-DMD-003 (QuickDemandModal Advanced Fields - Target TRL & Confidentiality)**:
  - Modal tạo bài toán nhanh `QuickDemandModal` MUST bổ sung 4 trường nghiệp vụ thiết yếu:
    1. **Target TRL Range (Dải TRL mong muốn tiếp nhận)**: Lựa chọn 3 phân khúc:
       - `TRL 1–3`: Nghiên cứu cơ bản / Proof of Concept (Lab)
       - `TRL 4–6`: Thử nghiệm Pilot / Mô hình thực nghiệm (Default)
       - `TRL 7–9`: Công nghệ hoàn thiện / Sẵn sàng thương mại hóa
    2. **Chế độ bảo mật danh tính (Confidential Mode)**: Checkbox `isConfidential` cho phép doanh nghiệp đăng bài toán ẩn danh, chỉ công khai điểm nghẽn kỹ thuật nhằm bảo vệ bí mật kinh doanh.
    3. **Thời hạn nhận đề xuất giải pháp (Deadline)**: Trường chọn ngày `deadlineDate`.
    4. **Đính kèm hồ sơ kỹ thuật (RFP / Technical Specs)**: Hỗ trợ đính kèm tệp tài liệu `rfpFileName`.

### 11.2 Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **AC-DELTA-DMD-01 (Zero Dev Badge)**: Không còn xuất hiện badge `TASK-03` trên giao diện người dùng `/portal/buyer/demands`. Tiêu đề hiển thị chuẩn hóa `Bàn Làm Việc Bài Toán Đổi Mới Công Nghệ`.
- **AC-DELTA-DMD-02 (Pagination Control)**: Khi danh sách bài toán vượt quá `pageSize`, hệ thống chia trang chính xác và cho phép bấm chuyển giữa các trang mượt mà.
- **AC-DELTA-DMD-03 (Quick Demand Modal Advanced Fields)**: Mở modal đăng bài toán, người dùng có thể chọn dải TRL mong muốn, tick chọn chế độ bảo mật ẩn danh và nhập thời hạn đề xuất.
- **AC-DELTA-DMD-04 (Zero Regression)**: Toàn bộ các test suite hiện có của module Buyer Demands chạy pass 100%.



---

## Giai đoạn Delta v1.1: Mở Quyền Đăng Nhu Cầu Cho PUBLIC_USER (CR-TASK-03-DELTA-01)

> **Căn cứ pháp lý & Quyết định PO**: Quyết định PO `PO-DEC-20261030-01` & Yêu cầu thay đổi `CR-TASK-03-DELTA-01` ngày 30/10/2026.  
> **Mục tiêu**: Phá vỡ rào cản pháp nhân, cho phép cá nhân, kỹ sư, nhà sáng chế độc lập và thành viên đại chúng (`PUBLIC_USER` / `USER`) đóng góp bài toán công nghệ từ thực tiễn sản xuất vào kho dữ liệu nhu cầu Quốc gia.

### 12.1 Yêu Cầu Kỹ Thuật Nghiệp Vụ (Requirements Specification)

- **`REQ-BUYER-DMD-004` [Mở Quyền Truy Cập & Kích Hoạt QuickDemandModal Cho PUBLIC_USER & USER]**:
  1. Hệ thống MUST cho phép người dùng mang vai trò `PUBLIC_USER` hoặc `USER` (đã đăng nhập, chưa nâng hạng pháp nhân) được phép mở và thao tác trên component `QuickDemandModal`.
  2. Điểm kích hoạt (Entry Points) hỗ trợ cho `PUBLIC_USER`:
     - Nút CTA **"Đăng bài toán nhanh"** trên Banner Hành động nhanh tại Bàn làm việc `/portal`.
     - Nút **"Đăng bài toán kỹ thuật"** trên thanh công cụ của Sàn Nhu cầu Công nghệ `/nhu-cau-cong-nghe`.
  3. Form `QuickDemandModal` khi được mở bởi `PUBLIC_USER`:
     - Tự động ẩn hoặc chuyển trường Mã số thuế (MST) / Tên doanh nghiệp thành trường không bắt buộc (Optional).
     - Cho phép người dùng nhập trực tiếp thông tin người đề xuất (Họ tên, SĐT, Email - tự động nạp từ phiên đăng nhập).
     - Thu thập đủ các trường kỹ thuật cốt lõi: Tiêu đề bài toán, Công đoạn sản xuất, Vấn đề kỹ thuật gặp phải, Mục tiêu kỳ vọng, Dải TRL mong muốn (`TRL 1-3`, `TRL 4-6`, `TRL 7-9`), Thời hạn đề xuất, và 4 tham số TNI ($K, L, N, O$).

- **`BR-DMD-PUBLIC-01` [Quy Tắc Tiếp Nhận & Thẩm Định Bài Toán Từ Thành Viên Đại Chúng]**:
  1. **Trạng Thái Khởi Tạo Mặc Định (Default PENDING Status)**:
     - Mọi bài toán kỹ thuật được gửi từ vai trò `PUBLIC_USER` hoặc `USER` khi lưu vào CSDL (`demand_items`) MUST có trạng thái khởi tạo `status = 'PENDING'`.
     - Tuyệt đối KHÔNG niêm yết công khai trực tiếp lên sàn `/nhu-cau-cong-nghe` khi chưa qua quy trình thẩm định.
  2. **Quy Trình Thẩm Định & Phân Luồng (Triage & Verification Workflow)**:
     - Hồ sơ bài toán tự động được gắn `approval_type = 'DEMAND'` và đẩy vào Hàng đợi tiếp nhận `/gov/demands` của Sở KH&CN địa phương (dựa trên địa bàn người dùng khai báo hoặc mặc định Sở KH&CN đầu mối).
     - Cán bộ thẩm tra (`PROVINCE_OFFICER`) và Lãnh đạo Sở (`PROVINCE_LEADER` / `PROVINCIAL_ADMIN`) hoặc Admin Sàn (`OPERATOR_ADMIN`, `SUPER_ADMIN`) có thẩm quyền rà soát nội dung:
       * Loại bỏ các bài toán spam, nội dung quảng cáo sai quy định hoặc không mang tính kỹ thuật.
       * Chuẩn hóa từ khóa phân loại ngành (`LV01–LV18`, `CN01–CN48`).
       * Phê duyệt bài toán chuyển trạng thái `status = 'VERIFIED'` để niêm yết công khai lên sàn và kích hoạt Radar Ghép Nối AI.
  3. **Tuân Thủ Bảo Vệ Dữ Liệu Cá Nhân (PDPD Compliance - NĐ 13/2023/NĐ-CP)**:
     - Toàn bộ thông tin cá nhân của người đề xuất (Họ tên, Số điện thoại cá nhân, Địa chỉ Email cá nhân) MUST được mã hóa và ẩn danh (Masking) trên toàn bộ các bề mặt công khai.
     - Bên Bán hoặc Chuyên gia chỉ có thể xem nội dung bài toán kỹ thuật, mục tiêu và điểm TNI; chỉ được tiếp cận thông tin liên hệ khi người đề xuất bài toán chủ động bấm "Chấp thuận kết nối" (Opt-in Handshake).
  4. **Miễn Trừ Thủ Tục Pháp Nhân (No Corporate Tax ID Requirement)**:
     - Tuyệt đối KHÔNG chặn nộp bài toán nếu người dùng để trống Mã số thuế (MST) hoặc Giấy phép ĐKKD.
     - Bản ghi liên kết trực tiếp với mã định danh cá nhân: `created_by = current_user.id`, `scope_type = 'GLOBAL'`, `institution_id = null`.

### 12.2 Ma Trận Phân Quyền 10 Roles Cho Chức Năng Đăng Bài Toán Nhu Cầu Nhanh

| STT | Mã Vai Trò (Role Code) | Tên Phân Quyền Vai Trò | Quyền Mở `QuickDemandModal` | Quyền Submit Bài Toán | Ràng Buộc MST Doanh Nghiệp | Trạng Thái Bản Ghi Mới | Hàng Đợi Thẩm Định |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | `SUPER_ADMIN` | Quản trị viên Tối cao Trung ương | Có | Có | Không | `VERIFIED` | Bỏ qua kiểm duyệt (Direct Verified) |
| 2 | `OPERATOR_ADMIN` | Quản trị viên Vận hành Sàn | Có | Có | Không | `VERIFIED` | Bỏ qua kiểm duyệt (Hỗ trợ nhập liệu) |
| 3 | `PROVINCIAL_ADMIN` | Lãnh đạo / QTV Sở KH&CN Tỉnh | Có | Có | Không | `VERIFIED` | Bài toán đặt hàng KH&CN cấp Tỉnh |
| 4 | `PROVINCE_OFFICER` | Chuyên viên Thẩm tra Sở KH&CN | Có | Có | Không | `PENDING` | Chờ Lãnh đạo Sở phê duyệt |
| 5 | `ENTERPRISE` | Doanh nghiệp ĐMST (Đã xác minh MST) | Có | Có | Bắt buộc | `PENDING` | Ưu tiên đối soát CSDL 304 DN |
| 6 | `BUYER` | Bên Mua Công nghệ Chính Thức | Có | Có | Bắt buộc | `PENDING` | Kích hoạt Deal Room & Radar AI sau duyệt |
| 7 | `SELLER` | Bên Bán Công nghệ (Chủ Gian Hàng) | Có | Có | Không | `PENDING` | Tìm kiếm công nghệ bổ trợ R&D |
| 8 | `VERIFIED_EXPERT` | Chuyên gia KH&CN đã được Sở cấp thẻ | Có | Có | Không | `PENDING` | Bài toán R&D / Đề tài thử nghiệm |
| 9 | `INNOVATION_ENTITY` | Viện nghiên cứu, Trường Đại học, HTX | Có | Có | Tùy chọn | `PENDING` | Nhu cầu chuyển giao công nghệ liên ngành |
| 10 | `PUBLIC_USER` / `USER` | **Thành viên đại chúng / Kỹ sư cá nhân** | **CÓ (MỚI)** | **CÓ (MỚI)** | **KHÔNG BẮT BUỘC** | **`PENDING`** | **Bắt buộc qua Thẩm định Sở/Sàn (PDPD Protected)** |

### 12.3 Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **`AC-DELTA-DMD-05` [Mở Modal & Đăng Bài Toán Thành Công Bởi PUBLIC_USER]**:
  - **Given** người dùng đăng nhập tài khoản có vai trò `PUBLIC_USER` (hoặc `USER`),
  - **When** bấm nút "Đăng bài toán nhanh" tại Bàn làm việc `/portal` hoặc Sàn `/nhu-cau-cong-nghe`,
  - **Then** modal `QuickDemandModal` mở ra mà không yêu cầu nhập Mã số thuế,
  - **When** người dùng nhập đầy đủ Tiêu đề, Mô tả vấn đề, Mục tiêu, chọn dải TRL và chấm điểm 4 tham số $K, L, N, O$, sau đó bấm "Gửi bài toán",
  - **Then** hệ thống gửi yêu cầu `POST /api/v1/demands/items` thành công,
  - **And** bản ghi được khởi tạo với trạng thái `PENDING`, hiển thị thông báo "Bài toán kỹ thuật của bạn đã được tiếp nhận và đang chờ Sở KH&CN / Ban quản trị thẩm định".

- **`AC-DELTA-DMD-06` [Chặn Hiển Thị Công Khai Cho Đến Khi Thẩm Định]**:
  - **Given** bài toán được tạo bởi `PUBLIC_USER` đang ở trạng thái `PENDING`,
  - **When** người dùng vãng lai hoặc Seller truy cập Sàn `/nhu-cau-cong-nghe`,
  - **Then** bài toán này KHÔNG xuất hiện trên danh sách công khai.
  - **When** Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN`) đăng nhập vào `/gov/demands` và duyệt bài toán sang `VERIFIED`,
  - **Then** bài toán xuất hiện công khai trên `/nhu-cau-cong-nghe` với thông tin cá nhân đã được Masking theo chuẩn PDPD.

- **`AC-DELTA-DMD-07` [Zero Regression RBAC & Backward Compatibility]**:
  - **Given** các tài khoản mang vai trò `BUYER`, `ENTERPRISE`, `SELLER`, `VERIFIED_EXPERT`, `SUPER_ADMIN`,
  - **When** thực hiện tạo bài toán qua `QuickDemandModal` hoặc Khảo sát chuyên sâu `/khao-sat-nhu-cau`,
  - **Then** hành vi, luồng dữ liệu và validation của các vai trò này hoạt động đúng theo đặc tả gốc, không phát sinh lỗi hồi quy.

---

## Spec Delta v5: Chuẩn Hóa Zero-Mock Số Liệu Sàn Tìm Mua & Taxonomy SSOT (CR-2026-010)

> **Căn cứ thay đổi**: Quyết định `PO-DEC-20261030-01` & Yêu cầu thay đổi [`CR-2026-010`](../../docs/change-requests/CR-2026-010-marketplace-metrics-and-taxonomy.md).

### 1. Bối cảnh & Mục tiêu
- **Xóa bỏ số liệu tĩnh**: Gỡ bỏ vĩnh viễn 3 khối số liệu tĩnh hardcoded `"142 bài toán"`, `"68.5 tỷ"`, `"24 giờ"` trên Hero Banner Sàn Tìm Mua (`app/nhu-cau-cong-nghe/page.tsx`).
- **Nạp động thời gian thực từ API thật**:
  - `totalDemands`: Đếm tổng số bài toán nhu cầu có trạng thái `PUBLISHED` từ schema `demand`.
  - `totalBudget`: Tính tổng giá trị ngân sách dự kiến của các bài toán công khai.
  - `slaSupport`: Cam kết thời gian kết nối hỗ trợ của nền tảng.
- **5 UX States qua `<Async>`**: Bắt buộc mọi khối số liệu thống kê và danh sách bài toán xử lý qua component chuẩn `<Async>`. Không bao giờ fallback số giả khi mất kết nối mạng.
- **Đồng bộ Taxonomy 10 Lĩnh vực TT17**: Combobox bộ lọc Lĩnh vực nạp động 100% từ `GET /api/v1/master-data/sectors?activeOnly=true`. Nghiêm cấm mảng tự chế 18 ngành hoặc mã khuyết.

### 2. Tiêu chí Đo Lường Hoàn Thành (Success Criteria)
- **`SC-DELTA-DMD-08`**: 100% số liệu hiển thị trên Hero Banner của Sàn Tìm Mua lấy từ API backend thật, khớp chính xác từng đơn vị với CSDL PostgreSQL.
- **`SC-DELTA-DMD-09`**: Khi CSDL chưa có bài toán nào, hệ thống hiển thị trung thực con số `0` bài toán kèm lời mời đăng bài, không hiển thị bất kỳ số giả định nào.
- **`SC-DELTA-DMD-10`**: Bộ lọc Lĩnh vực hiển thị đúng 10 Lĩnh vực chuẩn TT17, lọc chính xác các bài toán thuộc mã `LV` được chọn.

---

## DELTA-CR-2026-10-30: Chuẩn Hóa Thuật Ngữ TT17 "Nhu Cầu Công Nghệ", Mở Quyền Quick Demand Cho PUBLIC_USER & Kỷ Luật Zero-Mock KPI Summary

> **Căn cứ thay đổi**: Quyết định `PO-DEC-20261030-01` & `PO-DEC-20261030-02`, Kế hoạch Đợt 1 chuẩn hóa thuật ngữ TT17 và số liệu đo lường toàn sàn.

### 1. Bối Cảnh & Lý Do Thay Đổi
- **Chuẩn hóa thuật ngữ TT17**: Thông tư 17/2019/TT-BKHCN quy định chính thức thuật ngữ **"Nhu cầu công nghệ"** (Technology Demand), loại bỏ thuật ngữ tự phát "Bài toán đổi mới / Bài toán công nghệ" gây lệch chuẩn văn bản quy phạm pháp luật.
- **Mở quyền đăng nhu cầu nhanh cho đại chúng**: Người dùng cá nhân, kỹ sư (`PUBLIC_USER`, `USER`) được nộp nhu cầu kỹ thuật mà không cần MST, chuyển vào hàng đợi duyệt `PENDING` và bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (PDPD).
- **Kỷ luật Zero-Mock KPI Summary**: Xóa bỏ 100% số liệu ảo (`142 bài toán`, `68.5 tỷ`, `24 giờ`), nạp động qua API thời gian thực từ schema `demand`, hỗ trợ 5 UX states qua component `<Async>`.

### 2. Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)
- **`REQ-DEL-03-01` (Chuẩn Hóa Thuật Ngữ TT17: Nhu Cầu Công Nghệ)**:
  - Trên toàn bộ giao diện Sàn Tìm Mua (`/nhu-cau-cong-nghe`), Form khảo sát (`/khao-sat-nhu-cau`), Modal đăng nhanh (`QuickDemandModal`), Bảng Kanban điều phối và các nhãn điều hướng: MUST thay thế toàn diện cụm từ `"Bài toán đổi mới"` / `"Bài toán công nghệ"` thành cụm từ chuẩn hóa **`"Nhu cầu công nghệ"`** theo đúng Thông tư 17/2019/TT-BKHCN.
  - Các nhãn nút bấm, placeholder, thông báo hệ thống được cập nhật đồng bộ (ví dụ: *"Đăng nhu cầu công nghệ"*, *"Tìm kiếm nhu cầu công nghệ"*, *"Tra cứu nhu cầu theo lĩnh vực"*).
- **`REQ-DEL-03-02` (Mở Quyền Quick Demand Cho PUBLIC_USER & Chế Độ Bảo Vệ PDPD)**:
  - Cho phép tài khoản `PUBLIC_USER` / `USER` mở và nộp form `QuickDemandModal` từ cả hai bề mặt: Trang tổng quan / Không gian cá nhân (`/portal`) và Sàn Nhu cầu (`/nhu-cau-cong-nghe`).
  - Không bắt buộc Mã số thuế (MST) và ĐKKD doanh nghiệp đối với người nộp là cá nhân/kỹ sư. Gán `scope_type = 'GLOBAL'`, `institution_id = null`, `created_by = current_user.id`.
  - Trạng thái bản ghi khởi tạo mặc định là `PENDING` (chờ Cán bộ Sở KH&CN hoặc Quản trị viên Sàn thẩm tra tính hợp lệ và loại trừ spam trước khi niêm yết).
  - Áp dụng bảo vệ PDPD: Thông tin định danh cá nhân (Họ tên, SĐT, Email) của người nộp bắt buộc phải được che mờ (masking) khi hiển thị công khai trên Sàn.

### 3. Quy Tắc Nghiệp Vụ (Business Rules)
- **`BR-DEL-03-01` (Kỷ Luật Zero-Mock KPI Summary & Marketplace Metrics)**:
  - **Triệt tiêu số liệu tĩnh**: Xóa bỏ vĩnh viễn toàn bộ số liệu tĩnh hardcoded (`"142 bài toán"`, `"68.5 tỷ"`, `"24 giờ"`) trên Hero Banner Sàn Tìm Mua (`app/nhu-cau-cong-nghe/page.tsx`).
  - **Nạp động 100% qua API backend thật**:
    * `totalDemands`: Đếm thời gian thực tổng số nhu cầu công nghệ có trạng thái `PUBLISHED` từ schema `demand`.
    * `totalBudget`: Tính tổng giá trị ngân sách dự kiến của các nhu cầu công khai (chuyển đổi đơn vị Triệu VNĐ / Tỷ VNĐ).
    * `slaSupport`: Cam kết thời gian phản hồi hỗ trợ kết nối từ nền tảng.
  - **Kỷ luật 5 UX States qua `<Async>`**: Mọi khối số liệu thống kê summary bắt buộc xử lý qua component `<Async>` hỗ trợ đủ 5 trạng thái (Loading, Empty, Error, Success, Updating). Khi CSDL chưa có dữ liệu, hiển thị trung thực con số `0`, cấm tuyệt đối fallback số dummy ảo trong khối `catch`.
  - **Đồng bộ Taxonomy SSOT 10 Lĩnh vực TT17**: Bộ lọc Lĩnh vực nạp động 100% từ `GET /api/v1/master-data/sectors?activeOnly=true`, khớp chính xác 10 mã `LV` chuẩn, triệt tiêu mảng tự chế 18 ngành.

### 4. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)
- **`AC-DEL-03-01` (TT17 Terminology Standardization)**:
  - 100% nhãn giao diện, bộ lọc, modal và thông báo tại phân hệ Sàn Tìm Mua hiển thị nhất quán cụm từ `"Nhu cầu công nghệ"`, không còn xuất hiện cụm từ `"Bài toán đổi mới"`.
- **`AC-DEL-03-02` (PUBLIC_USER Quick Demand Submission)**:
  - Người dùng đăng nhập vai trò `PUBLIC_USER` có thể bấm mở `QuickDemandModal`, form không yêu cầu MST, nhập nội dung nhu cầu và nộp thành công với status `PENDING`. Bản ghi không hiển thị công khai cho đến khi được duyệt sang `VERIFIED`.
- **`AC-DEL-03-03` (Zero-Mock Marketplace Metrics Validation)**:
  - Hero banner Sàn Tìm Mua hiển thị số liệu thực tế từ API `GET /api/v1/portal/stats` hoặc endpoint đếm nhu cầu thật. Không xuất hiện chuỗi hardcoded `"142 bài toán"` hay `"68.5 tỷ"`. Khi CSDL có 0 bản ghi, hiển thị chính xác số `0`.

### 5. Ma Trận Truy Vết Khép Kín (Traceability Matrix)
| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-DEL-03-01** | `BR-DEL-03-01` | `AC-DEL-03-01` | `app/nhu-cau-cong-nghe/page.tsx`, `components/demand/*` | `nhu-cau-cong-nghe.test.tsx` |
| **REQ-DEL-03-02** | `BR-DEL-03-01` | `AC-DEL-03-02` | `components/modals/QuickDemandModal.tsx`, `app/nhu-cau-cong-nghe/page.tsx` | `quick-demand-modal.test.tsx` |

---

## Delta v1.2 (CR-TASK-03-DELTA-02): Quản Lý Đơn Hàng & Tiến Trình Đơn Mua Cho Public User

> **Căn cứ pháp lý & Quyết định PO**: Quyết định PO `PO-DEC-20261030-03` & Yêu cầu thay đổi `CR-TASK-03-DELTA-02` ngày 30/10/2026.  
> **Mục tiêu**: Chuẩn hóa quy trình đặt mua sản phẩm thương mại cho Thành viên Đại chúng (`PUBLIC_USER` / `USER`), triệt tiêu hoàn toàn đơn hàng mồ côi (Zero Orphaned Orders) bằng Bearer Token, minh bạch hóa tiến trình xử lý đơn qua Stepper 4 bước và tổ chức giao diện quản trị 2 Tabs tại Public Workspace.

### 1. Yêu Cầu Kỹ Thuật Nghiệp Vụ (Requirements Specification)

- **`REQ-BUYER-ORD-001` [Đặt Mua Sản Phẩm Thương Mại & Gán Chủ Tài Khoản Xác Thực]**:
  1. Hệ thống MUST cho phép người dùng (sau khi đăng nhập với vai trò `PUBLIC_USER` hoặc `BUYER`) thực hiện đặt mua hoặc gửi yêu cầu báo giá thương mại từ các trang sản phẩm/thiết bị (`/san-pham`, `/chao-ban-cong-nghe/[id]`) hoặc modal mua nhanh (`QuickBuyModal` / `OrderPlacementModal`).
  2. Bắt buộc gắn kết chủ tài khoản: Mọi yêu cầu tạo đơn đặt mua MUST gửi kèm JWT Bearer Token trong header `Authorization: Bearer <token>`. Phía Backend trích xuất mã định danh người dùng `PersonId` (`current_user.id`) từ JWT claims và gán trực tiếp vào thuộc tính `created_by` / `buyer_id` của đơn hàng.
  3. Form đặt mua thu thập tối thiểu:
     - Thông tin mặt hàng: Mã sản phẩm (`offer_id`), tên sản phẩm, đơn giá niêm yết (nếu có), số lượng mong muốn.
     - Thông tin liên hệ người mua: Họ và tên, số điện thoại, email (tự động nạp sẵn từ hồ sơ người dùng đã đăng nhập).
     - Địa chỉ giao nhận / triển khai và ghi chú yêu cầu kỹ thuật/thương mại kèm theo.
  4. Hệ thống MUST sinh mã đơn hàng chuẩn hóa: `ORD-YYYYMMDD-XXXXX` (trong đó `XXXXX` là số thứ tự tăng dần trong ngày).
  5. Nghiêm cấm tạo đơn mồ côi: Nếu người dùng chưa đăng nhập bấm nút đặt mua, hệ thống MUST hiển thị Auth Modal yêu cầu đăng nhập/đăng ký, lưu tạm thông tin đặt mua trong bộ nhớ phiên và khôi phục nộp đơn sau khi đăng nhập thành công.

- **`REQ-BUYER-ORD-002` [Giao Diện Quản Trị 2 Tabs: Đơn Hàng Thương Mại vs Nhu Cầu R&D]**:
  1. Tại Bàn làm việc người mua (`/portal/saved` hoặc `/portal/orders`) thuộc menu **"Đơn hàng & Yêu cầu mua"**, hệ thống MUST cung cấp giao diện quản trị phân tách thành 2 Tabs rõ ràng:
     - **Tab 1 — "Đơn hàng thương mại" (`Commercial Orders`)**:
       * Hiển thị danh sách các đơn đặt mua sản phẩm/thiết bị thương mại do người dùng đã tạo.
       * Mỗi đơn hàng hiển thị: Mã đơn, Tên sản phẩm, Nhà cung cấp (Seller), Ngày đặt, Tổng giá trị ước tính, và Huy hiệu trạng thái (Badge).
       * Nhấp vào đơn hàng sẽ mở view chi tiết kèm Order Tracking Stepper 4 bước.
     - **Tab 2 — "Nhu cầu công nghệ / Bài toán R&D" (`R&D Demands`)**:
       * Hiển thị danh sách các bài toán kỹ thuật đã nộp qua `QuickDemandModal` hoặc Khảo sát sâu `/khao-sat-nhu-cau`.
       * Hiển thị chỉ số TNI, lĩnh vực, ngân sách dự kiến và trạng thái thẩm định Cấp Sở/Sàn (`PENDING` / `VERIFIED` / `RETURNED`).
  2. Mỗi Tab duy trì bộ lọc trạng thái, tìm kiếm từ khóa và phân trang độc lập, không làm xáo trộn dữ liệu của Tab còn lại.

- **`REQ-BUYER-ORD-003` [Thanh Tiến Trình Đơn Hàng (Order Tracking Stepper 4 Bước)]**:
  1. Giao diện chi tiết đơn hàng thương mại MUST tích hợp thành phần hiển thị tiến trình `OrderTrackingStepper` gồm đúng 4 bước tuyến tính:
     - **Bước 1 — `SUBMITTED` (Đã gửi đơn)**: Thời điểm người mua hoàn tất gửi đơn. Đơn ở trạng thái chờ tiếp nhận.
     - **Bước 2 — `PROCESSING` (Đang xử lý)**: Bên Bán (Seller) hoặc Quản trị viên đã tiếp nhận thông tin, đang kiểm tra tình trạng hàng/năng lực cung cấp kỹ thuật.
     - **Bước 3 — `NEGOTIATING` (Đang đàm phán)**: Hai bên đang thương thảo hợp đồng, thống nhất bảng giá, phụ lục kỹ thuật, điều khoản bảo hành và thanh toán.
     - **Bước 4 — `COMPLETED` (Hoàn tất)**: Hai bên ký kết hợp đồng thương mại hoặc hoàn tất bàn giao, chuyển giao giải pháp.
  2. Hiển thị trực quan trạng thái từng bước:
     - Bước đã hoàn thành: Icon check xanh lá cây kèm thời điểm hoàn thành (Timestamp).
     - Bước hiện tại đang kích hoạt: Icon nổi bật, vòng quay hoặc viền sáng kèm thông tin hướng dẫn hành động tiếp theo.
     - Bước chưa tới: Màu xám mờ.
  3. Xử lý trạng thái ngoại lệ:
     - Nếu đơn bị hủy (`CANCELLED`): Stepper chuyển sang màu xám/đỏ hiển thị nhãn "Đơn hàng đã hủy" kèm lý do hủy và người thực hiện hủy.
     - Nếu đơn bị từ chối (`REJECTED`): Stepper hiển thị nhãn "Bên bán từ chối tiếp nhận" kèm lý do phản hồi của Seller.

### 2. Quy Tắc Nghiệp Vụ (Business Rules)

- **`BR-ORD-AUTH-01` [Bắt Buộc Xác Thực Bearer Token & Chống Đơn Hàng Mồ Côi]**:
  1. API endpoint tạo đơn mua `POST /api/v1/demands/orders` bắt buộc phải có Header `Authorization: Bearer <jwt_access_token>`.
  2. Nếu request thiếu token hoặc token hết hạn/không hợp lệ, Backend MUST trả về HTTP `401 Unauthorized` kèm mã lỗi `AUTH_TOKEN_REQUIRED`.
  3. Backend giải mã JWT lấy `sub` hoặc claim `person_id` / `user_id` gán vào trường `created_by` và `buyer_id`. Tuyệt đối cấm để giá trị `NULL`.
  4. Bản ghi đơn hàng mặc định gán: `scope_type = 'GLOBAL'`, `is_commercial = true`.
  5. Tài khoản `PUBLIC_USER` chỉ được quyền xem và thao tác trên các đơn hàng có `created_by = current_user.id`.

- **`BR-ORD-TRACKING-01` [Quy Tắc Chuyển Đổi Trạng Thái Đơn Hàng (Order State Machine)]**:
  1. **Ma Trận Chuyển Đổi Hợp Lệ (State Transition Matrix)**:
     - `SUBMITTED` → `PROCESSING` (Thực hiện bởi: Seller sở hữu sản phẩm hoặc Operator Admin).
     - `SUBMITTED` → `CANCELLED` (Thực hiện bởi: Buyer chủ sở hữu đơn).
     - `PROCESSING` → `NEGOTIATING` (Thực hiện bởi: Seller hoặc Buyer khi bắt đầu thương thảo).
     - `PROCESSING` → `REJECTED` (Thực hiện bởi: Seller khi hết hàng hoặc không khả thi).
     - `NEGOTIATING` → `COMPLETED` (Thực hiện bởi: Seller hoặc Buyer khi hai bên thống nhất hợp đồng).
     - `NEGOTIATING` → `CANCELLED` (Thực hiện bởi: Seller hoặc Buyer khi đàm phán bất thành).
  2. **Quyền Hủy Đơn Của Buyer**:
     - Người mua (`Buyer`) có toàn quyền chủ động bấm "Hủy đơn" (`CANCELLED`) khi đơn đang ở trạng thái `SUBMITTED` mà không cần sự đồng thuận của Seller.
     - Khi đơn đã chuyển sang `PROCESSING` hoặc `NEGOTIATING`, hành động hủy yêu cầu nhập lý do và gửi thông báo xác nhận đến bên còn lại.
  3. **Lưu Vết Kiểm Toán Bắt Buộc (Audit Trail SSOT)**:
     - Mọi thao tác đổi trạng thái MUST ghi nhận một bản ghi vào bảng `order_status_logs` (hoặc `audit_events`) gồm: `order_id`, `from_status`, `to_status`, `changed_by_user_id`, `changed_at`, `reason_notes`.

### 3. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)

- **`AC-ORD-01` [Đặt Hàng Thương Mại Kèm Bearer Token & Gán Chủ Sở Hữu]**:
  - **Given** người dùng đã đăng nhập với tài khoản `PUBLIC_USER` (hoặc `BUYER`),
  - **When** vào trang chi tiết sản phẩm thương mại `/chao-ban-cong-nghe/[id]` và bấm "Đặt mua ngay",
  - **And** điền số lượng, địa chỉ giao nhận và bấm "Xác nhận đặt hàng",
  - **Then** Frontend gửi request `POST /api/v1/demands/orders` kèm header `Authorization: Bearer <token>`,
  - **And** Backend xác thực token thành công, trích xuất `PersonId`, lưu bản ghi với `created_by = PersonId`,
  - **And** hệ thống trả về mã đơn hàng `ORD-YYYYMMDD-XXXXX` và chuyển hướng người dùng đến trang chi tiết đơn hàng trong Bàn làm việc `/portal/saved?tab=commercial`.

- **`AC-ORD-02` [Chặn Khách Vãng Lai & Điều Hướng Đăng Nhập An Toàn]**:
  - **Given** người dùng chưa đăng nhập (khách vãng lai / Guest),
  - **When** bấm nút "Đặt mua ngay" tại trang sản phẩm,
  - **Then** hệ thống KHÔNG gửi request tạo đơn ẩn danh,
  - **And** hiển thị Auth Modal yêu cầu đăng nhập/đăng ký,
  - **When** người dùng hoàn tất đăng nhập thành công,
  - **Then** hệ thống tự động giữ nguyên mặt hàng đã chọn và mở lại form đặt hàng với thông tin cá nhân đã nạp sẵn.

- **`AC-ORD-03` [Giao Diện Bàn Làm Việc 2 Tabs Hoạt Động Độc Lập]**:
  - **Given** người dùng truy cập Bàn làm việc qua menu "Đơn hàng & Yêu cầu mua" (`/portal/saved`),
  - **When** chọn Tab "Đơn hàng thương mại",
  - **Then** hệ thống hiển thị danh sách các đơn đặt mua sản phẩm của người dùng kèm mã `ORD-*`, tên sản phẩm, trạng thái và nút xem tiến trình,
  - **When** người dùng chuyển sang Tab "Nhu cầu công nghệ / Bài toán R&D",
  - **Then** hệ thống nạp danh sách các bài toán kỹ thuật/khảo sát TNI kèm trạng thái thẩm định Cấp Sở (`PENDING` / `VERIFIED`), không hiển thị lẫn lộn đơn thương mại.

- **`AC-ORD-04` [Hiển Thị Trực Quan Order Tracking Stepper 4 Bước]**:
  - **Given** người mua mở chi tiết một đơn đặt mua hàng thương mại,
  - **Then** màn hình hiển thị thanh `OrderTrackingStepper` gồm đúng 4 bước: `SUBMITTED` -> `PROCESSING` -> `NEGOTIATING` -> `COMPLETED`,
  - **When** đơn hàng ở trạng thái `PROCESSING`,
  - **Then** bước 1 (`SUBMITTED`) có tích xanh hoàn thành kèm giờ gửi, bước 2 (`PROCESSING`) sáng màu active với chú thích "Đang kiểm tra hàng", bước 3 và 4 ở trạng thái chờ (inactive).

- **`AC-ORD-05` [Buyer Hủy Đơn Thành Công Tại Bước SUBMITTED]**:
  - **Given** một đơn hàng của Buyer đang ở trạng thái `SUBMITTED`,
  - **When** Buyer bấm nút "Hủy đơn hàng" và xác nhận tại hộp thoại cảnh báo,
  - **Then** API `PATCH /api/v1/demands/orders/{id}/status` gửi payload `{ status: 'CANCELLED', reason: '...' }`,
  - **And** Backend cập nhật `status = 'CANCELLED'`, ghi log kiểm toán,
  - **And** giao diện Stepper chuyển sang trạng thái "Đã hủy", vô hiệu hóa các nút tương tác tiếp theo.

### 4. Ma Trận Truy Vết Khép Kín (Traceability Matrix)

| Mã Yêu Cầu (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Bảng CSDL Tác Động (DB Schema) | Giao Diện Triển Khai (UI Screens) | API Endpoint Ánh Xạ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-BUYER-ORD-001** | `BR-ORD-AUTH-01` | `AC-ORD-01`, `AC-ORD-02` | `demand.demand_orders`, `demand.order_items` | `QuickBuyModal.tsx`, `ProductDetailPage.tsx` | `POST /api/v1/demands/orders` |
| **REQ-BUYER-ORD-002** | `BR-ORD-AUTH-01`, `BR-ORD-TRACKING-01` | `AC-ORD-03` | `demand.demand_orders`, `demand.demand_items` | `OrdersWorkspaceTabs.tsx`, `/portal/saved/page.tsx` | `GET /api/v1/demands/my-orders`, `GET /api/v1/demands/items` |
| **REQ-BUYER-ORD-003** | `BR-ORD-TRACKING-01` | `AC-ORD-04`, `AC-ORD-05` | `demand.demand_orders`, `demand.order_status_logs` | `OrderTrackingStepper.tsx`, `OrderDetailModal.tsx` | `GET /api/v1/demands/orders/{id}`, `PATCH /api/v1/demands/orders/{id}/status` |

