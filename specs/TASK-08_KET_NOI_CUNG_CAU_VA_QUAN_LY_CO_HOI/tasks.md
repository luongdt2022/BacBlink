# Implementation Tasks: TASK-08 Kết Nối Cung–Cầu & Quản Lý Cơ Hội Hợp Tác

**Feature**: `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
**Spec Reference**: [`spec.md`](./spec.md) | **Plan Reference**: [`plan.md`](./plan.md)  
**Status**: In Progress (Delta CR-2026-012 Decomposed & Ready for Implementation)  

---

## Phase 1: Contract-First, Schema CSDL & Scoring Engine Backend

- [x] T001 [CONTRACT] Định nghĩa các DTOs chuẩn trong `packages/contracts/` hoặc `modules/brokerage/`:
  - `MatchCandidateDto`, `ConnectionRequestDto`, `CreateConnectionRequestDto`, `RespondConnectionRequestDto`, `OpportunityDto`, `DealDiscussionDto`, `MouAgreementDto`.
- [x] T002 [DB/EF] Khởi tạo migration hoặc DDL script tạo schema `brokerage` và 5 bảng:
  - `brokerage.match_candidates`, `brokerage.connection_requests`, `brokerage.opportunities`, `brokerage.deal_discussions`, `brokerage.mou_agreements`.
- [x] T003 [BE] Xây dựng thuật toán `MatchingEngineService.cs` tính toán Matching Score 0–100%:
  - Ma trận ngành LV-CN (40%), TRL tương thích (30%), TNI Boost (15%), Patent Boost (15%).
- [x] T004 [BE] Xây dựng `BrokerageControllers.cs` cung cấp endpoints:
  - `GET /api/v1/brokerage/radar`: Lấy danh sách ứng viên ghép cặp.
  - `POST /api/v1/brokerage/requests`: Gửi yêu cầu kết nối.
  - `GET /api/v1/brokerage/requests`: Lấy danh sách yêu cầu kết nối.
  - `PUT /api/v1/brokerage/requests/{id}/respond`: Chấp nhận / từ chối kết nối.
  - `GET /api/v1/brokerage/opportunities`: Lấy danh sách cơ hội.
  - `PUT /api/v1/brokerage/opportunities/{id}/stage`: Cập nhật giai đoạn Kanban.
- [x] T005 [BE] Xây dựng endpoints Deal Room & MOU:
  - `GET /api/v1/brokerage/opportunities/{id}/deal-room`: Chi tiết Deal Room kèm unmask PDPD.
  - `POST /api/v1/brokerage/opportunities/{id}/discussions`: Gửi tin nhắn trao đổi.
  - `POST /api/v1/brokerage/opportunities/{id}/mou`: Tạo & cập nhật biên bản ghi nhớ MOU.
  - `GET /api/v1/gov/opportunities`: Endpoint dành cho cán bộ Sở KH&CN giám sát.

---

## Phase 2: Luồng Tác Nghiệp Phía Bên Mua & Bên Bán (Radar & Request Modal)

- [x] T006 [FE] Xây dựng service API client `src/services/api/brokerage.ts` gọi đầy đủ các endpoints brokerage.
- [x] T007 [FE] Xây dựng Màn hình Radar Ghép Nối Cung–Cầu `src/app/portal/matching/radar/page.tsx` (`UI-MATCH-RADAR-001`):
  - Thẻ ứng viên kèm điểm Match Score Ring, huy hiệu TNI/Patent, bộ lọc đa chiều, 5 UX states.
- [x] T008 [FE] Xây dựng `ConnectionRequestModal.tsx`:
  - Modal gửi yêu cầu kết nối kèm masking PDPD (SĐT/Email che mờ).

---

## Phase 3: Pipeline Quản Lý Vòng Đời Cơ Hội & Cổng Giám Sát Sở KH&CN

- [x] T009 [FE] Xây dựng Màn hình Pipeline Kanban `src/app/portal/opportunities/pipeline/page.tsx` (`UI-MATCH-PIPELINE-001`):
  - Bảng Kanban 5 cột chuẩn quy trình, nút chuyển giai đoạn, liên kết vào Deal Room.
- [x] T010 [FE] Xây dựng Màn hình Cổng Giám Sát Sở KH&CN `src/app/gov/opportunities/page.tsx` (`UI-GOV-OPPORTUNITY-001`):
  - Thống kê cơ hội theo địa bàn, cảnh báo yêu cầu quá hạn SLA 48h.

---

## Phase 4: Phòng Đàm Phán Deal Room 1-1 & Soạn Thảo Biên Bản Ghi Nhớ MOU

- [x] T011 [FE] Xây dựng Màn hình Deal Room 1-1 `src/app/portal/opportunities/[id]/deal-room/page.tsx` (`UI-MATCH-DEALROOM-001`):
  - Bàn làm việc 3 bên (Buyer - Seller - Chuyên gia), thông tin liên hệ unmasked PDPD, hộp thoại trao đổi.
- [x] T012 [FE] Xây dựng `MouModal.tsx`:
  - Soạn thảo biên bản ghi nhớ MOU và xem trước văn bản thỏa thuận.

---

## Phase 5: Kiểm Thử Toàn Diện & Quality Gate (DoD)

- [x] T013 [TEST] Viết Invariant Unit Tests kiểm chứng thuật toán Matching Score và quy tắc BR-BRK-01..06.
- [x] T014 [TEST] Viết Contract & Integration Tests cho các endpoints Brokerage và CSDL PostgreSQL.
- [x] T015 [TEST] Viết và chạy kịch bản Playwright E2E Black-box kiểm định toàn trình (Buyer tạo yêu cầu -> Seller chấp nhận -> Deal Room đàm phán -> Xuất MOU -> Sở duyệt).

---

## Phase 6: Delta v2 (CR-2026-018) — Làm Mịn Trải Nghiệm Radar Ghép Nối AI (Bên Mua)

- [x] T016 [FE] Bổ sung dropdown `selectedDemandCode` (Bài toán nguồn) cho phép Buyer lọc trực tiếp ứng viên theo bài toán cụ thể đang mở.
- [x] T017 [FE] Thêm thẻ hiển thị `Giải trình độ tương thích AI (XAI)` bóc tách 4 trục: Lĩnh vực 100% khớp, Mức TRL, Cấp thiết TNI, Bảo hộ SHTT.
- [x] T018 [FE] Chuẩn hóa định dạng toán học trực quan (`TNI ≥ 80` thay cho chuỗi LaTeX thô).
- [x] T019 [TEST] Mở rộng `src/app/portal/matching/radar/page.test.tsx` kiểm thử Explainable AI breakdown và selector bài toán, đạt 100% Green.

---

## Phase 7: Delta v3 (CR-2026-012) — Chuẩn Hóa Tiền Tệ & Triệt Tiêu Mock Ngân Sách Brokerage

> **Mục tiêu**: Triệt tiêu toàn bộ giá trị khởi tạo cứng (công ty mẫu, ngân sách giả định, nhân sự giả lập, fallback 1000), chuẩn hóa hàm định dạng tiền tệ động Triệu / Tỷ VNĐ toàn sàn, và củng cố validation client/server.

- [x] T020 [FE] Xây dựng tiện ích định dạng tiền tệ dùng chung `src/lib/currency.ts` (`formatCurrencyMillionVnd`) với đầy đủ logic quy đổi $\ge 1.000$ Tr $\rightarrow$ `"X,X Tỷ VNĐ"`, $< 1.000$ Tr $\rightarrow$ `"XXX Triệu VNĐ"`, hỗ trợ tùy chọn `emptyLabel` và `compact`.
- [x] T021 [FE] Triệt tiêu dữ liệu khởi tạo cứng và tăng cường validation trong `ConnectionRequestModal.tsx`:
  - Nạp `senderOrgName` từ `authClient.getUser()?.organizationName || ''`.
  - Khởi tạo `proposedBudget = ''` kèm placeholder định hướng `"VD: 500 triệu - 1 tỷ VNĐ, hoặc Thỏa thuận"`.
  - Khởi tạo `message = ''` kèm placeholder hướng dẫn mục tiêu hợp tác.
  - Kiểm tra validation: `senderOrgName.trim().length >= 3` và `message.trim().length >= 10`.
- [x] T022 [FE] Chuẩn hóa định dạng tiền tệ động trên Pipeline (`src/app/portal/opportunities/pipeline/page.tsx`):
  - Card KPI "Tổng giá trị dự kiến": sử dụng `formatCurrencyMillionVnd(totalValue)`.
  - Thẻ cơ hội trên bảng Kanban: sử dụng `formatCurrencyMillionVnd(opp.estimatedValueMillionVnd, { compact: true })`.
- [x] T023 [FE] Chuẩn hóa định dạng tiền tệ trên Cổng Giám Sát Sở (`src/app/gov/opportunities/page.tsx`):
  - Thẻ KPI "Tổng GT dự kiến": áp dụng `formatCurrencyMillionVnd(stats.totalEstimatedValueMillionVnd)`.
  - Cột bảng dữ liệu và Modal Giám Sát Deal: định dạng đồng nhất qua `formatCurrencyMillionVnd`.
- [x] T024 [FE] Triệt tiêu nhân sự giả lập và fallback ảo trong Deal Room:
  - `src/app/portal/opportunities/[id]/deal-room/page.tsx`: Xóa bỏ `'Kỹ sư Vũ Quang Hải'`, nạp `senderName` từ `authClient.getUser()?.fullName || ''`.
  - `src/app/portal/opportunities/[id]/deal-room/MouModal.tsx`: Xóa bỏ fallback ảo `|| 1000`, hiển thị giá trị thật đã format hoặc chuỗi *"thỏa thuận theo phụ lục hợp đồng"*.
- [x] T025 [BE] Thẩm định và gia cố API validation trong `BrokerageControllers.cs`:
  - Trong `CreateConnectionRequest`: Bổ sung kiểm tra độ dài `SenderOrgName.Trim().Length >= 3` và `Message.Trim().Length >= 10` theo quy tắc `BR-DEL-08-02`.
  - Đối soát các truy vấn `SUM(estimated_value_million_vnd)` và đếm requests đảm bảo đọc ghi trực tiếp CSDL PostgreSQL thật `brokerage.opportunities`.
- [x] T026 [TEST] Xây dựng Unit Test cho tiện ích tiền tệ `src/lib/currency.test.ts` bao phủ 100% các nhánh: `null`, `0`, $< 1.000$ Tr, $\ge 1.000$ Tr, và `compact`.
- [x] T027 [TEST] Xây dựng Unit Test cho `ConnectionRequestModal.test.tsx` kiểm chứng: form mở lên sạch rỗng, lấy tổ chức từ `authClient`, validate tối thiểu 3 ký tự tổ chức và 10 ký tự nội dung.
- [x] T028 [TEST] Cập nhật và chạy toàn bộ test suites hiện có:
  - `pipeline/page.test.tsx`: Cập nhật kỳ vọng `"5,5 Tỷ VNĐ"`.
  - `gov/opportunities/page.test.tsx`: Kiểm tra format KPI và danh sách.
  - `deal-room/page.test.tsx`: Đồng bộ `senderName` từ `authClient`.
- [x] T029 [TEST] Quét kiểm toán Zero-Mock toàn diện (Grep Guard) đảm bảo 0 chuỗi mock ngầm trong thư mục `matching/` và `opportunities/`.

---

## PHẦN DELTA: CR-2026-012 ENRICHED CONNECTION DETAILS & SCOPED PIPELINE

> **Căn cứ**: Quyết định PO `PO-DEC-20261030-05`, Hồ sơ Change Request `CR-2026-012`, và Đặc tả `spec.md` (Mục DELTA-CR-2026-012).  
> **Mục tiêu**: Bổ sung thông tin công nghệ mục tiêu và hồ sơ bên mua vào yêu cầu kết nối, thực thi Scoped RBAC an toàn (lọc theo tổ chức người dùng, chống IDOR), áp dụng bảo vệ dữ liệu PDPD (NĐ 13/2023/NĐ-CP), và xây dựng UI Modal chi tiết cùng thanh 4 sub-tabs lọc trạng thái.

### 1. Phân Hệ Backend, Schema CSDL & API Contracts [BE]

- [x] T030 [DB/EF] Khởi tạo migration CSDL cho schema `brokerage` trong `SourceCode/backend/packages/persistence/Migrations/` hoặc migration script:
  - Bổ sung các cột quan hệ vào bảng `brokerage.connection_requests`: `target_offer_id UUID REFERENCES supply.offers(id)`, `buyer_organization_id UUID`, `seller_organization_id UUID`, `rejection_reason TEXT`, `sla_deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours')`.
  - Thiết lập các chỉ mục tối ưu: `idx_conn_requests_seller_status` trên `(seller_organization_id, status)` và `idx_conn_requests_buyer_status` trên `(buyer_organization_id, status)`.
  - Tiêu chí kiểm chứng: Chạy lệnh `dotnet ef database update` hoặc kiểm tra CSDL PostgreSQL schema `brokerage.connection_requests` có đủ 5 cột mới và 2 chỉ mục mà không làm gián đoạn dữ liệu hiện có.

