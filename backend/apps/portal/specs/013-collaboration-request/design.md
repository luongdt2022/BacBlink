# Design Document: 013-collaboration-request

**Feature**: Collaboration Request
**Workspace**: `/home/zen/projects/dmst-user`
**Status**: Draft

---

## 1. Overview

Feature này thêm khả năng gửi/quản lý yêu cầu hợp tác vào frontend hiện có. Không có backend mới cần tạo — tất cả API đã sẵn sàng. Công việc frontend gồm 4 phần:

1. **API client** — `src/features/collaboration/api/collaborationRequest.ts`
2. **MatchCard enhancement** — thêm button + trạng thái vào component hiện có
3. **Collaboration Request pages** — trang mới tại `/my/collaboration-requests`
4. **Notification types** — mở rộng `notification.ts` để hỗ trợ 3 type mới

---

## 2. File Structure

```
src/features/collaboration/
├── api/
│   └── collaborationRequest.ts        # API client + TypeScript types
├── components/
│   ├── CollaborationRequestCard.tsx   # Card hiển thị 1 request (dùng cho cả Sent/Received)
│   ├── MatchedIntakesInfo.tsx         # Hiển thị thông tin 2 intake sau khi accept
│   ├── SentRequestsTab.tsx            # Tab "Đã gửi"
│   └── ReceivedRequestsTab.tsx        # Tab "Nhận được"
└── pages/
    └── CollaborationRequestsPage.tsx  # Page chính với 2 tab

src/features/intakes/components/
└── MatchCard.tsx                      # Sửa: thêm props + button gửi yêu cầu

src/features/intakes/components/
└── MatchesSection.tsx                 # Sửa: thêm collaboration state management

src/features/notifications/api/
└── notification.ts                    # Sửa: thêm 3 type mới + union type

src/app/router/
└── routes.tsx                         # Sửa: thêm route /my/collaboration-requests

src/app/config/
└── routes.ts                          # Sửa: thêm menu item collaboration-requests (nếu cần)
```

---

## 3. API Client

### `src/features/collaboration/api/collaborationRequest.ts`

```typescript
import { getAuthHeaders } from '@/services/api/client';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
const API_BASE_PATH = '/api/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CollaborationRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface CollaborationRequest {
  id: string;
  requesterIntakeId: string;
  targetIntakeId: string;
  requesterUserId: string;
  targetUserId: string;
  status: CollaborationRequestStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  requesterIntake?: CollaborationIntakeInfo;
  targetIntake?: CollaborationIntakeInfo;
  requesterUser?: CollaborationUserInfo;
  targetUser?: CollaborationUserInfo;
}

export interface CollaborationIntakeInfo {
  id: string;
  title: string;
  aiProcessTitle?: string | null;
  type: 'ip' | 'challenge';
  status: string;
  content?: string;
  aiProcessedContent?: string;
  intakeSectors?: Array<{ sectorId: string; sector: { id: string; name: string } }>;
}

export interface CollaborationUserInfo {
  id: string;
  email: string;
  fullName?: string;
}

export interface CollaborationRequestListResponse {
  data: CollaborationRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCollaborationRequestBody {
  requesterIntakeId: string;
  targetIntakeId: string;
  message?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function createCollaborationRequest(
  body: CreateCollaborationRequestBody
): Promise<CollaborationRequest> {
  const res = await fetch(`${API_BASE}${API_BASE_PATH}/my/collaboration-requests`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message ?? 'Failed to create collaboration request'), {
      status: res.status,
    });
  }
  const json = await res.json();
  return json.data as CollaborationRequest;
}

export async function getSentCollaborationRequests(
  page = 1,
  limit = 20
): Promise<CollaborationRequestListResponse> {
  const res = await fetch(
    `${API_BASE}${API_BASE_PATH}/my/collaboration-requests/sent?page=${page}&limit=${limit}`,
    { method: 'GET', headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error('Failed to fetch sent collaboration requests');
  const json = await res.json();
  return json.data as CollaborationRequestListResponse;
}

export async function getReceivedCollaborationRequests(
  page = 1,
  limit = 20
): Promise<CollaborationRequestListResponse> {
  const res = await fetch(
    `${API_BASE}${API_BASE_PATH}/my/collaboration-requests/received?page=${page}&limit=${limit}`,
    { method: 'GET', headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error('Failed to fetch received collaboration requests');
  const json = await res.json();
  return json.data as CollaborationRequestListResponse;
}

export async function acceptCollaborationRequest(id: string): Promise<CollaborationRequest> {
  const res = await fetch(
    `${API_BASE}${API_BASE_PATH}/my/collaboration-requests/${id}/accept`,
    { method: 'POST', headers: getAuthHeaders() }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to accept collaboration request');
  }
  const json = await res.json();
  return json.data as CollaborationRequest;
}

export async function rejectCollaborationRequest(id: string): Promise<CollaborationRequest> {
  const res = await fetch(
    `${API_BASE}${API_BASE_PATH}/my/collaboration-requests/${id}/reject`,
    { method: 'POST', headers: getAuthHeaders() }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to reject collaboration request');
  }
  const json = await res.json();
  return json.data as CollaborationRequest;
}

export async function cancelCollaborationRequest(id: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}${API_BASE_PATH}/my/collaboration-requests/${id}`,
    { method: 'DELETE', headers: getAuthHeaders() }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to cancel collaboration request');
  }
}
```

---

## 4. Notification Types Extension

### Sửa `src/features/notifications/api/notification.ts`

Thêm các type mới vào union type và payload interfaces:

```typescript
// Thêm payload interfaces mới
export interface CollaborationRequestReceivedPayload {
  message: string;
  navigationPath: string;
  collaborationRequestId: string;
  requesterIntakeTitle: string;
  targetIntakeTitle: string;
}

