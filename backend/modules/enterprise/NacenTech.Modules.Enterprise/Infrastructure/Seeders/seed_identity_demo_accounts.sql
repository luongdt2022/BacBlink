-- Delta CR-2026-015: Seed SSOT mapping cho Buyer và Seller demo accounts
-- Mật khẩu chuẩn của hệ thống: Password@123 (giữ nguyên không đổi)

-- 1. CÔNG TY TNHH TRƯỜNG HOAN (Gắn với buyer.user@demo.nacentech.vn)
UPDATE enterprise.enterprises
SET 
    owner_person_id = 'fbc7b482-4cdd-4f5e-80dc-5fdc5944cc76',
    capability_tier = 'BUYER',
    is_buyer = true,
    is_seller = false,
    active_role = 'BUYER',
    contact_person = 'Nguyễn Văn Hoan',
    contact_email = 'buyer.user@demo.nacentech.vn',
    contact_phone = '0912 345 678',
    province_city = 'Hà Nội',
    address_detail = 'Số 15, Phố Định Công, Phường Định Công, Quận Hoàng Mai, Hà Nội',
    main_sector_name = 'Khác',
    workforce_scale = 'Dưới 10 người',
    revenue_range = 'Từ 10 đến dưới 50 tỷ đồng',
    updated_at = NOW()
WHERE id = '1a6d4b00-770b-4ece-8e47-9821caeff592';

DELETE FROM enterprise.enterprise_identifiers 
WHERE enterprise_id = '1a6d4b00-770b-4ece-8e47-9821caeff592' AND type = 'USER_ID';

INSERT INTO enterprise.enterprise_identifiers (id, enterprise_id, type, value)
VALUES (
    gen_random_uuid(),
    '1a6d4b00-770b-4ece-8e47-9821caeff592',
    'USER_ID',
    'fbc7b482-4cdd-4f5e-80dc-5fdc5944cc76'
);

-- 2. CÔNG TY CP CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN (Gắn với seller.user@demo.nacentech.vn)
INSERT INTO enterprise.enterprises (
    id, subject_type, legal_name, name, tax_code, province_city, address_detail,
    contact_person, contact_email, contact_phone, is_contact_public,
    status, is_verified, verification_status,
    main_sector_name, sector_code, ownership_type, workforce_scale, revenue_range,
    capability_tier, is_buyer, is_seller, active_role, owner_person_id,
    created_at, updated_at
)
VALUES (
    '2b7e5c11-881c-4fdf-9f58-0932dbfaa603',
    'ENTERPRISE',
    'CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN',
    'CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN',
    '0108992134',
    'Hà Nội',
    'Cụm CN vừa và nhỏ Từ Liêm, Minh Khai, Bắc Từ Liêm, Hà Nội',
    'Trần Tiến Dũng',
    'seller.user@demo.nacentech.vn',
    '0988 765 432',
    true,
    'ACTIVE',
    true,
    'VERIFIED',
    'Cơ khí chế tạo, tự động hóa',
    'LV01',
    'Tư nhân',
    '50-dưới 100 người',
    'Từ 50 đến dưới 100 tỷ đồng',
    'SELLER',
    false,
    true,
    'SELLER',
    '208039ea-cb0b-4b9b-b115-73a1f629e521',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    tax_code = '0108992134',
    name = EXCLUDED.name,
    legal_name = EXCLUDED.legal_name,
    owner_person_id = '208039ea-cb0b-4b9b-b115-73a1f629e521',
    capability_tier = 'SELLER',
    is_buyer = false,
    is_seller = true,
    active_role = 'SELLER',
    contact_person = EXCLUDED.contact_person,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    updated_at = NOW();

DELETE FROM enterprise.enterprise_identifiers 
WHERE enterprise_id = '2b7e5c11-881c-4fdf-9f58-0932dbfaa603' AND type = 'USER_ID';

INSERT INTO enterprise.enterprise_identifiers (id, enterprise_id, type, value)
VALUES (
    gen_random_uuid(),
    '2b7e5c11-881c-4fdf-9f58-0932dbfaa603',
    'USER_ID',
    '208039ea-cb0b-4b9b-b115-73a1f629e521'
);
