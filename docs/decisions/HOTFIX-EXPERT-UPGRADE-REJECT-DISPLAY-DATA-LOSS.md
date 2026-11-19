# BIÊN BẢN SỰ CỐ & BẢN VÁ KHẨN CẤP (POST-MORTEM REPORT)
## HOTFIX: Khắc Phục Lỗi Hiển Thị Trạng Thái Từ Chối & Mất Dữ Liệu Hồ Sơ Nâng Hạng Chuyên Gia

- **Mã Sự Cố**: `HOTFIX-EXPERT-UPGRADE-REJECT-DISPLAY-DATA-LOSS`
- **Mức Độ Ưu Tiên**: P1 (Trải nghiệm người dùng & tính toàn vẹn dữ liệu nộp hồ sơ Chuyên gia KH&CN)
- **Tác Tử Thực Hiện**: Senior Full-Stack Developer (`wf-hotfix` - Surgical Fix & Zero Regression)
- **Ngày Khắc Phục**: 02/11/2026
- **Trạng Thái**: Resolved & Verified (100% Green Test)

---

### 1. Bối Cảnh & Hiện Tượng Lỗi (Incident Context & Symptom)
- **Bối cảnh**: Người dùng nộp hồ sơ nâng cấp Chuyên gia KH&CN (ví dụ: tài khoản `public1@gmail.com`). Khi Hội đồng Thẩm định ra quyết định Từ chối (`status = "REJECTED"` kèm lý do `reviewerNote`).
- **Hiện tượng lỗi**:
  1. Tại trang `/profile/upgrade`, badge vẫn hiển thị là *"Đang Chờ Hội Đồng Thẩm Định (SLA <= 48h)"* do thiếu nhánh xử lý trạng thái `REJECTED`, đồng thời hoàn toàn không hiển thị lý do từ chối của Hội đồng.
  2. Khi bấm *"Xem chi tiết hồ sơ"* hoặc *"Chỉnh sửa & Cập nhật đơn"*, giao diện điều hướng sang wizard trắng trơn, mất sạch toàn bộ dữ liệu (Học hàm/học vị, cơ quan, địa chỉ, chức danh, tóm tắt, công bố khoa học...) mà người dùng đã submit trước đó.

---

### 2. Nguyên Nhân Gốc Rễ (Root Cause Analysis)
1. **Frontend `upgrade/page.tsx`**:
   - Dòng 280-296: Câu lệnh điều kiện hiển thị trạng thái thiếu nhánh `expertApp.status === "REJECTED"`, dẫn đến việc rơi vào nhánh `else` (mặc định hiển thị badge amber "Đang chờ Hội đồng thẩm định").
   - Thiếu khối component hiển thị ý kiến/lý do từ chối từ `expertApp.reviewerNote` (hoặc `reviewNote`).
2. **Frontend `upgrade/expert/page.tsx`**:
   - Lệch chuẩn đặt tên trường DTO giữa Backend trả về và Frontend đọc:
     + Backend gửi `degree` (giá trị enum `DOCTOR`, `MASTER`, `ENGINEER_BACHELOR`) -> FE đọc `data.academicDegree` (undefined).
     + Backend gửi `organizationName` -> FE đọc `data.primaryInstitution` (undefined).
     + Backend gửi `organizationAddress` -> FE đọc `data.workAddress` (undefined).
     + Backend gửi `researchTitle` -> FE đọc `data.professionalTitle` (undefined).
     + Backend gửi `expertiseSectors` (mảng mã lĩnh vực) -> FE đọc `data.primaryDomain` (undefined).
     + Backend gửi `consultingSummary` -> FE đọc `data.bioSummary` (undefined).
   - Khi `data.status === "REJECTED"` và không có query param `?edit=true`, code cũ gán `setUxState("empty")` khiến giao diện hiển thị form wizard rỗng thay vì màn hình chi tiết hồ sơ bị từ chối kèm lý do.
3. **Backend `brokerage/Application/ExpertService.cs`**:
   - Entity `ExpertProfile` và DTO `ExpertProfileDto` chưa gán và map đầy đủ trường `Phone` và `Email` trong `ToDto()`.

---

### 3. Phẫu Thuật Mã Nguồn Tối Thiểu (Minimal Surgical Fix)

#### A. Frontend `SourceCode/frontend/src/app/profile/upgrade/page.tsx`:
- Bổ sung badge đỏ cho trạng thái `REJECTED`: `Hồ Sơ Đã Bị Từ Chối (REJECTED)`.
- Bổ sung khung thông báo nổi bật chứa lý do từ chối từ Hội đồng (`expertApp.reviewerNote || expertApp.reviewNote`).
- Điều chỉnh nút hành động theo ngữ cảnh: Nút *"Chỉnh sửa & Nộp lại"* khi hồ sơ bị từ chối; cập nhật nhãn trạng thái thẻ Chuyên gia thành *"Bị từ chối"*.

