# Danh Sách Công Việc Kỹ Thuật (tasks.md) — TASK-01: Cổng Điều Hướng Home & Sự Kiện Techmart

> **Mã phân hệ**: `TASK-01`  
> **Ánh xạ Spec Kit**: [`spec.md`](spec.md) | [`plan.md`](plan.md)  
> **Quy chuẩn**: Phân rã tuần tự, gắn tag `[CONTRACT]`, `[BE]`, `[FE]`, `[INT]`, `[TEST]`, cập nhật tiến độ `[x]`.

---

### Phase 1: API Contracts & Shared DTOs [CONTRACT]
- [x] **T-01.01** `[CONTRACT]` Định nghĩa bộ DTOs Contracts (`PortalOverviewStatsDto`, `TechmartEventDto`, `EventRegistrationRequestDto`, `EventRegistrationResponseDto`, `AiQuickAssistDto`) trong `SourceCode/backend/`.
- [x] **T-01.02** `[CONTRACT]` Định nghĩa mã lỗi nghiệp vụ chuẩn `PortalErrorCodes` (`ERR_EVENT_NOT_FOUND`, `ERR_REGISTRATION_CLOSED`, `ERR_INVALID_CONTACT_INFO`).

---

### Phase 2: Triển Khai Backend & CSDL PostgreSQL [BE] & [TEST]
- [x] **T-01.03** `[BE]` Khởi tạo Entity EF Core và Migration nạp bảng `portal.techmart_events` và `portal.event_registrations` vào PostgreSQL.
- [x] **T-01.04** `[BE]` Cài đặt `PortalOverviewService`: Query tổng hợp thời gian thực từ các bảng `technology_offers`, `demand_surveys`, `enterprises`, `expert_profiles` kèm MemoryCache 5 phút.
- [x] **T-01.05** `[BE]` Cài đặt `TechmartEventService`: UseCases tra cứu sự kiện phân trang và xử lý đơn đăng ký tham gia sự kiện.
- [x] **T-01.06** `[BE]` Cài đặt `AiAssistantService`: Xử lý phân tích từ khóa và gợi ý TRL / khoảng giá / liên kết điều hướng.
- [x] **T-01.07** `[BE]` Đăng ký RESTful Endpoints V1 trong `PortalController` và `EventsController`.
- [x] **T-01.08** `[TEST]` Viết Unit Invariant Tests cho 100% Business Rules (`BR-HOME-01` chặn bidding/escrow, `BR-HOME-02` Zero-mock count).

---

### Phase 3: Triển Khai Frontend Next.js 15 (2 Màn Hình & Mega-Menu) [FE]
- [x] **T-01.09** `[FE]` Tạo client API SDK `portalClient` kết nối các endpoints thống kê và sự kiện V1.
- [x] **T-01.10** `[FE]` Nâng cấp Global Navigation Mega-Menu 7 mục trong `src/components/common/navbar.tsx` theo `wireframe_home.html` (Mega-dropdown, Mobile Drawer, menu tài khoản).
- [x] **T-01.11** `[FE]` **MÀN HÌNH 1**: Nâng cấp Trang chủ `src/app/page.tsx` thay thế mảng tĩnh bằng dynamic fetch từ `portalClient.getStats()`, bọc component `<Async>` 5 trạng thái UX.
- [x] **T-01.12** `[FE]` **MÀN HÌNH 2**: Xây dựng trang Sàn Sự kiện & Phiên Chào Giá Techmart `src/app/trien-lam/page.tsx` theo `wireframe_techmart_events.html` (Countdown, Bộ lọc Tab, thẻ sự kiện).
- [x] **T-01.13** `[FE]` Xây dựng Modal & Trang Đăng ký tham quan `src/app/trien-lam/dang-ky-tham-quan/page.tsx` kèm validation form và feedback xác nhận.
- [x] **T-01.14** `[FE]` Xây dựng Component Floating Widget `<AIAssistantWidget />` hiển thị trên trang chủ với các kịch bản hỏi đáp TRL.

---

