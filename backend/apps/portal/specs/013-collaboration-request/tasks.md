# Tasks: 013-collaboration-request

**Input**: Design documents từ `specs/013-collaboration-request/`
**Prerequisites**: requirements.md ✓, design.md ✓

**Tests**: Xác nhận bằng `npm test && npm run lint` + manual smoke theo từng phase.

**Organization**: Nhóm theo user story để triển khai độc lập từng phần.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể làm song song
- **[Story]**: `US1`, `US2`, `US3`, `US4`
- Mỗi task có file path cụ thể

---

## Phase 1: API Client & Types (Shared Infrastructure)

- [x] T001 Tạo API client và TypeScript types cho collaboration request trong `src/features/collaboration/api/collaborationRequest.ts`
  - Tạo thư mục `src/features/collaboration/api/`
  - Export: `CollaborationRequest`, `CollaborationRequestStatus`, `CollaborationIntakeInfo`, `CollaborationUserInfo`, `CollaborationRequestListResponse`, `CreateCollaborationRequestBody`
  - Export functions: `createCollaborationRequest`, `getSentCollaborationRequests`, `getReceivedCollaborationRequests`, `acceptCollaborationRequest`, `rejectCollaborationRequest`, `cancelCollaborationRequest`

- [x] T002 [P] Mở rộng notification types trong `src/features/notifications/api/notification.ts`
  - Thêm payload interfaces: `CollaborationRequestReceivedPayload`, `CollaborationRequestAcceptedPayload`, `CollaborationRequestRejectedPayload`
  - Cập nhật union type `Notification.type` để bao gồm 3 type mới
  - Cập nhật union type `Notification.payload` tương ứng

---

## Phase 2: MatchCard & MatchesSection Enhancement (US1)

**Goal**: Người dùng có thể gửi yêu cầu hợp tác trực tiếp từ MatchCard.

**Independent Test**: Mở tab matching của một published intake có matches → thấy button "Gửi yêu cầu hợp tác" trên mỗi MatchCard → click → button chuyển thành "Đã gửi yêu cầu" và tất cả button còn lại bị disable.

- [x] T003 [US1] Thêm collaboration props vào `MatchCard` trong `src/features/intakes/components/MatchCard.tsx`
  - Thêm props: `parentIntakeId?`, `parentIntakeStatus?`, `isSendingRequest?`, `isRequestSent?`, `isDisabled?`, `onSendRequest?`
  - Thêm button "Gửi yêu cầu hợp tác" với icon `Send` từ lucide-react
  - Thêm trạng thái "Đã gửi yêu cầu" với icon `CheckCircle2` khi `isRequestSent === true`
  - Thêm loading state với icon `Loader2` khi `isSendingRequest === true`
  - Button `onClick` phải gọi `e.stopPropagation()` để không trigger card navigation
  - Import thêm: `Send`, `CheckCircle2`, `Loader2` từ `lucide-react`; `Button` từ `@/shared/components/ui/button`

- [x] T004 [US1] Thêm collaboration state management vào `MatchesSection` trong `src/features/intakes/components/MatchesSection.tsx`
  - Thêm props: `parentIntakeId?`, `parentIntakeStatus?`
  - Thêm state: `sentToIntakeId`, `hasPendingRequest`, `sendingToIntakeId`
  - Thêm `useEffect` để kiểm tra pending request khi mount (gọi `getSentCollaborationRequests` và filter theo `requesterIntakeId === parentIntakeId && status === 'pending'`)
  - Implement `handleSendRequest(targetIntakeId: string)` gọi `createCollaborationRequest`
  - Truyền collaboration props xuống từng `MatchCard`
  - Import: `createCollaborationRequest`, `getSentCollaborationRequests` từ `@/features/collaboration/api/collaborationRequest`; `toast` từ `sonner`

- [x] T005 [US1] Truyền `parentIntakeId` và `parentIntakeStatus` từ `IntakeDetailPage` xuống `MatchesSection` trong `src/features/intakes/pages/IntakeDetailPage.tsx`
  - Trong `TabsContent value={DETAIL_TAB_MATCHES}`, thêm props `parentIntakeId={intake.id}` và `parentIntakeStatus={intake.status}`

---

## Phase 3: Collaboration Request Pages (US2 + US3)

**Goal**: Người dùng có thể xem, hủy (US2) và accept/reject (US3) yêu cầu hợp tác.

**Independent Test**: Truy cập `/my/collaboration-requests` → thấy 2 tab → tab "Đã gửi" hiển thị danh sách với button "Hủy" cho pending → tab "Nhận được" hiển thị danh sách với button "Chấp nhận"/"Từ chối".

- [x] T006 [US2][US3] Tạo component `CollaborationRequestCard` trong `src/features/collaboration/components/CollaborationRequestCard.tsx`
  - Props: `request: CollaborationRequest`, `mode: 'sent' | 'received'`, `onCancel?`, `onAccept?`, `onReject?`, `isActioning?: boolean`
  - Hiển thị: tiêu đề requesterIntake, tiêu đề targetIntake, badge trạng thái, thời gian tạo (dùng `formatRelativeTime` từ `@/features/notifications/utils/formatRelativeTime`)
  - Badge màu: pending=yellow, accepted=green, rejected=red, cancelled=gray
  - Actions theo mode và status:
    - `mode=sent` + `pending`: button "Hủy yêu cầu"
    - `mode=received` + `pending`: button "Chấp nhận" + "Từ chối"
  - Tạo thư mục `src/features/collaboration/components/`

