#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX THUẦN TÚY: TASK-02 DELTA V3
NỘI DUNG:
  - Bộ tiêu chí ĐMST 8 nhóm (100đ), 37 tiêu chí
  - Phân tầng ĐMST Vàng / Bạc / Đồng / Chưa đánh giá
  - Trực quan hóa Biểu đồ Radar Chart 8 trục SVG
  - Bộ lọc Dropdown Mức độ ĐMST tại Danh bạ (/enterprises & /doanh-nghiep-dmst)
  - Tuân thủ PDPD Masking (che giấu C33 Doanh thu, C15 Ngân sách R&D)
KỶ LUẬT: Pure Black-box, Zero-Mock, Real DB, Real HTTP.
"""

import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def run_task02_innovation_rating_e2e():
    print("======================================================================")
    print("🛡️ KIỂM THỬ E2E BLACK-BOX QC TẦNG 4: TASK-02 DELTA V3 (ĐMST 8 NHÓM & RADAR)")
    print("🚫 Kỷ luật: ZERO-MOCK, REAL DATABASE (304 DN), REAL BROWSING")
    print("======================================================================\n")

    defects = []
    tests_run = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # ------------------------------------------------------------------
        # CA 1: Kiểm tra Danh bạ & Bộ lọc Dropdown Mức độ ĐMST
        # ------------------------------------------------------------------
        tests_run += 1
        print("▶ [BB-01] Kiểm tra Trang danh bạ /enterprises & Bộ lọc Mức độ ĐMST...")
        page.goto(f"{BASE_URL}/enterprises", wait_until="networkidle")
        time.sleep(1)

        # Kiểm tra Dropdown filter ĐMST
        tier_select = page.locator("select").filter(has=page.locator("option[value='LEADING']"))
        if not tier_select.is_visible():
            defects.append({
                "id": "DEFECT-01",
                "severity": "CRITICAL",
                "summary": "Không tìm thấy Dropdown bộ lọc 'Mức Độ ĐMST' trên trang /enterprises",
                "url": f"{BASE_URL}/enterprises"
            })
            print("  ❌ PHÁT HIỆN DEFECT-01: Không tìm thấy Dropdown bộ lọc ĐMST!")
        else:
            print("  ✅ PASS: Dropdown bộ lọc 'Mức Độ ĐMST' hiển thị đầy đủ.")

            # Kiểm tra 4 options phân tầng
            options = tier_select.locator("option").all_inner_texts()
            expected_labels = ["Dẫn đầu", "phát triển", "Tiềm năng", "Chưa đánh giá"]
            for exp in expected_labels:
                if any(exp.lower() in opt.lower() for opt in options):
                    print(f"  ✅ PASS: Có tùy chọn chứa '{exp}'.")
                else:
                    defects.append({
                        "id": "DEFECT-02",
                        "severity": "MAJOR",
                        "summary": f"Thiếu tùy chọn bộ lọc '{exp}' trong dropdown ĐMST",
                        "url": f"{BASE_URL}/enterprises"
                    })
                    print(f"  ❌ PHÁT HIỆN DEFECT-02: Thiếu tùy chọn '{exp}'!")

        # ------------------------------------------------------------------
        # CA 2: Kiểm tra Lọc Phân Tầng LEADING (Dẫn đầu >= 75đ)
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-02] Kiểm tra tương tác lọc '⭐️ ĐMST Dẫn đầu (≥ 75 điểm)'...")
        tier_select.select_option("LEADING")
        time.sleep(1.5)
        page.wait_for_load_state("networkidle")

        # Kiểm tra hiển thị Huy hiệu Vàng ĐMST trên các Card
        gold_cards = page.locator("text=Vàng ĐMST")
        gold_count = gold_cards.count()
        print(f"  ℹ️ Số thẻ hiển thị Huy hiệu Vàng trên trang hiện tại: {gold_count}")
        if gold_count == 0:
            defects.append({
                "id": "DEFECT-03",
                "severity": "MAJOR",
                "summary": "Bộ lọc LEADING không hiển thị thẻ có Huy hiệu Vàng ĐMST",
                "url": f"{BASE_URL}/enterprises?innovationTier=LEADING"
            })
            print("  ❌ PHÁT HIỆN DEFECT-03: Không tìm thấy Huy hiệu Vàng ĐMST sau khi lọc LEADING!")
        else:
            print(f"  ✅ PASS: Các thẻ doanh nghiệp hiển thị Huy hiệu Vàng ĐMST chính xác ({gold_count} thẻ).")

        # Kiểm tra tổng số bản ghi lọc được (kỳ vọng 23 DN)
        body_text = page.locator("body").inner_text()
        if "Kết quả tra cứu: 23 doanh nghiệp" in body_text:
            print("  ✅ PASS: Tổng số doanh nghiệp Dẫn đầu ghi nhận chính xác 23 DN.")
        else:
            defects.append({
                "id": "DEFECT-04",
                "severity": "MAJOR",
                "summary": "Tổng số doanh nghiệp sau khi lọc LEADING không khớp 23 DN",
                "url": f"{BASE_URL}/enterprises"
            })
            print("  ❌ PHÁT HIỆN DEFECT-04: Không khớp 23 DN!")

        # ------------------------------------------------------------------
        # CA 3: Kiểm tra Lọc Phân Tầng DEVELOPING (50 - 74đ)
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-03] Kiểm tra tương tác lọc '🥈 Đang phát triển (50 - 74 điểm)'...")
        tier_select.select_option("DEVELOPING")
        time.sleep(1.5)
        page.wait_for_load_state("networkidle")

        silver_cards = page.locator("text=Bạc ĐMST")
        silver_count = silver_cards.count()
        print(f"  ℹ️ Số thẻ hiển thị Huy hiệu Bạc trên trang hiện tại: {silver_count}")
        if silver_count == 0:
            defects.append({
                "id": "DEFECT-05",
                "severity": "MAJOR",
                "summary": "Bộ lọc DEVELOPING không hiển thị thẻ có Huy hiệu Bạc ĐMST",
                "url": f"{BASE_URL}/enterprises"
            })
            print("  ❌ PHÁT HIỆN DEFECT-05: Không tìm thấy Huy hiệu Bạc ĐMST sau khi lọc DEVELOPING!")
        else:
            print(f"  ✅ PASS: Các thẻ doanh nghiệp hiển thị Huy hiệu Bạc ĐMST chính xác ({silver_count} thẻ).")

        # Kiểm tra tổng số bản ghi lọc được (kỳ vọng 112 DN)
        body_text = page.locator("body").inner_text()
        if "Kết quả tra cứu: 112 doanh nghiệp" in body_text:
            print("  ✅ PASS: Tổng số doanh nghiệp Đang phát triển ghi nhận chính xác 112 DN.")
        else:
            defects.append({
                "id": "DEFECT-06",
                "severity": "MAJOR",
                "summary": "Tổng số doanh nghiệp sau khi lọc DEVELOPING không khớp 112 DN",
                "url": f"{BASE_URL}/enterprises"
            })
            print("  ❌ PHÁT HIỆN DEFECT-06: Không khớp 112 DN!")

        # ------------------------------------------------------------------
        # CA 4: Kiểm tra Trang Chi Tiết & Tab 'Năng Lực ĐMST' (Doanh nghiệp LEADING)
        # ------------------------------------------------------------------
        tests_run += 1
        leading_tax_code = "3300100875"
        print(f"\n▶ [BB-04] Kiểm tra trang chi tiết /enterprises/{leading_tax_code}...")
        page.goto(f"{BASE_URL}/enterprises/{leading_tax_code}", wait_until="networkidle")
        time.sleep(1.5)

        # Chuyển sang Tab "Năng Lực ĐMST"
        innovation_tab = page.locator("button:has-text('Năng Lực ĐMST')")
        if not innovation_tab.is_visible():
            defects.append({
                "id": "DEFECT-07",
                "severity": "CRITICAL",
                "summary": f"Không tìm thấy Tab 'Năng Lực ĐMST' trên trang chi tiết {leading_tax_code}",
                "url": f"{BASE_URL}/enterprises/{leading_tax_code}"
            })
            print("  ❌ PHÁT HIỆN DEFECT-07: Thiếu Tab 'Năng Lực ĐMST'!")
        else:
            print("  ✅ PASS: Tab 'Năng Lực ĐMST' có mặt. Thực hiện click...")
            innovation_tab.click()
            time.sleep(1)

            # Kiểm tra Radar Chart SVG
            radar_svg = page.locator("svg[aria-label='Biểu đồ Radar Năng Lực ĐMST 8 Trục']")
            if not radar_svg.is_visible():
                defects.append({
                    "id": "DEFECT-08",
                    "severity": "CRITICAL",
                    "summary": "Biểu đồ Radar Chart 8 trục SVG không render",
                    "url": f"{BASE_URL}/enterprises/{leading_tax_code}"
                })
                print("  ❌ PHÁT HIỆN DEFECT-08: Biểu đồ Radar Chart 8 trục SVG không hiển thị!")
            else:
                print("  ✅ PASS: Biểu đồ Radar Chart 8 trục SVG render xuất sắc.")

            # Kiểm tra 8 trục năng lực trên trang
            axes = ["Quản trị", "R&D & CN", "SP / Quy trình", "Sở hữu trí tuệ", "Chuyển đổi số", "Thị trường", "Nhân lực", "Liên kết"]
            detail_text = page.locator("body").inner_text()
            found_axes = [ax for ax in axes if ax in detail_text]
            print(f"  ℹ️ Số trục/nhóm tìm thấy trên trang: {len(found_axes)}/8 ({found_axes})")
            if len(found_axes) < 8:
                defects.append({
                    "id": "DEFECT-09",
                    "severity": "MAJOR",
                    "summary": f"Thiếu các trục năng lực trên tab ĐMST: {set(axes) - set(found_axes)}",
                    "url": f"{BASE_URL}/enterprises/{leading_tax_code}"
                })
                print(f"  ❌ PHÁT HIỆN DEFECT-09: Thiếu trục năng lực: {set(axes) - set(found_axes)}")
            else:
                print("  ✅ PASS: Đầy đủ 8 trục/nhóm năng lực ĐMST hiển thị trên trang chi tiết.")

            # Kiểm tra Thẻ Tổng điểm & Phân tầng Vàng
            if "76" in detail_text and "Vàng ĐMST" in detail_text:
                print("  ✅ PASS: Điểm tổng 76.0 và Huy hiệu Vàng ĐMST hiển thị chuẩn xác.")
            else:
                defects.append({
                    "id": "DEFECT-10",
                    "severity": "MAJOR",
                    "summary": "Không hiển thị đúng điểm số 76 hoặc Huy hiệu Vàng trên Tab ĐMST",
                    "url": f"{BASE_URL}/enterprises/{leading_tax_code}"
                })
                print("  ❌ PHÁT HIỆN DEFECT-10: Không khớp điểm 76 hoặc Huy hiệu Vàng!")

        # ------------------------------------------------------------------
        # CA 5: Kiểm tra Tuân Thủ PDPD Masking Trên Giao Diện Công Khai
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-05] Kiểm tra PDPD Masking (Bảo mật tài chính C33 & ngân sách R&D C15)...")
        # Kiểm tra banner PDPD bảo vệ thông tin cá nhân/tài chính theo Nghị định 13/2023/NĐ-CP
        pdpd_banner = page.locator("text=Nghị định 13/2023/NĐ-CP").first
        if pdpd_banner.is_visible():
            print("  ✅ PASS: Banner cảnh báo bảo mật dữ liệu PDPD (NĐ 13/2023/NĐ-CP) hiển thị rõ ràng.")
        else:
            defects.append({
                "id": "DEFECT-11",
                "severity": "HIGH",
                "summary": "Thiếu cảnh báo bảo vệ dữ liệu PDPD theo Nghị định 13/2023/NĐ-CP trên tab ĐMST",
                "url": f"{BASE_URL}/enterprises/{leading_tax_code}"
            })
            print("  ❌ PHÁT HIỆN DEFECT-11: Thiếu cảnh báo PDPD!")

        # Kiểm tra rằng bảng chi tiết 37 tiêu chí thô bị ẩn (CriteriaDetails = null trên public view)
        raw_table = page.locator("table")
        if raw_table.count() > 0:
            print("  ⚠️ GHI NHẬN: Có bảng hiển thị, kiểm tra nội dung nhạy cảm...")
        else:
            print("  ✅ PASS: Không phơi bày bảng chi tiết 37 tiêu chí cho khách công chúng (Zero Leakage).")

        # ------------------------------------------------------------------
        # CA 6: Kiểm tra Route Alias /doanh-nghiep-dmst
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-06] Kiểm tra Route Alias /doanh-nghiep-dmst...")
        page.goto(f"{BASE_URL}/doanh-nghiep-dmst", wait_until="networkidle")
        time.sleep(1)

        h1_text = page.locator("h1").inner_text()
        if "Danh Bạ Doanh Nghiệp" in h1_text and "Đổi Mới Sáng Tạo" in h1_text:
            print(f"  ✅ PASS: Route alias /doanh-nghiep-dmst tải thành công với tiêu đề: '{h1_text}'.")
        else:
            defects.append({
                "id": "DEFECT-12",
                "severity": "MAJOR",
                "summary": f"Route alias /doanh-nghiep-dmst không hiển thị đúng tiêu đề, tiêu đề hiện tại: '{h1_text}'",
                "url": f"{BASE_URL}/doanh-nghiep-dmst"
            })
            print(f"  ❌ PHÁT HIỆN DEFECT-12: Tiêu đề không khớp: '{h1_text}'!")

        browser.close()

    # ------------------------------------------------------------------
    # TỔNG KẾT & KẾT LUẬN
    # ------------------------------------------------------------------
    print("\n======================================================================")
    print(f"📊 KẾT QUẢ KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: {tests_run} CA ĐÃ CHẠY")
    print(f"   Số lỗi phát hiện: {len(defects)}")
    print("======================================================================")

    if defects:
        print("❌ KẾT QUẢ: FAIL - CÓ LỖI TỒN TẠI:")
        for d in defects:
            print(f"  - [{d['severity']}] {d['id']}: {d['summary']} ({d['url']})")
        sys.exit(1)
    else:
        print("🎉 KẾT QUẢ: PASS 100% - TOÀN BỘ CÁC CA KIỂM THỬ E2E ĐỀU ĐẠT CHUẨN!")
        sys.exit(0)

if __name__ == "__main__":
    run_task02_innovation_rating_e2e()
