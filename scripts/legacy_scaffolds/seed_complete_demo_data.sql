-- ==============================================================================
-- NACENTECH: KỊCH BẢN KHỞI TẠO DỮ LIỆU DEMO HOÀN CHỈNH 4 CẤP (4 TIERS)
-- ==============================================================================

BEGIN;

-- 1. ĐỒNG BỘ MẬT KHẨU TẤT CẢ TÀI KHOẢN VỀ Password@123 (PBKDF2-V3)
UPDATE identity.persons 
SET password_hash = 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    password_hash_algorithm = 'pbkdf2-v3',
    is_active = true;

-- Cập nhật scope của chuyên gia về GLOBAL để bao quát không gian sàn môi giới
UPDATE identity.persons
SET scope_type = 'GLOBAL', scope_id = NULL
WHERE email = 'expert.demo@nacentech.local';

-- Đảm bảo có đầy đủ 4 tài khoản đại diện tiêu biểu cho 4 cấp:
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, 
    organization_name, platform_role, scope_type, scope_id, is_active, matching_auto,
    created_at, updated_at, preferences_updated_at, version
) VALUES 
-- CẤP 0: Quản trị Trung ương
('02f3b656-9676-4f4e-989c-5b54ced32a17', 'admin.super@nacentech.local', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==', 'pbkdf2-v3', 'Hệ thống Quản trị', 'NacenTech', 'Ban Quản Trị Hệ Thống', 'SUPER_ADMIN', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),
-- CẤP 1: Cơ quan Quản lý Nhà nước (Sở KH&CN Hà Nội)
('49b93bda-3207-4d27-9946-fbb2130b3859', 'hanoi.admin@demo.nacentech.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==', 'pbkdf2-v3', 'Trần Văn', 'Hà Nội', 'Sở Khoa học và Công nghệ Hà Nội', 'PROVINCIAL_ADMIN', 'PROVINCE', 'HN', true, false, NOW(), NOW(), NOW(), 1),
-- CẤP 2: Chuyên gia KH&CN đã xác thực
('01a0ead4-b6ff-7302-a130-fb0fe0c86c72', 'expert.demo@nacentech.local', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==', 'pbkdf2-v3', 'Minh An', 'Nguyễn', 'Viện Hàn lâm KH&CN Việt Nam', 'VERIFIED_EXPERT', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1),
-- CẤP 3: Doanh nghiệp / Người dùng Đại chúng
('01a111bf-7ac8-7c3e-84b4-0a555f848b17', 'testuser@example.com', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==', 'pbkdf2-v3', 'Hoàng Nam', 'Lê', 'Công ty Cổ phần TechCorp Việt Nam', 'PUBLIC_USER', 'GLOBAL', NULL, true, false, NOW(), NOW(), NOW(), 1)
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    password_hash_algorithm = EXCLUDED.password_hash_algorithm,
    is_active = true,
    platform_role = EXCLUDED.platform_role,
    scope_type = EXCLUDED.scope_type,
    scope_id = EXCLUDED.scope_id;

-- 2. DỮ LIỆU ĐẶC BIỆT CHI TIẾT CHO CHUYÊN GIA KH&CN (CẤP 2: VERIFIED_EXPERT)
-- Cập nhật hồ sơ gốc trong brokerage.expert_profiles
UPDATE brokerage.expert_profiles SET
    full_name = 'PGS.TS. Nguyễn Minh An',
    academic_rank = 'PGS',
    academic_rank_year = 2018,
    degree = 'DOCTOR',
    degree_year = 2010,
    organization_name = 'Viện Công nghệ Thông tin - Viện Hàn lâm KH&CN Việt Nam',
    organization_address = '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    position_title = 'Trưởng Phòng Thí nghiệm Trí tuệ Nhân tạo & Thị giác Máy tính',
    research_title = 'Nghiên cứu viên Cao cấp',
    expertise_sectors = ARRAY['LV05', 'LV08', 'LV01'],
    mastered_tech_codes = ARRAY['TECH-AI-VISION', 'TECH-FEDERATED-LEARNING', 'TECH-SMART-FACTORY'],
    consulting_summary = 'Tư vấn ứng dụng AI thị giác trong sản xuất thông minh; Đánh giá công nghệ & TRL; Thẩm định giải pháp chuyển đổi số công nghiệp.',
    public_bio = 'Hơn 15 năm kinh nghiệm nghiên cứu chuyên sâu và chuyển giao công nghệ trong lĩnh vực Trí tuệ nhân tạo (AI), Thị giác máy tính và Tự động hóa sản xuất thông minh. Đã chủ nhiệm 03 đề tài KH&CN cấp Nhà nước, công bố hơn 35 bài báo quốc tế (Scopus Q1/Q2), sở hữu 02 bằng độc quyền sáng chế và giải pháp hữu ích. Sẵn sàng tham gia hội đồng thẩm định, tư vấn và chuyển giao công nghệ cho doanh nghiệp.',
    status = 'APPROVED',
    visibility_status = 'PUBLIC',
    is_accepting_consultation = true,
    legal_oath = true,
    pdpd_consent_at_utc = NOW(),
    updated_at = NOW()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Bổ sung bài báo / công trình nghiên cứu (Publications)
DELETE FROM brokerage.expert_publications WHERE expert_profile_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO brokerage.expert_publications (
    id, expert_profile_id, title, author_role, journal, published_year, doi, indexing, display_order, is_active, is_public
) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Privacy-Preserving Federated Learning for Smart Manufacturing Systems', 'Chủ biên', 'IEEE Transactions on Industrial Informatics', 2024, '10.1109/TII.2024.1029384', 'Scopus Q1 / ISI', 1, true, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Real-time Defect Detection in High-speed Assembly Lines using Edge Vision Transformers', 'Đồng tác giả chính', 'Journal of Manufacturing Systems (Elsevier)', 2023, '10.1016/j.jmsy.2023.08.012', 'Scopus Q1', 2, true, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Explainable AI Platform for SME Technology Readiness Assessment', 'Chủ biên', 'Information Systems Frontiers (Springer)', 2022, '10.1007/s10796-022-10341-z', 'Scopus Q2', 3, true, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Ứng dụng Thị giác Máy tính trong Phân loại Nông sản Xuất khẩu', 'Tác giả', 'Tạp chí Khoa học và Công nghệ Việt Nam', 2021, '10.18173/vnjst.2021.05', 'Tạp chí ACI / HĐGSNN', 4, true, true);

-- Bổ sung Bằng độc quyền sáng chế / Giải pháp hữu ích (Patents)
DELETE FROM brokerage.expert_patents WHERE expert_profile_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO brokerage.expert_patents (
    id, expert_profile_id, title, certificate_number, granted_year, issuer, is_active, is_public, description, granted_at, technology_readiness_level
) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Hệ thống quang học và thuật toán AI phát hiện dị tật vi mạch điện tử theo thời gian thực', 'VN 1-0028492', 2024, 'Cục Sở hữu Trí tuệ Việt Nam', true, true, 'Giải pháp công nghệ kết hợp cảm biến quang phổ và mạng nơ-ron tích chập biên cho phép kiểm tra 120 sản phẩm/phút với độ chính xác 99.8%.', '2024-03-15', 8),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Phương pháp học liên kết bảo mật dữ liệu cho mạng lưới quan trắc môi trường nông nghiệp', 'VN 2-0003841', 2022, 'Cục Sở hữu Trí tuệ Việt Nam', true, true, 'Giải pháp hữu ích bảo vệ quyền riêng tư dữ liệu cảm biến IoT giữa các hợp tác xã mà không cần tập trung hóa dữ liệu thô.', '2022-11-20', 7);

-- Bổ sung Giải thưởng Khoa học & Công nghệ (Awards)
DELETE FROM brokerage.expert_awards WHERE expert_profile_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO brokerage.expert_awards (
    id, expert_profile_id, name, form, awarded_year, is_active, is_public, award_level, description
) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Giải thưởng Sáng tạo Khoa học Công nghệ Việt Nam (VIFOTEC)', 'Cúp vàng & Bằng khen', 2024, true, true, 'Cấp Quốc gia', 'Công trình Hệ thống thị giác máy tính phát hiện bất thường trong sản xuất công nghiệp 4.0.'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Giải thưởng Nhân tài Đất Việt - Lĩnh vực CNTT', 'Giải Nhì', 2022, true, true, 'Cấp Toàn quốc', 'Sản phẩm Nền tảng AI phân tích dữ liệu IoT công nghiệp.');

