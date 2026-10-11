# Implementation Tasks: TASK-08 Kết Nối Cung–Cầu & Quản Lý Cơ Hội Hợp Tác

**Feature**: `TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
**Spec Reference**: [`spec.md`](./spec.md) | **Plan Reference**: [`plan.md`](./plan.md)  
**Status**: Completed (100% Shipped & QC Zero-Mock Verified)  

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
