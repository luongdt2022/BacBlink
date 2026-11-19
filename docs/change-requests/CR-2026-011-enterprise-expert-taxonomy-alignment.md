# YÊU CẦU THAY ĐỔI (CHANGE REQUEST) — CR-2026-011

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Mã Change Request** | `CR-2026-011` |
| **Tiêu đề** | Chuẩn Hóa Taxonomy Ngành & Triệt Tiêu Mảng Tĩnh Sai Lệch Mã Cho Danh Bạ Doanh Nghiệp (TASK-02), Danh Bạ Chuyên Gia (TASK-05), Cổng Gov/Admin (TASK-07) và Hướng Dẫn/Form Tạo Công Nghệ |
| **Người đề xuất** | Ban Quản trị Dự án (PO/PM NacenTech) & Lead BA (`nacen-ba`) |
| **Căn cứ quyết định** | Kế hoạch tổng thể chuẩn hóa Taxonomy và Zero-Mock (Đợt 2) & Quyết định PO `PO-DEC-20261030-02` |
| **Ngày ban hành** | 30/10/2026 |
| **Mức độ ưu tiên** | **P1 — Khẩn cấp** (Chốt chặn sinh tử chất lượng Đợt 2) |
| **Trạng thái** | 🟢 **ĐÃ DUYỆT SCOPE (DoR Approved)** — Chuyển giao SA Plan & Dev Implementation |

---

## 1. BỐI CẢNH & HIỆN TRẠNG PHÁT HIỆN TẠI ĐỢT 2 (GREP-FIRST DISCOVERY)

Tiếp nối thành công của Đợt 1 (Đã ký duyệt Gate 5 cho Mặt tiền Cung - Cầu và Taxonomy SSOT qua `CR-2026-010`), Ban Quản trị Dự án phối hợp với Lead BA tiến hành rà soát chuyên sâu Đợt 2 trên các phân hệ: **Danh bạ Doanh nghiệp (`TASK-02`)**, **Danh bạ Chuyên gia (`TASK-05`)**, **Cổng Quản trị Admin/Gov (`TASK-07`)**, cùng **Biểu mẫu Tạo/Sửa công nghệ và Trang Hướng dẫn**.

Kết quả rà soát phát hiện 4 nhóm vi phạm nghiêm trọng cần khắc phục khẩn cấp:

1. **Gán nhãn sai lệch mã nghiêm trọng tại Danh bạ Doanh nghiệp (`EnterprisesDirectoryView.tsx`)**:
   - Tồn tại mảng tĩnh `SECTORS_TT17` với 11 phần tử tự định nghĩa gán nhãn sai lệch hoàn toàn so với CSDL gốc:
     * Gán `LV01` thành *"Cơ khí, Chế tạo máy & Tự động hóa"* (Trong khi SSOT CSDL: `LV01` là **Nông nghiệp**).
     * Gán `LV05` thành *"Nông nghiệp công nghệ cao, nông nghiệp số"* (Trong khi SSOT CSDL: `LV05` là **Chế biến thực phẩm – đồ uống**).
     * Gán `LV07` thành *"Y - Dược, Sinh học & Thiết bị y tế"* (Trong khi SSOT CSDL: `LV07` là **Cơ khí – chế tạo – công nghiệp hỗ trợ**).
     * Gán `LV08` thành *"Công nghệ thông tin, chuyển đổi số"* (Trong khi SSOT CSDL: `LV08` là **Điện – điện tử – tự động hóa**).
     * Gán `LV11` thành *"Vật liệu mới, nano..."* (Trong khi SSOT CSDL: `LV11` là **Nước – môi trường – chất thải**).
     * Gán `LV12` thành *"Năng lượng tái tạo & MT"* (Trong khi SSOT CSDL: `LV12` là **Xây dựng – vật liệu – hạ tầng**).
     * Gán `LV14` thành *"Điện - Điện tử & Viễn thông"* (Trong khi SSOT CSDL: `LV14` là **Logistics – vận tải – kho bãi**).
     * Gán `LV15` thành *"Chế biến thực phẩm..."* (Trong khi SSOT CSDL: `LV15` là **Du lịch – khách sạn – nhà hàng**).
     * Gán `LV16` thành *"Dệt may..."* (Trong khi SSOT CSDL: `LV16` là **CNTT – viễn thông – chuyển đổi số**).
     * Gán `LV17` thành *"Logistics..."* (Trong khi SSOT CSDL: `LV17` là **Khoa học – công nghệ – đổi mới sáng tạo**).
   - *Hậu quả*: Người dùng chọn lọc ngành này nhưng hệ thống lại gửi mã của ngành khác xuống backend, dẫn đến kết quả lọc sai lệch 100%, phá vỡ tính toàn vẹn dữ liệu của 304 DN ĐMST.

