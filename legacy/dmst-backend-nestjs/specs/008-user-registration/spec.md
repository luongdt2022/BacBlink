# Feature Specification: User Registration for User Site

**Feature Branch**: `008-user-registration`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "iúp mình lam tinh nang dang ky cho user site, ca giao dien front end cho user site va backend api"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tạo tài khoản mới (Priority: P1)

Là khách truy cập chưa có tài khoản, tôi muốn điền form đăng ký trên user site để tạo tài khoản mới và bắt đầu sử dụng dịch vụ.

**Why this priority**: Đây là giá trị cốt lõi của tính năng; nếu không có luồng tạo tài khoản thì toàn bộ tính năng đăng ký không có ý nghĩa.

**Independent Test**: Có thể kiểm thử độc lập bằng cách truy cập trang đăng ký, nhập thông tin hợp lệ, gửi form và xác nhận tài khoản mới được tạo ở trạng thái có thể tiếp tục kích hoạt.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập và chưa có tài khoản với email đó, **When** người dùng nhập thông tin hợp lệ và gửi đăng ký, **Then** hệ thống tạo tài khoản mới và hiển thị thông báo đăng ký thành công.
2. **Given** người dùng nhập email đã tồn tại, **When** gửi đăng ký, **Then** hệ thống từ chối tạo tài khoản mới và hiển thị lỗi trùng email rõ ràng.

---

### User Story 2 - Kích hoạt tài khoản (Priority: P2)

Là người dùng vừa đăng ký, tôi muốn xác nhận quyền sở hữu email để kích hoạt tài khoản trước khi đăng nhập.

**Why this priority**: Kích hoạt giúp giảm tài khoản giả và đảm bảo tài khoản thuộc về đúng người đăng ký.

**Independent Test**: Có thể kiểm thử độc lập bằng cách dùng tài khoản đã đăng ký, thực hiện xác nhận email hợp lệ và kiểm tra trạng thái tài khoản chuyển sang đã kích hoạt.

**Acceptance Scenarios**:

1. **Given** tài khoản mới đăng ký chưa kích hoạt, **When** người dùng hoàn tất bước xác nhận email hợp lệ, **Then** tài khoản chuyển sang trạng thái đã kích hoạt và sẵn sàng đăng nhập.
2. **Given** liên kết xác nhận không hợp lệ hoặc đã hết hạn, **When** người dùng truy cập liên kết đó, **Then** hệ thống thông báo lỗi và cung cấp cách yêu cầu gửi lại xác nhận.

---

### User Story 3 - Nhận lỗi rõ ràng khi đăng ký thất bại (Priority: P3)

Là người dùng đăng ký, tôi muốn nhận thông báo lỗi dễ hiểu để sửa thông tin và thử lại nhanh.

**Why this priority**: Trải nghiệm lỗi rõ ràng giúp giảm bỏ dở quy trình và giảm yêu cầu hỗ trợ.

**Independent Test**: Có thể kiểm thử độc lập bằng cách gửi form thiếu/không hợp lệ và xác minh từng lỗi hiển thị đúng vị trí, đúng nguyên nhân, không mất dữ liệu đã nhập hợp lệ.

**Acceptance Scenarios**:

1. **Given** người dùng để trống trường bắt buộc hoặc nhập sai định dạng, **When** gửi form, **Then** hệ thống hiển thị thông báo lỗi cụ thể theo từng trường.
2. **Given** yêu cầu đăng ký gặp lỗi tạm thời, **When** gửi form, **Then** hệ thống hiển thị thông báo thất bại thân thiện và cho phép người dùng thử lại.

### Edge Cases

