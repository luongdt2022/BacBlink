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





---

## 9. Spec Delta v4 (CR-2026-020): Trung Tâm Phê Duyệt Toàn Quốc & Năng Lực Vượt Cấp (Admin Override) [Delta v4]

**Căn cứ thay đổi**: Quyết định PO `CR-2026-020` & HTML Wireframe SSOT (`Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/wireframe_admin_tong_hanh_dinh.html`).

### 1. Bối Cảnh & Vấn Đề (Context & Problem Statement)
Trong mô hình phân cấp quản trị đa tầng, 63 Sở KH&CN Tỉnh/Thành được trao quyền tiếp nhận và sơ kiểm/thẩm định các loại hồ sơ (Chào bán công nghệ, Nhu cầu công nghệ, Nâng hạng Chuyên gia KH&CN, Hồ sơ Doanh nghiệp ĐMST). Tuy nhiên, trên thực tế xuất hiện các điểm nghẽn nghiêm trọng:
1. **Nghẽn tắc SLA cấp Sở**: Một số Sở địa phương quá tải hoặc thiếu cán bộ chuyên trách dẫn đến hồ sơ bị tồn đọng quá thời hạn cam kết công vụ (SLA > 72h làm việc), ảnh hưởng trực tiếp đến quyền lợi của nhà khoa học và doanh nghiệp.
2. **Thiếu cơ chế can thiệp tối cao**: Trước Delta v4, Quản trị viên Trung ương (`SUPER_ADMIN`, `OPERATOR_ADMIN`) chỉ có quyền xem hoặc hậu kiểm thu hồi sau khi Sở đã duyệt, nhưng **không có cơ chế can thiệp duyệt thay (Override)** đối với các hồ sơ đang bị Sở ngâm trễ hạn hoặc các đề tài trọng điểm cấp Quốc gia cần xử lý khẩn cấp.
3. **Cơ cấu Menu phân mảnh**: Thanh Sidebar chưa được nhóm theo các khối chức năng điều hành, thiếu phân khu rõ ràng cho Trung tâm phê duyệt và giám sát SLA toàn quốc.

### 2. Yêu Cầu Chức Năng Bổ Sung (Requirements Delta)

#### REQ-ADMIN-08: Trung Tâm Phê Duyệt Toàn Quốc & Quản Lý Hàng Đợi 63 Tỉnh/Thành
- **Phạm vi hiển thị & Truy vấn**:
  - Xây dựng Trung tâm Phê duyệt Toàn quốc tại `/admin/approvals` tập hợp toàn bộ hồ sơ đang chờ xử lý từ tất cả 63 Sở KH&CN trên toàn quốc (`Scope = GLOBAL`).
  - Hỗ trợ bộ lọc đa chiều:
    - Theo Địa phương: Dropdown 63 Sở KH&CN Tỉnh/Thành (Hà Nội, TP.HCM, Hải Phòng, Đà Nẵng, Cần Thơ...).
    - Theo Loại hồ sơ: `TECH_SUPPLY` (Chào bán CN), `TECH_DEMAND` (Nhu cầu CN), `EXPERT` (Chuyên gia KH&CN), `INNOVATION_ENTITY` (Doanh nghiệp ĐMST).
    - Theo Tình trạng SLA: Tất cả, Còn hạn (`SLA_NORMAL`), Sắp quá hạn (`SLA_WARNING`), Quá hạn (`SLA_BREACHED`).
    - Ô tìm kiếm toàn văn theo Mã hồ sơ, Tên chủ thể, MST, Lĩnh vực.
  - Hỗ trợ 3 Tabs điều hướng:
    - Tab 1 (`/admin/approvals`): Tất cả hàng đợi phê duyệt toàn quốc.
    - Tab 2 (`/admin/approvals?tab=sla`): Cảnh báo quá hạn SLA Sở tỉnh (chỉ hiển thị hồ sơ có `is_sla_breached = true`).
    - Tab 3 (`/admin/approvals?tab=override`): Danh sách hồ sơ đã hoặc cần thực thi Phê duyệt Vượt cấp / Can thiệp.