- [x] T007 [US3] Tạo component `MatchedIntakesInfo` trong `src/features/collaboration/components/MatchedIntakesInfo.tsx`
  - Props: `requesterIntake: CollaborationIntakeInfo`, `targetIntake: CollaborationIntakeInfo`
  - Hiển thị thông tin công khai của cả 2 intake: title, type badge, sectors, aiProcessedContent (hoặc content nếu không có)
  - Layout: 2 cột trên desktop, stack trên mobile (dùng Tailwind responsive)

- [x] T008 [US2] Tạo component `SentRequestsTab` trong `src/features/collaboration/components/SentRequestsTab.tsx`
  - Gọi `getSentCollaborationRequests(page)` khi mount và khi `page` thay đổi
  - State: `requests`, `isLoading`, `page`, `total`, `totalPages`, `cancellingId`
  - Implement `handleCancel(id)` gọi `cancelCollaborationRequest` với optimistic update
  - Hiển thị danh sách `CollaborationRequestCard` với `mode="sent"`
  - Pagination: prev/next buttons khi `totalPages > 1`
  - Empty state: icon + text "Bạn chưa gửi yêu cầu hợp tác nào"
  - Loading skeleton: 3 placeholder cards

- [x] T009 [US3] Tạo component `ReceivedRequestsTab` trong `src/features/collaboration/components/ReceivedRequestsTab.tsx`
  - Gọi `getReceivedCollaborationRequests(page)` khi mount và khi `page` thay đổi
  - State: `requests`, `isLoading`, `page`, `total`, `totalPages`, `actioningId`
  - Implement `handleAccept(id)` gọi `acceptCollaborationRequest` với optimistic update + refresh list
  - Implement `handleReject(id)` gọi `rejectCollaborationRequest` với optimistic update
  - Hiển thị `MatchedIntakesInfo` inline khi request có `status === 'accepted'` và có đủ intake data
  - Hiển thị danh sách `CollaborationRequestCard` với `mode="received"`
  - Pagination: prev/next buttons khi `totalPages > 1`
  - Empty state: icon + text "Bạn chưa nhận được yêu cầu hợp tác nào"
  - Loading skeleton: 3 placeholder cards

- [x] T010 [US2][US3] Tạo page `CollaborationRequestsPage` trong `src/features/collaboration/pages/CollaborationRequestsPage.tsx`
  - Đọc `?tab=sent|received` từ URL search params (default: `sent`)
  - Khi tab thay đổi, cập nhật URL search param
  - Layout: header "Yêu cầu hợp tác", `Tabs` với 2 `TabsTrigger` và 2 `TabsContent`
  - Dùng `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` từ `@/shared/components/ui/tabs`
  - Tạo thư mục `src/features/collaboration/pages/`

---

## Phase 4: Routing (US2 + US3)

**Goal**: Route `/my/collaboration-requests` hoạt động trong app.

- [x] T011 Thêm route `/my/collaboration-requests` vào router trong `src/app/router/routes.tsx`
  - Import `CollaborationRequestsPage` từ `@/features/collaboration/pages/CollaborationRequestsPage`
  - Thêm `<Route path="my/collaboration-requests" element={<CollaborationRequestsPage />} />` bên trong `RequireAuth > RootLayout`

---

## Phase 5: Notification Integration (US4)

**Goal**: 3 notification type mới hiển thị đúng và navigate đúng trang.

**Independent Test**: Tạo một collaboration request từ backend seed → mở Notification Panel → thấy notification với message phù hợp → click → navigate đến `/my/collaboration-requests?tab=received`.

- [x] T012 [US4] Xác nhận `NotificationPanel` hoạt động đúng với 3 type mới trong `src/features/notifications/components/NotificationPanel.tsx`
  - Kiểm tra `handleItemClick` đã dùng `n.payload?.navigationPath` — không cần sửa logic navigate
  - Nếu cần visual indicator riêng cho collaboration notifications, thêm icon/color mapping theo `n.type`
  - Đây là task verification/enhancement nhẹ, không phải rewrite

---

## Phase 6: Polish & Validation

- [x] T013 Chạy `npm test && npm run lint` từ `/home/zen/projects/dmst-user`
- [ ] T014 Manual smoke test toàn bộ flow:
  - Gửi request từ MatchCard → verify disable state
  - Truy cập `/my/collaboration-requests?tab=sent` → verify list + cancel
  - Truy cập `/my/collaboration-requests?tab=received` → verify accept/reject
  - Click notification → verify navigation
  - Test edge cases: duplicate pending, cancel rồi gửi lại

---

## Dependencies & Execution Order

```
Phase 1 (T001, T002 song song)
  → Phase 2 (T003 → T004 → T005, sequential)
  → Phase 3 (T006 → T007 → T008/T009 song song → T010)
  → Phase 4 (T011)
  → Phase 5 (T012)
  → Phase 6 (T013, T014)
```

## Parallel Opportunities

- T001 và T002 (Phase 1)
- T008 và T009 (Phase 3, sau khi T006 và T007 xong)

## Implementation Notes

- Tất cả component mới dùng Tailwind CSS + shadcn/ui, không import thư viện mới.
- Dùng `toast` từ `sonner` cho tất cả feedback messages.
- Dùng `formatRelativeTime` từ `@/features/notifications/utils/formatRelativeTime` cho thời gian.
- Không dùng global state — mỗi component tự quản lý state local.
- Optimistic updates: cập nhật local state ngay sau action thành công.
- Error handling: mọi API error đều hiển thị toast, không crash UI.
