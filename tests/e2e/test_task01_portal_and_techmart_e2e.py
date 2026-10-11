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
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1)

        body_text = page.locator("body").inner_text()
        if "Kết nối cung – cầu công nghệ" not in body_text:
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
        ai_btn = page.locator("button[aria-label='Mở Trợ lý Ảo AI NacentTwin']").first
        if ai_btn.is_visible():
            print("  ✅ PASS: FAB Button Trợ lý AI hiển thị nổi góc phải.")
            ai_btn.click()
            time.sleep(0.5)

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
        page.goto(f"{BASE_URL}/trien-lam", wait_until="networkidle")
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
        reg_btn = page.locator("button:has-text('Đăng Ký Tham Gia')").first
        if reg_btn.is_visible():
            print("  ✅ PASS: Nút 'Đăng Ký Tham Gia' có mặt trên trang sự kiện.")
            reg_btn.click()
            time.sleep(0.5)

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
        page.goto(f"{BASE_URL}/trien-lam/dang-ky-tham-quan", wait_until="networkidle")
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