2. **Dư âm thuật ngữ "18 Ngành TT17" trên Giao diện và Hướng dẫn**:
   - Tại Form Tạo/Sửa Công nghệ của Seller (`app/portal/seller/technologies/create/page.tsx` và `edit/page.tsx`): Nhãn Stepper Bước 2 vẫn ghi cứng *"Bước 2: Thông số kỹ thuật & 18 Ngành TT17"*.
   - Tại Trang Hướng dẫn sử dụng (`app/huong-dan/page.tsx` và `guide-data.ts`): Hàng loạt mô tả, hình ảnh và gợi ý bước vẫn hiển thị cụm từ *"18 ngành TT17"*, *"Sàn Chào Bán 18 Ngành"*, *"18 ngành kỹ thuật"*.
   - *Hậu quả*: Gây mâu thuẫn nhận thức cho người dùng khi Sàn Chào Bán và Tìm Mua đã chuẩn hóa theo 10 Lĩnh vực TT17 của CSDL PostgreSQL.

3. **Nguy cơ lệch chuẩn bộ lọc ngành tại Danh bạ Chuyên gia KH&CN (`TASK-05`)**:
   - Trang `/experts` đã nạp động qua `getPublicExpertFilterOptions()`, tuy nhiên cần đảm bảo danh sách ngành được lọc trả về đúng 10 Lĩnh vực TT17 từ API `/api/v1/sectors` và `/api/v1/master-data/sectors?activeOnly=true`, loại bỏ hoàn toàn các trường dữ liệu và nhãn cũ tham chiếu "18 ngành".

4. **Số liệu Thống kê Dashboard Doanh nghiệp Admin (`/admin/enterprises/dashboard`)**:
   - Cần đảm bảo endpoint `/api/v1/admin/enterprises/dashboard` và component `EnterpriseAdminDashboardPage` phản ánh đúng 100% số liệu thực tế từ CSDL PostgreSQL: `totalEnterprises`, `verifiedCount`, `byProvince`, `bySector`, `byTni` và xóa bỏ mọi mảng phân bố giả lập hoặc hardcode.

---

## 2. NGUYÊN TẮC BẮT BUỘC & QUY CHUẨN ĐẶC TẢ DELTA

### 2.1. Nguồn Chân Lý Duy Nhất (Taxonomy SSOT)
Hệ thống tuân thủ nghiêm ngặt chuẩn 10 Lĩnh vực TT17 đã được xác lập trong CSDL PostgreSQL (`policy.taxonomy_terms` với `kind = 'SECTOR'`):

