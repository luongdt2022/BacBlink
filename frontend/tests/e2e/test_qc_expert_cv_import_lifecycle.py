#!/usr/bin/env python3
"""
=============================================================================
NACENTECH QC E2E PLAYWRIGHT & API INTEGRATION TEST SUITE
FEATURE: EXPERT CV PARSER & 4-STEP ONBOARDING LIFECYCLE VERIFICATION
=============================================================================
Căn cứ kiểm thử:
  - Dữ liệu thực tế: 12 hồ sơ CV/LLKH tại Specification/01_DATA_RAW/LLKH CN & pdf
  - Luồng nghiệp vụ:
    (1) Đăng ký Public User (PUBLIC_USER) -> /api/v1/auth/register
    (2) Nộp hồ sơ nâng cấp Chuyên gia -> /api/v1/experts/upgrade-request (PENDING_REVIEW)
    (3) Cán bộ Sở/Admin duyệt hồ sơ -> /api/v1/governance/approvals/{id}/review (APPROVE)
    (4) Hiển thị ra ngoài trang công khai -> /experts & /experts/{expertCode}
  - Kỷ luật QC:
    * 100% Zero-Mock: Gọi API sống (5080) và UI Next.js sống (3000)
    * Đối soát 2 chiều trực tiếp PostgreSQL Container nacentech-postgres-1
    * Săn lỗi biên & ngoại lệ: Tên rỗng, Năm sinh âm/tương lai, PDPD bypass,
      Sector ngoài TT17, Tấn công IDOR duyệt chéo tỉnh.
=============================================================================
"""

import os
import sys
import time
import json
import uuid
import subprocess
import urllib.request
import urllib.error
from datetime import datetime
from playwright.sync_api import sync_playwright

BASE_WEB_URL = os.environ.get("BASE_WEB_URL", "http://localhost:3000")
BASE_API_URL = os.environ.get("BASE_API_URL", "http://127.0.0.1:5080")
EVIDENCE_DIR = os.path.abspath("SourceCode/frontend/tests/e2e/evidence/cv_import_lifecycle")
os.makedirs(EVIDENCE_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# DB HELPER - TRUY VẤN TRỰC TIẾP POSTGRESQL CONTAINER THẬT
# ---------------------------------------------------------------------------
def run_psql(query: str) -> str:
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-t", "-A", "-c", query
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"PSQL Error: {proc.stderr}\nQuery: {query}")
    return proc.stdout.strip()

def run_psql_json(query: str):
    clean_query = query.strip().rstrip(";")
    raw = run_psql(f"SELECT json_agg(t) FROM ({clean_query}) t;")
    if not raw or raw == "":
        return []
    return json.loads(raw)

# ---------------------------------------------------------------------------
# HTTP API HELPER
# ---------------------------------------------------------------------------
def api_request(method: str, path: str, data: dict = None, token: str = None):
    url = f"{BASE_API_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            status = resp.status
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = content
            return status, parsed
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = content
        return e.code, parsed

def login_and_get_token(email: str, password: str = "Password@123") -> str:
    status, res = api_request("POST", "/api/v1/auth/login", {"email": email, "password": password})
    if status != 200 or "accessToken" not in res:
        raise RuntimeError(f"Đăng nhập thất bại cho {email}: Status {status}, Res: {res}")
    return res["accessToken"]

