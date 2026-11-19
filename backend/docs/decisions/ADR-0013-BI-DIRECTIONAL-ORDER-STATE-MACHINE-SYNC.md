# ADR-0013: Máy Trạng Thái Đồng Bộ 2 Chiều Trạng Thái Đơn Hàng Thương Mại & Vòng Đời Deal Room

- **Số ADR**: ADR-0013 (Hệ thống Core API & Sàn Giao Dịch NacenTech)
- **Trạng thái**: Chấp thuận (Accepted)
- **Ngày quyết định**: 2026-11-02
- **Người đề xuất & Thẩm định**: Software Architect kiêm TechLead SA (`nacen-techlead-sa`)
- **Phê duyệt DoR Gate 2**: Product Owner kiêm Project Manager (`nacen-po-pm`)
- **Phân hệ tác động**: `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`, `TASK-03_HO_SO_TIM_MUA_BUYER`, `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`
- **Căn cứ nghiệp vụ & Thiết kế cơ sở**:
  * Quyết định `PO-DEC-20261102-03` tại [`Specification/BASIC_DESIGN_NACENTECH.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/BASIC_DESIGN_NACENTECH.md) Mục 19.4 & Mục 3.2.1.
  * Walking Skeleton WS-05 (Khép kín Luồng Giao Dịch Cung - Cầu 2 Chiều) Mục 3.2.
  * Delta Ledger `CR-TASK-08-DELTA-02.md`.
  * Tiền đề: [`ADR-0012: Atomic Dual-Write`](./ADR-0012-ATOMIC-DUAL-WRITE-COMMERCIAL-ORDER-INBOUND-LEAD.md).

---

## 1. Bối Cảnh (Context)

Sau khi áp dụng cơ chế Atomic Dual-Write (theo ADR-0012 / CR-TASK-08-DELTA-01), khi Bên Mua đặt mua sản phẩm thương mại tại `/chao-ban-cong-nghe/[id]`, hệ thống đã khởi tạo thành công đồng thời cả đơn mua (`demand.demand_items`) và yêu cầu kết nối (`brokerage.connection_requests`).

### Vấn Đề Cốt Lõi (The Core Problem):
1. **Sự đứt gãy chiều phản hồi ngược (Missing Reverse Sync)**:
   - Khi Bên Bán tiếp nhận yêu cầu (`PUT /api/v1/brokerage/requests/{id}/respond`, `action = 'ACCEPT'`), hệ thống cập nhật `brokerage.connection_requests.status = 'ACCEPTED'` và mở thương vụ `brokerage.opportunities` (`stage = 'INITIATED'`).
   - Tuy nhiên, backend **hoàn toàn không có cơ chế cập nhật đồng bộ ngược** sang bản ghi đơn hàng gốc `demand.demand_items.status` của Bên Mua.
2. **Khi chuyển giai đoạn Deal Room & Ký MOU**:
   - Khi hai bên trao đổi trong Deal Room (`stage = 'NEGOTIATING'`) hoặc hoàn tất ký MOU (`stage = 'MOU_SIGNED'` / `'COMPLETED'`), hệ thống chỉ cập nhật bảng `brokerage.opportunities`, bỏ quên hoàn toàn bảng `demand.demand_items`.
3. **Hậu quả trải nghiệm người dùng (UX Breakdown)**:
   - Trên Bàn làm việc Bên Mua (`/portal/buyer/demands?tab=commercial`), đơn hàng mãi mãi bị "đóng băng" ở trạng thái `SUBMITTED` / `PENDING`.
   - Thanh tiến trình 4 bước (`OrderTrackingStepper`) đứng yên ở Bước 1 ("Chờ tiếp nhận"), không bao giờ chuyển sang Bước 2 ("Đang xử lý & Báo giá"), không tích xanh [✓] Bước 1, và không xuất hiện nút CTA dẫn vào Deal Room.
   - Bên Mua lầm tưởng đơn hàng của mình bị bỏ quên, dẫn đến sự đứt gãy nghiêm trọng trong hành trình người dùng.

---

## 2. Quyết Định Kiến Trúc (Decision)

TechLead SA quyết định thiết lập **Máy Trạng Thái Đồng Bộ 2 Chiều (Bi-directional State Machine)** được bảo vệ bằng giao dịch CSDL nguyên tử PostgreSQL ACID.

### 2.1. Ma Trận Chuyển Đổi Trạng Thái Chuẩn (State Transition Matrix)

| Bước Stepper Bên Mua | Trạng Thái Đích (`demand_items.status`) | Sự Kiện Kích Hoạt (Trigger Event) Phía Bên Bán | Trạng Thái (`connection_requests.status`) | Giai Đoạn (`opportunities.stage`) |
| :---: | :--- | :--- | :---: | :---: |
| **Bước 1** | `SUBMITTED` / `PENDING` | Bên Mua đặt mua thành công | `PENDING` | *Chưa khởi tạo* |
| **Bước 2** | `PROCESSING` | Bên Bán bấm "Tiếp nhận đơn" (`action = 'ACCEPT'`) | `ACCEPTED` | `INITIATED` |
| **Bước 3** | `NEGOTIATING` | Cập nhật giai đoạn cơ hội sang thương thảo | `ACCEPTED` | `NEGOTIATING` |
| **Bước 4** | `COMPLETED` | Ký MOU (`MOU_SIGNED`) hoặc Nghiệm thu | `ACCEPTED` | `MOU_SIGNED` hoặc `COMPLETED` |
| **Ngoại lệ** | `REJECTED` | Bên Bán bấm "Từ chối" (`action = 'REJECT'`) | `REJECTED` | *Không sinh* |
| **Ngoại lệ** | `CANCELLED` | Bên Mua bấm "Hủy đơn" (chỉ khi ở Bước 1) | `CANCELLED` | *Không sinh* |

### 2.2. Cơ Chế Bảo Đảm Giao Dịch Nguyên Tử (ACID Transaction Guarantees)

1. **Khối Transaction Bắt Buộc**:
   - Mọi thao tác cập nhật trạng thái trên 2 endpoints:
     * `PUT /api/v1/brokerage/requests/{id}/respond`
     * `PUT /api/v1/brokerage/opportunities/{id}/stage`
   - BẮT BUỘC phải thực thi trong một `DbTransaction` (PostgreSQL Transaction level `READ COMMITTED`).
2. **Thao tác Đồng bộ trong `RespondConnectionRequest`**:
   ```sql
   -- 1. Cập nhật bảng kết nối
   UPDATE brokerage.connection_requests
   SET status = @status, response_note = @note, rejection_reason = @rejectionReason, responded_at = now()
   WHERE id = @id
   RETURNING id, request_code, sender_org_name, receiver_org_name, demand_id, offer_id, status;

   -- 2. Đồng bộ sang bảng đơn hàng Bên Mua
   -- Nếu action == 'ACCEPT' và demand_id IS NOT NULL:
   UPDATE demand.demand_items
   SET status = 'PROCESSING', updated_at = now()
   WHERE id = @demandId;

   -- Nếu action == 'REJECT' và demand_id IS NOT NULL:
   UPDATE demand.demand_items
   SET status = 'REJECTED', updated_at = now()
   WHERE id = @demandId;

   -- 3. Khởi tạo Opportunity (khi ACCEPT)
   INSERT INTO brokerage.opportunities (...) VALUES (...);
   ```
3. **Thao tác Đồng bộ trong `UpdateOpportunityStage`**:
   ```sql
   -- 1. Cập nhật cơ hội
   UPDATE brokerage.opportunities
   SET stage = @stage, updated_at = now()
   WHERE id = @id
   RETURNING id, opportunity_code, connection_request_id, stage;

   -- 2. Tra cứu connection_requests lấy demand_id và đồng bộ:
   -- Nếu stage == 'NEGOTIATING':
   UPDATE demand.demand_items SET status = 'NEGOTIATING', updated_at = now() WHERE id = @demandId;
   -- Nếu stage IN ('MOU_SIGNED', 'COMPLETED'):
   UPDATE demand.demand_items SET status = 'COMPLETED', updated_at = now() WHERE id = @demandId;
   ```

### 2.3. Cơ Chế Phục Hồi & Rollback (Safe Rollback)
- Nếu bất kỳ câu lệnh SQL cập nhật trạng thái nào gặp sự cố (Foreign Key không hợp lệ, Database Timeout, Deadlock, Connection Drop):
  * Lập tức gọi `await tx.RollbackAsync(ct);`.
  * Trả về HTTP 500 kèm mã lỗi nghiệp vụ chuẩn `ERR_STATE_SYNC_FAILED`.
  * Tuyệt đối không cho phép kịch bản "Bên Bán đã ACCEPT mà Bên Mua vẫn SUBMITTED" hoặc ngược lại.

### 2.4. Khóa Nghiệp Vụ Chống Xung Đột (Concurrency & State Guards)
1. **Cancellation Guard**: Bên Mua chỉ được phép hủy đơn khi `demand_items.status in ('SUBMITTED', 'PENDING')`. Khi đã ở `PROCESSING`, nút "Hủy đơn" trên UI bị ẩn hoàn toàn, API từ chối nếu có yêu cầu hủy.
2. **Idempotency Guard**: Nếu Bên Bán gửi lại request `ACCEPT` cho một yêu cầu đã được chấp thuận, API trả về trạng thái hiện tại một cách an toàn mà không sinh trùng cơ hội hay ghi đè sai lệch dữ liệu.

---

## 3. Hệ Quả (Consequences)

### 3.1. Điểm Tích Cực (Positive Consequences)
- **Trải nghiệm người dùng thông suốt 100%**: Bên Mua thấy rõ tiến độ từng bước theo thời gian thực. Bước 1 tích xanh [✓], Bước 2 sáng đèn, xuất hiện nút CTA *"Vào Deal Room Thảo Luận &rarr;"*.
- **Toàn vẹn dữ liệu tuyệt đối (Zero Split-Brain)**: Không bao giờ xảy ra tình trạng lệch pha dữ liệu giữa phân hệ Brokerage và phân hệ Demand.
- **Tuân thủ Clean Architecture**: Hai aggregate `ConnectionRequest` và `DemandItem` giao tiếp qua hợp đồng giao dịch có kiểm soát, duy trì tính độc lập schema nhưng liên kết nguyên tử ở tầng Data Persistence.

### 3.2. Đánh Đổi & Điểm Cần Lưu Ý (Trade-offs & Considerations)
- **Tải CSDL khi Transaction dài hơn**: Việc bọc cả 3 câu lệnh trong 1 transaction làm thời gian giữ lock tăng nhẹ (~2-5ms trên PostgreSQL), nhưng hoàn toàn chấp nhận được so với lợi ích toàn vẹn dữ liệu.
- **Truy vấn liên Schema**: Query từ `brokerage.opportunities` $\rightarrow$ `brokerage.connection_requests` $\rightarrow$ `demand.demand_items` yêu cầu các chỉ mục tối ưu trên `connection_request_id` và `demand_id`. Cả hai trường này đã có Foreign Key / Index sẵn có.

---

## 4. Kế Hoạch Triển Khai & Kiểm Chứng (Verification)

1. **Backend Integration Test**:
   - Viết test case `OrderStateMachineSyncTests.cs` kiểm chứng:
     * Gọi `respond` với `action: "ACCEPT"` $\rightarrow$ CSDL bảng `demand.demand_items` đổi sang `PROCESSING`.
     * Giả lập lỗi DB $\rightarrow$ Rollback xảy ra, không có bản ghi nào bị cập nhật lệch.
2. **Frontend Component Test**:
   - `OrderTrackingStepper.test.tsx`: Render với prop `status="PROCESSING"` $\rightarrow$ Bước 1 có icon `CheckCircle2` [✓], Bước 2 sáng đèn.
3. **E2E Test**:
   - Luồng Playwright toàn trình: Đặt mua sản phẩm $\rightarrow$ Bên Bán chấp thuận $\rightarrow$ Bên Mua mở chi tiết thấy Bước 2 và bấm nút CTA vào Deal Room.
