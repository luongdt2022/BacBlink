# Requirements Document

## Introduction

Feature **013-collaboration-request** bổ sung khả năng gửi và quản lý yêu cầu hợp tác (collaboration request) giữa các intake đã được AI matching. Người dùng xem danh sách MatchCard trong tab matching của Intake Detail, chọn một intake phù hợp và gửi yêu cầu hợp tác trực tiếp. Hệ thống đảm bảo chỉ có một pending request tại một thời điểm cho mỗi intake nguồn. Người nhận có thể accept hoặc reject; khi accept, thông tin công khai của cả hai intake được hiển thị. Toàn bộ luồng được tích hợp với notification panel hiện có.

## Glossary

- **Collaboration_Request**: Yêu cầu hợp tác giữa hai intake, có trạng thái `pending | accepted | rejected | cancelled`.
- **Requester_Intake**: Intake của người gửi yêu cầu (`requesterIntakeId`).
- **Target_Intake**: Intake của người nhận yêu cầu (`targetIntakeId`).
- **MatchCard**: Component hiển thị một kết quả AI matching trong tab matching của Intake Detail.
- **MatchesSection**: Component chứa danh sách MatchCard.
- **Collaboration_Request_Panel**: Trang quản lý yêu cầu hợp tác tại `/my/collaboration-requests`.
- **Sent_Tab**: Tab "Đã gửi" trong Collaboration_Request_Panel, hiển thị các request đã gửi.
- **Received_Tab**: Tab "Nhận được" trong Collaboration_Request_Panel, hiển thị các request nhận được.
- **Notification_Panel**: Panel thông báo hiện có, hiển thị các notification theo type.
- **CollaborationRequest_API**: Tập hợp các endpoint `/api/v1/my/collaboration-requests/*`.

---

## Requirements

### Requirement 1: Gửi yêu cầu hợp tác từ MatchCard

**User Story:** As a người dùng đã đăng nhập, I want to gửi yêu cầu hợp tác trực tiếp từ một MatchCard trong tab matching, so that tôi có thể bắt đầu kết nối với đối tác phù hợp mà không cần rời khỏi trang.

#### Acceptance Criteria

1. WHEN người dùng mở tab matching của một intake đã published, THE MatchCard SHALL hiển thị button "Gửi yêu cầu hợp tác" cho mỗi kết quả matching.
2. WHEN người dùng click button "Gửi yêu cầu hợp tác" trên một MatchCard, THE Collaboration_Request_API SHALL gửi POST request với `requesterIntakeId` và `targetIntakeId` tương ứng mà không hiển thị popup xác nhận.
3. WHEN POST request thành công (HTTP 201), THE MatchCard SHALL hiển thị trạng thái "Đã gửi yêu cầu" thay cho button gửi.
4. WHEN POST request thành công, THE MatchesSection SHALL disable tất cả button "Gửi yêu cầu hợp tác" còn lại trong danh sách.
5. WHEN POST request thành công, THE MatchesSection SHALL hiển thị toast thông báo thành công.
6. IF POST request thất bại với HTTP 400 (duplicate pending), THEN THE MatchCard SHALL hiển thị toast lỗi "Bạn đã có một yêu cầu hợp tác đang chờ xử lý".
7. IF POST request thất bại với HTTP 403 hoặc 404, THEN THE MatchCard SHALL hiển thị toast lỗi chung và giữ nguyên trạng thái button.
8. WHILE POST request đang được xử lý, THE MatchCard SHALL hiển thị trạng thái loading trên button và disable tất cả button trong danh sách.
9. WHEN trang Intake Detail được tải và intake đã có một pending collaboration request, THE MatchesSection SHALL tự động disable tất cả button "Gửi yêu cầu hợp tác" và hiển thị trạng thái "Đã gửi yêu cầu" trên MatchCard tương ứng.
10. WHERE intake chưa được published, THE MatchCard SHALL không hiển thị button "Gửi yêu cầu hợp tác".

---

