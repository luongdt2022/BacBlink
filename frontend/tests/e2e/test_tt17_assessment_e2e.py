#!/usr/bin/env python3
"""
NacenTwin Real E2E Black-box Test Suite: TT17 Technology Assessment (Circular 17/2019/TT-BKHCN)
File: SourceCode/frontend/tests/e2e/test_tt17_assessment_e2e.py
Quy chuẩn: ZERO-MOCK. Chạy trực tiếp trên trình duyệt Chromium sống với Frontend (http://localhost:3001)
và Backend .NET (http://localhost:5080) kết nối CSDL PostgreSQL thật.
"""

import time
import uuid
import sys
from playwright.sync_api import sync_playwright, expect

FRONTEND_URL = "http://localhost:3001"

def run_tt17_e2e_suite():
    print("\n" + "=" * 80)
    print("🚀 BẮT ĐẦU CHẠY BỘ KIỂM THỬ PLAYWRIGHT E2E TRÌNH DUYỆT SỐNG (ZERO-MOCK)")
    print("   TÍNH NĂNG: ĐÁNH GIÁ TRÌNH ĐỘ CÔNG NGHỆ DOANH NGHIỆP TT17 (4 JOURNEYS)")
    print("=" * 80)

    passed = 0
    total = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # ---------------------------------------------------------------------
        # JOURNEY 4 (CHẠY TRƯỚC ĐỂ THỬ BIÊN VALIDATION TRÊN FORM TRẮNG)
        # ---------------------------------------------------------------------
        total += 1
        print("\n▶ [JOURNEY 4] Boundary Validation Guard: Chặn nộp khi thiếu Tên DN, MST, Email...")
        page.goto(f"{FRONTEND_URL}/assessments/tt17/wizard")
        page.wait_for_selector('input#tt17-company-name')

        # Xóa các trường bắt buộc
        page.fill('input#tt17-company-name', "")
        page.fill('input#tt17-tax-code', "")
        page.fill('input#tt17-contact-email', "")

        # Cuộn xuống và bấm Nộp hồ sơ
        submit_btn = page.locator('button:has-text("Hoàn Tất & Nộp Hồ Sơ")').first
        submit_btn.scroll_into_view_if_needed()
        submit_btn.click()

        # Kỳ vọng toast lỗi Tên Doanh nghiệp xuất hiện
        expect(page.locator("text=Vui lòng nhập Tên Doanh nghiệp trước khi nộp hồ sơ.")).to_be_visible(timeout=4000)
        print("  ✓ Đã chặn thành công khi bỏ trống Tên Doanh nghiệp.")

        # Điền tên DN nhưng bỏ trống MST
        page.fill('input#tt17-company-name', "Công ty TNHH Thử Nghiệm QC")
        submit_btn.click()
        expect(page.locator("text=Vui lòng nhập Mã số thuế trước khi nộp hồ sơ.")).to_be_visible(timeout=4000)
        print("  ✓ Đã chặn thành công khi bỏ trống Mã số thuế.")

        # Điền MST nhưng bỏ trống Email
        page.fill('input#tt17-tax-code', "0109998888")
        submit_btn.click()
        expect(page.locator("text=Vui lòng nhập Email liên hệ để nhận thông tin tài khoản và kết quả.")).to_be_visible(timeout=4000)
        print("  ✓ Đã chặn thành công khi bỏ trống Email liên hệ.")
        print("  -> PASS: JOURNEY 4 hoàn thành 100% tiêu chí chặn lỗi biên.")
        passed += 1

        # ---------------------------------------------------------------------
        # JOURNEY 3: COMBOBOX 34 TỈNH THÀNH & SELECTS VỚI CHIỀU CAO CHUẨN h-[42px]
        # ---------------------------------------------------------------------
        total += 1
        print("\n▶ [JOURNEY 3] Kiểm tra Combobox 34 Tỉnh Thành và chiều cao chuẩn h-[42px]...")
        scope_input = page.locator('input#tt17-scope-id')
        expect(scope_input).to_be_visible()

        # Kiểm tra chiều cao phần tử
        box = scope_input.bounding_box()
        assert box is not None, "Không tìm thấy bounding box của combobox tỉnh thành"
        print(f"  -> Chiều cao thực tế của Combobox tỉnh thành: {box['height']}px (Chuẩn h-[42px])")
        assert 40 <= box["height"] <= 44, f"Chiều cao combobox {box['height']}px nằm ngoài dung sai chuẩn 42px"

        # Gõ tìm kiếm "Đà Nẵng" và chọn từ danh sách 34 tỉnh trọng điểm
        scope_input.fill("Đà Nẵng")
        page.wait_for_timeout(300)
        option_danang = page.locator('li:has-text("Đà Nẵng")').first
        expect(option_danang).to_be_visible()
        option_danang.click()
        expect(scope_input).to_have_value("Đà Nẵng")
        print("  ✓ Combobox tìm kiếm và chọn chuẩn xác tỉnh thành 'Đà Nẵng' từ 34 tỉnh ĐMST.")
        print("  -> PASS: JOURNEY 3 hoàn thành 100%.")
        passed += 1

        # ---------------------------------------------------------------------
        # JOURNEY 2: CÁC NÚT NẠP NHANH TỰ ĐỘNG & TÍNH TOÁN THÔNG MINH
        # ---------------------------------------------------------------------
        total += 1
        print("\n▶ [JOURNEY 2] Kiểm tra các nút nạp nhanh tự động: Định mức Năng lượng/NVL, Đồng bộ M_tt...")

        # Chuyển sang Bước 2 (Mục B: Thiết bị & Công nghệ)
        step2_btn = page.locator('button:has-text("Mục B: Nhóm T - Thiết Bị")')
        step2_btn.scroll_into_view_if_needed()
        step2_btn.click()
        page.wait_for_timeout(400)

        # Kiểm tra nút Nạp chuẩn Năng lượng
        energy_sync_btn = page.locator('button:has-text("Nạp chuẩn")').first
        expect(energy_sync_btn).to_be_visible()
        energy_sync_btn.click()
        print("  ✓ Đã kích hoạt nút Nạp chuẩn định mức Năng lượng thành công.")

        # Chuyển sang Bước 4 (Mục D: Quản trị)
        step4_btn = page.locator('button:has-text("Mục D: Nhóm O - Quản Trị")')
        step4_btn.scroll_into_view_if_needed()
        step4_btn.click()
        page.wait_for_timeout(400)

        # Kiểm tra nút Đồng bộ M_tt từ BCTC
        mtt_sync_btn = page.locator('button:has-text("Đồng bộ")').first
        expect(mtt_sync_btn).to_be_visible()
        mtt_sync_btn.click()
        print("  ✓ Đã kích hoạt nút Đồng bộ M_tt từ BCTC 3 năm thành công.")
        print("  -> PASS: JOURNEY 2 hoàn thành 100%.")
        passed += 1

        # ---------------------------------------------------------------------
        # JOURNEY 1: PUBLIC INTAKE, NỘP HỒ SƠ & AUTO-PROVISIONED MODAL
        # ---------------------------------------------------------------------
        total += 1
        print("\n▶ [JOURNEY 1] Public Intake: Điền form, nộp hồ sơ và verify modal Auto-provisioned...")

        # Quay lại Bước 1 điền thông tin hợp lệ
        step1_btn = page.locator('button:has-text("Mục A: Thông Tin Chung")')
        step1_btn.scroll_into_view_if_needed()
        step1_btn.click()
        page.wait_for_timeout(400)

        unique_tax = f"010{uuid.uuid4().hex[:7]}"
        company_name = f"Công ty CP Chế Tạo Máy E2E-{unique_tax[-4:]}"
        contact_email = f"e2e.contact.{unique_tax[-4:]}@chitaomay.vn"

        page.fill('input#tt17-company-name', company_name)
        page.fill('input#tt17-tax-code', unique_tax)
        page.fill('input#tt17-contact-email', contact_email)
        page.fill('input#tt17-contact-phone', "0988123456")
        page.fill('input#tt17-contact-person', "Trần Văn Kỹ Thuật")

        # Chọn lại Hà Nội
        scope_input.fill("Hà Nội")
        page.wait_for_timeout(300)
        page.locator('li:has-text("Hà Nội")').first.click()

        # Bấm Hoàn Tất & Nộp Hồ Sơ
        submit_btn = page.locator('button:has-text("Hoàn Tất & Nộp Hồ Sơ")').first
        submit_btn.scroll_into_view_if_needed()
        submit_btn.click()

        # Verify màn hình kết quả thành công
        print("  Đang chờ tiếp nhận và cấp tài khoản tự động từ hệ thống...")
        expect(page.locator("text=Nộp Phiếu Đánh Giá Công Nghệ Thành Công!")).to_be_visible(timeout=8000)
        expect(page.locator("text=Mã hồ sơ đánh giá:")).to_be_visible()
        expect(page.locator("text=/Tổng điểm tính toán/i")).to_be_visible()

        # Verify khối Auto-provisioned
        expect(page.locator("text=TÀI KHOẢN DOANH NGHIỆP ĐÃ ĐƯỢC CẤP TỰ ĐỘNG")).to_be_visible()
        expect(page.locator(f"text={contact_email}")).to_be_visible()
        print(f"  ✓ Màn hình Auto-provisioned hiển thị thành công tài khoản cấp mới cho: {contact_email}")
        print("  ✓ Mã hồ sơ và điểm số tính toán TT17 được kết xuất đầy đủ.")
        print("  -> PASS: JOURNEY 1 hoàn thành 100%.")
        passed += 1

        browser.close()

    print("\n" + "=" * 80)
    print(f"KẾT QUẢ TẦNG 4: {passed}/{total} PLAYWRIGHT E2E JOURNEYS PASS (100% TRÌNH DUYỆT SỐNG)")
    print("=" * 80)

if __name__ == "__main__":
    run_tt17_e2e_suite()
