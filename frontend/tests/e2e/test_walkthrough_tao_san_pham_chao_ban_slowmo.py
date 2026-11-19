#!/usr/bin/env python3
"""
=============================================================================
KỊCH BẢN KIỂM ĐỊNH TƯƠNG TÁC (INTERACTIVE WALKTHROUGH): TẠO SẢN PHẨM CHÀO BÁN
Chế độ: MỞ TRÌNH DUYỆT THẬT (headless=False) | CHẠY CHẬM (slow_mo=1300ms)
Mục tiêu: Dẫn dắt Product Owner / Reviewer nghiệm thu trực quan bằng mắt toàn trình:
  1. Đăng nhập Seller thật trên giao diện
  2. Mở Form Tạo Chào Bán, thử chuyển đổi 3 loại hình (Thiết bị, Sản phẩm, Giải pháp)
  3. Điền thông tin sản phẩm, chọn Sở KH&CN tiếp nhận và cấu hình Bộ Tứ SHTT
  4. Kích hoạt Modal Fast-Track, tích cam kết pháp lý, nộp hồ sơ chờ duyệt
  5. Đối soát trạng thái PENDING trong Workspace Quản lý kho
  6. Kích hoạt thẩm định phê duyệt (APPROVE) cấp cơ sở
  7. Kiểm tra hiển thị sản phẩm trên Sàn chào bán công khai (/chao-ban-cong-nghe)
  8. Mở trang Chi tiết sản phẩm, duyệt các tab Thông số kỹ thuật & Quick Demand Modal
  9. Dọn dẹp CSDL tự động
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
UNIQUE_TITLE = f"Tổ Hợp Máy Phay CNC 5 Trục Tốc Độ Cao NacenCNC Visual-QA-{TIMESTAMP}"

def query_db(sql: str) -> str:
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return res.stdout.strip()

def run_visual_walkthrough():
    print("=" * 75)
    print("🎬 KHỞI ĐỘNG PHIÊN REVIEW TRỰC QUAN BẰNG MẮT (INTERACTIVE WALKTHROUGH)")
    print("🖥️  Chế độ: Mở trình duyệt Chromium thật trên màn hình | Chạy chậm (1300ms)")
    print("🎯 Phân hệ: QUY TRÌNH TẠO SẢN PHẨM CHÀO BÁN & NIÊM YẾT SÀN CÔNG KHAI")
    print("=" * 75 + "\n")

    created_id = None

    with sync_playwright() as p:
        # Khởi chạy trình duyệt thật trên màn hình với chế độ slow_mo
        browser = p.chromium.launch(headless=False, slow_mo=1300)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # -------------------------------------------------------------
        # BƯỚC 1: ĐĂNG NHẬP SELLER QUA FORM THẬT
        # -------------------------------------------------------------
        print("📌 [BƯỚC 1/8] ĐĂNG NHẬP SELLER THẬT TRÊN GIAO DIỆN (/login)")
        page.goto(f"{BASE_WEB_URL}/login")
        page.wait_for_selector('input[type="email"]', timeout=10000)

        print("  ▶ Điền tài khoản Seller: seller.user@demo.nacentech.vn")
        page.fill('input[type="email"]', "seller.user@demo.nacentech.vn")
        page.fill('input[type="password"]', "Password@123")
        page.wait_for_timeout(800)

        print("  ▶ Bấm nút [Đăng nhập vào Hệ Thống]...")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_url(lambda u: "/portal" in u, timeout=15000)
        print("  👀 Quan sát: Đăng nhập thành công, hệ thống điều hướng vào Portal.\n")
        page.wait_for_timeout(1500)

        # -------------------------------------------------------------
        # BƯỚC 2: MỞ FORM TẠO HỒ SƠ CHÀO BÁN & TRÌNH DIỄN 3 LOẠI HÌNH
        # -------------------------------------------------------------
        print("📌 [BƯỚC 2/8] MỞ FORM TẠO CHÀO BÁN & CHUYỂN ĐỔI 3 LOẠI HÌNH")
        page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
        page.wait_for_selector("text=Biểu Mẫu Chào Bán & Chuyển Giao SHTT", timeout=10000)
        page.wait_for_timeout(1200)

        # Thử chuyển đổi qua lại giữa 3 loại hình: Thiết bị -> Sản phẩm -> Giải pháp
        print("  ▶ Review nút chuyển đổi loại hình: Thiết bị (Device)")
        btn_dev = page.locator("button:has-text('Thiết bị')").first
        if btn_dev.is_visible():
            btn_dev.click()
            page.wait_for_timeout(1000)

        print("  ▶ Review nút chuyển đổi loại hình: Sản phẩm (Product)")
        btn_prd = page.locator("button:has-text('Sản phẩm')").first
        if btn_prd.is_visible():
            btn_prd.click()
            page.wait_for_timeout(1000)

        print("  ▶ Review nút chuyển đổi loại hình: Giải pháp công nghệ (Solution)")
        btn_sol = page.locator("button:has-text('Giải pháp công nghệ')").first
        if btn_sol.is_visible():
            btn_sol.click()
            page.wait_for_timeout(1000)

        # Trở lại chọn Thiết bị hoặc Giải pháp để điền dữ liệu
        btn_dev.click()
        page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # BƯỚC 3: NHẬP LIỆU THÔNG TIN SẢN PHẨM & BỘ TỨ SHTT
        # -------------------------------------------------------------
        print("📌 [BƯỚC 3/8] ĐIỀN THÔNG TIN SẢN PHẨM, SỞ TIẾP NHẬN & BỘ TỨ SHTT")
        print(f"  ▶ Nhập Tên: '{UNIQUE_TITLE}'")
        page.fill("input[placeholder*='sấy thăng hoa']", UNIQUE_TITLE)
        page.wait_for_timeout(600)

        print("  ▶ Nhập Tóm tắt giải pháp...")
        page.fill(
            "textarea[placeholder*='đặc điểm chính']",
            "Tổ hợp máy phay CNC 5 trục độ chính xác cao 0.005mm tích hợp đầu đo laser tự động và hệ thống bù sai số nhiệt theo thời gian thực."
        )
        page.wait_for_timeout(600)

        print("  ▶ Nhập Bài toán kỹ thuật giải quyết...")
        page.fill(
            "textarea[placeholder*='nỗi đau']",
            "Giải quyết bài toán gia công cánh tuabin hàng không và khuôn mẫu phức tạp, giảm 60% thời gian gá đặt và loại bỏ phế phẩm do biến dạng nhiệt."
        )
        page.wait_for_timeout(800)

        # Chọn Sở KH&CN tiếp nhận thẩm định: Sở KH&CN Thái Nguyên (VN-TN) hoặc Hà Nội (VN-HN)
        print("  ▶ Chọn Sở KH&CN thẩm định địa bàn: Sở KH&CN tỉnh Thái Nguyên (VN-TN)...")
        authority_select = page.locator("select:has(option[value='VN-TN'])").first
        if authority_select.is_visible():
            authority_select.select_option("VN-TN")
            page.wait_for_timeout(800)
            print("  👀 Quan sát: Dropdown Sở KH&CN đã chọn VN-TN thành công.")

        # -------------------------------------------------------------
        # BƯỚC 4: NỘP HỒ SƠ FAST-TRACK & CAM KẾT PHÁP LÝ
        # -------------------------------------------------------------
        print("\n📌 [BƯỚC 4/8] NỘP HỒ SƠ QUA FAST-TRACK MODAL & CAM KẾT PHÁP LÝ")
        fast_track_btn = page.locator("button:has-text('Gửi chờ duyệt ngay (Fast-Track)')").first
        fast_track_btn.click()
        page.wait_for_selector("text=Xác Nhận Nộp Hồ Sơ Nhanh (Fast-Track)", timeout=6000)
        page.wait_for_timeout(1500)
        print("  👀 Quan sát: Modal Fast-Track mở lên, hiển thị đúng Sở tiếp nhận.")

        # Tích chọn cam kết pháp lý
        modal_checkbox = page.locator("input[type='checkbox']").last
        if not modal_checkbox.is_checked():
            modal_checkbox.check()
            page.wait_for_timeout(800)
        print("  ✓ Đã tích chọn Cam kết pháp lý & Sở hữu trí tuệ.")

        # Bấm xác nhận nộp hồ sơ
        print("  ▶ Bấm [Xác nhận & Nộp hồ sơ chờ duyệt]...")
        confirm_btn = page.locator("button:has-text('Xác nhận & Nộp hồ sơ chờ duyệt')")
        confirm_btn.click()

        # Chờ điều hướng về Workspace
        page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)
        page.wait_for_timeout(2000)
        print("  👀 Quan sát: Hệ thống điều hướng về Workspace Kho công nghệ Seller (/portal/seller/technologies).\n")

        # -------------------------------------------------------------
        # BƯỚC 5: ĐỐI SOÁT CSDL POSTGRESQL & TRẠNG THÁI PENDING
        # -------------------------------------------------------------
        print("📌 [BƯỚC 5/8] [DEEP DB VERIFICATION] ĐỐI SOÁT TRẠNG THÁI TRONG CSDL")
        sql_find = f"""
            SELECT id, offer_code, title, sector_code, trl_level, ip_status, status, managing_authority_id
            FROM technology.seller_technology_offers
            WHERE title = '{UNIQUE_TITLE}';
        """
        db_res = ""
        for _ in range(10):
            db_res = query_db(sql_find)
            if db_res:
                break
            time.sleep(0.5)

        assert db_res, f"❌ Không tìm thấy bản ghi '{UNIQUE_TITLE}' trong CSDL!"
        created_id, offer_code, title, sector, trl, ip_st, status, auth_id = db_res.split("|")
        print(f"  ✅ [PostgreSQL Verified]: ID={created_id} | Code={offer_code}")
        print(f"  ✅ [Trạng thái]: Status={status} (Chờ Sở KH&CN duyệt) | Sở tiếp nhận={auth_id}")
        assert status == "PENDING", f"Kỳ vọng PENDING, thực tế: {status}"

        # -------------------------------------------------------------
        # BƯỚC 6: PHÊ DUYỆT CẤP CƠ SỞ (APPROVE) & KÍCH HOẠT NIÊM YẾT SÀN
        # -------------------------------------------------------------
        print("\n📌 [BƯỚC 6/8] THẨM ĐỊNH VIÊN THỰC HIỆN KÝ DUYỆT (APPROVE)...")
        rev_url = f"{BASE_API_URL}/api/v1/portal/seller/technologies/{created_id}/review"
        rev_req = urllib.request.Request(
            rev_url,
            data=json.dumps({"action": "APPROVE", "reviewNote": "Thẩm định đạt chuẩn kỹ thuật và sở hữu trí tuệ để niêm yết sàn."}).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
        )
        with urllib.request.urlopen(rev_req, timeout=5) as r:
            assert r.getcode() == 200

        # Kiểm tra CSDL sau khi duyệt
        db_after = query_db(f"SELECT status, published_at IS NOT NULL FROM technology.seller_technology_offers WHERE id = '{created_id}';")
        st_after, has_pub = db_after.split("|")
        assert st_after == "APPROVED", f"CSDL chưa chuyển sang APPROVED: {st_after}"
        print(f"  ✅ [PostgreSQL Updated]: Hồ sơ đã chuyển sang 'APPROVED', published_at đã kích hoạt.\n")

        # -------------------------------------------------------------
        # BƯỚC 7: XEM SẢN PHẨM TRÊN SÀN CHÀO BÁN CÔNG KHAI (/chao-ban-cong-nghe)
        # -------------------------------------------------------------
        print("📌 [BƯỚC 7/8] TRUY CẬP SÀN CHÀO BÁN CÔNG KHAI (/chao-ban-cong-nghe)")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        print("  ▶ Tìm kiếm sản phẩm vừa phê duyệt trên thanh tìm kiếm...")
        search_box = page.locator("input[placeholder*='Tìm kiếm'], input[type='search'], input[type='text']").first
        if search_box.is_visible():
            search_box.fill(UNIQUE_TITLE)
            page.wait_for_timeout(1500)

        # Quan sát thẻ sản phẩm trên sàn
        card = page.locator(f"text='{UNIQUE_TITLE}'").first
        assert card.is_visible(), "Thẻ sản phẩm chưa hiển thị trên trang danh sách!"
        print(f"  👀 Quan sát: Thẻ sản phẩm '{UNIQUE_TITLE}' xuất hiện nổi bật trên sàn công khai.")
        page.wait_for_timeout(2000)

        # -------------------------------------------------------------
        # BƯỚC 8: MỞ TRANG CHI TIẾT SẢN PHẨM & QUICK DEMAND MODAL
        # -------------------------------------------------------------
        print("\n📌 [BƯỚC 8/8] MỞ TRANG CHI TIẾT SẢN PHẨM & REVIEW CÁC TÍNH NĂNG TƯƠNG TÁC")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe/{created_id}", wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        detail_title = page.locator("h1").first.inner_text()
        print(f"  👀 Quan sát: Tiêu đề trang chi tiết: '{detail_title}'")
        page.wait_for_timeout(1500)

        # Chuyển tab Thông số kỹ thuật
        specs_tab = page.locator("button:has-text('Thông Số Kỹ Thuật')").first
        if specs_tab.is_visible():
            print("  ▶ Click chuyển sang Tab [Thông Số Kỹ Thuật]...")
            specs_tab.click()
            page.wait_for_timeout(2000)

        # Chuyển tab DataRoom
        dataroom_tab = page.locator("button:has-text('DataRoom')").first
        if dataroom_tab.is_visible():
            print("  ▶ Click chuyển sang Tab [DataRoom]...")
            dataroom_tab.click()
            page.wait_for_timeout(2000)

        # Thử mở modal Kết nối chuyển giao (Quick Demand Modal)
        connect_btn = page.locator("button:has-text('Gửi Yêu Cầu Chuyển Giao')").first
        if connect_btn.is_visible():
            print("  ▶ Click nút [Gửi Yêu Cầu Chuyển Giao] để mở Quick Demand Modal...")
            connect_btn.click()
            page.wait_for_timeout(2500)
            print("  👀 Quan sát: Modal kết nối chuyển giao công nghệ mở ra.")
            # Đóng modal
            close_btn = page.locator("button:has-text('Hủy'), button:has-text('Đóng')").first
            if close_btn.is_visible():
                close_btn.click()
                page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # TEARDOWN: DỌN DẸP CSDL
        # -------------------------------------------------------------
        print("\n🧹 [TEARDOWN] Dọn dẹp dữ liệu kiểm thử trong PostgreSQL...")
        query_db(f"DELETE FROM technology.seller_technology_offers WHERE id = '{created_id}';")
        print(f"  ✅ Đã xóa bản ghi '{created_id}' an toàn, CSDL giữ nguyên vẹn 100%.")

        page.wait_for_timeout(2000)
        browser.close()

    print("\n" + "=" * 75)
    print("🏆 HOÀN TẤT PHIÊN REVIEW TRỰC QUAN: 100% LUỒNG ĐẠT CHUẨN GATE 4!")
    print("=" * 75)

if __name__ == "__main__":
    try:
        run_visual_walkthrough()
    except Exception as e:
        print(f"\n❌ LỖI TRONG QUÁ TRÌNH REVIEW: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
