# Data Model: User Registration for User Site

## Entity: User

- **Purpose**: Đại diện tài khoản người dùng cuối.
- **Core Fields**:
  - `id` (UUID, primary)
  - `email` (string, unique, normalized)
  - `password` (string, hashed)
  - `firstName` (string, optional)
  - `lastName` (string, optional)
  - `phone` (string, optional)
  - `organization` (string, optional)
  - `role` (enum: `user`, `admin`)
  - `isActive` (boolean)
  - `createdAt`, `updatedAt` (timestamp)
- **Validation Rules**:
  - Email bắt buộc, đúng định dạng, không trùng (so sánh không phân biệt hoa thường).
  - Password bắt buộc, tối thiểu theo policy hiện hành.
- **State Transitions**:
  - `PendingActivation` (`isActive=false`) -> `Active` (`isActive=true`) khi token hợp lệ.
  - Không chuyển về `PendingActivation` từ flow này.

## Entity: ActivationToken

- **Purpose**: Lưu thông tin token kích hoạt tài khoản một lần.
- **Core Fields**:
  - `id` (UUID, primary)
  - `userId` (UUID, FK -> User)
  - `token` (string, unique, opaque)
  - `expiresAt` (timestamp)
  - `consumedAt` (timestamp, nullable)
  - `createdAt` (timestamp)
- **Validation Rules**:
  - Token phải unique và không được dùng lại sau khi `consumedAt` có giá trị.
  - Token chỉ hợp lệ khi `now < expiresAt` và `consumedAt` là null.
- **State Transitions**:
  - `Issued` -> `Consumed` khi kích hoạt thành công.
  - `Issued` -> `Expired` khi quá hạn.
  - Resend tạo token mới, token cũ được vô hiệu hóa theo chính sách.

## Entity: RegistrationAttempt (ephemeral/operational)

- **Purpose**: Theo dõi giới hạn tần suất đăng ký và resend.
- **Core Fields**:
  - `subject` (IP/email key)
  - `windowStart` (timestamp)
  - `count` (integer)
- **Validation Rules**:
  - Chỉ tồn tại trong cửa sổ rate-limit.
  - Vượt ngưỡng thì từ chối request kèm thông báo phù hợp.

## Relationships

- Một `User` có thể có nhiều `ActivationToken` theo thời gian (do resend).
- Tại một thời điểm, chỉ một token hợp lệ cho luồng kích hoạt đang mở.

## Derived Business Rules

- Email đã tồn tại và đã kích hoạt: từ chối đăng ký mới.
- Email đã tồn tại nhưng chưa kích hoạt: không tạo user mới, chỉ hỗ trợ resend activation.
- Kích hoạt thành công phải là thao tác idempotent ở mức business outcome (trạng thái cuối cùng của user là active).

## Implementation alignment notes

- User mới tạo từ luồng public registration có `isActive=false` cho đến khi activate thành công.
- Mỗi lần resend tạo token mới và vô hiệu token pending cũ bằng cách đánh dấu `consumedAt`.
- Register/resend rate limit được lưu dạng ephemeral counter (Redis cache), không cần bảng persist riêng.