export interface CollaborationRequestAcceptedPayload {
  message: string;
  navigationPath: string;
  collaborationRequestId: string;
  requesterIntakeTitle: string;
  targetIntakeTitle: string;
}

export interface CollaborationRequestRejectedPayload {
  message: string;
  navigationPath: string;
  collaborationRequestId: string;
  requesterIntakeTitle: string;
  targetIntakeTitle: string;
}

// Cập nhật Notification interface
export interface Notification {
  id: string;
  type: 'MATCH_FOUND'
      | 'COLLABORATION_REQUEST_RECEIVED'
      | 'COLLABORATION_REQUEST_ACCEPTED'
      | 'COLLABORATION_REQUEST_REJECTED';
  payload: MatchFoundPayload
         | CollaborationRequestReceivedPayload
         | CollaborationRequestAcceptedPayload
         | CollaborationRequestRejectedPayload;
  isRead: boolean;
  createdAt: string;
}
```

`NotificationPanel.tsx` không cần sửa logic — nó đã dùng `n.payload?.message` và `n.payload?.navigationPath` một cách generic, nên sẽ tự động hoạt động với các type mới.

---

## 5. MatchCard Enhancement

### Sửa `src/features/intakes/components/MatchCard.tsx`

Thêm props mới để hỗ trợ collaboration request:

```typescript
interface MatchCardProps {
  match: IntakeMatch;
  parentType: IntakeType;
  rank: number;
  // Collaboration props (optional — chỉ hiển thị khi parentIntakeId được cung cấp)
  parentIntakeId?: string;
  parentIntakeStatus?: string;
  isSendingRequest?: boolean;       // loading state khi đang gửi
  isRequestSent?: boolean;          // true nếu đã gửi request đến intake này
  isDisabled?: boolean;             // true nếu có pending request khác
  onSendRequest?: (targetIntakeId: string) => void;
}
```

Thêm button vào phần cuối của `CardContent`:

```tsx
{/* Collaboration Request Button — chỉ hiển thị khi parentIntakeId có và intake là published */}
{parentIntakeId && parentIntakeStatus === 'published' && onSendRequest && (
  <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
    {isRequestSent ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 border border-green-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã gửi yêu cầu
      </span>
    ) : (
      <Button
        size="sm"
        variant="outline"
        disabled={isDisabled || isSendingRequest}
        onClick={(e) => {
          e.stopPropagation(); // không navigate khi click button
          onSendRequest(matchedIntake.id);
        }}
        className="h-8 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 disabled:opacity-40"
      >
        {isSendingRequest ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {isSendingRequest ? 'Đang gửi...' : 'Gửi yêu cầu hợp tác'}
      </Button>
    )}
  </div>
)}
```

---

## 6. MatchesSection Enhancement

### Sửa `src/features/intakes/components/MatchesSection.tsx`

Thêm state management cho collaboration request:

```typescript
interface MatchesSectionProps {
  matches: IntakeMatch[];
  intakeType: IntakeType;
  // Collaboration props (optional)
  parentIntakeId?: string;
  parentIntakeStatus?: string;
  title?: string;
  countLabel?: string;
  emptyHint?: string;
  actionHint?: string;
}
```

State nội bộ trong `MatchesSection`:

```typescript
// ID của target intake đã được gửi request (nếu có)
const [sentToIntakeId, setSentToIntakeId] = useState<string | null>(null);
// ID của target intake đang được gửi request (loading)
const [sendingToIntakeId, setSendingToIntakeId] = useState<string | null>(null);
// Có pending request hay không (disable tất cả button)
const [hasPendingRequest, setHasPendingRequest] = useState(false);
```

Logic `handleSendRequest`:

```typescript
const handleSendRequest = async (targetIntakeId: string) => {
  if (!parentIntakeId || hasPendingRequest) return;
  setSendingToIntakeId(targetIntakeId);
  try {
    await createCollaborationRequest({ requesterIntakeId: parentIntakeId, targetIntakeId });
    setSentToIntakeId(targetIntakeId);
    setHasPendingRequest(true);
    toast.success('Đã gửi yêu cầu hợp tác thành công');
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 400) {
      toast.error('Bạn đã có một yêu cầu hợp tác đang chờ xử lý');
      setHasPendingRequest(true);
    } else {
      toast.error('Không thể gửi yêu cầu hợp tác. Vui lòng thử lại.');
    }
  } finally {
    setSendingToIntakeId(null);
  }
};
```

**Lưu ý**: Khi `parentIntakeId` được cung cấp, `MatchesSection` cần gọi API để kiểm tra xem đã có pending request chưa khi mount. Cách đơn giản nhất: gọi `getSentCollaborationRequests()` và kiểm tra xem có request nào với `requesterIntakeId === parentIntakeId` và `status === 'pending'` không.

---

## 7. IntakeDetailPage — truyền props xuống MatchesSection

### Sửa `src/features/intakes/pages/IntakeDetailPage.tsx`

Trong `TabsContent value={DETAIL_TAB_MATCHES}`, truyền thêm props:

```tsx
<MatchesSection
  matches={matches}
  intakeType={intake.type}
  parentIntakeId={intake.id}
  parentIntakeStatus={intake.status}
  countLabel={...}
  emptyHint={...}
  actionHint={...}
