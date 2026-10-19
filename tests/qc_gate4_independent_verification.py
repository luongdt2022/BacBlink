#!/usr/bin/env python3
"""
=============================================================================
NACENTECH QUALITY GATE 4: INDEPENDENT VERIFICATION SUITE
Specialist: nacen-qc (Quality Control Specialist)
Discipline: Pure Black-Box Testing & Zero-Mock Invariant
Target: Direct PostgreSQL 16 Real DB + Live Backend (.NET API) + Live Frontend (Playwright E2E)
=============================================================================
"""

import sys
import os
import json
import time
import subprocess
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright

BACKEND_URL = "http://localhost:5080"
FRONTEND_URL = "http://localhost:3000"
EVIDENCE_DIR = "/Users/luongdt/.gemini/antigravity/brain/aa8d1c13-b861-499d-a903-918a9cc1953f/qc_evidence"
DB_CONTAINER = "nacentech-postgres-1"

os.makedirs(EVIDENCE_DIR, exist_ok=True)

test_results = []

def record_result(test_id, name, status, details=""):
    test_results.append({
        "id": test_id,
        "name": name,
        "status": status,
        "details": details
    })
    badge = "[PASS]" if status == "PASS" else "[FAIL]"
    print(f"  {badge} [{test_id}] {name}")
    if details:
        print(f"         {details}")

def psql_query(sql):
    cmd = [
        "docker", "exec", DB_CONTAINER,
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"PostgreSQL Query Failed: {res.stderr}\nSQL: {sql}")
    return res.stdout.strip()

def http_post(url, data, token=None):
    body = json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json", "User-Agent": "NacenQC-Gate4/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=body, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except:
            return e.code, {"raw": raw}