### Phase 4: Kiểm Thử Toàn Trình, Gate 3 SA & Gate 5 Shipped [INT] & [QC]
- [x] **T-01.15** `[INT]` Kiểm thử tích hợp toàn trình (E2E Integration): Trang chủ nạp số liệu thật, Mega-menu click thông suốt, form đăng ký sự kiện lưu thành công vào DB.
- [x] **T-01.16** `[TEST]` Viết Vitest cho component Mega-menu, Floating AI Widget và Event Card.
- [x] **T-01.17** `[QC]` Bàn giao QC thực thi bộ kiểm thử Playwright Visual QA & E2E cho 2 màn hình trên Desktop và Mobile.
- [x] **T-01.18** `[GATE]` Thẩm định Gate 3 SA (`guard-rails.sh`), đối soát Gate 5 Definition of Done và đóng Epic Shipped trong `ROADMAP.md`.
  - [x] `TASK-01-CR19` **[CR]** [P1] (Người gửi: a Lượng) bỏ phần nội dung ở trang chủ: Cẩm Nang Hướng Dẫn Sử Dụng Chi Tiết.

---

## Giai đoạn 4: Triển khai Delta v2 — Tươi mới & Đa dạng hóa Cung - Cầu

- [x] **T-01.19** `[DB]` Rà soát và cập nhật dữ liệu test trùng lặp (Data Sanitization): Chuyển cờ `is_public_listed = false` cho các bản ghi demand/offer trùng lặp tiêu đề do quá trình test trước đó, đảm bảo dữ liệu phân bổ tối thiểu 10-15 ngành nghề; bổ sung chỉ mục tối ưu truy vấn cho Trang chủ (`ix_demand_items_home`, `ix_seller_offers_home`).
  - Tiêu chí kiểm chứng:
    - [x] Không có bản ghi bài toán trùng lặp tiêu đề nào có `is_public_listed = true`.
    - [x] Không làm phá vỡ schema PostgreSQL (Non-destructive migration).
    - [x] Các chỉ mục tối ưu truy vấn được cấu hình thành công nếu chưa tồn tại.
- [x] **T-01.20** `[BE]` Cập nhật API Demand (`GET /api/v1/public/demands` tại `DemandController.cs`): Bổ sung tham số `rotate` (bool, default `false`) và `limit` (int, default `50`); cài đặt cơ chế DistinctBy `TechnicalProblem` và thuật toán Deterministic Daily Rotation + Interleaved Sector Selection (giới hạn tối đa 2 item/ngành khi `rotate=true`).
  - Tiêu chí kiểm chứng:
    - [x] Gọi `GET /api/v1/public/demands?rotate=true&limit=6` trả về danh sách không quá 6 bài toán, 100% không trùng lặp tiêu đề.
    - [x] Không có ngành nào chiếm quá 2/6 bài toán khi DB có nhiều ngành.
    - [x] Tương thích ngược: Khi không truyền `rotate`, API trả về danh sách theo thứ tự thông thường.
- [x] **T-01.21** `[BE]` Cập nhật API Technology Offers (`GET /api/v1/technologies` & `GET /api/v2/technologies` tại `TechnologyOffersController.cs`): Bổ sung tham số `rotate` (bool, default `false`); áp dụng DistinctBy `Title` và thuật toán Deterministic Daily Rotation + Interleaved Sector Selection.
  - Tiêu chí kiểm chứng:
    - [x] Gọi `GET /api/v1/technologies?rotate=true&limit=6` trả về tối đa 6 công nghệ với tiêu đề phân biệt hoàn toàn.
    - [x] Danh sách ưu tiên đan xen nhiều ngành khác nhau, tối đa 2 công nghệ/ngành.
    - [x] Kết quả ổn định trong cùng một ngày và tự động luân phiên sang ngày mới dựa trên seed `yyyyMMdd`.
- [x] **T-01.22** `[FE]` Mở rộng thư viện đồ họa đa ngành `SourceCode/frontend/src/lib/technology-media.ts`: Thiết lập ánh xạ đủ 17 mã ngành chuẩn KH&CN `LV01`–`LV17` trong `SECTOR_IMAGE_MAP`, hoàn thiện bộ gallery 4 ảnh cho mỗi ngành và thứ tự fallback 4 bậc.
  - Tiêu chí kiểm chứng:
    - [x] `SECTOR_IMAGE_MAP` có đủ 17 entries từ `LV01` đến `LV17`.
    - [x] Ưu tiên ảnh thật `customImageUrl` -> ảnh ngành `SECTOR_IMAGE_MAP` -> fallback từ khóa tiêu đề -> `/tech-ai-vision.png`.
    - [x] Không xảy ra lỗi crash khi `sectorCode` không tồn tại hoặc `null`.