-- Bổ sung Đề tài Nghiên cứu KH&CN (Research Projects)
DELETE FROM brokerage.expert_research_projects WHERE expert_profile_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO brokerage.expert_research_projects (
    id, expert_profile_id, title, management_level, role, acceptance_status, is_active, is_public, budget_amount, start_year, end_year, lead_organization
) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Nghiên cứu phát triển nền tảng Trí tuệ nhân tạo biên phục vụ kiểm tra chất lượng trong sản xuất ô tô', 'Cấp Nhà nước (Chương trình KC.4.0)', 'Chủ nhiệm đề tài', 'Xuất sắc', true, true, 4500000000.00, 2022, 2024, 'Viện Công nghệ Thông tin - Viện Hàn lâm KH&CN VN'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Ứng dụng IoT và Federated Learning trong chuỗi cung ứng thông minh nông sản', 'Cấp Bộ KH&CN', 'Chủ nhiệm', 'Đạt yêu cầu', true, true, 1800000000.00, 2020, 2022, 'Viện Công nghệ Thông tin');

-- Bổ sung Dự án Chuyển giao Thực tiễn (Practical Projects)
DELETE FROM brokerage.expert_practical_projects WHERE expert_profile_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO brokerage.expert_practical_projects (
    id, expert_profile_id, title, scale, receiving_organization, is_active, is_public, completion_year, outcome
) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Chuyển giao dây chuyền AI Vision kiểm tra tự động lỗi sơn và bề mặt kim loại', 'Hợp đồng chuyển giao công nghệ cấp doanh nghiệp', 'Tập đoàn Cơ khí & Chế tạo Máy Hải Phòng', true, true, 2024, 'Giảm tỷ lệ lỗi xuất xưởng từ 3.2% xuống 0.3%, tiết kiệm 2.4 tỷ đồng/năm chi phí kiểm định thủ công.'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Triển khai hệ thống phân loại chất lượng nông sản xuất khẩu tự động theo tiêu chuẩn VietGAP', 'Dự án thí nghiệm & chuyển giao', 'Công ty Cổ phần Nông sản Xuất khẩu Hưng Yên', true, true, 2023, 'Công suất phân loại 5 tấn/giờ, độ chính xác nhận diện phân hạng 98%.');

