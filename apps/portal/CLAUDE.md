# [Nacentech] PoC DMST - User Role.1 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-15

## Active Technologies
- TypeScript (NestJS backend), TypeScript + React 18 (frontend) + NestJS, TypeORM, PostgreSQL, bcrypt, class-validator (backend); React 18, Vite, Tailwind CSS, shadcn/ui, lucide-react, sonner (frontend) (001-user-password-change)
- PostgreSQL via TypeORM; user passwords stored as bcrypt hashes (001-user-password-change)
- TypeScript 5.9 (strict) + React 18, React Router 6, shadcn/ui, Tailwind CSS, sonner (toasts), lucide-react (icons) (004-user-settings-screen)
- No local storage — state fetched from backend on mount, written on toggle (004-user-settings-screen)
- N/A — no local state persistence; data fetched on page mount (005-manual-intake-match)
- TypeScript 5.9 (strict) + React 18 + Tailwind CSS, shadcn/ui, lucide-react, sonner (006-intake-form-ux)
- N/A (no local persistence — state driven by backend API on load/save) (006-intake-form-ux)
- TypeScript 5.9 (strict) + React 18 + Tailwind CSS, shadcn/ui, lucide-react (`Bell` icon), sonner (toasts) (007-notification-center)
- N/A — all state in-memory; no local persistence (007-notification-center)
- TypeScript 5.9 (strict) + React 18 + React Router 6, lucide-react, sonner, shadcn/ui (012-split-ip-challenge-routes)
- N/A (backend-driven, frontend chỉ gọi API) (012-split-ip-challenge-routes)
- TypeScript 5.9 (strict) + React 18 (frontend); TypeScript + NestJS (backend) + React Router 6, shadcn/ui, Tailwind CSS, lucide-react, sonner, Axios, RichTextEditor (shared component) (015-success-failure-stories)

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
- 015-success-failure-stories: Added TypeScript 5.9 (strict) + React 18 (frontend); TypeScript + NestJS (backend) + React Router 6, shadcn/ui, Tailwind CSS, lucide-react, sonner, Axios, RichTextEditor (shared component)
- 012-split-ip-challenge-routes: Added TypeScript 5.9 (strict) + React 18 + React Router 6, lucide-react, sonner, shadcn/ui
- 007-notification-center: Added TypeScript 5.9 (strict) + React 18 + Tailwind CSS, shadcn/ui, lucide-react (`Bell` icon), sonner (toasts)


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
