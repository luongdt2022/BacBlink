-- =============================================================================
-- BACLINK Demo & Ecosystem Seed Script (Idempotent, Zero-Mock, Non-Destructive)
-- Task: T-02.BL.01 (CR-BACLINK-005 / REQ-02-BL-02 / BR-02-BL-01)
-- Target PostgreSQL: nacentech
-- =============================================================================
-- Deterministic UUID Namespace: bac10000-0000-4000-80xx-0000000000yy
--   8001: identity.persons (5 tài khoản 3 cấp @baclink.org.vn)
--   8002: enterprise.enterprises (10 DN Hội viên Bắc Ninh)
--   8003: technology.seller_technology_offers (10 sản phẩm & năng lực sản xuất)
--   8004: technology.offer_spec_values (30 thông số kỹ thuật)
--   8005: demand.demand_surveys (8 phiếu nhu cầu đặt hàng)
--   8006: demand.demand_items (8 bài toán đặt hàng / tìm nhà cung ứng)
--   8007: content.techmart_events (3 sự kiện BACLINK)
--   8008: lms.learning_materials (6 khóa học LMS công nghiệp)
--   8009: brokerage.expert_profiles (5 cố vấn kỹ thuật)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- BƯỚC A: Non-destructive Archive dữ liệu NacenTech cũ khỏi hiển thị công khai
-- Chỉ UPDATE trạng thái ẩn/lưu trữ hợp lệ, tuyệt đối KHÔNG DELETE dữ liệu cũ.
-- -----------------------------------------------------------------------------

UPDATE identity.persons
SET is_active = false,
    updated_at = NOW()
WHERE email NOT LIKE '%@baclink.org.vn'
  AND is_active = true;

UPDATE enterprise.enterprises
SET status = 'ARCHIVED',
    is_verified = false,
    verification_status = 'ARCHIVED',
    updated_at = NOW()
WHERE id::text NOT LIKE 'bac10000-%'
  AND (status <> 'ARCHIVED' OR is_verified = true OR verification_status <> 'ARCHIVED');

UPDATE technology.seller_technology_offers
SET status = 'ARCHIVED',
    is_deleted = true,
    deleted_at = COALESCE(deleted_at, NOW()),
    updated_at = NOW()
WHERE id::text NOT LIKE 'bac10000-%'
  AND (status <> 'ARCHIVED' OR is_deleted = false);

UPDATE demand.demand_items
SET status = 'ARCHIVED',
    is_public_listed = false,
    updated_at = NOW()
WHERE id::text NOT LIKE 'bac10000-%'
  AND (status <> 'ARCHIVED' OR is_public_listed = true);

UPDATE demand.demand_surveys
SET status = 'ARCHIVED',
    updated_at = NOW()
WHERE id::text NOT LIKE 'bac10000-%'
  AND status <> 'ARCHIVED';

UPDATE content.techmart_events
SET status = 'ARCHIVED',
    updated_at = NOW()
WHERE id::text NOT LIKE 'bac10000-%'
  AND status <> 'ARCHIVED';

UPDATE lms.learning_materials
SET status = 'UNPUBLISHED',
    is_deleted = true,
    deleted_at = COALESCE(deleted_at, NOW()),
    unpublish_reason = COALESCE(unpublish_reason, 'Archived legacy NacenTech dataset during BACLINK seed'),
    updated_at = NOW()
WHERE id::text NOT LIKE 'bac10000-%'
  AND (status <> 'UNPUBLISHED' OR is_deleted = false);

UPDATE brokerage.expert_profiles
SET status = 'ARCHIVED',
    visibility_status = 'PRIVATE',
    is_accepting_consultation = false,
    updated_at = NOW()
WHERE id::text NOT LIKE 'bac10000-%'
  AND (status <> 'ARCHIVED' OR visibility_status <> 'PRIVATE' OR is_accepting_consultation = true);

-- -----------------------------------------------------------------------------
-- BƯỚC B1: 5 Tài khoản 3 cấp BACLINK (@baclink.org.vn, mật khẩu: Password@123)
-- Hash BCrypt ($2a$12$) đã kiểm chứng bằng pgcrypto crypt('Password@123', ...)
-- -----------------------------------------------------------------------------

INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm,
    first_name, last_name, phone, organization_name,
    platform_role, scope_type, scope_id,
    is_active, matching_auto, preferences_updated_at, version, created_at, updated_at
)
VALUES
(
    'bac10000-0000-4000-8001-000000000001',
    'admin@baclink.org.vn',
    '$2a$12$BSQfDKWR4muVTDXffeYcZ.vGctXwriTKBAhPPoa9aNiImmwzJtxb2',
    'bcrypt',
    'Quản trị', 'BACLINK', '02223800100',
    'Hiệp hội Doanh nghiệp Công nghiệp Hỗ trợ Bắc Ninh (BACLINK)',
    'ADMIN', 'GLOBAL', NULL,
    true, false, NOW(), 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8001-000000000002',
    'member.hanelpt@baclink.org.vn',
    '$2a$12$BSQfDKWR4muVTDXffeYcZ.vGctXwriTKBAhPPoa9aNiImmwzJtxb2',
    'bcrypt',
    'Minh Tuấn', 'Nguyễn', '02223714568',
    'Công ty Cổ phần Hanel PT',
    'ENTERPRISE', 'GLOBAL', NULL,
    true, true, NOW(), 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8001-000000000003',
    'member.intech@baclink.org.vn',
    '$2a$12$BSQfDKWR4muVTDXffeYcZ.vGctXwriTKBAhPPoa9aNiImmwzJtxb2',
    'bcrypt',
    'Hoàng Hiệp', 'Cao', '02223901234',
    'Công ty Cổ phần Tập đoàn Công nghiệp INTECH',
    'ENTERPRISE', 'GLOBAL', NULL,
    true, true, NOW(), 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8001-000000000004',
    'member.viqualita@baclink.org.vn',
    '$2a$12$BSQfDKWR4muVTDXffeYcZ.vGctXwriTKBAhPPoa9aNiImmwzJtxb2',
    'bcrypt',
    'Quốc Cường', 'Trần', '02223886543',
    'Công ty TNHH Công nghiệp Viqualita',
    'ENTERPRISE', 'GLOBAL', NULL,
    true, true, NOW(), 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8001-000000000005',
    'guest@baclink.org.vn',
    '$2a$12$BSQfDKWR4muVTDXffeYcZ.vGctXwriTKBAhPPoa9aNiImmwzJtxb2',
    'bcrypt',
    'Đối tác', 'Khách mời', '02223800999',
    'Khách tham quan Cổng Kết nối BACLINK',
    'PUBLIC_USER', 'GLOBAL', NULL,
    true, false, NOW(), 1, NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    password_hash_algorithm = EXCLUDED.password_hash_algorithm,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    organization_name = EXCLUDED.organization_name,
    platform_role = EXCLUDED.platform_role,
    scope_type = 'GLOBAL',
    scope_id = NULL,
    is_active = true,
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- BƯỚC B2: 10 Doanh nghiệp Hội viên Bắc Ninh (3 DN thực tế tiêu biểu + 7 DN mẫu)
-- -----------------------------------------------------------------------------

INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, established_date,
    province_city, address_detail, operating_zone, address_info_json,
    website, description, contact_person, contact_phone, contact_email, is_contact_public,
    is_verified, verification_status, status,
    sector_code, main_sector_name, ownership_type, workforce_scale, revenue_range,
    high_qualification_ratio, tni_score, tni_classification,
    has_rd_unit, has_rd_budget, rd_budget_amount, rd_personnel_count,
    is_exporting, in_value_chain,
    top_bottlenecks_json, support_needs_json, profile_details_json,
    latest_innovation_score, latest_innovation_tier,
    capability_tier, is_buyer, is_seller, active_role, owner_person_id,
    version, created_at, updated_at
)
VALUES
-- 1. Hanel PT (DN thực tế tiêu biểu)
(
    'bac10000-0000-4000-8002-000000000001',
    'ENTERPRISE',
    'Công ty Cổ phần Hanel PT',
    'CÔNG TY CỔ PHẦN HANEL PT',
    '0101420901',
    '2003-06-15',
    'TP. Từ Sơn, Bắc Ninh',
    'Lô CN-02, KCN Tiên Sơn, Phường Đồng Nguyên, TP. Từ Sơn, Bắc Ninh',
    'KCN Tiên Sơn',
    '{"locationCode":"TU_SON","industrialZoneCode":"KCN_TIEN_SON","province":"Bắc Ninh"}'::jsonb,
    'https://hanelpt.com.vn',
    'Doanh nghiệp công nghiệp hỗ trợ hàng đầu Bắc Ninh chuyên gia công lắp ráp bản mạch điện tử SMT, cảm biến công nghệ cao và máy sấy lạnh SASAKI cung ứng cho chuỗi FDI Samsung, Canon.',
    'Nguyễn Minh Tuấn', '02223714568', 'member.hanelpt@baclink.org.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_ELEC', 'Điện tử, Bán dẫn & Thiết bị điện',
    'Cổ phần tư nhân', '500 - 1.000 lao động', '300 - 500 tỷ VND',
    '28%', 86.5, 'HIGH',
    true, true, 12500000000, 32,
    true, true,
    '["Tự động hóa kiểm tra quang học AOI tốc độ cao","Chuẩn hóa dữ liệu sản xuất thời gian thực MES"]'::jsonb,
    '["Kết nối đơn hàng FDI Tier-1 điện tử","Tư vấn nâng cấp phòng sạch & ESD"]'::jsonb,
    '{"isSample":false,"locationCode":"TU_SON","industrialZoneCode":"KCN_TIEN_SON","certificates":["ISO 9001","ISO 14001","IATF 16949","ESD","Lean/5S"],"fdiPartners":["Samsung Electronics","Canon Vietnam","Foxconn"],"cleanroomClass":"Class 10000"}'::jsonb,
    84.0, 'LEADING',
    'DUAL', true, true, 'BUYER',
    'bac10000-0000-4000-8001-000000000002',
    1, NOW(), NOW()
),
-- 2. INTECH Group (DN thực tế tiêu biểu)
(
    'bac10000-0000-4000-8002-000000000002',
    'ENTERPRISE',
    'Công ty Cổ phần Tập đoàn Công nghiệp INTECH',
    'CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHIỆP INTECH',
    '2300881920',
    '2011-04-12',
    'TP. Từ Sơn, Bắc Ninh',
    'Lô 12, Đường số 3, KCN VSIP Bắc Ninh, TP. Từ Sơn, Bắc Ninh',
    'KCN VSIP Bắc Ninh',
    '{"locationCode":"TU_SON","industrialZoneCode":"KCN_VSIP_BN","province":"Bắc Ninh"}'::jsonb,
    'https://intech-group.vn',
    'Tập đoàn tiên phong tại Bắc Ninh về con lăn công nghiệp, băng tải tự động, xe tự hành AGV/AMR, kho thông minh AS/RS và giải pháp nhà máy thông minh cho các KCN FDI.',
    'Cao Hoàng Hiệp', '02223901234', 'member.intech@baclink.org.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_AUTO', 'Tự động hóa, Robot & Smart Factory',
    'Cổ phần tư nhân', '300 - 500 lao động', '200 - 300 tỷ VND',
    '35%', 89.0, 'VERY_HIGH',
    true, true, 15000000000, 45,
    true, true,
    '["Nội địa hóa bộ điều khiển Servo & Vision AI cho AGV","Tích hợp chuẩn giao tiếp VDA 5050 với hệ thống ERP FDI"]'::jsonb,
    '["Mở rộng xuất khẩu sang Nhật Bản & EU","Tư vấn kiểm kê phát thải Carbon ESG"]'::jsonb,
    '{"isSample":false,"locationCode":"TU_SON","industrialZoneCode":"KCN_VSIP_BN","certificates":["ISO 9001","ISO 14001","Lean/5S","ESG"],"fdiPartners":["Samsung","LG Display","Luxshare-ICT"]}'::jsonb,
    88.5, 'LEADING',
    'DUAL', true, true, 'BUYER',
    'bac10000-0000-4000-8001-000000000003',
    1, NOW(), NOW()
),
-- 3. Viqualita (DN thực tế tiêu biểu)
(
    'bac10000-0000-4000-8002-000000000003',
    'ENTERPRISE',
    'Công ty TNHH Công nghiệp Viqualita',
    'CÔNG TY TNHH CÔNG NGHIỆP VIQUALITA',
    '2300992831',
    '2015-08-20',
    'H. Yên Phong, Bắc Ninh',
    'Lô CN-15, KCN Yên Phong I, Xã Long Châu, H. Yên Phong, Bắc Ninh',
    'KCN Yên Phong I',
    '{"locationCode":"YEN_PHONG","industrialZoneCode":"KCN_YEN_PHONG_1","province":"Bắc Ninh"}'::jsonb,
    'https://viqualita.vn',
    'Đơn vị sản xuất cơ khí chính xác, đồ gá JIG kiểm tra, khuôn dập và chi tiết máy CNC 5 trục đạt tiêu chuẩn dung sai ±0.005mm phục vụ ngành điện tử và ô tô tại Bắc Ninh.',
    'Trần Quốc Cường', '02223886543', 'member.viqualita@baclink.org.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_MECH', 'Cơ khí chính xác, Khuôn mẫu & Chế tạo máy',
    'TNHH tư nhân', '150 - 300 lao động', '100 - 200 tỷ VND',
    '24%', 81.5, 'HIGH',
    true, true, 6200000000, 18,
    true, true,
    '["Giảm tỷ lệ phế phẩm gia công hợp kim nhôm hàng loạt","Quản trị lịch bảo trì dự đoán máy phay CNC 5 trục"]'::jsonb,
    '["Đào tạo chứng chỉ IATF 16949","Tìm kiếm nhà cung cấp xử lý nhiệt & mạ bề mặt đạt chuẩn"]'::jsonb,
    '{"isSample":false,"locationCode":"YEN_PHONG","industrialZoneCode":"KCN_YEN_PHONG_1","certificates":["ISO 9001","IATF 16949","Lean/5S"],"fdiPartners":["Honda Vietnam","Canon","Goertek"]}'::jsonb,
    79.0, 'LEADING',
    'DUAL', true, true, 'BUYER',
    'bac10000-0000-4000-8001-000000000004',
    1, NOW(), NOW()
),
-- 4. Cơ khí Chính xác Kinh Bắc (DN mẫu)
(
    'bac10000-0000-4000-8002-000000000004',
    'ENTERPRISE',
    'Công ty TNHH Cơ khí Chính xác Kinh Bắc',
    'CÔNG TY TNHH CƠ KHÍ CHÍNH XÁC KINH BẮC',
    '2300900004',
    '2018-03-10',
    'TX. Quế Võ, Bắc Ninh',
    'Lô B4, KCN Quế Võ I, Phường Vân Dương, TX. Quế Võ, Bắc Ninh',
    'KCN Quế Võ I',
    '{"locationCode":"QUE_VO","industrialZoneCode":"KCN_QUE_VO_1","province":"Bắc Ninh"}'::jsonb,
    'https://kinhbac-precision.example.vn',
    '[Dữ liệu demo mẫu] Doanh nghiệp gia công tiện-phay CNC, chế tạo khuôn đột dập liên hoàn và linh kiện kim loại tấm cho thiết bị điện tử công nghiệp.',
    'Lê Văn Hùng', '02223810004', 'contact@kinhbac-precision.example.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_MECH', 'Cơ khí chính xác, Khuôn mẫu & Chế tạo máy',
    'TNHH tư nhân', '100 - 200 lao động', '50 - 100 tỷ VND',
    '19%', 76.0, 'HIGH',
    false, true, 2400000000, 8,
    false, true,
    '["Thiếu máy đo tọa độ CMM tự động đầu ra","Chưa số hóa lệnh sản xuất tại phân xưởng"]'::jsonb,
    '["Tư vấn hệ thống QMS theo IATF 16949","Kết nối đơn hàng gia công chi tiết máy"]'::jsonb,
    '{"isSample":true,"locationCode":"QUE_VO","industrialZoneCode":"KCN_QUE_VO_1","certificates":["ISO 9001","IATF 16949","Lean/5S"]}'::jsonb,
    71.5, 'DEVELOPING',
    'DUAL', true, true, 'BUYER',
    NULL,
    1, NOW(), NOW()
),
-- 5. Nhựa Kỹ thuật Yên Phong (DN mẫu)
(
    'bac10000-0000-4000-8002-000000000005',
    'ENTERPRISE',
    'Công ty Cổ phần Nhựa Kỹ thuật Yên Phong',
    'CÔNG TY CỔ PHẦN NHỰA KỸ THUẬT YÊN PHONG',
    '2300900005',
    '2019-05-22',
    'H. Yên Phong, Bắc Ninh',
    'Lô E2, KCN Yên Phong II-C, Xã Tam Giang, H. Yên Phong, Bắc Ninh',
    'KCN Yên Phong II-C',
    '{"locationCode":"YEN_PHONG","industrialZoneCode":"KCN_YEN_PHONG_2C","province":"Bắc Ninh"}'::jsonb,
    'https://yenphong-plastic.example.vn',
    '[Dữ liệu demo mẫu] Chuyên ép phun nhựa kỹ thuật ABS, PC, PA66 chống tĩnh điện, khay tray linh kiện bán dẫn và vỏ thiết bị điện tử phòng sạch.',
    'Phạm Thị Lan', '02223810005', 'info@yenphong-plastic.example.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_PLAS', 'Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp',
    'Cổ phần tư nhân', '150 - 250 lao động', '80 - 150 tỷ VND',
    '21%', 78.0, 'HIGH',
    true, true, 3500000000, 12,
    true, true,
    '["Tối ưu chu kỳ làm mát khuôn ép đa lòng","Kiểm soát độ ẩm hạt nhựa kỹ thuật tự động"]'::jsonb,
    '["Chuyển giao công nghệ tái chế phế liệu nhựa sạch","Tìm đối tác chế tạo khuôn ép đa điểm"]'::jsonb,
    '{"isSample":true,"locationCode":"YEN_PHONG","industrialZoneCode":"KCN_YEN_PHONG_2C","certificates":["ISO 9001","ISO 14001","ESD"]}'::jsonb,
    74.0, 'DEVELOPING',
    'DUAL', true, true, 'BUYER',
    NULL,
    1, NOW(), NOW()
),
-- 6. Tự động hóa & Robot VSIP (DN mẫu)
(
    'bac10000-0000-4000-8002-000000000006',
    'ENTERPRISE',
    'Công ty TNHH Tự động hóa & Robot VSIP',
    'CÔNG TY TNHH TỰ ĐỘNG HÓA & ROBOT VSIP',
    '2300900006',
    '2020-01-15',
    'H. Tiên Du, Bắc Ninh',
    'Lô D8, KCN Đại Đồng - Hoàn Sơn, H. Tiên Du, Bắc Ninh',
    'KCN Đại Đồng - Hoàn Sơn',
    '{"locationCode":"TIEN_DU","industrialZoneCode":"KCN_DAI_DONG_HOAN_SON","province":"Bắc Ninh"}'::jsonb,
    'https://vsip-robotics.example.vn',
    '[Dữ liệu demo mẫu] Tích hợp hệ thống trạm robot gắp đặt (Pick & Place), tủ điều khiển PLC/SCADA và camera kiểm tra ngoại quan dây chuyền lắp ráp điện tử.',
    'Ngô Đức Thắng', '02223810006', 'sales@vsip-robotics.example.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_AUTO', 'Tự động hóa, Robot & Smart Factory',
    'TNHH tư nhân', '50 - 100 lao động', '50 - 100 tỷ VND',
    '42%', 83.0, 'HIGH',
    true, true, 4800000000, 20,
    false, true,
    '["Chuẩn hóa thư viện lập trình robot đa hãng","Tăng tốc độ triển khai pilot dây chuyền cho SME"]'::jsonb,
    '["Kết nối doanh nghiệp cơ khí gia công khung máy","Hợp tác R&D thuật toán Vision kiểm lỗi"]'::jsonb,
    '{"isSample":true,"locationCode":"TIEN_DU","industrialZoneCode":"KCN_DAI_DONG_HOAN_SON","certificates":["ISO 9001","ESD","Lean/5S"]}'::jsonb,
    80.5, 'LEADING',
    'DUAL', true, true, 'BUYER',
    NULL,
    1, NOW(), NOW()
),
-- 7. Bao bì Công nghiệp Quế Võ (DN mẫu - Vật liệu mới & Công nghiệp hỗ trợ)
(
    'bac10000-0000-4000-8002-000000000007',
    'ENTERPRISE',
    'Công ty Cổ phần Bao bì Công nghiệp Quế Võ',
    'CÔNG TY CỔ PHẦN BAO BÌ CÔNG NGHIỆP QUẾ VÕ',
    '2300900007',
    '2017-09-08',
    'TX. Quế Võ, Bắc Ninh',
    'Lô C6, KCN Quế Võ II, Xã Ngọc Xá, TX. Quế Võ, Bắc Ninh',
    'KCN Quế Võ II',
    '{"locationCode":"QUE_VO","industrialZoneCode":"KCN_QUE_VO_2","province":"Bắc Ninh"}'::jsonb,
    'https://quevo-pack.example.vn',
    '[Dữ liệu demo mẫu] Sản xuất vật liệu đóng gói bảo vệ chống tĩnh điện, màng barrier đa lớp và khay giấy định hình sinh học thay thế xốp EPS cho xuất khẩu FDI.',
    'Đỗ Thanh Bình', '02223810007', 'hello@quevo-pack.example.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_MAT', 'Vật liệu mới & Công nghiệp hỗ trợ',
    'Cổ phần tư nhân', '100 - 200 lao động', '80 - 150 tỷ VND',
    '18%', 75.5, 'HIGH',
    true, false, 1800000000, 6,
    true, true,
    '["Kiểm định độ bền nén và chống ẩm vật liệu sinh học","Giảm tiêu hao hơi nhiệt trong công đoạn sấy khay"]'::jsonb,
    '["Chứng nhận vật liệu tái chế đạt chuẩn xuất khẩu EU","Tư vấn tối ưu dây chuyền ép định hình"]'::jsonb,
    '{"isSample":true,"locationCode":"QUE_VO","industrialZoneCode":"KCN_QUE_VO_2","certificates":["ISO 9001","ISO 14001","ESG"]}'::jsonb,
    70.0, 'DEVELOPING',
    'DUAL', true, true, 'BUYER',
    NULL,
    1, NOW(), NOW()
),
-- 8. Giải pháp Nhà máy Thông minh Từ Sơn (DN mẫu)
(
    'bac10000-0000-4000-8002-000000000008',
    'ENTERPRISE',
    'Công ty Cổ phần Giải pháp Nhà máy Thông minh Từ Sơn',
    'CÔNG TY CỔ PHẦN GIẢI PHÁP NHÀ MÁY THÔNG MINH TỪ SƠN',
    '2300900008',
    '2021-02-18',
    'TP. Từ Sơn, Bắc Ninh',
    'Lô H3, KCN Hanaka, Phường Trang Hạ, TP. Từ Sơn, Bắc Ninh',
    'KCN Hanaka',
    '{"locationCode":"TU_SON","industrialZoneCode":"KCN_HANAKA","province":"Bắc Ninh"}'::jsonb,
    'https://tuson-smartfactory.example.vn',
    '[Dữ liệu demo mẫu] Phát triển phần mềm quản trị sản xuất MES/QMS, cổng IoT thu thập dữ liệu máy CNC/SMT (OEE) và hệ thống truy xuất nguồn gốc QR/RFID cho nhà máy Bắc Ninh.',
    'Vũ Minh Quân', '02223810008', 'contact@tuson-smartfactory.example.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_IT', 'Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP',
    'Cổ phần tư nhân', '50 - 100 lao động', '30 - 50 tỷ VND',
    '65%', 85.0, 'HIGH',
    true, true, 4200000000, 26,
    false, true,
    '["Tích hợp giao thức OPC-UA/MTConnect cho máy CNC đời cũ","Đảm bảo an toàn mạng OT/IT theo IEC 62443"]'::jsonb,
    '["Triển khai pilot MES cho hội viên BACLINK","Kết nối chuyên gia an ninh mạng công nghiệp"]'::jsonb,
    '{"isSample":true,"locationCode":"TU_SON","industrialZoneCode":"KCN_HANAKA","certificates":["ISO 9001","Lean/5S"]}'::jsonb,
    82.0, 'LEADING',
    'DUAL', true, true, 'BUYER',
    NULL,
    1, NOW(), NOW()
),
-- 9. Logistics Công nghiệp Bắc Ninh (DN mẫu)
(
    'bac10000-0000-4000-8002-000000000009',
    'ENTERPRISE',
    'Công ty TNHH Logistics Công nghiệp Bắc Ninh',
    'CÔNG TY TNHH LOGISTICS CÔNG NGHIỆP BẮC NINH',
    '2300900009',
    '2016-11-05',
    'TX. Thuận Thành, Bắc Ninh',
    'Lô L1, KCN Thuận Thành I, Xã Nghĩa Đạo, TX. Thuận Thành, Bắc Ninh',
    'KCN Thuận Thành I',
    '{"locationCode":"THUAN_THANH","industrialZoneCode":"KCN_THUAN_THANH_1","province":"Bắc Ninh"}'::jsonb,
    'https://bn-indlogistics.example.vn',
    '[Dữ liệu demo mẫu] Cung ứng dịch vụ kho vận thông minh WMS, vận tải chuỗi cung ứng Just-In-Time (JIT) giữa các KCN Bắc Ninh – Nội Bài – Hải Phòng.',
    'Nguyễn Hải Nam', '02223810009', 'ops@bn-indlogistics.example.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_LOG', 'Logistics công nghiệp, Kho vận & Chuỗi cung ứng',
    'TNHH tư nhân', '100 - 200 lao động', '100 - 200 tỷ VND',
    '22%', 74.0, 'MEDIUM',
    false, true, 1500000000, 5,
    true, true,
    '["Tối ưu tỷ lệ lấp đầy chuyến xe chiều về","Số hóa chứng từ hải quan và EDI với nhà máy FDI"]'::jsonb,
    '["Triển khai hệ thống định vị & giám sát nhiệt độ container","Chuyển đổi đội xe nâng điện giảm phát thải"]'::jsonb,
    '{"isSample":true,"locationCode":"THUAN_THANH","industrialZoneCode":"KCN_THUAN_THANH_1","certificates":["ISO 9001","ESG"]}'::jsonb,
    68.5, 'DEVELOPING',
    'DUAL', true, true, 'BUYER',
    NULL,
    1, NOW(), NOW()
),
-- 10. Vật liệu Xanh Tiên Sơn (DN mẫu)
(
    'bac10000-0000-4000-8002-000000000010',
    'ENTERPRISE',
    'Công ty Cổ phần Vật liệu Xanh Tiên Sơn',
    'CÔNG TY CỔ PHẦN VẬT LIỆU XANH TIÊN SƠN',
    '2300900010',
    '2020-07-14',
    'H. Gia Bình, Bắc Ninh',
    'Lô G2, KCN Gia Bình, Xã Đại Bái, H. Gia Bình, Bắc Ninh',
    'KCN Gia Bình',
    '{"locationCode":"GIA_BINH","industrialZoneCode":"KCN_GIA_BINH","province":"Bắc Ninh"}'::jsonb,
    'https://tienson-greenmat.example.vn',
    '[Dữ liệu demo mẫu] Sản xuất hệ thống xử lý nước thải tuần hoàn, thu hồi nhiệt thải lò hơi và vật liệu cách nhiệt xanh phục vụ chuyển đổi ESG trong các KCN Bắc Ninh.',
    'Hoàng Thị Mai', '02223810010', 'esg@tienson-greenmat.example.vn', true,
    true, 'VERIFIED', 'ACTIVE',
    'IND_GREEN', 'Công nghiệp xanh, Năng lượng sạch & ESG',
    'Cổ phần tư nhân', '50 - 100 lao động', '50 - 100 tỷ VND',
    '30%', 80.0, 'HIGH',
    true, true, 2900000000, 10,
    false, true,
    '["Nâng hiệu suất thu hồi nước tuần hoàn đạt trên 85%","Tự động hóa quan trắc phát thải khí nhà kính Scope 1-2"]'::jsonb,
    '["Tư vấn tín chỉ carbon & báo cáo ESG cho DN vừa và nhỏ","Kết nối KCN triển khai giải pháp tiết kiệm năng lượng"]'::jsonb,
    '{"isSample":true,"locationCode":"GIA_BINH","industrialZoneCode":"KCN_GIA_BINH","certificates":["ISO 9001","ISO 14001","ESG"]}'::jsonb,
    77.5, 'LEADING',
    'DUAL', true, true, 'BUYER',
    NULL,
    1, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    subject_type = EXCLUDED.subject_type,
    name = EXCLUDED.name,
    legal_name = EXCLUDED.legal_name,
    tax_code = EXCLUDED.tax_code,
    province_city = EXCLUDED.province_city,
    address_detail = EXCLUDED.address_detail,
    operating_zone = EXCLUDED.operating_zone,
    address_info_json = EXCLUDED.address_info_json,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    contact_person = EXCLUDED.contact_person,
    contact_phone = EXCLUDED.contact_phone,
    contact_email = EXCLUDED.contact_email,
    is_contact_public = true,
    is_verified = true,
    verification_status = 'VERIFIED',
    status = 'ACTIVE',
    sector_code = EXCLUDED.sector_code,
    main_sector_name = EXCLUDED.main_sector_name,
    ownership_type = EXCLUDED.ownership_type,
    workforce_scale = EXCLUDED.workforce_scale,
    revenue_range = EXCLUDED.revenue_range,
    tni_score = EXCLUDED.tni_score,
    tni_classification = EXCLUDED.tni_classification,
    has_rd_unit = EXCLUDED.has_rd_unit,
    has_rd_budget = EXCLUDED.has_rd_budget,
    rd_budget_amount = EXCLUDED.rd_budget_amount,
    rd_personnel_count = EXCLUDED.rd_personnel_count,
    is_exporting = EXCLUDED.is_exporting,
    in_value_chain = EXCLUDED.in_value_chain,
    top_bottlenecks_json = EXCLUDED.top_bottlenecks_json,
    support_needs_json = EXCLUDED.support_needs_json,
    profile_details_json = EXCLUDED.profile_details_json,
    latest_innovation_score = EXCLUDED.latest_innovation_score,
    latest_innovation_tier = EXCLUDED.latest_innovation_tier,
    capability_tier = 'DUAL',
    is_buyer = true,
    is_seller = true,
    active_role = 'BUYER',
    owner_person_id = EXCLUDED.owner_person_id,
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- BƯỚC B3: 10 Sản phẩm & Năng lực Sản xuất (technology.seller_technology_offers)
-- và 30 Thông số kỹ thuật (technology.offer_spec_values)
-- -----------------------------------------------------------------------------

INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, price_amount, price_min, price_max, currency, unit,
    developer_origin, trl_level, ip_status, ip_registration_number, transfer_method, commercial_status,
    contact_point_role, status, successful_connections, rating_score, review_count,
    managing_authority_id, managing_authority_name, scope_type, scope_id,
    legal_consent, created_by, published_at, version, created_at, updated_at,
    enterprise_tax_code, enterprise_name, delivery_timeline, warranty_terms, supply_scope,
    payment_terms, installation_support, model_code, manufacturer, origin_country,
    equipment_status, manufacturing_year, capacity_scale, energy_consumption, automation_level,
    operating_principle, deployment_conditions, transfer_priority_method,
    legal_commitment_confirmed, is_deleted, deleted_at, trl_verification_status, ip_verification_status
)
VALUES
(
    'bac10000-0000-4000-8003-000000000001', 'OFF-BL-2026-001', 'PRODUCT', true,
    'Dịch vụ Gia công Lắp ráp Bản mạch Điện tử SMT & Kiểm tra AOI Phòng sạch',
    'Năng lực gia công PCBA chính xác cao chuẩn IPC-A-610 Class 2/3 trên 6 dây chuyền SMT tốc độ cao tại KCN Tiên Sơn.',
    'Giúp doanh nghiệp FDI và sản xuất thiết bị điện tử rút ngắn 40% thời gian nội địa hóa bản mạch điều khiển, tỷ lệ lỗi < 150 PPM.',
    'IND_ELEC', 'Điện tử, Bán dẫn & Thiết bị điện',
    'CONTACT', NULL, NULL, NULL, 'VND', 'bản mạch / lô',
    'Công ty Cổ phần Hanel PT', 9, 'TRADEMARK', 'VN-4-0398120', 'TURNKEY', 'COMMERCIALLY_READY',
    'Giám đốc Khối Sản xuất Điện tử', 'APPROVED', 14, 4.9, 18,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000002', NOW() - INTERVAL '15 days', 1, NOW(), NOW(),
    '0101420901', 'Công ty Cổ phần Hanel PT', '15 - 21 ngày theo PO', '12 tháng bảo hành chất lượng mối hàn', 'Bắc Ninh & Toàn quốc',
    'Theo hợp đồng nguyên tắc OEM/ODM', true, 'HPT-SMT-2026', 'Hanel PT', 'Việt Nam',
    'NEW', 2026, '120.000 linh kiện/giờ/line', '18 kW/line', 'Tự động hoàn toàn (SPI + AOI 3D)',
    'In kem hàn tự động -> Kiểm tra SPI -> Gắn chip SMT -> Hàn Reflow 10 vùng nhiệt -> Kiểm tra quang học AOI 3D.',
    'Cung cấp file Gerber, BOM và mẫu chuẩn trước khi chạy pilot.', 'TURNKEY',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000002', 'OFF-BL-2026-002', 'SOLUTION', true,
    'Hệ thống Xe tự hành AGV/AMR & Kho thông minh AS/RS cho Nhà máy Điện tử',
    'Giải pháp nội địa hóa toàn trình vận chuyển nội xưởng bằng robot AMR dẫn đường SLAM và hệ thống giá kệ tự động AS/RS.',
    'Giảm 55% nhân công vận chuyển nội bộ, tăng mật độ lưu trữ kho linh kiện lên 2.8 lần và kết nối trực tiếp MES.',
    'IND_AUTO', 'Tự động hóa, Robot & Smart Factory',
    'RANGE', NULL, 950000000, 2800000000, 'VND', 'hệ thống',
    'Tập đoàn Công nghiệp INTECH', 9, 'UTILITY_MODEL', 'VN-2-0004812', 'TURNKEY', 'COMMERCIALLY_READY',
    'Giám đốc Giải pháp Tự động hóa', 'APPROVED', 11, 4.9, 12,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000003', NOW() - INTERVAL '14 days', 1, NOW(), NOW(),
    '2300881920', 'Công ty Cổ phần Tập đoàn Công nghiệp INTECH', '45 - 60 ngày', '24 tháng bảo hành, hỗ trợ 24/7', 'Miền Bắc & Toàn quốc',
    'Tạm ứng 30%, giao hàng 50%, nghiệm thu 20%', true, 'INTECH-AMR-500', 'INTECH Group', 'Việt Nam',
    'NEW', 2026, 'Tải trọng 500 - 1.000 kg', '1.2 kW sạc nhanh', 'Tự hành hoàn toàn (LiDAR SLAM)',
    'Robot AMR điều hướng bằng bản đồ LiDAR, tích hợp phần mềm điều phối đội xe FMS giao tiếp chuẩn REST/MQTT với MES.',
    'Mặt sàn xưởng phẳng, phủ Wi-Fi công nghiệp ổn định.', 'TURNKEY',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000003', 'OFF-BL-2026-003', 'PRODUCT', false,
    'Gia công Đồ gá JIG Kiểm tra & Chi tiết Cơ khí CNC 5 Trục Độ chính xác ±0.005mm',
    'Năng lực gia công hàng loạt chi tiết hợp kim nhôm, thép không gỉ, đồng và nhựa kỹ thuật cho dây chuyền lắp ráp FDI.',
    'Thay thế đồ gá và linh kiện nhập khẩu với chi phí thấp hơn 25-35%, thời gian giao hàng chỉ 7-10 ngày tại Bắc Ninh.',
    'IND_MECH', 'Cơ khí chính xác, Khuôn mẫu & Chế tạo máy',
    'CONTACT', NULL, NULL, NULL, 'VND', 'bộ / chi tiết',
    'Công ty TNHH Công nghiệp Viqualita', 9, 'NONE', NULL, 'OEM', 'COMMERCIALLY_READY',
    'Trưởng phòng Kỹ thuật Khuôn mẫu', 'APPROVED', 19, 4.8, 22,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000004', NOW() - INTERVAL '12 days', 1, NOW(), NOW(),
    '2300992831', 'Công ty TNHH Công nghiệp Viqualita', '7 - 14 ngày', '12 tháng sai số kỹ thuật', 'KCN Bắc Ninh & Vùng kinh tế trọng điểm Bắc Bộ',
    'Công nợ 30 ngày với khách hàng OEM', true, 'VIQ-CNC5X', 'Viqualita', 'Việt Nam',
    'NEW', 2026, '25.000 chi tiết/tháng', 'Theo công suất máy CNC', 'CNC 5 trục + đo CMM tự động',
    'Gia công phay/tiện CNC đa trục từ bản vẽ 3D STEP/IGES, kiểm tra 100% kích thước trọng yếu trên máy đo tọa độ CMM.',
    'Cung cấp bản vẽ kỹ thuật 2D/3D kèm tiêu chuẩn dung sai.', 'OEM',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000004', 'OFF-BL-2026-004', 'PRODUCT', false,
    '[Dữ liệu demo mẫu] Khuôn Đột dập Liên hoàn & Gia công Kim loại Tấm Chính xác',
    'Thiết kế và chế tạo khuôn đột dập liên hoàn tốc độ cao cho khung vỏ thiết bị điện, giá đỡ linh kiện và phụ tùng ô tô.',
    'Tăng tuổi thọ khuôn lên 1.5 triệu lần dập, đảm bảo độ đồng đều hàng loạt và giảm hao hụt phôi liệu 18%.',
    'IND_MECH', 'Cơ khí chính xác, Khuôn mẫu & Chế tạo máy',
    'RANGE', NULL, 180000000, 650000000, 'VND', 'bộ khuôn',
    'Công ty TNHH Cơ khí Chính xác Kinh Bắc', 8, 'NONE', NULL, 'OEM', 'COMMERCIALLY_READY',
    'Phòng Kinh doanh Kỹ thuật', 'APPROVED', 6, 4.7, 8,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '10 days', 1, NOW(), NOW(),
    '2300900004', 'Công ty TNHH Cơ khí Chính xác Kinh Bắc', '25 - 35 ngày', 'Bảo hành 500.000 lần dập đầu tiên', 'Bắc Ninh & Miền Bắc',
    'Tạm ứng 40%, nghiệm thu mẫu T1 40%, bàn giao 20%', true, 'KB-DIE-2026', 'Kinh Bắc Precision', 'Việt Nam',
    'NEW', 2026, '40 bộ khuôn/năm', 'N/A', 'Cắt dây EDM + Mài phẳng CNC',
    'Thiết kế mô phỏng dập tấm trên AutoForm, gia công lõi khuôn thép SKD11 nhiệt luyện chân không đạt 60-62 HRC.',
    'Bản vẽ sản phẩm dập và sản lượng dự kiến.', 'OEM',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000005', 'OFF-BL-2026-005', 'PRODUCT', false,
    '[Dữ liệu demo mẫu] Khay Tray Nhựa Kỹ thuật Chống tĩnh điện ESD cho Linh kiện Bán dẫn',
    'Sản xuất ép phun & định hình nhiệt khay chứa IC, module camera và bo mạch chống tĩnh điện điện trở bề mặt 10^6–10^9 Ohm.',
    'Thay thế hoàn toàn khay nhập khẩu cho các nhà máy bán dẫn, điện tử tại KCN Yên Phong và Quế Võ.',
    'IND_PLAS', 'Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp',
    'FIXED', 48000, NULL, NULL, 'VND', 'khay (MOQ 1.000)',
    'Công ty Cổ phần Nhựa Kỹ thuật Yên Phong', 9, 'NONE', NULL, 'OEM', 'COMMERCIALLY_READY',
    'Trưởng phòng Kinh doanh', 'APPROVED', 9, 4.8, 11,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '9 days', 1, NOW(), NOW(),
    '2300900005', 'Công ty Cổ phần Nhựa Kỹ thuật Yên Phong', '10 - 15 ngày', 'Đổi trả 1:1 nếu sai điện trở bề mặt ESD', 'Bắc Ninh & Toàn quốc',
    'Thanh toán theo tháng', false, 'YPP-ESD-TRAY', 'Nhựa Kỹ thuật Yên Phong', 'Việt Nam',
    'NEW', 2026, '150.000 khay/tháng', 'Máy ép phun servo tiết kiệm 35% điện', 'Tự động gắp robot 3 trục',
    'Phối trộn hạt nhựa PC/ABS dẫn điện carbon nanotube và kiểm tra điện trở bề mặt từng lô theo tiêu chuẩn ANSI/ESD S20.20.',
    'Yêu cầu kích thước pocket và dải điện trở ESD.', 'OEM',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000006', 'OFF-BL-2026-006', 'DEVICE', true,
    '[Dữ liệu demo mẫu] Trạm Robot Gắp Đặt & Kiểm tra Ngoại quan Camera AI Dây chuyền SMT',
    'Cụm máy tự động hóa tích hợp cánh tay robot 6 trục và camera AI phát hiện sai lỗi lắp ráp với tốc độ 45 sản phẩm/phút.',
    'Thay thế 4 nhân công kiểm tra thủ công/ca, nâng độ chính xác phát hiện lỗi bề mặt lên 99.6%.',
    'IND_AUTO', 'Tự động hóa, Robot & Smart Factory',
    'FIXED', 680000000, NULL, NULL, 'VND', 'trạm máy',
    'Công ty TNHH Tự động hóa & Robot VSIP', 8, 'SOFTWARE_COPYRIGHT', 'VN-SW-2026-118', 'TURNKEY', 'COMMERCIALLY_READY',
    'Kỹ sư trưởng Tự động hóa', 'APPROVED', 5, 4.9, 7,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '8 days', 1, NOW(), NOW(),
    '2300900006', 'Công ty TNHH Tự động hóa & Robot VSIP', '30 ngày', '18 tháng bảo hành phần cứng & AI model', 'KCN Bắc Ninh & Lân cận',
    '30% - 50% - 20%', true, 'VR-AOI-CELL', 'VSIP Robotics', 'Việt Nam',
    'NEW', 2026, '45 sản phẩm/phút', '2.5 kW', 'Tự động hoàn toàn',
    'Băng tải định vị sản phẩm -> Camera đa góc chụp ảnh -> Mô hình Vision AI phân loại OK/NG -> Robot gắp phân loại khay.',
    'Nguồn điện 220V/380V và khí nén 0.5 MPa.', 'TURNKEY',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000007', 'OFF-BL-2026-007', 'PRODUCT', false,
    '[Dữ liệu demo mẫu] Vật liệu Khay Giấy Định hình Sinh học & Màng Chống ẩm Chuỗi FDI',
    'Giải pháp bao bì vật liệu mới từ bột giấy tái chế định hình chịu lực cao thay thế xốp EPS, đạt tiêu chuẩn xuất khẩu EU/Mỹ.',
    'Giảm 100% rác thải nhựa xốp khó phân hủy và đáp ứng yêu cầu Green Packaging của các tập đoàn FDI.',
    'IND_MAT', 'Vật liệu mới & Công nghiệp hỗ trợ',
    'RANGE', NULL, 6500, 22000, 'VND', 'bộ khay',
    'Công ty Cổ phần Bao bì Công nghiệp Quế Võ', 8, 'NONE', NULL, 'OEM', 'COMMERCIALLY_READY',
    'Phòng Phát triển Vật liệu', 'APPROVED', 7, 4.7, 9,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '7 days', 1, NOW(), NOW(),
    '2300900007', 'Công ty Cổ phần Bao bì Công nghiệp Quế Võ', '12 ngày', 'Cam kết độ ẩm < 10% khi giao hàng', 'Toàn quốc',
    'Thanh toán theo PO', false, 'QVP-BIO-PULP', 'Bao bì Quế Võ', 'Việt Nam',
    'NEW', 2026, '300.000 bộ/tháng', 'Thu hồi nhiệt sấy tuần hoàn', 'Bán tự động ép định hình',
    'Nghiền thủy lực bột giấy tái chế kết hợp phụ gia chống ẩm thực vật, ép nhiệt định hình chính xác bề mặt mịn.',
    'Bản vẽ sản phẩm cần chèn lót chống sốc.', 'OEM',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000008', 'OFF-BL-2026-008', 'SOFTWARE', true,
    '[Dữ liệu demo mẫu] Nền tảng Quản trị Sản xuất MES & Giám sát OEE Thời gian thực',
    'Phần mềm MES/QMS may đo cho nhà máy gia công cơ khí, nhựa và điện tử hỗ trợ truy xuất nguồn gốc từng công đoạn (Lot/Serial).',
    'Nâng chỉ số hiệu suất thiết bị OEE thêm 15-22%, xóa bỏ ghi chép giấy và đáp ứng audit truy xuất dữ liệu của khách hàng FDI.',
    'IND_IT', 'Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP',
    'RANGE', NULL, 250000000, 750000000, 'VND', 'gói triển khai',
    'Công ty CP Giải pháp Nhà máy Thông minh Từ Sơn', 9, 'SOFTWARE_COPYRIGHT', 'VN-SW-2026-205', 'SAAS_OR_ONPREM', 'COMMERCIALLY_READY',
    'Giám đốc Triển khai MES', 'APPROVED', 10, 4.9, 14,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '6 days', 1, NOW(), NOW(),
    '2300900008', 'Công ty Cổ phần Giải pháp Nhà máy Thông minh Từ Sơn', '30 - 45 ngày go-live', '12 tháng SLA & nâng cấp phiên bản', 'Bắc Ninh & Toàn quốc',
    'Theo mốc UAT & Go-live', true, 'TS-MES-PRO', 'Từ Sơn SmartFactory', 'Việt Nam',
    'NEW', 2026, 'Hỗ trợ 10 - 200 máy/nhà máy', 'Cloud hoặc Server tại xưởng', 'Tự động thu thập PLC/OPC-UA',
    'Edge Gateway kết nối PLC/CNC thu thập sản lượng, cảnh báo dừng máy Andon thời gian thực và đồng bộ tồn kho ERP.',
    'Mạng LAN nội bộ xưởng sản xuất.', 'SAAS_OR_ONPREM',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000009', 'OFF-BL-2026-009', 'SOLUTION', false,
    '[Dữ liệu demo mẫu] Dịch vụ Kho vận Thông minh WMS & Vận tải JIT Chuỗi KCN Bắc Ninh',
    'Cung ứng kho ngoại quan/kho tiêu chuẩn tích hợp WMS và đội xe tải định vị IoT giao hàng đúng giờ (JIT) giữa các KCN Bắc Ninh.',
    'Giảm 20% chi phí lưu kho và đảm bảo 99.8% đúng tiến độ giao hàng theo khung giờ gate-in của nhà máy FDI.',
    'IND_LOG', 'Logistics công nghiệp, Kho vận & Chuỗi cung ứng',
    'CONTACT', NULL, NULL, NULL, 'VND', 'chuyến / m2/tháng',
    'Công ty TNHH Logistics Công nghiệp Bắc Ninh', 9, 'NONE', NULL, 'SERVICE_CONTRACT', 'COMMERCIALLY_READY',
    'Giám đốc Vận hành Chuỗi cung ứng', 'APPROVED', 12, 4.8, 10,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '5 days', 1, NOW(), NOW(),
    '2300900009', 'Công ty TNHH Logistics Công nghiệp Bắc Ninh', 'Triển khai ngay trong 48h', 'Bảo hiểm 100% giá trị hàng hóa vận chuyển', 'Bắc Ninh – Hà Nội – Hải Phòng',
    'Đối soát công nợ định kỳ cuối tháng', true, 'BNL-JIT-WMS', 'Logistics CN Bắc Ninh', 'Việt Nam',
    'NEW', 2026, '18.000 m2 kho + 45 xe tải chuyên dụng', 'Xe tải Euro 5 & xe nâng điện', 'Quản lý mã vạch RFID/WMS',
    'Đồng bộ đơn đặt hàng EDI/API -> Soạn hàng theo FIFO/FEFO -> Giám sát hành trình GPS & nhiệt độ thời gian thực.',
    'Ký hợp đồng dịch vụ Logistics nguyên tắc.', 'SERVICE_CONTRACT',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
),
(
    'bac10000-0000-4000-8003-000000000010', 'OFF-BL-2026-010', 'EQUIPMENT', true,
    '[Dữ liệu demo mẫu] Hệ thống Xử lý Nước thải Tuần hoàn Công nghiệp & Giám sát Carbon ESG',
    'Module lọc màng MBR kết hợp RO tái sử dụng tới 85% nước thải công nghiệp xi mạ/điện tử và phần mềm đo lường phát thải ESG.',
    'Giảm 60% chi phí cấp nước sạch đầu vào, đạt chuẩn xả thải loại A và tự động xuất báo cáo kiểm kê ISO 14064.',
    'IND_GREEN', 'Công nghiệp xanh, Năng lượng sạch & ESG',
    'RANGE', NULL, 1200000000, 3500000000, 'VND', 'hệ thống',
    'Công ty Cổ phần Vật liệu Xanh Tiên Sơn', 8, 'PATENT_PENDING', 'VN-1-2025-04112', 'TURNKEY', 'COMMERCIALLY_READY',
    'Giám đốc Kỹ thuật Môi trường', 'APPROVED', 4, 4.9, 6,
    'BACLINK', 'Hiệp hội BACLINK', 'GLOBAL', NULL,
    true, 'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '4 days', 1, NOW(), NOW(),
    '2300900010', 'Công ty Cổ phần Vật liệu Xanh Tiên Sơn', '60 ngày lắp đặt trọn gói', '24 tháng bảo hành màng lọc & cảm biến', 'Toàn bộ KCN Bắc Ninh & Miền Bắc',
    '30% - 40% - 30%', true, 'TSG-MBR-ESG', 'Vật liệu Xanh Tiên Sơn', 'Việt Nam',
    'NEW', 2026, '50 - 300 m3/ngày đêm', 'Tiết kiệm 25% điện so với MBR thường', 'SCADA tự động quan trắc COD/TSS/pH',
    'Bể phản ứng sinh học màng MBR tách bùn hiệu suất cao kết hợp màng RO thu hồi nước sạch tái sử dụng cho tháp giải nhiệt.',
    'Mặt bằng trạm xử lý tối thiểu 80 m2.', 'TURNKEY',
    true, false, NULL, 'SELF_DECLARED', 'SELF_DECLARED'
)
ON CONFLICT (id) DO UPDATE SET
    offer_code = EXCLUDED.offer_code,
    offer_type = EXCLUDED.offer_type,
    has_tech_transfer = EXCLUDED.has_tech_transfer,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    problem_solved = EXCLUDED.problem_solved,
    sector_code = EXCLUDED.sector_code,
    sector_name = EXCLUDED.sector_name,
    pricing_type = EXCLUDED.pricing_type,
    price_amount = EXCLUDED.price_amount,
    price_min = EXCLUDED.price_min,
    price_max = EXCLUDED.price_max,
    status = 'APPROVED',
    managing_authority_id = 'BACLINK',
    managing_authority_name = 'Hiệp hội BACLINK',
    enterprise_tax_code = EXCLUDED.enterprise_tax_code,
    enterprise_name = EXCLUDED.enterprise_name,
    is_deleted = false,
    deleted_at = NULL,
    updated_at = NOW();

