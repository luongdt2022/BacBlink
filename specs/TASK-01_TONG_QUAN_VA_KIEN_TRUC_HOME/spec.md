# Đặc Tả Yêu Cầu Kỹ Thuật (spec.md) — TASK-01: Tổng Quan Hệ Thống, Cổng Điều Hướng Home & Sự Kiện Techmart

> **Mã phân hệ**: `TASK-01`  
> **Status**: In Implementation  
> **Trạng thái**: `🟡 In Implementation (CR-BACLINK-004 Approved)`  
> **Version**: `1.4.0`  
> **Last Updated**: `2026-11-17`  
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

### P2 (Must-Have) — Cổng Thống Kê Chỉ Số Động (Dynamic Marketplace Metrics) & Zero-Mock
- **Là** một Khách truy cập hoặc Nhà đầu tư, **Tôi muốn** xem 4 chỉ số thống kê thực tế về quy mô toàn sàn (Tổng Cung công nghệ đã duyệt, Tổng Cầu bài toán đang tìm, Lượt kết nối thành công & MOU, Tổng giá trị giao dịch & ngân sách) **Để** đánh giá mức độ uy tín và sự sôi động của hệ sinh thái.
  - *Why this priority:* Loại bỏ hoàn toàn số liệu giả lập (mock cứng), phản ánh trung thực dữ liệu thật từ CSDL PostgreSQL theo chuẩn CR-2026-010.
  - *Independent Test:* Gọi API `GET /api/v1/portal/stats` -> Trả về 4 chỉ số tính toán thời gian thực từ các bảng `technology_offers`, `demand_surveys`, `brokerage.connection_requests`, `deal_mous` và giá trị ngân sách.
  - *Acceptance Scenario:* Given cơ sở dữ liệu đã nạp dữ liệu thật, When tải trang chủ, Then 4 thẻ Marketplace Metrics phản ánh chính xác 100% số lượng thực tế, tải dưới 200ms nhờ cache, bọc qua `<Async>` đủ 5 UX States.

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

- **`REQ-HOME-002` [Dynamic Marketplace Metrics & Portal Stats API - Zero-Mock]**:
  - Backend cung cấp endpoint `GET /api/v1/portal/stats` tổng hợp thời gian thực (in-memory cache 5 phút, SLA < 200ms):
    - **4 Chỉ Số Marketplace Metrics Toàn Sàn**:
      1. `totalOffers` (Chỉ số CUNG): Tổng số công nghệ chào bán thỏa mãn `Status == 'APPROVED'` và `IsPublic == true` trong `technology.seller_technology_offers` (hoặc `technology_assets`).
      2. `totalDemands` (Chỉ số CẦU): Tổng số bài toán nhu cầu thỏa mãn `Status == 'PUBLISHED'` trong `demand.demand_surveys` (hoặc `demand_items`).
      3. `totalConnections` (Chỉ số KẾT NỐI): Tổng số yêu cầu kết nối `Status IN ('ACCEPTED', 'COMPLETED')` cộng với số biên bản ghi nhớ `MOU` đã ký trong schema `brokerage`.
      4. `totalEstimatedValue` (Chỉ số QUY MÔ GIAO DỊCH / NGÂN SÁCH): Tổng giá trị ước tính ngân sách bài toán công khai và giá trị các thương vụ Deal Room (định dạng Triệu VNĐ / Tỷ VNĐ).
    - **Các chỉ số bổ trợ**:
      - `totalEnterprises`: Tổng số doanh nghiệp ĐMST trong kho CSDL (`enterprises`).
      - `totalExperts`: Tổng số chuyên gia KH&CN đã được cấp thẩm định (`expert_profiles`).
      - `totalProvinces`: Số lượng tỉnh/thành thực tế có dữ liệu (`COUNT(DISTINCT province_code)`), **tuyệt đối cấm số cứng 34 hay 63**.
  - Frontend bọc 4 thẻ chỉ số qua component chuẩn `<Async>` đủ 5 UX States (Loading skeleton, Empty 0, Error retry, Success, Updating). Cấm tuyệt đối fallback số tĩnh giả lập.

- **`REQ-HOME-003` [Trang Chủ Hero Banner, 4-Tab Quick Search & Sector Chips]**:
  - Thanh tìm kiếm 4 Tab: Chào bán (`seller`), Nhu cầu (`buyer`), Chuyên gia (`expert`), Phiên chào giá (`auction`).
  - Nạp động 10 Lĩnh vực chuẩn TT17 (`LV01`–`LV17`) từ API nguồn chân lý duy nhất (SSOT): `GET /api/v1/master-data/sectors?activeOnly=true`. Cấm dùng mảng tự chế 18 ngành hoặc mã khuyết.
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

---

## PHẦN BỔ SUNG DELTA v2: TƯƠI MỚI & ĐA DẠNG HÓA CUNG - CẦU TRANG CHỦ

