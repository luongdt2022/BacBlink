# Feature Specification: Success & Failure Stories

**Feature Branch**: `015-success-failure-stories`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "giờ mình cần làm 1 tính năng như sau 1, câu chuyện thành công, câu chuyện thất bại - bài học rút ra, cái này sẽ cho phép người dùng tự nhập phía user cũng như admin cũng có thể tự tạo bên phía admin và cũng như xây API cho backend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Người dùng tạo câu chuyện (Priority: P1)

Người dùng (user role) muốn chia sẻ trải nghiệm của họ thông qua một câu chuyện thành công hoặc thất bại. Họ có thể tạo mới, chỉnh sửa và xóa câu chuyện của chính mình.

**Why this priority**: Đây là luồng cốt lõi tạo ra nội dung. Không có nội dung người dùng thì tính năng không có giá trị.

**Independent Test**: Người dùng đăng nhập → vào trang "Câu chuyện" → tạo câu chuyện mới → chọn loại → điền tiêu đề, nội dung → lưu → câu chuyện xuất hiện trong danh sách.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** họ điền đầy đủ tiêu đề, nội dung và chọn loại câu chuyện rồi lưu, **Then** câu chuyện được tạo thành công và hiển thị trong danh sách.
2. **Given** người dùng chọn loại "Thất bại - Bài học rút ra", **When** họ lưu mà không điền trường "Bài học rút ra", **Then** hệ thống báo lỗi và từ chối lưu.
3. **Given** người dùng đã tạo câu chuyện, **When** họ chỉnh sửa nội dung và lưu, **Then** bản cập nhật được ghi nhận và hiển thị ngay.
4. **Given** người dùng đã tạo câu chuyện, **When** họ xóa câu chuyện, **Then** câu chuyện bị xóa khỏi danh sách.

---

### User Story 2 - Admin quản lý câu chuyện (Priority: P1)

Admin có thể xem toàn bộ câu chuyện của tất cả người dùng, tạo câu chuyện mới, chỉnh sửa, ẩn/hiện hoặc xóa bất kỳ câu chuyện nào.

**Why this priority**: Admin cần quyền kiểm soát nội dung để đảm bảo chất lượng và tuân thủ quy định nền tảng.

**Independent Test**: Admin đăng nhập vào trang quản trị → vào mục "Câu chuyện" → tạo câu chuyện mới → ẩn một câu chuyện của người dùng → câu chuyện đó không hiển thị với người dùng thông thường.

**Acceptance Scenarios**:

1. **Given** admin đăng nhập, **When** vào trang quản lý câu chuyện, **Then** thấy danh sách toàn bộ câu chuyện kèm thông tin người tạo, loại và trạng thái.
2. **Given** admin tạo câu chuyện mới với dữ liệu hợp lệ, **When** lưu, **Then** câu chuyện được tạo thành công.
3. **Given** admin ẩn một câu chuyện, **When** người dùng thông thường xem danh sách, **Then** câu chuyện đó không xuất hiện.
4. **Given** admin xóa câu chuyện của người dùng, **When** người dùng đó đăng nhập, **Then** câu chuyện không còn tồn tại.

---

### User Story 3 - Xem danh sách và chi tiết câu chuyện (Priority: P2)

Người dùng có thể duyệt danh sách câu chuyện, lọc theo loại (thành công / thất bại) và xem chi tiết từng câu chuyện để học hỏi kinh nghiệm.

**Why this priority**: Đây là phần tiêu thụ nội dung — người dùng cần đọc và học hỏi từ câu chuyện của nhau.

**Independent Test**: Người dùng vào trang "Câu chuyện" → lọc theo loại "Thất bại" → click vào một câu chuyện → xem đầy đủ nội dung và bài học rút ra.

**Acceptance Scenarios**:

1. **Given** có ít nhất một câu chuyện đang hiển thị, **When** người dùng vào trang danh sách, **Then** câu chuyện hiển thị với tiêu đề, loại và tóm tắt.
2. **Given** người dùng chọn bộ lọc "Thất bại", **When** danh sách được tải lại, **Then** chỉ hiển thị câu chuyện loại thất bại.
3. **Given** người dùng click vào một câu chuyện, **When** trang chi tiết mở, **Then** toàn bộ nội dung và bài học rút ra (nếu có) được hiển thị đầy đủ.

---

### User Story 4 - API backend cho câu chuyện (Priority: P1)

Hệ thống cung cấp REST API để frontend và bên thứ ba có thể thực hiện đầy đủ thao tác CRUD trên câu chuyện với phân quyền phù hợp theo role.

**Why this priority**: API là nền tảng để mọi luồng frontend hoạt động, không có API thì không có gì.

**Independent Test**: Gọi API tạo câu chuyện với token hợp lệ → nhận 201 Created → gọi API lấy danh sách → câu chuyện vừa tạo xuất hiện → gọi API xóa → câu chuyện biến mất.

**Acceptance Scenarios**:

1. **Given** request tạo câu chuyện có dữ liệu hợp lệ và token xác thực, **When** API nhận request, **Then** trả về 201 Created kèm dữ liệu câu chuyện.
2. **Given** request thiếu trường bắt buộc, **When** API nhận request, **Then** trả về 400 Bad Request với thông báo lỗi cụ thể.
3. **Given** người dùng cố xóa câu chuyện của người khác, **When** API nhận request, **Then** trả về 403 Forbidden.
4. **Given** admin gọi API ẩn câu chuyện, **When** thành công, **Then** trả về 200 OK và câu chuyện biến mất khỏi API public.

