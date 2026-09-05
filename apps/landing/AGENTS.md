# dmst-landing-page Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-13

## Active Technologies

- (002-brand-identity-update)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for

## Code Style

: Follow standard conventions

## Recent Changes

- 002-brand-identity-update: Added

<!-- MANUAL ADDITIONS START -->

## Mô tả sản phẩm và sổ lỗi

Hành vi của trang giới thiệu được mô tả ở [`docs-v2/landing/trang-chu-va-cau-chuyen.md`](../../../docs-v2/landing/trang-chu-va-cau-chuyen.md).

- [`docs-v2/bug-triage.md`](../../../docs-v2/bug-triage.md) — 34 mục lỗi. Sửa cái nào thì cập nhật dòng đó **cùng PR**.
- [`docs-v2/verification/portal-va-landing.md`](../../../docs-v2/verification/portal-va-landing.md) — mục `LANDING-*`

Lỗi đang mở ở repo này: năm nút kêu gọi trỏ về hệ NacenTwin cũ (B-21), trang có thể trắng khi tác giả câu chuyện không tra được (B-22), thông tin liên hệ lệch với cổng người dùng (B-23).

Cảnh báo khi dựng: repo này chạy ở cổng thứ ba, ngoài hai địa chỉ mà `Cors:Origins` của backend cho phép mặc định. Không thêm nó vào cấu hình thì mục câu chuyện biến mất — đúng triệu chứng của lỗi đang đi tìm.

<!-- MANUAL ADDITIONS END -->
