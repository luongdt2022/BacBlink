# HIẾN PHÁP DỰ ÁN NACENTECH (PROJECT CONSTITUTION)
*Phiên bản: 2.0.0 | Phạm vi áp dụng: Toàn bộ tài liệu Đặc tả (SRS), Khảo sát, Thiết kế và Đánh giá kỹ thuật*

---

## 1. NGUYÊN TẮC BẤT BIẾN TỐI CAO (NON-NEGOTIABLE CORE PRINCIPLES)

1. **Nguyên tắc Không Bịa đặt (Zero Hallucination - Zero Assumption)**:
   - Mọi thông tin nghiệp vụ, luồng quy trình, cấu trúc dữ liệu đưa vào tài liệu bắt buộc phải được gắn 1 trong 3 nhãn chứng cứ:
     - `[VERIFIED]`: Thông tin có chứng cứ xác thực từ tài liệu gốc, bảng yêu cầu chức năng (file Excel đặt hàng, tài liệu đánh giá), schema database hoặc mã nguồn (kèm trích dẫn đường dẫn file hoặc mục cụ thể).
     - `[CONFIRMED]`: Thông tin chưa có trong tài liệu nhưng đã được Product Owner / Khách hàng xác nhận trực tiếp trong phiên làm việc.
     - `[PROPOSAL]`: Đề xuất suy luận nghiệp vụ hoặc giải pháp kỹ thuật của BA Agent. Mọi đề xuất này **bắt buộc** phải nêu rõ lý do, phương án thay thế và rủi ro/tác động tiềm ẩn. Không bao giờ được coi `[PROPOSAL]` là sự thật ngầm định nếu chưa chuyển sang `[CONFIRMED]`.
2. **Khung Xương Sống Đi Trước (Architecture & Backbone First)**:
   - Trước khi bẻ nhỏ và đào sâu vào từng mục chi tiết của tài liệu SRS phân hệ, toàn bộ dự án phải có một bản **Thiết Kế Cơ Sở (Basic Design - `Specification/BASIC_DESIGN_NACENTECH.md`)** đóng vai trò khung xương sống: định hình C4 Architecture, Story Mapping Backbone, Walking Skeleton và Domain Model.
3. **Cổng duyệt một chiều (Gated Confirmation)**:
   - Tài liệu chỉ được ghi nhận từng mục sau khi có xác nhận tường minh từ con người. Tuyệt đối không tự động sinh toàn bộ tài liệu từ các giả định chưa được kiểm chứng.
4. **Tính toàn vẹn của Lịch sử (Changelog Traceability)**:
   - Khi có thay đổi quyết định (Change Request / Pivot), không được âm thầm ghi đè nội dung cũ. Phải ghi nhận Delta (chênh lệch thay đổi), lý do thay đổi và đánh giá tác động lan truyền (Ripple Effects) đến các module liên quan.
5. **Tính Toàn Vẹn Bề Mặt Hiển Thị (Cross-Surface Integrity & Grep-First Scope)**:
   - Khi nhận bất kỳ yêu cầu thay đổi (CR/Delta) liên quan đến Master Data, Thuộc tính chung hoặc Danh mục cốt lõi, BA bắt buộc phải chạy AST/Grep Scan toàn diện trên 100% codebase để bóc tách Ma trận tác động bề mặt:
     $$\text{Surface Impact Matrix} = \{\text{DB Tables}\} \times \{\text{APIs}\} \times \{\text{UI Screens \& Components}\}$$
   - Bắt buộc phải xuất trình danh sách các màn hình bị tác động để User/PO gõ `XÁC NHẬN SCOPE` trước khi phân rã task. Tuyệt đối cấm tự suy diễn ngầm chỉ làm trong khuôn viên 1 module hẹp.
6. **Kỷ Luật Zero-Mock & Single Source of Truth trên Client**:
   - Cấm Dev tạo màn hình quản trị hoặc view nghiệp vụ bằng mock static state trong RAM. Bắt buộc 100% màn hình CRUD/Danh mục phải có integration API thật kết nối xuống CSDL (có đủ 3 trạng thái UX: Loading, Error, Empty).
   - Cấm hardcode mảng danh mục tĩnh tại từng file page UI riêng lẻ. Mọi dữ liệu dùng chung bắt buộc phải qua Client Hook/SDK tập trung (`useMasterData()`).
   - Khi đổi mã/enum, Dev bắt buộc chạy Global Sweep grep mã cũ trên toàn bộ dự án phải ra 0 kết quả mới được tick `[x]`.