- **Năng lực Can thiệp Phê duyệt Vượt cấp (Admin Override)**:
  - Cung cấp nút thao tác **[Duyệt Thay / Can Thiệp]** nổi bật bên cạnh nút **[Xem Chi Tiết]** trên từng dòng hồ sơ.
  - Khi kích hoạt, hiển thị Modal can thiệp vượt cấp bắt buộc nhập lý do giải trình và cam kết trách nhiệm.
  - Sau khi xác nhận thành công, hệ thống trực tiếp cấp quyền/chuyển trạng thái `APPROVED` cho hồ sơ, không cần chờ Sở địa phương duyệt nữa.

### 3. Quy Tắc Nghiệp Vụ (Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Logic Nghiệp Vụ & Ràng Buộc Kỹ Thuật | Phản Ứng Khi Vi Phạm |
| :--- | :--- | :--- | :--- |
| **BR-ADMIN-SLA** | **Quy Tắc Tính Hạn SLA Thẩm Định Cấp Sở** | - Thời hạn SLA thẩm định hồ sơ tại Sở KH&CN địa phương mặc định là **72 giờ làm việc** (Working Hours: 08:00 - 17:00 từ Thứ 2 đến Thứ 6, trừ ngày nghỉ lễ theo Luật Lao động).<br>- Hệ thống chạy background job định kỳ mỗi 15 phút quét toàn bộ bảng `approval_requests` có `status IN ('PENDING_REVIEW', 'PENDING_APPROVAL')`.<br>- Nếu `current_time > submitted_at + 72 working hours` $\rightarrow$ Tự động chuyển cờ `is_sla_breached = true`, tính `sla_overdue_hours` và đánh dấu tag đỏ cảnh báo `SLA_BREACHED`. | Tự động kích hoạt cảnh báo đỏ trên UI và bắn notification nhắc nhở cán bộ Sở. |
| **BR-ADMIN-OVERRIDE** | **Quy Tắc Phê Duyệt Vượt Cấp (Admin Override)** | - **Thẩm quyền thực thi**: CHỈ người dùng mang vai trò `SUPER_ADMIN` hoặc `OPERATOR_ADMIN` (Tầng 0) mới có quyền gọi API can thiệp duyệt thay (`POST /api/v1/admin/approvals/{id}/override`). Cán bộ cấp Sở (`PROVINCIAL_ADMIN`, `CLUSTER_ADMIN`) bị cấm tuyệt đối.<br>- **Điều kiện kích hoạt**: Hồ sơ phải thuộc một trong hai trường hợp: (1) Đã bị quá hạn SLA cấp Sở (`is_sla_breached == true`); hoặc (2) Có cờ khẩn cấp cấp Quốc gia (`is_national_priority == true`).<br>- **Bắt buộc nhập lý do giải trình**: Trường `override_reason` là bắt buộc, độ dài **tối thiểu 20 ký tự**, tối đa 1000 ký tự. Cấm khoảng trắng rỗng.<br>- **Cam kết trách nhiệm**: Bắt buộc trường `confirm_commitment: true` xác nhận chịu trách nhiệm trước Bộ KH&CN.<br>- **Khóa lạc quan (Optimistic Locking)**: Request bắt buộc gửi kèm `expected_version`. Nếu bản ghi đã bị Cán bộ Sở hoặc Admin khác cập nhật trước đó $\rightarrow$ Chặn với lỗi `409 Conflict`.<br>- **Thông báo & Lưu vết**: Tự động ghi bản ghi bất biến vào `approval_audit_logs` với action `ADMIN_OVERRIDE_APPROVE` và phát tán Domain Event `ApprovalOverriddenDomainEvent` gửi email + thông báo đến Sở địa phương sở tại. | - Thiếu lý do $\ge 20$ ký tự $\rightarrow$ `422 UnprocessableEntity` (`ERR_OVERRIDE_REASON_MIN_LENGTH`).<br>- Không đúng Role $\rightarrow$ `403 Forbidden`.<br>- Xung đột phiên bản $\rightarrow$ `409 Conflict` (`ERR_RECORD_ALREADY_MODIFIED`). |