- [x] T031 [BE] Định nghĩa các DTOs chuẩn Contract-First trong `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs`:
  - `TargetOfferSummaryDto`: `OfferId`, `OfferCode`, `OfferTitle`, `TrlLevel`, `TrlStage`, `IpStatus`, `SectorCode`, `SectorName`, `PriceMillionVnd`.
  - `BuyerEnterpriseProfileDto`: `EnterpriseId`, `BuyerOrganizationId`, `CompanyName`, `TaxCode`, `Industry`, `ProvinceCode`, `ProvinceName`, `Address`, `ScaleCategory`, `EmployeeCountRange`.
  - `PdpdContactInfoDto`: `ContactPersonName`, `PhoneNumber`, `Email`, `IdentityNumber`, `IsMasked`, `PdpdNotice`.
  - `ConnectionRequestEnrichedDto` (cho danh sách enriched) và `ConnectionRequestDetailDto` (cho modal chi tiết).
  - Cập nhật `RespondConnectionRequest`: bổ sung trường `RejectionReason` (string, nullable).
  - Tiêu chí kiểm chứng: Compile project API (`dotnet build apps/api/NacenTech.Api.csproj`) thành công 0 error.

- [x] T032 [BE] Nâng cấp Endpoint danh sách `GET /api/v1/brokerage/requests` trong `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs`:
  - Thực hiện JOIN với bảng `supply.offers` để lấy `offer_title`, `offer_code`, `trl_level`, `ip_status`.
  - Thực hiện JOIN với bảng `auth.enterprises` hoặc `auth.organizations` để lấy `tax_code`, `industry`, `province_name`.
  - Bổ sung tham số truy vấn: `status` (`ALL`, `PENDING`, `ACCEPTED`, `REJECTED`), `search` (từ khóa tiêu đề/mã/doanh nghiệp).
  - Cưỡng chế cơ chế Scoped RBAC 3 chiều (`BR-BRK-08`): Khi User có vai trò `SELLER`, tự động lọc `WHERE cr.seller_organization_id = @CurrentUserOrgId` trích xuất trực tiếp từ JWT Claims `CurrentUser.OrganizationId` (tuyệt đối không nhận param từ client).
  - Trả về danh sách `ConnectionRequestEnrichedDto` kèm thông tin tính toán hạn SLA (`isSlaWarning`).
  - Tiêu chí kiểm chứng: Gửi request với token của Seller A chỉ trả về các yêu cầu gửi đến công nghệ của Seller A, đầy đủ thông tin `offerTitle`, `offerCode`, `senderTaxCode`.