- [x] **T-01.23** `[FE]` Nâng cấp API Client SDK (`technology-offer.ts` & `portal-client.ts`): Bổ sung tham số `rotate?: boolean` vào `fetchPublicOffers` và `portalClient.getPublicDemands`.
  - Tiêu chí kiểm chứng:
    - [x] `fetchPublicOffers({ rotate: true, limit: 6 })` sinh đúng query param `rotate=true&limit=6`.
    - [x] `portalClient.getPublicDemands({ rotate: true, limit: 6 })` hỗ trợ query params linh hoạt.
    - [x] Type check TypeScript vượt qua 100%.
- [x] **T-01.24** `[FE]` Refactor Trang Chủ (`SourceCode/frontend/src/app/page.tsx`): Fix triệt để React key warning, tích hợp Client-Side Deduplication, fetch dữ liệu với `rotate=true&limit=6`, kiểm soát hiển thị tối đa 6 Cung / 6 Cầu.
  - Tiêu chí kiểm chứng:
    - [x] Khóa render `key={`${item.type}-${item.id || item.itemCode || idx}-${idx}`}` loại bỏ 100% cảnh báo duplicate key trên Console trình duyệt.
    - [x] Bộ lọc `Set` phía client loại bỏ mọi item trùng tiêu đề phòng thủ.
    - [x] Trang chủ nạp dữ liệu mượt mà, chuyển đổi giữa 2 tab Chào bán & Nhu cầu phản hồi tức thì.
- [x] **T-01.25** `[TEST]` Kiểm thử tự động (Unit & Integration): Viết test kiểm tra thuật toán xáo trộn theo ngày, tính khử trùng lặp và xác nhận 0% warning React key trên Playwright.
  - Tiêu chí kiểm chứng:
    - [x] Unit test cho hàm khử trùng lặp và xoay tua ngành: Verify tính ngẫu nhiên xác định với cùng một seed ngày.
    - [x] Vitest kiểm thử component `technology-media.ts`: Đạt 100% độ phủ 17 mã ngành.
    - [x] Playwright E2E kiểm thử Trang chủ: Không phát hiện duplicate key warning và không có 2 thẻ trùng tiêu đề.



---

## Giai đoạn 5: Triển khai Delta v3 (CR-2026-010) — Chuẩn Hóa 4 Marketplace Metrics & Zero-Mock

- [x] **T-01.26** `[BE]` Nâng cấp `PortalOverviewStatsDto` trong `SourceCode/backend/modules/content/Application/PortalContracts.cs`: Bổ sung `long TotalSuccessfulConnections` và `decimal TotalEstimatedValueMillionVnd`.
  - Tiêu chí kiểm chứng:
    - [x] DTO chứa đầy đủ 2 trường mới có giá trị mặc định tương thích ngược.
    - [x] Build .NET không lỗi compiler.
- [x] **T-01.27** `[BE]` Phẫu thuật `PortalOverviewService.cs` (`apps/api/V1Compat/`): Đếm động `totalOffers` (Status=APPROVED), `totalDemands` (Verified & PublicListed), `totalEnterprises`, `totalExperts`, `totalProvinces` (COUNT DISTINCT province_city từ `Enterprise`, xóa bỏ số 34), `totalSuccessfulConnections` (từ `brokerage.connection_requests` status ACCEPTED/COMPLETED và `mou_agreements` status SIGNED), `totalEstimatedValueMillionVnd` (từ `brokerage.opportunities` và ngân sách demand).
  - Tiêu chí kiểm chứng:
    - [x] `GET /api/v1/portal/stats` trả về 4 chỉ số tính toán thời gian thực từ CSDL PostgreSQL.
    - [x] `totalProvinces` phản ánh số tỉnh thành thực tế của doanh nghiệp, không hardcode 34.
    - [x] Tuân thủ ranh giới Clean Architecture, in-memory cache 5 phút hoạt động ổn định.
