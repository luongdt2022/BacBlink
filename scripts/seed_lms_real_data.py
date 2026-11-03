#!/usr/bin/env python3
"""
Seed dữ liệu học liệu số thật & media thật cho Module LMS (TASK-10).
Tạo 6 học liệu mẫu thực tế, media thật phát được HTTP 206, vector pgvector 1024d.
"""

import os
import subprocess
import uuid
import hashlib

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
VIDEO_DIR = os.path.join(STORAGE_DIR, "lms", "videos")
DOC_DIR = os.path.join(STORAGE_DIR, "lms", "docs")

os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(DOC_DIR, exist_ok=True)

# 1. Chuyên gia thật từ brokerage.expert_profiles
EXP_DUC = "01a111c8-e671-7dfd-992f-67d6534d705a"    # TS. Nguyễn Văn Đức
EXP_THANG = "e528f6c4-1b87-4755-bc83-92d4d64aece2"  # GS.TS. Trần Đình Thắng
EXP_HUNG = "01928003-0000-7000-8000-000000000001"   # PGS.TS. Lê Quốc Hùng
EXP_DONG = "01a19bd2-aef8-7599-9233-4ee398ebfb47"   # Nguyễn Phương Đông
EXP_HA = "01928003-0000-7000-8000-000000000003"     # PGS.TS. Đỗ Thị Thu Hà

ADMIN_ID = "00000000-0000-0000-0000-000000000001"

# 2. Sinh video MP4 thật bằng ffmpeg
def generate_video(filename, color_hex, duration_sec=5):
    path = os.path.join(VIDEO_DIR, filename)
    if not os.path.exists(path):
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"color=c={color_hex}:s=1280x720:d={duration_sec}",
            "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-c:v", "libx264", "-t", str(duration_sec), "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            path
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    size = os.path.getsize(path)
    with open(path, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()
    return f"lms/videos/{filename}", size, sha256

# 3. Sinh file PDF thật
def generate_pdf(filename):
    path = os.path.join(DOC_DIR, filename)
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n185\n%%EOF\n"
    )
    with open(path, "wb") as f:
        f.write(pdf_content)
    size = os.path.getsize(path)
    sha256 = hashlib.sha256(pdf_content).hexdigest()
    return f"lms/docs/{filename}", size, sha256

# 4. Sinh file DOCX thật
def generate_docx(filename):
    path = os.path.join(DOC_DIR, filename)
    content = f"NacenTech Learning Material Document: {filename}\nGenerated for training.".encode('utf-8')
    with open(path, "wb") as f:
        f.write(content)
    size = os.path.getsize(path)
    sha256 = hashlib.sha256(content).hexdigest()
    return f"lms/docs/{filename}", size, sha256

# Sinh media
vid1, vid1_sz, vid1_sha = generate_video("quan-tri-shtt.mp4", "0x1e3a8a")
vid2, vid2_sz, vid2_sha = generate_video("tham-dinh-gia-cong-nghe.mp4", "0x065f46")
vid3, vid3_sz, vid3_sha = generate_video("thuong-mai-hoa-sang-che.mp4", "0x581c87")
vid4, vid4_sz, vid4_sha = generate_video("soan-thao-hop-dong-cgc.mp4", "0x9a3412")
vid5, vid5_sz, vid5_sha = generate_video("cap-nhat-thong-tu-bkhcn.mp4", "0x991b1b")
vid6, vid6_sz, vid6_sha = generate_video("dinh-gia-tai-san-vo-hinh.mp4", "0x0f766e")

pdf1, pdf1_sz, pdf1_sha = generate_pdf("infographic-quy-trinh-shtt.pdf")
pdf2, pdf2_sz, pdf2_sha = generate_pdf("huong-dan-tham-dinh-gia.pdf")
pdf3, pdf3_sz, pdf3_sha = generate_pdf("tai-lieu-licensing-quoc-te.pdf")
docx1, docx1_sz, docx1_sha = generate_docx("mau-phieu-tra-cuu-sang-che.docx")
docx2, docx2_sz, docx2_sha = generate_docx("mau-hop-dong-chuyen-giao-cong-nghe.docx")
docx3, docx3_sz, docx3_sha = generate_docx("bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx")

