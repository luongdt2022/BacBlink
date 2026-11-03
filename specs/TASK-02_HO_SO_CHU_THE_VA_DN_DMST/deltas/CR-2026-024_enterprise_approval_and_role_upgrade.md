# Change Request: CR-2026-024-PART2 Nâng Cấp Và Cấp Quyền Doanh Nghiệp ĐMST Qua Cổng Kiểm Duyệt Cấp Tỉnh (Enterprise Approval & Role Upgrade)

**CR-ID**: CR-2026-024-PART2  
**Epic**: TASK-02_HO_SO_CHU_THE_VA_DN_DMST  
**Status**: APPROVED  
**Target Version**: 1.12.0  
**Author**: PO kiêm Lead BA (`nacen-po-pm` & `nacen-ba`)  
**Date**: 2026-11-03  
**Căn cứ pháp lý & Thiết kế cơ sở**: Quyết định `PO-DEC-20261103-02` tại `Specification/BASIC_DESIGN_NACENTECH.md` Mục 27; Hiến pháp Quản lý Đặc tả `SourceCode/specs/SPEC_MANAGEMENT_CONSTITUTION.md`.  

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

- **Hiện trạng cũ (Current State / As-Is)** [VERIFIED]:
  1. **Lỗi Parse ScopeId Thất Bại Tại Backend**:
     - Khi người dùng cá nhân (`PUBLIC_USER`) nộp hồ sơ nâng cấp thành Doanh nghiệp ĐMST trên Cổng Nâng Cấp (`/profile/upgrade`), hệ thống tạo một yêu cầu kiểm duyệt vào bảng `identity.approval_requests` với `requestType = 'INSTITUTION'`, `scopeType = 'PROVINCE'`, `scopeId = '<ProvinceCode>'` (ví dụ `"HN"`, `"HCM"`). Dữ liệu định danh được đóng gói trong trường `payloadJson` (`taxCode`, `companyName`, `province`, `fileName`...).
     - Khi Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN`) phê duyệt hồ sơ trên Cổng Công Vụ (`/gov/approvals`), backend xử lý tại phương thức `ApplyApprovalSideEffectsAsync` trong `ApprovalService.cs`:
       ```csharp
       case ApprovalRequestTypes.Institution:
           if (Guid.TryParse(request.ScopeId, out var orgId))
           {
               var org = await db.Set<OrganizationUnit>().FirstOrDefaultAsync(o => o.Id == orgId, ct);
               org?.Activate();
           }
           break;
       ```
     - Vì `request.ScopeId` là mã tỉnh (chuỗi văn bản như `"HN"`, `"HCM"`), hàm `Guid.TryParse` luôn thất bại và trả về `false`.
  2. **Bỏ Quên Side Effect Thăng Hạng Vai Trò**:
     - Backend hoàn toàn không có lệnh gán vai trò: `person.AssignRoleAndScope(PlatformRoles.InnovationEntity, request.ScopeType, request.ScopeId);`.
     - Người dùng nộp đơn vẫn bị kẹt vĩnh viễn ở vai trò `PUBLIC_USER` mặc dù hồ sơ đã chuyển trạng thái `APPROVED`.
  3. **Đứt Gãy Đồng Bộ Thực Thể Doanh Nghiệp**:
     - Không có logic trích xuất `taxCode` và `companyName` từ `payloadJson` để tạo mới hoặc liên kết thực thể `Enterprise` trong schema `enterprise.enterprises`.
     - Cột `OwnerPersonId` không được cập nhật, trạng thái xác thực `IsVerified` không được kích hoạt thành `true`.

- **Vấn đề & Nỗi đau (Friction & Impact)** [CONFIRMED]:
  - Doanh nghiệp ĐMST sau khi được Cán bộ Sở bấm "Duyệt" vẫn không thể truy cập Bàn làm việc Doanh nghiệp (`/portal/enterprise/profile`) do bị chặn bởi Auth Guard (yêu cầu vai trò `INNOVATION_ENTITY`).
  - Doanh nghiệp không thể tự khai báo 10 nhóm trường năng lực KH&CN, không thể đăng ký chào bán công nghệ (`TASK-04`) hay tìm mua (`TASK-03`).
  - Danh bạ Doanh nghiệp ĐMST không hiển thị doanh nghiệp ở trạng thái đã xác minh (`IsVerified = true`), làm suy giảm niềm tin vào CSDL ĐMST quốc gia.

- **Đề xuất mới (Proposed State / To-Be)** [PROPOSAL]:
  1. **Chuẩn Hóa Side Effect Thăng Hạng Vai Trò 3D Scoped RBAC**:
     - Khi Checker cấp Sở phê duyệt hồ sơ `INSTITUTION`, hệ thống tự động thăng hạng tài khoản:
       `person.AssignRoleAndScope(PlatformRoles.InnovationEntity, request.ScopeType, request.ScopeId);`
     - Gán phạm vi thẩm quyền chuẩn hóa cấp Tỉnh (`ScopeType = "PROVINCE"`, `ScopeId = request.ScopeId`).
  2. **Tự Động Trích Xuất & Đồng Bộ Thực Thể Enterprise VERIFIED**:
     - Trích xuất `taxCode`, `companyName` (hoặc `orgName`), `province` từ `request.PayloadJson`.
     - Nếu doanh nghiệp đã có theo MST: Cập nhật `OwnerPersonId = person.Id`, kích hoạt `Status = "ACTIVE"`, `VerificationStatus = "VERIFIED"`, `IsVerified = true`, gọi `Approve(...)`.
     - Nếu doanh nghiệp chưa tồn tại: Tạo mới bản ghi `Enterprise` với `OwnerPersonId = person.Id`, `Status = "ACTIVE"`, `VerificationStatus = "VERIFIED"`, `IsVerified = true`.
  3. **Khép Kín Cơ Chế Thu Hồi (Revoke Support)**:
     - Khi Trung ương (`SUPER_ADMIN`, `OPERATOR_ADMIN`) thực hiện thu hồi (`REVOKE`), hạ cấp người dùng về `PUBLIC_USER` và chuyển trạng thái `Enterprise` liên kết thành `VerificationStatus = "REJECTED"`, `IsVerified = false`.

---

### 2. Chi Tiết Thay Đổi Quy Chuẩn (Standardized Changes)

#### [MODIFY] BR-02-007: Quy Chuẩn Liên Thông Hạt Nhân & Kích Hoạt Quyền Hạn Doanh Nghiệp ĐMST (Side Effects Phê Duyệt Cấp Tỉnh)
- **Quy tắc cũ**: Chỉ nêu nguyên tắc tái sử dụng thông tin định danh của `enterprises` khi sang phân hệ Seller/Buyer, chưa có đặc tả kỹ thuật về side effects khi phê duyệt hồ sơ nâng cấp từ Cổng Công Vụ.
- **Quy tắc mới**:
  1. Khi một yêu cầu phê duyệt loại `INSTITUTION` được phê duyệt (`action = "APPROVE"`):
     - **Thăng hạng vai trò**: Tài khoản người dùng nộp đơn (`request.UserId`) được tự động nâng cấp từ `PUBLIC_USER` lên vai trò `INNOVATION_ENTITY` với phạm vi `ScopeType = ScopeTypes.Province` và `ScopeId = request.ScopeId`.
     - **Trích xuất thông tin định danh**: Hệ thống trích xuất trường `taxCode` và tên đơn vị (`companyName` / `orgName`) từ `request.PayloadJson`.
     - **Tạo/Liên kết thực thể Doanh nghiệp**:
       * Nếu `taxCode` đã có trong bảng `enterprise.enterprises`: Liên kết `OwnerPersonId = request.UserId`, chuyển trạng thái `Status = "ACTIVE"`, `VerificationStatus = "VERIFIED"`, `IsVerified = true`.
       * Nếu `taxCode` chưa có trong bảng `enterprise.enterprises`: Khởi tạo mới bản ghi `Enterprise` với đầy đủ thông tin định danh từ `PayloadJson`, gán `OwnerPersonId = request.UserId`, `Status = "ACTIVE"`, `VerificationStatus = "VERIFIED"`, `IsVerified = true`.
  2. Tuyệt đối cấm sử dụng `Guid.TryParse` trên `request.ScopeId` đối với hồ sơ cấp Tỉnh.
  3. Khi hồ sơ bị thu hồi (`REVOKE`), hệ thống thu hồi vai trò `INNOVATION_ENTITY`, chuyển người dùng về `PUBLIC_USER`, hủy kích hoạt `IsVerified = false` của thực thể doanh nghiệp tương ứng.

#### [ADD] REQ-02-011: Thẩm Định & Phê Duyệt Nâng Cấp Doanh Nghiệp ĐMST Cấp Tỉnh (Maker-Checker & Role Upgrade)
- Cán bộ/Lãnh đạo Sở KH&CN (`PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) tại Cổng Công Vụ (`/gov/approvals`, Tab ĐƠN VỊ / DOANH NGHIỆP ĐMST) có quyền:
  1. Tiếp nhận và xem xét danh sách hồ sơ nâng cấp Doanh nghiệp ĐMST (`INSTITUTION`) thuộc phạm vi tỉnh (`ScopeId == CurrentUser.ScopeId`).
  2. Kiểm tra thông tin pháp lý đính kèm: Mã số thuế (MST), tên doanh nghiệp, tệp Giấy chứng nhận ĐKKD PDF.
  3. Ra quyết định phê duyệt (`APPROVE`), từ chối (`REJECT`), hoặc yêu cầu sửa đổi (`REQUEST_CHANGES`):
     - Khi `APPROVE`: Tự động kích hoạt side effects thăng hạng vai trò `INNOVATION_ENTITY` và tạo/liên kết thực thể `Enterprise` ở trạng thái `VERIFIED`.
     - Khi `REJECT` hoặc `REQUEST_CHANGES`: Ghi nhận lý do thẩm định (tối thiểu 10 ký tự), không thay đổi vai trò người dùng.

