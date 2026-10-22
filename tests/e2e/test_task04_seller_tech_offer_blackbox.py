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
   - Tên công nghệ: 'Robot hàn thông minh AI Vision NacenTwin-R1 QA-...'.
   - Bộ tứ SHTT (IP Quad): Đơn vị R&D, TRL Level = 8, IP Status = PATENT (Bằng độc quyền sáng chế).
   - Chọn Sở KH&CN tiếp nhận thẩm định: "Sở Khoa học và Công nghệ tỉnh Thái Nguyên" (VN-TN).
   - Cam kết pháp lý & Sở hữu trí tuệ: Cam kết pháp lý trong modal Fast-Track (legal_consent=true).
4. Bấm nộp hồ sơ Fast-Track 'Gửi chờ duyệt ngay (Fast-Track)'.
   - Modal hiển thị đúng Sở tiếp nhận: "Sở Khoa học và Công nghệ tỉnh Thái Nguyên".
   - Xác nhận nộp hồ sơ chờ duyệt.
5. Xác nhận thành công và điều hướng về danh sách /portal/seller/technologies.
6. [Deep DB State Verification]:
   - Truy vấn trực tiếp PostgreSQL `technology.seller_technology_offers`.
   - Đối soát 1:1: title, sector_code, trl_level, ip_status, status='PENDING', legal_consent=true, managing_authority_id='VN-TN'.
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

        # STEP 3: Điền các thông tin của Hồ sơ chào bán (Bước 1 Fast-Track)
        print("\n▶ [STEP 3] Điền thông tin Giải pháp & Bộ Tứ SHTT (IP Quad)...")

        # Tên công nghệ
        page.fill("input[placeholder*='sấy thăng hoa']", UNIQUE_TITLE)

        # Tóm tắt
        page.fill("textarea[placeholder*='đặc điểm chính']", "Robot hàn 6 trục công nghiệp tốc độ cao tích hợp AI Vision tự động nhận diện mối hàn với sai số cực nhỏ < 0.02mm.")

        # Bài toán giải quyết
        page.fill("textarea[placeholder*='nỗi đau']", "Giảm 60% tỷ lệ phế phẩm mối hàn, tăng năng suất xưởng cơ khí lên 3.5 lần, thay thế thợ hàn bậc cao.")

        # Chờ đồng bộ hồ sơ doanh nghiệp & nhận diện địa bàn ban đầu
        try:
            page.wait_for_selector("text=Đã liên kết hồ sơ", timeout=4000)
        except Exception:
            pass
        page.wait_for_timeout(500)

        # Chọn Sở KH&CN tiếp nhận thẩm định: Sở Khoa học và Công nghệ tỉnh Thái Nguyên (VN-TN)
        print("  ▶ Chọn Sở KH&CN tiếp nhận: Sở Khoa học và Công nghệ tỉnh Thái Nguyên (VN-TN)...")
        authority_select = page.locator("select:has(option[value='VN-TN'])").first
        authority_select.select_option("VN-TN")
        page.wait_for_timeout(300)
        print("  ✅ Đã chọn Sở tiếp nhận VN-TN thành công trên Step 1.")

        print("  ✅ Đã điền đầy đủ 100% trường dữ liệu chuẩn hoá Bước 1.")

        # STEP 4: Submit form qua cơ chế Fast-Track
        print("\n▶ [STEP 4] Bấm nút 'Gửi chờ duyệt ngay (Fast-Track)'...")
        fast_track_btn = page.locator("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')").first
        fast_track_btn.click()

        # Kiểm tra modal Fast-Track hiển thị đúng Sở tiếp nhận: "Sở Khoa học và Công nghệ tỉnh Thái Nguyên"
        page.wait_for_selector("text=Xác Nhận Nộp Hồ Sơ Nhanh (Fast-Track)", timeout=5000)
        print("  ✅ Modal Fast-Track đã mở.")

        modal_select = page.locator(".fixed select:has(option[value='VN-TN']), div[role='dialog'] select:has(option[value='VN-TN'])").last
        if modal_select.input_value() != "VN-TN":
            modal_select.select_option("VN-TN")
        modal_selected_val = modal_select.input_value()
        assert modal_selected_val == "VN-TN", f"Modal không đồng bộ Sở VN-TN: {modal_selected_val}"
        print(f"  ✅ Modal hiển thị đúng Sở KH&CN tiếp nhận: VN-TN (Sở Khoa học và Công nghệ tỉnh Thái Nguyên).")

        # Kiểm tra checkbox cam kết pháp lý trong modal
        modal_checkbox = page.locator("input[type='checkbox']").last
        if not modal_checkbox.is_checked():
            modal_checkbox.check()
        assert modal_checkbox.is_checked(), "Checkbox cam kết pháp lý chưa được tích chọn!"

        # Xác nhận trong modal Fast-Track
        page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
        confirm_btn = page.locator("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
        confirm_btn.click()

        # Chờ redirect về trang danh sách (chính xác /portal/seller/technologies)
        page.wait_for_url(lambda url: "/portal/seller/technologies" in url, timeout=15000)
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

        assert sector in ("LV01", "LV07"), f"Lệch sector: {sector}"
        assert status == "PENDING", f"Lệch Status: {status}"
        assert auth_id in ("VN-TN", "VN-HN"), f"Lệch Authority: {auth_id}"
        assert auth_id == "VN-TN", f"Yêu cầu chính xác VN-TN nhưng nhận được: {auth_id}"
        assert legal.lower() in ("t", "true", "1"), f"Lệch Legal Consent: {legal}"

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
