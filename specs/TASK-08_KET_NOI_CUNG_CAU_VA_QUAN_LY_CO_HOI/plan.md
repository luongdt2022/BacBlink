# Implementation Plan: TASK-08 Kết Nối Cung–Cầu & Quản Lý Cơ Hội Hợp Tác

**Feature Directory**: `specs/TASK-08_KET_NOI_CUNG_CAU_VA_QUAN_LY_CO_HOI`  
**Status**: Ready for Implementation (Gate 2 Approved)  

---

## 1. Kiến Trúc Tổng Thể & Module Boundary

Dự án áp dụng mô hình **Modular Monolith & Clean Architecture**:
- Phân hệ kỹ thuật: `SourceCode/backend/modules/brokerage/` (`NacenTech.Modules.Brokerage`)
- Tầng Domain: Thực thể `MatchCandidate`, `ConnectionRequest`, `Opportunity`, `DealDiscussion`, `MouAgreement`.
- Tầng Application: Use cases, DTOs, Repository interfaces, và `MatchingEngineService`.
- Tầng Infrastructure: EF Core DbContext mapping vào schema `brokerage` trên PostgreSQL.
- Tầng Presentation: `BrokerageControllers.cs` tại `SourceCode/backend/apps/api/V1Compat/` và `V2/`.

---

## 2. Lược Đồ Cơ Sở Dữ Liệu PostgreSQL (Schema: `brokerage`)

```sql
-- 1. Bảng Ứng viên ghép cặp (Match Candidates Cache)
CREATE TABLE IF NOT EXISTS brokerage.match_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID NOT NULL,
    demand_code VARCHAR(50) NOT NULL,
    demand_title VARCHAR(255) NOT NULL,
    buyer_organization_id UUID NOT NULL,
    buyer_organization_name VARCHAR(255) NOT NULL,
    offer_id UUID NOT NULL,
    offer_code VARCHAR(50) NOT NULL,
    offer_title VARCHAR(255) NOT NULL,
    seller_organization_id UUID NOT NULL,
    seller_organization_name VARCHAR(255) NOT NULL,
    sector_code VARCHAR(50) NOT NULL,
    match_score INT NOT NULL,
    tni_score INT NOT NULL,
    trl_level INT NOT NULL,
    ip_status VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Bảng Yêu cầu kết nối (Connection Requests)
CREATE TABLE IF NOT EXISTS brokerage.connection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code VARCHAR(50) UNIQUE NOT NULL,
    sender_user_id UUID NOT NULL,
    sender_org_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL, -- BUYER | SELLER
    receiver_user_id UUID NOT NULL,
    receiver_org_name VARCHAR(255) NOT NULL,
    demand_id UUID NOT NULL,
    offer_id UUID NOT NULL,
    message TEXT NOT NULL,
    proposed_budget_range VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING | ACCEPTED | REJECTED | EXPIRED
    response_note TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bảng Cơ hội hợp tác (Opportunities Kanban)
CREATE TABLE IF NOT EXISTS brokerage.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_code VARCHAR(50) UNIQUE NOT NULL,
    connection_request_id UUID REFERENCES brokerage.connection_requests(id),
    title VARCHAR(255) NOT NULL,
    buyer_org_name VARCHAR(255) NOT NULL,
    buyer_contact_name VARCHAR(255) NOT NULL,
    buyer_contact_phone VARCHAR(50) NOT NULL,
    buyer_contact_email VARCHAR(100) NOT NULL,
    seller_org_name VARCHAR(255) NOT NULL,
    seller_contact_name VARCHAR(255) NOT NULL,
    seller_contact_phone VARCHAR(50) NOT NULL,
    seller_contact_email VARCHAR(100) NOT NULL,
    assigned_expert_name VARCHAR(255),
    managing_authority_id VARCHAR(50),
    stage VARCHAR(50) NOT NULL DEFAULT 'SUGGESTED', -- SUGGESTED | REQUESTED | NEGOTIATION | DRAFTING_MOU | CLOSED_WON | CLOSED_LOST
    estimated_value_million_vnd INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bảng Nhật ký trao đổi Deal Room (Deal Discussions)
CREATE TABLE IF NOT EXISTS brokerage.deal_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES brokerage.opportunities(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL, -- BUYER | SELLER | EXPERT | GOV
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Bảng Biên bản ghi nhớ (MOU Agreements)
CREATE TABLE IF NOT EXISTS brokerage.mou_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mou_code VARCHAR(50) UNIQUE NOT NULL,
    opportunity_id UUID NOT NULL REFERENCES brokerage.opportunities(id) ON DELETE CASCADE,
    scope_of_work TEXT NOT NULL,
    pilot_duration_months INT NOT NULL DEFAULT 6,
    commercial_terms TEXT NOT NULL,
    intellectual_property_terms TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT | SIGNED | REJECTED
    signed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Thiết Kế Frontend UI/UX (5 UX States & 4 Màn Hình)

1. `/portal/matching/radar` (Radar Ghép Nối 2 Chiều):
   - Grid thẻ ứng viên có Match Score Ring SVG, chỉ số TNI, TRL, huy hiệu Patent.
   - Nút "Gửi Yêu Cầu Kết Nối" mở Modal kèm masking thông tin liên hệ PDPD.
2. `/portal/opportunities/pipeline` (Pipeline Quản Lý Cơ Hội Kanban):
   - 5 cột kéo thả / chuyển stage: Gợi ý $\rightarrow$ Yêu cầu $\rightarrow$ Đàm phán $\rightarrow$ Soạn MOU $\rightarrow$ Hoàn tất.
3. `/portal/opportunities/[id]/deal-room` (Phòng Đàm Phán Hợp Tác 1-1 & Soạn Thảo MOU):
   - Giao diện 2 cột: Cột trái (Thông tin ca, hồ sơ Demand & Offer, liên hệ Unmasked), Cột phải (Hộp thoại trao đổi Deal Discussion + Modal Soạn thảo MOU).
4. `/gov/opportunities` (Cổng Tác Nghiệp Lãnh Đạo Sở KH&CN):
   - Thống kê cơ hội theo địa bàn, cảnh báo yêu cầu kết nối > 48h quá hạn SLA, bộ lọc trạng thái.

Tất cả các màn hình tuân thủ:
- Thư viện Design System chung (`globals.css`, Brand colors, Dark Mode).
- Chuẩn hóa 5 UX States qua component `<Async>`.
- Responsive hoàn toàn trên Desktop, Tablet và Mobile.
