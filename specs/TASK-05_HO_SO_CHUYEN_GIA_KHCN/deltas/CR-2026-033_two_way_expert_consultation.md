# Change Request: CR-2026-033 Quản Lý 2 Chiều Yêu Cầu Kết Nối & Tư Vấn Chuyên Gia R&D (Two-Way Expert Consultation Workflow)

**CR-ID**: CR-2026-033  
**Epic**: `TASK-05_HO_SO_CHUYEN_GIA_KHCN`  
**Status**: COMPLETED_AND_VERIFIED  
**Target Version**: 1.21.0  
**Author**: Senior BA (`nacen-ba` — `speckit-delta`, `ba-srs`)  
**Date**: 2026-11-13  
**Verified Date**: 2026-11-13 (Gate 4 & 5 Approved)  
**Baseline**: Living Spec v1.20.0 (`CR-2026-032`)  
**Căn cứ Thiết kế cơ sở**:
- `Specification/BASIC_DESIGN_NACENTECH.md` Mục 37 (`PO-DEC-20261113-02`).

---

### 1. Bối Cảnh & Lý Do Thay Đổi (Why)

1. **Form Public gửi yêu cầu tư vấn chưa lưu DB thật & chưa sinh mã phiếu (`ticket_code`)**:
   - *Hiện trạng cũ (As-Is)*: Endpoint `POST /api/v1/public/experts/{expertCode}/consultation-requests` chỉ bắn notification cho Admin, **không ghi dữ liệu vào CSDL** `brokerage.expert_consultations`.
   - *Đề xuất mới (To-Be)*: Ghi dữ liệu thật vào `brokerage.expert_consultations`, sinh mã phiếu `ticket_code` định dạng `REQ-CON-YYYY-XXXXXX`, định tuyến thẳng vào Hộp thư Chuyên gia (`/portal/expert/consultations`) và đồng thời gửi notification cho Admin giám sát.
2. **Hộp thư Chuyên gia dùng dữ liệu mẫu giả (Auto-seed) & thiếu phản hồi ngược**:
   - *Hiện trạng cũ (As-Is)*: `/portal/expert/consultations` đang auto-seed 6 bản ghi mẫu (mock/seed data) và khi Chuyên gia xử lý yêu cầu **không bắn phản hồi ngược** về người gửi.
   - *Đề xuất mới (To-Be)*: Gỡ bỏ hoàn toàn cơ chế auto-seed 6 bản ghi mẫu trên luồng vận hành thực tế (Zero-Mock). Chuyên gia thực hiện `ACCEPT` (đặt lịch hẹn, link họp, ghi chú) hoặc `REJECT` (bắt buộc nhập lý do `>= 10` ký tự) $\rightarrow$ cập nhật DB và bắn notification phản hồi ngược về `requester_person_id` (nếu có) và Admin.
3. **Thiếu màn hình theo dõi phía Buyer/Doanh nghiệp & hỗ trợ khách vãng lai**:
   - *Hiện trạng cũ (As-Is)*: Người dùng đã đăng nhập (`PUBLIC_USER`, `BUYER`, `ENTERPRISE`, v.v.) chưa có màn hình theo dõi phiếu đã gửi, lịch hẹn, link họp hay lý do từ chối.
   - *Đề xuất mới (To-Be)*: Xây dựng màn hình `/portal/buyer/consultations` cho người dùng đã đăng nhập theo dõi trạng thái, lịch hẹn, link họp, lý do từ chối và gửi đánh giá sau khi hoàn thành (`COMPLETED`); đồng thời hỗ trợ khách vãng lai (`AllowAnonymous`) nhận `ticket_code` ngay trên UI sau khi gửi thành công (và qua email nếu có cung cấp).

---

### 2. Chi Tiết Thay Đổi Yêu Cầu Kỹ Thuật (Standardized Requirements)

#### 2.1. Yêu Cầu Chức Năng (`REQ-CON-*`)

