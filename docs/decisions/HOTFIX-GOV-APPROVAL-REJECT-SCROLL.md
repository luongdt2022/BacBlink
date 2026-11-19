# BIÊN BẢN SỰ CỐ & BẢN VÁ KHẨN CẤP (POST-MORTEM REPORT)
## HOTFIX: Sửa Lỗi Thẩm Định Hồ Sơ Không Phản Hồi Khi Từ Chối / Yêu Cầu Bổ Sung

- **Mã Sự Cố**: `HOTFIX-GOV-APPROVAL-REJECT-SCROLL`
- **Mức Độ Ưu Tiên**: P1 (Chức năng Thẩm định hồ sơ công vụ của Lãnh đạo/Chuyên viên Sở KH&CN)
- **Tác Tử Thực Hiện**: Senior Full-Stack Developer (`wf-hotfix`)
- **Ngày Khắc Phục**: 02/11/2026
- **Trạng Thái**: Resolved & Verified (100% Green Test)

---

### 1. Bối Cảnh & Hiện Tượng Lỗi (Incident Context & Symptom)
- **Người dùng**: Cán bộ quản lý Nhà nước / Lãnh đạo Sở KH&CN thực hiện thẩm định hồ sơ công vụ tại đường dẫn `/gov/approvals`.
- **Hiện tượng**:
  - Khi mở modal xem xét hồ sơ (ví dụ: hồ sơ chuyên gia `CG-HN-01A19B`, Đặng Lương Lương), chọn nút **"Từ Chối Hồ Sơ"** hoặc **"Yêu Cầu Bổ Sung"**, sau đó bấm **"Xác Nhận Quyết Định"**, giao diện đứng im không phản hồi, không thể gửi quyết định từ chối hay yêu cầu bổ sung.
  - Ngoài bảng hàng đợi danh sách, nút thao tác ghi cứng nhãn `Phê Duyệt` thay vì `Thẩm Định`, gây khó hiểu cho cán bộ khi muốn mở hồ sơ để từ chối hoặc yêu cầu sửa đổi.

---

### 2. Nguyên Nhân Gốc Rễ (Root Cause)
1. **Lỗi Trải Nghiệm & Khuất Nếp Gấp Cuộn (Out-of-view Folding)**:
   - Thân modal có giới hạn chiều cao `max-h-[90vh]` và cuộn `overflow-y-auto`. Với các hồ sơ có nội dung dài, khối 3 nút quyết định nằm sát mép đáy vùng cuộn.
   - Khi bấm chọn `REJECT` hoặc `REQUEST_CHANGES`, khối `<textarea>` nhập lý do xuất hiện ở dưới 3 nút này và bị đẩy xuống dưới nếp gấp cuộn, không tự động scroll tới hay focus.
2. **Nuốt Lỗi Ngầm Không Có Phản Hồi Trực Quan (Silent Validation Failure)**:
   - Khi bấm nút chân modal "Xác Nhận Quyết Định", hàm `handleReviewSubmit` kiểm tra `reviewNote.trim().length < 10` (theo Quy tắc Nghiệp vụ `BR-ADM-004`), gán `reviewError` rồi `return;`.
   - Vì câu thông báo `reviewError` nằm ngay bên dưới textarea (cũng bị ẩn dưới nếp gấp cuộn), cán bộ không thấy được thông báo lỗi, không có Toast cảnh báo, khiến nút bấm bị hiểu nhầm là bị liệt/đơ.
3. **Nhãn Nút Ngoài Hàng Đợi Chưa Chuẩn Nghiệp Vụ**:
   - Nút hành động chính tại mỗi dòng bảng hàng đợi đang để nhãn `<span>Phê Duyệt</span>`, không phản ánh đúng bản chất nghiệp vụ thẩm định toàn diện (cho phép Phê duyệt, Từ chối, hoặc Yêu cầu bổ sung).

---

### 3. Phẫu Thuật Mã Nguồn Tối Thiểu (Minimal Surgical Fix)
Đã thực hiện can thiệp tối thiểu đúng phạm vi tại `SourceCode/frontend/src/components/gov/gov-approval-queue.tsx`:
1. **Thêm `reviewNoteRef` & Cơ Chế Auto-Scroll Focus**:
   - Khai báo `const reviewNoteRef = useRef<HTMLTextAreaElement>(null);`.
   - Khi người dùng click `REQUEST_CHANGES` hoặc `REJECT`, tự động cuộn mượt (`scrollIntoView({ behavior: 'smooth', block: 'nearest' })`) và đặt con trỏ focus vào ô nhập lý do.
2. **Cảnh Báo Toast & Cuộn Tức Thì Khi Vi Phạm Quy Tắc `BR-ADM-004`**:
   - Trong `handleReviewSubmit`, nếu `trimmedNote.length < 10` khi chọn `REJECT` hoặc `REQUEST_CHANGES`:
     - Gán `reviewError`.
     - Kích hoạt thông báo nổi: `showToast("Vui lòng nhập lý do quyết định có ít nhất 10 ký tự theo Quy tắc BR-ADM-004.", "error")`.
     - Lập tức cuộn tới ô textarea và focus để cán bộ thấy rõ lý do bị chặn.
3. **Chuẩn Hóa Nhãn Nút Ngoài Bảng Danh Sách**:
   - Đổi nhãn `<span>Phê Duyệt</span>` thành `<span>Thẩm Định</span>`, giữ nguyên `data-testid="btn-review-${item.id}"` để đảm bảo tính tương thích ngược cho test suite và e2e.

---

### 4. Bảng Kê Tệp Can Thiệp & Dòng Sửa Đổi
| Tệp Tin | Loại Thay Đổi | Nội Dung Cụ Thể |
| :--- | :---: | :--- |
| `SourceCode/frontend/src/components/gov/gov-approval-queue.tsx` | Sửa mã nguồn | Thêm `useRef`, `focusAndScrollToReviewNote`, error toast & scroll validation trong `handleReviewSubmit`, đổi nhãn `Thẩm Định`. (+23 dòng) |
| `SourceCode/frontend/src/components/gov/gov-approval-queue.test.tsx` | Cập nhật kiểm thử | Mock `scrollIntoView`, cập nhật test nhãn `Thẩm Định`, thêm 2 test cases kiểm chứng Từ Chối / Yêu Cầu Bổ Sung validation & submit. (+133 dòng) |
| `SourceCode/docs/decisions/HOTFIX-GOV-APPROVAL-REJECT-SCROLL.md` | Tài liệu mới | Biên bản sự cố & giải pháp kỹ thuật theo chuẩn wf-hotfix. |

---

### 5. Kết Quả Kiểm Thử (Verification & Zero Regression)
- **Framework**: Vitest v5.0.2
- **Lệnh thực thi**: `cd SourceCode/frontend && pnpm test gov-approval-queue.test.tsx --run`
- **Kết quả**: **7/7 tests PASS (100% Green)**
  + ✓ `renders 5 approval tabs with count badges`
  + ✓ `resolves and displays standardized record codes instead of UUID strings`
  + ✓ `provides preview action with clear preview watermark modal`
  + ✓ `supports sort and popover filters in the table header`
  + ✓ `displays both 'Xem Chi Tiết' and 'Thẩm Định' action buttons and opens full dossier modal`
  + ✓ `reproduces bug: rejects or requests changes without >= 10 chars must show toast error, scroll/focus, and block submission`
  + ✓ `handles 'Yêu Cầu Bổ Sung' with validation and successful submission`
- **TypeScript Static Analysis**: `pnpm exec tsc --noEmit` ➔ **0 lỗi**.