| Mã Lĩnh Vực | Tên Lĩnh Vực Chuẩn SSOT | Nhóm C TT17 Ánh Xạ | Ghi Chú Chuẩn Hóa |
| :---: | :--- | :--- | :--- |
| `LV01` | **Nông nghiệp** | Liên ngành | Cấm gán thành Cơ khí |
| `LV05` | **Chế biến thực phẩm – đồ uống** | C.10, C.11 | Cấm gán thành Nông nghiệp |
| `LV07` | **Cơ khí – chế tạo – công nghiệp hỗ trợ** | C.32 | Cấm gán thành Y - Dược |
| `LV08` | **Điện – điện tử – tự động hóa** | C.26, C.27 | Cấm gán thành CNTT |
| `LV11` | **Nước – môi trường – chất thải** | E.38 | Cấm gán thành Vật liệu mới |
| `LV12` | **Xây dựng – vật liệu – hạ tầng** | C.23 | Cấm gán thành Năng lượng tái tạo |
| `LV14` | **Logistics – vận tải – kho bãi** | H.52 | Cấm gán thành Điện tử |
| `LV15` | **Du lịch – khách sạn – nhà hàng** | Dịch vụ | Cấm gán thành Thực phẩm |
| `LV16` | **CNTT – viễn thông – chuyển đổi số** | Công nghệ số | Cấm gán thành Dệt may |
| `LV17` | **Khoa học – công nghệ – đổi mới sáng tạo** | M.72 | Cấm gán thành Logistics |

### 2.2. Quy Định Kỹ Thuật Chi Tiết Cho Từng Phân Hệ

#### A. Phân hệ Danh Bạ Doanh Nghiệp (`TASK-02`) — `EnterprisesDirectoryView.tsx`
1. **Khai tử triệt để mảng tĩnh `SECTORS_TT17`**:
   - Xóa bỏ hoàn toàn định nghĩa `const SECTORS_TT17 = [...]` tại dòng 43 của `EnterprisesDirectoryView.tsx`.
2. **Nạp dữ liệu động từ API Master Data**:
   - Sử dụng hàm `getActiveSectors()` từ `@/lib/master-data-client` để nạp danh sách 10 Lĩnh vực TT17 khi component khởi tạo.
   - Thêm trạng thái nạp dữ liệu: `sectors: SectorOption[]`, `loadingSectors: boolean`, `sectorsError: string | null`.
   - Render dropdown Lĩnh vực công nghệ: Tùy chọn đầu tiên `{ code: "", name: "Tất cả lĩnh vực công nghệ" }`, tiếp theo là danh sách động từ API.
3. **Đảm bảo đồng bộ 2 chiều với URL Search Params**:
   - Tham số `sectorCode` hoặc `sector` trên URL phản ánh chính xác mã `LVxx` chuẩn từ CSDL.

#### B. Biểu Mẫu Tạo / Sửa Công Nghệ (`TASK-04`) & Trang Hướng Dẫn
1. **Chuẩn hóa nhãn Form Stepper**:
   - Tại `SourceCode/frontend/src/app/portal/seller/technologies/create/page.tsx` và `[id]/edit/page.tsx`:
     * Đổi `"Bước 2: Thông số kỹ thuật & 18 Ngành TT17"` thành:  
       👉 **`"Bước 2: Thông số kỹ thuật & Lĩnh vực công nghệ TT17"`**.
     * Đổi các nhãn phụ trợ hoặc aria-label có chứa "18 nhóm ngành" sang "Lĩnh vực công nghệ trọng điểm TT17".
2. **Chuẩn hóa Nội dung Hướng Dẫn (`app/huong-dan/`)**:
   - Sửa toàn bộ các text cứng "18 ngành TT17", "18 ngành kỹ thuật", "Sàn Chào Bán 18 Ngành" thành:  
     👉 **`"10 Lĩnh vực công nghệ trọng điểm TT17"`** hoặc nhãn linh hoạt tương ứng.

#### C. Phân hệ Danh Bạ Chuyên Gia KH&CN (`TASK-05`)
1. **Bảo đảm tính toàn vẹn của Bộ lọc Ngành**:
   - Bộ lọc tại `/experts` sử dụng `getPublicExpertFilterOptions()` nạp từ API `/api/v1/sectors`. Đảm bảo dropdown danh mục hiển thị đầy đủ và chính xác 10 Lĩnh vực TT17.
   - Đảm bảo khi người dùng tích chọn 1 hoặc nhiều Lĩnh vực, mảng `sectorCodes` gửi lên backend `/api/v1/public/experts` chứa đúng các mã `LV01`, `LV05`... tương thích với trường `primary_sector_code` và `expertise_sectors` trong CSDL.

