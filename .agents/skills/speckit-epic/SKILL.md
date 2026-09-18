---
name: "speckit-autopilot"
description: "Điều phối và thực thi tự động toàn diện một Epic từ đầu đến cuối qua 7 bước chuẩn Spec Kit (Specify -> Clarify -> Plan -> Tasks -> Analyze -> Implement -> Converge) kèm các điểm dừng tương tác khi cần quyết định."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "custom/speckit-autopilot"
---

## User Input

```text
$ARGUMENTS
```

Tham số đầu vào là tên Epic hoặc mô tả tính năng (Ví dụ: `Epic E2: KYC & Document Verification`, `Epic E3: Giao Tác Thanh Toán VietQR`, hoặc một yêu cầu nghiệp vụ cụ thể).
Nếu người dùng chưa cung cấp tham số, hãy hỏi người dùng muốn thực thi Epic nào trong Backlog dự án.

---

## Mục Tiêu & Triết Lý Vận Hành (Philosophy)

Skill **`speckit-autopilot`** giải quyết bài toán: **"Gọi 1 lần — Hoàn thành cả Epic"**. 
Thay vì người dùng phải gõ thủ công 7 câu lệnh nối tiếp nhau (`/speckit-specify` -> `/speckit-clarify` -> `/speckit-plan` -> `/speckit-tasks` -> `/speckit-analyze` -> `/speckit-implement` -> `/speckit-converge`), skill này tự động điều phối toàn bộ chu trình phát triển phần mềm theo chuẩn Spec Kit của dự án:

1. **Tự Động Hóa Liền Mạch (Seamless Automation)**: Tự động chuyển giao kết quả từ bước này sang bước tiếp theo mà không làm gián đoạn tiến độ.
2. **Điểm Dừng Tương Tác Có Trọng Tâm (Interactive Checkpoints)**: Chỉ dừng lại khi và chỉ khi:
   - Phát hiện điểm mơ hồ, mâu thuẫn hoặc chưa rõ ràng trong yêu cầu nghiệp vụ (**Checkpoint 1.1**).
   - Cần chốt quyết định kiến trúc quan trọng có nhiều phương án đánh đổi (**Checkpoint 2**).
   - Gặp lỗi blocking bên ngoài cần chỉ đạo của người dùng (**Checkpoint 4**).
   - Nghiệm thu tính năng khi hoàn tất 100% (**Checkpoint 5**).
3. **Tuân Thủ Hiến Pháp Dự Án (`.specify/memory/constitution.md`)**:
   - Yêu cầu phải có nguồn gốc rõ ràng (PA1, biểu mẫu thực tế của KT Telecom).
   - Cấu trúc Modular Monolith chuẩn mực (`src/modules/*`, `src/server/*`).
   - Toàn vẹn thanh toán (ACID Transaction, Tiền tệ `BigInt` VND nguyên vẹn, Transactional Outbox).
   - Bảo mật thông tin riêng tư (Mã hóa AES-256-GCM cho Hộ chiếu/ARC/STK ngân hàng).
   - Chất lượng kiểm chứng được (Strict TypeScript, kiểm thử tự động 100% pass, Next.js build sạch).
   - Trạng thái tích hợp trung thực (PostgreSQL 16 chạy container thật, không mock dữ liệu cốt lõi).

---

## Quy Trình 7 Giai Đoạn Chi Tiết

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SPECKIT AUTOPILOT PIPELINE                            │
└─────────────────────────────────────────────────────────────────────────────┘
  [1] speckit-specify  ──> Khởi tạo spec.md, đồng bộ ROADMAP.md
          │
          ▼
  [1.1] speckit-clarify ──> 🛑 CHECKPOINT 1: DỪNG LẠI nếu mơ hồ; Tự động nếu rõ
          │
          ▼
  [2] speckit-plan     ──> Thiết kế kiến trúc, DB, API; 🛑 CHECKPOINT 2: Hiến pháp
          │
          ▼
  [2.1] speckit-uiux   ──> (Nếu Epic có UI) Wireframe PA1, 5 trạng thái UX, mapping E0.2 Core
          │
          ▼
  [3] speckit-tasks    ──> Phân rã đầu việc tasks.md
          │
          ▼
  [3.1] speckit-analyze──> Rà soát chéo ma trận phủ (Coverage Matrix)
          │
          ▼
  [4] speckit-implement──> Viết code thật, repositories, services, tests
          │                 🛑 CHECKPOINT 3: DỪNG LẠI nếu gặp blocker
          ▼
  [5] speckit-converge ──> Kiểm thử toàn diện, Visual QA (Playwright screenshots) & nghiệm thu