### 4. Giao Diện & Bố Cục UX (UI Specification)

#### UI-ADMIN-08: Ma Trận 5 UX States & Bố Cục Accordion 4 Nhóm 8 Menu Items
- **Cơ cấu Sidebar Accordion 4 Nhóm & 8 Menu Items**:
  - **Nhóm 1: TRUNG TÂM ĐIỀU HÀNH**:
    1. Tổng quan Dashboard 360° & BI Toàn quốc (`/admin`)
  - **Nhóm 2: TRUNG TÂM PHÊ DUYỆT TOÀN QUỐC**:
    2. Tất cả Hàng đợi Phê duyệt (`/admin/approvals`)
    3. Cảnh báo Quá hạn SLA Sở Tỉnh (`/admin/approvals?tab=sla`)
    4. Phê duyệt Vượt cấp / Can thiệp (`/admin/approvals?tab=override`)
  - **Nhóm 3: QUẢN TRỊ DANH MỤC & CƠ CẤU**:
    5. Quản lý 10 Vai trò (RBAC) (`/admin/users`)
    6. Cây Tổ chức 63 Sở KH&CN Tỉnh/Thành (`/admin/org-tree`)
    7. Danh mục 18 Ngành TT17 & TRL (`/admin/master-data`)
  - **Nhóm 4: GIÁM SÁT & VẬN HÀNH**:
    8. Nhật ký Kiểm toán Toàn quốc (Audit Logs) (`/admin/audit-logs`)
    9. Cấu hình Tham số & SLA Hệ thống (`/admin/system-config`)
- **Ma trận 5 Trạng Thái UX Chuẩn Hóa qua Component `<Async>`**:

| Trạng Thái UX | Biểu Hiện Trên Giao Diện Trung Tâm Phê Duyệt (`/admin/approvals`) | Trải Nghiệm & Hành Động Người Dùng |
| :--- | :--- | :--- |
| **1. Loading** | Hiển thị 5 dòng Skeleton Table với hiệu ứng shimmer màu xám nhạt tại vùng bảng dữ liệu; các nút filter và tab ở trạng thái disabled. | Người dùng nhận biết hệ thống đang tải dữ liệu từ CSDL, không gây giật lag giao diện. |
| **2. Empty** | Khi bộ lọc không tìm thấy hồ sơ nào (hoặc không có hồ sơ quá hạn SLA), hiển thị minh họa SVG chiếc hộp rỗng kèm thông báo: *"Không có hồ sơ nào cần xử lý trong phạm vi đã chọn."* | Nút bấm *"Đặt lại bộ lọc"* để đưa bảng về trạng thái mặc định. |
| **3. Error** | Khi API ngắt kết nối mạng hoặc server trả về lỗi `500 InternalServerError`, hiển thị khối Alert màu đỏ kèm mã lỗi và nút *"Thử lại ngay"* (`retry()`). | Không làm sập toàn bộ trang dashboard admin, cô lập lỗi trong khung dữ liệu bảng. |
| **4. Success** | Hiển thị bảng hàng đợi đầy đủ các cột thông tin, phân trang 10/25/50 bản ghi, highlight tag đỏ nhấp nháy cho hồ sơ quá hạn SLA, nút *"Duyệt Thay / Can Thiệp"* sẵn sàng thao tác. | Cho phép mở Modal can thiệp, lọc và tìm kiếm tức thì. |
| **5. Partial / Updating** | Khi Admin vừa submit modal Duyệt can thiệp hoặc chuyển trang phân trang, dòng hồ sơ liên quan hiển thị spinner xoay nhẹ và lớp phủ mờ 50% trong thời gian gọi API. | Ngăn chặn double click (spam submit) và phản hồi trạng thái cập nhật mượt mà. |

