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
