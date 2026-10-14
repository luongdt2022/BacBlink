# Feature Specification: TASK-07 Phân Quyền & Năng Lực Quản Trị Admin

**Feature Branch**: `admin-governance-rbac`  
**Feature Directory**: `specs/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`  
**Created**: 25/09/2026  
**Status**: Ready for Implementation  
**Ánh Xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/README.md`](../../Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/README.md)  
**Tài Liệu Kế Thừa & Nâng Cấp**: Nâng cấp toàn diện từ `SRS-001-CORE-IAM` lên chuẩn 10 Roles & 3D Scoped RBAC  
**Nguồn Dữ Liệu Gốc**: Sheet `Admin` (6 dòng, 2 cột) trong Master Excel `Nacentwin_20260924_bo_loc_da_sua.xlsx`  

---

## 1. Mục Đích & Bối Cảnh (Context & Objectives)

Phân hệ quản trị tập trung và phân cấp (Hierarchical Admin & Governance) là trung tâm điều phối và kiểm soát chất lượng của toàn bộ sàn giao dịch công nghệ Nacentwin:
1. **Thực thi 5 Quyền Năng Hạt Nhân từ Sheet `Admin`**:
   - Phê duyệt tài khoản đăng ký.
   - Phê duyệt hồ sơ shop (nhà cung ứng công nghệ).
   - Phê duyệt hồ sơ chuyên gia KH&CN.
   - Phê duyệt hồ sơ nhu cầu công nghệ (Bên Mua).
   - Phân quyền cơ sở liên kết (Viện/Trường/Sở địa phương).
2. **Giải Quyết Bài Toán Quá Tải Kiểm Duyệt**: Thay vì dồn toàn bộ hồ sơ lên NacenTech Trung ương, hệ thống phân cấp thẩm quyền theo **3D Scoped RBAC** (`GLOBAL`, `PROVINCE`, `SECTOR`, `ORG_UNIT`), trao quyền chủ động cho 63 Sở KH&CN tỉnh và Trưởng ban 18 ngành trọng điểm TT17.
3. **Chống Xung Đột & Minh Bạch Kiểm Toán**: Ứng dụng Optimistic Locking chống duyệt đè khi nhiều cán bộ cùng mở một hồ sơ, và lưu trữ 100% nhật ký kiểm toán bất biến (Audit Log) đạt chuẩn An toàn thông tin Cấp độ 3 (Nghị định 85/2016/NĐ-CP).

---

## 2. User Scenarios & Acceptance Criteria

### Story 1 - Phân Cấp Duyệt Tài Khoản Đăng Ký Theo Địa Bàn (Sheet Admin #1)
**User Persona**: `PROVINCE_OFFICER` (Chuyên viên Sở KH&CN Tỉnh) & `NACEN_ADMIN` (Admin Toàn quốc).  
**Bối cảnh**: Người dùng cá nhân hoặc doanh nghiệp mới tạo tài khoản, gửi yêu cầu kích hoạt tư cách thành viên.

**Acceptance Criteria**:
1. **Given** một tài khoản đăng ký tại Tỉnh Hải Phòng, **When** Chuyên viên Sở Hải Phòng đăng nhập vào Bảng duyệt (`UI-ADMIN-APPROVAL-001`), **Then** hệ thống tự động lọc theo `ScopeType = "PROVINCE"` và `ScopeId = "HP"`, chỉ hiển thị các hồ sơ thuộc Hải Phòng.
2. **Given** hồ sơ hợp lệ, **When** cán bộ Sở bấm [Phê duyệt], **Then** hệ thống chuyển trạng thái tài khoản sang `ACTIVE`, ghi nhận Audit Log và gửi email kích hoạt cho người dùng.
3. **Given** cán bộ Sở cố tình gọi API duyệt hồ sơ của tỉnh khác, **When** request gửi đến backend, **Then** hệ thống chặn với mã `403 Forbidden` (`ERR_DATA_SCOPE_VIOLATION`).

---

### Story 2 - Phê Duyệt Hồ Sơ Shop (Nhà Cung Ứng Công Nghệ) (Sheet Admin #2)
**User Persona**: `PROVINCE_LEADER` (Lãnh đạo Sở Tỉnh) & `SECTOR_SPECIALIST` (Chuyên gia Ngành).  
**Bối cảnh**: Doanh nghiệp nộp Giấy phép ĐKKD và đăng ký mở gian hàng công nghệ (Shop Seller).

**Acceptance Criteria**:
1. **Given** hồ sơ mở shop mới, **When** Chuyên viên Sở thẩm định ĐKKD hợp lệ, **Then** cán bộ chuyển hồ sơ sang trạng thái `PENDING_APPROVAL` (Vòng 2) trình Lãnh đạo Sở ký duyệt.
2. **Given** hồ sơ thiếu giấy phép hoặc bản scan bị mờ, **When** cán bộ bấm [Yêu cầu bổ sung], **Then** bắt buộc nhập lý do ($\ge 10$ ký tự) và hệ thống gửi thông báo yêu cầu người dùng nộp lại bản rõ nét.
3. **Given** Lãnh đạo Sở phê duyệt thành công, **Then** tài khoản được cấp quyền `SELLER`, tự động kích hoạt tính năng tạo bài đăng chào bán công nghệ.

---

### Story 3 - Phê Duyệt Hồ Sơ Chuyên Gia KH&CN Phân Cấp Cấp 2 & Hậu Kiểm Trung Ương (Sheet Admin #3)
**User Persona**: `PROVINCIAL_ADMIN` (Lãnh đạo Sở Tỉnh), `CLUSTER_ADMIN` (Chuyên viên Sở / Viện) & `SUPER_ADMIN` (Trung ương NacenTech).  
**Bối cảnh**: Nhà khoa học/chuyên gia nộp hồ sơ Lý lịch khoa học (LLKH) để xin cấp xác nhận Chuyên gia trên nền tảng, lựa chọn đơn vị thẩm định theo địa bàn tỉnh hoặc viện liên kết.

**Acceptance Criteria**:
1. **Given** ứng viên nộp hồ sơ đăng ký thẩm định về Sở KH&CN Tỉnh (ví dụ: Hải Phòng - `HP`), **When** hồ sơ nộp thành công, **Then** hệ thống gắn `ScopeType = "PROVINCE"` và `ScopeId = "HP"`, tự động đẩy vào Hàng đợi Cổng công vụ `/gov/approvals` của Sở Hải Phòng.
2. **Given** Chuyên viên Sở (`CLUSTER_ADMIN`) tiếp nhận hồ sơ tại `/gov/approvals`, **When** mở chi tiết LLKH và bằng chứng AI Scan, **Then** chuyên viên thực hiện sơ kiểm cấp 1: yêu cầu bổ sung (nếu thiếu chứng từ) hoặc trình Lãnh đạo Sở ký duyệt.
3. **Given** Lãnh đạo Sở (`PROVINCIAL_ADMIN`) kiểm tra hồ sơ đạt chuẩn, **When** bấm [Phê duyệt Chính thức], **Then** tài khoản được trực tiếp cấp vai trò `VERIFIED_EXPERT` thuộc địa bàn tỉnh mà không cần chờ Trung ương phê duyệt lại, ghi nhận Audit Log bất biến.
4. **Given** Chuyên gia đã được Sở Tỉnh phê duyệt, **When** dữ liệu cập nhật, **Then** Super Admin NacenTech nhận thông báo trên Bảng Hậu Kiểm Toàn Quốc (`/admin/approvals`), có quyền xem xét hồ sơ và thực thi quyền can thiệp tối cao thu hồi (`REVOKE_EXPERT`) nếu phát hiện vi phạm theo `BR-ADM-007`.

---

### Story 4 - Phê Duyệt Hồ Sơ Nhu Cầu Công Nghệ (Bên Mua) (Sheet Admin #4)
**User Persona**: `SECTOR_LEADER` (Trưởng Ngành TT17) & `PROVINCE_OFFICER`.  
**Bối cảnh**: Bên Mua (Doanh nghiệp sản xuất) gửi phiếu bài toán công nghệ cần tìm kiếm giải pháp.

**Acceptance Criteria**:
1. **Given** bài toán tìm mua công nghệ thuộc ngành "Cơ khí - Tự động hóa", **When** Trưởng ngành mở hàng đợi duyệt, **Then** hồ sơ xuất hiện để thẩm định nội dung, bảo đảm tính khả thi và không vi phạm bí mật thương mại.
2. **Given** nội dung duyệt thành công, **Then** bài toán được công khai trên Sàn Nhu cầu hoặc chuyển sang luồng AI Matching ghép cặp với các Nhà cung ứng phù hợp.

---

### Story 5 - Phân Quyền Cơ Sở Liên Kết & Cây Tổ Chức 63 Tỉnh (Sheet Admin #5)
**User Persona**: `SUPER_ADMIN` (Admin Tối Cao NacenTech).  
**Bối cảnh**: Super Admin thiết lập mạng lưới cơ sở liên kết gồm 63 Sở KH&CN, các Viện, Trường đại học.

**Acceptance Criteria**:
1. **Given** giao diện Cây tổ chức (`UI-ORG-TREE-001`), **When** Super Admin chọn Tỉnh X chưa có quản trị viên, **Then** hệ thống cho phép tạo tài khoản quản trị Sở (`PROVINCE_LEADER`) và gửi email bàn giao quyền.
2. **Given** một Viện nghiên cứu nộp hồ sơ liên kết, **When** Sở Tỉnh hoặc NacenTech phê duyệt, **Then** hệ thống cấp mã đơn vị liên kết (`ORG_UNIT`) và kích hoạt tài khoản `INSTITUTION_ADMIN`.

### Story 6 - Quản Lý 10 Vai Trò & Phân Quyền Tài Khoản (Role Management)
**User Persona**: `SUPER_ADMIN` (Admin Tối Cao NacenTech).  
**Bối cảnh**: Super Admin cần xem ma trận quyền hạn của 10 roles chuẩn và gán vai trò cùng phạm vi (Scope) cho các tài khoản cán bộ mới.

**Acceptance Criteria**:
1. **Given** màn hình Quản lý Vai trò (`UI-ADMIN-ROLES-001`), **When** Admin truy cập, **Then** hệ thống hiển thị ma trận phân quyền 10 Roles với các quyền: Thẩm định hồ sơ, Ký duyệt, Quản trị tỉnh, Quản trị ngành, Cấu hình hệ thống.
2. **Given** form gán vai trò, **When** Admin nhập email cán bộ, chọn Role và chọn Scope (Ví dụ: `PROVINCIAL_ADMIN` + Scope `HN`), **Then** hệ thống kiểm tra tính hợp lệ và cập nhật vai trò, ghi nhật ký kiểm toán bất biến.
3. **Given** người dùng không có vai trò `SUPER_ADMIN` hoặc `OPERATOR_ADMIN`, **When** cố tình gọi API gán quyền, **Then** hệ thống chặn với mã `403 Forbidden`.

---

### Story 7 - Cây Thư Mục 34 Tỉnh Thành Trọng Điểm & Cơ Sở Liên Kết (34 Key Innovation Hubs)
**User Persona**: `SUPER_ADMIN` & `PROVINCIAL_ADMIN`.  
**Bối cảnh**: Quản lý mạng lưới 34 tỉnh thành phố trọng điểm KH&CN đổi mới sáng tạo toàn quốc, phân bổ theo 3 miền Bắc - Trung - Nam.

**Acceptance Criteria**:
1. **Given** giao diện Cây tổ chức (`UI-ORG-TREE-001`), **When** mở cây thư mục, **Then** hiển thị đầy đủ 3 miền: Miền Bắc (12 tỉnh trọng điểm), Miền Trung & Tây Nguyên (10 tỉnh trọng điểm), Miền Nam (12 tỉnh trọng điểm).
2. **Given** Admin bấm chọn một Tỉnh (Ví dụ: "Sở KH&CN TP. Hà Nội"), **Then** bảng chi tiết bên phải tải thông tin: Mã Scope (`HN`), Lãnh đạo phụ trách, thống kê số lượng Viện/Trường, Chuyên gia, Doanh nghiệp trên địa bàn và danh sách cơ sở liên kết.
3. **Given** một tỉnh chưa có Lãnh đạo Sở, **When** Admin bấm [Bổ Nhiệm Lãnh Đạo Sở], **Then** mở Modal gán tài khoản và kích hoạt quyền `PROVINCIAL_ADMIN` ngay tại cây đơn vị.

---

## 3. Business Rules (Quy Tắc Nghiệp Vụ Bắt Buộc)

| Mã Rule | Tên Quy Tắc | Điều Kiện Kích Hoạt & Logic Xử Lý | Mã Lỗi / Phản Ứng |
| :--- | :--- | :--- | :--- |
| **BR-ADM-001** | **3D Scoped Row-Level Security** | Truy vấn dữ liệu tự động gắn điều kiện: nếu `ScopeType = "PROVINCE"` thì `ScopeId == currentActor.ScopeId`; tương tự với `SECTOR` và `ORG_UNIT`. Cấm truy cập vượt scope. | `403 Forbidden` (`ERR_DATA_SCOPE_VIOLATION`) |
| **BR-ADM-002** | **Optimistic Locking Concurrency** | Khi gửi lệnh Review (`APPROVE`, `REJECT`), client bắt buộc truyền `expected_version`. Nếu phiên bản CSDL khác `expected_version` $\rightarrow$ hủy giao dịch. | `409 Conflict` (`ERR_RECORD_ALREADY_MODIFIED`) |
| **BR-ADM-003** | **Immutable Audit Trail** | 100% hành vi kiểm duyệt, thay đổi trạng thái, cấp quyền đều được ghi vào bảng `approval_audit_logs` (User, Action, Scope, IP, Timestamp). Lưu tối thiểu 365 ngày. | Không được phép bypass |
| **BR-ADM-004** | **Lý Do Bắt Buộc Khi Từ Chối** | Khi từ chối hoặc yêu cầu sửa đổi hồ sơ, ghi chú (`review_note`) bắt buộc phải có độ dài từ 10 đến 500 ký tự. | `422 Unprocessable` (`ERR_REVIEW_NOTE_REQUIRED`) |
| **BR-ADM-005** | **Cam Kết SLA Thẩm Định** | Duyệt tài khoản $\le 4$h; Duyệt Shop & Nhu cầu $\le 24$h; Duyệt Chuyên gia $\le 48$h. Quá hạn tự động đánh dấu cảnh báo `SLA_BREACHED`. | Hiển thị tag cảnh báo đỏ |
| **BR-ADM-006** | **Cơ Cấu Cây Đơn Vị 3 Cấp** | Cấu trúc phân cấp đơn vị: Trung ương (Root) $\rightarrow$ Sở Tỉnh / Viện $\rightarrow$ Đơn vị thành viên. Không cho phép xóa đơn vị nếu còn tài khoản liên kết đang hoạt động. | `400 Bad Request` (`ERR_ORG_UNIT_HAS_CHILDREN`) |
| **BR-ADM-007** | **Quyền Hạn Can Thiệp Tối Cao** | `SUPER_ADMIN` và `NACEN_ADMIN` có quyền xem toàn bộ hồ sơ toàn quốc (`GLOBAL`), có quyền thu hồi quyết định phê duyệt cấp dưới nếu phát hiện vi phạm. | Ghi log đặc biệt Cấp độ 3 |
| **BR-ADM-008** | **Ủy Quyền Gán Role Chuẩn** | Chỉ `SUPER_ADMIN` mới có quyền gán vai trò `SUPER_ADMIN`, `OPERATOR_ADMIN` hoặc `PROVINCIAL_ADMIN`. Cán bộ không được tự leo thang đặc quyền. | `403 Forbidden` (`ERR_PRIVILEGE_ESCALATION`) |

---

## 4. Non-Functional Requirements (NFR)

1. **Hiệu Năng (Performance)**:
   - Thời gian kiểm tra quyền và phân giải Scope: $\le 50$ms (P99).
   - Thời gian tải danh sách hàng đợi duyệt: $\le 300$ms (P95 cho 50 bản ghi/trang).
2. **Bảo Mật (Security)**:
   - Tuân thủ Nghị định 85/2016/NĐ-CP Cấp độ 3: Bắt buộc mã hóa đường truyền TLS 1.3, xác thực đa yếu tố với tài khoản quản trị.
   - Bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (PDPD Consent & Masking SĐT/CCCD).
3. **Khả Năng Chịu Tải & Sẵn Sàng (Scalability & Availability)**:
   - Hỗ trợ $\ge 2.000$ concurrent admin/officer thao tác đồng thời trên toàn quốc.
   - Uptime hệ sinh thái quản trị $\ge 99.9\%$.

---

## 5. Spec Delta v3: Quản Lý 10 Vai Trò & Cây Thư Mục 34 Tỉnh Thành Trọng Điểm

- **Căn cứ nâng cấp**: Yêu cầu PO hoàn thiện năng lực Quản trị Admin: Quản lý vai trò (Role Management) và hiển thị Cây thư mục 34 tỉnh thành trọng điểm KH&CN toàn quốc.
- **Phạm vi bổ sung**:
  - `FR-ADM-004`: API & UI Bảng ma trận quyền hạn 10 Roles (`GET /api/v1/governance/roles/matrix`).
  - `FR-ADM-005`: API & UI Gán vai trò và Scope cho tài khoản cán bộ (`POST /api/v1/governance/roles/assign`).
  - `FR-ADM-006`: Cây thư mục 34 tỉnh thành trọng điểm KH&CN chia 3 miền (Bắc 12, Trung 10, Nam 12) kèm thống kê và drilldown cơ sở liên kết (`GET /api/v1/governance/org-units/key-provinces`).

---

## 6. Spec Delta v4: Phân Cấp Phê Duyệt Chuyên Gia Cho Cấp 2 (Sở Tỉnh) & Trung Ương Hậu Kiểm

- **Bối cảnh & Căn cứ nâng cấp**: Hoàn thiện giải pháp phân cấp quản lý chuyên gia trong mô hình đa cấp (Basic Design v2.6). Chuyển giao thẩm quyền phê duyệt chuyên gia KH&CN cho Cấp 2 (Lãnh đạo Sở KH&CN Tỉnh / Đơn vị liên kết) trực tiếp quản lý địa bàn, Trung ương (Super Admin) tập trung hậu kiểm và can thiệp thu hồi khi phát hiện sai phạm.
- **Yêu cầu chức năng mới**:
  - `FR-ADM-007 (Wizard TASK-05 Phân Cấp Tiếp Nhận)`: Form nâng cấp chuyên gia bổ sung ô chọn "Cơ quan / Sở KH&CN tiếp nhận thẩm định" (danh mục 34 tỉnh thành trọng điểm KH&CN + TW). Payload gửi lên bao gồm `scopeType: "PROVINCE"`, `scopeId: provinceCode` và đồng bộ tạo `ApprovalRequest` loại `EXPERT` với SLA 48h.
  - `FR-ADM-008 (Cổng Tác Nghiệp Cấp 2 /gov)`: Màn hình tác nghiệp cho Cán bộ Sở (`PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) kết nối API `/api/v1/approvals` với Row-Level Security tự động theo `ScopeId`. Cung cấp Review Pane chi tiết, modal phê duyệt cấp tỉnh (`APPROVE`) kích hoạt cấp role `VERIFIED_EXPERT`, và modal từ chối bắt buộc lý do $\ge 10$ ký tự (`REJECT`).
  - `FR-ADM-009 (Trung Ương Hậu Kiểm & Thu Hồi)`: Giao diện `/admin/approvals` của `SUPER_ADMIN` cho phép giám sát danh bạ toàn quốc, lọc hồ sơ đã duyệt theo từng tỉnh, và thực thi thao tác can thiệp `REVOKE_EXPERT` (Thu hồi quyền chuyên gia) kèm bắt buộc nhập lý do vi phạm theo `BR-ADM-007`.
