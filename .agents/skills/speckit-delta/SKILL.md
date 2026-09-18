---
name: "speckit-delta"
description: "Quy trình điều phối cập nhật & nâng cấp (Delta / Change Request) cho một Epic đã hoàn thành: từ phân tích tác động (Impact Analysis), bổ sung spec, cập nhật plan non-destructive, phân rã task mới, thi công migration/code, kiểm thử hồi quy đến nghiệm thu hội tụ."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "custom/speckit-delta"
---

## User Input

```text
$ARGUMENTS
```

Tham số đầu vào bao gồm:
1. **Epic cần cập nhật**: Tên hoặc mã Epic (ví dụ: `Epic E1`, `002-database-persistence`).
2. **Nội dung thay đổi / Tài liệu mới**: Mô tả yêu cầu sửa đổi, tài liệu bổ sung, hoặc đường dẫn ảnh/file đính kèm (ví dụ: `Bổ sung các trường từ ảnh biểu mẫu KT a1.jpg và a2.jpg`, `Thêm tính năng hủy đơn hoàn tiền tự động`).

Nếu người dùng chưa cung cấp đủ thông tin, hãy hỏi người dùng:
1. Cần cập nhật cho Epic nào?
2. Tài liệu hoặc yêu cầu cụ thể cần bổ sung/sửa đổi là gì?

---

## Triết Lý Vận Hành Của Spec Kit Delta (Core Principles)

Khác với việc xây dựng một Epic mới từ con số 0, việc **sửa đổi/bổ sung một Epic đã hoàn thiện** đòi hỏi sự chặt chẽ tối đa để không làm gãy hệ thống đang chạy:

1. **Bất Biến Lịch Sử & Non-destructive**:
   - **Tuyệt đối KHÔNG** xóa đè hay sửa đổi các file migration cơ sở dữ liệu cũ đã chạy.
   - Chỉ tạo migration tiếp theo (v2, v3...) với tên mô tả chính xác mục tiêu thay đổi (ví dụ: `add_kt_membership_fields`).
2. **Tương Thích Ngược (Backward Compatibility)**:
   - Tất cả các trường dữ liệu mới bổ sung vào bảng đã có dữ liệu bắt buộc phải là `Nullable` (dấu `?`) hoặc có giá trị mặc định (`@default`).
   - Tuyệt đối không xóa cột hoặc thay đổi kiểu dữ liệu gây mất mát dữ liệu cũ (data loss) nếu không có kế hoạch chuyển đổi tường minh.
3. **Bảo Toàn Danh Sách Công Việc Cũ (Append-only Tasks)**:
   - Giữ nguyên vẹn toàn bộ các task cũ đã đánh dấu `[x]` (từ `T001` đến `T0xx`).
   - Phân rã phần việc mới thành một Phase bổ sung ở cuối file `tasks.md` (ví dụ: `Phase N: Schema Delta v2 (T0xx - T0yy)`).
4. **Không Gây Hồi Quy (Zero Regression)**:
   - 100% test suites cũ của hệ thống phải tiếp tục pass.
   - Bổ sung test suites mới kiểm chứng chuyên biệt cho các trường/tính năng vừa nâng cấp.
5. **Điểm Dừng Tương Tác (Interactive Checkpoints)**:
   - Dừng lại hỏi ý kiến người dùng khi phát hiện mâu thuẫn giữa tài liệu mới và kiến trúc cũ, hoặc khi có quyết định đánh đổi về dữ liệu.

---

## Quy Trình 6 Giai Đoạn Nâng Cấp Delta Chi Tiết

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SPECKIT DELTA PIPELINE                                │
└─────────────────────────────────────────────────────────────────────────────┘
  [1] Impact Analysis ──> Đánh giá phạm vi ảnh hưởng & Viết Spec Delta vào spec.md
          │
          ▼
  [1.1] Clarify Check ──> 🛑 CHECKPOINT 1: DỪNG LẠI HỎI nếu mâu thuẫn/thiếu dữ kiện
          │               (Nếu yêu cầu rõ ràng -> Tự động đi tiếp)
          ▼
  [2] Plan Delta      ──> Cập nhật plan.md & data-model.md (Chiến lược Non-destructive)
          │               🛑 CHECKPOINT 2: DỪNG LẠI HỎI nếu có Breaking Change
          ▼
  [3] Tasks Delta     ──> Append Phase mới vào cuối tasks.md (Tự động đánh số nối tiếp)
          │
          ▼
  [4] Implement Delta ──> Viết migration v2/code mới, cập nhật types, viết test delta
          │               🛑 CHECKPOINT 3: DỪNG LẠI HỎI nếu gặp lỗi môi trường
          ▼
  [5] Converge Delta  ──> Kiểm thử hồi quy 100%, đối soát DB/Code, cập nhật tài liệu
                           🛑 CHECKPOINT 4: Báo cáo nghiệm thu hoàn tất Delta