### 5. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **AC-DELTA-V4-01**: Truy cập `/admin` hiển thị Sidebar gồm đủ 4 nhóm Accordion và 8 menu items đúng đường dẫn và cấu trúc thẩm quyền.
- **AC-DELTA-V4-02**: Truy cập `/admin/approvals` hiển thị bảng hàng đợi với dữ liệu từ 63 Sở KH&CN toàn quốc, hỗ trợ lọc theo từng Tỉnh/Thành và Loại hồ sơ.
- **AC-DELTA-V4-03**: Các hồ sơ quá hạn SLA (> 72h làm việc) tự động hiển thị badge đỏ nhấp nháy `SLA_BREACHED` kèm số giờ quá hạn cụ thể theo `BR-ADMIN-SLA`.
- **AC-DELTA-V4-04**: Bấm nút [Duyệt Thay / Can Thiệp] mở Modal "Admin Override". Nếu nhập lý do dưới 20 ký tự hoặc chưa tích cam kết, nút [Xác Nhận Duyệt Can Thiệp] bị disabled và hiển thị thông báo lỗi.
- **AC-DELTA-V4-05**: Khi submit duyệt can thiệp hợp lệ, hệ thống gọi API `POST /api/v1/admin/approvals/{id}/override`, cập nhật trạng thái `APPROVED`, ghi Audit Log bất biến và gửi thông báo về Sở KH&CN liên quan. Nếu phiên bản bị xung đột, trả về mã `409 Conflict` theo `BR-ADMIN-OVERRIDE`.

---

## PHẦN 8: DELTA V5 — CHUẨN HÓA CỔNG CÔNG VỤ CẤP SỞ KH&CN (`/gov`) VỚI SIDEBAR ACCORDION 4 NHÓM & 3D SCOPED RBAC

### 1. Bối Cảnh Nghiệp Vụ & Mục Tiêu (PO-DEC-20261023-02)
- Cổng Công Vụ Cấp Sở KH&CN (`/gov/*`) phục vụ các Cán bộ và Lãnh đạo của 63 Sở KH&CN tỉnh thành (vai trò `PROVINCIAL_ADMIN`, `PROVINCE_OFFICER`, `PROVINCE_LEADER`).
- Khắc phục tình trạng layout cũ chỉ có thanh tab ngang mỏng trên đỉnh, làm mất định hướng không gian làm việc và che giấu các tính năng quan trọng (`/gov/demands`, `/gov/approvals/enterprises`).
- Nâng cấp đồng bộ layout của `/gov` sang cấu trúc **Sidebar Menu bên trái dạng Accordion 4 nhóm** tương tự `/admin`.

### 2. Ma Trận Quy Tắc Nghiệp Vụ (Business Rules - Delta v5)
- **`BR-GOV-SIDEBAR-01`**: Mọi cán bộ Sở KH&CN khi đăng nhập vào `/gov/*` bắt buộc phải nhìn thấy Sidebar Menu bên trái với chiều rộng cố định `w-72` trên Desktop (có thể thu gọn/mở dạng Drawer trên màn hình nhỏ).
- **`BR-GOV-SIDEBAR-02`**: Cây điều hướng bao gồm 4 nhóm Accordion mở mặc định:
  - **Nhóm 1: Kiểm Duyệt Hồ Sơ Địa Bàn**:
    1. *Tất cả hàng đợi* (`/gov?tab=ALL`)
    2. *Chuyên gia KH&CN* (`/gov?tab=EXPERT`)
    3. *Shop Chào Bán / Sáng chế TRL* (`/gov?tab=SHOP`)
    4. *Nhu cầu Công nghệ* (`/gov?tab=DEMAND`)
    5. *Tài khoản Pháp nhân / DN ĐMST* (`/gov?tab=ACCOUNT` & `/gov/approvals/enterprises`)
  - **Nhóm 2: Thẩm Định Công Nghệ TT17**:
    6. *Hội đồng Chấm điểm TT17* (`/gov/assessments/tt17`)
  - **Nhóm 3: Giám Sát Cung - Cầu & Địa Bàn**:
    7. *Tiến trình Đàm phán & SLA 48h* (`/gov/opportunities`)
    8. *Bài toán Nhu cầu DNNVV Địa bàn* (`/gov/demands`)
  - **Nhóm 4: Quản Trị Công Vụ & Nhân Sự Sở**:
    9. *Phân công Cán bộ & Chuyên viên* (`/gov/settings/staff`)
