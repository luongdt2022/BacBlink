# YÊU CẦU THAY ĐỔI (CHANGE REQUEST) — CR-2026-012

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Mã Change Request** | `CR-2026-012` |
| **Tiêu đề** | Chuẩn Hóa Ngân Sách Deal Room, Quy Chuẩn Tiền Tệ Toàn Sàn (Triệu/Tỷ VNĐ) & Triệt Tiêu Dữ Liệu Khởi Tạo Cứng Phân Hệ Brokerage (TASK-08) |
| **Người đề xuất** | Ban Quản trị Dự án (PO/PM NacenTech) & Lead BA (`nacen-ba`) |
| **Căn cứ quyết định** | Kế hoạch tổng thể chuẩn hóa Taxonomy và Zero-Mock (Đợt 3) & Quyết định PO `PO-DEC-20261030-03` |
| **Ngày ban hành** | 30/10/2026 |
| **Mức độ ưu tiên** | **P1 — Khẩn cấp** (Chốt chặn sinh tử chất lượng Đợt 3 & Xuất xưởng toàn sàn) |
| **Trạng thái** | 🟢 **ĐÃ DUYỆT SCOPE (DoR Approved)** — Chuyển giao SA Plan & Dev Implementation |

---

## 1. BỐI CẢNH & HIỆN TRẠNG PHÁT HIỆN TẠI ĐỢT 3 (GREP-FIRST DISCOVERY)

Tiếp nối việc hoàn tất nghiệm thu xuất xưởng Gate 5 cho Đợt 1 (`CR-2026-010`) và Đợt 2 (`CR-2026-011`), Ban Quản trị Dự án tiến hành rà soát chuyên sâu Đợt 3 trên phân hệ **Kết Nối Cung–Cầu & Quản Lý Cơ Hội Brokerage (`TASK-08`)**, bao gồm Radar Ghép Nối AI, Modal Tạo Yêu Cầu Kết Nối, Pipeline Vòng Đời Cơ Hội, Cổng Giám Sát Địa Phương Sở KH&CN, và Phòng Đàm Phán Bảo Mật Deal Room 1-1.

Kết quả rà soát phát hiện 4 vấn đề vi phạm nghiêm trọng nguyên tắc Zero-Mock và thiếu nhất quán tiền tệ:

### 1.1. Giá Trị Khởi Tạo Mặc Định Cứng (Hardcoded Fake Defaults) Tại Modal Kết Nối
- Tại tệp `SourceCode/frontend/src/app/portal/matching/radar/ConnectionRequestModal.tsx`:
  * Dòng 21: `const [senderOrgName, setSenderOrgName] = useState('Công ty CP Nông Nghiệp Xanh Hà Nội');` (Gán cứng một công ty mẫu).
  * Dòng 23: `const [proposedBudget, setProposedBudget] = useState('800 triệu - 1.2 tỷ VNĐ');` (Gán cứng khoảng ngân sách giả định).
  * Dòng 24–26: `const [message, setMessage] = useState('Chúng tôi quan tâm sâu sắc tới công nghệ này và muốn kết nối để thảo luận thử nghiệm pilot trong quý tới.');` (Gán cứng lời nhắn mẫu).
- **Hậu quả**: Khi bất kỳ doanh nghiệp nào bấm gửi yêu cầu kết nối mà không để ý xóa form, hệ thống sẽ lưu vào CSDL PostgreSQL các giá trị giả lập này. Dữ liệu thật của hệ thống bị ô nhiễm bởi các chuỗi mẫu.

### 1.2. Thiếu Nhất Quán Về Quy Chuẩn Định Dạng Tiền Tệ Toàn Sàn
- Tại `SourceCode/frontend/src/app/portal/opportunities/pipeline/page.tsx`:
  * Dòng 175: `const totalValue = opportunities.reduce((sum, o) => sum + (o.estimatedValueMillionVnd || 0), 0);`
  * Dòng 264–265: `{totalValue.toLocaleString('vi-VN')} <span ...>Triệu VNĐ</span>` (Ví dụ ra `2.400 Triệu VNĐ`, không quy đổi sang Tỷ VNĐ).
  * Dòng 586: `~{opp.estimatedValueMillionVnd} Tr`
- Tại `SourceCode/frontend/src/app/gov/opportunities/page.tsx`:
  * Dòng 152–153: `{stats.totalEstimatedValueMillionVnd.toLocaleString('vi-VN')} Tr`
  * Dòng 283: `${opp.estimatedValueMillionVnd.toLocaleString('vi-VN')} Tr`
  * Dòng 374: `${selectedDeal.estimatedValueMillionVnd.toLocaleString('vi-VN')} Triệu VNĐ`