### Requirement 2: Quản lý yêu cầu đã gửi

**User Story:** As a người dùng đã đăng nhập, I want to xem và quản lý các yêu cầu hợp tác tôi đã gửi, so that tôi có thể theo dõi trạng thái và hủy nếu cần.

#### Acceptance Criteria

1. THE Collaboration_Request_Panel SHALL cung cấp route `/my/collaboration-requests` với hai tab: "Đã gửi" và "Nhận được".
2. WHEN người dùng truy cập tab "Đã gửi", THE Sent_Tab SHALL hiển thị danh sách collaboration request đã gửi với thông tin: tiêu đề intake nguồn, tiêu đề intake đích, trạng thái, thời gian tạo.
3. WHEN danh sách đã gửi được tải, THE Sent_Tab SHALL hỗ trợ phân trang với `page` và `limit=20`.
4. WHEN một request có status `pending`, THE Sent_Tab SHALL hiển thị button "Hủy yêu cầu" cho request đó.
5. WHEN người dùng click "Hủy yêu cầu", THE Collaboration_Request_API SHALL gửi DELETE request đến `/:id`.
6. WHEN DELETE request thành công, THE Sent_Tab SHALL cập nhật trạng thái request thành `cancelled` và ẩn button "Hủy yêu cầu".
7. IF DELETE request thất bại, THEN THE Sent_Tab SHALL hiển thị toast lỗi và giữ nguyên trạng thái.
8. WHEN một request có status `accepted`, THE Sent_Tab SHALL hiển thị badge "Đã chấp nhận" và link xem thông tin khớp.
9. WHEN một request có status `rejected`, THE Sent_Tab SHALL hiển thị badge "Đã từ chối" và cho phép người dùng quay lại tab matching để chọn intake khác.
10. WHEN một request có status `cancelled`, THE Sent_Tab SHALL hiển thị badge "Đã hủy".

---

### Requirement 3: Quản lý yêu cầu nhận được và accept/reject flow

**User Story:** As a người dùng đã đăng nhập, I want to xem và xử lý các yêu cầu hợp tác tôi nhận được, so that tôi có thể quyết định chấp nhận hoặc từ chối hợp tác.

#### Acceptance Criteria

1. WHEN người dùng truy cập tab "Nhận được", THE Received_Tab SHALL hiển thị danh sách collaboration request nhận được với thông tin: tiêu đề intake nguồn (của người gửi), tiêu đề intake đích (của mình), trạng thái, thời gian tạo.
2. WHEN danh sách nhận được được tải, THE Received_Tab SHALL hỗ trợ phân trang với `page` và `limit=20`.
3. WHEN một request có status `pending`, THE Received_Tab SHALL hiển thị button "Chấp nhận" và button "Từ chối".
4. WHEN người dùng click "Chấp nhận", THE Collaboration_Request_API SHALL gửi POST request đến `/:id/accept`.
5. WHEN accept thành công (HTTP 200), THE Received_Tab SHALL cập nhật trạng thái request thành `accepted` và hiển thị thông tin công khai của cả hai intake đã khớp.
6. WHEN accept thành công, THE Received_Tab SHALL hiển thị toast thành công "Đã chấp nhận yêu cầu hợp tác".
7. WHEN người dùng click "Từ chối", THE Collaboration_Request_API SHALL gửi POST request đến `/:id/reject`.
8. WHEN reject thành công (HTTP 200), THE Received_Tab SHALL cập nhật trạng thái request thành `rejected` và ẩn các button action.
9. WHEN accept thành công, THE Received_Tab SHALL hiển thị thông tin công khai của `requesterIntake` và `targetIntake` bao gồm: tiêu đề, loại (IP/Challenge), lĩnh vực, nội dung công khai.
10. IF accept hoặc reject request thất bại, THEN THE Received_Tab SHALL hiển thị toast lỗi và giữ nguyên trạng thái.
11. WHILE accept hoặc reject request đang được xử lý, THE Received_Tab SHALL disable các button action của request đó.

