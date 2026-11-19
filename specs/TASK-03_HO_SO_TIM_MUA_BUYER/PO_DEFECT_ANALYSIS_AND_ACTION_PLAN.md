# BÁO CÁO PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ & CHỈ ĐẠO KHẮC PHỤC LỖI (PO DEFECT TRIAGE & ACTION PLAN)
> **Phân hệ thẩm định:** `TASK-03` (Hồ sơ Tìm mua / Bài toán Nhu cầu) & `TASK-08` (Kết nối Cung–Cầu & Deal Room)  
> **Căn cứ tiếp nhận:** Báo cáo kiểm thử 82 Test Cases từ Trưởng ban QC (`QC_FULL_82_TEST_REPORT.md` & `.json`)  
> **Người ban hành:** Product Owner kiêm Project Manager Tối cao (`nacen-po-pm`)  
> **Ngày ban hành:** 22/10/2026 | **Tình trạng:** **BÁC BỎ XUẤT XƯỞNG GATE 4 — LỆNH HOTFIX TOÀN DIỆN 16 BUGS**

---

## I. QUYẾT ĐỊNH CHÍNH THỨC CỦA PRODUCT OWNER (PO VERDICT)

Căn cứ vào kết quả kiểm thử độc lập 82 Test Cases theo kỷ luật Zero-Mock và Deep DB Verification:
- **Tổng số ca kiểm thử:** 82 Test Cases.
- **Số ca ĐẠT (PASS):** 66 Test Cases (80.5%).
- **Số ca TRƯỢT (FAIL):** 16 Test Cases (19.5%).
- **Số lỗi phát hiện:** **16 BUGS** (7 Critical, 5 Major, 4 Minor).

### 🔴 QUYẾT ĐỊNH CỦA PO: **TỪ CHỐI KÝ DUYỆT GATE 4 (GATE 4 REJECTED)**
1. **Lệnh dừng phát hành (Release Freeze):** Tạm dừng toàn bộ kế hoạch đóng gói và bàn giao sản phẩm phân hệ `TASK-03` & `TASK-08` sang UAT cho Sở KH&CN và cộng đồng doanh nghiệp.
2. **Kích hoạt Sprint Khắc Phục Lỗi (Bug Triage & Remediation Sprint):**
   - **Giai đoạn 1 (Hotfix Khẩn Cấp - P0):** Xử lý triệt để 7 lỗi Critical về Bảo mật, Vượt quyền, Rò rỉ dữ liệu và IDOR trong vòng 04 giờ làm việc.
   - **Giai đoạn 2 (Hoàn thiện Nghiệp vụ Cốt lõi - P1):** Xử lý 5 lỗi Major về Máy trạng thái (State Machine), Đột nhập Deal Room và Tương thích DTO trong vòng 06 giờ làm việc.
   - **Giai đoạn 3 (Tinh chỉnh Trải nghiệm & Trợ năng - P2):** Xử lý 4 lỗi Minor về UI/UX, Ngữ nghĩa HTML5/WCAG AA và Đồng bộ thuật ngữ trong vòng 02 giờ làm việc.
3. **Yêu cầu nghiệm thu vòng 2:** Sau khi đội ngũ Dev hoàn tất khắc phục, Trưởng ban QC (`nacen-qc`) có trách nhiệm kích hoạt lại toàn bộ bộ kiểm thử tự động `run_full_82_qc_suite.py`. Chỉ khi tỷ lệ đạt là **100% (82/82 PASS, 0 Defect)** thì PO mới xem xét ký duyệt Gate 4.

---

## II. MA TRẬN PHÂN LOẠI & NGUYÊN NHÂN GỐC RỄ 16 BUGS (RCA MATRIX)

### Bảng Phân Tích Toàn Diện 16 Lỗi

