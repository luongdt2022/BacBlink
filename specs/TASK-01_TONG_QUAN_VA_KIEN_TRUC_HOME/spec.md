# Đặc Tả Yêu Cầu Kỹ Thuật (spec.md) — TASK-01: Tổng Quan Hệ Thống, Cổng Điều Hướng Home & Sự Kiện Techmart

> **Mã phân hệ**: `TASK-01`  
> **Trạng thái**: `🔵 Đang thi công (Spec Kit In-Progress)`  
> **Ánh xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/`](../../../Specification/02_BASIC_DESIGN/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/)  
> **Tài liệu nguồn gốc (SSOT)**: 
> 1. Sheet `HOME1` & `Giới thiệu` (60 dòng dữ liệu gốc) trong `Nacentwin_20260924_bo_loc_da_sua.xlsx`.
> 2. Quyết định PO `PO-DEC-20261008-02` (Sitemap Menu 7 mục) & `PO-DEC-20261008-06` (Khóa ranh giới Sự kiện Techmart Showcase).
> 3. Quyết định PO `PO-DEC-20261011-01` (Gate 1 Sign-Off Toàn Diện & Scope Ceiling Freeze).
> 4. Tài liệu giải trình pháp lý: [`GIAI_TRINH_RANH_GIOI_DAU_GIA_VA_DAT_COC.md`](../../../Specification/02_BASIC_DESIGN/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/GIAI_TRINH_RANH_GIOI_DAU_GIA_VA_DAT_COC.md).
> 5. Wireframe chuẩn hóa: [`wireframe_home.html`](../../../Specification/02_BASIC_DESIGN/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/wireframe_home.html) và [`wireframe_techmart_events.html`](../../../Specification/02_BASIC_DESIGN/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/wireframe_techmart_events.html).

---

## 1. USER STORIES & ƯU TIÊN TRIỂN KHAI

### P1 (Must-Have) — Hệ Thống Điều Hướng Mega-Menu 7 Mục & Định Danh Toàn Trang
- **Là** một Người dùng bất kỳ (Khách vãng lai, Doanh nghiệp, Chuyên gia, Cán bộ quản lý), **Tôi muốn** có thanh điều hướng đồng nhất 7 mục với Mega-menu rõ ràng trên toàn hệ thống **Để** nhanh chóng tiếp cận đúng phân hệ nghiệp vụ tôi cần mà không bị lạc hướng.
  - *Why this priority:* Là khung xương sống (Backbone) điều hướng cho toàn bộ nền tảng Nacentwin, kết nối các phân hệ đã hoàn thành.
  - *Independent Test:* Click vào từng mục trong Menu 7 mục -> Điều hướng chính xác tới các route tương ứng (`/chao-ban-cong-nghe`, `/nhu-cau-cong-nghe`, `/enterprises`, `/experts`, `/dich-vu-khac`, `/portal`).
  - *Acceptance Scenario:* Given người dùng chưa đăng nhập, When xem Header, Then hiển thị nút "Đăng nhập" / "Đăng ký"; Given người dùng đã đăng nhập, When click Avatar, Then hiển thị menu tài khoản gồm "Cài đặt tài khoản" và "Đăng xuất" (kèm popup xác nhận trước khi kết thúc phiên).

### P2 (Must-Have) — Cổng Thống Kê Chỉ Số Động (Dynamic Portal Stats) & Zero-Mock
- **Là** một Khách truy cập hoặc Nhà đầu tư, **Tôi muốn** xem các chỉ số thống kê thực tế về quy mô sàn giao dịch (Số công nghệ chào bán, số nhu cầu đặt hàng, số doanh nghiệp ĐMST, số tỉnh thành kết nối) **Để** đánh giá mức độ uy tín và sự sôi động của hệ sinh thái.
  - *Why this priority:* Loại bỏ hoàn toàn số liệu giả lập (mock cứng), phản ánh trung thực dữ liệu thật từ PostgreSQL.
  - *Independent Test:* Gọi API `GET /api/v1/portal/stats` -> Trả về số liệu đếm trực tiếp từ các bảng `technology_offers`, `demand_surveys`, `enterprises`, `expert_profiles`.
  - *Acceptance Scenario:* Given cơ sở dữ liệu đã nạp 304 DN thật, When tải trang chủ, Then bộ đếm phản ánh chính xác số lượng thực tế, tải dưới 200ms nhờ cache.

### P3 (Must-Have) — Sàn Trưng Bày Sự Kiện & Phiên Chào Giá Techmart (Showcase Listing)
- **Là** một Doanh nghiệp có nhu cầu mua hoặc chuyển giao công nghệ, **Tôi muốn** tra cứu lịch các phiên chào giá Techmart sắp diễn ra, tải hồ sơ thể lệ/TRL dạng PDF và đăng ký tham gia nhận tư vấn trực tiếp **Để** tham gia giao dịch kết nối cung cầu tại triển lãm.
  - *Why this priority:* Hiện thực hóa sự kiện Techmart theo `wireframe_techmart_events.html` và đáp ứng quyết định `PO-DEC-20261008-06`.
  - *Independent Test:* Vào trang `/trien-lam` -> Thấy danh sách sự kiện kèm thời gian, địa điểm, công nghệ tham gia -> Click "Đăng ký tham gia" -> Gửi đơn thành công.
  - *Acceptance Scenario:* Given phiên chào giá mở tiếp nhận, When người dùng điền form đăng ký với thông tin đơn vị và nhu cầu, Then hệ thống lưu đơn vào `portal_event_registrations` và cấp mã đăng ký xác nhận.

### P4 (Should-Have) — Trợ Lý Ảo AI Nacentwin (Floating Assistant Widget)
- **Là** một Khách truy cập mới, **Tôi muốn** tương tác với Trợ lý ảo AI Nacentwin qua widget nổi góc màn hình **Để** được giải đáp nhanh về mức độ TRL 1-9, gợi ý định giá mua/bán tham khảo và kết nối chuyên gia tư vấn phù hợp.
  - *Why this priority:* Tăng cường trải nghiệm thông minh cho người dùng, định hướng chuyển đổi từ khách vãng lai thành người dùng có tài khoản.
  - *Independent Test:* Click Floating Action Button (FAB) -> Mở modal AI Assistant -> Bấm câu hỏi mẫu về TRL -> Nhận câu trả lời định hướng kèm link điều hướng.

---

## 2. FUNCTIONAL REQUIREMENTS (YÊU CẦU CHỨC NĂNG)

- **`REQ-HOME-001` [Global Navigation & Mega-Menu 7 Mục]**: 
  - Khớp 1:1 với `wireframe_home.html`:
    1. Giới thiệu (`/gioi-thieu`)
    2. Chào bán SP / Công nghệ (`/chao-ban-cong-nghe` -> Shop thiết bị & Chuyển giao TRL 1-9)
    3. Nhu cầu công nghệ (`/nhu-cau-cong-nghe`)
    4. Doanh nghiệp ĐMST (`/doanh-nghiep-dmst` -> `/enterprises`)
    5. Chuyên gia KH&CN (`/chuyen-gia` -> `/experts`)
    6. Dịch vụ khác (`/dich-vu-khac` -> Đánh giá TT17 & Tư vấn SHTT)
    7. Không gian làm việc (`/portal`, `/gov`, `/admin` theo RBAC)
  - Hỗ trợ menu Avatar tài khoản cá nhân khi đăng nhập (`/settings` và nút Đăng xuất).

- **`REQ-HOME-002` [Dynamic Metrics & Portal Stats API]**:
  - Backend cung cấp endpoint `GET /api/v1/portal/stats` tổng hợp:
    - `totalOffers`: Tổng số công nghệ chào bán đã duyệt (`technology_offers`).
    - `totalDemands`: Tổng số nhu cầu bài toán công nghệ (`demand_surveys`).
    - `totalEnterprises`: Tổng số doanh nghiệp ĐMST trong kho CSDL (`enterprises`).
    - `totalExperts`: Tổng số chuyên gia KH&CN đã được cấp thẩm định (`expert_profiles`).
    - `totalProvinces`: Số lượng tỉnh/thành có kết nối dữ liệu (mặc định 63).
  - Tích hợp in-memory cache 5 phút để bảo đảm SLA phản hồi dưới 200ms.

- **`REQ-HOME-003` [Trang Chủ Hero Banner, 4-Tab Quick Search & Sector Chips]**:
  - Thanh tìm kiếm 4 Tab: Chào bán (`seller`), Nhu cầu (`buyer`), Chuyên gia (`expert`), Phiên chào giá (`auction`).
  - Nạp động 10 Lĩnh vực chuẩn `LV` (`LV01`–`LV17`) từ API `GET /api/v1/sectors` kết nối `policy.taxonomy_terms`.
  - Lưới hiển thị 3 công nghệ chào bán mới nhất và 3 nhu cầu nổi bật tải qua component chuẩn `<Async>` (5 UX States).

- **`REQ-HOME-004` [Showcase Sự Kiện & Phiên Chào Giá Techmart]**:
  - Giao diện `/trien-lam` theo `wireframe_techmart_events.html`:
    - Tab 1: Phiên chào giá đang & sắp mở (Countdown thời gian, địa điểm Cung Văn Hóa Hữu Nghị Việt Xô, SECC, số lượng công nghệ tham gia, tài liệu thể lệ TRL .PDF).
    - Tab 2: Sự kiện đã khép lại (Lưu trữ kỷ yếu & giao dịch).
  - Backend cung cấp `GET /api/v1/events/techmart` hỗ trợ lọc theo trạng thái (`UPCOMING`, `CLOSED`).

- **`REQ-HOME-005` [Đăng Ký Tham Gia Phiên Chào Giá Techmart]**:
  - Giao diện Modal hoặc Route `/trien-lam/dang-ky-tham-quan`:
    - Điền tên đơn vị, MST/CCCD, SĐT, Email, vai trò (Tham quan / Mua / Chào bán).
  - Backend cung cấp `POST /api/v1/events/register` lưu vào bảng `portal_event_registrations`.

- **`REQ-HOME-006` [Trợ Lý Ảo AI Nacentwin (Floating Widget)]**:
  - Component `<AIAssistantWidget />` cố định góc dưới bên phải màn hình.
  - Hỗ trợ 3 câu hỏi gợi ý nhanh:
    1. Định mức TRL 1-9 theo TT17.
    2. Đề xuất định giá chuyển nhượng sáng chế.
    3. Tìm chuyên gia theo từ khóa và địa bàn.
  - Endpoint `POST /api/v1/ai/quick-assist` hỗ trợ bóc tách ý định người dùng và trả về nội dung hướng dẫn kèm đường dẫn điều hướng.

---

## 3. BUSINESS RULES & PHẠM VI BẮT BUỘC (BUSINESS RULES)

- **`BR-HOME-01` [Ranh Giới Showcase Techmart — Cấm Bidding/Ký Quỹ Tiền Cọc]**:
  - Khối sự kiện và phiên chào giá tại `TASK-01` chỉ đóng vai trò **Niêm yết thông tin (Showcase Listing)** và **Tiếp nhận đăng ký tham quan/tư vấn**.
  - **NGHIÊM CẤM** triển khai phòng đấu giá trực tuyến thời gian thực (Realtime Bidding Room), bot tự động trả giá (Auto-bidding), ví điện tử ký quỹ tiền cọc (Escrow Wallet) và ký số hợp đồng đặt cọc trực tuyến. Toàn bộ tính năng này thuộc Giai đoạn 2 (Post-MVP) theo `PO-DEC-20261008-06`.

- **`BR-HOME-02` [Kỷ Luật Zero-Mock Trên Trang Chủ]**:
  - Mọi chỉ số đếm và danh sách công nghệ/nhu cầu trên trang chủ bắt buộc phải lấy từ API Backend thật kết nối CSDL PostgreSQL.
  - Nghiêm cấm dùng mảng tĩnh giả lập (`fakeOffers`, `fakeDemands`, `1.200+` hardcoded) mà không có fallback trung thực khi CSDL rỗng.

- **`BR-HOME-03` [Đăng Xuất An Toàn & Hủy Phiên Làm Việc]**:
  - Thao tác Đăng xuất từ Menu Avatar hoặc Trang Cài đặt tài khoản bắt buộc phải có Modal xác nhận trước khi hủy token JWT và xóa session người dùng.

---

## 4. SUCCESS CRITERIA (TIÊU CHÍ ĐO LƯỜNG)

- **`SC-001`**: 100% các nút và liên kết trong Mega-Menu 7 mục điều hướng chính xác tới các route tương ứng, không có link chết (404).
- **`SC-002`**: API `GET /api/v1/portal/stats` phản hồi trong thời gian $< 200\text{ms}$ ở p95 nhờ bộ nhớ đệm cache.
- **`SC-003`**: Luồng đăng ký tham gia sự kiện Techmart lưu trữ thành công vào CSDL PostgreSQL và thông báo mã xác nhận cho người dùng.
- **`SC-004`**: Đạt 100% Pass bộ kiểm thử tự động Playwright E2E cho cả 2 màn hình trên Desktop (1440×900) và Mobile (390×844).
