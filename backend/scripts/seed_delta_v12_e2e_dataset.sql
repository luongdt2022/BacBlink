-- SQL Seed Script: Dữ liệu kiểm thử E2E & Black-Box Gate 4 cho Delta v11 & Delta v12 (TASK-05)
-- Cung cấp 14 hồ sơ Chuyên gia APPROVED & PUBLIC, phân bổ trên 5 tỉnh thành và 10 ngành active TT17,
-- đầy đủ cả 2 trạng thái sẵn sàng tư vấn (TRUE/FALSE) để unblock các ca kiểm thử:
-- TC-C1-07, TC-C1-08, TC-C3-03, TC-C3-04, TC-C3-05, TC-C4-02, TC-C4-03.
-- Mật khẩu mặc định cho các tài khoản: Password@123

DO $$
DECLARE
    -- Password hash của 'Password@123'
    v_pwd TEXT := '$2a$12$N9Zc46t0B/c4UuY0Qd/14eqrO00k3tqA6k3r4Z8G8r1W8F7G3I3Z7';
    v_now TIMESTAMPTZ := NOW();
    
    -- Danh sách ID định danh cố định
    v_p_admin_hp UUID := 'a0000000-0000-0000-0000-000000000001';
    v_p_admin_hn UUID := 'a0000000-0000-0000-0000-000000000002';
    v_p_buyer    UUID := 'b0000000-0000-0000-0000-000000000001';