INSERT INTO technology.offer_spec_values (id, offer_id, spec_code, spec_name, spec_value, unit, spec_category, created_at)
VALUES
('bac10000-0000-4000-8004-000000000001', 'bac10000-0000-4000-8003-000000000001', 'SPEC_01', 'Tốc độ gắn linh kiện SMT', '120.000', 'CPH/line', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000002', 'bac10000-0000-4000-8003-000000000001', 'SPEC_02', 'Cỡ linh kiện tối thiểu', '01005 / BGA 0.35mm', 'chuẩn IPC', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000003', 'bac10000-0000-4000-8003-000000000001', 'SPEC_03', 'Cấp sạch phòng lắp ráp', 'ISO Class 7 (10.000)', 'tiêu chuẩn', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000004', 'bac10000-0000-4000-8003-000000000002', 'SPEC_01', 'Tải trọng kéo/nâng AMR', '500 - 1.000', 'kg', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000005', 'bac10000-0000-4000-8003-000000000002', 'SPEC_02', 'Độ chính xác dừng đỗ', '±5', 'mm', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000006', 'bac10000-0000-4000-8003-000000000002', 'SPEC_03', 'Thời gian hoạt động pin LFP', '10 - 12', 'giờ/lần sạc', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000007', 'bac10000-0000-4000-8003-000000000003', 'SPEC_01', 'Dung sai gia công CNC 5 trục', '±0.005', 'mm', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000008', 'bac10000-0000-4000-8003-000000000003', 'SPEC_02', 'Độ nhám bề mặt đạt chuẩn', 'Ra 0.4', 'µm', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000009', 'bac10000-0000-4000-8003-000000000003', 'SPEC_03', 'Vật liệu gia công', 'AL6061, SUS304/316, POM, PEEK', 'đa vật liệu', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000010', 'bac10000-0000-4000-8003-000000000004', 'SPEC_01', 'Tuổi thọ khuôn đột dập', '1.500.000', 'lần dập', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000011', 'bac10000-0000-4000-8003-000000000004', 'SPEC_02', 'Độ cứng lõi khuôn SKD11', '60 - 62', 'HRC', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000012', 'bac10000-0000-4000-8003-000000000004', 'SPEC_03', 'Lực dập tối đa hỗ trợ', '250', 'tấn', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000013', 'bac10000-0000-4000-8003-000000000005', 'SPEC_01', 'Điện trở bề mặt ESD', '10^6 - 10^9', 'Ohm/sq', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000014', 'bac10000-0000-4000-8003-000000000005', 'SPEC_02', 'Nhiệt độ chịu nhiệt tray', '125', '°C', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000015', 'bac10000-0000-4000-8003-000000000005', 'SPEC_03', 'Công suất ép phun', '150.000', 'khay/tháng', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000016', 'bac10000-0000-4000-8003-000000000006', 'SPEC_01', 'Chu kỳ xử lý Vision AI', '45', 'sản phẩm/phút', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000017', 'bac10000-0000-4000-8003-000000000006', 'SPEC_02', 'Độ chính xác nhận diện lỗi', '99.6', '%', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000018', 'bac10000-0000-4000-8003-000000000006', 'SPEC_03', 'Độ lặp lại cánh tay robot', '±0.02', 'mm', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000019', 'bac10000-0000-4000-8003-000000000007', 'SPEC_01', 'Khả năng phân hủy sinh học', '100', '% (tái chế)', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000020', 'bac10000-0000-4000-8003-000000000007', 'SPEC_02', 'Độ bền nén định hình', '420', 'N', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000021', 'bac10000-0000-4000-8003-000000000007', 'SPEC_03', 'Độ ẩm thành phẩm', '< 9.5', '%', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000022', 'bac10000-0000-4000-8003-000000000008', 'SPEC_01', 'Giao thức kết nối máy', 'OPC-UA / Modbus / MTConnect', 'đa chuẩn', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000023', 'bac10000-0000-4000-8003-000000000008', 'SPEC_02', 'Độ trễ cập nhật OEE', '< 2', 'giây', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000024', 'bac10000-0000-4000-8003-000000000008', 'SPEC_03', 'Truy xuất nguồn gốc Lot/Serial', '100% công đoạn', 'QR / RFID', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000025', 'bac10000-0000-4000-8003-000000000009', 'SPEC_01', 'Tổng diện tích kho KCN', '18.000', 'm2', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000026', 'bac10000-0000-4000-8003-000000000009', 'SPEC_02', 'Tỷ lệ giao hàng đúng giờ JIT', '99.8', '%', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000027', 'bac10000-0000-4000-8003-000000000009', 'SPEC_03', 'Đội xe giám sát GPS', '45', 'xe tải Euro 5', 'TIER_3_CUSTOM', NOW()),