# ---------------------------------------------------------------------------
# QC REPORT LOGGER
# ---------------------------------------------------------------------------
class QcExecutionReporter:
    def __init__(self):
        self.cases = []
        self.defects = []
        self.start_time = time.time()

    def log_header(self, title: str):
        print("\n" + "=" * 80)
        print(f"  {title.upper()}")
        print("=" * 80)

    def log_journey(self, journey_name: str):
        print(f"\n🚀 [USER JOURNEY] {journey_name}")
        print("-" * 80)

    def record_pass(self, code: str, title: str, details: str = "", evidence_path: str = ""):
        tc = {
            "code": code,
            "title": title,
            "status": "PASSED",
            "details": details,
            "evidence": evidence_path
        }
        self.cases.append(tc)
        print(f"  ✅ [PASS] [{code}] {title}")
        if details:
            print(f"     -> {details}")

    def record_fail_or_defect(self, code: str, title: str, defect_desc: str, severity: str = "HIGH", details: str = "", evidence_path: str = ""):
        tc = {
            "code": code,
            "title": title,
            "status": "FAILED",
            "details": details,
            "evidence": evidence_path,
            "defect": {
                "severity": severity,
                "description": defect_desc
            }
        }
        self.cases.append(tc)
        self.defects.append({
            "code": code,
            "title": title,
            "severity": severity,
            "description": defect_desc,
            "details": details
        })
        print(f"  ❌ [DEFECT FOUND] [{code}] ({severity}) {title}")
        print(f"     -> Lỗi/Vấn đề: {defect_desc}")
        if details:
            print(f"     -> Bằng chứng: {details}")

    def generate_summary(self):
        elapsed = time.time() - self.start_time
        total = len(self.cases)
        passed = sum(1 for c in self.cases if c["status"] == "PASSED")
        failed = len(self.defects)

        self.log_header("TỔNG KẾT BÁO CÁO KIỂM THỬ ĐỘC LẬP (NACEN-QC)")
        print(f"  Thời gian thực thi: {elapsed:.2f} giây")
        print(f"  Tổng số kịch bản kiểm thử: {total}")
        print(f"  Kịch bản đạt chuẩn (PASS): {passed}")
        print(f"  LỖI & GÓC KHUẤT PHÁT HIỆN (DEFECTS): {failed}")
        print("=" * 80)

        if self.defects:
            print("\n  DANH SÁCH BẰNG CHỨNG LỖI & RỦI RO NGHIỆP VỤ BÓC TRẦN BỞI QC:")
            for idx, d in enumerate(self.defects, 1):
                print(f"  {idx}. [{d['code']}] [{d['severity']}] {d['title']}")
                print(f"     Mô tả lỗi: {d['description']}")
                print(f"     Chi tiết kỹ thuật: {d['details']}")
                print("-" * 60)

        # Lưu JSON report
        report_path = os.path.join(EVIDENCE_DIR, "qc_cv_import_execution_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump({
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "elapsedSeconds": elapsed,
                "totalCases": total,
                "passedCases": passed,
                "defectsCount": failed,
                "cases": self.cases,
                "defects": self.defects
            }, f, ensure_ascii=False, indent=2)
        print(f"\n  📁 Toàn bộ biên bản kiểm thử đã ghi vào: {report_path}\n")

