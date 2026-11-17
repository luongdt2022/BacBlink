-- Migration: BaclinkTaxonomySectorsAndLocations
-- Date: 2026-11-17
-- Epic: TASK-06 (T-06.BL.01 / CR-BACLINK-003)
-- Description:
--   1. Deactivate phi pha huy 10 nganh cu LV* (is_active = false, tuyet doi KHONG DELETE).
--   2. Upsert 8 nganh cong nghiep chuan BACLINK (IND_ELEC..IND_LOG, kind = 'SECTOR').
--   3. Upsert 8+1 Dia ban Bac Ninh (AREA) & 13 KCN trong diem Bac Ninh (KCN) voi kind = 'LOCATION'.
-- Idempotent: Co the chay nhieu lan ma khong gay loi trung lap hoac sai lech trang thai.

BEGIN;

-- 1. Deactivate phi pha huy cac nganh cu LV* (REQ-BACLINK-TAX-001, BR-BACLINK-TAX-001)
UPDATE policy.taxonomy_terms
SET
    is_active = false,
    updated_at = NOW()
WHERE kind = 'SECTOR'
  AND code LIKE 'LV%'
  AND is_active IS DISTINCT FROM false;

-- 2. Upsert 8 nganh cong nghiep chuan BACLINK (IND_*)
INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
VALUES
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_ELEC',
        'Điện tử, Bán dẫn & Thiết bị điện',
        true,
        '{"tt17Code":"C.26, C.27","description":"Sản xuất linh kiện điện tử, bán dẫn, thiết bị điện công nghiệp & dân dụng","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_MECH',
        'Cơ khí chính xác, Khuôn mẫu & Chế tạo máy',
        true,
        '{"tt17Code":"C.25, C.28","description":"Gia công cơ khí chính xác CNC, chế tạo khuôn mẫu, máy móc thiết bị công nghiệp","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_AUTO',
        'Tự động hóa, Robot & Smart Factory',
        true,
        '{"tt17Code":"C.28, C.29","description":"Hệ thống tự động hóa dây chuyền, robot công nghiệp, SCADA/PLC & nhà máy thông minh","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_PLAS',
        'Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp',
        true,
        '{"tt17Code":"C.20, C.22","description":"Nhựa kỹ thuật chính xác, ép phun công nghiệp, bao bì & hóa chất hỗ trợ sản xuất","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_MAT',
        'Vật liệu mới & Công nghiệp hỗ trợ',
        true,
        '{"tt17Code":"C.23, C.24, C.32","description":"Vật liệu mới, hợp kim, composite & linh phụ kiện công nghiệp hỗ trợ","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_IT',
        'Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP',
        true,
        '{"tt17Code":"J.62","description":"Phần mềm quản trị sản xuất MES/ERP, IoT công nghiệp, AI/Big Data & an ninh mạng","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_GREEN',
        'Công nghiệp xanh, Năng lượng sạch & ESG',
        true,
        '{"tt17Code":"C.32, E.38","description":"Điện mặt trời áp mái, tiết kiệm năng lượng, xử lý môi trường & sản xuất tuần hoàn ESG","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'SECTOR',
        'IND_LOG',
        'Logistics công nghiệp, Kho vận & Chuỗi cung ứng',
        true,
        '{"tt17Code":"H.52","description":"Kho vận thông minh WMS, chuỗi cung ứng lạnh, vận tải & dịch vụ phụ trợ KCN","matrixPairsCount":4}'::jsonb,
        1,
        NOW(),
        NOW()
    )
ON CONFLICT (kind, code) WHERE code IS NOT NULL
DO UPDATE SET
    name = EXCLUDED.name,
    is_active = true,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- 3. Upsert 8+1 Dia ban Bac Ninh (AREA) & 13 KCN trong diem Bac Ninh (KCN) (REQ-BACLINK-TAX-002)
INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
VALUES
    -- 8+1 Dia ban Bac Ninh (type = AREA)
    (gen_random_uuid(), 'LOCATION', 'TP_BN', 'TP. Bắc Ninh', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":1}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'TU_SON', 'TP. Từ Sơn', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":2}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'QUE_VO', 'TX. Quế Võ', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":3}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'THUAN_THANH', 'TX. Thuận Thành', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":4}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'YEN_PHONG', 'H. Yên Phong', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":5}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'TIEN_DU', 'H. Tiên Du', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":6}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'GIA_BINH', 'H. Gia Bình', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":7}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'LUONG_TAI', 'H. Lương Tài', true, '{"type":"AREA","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":8}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'NGOAI_TINH', 'Đối tác FDI / Ngoài tỉnh', true, '{"type":"AREA","province":"Ngoài tỉnh","region":"Ngoài tỉnh","sortOrder":9}'::jsonb, 1, NOW(), NOW()),

    -- 13 KCN trong diem Bac Ninh (type = KCN)
    (gen_random_uuid(), 'LOCATION', 'KCN_YEN_PHONG_1', 'KCN Yên Phong I', true, '{"type":"KCN","areaCode":"YEN_PHONG","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":101}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_YEN_PHONG_2C', 'KCN Yên Phong II-C', true, '{"type":"KCN","areaCode":"YEN_PHONG","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":102}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_QUE_VO_1', 'KCN Quế Võ I', true, '{"type":"KCN","areaCode":"QUE_VO","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":103}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_QUE_VO_2', 'KCN Quế Võ II', true, '{"type":"KCN","areaCode":"QUE_VO","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":104}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_QUE_VO_3', 'KCN Quế Võ III', true, '{"type":"KCN","areaCode":"QUE_VO","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":105}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_VSIP_BN', 'KCN VSIP Bắc Ninh', true, '{"type":"KCN","areaCode":"TU_SON","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":106}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_TIEN_SON', 'KCN Tiên Sơn', true, '{"type":"KCN","areaCode":"TIEN_DU","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":107}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_DAI_DONG_HOAN_SON', 'KCN Đại Đồng - Hoàn Sơn', true, '{"type":"KCN","areaCode":"TIEN_DU","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":108}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_HANAKA', 'KCN Hanaka', true, '{"type":"KCN","areaCode":"TU_SON","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":109}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_THUAN_THANH_1', 'KCN Thuận Thành I', true, '{"type":"KCN","areaCode":"THUAN_THANH","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":110}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_THUAN_THANH_2', 'KCN Thuận Thành II', true, '{"type":"KCN","areaCode":"THUAN_THANH","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":111}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_THUAN_THANH_3', 'KCN Thuận Thành III', true, '{"type":"KCN","areaCode":"THUAN_THANH","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":112}'::jsonb, 1, NOW(), NOW()),
    (gen_random_uuid(), 'LOCATION', 'KCN_GIA_BINH', 'KCN Gia Bình', true, '{"type":"KCN","areaCode":"GIA_BINH","province":"Bắc Ninh","region":"Bắc Ninh","sortOrder":113}'::jsonb, 1, NOW(), NOW())
ON CONFLICT (kind, code) WHERE code IS NOT NULL
DO UPDATE SET
    name = EXCLUDED.name,
    is_active = true,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

COMMIT;