- **Tiêu chuẩn chấp thuận (Acceptance Criteria)**:
  - *AC-DELTA-01*: Chuyên gia chọn "Sở KH&CN Hải Phòng", hồ sơ gửi lên có `ScopeType = "PROVINCE"`, `ScopeId = "HP"`. Cán bộ Sở KH&CN Hải Phòng đăng nhập vào `/gov` nhìn thấy hồ sơ trong hàng đợi. Cán bộ Sở Hà Nội (`ScopeId = "HN"`) không nhìn thấy hồ sơ này.
  - *AC-DELTA-02*: Cán bộ Sở bấm [Phê duyệt hồ sơ], hệ thống chuyển trạng thái sang `APPROVED`, kích hoạt cấp vai trò `VERIFIED_EXPERT` với `ScopeType = "PROVINCE"`, `ScopeId = "HP"` cho tài khoản.
  - *AC-DELTA-03*: `SUPER_ADMIN` đăng nhập vào `/admin/approvals`, xem được hồ sơ đã duyệt của các Sở tỉnh, có nút [Thu hồi quyền chuyên gia]. Khi bấm và nhập lý do $\ge 10$ ký tự, hệ thống ghi vết `ApprovalAuditLog` hành động `REVOKE_EXPERT` và hạ cấp role của người dùng về `PUBLIC_USER`.

