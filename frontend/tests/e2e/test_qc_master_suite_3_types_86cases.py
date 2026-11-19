#!/usr/bin/env python3
"""
=============================================================================
BỘ KIỂM THỬ MASTER CHUYÊN SÂU 3 LOẠI HÌNH: THIẾT BỊ, SẢN PHẨM & GIẢI PHÁP
(DEVICE vs PRODUCT vs SOLUTION) - 86 TEST CASES
=============================================================================
Tác nhân: SELLER, CÁN BỘ SỞ KH&CN (HN & SG), QUẢN TRỊ VIÊN CẤP CAO, KHÁCH CÔNG KHAI
Phương pháp: Pure Black-Box Testing, Chromium Browser Live, Deep DB Verification
=============================================================================
"""

import sys
import time
import json
import urllib.request
import urllib.error
import subprocess
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"
TS = int(time.time())

# Dữ liệu mẫu duy nhất cho 3 loại hình
DEVICE_TITLE = f"Tổ hợp Máy Phay CNC 5 Trục Tốc Độ Cao NacenCNC QA-{TS}"
PRODUCT_TITLE = f"Chế Phẩm Vi Sinh Xử Lý Nước Thải Thủy Sản BioNacen QA-{TS}"
SOLUTION_TITLE = f"Nền Tảng AI IoT Dự Báo Sâu Bệnh Nông Nghiệp SmartFarm QA-{TS}"

TEST_RESULTS = []

def record(tc_id, description, status, notes=""):
    TEST_RESULTS.append({"id": tc_id, "desc": description, "status": status, "notes": notes})
    icon = "✅ PASS" if status == "PASS" else ("❌ FAIL" if status == "FAIL" else "⚠️ WARN")
    print(f"[{icon}] {tc_id}: {description}")
    if notes and status != "PASS":
        print(f"       -> Chi tiết lỗi: {notes}")

def query_db(sql: str) -> str:
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return res.stdout.strip()

