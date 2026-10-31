-- =========================================================================
-- SEED NACENTECH: 8 ĐƠN VỊ THÀNH VIÊN VÀ 38 SẢN PHẨM NGUỒN CUNG CÓ ẢNH THẬT
-- Tác vụ: Import CSDL cho Server UAT và Production
-- =========================================================================
BEGIN;

-- Xóa dữ liệu cũ của NacenTech để đảm bảo tính Idempotent (chạy nhiều lần an toàn)
DELETE FROM technology.seller_technology_offers WHERE developer_origin = 'Viện Ứng dụng Công nghệ (NacenTech)';
DELETE FROM enterprise.enterprises WHERE tax_code LIKE '0100109968-%';
DELETE FROM identity.persons WHERE email LIKE '%@nacentech.vn' OR email = 'agritechvn@gmail.com' OR email = 'quangdientu@cfoc.vn';

-- 1. TẠO 8 TÀI KHOẢN SELLER VÀ 8 HỒ SƠ DOANH NGHIỆP THÀNH VIÊN
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    '086c0743-202b-53b2-8aa1-ceca7ff45e2d', 'imet@nacentech.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'IMET', 'Ban Giám đốc', '024.38549424',
    'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    '4134926d-353a-5de6-b945-3c84ad8fff97', 'ENTERPRISE', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', 'Trung tâm Vi điện tử', '0100109968-IMET',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'Hà Nội', 'Tòa nhà C6, Thanh Xuân Bắc, Thanh Xuân, Hà Nội', 'Ban Giám đốc IMET',
    '024.38549424', 'imet@nacentech.vn', 'http://imet.nacentech.vn',
    'LV08', 'Điện – điện tử – tự động hóa',
    'Trung tâm Vi điện tử là đơn vị sự nghiệp KH&CN trực thuộc Viện Ứng dụng Công nghệ, chuyên sâu nghiên cứu, thiết kế, chế tạo các thiết bị điện tử, viễn thông cao tần, IoT nông nghiệp công nghệ cao và giải pháp phần mềm quản lý thông minh.', '086c0743-202b-53b2-8aa1-ceca7ff45e2d', now(), now()
);
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    '1f80174a-c4a8-5df5-b83a-8f81119db1ea', 'vatlieu@nacentech.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'liệu', 'Ban Giám đốc Trung tâm Vật', '024.35545023',
    'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    'ae31423e-ec2c-5df1-9f48-216672286af2', 'ENTERPRISE', 'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', 'Trung tâm Công nghệ Vật liệu', '0100109968-MAT',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'Hà Nội', 'Tòa nhà C6, Thanh Xuân Bắc, Thanh Xuân, Hà Nội', 'Ban Giám đốc Trung tâm Vật liệu',
    '024.35545023', 'vatlieu@nacentech.vn', 'http://vatlieu.nacentech.vn',
    'LV12', 'Xây dựng – vật liệu – hạ tầng',
    'Trung tâm Công nghệ Vật liệu chuyên nghiên cứu, ứng dụng và triển khai công nghệ compozit cao cấp (miếng vá hộp sọ C-PEEK, chân giả, xuồng cứu hộ), vật liệu phủ sơn chuyên dụng (chống cháy, tàng hình radar) và công nghệ xử lý môi trường.', '1f80174a-c4a8-5df5-b83a-8f81119db1ea', now(), now()
);
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    '79b678d4-786a-5f55-923a-c449f9c1e5a6', 'quangdientu@cfoc.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'Vũ', 'ThS. Nguyễn Tuấn', '024.38549425',
    'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    '65b46799-3482-51a5-9d19-a1bb5fe2563e', 'ENTERPRISE', 'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ', 'Trung tâm Quang điện tử', '0100109968-CFOC',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'Hà Nội', 'Tòa nhà C6, Thanh Xuân Bắc, Thanh Xuân, Hà Nội', 'ThS. Nguyễn Tuấn Vũ',
    '024.38549425', 'quangdientu@cfoc.vn', 'http://cfoc.vn',
    'LV07', 'Cơ khí – chế tạo – công nghiệp hỗ trợ',
    'Trung tâm Quang điện tử chuyên sâu nghiên cứu màng mỏng quang học PVD phục vụ quốc phòng, chế tạo máy mạ PVD công nghiệp, máy quét 3D quang học độ chính xác cao và robot tự dẫn đường AGV.', '79b678d4-786a-5f55-923a-c449f9c1e5a6', now(), now()
);
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    '4b26a55c-1d7b-5a7e-b727-59e88a7ad48c', 'laser@nacentech.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'Khôi', 'ThS. Giang Mạnh', '024.38549064',
    'Trung tâm Công nghệ Laser - Viện Ứng dụng Công nghệ', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    '0ac5829e-80fa-50af-b7a9-d815415b6714', 'ENTERPRISE', 'Trung tâm Công nghệ Laser - Viện Ứng dụng Công nghệ', 'Trung tâm Công nghệ Laser', '0100109968-LASER',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'Hà Nội', 'Tòa nhà C6, Thanh Xuân Bắc, Thanh Xuân, Hà Nội', 'ThS. Giang Mạnh Khôi',
    '024.38549064', 'laser@nacentech.vn', 'http://laser.nacentech.vn',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo',
    'Trung tâm Công nghệ Laser là đơn vị tiên phong nghiên cứu, phát triển thiết bị laser y tế điều trị - phẫu thuật thẩm mỹ, hệ thống laser quang điện tử an ninh quốc phòng, đo đạc trắc địa và gia công cơ khí chính xác.', '4b26a55c-1d7b-5a7e-b727-59e88a7ad48c', now(), now()
);
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    '3c32f6cc-1f55-5e38-8860-246bc0031d74', 'ceb@nacentech.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'CEB', 'Ban Giám đốc', '024.38549438',
    'Trung tâm Sinh học Thực nghiệm (CEB) - Viện Ứng dụng Công nghệ', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    '0d01d385-12e8-58a1-bb13-6eb96919b594', 'ENTERPRISE', 'Trung tâm Sinh học Thực nghiệm (CEB) - Viện Ứng dụng Công nghệ', 'Trung tâm Sinh học Thực nghiệm', '0100109968-CEB',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'Hà Nội', 'Tòa nhà C6, Thanh Xuân Bắc, Thanh Xuân, Hà Nội', 'Ban Giám đốc CEB',
    '024.38549438', 'ceb@nacentech.vn', 'http://ceb.nacentech.vn',
    'LV01', 'Nông nghiệp',
    'Trung tâm Sinh học Thực nghiệm chuyên nghiên cứu ứng dụng công nghệ sinh học cao trong nông nghiệp, nuôi trồng chế biến tảo Spirulina, nấm Đông trùng hạ thảo, bảo tồn nguồn gen dược liệu và dịch vụ kiểm nghiệm phân tích mẫu môi trường.', '3c32f6cc-1f55-5e38-8860-246bc0031d74', now(), now()
);
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    '29e217d3-ab5e-5812-a07d-c85c88bd9e38', 'agritechvn@gmail.com', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'Quang', 'Ông Võ Đình', '028.38109196',
    'Chi nhánh Viện Ứng dụng Công nghệ tại TP.HCM (NACENHO)', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    '148debc2-2b3e-5360-9b51-026cc9348da9', 'ENTERPRISE', 'Chi nhánh Viện Ứng dụng Công nghệ tại TP.HCM (NACENHO)', 'Chi nhánh Viện Ứng dụng Công nghệ tại TP.HCM', '0100109968-NACENHO',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'TP. Hồ Chí Minh', 'Số 291 Hoàng Văn Thụ, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh', 'Ông Võ Đình Quang',
    '028.38109196', 'agritechvn@gmail.com', 'http://nacenho.nacentech.vn',
    'LV01', 'Nông nghiệp',
    'Chi nhánh NACENHO phụ trách triển khai nghiên cứu và chuyển giao công nghệ sinh học tại các tỉnh phía Nam, trọng tâm là chế phẩm vi sinh nông nghiệp (Trichoderma Achacomix), vi sinh nuôi tôm và chiết xuất dược liệu quý.', '29e217d3-ab5e-5812-a07d-c85c88bd9e38', now(), now()
);
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    'f8cfc037-7e9d-5325-94d4-dad3030e9dc6', 'ntbic@nacentech.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'NTBIC', 'Ban Giám đốc', '0221.3764888',
    'Trung tâm Ươm tạo Công nghệ & DN KHCN (NTBIC)', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    '38e87899-dbaa-58d7-8c73-d2c1f4bb83f3', 'ENTERPRISE', 'Trung tâm Ươm tạo Công nghệ & DN KHCN (NTBIC)', 'Trung tâm Ươm tạo Công nghệ và Doanh nghiệp KHCN', '0100109968-NTBIC',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'Hưng Yên', 'Thị trấn Bần Yên Nhân, Huyện Mỹ Hào, Tỉnh Hưng Yên', 'Ban Giám đốc NTBIC',
    '0221.3764888', 'ntbic@nacentech.vn', 'http://ntbic.nacentech.vn',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo',
    'Trung tâm NTBIC hoạt động theo cơ chế tự chủ Nghị định 115, có tư cách pháp nhân riêng, thực hiện ươm tạo doanh nghiệp khởi nghiệp đổi mới sáng tạo, chuyển giao quy trình công nghệ nông nghiệp cao (lan Hồ Điệp LED, nấm Nữ hoàng).', 'f8cfc037-7e9d-5325-94d4-dad3030e9dc6', now(), now()
);
INSERT INTO identity.persons (
    id, email, password_hash, password_hash_algorithm, first_name, last_name, phone,
    organization_name, platform_role, is_active, matching_auto, preferences_updated_at,
    version, created_at, updated_at, scope_type, scope_id
) VALUES (
    'b1826e4c-3531-5791-a6a7-ea84af317376', 'labs@nacentech.vn', 'AQAAAAIAAYagAAAAEK35mHdqt3N+vBpfGZA13wLl1MkgPS+tXQYXbmSGue26SlXcajxLammsl/B0XtYBvw==',
    'pbkdf2-v3', 'PTN', 'Ban Phụ trách', '024.38549000',
    'Khối PTN Nghiên cứu Chuyên sâu (Tự động hóa & MEMS Hòa Lạc)', 'SELLER', true, true, now(),
    1, now(), now(), 'GLOBAL', null
);
INSERT INTO enterprise.enterprises (
    id, subject_type, name, legal_name, tax_code, status, is_verified, verification_status,
    is_seller, active_role, capability_tier, province_city, address_detail,
    contact_person, contact_phone, contact_email, website, sector_code, main_sector_name,
    description, owner_person_id, created_at, updated_at
) VALUES (
    '8c7f618d-4f5f-5157-b36a-970ebe89800b', 'ENTERPRISE', 'Khối PTN Nghiên cứu Chuyên sâu (Tự động hóa & MEMS Hòa Lạc)', 'Phòng Thí nghiệm MEMS & Tự động hóa', '0100109968-LABS',
    'ACTIVE', true, 'APPROVED', true, 'SELLER', 'ADVANCED',
    'Hà Nội', 'Khu Công nghệ cao Hòa Lạc & C6 Thanh Xuân Bắc, Hà Nội', 'Ban Phụ trách PTN',
    '024.38549000', 'labs@nacentech.vn', 'http://mems.nacentech.vn',
    'LV08', 'Điện – điện tử – tự động hóa',
    'Khối nghiên cứu chuyên sâu gồm Phòng thí nghiệm MEMS/NEMS Hòa Lạc và Phòng thí nghiệm CNTT & Tự động hóa, chuyên về cảm biến điện hóa in phân tích môi trường - an toàn thực phẩm và giải pháp Machine Vision công nghiệp.', 'b1826e4c-3531-5791-a6a7-ea84af317376', now(), now()
);