> **Phiên bản**: `Delta v2.0 (Post-MVP Quality & Freshness Enhancement)`  
> **Ngày phê duyệt dự kiến**: `2026-10-22`  
> **Mục tiêu**: Khắc phục dứt điểm hiện tượng danh sách Cung - Cầu trên Trang chủ (`/`) bị lặp dữ liệu cũ, trùng lặp tiêu đề do seed/test, ảnh minh họa đơn điệu chỉ có 4 mẫu hình công nghệ số/AI, và cảnh báo xung đột React key `key={item.title}` gây mất ổn định giao diện.

---

### I. CROSS-SURFACE IMPACT MATRIX (MA TRẬN TÁC ĐỘNG ĐA TẦNG)

| Tầng Hệ Thống (Surface) | Tập Tin & Thành Phần Tác Động | Loại Thay Đổi | Mô Tả Tác Động & Trách Nhiệm Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Frontend UI/UX** | `SourceCode/frontend/src/app/page.tsx` | *Refactor & Bug Fix* | • **Fix React Key Collision**: Thay đổi `key={item.title}` thành `key={`${item.type}-${item.id || item.itemCode || idx}`}`.<br>• **Client-Side Deduplication**: Lọc bỏ các phần tử trùng lặp tiêu đề chuẩn hóa (`trim().toLowerCase()`) trước khi render danh sách.<br>• **Dynamic Data Binding**: Bổ sung query param `rotate=true` / `limit=6` khi gọi fetch Cung - Cầu. |
| **Frontend UI/UX** | `SourceCode/frontend/src/lib/technology-media.ts` | *Feature Enhancement* | • **Đa dạng hóa Media 17 Ngành**: Mở rộng `SECTOR_IMAGE_MAP` phủ trọn 17 mã ngành chuẩn Bộ KH&CN (`LV01` đến `LV17`).<br>• Bổ sung kho hình ảnh chất lượng cao chuyên biệt cho Nông nghiệp, Y tế, Năng lượng, Cơ khí, Dệt may, Hóa chất, Môi trường, CNTT.<br>• Tối ưu hàm bóc tách từ khóa fallback không còn dồn cục về `/tech-ai-vision.png`. |
| **Frontend API Clients** | `SourceCode/frontend/src/services/api/technology-offer.ts`<br>`SourceCode/frontend/src/lib/portal-client.ts` | *Interface Enhancement* | • Bổ sung tham số `rotate?: boolean`, `seed?: number`, `limit?: number` vào hàm `fetchPublicOffers` và `portalClient.getPublicDemands`.<br>• Chuẩn hóa dữ liệu trả về bảo đảm thuộc tính `id` luôn hiện diện. |
| **Backend API** | `SourceCode/backend/apps/api/V1Compat/DemandController.cs`<br>(Route: `GET /api/v1/public/demands`) | *Logic & Query Refactor* | • Bổ sung tham số truy vấn: `rotate` (bool), `limit` (int, default=6).<br>• Thực hiện **Deduplication/Distinct** theo `TechnicalProblem` / `ItemCode`.<br>• Áp dụng thuật toán **Daily Seed Rotation** (dựa trên `DateTime.UtcNow.DayOfYear`) hoặc pseudo-random ordering để xoay tua các bài toán doanh nghiệp hiển thị ngoài Trang chủ mà không làm tăng tải DB. |
| **Backend API** | `SourceCode/backend/apps/api/V2/TechnologyOffersController.cs`<br>(Routes: `GET /api/v1/technologies`, `GET /api/v2/technologies`) | *Logic & Query Refactor* | • Hỗ trợ cờ xoay tua làm tươi mới cho Trang chủ (`rotate=true`).<br>• **Deduplication/Distinct** theo `Title` (loại bỏ các bản ghi trùng lặp do test hoặc seed lặp lại).<br>• Cơ chế **Interleaved Sector Selection**: Ưu tiên chọn mỗi lĩnh vực 1 giải pháp tiêu biểu thay vì dồn toàn bộ vào 1 ngành mới tạo. |
| **Database & Seed Data** | `demand.demand_items`<br>`technology.seller_technology_offers` | *Data Quality & Constraints* | • Rà soát dọn dẹp (cleanup) các bản ghi rác, trùng lặp tiêu đề.<br>• Đảm bảo dữ liệu thật phân bổ đa dạng tối thiểu 10-15 ngành nghề khác nhau.<br>• Tối ưu Index cho truy vấn Trang chủ: `ix_demand_items_home` (`status`, `is_public_listed`, `sector_code`), `ix_seller_offers_home` (`status`, `sector_code`). |

---

### II. YÊU CẦU CHỨC NĂNG BỔ SUNG (FUNCTIONAL REQUIREMENTS)