##### [ADD] `REQ-CON-001`: Gửi Phiếu Tư Vấn Lưu DB Thật, Sinh `ticket_code` & Định Tuyến Thẳng Expert + Notify Admin
- Khi người dùng (đã đăng nhập hoặc khách vãng lai `AllowAnonymous`) gửi yêu cầu tư vấn tới một chuyên gia (`expertCode`), hệ thống MUST lưu bản ghi thật vào bảng `brokerage.expert_consultations` với trạng thái khởi tạo `PENDING`.
- Hệ thống MUST sinh mã phiếu duy nhất `ticket_code` theo định dạng `REQ-CON-YYYY-XXXXXX`.
- Nếu người gửi đã đăng nhập, hệ thống MUST lưu `requester_person_id = Actor.PersonId` (lấy từ JWT claims, không nhận giả mạo từ client payload).
- Hệ thống MUST định tuyến thẳng phiếu vào Hộp thư Chuyên gia đích (`/portal/expert/consultations`) và bắn thông báo cho cả Chuyên gia đích lẫn Admin/NacenTech đồng giám sát.

##### [ADD] `REQ-CON-002`: Chuyên Gia Tiếp Nhận & Xử Lý Phiếu Tại `/portal/expert/consultations`
- Chuyên gia đã đăng nhập xem danh sách phiếu tư vấn gửi tới mình tại `/portal/expert/consultations`.
- Chuyên gia có thể thực hiện:
  - **`ACCEPT`**: Chấp nhận tư vấn kèm thông tin lịch hẹn (`scheduledAt`), đường dẫn phòng họp (`meetingLink`) và ghi chú phản hồi (`expertNote`), chuyển trạng thái phiếu sang `ACCEPTED`.
  - **`REJECT`**: Từ chối tư vấn, bắt buộc nhập lý do từ chối (`rejectionReason`) có độ dài `>= 10` ký tự, chuyển trạng thái phiếu sang `REJECTED`.
  - **`COMPLETE`**: Đánh dấu buổi tư vấn đã hoàn thành (từ `ACCEPTED` $\rightarrow$ `COMPLETED`) để mở quyền đánh giá cho người gửi.
- Mọi thao tác xử lý của Chuyên gia MUST cập nhật trạng thái vào CSDL và bắn notification phản hồi ngược về `requester_person_id` (nếu có) và Admin.

##### [ADD] `REQ-CON-003`: Theo Dõi Phiếu Tư Vấn & Đánh Giá Sau Hoàn Thành Tại `/portal/buyer/consultations`
- Người dùng đã đăng nhập (`PUBLIC_USER`, `BUYER`, `ENTERPRISE`, v.v.) truy cập `/portal/buyer/consultations` để theo dõi danh sách phiếu tư vấn đã gửi, bao gồm: `ticket_code`, chuyên gia nhận tư vấn, trạng thái hiện tại, lịch hẹn, link họp (`meetingLink`), lý do từ chối (`rejectionReason` nếu bị `REJECTED`) và ghi chú từ chuyên gia.
- Khi phiếu ở trạng thái `COMPLETED`, người gửi đã đăng nhập có thể gửi đánh giá chất lượng tư vấn (số sao `1..5` và nhận xét).
- Khách vãng lai (`AllowAnonymous`) sau khi gửi phiếu thành công MUST nhận được `ticket_code` hiển thị ngay trên UI (và gửi thông báo qua email nếu người gửi có cung cấp địa chỉ email hợp lệ).

##### [ADD] `REQ-CON-004`: Gỡ Bỏ Auto-Seed 6 Bản Ghi Mẫu Giả (Zero-Mock)
- Loại bỏ hoàn toàn cơ chế tự động chèn/auto-seed 6 bản ghi mẫu giả vào Hộp thư tư vấn chuyên gia (`/portal/expert/consultations`) trên luồng vận hành thực tế (Frontend & Backend).
- Khi chuyên gia chưa có phiếu tư vấn thật nào trong CSDL, màn hình MUST hiển thị Empty State chuẩn xác theo quy chuẩn `<Async>` (5 UX States), tuyệt đối không fallback sang dữ liệu giả.

---

#### 2.2. Quy Tắc Nghiệp Vụ (`BR-CON-*`)