-- Bổ sung Quá trình Đào tạo (Training Records)
DELETE FROM brokerage.expert_training_records WHERE expert_profile_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO brokerage.expert_training_records (
    id, expert_profile_id, level, institution, major, graduation_year, display_order, is_active, is_public
) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Tiến sĩ (Ph.D)', 'Tokyo Institute of Technology (Nhật Bản)', 'Khoa học Máy tính & Trí tuệ Nhân tạo', 2010, 1, true, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Thạc sĩ (M.Sc)', 'Đại học Bách Khoa Hà Nội', 'Công nghệ Thông tin', 2004, 2, true, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Kỹ sư', 'Đại học Bách Khoa Hà Nội', 'Kỹ thuật Máy tính', 2001, 3, true, true);

-- Bổ sung Quá trình Công tác (Employment Records)
DELETE FROM brokerage.expert_employment_records WHERE expert_profile_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO brokerage.expert_employment_records (
    id, expert_profile_id, from_date, to_date, organization, organization_address, position_title, display_order, is_active, is_public
) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '2019-01-01', NULL, 'Viện Công nghệ Thông tin - Viện Hàn lâm KH&CN VN', '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', 'Trưởng PTN Trí tuệ Nhân tạo & Thị giác Máy tính', 1, true, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '2011-03-01', '2018-12-31', 'Viện Công nghệ Thông tin', '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', 'Nghiên cứu viên chính', 2, true, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '2005-09-01', '2010-10-31', 'Tokyo Institute of Technology', 'Tokyo, Japan', 'Nghiên cứu sinh & Trợ giảng', 3, true, true);