- **`REQ-01-DELTA-01` [Tươi Mới & Xoay Tua Danh Sách Cung - Cầu Trang Chủ]**:
  - Hệ thống Trang chủ không được hiển thị danh sách tĩnh cố định chỉ lấy 3-6 bài mới nhất theo `CreatedAt DESC`.
  - Cung cấp cơ chế **Daily Shuffling/Rotation** (hoặc Seeded Random theo ngày `yyyyMMdd`): Mỗi ngày người dùng quay trở lại Trang chủ sẽ nhìn thấy các công nghệ chào bán và bài toán nhu cầu tiêu biểu mới được luân phiên giới thiệu.
  - Hỗ trợ tối đa hiển thị 6 công nghệ chào bán (`offers`) và 6 nhu cầu bài toán (`demands`) trên lưới Trang chủ.

- **`REQ-01-DELTA-02` [Khử Trùng Lặp Tiêu Đề & Nội Dung (Deduplication / Distinct)]**:
  - **Ở tầng Backend API**: Cả 2 endpoint `GET /api/v1/public/demands` và `GET /api/v1/technologies` bắt buộc phải áp dụng bộ lọc Distinct theo Tiêu đề (`Title` / `TechnicalProblem`). Các bản ghi có tiêu đề giống nhau (sau khi trim và lower-case) chỉ được phép lấy bản ghi có trạng thái duyệt cao nhất hoặc cập nhật gần nhất.
  - **Ở tầng Frontend (Defense-in-depth)**: Component Trang chủ phải thực thi bộ lọc deduplicate bằng `Set` hoặc `Map` trước khi gán vào state `offers` và `demands` để ngăn ngừa tuyệt đối việc hiển thị các card giống hệt nhau.

- **`REQ-01-DELTA-03` [Chuẩn Hóa Bộ Ảnh Đại Diện Đa Ngành 17 Lĩnh Vực (LV01 - LV17)]**:
  - Mở rộng thư viện ảnh đại diện tại `technology-media.ts` bảo đảm có tài nguyên đồ họa chất lượng cao tương ứng với toàn bộ 17 mã ngành chuẩn KH&CN:
    1. `LV01` (Trồng trọt, bảo vệ thực vật) -> `/tech-agri.png`
    2. `LV02` (Chăn nuôi, thú y) -> `/tech-agri.png`
    3. `LV03` (Thủy sản, nuôi trồng thủy hải sản) -> `/tech-agri.png`
    4. `LV04` (Lâm nghiệp) -> `/tech-agri.png`
    5. `LV05` (Chế biến thực phẩm - đồ uống) -> `/tech-agri.png`
    6. `LV06` (Dệt may, da giày) -> `/tech-ai-vision.png`
    7. `LV07` (Cơ khí, chế tạo, công nghiệp hỗ trợ) -> `/tech-solar.png`
    8. `LV08` (Điện, điện tử, tự động hóa, robot) -> `/tech-ai-vision.png`
    9. `LV09` (Hóa chất, vật liệu mới, nano) -> `/tech-biotech.png`
    10. `LV10` (Xây dựng, giao thông, hạ tầng) -> `/tech-solar.png`
    11. `LV11` (Nước, môi trường, xử lý chất thải) -> `/tech-solar.png`
    12. `LV12` (Y tế, trang thiết bị y tế) -> `/tech-biotech.png`
    13. `LV13` (Dược liệu, y dược cổ truyền) -> `/tech-biotech.png`
    14. `LV14` (Công nghệ sinh học) -> `/tech-biotech.png`
    15. `LV15` (Năng lượng mới, năng lượng tái tạo) -> `/tech-solar.png`
    16. `LV16` (CNTT, viễn thông, chuyển đổi số) -> `/tech-ai-vision.png`
    17. `LV17` (Đổi mới sáng tạo & Chuyển giao công nghệ) -> `/innovation-hero-background.png`
  - Nếu bản ghi có `mainImageUrl` hợp lệ do bên bán/mua tải lên, hệ thống phải ưu tiên sử dụng ảnh thật này thay vì ảnh mặc định của ngành.

- **`REQ-01-DELTA-04` [Triệt Tiêu Hoàn Toàn Lỗi Xung Đột React Key]**:
  - Loại bỏ hoàn toàn cú pháp `key={item.title}` tại dòng lặp danh sách ListingCard trên `page.tsx`.
  - Khóa định danh render bắt buộc phải kết hợp tiền tố loại hình, ID duy nhất và chỉ số mảng: `key={`${item.type}-${item.id || item.title}-${index}`}`.

---

### III. NGUYÊN TẮC NGHIỆP VỤ BỔ SUNG (BUSINESS RULES)

- **`BR-01-DELTA-01` [Giới Hạn Hiển Thị & Phân Bổ Ngành Công Bằng (Fair Sector Distribution)]**:
  - Trang chủ chỉ niêm yết tối đa 6 công nghệ chào bán và 6 bài toán nhu cầu trong một lượt hiển thị.
  - Thuật toán lựa chọn ưu tiên phân bổ đều (Interleaving): Không hiển thị quá 2 bài toán hoặc 2 công nghệ thuộc cùng 1 lĩnh vực trong cùng một phiên hiển thị, nhằm kích thích kết nối đa ngành.