#### [ADD] API-02-008: Hợp Đồng Endpoint Thẩm Định Duyệt Hồ Sơ Nâng Cấp DN ĐMST (Review Approval Contract)
- **Method**: `POST`
- **Route**: `/api/v1/governance/approvals/{id}/review`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_access_token>` *(Bắt buộc vai trò PROVINCIAL_ADMIN, CLUSTER_ADMIN, SUPER_ADMIN, OPERATOR_ADMIN)*
- **Path Parameter**: `id` (Guid) — Khóa định danh của hồ sơ `approval_requests`.
- **Request Body**:
  ```json
  {
    "action": "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "REVOKE",
    "reviewNote": "string (bắt buộc >= 10 ký tự nếu REJECT hoặc REQUEST_CHANGES hoặc REVOKE)",
    "expectedVersion": 1
  }
  ```
- **Side Effect (khi requestType == 'INSTITUTION' và action == 'APPROVE')**:
  - Cập nhật `identity.approval_requests`: `status = 'APPROVED'`, `version = version + 1`, `reviewed_by_id = actor.PersonId`.
  - Cập nhật `identity.persons`: `platform_role = 'INNOVATION_ENTITY'`, `scope_type = 'PROVINCE'`, `scope_id = request.ScopeId`.
  - Cập nhật/Tạo mới `enterprise.enterprises`: `owner_person_id = request.UserId`, `is_verified = true`, `verification_status = 'VERIFIED'`, `status = 'ACTIVE'`.
  - Ghi nhật ký `identity.approval_audit_logs`: `action = 'REVIEW_APPROVE'`.
- **Response**:
  - `200 OK`: DTO của hồ sơ sau khi duyệt kèm thông tin người nộp.
  - `400 Bad Request`: `expectedVersion` không khớp (Concurrency Conflict) hoặc thiếu `reviewNote`.
  - `401 Unauthorized`: Thiếu Bearer Token.
  - `403 Forbidden`: Người dùng không có quyền quản lý địa bàn tỉnh của hồ sơ (`ScopeId != actor.ScopeId`).
  - `404 Not Found`: Không tìm thấy hồ sơ ID.

#### [ADD] TEST-02-009: Bộ Kiểm Thử Bất Biến & Tích Hợp Thăng Hạng Role INNOVATION_ENTITY & Thực Thể Doanh Nghiệp VERIFIED
1. **Invariant Test**:
   - Xác thực khi duyệt hồ sơ `INSTITUTION` với `ScopeId = "HN"`:
     * `user.PlatformRole` chuyển thành `INNOVATION_ENTITY`.
     * `user.ScopeType` là `PROVINCE`, `user.ScopeId` là `"HN"`.
     * `Guid.TryParse` không gây crash hoặc bỏ sót logic.
2. **Integration Test (DB Thật)**:
   - Given hồ sơ nộp nâng cấp với `payloadJson` chứa MST `"0109998888"` và tên `"CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST QUỐC GIA"`,
   - When Cán bộ Sở Hà Nội gọi API duyệt với `action = "APPROVE"`,
   - Then bản ghi `enterprise.enterprises` tương ứng có `OwnerPersonId == UserId`, `IsVerified == true`, `VerificationStatus == "VERIFIED"`.
3. **Revoke Test**:
   - Xác thực khi SuperAdmin gọi `action = "REVOKE"`, tài khoản người dùng bị hạ cấp về `PUBLIC_USER` và thực thể doanh nghiệp chuyển sang `IsVerified == false`.

#### [ADD] AC-02-040 đến AC-02-045: Tiêu Chuẩn Chấp Thuận Định Lượng

- **`AC-02-040` (Thăng Hạng Role INNOVATION_ENTITY Cấp Tỉnh)**:
  - Given người dùng đang mang vai trò `PUBLIC_USER` đã nộp yêu cầu nâng cấp loại `INSTITUTION` với địa bàn tỉnh `"HN"`,
  - When Cán bộ Sở KH&CN Hà Nội (`PROVINCIAL_ADMIN`, Scope `"HN"`) phê duyệt hồ sơ thành công (`APPROVE`),
  - Then tài khoản người dùng được gán vai trò `INNOVATION_ENTITY`, `ScopeType = "PROVINCE"`, `ScopeId = "HN"`.

- **`AC-02-041` (Trích Xuất PayloadJson & Liên Kết OwnerPersonId)**:
  - Given hồ sơ `INSTITUTION` chứa `payloadJson` có trường `taxCode` và `companyName`,
  - When hệ thống thực thi side effect phê duyệt,
  - Then hệ thống trích xuất chính xác `taxCode` và `companyName`, gán `OwnerPersonId = request.UserId` cho thực thể doanh nghiệp.

- **`AC-02-042` (Kích Hoạt Trạng Thái Doanh Nghiệp VERIFIED)**:
  - Given thực thể doanh nghiệp được liên kết hoặc tạo mới từ yêu cầu duyệt,
  - When side effect hoàn tất,
  - Then thuộc tính `IsVerified` của doanh nghiệp mang giá trị `true`, `VerificationStatus = "VERIFIED"`, `Status = "ACTIVE"`.

- **`AC-02-043` (Xử Lý ScopeId Không Phải Guid)**:
  - Given hồ sơ nâng cấp có `ScopeId` là chuỗi mã tỉnh (ví dụ `"HN"`, `"HCM"`, `"ĐN"`),
  - When hàm xử lý side effect được triệu gọi,
  - Then hệ thống xử lý trơn tru mà không phụ thuộc vào `Guid.TryParse`, không gây bỏ qua bước kích hoạt quyền hạn.

- **`AC-02-044` (Quyền Truy Cập Tức Thời Bàn Làm Việc Doanh Nghiệp)**:
  - Given người dùng vừa được phê duyệt nâng cấp thành công,
  - When người dùng đăng nhập hoặc làm mới token tại `/portal/enterprise/profile`,
  - Then người dùng được chuyển hướng vào giao diện Quản lý hồ sơ doanh nghiệp 10 nhóm trường mà không bị điều hướng ra trang 403 Forbidden.

- **`AC-02-045` (Kiểm Toán Bất Biến Before/After Đầy Đủ)**:
  - Given hành động phê duyệt hồ sơ `INSTITUTION`,
  - When kết thúc giao dịch lưu trữ CSDL,
  - Then một bản ghi `identity.approval_audit_logs` được tạo mới với `action = "REVIEW_APPROVE"`, lưu vết đầy đủ ActorId, Role, Timestamp, IP và Payload trạng thái.

---

### 3. Ma Trận Truy Vết Toàn Trình (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Hợp Đồng API (API) | Kịch Bản Kiểm Thử (TEST) | Tiêu Chuẩn Chấp Thuận (AC) |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-040` (Thăng hạng Role INNOVATION_ENTITY) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-041` (Trích xuất Payload & Liên kết Owner) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-042` (Kích hoạt Enterprise VERIFIED) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-043` (ScopeId String Handler) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-044` (Truy cập Portal Enterprise) |
| **`REQ-02-011`** | `BR-02-007` | `API-02-008` | `TEST-02-009` | `AC-02-045` (Kiểm toán Audit Log) |

