# Change Request: CR-2026-024 Khắc Phục Lỗi Phê Duyệt Hồ Sơ Chào Bán Cấp Sở & Xuất Bản Sàn Chào Bán (Seller Approval & Marketplace Publishing Fix)

**CR-ID**: CR-2026-024  
**Epic**: TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC  
**Status**: APPROVED  
**Target Version**: 1.11.0  
**Author**: PO kiêm Lead BA (`nacen-po-pm` & `nacen-ba`)  
**Date**: 2026-11-03  
**Căn cứ pháp lý & Thiết kế cơ sở**: Quyết định `PO-DEC-20261103-01` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 25; Hiến pháp Quản lý Đặc tả `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.  

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

- **Hiện trạng cũ (Current State / As-Is)**:
  1. **Lỗi Phân Quyền Backend (403 Forbidden)**:
     - Endpoint kiểm duyệt chào bán của Seller: `POST /api/v1/portal/seller/technologies/{id}/review` và `POST /api/v2/portal/seller/technologies/{id}/review` tại `TechnologyOffersController.cs` đang cấu hình phân quyền legacy:
       ```csharp
       [Authorize(Roles = "DEPT_ADMIN,DEPT_OFFICER,ADMIN")]
       public async Task<IActionResult> ReviewOffer(Guid id, [FromBody] ReviewOfferDto dto, CancellationToken ct = default)
       ```
     - Khi Lãnh đạo hoặc Cán bộ Sở KH&CN đăng nhập bằng vai trò chuẩn hóa 3D Scoped RBAC (`PROVINCIAL_ADMIN` hoặc `CLUSTER_ADMIN`) và bấm phê duyệt hồ sơ trên Cổng Công Vụ (`/gov/approvals`), ASP.NET Core Authorize Middleware chặn đứng với mã lỗi HTTP `403 Forbidden`.
  2. **Lỗi Xác Thực Frontend SDK (Missing Authorization Header / 401 Unauthorized)**:
     - Trong `SourceCode/frontend/src/services/api/technology-offer.ts`, hàm `reviewOffer(id, action, reviewNote)` gửi HTTP POST mà không đính kèm header `Authorization: Bearer <token>`:
       ```typescript
       const res = await fetch(`${API_BASE}/api/v1/portal/seller/technologies/${id}/review`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action, reviewNote }),
       });
       ```
     - Điều này khiến yêu cầu kiểm duyệt gửi từ client không mang danh tính người dùng, vi phạm rào chắn bảo mật và gây lỗi xác thực.
  3. **Tắc nghẽn xuất bản Sàn Chào Bán Quốc Gia (`/chao-ban-cong-nghe`, `/san-pham`)**:
     - Do không thể phê duyệt, toàn bộ hồ sơ công nghệ, giải pháp và sản phẩm thương mại mới tạo bởi Seller bị kẹt vĩnh viễn ở trạng thái `PENDING`.
     - Trường `published_at` không được cập nhật (`null`), khiến Sàn Chào Bán không thể hiển thị các sản phẩm mới do bộ lọc chỉ mục yêu cầu `status == 'APPROVED'` và `is_public == true`.

- **Vấn đề / Nỗi đau (Friction & Impact)**:
  - Cán bộ Sở KH&CN không thể thực hiện nhiệm vụ công vụ quản lý và thẩm định công nghệ trên địa bàn.
  - Bên Bán (`SELLER`) nộp hồ sơ nhưng không được duyệt và không xuất hiện trên sàn thương mại.
  - Đứt gãy luồng tương tác Maker-Checker 2 cấp tại địa phương quy định tại Quyết định `PO-DEC-20261026-GOV`.

- **Đề xuất mới (Proposed State / To-Be)**:
  1. **Chuẩn hóa Phân Quyền 3D Scoped RBAC tại Backend**:
     - Cập nhật thuộc tính `[Authorize]` tại `ReviewOffer` chấp nhận đầy đủ các vai trò quản trị thẩm quyền theo 10 Core Roles của hệ sinh thái NacenTech:
       `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`, `SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN` (đồng thời giữ tương thích ngược `DEPT_ADMIN`, `DEPT_OFFICER`).
     - Scoping địa bàn hành chính: Cán bộ Sở (`PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) thẩm định các hồ sơ thuộc địa bàn tỉnh/thành mình quản lý (`ScopeId == user.ScopeId`).
  2. **Bắt buộc Cưỡng chế Bearer Token Authentication trên Frontend SDK**:
     - Cải tạo hàm `reviewOffer` tự động lấy JWT Access Token từ `authClient.getAccessToken()` (hoặc `nacentwin_access_token`) và inject vào header `Authorization: Bearer ${token}`.
  3. **Khép kín Chu Trình Xuất Bản Sàn Chào Bán**:
     - Ngay khi `PROVINCIAL_ADMIN` phê duyệt (`APPROVE`), hệ thống cập nhật `status = 'APPROVED'` và `published_at = UtcNow`. Sản phẩm/công nghệ lập tức xuất hiện công khai trên `/san-pham` và `/chao-ban-cong-nghe`.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Changes)