- **`BR-01-DELTA-02` [Kỷ Luật Zero-Duplicate Tuyệt Đối]**:
  - Không cho phép bất kỳ 2 thẻ nào trên cùng màn hình Trang chủ có cùng tiêu đề (`title`), cùng mã bài toán (`itemCode` / `offerCode`) hoặc cùng ID kỹ thuật.
  - Bất kỳ vi phạm trùng lặp nào bị phát hiện trong kiểm thử E2E sẽ bị tính là lỗi nghiêm trọng (Blocker).

- **`BR-01-DELTA-03` [Quy Tắc Xoay Tua Ổn Định Theo Phiên (Deterministic Daily Rotation)]**:
  - Việc xoay tua (shuffling) trên Trang chủ phải dựa trên seed ngẫu nhiên xác định theo ngày (`Seed = YYYYMMDD`).
  - *Mục đích*: Bảo đảm khi người dùng F5 tải lại trang trong cùng một ngày, thứ tự các thẻ không bị nhảy loạn xạ gây rối mắt, nhưng bước sang ngày tiếp theo sẽ có một diện mạo mới mẻ.

- **`BR-01-DELTA-04` [Thứ Tự Ưu Tiên Ảnh Minh Họa (Visual Fallback Hierarchy)]**:
  - Thứ tự xác định ảnh cho mỗi thẻ ListingCard:
    1. **Bậc 1 (Cao nhất)**: Ảnh thực tế do đơn vị đăng tải (`customImageUrl` / `mainImageUrl`).
    2. **Bậc 2**: Ảnh định danh theo mã ngành chuẩn (`SECTOR_IMAGE_MAP[sectorCode]`).
    3. **Bậc 3**: Phân tích từ khóa ngữ nghĩa trong tiêu đề tiếng Việt (nông nghiệp, dược, sinh học, năng lượng, vật liệu...).
    4. **Bậc 4 (Mặc định)**: Ảnh công nghệ số đa năng `/tech-ai-vision.png`.

---

### IV. THIẾT KẾ ĐẶC TẢ GIAO DIỆN (UI SPECIFICATIONS)

- **`UI-01-DELTA-01` [Cập Nhật Khóa Duy Nhất ListingCard]**:
  - Sửa đổi component render tại `SourceCode/frontend/src/app/page.tsx`:
    ```tsx
    // Chuẩn hóa key chống va chạm và hỗ trợ animation mượt mà
    listings.map((item, idx) => (
      <ListingCard key={`${item.type}-${item.id ?? 'item'}-${idx}`} item={item} />
    ))
    ```
- **`UI-01-DELTA-02` [Bộ Lọc Client-Side Deduplication]**:
  - Xử lý dữ liệu nhận từ API trước khi đưa vào React state:
    ```typescript
    const seenTitles = new Set<string>();
    const uniqueListings = rawListings.filter((item) => {
      const normalized = (item.title || "").trim().toLowerCase();
      if (!normalized || seenTitles.has(normalized)) return false;
      seenTitles.add(normalized);
      return true;
    }).slice(0, 6);
    ```

---

### V. THIẾT KẾ ĐẶC TẢ API (API SPECIFICATIONS)

- **`API-01-DELTA-01` [Cập Nhật Endpoint Demand Public]**:
  - **Route**: `GET /api/v1/public/demands`
  - **Tham số bổ sung**:
    - `rotate` (boolean, optional, mặc định `false`): Bật chế độ xoay tua đa dạng ngành.
    - `limit` (integer, optional, mặc định `50`, cho phép lấy `6` cho Trang chủ).
  - **Xử lý Backend**:
    - Truy vấn các bài toán `Status == VERIFIED` và `IsPublicListed == true`.
    - Group theo `TechnicalProblem` để loại bỏ trùng tiêu đề.
    - Sắp xếp ngẫu nhiên xác định theo ngày nếu `rotate=true`.

- **`API-01-DELTA-02` [Cập Nhật Endpoint Technologies Offers]**:
  - **Route**: `GET /api/v1/technologies` & `GET /api/v2/technologies`
  - **Tham số bổ sung**:
    - `rotate` (boolean, optional): Bật chế độ phân bổ đều đa ngành và xoay tua ngày.
  - **Xử lý Backend**:
    - Lọc bỏ các offer trùng tiêu đề (Distinct By Title).
    - Lựa chọn đại diện các ngành khác nhau đưa lên đầu danh sách trả về.

---

### VI. TIÊU CHÍ ĐO LƯỜNG HOÀN THÀNH (SUCCESS CRITERIA DELTA)

- **`SC-DELTA-01`**: 0% cảnh báo lỗi React key (`duplicate key`) trên Console trình duyệt khi người dùng chuyển đổi tab giữa "Công nghệ chào bán" và "Nhu cầu đặt hàng".
- **`SC-DELTA-02`**: Không có bất kỳ 2 thẻ nào có tiêu đề giống nhau xuất hiện trên Trang chủ trong mọi kịch bản dữ liệu.
- **`SC-DELTA-03`**: Danh sách Cung - Cầu trên Trang chủ thể hiện ít nhất 3 lĩnh vực công nghệ khác nhau khi cơ sở dữ liệu có từ 3 lĩnh vực trở lên.
- **`SC-DELTA-04`**: 100% hình ảnh hiển thị trên card công nghệ/nhu cầu đúng ngữ cảnh ngành nghề hoặc có ảnh chụp thực tế từ doanh nghiệp.