| STT | Mã Bug | Mức Độ | Giai Đoạn | Bản Chất Lỗi | Phân Loại | Điều Khoản Spec / Hiến Pháp Vi Phạm | Tệp & Vị Trí Vi Phạm Trong Mã Nguồn |
| :---: | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **1** | `BUG-AUTH-01` | 🔴 **CRITICAL** | G1 | Bỏ qua xác thực JWT: Token rác/hết hạn vẫn trả về 200 OK | **DEV DEFECT** | `TASK-03` SC-03-02; Constitution Nguyên tắc Zero-Trust | `DemandController.cs#L261` |
| **2** | `BUG-AUTH-02` | 🔴 **CRITICAL** | G1 | Vượt quyền (Privilege Escalation): BUYER tự duyệt bài toán của Sở | **DEV DEFECT** | `TASK-03` SC-03-05, WF-03; Hiến pháp Phân quyền RBAC | `DemandController.cs#L617` |
| **3** | `BUG-DMD-01` | 🟡 **MINOR** | G2 | Nút mở QuickDemandModal thiếu thuộc tính trợ năng và phím ESC kẹt | **DEV DEFECT** | `TASK-03` SC-03-03; WCAG 2.1 AA Keyboard Trapping | `portal/buyer/demands/page.tsx#L231` |
| **4** | `BUG-DMD-02` | 🔴 **CRITICAL** | G2 | Lỗ hổng IDOR: Khách vãng lai xem trọn 50 bài toán nội bộ của mọi DN | **DEV DEFECT** | `TASK-03` Core Invariant 3 (PDPD NĐ 13/2023), SC-03-02 | `DemandController.cs#L260-L270` |
| **5** | `BUG-GOV-01` | 🟠 **MAJOR** | G3 | Cổng thẩm định Sở `/gov/demands` ẩn khung bảng khi hàng chờ rỗng | **SPEC GAP & DEV DEFECT** | `TASK-03` SC-03-05 (Spec thiếu quy chuẩn Empty State bảng) | `gov/demands/page.tsx#L312-L335` |
| **6** | `BUG-GOV-02` | 🟡 **MINOR** | G3 | Lệch nhãn bộ lọc trạng thái giữa UI ("Chờ thẩm định") và QC ("Chờ duyệt") | **SPEC GAP** | `TASK-03` WF-03 (Chưa chuẩn hóa Canonical Terms cho tab) | `gov/demands/page.tsx#L211-L242` |
| **7** | `BUG-GOV-03` | 🔴 **CRITICAL** | G3 | API phê duyệt niêm yết của Cán bộ Sở gắn `[AllowAnonymous]` | **DEV DEFECT** | `TASK-03` BR-03-002, WF-03; Constitution An toàn dữ liệu | `DemandController.cs#L616-L627` |
| **8** | `BUG-GOV-04` | 🔴 **CRITICAL** | G3 | Khách ẩn danh tự ý gán chuyên gia tư vấn cho bài toán | **DEV DEFECT** | `TASK-03` SC-03-05, WF-03 bước 4; Quy chuẩn Điều phối Chuyên gia | `DemandController.cs#L629-L640` |
| **9** | `BUG-PUB-01` | 🟡 **MINOR** | G4 | Lệch placeholder tìm kiếm trên sàn và thiếu cơ chế debounce 300ms | **SPEC GAP & DEV DEFECT** | `TASK-03` Spec Delta v2 FR-Delta-02 (Thiếu chuẩn debounce) | `nhu-cau-cong-nghe/page.tsx#L363` |
| **10** | `BUG-PUB-02` | 🔴 **CRITICAL** | G4 | Rò rỉ dữ liệu: Bài toán `PENDING` bị phơi bày ra Sàn công khai | **DEV DEFECT** | `TASK-03` BR-03-002 & BR-03-003 (Chỉ niêm yết VERIFIED) | `DemandController.cs#L370` |
| **11** | `BUG-PUB-03` | 🟡 **MINOR** | G4 | Vi phạm WCAG AA & HTML5: Trùng 2 thẻ `<main>` lồng nhau | **DEV DEFECT** | `TASK-03` AC-01; Tiêu chuẩn Semantic HTML5 W3C | `nhu-cau-cong-nghe/[id]/page.tsx#L180` |
| **12** | `BUG-BRK-01` | 🟠 **MAJOR** | G5 | Kanban Pipeline không hiển thị cột chuẩn khi danh sách cơ hội rỗng | **DEV DEFECT** | `TASK-08` Story 3 (`UI-MATCH-PIPELINE-001`) | `pipeline/page.tsx#L558-L565` |
| **13** | `BUG-BRK-02` | 🟠 **MAJOR** | G5 | Vi phạm `BR-BRK-06`: Cho phép nhảy cóc từ `INITIATED` sang `COMPLETED` | **DEV DEFECT** | `TASK-08` Business Rule `BR-BRK-06` (Máy trạng thái tuần tự) | `BrokerageControllers.cs#L476-L490` |
| **14** | `BUG-BRK-03` | 🔴 **CRITICAL** | G5 | API Deal Room gắn `[AllowAnonymous]`, lộ toàn bộ tin nhắn & liên hệ thật | **DEV DEFECT** | `TASK-08` Story 4, BR-BRK-01; Nghị định 13/2023/NĐ-CP | `BrokerageControllers.cs#L519-L536` |
| **15** | `BUG-BRK-04` | 🟠 **MAJOR** | G5 | API gửi tin nhắn Deal Room lỗi 400 do Model Binding C# quá cứng nhắc | **DEV DEFECT** | `TASK-08` Section 5 API #8; Best Practice DTO Binding | `BrokerageControllers.cs#L40, L642` |
| **16** | `BUG-BRK-05` | 🟠 **MAJOR** | G5 | API lưu dự thảo MOU lỗi 400 do bắt buộc các trường điều khoản chi tiết | **SPEC GAP & DEV DEFECT** | `TASK-08` Story 4 (Thiếu định nghĩa giá trị mặc định MOU) | `BrokerageControllers.cs#L47, L695` |

