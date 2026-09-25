# Ma Trận Truy Vết Kỹ Thuật (Traceability Matrix) — Nacentwin (NacenTech)

> **Mục đích**: Đảm bảo nguyên tắc **Truy vết khép kín (Closed-loop Traceability)** 2 chiều giữa:
> 1. Thiết Kế Cơ Sở (Basic Design) tại `../../Specification/02_BASIC_DESIGN/` & dữ liệu Excel gốc.
> 2. Các Epics Detail Design (`specs/TASK-XX_...`), bản thiết kế (`plan.md`), đầu việc (`tasks.md`), mã nguồn Backend (`backend/`), mã nguồn Frontend (`frontend/`) và bộ kiểm thử (`tests/`).

---

## 1. MA TRẬN ÁNH XẠ TỔNG THỂ (BASIC DESIGN TO DETAIL DESIGN)

| Mã Task BD | Tên Phân Hệ | Tài Liệu Nguồn Gốc (Excel / Basic Design) | Thư Mục Detail Design (Spec Kit) | Phạm Vi Mã Định Danh | Trạng Thái Kỹ Thuật |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **`TASK-00`** | Platform Foundation & Common | Hiến pháp kỹ thuật, Clean Architecture | [`specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON`](./TASK-00_PLATFORM_FOUNDATION_VA_COMMON/) | `ARCH-*`, `DB-INIT-*`, `API-BASE-*` | ⚪ Dự kiến |
| **`TASK-01`** | Tổng quan & Kiến trúc Home | Sheet `HOME1` + `Giới thiệu` (60 dòng) | [`specs/TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME`](./TASK-01_TONG_QUAN_VA_KIEN_TRUC_HOME/) | `REQ-HOME-*`, `UI-LANDING-*`, `AI-BOT-*` | ⚪ Dự kiến |
| **`TASK-02`** | Hồ sơ Doanh nghiệp ĐMST | Sheet `DN ĐMST` (225 dòng dữ liệu) | [`specs/TASK-02_HO_SO_DOANH_NGHIEP_DMST`](./TASK-02_HO_SO_DOANH_NGHIEP_DMST/) | `REQ-DN-*`, `BR-MST-*`, `DB-CORP-*` | ⚪ Dự kiến |
| **`TASK-03`** | Hồ sơ Tìm Mua (Buyer) | Sheet `T.mua SP` (356 dòng dữ liệu) | [`specs/TASK-03_HO_SO_TIM_MUA_BUYER`](./TASK-03_HO_SO_TIM_MUA_BUYER/) | `REQ-BUY-*`, `BR-SURVEY-*`, `DB-DEMAND-*` | ⚪ Dự kiến |
| **`TASK-04`** | Hồ sơ Chào Bán & Bộ Lọc | Sheet `C.bán SP` + `Bo_loc_Cban` (1,568 dòng) | [`specs/TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`](./TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC/) | `REQ-SELL-*`, `BR-FILTER-*`, `BR-TRL-*` | ⚪ Dự kiến |
| **`TASK-05`** | Hồ sơ Chuyên Gia KH&CN | Sheet `C.gia` (94 dòng dữ liệu) | [`specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN`](./TASK-05_HO_SO_CHUYEN_GIA_KHCN/) | `REQ-EXP-*`, `BR-LLKH-*`, `AI-SCAN-*` | ⚪ Dự kiến |
| **`TASK-06`** | Danh Mục Ngành & Ma Trận | Sheet `Ngành` + `Ma trận LV-CN` (161 dòng) | [`specs/TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN`](./TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN/) | `REQ-CAT-*`, `DB-SECTOR-*`, `API-MATRIX-*` | ⚪ Dự kiến |
| **`TASK-07`** | Phân Quyền & Quản Trị Admin | Sheet `Admin` (6 dòng quyền hạt nhân) | [`specs/TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN`](./TASK-07_PHAN_QUYEN_QUAN_TRI_ADMIN/) | `REQ-ADM-*`, `BR-RBAC-*`, `API-AUTH-*` | ⚪ Dự kiến |

---

## 2. QUY CHUẨN ĐỒNG BỘ MÃ ĐỊNH DANH (IDENTIFIER STANDARDIZATION)

Mọi yêu cầu kỹ thuật phải được giữ nguyên vẹn mã định danh khi bóc tách sang `spec.md`, `plan.md`, `tasks.md` và mã nguồn:

| Tiền Tố | Loại Yêu Cầu | Vị Trí Trong Spec Kit | File Mã Nguồn BE (`backend/`) | File Mã Nguồn FE (`frontend/`) | Kiểm Thử Bắt Buộc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`REQ-`** | Yêu cầu chức năng người dùng | `spec.md` (User Stories) | Domain Service / UseCase | View / Page Component | Acceptance Criteria / E2E Test |
| **`BR-`** | Quy tắc nghiệp vụ & điều kiện ràng buộc | `spec.md` & `plan.md` | Domain Entities / Validators | Client Validators | Unit Test (100% rules coverage) |
| **`DB-`** | Bảng dữ liệu & khóa ngoại | `plan.md` (Schema) | EF Core Entity & Migration | DTO Type definition | Migration & DB Integration Test |
| **`API-`** | Điểm cuối dịch vụ & hợp đồng giao tiếp | `plan.md` (OpenAPI Contracts) | FastEndpoints / Controllers | API Client / SDK Service | API Contract & Integration Test |
| **`UI-`** | Giao diện & 5 trạng thái UX | `spec.md` & `plan.md` (Wireframes) | - | UI Component (`<Async>`) | Visual QA & Component Test |
| **`NFR-`** | Yêu cầu phi chức năng (tốc độ, bảo mật) | `spec.md` (Success Criteria) | Caching, Middleware, Query | Lazy load, Asset bundle | Load Test / Security Scan |

---

## 3. NGUYÊN TẮC BẢO ĐẢM TRUY VẾT KHÉP KÍN

1. **Không có Task mồ côi (No Orphan Tasks)**: Mỗi task trong `tasks.md` của bất kỳ Epic nào đều phải được gắn thẻ tham chiếu rõ ràng đến ít nhất một mã `REQ-`, `BR-`, `DB-`, `API-` hoặc `UI-`.
2. **Không có Code mồ côi (No Orphan Code)**: Mọi endpoint API trong `backend/` hoặc màn hình trong `frontend/` đều phải tương ứng với mã yêu cầu đã xác định.
3. **Đồng bộ khi có Thay Đổi (Change Request - `/speckit-delta`)**:
   - Khi Basic Design thay đổi: Cập nhật tài liệu BD tương ứng -> Kích hoạt `/speckit-delta` -> Cập nhật `spec.md`, `plan.md`, `tasks.md` -> Cập nhật `TRACEABILITY.md`.