```

---

### Giai Đoạn 1: Đánh Giá Tác Động & Viết Spec Delta (`spec.md`)

1. **Xác định Epic mục tiêu**:
   - Định vị thư mục feature tương ứng trong `specs/` (ví dụ: `specs/002-database-persistence`).
   - Đọc kỹ `spec.md`, `plan.md`, `tasks.md` và mã nguồn hiện tại của Epic đó để nắm chắc hiện trạng.
2. **Phân tích bề mặt tác động (Impact Surface Analysis)**:
   - **Database Layer**: Bảng nào bị thêm/sửa cột? Enums nào cần mở rộng? Quan hệ khóa ngoại nào thay đổi?
   - **Domain / Services**: Logic nghiệp vụ hoặc state machine nào cần rẽ nhánh mới?
   - **API / Contracts**: Request/Response DTOs nào cần nhận thêm trường?
   - **UI/UX Layer**: Màn hình nào bị thêm/sửa input? Bố cục trên Desktop & Mobile? Có từ điển đa ngôn ngữ (VN/KR/EN) và `<FormField>` E0.2 chưa?
   - **Security & Privacy**: Có trường dữ liệu nhạy cảm nào mới cần mã hóa AES-256 không?
   - **Backward Compatibility**: Dữ liệu hiện có có bị ảnh hưởng không?
3. **Cập nhật `spec.md`**:
   - Giữ nguyên toàn bộ nội dung của các User Stories cũ.
   - Viết mục mới vào cuối file `spec.md` của Epic đó:
     ```markdown
     ## Spec Delta v2: [Tên Nội Dung Bổ Sung/Thay Đổi]
     - Bối cảnh & Lý do thay đổi (Căn cứ biểu mẫu/yêu cầu mới).
     - Danh sách các trường/yêu cầu chức năng mới (FR-NEW-###).
     - Ràng buộc & Tiêu chuẩn chấp thuận (Acceptance Criteria).
     ```
4. **Cập nhật Master Roadmap (`specs/ROADMAP.md`)**:
   - Chuyển trạng thái Epic trong Bảng 1 của `specs/ROADMAP.md` sang `🔄 Nâng cấp Delta (In Progress)`.
   - Ghi nhận yêu cầu thay đổi (Impact Analysis / Delta Request) vào Bảng 3 (Lịch sử thay đổi).

---

### Giai Đoạn 1.1: Làm Rõ Điểm Mơ Hồ (Clarify Check) — 🛑 CHECKPOINT 1

1. **Rà soát tính nhất quán**:
   - Tài liệu mới có xung đột với tài liệu cũ (như PA1 hay Hiến pháp) không?
   - Có trường dữ liệu nào chưa rõ định dạng, độ dài, hoặc quy tắc bắt buộc (required/optional) không?
2. **Ra quyết định rẽ nhánh**:
   - **NẾU CÓ ĐIỂM MƠ HỒ HOẶC MÂU THUẪN**:
     - **DỪNG LẠI NGAY LẬP TỨC (STOP)**.
     - Nêu rõ điểm xung đột hoặc thiếu dữ kiện, đưa ra tối đa 3-5 câu hỏi kèm phương án giải quyết đề xuất cho người dùng chọn.
     - Sau khi người dùng trả lời, ghi nhận câu trả lời vào `spec.md` và tự động kích hoạt **Giai đoạn 2**.
   - **NẾU TÀI LIỆU VÀ YÊU CẦU ĐÃ ĐỦ RÕ RÀNG**:
     - Thông báo ngắn gọn: *"Đã phân tích xong phạm vi tác động của Delta. Yêu cầu rõ ràng, tự động chuyển tiếp sang Giai đoạn 2: Cập nhật Kế hoạch Kỹ thuật."*
     - Tự động tiếp tục sang **Giai đoạn 2**.

---

### Giai Đoạn 2: Cập Nhật Kế Hoạch Kỹ Thuật (Plan Delta) — 🛑 CHECKPOINT 2

1. **Cập nhật `plan.md`**:
   - Thêm Phase mới vào Implementation Steps trong `plan.md` mô tả chiến lược thực hiện Delta (ví dụ: `Phase 5: KT Membership Schema Delta (Migration v2)`).
   - Nêu rõ tên file migration mới sẽ sinh (ví dụ: `add_kt_membership_fields`).
2. **Cập nhật `data-model.md` & `contracts/`**:
   - Bổ sung định nghĩa các trường mới, kiểu dữ liệu, enum mới và chú thích nghiệp vụ vào `data-model.md`.
   - Cập nhật các schemas xác thực DTOs trong `contracts/`.
3. **Ra quyết định rẽ nhánh**:
   - **NẾU PHÁT HIỆN BREAKING CHANGE LỚN** (ví dụ: bắt buộc phải migrate dữ liệu phức tạp hoặc đổi logic thanh toán):
     - **DỪNG LẠI HỎI Ý KIẾN NGƯỜI DÙNG** về chiến lược migration trước khi thực thi.
   - **NẾU THAY ĐỔI AN TOÀN & NON-DESTRUCTIVE**:
     - Tự động chuyển tiếp sang **Giai đoạn 3**.

---

### Giai Đoạn 3: Phân Rã Danh Sách Việc Delta (`tasks.md`)

1. **Quy tắc Append-only cho `tasks.md`**:
   - Tìm mã task lớn nhất hiện tại (ví dụ `T027`).
   - Thêm một Section mới vào cuối `tasks.md`:
     ```markdown
     ---

     ## Phase N: [Tên Delta / Migration v2] (Schema Delta)

     **Purpose**: [Mục tiêu nâng cấp, tuân thủ nguyên tắc Non-destructive & Backward-compatible].

     - [ ] T028 [US...-v2] Thêm enum và trường mới vào prisma/schema.prisma...
     - [ ] T029 [US...-v2] Cập nhật models và repositories...
     - [ ] T030 [US...-v2] Sinh file migration v2 và cập nhật TypeScript types...
     - [ ] T031 [US...-v2] Viết unit/integration test kiểm chứng các trường mới...
     - [ ] T032 [US...-v2] Chạy kiểm thử hồi quy toàn diện (typecheck và test suites)...
     ```
2. **Rà soát ma trận phủ**:
   - Đảm bảo 100% các trường/logic mới nêu trong Spec Delta đều có task tương ứng.

---

### Giai Đoạn 4: Thi Công Thực Tế Delta (`Implement Delta`) — 🛑 CHECKPOINT 3

1. **Thực thi theo các task vừa phân rã**:
   - Sửa schema (ví dụ: `prisma/schema.prisma`).
   - Chạy lệnh migration vật lý:
     ```bash
     pnpm prisma migrate dev --name <tên_migration_mới>
     ```
   - Sinh lại Client types (`pnpm prisma generate`).
   - Cập nhật Repositories, Domain Services hoặc Controllers liên quan.
   - Viết test case mới trong Vitest (`*.spec.ts`) để kiểm thử trọn vẹn dữ liệu và luồng nghiệp vụ của phần Delta.
2. **Kiểm tra hồi quy liên tục**:
   - `pnpm typecheck` (`tsc --noEmit`): Bắt buộc 0 lỗi.
   - `pnpm test`: Bắt buộc 100% tests (cả cũ và mới) đều pass.
3. **Cập nhật tiến độ**: Đánh dấu `[x]` vào từng task hoàn thành trong `tasks.md`.
4. **Xử lý Blocker**:
   - Nếu gặp lỗi xung đột migration hoặc lỗi DB lock -> **DỪNG LẠI TRAO ĐỔI VỚI NGƯỜI DÙNG**.

---

### Giai Đoạn 5: Đánh Giá Hội Tụ & Nghiệm Thu Delta (`Converge Delta`) — 🛑 CHECKPOINT 4

1. **Kiểm tra độ hội tụ thực tế**:
   - Query trực tiếp database thật hoặc inspect mã nguồn để đối soát từng trường mới đã xuất hiện trong bảng chưa.
   - Xác nhận cơ sở dữ liệu đã đồng bộ 100% với Spec Delta.
2. **Cập nhật tài liệu trực quan**:
   - Cập nhật sơ đồ Mermaid ERD và các bảng mô tả kiến trúc (ví dụ: `Kien_Truc_CSDL_SIM_KT_M4U.html` hoặc artifact markdown).
3. **Cập nhật Master Roadmap (`specs/ROADMAP.md`)**:
   - Cập nhật trạng thái Epic trong Bảng 1 thành `✅ 100% Hoàn thành (Delta vX)`.
   - Cập nhật số lượng tasks tổng và ghi nhận kết quả kiểm thử mới nhất.
   - Bổ sung chi tiết kết quả nghiệm thu Delta vào Bảng 3 (Lịch sử thay đổi / Changelog).
4. **Đóng gói & Visual QA**:
   - Chạy `pnpm build` xác nhận ứng dụng Next.js biên dịch tối ưu không lỗi.
   - **Visual QA (nếu Delta có đổi UI)**: Chạy Playwright chụp ảnh giao diện mới (Desktop & Mobile) lưu vào `docs/screenshots/<epic>/` để xác nhận không vỡ layout form sau khi bổ sung trường.
5. **Báo Cáo Nghiệm Thu Hoàn Tất Delta**:
   - Xuất bảng tóm tắt:
     - Danh sách các trường/tính năng mới đã bổ sung.
     - Tên migration mới đã áp dụng vào DB thật.
     - Số lượng test cases mới đã bổ sung và kết quả hồi quy (100% passed).
     - Ảnh chụp Visual QA kiểm chứng giao diện thực tế.
     - Link mở báo cáo trực quan và link tới `specs/ROADMAP.md` cho người dùng.
