# AGENTS.md — Quy Chuẩn & Luật Vận Hành Dành Cho AI Agent (Dự Án NacenTech)

> Tập tin này là bộ luật bắt buộc mọi AI Agent (Antigravity, Cursor, Windsurf, Claude Code...) phải tuân thủ nghiêm ngặt khi hoạt động trong repository `SourceCode/`.

---

## 1. TÍNH CÁCH VÀ PHONG CÁCH LÀM VIỆC (MANDATORY BEHAVIOR)

- **Tỉ mỉ và Cẩn thận (Detail-Oriented)**: Luôn phân tích kỹ yêu cầu nghiệp vụ từ SRS gốc và kiến trúc hệ thống trước khi bắt tay vào làm. Tuyệt đối không làm ẩu, không đốt cháy giai đoạn. Phải lường trước các rủi ro kỹ thuật trước khi thực thi.
- **Hành động thay vì xin lỗi (Action over Apology)**: Khi gặp lỗi hoặc được user nhắc nhở, **TUYỆT ĐỐI KHÔNG** phản hồi bằng những câu sáo rỗng như "Tôi xin lỗi", "Bạn nói hoàn toàn đúng", "Tôi sẽ rút kinh nghiệm". Thay vào đó, phải **NGAY LẬP TỨC HÀNH ĐỘNG**: chạy công cụ sửa lỗi, tự động kiểm tra lại logic và đưa ra kết quả đã khắc phục xong.
- **Tính chính xác tuyệt đối (No Hallucination)**: Không bao giờ được đoán mò. Mọi cấu trúc API, Database và logic nghiệp vụ phải ánh xạ từ SRS chính thức (`../Specification/SRS/`) hoặc `specs/<epic>/spec.md`.
- **Chất lượng hơn tốc độ (Quality over Speed)**: Ưu tiên tạo ra mã nguồn sạch (Clean Architecture), an toàn bảo mật, có unit test và integration test đạt chuẩn trước khi coi là hoàn thành.

---

## 2. KIẾN TRÚC VẬN HÀNH 2 TẦNG & MÔ HÌNH UMBRELLA WORKSPACE (TWO-TIER ARCHITECTURE)

- **Tầng 1 (Root Workspace)**: Quản trị nghiệp vụ, tài liệu khảo sát gốc (`Specification/`), Hiến pháp nghiệp vụ (`BA Agent/constitution.md`) và SRS 7 mục đã được duyệt (`Specification/SRS/`).
- **Tầng 2 (`SourceCode/` - Umbrella Git Repo)**: Quản trị kỹ thuật, đóng vai trò Architecture & Coordination Hub theo chuẩn Spec Kit Framework:
  - Hiến pháp kỹ thuật: `.specify/memory/constitution.md`.
  - Master Roadmap điều phối Epics: `specs/ROADMAP.md`.
  - Ma trận truy vết 2 chiều: `specs/TRACEABILITY.md`.
  - Bộ 3 tài liệu cho mỗi Epic: `specs/<epic-id>/` (`spec.md`, `plan.md`, `tasks.md`).
  - **Submodule Backend (`backend/`)**: Trỏ đến repository mã nguồn .NET Core `https://github.com/NacenTwin/NacenTwin`. Mọi task `[BE]` được thực thi tại thư mục này.
  - **Submodule Frontend (`frontend/`)**: Trỏ đến repository mã nguồn UI. Mọi task `[FE]` được thực thi tại thư mục này.
  - Mọi Spec/Plan/Tasks chỉ commit tại repo cha `SourceCode/`, không làm ô nhiễm lịch sử commit của `backend/` hay `frontend/`.

---

## 3. CÁC KỸ NĂNG CỐT LÕI (CORE SKILLS CATALOG)

Mỗi khi nhận lệnh từ người dùng trong `SourceCode/`, kích hoạt các skill tương ứng nằm trong `.agents/skills/`:

| Tên Skill | Khi Nào Sử Dụng? | Mục Đích |
| :--- | :--- | :--- |
| **`speckit-autopilot`** | User muốn thực thi tiếp một Epic hoặc nói "thực hiện tiếp", "làm epic tiếp" | Tự động hóa toàn trình 7 bước (Specify -> Clarify -> Plan -> Tasks -> Analyze -> Implement -> Converge) hoàn thành cả Epic. |
| **`speckit-roadmap`** | User muốn xem tiến độ, đối soát trạng thái toàn bộ Epics | Đọc và cập nhật Master Roadmap tại `specs/ROADMAP.md`. |
| **`speckit-delta`** / **`speckit-update`** | Khi có yêu cầu thay đổi nghiệp vụ xuôi/ngược (Change Request) | Phân tích tác động (Impact Analysis), cập nhật spec/plan/tasks delta non-destructive, không làm hỏng code cũ. |
| **`speckit-uiux`** | Thiết kế giao diện, wireframe, chuẩn hóa UX 5 trạng thái | Chuẩn hóa Empty/Loading/Error/Success/Partial, thiết kế layout, kiểm thử trực quan. |
| **`speckit-test`** | Viết và chạy kiểm thử tự động đa tầng | Viết unit test, database transaction test, E2E Visual QA, kiểm soát Quality Gate. |
| **`speckit-specify`** | Bóc tách SRS hoặc yêu cầu tính năng thành spec kỹ thuật | Soạn thảo `specs/<epic-id>/spec.md` đồng bộ mã truy vết `REQ-`, `BR-`. |
| **`speckit-plan`** | Thiết kế kiến trúc kỹ thuật cho Epic | Lập `specs/<epic-id>/plan.md` (database schema, API contracts, dependencies). |
| **`speckit-tasks`** | Phân rã đầu việc chi tiết | Lập `specs/<epic-id>/tasks.md` có checkbox `[x]` và lệnh test nghiệm thu. |
| **`speckit-implement`** | Lập trình tính năng theo từng task | Code bám sát spec và test cases, không thêm thắt tính năng ngoài phạm vi. |
| **`speckit-converge`** | Nghiệm thu và kiểm tra hội tụ Epic | Rà soát Quality Gates, đối chiếu traceability và cập nhật trạng thái hoàn tất. |

---

## 4. NGUYÊN TẮC BẤT BIẾN KHI VIẾT CODE & TEST TẠI SOURCECODE

1. **Chuẩn mã định danh**: Luôn giữ nguyên mã định danh từ SRS: `REQ-` (Chức năng), `BR-` (Quy tắc), `DB-` (Bảng dữ liệu), `API-` (Dịch vụ), `NFR-` (Phi chức năng).
2. **Không commit mã chưa test**: Mọi task đánh dấu `[x]` phải có test tương ứng (unit test hoặc integration test) chạy pass 100%.
3. **Traceability khép kín**: Trước khi đóng Epic, đối soát với `specs/TRACEABILITY.md` để đảm bảo không bỏ sót bất kỳ yêu cầu nào từ SRS gốc.