---

### Requirement 4: Tích hợp Notification

**User Story:** As a người dùng đã đăng nhập, I want to nhận thông báo khi có yêu cầu hợp tác mới hoặc khi yêu cầu của tôi được xử lý, so that tôi có thể phản hồi kịp thời.

#### Acceptance Criteria

1. THE Notification_Panel SHALL hiển thị notification với type `COLLABORATION_REQUEST_RECEIVED` khi người dùng nhận được một yêu cầu hợp tác mới.
2. THE Notification_Panel SHALL hiển thị notification với type `COLLABORATION_REQUEST_ACCEPTED` khi yêu cầu hợp tác của người dùng được chấp nhận.
3. THE Notification_Panel SHALL hiển thị notification với type `COLLABORATION_REQUEST_REJECTED` khi yêu cầu hợp tác của người dùng bị từ chối.
4. WHEN người dùng click vào một notification có type `COLLABORATION_REQUEST_RECEIVED`, THE Notification_Panel SHALL navigate đến `/my/collaboration-requests?tab=received`.
5. WHEN người dùng click vào một notification có type `COLLABORATION_REQUEST_ACCEPTED` hoặc `COLLABORATION_REQUEST_REJECTED`, THE Notification_Panel SHALL navigate đến `/my/collaboration-requests?tab=sent`.
6. THE Notification_Panel SHALL hiển thị message phù hợp cho từng type notification dựa trên `payload.message`.
7. WHEN notification type là `COLLABORATION_REQUEST_RECEIVED`, THE Notification_Panel SHALL hiển thị icon hoặc visual indicator phân biệt với `MATCH_FOUND`.
8. WHERE `payload.navigationPath` được cung cấp trong notification, THE Notification_Panel SHALL ưu tiên sử dụng `navigationPath` để navigate thay vì hardcode path.

---

### Edge Cases

- **Duplicate pending**: Nếu người dùng đã có một pending request từ intake A đến bất kỳ intake nào, tất cả button trong MatchesSection của intake A phải bị disable khi tải trang.
- **Self-request**: Backend trả về 400 nếu requester và target là cùng user; frontend hiển thị toast lỗi phù hợp.
- **Intake không published**: Button "Gửi yêu cầu hợp tác" không hiển thị nếu intake nguồn chưa published.
- **Auto-reject**: Khi một request được accept, backend tự động reject các pending request khác cho cùng `targetIntakeId`; frontend cần refresh danh sách sau khi accept.
- **Cancelled request**: Sau khi hủy, người dùng có thể gửi lại request mới từ MatchCard (button được enable lại khi không còn pending request).
- **Empty states**: Cả Sent_Tab và Received_Tab phải hiển thị empty state rõ ràng khi không có request nào.
- **Concurrent actions**: Trong khi một action (accept/reject/cancel) đang xử lý, các button liên quan phải bị disable để tránh double-submit.

---

## Success Criteria

- **SC-001**: Người dùng có thể gửi yêu cầu hợp tác từ MatchCard trong 1 click, không cần popup xác nhận.
- **SC-002**: Sau khi gửi thành công, tất cả button "Gửi yêu cầu hợp tác" trong danh sách bị disable ngay lập tức.
- **SC-003**: Trang `/my/collaboration-requests` hiển thị đầy đủ cả hai tab Sent và Received với dữ liệu thực từ API.
- **SC-004**: Người dùng có thể accept/reject request nhận được và xem thông tin công khai của cả hai intake sau khi accept.
- **SC-005**: Ba loại notification mới (`COLLABORATION_REQUEST_RECEIVED`, `COLLABORATION_REQUEST_ACCEPTED`, `COLLABORATION_REQUEST_REJECTED`) hiển thị đúng trong Notification_Panel và navigate đúng trang.
- **SC-006**: Toàn bộ flow hoạt động ổn định với các edge case: duplicate pending, cancel rồi gửi lại, auto-reject khi accept.