| Mã Quy Tắc | Tên Quy Tắc | Chi Tiết Ràng Buộc |
| :--- | :--- | :--- |
| **`BR-CON-001`** | Quy Tắc Sinh `ticket_code` | Mã phiếu phải tuân thủ định dạng `REQ-CON-YYYY-XXXXXX` (trong đó `YYYY` là năm hiện tại 4 chữ số, `XXXXXX` là chuỗi định danh 6 ký tự/chữ số duy nhất theo ràng buộc `UNIQUE` trong DB). |
| **`BR-CON-002`** | Validation Lý Do `REJECT` | Khi Chuyên gia chọn `REJECT`, trường `rejectionReason` (sau khi `.Trim()`) MUST có độ dài `>= 10` ký tự; nếu thiếu hoặc `< 10` ký tự, API trả về HTTP `400 Bad Request` kèm thông báo lỗi rõ ràng. |
| **`BR-CON-003`** | Chống IDOR Phía Buyer | Người gửi đã đăng nhập chỉ được xem chi tiết và gửi đánh giá cho các phiếu thỏa mãn `consultation.requester_person_id == Actor.PersonId`. Mọi truy cập trái phép trả về HTTP `403 Forbidden` / `404 Not Found`. |
| **`BR-CON-004`** | Chống IDOR Phía Expert | Chuyên gia chỉ được xem và xử lý (`ACCEPT` / `REJECT` / `COMPLETE`) các phiếu gửi tới hồ sơ của chính mình (`expertProfile.person_id == Actor.PersonId`). Mọi thao tác ngoài phạm vi trả về HTTP `403 Forbidden`. |
| **`BR-CON-005`** | Tuân Thủ PDPD Che Chắn PII | Bảo vệ thông tin liên hệ cá nhân (SĐT, Email của người gửi và chuyên gia) theo Nghị định 13/2023/NĐ-CP: che chắn/ẩn danh PII trên các projection không cần thiết hoặc trước khi giao dịch được xác lập phù hợp; không rò rỉ PII sang người dùng không có quyền. |
| **`BR-CON-006`** | Thông Báo 2 Chiều & Đánh Giá `COMPLETED` | Gửi phiếu `PENDING` $\rightarrow$ Notify Expert + Admin. Expert `ACCEPT`/`REJECT`/`COMPLETE` $\rightarrow$ Notify `requester_person_id` (nếu không null) + Admin. Chỉ cho phép Buyer gửi đánh giá 1 lần khi trạng thái phiếu là `COMPLETED`. |

---

#### 2.3. Yêu Cầu Dữ Liệu, API & Giao Diện (`DB-CON-*`, `API-CON-*`, `UI-CON-*`)

- **`DB-CON-001` — Mở Rộng Bảng `brokerage.expert_consultations`**:
  - Bổ sung/chuẩn hóa các cột phục vụ luồng 2 chiều (migration non-destructive):
    - `ticket_code` (`varchar(32)`, `UNIQUE`, `NOT NULL`) — định dạng `REQ-CON-YYYY-XXXXXX`.
    - `requester_person_id` (`uuid`, `NULL`) — khóa liên kết người gửi đã đăng nhập (`NULL` nếu khách vãng lai).
    - `scheduled_at` (`timestamptz`, `NULL`), `meeting_link` (`varchar(500)`, `NULL`), `expert_note` (`text`, `NULL`).
    - `rejection_reason` (`text`, `NULL`).
    - `rating` (`smallint`, `NULL`), `review_comment` (`text`, `NULL`), `reviewed_at` (`timestamptz`, `NULL`).
    - Chỉ mục (`INDEX`) trên `requester_person_id`, `expert_profile_id`, `status` và `UNIQUE INDEX` trên `ticket_code`.

- **`API-CON-001` — `POST /api/v1/public/experts/{expertCode}/consultation-requests`**:
  - Cho phép `AllowAnonymous` và người dùng đã đăng nhập (nếu có JWT hợp lệ thì trích xuất `Actor.PersonId` làm `requester_person_id`).
  - Lưu bản ghi thật vào `brokerage.expert_consultations`, sinh `ticket_code`, gửi notification cho Expert & Admin, trả về DTO chứa `ticketCode` và `status = "PENDING"`.