---

## III. PHÂN TÍCH CHI TIẾT NGUYÊN NHÂN GỐC RỄ CHO TỪNG LỖI

### 1. Nhóm Lỗi Xác Thực & Phân Quyền (Authentication & RBAC)

#### `BUG-AUTH-01` & `BUG-DMD-02`: Bỏ qua xác thực và Lỗ hổng IDOR trên Bàn làm việc Bên Mua
- **Hiện tượng thực tế:** Gửi `GET /api/v1/buyer/demands` với token rác `invalid_token_123` hoặc không gửi token thì Backend vẫn trả về HTTP 200 chứa 50 bài toán của mọi doanh nghiệp.
- **Đối soát Spec:** Đặc tả `TASK-03` Mục 2 (SC-03-02) quy định rõ: *Tác nhân là Đại diện Doanh nghiệp đã đăng nhập (`BUYER_REPRESENTATIVE`)*. Nguyên tắc bất biến số 3 yêu cầu bảo vệ quyền riêng tư theo Nghị định 13/2023/NĐ-CP.
- **Dòng code vi phạm:** `DemandController.cs`:
  ```csharp
  // DÒNG 260-268 CŨ VI PHẠM:
  [HttpGet("buyer/demands")]
  [AllowAnonymous] // <-- SAI LẦM TỬ HUYỆT
  public async Task<IActionResult> GetBuyerDemands(CancellationToken ct)
  {
      var items = await db.Set<DemandItem>()
          .AsNoTracking()
          .OrderByDescending(i => i.CreatedAt)
          .Take(50) // <-- KHÔNG LỌC THEO DOANH NGHIỆP / ACTOR
          .ToListAsync(ct);
      return Ok(items);
  }
  ```
- **Kết luận:** **DEV DEFECT**. Lập trình viên tùy tiện gắn `[AllowAnonymous]` và quên hoàn toàn câu điều kiện lọc dữ liệu người sở hữu (`CreatedBy == Actor.PersonId`).

#### `BUG-AUTH-02`, `BUG-GOV-03` & `BUG-GOV-04`: Mở toang Cổng tác nghiệp Cán bộ Sở
- **Hiện tượng thực tế:** Tài khoản `BUYER` hoặc khách vãng lai không đăng nhập vẫn gọi thành công `POST /gov/demands/{id}/verify` và `POST /gov/demands/{id}/assign-expert`.
- **Đối soát Spec:** Đặc tả `TASK-03` SC-03-05 và WF-03 bước 3 quy định: *Chỉ Cán bộ Sở KH&CN (`PROVINCIAL_ADMIN`) hoặc Quản trị viên (`SUPER_ADMIN`) mới có quyền phê duyệt niêm yết và gán chuyên gia tư vấn*.
- **Dòng code vi phạm:** `DemandController.cs`:
  ```csharp
  // DÒNG 616-635 CŨ VI PHẠM:
  [HttpPost("gov/demands/{id}/verify")]
  [AllowAnonymous] // <-- LỖ HỔNG VƯỢT QUYỀN
  public async Task<IActionResult> VerifyDemand(Guid id, CancellationToken ct)

  [HttpPost("gov/demands/{id}/assign-expert")]
  [AllowAnonymous] // <-- CHO PHÉP KHÁCH LẠ GÁN CHUYÊN GIA
  public async Task<IActionResult> AssignExpert(Guid id, [FromBody] AssignExpertRequest req, CancellationToken ct)
  ```
