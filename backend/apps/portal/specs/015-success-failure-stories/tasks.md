# Tasks: Success & Failure Stories

**Input**: Design documents from `/specs/015-success-failure-stories/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅ | quickstart.md ✅

**Organization**: Tasks grouped by user story — each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label from spec.md (US1–US4)
- Paths follow the project structure from plan.md

---

## Phase 1: Setup (Feature Directory)

**Purpose**: Khởi tạo cấu trúc thư mục feature

- [x] T001 Create feature directory structure: `src/features/stories/api/`, `src/features/stories/pages/`

---

## Phase 2: Foundational — Backend API (US4, P1)

**Purpose**: Backend REST API phải hoàn thành trước khi frontend có thể gọi bất kỳ dữ liệu nào

**⚠️ CRITICAL**: Frontend pages không thể hoàn chỉnh khi thiếu API này

- [ ] T002 [US4] Create Story entity with all fields per data-model.md in `backend/src/stories/story.entity.ts`
- [ ] T003 [P] [US4] Create `CreateStoryDto` with class-validator decorators in `backend/src/stories/dto/create-story.dto.ts`
- [ ] T004 [P] [US4] Create `UpdateStoryDto` (PartialType of CreateStoryDto) in `backend/src/stories/dto/update-story.dto.ts`
- [ ] T005 [US4] Implement `StoriesService`: getAll (pagination + filter), getById, create, update, delete, toggleVisibility in `backend/src/stories/stories.service.ts`
- [ ] T006 [US4] Implement `StoriesController` with all 6 endpoints per contracts/api.md in `backend/src/stories/stories.controller.ts`
- [ ] T007 [US4] Create `StoriesModule` and register in `AppModule` in `backend/src/stories/stories.module.ts`

**Checkpoint**: Test API với Postman/curl — tạo, đọc, cập nhật, xóa, toggle visibility hoạt động đúng

---

## Phase 3: Frontend API Layer (US4)

**Purpose**: TypeScript interfaces + API functions để pages gọi backend

- [x] T008 [US4] Create `src/features/stories/api/story.ts` with: Story/StoryListItem/CreateStoryRequest/UpdateStoryRequest/StoryListParams interfaces + getMyStories/getStories/getStoryById/createStory/updateStory/deleteStory functions

**Checkpoint**: Import được từ pages, TypeScript không báo lỗi

---

## Phase 4: US1 — Người dùng tạo câu chuyện (P1) 🎯 MVP

**Goal**: Người dùng có thể tạo và chỉnh sửa câu chuyện với rich text

**Independent Test**: Đăng nhập → tạo câu chuyện loại "Thất bại" → điền đủ 3 trường → toggle "Công khai" → Lưu → câu chuyện xuất hiện trong danh sách

- [x] T009 [US1] Create `StoryFormPage` in `src/features/stories/pages/StoryFormPage.tsx`:
  - Input tiêu đề (required, max 255)
  - Select loại: Thành công / Thất bại (shadcn/ui Select, custom styled như đã fix)
  - RichTextEditor cho nội dung chính (required)
  - RichTextEditor cho "Bài học rút ra" (conditional — chỉ render và require khi type=failure)
  - Toggle trạng thái Nháp / Công khai + nút Lưu ở bottom bar
  - Handle create (POST) và edit (PUT) mode qua prop `isEdit`
- [x] T010 [P] [US1] Create `CreateStoryPage` thin wrapper in `src/features/stories/pages/CreateStoryPage.tsx`
- [x] T011 [P] [US1] Create `EditStoryPage` thin wrapper in `src/features/stories/pages/EditStoryPage.tsx`

**Checkpoint**: Tạo câu chuyện thành công, validation hoạt động (tiêu đề rỗng / lesson thiếu khi failure)

---

## Phase 5: US3 — Xem danh sách và chi tiết (P2)

**Goal**: Người dùng duyệt, lọc và đọc câu chuyện

**Independent Test**: Vào `/stories` → thấy danh sách → lọc theo "Thất bại" → click vào 1 câu chuyện → đọc nội dung đầy đủ

- [x] T012 [US3] Create `StoriesPage` in `src/features/stories/pages/StoriesPage.tsx`:
  - Tabs: Tất cả / Nháp / Đã công bố
  - Filter dropdown theo loại (Thành công / Thất bại)
  - Table/card list với STT, tiêu đề, loại, trạng thái, ngày tạo
  - Actions: Xem, Sửa, Xóa (với DeleteConfirmModal)
  - Pagination (20 items/page)
  - Nút "Tạo câu chuyện" navigate đến `/stories/create`
- [x] T013 [US3] Create `StoryDetailPage` in `src/features/stories/pages/StoryDetailPage.tsx`:
  - Header: tiêu đề, badge loại, badge trạng thái, ngày tạo
  - Rendered rich text cho nội dung (ViewOnlyMDX hoặc tương đương)
  - Section "Bài học rút ra" (chỉ hiện khi type=failure và lesson có data)
  - Nút Chỉnh sửa (owner) + Xóa (owner) với xác nhận

**Checkpoint**: Danh sách load đúng, filter hoạt động, detail hiển thị nội dung rich text

---

## Phase 6: US2 — Admin quản lý (P1)

**Goal**: Admin có thể ẩn/hiện câu chuyện (backend đã có tại T005–T006)

**Note**: Admin UI nằm ở repo `dmst-admin` — ngoài phạm vi repo này.  
Backend endpoint `PATCH /api/v1/stories/:id/visibility` đã được implement ở Phase 2 (T005, T006).

- [x] T014 [US2] Add `toggleStoryVisibility(id, isHidden)` function to `src/features/stories/api/story.ts` (admin-facing, sử dụng khi cần expose cho admin panel trong repo này)

---

## Phase 7: Routing & Navigation

**Purpose**: Kết nối pages vào router và sidebar

- [x] T015 Add story routes to `src/app/router/routes.tsx`: `/stories`, `/stories/create`, `/stories/:id`, `/stories/:id/edit`
- [x] T016 Add `stories: '/stories'` to `MENU_ID_TO_PATH` and update `pathToActiveItem` in `src/app/config/routes.ts`
- [x] T017 Add "Câu chuyện" menu item (icon: `BookOpen` from lucide-react) to `menuItems` array in `src/shared/components/navigation/Sidebar.tsx`
- [x] T018 Create `src/features/stories/index.ts` re-exporting pages and API functions

---

## Phase 8: Polish

- [ ] T019 [P] Validate Select dropdown styling in StoryFormPage matches project style (border, no teal hover — per existing fixes in IntakeFormPage)
- [ ] T020 [P] Verify "Bài học rút ra" field shows/hides correctly on type toggle without losing entered content
- [ ] T021 Smoke test full flow: tạo → xem danh sách → xem detail → sửa → xóa

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Bắt đầu ngay
- **Phase 2 (Backend)**: Sau Phase 1 — blocks Phase 3
- **Phase 3 (Frontend API)**: Sau Phase 2
- **Phase 4 (US1 Form)**: Sau Phase 3
- **Phase 5 (US3 List/Detail)**: Sau Phase 3, có thể song song với Phase 4
- **Phase 6 (US2 Admin)**: Sau Phase 3
- **Phase 7 (Routing)**: Sau Phase 4+5 hoàn thành (cần pages tồn tại)
- **Phase 8 (Polish)**: Cuối cùng

### User Story Dependencies

- **US4 (P1)**: Foundation — không phụ thuộc story nào
- **US1 (P1)**: Sau US4 backend
- **US3 (P2)**: Sau US4 backend, song song được với US1
- **US2 (P1)**: Backend đã có trong US4; admin UI ở repo khác

### Parallel Opportunities

```
Phase 1 → Phase 2 (sequential — foundation)
Phase 2 → Phase 3 (sequential — need backend first)