---

## 7. Spec Delta v5: Vận Hành Cây Hành Chính 3 Cấp Online & Full CRUD (CR-2026-006)

- **Căn cứ nâng cấp**: Yêu cầu PO đưa Cây thư mục hành chính 3 cấp (Trung ương $\rightarrow$ Sở Tỉnh $\rightarrow$ Cơ sở) vận hành thực tế 100% với CSDL PostgreSQL thật, loại bỏ hoàn toàn mock data tĩnh và hỗ trợ đầy đủ các thao tác Thêm, Sửa, Vô hiệu hóa/Xóa.
- **Yêu cầu chức năng mới**:
  - `FR-ADM-010 (Online Tree Data Query)`: Màn hình `/admin/org-tree` gọi API `GET /api/v1/governance/org-units` và `/34-provinces` từ PostgreSQL thật thay thế mảng tĩnh `INITIAL_ORG_TREE`.
  - `FR-ADM-011 (Thêm Đơn Vị Cấp 2/3)`: `POST /api/v1/governance/org-units` cho phép SuperAdmin tạo đơn vị mới với đầy đủ mã (`code` UK), tên (`name`), phân cấp (`unitType`), đơn vị cha (`parentId`), và tỉnh thành (`provinceId`).
  - `FR-ADM-012 (Chỉnh Sửa Thông Tin Đơn Vị)`: `PUT /api/v1/governance/org-units/{id}` cho phép cập nhật tên đơn vị, thông tin người phụ trách (`leaderName`, `leaderEmail`), và thứ tự hiển thị.
  - `FR-ADM-013 (Vô Hiệu Hóa / Xóa Có Ràng Buộc)`: `DELETE /api/v1/governance/org-units/{id}` thực hiện chuyển trạng thái sang `INACTIVE` (Soft-delete). Bắt buộc chặn xóa với lỗi `400 BadRequest` (`ERR_CANNOT_DELETE_PARENT_WITH_ACTIVE_CHILDREN`) nếu đơn vị còn chứa bất kỳ đơn vị con nào đang `ACTIVE`.
  - `FR-ADM-014 (Web UI Full CRUD & 5 UX States)`: Giao diện web `/admin/org-tree` cung cấp modal Thêm cơ sở con, modal Sửa đơn vị, modal Xóa kèm thông báo kiểm tra ràng buộc dữ liệu, và hiển thị trạng thái `<Async>`.
