# Research: User Registration for User Site

## Decision 1: Account activation must be mandatory before first login

- **Decision**: Tài khoản mới được tạo ở trạng thái chưa kích hoạt; đăng nhập chỉ cho phép sau khi xác nhận email thành công.
- **Rationale**: Phù hợp yêu cầu spec về giảm tài khoản giả và xác thực quyền sở hữu email; giảm rủi ro spam account.
- **Alternatives considered**:
  - Kích hoạt thủ công bởi admin: không phù hợp self-service flow.
  - Cho đăng nhập ngay rồi kích hoạt sau: tăng rủi ro lạm dụng và sai mục tiêu kiểm soát danh tính.

## Decision 2: Use one-time activation token with explicit lifecycle

- **Decision**: Dùng token kích hoạt một lần, có thời hạn hiệu lực, có trạng thái đã dùng/chưa dùng và thời điểm dùng.
- **Rationale**: Hỗ trợ đầy đủ edge cases (token hết hạn, dùng lại token, resend) và truy vết vận hành.
- **Alternatives considered**:
  - Tái sử dụng JWT access token: khó kiểm soát single-use và vòng đời resend theo nghiệp vụ kích hoạt.
  - Mã OTP ngắn: UX nhập tay phức tạp hơn đối với luồng web email-link.

## Decision 3: Rate limit registration and resend operations

- **Decision**: Áp dụng giới hạn tần suất cho `register` và `resend-activation` theo nguồn gửi (IP) và định danh email.
- **Rationale**: Đáp ứng FR-010, giảm spam và abuse mail infrastructure.
- **Alternatives considered**:
  - Không giới hạn: rủi ro spam cao, tăng tải mail queue.
  - Chỉ giới hạn theo IP: chưa đủ cho trường hợp lạm dụng phân tán.

## Decision 4: Email sending remains asynchronous via existing mail queue

- **Decision**: Gửi email kích hoạt theo cơ chế async job tương tự pattern hiện có trong `mail` module.
- **Rationale**: Đảm bảo endpoint phản hồi nhanh và nhất quán với nguyên tắc non-blocking tác vụ tốn thời gian.
- **Alternatives considered**:
  - Gửi đồng bộ trong request: tăng độ trễ và rủi ro timeout.
  - Tích hợp external workflow mới: vượt quá phạm vi cần thiết.

## Decision 5: Preserve existing module ownership and avoid new abstraction layers

- **Decision**: `AuthService` điều phối, `UsersService` xử lý user data, `MailService` xử lý gửi mail; chỉ thêm thành phần mới khi có >=2 consumer rõ ràng.
- **Rationale**: Tuân thủ Constitution Principle I và V, giữ codebase gọn.
- **Alternatives considered**:
  - Thêm orchestration layer riêng cho registration: premature abstraction.

## Decision 6: Fix password hashing responsibility during registration path

- **Decision**: Quy định rõ một nơi duy nhất hash mật khẩu trong flow đăng ký để tránh hash lặp.
- **Rationale**: Tránh lỗi đăng nhập sau đăng ký và giữ nhất quán dữ liệu mật khẩu.
- **Alternatives considered**:
  - Giữ hash ở cả `AuthService` và `UsersService`: tạo bug nghiệp vụ và làm khó kiểm thử.

## Final implementation notes

- Register flow chuẩn hóa email về lower-case trước khi kiểm tra trùng và lưu dữ liệu.
- Endpoint registration/resend áp dụng rate limiting theo cặp `IP + email` qua cache Redis.
- Luồng gửi email kích hoạt sử dụng queue bất đồng bộ để tránh block HTTP response.
