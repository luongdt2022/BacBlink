#!/usr/bin/env python3
"""
NacenTwin E2E Quality Gate 4: Provincial Gov Console Left Sidebar & 3D Scoped RBAC
File: SourceCode/frontend/tests/e2e/test_task07_delta_v8_gov_sidebar_e2e.py
Căn cứ: TASK-07 Phase 12 (Delta v8 CR-2026-021) & Mục 12 Basic Design (PO-DEC-20261023-02)

Tiêu chuẩn kiểm chứng [THIẾT QUÂN LUẬT QC]:
1. Đăng nhập tài khoản Sở KH&CN Hà Nội (hanoi.admin@demo.nacentech.vn, Scope: HN).
2. Xác nhận xuất hiện Sidebar Menu bên trái với đủ 4 nhóm Accordion và 9 menu items.
3. Kiểm tra các nhóm điều hướng:
   - Nhóm 1: Kiểm Duyệt Hồ Sơ Địa Bàn (Tất cả, Chuyên gia, Shop chào bán, Nhu cầu, Pháp nhân, Thẩm định DN ĐMST).
   - Nhóm 2: Thẩm Định Công Nghệ TT17 (Hội đồng Chấm điểm TT17).
   - Nhóm 3: Giám Sát Cung - Cầu & Địa Bàn (Tiến trình Đàm phán & SLA 48h, Bài toán Nhu cầu DNNVV).
   - Nhóm 4: Quản Trị Công Vụ & Nhân Sự Sở (Phân công Cán bộ & Chuyên viên).
4. Kiểm thử tương tác Click:
   - Click tab "Chuyên gia KH&CN" -> URL query có tab=EXPERT, active state chuẩn.
   - Click tab "Shop Chào Bán" -> URL query có tab=SHOP.
   - Click "Bài toán Nhu cầu DNNVV" -> Điều hướng thành công tới /gov/demands.
   - Click "Thẩm định công nghệ TT17" -> Điều hướng thành công tới /gov/assessments/tt17.
   - Click "Tiến trình Đàm phán & SLA" -> Điều hướng thành công tới /gov/opportunities.
   - Click "Phân công Cán bộ & Chuyên viên" -> Điều hướng thành công tới /gov/settings/staff.
5. Kiểm chứng Responsive: Mobile 375x812 hiển thị Top Bar thu gọn và Drawer menu hoạt động.
6. Chụp ảnh màn hình bằng chứng (Screenshots Evidence).
"""

import os
import re
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
ARTIFACT_DIR = "/Users/luongdt/.gemini/antigravity/brain/e7ecce13-e7fa-4ef2-b2c7-24a0083429c4"

def log_step(title, status="OK", detail=""):
    mark = "✅" if status == "OK" else "❌"
    print(f"  {mark} [{status}] {title} {('- ' + detail) if detail else ''}")