- [x] **T-01.28** `[FE]` Cập nhật `PortalOverviewStats` trong `SourceCode/frontend/src/lib/portal-client.ts`: Bổ sung 2 trường `totalSuccessfulConnections: number` và `totalEstimatedValueMillionVnd: number`.
  - Tiêu chí kiểm chứng:
    - [x] TypeScript interface đồng bộ 100% với backend DTO.
    - [x] `portalClient.getStats()` trả về đúng kiểu dữ liệu.
- [x] **T-01.29** `[FE]` Refactor Hero Stats Strip trên Trang Chủ (`SourceCode/frontend/src/app/page.tsx`): Nối 4 thẻ hiển thị 4 Marketplace Metrics chuẩn (Tổng Cung, Tổng Cầu, Kết Nối Thành Công, Quy Mô Giao Dịch & Ngân Sách) bọc qua `<Async>` đủ 5 UX States, format tiền tệ Việt Nam linh hoạt.
  - Tiêu chí kiểm chứng:
    - [x] Thẻ 1 hiển thị Tổng Cung link tới `/chao-ban-cong-nghe`.
    - [x] Thẻ 2 hiển thị Tổng Cầu link tới `/nhu-cau-cong-nghe`.
    - [x] Thẻ 3 hiển thị Lượt Kết Nối & MOU link tới `/trien-lam`.
    - [x] Thẻ 4 hiển thị Quy Mô Giao Dịch & Ngân Sách formatted (Tỷ / Triệu VNĐ) link tới `/portal/opportunities/pipeline`.
    - [x] 0% số hardcode, đủ 5 trạng thái UX (Loading pulse, Error retry, Empty 0, Success, Updating).
- [x] **T-01.30** `[TEST]` Bổ sung Unit Tests & Integration Tests cho Portal Overview Stats mới:
  - Tiêu chí kiểm chứng:
    - [x] Unit Test backend kiểm tra `PortalOverviewService`: Tính toán đúng các công thức đếm từ CSDL thật (`PortalHomeInvariantsTests.cs`).
    - [x] Vitest component test cho `page.tsx`: Render đúng 4 thẻ số liệu qua `<Async>`.
    - [x] Playwright E2E: Xác nhận số liệu trên Trang chủ khớp 1:1 với kết quả truy vấn SQL PostgreSQL trực tiếp.

- [x] `TASK-01-CR68` **[CR]** [P1] (Người gửi: Luongdt) Thêm các dịch vụ vào Tab dịch vụ — Thêm các mục, đường dẫn về Tab Dịch Vụ [Đính kèm: ![screenshot_10h06m19_1.png](/static/uploads/TASK-01-CR68_1793502383_1_screenshot_10h06m19_1.png)]
- [x] `TASK-01-CR69` **[CR]** [P1] (Người gửi: Luongdt / PO-DEC-20261111-01) Màn Dịch vụ (`/dich-vu-khac`): Bỏ dòng liên kết phụ *"Xem bảng xếp hạng & danh bạ DN"* dưới nút CTA trên Card 03 (`Khảo Sát ĐMST (43 Câu)`) và cập nhật test `src/app/dich-vu-khac/page.test.tsx`.

---

## Giai đoạn 6: Triển khai Sprint 3 (CR-2026-UIUX-003) — Cải Tiến Trang Chủ Homepage Đẳng Cấp Quốc Gia (Sprint 3: T-01.20 -> T-01.25) [`[CR-2026-UIUX-003]`]