- **`BR-GOV-SCOPE-03`**: Sidebar Header hiển thị huy hiệu `TẦNG 1: QUẢN TRỊ NHÀ NƯỚC`, tên cơ quan `Sở KH&CN [Tỉnh/Thành]`, mã Scope (`HN`, `SG`, `HP`...) và cam kết `SLA <= 48h`.
- **`BR-GOV-LABEL-04`**: Khắc phục nhầm lẫn thuật ngữ Maker-Checker. Sửa badge tiêu đề trên Header `/gov` thành: `Quy Trình Kiểm Duyệt 2 Cấp (Maker-Checker) • Phê Duyệt Cấp 2: Lãnh Đạo Sở KH&CN`.
- **`BR-GOV-ISOLATION-05`**: Dữ liệu danh sách trong toàn bộ các trang `/gov/*` tuyệt đối bị cô lập theo địa bàn được phân quyền (`scope_type = 'PROVINCE'` & `scope_id = @User.ScopeId`), không thể truy xuất hồ sơ của địa phương khác.

### 3. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria - Delta v5)
- **AC-DELTA-V5-01**: Truy cập `/gov` hiển thị Sidebar Menu bên trái gồm đủ 4 nhóm Accordion và 9 menu items với đầy đủ icon và trạng thái active tương ứng với URL/Tab hiện tại.
- **AC-DELTA-V5-02**: Bấm vào các mục trong Nhóm 1 chuyển đúng tab lọc dữ liệu trên `/gov` (`EXPERT`, `SHOP`, `DEMAND`, `ACCOUNT`, `ALL`) và cập nhật URL query param không tải lại trang.
- **AC-DELTA-V5-03**: Nối thông suốt liên kết đến `/gov/demands` và `/gov/approvals/enterprises` trên Sidebar, không còn route bị sót.
- **AC-DELTA-V5-04**: Header hiển thị rõ ràng địa bàn thẩm quyền (ví dụ: `Hà Nội (HN)`) và SLA $\le 48\text{h}$.
- **AC-DELTA-V5-05**: Không làm gãy chức năng duyệt hồ sơ của Cán bộ Sở, 100% test case hồi quy của phân hệ `/gov` tiếp tục pass.



---

## 10. Đặc Tả Delta v5 (CR-2026-021) — Tinh Gọn Điều Hướng & Trải Nghiệm Người Dùng Tầng 0 [Delta v5]

**Căn cứ thay đổi**: Quyết định PO `CR-2026-021` (Kế hoạch nâng cấp Delta v5 Phase 1) & Wireframe SSOT (`Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/wireframe_admin_tong_hanh_dinh.html`).

### 1. Bối Cảnh & Mục Tiêu (Context & Objectives)
Trong phiên bản Delta v4, hệ thống đã thiết lập Trung tâm Phê duyệt Toàn quốc và Sidebar Accordion 4 nhóm 8 menu items trên Cổng Quản Trị Hệ Thống Tối Cao (Tầng 0). Tuy nhiên, qua quá trình kiểm thử thực địa và phản hồi từ Lãnh đạo/Chuyên viên vận hành:
1. **Nghịch lý điều hướng kép (Navigation Redundancy)**: Tồn tại song song thanh điều hướng ngang (`<AdminNav />`) bên cạnh Sidebar, làm chật chội không gian hiển thị của các bảng dữ liệu lớn (bảng hàng đợi, cây tổ chức, bảng phân quyền).
2. **Lỗi trễ URL State**: Việc nhấp chọn các menu con từ Sidebar (`/admin/approvals?tab=sla`, `/admin/approvals?tab=override`) chưa phản ứng tức thì (reactive) nếu component không lắng nghe `useSearchParams()` đúng chuẩn Next.js App Router.
3. **Phân tán danh mục địa phương**: Cần chuẩn hóa dứt khoát 100% dữ liệu địa bàn về **34 Tỉnh/Thành phố trọng điểm ĐMST** theo Master Excel (thay cho 63 tỉnh), đảm bảo tính tập trung của CSDL Đổi mới sáng tạo Quốc gia.

---

### 2. Yêu Cầu Chức Năng Bổ Sung (Functional Requirements Delta)

