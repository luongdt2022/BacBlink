# ADR-0002: Job trùng `dedupKey` bị bỏ qua im lặng, không làm hỏng transaction

- Trạng thái: ACCEPTED
- Ngày: 2026-09-03
- Liên quan: D2-145, §21.2, MOD-01, MOD-03

## Bối cảnh

Hàng đợi job nằm trong PostgreSQL (D2-145) để `enqueue` nằm cùng transaction với ghi dữ liệu. Bảng
`platform.job_queue` có unique index bộ phận trên `dedup_key` (chỉ tính job chưa hoàn tất) để một việc
không bị xếp hàng hai lần.

Khi chạy thử, outbox kẹt vĩnh viễn với lỗi trùng khóa. Nguyên nhân: một hành động nghiệp vụ bình thường
phát **hai** sự kiện cùng dẫn tới một việc — tạo intake published phát cả `SubjectContentChanged` và
`SubjectPublished`, cả hai đều cần chunk-embed cùng subject. Sự kiện thứ hai vi phạm unique index, exception
làm hỏng cả transaction xử lý outbox, message không bao giờ được đánh dấu đã xử lý, và vòng lặp retry vô hạn.

Lỗi thứ hai lộ ra cùng lúc: `EnableRetryOnFailure` không cho phép transaction do người dùng mở nếu không
chạy qua execution strategy.

## Quyết định

1. `IJobQueue.Enqueue` **gom job vào bộ nhớ**, và `IUnitOfWork.CommitAsync` insert chúng bằng
   `INSERT ... ON CONFLICT (dedup_key) WHERE ... DO NOTHING`. Trùng là chuyện bình thường, không phải lỗi.
2. Trùng trong cùng một transaction được loại ngay trong bộ nhớ, khỏi chạm database.
3. Toàn bộ khối commit chạy trong `db.Database.CreateExecutionStrategy().ExecuteAsync(...)` để transaction
   do host mở vẫn là một đơn vị retry được.

## Hệ quả

- Sự kiện trùng không còn làm kẹt outbox; job vẫn chỉ chạy một lần.
- `dedupKey` là **tùy chọn**: job không có key thì được phép trùng lặp.
- `CommitAsync` mở transaction tường minh. Đây là host mở, đúng MOD-02 ("module không tự BeginTransaction").
- Job insert bằng SQL thô nên không qua change tracker. Chấp nhận được vì `JobQueueEntry` là bảng hạ tầng,
  không phải aggregate nghiệp vụ.
- Ba bài tại `tests/integration` giữ hành vi này: trùng key không ném, không tạo hàng thừa, và job không có
  key vẫn vào đủ.
