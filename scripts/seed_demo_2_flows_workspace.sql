-- =========================================================================
-- SQL SEED SCRIPT: DỮ LIỆU TEST DEMO 2 LUỒNG THƯƠNG MẠI & WORKSPACE DEAL ROOM
-- Phục vụ trình diễn trực tiếp (Live Demo) 2 luồng cốt lõi:
-- 1. Luồng Mua Sản Phẩm (Bên Mua xem sản phẩm -> click Mua -> Workspace trao đổi)
-- 2. Luồng Nhu Cầu (Bên Bán xem bài toán -> click Nhu cầu -> Workspace trao đổi)
-- =========================================================================

DO $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    
    -- ID cố định Luồng 1 (Mua Sản Phẩm)
    v_offer_buy_id      UUID := 'd1111111-0001-7000-8000-000000000001';
    v_opp_buy_id        UUID := 'd1111111-0002-7000-8000-000000000001';
    v_mou_buy_id        UUID := 'd1111111-0003-7000-8000-000000000001';

    -- ID cố định Luồng 2 (Nhu Cầu Công Nghệ)
    v_survey_demand_id  UUID := 'd2222222-0000-7000-8000-000000000002';
    v_demand_item_id    UUID := 'd2222222-0001-7000-8000-000000000002';
    v_opp_demand_id     UUID := 'd2222222-0002-7000-8000-000000000002';
    v_mou_demand_id     UUID := 'd2222222-0003-7000-8000-000000000002';
    
    -- Tài khoản Actor cố định
    v_seller_person_id  UUID := '208039ea-cb0b-4b9b-b115-73a1f629e521'; -- seller.user@demo.nacentech.vn
    v_buyer_person_id   UUID := 'fbc7b482-4cdd-4f5e-80dc-5fdc5944cc76'; -- buyer.user@demo.nacentech.vn

    -- Doanh nghiệp Demo cố định
    v_ent_seller_id     UUID := 'e1111111-0000-7000-8000-000000000001'; -- 0201998877
    v_ent_buyer_id      UUID := 'e2222222-0000-7000-8000-000000000002'; -- 0108996655