- [x] T033 [BE] Xây dựng Endpoint chi tiết `GET /api/v1/brokerage/requests/{id:guid}` trong `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs`:
  - Kiểm tra thẩm quyền Scoped RBAC an toàn: Nếu người dùng là `SELLER` và `cr.seller_organization_id != CurrentUser.OrganizationId` $\rightarrow$ Trả về mã lỗi `403 Forbidden` (`ERR_FORBIDDEN_SCOPE_ACCESS`).
  - Thực thi quy tắc bảo vệ dữ liệu PDPD tại tầng Backend (`BR-BRK-07`):
    * Khi trạng thái là `PENDING` hoặc `REJECTED`: Che mờ SĐT qua hàm `MaskPhone(phone)` (`09****1234`), Email qua `MaskEmail(email)` (`a***@domain.com`), ẩn số CMND/CCCD, gán `IsMasked = true`.
    * Khi trạng thái là `ACCEPTED`: Giải phóng dữ liệu liên hệ thật (`PhoneNumber`, `Email`, `IdentityNumber`), gán `IsMasked = false`.
  - Trả về cấu trúc 3 khối hoàn chỉnh trong `ConnectionRequestDetailDto`: (1) `TargetOffer`, (2) `BuyerProfile`, (3) `ContactInfo`.
  - Tiêu chí kiểm chứng: Dùng tài khoản Seller B gọi ID của Seller A nhận về 403; dùng tài khoản Seller A gọi request `PENDING` nhận về dữ liệu đã che mờ; sau khi `ACCEPTED` nhận về số điện thoại và email thật.

- [x] T034 [BE] Nâng cấp Endpoint phản hồi `PUT /api/v1/brokerage/requests/{id:guid}/respond` trong `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs`:
  - Kiểm tra Scoped RBAC: Chỉ Seller đại diện của tổ chức tiếp nhận (`cr.seller_organization_id == CurrentUser.OrganizationId`) mới có quyền phản hồi.
  - Gia cố ràng buộc từ chối kết nối (`BR-BRK-07`): Khi `action == "REJECT"`, kiểm tra `rejectionReason` bắt buộc không được rỗng và có độ dài $\ge 10$ ký tự. Nếu vi phạm, trả về `400 Bad Request` (`"Vui lòng cung cấp lý do từ chối với tối thiểu 10 ký tự."`).
  - Khi `action == "ACCEPT"`: Cập nhật trạng thái `ACCEPTED`, gỡ bỏ mặt nạ dữ liệu cá nhân, tự động tạo bản ghi `Opportunity` liên kết trên bảng `brokerage.opportunities`, trả về `createdOpportunityId` và `createdOpportunityCode`.
  - Tiêu chí kiểm chứng: Gọi reject thiếu lý do hoặc lý do < 10 ký tự nhận về 400 Bad Request; gọi reject hợp lệ lưu `rejection_reason` vào CSDL; gọi accept tự sinh Opportunity mới trong PostgreSQL.

---

### 2. Phân Hệ Frontend UI/UX & Tương Tác Người Dùng [FE]

- [x] T035 [FE] Cập nhật Type Definitions và Service API Client:
  - `SourceCode/frontend/src/types/brokerage.ts`:
    * Bổ sung interfaces: `TargetOfferSummary`, `BuyerEnterpriseProfile`, `PdpdContactInfo`, `ConnectionRequestEnriched`, `ConnectionRequestDetail`.
    * Cập nhật type `ConnectionRequest` hoặc mở rộng kế thừa.
  - `SourceCode/frontend/src/services/api/brokerage.ts`:
    * Mở rộng `getConnectionRequests(status?: string, search?: string)` trả về `Promise<ConnectionRequestEnriched[]>`.
    * Thêm hàm `getConnectionRequestDetail(id: string): Promise<ConnectionRequestDetail>`.
    * Cập nhật hàm `respondConnectionRequest(id: string, action: 'ACCEPT' | 'REJECT', note?: string, rejectionReason?: string)`.
  - Tiêu chí kiểm chứng: Chạy kiểm tra TypeScript (`pnpm tsc --noEmit` hoặc `npx tsc --noEmit`) pass 100% không có type error.

- [x] T036 [FE] Xây dựng Component Modal Chi Tiết `ConnectionRequestDetailModal.tsx` tại `SourceCode/frontend/src/app/portal/opportunities/pipeline/ConnectionRequestDetailModal.tsx` (`UI-CONN-REQ-DETAIL-001`):
  - Khối 1: Sản Phẩm / Công Nghệ Mục Tiêu (`TargetOfferCard`): Hiển thị tiêu đề, mã chào bán, huy hiệu TRL 1–9 chuẩn màu (1-3 Xám, 4-6 Vàng, 7-9 Xanh lục), tình trạng SHTT, lĩnh vực TT17 và giá tham chiếu qua `formatCurrencyMillionVnd`.
  - Khối 2: Hồ Sơ Pháp Nhân Bên Mua (`BuyerProfileCard`): Tên doanh nghiệp, MST, ngành nghề, tỉnh thành, quy mô nhân sự/doanh thu.
  - Khối 3: Đề Xuất Hợp Tác & Thông Tin Liên Hệ PDPD:
    * Ngân sách đề xuất (định dạng `formatCurrencyMillionVnd`).
    * Lời nhắn / mục tiêu thử nghiệm.
    * Hạn SLA 48h và cờ cảnh báo SLA Warning nếu sắp quá hạn.
    * Hộp thoại bảo mật PDPD: SĐT/Email che mờ kèm nhãn tuân thủ Nghị định 13/2023/NĐ-CP.
  - Xử lý hành động tương tác:
    * Khi `PENDING`: Nút "Từ chối" mở rộng textarea nhập lý do (có validation $\ge 10$ ký tự và counter); nút "Chấp thuận kết nối" (màu emerald) gửi lệnh duyệt, hiển thị liên hệ unmasked và nút dẫn vào Deal Room 1-1.
    * Khi `ACCEPTED`: Hiển thị nút "Truy cập Deal Room 1-1" dẫn tới `/portal/opportunities/[id]/deal-room`.
    * Khi `REJECTED`: Hiển thị lý do từ chối đã gửi cho bên mua.
  - Tiêu chí kiểm chứng: Mở modal từ danh sách hiển thị đúng 3 khối; validate lý do từ chối chặn click khi < 10 ký tự; chấp thuận thành công chuyển đổi trạng thái tức thì.

