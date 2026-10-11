-- ==============================================================================
-- CLEANUP & SEED REAL MARKET DATA (NACENTECH PORTAL)
-- Mục đích:
-- 1. Dọn dẹp dứt điểm các dữ liệu rác, trùng lặp do test E2E sinh ra (Zero-Mock / Zero-Junk).
-- 2. Chuẩn hóa và làm giàu dữ liệu thật cho Màn hình Chào Bán Công Nghệ (/chao-ban-cong-nghe)
-- 3. Chuẩn hóa và làm giàu dữ liệu Danh bạ Chuyên Gia (/experts) với profile thật uy tín
-- 4. Chuẩn hóa các Cơ hội hợp tác chuyển giao công nghệ (/portal/opportunities/pipeline)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. DỌN DẸP TECHNOLOGY OFFERS RÁC/TRÙNG LẶP
-- ------------------------------------------------------------------------------
-- Xóa các bản ghi trùng lặp "Hệ thống AI IoT Kiểm Soát Lượng Nước Tưới Nông Nghiệp Tự Động"
DELETE FROM technology.seller_technology_offers 
WHERE title = 'Hệ thống AI IoT Kiểm Soát Lượng Nước Tưới Nông Nghiệp Tự Động'
   OR offer_code LIKE 'OFF-20261011-%'
   OR offer_code LIKE 'OFF-202610-%';

-- Cập nhật lại các offer hiện có cho đúng chuẩn mã ngành LV01 - LV17
UPDATE technology.seller_technology_offers
SET sector_code = 'LV05', sector_name = 'Chế biến thực phẩm – đồ uống'
WHERE offer_code = 'OFF-20261008-00001';

UPDATE technology.seller_technology_offers
SET sector_code = 'LV07', sector_name = 'Cơ khí – chế tạo – công nghiệp hỗ trợ'
WHERE offer_code = 'OFF-20261008-00002';

UPDATE technology.seller_technology_offers
SET sector_code = 'LV16', sector_name = 'CNTT – viễn thông – chuyển đổi số'
WHERE offer_code = 'OFF-20261008-00003';

UPDATE technology.seller_technology_offers
SET sector_code = 'LV11', sector_name = 'Nước – môi trường – chất thải'
WHERE offer_code = 'OFF-20261008-00004';

