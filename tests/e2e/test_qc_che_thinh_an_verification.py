#!/usr/bin/env python3
"""
=============================================================================
KỊCH BẢN KIỂM THỬ QC ĐỘC LẬP (GATE 4) - SỰ CỐ ĐIỀU HƯỚNG SẢN PHẨM CHÈ THỊNH AN
=============================================================================
MỤC TIÊU KIỂM ĐỊNH:
1. Đối soát CSDL PostgreSQL thật (container nacentech-postgres-1):
   - Bảng technology.seller_technology_offers (offer 60f8a021-2ed9-464f-bb91-6c470ad18709).
   - Bảng enterprise.enterprises (MST 0109887766).
   - Kiểm tra số lượng sản phẩm chào bán APPROVED gắn với MST 0109887766.
2. Kiểm tra API Backend:
   - Endpoint GET /api/v1/technologies/60f8a021-2ed9-464f-bb91-6c470ad18709
   - Endpoint GET /api/v1/enterprises/0109887766
   - Endpoint GET /api/v1/technologies?enterpriseTaxCode=0109887766
3. Kiểm thử tương tác Playwright trên trình duyệt sống (User Journey & Edge Cases):
   - Mở chi tiết sản phẩm "Chè Thịnh AN" -> Click "Xem Hồ Sơ Doanh Nghiệp" -> Điều hướng /enterprises/0109887766.
   - Kiểm tra trang hồ sơ /enterprises/0109887766 -> Tab sản phẩm hiển thị "Chè Thịnh AN" (không bị 0 / rỗng).
   - Kiểm tra trường hợp biên (Offer không có MST): Nút disabled "Chưa liên kết hồ sơ DN", không còn fallback 0108992134.
4. Chụp ảnh Visual QA đối soát các trạng thái UX.
=============================================================================
"""

import os
import sys
import json
import subprocess
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"
OFFER_ID = "60f8a021-2ed9-464f-bb91-6c470ad18709"
TAX_CODE = "0109887766"
WRONG_FALLBACK_TAX_CODE = "0108992134"
NO_TAX_OFFER_ID = "11111111-1111-1111-1111-111111111111"

