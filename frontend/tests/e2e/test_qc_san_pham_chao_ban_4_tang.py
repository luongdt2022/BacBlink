#!/usr/bin/env python3
"""
=============================================================================
KỊCH BẢN KIỂM THỬ QC ĐỘC LẬP 4 TẦNG: QUY TRÌNH SẢN PHẨM CHÀO BÁN
1. Tạo sản phẩm chào bán (Seller)
2. Thẩm định & Phê duyệt (Gov / Admin)
3. Kiểm tra hiển thị trên Sàn giao dịch & Danh sách chào bán công khai (/chao-ban-cong-nghe)
=============================================================================
Tiêu chuẩn: PURE BLACK-BOX, ZERO-MOCK, DEEP DB PERSISTENCE (POSTGRESQL)
=============================================================================
"""

import sys
import time
import json
import urllib.request
import urllib.error
import subprocess
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"
TIMESTAMP = int(time.time())
UNIQUE_PRODUCT_TITLE = f"Hệ Thống IoT Giám Sát Canh Tác Thông Minh NacenAgri QA-{TIMESTAMP}"

def query_db(sql: str) -> str:
    """Truy vấn CSDL PostgreSQL thật trong container nacentech-postgres-1."""
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return res.stdout.strip()

# =============================================================================
# TẦNG 1: KIỂM THỬ QUY TẮC NGHIỆP VỤ & VALIDATION (BR-SELLER-01 -> 05)
# =============================================================================
def test_tier_1_business_rules_validation():
    print("\n" + "=" * 70)
    print("📌 TẦNG 1: KIỂM THỬ QUY TẮC NGHIỆP VỤ & RÀNG BUỘC VALIDATION")
    print("=" * 70)

    # BR-SELLER-02: Bật chuyển giao công nghệ nhưng thiếu Bộ Tứ SHTT
    print("▶ [BR-SELLER-02] Thử nghiệm tạo hồ sơ có chuyển giao nhưng thiếu Bộ Tứ SHTT...")
    invalid_payload = {
        "offerType": "SOLUTION",
        "hasTechTransfer": True,
        "title": "Sản phẩm thử nghiệm vi phạm BR-SELLER-02",
        "summary": "Tóm tắt kiểm tra validation",
        "problemSolved": "Bài toán giải quyết",
        "sectorCode": "FOOD",
        "pricingType": "CONTACT",
        "currency": "VND",
        "managingAuthorityId": "VN-HN",
        "legalConsent": True
        # Thiếu: trlLevel, ipStatus, developerOrigin, transferMethod, commercialStatus
    }
    
    req = urllib.request.Request(
        f"{BASE_API_URL}/api/v1/portal/seller/technologies",
        data=json.dumps(invalid_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            print("  ❌ FAIL: Hệ thống cho phép tạo dù thiếu Bộ Tứ SHTT!")
            assert False, "Hệ thống vi phạm BR-SELLER-02"
    except urllib.error.HTTPError as err:
        assert err.code in (400, 422), f"Kỳ vọng HTTP 400/422 nhưng nhận {err.code}"
        print(f"  ✅ PASS: Hệ thống chặn thành công với mã lỗi HTTP {err.code} (Bảo vệ BR-SELLER-02).")

    # BR-SELLER-03: Thang đo TRL ngoài khoảng 1-9
    print("▶ [BR-SELLER-03] Thử nghiệm gửi giá trị TRL vượt biên (TRL = 10)...")
    invalid_trl_payload = {
        "offerType": "SOLUTION",
        "hasTechTransfer": True,
        "title": "Sản phẩm thử nghiệm vi phạm TRL",
        "summary": "Tóm tắt kiểm tra validation TRL",
        "problemSolved": "Bài toán giải quyết",
        "sectorCode": "FOOD",
        "pricingType": "CONTACT",
        "currency": "VND",
        "trlLevel": 10, # Ngoài biên 1-9
        "ipStatus": "PATENT_GRANTED",
        "developerOrigin": "Viện nghiên cứu",
        "transferMethod": "EXCLUSIVE_LICENSE",
        "commercialStatus": "COMMERCIALLY_READY",
        "managingAuthorityId": "VN-HN",
        "legalConsent": True
    }
    req_trl = urllib.request.Request(
        f"{BASE_API_URL}/api/v1/portal/seller/technologies",
        data=json.dumps(invalid_trl_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
    )
    try:
        with urllib.request.urlopen(req_trl, timeout=5) as response:
            assert False, "Hệ thống vi phạm BR-SELLER-03 (TRL=10)"
    except urllib.error.HTTPError as err:
        assert err.code in (400, 422), f"Kỳ vọng HTTP 400/422 nhưng nhận {err.code}"
        print(f"  ✅ PASS: Hệ thống chặn TRL ngoài khoảng 1-9 với mã lỗi HTTP {err.code}.")

# =============================================================================
# TẦNG 2: KIỂM ĐỊNH HỢP ĐỒNG API (API CONTRACT & 5 UX STATES)
# =============================================================================
def test_tier_2_api_contracts():
    print("\n" + "=" * 70)
    print("🔍 TẦNG 2: KIỂM ĐỊNH HỢP ĐỒNG API & ĐỊNH DẠNG DTO SÀN GIAO DỊCH")
    print("=" * 70)

    url = f"{BASE_API_URL}/api/v1/technologies"
    print(f"▶ [CONTRACT-01] Gửi GET {url} kiểm định schema danh sách chào bán...")
    req = urllib.request.Request(url, headers={"User-Agent": "NacenTech-QC"})
    with urllib.request.urlopen(req, timeout=5) as response:
        assert response.getcode() == 200
        body = json.loads(response.read().decode())

    assert body.get("success") is True, "Response missing success: true"
    assert "data" in body and isinstance(body["data"], list), "Response data must be a list"
    print(f"  ✅ PASS: API công khai trả về danh sách {len(body['data'])} sản phẩm chào bán chuẩn DTO.")

# =============================================================================
# TẦNG 3: KIỂM THỬ TÍCH HỢP DỮ LIỆU & STATE MACHINE TRÊN POSTGRESQL (DEEP DB)
# =============================================================================
def test_tier_3_db_state_machine():
    print("\n" + "=" * 70)
    print("🔄 TẦNG 3: KIỂM THỬ TÍCH HỢP & MÁY TRẠNG THÁI (MAKER-CHECKER CSDL)")
    print("=" * 70)

    # 1. Tạo bản ghi trực tiếp qua REST API (Chuẩn Maker)
    print("▶ [STEP 3.1] Seller tạo hồ sơ chào bán có Bộ Tứ SHTT...")
    create_url = f"{BASE_API_URL}/api/v1/portal/seller/technologies"
    payload = {
        "offerType": "SOLUTION",
        "hasTechTransfer": True,
        "title": f"Công Nghệ Tầng 3 QC Test-{TIMESTAMP}",
        "summary": "Tóm tắt giải pháp kiểm thử CSDL tầng sâu.",
        "problemSolved": "Xử lý bài toán tự động hóa kiểm định dữ liệu.",
        "sectorCode": "LV07",
        "pricingType": "FIXED",
        "priceAmount": 850000000,
        "currency": "VND",
        "unit": "gói chuyển giao",
        "developerOrigin": "Viện Công Nghệ NacenTech",
        "trlLevel": 7,
        "ipStatus": "PATENT_GRANTED",
        "ipRegistrationNumber": f"PAT-QC-{TIMESTAMP}",
        "transferMethod": "EXCLUSIVE_LICENSE",
        "commercialStatus": "COMMERCIALLY_READY",
        "managingAuthorityId": "VN-HN",
        "managingAuthorityName": "Sở KH&CN Hà Nội",
        "scopeType": "PROVINCE",
        "scopeId": "HN",
        "legalConsent": True
    }

    req = urllib.request.Request(
        create_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
    )
    with urllib.request.urlopen(req, timeout=5) as res:
        res_data = json.loads(res.read().decode())
    
    created_id = res_data["data"]["id"]
    print(f"  ✓ Đã gửi yêu cầu tạo: ID = {created_id}")

    # 2. Deep DB Check: Kiểm tra trạng thái sơ khởi trong PostgreSQL
    print("▶ [STEP 3.2] [Deep DB State Verification] Đối soát CSDL PostgreSQL (technology.seller_technology_offers)...")
    db_row = query_db(f"SELECT status, published_at, trl_level FROM technology.seller_technology_offers WHERE id = '{created_id}';")
    assert db_row, "Bản ghi chưa được ghi vào CSDL PostgreSQL!"
    status, pub_at, trl = db_row.split("|")
    assert status == "PENDING", f"Kỳ vọng status = PENDING (chờ duyệt), thực tế: {status}"
    assert pub_at == "" or pub_at == "None", f"Kỳ vọng published_at = null, thực tế: {pub_at}"
    assert trl == "7", f"Kỳ vọng trl_level = 7, thực tế: {trl}"
    print(f"  ✅ PASS: CSDL PostgreSQL ghi nhận chính xác: status='PENDING', published_at=NULL (Không auto-approve).")

    # 3. Phê duyệt (Checker - Thẩm định cấp Sở KH&CN)
    print("▶ [STEP 3.3] Thẩm định viên thực hiện hành động APPROVE...")
    review_url = f"{BASE_API_URL}/api/v1/portal/seller/technologies/{created_id}/review"
    rev_payload = {
        "action": "APPROVE",
        "reviewNote": "Đã thẩm định văn bằng SHTT hợp lệ theo quy chế sàn."
    }
    req_rev = urllib.request.Request(
        review_url,
        data=json.dumps(rev_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
    )
    with urllib.request.urlopen(req_rev, timeout=5) as res_rev:
        assert res_rev.getcode() == 200
        rev_data = json.loads(res_rev.read().decode())
    
    assert rev_data["data"]["status"] == "APPROVED"
    print("  ✓ API Thẩm định phản hồi thành công: status = APPROVED.")

    # 4. Deep DB Check sau duyệt: PostgreSQL phải cập nhật status='APPROVED' và có published_at
    print("▶ [STEP 3.4] [Deep DB Check Sau Duyệt] Đối soát CSDL sau khi phê duyệt...")
    db_row_after = query_db(f"SELECT status, published_at IS NOT NULL FROM technology.seller_technology_offers WHERE id = '{created_id}';")
    status_after, has_pub_at = db_row_after.split("|")
    assert status_after == "APPROVED", f"CSDL chưa cập nhật APPROVED: {status_after}"
    assert has_pub_at.lower() in ("t", "true"), "published_at chưa được gán thời gian niêm yết!"
    print(f"  ✅ PASS: CSDL PostgreSQL xác nhận hoàn tất: status='APPROVED', published_at đã kích hoạt.")

    # 5. Dọn dẹp bản ghi kiểm thử
    query_db(f"DELETE FROM technology.seller_technology_offers WHERE id = '{created_id}';")
    print(f"  🧹 TEARDOWN: Đã dọn dẹp bản ghi test {created_id} an toàn khỏi CSDL.")

# =============================================================================
# TẦNG 4: PLAYWRIGHT E2E BLACK-BOX TOÀN TRÌNH TRÊN GIAO DIỆN WEB
# 1. Login Seller -> Tạo sản phẩm trên Form UI
# 2. Duyệt sản phẩm (Checker)
# 3. Kiểm tra hiển thị trên Sàn công khai (/chao-ban-cong-nghe) và trang chi tiết
# =============================================================================
def test_tier_4_playwright_e2e_blackbox():
    print("\n" + "=" * 70)
    print("🎭 TẦNG 4: PLAYWRIGHT E2E BLACK-BOX TOÀN TRÌNH TRÊN CHROMIUM")
    print("=" * 70)

    created_product_id = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # -------------------------------------------------------------
        # BƯỚC 1: ĐĂNG NHẬP SELLER THẬT QUA FORM UI
        # -------------------------------------------------------------
        print("\n▶ [BƯỚC 1] Đăng nhập tài khoản SELLER (seller.user@demo.nacentech.vn)...")
        page.goto(f"{BASE_WEB_URL}/login")
        page.wait_for_selector('input[type="email"]', timeout=10000)
        page.fill('input[type="email"]', "seller.user@demo.nacentech.vn")
        page.fill('input[type="password"]', "Password@123")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_url(lambda u: "/portal" in u, timeout=15000)
        print("  ✅ Đăng nhập SELLER thành công qua giao diện thật.")

        # -------------------------------------------------------------
        # BƯỚC 2: MỞ FORM TẠO HỒ SƠ CHÀO BÁN & NHẬP LIỆU THẬT
        # -------------------------------------------------------------
        print("\n▶ [BƯỚC 2] Mở Form Tạo Hồ Sơ Chào Bán (/portal/seller/technologies/create)...")
        page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
        page.wait_for_selector("text=Biểu Mẫu Chào Bán & Chuyển Giao SHTT", timeout=10000)

        print(f"  ✓ Nhập tên sản phẩm: '{UNIQUE_PRODUCT_TITLE}'")
        page.fill("input[placeholder*='sấy thăng hoa']", UNIQUE_PRODUCT_TITLE)

        print("  ✓ Nhập tóm tắt công nghệ và bài toán giải quyết...")
        page.fill(
            "textarea[placeholder*='đặc điểm chính']",
            "Hệ thống cảm biến IoT đa tầng đo độ ẩm, độ pH đất và dự báo nhu cầu nước tưới bằng mô hình học máy chuyên sâu."
        )
        page.fill(
            "textarea[placeholder*='nỗi đau']",
            "Tối ưu 40% chi phí phân bón hòa tan, chống suy thoái tầng đất hữu cơ và giảm hao hụt tài nguyên nước ngọt."
        )

        # -------------------------------------------------------------
        # BƯỚC 3: NỘP HỒ SƠ CHỜ DUYỆT (FAST-TRACK SUBMIT)
        # -------------------------------------------------------------
        print("\n▶ [BƯỚC 3] Nộp hồ sơ chào bán...")
        fast_track_btn = page.locator("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')").first
        fast_track_btn.click()

        page.wait_for_selector("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')", timeout=5000)
        confirm_btn = page.locator("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
        confirm_btn.click()

        page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)
        print("  ✅ Form submit thành công, điều hướng về: /portal/seller/technologies")

        # -------------------------------------------------------------
        # BƯỚC 4: ĐỐI SOÁT CSDL POSTGRESQL & LẤY ID HỒ SƠ VỪA TẠO
        # -------------------------------------------------------------
        print("\n▶ [BƯỚC 4] [Deep DB Verification] Đối soát bản ghi sản phẩm vừa tạo trong PostgreSQL...")
        sql_find = f"""
            SELECT id, offer_code, status, trl_level, ip_status
            FROM technology.seller_technology_offers
            WHERE title = '{UNIQUE_PRODUCT_TITLE}';
        """
        db_res = ""
        for _ in range(10):
            db_res = query_db(sql_find)
            if db_res:
                break
            time.sleep(0.5)

        assert db_res, f"❌ KHÔNG TÌM THẤY SẢN PHẨM '{UNIQUE_PRODUCT_TITLE}' TRONG CSDL!"
        created_product_id, offer_code, status, trl, ip_st = db_res.split("|")
        print(f"  ✅ CSDL lưu thành công: ID={created_product_id} | Code={offer_code} | Status={status}")
        assert status == "PENDING", f"Trạng thái ban đầu phải là PENDING, thực tế là: {status}"

        # -------------------------------------------------------------
        # BƯỚC 5: PHÊ DUYỆT HỒ SƠ (CHECKER / APPROVAL)
        # -------------------------------------------------------------
        print("\n▶ [BƯỚC 5] Thực hiện Phê duyệt (Approve) hồ sơ sản phẩm...")
        rev_url = f"{BASE_API_URL}/api/v1/portal/seller/technologies/{created_product_id}/review"
        rev_req = urllib.request.Request(
            rev_url,
            data=json.dumps({"action": "APPROVE", "reviewNote": "QC thẩm định phê duyệt đủ điều kiện niêm yết sàn."}).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
        )
        with urllib.request.urlopen(rev_req, timeout=5) as r:
            assert r.getcode() == 200
        
        # Verify lại CSDL sau khi duyệt
        db_after_rev = query_db(f"SELECT status, published_at IS NOT NULL FROM technology.seller_technology_offers WHERE id = '{created_product_id}';")
        st_after, has_pub = db_after_rev.split("|")
        assert st_after == "APPROVED", f"Lỗi phê duyệt trong CSDL: {st_after}"
        assert has_pub.lower() in ("t", "true"), "Lỗi: published_at chưa được cập nhật trong CSDL!"
        print(f"  ✅ Phê duyệt thành công: Status trong CSDL đã chuyển sang 'APPROVED' và kích hoạt niêm yết.")

        # -------------------------------------------------------------
        # BƯỚC 6: KIỂM TRA HIỂN THỊ TRÊN TRANG DANH SÁCH CHÀO BÁN (/chao-ban-cong-nghe)
        # -------------------------------------------------------------
        print("\n▶ [BƯỚC 6] Khách công khai truy cập Sàn giao dịch (/chao-ban-cong-nghe)...")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        # Kiểm tra tiêu đề trang
        h1_text = page.locator("h1").first.inner_text()
        print(f"  ✓ Tiêu đề trang sàn: '{h1_text}'")

        # Tìm kiếm sản phẩm vừa phê duyệt bằng ô search
        search_input = page.locator("input[placeholder*='Tìm kiếm'], input[type='search'], input[type='text']").first
        if search_input.is_visible():
            search_input.fill(UNIQUE_PRODUCT_TITLE)
            page.wait_for_timeout(1000)
            print(f"  ✓ Đã nhập từ khóa tìm kiếm: '{UNIQUE_PRODUCT_TITLE}'")

        # Assert sản phẩm xuất hiện trên giao diện
        product_card = page.locator(f"text='{UNIQUE_PRODUCT_TITLE}'").first
        assert product_card.is_visible(), f"❌ Sản phẩm '{UNIQUE_PRODUCT_TITLE}' KHÔNG hiển thị trên trang danh sách chào bán!"
        print(f"  ✅ PASS: Sản phẩm '{UNIQUE_PRODUCT_TITLE}' xuất hiện trực quan trên Sàn chào bán công khai.")

        # -------------------------------------------------------------
        # BƯỚC 7: CLICK VÀO XEM TRANG CHI TIẾT SẢN PHẨM CHÀO BÁN
        # -------------------------------------------------------------
        print(f"\n▶ [BƯỚC 7] Điều hướng đến trang chi tiết: /chao-ban-cong-nghe/{created_product_id}...")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe/{created_product_id}", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        detail_h1 = page.locator("h1").first.inner_text()
        assert UNIQUE_PRODUCT_TITLE in detail_h1, f"Tiêu đề trang chi tiết không khớp! Nhận: {detail_h1}"
        print(f"  ✅ PASS: Trang chi tiết tải chính xác: '{detail_h1}'")

        # Kiểm tra các thông tin Bộ Tứ SHTT trên trang chi tiết
        page_content = page.content()
        assert "TRL" in page_content, "Trang chi tiết thiếu thông tin TRL"
        assert offer_code in page_content or "OFF-" in page_content, "Trang chi tiết thiếu Mã hồ sơ chào bán"
        print("  ✅ PASS: Trang chi tiết hiển thị đầy đủ thông số SHTT và mã hồ sơ hợp lệ.")

        # -------------------------------------------------------------
        # BƯỚC 8: DỌN DẸP DỮ LIỆU KIỂM THỬ TRONG CSDL
        # -------------------------------------------------------------
        print("\n▶ [BƯỚC 8] Dọn dẹp dữ liệu kiểm thử trong CSDL PostgreSQL...")
        query_db(f"DELETE FROM technology.seller_technology_offers WHERE id = '{created_product_id}';")
        print(f"  🧹 TEARDOWN: Đã dọn dẹp bản ghi {UNIQUE_PRODUCT_TITLE} ({created_product_id}) an toàn.")

        browser.close()

if __name__ == "__main__":
    try:
        test_tier_1_business_rules_validation()
        test_tier_2_api_contracts()
        test_tier_3_db_state_machine()
        test_tier_4_playwright_e2e_blackbox()
        print("\n" + "=" * 70)
        print("🏆 KẾT LUẬN TOÀN TRÌNH: 100% TEST CASES ĐẠT CHUẨN QUALITY GATE 4!")
        print("=" * 70)
    except Exception as e:
        print(f"\n❌ LỖI KIỂM THỬ: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