#### REQ-ADMIN-09: Breadcrumbs Navigation Thay Thế Top Nav Trùng Lặp
- **Loại bỏ Top Nav trùng lặp**:
  - Gỡ bỏ hoàn toàn component điều hướng ngang `<AdminNav />` tại tất cả các trang quản trị (`/admin/approvals`, `/admin/roles`, `/admin/org-tree`, `/admin/sectors`, `/admin/audit-logs`, `/admin/system-config`).
  - Toàn bộ điều hướng chính phân hệ được quy hoạch tập trung 100% vào Sidebar Accordion 4 nhóm.
- **Tích hợp Breadcrumbs tinh gọn**:
  - Bố trí thanh đường dẫn Breadcrumbs tại đầu vùng nội dung chính (`main content`), ngay trên khối tiêu đề trang.
  - Cấu trúc đường dẫn ngữ cảnh:
    $$\text{Trang chủ} \rightarrow \text{Quản Trị Hệ Thống} \rightarrow \text{[Tên phân hệ con]}$$
  - Mỗi node đường dẫn là một liên kết tương tác (`<Link>`):
    + `Trang chủ`: chuyển hướng về `/`.
    + `Quản Trị Hệ Thống`: chuyển hướng về Tổng quan Admin `/admin`.
    + `[Tên phân hệ con]`: hiển thị tên phân hệ hiện tại với `aria-current="page"` (ví dụ: *"Hàng Đợi Phê Duyệt Toàn Quốc"*, *"Quản Lý 10 Vai Trò"*, *"Cây Thư Mục 34 Tỉnh/Thành"*).
  - Khả năng tiếp cận: Chuẩn WAI-ARIA breadcrumbs pattern (`<nav aria-label="Breadcrumb">`, `<ol>`, `<li>`).

#### REQ-ADMIN-10: Bộ Lọc Hàng Đợi 34 Tỉnh/Thành Chuẩn Hóa & Reactive URL State
- **Phản ứng nhanh với URL State (Reactive Tab Switching)**:
  - Trang `/admin/approvals` lắng nghe tham số truy vấn `tab` thông qua `useSearchParams()`.
  - Khi người dùng nhấp chọn link từ Sidebar hoặc Breadcrumbs hoặc gõ trực tiếp URL:
    + `?tab=sla`: Kích hoạt ngay tab *"Cảnh báo Quá hạn SLA Sở Tỉnh"*, bảng tự động lọc các hồ sơ `is_sla_breached = true`.
    + `?tab=override`: Kích hoạt ngay tab *"Phê duyệt Vượt cấp / Can thiệp"*, hiển thị các hồ sơ đủ điều kiện Admin Override.
    + Không có tham số hoặc `tab=all`: Kích hoạt tab *"Tất cả Hàng đợi Phê duyệt"*.
  - Khi người dùng chuyển tab trên giao diện qua các nút bấm Tab, URL tự động cập nhật qua `router.push('/admin/approvals?tab=...', { scroll: false })` không gây giật lag trang.
- **Bộ lọc Địa phương chuẩn hóa 34 Tỉnh/Thành**:
  - Dropdown Địa phương hiển thị đầy đủ và chuẩn xác 34 Tỉnh/Thành phố trọng điểm ĐMST theo `BR-ADMIN-34PROV`.
  - Lựa chọn địa phương được gắn kết vào state gọi API `GET /api/v1/admin/approvals?provinceCode={code}&page=1`, tự động reset trang về 1 khi đổi địa phương.

---

### 3. Quy Tắc Nghiệp Vụ (Business Rules)