- **`API-CON-002` — `GET /api/v1/portal/expert/consultations`**:
  - Yêu cầu đăng nhập (`VERIFIED_EXPERT` / Expert owner). Lọc danh sách theo `expertProfile.person_id == Actor.PersonId` (`BR-CON-004`), hỗ trợ lọc theo trạng thái, áp dụng che chắn PII phù hợp (`BR-CON-005`).

- **`API-CON-003` — `PATCH /api/v1/portal/expert/consultations/{id}`**:
  - Yêu cầu đăng nhập Expert owner (`BR-CON-004`). Nhận action `ACCEPT` (kèm `scheduledAt`, `meetingLink`, `expertNote`), `REJECT` (bắt buộc `rejectionReason.Trim().Length >= 10` theo `BR-CON-002`), hoặc `COMPLETE`. Cập nhật DB và bắn notification 2 chiều (`BR-CON-006`).

- **`API-CON-004` — `GET /api/v1/portal/buyer/consultations`**:
  - Yêu cầu đăng nhập (`PUBLIC_USER`, `BUYER`, `ENTERPRISE`, v.v.). Chỉ trả về danh sách phiếu có `requester_person_id == Actor.PersonId` (`BR-CON-003`) kèm trạng thái, lịch hẹn, link họp, lý do từ chối và thông tin đánh giá.

- **`API-CON-005` — `POST /api/v1/portal/buyer/consultations/{id}/review`**:
  - Yêu cầu đăng nhập Buyer (`BR-CON-003`). Cho phép gửi `rating` (`1..5`) và `reviewComment` chỉ khi phiếu đang ở trạng thái `COMPLETED` và chưa từng được đánh giá (`BR-CON-006`).

- **`UI-CON-001` — Form Public Gửi Yêu Cầu Tư Vấn (`/experts/[expertCode]`)**:
  - Sau khi submit thành công, hiển thị rõ `ticket_code` (`REQ-CON-YYYY-XXXXXX`) ngay trên UI (với thông báo đã ghi nhận gửi thẳng tới chuyên gia, và nhắc theo dõi tại `/portal/buyer/consultations` nếu đã đăng nhập hoặc qua email nếu khách vãng lai có nhập email).

- **`UI-CON-002` — Hộp Thư Tư Vấn Chuyên Gia (`/portal/expert/consultations`)**:
  - Gỡ bỏ hoàn toàn auto-seed 6 bản ghi mẫu (`REQ-CON-004`).
  - Bọc qua `<Async>` chuẩn 5 UX States (Loading, Error, Empty, Partial/Success).
  - Cho phép Expert xem chi tiết phiếu (tuân thủ PDPD), thực hiện `ACCEPT` (nhập lịch hẹn, link họp, ghi chú), `REJECT` (validate client + server `>= 10` ký tự), và `COMPLETE`.

- **`UI-CON-003` — Màn Hình Theo Dõi Phiếu Tư Vấn Buyer (`/portal/buyer/consultations`)**:
  - Hiển thị danh sách phiếu đã gửi của người dùng đang đăng nhập qua `<Async>` (5 UX States).
  - Hiển thị `ticket_code`, tên chuyên gia, trạng thái (`PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`), lịch hẹn & link họp (khi `ACCEPTED`/`COMPLETED`), lý do từ chối (khi `REJECTED`), và form/modal gửi đánh giá (khi `COMPLETED`).

---

### 3. Tiêu Chí Nghiệm Thu & Kiểm Thử (`TEST-CON-*`, `AC-CR-033.*`)

- **`TEST-CON-001` (Unit Test — `BR-CON-001`..`BR-CON-006`)**:
  - Kiểm thử sinh mã `REQ-CON-YYYY-XXXXXX`, validation `REJECT` lý do `< 10` ký tự bị từ chối và `>= 10` ký tự hợp lệ, chuyển trạng thái `PENDING -> ACCEPTED -> COMPLETED` / `PENDING -> REJECTED`, điều kiện đánh giá khi `COMPLETED`, và logic che chắn PII theo PDPD.