/>
```

---

## 8. Collaboration Request Pages

### `src/features/collaboration/pages/CollaborationRequestsPage.tsx`

Page chính với 2 tab, đọc `?tab=sent|received` từ URL:

```typescript
// Route: /my/collaboration-requests
// Query param: ?tab=sent (default) | ?tab=received
```

**Layout**:
- Header: "Yêu cầu hợp tác"
- TabsList: "Đã gửi" | "Nhận được"
- TabsContent: `<SentRequestsTab />` | `<ReceivedRequestsTab />`

### `src/features/collaboration/components/SentRequestsTab.tsx`

- Gọi `getSentCollaborationRequests(page)` khi mount và khi page thay đổi
- Hiển thị danh sách `CollaborationRequestCard` với `mode="sent"`
- Pagination component
- Empty state khi không có request

### `src/features/collaboration/components/ReceivedRequestsTab.tsx`

- Gọi `getReceivedCollaborationRequests(page)` khi mount và khi page thay đổi
- Hiển thị danh sách `CollaborationRequestCard` với `mode="received"`
- Pagination component
- Empty state khi không có request

### `src/features/collaboration/components/CollaborationRequestCard.tsx`

Props:
```typescript
interface CollaborationRequestCardProps {
  request: CollaborationRequest;
  mode: 'sent' | 'received';
  onCancel?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isActioning?: boolean; // loading state
}
```

Hiển thị:
- Tiêu đề intake nguồn và intake đích
- Badge trạng thái (pending/accepted/rejected/cancelled) với màu tương ứng
- Thời gian tạo (relative time)
- Actions tùy theo `mode` và `status`

### `src/features/collaboration/components/MatchedIntakesInfo.tsx`

Hiển thị khi `status === 'accepted'`:
- Thông tin công khai của `requesterIntake`: title, type, sectors, aiProcessedContent
- Thông tin công khai của `targetIntake`: title, type, sectors, aiProcessedContent
- Layout 2 cột (hoặc stack trên mobile)

---

## 9. Routing

### Sửa `src/app/router/routes.tsx`

Thêm import và route mới:

```typescript
import { CollaborationRequestsPage } from '@/features/collaboration/pages/CollaborationRequestsPage';

