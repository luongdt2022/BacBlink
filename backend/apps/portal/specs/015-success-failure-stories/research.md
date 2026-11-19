# Research: Success & Failure Stories

## Decision 1: Feature Directory Structure

**Decision**: Tạo feature mới `src/features/stories/` theo đúng pattern của `src/features/intakes/`
**Rationale**: Codebase có convention rõ ràng — mỗi feature là một thư mục độc lập với `api/`, `components/`, `pages/`.
**Alternatives considered**: Gộp vào intakes — bị loại vì đây là entity hoàn toàn khác, không liên quan đến matching hay AI processing.

---

## Decision 2: Rich Text Editor

**Decision**: Tái sử dụng `RichTextEditor` component tại `@/shared/components/ui/rich-text-editor`
**Rationale**: Component này đã được dùng trong IntakeFormPage cho field `content`, `confidentialLevel2Content`, `confidentialLevel3Content`. Không cần thêm dependency mới.
**Alternatives considered**: Tiptap raw, Quill — bị loại vì component đã được wrapper sẵn.

---

## Decision 3: API Client Pattern

**Decision**: Dùng `apiClient` (Axios instance) từ `@/services/api/client` với pattern giống `intake.ts`
**Rationale**: Tất cả features đều dùng cùng client. Đã có interceptor xử lý Bearer token và error message.
**Alternatives considered**: Fetch API — không nhất quán với codebase.

---

## Decision 4: Routing

**Decision**: Routes `/stories`, `/stories/create`, `/stories/:id`, `/stories/:id/edit`
**Rationale**: Nhất quán với pattern của `/ips` và `/challenges`.
**Alternatives considered**: `/my-stories` — bị loại vì không cần phân biệt "của tôi" vs "tất cả" trong v1 (người dùng chỉ thấy câu chuyện của mình + câu chuyện công khai của người khác).

---

## Decision 5: Trạng thái đăng

**Decision**: Toggle `draft` / `published` trực tiếp trên form, nút "Lưu" duy nhất
**Rationale**: Người dùng muốn UX đơn giản — toggle trạng thái + lưu, không cần 2 nút riêng ("Lưu nháp" / "Đăng").
**Alternatives considered**: Hai nút riêng biệt — phức tạp hơn, không cần thiết.

---

## Decision 6: Backend API

**Decision**: REST API chuẩn CRUD tại `/api/v1/stories`
**Rationale**: Nhất quán với tất cả API hiện tại trong project (intakes, collaboration, etc.).
**Alternatives considered**: GraphQL — overkill cho feature này.

---

## Decision 7: Visibility (Admin)

**Decision**: Field `isHidden: boolean` riêng biệt với `status` (draft/published)
**Rationale**: Admin cần ẩn câu chuyện mà không xóa và không thay đổi trạng thái đăng của người dùng. Hai chiều kiểm soát độc lập nhau.
