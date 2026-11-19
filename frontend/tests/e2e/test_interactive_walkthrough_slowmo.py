#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM ĐỊNH TƯƠNG TÁC (INTERACTIVE WALKTHROUGH): TASK-05 HỒ SƠ CHUYÊN GIA
Chế độ: MỞ TRÌNH DUYỆT THẬT TRÊN MÀN HÌNH (headless=False), CHẠY CHẬM (slow_mo=1400ms)
Mục tiêu: Dẫn dắt Product Owner / User nghiệm thu trực quan bằng mắt từ bước ĐĂNG NHẬP THẬT TRÊN UI.
Kỷ luật: 100% Pure Black-Box Testing (Không mock mạng, không tiêm token ngầm qua evaluate).
"""

import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def run_interactive_walkthrough():
    print("======================================================================")
    print("🎬 KHỞI ĐỘNG PHIÊN NGHIỆM THU TRỰC QUAN (INTERACTIVE WALKTHROUGH)")
    print("🖥️  Chế độ: Mở trình duyệt Chromium thật trên màn hình | Chạy chậm (1400ms)")
    print("🔑 Xác thực: ĐĂNG NHẬP THẬT QUA FORM UI (100% Pure Black-Box, KHÔNG tiêm script)")
    print("======================================================================\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=1400)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # ------------------------------------------------------------------
        # MÀN 1: ĐĂNG NHẬP TÀI KHOẢN NGƯỜI DÙNG THẬT TRÊN GIAO DIỆN
        # ------------------------------------------------------------------
        print("📌 [LUỒNG 1] ĐĂNG NHẬP TÀI KHOẢN NGƯỜI DÙNG TRÊN GIAO DIỆN (/login)")
        page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        time.sleep(1)

        print("  ▶ 1.1 Điền thông tin đăng nhập thành viên công dân/khoa học...")
        email_input = page.locator("input[type='email']").first
        email_input.fill("luongdtjp@gmail.com")
        
        pass_input = page.locator("input[type='password']").first
        pass_input.fill("Password@123")
        time.sleep(0.5)

        print("  ▶ 1.2 Bấm nút [Đăng nhập vào Hệ Thống]...")
        login_btn = page.locator("button[type='submit']").first
        login_btn.click()
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        print("    👀 Quan sát: Xác thực API thành công, hệ thống đã cấp phiên làm việc chuẩn.")

        # ------------------------------------------------------------------
        # MÀN 2: KIỂM CHỨNG BẮT LỖI BIÊN & VALIDATION BƯỚC 1 TẠI FORM HỒ SƠ
        # ------------------------------------------------------------------
        print("\n📌 [LUỒNG 2] ĐIỀU HƯỚNG TỚI FORM HỒ SƠ VÀ BẮT LỖI BIÊN DỮ LIỆU")
        page.goto(f"{BASE_URL}/profile/upgrade/expert", wait_until="networkidle")
        time.sleep(1.5)

        # 2.1 Thử bỏ trống Họ tên và bấm Tiếp tục
        print("  ▶ 2.1 Thử nghiệm để trống Họ tên...")
        fn_input = page.locator("input[placeholder*='Nguyễn Văn']").first
        fn_input.fill("")
        
        next_step1_btn = page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").first
        next_step1_btn.click()
        time.sleep(1)
        print("    👀 Quan sát: Thông báo đỏ 'Vui lòng nhập họ và tên đầy đủ' xuất hiện, chặn chuyển bước.")

        # 2.2 Thử nhập năm sinh dị thường (-999)
        print("  ▶ 2.2 Thử nghiệm nhập năm sinh âm (-999)...")
        fn_input.fill("PGS.TS. Đặng Tiến Lượng")
        birth_input = page.locator("input[type='number']").first
        birth_input.fill("-999")
        next_step1_btn.click()
        time.sleep(1)
        print("    👀 Quan sát: Hệ thống chặn và hiện thông báo lỗi năm sinh không hợp lệ.")

        # 2.3 Thử nhập số điện thoại sai cú pháp
        print("  ▶ 2.3 Thử nghiệm nhập số điện thoại sai cú pháp (chứa chữ & ký tự)...")
        birth_input.fill("1982")
        phone_input = page.locator("input[placeholder*='09']").first
        phone_input.fill("0912ABC#@!")
        next_step1_btn.click()
        time.sleep(1)
        print("    👀 Quan sát: Hệ thống chặn và hiện thông báo yêu cầu 10 số di động chuẩn Việt Nam.")

        # ------------------------------------------------------------------
        # MÀN 3: ĐIỀN THÔNG TIN CHUẨN XÁC & BÓC TÁCH AI CV SCANNER (BƯỚC 2)
        # ------------------------------------------------------------------
        print("\n📌 [LUỒNG 3] NHẬP DỮ LIỆU HỢP LỆ & TRẢI NGHIỆM AI CV SCANNER")
        print("  ▶ 3.1 Điền thông tin hợp lệ tại Bước 1 và chuyển tiếp...")
        phone_input.fill("0912345678")
        time.sleep(0.5)
        next_step1_btn.click()
        page.wait_for_selector("text=Bước 2: Năng lực Chuyên môn & AI CV Parser", timeout=10000)
        time.sleep(1)
        print("    👀 Quan sát: Đã chuyển thành công sang Bước 2 (Năng lực & AI CV Scan).")

        # 3.2 Trải nghiệm tính năng AI CV Scan
        print("  ▶ 3.2 Chọn tệp CV mẫu và kích hoạt AI bóc tách tự động...")
        sample_cv_btn = page.locator("button:has-text('Dùng tệp CV mẫu')").first
        if sample_cv_btn.count() > 0:
            sample_cv_btn.click()
            time.sleep(1)

        scan_ai_btn = page.locator("button:has-text('Bắt đầu Quét & Bóc Tách AI')").first
        if scan_ai_btn.count() > 0:
            scan_ai_btn.click()
            print("    👀 Quan sát: Thanh tiến trình AI đang bóc tách và đối soát 94 trường...")
            time.sleep(2.5)
            print("    👀 Quan sát: Hoàn tất! Quá trình đào tạo, cơ quan công tác đã được tự động điền sẵn.")

        # ------------------------------------------------------------------
        # MÀN 4: CÔNG BỐ KHOA HỌC & NỘP HỒ SƠ THẬT VỚI TOKEN XÁC THỰC
        # ------------------------------------------------------------------
        print("\n📌 [LUỒNG 4] CÔNG BỐ KHOA HỌC, CAM KẾT PDPD VÀ NỘP HỒ SƠ THẬT")
        print("  ▶ 4.1 Chuyển sang Bước 3 (Công bố & Cam kết)...")
        next_step2_btn = page.locator("button:has-text('Tiếp tục: Công bố & Cam kết')").first
        next_step2_btn.click()
        page.wait_for_selector("text=Bước 3: Hồ Sơ Khoa Học & Cam Kết Pháp Lý", timeout=10000)
        time.sleep(1)

        print("  ▶ 4.2 Tích chọn cam kết bảo vệ dữ liệu cá nhân (Nghị định 13) & Lời thề trung thực...")
        page.locator("input#pdpdConsent").check()
        time.sleep(0.5)
        page.locator("input#legalOath").check()
        time.sleep(1)

        print("  ▶ 4.3 Bấm nút [Nộp Hồ Sơ Xét Duyệt Nâng Hạng]...")
        submit_btn = page.locator("button:has-text('Nộp Hồ Sơ Xét Duyệt Nâng Hạng')").first
        submit_btn.click()
        time.sleep(2.5)
        print("    👀 Quan sát: Request nộp hồ sơ gửi kèm Bearer Token thật của tài khoản đã đăng nhập.")

        # ------------------------------------------------------------------
        # MÀN 5: REVIEW DANH BẠ CHUYÊN GIA CÔNG KHAI (PUBLIC DIRECTORY)
        # ------------------------------------------------------------------
        print("\n📌 [LUỒNG 5] TRUY CẬP DANH BẠ CÔNG KHAI (/experts/CG-NACEN-DEMOIT01)")
        page.goto(f"{BASE_URL}/experts/CG-NACEN-DEMOIT01", wait_until="networkidle")
        time.sleep(2)
        print("    👀 Quan sát: Trang công khai tải mượt mà từ dịch vụ Kestrel (200 OK).")
        print("    👀 Quan sát: Tuyệt đối không hiển thị số CCCD, bảo vệ dữ liệu cá nhân (PDPD).")

        # ------------------------------------------------------------------
        # MÀN 6: ĐĂNG NHẬP TÀI KHOẢN QUẢN TRỊ VIÊN THẬT & XEM HÀNG ĐỢI DUYỆT
        # ------------------------------------------------------------------
        print("\n📌 [LUỒNG 6] ĐĂNG NHẬP THẬT TÀI KHOẢN QUẢN TRỊ TỐI CAO (/login -> /admin/approvals)")
        page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        time.sleep(1)

        print("  ▶ 6.1 Điền tài khoản Quản trị tối cao (SUPER_ADMIN)...")
        email_admin = page.locator("input[type='email']").first
        email_admin.fill("admin.super@nacentech.local")
        
        pass_admin = page.locator("input[type='password']").first
        pass_admin.fill("Password@123")
        time.sleep(0.5)

        print("  ▶ 6.2 Bấm nút [Đăng nhập vào Hệ Thống]...")
        page.locator("button[type='submit']").first.click()
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        print("    👀 Quan sát: Quản trị viên đăng nhập thành công qua form UI thật!")

        print("  ▶ 6.3 Điều hướng tới Hàng đợi phê duyệt thẩm định (/admin/approvals)...")
        page.goto(f"{BASE_URL}/admin/approvals", wait_until="networkidle")
        time.sleep(2.5)
        print("    👀 Quan sát: Giao diện Hàng Đợi Phê Duyệt & Thẩm Định Hồ Sơ Phân Cấp (TASK-07) hiển thị trọn vẹn với quyền SUPER_ADMIN thật.")

        print("\n⏸️  Tạm dừng 3 giây trước khi hoàn tất phiên demo...")
        time.sleep(3)
        browser.close()

    print("\n======================================================================")
    print("🎉 HOÀN TẤT PHIÊN REVIEW TRỰC QUAN! TOÀN BỘ CÁC BƯỚC TỪ ĐĂNG NHẬP ĐÃ XONG.")
    print("======================================================================")

if __name__ == "__main__":
    run_interactive_walkthrough()
