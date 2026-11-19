# CR-BACLINK-010 — 8 Trang dịch vụ, Cơ hội kinh doanh gộp, Yêu cầu & kiến nghị của tôi

**Status**: `IMPLEMENTED (2026-11-19)` — thuộc *Kế hoạch nâng cấp v2* đã `XÁC NHẬN KẾ HOẠCH V2`; người dùng yêu cầu "làm lần lượt đến xong" và ưu tiên giao diện công khai trước.
**Căn cứ** `[VERIFIED]` góp ý khách hàng `260717`: Menu 3 (mỗi dịch vụ nói rõ *Dành cho ai – Giải quyết vấn đề gì – BACLINK hỗ trợ thế nào – Đăng ký ở đâu*), Menu 4 (nhóm Cơ hội kinh doanh), §2 hội viên (*gửi câu hỏi, kiến nghị; theo dõi tình trạng xử lý*).

| Mã neo | Nội dung | Triển khai |
|---|---|---|
| `REQ-BL10-SERVICE-001` | 8 trang dịch vụ mẫu 4 câu hỏi; mô tả chung, **không** nêu phí/thời hạn/cam kết `[PROPOSAL – DEMO]` | `lib/constants/services.ts`, `app/dich-vu/**` |
| `REQ-BL10-OPPS-002` | Trang `/co-hoi-kinh-doanh` 5 tab; tab *Cơ hội đầu tư* hiện "Đang cập nhật" (chưa có nguồn dữ liệu, không bịa) | `app/co-hoi-kinh-doanh/page.tsx` |
| `REQ-BL10-MYREQ-003` | Yêu cầu gửi khi đã đăng nhập gắn `person_id`; hội viên xem trạng thái + phản hồi tại `/portal/requests`; Admin ghi chú phản hồi | migration `20261119150000_AddContactRequestOwner`, `ContactRequestsController`, `app/portal/requests/page.tsx` |
| `BR-BL10-REQ-PRIVACY-001` | Chỉ chủ yêu cầu xem được yêu cầu của mình; yêu cầu ẩn danh không gắn tài khoản | E2E API: thấy yêu cầu có token / không thấy yêu cầu ẩn danh / ẩn danh gọi `my/*` → 401 |

**Sai khác so với kế hoạch v2**: dùng bảng `contact_requests` làm "hàng xử lý" thay vì module `case` (đủ cho đăng ký dịch vụ + kiến nghị; module `case` chưa cần). **Chưa làm**: thanh toán/vé QR/chứng nhận tham dự sự kiện, đăng ký tham gia ban, lịch họp ban, thông báo theo ngành, Zalo OA.