- **Kết luận:** **DEV DEFECT**. Cực kỳ cẩu thả trong khâu bảo vệ endpoint hành chính nhà nước.

---

### 2. Nhóm Lỗi Rò Rỉ Dữ Liệu Công Khai (Public Data Isolation)

#### `BUG-PUB-02`: Bài toán `PENDING` bị lộ ra Sàn giao dịch công khai
- **Hiện tượng thực tế:** Gọi `GET /api/v1/public/demands` nhận về các bài toán đang ở trạng thái `PENDING` chưa qua kiểm duyệt.
- **Đối soát Spec:** `TASK-03` Quy tắc nghiệp vụ `BR-03-002`: *Chỉ hồ sơ VERIFIED mới được hiển thị trên sàn công khai*.
- **Dòng code vi phạm:** `DemandController.cs`:
  ```csharp
  // DÒNG 364-370 CŨ VI PHẠM:
  [HttpGet("public/demands")]
  [AllowAnonymous]
  public async Task<IActionResult> GetPublicDemands(...)
  {
      var query = db.Set<DemandItem>().AsNoTracking(); // <-- THIẾU FILTER STATUS!
  ```
- **Kết luận:** **DEV DEFECT**. Dev truy vấn bảng `demand_items` mà không áp dụng điều kiện bắt buộc `i.Status == DemandItemStatuses.Verified && i.IsPublicListed`.

---

### 3. Nhóm Lỗi Máy Trạng Thái & Bảo Mật Deal Room (TASK-08)

#### `BUG-BRK-02`: Nhảy cóc trạng thái Kanban (Vi phạm `BR-BRK-06`)
- **Hiện tượng thực tế:** Gửi `PUT /brokerage/opportunities/{id}/stage` với `newStage = 'COMPLETED'` từ giai đoạn khởi tạo `INITIATED` vẫn trả về HTTP 200 thành công.
- **Đối soát Spec:** `TASK-08` Quy tắc nghiệp vụ `BR-BRK-06`: *Vòng đời Cơ hội phải đi tuần tự: `SUGGESTED` -> `INITIATED` -> `NEGOTIATING` -> `MOU_SIGNED` -> `COMPLETED`. Không được nhảy cóc. Vi phạm phải trả về `400 Bad Request` kèm mã lỗi `ERR_INVALID_STATE_TRANSITION`*.
- **Dòng code vi phạm:** `BrokerageControllers.cs`:
  ```csharp
  // DÒNG 476-479 CŨ:
  var validStages = new[] { "SUGGESTED", "INITIATED", "NEGOTIATING", "MOU_SIGNED", "COMPLETED", "CLOSED_LOST" };
  if (!validStages.Contains(stage)) return BadRequest(...);
  // KHÔNG HỀ ĐỌC TRẠNG THÁI HIỆN TẠI VÀ KHÔNG KIỂM TRA QUAN HỆ CHUYỂN BƯỚC!
  ```
- **Kết luận:** **DEV DEFECT**. Dev lập trình thiếu sót cơ chế Finite State Machine (FSM) bảo vệ chu trình thương vụ.

#### `BUG-BRK-03`: Mở toang Deal Room 1-1 cho công chúng
- **Hiện tượng thực tế:** `GET /brokerage/opportunities/{id}/deal-room` gắn `[AllowAnonymous]`. Khách ngoài internet tự do xem SĐT, Email thật của 2 bên và các điều khoản đàm phán mật.
- **Đối soát Spec:** `TASK-08` Story 4 & BR-BRK-01 (PDPD Unmask Guard): *Không gian Deal Room là bảo mật tuyệt đối 1-1, chỉ dành riêng cho Buyer, Seller và Cán bộ/Chuyên gia được chỉ định*.
- **Dòng code vi phạm:** `BrokerageControllers.cs#L519`:
  ```csharp
  [HttpGet("brokerage/opportunities/{id:guid}/deal-room")]
  [AllowAnonymous] // <-- NGUY CƠ RÒ RỈ BÍ MẬT KINH DOANH
  ```