7. **Chuẩn Kiểm Thử QC 4 Tầng Bắt Buộc (4-Tier Quality Gate)**:
   - QC khi tiếp nhận bàn giao bắt buộc phải đối soát Test Matrix bao phủ 100% các màn hình trong Surface Impact Matrix của BA.
   - Kiểm thử bắt buộc tuân thủ 4 tầng: (1) Unit & Invariants $\rightarrow$ (2) API Contracts $\rightarrow$ (3) DB Integration trên Postgres thật $\rightarrow$ (4) E2E Playwright & Scoped RBAC Fuzzing.
   - Cấm ký duyệt Gate 4 nếu chỉ test Backend trong phòng kín mà bỏ sót các màn hình giao diện người dùng.
8. **Kỷ Luật Kiểm Soát Chất Lượng Task & Pull Request (Stage-Gate Review Discipline & Zero-Bypass)**:
   - **Kỷ luật Task (Task DoD)**: CẤM Dev đánh dấu `[x]` trong `tasks.md` khi chưa tự rà soát qua 3 giai đoạn:
     1. *Pre-task*: Xác định đúng mã `REQ-`, `BR-`, `DB-`, `UI-`, `API-` và đánh giá ranh giới tác động chéo.
     2. *In-progress*: Tuân thủ ranh giới Clean Architecture (cấm rò rỉ DbContext lên API, CQRS MediatR, Async/Await với CancellationToken), an ninh 3D Scoped RBAC, chống IDOR, và bao phủ 5 trạng thái UX qua `<Async>`.
     3. *DoD*: Viết Unit Test bao phủ 100% `BR-*`, build local Release 0 Error, 0 Warning và test pass 100%.
   - **Kỷ luật Pull Request (PR 6-Axis Checklist)**:
     - Mọi PR bắt buộc áp dụng Template `.github/pull_request_template.md` bao phủ 6 trục kiểm soát: (1) Clean Architecture Boundary; (2) CSDL/EF Core Migration phi phá hủy; (3) An ninh 3D Scoped RBAC & Anti-IDOR; (4) Concurrency & Idempotency; (5) Frontend 5 UX states; (6) Testing & Evidence thực tế.
   - **Quy tắc Cấm Vượt Rào (Zero-Bypass SoD)**:
     - Tuyệt đối CẤM merge code khi chưa có đồng thuận từ 2 cổng độc lập: **Gate 3 (TechLead / SA Approve)** và **Gate 4 (QC Verification PASS)**.
     - Tuyệt đối CẤM tích checklist hình thức: Mọi tickbox phải có bằng chứng log test hoặc ảnh chụp giao diện đính kèm trong PR.

---

## 2. RANH GIỚI KIẾN TRÚC HỆ THỐNG NACENTECH (SYSTEM ARCHITECTURAL BOUNDARIES)

Hệ thống NacenTech tập trung vào nền tảng quản trị thông tin, đào tạo và kết nối công nghệ với 3 phân hệ chính:

```mermaid
graph TD
    subgraph Phân hệ 1: Kho Dữ liệu Công nghệ & Truy xuất (Tech Data & TracePro)
        A1[Quản lý Sản phẩm / Công nghệ]
        A2[Phân loại theo Ngành & Cấp độ TRL]
        A3[Tìm kiếm thông minh & Truy xuất nguồn gốc]
    end

    subgraph Phân hệ 2: Đào tạo Trực tuyến & Kết nối Chuyên gia (LMS & Expert Network)
        B1[Quản lý Khóa học & Nội dung Đào tạo]
        B2[Hồ sơ Chuyên gia & Đặt lịch tư vấn]
        B3[Diễn đàn / Tương tác trực tuyến]
    end

    subgraph Phân hệ 3: Nền tảng Quản trị & Hạ tầng Dữ liệu (Core Platform & RBAC)
        C1[Hệ thống Phân quyền người dùng RBAC]
        C2[API Gateway, Xác thực SSO / JWT]
        C3[Cơ sở Dữ liệu & Kho Lưu trữ Tài nguyên]
    end

    A1 & A2 & A3 --> C2
    B1 & B2 & B3 --> C2
    C2 --> C1
    C2 --> C3
```

- **Tầng Giao diện (Presentation / Frontend)**: Web Portal dành cho Quản trị viên, Doanh nghiệp, Chuyên gia và Học viên; Ứng dụng di động (Mobile App) cho tra cứu và đào tạo.
- **Tầng Dịch vụ & Nghiệp vụ (Application / Backend Services)**: Xử lý logic kho dữ liệu công nghệ, chấm điểm/phân loại mức độ sẵn sàng công nghệ (TRL - Technology Readiness Level), luồng đào tạo e-learning, điều phối tư vấn chuyên gia và ma trận quyền hạn TracePro.
- **Tầng Dữ liệu & Tích hợp (Data Layer & Integration)**: Cơ sở dữ liệu quan hệ (PostgreSQL/MySQL), kho lưu trữ tài liệu/video bài giảng, tìm kiếm toàn văn (Full-text search) và các API tích hợp bên ngoài.

