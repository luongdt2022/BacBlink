# Feature Specification: TASK-08 Kết Nối Cung–Cầu & Quản Lý Cơ Hội Hợp Tác

**Feature Branch**: `brokerage-matching-dealroom`  
**Feature Directory**: `specs/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
**Created**: 11/10/2026  
**Status**: `Shipped` (Gate 5 Quality Gate Sign-off — QC 4-Tier Zero-Mock Passed)  
**Ánh Xạ Basic Design**: [`Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/README.md`](../../Specification/02_BASIC_DESIGN/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI/README.md)  
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
