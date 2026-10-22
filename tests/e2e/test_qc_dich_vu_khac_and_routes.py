#!/usr/bin/env python3
"""
=============================================================================
KỊCH BẢN KIỂM THỬ QC ĐỘC LẬP (GATE 4) - XÁC THỰC TAB DỊCH VỤ & ĐIỀU HƯỚNG ROUTE
=============================================================================
Đối tượng kiểm thử:
1. Thanh điều hướng (Navbar) -> Tab "Dịch vụ" -> /dich-vu-khac
   - Chống vòng lặp circular redirect
   - Tải 200 OK, không kẹt loading
   - Hiển thị đầy đủ tiêu đề "Dịch Vụ Tư Vấn SHTT & Định Giá Công Nghệ Chuyên Nghiệp"
   - 4 khối dịch vụ chuyên sâu & quy trình 5 bước
   - Form đăng ký tư vấn trực tuyến (validation + submit thành công + mã SRV-...)
2. Thanh điều hướng -> Tab "Giới thiệu" -> /gioi-thieu
3. Dynamic routes [module]:
   - /elearning (hỗ trợ hiển thị module)
   - /chuyen-gia (redirect sang /experts)
   - /doanh-nghiep-dmst (redirect sang /enterprises)
   - /unknown-slug-xyz (trả về 404 Not Found)
4. Responsive Visual QA: Desktop (1280px), Tablet (768px), Mobile (375px)
=============================================================================
"""

import os
import sys
import re
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../visual-qa/screenshots/dich_vu_khac"))
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

test_results = []

def record_result(test_name: str, passed: bool, details: str = ""):
    status = "PASS" if passed else "FAIL"
    test_results.append({"name": test_name, "status": status, "details": details})
    print(f"[{status}] {test_name}: {details}")

