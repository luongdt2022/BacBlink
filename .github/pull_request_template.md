### 📌 1. THÔNG TIN CHUNG (OVERVIEW)
- **Task liên quan**: `specs/TASK-[XX]` (hoặc Issue `#...`)
- **Traceability IDs**: `REQ-[XXX]`, `UI-[XXX]`, `BR-[XXX]`
- **Loại thay đổi**:
  - [ ] 🚀 Màn hình / Component mới (New UI/Page)
  - [ ] 🐛 Sửa lỗi hiển thị / Tương tác (Bugfix)
  - [ ] 🎨 Chuẩn hóa Design System / Responsive (UI/UX Refactor)
  - [ ] ⚡ Tối ưu Bundle / Performance (Performance)

---

### 📝 2. TÓM TẮT THAY ĐỔI (SUMMARY)
- *Mô tả ngắn gọn 2-3 câu về màn hình/component và trạng thái tương tác:*
  - ...

---

### 🛡️ 3. DEVELOPER SELF-REVIEW CHECKLIST (Bắt buộc tích đủ trước khi gán Reviewer)

#### A. Kiến trúc UI & 5 Trạng Thái UX
- [ ] Bọc component xử lý đủ 5 trạng thái UX qua `<Async>`: Loading Skeleton, Empty state, Error (kèm nút Thử lại), Success data, Partial (phân trang).
- [ ] Phân tách Dumb Components (chỉ render UI) và Smart Containers/Hooks (quản lý state & gọi API).
- [ ] Chống Double-click: Nút Submit tự động disabled & hiển thị spinner ngay khi bấm.

#### B. Dữ liệu & Tích hợp API (Zero-Mock SSOT)
- [ ] Kết nối API thật qua Hook/SDK (`useMasterData`, apiClient), KHÔNG dùng mock state tĩnh trong RAM.
- [ ] KHÔNG hardcode mảng danh mục tĩnh tại từng file page riêng lẻ.
- [ ] Bắt lỗi Network/API và hiển thị thông báo thân thiện với người dùng (Toast / Alert).

#### C. Responsive & Trải nghiệm Đa thiết bị
- [ ] Đã kiểm tra responsive trên cả Desktop, Tablet và Mobile / Zalo Mini App.
- [ ] Xử lý chống tràn văn bản (`text-overflow: ellipsis`, `break-words`).
- [ ] Đạt chuẩn Accessible cơ bản (alt tag cho ảnh, label cho input).

#### D. Kiểm thử & Đảm bảo chất lượng (Quality & Lint)
- [ ] Đã chạy lint và typecheck không có lỗi: `pnpm run lint` && `npx tsc --noEmit`.
- [ ] Unit Test frontend chạy PASS 100%: `pnpm test`.
- [ ] Không có `console.log` thừa hoặc debug code còn sót lại.

---

### 📸 4. BẰNG CHỨNG KIỂM THỬ GIAO DIỆN (UI EVIDENCE)
*(Bắt buộc đính kèm ảnh chụp màn hình đầy đủ các trạng thái UX)*
- [Ảnh 1: Màn hình Loading Skeleton]
- [Ảnh 2: Màn hình Empty State khi không có dữ liệu]
- [Ảnh 3: Màn hình Error State và nút Thử lại]
- [Ảnh 4: Màn hình Success hiển thị dữ liệu thật trên Desktop & Mobile]

---

### 👥 5. CỔNG DUYỆT BẮT BUỘC (STAGE-GATE APPROVAL)
*Chỉ được phép merge khi cả 2 cổng dưới đây đều được tích xác nhận và Approve:*

- [ ] **Gate 3: TechLead / SA Review** (Xác nhận cấu trúc component, bundle size, clean code, SSOT data hook).
  - *Reviewer (SA)*: `@reviewer_username`
  - *Kết luận*: `[ ] APPROVED` | `[ ] REQUEST CHANGES`
- [ ] **Gate 4: QC Verification** (Xác nhận Playwright E2E, Visual QA, 5 UX states, Responsive test).
  - *Reviewer (QC)*: `@qc_username`
  - *Kết luận*: `[ ] VERIFIED PASS` | `[ ] REJECTED`
