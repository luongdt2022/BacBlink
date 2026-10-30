# Feature Specification: TASK-08 Kết Nối Cung–Cầu & Quản Lý Cơ Hội Hợp Tác

**Feature Branch**: `brokerage-matching-dealroom`  
**Feature Directory**: `specs/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
**Created**: 11/10/2026  
**Status**: `Active` (Delta CR-2026-012 In Progress — Gate 1 DoR Approved by BA)  
**Ánh Xạ Basic Design**: 
- Master Basic Design: [`Specification/BASIC_DESIGN_NACENTECH.md`](../../Specification/BASIC_DESIGN_NACENTECH.md) (Mục 5.4 Phân hệ 08 & Mục 17 PO-DEC-20261030-05)
- Phân hệ Basic Design: [`Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/README.md`](../../Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/README.md)  
**Wireframe Tham Chiếu**:
1. [`Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/wireframe_matching_va_quan_ly_co_hoi.html`](../../Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/wireframe_matching_va_quan_ly_co_hoi.html) (Radar Matching & Pipeline Kanban 5 bước)
2. [`Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/wireframe_deal_room_hop_tac.html`](../../Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/wireframe_deal_room_hop_tac.html) (Phòng Đàm Phán Deal Room 1-1 & Soạn Thảo MOU)

---

## 1. Mục Đích & Bối Cảnh (Context & Objectives)

Phân hệ **Kết nối Cung–Cầu & Quản lý Cơ hội (Matchmaking & Opportunity Management)** là mắt xích trung tâm chuyển hóa dữ liệu tĩnh giữa các phân hệ:
1. **Nhu cầu tìm mua từ `TASK-03`** (Demand Tickets, chỉ số TNI 0–100, hiện trạng kỹ thuật).
2. **Hồ sơ chào bán từ `TASK-04`** (Technology Offers, Bộ Tứ SHTT, Cấp độ TRL 1–9).
3. **Mạng lưới Chuyên gia từ `TASK-05`** (Verified Experts hỗ trợ tư vấn đánh giá).
4. **Master Data từ `TASK-06`** (10 Lĩnh vực chuẩn TT17 `LV01..LV17`, ma trận 59 cặp quan hệ LV-CN).

Mục tiêu chính:
- **Tự động gợi ý ghép cặp 2 chiều (Match Candidate)**: Tính toán Matching Score minh bạch (0–100%).
- **Tích hợp chỉ số TNI**: Ưu tiên bài toán cấp thiết ($\text{TNI} \ge 80$).
- **Tích hợp Bộ Tứ SHTT & TRL**: Khớp mức độ TRL và cộng điểm tin cậy (+20% Trust Boost) cho bằng sáng chế.
- **Pipeline Kanban 5 bước theo dõi toàn diện vòng đời thương vụ**: `Suggested` $\rightarrow$ `Requested` $\rightarrow$ `In Negotiation` $\rightarrow$ `Drafting MOU` $\rightarrow$ `Closed/Transferred`.
- **Phòng đàm phán hợp tác (Deal Room 1-1)**: Không gian bảo mật giữa Buyer ↔ Seller có sự bảo trợ của Sở KH&CN / Chuyên gia.
- **Tuân thủ bảo vệ dữ liệu PDPD (NĐ 13/2023)**: Chỉ mở thông tin liên hệ thật (Unmask) khi cả hai bên cùng đồng thuận kết nối.

---

## 2. Tác Nhân & Phân Quyền (Actors & Permissions)

| Tác Nhân | Vai Trò Hệ Thống | Trách Nhiệm & Quyền Hạn Trong TASK-08 |
| :--- | :--- | :--- |
| **Bên Mua (Buyer)** | `BUYER`, `INNOVATION_ENTITY` | Tra cứu Radar gợi ý công nghệ; gửi yêu cầu kết nối; chấp nhận lời mời từ Seller; tham gia Deal Room; thống nhất ký MOU. |
| **Bên Bán (Seller)** | `SELLER` | Khám phá bài toán nhu cầu; tiếp nhận & duyệt yêu cầu kết nối; gửi giải pháp tới Buyer; tham gia Deal Room đàm phán giá/TRL; thống nhất MOU. |
| **Cán Bộ Sở KH&CN** | `PROVINCIAL_ADMIN`, `CLUSTER_ADMIN` | Giám sát Pipeline cơ hội trên địa bàn tỉnh/thành (`/gov/opportunities`); hỗ trợ thúc đẩy các ca tồn đọng > 48h; bảo trợ pháp lý Deal Room. |
| **Chuyên Gia Tư Vấn** | `VERIFIED_EXPERT` | Được mời tham gia Deal Room độc lập; tư vấn lộ trình thử nghiệm pilot; đánh giá tính khả thi công nghệ cho Bên Mua. |
| **Quản Trị Trung Ương** | `SUPER_ADMIN`, `OPERATOR_ADMIN` | Giám sát toàn quốc; can thiệp giải quyết tranh chấp hoặc đóng ca vi phạm. |

---

## 3. User Stories & Acceptance Criteria

### Story 1: Radar Ghép Nối Cung–Cầu 2 Chiều (`UI-MATCH-RADAR-001`)
- **Given** Doanh nghiệp Mua hoặc Bán truy cập `/portal/matching/radar`,
- **When** hệ thống quét danh mục nhu cầu và chào bán đang `ACTIVE`/`APPROVED`,
- **Then** hiển thị danh sách các ứng viên ghép cặp (Match Candidates) xếp hạng theo Matching Score (0–100%).
- **And** hiển thị rõ lý do tương thích: Trọng số Ma trận ngành LV-CN, độ lệch TRL, và điểm thưởng TNI.

### Story 2: Gửi & Xử Lý Yêu Cầu Kết Nối Với Bảo Mật PDPD (`UI-MATCH-REQUEST-001`)
- **Given** người dùng chọn một ứng viên phù hợp trên Radar,
- **When** bấm "Gửi Yêu Cầu Kết Nối",
- **Then** modal hiển thị cho phép nhập tin nhắn mở đầu, phạm vi bài toán, và ngân sách dự kiến.
- **And** thông tin liên hệ nhạy cảm (SĐT, Email cá nhân) được che mờ (Masked PDPD: `09****1234`, `a***@domain.com`).
- **When** bên nhận bấm "Chấp Nhận Kết Nối",
- **Then** trạng thái chuyển sang `ACCEPTED`, tạo bản ghi Cơ hội (Opportunity) mới, và gỡ mặt nạ PDPD cho cả hai bên.

### Story 3: Quản Lý Vòng Đời Cơ Hội Trên Pipeline Kanban 5 Bước (`UI-MATCH-PIPELINE-001`)
- **Given** người dùng vào màn hình `/portal/opportunities/pipeline`,
- **When** bảng Kanban tải dữ liệu,
- **Then** hiển thị 5 cột trạng thái: (1) Gợi ý $\rightarrow$ (2) Đã yêu cầu $\rightarrow$ (3) Đang đàm phán $\rightarrow$ (4) Soạn MOU $\rightarrow$ (5) Hoàn thành chuyển giao.
- **And** người dùng có thể kéo thả hoặc bấm chuyển trạng thái giữa các bước theo đúng quyền hạn.

### Story 4: Không Gian Đàm Phán Hợp Tác Deal Room 1-1 & Soạn Thảo MOU (`UI-MATCH-DEALROOM-001`)
- **Given** một Cơ hội ở bước `NEGOTIATION` hoặc `DRAFTING_MOU`,
- **When** truy cập `/portal/opportunities/[id]/deal-room`,
- **Then** hiển thị bàn làm việc 3 bên (Buyer, Seller, Chuyên gia/Sở KH&CN bảo trợ), nhật ký trao đổi kỹ thuật (Discussion Log), đề xuất báo giá, và tài liệu giải pháp.
- **And** cung cấp công cụ "Soạn Thảo Biên Bản Ghi Nhớ (MOU)" cho phép điền điều khoản, xem trước và xuất văn bản thỏa thuận.

### Story 5: Cổng Tác Nghiệp Lãnh Đạo Sở KH&CN Giám Sát Địa Bàn (`UI-GOV-OPPORTUNITY-001`)
- **Given** cán bộ Sở KH&CN tỉnh đăng nhập vào `/gov/opportunities`,
- **When** xem danh sách cơ hội,
- **Then** hệ thống tự động lọc theo `ScopeId = PROVINCE` của cán bộ.
- **And** cảnh báo cờ đỏ (Red Flag) cho các yêu cầu kết nối chưa được phản hồi sau 48 giờ để cán bộ gọi điện hỗ trợ kết nối.

---

## 4. Business Rules (Quy Tắc Nghiệp Vụ)

| Mã Rule | Tên Quy Tắc | Điều Kiện & Logic Xử Lý | Mã Lỗi |
| :--- | :--- | :--- | :--- |
| **BR-BRK-01** | **Bảo Mật PDPD Trước Chấp Thuận** | Trước khi cả 2 bên cùng đồng ý kết nối, mọi thông tin liên hệ định danh trực tiếp (SĐT, Email cá nhân, CCCD) bắt buộc phải che mờ (Masked). Nghiêm cấm hiển thị trực tiếp. | `403 Forbidden` (`ERR_PDPD_CONSENT_REQUIRED`) |
| **BR-BRK-02** | **Công Thức Trọng Số Matching** | $\text{MatchScore} = \text{BaseSectorScore} \times 0.4 + \text{TrlCompatibility} \times 0.3 + \text{TniBoost} \times 0.15 + \text{IpTrustBoost} \times 0.15$. Tối đa 100 điểm. | `422 Unprocessable` (`ERR_INVALID_MATCH_CALC`) |
| **BR-BRK-03** | **Ưu Tiên Nhu Cầu Cấp Thiết (TNI $\ge 80$)** | Nhu cầu có $\text{TNI} \ge 80$ được cộng tối đa 15–20 điểm ưu tiên hàng đợi gợi ý và tự động kích hoạt gợi ý gán Chuyên gia đồng hành. | Logic Invariant |
| **BR-BRK-04** | **Chống Spam Yêu Cầu Trùng Lặp** | Một cặp (Buyer Demand, Seller Offer) chỉ được có tối đa 1 yêu cầu kết nối ở trạng thái `PENDING` tại một thời điểm. Không cho phép gửi dồn dập. | `409 Conflict` (`ERR_DUPLICATE_CONNECTION_REQUEST`) |
| **BR-BRK-05** | **SLA Phản Hồi Kết Nối 48h** | Bên nhận có 48 giờ làm việc để Chấp nhận hoặc Từ chối yêu cầu kết nối. Sau 48 giờ, hệ thống kích hoạt thông báo nhắc nhở và báo cáo Cán bộ Sở hỗ trợ. | SLA Notification |
| **BR-BRK-06** | **Chuyển Bước Tuần Tự Không Nhảy Cóc** | Vòng đời Cơ hội phải đi tuần tự: `SUGGESTED` $\rightarrow$ `REQUESTED` $\rightarrow$ `NEGOTIATION` $\rightarrow$ `DRAFTING_MOU` $\rightarrow$ `CLOSED_WON` / `CLOSED_LOST`. Không được nhảy cóc từ `SUGGESTED` sang `CLOSED_WON`. | `400 Bad Request` (`ERR_INVALID_STATE_TRANSITION`) |

---

## 5. Danh Mục API Endpoints Chuẩn Contract-First

1. `GET /api/v1/brokerage/radar`: Lấy danh sách ứng viên ghép cặp xếp hạng theo Matching Score (hỗ trợ lọc ngành, TRL, điểm).
2. `POST /api/v1/brokerage/requests`: Tạo yêu cầu kết nối mới giữa Demand và Offer.
3. `GET /api/v1/brokerage/requests`: Lấy danh sách yêu cầu kết nối gửi đi / nhận về của tài khoản hiện tại.
4. `PUT /api/v1/brokerage/requests/{id}/respond`: Phản hồi yêu cầu kết nối (`ACCEPT` hoặc `REJECT`).
5. `GET /api/v1/brokerage/opportunities`: Lấy danh sách cơ hội hiển thị trên bảng Kanban 5 bước.
6. `PUT /api/v1/brokerage/opportunities/{id}/stage`: Chuyển giai đoạn cơ hội trên Kanban.
7. `GET /api/v1/brokerage/opportunities/{id}/deal-room`: Lấy chi tiết không gian Deal Room, nhật ký trao đổi và thông tin liên hệ unmasked.
8. `POST /api/v1/brokerage/opportunities/{id}/discussions`: Gửi tin nhắn / tài liệu trao đổi trong Deal Room.
9. `POST /api/v1/brokerage/opportunities/{id}/mou`: Soạn thảo và cập nhật Biên bản Ghi nhớ (MOU).
10. `GET /api/v1/gov/opportunities`: Dành cho Sở KH&CN giám sát cơ hội và SLA kết nối theo địa bàn.

---

## 6. Spec Delta v2 (CR-2026-018) — Làm Mịn Radar Ghép Nối AI & Giải Trình XAI (Bên Mua)

### 6.1. Bối cảnh & Yêu cầu mới
Theo kết luận Party Mode và chỉ đạo PO ngày 23/10/2026 về việc làm mịn trải nghiệm Doanh nghiệp Mua:
1. **Lọc theo Bài toán nguồn (`REQ-RADAR-FILTER-001`)**: Bên Mua có thể có nhiều bài toán đang mở; Radar cần cung cấp bộ chọn nhanh bài toán cụ thể (`selectedDemandCode`) để lọc danh sách ứng viên chuyển giao đích danh cho bài toán đó.
2. **Khối Giải trình Độ tương thích AI XAI (`REQ-RADAR-XAI-001`)**: Minh bạch hóa lý do AI đưa ra điểm khớp nối qua 4 trục trực quan (Lĩnh vực 100% khớp, Mức TRL, Cấp thiết TNI, Bằng sáng chế SHTT) giúp Bên Mua ra quyết định kết nối nhanh chóng.
3. **Chuẩn hóa hiển thị toán học (`REQ-RADAR-MATH-001`)**: Làm sạch text định dạng toán học, triệt tiêu chuỗi LaTeX thô (`$TNI \ge 80$` $\rightarrow$ `TNI ≥ 80`).

### 6.2. Tiêu chí Nghiệm thu Delta
- **AC-DELTA-RADAR-01**: Selector `selectedDemandCode` hiển thị mã bài toán và tiêu đề, mặc định chọn `ALL`, khi đổi giá trị thì grid chỉ render các ứng viên của bài toán đó.
- **AC-DELTA-RADAR-02**: Thẻ mỗi ứng viên có khối `Giải trình độ tương thích AI (XAI)` với 4 ô chỉ số chi tiết.
- **AC-DELTA-RADAR-03**: 100% test suite `src/app/portal/matching/radar/page.test.tsx` PASS.

---

## DELTA-CR-2026-10-30: Cơ Chế Kích Hoạt Radar AI & Xử Lý Trạng Thái Chờ (Radar AI Activation Guard & Empty State)

> **Căn cứ thay đổi**: Quyết định `PO-DEC-20261030-01` & `PO-DEC-20261030-02`; Kế hoạch Đợt 1 kiểm soát điều kiện kích hoạt Radar AI và chuẩn hóa trải nghiệm người dùng đại chúng (`PUBLIC_USER`).

### 1. Bối Cảnh & Lý Do Thay Đổi
1. **Lỗ hổng logic kích hoạt matching**: Radar Ghép Nối AI (`/portal/matching/radar`) được thiết kế để gợi ý nguồn cung (`OFFER`) khớp với nhu cầu của bên mua. Tuy nhiên, khi một tài khoản mới đăng ký (`PUBLIC_USER` hoặc `BUYER` mới) chưa từng tạo bất kỳ nhu cầu công nghệ nào, hệ thống hoặc bị crash, hoặc hiển thị kết quả giả định (dummy mock data), hoặc hiển thị bảng rỗng gây hụt hẫng cho người dùng.
2. **Yêu cầu phân tích có căn cứ (No Zero-Input Hallucination)**: Thuật toán AI matching dựa trên 4 trọng số ($BaseSectorScore$, $TrlCompatibility$, $TniBoost$, $IpTrustBoost$) bắt buộc phải có ít nhất 1 vector nhu cầu (`Demand`) từ phía người dùng để tính toán độ tương đồng và xếp hạng nguồn cung tương ứng.

### 2. Yêu Cầu Kỹ Thuật Chi Tiết (Technical Requirements)
- **`REQ-DEL-08-01` (Điều Kiện Kích Hoạt Radar AI - Radar AI Activation Guard)**:
  - Khi người dùng truy cập màn hình `/portal/matching/radar`, hệ thống MUST kiểm tra số lượng nhu cầu công nghệ của tài khoản hiện tại (`userDemandsCount`).
  - **Điều kiện kích hoạt**: Tài khoản bắt buộc phải có $\ge 1$ nhu cầu công nghệ đã khởi tạo trong hệ thống (chấp nhận cả trạng thái `PENDING` hoặc `VERIFIED` trong schema `demand`).
  - Nếu `userDemandsCount == 0`: Hệ thống chặn thực thi truy vấn gợi ý ghép nối và kích hoạt giao diện chờ kích hoạt chuyên biệt (Radar AI Activation Empty State).
- **`REQ-DEL-08-02` (Giao Diện Trạng Thái Chờ Kích Hoạt Thân Thiện - Activation Empty State)**:
  - Khi chưa đủ điều kiện kích hoạt ($Demands = 0$), màn hình Radar AI MUST hiển thị khối giao diện trực quan hướng dẫn người dùng:
    1. Hình minh họa trực quan (Hero Illustration) về cơ chế ghép nối cung–cầu thông minh bằng thuật toán AI 4 chiều.
    2. Thông điệp giải thích: *"Bạn chưa có nhu cầu công nghệ nào được ghi nhận. Hãy đăng nhu cầu kỹ thuật đầu tiên để Radar AI quét và tự động gợi ý các giải pháp, công nghệ chào bán phù hợp nhất!"*.
    3. Nút kêu gọi hành động CTA nổi bật: **"Tạo Nhu Cầu Để Kích Hoạt Radar AI"** (kích hoạt mở `QuickDemandModal` trực tiếp hoặc chuyển hướng sang trang `/nhu-cau-cong-nghe/dang-tin`).
    4. Khối câu hỏi thường gặp hoặc 3 bước đơn giản: (1) Đăng nhu cầu $\rightarrow$ (2) AI phân tích $\rightarrow$ (3) Nhận đề xuất giải pháp.
  - Tuyệt đối KHÔNG render bảng dữ liệu rỗng vô cảm, spinner treo vô tận hoặc danh sách kết quả giả định (mock data).

### 3. Quy Tắc Nghiệp Vụ (Business Rules)
- **`BR-DEL-08-01` (Quy Tắc Kích Hoạt & Ràng Buộc Dữ Liệu Radar AI - Radar Activation & Binding Rule)**:
  - **Single Source of Truth về số lượng Nhu cầu**: Số lượng nhu cầu của tài khoản được xác thực thông qua API backend thật (`GET /api/v1/demands/my-demands` hoặc trường `totalDemands` của người dùng).
  - **Kích hoạt tức thì (Real-time Activation)**: Ngay sau khi người dùng nộp thành công nhu cầu công nghệ đầu tiên qua `QuickDemandModal` (kể cả ở trạng thái `PENDING`), cờ kích hoạt được mở ngay lập tức; khi người dùng quay lại `/portal/matching/radar`, màn hình tự động chuyển sang trạng thái phân tích và hiển thị danh bạ ứng viên ghép nối.
  - **Bình đẳng kích hoạt đa vai trò (Multi-Role Enforcement)**: Quy tắc kích hoạt này áp dụng nhất quán cho mọi vai trò có quyền truy cập Radar (`PUBLIC_USER`, `BUYER`, `ENTERPRISE`, `VERIFIED_EXPERT`).

### 4. Tiêu Chuẩn Chấp Thuận Nghiệm Thu (Acceptance Criteria)
- **`AC-DEL-08-01` (Zero-Demand User Enters Radar AI)**:
  - **Given** người dùng mới đăng nhập (`PUBLIC_USER` hoặc `BUYER`) chưa có nhu cầu công nghệ nào trong CSDL ($demandsCount = 0$),
  - **When** người dùng truy cập `/portal/matching/radar`,
  - **Then** màn hình hiển thị khối Activation Empty State với đầy đủ thông điệp hướng dẫn và nút CTA `"Tạo Nhu Cầu Để Kích Hoạt Radar AI"`, không tải API matching và không hiển thị card kết quả rác.
- **`AC-DEL-08-02` (Activate Radar Upon Demand Submission)**:
  - **Given** người dùng đang ở Activation Empty State trên `/portal/matching/radar`,
  - **When** người dùng nhấp vào nút CTA và hoàn tất nộp một nhu cầu công nghệ qua `QuickDemandModal`,
  - **Then** giao diện Radar AI cập nhật trạng thái đã kích hoạt, nạp dữ liệu gợi ý nguồn cung khớp với nhu cầu vừa tạo.
- **`AC-DEL-08-03` (100% Test Coverage)**:
  - Test suite kiểm thử kiểm chứng được cả 2 trạng thái: khi $demandsCount = 0$ (render Activation Empty State) và khi $demandsCount \ge 1$ (render Radar Grid với XAI explainability).

### 5. Ma Trận Truy Vết Khép Kín (Traceability Matrix)
| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-DEL-08-01** | `BR-DEL-08-01` | `AC-DEL-08-01` | `src/app/portal/matching/radar/page.tsx` | `radar-activation.test.tsx` |
| **REQ-DEL-08-02** | `BR-DEL-08-01` | `AC-DEL-08-02`, `AC-DEL-08-03` | `src/app/portal/matching/radar/page.tsx`, `components/radar/RadarActivationEmptyState.tsx` | `radar-activation.test.tsx` |

---

## DELTA-CR-2026-10-30-02: Chuẩn Hóa Tiền Tệ & Triệt Tiêu Mock Ngân Sách Brokerage (CR-2026-012)

> **Căn cứ thay đổi**: Quyết định PO `PO-DEC-20261030-03`; Change Request [`CR-2026-012`](../../docs/change-requests/CR-2026-012-brokerage-dealroom-budget-alignment.md); Basic Design Delta [`BD_DELTA_CR_024`](../../../Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/BD_DELTA_CR_024_CHUAN_HOA_NGAN_SACH_DEALROOM.md).  
> **Trọng tâm Đợt 3**: Triệt tiêu toàn bộ giá trị mặc định cứng (`proposedBudget = '800 triệu - 1.2 tỷ VNĐ'`, tên công ty mẫu, tên nhân sự giả lập), đồng bộ công thức format tiền tệ động (Triệu VNĐ / Tỷ VNĐ) trên toàn bộ hệ thống Brokerage & Deal Room.

### 1. Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)
- **`REQ-DEL-08-03` (Triệt Tiêu Mock Khởi Tạo Trong Connection Request Modal)**:
  - Khi mở `ConnectionRequestModal`:
    * Trường `senderOrgName` MUST được khởi tạo từ thông tin người dùng đăng nhập (`authClient.getUser()?.organizationName`). Nếu chưa có tổ chức, để trống `""`. Tuyệt đối CẤM gán cứng `'Công ty CP Nông Nghiệp Xanh Hà Nội'`.
    * Trường `proposedBudget` MUST khởi tạo chuỗi rỗng `""`. Placeholder: `"VD: 500 triệu - 1 tỷ VNĐ, hoặc Thỏa thuận"`. Cho phép người dùng nhập tự do hoặc chọn kế thừa từ ngân sách bài toán. Tuyệt đối CẤM gán cứng `'800 triệu - 1.2 tỷ VNĐ'`.
    * Trường `message` MUST khởi tạo chuỗi rỗng `""`. Placeholder: `"Mô tả mục tiêu thử nghiệm, bối cảnh bài toán và mong muốn phối hợp..."`. Buộc người dùng tự nhập nội dung thật (tối thiểu 10 ký tự). CẤM gán sẵn lời nhắn mẫu giả lập.
- **`REQ-DEL-08-04` (Quy Chuẩn Hiển Thị Tiền Tệ Động Triệu/Tỷ VNĐ Toàn Sàn)**:
  - Mọi số liệu tiền tệ tính từ `estimatedValueMillionVnd` (CSDL PostgreSQL schema `brokerage`) trên các màn hình Pipeline (`/portal/opportunities/pipeline`), Cổng Giám Sát Sở (`/gov/opportunities`), Deal Room (`/portal/opportunities/[id]/deal-room`), và MOU Modal MUST được định dạng qua hàm dùng chung:
    * Khi giá trị $\ge 1.000$ Triệu VNĐ: Hiển thị định dạng Tỷ VNĐ (ví dụ: `2.400` Triệu $\rightarrow$ `2,4 Tỷ VNĐ`).
    * Khi giá trị $< 1.000$ Triệu VNĐ: Hiển thị định dạng Triệu VNĐ (ví dụ: `800` Triệu $\rightarrow$ `800 Triệu VNĐ`).
    * Khi giá trị $= 0$ hoặc `null`: Hiển thị `"0 VNĐ"` hoặc `"Thương lượng"`.
- **`REQ-DEL-08-05` (Chuẩn Hóa Người Dùng Thật Trong Deal Room & Biên Bản MOU)**:
  - Trong `DealRoomPage`: Trường `senderName` MUST khởi tạo từ `authClient.getUser()?.fullName` hoặc placeholder tương ứng. Xóa bỏ vĩnh viễn chuỗi cứng `'Kỹ sư Vũ Quang Hải'`.
  - Trong `MouModal`: Loại bỏ fallback ảo `1000` triệu VNĐ. Nếu cơ hội chưa có ngân sách, hiển thị chuỗi *"thỏa thuận theo phụ lục hợp đồng"*.

### 2. Quy Tắc Nghiệp Vụ Bổ Sung (Business Rules)
- **`BR-DEL-08-02` (Ràng Buộc Xác Thực Yêu Cầu Kết Nối - Zero-Mock Request Validation)**:
  - Yêu cầu kết nối chỉ hợp lệ khi: `senderOrgName` có ít nhất 3 ký tự, `message` có ít nhất 10 ký tự. Không cho phép submit form rỗng hoặc bypass client validation.
- **`BR-DEL-08-03` (Tính Toàn Vẹn Số Liệu Tiền Tệ SSOT - Currency SSOT Invariant)**:
  - Không được phép tự ý sinh ra số tiền giả định (dummy amount) khi CSDL trả về `null`. Mọi thẻ KPI tổng giá trị dự kiến phải tính toán từ tổng các deal thật trong phễu cơ hội.

### 3. Tiêu Chí Chấp Thuận Nghiệm Thu (Acceptance Criteria)
- **`AC-DEL-08-04`**: Mở `ConnectionRequestModal`, form khởi tạo sạch rỗng, không có text mẫu gán trước, placeholder gợi ý rõ ràng.
- **`AC-DEL-08-05`**: Tổng giá trị cơ hội tại Pipeline và Cổng Giám Sát Sở hiển thị chuẩn dynamic: tự động chuyển thành `"X,X Tỷ VNĐ"` khi $\ge 1.000$ Triệu.
- **`AC-DEL-08-06`**: Deal Room nạp đúng tên người dùng đăng nhập hiện tại; MouModal không còn fallback gán số `1000`.
- **`AC-DEL-08-07`**: Bộ test suite automated Playwright và Unit test cho Brokerage & Deal Room pass 100%.

### 4. Ma Trận Truy Vết Bổ Sung (Traceability Matrix Delta)
| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Tệp Nguồn Triển Khai (Source Code) | Kiểm Thử Kiểm Chứng (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-DEL-08-03** | `BR-DEL-08-02` | `AC-DEL-08-04` | `app/portal/matching/radar/ConnectionRequestModal.tsx` | `ConnectionRequestModal.test.tsx` |
| **REQ-DEL-08-04** | `BR-DEL-08-03` | `AC-DEL-08-05` | `lib/utils.ts` (hoặc `currency.ts`), `pipeline/page.tsx`, `gov/opportunities/page.tsx` | `pipeline.test.tsx`, `gov-opportunities.test.tsx` |
| **REQ-DEL-08-05** | `BR-DEL-08-02` | `AC-DEL-08-06`, `AC-DEL-08-07` | `deal-room/page.tsx`, `deal-room/MouModal.tsx` | `deal-room.test.tsx` |

---

## DELTA-CR-2026-012: Enriched Connection Request Details & Scoped Pipeline

> **Căn cứ thay đổi**: 
> 1. Quyết định `PO-DEC-20261030-05` & Change Request `CR-2026-012`.
> 2. Tài liệu Thiết Kế Cơ Sở `Specification/BASIC_DESIGN_NACENTECH.md` (Mục 5.4 & Mục 17).
> 3. Căn cứ pháp lý: Nghị định số 13/2023/NĐ-CP (PDPD) về bảo vệ dữ liệu cá nhân trong giao dịch điện tử.

### 1. Bối Cảnh & Vấn Đề Nghiệp Vụ
1. **Thiếu ngữ cảnh khi tiếp nhận kết nối**: Trước đây, Bên Bán (Seller) khi nhận yêu cầu kết nối chỉ nhìn thấy thông tin sơ sài (tên công ty bên mua, ngày gửi), không thể biết bên mua đang quan tâm đến sản phẩm/công nghệ nào trong danh mục chào bán của mình, bài toán cụ thể và quy mô của bên mua ra sao để cân nhắc chấp thuận hay từ chối.
2. **Yêu cầu bảo vệ dữ liệu cá nhân (PDPD Compliance)**: Thông tin liên hệ trực tiếp của cá nhân đại diện bên mua (Số điện thoại, Email cá nhân, số CCCD) phải được che mờ (Masked) trong suốt giai đoạn `PENDING`. Chỉ khi Bên Bán chính thức bấm "Chấp thuận kết nối" (`ACCEPTED`), hệ thống mới được phép gỡ mặt nạ (Unmask) để hai bên trao đổi.
3. **Rò rỉ dữ liệu phễu cơ hội (Cross-Tenant Opportunity Leak / IDOR)**: Danh sách yêu cầu kết nối và bảng Kanban Pipeline phải được cô lập (Scoped) tuyệt đối theo ngữ cảnh tổ chức của Bên Bán (`seller_organization_id = CurrentUser.OrganizationId`). Tuyệt đối không để Seller này nhìn thấy yêu cầu kết nối hoặc số liệu phễu cơ hội của Seller khác.

### 2. Yêu Cầu Chức Năng Bổ Sung (Functional Requirements)

- **`REQ-BRK-07: Xem Chi Tiết Yêu Cầu Kết Nối Kèm Sản Phẩm Mục Tiêu Và Hồ Sơ Bên Mua`**:
  * **Điểm neo giao diện**: Tại danh sách yêu cầu kết nối (`/portal/connections` hoặc tab Yêu cầu kết nối trong Workspace Seller), mỗi bản ghi yêu cầu có nút tác vụ **"Xem chi tiết"**.
  * **Modal Chi Tiết Yêu Cầu Kết Nối (`UI-CONN-REQ-DETAIL-001`)**: Khi người dùng nhấp vào "Xem chi tiết", hệ thống mở Modal hiển thị trọn vẹn 3 khối thông tin:
    1. **Khối 1: Sản Phẩm / Công Nghệ Mục Tiêu (`TargetOffer`)**:
       - Tiêu đề chào bán (`offer_title`).
       - Mã số chào bán (`offer_code`).
       - Mức độ sẵn sàng công nghệ TRL (1–9) kèm huy hiệu màu sắc trực quan (Lab: TRL 1-3 [Xám], Pilot: TRL 4-6 [Vàng], Thương mại: TRL 7-9 [Xanh lá]).
       - Tình trạng quyền sở hữu trí tuệ (`ip_status`: Đã cấp bằng sáng chế / Đang nộp đơn / Bí quyết kỹ thuật).
       - Ngành / Lĩnh vực công nghệ chuẩn TT17 / VSIC.
    2. **Khối 2: Hồ Sơ Pháp Nhân Bên Mua (`BuyerProfile`)**:
       - Tên doanh nghiệp / tổ chức bên mua (`company_name`).
       - Mã số thuế (`tax_code`).
       - Lĩnh vực kinh doanh chính.
       - Tỉnh / Thành phố trụ sở chính.
       - Quy mô doanh nghiệp (Số lao động, dải doanh thu / vốn).
    3. **Khối 3: Đề Xuất Hợp Tác & Thông Tin Liên Hệ (PDPD-compliant)**:
       - Ngân sách đề xuất: Định dạng động Triệu/Tỷ VNĐ theo quy chuẩn SSOT (`formatCurrencyVnd`).
       - Lời nhắn / Mục tiêu thử nghiệm & hợp tác (`message`).
       - Thời điểm gửi yêu cầu (`created_at`) và bộ đếm thời hạn SLA phản hồi 48h (`sla_deadline`).
       - Trạng thái yêu cầu: `PENDING` (Chờ phản hồi), `ACCEPTED` (Đã chấp thuận), `REJECTED` (Đã từ chối).
       - Thông tin người liên hệ: Áp dụng quy tắc Masking PDPD theo `BR-BRK-07`.
  * **Hành Động Trực Tiếp Trên Modal**:
    - Khi trạng thái là `PENDING` và người dùng có vai trò `SELLER`:
      * Nút CTA 1: **"Chấp thuận kết nối"** (Màu xanh chủ đạo): Gửi lệnh cập nhật trạng thái sang `ACCEPTED`, gỡ bỏ mặt nạ PDPD, tự động sinh Cơ hội (Opportunity) mới trên Pipeline và kích hoạt lối tắt "Vào Deal Room 1-1".
      * Nút CTA 2: **"Từ chối kết nối"** (Màu viền đỏ): Mở khung nhập lý do từ chối (bắt buộc $\ge 10$ ký tự), gửi lệnh cập nhật trạng thái `REJECTED`, duy trì mặt nạ PDPD.
    - Khi trạng thái là `ACCEPTED`: Hiển thị nút CTA **"Truy cập Deal Room 1-1"** dẫn tới `/portal/opportunities/[id]/deal-room`.
    - Khi trạng thái là `REJECTED`: Hiển thị khối thông báo lý do từ chối đã ghi nhận.

- **`REQ-BRK-08: Cô Lập Dữ Liệu Thống Kê Phễu Cơ Hội Và Yêu Cầu Kết Nối Theo Organization Context Của Seller`**:
  * **Scoped Data cho Seller**: Mọi dữ liệu về yêu cầu kết nối (`connection_requests`), thẻ cơ hội Kanban (`opportunities`) và số liệu KPI phễu cơ hội (`stats`) trả về cho Seller bắt buộc phải được lọc nghiêm ngặt theo `seller_organization_id = CurrentUser.OrganizationId`.
  * **Thanh Bộ Lọc Trạng Thái Đa Tuyến (`UI-CONN-REQ-FILTER-001`)**: Tại màn hình danh sách yêu cầu kết nối, cung cấp thanh điều hướng 4 tab trạng thái:
    1. **Tất cả (`ALL`)**: Toàn bộ yêu cầu kết nối thuộc tổ chức Seller.
    2. **Chờ phản hồi (`PENDING`)**: Danh sách các yêu cầu đang chờ Seller xử lý (kèm badge số lượng chờ phản hồi).
    3. **Đã chấp thuận (`ACCEPTED`)**: Danh sách các yêu cầu đã đồng thuận mở kết nối.
    4. **Đã từ chối (`REJECTED`)**: Danh sách các yêu cầu đã từ chối hợp tác.
  * Khi người dùng nhấp chọn tab, bảng dữ liệu lọc lập tức theo `status` tương ứng, hỗ trợ phân trang chuẩn xác.

### 3. Quy Tắc Nghiệp Vụ Bổ Sung (Business Rules)

- **`BR-BRK-07: PDPD Contact Masking Trên Yêu Cầu Kết Nối`**:
  * Căn cứ: Nghị định số 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân.
  * **Logic Masking theo trạng thái**:
    - Trạng thái `PENDING`:
      * Số điện thoại: Mask dạng `09****1234` (giữ 2 chữ số đầu mạng và 4 chữ số cuối; che mờ 4 chữ số giữa bằng dấu `*`).
      * Email cá nhân: Mask dạng `a***@domain.com` (giữ ký tự đầu của username và toàn bộ domain phía sau `@`).
      * Số CMND/CCCD/Định danh cá nhân: Tuyệt đối không hiển thị (thay bằng `[Được bảo vệ theo NĐ 13/2023/NĐ-CP]`).
      * **Nguyên tắc Zero-Leak DTO**: Việc mask bắt buộc phải thực hiện tại tầng Backend DTO projection (`ConnectionRequestDetailDto`). Tuyệt đối CẤM trả plaintext về trình duyệt rồi mới dùng CSS/JS che mờ.
    - Trạng thái `ACCEPTED`:
      * Sau khi Seller bấm Chấp thuận (chứng minh sự đồng thuận kết nối giữa 2 bên theo Điều 9 & Điều 11 NĐ 13/2023/NĐ-CP), Backend giải phóng mặt nạ và trả về thông tin liên hệ đầy đủ (`phoneNumber`, `email`, `contactPersonName`).
    - Trạng thái `REJECTED`:
      * Duy trì che mờ vĩnh viễn thông tin liên hệ, không cho phép gỡ mặt nạ dưới mọi hình thức.

- **`BR-BRK-08: Quy Tắc Truy Vấn Scoping (Seller / Buyer / Admin)`**:
  * **Bên Bán (Seller Scoping)**:
    - Mệnh đề lọc cưỡng chế: `WHERE cr.seller_organization_id = @CurrentUserOrgId`.
    - Seller chỉ được xem các yêu cầu kết nối gửi tới sản phẩm của mình và cơ hội trong phễu của mình.
    - Nếu Seller cố tình gửi request xem chi tiết (`GET /api/v1/brokerage/requests/{id}`) của một yêu cầu thuộc Seller khác, Backend ném mã lỗi `403 Forbidden` (`ERR_FORBIDDEN_SCOPE_ACCESS`).
  * **Bên Mua (Buyer Scoping)**:
    - Mệnh đề lọc cưỡng chế: `WHERE cr.buyer_organization_id = @CurrentUserOrgId`.
    - Buyer chỉ xem các yêu cầu do tổ chức mình khởi tạo.
  * **Cán Bộ Quản Trị / Sở KH&CN (Admin & Gov Scoping)**:
    - Vai trò `PROVINCIAL_ADMIN` / `CLUSTER_ADMIN`: Scoping theo địa bàn tỉnh/thành `WHERE (buyer_org.province_code = @ProvinceCode OR seller_org.province_code = @ProvinceCode)`.
    - Vai trò `SUPER_ADMIN` / `OPERATOR_ADMIN`: Global Scope (toàn quyền xem toàn quốc để điều phối và xử lý khiếu nại).
  * **Cơ Chế Khóa Bảo Mật (Security Invariant)**: Backend trích xuất `OrganizationId` trực tiếp từ Claims của Bearer JWT Token của người dùng đang đăng nhập, tuyệt đối KHÔNG chấp nhận tham số `orgId` hoặc `sellerId` từ query string client gửi lên.

### 4. Hành Trình Người Dùng Bổ Sung (User Journeys)

#### User Journey 6: Seller Xem Chi Tiết Yêu Cầu Kết Nối Kèm Thông Tin Sản Phẩm, Hồ Sơ Bên Mua & Chấp Thuận Hợp Tác
1. **Truy cập danh sách**: Đại diện Bên Bán (`SELLER`) đăng nhập vào hệ thống, truy cập màn hình Quản lý Yêu cầu Kết nối (`/portal/connections`).
2. **Nhận diện yêu cầu mới**: Seller nhìn thấy một dòng yêu cầu kết nối có nhãn trạng thái `Chờ phản hồi (PENDING)` từ Bên Mua.
3. **Mở modal chi tiết**: Seller nhấp vào nút tác vụ "Xem chi tiết". Modal `UI-CONN-REQ-DETAIL-001` xuất hiện:
   - Thấy rõ thông tin sản phẩm mục tiêu: "Hệ thống sấy lạnh bơm nhiệt đa tầng (Mã: SP-2026-088, TRL 8, Đã cấp bằng sáng chế, Lĩnh vực Cơ khí - Nông nghiệp)".
   - Thấy hồ sơ doanh nghiệp bên mua: "Công ty TNHH Chế Biến Nông Sản Tây Nguyên", MST: `6001234567`, Địa chỉ: TP. Buôn Ma Thuột, Đắk Lắk, Quy mô: 120 nhân sự.
   - Thấy thông tin liên hệ được bảo vệ PDPD: SĐT `09****7890`, Email `t***@taynguenagri.vn`, kèm nhãn thông báo tuân thủ NĐ 13/2023/NĐ-CP.
   - Thấy đề xuất hợp tác: Ngân sách `1,5 Tỷ VNĐ`, Lời nhắn: "Chúng tôi cần ứng dụng thử nghiệm dây chuyền sấy hạt mắc-ca tại xưởng Buôn Ma Thuột...".
4. **Quyết định chấp thuận**: Seller nhận thấy bài toán phù hợp với năng lực công nghệ của mình, nhấp vào nút "Chấp thuận kết nối".
5. **Kích hoạt Deal Room**: Hệ thống cập nhật trạng thái `ACCEPTED`, gỡ mặt nạ PDPD hiển thị SĐT `0918237890` và Email `tuan.le@taynguyenagri.vn`, đồng thời tự động khởi tạo Cơ hội hợp tác trên Kanban Pipeline và hiển thị nút "Vào Deal Room 1-1".

#### User Journey 7: Seller Lọc Yêu Cầu Kết Nối Theo Trạng Thái & Đối Soát Scoped Pipeline
1. **Lọc trạng thái**: Seller sử dụng thanh 4 tabs trạng thái (`UI-CONN-REQ-FILTER-001`):
   - Nhấp tab "Chờ phản hồi": Bảng chỉ hiển thị các yêu cầu `PENDING` cần xử lý.
   - Nhấp tab "Đã chấp thuận": Bảng chỉ hiển thị các yêu cầu `ACCEPTED` đã đồng ý kết nối.
   - Nhấp tab "Đã từ chối": Bảng hiển thị các yêu cầu `REJECTED` đã từ chối kèm lý do.
   - Nhấp tab "Tất cả": Bảng hiển thị toàn bộ lịch sử yêu cầu.
2. **Kiểm tra Scoped Pipeline**: Seller chuyển sang màn hình Pipeline (`/portal/opportunities/pipeline`). Bảng Kanban và 4 thẻ KPI chỉ phản ánh các cơ hội thuộc sở hữu của riêng tổ chức Seller này, đảm bảo tính bảo mật dữ liệu thương mại tuyệt đối.

### 5. Tiêu Chuẩn Chấp Thuận Nghiệm Thu Bổ Sung (Acceptance Criteria)

- **`AC-BRK-07-01 (Mở Modal Chi Tiết Yêu Cầu Kết Nối Đầy Đủ)`**:
  * **Given** người dùng là Seller đang ở danh sách yêu cầu kết nối,
  * **When** nhấp vào nút "Xem chi tiết" của một yêu cầu kết nối,
  * **Then** Modal `UI-CONN-REQ-DETAIL-001` mở ra và hiển thị đầy đủ 3 khối: Thông tin sản phẩm mục tiêu (tiêu đề, mã, TRL, SHTT), Hồ sơ doanh nghiệp bên mua (tên, MST, tỉnh thành, quy mô), và Chi tiết đề xuất (ngân sách, lời nhắn, ngày gửi, hạn SLA).
- **`AC-BRK-07-02 (PDPD Masking Khi Chờ Phản Hồi)`**:
  * **Given** yêu cầu kết nối đang ở trạng thái `PENDING`,
  * **When** Modal chi tiết được mở ra,
  * **Then** số điện thoại người đại diện hiển thị dạng mask `09****XXXX`, email hiển thị `X***@domain.com`, số CMND/CCCD được ẩn hoàn toàn; Backend API DTO không chứa dữ liệu PII dạng plaintext.
- **`AC-BRK-07-03 (PDPD Unmasking Khi Đã Chấp Thuận)`**:
  * **Given** yêu cầu kết nối chuyển sang trạng thái `ACCEPTED` (do Seller bấm "Chấp thuận kết nối"),
  * **When** Modal chi tiết hiển thị lại hoặc người dùng xem chi tiết yêu cầu đã chấp thuận,
  * **Then** số điện thoại và email của người đại diện bên mua được hiển thị đầy đủ (Unmasked), đồng thời xuất hiện nút điều hướng "Vào Deal Room 1-1".
- **`AC-BRK-07-04 (Xử Lý Từ Chối Kèm Lý Do)`**:
  * **Given** yêu cầu kết nối đang ở trạng thái `PENDING`,
  * **When** Seller nhấp "Từ chối kết nối", nhập lý do từ chối ($\ge 10$ ký tự) và xác nhận,
  * **Then** yêu cầu chuyển sang trạng thái `REJECTED`, thông tin liên hệ duy trì che mờ, lý do từ chối được lưu trữ và thông báo cho Bên Mua.
- **`AC-BRK-08-01 (Cô Lập Yêu Cầu Kết Nối Theo Ngữ Cảnh Tổ Chức Của Seller)`**:
  * **Given** tài khoản Seller thuộc Tổ chức X đăng nhập,
  * **When** tải danh sách yêu cầu kết nối (`GET /api/v1/brokerage/requests`),
  * **Then** 100% bản ghi trả về có `seller_organization_id == X.Id`; không bao giờ rò rỉ bất kỳ yêu cầu kết nối nào gửi tới Tổ chức Y của Seller khác.
- **`AC-BRK-08-02 (Cô Lập Thống Kê Phễu Cơ Hội Kanban)`**:
  * **Given** Seller thuộc Tổ chức X truy cập Pipeline (`/portal/opportunities/pipeline`),
  * **When** hệ thống tính toán các chỉ số KPI phễu cơ hội (Tổng cơ hội, Chờ phản hồi, Đang đàm phán, Tổng giá trị dự kiến),
  * **Then** toàn bộ số liệu chỉ được tổng hợp từ các cơ hội mà Tổ chức X là Bên Bán.
- **`AC-BRK-08-03 (Bộ Lọc 4 Tabs Trạng Thái Yêu Cầu Kết Nối)`**:
  * **Given** người dùng đang ở danh sách yêu cầu kết nối,
  * **When** nhấp chọn lần lượt các tab: `Tất cả`, `Chờ phản hồi`, `Đã chấp thuận`, `Đã từ chối`,
  * **Then** bảng dữ liệu lọc lập tức theo đúng trạng thái đã chọn, hiển thị badge đếm số lượng bản ghi chính xác.

### 6. Danh Mục API Endpoints & CSDL Bổ Sung

- **`API-BRK-REQ-002: GET /api/v1/brokerage/requests/{id}`**:
  * Lấy chi tiết yêu cầu kết nối kèm thông tin sản phẩm mục tiêu và hồ sơ bên mua.
  * Backend kiểm tra quyền Scoping (`BR-BRK-08`) và thực hiện Masking dữ liệu cá nhân PDPD (`BR-BRK-07`) theo trạng thái.
- **`API-BRK-REQ-003: GET /api/v1/brokerage/requests`**:
  * Lấy danh sách yêu cầu kết nối hỗ trợ lọc theo tham số `status` (`ALL`, `PENDING`, `ACCEPTED`, `REJECTED`) và tự động áp dụng Scoping theo `seller_organization_id` trích xuất từ JWT Claims.
- **`DB-BRK-CONN-REQ-001 (CSDL PostgreSQL schema brokerage)`**:
  * Bảng `brokerage.connection_requests`:
    - Khóa ngoại `target_offer_id` liên kết tới bảng `supply.offers`.
    - Khóa ngoại `demand_id` liên kết tới bảng `demand.tickets`.
    - Khóa ngoại `buyer_organization_id` liên kết tới bảng `auth.organizations`.
    - Khóa ngoại `seller_organization_id` liên kết tới bảng `auth.organizations`.
    - Trường `rejection_reason` (`TEXT`, nullable): Lưu lý do từ chối kết nối.
    - Trường `sla_deadline` (`TIMESTAMPTZ`): Thời hạn SLA 48h từ lúc tạo yêu cầu.

### 7. Ma Trận Truy Vết Khép Kín Delta CR-2026-012 (Traceability Matrix)

| Yêu Cầu Chức Năng (REQ) | Quy Tắc Nghiệp Vụ (BR) | Tiêu Chí Chấp Thuận (AC) | Thành Phần UI (UI Component) | Hợp Đồng API (API Endpoint) | Thực Thể CSDL (DB Schema) | Kiểm Thử Tự Động (Automated Tests) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-BRK-07** | `BR-BRK-07`, `BR-BRK-08` | `AC-BRK-07-01`, `AC-BRK-07-02`, `AC-BRK-07-03`, `AC-BRK-07-04` | `UI-CONN-REQ-DETAIL-001` (`ConnectionRequestDetailModal.tsx`) | `API-BRK-REQ-002` (`GET /requests/{id}`), `PUT /requests/{id}/respond` | `DB-BRK-CONN-REQ-001` (`brokerage.connection_requests`) | `ConnectionRequestDetailModal.test.tsx`, `pdpd-masking.test.ts` |
| **REQ-BRK-08** | `BR-BRK-08` | `AC-BRK-08-01`, `AC-BRK-08-02`, `AC-BRK-08-03` | `UI-CONN-REQ-FILTER-001` (`ConnectionRequestTabs.tsx`), `pipeline/page.tsx` | `API-BRK-REQ-003` (`GET /requests?status=...`), `GET /pipeline` | `DB-BRK-CONN-REQ-001` (`brokerage.connection_requests`), `opportunities` | `scoped-pipeline.test.tsx`, `connection-requests-filter.test.tsx` |