- Người dùng gửi đăng ký nhiều lần liên tiếp trong thời gian ngắn.
- Người dùng dùng email có khác biệt chữ hoa/chữ thường nhưng cùng giá trị logic.
- Người dùng đóng trang giữa chừng rồi quay lại đăng ký.
- Người dùng mở liên kết kích hoạt nhiều lần sau khi đã kích hoạt thành công.
- Người dùng truy cập trang đăng ký khi đã đăng nhập.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST cung cấp trang đăng ký cho người dùng chưa đăng nhập trên user site.
- **FR-002**: Hệ thống MUST cho phép người dùng nhập tối thiểu các thông tin đăng ký gồm họ tên, email và mật khẩu.
- **FR-003**: Hệ thống MUST kiểm tra tính hợp lệ của dữ liệu đầu vào trước khi tạo tài khoản (trường bắt buộc, định dạng email, độ mạnh mật khẩu, xác nhận mật khẩu khớp).
- **FR-004**: Hệ thống MUST từ chối đăng ký khi email đã tồn tại và trả về thông báo lỗi rõ ràng cho người dùng.
- **FR-005**: Hệ thống MUST tạo tài khoản mới ở trạng thái chưa kích hoạt sau khi thông tin đăng ký hợp lệ.
- **FR-006**: Hệ thống MUST gửi hướng dẫn kích hoạt tài khoản đến email đã đăng ký.
- **FR-007**: Hệ thống MUST cho phép người dùng kích hoạt tài khoản bằng liên kết xác nhận một lần trong thời hạn hiệu lực xác định.
- **FR-008**: Hệ thống MUST cho phép người dùng yêu cầu gửi lại hướng dẫn kích hoạt khi liên kết cũ không còn hợp lệ.
- **FR-009**: Hệ thống MUST hiển thị thông báo thành công/thất bại theo ngữ cảnh, dễ hiểu và có thể hành động tiếp theo.
- **FR-010**: Hệ thống MUST giới hạn tần suất gửi yêu cầu đăng ký từ cùng một nguồn để giảm lạm dụng.
- **FR-011**: Hệ thống MUST ghi nhận các sự kiện đăng ký và kích hoạt để hỗ trợ vận hành và xử lý sự cố.
- **FR-012**: Hệ thống MUST cung cấp các giao diện dịch vụ cho frontend user site để thực hiện đăng ký, kích hoạt và gửi lại xác nhận.

### Key Entities *(include if feature involves data)*

- **User Account**: Đại diện tài khoản người dùng cuối; gồm thông tin định danh cơ bản, trạng thái kích hoạt, thời điểm tạo và thời điểm kích hoạt.
- **Registration Submission**: Đại diện yêu cầu đăng ký tại thời điểm người dùng gửi form; gồm dữ liệu người dùng nhập, trạng thái xử lý và lý do thất bại (nếu có).
- **Activation Verification**: Đại diện thông tin xác nhận kích hoạt; gồm mã/liên kết xác nhận, thời điểm hết hạn, số lần sử dụng và trạng thái hiệu lực.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ít nhất 90% người dùng mới hoàn tất quy trình đăng ký và gửi yêu cầu thành công trong vòng 3 phút.
- **SC-002**: Ít nhất 95% yêu cầu đăng ký hợp lệ nhận được phản hồi kết quả (thành công hoặc lỗi nghiệp vụ rõ ràng) trong vòng 2 giây.
- **SC-003**: Ít nhất 85% tài khoản mới được kích hoạt thành công trong vòng 24 giờ sau khi đăng ký.
- **SC-004**: Tỷ lệ người dùng hoàn tất đăng ký ngay lần thử đầu tiên đạt tối thiểu 80% trong tháng đầu phát hành.
- **SC-005**: Giảm ít nhất 30% ticket hỗ trợ liên quan đến lỗi đăng ký sau 2 chu kỳ báo cáo liên tiếp.

## Assumptions

- Tính năng phục vụ người dùng tự đăng ký tài khoản cá nhân, không bao gồm quy trình tạo tài khoản thủ công bởi quản trị viên.
- Bản phát hành đầu tiên chỉ bao gồm luồng đăng ký bằng email và mật khẩu; đăng nhập mạng xã hội nằm ngoài phạm vi.
- Người dùng có quyền truy cập email hợp lệ để nhận và hoàn tất bước kích hoạt.
- Nội dung điều khoản sử dụng/chính sách quyền riêng tư đã có sẵn để gắn vào màn hình đăng ký.
- User site đã có luồng đăng nhập riêng; tính năng này chỉ đảm bảo tài khoản mới có thể được kích hoạt và sẵn sàng cho luồng đăng nhập đó.
