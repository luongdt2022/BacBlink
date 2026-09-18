# Master Roadmap & Epic Registry: Hệ Thống Phần Mềm NacenTech

> **Mục đích**: Là nguồn thông tin duy nhất (Single Source of Truth) quản lý toàn bộ vòng đời, tiến độ và liên kết tài liệu của tất cả các Epics trong dự án NacenTech.  
> **Hiến pháp áp dụng**: `.specify/memory/constitution.md`  
> **Ma trận ánh xạ nghiệp vụ**: `specs/TRACEABILITY.md`

---

## 1. BẢNG ĐIỀU PHỐI TOÀN BỘ EPICS (MASTER REGISTRY)

| Mã Epic | Tên Phân Hệ Kỹ Thuật | Thư Mục Spec | Ánh Xạ SRS Gốc | Trạng Thái | Test Coverage | Ghi Chú / Mục Tiêu |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **E0.1** | Platform Foundation & Architecture | [`specs/001-platform-foundation`](./001-platform-foundation/) | Hạ tầng chung | ⚪ **Dự Kiến** | 0/0 | Hạ tầng Clean Architecture, Docker, PostgreSQL ORM, CI/CD |
| **E1** | Core Platform Identity & RBAC | [`specs/002-core-platform-iam`](./002-core-platform-iam/) | `SRS-001-CORE-IAM` | ⚪ **Dự Kiến** | 0/0 | Xác thực JWT/SSO, phân quyền 4 vai trò (Admin, Doanh nghiệp, Chuyên gia, Học viên) |
| **E2** | Tech Data Catalog & TRL Assessment | [`specs/003-tech-product-catalog`](./003-tech-product-catalog/) | `SRS-002-TECH-DATA` | ⚪ **Dự Kiến** | 0/0 | Quản lý sản phẩm/công nghệ, phân loại ngành VSIC, thang đo TRL 1–9 |
| **E3** | LMS Online Training & E-Learning | [`specs/004-lms-elearning`](./004-lms-elearning/) | `SRS-003-LMS-TRAIN` | ⚪ **Dự Kiến** | 0/0 | Khóa học, bài giảng video streaming, quản lý tiến độ học tập và cấp chứng chỉ |
| **E4** | Expert Network & Consultation | [`specs/005-expert-network`](./005-expert-network/) | `SRS-004-EXPERT-NET` | ⚪ **Dự Kiến** | 0/0 | Hồ sơ chuyên gia, tìm kiếm đối tác, đặt lịch tư vấn và kết nối cung cầu công nghệ |

---

## 2. QUY ƯỚC ĐÁNH MÃ & CẤU TRÚC THƯ MỤC EPICS

1. **Quy tắc đặt tên thư mục**: `specs/<mã-thứ-tự>-<tên-phân-hệ>`
   - Các Epic kiến trúc nền tảng (Foundation): Đánh số bắt đầu từ `001-` (ví dụ: `001-platform-foundation`).
   - Các Epic phân hệ nghiệp vụ: Đánh số tuần tự tiếp theo (`002-`, `003-`, `004-`...).
2. **Bộ 3 tài liệu bắt buộc trong mỗi Epic**:
   - `spec.md`: Đặc tả yêu cầu kỹ thuật, User Stories, Functional Requirements, Edge Cases (được sinh từ SRS gốc).
   - `plan.md`: Thiết kế kỹ thuật, thư viện, database schema, API contracts.
   - `tasks.md`: Phân rã đầu việc chi tiết có checkbox `[x]` và lệnh test nghiệm thu.
3. **Epic hiện hành**: Được ghi nhận trong file `.specify/feature.json` để công cụ và AI Agent nhận diện ngữ cảnh hoạt động.

---

## 3. LỊCH SỬ THAY ĐỔI & PHÁT SINH EPICS (CHANGE LOG / DECISION LOG)

| Ngày | Epic Bị Tác Động | Loại Thay Đổi | Mô Tả Chi Tiết Thay Đổi | Người / Công Cụ Kích Hoạt |
| :---: | :---: | :---: | :--- | :---: |
| **2026-09-18** | **Toàn dự án** | **Khởi tạo Master Registry** | Khởi tạo bảng điều phối tổng thể các Epics dự án NacenTech theo chuẩn Spec Kit Framework | Spec Kit Autopilot |

---

## 4. QUY TRÌNH BẮT BUỘC ĐỒNG BỘ ROADMAP KHI CÓ THAY ĐỔI

Mỗi khi Agent hoặc Lập trình viên thực hiện một trong các hành động sau, **BẮT BUỘC** phải tự động cập nhật file `specs/ROADMAP.md`:
1. **Phát sinh Epic mới**: Bổ sung hàng mới vào Bảng Master Registry (Mục 1) và ghi nhận lý do vào Bảng Lịch sử thay đổi (Mục 3).
2. **Khởi động thi công Epic**: Đổi trạng thái từ `⚪ Dự Kiến` sang `🔵 Đang thi công`.
3. **Hoàn thành / Nghiệm thu Epic**: Đổi trạng thái sang `✅ 100% Hoàn thành`, cập nhật số lượng tasks và kết quả test.
4. **Nâng cấp / Delta Request (Change Request)**: Cập nhật ghi chú tại Bảng 1 và thêm dòng mới vào Bảng 3 mô tả nội dung tác động.