| Mã Quy Tắc | Tên Quy Tắc | Logic Nghiệp Vụ & Ràng Buộc Kỹ Thuật | Phản Ứng Khi Vi Phạm |
| :--- | :--- | :--- | :--- |
| **BR-ADMIN-34PROV** | **Danh Mục Chuẩn 34 Tỉnh/Thành Phố Trọng Điểm ĐMST** | - Nền tảng NacenTwin vận hành CSDL và phân cấp quản trị tập trung trên đúng **34 Tỉnh/Thành phố trọng điểm Đổi mới Sáng tạo (ĐMST)** theo Master Excel SSOT.<br>- Danh mục 34 tỉnh/thành được phân bổ theo 3 miền:<br>  1. **Miền Bắc (12)**: Hà Nội, Hải Phòng, Bắc Ninh, Quảng Ninh, Hưng Yên, Thái Nguyên, Phú Thọ, Ninh Bình, Cao Bằng, Tuyên Quang, Lào Cai, Lạng Sơn.<br>  2. **Miền Trung & Tây Nguyên (10)**: Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Trị, Thừa Thiên Huế, Quảng Ngãi, Khánh Hòa, Đắk Lắk, Gia Lai, Lâm Đồng.<br>  3. **Miền Nam (12)**: TP. Hồ Chí Minh, Cần Thơ, Đồng Nai, Tây Ninh, Vĩnh Long, Đồng Tháp, An Giang, Cà Mau, Điện Biên, Lai Châu, Sơn La (khu vực kết nối Tây Bắc & liên kết ĐMST Tây Nam Bộ theo Đề tài).<br>- Toàn bộ tiêu đề UI, nhãn bộ lọc, dữ liệu thống kê KPI và cây thư mục tổ chức phải sử dụng đúng danh mục 34 tỉnh/thành, nghiêm cấm hiển thị danh sách 63 tỉnh hành chính chung chung. | Lọc ngoài danh mục 34 tỉnh $\rightarrow$ `400 BadRequest` (`ERR_INVALID_INNOVATION_PROVINCE_CODE`). |
| **BR-ADMIN-URL-STATE** | **Đồng Bộ Hai Chiều Trạng Thái URL & Bộ Lọc** | - Mọi thay đổi về Tab (`tab`), Mã Tỉnh (`provinceCode`), và Từ khóa tìm kiếm (`searchQuery`) tại Bảng hàng đợi đều phải đồng bộ vào URL Query Parameters.<br>- Khi tải trang lần đầu, hệ thống ưu tiên đọc state từ URL Query Params để dựng trạng thái ban đầu của bảng (Initial State Hydration).<br>- Đảm bảo khi Admin gửi link ca trực (ví dụ: `/admin/approvals?tab=sla&provinceCode=HN`) cho đồng nghiệp, người nhận truy cập sẽ nhìn thấy chính xác giao diện và dữ liệu đã được lọc. | Tham số URL không hợp lệ $\rightarrow$ Tự động fallback về tab mặc định `all` mà không gây vỡ giao diện. |

---

### 4. Giao Diện & Bố Cục UX (UI Specification)

#### UI-ADMIN-09: Ma Trận 5 UX States & Bố Cục Loại Bỏ `<AdminNav />` Thay Bằng Breadcrumbs
- **Bố cục giao diện Tinh gọn**:
  - Vùng nội dung chính (`main`) được giải phóng hoàn toàn khỏi thanh ngang `<AdminNav />`, tăng 15% diện tích theo chiều dọc cho bảng hàng đợi và bảng dữ liệu.
  - Vị trí trên cùng: Component `<Breadcrumbs />` hiển thị phân cấp:
    `Trang chủ / Quản Trị Hệ Thống / [Tên phân hệ]`
  - Vị trí kế tiếp: Header Banner trang với badge `CR-2026-021 DELTA V5: TRUNG TÂM PHÊ DUYỆT TOÀN QUỐC & GIÁM SÁT 34 TỈNH/THÀNH PHỐ TRỌNG ĐIỂM ĐMST`.
  - Bộ lọc Dropdown Địa phương chuẩn hóa nhãn: `"Địa phương (34 Tỉnh/Thành phố trọng điểm ĐMST)"` với tùy chọn mặc định `"Toàn quốc (34 Tỉnh/Thành phố trọng điểm ĐMST)"`.
- **Ma trận 5 Trạng Thái UX Chuẩn Hóa qua Component `<Async>`**:

