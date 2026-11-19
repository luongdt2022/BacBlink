# Danh sách câu hỏi mở (Open Questions)

*Cập nhật sau phiên chốt `ADR-0018` (Batch `P0-B2` — BACLINK 3-Tier RBAC & Content Refactor, ngày 2026-11-17).*

## Câu hỏi đã chốt trong `ADR-0018`
- **RBAC 3 cấp & Tương thích ngược**: Chốt thu gọn về `ADMIN`, `ENTERPRISE` (Dual-Mode `BUYER`+`SELLER`), `PUBLIC_USER`; thống nhất `ScopeTypes.Global` (`scope_id = NULL`), giữ adapter chuẩn hóa token/DB cũ phi phá hủy.
- **Vô hiệu hóa `/gov/*`**: Gỡ khỏi UI và khóa các endpoint `/api/v*/gov/*` (đặc biệt các route từng mở `[AllowAnonymous]` tại `DemandController`, `BrokerageControllers`, `AssessmentsController`), chuyển API tra cứu địa bàn công khai sang Master Data.
- **Seeding Zero-Mock**: Nạp toàn bộ 5 tài khoản 3 cấp, 10 DN Bắc Ninh, sản phẩm, nhu cầu, sự kiện, học liệu LMS qua `seed_baclink_demo_data.sql` vào PostgreSQL thật.

## Câu hỏi đã chốt bởi PO (17/11/2026)
- **Q1 (Ban Cố vấn Kỹ thuật & `PlatformRole`) — ĐÃ CHỐT**: Giữ nghiêm ngặt **3 cấp (`ADMIN`, `ENTERPRISE`, `PUBLIC_USER`)**, KHÔNG tạo role thứ 4 trong JWT. Ban Cố vấn Kỹ thuật (`TASK-05`) là danh bạ cố vấn do `ADMIN` quản lý/duyệt; tài khoản cố vấn dùng `PUBLIC_USER` hoặc `ENTERPRISE` gắn bản ghi `ExpertProfile (Status = APPROVED)`, quyền truy cập `/portal/expert/*` kiểm tra theo `ExpertProfile` đã duyệt hoặc `ADMIN`.
- **Q2 (Mapping trọng số Đánh giá Năng lực sang 8 Ngành BACLINK) — ĐÃ CHỐT**: Giữ nguyên engine tính điểm `Tt17ScoringEngine` (`TASK-09`), bổ sung bảng ánh xạ mặc định từ 8 mã ngành `IND_*` (`IND_ELEC`..`IND_LOG`) sang bộ trọng số công nghiệp tương ứng (fallback bộ trọng số cân bằng chuẩn BACLINK) để tính điểm tự động 100% không lỗi.