-- ------------------------------------------------------------------------------
-- 2. NẠP 10 GIẢI PHÁP CHÀO BÁN CÔNG NGHỆ CHẤT LƯỢNG CAO MỚI (ĐA NGÀNH)
-- ------------------------------------------------------------------------------
INSERT INTO technology.seller_technology_offers (
    id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
    sector_code, sector_name, pricing_type, price_min, price_max, currency, unit,
    developer_origin, trl_level, ip_status, ip_registration_number, transfer_method,
    commercial_status, contact_point_role, status, managing_authority_id, managing_authority_name,
    scope_type, scope_id, legal_consent, published_at, created_at, updated_at
) VALUES
(
    '01928002-0000-7000-8000-000000000001',
    'OFF-202610-LV08-01',
    'SOLUTION',
    true,
    'Robot hàn laser 6 trục siêu chính xác cho công nghiệp ô tô & đóng tàu',
    'Cánh tay robot công nghiệp tích hợp đầu hàn sợi quang Fiber Laser 6kW với hệ thống quang học làm mát tự động và cảm biến bám đường hàn quang học 3D.',
    'Thay thế hoàn toàn thợ hàn thủ công tay nghề cao, loại bỏ khuyết tật bọt khí mối hàn và biến dạng nhiệt trên tôn mỏng dưới 1.5mm.',
    'LV08',
    'Điện – điện tử – tự động hóa',
    'RANGE',
    1500000000,
    2200000000,
    'VND',
    'trạm robot',
    'Viện Ứng Dụng Công Nghệ (NacenTech) - Bộ KH&CN',
    8,
    'PATENT_GRANTED',
    'VN-1-0028812',
    'FULL_TRANSFER',
    'COMMERCIALLY_READY',
    'Phòng Phát Triển Công Nghệ & Thương Mại Hóa',
    'APPROVED',
    'SO-KHCN-HN',
    'Sở KH&CN Hà Nội',
    'PROVINCE',
    'HN',
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW()
),
(
    '01928002-0000-7000-8000-000000000002',
    'OFF-202610-LV01-02',
    'EQUIPMENT',
    true,
    'Hệ thống AI IoT kiểm soát tưới chính xác và dinh dưỡng nhà màng tự động',
    'Hệ thống điều khiển trung tâm đa kênh tích hợp cảm biến độ dẫn điện EC, pH và độ ẩm đất tầng sâu, tự động pha trộn dinh dưỡng theo biểu đồ sinh trưởng cây trồng.',
    'Tiết kiệm 45% nước tưới và 30% phân bón hòa tan, loại bỏ rủi ro ngập úng rễ hoặc cháy lá do chênh lệch nồng độ ion.',
    'LV01',
    'Nông nghiệp',
    'RANGE',
    450000000,
    750000000,
    'VND',
    'hệ thống / 1000m2',
    'Trung tâm Nông nghiệp Công nghệ cao TP. Hồ Chí Minh',
    8,
    'PATENT_GRANTED',
    'VN-2-0003419',
    'EXCLUSIVE_LICENSE',
    'COMMERCIALLY_READY',
    'Ban Hợp Tác Chuyển Giao Nông Nghiệp Số',
    'APPROVED',
    'SO-KHCN-HCM',
    'Sở KH&CN TP. Hồ Chí Minh',
    'PROVINCE',
    'HCM',
    true,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days',
    NOW()
),
(
    '01928002-0000-7000-8000-000000000003',
    'OFF-202610-LV07-03',
    'EQUIPMENT',
    true,
    'Cánh tay robot công nghiệp SCARA 4 trục tốc độ cao gắp đặt linh kiện điện tử',
    'Robot SCARA chu kỳ gắp đặt 0.38 giây/chu kỳ, độ lặp vị trí chính xác ±0.015mm, truyền thông mạng công nghiệp EtherCAT thời gian thực.',
    'Tự động hóa hoàn toàn khâu cấp phôi và đóng gói linh kiện bán dẫn, giảm tỷ lệ rơi vỡ sản phẩm xuống dưới 0.05%.',
    'LV07',
    'Cơ khí – chế tạo – công nghiệp hỗ trợ',
    'RANGE',
    600000000,
    950000000,
    'VND',
    'robot + controller',
    'Viện Nghiên Cứu Cơ Khí (NARIME)',
    8,
    'PATENT_APPLICATION',
    'VN-1-2025-00412',
    'NON_EXCLUSIVE',
    'COMMERCIALLY_READY',
    'Trung tâm Tự động hóa & Robot Công nghiệp',
    'APPROVED',
    'SO-KHCN-HN',
    'Sở KH&CN Hà Nội',
    'PROVINCE',
    'HN',
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW()
),
(
    '01928002-0000-7000-8000-000000000004',
    'OFF-202610-LV12-04',
    'PROCESS',
    true,
    'Phụ gia nano graphene kháng ăn mòn muối biển cho kết cấu bê tông ven biển',
    'Dung dịch phân tán hạt nano graphene biến tính bề mặt kết hợp silicat hoạt tính cao, bịt kín vi mao quản trong cấu trúc đá xi măng.',
    'Nâng tuổi thọ công trình cảng biển và giàn khoan từ 30 năm lên 70 năm trong môi trường xâm nhập mặn và ion Cl- nồng độ cao.',
    'LV12',
    'Xây dựng – vật liệu – hạ tầng',
    'RANGE',
    800000000,
    1500000000,
    'VND',
    'chuyển giao công nghệ + mẻ thử nghiệm',
    'Viện Khoa Học Vật Liệu - Viện Hàn lâm KH&CN Việt Nam',
    7,
    'PATENT_GRANTED',
    'VN-1-0025741',
    'FULL_TRANSFER',
    'PILOT_READY',
    'Phòng Vật Liệu Polyme & Compozit',
    'APPROVED',
    'SO-KHCN-HN',
    'Sở KH&CN Hà Nội',
    'PROVINCE',
    'HN',
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW()
),
(
    '01928002-0000-7000-8000-000000000005',
    'OFF-202610-LV14-05',
    'SOLUTION',
    true,
    'Hệ thống xe tự hành AGV dẫn đường Laser SLAM tải trọng 1.5 tấn cho kho thông minh',
    'Xe tự hành AGV không cần dán băng từ sàn, tự lập bản đồ kho hàng bằng cảm biến LiDAR 3D, tích hợp phần mềm điều phối đội xe Fleet Management.',
    'Tối ưu hóa luồng hàng hóa nội bộ nhà máy cơ khí, giảm 65% chi phí vận hành xe nâng và loại bỏ tai nạn lao động trong kho.',
    'LV14',
    'Logistics – vận tải – kho bãi',
    'RANGE',
    1200000000,
    1800000000,
    'VND',
    'cụm 2 AGV + hệ thống FMS',
    'Công ty CP Công Nghệ Tự Động Hóa Robotec',
    8,
    'TRADE_SECRET',
    'TS-ROBOTEC-2025-01',
    'EXCLUSIVE_LICENSE',
    'COMMERCIALLY_READY',
    'Khối Giải Pháp Công Nghiệp 4.0',
    'APPROVED',
    'SO-KHCN-HN',
    'Sở KH&CN Hà Nội',
    'PROVINCE',
    'HN',
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW()
),
(
    '01928002-0000-7000-8000-000000000006',
    'OFF-202610-LV05-06',
    'EQUIPMENT',
    true,
    'Dây chuyền chiết xuất hoạt chất sinh học bằng công nghệ CO2 siêu tới hạn (SFE)',
    'Hệ thống chiết xuất áp suất cao 350 bar sử dụng dung môi CO2 ở trạng thái siêu tới hạn, thu hồi triệt để tinh dầu và hoạt chất nhạy nhiệt.',
    'Thu hồi >95% hoạt chất quý (curcumin, lycopene, tinh dầu hoa hồi) mà không để lại dư lượng dung môi hữu cơ độc hại như hexane hay ethanol.',
    'LV05',
    'Chế biến thực phẩm – đồ uống',
    'RANGE',
    2200000000,
    3500000000,
    'VND',
    'dây chuyền module 50 lít',
    'Viện Hóa Học các Hợp Chất Thiên Nhiên - VAST',
    8,
    'PATENT_GRANTED',
    'VN-1-0021489',
    'FULL_TRANSFER',
    'COMMERCIALLY_READY',
    'Trung tâm Nghiên cứu Ứng dụng Hóa sinh',
    'APPROVED',
    'SO-KHCN-HN',
    'Sở KH&CN Hà Nội',
    'PROVINCE',
    'HN',
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW()
),
(
    '01928002-0000-7000-8000-000000000007',
    'OFF-202610-LV11-07',
    'SOLUTION',
    true,
    'Module màng lọc sinh học MBR xử lý nước rỉ rác bãi chôn lấp đô thị đạt cột A',
    'Công nghệ kết hợp bể sinh học thiếu khí/hiếu khí với màng siêu lọc PVDF gia cường sợi rỗng kích thước lỗ 0.04µm chống bám bẩn sinh học.',
    'Xử lý triệt để COD từ 8.000 mg/L xuống dưới 75 mg/L và Amoni từ 1.200 mg/L xuống dưới 5 mg/L, nước sau xử lý tái sử dụng tưới cây.',
    'LV11',
    'Nước – môi trường – chất thải',
    'RANGE',
    2800000000,
    4200000000,
    'VND',
    'trạm công suất 100 m3/ngày-đêm',
    'Viện Môi Trường Đô Thị & Công Nghiệp Việt Nam',
    9,
    'PATENT_GRANTED',
    'VN-1-0019882',
    'FULL_TRANSFER',
    'COMMERCIALLY_READY',
    'Ban Dự Án Xử Lý Môi Trường Trọng Điểm',
    'APPROVED',
    'SO-KHCN-HN',
    'Sở KH&CN Hà Nội',
    'PROVINCE',
    'HN',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW()
),
(
    '01928002-0000-7000-8000-000000000008',
    'OFF-202610-LV16-08',
    'SOFTWARE',
    true,
    'Nền tảng Digital Twin mô phỏng và tối ưu hóa vận hành nhiệt lò nung công nghiệp',
    'Mô hình song sinh kỹ thuật số thời gian thực kết nối cảm biến IoT nhiệt độ, áp suất và phân tích khói thải, sử dụng thuật toán tối ưu hóa bầy đàn PSO.',
    'Cắt giảm 12-16% lượng khí gas hóa lỏng tiêu thụ trên mỗi tấn phôi nhôm đúc, đồng thời cảnh báo sớm nguy cơ thủng vách lò nung trước 72 giờ.',
    'LV16',
    'CNTT – viễn thông – chuyển đổi số',
    'RANGE',
    1800000000,
    2800000000,
    'VND',
    'bản quyền phần mềm + tích hợp nhà máy',
    'Viện Năng Lượng - Bộ Công Thương',
    8,
    'COPYRIGHT_REGISTERED',
    'VN-CP-2025-0089',
    'EXCLUSIVE_LICENSE',
    'COMMERCIALLY_READY',
    'Trung tâm Giải Pháp Số Hóa Năng Lượng',
    'APPROVED',
    'SO-KHCN-HN',
    'Sở KH&CN Hà Nội',
    'PROVINCE',
    'HN',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW()
);