#### D. Bảng Điều Khiển Quản Trị Doanh Nghiệp (`TASK-07` / Admin Dashboard)
1. **Xác thực Số liệu Thời gian Thực từ PostgreSQL**:
   - API `GET /api/v1/admin/enterprises/dashboard` truy vấn trực tiếp từ bảng `enterprise.enterprises`:
     * `totalEnterprises`: Tổng số bản ghi doanh nghiệp trong hệ thống (hiện tại 304 DN).
     * `verifiedCount`: Số doanh nghiệp có `is_verified = true` hoặc `verification_status = 'VERIFIED'`.
     * `byProvince`: Phân bố theo tỉnh thành thực tế từ trường `province_city`.
     * `bySector`: Phân bố theo lĩnh vực công nghệ thực tế từ trường `main_sector_name` / `sector_code`.
     * `byTni`: Phân bố phân hạng TNI từ trường `tni_classification`.
   - Cấm hoàn toàn việc dùng số liệu tĩnh hoặc mock fallback tại frontend.

---

## 3. MA TRẬN TRUY VẾT YÊU CẦU DELTA (TRACEABILITY MATRIX)

| Mã Yêu Cầu | Loại Yêu Cầu | Tên Quy Chuẩn | Mô Tả Nghiệp Vụ & Tiêu Chí Chấp Thuận | Tệp Tác Động Dự Kiến |
| :--- | :--- | :--- | :--- | :--- |
| **`REQ-DELTA-02-01`** | Functional Req | Khai tử mảng `SECTORS_TT17` sai lệch mã | Xóa mảng tĩnh, thay bằng `getActiveSectors()`, hiển thị 10 Lĩnh vực chuẩn TT17. | `EnterprisesDirectoryView.tsx` |
| **`REQ-DELTA-02-02`** | Functional Req | Chuẩn hóa Nhãn Form Seller | Đổi nhãn Bước 2 thành "Thông số kỹ thuật & Lĩnh vực công nghệ TT17". | `seller/technologies/create/page.tsx`, `[id]/edit/page.tsx` |
| **`REQ-DELTA-02-03`** | Functional Req | Chuẩn hóa Hướng Dẫn Hệ Thống | Thay thế toàn bộ "18 Ngành" thành "10 Lĩnh Vực TT17" trong Guide Data. | `app/huong-dan/guide-data.ts`, `page.tsx` |
| **`REQ-DELTA-02-04`** | Functional Req | Đồng bộ Bộ lọc Chuyên gia | Bộ lọc chuyên gia nhận đúng 10 Lĩnh vực TT17 từ Master Data, lọc chính xác theo CSDL. | `app/experts/page.tsx`, `master-data-client.ts` |
| **`REQ-DELTA-02-05`** | Non-Functional | Zero-Mock Dashboard Doanh nghiệp | Toàn bộ 4 metric card và 2 biểu đồ phân bố nạp thời gian thực từ PostgreSQL. | `admin/enterprises/dashboard/page.tsx` |

---

## 4. KẾ HOẠCH BÀN GIAO & PHÂN CÔNG THỰC THI
- **Bước 1 (BA)**: Hoàn tất tài liệu CR Delta (`CR-2026-011`), cập nhật Basic Design và Living Specs (`TASK-02`, `TASK-05`).
- **Bước 2 (SA)**: Soạn thảo `plan.md` Delta, thiết kế hợp đồng DTO và bảo đảm tính tuân thủ Clean Architecture.
- **Bước 3 (Dev)**: Thực thi code chuẩn hóa component, loại bỏ mảng tĩnh, cập nhật unit tests.
- **Bước 4 (QC)**: Thực thi kiểm thử Playwright và đối soát trực tiếp với CSDL PostgreSQL thật.
- **Bước 5 (PO)**: Nghiệm thu xuất xưởng Gate 5 cho Đợt 2.