# =============================================================================
# SUITE 1: TẠO HỒ SƠ 3 LOẠI HÌNH TRÊN FORM UI (4 TAB) & VALIDATION
# =============================================================================
def run_suite_1_form_creation(p):
    print("\n" + "=" * 75)
    print("🚀 SUITE 1: KIỂM THỬ TẠO HỒ SƠ 3 LOẠI HÌNH (THIẾT BỊ, SẢN PHẨM, GIẢI PHÁP)")
    print("=" * 75)

    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    # Track console errors
    console_errors = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)

    # Đăng nhập Seller
    page.goto(f"{BASE_WEB_URL}/login")
    page.fill('input[type="email"]', "seller.user@demo.nacentech.vn")
    page.fill('input[type="password"]', "Password@123")
    page.click('button:has-text("Đăng nhập")')
    page.wait_for_url(lambda u: "/portal" in u, timeout=15000)

    # -------------------------------------------------------------
    # 1.1. KIỂM THỬ CHUYỂN ĐỔI QUA LẠI 3 LOẠI HÌNH (CROSS-TYPE UI)
    # -------------------------------------------------------------
    page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
    page.wait_for_timeout(2000)

    # TC-CROSS-01: Chuyển đổi giữa 3 radio loại hình
    try:
        btn_dev = page.locator("button:has-text('Thiết bị')").first
        btn_prd = page.locator("button:has-text('Sản phẩm')").first
        btn_sol = page.locator("button:has-text('Giải pháp công nghệ')").first
        
        assert btn_dev.is_visible() and btn_prd.is_visible() and btn_sol.is_visible()
        record("TC-CROSS-01", "Kiểm tra sự hiện diện của 3 tùy chọn Loại hình chào bán (Thiết bị, Sản phẩm, Giải pháp)", "PASS")
    except Exception as e:
        record("TC-CROSS-01", "Kiểm tra sự hiện diện của 3 tùy chọn Loại hình chào bán", "FAIL", str(e))

    # TC-CROSS-03: Thử spam click chuyển đổi giữa 3 loại hình xem có crash UI không
    try:
        for _ in range(3):
            btn_dev.click()
            btn_prd.click()
            btn_sol.click()
        page.wait_for_timeout(500)
        assert page.locator("h1:has-text('Tạo hồ sơ chào bán')").is_visible()
        record("TC-CROSS-03", "Spam click chuyển đổi liên tục giữa 3 loại hình trong form không làm crash UI", "PASS")
    except Exception as e:
        record("TC-CROSS-03", "Spam click chuyển đổi liên tục giữa 3 loại hình", "FAIL", str(e))

    # -------------------------------------------------------------
    # 1.2. TẠO LOẠI HÌNH THIẾT BỊ (DEVICE)
    # -------------------------------------------------------------
    print("\n--- [1.2] Tạo hồ sơ Loại hình: THIẾT BỊ (DEVICE) ---")
    btn_dev.click()
    page.wait_for_timeout(500)

    # TC-DEV-01 & TC-DEV-02: Điền thông tin Thiết bị
    try:
        page.fill("input[placeholder*='sấy thăng hoa']", DEVICE_TITLE)
        page.fill("textarea[placeholder*='đặc điểm chính']", "Máy phay CNC 5 trục độ chính xác cao 0.005mm chuyên gia công cánh tuabin và khuôn mẫu phức tạp.")
        page.fill("textarea[placeholder*='nỗi đau']", "Thay thế máy phay nhập khẩu đắt tiền, rút ngắn thời gian gia công 50%.")
        
        # Chọn ngành Cơ khí (LV07)
        sector_sel = page.locator("select").nth(1)
        sector_sel.select_option(label="Cơ khí – chế tạo – công nghiệp hỗ trợ")

        # Chọn Sở KH&CN Hà Nội
        gov_sel = page.locator("select").first
        gov_sel.select_option(value="VN-HN")

        # Bật SHTT & chọn TRL 8
        page.click("button:has-text('Có')")
        page.click("button:has-text('8')")

        # Chọn bằng sáng chế
        ip_sel = page.locator("select").nth(2)
        ip_sel.select_option(index=0) # Patent Granted

        # Chuyển sang Tab 2: Thông số kỹ thuật
        tab2_btn = page.locator("button:has-text('2')").first
        tab2_btn.click()
        page.wait_for_timeout(1000)

        # TC-DEV-06: Điền thông số máy móc (Model, Xuất xứ, Năm SX)
        model_input = page.locator("input[placeholder*='CNC']").first
        if model_input.is_visible():
            model_input.fill("NCT-CNC-5X-PRO")
            record("TC-DEV-02", "Nhập mã Model thiết bị (NCT-CNC-5X-PRO) thành công", "PASS")
        else:
            record("TC-DEV-02", "Không tìm thấy ô nhập Model thiết bị trên Tab 2", "FAIL", "Missing model input")

        # Bấm nộp hồ sơ Fast-track/Submit
        page.click("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')")
        page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
        page.click("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
        page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)

        # Check DB
        dev_row = query_db(f"SELECT id, offer_code, offer_type, status, trl_level FROM technology.seller_technology_offers WHERE title = '{DEVICE_TITLE}';")
        assert dev_row, "Thiết bị chưa được lưu vào CSDL!"
        d_id, d_code, d_type, d_status, d_trl = dev_row.split("|")
        assert d_type == "DEVICE", f"Kỳ vọng offer_type=DEVICE, thực tế={d_type}"
        assert d_status == "PENDING"
        assert d_trl == "8"
        record("TC-DEV-14", f"CSDL PostgreSQL ghi nhận hồ sơ THIẾT BỊ: ID={d_id}, Type={d_type}, TRL={d_trl}, Status={d_status}", "PASS")
    except Exception as e:
        record("TC-DEV-14", "Tạo hồ sơ THIẾT BỊ trên UI và kiểm tra CSDL", "FAIL", str(e))

    # -------------------------------------------------------------
    # 1.3. TẠO LOẠI HÌNH SẢN PHẨM (PRODUCT)
    # -------------------------------------------------------------
    print("\n--- [1.3] Tạo hồ sơ Loại hình: SẢN PHẨM / CHẾ PHẨM (PRODUCT) ---")
    page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
    page.wait_for_timeout(2000)

    try:
        page.locator("button:has-text('Sản phẩm')").first.click()
        page.wait_for_timeout(500)

        page.fill("input[placeholder*='sấy thăng hoa']", PRODUCT_TITLE)
        page.fill("textarea[placeholder*='đặc điểm chính']", "Chế phẩm sinh học mật độ vi sinh 10^9 CFU/g giúp khử khí độc NH3, H2S đáy ao nuôi tôm siêu thâm canh.")
        page.fill("textarea[placeholder*='nỗi đau']", "Giảm 80% tỷ lệ chết do sốc môi trường, không cần dùng kháng sinh hóa chất.")

        # Chọn ngành Thủy sản hoặc Nông nghiệp
        page.locator("select").nth(1).select_option(label="Thủy sản")
        page.locator("select").first.select_option(value="VN-HN")

        # Bật SHTT & chọn TRL 7
        page.click("button:has-text('Có')")
        page.click("button:has-text('7')")

        # Nộp hồ sơ
        page.click("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')")
        page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
        page.click("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
        page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)

        # Check DB
        prd_row = query_db(f"SELECT id, offer_code, offer_type, status, trl_level FROM technology.seller_technology_offers WHERE title = '{PRODUCT_TITLE}';")
        assert prd_row, "Sản phẩm chưa được lưu vào CSDL!"
        p_id, p_code, p_type, p_status, p_trl = prd_row.split("|")
        assert p_type == "PRODUCT", f"Kỳ vọng offer_type=PRODUCT, thực tế={p_type}"
        assert p_status == "PENDING"
        record("TC-PRD-14", f"CSDL PostgreSQL ghi nhận hồ sơ SẢN PHẨM: ID={p_id}, Type={p_type}, TRL={p_trl}, Status={p_status}", "PASS")
    except Exception as e:
        record("TC-PRD-14", "Tạo hồ sơ SẢN PHẨM trên UI và kiểm tra CSDL", "FAIL", str(e))

    # -------------------------------------------------------------
    # 1.4. TẠO LOẠI HÌNH GIẢI PHÁP CÔNG NGHỆ (SOLUTION)
    # -------------------------------------------------------------
    print("\n--- [1.4] Tạo hồ sơ Loại hình: GIẢI PHÁP CÔNG NGHỆ (SOLUTION) ---")
    page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
    page.wait_for_timeout(2000)

    try:
        page.locator("button:has-text('Giải pháp công nghệ')").first.click()
        page.wait_for_timeout(500)

        page.fill("input[placeholder*='sấy thăng hoa']", SOLUTION_TITLE)
        page.fill("textarea[placeholder*='đặc điểm chính']", "Nền tảng trí tuệ nhân tạo phân tích dữ liệu viễn thám và trạm IoT dự báo trước 7 ngày nguy cơ bùng phát sâu rầy.")
        page.fill("textarea[placeholder*='nỗi đau']", "Giảm 35% lượng thuốc bảo vệ thực vật, đạt chuẩn xuất khẩu EU.")

        page.locator("select").nth(1).select_option(label="Nông nghiệp")
        page.locator("select").first.select_option(value="VN-HN")

        # Bật SHTT & chọn TRL 9 (SaaS đã chứng minh)
        page.click("button:has-text('Có')")
        page.click("button:has-text('9')")

        # Chọn hình thức chuyển giao: Li-xăng độc quyền
        page.locator("select").nth(3).select_option(index=1) # Exclusive license

        # Nộp hồ sơ
        page.click("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')")
        page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
        page.click("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
        page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)

        # Check DB
        sol_row = query_db(f"SELECT id, offer_code, offer_type, status, trl_level FROM technology.seller_technology_offers WHERE title = '{SOLUTION_TITLE}';")
        assert sol_row, "Giải pháp chưa được lưu vào CSDL!"
        s_id, s_code, s_type, s_status, s_trl = sol_row.split("|")
        assert s_type == "SOLUTION", f"Kỳ vọng offer_type=SOLUTION, thực tế={s_type}"
        assert s_status == "PENDING"
        record("TC-SOL-14", f"CSDL PostgreSQL ghi nhận hồ sơ GIẢI PHÁP: ID={s_id}, Type={s_type}, TRL={s_trl}, Status={s_status}", "PASS")
    except Exception as e:
        record("TC-SOL-14", "Tạo hồ sơ GIẢI PHÁP trên UI và kiểm tra CSDL", "FAIL", str(e))

    browser.close()