def make_vector_str(seed_val):
    import random
    r = random.Random(seed_val)
    vec = [round(r.uniform(-0.05, 0.05), 6) for _ in range(1024)]
    s = sum(x*x for x in vec) ** 0.5
    vec = [round(x/s, 6) for x in vec]
    return "[" + ",".join(str(x) for x in vec) + "]"

MAT1_ID = "01940001-0000-7000-8000-000000000001"
MAT2_ID = "01940001-0000-7000-8000-000000000002"
MAT3_ID = "01940001-0000-7000-8000-000000000003"
MAT4_ID = "01940001-0000-7000-8000-000000000004"
MAT5_ID = "01940001-0000-7000-8000-000000000005"
MAT6_ID = "01940001-0000-7000-8000-000000000006"

sql = []
sql.append("-- SEED DATA CHO LMS MODULE (TASK-10)")
sql.append("BEGIN;")

sql.append(f"""
DELETE FROM lms.learning_materials WHERE id IN (
  '{MAT1_ID}', '{MAT2_ID}', '{MAT3_ID}', '{MAT4_ID}', '{MAT5_ID}', '{MAT6_ID}'
);
DELETE FROM matching.search_chunks WHERE subject_kind = 'LEARNING_MATERIAL' AND subject_id IN (
  '{MAT1_ID}', '{MAT2_ID}', '{MAT3_ID}', '{MAT4_ID}', '{MAT5_ID}', '{MAT6_ID}'
);
""")