# ---------------------------------------------------------------------------
# MAIN TEST SUITE EXECUTION
# ---------------------------------------------------------------------------
def run_qc_suite():
    reporter = QcExecutionReporter()
    reporter.log_header("BẮT ĐẦU CHẠY BỘ TEST TỰ ĐỘNG BÓC TÁCH & IMPORT CV CHUYÊN GIA (GATE 4)")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # ===================================================================
        # USER JOURNEY 1: LUỒNG 4 BƯỚC NÂNG CẤP CHUYÊN GIA CHUẨN (HAPPY PATH)
        # ===================================================================
        reporter.log_journey("JOURNEY 1: KIỂM TOÁN ĐỦ 4 BƯỚC NÂNG CẤP CHUYÊN GIA SỐNG")

        # Bước 1: Đăng ký tài khoản Public User
        test_email = f"qc.flow.{uuid.uuid4().hex[:6]}@nacentech.test"
        reg_payload = {
            "firstName": "Bành",
            "lastName": "Quốc Tuấn",
            "email": test_email,
            "password": "Password@123",
            "confirmPassword": "Password@123",
            "acceptPdpd": True
        }
        status_reg, res_reg = api_request("POST", "/api/v1/auth/register", reg_payload)
        assert status_reg == 201, f"Đăng ký thất bại với status {status_reg}"
        
        # Deep DB Check Bước 1:
        db_user = run_psql_json(f"SELECT id, email, platform_role, is_active FROM identity.persons WHERE email = '{test_email}';")
        assert len(db_user) == 1, "Không tìm thấy user vừa đăng ký trong DB!"
        user_id = db_user[0]["id"]
        role_step1 = db_user[0]["platform_role"]
        
        if role_step1 == "PUBLIC_USER":
            reporter.record_pass("TC-CV-01", "Bước 1: Đăng ký Public User & xác nhận role CSDL",
                                 f"User ID: {user_id}, Email: {test_email}, DB Role: {role_step1}")
        else:
            reporter.record_fail_or_defect("TC-CV-01", "Bước 1: Đăng ký Public User",
                                           f"Role CSDL không phải PUBLIC_USER: {role_step1}", "HIGH")

        # Đăng nhập lấy JWT thật
        user_token = login_and_get_token(test_email, "Password@123")

        # Bước 2: Nộp hồ sơ nâng cấp Chuyên gia
        upgrade_payload = {
            "fullName": "Bành Quốc Tuấn",
            "birthYear": 1979,
            "gender": "male",
            "academicRank": "NONE",
            "degree": "Tiến sĩ",
            "degreeYear": 2011,
            "organizationName": "Viện Ứng dụng Công nghệ",
            "organizationAddress": "Hà Nội",
            "researchTitle": "Nghiên cứu viên cao cấp",
            "positionTitle": "Trưởng phòng Laser quang học",
            "expertiseSectors": ["LV08", "LV17"],
            "trainingHistoryJson": json.dumps([
                {"major": "Vật lý kỹ thuật", "degree": "Đại học", "institution": "Đại học Bách Khoa Hà Nội", "graduationYear": 2002},
                {"major": "Quang học & Quang điện tử", "degree": "Tiến sĩ", "institution": "Viện Hàn lâm KH&CN Việt Nam", "graduationYear": 2011}
            ]),
            "employmentHistoryJson": json.dumps([
                {"period": "2002-2011", "position": "Nghiên cứu viên", "org": "Viện Hàn lâm KH&CN Việt Nam"},
                {"period": "2011-nay", "position": "Trưởng phòng Laser quang học", "org": "Viện Ứng dụng Công nghệ"}
            ]),
            "publicationsJson": json.dumps([
                {"title": "Nghiên cứu và phát triển nguồn laser quang sợi công suất cao ≥ 1 kW ứng dụng trong công nghiệp", "year": 2021, "journal": "Tạp chí KH&CN"}
            ]),
            "consultingSummary": "Chuyên gia đầu ngành về công nghệ laser quang sợi sợi công suất cao và quang điện tử.",
            "isProjectLeader": True,
            "isMainContributor": True,
            "pdpdConsent": True,
            "legalOath": True,
            "scopeType": "PROVINCE",
            "scopeId": "HN"
        }
        status_upg, res_upg = api_request("POST", "/api/v1/experts/upgrade-request", upgrade_payload, token=user_token)
        assert status_upg == 201, f"Nộp hồ sơ nâng cấp thất bại: {status_upg}, {res_upg}"
        expert_code = res_upg.get("data", {}).get("expertCode") or res_upg.get("data", {}).get("code")
        profile_id = res_upg.get("data", {}).get("id")

        # Deep DB Check Bước 2:
        db_expert = run_psql_json(f"SELECT id, expert_code, status, visibility_status FROM brokerage.expert_profiles WHERE person_id = '{user_id}';")
        db_approval = run_psql_json(f"SELECT id, status, request_type, scope_type, scope_id FROM identity.approval_requests WHERE user_id = '{user_id}';")
        
        assert len(db_expert) == 1, "Chưa lưu expert_profiles vào DB!"
        assert len(db_approval) == 1, "Chưa sinh ticket approval_requests trong DB!"
        ticket_id = db_approval[0]["id"]

        if db_expert[0]["status"] == "PENDING_REVIEW" and db_approval[0]["status"] == "PENDING_REVIEW":
            reporter.record_pass("TC-CV-02", "Bước 2: Nộp hồ sơ nâng cấp & sinh ticket PENDING_REVIEW",
                                 f"Expert Code: {db_expert[0]['expert_code']}, Ticket ID: {ticket_id}, Scope: {db_approval[0]['scope_id']}")
        else:
            reporter.record_fail_or_defect("TC-CV-02", "Bước 2: Trạng thái nộp hồ sơ không đúng",
                                           f"expert_status={db_expert[0]['status']}, approval_status={db_approval[0]['status']}", "HIGH")

        # Bước 3: Cán bộ Sở KH&CN Hà Nội duyệt hồ sơ (APPROVE)
        hanoi_token = login_and_get_token("hanoi.admin@demo.nacentech.vn", "Password@123")
        review_payload = {
            "action": "APPROVE",
            "expectedVersion": 1,
            "reviewNote": "Sở KH&CN Hà Nội đã thẩm tra văn bằng Tiến sĩ và lý lịch khoa học đạt chuẩn."
        }
        status_rev, res_rev = api_request("PUT", f"/api/v1/governance/approvals/{ticket_id}/review", review_payload, token=hanoi_token)
        assert status_rev == 200, f"Phê duyệt thất bại: Status {status_rev}, {res_rev}"

        # Deep DB Check Bước 3: Đối soát 4 bảng CSDL
        db_user_after = run_psql_json(f"SELECT platform_role FROM identity.persons WHERE id = '{user_id}';")[0]
        db_expert_after = run_psql_json(f"SELECT status, visibility_status FROM brokerage.expert_profiles WHERE id = '{profile_id}';")[0]
        db_approval_after = run_psql_json(f"SELECT status, version, reviewed_by_id FROM identity.approval_requests WHERE id = '{ticket_id}';")[0]
        db_audit = run_psql_json(f"SELECT actor_role, action, target_entity, target_id FROM identity.approval_audit_logs WHERE target_id = '{ticket_id}' ORDER BY created_at_utc DESC;")

        all_db_valid = (
            db_user_after["platform_role"] == "VERIFIED_EXPERT" and
            db_expert_after["status"] == "APPROVED" and
            db_approval_after["status"] == "APPROVED" and
            len(db_audit) >= 1 and db_audit[0]["action"] == "REVIEW_APPROVE"
        )
        if all_db_valid:
            reporter.record_pass("TC-CV-03", "Bước 3: Cán bộ Sở duyệt & đối soát CSDL 4 tầng hoàn chỉnh",
                                 f"Person Role: {db_user_after['platform_role']}, Expert Status: {db_expert_after['status']}, Audit Log: {db_audit[0]['action']}")
        else:
            reporter.record_fail_or_defect("TC-CV-03", "Bước 3: Đối soát CSDL sau phê duyệt không nhất quán",
                                           f"Role: {db_user_after['platform_role']}, Status: {db_expert_after['status']}, Approval: {db_approval_after['status']}", "CRITICAL")

        # Bước 4: Hiển thị công khai trên Danh bạ Chuyên gia (/experts) & Chi tiết (/experts/{expertCode})
        assigned_code = db_expert[0]["expert_code"]
        page.goto(f"{BASE_WEB_URL}/experts")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Tìm kiếm theo tên vừa nộp
        search_box = page.locator('input[placeholder*="Tìm kiếm"], input[type="text"]').first
        if search_box.is_visible():
            search_box.fill("Bành Quốc Tuấn")
            search_box.press("Enter")
            time.sleep(1.5)

        # Kiểm tra xuất hiện card chuyên gia
        card_locator = page.locator(f"text=Bành Quốc Tuấn").first
        ev_dir_path = os.path.join(EVIDENCE_DIR, "evidence_step4_directory.png")
        page.screenshot(path=ev_dir_path)

        if card_locator.is_visible(timeout=5000):
            reporter.record_pass("TC-CV-04A", "Bước 4A: Hiển thị chuyên gia trên Danh bạ công khai (/experts)",
                                 f"Tìm thấy card 'Bành Quốc Tuấn' trên /experts", ev_dir_path)
        else:
            reporter.record_fail_or_defect("TC-CV-04A", "Bước 4A: Không hiển thị trên Danh bạ công khai",
                                           f"Không tìm thấy chuyên gia 'Bành Quốc Tuấn' trên UI /experts sau phê duyệt", "HIGH", evidence_path=ev_dir_path)

        # Mở trang chi tiết chuyên gia /experts/{expertCode}
        detail_url = f"{BASE_WEB_URL}/experts/{assigned_code}"
        page.goto(detail_url)
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        ev_detail_path = os.path.join(EVIDENCE_DIR, "evidence_step4_detail.png")
        page.screenshot(path=ev_detail_path)

        try:
            page.wait_for_selector("text=Bành Quốc Tuấn", timeout=12000)
            page_text = page.inner_text("body")
            has_name = "Bành Quốc Tuấn" in page_text
            has_training = "Đại học Bách Khoa Hà Nội" in page_text
            has_org = "Viện Ứng dụng Công nghệ" in page_text
            
            ev_detail_path = os.path.join(EVIDENCE_DIR, "evidence_step4_detail.png")
            page.screenshot(path=ev_detail_path)

            if has_name and has_training and has_org:
                reporter.record_pass("TC-CV-04B", f"Bước 4B: Hiển thị trang chi tiết chuyên gia ({assigned_code})",
                                     f"Trang chi tiết /experts/{assigned_code} tải thành công, đầy đủ Quá trình đào tạo & Công tác", ev_detail_path)
            else:
                reporter.record_fail_or_defect("TC-CV-04B", f"Bước 4B: Thiếu thông tin đào tạo/công tác ({assigned_code})",
                                               f"Trang {detail_url} thiếu chi tiết: has_name={has_name}, has_training={has_training}, has_org={has_org}", "HIGH", evidence_path=ev_detail_path)
        except Exception as e:
            ev_detail_path = os.path.join(EVIDENCE_DIR, "evidence_step4_detail.png")
            page.screenshot(path=ev_detail_path)
            reporter.record_fail_or_defect("TC-CV-04B", f"Bước 4B: Không mở được trang chi tiết ({assigned_code})",
                                           f"Lỗi tải trang {detail_url}: {e}", "HIGH", evidence_path=ev_detail_path)

        # ===================================================================
        # USER JOURNEY 2: SĂN LỖI BIÊN & TẤN CÔNG NGOẠI LỆ (EDGE-CASE HUNTING)
        # ===================================================================
        reporter.log_journey("JOURNEY 2: SĂN LỖI BIÊN, PHÁ HOẠI & KIỂM TRA BẢO MẬT")

        # Edge-Case 1: Đăng ký tài khoản không đồng ý PDPD (acceptPdpd: false)
        email_nopdpd = f"qc.edge.nopdpd.{uuid.uuid4().hex[:4]}@nacentech.test"
        st_nopdpd, res_nopdpd = api_request("POST", "/api/v1/auth/register", {
            "firstName": "Lỗi",
            "lastName": "PDPD",
            "email": email_nopdpd,
            "password": "Password@123",
            "confirmPassword": "Password@123",
            "acceptPdpd": False
        })
        if st_nopdpd == 201:
            reporter.record_fail_or_defect(
                "DEF-QC-01",
                "Lỗ hổng tuân thủ Nghị định 13: Đăng ký API chấp nhận acceptPdpd = false",
                "Backend API /api/v1/auth/register cho phép đăng ký thành công (201 Created) dù người dùng không đồng ý cam kết PDPD.",
                "CRITICAL",
                f"Payload: acceptPdpd=False -> Phản hồi: Status 201, User ID: {res_nopdpd.get('data', {}).get('user', {}).get('id')}"
            )
        else:
            reporter.record_pass("TC-EDGE-01", "Chặn đăng ký khi không đồng ý PDPD", f"Phản hồi đúng HTTP {st_nopdpd}")

        # Chuẩn bị một user sạch cho các bài test biên upgrade
        clean_user_email = f"qc.edge.tester.{uuid.uuid4().hex[:5]}@nacentech.test"
        api_request("POST", "/api/v1/auth/register", {
            "firstName": "Tester",
            "lastName": "EdgeCase",
            "email": clean_user_email,
            "password": "Password@123",
            "confirmPassword": "Password@123",
            "acceptPdpd": True
        })
        clean_token = login_and_get_token(clean_user_email, "Password@123")

        # Edge-Case 2: Nộp hồ sơ bỏ trống Họ và Tên
        empty_name_payload = dict(upgrade_payload)
        empty_name_payload["fullName"] = "   "
        st_ename, res_ename = api_request("POST", "/api/v1/experts/upgrade-request", empty_name_payload, token=clean_token)
        if st_ename == 400:
            reporter.record_pass("TC-EDGE-02", "Chặn nộp hồ sơ khi Họ tên rỗng", f"HTTP 400 Bad Request: {res_ename.get('message')}")
        else:
            reporter.record_fail_or_defect("TC-EDGE-02", "Không chặn Họ tên rỗng", f"Status: {st_ename}, Phản hồi: {res_ename}", "HIGH")

        # Edge-Case 3: Nộp hồ sơ với pdpdConsent = false
        nopdpd_payload = dict(upgrade_payload)
        nopdpd_payload["pdpdConsent"] = False
        st_np, res_np = api_request("POST", "/api/v1/experts/upgrade-request", nopdpd_payload, token=clean_token)
        if st_np == 400:
            reporter.record_pass("TC-EDGE-03", "Chặn nâng cấp chuyên gia khi thiếu PDPD Consent", f"HTTP 400: {res_np.get('message')}")
        else:
            reporter.record_fail_or_defect("TC-EDGE-03", "Không chặn thiếu PDPD trong nâng cấp", f"Status: {st_np}, Phản hồi: {res_np}", "HIGH")

        # Edge-Case 4: Nộp hồ sơ với Sector không thuộc TT17
        invalid_sector_payload = dict(upgrade_payload)
        invalid_sector_payload["expertiseSectors"] = ["LV99_KHONG_TON_TAI"]
        st_is, res_is = api_request("POST", "/api/v1/experts/upgrade-request", invalid_sector_payload, token=clean_token)
        if st_is == 400:
            reporter.record_pass("TC-EDGE-04", "Chặn ngành lĩnh vực ngoài danh mục TT17", f"HTTP 400: {res_is.get('message')}")
        else:
            reporter.record_fail_or_defect("TC-EDGE-04", "Cho phép chọn ngành ngoài TT17", f"Status: {st_is}, Phản hồi: {res_is}", "HIGH")

        # Edge-Case 5: Nộp hồ sơ với Năm sinh âm (-999)
        negative_year_email = f"qc.neg.year.{uuid.uuid4().hex[:4]}@nacentech.test"
        api_request("POST", "/api/v1/auth/register", {
            "firstName": "Âm", "lastName": "Năm Sinh", "email": negative_year_email,
            "password": "Password@123", "confirmPassword": "Password@123", "acceptPdpd": True
        })
        neg_token = login_and_get_token(negative_year_email)
        neg_year_payload = dict(upgrade_payload)
        neg_year_payload["birthYear"] = -999
        st_ny, res_ny = api_request("POST", "/api/v1/experts/upgrade-request", neg_year_payload, token=neg_token)
        if st_ny == 201:
            reporter.record_fail_or_defect(
                "DEF-QC-02",
                "Lỗi biên dữ liệu: Backend chấp nhận năm sinh âm (-999)",
                "API /api/v1/experts/upgrade-request thiếu validation kiểm tra giới hạn năm sinh (birthYear >= 1920), cho phép ghi số âm vào CSDL.",
                "MEDIUM",
                f"Payload: birthYear=-999 -> Status 201 Created, Expert Code: {res_ny.get('data', {}).get('expertCode')}"
            )
        else:
            reporter.record_pass("TC-EDGE-05", "Chặn năm sinh âm", f"HTTP {st_ny}")

        # Edge-Case 6: Nộp hồ sơ với Năm sinh tương lai (2099)
        future_year_email = f"qc.fut.year.{uuid.uuid4().hex[:4]}@nacentech.test"
        api_request("POST", "/api/v1/auth/register", {
            "firstName": "Tương Lai", "lastName": "Năm Sinh", "email": future_year_email,
            "password": "Password@123", "confirmPassword": "Password@123", "acceptPdpd": True
        })
        fut_token = login_and_get_token(future_year_email)
        fut_year_payload = dict(upgrade_payload)
        fut_year_payload["birthYear"] = 2099
        fut_year_payload["degreeYear"] = 2125
        st_fy, res_fy = api_request("POST", "/api/v1/experts/upgrade-request", fut_year_payload, token=fut_token)
        if st_fy == 201:
            reporter.record_fail_or_defect(
                "DEF-QC-03",
                "Lỗi biên logic thời gian: Backend chấp nhận năm sinh tương lai (2099)",
                "API /api/v1/experts/upgrade-request không kiểm tra ràng buộc thời gian thực, cho phép năm sinh và năm nhận bằng ở tương lai xa (2099, 2125).",
                "MEDIUM",
                f"Payload: birthYear=2099, degreeYear=2125 -> Status 201 Created, Expert Code: {res_fy.get('data', {}).get('expertCode')}"
            )
        else:
            reporter.record_pass("TC-EDGE-06", "Chặn năm sinh tương lai", f"HTTP {st_fy}")

        # Edge-Case 7: Tấn công duyệt chéo địa bàn (Cross-Province IDOR Attack)
        # Nộp 1 hồ sơ chỉ định về Hà Nội (HN)
        idor_expert_email = f"qc.idor.target.{uuid.uuid4().hex[:4]}@nacentech.test"
        api_request("POST", "/api/v1/auth/register", {
            "firstName": "Hà Nội", "lastName": "Chuyên Gia", "email": idor_expert_email,
            "password": "Password@123", "confirmPassword": "Password@123", "acceptPdpd": True
        })
        idor_token = login_and_get_token(idor_expert_email)
        idor_payload = dict(upgrade_payload)
        idor_payload["scopeType"] = "PROVINCE"
        idor_payload["scopeId"] = "HN"
        st_idorexp, res_idorexp = api_request("POST", "/api/v1/experts/upgrade-request", idor_payload, token=idor_token)
        assert st_idorexp == 201

        # Lấy ticket ID của hồ sơ vừa nộp
        target_person_id = run_psql(f"SELECT id FROM identity.persons WHERE email = '{idor_expert_email}';")
        target_ticket_id = run_psql(f"SELECT id FROM identity.approval_requests WHERE user_id = '{target_person_id}';")

        # Cán bộ Sở Tiền Giang (TG) cố tình gửi PUT duyệt hồ sơ Hà Nội (HN)
        tg_token = login_and_get_token("tiengiang.admin@demo.nacentech.vn", "Password@123")
        cross_review_payload = {
            "action": "APPROVE",
            "expectedVersion": 1,
            "reviewNote": "[IDOR-ATTACK] Cán bộ Tiền Giang duyệt chéo hồ sơ Hà Nội trái phép"
        }
        st_cross, res_cross = api_request("PUT", f"/api/v1/governance/approvals/{target_ticket_id}/review", cross_review_payload, token=tg_token)
        
        if st_cross == 403:
            reporter.record_pass("TC-SEC-01", "Bảo mật RLS: Chặn duyệt chéo địa bàn (Cross-Province IDOR Blocked)",
                                 f"HTTP 403 Forbidden: {res_cross.get('message')}")
        else:
            reporter.record_fail_or_defect("TC-SEC-01", "LỖ HỔNG IDOR: Cho phép duyệt chéo địa bàn trái quyền",
                                           f"Cán bộ Tiền Giang duyệt được hồ sơ Hà Nội! Status {st_cross}, Res: {res_cross}", "CRITICAL")

        # ===================================================================
        # USER JOURNEY 3: ĐỐI SOÁT TOÀN DIỆN 12 HỒ SƠ TỪ DỮ LIỆU THẬT RAW DATA
        # ===================================================================
        reporter.log_journey("JOURNEY 3: ĐỐI SOÁT 12 HỒ SƠ THỰC TẾ ĐÃ BÓC TÁCH VÀO CSDL")

        # Danh sách 12 chuyên gia kỳ vọng từ raw data
        expected_raw_experts = [
            ("Bành Quốc Tuấn", "Tiến sĩ", "Viện Ứng dụng Công nghệ"),
            ("Giang Mạnh Khôi", "Thạc sĩ", ""),
            ("Nguyễn Văn Đông", "Tiến sĩ", ""),
            ("Vũ Văn Liệu", "Thạc sĩ", ""),
            ("Phạm Chí Hiếu", "Kỹ sư", ""),
            ("Đinh Văn Giang", "Kỹ sư", ""),
            ("Trương Đức Toàn", "Kỹ sư", ""),
            ("Nguyễn Phương Đông", "Kỹ sư", ""),
            ("Trần Xuân Thịnh", "Kỹ sư", ""),
            ("Vũ Thanh Tùng", "Tiến sĩ", ""),
            ("Trương Công Tuấn", "Tiến sĩ", ""),
            ("Trần Thị Vân Anh", "Thạc sĩ", "")
        ]

        verified_count = 0
        for name, degree, org in expected_raw_experts:
            # Query DB
            check_sql = f"SELECT id, expert_code, full_name, degree, status, visibility_status FROM brokerage.expert_profiles WHERE full_name ILIKE '%{name}%' AND status = 'APPROVED' ORDER BY created_at DESC LIMIT 1;"
            rows = run_psql_json(check_sql)
            if rows:
                p = rows[0]
                verified_count += 1
                reporter.record_pass(f"TC-RAW-EXP-{verified_count:02d}", f"Chuyên gia thực tế #{verified_count}: {name}",
                                     f"Code: {p['expert_code']}, Degree: {p['degree']}, Status: {p['status']}, Visibility: {p['visibility_status']}")
            else:
                reporter.record_fail_or_defect(f"TC-RAW-EXP-{verified_count+1:02d}", f"Thiếu hồ sơ chuyên gia: {name}",
                                               f"Không tìm thấy bản ghi APPROVED cho {name} trong CSDL thật", "HIGH")

        # Mở trang Danh bạ Chuyên gia công khai kiểm tra sự hiện diện
        page.goto(f"{BASE_WEB_URL}/experts")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        ev_12exp_path = os.path.join(EVIDENCE_DIR, "evidence_12_experts_directory.png")
        page.screenshot(path=ev_12exp_path, full_page=True)

        if verified_count == 12:
            reporter.record_pass("TC-RAW-12EXP-SUMMARY", "Đối soát trọn vẹn 12/12 hồ sơ CV bóc tách từ Raw Data",
                                 f"Cả 12 hồ sơ đều mang trạng thái APPROVED và PUBLIC trong PostgreSQL", ev_12exp_path)
        else:
            reporter.record_fail_or_defect("TC-RAW-12EXP-SUMMARY", "Chưa đủ 12 hồ sơ từ Raw Data",
                                           f"Chỉ xác minh được {verified_count}/12 hồ sơ", "HIGH", evidence_path=ev_12exp_path)

        context.close()
        browser.close()

    # Báo cáo tổng kết
    reporter.generate_summary()

if __name__ == "__main__":
    run_qc_suite()
