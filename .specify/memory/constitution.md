<!-- Sync Impact Report
Version: 1.0.0 (initial technical governance for NacenTech Project, 2026-09-18).
Aligned with: BA Agent/constitution.md (v2.0.0) and Spec Kit Framework.
Target Architecture: Modular Monolith / Clean Architecture, TypeScript, PostgreSQL, Next.js / Node.js.
-->
# HIẾN PHÁP KỸ THUẬT DỰ ÁN NACENTECH (TECHNICAL CONSTITUTION)
*Phiên bản: 1.0.0 | Phạm vi áp dụng: Repository SourceCode (Mã nguồn, Kiểm thử, Kiến trúc, Spec Kit Epics)*

---

## 1. NGUYÊN TẮC KỸ THUẬT BẤT BIẾN (CORE NON-NEGOTIABLE PRINCIPLES)

### I. Nguồn Gốc Rõ Ràng & Truy Vết Toàn Vẹn (Traceability First)
Mọi Epic, Feature, Database Table, API Endpoint và Test Case trong `SourceCode/` MUST truy vết được trực tiếp về SRS đã phê duyệt tại `../Specification/SRS/` thông qua `specs/TRACEABILITY.md`:
- Mã định danh bắt buộc: `REQ-` (Chức năng), `BR-` (Quy tắc), `DB-` (Dữ liệu), `UI-` (Giao diện), `API-` (Dịch vụ), `NFR-` (Phi chức năng).
- Tuyệt đối không tự ý bổ sung tính năng không có trong spec (No Scope Creep). Mọi đề xuất kỹ thuật phát sinh ngoài SRS phải được gắn nhãn `[PROPOSAL]` và chuyển thành ADR (Architecture Decision Record).

### II. Kiến Trúc Hóa Tách Lớp (Clean Architecture & Modular Monolith)
Hệ thống ưu tiên mô hình **Modular Monolith** nhằm tối ưu tốc độ triển khai và tính toàn vẹn dữ liệu:
- Domain Logic thuần túy phải nằm độc lập trong các module nghiệp vụ, không bị phụ thuộc trực tiếp vào framework giao diện hay SDK bên ngoài.
- 3 phân hệ cốt lõi phải được module hóa độc lập:
  1. `core-platform-iam`: Quản trị định danh, RBAC, phân quyền đa tầng.
  2. `tech-data-catalog`: Quản lý kho dữ liệu công nghệ, bộ tiêu chí TRL 1–9, phân loại ngành VSIC.
  3. `lms-expert-network`: Nền tảng đào tạo e-learning, quản lý khóa học, hồ sơ chuyên gia và đặt lịch tư vấn.

### III. Toàn Vẹn Dữ Liệu & Bảo Mật Phân Quyền (RBAC & TracePro Security)
- **Ma trận quyền hạn (RBAC)**: Mọi API Endpoint và giao diện quản trị MUST kiểm tra quyền hạn chặt chẽ (Admin, Doanh nghiệp sở hữu công nghệ, Chuyên gia, Học viên, Khách vãng lai).
- **Toàn vẹn giao dịch (ACID Transactions)**: Các luồng phê duyệt công nghệ, đăng ký khóa học, phân bổ lịch tư vấn phải sử dụng database transaction để chống race conditions.
- **Bảo vệ dữ liệu cá nhân & Sở hữu trí tuệ**: Hồ sơ chuyên gia, bằng sáng chế hoặc dữ liệu công nghệ chưa công bố rộng rãi phải được mã hóa và kiểm soát truy cập (Access Control Lists).

### IV. Chuẩn Hóa Phân Loại Công Nghệ (TRL & VSIC Compliance)
- Mọi bản ghi công nghệ MUST tuân thủ định dạng phân loại ngành kinh tế Việt Nam (VSIC) và thang đo mức độ sẵn sàng công nghệ TRL từ cấp độ 1 đến 9 theo đúng quy chuẩn tại `Specification/Dat-hang-phan-mem.xlsx`.
- Quy tắc kiểm duyệt TRL (`BR-TRL-*`) phải được hiện thực hóa ở tầng Domain Service, không để logic lọt vào tầng View/Controller.

### V. Chất Lượng Kiểm Chứng Được (Quality Gates & Test-First)
- **TypeScript Strict Mode**: Luôn bật strict typecheck, tuyệt đối không dùng `any` bừa bãi hoặc bỏ qua lỗi build.
- **Kiểm thử 3 tầng bắt buộc**:
  1. *Unit Tests*: Bao phủ 100% các Business Rules (`BR-*`), thuật toán tính toán TRL, logic phân quyền RBAC.
  2. *Integration Tests*: Kiểm thử luồng dữ liệu Repository, Transaction Database và Outbox events.
  3. *E2E / Visual QA*: Kiểm thử 5 trạng thái UX (Empty, Loading, Error, Success, Partial) trên giao diện.
- Không một task nào trong `tasks.md` được đánh dấu `[x]` nếu chưa có test kiểm chứng chạy pass.

### VI. Trạng Thái Vận Hành Trung Thực (No Mock in Production)
- Phân định rạch ròi giữa môi trường phát triển (Dev/Mock) và Production.
- Các dịch vụ tích hợp bên ngoài (cổng thanh toán, SMS OTP, AI Matching) nếu chưa nối thật phải có log từ chối rõ ràng, không được giả lập kết quả thành công giả tạo gây hiểu nhầm về độ hoàn thiện của hệ thống.

---

## 2. QUY TRÌNH PHÁT TRIỂN SPEC KIT (DEVELOPMENT LIFECYCLE)

Vòng đời phát triển một tính năng/Epic trong `SourceCode/`:
```text
SRS Approved (Root) 
  → nacen-srs-to-speckit (Handoff) 
  → speckit-specify (spec.md) 
  → speckit-clarify (nếu còn gap) 
  → speckit-plan (plan.md & Architecture) 
  → speckit-tasks (tasks.md) 
  → speckit-uiux (wireframe & 5 states UX)
  → speckit-implement (code & unit tests) 
  → speckit-test (integration & E2E) 
  → speckit-converge (nghiệm thu & đóng Epic)
```

- Epic hiện hành được chỉ định tại `.specify/feature.json`.
- Khi có yêu cầu thay đổi (CR), bắt buộc dùng `/speckit-delta` để cập nhật spec/plan/tasks mà không làm tổn hại đến code cũ.

---

## 3. QUẢN TRỊ HIẾN PHÁP (GOVERNANCE)

- Hiến pháp này có giá trị tối cao đối với toàn bộ hoạt động kỹ thuật trong `SourceCode/`.
- Mọi sự điều chỉnh đối với Hiến pháp phải có sự phê duyệt của Tech Lead & BA Lead, đi kèm **Sync Impact Report**.
- **Version**: 1.0.0 | **Ratified**: 2026-09-18 | **Target Platform**: NacenTech Solution