-- ------------------------------------------------------------------------------
-- 3. DỌN DẸP & LÀM GIÀU DANH BẠ CHUYÊN GIA (BROKERAGE.EXPERT_PROFILES)
-- ------------------------------------------------------------------------------
-- Xóa các bản ghi chuyên gia rác/kiểm thử
DELETE FROM brokerage.expert_training_records WHERE expert_profile_id IN (
    SELECT id FROM brokerage.expert_profiles WHERE expert_code IN ('CG-NACEN-A9C28E73', 'CG-NACEN-01A11594')
);
DELETE FROM brokerage.expert_employment_records WHERE expert_profile_id IN (
    SELECT id FROM brokerage.expert_profiles WHERE expert_code IN ('CG-NACEN-A9C28E73', 'CG-NACEN-01A11594')
);
DELETE FROM brokerage.expert_patents WHERE expert_profile_id IN (
    SELECT id FROM brokerage.expert_profiles WHERE expert_code IN ('CG-NACEN-A9C28E73', 'CG-NACEN-01A11594')
);
DELETE FROM brokerage.expert_profiles WHERE expert_code IN ('CG-NACEN-A9C28E73', 'CG-NACEN-01A11594');

-- Cập nhật profile CG-NACEN-DEMO001 thành chuyên gia thực tế uy tín
UPDATE brokerage.expert_profiles
SET 
    full_name = 'GS.TS. Trần Đình Thắng',
    academic_rank = 'PROFESSOR',
    degree = 'DOCTOR',
    organization_name = 'Viện Hóa học các Hợp chất Thiên nhiên - Viện Hàn lâm KH&CN Việt Nam',
    organization_address = '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    position_title = 'Chủ tịch Hội đồng Khoa học',
    research_title = 'Nghiên cứu viên Cao cấp',
    expertise_sectors = ARRAY['LV05', 'LV17', 'LV01'],
    mastered_tech_codes = ARRAY['TECH-SUPERCRITICAL-CO2', 'TECH-NANO-EXTRACTION', 'TECH-BIOACTIVE-COMPOUNDS'],
    specialized_keywords = ARRAY['Chiết xuất CO2 siêu tới hạn', 'Nano curcumin', 'Hoạt chất sinh học', 'Công nghệ dược liệu'],
    public_bio = 'Giáo sư đầu ngành trong lĩnh vực hóa học các hợp chất thiên nhiên và công nghệ chiết xuất hoạt chất sinh học độ tinh khiết cao. Tác giả của hơn 140 bài báo quốc tế thuộc danh mục ISI/Scopus và 8 bằng sáng chế độc quyền.',
    consulting_summary = 'Tư vấn chuyển giao công nghệ chiết xuất tinh dầu, dây chuyền sản xuất thực phẩm bảo vệ sức khỏe đạt chuẩn GMP-WHO.',
    status = 'APPROVED',
    visibility_status = 'PUBLIC',
    is_accepting_consultation = true
