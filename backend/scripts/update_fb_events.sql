-- Cập nhật và bổ sung các sự kiện thực tế từ Fanpage chính thức của Hiệp hội BACLINK

UPDATE content.techmart_events
SET banner_url = '/events/baclink-event-2.jpg'
WHERE id = 'bac10000-0000-4000-8007-000000000001';

UPDATE content.techmart_events
SET banner_url = '/events/baclink-event-4.jpg'
WHERE id = 'bac10000-0000-4000-8007-000000000002';

UPDATE content.techmart_events
SET banner_url = '/events/baclink-event-6.jpg'
WHERE id = 'bac10000-0000-4000-8007-000000000003';

INSERT INTO content.techmart_events (
    id, title, description, location,
    start_date, end_date, status, technologies_count,
    pdf_brochure_url, banner_url, version, created_at, updated_at
)
VALUES
(
    'bac10000-0000-4000-8007-000000000004',
    'BACLINK Hợp Tác Kết Nối Ngành Bán Dẫn Với Hiệp Hội AI – Bán Dẫn Fabless Hàn Quốc (KAISA)',
    'Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK) tổ chức hội đàm cấp cao và ký kết thỏa thuận hợp tác chiến lược với Hiệp hội AI – Bán dẫn Fabless Hàn Quốc (KAISA). Thúc đẩy đào tạo kỹ sư thiết kế vi mạch, thu hút dòng vốn đầu tư bán dẫn từ Hàn Quốc vào các KCN Bắc Ninh và hỗ trợ doanh nghiệp phụ trợ tham gia chuỗi cung ứng vi điện tử toàn cầu.',
    'Khách sạn Grand Phoenix, TP. Bắc Ninh',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '8 hours',
    'UPCOMING',
    35,
    '/docs/baclink-kaisa-mou-2026.pdf',
    '/events/baclink-event-1.jpg',
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8007-000000000005',
    'BACLINK & KAISA Thúc Đẩy Kết Nối Chuỗi Giá Trị Bán Dẫn & Đóng Gói Vi Mạch',
    'Diễn đàn chuyên đề kết nối kinh doanh B2B trực tiếp giữa các doanh nghiệp hội viên BACLINK và các tập đoàn công nghệ hàng đầu Hàn Quốc thuộc mạng lưới KAISA, tập trung vào lĩnh vực thiết kế vi mạch, đóng gói kiểm thử (OSAT) và công nghiệp phụ trợ điện tử cao cấp.',
    'Trung tâm Đổi Mới Sáng Tạo & Triển Lãm Kinh Bắc, TP. Bắc Ninh',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '8 days',
    'UPCOMING',
    42,
    '/docs/baclink-semiconductor-forum.pdf',
    '/events/baclink-event-3.jpg',
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8007-000000000006',
    'Đại Hội Thành Lập Hiệp Hội Sản Xuất Công Nghiệp Tỉnh Bắc Ninh Khóa I (2025–2028)',
    'Đại hội thành lập Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK) theo Quyết định số 1652/QĐ-UBND của Chủ tịch UBND tỉnh Bắc Ninh. Sự kiện quy tụ hơn 300 đại biểu là lãnh đạo UBND tỉnh, các Sở ban ngành, các tập đoàn FDI và cộng đồng doanh nghiệp sản xuất chế tạo tiêu biểu toàn tỉnh.',
    'Trung tâm Văn hóa Kinh Bắc, TP. Bắc Ninh',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '59 days',
    'CLOSED',
    50,
    '/docs/baclink-dai-hoi-1-ky-yeu.pdf',
    '/events/baclink-event-5.jpg',
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8007-000000000007',
    'Hội Thảo Hợp Lực Xây Dựng Chiến Lược Phát Triển Công Nghiệp Công Nghệ Cao Bắc Ninh',
    'Sở Công Thương tỉnh Bắc Ninh phối hợp cùng Hiệp hội BACLINK tổ chức hội thảo chiến lược: Hợp lực Nhà nước - Doanh nghiệp - Hiệp hội xây dựng chiến lược phát triển công nghiệp gắn với ứng dụng khoa học công nghệ cao và kết nối chuỗi cung ứng FDI.',
    'Hội trường Sở Công Thương tỉnh Bắc Ninh, TP. Bắc Ninh',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days' + INTERVAL '8 hours',
    'CLOSED',
    25,
    '/docs/baclink-so-cong-thuong-hoi-thao.pdf',
    '/events/baclink-event-7.jpg',
    1, NOW(), NOW()
),
(
    'bac10000-0000-4000-8007-000000000008',
    'Diễn Đàn Kết Nối Chuỗi Cung Ứng Toàn Cầu "Go Global" & Chuyển Đổi Xanh Net Zero',
    'Chương trình hỗ trợ kỹ thuật và tư vấn lộ trình chuyển đổi số, chuyển đổi xanh, áp dụng tiêu chuẩn ESG và chứng chỉ trung hòa carbon cho các nhà máy sản xuất công nghiệp phụ trợ trên địa bàn tỉnh Bắc Ninh.',
    'KCN Quế Võ, TX. Quế Võ, Tỉnh Bắc Ninh',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '22 days',
    'UPCOMING',
    30,
    '/docs/baclink-go-global-netzero.pdf',
    '/events/baclink-event-8.jpg',
    1, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    technologies_count = EXCLUDED.technologies_count,
    banner_url = EXCLUDED.banner_url,
    updated_at = NOW();
