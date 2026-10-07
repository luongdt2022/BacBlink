# Product Backlog & Change Requests (NacenTech)

> **Mục đích**: Lưu trữ và quản lý các yêu cầu thay đổi (Change Requests - CR), nợ kỹ thuật (Technical Debt) và các tính năng chờ xử lý (Backlog Items) theo thứ tự ưu tiên của Product Owner.  
> **Chủ quản**: Product Owner kiêm Project Manager (PO/PM - `tc-po`).  
> **Quy tắc**: Tuân thủ triết lý Cagan/Patton, chỉ đưa vào Sprint/Autopilot sau khi đã phân loại P1/P2/P3 và đánh giá Cross-Surface Impact.

---

## 1. DANH SÁCH HẠNG MỤC CHỜ XỬ LÝ (PRIORITIZED BACKLOG)

| ID | Hạng Mục / Yêu Cầu | Epic Liên Quan | Phân Loại | Nguồn Gốc | Trạng Thái | Trọng Tâm Xử Lý |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **CR-001** | **Đồng bộ 10 Lĩnh Vực Chuẩn `LV` có thực trong Excel & Tái cấu trúc CSDL** | `TASK-06` | **P1 (Blocker)** | Chỉ đạo User (2026-10-05) & Báo cáo BA | ✅ **Đã hoàn tất** | Đã thay thế toàn bộ mã `SEC-*` tự chế bằng đúng 10 mã `LV` xác thực trong Excel (`LV01, LV05, LV07, LV08, LV11, LV12, LV14, LV15, LV16, LV17`); loại bỏ 8 mã khuyết; thêm cột `code`, `metadata` vào `policy.taxonomy_terms`; chuẩn hóa Scoped RBAC và giao diện Admin. Đạt Gate 5 nghiệm thu. |
| **CR-002** | **Bổ sung 8 Lĩnh vực khuyết khi đối tác cung cấp dữ liệu gốc** | `TASK-06` | **P3 (Pending)** | File Excel ghi chú dòng 131 | ⚪ **Chờ dữ liệu gốc** | `LV02, LV03, LV04, LV06, LV09, LV10, LV13, LV18` tạm hoãn, chờ đối tác bổ sung tên và ma trận công nghệ. |
| **CR-003** | **Tích hợp Ma trận LV-CN vào Recommendation Engine** | `TASK-04`, `TASK-08` | **P2 (High)** | Roadmap Giai đoạn 3 | ⚪ **Chờ TASK-06** | Kết nối bảng quan hệ trọng số 1-5 sao của các cặp LV-CN vào bộ lọc gợi ý cung cầu. |
| **CR-004** | **Quản lý Hợp đồng Tư vấn & Đơn đặt hàng Chuyên gia (Post-MVP)** | `TASK-05` | **P3 (Medium)** | SRS Delta v7 TASK-05 | ⚪ **Post-MVP** | Quy trình ký kết hợp đồng tư vấn, biên bản nghiệm thu giờ công chuyên gia KH&CN. |
| **CR-2026-005** | **Hội tụ danh bạ chuyên gia theo Master Data và tinh gọn UX** | `TASK-05` | **P1 (Core Search)** | PO xác nhận scope 07/10/2026 | 🔄 **Đang hội tụ** | Đếm SECTOR active thực tế; lọc địa bàn theo scope; compact UI; giữ query compatibility; chờ Gate 4/5. |

---

## 2. CHI TIẾT CR-001: ĐỒNG BỘ 10 LĨNH VỰC CHUẨN `LV`

- **Tác nhân yêu cầu**: User chỉ đạo trực tiếp ("file excel không có đủ LV từ 0-18, tạm thời phần nào không có thì bỏ đi, sửa lại plan chỉ những ngành đã có trong file").
- **Danh sách 10 Lĩnh vực chuẩn xác thực (`[VERIFIED]`)**:
  1. `LV01`: Nông nghiệp
  2. `LV05`: Chế biến thực phẩm – đồ uống
  3. `LV07`: Cơ khí – chế tạo – công nghiệp hỗ trợ
  4. `LV08`: Điện – điện tử – tự động hóa
  5. `LV11`: Nước – môi trường – chất thải
  6. `LV12`: Xây dựng – vật liệu – hạ tầng
  7. `LV14`: Logistics – vận tải – kho bãi
  8. `LV15`: Du lịch – khách sạn – nhà hàng
  9. `LV16`: CNTT – viễn thông – chuyển đổi số
  10. `LV17`: Khoa học – công nghệ – đổi mới sáng tạo
- **Phạm vi tác động (Cross-Surface Impact)**:
  1. **Spec**: `spec.md` của `TASK-06` chuẩn hóa `BR-SEC-002` theo 10 mã `LV`.
  2. **DB & Migration**: Thêm migration `AddCodeAndMetadataToTaxonomyTerms`, seed đúng 10 bản ghi `LV`.
  3. **Backend API**: Bỏ `StaticSectors` hardcode, đọc động từ CSDL `policy.taxonomy_terms`.
  4. **Scoped RBAC**: Cập nhật các scope mẫu sang `LV01, LV05, LV07...`.
  5. **Frontend UI**: Sửa `/admin/sectors` (chỉ hiển thị 10 ngành chuẩn) và `/admin/roles`.
  6. **Invariant Tests**: Cập nhật bài test kiểm tra đúng 10 mã `LV` (100% Green).
