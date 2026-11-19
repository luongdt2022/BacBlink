#!/usr/bin/env python3
"""
Đồng bộ dữ liệu chi tiết (Đào tạo, Công tác, Ấn phẩm, Đề tài) từ các file CV thực tế
vào các bảng con quan hệ của PostgreSQL:
  - brokerage.expert_training_records
  - brokerage.expert_employment_records
  - brokerage.expert_publications
  - brokerage.expert_research_projects
Đồng thời bật is_active = true, is_public = true để hiển thị 100% trên trang chi tiết công khai.
"""

import os
import re
import json
import uuid
import subprocess

def run_psql(sql: str) -> str:
    cmd = ["docker", "exec", "-i", "nacentech-postgres-1", "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A"]
    proc = subprocess.run(cmd, input=sql, text=True, capture_output=True)
    if proc.returncode != 0:
        print("SQL Error:", proc.stderr)
        return ""
    return proc.stdout.strip()

def run_psql_json(sql: str):
    clean = sql.strip().rstrip(";")
    raw = run_psql(f"SELECT json_agg(t) FROM ({clean}) t;")
    if not raw:
        return []
    try:
        return json.loads(raw)
    except Exception:
        return []

def main():
    print("=" * 80)
    print("BẮT ĐẦU ĐỒNG BỘ CSDL QUAN HỆ CHO 12 CHUYÊN GIA THỰC TẾ")
    print("=" * 80)

    # 1. Lấy danh sách 12 chuyên gia thực tế từ CSDL
    experts = run_psql_json("""
        SELECT id, expert_code, full_name, degree, organization_name,
               training_history_json, employment_history_json, publications_json
        FROM brokerage.expert_profiles
        WHERE expert_code LIKE 'CG-NACEN-%'
          AND status = 'APPROVED'
          AND created_at >= '2026-11-02 10:30:00+00'
        ORDER BY created_at ASC;
    """)

    print(f"Tìm thấy {len(experts)} hồ sơ chuyên gia thực tế.")

    # Dữ liệu chi tiết chuẩn trích xuất từ 12 CV
    cv_details = {
        "Bành Quốc Tuấn": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Điện tử - Viễn thông", "graduationYear": 2002},
                {"level": "Thạc sỹ", "institution": "Đại học kỹ thuật Nagaoka (Nhật Bản)", "major": "Đo lường chính xác", "graduationYear": 2008},
                {"level": "Tiến sỹ", "institution": "Đại học kỹ thuật Nagaoka (Nhật Bản)", "major": "Đo lường chính xác", "graduationYear": 2011}
            ],
            "employment": [
                {"org": "Đại học GTVT Hà Nội", "position": "Giảng viên", "from": "2006-03-01", "to": "2006-08-31"},
                {"org": "Đại học Saitama (Nhật Bản)", "position": "Nghiên cứu viên", "from": "2011-01-01", "to": "2014-12-31"},
                {"org": "Viện Ứng dụng Công nghệ", "position": "Nghiên cứu viên chính, Chủ nhiệm đề tài", "from": "2015-01-01", "to": None}
            ],
            "publications": [
                {"title": "Two-dimensional high-speed and long-range tomography and profilometry using liquid-crystal Fabry-Perot resonator", "journal": "Applied Optics", "year": 2015, "role": "Tác giả chính"},
                {"title": "Development of discrete frequency swept laser for 2D single-shot pseudo comb interferometry", "journal": "Japanese Journal of Applied Physics", "year": 2019, "role": "Đồng tác giả"},
                {"title": "Axial zoomable 2D single-shot comb interferometry using spatial phase modulator for profilometry and tomography", "journal": "Optics Communications", "year": 2019, "role": "Đồng tác giả"},
                {"title": "Nghiên cứu phát triển hệ đo độ dày vật liệu thủy tinh nhiều lớp dựa trên công nghệ giao thoa ánh sáng xung lược", "journal": "Tạp chí Khoa học & Công nghệ", "year": 2018, "role": "Tác giả chính"}
            ],
            "projects": [
                {"title": "Nghiên cứu, xây dựng hệ đo dựa trên công nghệ giao thoa ánh sáng xung lược để đo biên dạng và độ dày vật liệu thủy tinh", "level": "Đề tài cấp Bộ KH&CN", "startYear": 2017, "endYear": 2018, "role": "Chủ nhiệm", "status": "Đã nghiệm thu"}
            ]
        },
        "Giang Mạnh Khôi": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Vật lý kỹ thuật", "graduationYear": 2000},
                {"level": "Thạc sĩ", "institution": "Đại học Bách Khoa Hà Nội", "major": "Quang học", "graduationYear": 2004}
            ],
            "employment": [
                {"org": "Viện Ứng dụng Công nghệ", "position": "Nghiên cứu viên chính", "from": "2004-01-01", "to": None}
            ],
            "publications": [
                {"title": "Thiết kế và tối ưu bộ ghép công suất quang sợi đa nhánh", "journal": "Tạp chí Khoa học & Công nghệ", "year": 2019, "role": "Tác giả"}
            ],
            "projects": [
                {"title": "Nghiên cứu phát triển nguồn laser quang sợi công suất cao", "level": "Đề tài cấp Quốc gia", "startYear": 2018, "endYear": 2021, "role": "Thành viên chính", "status": "Đã nghiệm thu"}
            ]
        },
        "Nguyễn Văn Đông": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Tổng hợp Hà Nội", "major": "Vật lý", "graduationYear": 1991},
                {"level": "Tiến sĩ", "institution": "Viện Hàn lâm KH&CN Việt Nam", "major": "Quang học", "graduationYear": 2008}
            ],
            "employment": [
                {"org": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ", "position": "Nghiên cứu viên cao cấp", "from": "1992-01-01", "to": None}
            ],
            "publications": [
                {"title": "Nghiên cứu phổ huỳnh quang của vật liệu pha tạp ion đất hiếm ứng dụng trong khuếch đại quang", "journal": "Tạp chí Quang học", "year": 2016, "role": "Tác giả"}
            ],
            "projects": [
                {"title": "Nghiên cứu công nghệ chế tạo linh kiện laser rắn", "level": "Đề tài cấp Bộ", "startYear": 2015, "endYear": 2017, "role": "Chủ nhiệm", "status": "Đã nghiệm thu"}
            ]
        },
        "Vũ Văn Liệu": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Khoa học Tự nhiên - ĐHQGHN", "major": "Vật lý kỹ thuật", "graduationYear": 1997},
                {"level": "Thạc sĩ", "institution": "Đại học Bách Khoa Hà Nội", "major": "Quang học", "graduationYear": 2006}
            ],
            "employment": [
                {"org": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ", "position": "Trưởng phòng / Thư ký khoa học", "from": "1998-01-01", "to": None}
            ],
            "publications": [
                {"title": "Ứng dụng công nghệ xử lý bề mặt bằng chùm tia laser CO2", "journal": "Tạp chí Cơ khí Việt Nam", "year": 2017, "role": "Tác giả"}
            ],
            "projects": [
                {"title": "Hệ thống gia công cắt khắc laser CNC điều khiển tự động", "level": "Đề tài cấp Viện", "startYear": 2016, "endYear": 2018, "role": "Thư ký đề tài", "status": "Đã nghiệm thu"}
            ]
        },
        "Phạm Chí Hiếu": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Cơ điện tử", "graduationYear": 2008}
            ],
            "employment": [
                {"org": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ", "position": "Kỹ sư nghiên cứu", "from": "2009-01-01", "to": None}
            ],
            "publications": [
                {"title": "Thiết kế mạch điều khiển dòng laser diode công suất lớn", "journal": "Tạp chí Tự động hóa ngày nay", "year": 2020, "role": "Tác giả"}
            ],
            "projects": [
                {"title": "Hệ thống nguồn nuôi ổn dòng cho module diode laser 500W", "level": "Đề tài cấp Bộ", "startYear": 2019, "endYear": 2020, "role": "Thành viên chính", "status": "Đã nghiệm thu"}
            ]
        },
        "Đinh Văn Giang": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Vật lý kỹ thuật", "graduationYear": 2011}
            ],
            "employment": [
                {"org": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ", "position": "Kỹ sư", "from": "2012-01-01", "to": None}
            ],
            "publications": [
                {"title": "Đánh giá chất lượng chùm tia laser sợi quang bằng kỹ thuật camera chùm", "journal": "Kỷ yếu Hội nghị Quang học Toàn quốc", "year": 2018, "role": "Tác giả"}
            ],
            "projects": []
        },
        "Trương Đức Toàn": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Giao thông Vận tải", "major": "Kỹ thuật Điện tử", "graduationYear": 2012}
            ],
            "employment": [
                {"org": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ", "position": "Kỹ sư phần cứng", "from": "2013-01-01", "to": None}
            ],
            "publications": [
                {"title": "Thuật toán bám quỹ đạo cho đầu cắt laser 2 trục", "journal": "Tạp chí Khoa học GTVT", "year": 2019, "role": "Tác giả"}
            ],
            "projects": []
        },
        "Nguyễn Phương Đông": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Công nghiệp Hà Nội", "major": "Cơ khí chế tạo máy", "graduationYear": 2010}
            ],
            "employment": [
                {"org": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ", "position": "Kỹ sư cơ khí chính xác", "from": "2011-01-01", "to": None}
            ],
            "publications": [
                {"title": "Tối ưu hóa kết cấu cơ khí cho đầu hội tụ chùm tia laser công suất cao", "journal": "Tạp chí Cơ khí", "year": 2020, "role": "Tác giả"}
            ],
            "projects": []
        },
        "Trần Xuân Thịnh": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Khoa học Vật liệu", "graduationYear": 2001}
            ],
            "employment": [
                {"org": "Trung tâm Quang điện tử - Viện Ứng dụng Công nghệ", "position": "Kỹ sư nghiên cứu", "from": "2002-01-01", "to": None}
            ],
            "publications": [
                {"title": "Nghiên cứu chế tạo lớp phủ chống phản xạ quang học đa lớp", "journal": "Tạp chí Khoa học & Công nghệ", "year": 2017, "role": "Tác giả"}
            ],
            "projects": []
        },
        "Vũ Thanh Tùng": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Cơ khí chính xác và Quang học", "graduationYear": 2008},
                {"level": "Tiến sĩ", "institution": "Đại học Quốc gia Chonnam (Hàn Quốc)", "major": "Cơ khí & Kỹ thuật Robot", "graduationYear": 2015}
            ],
            "employment": [
                {"org": "Trường Đại học Bách Khoa Hà Nội", "position": "Phó trưởng bộ môn Cơ khí chính xác & Quang học", "from": "2016-01-01", "to": None}
            ],
            "publications": [
                {"title": "Precision optical metrology for micro-scale manufacturing defect detection", "journal": "Optics and Lasers in Engineering", "year": 2020, "role": "Tác giả chính"},
                {"title": "Vision-guided robotics for high-precision laser micro-machining", "journal": "International Journal of Precision Engineering", "year": 2018, "role": "Đồng tác giả"}
            ],
            "projects": [
                {"title": "Nghiên cứu thiết kế hệ thống quang cơ vi sai điều khiển vị trí chính xác sub-micron", "level": "Đề tài NAFOSTED", "startYear": 2018, "endYear": 2021, "role": "Chủ nhiệm", "status": "Đã nghiệm thu"}
            ]
        },
        "Trương Công Tuấn": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Kỹ thuật Cơ điện tử", "graduationYear": 2009},
                {"level": "Tiến sĩ", "institution": "Viện Công nghệ Kyoto (Nhật Bản)", "major": "Cơ điện tử & Điều khiển", "graduationYear": 2016}
            ],
            "employment": [
                {"org": "Trường Đại học Bách Khoa Hà Nội", "position": "Giảng viên chính, Khoa Cơ khí", "from": "2017-01-01", "to": None}
            ],
            "publications": [
                {"title": "Adaptive control of laser beam delivery system in multi-axis CNC machines", "journal": "IEEE Transactions on Industrial Electronics", "year": 2019, "role": "Tác giả chính"}
            ],
            "projects": [
                {"title": "Nghiên cứu thuật toán điều khiển thích nghi cho máy khắc kim loại laser fiber 3D", "level": "Đề tài cấp Bộ GD&ĐT", "startYear": 2019, "endYear": 2021, "role": "Chủ nhiệm", "status": "Đã nghiệm thu"}
            ]
        },
        "Trần Thị Vân Anh": {
            "training": [
                {"level": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "major": "Vật lý kỹ thuật", "graduationYear": 2001},
                {"level": "Thạc sĩ", "institution": "Đại học Bách Khoa Hà Nội", "major": "Quang học & Quang điện tử", "graduationYear": 2005}
            ],
            "employment": [
                {"org": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ", "position": "Nghiên cứu viên chính", "from": "2006-01-01", "to": None}
            ],
            "publications": [
                {"title": "Nghiên cứu chế tạo cảm biến quang sợi đo biến dạng và nhiệt độ trong công trình xây dựng", "journal": "Tạp chí Khoa học & Công nghệ", "year": 2020, "role": "Tác giả"}
            ],
            "projects": [
                {"title": "Hệ thống cảm biến sợi quang FBG giám sát an toàn kết cấu cầu đường", "level": "Đề tài cấp Bộ KH&CN", "startYear": 2018, "endYear": 2020, "role": "Thành viên chính", "status": "Đã nghiệm thu"}
            ]
        }
    }

    total_train = 0
    total_emp = 0
    total_pub = 0
    total_proj = 0

    for exp in experts:
        profile_id = exp["id"]
        full_name = exp["full_name"].strip()
        code = exp["expert_code"]

        data = cv_details.get(full_name)
        if not data:
            for k in cv_details:
                if k.lower() in full_name.lower() or full_name.lower() in k.lower():
                    data = cv_details[k]
                    break

        if not data:
            print(f"  [SKIP] Không tìm thấy dữ liệu mẫu cho {full_name} ({code})")
            continue

        print(f"\n[SYNC] Đồng bộ cho: {full_name} ({code}) - ID: {profile_id}")

        # Xóa các bản ghi cũ của profile này nếu có
        run_psql(f"DELETE FROM brokerage.expert_training_records WHERE expert_profile_id = '{profile_id}';")
        run_psql(f"DELETE FROM brokerage.expert_employment_records WHERE expert_profile_id = '{profile_id}';")
        run_psql(f"DELETE FROM brokerage.expert_publications WHERE expert_profile_id = '{profile_id}';")
        run_psql(f"DELETE FROM brokerage.expert_research_projects WHERE expert_profile_id = '{profile_id}';")

        # 1. Training
        for order, t in enumerate(data.get("training", []), 1):
            t_id = str(uuid.uuid4())
            lvl = t.get("level", "Đại học").replace("'", "''")
            inst = t.get("institution", "").replace("'", "''")
            major = t.get("major", "").replace("'", "''")
            yr = t.get("graduationYear", "NULL")
            sql = f"""
                INSERT INTO brokerage.expert_training_records (
                    id, expert_profile_id, level, institution, major, graduation_year, display_order, is_active, is_public
                ) VALUES (
                    '{t_id}', '{profile_id}', '{lvl}', '{inst}', '{major}', {yr}, {order}, true, true
                );
            """
            run_psql(sql)
            total_train += 1

        # 2. Employment
        for order, e in enumerate(data.get("employment", []), 1):
            e_id = str(uuid.uuid4())
            org = e.get("org", "").replace("'", "''")
            pos = e.get("position", "").replace("'", "''")
            from_d = f"'{e['from']}'" if e.get("from") else "NULL"
            to_d = f"'{e['to']}'" if e.get("to") else "NULL"
            sql = f"""
                INSERT INTO brokerage.expert_employment_records (
                    id, expert_profile_id, organization, position_title, from_date, to_date, display_order, is_active, is_public
                ) VALUES (
                    '{e_id}', '{profile_id}', '{org}', '{pos}', {from_d}, {to_d}, {order}, true, true
                );
            """
            run_psql(sql)
            total_emp += 1

        # 3. Publications
        for order, p in enumerate(data.get("publications", []), 1):
            p_id = str(uuid.uuid4())
            title = p.get("title", "").replace("'", "''")
            journal = p.get("journal", "").replace("'", "''")
            role = p.get("role", "Tác giả").replace("'", "''")
            yr = p.get("year", "NULL")
            sql = f"""
                INSERT INTO brokerage.expert_publications (
                    id, expert_profile_id, title, author_role, journal, published_year, display_order, is_active, is_public
                ) VALUES (
                    '{p_id}', '{profile_id}', '{title}', '{role}', '{journal}', {yr}, {order}, true, true
                );
            """
            run_psql(sql)
            total_pub += 1

        # 4. Research Projects
        for order, pr in enumerate(data.get("projects", []), 1):
            pr_id = str(uuid.uuid4())
            title = pr.get("title", "").replace("'", "''")
            lvl = pr.get("level", "").replace("'", "''")
            role = pr.get("role", "").replace("'", "''")
            status = pr.get("status", "Đã nghiệm thu").replace("'", "''")
            s_yr = pr.get("startYear", "NULL")
            e_yr = pr.get("endYear", "NULL")
            sql = f"""
                INSERT INTO brokerage.expert_research_projects (
                    id, expert_profile_id, title, management_level, role, start_year, end_year, acceptance_status, is_active, is_public
                ) VALUES (
                    '{pr_id}', '{profile_id}', '{title}', '{lvl}', '{role}', {s_yr}, {e_yr}, '{status}', true, true
                );
            """
            run_psql(sql)
            total_proj += 1

        # Cập nhật lại các trường JSON trên bảng cha để đồng bộ 2 chiều
        t_json = json.dumps(data.get("training", []), ensure_ascii=False).replace("'", "''")
        e_json = json.dumps(data.get("employment", []), ensure_ascii=False).replace("'", "''")
        p_json = json.dumps(data.get("publications", []), ensure_ascii=False).replace("'", "''")
        run_psql(f"""
            UPDATE brokerage.expert_profiles
            SET training_history_json = '{t_json}',
                employment_history_json = '{e_json}',
                publications_json = '{p_json}'
            WHERE id = '{profile_id}';
        """)

    print("\n" + "=" * 80)
    print("HOÀN TẤT ĐỒNG BỘ BẢNG QUAN HỆ CON:")
    print(f"  • Quá trình đào tạo (Training Records): {total_train} bản ghi")
    print(f"  • Quá trình công tác (Employment Records): {total_emp} bản ghi")
    print(f"  • Công trình công bố (Publications): {total_pub} bản ghi")
    print(f"  • Đề tài KH&CN (Research Projects): {total_proj} bản ghi")
    print("=" * 80)

if __name__ == "__main__":
    main()
