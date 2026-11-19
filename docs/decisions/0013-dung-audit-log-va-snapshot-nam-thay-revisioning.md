# 0013. Dùng Audit Log và Snapshot Năm thay cho Full Revisioning cho MVP

- **Trạng thái**: Chấp nhận
- **Ngày**: 2026-10-07
- **Vùng**: CSDL (`enterprise`, `assessment`, `demand`)
- **Một chiều?**: Có — Định hình toàn bộ Entity và Data Access Layer. Thay đổi lại sẽ phải migration lại toàn bộ dữ liệu.
- **Thay thế**: Phủ quyết một phần và thay thế (Supersedes) [[ADR-0012-enterprise-assessment-hybrid-schema]] do ADR cũ vẫn còn đề xuất sử dụng cấu trúc bảng `revisions`.

## Bối cảnh
Thiết kế CSDL ban đầu đề xuất sử dụng Event Sourcing / Full Revisioning (tạo các bảng `_revisions` riêng) cho mọi thực thể từ Hồ sơ doanh nghiệp đến các Form nộp đánh giá nhằm lưu trữ mọi lịch sử thay đổi. Việc áp dụng mô hình này cho hàng chục bảng dữ liệu là Over-engineering (quá phức tạp và tốn kém tài nguyên) đối với phiên bản MVP, gây phình to Schema, phức tạp hóa luồng truy vấn EF Core và không mang lại giá trị tương xứng so với chi phí phát triển bỏ ra.

## Quyết định
Giảm tải độ phức tạp của kiến trúc lưu vết bằng phương án "Cut-down" (Rút gọn) cho MVP:
1. **Hồ sơ tĩnh (Doanh nghiệp, Viện, Tài sản, v.v.)**: Hủy bỏ toàn bộ các bảng `_revisions`. Sử dụng Audit Log tiêu chuẩn của EF Core (`CreatedAt`, `UpdatedAt`, `UpdatedBy`). Lưu vết lịch sử thay đổi (Snapshot Before/After dạng JSON) vào duy nhất một bảng tập trung là `system_audit_logs`. Dữ liệu nghiệp vụ truy vấn luôn là bản ghi mới nhất.
2. **Hồ sơ động / Form định kỳ (TT17, Khảo sát nhu cầu)**: Áp dụng cơ chế **Snapshot theo Năm (Yearly Snapshot)**. Mỗi đợt đánh giá/khảo sát sẽ lưu thành một row riêng biệt gắn với `AssessmentYear` / `SubmissionYear`. Khi duyệt thì khóa bản ghi (Immutability). Các mảng chi tiết phức tạp bên trong Form vẫn giữ định dạng Hybrid JSONB.

## Phương án đã loại
- **Giữ mô hình Full Revisioning theo từng thay đổi**: Bị loại do đòi hỏi effort dev quá lớn và làm tăng độ phức tạp hệ thống không cần thiết ở giai đoạn đầu.
- **Chỉ lưu bản mới nhất, không lưu vết gì cả**: Bị loại vì vi phạm yêu cầu nghiệp vụ cơ bản: hệ thống cần so sánh được trình độ công nghệ qua các năm và truy vết được người thay đổi dữ liệu lõi của pháp nhân.

## Hệ quả
- Schema rút gọn mạnh mẽ, giảm khoảng 40% effort triển khai Database và API.
- Cấu trúc DB trở nên phẳng hơn, dễ maintain.
- Dễ dàng so sánh điểm số TT17 giữa các năm bằng cách query trực tiếp 2 row song song.
- Tech Lead cần cấu hình chuẩn EF Core SaveChanges Interceptor để tự động bắt sự kiện thay đổi và đẩy log vào bảng `system_audit_logs`.