Phase 3 done:
  ├─ T009 (StoryFormPage)     ─┐
  ├─ T010 (CreateStoryPage)   ─┤ Phase 4 parallel
  ├─ T011 (EditStoryPage)     ─┘
  ├─ T012 (StoriesPage)       ─┐ Phase 5 parallel with Phase 4
  └─ T013 (StoryDetailPage)   ─┘

Phase 7: T015, T016, T017, T018 — all parallel (different files)
Phase 8: T019, T020 — parallel
```

---

## Implementation Strategy

### MVP (US1 + US4 only — tạo và sửa câu chuyện)

1. Phase 1: Setup
2. Phase 2: Backend API (T002–T007)
3. Phase 3: Frontend API layer (T008)
4. Phase 4: StoryFormPage + wrappers (T009–T011)
5. Phase 7: Routing (T015–T018)
6. **Demo**: Người dùng tạo và sửa câu chuyện được

### Full Delivery

Thêm Phase 5 (list + detail) → Phase 6 (admin visibility) → Phase 8 (polish)

---

## Summary

| Phase | Tasks | User Story | Can Parallel |
|-------|-------|-----------|--------------|
| 1 Setup | T001 | — | No |
| 2 Backend | T002–T007 | US4 | T003, T004 |
| 3 Frontend API | T008 | US4 | No |
| 4 Create/Edit | T009–T011 | US1 | T010, T011 |
| 5 List/Detail | T012–T013 | US3 | With Phase 4 |
| 6 Admin | T014 | US2 | Yes |
| 7 Routing | T015–T018 | — | T015–T018 all |
| 8 Polish | T019–T021 | — | T019, T020 |

**Total**: 21 tasks | **MVP**: T001–T011 + T015–T018 (15 tasks)