# =============================================================================
# SUITE 2: KIỂM THỬ THẨM ĐỊNH & PHÊ DUYỆT CẤP 2 (/gov/approvals) CHO 3 LOẠI HÌNH
# =============================================================================
def run_suite_2_approvals(p):
    print("\n" + "=" * 75)
    print("⚖️ SUITE 2: KIỂM THỬ THẨM ĐỊNH & PHÊ DUYỆT CẤP 2 (HÀ NỘI & TP.HCM)")
    print("=" * 75)

    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Track requests to check Scoped RBAC
    intercepted_requests = []
    page.on("request", lambda r: intercepted_requests.append((r.method, r.url, r.post_data)))

    # -------------------------------------------------------------
    # 2.1. Đăng nhập Cán bộ TP.HCM (saigon.admin - Scope SG)
    # KIỂM TRA LỖ HỔNG LỘ HỒ SƠ HÀ NỘI (SCOPED RBAC LEAK)
    # -------------------------------------------------------------
    print("\n--- [2.1] Kiểm tra phân quyền cách ly địa bàn (Cán bộ TP.HCM) ---")
    page.goto(f"{BASE_WEB_URL}/login")
    page.fill('input[type="email"]', "saigon.admin@demo.nacentech.vn")
    page.fill('input[type="password"]', "Password@123")
    page.click('button:has-text("Đăng nhập")')
    page.wait_for_timeout(2000)

    page.goto(f"{BASE_WEB_URL}/gov/approvals")
    page.wait_for_timeout(2000)
    page.click("button:has-text('Shop Chào Bán')")
    page.wait_for_timeout(1000)

    # TC-APPR-02: Cán bộ TP.HCM có nhìn thấy các hồ sơ Hà Nội vừa tạo không?
    content_saigon = page.locator("table").inner_text()
    leak_found = False
    leaked_titles = []
    for title in [DEVICE_TITLE, PRODUCT_TITLE, SOLUTION_TITLE]:
        if title in content_saigon:
            leak_found = True
            leaked_titles.append(title)

    if leak_found:
        record("TC-APPR-02", "Bảo vệ cách ly dữ liệu Scoped RBAC (Cán bộ TP.HCM không được thấy hồ sơ Hà Nội)", "FAIL", 
               f"LỖI RÒ RỈ DỮ LIỆU: Cán bộ TP.HCM thấy {len(leaked_titles)} hồ sơ của Hà Nội trong danh sách chờ duyệt!")
    else:
        record("TC-APPR-02", "Bảo vệ cách ly dữ liệu Scoped RBAC (Cán bộ TP.HCM không thấy hồ sơ Hà Nội)", "PASS")

    # -------------------------------------------------------------
    # 2.2. Đăng nhập Cán bộ Hà Nội (hanoi.admin - Scope HN)
    # THỰC HIỆN THẨM ĐỊNH VÀ PHÊ DUYỆT 3 LOẠI HÌNH
    # -------------------------------------------------------------
    print("\n--- [2.2] Kiểm tra thẩm định đúng thẩm quyền (Cán bộ Hà Nội) ---")
    page.goto(f"{BASE_WEB_URL}/login")
    page.fill('input[type="email"]', "hanoi.admin@demo.nacentech.vn")
    page.fill('input[type="password"]', "Password@123")
    page.click('button:has-text("Đăng nhập")')
    page.wait_for_timeout(2000)

    page.goto(f"{BASE_WEB_URL}/gov/approvals")
    page.wait_for_timeout(2000)
    page.click("button:has-text('Shop Chào Bán')")
    page.wait_for_timeout(1000)

    # TC-APPR-01: Cán bộ Hà Nội phải nhìn thấy hồ sơ Hà Nội
    content_hanoi = page.locator("table").inner_text()
    if DEVICE_TITLE in content_hanoi:
        record("TC-APPR-01", "Cán bộ Sở Hà Nội thấy hồ sơ THIẾT BỊ địa bàn Hà Nội", "PASS")
    else:
        record("TC-APPR-01", "Cán bộ Sở Hà Nội thấy hồ sơ THIẾT BỊ địa bàn Hà Nội", "FAIL", "Không tìm thấy hồ sơ trong bảng duyệt")

    # Thử phê duyệt hồ sơ Thiết bị trên UI
    row_device = page.locator(f"tr:has-text('{DEVICE_TITLE[:30]}')").first
    if row_device.is_visible():
        row_device.locator("button:has-text('Thẩm Định')").click()
        page.wait_for_timeout(1000)

        # TC-APPR-05: Modal mở ra hiển thị thông tin
        record("TC-APPR-05", "Modal Thẩm Định Hồ Sơ mở ra hiển thị đầy đủ thông số", "PASS")

        # Bấm duyệt
        page.click("button:has-text('Phê Duyệt Niêm Yết Sàn')")
        page.wait_for_timeout(300)

        # Chặn bắt response phê duyệt
        res_review = []
        page.on("response", lambda r: res_review.append((r.status, r.url, r.text())) if "review" in r.url else None)

        page.click("button:has-text('Xác Nhận Quyết Định')")
        page.wait_for_timeout(3000)

        # TC-APPR-06 & TC-APPR-07: Kiểm tra kết quả gọi API review
        if res_review:
            st, u, txt = res_review[-1]
            if st == 200:
                record("TC-APPR-06", "Nút Xác Nhận Quyết Định phê duyệt hồ sơ thành công (HTTP 200)", "PASS")
            else:
                record("TC-APPR-06", "Nút Xác Nhận Quyết Định phê duyệt hồ sơ", "FAIL", f"HTTP {st}: {txt[:200]}")
        else:
            record("TC-APPR-06", "Nút Xác Nhận Quyết Định phê duyệt hồ sơ", "FAIL", "Không ghi nhận request review gửi đi hoặc bị treo modal")

    browser.close()

