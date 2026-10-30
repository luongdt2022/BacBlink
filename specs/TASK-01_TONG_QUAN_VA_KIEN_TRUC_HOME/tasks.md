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

- [x] `TASK-01-CR19` **[CR]** [P1] (Người gửi: a  Lượng) bỏ cho a phần nội dung ở trang chủ : Cẩm Nang Hướng Dẫn Sử Dụng Chi Tiết (11 Phân Hệ · 48 Màn Hình Thực Tế) — không cần hiển thị phần chỉ dẫn này ở trang chủ

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
- [ ] **T-01.30** `[TEST]` Bổ sung Unit Tests & Integration Tests cho Portal Overview Stats mới:
  - Tiêu chí kiểm chứng:
    - [ ] Unit Test backend kiểm tra `PortalOverviewService`: Tính toán đúng các công thức đếm từ CSDL thật.
    - [ ] Vitest component test cho `page.tsx`: Render đúng 4 thẻ số liệu qua `<Async>`.
    - [ ] Playwright E2E: Xác nhận số liệu trên Trang chủ khớp 1:1 với kết quả truy vấn SQL PostgreSQL trực tiếp.