- **`TEST-CON-002` (API Contract Test — `API-CON-001`..`API-CON-005`)**:
  - Kiểm thử hợp đồng request/response DTO giữa Backend .NET và Frontend Next.js cho cả 5 endpoints (bao gồm `ticketCode`, `scheduledAt`, `meetingLink`, `rejectionReason`, `rating`).
- **`TEST-CON-003` (DB Integration Test — `brokerage.expert_consultations`)**:
  - Kiểm thử persistence thật trên PostgreSQL: gửi phiếu public tạo row thật có `ticket_code` unique; Expert `ACCEPT`/`REJECT`/`COMPLETE` cập nhật đúng cột trong DB; xác minh không có auto-seed 6 bản ghi mẫu.
- **`TEST-CON-004` (Playwright E2E & Scoped RBAC / IDOR Test)**:
  - E2E toàn trình: Buyer gửi phiếu trên `/experts/[expertCode]` nhận `ticket_code` $\rightarrow$ Expert đăng nhập `/portal/expert/consultations` thấy phiếu thật (không có 6 mẫu giả), `ACCEPT` kèm lịch hẹn & link họp $\rightarrow$ Buyer mở `/portal/buyer/consultations` thấy trạng thái `ACCEPTED`, lịch hẹn, link họp $\rightarrow$ Expert `COMPLETE` $\rightarrow$ Buyer gửi đánh giá.
  - Kiểm thử IDOR: Buyer B không xem/đánh giá được phiếu của Buyer A; Expert B không xem/xử lý được phiếu của Expert A.

- **AC-CR-033.1**: Gửi phiếu tư vấn công khai lưu DB thật vào `brokerage.expert_consultations`, trả về `ticket_code` định dạng `REQ-CON-YYYY-XXXXXX` ngay trên UI và tạo notification cho cả Expert và Admin.
- **AC-CR-033.2**: `/portal/expert/consultations` không còn auto-seed 6 bản ghi mẫu giả; Expert thao tác `ACCEPT` (lịch hẹn/link họp/ghi chú) hoặc `REJECT` (bắt buộc `>= 10` ký tự) cập nhật DB và bắn notification phản hồi ngược.
- **AC-CR-033.3**: Người dùng đã đăng nhập xem và theo dõi được toàn bộ phiếu đã gửi, trạng thái, lịch hẹn, link họp, lý do từ chối và đánh giá sau `COMPLETED` tại `/portal/buyer/consultations`.
- **AC-CR-033.4**: Kiểm soát IDOR 2 chiều (`requester_person_id == Actor.PersonId` cho Buyer, `person_id == Actor.PersonId` cho Expert) và tuân thủ PDPD che chắn PII đạt 100%.

---

### 4. Kết Quả Kiểm Chứng & Nghiệm Thu Chất Lượng (Quality Gate 4 & 5 Sign-off)

- **Backend Unit & Contract Tests (`ExpertConsultationRulesTests.cs`)**:
  - `dotnet test`: **29/29 PASSED (100%)**, bao gồm 100% kiểm chứng cho `BR-CON-001..006`, Dual-Route mapping, PDPD masking/unmasking và Zero-Mock schema.
- **Frontend Vitest Component Tests**:
  - `src/app/portal/buyer/consultations/page.test.tsx`: **5/5 PASSED (100%)**.
  - `src/app/portal/expert/consultations/consultations.test.tsx`: **9/9 PASSED (100%)**.
  - `src/components/expert-detail/profile-detail.test.tsx`: **7/7 PASSED (100%)**.
  - `src/app/experts/page.test.tsx`: **19/19 PASSED (100%)**.
  - Tổng cộng: **40/40 tests PASSED**.
- **TypeScript Static Verification**:
  - `npx tsc --noEmit`: **0 errors**.
- **Playwright E2E & Scoped RBAC / IDOR Spec**:
  - `SourceCode/frontend/e2e/expert-consultation-two-way.spec.ts` sẵn sàng bao phủ toàn trình UJ-CON-01..04 và SEC-CON-01..03.
- **Tiến độ Master Roadmap**:
  - `TASK-05`: **227/227 Tasks (100%)** — Đã Shipped Delta v1.7 (`CR-2026-033`).

