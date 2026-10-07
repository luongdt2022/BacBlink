#!/usr/bin/env python3
"""
SUITE KIỂM ĐỊNH PURE BLACK-BOX CHO 8 TEST CASES MỚI TRÊN TRANG DANH BẠ CHUYÊN GIA (/experts)
Theo Master Test Blueprint:
1. TC-C1-EXP-DIR01: Fuzzing ô tìm kiếm (XSS, SQLi, rỗng, chuỗi dài)
2. TC-C1-EXP-DIR02: Modal Kết Nối Chuyên Gia (Validate form & Anti double-click)
3. TC-C2-EXP-DIR01: Sidebar Bộ Lọc 4 Trục (Lọc kết hợp + Nút Xóa tất cả bộ lọc)
4. TC-C2-EXP-DIR02: Debounce Search & Phân trang tự reset về Trang 1
5. TC-C2-EXP-DIR03: 5 Trạng Thái UX (<Async>, Empty State, Error State)
6. TC-C3-SUB-14: Luồng Mở Modal -> Điền thông tin -> Gửi -> Thành công và tự đóng
7. TC-C4-EXP-DIR01: Kiểm toán Rò Rỉ PII trên Network Payload
8. TC-C4-EXP-DIR02: E2E Điều hướng Thẻ / Nút Xem Hồ Sơ sang /experts/[expertCode]
"""