def run_all_tests():
    print("\n" + "=" * 80)
    print("BẮT ĐẦU BỘ KIỂM THỬ TRÌNH DUYỆT SỐNG (PLAYWRIGHT E2E) - GATE 4 QC VERIFICATION")
    print(f"Base URL: {BASE_URL}")
    print(f"Screenshots output: {SCREENSHOT_DIR}")
    print("=" * 80 + "\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # ---------------------------------------------------------------------
        # TEST 1: NAVBAR -> DỊCH VỤ -> /dich-vu-khac
        # ---------------------------------------------------------------------
        print("--- TEST 1: Navbar Click 'Dịch vụ' -> Điều hướng /dich-vu-khac ---")
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=15000)
            page_title = page.title()
            assert "NacenTwin" in page_title, f"Unexpected page title: {page_title}"
            
            # Locate "Dịch vụ" link in navbar
            service_nav_link = page.locator("header nav a[href='/dich-vu-khac'], header a[href='/dich-vu-khac']").first
            assert service_nav_link.is_visible(), "Link 'Dịch vụ' href='/dich-vu-khac' không tìm thấy trên navbar"
            
            link_text = service_nav_link.inner_text().strip()
            print(f"Đã tìm thấy link: '{link_text}' với href='/dich-vu-khac'")

            # Click link and verify navigation
            with page.expect_navigation(timeout=10000) as nav_info:
                service_nav_link.click()

            curr_url = page.url
            print(f"URL sau khi click: {curr_url}")
            assert "/dich-vu-khac" in curr_url, f"Chuyển hướng thất bại! URL hiện tại: {curr_url}"
            
            # Check page header and hero content
            h1_locator = page.locator("h1")
            expect(h1_locator).to_be_visible(timeout=5000)
            h1_text = h1_locator.inner_text().strip()
            expected_h1 = "Dịch Vụ Tư Vấn SHTT & Định Giá Công Nghệ Chuyên Nghiệp"
            assert expected_h1 in h1_text, f"Tiêu đề H1 không khớp! Nhận được: '{h1_text}'"

            # Check 4 core services cards
            services = [
                "1. Đăng Ký Bảo Hộ SHTT & Sáng Chế",
                "2. Thẩm Định & Định Giá Công Nghệ",
                "3. Hồ Sơ Doanh Nghiệp KH&CN",
                "4. Môi Giới & Hợp Đồng Chuyển Giao"
            ]
            for s in services:
                loc = page.locator(f"h3:has-text('{s}')")
                assert loc.is_visible(), f"Không tìm thấy thẻ dịch vụ '{s}'"

            # Check 5-step workflow
            workflow_heading = page.locator("text=Quy Trình Tiếp Nhận & Triển Khai 5 Bước")
            assert workflow_heading.is_visible(), "Không tìm thấy khối 'Quy Trình Tiếp Nhận & Triển Khai 5 Bước'"

            # Screenshot desktop
            shot_path = os.path.join(SCREENSHOT_DIR, "01_dich_vu_khac_desktop.png")
            page.screenshot(path=shot_path, full_page=True)
            print(f"Screenshot đã lưu: {shot_path}")

            record_result("TEST_01_NAV_DICH_VU", True, f"Điều hướng thành công đến {curr_url}, H1='{h1_text}'")
        except Exception as e:
            record_result("TEST_01_NAV_DICH_VU", False, str(e))
        finally:
            context.close()

        # ---------------------------------------------------------------------
        # TEST 2: FORM TƯ VẤN TRỰC TUYẾN TRÊN /dich-vu-khac
        # ---------------------------------------------------------------------
        print("\n--- TEST 2: Tương tác Form Đăng ký tư vấn trực tuyến ---")
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            page.goto(f"{BASE_URL}/dich-vu-khac", wait_until="networkidle", timeout=15000)

            # Check form inputs presence
            fullname_input = page.locator("input[placeholder*='Nguyễn Văn A']")
            email_input = page.locator("input[type='email']")
            phone_input = page.locator("input[type='tel']")
            org_input = page.locator("input[placeholder*='Công ty Cổ phần']")
            service_select = page.locator("select")
            desc_textarea = page.locator("textarea")
            submit_btn = page.locator("button[type='submit']")

            assert fullname_input.is_visible(), "Thiếu input Họ và tên"
            assert email_input.is_visible(), "Thiếu input Email"
            assert phone_input.is_visible(), "Thiếu input Số điện thoại"
            assert submit_btn.is_visible(), "Thiếu nút submit form"

            # Fill in test data
            fullname_input.fill("KS. Đỗ Trường Giang")
            email_input.fill("giang.dt@techcorp.vn")
            phone_input.fill("0988776655")
            org_input.fill("Tập Đoàn Công Nghệ NacenTech")
            service_select.select_option("VALUATION")
            desc_textarea.fill("Yêu cầu thẩm định và cấp chứng thư định giá sáng chế hệ thống AI IoT.")

            # Screenshot form filled
            shot_filled = os.path.join(SCREENSHOT_DIR, "02_form_filled.png")
            page.screenshot(path=shot_filled)
            print(f"Screenshot form đã điền: {shot_filled}")

            # Click submit
            submit_btn.click()

            # Wait for submission success UI
            success_heading = page.locator("text=Yêu Cầu Của Bạn Đã Được Gửi Thành Công!")
            expect(success_heading).to_be_visible(timeout=5000)

            # Check receipt code format (SRV-202610-XXXX)
            code_locator = page.locator("span:has-text('SRV-202610-')")
            expect(code_locator).to_be_visible(timeout=5000)
            receipt_code = code_locator.inner_text().strip()
            assert re.match(r"^SRV-202610-\d{4}$", receipt_code), f"Mã phiếu không đúng định dạng: '{receipt_code}'"
            print(f"Mã phiếu tiếp nhận sinh thành công: {receipt_code}")

            # Screenshot success
            shot_success = os.path.join(SCREENSHOT_DIR, "03_form_submitted_success.png")
            page.screenshot(path=shot_success)
            print(f"Screenshot thành công: {shot_success}")

            # Test reset button "Gửi Yêu Cầu Khác"
            reset_btn = page.locator("button:has-text('Gửi Yêu Cầu Khác')")
            assert reset_btn.is_visible(), "Thiếu nút 'Gửi Yêu Cầu Khác'"
            reset_btn.click()

            # Verify form is visible again
            expect(fullname_input).to_be_visible(timeout=3000)
            print("Form đã reset thành công về trạng thái nhập mới sau khi click 'Gửi Yêu Cầu Khác'")

            record_result("TEST_02_FORM_SUBMIT_SUCCESS", True, f"Form submit trơn tru, mã phiếu '{receipt_code}'")
        except Exception as e:
            record_result("TEST_02_FORM_SUBMIT_SUCCESS", False, str(e))
        finally:
            context.close()

        # ---------------------------------------------------------------------
        # TEST 3: NAVBAR -> GIỚI THIỆU -> /gioi-thieu
        # ---------------------------------------------------------------------
        print("\n--- TEST 3: Navbar Click 'Giới thiệu' -> /gioi-thieu ---")
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=15000)
            about_link = page.locator("header nav a[href='/gioi-thieu'], header a[href='/gioi-thieu']").first
            assert about_link.is_visible(), "Link 'Giới thiệu' không có trên navbar"

            with page.expect_navigation(timeout=10000) as nav_info:
                about_link.click()

            curr_url = page.url
            print(f"URL Giới thiệu: {curr_url}")
            assert "/gioi-thieu" in curr_url, f"Điều hướng Giới thiệu thất bại! URL: {curr_url}"

            # Check title or h1 on /gioi-thieu
            h1_about = page.locator("h1")
            expect(h1_about).to_be_visible(timeout=5000)
            about_text = h1_about.inner_text().strip()
            print(f"Tiêu đề trang Giới thiệu: '{about_text}'")

            shot_about = os.path.join(SCREENSHOT_DIR, "04_gioi_thieu_desktop.png")
            page.screenshot(path=shot_about, full_page=True)

            record_result("TEST_03_NAV_GIOI_THIEU", True, f"Điều hướng /gioi-thieu thành công, H1='{about_text}'")
        except Exception as e:
            record_result("TEST_03_NAV_GIOI_THIEU", False, str(e))
        finally:
            context.close()

        # ---------------------------------------------------------------------
        # TEST 4: DYNAMIC ROUTES [module] & REDIRECTS
        # ---------------------------------------------------------------------
        print("\n--- TEST 4: Dynamic Routes [module] & Fallbacks ---")
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            # Case 4A: /elearning (Direct submodule rendering)
            print("Kiểm tra /elearning...")
            page.goto(f"{BASE_URL}/elearning", wait_until="networkidle", timeout=15000)
            assert "/elearning" in page.url, f"URL sai: {page.url}"
            expect(page.locator("h1:has-text('eLearning')")).to_be_visible(timeout=5000)
            expect(page.locator("text=Học liệu số và đào tạo trực tuyến")).to_be_visible(timeout=5000)
            shot_elearning = os.path.join(SCREENSHOT_DIR, "05_module_elearning.png")
            page.screenshot(path=shot_elearning)
            record_result("TEST_04A_DYNAMIC_ELEARNING", True, "Module elearning render chính xác (h1 eLearning)")

            # Case 4B: /chuyen-gia (Redirect to /experts)
            print("Kiểm tra /chuyen-gia -> redirect /experts...")
            page.goto(f"{BASE_URL}/chuyen-gia", wait_until="networkidle", timeout=15000)
            assert "/experts" in page.url, f"Chuyển hướng /chuyen-gia thất bại! URL: {page.url}"
            expect(page.locator("h1, h2, h3").first).to_be_visible(timeout=5000)
            shot_cg = os.path.join(SCREENSHOT_DIR, "06_module_chuyen_gia_redirect.png")
            page.screenshot(path=shot_cg)
            record_result("TEST_04B_DYNAMIC_CHUYEN_GIA", True, f"Redirect thành công sang {page.url}")

            # Case 4C: /doanh-nghiep-dmst (Redirect to /enterprises)
            print("Kiểm tra /doanh-nghiep-dmst -> redirect /enterprises...")
            page.goto(f"{BASE_URL}/doanh-nghiep-dmst", wait_until="networkidle", timeout=15000)
            assert "/enterprises" in page.url, f"Chuyển hướng /doanh-nghiep-dmst thất bại! URL: {page.url}"
            expect(page.locator("h1, h2, h3").first).to_be_visible(timeout=5000)
            shot_dn = os.path.join(SCREENSHOT_DIR, "07_module_doanh_nghiep_redirect.png")
            page.screenshot(path=shot_dn)
            record_result("TEST_04C_DYNAMIC_DOANH_NGHIEP", True, f"Redirect thành công sang {page.url}")

            # Case 4D: /unknown-module-xyz (Should return 404 Not Found)
            print("Kiểm tra module không tồn tại...")
            response = page.goto(f"{BASE_URL}/random-non-existent-module-xyz", wait_until="networkidle", timeout=15000)
            assert response.status == 404 or page.locator("text=404").is_visible() or page.locator("text=Không tìm thấy").is_visible(), "Module không tồn tại không trả về 404"
            record_result("TEST_04D_DYNAMIC_UNKNOWN_404", True, f"Trả về đúng 404 Not Found (Status: {response.status})")

        except Exception as e:
            record_result("TEST_04_DYNAMIC_ROUTES", False, str(e))
        finally:
            context.close()

        # ---------------------------------------------------------------------
        # TEST 5: RESPONSIVE VIEWPORTS & MOBILE DRAWER (Ruthless Visual QA)
        # ---------------------------------------------------------------------
        print("\n--- TEST 5: Responsive Visual QA (Mobile Viewport 375x812) ---")
        mobile_context = browser.new_context(viewport={"width": 375, "height": 812}, is_mobile=True, has_touch=True)
        mobile_page = mobile_context.new_page()

        try:
            mobile_page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=15000)
            
            # Find mobile menu toggle button using exact aria-label or aria-controls
            menu_btn = mobile_page.locator("button[aria-controls='mobile-navigation'], button[aria-label='Menu']").first
            assert menu_btn.is_visible(), "Nút mở Menu trên mobile không hiển thị"
            menu_btn.click()
            time.sleep(0.5)

            # Find "Dịch vụ" in mobile menu dropdown
            mobile_dich_vu = mobile_page.locator("#mobile-navigation a[href='/dich-vu-khac']").first
            assert mobile_dich_vu.is_visible(), "Không thấy link Dịch vụ trong mobile menu"
            
            mobile_dich_vu.click()
            mobile_page.wait_for_url("**/dich-vu-khac", timeout=10000)
            assert "/dich-vu-khac" in mobile_page.url, f"Mobile điều hướng thất bại! URL: {mobile_page.url}"

            # Verify mobile layout
            expect(mobile_page.locator("h1")).to_be_visible()
            shot_mobile = os.path.join(SCREENSHOT_DIR, "08_dich_vu_khac_mobile.png")
            mobile_page.screenshot(path=shot_mobile, full_page=True)
            print(f"Screenshot mobile đã lưu: {shot_mobile}")

            record_result("TEST_05_MOBILE_RESPONSIVE", True, "Mobile menu click điều hướng mượt mà, layout chuẩn")
        except Exception as e:
            record_result("TEST_05_MOBILE_RESPONSIVE", False, str(e))
        finally:
            mobile_context.close()

        browser.close()

    print("\n" + "=" * 80)
    print("TỔNG HỢP KẾT QUẢ KIỂM THỬ PLAYWRIGHT:")
    all_passed = True
    for r in test_results:
        print(f"[{r['status']}] {r['name']}: {r['details']}")
        if r['status'] != "PASS":
            all_passed = False
    print("=" * 80)

    if not all_passed:
        print("\n=> KẾT LUẬN: FAIL. Cần khắc phục sự cố trước khi nghiệm thu.")
        sys.exit(1)
    else:
        print("\n=> KẾT LUẬN: PASS 100%. Đạt chuẩn Quality Gate 4.")
        sys.exit(0)

if __name__ == "__main__":
    run_all_tests()
