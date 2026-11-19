-- =============================================================================
-- BACLINK Slim Edition Clean-Sweep Script (Idempotent, Zero-Mock)
-- Task: T-00.BL07.01 (CR-BACLINK-007 / PO-DEC-BACLINK-06)
-- Target PostgreSQL: nacentech (container nacentech-postgres-1)
-- Owner: Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. TÁCH FK TRƯỚC KHI DỌN BẢNG PHIẾU KHẢO SÁT / TT17 / ĐMST
-- (demand.demand_items.survey_id -> demand.demand_surveys ON DELETE CASCADE)
-- -----------------------------------------------------------------------------
UPDATE demand.demand_items
SET survey_id = NULL,
    updated_at = NOW()
WHERE id::text LIKE 'bac10000-0000-4000-8006-%'
  AND survey_id IS NOT NULL;

DELETE FROM assessment.tt17_assessments;
DELETE FROM demand.tt17_self_assessment_items;
DELETE FROM demand.tt17_self_assessments;
DELETE FROM demand.survey_submissions;
DELETE FROM demand.demand_surveys;
DELETE FROM enterprise.innovation_evaluations;

-- Gỡ chính sách neo Blockchain TT17 cũ
DELETE FROM blockchain.anchor_policies
WHERE entity_type = 'TT17_ASSESSMENT';

UPDATE blockchain.anchor_policies
SET display_name = CASE entity_type
    WHEN 'SELLER_OFFER' THEN 'Hồ sơ Năng lực & Chào bán Công nghệ BACLINK'
    WHEN 'DEAL_ROOM_MOU' THEN 'Biên bản Ghi nhớ Hợp tác Chuỗi cung ứng (MOU)'
    WHEN 'ENTERPRISE_PROFILE' THEN 'Hồ sơ Doanh nghiệp Hội viên BACLINK'
    ELSE display_name
END,
updated_at = NOW();

DELETE FROM blockchain.anchor_records
WHERE entity_type IN ('TT17_ASSESSMENT', 'TEST_TYPE');

UPDATE blockchain.anchor_records
SET entity_code = 'OFF-BL-2026-001'
WHERE entity_type = 'SELLER_OFFER'
  AND entity_code NOT LIKE 'OFF-BL-%';

-- -----------------------------------------------------------------------------
-- 2. LÀM SẠCH ENTERPRISE.ENTERPRISES (ĐÚNG 7 DOANH NGHIỆP HỘI VIÊN BẮC NINH)
-- -----------------------------------------------------------------------------
DELETE FROM enterprise.enterprises
WHERE id NOT IN (
    'bac10000-0000-4000-8002-000000000001',
    'bac10000-0000-4000-8002-000000000002',
    'bac10000-0000-4000-8002-000000000003',
    'bac10000-0000-4000-8002-000000000004',
    'bac10000-0000-4000-8002-000000000005',
    'bac10000-0000-4000-8002-000000000006',
    'bac10000-0000-4000-8002-000000000007'
);

UPDATE enterprise.enterprises
SET description = REGEXP_REPLACE(COALESCE(description, ''), '^\[Dữ liệu demo mẫu\]\s*', ''),
    latest_tt17_score = NULL,
    latest_tt17_classification = NULL,
    latest_tt17_sync_coeff = NULL,
    latest_innovation_tier = NULL,
    latest_innovation_score = NULL,
    subject_type = 'ENTERPRISE',
    status = 'ACTIVE',
    is_verified = true,
    verification_status = 'VERIFIED',
    capability_tier = 'DUAL',
    is_buyer = true,
    is_seller = true,
    updated_at = NOW()
WHERE id::text LIKE 'bac10000-0000-4000-8002-%';

-- -----------------------------------------------------------------------------
-- 3. LÀM SẠCH LMS.LEARNING_MATERIALS (ĐÚNG 6 KHÓA HỌC CÔNG NGHIỆP LMS-BL-001..006)
-- -----------------------------------------------------------------------------
DELETE FROM matching.search_chunks
WHERE subject_id IN (
    SELECT id FROM lms.learning_materials WHERE material_code NOT LIKE 'LMS-BL-%'
);

DELETE FROM matching.content_chunks
WHERE subject_id IN (
    SELECT id FROM lms.learning_materials WHERE material_code NOT LIKE 'LMS-BL-%'
);

DELETE FROM lms.learning_materials
WHERE material_code NOT LIKE 'LMS-BL-%';

UPDATE lms.learning_materials
SET status = 'PUBLISHED',
    is_deleted = false,
    deleted_at = NULL,
    created_by_name = 'Ban Đào tạo Hiệp hội BACLINK',
    updated_at = NOW()
