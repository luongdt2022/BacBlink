-- SEED DATA CHO LMS MODULE (TASK-10)
BEGIN;

DELETE FROM lms.learning_materials WHERE id IN (
  '01940001-0000-7000-8000-000000000001', '01940001-0000-7000-8000-000000000002', '01940001-0000-7000-8000-000000000003', '01940001-0000-7000-8000-000000000004', '01940001-0000-7000-8000-000000000005', '01940001-0000-7000-8000-000000000006'
);
DELETE FROM matching.search_chunks WHERE subject_kind = 'LEARNING_MATERIAL' AND subject_id IN (
  '01940001-0000-7000-8000-000000000001', '01940001-0000-7000-8000-000000000002', '01940001-0000-7000-8000-000000000003', '01940001-0000-7000-8000-000000000004', '01940001-0000-7000-8000-000000000005', '01940001-0000-7000-8000-000000000006'
);


    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/videos/quan-tri-shtt.mp4';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('f2ce2741-2f93-435c-97fa-b6c3457ad6fd', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('453cf748-c32c-484b-a825-60ef508b8105', 'f2ce2741-2f93-435c-97fa-b6c3457ad6fd', 1, 'quan-tri-shtt.mp4', 'lms/videos/quan-tri-shtt.mp4', 'video/mp4', 12776, 'ea2a2a83f04e1d77ded803072b7128cd056a1b1d8e24fbf93a6842c95d6759f9', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/videos/tham-dinh-gia-cong-nghe.mp4';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('54fd108d-029c-411e-92d7-c823b7561586', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('5a0b1683-48bb-45e8-8ac2-dc5af5265b16', '54fd108d-029c-411e-92d7-c823b7561586', 1, 'tham-dinh-gia-cong-nghe.mp4', 'lms/videos/tham-dinh-gia-cong-nghe.mp4', 'video/mp4', 12774, 'e5df4b2e08d0913402ffe8a97d7af2db366ae93fe39fa31e2ce949b5c4fc8dad', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/videos/thuong-mai-hoa-sang-che.mp4';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('6b1a5b7e-810c-4e6a-9d41-68ecd3464a24', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('7ec806b0-7981-4205-85fe-de98f6cc6a75', '6b1a5b7e-810c-4e6a-9d41-68ecd3464a24', 1, 'thuong-mai-hoa-sang-che.mp4', 'lms/videos/thuong-mai-hoa-sang-che.mp4', 'video/mp4', 12776, '6d9da480c26bd23e7d894056787024792e4787fa34c5576a187289daeaa84a59', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/videos/soan-thao-hop-dong-cgc.mp4';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('1e5328f9-cb95-4c19-b7c4-04b3c9e468b3', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('7acc1475-3cb0-433b-8ea6-34226573c1de', '1e5328f9-cb95-4c19-b7c4-04b3c9e468b3', 1, 'soan-thao-hop-dong-cgc.mp4', 'lms/videos/soan-thao-hop-dong-cgc.mp4', 'video/mp4', 12775, '75f92fe0c50d865e90dbd90f3e426e877067f5f430c9d2750b202b3c88570250', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/videos/cap-nhat-thong-tu-bkhcn.mp4';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('052314c7-5e80-4cbc-bb82-89a17e557bd0', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('237bc088-c257-4f94-be01-35bbb9cc14a8', '052314c7-5e80-4cbc-bb82-89a17e557bd0', 1, 'cap-nhat-thong-tu-bkhcn.mp4', 'lms/videos/cap-nhat-thong-tu-bkhcn.mp4', 'video/mp4', 12776, 'e23621be7a50f16f7b5bb275e256ebd6409568e0923c63e6debb31264c88ba9d', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/videos/dinh-gia-tai-san-vo-hinh.mp4';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('7ff27556-9745-4976-b9cd-3dbcc23f86e0', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('d40363d9-e054-4e70-9968-5f6b53b4c38f', '7ff27556-9745-4976-b9cd-3dbcc23f86e0', 1, 'dinh-gia-tai-san-vo-hinh.mp4', 'lms/videos/dinh-gia-tai-san-vo-hinh.mp4', 'video/mp4', 12775, 'c26be5aba60836bbf59b18b9ea0d16ba0860c8a12108ad307c1f78eda7365696', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/docs/infographic-quy-trinh-shtt.pdf';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('bb3fd192-2cab-4703-a68d-19415df5a2ab', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('49413c68-e75a-4019-9ed2-65fdecead8ff', 'bb3fd192-2cab-4703-a68d-19415df5a2ab', 1, 'infographic-quy-trinh-shtt.pdf', 'lms/docs/infographic-quy-trinh-shtt.pdf', 'application/pdf', 313, 'a09326f42c2e7e5e2d964c672fe80193d0a13369bde344036cf0dbaae862b4f5', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/docs/huong-dan-tham-dinh-gia.pdf';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('555359b7-d77f-44a9-a946-9d11a667b28a', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('c6c9ecd2-f604-4a56-ae3d-dfb4513f8806', '555359b7-d77f-44a9-a946-9d11a667b28a', 1, 'huong-dan-tham-dinh-gia.pdf', 'lms/docs/huong-dan-tham-dinh-gia.pdf', 'application/pdf', 313, 'a09326f42c2e7e5e2d964c672fe80193d0a13369bde344036cf0dbaae862b4f5', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/docs/tai-lieu-licensing-quoc-te.pdf';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('c5240ae2-7d02-4f68-b48e-78ca3c730b9e', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('dfd7dd44-3d17-496f-b679-8aabf4cc801a', 'c5240ae2-7d02-4f68-b48e-78ca3c730b9e', 1, 'tai-lieu-licensing-quoc-te.pdf', 'lms/docs/tai-lieu-licensing-quoc-te.pdf', 'application/pdf', 313, 'a09326f42c2e7e5e2d964c672fe80193d0a13369bde344036cf0dbaae862b4f5', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/docs/mau-phieu-tra-cuu-sang-che.docx';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('100c17c5-6461-482e-bd58-56c40a970448', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('971a034c-bd5c-4e1d-bbdb-fad6d2750086', '100c17c5-6461-482e-bd58-56c40a970448', 1, 'mau-phieu-tra-cuu-sang-che.docx', 'lms/docs/mau-phieu-tra-cuu-sang-che.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 93, 'c15a6e5684169fca7f0f73216238d9730ba0f0140db73ce9ce5e34fccdd7ebc2', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/docs/mau-hop-dong-chuyen-giao-cong-nghe.docx';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('ecbbaeea-bf1d-451d-9483-8b13782a9141', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('ed6d1cbb-61dd-40d6-abb9-b6706df4fd16', 'ecbbaeea-bf1d-451d-9483-8b13782a9141', 1, 'mau-hop-dong-chuyen-giao-cong-nghe.docx', 'lms/docs/mau-hop-dong-chuyen-giao-cong-nghe.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 101, 'c8d34234b9c1461f24f55640789d81f2529717f4fdb1507e49bc04604bdce932', NOW())
    ON CONFLICT (id) DO NOTHING;
    

    DELETE FROM dataroom.document_versions WHERE storage_key = 'lms/docs/bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('68e47ebf-371f-4c09-af21-003e88305782', 'PUBLIC', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('fc1a033c-6303-409d-ba8e-3c5f53c7d8c4', '68e47ebf-371f-4c09-af21-003e88305782', 1, 'bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', 'lms/docs/bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 105, '0670dd33f30402ad7bf4d508fe55ba8c96930841a80accf0416c11b135705bce', NOW())
    ON CONFLICT (id) DO NOTHING;
    

INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '01940001-0000-7000-8000-000000000001', 'MAT-202611-0001',
  'Tổng quan Quản trị Sở hữu Trí tuệ cho Doanh nghiệp Khoa học Công nghệ',
  'TYPE_A', 'CN_THONG_TIN', 45,
  '<p>Khóa học nền tảng trang bị tư duy và năng lực quản trị tài sản trí tuệ (IP Management) cho lãnh đạo doanh nghiệp KH&CN và viện trường. Học viên sẽ nắm vững quy trình xác lập quyền, tra cứu sáng chế, bảo hộ kiểu dáng và khai thác thương mại hiệu quả.</p>',
  'lms/videos/quan-tri-shtt.mp4', 'quan-tri-shtt.mp4', 12776,
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '00000000-0000-0000-0000-000000000001', 'TS. Nguyễn Văn Đức', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', '01a111c8-e671-7dfd-992f-67d6534d705a', 'TS. Nguyễn Văn Đức', 'Tiến sĩ', 'Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)', 1, true),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', '01a19bd2-aef8-7599-9233-4ee398ebfb47', 'Nguyễn Phương Đông', 'Kỹ sư', 'Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ', 2, false);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', 1, 'Quyền sở hữu công nghiệp đối với sáng chế được xác lập trên cơ sở nào?', 'Quyết định cấp văn bằng bảo hộ của cơ quan nhà nước có thẩm quyền', 'Sử dụng công khai lần đầu tiên tại hội chợ triển lãm', 'Tự động phát sinh kể từ khi sáng chế được tạo ra', 'Hợp đồng chuyển nhượng quyền sử dụng với đối tác', 'A', 'Theo Luật SHTT, quyền sở hữu công nghiệp đối với sáng chế chỉ được xác lập trên cơ sở quyết định cấp Văn bằng bảo hộ của Cục SHTT.', false),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', 2, 'Thời hạn bảo hộ Bằng độc quyền sáng chế tại Việt Nam là bao nhiêu năm tính từ ngày nộp đơn?', '10 năm', '15 năm', '20 năm (không được gia hạn)', 'Vĩnh viễn', 'C', 'Bằng độc quyền sáng chế có hiệu lực 20 năm tính từ ngày nộp đơn hợp lệ và không được gia hạn.', false),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', 3, 'Điều kiện nào sau đây KHÔNG phải là tiêu chuẩn bảo hộ sáng chế?', 'Có tính mới trên phạm vi toàn thế giới', 'Có trình độ sáng tạo', 'Có khả năng áp dụng công nghiệp', 'Có giá thành sản xuất rẻ hơn sản phẩm cùng loại', 'D', 'Tiêu chuẩn bảo hộ sáng chế gồm 3 điều kiện: Tính mới, Trình độ sáng tạo và Khả năng áp dụng công nghiệp. Giá thành rẻ không phải điều kiện bảo hộ.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', 'PRACTICE_TOOL', 'mau-phieu-tra-cuu-sang-che.docx', 'lms/docs/mau-phieu-tra-cuu-sang-che.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 93, 'c15a6e5684169fca7f0f73216238d9730ba0f0140db73ce9ce5e34fccdd7ebc2', 1),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', 'SUMMARY_SHEET', 'infographic-quy-trinh-shtt.pdf', 'lms/docs/infographic-quy-trinh-shtt.pdf', 'application/pdf', 313, 'a09326f42c2e7e5e2d964c672fe80193d0a13369bde344036cf0dbaae862b4f5', 2);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', 'Cơ sở dữ liệu Sáng chế & Giải pháp hữu ích NacenTech', 'https://nacentech.vn/chao-ban-cong-nghe', 'TECHNOLOGY_ASSET', 1),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000001', 'Danh mục Bài toán ĐMST cần bảo hộ công nghệ', 'https://nacentech.vn/nhu-cau-cong-nghe', 'INNOVATION_DEMAND', 2);


INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '01940001-0000-7000-8000-000000000002', 'MAT-202611-0002',
  'Quy trình Thẩm định Giá Công nghệ theo Tiêu chuẩn Thẩm định giá Việt Nam',
  'TYPE_B', 'TU_DONG_HOA', 75,
  '<p>Chương trình chuyên sâu hướng dẫn các thẩm định viên, chuyên gia định giá và doanh nghiệp áp dụng chuẩn mực Tiêu chuẩn thẩm định giá Việt Nam số 13 về Tài sản vô hình. Phân tích chi tiết phương pháp chi phí, phương pháp so sánh thị trường và phương pháp chiết khấu dòng tiền DCF.</p>',
  'lms/videos/tham-dinh-gia-cong-nghe.mp4', 'tham-dinh-gia-cong-nghe.mp4', 12774,
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '00000000-0000-0000-0000-000000000001', 'GS.TS. Trần Đình Thắng', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000002', 'e528f6c4-1b87-4755-bc83-92d4d64aece2', 'GS.TS. Trần Đình Thắng', 'Giáo sư', 'Viện Hóa học các Hợp chất Thiên nhiên - Viện Hàn lâm KH&CN Việt Nam', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000002', 1, 'Phương pháp nào thường được ưu tiên khi định giá công nghệ đã tạo ra doanh thu ổn định trên thị trường?', 'Phương pháp chiết khấu dòng tiền (DCF - Thu nhập)', 'Phương pháp chi phí tái tạo', 'Phương pháp chi phí thay thế', 'Phương pháp giá trị thanh lý', 'A', 'Phương pháp thu nhập (DCF) phản ánh chính xác nhất tiềm năng kinh tế và dòng tiền tương lai của công nghệ đã đi vào khai thác.', false),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000002', 2, 'Yếu tố TRL (Technology Readiness Level) ảnh hưởng thế nào đến tỷ suất chiết khấu trong định giá công nghệ?', 'TRL càng cao thì rủi ro càng thấp, tỷ suất chiết khấu càng giảm', 'TRL không ảnh hưởng đến tỷ suất chiết khấu', 'TRL càng cao thì tỷ suất chiết khấu càng tăng', 'Chỉ áp dụng với công nghệ TRL 1-3', 'A', 'Mức độ sẵn sàng công nghệ (TRL) cao chứng minh công nghệ đã qua thử nghiệm thực tế, rủi ro thương mại hóa thấp dẫn đến tỷ suất chiết khấu rủi ro thấp hơn.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000002', 'PRACTICE_TOOL', 'huong-dan-tham-dinh-gia.pdf', 'lms/docs/huong-dan-tham-dinh-gia.pdf', 'application/pdf', 313, 'a09326f42c2e7e5e2d964c672fe80193d0a13369bde344036cf0dbaae862b4f5', 1),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000002', 'POLICY_DOC', 'bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', 'lms/docs/bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 105, '0670dd33f30402ad7bf4d508fe55ba8c96930841a80accf0416c11b135705bce', 2);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000002', 'Cổng đánh giá TRL & Thẩm định công nghệ TT17', 'https://nacentech.vn/assessments/tt17', 'TECHNOLOGY_ASSET', 1);


INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '01940001-0000-7000-8000-000000000003', 'MAT-202611-0003',
  'Chiến lược Thương mại hóa Sáng chế & Chuyển giao Công nghệ Quốc tế',
  'TYPE_B_PLUS', 'VAT_LIEU_MOI', 90,
  '<p>Chuyên đề cao cấp đào tạo chuyên gia chuyển giao công nghệ. Hướng dẫn nghệ thuật đàm phán hợp đồng Li-xăng độc quyền/không độc quyền, cơ chế phân chia lợi nhuận Royalty, kiểm toán pháp lý tài sản trí tuệ xuyên biên giới và phòng ngừa tranh chấp quốc tế.</p>',
  'lms/videos/thuong-mai-hoa-sang-che.mp4', 'thuong-mai-hoa-sang-che.mp4', 12776,
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '00000000-0000-0000-0000-000000000001', 'PGS.TS. Lê Quốc Hùng', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000003', '01928003-0000-7000-8000-000000000001', 'PGS.TS. Lê Quốc Hùng', 'Phó Giáo sư', 'Đại học Bách Khoa Hà Nội - Viện Cơ khí Động lực', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000003', 1, 'Hợp đồng Li-xăng độc quyền (Exclusive License) trao quyền gì cho bên nhận li-xăng?', 'Được độc quyền sử dụng sáng chế trong phạm vi lãnh thổ đã thỏa thuận, bên giao li-xăng không được cấp cho bên thứ ba và không được tự sử dụng', 'Được quyền chuyển nhượng vĩnh viễn quyền sở hữu sáng chế', 'Chỉ được sử dụng nội bộ không được bán sản phẩm ra thị trường', 'Bên giao li-xăng vẫn có quyền cấp li-xăng cho doanh nghiệp khác', 'A', 'Li-xăng độc quyền loại trừ quyền sử dụng của cả bên thứ ba lẫn chính chủ sở hữu trong phạm vi lãnh thổ và thời hạn thỏa thuận.', false),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000003', 2, 'Cơ chế thù lao Running Royalty trong hợp đồng chuyển giao thường được tính trên cơ sở nào?', 'Tỷ lệ phần trăm trên doanh thu thuần hoặc lợi nhuận gộp từ sản phẩm áp dụng công nghệ', 'Khoản tiền cố định trả một lần duy nhất', 'Số lượng bằng sáng chế đối tác sở hữu', 'Số giờ chuyên gia tư vấn trực tiếp', 'A', 'Running Royalty tính theo % doanh thu thuần hoặc sản lượng sản phẩm thực tế bán ra.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000003', 'PRACTICE_TOOL', 'tai-lieu-licensing-quoc-te.pdf', 'lms/docs/tai-lieu-licensing-quoc-te.pdf', 'application/pdf', 313, 'a09326f42c2e7e5e2d964c672fe80193d0a13369bde344036cf0dbaae862b4f5', 1),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000003', 'POLICY_DOC', 'mau-hop-dong-chuyen-giao-cong-nghe.docx', 'lms/docs/mau-hop-dong-chuyen-giao-cong-nghe.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 101, 'c8d34234b9c1461f24f55640789d81f2529717f4fdb1507e49bc04604bdce932', 2);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000003', 'Đặt lịch tư vấn chiến lược 1-1 với Chuyên gia', 'https://nacentech.vn/experts/01928003-0000-7000-8000-000000000001?action=consult', 'EXPERT_CONSULTATION', 1);


INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '01940001-0000-7000-8000-000000000004', 'MAT-202611-0004',
  'Hướng dẫn Soạn thảo Hợp đồng Chuyển giao Công nghệ',
  'TYPE_B', 'SINH_HOC', 60,
  '<p>Bản thảo đang biên soạn: Hướng dẫn chi tiết từng điều khoản thiết yếu trong hợp đồng chuyển giao công nghệ sinh học và nông nghiệp công nghệ cao theo Luật Chuyển giao công nghệ 2017.</p>',
  'lms/videos/soan-thao-hop-dong-cgc.mp4', 'soan-thao-hop-dong-cgc.mp4', 12775,
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
  'DRAFT', 1, false, '00000000-0000-0000-0000-000000000001', 'PGS.TS. Đỗ Thị Thu Hà', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000004', '01928003-0000-7000-8000-000000000003', 'PGS.TS. Đỗ Thị Thu Hà', 'Phó Giáo sư', 'Viện Khoa học Nông nghiệp Việt Nam (VAAS)', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000004', 1, 'Hợp đồng chuyển giao công nghệ bắt buộc phải lập thành văn bản không?', 'Bắt buộc phải lập thành văn bản hoặc hình thức tương đương', 'Có thể thỏa thuận bằng lời nói nếu giá trị dưới 100 triệu', 'Chỉ cần thỏa thuận qua email', 'Không bắt buộc hình thức', 'A', 'Luật CGCN quy định hợp đồng chuyển giao công nghệ bắt buộc phải lập thành văn bản.', false);


INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, unpublish_reason, unpublished_at,
  created_by, created_by_name, created_at, updated_at
) VALUES (
  '01940001-0000-7000-8000-000000000005', 'MAT-202611-0005',
  'Cập nhật quy định Thông tư mới của Bộ KH&CN',
  'TYPE_A', 'NANG_LUONG', 50,
  '<p>Bài giảng tổng hợp các điểm mới trong chính sách khuyến khích chuyển giao công nghệ năng lượng tái tạo.</p>',
  'lms/videos/cap-nhat-thong-tu-bkhcn.mp4', 'cap-nhat-thong-tu-bkhcn.mp4', 12776,
  'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
  'UNPUBLISHED', 2, false,
  'Cập nhật quy định Thông tư mới của Bộ KH&CN theo quyết định rà soát văn bản quy phạm pháp luật.',
  NOW() - INTERVAL '3 days',
  '00000000-0000-0000-0000-000000000001', 'Nguyễn Phương Đông', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000005', '01a19bd2-aef8-7599-9233-4ee398ebfb47', 'Nguyễn Phương Đông', 'Kỹ sư', 'Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ', 1, true);

INSERT INTO lms.learning_moderation_logs (id, material_id, action, reason, actor_id, actor_name, occurred_at)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000005', 'UNPUBLISHED', 'Cập nhật quy định Thông tư mới của Bộ KH&CN theo quyết định rà soát văn bản quy phạm pháp luật.', '00000000-0000-0000-0000-000000000001', 'Quản trị viên Hệ thống NacenTech', NOW() - INTERVAL '3 days');


INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '01940001-0000-7000-8000-000000000006', 'MAT-202611-0006',
  'Phương pháp Định giá Tài sản Vô hình trong Startup ĐMST',
  'TYPE_B', 'CN_THONG_TIN', 80,
  '<p>Khóa học thực chiến dành riêng cho các sáng lập viên Startup và quỹ đầu tư mạo hiểm (VC). Hướng dẫn kỹ thuật định giá bằng sáng chế, mã nguồn phần mềm, cơ sở dữ liệu khách hàng và thuật toán AI trong các vòng gọi vốn Seed, Series A.</p>',
  'lms/videos/dinh-gia-tai-san-vo-hinh.mp4', 'dinh-gia-tai-san-vo-hinh.mp4', 12775,
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '00000000-0000-0000-0000-000000000001', 'TS. Nguyễn Văn Đức', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000006', '01a111c8-e671-7dfd-992f-67d6534d705a', 'TS. Nguyễn Văn Đức', 'Tiến sĩ', 'Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000006', 1, 'Mã nguồn thuật toán AI chưa đăng ký bằng sáng chế có thể được bảo vệ dưới hình thức nào?', 'Bí mật kinh doanh (Trade Secret) và Quyền tác giả đối với phần mềm máy tính', 'Bằng độc quyền sáng chế tự động', 'Nhãn hiệu chứng nhận', 'Chỉ dẫn địa lý', 'A', 'Mã nguồn phần mềm và thuật toán được bảo hộ tự động dưới dạng Quyền tác giả và có thể bảo vệ qua Bí mật kinh doanh nếu giữ kín.', false),
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000006', 2, 'Phương pháp Berkus trong định giá startup giai đoạn sớm tập trung vào yếu tố nào?', 'Đánh giá định lượng dựa trên 5 yếu tố giảm thiểu rủi ro của mô hình kinh doanh và đội ngũ', 'Doanh thu thuần 5 năm gần nhất', 'Chi phí máy móc thiết bị nhà xưởng', 'Tài sản thế chấp ngân hàng', 'A', 'Phương pháp Berkus gán giá trị cho 5 yếu tố rủi ro của startup: Ý tưởng cơ bản, Nguyên mẫu sản phẩm, Đội ngũ quản lý, Mối quan hệ chiến lược, Triển vọng bán hàng.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000006', 'PRACTICE_TOOL', 'bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', 'lms/docs/bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 105, '0670dd33f30402ad7bf4d508fe55ba8c96930841a80accf0416c11b135705bce', 1);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '01940001-0000-7000-8000-000000000006', 'Hồ sơ Chuyên gia TS. Nguyễn Văn Đức', 'https://nacentech.vn/experts/01a111c8-e671-7dfd-992f-67d6534d705a', 'EXPERT_CONSULTATION', 1);


    INSERT INTO matching.search_chunks (
      subject_kind, subject_id, chunk_index, text, embedding, title, is_published
    ) VALUES (
      'LEARNING_MATERIAL', '01940001-0000-7000-8000-000000000001', 0,
      'Tổng quan Quản trị Sở hữu Trí tuệ cho Doanh nghiệp Khoa học Công nghệ. Khóa học nền tảng trang bị tư duy và năng lực quản trị tài sản trí tuệ (IP Management) cho lãnh đạo doanh nghiệp KH&CN và viện trường.',
      '[0.008616,-0.032411,0.0494,0.045018,-0.003489,0.017357,-0.030312,-0.02955,-0.022455,0.020431,-0.030539,0.050022,-0.045619,-0.032566,-0.043655,0.028657,-0.014174,-0.003007,-0.018472,0.014592,-0.010205,-0.030976,-0.007417,-0.02078,-0.041325,0.034337,0.019128,0.017497,0.040608,-0.011187,-0.012818,-0.008179,-0.010135,0.017938,-0.052397,-0.003811,0.003725,-0.016404,-0.050767,0.021724,-0.052087,0.006839,-0.036805,-0.049418,-0.033888,-0.046109,-0.037082,0.019629,0.024239,-0.01457,0.016181,-0.002641,-0.000165,0.039913,-0.020037,0.039285,0.020289,0.01948,-0.052458,-0.044164,-0.049693,-0.016376,0.047367,0.039893,0.03595,-0.040468,0.021843,0.029144,0.032837,0.031029,-0.038191,-0.034102,0.031064,0.025294,0.04167,-0.005683,0.041364,-0.038287,0.048537,0.040823,-0.017248,-0.045917,0.005154,0.02009,-0.015888,-0.046985,-0.023501,0.034455,-0.043467,0.046428,-0.026543,-0.031382,-0.041177,0.051075,0.042583,-0.019201,-0.042937,0.016278,0.041152,-0.051804,0.014127,0.037876,-0.004372,0.007367,0.032307,-0.027764,-0.024076,0.017032,0.005557,0.003753,-0.017589,0.046397,-0.022494,0.018994,0.041852,-0.010533,-0.047321,-0.029688,-0.046051,-0.037361,-0.0403,-0.016723,-0.013811,-0.005587,0.017529,0.018762,0.019881,-0.014403,0.017292,0.005289,-0.03955,0.004867,-0.019287,0.018677,0.024928,-0.02753,-0.006888,-0.004789,-0.021566,-0.048788,-0.047822,0.052327,0.025476,-0.006502,0.017696,-0.024528,0.022338,0.047869,0.02901,-0.003699,0.051344,0.044818,-0.046905,-0.009363,-0.005089,-0.023983,0.012365,-0.037858,0.026241,0.037979,-0.046551,0.020398,-0.024848,0.014681,0.020303,0.050614,0.031649,-0.017099,0.024424,-0.037503,0.022683,-0.008797,-0.024933,-0.027765,-0.030072,0.031468,-0.042886,-0.02842,-0.032672,-0.036308,0.024421,0.009273,0.017497,0.042497,-0.005444,-0.049074,-0.032992,0.001758,0.02286,0.044439,0.001189,-0.029009,0.00984,0.04616,-0.017734,0.04577,0.042876,0.008164,-0.002015,-0.039403,-0.041358,-0.048744,0.011826,0.022584,0.052386,0.010882,0.052429,-0.010309,-0.038871,-0.046762,-0.022486,0.003266,0.051625,-0.02153,-0.028117,0.023703,-0.011847,0.0062,-0.037012,0.037509,0.044527,0.027087,0.046262,-0.017781,-0.049647,-0.020715,0.04224,-0.003246,-0.031812,-0.037037,-0.035651,-0.006474,0.045204,0.040762,0.027368,0.027195,-0.032824,0.029467,-0.029303,0.002727,-0.049535,0.041664,-0.039449,0.009839,0.017224,0.015287,0.019358,-0.013877,0.031032,0.046555,0.012433,0.05093,0.037146,-0.047193,0.018226,-0.043376,0.017122,-0.013664,0.037637,-0.048343,0.047409,-0.048474,-0.047069,-0.052815,-0.039767,0.051619,0.035593,0.044256,-0.033304,0.019928,0.031346,0.024095,-0.024458,0.049996,0.024241,0.019572,-0.022877,-0.0109,0.02738,0.001734,-0.001282,0.044565,-0.008443,0.038113,-0.048126,0.003233,0.022616,-0.051954,0.020846,-0.02272,0.013342,0.013089,-0.038604,0.047119,-0.027331,-0.038601,-0.006084,-0.046297,-0.042337,0.027769,-0.042734,0.004385,0.040927,-0.004907,0.033389,0.03507,-0.035617,-0.044967,0.030177,0.0389,0.037477,0.022747,0.001051,0.048618,0.025469,0.027917,0.043704,-0.047303,0.025609,0.008946,-0.051741,-0.025976,0.022937,0.003091,0.006626,-0.022585,0.007104,0.040229,0.050958,0.005558,0.024557,-0.043819,-0.038186,0.00631,0.034664,-0.040416,-0.037435,-1.6e-05,-0.020705,-0.03817,-0.036254,-0.008003,0.031077,-0.034899,0.03248,-0.045163,-0.026459,0.017907,-0.052338,-0.01889,-0.036689,-0.02863,0.041064,-0.036173,0.023357,0.043557,-0.026962,0.038492,-0.019057,0.028954,0.00859,-0.015878,0.040998,0.020789,-0.019197,0.007789,-0.021828,-0.022747,0.046544,0.050485,-0.036324,0.044223,0.022705,-0.051911,-0.041599,-0.006819,0.041136,0.039664,-0.026455,-0.005788,0.045157,-0.030829,-0.041981,-0.009034,0.019184,0.039577,0.040009,-0.051856,-0.034458,-0.039455,0.010172,-0.010002,0.04485,0.012249,0.012187,0.019856,-0.031335,0.041929,0.038347,0.034247,0.029992,-0.034774,-0.047435,-0.014337,0.023032,-0.031774,0.039172,0.037942,0.020884,-0.001687,-0.037115,0.032855,-0.034755,-0.000429,0.027439,0.014389,-0.02804,0.040246,-0.019049,-0.008469,-0.006533,0.02138,-0.048966,0.014684,-0.001307,0.031941,-0.014244,0.00757,0.049649,-0.046899,0.031014,-0.003368,-0.021252,-0.023935,-0.029989,0.036451,-0.031579,0.049076,0.001757,-0.022812,0.030064,0.008626,0.040817,-0.037785,0.020385,-0.050134,-0.033598,-0.009057,-0.019839,-0.023078,0.007359,0.026215,-0.008923,0.000915,0.02993,-0.029079,0.052866,-0.050578,-0.013705,0.034537,-0.028113,-0.01797,-0.034952,0.05036,0.039933,-0.044457,0.004105,-0.036937,-0.05117,-0.029619,0.021523,0.003038,-0.022576,0.008491,-0.04433,-0.016734,-0.042669,0.034431,-0.012455,0.022886,-0.017462,-0.008987,0.00799,-0.025567,0.005014,0.028919,-0.045232,-0.031988,-0.050928,-0.001207,-0.041394,0.002202,-0.035989,0.002744,-0.023151,0.026454,0.033494,0.048782,-0.003899,0.041358,0.038417,-0.017421,0.05099,0.048648,-0.03638,0.026727,0.019898,0.012357,0.022402,-0.023545,0.035487,0.023561,-0.033618,0.049465,0.024772,-0.047169,-0.049658,-0.035116,0.017218,0.023623,0.045789,0.040704,-0.031386,-0.032465,-0.044076,-0.011678,-0.00813,-0.012714,0.034081,0.011996,0.032258,0.038481,0.028162,0.001463,-0.00964,0.003834,-0.004251,0.01792,0.037391,0.01869,-0.026081,0.006831,-0.004706,-0.040029,-0.041885,-0.005216,0.046814,0.021551,-0.047156,0.044241,0.023866,0.010996,-0.052418,-0.020152,-0.017666,-0.001852,-0.040058,0.013777,0.011866,0.01493,-0.000599,0.006102,-0.041077,0.034704,0.039094,0.037306,0.028387,-0.027368,-0.02188,-0.047677,0.030307,0.038198,0.046356,0.010675,0.031749,0.03669,-0.040271,-0.045831,0.039974,0.049964,0.022953,0.012687,-0.011042,0.038053,-0.022825,-0.047335,0.032237,-0.046601,0.022937,0.01594,-0.041381,-0.006722,-0.024178,0.032617,0.029433,-0.018139,-0.036722,-0.016722,-0.006409,0.01122,0.047551,-0.019012,-0.037373,0.013402,-0.007919,0.025591,0.017219,0.005008,0.033539,-0.0323,0.030038,-0.033703,-0.002176,0.005917,0.004628,-0.041188,-0.004335,-0.023313,-0.02371,-0.008345,-0.009169,-0.031163,0.019709,0.045787,0.047565,-0.033944,-0.028473,-0.009887,0.010043,0.020487,0.009489,-0.000741,0.052948,0.048972,0.032251,-0.026341,0.028375,-0.049262,0.047547,0.021369,0.045159,-0.008098,0.022407,-0.026491,0.045161,-0.03414,-0.052141,-0.02335,0.017471,0.003959,0.032619,0.019503,0.029781,0.046976,-0.046053,-0.041849,-0.022459,-0.038898,0.005501,0.023335,-0.033806,-0.00039,-0.026882,-0.05128,-0.024963,-0.024915,0.019948,0.049789,-0.045925,-0.001028,-0.003793,0.013579,-0.037327,0.04845,-0.023847,0.008338,-0.009743,0.006601,0.040399,0.0125,-0.01688,0.048037,-0.034422,0.048755,0.018432,-0.027113,0.051596,0.038859,0.000904,0.032791,-0.043117,-0.023889,-0.002272,0.047132,-0.01386,0.052247,0.008482,0.023157,0.029909,-0.039044,0.044471,0.009907,-0.040112,-0.037045,0.031762,0.006547,0.045381,0.038253,0.005213,-0.00862,0.027821,0.05074,-0.020532,0.002063,-0.040527,-0.048402,-0.046595,-0.01332,0.012475,0.038612,0.026554,0.049254,-0.026,0.037594,-0.019031,-0.01328,0.004616,0.05272,-0.00378,-0.046886,-0.014195,0.007149,0.019449,-0.036786,-0.022873,-0.035425,0.001367,-0.011328,-0.01923,0.000884,0.026896,0.012323,0.024816,-0.010234,0.045249,-0.040689,-0.045423,-0.042838,-0.002065,-0.018609,-0.031999,-0.052308,0.030498,-0.046927,0.013943,0.049474,-0.026319,0.009447,0.040759,-0.006544,0.044537,-0.049399,0.007675,0.029494,-0.000668,0.034958,0.051106,0.03588,-0.002272,0.020309,0.039418,0.013081,-0.048161,-0.031209,0.011743,-0.040833,-0.036208,0.05011,0.000207,0.051901,0.035846,0.030035,-0.008533,-0.028234,-0.046033,-0.029571,-0.000313,0.011558,-0.037147,-0.004603,-0.013968,0.040196,-0.021404,0.035848,0.015316,0.046292,-0.02342,-0.024223,-0.001372,-0.025407,0.010844,0.048068,0.003386,-0.032589,-0.047467,0.013773,-0.005657,-0.052089,-0.014012,0.031632,0.013435,-0.017527,0.048847,0.051156,-0.050237,-0.028941,0.011687,-0.016993,-0.030537,0.032231,0.042806,-0.000792,0.049296,0.008036,0.013744,0.00158,0.031406,0.042648,0.000125,-0.002378,0.031165,0.036251,0.016788,-0.036081,-0.039396,-0.014414,-0.048282,-0.015615,-0.014667,-0.03987,-0.037818,0.014632,0.041497,-0.029754,0.023627,-0.00919,-0.051965,0.045941,-0.041319,-0.001977,-0.051265,-0.023003,-0.015565,-0.012815,0.002241,0.049614,0.011986,-0.005227,0.035362,-0.004753,0.021183,-0.005698,0.026298,-0.04304,-0.034725,0.020983,0.025537,-0.0148,-0.048717,0.011929,-0.041959,-0.011993,0.032686,0.031934,0.034174,-0.041957,0.024638,-0.049901,0.05129,0.025824,0.028986,0.038068,0.034022,0.027773,0.045749,-0.046167,-0.044651,0.021804,-0.040552,0.03217,-0.008996,0.026923,-0.041875,0.005354,0.023184,0.025293,-0.033917,-0.02749,0.036996,0.03074,0.000956,-0.051098,0.023205,0.027083,0.015715,0.050239,0.014145,0.033547,-0.026792,-0.022474,0.050963,0.052995,-0.041679,0.013092,0.019736,0.011689,-0.011868,-0.015568,0.044813,-0.03825,-0.043593,0.026279,-0.051562,-0.012202,0.006326,0.018949,-0.025806,0.014525,0.016628,0.033977,-0.003014,0.045864,-0.005205,0.044194,-0.010901,0.024149,-0.022124,0.013551,0.026568,-0.046543,0.029121,-0.044215,0.030761,-0.037856,-0.027629,-0.019653,-0.025195,0.011436,-0.016022,0.034217,-0.012749,0.029519,-0.019522,0.00324,0.009292,-0.015794,0.030378,0.013422,0.005769,0.017259,-0.028816,-0.019003,0.039864,0.020509,-0.00373,0.052867,0.047052,0.022189,-0.040307,-0.011598,-0.011292,0.006268,-0.021565,-0.003814,0.040985,-0.04129,-0.043815,0.003234,-0.051333,-0.014473,-0.026662,0.028771,-0.033515,0.002652,0.039194,0.018574,-0.011485,-0.033028,0.047323,0.028482,0.020057,-0.02591,-0.027565,0.039525,0.035179,0.035279,-0.020787,0.022896,0.03341,0.042059,0.02262,-0.046141,-0.047441,-0.023111,0.031689,-0.017324,-0.047822,-0.003386,-0.035875,-0.009232,0.021966,0.000296,0.004481,0.00131,0.049136,0.045461,0.00115,-0.040516,0.020877,-0.037692,-0.052077,-0.043091,-0.006404,0.037873]'::vector,
      'Tổng quan Quản trị Sở hữu Trí tuệ cho Doanh nghiệp Khoa học Công nghệ',
      true
    ) ON CONFLICT (subject_kind, subject_id, chunk_index) DO UPDATE
      SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, is_published = true;
    

    INSERT INTO matching.search_chunks (
      subject_kind, subject_id, chunk_index, text, embedding, title, is_published
    ) VALUES (
      'LEARNING_MATERIAL', '01940001-0000-7000-8000-000000000002', 0,
      'Quy trình Thẩm định Giá Công nghệ theo Tiêu chuẩn Thẩm định giá Việt Nam. Chương trình chuyên sâu hướng dẫn các thẩm định viên, chuyên gia định giá và doanh nghiệp áp dụng chuẩn mực Tiêu chuẩn thẩm định giá Việt Nam số 13 về Tài sản vô hình.',
      '[0.028723,0.015759,-0.009857,-0.032863,0.019234,0.051082,-0.007864,0.038192,-0.050498,0.003025,-0.032486,-0.000624,0.01211,0.038741,0.0025,0.040148,-0.018855,-0.040448,-0.003815,0.02343,0.022634,-0.050425,-0.027368,-0.02674,-0.003094,0.039371,-0.024937,-0.04943,0.043327,0.040188,0.029466,-0.050214,-0.026047,-0.035181,0.045171,-0.040843,-0.040547,-0.030408,0.031674,-0.032871,0.052616,-0.020882,0.016336,-0.033539,-0.022634,0.039775,0.05416,-0.028045,-0.016382,-0.048179,-0.033243,-0.012631,0.0023,0.007928,-0.016387,-0.037221,0.006063,-0.016445,-0.016859,0.051509,0.009498,-0.052778,0.049753,0.051127,-0.011982,0.052209,-0.042992,0.045572,-0.036044,0.039625,0.019309,0.04989,-0.021522,0.016755,0.047956,-0.0404,-0.034277,0.006211,-0.039873,-0.048488,-0.052736,-0.016658,0.016323,-0.003716,0.011335,-0.051555,-0.043404,0.007122,-0.037357,-0.05303,-0.047718,0.016532,0.050064,-0.000403,-0.05374,-0.033223,0.019733,0.031855,-0.031998,-0.003539,-0.050473,0.004381,0.027874,-4.5e-05,0.031053,-0.028927,0.018072,-0.003187,0.011276,-0.046499,-0.005019,0.013064,-0.028936,0.005871,-0.052284,-0.00893,0.048025,0.016006,0.000669,0.040392,0.021072,0.000969,-0.013586,0.040683,0.007002,-0.001354,-0.013998,-0.037796,-0.033692,0.01116,0.004061,0.029887,-0.005539,-0.012571,0.006021,-0.027072,0.050242,0.014724,-0.02169,-0.000909,0.037093,0.049079,0.021757,0.04108,0.033379,-0.01444,-0.008945,-0.003799,-0.048758,0.009957,0.00569,0.03125,-0.017428,0.051944,0.025987,0.008584,-0.02965,0.047238,0.01997,0.01458,-0.033335,-0.032853,-0.03306,0.045523,-0.006213,0.021901,0.020871,0.033987,-0.022983,-0.03245,0.050397,-0.039107,0.054404,-0.011308,-0.052091,-0.021666,0.028998,-0.010303,-0.039244,-0.045976,-0.049049,0.007822,-0.014511,0.019362,-0.040731,-0.023496,0.005821,-0.01899,0.021133,-0.026048,0.027292,0.01782,-0.009523,0.022245,-0.016697,0.045768,0.026276,-0.023336,0.038138,0.013882,0.039629,0.022864,0.045067,0.004747,-0.016925,0.025607,0.046412,0.00272,0.023525,0.011418,-0.018228,-0.032609,0.013385,-0.036249,-0.005753,0.02996,-0.012961,-0.007301,0.050674,0.009846,0.004423,-0.033376,0.027079,-0.014329,0.023542,0.049379,0.036094,-0.030386,0.046652,0.018013,-0.035347,-0.049679,-0.027451,0.009198,-0.001637,-0.053936,0.048848,-0.047194,0.036855,-0.000374,0.032555,0.033727,0.021332,-0.013317,0.002021,-0.032237,-0.025832,-0.051987,-0.014686,0.043716,0.023906,-0.04764,-0.017152,-0.006897,0.002479,0.001106,0.036736,-0.033076,0.015289,0.016082,-0.05262,-0.037917,-0.041558,0.012686,0.039027,0.041561,0.036825,0.005241,0.012984,0.017782,-0.021927,-0.001689,-0.039743,-0.018312,-0.01461,0.049734,-0.031625,-0.001252,-0.047932,-0.047775,0.001782,0.009877,0.002644,0.053147,-0.002627,0.013706,0.040937,-0.040454,0.029349,-0.040008,0.041463,0.028283,0.03059,0.039072,-0.049585,-0.045281,-0.008926,-0.047311,0.044749,-0.035209,-0.029151,0.024508,-0.042638,0.039269,-0.016132,0.003881,0.036629,-0.046507,-0.026692,-0.012965,0.022614,-0.022634,-0.008531,-0.031834,0.009696,-0.00884,0.016157,-0.053769,0.006348,0.048353,-0.028312,-0.028659,0.029639,-0.038456,0.001109,-0.009817,-0.036056,-0.018507,0.032478,0.014393,-0.027279,0.009904,0.053895,-0.037291,0.024933,-0.039824,-0.026243,-0.041213,0.008716,0.016928,0.023078,0.010043,0.011027,-0.033729,-0.0256,-0.039844,0.052516,-0.044342,0.037954,-0.012654,0.038873,-0.006725,0.048139,0.025929,0.029882,-0.049083,0.019191,-0.051241,0.011793,-0.012027,-0.038467,-0.002849,-0.020683,-0.003011,0.012751,-0.041812,-0.003372,-0.008487,0.044761,0.047685,-0.024878,-0.014951,-0.004613,-0.01977,0.048546,0.03932,-0.035068,0.036041,0.036929,0.039736,-0.009079,-0.0527,0.021371,-0.034272,0.023859,-0.041924,0.007335,-0.044301,0.009815,-0.028963,-0.048019,0.037975,0.027454,0.01598,-0.01652,-0.01061,0.007281,-0.029984,0.019934,-0.042772,-0.036888,-0.021444,0.000718,0.010407,0.022863,0.008097,-0.007667,0.040144,0.003087,-0.001463,-0.030674,0.026522,-0.048925,0.033015,0.018077,0.054202,0.037952,0.0014,0.020542,-0.012138,-0.021867,0.046738,-0.011101,0.023735,-0.053559,-0.04412,0.037068,0.015244,0.026711,0.011732,-0.037314,-0.001009,0.001697,0.007711,0.052697,-0.005796,0.021922,0.016972,-0.043379,0.051011,-0.009231,0.050066,0.040589,-0.02185,0.010745,0.016762,0.022957,-0.025282,-0.03371,-0.032231,-0.014747,0.050029,-0.008655,0.016617,0.053785,-0.037127,-0.011502,0.048652,-0.014847,0.029544,0.03027,0.052121,-0.043855,-0.015373,0.041061,-0.018262,-0.034066,0.029777,-0.031977,0.017946,0.033332,0.029541,0.023279,-0.023156,0.008268,0.010499,-0.024647,0.029901,0.042953,0.04647,0.001506,0.022228,0.050441,0.005987,-0.008778,-0.020717,-0.047352,0.039373,0.054114,0.004952,0.032601,0.043466,-0.049135,-0.013417,0.004314,0.012572,-0.037374,-0.004837,-0.017145,-0.048371,0.024849,0.029235,0.049312,0.018472,0.032567,0.017709,-0.030908,-0.019346,-0.033413,0.001545,0.033035,0.006155,-0.051005,-0.046022,0.018598,0.012252,0.009851,-0.025032,-0.032603,0.022269,-0.02751,-0.007182,0.025424,-0.043655,0.029775,-0.02956,0.038434,0.031124,0.02526,0.045666,0.04909,0.034251,-0.034352,0.03414,-0.042139,-0.033515,0.037699,-0.01303,0.030124,-0.029297,-0.041571,-0.049298,0.041853,0.039692,0.049709,0.000515,0.02911,-0.012866,-0.038283,-0.027516,0.005893,0.002262,-0.047858,-0.000167,-0.015038,-0.051956,-0.048742,-0.015205,0.053148,0.026676,-0.020867,0.011441,0.050196,-0.001591,-0.048431,0.034729,0.020093,0.035727,0.034893,0.050611,0.029737,-0.027909,-0.051116,-0.029016,-0.007872,-0.023554,-0.002925,-0.02505,0.016988,-0.026688,-0.003456,-0.043709,0.010015,0.048681,0.033658,-0.016754,0.038696,0.035923,-0.005868,0.042373,-0.040796,-0.040831,0.03886,-0.018927,-0.034949,0.024945,-0.019256,-0.04157,-0.017009,-0.018545,0.011491,-0.038135,0.048498,0.007575,-0.024463,-0.005617,0.044544,-0.050385,-0.021142,-0.031109,0.010286,0.050768,0.002681,0.00474,-0.048946,0.020067,-0.042365,-0.032837,0.013927,0.00624,-0.039532,-0.029087,-0.045713,0.046246,0.051887,-0.006357,0.025338,0.046479,0.04777,-0.05267,-0.0342,0.029338,0.037511,-0.021402,-0.04775,-0.018965,0.005542,0.044563,-0.049797,-0.0194,-0.03521,-0.038516,-0.017879,0.030642,-0.017954,-0.042136,0.048665,-0.052096,-0.024044,0.050606,-0.007589,-0.029177,0.02003,-0.016228,0.011594,-0.023122,-0.015244,0.02591,0.024464,0.014618,0.023363,-0.02134,-0.029202,-0.041876,-0.021477,0.006994,-0.040988,-0.049361,-0.012864,-0.012823,-0.009929,0.029325,-0.032927,0.022934,-0.007171,-0.024352,0.051242,-0.010285,-0.000568,0.022943,-0.039826,0.013607,-0.051762,-0.017671,-0.00915,-0.010263,-0.045971,0.042756,-0.035748,0.0208,-0.044829,0.034944,0.01349,-0.024962,-0.007971,0.005152,-0.053693,-0.00414,-0.030137,-0.015844,0.04809,-0.048164,-0.015859,-0.043587,0.03432,-0.002955,-0.011933,0.028075,0.036409,0.04745,0.042644,-0.040572,-0.000901,0.003355,0.022797,-0.022443,-0.037877,-0.001629,0.039792,0.052257,0.019728,-0.051918,0.01963,-0.006882,0.033614,0.045489,0.003473,0.034771,0.03339,0.053566,0.050645,-0.015167,-0.014872,0.041609,0.048323,-0.019633,0.048546,0.006056,-0.046574,0.036049,0.028517,0.026349,0.006055,-0.024191,-0.035097,-0.014693,-0.026097,-0.011972,-0.032446,0.022139,0.038375,0.007468,-0.001131,-0.051291,-0.053883,-0.035249,0.036845,0.038553,-0.00874,0.035655,0.031945,0.050808,0.02131,0.040247,-0.014312,-0.043109,0.05017,-0.043599,-0.054005,-0.007855,0.040768,0.050442,-0.003793,-0.028062,-0.031592,0.032023,-0.007666,-0.033967,-0.003219,-0.024259,0.045285,0.049708,0.050688,0.017394,0.024298,-0.021508,0.017867,-0.025881,-0.03712,0.031785,-0.014755,-0.005778,-0.024625,-0.012486,-0.036297,0.017171,-0.029019,-0.050599,-0.010173,-0.011999,-0.021817,0.039565,0.006977,0.000479,-0.039139,-0.022163,0.040694,-0.037171,0.009308,-0.025497,-0.030392,0.002714,-0.006099,-0.019732,0.015209,-0.017623,-0.049479,-0.023034,0.048503,-0.021536,-0.014914,0.000366,0.000711,0.035857,-0.004438,-0.026138,0.037788,-0.022621,-0.026857,-0.050208,-0.004629,-0.045332,0.049118,0.017136,-0.009742,-0.041452,-0.052804,-0.011593,-0.009101,-0.024945,-0.013551,0.03273,-0.011729,0.009109,0.027302,-0.034844,-0.040777,0.004529,-0.048564,0.009434,-0.00119,0.013994,2.9e-05,-0.046095,0.002547,0.010168,-0.036517,-0.020514,-0.036317,0.023632,-0.011176,0.037514,-0.034795,-0.016047,-0.000418,0.008784,-0.025774,-0.006988,-0.012134,0.020664,-0.037054,0.041622,-0.019133,0.04618,-0.020781,0.0153,-0.032858,-0.024685,0.044608,0.054347,0.002486,-0.04838,0.03094,0.015561,-0.042998,-0.04782,0.039097,-0.053794,-0.011945,-0.026283,-0.038331,-0.050601,0.048904,-0.001917,0.053136,0.030661,0.04415,0.046363,-0.017578,-0.025366,-0.052096,0.027161,0.004417,-0.051985,-0.045596,-0.031534,0.01886,0.040488,0.042466,0.01239,0.007079,0.014852,-0.053071,-0.003478,-0.025811,0.016624,0.028657,0.048306,-0.004447,-0.011853,0.044085,0.031767,0.018405,0.045332,0.034577,-0.025708,0.002194,0.020674,-0.014854,0.006964,-0.005928,-0.039225,0.047078,0.003076,-0.054193,0.040083,-0.02912,-0.032342,-0.011788,-0.045807,0.044026,0.003775,-0.051572,0.014868,0.044539,-0.034398,-0.022288,-0.046618,0.028676,-0.046856,-0.013123,-0.001749,0.002156,0.011743,-0.009691,0.011955,-0.042779,0.017885,0.046735,-0.007205,-0.044548,0.034405,0.049613,-0.016308,0.028932,0.009064,-0.028315,-0.008822,0.010684,-0.054062,-0.031806,-0.018483,0.043671,0.022838,0.010163,-0.046925,-0.018111,-0.013871,-0.006395,-0.00608,0.021205,0.00282,0.017927,0.003994,0.004924,-0.049823,0.051332,0.04893,-0.018197,0.003763,0.024171,-0.039885,-0.02632,0.025313,-0.0495,0.024059,-0.015465,-0.033745,-0.00467,0.012148,-0.002008,0.046043,0.016931,-0.003215,0.023757,-0.049813,0.041482,0.035626,0.020906,-0.019825,-0.016828,0.023105,-0.028128,-0.004413,0.002524,-0.007708,0.03042,-0.004488,-0.041023,0.041598,0.035285,-0.00598,-0.0366,-0.002131]'::vector,
      'Quy trình Thẩm định Giá Công nghệ theo Tiêu chuẩn Thẩm định giá Việt Nam',
      true
    ) ON CONFLICT (subject_kind, subject_id, chunk_index) DO UPDATE
      SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, is_published = true;
    

    INSERT INTO matching.search_chunks (
      subject_kind, subject_id, chunk_index, text, embedding, title, is_published
    ) VALUES (
      'LEARNING_MATERIAL', '01940001-0000-7000-8000-000000000003', 0,
      'Chiến lược Thương mại hóa Sáng chế & Chuyển giao Công nghệ Quốc tế. Chuyên đề cao cấp đào tạo chuyên gia chuyển giao công nghệ. Hướng dẫn nghệ thuật đàm phán hợp đồng Li-xăng độc quyền/không độc quyền, cơ chế phân chia lợi nhuận Royalty.',
      '[-0.050372,0.050422,-0.032814,0.053175,0.048049,-0.025955,0.00175,-0.01094,-0.009711,0.031157,0.035249,-0.026185,0.004723,0.020006,0.010096,-0.040714,-0.011712,-0.000766,0.045614,0.034679,0.018803,-0.023642,0.047188,-0.029124,-0.017442,-0.036894,0.009573,0.031797,0.021706,0.035192,0.021772,0.016472,-0.026728,0.049316,0.052753,0.025021,0.053453,0.041253,0.040577,0.027622,0.033537,0.020545,-0.040049,0.036279,-0.015873,0.015452,0.042949,-0.000721,-0.024692,0.005735,0.040411,0.036659,0.053116,0.043863,0.032789,-0.001629,-0.034128,0.046548,-0.049641,0.048082,0.014978,-0.02839,-0.035922,0.023333,-0.046002,-0.007416,-0.042303,-0.039271,-0.026735,0.016421,-0.050881,0.038036,0.014006,-0.025992,0.023068,-0.046996,-0.026524,0.000421,0.038099,0.018846,-0.049502,0.04935,-0.037215,-0.03393,0.008372,-0.046205,-0.009578,-0.031024,-0.005314,-0.0162,-0.008508,-0.017209,-0.002167,0.016912,-0.008572,0.003102,-0.021871,-0.011039,-0.045405,-0.004525,0.00045,-0.036624,-0.019644,0.006063,-0.001506,0.014098,-0.026255,0.034405,-0.037766,0.045105,-0.017184,-0.024759,-0.017649,0.048049,0.020847,0.047712,0.052811,-0.003848,0.032586,-0.049053,0.03364,-0.026242,-0.017836,0.018342,0.000938,0.005567,-0.019325,-0.011512,0.045151,-0.050943,-0.051558,0.015439,-0.044909,-0.02621,-0.024539,-0.050961,-0.011829,0.050924,0.03875,-0.049267,0.052595,0.043284,0.038587,-0.034687,-0.019625,-0.03652,0.025566,0.023445,-0.024039,0.049431,0.024453,0.023033,-0.008214,0.038381,0.005302,0.030014,0.044545,-0.046158,-0.04866,-0.028383,0.045419,-0.018401,-0.013199,0.005997,0.005183,-0.005437,0.034274,-0.003907,0.028547,-0.039163,0.02687,-0.003738,0.000839,-0.039269,0.039791,-0.038425,0.028375,0.002324,-0.052578,0.04913,0.026736,-0.042894,-0.034592,0.046898,-0.004964,0.007433,-0.008689,-0.053189,-0.045681,-0.024802,-0.040132,-0.010199,-0.011673,0.028295,-0.050553,0.017945,-0.026891,0.01361,-0.01708,-0.045814,0.023742,-0.046389,0.034026,-0.018881,-0.041581,0.009789,0.018537,0.052566,-0.030616,-0.043298,0.045672,-0.024732,0.013397,0.007057,0.051827,0.010112,0.033492,-0.033788,0.031752,-0.001813,0.028307,0.014672,-0.038914,-0.010434,0.012189,-0.033462,-0.018937,-0.022455,-0.004332,0.04067,0.047507,0.015285,0.018779,0.046959,0.03891,0.008095,-0.049858,-0.016552,-0.024803,0.012014,-0.010962,-0.039974,0.016678,-0.008469,-0.002561,0.041071,0.033801,-0.039556,0.000873,0.019986,-0.031512,-0.018142,0.031451,0.04871,0.022227,-0.008266,0.018593,0.042758,-0.044075,-0.046372,0.011435,0.047425,0.045532,-0.029526,-0.015985,0.02727,-0.010097,-0.035492,-0.00207,0.010165,-0.022988,0.025048,0.008088,-0.004292,-0.024371,0.050513,-0.047325,-0.019829,-0.012696,-0.003991,-0.025897,0.043461,-0.024193,0.033128,0.006417,0.024813,0.037885,-0.007081,-0.049777,-0.008758,-0.051834,-0.052582,-0.045621,-0.040895,0.041061,0.027152,-0.026817,-0.04522,-0.050493,-0.007556,-0.005387,0.043322,-0.012186,0.006675,0.010458,-0.031243,-0.027506,-0.030734,-0.015787,0.013095,-0.008594,0.039446,0.011911,-0.030205,-0.017745,0.042774,-0.051863,-0.011507,-0.003342,-0.036131,0.028973,0.048258,-0.021322,-0.013377,-0.026102,0.021732,-0.053321,-0.003657,-0.044133,0.021588,0.009668,0.005912,0.020392,-0.03783,0.045679,0.040114,-0.025315,0.007521,0.003776,0.044235,0.013702,-0.000994,-0.03333,-0.021859,0.001819,-0.053603,-0.015762,-0.016724,0.01698,0.017066,-0.043717,-0.022219,0.036463,-0.047921,-0.014466,-0.043239,-0.02485,0.050863,-0.005829,0.042725,-0.046131,0.012112,0.003205,-0.027194,0.028493,-0.037621,0.014662,0.016495,-0.044258,0.009271,-0.023368,0.044805,0.046012,-0.021857,0.045086,-0.011789,-0.004992,0.006847,0.02103,0.011309,0.049876,-0.020354,0.038482,-0.043447,-0.003702,-0.042489,-0.033795,0.047194,-0.03205,0.042625,0.017967,-0.008276,0.000866,0.005116,-0.021026,-0.016,0.020384,0.015982,-0.03888,-0.01775,0.002692,0.037911,-0.042004,0.034283,0.024317,0.005528,-0.044442,-0.027193,0.029903,0.014901,-0.037094,0.008018,-0.015183,0.03115,-0.045846,-0.022675,-0.033974,0.0196,0.034923,0.049932,-0.006296,0.004138,0.046123,0.048189,0.012681,-0.032266,0.003248,0.013866,0.033227,-0.034982,0.024463,0.01982,-0.02453,-0.029767,0.052445,-0.016178,-0.001921,-0.029099,-0.053714,0.002201,0.019461,-0.02465,-0.013328,0.031703,-0.00834,-0.013133,-0.021674,0.00675,0.053005,-0.028033,-0.00362,-0.02907,-0.037025,-0.017133,0.001902,0.008773,0.010526,0.019194,-0.03647,-0.036666,-0.029687,-0.041217,-0.032222,-0.037731,0.033498,-0.001743,0.031314,0.028257,0.001809,0.049447,0.001307,-0.020122,0.033403,-0.021074,-0.008205,0.018042,0.007064,-0.034267,-0.029981,0.048873,0.016995,0.045136,-0.051743,-0.044859,0.020355,0.028664,0.034257,-0.030752,0.043395,-0.037087,-0.023426,-0.00139,-0.009148,-0.003958,-0.031508,-0.013472,0.016851,0.052893,-0.025432,0.005098,-0.04573,0.027537,0.030239,-0.013033,0.042709,-0.022064,-0.013759,0.018941,0.044351,-0.004326,-0.042886,0.050787,-0.026124,-0.013407,0.015445,-0.016614,0.020573,-0.020871,-0.026264,-0.007341,-0.039828,-0.047711,0.022542,-0.028493,0.021243,-0.012739,-0.02803,-0.029311,-0.007961,0.050031,0.021901,-0.033688,0.011893,0.016648,-0.035328,0.021382,-0.008409,0.051964,0.023273,-0.030456,-0.043221,0.029591,0.006881,-0.010665,-0.043228,0.053592,0.050715,-0.034304,0.011719,-0.014788,0.034055,0.014465,0.037121,0.033485,0.049462,0.010268,-0.010017,0.007646,-0.049802,-0.040109,-0.03955,-0.014983,-0.048454,0.035873,-0.018274,-0.050362,-0.035137,0.035897,-0.025325,0.002717,0.012241,-0.039268,-0.011074,0.02852,-0.044052,-0.010765,0.019949,0.011684,0.024252,-0.00884,-0.005075,0.052012,-0.000264,0.034152,0.036819,0.027455,-0.007175,-0.002863,0.027536,-0.025716,0.010062,0.000994,0.011861,0.044694,0.015667,0.032372,0.04051,-0.032002,-0.046704,0.003604,0.037927,0.014806,0.03879,0.012357,0.026179,-0.047068,0.028512,-0.048184,-0.049163,-0.000179,0.051059,0.050225,-0.050527,0.052048,-0.030677,-0.051066,-0.036447,0.053358,-0.031839,0.046179,0.034428,-0.00773,-0.027081,-0.027213,0.049357,-0.011914,0.020789,-0.033714,-0.047867,-0.003183,0.000738,-0.025678,-0.004418,-0.043054,0.037814,-0.008112,-0.028098,0.027144,0.006368,0.051573,0.022964,0.051643,-0.030899,-0.044048,0.01658,-0.014131,-0.043826,-0.025727,-0.044182,-0.017456,0.02121,-0.01799,-0.035165,0.051705,0.002497,0.032644,-0.005781,-0.006519,-0.030052,-0.015723,0.049315,0.004418,-0.040154,0.019509,0.030252,-0.031836,-0.037871,0.025974,-0.020003,0.038971,0.034747,-0.029707,-0.049574,0.000177,-0.045062,0.008631,0.023444,-0.013368,-0.016295,-0.040151,0.044782,0.036925,0.023695,0.011286,0.039838,-0.050189,-0.035111,0.010647,-0.026708,-0.035355,-0.020335,0.003441,0.021047,0.036332,0.043329,0.052168,0.023864,-0.05108,0.028989,0.043254,-0.037583,0.040936,0.039557,-0.006772,-0.050255,-0.004071,-0.005407,-0.03868,0.044966,0.033672,0.018577,-0.009722,0.030832,-0.026839,0.002111,-0.050294,0.033492,-0.024753,-0.018009,0.037117,0.026668,0.003565,-0.027964,0.003161,-0.032181,0.041682,-0.024655,0.039193,-0.009329,-0.015804,0.020842,-0.037205,-0.021728,-0.025527,0.052775,-0.006786,-0.049639,0.020707,-0.053346,-0.032798,0.033834,0.035893,0.01737,-0.023032,-0.049181,-0.030781,-0.042352,-0.042486,0.016703,0.010037,-0.041387,-0.024956,0.013994,0.032531,-0.017615,-0.038084,-0.039716,0.021494,0.024149,0.044688,0.038183,-0.002991,-0.041343,-0.004016,0.038793,0.051391,-0.008816,-0.022892,0.049454,0.009392,-0.048493,0.032505,-0.039488,0.032208,0.025068,0.041286,0.003579,-0.041121,-0.051456,-0.05174,-0.012581,0.016279,0.002981,-0.03582,0.040539,-0.048726,-0.004026,0.035171,-0.003526,-0.026808,-0.006107,0.011445,0.00202,0.002037,-0.011234,0.006538,0.014131,0.026318,-0.029446,0.004459,-0.015986,-0.028857,-0.045853,-0.05221,-0.04336,0.043921,0.049136,0.010989,-0.001557,-0.004212,0.01706,-0.021493,0.031673,-0.039378,0.019046,-0.003628,0.017516,-0.038296,-0.006133,-0.035011,0.008945,0.003603,0.042153,0.012452,-0.049775,-0.03871,0.016909,0.032144,-0.000561,0.012521,-0.026254,-0.019988,0.022909,-0.049065,-0.01596,-0.017643,0.018253,-0.000999,0.044323,0.016985,-0.044739,0.039093,-0.012325,-0.002243,-0.050012,0.04082,0.016657,0.01167,-0.041314,0.000258,-0.020914,0.041337,0.04215,-0.034871,-0.009874,0.046078,0.038162,-0.044723,0.034571,-0.011083,0.009553,-0.04831,0.051566,0.039295,-0.042134,-0.009298,0.025049,-0.006425,0.043845,0.028389,-0.019858,0.046184,-0.006854,0.038295,0.041595,0.048868,0.051618,0.043493,-0.028514,0.040666,0.00394,0.037182,-0.014189,0.037449,0.028204,0.018699,0.014541,0.046718,-0.044343,-0.018973,-0.048171,0.001166,-0.029448,0.006043,0.047359,0.008312,0.002849,0.001131,0.04197,0.047366,-0.019151,0.019374,-0.028936,-0.033932,-0.019922,0.050555,0.053177,-0.034877,0.024371,0.0076,-0.048404,-0.046897,-0.030007,0.002087,0.032062,-0.032594,-0.023496,-0.035077,-0.048275,0.020018,0.034845,0.017463,0.053457,-0.017004,-0.03766,0.044408,0.01615,-0.000546,0.031524,0.001651,0.017469,-0.034502,0.006598,0.037765,-0.003516,-0.025965,0.04014,0.025143,0.00152,-0.048831,0.007214,0.011841,0.009249,0.002692,-0.004507,-0.008046,-0.037295,-0.037471,0.009957,-0.052934,-0.049459,0.015026,-0.051026,0.002024,0.035185,-0.002787,-0.049055,0.048896,0.0466,-0.022826,-0.002414,0.029697,0.01374,-0.039988,0.015265,-0.046324,0.028846,0.00597,-0.008942,-0.016139,-0.052429,-0.019858,-0.027535,0.018903,-0.010874,-0.049262,0.039648,0.048123,0.051908,-0.04912,-0.034739,0.001999,-0.040048,-0.041254,0.0046,-0.036731,0.045341,-0.051753,-0.012059,0.026215,0.01613,-0.006125,-0.039324,-0.045811,-0.044478,-0.001227,0.013289,-0.051174,0.052589,0.024948,0.034131,0.030168,-0.048745,-0.045363,-0.049586,-0.005508,-0.035068,-0.019237,0.010631,0.000805,0.024021,-0.042037,0.033675,0.017824,-0.004289,-0.041946,0.025786,0.004525,0.003411,0.044273,0.003015,0.012084,0.016262,-0.030876]'::vector,
      'Chiến lược Thương mại hóa Sáng chế & Chuyển giao Công nghệ Quốc tế',
      true
    ) ON CONFLICT (subject_kind, subject_id, chunk_index) DO UPDATE
      SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, is_published = true;
    

    INSERT INTO matching.search_chunks (
      subject_kind, subject_id, chunk_index, text, embedding, title, is_published
    ) VALUES (
      'LEARNING_MATERIAL', '01940001-0000-7000-8000-000000000006', 0,
      'Phương pháp Định giá Tài sản Vô hình trong Startup ĐMST. Khóa học thực chiến dành riêng cho các sáng lập viên Startup và quỹ đầu tư mạo hiểm (VC). Hướng dẫn kỹ thuật định giá bằng sáng chế, mã nguồn phần mềm, thuật toán AI.',
      '[-0.045145,-0.010304,-0.054359,-0.044488,0.010587,-0.018303,-0.011377,-0.043763,0.041856,0.018358,-0.00219,0.003506,-0.035118,0.009369,0.027335,-0.034612,-0.039255,0.000666,-0.040222,-0.010024,-0.025491,-0.049696,-0.017545,0.034608,0.005032,-0.031939,-0.048984,-0.044411,0.053644,0.028673,0.011187,0.00516,0.038443,-0.042641,0.030574,0.036087,-0.022327,0.025231,-0.019654,0.017841,-0.027168,-0.033163,0.053044,-0.031538,-0.028491,-0.026447,0.000681,-0.033153,-0.050028,-0.015943,-0.004677,-0.053489,0.053171,-0.042275,0.00152,0.05101,0.031996,0.042521,0.04885,0.019192,0.005628,0.00752,-0.023785,0.048026,-0.003479,0.02312,-0.034301,-0.045338,0.005642,0.052626,-0.007772,-0.027004,-0.010025,0.052601,-0.029903,-0.009819,0.021225,-0.027202,-0.003158,-0.031802,0.034583,-0.044224,-0.039884,-0.010056,0.028464,0.032037,0.047035,-0.007571,-0.04272,0.001594,0.027168,-0.003692,0.019588,-0.003291,0.002719,0.045232,-0.012139,0.002771,-0.001889,0.052013,0.045336,-0.014861,-0.005858,-0.014452,-0.04283,-0.008468,0.010119,-0.015027,0.001373,-0.038292,0.044205,0.021832,-0.053127,-0.021299,0.022784,0.042277,0.009358,-0.046244,0.003005,-0.050942,-0.039194,-0.027395,0.014141,-0.018063,-0.041231,-0.001161,0.024973,-0.027814,0.031905,-0.054218,-0.000247,-0.053139,0.023077,-0.030004,0.044538,0.034096,-0.01155,-0.05285,-0.039254,0.050158,-0.001772,0.038556,0.044758,-0.026032,0.019789,0.003867,0.008228,-0.016295,-0.00822,0.052478,0.023589,0.000895,-0.010172,-0.009878,-0.005922,0.019226,0.013267,0.027954,0.033481,-0.037253,0.027328,0.01006,-0.003753,0.030733,0.053019,0.009689,-0.024454,-0.044935,0.01032,-0.030654,0.005764,0.052467,0.040547,-0.037861,-0.033271,0.011945,-0.03785,-0.037723,-0.028365,-0.001588,0.000745,-0.027925,-0.043388,0.006227,-0.03588,-0.025509,0.047045,0.054632,-0.053197,0.037141,0.019448,0.052026,0.021232,-0.02056,0.00375,0.004112,0.023382,-0.001506,0.006542,0.035533,0.016383,0.008231,0.040429,-0.00884,-0.025563,-0.039225,0.005659,-0.020841,0.032361,-0.002999,-0.041092,-0.012316,0.016076,0.035298,0.020374,-0.044397,0.026871,0.013267,0.028818,0.001056,0.050068,0.005689,0.001211,0.05027,0.007735,0.024376,0.023998,0.042307,0.025863,-0.026279,-0.023506,-0.03087,0.015711,0.029818,0.045334,-0.013443,0.035752,0.015506,-0.042493,0.020932,0.053804,-0.050175,0.031276,-0.012435,0.014246,-0.046344,0.031804,0.017417,-0.034836,-0.005643,0.040259,0.00965,-0.014892,-0.031565,0.051068,-0.053171,0.052467,0.016701,-0.019704,-0.0274,-0.001243,0.028574,-0.028057,-0.036136,0.049019,-0.050903,0.00602,0.038421,-0.017344,0.012721,-0.04475,-0.043683,0.038213,0.011841,-0.002684,-0.020618,0.034428,0.000279,-0.006217,0.028296,-0.027458,0.014015,-0.026666,0.044354,0.044305,-0.043013,-0.003033,0.010946,-0.051692,-0.031495,-0.043525,-0.037527,0.027133,-0.000633,0.007047,0.053444,-0.019428,0.030944,-0.01679,-0.00059,-0.032952,-0.036007,-0.009226,-0.004411,-0.006422,0.036661,-0.010015,-0.046757,-0.029591,-0.002323,-0.009495,0.054369,-0.020979,-0.052323,0.009805,0.033559,0.023541,0.022981,0.006676,0.012735,-0.050992,0.040809,0.048404,0.051061,-0.053163,-0.006605,-0.018006,0.006653,-0.001535,0.004988,0.044142,-0.039741,-0.019143,-0.039085,-0.024904,-0.004913,-0.017543,-0.039974,0.026953,0.00548,0.052053,-0.034862,0.002555,0.046482,0.014148,0.006198,0.050674,0.023952,0.044413,0.012963,-0.032019,-0.00125,-0.001438,0.023244,0.024759,0.012884,-0.021994,-0.044225,-0.021281,0.014292,-0.003352,0.004838,0.002812,0.0219,0.052491,0.011932,0.047191,-0.028567,-0.029513,-0.047308,0.048603,-0.01992,0.024654,0.041589,0.038879,-0.028795,-0.001614,0.022106,-0.041618,0.034942,0.02819,-0.050274,-0.036369,-0.025312,0.023084,-0.041113,-0.005515,0.027664,-0.015773,0.043191,-0.030433,0.020386,-0.025267,-0.015845,0.028302,-0.050797,0.013452,-0.039283,-0.035756,-0.029885,0.03837,-0.012841,0.041969,0.005544,0.026853,0.047661,0.042569,0.002099,-0.03608,-0.026042,0.015134,0.021103,0.04786,0.041854,-0.030852,0.017858,-0.029364,0.035733,-0.013079,-0.011479,0.039957,0.030082,-0.030624,-0.00466,0.05107,0.022313,-0.051555,0.053334,-0.017365,-0.044718,0.036264,-0.051711,-0.033069,-0.010049,0.048219,-0.019284,0.047095,-0.032455,0.035277,0.000107,0.018947,-0.03528,0.003749,0.04972,-0.045762,-0.041376,-0.023668,0.006584,0.009818,-0.035582,-0.021301,0.048515,-0.032394,0.01982,-0.013495,0.018037,-0.019645,0.047124,0.028434,-0.018562,0.044602,0.018339,0.03848,0.023592,0.036432,0.051256,-0.03682,0.014907,0.007892,0.051405,0.039045,0.04405,-0.017542,-0.009155,-0.001627,0.035749,0.014576,-0.009531,-0.025956,0.029117,0.024539,0.009592,-0.011632,-0.007302,-0.035731,-0.024,0.028988,0.047671,0.032176,-0.022396,-0.050422,0.012377,0.014461,0.046999,-0.04565,0.040524,0.029288,-0.006244,0.021871,0.008021,0.025091,-0.033001,0.023483,0.044864,0.008262,0.006408,0.007062,0.043396,0.026467,-0.003645,0.013647,0.0403,0.036282,0.027961,0.043601,-0.02559,-0.049809,-0.050561,0.020084,0.032575,0.049466,-0.047101,-0.013541,0.05042,0.021814,0.035237,-0.035774,-0.008158,0.034183,-0.005925,0.00075,0.044053,0.024754,-0.041792,0.02111,0.043299,-0.023111,0.050868,-0.023366,0.037935,-0.031115,0.049247,0.04238,0.038098,0.025185,-0.035378,-0.034357,-0.047227,-6e-05,0.024487,0.032385,-0.019128,0.045855,0.027974,0.005685,0.02519,0.000998,0.013683,0.038158,0.00502,0.042265,0.026798,0.04337,-0.024402,-0.040096,0.029329,-0.017199,-0.052705,0.050949,0.004487,-0.040812,-0.008984,0.002792,-0.016094,-0.013674,-0.019137,0.030623,-0.034379,0.053012,-0.006831,-0.039006,-0.042261,-0.051131,-0.014435,-0.023309,0.037091,0.005872,-0.054711,-0.048174,-0.035571,-0.015248,0.031315,-0.028797,-0.040532,-0.029127,-0.036252,0.046476,0.020096,-0.048501,0.043103,0.01873,0.050601,-0.042884,-0.029657,-0.025833,0.030408,-0.024666,-0.010435,-0.018019,0.023547,0.034557,-0.035164,0.04191,0.012729,0.044527,-0.022859,0.014148,-0.033149,-0.019263,-0.016144,0.050016,0.051242,0.040936,-0.050997,0.054007,0.034036,0.02537,-0.021407,0.053453,0.001969,0.030866,0.00021,0.009286,-0.016569,0.033117,0.047092,0.048189,0.021849,-0.005546,-0.030441,-0.029183,0.032215,-0.022501,0.01775,0.003863,-0.035446,0.023304,0.020245,0.047298,0.037046,0.036218,0.053576,-0.018983,-0.008142,0.025774,0.013449,0.009844,-0.027062,0.011852,-2.2e-05,0.021947,-0.004203,-0.003495,0.017332,-0.027791,0.014795,0.015355,0.02265,0.017135,0.000197,0.035183,-0.005356,-0.019174,0.052943,0.023929,-0.047997,-0.032655,0.020767,-0.012442,-0.01408,-0.043369,-0.035102,0.010499,0.039521,-0.018947,0.037711,0.007399,0.01833,0.028748,-0.039732,0.047675,-0.028582,-0.03002,-0.005721,-0.049895,0.053911,0.025271,-0.031368,-0.053974,0.004951,0.03543,0.04543,-0.001389,0.021261,0.017185,-0.009078,-0.01115,0.045751,-0.016615,-0.017701,0.033486,-0.001439,-0.028735,0.039752,0.053358,-0.012175,-0.045315,-0.034288,-0.042886,-0.004735,-0.021608,0.041964,0.033964,0.037339,0.016086,-0.030434,-0.011574,0.019159,0.026075,-0.006135,0.019713,-0.022173,-0.038869,-0.038533,0.014949,0.019467,-0.03219,0.015339,-0.003721,-0.042229,0.04037,-0.048102,0.027013,-0.031385,-0.031261,-0.024271,0.003372,-0.046277,0.045176,0.030257,0.006333,0.017186,-0.031039,-0.043183,0.047568,0.042936,0.023281,-0.0121,-0.012164,-0.034272,0.000374,0.025771,0.040631,0.027799,-0.020562,0.050702,0.036563,0.034316,-0.015972,-0.026214,0.000204,-0.039686,0.041729,-0.040448,0.007437,0.036417,-0.046207,-0.026544,0.047195,-0.031802,-0.038061,0.044229,-0.037563,0.013555,0.009952,-0.013918,-0.041958,-0.049411,-0.00306,-0.018238,0.021653,-0.004551,-0.054119,0.025642,0.039628,0.046394,-0.007945,0.013819,0.034732,0.032136,-0.040509,-0.007255,-0.022446,-0.024625,-0.044002,0.010236,0.005871,-0.010223,0.018508,0.001088,-0.038053,-0.003375,-0.040696,0.022792,0.020465,-0.04393,-0.046869,0.036305,-0.028838,-0.036622,-0.039922,-0.020172,0.019868,0.042836,-0.043975,0.045312,0.010007,0.031718,0.002737,-0.03017,-0.023834,0.047146,-0.029909,0.020241,0.033753,0.039219,0.027462,0.022938,0.043018,0.030272,-0.025016,0.023559,0.008968,0.045501,-0.004121,0.030679,0.030955,-0.032213,0.023045,-0.025211,0.004867,-0.046333,0.049484,-0.00072,-0.0385,0.039377,-0.003192,-0.053021,-0.022839,0.016489,0.002666,-0.028804,-0.048798,-0.029672,0.033771,0.053807,-0.023351,-0.050692,-0.049166,0.039852,0.031363,0.037932,0.001209,0.025517,-0.004895,-0.020716,0.013984,-0.05439,0.044037,0.02133,0.000997,0.045442,-0.046381,-0.017751,-0.00674,-0.006224,0.016134,-0.015568,-0.043136,-0.004136,0.012452,0.053217,-0.048706,-0.035321,-0.020201,0.052985,0.013998,-0.029814,0.044273,-0.007713,0.015673,0.010467,-0.03502,0.005861,0.024841,0.001466,-0.045775,-0.050304,0.04219,-0.048213,0.048273,0.002954,-5.3e-05,0.051859,-0.051035,-0.003874,0.011759,-0.049469,0.029786,0.016228,-0.000884,0.007158,0.020931,-0.046818,-0.016316,0.018167,-0.005882,0.031954,0.0527,-0.032362,0.011024,0.037595,0.005329,-0.031547,-0.013506,-0.004929,0.002564,0.008573,-0.032814,-0.037652,-0.043578,-0.030514,0.01734,-0.027153,0.00233,-0.019433,-0.036099,0.042599,0.039716,-0.031676,-0.033183,-0.020985,0.042626,0.02626,0.011926,0.013531,0.000849,-0.023299,-0.024825,0.011562,-0.007982,0.044107,-0.048299,-0.04642,0.036538,-0.044314,-0.051416,-0.046502,-0.041415,0.043539,0.043996,-0.047856,-0.053065,0.02798,-0.039209,0.002847,-0.02852,-0.017043,0.044552,-0.012653,0.013391,-0.041086,-0.032805,0.036889,0.024049,0.031131,-0.035151,-0.001258,-0.011386,0.027967,0.043206,-0.049656,-0.011461,-0.036209,-0.053482,0.003115,0.038067,0.000887,0.00213,0.012859,0.014254,-0.041376,0.053543,-0.022725,0.005376,-0.007021,0.00675,-0.010069,0.03637,0.021143,-0.001504,0.019662,0.011825,0.018386,0.039945,0.018466,0.024709,0.007916,-0.0156,0.038791,-0.006993,0.04237,-0.004804,-0.014782]'::vector,
      'Phương pháp Định giá Tài sản Vô hình trong Startup ĐMST',
      true
    ) ON CONFLICT (subject_kind, subject_id, chunk_index) DO UPDATE
      SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, is_published = true;
    
COMMIT;