- **Kết luận:** **DEV DEFECT**. Vi phạm nghiêm trọng an toàn thông tin và cam kết bảo mật thương vụ.

#### `BUG-BRK-04` & `BUG-BRK-05`: Lệch DTO Thảo luận Deal Room và Soạn thảo MOU
- **Hiện tượng thực tế:** Gửi tin nhắn thảo luận hoặc lưu dự thảo MOU trả về `400 Bad Request`.
- **Đối soát Spec:**
  - `TASK-08` quy định Deal Room hỗ trợ gửi tin nhắn kỹ thuật nhanh và cho phép soạn dự thảo MOU từng bước.
  - Tuy nhiên, Backend C# định nghĩa các record DTO với các thuộc tính không cho phép null (`string SenderName`, `string CommercialTerms`, `string IntellectualPropertyTerms`). Khi Client hoặc script test gửi thiếu các trường này (hoặc đặt tên là `durationMonths` thay vì `pilotDurationMonths`), .NET Model Validation tự động ném ra `400 Bad Request`.
- **Kết luận:** **DEV DEFECT kết hợp SPEC GAP**. Spec chưa nêu rõ các giá trị mẫu mặc định (Boilerplate clauses) cho dự thảo MOU, còn Dev thì lập trình DTO quá cứng nhắc, thiếu khả năng chịu lỗi linh hoạt (fault-tolerant fallback).

---

### 4. Nhóm Lỗi Giao Diện & Trợ Năng (UI/UX & Trợ Năng WCAG AA)

#### `BUG-GOV-01` & `BUG-GOV-02`: Bảng Thẩm định Sở không render và lệch nhãn Tab
- **Hiện tượng thực tế:** `/gov/demands` khi hàng chờ rỗng không hiển thị thẻ `<table>`. Bộ lọc tabs trên UI ghi "Chờ thẩm định" trong khi QC tìm "Chờ duyệt".
- **Kết luận:** **SPEC GAP & DEV DEFECT**. Spec thiếu quy định chi tiết về Empty State cho bảng quản trị của Sở. Nền tảng cần giữ nguyên khung bảng (`<thead>`) và hiển thị thông báo rỗng trong `<tbody>` thay vì ẩn toàn bộ bảng.

#### `BUG-PUB-01`: Ô tìm kiếm sàn công khai thiếu debounce 300ms
- **Hiện tượng thực tế:** Gõ phím gửi request dồn dập, placeholder không chứa chữ "Tìm kiếm".
- **Kết luận:** **SPEC GAP & DEV DEFECT**. Bổ sung quy chuẩn debounce 300ms và chuẩn hóa placeholder.

#### `BUG-PUB-03`: Trùng 2 thẻ `<main>` lồng nhau
- **Hiện tượng thực tế:** Trang `/nhu-cau-cong-nghe/[id]` có 2 thẻ `<main>` (1 thẻ ở `app/layout.tsx` và 1 thẻ tại chính trang).
- **Đối soát Spec:** Vi phạm W3C Semantic HTML5 và tiêu chuẩn tiếp cận WCAG 2.1 AA.
- **Kết luận:** **DEV DEFECT**. Dev trang chi tiết không kiểm tra cấu trúc layout cha.

#### `BUG-BRK-01`: Kanban Pipeline thiếu accessible heading
- **Hiện tượng thực tế:** Tiêu đề cột Kanban đặt trong `<span>` thay vì thẻ tiêu đề `<h3/h4>`, khiến test case tìm kiếm cột không bắt được selector và làm giảm điểm trợ năng cho người khiếm thị.
- **Kết luận:** **DEV DEFECT**. Sửa `<span>` thành `<h3>`.

---

## IV. BẢN BAN HÀNH CẬP NHẬT ĐẶC TẢ KỸ THUẬT (PO SPEC AMENDMENTS)

Để làm rõ triệt để các khoảng hở nghiệp vụ, PO chính thức ban hành các điều khoản bổ sung vào Spec Kit:

### 1. Bổ sung vào `TASK-03_HO_SO_TIM_MUA_BUYER/spec.md`:
- **BR-03-004 (Empty State Resilience cho Bảng Thẩm định Sở)**:
  *Giao diện `/gov/demands` khi không có bài toán nào tồn đọng vẫn BẮT BUỘC phải render đầy đủ khung `<table>` và hàng tiêu đề `<thead>`. Tại phần `<tbody>`, hiển thị một hàng duy nhất với `<td colspan="5">` thông báo: "Không có bài toán nào tồn đọng trong danh sách". Tuyệt đối không được gỡ bỏ thẻ `<table>` khỏi cây DOM.*
- **BR-03-005 (Chuẩn hóa Từ điển Tab Trạng Thái)**:
  *Các tab lọc trên cổng Sở chuẩn hóa định danh và nhãn hiển thị: Tab 1: `Tất cả` (`data-tab="ALL"`), Tab 2: `Chờ duyệt` (`data-tab="PENDING"`), Tab 3: `Đã duyệt` (`data-tab="VERIFIED"`).*
- **BR-03-006 (Quy chuẩn Ô tìm kiếm Sàn công khai)**:
  *Ô tìm kiếm bài toán trên `/nhu-cau-cong-nghe` phải có placeholder: `"Tìm kiếm tên bài toán, công đoạn, giải pháp mong muốn..."` và phải được bọc bởi hook `useDebounce` với độ trễ tối thiểu 300ms trước khi kích hoạt gọi API.*

### 2. Bổ sung vào `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/spec.md`:
- **BR-BRK-07 (Dung sai DTO Thảo luận Deal Room & Tự Động Định Danh)**:
  *Endpoint `POST /brokerage/opportunities/{id}/discussions` chỉ bắt buộc trường `message`. Nếu `senderName` hoặc `senderRole` không được gửi lên từ client, Backend tự động trích xuất từ Token JWT (`Actor.FullName` và `Actor.Role`). Nếu vẫn rỗng, gán mặc định `senderName = "Đại diện Doanh nghiệp"` và `senderRole = "BUYER"`.*
- **BR-BRK-08 (Mẫu Điều Khoản Mặc Định Cho Dự Thảo MOU)**:
  *Khi người dùng lưu dự thảo MOU lần đầu (`POST /brokerage/opportunities/{id}/mou`), nếu các trường pháp lý bị bỏ trống, Backend tự động áp dụng các điều khoản mẫu (Boilerplate Clauses):*
  - `pilotDurationMonths`: Mặc định `6` tháng.
  - `commercialTerms`: Mặc định *"Chi phí thử nghiệm thực địa do hai bên đồng tài trợ theo tiến độ thống nhất."*
  - `intellectualPropertyTerms`: Mặc định *"Quyền sở hữu trí tuệ gốc thuộc về bên tạo lập; dữ liệu phát sinh trong thử nghiệm thuộc quyền khai thác chung."*

---

## V. CHỈ ĐẠO HÀNH ĐỘNG CHI TIẾT DÀNH CHO DEV (ACTION MANDATES)

### 1. Phân Hệ Backend .NET

#### Tệp 1: `SourceCode/backend/apps/api/V1Compat/DemandController.cs`
1. **Sửa API `GetBuyerDemands` (`L260-L271`)**:
   - Gỡ bỏ `[AllowAnonymous]`.
   - Bổ sung `[Authorize(Roles = "BUYER,INNOVATION_ENTITY,ADMIN,SUPER_ADMIN,PROVINCIAL_ADMIN")]`.
   - Bổ sung kiểm tra: Nếu là tài khoản Buyer, ép buộc lọc `query = query.Where(i => i.CreatedBy == Actor.PersonId);`.
2. **Sửa API `GetPublicDemands` (`L362-L406`) & `GetPublicDemandDetail` (`L408-L430`)**:
   - Bổ sung điều kiện lọc bắt buộc:
     ```csharp
     query = query.Where(i => i.Status == DemandItemStatuses.Verified && i.IsPublicListed);
     ```
3. **Sửa API `GetGovPendingDemands` (`L589-L614`)**:
   - Gỡ bỏ `[AllowAnonymous]`.
   - Bổ sung `[Authorize(Roles = "PROVINCIAL_ADMIN,SUPER_ADMIN,ADMIN")]`.
