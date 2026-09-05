# Implementation Plan: Success & Failure Stories

**Branch**: `015-success-failure-stories` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)

## Summary

Xây dựng tính năng "Câu chuyện thành công / thất bại" cho phép người dùng tạo và chia sẻ câu chuyện với rich text editor. Bao gồm: frontend (list, form, detail), backend REST API (CRUD + visibility), và tích hợp vào sidebar/routing hiện tại.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict) + React 18 (frontend); TypeScript + NestJS (backend)
**Primary Dependencies**: React Router 6, shadcn/ui, Tailwind CSS, lucide-react, sonner, Axios, RichTextEditor (shared component)
**Storage**: PostgreSQL via TypeORM
**Testing**: N/A (PoC — không yêu cầu test suite)
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application — monorepo có backend riêng (dmst-admin/backend)
**Performance Goals**: Danh sách tải < 2s, form save < 1s feedback
**Constraints**: Tái sử dụng components/patterns hiện có; không thêm dependency mới
**Scale/Scope**: PoC — vài chục câu chuyện ban đầu

## Constitution Check

Constitution file chưa được cấu hình (template blank) — không có gates cụ thể cần pass. Áp dụng nguyên tắc chung của dự án: tái sử dụng pattern hiện có, không over-engineer.

## Project Structure

### Documentation (this feature)

```text
specs/015-success-failure-stories/
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 output
├── data-model.md        ✅ Phase 1 output
├── quickstart.md        ✅ Phase 1 output
├── contracts/
│   └── api.md           ✅ Phase 1 output
└── tasks.md             ⬜ Phase 2 output (/speckit.tasks)
```

### Source Code

```text
# Frontend (this repo)
src/features/stories/
├── api/
│   └── story.ts
├── pages/
│   ├── StoriesPage.tsx
│   ├── StoryFormPage.tsx
│   ├── CreateStoryPage.tsx
│   ├── EditStoryPage.tsx
│   └── StoryDetailPage.tsx
└── index.ts

# Modified files
src/app/router/routes.tsx          # +4 routes
src/app/config/routes.ts           # +stories entry
src/shared/components/navigation/Sidebar.tsx  # +1 menu item

# Backend (separate repo — dmst-admin or dmst-backend)
src/stories/
├── story.entity.ts
├── stories.module.ts
├── stories.controller.ts
├── stories.service.ts
├── dto/
│   ├── create-story.dto.ts
│   └── update-story.dto.ts
└── stories.module.ts
```

**Structure Decision**: Pattern frontend feature directory (api/ + pages/) — giống intakes. Backend theo NestJS module pattern chuẩn.

## Implementation Phases

### Phase A: Backend API

1. Tạo Story entity (TypeORM) theo data-model.md
2. Tạo DTOs với class-validator (CreateStoryDto, UpdateStoryDto)
3. Tạo StoriesService: CRUD + visibility toggle + phân quyền
4. Tạo StoriesController: routes theo contracts/api.md
5. Register StoriesModule vào AppModule

### Phase B: Frontend — API Layer

1. Tạo `src/features/stories/api/story.ts`:
   - TypeScript interfaces (Story, StoryListItem, CreateStoryRequest, ...)
   - Functions: `getStories`, `getMyStories`, `getStoryById`, `createStory`, `updateStory`, `deleteStory`

### Phase C: Frontend — Pages

1. **StoryFormPage** (Create/Edit):
   - Input: tiêu đề
   - Select: loại (Thành công / Thất bại)
   - RichTextEditor: nội dung chính
   - RichTextEditor: bài học rút ra (conditional — chỉ hiện khi type=failure)
   - Toggle: Nháp / Công khai + nút Lưu

2. **StoriesPage** (List):
   - Tabs: Tất cả / Nháp / Đã đăng
   - Filter by type (select dropdown)
   - Table/card list với pagination
   - Actions: Xem, Sửa, Xóa

3. **StoryDetailPage** (Read-only):
   - Hiển thị tiêu đề, loại badge, nội dung (rendered rich text)
   - "Bài học rút ra" section (nếu có)
   - Nút Chỉnh sửa + Xóa (owner)

4. **CreateStoryPage / EditStoryPage**: thin wrappers

### Phase D: Routing & Navigation

1. Thêm routes vào `routes.tsx`
2. Thêm `stories` vào `MENU_ID_TO_PATH` + `pathToActiveItem`
3. Thêm menu item "Câu chuyện" vào Sidebar (icon: `BookOpen` từ lucide-react)
