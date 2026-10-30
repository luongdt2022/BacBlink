#!/usr/bin/env python3
"""
nacen-qc: Comprehensive Gate 4 Verification Suite for CR-2026-011 (Đợt 2)
Deep Verification with Playwright, Real PostgreSQL, and Strict Invariants
"""

import sys
import json
import subprocess
import time
from playwright.sync_api import sync_playwright

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:5080"

EXPECTED_10_SECTORS = [
    ("LV01", "Nông nghiệp"),
    ("LV05", "Chế biến thực phẩm – đồ uống"),
    ("LV07", "Cơ khí – chế tạo – công nghiệp hỗ trợ"),
    ("LV08", "Điện – điện tử – tự động hóa"),
    ("LV11", "Nước – môi trường – chất thải"),
    ("LV12", "Xây dựng – vật liệu – hạ tầng"),
    ("LV14", "Logistics – vận tải – kho bãi"),
    ("LV15", "Du lịch – khách sạn – nhà hàng"),
    ("LV16", "CNTT – viễn thông – chuyển đổi số"),
    ("LV17", "Khoa học – công nghệ – đổi mới sáng tạo"),
]

def psql_query(query: str) -> str:
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-t", "-A", "-c", query
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"psql error: {res.stderr}\nQuery: {query}")
    return res.stdout.strip()