-- 3. DỮ LIỆU DOANH NGHIỆP & CẦU CÔNG NGHỆ (CẤP 3: DOANH NGHIỆP / PUBLIC_USER)
-- Khởi tạo doanh nghiệp TechCorp tại Hà Nội
INSERT INTO enterprise.enterprises (
    id, tax_code, legal_name, trade_name, subject_type, legal_form_code, established_date,
    headquarters_address, province_code, district_code, organization_email, organization_phone,
    website_url, primary_industry_code, verification_status, version, created_at, updated_at
) VALUES (
    'e0000000-0000-0000-0000-000000000001', '0109876543', 'Công ty Cổ phần Công nghệ Chế tạo TechCorp Việt Nam',
    'TechCorp Vietnam', 'ENTERPRISE', 'JSC', '2018-06-15',
    'Lô CN-02, Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội', 'HN', 'HN-TT',
    'contact@techcorp.vn', '02438889999', 'https://techcorp.vn', 'C28',
    'VERIFIED', 1, NOW(), NOW()
) ON CONFLICT (tax_code) DO UPDATE SET 
    legal_name = EXCLUDED.legal_name,
    verification_status = 'VERIFIED';

-- Nhu cầu công nghệ tìm kiếm AI Vision của TechCorp
DELETE FROM demand.demand_briefs WHERE id = 'd0000000-0000-0000-0000-000000000001';
INSERT INTO demand.demand_briefs (
    id, owner_person_id, status, current_version_no, ai_title, ai_processed_content, 
    ai_processing_status, ai_chunking_status, sector_ids, deleted_at, version, created_at, updated_at
) VALUES (
    'd0000000-0000-0000-0000-000000000001', '01a111bf-7ac8-7c3e-84b4-0a555f848b17', 'OPEN', 1,
    'Tìm kiếm Giải pháp AI Thị giác máy tính kiểm tra ngoại quan linh kiện cơ khí tự động trên băng chuyền tốc độ cao',
    'Doanh nghiệp cơ khí chế tạo đang vận hành 3 dây chuyền dập kim loại công suất 120 sp/phút. Cần tìm giải pháp công nghệ quang học AI tự động phát hiện vết xước, nứt, sai lệch kích thước micromet. Ngân sách dự kiến: 800 triệu - 1.2 tỷ VNĐ.',
    'COMPLETED', 'COMPLETED', ARRAY['554696ad-52f3-4eac-a073-f6090a7426e6'::uuid], NULL, 1, NOW(), NOW()
);

INSERT INTO demand.demand_brief_versions (
    id, demand_brief_id, version_no, title, problem_statement, created_by_actor_ref, created_at
) VALUES (
    gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 1,
    'Tìm kiếm Giải pháp AI Thị giác máy tính kiểm tra ngoại quan linh kiện cơ khí tự động',
    'Nhu cầu cấp thiết tự động hóa khâu QC/QA ngoại quan sản phẩm cơ khí độ chính xác cao. Yêu cầu chuyên gia tư vấn triển khai phần cứng camera công nghiệp và mô hình AI chạy biên (Edge AI).',
    '01a111bf-7ac8-7c3e-84b4-0a555f848b17', NOW()
) ON CONFLICT (demand_brief_id, version_no) DO NOTHING;