// Trong AppRoutes, bên trong RequireAuth > RootLayout:
<Route path="my/collaboration-requests" element={<CollaborationRequestsPage />} />
```

### Sửa `src/app/config/routes.ts`

Thêm path mapping (nếu cần sidebar highlight):

```typescript
// Trong MENU_ID_TO_PATH (optional — không cần sidebar item):
// 'collaboration-requests': '/my/collaboration-requests',

// Trong pathToActiveItem:
if (pathname.startsWith('/my/collaboration-requests')) return 'collaboration-requests';
```

---

## 10. State Management Strategy

Không dùng global state (Redux/Zustand). Mỗi component tự quản lý state local:

- `MatchesSection`: state `sentToIntakeId`, `hasPendingRequest`, `sendingToIntakeId`
- `SentRequestsTab`: state `requests`, `isLoading`, `page`, `total`
- `ReceivedRequestsTab`: state `requests`, `isLoading`, `page`, `total`
- Optimistic updates: cập nhật local state ngay sau action thành công, không cần refetch toàn bộ list

---

## 11. Error Handling

| Scenario | HTTP Status | Frontend behavior |
|---|---|---|
| Duplicate pending | 400 | Toast: "Bạn đã có một yêu cầu đang chờ xử lý" + disable buttons |
| Wrong type / not published | 400 | Toast: lỗi từ `err.message` |
| Self-request | 400 | Toast: lỗi từ `err.message` |
| Intake not found | 404 | Toast: "Không tìm thấy intake" |
| Unauthorized | 403 | Toast: "Bạn không có quyền thực hiện thao tác này" |
| Network error | — | Toast: "Không thể kết nối. Vui lòng thử lại." |

---

## 12. Navigation Flow

```
Intake Detail (tab Matches)
  └─ Click "Gửi yêu cầu hợp tác"
       └─ POST /api/v1/my/collaboration-requests
            ├─ Success → disable all buttons, show "Đã gửi yêu cầu"
            └─ Error → toast error

Notification Panel
  ├─ COLLABORATION_REQUEST_RECEIVED → navigate /my/collaboration-requests?tab=received
  ├─ COLLABORATION_REQUEST_ACCEPTED → navigate /my/collaboration-requests?tab=sent
  └─ COLLABORATION_REQUEST_REJECTED → navigate /my/collaboration-requests?tab=sent

/my/collaboration-requests
  ├─ Tab "Đã gửi"
  │    ├─ pending → button "Hủy yêu cầu"
  │    ├─ accepted → badge + link xem thông tin khớp
  │    ├─ rejected → badge + hint quay lại matching
  │    └─ cancelled → badge
  └─ Tab "Nhận được"
       ├─ pending → button "Chấp nhận" + "Từ chối"
       ├─ accepted → badge + MatchedIntakesInfo
       └─ rejected → badge
```

---

## 13. Assumptions

- Backend API đã hoàn chỉnh và không cần thay đổi.
- `NotificationPanel` đã xử lý navigation qua `n.payload?.navigationPath` — không cần sửa logic navigate.
- Không cần sidebar menu item mới cho collaboration requests (truy cập qua notification hoặc direct URL).
- Pagination dùng component đơn giản (prev/next buttons) tương tự pattern hiện có trong project.
- Không cần real-time updates (WebSocket/polling) — user refresh thủ công hoặc navigate lại.