4. **Sửa API `VerifyDemand` (`L616-L627`)**:
   - Gỡ bỏ `[AllowAnonymous]`.
   - Bổ sung `[Authorize(Roles = "PROVINCIAL_ADMIN,SUPER_ADMIN")]`.
   - Kiểm tra `if (Actor.Role == "BUYER") return Forbid();`.
5. **Sửa API `AssignExpert` (`L629-L640`)**:
   - Gỡ bỏ `[AllowAnonymous]`.
   - Bổ sung `[Authorize(Roles = "PROVINCIAL_ADMIN,SUPER_ADMIN")]`.

#### Tệp 2: `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs`
1. **Sửa API `UpdateOpportunityStage` (`L470-L514`)**:
   - Gỡ bỏ `[AllowAnonymous]`, thêm `[Authorize]`.
   - Truy vấn trạng thái hiện tại của cơ hội từ CSDL (`currentStage`).
   - Cưỡng chế quy tắc FSM theo `BR-BRK-06`:
     ```csharp
     var allowedNextStages = currentStage switch
     {
         "SUGGESTED" => new[] { "INITIATED", "CLOSED_LOST" },
         "INITIATED" => new[] { "NEGOTIATING", "CLOSED_LOST" },
         "NEGOTIATING" => new[] { "MOU_SIGNED", "CLOSED_LOST" },
         "MOU_SIGNED" => new[] { "COMPLETED", "CLOSED_LOST" },
         _ => Array.Empty<string>()
     };
     if (!allowedNextStages.Contains(stage))
     {
         return BadRequest(new {
             error = "ERR_INVALID_STATE_TRANSITION",
             message = $"Không thể nhảy cóc từ giai đoạn {currentStage} sang {stage} theo quy tắc BR-BRK-06."
         });
     }
     ```
2. **Sửa API `GetDealRoomDetails` (`L519-L640`)**:
   - Gỡ bỏ `[AllowAnonymous]`, thêm `[Authorize]`.
   - Kiểm tra tư cách thành viên của `Actor.PersonId` / `Actor.Email`: Người gọi phải là Bên Mua, Bên Bán, Chuyên gia chỉ định, hoặc Cán bộ Sở phụ trách. Nếu không, trả về `403 Forbidden`.
3. **Sửa DTO & API `PostDiscussion` (`L40-L45` & `L642-L693`)**:
   - Đổi `SendDealDiscussionRequest`: Cho phép `string? SenderName` và `string? SenderRole`.
   - Trong thân hàm, fallback:
     ```csharp
     var senderName = !string.IsNullOrWhiteSpace(req.SenderName) ? req.SenderName : (Actor.FullName ?? "Đại diện Doanh nghiệp");
     var senderRole = !string.IsNullOrWhiteSpace(req.SenderRole) ? req.SenderRole : (Actor.Role ?? "BUYER");
     ```
4. **Sửa DTO & API `SaveMou` (`L47-L53` & `L695-L730`)**:
   - Đổi `SaveMouRequest`:
     ```csharp
     public record SaveMouRequest(
         string ScopeOfWork,
         int? PilotDurationMonths,
         int? DurationMonths,
         string? CommercialTerms,
         string? IntellectualPropertyTerms,
         string? Status
     );
     ```
   - Trong thân hàm, gán giá trị mặc định theo `BR-BRK-08` nếu client bỏ trống.

---

### 2. Phân Hệ Frontend Next.js / React

#### Tệp 1: `SourceCode/frontend/src/app/gov/demands/page.tsx`
- Giữ nguyên thẻ `<table>` trong DOM ngay cả khi `filteredDemands.length === 0`.
- Hiển thị Empty Row trong `<tbody>`:
  ```tsx
  {filteredDemands.length === 0 ? (
    <tr>
      <td colSpan={5} className="py-12 text-center text-slate-500">
        Không có bài toán nào tồn đọng trong danh sách.
      </td>
    </tr>
  ) : (
    filteredDemands.map(...)
  )}
  ```
- Chuẩn hóa các nút tab trạng thái:
  - Tab 1: `"Tất cả"` (`data-tab="ALL"`)
  - Tab 2: `"Chờ duyệt"` (`data-tab="PENDING"`)
  - Tab 3: `"Đã duyệt"` (`data-tab="VERIFIED"`)