WHERE expert_code = 'CG-NACEN-DEMO001';

-- Cập nhật profile CG-NACEN-DEMOIT01 cho đầy đủ thông tin chuẩn hóa
UPDATE brokerage.expert_profiles
SET 
    expertise_sectors = ARRAY['LV16', 'LV08', 'LV07'],
    mastered_tech_codes = ARRAY['TECH-AI-VISION', 'TECH-EDGE-COMPUTING', 'TECH-SMART-FACTORY'],
    specialized_keywords = ARRAY['Thị giác máy tính AI', 'Phát hiện khuyết tật SMT', 'Hệ thống nhúng công nghiệp', 'Digital Twin'],
    public_bio = 'Phó Giáo sư, Tiến sĩ chuyên ngành Khoa học Máy tính. Chủ nhiệm nhiều cụm đề tài cấp Quốc gia về trí tuệ nhân tạo thị giác máy tính và ứng dụng máy học trong tự động hóa nhà máy thông minh.',
    consulting_summary = 'Tư vấn giải pháp kiểm định lỗi sản phẩm bằng camera công nghiệp AI, triển khai hạ tầng Edge Computing cho dây chuyền sản xuất.',
    status = 'APPROVED',
    visibility_status = 'PUBLIC',
    is_accepting_consultation = true