- **Quy tắc nghiệp vụ**:
  - `BR-TREE-001`: Mã `code` duy nhất toàn hệ thống (Case-insensitive).
  - `BR-TREE-002`: Phân cấp 3 tầng chuẩn (`NATIONAL` -> `PROVINCIAL` -> `INSTITUTION`).
  - `BR-TREE-003`: Chặn vô hiệu hóa / xóa đơn vị nếu còn đơn vị con trực thuộc đang hoạt động.
- **Tiêu chuẩn chấp thuận (Acceptance Criteria)**:
  - *AC-TREE-01*: Gọi `GET /api/v1/governance/org-units` trả về danh sách đơn vị từ PostgreSQL thật với `status = "ACTIVE"`.
  - *AC-TREE-02*: Tạo mới một đơn vị cơ sở `INST-TEST` trực thuộc Sở Hà Nội thành công, dữ liệu được ghi vào PostgreSQL và xuất hiện ngay trên cây.
  - *AC-TREE-03*: Cập nhật thông tin đơn vị qua `PUT` thành công, lưu vết `ApprovalAuditLog`.
  ---

## 8. Spec Delta v6 (CR-2026-012): Bàn Quản Trị Người Dùng & Phân Vai Trò 10 Roles (/admin/users) [GAP-02]

