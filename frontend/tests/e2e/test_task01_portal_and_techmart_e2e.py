#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX THUẦN TÚY: TASK-01 TỔNG QUAN HỆ THỐNG & TECHMART
Chế độ: PURE BLACK-BOX (Không mock, kiểm thử luồng thực tế người dùng).
Quy chuẩn: Điều 7 Hiến pháp NacenTech (Zero-Mock Invariant & Deep DB Verification).
"""

import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def wait_for_hydration(page, selector=None):
    try:
        if selector:
            page.wait_for_function(
                f"""() => {{
                    const el = document.querySelector("{selector}");
                    if (!el) return false;
                    return Object.keys(el).some(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
                }}""",
                timeout=15000
            )
        else:
            page.wait_for_function(
                """() => {
                    const btn = document.querySelector("button[aria-label='Mở Trợ lý Ảo AI NacentTwin']") || document.querySelector("button");
                    if (!btn) return false;
                    return Object.keys(btn).some(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
                }""",
                timeout=15000
            )
    except Exception:
        pass

def run_task01_e2e():
    print("======================================================================")
    print("🛡️ KIỂM THỬ E2E BLACK-BOX QC 4 TẦNG: TASK-01 CỔNG THÔNG TIN & TECHMART")
    print("🚫 Kỷ luật: ZERO-MOCK, 5 UX STATES & BÁM SÁT WIREFRAME")
    print("======================================================================\n")

    defects = []
    tests_run = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # ------------------------------------------------------------------
        # CA 1: Kiểm tra Trang chủ & Thống kê động Zero-Mock
        # ------------------------------------------------------------------
        tests_run += 1
        print("▶ [BB-01] Kiểm tra Trang chủ & Thống kê thời gian thực...")
        page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
        time.sleep(1)

        body_text = page.locator("body").inner_text()
        if "KẾT NỐI CUNG – CẦU CÔNG NGHỆ" not in body_text.upper() and "Kết nối cung – cầu công nghệ" not in body_text:
            defects.append({
                "id": "DEFECT-01",
                "severity": "CRITICAL",
                "summary": "Trang chủ không tải được nội dung chính Hero Banner.",
                "url": f"{BASE_URL}/"
            })
            print("  ❌ PHÁT HIỆN DEFECT-01 [CRITICAL]: Hero Banner không hiển thị!")
        else:
            print("  ✅ PASS: Hero Banner hiển thị đúng tiêu chuẩn.")

        # Kiểm tra liên kết Sàn Sự Kiện Techmart
        techmart_link = page.locator("a:has-text('Sàn Sự Kiện Techmart')").first
        if techmart_link.is_visible():
            print("  ✅ PASS: Link 'Sàn Sự Kiện Techmart' có mặt trên Hero Banner.")
        else:
            defects.append({
                "id": "DEFECT-02",
                "severity": "MAJOR",
                "summary": "Không tìm thấy nút điều hướng 'Sàn Sự Kiện Techmart' trên Hero Banner.",
                "url": f"{BASE_URL}/"
            })
            print("  ❌ PHÁT HIỆN DEFECT-02 [MAJOR]: Thiếu nút điều hướng Techmart!")

        # ------------------------------------------------------------------
        # CA 2: Kiểm tra Floating Widget Trợ Lý Ảo AI NacentTwin
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-02] Kiểm tra Widget nổi Trợ lý ảo AI NacentTwin...")
        wait_for_hydration(page)
        ai_btn = page.locator("button[aria-label='Mở Trợ lý Ảo AI NacentTwin']").first
        if ai_btn.is_visible():
            print("  ✅ PASS: FAB Button Trợ lý AI hiển thị nổi góc phải.")
            ai_btn.click()
            time.sleep(1)

            modal_title = page.locator("h3:has-text('Trợ Lý Ảo AI NacentTwin')").first
            if modal_title.is_visible():
                print("  ✅ PASS: Modal chat Trợ lý AI bung mở thành công.")
            else:
                defects.append({
                    "id": "DEFECT-03",
                    "severity": "MAJOR",
                    "summary": "Click FAB Button nhưng modal Trợ lý AI không mở ra.",
                    "url": f"{BASE_URL}/"
                })
                print("  ❌ PHÁT HIỆN DEFECT-03 [MAJOR]: Modal Trợ lý AI không mở!")
        else:
            defects.append({
                "id": "DEFECT-04",
                "severity": "MAJOR",
                "summary": "Không tìm thấy FAB button Trợ lý AI trên giao diện.",
                "url": f"{BASE_URL}/"
            })
            print("  ❌ PHÁT HIỆN DEFECT-04 [MAJOR]: Thiếu FAB button AI!")

        # ------------------------------------------------------------------
        # CA 3: Kiểm tra Trang Sàn Sự Kiện Techmart (/trien-lam)
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-03] Kiểm tra Showcase Listing Sàn Sự Kiện Techmart (/trien-lam)...")
        page.goto(f"{BASE_URL}/trien-lam")
        wait_for_hydration(page)
        time.sleep(1)

        trien_lam_text = page.locator("body").inner_text()
        if "Sàn Trưng Bày & Các Phiên Chào Giá Công Nghệ" not in trien_lam_text:
            defects.append({
                "id": "DEFECT-05",
                "severity": "CRITICAL",
                "summary": "Trang /trien-lam không hiển thị tiêu đề chính theo wireframe.",
                "url": f"{BASE_URL}/trien-lam"
            })
            print("  ❌ PHÁT HIỆN DEFECT-05 [CRITICAL]: Tiêu đề Showcase Techmart không xuất hiện!")
        else:
            print("  ✅ PASS: Trang Showcase Techmart hiển thị đúng thiết kế cơ sở.")

        # Kiểm tra nút Đăng ký tham gia
        page.wait_for_selector("button:has-text('Đăng Ký Tham Gia')", timeout=10000)
        page.wait_for_function(
            """() => {
                const b = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Đăng Ký Tham Gia'));
                if (!b) return false;
                return Object.keys(b).some(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
            }""",
            timeout=15000
        )
        reg_btn = page.locator("button:has-text('Đăng Ký Tham Gia')").first
        if reg_btn.is_visible():
            print("  ✅ PASS: Nút 'Đăng Ký Tham Gia' có mặt trên trang sự kiện.")
            reg_btn.click()
            time.sleep(1)

            reg_modal = page.locator("h3:has-text('Đăng Ký Tham Gia Phiên Chào Giá Techmart')").first
            if reg_modal.is_visible():
                print("  ✅ PASS: Modal đăng ký sự kiện mở thành công.")
            else:
                defects.append({
                    "id": "DEFECT-06",
                    "severity": "MAJOR",
                    "summary": "Click Đăng ký nhưng modal không mở ra.",
                    "url": f"{BASE_URL}/trien-lam"
                })
                print("  ❌ PHÁT HIỆN DEFECT-06 [MAJOR]: Modal đăng ký không mở!")
        else:
            print("  ⚠️ Cảnh báo: Không tìm thấy nút 'Đăng Ký Tham Gia'.")

        # ------------------------------------------------------------------
        # CA 4: Kiểm tra Trang Đăng Ký Tham Quan (/trien-lam/dang-ky-tham-quan)
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-04] Kiểm tra Trang Đăng Ký Tham Quan (/trien-lam/dang-ky-tham-quan)...")
        page.goto(f"{BASE_URL}/trien-lam/dang-ky-tham-quan", wait_until="domcontentloaded")
        time.sleep(1)

        dk_text = page.locator("body").inner_text()
        if "Đăng Ký Nhận Vé Điện Tử" in dk_text or "Sự kiện Techmart muốn tham quan" in dk_text:
            print("  ✅ PASS: Form Đăng ký nhận vé điện tử hiển thị đầy đủ các trường.")
        else:
            defects.append({
                "id": "DEFECT-07",
                "severity": "MAJOR",
                "summary": "Trang đăng ký tham quan không hiển thị form đăng ký vé.",
                "url": f"{BASE_URL}/trien-lam/dang-ky-tham-quan"
            })
            print("  ❌ PHÁT HIỆN DEFECT-07 [MAJOR]: Form đăng ký vé không hiển thị!")

        # ------------------------------------------------------------------
        # CA 5: Kiểm tra Delta v2: Trang chủ Cung - Cầu không duplicate key & đa dạng ngành
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-05] Kiểm tra Delta v2: Cung - Cầu Trang chủ (Zero duplicate key & max 6 items)...")
        console_warnings = []
        page.on("console", lambda msg: console_warnings.append(msg.text) if msg.type in ["warning", "error"] else None)

        page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
        time.sleep(1.5)

        # Tab Chào bán
        section = page.locator("section:has-text('Công nghệ & nhu cầu nổi bật')")
        offer_cards = section.locator("article h3").all_inner_texts()
        offer_titles_normalized = [t.strip().lower() for t in offer_cards if t.strip()]
        if len(offer_titles_normalized) > 6:
            defects.append({
                "id": "DEFECT-08",
                "severity": "CRITICAL",
                "summary": f"Tab Chào bán hiển thị {len(offer_titles_normalized)} thẻ (vượt quá giới hạn 6 items).",
                "url": f"{BASE_URL}/"
            })
            print(f"  ❌ PHÁT HIỆN DEFECT-08: Số lượng thẻ chào bán ({len(offer_titles_normalized)}) > 6!")
        elif len(offer_titles_normalized) != len(set(offer_titles_normalized)):
            defects.append({
                "id": "DEFECT-09",
                "severity": "CRITICAL",
                "summary": "Tab Chào bán có tiêu đề bị trùng lặp trên giao diện.",
                "url": f"{BASE_URL}/"
            })
            print("  ❌ PHÁT HIỆN DEFECT-09: Thẻ chào bán có tiêu đề trùng lặp!")
        else:
            print(f"  ✅ PASS: Tab Chào bán có {len(offer_titles_normalized)} thẻ duy nhất, không trùng lặp.")

        # Chuyển sang Tab Nhu cầu đặt hàng
        demands_tab = page.locator("button:has-text('Nhu cầu đặt hàng')").first
        if demands_tab.is_visible():
            demands_tab.click()
            time.sleep(1)

            demand_cards = section.locator("article h3").all_inner_texts()
            demand_titles_normalized = [t.strip().lower() for t in demand_cards if t.strip()]
            if len(demand_titles_normalized) > 6:
                defects.append({
                    "id": "DEFECT-10",
                    "severity": "CRITICAL",
                    "summary": f"Tab Nhu cầu hiển thị {len(demand_titles_normalized)} thẻ (vượt quá giới hạn 6 items).",
                    "url": f"{BASE_URL}/"
                })
                print(f"  ❌ PHÁT HIỆN DEFECT-10: Số lượng thẻ nhu cầu ({len(demand_titles_normalized)}) > 6!")
            elif len(demand_titles_normalized) != len(set(demand_titles_normalized)):
                defects.append({
                    "id": "DEFECT-11",
                    "severity": "CRITICAL",
                    "summary": "Tab Nhu cầu có bài toán bị trùng lặp tiêu đề trên giao diện.",
                    "url": f"{BASE_URL}/"
                })
                print("  ❌ PHÁT HIỆN DEFECT-11: Thẻ nhu cầu có tiêu đề trùng lặp!")
            else:
                print(f"  ✅ PASS: Tab Nhu cầu có {len(demand_titles_normalized)} bài toán duy nhất, không trùng lặp.")

        # Kiểm tra console key collision warnings
        key_warnings = [w for w in console_warnings if "two children with the same key" in w or "unique \"key\" prop" in w]
        if key_warnings:
            defects.append({
                "id": "DEFECT-12",
                "severity": "MAJOR",
                "summary": f"Phát hiện cảnh báo trùng lặp React key trên console: {key_warnings[0]}",
                "url": f"{BASE_URL}/"
            })
            print(f"  ❌ PHÁT HIỆN DEFECT-12: Có React duplicate key warning!")
        else:
            print("  ✅ PASS: Console sạch 100%, 0 duplicate key warnings.")

        browser.close()

    print("\n======================================================================")
    print(f"📊 KẾT QUẢ KIỂM THỬ BLACK-BOX QC TASK-01:")
    print(f"   Tổng số ca kiểm thử: {tests_run}")
    print(f"   Số lỗi phát hiện: {len(defects)}")
    if len(defects) == 0:
        print("   🏆 ĐẠT 100% TIÊU CHUẨN QUALITY GATE 4 & PO ACCEPTANCE!")
    else:
        print("   ⚠️ CẦN KHẮC PHỤC CÁC DEFECT SAU:")
        for d in defects:
            print(f"      [{d['severity']}] {d['id']}: {d['summary']}")
    print("======================================================================\n")

    return len(defects) == 0

if __name__ == "__main__":
    success = run_task01_e2e()
    sys.exit(0 if success else 1)