#### Tệp 2: `SourceCode/frontend/src/app/portal/opportunities/pipeline/page.tsx`
- Đổi tiêu đề cột Kanban từ `<span className="font-extrabold...">{col.label}</span>` thành:
  ```tsx
  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
    {col.label}
  </h3>
  ```
- Bổ sung thuộc tính `data-testid={`kanban-col-${col.key}`}`.

#### Tệp 3: `SourceCode/frontend/src/app/nhu-cau-cong-nghe/page.tsx` & `[id]/page.tsx`
- Sửa placeholder ô tìm kiếm thành: `"Tìm kiếm tên bài toán, công đoạn, giải pháp mong muốn..."`.
- Tích hợp hook debounce 300ms khi người dùng gõ vào `searchQuery`.
- Thay thế thẻ `<main className="...">` cục bộ ở cả hai tệp thành thẻ `<div className="...">` để giải quyết dứt điểm lỗi trùng thẻ `<main>` với `app/layout.tsx`.

#### Tệp 4: `SourceCode/frontend/src/app/portal/buyer/demands/page.tsx`
- Bổ sung `data-testid="btn-open-quick-demand"` cho nút "Đăng Bài Toán Mới".
- Đảm bảo khi mở `QuickDemandModal`, focus được chuyển vào container modal và phím `Escape` đóng modal ngay lập tức mà không phụ thuộc vào trạng thái click chuột.

---

## VI. KẾ HOẠCH PHÂN BỔ THỜI GIAN & TÁI NGHIỆM THU (TRIAGE TIMELINE)

```
┌───────────────────────────┬───────────────────────────────────┬──────────────┬─────────────────────────┐
│ Nhóm Ưu Tiên              │ Phạm Vi Mã Nguồn & Danh Mục Bugs │ Thời Lượng   │ Người Chịu Trách Nhiệm  │
├───────────────────────────┼───────────────────────────────────┼──────────────┼─────────────────────────┤
│ 🔴 P0 (Hotfix Khẩn Cấp)   │ BUG-AUTH-01, BUG-AUTH-02,         │ 04 Giờ       │ Backend Lead Dev        │
│    Chặn rò rỉ & Vượt quyền│ BUG-DMD-02, BUG-GOV-03,           │              │                         │
│                           │ BUG-GOV-04, BUG-PUB-02,           │              │                         │
│                           │ BUG-BRK-03                        │              │                         │
├───────────────────────────┼───────────────────────────────────┼──────────────┼─────────────────────────┤
│ 🟠 P1 (Nghiệp Vụ Cốt Lõi) │ BUG-GOV-01, BUG-BRK-01,           │ 06 Giờ       │ Fullstack Dev Team      │
│    FSM, DTO, Kanban Table │ BUG-BRK-02, BUG-BRK-04,           │              │                         │
│                           │ BUG-BRK-05                        │              │                         │
├───────────────────────────┼───────────────────────────────────┼──────────────┼─────────────────────────┤
│ 🟡 P2 (UI/UX & Trợ Năng)  │ BUG-DMD-01, BUG-GOV-02,           │ 02 Giờ       │ Frontend Dev            │
│    Debounce, DOM, WCAG    │ BUG-PUB-01, BUG-PUB-03            │              │                         │
├───────────────────────────┼───────────────────────────────────┼──────────────┼─────────────────────────┤
│ 🟢 NGHIỆM THU GATE 4      │ Tái kích hoạt toàn bộ suite       │ 02 Giờ       │ QC Specialist           │
│    (Re-run 82 Test Cases) │ `run_full_82_qc_suite.py`         │              │ (Chốt 82/82 PASS)       │
└───────────────────────────┴───────────────────────────────────┴──────────────┴─────────────────────────┘
```

**LỜI KẾT TỪ PRODUCT OWNER:**
> *"Chất lượng phần mềm phục vụ chuyển giao công nghệ cho Nhà nước và Doanh nghiệp không cho phép bất kỳ sự thỏa hiệp nào về an toàn dữ liệu và tính minh bạch nghiệp vụ. Việc QC phát hiện 16 lỗi này là minh chứng cho giá trị của kỷ luật Zero-Mock và đối soát CSDL thật. Toàn bộ đội ngũ phát triển phải thực hiện nghiêm túc chỉ đạo khắc phục trên để đảm bảo phân hệ `TASK-03` và `TASK-08` đạt chuẩn xuất xưởng cao nhất!"*