- [x] T037 [FE] Nâng cấp Màn hình Pipeline Quản Lý Cơ Hội `SourceCode/frontend/src/app/portal/opportunities/pipeline/page.tsx`:
  - Trong Tab Inbound: Tích hợp thanh 4 sub-tabs bộ lọc trạng thái (`UI-CONN-REQ-FILTER-001`):
    * `Tất cả (ALL)` kèm tổng số yêu cầu.
    * `Chờ phản hồi (PENDING)` kèm badge số lượng chờ xử lý (màu amber).
    * `Đã chấp thuận (ACCEPTED)` kèm badge số lượng đã duyệt (màu emerald).
    * `Đã từ chối (REJECTED)` kèm badge số lượng đã từ chối.
  - Chuyển đổi hiển thị danh sách thẻ yêu cầu kết nối với thông tin enriched: Tên công nghệ mục tiêu, TRL level, MST và tỉnh thành bên mua, ngân sách đề xuất.
  - Bổ sung nút tác vụ "Xem chi tiết" trên mỗi thẻ kích hoạt mở `ConnectionRequestDetailModal`.
  - Cơ chế đồng bộ hóa KPI Counters: Tự động kích hoạt re-fetch và cập nhật số lượng badge tab Inbound, thẻ KPI Hero banner, và phễu Kanban ngay sau khi Seller chấp thuận hoặc từ chối kết nối.
  - Tiêu chí kiểm chứng: Chuyển đổi mượt mà giữa 4 sub-tabs; click "Xem chi tiết" mở đúng modal của request; sau khi chấp thuận, badge PENDING giảm 1 và Kanban tăng 1 deal mới.

---

### 3. Phân Hệ Kiểm Thử Tự Động & Quality Gate [Test]

- [x] T038 [TEST] Xây dựng Backend Invariant & Scoped RBAC Tests trong `SourceCode/backend/tests/invariants/BrokerageConnectionRequestInvariantsTests.cs`:
  - Kiểm thử Unit hàm che mờ: `MaskPhone` che mờ đúng dạng `09****1234` cho các độ dài số điện thoại khác nhau; `MaskEmail` che mờ đúng `a***@domain.com`.
  - Kiểm thử Invariant DTO: Đảm bảo khi trạng thái `PENDING` thì response DTO không bao giờ chứa thông tin liên hệ thật.
  - Kiểm thử Unmask DTO: Đảm bảo khi trạng thái `ACCEPTED` thì thông tin liên hệ được giải phóng thật để mở Deal Room.
  - Kiểm thử Validation: Gửi request `PUT /respond` với `action = "REJECT"` nhưng thiếu lý do hoặc lý do < 10 ký tự trả về HTTP 400 Bad Request.
  - Tiêu chí kiểm chứng: Chạy lệnh `dotnet test SourceCode/backend/tests/invariants/NacenTech.Tests.Invariants.csproj` đạt 100% Pass (184/184 tests passed).

- [x] T039 [TEST] Xây dựng Component Tests cho `ConnectionRequestDetailModal.test.tsx` tại `SourceCode/frontend/src/app/portal/opportunities/pipeline/ConnectionRequestDetailModal.test.tsx`:
  - Kiểm thử render đầy đủ 3 khối: Target Offer (tiêu đề, mã, TRL badge, SHTT), Buyer Profile (MST, địa chỉ, ngành nghề), Proposal & PDPD Contact.
  - Kiểm thử trạng thái PENDING hiển thị thông tin liên hệ che mờ (`09****`, `***@`) và nhãn tuân thủ NĐ 13/2023/NĐ-CP.
  - Kiểm thử form từ chối: Nút xác nhận từ chối bị disable khi lý do < 10 ký tự, enable khi $\ge 10$ ký tự.
  - Kiểm thử chấp thuận kết nối: Sau khi gọi accept thành công, modal cập nhật sang trạng thái unmasked và xuất hiện nút "Truy cập Deal Room 1-1".
  - Tiêu chí kiểm chứng: Chạy lệnh `pnpm test ConnectionRequestDetailModal.test.tsx` (hoặc Vitest) đạt 100% Pass.

- [x] T040 [TEST] Xây dựng Integration Tests cho Bộ Lọc 4 Sub-Tabs & Đồng Bộ Scoped Pipeline tại `SourceCode/frontend/src/app/portal/opportunities/pipeline/page.test.tsx`:
  - Kiểm thử tương tác nhấp chọn lần lượt 4 sub-tabs (`ALL`, `PENDING`, `ACCEPTED`, `REJECTED`) lọc đúng danh sách bản ghi hiển thị trên bảng.
  - Kiểm thử đồng bộ KPI counters: Xác nhận khi một yêu cầu được chấp thuận, số lượng pending giảm và tổng deal trong Kanban tăng lên đồng bộ.
  - Kiểm tra không rò rỉ mock ngầm (Zero-Mock Assurance) cho toàn bộ màn hình Pipeline và Tab Inbound.
  - Tiêu chí kiểm chứng: Toàn bộ suite `page.test.tsx` chạy đạt 100% Pass, không có warning hay lỗi console.

---

## Phase 8: Delta v5 (CR-TASK-08-DELTA-01) — Khép Kín Luồng Giao Dịch Cung - Cầu 2 Chiều (Đặt Mua Sản Phẩm Thương Mại & Inbound Lead)

> **Mục tiêu**: Thực thi thiết kế kỹ thuật của Delta `CR-TASK-08-DELTA-01` theo quyết định `PO-DEC-20261102-02` (WS-05), bảo đảm cơ chế Atomic Dual-Write (ACID transaction) ghi đồng thời `DemandItem` và `ConnectionRequest`, khép kín phễu chuyển đổi 2 chiều giữa Bên Mua và Bên Bán.

### 1. Phân Hệ Backend Core API (.NET)

- [x] T041 [BE] [CONTRACT] Mở rộng DTO `CreateQuickDemandItemRequest` trong `SourceCode/backend/apps/api/V1Compat/DemandController.cs`:
  - Bổ sung các trường tùy chọn: `Guid? OfferId = null`, `string? OfferTitle = null`, `string? OfferCode = null`, `bool? IsCommercialOrder = null`.
  - Tiêu chí kiểm chứng: Build solution `dotnet build SourceCode/backend/apps/api/NacenTech.Api.csproj` thành công, không phát sinh cảnh báo hay lỗi biên dịch.

