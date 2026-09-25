# Master Roadmap & Epic Registry: Hệ Thống Phần Mềm Nacentwin (NacenTech)

> **Mục đích**: Là nguồn thông tin duy nhất (Single Source of Truth) quản lý toàn bộ vòng đời, tiến độ và liên kết tài liệu của tất cả các Epics trong dự án.  
> **Cơ chế liên kết**: Ánh xạ chuẩn 1:1 với các Tasks Thiết Kế Cơ Sở (Basic Design) tại `../../Specification/02_BASIC_DESIGN/`.  
> **Hiến pháp áp dụng**: `.specify/memory/constitution.md`  
> **Ma trận truy vết**: `specs/TRACEABILITY.md`

---

## 1. BẢNG ĐIỀU PHỐI TOÀN BỘ EPICS (MASTER REGISTRY)

| Mã Epic | Nhóm | Tên Phân Hệ Kỹ Thuật | Thư Mục Spec Kit | Ánh Xạ Basic Design | Trạng Thái | Tiến Độ | Ghi Chú / Trọng Tâm Kỹ Thuật |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **`TASK-00`** | **Foundation** | Khung Dự Án, Kiến Trúc & Common Kernel | [`specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON`](./TASK-00_PLATFORM_FOUNDATION_VA_COMMON/) | *Hạ tầng kỹ thuật* | ⚪ **Dự Kiến** | 0% | .NET Clean Architecture, EF Core, Docker DB, Result Pattern, JWT Auth Middleware |
| **`TASK-01`** | **Domain** | Tổng Quan Hệ Thống & Kiến Trúc Home | [`specs/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME`](./TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/) | [`TASK-01`](../../Specification/02_BASIC_DESIGN/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME) | ⚪ **Dự Kiến** | 0% | SiteMap, Menu điều hướng, Portal Landing, Chatbot AI định hướng kết nối cung cầu |
| **`TASK-02`** | **Domain** | Hồ Sơ Doanh Nghiệp ĐMST | [`specs/TASK-02_HO_SO_DOANH_NGHIEP_DMST`](./TASK-02_HO_SO_DOANH_NGHIEP_DMST/) | [`TASK-02`](../../Specification/02_BASIC_DESIGN/TASK-02_HO_SO_DOANH_NGHIEP_DMST) | ⚪ **Dự Kiến** | 0% | 10 nhóm trường (225 fields), định danh pháp lý MST, hồ sơ năng lực KH&CN, văn bằng SHTT |
| **`TASK-03`** | **Domain** | Hồ Sơ Tìm Mua / Nhu Cầu (Buyer) | [`specs/TASK-03_HO_SO_TIM_MUA_BUYER`](./TASK-03_HO_SO_TIM_MUA_BUYER/) | [`TASK-03`](../../Specification/02_BASIC_DESIGN/TASK-03_HO_SO_TIM_MUA_BUYER) | ⚪ **Dự Kiến** | 0% | Phiếu khảo sát nhu cầu đổi mới công nghệ DNNVV, đăng ký tham quan triển lãm |
| **`TASK-04`** | **Domain** | Hồ Sơ Chào Bán (Seller) & Bộ Lọc 18 Ngành | [`specs/TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`](./TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC/) | [`TASK-04`](../../Specification/02_BASIC_DESIGN/TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC) | ⚪ **Dự Kiến** | 0% | **Domain Lõi**: Hồ sơ 4 lớp, Engine lọc 1,479 quy tắc, thang đo TRL 1-9 khi chuyển giao |
| **`TASK-05`** | **Domain** | Hồ Sơ Chuyên Gia KH&CN & AI Scan LLKH | [`specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN`](./TASK-05_HO_SO_CHUYEN_GIA_KHCN/) | [`TASK-05`](../../Specification/02_BASIC_DESIGN/TASK-05_HO_SO_CHUYEN_GIA_KHCN) | ⚪ **Dự Kiến** | 0% | Cấu trúc LLKH chuẩn Bộ KH&CN, luồng AI trích xuất tự động dữ liệu từ file CV/LLKH |
| **`TASK-06`** | **Domain** | Danh Mục Ngành TT17 & Ma Trận LV-CN | [`specs/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`](./TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/) | [`TASK-06`](../../Specification/02_BASIC_DESIGN/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN) | ⚪ **Dự Kiến** | 0% | **Master Data**: 18 ngành TT17, 15 triển lãm, Ma trận 109 cặp quan hệ Lĩnh vực - Công nghệ |
| **`TASK-07`** | **Domain** | Phân Quyền & Năng Lực Quản Trị Admin | [`specs/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`](./TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/) | [`TASK-07`](../../Specification/02_BASIC_DESIGN/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN) | ⚪ **Dự Kiến** | 0% | 5 quyền hạt nhân: Duyệt tài khoản, duyệt shop seller, duyệt chuyên gia, nhu cầu, liên kết |

---

## 2. QUY ƯỚC ĐẶT TÊN & BỘ 3 TÀI LIỆU BẮT BUỘC

1. **Quy tắc đặt tên thư mục Detail Design**:
   - `specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON` (Khung dự án & thư viện dùng chung).
   - `specs/TASK-XX_<TEN_GIONG_BASIC_DESIGN>` (Khớp tên 1:1 với thư mục tại `../../Specification/02_BASIC_DESIGN/`).
2. **Bộ 3 tài liệu bắt buộc trong mỗi Epic**:
   - `spec.md`: Đặc tả yêu cầu kỹ thuật, trích dẫn trực tiếp nguồn từ Basic Design, User Stories, `REQ-*`, `BR-*`.
   - `plan.md`: Thiết kế chi tiết: API Contracts (Contract-First), DB Schema, Backend Architecture, Frontend UI/UX (5 UX States).
   - `tasks.md`: Phân rã đầu việc có tag `[BE]`, `[FE]`, `[INT]` kèm lệnh test kiểm chứng.

---

## 3. THỨ TỰ TRIỂN KHAI TỐI ƯU (RECOMMENDED EXECUTION SEQUENCE)

```text
Giai đoạn 0: TASK-00 (Foundation & Common Kernel)
   ↓
Giai đoạn 1: TASK-06 (Master Data Danh mục ngành & Ma trận - Khóa ngoại bắt buộc)
   ↓
Giai đoạn 2: TASK-07 (Phân quyền & Kiểm duyệt Admin)
   ↓
Giai đoạn 3: TASK-02 (Hồ sơ DN ĐMST) → TASK-04 (Hồ sơ Seller & Bộ Lọc) → TASK-03 (Buyer) → TASK-05 (Chuyên gia)
   ↓
Giai đoạn 4: TASK-01 (Tổng quan & Giao diện Trang chủ Portal kết nối toàn hệ thống)
```

---

## 4. LỊCH SỬ THAY ĐỔI ROADMAP

| Ngày | Epic Bị Tác Động | Loại Thay Đổi | Mô Tả Chi Tiết Thay Đổi | Người / Công Cụ |
| :---: | :---: | :---: | :--- | :---: |
| **2026-09-25** | **Toàn bộ Roadmap** | **Chuẩn hóa 1:1 với Basic Design** | Đồng bộ toàn bộ danh mục Epics khớp 1:1 với 7 Tasks Basic Design + bổ sung TASK-00 Foundation | Spec Kit Autopilot |
