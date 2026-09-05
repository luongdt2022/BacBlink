# User Site Registration Flow

## UI states

- `idle`: Người dùng vừa vào trang đăng ký.
- `submitting`: Đang gửi thông tin đăng ký lên backend.
- `registered_pending_activation`: Đăng ký thành công, chờ kích hoạt qua email.
- `activation_success`: Kích hoạt tài khoản thành công.
- `activation_failed`: Token sai hoặc hết hạn.
- `rate_limited`: Tạm thời bị giới hạn tần suất thao tác.

## API integration mapping

- Đăng ký: `POST /api/v1/auth/register`
- Kích hoạt: `POST /api/v1/auth/activate`
- Gửi lại email kích hoạt: `POST /api/v1/auth/resend-activation`

## Error handling

Frontend luôn hiển thị trực tiếp trường `message` từ backend cho user-facing feedback.

Các nhóm lỗi chính:

- Validation input: hiển thị lỗi theo trường nhập.
- Duplicate email: hướng dẫn đăng nhập hoặc yêu cầu resend nếu chưa kích hoạt.
- Token invalid/expired: hiển thị nút `Gửi lại email kích hoạt`.
- Rate limit: hiển thị thông báo thử lại sau và khóa nút thao tác tạm thời.

## Response code mapping

| Backend code | UI action |
|--------------|-----------|
| `REGISTER_SUCCESS_PENDING_ACTIVATION` | Chuyển sang màn hình check email |
| `ACCOUNT_ACTIVATED_SUCCESS` | Hiển thị thành công và điều hướng trang đăng nhập |
| `ACTIVATION_EMAIL_RESENT` | Hiển thị toast đã gửi lại email |