def run_suite():
    results = {
        "suite": "CR-2026-011_Gate_4_Verification",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_checks": 0,
        "passed": 0,
        "failed": 0,
        "defects": [],
        "user_journeys": 6,
        "test_cases": 46,
        "details": {}
    }

    def check(name: str, passed: bool, error: str = "", metadata: dict = None):
        results["total_checks"] += 1
        entry = {"check": name, "status": "PASS" if passed else "FAIL", "metadata": metadata or {}}
        if not passed:
            entry["error"] = error
            results["failed"] += 1
            results["defects"].append(entry)
            print(f"❌ [FAIL] {name}: {error}")
        else:
            results["passed"] += 1
            print(f"✅ [PASS] {name}")
        results["details"].setdefault(name, []).append(entry)

    print("=" * 80)
    print("🚀 BẮT ĐẦU KIỂM THỬ QC GATE 4: CR-2026-011 TAXONOMY ALIGNMENT & ZERO-MOCK (ĐỢT 2)")
    print("=" * 80)

    # -------------------------------------------------------------
    # 0. AUDIT DATABASE POSTGRESQL TRUTH
    # -------------------------------------------------------------
    print("\n--- [TẦNG 1: CSDL POSTGRESQL THẬT & MASTER DATA TAXONOMY] ---")
    db_sectors_raw = psql_query("SELECT code || '|' || name FROM policy.taxonomy_terms WHERE kind = 'SECTOR' ORDER BY code;")
    db_sectors = [line.split("|") for line in db_sectors_raw.splitlines() if line.strip()]
    
    check("DB_SSOT_10_SECTORS_COUNT", len(db_sectors) == 10, f"Expected 10 sectors, got {len(db_sectors)}", {"sectors": db_sectors})
    for code, name in EXPECTED_10_SECTORS:
        found = any(s[0] == code for s in db_sectors)
        check(f"DB_SSOT_SECTOR_EXISTS_{code}", found, f"Sector code {code} missing in policy.taxonomy_terms")

    db_enterprise_total = int(psql_query("SELECT COUNT(*) FROM enterprise.enterprises;"))
    db_enterprise_verified = int(psql_query("SELECT COUNT(*) FROM enterprise.enterprises WHERE is_verified = true OR verification_status = 'VERIFIED';"))
    print(f"PostgreSQL Truth: Total Enterprises = {db_enterprise_total}, Verified = {db_enterprise_verified}")

    # -------------------------------------------------------------
    # PLAYWRIGHT BROWSER E2E TESTS
    # -------------------------------------------------------------
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        user_seller = {
            "id": "u1111111-0000-0000-0000-000000000001",
            "email": "seller@nacentech.vn",
            "fullName": "Nhà Cung Ứng Test",
            "role": "SELLER"
        }
        user_admin = {
            "id": "u0000000-0000-0000-0000-000000000000",
            "email": "admin@nacentech.vn",
            "fullName": "Quản Trị Viên Tối Cao",
            "role": "SUPER_ADMIN"
        }

        # -------------------------------------------------------------
        # 1. KIỂM TRA DANH BẠ DOANH NGHIỆP (/enterprises)
        # -------------------------------------------------------------
        print("\n--- [TẦNG 2: DANH BẠ DOANH NGHIỆP (/enterprises)] ---")
        page.goto(f"{FRONTEND_URL}/enterprises", wait_until="networkidle")
        
        # 1.1 Verify Sector dropdown exists and loaded
        select_loc = page.locator("#filter-sector")
        select_loc.wait_for(state="attached", timeout=10000)
        options = select_loc.locator("option").all_inner_texts()
        option_values = [select_loc.locator("option").nth(i).get_attribute("value") for i in range(len(options))]
        
        check("FE_ENTERPRISES_DROPDOWN_OPTIONS_COUNT", len(options) == 11, f"Expected 11 options (1 default + 10 sectors), got {len(options)}", {"options": options})
        check("FE_ENTERPRISES_DROPDOWN_FIRST_OPTION", "Tất cả lĩnh vực công nghệ" in options[0], f"Option 0 was {options[0]}")
        
        # Verify codes and text align with DB SSOT
        for code, expected_name in EXPECTED_10_SECTORS:
            has_code = code in option_values
            check(f"FE_ENTERPRISES_OPTION_CODE_{code}", has_code, f"Option value {code} not in dropdown")
            if has_code:
                idx = option_values.index(code)
                opt_text = options[idx]
                matches = expected_name in opt_text or opt_text in expected_name
                check(f"FE_ENTERPRISES_LABEL_CORRECT_{code}", matches, f"Code {code} label incorrect: '{opt_text}', expected '{expected_name}'")

        # 1.2 User Journey 1: Filter by Sector LV01 (Nông nghiệp)
        select_loc.select_option("LV01")
        page.wait_for_timeout(1000)
        cards_count_lv01 = page.locator("article, [data-testid='enterprise-card'], div.bg-white.rounded-2xl").count()
        print(f"Cards count after selecting LV01: {cards_count_lv01}")
        check("FE_ENTERPRISES_FILTER_INTERACTION_LV01", cards_count_lv01 > 0, "No cards displayed when filtering by LV01")

        # 1.3 User Journey 2: Filter by Sector LV05 (Chế biến thực phẩm)
        select_loc.select_option("LV05")
        page.wait_for_timeout(1000)
        cards_count_lv05 = page.locator("article, [data-testid='enterprise-card'], div.bg-white.rounded-2xl").count()
        print(f"Cards count after selecting LV05: {cards_count_lv05}")
        check("FE_ENTERPRISES_FILTER_INTERACTION_LV05", cards_count_lv05 > 0, "No cards displayed when filtering by LV05")

        # -------------------------------------------------------------
        # 2. KIỂM TRA FORM TẠO & SỬA CÔNG NGHỆ SELLER (User Journey 3)
        # -------------------------------------------------------------
        print("\n--- [TẦNG 3: SELLER TECH CREATE & EDIT FORM] ---")
        # Authenticate as SELLER in portal
        page.goto(f"{FRONTEND_URL}/portal")
        page.evaluate("""([k1, v1, k2, v2]) => {
            localStorage.setItem(k1, v1);
            localStorage.setItem(k2, v2);
        }""", ["nacentwin_access_token", "mock-token", "nacentwin_user_context", json.dumps(user_seller)])

        page.goto(f"{FRONTEND_URL}/portal/seller/technologies/create", wait_until="networkidle")
        
        # Click Step 2 button on FormStepper
        step2_btn = page.locator("button:has-text('Thông số kỹ thuật')").first
        if step2_btn.count() > 0:
            step2_btn.click()
            page.wait_for_timeout(500)
            stepper_h2 = page.locator("h2:has-text('Bước 2:')").first
            stepper_text = stepper_h2.inner_text() if stepper_h2.count() > 0 else ""
            print(f"Create page Stepper Step 2 text: '{stepper_text}'")
            check("FE_SELLER_CREATE_STEPPER_LABEL_10_LV", "10 Lĩnh Vực TT17" in stepper_text, f"Found: '{stepper_text}'")
            check("FE_SELLER_CREATE_NO_18_NGANH", "18 Ngành TT17" not in stepper_text, "Found 18 Ngành TT17 in Stepper")
        else:
            check("FE_SELLER_CREATE_STEPPER_LABEL_10_LV", False, "Could not locate Step 2 button")

        # -------------------------------------------------------------
        # 3. KIỂM TRA ADMIN LAYOUT & MENU (User Journey 4)
        # -------------------------------------------------------------
        print("\n--- [TẦNG 4: ADMIN NAVIGATION MENU (/admin/layout)] ---")
        page.evaluate("""([k1, v1, k2, v2]) => {
            localStorage.setItem(k1, v1);
            localStorage.setItem(k2, v2);
        }""", ["nacentwin_access_token", "mock-token", "nacentwin_user_context", json.dumps(user_admin)])
        
        page.goto(f"{FRONTEND_URL}/admin/enterprises/dashboard", wait_until="networkidle")
        page.wait_for_timeout(1000)

        menu_link = page.locator("a[href='/admin/sectors']")
        menu_text = menu_link.inner_text() if menu_link.count() > 0 else ""
        print(f"Admin menu link text: '{menu_text}'")
        check("FE_ADMIN_MENU_10_LV_LABEL", "10 Lĩnh Vực TT17 & TRL" in menu_text, f"Menu text was: '{menu_text}'")
        check("FE_ADMIN_MENU_NO_18_NGANH", "18 Ngành TT17" not in menu_text, f"Found 18 Ngành in Admin menu: '{menu_text}'")

        # -------------------------------------------------------------
        # 4. KIỂM TRA DANH BẠ CHUYÊN GIA (/experts) (User Journey 5)
        # -------------------------------------------------------------
        print("\n--- [TẦNG 5: DANH BẠ CHUYÊN GIA (/experts)] ---")
        page.goto(f"{FRONTEND_URL}/experts", wait_until="networkidle")
        page.wait_for_timeout(1000)
        expert_body = page.locator("body").inner_text()
        check("FE_EXPERTS_NO_18_NGANH_IN_BODY", "18 ngành" not in expert_body and "18 Ngành" not in expert_body, "Found 18 Ngành in experts page")

        # -------------------------------------------------------------
        # 5. KIỂM TRA ADMIN ENTERPRISE DASHBOARD VS POSTGRESQL (User Journey 6)
        # -------------------------------------------------------------
        print("\n--- [TẦNG 6: DASHBOARD DOANH NGHIỆP (/admin/enterprises/dashboard) VS POSTGRESQL] ---")
        page.goto(f"{FRONTEND_URL}/admin/enterprises/dashboard", wait_until="networkidle")
        page.wait_for_timeout(1000)
        
        inner_main = page.locator("main.min-h-screen")
        dashboard_content = inner_main.inner_text()
        metrics = inner_main.locator(".text-3xl, .text-2xl").all_inner_texts()
        print(f"Dashboard metrics: {metrics}")

        check("FE_DASHBOARD_TOTAL_ENTERPRISES_MATCHES_DB", str(db_enterprise_total) in metrics, f"Total enterprises {db_enterprise_total} not found in {metrics}")
        check("FE_DASHBOARD_VERIFIED_COUNT_MATCHES_DB", str(db_enterprise_verified) in metrics, f"Verified count {db_enterprise_verified} not found in {metrics}")
        check("FE_DASHBOARD_PROVINCE_TIEN_GIANG_166", "Tiền Giang" in dashboard_content and "166" in dashboard_content, "Tiền Giang (166) missing in dashboard")
        check("FE_DASHBOARD_PROVINCE_HA_NOI_38", "Hà Nội" in dashboard_content and "38" in dashboard_content, "Hà Nội (38) missing in dashboard")
        check("FE_DASHBOARD_SECTOR_CHE_BIEN_114", "Công nghiệp chế biến, chế tạo" in dashboard_content and "114" in dashboard_content, "Chế biến chế tạo (114) missing in dashboard")

        # -------------------------------------------------------------
        # 6. STATIC GREP AUDIT TRÊN TOÀN BỘ FRONTEND SRC
        # -------------------------------------------------------------
        print("\n--- [TẦNG 7: STATIC AUDIT - BẮT CHUỖI '18 ngành' CÒN SÓT LẠI] ---")
        grep_res = subprocess.run("grep -rni '18 ngành\\|18 nhóm ngành' SourceCode/frontend/src/", shell=True, capture_output=True, text=True)
        grep_output = grep_res.stdout.strip()
        
        if grep_output:
            print("⚠️ TÌM THẤY CHUỖI '18 ngành / 18 nhóm ngành' TRONG SRC (DEFECT):")
            for line in grep_output.splitlines():
                print(f"   -> {line}")
            check("STATIC_AUDIT_ZERO_18_NGANH_IN_SRC", False, f"Phát hiện {len(grep_output.splitlines())} tham chiếu '18 ngành' sót lại trong SourceCode/frontend/src/ (Step1CoreFields & test)", {"occurrences": grep_output.splitlines()})
        else:
            check("STATIC_AUDIT_ZERO_18_NGANH_IN_SRC", True)

        browser.close()

    # Save execution results
    with open("cr_2026_011_qc_execution_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 80)
    print(f"📊 TỔNG KẾT KIỂM THỬ QC GATE 4: {results['passed']}/{results['total_checks']} CHECKS PASS, {results['failed']} FAILED")
    print("=" * 80)

if __name__ == "__main__":
    run_suite()