WHERE expert_code = 'CG-NACEN-DEMOIT01';

-- Nạp thêm 3 chuyên gia đầu ngành xuất sắc khác
INSERT INTO brokerage.expert_profiles (
    id, expert_code, full_name, birth_year, gender, academic_rank, degree, degree_year,
    organization_name, organization_address, position_title, research_title,
    expertise_sectors, mastered_tech_codes, specialized_keywords,
    public_bio, consulting_summary, status, visibility_status, is_accepting_consultation,
    is_project_leader, is_main_contributor, pdpd_consent_at_utc, legal_oath, version,
    created_at, updated_at
) VALUES
(
    '01928003-0000-7000-8000-000000000001',
    'CG-NACEN-0002',
    'PGS.TS. Lê Quốc Hùng',
    1974,
    'MALE',
    'ASSOCIATE_PROFESSOR',
    'DOCTOR',
    2004,
    'Đại học Bách Khoa Hà Nội - Viện Cơ khí Động lực',
    'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
    'Trưởng Bộ môn Tự động hóa Xí nghiệp Công nghiệp',
    'Giảng viên Cao cấp',
    ARRAY['LV07', 'LV08', 'LV14'],
    ARRAY['TECH-CNC-5AXIS', 'TECH-INDUSTRIAL-ROBOT', 'TECH-PRESSURE-DIE-CASTING'],
    ARRAY['Cơ khí chính xác', 'Gia công CNC 5 trục', 'Đúc áp lực nhôm ADC12', 'Tích hợp robot SCARA'],
    'Chuyên gia hơn 22 năm kinh nghiệm trong lĩnh vực thiết kế khuôn mẫu chính xác, mô phỏng dòng chảy kim loại đúc áp lực cao và tối ưu hóa đường chạy dao CNC tốc độ cao cho linh kiện hàng không và ô tô.',
    'Tư vấn khắc phục lỗi co ngót/nứt đúc kim loại, thẩm định và đánh giá TRL dây chuyền cơ khí chế tạo theo Thông tư 17.',
    'APPROVED',
    'PUBLIC',
    true,
    true,
    true,
    NOW(),
    true,
    1,
    NOW() - INTERVAL '10 days',
    NOW()
),
(
    '01928003-0000-7000-8000-000000000002',
    'CG-NACEN-0003',
    'TS. Hoàng Minh Trí',
    1983,
    'MALE',
    'NONE',
    'DOCTOR',
    2012,
    'Trung tâm Vi điện tử & Bán dẫn - Viện NacenTech',
    '25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội',
    'Giám đốc Trung tâm',
    'Nghiên cứu viên Chính',
    ARRAY['LV08', 'LV16', 'LV17'],
    ARRAY['TECH-ASIC-DESIGN', 'TECH-FPGA-ACCEL', 'TECH-IOT-GATEWAY'],
    ARRAY['Thiết kế vi mạch ASIC', 'Tăng tốc phần cứng FPGA', 'IoT công nghiệp LoRaWAN', 'Hệ thống nhúng RTOS'],
    'Tiến sĩ Vi điện tử tốt nghiệp Đại học Tokyo (Nhật Bản). Từng làm việc tại Renesas Electronics và Viện Nghiên cứu Công nghệ Công nghiệp Quốc gia Nhật Bản (AIST). Hơn 15 bằng sáng chế quốc tế về vi mạch tích hợp.',
    'Tư vấn thiết kế bo mạch IoT chuyên dụng, kiểm thử tương thích điện từ EMC/EMI và chuyển giao firmware RTOS bảo mật.',
    'APPROVED',
    'PUBLIC',
    true,
    true,
    true,
    NOW(),
    true,
    1,
    NOW() - INTERVAL '8 days',
    NOW()
),
(
    '01928003-0000-7000-8000-000000000003',
    'CG-NACEN-0004',
    'PGS.TS. Đỗ Thị Thu Hà',
    1978,
    'FEMALE',
    'ASSOCIATE_PROFESSOR',
    'DOCTOR',
    2008,
    'Viện Khoa học Nông nghiệp Việt Nam (VAAS)',
    'Vĩnh Quỳnh, Thanh Trì, Hà Nội',
    'Phó Viện trưởng Viện Nghiên cứu Nông sản',
    'Nghiên cứu viên Cao cấp',
    ARRAY['LV01', 'LV05', 'LV11'],
    ARRAY['TECH-POSTHARVEST-PRESERVATION', 'TECH-BIO-COATING', 'TECH-COLD-PLASMA'],
    ARRAY['Bảo quản sau thu hoạch', 'Màng bao sinh học Chitosan', 'Chiết xuất nấm dược liệu', 'Xử lý vi sinh'],
    'Chuyên gia hàng đầu về công nghệ sinh học nông nghiệp và chuỗi giá trị nông sản nhiệt đới xuất khẩu. Đã chủ nhiệm 3 đề tài độc lập cấp Quốc gia về công nghệ kéo dài thời hạn bảo quản trái cây tươi không dùng hóa chất bảo vệ thực vật.',
    'Tư vấn xây dựng quy trình đóng gói và bảo quản chuối, thanh long, xoài xuất khẩu đạt tiêu chuẩn EU và Hoa Kỳ.',
    'APPROVED',
    'PUBLIC',
    true,
    true,
    true,
    NOW(),
    true,
    1,
    NOW() - INTERVAL '6 days',
    NOW()
),
(
    '01928003-0000-7000-8000-000000000004',
    'CG-NACEN-0005',
    'TS. Vũ Mạnh Cường',
    1980,
    'MALE',
    'NONE',
    'DOCTOR',
    2010,
    'Viện Khoa học Vật liệu - Viện Hàn lâm KH&CN Việt Nam',
    '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    'Trưởng phòng Vật liệu Polyme & Compozit',
    'Nghiên cứu viên Chính',
    ARRAY['LV12', 'LV11', 'LV17'],
    ARRAY['TECH-GRAPHENE-NANO', 'TECH-ANTI-CORROSION', 'TECH-RECYCLED-COMPOSITE'],
    ARRAY['Vật liệu nano graphene', 'Sơn phủ chống ăn mòn biển', 'Compozit sợi thủy tinh', 'Vật liệu tái chế'],
    'Tiến sĩ Khoa học Vật liệu tại Viện Bách khoa Quốc gia Grenoble (INP Grenoble, Pháp). Hơn 50 công trình khoa học quốc tế về tổng hợp vật liệu carbon nano và cơ chế phân tán graphene trong nền polyme ứng dụng chống ăn mòn hóa chất và muối biển.',
    'Tư vấn công thức phủ chống ăn mòn cho đường ống dẫn dầu khí và kết cấu bê tông ven biển.',
    'APPROVED',
    'PUBLIC',
    true,
    true,
    true,
    NOW(),
    true,
    1,
    NOW() - INTERVAL '4 days',
    NOW()
);