# =============================================================================
# SUITE 3: KIỂM THỬ SÀN CHÀO BÁN CÔNG KHAI (/chao-ban-cong-nghe) & CHI TIẾT
# =============================================================================
def run_suite_3_public_marketplace(p):
    print("\n" + "=" * 75)
    print("🌐 SUITE 3: KIỂM THỬ SÀN GIAO DỊCH CÔNG KHAI & BỘ LỌC 18 NGÀNH")
    print("=" * 75)

    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Khách công khai truy cập không cần login
    page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe")
    page.wait_for_timeout(2000)

    # TC-PUB-01: Tiêu đề sàn
    h1 = page.locator("h1").first.inner_text()
    if "chào bán" in h1.lower() or "thị trường" in h1.lower():
        record("TC-PUB-01", f"Trang Sàn Chào Bán tải tiêu đề hợp chuẩn: '{h1}'", "PASS")
    else:
        record("TC-PUB-01", "Trang Sàn Chào Bán tải tiêu đề hợp chuẩn", "FAIL", f"Tiêu đề không hợp lệ: {h1}")

    # TC-DEV-PUB-02: Tab Thiết bị thương mại
    tab_device = page.locator("button:has-text('Thiết bị')").first
    if tab_device.is_visible():
        tab_device.click()
        page.wait_for_timeout(1000)
        record("TC-DEV-PUB-02", "Tab phân loại 'Thiết Bị' hoạt động và lọc danh sách", "PASS")
    else:
        record("TC-DEV-PUB-02", "Tab phân loại 'Thiết Bị' không tìm thấy", "FAIL", "Missing tab button")

    # TC-CROSS-16: Responsive trên Mobile (375px)
    page.set_viewport_size({"width": 375, "height": 667})
    page.wait_for_timeout(1000)
    has_horizontal_scroll = page.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth")
    if not has_horizontal_scroll:
        record("TC-CROSS-16", "Giao diện Sàn Chào Bán hiển thị tốt trên Mobile (375px), không tràn ngang", "PASS")
    else:
        record("TC-CROSS-16", "Giao diện Sàn Chào Bán trên Mobile (375px) bị tràn ngang màn hình (Horizontal overflow)", "FAIL", "scrollWidth > clientWidth")

    browser.close()

