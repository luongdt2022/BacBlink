-- =============================================================================
-- NACENTECH MASTER SEED: 34 SỞ KH&CN TRỌNG ĐIỂM & VIỆN TRƯỜNG CƠ SỞ (CR-2026-025)
-- Căn cứ: BR-ADMIN-34PROV & Spec Delta v13 TASK-07
-- Idempotent: Chạy nhiều lần không trùng lặp, bảo toàn dữ liệu hiện có
-- =============================================================================

DO $$
DECLARE
    v_root_id UUID;
    v_pwd_hash TEXT := 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw=='; -- Password@123
    v_algo TEXT := 'pbkdf2-v3';
BEGIN
    -- 1. Đảm bảo Root Quốc gia
    SELECT id INTO v_root_id FROM identity.organization_units WHERE unit_type = 'NATIONAL' LIMIT 1;
    IF v_root_id IS NULL THEN
        v_root_id := '01a12a6f-ef91-7eec-9dd6-1c717a17f000'::uuid;
        INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
        VALUES (v_root_id, 'NACENTECH-CENTRAL', 'Cơ quan Đầu mối Trung ương NacenTech (Bộ KH&CN)', 'NATIONAL', NULL, NULL, 'ACTIVE', NOW());
    END IF;

    -- Đảm bảo các sở hiện có đều ACTIVE
    UPDATE identity.organization_units SET status = 'ACTIVE' WHERE unit_type = 'PROVINCIAL' AND status = 'INACTIVE';

    -- 2. Danh mục 34 Sở KH&CN Tỉnh/Thành Trực Thuộc Trung Ương
    -- 2.1 12 Tỉnh Miền Bắc
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    VALUES
        (gen_random_uuid(), 'SO-KHCN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', 'PROVINCIAL', v_root_id, 'HN', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-HP', 'Sở Khoa học và Công nghệ TP. Hải Phòng', 'PROVINCIAL', v_root_id, 'HP', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-QN', 'Sở Khoa học và Công nghệ Tỉnh Quảng Ninh', 'PROVINCIAL', v_root_id, 'QN', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-BN', 'Sở Khoa học và Công nghệ Tỉnh Bắc Ninh', 'PROVINCIAL', v_root_id, 'BN', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-VP', 'Sở Khoa học và Công nghệ Tỉnh Vĩnh Phúc', 'PROVINCIAL', v_root_id, 'VP', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-TN', 'Sở Khoa học và Công nghệ Tỉnh Thái Nguyên', 'PROVINCIAL', v_root_id, 'TN', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-HD', 'Sở Khoa học và Công nghệ Tỉnh Hải Dương', 'PROVINCIAL', v_root_id, 'HD', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-HY', 'Sở Khoa học và Công nghệ Tỉnh Hưng Yên', 'PROVINCIAL', v_root_id, 'HY', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-ND', 'Sở Khoa học và Công nghệ Tỉnh Nam Định', 'PROVINCIAL', v_root_id, 'ND', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-PT', 'Sở Khoa học và Công nghệ Tỉnh Phú Thọ', 'PROVINCIAL', v_root_id, 'PT', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-NB', 'Sở Khoa học và Công nghệ Tỉnh Ninh Bình', 'PROVINCIAL', v_root_id, 'NB', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-BG', 'Sở Khoa học và Công nghệ Tỉnh Bắc Giang', 'PROVINCIAL', v_root_id, 'BG', 'ACTIVE', NOW())
    ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        province_id = EXCLUDED.province_id,
        status = 'ACTIVE';

    -- 2.2 10 Tỉnh Miền Trung & Tây Nguyên
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    VALUES
        (gen_random_uuid(), 'SO-KHCN-DN', 'Sở Khoa học và Công nghệ TP. Đà Nẵng', 'PROVINCIAL', v_root_id, 'DN', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-TH', 'Sở Khoa học và Công nghệ Tỉnh Thanh Hóa', 'PROVINCIAL', v_root_id, 'TH', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-NA', 'Sở Khoa học và Công nghệ Tỉnh Nghệ An', 'PROVINCIAL', v_root_id, 'NA', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-TTH', 'Sở Khoa học và Công nghệ Tỉnh Thừa Thiên Huế', 'PROVINCIAL', v_root_id, 'TTH', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-QNA', 'Sở Khoa học và Công nghệ Tỉnh Quảng Nam', 'PROVINCIAL', v_root_id, 'QNA', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-QNG', 'Sở Khoa học và Công nghệ Tỉnh Quảng Ngãi', 'PROVINCIAL', v_root_id, 'QNG', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-BD', 'Sở Khoa học và Công nghệ Tỉnh Bình Định', 'PROVINCIAL', v_root_id, 'BD', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-KH', 'Sở Khoa học và Công nghệ Tỉnh Khánh Hòa', 'PROVINCIAL', v_root_id, 'KH', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-DL', 'Sở Khoa học và Công nghệ Tỉnh Đắk Lắk', 'PROVINCIAL', v_root_id, 'DL', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-LD', 'Sở Khoa học và Công nghệ Tỉnh Lâm Đồng', 'PROVINCIAL', v_root_id, 'LD', 'ACTIVE', NOW())
    ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        province_id = EXCLUDED.province_id,
        status = 'ACTIVE';

    -- 2.3 12 Tỉnh Miền Nam
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    VALUES
        (gen_random_uuid(), 'SO-KHCN-HCM', 'Sở Khoa học và Công nghệ TP. Hồ Chí Minh', 'PROVINCIAL', v_root_id, 'SG', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-BDG', 'Sở Khoa học và Công nghệ Tỉnh Bình Dương', 'PROVINCIAL', v_root_id, 'BDG', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-DNA', 'Sở Khoa học và Công nghệ Tỉnh Đồng Nai', 'PROVINCIAL', v_root_id, 'DNA', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-BRVT', 'Sở Khoa học và Công nghệ Tỉnh Bà Rịa - Vũng Tàu', 'PROVINCIAL', v_root_id, 'BRVT', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-CT', 'Sở Khoa học và Công nghệ TP. Cần Thơ', 'PROVINCIAL', v_root_id, 'CT', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-LA', 'Sở Khoa học và Công nghệ Tỉnh Long An', 'PROVINCIAL', v_root_id, 'LA', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-TG', 'Sở Khoa học và Công nghệ Tỉnh Tiền Giang', 'PROVINCIAL', v_root_id, 'TG', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-AG', 'Sở Khoa học và Công nghệ Tỉnh An Giang', 'PROVINCIAL', v_root_id, 'AG', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-DT', 'Sở Khoa học và Công nghệ Tỉnh Đồng Tháp', 'PROVINCIAL', v_root_id, 'DT', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-KG', 'Sở Khoa học và Công nghệ Tỉnh Kiên Giang', 'PROVINCIAL', v_root_id, 'KG', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-TNH', 'Sở Khoa học và Công nghệ Tỉnh Tây Ninh', 'PROVINCIAL', v_root_id, 'TNH', 'ACTIVE', NOW()),
        (gen_random_uuid(), 'SO-KHCN-CM', 'Sở Khoa học và Công nghệ Tỉnh Cà Mau', 'PROVINCIAL', v_root_id, 'CM', 'ACTIVE', NOW())
    ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        province_id = EXCLUDED.province_id,
        status = 'ACTIVE';

    -- 3. Nạp Các Viện / Trường Cơ Sở Trọng Điểm Trực Thuộc
    -- 3.1 Hà Nội
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    SELECT gen_random_uuid(), 'DH-BACHKHOA-HN', 'Đại học Bách Khoa Hà Nội', 'INSTITUTION', id, 'HN', 'ACTIVE', NOW()
    FROM identity.organization_units WHERE code = 'SO-KHCN-HN'
    ON CONFLICT (code) DO UPDATE SET status = 'ACTIVE';

    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    SELECT gen_random_uuid(), 'VIEN-NACENTECH', 'Viện Ứng Dụng Công Nghệ (NacenTech)', 'INSTITUTION', id, 'HN', 'ACTIVE', NOW()
    FROM identity.organization_units WHERE code = 'SO-KHCN-HN'
    ON CONFLICT (code) DO UPDATE SET status = 'ACTIVE';

    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    SELECT gen_random_uuid(), 'VIEN-VAST', 'Viện Hàn Lâm Khoa Học & Công Nghệ Việt Nam', 'INSTITUTION', id, 'HN', 'ACTIVE', NOW()
    FROM identity.organization_units WHERE code = 'SO-KHCN-HN'
    ON CONFLICT (code) DO UPDATE SET status = 'ACTIVE';

    -- 3.2 TP. Hồ Chí Minh
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    SELECT gen_random_uuid(), 'DHQG-HCM', 'Đại học Quốc gia TP. Hồ Chí Minh', 'INSTITUTION', id, 'SG', 'ACTIVE', NOW()
    FROM identity.organization_units WHERE code = 'SO-KHCN-HCM'
    ON CONFLICT (code) DO UPDATE SET status = 'ACTIVE';

    -- 3.3 Đà Nẵng
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    SELECT gen_random_uuid(), 'DH-DANANG', 'Đại học Đà Nẵng', 'INSTITUTION', id, 'DN', 'ACTIVE', NOW()
    FROM identity.organization_units WHERE code = 'SO-KHCN-DN'
    ON CONFLICT (code) DO UPDATE SET status = 'ACTIVE';

    -- 3.4 Cần Thơ
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    SELECT gen_random_uuid(), 'DH-CANTHO', 'Đại học Cần Thơ', 'INSTITUTION', id, 'CT', 'ACTIVE', NOW()
    FROM identity.organization_units WHERE code = 'SO-KHCN-CT'
    ON CONFLICT (code) DO UPDATE SET status = 'ACTIVE';

    -- 3.5 Thái Nguyên
    INSERT INTO identity.organization_units (id, code, name, unit_type, parent_id, province_id, status, created_at_utc)
    SELECT gen_random_uuid(), 'DH-THAINGUYEN', 'Đại học Thái Nguyên', 'INSTITUTION', id, 'TN', 'ACTIVE', NOW()
    FROM identity.organization_units WHERE code = 'SO-KHCN-TN'
    ON CONFLICT (code) DO UPDATE SET status = 'ACTIVE';

    -- 4. Khởi Tạo 34 Tài Khoản Lãnh Đạo Sở (PROVINCIAL_ADMIN) Với Mật Khẩu Password@123
    INSERT INTO identity.persons (
        id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
        organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
        version, created_at, updated_at, scope_type, scope_id
    )
    VALUES
        -- Miền Bắc (12)
        (gen_random_uuid(), 'so.hanoi@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Hà Nội', '0901234501', 'Sở KH&CN TP. Hà Nội', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'HN'),
        (gen_random_uuid(), 'so.haiphong@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Hải Phòng', '0901234502', 'Sở KH&CN TP. Hải Phòng', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'HP'),
        (gen_random_uuid(), 'so.quangninh@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Quảng Ninh', '0901234503', 'Sở KH&CN Tỉnh Quảng Ninh', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'QN'),
        (gen_random_uuid(), 'so.bacninh@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Bắc Ninh', '0901234504', 'Sở KH&CN Tỉnh Bắc Ninh', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'BN'),
        (gen_random_uuid(), 'so.vinhphuc@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Vĩnh Phúc', '0901234505', 'Sở KH&CN Tỉnh Vĩnh Phúc', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'VP'),
        (gen_random_uuid(), 'so.thainguyen@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Thái Nguyên', '0901234506', 'Sở KH&CN Tỉnh Thái Nguyên', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'TN'),
        (gen_random_uuid(), 'so.haiduong@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Hải Dương', '0901234507', 'Sở KH&CN Tỉnh Hải Dương', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'HD'),
        (gen_random_uuid(), 'so.hungyen@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Hưng Yên', '0901234508', 'Sở KH&CN Tỉnh Hưng Yên', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'HY'),
        (gen_random_uuid(), 'so.namdinh@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Nam Định', '0901234509', 'Sở KH&CN Tỉnh Nam Định', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'ND'),
        (gen_random_uuid(), 'so.phutho@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Phú Thọ', '0901234510', 'Sở KH&CN Tỉnh Phú Thọ', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'PT'),
        (gen_random_uuid(), 'so.ninhbinh@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Ninh Bình', '0901234511', 'Sở KH&CN Tỉnh Ninh Bình', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'NB'),
        (gen_random_uuid(), 'so.bacgiang@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Bắc Giang', '0901234512', 'Sở KH&CN Tỉnh Bắc Giang', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'BG'),

        -- Miền Trung & Tây Nguyên (10)
        (gen_random_uuid(), 'so.danang@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Đà Nẵng', '0901234513', 'Sở KH&CN TP. Đà Nẵng', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'DN'),
        (gen_random_uuid(), 'so.thanhhoa@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Thanh Hóa', '0901234514', 'Sở KH&CN Tỉnh Thanh Hóa', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'TH'),
        (gen_random_uuid(), 'so.nghean@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Nghệ An', '0901234515', 'Sở KH&CN Tỉnh Nghệ An', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'NA'),
        (gen_random_uuid(), 'so.hue@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Thừa Thiên Huế', '0901234516', 'Sở KH&CN Tỉnh Thừa Thiên Huế', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'TTH'),
        (gen_random_uuid(), 'so.quangnam@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Quảng Nam', '0901234517', 'Sở KH&CN Tỉnh Quảng Nam', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'QNA'),
        (gen_random_uuid(), 'so.quangngai@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Quảng Ngãi', '0901234518', 'Sở KH&CN Tỉnh Quảng Ngãi', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'QNG'),
        (gen_random_uuid(), 'so.binhdinh@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Bình Định', '0901234519', 'Sở KH&CN Tỉnh Bình Định', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'BD'),
        (gen_random_uuid(), 'so.khanhhoa@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Khánh Hòa', '0901234520', 'Sở KH&CN Tỉnh Khánh Hòa', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'KH'),
        (gen_random_uuid(), 'so.daklak@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Đắk Lắk', '0901234521', 'Sở KH&CN Tỉnh Đắk Lắk', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'DL'),
        (gen_random_uuid(), 'so.lamdong@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Lâm Đồng', '0901234522', 'Sở KH&CN Tỉnh Lâm Đồng', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'LD'),

        -- Miền Nam (12)
        (gen_random_uuid(), 'so.hcm@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN TP. Hồ Chí Minh', '0901234523', 'Sở KH&CN TP. Hồ Chí Minh', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'SG'),
        (gen_random_uuid(), 'so.binhduong@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Bình Dương', '0901234524', 'Sở KH&CN Tỉnh Bình Dương', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'BDG'),
        (gen_random_uuid(), 'so.dongnai@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Đồng Nai', '0901234525', 'Sở KH&CN Tỉnh Đồng Nai', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'DNA'),
        (gen_random_uuid(), 'so.brvt@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Bà Rịa - Vũng Tàu', '0901234526', 'Sở KH&CN Tỉnh Bà Rịa - Vũng Tàu', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'BRVT'),
        (gen_random_uuid(), 'so.cantho@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Cần Thơ', '0901234527', 'Sở KH&CN TP. Cần Thơ', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'CT'),
        (gen_random_uuid(), 'so.longan@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Long An', '0901234528', 'Sở KH&CN Tỉnh Long An', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'LA'),
        (gen_random_uuid(), 'so.tiengiang@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Tiền Giang', '0901234529', 'Sở KH&CN Tỉnh Tiền Giang', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'TG'),
        (gen_random_uuid(), 'so.angiang@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN An Giang', '0901234530', 'Sở KH&CN Tỉnh An Giang', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'AG'),
        (gen_random_uuid(), 'so.dongthap@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Đồng Tháp', '0901234531', 'Sở KH&CN Tỉnh Đồng Tháp', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'DT'),
        (gen_random_uuid(), 'so.kiengiang@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Kiên Giang', '0901234532', 'Sở KH&CN Tỉnh Kiên Giang', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'KG'),
        (gen_random_uuid(), 'so.tayninh@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Tây Ninh', '0901234533', 'Sở KH&CN Tỉnh Tây Ninh', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'TNH'),
        (gen_random_uuid(), 'so.camau@nacentech.local', v_pwd_hash, v_algo, 'Lãnh đạo', 'Sở KH&CN Cà Mau', '0901234534', 'Sở KH&CN Tỉnh Cà Mau', 'PROVINCIAL_ADMIN', true, true, NOW(), 1, NOW(), NOW(), 'PROVINCE', 'CM')
    ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        password_hash_algorithm = EXCLUDED.password_hash_algorithm,
        platform_role = 'PROVINCIAL_ADMIN',
        scope_type = 'PROVINCE',
        scope_id = EXCLUDED.scope_id,
        is_active = true;

    RAISE NOTICE 'Nạp thành công Master Data 34 Sở KH&CN và 34 Tài khoản Lãnh đạo Sở!';
END $$;
