#!/usr/bin/env python3
"""
=============================================================================
QC BLACK-BOX & 4-TIER PLAYWRIGHT E2E SUITE
MODULE: PROFILE UPGRADE HUB (NÂNG HẠNG TÀI KHOẢN 4 LỰA CHỌN)
URL: http://localhost:3000/profile/upgrade
TÀI KHOẢN KIỂM THỬ THẬT: public.user@demo.nacentech.vn (PUBLIC_USER)
KỶ LUẬT: ZERO-MOCK, 100% INTERACTIVE TESTING & DEEP POSTGRESQL STATE VERIFICATION
=============================================================================
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright, expect

BASE_WEB_URL = "http://localhost:3000"
TEST_USER_EMAIL = "public.user@demo.nacentech.vn"
TEST_USER_PASS = "Password@123"

def psql_query(sql: str) -> str:
    """Truy vấn trực tiếp CSDL PostgreSQL container để đối soát Black-Box không qua mock"""
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"PostgreSQL query failed: {res.stderr}")
    return res.stdout.strip()

def log_header(title: str):
    print("\n" + "=" * 80)
    print(f"  {title.upper()}")
    print("=" * 80)

def log_pass(msg: str):
    print(f"  [PASS] {msg}")

def log_fail(msg: str):
    print(f"  [FAIL] {msg}")
    sys.exit(1)

def run_profile_upgrade_hub_blackbox_suite():
    log_header("BẮT ĐẦU KIỂM THỬ 4 TẦNG QC BLACK-BOX: PROFILE UPGRADE HUB (/profile/upgrade)")
    start_time = time.time()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # =====================================================================
        # BƯỚC KHỞI ĐỘNG: ĐĂNG NHẬP THẬT BẰNG TÀI KHOẢN PUBLIC_USER
        # =====================================================================
        log_header("Khởi tạo Phiên Đăng Nhập Thật (Zero-Mock)")
        page.goto(f"{BASE_WEB_URL}/login")
        page.fill('input[type="email"]', TEST_USER_EMAIL)
        page.fill('input[type="password"]', TEST_USER_PASS)
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_timeout(2000)

        # Kiểm tra token trong localStorage
        token = page.evaluate("localStorage.getItem('nacentwin_access_token')")
        if not token:
            log_fail("Không lấy được token sau khi đăng nhập tài khoản thật!")
        log_pass(f"Đăng nhập thành công với tài khoản thật: {TEST_USER_EMAIL}")

        # Truy cập trang Upgrade Hub
        page.goto(f"{BASE_WEB_URL}/profile/upgrade")
        page.wait_for_selector('h1:has-text("Lựa Chọn Lộ Trình Nâng Hạng Tài Khoản")', timeout=5000)
        log_pass("Truy cập thành công giao diện Upgrade Hub tại /profile/upgrade.")

        # =====================================================================
        # CẤP 2: CHỨC NĂNG MÀN HÌNH & ĐỐI SOÁT 1:1 VỚI WIREFRAME BASIC DESIGN
        # =====================================================================
        log_header("Cấp 2: Đối soát Layout Wireframe & 4 Lộ trình Nâng hạng")
        
        # 2.1 Kiểm tra 4 Cards lộ trình (exact headers)
        expect(page.locator('h3:has-text("Chuyên Gia KH&CN")')).to_be_visible()
        expect(page.locator('h3:has-text("Doanh Nghiệp ĐMST")')).to_be_visible()
        expect(page.locator('h3:has-text("Bên Mua (Buyer)")')).to_be_visible()
        expect(page.locator('h3:has-text("Bên Bán (Seller)")')).to_be_visible()
        log_pass("C2.1: Hiển thị đầy đủ 4 Cards tương ứng 4 lộ trình nâng hạng theo chuẩn Wireframe.")

        # 2.2 Kiểm tra Badges phân loại và SLA
        expect(page.locator("text=Học Hàm / Học Vị")).to_be_visible()
        expect(page.locator("text=Pháp Nhân ĐMST")).to_be_visible()
        expect(page.locator("text=Bên Mua Công Nghệ")).to_be_visible()
        expect(page.locator("text=Nhà Cung Ứng")).to_be_visible()
        expect(page.locator("text=SLA 48h").first).to_be_visible()
        expect(page.locator("text=SLA 24h").first).to_be_visible()
        log_pass("C2.2: Hiển thị đầy đủ Badges 3D Scoped RBAC và SLA xử lý cam kết.")

        # 2.3 Kiểm tra Bảng đối soát ma trận thẩm quyền 10 quyền lợi
        expect(page.locator('h3:has-text("Bảng So Sánh Quyền Hạn & Điều Kiện 4 Lộ Trình")')).to_be_visible()
        expect(page.locator("text=Bằng cấp học vị, công bố Scopus/ISI")).to_be_visible()
        expect(page.locator("text=Mã số thuế hợp lệ, Giấy chứng nhận ĐKKD")).to_be_visible()
        expect(page.locator("text=Phiếu khảo sát nhu cầu chuyên sâu DNNVV 7 phần")).to_be_visible()
        expect(page.locator("text=Hồ sơ năng lực đơn vị R&D, danh mục công nghệ")).to_be_visible()
        log_pass("C2.3: Bảng so sánh ma trận thẩm quyền 4 lộ trình render trực quan và chuẩn xác.")

        # =====================================================================
        # CẤP 3: ROUTING TƯƠNG TÁC THỰC TẾ (CHUYÊN GIA & BÊN MUA)
        # =====================================================================
        log_header("Cấp 3: Kiểm thử Hành vi Routing Chuyển Hướng Thực Tế")

        # 3.1 Nút điều hướng Chuyên gia -> /profile/upgrade/expert
        expert_link = page.locator('a:has-text("Nâng hạng Chuyên gia (3 Bước)")').first
        expect(expert_link).to_be_visible()
        expect(expert_link).to_have_attribute("href", "/profile/upgrade/expert")
        log_pass("C3.1: Thẻ Chuyên gia chứa đường link chuyển hướng chuẩn tới /profile/upgrade/expert.")

        # 3.2 Nút điều hướng Bên Mua -> /khao-sat-nhu-cau
        buyer_link = page.locator('a:has-text("Khảo Sát Nhu Cầu & Bài Toán (7 Bước)")').first
        expect(buyer_link).to_be_visible()
        expect(buyer_link).to_have_attribute("href", "/khao-sat-nhu-cau")
        log_pass("C3.2: Thẻ Bên Mua chứa đường link chuyển hướng chuẩn tới /khao-sat-nhu-cau.")

        # =====================================================================
        # CẤP 1: MICRO CONTROLS & TAX LOOKUP VALIDATION (DOANH NGHIỆP ĐMST)
        # =====================================================================
        log_header("Cấp 1: Kiểm thử Micro Controls, Validation & Tra cứu MST")

        # 1.1 Mở Modal Doanh nghiệp ĐMST
        page.click('button:has-text("Xác thực MST Doanh Nghiệp")')
        page.wait_for_selector('h3:has-text("Nâng Cấp Hồ Sơ — Doanh Nghiệp ĐMST")', timeout=3000)
        log_pass("C1.1: Mở thành công Modal Doanh nghiệp ĐMST.")

        # 1.2 Tra cứu MST trống
        page.click('button:has-text("Tra Cứu MST")')
        expect(page.locator("text=Vui lòng nhập Mã số thuế để tra cứu.")).to_be_visible()
        log_pass("C1.2: Chặn tra cứu và hiển thị thông báo lỗi khi ô MST trống.")

        # 1.3 Nhập MST 0109998888 và bấm Tra Cứu
        page.fill('input[placeholder="0101234567"]', "0109998888")
        page.click('button:has-text("Tra Cứu MST")')
        page.wait_for_selector('text=Đã tìm thấy dữ liệu doanh nghiệp hợp lệ từ CSDL ĐKKD Quốc Gia', timeout=4000)
        
        # Tên doanh nghiệp tự động điền
        company_input_val = page.input_value('input[placeholder="Công ty TNHH Phát Triển Công Nghệ & ĐMST"]')
        assert "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST QUỐC GIA" in company_input_val, f"Lỗi tên DN: {company_input_val}"
        log_pass(f"C1.3: Tra cứu MST thành công và tự động điền tên DN: {company_input_val}")

        # =====================================================================
        # CẤP 4: TOÀN TRÌNH SUBMIT DOANH NGHIỆP ĐMST & ĐỐI SOÁT CSDL POSTGRESQL
        # =====================================================================
        log_header("Cấp 4: Nộp Hồ Sơ Doanh Nghiệp ĐMST & Đối Soát PostgreSQL")

        # Tick cam kết pháp lý
        page.check('input#legalPledgeEnt')
        log_pass("C4.1: Đã tick cam kết pháp lý Doanh nghiệp ĐMST.")

        # Bấm gửi hồ sơ thẩm định
        page.click('button:has-text("Gửi Hồ Sơ Thẩm Định")')
        page.wait_for_selector('h4:has-text("Nộp Hồ Sơ Doanh Nghiệp ĐMST Thành Công")', timeout=6000)
        
        # Lấy tracking code trên notice banner
        feedback_code = page.locator('span:has-text("REQ-INST-")').inner_text()
        assert feedback_code.startswith("REQ-INST-"), f"Mã tracking không hợp lệ: {feedback_code}"
        log_pass(f"C4.2: Nhận mã hồ sơ Doanh nghiệp ĐMST thành công: {feedback_code}")

        # ĐỐI SOÁT CSDL POSTGRESQL THẬT
        db_count = psql_query(
            "SELECT count(*) FROM identity.approval_requests "
            "WHERE request_type='INSTITUTION' AND status='PENDING_REVIEW' "
            "AND user_id='9baa0040-f670-47ee-b1f7-02d7b41d5ac3';"
        )
        assert int(db_count) >= 1, f"LỖI HỒNG HỘC CSDL: Không tìm thấy bản ghi INSTITUTION trong approval_requests! (count={db_count})"
        log_pass(f"C4.3: ĐỐI SOÁT CSDL POSTGRESQL THÀNH CÔNG: Bản ghi INSTITUTION đã lưu trong identity.approval_requests (Tổng số: {db_count})")

        # =====================================================================
        # CẤP 4 (TIẾP TỤC): NỘP HỒ SƠ GIAN HÀNG SELLER & ĐỐI SOÁT CSDL POSTGRESQL
        # =====================================================================
        log_header("Cấp 4: Đăng Ký Mở Gian Hàng Seller & Đối Soát PostgreSQL")

        # 4.4 Mở Modal Seller
        page.click('button:has-text("Đăng Ký Gian Hàng Seller")')
        page.wait_for_selector('h3:has-text("Đăng Ký Mở Gian Hàng — Bên Bán (Seller)")', timeout=3000)
        log_pass("C4.4: Mở thành công Modal Seller.")

        # Điền thông tin Seller thật
        page.fill('input[placeholder="Viện Nghiên cứu & Phát triển Công nghệ Nano"]', "Viện Tự Động Hóa & Thiết Bị Đo NacenTech")
        page.select_option('select >> nth=0', "LV08") # Tự động hóa & Robot
        page.fill('textarea[placeholder*="Tóm tắt các sáng chế"]', "Đơn vị nghiên cứu chuyên sâu về cảm biến IoT và thiết bị đo kiểm chuẩn quốc gia.")
        page.check('input#sellerPledgeCheck')
        log_pass("C4.5: Điền đầy đủ thông tin Seller, chọn ngành TT17 và tick cam kết SLA 24h.")

        # Nộp đơn Seller
        page.click('button:has-text("Nộp Đơn Đăng Ký (SLA 24h)")')
        page.wait_for_selector('h4:has-text("Đăng Ký Mở Gian Hàng Seller Thành Công")', timeout=6000)
        
        seller_tracking_code = page.locator('span:has-text("REQ-SHOP-")').inner_text()
        assert seller_tracking_code.startswith("REQ-SHOP-"), f"Mã tracking Seller không hợp lệ: {seller_tracking_code}"
        log_pass(f"C4.6: Nhận mã yêu cầu mở gian hàng Seller thành công: {seller_tracking_code}")

        # ĐỐI SOÁT CSDL POSTGRESQL THẬT
        db_shop_count = psql_query(
            "SELECT count(*) FROM identity.approval_requests "
            "WHERE request_type='SHOP' AND status='PENDING_REVIEW' "
            "AND user_id='9baa0040-f670-47ee-b1f7-02d7b41d5ac3';"
        )
        assert int(db_shop_count) >= 1, f"LỖI HỒNG HỘC CSDL: Không tìm thấy bản ghi SHOP trong approval_requests! (count={db_shop_count})"
        log_pass(f"C4.7: ĐỐI SOÁT CSDL POSTGRESQL THÀNH CÔNG: Bản ghi SHOP đã lưu trong identity.approval_requests (Tổng số: {db_shop_count})")

        browser.close()

    elapsed = round(time.time() - start_time, 2)
    log_header(f"TẤT CẢ 4 CẤP ĐỘ QC BLACK-BOX ĐÃ HOÀN TẤT VÀ PASS 100% (Thời gian: {elapsed}s)")

if __name__ == "__main__":
    run_profile_upgrade_hub_blackbox_suite()