#### [MODIFY] BR-SELLER-05: Quy Tắc Xuất Bản & Cổng Kiểm Duyệt Cấp Sở (Multi-Level Governance & Publication Gate)
- **Quy tắc cũ**: Cho phép duyệt hồ sơ nhưng chưa định rõ cơ chế Scoped RBAC và cấu hình phân quyền Authorize cụ thể.
- **Quy tắc mới**:
  1. Hồ sơ chào bán Seller khởi tạo với trạng thái `PENDING` (Chờ thẩm định), tự động gán địa bàn tiếp nhận theo Sở KH&CN quản lý (`managing_authority_id` / `scope_id`).
  2. Quyền thẩm định và ra quyết định phê duyệt (`APPROVE`), từ chối (`REJECT`), hoặc yêu cầu bổ sung (`REQUEST_CHANGES`) được giới hạn cho:
     - **Cấp Địa Phương**: Lãnh đạo/Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) phụ trách địa bàn tương ứng (`Offer.ScopeId == CurrentUser.ScopeId`).
     - **Cấp Trung Ương**: Quản trị viên Tối cao (`SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`) với thẩm quyền toàn quốc (Global Scope).
  3. Cấm tuyệt đối tài khoản không có vai trò quản trị thẩm quyền nêu trên hoặc thiếu JWT Bearer Token can thiệp vào tiến trình phê duyệt.