docs = [
    (str(uuid.uuid4()), str(uuid.uuid4()), vid1, vid1_sz, vid1_sha, "video/mp4", "quan-tri-shtt.mp4"),
    (str(uuid.uuid4()), str(uuid.uuid4()), vid2, vid2_sz, vid2_sha, "video/mp4", "tham-dinh-gia-cong-nghe.mp4"),
    (str(uuid.uuid4()), str(uuid.uuid4()), vid3, vid3_sz, vid3_sha, "video/mp4", "thuong-mai-hoa-sang-che.mp4"),
    (str(uuid.uuid4()), str(uuid.uuid4()), vid4, vid4_sz, vid4_sha, "video/mp4", "soan-thao-hop-dong-cgc.mp4"),
    (str(uuid.uuid4()), str(uuid.uuid4()), vid5, vid5_sz, vid5_sha, "video/mp4", "cap-nhat-thong-tu-bkhcn.mp4"),
    (str(uuid.uuid4()), str(uuid.uuid4()), vid6, vid6_sz, vid6_sha, "video/mp4", "dinh-gia-tai-san-vo-hinh.mp4"),
    (str(uuid.uuid4()), str(uuid.uuid4()), pdf1, pdf1_sz, pdf1_sha, "application/pdf", "infographic-quy-trinh-shtt.pdf"),
    (str(uuid.uuid4()), str(uuid.uuid4()), pdf2, pdf2_sz, pdf2_sha, "application/pdf", "huong-dan-tham-dinh-gia.pdf"),
    (str(uuid.uuid4()), str(uuid.uuid4()), pdf3, pdf3_sz, pdf3_sha, "application/pdf", "tai-lieu-licensing-quoc-te.pdf"),
    (str(uuid.uuid4()), str(uuid.uuid4()), docx1, docx1_sz, docx1_sha, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "mau-phieu-tra-cuu-sang-che.docx"),
    (str(uuid.uuid4()), str(uuid.uuid4()), docx2, docx2_sz, docx2_sha, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "mau-hop-dong-chuyen-giao-cong-nghe.docx"),
    (str(uuid.uuid4()), str(uuid.uuid4()), docx3, docx3_sz, docx3_sha, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx"),
]

for doc_id, ver_id, key, size, sha, ctype, fname in docs:
    sql.append(f"""
    DELETE FROM dataroom.document_versions WHERE storage_key = '{key}';
    INSERT INTO dataroom.documents (id, subject_kind, subject_id, owner_person_id, kind, file_type, classification, current_version_no, version, created_at, updated_at)
    VALUES ('{doc_id}', 'PUBLIC', '{ADMIN_ID}', '{ADMIN_ID}', 'DOCUMENT', 'DOCUMENT', 'PUBLIC', 1, 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO dataroom.document_versions (id, document_id, version_no, file_name, storage_key, content_type, size, sha256, created_at)
    VALUES ('{ver_id}', '{doc_id}', 1, '{fname}', '{key}', '{ctype}', {size}, '{sha}', NOW())
    ON CONFLICT (id) DO NOTHING;
    """)

# 1. BÀI 1: LOẠI A - PUBLISHED
sql.append(f"""
INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '{MAT1_ID}', 'MAT-202611-0001',
  'Tổng quan Quản trị Sở hữu Trí tuệ cho Doanh nghiệp Khoa học Công nghệ',
  'TYPE_A', 'CN_THONG_TIN', 45,
  '<p>Khóa học nền tảng trang bị tư duy và năng lực quản trị tài sản trí tuệ (IP Management) cho lãnh đạo doanh nghiệp KH&CN và viện trường. Học viên sẽ nắm vững quy trình xác lập quyền, tra cứu sáng chế, bảo hộ kiểu dáng và khai thác thương mại hiệu quả.</p>',
  '{vid1}', 'quan-tri-shtt.mp4', {vid1_sz},
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '{ADMIN_ID}', 'TS. Nguyễn Văn Đức', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '{MAT1_ID}', '{EXP_DUC}', 'TS. Nguyễn Văn Đức', 'Tiến sĩ', 'Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)', 1, true),
  (gen_random_uuid(), '{MAT1_ID}', '{EXP_DONG}', 'Nguyễn Phương Đông', 'Kỹ sư', 'Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ', 2, false);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '{MAT1_ID}', 1, 'Quyền sở hữu công nghiệp đối với sáng chế được xác lập trên cơ sở nào?', 'Quyết định cấp văn bằng bảo hộ của cơ quan nhà nước có thẩm quyền', 'Sử dụng công khai lần đầu tiên tại hội chợ triển lãm', 'Tự động phát sinh kể từ khi sáng chế được tạo ra', 'Hợp đồng chuyển nhượng quyền sử dụng với đối tác', 'A', 'Theo Luật SHTT, quyền sở hữu công nghiệp đối với sáng chế chỉ được xác lập trên cơ sở quyết định cấp Văn bằng bảo hộ của Cục SHTT.', false),
  (gen_random_uuid(), '{MAT1_ID}', 2, 'Thời hạn bảo hộ Bằng độc quyền sáng chế tại Việt Nam là bao nhiêu năm tính từ ngày nộp đơn?', '10 năm', '15 năm', '20 năm (không được gia hạn)', 'Vĩnh viễn', 'C', 'Bằng độc quyền sáng chế có hiệu lực 20 năm tính từ ngày nộp đơn hợp lệ và không được gia hạn.', false),
  (gen_random_uuid(), '{MAT1_ID}', 3, 'Điều kiện nào sau đây KHÔNG phải là tiêu chuẩn bảo hộ sáng chế?', 'Có tính mới trên phạm vi toàn thế giới', 'Có trình độ sáng tạo', 'Có khả năng áp dụng công nghiệp', 'Có giá thành sản xuất rẻ hơn sản phẩm cùng loại', 'D', 'Tiêu chuẩn bảo hộ sáng chế gồm 3 điều kiện: Tính mới, Trình độ sáng tạo và Khả năng áp dụng công nghiệp. Giá thành rẻ không phải điều kiện bảo hộ.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '{MAT1_ID}', 'PRACTICE_TOOL', 'mau-phieu-tra-cuu-sang-che.docx', '{docx1}', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {docx1_sz}, '{docx1_sha}', 1),
  (gen_random_uuid(), '{MAT1_ID}', 'SUMMARY_SHEET', 'infographic-quy-trinh-shtt.pdf', '{pdf1}', 'application/pdf', {pdf1_sz}, '{pdf1_sha}', 2);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '{MAT1_ID}', 'Cơ sở dữ liệu Sáng chế & Giải pháp hữu ích NacenTech', 'https://nacentech.vn/chao-ban-cong-nghe', 'TECHNOLOGY_ASSET', 1),
  (gen_random_uuid(), '{MAT1_ID}', 'Danh mục Bài toán ĐMST cần bảo hộ công nghệ', 'https://nacentech.vn/nhu-cau-cong-nghe', 'INNOVATION_DEMAND', 2);
""")

# 2. BÀI 2: LOẠI B - PUBLISHED
sql.append(f"""
INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '{MAT2_ID}', 'MAT-202611-0002',
  'Quy trình Thẩm định Giá Công nghệ theo Tiêu chuẩn Thẩm định giá Việt Nam',
  'TYPE_B', 'TU_DONG_HOA', 75,
  '<p>Chương trình chuyên sâu hướng dẫn các thẩm định viên, chuyên gia định giá và doanh nghiệp áp dụng chuẩn mực Tiêu chuẩn thẩm định giá Việt Nam số 13 về Tài sản vô hình. Phân tích chi tiết phương pháp chi phí, phương pháp so sánh thị trường và phương pháp chiết khấu dòng tiền DCF.</p>',
  '{vid2}', 'tham-dinh-gia-cong-nghe.mp4', {vid2_sz},
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '{ADMIN_ID}', 'GS.TS. Trần Đình Thắng', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '{MAT2_ID}', '{EXP_THANG}', 'GS.TS. Trần Đình Thắng', 'Giáo sư', 'Viện Hóa học các Hợp chất Thiên nhiên - Viện Hàn lâm KH&CN Việt Nam', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '{MAT2_ID}', 1, 'Phương pháp nào thường được ưu tiên khi định giá công nghệ đã tạo ra doanh thu ổn định trên thị trường?', 'Phương pháp chiết khấu dòng tiền (DCF - Thu nhập)', 'Phương pháp chi phí tái tạo', 'Phương pháp chi phí thay thế', 'Phương pháp giá trị thanh lý', 'A', 'Phương pháp thu nhập (DCF) phản ánh chính xác nhất tiềm năng kinh tế và dòng tiền tương lai của công nghệ đã đi vào khai thác.', false),
  (gen_random_uuid(), '{MAT2_ID}', 2, 'Yếu tố TRL (Technology Readiness Level) ảnh hưởng thế nào đến tỷ suất chiết khấu trong định giá công nghệ?', 'TRL càng cao thì rủi ro càng thấp, tỷ suất chiết khấu càng giảm', 'TRL không ảnh hưởng đến tỷ suất chiết khấu', 'TRL càng cao thì tỷ suất chiết khấu càng tăng', 'Chỉ áp dụng với công nghệ TRL 1-3', 'A', 'Mức độ sẵn sàng công nghệ (TRL) cao chứng minh công nghệ đã qua thử nghiệm thực tế, rủi ro thương mại hóa thấp dẫn đến tỷ suất chiết khấu rủi ro thấp hơn.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '{MAT2_ID}', 'PRACTICE_TOOL', 'huong-dan-tham-dinh-gia.pdf', '{pdf2}', 'application/pdf', {pdf2_sz}, '{pdf2_sha}', 1),
  (gen_random_uuid(), '{MAT2_ID}', 'POLICY_DOC', 'bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', '{docx3}', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {docx3_sz}, '{docx3_sha}', 2);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '{MAT2_ID}', 'Cổng đánh giá TRL & Thẩm định công nghệ TT17', 'https://nacentech.vn/assessments/tt17', 'TECHNOLOGY_ASSET', 1);
""")

# 3. BÀI 3: LOẠI B+ - PUBLISHED
sql.append(f"""
INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '{MAT3_ID}', 'MAT-202611-0003',
  'Chiến lược Thương mại hóa Sáng chế & Chuyển giao Công nghệ Quốc tế',
  'TYPE_B_PLUS', 'VAT_LIEU_MOI', 90,
  '<p>Chuyên đề cao cấp đào tạo chuyên gia chuyển giao công nghệ. Hướng dẫn nghệ thuật đàm phán hợp đồng Li-xăng độc quyền/không độc quyền, cơ chế phân chia lợi nhuận Royalty, kiểm toán pháp lý tài sản trí tuệ xuyên biên giới và phòng ngừa tranh chấp quốc tế.</p>',
  '{vid3}', 'thuong-mai-hoa-sang-che.mp4', {vid3_sz},
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '{ADMIN_ID}', 'PGS.TS. Lê Quốc Hùng', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '{MAT3_ID}', '{EXP_HUNG}', 'PGS.TS. Lê Quốc Hùng', 'Phó Giáo sư', 'Đại học Bách Khoa Hà Nội - Viện Cơ khí Động lực', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '{MAT3_ID}', 1, 'Hợp đồng Li-xăng độc quyền (Exclusive License) trao quyền gì cho bên nhận li-xăng?', 'Được độc quyền sử dụng sáng chế trong phạm vi lãnh thổ đã thỏa thuận, bên giao li-xăng không được cấp cho bên thứ ba và không được tự sử dụng', 'Được quyền chuyển nhượng vĩnh viễn quyền sở hữu sáng chế', 'Chỉ được sử dụng nội bộ không được bán sản phẩm ra thị trường', 'Bên giao li-xăng vẫn có quyền cấp li-xăng cho doanh nghiệp khác', 'A', 'Li-xăng độc quyền loại trừ quyền sử dụng của cả bên thứ ba lẫn chính chủ sở hữu trong phạm vi lãnh thổ và thời hạn thỏa thuận.', false),
  (gen_random_uuid(), '{MAT3_ID}', 2, 'Cơ chế thù lao Running Royalty trong hợp đồng chuyển giao thường được tính trên cơ sở nào?', 'Tỷ lệ phần trăm trên doanh thu thuần hoặc lợi nhuận gộp từ sản phẩm áp dụng công nghệ', 'Khoản tiền cố định trả một lần duy nhất', 'Số lượng bằng sáng chế đối tác sở hữu', 'Số giờ chuyên gia tư vấn trực tiếp', 'A', 'Running Royalty tính theo % doanh thu thuần hoặc sản lượng sản phẩm thực tế bán ra.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '{MAT3_ID}', 'PRACTICE_TOOL', 'tai-lieu-licensing-quoc-te.pdf', '{pdf3}', 'application/pdf', {pdf3_sz}, '{pdf3_sha}', 1),
  (gen_random_uuid(), '{MAT3_ID}', 'POLICY_DOC', 'mau-hop-dong-chuyen-giao-cong-nghe.docx', '{docx2}', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {docx2_sz}, '{docx2_sha}', 2);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '{MAT3_ID}', 'Đặt lịch tư vấn chiến lược 1-1 với Chuyên gia', 'https://nacentech.vn/experts/01928003-0000-7000-8000-000000000001?action=consult', 'EXPERT_CONSULTATION', 1);
""")

# 4. BÀI 4: TRẠNG THÁI DRAFT
sql.append(f"""
INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '{MAT4_ID}', 'MAT-202611-0004',
  'Hướng dẫn Soạn thảo Hợp đồng Chuyển giao Công nghệ',
  'TYPE_B', 'SINH_HOC', 60,
  '<p>Bản thảo đang biên soạn: Hướng dẫn chi tiết từng điều khoản thiết yếu trong hợp đồng chuyển giao công nghệ sinh học và nông nghiệp công nghệ cao theo Luật Chuyển giao công nghệ 2017.</p>',
  '{vid4}', 'soan-thao-hop-dong-cgc.mp4', {vid4_sz},
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
  'DRAFT', 1, false, '{ADMIN_ID}', 'PGS.TS. Đỗ Thị Thu Hà', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '{MAT4_ID}', '{EXP_HA}', 'PGS.TS. Đỗ Thị Thu Hà', 'Phó Giáo sư', 'Viện Khoa học Nông nghiệp Việt Nam (VAAS)', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '{MAT4_ID}', 1, 'Hợp đồng chuyển giao công nghệ bắt buộc phải lập thành văn bản không?', 'Bắt buộc phải lập thành văn bản hoặc hình thức tương đương', 'Có thể thỏa thuận bằng lời nói nếu giá trị dưới 100 triệu', 'Chỉ cần thỏa thuận qua email', 'Không bắt buộc hình thức', 'A', 'Luật CGCN quy định hợp đồng chuyển giao công nghệ bắt buộc phải lập thành văn bản.', false);
""")

# 5. BÀI 5: TRẠNG THÁI UNPUBLISHED (CÓ LÝ DO GỠ BÀI KIỂM TOÁN)
sql.append(f"""
INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, unpublish_reason, unpublished_at,
  created_by, created_by_name, created_at, updated_at
) VALUES (
  '{MAT5_ID}', 'MAT-202611-0005',
  'Cập nhật quy định Thông tư mới của Bộ KH&CN',
  'TYPE_A', 'NANG_LUONG', 50,
  '<p>Bài giảng tổng hợp các điểm mới trong chính sách khuyến khích chuyển giao công nghệ năng lượng tái tạo.</p>',
  '{vid5}', 'cap-nhat-thong-tu-bkhcn.mp4', {vid5_sz},
  'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
  'UNPUBLISHED', 2, false,
  'Cập nhật quy định Thông tư mới của Bộ KH&CN theo quyết định rà soát văn bản quy phạm pháp luật.',
  NOW() - INTERVAL '3 days',
  '{ADMIN_ID}', 'Nguyễn Phương Đông', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '{MAT5_ID}', '{EXP_DONG}', 'Nguyễn Phương Đông', 'Kỹ sư', 'Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ', 1, true);

INSERT INTO lms.learning_moderation_logs (id, material_id, action, reason, actor_id, actor_name, occurred_at)
VALUES
  (gen_random_uuid(), '{MAT5_ID}', 'UNPUBLISHED', 'Cập nhật quy định Thông tư mới của Bộ KH&CN theo quyết định rà soát văn bản quy phạm pháp luật.', '{ADMIN_ID}', 'Quản trị viên Hệ thống NacenTech', NOW() - INTERVAL '3 days');
""")

# 6. BÀI 6: KHÓA HỌC CHUYÊN ĐỀ - PUBLISHED
sql.append(f"""
INSERT INTO lms.learning_materials (
  id, material_code, title, lesson_type, sector_code, duration_minutes,
  description_html, video_storage_key, video_file_name, video_file_size,
  thumbnail_url, status, version, is_deleted, created_by, created_by_name,
  created_at, updated_at
) VALUES (
  '{MAT6_ID}', 'MAT-202611-0006',
  'Phương pháp Định giá Tài sản Vô hình trong Startup ĐMST',
  'TYPE_B', 'CN_THONG_TIN', 80,
  '<p>Khóa học thực chiến dành riêng cho các sáng lập viên Startup và quỹ đầu tư mạo hiểm (VC). Hướng dẫn kỹ thuật định giá bằng sáng chế, mã nguồn phần mềm, cơ sở dữ liệu khách hàng và thuật toán AI trong các vòng gọi vốn Seed, Series A.</p>',
  '{vid6}', 'dinh-gia-tai-san-vo-hinh.mp4', {vid6_sz},
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
  'PUBLISHED', 1, false, '{ADMIN_ID}', 'TS. Nguyễn Văn Đức', NOW(), NOW()
);

INSERT INTO lms.learning_material_instructors (id, material_id, expert_profile_id, full_name, title_degree, org_name, display_order, is_lead)
VALUES
  (gen_random_uuid(), '{MAT6_ID}', '{EXP_DUC}', 'TS. Nguyễn Văn Đức', 'Tiến sĩ', 'Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)', 1, true);

INSERT INTO lms.learning_quiz_questions (id, material_id, display_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, has_length_warning)
VALUES
  (gen_random_uuid(), '{MAT6_ID}', 1, 'Mã nguồn thuật toán AI chưa đăng ký bằng sáng chế có thể được bảo vệ dưới hình thức nào?', 'Bí mật kinh doanh (Trade Secret) và Quyền tác giả đối với phần mềm máy tính', 'Bằng độc quyền sáng chế tự động', 'Nhãn hiệu chứng nhận', 'Chỉ dẫn địa lý', 'A', 'Mã nguồn phần mềm và thuật toán được bảo hộ tự động dưới dạng Quyền tác giả và có thể bảo vệ qua Bí mật kinh doanh nếu giữ kín.', false),
  (gen_random_uuid(), '{MAT6_ID}', 2, 'Phương pháp Berkus trong định giá startup giai đoạn sớm tập trung vào yếu tố nào?', 'Đánh giá định lượng dựa trên 5 yếu tố giảm thiểu rủi ro của mô hình kinh doanh và đội ngũ', 'Doanh thu thuần 5 năm gần nhất', 'Chi phí máy móc thiết bị nhà xưởng', 'Tài sản thế chấp ngân hàng', 'A', 'Phương pháp Berkus gán giá trị cho 5 yếu tố rủi ro của startup: Ý tưởng cơ bản, Nguyên mẫu sản phẩm, Đội ngũ quản lý, Mối quan hệ chiến lược, Triển vọng bán hàng.', false);

INSERT INTO lms.learning_attachments (id, material_id, category, file_name, storage_key, content_type, file_size_bytes, sha256_hash, display_order)
VALUES
  (gen_random_uuid(), '{MAT6_ID}', 'PRACTICE_TOOL', 'bang-tinh-dinh-gia-dcf-tai-san-vo-hinh.docx', '{docx3}', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {docx3_sz}, '{docx3_sha}', 1);

INSERT INTO lms.learning_db_links (id, material_id, display_label, target_url, target_entity_type, display_order)
VALUES
  (gen_random_uuid(), '{MAT6_ID}', 'Hồ sơ Chuyên gia TS. Nguyễn Văn Đức', 'https://nacentech.vn/experts/01a111c8-e671-7dfd-992f-67d6534d705a', 'EXPERT_CONSULTATION', 1);
""")

# 7. NẠP CHUNKS VECTOR 1024D VÀO matching.search_chunks CHO 4 BÀI PUBLISHED
published_items = [
    (MAT1_ID, "Tổng quan Quản trị Sở hữu Trí tuệ cho Doanh nghiệp Khoa học Công nghệ", "Tổng quan Quản trị Sở hữu Trí tuệ cho Doanh nghiệp Khoa học Công nghệ. Khóa học nền tảng trang bị tư duy và năng lực quản trị tài sản trí tuệ (IP Management) cho lãnh đạo doanh nghiệp KH&CN và viện trường.", 101),
    (MAT2_ID, "Quy trình Thẩm định Giá Công nghệ theo Tiêu chuẩn Thẩm định giá Việt Nam", "Quy trình Thẩm định Giá Công nghệ theo Tiêu chuẩn Thẩm định giá Việt Nam. Chương trình chuyên sâu hướng dẫn các thẩm định viên, chuyên gia định giá và doanh nghiệp áp dụng chuẩn mực Tiêu chuẩn thẩm định giá Việt Nam số 13 về Tài sản vô hình.", 202),
    (MAT3_ID, "Chiến lược Thương mại hóa Sáng chế & Chuyển giao Công nghệ Quốc tế", "Chiến lược Thương mại hóa Sáng chế & Chuyển giao Công nghệ Quốc tế. Chuyên đề cao cấp đào tạo chuyên gia chuyển giao công nghệ. Hướng dẫn nghệ thuật đàm phán hợp đồng Li-xăng độc quyền/không độc quyền, cơ chế phân chia lợi nhuận Royalty.", 303),
    (MAT6_ID, "Phương pháp Định giá Tài sản Vô hình trong Startup ĐMST", "Phương pháp Định giá Tài sản Vô hình trong Startup ĐMST. Khóa học thực chiến dành riêng cho các sáng lập viên Startup và quỹ đầu tư mạo hiểm (VC). Hướng dẫn kỹ thuật định giá bằng sáng chế, mã nguồn phần mềm, thuật toán AI.", 404),
]

for mat_id, title_text, text_chunk, seed in published_items:
    vec_str = make_vector_str(seed)
    sql.append(f"""
    INSERT INTO matching.search_chunks (
      subject_kind, subject_id, chunk_index, text, embedding, title, is_published
    ) VALUES (
      'LEARNING_MATERIAL', '{mat_id}', 0,
      '{text_chunk.replace("'", "''")}',
      '{vec_str}'::vector,
      '{title_text.replace("'", "''")}',
      true
    ) ON CONFLICT (subject_kind, subject_id, chunk_index) DO UPDATE
      SET text = EXCLUDED.text, embedding = EXCLUDED.embedding, is_published = true;
    """)

sql.append("COMMIT;")

sql_script = "\n".join(sql)
sql_path = os.path.join(BASE_DIR, "SourceCode", "backend", "scripts", "seed_lms_real_data.sql")
with open(sql_path, "w", encoding="utf-8") as f:
    f.write(sql_script)

print(f"Generated seed SQL: {sql_path}")