-- 2. TẠO 38 SẢN PHẨM CHÀO BÁN CÔNG NGHỆ CÓ ẢNH THẬT ĐẦY ĐỦ
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '99763f9b-8aa9-5795-b408-5e7e4d9983e5', 'OFF-IMET-001', 'DEVICE', true,
    'Hệ thống đèn LED chuyên dụng nuôi cấy mô & cây trồng', 'Chiếu sáng mô và cây trồng bằng ánh sáng đơn sắc (xanh, đỏ) với bước sóng phù hợp, tích hợp điều khiển cường độ và giám sát vi khí hậu.', 'Tối ưu hóa quang hợp, tiết kiệm 65% điện năng so với đèn huỳnh quang, kích thích sinh trưởng vượt trội cho cây nuôi cấy mô.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-den-led-nuoi-cay-mo.png', '{"/images/products/nacentech/imet-den-led-nuoi-cay-mo_g1.jpeg","/images/products/nacentech/imet-den-led-nuoi-cay-mo_g2.jpeg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '4be54807-1cba-5eb7-b6c5-10700aa3c151', 'OFF-IMET-002', 'DEVICE', true,
    'Bộ thu thập và lưu trữ dữ liệu Datalogger tốc độ cao', 'Hệ thống ghi dữ liệu 36 kênh analog đầu vào, tiền khuếch đại Pre-amp tích hợp, tần số lấy mẫu 25 MS/s/kênh độ phân giải 16 bit.', 'Đo kiểm thu thập tín hiệu tốc độ cao, chính xác cho các thử nghiệm va đập, nổ, và rung chấn công nghiệp - quân sự.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'PATENT_PENDING',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-datalogger.jpeg', '{"/images/products/nacentech/imet-datalogger_g1.jpeg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '76488ddb-77ab-5362-a7c0-fa044716282a', 'OFF-IMET-003', 'SOLUTION', false,
    'Hệ thống kiểm soát ra vào bằng thẻ từ & camera thông minh', 'Giải pháp phần mềm và phần cứng kiểm soát cửa ra vào, tự động chụp ảnh nhận diện, tích hợp chấm công và quản lý năng lượng thông minh.', 'Nâng cao an ninh tòa nhà công sở, nhà máy, tự động hóa chấm công và cắt giảm điện chiếu sáng khu vực không có người.',
    'LV16', 'CNTT – viễn thông – chuyển đổi số', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'SOFTWARE_COPYRIGHT',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-the-tu.png', '{"/images/products/nacentech/imet-the-tu_g1.png","/images/products/nacentech/imet-the-tu_g2.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '084f717d-f074-5b63-b00f-a1d68ee02706', 'OFF-IMET-004', 'SOLUTION', false,
    'Hệ thống quản lý bãi giữ xe thông minh Smart Parking', 'Tích hợp phân hệ kiểm soát barrier, camera nhận dạng biển số OCR, thẻ chip chống sao chép và hệ thống báo cáo doanh thu tài chính minh bạch.', 'Xóa bỏ ùn tắc cửa ngõ bãi xe giờ cao điểm, chống gian lận vé xe và thất thoát tiền gửi xe cho trung tâm thương mại, khu đô thị.',
    'LV16', 'CNTT – viễn thông – chuyển đổi số', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'SOFTWARE_COPYRIGHT',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-smart-parking.png', '{"/images/products/nacentech/imet-smart-parking_g1.png","/images/products/nacentech/imet-smart-parking_g2.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'cf13fa74-e7c4-5d46-aaf7-7deff1822215', 'OFF-IMET-005', 'SOLUTION', false,
    'Hệ thống Cổng thông tin thoại Contact Center & IVR', 'Tổng đài thông minh đa kênh tích hợp VoIP, Analog, ghi âm đàm thoại, tự động gọi đi (Auto-call/Voice broadcast) theo kịch bản trực quan.', 'Tự động hóa chăm sóc khách hàng quy mô lớn, tổng đài hành chính công cho ủy ban nhân dân và cơ quan nhà nước.',
    'LV16', 'CNTT – viễn thông – chuyển đổi số', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'SOFTWARE_COPYRIGHT',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-cong-thoai.jpeg', '{"/images/products/nacentech/imet-cong-thoai_g1.jpeg","/images/products/nacentech/imet-cong-thoai_g2.jpeg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '790820e0-f577-5ca3-9602-2e9bd5741321', 'OFF-IMET-006', 'DEVICE', true,
    'Thiết bị điều khiển áp suất dưỡng khí cầu thang thoát nạn khi hỏa hoạn', 'Tự động kích hoạt van điều áp và quạt thổi dưỡng khí duy trì áp suất dương trong buồng thang thoát hiểm nhà cao tầng khi xảy ra cháy.', 'Ngăn chặn tuyệt đối khói độc và khí nóng tràn vào buồng thang, bảo vệ tính mạng cư dân thoát hiểm an toàn theo tiêu chuẩn PCCC.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-dieu-ap-thang-thoat-nan.png', '{"/images/products/nacentech/imet-dieu-ap-thang-thoat-nan_g1.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'd76a68ef-3c8c-5155-980d-962fb9701c52', 'OFF-IMET-007', 'DEVICE', false,
    'Thiết bị đếm vòng tua máy xây dựng tích hợp định vị GPS', 'Thiết bị gắn trên máy công trình, đọc dữ liệu cảm biến tiệm cận, giám sát ắc quy, lưu trữ tọa độ GPS và truyền về server chu kỳ 10s/lần.', 'Chống gian lận giờ làm việc của máy ủi, máy xúc tại các đại công trường xây dựng, tối ưu hóa chi phí nhiên liệu nhà thầu.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-vong-tua-may.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '5a59cda8-68e3-580d-bc3c-8ed2436176b3', 'OFF-IMET-008', 'DEVICE', true,
    'Bộ khuếch đại & Bộ lọc cao tần chuyên dụng MIMO 2x2', 'Thiết bị cao tần băng tần RX 1710-1785 MHz, công suất phát 2x40W/2x60W, hiệu suất 32%, độ suy hao tín hiệu cực thấp <= 1.8 dBm.', 'Làm chủ thiết bị viễn thông vô tuyến cao tần trong nước, giảm phụ thuộc linh kiện nhập khẩu đắt đỏ.',
    'LV16', 'CNTT – viễn thông – chuyển đổi số', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 7, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-khuech-dai-cao-tan.png', '{"/images/products/nacentech/imet-khuech-dai-cao-tan_g1.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'a9b9eab6-026b-5032-9877-ad660f6653cf', 'OFF-IMET-009', 'SOLUTION', false,
    'Hệ thống thu thập và hiển thị số lượng lỗi chuyền may', 'Cập nhật lỗi qua bàn phím cơ tại chỗ, bảng LED 7 thanh hiển thị lỗi tức thời cho chuyền may, trích xuất báo cáo theo ca sản xuất.', 'Kiểm soát chất lượng KCS thời gian thực trong nhà máy dệt may, giảm tỷ lệ hàng hỏng và phát hiện ngay vị trí thợ may mắc lỗi.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'SOFTWARE_COPYRIGHT',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-bao-loi-chuyen-may.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '0c1efd0a-fbd7-58fb-a94e-a24bdca8e8e8', 'OFF-IMET-010', 'DEVICE', true,
    'Trạm quan trắc khí thải & môi trường truyền thông không dây LoRa', 'Trạm quan trắc môi trường đa chỉ tiêu (bụi mịn, CO2, SO2), điều khiển đóng cắt relay 2 kênh, truyền thông tầm xa LoRa về app di động.', 'Giám sát ô nhiễm không khí tại cụm công nghiệp, trang trại chăn nuôi khép kín mà không cần kéo dây mạng phức tạp.',
    'LV11', 'Nước – môi trường – chất thải', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-IMET', 'Trung tâm Vi điện tử (IMET) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/imet-quan-trac-lora.png', '{"/images/products/nacentech/imet-quan-trac-lora_g1.png","/images/products/nacentech/imet-quan-trac-lora_g2.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'a63f2f05-4327-541c-87b6-e2d3f79a34d0', 'OFF-MAT-001', 'PRODUCT', true,
    'Miếng vá hộp sọ toàn phần compozit Carbon - PEEK (C-PEEK)', 'Vật liệu compozit carbon polyete ete keton sinh học cấy ghép tạo hình hộp sọ, gia công chính xác theo dữ liệu chụp CT 3D của bệnh nhân.', 'Bằng độc quyền sáng chế số 10568, giải Nhì VIFOTEC. Thay thế hoàn hảo xương sọ bị mất do tai nạn, tương thích sinh học 100%, không bị đào thải.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'PATENT_GRANTED',
    '10568',
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-MAT', 'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', '/images/products/nacentech/mat-mieng-va-so-cpeek.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '9fd8dd13-764d-52ab-bcb0-fced31a2e3cd', 'OFF-MAT-002', 'PRODUCT', false,
    'Ống chân giả compozit siêu nhẹ độ bền cao', 'Vật liệu polymer compozit cấu trúc rỗng siêu nhẹ chịu lực uốn gập lớn phục vụ lắp ráp chi dưới cho người khuyết tật vận động.', 'Bằng độc quyền sáng chế số 5673. Độ bền cơ lý cao, trọng lượng nhẹ bằng 1/3 kim loại, giúp thương binh và người khuyết tật đi lại dễ dàng.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'PATENT_GRANTED',
    '5673',
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-MAT', 'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', '/images/products/nacentech/mat-ong-chan-gia.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '74de7a19-c884-54bc-8795-e9db1ddda9ab', 'OFF-MAT-003', 'DEVICE', true,
    'Xuồng compozit sandwich 3 lớp tuần tra & cứu nạn', 'Công nghệ chế tạo xuồng vỏ compozit sandwich 3 lớp lõi tổ ong chất lượng cao cho an ninh quốc phòng và phòng chống lụt bão.', 'Giải Ba VIFOTEC. Xuồng nhẹ, vận tốc cao, kết cấu chống lật, không bị ăn mòn trong môi trường nước biển và hóa chất độc hại.',
    'LV12', 'Xây dựng – vật liệu – hạ tầng', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-MAT', 'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', '/images/products/nacentech/mat-xuong-compozit.jpeg', '{"/images/products/nacentech/mat-xuong-compozit_g1.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '90e47c15-b989-5374-8989-0f0358f91686', 'OFF-MAT-004', 'PRODUCT', false,
    'Sơn chống cháy cách nhiệt phồng nở cho kết cấu thép & gỗ', 'Màng sơn phồng nở tạo lớp bọt xốp cách nhiệt dày khi nhiệt độ vượt 200°C, bảo vệ khung thép nhà xưởng chịu lửa từ 90 đến 120 phút.', 'Ngăn ngừa sập đổ công trình khi có hỏa hoạn, đáp ứng trọn vẹn quy chuẩn nghiệm thu PCCC QCVN 06:2022/BXD.',
    'LV12', 'Xây dựng – vật liệu – hạ tầng', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-MAT', 'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', '/images/products/nacentech/mat-son-chong-chay.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'a4b3a5df-004b-5d8b-900c-9da5daba3936', 'OFF-MAT-005', 'PRODUCT', true,
    'Sơn hấp thụ sóng radar & Vật liệu phủ bảo vệ đặc biệt', 'Lớp phủ nanocompozit có tính năng triệt tiêu và tán xạ sóng radar trong các dải tần X, Ku phục vụ trang thiết bị quốc phòng.', 'Tăng cường khả năng ngụy trang tàng hình của khí tài quân sự trước hệ thống trinh sát vô tuyến điện tử đối phương.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 7, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-MAT', 'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', '/images/products/nacentech/mat-son-radar.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '3dbed1ff-1077-5749-ac8f-3b1238560fd2', 'OFF-MAT-006', 'PRODUCT', true,
    'Vật liệu hấp phụ xử lý asen và kim loại nặng trong nước ngầm', 'Hạt vật liệu oxit kim loại kích thước nano diện tích bề mặt riêng lớn, hấp phụ chọn lọc Asen (As), Chì (Pb), Thủy ngân (Hg) trong nguồn nước sinh hoạt.', 'Loại bỏ hoàn toàn Asen độc hại trong giếng khoan nông thôn, giá thành thấp hơn 40% so với hạt nhập khẩu từ Mỹ/Đức.',
    'LV11', 'Nước – môi trường – chất thải', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'UTILITY_MODEL',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-MAT', 'Trung tâm Công nghệ Vật liệu - Viện Ứng dụng Công nghệ', '/images/products/nacentech/mat-hap-phu-asen.png', '{"/images/products/nacentech/mat-hap-phu-asen_g1.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '07a6560f-c928-51b4-8631-fd7966d3a457', 'OFF-CFOC-001', 'DEVICE', false,
    'Máy quét 3D quang học độ chính xác cao Made in Vietnam', 'Thiết bị quét số hóa 3D quang học dựa trên nguyên lý ánh sáng cấu trúc, thu thập đám mây điểm hàng triệu điểm/giây, độ chính xác dưới 0.02mm.', 'Phục vụ thiết kế ngược (Reverse Engineering), kiểm tra kích thước hình học chi tiết khuôn mẫu cơ khí chính xác và bảo tồn di sản số.',
    'LV07', 'Cơ khí – chế tạo – công nghiệp hỗ trợ', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'UTILITY_MODEL',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CFOC', 'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/cfoc-may-quet-3d.png', '{"/images/products/nacentech/cfoc-may-quet-3d_g1.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '6ee42756-3b88-5608-8c0c-8dcb4002b52e', 'OFF-CFOC-002', 'DEVICE', true,
    'Thiết kế & Chế tạo hệ thống máy mạ màng mỏng PVD công nghiệp', 'Dây chuyền mạ chân không PVD (Physical Vapor Deposition) công suất lớn, tự động hóa điều khiển chu trình mạ màng cứng và mạ trang trí.', 'Doanh nghiệp trong nước làm chủ công nghệ chế tạo buồng mạ chân không cao, giảm 50% chi phí đầu tư mua máy từ nước ngoài.',
    'LV07', 'Cơ khí – chế tạo – công nghiệp hỗ trợ', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CFOC', 'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/cfoc-may-ma-pvd.jpg', '{"/images/products/nacentech/cfoc-may-ma-pvd_g1.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'ff316d51-3da8-5920-b28e-7779626724ed', 'OFF-CFOC-003', 'PRODUCT', true,
    'Màng phủ giảm phản xạ dải hồng ngoại (3-5µm) cho thấu kính Si & Ge', 'Công nghệ chế tạo lớp màng mỏng quang học dải trung hồng ngoại cho thấu kính Silic và Germanium có độ truyền qua cao > 95%.', 'Phục vụ chế tạo kính ngắm nhiệt, camera ảnh nhiệt ban đêm cho an ninh quốc phòng và trinh sát mục tiêu.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CFOC', 'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/cfoc-mang-phu-quang-hoc.jpg', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'c490026d-be13-5c39-969d-ca68b548d7c3', 'OFF-CFOC-004', 'SOLUTION', false,
    'Dịch vụ mạ màng cứng Nitride (TiN, ZrN, CrN) & Mạ PVD trên nhựa', 'Dịch vụ gia công phủ bề mặt chống mài mòn cho mũi khoan, dao phay, khuôn dập và mạ màu trang trí vàng gold titan trên đồ gia dụng, thiết bị vệ sinh.', 'Tăng tuổi thọ dao cụ cắt gọt lên gấp 4-6 lần, bề mặt mạ bóng đẹp bền bỉ, không độc hại thân thiện môi trường so với mạ hóa chất truyền thống.',
    'LV07', 'Cơ khí – chế tạo – công nghiệp hỗ trợ', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CFOC', 'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/cfoc-ma-tin-gia-dung.jpg', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'ed324cff-aba7-5c39-b3dc-0062214162cf', 'OFF-CFOC-005', 'DEVICE', true,
    'Robot tự dẫn đường công nghiệp (AGV) nhà máy thông minh', 'Xe tự hành AGV tải trọng đến 500kg, dẫn đường bằng cảm biến từ trường/laser kết hợp thuật toán tránh vật cản tự động.', 'Tự động hóa vận chuyển vật tư linh kiện giữa các chuyền sản xuất, cắt giảm 70% nhân công bốc xếp thủ công.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 7, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CFOC', 'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/cfoc-robot-agv.png', '{"/images/products/nacentech/cfoc-robot-agv_g1.png"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'c3e4c3b9-024e-5fec-b3ff-2256827d95c3', 'OFF-LAS-001', 'DEVICE', false,
    'Máy Laser bán dẫn trị liệu & phục hồi chức năng', 'Thiết bị y tế sử dụng laser bước sóng đỏ và hồng ngoại công suất thấp kích thích sinh học, giãn mạch, tăng tuần hoàn máu.', 'Điều trị đau cột sống, viêm khớp, phục hồi chức năng sau tai biến và chấn thương thể thao không cần phẫu thuật.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-LASER', 'Trung tâm Công nghệ Laser - Viện Ứng dụng Công nghệ', '/images/products/nacentech/laser-tri-lieu.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '33ded5ef-576e-5cd8-8572-6c5465d7e193', 'OFF-LAS-002', 'DEVICE', false,
    'Máy Laser phẫu thuật CO2 công suất cao chuyên dụng', 'Hệ thống máy laser CO2 bước sóng 10.6µm phát xung siêu ngắn, tích hợp tay cầm phẫu thuật vi điểm scanner tạo hình thẩm mỹ.', 'Cắt đốt tổn thương da không chảy máu, vô trùng tức thì, giảm sẹo xấu trong phẫu thuật ngoại khoa, phụ khoa và da liễu.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-LASER', 'Trung tâm Công nghệ Laser - Viện Ứng dụng Công nghệ', '/images/products/nacentech/laser-co2-phau-thuat.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'bb32ffb6-840c-5517-b646-c09244a01ab8', 'OFF-LAS-003', 'SOLUTION', true,
    'Hệ thống thiết bị laser mô phỏng bắn tập súng bộ binh', 'Thiết bị phát chùm laser xung gắn đầu nòng súng AK-47 kết hợp áo giáp cảm biến và bia điện tử ghi điểm tự động.', 'Huấn luyện bắn chiến thuật bộ binh chân thực, tiết kiệm hàng tỷ đồng đạn thật và đảm bảo an toàn tuyệt đối cho bộ đội.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-LASER', 'Trung tâm Công nghệ Laser - Viện Ứng dụng Công nghệ', '/images/products/nacentech/laser-mo-phong-ban-sung.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '96f689b2-5389-5a68-af7a-5a1859c6f428', 'OFF-LAS-004', 'DEVICE', true,
    'Trạm quan sát giám sát 3 kênh an ninh - quốc phòng TQS-25-3', 'Hệ thống khí tài tích hợp camera zoom quang dải rộng ban ngày, kênh kính ngắm hồng ngoại ban đêm và máy đo cự ly laser chính xác.', 'Giám sát tuần tra đường biên giới, bờ biển và khu vực mục tiêu trọng yếu 24/7 trong mọi điều kiện thời tiết sương mù, đêm tối.',
    'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-LASER', 'Trung tâm Công nghệ Laser - Viện Ứng dụng Công nghệ', '/images/products/nacentech/laser-tram-quan-sat.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '1ad3ef98-3d9a-5b31-80fd-a6d50d6f30d6', 'OFF-CEB-001', 'PRODUCT', false,
    'Tảo xoắn Spirulina sinh khối dạng viên nang và cốm dinh dưỡng', 'Sản phẩm thực phẩm bảo vệ sức khỏe từ sinh khối vi tảo Spirulina platensis giàu protein (hơn 65%), acid amin thiết yếu và chất chống oxy hóa phycocyanin.', 'Tăng cường miễn dịch, phục hồi thể trạng cho người suy nhược, trẻ em suy dinh dưỡng và người cao tuổi.',
    'LV05', 'Chế biến thực phẩm – đồ uống', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CEB', 'Trung tâm Sinh học Thực nghiệm (CEB) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/ceb-tao-spirulina.jpg', '{"/images/products/nacentech/ceb-tao-spirulina_g1.jpg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'bacf02f7-844a-58a4-a41d-69a2b810e648', 'OFF-CEB-002', 'PRODUCT', false,
    'Nấm Đông trùng hạ thảo (Cordyceps militaris) tươi & sấy đông khô', 'Nấm dược liệu quý nuôi cấy vô trùng trên cơ chất nhộng tằm và hạt gạo lứt, hàm lượng Cordycepin và Adenosine đạt chuẩn y dược.', 'Bồi bổ chức năng gan thận, tăng cường tuần hoàn phổi và hỗ trợ phòng chống lão hóa tế bào.',
    'LV01', 'Nông nghiệp', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CEB', 'Trung tâm Sinh học Thực nghiệm (CEB) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/ceb-dong-trung-ha-thao.jpg', '{"/images/products/nacentech/ceb-dong-trung-ha-thao_g1.jpg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'e05f9e21-5675-59bf-affa-40a6cc0617bc', 'OFF-CEB-003', 'PRODUCT', false,
    'Tinh dầu thảo dược nguyên chất (Trầu không, Bạc hà chiết tách phân đoạn)', 'Tinh dầu nguyên chất 100% chiết xuất từ lá trầu không và bạc hà giống bản địa bằng công nghệ lôi cuốn hơi nước có kiểm soát nhiệt độ.', 'Kháng khuẩn tự nhiên mạnh mẽ, làm sạch đường hô hấp, khử mùi và kháng nấm ngoài da mà không gây tác dụng phụ hóa học.',
    'LV05', 'Chế biến thực phẩm – đồ uống', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CEB', 'Trung tâm Sinh học Thực nghiệm (CEB) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/ceb-tinh-dau-thao-duoc.jpg', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '1c4d42da-0127-5d00-8960-89b0ab5c52c0', 'OFF-CEB-004', 'SOLUTION', false,
    'Dịch vụ kiểm nghiệm mẫu nước, đất, phân bón & Đào tạo thực hành PTN', 'Dịch vụ phòng thí nghiệm phân tích dư lượng kim loại nặng (trên hệ máy quang phổ hấp thụ nguyên tử AAS), vi sinh vật gây hại trong mẫu nước, đất.', 'Đánh giá chính xác chất lượng đất nước cho vùng trồng VietGAP/GlobalGAP, cấp chứng chỉ phân tích mẫu tin cậy cho doanh nghiệp xuất khẩu.',
    'LV11', 'Nước – môi trường – chất thải', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'NONE',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CEB', 'Trung tâm Sinh học Thực nghiệm (CEB) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/ceb-may-aas-kiem-nghiem.jpg', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '67121309-9f88-5507-9ae3-9fe9d1c29a44', 'OFF-CEB-005', 'SOLUTION', true,
    'Chuyển giao quy trình nuôi cấy mô in vitro & Canh tác cây dược liệu', 'Chuyển giao trọn gói quy trình nhân giống vô tính in vitro, quy trình xây dựng nhà kính và kỹ thuật nuôi trồng cây dược liệu quý (Đảng sâm, Sa nhân, Ba kích).', 'Bảo tồn nguồn gen bản địa có nguy cơ cạn kiệt, cung cấp cây giống sạch bệnh đồng đều cho các vùng chuyên canh dược liệu lớn.',
    'LV01', 'Nông nghiệp', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-CEB', 'Trung tâm Sinh học Thực nghiệm (CEB) - Viện Ứng dụng Công nghệ', '/images/products/nacentech/ceb-nuoi-cay-mo-invitro.jpg', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '28b5a5d0-e411-53ec-9a2c-94fdcc9ca875', 'OFF-NHO-001', 'PRODUCT', false,
    'Chế phẩm vi sinh đối kháng Trichoderma Achacomix', 'Chế phẩm sinh học chứa mật độ cao bào tử nấm đối kháng Trichoderma spp., phân giải cellulose và ức chế nấm bệnh hại rễ cây trồng.', 'Đặc trị bệnh vàng lá thối rễ, lở cổ rễ trên hồ tiêu, cao su, cà phê và cây ăn trái; cải tạo đất trồng thoái hóa bạc màu do lạm dụng phân vô cơ.',
    'LV01', 'Nông nghiệp', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-NACENHO', 'Chi nhánh Viện Ứng dụng Công nghệ tại TP.HCM (NACENHO)', '/images/products/nacentech/nho-trichoderma-achacomix.jpeg', '{"/images/products/nacentech/nho-trichoderma-achacomix_g1.jpeg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '329e34f3-de25-5bda-b803-20a6c0aa7f77', 'OFF-NHO-002', 'PRODUCT', true,
    'Chế phẩm vi sinh kháng Vibrio phòng bệnh hoại tử gan tụy trên tôm', 'Chế phẩm vi khuẩn có lợi ức chế cạnh tranh và tiêu diệt vi khuẩn Vibrio parahaemolyticus gây bệnh AHPND nguy hiểm trong ao nuôi tôm.', 'Ngăn chặn hiện tượng tôm chết sớm (EMS), giảm thiểu 90% việc dùng kháng sinh, bảo vệ môi trường ao nuôi thủy sản bền vững.',
    'LV01', 'Nông nghiệp', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-NACENHO', 'Chi nhánh Viện Ứng dụng Công nghệ tại TP.HCM (NACENHO)', '/images/products/nacentech/nho-khang-vibrio-tom.jpeg', '{"/images/products/nacentech/nho-khang-vibrio-tom_g1.jpeg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'e7d36f6a-ae85-5224-b5cc-28acdba01f0a', 'OFF-NHO-003', 'PRODUCT', true,
    'Chế phẩm vi sinh phân giải nhanh dư lượng thuốc bảo vệ thực vật', 'Hỗn hợp các chủng vi sinh vật bản địa có enzyme phân cắt liên kết lân hữu cơ và clo hữu cơ tồn dư trong đất và bùn đáy ao.', 'Giải độc khẩn cấp nguồn nước ao nuôi bị nhiễm độc thuốc sâu rầy trôi xuống từ đồng ruộng, giảm độc tính cho tôm cá.',
    'LV11', 'Nước – môi trường – chất thải', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-NACENHO', 'Chi nhánh Viện Ứng dụng Công nghệ tại TP.HCM (NACENHO)', '/images/products/nacentech/nho-phan-giai-thuoc-bvtv.jpeg', '{"/images/products/nacentech/nho-phan-giai-thuoc-bvtv_g1.jpeg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '525e424d-0668-52e9-a328-c44faa0f9d9d', 'OFF-NHO-004', 'PRODUCT', false,
    'Trà thảo dược túi lọc cây Insulin Ấn Độ (Costus sp.)', 'Sản phẩm trà túi lọc tiện dụng chiết xuất từ cây Insulin Ấn Độ di thực và thuần hóa, dồi dào hoạt chất diosgenin tự nhiên.', 'Hỗ trợ ổn định đường huyết, phòng ngừa các biến chứng nguy hiểm của bệnh tiểu đường type 2 an toàn và tự nhiên.',
    'LV05', 'Chế biến thực phẩm – đồ uống', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 9, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-NACENHO', 'Chi nhánh Viện Ứng dụng Công nghệ tại TP.HCM (NACENHO)', '/images/products/nacentech/nho-tra-insulin.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '160f1f1b-8b40-5699-bbf2-89e7a93b971a', 'OFF-NTB-001', 'SOLUTION', true,
    'Quy trình nhân giống & sản xuất hoa lan Hồ Điệp chất lượng cao bằng đèn LED', 'Quy trình công nghệ chiếu sáng quang phổ LED bổ sung theo chu kỳ sinh trưởng giúp lan Hồ Điệp phân hóa mầm hoa đồng loạt, cánh hoa dày và đậm màu.', 'Chủ động điều khiển thời điểm hoa nở đúng dịp Tết Nguyên Đán, nâng cao giá trị thương phẩm hoa lan chậu Việt Nam.',
    'LV01', 'Nông nghiệp', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-NTBIC', 'Trung tâm Ươm tạo Công nghệ & DN KHCN (NTBIC)', '/images/products/nacentech/ntb-lan-ho-diep-led.jpg', '{"/images/products/nacentech/ntb-lan-ho-diep-led_g1.jpg"}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '47dc76b3-07b3-50fc-b9ab-8f9fd5be606e', 'OFF-NTB-002', 'SOLUTION', true,
    'Quy trình công nghệ nuôi trồng nấm Nữ hoàng (Dictyophora indusiata)', 'Ứng dụng kết hợp công nghệ cơ chất dinh dưỡng tối ưu và chiếu tia cực tím kích thích quả thể nấm Nữ hoàng mọc đồng đều, tạo mạng lưới ren đặc trưng.', 'Làm chủ quy trình nuôi trồng loài nấm quý hiếm giá trị dinh dưỡng và kinh tế hàng đầu, cung ứng cho thị trường ẩm thực cao cấp.',
    'LV01', 'Nông nghiệp', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-NTBIC', 'Trung tâm Ươm tạo Công nghệ & DN KHCN (NTBIC)', '/images/products/nacentech/ntb-nam-nu-hoang.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    'd66abcf2-d9a7-52c8-9a88-d85903fe89bc', 'OFF-LAB-001', 'SOLUTION', true,
    'Hệ thống kiểm tra khuyết tật sản phẩm tự động bằng thị giác máy', 'Hệ thống Machine Vision tích hợp camera công nghiệp độ phân giải cao và thuật toán AI Deep Learning phát hiện nứt, xước, sai lệch kích thước chi tiết.', 'Kiểm tra 100% sản phẩm trên băng chuyền tốc độ cao, thay thế mắt người mệt mỏi, đưa tỷ lệ sót lỗi về dưới 0.01%.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 8, 'TRADE_SECRET',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-LABS', 'Khối PTN Nghiên cứu Chuyên sâu (Tự động hóa & MEMS Hòa Lạc)', '/images/products/nacentech/lab-thi-giac-may.png', '{}',
    now(), now(), now()
);
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, currency, developer_origin,
    trl_level, ip_status, ip_registration_number, commercial_status, contact_point_role,
    status, managing_authority_id, managing_authority_name, legal_consent,
    enterprise_tax_code, enterprise_name, main_image_url, gallery_image_urls,
    created_at, published_at, updated_at
) VALUES (
    '57fae4f4-73f1-5826-9e52-f7e6cd5e4873', 'OFF-LAB-002', 'PRODUCT', true,
    'Cảm biến điện hóa in (Cost effective printed sensors) kiểm tra thực phẩm', 'Điện cực cảm biến vi cơ điện tử in trên màng mỏng polymer giá thành thấp, đo biến thiên dòng điện khi tiếp xúc dư lượng hóa chất thực phẩm.', 'Sản phẩm của PTN MEMS Hòa Lạc. Cho phép kiểm tra nhanh an toàn thực phẩm tại chỗ trong 3 phút, chi phí chỉ bằng 1/10 que test nhập khẩu.',
    'LV08', 'Điện – điện tử – tự động hóa', 'CONTACT', 'VND',
    'Viện Ứng dụng Công nghệ (NacenTech)', 7, 'PATENT_PENDING',
    NULL,
    'COMMERCIALLY_READY', 'Đầu mối Chuyển giao Công nghệ', 'APPROVED',
    'VN-HN', 'Sở Khoa học và Công nghệ TP. Hà Nội', true,
    '0100109968-LABS', 'Khối PTN Nghiên cứu Chuyên sâu (Tự động hóa & MEMS Hòa Lạc)', '/images/products/nacentech/lab-cam-bien-mems.jpg', '{"/images/products/nacentech/lab-cam-bien-mems_g1.jpg"}',
    now(), now(), now()
);

COMMIT;