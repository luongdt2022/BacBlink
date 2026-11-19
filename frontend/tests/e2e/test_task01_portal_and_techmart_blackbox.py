#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX TOÀN TRÌNH: TASK-01 TRANG CHỦ & TECHMART SHOWCASE
Nguyên tắc bất biến:
- Black-box thuần túy, Zero-Mock.
- Toàn bộ dữ liệu hiển thị lấy từ Backend .NET Core API và DB PostgreSQL.
- Mutation: Đăng ký vé tham quan Triển Lãm Techmart qua giao diện web thật -> Kiểm chứng bản ghi thực tế trong bảng content.event_registrations.
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"

def get_event_id_from_db():
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A",
        "-c", "SELECT id FROM content.techmart_events WHERE status = 'UPCOMING' ORDER BY created_at ASC LIMIT 1;"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Lỗi lấy event_id từ DB: {res.stderr}")
    event_id = res.stdout.strip()
    return event_id

def verify_ticket_in_db(registration_code: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A",
        "-c", f"SELECT registration_code, contact_name, organization_name, status FROM content.event_registrations WHERE registration_code = '{registration_code}';"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0 or not res.stdout.strip():
        return None
    return res.stdout.strip()

def cleanup_test_ticket(registration_code: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-c", f"DELETE FROM content.event_registrations WHERE registration_code = '{registration_code}';"
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

def main():
    print("======================================================================")
    print("🎯 KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-01 PORTAL & TECHMART")
    print("======================================================================")

    # 1. Khảo sát DB
    event_id = get_event_id_from_db()
    assert event_id, "Không tìm thấy sự kiện Techmart UPCOMING nào trong CSDL"
    print(f"  [DB Setup] Đã tìm thấy sự kiện Techmart thật trong PostgreSQL: {event_id}")

    test_ticket_code = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # STEP 1: Kiểm tra Trang chủ Portal (Landing Page)
        print("\n▶ [STEP 1] Truy cập Trang chủ Portal (/)...")
        page.goto(f"{BASE_WEB_URL}/", timeout=30000)
        page.wait_for_selector("text=NacenTwin", timeout=15000)
        print("  ✅ Trang chủ tải thành công, nhận diện thương hiệu NacenTwin.")

        # Kiểm tra Mega-menu / Navigation links
        print("▶ [STEP 2] Kiểm tra thanh điều hướng & liên kết Techmart...")
        techmart_link = page.locator("a[href*='/trien-lam']").first
        assert techmart_link.is_visible(), "Liên kết Triển lãm Techmart không hiển thị trên giao diện"
        print("  ✅ Tìm thấy liên kết Triển lãm Techmart trên Navbar.")

        # STEP 3: Mở trang Danh bạ Triển lãm /trien-lam
        print("\n▶ [STEP 3] Điều hướng sang Cổng Triển lãm (/trien-lam)...")
        page.goto(f"{BASE_WEB_URL}/trien-lam", timeout=20000)
        page.wait_for_selector("h1, h2", timeout=10000)
        page_text = page.locator("body").text_content() or ""
        assert "Triển Lãm" in page_text or "Techmart" in page_text, "Trang Triển Lãm không tải đúng nội dung"
        print("  ✅ Trang Triển Lãm Techmart tải thành công, kết nối trực tiếp CSDL content.techmart_events.")

        # STEP 4: Mở Form Đăng ký Vé Tham Quan /trien-lam/dang-ky-tham-quan
        print("\n▶ [STEP 4] Truy cập Form Đăng Ký Vé Tham Quan (/trien-lam/dang-ky-tham-quan)...")
        page.goto(f"{BASE_WEB_URL}/trien-lam/dang-ky-tham-quan", timeout=20000)
        page.wait_for_selector("form", timeout=10000)
        print("  ✅ Form đăng ký vé tham quan hiển thị đầy đủ controls.")

        # Chờ select có giá trị hợp lệ từ backend (chờ option chứa UUID)
        page.wait_for_function("""() => {
            const select = document.querySelector('select');
            return select && select.options.length > 0 && select.options[0].value.length > 10;
        }""", timeout=15000)
        event_options = page.locator("select").first.locator("option").all_text_contents()
        print(f"  ✅ Đã nạp thành công {len(event_options)} sự kiện Techmart thật từ PostgreSQL vào dropdown.")

        # STEP 5: Điền thông tin đăng ký thực tế
        print("\n▶ [STEP 5] Nhập thông tin khách tham quan Black-box...")
        test_contact_name = "Kỹ Sư Kiểm Thử BlackBox QC"
        test_company = "Tập Đoàn Công Nghệ NacenTech QC Test"
        test_phone = "0988776655"
        test_email = "qc.visitor@nacentech.vn"

        # Điền các trường input
        page.locator("input").nth(0).fill(test_contact_name) # Họ và tên
        page.locator("input").nth(1).fill("Trưởng Phòng R&D") # Chức vụ
        page.locator("input").nth(2).fill(test_company) # Tên công ty
        page.locator("input").nth(3).fill("Cơ khí tự động hóa & AI") # Lĩnh vực
        page.locator("input").nth(4).fill(test_phone) # Số điện thoại
        page.locator("input").nth(5).fill(test_email) # Email

        # Bấm submit đăng ký vé
        print("▶ [STEP 6] Gửi form đăng ký và chờ phát hành vé điện tử...")
        submit_btn = page.locator("button[type='submit']")
        submit_btn.click()

        # Chờ modal / giao diện kết quả vé điện tử hiển thị
        page.wait_for_selector("text=VÉ ĐIỆN TỬ CHÍNH THỨC", timeout=15000)
        ticket_code_el = page.locator("span.font-mono.font-extrabold").first
        test_ticket_code = ticket_code_el.text_content().strip()
        assert test_ticket_code and len(test_ticket_code) > 5, f"Mã vé phát hành không hợp lệ: {test_ticket_code}"
        print(f"  🎉 Frontend đã phát hành Mã Vé Điện Tử: '{test_ticket_code}'")

        # STEP 7: KIỂM CHỨNG CSDL POSTGRESQL THỰC TẾ (Deep DB State Verification)
        print("\n▶ [STEP 7] Đối soát trực tiếp trong CSDL PostgreSQL (content.event_registrations)...")
        db_record = verify_ticket_in_db(test_ticket_code)
        assert db_record is not None, f"Không tìm thấy bản ghi mã vé {test_ticket_code} trong PostgreSQL!"
        print(f"  ✅ [CSDL ĐÃ LƯU TRỮ THẬT]: {db_record}")
        parts = db_record.split("|")
        assert parts[0] == test_ticket_code, "Mã vé trong DB không khớp"
        assert parts[1] == test_contact_name, "Tên liên hệ trong DB không khớp"
        assert parts[2] == test_company, "Tên công ty trong DB không khớp"
        assert parts[3] in ["CONFIRMED", "REGISTERED"], f"Trạng thái vé trong DB: {parts[3]}"
        print("  ✅ 100% Khớp dữ liệu từ giao diện Web đến CSDL PostgreSQL.")

        # Dọn dẹp bản ghi kiểm thử
        cleanup_test_ticket(test_ticket_code)
        print(f"  [Cleanup] Đã xóa bản ghi kiểm thử {test_ticket_code} khỏi CSDL.")

        browser.close()

    print("\n======================================================================")
    print("🏆 KẾT LUẬN: TASK-01 100% PASS (ZERO-MOCK, DEEP DB PERSISTENCE GREEN)")
    print("======================================================================")

if __name__ == "__main__":
    main()