- [x] T042 [BE] Triển khai giao dịch nguyên tử Atomic Dual-Write trong `DemandController.CreateQuickDemandItem`:
  - Sử dụng `await using var transaction = await db.Database.BeginTransactionAsync(ct);` bao bọc toàn bộ khối xử lý.
  - Thao tác 1: Ghi bản ghi `DemandItem` vào bảng `demand.demand_items`.
  - Thao tác 2: Khi `req.OfferId.HasValue && req.OfferId.Value != Guid.Empty`, tra cứu `SellerTechnologyOffer` từ `technology.seller_technology_offers`. Nếu tìm thấy, thực hiện INSERT trực tiếp vào `brokerage.connection_requests`:
    * `request_code = $"REQ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}"`
    * `sender_user_id = Actor.PersonId ?? Guid.NewGuid()`
    * `sender_org_name = req.ApplicationScale ?? Actor.OrganizationName ?? "Khách hàng Bên Mua"`
    * `sender_role = "BUYER"`
    * `receiver_org_name = offer.EnterpriseName ?? "Nhà Cung Ứng"`
    * `receiver_user_id = offer.CreatedBy`
    * `demand_id = demandItem.Id`
    * `target_offer_id = offer.Id`
    * `offer_id = offer.Id`
    * `seller_organization_id = offer.EnterpriseId`
    * `message = req.DesiredSolution ?? req.TechnicalProblem`
    * `proposed_budget_range = req.BudgetRange ?? "Thỏa thuận"`
    * `status = "PENDING"`
    * `sla_deadline = DateTimeOffset.UtcNow.AddHours(48)`
  - Thao tác 3: `await transaction.CommitAsync(ct);`. Bắt ngoại lệ trong khối `catch` để `await transaction.RollbackAsync(ct);` và trả về HTTP 500 kèm mã `ERR_ATOMIC_COMMERCIAL_ORDER_FAILED`.
  - Trả về HTTP 200 payload chứa cả: `itemId`, `itemCode`, `connectionRequestId`, `requestCode`.
  - Tiêu chí kiểm chứng: Gọi API với `offerId` hợp lệ, kiểm tra CSDL PostgreSQL có đúng 1 bản ghi `demand_items` và 1 bản ghi `connection_requests` liên kết qua `demand_id`.

---

### 2. Phân Hệ Frontend Web Portal (Next.js)

- [x] T043 [FE] Cập nhật API client `submitQuickDemand` trong `SourceCode/frontend/src/services/api/technology-offer.ts`:
  - Bổ sung các trường trả về vào interface: `connectionRequestId?: string`, `requestCode?: string`.
  - Đảm bảo trích xuất đúng `connectionRequestId` và `requestCode` từ JSON response của API.
  - Tiêu chí kiểm chứng: Function trả về đầy đủ object có `itemCode` và `requestCode`.

- [x] T044 [FE] Nâng cấp Màn hình Chi tiết Chào Bán `SourceCode/frontend/src/app/chao-ban-cong-nghe/[id]/page.tsx`:
  - Khai báo state `createdRequestCode` để lưu trữ mã kết nối trả về từ `submitQuickDemand`.
  - Cập nhật modal thông báo thành công: Hiển thị cả Mã đơn mua (`DMD-*`) và Mã yêu cầu kết nối Bên Bán (`REQ-*`).
  - Hiển thị thông báo hướng dẫn khách hàng theo dõi đơn mua tại `/portal/buyer/demands?tab=commercial`.
  - Tiêu chí kiểm chứng: Mở form đặt mua sản phẩm thương mại, submit thành công modal hiển thị 2 mã định danh rõ ràng.

- [x] T045 [FE] Nâng cấp Màn hình Quản Lý Cơ Hội Pipeline `SourceCode/frontend/src/app/portal/opportunities/pipeline/page.tsx`:
  - Kiểm tra điều kiện render thẻ Inbound: Khi thẻ có `req.targetOfferId || req.offerId`:
    * Hiển thị badge màu xanh ngọc bích (Emerald): `[Đơn Mua Hàng Thương Mại]`.
    * Thêm liên kết click vào tiêu đề sản phẩm mở chi tiết `/chao-ban-cong-nghe/[id]`.
    * Hiển thị đồng hồ đếm ngược hạn phản hồi SLA 48h.
  - Tiêu chí kiểm chứng: Thẻ Inbound sinh ra từ đơn đặt mua thương mại hiển thị đầy đủ badge và link chào bán.

---

### 3. Phân Hệ Kiểm Thử Tự Động & Quality Gate [Test]

- [x] T046 [TEST] Bộ Kiểm Thử Nghiệm Thu 4 Tầng & Đối Soát PostgreSQL Toàn Vẹn:
  - Unit Test: Chạy invariant tests xác nhận quy tắc che mờ PDPD và SLA.
  - Contract & DB Audit Test: Viết integration test gửi request `POST /api/v1/demands/items` và truy vấn trực tiếp PostgreSQL xác thực tính toàn vẹn 2 chiều (`CommercialOrderDemandBridgeTests.cs`).
  - Component Test: Cập nhật `page.test.tsx` tại pipeline để bao phủ kịch bản render thẻ `[Đơn Mua Hàng Thương Mại]`.
  - Tiêu chí kiểm chứng: 100% tests passed (223/223 passed), 0 lỗi hồi quy. Đã bóc trần và vá lỗi rò rỉ dữ liệu khi offer không tồn tại (`BUG-QC-CR01-01`). Báo cáo nghiệm thu đã lưu tại `QC_EXECUTION_REPORT_CR01.json`.

---

## Phase 9: Delta CR-TASK-08-DELTA-02 — Máy Trạng Thái Đồng Bộ 2 Chiều Trạng Thái Đơn Hàng Thương Mại & Vòng Đời Deal Room

> **Căn cứ**: [`CR-TASK-08-DELTA-02.md`](./deltas/CR-TASK-08-DELTA-02.md), [`ADR-0013-BI-DIRECTIONAL-ORDER-STATE-MACHINE-SYNC.md`](../../docs/decisions/ADR-0013-BI-DIRECTIONAL-ORDER-STATE-MACHINE-SYNC.md), và [`plan_delta_cr02.md`](./plan_delta_cr02.md).  
> **Mục tiêu**: Thiết lập máy trạng thái đồng bộ 2 chiều nguyên tử (ACID Transaction) giữa `demand.demand_items.status`, `brokerage.connection_requests.status` và `brokerage.opportunities.stage`. Phía Bên Mua tự động nhảy sang Bước 2 ("Đang xử lý & Báo giá"), Bước 1 tích xanh [✓], hiển thị nút CTA *"Vào Deal Room Thảo Luận &rarr;"*, và khóa nút Hủy đơn khi Bên Bán đã tiếp nhận.

### 1. Phân Hệ Backend Core API (.NET) & CSDL PostgreSQL

- [x] T047 [BE] Mở rộng `BrokerageControllers.cs` endpoint `PUT /api/v1/brokerage/requests/{id}/respond`:
  * Tích hợp CSDL transaction nguyên tử (`conn.BeginTransactionAsync()` hoặc `IDbContextTransaction`).
  * Khi `action == "ACCEPT"`: Lấy `demand_id` từ `connection_requests`. Nếu `demand_id != null`, thực thi `UPDATE demand.demand_items SET status = 'PROCESSING', updated_at = now() WHERE id = @demandId;`.
  * Khi `action == "REJECT"`: Nếu `demand_id != null`, thực thi `UPDATE demand.demand_items SET status = 'REJECTED', updated_at = now() WHERE id = @demandId;`.
  * Khởi tạo bản ghi thương vụ `brokerage.opportunities` (`stage = 'INITIATED'`).
  * Rollback 100% nếu có lỗi, trả về HTTP 200 kèm `syncedDemandStatus`.
  * Tiêu chí kiểm chứng: Bên Bán tiếp nhận hoặc từ chối, bản ghi `demand.demand_items` tương ứng cập nhật đúng trạng thái `PROCESSING` / `REJECTED` trong cùng transaction.