SCREENSHOT_DIR = os.path.abspath("SourceCode/frontend/tests/visual-qa/screenshots/che_thinh_an")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def query_db(sql: str) -> str:
    res = subprocess.run(
        ["docker", "exec", "nacentech-postgres-1", "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql],
        capture_output=True,
        text=True,
        check=True
    )
    return res.stdout.strip()

def http_get(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "QC-Test-Suite"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode("utf-8")
            return resp.status, json.loads(data)
    except urllib.error.HTTPError as e:
        return e.code, None

def test_deep_database_state():
    print("\n" + "=" * 70)
    print("▶ [TẦNG 1] ĐỐI SOÁT CSDL POSTGRESQL THẬT (Deep DB State Verification)")
    print("=" * 70)

    # 1.1 Kiểm tra sản phẩm Chè Thịnh AN
    print(f"Checking seller_technology_offers for offer id '{OFFER_ID}'...")
    offer_row = query_db(
        f"SELECT offer_code, title, enterprise_tax_code, enterprise_name, status "
        f"FROM technology.seller_technology_offers WHERE id = '{OFFER_ID}';"
    )
    print(f"  DB Output: {offer_row}")
    parts = offer_row.split("|")
    assert len(parts) >= 5, f"Unexpected DB row format: {offer_row}"
    offer_code, title, ent_tax_code, ent_name, status = parts[0], parts[1], parts[2], parts[3], parts[4]

    assert title == "Chè Thịnh AN", f"Expected title 'Chè Thịnh AN', got '{title}'"
    assert ent_tax_code == TAX_CODE, f"Expected tax_code '{TAX_CODE}', got '{ent_tax_code}'"
    assert ent_name == "Công ty TNHH Demo ĐMST", f"Expected name 'Công ty TNHH Demo ĐMST', got '{ent_name}'"
    assert status == "APPROVED", f"Expected status 'APPROVED', got '{status}'"
    print("  ✓ seller_technology_offers: PASSED (Tax code, Name, Status chuẩn xác)")

    # 1.2 Kiểm tra thông tin Doanh nghiệp Demo ĐMST trong enterprise.enterprises
    print(f"\nChecking enterprise.enterprises for tax_code '{TAX_CODE}'...")
    ent_row = query_db(
        f"SELECT id, name, tax_code, status FROM enterprise.enterprises WHERE tax_code = '{TAX_CODE}';"
    )
    print(f"  DB Output: {ent_row}")
    ent_parts = ent_row.split("|")
    assert len(ent_parts) >= 4, f"Unexpected enterprise row: {ent_row}"
    ent_id, db_ent_name, db_tax_code, db_status = ent_parts[0], ent_parts[1], ent_parts[2], ent_parts[3]

    assert db_tax_code == TAX_CODE, f"Expected tax_code '{TAX_CODE}', got '{db_tax_code}'"
    assert db_ent_name == "Công ty TNHH Demo ĐMST", f"Expected name 'Công ty TNHH Demo ĐMST', got '{db_ent_name}'"
    assert db_status == "ACTIVE", f"Expected status 'ACTIVE', got '{db_status}'"
    print("  ✓ enterprise.enterprises: PASSED (Enterprise tồn tại và ACTIVE)")

    # 1.3 Kiểm tra danh sách sản phẩm APPROVED cho MST 0109887766
    print(f"\nChecking APPROVED offers count for tax_code '{TAX_CODE}'...")
    approved_count = int(query_db(
        f"SELECT COUNT(*) FROM technology.seller_technology_offers "
        f"WHERE enterprise_tax_code = '{TAX_CODE}' AND status = 'APPROVED';"
    ))
    print(f"  Approved offers count: {approved_count}")
    assert approved_count == 1, f"Expected exactly 1 APPROVED offer, got {approved_count}"
    print("  ✓ Approved count verification: PASSED (Đúng 1 sản phẩm APPROVED)")

def test_backend_api_endpoints():
    print("\n" + "=" * 70)
    print("▶ [TẦNG 2] KIỂM ĐỊNH HỢP ĐỒNG API BACKEND (.NET Core)")
    print("=" * 70)

    # 2.1 API Offer Detail
    url_offer = f"{BASE_API_URL}/api/v1/technologies/{OFFER_ID}"
    print(f"Calling GET {url_offer}...")
    status, data = http_get(url_offer)
    assert status == 200, f"Expected status 200, got {status}"
    payload = data.get("data", data)
    assert payload.get("enterpriseTaxCode") == TAX_CODE, f"API enterpriseTaxCode mismatch: {payload.get('enterpriseTaxCode')}"
    assert payload.get("enterpriseName") == "Công ty TNHH Demo ĐMST", f"API enterpriseName mismatch: {payload.get('enterpriseName')}"
    assert payload.get("title") == "Chè Thịnh AN", f"API title mismatch: {payload.get('title')}"
    print("  ✓ GET /api/v1/technologies/{id}: PASSED (enterpriseTaxCode='0109887766')")

    # 2.2 API Enterprise Detail
    url_ent = f"{BASE_API_URL}/api/v1/enterprises/{TAX_CODE}"
    print(f"\nCalling GET {url_ent}...")
    status, data = http_get(url_ent)
    assert status == 200, f"Expected status 200, got {status}"
    ent_data = data.get("data", data)
    assert ent_data.get("taxCode") == TAX_CODE, f"API taxCode mismatch: {ent_data.get('taxCode')}"
    assert ent_data.get("name") == "Công ty TNHH Demo ĐMST", f"API name mismatch: {ent_data.get('name')}"
    print("  ✓ GET /api/v1/enterprises/{taxCode}: PASSED (name='Công ty TNHH Demo ĐMST')")

    # 2.3 API Query Technologies by EnterpriseTaxCode
    url_techs = f"{BASE_API_URL}/api/v1/technologies?enterpriseTaxCode={TAX_CODE}"
    print(f"\nCalling GET {url_techs}...")
    status, data = http_get(url_techs)
    assert status == 200, f"Expected status 200, got {status}"
    if isinstance(data.get("data"), list):
        items = data["data"]
        total = data.get("total", len(items))
    else:
        tech_data = data.get("data", data)
        total = tech_data.get("total", 0)
        items = tech_data.get("items", [])
    assert total == 1, f"Expected total=1, got {total}"
    assert len(items) == 1, f"Expected items len 1, got {len(items)}"
    assert items[0].get("title") == "Chè Thịnh AN", f"Item title mismatch: {items[0].get('title')}"
    print("  ✓ GET /api/v1/technologies?enterpriseTaxCode=...: PASSED (total=1, Chè Thịnh AN)")

def test_playwright_e2e_journey():
    print("\n" + "=" * 70)
    print("▶ [TẦNG 3] KIỂM THỬ TRÌNH DUYỆT SỐNG & HÀNH TRÌNH NGƯỜI DÙNG (Playwright)")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # TEST SCENARIO A: Sản phẩm Chè Thịnh AN có MST 0109887766
        print("\n--- SCENARIO A: Kiểm thử chi tiết sản phẩm Chè Thịnh AN (/chao-ban-cong-nghe/{id}) ---")
        url_detail = f"{BASE_WEB_URL}/chao-ban-cong-nghe/{OFFER_ID}"
        print(f"Navigating to {url_detail}...")
        page.goto(url_detail, wait_until="networkidle", timeout=30000)

        # 1. Chờ render thông tin sản phẩm
        page.wait_for_selector("text=Chè Thịnh AN", timeout=10000)
        print("  ✓ Đã render tiêu đề 'Chè Thịnh AN'")

        # 2. Kiểm tra thông tin đơn vị chào bán
        ent_name_elem = page.locator("text=Công ty TNHH Demo ĐMST")
        assert ent_name_elem.count() >= 1, "Không tìm thấy tên 'Công ty TNHH Demo ĐMST' trên trang"
        print("  ✓ Hiển thị đúng đơn vị chào bán: 'Công ty TNHH Demo ĐMST'")

        # 3. Kiểm tra thông tin Mã số thuế
        tax_code_elem = page.locator(f"text={TAX_CODE}")
        assert tax_code_elem.count() >= 1, f"Không tìm thấy MST '{TAX_CODE}' trên trang"
        print(f"  ✓ Hiển thị đúng MST: '{TAX_CODE}'")

        # 4. Kiểm tra nút 'Xem Hồ Sơ Doanh Nghiệp →'
        profile_link = page.locator('a:has-text("Xem Hồ Sơ Doanh Nghiệp")')
        assert profile_link.count() >= 1, "Không tìm thấy link 'Xem Hồ Sơ Doanh Nghiệp'"
        href = profile_link.first.get_attribute("href")
        print(f"  Href của nút 'Xem Hồ Sơ Doanh Nghiệp': {href}")
        assert href == f"/enterprises/{TAX_CODE}", f"Link href sai: {href}, mong đợi /enterprises/{TAX_CODE}"

        # 5. Negative Assertion: Tuyệt đối không có link nào trỏ sang 0108992134
        all_links = page.locator("a").all()
        bad_links = [a.get_attribute("href") for a in all_links if a.get_attribute("href") and WRONG_FALLBACK_TAX_CODE in a.get_attribute("href")]
        assert len(bad_links) == 0, f"Phát hiện link trỏ nhầm sang {WRONG_FALLBACK_TAX_CODE}: {bad_links}"
        print(f"  ✓ Negative check: Không còn bất kỳ link nào trỏ tới {WRONG_FALLBACK_TAX_CODE}")

        # Chụp màn hình trang chi tiết
        screenshot_path_1 = os.path.join(SCREENSHOT_DIR, "01_che_thinh_an_detail.png")
        page.screenshot(path=screenshot_path_1, full_page=True)
        print(f"  📸 Đã chụp ảnh Visual QA: {screenshot_path_1}")

        # 6. KÍCH HOẠT HÀNH VI THỰC (Interactive Click navigation)
        print("\n▶ Bấm vào nút 'Xem Hồ Sơ Doanh Nghiệp →'...")
        profile_link.first.click()
        page.wait_for_url(f"**/enterprises/{TAX_CODE}*", timeout=15000)
        current_url = page.url
        print(f"  Current URL after navigation: {current_url}")
        assert f"/enterprises/{TAX_CODE}" in current_url, f"Điều hướng sai URL: {current_url}"
        print(f"  ✓ Điều hướng thành công sang hồ sơ doanh nghiệp: {current_url}")

        # TEST SCENARIO B: Hồ sơ Doanh nghiệp Demo ĐMST (/enterprises/0109887766)
        print("\n--- SCENARIO B: Kiểm thử trang hồ sơ doanh nghiệp Demo ĐMST ---")
        page.wait_for_selector(f"text=0109887766", timeout=10000)
        page.wait_for_selector("text=Công ty TNHH Demo ĐMST", timeout=10000)
        print("  ✓ Header hồ sơ doanh nghiệp hiển thị đúng tên và MST")

        # Kiểm tra Tab 'Sản phẩm & Dịch vụ Cung cấp'
        # Tìm tab có text liên quan đến sản phẩm / chào bán
        offers_tab = page.locator('button:has-text("Sản phẩm & Dịch vụ"), button:has-text("Chào bán"), button:has-text("Sản phẩm")').first
        if offers_tab.count() > 0:
            print(f"  Clicking offers tab: '{offers_tab.text_content().strip()}'...")
            offers_tab.click()
            page.wait_for_timeout(1000)

        # Chờ nạp sản phẩm
        page.wait_for_selector("text=Chè Thịnh AN", timeout=10000)
        print("  ✓ Tab Sản phẩm & Dịch vụ hiển thị thành công sản phẩm 'Chè Thịnh AN'!")

        # Kiểm tra không bị hiển thị Empty State rỗng 0 sản phẩm
        empty_state = page.locator("text=Chưa có sản phẩm, text=Chưa có công nghệ chào bán")
        assert empty_state.count() == 0, "Trang hồ sơ doanh nghiệp vẫn hiển thị Empty State rỗng!"
        print("  ✓ Khẳng định: Đã khắc phục triệt để lỗi Empty State (0 sản phẩm)")

        # Chụp ảnh hồ sơ doanh nghiệp
        screenshot_path_2 = os.path.join(SCREENSHOT_DIR, "02_enterprise_profile_with_product.png")
        page.screenshot(path=screenshot_path_2, full_page=True)
        print(f"  📸 Đã chụp ảnh Visual QA: {screenshot_path_2}")

        # TEST SCENARIO C: Kiểm tra trường hợp biên (Offer không có MST)
        print("\n--- SCENARIO C: Kiểm tra trường hợp biên (Offer không có MST: id={NO_TAX_OFFER_ID}) ---")
        no_tax_url = f"{BASE_WEB_URL}/chao-ban-cong-nghe/{NO_TAX_OFFER_ID}"
        print(f"Navigating to {no_tax_url}...")
        page.goto(no_tax_url, wait_until="networkidle", timeout=30000)

        page.wait_for_selector("text=Đang cập nhật MST", timeout=10000)
        print("  ✓ Hiển thị label: 'Đang cập nhật MST'")

        # Nút xem hồ sơ phải là button disabled 'Chưa liên kết hồ sơ DN'
        disabled_btn = page.locator('button:has-text("Chưa liên kết hồ sơ DN")')
        assert disabled_btn.count() >= 1, "Không tìm thấy button disabled 'Chưa liên kết hồ sơ DN'"
        assert disabled_btn.is_disabled(), "Button 'Chưa liên kết hồ sơ DN' không ở trạng thái disabled!"
        print("  ✓ Nút xem hồ sơ ở trạng thái disabled ('Chưa liên kết hồ sơ DN')")

        # Khẳng định không còn bất kỳ link nào trỏ tới 0108992134
        all_links_no_tax = page.locator("a").all()
        bad_links_no_tax = [a.get_attribute("href") for a in all_links_no_tax if a.get_attribute("href") and WRONG_FALLBACK_TAX_CODE in a.get_attribute("href")]
        assert len(bad_links_no_tax) == 0, f"Phát hiện link trỏ nhầm sang {WRONG_FALLBACK_TAX_CODE}: {bad_links_no_tax}"
        print(f"  ✓ Negative check: Không còn fallback cứng sang {WRONG_FALLBACK_TAX_CODE}")

        # Chụp ảnh fallback
        screenshot_path_3 = os.path.join(SCREENSHOT_DIR, "03_fallback_no_tax_code.png")
        page.screenshot(path=screenshot_path_3, full_page=True)
        print(f"  📸 Đã chụp ảnh Visual QA: {screenshot_path_3}")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 TẤT CẢ CÁC BÀI TEST 3 TẦNG ĐÃ PASS HOÀN TOÀN 100%!")
    print("=" * 70)

if __name__ == "__main__":
    try:
        test_deep_database_state()
        test_backend_api_endpoints()
        test_playwright_e2e_journey()
        print("\nQC VERIFICATION: SUCCESSFUL!")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ ASSERTION FAILED: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(2)