WHERE material_code LIKE 'LMS-BL-%';

-- -----------------------------------------------------------------------------
-- 4. LÀM SẠCH BROKERAGE.EXPERT_PROFILES (ĐÚNG 5 CỐ VẤN KỸ THUẬT CG-BL-001..005)
-- -----------------------------------------------------------------------------
DELETE FROM lms.learning_material_instructors
WHERE expert_profile_id IS NOT NULL
  AND expert_profile_id NOT IN (
      'bac10000-0000-4000-8009-000000000001',
      'bac10000-0000-4000-8009-000000000002',
      'bac10000-0000-4000-8009-000000000003',
      'bac10000-0000-4000-8009-000000000004',
      'bac10000-0000-4000-8009-000000000005'
  );

DELETE FROM brokerage.expert_profiles
WHERE expert_code NOT IN ('CG-BL-001', 'CG-BL-002', 'CG-BL-003', 'CG-BL-004', 'CG-BL-005');

UPDATE brokerage.expert_profiles
SET organization_name = 'Ban Chuyển đổi Xanh & Năng lượng Sạch BACLINK',
    updated_at = NOW()
WHERE expert_code = 'CG-BL-005';

UPDATE brokerage.expert_profiles
SET status = 'APPROVED',
    visibility_status = 'PUBLIC',
    is_accepting_consultation = true,
    updated_at = NOW()
WHERE expert_code IN ('CG-BL-001', 'CG-BL-002', 'CG-BL-003', 'CG-BL-004', 'CG-BL-005');

UPDATE lms.learning_material_instructors
SET org_name = 'Ban Chuyển đổi Xanh & Năng lượng Sạch BACLINK'
WHERE expert_profile_id = 'bac10000-0000-4000-8009-000000000005';

-- Dọn phiếu tư vấn & dự án giả lập chứa Sở KH&CN Hà Nội / HTX Nông nghiệp
DELETE FROM brokerage.expert_consultations
WHERE id::text LIKE 'b0000000-%'
   OR COALESCE(assigned_by_department, '') ILIKE '%Sở%'
   OR COALESCE(enterprise_name, '') ILIKE '%Nacen%';

DELETE FROM brokerage.expert_projects
WHERE id::text LIKE 'c0000000-%'
   OR COALESCE(partner_org_name, '') ILIKE '%HTX%'
   OR COALESCE(partner_org_name, '') ILIKE '%Hợp Tác Xã%';

-- -----------------------------------------------------------------------------
-- 5. LÀM SẠCH IDENTITY.PERSONS (<= 28 DÒNG, 3 CẤP BACLINK, GLOBAL SCOPE)
-- -----------------------------------------------------------------------------
DELETE FROM identity.approval_audit_logs;
DELETE FROM identity.approval_requests;

DELETE FROM identity.activation_tokens
WHERE person_id IN (
    SELECT id FROM identity.persons WHERE email IN ('admin.super@nacentech.local', 'expert.demo@nacentech.local')
);

DELETE FROM identity.password_reset_tokens
WHERE person_id IN (
    SELECT id FROM identity.persons WHERE email IN ('admin.super@nacentech.local', 'expert.demo@nacentech.local')
);

DELETE FROM identity.persons
WHERE email IN ('admin.super@nacentech.local', 'expert.demo@nacentech.local');

UPDATE identity.persons
SET organization_name = 'Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)',
    platform_role = 'ADMIN',
    scope_type = 'GLOBAL',
    scope_id = NULL,
    updated_at = NOW()
WHERE email = 'admin@baclink.org.vn';

UPDATE identity.persons
SET organization_name = 'Ban Chuyển đổi Xanh & Năng lượng Sạch BACLINK',
    platform_role = 'ENTERPRISE',
    scope_type = 'GLOBAL',
    scope_id = NULL,
    updated_at = NOW()
WHERE email = 'dang.vh@baclink.org.vn';

