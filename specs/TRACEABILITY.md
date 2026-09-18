# Ma Trận Truy Vết Kỹ Thuật (Traceability Matrix) — NacenTech

> **Mục đích**: Đảm bảo nguyên tắc **Truy vết khép kín (Closed-loop Traceability)** 2 chiều giữa:
> 1. Tài liệu nghiệp vụ gốc / SRS đã duyệt tại `../Specification/` & `../Specification/SRS/`.
> 2. Các Epic kỹ thuật (`specs/00X-...`), bản thiết kế (`plan.md`), đầu việc (`tasks.md`), mã nguồn (`src/`) và bộ kiểm thử (`tests/`) trong repository `SourceCode/`.

---

## 1. MA TRẬN ÁNH XẠ TỔNG THỂ (SRS TO EPIC MAPPING)

| Mã SRS Nghiệp Vụ | Tên Phân Hệ Nghiệp Vụ | Tài Liệu Nguồn Gốc | Thư Mục Epic Kỹ Thuật | Phạm Vi Mã Định Danh | Trạng Thái Kỹ Thuật |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **SRS-001-CORE-IAM** | Nền tảng Quản trị & Phân quyền RBAC | `Specification/Dat-hang-phan-mem.xlsx` | [`specs/002-core-platform-iam`](./002-core-platform-iam/) | `REQ-IAM-*`, `BR-RBAC-*`, `API-AUTH-*` | ⚪ Dự kiến |
| **SRS-002-TECH-DATA** | Kho Dữ Liệu Công Nghệ & Đánh Giá TRL | `Specification/Dat-hang-phan-mem.xlsx` (Sheet Đặt hàng Nhung) | [`specs/003-tech-product-catalog`](./003-tech-product-catalog/) | `REQ-TECH-*`, `BR-TRL-*`, `DB-PRODUCT-*` | ⚪ Dự kiến |
| **SRS-003-LMS-TRAIN** | Hệ Thống Đào Tạo Trực Tuyến E-Learning | `Specification/Tai lieu BA Nacentwin.xlsx` | [`specs/004-lms-elearning`](./004-lms-elearning/) | `REQ-LMS-*`, `BR-COURSE-*`, `NFR-STREAM-*` | ⚪ Dự kiến |
| **SRS-004-EXPERT-NET** | Mạng Lưới Kết Nối Chuyên Gia & Tư Vấn | `Specification/Tai lieu BA Nacentwin.xlsx` | [`specs/005-expert-network`](./005-expert-network/) | `REQ-EXP-*`, `BR-CONSULT-*`, `DB-EXPERT-*` | ⚪ Dự kiến |

---

## 2. QUY CHUẨN ĐỒNG BỘ MÃ ĐỊNH DANH (IDENTIFIER STANDARDIZATION)

Mọi yêu cầu nghiệp vụ được chuẩn hóa từ SRS phải được giữ nguyên vẹn mã định danh khi bóc tách sang `spec.md`, `plan.md`, `tasks.md` và mã kiểm thử:

| Tiền Tố | Loại Yêu Cầu | Vị Trí Trong Spec Kit | Kiểm Thử Bắt Buộc |
| :--- | :--- | :--- | :--- |
| **`REQ-`** | Yêu cầu chức năng người dùng | `spec.md` (User Stories, Requirements) | Acceptance Criteria / E2E Test |
| **`BR-`** | Quy tắc nghiệp vụ & điều kiện ràng buộc | `spec.md` & `plan.md` (Domain Logic) | Unit Test (100% coverage các quy tắc) |
| **`DB-`** | Cấu trúc dữ liệu & bảng quan hệ | `plan.md` (Prisma/TypeORM/SQL Schema) | DB Migration & Integrity Tests |
| **`API-`** | Dịch vụ & điểm cuối API | `plan.md` (OpenAPI / Contracts) | API Integration & Contract Tests |
| **`UI-`** | Giao diện & luồng hiển thị | `spec.md` & `plan.md` (Wireframes) | 5-State UX Test (Empty/Load/Err/Succ) |
| **`NFR-`** | Yêu cầu phi chức năng định lượng | `spec.md` & `plan.md` (Performance, Sec) | Benchmark / Load Test |
| **`CR-`** | Yêu cầu thay đổi phạm vi | `specs/ROADMAP.md` & Change Log | Regression Tests |

---

## 3. NGUYÊN TẮC BẢO ĐẢM TRUY VẾT KHÉP KÍN

1. **Không có Task mồ côi (No Orphan Tasks)**: Mỗi task trong `tasks.md` của bất kỳ Epic nào đều phải được gắn thẻ tham chiếu rõ ràng đến ít nhất một mã `REQ-`, `BR-`, `DB-`, `API-` hoặc `UI-`.
2. **Không có Code mồ côi (No Orphan Code)**: Mọi endpoint API hoặc UI component đều phải tương ứng với mã yêu cầu đã xác định.
3. **Cập nhật 2 chiều khi có Change Request**:
   - Khi BA thay đổi nghiệp vụ: Cập nhật SRS gốc -> Kích hoạt `/speckit-delta` -> Cập nhật `spec.md`, `plan.md`, `tasks.md` -> Cập nhật `TRACEABILITY.md`.
   - Khi kỹ thuật phát hiện giới hạn kiến trúc: Tạo đề xuất `[PROPOSAL]` -> Thảo luận với BA -> Cập nhật SRS trước khi sửa code chính thức.
