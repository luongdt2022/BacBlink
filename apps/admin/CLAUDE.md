# [Nacentech] PoC DMST - Admin Role.1 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-25

## Active Technologies

- TypeScript 5 / React 18 + React, Tailwind CSS, shadcn/ui (Button, AlertDialog), Lucide React, React Router DOM (001-update-pagination-component)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5 / React 18: Follow standard conventions

## Recent Changes

- 001-update-pagination-component: Added TypeScript 5 / React 18 + React, Tailwind CSS, shadcn/ui (Button, AlertDialog), Lucide React, React Router DOM

<!-- MANUAL ADDITIONS START -->

## Mô tả sản phẩm và sổ lỗi

Hành vi của bảng quản trị được mô tả đầy đủ ở `../../../docs-v2/`. **Đọc trước khi sửa bất cứ thứ gì:**

- [`docs-v2/BAN-GIAO.md`](../../../docs-v2/BAN-GIAO.md) — xây gì, theo thứ tự nào, quyết định phải ra trước
- [`docs-v2/HUONG-DAN-TRIEN-KHAI.md`](../../../docs-v2/HUONG-DAN-TRIEN-KHAI.md) — mã đặt ở đâu, client v2, năm cái bẫy đã đo
- [`docs-v2/admin/`](../../../docs-v2/admin/) — 8 tài liệu mô tả từng màn hình hiện có
- [`docs-v2/moi/`](../../../docs-v2/moi/) — 8 màn hình còn thiếu, đã đặc tả
- [`docs-v2/bug-triage.md`](../../../docs-v2/bug-triage.md) — 34 mục lỗi. Sửa cái nào thì cập nhật dòng đó **cùng PR**.
- [`docs-v2/verification/admin.md`](../../../docs-v2/verification/admin.md) — 422 mục nghiệm thu cho repo này

Lỗi mức cao đang mở ở repo này: tạo người dùng luôn thất bại (B-25), nút "Khoá tài khoản" gọi lệnh xoá (B-26 — **sửa trước B-02**).

<!-- MANUAL ADDITIONS END -->
