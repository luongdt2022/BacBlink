# [Nacentech] PoC DMST - User Role.1 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-14

## Active Technologies
- TypeScript (NestJS backend), TypeScript + React 18 (frontend) + NestJS, TypeORM, PostgreSQL, bcrypt, class-validator (backend); React 18, Vite, Tailwind CSS, shadcn/ui, lucide-react, sonner (frontend) (001-user-password-change)
- PostgreSQL via TypeORM; user passwords stored as bcrypt hashes (001-user-password-change)
- TypeScript 5.9 + React 18 + React Router, Tailwind CSS, lucide-react, existing intake API client, existing marketplace cards and filter components (009-marketplace-live-data)
- N/A - frontend reads existing backend APIs only (009-marketplace-live-data)
- TypeScript 5.9 + React 18 + React Router, Tailwind CSS, shadcn/ui, lucide-react, existing shared layout/navigation components (011-responsive-shared-design)
- N/A - UI layout/design behavior only (011-responsive-shared-design)
- TypeScript 5.9 + React 18 + React Router, Tailwind CSS, shadcn/ui, lucide-react, sonner, existing intake API client (012-split-ip-challenge-routes)
- N/A - thay đổi frontend routing/navigation, không đổi persistence (012-split-ip-challenge-routes)
- TypeScript / React 18+ + Tailwind CSS 4.x, Lucide React, Shadcn UI (Radix), Vite (013-ui-refactor-minimalist)
- N/A (Pure UI/UX change) (013-ui-refactor-minimalist)

- TypeScript (NestJS backend), TypeScript + React 18 (frontend) + NestJS, TypeORM, PostgreSQL, bcrypt, class-validator (backend); React 18, Vite, Tailwind CSS, shadcn/ui, lucide-react (frontend) (001-user-password-change)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (NestJS backend), TypeScript + React 18 (frontend): Follow standard conventions

## Recent Changes
- 014-tri-part-layout-header: Added TypeScript / React 18+ + Tailwind CSS 4.x, Lucide React, Shadcn UI
- 013-ui-refactor-minimalist: Added TypeScript / React 18+ + Tailwind CSS 4.x, Lucide React, Shadcn UI (Radix), Vite
- 012-split-ip-challenge-routes: Added TypeScript 5.9 + React 18 + React Router, Tailwind CSS, shadcn/ui, lucide-react, sonner, existing intake API client


<!-- MANUAL ADDITIONS START -->

## Mô tả sản phẩm và sổ lỗi

Hành vi của cổng người dùng được mô tả đầy đủ ở `../../docs/02-requirements/san-pham-v2/`. **Đọc trước khi sửa bất cứ thứ gì:**

- [`san-pham-v2/BAN-GIAO.md`](../../docs/02-requirements/san-pham-v2/BAN-GIAO.md) — xây gì, theo thứ tự nào
- [`san-pham-v2/HUONG-DAN-TRIEN-KHAI.md`](../../docs/02-requirements/san-pham-v2/HUONG-DAN-TRIEN-KHAI.md) — mã đặt ở đâu, client v2, năm cái bẫy đã đo
- [`san-pham-v2/portal/`](../../docs/02-requirements/san-pham-v2/portal/) — 9 tài liệu mô tả từng khu vực
- [`san-pham-v2/bug-triage.md`](../../docs/02-requirements/san-pham-v2/bug-triage.md) — 34 mục lỗi. Sửa cái nào thì cập nhật dòng đó **cùng PR**.
- [`san-pham-v2/verification/portal-va-landing.md`](../../docs/02-requirements/san-pham-v2/verification/portal-va-landing.md) — 332 mục nghiệm thu

Lỗi mức cao đang mở ở repo này: không có nhánh xử lý 401 (B-12), `/contact` báo gửi thành công cho tin nhắn bị vứt (B-15). Năm khu vực là vỏ không backend; bốn trong năm đã được gỡ khỏi định tuyến có chủ đích — đừng mở lại khi chưa có API.

<!-- MANUAL ADDITIONS END -->
