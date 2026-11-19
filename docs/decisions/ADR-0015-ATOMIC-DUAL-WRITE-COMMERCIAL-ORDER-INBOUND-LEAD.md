# ADR-0015: Cơ Chế Giao Dịch Nguyên Tử (Atomic Dual-Write) Khi Đặt Mua Sản Phẩm Thương Mại & Tự Động Sinh Inbound Lead Phía Bên Bán

- **Số ADR**: ADR-0015 (Hệ thống Core API & Sàn Giao Dịch)
- **Trạng thái**: Chấp thuận (Accepted)
- **Ngày quyết định**: 2026-11-02
- **Người đề xuất & Thẩm định**: TechLead SA (`nacen-techlead-sa`) & PO/PM (`nacen-po-pm`)
- **Phân hệ tác động**: `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`, `TASK-03_HO_SO_TIM_MUA_BUYER`, `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`
- **Căn cứ nghiệp vụ**:
  * Quyết định `PO-DEC-20261102-02` tại [`BASIC_DESIGN_NACENTECH.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/BASIC_DESIGN_NACENTECH.md) Mục 19.
  * Walking Skeleton WS-05 (Khép kín Luồng Giao Dịch Cung - Cầu 2 Chiều) Mục 3.2.
  * Delta Ledger `CR-TASK-08-DELTA-01.md`.

---

## 1. Bối Cảnh (Context)

Trên Sàn Giao Dịch Công Nghệ & Sản Phẩm NacenTwin, Bên Mua (`BUYER` hoặc khách hàng vãng lai đã đăng nhập) khi xem chi tiết sản phẩm / công nghệ chào bán tại `/chao-ban-cong-nghe/[id]` có thể nhấn nút **"Đặt Mua Sản Phẩm"** hoặc **"Đăng Ký Chuyển Giao"**.

### Vấn đề cốt lõi (The Problem):
1. **Kiến trúc As-Is bị đứt gãy luồng dữ liệu 2 chiều**:
   - Khi form đặt mua gửi lên endpoint `POST /api/v1/demands/items`, backend chỉ khởi tạo duy nhất 1 bản ghi trong bảng `demand.demand_items` (`DMD-*`).
   - Hệ thống hoàn toàn bỏ qua `OfferId` và không sinh bất kỳ bản ghi cơ hội nào trong bảng `brokerage.connection_requests` (`REQ-*`) gửi tới gian hàng của Bên Bán.
2. **Hậu quả nghiệp vụ nghiêm trọng**:
   - Bên Bán đăng nhập vào Bàn làm việc Quản lý Cơ hội tại `/portal/opportunities/pipeline?tab=inbound` thấy danh sách rỗng (0 inbound lead).
   - Đơn mua của Bên Mua trở thành "đơn hàng mồ côi" (orphan demand), không bao giờ nhận được phản hồi hay tiến triển sang phòng đàm phán hợp đồng 1-1 (Deal Room) và biên bản ghi nhớ MOU.
   - Vi phạm tính toàn vẹn thương mại của sàn giao dịch công nghệ điện tử.

---

## 2. Quyết Định Kiến Trúc (Decision)

Nhằm bảo đảm tính toàn vẹn dữ liệu, chống đứt gãy phễu chuyển đổi, TechLead SA quyết định áp dụng mô hình **Atomic Dual-Write** trong cùng một giao dịch CSDL PostgreSQL nguyên tử:

### 2.1. Nâng cấp API Endpoint `POST /api/v1/demands/items`
1. Mở rộng DTO `CreateQuickDemandItemRequest` bổ sung các trường ngữ cảnh:
   - `Guid? OfferId`: Khóa nhận diện sản phẩm chào bán mục tiêu.
   - `string? OfferTitle`: Tên công nghệ / sản phẩm chào bán.
   - `string? OfferCode`: Mã niêm yết sản phẩm (VD: `SP-2026-001`).
   - `bool? IsCommercialOrder`: Cờ phân biệt đơn mua thương phẩm hay bài toán công nghệ.
2. Phân nhánh xử lý:
   - **Trường hợp A (Đặt mua gắn với Offer - `req.OfferId.HasValue`)**: Kích hoạt cơ chế **Atomic Dual-Write**.
   - **Trường hợp B (Nhu cầu tìm kiếm giải pháp thuần túy - `req.OfferId == null`)**: Kế thừa 100% luồng cũ ghi đơn bảng `demand.demand_items` (Bảo đảm tương thích ngược hoàn hảo).

### 2.2. Cơ chế Thực Thi Giao Dịch Nguyên Tử (Atomic Dual-Write Implementation)
1. **Tra cứu hồ sơ chào bán**:
   - Đọc dữ liệu từ `technology.seller_technology_offers` theo `req.OfferId`.
   - Trích xuất: `EnterpriseId` (làm `seller_organization_id`), `EnterpriseName` (làm `receiver_org_name`), `CreatedBy` (làm `receiver_user_id`), và `Title`.
2. **Kích hoạt Transaction CSDL PostgreSQL**:
   - Sử dụng `await using var transaction = await db.Database.BeginTransactionAsync(ct);`.
3. **Thao tác 1 - Khởi tạo Đơn Mua Bên Mua**:
   - Tạo bản ghi `DemandItem` với mã `DMD-YYYYMMDD-XXXXXX`.
   - Lưu vào bảng `demand.demand_items`.
4. **Thao tác 2 - Khởi tạo Yêu Cầu Kết Nối Inbound Bên Bán**:
   - Khởi tạo bản ghi trong bảng `brokerage.connection_requests`:
     * `id = Guid.NewGuid()`
     * `request_code = $"REQ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}"`
     * `sender_user_id = Actor.PersonId ?? Guid.NewGuid()`
     * `sender_org_name = req.ApplicationScale ?? Actor.OrganizationName ?? "Khách hàng Bên Mua"`
     * `sender_role = "BUYER"`
     * `receiver_org_name = offer.EnterpriseName ?? "Nhà Cung Ứng"`
     * `receiver_user_id = offer.CreatedBy`
     * `demand_id = demandItem.Id` (Mối liên kết khóa ngoại bắt buộc)
     * `target_offer_id = offer.Id`
     * `offer_id = offer.Id`
     * `seller_organization_id = offer.EnterpriseId`
     * `message = req.DesiredSolution ?? $"Đăng ký đặt mua sản phẩm: {offer.Title}"`
     * `proposed_budget_range = req.BudgetRange ?? "Thỏa thuận"`
     * `status = "PENDING"`
     * `sla_deadline = DateTimeOffset.UtcNow.AddHours(48)`
5. **Cam kết giao dịch (Commit)**:
   - `await transaction.CommitAsync(ct);`
   - Cả 2 bản ghi cùng tồn tại đồng thời.
6. **Xử lý sự cố (Rollback)**:
   - Nếu bất kỳ bước nào ném lỗi (CSDL ngoại lệ, lỗi kết nối, offer không tồn tại), gọi `await transaction.RollbackAsync(ct);`.
   - Tuyệt đối không để lại bản ghi mồ côi trong `demand.demand_items`.
7. **Phản hồi Client**:
   - Trả về HTTP 200 kèm `itemId`, `itemCode` (`DMD-*`), `requestCode` (`REQ-*`), `connectionRequestId`.

### 2.3. Hiển thị & Tác Nghiệp Phía Frontend
1. **Phía Bên Mua**: Màn hình Modal đặt mua thành công và Workspace Buyer hiển thị cả `itemCode` và `requestCode`.
2. **Phía Bên Bán**: Bàn làm việc `/portal/opportunities/pipeline?tab=inbound` hiển thị thẻ Inbound Lead với huy hiệu nổi bật `[Đơn Mua Hàng Thương Mại]`, thời hạn SLA 48h, và nút tác nghiệp "Tiếp nhận đơn" (chuyển sang Deal Room) / "Từ chối" (yêu cầu lý do $\ge 10$ ký tự theo `BR-BRK-08`).

---

## 3. Hệ Quả & Đánh Đổi (Consequences & Trade-offs)

### Điểm tích cực (Benefits):
- **Tính nhất quán tuyệt đối (Data Integrity)**: Tiêu chuẩn ACID của PostgreSQL đảm bảo không có bất kỳ trạng thái lệch pha nào giữa Bên Mua và Bên Bán.
- **Trải nghiệm nghiệp vụ liền mạch**: Bên Bán lập tức nhận thông báo và cơ hội kinh doanh mới ngay khi Bên Mua đặt hàng.
- **Tuân thủ pháp lý PDPD**: Thông tin liên hệ cá nhân Bên Mua vẫn được server che mờ (`MaskPhone`, `MaskEmail`) cho tới khi Bên Bán bấm "Tiếp nhận".
- **Không gây Breaking Change**: Giữ nguyên schema hiện có (`brokerage.connection_requests` đã có sẵn các cột cần thiết) và tương thích ngược với API cũ.

### Điểm đánh đổi (Trade-offs) & Biện pháp khắc phục:
- **Khóa giao dịch (Transaction Lock)**: Việc mở Transaction giữ lock ngắn hạn trên 2 bảng trong vài mili-giây.
  * *Khắc phục*: Tối ưu câu lệnh INSERT, không thực hiện các tác vụ nặng (như gửi email, HTTP call bên thứ 3) bên trong transaction block. Chỉ commit dữ liệu DB trước, các tác vụ thông báo được đẩy vào `outbox_messages` / background job.
- **Ràng buộc phụ thuộc bảng chéo Schema**: Phân hệ `Demand` phụ thuộc vào bảng `TechnologyOffer` và bảng `ConnectionRequest`.
  * *Khắc phục*: Tận dụng DbContext chung của hệ thống Modular Monolith NacenTech, đảm bảo Clean Architecture không bị vi phạm bằng cách gói gọn logic trong application/service layer.

---

## 4. Bảng Đối Soát Tuân Thủ (Compliance Checklist)

| Quy tắc / Chuẩn mực | Tiêu chí kỹ thuật | Kết quả thẩm định |
| :--- | :--- | :---: |
| **BR-CONN-SYNC-01** | Atomic Transaction Dual-Write trong 1 khối `IDbContextTransaction` | **ĐẠT** |
| **REQ-CONN-COMM-001** | Đặt mua sản phẩm tự động sinh `ConnectionRequest` có `demand_id` và `target_offer_id` | **ĐẠT** |
| **BR-BRK-07 (PDPD)** | Che mờ SĐT (`09****1234`) và Email (`a***@domain.com`) ở trạng thái `PENDING` | **ĐẠT** |
| **BR-BRK-08** | Bắt buộc nhập lý do từ chối $\ge 10$ ký tự khi REJECT | **ĐẠT** |
| **Tương thích ngược** | Nhu cầu không có `offerId` vẫn hoạt động bình thường | **ĐẠT** |