```

---

### Giai Đoạn 1: Khởi Tạo Yêu Cầu (`speckit-specify`)

1. **Xác định Feature Scope**:
   - Phân tích tên Epic/yêu cầu từ `$ARGUMENTS`.
   - Tra cứu bối cảnh từ các tài liệu chuẩn: `Data/Bao_Cao_Giai_Phap_SIM_KT_M4U_PA1.html`, các biểu mẫu KT thực tế (`Data/a1.jpg`, `Data/a2.jpg`), và các Epic đã hoàn thành trước đó.
2. **Khởi tạo Feature Directory**:
   - Chạy lệnh khởi tạo tính năng:
     ```bash
     .specify/scripts/bash/create-new-feature.sh --json "<tên_feature_ngắn>"
     ```
   - Cập nhật `.specify/feature.json` trỏ tới thư mục feature mới (ví dụ: `specs/003-kyc-document-verification`).
3. **Sinh tài liệu `spec.md`**:
   - Xây dựng User Stories phân theo thứ tự ưu tiên (P1, P2...). Mỗi User Story phải có đầy đủ:
     - **Why this priority** (Lý do ưu tiên).
     - **Independent Test** (Kịch bản kiểm thử độc lập).
     - **Acceptance Scenarios** (Kịch bản chấp thuận chuẩn Given-When-Then).
    - Functional Requirements (FR-###) đánh số tuần tự.
    - Success Criteria (SC-###) định lượng rõ ràng.
    - Edge Cases & Xử lý ngoại lệ nghiệp vụ viễn thông/thanh toán.
4. **Đồng bộ Master Roadmap (`specs/ROADMAP.md`)**:
   - Kiểm tra `specs/ROADMAP.md`:
     - Nếu đây là Epic mới phát sinh: Tự động thêm dòng mới vào Bảng 1 (Master Registry) với trạng thái `🔵 Đang thi công` và ghi nhận vào Bảng 3 (Lịch sử thay đổi).
     - Nếu Epic đã có trong bảng: Cập nhật trạng thái sang `🔵 Đang thi công`.

---

### Giai Đoạn 1.1: Làm Rõ Nghiệp Vụ (`speckit-clarify`) — 🛑 CHECKPOINT 1

1. **Phân tích độ hoàn thiện của `spec.md`**:
   - Rà soát các quy tắc nghiệp vụ: Có logic nào bị mập mờ, thiếu tham số hoặc có thể hiểu theo nhiều cách khác nhau?
   - Rà soát tích hợp bên thứ ba: Quy cách kết nối, định dạng dữ liệu, thời hạn xử lý (SLA/Timeout).
2. **Ra quyết định rẽ nhánh**:
   - **TRƯỜNG HỢP CÓ ĐIỂM MƠ HỒ (Ambiguous / Underspecified)**:
     - **DỪNG LẠI NGAY LẬP TỨC (STOP)**.
     - Trình bày tối đa 3-5 câu hỏi trọng tâm, kèm theo các phương án đề xuất (Ví dụ: Phương án A, Phương án B kèm lý do kỹ thuật).
     - Đợi phản hồi trực tiếp từ người dùng.
     - Khi người dùng trả lời: Ghi nhận câu trả lời vào mục `Clarifications & Key Technical Decisions` trong `spec.md`, sau đó tự động kích hoạt **Giai đoạn 2**.
   - **TRƯỜNG HỢP YÊU CẦU ĐÃ ĐỦ RÕ RÀNG (100% Clarity)**:
     - Xuất thông báo ngắn gọn: *"Yêu cầu nghiệp vụ của Epic đã rõ ràng và có đầy đủ căn cứ từ tài liệu giải pháp PA1. Tự động chuyển tiếp sang Giai đoạn 2: Lập kế hoạch kỹ thuật."*
     - Tự động tiếp tục sang **Giai đoạn 2**.

---

### Giai Đoạn 2: Lập Kế Hoạch Kỹ Thuật (`speckit-plan`) — 🛑 CHECKPOINT 2

1. **Thiết kế Kiến trúc Chi Tiết**:
   - Sinh file `plan.md` trong thư mục feature.
   - Tuân thủ cấu trúc Modular Monolith:
     - Module nghiệp vụ đặt trong `src/modules/<tên-module>/`.
     - Hạ tầng DB, ORM, Transaction, Repository đặt trong `src/server/db/`.
     - Tích hợp bên ngoài (Storage S3/Local, Telegram Bot, Webhooks) đặt trong `src/server/`.
   - Sinh hoặc cập nhật `data-model.md` (nếu có bổ sung thực thể hoặc quan hệ bảng mới).
   - Sinh `contracts/` (API interface, request/response DTOs, Zod schemas).
2. **Quy tắc Kiểm tra Hiến pháp (Constitution Check Gate)**:
   - Nghiêm cấm dùng `Float` cho tiền tệ (bắt buộc `BigInt` VND).
   - Nghiêm cấm lưu số định danh trần trong DB (bắt buộc mã hóa AES-256-GCM).
   - Bắt buộc kiểm soát giao tác ACID và Transactional Outbox khi thay đổi trạng thái đơn hoặc thanh toán.
3. **Ra quyết định rẽ nhánh**:
   - **NẾU có quyết định kiến trúc lớn có trade-offs** (ví dụ: lựa chọn giữa 2 phương thức lưu file private, cơ chế worker xử lý nền):
     - **DỪNG LẠI HỎI Ý KIẾN NGƯỜI DÙNG**.
     - Nêu rõ ưu/nhược điểm từng phương án và xin phê duyệt trước khi đi tiếp.
   - **NẾU kế hoạch kiến trúc đã chuẩn mực theo Hiến pháp**:
     - Tự động chuyển tiếp sang **Giai đoạn 2.1 (nếu có UI)** hoặc **Giai đoạn 3 (nếu thuần backend)**.

---

### Giai Đoạn 2.1: Thiết Kế UI/UX & Wireframe Mapping (`speckit-uiux`) — (Áp Dụng Cho Epic Có Giao Diện)

1. **Kiểm tra loại Epic**:
   - Nếu Epic là thuần backend (như CSDL, Cron worker, Deploy): Tự động bỏ qua và chuyển sang **Giai đoạn 3**.
   - Nếu Epic có màn hình người dùng hoặc admin (Storefront, eKYC, VietQR QR Modal, Admin CMS, Portal ARC):
2. **Khảo sát & Bố cục Wireframe**:
   - Đối soát Wireframe PA1 (`W1..W8`, `M1..M8`) và biểu mẫu KT `a1.jpg`/`a2.jpg`.
   - Quy hoạch layout: Desktop (2 cột grid, sticky summary card) và Mobile (1 cột responsive, sticky action bar dưới cùng).
3. **Ánh xạ UI Core E0.2 Components**:
   - Bắt buộc dùng: `<FormField>` (có inline error), `<LoadingButton>` (chống click đúp), `<Toast>` Sonner, `<ImageLightbox>`, từ điển `i18n` 3 thứ tiếng (VN/KR/EN).
4. **Chuẩn hóa 5 trạng thái UX**:
   - Khai báo rõ ràng: Default, Active/Focus, Loading/Skeleton, Inline Error, Success/Empty.
5. **Ghi nhận vào `plan.md`**:
   - Bổ sung section `UI/UX Component & Layout Specification` vào `plan.md` trước khi phân rã task.

---

### Giai Đoạn 3: Phân Rã Danh Sách Đầu Việc (`speckit-tasks`)

1. **Sinh file `tasks.md`**:
   - Chia thành các Phase logic:
     - **Phase 1**: Setup & Tooling.
     - **Phase 2**: Data Layer & Contracts (Schema, Migration, Interfaces).
     - **Phase 3..N**: User Story Phases theo thứ tự ưu tiên P1 -> P2 -> P3.
     - **Phase Cuối**: Polish, Verification & Quality Gate.
   - Mỗi task phải có cấu trúc chuẩn:
     ```markdown
     - [ ] T001 [US1] Mô tả hành động cụ thể + đường dẫn file đích (test đi kèm)
     ```
   - Đảm bảo tính kiểm thử độc lập cho từng User Story.

---

### Giai Đoạn 3.1: Rà Soát Chéo Ma Trận Phủ (`speckit-analyze`)

1. **Đối soát chéo 3 bên**:
   - `spec.md` <---> `plan.md` <---> `tasks.md`.
2. **Xác nhận Ma trận Phủ (Coverage Matrix)**:
   - 100% User Stories đã có ít nhất một task thực thi.
   - 100% Functional Requirements (FR) được ánh xạ vào tasks.
   - 100% tệp tin/components nêu trong `plan.md` đã được lên kế hoạch tạo mới hoặc sửa đổi.
3. **Tự động vá (Self-Correction)**:
   - Nếu phát hiện task bị sót -> Tự động append bổ sung vào `tasks.md` trước khi bắt đầu thi công code.

---

### Giai Đoạn 4: Bắt Tay Thi Công Thực Tế (`speckit-implement`) — 🛑 CHECKPOINT 3

1. **Thi công theo trật tự Dependency Graph**:
   - Bước 1: Types, Interfaces & Zod Validation Schemas.
   - Bước 2: Database Schema & Migration (nếu có bổ sung bảng/cột mới) -> chạy `pnpm prisma migrate dev`.
   - Bước 3: Repositories & Database Operations (hỗ trợ mã hóa AES-256 và Outbox).
   - Bước 4: Domain Services, State Machine & Business Logic.
   - Bước 5: API Endpoints (Next.js Route Handlers / Server Actions).
   - Bước 6: Automated Test Suites (Vitest).
2. **Kiểm tra Chất lượng Liên tục (Continuous Quality Checks)**:
   - Sau mỗi phase thực thi, tự động chạy:
     - `pnpm typecheck` (`tsc --noEmit`): Bắt buộc 0 lỗi type.
     - `pnpm test`: Bắt buộc 100% test suites pass.
3. **Cập nhật tiến độ**: Đánh dấu `[x]` vào từng task hoàn thành trong `tasks.md`.
4. **Xử lý tình huống Blocker**:
   - Nếu gặp lỗi kỹ thuật từ môi trường bên ngoài hoặc thiếu thông tin khóa truy cập/API bên thứ 3 -> **DỪNG LẠI TRAO ĐỔI VỚI NGƯỜI DÙNG** kèm phương án khắc phục ngay lập tức.

---

### Giai Đoạn 5: Đánh Giá Hội Tụ & Nghiệm Thu (`speckit-converge`) — 🛑 CHECKPOINT 4

1. **Thực thi Converge Check**:
   - Đọc lại toàn bộ `spec.md`, `plan.md`, `tasks.md` và rà soát mã nguồn thực tế.
   - Kiểm tra các tiêu chí chấp thuận (Acceptance Scenarios) của từng User Story.
2. **Xử lý phần việc còn sót (nếu có)**:
   - Nếu phát hiện tính năng chưa hoàn thiện -> Tự động thêm `Phase N: Convergence` vào `tasks.md` và thi công nốt.
3. **Nghiệm thu toàn diện Epic (Definition of Done)**:
   - `pnpm typecheck`: 0 lỗi type.
   - `pnpm test`: 100% pass toàn bộ test suites của dự án (không chỉ riêng Epic hiện tại mà cả các Epic cũ để chống hồi quy).
   - `pnpm build`: Ứng dụng Next.js đóng gói thành công 100%.
   - **Visual QA (nếu Epic có UI)**: Khởi chạy Playwright chụp ảnh giao diện thực tế (Desktop 1280px & Mobile 390px) lưu vào `docs/screenshots/<epic>/` để người dùng thẩm duyệt trực quan layout.
   - Cập nhật tài liệu / ERD trực quan (nếu có thay đổi kiến trúc).
4. **Đồng bộ Master Roadmap (`specs/ROADMAP.md`)**:
   - Cập nhật trạng thái của Epic trong `specs/ROADMAP.md` sang `✅ 100% Hoàn thành`.
   - Cập nhật số task thực tế, kết quả kiểm thử (số test cases pass, E2E test, Visual screenshots).
   - Ghi nhận một dòng mới vào Bảng 3 (Lịch sử thay đổi / Decision Log) với ngày hoàn thành và nội dung nghiệm thu.
5. **Báo Cáo Nghiệm Thu Trọn Vẹn**:
   - Trình bày tóm tắt cho người dùng:
     - Số lượng User Stories hoàn thành.
     - Danh sách các tệp tin mới tạo và module đã sẵn sàng.
     - Số lượng test cases pass và ảnh Visual QA screenshot đã chụp.
     - Liên kết tới `specs/ROADMAP.md` đã cập nhật.
     - Sẵn sàng kích hoạt Epic tiếp theo.