-- Trung lập hóa 100% tên & đơn vị của các tài khoản test @demo.nacentech.vn sang chuẩn Bắc Ninh
UPDATE identity.persons
SET first_name = CASE email
        WHEN 'super.admin@demo.nacentech.vn' THEN 'Quản trị'
        WHEN 'operator.admin@demo.nacentech.vn' THEN 'Điều phối'
        WHEN 'buyer.user@demo.nacentech.vn' THEN 'Đại diện'
        WHEN 'seller.user@demo.nacentech.vn' THEN 'Đại diện'
        WHEN 'innovation.entity@demo.nacentech.vn' THEN 'Hội viên'
        WHEN 'expert.user@demo.nacentech.vn' THEN 'Cố vấn'
        WHEN 'public.user@demo.nacentech.vn' THEN 'Đối tác'
        ELSE first_name
    END,
    last_name = CASE email
        WHEN 'super.admin@demo.nacentech.vn' THEN 'Hệ thống BACLINK'
        WHEN 'operator.admin@demo.nacentech.vn' THEN 'Vận hành BACLINK'
        WHEN 'buyer.user@demo.nacentech.vn' THEN 'Mua hàng KCN'
        WHEN 'seller.user@demo.nacentech.vn' THEN 'Cung ứng KCN'
        WHEN 'innovation.entity@demo.nacentech.vn' THEN 'Sản xuất Bắc Ninh'
        WHEN 'expert.user@demo.nacentech.vn' THEN 'Kỹ thuật KCN'
        WHEN 'public.user@demo.nacentech.vn' THEN 'Khách tham quan'
        ELSE last_name
    END,
    organization_name = CASE email
        WHEN 'super.admin@demo.nacentech.vn' THEN 'Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)'
        WHEN 'operator.admin@demo.nacentech.vn' THEN 'Văn phòng Hiệp hội BACLINK Bắc Ninh'
        WHEN 'buyer.user@demo.nacentech.vn' THEN 'Công ty Cổ phần Hanel PT'
        WHEN 'seller.user@demo.nacentech.vn' THEN 'Công ty Cổ phần Tập đoàn Công nghiệp INTECH'
        WHEN 'innovation.entity@demo.nacentech.vn' THEN 'Doanh nghiệp Hội viên Công nghiệp Bắc Ninh'
        WHEN 'expert.user@demo.nacentech.vn' THEN 'Ban Cố vấn Kỹ thuật Hiệp hội BACLINK'
        WHEN 'public.user@demo.nacentech.vn' THEN 'Khách tham quan Cổng Kết nối BACLINK'
        ELSE organization_name
    END,
    platform_role = CASE
        WHEN platform_role IN ('ADMIN', 'SUPER_ADMIN', 'OPERATOR_ADMIN') THEN 'ADMIN'
        WHEN platform_role IN ('ENTERPRISE', 'SELLER', 'BUYER', 'INNOVATION_ENTITY', 'VERIFIED_EXPERT') THEN 'ENTERPRISE'
        ELSE 'PUBLIC_USER'
    END,
    scope_type = 'GLOBAL',
    scope_id = NULL,
    updated_at = NOW()
WHERE email LIKE '%@demo.nacentech.vn';

-- Đảm bảo 100% tài khoản còn lại tuân thủ 3 cấp BACLINK & GLOBAL scope
UPDATE identity.persons
SET platform_role = CASE
        WHEN platform_role IN ('ADMIN', 'SUPER_ADMIN', 'OPERATOR_ADMIN') THEN 'ADMIN'
        WHEN platform_role IN ('ENTERPRISE', 'SELLER', 'BUYER', 'INNOVATION_ENTITY', 'VERIFIED_EXPERT') THEN 'ENTERPRISE'
        ELSE 'PUBLIC_USER'
    END,
    scope_type = 'GLOBAL',
    scope_id = NULL
WHERE platform_role NOT IN ('ADMIN', 'ENTERPRISE', 'PUBLIC_USER')
   OR scope_type <> 'GLOBAL'
   OR scope_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 6. LÀM SẠCH SELLER_TECHNOLOGY_OFFERS (ĐÚNG 10 SẢN PHẨM/NĂNG LỰC IND_* BACLINK)
-- -----------------------------------------------------------------------------
DELETE FROM matching.search_chunks
WHERE subject_id IN (
    SELECT id FROM technology.seller_technology_offers WHERE id::text NOT LIKE 'bac10000-0000-4000-8003-%'
);

DELETE FROM matching.content_chunks
WHERE subject_id IN (
    SELECT id FROM technology.seller_technology_offers WHERE id::text NOT LIKE 'bac10000-0000-4000-8003-%'
);

DELETE FROM technology.offer_spec_values
WHERE offer_id::text NOT LIKE 'bac10000-0000-4000-8003-%';

DELETE FROM technology.offer_documents
WHERE offer_id::text NOT LIKE 'bac10000-0000-4000-8003-%';

DELETE FROM technology.seller_technology_offers
WHERE id::text NOT LIKE 'bac10000-0000-4000-8003-%';

