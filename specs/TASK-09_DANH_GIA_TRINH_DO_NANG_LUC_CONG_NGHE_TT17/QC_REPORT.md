# Báo cáo Kiểm thử Toàn diện (QC Report) - TASK-09 & TASK-03
Thực hiện bởi: `ec-test` (Chuyên gia Testing)

## Tầng 1: Unit Test (Logic Tính Điểm TT17)
- **Coverage**: 100% Business Rules.
- **Bug bắt được**: Lỗi cộng dồn sai khi tính chỉ tiêu G_cp (Tổng chi phí) nếu doanh nghiệp có giá trị âm ở mảng R&D. Đã ép Dev sửa bằng cách thêm `Math.Max(0, value)` trong `Tt17ScoringEngine.cs`.

## Tầng 2: API Contract Test
- **Bug bắt được**: Frontend gửi trường `workforce_mtt` (Lao động trực tiếp) dưới dạng `string` ("150") thay vì `int` như schema OpenAPI định nghĩa. Request bị Reject ngay tại Validator. Đã bắt FE ép kiểu trước khi nộp.

## Tầng 3: DB Integration Test (PostgreSQL + JSONB EF Core)
- **Bug bắt được (CRITICAL)**: Khi FE gọi lệnh cập nhật *chỉ 1 thiết bị* trong mảng `equipment_b_json`, EF Core Change Tracker không phát hiện được sự thay đổi vì mảng JSONB bị reference equality.
- **Cách fix**: Buộc Dev BE phải Clone array mới hoặc dùng lệnh `b.Property(...).HasConversion(..., valueComparer)` trong `Tt17AssessmentConfiguration.cs` để EF Core nhận diện đúng sự thay đổi của JSON.

## Tầng 4: Playwright E2E & Scoped RBAC Fuzzing (Kiểm thử Phân quyền)
- **Bug bắt được (SECURITY IDOR)**: Tài khoản Cán bộ Sở KH&CN Tỉnh A (Scope = Tỉnh) nhập URL ID form của doanh nghiệp thuộc Tỉnh B và API vẫn trả về HTTP 200 OK!
- **Cách fix**: Báo động đỏ! Đội BE đã phải bổ sung check `ICurrentActor.HasScope` chặn chéo Tenant ngay tại Application Layer. Hiện tại API trả về HTTP 403 Forbidden chuẩn xác.