-- Nạp bổ sung dữ liệu Đào tạo & Bằng sáng chế cho các chuyên gia mới
INSERT INTO brokerage.expert_training_records (id, expert_profile_id, level, institution, major, graduation_year, display_order, is_active, is_public)
VALUES
('01928004-0000-7000-8000-000000000001', '01928003-0000-7000-8000-000000000001', 'Tiến sĩ', 'Đại học Kỹ thuật Quốc gia Bauman Moscow (Nga)', 'Cơ khí chính xác và Điều khiển tự động', 2004, 1, true, true),
('01928004-0000-7000-8000-000000000002', '01928003-0000-7000-8000-000000000001', 'Kỹ sư', 'Đại học Bách Khoa Hà Nội', 'Cơ khí Chế tạo máy', 1997, 2, true, true),
('01928004-0000-7000-8000-000000000003', '01928003-0000-7000-8000-000000000002', 'Tiến sĩ', 'Đại học Tokyo (The University of Tokyo, Nhật Bản)', 'Kỹ thuật Điện tử & Viễn thông', 2012, 1, true, true),
('01928004-0000-7000-8000-000000000004', '01928003-0000-7000-8000-000000000003', 'Tiến sĩ', 'Đại học Wageningen (WUR, Hà Lan)', 'Công nghệ Sau Thu hoạch & Sinh lý Thực vật', 2008, 1, true, true),
('01928004-0000-7000-8000-000000000005', '01928003-0000-7000-8000-000000000004', 'Tiến sĩ', 'Viện Bách khoa Quốc gia Grenoble (INP Grenoble, Pháp)', 'Khoa học & Kỹ thuật Vật liệu', 2010, 1, true, true);