-- 4. DỮ LIỆU QUẢN LÝ NHÀ NƯỚC (CẤP 1: SỞ KH&CN HÀ NỘI - PROVINCIAL_ADMIN)
-- Hồ sơ đánh giá trình độ công nghệ Thông tư 17 của TechCorp tại Hà Nội
DELETE FROM assessment.tt17_assessments WHERE id = 'a0000000-0000-0000-0000-000000000001';
INSERT INTO assessment.tt17_assessments (
    id, enterprise_id, assessment_year, scope_type, status, created_at, updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 2026,
    'PROVINCE', 'SUBMITTED', NOW(), NOW()
);

INSERT INTO assessment.tt17_assessment_revisions (
    id, assessment_id, revision_no, reporter_info, enterprise_snapshot, equipment_b_json, 
    production_c_json, management_d_json, rd_innovation_e_json, submitted_at, submitted_by
) VALUES (
    gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 1,
    '{"name": "Lê Hoàng Nam", "position": "CTO", "phone": "0912345678", "email": "nam.lh@techcorp.vn"}'::jsonb,
    '{"legal_name": "Công ty Cổ phần Công nghệ Chế tạo TechCorp Việt Nam", "province": "HN", "workforce": 180, "revenue_vnd": 150000000000}'::jsonb,
    '{"score": 24.5, "max_score": 30, "note": "Máy CNC 5 trục và cánh tay robot tự động hóa cao"}'::jsonb,
    '{"score": 18.0, "max_score": 25, "note": "Hệ thống quản lý sản xuất MES"}'::jsonb,
    '{"score": 15.5, "max_score": 20, "note": "Áp dụng ISO 9001:2015 và Lean Six Sigma"}'::jsonb,
    '{"score": 18.5, "max_score": 25, "note": "Có bộ phận R&D 12 kỹ sư, hợp tác với ĐHBKHN"}'::jsonb,
    NOW(), '01a111bf-7ac8-7c3e-84b4-0a555f848b17'
) ON CONFLICT (assessment_id, revision_no) DO NOTHING;

-- 5. DỮ LIỆU QUẢN TRỊ TRUNG ƯƠNG (CẤP 0: SUPER_ADMIN)
-- Tạo yêu cầu chờ duyệt tài khoản chuyên gia và chứng nhận tổ chức trong identity.approval_requests
DELETE FROM identity.approval_requests WHERE id IN ('a1111111-0000-0000-0000-000000000001', 'a2222222-0000-0000-0000-000000000002');
INSERT INTO identity.approval_requests (
    id, user_id, request_type, scope_type, scope_id, payload_json, status, sla_deadline_utc, version, created_at, updated_at
) VALUES 
('a1111111-0000-0000-0000-000000000001', '01a0ead4-b6ff-7302-a130-fb0fe0c86c72', 'EXPERT_BADGE_UPGRADE', 'GLOBAL', NULL,
 '{"expert_code": "CG-NACEN-DEMOIT01", "requested_tier": "TOP_TIER_EXPERT", "reason": "Bổ sung bằng sáng chế quốc tế và đề tài cấp Nhà nước vừa nghiệm thu xuất sắc."}'::jsonb,
 'PENDING_REVIEW', NOW() + INTERVAL '3 days', 1, NOW(), NOW()),
('a2222222-0000-0000-0000-000000000002', '01a111bf-7ac8-7c3e-84b4-0a555f848b17', 'ENTERPRISE_VERIFICATION', 'PROVINCE', 'HN',
 '{"tax_code": "0109876543", "enterprise_name": "TechCorp Vietnam", "doc_url": "/dataroom/gpdkkd_techcorp.pdf"}'::jsonb,
 'PENDING_REVIEW', NOW() + INTERVAL '2 days', 1, NOW(), NOW());

COMMIT;
