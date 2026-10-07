# TASK-03 Kế Hoạch Kỹ Thuật (plan.md)

## 1. Hợp đồng API (Contract-First)
- `GET /api/v1/surveys/task-03/{id}`: Trả về chi tiết phiếu khảo sát kèm mảng các điểm nghẽn và nhu cầu.
- `PUT /api/v1/surveys/task-03/{id}`: Lưu/Cập nhật phiếu khảo sát.
- `POST /api/v1/surveys/task-03/{id}/submit`: Đóng băng bản nộp (Snapshot năm).
- `POST /api/v1/surveys/task-03/{id}/convert`: Duyệt phiếu và chuyển các "Need Items" thành các Demand Briefs (Vé nhu cầu) trên hệ thống.

## 2. Thiết kế Backend (Clean Architecture)
- **Domain**: `SurveySubmission` Aggregate Root thuộc `NacenTech.Modules.Demand`. Liên kết với bảng Master `Enterprises`.
- **Database (ADR-0013)**: 
  - Áp dụng cơ chế **Snapshot Năm** (Yearly Snapshot), không dùng Full Revisioning.
  - Sử dụng **Hybrid JSONB** lưu trữ các danh sách động: `need_items` (bài toán công nghệ), `bottlenecks` (điểm nghẽn) để tối ưu schema.
- **Application**: Lệnh `ConvertSurveyToDemandBriefsCommand` xử lý logic sinh Demand Brief.

## 3. Thiết kế Frontend (UI/UX)
- Giao diện nhập liệu khảo sát ngắn gọn, focus vào UX Mobile/Tablet.
- Màn hình Admin cho cán bộ thao tác Check/Uncheck các dòng nhu cầu để duyệt thành bài toán (Demand Brief).