BEGIN
    RAISE NOTICE '>>> Bắt đầu nạp dữ liệu Test Demo 2 luồng Workspace...';

    -- DỌN DẸP BẢN GHI DEMO CŨ NẾU ĐÃ TỒN TẠI (IDEMPOTENCY)
    DELETE FROM enterprise.enterprise_identifiers WHERE enterprise_id IN (v_ent_seller_id, v_ent_buyer_id);
    DELETE FROM enterprise.enterprise_intellectual_properties WHERE enterprise_id IN (v_ent_seller_id, v_ent_buyer_id);
    DELETE FROM enterprise.enterprise_innovation_projects WHERE enterprise_id IN (v_ent_seller_id, v_ent_buyer_id);
    DELETE FROM enterprise.enterprises WHERE id IN (v_ent_seller_id, v_ent_buyer_id) OR tax_code IN ('0201998877', '0108996655');

    DELETE FROM brokerage.deal_discussions WHERE opportunity_id IN (v_opp_buy_id, v_opp_demand_id);
    DELETE FROM brokerage.mou_agreements WHERE id IN (v_mou_buy_id, v_mou_demand_id) OR opportunity_id IN (v_opp_buy_id, v_opp_demand_id);
    DELETE FROM brokerage.opportunities WHERE id IN (v_opp_buy_id, v_opp_demand_id) OR opportunity_code IN ('DEAL-BUY-DEMO-01', 'DEAL-DEMAND-DEMO-02');
    
    DELETE FROM technology.offer_spec_values WHERE offer_id = v_offer_buy_id;
    DELETE FROM technology.offer_documents WHERE offer_id = v_offer_buy_id;
    DELETE FROM technology.seller_technology_offers WHERE id = v_offer_buy_id OR offer_code = 'SP-DEMO-MUA-01';

    DELETE FROM demand.demand_items WHERE id = v_demand_item_id OR item_code = 'DMD-DEMO-NC-02';
    DELETE FROM demand.demand_surveys WHERE id = v_survey_demand_id OR survey_code = 'SUR-DEMO-NC-02';

    -- =========================================================================
    -- PHẦN 0: KHỞI TẠO HỒ SƠ DOANH NGHIỆP DEMO (SELLER & BUYER)
    -- =========================================================================
    INSERT INTO enterprise.enterprises (
        id, subject_type, legal_name, name, tax_code, established_date,
        province_city, address_detail, website, description,
        contact_person, contact_phone, contact_email, is_contact_public,
        is_verified, verification_status, status, version,
        main_sector_name, sector_code, ownership_type, workforce_scale, revenue_range,
        operating_zone, high_qualification_ratio, tni_score, tni_classification,
        has_rd_unit, has_rd_budget, rd_budget_amount, rd_personnel_count,
        is_exporting, in_value_chain, capability_tier, latest_innovation_tier, latest_innovation_score,
        is_buyer, is_seller, active_role, owner_person_id,
        created_at, updated_at
    ) VALUES 
    (
        v_ent_seller_id, 'ENTERPRISE',
        'CÔNG TY CỔ PHẦN CÔNG NGHỆ & TỰ ĐỘNG HÓA HẢI PHÒNG', 'Công Ty Cung Cấp Giải Pháp',
        '0201998877', '2018-05-15', 'Hải Phòng',
        'Lô CN-08, Khu Công Nghiệp Tràng Duệ, Huyện An Dương, TP. Hải Phòng', 'https://nacen-automation.vn',
        'Đơn vị tiên phong nghiên cứu, phát triển và chế tạo thiết bị kiểm tra quang học tự động (AOI) tích hợp trí tuệ nhân tạo AI Vision, robot công nghiệp và giải pháp tự động hóa dây chuyền sản xuất SMT tại Việt Nam.',
        'Nguyễn Văn Bán', '0912345678', 'seller.user@demo.nacentech.vn', true,
        true, 'VERIFIED', 'ACTIVE', 1,
        'Cơ khí chế tạo & Tự động hóa', 'LV05', 'Công ty cổ phần', '100 - 300 lao động', '100 tỷ - 300 tỷ VNĐ',
        'Khu công nghiệp Tràng Duệ', '42%', 85.00, 'TIEN_TIEN',
        true, true, 15000000000, 28, true, true, 'LEADER', 'TIEN_TIEN', 88.50,
        false, true, 'SELLER', v_seller_person_id, v_now, v_now
    ),
    (
        v_ent_buyer_id, 'ENTERPRISE',
        'CÔNG TY CỔ PHẦN CHẾ TẠO ĐIỆN TỬ & CƠ KHÍ CHÍNH XÁC THĂNG LONG', 'Doanh Nghiệp Tìm Kiếm Công Nghệ',
        '0108996655', '2015-10-20', 'Hà Nội',
        'Khu Công Nghiệp Thăng Long I, Huyện Đông Anh, TP. Hà Nội', 'https://thanglong-tech.vn',
        'Doanh nghiệp sản xuất linh kiện phụ tùng đúc kim loại màu ADC12 và lắp ráp bo mạch điện tử cho các tập đoàn công nghệ đa quốc gia (FDI), đang tích cực tìm kiếm giải pháp chuyển đổi số và công nghệ cao.',
        'Trần Văn Mua', '0901234567', 'buyer.user@demo.nacentech.vn', true,
        true, 'VERIFIED', 'ACTIVE', 1,
        'Cơ khí chế tạo & Tự động hóa', 'LV05', 'Công ty cổ phần', '500+ lao động', '300 tỷ - 500 tỷ VNĐ',
        'Khu công nghiệp Thăng Long', '35%', 95.00, 'CAP_THIET',
        true, true, 8000000000, 15, true, true, 'INTERMEDIATE', 'TRUNG_BINH', 72.00,
        true, false, 'BUYER', v_buyer_person_id, v_now, v_now
    );

    INSERT INTO enterprise.enterprise_intellectual_properties (id, enterprise_id, type, title, registration_number, created_at, updated_at) VALUES
    (gen_random_uuid(), v_ent_seller_id, 'PATENT', 'Phương pháp và thiết bị kiểm tra quang học tự động mối hàn vi mạch SMT bằng AI Vision', 'VN-1-2026-004812', v_now, v_now),
    (gen_random_uuid(), v_ent_seller_id, 'UTILITY_SOLUTION', 'Thuật toán lọc nhiễu ảnh và phát hiện khuyết tật hàn vi mô thời gian thực', 'VN-2-2026-001205', v_now, v_now);

    -- =========================================================================
    -- PHẦN 1: LUỒNG 1 - MUA SẢN PHẨM & TRAO ĐỔI WORKSPACE
    -- =========================================================================

    -- 1.1 Tạo Sản phẩm thương phẩm niêm yết bán
    INSERT INTO technology.seller_technology_offers (
        id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
        sector_code, sector_name, pricing_type, price_amount, currency, unit,
        developer_origin, trl_level, ip_status, ip_registration_number, transfer_method,
        commercial_status, contact_point_role, status, successful_connections, rating_score, review_count,
        managing_authority_id, managing_authority_name, enterprise_tax_code, enterprise_name,
        main_image_url, delivery_timeline, warranty_terms, supply_scope, payment_terms,
        installation_support, equipment_status, is_deleted, created_by, published_at, created_at, updated_at
    ) VALUES (
        v_offer_buy_id,
        'SP-DEMO-MUA-01',
        'PRODUCT',
        true,
        'Máy kiểm tra khuyết tật mối hàn vi mạch SMT tự động tích hợp AI Vision Nacen-Check 4.0',
        'Hệ thống kiểm tra quang học tự động (AOI) tích hợp trí tuệ nhân tạo chuyên dụng cho dây chuyền sản xuất bo mạch điện tử SMT, phát hiện 99.8% lỗi hàn micro-defect ở tốc độ cao.',
        'Giải quyết triệt để lỗi bỏ sót điểm nứt mối hàn, chạm chập và xô lệch linh kiện 0201/0402 trong lắp ráp điện tử tốc độ cao, thay thế hoàn toàn khâu soi kính hiển vi thủ công.',
        'LV05',
        'Cơ khí chế tạo & Tự động hóa',
        'FIXED',
        250000000.00,
        'VND',
        'hệ thống',
        'Viện Ứng Dụng Công Nghệ NacenTech',
        8,
        'PATENT_GRANTED',
        'VN-1-2026-004812',
        'DEVICE',
        'COMMERCIALLY_READY',
        'Phòng Chuyển Giao Công Nghệ & Thương Mại Hóa',
        'APPROVED',
        18,
        5.00,
        24,
        'SO_KHCN_HP',
        'Sở Khoa Học và Công Nghệ Hải Phòng',
        '0201998877',
        'Công Ty Cung Cấp Giải Pháp',
        '/tech-ai-vision.png',
        '15 - 30 ngày kể từ ngày ký hợp đồng',
        'Bảo hành chính hãng 24 tháng tận xưởng sản xuất',
        'Trọn bộ 01 máy kiểm tra SMT, 01 server xử lý AI, 01 màn hình công nghiệp 4K, tài liệu và quy trình chuyển giao',
        'Tạm ứng 30% khi ký kết, 40% khi giao máy, 30% khi nghiệm thu kỹ thuật',
        true,
        'NEW',
        false,
        v_seller_person_id,
        v_now,
        v_now,
        v_now
    );

    -- 1.2 Bổ sung thông số kỹ thuật (Spec Values) cho sản phẩm
    INSERT INTO technology.offer_spec_values (id, offer_id, spec_code, spec_name, spec_value, unit, spec_category, created_at) VALUES
    (gen_random_uuid(), v_offer_buy_id, 'SPEED', 'Tốc độ quét kiểm tra', '180 linh kiện / giây (FoV 45x45mm)', 'pcs/s', 'TIER_1_STANDARD', v_now),
    (gen_random_uuid(), v_offer_buy_id, 'CAMERA', 'Độ phân giải Camera AI', '20 Megapixel Telecentric Ultra-Low Distortion', 'MP', 'TIER_1_STANDARD', v_now),
    (gen_random_uuid(), v_offer_buy_id, 'PRECISION', 'Độ chính xác lặp lại', '± 3', 'µm', 'TIER_1_STANDARD', v_now),
    (gen_random_uuid(), v_offer_buy_id, 'PROTOCOL', 'Giao thức kết nối công nghiệp', 'Modbus TCP/IP, SECS/GEM, OPC-UA', '', 'TIER_2_TECHNICAL', v_now);

    -- 1.3 Tạo Cơ hội hợp tác & Workspace Deal Room sẵn cho Luồng 1
    INSERT INTO brokerage.opportunities (
        id, opportunity_code, title,
        buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
        seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
        assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
        created_at, updated_at
    ) VALUES (
        v_opp_buy_id,
        'DEAL-BUY-DEMO-01',
        'Đơn hàng & Chuyển giao: Máy kiểm tra khuyết tật mối hàn vi mạch SMT Nacen-Check 4.0',
        'Doanh Nghiệp Tìm Kiếm Công Nghệ',
        'Trần Văn Mua (Kỹ sư Trưởng)',
        '0901234567',
        'buyer.user@demo.nacentech.vn',
        'Công Ty Cung Cấp Giải Pháp',
        'Nguyễn Văn Bán (GĐ Công Nghệ)',
        '0912345678',
        'seller.user@demo.nacentech.vn',
        'Ban Thẩm Định NacenTwin',
        'SO_KHCN_HP',
        'NEGOTIATION',
        500,
        v_now - INTERVAL '2 hours',
        v_now
    );

    -- 1.4 Tạo nhật ký thảo luận 2 bên trong Workspace Deal Room (Luồng 1)
    INSERT INTO brokerage.deal_discussions (id, opportunity_id, sender_name, sender_role, message, attachment_url, created_at) VALUES
    (
        gen_random_uuid(),
        v_opp_buy_id,
        'Trần Văn Mua (Bên Mua)',
        'BUYER',
        'Chào bên bán, chúng tôi đã duyệt thông số kỹ thuật máy Nacen-Check 4.0 trên cổng. Bên mua muốn đặt mua 02 hệ thống bàn giao tại xưởng KCN Tràng Duệ, Hải Phòng. Nhờ bên bán làm rõ phương thức đào tạo và hiệu chuẩn ban đầu.',
        NULL,
        v_now - INTERVAL '90 minutes'
    ),
    (
        gen_random_uuid(),
        v_opp_buy_id,
        'Nguyễn Văn Bán (Bên Bán)',
        'SELLER',
        'Chào Quý công ty, chúng tôi cam kết cử 02 kỹ sư cao cấp hỗ trợ lắp đặt, hiệu chuẩn và đào tạo 5 kỹ thuật viên vận hành trong 3 ngày làm việc. Đồng thời áp dụng chính sách bảo hành 24 tháng tận nơi.',
        NULL,
        v_now - INTERVAL '60 minutes'
    ),
    (
        gen_random_uuid(),
        v_opp_buy_id,
        'Trần Văn Mua (Bên Mua)',
        'BUYER',
        'Mức hỗ trợ rất tốt. Chúng tôi đề xuất tiến độ thanh toán chia 3 đợt (Tạm ứng 30% - Giao máy 40% - Nghiệm thu bàn giao 30%). Bên bán xem dự thảo MOU đã cập nhật nhé.',
        NULL,
        v_now - INTERVAL '30 minutes'
    ),
    (
        gen_random_uuid(),
        v_opp_buy_id,
        'Nguyễn Văn Bán (Bên Bán)',
        'SELLER',
        'Chúng tôi hoàn toàn nhất trí với điều khoản thanh toán này. Đã sẵn sàng ký kết biên bản ghi nhớ MOU trên hệ thống để xuất xưởng thiết bị.',
        NULL,
        v_now - INTERVAL '10 minutes'
    );

    -- 1.5 Tạo Dự thảo Biên bản ghi nhớ (MOU) cho Luồng 1
    INSERT INTO brokerage.mou_agreements (
        id, mou_code, opportunity_id, scope_of_work, pilot_duration_months,
        commercial_terms, intellectual_property_terms, status, created_at
    ) VALUES (
        v_mou_buy_id,
        'MOU-BUY-2026-001',
        v_opp_buy_id,
        'Cung cấp 02 máy kiểm tra khuyết tật mối hàn SMT Nacen-Check 4.0 kèm gói chuyển giao quy trình vận hành và kiểm định tại nhà máy Hải Phòng.',
        3,
        'Tổng giá trị đơn hàng 500,000,000 VNĐ. Thanh toán 3 đợt: 30% khi ký kết, 40% khi giao thiết bị, 30% sau khi ký biên bản nghiệm thu kỹ thuật.',
        'Bên mua sở hữu trọn vẹn bản quyền khai thác phần mềm điều khiển trên máy. Bên bán bảo hộ quyền sở hữu thuật toán AI lõi.',
        'DRAFT',
        v_now
    );


    -- =========================================================================
    -- PHẦN 2: LUỒNG 2 - BÀI TOÁN NHU CẦU & TRAO ĐỔI WORKSPACE
    -- =========================================================================

    -- 2.1 Tạo Phiếu Khảo Sát Nhu Cầu Gốc
    INSERT INTO demand.demand_surveys (
        id, survey_code, survey_year, survey_type, status,
        company_name, tax_code, contact_name, contact_phone, contact_email,
        business_type, enterprise_size, employee_scale, revenue_range_3y,
        top_bottlenecks, support_needs, tni_score, tni_classification,
        created_by, created_at, updated_at
    ) VALUES (
        v_survey_demand_id,
        'SUR-DEMO-NC-02',
        2026,
        'DEEP_SURVEY',
        'VERIFIED',
        'Doanh Nghiệp Tìm Kiếm Công Nghệ',
        '0108996655',
        'Trần Văn Mua',
        '0901234567',
        'buyer.user@demo.nacentech.vn',
        'ENTERPRISE_FDI',
        'LARGE',
        'SCALE_500_PLUS',
        'REV_100B_500B',
        ARRAY['Nứt phôi đúc áp lực ADC12', 'Tiêu hao năng lượng nấu kim loại lớn', 'Thiếu cảm biến giám sát nhiệt độ khuôn real-time'],
        ARRAY['Chuyển giao công nghệ cảm biến', 'Tư vấn cải tiến khuôn đúc tự động'],
        95,
        'CAP_THIET',
        v_buyer_person_id,
        v_now - INTERVAL '3 days',
        v_now
    );

    -- 2.2 Tạo Bài toán nhu cầu công nghệ (TNI = 95 - Hạng A Cấp thiết)
    INSERT INTO demand.demand_items (
        id, survey_id, item_code, stage_name, technical_problem, desired_solution,
        need_consulting, expected_goal, application_scale, sector_code, tech_group_code,
        demand_type_code, budget_range, urgency_score, impact_score, investment_capacity,
        adoption_readiness, tni_score, tni_classification, status, is_public_listed,
        created_by, created_at, updated_at
    ) VALUES (
        v_demand_item_id,
        v_survey_demand_id,
        'DMD-DEMO-NC-02',
        'Sản xuất & Đúc phôi hợp kim',
        'Tối ưu hóa chu trình kiểm soát nhiệt và nứt chân chim trong đúc áp lực hợp kim nhôm ADC12',
        'Cần công nghệ cảm biến nhiệt hồng ngoại đa điểm kết hợp thuật toán điều khiển áp suất và buồng làm mát khuôn tự động nhằm giảm tỷ lệ nứt phôi dưới 1.5%.',
        true,
        'Giảm tỷ lệ hao hụt phôi lỗi từ 8% xuống dưới 1.5%, tiết kiệm 300 triệu đồng chi phí nấu lại phôi mỗi tháng.',
        'Nhà máy đúc linh kiện ô tô (4 dây chuyền 800 tấn)',
        'LV05',
        'TG05',
        'TECH_TRANSFER',
        '1B_5B',
        5, 5, 4, 5,
        95,
        'CAP_THIET',
        'VERIFIED',
        true,
        v_buyer_person_id,
        v_now - INTERVAL '3 days',
        v_now
    );

    -- 2.3 Tạo Cơ hội hợp tác & Workspace Deal Room sẵn cho Luồng 2
    INSERT INTO brokerage.opportunities (
        id, opportunity_code, title,
        buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
        seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
        assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
        created_at, updated_at
    ) VALUES (
        v_opp_demand_id,
        'DEAL-DEMAND-DEMO-02',
        'Giải pháp: Công nghệ cảm biến nhiệt & Buồng làm mát khuôn đúc áp lực ADC12',
        'Doanh Nghiệp Tìm Kiếm Công Nghệ',
        'Trần Văn Mua (GĐ Sản Xuất)',
        '0901234567',
        'buyer.user@demo.nacentech.vn',
        'Công Ty Cung Cấp Giải Pháp',
        'Nguyễn Văn Bán (Trưởng nhóm R&D)',
        '0912345678',
        'seller.user@demo.nacentech.vn',
        'TS. Nguyễn Minh An (Chuyên gia NacenTech)',
        'SO_KHCN_HN',
        'NEGOTIATION',
        1200,
        v_now - INTERVAL '4 hours',
        v_now
    );

    -- 2.4 Tạo nhật ký thảo luận 2 bên + chuyên gia trong Workspace Deal Room (Luồng 2)
    INSERT INTO brokerage.deal_discussions (id, opportunity_id, sender_name, sender_role, message, attachment_url, created_at) VALUES
    (
        gen_random_uuid(),
        v_opp_demand_id,
        'Nguyễn Văn Bán (Bên Bán)',
        'SELLER',
        'Kính gửi Ban Giám đốc Bên mua, chúng tôi đã nghiên cứu bài toán nứt chân chim khuôn đúc ADC12 của Quý công ty. Viện chúng tôi có giải pháp cảm biến đa điểm quét nhiệt trực tiếp thời gian thực, có thể hạ tỷ lệ lỗi xuống 1.1%.',
        NULL,
        v_now - INTERVAL '3 hours'
    ),
    (
        gen_random_uuid(),
        v_opp_demand_id,
        'Trần Văn Mua (Bên Mua)',
        'BUYER',
        'Chào bên bán, kết quả đo lường rất khả quan. Nhà xưởng chúng tôi có 4 máy đúc 800 tấn của Toshiba, hệ thống của bên bán có tương thích giao thức điều khiển PLC không?',
        NULL,
        v_now - INTERVAL '2 hours'
    ),
    (
        gen_random_uuid(),
        v_opp_demand_id,
        'Nguyễn Văn Bán (Bên Bán)',
        'SELLER',
        'Hệ thống hỗ trợ đầy đủ Modbus TCP/IP và OPC-UA, tích hợp trực tiếp vào PLC Toshiba chỉ trong 2 ngày không cần can thiệp phần cứng máy đúc. Chúng tôi sẵn sàng gửi tài liệu kết nối kỹ thuật.',
        NULL,
        v_now - INTERVAL '60 minutes'
    ),
    (
        gen_random_uuid(),
        v_opp_demand_id,
        'TS. Nguyễn Minh An (Chuyên Gia)',
        'EXPERT',
        'Chuyên gia tư vấn: Giải pháp của bên bán đã được kiểm chứng tại nhà máy phụ tùng ô tô Hải Phòng đạt chuẩn TRL 8. Đề xuất hai bên thống nhất thử nghiệm pilot trên 01 khuôn mẫu trước khi áp dụng toàn bộ xưởng.',
        NULL,
        v_now - INTERVAL '20 minutes'
    );

    -- 2.5 Tạo Dự thảo Biên bản ghi nhớ (MOU) cho Luồng 2
    INSERT INTO brokerage.mou_agreements (
        id, mou_code, opportunity_id, scope_of_work, pilot_duration_months,
        commercial_terms, intellectual_property_terms, status, created_at
    ) VALUES (
        v_mou_demand_id,
        'MOU-DEMAND-2026-002',
        v_opp_demand_id,
        'Khảo sát, thiết kế và lắp đặt hệ thống thử nghiệm cảm biến nhiệt đa điểm cho 01 máy đúc khuôn áp lực ADC12.',
        6,
        'Kinh phí thử nghiệm pilot 1,200,000,000 VNĐ. Hỗ trợ 30% từ quỹ phát triển KH&CN địa phương, Bên mua thanh toán 70% sau khi đạt KPI giảm lỗi < 1.5%.',
        'Bên mua được quyền ứng dụng độc quyền tại địa bàn nhà xưởng trong vòng 2 năm kể từ ngày nghiệm thu.',
        'DRAFT',
        v_now
    );

    RAISE NOTICE '>>> ĐÃ NẠP THÀNH CÔNG DỮ LIỆU TEST CHO CẢ 2 LUỒNG VÀO CSDL!';
END $$;