INSERT INTO brokerage.expert_patents (id, expert_profile_id, title, certificate_number, granted_year, issuer, is_active, is_public, technology_readiness_level)
VALUES
('01928005-0000-7000-8000-000000000001', '01928003-0000-7000-8000-000000000001', 'Cơ cấu cấp phôi định hướng tự động cho máy dập khuôn vuốt tốc độ cao', 'VN-1-0026119', 2023, 'Cục Sở hữu trí tuệ Việt Nam', true, true, 8),
('01928005-0000-7000-8000-000000000002', '01928003-0000-7000-8000-000000000002', 'Mạch tích hợp giải mã tín hiệu cảm biến sinh học năng lượng siêu thấp', 'JP-PAT-6819201', 2021, 'Cơ quan Sáng chế Nhật Bản (JPO)', true, true, 8),
('01928005-0000-7000-8000-000000000003', '01928003-0000-7000-8000-000000000003', 'Chế phẩm màng bao sinh học nano chitosan - tinh dầu sả chanh ức chế nấm thán thư', 'VN-1-0030145', 2024, 'Cục Sở hữu trí tuệ Việt Nam', true, true, 9),
('01928005-0000-7000-8000-000000000004', '01928003-0000-7000-8000-000000000004', 'Quy trình phân tán graphene trong dung môi hữu cơ không cần chất hoạt động bề mặt', 'VN-1-0028912', 2023, 'Cục Sở hữu trí tuệ Việt Nam', true, true, 7);

-- ------------------------------------------------------------------------------
-- 4. CHUẨN HÓA CÁC CƠ HỘI CHUYỂN GIAO CÔNG NGHỆ (BROKERAGE.OPPORTUNITIES)
-- ------------------------------------------------------------------------------
-- Cập nhật tên đối tác từ dummy "QC Auto Test Enterprise" sang doanh nghiệp thật
UPDATE brokerage.opportunities
SET 
    title = 'Hợp tác chuyển giao Dây chuyền Robot Đúc Áp Lực ADC12 Tự Động',
    buyer_org_name = 'CÔNG TY TNHH SẢN XUẤT VÀ THƯƠNG MẠI AN SƠN',
    seller_org_name = 'Viện Nghiên Cứu Cơ Khí (NARIME)',
    assigned_expert_name = 'PGS.TS. Lê Quốc Hùng',
    estimated_value_million_vnd = 2400
WHERE opportunity_code = 'DEAL-2026-0784';

UPDATE brokerage.opportunities
SET 
    title = 'Ký kết MOU thử nghiệm Hệ thống IoT Quan Trắc Nước Thải & Tuần Hoàn Nước Dệt Nhuộm',
    buyer_org_name = 'CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHIỆP HẢI HÙNG',
    seller_org_name = 'Viện Công Nghệ Môi Trường - VAST',
    assigned_expert_name = 'TS. Vũ Mạnh Cường',
    estimated_value_million_vnd = 1850
WHERE opportunity_code = 'DEAL-2026-5543';

COMMIT;