-- Bỏ tiền tố '[Dữ liệu demo mẫu] ' và đồng bộ MST về đúng 7 DN Hội viên Bắc Ninh thực tế
UPDATE technology.seller_technology_offers
SET title = REGEXP_REPLACE(title, '^\[Dữ liệu demo mẫu\]\s*', ''),
    summary = REGEXP_REPLACE(COALESCE(summary, ''), '^\[Dữ liệu demo mẫu\]\s*', ''),
    problem_solved = REGEXP_REPLACE(COALESCE(problem_solved, ''), '^\[Dữ liệu demo mẫu\]\s*', ''),
    enterprise_tax_code = CASE offer_code
        WHEN 'OFF-BL-2026-008' THEN '2300900006'
        WHEN 'OFF-BL-2026-009' THEN '2300881920'
        WHEN 'OFF-BL-2026-010' THEN '2300900007'
        ELSE enterprise_tax_code
    END,
    enterprise_name = CASE offer_code
        WHEN 'OFF-BL-2026-008' THEN 'Công ty TNHH Tự động hóa & Robot VSIP'
        WHEN 'OFF-BL-2026-009' THEN 'Công ty Cổ phần Tập đoàn Công nghiệp INTECH'
        WHEN 'OFF-BL-2026-010' THEN 'Công ty Cổ phần Bao bì Công nghiệp Quế Võ'
        ELSE enterprise_name
    END,
    developer_origin = CASE offer_code
        WHEN 'OFF-BL-2026-008' THEN 'Công ty TNHH Tự động hóa & Robot VSIP'
        WHEN 'OFF-BL-2026-009' THEN 'Công ty Cổ phần Tập đoàn Công nghiệp INTECH'
        WHEN 'OFF-BL-2026-010' THEN 'Công ty Cổ phần Bao bì Công nghiệp Quế Võ'
        ELSE developer_origin
    END,
    managing_authority_id = 'BACLINK',
    managing_authority_name = 'Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)',
    scope_type = 'GLOBAL',
    scope_id = NULL,
    status = 'APPROVED',
    is_deleted = false,
    deleted_at = NULL,
    updated_at = NOW()
WHERE id::text LIKE 'bac10000-0000-4000-8003-%';

-- -----------------------------------------------------------------------------
-- 7. LÀM SẠCH DEMAND.DEMAND_ITEMS (ĐÚNG 8 NHU CẦU ĐẶT HÀNG IND_* BACLINK)
-- -----------------------------------------------------------------------------
DELETE FROM matching.search_chunks
WHERE subject_id IN (
    SELECT id FROM demand.demand_items WHERE id::text NOT LIKE 'bac10000-0000-4000-8006-%'
);

DELETE FROM matching.content_chunks
WHERE subject_id IN (
    SELECT id FROM demand.demand_items WHERE id::text NOT LIKE 'bac10000-0000-4000-8006-%'
);

DELETE FROM demand.demand_bookmarks
WHERE demand_item_id::text NOT LIKE 'bac10000-0000-4000-8006-%';

DELETE FROM demand.demand_items
WHERE id::text NOT LIKE 'bac10000-0000-4000-8006-%';

UPDATE demand.demand_items
SET stage_name = REGEXP_REPLACE(stage_name, '^\[Dữ liệu demo mẫu\]\s*', ''),
    technical_problem = REGEXP_REPLACE(technical_problem, '^\[Dữ liệu demo mẫu\]\s*', ''),
    desired_solution = REGEXP_REPLACE(COALESCE(desired_solution, ''), '^\[Dữ liệu demo mẫu\]\s*', ''),
    expected_goal = REGEXP_REPLACE(COALESCE(expected_goal, ''), '^\[Dữ liệu demo mẫu\]\s*', ''),
    verified_authority_name = 'Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)',
    status = 'VERIFIED',
    is_public_listed = true,
    survey_id = NULL,
    updated_at = NOW()
WHERE id::text LIKE 'bac10000-0000-4000-8006-%';

-- -----------------------------------------------------------------------------
-- 8. LÀM SẠCH CONTENT.TECHMART_EVENTS (CHỈ GIỮ SỰ KIỆN THỰC TẾ BACLINK BẮC NINH)
-- -----------------------------------------------------------------------------
DELETE FROM content.event_registrations
WHERE event_id::text NOT LIKE 'bac10000-0000-4000-8007-%';

DELETE FROM content.techmart_events
WHERE id::text NOT LIKE 'bac10000-0000-4000-8007-%';

UPDATE content.techmart_events
SET location = 'Trung tâm Văn hóa & Triển lãm Kinh Bắc, TP. Bắc Ninh',
    updated_at = NOW()
WHERE id = 'bac10000-0000-4000-8007-000000000005';