BEGIN
    -- 1. TÀI KHOẢN ĐÓNG VAI TEST ACTORS (ENTERPRISE / GOV OFFICER)
    INSERT INTO identity.persons 
    ("Id", "Email", "PasswordHash", "PasswordHashAlgorithm", "FirstName", "LastName", "OrganizationName", "PlatformRole", "ScopeType", "ScopeId", "IsActive", "MatchingAuto", "CreatedAt", "UpdatedAt", "PreferencesUpdatedAt", "Version") 
    VALUES 
    (v_p_admin_hp, 'so.haiphong@local.test', v_pwd, 'bcrypt', 'Hải Phòng', 'Cán bộ Sở', 'Sở KH&CN Hải Phòng', 'PROVINCIAL_ADMIN', 'PROVINCE', 'HP', true, false, v_now, v_now, v_now, 1),
    (v_p_admin_hn, 'so.hanoi@local.test', v_pwd, 'bcrypt', 'Hà Nội', 'Cán bộ Sở', 'Sở KH&CN Hà Nội', 'PROVINCIAL_ADMIN', 'PROVINCE', 'HN', true, false, v_now, v_now, v_now, 1),
    (v_p_buyer, 'buyer-test@local.test', v_pwd, 'bcrypt', 'Minh', 'Trần Doanh Nghiệp', 'Công ty Cổ phần Công nghệ Mẫu', 'BUYER', 'GLOBAL', NULL, true, false, v_now, v_now, v_now, 1)
    ON CONFLICT ("Email") DO UPDATE 
    SET "IsActive" = true, "PlatformRole" = EXCLUDED."PlatformRole", "ScopeType" = EXCLUDED."ScopeType", "ScopeId" = EXCLUDED."ScopeId";

    -- 2. TẠO 14 TÀI KHOẢN IDENTITY CHO 14 CHUYÊN GIA
    INSERT INTO identity.persons 
    ("Id", "Email", "PasswordHash", "PasswordHashAlgorithm", "FirstName", "LastName", "OrganizationName", "PlatformRole", "ScopeType", "ScopeId", "IsActive", "MatchingAuto", "CreatedAt", "UpdatedAt", "PreferencesUpdatedAt", "Version") 
    VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'expert.hn01@local.test', v_pwd, 'bcrypt', 'An', 'Nguyễn Văn', 'Đại học Quốc gia Hà Nội', 'VERIFIED_EXPERT', 'PROVINCE', 'HN', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000002', 'expert.hn02@local.test', v_pwd, 'bcrypt', 'Mai', 'Trần Thị', 'Viện Hàn lâm KH&CN Việt Nam', 'VERIFIED_EXPERT', 'PROVINCE', 'HN', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000003', 'expert.hn03@local.test', v_pwd, 'bcrypt', 'Nam', 'Lê Hoàng', 'Đại học Bách Khoa Hà Nội', 'VERIFIED_EXPERT', 'PROVINCE', 'HN', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000004', 'expert.hn04@local.test', v_pwd, 'bcrypt', 'Tuấn', 'Phạm Quốc', 'Viện Ứng Dụng Công Nghệ NacenTech', 'VERIFIED_EXPERT', 'PROVINCE', 'HN', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000005', 'expert.hcm01@local.test', v_pwd, 'bcrypt', 'Trọng', 'Vũ Đình', 'Đại học Bách Khoa TP.HCM', 'VERIFIED_EXPERT', 'PROVINCE', 'HCM', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000006', 'expert.hcm02@local.test', v_pwd, 'bcrypt', 'Tuấn', 'Đặng Minh', 'Đại học Khoa học Tự nhiên TP.HCM', 'VERIFIED_EXPERT', 'PROVINCE', 'HCM', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000007', 'expert.hcm03@local.test', v_pwd, 'bcrypt', 'Loan', 'Hoàng Kim', 'Khu Công nghệ cao TP.HCM (SHTP)', 'VERIFIED_EXPERT', 'PROVINCE', 'HCM', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000008', 'expert.hcm04@local.test', v_pwd, 'bcrypt', 'Hưng', 'Bùi Văn', 'Viện Công nghệ Sinh học Nhiệt đới', 'VERIFIED_EXPERT', 'PROVINCE', 'HCM', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000009', 'expert.hp01@local.test', v_pwd, 'bcrypt', 'Đăng', 'Đỗ Hải', 'Đại học Hàng hải Việt Nam', 'VERIFIED_EXPERT', 'PROVINCE', 'HP', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000010', 'expert.hp02@local.test', v_pwd, 'bcrypt', 'Hải', 'Ngô Quang', 'Viện Tài nguyên Môi trường Biển Hải Phòng', 'VERIFIED_EXPERT', 'PROVINCE', 'HP', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000011', 'expert.dn01@local.test', v_pwd, 'bcrypt', 'Trí', 'Dương Minh', 'Đại học Bách Khoa Đà Nẵng', 'VERIFIED_EXPERT', 'PROVINCE', 'DN', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000012', 'expert.dn02@local.test', v_pwd, 'bcrypt', 'Long', 'Phan Bảo', 'Khu Công nghệ cao Đà Nẵng', 'VERIFIED_EXPERT', 'PROVINCE', 'DN', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000013', 'expert.ct01@local.test', v_pwd, 'bcrypt', 'Huy', 'Lý Gia', 'Đại học Cần Thơ', 'VERIFIED_EXPERT', 'PROVINCE', 'CT', true, false, v_now, v_now, v_now, 1),
    ('e0000000-0000-0000-0000-000000000014', 'expert.ct02@local.test', v_pwd, 'bcrypt', 'Ngọc', 'Nguyễn Bảo', 'Viện Lúa Đồng bằng sông Cửu Long', 'VERIFIED_EXPERT', 'PROVINCE', 'CT', true, false, v_now, v_now, v_now, 1)
    ON CONFLICT ("Email") DO UPDATE 
    SET "IsActive" = true, "PlatformRole" = 'VERIFIED_EXPERT', "ScopeType" = 'PROVINCE', "ScopeId" = EXCLUDED."ScopeId";

    -- 3. TẠO 14 HỒ SƠ CHUYÊN GIA TƯƠNG ỨNG TRONG BROKERAGE.EXPERT_PROFILES
    INSERT INTO brokerage.expert_profiles 
    (id, person_id, expert_code, full_name, email, phone, birth_year, gender, academic_rank, degree, degree_year, organization_name, position_title, expertise_sectors, specialized_keywords, mastered_tech_codes, status, visibility_status, is_accepting_consultation, public_bio, is_project_leader, is_main_contributor, pdpd_consent_at_utc, legal_oath, version, created_at, updated_at)
    VALUES 
    -- 1. HN - LV05 (CNTT) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'CG-NACEN-HN000001', 'GS.TS. Nguyễn Văn An', 'expert.hn01@local.test', '0912000001', 1975, 'male', 'GS', 'DOCTOR', 2005, 'Đại học Quốc gia Hà Nội', 'Trưởng Khoa CNTT', ARRAY['LV05'], ARRAY['Trí tuệ nhân tạo', 'Machine Learning', 'Big Data'], ARRAY['CN01', 'CN02'], 'APPROVED', 'PUBLIC', true, 'Chuyên gia đầu ngành về Trí tuệ nhân tạo và xử lý ngôn ngữ tự nhiên.', true, true, v_now, true, 1, v_now, v_now),
    
    -- 2. HN - LV01 (Nông nghiệp) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'CG-NACEN-HN000002', 'PGS.TS. Trần Thị Mai', 'expert.hn02@local.test', '0912000002', 1980, 'female', 'PGS', 'DOCTOR', 2010, 'Viện Hàn lâm KH&CN Việt Nam', 'Nghiên cứu viên cao cấp', ARRAY['LV01'], ARRAY['Nông nghiệp thông minh', 'Công nghệ sinh học'], ARRAY['CN03'], 'APPROVED', 'PUBLIC', true, 'Nghiên cứu giống cây trồng chịu hạn và nông nghiệp chính xác.', true, true, v_now, true, 1, v_now, v_now),

    -- 3. HN - LV11 (Cơ khí & Tự động hóa) - Accepting: FALSE (Để test lọc tư vấn exclusion)
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'CG-NACEN-HN000003', 'TS. Lê Hoàng Nam', 'expert.hn03@local.test', '0912000003', 1985, 'male', 'NONE', 'DOCTOR', 2016, 'Đại học Bách Khoa Hà Nội', 'Giảng viên', ARRAY['LV11'], ARRAY['Robot công nghiệp', 'Điều khiển tự động'], ARRAY['CN04'], 'APPROVED', 'PUBLIC', false, 'Tập trung nghiên cứu học thuật, tạm thời ngừng tiếp nhận tư vấn bên ngoài.', true, false, v_now, true, 1, v_now, v_now),

    -- 4. HN - LV08 (Năng lượng) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'CG-NACEN-HN000004', 'TS. Phạm Quốc Tuấn', 'expert.hn04@local.test', '0912000004', 1982, 'male', 'NONE', 'DOCTOR', 2014, 'Viện Ứng Dụng Công Nghệ NacenTech', 'Trưởng phòng Năng lượng tái tạo', ARRAY['LV08'], ARRAY['Điện mặt trời', 'Lưu trữ năng lượng', 'Pin Lithium'], ARRAY['CN05'], 'APPROVED', 'PUBLIC', true, 'Tư vấn giải pháp tiết kiệm năng lượng và tích hợp lưới điện thông minh.', true, true, v_now, true, 1, v_now, v_now),

    -- 5. HCM - LV05 (CNTT) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'CG-NACEN-HCM00005', 'PGS.TS. Vũ Đình Trọng', 'expert.hcm01@local.test', '0912000005', 1978, 'male', 'PGS', 'DOCTOR', 2008, 'Đại học Bách Khoa TP.HCM', 'Phó Viện trưởng Viện CNTT', ARRAY['LV05'], ARRAY['An toàn thông tin', 'Cloud Computing', 'DevSecOps'], ARRAY['CN01', 'CN06'], 'APPROVED', 'PUBLIC', true, 'Chuyên gia an ninh mạng, kiểm toán hệ thống thông tin doanh nghiệp.', true, true, v_now, true, 1, v_now, v_now),

    -- 6. HCM - LV07 (Y tế/Dược) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'CG-NACEN-HCM00006', 'TS. Đặng Minh Tuấn', 'expert.hcm02@local.test', '0912000006', 1983, 'male', 'NONE', 'DOCTOR', 2015, 'Đại học Khoa học Tự nhiên TP.HCM', 'Trưởng PTN Sinh hóa', ARRAY['LV07'], ARRAY['Hóa dược', 'Thiết bị y tế', 'Nano sinh học'], ARRAY['CN07'], 'APPROVED', 'PUBLIC', true, 'Phát triển thuốc mới và kiểm chuẩn thiết bị chẩn đoán y tế.', true, false, v_now, true, 1, v_now, v_now),

    -- 7. HCM - LV12 (Vật liệu mới) - Accepting: FALSE
    ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007', 'CG-NACEN-HCM00007', 'GS.TS. Hoàng Kim Loan', 'expert.hcm03@local.test', '0912000007', 1972, 'female', 'GS', 'DOCTOR', 2002, 'Khu Công nghệ cao TP.HCM (SHTP)', 'Chuyên gia tư vấn cấp cao', ARRAY['LV12'], ARRAY['Vật liệu composite', 'Graphene'], ARRAY['CN08'], 'APPROVED', 'PUBLIC', false, 'Chuyên gia nghiên cứu vật liệu tiên tiến cho vi điện tử.', true, true, v_now, true, 1, v_now, v_now),

    -- 8. HCM - LV01 (Nông nghiệp) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000008', 'CG-NACEN-HCM00008', 'TS. Bùi Văn Hưng', 'expert.hcm04@local.test', '0912000008', 1986, 'male', 'NONE', 'DOCTOR', 2018, 'Viện Công nghệ Sinh học Nhiệt đới', 'Nghiên cứu viên', ARRAY['LV01'], ARRAY['Nuôi cấy mô', 'Vi sinh nông nghiệp'], ARRAY['CN03'], 'APPROVED', 'PUBLIC', true, 'Chuyển giao quy trình nhân giống sạch bệnh cho các nông trường.', false, true, v_now, true, 1, v_now, v_now),

    -- 9. HP - LV11 (Cơ khí & Tàu thủy) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000009', 'CG-NACEN-HP000009', 'TS. Đỗ Hải Đăng', 'expert.hp01@local.test', '0912000009', 1981, 'male', 'NONE', 'DOCTOR', 2013, 'Đại học Hàng hải Việt Nam', 'Trưởng khoa Đóng tàu', ARRAY['LV11'], ARRAY['Thiết kế thân vỏ tàu', 'Tự động hóa cảng biển'], ARRAY['CN04'], 'APPROVED', 'PUBLIC', true, 'Tư vấn kỹ thuật kiểm định an toàn phương tiện thủy nội địa và hàng hải.', true, true, v_now, true, 1, v_now, v_now),

    -- 10. HP - LV14 (Môi trường & Biển) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 'CG-NACEN-HP000010', 'ThS. Ngô Quang Hải', 'expert.hp02@local.test', '0912000010', 1988, 'male', 'NONE', 'MASTER', 2017, 'Viện Tài nguyên Môi trường Biển Hải Phòng', 'Chuyên viên nghiên cứu', ARRAY['LV14'], ARRAY['Quan trắc môi trường biển', 'Xử lý nước thải'], ARRAY['CN09'], 'APPROVED', 'PUBLIC', true, 'Khảo sát và đánh giá tác động môi trường các dự án ven biển.', false, true, v_now, true, 1, v_now, v_now),

    -- 11. DN - LV05 (CNTT) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000011', 'CG-NACEN-DN000011', 'TS. Dương Minh Trí', 'expert.dn01@local.test', '0912000011', 1984, 'male', 'NONE', 'DOCTOR', 2015, 'Đại học Bách Khoa Đà Nẵng', 'Trưởng phòng R&D', ARRAY['LV05'], ARRAY['IoT', 'Smart City', 'Nhúng & Vi mạch'], ARRAY['CN01', 'CN10'], 'APPROVED', 'PUBLIC', true, 'Xây dựng giải pháp thành phố thông minh và chiếu sáng công cộng.', true, true, v_now, true, 1, v_now, v_now),

    -- 12. DN - LV08 (Năng lượng) - Accepting: FALSE
    ('f0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000012', 'CG-NACEN-DN000012', 'PGS.TS. Phan Bảo Long', 'expert.dn02@local.test', '0912000012', 1979, 'male', 'PGS', 'DOCTOR', 2009, 'Khu Công nghệ cao Đà Nẵng', 'Cố vấn công nghệ', ARRAY['LV08'], ARRAY['Điện gió', 'Hiệu quả năng lượng'], ARRAY['CN05'], 'APPROVED', 'PUBLIC', false, 'Nghiên cứu mô hình khí động học cánh quạt gió ven biển miền Trung.', true, true, v_now, true, 1, v_now, v_now),

    -- 13. CT - LV01 (Nông nghiệp) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000013', 'CG-NACEN-CT000013', 'TS. Lý Gia Huy', 'expert.ct01@local.test', '0912000013', 1987, 'male', 'NONE', 'DOCTOR', 2018, 'Đại học Cần Thơ', 'Giảng viên chính', ARRAY['LV01'], ARRAY['Thủy sản tuần hoàn', 'Xử lý nước ao nuôi'], ARRAY['CN03'], 'APPROVED', 'PUBLIC', true, 'Tư vấn mô hình nuôi tôm công nghệ cao tuần hoàn RAS tại ĐBSCL.', true, true, v_now, true, 1, v_now, v_now),

    -- 14. CT - LV15 (Chế biến thực phẩm) - Accepting: TRUE
    ('f0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000014', 'CG-NACEN-CT000014', 'TS. Nguyễn Bảo Ngọc', 'expert.ct02@local.test', '0912000014', 1986, 'female', 'NONE', 'DOCTOR', 2017, 'Viện Lúa Đồng bằng sông Cửu Long', 'Trưởng bộ môn Chế biến', ARRAY['LV15'], ARRAY['Sấy thăng hoa', 'Bảo quản nông sản sau thu hoạch'], ARRAY['CN11'], 'APPROVED', 'PUBLIC', true, 'Chuyển giao công nghệ chế biến sâu trái cây xuất khẩu.', true, true, v_now, true, 1, v_now, v_now)
    ON CONFLICT (expert_code) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        organization_name = EXCLUDED.organization_name,
        expertise_sectors = EXCLUDED.expertise_sectors,
        is_accepting_consultation = EXCLUDED.is_accepting_consultation,
        visibility_status = 'PUBLIC',
        status = 'APPROVED';

    RAISE NOTICE 'Đã nạp thành công 14 hồ sơ Chuyên gia E2E và 3 tài khoản tác nhân kiểm thử!';
END $$;