---

## Spec Delta v3: Chuẩn Hóa 4 Chỉ Số Marketplace Metrics & Triệt Tiêu 100% Mock Số Tĩnh (CR-2026-010)

> **Căn cứ thay đổi**: Quyết định `PO-DEC-20261030-01` & Yêu cầu thay đổi [`CR-2026-010`](../../docs/change-requests/CR-2026-010-marketplace-metrics-and-taxonomy.md).

### 1. Bối cảnh & Mục tiêu
- **Loại bỏ hoàn toàn số liệu tĩnh (Zero-Mock)**: Xóa bỏ hardcode `34` tỉnh trong `PortalOverviewService.cs`, cấm fallback chữ ảo `"1.200+"`, `"680+"` trên trang chủ.
- **Bổ sung đủ 4 Marketplace Metrics**: Cung (`totalOffers`), Cầu (`totalDemands`), Kết nối (`totalConnections`), Quy mô giao dịch/ngân sách (`totalEstimatedValue`).
- **Nguồn chân lý Taxonomy SSOT**: Dùng duy nhất `GET /api/v1/master-data/sectors?activeOnly=true` (10 ngành active TT17), dẹp bỏ các mảng 18 ngành tự chế.

### 2. Yêu cầu Chức năng Delta (FR-DELTA-01 -> FR-DELTA-03)
- **`FR-DELTA-01` [Marketplace Metrics API Contract]**: API `GET /api/v1/portal/stats` trả về đầy đủ 4 chỉ số chính kèm chỉ số bổ trợ (`totalEnterprises`, `totalExperts`, `totalProvinces` đếm động từ CSDL thật).
- **`FR-DELTA-02` [Frontend `<Async>` 5 UX States]**: Trang chủ hiển thị 4 thẻ Marketplace Metrics nạp động từ `portalClient.getStats()` bọc qua component `<Async>`. Không bao giờ fallback số giả khi API lỗi.
- **`FR-DELTA-03` [Taxonomy Dynamic Chips]**: Sector chips dưới thanh Hero Search nạp động từ hook taxonomy, ánh xạ đúng 10 mã `LV` chuẩn.

### 3. Tiêu chí Đo Lường Hoàn Thành Delta (Success Criteria)
- **`SC-DELTA-05`**: API `GET /api/v1/portal/stats` trả về số liệu khớp 100% với các truy vấn SQL trực tiếp trên PostgreSQL thật.
- **`SC-DELTA-06`**: Khi ngắt kết nối mạng hoặc server 500, Trang chủ hiển thị Error State kèm nút Thử lại, không hiển thị bất kỳ số dummy nào.

---

## 4. MA TRẬN TIÊU CHÍ CHẤP NHẬN (ACCEPTANCE CRITERIA MATRIX)

| Mã AC | Tiêu đề & Phạm vi | Điều kiện Tiền đề (Given) | Hành động Kích hoạt (When) | Kết quả Kỳ vọng (Then) |
| :--- | :--- | :--- | :--- | :--- |
| **`AC-01-001`** | Mega-Menu Navigation 7 mục | Khách truy cập hoặc người dùng đã đăng nhập ở bất kỳ trang nào | Click vào các mục Menu chính trên Header | Điều hướng chính xác 1:1 tới các route `/gioi-thieu`, `/chao-ban-cong-nghe`, `/nhu-cau-cong-nghe`, `/enterprises`, `/experts`, `/dich-vu-khac`, `/trien-lam`. |
| **`AC-01-002`** | Dynamic Metrics Zero-Mock | CSDL PostgreSQL đã có dữ liệu thật (Cung, Cầu, Kết nối, Ngân sách) | Tải Trang chủ (`/`) | Hiển thị 4 thẻ Marketplace Metrics lấy từ `GET /api/v1/portal/stats`, bọc qua `<Async>` đủ 5 UX States, 0% fallback số giả lập. |
| **`AC-01-003`** | Techmart Showcase Listing | Người dùng truy cập phân hệ Triển lãm (`/trien-lam`) | Xem danh sách sự kiện và click "Đăng ký tham gia" | Modal đăng ký hiển thị, submit form lưu vào `portal_event_registrations` và cấp mã đăng ký xác nhận. |
| **`AC-01-004`** | AI Virtual Assistant Widget | Người dùng mở trang chủ | Bấm widget FAB góc phải màn hình | Hộp thoại trợ lý AI mở ra, hiển thị các câu hỏi mẫu gợi ý (TRL 1-9, định giá công nghệ) và phản hồi theo tri thức nền tảng. |
| **`AC-01-005`** | Sector Chips Taxonomy | Dữ liệu Master Data trả về danh mục lĩnh vực | Tải thanh Hero Search trang chủ | Hiển thị các chip lĩnh vực động nạp từ API Master Data, click chip tự động filter kết quả tìm kiếm tương ứng. |