**Căn cứ thay đổi:** Quyết định PO `PO-DEC-20261013-10` & HTML Wireframe SSOT (`Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/wireframe_quan_ly_nguoi_dung_admin.html`).

### 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
Trước Delta v6, tuyến `/admin/users` trên Web Portal bị `redirect("/admin/roles")` cưỡng bức, khiến Quản trị viên (Super Admin) không có giao diện quản lý danh sách tài khoản độc lập để tìm kiếm người dùng, lọc theo vai trò/trạng thái, xem chi tiết định danh, khóa/mở khóa tài khoản, hoặc đặt lại mật khẩu. Mặc dù Backend đã có đầy đủ API `GET/POST/PATCH /api/v1/admin/users`.

### 2. Yêu Cầu Chức Năng Bổ Sung (Requirements Delta)
- **REQ-ADM-015 (Màn Hình Quản Trị Người Dùng /admin/users)**:
  - Xây dựng Data Table người dùng kết nối trực tiếp `GET /api/v1/admin/users`:
    - Thanh tìm kiếm: Theo Tên, Email, Số điện thoại, Mã định danh.
    - Bộ lọc vai trò: Lọc theo 10 vai trò 3D Scoped RBAC (`SUPER_ADMIN`, `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`, `ENTERPRISE`, `BUYER`, `SELLER`, `VERIFIED_EXPERT`, `INNOVATION_ENTITY`, `OPERATOR_ADMIN`, `USER`).
    - Bộ lọc trạng thái: `Tất cả`, `Đang hoạt động (ACTIVE)`, `Đang bị khóa (LOCKED)`.
    - Cột thông tin: Avatar/Monogram, Họ và Tên, Email/SĐT, Vai trò chính, Trạng thái (Badge xanh/đỏ), Ngày tạo, Thao tác.
- **REQ-ADM-016 (Hành Động Quản Trị Tài Khoản)**:
  - Nút **[Khóa / Mở khóa tài khoản]**: Gọi `PATCH /api/v1/admin/users/{id}` với `isActive: !currentStatus` kèm hộp thoại xác nhận `ConfirmModal`.
  - Nút **[Đặt lại mật khẩu]**: Modal sinh/nhập mật khẩu mới gọi `POST /api/v1/admin/users/{id}/reset-password`.
  - Nút **[Xem chi tiết]**: Drawer hiển thị lịch sử đăng nhập, hồ sơ pháp nhân/chuyên gia liên kết.

### 3. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **AC-DELTA-12**: Truy cập `/admin/users` với tài khoản Admin hiển thị danh sách người dùng, không bị redirect sang `/admin/roles`.
- **AC-DELTA-13**: Thao tác Khóa và Mở khóa tài khoản cập nhật tức thì trạng thái badge trên giao diện và gọi đúng API backend.



