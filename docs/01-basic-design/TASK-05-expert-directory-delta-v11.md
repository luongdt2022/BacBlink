# Basic Design Addendum — TASK-05 Delta v11

**Nguồn Basic Design có thẩm quyền:** [`Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/README.md`](../../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/README.md), mục 2.3. Wireframe: [`wireframe_danh_ba_chuyen_gia_v11.html`](../../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN/wireframe_danh_ba_chuyen_gia_v11.html).

## Quyết định nghiệp vụ

- Bộ lọc ngành lấy danh mục `SECTOR` active từ API/DB; UI hiển thị đúng số mục thực nhận. PO xác nhận baseline đã chuẩn hóa 10 ngành, nhưng runtime count là nguồn sự thật.
- Địa bàn chỉ lọc theo mã tỉnh có nguồn công khai xác thực và scope tỉnh đã duyệt của chuyên gia; không tự gán tỉnh mặc định.
- Danh bạ chỉ chiếu hồ sơ public/approved và không để lộ PII thuộc danh sách cấm.
- Desktop giảm chiều cao hero, gom tìm kiếm và bộ lọc; mobile dùng bộ lọc mở theo nhu cầu. Card ưu tiên thông tin định danh công khai và CTA.
- Loading, Empty, Error/Retry, Success, Updating đều có thiết kế; control chỉ xuất hiện khi lọc/thao tác thật.
- CTA kết nối báo đã tiếp nhận chỉ khi API thành công, và nói rõ NacenTech/admin điều phối.

## Bề mặt

`/experts` là màn hình chính; `/chuyen-gia` là alias điều hướng; `/experts/[expertCode]` là điểm đến của CTA xem hồ sơ. Owner workspace, admin operations và Zalo không đổi phạm vi Delta v11.

## Trạng thái

Đã đồng bộ quyết định với Basic Design nguồn và wireframe v11. Visual/functional acceptance còn chờ Gate 4 trên môi trường chạy thật.

## Delta v12 — Dùng taxonomy ngành động toàn hệ thống

Theo xác nhận scope mở rộng của PO ngày 07/10/2026, mọi bề mặt ngành trên Web và API phải đọc taxonomy runtime từ DB. Áp dụng cho trang chủ, directory/detail chuyên gia, wizard nâng hạng và AI CV parser, quản trị danh mục/ma trận, gán scope SECTOR, GOV/dashboard/nav/login. Count chỉ lấy từ response; không có mảng/số đếm fallback. Admin create phải ghi DB thành công rồi mới cập nhật giao diện. Taxonomy trống/lỗi hiển thị state tương ứng.

Danh mục SECTOR là nguồn duy nhất cho ngành. TT17 subsector đọc taxonomy CATEGORY. Seed hiện hành giữ vai trò bootstrap DB. Mapping LV-CN là dữ liệu quan hệ cấu hình riêng; tên hiển thị phải resolve bằng SECTOR hiện hành, không dùng label cache tĩnh.


### Cross-channel audit v12 - Zalo

Quick-intake consumes active SECTOR taxonomy through GET /api/v1/sectors. Remove the fixed 18-sector list and default code 01; require explicit selection, show loading/empty/error with retry, reject inactive codes before submit. Preserve the endpoint/payload. Task T108 remains open until verified.
