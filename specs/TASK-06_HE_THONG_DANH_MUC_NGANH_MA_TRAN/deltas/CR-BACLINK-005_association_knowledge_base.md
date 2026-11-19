# Change Request: CR-BACLINK-005 Association Policy Knowledge Base

**CR-ID**: CR-BACLINK-005
**Epic**: TASK-06_HE_THONG_DANH_MUC_NGANH_MA_TRAN (Temporary Home)
**Status**: APPROVED
**Target Version**: 1.5.0
**Author**: `tc-ba-2`

---

## 1. Bối Cảnh (Context)
Hiện tại, hệ thống chưa có phân hệ chuyên trách để lưu trữ, quản lý và tra cứu các chính sách, quy chế và tri thức hiệp hội BACLINK (Yêu cầu Mục 5, 6 của 260717_Góp ý website Baclink.docx).

## 2. Yêu Cầu (Requirements)
- **Cấu trúc lưu trữ**: Hỗ trợ phân loại tri thức theo (1) Chính sách pháp lý (Hiệp hội, Nhà nước), (2) Báo cáo ngành & Dữ liệu công nghiệp, (3) Cẩm nang & Biểu mẫu, (4) Case study.
- **Quản lý nội dung (CMS)**: Hỗ trợ tạo, sửa, duyệt nội dung và phân quyền đọc (Công khai / Hội viên).
- **Tìm kiếm**: Tìm kiếm thông minh theo từ khóa, lĩnh vực (8 ngành `IND_*`) và địa bàn/KCN.

## 3. Tác Động (Impact)
- Cần mở rộng bảng dữ liệu `knowledge.documents` và API `GET /api/v1/knowledge/*`.