- [x] `T-01.31` **[CR-2026-UIUX-003] [FE] (S3: T-01.20) Tái thiết kế Hero Section & Omni-Search Bar 4 Tab với nút CTA Emerald `#2D9A85`**:
  - [x] Nền đồ họa công nghệ quang học `innovation-hero-background.png` kết hợp gradient GovTech và ánh sáng hào quang (Cyan & Blue Glow Orbs).
  - [x] Headline truyền cảm hứng ĐMST: *"Sàn Giao Dịch & Khớp Nối Cung Cầu Công Nghệ Quốc Gia"*, khẩu hiệu chuyển giao công nghệ font `Be Vietnam Pro` sắc nét, độ tương phản $\ge 7:1$.
  - [x] Omni-Search Bar tích hợp 4 Tab chuyên biệt (Công nghệ chào bán, Nhu cầu đặt hàng, Chuyên gia KH&CN, Doanh nghiệp ĐMST) hiển thị số lượng badge trực quan.
  - [x] Tích hợp `AppInput` tìm kiếm từ khóa, `AppSelect` chọn 18 ngành TT17 và phân khúc TRL 1-9.
  - [x] Nút CTA Emerald `#2D9A85` (`AppButton` biến thể `cta`) tạo điểm nhấn thị giác mạnh mẽ trên nền Hero tối, tích hợp phản hồi xúc giác `active:scale-[0.98]`.
  - [x] Dải từ khóa xu hướng (Hot Trending Tags) hỗ trợ tra cứu nhanh 1-click.

- [x] `T-01.32` **[CR-2026-UIUX-003] [FE] (S3: T-01.21) Nâng cấp Khối Thống kê Quốc gia (Live National Metrics Grid) 4 Thẻ với Icon Cyan `#06B6D4` & Animated Counter**:
  - [x] Hiển thị 4 thẻ số liệu thời gian thực: Tổng Cung (`totalOffers`), Tổng Cầu (`totalDemands`), Kết Nối & MOU (`totalSuccessfulConnections`), Quy Mô Giao Dịch & Ngân Sách (`totalEstimatedValueMillionVnd`).
  - [x] Mỗi thẻ trang bị biểu tượng công nghệ Cyan `#06B6D4` / Emerald / Indigo / Amber kích thước 28px.
  - [x] Tích hợp hiệu ứng animated counter tăng số mượt mà khi người dùng cuộn tới.
  - [x] Bao bọc trọn vẹn qua component `<Async>` bảo đảm 5 trạng thái UX (Loading Skeleton, Empty, Error Retry, Success, Partial).
  - [x] Zero-Mock: 100% số liệu nạp động từ `portalClient.getStats()`, không hardcode.

- [x] `T-01.33` **[CR-2026-UIUX-003] [FE] (S3: T-01.22) Chuẩn hóa Lưới Thẻ Listing Công Nghệ & Nhu Cầu bằng `AppCard` & `AppBadge` TRL 1-9**:
  - [x] Áp dụng component `AppCard` tương tác, hiệu ứng elevation hover (`hover:-translate-y-1 hover:shadow-xl`).
  - [x] Khung ảnh thumbnail tỷ lệ chuẩn 16:9 (`aspect-[16/9]`) hiển thị ảnh công nghệ đại diện hoặc fallback đa ngành `getTechnologyImage()`.
  - [x] `AppBadge` TRL 1-9 phân chia 3 dải màu chuẩn hóa: TRL 1-3 (Xanh dương), TRL 4-6 (Hổ phách), TRL 7-9 (Xanh lục Emerald).
  - [x] Hiển thị đầy đủ mã định danh font đơn cách (`TECH-*`, `DMD-*`), đơn vị sở hữu, địa bàn tỉnh thành, bằng độc quyền SHTT / ngân sách.
  - [x] Nút CTA "Yêu Cầu Kết Nối" (`AppButton`) kích hoạt trực tiếp luồng kết nối cơ hội.

- [x] `T-01.34` **[CR-2026-UIUX-003] [FE] (S3: T-01.23) Xây dựng Khối Quy trình Kết nối 4 Bước Trực Quan ĐMST**:
  - [x] Mô hình hóa quy trình kết nối công nghệ thành 4 bước tinh gọn: 1. Khám phá & Định danh $\rightarrow$ 2. Thẩm định TRL & Pháp lý $\rightarrow$ 3. Khớp nối AI & Đàm phán $\rightarrow$ 4. Ký kết Chuyển giao & Hậu kiểm.
  - [x] Thiết kế trực quan với đường kẻ tiến trình (Progress Line), số thứ tự nổi bật và biểu tượng nhận diện riêng từng bước.
  - [x] Responsive mượt mà: dạng hàng ngang trên Desktop và dạng dọc (vertical timeline) trên Mobile.

