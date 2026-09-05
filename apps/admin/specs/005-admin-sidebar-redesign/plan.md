# Implementation Plan: Admin Sidebar Redesign

**Branch**: `005-admin-sidebar-redesign` | **Date**: 2026-05-14 | **Spec**: [specs/005-admin-sidebar-redesign/spec.md](specs/005-admin-sidebar-redesign/spec.md)
**Input**: Feature specification from `specs/005-admin-sidebar-redesign/spec.md`

## Summary

Refactor `DashboardLayout.tsx` để thay thế header sidebar cũ (icon "Đ" + text "Hệ thống ĐMST") bằng logo Nacentech chính thức, đồng bộ màu sắc active/hover state sang brand Deep Teal, và đơn giản hóa phần user section cuối sidebar.

## Technical Context

**Language/Version**: TypeScript / React 18+
**Primary Dependencies**: Tailwind CSS 4.x, Lucide React, React Router
**Storage**: N/A
**Testing**: N/A — UI-only visual change, verified by visual inspection
**Target Platform**: Web (desktop-first)
**Project Type**: Web application (admin frontend)
**Performance Goals**: No change to performance
**Constraints**: Chỉ thay đổi styling — không thay đổi logic, routing, hay auth.
**Scale/Scope**: 1 file chính (`DashboardLayout.tsx`)

## Constitution Check

- [x] **Simplicity**: Chỉ thay đổi 1 file, không thêm dependencies hay abstractions mới.
- [x] **No breaking changes**: Logic navigation, auth, và routing giữ nguyên hoàn toàn.
- [x] **Brand consistency**: Dùng design tokens (`--primary`) đã có từ theme.css.

## Project Structure

### Documentation (this feature)

```text
specs/005-admin-sidebar-redesign/
├── plan.md              # This file
├── research.md          # N/A — decisions straightforward
├── tasks.md             # Phase 2 output
└── checklists/
    └── requirements.md
```

### Source Code (target files)

```text
src/
└── shared/
    └── layout/
        └── DashboardLayout.tsx   # Primary target — sidebar header, nav items, user section
public/
└── logo/
    └── NACENTECH_Main-Logo-G.png # Already present
```

## Phase 0: Research

Không cần research — tất cả quyết định đã rõ ràng:
- Logo: `NACENTECH_Main-Logo-G.png` đã có sẵn.
- Colors: `--primary: #137f79` đã set trong `theme.css`.
- Reference design: dmst-user `Sidebar.tsx` là nguồn tham chiếu.

## Phase 1: Design

### Header replacement
- Bỏ `div.flex.h-10.w-10.bg-brand` icon "Đ"
- Thêm `<img src="/logo/NACENTECH_Main-Logo-G.png">` với sizing phù hợp
- Thêm tagline "Nền tảng đổi mới sáng tạo"

### Nav item color fix
- Active: `bg-primary` (thay `bg-brand`) + `shadow-[0_4px_12px_rgba(19,127,121,0.25)]` (teal shadow)
- Hover: `hover:bg-primary/8 hover:text-primary` (thay `hover:bg-slate-100`)
- Active icon bg: `bg-primary-foreground/20` (thay `bg-white/16`)

### User section simplification
- Bỏ `div.rounded-2xl.border.bg-slate-50/80.p-3` wrapper card
- Layout trực tiếp: avatar + name/role + logout button theo kiểu flat

## Phase 2: Implementation Summary

1 task duy nhất: Cập nhật `src/shared/layout/DashboardLayout.tsx`.
