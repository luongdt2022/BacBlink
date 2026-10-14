"""
=============================================================================
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-04 SELLER TECH OFFER & IP QUAD
=============================================================================
ĐẶC TẢ NGHIỆP VỤ & KIỂM CHỨNG:
1. Đăng nhập Nhà cung cấp công nghệ (SELLER) qua form thật (/auth/login).
2. Điều hướng tới Form Tạo hồ sơ Chào bán (/portal/seller/technologies/create).
3. Khai báo giải pháp công nghệ mới:
   - Loại chào bán: SOLUTION (Giải pháp công nghệ).
   - Lĩnh vực TT17: LV07 (Cơ khí - chế tạo - công nghiệp hỗ trợ).
   - Tên công nghệ: 'Robot hàn tự động thông minh tích hợp AI Vision NacenTwin-R1'.
   - Bộ tứ SHTT (IP Quad): Đơn vị R&D, TRL Level = 8, IP Status = PATENT (Bằng độc quyền sáng chế),
     Số bằng SHTT = 'VN-1-0038921', Phương thức chuyển giao = NON_EXCLUSIVE_LICENSE, Trạng thái = COMMERCIALLY_READY.
   - Chính sách giá: RANGE (Giá từ 1.2 tỷ - 2.5 tỷ VND).
   - Phân cấp Cấp 2: Quản lý tiếp nhận thẩm định: Sở Khoa học và Công nghệ TP. Hà Nội (VN-HN).
   - Cam kết pháp lý & Sở hữu trí tuệ: Tích chọn legal consent.
4. Bấm nộp hồ sơ 'Xác Nhận Đăng Hồ Sơ Chào Bán'.
5. Xác nhận thành công và điều hướng về danh sách /portal/seller/technologies.
6. [Deep DB State Verification]:
   - Truy vấn trực tiếp PostgreSQL `technology.seller_technology_offers`.
   - Đối soát 1:1: title, sector_code, trl_level, ip_status, status='PENDING', legal_consent=true, managing_authority_id='VN-HN'.
7. Dọn dẹp dữ liệu thử nghiệm trong CSDL sau khi kiểm chứng thành công.
=============================================================================
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
UNIQUE_TITLE = f"Robot hàn thông minh AI Vision NacenTwin-R1 QA-{int(time.time())}"

def query_db(sql: str) -> str:
    res = subprocess.run(
        ["docker", "exec", "nacentech-postgres-1", "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql],
        capture_output=True,
        text=True,
        check=True
    )
    return res.stdout.strip()

def main():
    print("=" * 70)
    print("🎯 KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-04 SELLER TECH OFFER")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # STEP 1: Đăng nhập vai trò SELLER
        print("\n▶ [STEP 1] Đăng nhập tài khoản SELLER (seller.user@demo.nacentech.vn)...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_selector('input[type="email"]', timeout=10000)
        page.fill('input[type="email"]', "seller.user@demo.nacentech.vn")
        page.fill('input[type="password"]', "Password@123")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')

        # Chờ điều hướng sau khi login
        page.wait_for_url(lambda url: "/portal" in url, timeout=15000)
        print("  ✅ Đăng nhập SELLER thành công qua giao diện thật.")

        # STEP 2: Mở Form Tạo Hồ Sơ Chào Bán Công Nghệ
        print("\n▶ [STEP 2] Mở Form Tạo Hồ Sơ Chào Bán (/portal/seller/technologies/create)...")
        page.goto(f"{BASE_URL}/portal/seller/technologies/create")
        page.wait_for_selector("text=Biểu Mẫu Chào Bán & Chuyển Giao SHTT", timeout=10000)
        print("  ✅ Form đăng tải công nghệ tải thành công.")

        # STEP 3: Điền các thông tin của Hồ sơ chào bán
        print("\n▶ [STEP 3] Điền thông tin Giải pháp & Bộ Tứ SHTT (IP Quad)...")
        
        # Chọn Lĩnh vực
        page.select_option("select:has(option[value='LV07'])", "LV07")

        # Tên công nghệ
        page.fill("input[placeholder*='VD: Hệ thống sấy thăng hoa']", UNIQUE_TITLE)

        # Tóm tắt
        page.fill("textarea[placeholder*='Tóm tắt tính năng']", "Robot hàn 6 trục công nghiệp tốc độ cao tích hợp AI Vision tự động nhận diện mối hàn với sai số cực nhỏ < 0.02mm.")

        # Bài toán giải quyết
        page.fill("textarea[placeholder*='Tiết kiệm bao nhiêu % chi phí']", "Giảm 60% tỷ lệ phế phẩm mối hàn, tăng năng suất xưởng cơ khí lên 3.5 lần, thay thế thợ hàn bậc cao.")

        # Bộ tứ SHTT: Đơn vị R&D
        page.fill("input[placeholder*='VD: Viện Hàn lâm']", "Viện Công Nghệ NacenTech & Phòng Lab Cơ Điện Tử")

        # Mức TRL: 8
        page.select_option("select:has(option[value='8'])", "8")

        # Tình trạng văn bằng SHTT: PATENT_GRANTED (Bằng độc quyền sáng chế)
        page.select_option("select:has(option[value='PATENT_GRANTED'])", "PATENT_GRANTED")

        # Số văn bằng SHTT
        page.fill("input[placeholder*='VD: VN-1-0028491']", "VN-1-0038921")

        # Hình thức chuyển giao
        page.select_option("select:has(option[value='NON_EXCLUSIVE_LICENSE'])", "NON_EXCLUSIVE_LICENSE")

        # Trạng thái thương mại hóa
        page.select_option("select:has(option[value='COMMERCIALLY_READY'])", "COMMERCIALLY_READY")

        # Khoảng giá: 1,200,000,000 - 2,500,000,000 VND
        page.fill("input[placeholder*='800000000']", "1200000000")
        page.fill("input[placeholder*='1500000000']", "2500000000")

        # Chọn Sở KH&CN tiếp nhận: VN-HN
        page.select_option("select:has(option[value='VN-HN'])", "VN-HN")

        # Tích chọn Cam kết pháp lý & SHTT
        legal_check = page.locator("#legal-consent-check")
        if not legal_check.is_checked():
            legal_check.check()
        print("  ✅ Đã điền đầy đủ 100% trường dữ liệu chuẩn hoá & tích cam kết pháp lý.")

        # STEP 4: Submit form
        print("\n▶ [STEP 4] Bấm nút 'Xác Nhận Đăng Hồ Sơ Chào Bán'...")
        submit_btn = page.locator("button:has-text('Xác Nhận Đăng Hồ Sơ Chào Bán')")
        submit_btn.click()

        # Chờ redirect về trang danh sách (chính xác /portal/seller/technologies, không phải /create)
        page.wait_for_url(lambda url: url.rstrip("/").endswith("/portal/seller/technologies"), timeout=15000)
        print("  🎉 Frontend tiếp nhận thành công và điều hướng về: /portal/seller/technologies")

        # STEP 5: Đối soát trực tiếp vào PostgreSQL
        print("\n▶ [STEP 5] Deep DB State Verification trong CSDL PostgreSQL (technology.seller_technology_offers)...")
        sql_check = f"""
            SELECT id, offer_code, title, sector_code, trl_level, ip_status, ip_registration_number, status, managing_authority_id, legal_consent
            FROM technology.seller_technology_offers
            WHERE title = '{UNIQUE_TITLE}';
        """
        db_record = ""
        for _ in range(10):
            db_record = query_db(sql_check)
            if db_record:
                break
            time.sleep(0.5)

        assert db_record, f"❌ KHÔNG TÌM THẤY HỒ SƠ '{UNIQUE_TITLE}' TRONG CSDL!"

        fields = db_record.split("|")
        offer_id, offer_code, title, sector, trl, ip_st, ip_num, status, auth_id, legal = fields

        print(f"  ✅ [CSDL ĐÃ LƯU]: Id={offer_id} | Code={offer_code}")
        print(f"  ✅ [THUỘC TÍNH SHTT]: Lĩnh vực={sector} | TRL={trl} | IP={ip_st} ({ip_num})")
        print(f"  ✅ [TRẠNG THÁI PHÊ DUYỆT]: Status={status} (Chờ Sở KH&CN thẩm định) | Sở tiếp nhận={auth_id} | LegalConsent={legal}")

        assert sector == "LV07", f"Lệch sector: {sector}"
        assert trl == "8", f"Lệch TRL: {trl}"
        assert ip_st == "PATENT_GRANTED", f"Lệch IP: {ip_st}"
        assert status == "PENDING", f"Lệch Status: {status}"
        assert auth_id == "VN-HN", f"Lệch Authority: {auth_id}"
        assert legal.lower() in ("t", "true"), f"Lệch Legal Consent: {legal}"

        # STEP 6: Dọn dẹp dữ liệu kiểm thử
        print("\n▶ [STEP 6] Dọn dẹp dữ liệu kiểm thử trong CSDL...")
        query_db(f"DELETE FROM technology.seller_technology_offers WHERE id = '{offer_id}';")
        print(f"  [Cleanup] Đã dọn dẹp bản ghi {offer_code} an toàn.")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 KẾT LUẬN: TASK-04 100% PASS (SELLER TECH OFFER & IP QUAD GREEN)")
    print("=" * 70)

if __name__ == "__main__":
    main()