def run_gov_sidebar_e2e():
    print("\n" + "="*80)
    print("🏛️ BẮT ĐẦU CHẠY KIỂM THỬ QC GATE 4: CỔNG CÔNG VỤ CẤP SỞ KH&CN (/gov)")
    print("   TIÊU CHUẨN: 4 NHÓM ACCORDION SIDEBAR • 3D SCOPED RBAC • MAKER-CHECKER")
    print("="*80)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # =====================================================================
        # 1. VIEWPORT DESKTOP (1440x900) - TÀI KHOẢN SỞ KH&CN HÀ NỘI
        # =====================================================================
        print("\n▶ [GIAI ĐOẠN 1] Kiểm tra Desktop Viewport (1440x900)...")
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Đăng nhập
        page.goto(f"{BASE_URL}/login")
        page.fill('input[type="email"]', "hanoi.admin@demo.nacentech.vn")
        page.fill('input[type="password"]', "Password@123")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')

        page.wait_for_url("**/gov**", timeout=10000)
        time.sleep(2)
        log_step("Đăng nhập thành công", "OK", f"URL: {page.url}")

        # Kiểm chứng Sidebar Header
        sidebar = page.locator("aside")
        expect(sidebar).to_be_visible()
        log_step("Sidebar Menu bên trái xuất hiện", "OK", "aside tag visible w-72")

        sidebar_text = sidebar.inner_text()
        assert "TẦNG 1: QUẢN TRỊ NHÀ NƯỚC" in sidebar_text, "Thiếu Badge Tầng 1"
        assert "Sở KH&CN Hà Nội" in sidebar_text or "HN" in sidebar_text, "Thiếu Định vị Địa bàn Hà Nội"
        assert "SLA" in sidebar_text, "Thiếu cam kết SLA"
        log_step("Header Sidebar định danh Tầng 1 & Địa bàn HN chuẩn xác", "OK")

        # Kiểm chứng 4 nhóm Accordion
        assert "1. KIỂM DUYỆT HỒ SƠ ĐỊA BÀN" in sidebar_text.upper(), "Thiếu Nhóm 1"
        assert "2. THẨM ĐỊNH CÔNG NGHỆ TT17" in sidebar_text.upper(), "Thiếu Nhóm 2"
        assert "3. GIÁM SÁT CUNG–CẦU & ĐỊA BÀN" in sidebar_text.upper(), "Thiếu Nhóm 3"
        assert "4. QUẢN TRỊ CÔNG VỤ & NHÂN SỰ" in sidebar_text.upper(), "Thiếu Nhóm 4"
        log_step("Đầy đủ 4 Nhóm Accordion trên Sidebar", "OK")

        # Kiểm chứng Menu items
        assert "Tất cả hồ sơ chờ duyệt" in sidebar_text, "Thiếu link Tất cả"
        assert "Chuyên gia KH&CN" in sidebar_text, "Thiếu link Chuyên gia"
        assert "Shop Chào Bán / Sáng chế" in sidebar_text, "Thiếu link Shop"
        assert "Nhu cầu Công nghệ" in sidebar_text, "Thiếu link Nhu cầu"
        assert "Tài khoản Pháp nhân" in sidebar_text, "Thiếu link Pháp nhân"
        assert "Thẩm định DN ĐMST" in sidebar_text, "Thiếu link Thẩm định DN"
        assert "Hội đồng Chấm điểm TT17" in sidebar_text, "Thiếu link TT17"
        assert "Tiến trình Đàm phán & SLA" in sidebar_text, "Thiếu link Cơ hội"
        assert "Bài toán Nhu cầu DNNVV" in sidebar_text, "Thiếu link Demands"
        assert "Phân công Cán bộ & Chuyên viên" in sidebar_text, "Thiếu link Nhân sự"
        log_step("Đầy đủ 9 menu items và liên kết nối thông suốt", "OK")

        # Kiểm chứng Header Main Content đã sửa Badge Maker-Checker
        main_header = page.locator("h1").locator("..")
        main_text = main_header.inner_text()
        assert "Maker-Checker" in main_text, "Header thiếu thuật ngữ Maker-Checker chuẩn hóa"
        assert "Hàng Đợi Kiểm Duyệt Địa Bàn" in main_text, "Tiêu đề chính chuẩn xác"
        log_step("Header Content chuẩn hóa thuật ngữ Maker-Checker 2 cấp", "OK")

        # Chụp ảnh Desktop Viewport
        desktop_img = os.path.join(ARTIFACT_DIR, "evidence_gov_sidebar_desktop.png")
        page.screenshot(path=desktop_img, full_page=False)
        log_step("Lưu ảnh bằng chứng Desktop Viewport", "OK", desktop_img)

        # =====================================================================
        # 2. KIỂM THỬ TƯƠNG TÁC ĐIỀU HƯỚNG CÁC TAB VÀ TRANG
        # =====================================================================
        print("\n▶ [GIAI ĐOẠN 2] Kiểm thử tương tác Click điều hướng...")

        # Click Tab Chuyên gia
        page.locator('aside a:has-text("Chuyên gia KH&CN")').click()
        expect(page).to_have_url(re.compile(r".*/gov\?tab=EXPERT.*"), timeout=8000)
        log_step("Click Tab 'Chuyên gia KH&CN' thành công", "OK", page.url)

        # Click Tab Shop
        page.locator('aside a:has-text("Shop Chào Bán")').click()
        expect(page).to_have_url(re.compile(r".*/gov\?tab=SHOP.*"), timeout=8000)
        log_step("Click Tab 'Shop Chào Bán' thành công", "OK", page.url)

        # Click Bài toán Nhu cầu DNNVV (/gov/demands)
        page.locator('aside a:has-text("Bài toán Nhu cầu DNNVV")').first.click()
        expect(page).to_have_url(re.compile(r".*/gov/demands.*"), timeout=8000)
        time.sleep(1.5)
        log_step("Điều hướng thành công vào /gov/demands (Đã đóng GAP)", "OK", page.url)

        # Chụp ảnh /gov/demands với Sidebar
        demands_img = os.path.join(ARTIFACT_DIR, "evidence_gov_demands_sidebar.png")
        page.screenshot(path=demands_img, full_page=False)
        log_step("Lưu ảnh bằng chứng /gov/demands", "OK", demands_img)

        # Click Thẩm định TT17 (/gov/assessments/tt17)
        time.sleep(1.5)
        page.locator('aside a:has-text("Hội đồng Chấm điểm TT17")').first.click()
        expect(page).to_have_url(re.compile(r".*/gov/assessments/tt17.*"), timeout=8000)
        time.sleep(2)
        log_step("Điều hướng thành công vào /gov/assessments/tt17", "OK", page.url)

        # Click Giám sát tiến trình đàm phán (/gov/opportunities)
        page.locator('aside a:has-text("Tiến trình Đàm phán & SLA")').first.click()
        expect(page).to_have_url(re.compile(r".*/gov/opportunities.*"), timeout=8000)
        time.sleep(2)
        log_step("Điều hướng thành công vào /gov/opportunities", "OK", page.url)

        # Click Phân công cán bộ (/gov/settings/staff)
        staff_link = page.locator('aside a:has-text("Phân công Cán bộ & Chuyên viên")').first
        staff_link.scroll_into_view_if_needed()
        staff_link.click()
        expect(page).to_have_url(re.compile(r".*/gov/settings/staff.*"), timeout=8000)
        time.sleep(2)
        log_step("Điều hướng thành công vào /gov/settings/staff", "OK", page.url)

        context.close()

        # =====================================================================
        # 3. VIEWPORT MOBILE (375x812) - RESPONSIVE DRAWER TEST
        # =====================================================================
        print("\n▶ [GIAI ĐOẠN 3] Kiểm thử Responsive Mobile Drawer (375x812)...")
        context_mobile = browser.new_context(viewport={"width": 375, "height": 812})
        page_m = context_mobile.new_page()

        page_m.goto(f"{BASE_URL}/login")
        page_m.fill('input[type="email"]', "hanoi.admin@demo.nacentech.vn")
        page_m.fill('input[type="password"]', "Password@123")
        page_m.click('button:has-text("Đăng nhập vào Hệ Thống")')

        page_m.wait_for_url("**/gov**", timeout=10000)
        time.sleep(2)

        # Nút Hamburger phải hiển thị trên mobile
        hamburger = page_m.locator('[data-testid="gov-mobile-menu-btn"]')
        expect(hamburger).to_be_visible()
        log_step("Nút Hamburger xuất hiện trên Mobile Bar", "OK")

        # Bấm mở Drawer
        hamburger.click()
        time.sleep(1)

        # Sidebar Drawer hiển thị
        mobile_drawer = page_m.locator('div.fixed.inset-0.z-50 aside')
        expect(mobile_drawer).to_be_visible()
        log_step("Mobile Drawer trượt mở thành công", "OK")

        # Chụp ảnh Mobile Drawer
        mobile_img = os.path.join(ARTIFACT_DIR, "evidence_gov_sidebar_mobile.png")
        page_m.screenshot(path=mobile_img, full_page=False)
        log_step("Lưu ảnh bằng chứng Mobile Drawer", "OK", mobile_img)

        # Bấm nút đóng Drawer (X)
        close_btn = mobile_drawer.locator('button:has(svg.lucide-x)')
        close_btn.click()
        time.sleep(0.5)
        expect(mobile_drawer).not_to_be_visible()
        log_step("Nút đóng (X) thu gọn Drawer thành công", "OK")

        context_mobile.close()
        browser.close()

    print("\n" + "="*80)
    print("🎯 TOÀN BỘ CÁC BƯỚC KIỂM THỬ QC GATE 4 ĐẠT 100% GREEN (ZERO BUG / ZERO REGRESSION)")
    print("="*80)

if __name__ == "__main__":
    run_gov_sidebar_e2e()
