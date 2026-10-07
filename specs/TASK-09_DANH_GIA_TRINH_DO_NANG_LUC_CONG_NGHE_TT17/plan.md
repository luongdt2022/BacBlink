# TASK-09 Kế Hoạch Kỹ Thuật (plan.md)

## 1. Hợp đồng API (Contract-First)
Do chốt Phương án Load nguyên khối, API trả về cấu trúc nguyên khối cho Form Wizard.
- `GET /api/v1/assessments/tt17/{id}`: Trả về `AssessmentDto` chứa thông tin chủ thể, và dữ liệu khảo sát.
- `PUT /api/v1/assessments/tt17/{id}`: Lưu nháp (Auto-save) dữ liệu assessment.
- `POST /api/v1/assessments/tt17/{id}/submit`: Đóng băng bản nộp (Yearly Snapshot) và gọi Engine tính điểm.

## 2. Thiết kế Backend (Clean Architecture)
- **Domain**: `Tt17Assessment` Aggregate Root thuộc `NacenTech.Modules.Assessment`. Liên kết với bảng Master `Enterprises`.
- **Database (ADR-0013)**:
  - Áp dụng cơ chế **Snapshot Năm** (Yearly Snapshot).
  - Mapping EF Core sử dụng **Hybrid JSONB** cho 4 mảng cấu trúc động phức tạp (máy móc, thiết bị, nguyên vật liệu, 26 tiêu chí đánh giá) để tránh phình to schema (không dùng `_revisions`).
- **Application**: `SaveAssessmentDraftCommandHandler` xử lý lưu I/O. Engine tính điểm `Tt17ScoringService`.

## 3. Thiết kế Frontend (UI/UX)
- Giao diện 5 Tab (T-E-O-R-I) gói gọn trong 1 Form duy nhất (`useForm` React Hook Form).
- Tính năng Dynamic Array (`useFieldArray`) cho các list thiết bị và nguyên liệu.
- Component `<Async>` bọc ngoài cùng xử lý 5 states (Loading, Error, Success).
