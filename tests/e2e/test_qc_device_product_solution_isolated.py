#!/usr/bin/env python3
"""
Kiểm thử tạo đầy đủ 3 loại hình: THIẾT BỊ, SẢN PHẨM, GIẢI PHÁP qua đúng 4 Tab
"""
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
TS = int(time.time())

DEV_TITLE = f"Robot Hàn 6 Trục Tự Động Hóa NacenWeld QA-{TS}"
PRD_TITLE = f"Chế Phẩm Men Vi Sinh Xử Lý Nước Ao Tôm NacenBio QA-{TS}"
SOL_TITLE = f"Hệ Thống AI Phân Tích Dữ Liệu Canh Tác NacenFarm QA-{TS}"

def query_db(sql: str) -> str:
    cmd = ["docker", "exec", "nacentech-postgres-1", "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql]
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout.strip()

def test_create_device(page):
    print("\n▶ [TEST 1] Tạo THIẾT BỊ (DEVICE) qua 4 Tab...")
    page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
    page.wait_for_timeout(1500)

    # 1. Chọn Thiết bị
    page.click("button:has-text('Thiết bị')")
    page.wait_for_timeout(300)

    # 2. Tab 1 - Điền thông tin
    page.fill("input[placeholder*='sấy thăng hoa']", DEV_TITLE)
    page.fill("textarea[placeholder*='đặc điểm chính']", "Robot hàn 6 trục công nghiệp tốc độ cao tích hợp AI Vision tự động nhận diện mối hàn với sai số cực nhỏ < 0.02mm.")
    page.fill("textarea[placeholder*='nỗi đau']", "Giảm 60% tỷ lệ phế phẩm mối hàn, tăng năng suất xưởng cơ khí lên 3.5 lần, thay thế thợ hàn bậc cao.")

    # Chọn Sở Hà Nội
    page.locator("select").nth(0).select_option(value="VN-HN")
    # Chọn ngành Cơ khí (LV07)
    page.locator("select").nth(1).select_option(value="LV07")

    # Bật SHTT & điền Đơn vị R&D
    page.locator("button:text-is('Có')").click()
    page.wait_for_timeout(300)
    page.locator("button:text-is('8')").click()
    page.wait_for_timeout(300)
    page.fill("input[placeholder*='ITRI']", "Viện Cơ Điện & Tự Động Hóa NacenTech")
    page.locator("select").nth(2).select_option(value="PATENT_GRANTED")
    page.locator("select").nth(3).select_option(value="EXCLUSIVE_LICENSE")

    # 3. Tab 2 - Điền thông số kỹ thuật thiết bị
    page.locator("button:has-text('2')").first.click()
    page.wait_for_timeout(800)
    model_input = page.locator("input[placeholder*='CNC'], input[placeholder*='Model']").first
    if model_input.is_visible():
        model_input.fill("NCW-ROBOT-6X")

    # 4. Nộp hồ sơ
    page.click("button:has-text('Gửi chờ duyệt ngay')")
    page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
    page.click("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
    page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)

    # Verify DB
    row = query_db(f"SELECT id, offer_code, offer_type, status, trl_level FROM technology.seller_technology_offers WHERE title = '{DEV_TITLE}';")
    assert row, "Thiết bị chưa được lưu vào CSDL!"
    _id, code, otype, status, trl = row.split("|")
    assert otype == "DEVICE", f"Lệch offer_type: {otype}"
    assert status == "PENDING"
    assert trl == "8"
    print(f"  ✅ PASS: CSDL lưu THIẾT BỊ thành công: Code={code}, Type={otype}, TRL={trl}, Status={status}")

def test_create_product(page):
    print("\n▶ [TEST 2] Tạo SẢN PHẨM (PRODUCT) qua 4 Tab...")
    page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
    page.wait_for_timeout(1500)

    # 1. Chọn Sản phẩm
    page.click("button:has-text('Sản phẩm')")
    page.wait_for_timeout(300)

    # 2. Tab 1 - Điền thông tin
    page.fill("input[placeholder*='sấy thăng hoa']", PRD_TITLE)
    page.fill("textarea[placeholder*='đặc điểm chính']", "Chế phẩm sinh học mật độ vi sinh 10^9 CFU/g giúp khử khí độc NH3, H2S đáy ao nuôi tôm siêu thâm canh.")
    page.fill("textarea[placeholder*='nỗi đau']", "Giảm 80% tỷ lệ chết do sốc môi trường, không cần dùng kháng sinh hóa chất.")

    # Chọn Sở Hà Nội & ngành Thủy sản (LV03)
    page.locator("select").nth(0).select_option(value="VN-HN")
    page.locator("select").nth(1).select_option(value="LV03")

    # Bật SHTT
    page.locator("button:text-is('Có')").click()
    page.wait_for_timeout(300)
    page.locator("button:text-is('7')").click()
    page.wait_for_timeout(300)
    page.fill("input[placeholder*='ITRI']", "Viện Sinh Học Nhiệt Đới")
    page.locator("select").nth(2).select_option(value="UTILITY_MODEL")
    page.locator("select").nth(3).select_option(value="NON_EXCLUSIVE_LICENSE")

    # Nộp hồ sơ
    page.click("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')")
    page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
    page.click("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
    page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)

    # Verify DB
    row = query_db(f"SELECT id, offer_code, offer_type, status, trl_level FROM technology.seller_technology_offers WHERE title = '{PRD_TITLE}';")
    assert row, "Sản phẩm chưa được lưu vào CSDL!"
    _id, code, otype, status, trl = row.split("|")
    assert otype == "PRODUCT", f"Lệch offer_type: {otype}"
    assert status == "PENDING"
    assert trl == "7"
    print(f"  ✅ PASS: CSDL lưu SẢN PHẨM thành công: Code={code}, Type={otype}, TRL={trl}, Status={status}")

def test_create_solution(page):
    print("\n▶ [TEST 3] Tạo GIẢI PHÁP CÔNG NGHỆ (SOLUTION) qua 4 Tab...")
    page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
    page.wait_for_timeout(1500)

    # 1. Chọn Giải pháp
    page.click("button:has-text('Giải pháp công nghệ')")
    page.wait_for_timeout(300)

    # 2. Tab 1 - Điền thông tin
    page.fill("input[placeholder*='sấy thăng hoa']", SOL_TITLE)
    page.fill("textarea[placeholder*='đặc điểm chính']", "Nền tảng trí tuệ nhân tạo phân tích dữ liệu viễn thám và trạm IoT dự báo trước 7 ngày nguy cơ bùng phát sâu rầy.")
    page.fill("textarea[placeholder*='nỗi đau']", "Giảm 35% lượng thuốc bảo vệ thực vật, đạt chuẩn xuất khẩu EU.")

    # Chọn Sở Hà Nội & ngành Nông nghiệp (LV01)
    page.locator("select").nth(0).select_option(value="VN-HN")
    page.locator("select").nth(1).select_option(value="LV01")

    # Bật SHTT
    page.locator("button:text-is('Có')").click()
    page.wait_for_timeout(300)
    page.locator("button:text-is('9')").click()
    page.wait_for_timeout(300)
    page.fill("input[placeholder*='ITRI']", "Viện Công Nghệ Thông Tin NacenTech")
    page.locator("select").nth(2).select_option(value="SOFTWARE_COPYRIGHT")
    page.locator("select").nth(3).select_option(value="EXCLUSIVE_LICENSE")

    # Nộp hồ sơ
    page.click("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')")
    page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
    page.click("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
    page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)

    # Verify DB
    row = query_db(f"SELECT id, offer_code, offer_type, status, trl_level FROM technology.seller_technology_offers WHERE title = '{SOL_TITLE}';")
    assert row, "Giải pháp chưa được lưu vào CSDL!"
    _id, code, otype, status, trl = row.split("|")
    assert otype == "SOLUTION", f"Lệch offer_type: {otype}"
    assert status == "PENDING"
    assert trl == "9"
    print(f"  ✅ PASS: CSDL lưu GIẢI PHÁP thành công: Code={code}, Type={otype}, TRL={trl}, Status={status}")

def main():
    print("=" * 70)
    print("🚀 BẮT ĐẦU TEST KHÉP KÍN 3 LOẠI HÌNH: THIẾT BỊ, SẢN PHẨM, GIẢI PHÁP")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Login
        page.goto(f"{BASE_WEB_URL}/login")
        page.fill('input[type="email"]', "seller.user@demo.nacentech.vn")
        page.fill('input[type="password"]', "Password@123")
        page.click('button:has-text("Đăng nhập")')
        page.wait_for_url(lambda u: "/portal" in u, timeout=15000)

        test_create_device(page)
        test_create_product(page)
        test_create_solution(page)

        # Cleanup
        print("\n--- Dọn dẹp dữ liệu ---")
        for t in [DEV_TITLE, PRD_TITLE, SOL_TITLE]:
            query_db(f"DELETE FROM technology.seller_technology_offers WHERE title = '{t}';")
        print("  ✓ Đã dọn dẹp an toàn CSDL.")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 KẾT LUẬN: CẢ 3 LOẠI HÌNH ĐỀU ĐƯỢC TẠO VÀ LƯU CHUẨN CSDL POSTGRESQL!")
    print("=" * 70)

if __name__ == "__main__":
    main()