-- -----------------------------------------------------------------------------
-- 9. LÀM SẠCH BROKERAGE CONNECTIONS & OPPORTUNITIES (KHÔNG CÒN SO_KHCN_HN / NACENTWIN)
-- -----------------------------------------------------------------------------
DELETE FROM brokerage.deal_discussions
WHERE opportunity_id::text NOT LIKE 'bac10000-0000-4000-8012-%';

DELETE FROM brokerage.mou_agreements
WHERE opportunity_id::text NOT LIKE 'bac10000-0000-4000-8012-%';

DELETE FROM brokerage.opportunities
WHERE id::text NOT LIKE 'bac10000-0000-4000-8012-%';

DELETE FROM brokerage.connection_requests
WHERE id::text NOT LIKE 'bac10000-0000-4000-8011-%';

INSERT INTO brokerage.connection_requests (
    id, request_code, sender_user_id, sender_org_name, sender_role,
    receiver_user_id, receiver_org_name, demand_id, offer_id, target_offer_id,
    buyer_organization_id, seller_organization_id,
    message, proposed_budget_range, status, response_note, responded_at, created_at
)
VALUES
(
    'bac10000-0000-4000-8011-000000000001', 'CONN-BL-2026-001',
    'bac10000-0000-4000-8001-000000000002', 'Công ty Cổ phần Hanel PT', 'BUYER',
    'bac10000-0000-4000-8001-000000000008', 'Công ty TNHH Tự động hóa & Robot VSIP',
    'bac10000-0000-4000-8006-000000000001', 'bac10000-0000-4000-8003-000000000006', 'bac10000-0000-4000-8003-000000000006',
    'bac10000-0000-4000-8002-000000000001', 'bac10000-0000-4000-8002-000000000006',
    'Đề nghị khảo sát dây chuyền SMT tại KCN Tiên Sơn và báo giá trạm kiểm tra ngoại quan Camera AI.',
    '1.5 - 3 tỷ VND', 'ACCEPTED', 'Đã thống nhất lịch khảo sát hiện trường tại KCN Tiên Sơn.',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '7 days'
),
(
    'bac10000-0000-4000-8011-000000000002', 'CONN-BL-2026-002',
    'bac10000-0000-4000-8001-000000000003', 'Công ty Cổ phần Tập đoàn Công nghiệp INTECH', 'BUYER',
    'bac10000-0000-4000-8001-000000000004', 'Công ty TNHH Công nghiệp Viqualita',
    'bac10000-0000-4000-8006-000000000002', 'bac10000-0000-4000-8003-000000000003', 'bac10000-0000-4000-8003-000000000003',
    'bac10000-0000-4000-8002-000000000002', 'bac10000-0000-4000-8002-000000000003',
    'Đặt hàng gia công cụm đồ gá và trục truyền động CNC cho lô 300 xe tự hành AGV tại KCN VSIP Bắc Ninh.',
    '2 - 4 tỷ VND/năm', 'COMPLETED', 'Đã hoàn tất nghiệm thu lô mẫu T1 đạt dung sai ±0.005mm.',
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '14 days'
),
(
    'bac10000-0000-4000-8011-000000000003', 'CONN-BL-2026-003',
    'bac10000-0000-4000-8001-000000000007', 'Công ty Cổ phần Nhựa Kỹ thuật Yên Phong', 'BUYER',
    'bac10000-0000-4000-8001-000000000006', 'Công ty TNHH Cơ khí Chính xác Kinh Bắc',
    'bac10000-0000-4000-8006-000000000004', 'bac10000-0000-4000-8003-000000000004', 'bac10000-0000-4000-8003-000000000004',
    'bac10000-0000-4000-8002-000000000005', 'bac10000-0000-4000-8002-000000000004',
    'Yêu cầu tư vấn thiết kế & báo giá chế tạo 06 bộ khuôn ép phun khay nhựa chống tĩnh điện ESD.',
    '1 - 2.2 tỷ VND', 'ACCEPTED', 'Phòng kỹ thuật Kinh Bắc đã gửi bản vẽ sơ bộ 3D.',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO UPDATE SET
    sender_org_name = EXCLUDED.sender_org_name,
    receiver_org_name = EXCLUDED.receiver_org_name,
    status = EXCLUDED.status,
    response_note = EXCLUDED.response_note;

INSERT INTO brokerage.opportunities (
    id, opportunity_code, connection_request_id, title,
    buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
    seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
    assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
    created_at, updated_at
)
VALUES
(
    'bac10000-0000-4000-8012-000000000001', 'DEAL-BL-2026-001',
    'bac10000-0000-4000-8011-000000000001',
    'Triển khai Trạm Kiểm tra Quang học AOI 3D AI cho Dây chuyền SMT tại KCN Tiên Sơn',
    'Công ty Cổ phần Hanel PT', 'Nguyễn Minh Tuấn', '02223714568', 'member.hanelpt@baclink.org.vn',
    'Công ty TNHH Tự động hóa & Robot VSIP', 'Lê Anh Dũng', '02223810006', 'member.vsip@baclink.org.vn',
    'TS. Nguyễn Minh Khôi', 'BACLINK', 'NEGOTIATION', 2200,
    NOW() - INTERVAL '5 days', NOW()
),
(
    'bac10000-0000-4000-8012-000000000002', 'DEAL-BL-2026-002',
    'bac10000-0000-4000-8011-000000000002',
    'Cung ứng Định kỳ Khung Cơ khí & Trục Truyền động CNC cho Đội xe AGV 500kg',
    'Công ty Cổ phần Tập đoàn Công nghiệp INTECH', 'Cao Hoàng Hiệp', '02223901234', 'member.intech@baclink.org.vn',
    'Công ty TNHH Công nghiệp Viqualita', 'Trần Quốc Cường', '02223886543', 'member.viqualita@baclink.org.vn',
    'ThS. Trần Hoàng Sơn', 'BACLINK', 'MOU_SIGNED', 3000,
    NOW() - INTERVAL '10 days', NOW()
),
(
    'bac10000-0000-4000-8012-000000000003', 'DEAL-BL-2026-003',
    'bac10000-0000-4000-8011-000000000003',
    'Chế tạo 06 Bộ Khuôn Ép phun Đa lòng Khay Linh kiện Bán dẫn ESD',
    'Công ty Cổ phần Nhựa Kỹ thuật Yên Phong', 'Hoàng Thị Mai', '02223810005', 'member.nhuayenphong@baclink.org.vn',
    'Công ty TNHH Cơ khí Chính xác Kinh Bắc', 'Đỗ Văn Cương', '02223810004', 'member.kinhbac@baclink.org.vn',
    'PGS.TS. Lê Thị Thu Hà', 'BACLINK', 'INITIATED', 1600,
    NOW() - INTERVAL '2 days', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    buyer_org_name = EXCLUDED.buyer_org_name,
    seller_org_name = EXCLUDED.seller_org_name,
    assigned_expert_name = EXCLUDED.assigned_expert_name,
    managing_authority_id = 'BACLINK',
    stage = EXCLUDED.stage,
    estimated_value_million_vnd = EXCLUDED.estimated_value_million_vnd,
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 10. TẠO LẠI 4 BẢN GHI IDENTITY.APPROVAL_REQUESTS SẠCH CHUẨN BACLINK (GLOBAL)
-- -----------------------------------------------------------------------------
INSERT INTO identity.approval_requests (
    id, user_id, request_type, scope_type, scope_id, payload_json, status,
    reviewed_by_id, review_note, sla_deadline_utc, version, created_at, updated_at
)
VALUES
(
    'bac10000-0000-4000-8013-000000000001',
    'bac10000-0000-4000-8001-000000000002',
    'ENTERPRISE_MEMBERSHIP', 'GLOBAL', NULL,
    '{"companyName":"Công ty Cổ phần Hanel PT","taxCode":"0101420901","mainSector":"IND_ELEC","industrialZone":"KCN Tiên Sơn, TP. Từ Sơn, Bắc Ninh","authorityId":"BACLINK","submittedAt":"2026-11-10T08:30:00Z"}',
    'APPROVED',
    'bac10000-0000-4000-8001-000000000001',
    'Đã xác thực tư cách Hội viên chính thức Hiệp hội BACLINK và kích hoạt chế độ Giao thương Kép (DUAL).',
    NOW() + INTERVAL '48 hours', 1, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'
),
(
    'bac10000-0000-4000-8013-000000000002',
    'bac10000-0000-4000-8001-000000000003',
    'SHOP', 'GLOBAL', NULL,
    '{"orgName":"Công ty Cổ phần Tập đoàn Công nghiệp INTECH","taxCode":"2300881920","mainSector":"IND_AUTO","industrialZone":"KCN VSIP Bắc Ninh, TP. Từ Sơn, Bắc Ninh","authorityId":"BACLINK","description":"Gian hàng năng lực tự động hóa, AGV/AMR và kho thông minh AS/RS.","submittedAt":"2026-11-12T09:15:00Z"}',
    'APPROVED',
    'bac10000-0000-4000-8001-000000000001',
    'Hồ sơ năng lực sản xuất đạt chuẩn chuỗi cung ứng KCN Bắc Ninh.',
    NOW() + INTERVAL '48 hours', 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'
),
(
    'bac10000-0000-4000-8013-000000000003',
    'bac10000-0000-4000-8001-000000000006',
    'SHOP', 'GLOBAL', NULL,
    '{"orgName":"Công ty TNHH Cơ khí Chính xác Kinh Bắc","taxCode":"2300900004","mainSector":"IND_MECH","industrialZone":"KCN Quế Võ I, TX. Quế Võ, Bắc Ninh","authorityId":"BACLINK","description":"Đăng ký bổ sung hồ sơ năng lực chế tạo khuôn đột dập liên hoàn.","submittedAt":"2026-11-16T14:00:00Z"}',
    'PENDING_REVIEW',
    NULL, NULL,
    NOW() + INTERVAL '36 hours', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
),
(
    'bac10000-0000-4000-8013-000000000004',
    'bac10000-0000-4000-8001-000000000010',
    'EXPERT', 'GLOBAL', NULL,
    '{"fullName":"TS. Nguyễn Minh Khôi","email":"khoi.nm@baclink.org.vn","degree":"Tiến sĩ","expertiseSector":"IND_AUTO","organizationName":"Viện Tự động hóa Công nghiệp & Ban Cố vấn BACLINK","location":"KCN VSIP Bắc Ninh, TP. Từ Sơn, Bắc Ninh","authorityId":"BACLINK"}',
    'APPROVED',
    'bac10000-0000-4000-8001-000000000001',
    'Đã phê duyệt hồ sơ Ban Cố vấn Kỹ thuật Hiệp hội BACLINK.',
    NOW() + INTERVAL '48 hours', 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'
)
ON CONFLICT (id) DO UPDATE SET
    scope_type = 'GLOBAL',
    scope_id = NULL,
    payload_json = EXCLUDED.payload_json,
    status = EXCLUDED.status,
    review_note = EXCLUDED.review_note,
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 11. DEEP-AUDIT HYGIENE (T-00.BL07.06 QC SWEEP):
--     Đồng bộ owner_person_id Hanel PT/INTECH, chuẩn hóa email @demo.baclink.org.vn,
--     dọn sạch 6.592 bản ghi brokerage.match_candidates cũ & tạo đối sánh BACLINK thật,
--     chuẩn hóa organization_units, taxonomy_terms LV*, audit_events & platform logs.
-- -----------------------------------------------------------------------------
UPDATE enterprise.enterprises
SET owner_person_id = 'bac10000-0000-4000-8001-000000000002',
    updated_at = NOW()
WHERE id = 'bac10000-0000-4000-8002-000000000001';

UPDATE enterprise.enterprises
SET owner_person_id = 'bac10000-0000-4000-8001-000000000003',
    updated_at = NOW()
WHERE id = 'bac10000-0000-4000-8002-000000000002';

UPDATE identity.persons
SET email = REPLACE(email, '@demo.nacentech.vn', '@demo.baclink.org.vn'),
    updated_at = NOW()
WHERE email LIKE '%@demo.nacentech.vn';

DELETE FROM brokerage.match_candidates
WHERE demand_id::text NOT LIKE 'bac10000-0000-4000-8006-%'
   OR offer_id::text NOT LIKE 'bac10000-0000-4000-8003-%';

INSERT INTO brokerage.match_candidates (
    id, demand_id, demand_code, demand_title,
    buyer_organization_id, buyer_organization_name,
    offer_id, offer_code, offer_title,
    seller_organization_id, seller_organization_name,
    sector_code, match_score, tni_score, trl_level, ip_status, is_active, created_at
)
VALUES
(
    'bac10000-0000-4000-8014-000000000001',
    'bac10000-0000-4000-8006-000000000001', 'DMD-BL-2026-001', 'Kiểm tra chất lượng mối hàn SMT & bản mạch PCBA',
    'bac10000-0000-4000-8002-000000000001', 'Công ty Cổ phần Hanel PT',
    'bac10000-0000-4000-8003-000000000006', 'OFF-BL-2026-006', 'Trạm Kiểm tra Ngoại quan Quang học Tự động Camera AI (AOI 3D)',
    'bac10000-0000-4000-8002-000000000006', 'Công ty TNHH Tự động hóa & Robot VSIP',
    'IND_ELEC', 94, 88, 9, 'PATENT', true, NOW() - INTERVAL '3 days'
),
(
    'bac10000-0000-4000-8014-000000000002',
    'bac10000-0000-4000-8006-000000000002', 'DMD-BL-2026-002', 'Gia công khung vỏ & chi tiết cơ khí chính xác cho Robot AGV',
    'bac10000-0000-4000-8002-000000000002', 'Công ty Cổ phần Tập đoàn Công nghiệp INTECH',
    'bac10000-0000-4000-8003-000000000003', 'OFF-BL-2026-003', 'Gia công Đồ gá JIG Kiểm tra & Chi tiết Cơ khí CNC 5 Trục Độ chính xác ±0.005mm',
    'bac10000-0000-4000-8002-000000000003', 'Công ty TNHH Công nghiệp Viqualita',
    'IND_MECH', 92, 87, 9, 'NONE', true, NOW() - INTERVAL '2 days'
),
(
    'bac10000-0000-4000-8014-000000000003',
    'bac10000-0000-4000-8006-000000000004', 'DMD-BL-2026-004', 'Chế tạo khuôn ép phun đa lòng linh kiện nhựa kỹ thuật ESD',
    'bac10000-0000-4000-8002-000000000005', 'Công ty Cổ phần Nhựa Kỹ thuật Yên Phong',
    'bac10000-0000-4000-8003-000000000004', 'OFF-BL-2026-004', 'Khuôn Đột dập Liên hoàn & Gia công Kim loại Tấm Chính xác',
    'bac10000-0000-4000-8002-000000000004', 'Công ty TNHH Cơ khí Chính xác Kinh Bắc',
    'IND_MECH', 89, 78, 8, 'NONE', true, NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO UPDATE SET
    buyer_organization_name = EXCLUDED.buyer_organization_name,
    seller_organization_name = EXCLUDED.seller_organization_name,
    match_score = EXCLUDED.match_score,
    is_active = true;

DELETE FROM policy.taxonomy_terms
WHERE kind = 'SECTOR' AND code LIKE 'LV%' AND is_active = false;

UPDATE identity.organization_units
SET code = REPLACE(REPLACE(REPLACE(code, 'NACENTECH-CENTRAL', 'BACLINK-CENTRAL'), 'VIEN-NACENTECH', 'VIEN-CN-BACLINK'), 'SO-KHCN-', 'KCN-LIENKET-'),
    name = CASE
        WHEN code = 'NACENTECH-CENTRAL' THEN 'Văn phòng Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)'
        WHEN code = 'VIEN-NACENTECH' THEN 'Trung tâm Nghiên cứu & Chuyển giao Công nghiệp Bắc Ninh'
        ELSE REGEXP_REPLACE(name, '^(Sở Khoa học và Công nghệ|Sở KH&CN)\s*', 'Đầu mối Liên kết Công nghiệp ')
    END
WHERE code IN ('NACENTECH-CENTRAL', 'VIEN-NACENTECH')
   OR code LIKE 'SO-KHCN-%'
   OR name ~* '(NacenTech|Sở Khoa học|Sở KH&CN|Bộ KH&CN)';

UPDATE audit.audit_events
SET actor_role = CASE
        WHEN actor_role IN ('SUPER_ADMIN', 'PROVINCIAL_ADMIN', 'OPERATOR_ADMIN') THEN 'ADMIN'
        WHEN actor_role IN ('INNOVATION_ENTITY', 'VERIFIED_EXPERT') THEN 'ENTERPRISE'
        ELSE actor_role
    END,
    details = REGEXP_REPLACE(
        REGEXP_REPLACE(COALESCE(details, ''), 'SUPER_ADMIN|PROVINCIAL_ADMIN', 'ADMIN', 'g'),
        'INNOVATION_ENTITY', 'ENTERPRISE', 'g'
    )
WHERE actor_role IN ('SUPER_ADMIN', 'PROVINCIAL_ADMIN', 'OPERATOR_ADMIN', 'INNOVATION_ENTITY', 'VERIFIED_EXPERT')
   OR COALESCE(details, '') ~* '(SUPER_ADMIN|PROVINCIAL_ADMIN|INNOVATION_ENTITY|NacenTech|NacenTwin|TT17|Sở KH&CN)';

DELETE FROM platform.idempotency_records
WHERE COALESCE(response_body::text, '') ~* '(TT17|Sở KH&CN|Sở Khoa học|NacenTech|NacenTwin|ĐMST|SUPER_ADMIN|PROVINCIAL_ADMIN)';

DELETE FROM platform.job_queue
WHERE COALESCE(kind::text, '') ~* '(tt17|nacen)'
   OR COALESCE(last_error::text, '') ~* '(tt17|nacen)';

DELETE FROM platform.outbox_messages
WHERE COALESCE(type::text, '') ~* '(tt17|nacen)'
   OR COALESCE(payload::text, '') ~* '(TT17|Sở KH&CN|Sở Khoa học|NacenTech|NacenTwin|ĐMST|SUPER_ADMIN|PROVINCIAL_ADMIN)';

COMMIT;
