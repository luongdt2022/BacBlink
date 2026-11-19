# BIÊN BẢN NGHIỆM THU XUẤT XƯỞNG (QUALITY GATE 5 SIGN-OFF)
## PHÂN HỆ: TASK-04 — HỒ SƠ CHÀO BÁN (SELLER) & BỘ LỌC 18 NGÀNH SHTT
### (Bao gồm Đợt Nâng Cấp Delta CR-2026-006: Thẩm Định Phân Cấp Sở KH&CN & Hậu Kiểm Trung Ương)

- **Mã Epic**: `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`
- **Người Ký Duyệt**: PO/PM Lead (`nacen-po-pm`)
- **Đại Diện Kỹ Thuật Tham Gia**: TechLead SA (`nacen-techlead-sa`) & QC Lead (`nacen-qc`)
- **Thời Gian Ký**: 2026-10-10 19:05:00
- **Trạng Thái Nghiệm Thu**: ✅ **CHÍNH THỨC PHÊ DUYỆT XUẤT XƯỞNG — STATUS: SHIPPED**

---

## 1. MA TRẬN ĐỐI SOÁT DEFINITION OF DONE (DOD CHECKLIST)

| STT | Tiêu Chí Nghiệm Thu | Nội Dung Kiểm Chứng Thực Tế | Người Xác Nhận | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: |
| 1 | **Phạm Vi Nghiệp Vụ (Requirements Coverage)** | • 100% Yêu cầu `REQ-04-001` $\rightarrow$ `REQ-04-007` hoàn tất.<br>• 100% Quy tắc `BR-SELLER-01` $\rightarrow$ `BR-SELLER-06` thực thi đầy đủ.<br>• Khảo sát & đăng tải 4 nhóm thông số Bộ Tứ SHTT (TRL, Patent, Li-xăng, Sẵn sàng thương mại).<br>• Bãi bỏ auto-approve; bắt buộc chọn Sở KH&CN và cam kết pháp lý. | BA Lead (`nacen-ba`) | ✅ **PASS** |
| 2 | **Kiến Trúc & Mã Nguồn (Architecture & Code Quality)** | • Backend .NET 10 Clean Architecture, DTO chuẩn mực, không rò rỉ DbContext.<br>• Frontend Next.js 15: 0 lỗi TypeScript (`tsc --noEmit`), trọn bộ 5 UX states.<br>• 100% tuân thủ Design Token System (0 token `blue-*`, font $\ge$ 12px). | TechLead SA (`nacen-techlead-sa`) | ✅ **PASS** |
| 3 | **Chất Lượng Kiểm Thử (4-Tier Quality Gate)** | • **Tầng 1 (Unit Test)**: `SellerOfferRulesValidatorTests` đạt 18/18 tests Pass (100%).<br>• **Tầng 1 (Invariants)**: `NacenTech.Tests.Invariants` đạt 100/100 tests Pass.<br>• **Tầng 2 (Contract Test)**: Khớp 100% schema DTO v1.<br>• **Tầng 3 (Integration Test)**: Kiểm tra tích hợp tạo mới PENDING và thẩm định APPROVE Pass.<br>• **Tầng 4 (E2E Test)**: Script Playwright Black-box 4 màn hình Pass 100%.<br>• **Lỗi nghiêm trọng (P0/P1)**: 0 lỗi tồn đọng. | QC Lead (`nacen-qc`) | ✅ **PASS** |
| 4 | **Bảo Mật & Phân Quyền (3D Scoped RBAC)** | • Hồ sơ chuyển giao đúng Sở KH&CN theo địa bàn (`ScopeId = "PROVINCE"`).<br>• Cán bộ Sở chỉ được duyệt hồ sơ thuộc địa bàn quản lý.<br>• Chỉ `SUPER_ADMIN`/`OPERATOR_ADMIN` mới có quyền thu hồi hậu kiểm (`REVOKE`). | TechLead SA (`nacen-techlead-sa`) | ✅ **PASS** |
| 5 | **Đồng Bộ Tài Liệu Sống (Living Docs Up-to-Date)** | • Cập nhật Basic Design Wireframe và sơ đồ luồng.<br>• `spec.md`, `plan.md`, `tasks.md` (25/25 tasks `[x]`).<br>• `specs/ROADMAP.md` cập nhật trạng thái `[x] Shipped`.<br>• Lưu trữ quyết định kiến trúc tại `ADR-0014`. | PO/PM (`nacen-po-pm`) | ✅ **PASS** |

---

## 2. BỀ MẶT SẢN PHẨM ĐÃ BÀN GIAO & VẬN HÀNH THỰC TẾ

1. **Màn 1 — Workspace Quản Lý Kho Seller** (`/portal/seller/technologies`):
   - Thống kê KPI chào bán, bảng danh mục công nghệ có huy hiệu trạng thái: `Chờ Sở KH&CN duyệt (PENDING)`, `Đã duyệt (APPROVED)`, `Cần bổ sung (CHANGES_REQUESTED)`.
2. **Màn 2 — Form Wizard Đăng Chào Bán** (`/portal/seller/technologies/create`):
   - Form 4 bước: Thông tin chung $\rightarrow$ Giá bán & Chuyển giao $\rightarrow$ Bộ Tứ SHTT & TRL $\rightarrow$ Cơ quan quản lý nhà nước (Sở KH&CN 63 tỉnh/thành) & Cam kết pháp lý.
3. **Màn 3 — Sàn Chào Bán Công Nghệ & Bộ Lọc 18 Ngành** (`/chao-ban-cong-nghe`):
   - Tab chính trên Web Portal: Bộ lọc 18 nhóm ngành TT17, lọc TRL 1–9, lọc tình trạng SHTT (Đã cấp bằng/Đang nộp đơn), tìm kiếm theo từ khóa.
4. **Màn 4 — Chi Tiết Hồ Sơ Chào Bán** (`/chao-ban-cong-nghe/[id]`):
   - Box nổi bật Bộ Tứ SHTT, bảng thông số kỹ thuật, thông tin liên hệ và cơ quan quản lý thẩm định tại sidebar; modal gửi yêu cầu li-xăng/chuyển giao công nghệ.
5. **Màn 5 — Cổng Tác Nghiệp Cấp 2 Của Lãnh Đạo Sở KH&CN** (`/gov`):
   - Hàng đợi hồ sơ công nghệ chờ thẩm định theo địa bàn tỉnh/thành; chức năng phê duyệt, yêu cầu giải trình hoặc từ chối có biên bản ghi nhận.

---

## 3. QUYẾT ĐỊNH XUẤT XƯỞNG
- **Quyết định của Product Owner**: **CHÍNH THỨC PHÊ DUYỆT NGHIỆM THU VÀ ĐÓNG EPIC TASK-04**.
- **Chuyển trạng thái**: `Status: Shipped` trên toàn hệ thống.
- **Tiến độ dự án tổng thể**: Các phân hệ nền tảng và cốt lõi (`TASK-00`, `TASK-02`, `TASK-03`, `TASK-04`, `TASK-05`, `TASK-07`) đã sẵn sàng. Hệ thống chuyển trọng tâm sang `TASK-06` (Hoàn tất Delta v12 Ma trận) và `TASK-09` (Đánh giá năng lực công nghệ TT17).