- [x] `T-01.35` **[CR-2026-UIUX-003] [FE] (S3: T-01.24) Xây dựng Khối Mạng Lưới Đối Tác & 63 Sở KH&CN Toàn Quốc**:
  - [x] Bố cục 3 trụ cột đối tác: Viện Nghiên cứu & Trường Đại học, 63 Sở KH&CN địa phương, Doanh nghiệp ĐMST tiên phong.
  - [x] Hiển thị lưới logo các đơn vị liên kết với hiệu ứng hover chuyển sắc độ tinh tế.
  - [x] Tích hợp dải Global Ecosystem CTA kêu gọi tham gia hệ sinh thái ở đáy trang với 2 nút CTA đối ứng (Chào bán & Đặt hàng).

- [x] `T-01.36` **[CR-2026-UIUX-003] [TEST/QC] (S3: T-01.25) Xây dựng Bộ Kiểm Thử Vitest & Playwright Visual QA Cho Trang Chủ**:
  - [x] Viết test suite Vitest `src/test/homepage-uiux.test.tsx` (và alias `homepage-elevation.test.tsx`) kiểm chứng hiển thị Omni-Search 4 tabs, Live Metrics Grid, Listing cards, TRL badges và 4-step flow đạt 100% Pass (18/18 tests green).
  - [x] Kiểm chứng ràng buộc `BR-UI-003`: Bảo toàn 100% logic API `fetchPublicOffers()`, `portalClient.getStats()`, `authClient` và các link điều hướng.
  - [x] Chạy Playwright Visual QA & Vitest trên 3 viewports (Mobile 390px, Tablet 768px, Desktop 1280px) đạt điểm $\ge 8.0/10$; xác nhận tỷ lệ tương phản WCAG AA $\ge 4.5:1$ (Navy 6.82:1, Slate 14:1) và Touch Target $\ge 44 \times 44\text{px}$.
  - [x] Đối soát bảo đảm không có mock ngầm (Zero-Mock mandate) và ký biên bản Quality Gate 4/5.



---

## Phase 7: BACLINK Refactor Delta (CR-BACLINK-004)

- [x] `T-01.BL.01` **[BE]** Đồng bộ `PortalOverviewService`, `PortalControllers`, `TechmartEventService` và `AiAssistantService` sang ngữ cảnh BACLINK (4 KPI thật từ PostgreSQL, đọc 3 sự kiện giao thương BACLINK từ `content.techmart_events`, system prompt trợ lý AI theo 8 ngành `IND_*` & KCN Bắc Ninh, không còn dẫn chiếu `NacenTech`/`NacenTwin`/`Bộ KH&CN`) (`REQ-01-BL-01`, `REQ-01-BL-03`, `BR-01-BL-01`):
  - [x] Tệp: `SourceCode/backend/apps/api/V1Compat/PortalOverviewService.cs`, `SourceCode/backend/apps/api/V1Compat/PortalControllers.cs`, `SourceCode/backend/modules/content/Application/TechmartEventService.cs`, `SourceCode/backend/modules/content/Application/AiAssistantService.cs`.
  - [x] Kiểm chứng: `dotnet test SourceCode/backend/tests/invariants/NacenTech.Tests.Invariants.csproj --filter "FullyQualifiedName~PortalHomeInvariantsTests"`.
- [x] `T-01.BL.02` **[FE]** Chuyển đổi Trang Chủ `/` sang nhận diện BACLINK (hero *"Kết Nối Chuỗi Cung Ứng & Nâng Tầm Công Nghiệp Bắc Ninh"*, 4 KPI động từ `GET /api/v1/portal/stats` qua `<Async>` 5 UX States, quy trình 4 bước BACLINK, khối KCN trọng điểm Bắc Ninh & Hội viên tiêu biểu, 8 chips `IND_*` nạp động từ `TASK-06`) (`REQ-01-BL-01`, `BR-01-BL-01`):
  - [x] Tệp: `SourceCode/frontend/src/app/page.tsx`.
  - [x] Kiểm chứng: `cd SourceCode/frontend && npx vitest run src/app/page.test.tsx`.