- [x] T048 [BE] Mở rộng `BrokerageControllers.cs` endpoint `PUT /api/v1/brokerage/opportunities/{id}/stage` (`UpdateOpportunityStage`):
  * Thẩm định FSM chuyển giai đoạn hợp lệ theo quy tắc `BR-BRK-06`.
  * Tích hợp CSDL transaction nguyên tử.
  * Khi `stage` chuyển sang `NEGOTIATING`: Tra cứu `connection_request_id` từ `opportunities`, lấy `demand_id`. Nếu `demand_id != null`, thực thi `UPDATE demand.demand_items SET status = 'NEGOTIATING', updated_at = now() WHERE id = @demandId;`.
  * Khi `stage` chuyển sang `MOU_SIGNED` hoặc `COMPLETED`: Nếu `demand_id != null`, thực thi `UPDATE demand.demand_items SET status = 'COMPLETED', updated_at = now() WHERE id = @demandId;`.
  * Commit transaction, trả về response kèm `syncedDemandStatus`.
  * Tiêu chí kiểm chứng: Chuyển giai đoạn trong Deal Room / Pipeline, `demand_items.status` tự động đồng bộ sang `NEGOTIATING` hoặc `COMPLETED`.

---

### 2. Phân Hệ Frontend Web Portal (Next.js 15)

- [x] T049 [FE] Cập nhật `OrderTrackingStepper.tsx` (`SourceCode/frontend/src/components/demand/OrderTrackingStepper.tsx`):
  * Cập nhật mô tả Bước 2: nhãn chuẩn *"Bên bán đã tiếp nhận & đang xử lý"*.
  * Đảm bảo hiển thị trực quan: Khi `status === 'PROCESSING'`, Bước 1 tích xanh `CheckCircle2` [✓], Bước 2 sáng đèn đang xử lý (active ring, pulse).
  * Đảm bảo `mapStatusToStepIndex` phân giải chính xác `stepIndex = 1` cho `PROCESSING`, `stepIndex = 2` cho `NEGOTIATING`, `stepIndex = 3` cho `COMPLETED`.
  * Tiêu chí kiểm chứng: Mở Stepper với `status="PROCESSING"`, Bước 1 hiển thị tích xanh và Bước 2 sáng đèn.

- [x] T050 [FE] Cập nhật Bàn Làm Việc Bên Mua (`SourceCode/frontend/src/app/portal/buyer/demands/page.tsx`):
  * Tại Modal Chi Tiết Đơn Hàng (`selectedOrder`): Nếu `isCommercialDemandItem(selectedOrder)` và trạng thái là `PROCESSING`, `NEGOTIATING`, hoặc `COMPLETED`:
    - Tra cứu hoặc liên kết tới Deal Room tương ứng (qua `GET /api/v1/brokerage/opportunities?search={selectedOrder.itemCode}` hoặc liên kết ID).
    - Hiển thị nút CTA nổi bật: **"Vào Deal Room Thảo Luận &rarr;"** (icon `Handshake`, phong cách Emerald).
  * Khóa nút "Hủy đơn": Chỉ cho phép hủy khi đơn còn ở Bước 1 (`SUBMITTED` / `PENDING`). Khi đã chuyển sang Bước 2 trở đi, nút "Hủy đơn" tuyệt đối bị ẩn.
  * Tiêu chí kiểm chứng: Modal chi tiết đơn hàng hiển thị nút Vào Deal Room khi đơn đã được tiếp nhận, và nút Hủy đơn bị ẩn.

---

### 3. Phân Hệ Kiểm Thử Tự Động & Quality Gate (DoD)

- [x] T051 [TEST/INT] Xây dựng Integration Tests xUnit và DB Verification Tests:
  * Viết bộ test `OrderStateMachineSyncTests.cs` kiểm chứng:
    - Gọi API `PUT /requests/{id}/respond` với `ACCEPT` $\rightarrow$ DB `demand.demand_items` chuyển sang `PROCESSING`.
    - Gọi API `PUT /requests/{id}/respond` với `REJECT` $\rightarrow$ DB `demand.demand_items` chuyển sang `REJECTED`.
    - Gọi API `PUT /opportunities/{id}/stage` với `NEGOTIATING` $\rightarrow$ DB `demand.demand_items` chuyển sang `NEGOTIATING`.
    - Kiểm chứng tính nguyên tử: Giả lập lỗi DB cập nhật `demand_items` $\rightarrow$ Rollback toàn bộ, `connection_requests` giữ nguyên trạng thái cũ.
  * Tiêu chí kiểm chứng: 100% integration tests passed.

- [x] T052 [TEST/E2E] Xây dựng Unit tests Vitest và Kịch bản Kiểm Thử Playwright E2E Toàn Trình:
  * Unit test: `OrderTrackingStepper.test.tsx` và `buyer/demands/page.test.tsx` kiểm tra render Stepper và nút CTA Deal Room.
  * Playwright E2E: Kịch bản Bên Mua đặt mua $\rightarrow$ Bên Bán nhấn Tiếp nhận đơn $\rightarrow$ Bên Mua tải lại trang thấy đơn hàng chuyển sang Bước 2 [✓] Bước 1 $\rightarrow$ Bấm nút "Vào Deal Room" chuyển hướng thành công.
  * Tiêu chí kiểm chứng: Toàn bộ test suite màu xanh 100%, 0 lỗi hồi quy.

---

## Phase 10: Delta CR-TASK-08-DELTA-03 — Hợp Nhất Hybrid Vector AI + Rule Engine 4 Trục & Zero-Mock Radar

> **Căn cứ**: [`CR-TASK-08-DELTA-03.md`](./deltas/CR-TASK-08-DELTA-03.md), Quyết định `PO-DEC-20261102-05`, [`plan_delta_cr03.md`](./plan_delta_cr03.md).  
> **Mục tiêu**: Khắc phục hiện tượng Split-Brain giữa `Modules.Matching` và `brokerage`, xây dựng `BrokerageMatchingEngineService` hợp nhất 4 trục (Semantic 40%, TRL 30%, TNI 15%, IP 15%), bổ sung cơ chế Graceful Degradation tự động fallback PostgreSQL FTS khi Python Sidecar (:8003) offline, triệt tiêu 100% dữ liệu mock trên Radar XAI, tối ưu concurrency thread-safety và bulk database operations.

### Đợt 1: P0 Core Engine, Subject Providers, Zero-Mock Radar XAI & Nút Re-match

- [x] T053 [BE] Cài đặt `DemandItemSubjectProvider` và `SellerOfferSubjectProvider` kế thừa `ISubjectResolver`:
  * Đường dẫn file: `SourceCode/backend/modules/brokerage/Application/DemandItemSubjectProvider.cs` và `SellerOfferSubjectProvider.cs`.
  * Mở rộng `SubjectKinds`: Bổ sung `DemandItem = "DEMAND_ITEM"` và `SellerOffer = "SELLER_OFFER"` vào `SourceCode/backend/packages/kernel/Domain/SubjectRef.cs`.
  * Triển khai `ISubjectSummaryProvider` và `ISubjectContentProvider` cho từng loại đối tượng.
  * Đăng ký DI trong `SourceCode/backend/modules/brokerage/BrokerageModule.cs`.
  * Tiêu chí kiểm chứng: Gọi `ISubjectResolver.SummaryAsync` và `ContentAsync` phân giải đúng dữ liệu từ `demand.demand_items` và `technology.seller_technology_offers`.