---

### Edge Cases

- Người dùng gửi nội dung câu chuyện rỗng hoặc chỉ có khoảng trắng — hệ thống báo lỗi validation.
- Câu chuyện loại "Thất bại" không có trường "Bài học rút ra" — hệ thống từ chối lưu và hiển thị thông báo.
- Tiêu đề hoặc nội dung vượt giới hạn ký tự — hệ thống báo cảnh báo và từ chối lưu.
- Người dùng cố chỉnh sửa câu chuyện đã bị admin ẩn — hệ thống cho phép chỉnh sửa nhưng trạng thái hiển thị vẫn do admin kiểm soát.
- Xóa câu chuyện khi người khác đang xem — người xem thấy thông báo "Nội dung không còn tồn tại".
- Danh sách câu chuyện lớn — phân trang mặc định 20 items/trang.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép người dùng đã xác thực tạo câu chuyện với loại: "Thành công" hoặc "Thất bại - Bài học rút ra".
- **FR-002**: Hệ thống PHẢI yêu cầu trường "Bài học rút ra" khi loại câu chuyện là "Thất bại".
- **FR-003**: Người dùng PHẢI có thể chỉnh sửa và xóa câu chuyện do chính họ tạo.
- **FR-004**: Admin PHẢI có thể xem, tạo, chỉnh sửa, ẩn/hiện và xóa bất kỳ câu chuyện nào.
- **FR-005**: Hệ thống PHẢI cung cấp REST API thực hiện đầy đủ CRUD trên câu chuyện.
- **FR-006**: API PHẢI phân quyền: người dùng chỉ sửa/xóa câu chuyện của mình; admin có toàn quyền.
- **FR-007**: Hệ thống PHẢI hỗ trợ lọc danh sách câu chuyện theo loại (thành công / thất bại).
- **FR-008**: Danh sách câu chuyện PHẢI được phân trang (mặc định 20 items/trang).
- **FR-009**: Câu chuyện bị admin ẩn PHẢI không xuất hiện trong API và UI dành cho người dùng thông thường.
- **FR-010**: Hệ thống PHẢI validate dữ liệu đầu vào và trả về thông báo lỗi rõ ràng khi dữ liệu không hợp lệ.
- **FR-011**: Form nhập câu chuyện PHẢI sử dụng rich text editor cho trường "Nội dung chính" và "Bài học rút ra" (hỗ trợ heading, bold/italic, danh sách, blockquote, link).
- **FR-012**: Form PHẢI có toggle để chuyển trạng thái giữa "Nháp" và "Công khai" và nút Lưu để ghi nhận.

### Key Entities

- **Story (Câu chuyện)**: Đơn vị nội dung chính với các trường:
  - **Tiêu đề** (bắt buộc): text ngắn, tối đa 255 ký tự
  - **Loại** (bắt buộc): `success` | `failure`
  - **Nội dung chính** (bắt buộc): rich text — hỗ trợ heading, bold/italic, danh sách, blockquote, link
  - **Bài học rút ra** (bắt buộc khi loại là `failure`): rich text — cùng định dạng với nội dung chính
  - **Trạng thái đăng** (bắt buộc): `draft` (nháp) | `published` (công khai) — toggle trực tiếp trên form
  - **Trạng thái hiển thị** (do admin): `visible` | `hidden`
  - Người tạo, ngày tạo, ngày cập nhật
- **StoryType**: `success` (Thành công) | `failure` (Thất bại - Bài học rút ra)
- **StoryPublishStatus**: `draft` | `published` — do người dùng kiểm soát khi lưu
- **StoryVisibility**: `visible` | `hidden` — do admin kiểm soát độc lập với publish status
- **User**: Người tạo câu chuyện — user thông thường hoặc admin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể hoàn thành việc tạo một câu chuyện trong vòng 3 phút.
- **SC-002**: Danh sách câu chuyện tải xong trong vòng 2 giây với lượng dữ liệu thông thường.
- **SC-003**: 100% thao tác trái quyền bị từ chối — không có trường hợp người dùng thường xóa/sửa câu chuyện của người khác.
- **SC-004**: Admin ẩn câu chuyện và câu chuyện biến mất khỏi danh sách người dùng ngay trong lần tải trang tiếp theo.
- **SC-005**: API trả về cấu trúc response nhất quán cho cả thành công và lỗi.
- **SC-006**: 95% lỗi validation có thông báo cụ thể, người dùng biết cần sửa gì.

## Assumptions

- Hệ thống xác thực (authentication) đã tồn tại — tính năng này tái sử dụng cơ chế đăng nhập hiện tại.
- Admin được phân biệt với user thông thường qua role đã có trong hệ thống.
- Câu chuyện sử dụng rich text editor (tái sử dụng component đã có trong hệ thống).
- Câu chuyện mới tạo mặc định là `draft` — người dùng toggle sang "Công khai" khi sẵn sàng.
- Câu chuyện ở trạng thái `published` + `visible` mới hiển thị với người dùng khác.
- Không có file đính kèm.
- Không có tính năng bình luận, reaction hoặc chia sẻ trong phạm vi tính năng này.
- Tìm kiếm full-text trong câu chuyện ngoài phạm vi v1.
- Câu chuyện chỉ dành cho người dùng đã đăng nhập — không có chế độ xem công khai (anonymous).