('bac10000-0000-4000-8004-000000000028', 'bac10000-0000-4000-8003-000000000010', 'SPEC_01', 'Tỷ lệ thu hồi nước tuần hoàn', '85', '%', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000029', 'bac10000-0000-4000-8003-000000000010', 'SPEC_02', 'Công suất module xử lý', '50 - 300', 'm3/ngày đêm', 'TIER_3_SECTOR', NOW()),
('bac10000-0000-4000-8004-000000000030', 'bac10000-0000-4000-8003-000000000010', 'SPEC_03', 'Chuẩn báo cáo phát thải', 'ISO 14064-1 / ESG', 'tự động', 'TIER_3_CUSTOM', NOW())
ON CONFLICT (id) DO UPDATE SET
    offer_id = EXCLUDED.offer_id,
    spec_code = EXCLUDED.spec_code,
    spec_name = EXCLUDED.spec_name,
    spec_value = EXCLUDED.spec_value,
    unit = EXCLUDED.unit,
    spec_category = EXCLUDED.spec_category;

-- -----------------------------------------------------------------------------
-- BƯỚC B4: 8 Phiếu Khảo sát & 8 Nhu cầu Đặt hàng / Tìm Nhà cung ứng
-- (demand.demand_surveys -> demand.demand_items)
-- -----------------------------------------------------------------------------

INSERT INTO demand.demand_surveys (
    id, enterprise_id, survey_code, survey_year, survey_type,
    has_rd_unit, has_tech_training, has_machinery_upgrade, has_rd_budget,
    is_exporting, in_value_chain, top_bottlenecks, support_needs, recommendations,
    tni_score, tni_classification, status,
    created_by, company_name, tax_code, contact_name, contact_phone, contact_email,
    business_type, enterprise_size, employee_scale, revenue_range_3y,
    province, headquarters_address, main_industry, main_products,
    submitted_at, version, created_at, updated_at
)
VALUES
(
    'bac10000-0000-4000-8005-000000000001', 'bac10000-0000-4000-8002-000000000001',
    'SUR-BL-2026-001', 2026, 'SUPPLY_CHAIN_DEMAND',
    true, true, true, true, true, true,
    ARRAY['Tự động hóa kiểm tra quang học AOI tốc độ cao']::text[],
    ARRAY['Tìm nhà cung cấp giải pháp Vision AI & nâng cấp dây chuyền SMT']::text[],
    'Ưu tiên giải pháp tích hợp trực tiếp với dây chuyền SMT hiện hữu tại KCN Tiên Sơn.',
    87.0, 'HIGH', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000002',
    'Công ty Cổ phần Hanel PT', '0101420901', 'Nguyễn Minh Tuấn', '02223714568', 'member.hanelpt@baclink.org.vn',
    'Cổ phần', 'MEDIUM_LARGE', '500-1000', '300-500 tỷ',
    'Bắc Ninh', 'Lô CN-02, KCN Tiên Sơn, TP. Từ Sơn, Bắc Ninh',
    'IND_ELEC', 'Bản mạch PCBA, Cảm biến công nghiệp',
    NOW() - INTERVAL '10 days', 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8005-000000000002', 'bac10000-0000-4000-8002-000000000002',
    'SUR-BL-2026-002', 2026, 'SUPPLY_CHAIN_DEMAND',
    true, true, true, true, true, true,
    ARRAY['Tìm nhà cung ứng gia công khung vỏ kim loại tấm & chi tiết CNC cho AGV']::text[],
    ARRAY['Đặt hàng gia công cơ khí chính xác tại Bắc Ninh']::text[],
    'Cần đối tác gia công đạt ISO 9001, đáp ứng tiến độ JIT tại KCN VSIP Bắc Ninh.',
    89.0, 'VERY_HIGH', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000003',
    'Công ty Cổ phần Tập đoàn Công nghiệp INTECH', '2300881920', 'Cao Hoàng Hiệp', '02223901234', 'member.intech@baclink.org.vn',
    'Cổ phần', 'MEDIUM', '300-500', '200-300 tỷ',
    'Bắc Ninh', 'Lô 12, KCN VSIP Bắc Ninh, TP. Từ Sơn, Bắc Ninh',
    'IND_AUTO', 'Con lăn, Băng tải, Robot AGV/AMR',
    NOW() - INTERVAL '9 days', 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8005-000000000003', 'bac10000-0000-4000-8002-000000000003',
    'SUR-BL-2026-003', 2026, 'SUPPLY_CHAIN_DEMAND',
    true, true, true, true, true, true,
    ARRAY['Tìm đối tác xử lý nhiệt chân không & mạ anode cứng hợp kim nhôm']::text[],
    ARRAY['Kết nối đơn vị xử lý bề mặt chuẩn FDI tại Bắc Ninh']::text[],
    'Ưu tiên đơn vị tại KCN Yên Phong hoặc Quế Võ có chứng nhận xử lý nước thải đạt chuẩn.',
    82.0, 'HIGH', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000004',
    'Công ty TNHH Công nghiệp Viqualita', '2300992831', 'Trần Quốc Cường', '02223886543', 'member.viqualita@baclink.org.vn',
    'TNHH', 'MEDIUM', '150-300', '100-200 tỷ',
    'Bắc Ninh', 'Lô CN-15, KCN Yên Phong I, H. Yên Phong, Bắc Ninh',
    'IND_MECH', 'Đồ gá JIG, Chi tiết CNC 5 trục',
    NOW() - INTERVAL '8 days', 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8005-000000000004', 'bac10000-0000-4000-8002-000000000005',
    'SUR-BL-2026-004', 2026, 'SUPPLY_CHAIN_DEMAND',
    true, true, true, true, true, true,
    ARRAY['Tìm nhà chế tạo khuôn ép phun đa lòng độ chính xác cao']::text[],
    ARRAY['Đặt hàng thiết kế & chế tạo khuôn mẫu cho linh kiện nhựa ESD']::text[],
    '[Dữ liệu demo mẫu] Yêu cầu khuôn thép NAK80/S136 kèm báo cáo thử mẫu T0-T1.',
    78.0, 'HIGH', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000001',
    'Công ty Cổ phần Nhựa Kỹ thuật Yên Phong', '2300900005', 'Phạm Thị Lan', '02223810005', 'info@yenphong-plastic.example.vn',
    'Cổ phần', 'MEDIUM', '150-250', '80-150 tỷ',
    'Bắc Ninh', 'Lô E2, KCN Yên Phong II-C, H. Yên Phong, Bắc Ninh',
    'IND_PLAS', 'Nhựa kỹ thuật & Khay ESD',
    NOW() - INTERVAL '7 days', 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8005-000000000005', 'bac10000-0000-4000-8002-000000000006',
    'SUR-BL-2026-005', 2026, 'SUPPLY_CHAIN_DEMAND',
    true, true, true, true, false, true,
    ARRAY['Tìm nhà cung cấp vật liệu hợp kim nhẹ & linh kiện khí nén chuẩn công nghiệp']::text[],
    ARRAY['Nội địa hóa cụm truyền động tuyến tính và khung hợp kim nhôm định hình']::text[],
    '[Dữ liệu demo mẫu] Tìm kiếm đối tác cung ứng dài hạn cho các dự án lắp ráp robot.',
    81.0, 'HIGH', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000001',
    'Công ty TNHH Tự động hóa & Robot VSIP', '2300900006', 'Ngô Đức Thắng', '02223810006', 'sales@vsip-robotics.example.vn',
    'TNHH', 'SMALL', '50-100', '50-100 tỷ',
    'Bắc Ninh', 'Lô D8, KCN Đại Đồng - Hoàn Sơn, H. Tiên Du, Bắc Ninh',
    'IND_MAT', 'Trạm robot tự động hóa',
    NOW() - INTERVAL '6 days', 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8005-000000000006', 'bac10000-0000-4000-8002-000000000004',
    'SUR-BL-2026-006', 2026, 'SUPPLY_CHAIN_DEMAND',
    false, true, true, true, false, true,
    ARRAY['Triển khai phần mềm MES giám sát OEE & truy xuất nguồn gốc máy CNC']::text[],
    ARRAY['Tìm nhà cung cấp phần mềm MES/ERP phù hợp quy mô 40 máy CNC']::text[],
    '[Dữ liệu demo mẫu] Cần giải pháp triển khai nhanh trong 45 ngày, hỗ trợ tiếng Việt.',
    76.0, 'HIGH', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000001',
    'Công ty TNHH Cơ khí Chính xác Kinh Bắc', '2300900004', 'Lê Văn Hùng', '02223810004', 'contact@kinhbac-precision.example.vn',
    'TNHH', 'MEDIUM', '100-200', '50-100 tỷ',
    'Bắc Ninh', 'Lô B4, KCN Quế Võ I, TX. Quế Võ, Bắc Ninh',
    'IND_IT', 'Khuôn mẫu & Gia công CNC',
    NOW() - INTERVAL '5 days', 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8005-000000000007', 'bac10000-0000-4000-8002-000000000007',
    'SUR-BL-2026-007', 2026, 'SUPPLY_CHAIN_DEMAND',
    true, true, true, false, true, true,
    ARRAY['Lắp đặt hệ thống thu hồi nhiệt thải lò sấy & điện mặt trời áp mái']::text[],
    ARRAY['Tìm giải pháp tiết kiệm năng lượng & kiểm kê khí nhà kính ESG']::text[],
    '[Dữ liệu demo mẫu] Đáp ứng yêu cầu giảm phát thải 25% theo cam kết với khách hàng FDI.',
    75.0, 'HIGH', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000001',
    'Công ty Cổ phần Bao bì Công nghiệp Quế Võ', '2300900007', 'Đỗ Thanh Bình', '02223810007', 'hello@quevo-pack.example.vn',
    'Cổ phần', 'MEDIUM', '100-200', '80-150 tỷ',
    'Bắc Ninh', 'Lô C6, KCN Quế Võ II, TX. Quế Võ, Bắc Ninh',
    'IND_GREEN', 'Bao bì sinh học & Khay định hình',
    NOW() - INTERVAL '4 days', 1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8005-000000000008', 'bac10000-0000-4000-8002-000000000010',
    'SUR-BL-2026-008', 2026, 'SUPPLY_CHAIN_DEMAND',
    true, true, true, true, false, true,
    ARRAY['Tìm đơn vị vận tải chuyên dụng thiết bị lọc màng và kho bãi trung chuyển KCN']::text[],
    ARRAY['Thuê dịch vụ vận chuyển cơ giới & kho bãi ngắn hạn tại KCN Gia Bình – Yên Phong']::text[],
    '[Dữ liệu demo mẫu] Yêu cầu xe cẩu tự hành và quản lý giao nhận đúng tiến độ công trường.',
    74.0, 'MEDIUM', 'VERIFIED',
    'bac10000-0000-4000-8001-000000000001',
    'Công ty Cổ phần Vật liệu Xanh Tiên Sơn', '2300900010', 'Hoàng Thị Mai', '02223810010', 'esg@tienson-greenmat.example.vn',
    'Cổ phần', 'SMALL', '50-100', '50-100 tỷ',
    'Bắc Ninh', 'Lô G2, KCN Gia Bình, H. Gia Bình, Bắc Ninh',
    'IND_LOG', 'Hệ thống xử lý nước tuần hoàn',
    NOW() - INTERVAL '3 days', 1, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    enterprise_id = EXCLUDED.enterprise_id,
    survey_code = EXCLUDED.survey_code,
    status = 'VERIFIED',
    company_name = EXCLUDED.company_name,
    tax_code = EXCLUDED.tax_code,
    main_industry = EXCLUDED.main_industry,
    updated_at = NOW();

INSERT INTO demand.demand_items (
    id, survey_id, item_code, stage_name,
    technical_problem, desired_solution, need_consulting, expected_goal, application_scale,
    sector_code, tech_group_code, demand_type_code, budget_range,
    urgency_score, impact_score, investment_capacity, adoption_readiness,
    tni_score, tni_classification, status, is_public_listed,
    created_by, created_at, updated_at,
    tni_verification_status, verified_authority_name, tni_review_note
)
VALUES
(
    'bac10000-0000-4000-8006-000000000001', 'bac10000-0000-4000-8005-000000000001',
    'DMD-BL-2026-001', 'Kiểm tra chất lượng mối hàn SMT & bản mạch PCBA',
    'Cần tìm giải pháp kiểm tra quang học AOI 3D tích hợp AI nhận diện lỗi cầu chì, thiếu thiếc và lệch chân linh kiện 0201 trên 2 dây chuyền SMT tại KCN Tiên Sơn.',
    'Hệ thống AOI 3D tốc độ cao kết hợp phần mềm phân tích lỗi theo thời gian thực và kết nối truy xuất dữ liệu MES.',
    true, 'Giảm tỷ lệ lọt lỗi xuống dưới 80 PPM và giảm 50% thời gian phân loại giả lỗi (False Call).', '2 dây chuyền sản xuất liên tục 3 ca',
    'IND_ELEC', 'CN06', 'NC01', '1.5 - 3 tỷ VND',
    9, 9, 8, 9, 88, 'VERY_HIGH', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000002', NOW() - INTERVAL '10 days', NOW(),
    'VERIFIED_BY_AUTH', 'Hiệp hội BACLINK', 'Nhu cầu thực tế của Hội viên Hanel PT, đã xác thực mức độ sẵn sàng đầu tư.'
),
(
    'bac10000-0000-4000-8006-000000000002', 'bac10000-0000-4000-8005-000000000002',
    'DMD-BL-2026-002', 'Gia công khung vỏ & chi tiết cơ khí chính xác cho Robot AGV',
    'Tìm nhà cung cấp nội địa tại Bắc Ninh gia công định kỳ 300 bộ khung thép hàn cắt laser, chấn gấp CNC, sơn tĩnh điện và trục truyền động tiện CNC cho dòng xe tự hành AGV 500kg.',
    'Đối tác cơ khí có máy cắt laser fiber >= 6kW, máy chấn CNC và hệ thống sơn tĩnh điện đạt chuẩn ISO 9001.',
    false, 'Nội địa hóa 100% khung cơ khí AGV, rút ngắn thời gian giao hàng còn 10 ngày/lô.', '300 bộ/năm (đặt hàng hàng tháng)',
    'IND_MECH', 'CN01', 'NC03', '2 - 4 tỷ VND/năm',
    9, 8, 9, 9, 87, 'VERY_HIGH', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000003', NOW() - INTERVAL '9 days', NOW(),
    'VERIFIED_BY_AUTH', 'Hiệp hội BACLINK', 'Đơn hàng chuỗi cung ứng mở từ INTECH Group.'
),
(
    'bac10000-0000-4000-8006-000000000003', 'bac10000-0000-4000-8005-000000000003',
    'DMD-BL-2026-003', 'Xử lý nhiệt chân không & mạ Anode cứng chi tiết nhôm CNC',
    'Tìm đối tác cung ứng dịch vụ xử lý nhiệt chân không thép khuôn và mạ Anode cứng (Hard Anodizing) độ dày lớp mạ 35-50 µm màu đen mờ cho đồ gá JIG điện tử.',
    'Xưởng xử lý bề mặt tại Bắc Ninh hoặc lân cận đạt chuẩn xử lý nước thải và chứng nhận RoHS.',
    true, 'Đáp ứng sản lượng 15.000 chi tiết/tháng, thời gian quay vòng <= 48 giờ.', '15.000 chi tiết/tháng',
    'IND_MAT', 'CN20', 'NC03', '800 triệu - 1.5 tỷ VND/năm',
    8, 8, 8, 8, 80, 'HIGH', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000004', NOW() - INTERVAL '8 days', NOW(),
    'VERIFIED_BY_AUTH', 'Hiệp hội BACLINK', 'Nhu cầu gia công phụ trợ của Hội viên Viqualita.'
),
(
    'bac10000-0000-4000-8006-000000000004', 'bac10000-0000-4000-8005-000000000004',
    'DMD-BL-2026-004', 'Chế tạo khuôn ép phun đa lòng linh kiện nhựa kỹ thuật ESD',
    '[Dữ liệu demo mẫu] Đặt hàng thiết kế và chế tạo 06 bộ khuôn ép phun 8-16 lòng (hot-runner) dùng thép NAK80/S136 sản xuất khay chứa module camera chống tĩnh điện.',
    'Đơn vị thiết kế khuôn chuyên nghiệp sử dụng phần mềm phân tích dòng chảy Moldflow và máy phay tốc độ cao.',
    false, 'Chu kỳ ép <= 18 giây/lần, độ đồng đều kích thước giữa các lòng khuôn đạt ±0.02mm.', '06 bộ khuôn chính xác',
    'IND_PLAS', 'CN02', 'NC01', '1 - 2.2 tỷ VND',
    8, 8, 7, 8, 78, 'HIGH', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '7 days', NOW(),
    'SELF_DECLARED', 'Hiệp hội BACLINK', 'Bài toán mẫu minh họa ngành Nhựa kỹ thuật.'
),
(
    'bac10000-0000-4000-8006-000000000005', 'bac10000-0000-4000-8005-000000000005',
    'DMD-BL-2026-005', 'Tự động hóa cụm cấp phôi rung & lắp ráp bán thành phẩm bằng Robot',
    '[Dữ liệu demo mẫu] Cần giải pháp cấp phôi linh kiện nhựa nhỏ (bowl feeder kết hợp camera định hướng) và robot Scara lắp ráp tự động công suất 35 cụm/phút.',
    'Trọn gói thiết kế cơ khí cụm cấp phôi, tích hợp robot Scara 4 trục và tủ PLC điều khiển.',
    true, 'Giảm 6 nhân công đứng máy mỗi ca, tỷ lệ chạy ổn định >= 98%.', '02 cụm máy lắp ráp',
    'IND_AUTO', 'CN01', 'NC01', '700 triệu - 1.2 tỷ VND',
    8, 9, 7, 8, 81, 'HIGH', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '6 days', NOW(),
    'SELF_DECLARED', 'Hiệp hội BACLINK', 'Bài toán mẫu minh họa ngành Tự động hóa.'
),
(
    'bac10000-0000-4000-8006-000000000006', 'bac10000-0000-4000-8005-000000000006',
    'DMD-BL-2026-006', 'Triển khai phần mềm MES giám sát OEE & truy xuất nguồn gốc 40 máy CNC',
    '[Dữ liệu demo mẫu] Tìm đơn vị cung cấp phần mềm MES kết nối trực tiếp bộ điều khiển Fanuc/Mitsubishi trên 40 máy CNC tại KCN Quế Võ để theo dõi OEE và quản lý dao cắt.',
    'Hệ thống MES hỗ trợ OPC-UA/FOCAS, bảng hiển thị Andon tại xưởng và xuất báo cáo QC tự động cho khách hàng FDI.',
    true, 'Tăng OEE từ 62% lên 78% trong 6 tháng đầu vận hành.', '40 máy CNC + 3 trạm QC',
    'IND_IT', 'CN09', 'NC02', '400 - 800 triệu VND',
    8, 8, 7, 8, 77, 'HIGH', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '5 days', NOW(),
    'SELF_DECLARED', 'Hiệp hội BACLINK', 'Bài toán mẫu minh họa ngành CNTT & MES.'
),
(
    'bac10000-0000-4000-8006-000000000007', 'bac10000-0000-4000-8005-000000000007',
    'DMD-BL-2026-007', 'Hệ thống thu hồi nhiệt thải sấy & kiểm kê khí nhà kính ESG ISO 14064',
    '[Dữ liệu demo mẫu] Cần giải pháp thu hồi nhiệt từ khí thải buồng sấy khay định hình sinh học kết hợp tư vấn kiểm kê khí nhà kính Scope 1-2 phục vụ đánh giá ESG.',
    'Thiết bị trao đổi nhiệt không khí-nước hiệu suất cao kèm phần mềm/dịch vụ lập báo cáo kiểm kê carbon.',
    true, 'Tiết kiệm 22% nhiên liệu đốt sấy và hoàn tất báo cáo kiểm kê carbon năm 2026.', 'Nhà máy 8.000 m2 tại KCN Quế Võ II',
    'IND_GREEN', 'CN39', 'NC02', '600 triệu - 1.1 tỷ VND',
    7, 8, 7, 8, 75, 'HIGH', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '4 days', NOW(),
    'SELF_DECLARED', 'Hiệp hội BACLINK', 'Bài toán mẫu minh họa ngành Công nghiệp Xanh & ESG.'
),
(
    'bac10000-0000-4000-8006-000000000008', 'bac10000-0000-4000-8005-000000000008',
    'DMD-BL-2026-008', 'Dịch vụ Logistics vận chuyển thiết bị công nghiệp & kho trung chuyển KCN',
    '[Dữ liệu demo mẫu] Tìm đối tác logistics cung ứng xe cẩu tự hành 5-15 tấn, xe tải thùng kín và kho lưu trữ 1.500 m2 trung chuyển module xử lý nước tại KCN Gia Bình – Yên Phong.',
    'Dịch vụ vận tải có bảo hiểm hàng hóa công nghiệp, giám sát GPS và giao nhận theo lịch hẹn lắp đặt tại KCN.',
    false, 'Đảm bảo 100% tiến độ giao thiết bị đến các KCN trong tỉnh Bắc Ninh và Hải Phòng.', '1.500 m2 kho + 15-20 chuyến/tháng',
    'IND_LOG', 'CN05', 'NC03', '500 - 900 triệu VND/năm',
    7, 7, 8, 8, 74, 'MEDIUM', 'VERIFIED', true,
    'bac10000-0000-4000-8001-000000000001', NOW() - INTERVAL '3 days', NOW(),
    'SELF_DECLARED', 'Hiệp hội BACLINK', 'Bài toán mẫu minh họa ngành Logistics công nghiệp.'
)
ON CONFLICT (id) DO UPDATE SET
    survey_id = EXCLUDED.survey_id,
    item_code = EXCLUDED.item_code,
    stage_name = EXCLUDED.stage_name,
    technical_problem = EXCLUDED.technical_problem,
    desired_solution = EXCLUDED.desired_solution,
    expected_goal = EXCLUDED.expected_goal,
    sector_code = EXCLUDED.sector_code,
    budget_range = EXCLUDED.budget_range,
    tni_score = EXCLUDED.tni_score,
    tni_classification = EXCLUDED.tni_classification,
    status = 'VERIFIED',
    is_public_listed = true,
    verified_authority_name = 'Hiệp hội BACLINK',
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- BƯỚC B5: 3 Sự kiện BACLINK (content.techmart_events)
-- -----------------------------------------------------------------------------

INSERT INTO content.techmart_events (
    id, title, description, location,
    start_date, end_date, status, technologies_count,
    pdf_brochure_url, banner_url, version, created_at, updated_at
)
VALUES
(
    'bac10000-0000-4000-8007-000000000001',
    'Diễn đàn Quản trị bền vững & Chuyển đổi số Doanh nghiệp Bắc Ninh 2026',
    'Diễn đàn thường niên của Hiệp hội BACLINK kết nối lãnh đạo doanh nghiệp sản xuất Bắc Ninh với các chuyên gia MES/ERP, tự động hóa nhà máy thông minh và quản trị chuỗi cung ứng bền vững.',
    'Trung tâm Hội nghị Kinh Bắc, TP. Bắc Ninh',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '15 days',
    'UPCOMING',
    28,
    '/docs/baclink-forum-2026-brochure.pdf',
    '/images/events/baclink-sustainable-forum.jpg',
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8007-000000000002',
    'Ngày hội Kết nối Chuỗi cung ứng FDI – Nội địa Bắc Ninh 2026',
    'Phiên kết nối B2B 1-1 giữa bộ phận thu mua của các tập đoàn FDI (Samsung, Canon, Foxconn, Goertek) và các doanh nghiệp hội viên công nghiệp hỗ trợ Bắc Ninh thuộc 8 ngành công nghiệp chủ lực.',
    'Trung tâm Xúc tiến KCN VSIP Bắc Ninh, TP. Từ Sơn',
    NOW() + INTERVAL '28 days',
    NOW() + INTERVAL '29 days',
    'UPCOMING',
    45,
    '/docs/baclink-fdi-matching-2026.pdf',
    '/images/events/baclink-fdi-supply-chain.jpg',
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8007-000000000003',
    'Hội thảo Chuyển đổi xanh, Tiêu chuẩn ESG & Kiểm kê Khí nhà kính Khu công nghiệp',
    'Chương trình tập huấn chuyên sâu hướng dẫn doanh nghiệp trong các KCN Yên Phong, Quế Võ, Tiên Sơn lộ trình đáp ứng tiêu chuẩn ESG, kiểm kê khí nhà kính ISO 14064 và giải pháp tiết kiệm năng lượng.',
    'Hội trường KCN Yên Phong I, H. Yên Phong, Bắc Ninh',
    NOW() + INTERVAL '42 days',
    NOW() + INTERVAL '42 days' + INTERVAL '8 hours',
    'UPCOMING',
    18,
    '/docs/baclink-esg-workshop-2026.pdf',
    '/images/events/baclink-esg-workshop.jpg',
    1, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = 'UPCOMING',
    technologies_count = EXCLUDED.technologies_count,
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- BƯỚC B6: 6 Khóa học LMS Công nghiệp (lms.learning_materials)
-- -----------------------------------------------------------------------------

INSERT INTO lms.learning_materials (
    id, material_code, title, lesson_type, sector_code, duration_minutes,
    description_html, thumbnail_url, status,
    published_at, published_by, created_by, created_by_name,
    created_at, updated_at, is_deleted, deleted_at, version,
    view_count, completion_count, rating_average, rating_count, slug,
    cluster_code, cluster_name, step_number,
    target_audience, expected_outcome, pass_score_percent
)
VALUES
(
    'bac10000-0000-4000-8008-000000000001',
    'LMS-BL-001',
    'Lean Manufacturing & 5S Thực chiến tại Nhà máy Công nghiệp Hỗ trợ',
    'COURSE', 'IND_MECH', 90,
    '<p>Khóa học hướng dẫn chuẩn hóa mặt bằng phân xưởng, giảm 7 lãng phí trong gia công cơ khí – lắp ráp, thiết lập chuẩn 5S và quản lý trực quan (Visual Management) đáp ứng đánh giá hiện trường của khách hàng FDI.</p>',
    '/images/lms/lean-5s-baclink.jpg', 'PUBLISHED',
    NOW() - INTERVAL '20 days', 'bac10000-0000-4000-8001-000000000001',
    'bac10000-0000-4000-8001-000000000001', 'Ban Đào tạo Hiệp hội BACLINK',
    NOW(), NOW(), false, NULL, 1,
    184, 92, 4.9, 28, 'lean-manufacturing-5s-baclink',
    'CLUSTER_A', 'Chuẩn hóa Vận hành & Hiện trường Nhà máy', 1,
    'Quản đốc, Trưởng ca, Kỹ sư IE/QA tại nhà máy sản xuất Bắc Ninh',
    'Xây dựng được bảng kiểm 5S chuẩn xưởng và giảm ít nhất 15% thời gian chuyển đổi gá lắp.',
    80
),
(
    'bac10000-0000-4000-8008-000000000002',
    'LMS-BL-002',
    'Hệ thống Quản lý Chất lượng IATF 16949 & ISO 9001 cho Nhà cung ứng Tier 1-2',
    'COURSE', 'IND_AUTO', 120,
    '<p>Chuyên đề phân tích 5 công cụ cốt lõi (APQP, PPAP, FMEA, MSA, SPC) giúp doanh nghiệp cơ khí, nhựa kỹ thuật và điện tử Bắc Ninh vượt qua đợt đánh giá nhà cung ứng của tập đoàn ô tô và điện tử đa quốc gia.</p>',
    '/images/lms/iatf-16949-iso9001.jpg', 'PUBLISHED',
    NOW() - INTERVAL '18 days', 'bac10000-0000-4000-8001-000000000001',
    'bac10000-0000-4000-8001-000000000001', 'Ban Đào tạo Hiệp hội BACLINK',
    NOW(), NOW(), false, NULL, 1,
    215, 108, 4.9, 34, 'iatf-16949-iso-9001-tier-1-2',
    'CLUSTER_B', 'Quản trị Chất lượng & Tiêu chuẩn FDI', 2,
    'Trưởng phòng QA/QC, Kỹ sư chất lượng và Ban ISO doanh nghiệp hội viên',
    'Hoàn thiện được hồ sơ PFMEA, Control Plan và biểu đồ kiểm soát SPC cho 1 mã hàng trọng điểm.',
    80
),
(
    'bac10000-0000-4000-8008-000000000003',
    'LMS-BL-003',
    'Triển khai MES / ERP & Truy xuất Nguồn gốc Sản xuất Thông minh',
    'COURSE', 'IND_IT', 105,
    '<p>Hướng dẫn kiến trúc kết nối dữ liệu máy CNC/SMT lên hệ thống MES, đo chỉ số OEE theo thời gian thực và thiết lập truy xuất nguồn gốc theo Lot/Serial đáp ứng yêu cầu chuyển đổi số nhà máy vừa và nhỏ.</p>',
    '/images/lms/mes-erp-smart-factory.jpg', 'PUBLISHED',
    NOW() - INTERVAL '15 days', 'bac10000-0000-4000-8001-000000000001',
    'bac10000-0000-4000-8001-000000000001', 'Ban Đào tạo Hiệp hội BACLINK',
    NOW(), NOW(), false, NULL, 1,
    162, 74, 4.8, 21, 'mes-erp-truy-xuat-nguon-goc',
    'CLUSTER_C', 'Chuyển đổi số & Tự động hóa Nhà máy', 3,
    'Giám đốc sản xuất, Trưởng phòng IT/OT và Quản lý dự án chuyển đổi số',
    'Lập được lộ trình số hóa MES 3 giai đoạn và bộ KPI OEE phù hợp ngân sách SME.',
    80
),
(
    'bac10000-0000-4000-8008-000000000004',
    'LMS-BL-004',
    'Lộ trình ESG, Kiểm kê Khí nhà kính ISO 14064 & Sản xuất Xanh trong KCN',
    'COURSE', 'IND_GREEN', 90,
    '<p>Cung cấp phương pháp luận tính toán phát thải Phạm vi 1 & 2 theo ISO 14064-1, cơ chế CBAM của EU và giải pháp tối ưu điện – nước tuần hoàn giúp doanh nghiệp KCN Bắc Ninh giữ vững đơn hàng xuất khẩu.</p>',
    '/images/lms/esg-carbon-baclink.jpg', 'PUBLISHED',
    NOW() - INTERVAL '12 days', 'bac10000-0000-4000-8001-000000000001',
    'bac10000-0000-4000-8001-000000000001', 'Ban Đào tạo Hiệp hội BACLINK',
    NOW(), NOW(), false, NULL, 1,
    143, 68, 4.8, 19, 'esg-kiem-ke-khi-nha-kinh-iso14064',
    'CLUSTER_D', 'Chuyển đổi Xanh & Phát triển Bền vững ESG', 4,
    'Cán bộ HSE, Quản lý năng lượng và Ban Giám đốc doanh nghiệp sản xuất',
    'Xác định được ranh giới kiểm kê khí nhà kính và lập bảng tính phát thải cơ sở cho nhà máy.',
    80
),
(
    'bac10000-0000-4000-8008-000000000005',
    'LMS-BL-005',
    'Tự động hóa Dây chuyền SMT, Kiểm soát Tĩnh điện ESD & AOI Điện tử',
    'COURSE', 'IND_ELEC', 110,
    '<p>Đi sâu vào kiểm soát quy trình in kem hàn SPI, tối ưu hồ sơ nhiệt Reflow, phòng ngừa phóng tĩnh điện theo ANSI/ESD S20.20 và giảm sai lỗi giả trên máy kiểm tra quang học AOI 3D.</p>',
    '/images/lms/smt-esd-aoi-automation.jpg', 'PUBLISHED',
    NOW() - INTERVAL '10 days', 'bac10000-0000-4000-8001-000000000001',
    'bac10000-0000-4000-8001-000000000001', 'Ban Đào tạo Hiệp hội BACLINK',
    NOW(), NOW(), false, NULL, 1,
    138, 61, 4.9, 17, 'tu-dong-hoa-smt-esd-aoi',
    'CLUSTER_E', 'Công nghệ Chế tạo Điện tử & Bán dẫn', 5,
    'Kỹ sư quy trình SMT, Kỹ thuật viên bảo trì thiết bị và QA điện tử',
    'Thiết lập được danh mục kiểm soát ESD phòng sạch và chuẩn hóa thông số Reflow/AOI.',
    80
),
(
    'bac10000-0000-4000-8008-000000000006',
    'LMS-BL-006',
    'Quản trị Chuỗi cung ứng FDI, Định giá Gia công & Đáp ứng Audit Nhà máy',
    'COURSE', 'IND_LOG', 95,
    '<p>Hướng dẫn cấu trúc bảng tính giá thành gia công chuẩn quốc tế, kỹ thuật đàm phán đơn hàng OEM/ODM, quản trị tồn kho an toàn JIT và bộ tiêu chí audit toàn diện của các tập đoàn FDI tại Bắc Ninh.</p>',
    '/images/lms/fdi-supply-chain-audit.jpg', 'PUBLISHED',
    NOW() - INTERVAL '7 days', 'bac10000-0000-4000-8001-000000000001',
    'bac10000-0000-4000-8001-000000000001', 'Ban Đào tạo Hiệp hội BACLINK',
    NOW(), NOW(), false, NULL, 1,
    176, 85, 4.8, 25, 'quan-tri-chuoi-cung-ung-fdi-audit',
    'CLUSTER_F', 'Kết nối Chuỗi cung ứng & Năng lực Thương mại B2B', 6,
    'Giám đốc kinh doanh B2B, Trưởng phòng Thu mua và Chuỗi cung ứng',
    'Xây dựng được hồ sơ năng lực (Vendor Profile) và bảng bóc tách giá thành chuẩn FDI.',
    80
)
ON CONFLICT (id) DO UPDATE SET
    material_code = EXCLUDED.material_code,
    title = EXCLUDED.title,
    lesson_type = EXCLUDED.lesson_type,
    sector_code = EXCLUDED.sector_code,
    duration_minutes = EXCLUDED.duration_minutes,
    description_html = EXCLUDED.description_html,
    status = 'PUBLISHED',
    is_deleted = false,
    deleted_at = NULL,
    cluster_code = EXCLUDED.cluster_code,
    cluster_name = EXCLUDED.cluster_name,
    step_number = EXCLUDED.step_number,
    updated_at = NOW();

-- -----------------------------------------------------------------------------
-- BƯỚC B7: 5 Cố vấn Kỹ thuật Ban Chuyên môn BACLINK (brokerage.expert_profiles)
-- -----------------------------------------------------------------------------

INSERT INTO brokerage.expert_profiles (
    id, person_id, expert_code, full_name, phone, email,
    birth_year, gender, academic_rank, academic_rank_year, degree, degree_year,
    organization_name, organization_address, position_title, research_title,
    expertise_sectors, mastered_tech_codes, specialized_keywords,
    training_history_json, employment_history_json, publications_json,
    consulting_summary, public_bio,
    is_project_leader, is_main_contributor, pdpd_consent_at_utc, legal_oath,
    status, draft_source, visibility_status, is_accepting_consultation, connection_count,
    version, created_at, updated_at
)
VALUES
(
    'bac10000-0000-4000-8009-000000000001', NULL, 'CG-BL-001',
    'TS. Nguyễn Minh Khôi', '0912100001', 'khoi.nm@baclink.org.vn',
    1980, 'MALE', 'NONE', NULL, 'DOCTOR', 2012,
    'Viện Tự động hóa Công nghiệp & Ban Cố vấn BACLINK',
    'KCN VSIP Bắc Ninh, TP. Từ Sơn, Bắc Ninh',
    'Chuyên gia trưởng Tự động hóa & Robot',
    'Hệ thống Robot lắp ráp thông minh và xe tự hành AMR trong nhà máy điện tử',
    ARRAY['IND_AUTO','IND_ELEC']::text[],
    ARRAY['CN01','CN02','CN03','CN06']::text[],
    ARRAY['Robot 6 trục','AGV/AMR','PLC/SCADA','Vision AI']::text[],
    '[{"level":"Tiến sĩ Cơ điện tử","institution":"Đại học Bách khoa Hà Nội","year":2012}]'::jsonb,
    '[{"position":"Cố vấn Tự động hóa","organization":"Hiệp hội BACLINK","fromYear":2022}]'::jsonb,
    '[{"title":"Tối ưu hóa điều phối đội xe AMR chuẩn VDA 5050 trong nhà máy SMT","journal":"Tạp chí Tự động hóa Ngày nay","year":2025}]'::jsonb,
    'Hơn 14 năm tư vấn thiết kế dây chuyền tự động hóa, tích hợp robot công nghiệp và kiểm tra ngoại quan AI cho các nhà máy điện tử tại Bắc Ninh.',
    'TS. Nguyễn Minh Khôi phụ trách tư vấn nâng cấp tự động hóa phân xưởng, đánh giá ROI đầu tư robot và kết nối giải pháp Smart Factory cho hội viên BACLINK.',
    true, true, NOW(), true,
    'APPROVED', 'PORTAL', 'PUBLIC', true, 18,
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8009-000000000002', NULL, 'CG-BL-002',
    'ThS. Trần Hoàng Sơn', '0912100002', 'son.th@baclink.org.vn',
    1978, 'MALE', 'NONE', NULL, 'MASTER', 2008,
    'Trung tâm Hỗ trợ Khuôn mẫu & Cơ khí Chính xác Bắc Ninh',
    'KCN Yên Phong I, H. Yên Phong, Bắc Ninh',
    'Cố vấn Kỹ thuật Khuôn mẫu CNC & Đồ gá JIG',
    'Thiết kế khuôn đột dập liên hoàn và khuôn ép phun chính xác cao',
    ARRAY['IND_MECH','IND_MAT']::text[],
    ARRAY['CN01','CN02','CN38']::text[],
    ARRAY['CNC 5 trục','Khuôn mẫu','CMM','Nhiệt luyện SKD11']::text[],
    '[{"level":"Thạc sĩ Kỹ thuật Cơ khí","institution":"Đại học Công nghiệp Hà Nội","year":2008}]'::jsonb,
    '[{"position":"Kỹ sư trưởng Khuôn mẫu","organization":"Nhà máy Cơ khí Khuôn mẫu Bắc Ninh","fromYear":2014}]'::jsonb,
    '[{"title":"Giảm cong vênh chi tiết hợp kim nhôm thành mỏng khi gia công CNC 5 trục","journal":"Kỷ yếu Cơ khí Chính xác Việt Nam","year":2024}]'::jsonb,
    'Chuyên sâu về thiết kế khuôn ép phun, khuôn dập liên hoàn, lập trình gia công CNC 5 trục và chuẩn hóa quy trình đo kiểm CMM.',
    'ThS. Trần Hoàng Sơn đồng hành cùng các doanh nghiệp cơ khí Bắc Ninh tối ưu quy trình gia công, giảm phế phẩm và nâng cấp năng lực làm JIG cho đối tác FDI.',
    true, true, NOW(), true,
    'APPROVED', 'PORTAL', 'PUBLIC', true, 15,
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8009-000000000003', NULL, 'CG-BL-003',
    'PGS.TS. Lê Thị Thu Hà', '0912100003', 'ha.ltt@baclink.org.vn',
    1975, 'FEMALE', 'ASSOCIATE_PROFESSOR', 2019, 'DOCTOR', 2009,
    'Ban Tiêu chuẩn Chất lượng & Năng suất BACLINK',
    'TP. Bắc Ninh, Tỉnh Bắc Ninh',
    'Chuyên gia Trưởng IATF 16949, ISO 9001 & Lean/5S',
    'Quản trị chất lượng không lỗi (Zero-Defect) trong chuỗi cung ứng công nghiệp hỗ trợ',
    ARRAY['IND_AUTO','IND_MECH','IND_PLAS']::text[],
    ARRAY['CN02','CN38']::text[],
    ARRAY['IATF 16949','ISO 9001','Lean/5S','FMEA/SPC']::text[],
    '[{"level":"Tiến sĩ Quản lý Công nghiệp","institution":"Đại học Bách khoa Hà Nội","year":2009}]'::jsonb,
    '[{"position":"Lead Auditor IATF 16949 & ISO 9001","organization":"Mạng lưới Chuyên gia Chất lượng Bắc Ninh","fromYear":2016}]'::jsonb,
    '[{"title":"Mô hình triển khai Lean-Six Sigma tại các doanh nghiệp công nghiệp hỗ trợ Bắc Ninh","journal":"Tạp chí Khoa học & Công nghệ","year":2025}]'::jsonb,
    'Trực tiếp hướng dẫn hơn 40 doanh nghiệp tại Bắc Ninh đạt chứng nhận ISO 9001, IATF 16949 và vượt qua đánh giá nhà cung ứng cấp 1 của tập đoàn FDI.',
    'PGS.TS. Lê Thị Thu Hà cố vấn tái cấu trúc hệ thống quản trị chất lượng, triển khai 5S/Lean và chuẩn bị hồ sơ audit chuỗi cung ứng quốc tế.',
    true, true, NOW(), true,
    'APPROVED', 'PORTAL', 'PUBLIC', true, 24,
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8009-000000000004', NULL, 'CG-BL-004',
    'TS. Phạm Quốc Bảo', '0912100004', 'bao.pq@baclink.org.vn',
    1983, 'MALE', 'NONE', NULL, 'DOCTOR', 2015,
    'Trung tâm Chuyển đổi số Sản xuất Thông minh BACLINK',
    'KCN Hanaka, TP. Từ Sơn, Bắc Ninh',
    'Cố vấn Kiến trúc MES/ERP & AIoT Nhà máy',
    'Kiến trúc thu thập dữ liệu OT/IT thời gian thực và phân tích dự báo bảo trì thiết bị',
    ARRAY['IND_IT','IND_ELEC','IND_LOG']::text[],
    ARRAY['CN05','CN06','CN07','CN09']::text[],
    ARRAY['MES/ERP','OPC-UA','OEE','Truy xuất nguồn gốc']::text[],
    '[{"level":"Tiến sĩ Khoa học Máy tính","institution":"Trường Đại học Công nghệ - ĐHQGHN","year":2015}]'::jsonb,
    '[{"position":"Kiến trúc sư Giải pháp Smart Factory","organization":"Ban Chuyển đổi số BACLINK","fromYear":2021}]'::jsonb,
    '[{"title":"Ứng dụng Edge AI và OPC-UA trong giám sát OEE cho phân xưởng gia công SME","journal":"Tạp chí Công nghệ Thông tin & Truyền thông","year":2025}]'::jsonb,
    'Tư vấn lựa chọn, tích hợp và triển khai hệ thống MES, ERP, WMS và hạ tầng an ninh mạng OT/IT cho nhà máy sản xuất quy mô vừa và nhỏ.',
    'TS. Phạm Quốc Bảo hỗ trợ doanh nghiệp hội viên đánh giá mức độ trưởng thành số và thiết kế lộ trình triển khai MES không gián đoạn sản xuất.',
    true, true, NOW(), true,
    'APPROVED', 'PORTAL', 'PUBLIC', true, 14,
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8009-000000000005', NULL, 'CG-BL-005',
    'TS. Vũ Hải Đăng', '0912100005', 'dang.vh@baclink.org.vn',
    1981, 'MALE', 'NONE', NULL, 'DOCTOR', 2014,
    'Viện Môi trường Công nghiệp & Năng lượng Xanh',
    'KCN Quế Võ I, TX. Quế Võ, Bắc Ninh',
    'Cố vấn Chuyển đổi Xanh, ESG & Kiểm kê Carbon',
    'Tối ưu năng lượng công nghiệp, xử lý nước tuần hoàn và kiểm kê khí nhà kính ISO 14064',
    ARRAY['IND_GREEN','IND_PLAS','IND_MAT']::text[],
    ARRAY['CN22','CN23','CN25','CN39']::text[],
    ARRAY['ESG','ISO 14064','Nước thải tuần hoàn','Tiết kiệm năng lượng']::text[],
    '[{"level":"Tiến sĩ Kỹ thuật Môi trường","institution":"Đại học Bách khoa Hà Nội","year":2014}]'::jsonb,
    '[{"position":"Chuyên gia Kiểm toán Năng lượng & ESG","organization":"Ban Phát triển Bền vững BACLINK","fromYear":2020}]'::jsonb,
    '[{"title":"Giải pháp tuần hoàn nước và giảm phát thải Scope 2 trong các KCN tỉnh Bắc Ninh","journal":"Tạp chí Môi trường Công nghiệp","year":2025}]'::jsonb,
    'Tư vấn lập báo cáo phát triển bền vững ESG, kiểm kê khí nhà kính theo ISO 14064-1 và thiết kế giải pháp tiết kiệm điện – nước cho nhà máy KCN.',
    'TS. Vũ Hải Đăng giúp doanh nghiệp Bắc Ninh đáp ứng các yêu cầu xanh hóa chuỗi cung ứng của tập đoàn FDI và thị trường xuất khẩu EU/Mỹ.',
    true, true, NOW(), true,
    'APPROVED', 'PORTAL', 'PUBLIC', true, 11,
    1, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    expert_code = EXCLUDED.expert_code,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    academic_rank = EXCLUDED.academic_rank,
    degree = EXCLUDED.degree,
    organization_name = EXCLUDED.organization_name,
    organization_address = EXCLUDED.organization_address,
    position_title = EXCLUDED.position_title,
    expertise_sectors = EXCLUDED.expertise_sectors,
    mastered_tech_codes = EXCLUDED.mastered_tech_codes,
    specialized_keywords = EXCLUDED.specialized_keywords,
    training_history_json = EXCLUDED.training_history_json,
    employment_history_json = EXCLUDED.employment_history_json,
    publications_json = EXCLUDED.publications_json,
    consulting_summary = EXCLUDED.consulting_summary,
    public_bio = EXCLUDED.public_bio,
    status = 'APPROVED',
    visibility_status = 'PUBLIC',
    is_accepting_consultation = true,
    updated_at = NOW();

-- Liên kết 5 Cố vấn BACLINK làm Giảng viên cho 6 Khóa học LMS (lms.learning_material_instructors)
INSERT INTO lms.learning_material_instructors (
    id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead, role_description
)
VALUES
(
    'bac10000-0000-4000-8010-000000000001',
    'bac10000-0000-4000-8008-000000000001',
    'bac10000-0000-4000-8009-000000000003',
    'PGS.TS. Lê Thị Thu Hà', 'PGS.TS - Lead Auditor IATF 16949', 'Ban Tiêu chuẩn Chất lượng BACLINK',
    1, true, 'Giảng viên chính chuyên đề Lean/5S'
),
(
    'bac10000-0000-4000-8010-000000000002',
    'bac10000-0000-4000-8008-000000000002',
    'bac10000-0000-4000-8009-000000000003',
    'PGS.TS. Lê Thị Thu Hà', 'PGS.TS - Lead Auditor IATF 16949', 'Ban Tiêu chuẩn Chất lượng BACLINK',
    1, true, 'Giảng viên chính hệ thống IATF 16949 & ISO 9001'
),
(
    'bac10000-0000-4000-8010-000000000003',
    'bac10000-0000-4000-8008-000000000003',
    'bac10000-0000-4000-8009-000000000004',
    'TS. Phạm Quốc Bảo', 'TS - Kiến trúc sư Smart Factory', 'Trung tâm Chuyển đổi số BACLINK',
    1, true, 'Giảng viên chính triển khai MES/ERP'
),
(
    'bac10000-0000-4000-8010-000000000004',
    'bac10000-0000-4000-8008-000000000004',
    'bac10000-0000-4000-8009-000000000005',
    'TS. Vũ Hải Đăng', 'TS - Chuyên gia ESG & ISO 14064', 'Viện Môi trường CN & Năng lượng Xanh',
    1, true, 'Giảng viên chính chuyên đề ESG & Kiểm kê Carbon'
),
(
    'bac10000-0000-4000-8010-000000000005',
    'bac10000-0000-4000-8008-000000000005',
    'bac10000-0000-4000-8009-000000000001',
    'TS. Nguyễn Minh Khôi', 'TS - Chuyên gia Tự động hóa', 'Viện Tự động hóa CN & BACLINK',
    1, true, 'Giảng viên chính tự động hóa SMT & AOI'
),
(
    'bac10000-0000-4000-8010-000000000006',
    'bac10000-0000-4000-8008-000000000006',
    'bac10000-0000-4000-8009-000000000002',
    'ThS. Trần Hoàng Sơn', 'ThS - Cố vấn Chuỗi cung ứng Kỹ thuật', 'Trung tâm Hỗ trợ Cơ khí Chính xác Bắc Ninh',
    1, true, 'Giảng viên chính định giá gia công & audit FDI'
)
ON CONFLICT (material_id, expert_profile_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    title_degree = EXCLUDED.title_degree,
    org_name = EXCLUDED.org_name,
    display_order = EXCLUDED.display_order,
    is_lead = EXCLUDED.is_lead,
    role_description = EXCLUDED.role_description;

-- -----------------------------------------------------------------------------
-- BƯỚC B8: Cập nhật Chính sách Neo Blockchain BACLINK Trust (blockchain.anchor_policies)
-- -----------------------------------------------------------------------------

INSERT INTO blockchain.anchor_policies (
    id, entity_type, display_name, is_enabled, trigger_status, json_fields_expression, batch_size_threshold, batch_timeout_minutes, created_at, updated_at
)
VALUES
    ('c0a80001-0000-4000-8000-000000000004', 'ENTERPRISE_PROFILE', 'Hồ sơ Doanh nghiệp Hội viên BACLINK', true, 'APPROVED', 'TaxCode,CompanyName,LegalRepresentative,EstablishedDate', 10, 5, NOW(), NOW())
ON CONFLICT (entity_type) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    is_enabled = EXCLUDED.is_enabled;

COMMIT;