---

## 3. QUY CHUẨN ĐỊNH DANH TRUY VẾT (TRACEABILITY IDENTIFIER SCHEMA)

Tất cả các thực thể trong tài liệu SRS, Task, Test Case phải tuân thủ chuẩn tiền tố sau:

| Tiền tố | Phân loại | Định dạng | Ví dụ |
| :--- | :--- | :--- | :--- |
| **`REQ-`** | Yêu cầu nghiệp vụ / chức năng người dùng | `REQ-[MODULE]-[STT]` | `REQ-TECH-001`, `REQ-LMS-002`, `REQ-EXP-003` |
| **`BR-`** | Quy tắc nghiệp vụ & điều kiện ràng buộc | `BR-[MODULE]-[STT]` | `BR-TRL-005` (Quy tắc đánh giá cấp độ TRL 1–9) |
| **`DB-`** | Mô hình dữ liệu & trường thông tin | `DB-[TABLE]-[STT]` | `DB-PRODUCT-001` (Bảng thông tin sản phẩm công nghệ) |
| **`NFR-`** | Yêu cầu phi chức năng (Hiệu năng, bảo mật) | `NFR-[CATEGORY]-[STT]` | `NFR-PERF-001` (Thời gian phản hồi tìm kiếm $\le 500$ms) |
| **`UI-`** | Giao diện, màn hình hoặc luồng hiển thị | `UI-[SCREEN]-[STT]` | `UI-EXP-002` (Màn hình chi tiết hồ sơ chuyên gia) |
| **`API-`** | Điểm cuối giao tiếp dữ liệu / dịch vụ | `API-[MODULE]-[STT]` | `API-SEARCH-001` (API tìm kiếm công nghệ đa tiêu chí) |
| **`CR-`** | Yêu cầu thay đổi phạm vi / giải pháp | `CR-[NĂM]-[STT]` | `CR-2026-001` (Bổ sung bộ tiêu chí phân loại TRL) |

---

## 4. MA TRẬN TRUY VẾT BẮT BUỘC (TRACEABILITY COVERAGE)

Tài liệu được xem là hợp lệ khi đảm bảo nguyên tắc **Truy vết khép kín (Closed-loop Traceability)**:
1. Mỗi **`REQ-`** phải tương ứng với ít nhất một **`BR-`** (quy tắc nghiệp vụ) và một **`UI-`** hoặc **`API-`** (giao diện hoặc điểm cuối dữ liệu).
2. Các yêu cầu về dữ liệu sản phẩm, phân loại TRL và ngành nghề kinh tế phải map trực tiếp sang cấu trúc bảng/trường trong **`DB-`**.
3. Mỗi **`NFR-`** bắt buộc phải có **chỉ số định lượng đo lường được** (Threshold & Metric), ví dụ: thời gian phản hồi API, số người dùng đồng thời trên hệ thống đào tạo trực tuyến, chuẩn an toàn dữ liệu cá nhân.
4. Mọi điểm mâu thuẫn hoặc chưa có quyết định cuối cùng phải được gắn cờ `⛳ CẦN XÁC NHẬN` kèm người chịu trách nhiệm chốt.

---

## 5. CÁC QUY CHUẨN NGHIỆP VỤ ĐẶC THÙ CHO HỆ THỐNG NACENTECH

1. **Chuẩn hóa Phân loại Công nghệ**:
   - Phân loại theo ngành kinh tế: Tuân thủ Khung phân loại ngành kinh tế Việt Nam (VSIC).
   - Phân loại mức độ sẵn sàng công nghệ: Bám sát thang đo TRL (Technology Readiness Level) từ mức 1 đến mức 9.
2. **Quản lý Quyền hạn & Bảo mật (RBAC & TracePro)**:
   - Cơ chế phân quyền chi tiết đến từng vai trò (Admin, Doanh nghiệp sở hữu công nghệ, Chuyên gia, Học viên, Khách vãng lai).
   - Cơ chế bảo vệ sở hữu trí tuệ và bảo mật thông tin hồ sơ chuyên gia/công nghệ chưa công bố rộng rãi.
3. **Hiệu năng Tìm kiếm & Tải nội dung Đào tạo**:
   - Tìm kiếm nhanh, lọc đa tiêu chí theo ngành nghề, mức TRL, đơn vị nghiên cứu.
   - Hỗ trợ streaming video bài giảng mượt mà, lưu vết tiến độ học tập của học viên theo thời gian thực.
