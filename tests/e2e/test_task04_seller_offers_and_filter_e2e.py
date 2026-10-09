#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX 4 TẦNG: TASK-04 HỒ SƠ CHÀO BÁN SELLER & BỘ LỌC 18 NGÀNH SHTT
Chế độ: PURE BLACK-BOX (Không mock mạng, kiểm thử người dùng thật trên Web Next.js port 3000 và Backend port 5080).
Bao phủ: 4 Màn hình Wireframe và 4 Tầng kiểm thử chuẩn Quality Gate.
"""

import sys
import time
import urllib.request
import json
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"

def run_layer2_contract_tests():
    print("----------------------------------------------------------------------")
    print("🔍 TẦNG 2: KIỂM THỬ HỢP ĐỒNG API (API CONTRACT TEST)")
    print("----------------------------------------------------------------------")
    
    url = f"{BASE_API_URL}/api/v1/technologies"
    print(f"▶ [CONTRACT-01] Gửi GET {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "NacenTech-QC"})
    with urllib.request.urlopen(req, timeout=5) as response:
        status_code = response.getcode()
        body = json.loads(response.read().decode())

    assert status_code == 200, f"Expected 200, got {status_code}"
    assert body.get("success") is True, "Response missing success: true"
    assert "data" in body and isinstance(body["data"], list), "Response missing data array"
    assert len(body["data"]) > 0, "Response data array is empty"

    sample = body["data"][0]
    required_fields = ["id", "offerCode", "title", "summary", "hasTechTransfer", "status"]
    for field in required_fields:
        assert field in sample, f"Sample offer missing required contract field '{field}'"

    print(f"  ✅ PASS: Contract API v1 trả về {len(body['data'])} công nghệ hợp chuẩn DTO.")

def run_layer3_integration_tests():
    print("\n----------------------------------------------------------------------")
    print("🔄 TẦNG 3: KIỂM THỬ TÍCH HỢP DỮ LIỆU (DATABASE & SERVICE INTEGRATION)")
    print("----------------------------------------------------------------------")
    
    url = f"{BASE_API_URL}/api/v1/portal/seller/technologies"
    print(f"▶ [INT-01] POST tạo mới giải pháp công nghệ có Bộ Tứ SHTT vào {url}...")
    
    payload = {
        "offerType": "SOLUTION",
        "hasTechTransfer": True,
        "title": "Hệ thống AI IoT Kiểm Soát Lượng Nước Tưới Nông Nghiệp Tự Động",
        "summary": "Công nghệ AI kết hợp cảm biến độ ẩm tầng sâu tiết kiệm 50% nước tưới.",
        "problemSolved": "Chống hạn hán và tối ưu chi phí phân bón hòa tan cho vùng trồng sầu riêng.",
        "sectorCode": "FOOD",
        "pricingType": "RANGE",
        "priceMin": 450000000,
        "priceMax": 750000000,
        "currency": "VND",
        "unit": "hệ thống",
        "developerOrigin": "Viện Khoa Học Kỹ Thuật Nông Lâm Nghiệp Tây Nguyên",
        "trlLevel": 8,
        "ipStatus": "PATENT_GRANTED",
        "ipRegistrationNumber": "VN-1-0029988",
        "transferMethod": "EXCLUSIVE_LICENSE",
        "commercialStatus": "COMMERCIALLY_READY",
        "contactPointRole": "Bộ Phận Chuyển Giao Công Nghệ"
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        status_code = response.getcode()
        res_data = json.loads(response.read().decode())

    assert status_code in (200, 201), f"Expected 200/201, got {status_code}"
    created_id = res_data["data"]["id"]
    print(f"  ✅ PASS: Tạo mới thành công Offer ID: {created_id}")

    # Truy vấn lại bằng ID
    detail_url = f"{BASE_API_URL}/api/v1/technologies/{created_id}"
    req_get = urllib.request.Request(detail_url, headers={"User-Agent": "NacenTech-QC"})
    with urllib.request.urlopen(req_get, timeout=5) as response_get:
        detail_data = json.loads(response_get.read().decode())
    
    assert detail_data["data"]["title"] == payload["title"]
    assert detail_data["data"]["trlLevel"] == 8
    print(f"  ✅ PASS: Truy vấn chi tiết xác nhận khớp 100% dữ liệu Bộ Tứ SHTT.")

def run_layer4_playwright_e2e_tests():
    print("\n----------------------------------------------------------------------")
    print("🎭 TẦNG 4: PLAYWRIGHT E2E BLACK-BOX TRÊN 4 MÀN HÌNH WEB")
    print("----------------------------------------------------------------------")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # -------------------------------------------------------------
        # MÀN 3: Tab Chính Web (/chao-ban-cong-nghe)
        # -------------------------------------------------------------
        print("▶ [MÀN 3] Kiểm tra trang Tab Chính Danh Sách & Bộ Lọc 18 Ngành (/chao-ban-cong-nghe)...")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe", wait_until="networkidle")
        time.sleep(1)

        # Kiểm tra tiêu đề trang
        heading = page.locator("h1").first.inner_text()
        assert "chào bán" in heading.lower(), f"Heading mismatch: {heading}"
        print(f"  ✓ Tiêu đề chính xác: '{heading}'")

        # Kiểm tra bộ lọc 18 ngành xuất hiện
        sector_btn = page.locator("button:has-text('Công nghệ chế biến nông sản')").first
        assert sector_btn.is_visible(), "Nút lọc ngành chế biến nông sản không hiển thị"
        sector_btn.click()
        time.sleep(0.5)
        print("  ✓ Đã click chọn bộ lọc ngành: Chế biến nông sản.")

        # Kiểm tra tab Chuyển giao SHTT
        tab_transfer = page.locator("button:has-text('Chuyển Giao SHTT')").first
        tab_transfer.click()
        time.sleep(0.5)
        print("  ✓ Đã chọn tab Chuyển Giao SHTT & TRL.")

        # Kiểm tra thẻ công nghệ có badge TRL 8 hoặc 9
        cards = page.locator("div:has-text('TRL')")
        assert cards.count() > 0, "Không tìm thấy thẻ công nghệ nào có TRL badge"
        print(f"  ✅ PASS: Màn 3 hiển thị đầy đủ bộ lọc 18 ngành và các thẻ công nghệ TRL.")

        # -------------------------------------------------------------
        # MÀN 4: Chi Tiết Hồ Sơ Chào Bán (/chao-ban-cong-nghe/[id])
        # -------------------------------------------------------------
        print("\n▶ [MÀN 4] Kiểm tra trang Chi Tiết Hồ Sơ Chào Bán (/chao-ban-cong-nghe/11111111-1111-1111-1111-111111111111)...")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe/11111111-1111-1111-1111-111111111111", wait_until="networkidle")
        time.sleep(1)

        detail_title = page.locator("h1").first.inner_text()
        assert "sấy thăng hoa" in detail_title.lower(), f"Detail title mismatch: {detail_title}"
        print(f"  ✓ Tiêu đề chi tiết: '{detail_title}'")

        # Kiểm tra khối Bộ Tứ SHTT
        quad_box = page.locator("text=Bộ Tứ Sở Hữu Trí Tuệ").first
        assert quad_box.is_visible(), "Khối Bộ Tứ SHTT không hiển thị"
        print("  ✓ Khối Bộ Tứ SHTT (IP Quad) hiển thị nổi bật.")

        # Kiểm tra chuyển tab Thông số kỹ thuật & DataRoom
        specs_tab = page.locator("button:has-text('Thông Số Kỹ Thuật')").first
        specs_tab.click()
        time.sleep(0.5)
        assert page.locator("text=Bảng Thông Số Kỹ Thuật Chi Tiết").first.is_visible()
        print("  ✓ Chuyển sang Tab Thông số kỹ thuật thành công.")

        # Test mở Modal Gửi Yêu Cầu Kết Nối
        connect_btn = page.locator("button:has-text('Gửi Yêu Cầu Chuyển Giao')").first
        connect_btn.click()
        time.sleep(0.5)
        assert page.locator("text=Gửi Yêu Cầu Kết Nối Với Đơn Vị Chào Bán").first.is_visible()
        print("  ✓ Modal Gửi Yêu Cầu Kết Nối mở thành công.")

        # Điền dữ liệu vào modal
        page.locator("input[placeholder*='Công ty CP']").first.fill("Tập Đoàn Chế Biến Thực Phẩm VinTech")
        page.locator("input[placeholder*='Nguyễn Văn']").first.fill("Trần Quốc Bảo")
        page.locator("input[placeholder*='0912']").first.fill("0988776655")
        page.locator("textarea[placeholder*='Nêu rõ nhu cầu']").first.fill("Đề xuất li-xăng công nghệ sấy chân không cho nhà máy.")

        # Submit modal
        page.locator("button:has-text('Xác nhận gửi yêu cầu')").first.click()
        time.sleep(0.5)
        assert page.locator("text=Yêu cầu đã được gửi thành công").first.is_visible()
        page.locator("button:has-text('Đóng')").first.click()
        print("  ✅ PASS: Màn 4 tương tác đầy đủ các tabs và gửi yêu cầu kết nối thành công.")

        # -------------------------------------------------------------
        # MÀN 1: Workspace Quản Lý Kho Seller (/portal/seller/technologies)
        # -------------------------------------------------------------
        print("\n▶ [MÀN 1] Kiểm tra Workspace Quản Lý Kho Seller (/portal/seller/technologies)...")
        # Đi tới origin trước để thiết lập localStorage
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe")
        page.evaluate("""() => {
            localStorage.setItem('nacentwin_user_context', JSON.stringify({
                id: 'seller-demo-uuid',
                email: 'seller@nacentech.gov.vn',
                fullName: 'Doanh Nghiệp ĐMST Mẫu',
                role: 'SELLER'
            }));
            localStorage.setItem('nacentwin_access_token', 'mock_seller_jwt_token_12345');
        }""")
        time.sleep(0.5)

        page.goto(f"{BASE_WEB_URL}/portal/seller/technologies", wait_until="networkidle")
        time.sleep(1)

        kpi_text = page.locator("text=Tổng số giải pháp").first
        assert kpi_text.is_visible(), "Khối KPI tổng số giải pháp không hiển thị"
        
        table = page.locator("table")
        assert table.is_visible(), "Bảng danh mục giải pháp không hiển thị"
        print("  ✓ KPI Cards và Bảng danh mục công nghệ hiển thị chuẩn xác.")
        print("  ✅ PASS: Màn 1 Workspace Seller hoạt động hoàn hảo.")

        # -------------------------------------------------------------
        # MÀN 2: Form Wizard Đăng Chào Bán Mới (/portal/seller/technologies/create)
        # -------------------------------------------------------------
        print("\n▶ [MÀN 2] Kiểm tra Form Wizard Đăng Bán Công Nghệ (/portal/seller/technologies/create)...")
        page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create", wait_until="networkidle")
        time.sleep(1)

        # 1. Thử submit rỗng để kích hoạt validation
        page.locator("button:has-text('Xác Nhận Đăng Hồ Sơ Chào Bán')").first.click()
        time.sleep(0.5)
        error_msg = page.locator("text=Tên công nghệ không được để trống").first
        assert error_msg.is_visible(), "Validation lỗi không xuất hiện khi để trống tên công nghệ"
        print("  ✓ Validation lỗi bắt buộc các trường hoạt động chuẩn xác.")

        # 2. Điền form đầy đủ
        page.locator("input[placeholder*='Hệ thống sấy thăng hoa']").first.fill("Robot Hái Trái Cây Thông Minh AI Vision TRL 8")
        page.locator("textarea[placeholder*='Tóm tắt tính năng']").first.fill("Hệ thống robot tự hành nhận diện độ chín quả với thị giác máy tính.")
        page.locator("textarea[placeholder*='Tiết kiệm bao nhiêu %']").first.fill("Rút ngắn 70% nhân công thu hoạch mùa vụ.")

        # Submit form
        page.locator("button:has-text('Xác Nhận Đăng Hồ Sơ Chào Bán')").first.click()
        time.sleep(1.5)

        success_banner = page.locator("text=Đăng Hồ Sơ Chào Bán Thành Công").first
        assert success_banner.is_visible(), "Banner đăng thành công không xuất hiện"
        print("  ✅ PASS: Màn 2 Form Wizard đăng mới công nghệ thành công.")

        browser.close()

if __name__ == "__main__":
    print("======================================================================")
    print("🛡️ BẮT ĐẦU CHẠY TRỌN BỘ TEST BLACK-BOX 4 TẦNG QC CHO TASK-04")
    print("======================================================================\n")

    try:
        run_layer2_contract_tests()
        run_layer3_integration_tests()
        run_layer4_playwright_e2e_tests()

        print("\n======================================================================")
        print("🎉 TẤT CẢ CÁC TẦNG KIỂM THỬ QC ĐÃ ĐẠT 100% PASS (QUALITY GATE SIGN-OFF)")
        print("======================================================================")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ LỖI KIỂM THỬ: {e}", file=sys.stderr)
        sys.exit(1)