- Trong khi tại Trang chủ (`/app/page.tsx`), hệ thống đã áp dụng công thức quy đổi động: $\ge 1.000$ Triệu VNĐ thì hiển thị `X,X Tỷ VNĐ`, $< 1.000$ Triệu VNĐ thì hiển thị `XXX Triệu VNĐ`.

### 1.3. Nhân Sự Mẫu Cứng Trong Phòng Đàm Phán Deal Room
- Tại `SourceCode/frontend/src/app/portal/opportunities/[id]/deal-room/page.tsx`:
  * Dòng 41: `const [senderName, setSenderName] = useState('Kỹ sư Vũ Quang Hải');`
- Tại `MouModal.tsx`:
  * Dòng 30: `...hợp đồng chuyển giao công nghệ trọn gói trị giá dự kiến ${opportunity.estimatedValueMillionVnd || 1000} triệu VNĐ.` (Fallback ảo `1000`).
- **Hậu quả**: Người dùng thật khi vào Deal Room luôn thấy tên hiển thị là một kỹ sư giả lập; biên bản thỏa thuận MOU tự động gán giá trị fallback `1000` triệu nếu cơ hội chưa nhập ngân sách.

---

## 2. QUY CHUẨN ĐẶC TẢ DELTA & QUY TẮC NGHIỆP VỤ BẮT BUỘC

### 2.1. Quy Chuẩn Triệt Tiêu Mock Ngân Sách & Form Khởi Tạo Kết Nối (`REQ-DEL-08-03`)
1. **Khởi tạo trạng thái rỗng (Zero-Mock Initial State)**:
   - `senderOrgName`: Tự động nạp từ thông tin tổ chức người dùng đăng nhập (`authClient.getUser()?.organizationName`). Nếu chưa có tổ chức liên kết thì khởi tạo chuỗi rỗng `""`.
   - `proposedBudget`: Mặc định chuỗi rỗng `""`. Placeholder: `"VD: 500 triệu - 1 tỷ VNĐ, hoặc Thỏa thuận"`. Cho phép người dùng bấm nút gợi ý: *[Lấy theo ngân sách bài toán]* nếu `candidate.demandId` có ngân sách xác định.
   - `message`: Mặc định chuỗi rỗng `""`. Placeholder: `"Mô tả mục tiêu thử nghiệm, bối cảnh bài toán và mong muốn phối hợp..."`.
2. **Quy tắc kiểm tra hợp lệ (Validation Rules)**:
   - `senderOrgName`: Bắt buộc nhập, tối thiểu 3 ký tự.
   - `message`: Bắt buộc nhập, tối thiểu 10 ký tự. Không cho phép gửi tin nhắn rỗng.
   - `proposedBudget`: Tùy chọn (cho phép để trống hoặc ghi thỏa thuận).

### 2.2. Nguồn Chân Lý & Hàm Định Dạng Tiền Tệ Toàn Sàn (`REQ-DEL-08-04`)
1. **Trường dữ liệu gốc (SSOT)**:
   - `estimatedValueMillionVnd` (số thực hoặc nguyên, đơn vị Triệu VNĐ) từ API backend.
2. **Quy chuẩn hàm dùng chung `formatCurrencyVnd(valueInMillion: number | null | undefined): string`**:
   - Nếu `valueInMillion == null` hoặc `valueInMillion === 0`: Trả về `"0 VNĐ"` hoặc `"Thương lượng"` tùy ngữ cảnh hiển thị.
   - Nếu `valueInMillion >= 1000`: Quy đổi ra Tỷ VNĐ với công thức:
     $$\text{Display} = \left(\frac{\text{valueInMillion}}{1000}\right).\text{toLocaleString}('vi-VN', \{\text{maximumFractionDigits}: 1\}) + \text{ " Tỷ VNĐ"}$$
     *(Ví dụ: 2400 Triệu VNĐ $\rightarrow$ "2,4 Tỷ VNĐ"; 1850 Triệu VNĐ $\rightarrow$ "1,9 Tỷ VNĐ")*
   - Nếu `valueInMillion < 1000`: Giữ nguyên đơn vị Triệu VNĐ:
     $$\text{Display} = \text{valueInMillion}.\text{toLocaleString}('vi-VN', \{\text{maximumFractionDigits}: 0\}) + \text{ " Triệu VNĐ"}$$
     *(Ví dụ: 800 Triệu VNĐ $\rightarrow$ "800 Triệu VNĐ")*
