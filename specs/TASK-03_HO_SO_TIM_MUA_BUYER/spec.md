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