#### [ADD] REQ-04-010: Thẩm Định & Phê Duyệt Hồ Sơ Chào Bán Cấp Sở KH&CN Từ Cổng Công Vụ
- Cán bộ/Lãnh đạo Sở KH&CN (`PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) tại Cổng Tác Nghiệp Cấp Sở (`/gov/approvals`, Tab SHOP) có quyền:
  1. Xem danh sách hồ sơ công nghệ, giải pháp, sản phẩm thương mại chờ duyệt thuộc địa bàn tỉnh/thành mình quản lý.
  2. Xem chi tiết hồ sơ: Bộ tứ SHTT (TRL, SHTT, hình thức chuyển giao, thương mại hóa) hoặc thông tin sản phẩm thương mại.
  3. Thực hiện thẩm định và gửi quyết định kèm `reviewNote`:
     - Phê duyệt (`APPROVE`): Công bố hồ sơ lên Sàn Chào Bán.
     - Yêu cầu sửa đổi (`REQUEST_CHANGES`): Yêu cầu Seller bổ sung tài liệu/thông tin (lý do $\ge 10$ ký tự).
     - Từ chối (`REJECT`): Nêu rõ lý do từ chối (lý do $\ge 10$ ký tự).

#### [ADD] BR-SELLER-08: Chuẩn Hóa Xác Thực Bearer Token & Phân Quyền Scoped RBAC Cho Thao Tác Kiểm Duyệt
1. **Bắt buộc JWT Bearer Token**: Mọi cuộc gọi kiểm duyệt hồ sơ (`POST /api/v1/portal/seller/technologies/{id}/review`) MUST mang theo header `Authorization: Bearer <valid_jwt_token>`. Yêu cầu thiếu header hoặc token hết hạn/không hợp lệ MUST bị từ chối với HTTP 401 Unauthorized.
2. **Cưỡng chế Role Scoped RBAC**: Token phải chứa ít nhất một trong các vai trò:
   `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`, `SUPER_ADMIN`, `OPERATOR_ADMIN`, `ADMIN`, `DEPT_ADMIN`, `DEPT_OFFICER`. Người dùng mang vai trò khác (như `BUYER`, `SELLER`, `PUBLIC_USER`) MUST nhận HTTP 403 Forbidden.
3. **Cập nhật Trạng thái & Mốc Xuất bản**:
   - Khi `APPROVE`: `Status = 'APPROVED'`, `PublishedAt = UtcNow`.
   - Khi `REJECT`: `Status = 'REJECTED'`, `PublishedAt = null`.
   - Khi `REQUEST_CHANGES`: `Status = 'CHANGES_REQUESTED'`, `PublishedAt = null`.

#### [ADD] API-04-006: Chuẩn Hóa Endpoint Phê Duyệt Chào Bán (ReviewOffer Contract)
- **Method**: `POST`
- **Route**: `/api/v1/portal/seller/technologies/{id}/review` & `/api/v2/portal/seller/technologies/{id}/review`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_access_token>` *(BẮT BUỘC)*
- **Body**:
  ```json
  {
    "action": "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "REVOKE",
    "reviewNote": "string (bắt buộc >= 10 ký tự nếu REJECT hoặc REQUEST_CHANGES)"
  }
  ```
- **Response**:
  - `200 OK`: `{ "success": true, "message": "...", "data": { ... } }`
  - `400 Bad Request`: Thiếu action hoặc `reviewNote` không đủ 10 ký tự khi từ chối/yêu cầu sửa.
  - `401 Unauthorized`: Thiếu Bearer Token hoặc Token không hợp lệ.
  - `403 Forbidden`: Token hợp lệ nhưng Role không nằm trong danh sách phân quyền Scoped RBAC.
  - `404 Not Found`: Không tìm thấy hồ sơ công nghệ theo `id`.

#### [ADD] UI-04-004: Tương Tác Phê Duyệt Tại Cổng Công Vụ (`/gov/approvals`)
- Khi Cán bộ Sở bấm nút Duyệt / Yêu cầu sửa / Từ chối trên modal hoặc bảng kiểm duyệt:
  1. Client hiển thị trạng thái loading spinner trên nút thao tác, khóa tương tác để chống bấm đúp (Double Submit).
  2. Gửi request thông qua `reviewOffer` SDK có đính kèm Bearer token.
  3. Khi thành công: Hiển thị Toast thông báo màu xanh lá, tự động xóa hàng khỏi danh sách chờ duyệt, giảm số lượng đếm trên Tab SHOP và refresh dữ liệu bảng.
  4. Khi thất bại: Hiển thị Toast lỗi màu đỏ với thông điệp rõ ràng, không làm mất ngữ cảnh công vụ.

#### [ADD] TEST-04-008: Bộ Kịch Bản Kiểm Thử Phê Duyệt & Xuất Bản Sàn Chào Bán
- **TC-REV-01 (Happy Path - Provincial Admin Approve)**: Tài khoản `PROVINCIAL_ADMIN` (địa bàn `HN`) duyệt hồ sơ `PENDING` $\rightarrow$ Trả về HTTP 200 $\rightarrow$ `status == 'APPROVED'`, `published_at` có giá trị $\rightarrow$ Kiểm tra trang `/san-pham` thấy hồ sơ xuất hiện.
- **TC-REV-02 (Authorization - 401 Missing Bearer)**: Gọi API không có header `Authorization` $\rightarrow$ Trả về HTTP 401 Unauthorized.
- **TC-REV-03 (Role RBAC - 403 Forbidden For Non-Gov Roles)**: Tài khoản `SELLER` hoặc `BUYER` gửi token gọi API duyệt $\rightarrow$ Trả về HTTP 403 Forbidden.
- **TC-REV-04 (Happy Path - Request Changes Note Validation)**: Tài khoản `PROVINCIAL_ADMIN` bấm yêu cầu bổ sung nhưng ghi chú $< 10$ ký tự $\rightarrow$ Trả về HTTP 400 Bad Request. Khi ghi chú $\ge 10$ ký tự $\rightarrow$ HTTP 200, `status == 'CHANGES_REQUESTED'`.

---

### 3. Ma Trận Tác Động Đa Bề Mặt (Cross-Surface & Cross-Epic Impact)

| Bề Mặt Tác Động | Thành Phần Liên Quan | Nội Dung Tác Động & Điều Chỉnh |
| :--- | :--- | :--- |
| **Backend Controller** | `TechnologyOffersController.cs` | Bổ sung `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`, `SUPER_ADMIN`, `OPERATOR_ADMIN` vào `[Authorize(Roles)]`. |
| **Frontend SDK** | `technology-offer.ts` | Bổ sung lấy JWT token từ `authClient` và inject header `Authorization: Bearer ${token}` trong hàm `reviewOffer`. |
| **Frontend Cổng Công Vụ** | `/gov/approvals` (`gov-approval-queue.tsx`) | Kiểm tra luồng gọi `reviewOffer`, quản lý state đóng modal và refresh danh sách sau khi duyệt. |
| **Sàn Chào Bán Quốc Gia** | `/san-pham`, `/chao-ban-cong-nghe` | Hồ sơ được duyệt lập tức hiển thị công khai, kiểm tra hiển thị đúng phân loại (Sản phẩm vs Công nghệ). |
| **Consuming Epics** | `TASK-07_CONG_CONG_VU_CAP_SO_KHCN`<br/>`TASK-00_PLATFORM_FOUNDATION_VA_COMMON` | Đồng bộ 3D Scoped RBAC giữa Cổng Công Vụ và Module Quản lý Chào bán. |

---

### 4. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

- [ ] **AC-CR-024.1**: Tài khoản `PROVINCIAL_ADMIN` và `CLUSTER_ADMIN` thực hiện duyệt hồ sơ chào bán thành công, nhận phản hồi HTTP 200 (không còn lỗi 403 Forbidden).
- [ ] **AC-CR-024.2**: Yêu cầu duyệt từ Frontend SDK luôn mang theo Bearer token; nếu không có token hệ thống trả về HTTP 401 Unauthorized.
- [ ] **AC-CR-024.3**: Người dùng mang vai trò `SELLER`, `BUYER` hoặc `PUBLIC_USER` cố tình gọi API duyệt nhận phản hồi HTTP 403 Forbidden.
- [ ] **AC-CR-024.4**: Khi duyệt `APPROVE`, hồ sơ trong CSDL chuyển trạng thái thành `APPROVED` và `published_at` được gán mốc thời gian hiện tại.
- [ ] **AC-CR-024.5**: Hồ sơ vừa được duyệt lập tức xuất hiện trên Sàn Chào Bán (`/san-pham` và `/chao-ban-cong-nghe`) cho khách vãng lai và thành viên xem công khai.