#### B. Frontend `SourceCode/frontend/src/app/profile/upgrade/expert/page.tsx`:
- Chuẩn hóa cơ chế ánh xạ DTO 2 chiều linh hoạt:
  + `degree` (`DOCTOR` -> `TS`, `MASTER` -> `ThS`, `ENGINEER_BACHELOR` -> `KySu`) || `academicDegree`.
  + `organizationName` || `primaryInstitution`.
  + `organizationAddress` || `workAddress`.
  + `researchTitle` || `professionalTitle`.
  + `expertiseSectors[0]` || `primaryDomain`.
  + `consultingSummary` || `bioSummary`.
- Xử lý trạng thái `data.status === "REJECTED"`:
  + Nếu không có `?edit=true`: Chuyển sang `setUxState("success")` với component chuyên biệt hiển thị toàn bộ chi tiết hồ sơ đã nộp, banner lý do từ chối nổi bật và nút *"Chỉnh sửa & Nộp lại hồ sơ"*.
  + Nếu có `?edit=true` hoặc khi người dùng bấm *"Chỉnh sửa & Nộp lại hồ sơ"*: Form wizard mở ra ở trạng thái `empty` với toàn bộ trường dữ liệu cũ được giữ nguyên 100% (Zero Data Loss).

#### C. Backend `brokerage`:
- `Contracts.cs`: Bổ sung `Phone` và `Email` vào `SubmitExpertUpgradeRequest` và `ExpertProfileDto` với giá trị mặc định `null`.
- `ExpertProfile.cs`: Bổ sung phương thức `SetContactInfo(string? phone, string? email)`.
- `ExpertService.cs`: Gọi `SetContactInfo` khi tiếp nhận request và gán `Phone`, `Email` trong `ToDto()`.

---

### 4. Bảng Kê Tệp Can Thiệp & Dòng Sửa Đổi
| Tệp Tin | Loại Thay Đổi | Nội Dung Sửa Đổi |
| :--- | :---: | :--- |
| `SourceCode/frontend/src/app/profile/upgrade/page.tsx` | Sửa mã nguồn | Thêm badge `REJECTED`, banner lý do từ chối `reviewerNote`, nút "Chỉnh sửa & Nộp lại". (+30 dòng) |
| `SourceCode/frontend/src/app/profile/upgrade/page.test.tsx` | Test tự động | Thêm test case xác thực hiển thị badge REJECTED, lý do từ chối và nút nộp lại. (+38 dòng) |
| `SourceCode/frontend/src/app/profile/upgrade/expert/page.tsx` | Sửa mã nguồn | Map 2 chiều toàn bộ trường DTO, hiển thị chi tiết từ chối và prefill form khi edit. (+98 dòng) |
| `SourceCode/frontend/src/app/profile/upgrade/expert/page.test.tsx` | Test tự động | Thêm test case xác thực REJECTED view và zero data loss khi bấm nộp lại. (+59 dòng) |
| `SourceCode/backend/modules/brokerage/Application/Contracts.cs` | Sửa mã nguồn | Thêm `Phone`, `Email` vào `SubmitExpertUpgradeRequest` và `ExpertProfileDto`. (+6 dòng) |
| `SourceCode/backend/modules/brokerage/Domain/ExpertProfile.cs` | Sửa mã nguồn | Bổ sung phương thức `SetContactInfo(phone, email)`. (+7 dòng) |
| `SourceCode/backend/modules/brokerage/Application/ExpertService.cs` | Sửa mã nguồn | Gán contact info trong `SubmitUpgradeAsync` và map trong `ToDto`. (+7 dòng) |
| `SourceCode/docs/decisions/HOTFIX-EXPERT-UPGRADE-REJECT-DISPLAY-DATA-LOSS.md` | Tài liệu mới | Biên bản sự cố và giải pháp kỹ thuật theo chuẩn `wf-hotfix`. |

---

### 5. Kết Quả Kiểm Thử (Verification & Zero Regression)
- **Frontend Unit Tests (Vitest v5.0.2)**:
  + `src/app/profile/upgrade/page.test.tsx`: **6/6 tests PASSED (100% Green)**
  + `src/app/profile/upgrade/expert/page.test.tsx`: **11/11 tests PASSED (100% Green)**
  + **Tổng cộng Frontend**: **17/17 tests PASS**
- **Backend Tests (.NET 10 / net10.0)**:
  + `tests/invariants`: **184/184 tests PASSED**
  + `tests/architecture`: **7/7 tests PASSED**
  + **Tổng cộng Backend**: **191/191 tests PASS**
- **Đánh giá hồi quy**: **0 regression bugs**. Toàn bộ hệ thống test suite pass 100%.
