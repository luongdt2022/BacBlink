# Quickstart: Stories Feature

## Files to create

### Frontend

```
src/features/stories/
├── api/
│   └── story.ts               # Interfaces + API functions (CRUD)
├── pages/
│   ├── StoriesPage.tsx         # List page — my stories + all published
│   ├── StoryFormPage.tsx       # Create/edit form (shared)
│   ├── CreateStoryPage.tsx     # Thin wrapper → StoryFormPage (isEdit=false)
│   ├── EditStoryPage.tsx       # Thin wrapper → StoryFormPage (isEdit=true)
│   └── StoryDetailPage.tsx     # Read-only detail view
└── index.ts                   # Re-exports
```

### Files to modify

| File | Change |
|------|--------|
| `src/app/router/routes.tsx` | Add 4 story routes |
| `src/app/config/routes.ts` | Add `stories: '/stories'` to `MENU_ID_TO_PATH` + `pathToActiveItem` |
| `src/shared/components/navigation/Sidebar.tsx` | Add "Câu chuyện" menu item |

---

## StoryFormPage — Form fields

```
┌─────────────────────────────────────────────────┐
│ ← Quay lại                                      │
│                                                  │
│ [Tiêu đề *]                                     │
│  Input text, placeholder "Nhập tiêu đề..."      │
│                                                  │
│ [Loại câu chuyện *]                             │
│  Select: Thành công / Thất bại - Bài học rút ra │
│                                                  │
│ [Nội dung *]                                    │
│  RichTextEditor                                  │
│                                                  │
│ [Bài học rút ra *] ← chỉ hiện khi type=failure  │
│  RichTextEditor                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│ Trạng thái:  ○ Nháp  ●  Công khai  (toggle)    │
│                              [ Lưu ]            │
└─────────────────────────────────────────────────┘
```

---

## Key implementation notes

1. **`lesson` field**: render/require conditionally based on `type === 'failure'`
2. **Toggle status**: dùng pattern giống StatusBadge trong intake — 2 button radio-style
3. **RichTextEditor**: import từ `@/shared/components/ui/rich-text-editor`
4. **API base**: `${API_BASE_PATH}/stories` — dùng `apiClient` như intake.ts
5. **List page**: tabs "Nháp" / "Đã đăng" / "Tất cả" — filter `status` param
6. **Routing**: `/stories` → list, `/stories/create` → tạo mới, `/stories/:id` → detail, `/stories/:id/edit` → sửa