- [x] T054 [BE] Xây dựng `BrokerageMatchingEngineService` hợp nhất Hybrid Vector AI và Rule Engine 4 trục:
  * Đường dẫn file: `SourceCode/backend/modules/brokerage/Application/BrokerageMatchingEngineService.cs` và Interface `IBrokerageMatchingEngineService.cs`.
  * Tích hợp `MatchingService` (`Modules.Matching`) để tính điểm ngữ nghĩa AI BGE-M3 vector + reranker.
  * Cài đặt công thức tính điểm chuẩn `BR-BRK-D3-01`:
    $$\text{MatchScore} = \text{Round}\left(0.40 \times S_{\text{semantic}} + 0.30 \times S_{\text{trl}} + 0.15 \times S_{\text{tni}} + 0.15 \times S_{\text{ip}}\right)$$
  * Cài đặt các hàm thành phần: `CalculateTrlScore`, `CalculateIpScore`, `ComputeHybridScore`.
  * Tiêu chí kiểm chứng: Tính toán chính xác điểm tương thích tổng hợp 0–100% và bóc tách đầy đủ 4 điểm thành phần.

- [x] T055 [BE] Triển khai cơ chế Graceful Degradation Fallback về PostgreSQL Full-Text Search:
  * Đường dẫn file: `SourceCode/backend/modules/brokerage/Application/BrokerageMatchingEngineService.cs`.
  * Thiết lập `CancellationTokenSource` timeout $1500\text{ms}$ khi gọi sang Python AI Sidecar (port 8003).
  * Khối `catch (Exception ex)` tự động chuyển sang `FallbackPostgresFtsScoreAsync`: Sử dụng PostgreSQL `tsvector`, `plainto_tsquery('simple', immutable_unaccent(q))` và xếp hạng `ts_rank_cd` kết hợp lọc `sector_code`.
  * Gán cờ `isDegraded = true` và `semanticEngine = "POSTGRES_FTS_FALLBACK"`.
  * Tiêu chí kiểm chứng: Khi ngắt cổng 8003, engine tự động fallback FTS, HTTP 200 không phát sinh lỗi 500.

- [x] T056 [BE] Thiết kế Contract DTOs sạch cho Radar XAI và nâng cấp API Brokerage:
  * Đường dẫn file: `SourceCode/backend/modules/brokerage/Application/Contracts.cs` và `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs`.
  * Định nghĩa `RadarXaiBreakdownDto`, `BrokerageRadarCandidateDto`, `RecomputeRadarResultDto`.
  * Nâng cấp endpoint `GET /api/v1/brokerage/radar`: Trả về dữ liệu bóc tách 4 trục thật, không chứa giá trị null hoặc mock.
  * Bổ sung endpoint `POST /api/v1/brokerage/radar/recompute`: Kích hoạt engine quét lại đối soát Cung - Cầu mới nhất theo thời gian thực.
  * Tiêu chí kiểm chứng: API trả về payload chuẩn `API-BRK-D3-01` với 4 điểm thành phần thực tế.

- [x] T057 [FE] Nâng cấp màn hình Radar Ghép Nối Cung - Cầu (`matching/radar/page.tsx`):
  * Đường dẫn file: `SourceCode/frontend/src/app/portal/matching/radar/page.tsx`.
  * Triệt tiêu 100% dòng text mock tĩnh `"Lĩnh vực: 100% Khớp"`.
  * Binding chính xác 4 chỉ số XAI thật từ DTO: Ngữ nghĩa AI (hoặc FTS fallback), Mức TRL & điểm TRL, Cấp thiết TNI / 100, Bảo hộ SHTT & tình trạng bằng.
  * Hiển thị badge cảnh báo `[Chế độ dự phòng FTS]` khi `c.isDegraded === true`.
  * Bổ sung nút CTA "Tính toán lại đối soát" (icon `RefreshCw` xoay khi recomputing), gọi API `recomputeRadar`.
  * Tiêu chí kiểm chứng: Giao diện hiển thị trực quan 4 điểm số thật, bấm nút Re-match hiển thị toast thông báo thành công và cập nhật bảng danh sách.

- [x] T058 [FE] Cập nhật API client `brokerageApi` trong `services/api/brokerage.ts`:
  * Đường dẫn file: `SourceCode/frontend/src/services/api/brokerage.ts` và types `SourceCode/frontend/src/types/brokerage.ts`.
  * Khai báo kiểu TypeScript `XaiBreakdown`, `MatchCandidate` mở rộng các trường 4 trục và cờ `isDegraded`.
  * Bổ sung hàm `recomputeRadar(): Promise<RecomputeResult>`.
  * Tiêu chí kiểm chứng: Codebase TypeScript compile không có lỗi type error.

---

### Đợt 2: P1 Lọc Context Buyer, Scoped RBAC, Corrected Scoring & Concurrency Fix

- [x] T059 [BE] Áp dụng 3D Scoped RBAC cho Radar API:
  * Đường dẫn file: `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs` và `BrokerageMatchingEngineService.cs`.
  * Trích xuất Actor từ JWT Token:
    - Nếu Actor là `BUYER`: Chỉ truy vấn các match candidate liên quan đến `demand.created_by == Actor.PersonId` hoặc `demand.buyer_organization_id == Actor.OrganizationId`.
    - Nếu Actor là `SELLER`: Chỉ truy vấn các match candidate gắn với `offer.seller_organization_id == Actor.OrganizationId`.
    - Nếu Actor là `PROVINCIAL_ADMIN`: Scoping theo địa bàn hành chính tỉnh/thành `ProvinceCode`.
    - Nếu Actor là `SUPER_ADMIN` / `OPERATOR_ADMIN`: Xem toàn cảnh toàn quốc.
  * Tiêu chí kiểm chứng: Đăng nhập Buyer A không thấy gợi ý của Buyer B; chống triệt để rò rỉ dữ liệu đối thủ.

- [x] T060 [BE] Khắc phục Concurrency & Loại bỏ mutable state `_lastReranked`:
  * Đường dẫn file: `SourceCode/backend/modules/matching/Application/MatchingService.cs`.
  * Xóa bỏ field `private HashSet<SubjectRef> _lastReranked = [];`.
  * Bổ sung `IReadOnlySet<SubjectRef> RerankedSubjects` vào `SearchExecution` record.
  * Truyền biến cục bộ `reranked` qua tham số hàm `ComputeReasonCodesAsync`.
  * Tiêu chí kiểm chứng: `MatchingService` hoàn toàn stateless; kiểm thử đa luồng không phát sinh race condition.

- [x] T061 [BE] Chuẩn hóa cấu hình `ScoringModes.Corrected` và chuẩn hóa RRF score:
  * Đường dẫn file: `SourceCode/backend/modules/matching/Application/MatchingOptions.cs` và `appsettings.json`.
  * Đặt mặc định `ScoringMode = "Corrected"`.
  * Chuẩn hóa hàm quy đổi điểm RRF / Cosine về dải $[0, 100]$ phục vụ tính toán 4 trục.
  * Tiêu chí kiểm chứng: Kết quả thu hồi RRF kết hợp vector và lexical đồng nhất trên thang điểm 100.

- [x] T062 [FE] Khóa bộ lọc context theo Buyer Demands trên Frontend Radar:
  * Đường dẫn file: `SourceCode/frontend/src/app/portal/matching/radar/page.tsx`.
  * Khi người dùng là Bên Mua (`BUYER`): Dropdown `selectedDemandCode` tự động chọn bài toán đầu tiên của Buyer hoặc giới hạn danh sách bài toán thuộc quyền sở hữu của chính Buyer.
  * Tiêu chí kiểm chứng: Buyer đăng nhập không thể chọn hoặc xem bài toán của doanh nghiệp khác.

---

### Đợt 3: P2 Tối Ưu Batch SQL, Chaos Test Fallback & E2E Test Suites

