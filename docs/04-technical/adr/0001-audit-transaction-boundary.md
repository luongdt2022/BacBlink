# ADR-0001: Audit quyết định truy cập ghi bằng transaction riêng

- Trạng thái: ACCEPTED
- Ngày: 2026-09-03
- Liên quan: §23.2, §21.4, AC 5, AC 17, AC 28

## Bối cảnh

§23.2 yêu cầu mọi lần **từ chối** truy cập tài liệu mật phải được ghi audit kèm `ruleId`. Thiết kế ban đầu
cho `IAuditWriter.Append` thêm bản ghi vào cùng `DbContext` của command, để audit và dữ liệu commit chung
một transaction và không bao giờ lệch nhau.

Khi chạy thử trên PostgreSQL thật, bản ghi DENY **không hề xuất hiện**. Nguyên nhân: từ chối luôn kết thúc
bằng `ForbiddenException`, exception hủy request trước khi bất kỳ `CommitAsync` nào chạy, nên bản ghi audit
bị rollback cùng. Hệ thống im lặng đúng ở tình huống cần dấu vết nhất.

Vấn đề thứ hai cùng gốc: đường đọc tài liệu (`GET /files/{key}`) không bao giờ commit, nên cả `PERMIT`
trên tài liệu mật — thứ §16.2 gọi là access log — cũng biến mất.

## Quyết định

Audit quyết định truy cập được ghi bằng **`DbContext` ngắn hạn riêng, transaction riêng**, không đi theo
`IUnitOfWork` của command. Hiện thực là `IsolatedAuditWriter` đặt tại `packages/persistence` (tầng duy nhất
được biết `NacenTechDbContext`); module `audit` giữ entity và truy vấn, đúng MOD-02.

## Hệ quả

- Audit tồn tại độc lập với việc command thành công hay thất bại. Đây là hành vi đúng: sự kiện cần ghi lại
  chính là **quyết định phân quyền**, không phải kết quả nghiệp vụ.
- Một command thất bại vì lý do khác vẫn có thể để lại bản ghi PERMIT trước đó. Chấp nhận được: audit ghi
  điều đã thực sự được đánh giá, không phải điều đã thực sự xảy ra sau đó.
- Mỗi lần đánh giá tài liệu mật tốn thêm một kết nối ngắn. Chỉ áp cho đường tài liệu mật, không phải mọi request.
- Bài `Denied_confidential_read_is_audited_even_though_request_fails` tại `tests/integration` giữ lỗi này
  không quay lại. Test đơn vị không bắt được vì nó phụ thuộc ranh giới transaction thật.

## Phương án đã cân nhắc

- **Buffer rồi flush trong middleware xử lý lỗi**: hoạt động cho HTTP nhưng không cho worker và ETL, và làm
  audit phụ thuộc vào host.
- **Ghi audit trước khi ném exception trong cùng transaction**: không giải quyết được gì vì rollback vẫn xóa.
- **Ghi ra log file thay vì bảng**: trái §21.4 (audit là append-only trong hệ thống, truy vấn được).