- [x] `T-01.BL.03` **[FE]** Cập nhật Trang Giới Thiệu `/gioi-thieu` (QĐ 1652/QĐ-UBND ngày 16/06/2025, Số 7 Lý Thái Tổ, TP. Bắc Ninh, Đại hội I 2025–2028, BCH 28 thành viên, phương châm & Điều lệ) và Trang Ma Trận `/matrix` (8 ngành `IND_*` × Địa bàn/KCN Bắc Ninh) (`REQ-01-BL-02`, `BR-01-BL-01`):
  - [x] Tệp: `SourceCode/frontend/src/app/gioi-thieu/page.tsx`, `SourceCode/frontend/src/app/matrix/page.tsx`.
  - [x] Kiểm chứng: `cd SourceCode/frontend && npx vitest run src/app/gioi-thieu/page.test.tsx && npx tsc --noEmit`.
- [x] `T-01.BL.04` **[FE]** Chuyển đổi Trang Sự Kiện `/trien-lam` & `/trien-lam/dang-ky-tham-quan` sang Xúc tiến Giao thương FDI–Nội địa BACLINK, đọc 3 sự kiện thật từ PostgreSQL qua `<Async>` và giữ luồng đăng ký B2B (`REQ-01-BL-03`, `BR-01-BL-01`):
  - [x] Tệp: `SourceCode/frontend/src/app/trien-lam/page.tsx`, `SourceCode/frontend/src/app/trien-lam/dang-ky-tham-quan/page.tsx`.
  - [x] Kiểm chứng: `cd SourceCode/frontend && npx tsc --noEmit`.
- [x] `T-01.BL.05` **[FE]** Cập nhật Dịch Vụ Hỗ Trợ Hội Viên `/dich-vu-khac` (giữ tinh gọn Card 03 `REQ-01-SRV-01`), tái cấu trúc Hướng Dẫn `/huong-dan` & `guide-data.ts` theo đúng 3 cấp (`ADMIN`, `ENTERPRISE` Dual-Mode, `PUBLIC_USER`, xóa 100% `/gov/*` & 34 Sở KH&CN), và cập nhật nhãn bảo chứng mặc định `'Hiệp hội BACLINK'` trên `<IndexVerificationBadge />` (`REQ-01-BL-04`, `BR-01-BL-01`, `BR-01-BL-02`):
  - [x] Tệp: `SourceCode/frontend/src/app/dich-vu-khac/page.tsx`, `SourceCode/frontend/src/app/huong-dan/page.tsx`, `SourceCode/frontend/src/app/huong-dan/guide-data.ts`, `SourceCode/frontend/src/components/common/IndexVerificationBadge.tsx`.
  - [x] Kiểm chứng: `cd SourceCode/frontend && npx vitest run src/app/dich-vu-khac/page.test.tsx src/app/huong-dan/page.test.tsx src/components/common/IndexVerificationBadge.test.tsx`.
- [x] `T-01.BL.06` **[TEST]** Bổ sung & cập nhật Unit/Component tests cho Trang chủ, Giới thiệu QĐ 1652, Ma trận `IND_*`, Sự kiện PostgreSQL seed, Dịch vụ, Hướng dẫn 3 cấp và kiểm tra Zero Brand Leakage (`AC-01-009`..`AC-01-012`, `BR-01-BL-01`, `BR-01-BL-02`):
  - Tệp: `SourceCode/frontend/src/app/page.test.tsx`, `SourceCode/frontend/src/app/gioi-thieu/page.test.tsx`, `SourceCode/frontend/src/app/matrix/page.test.tsx`, `SourceCode/frontend/src/app/trien-lam/page.test.tsx`, `SourceCode/frontend/src/app/huong-dan/page.test.tsx`, `SourceCode/frontend/src/components/common/IndexVerificationBadge.test.tsx`, `SourceCode/backend/tests/invariants/PortalHomeInvariantsTests.cs`.
  - Kiểm chứng: `dotnet test SourceCode/backend/tests/invariants/NacenTech.Tests.Invariants.csproj --filter "FullyQualifiedName~PortalHomeInvariantsTests"` và `cd SourceCode/frontend && npx vitest run src/app/page.test.tsx src/app/gioi-thieu/page.test.tsx src/app/matrix/page.test.tsx src/app/trien-lam/page.test.tsx src/app/dich-vu-khac/page.test.tsx src/app/huong-dan/page.test.tsx src/components/common/IndexVerificationBadge.test.tsx && npx tsc --noEmit`.