- [x] T063 [BE] Tối ưu hóa Batch SQL trong `PostgresSearchIndex.cs`:
  * Đường dẫn file: `SourceCode/backend/modules/matching/Infrastructure/PostgresSearchIndex.cs`.
  * Bổ sung hàm `DeleteSubjectsBatchAsync` sử dụng SQL `DELETE ... WHERE subject_id = ANY(@ids)`.
  * Tối ưu `IndexChunksAsync`: Gom các chunk vào câu lệnh batch insert thay vì lặp từng dòng.
  * Tiêu chí kiểm chứng: Thời gian reindex 100 chunks giảm từ 1.2s xuống dưới 150ms.

- [x] T064 [TEST/UNIT] Xây dựng Unit Test `HybridMatchingEngineTests.cs`:
  * Đường dẫn file: `SourceCode/backend/tests/invariants/BrokerageHybridMatchingEngineInvariantsTests.cs`.
  * Kiểm thử công thức `ComputeHybridScore` với các trường hợp biên: $S_{\text{semantic}}=0, 100$; TRL chênh lệch 0, 1, 2, 3+ cấp; TNI 0, 85, 100; IP có bằng / chưa có bằng.
  * Kiểm thử tính toán trọng số $40\% - 30\% - 15\% - 15\%$ chính xác tuyệt đối.
  * Tiêu chí kiểm chứng: 100% tests pass (216/216 passed).

- [x] T065 [TEST/CHAOS] Xây dựng Chaos Integration Test `GracefulDegradationTests.cs`:
  * Đường dẫn file: `SourceCode/backend/tests/integration/GracefulDegradationTests.cs`.
  * Giả lập Python AI Sidecar không chạy (cổng 8003 connection refused hoặc timeout).
  * Gọi `GetRadarCandidatesAsync`: Xác thực hệ thống tự động fallback FTS, trả về `isDegraded = true`, `semanticEngine = "POSTGRES_FTS_FALLBACK"`, không có exception ném ra ngoài.
  * Tiêu chí kiểm chứng: Chaos test pass 100%.

- [x] T066 [TEST/E2E] Cập nhật Frontend Unit Test & Kịch bản Playwright E2E:
  * Đường dẫn file: `SourceCode/frontend/src/app/portal/matching/radar/page.test.tsx` và `SourceCode/frontend/tests/e2e/test_qc_task08_radar_matching_engine.py`.
  * Cập nhật test case kiểm tra render thẻ XAI với 4 điểm số thật (không còn mock text).
  * Kiểm tra thao tác nhấn nút "Tính toán lại đối soát" kích hoạt loading spinner và hiển thị thông báo.
  * Tiêu chí kiểm chứng: Vitest và Playwright E2E suites đạt 100% Green (9/9 passed).

---

### Khắc Phục 5 Defects Sau Bác Bỏ Gate 4 (Delta v6 CR-TASK-08-DELTA-03)

- [x] **DEFECT-BRK-01 [SEV-1] [BE] Khắc phục lỗi Npgsql 42P08 khi SELLER truy cập Radar**:
  * File: `SourceCode/backend/modules/brokerage/Application/BrokerageMatchingEngineService.cs`
  * Nguyên nhân: Tham số `@actorPersonId`, `@actorOrgId`, `@actorOrgIdStr` khi `DBNull.Value` bị Npgsql từ chối suy diễn kiểu (42P08).
  * Khắc phục: Gán tường minh `DbType = DbType.Guid` và `DbType = DbType.String` cho toàn bộ tham số truy vấn trong `GetRadarCandidatesAsync` và `RecomputeRadarForDemandAsync`.

- [x] **DEFECT-BRK-02 [SEV-1 / BẢO MẬT] [BE] Loại bỏ Anonymous Access trên Radar Endpoints**:
  * File: `SourceCode/backend/apps/api/V1Compat/BrokerageControllers.cs`
  * Nguyên nhân: Cả `GetRadarCandidates` và `RecomputeRadar` bị gắn `[AllowAnonymous]`, dẫn tới rò rỉ dữ liệu matching và bypass Scoped RBAC.
  * Khắc phục: Thay thế bằng `[Authorize]`, trích xuất Actor an toàn từ JWT Token.

- [x] **DEFECT-BRK-03 [SEV-2] [BE/UNIT] Mở rộng điểm SHTT cho Giải pháp hữu ích & Bản quyền phần mềm**:
  * Files: `SourceCode/backend/modules/brokerage/Application/BrokerageMatchingEngineService.cs`, `SourceCode/backend/tests/invariants/BrokerageHybridMatchingEngineInvariantsTests.cs`
  * Khắc phục: Bổ sung `UTILITY_MODEL` / `GIAI_PHAP_HUU_ICH` = 90.0 và `SOFTWARE_COPYRIGHT` / `TAC_QUYEN_PHAN_MEM` = 80.0 vào `EvaluateIpScore` và mô tả `ipDesc`. Thêm test case Invariant kiểm chứng 100% công thức.

- [x] **DEFECT-BRK-04 [SEV-2] [BE] Điền chuẩn xác buyer_organization_id & seller_organization_id từ CSDL thật**:
  * File: `SourceCode/backend/modules/brokerage/Application/BrokerageMatchingEngineService.cs`
  * Khắc phục: SELECT `s.enterprise_id` từ `demand_items` và parse `Guid` từ `managing_authority_id`/`scope_id` của `seller_technology_offers`. Cập nhật `UpsertMatchCandidateAsync` insert đúng Uuid vào CSDL thật PostgreSQL.

- [x] **DEFECT-BRK-05 [SEV-3] [TEST] Fix flaky collision trong GracefulDegradationTests.cs**:
  * File: `SourceCode/backend/tests/integration/GracefulDegradationTests.cs`
  * Khắc phục: Thay thế mã cố định `OFF-CHAOS-001` và `DMD-CHAOS-001` bằng định dạng động duy nhất `$"DMD-CHAOS-{Guid.NewGuid():N}"` và `$"OFF-CHAOS-{Guid.NewGuid():N}"`, truyền động mã demand vào `RecomputeRadarForDemandAsync`.

---

### Khắc Phục 3 Lỗi Thực Tế Trong Phúc Tra Vòng 2 (Lệnh Khẩn PO)

- [x] **DEFECT-BRK-06 [SEV-1 CRITICAL] [FE] Bổ sung Auth Header cho API getRadarCandidates**:
  * File: `SourceCode/frontend/src/services/api/brokerage.ts`
  * Khắc phục: Bổ sung headers `{ ...authClient.getAuthHeaders(), 'Content-Type': 'application/json' }`, chấm dứt hoàn toàn lỗi đỏ 401 Unauthorized trên Web Portal.

- [x] **DEFECT-BRK-07 [SEV-1 CRITICAL] [BE] Sửa sai tên cột trong demand.demand_surveys**:
  * File: `SourceCode/backend/modules/brokerage/Application/BrokerageMatchingEngineService.cs`
  * Khắc phục: Đổi `s.organization_name` thành `s.company_name` đúng theo schema CSDL PostgreSQL thực tế.

- [x] **DEFECT-BRK-08 [SEV-3] [TEST] Thêm cột NOT NULL technical_problem trong GracefulDegradationTests**:
  * File: `SourceCode/backend/tests/integration/GracefulDegradationTests.cs`
  * Khắc phục: Bổ sung trường bắt buộc `technical_problem` trong câu lệnh INSERT vào `demand.demand_items`.