---

## Spec Delta v4: Hệ Thống Nhãn Bảo Chứng Chỉ Số TRL & TNI Đồng Nhất Toàn Sàn (CR-2026-TRL-TNI-VERIFY)

> **Căn cứ thay đổi**: Quyết định `PO-DEC-20261109-01` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 31; Hồ sơ [`CR-2026-TRL-TNI-VERIFY`](../TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC/deltas/CR-2026-TRL-TNI-VERIFY.md).

### 1. Yêu Cầu Chức Năng & Quy Tắc Nghiệp Vụ (`REQ-BADGE-UNIFIED-01`, `BR-BADGE-DISPLAY-01`)

- **`REQ-BADGE-UNIFIED-01` [Chuẩn Hóa Component `<IndexVerificationBadge />` Trên Trang Chủ & Các Trang Danh Mục/Chi Tiết]**:
  - Toàn bộ các vị trí hiển thị chỉ số TRL, SHTT và TNI trên Trang chủ (`/`), Danh sách Chào bán (`/chao-ban-cong-nghe`), Chi tiết Chào bán (`/chao-ban-cong-nghe/[id]`), Danh sách Nhu cầu (`/nhu-cau-cong-nghe`) và Chi tiết Nhu cầu (`/nhu-cau-cong-nghe/[id]`) MUST sử dụng quy chuẩn hiển thị đồng nhất qua `<IndexVerificationBadge />`.
  - Trên Trang chủ (`src/app/page.tsx`):
    * Thẻ Chào bán công nghệ (`offers`) hiển thị mức TRL kèm trạng thái xác thực (`trlVerificationStatus`, `verifiedAuthorityName`).
    * Thẻ Nhu cầu đặt hàng (`demands`) hiển thị điểm TNI (nếu có `tniScore`) kèm trạng thái xác thực (`tniVerificationStatus`, `verifiedAuthorityName`) thay vì ghi đè bằng chuỗi ngân sách.

- **`BR-BADGE-DISPLAY-01` [Quy Tắc Phân Biệt Thị Giác Rõ Ràng Giữa "Tự Kê Khai" và "Đã Thẩm Định Bởi Cơ Quan Nhà Nước"]**:
  1. **Khi chỉ số ĐÃ ĐƯỢC THẨM ĐỊNH (`VERIFIED_BY_GOV`)**:
     - Màu sắc & Biểu tượng: Tone xanh ngọc bảo chứng (`bg-emerald-50 text-emerald-800 border-emerald-300`), icon `ShieldCheck` / dấu tích `✓`.
     - Nhãn rút gọn (Compact trên Thẻ Card Trang chủ / Danh sách): `✓ TRL {X}/9 · Đã thẩm định` hoặc `✓ TNI {Score}/100 · Đã thẩm định` (hover hiển thị tooltip đầy đủ tên cơ quan duyệt `VerifiedAuthorityName`).
     - Nhãn đầy đủ (Full trên Trang chi tiết): `✓ TRL {X}/9 — Đã thẩm định bởi {VerifiedAuthorityName || 'Sở KH&CN'}` hoặc `✓ TNI {Score}/100 — Đã xác thực bởi {VerifiedAuthorityName || 'Sở KH&CN'}`.
  2. **Khi chỉ số CHƯA ĐƯỢC THẨM ĐỊNH (`SELF_DECLARED` hoặc `PENDING_VERIFICATION`)**:
     - Màu sắc & Biểu tượng: Tone trung tính/cảnh báo nhẹ (`bg-amber-50/90 text-amber-800 border-amber-300 border-dashed` hoặc `bg-slate-100 text-slate-700 border-slate-300`), icon `Clock` / `Info`.
     - Nhãn rút gọn (Compact trên Thẻ Card Trang chủ / Danh sách): `TRL {X}/9 · Tự kê khai` hoặc `TNI {Score}/100 · Tự đánh giá`.
     - Nhãn đầy đủ (Full trên Trang chi tiết): `TRL {X}/9 (Tự kê khai - Chưa kiểm định)` hoặc `TNI {Score}/100 (Tự đánh giá - Chưa kiểm định)`.
  3. **Khi chỉ số BỊ BÁC BỎ (`REJECTED_TRL`)**:
     - Không hiển thị huy hiệu TRL tự khai trên thẻ công khai; chỉ hiển thị cảnh báo nội bộ trong Workspace của Seller để yêu cầu cập nhật lại minh chứng.

