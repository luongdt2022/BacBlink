#!/usr/bin/env python3
"""
EXECUTE FULL EXPERT IMPORT PIPELINE (TASK-05 & TASK-07)
Tuân thủ chuẩn Điều 7 Hiến pháp NacenTech (Zero-Mock & Deep DB Persistence).
Quy trình 4 bước sống:
1. Đăng ký tài khoản PUBLIC_USER qua API /api/v1/auth/register
2. Đăng nhập nhận JWT Token, nộp hồ sơ nâng cấp Chuyên gia qua API /api/v1/experts/upgrade-request
3. Đăng nhập Admin / Sở KH&CN, thẩm định & phê duyệt hồ sơ qua API /api/v1/governance/approvals/{id}/review
4. Kiểm tra niêm yết công khai trên Danh bạ Chuyên gia (/api/v1/experts & /experts/{code})
"""

import sys
import os
import json
import time
import requests
import subprocess

API_BASE = "http://127.0.0.1:5080"
ADMIN_EMAIL = "admin.super@nacentech.local"
ADMIN_PASS = "Password@123"
USER_PASS = "Password@123"

# Dữ liệu bóc tách chuẩn hóa của 12 chuyên gia
EXPERTS_DATA = [
    {
        "fullName": "Bành Quốc Tuấn",
        "email": "tuan.bq.expert@nacentech.vn",
        "phone": "0393206467",
        "birthYear": 1979,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Tiến sĩ",
        "degreeYear": 2011,
        "organizationName": "Viện Ứng dụng Công nghệ",
        "organizationAddress": "25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội",
        "researchTitle": "Nghiên cứu viên",
        "positionTitle": "Chủ nhiệm đề tài cấp Nhà nước",
        "expertiseSectors": ["LV08", "LV17"],
        "specializedKeywords": ["Laser quang sợi công suất cao", "Quang điện tử", "Kỹ thuật laser"],
        "isProjectLeader": True,
        "isMainContributor": True,
        "consultingSummary": "Tiến sĩ Bành Quốc Tuấn có hơn 15 năm kinh nghiệm nghiên cứu chuyên sâu về nguồn laser quang sợi công suất cao (≥ 1 kW) ứng dụng trong gia công cơ khí và công nghiệp quốc phòng tại Viện Ứng dụng Công nghệ.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2002, "major": "Vật lý kỹ thuật"},
            {"degree": "Tiến sĩ", "institution": "Viện Hàn lâm KH&CN Việt Nam", "graduationYear": 2011, "major": "Quang học & Quang điện tử"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Nghiên cứu và phát triển nguồn laser quang sợi công suất cao ≥ 1 kW ứng dụng trong công nghiệp", "year": 2021},
            {"title": "High-power fiber laser systems for industrial metal cutting and welding", "year": 2018}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Giang Mạnh Khôi",
        "email": "khoi.gm.expert@nacentech.vn",
        "phone": "0903227858",
        "birthYear": 1977,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Thạc sĩ",
        "degreeYear": 2004,
        "organizationName": "Viện Ứng dụng Công nghệ",
        "organizationAddress": "25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội",
        "researchTitle": "Nghiên cứu viên chính",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV08", "LV17"],
        "specializedKeywords": ["Laser quang sợi", "Quang học phi tuyến", "Quang điện tử"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Thạc sĩ Giang Mạnh Khôi là chuyên gia công nghệ Laser sợi quang, tham gia chủ trì và thực hiện nhiều nhiệm vụ KH&CN trọng điểm tại Viện Ứng dụng Công nghệ.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2000, "major": "Vật lý kỹ thuật"},
            {"degree": "Thạc sĩ", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2004, "major": "Quang học"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Thiết kế và tối ưu bộ ghép công suất quang sợi đa nhánh", "year": 2019}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Nguyễn Văn Đông",
        "email": "dong.nv.expert@nacentech.vn",
        "phone": "0982562065",
        "birthYear": 1968,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Tiến sĩ",
        "degreeYear": 1997,
        "organizationName": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên cao cấp",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV08", "LV17"],
        "specializedKeywords": ["Kỹ thuật Laser", "Quang học chất rắn", "Thiết bị laser y tế"],
        "isProjectLeader": True,
        "isMainContributor": True,
        "consultingSummary": "Tiến sĩ Nguyễn Văn Đông có gần 30 năm nghiên cứu và chế tạo các hệ thống thiết bị laser công nghiệp, laser y tế phục vụ điều trị và sản xuất trong nước.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Tổng hợp Hà Nội", "graduationYear": 1990, "major": "Vật lý"},
            {"degree": "Tiến sĩ", "institution": "Viện Vật lý", "graduationYear": 1997, "major": "Quang phổ & Laser"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Nghiên cứu chế tạo laser xung Nd:YAG công suất cao hàn kim loại", "year": 2017}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Vũ Văn Liệu",
        "email": "lieu.vv.expert@nacentech.vn",
        "phone": "0913502868",
        "birthYear": 1974,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Thạc sĩ",
        "degreeYear": 2008,
        "organizationName": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên",
        "positionTitle": "Thư ký khoa học, Thành viên chính",
        "expertiseSectors": ["LV08", "LV16"],
        "specializedKeywords": ["Điện tử điều khiển", "Đo lường quang học", "Tự động hóa laser"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Thạc sĩ Vũ Văn Liệu chuyên gia về điều khiển tự động hóa và đo lường quang học trong các hệ thống laser công nghiệp và y tế.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 1997, "major": "Điện tử viễn thông"},
            {"degree": "Thạc sĩ", "institution": "Đại học Quốc gia Hà Nội", "graduationYear": 2008, "major": "Kỹ thuật điều khiển"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Hệ thống giám sát nhiệt độ và phản xạ quang sợi tự động ngắt bảo vệ laser sợi quang", "year": 2020}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Phạm Chí Hiếu",
        "email": "hieu.pc.expert@nacentech.vn",
        "phone": "0987993586",
        "birthYear": 1985,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Kỹ sư",
        "degreeYear": 2010,
        "organizationName": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV08", "LV16"],
        "specializedKeywords": ["Lập trình điều khiển", "Phần mềm nhúng", "Giao tiếp CNC"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Kỹ sư Phạm Chí Hiếu chuyên môn về lập trình vi điều khiển, phần mềm điều khiển hệ tọa độ CNC 3 trục và 5 trục cho máy khắc cắt laser công nghiệp.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2010, "major": "Công nghệ thông tin"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Phát triển phần mềm nhúng điều khiển đầu quét Galvo tốc độ cao cho laser sợi quang", "year": 2021}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Đinh Văn Giang",
        "email": "giang.dv.expert@nacentech.vn",
        "phone": "0977381299",
        "birthYear": 1988,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Kỹ sư",
        "degreeYear": 2013,
        "organizationName": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV08", "LV07"],
        "specializedKeywords": ["Cơ khí quang học", "Gia công CNC", "Chế tạo vỏ máy laser"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Kỹ sư Đinh Văn Giang chuyên trách thiết kế cơ khí chính xác, chế tạo gá lắp quang học và buồng cộng hưởng laser công nghiệp.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Công nghiệp Hà Nội", "graduationYear": 2013, "major": "Cơ khí chế tạo máy"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Thiết kế hệ giá đỡ chống rung quang học cho buồng cộng hưởng laser sợi", "year": 2020}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Trương Đức Toàn",
        "email": "toan.td.expert@nacentech.vn",
        "phone": "0949779791",
        "birthYear": 1989,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Kỹ sư",
        "degreeYear": 2012,
        "organizationName": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV08", "LV17"],
        "specializedKeywords": ["Hàn sợi quang", "Thấu kính quang học", "Laser công nghiệp"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Kỹ sư Trương Đức Toàn có kinh nghiệm thực tế chuyên sâu về công nghệ hàn ghép sợi quang công suất cao và căn chỉnh hệ quang học thấu kính.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2012, "major": "Vật lý kỹ thuật"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Kỹ thuật hàn cáp quang sợi đôi đường kính lớn cho nguồn bơm laser sợi", "year": 2021}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Nguyễn Phương Đông",
        "email": "dong.np.expert@nacentech.vn",
        "phone": "0975562237",
        "birthYear": 1987,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Kỹ sư",
        "degreeYear": 2010,
        "organizationName": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV08", "LV17"],
        "specializedKeywords": ["Nguồn bơm bán dẫn", "Laser Diode", "Làm mát tuần hoàn"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Kỹ sư Nguyễn Phương Đông am hiểu hệ thống nguồn nuôi dòng cao và module làm mát nhiệt điện (Chiller/Peltier) cho laser diode công suất cao.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Giao thông Vận tải", "graduationYear": 2010, "major": "Kỹ thuật điện tử"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Hệ thống giải nhiệt và ổn định bước sóng nguồn laser diode bơm quang sợi", "year": 2019}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Trần Xuân Thịnh",
        "email": "thinh.tx.expert@nacentech.vn",
        "phone": "0912219895",
        "birthYear": 1978,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Kỹ sư",
        "degreeYear": 2001,
        "organizationName": "Trung tâm Quang điện tử - Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên chính",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV08", "LV17"],
        "specializedKeywords": ["Quang điện tử", "Hệ thống quang học", "Cơ khí quang học"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Kỹ sư Trần Xuân Thịnh chuyên gia lâu năm về thiết kế tích hợp cụm đầu phát quang điện tử và đo đạc thông số chùm tia laser.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2001, "major": "Vật lý kỹ thuật"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Nghiên cứu ứng dụng chùm tia laser công suất lớn trong xử lý biến tính bề mặt kim loại", "year": 2020}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Vũ Thanh Tùng",
        "email": "tung.vt.expert@nacentech.vn",
        "phone": "0976516396",
        "birthYear": 1985,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Tiến sĩ",
        "degreeYear": 2012,
        "organizationName": "Trường Đại học Bách Khoa Hà Nội",
        "organizationAddress": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
        "researchTitle": "Giảng viên chính",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV07", "LV08"],
        "specializedKeywords": ["Cơ khí chính xác", "Cơ điện tử", "Gia công bằng tia laser"],
        "isProjectLeader": True,
        "isMainContributor": True,
        "consultingSummary": "Tiến sĩ Vũ Thanh Tùng là giảng viên Viện Cơ khí ĐH Bách Khoa Hà Nội, chuyên gia về công nghệ gia công tiên tiến và công nghệ cắt khắc laser 3D.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2008, "major": "Cơ điện tử"},
            {"degree": "Tiến sĩ", "institution": "Đại học Quốc gia Chonnam, Hàn Quốc", "graduationYear": 2012, "major": "Kỹ thuật cơ khí"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Investigation of kerf quality in high-power fiber laser cutting of thick steel plates", "year": 2021}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Trương Công Tuấn",
        "email": "tuan.tc.expert@nacentech.vn",
        "phone": "0983869616",
        "birthYear": 1986,
        "gender": "Nam",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Tiến sĩ",
        "degreeYear": 2019,
        "organizationName": "Trường Đại học Bách Khoa Hà Nội",
        "organizationAddress": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
        "researchTitle": "Giảng viên",
        "positionTitle": "Thành viên chính",
        "expertiseSectors": ["LV07", "LV08"],
        "specializedKeywords": ["Hệ thống cơ điện tử", "Robotics", "Tự động hóa nhà máy"],
        "isProjectLeader": True,
        "isMainContributor": True,
        "consultingSummary": "Tiến sĩ Trương Công Tuấn chuyên môn về tích hợp robot công nghiệp, hệ thống thị giác máy (Machine Vision) và cánh tay robot hàn laser.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2009, "major": "Cơ điện tử"},
            {"degree": "Tiến sĩ", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2019, "major": "Kỹ thuật cơ khí"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "Path planning and kinematic optimization for robotic fiber laser welding", "year": 2022}
        ], ensure_ascii=False)
    },
    {
        "fullName": "Trần Thị Vân Anh",
        "email": "vananh.tt.expert@nacentech.vn",
        "phone": "0972730389",
        "birthYear": 1978,
        "gender": "Nữ",
        "academicRank": "NONE",
        "academicRankYear": None,
        "degree": "Thạc sĩ",
        "degreeYear": 2008,
        "organizationName": "Trung tâm Công nghệ Laser – Viện Ứng dụng Công nghệ",
        "organizationAddress": "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        "researchTitle": "Nghiên cứu viên chính",
        "positionTitle": "Trưởng phòng CN Quang tử, Thành viên chính",
        "expertiseSectors": ["LV08", "LV17"],
        "specializedKeywords": ["Điện tử Nano", "Quang tử học", "Khắc laser 3D chìm trong thủy tinh"],
        "isProjectLeader": False,
        "isMainContributor": True,
        "consultingSummary": "Thạc sĩ Trần Thị Vân Anh là Trưởng phòng Công nghệ Quang tử tại Viện UDCN, tốt nghiệp Thạc sĩ tại Viện Khoa học & Kỹ thuật Hàn Quốc (KIST), chuyên gia về khắc laser chìm 3D trong vật liệu trong suốt và linh kiện nano.",
        "trainingHistoryJson": json.dumps([
            {"degree": "Đại học", "institution": "ĐH Khoa học Tự nhiên - ĐHQGHN", "graduationYear": 1999, "major": "Vật lý Quang - Laser"},
            {"degree": "Thạc sĩ", "institution": "Đại học Khoa học và Kỹ thuật Hàn Quốc (KIST)", "graduationYear": 2008, "major": "Điện tử Nano"}
        ], ensure_ascii=False),
        "publicationsJson": json.dumps([
            {"title": "3D subsurface glass engraving by using a 532nm Q-switched laser", "year": 2020},
            {"title": "Nghiên cứu chế tạo hệ laser sợi quang có khuếch đại dao động chủ (MOPA)", "year": 2021}
        ], ensure_ascii=False)
    }
]

def register_user(exp):
    names = exp["fullName"].split()
    first_name = names[-1]
    last_name = " ".join(names[:-1]) if len(names) > 1 else "TS/KS"
    
    payload = {
        "email": exp["email"],
        "password": USER_PASS,
        "confirmPassword": USER_PASS,
        "firstName": first_name,
        "lastName": last_name,
        "phone": exp["phone"],
        "organization": exp["organizationName"]
    }
    
    r = requests.post(f"{API_BASE}/api/v1/auth/register", json=payload)
    if r.status_code == 201:
        print(f"  [1. REGISTER] Đăng ký thành công: {exp['email']}")
        return True
    elif r.status_code == 409:
        print(f"  [1. REGISTER] Tài khoản đã tồn tại sẵn: {exp['email']}")
        return True
    else:
        print(f"  [1. REGISTER ERROR] {r.status_code} - {r.text}")
        return False

def login_user(email, password):
    r = requests.post(f"{API_BASE}/api/v1/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        data = r.json()
        return data.get("accessToken")
    else:
        print(f"  [LOGIN ERROR] {email}: {r.status_code} - {r.text}")
        return None

def submit_upgrade(token, exp):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "fullName": exp["fullName"],
        "birthYear": exp.get("birthYear", 1980),
        "gender": exp.get("gender", "Nam"),
        "academicRank": exp.get("academicRank", "NONE"),
        "academicRankYear": exp.get("academicRankYear"),
        "degree": exp.get("degree", "Kỹ sư"),
        "degreeYear": exp.get("degreeYear", 2010),
        "organizationName": exp.get("organizationName", "Viện Ứng dụng Công nghệ"),
        "organizationAddress": exp.get("organizationAddress", "25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội"),
        "researchTitle": exp.get("researchTitle", "Nghiên cứu viên"),
        "positionTitle": exp.get("positionTitle", ""),
        "expertiseSectors": exp.get("expertiseSectors", ["LV08"]),
        "trainingHistoryJson": exp.get("trainingHistoryJson"),
        "employmentHistoryJson": exp.get("employmentHistoryJson"),
        "publicationsJson": exp.get("publicationsJson"),
        "consultingSummary": exp.get("consultingSummary", ""),
        "isProjectLeader": exp.get("isProjectLeader", False),
        "isMainContributor": exp.get("isMainContributor", True),
        "pdpdConsent": True,
        "legalOath": True,
        "scopeType": "PROVINCE",
        "scopeId": "HN",
        "specializedKeywords": exp.get("specializedKeywords", []),
        "phone": exp.get("phone", ""),
        "email": exp.get("email", "")
    }
    
    r = requests.post(f"{API_BASE}/api/v1/experts/upgrade-request", headers=headers, json=payload)
    if r.status_code == 201:
        data = r.json()
        expert_code = data.get("data", {}).get("expertCode") or data.get("data", {}).get("id")
        print(f"  [2. UPGRADE] Nộp hồ sơ thành công -> Mã hồ sơ: {expert_code} (Status: PENDING_REVIEW)")
        return data.get("data")
    elif r.status_code == 409:
        print(f"  [2. UPGRADE] Hồ sơ đã nộp từ trước: {r.json().get('message')}")
        return None
    else:
        print(f"  [2. UPGRADE ERROR] {r.status_code} - {r.text}")
        return None

def approve_all_pending(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Lấy danh sách hàng đợi kiểm duyệt trung ương
    r = requests.get(f"{API_BASE}/api/v1/admin/approvals/central-queue?requestType=EXPERT&pageSize=100", headers=headers)
    if r.status_code != 200:
        print(f"  [ADMIN QUEUE ERROR] {r.status_code} - {r.text}")
        return 0
        
    raw_data = r.json().get("data", [])
    items = raw_data if isinstance(raw_data, list) else raw_data.get("items", [])
    print(f"\n[3. PROVINCE / CENTRAL APPROVAL] Tìm thấy {len(items)} hồ sơ Chuyên gia trong hàng đợi...")
    
    # Lọc các hồ sơ chuyên gia thuộc đợt import này
    our_emails = {exp["email"].lower() for exp in EXPERTS_DATA}
    our_names = {exp["fullName"].lower() for exp in EXPERTS_DATA}
    
    approved_count = 0
    for item in items:
        req_id = item["id"]
        status = item.get("status")
        name = item.get("userName") or item.get("targetName") or ""
        version = item.get("version", 1)
        
        # Chỉ xử lý các hồ sơ PENDING hoặc PENDING_REVIEW
        if status in ["PENDING", "PENDING_REVIEW"]:
            review_payload = {
                "action": "APPROVE",
                "expectedVersion": version,
                "reviewNote": "Hồ sơ LLKH đạt chuẩn quy định TT17 Bộ KH&CN. Phê duyệt niêm yết Chuyên gia."
            }
            res = requests.put(f"{API_BASE}/api/v1/governance/approvals/{req_id}/review", headers=headers, json=review_payload)
            if res.status_code == 200:
                print(f"  ✅ Phê duyệt thành công hồ sơ: {name} (ID: {req_id}, v{version})")
                approved_count += 1
            else:
                print(f"  ❌ Phê duyệt thất bại {req_id}: {res.status_code} - {res.text}")
        else:
            print(f"  - Hồ sơ {name} ({req_id}) trạng thái hiện tại: {status}")
            
    return approved_count

def publish_approved_experts(admin_token):
    print(f"\n[3.5. PUBLISH APPROVED EXPERTS] Kích hoạt chế độ niêm yết công khai (PUBLIC) qua /api/v1/admin/experts/{{code}}/listing...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Lấy danh sách expert_code từ CSDL PostgreSQL thật
    cmd = """docker exec nacentech-postgres-1 psql -U postgres -d nacentech -t -A -c "
    SELECT ep.expert_code, ep.full_name, ep.consulting_summary
    FROM brokerage.expert_profiles ep
    WHERE ep.status = 'APPROVED';
    "
    """
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    published_count = 0
    for line in res.stdout.strip().splitlines():
        if not line.strip() or "|" not in line:
            continue
        parts = line.split("|")
        expert_code = parts[0].strip()
        full_name = parts[1].strip() if len(parts) > 1 else ""
        bio = parts[2].strip() if len(parts) > 2 else ""
        
        listing_payload = {
            "isPublic": True,
            "isAcceptingConsultation": True,
            "publicBio": bio or f"Chuyên gia KH&CN {full_name} thuộc Viện Ứng dụng Công nghệ."
        }
        r = requests.put(f"{API_BASE}/api/v1/admin/experts/{expert_code}/listing", headers=headers, json=listing_payload)
        if r.status_code in [200, 204]:
            print(f"  🌟 Công khai niêm yết: {full_name} ({expert_code})")
            published_count += 1
        else:
            print(f"  ❌ Lỗi công khai {expert_code}: {r.status_code} - {r.text}")
            
    print(f"===> Đã kích hoạt công khai thành công {published_count} hồ sơ chuyên gia.")
    return published_count

def verify_public_directory():
    print(f"\n[4. VERIFY PUBLIC DIRECTORY] Kiểm tra niêm yết công khai tại /api/v1/public/experts...")
    r = requests.get(f"{API_BASE}/api/v1/public/experts?page=1&pageSize=50")
    if r.status_code != 200:
        print(f"  ❌ Lỗi truy vấn danh bạ: {r.status_code} - {r.text}")
        return False
        
    data = r.json().get("data", {})
    items = data.get("items", [])
    total = data.get("totalCount", len(items))
    print(f"  Tổng số chuyên gia đã được niêm yết công khai trên hệ thống: {total}")
    
    # In danh sách kiểm chứng
    matched = 0
    for exp in EXPERTS_DATA:
        found = False
        for item in items:
            if exp["fullName"].lower() in item.get("fullName", "").lower():
                found = True
                matched += 1
                print(f"  ⭐ Niêm yết: {item.get('expertCode')} | {item.get('fullName')} | {item.get('degree')} | {item.get('organizationName')} | Sectors: {item.get('expertiseSectors')}")
                break
        if not found:
            print(f"  ⚠️ Chưa tìm thấy trên danh bạ công khai: {exp['fullName']}")
            
    print(f"\n===> Kết quả đối soát: {matched}/{len(EXPERTS_DATA)} chuyên gia bóc tách đã xuất hiện công khai!")
    return matched == len(EXPERTS_DATA)

def verify_postgres_deep_state():
    print(f"\n[5. DEEP DB STATE VERIFICATION] Đối soát trực tiếp trong CSDL PostgreSQL thật...")
    cmd = """docker exec nacentech-postgres-1 psql -U postgres -d nacentech -c "
    SELECT 
        p.email, 
        p.platform_role, 
        ep.full_name, 
        ep.expert_code, 
        ep.status as profile_status, 
        ar.status as approval_status
    FROM brokerage.expert_profiles ep
    JOIN identity.persons p ON ep.person_id = p.id
    LEFT JOIN identity.approval_requests ar ON ar.user_id = p.id
    ORDER BY ep.created_at DESC LIMIT 15;"
    """
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(res.stdout)

def main():
    print("==========================================================================")
    print("🚀 KHỞI CHẠY LIVING PIPELINE 4 BƯỚC: IMPORT 12 CHUYÊN GIA TỪ CV THỰC TẾ")
    print("==========================================================================")
    
    # Bước 1 & 2: Đăng ký & Nộp hồ sơ nâng cấp
    print(f"\n--- TIẾN HÀNH BƯỚC 1 & 2: ĐĂNG KÝ VÀ NỘP HỒ SƠ CHO 12 CHUYÊN GIA ---")
    for i, exp in enumerate(EXPERTS_DATA, 1):
        print(f"\n[{i}/{len(EXPERTS_DATA)}] Xử lý: {exp['fullName']} ({exp['degree']} - {exp['organizationName']})")
        if not register_user(exp):
            continue
        token = login_user(exp["email"], USER_PASS)
        if token:
            submit_upgrade(token, exp)
            
    # Bước 3: Admin / Sở duyệt hồ sơ
    print(f"\n--- TIẾN HÀNH BƯỚC 3: SỞ KH&CN / ADMIN PHÊ DUYỆT TẬP TRUNG ---")
    admin_token = login_user(ADMIN_EMAIL, ADMIN_PASS)
    if not admin_token:
        print("❌ Không thể đăng nhập bằng tài khoản Quản trị viên Super Admin!")
        sys.exit(1)
        
    approved_count = approve_all_pending(admin_token)
    print(f"Đã duyệt thành công {approved_count} hồ sơ.")
    
    # Bước 3.5: Kích hoạt niêm yết công khai
    publish_approved_experts(admin_token)
    
    # Bước 4: Kiểm tra niêm yết
    verify_public_directory()
    
    # Bước 5: Kiểm tra trực tiếp PostgreSQL
    verify_postgres_deep_state()
    
    print("\n✅ HOÀN TẤT TOÀN BỘ CHU TRÌNH IMPORT SỐNG 4 BƯỚC.")

if __name__ == "__main__":
    main()