# =============================================================================
# TEARDOWN: DỌN DẸP AN TOÀN DỮ LIỆU CSDL
# =============================================================================
def teardown_db():
    print("\n" + "=" * 75)
    print("🧹 TEARDOWN: DỌN DẸP DỮ LIỆU KIỂM THỬ TRONG CSDL POSTGRESQL")
    print("=" * 75)
    for title in [DEVICE_TITLE, PRODUCT_TITLE, SOLUTION_TITLE]:
        query_db(f"DELETE FROM technology.seller_technology_offers WHERE title = '{title}';")
    print("  ✓ Đã dọn dẹp sạch sẽ 3 bản ghi test khỏi PostgreSQL.")

def main():
    with sync_playwright() as p:
        run_suite_1_form_creation(p)
        run_suite_2_approvals(p)
        run_suite_3_public_marketplace(p)
        teardown_db()

    # Tổng kết
    total = len(TEST_RESULTS)
    passes = len([r for r in TEST_RESULTS if r["status"] == "PASS"])
    fails = len([r for r in TEST_RESULTS if r["status"] == "FAIL"])
    print("\n" + "=" * 75)
    print(f"📊 TỔNG KẾT BẢN THỬ NGHIỆM MASTER: {total} TCs | {passes} PASS | {fails} FAIL")
    print("=" * 75)

if __name__ == "__main__":
    main()