### 2. Tiêu Chí Chấp Nhận Nghiệm Thu (Acceptance Criteria)
- **`AC-01-006`**: Trên Trang chủ (`/`), thẻ công nghệ có `trlVerificationStatus = 'SELF_DECLARED'` hiển thị rõ `TRL X/9 · Tự kê khai`; thẻ có `trlVerificationStatus = 'VERIFIED_BY_GOV'` hiển thị `✓ TRL X/9 · Đã thẩm định` kèm tooltip tên Sở KH&CN.
- **`AC-01-007`**: Bấm vào biểu tượng thông tin `(?)` cạnh nhãn TRL hoặc TNI trên trang chi tiết sẽ mở ngay `<TrlMethodologyModal />` hoặc `<TniMethodologyModal />` giải thích cách tính và cơ sở pháp lý.

---

## Spec Delta v5: Tinh Gọn Thẻ Khảo Sát ĐMST (43 Câu) Trên Màn Dịch Vụ (`/dich-vu-khac`)

> **Căn cứ thay đổi**: Quyết định PO ngày `2026-11-11` (`PO-DEC-20261111-01`) — Bỏ liên kết phụ *"Xem bảng xếp hạng & danh bạ DN"* dưới nút CTA trên Card 03 tại màn hình Dịch vụ (`/dich-vu-khac`).

- **`REQ-01-SRV-01`**: Tại lưới 4 thẻ công cụ đo lường & đánh giá năng lực trên `/dich-vu-khac`, Card 03 (**Khảo Sát ĐMST (43 Câu)**) chỉ giữ duy nhất nút CTA chính `Làm Khảo Sát ĐMST Ngay` (`/khao-sat-dmst`), loại bỏ hoàn toàn dòng liên kết phụ *"Xem bảng xếp hạng & danh bạ DN"* (`/doanh-nghiep-dmst`) để đồng bộ bố cục chân thẻ với 3 thẻ còn lại (TNI, TT17, TRL 1–9).
- **`AC-01-008`**: Trên `/dich-vu-khac`, Card 03 hiển thị nút `Làm Khảo Sát ĐMST Ngay` trỏ `/khao-sat-dmst` và không còn hiển thị liên kết *"Xem bảng xếp hạng & danh bạ DN"*.

---

## Spec Delta v6: Chuyển Đổi Nội Dung Cổng Công Khai BACLINK — Trang Chủ, Giới Thiệu QĐ 1652, Sự Kiện Giao Thương, Dịch Vụ & Hướng Dẫn 3 Cấp (CR-BACLINK-004)

> **Căn cứ thay đổi**: [`CR-BACLINK-004`](./deltas/CR-BACLINK-004_home_about_events_services_content.md); [`Specification/BASIC_DESIGN_BACLINK.md`](../../../Specification/BASIC_DESIGN_BACLINK.md) (Mục 1, 3, 6, 9.2); [`ADR-0018`](../../backend/docs/decisions/ADR-0018-BACLINK-3-TIER-RBAC-AND-CONTENT-REFACTOR.md) (Mục 2.3, 2.5).  
> **Phiên bản áp dụng**: `1.4.0`  
> **Trạng thái**: `APPROVED` (In Implementation)

### 1. Yêu Cầu Chức Năng Bổ Sung (`REQ-01-BL-01` .. `REQ-01-BL-04`)

- **`REQ-01-BL-01` [Trang Chủ BACLINK Zero-Mock & 8 Chip Ngành `IND_*`]**:
  - Trang chủ (`/`) hiển thị Hero *"Kết Nối Chuỗi Cung Ứng & Nâng Tầm Công Nghiệp Bắc Ninh"*, quy trình 4 bước (Đăng ký Hội viên $\rightarrow$ Chuẩn hóa Hồ sơ & Năng lực $\rightarrow$ Ghép nối AI Nội địa–FDI $\rightarrow$ Ký kết MOU & Chứng thực số), khối KCN Bắc Ninh (Yên Phong I/II, Quế Võ I/II/III, VSIP Bắc Ninh, Tiên Sơn, Đại Đồng – Hoàn Sơn, Hanaka, Thuận Thành, Gia Bình) & Hội viên tiêu biểu.
  - 4 thẻ KPI nạp động từ `GET /api/v1/portal/stats` qua `<Async>` đủ 5 UX States (Doanh nghiệp Hội viên BACLINK, Sản phẩm & Năng lực sản xuất, Nhu cầu tìm nhà cung ứng, Giao dịch & MOU thành công), 0% fallback số giả; 8 sector chips nạp động theo danh mục `IND_*`.
- **`REQ-01-BL-02` [Trang Giới Thiệu Pháp Nhân QĐ 1652 & Ma Trận Ngành/KCN]**:
  - `/gioi-thieu` trình bày pháp nhân Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (QĐ 1652/QĐ-UBND ngày 16/06/2025, trụ sở Số 7 Lý Thái Tổ, P. Suối Hoa, TP. Bắc Ninh, Đại hội I 2025–2028, BCH 28 thành viên, phương châm *"Liên kết - Hợp tác - Đổi mới - Hội nhập"*, thương hiệu *"Công nghiệp xanh - Tử tế - Bắc Ninh"*), Điều lệ & Quyền lợi Hội viên.
  - `/matrix` hiển thị Ma trận **8 Ngành công nghiệp `IND_*` × Địa bàn/KCN Bắc Ninh** thay cho ma trận TT17 cũ.