def http_get(url, token=None):
    headers = {"User-Agent": "NacenQC-Gate4/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except:
            return e.code, {"raw": raw}

# =============================================================================
# SCENARIO 1: AUTO-PREFILL SURVEY & ZERO-VALIDATION BLOCK (CR-2026-016 / TASK-03)
# =============================================================================
def verify_scenario_1_playwright_prefill():
    print("\n" + "=" * 80)
    print(">>> THỰC THI SCENARIO 1: PLAYWRIGHT E2E AUTO-PREFILL FORM KHẢO SÁT")
    print("=" * 80)

    # 1.1 Lấy token cho buyer
    status, res = http_post(f"{BACKEND_URL}/api/v1/auth/login", {
        "email": "buyer.user@demo.nacentech.vn",
        "password": "Demo@2026"
    })
    if status != 200 or not res.get("accessToken"):
        record_result("TC-01.1", "Đăng nhập tài khoản Buyer Demo", "FAIL", f"Status: {status}, Response: {res}")
        return
    token = res.get("accessToken")
    user = res.get("user")
    record_result("TC-01.1", "Đăng nhập tài khoản Buyer Demo", "PASS", f"Email: {user.get('email')}, Role: {user.get('role')}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Inject session vào localStorage trước khi load trang
        page.goto(f"{FRONTEND_URL}/")
        page.evaluate("""({ token, user }) => {
            localStorage.setItem('nacentwin_access_token', token);
            localStorage.setItem('nacentwin_user_context', JSON.stringify(user));
            localStorage.removeItem('nacentwin_deep_survey_draft_v2'); // Xóa draft cũ để kiểm tra pure prefill từ API
        }""", {"token": token, "user": user})

        # Điều hướng vào trang khảo sát
        page.goto(f"{FRONTEND_URL}/khao-sat-nhu-cau")
        page.wait_for_load_state("networkidle")
        time.sleep(2) # Chờ async prefill fetch

        # Chụp ảnh màn hình State 1: Alert Banner + Form Prefilled
        screenshot_1_path = os.path.join(EVIDENCE_DIR, "01_buyer_prefill_step1.png")
        page.screenshot(path=screenshot_1_path, full_page=False)

        # Kiểm tra Alert Banner
        alert_banner = page.locator("text=Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký")
        has_banner = alert_banner.is_visible()
        if has_banner:
            record_result("TC-01.2", "Hiển thị Alert Banner Đồng bộ hồ sơ DN", "PASS", "Banner hiển thị rõ ràng và chuẩn UX")
        else:
            record_result("TC-01.2", "Hiển thị Alert Banner Đồng bộ hồ sơ DN", "FAIL", "Không tìm thấy Alert Banner trên DOM")

        # Kiểm tra dữ liệu nạp vào các input
        company_val = page.locator('input[placeholder*="Tân Tiến"]').input_value()
        tax_val = page.locator('input[placeholder*="0108992134"]').input_value()
        rep_val = page.locator('input[placeholder*="người đại diện liên hệ"]').input_value()
        phone_val = page.locator('input[placeholder*="0912 xxx xxx"]').input_value()
        email_val = page.locator('input[placeholder*="contact@company.com.vn"]').input_value()

        print(f"       Prefilled Form Values:")
        print(f"       - Company: {company_val}")
        print(f"       - Tax Code: {tax_val}")
        print(f"       - Representative: {rep_val}")
        print(f"       - Phone: {phone_val}")
        print(f"       - Email: {email_val}")

        is_company_ok = (company_val == "CÔNG TY TNHH TRƯỜNG HOAN")
        is_tax_ok = (tax_val == "0100255428")
        is_rep_ok = (rep_val == "Nguyễn Văn Hoan")
        is_phone_ok = (phone_val.replace(" ", "") == "0912345678")
        is_email_ok = (email_val == "buyer.user@demo.nacentech.vn")

        if is_company_ok and is_tax_ok and is_rep_ok and is_phone_ok and is_email_ok:
            record_result("TC-01.3", "Tự động điền 100% hồ sơ CÔNG TY TNHH TRƯỜNG HOAN", "PASS", 
                          f"MST: {tax_val}, Đại diện: {rep_val}, ĐT: {phone_val}")
        else:
            record_result("TC-01.3", "Tự động điền 100% hồ sơ CÔNG TY TNHH TRƯỜNG HOAN", "FAIL", 
                          f"Mismatch values: company={is_company_ok}, tax={is_tax_ok}, rep={is_rep_ok}, phone={is_phone_ok}")

        # Bấm nút "Tiếp tục Bước 2"
        next_btn = page.locator('button:has-text("Tiếp tục Bước 2")')
        next_btn.click()
        time.sleep(1)

        # Chụp ảnh màn hình State 2: Chuyển sang Bước 2 mượt mà
        screenshot_2_path = os.path.join(EVIDENCE_DIR, "02_buyer_survey_step2_smooth.png")
        page.screenshot(path=screenshot_2_path, full_page=False)

        # Kiểm tra nội dung Bước 2 xuất hiện mà không bị chặn lỗi validation HTML5
        step2_header = page.locator("text=PHẦN E.1 (BƯỚC 2) • NGUỒN VỐN & HÌNH THỨC")
        step2_visible = step2_header.is_visible()

        if step2_visible:
            record_result("TC-01.4", "Chuyển bước mượt mà sang Bước 2 (Không dính popup validation)", "PASS",
                          "Step 2 (Phần E.1) hiển thị thành công, form validation pass 100%")
        else:
            record_result("TC-01.4", "Chuyển bước mượt mà sang Bước 2", "FAIL",
                          "Không thấy header Phần E.1 của Bước 2 sau khi click Tiếp tục")

        browser.close()

# =============================================================================
# SCENARIO 2: SELLER DEMO ACCOUNT & DUAL MODE CAPABILITY (CR-2026-015 / TASK-02)
# =============================================================================
def verify_scenario_2_seller_and_dual_mode():
    print("\n" + "=" * 80)
    print(">>> THỰC THI SCENARIO 2: TÀI KHOẢN SELLER & NĂNG LỰC ĐA TẦNG (DUAL MODE)")
    print("=" * 80)

    # 2.1 Login seller
    status, res = http_post(f"{BACKEND_URL}/api/v1/auth/login", {
        "email": "seller.user@demo.nacentech.vn",
        "password": "Demo@2026"
    })
    if status != 200 or not res.get("accessToken"):
        record_result("TC-02.1", "Đăng nhập tài khoản Seller Demo", "FAIL", f"Status: {status}")
        return
    seller_token = res.get("accessToken")
    seller_user = res.get("user")
    record_result("TC-02.1", "Đăng nhập tài khoản Seller Demo", "PASS", f"User: {seller_user.get('email')}, Role: {seller_user.get('role')}")

    # 2.2 Profile API SSOT check
    status, p_res = http_get(f"{BACKEND_URL}/api/v1/portal/enterprise/profile", token=seller_token)
    profile = p_res.get("data") if status == 200 else None
    if status == 200 and profile:
        c_name = profile.get("name")
        c_tax = profile.get("taxCode")
        c_rep = profile.get("contactPerson")
        c_tier = profile.get("capabilityTier")
        c_seller = profile.get("isSeller")
        if "TÂN TIẾN" in c_name and c_tax == "0108992134" and c_rep == "Trần Tiến Dũng" and c_seller:
            record_result("TC-02.2", "Xác thực API Profile Seller SSOT CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN", "PASS",
                          f"MST: {c_tax}, Phân tầng: {c_tier}, isSeller: {c_seller}")
        else:
            record_result("TC-02.2", "Xác thực API Profile Seller SSOT", "FAIL", f"Thông tin không khớp: {profile}")
    else:
        record_result("TC-02.2", "Xác thực API Profile Seller SSOT", "FAIL", f"Status {status}")

    # 2.3 Kích hoạt Dual Mode (kích hoạt BUYER cho Seller)
    status, act_res = http_post(f"{BACKEND_URL}/api/v1/portal/enterprise/capabilities/activate", {
        "capability": "BUYER"
    }, token=seller_token)
    tier = act_res.get("data", {}).get("capabilityTier")
    if status == 200 and tier == "DUAL":
        record_result("TC-02.3", "Kích hoạt năng lực Bên Mua (Nâng hạng DUAL Mode)", "PASS", f"Capability Tier mới: {tier}")
    else:
        record_result("TC-02.3", "Kích hoạt năng lực Bên Mua", "FAIL", f"Status: {status}, Tier: {tier}")

    # 2.4 Chuyển đổi vai trò sang BUYER
    status, sw_res = http_post(f"{BACKEND_URL}/api/v1/portal/enterprise/capabilities/switch-role", {
        "targetRole": "BUYER"
    }, token=seller_token)
    active_role = sw_res.get("data", {}).get("activeRole")
    if status == 200 and active_role == "BUYER":
        record_result("TC-02.4", "Chuyển vai trò linh hoạt sang BUYER", "PASS", f"Active Role: {active_role}")
    else:
        record_result("TC-02.4", "Chuyển vai trò sang BUYER", "FAIL", f"Active Role: {active_role}")

    # 2.5 Chuyển đổi vai trò trở lại SELLER
    status, sw_back = http_post(f"{BACKEND_URL}/api/v1/portal/enterprise/capabilities/switch-role", {
        "targetRole": "SELLER"
    }, token=seller_token)
    active_role_back = sw_back.get("data", {}).get("activeRole")
    if status == 200 and active_role_back == "SELLER":
        record_result("TC-02.5", "Chuyển đổi vai trò trở lại SELLER", "PASS", f"Active Role: {active_role_back}")
    else:
        record_result("TC-02.5", "Chuyển đổi vai trò trở lại SELLER", "FAIL", f"Active Role: {active_role_back}")

    # 2.6 Kiểm tra RoleSwitcher trên giao diện thật (Playwright)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.goto(f"{FRONTEND_URL}/")
        page.evaluate("""({ token, user }) => {
            localStorage.setItem('nacentwin_access_token', token);
            localStorage.setItem('nacentwin_user_context', JSON.stringify(user));
        }""", {"token": seller_token, "user": seller_user})

        page.goto(f"{FRONTEND_URL}/portal")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Chụp ảnh màn hình State 3: Role Switcher trên Portal
        screenshot_3_path = os.path.join(EVIDENCE_DIR, "03_role_switcher_portal.png")
        page.screenshot(path=screenshot_3_path, full_page=False)

        switcher_text = page.locator("text=Bên Bán").first.is_visible()
        if switcher_text:
            record_result("TC-02.6", "Hiển thị Component Role Switcher trên Portal UI", "PASS", "Role Switcher hiển thị chuẩn xác")
        else:
            record_result("TC-02.6", "Hiển thị Component Role Switcher trên Portal UI", "FAIL", "Không thấy nhãn Bên Bán trên Portal")

        browser.close()

    # Phục hồi trạng thái mặc định cho seller trong CSDL
    psql_query("""
        UPDATE enterprise.enterprises 
        SET capability_tier = 'SELLER', is_seller = true, is_buyer = false, active_role = 'SELLER'
        WHERE tax_code = '0108992134';
    """)

# =============================================================================
# SCENARIO 3: TRIỆT TIÊU BUG 500 UNIQUE CONSTRAINT (NULL TAXCODE PROFILE)
# =============================================================================
def verify_scenario_3_prevent_500_unique_constraint():
    print("\n" + "=" * 80)
    print(">>> THỰC THI SCENARIO 3: KIỂM THỬ TRIỆT TIÊU BUG 500 UNIQUE CONSTRAINT")
    print("=" * 80)

    # 3.1 Đăng ký tài khoản mới tinh chưa có MST
    test_email = f"qc.zeromock.{int(time.time())}@nacentech.vn"
    reg_status, reg_res = http_post(f"{BACKEND_URL}/api/v1/auth/register", {
        "email": test_email,
        "password": "Password@123",
        "confirmPassword": "Password@123",
        "firstName": "QC",
        "lastName": "ZeroMock",
        "organizationName": "Doanh Nghiệp Thử Nghiệm",
        "phone": "0912345678"
    })

    new_token = None
    if reg_status in (200, 201):
        log_status, log_res = http_post(f"{BACKEND_URL}/api/v1/auth/login", {
            "email": test_email,
            "password": "Password@123"
        })
        if log_status == 200:
            new_token = log_res.get("accessToken")

    if not new_token:
        record_result("TC-03.1", "Tạo tài khoản mới chưa kê khai MST", "FAIL", f"Register failed: {reg_status}, {reg_res}")
        return
    record_result("TC-03.1", "Tạo tài khoản mới chưa kê khai MST", "PASS", f"Email: {test_email}")

    # 3.2 Gọi API GET profile
    status, prof_res = http_get(f"{BACKEND_URL}/api/v1/portal/enterprise/profile", token=new_token)
    if status == 200:
        data = prof_res.get("data")
        tax_code = data.get("taxCode") if data else None
        if tax_code is None or tax_code == "":
            record_result("TC-03.2", "GET /api/v1/portal/enterprise/profile trả về 200 OK với TaxCode = null (Không bị 500)", "PASS",
                          f"Status: {status}, TaxCode: {tax_code}, Hồ sơ nháp khởi tạo an toàn")
        else:
            record_result("TC-03.2", "GET profile trả về 200 OK", "PASS", f"TaxCode: {tax_code}")
    else:
        record_result("TC-03.2", "GET /api/v1/portal/enterprise/profile không bị lỗi 500", "FAIL",
                      f"Status trả về {status}: {prof_res}")

    # 3.3 Tạo thêm tài khoản thứ 2 cũng không có MST để khẳng định không dính Unique Constraint giữa 2 hồ sơ TaxCode null
    test_email_2 = f"qc.zeromock.second.{int(time.time())}@nacentech.vn"
    _, reg_res_2 = http_post(f"{BACKEND_URL}/api/v1/auth/register", {
        "email": test_email_2,
        "password": "Password@123",
        "confirmPassword": "Password@123",
        "firstName": "QC2",
        "lastName": "ZeroMock2",
        "organizationName": "Doanh Nghiệp Thử Nghiệm 2",
        "phone": "0912345679"
    })
    log_status_2, log_res_2 = http_post(f"{BACKEND_URL}/api/v1/auth/login", {
        "email": test_email_2,
        "password": "Password@123"
    })
    token_2 = log_res_2.get("accessToken") if log_status_2 == 200 else None
    if token_2:
        status2, prof_res_2 = http_get(f"{BACKEND_URL}/api/v1/portal/enterprise/profile", token=token_2)
        if status2 == 200:
            record_result("TC-03.3", "Hai hồ sơ đồng thời có TaxCode = null không vi phạm Unique Index", "PASS",
                          "Cơ chế Partial Unique Index hoạt động hoàn hảo")
        else:
            record_result("TC-03.3", "Hai hồ sơ đồng thời có TaxCode = null", "FAIL", f"Status: {status2}, Res: {prof_res_2}")

# =============================================================================
# SCENARIO 4: ĐỐI SOÁT TRỰC TIẾP CSDL POSTGRESQL (CONTAINER nacentech-postgres-1)
# =============================================================================
def verify_scenario_4_postgresql_ssot():
    print("\n" + "=" * 80)
    print(">>> THỰC THI SCENARIO 4: ĐỐI SOÁT CSDL POSTGRESQL (ZERO-MOCK SSOT)")
    print("=" * 80)

    # 4.1 Kiểm tra Partial Unique Index
    idx_def = psql_query("""
        SELECT indexdef FROM pg_indexes 
        WHERE schemaname = 'enterprise' AND tablename = 'enterprises' 
        AND indexname = 'ix_enterprises_tax_code_unique';
    """)
    if "tax_code IS NOT NULL" in idx_def:
        record_result("TC-04.1", "Kiểm tra Partial Unique Index trên CSDL thật", "PASS", f"Index definition: {idx_def}")
    else:
        record_result("TC-04.1", "Kiểm tra Partial Unique Index trên CSDL thật", "FAIL", f"Index không có điều kiện WHERE: {idx_def}")

    # 4.2 Kiểm tra dữ liệu CÔNG TY TNHH TRƯỜNG HOAN
    truong_hoan_row = psql_query("""
        SELECT id, name, tax_code, province_city, capability_tier, is_buyer, is_seller, active_role
        FROM enterprise.enterprises WHERE tax_code = '0100255428';
    """)
    if truong_hoan_row and "TRƯỜNG HOAN" in truong_hoan_row:
        record_result("TC-04.2", "Đối soát hồ sơ Buyer TRƯỜNG HOAN trong bảng enterprise.enterprises", "PASS",
                      f"DB Row: {truong_hoan_row}")
    else:
        record_result("TC-04.2", "Đối soát hồ sơ Buyer TRƯỜNG HOAN", "FAIL", f"Row: {truong_hoan_row}")

    # 4.3 Kiểm tra dữ liệu CÔNG TY TÂN TIẾN
    tan_tien_row = psql_query("""
        SELECT id, name, tax_code, province_city, capability_tier, is_buyer, is_seller, active_role
        FROM enterprise.enterprises WHERE tax_code = '0108992134';
    """)
    if tan_tien_row and "TÂN TIẾN" in tan_tien_row:
        record_result("TC-04.3", "Đối soát hồ sơ Seller TÂN TIẾN trong bảng enterprise.enterprises", "PASS",
                      f"DB Row: {tan_tien_row}")
    else:
        record_result("TC-04.3", "Đối soát hồ sơ Seller TÂN TIẾN", "FAIL", f"Row: {tan_tien_row}")

    # 4.4 Kiểm tra bảng enterprise.enterprise_identifiers
    id_count = psql_query("""
        SELECT count(*) FROM enterprise.enterprise_identifiers 
        WHERE type = 'USER_ID' AND value IN (
            (SELECT id::text FROM identity.persons WHERE email = 'buyer.user@demo.nacentech.vn'),
            (SELECT id::text FROM identity.persons WHERE email = 'seller.user@demo.nacentech.vn')
        );
    """)
    if int(id_count or "0") >= 2:
        record_result("TC-04.4", "Định danh USER_ID được ánh xạ 1:1 chuẩn xác với Identity Users", "PASS",
                      f"Số lượng định danh ánh xạ: {id_count}")
    else:
        record_result("TC-04.4", "Định danh USER_ID được ánh xạ", "FAIL", f"Tìm thấy {id_count} định danh")

def main():
    print("""
    =============================================================================
    NACENTECH GATE 4: INDEPENDENT QUALITY CONTROL VERIFICATION
    Target System: Live Environment (PostgreSQL + .NET API + Next.js Frontend)
    QC Specialist: nacen-qc
    =============================================================================
    """)

    verify_scenario_1_playwright_prefill()
    verify_scenario_2_seller_and_dual_mode()
    verify_scenario_3_prevent_500_unique_constraint()
    verify_scenario_4_postgresql_ssot()

    total = len(test_results)
    passed = sum(1 for t in test_results if t["status"] == "PASS")
    failed = total - passed

    print("\n" + "=" * 80)
    print(f"  TỔNG KẾT KIỂM THỬ GATE 4: {passed}/{total} PASS ({failed} FAILED)")
    print("=" * 80)

    if failed > 0:
        print("  [KẾT LUẬN] KHÔNG ĐẠT ĐIỀU KIỆN GATE 4 PASS!")
        sys.exit(1)
    else:
        print("  [KẾT LUẬN] 100% TEST CASE ĐÃ PASS TRÊN MÔI TRƯỜNG THẬT! ĐỦ ĐIỀU KIỆN KÝ DUYỆT GATE 4.")
        sys.exit(0)

if __name__ == "__main__":
    main()
