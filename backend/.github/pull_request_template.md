### 📌 1. THÔNG TIN CHUNG (OVERVIEW)
- **Task liên quan**: `specs/TASK-[XX]` (hoặc Issue `#...`)
- **Traceability IDs**: `REQ-[XXX]`, `BR-[XXX]`, `DB-[XXX]`, `API-[XXX]`
- **Loại thay đổi**:
  - [ ] 🚀 Tính năng mới (New Feature)
  - [ ] 🐛 Sửa lỗi (Bugfix)
  - [ ] 🔨 Cải tiến cấu trúc / Tối ưu hóa (Refactor / Optimization)
  - [ ] 🗄️ Cập nhật CSDL / Migration (DB Schema)
  - [ ] 🛡️ An ninh / Phân quyền (Security / RBAC)

---

### 📝 2. TÓM TẮT THAY ĐỔI (SUMMARY)
- *Mô tả ngắn gọn 2-3 câu về bối cảnh, giải pháp kỹ thuật backend và các điểm lưu ý:*
  - ...

---

### 🛡️ 3. DEVELOPER SELF-REVIEW CHECKLIST (Bắt buộc tích đủ trước khi gán Reviewer)

#### A. Kiến trúc & Clean Architecture (.NET Core)
- [ ] Controller / Minimal API chỉ nhận `IMediator` hoặc `ISender`, **TUYỆT ĐỐI KHÔNG** inject trực tiếp `DbContext`.
- [ ] Tầng `Domain` độc lập 100%, không tham chiếu thư viện ngoài hoặc tầng Infrastructure.
- [ ] Truy vấn (Queries) dùng `.AsNoTracking()` và trả về DTO; Lệnh ghi (Commands) gọi qua Entity/Aggregate Root methods.
- [ ] 100% các cuộc gọi I/O, Database, Http Client đều sử dụng `async/await` kèm `CancellationToken`.

#### B. CSDL, Schema & EF Core (Nếu có chỉnh sửa DB)
- [ ] Migration phi phá hủy (Non-destructive): Không xóa/đổi tên cột trực tiếp, cột mới thêm có Default hoặc Nullable.
- [ ] Đã kiểm tra chặn đứng N+1 Query (dùng `.Include()`, `.ThenInclude()` hoặc `.Select()` projection).
- [ ] Đã đánh Index cho các khóa ngoại và trường lọc/tìm kiếm thường xuyên (`TenantId`, `Status`, `CreatedAt`).
- [ ] Bảng trạng thái quan trọng có Concurrency Token (Optimistic Locking) chống Race Condition.

#### C. An ninh & 3D Scoped RBAC
- [ ] Mọi endpoint mới (trừ public) đều gắn Policy phân quyền theo `Role` + `Scope` + `Action`.
- [ ] Chống IDOR: Mọi query/update dữ liệu sở hữu bắt buộc kèm điều kiện `TenantId` / `UserId`.
- [ ] File Upload: Kiểm tra Magic Bytes thực tế, giới hạn kích thước tối đa, lưu trữ an toàn.

#### D. Kiểm thử & Đảm bảo chất lượng (Quality & Tests)
- [ ] Đã viết Unit Test bao phủ 100% các quy tắc trong `BR-[MODULE]-[STT]`.
- [ ] Không có assertion vô hiệu (`Assert.NotNull` hình thức), test assert giá trị thực tế.
- [ ] Đã build thử Release không phát sinh lỗi hoặc warning mới: `dotnet build -c Release`.
- [ ] 100% Unit Test & Invariant Test chạy PASS cục bộ: `dotnet test`.

---

### 📸 4. BẰNG CHỨNG KIỂM THỬ (TEST EVIDENCE)
*(Bắt buộc đính kèm log chạy test PASS, hoặc response API Swagger/Postman)*
- **Kết quả Test**:
  - `dotnet test`: [Ảnh chụp / log terminal pass 100%]
- **API Response**:
  - [Ảnh chụp Swagger / Postman response]

---

### 👥 5. CỔNG DUYỆT BẮT BUỘC (STAGE-GATE APPROVAL)
*Chỉ được phép merge khi cả 2 cổng dưới đây đều được tích xác nhận và Approve:*

- [ ] **Gate 3: TechLead / SA Review** (Xác nhận tính toàn vẹn Clean Architecture, Schema CSDL, An ninh RBAC, N+1 Query).
  - *Reviewer (SA)*: `@reviewer_username`
  - *Kết luận*: `[ ] APPROVED` | `[ ] REQUEST CHANGES`
- [ ] **Gate 4: QC Verification** (Xác nhận kiểm thử tích hợp, kiểm thử góc khuất Edge-case và API Contract).
  - *Reviewer (QC)*: `@qc_username`
  - *Kết luận*: `[ ] VERIFIED PASS` | `[ ] REJECTED`