- **`REQ-01-BL-03` [Sự Kiện Xúc Tiến Giao Thương FDI–Nội Địa Bắc Ninh]**:
  - `/trien-lam` và `/trien-lam/dang-ky-tham-quan` chuyển thành **Sự kiện Xúc tiến Giao thương & Hội chợ Công nghiệp BACLINK**, nạp dữ liệu thật từ PostgreSQL (`seed_baclink_demo_data.sql` với 3 sự kiện BACLINK) và giữ luồng đăng ký tham quan/gian hàng B2B qua API thật.
- **`REQ-01-BL-04` [Dịch Vụ Hỗ Trợ Hội Viên & Hướng Dẫn Thao Tác 3 Cấp]**:
  - `/dich-vu-khac` tái định vị sang **Dịch vụ Hỗ trợ Hội viên BACLINK** (Kết nối FDI, Chuẩn hóa ISO/IATF/Lean/ESG, Radar AI, Đánh giá Năng lực Nhà máy & CĐS), bảo toàn bố cục tinh gọn Card 03 (`REQ-01-SRV-01`).
  - `/huong-dan` (`guide-data.ts`) cấu trúc lại hướng dẫn theo đúng **3 cấp** (`ADMIN`, `ENTERPRISE` Dual-Mode, `PUBLIC_USER`), gỡ bỏ hoàn toàn hướng dẫn `/gov/*`, 10 roles và 34 Sở KH&CN.

### 2. Quy Tắc Nghiệp Vụ Bổ Sung (`BR-01-BL-01`, `BR-01-BL-02`)

- **`BR-01-BL-01` [Zero Brand Leakage & Zero-Mock Trên Cổng Công Khai]**:
  - Nghiêm cấm hiển thị chuỗi `NacenTech`, `NacenTwin`, `Bộ KH&CN`, `34 Sở KH&CN`, `34 tỉnh` trên các route thuộc `TASK-01`. Toàn bộ KPI và sự kiện đọc từ PostgreSQL thật; lỗi API phải hiển thị Error State qua `<Async>`.
- **`BR-01-BL-02` [Quy Chuẩn Nhãn Bảo Chứng Công Khai BACLINK]**:
  - Cập nhật nhãn mặc định của `BR-BADGE-DISPLAY-01` trên giao diện công khai từ `'Sở KH&CN'` sang `'Hiệp hội BACLINK'` (`✓ TRL {X}/9 · Đã chứng thực` / `✓ Đã chứng thực bởi Hiệp hội BACLINK`), vẫn tôn trọng `VerifiedAuthorityName` nếu bản ghi DB có tên cụ thể.

### 3. Tiêu Chuẩn Chấp Thuận (`AC-01-009` .. `AC-01-012`)

- **`AC-01-009`**: Truy cập `/`, 4 KPI hiển thị số đếm thật từ `GET /api/v1/portal/stats` qua `<Async>`, 8 chip ngành hiển thị mã/tên `IND_*`, không xuất hiện chuỗi `NacenTech`/`NacenTwin`/`34 tỉnh`.
- **`AC-01-010`**: Truy cập `/gioi-thieu` và `/matrix`, hiển thị đầy đủ QĐ 1652/QĐ-UBND, trụ sở TP. Bắc Ninh, BCH 28 thành viên và Ma trận 8 ngành `IND_*` × KCN Bắc Ninh.
- **`AC-01-011`**: Truy cập `/trien-lam`, hiển thị 3 sự kiện xúc tiến giao thương BACLINK từ PostgreSQL (`seed_baclink_demo_data.sql`) và gửi form đăng ký tham quan thành công (`200/201`).
- **`AC-01-012`**: Truy cập `/dich-vu-khac` và `/huong-dan`, chỉ hiển thị hướng dẫn 3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`) và không còn bất kỳ liên kết hoặc hướng dẫn nào trỏ tới `/gov/*`.

---

## Spec Delta v23 (CR-BACLINK-009): CMS Nội dung Hiệp hội [XÁC NHẬN SCOPE 2026-11-19]
- **Delta Ledger**: [`deltas/CR-BACLINK-009_cms_knowledge_committees_media.md`](./deltas/CR-BACLINK-009_cms_knowledge_committees_media.md).
- **Yêu cầu mới**: `REQ-BL09-CMS-ARTICLE-001`, `REQ-BL09-CMS-DOC-002`, `REQ-BL09-KNOWLEDGE-HUB-003`, `REQ-BL09-COMMITTEE-PAGE-004`, `REQ-BL09-MEDIA-005`, `REQ-BL09-PARTNER-006`.
- **Quy tắc**: `BR-BL09-NO-FABRICATION-001`, `BR-BL09-SLUG-STABLE-002`, `BR-BL09-PUBLIC-ONLY-003`; `DB-BL09-CMS-001`, `API-BL09-CMS-001`, `NFR-BL09-SAFE-HTML-001`.