3. **Phạm vi phủ sóng bắt buộc**:
   - Thẻ Hero Tổng giá trị tại Pipeline (`/portal/opportunities/pipeline`).
   - Thẻ Tổng giá trị dự kiến tại Cổng Giám Sát Sở (`/gov/opportunities`).
   - Thẻ từng cơ hội trên Kanban và danh sách cơ hội tại Cổng Sở.

### 2.3. Quy Chuẩn Người Dùng Thật Trong Deal Room & MOU (`REQ-DEL-08-05`)
1. **Xóa bỏ chuỗi cứng `Kỹ sư Vũ Quang Hải`**:
   - `senderName`: Nạp từ `authClient.getUser()?.fullName` hoặc placeholder tên người dùng đang phiên làm việc.
2. **Loại bỏ fallback giả lập trong `MouModal.tsx`**:
   - Nếu `opportunity.estimatedValueMillionVnd` có giá trị: Hiển thị giá trị đã format định dạng chuẩn.
   - Nếu không có giá trị: Hiển thị chuỗi rõ ràng: *"thỏa thuận theo phụ lục hợp đồng"* thay vì tự gán số `1000 triệu VNĐ`.

---

## 3. TIÊU CHUẨN CHẤP THUẬN NGHIỆM THU (ACCEPTANCE CRITERIA)

| Mã AC | Tiêu Chí Kiểm Chứng | Phương Thức Đánh Giá |
| :--- | :--- | :--- |
| **`AC-CR-012-01`** | `ConnectionRequestModal.tsx` mở lên có `proposedBudget = ""` và `message = ""`. Placeholder hướng dẫn rõ ràng. | Playwright E2E & Unit Test |
| **`AC-CR-012-02`** | `senderOrgName` lấy từ `authClient` của user hiện tại, không còn bất kỳ dấu vết nào của chuỗi `'Công ty CP Nông Nghiệp Xanh Hà Nội'`. | Grep & Unit Test |
| **`AC-CR-012-03`** | Tổng giá trị cơ hội tại Pipeline và Gov Dashboard nếu $\ge 1.000$ Triệu VNĐ thì render `"X,X Tỷ VNĐ"`; nếu $< 1.000$ Triệu VNĐ thì render `"XXX Triệu VNĐ"`. | Unit Test & Visual QA |
| **`AC-CR-012-04`** | `DealRoomPage` không còn gán mặc định `senderName = 'Kỹ sư Vũ Quang Hải'`; lấy tên user thật từ `authClient`. | Code Review & Unit Test |
| **`AC-CR-012-05`** | `MouModal` không còn fallback hardcode `1000`. | Code Review & Unit Test |
| **`AC-CR-012-06`** | Grep toàn bộ thư mục `SourceCode/frontend/src/app/portal/opportunities/` và `matching/` sạch bóng 100% từ khóa mock/dummy/fake. | AST & Text Grep Guard |

---

## 4. MA TRẬN PHÂN CÔNG TÁC TỬ CHO ĐỢT 3 (STAGE-GATE ROLES)

| Vai Trò | Tác Tử | Nhiệm Vụ Cụ Thể |
| :--- | :--- | :--- |
| **Lead BA** | `nacen-ba` | Đã hoàn thành Basic Design Delta (`BD_DELTA_CR_024`) và Spec Delta trong `TASK-08/spec.md`. Bàn giao DoR Gate 1. |
| **Software Architect** | `nacen-techlead-sa` | Thiết kế hàm tiện ích tiền tệ dùng chung, lập `plan.md` Delta đảm bảo Clean Architecture và không phá vỡ contracts DTO. |
| **Senior Dev** | `nacen-dev-senior` | Triệt tiêu mock cứng tại `ConnectionRequestModal.tsx`, `page.tsx`, `deal-room/page.tsx`, `MouModal.tsx`, áp dụng hàm format tiền tệ. Cập nhật unit test. |
| **QC Specialist** | `nacen-qc` | Kiểm thử Playwright E2E các màn hình, kiểm thử phá hoại form rỗng, đối soát số liệu tiền tệ với CSDL PostgreSQL thật. |
| **Shadow QA** | `nacen-qa` | Chạy script quét AST toàn sàn bắt mock ngầm và kiểm toán Zero-Mock toàn diện. |
| **PO / PM** | `nacen-po-pm` | Đối soát bộ 3 thẩm vấn thép, ký duyệt Gate 5 xuất xưởng toàn sàn NacenTech. |