| Trạng Thái UX | Biểu Hiện Trên Giao Diện Bảng Hàng Đợi (`/admin/approvals`) | Trải Nghiệm & Hành Động Người Dùng |
| :--- | :--- | :--- |
| **1. Loading** | Hiển thị 5 dòng Skeleton Table mượt mà (shimmer) tại khu vực bảng dữ liệu; các nút chuyển tab và dropdown bộ lọc ở trạng thái giữ nguyên vị trí, không gây lay-out shift (CLS = 0). | Người dùng nhận biết hệ thống đang truy vấn dữ liệu từ PostgreSQL qua reactive URL, giao diện ổn định. |
| **2. Empty** | Khi bộ lọc không có hồ sơ (ví dụ: chọn tỉnh không có hồ sơ trễ hạn SLA), hiển thị icon SVG thư mục rỗng kèm thông điệp: *"Không có hồ sơ nào trong hàng đợi của 34 Tỉnh/Thành phố trọng điểm ĐMST theo tiêu chí đã chọn."* | Cung cấp nút *"Đặt lại bộ lọc"* để đưa về toàn bộ 34 tỉnh và tab mặc định. |
| **3. Error** | Khi API ngắt kết nối hoặc trả về lỗi, khối Alert cảnh báo hiển thị kèm mã lỗi rõ ràng và nút *"Tải lại dữ liệu"* (`refetch()`). Breadcrumbs vẫn giữ nguyên để người dùng điều hướng an toàn. | Người dùng không bị kẹt, có thể quay lui về `/admin` qua Breadcrumbs. |
| **4. Success** | Bảng hàng đợi hiển thị đầy đủ các cột dữ liệu theo chuẩn 34 tỉnh; tag đỏ `SLA_BREACHED` cho hồ sơ quá hạn; nút [Duyệt Can Thiệp] mở modal xác thực; URL cập nhật đúng `?tab=...`. | Thao tác mượt mà, phân trang chính xác, phản hồi tức thì. |
| **5. Partial / Updating** | Khi Admin chuyển đổi tab giữa `Tất cả` $\leftrightarrow$ `Cảnh báo SLA` $\leftrightarrow$ `Duyệt can thiệp`, bảng áp dụng lớp phủ mờ nhẹ (opacity-60) kèm thanh tiến trình mỏng phía trên bảng dữ liệu. | Tránh hiện tượng nhấp nháy toàn bộ trang, duy trì tính liên tục của trải nghiệm điều hành. |

---

### 5. Tiêu Chuẩn Chấp Thuận (Acceptance Criteria)
- **AC-DELTA-V5-01**: Truy cập bất kỳ trang con nào của Cổng Admin (`/admin/approvals`, `/admin/roles`, `/admin/org-tree`, `/admin/sectors`, `/admin/audit-logs`, `/admin/system-config`), tuyệt đối không còn xuất hiện thanh điều hướng ngang `<AdminNav />`.
- **AC-DELTA-V5-02**: Tại đầu mỗi trang quản trị, hiển thị Breadcrumbs chuẩn: `Trang chủ / Quản Trị Hệ Thống / [Tên phân hệ]`. Bấm `Trang chủ` về `/`, bấm `Quản Trị Hệ Thống` về `/admin`.
- **AC-DELTA-V5-03**: Nhấp vào menu Sidebar *"Cảnh báo Quá hạn SLA Sở Tỉnh"* (`/admin/approvals?tab=sla`) hoặc *"Phê duyệt Vượt cấp / Can thiệp"* (`/admin/approvals?tab=override`), trang lập tức chuyển sang đúng Tab tương ứng và hiển thị danh sách hồ sơ tương thích mà không cần tải lại trang.
- **AC-DELTA-V5-04**: Dropdown Địa phương tại `/admin/approvals` và `/admin/org-tree` hiển thị chuẩn danh mục 34 Tỉnh/Thành phố trọng điểm ĐMST theo `BR-ADMIN-34PROV`.
- **AC-DELTA-V5-05**: Toàn bộ tiêu đề, nhãn phụ, thống kê KPI trên giao diện hiển thị chuẩn xác cụm từ *"34 Tỉnh/Thành phố trọng điểm ĐMST"*, không còn tàn dư của cụm từ "63 tỉnh" hoặc "Tổng hành dinh".