---

### 4. Kế Hoạch Phân Rã Công Việc Kỹ Thuật (Tasks Breakdown)

- **`T-02.38`** `[BE]`: Cập nhật `ApprovalService.ApplyApprovalSideEffectsAsync`: Xử lý nhánh `ApprovalRequestTypes.Institution`, thăng hạng role `INNOVATION_ENTITY` + Scope Tỉnh cho `Person`, trích xuất `taxCode` và `companyName` từ `PayloadJson` để tạo mới/liên kết thực thể `Enterprise` với `IsVerified = true`, `VerificationStatus = "VERIFIED"`, `OwnerPersonId = request.UserId`.
- **`T-02.39`** `[INT]`: Tích hợp liên thông luồng phê duyệt từ Cổng Công Vụ Cấp Sở (`/gov/approvals`) sang phân hệ Doanh nghiệp: Sau khi duyệt thành công, người dùng lập tức truy cập được Bàn làm việc Doanh nghiệp (`/portal/enterprise/profile`) với danh tính pháp nhân đầy đủ.
- **`T-02.40`** `[TEST]`: Xây dựng bộ kiểm thử tích hợp và kiểm thử bất biến `TEST-02-009`: Xác thực 100% kịch bản duyệt `INSTITUTION` gán đúng role `INNOVATION_ENTITY`, ScopeId tỉnh thành, tạo/liên kết Enterprise `VERIFIED` và không bị kẹt ở `PUBLIC_USER`.