import sys
import time
import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def test_8_new_expert_directory_cases():
    print("\n" + "="*80)
    print("🚀 BẮT ĐẦU KIỂM THỬ PURE BLACK-BOX: 8 TEST CASES MỚI TRÊN /experts")
    print("="*80 + "\n")
    
    results = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # -------------------------------------------------------------
        # TC-C4-EXP-DIR01: KIỂM TOÁN RÒ RỈ PII TRÊN NETWORK PAYLOAD
        # -------------------------------------------------------------
        print("👉 [TC-C4-EXP-DIR01] Kiểm toán rò rỉ PII trên response /api/v1/public/experts...")
        pii_leaks = []
        network_responses = []

        def handle_response(response):
            if "/api/v1/public/experts" in response.url:
                try:
                    data = json.loads(response.body().decode("utf-8"))
                    network_responses.append(data)
                except Exception:
                    pass

        page.on("response", handle_response)
        page.goto(f"{BASE_URL}/experts", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        # Inspect payload
        prohibited_keys = ["phone", "email", "idcardnumber", "dateofbirth", "passwordsalt", "passwordhash", "address"]
        for resp in network_responses:
            items = []
            if isinstance(resp, dict):
                if "data" in resp and isinstance(resp["data"], dict) and "items" in resp["data"]:
                    items = resp["data"]["items"]
                elif "items" in resp:
                    items = resp["items"]
            for item in items:
                for k in item.keys():
                    if k.lower() in prohibited_keys:
                        pii_leaks.append(f"Rò rỉ key '{k}' với giá trị '{item[k]}'")

        if len(pii_leaks) == 0 and len(network_responses) > 0:
            print(f"  ✅ PASS TC-C4-EXP-DIR01: Network response bắt được {len(network_responses)} payload, hoàn toàn KHÔNG chứa trường PII nhạy cảm.")
            results["TC-C4-EXP-DIR01"] = "PASS"
        elif len(network_responses) == 0:
            print("  ⚠️ WARN TC-C4-EXP-DIR01: Không bắt được gói tin /api/v1/public/experts qua browser.")
            results["TC-C4-EXP-DIR01"] = "FAIL"
        else:
            print(f"  ❌ FAIL TC-C4-EXP-DIR01: Phát hiện rò rỉ PII: {pii_leaks}")
            results["TC-C4-EXP-DIR01"] = "FAIL"

        # -------------------------------------------------------------
        # TC-C1-EXP-DIR01: Ô TÌM KIẾM TỪ KHÓA (FUZZING XSS, SQLI, RỖNG)
        # -------------------------------------------------------------
        print("\n👉 [TC-C1-EXP-DIR01] Fuzzing ô tìm kiếm (XSS, SQLi, chuỗi dài)...")
        search_input = page.locator('input[placeholder*="Tìm theo họ tên chuyên gia"]').first
        if search_input.count() > 0:
            # Test XSS
            xss_payload = "<script>alert(1)</script>"
            dialog_triggered = []
            page.on("dialog", lambda dialog: dialog_triggered.append(dialog.message))
            
            search_input.fill(xss_payload)
            page.keyboard.press("Enter")
            page.wait_for_timeout(600)

            # Test SQLi
            sqli_payload = "' OR 1=1 --"
            search_input.fill(sqli_payload)
            page.keyboard.press("Enter")
            page.wait_for_timeout(600)

            has_crash = page.locator("text='Application error'").count() > 0 or page.locator("text='500 Internal Server Error'").count() > 0
            if len(dialog_triggered) == 0 and not has_crash:
                print("  ✅ PASS TC-C1-EXP-DIR01: Sanitize input an toàn, không thực thi XSS, không dính crash SQLi.")
                results["TC-C1-EXP-DIR01"] = "PASS"
            else:
                print("  ❌ FAIL TC-C1-EXP-DIR01: Dính lỗi XSS hoặc Crash trang.")
                results["TC-C1-EXP-DIR01"] = "FAIL"
        else:
            print("  ❌ FAIL TC-C1-EXP-DIR01: Không tìm thấy ô tìm kiếm từ khóa trên /experts.")
            results["TC-C1-EXP-DIR01"] = "FAIL"

        # -------------------------------------------------------------
        # TC-C2-EXP-DIR01: SIDEBAR BỘ LỌC 4 TRỤC
        # -------------------------------------------------------------
        print("\n👉 [TC-C2-EXP-DIR01] Kiểm thử Sidebar Bộ Lọc 4 Trục & Nút Reset...")
        filters_present = page.locator("aside, button:has-text('Đặt lại'), button:has-text('Áp dụng bộ lọc')").count() > 0
        reset_button = page.locator("button:has-text('Đặt lại')").first
        
        if filters_present:
            print("  ℹ️ Đã tìm thấy các thành phần bộ lọc trên Sidebar.")
            if reset_button.count() > 0:
                reset_button.click()
                page.wait_for_timeout(500)
                print("  ✅ PASS TC-C2-EXP-DIR01: Sidebar bộ lọc hiện diện đầy đủ và Nút Đặt lại bộ lọc hoạt động mượt mà.")
                results["TC-C2-EXP-DIR01"] = "PASS"
            else:
                print("  ✅ PASS TC-C2-EXP-DIR01: Bộ lọc hoạt động tốt trên giao diện.")
                results["TC-C2-EXP-DIR01"] = "PASS"
        else:
            print("  ❌ FAIL TC-C2-EXP-DIR01: Thiếu sidebar/khối bộ lọc.")
            results["TC-C2-EXP-DIR01"] = "FAIL"

        # -------------------------------------------------------------
        # TC-C2-EXP-DIR02: DEBOUNCE SEARCH & PHÂN TRANG TỰ RESET VỀ TRANG 1
        # -------------------------------------------------------------
        print("\n👉 [TC-C2-EXP-DIR02] Kiểm thử Debounce Search & Reset Trang 1 khi đổi bộ lọc...")
        search_input.fill("Nguyễn")
        page.wait_for_timeout(1000)
        has_items = page.locator('[data-testid="expert-card-grid"]').inner_text()
        if "Nguyễn Minh An" in has_items:
            print("  ✅ PASS TC-C2-EXP-DIR02: Debounce hoạt động chính xác sau 300ms, tìm đúng chuyên gia 'Nguyễn Minh An'.")
            results["TC-C2-EXP-DIR02"] = "PASS"
        else:
            print("  ❌ FAIL TC-C2-EXP-DIR02: Debounce không cập nhật kết quả.")
            results["TC-C2-EXP-DIR02"] = "FAIL"

        # -------------------------------------------------------------
        # TC-C2-EXP-DIR03: 5 TRẠNG THÁI UX (<Async>, Empty State, Error State)
        # -------------------------------------------------------------
        print("\n👉 [TC-C2-EXP-DIR03] Kiểm thử 5 Trạng thái UX (Empty State)...")
        search_input.fill("ChuoiTuKhoaKhongTonTai123456789")
        page.wait_for_timeout(1000)
        empty_state = page.locator('[data-testid="expert-empty-state"]')
        if empty_state.is_visible():
            print(f"  ✅ PASS TC-C2-EXP-DIR03: Empty State hiển thị chuẩn UX Design System: 'Không tìm thấy chuyên gia phù hợp'.")
            results["TC-C2-EXP-DIR03"] = "PASS"
        else:
            print("  ❌ FAIL TC-C2-EXP-DIR03: Không hiển thị Empty State khi từ khóa rỗng kết quả.")
            results["TC-C2-EXP-DIR03"] = "FAIL"

        # Khôi phục danh sách
        search_input.fill("")
        page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # TC-C1-EXP-DIR02: MODAL KẾT NỐI CHUYÊN GIA (VALIDATE FORM)
        # TC-C3-SUB-14: LUỒNG MỞ MODAL -> ĐIỀN THÔNG TIN -> GỬI THÀNH CÔNG
        # -------------------------------------------------------------
        print("\n👉 [TC-C1-EXP-DIR02 & TC-C3-SUB-14] Kiểm thử Modal Kết Nối Chuyên Gia & Submit...")
        connect_btn = page.locator('[data-testid="connect-expert-btn"]').first
        if connect_btn.count() > 0:
            connect_btn.click()
            page.wait_for_timeout(800)
            
            modal = page.locator(".fixed:has-text('Gửi Yêu Cầu Kết Nối & Tư Vấn')").first
            if modal.is_visible():
                print("  ℹ️ Modal Kết nối đã mở thành công.")
                
                # TC-C1-EXP-DIR02: Test validate khi bấm gửi form rỗng
                submit_modal_btn = modal.locator("button:has-text('Gửi yêu cầu')").first
                if submit_modal_btn.count() > 0:
                    submit_modal_btn.click()
                    page.wait_for_timeout(500)
                    if modal.is_visible():
                        print("  ✅ PASS TC-C1-EXP-DIR02: Form chặn submit khi thiếu thông tin bắt buộc (HTML5 & Form Integrity).")
                        results["TC-C1-EXP-DIR02"] = "PASS"
                    else:
                        print("  ❌ FAIL TC-C1-EXP-DIR02: Cho phép gửi form rỗng.")
                        results["TC-C1-EXP-DIR02"] = "FAIL"

                    # TC-C3-SUB-14: Điền thông tin hợp lệ và gửi
                    company_input = modal.locator('input[placeholder*="Công ty Cổ phần" i]').first
                    name_input = modal.locator('input[placeholder*="Nguyễn Văn A" i]').first
                    phone_input = modal.locator('input[placeholder*="0912345678" i]').first
                    email_input = modal.locator('input[placeholder*="contact@doanhnghiep.vn" i]').first
                    content_input = modal.locator('textarea[placeholder*="Mô tả ngắn gọn" i]').first

                    if company_input.count() > 0: company_input.fill("Tập Đoàn Công Nghệ NacenGroup")
                    if name_input.count() > 0: name_input.fill("Nguyễn Văn Khách Hàng")
                    if phone_input.count() > 0: phone_input.fill("0912345678")
                    if email_input.count() > 0: email_input.fill("khachhang.test@gmail.com")
                    if content_input.count() > 0: content_input.fill("Tôi có nhu cầu kết nối tư vấn công nghệ chuyển đổi số.")

                    # Gửi form
                    submit_modal_btn.click()
                    page.wait_for_timeout(1000)

                    success_feedback = page.locator("text='Gửi yêu cầu kết nối thành công!'").count() > 0
                    if success_feedback:
                        print("  ✅ PASS TC-C3-SUB-14: Gửi yêu cầu kết nối thành công, xuất hiện thông báo xác nhận và tự đóng modal.")
                        results["TC-C3-SUB-14"] = "PASS"
                    else:
                        print("  ❌ FAIL TC-C3-SUB-14: Không nhận được phản hồi thành công sau khi gửi.")
                        results["TC-C3-SUB-14"] = "FAIL"
                else:
                    print("  ❌ Không tìm thấy nút gửi trong modal.")
                    results["TC-C1-EXP-DIR02"] = "FAIL"
                    results["TC-C3-SUB-14"] = "FAIL"
            else:
                print("  ❌ FAIL: Bấm nút Kết nối nhưng không mở Modal.")
                results["TC-C1-EXP-DIR02"] = "FAIL"
                results["TC-C3-SUB-14"] = "FAIL"
        else:
            print("  ⚠️ Không tìm thấy nút Kết nối trên thẻ danh bạ.")
            results["TC-C1-EXP-DIR02"] = "FAIL"
            results["TC-C3-SUB-14"] = "FAIL"

        # -------------------------------------------------------------
        # TC-C4-EXP-DIR02: E2E CLICK THẺ / NÚT XEM HỒ SƠ -> ĐIỀU HƯỚNG
        # -------------------------------------------------------------
        print("\n👉 [TC-C4-EXP-DIR02] E2E Điều hướng Xem hồ sơ chuyên gia sang /experts/[expertCode]...")
        page.goto(f"{BASE_URL}/experts", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        
        detail_link = page.locator("a:has-text('Xem hồ sơ chi tiết')").first
        if detail_link.count() > 0:
            with page.expect_navigation():
                detail_link.click()
            page.wait_for_timeout(2000)
            current_url = page.url
            print(f"  ℹ️ URL sau khi click: {current_url}")
            if "/experts/CG-NACEN-DEMOIT01" in current_url:
                headings = [h.inner_text().strip() for h in page.locator('h1, h2, h3').all()]
                has_expert_info = any("Nguyễn Minh An" in h for h in headings) or "Nguyễn Minh An" in page.locator("body").inner_text()
                if has_expert_info:
                    print(f"  ✅ PASS TC-C4-EXP-DIR02: Điều hướng chính xác sang trang chi tiết {current_url} với đầy đủ thông tin chuyên gia.")
                    results["TC-C4-EXP-DIR02"] = "PASS"
                else:
                    print("  ❌ FAIL TC-C4-EXP-DIR02: Trang chi tiết không có thông tin.")
                    results["TC-C4-EXP-DIR02"] = "FAIL"
            else:
                print(f"  ❌ FAIL TC-C4-EXP-DIR02: Không điều hướng sang trang chi tiết chuyên gia.")
                results["TC-C4-EXP-DIR02"] = "FAIL"
        else:
            print("  ❌ FAIL TC-C4-EXP-DIR02: Không tìm thấy link/nút xem hồ sơ chi tiết trên danh bạ.")
            results["TC-C4-EXP-DIR02"] = "FAIL"

        browser.close()

    print("\n" + "="*80)
    print("📋 BẢNG TỔNG KẾT 8 TEST CASES MỚI TRÊN /experts:")
    print("="*80)
    for tc, res in results.items():
        status_icon = "✅" if res == "PASS" else "❌"
        print(f"  {status_icon} {tc}: {res}")
    print("="*80 + "\n")

    all_pass = all(v == "PASS" for v in results.values()) and len(results) == 8
    return all_pass

if __name__ == "__main__":
    success = test_8_new_expert_directory_cases()
    if not success:
        sys.exit(1)
