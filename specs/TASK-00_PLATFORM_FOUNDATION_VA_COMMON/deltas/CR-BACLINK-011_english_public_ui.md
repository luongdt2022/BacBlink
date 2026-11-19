# CR-BACLINK-011 — Bản tiếng Anh giao diện công khai (giai đoạn 1)

**Status**: `IMPLEMENTED — phạm vi giai đoạn 1 (2026-11-19)`. **Căn cứ** `[VERIFIED]` góp ý khách hàng: *Đối tác nước ngoài tìm hiểu — phiên bản tiếng Anh đầy đủ*.

- `REQ-BL11-EN-001`: từ điển tập trung Việt→Anh `lib/constants/i18n-public.ts` (hàm `tr(lang, vi)`; chuỗi chưa dịch giữ nguyên tiếng Việt, **không bịa bản dịch**). Phủ: menu cấp 1 + toàn bộ menu con, top bar, nút Tìm kiếm/Gia nhập, chân trang, tiêu đề các khối trang chủ, trang `/hoi-vien`. Test `i18n-public.test.ts` đảm bảo mọi mục menu con và tiêu đề 8 dịch vụ đều có bản Anh.
- **Chưa phủ (giai đoạn 2, cần thêm nội dung/biên dịch chính thức)**: trang dịch vụ chi tiết, wizard gia nhập, bài viết/tài liệu CMS (cần trường tiếng Anh), hồ sơ doanh nghiệp song ngữ.
