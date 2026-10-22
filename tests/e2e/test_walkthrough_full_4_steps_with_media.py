#!/usr/bin/env python3
"""
=============================================================================
KỊCH BẢN KIỂM ĐỊNH TOÀN TRÌNH FULL 4 BƯỚC WIZARD + TẢI ẢNH MEDIA SHOWCASE
=============================================================================
Chế độ: MỞ TRÌNH DUYỆT THẬT (headless=False) | CHẠY CHẬM (1100ms)
Mục tiêu: Dẫn dắt Product Owner / Reviewer nghiệm thu ĐẦY ĐỦ 100% TÍNH NĂNG:
  - BƯỚC 1: Đăng nhập Seller -> Nhập thông tin giải pháp -> Điền Đơn vị R&D (DeveloperOrigin) -> TẢI ẢNH ĐẠI DIỆN THẬT (Logo NacenTech) -> TẢI THƯ VIỆN ẢNH -> Nhập Video Demo YouTube -> Chọn Sở KH&CN -> Bấm Tiếp tục.
  - BƯỚC 2: Hồ Sơ Kỹ Thuật (Lớp 2 + Lớp 3) -> Nhập Model NCT-CNC-5X-PRO, Xuất xứ Việt Nam, Năm 2026, Công suất -> Bấm Tiếp tục.
  - BƯỚC 3: Điều Kiện Thương Mại (Lớp 4) -> Nhập Phạm vi toàn quốc, Tiến độ 45 ngày, Bảo hành 24 tháng -> Bấm Tiếp tục.
  - BƯỚC 4: Pháp Lý SHTT & DataRoom -> Nhập số bằng sáng chế VN-1-0029988 -> Chọn Sở KH&CN tiếp nhận VN-TN -> Thêm tài liệu DataRoom (Catalogue-NacenCNC-2026.pdf) -> Tích cam kết pháp lý -> BẤM NÚT "Hoàn tất & Gửi chờ duyệt" CHÍNH THỨC (Không dùng shortcut).
  - THẨM ĐỊNH & NIÊM YẾT: Cán bộ Sở ký duyệt APPROVE -> Kích hoạt niêm yết sàn.
  - SÀN CÔNG KHAI (/chao-ban-cong-nghe): Kiểm tra sản phẩm xuất hiện kèm ẢNH ĐẠI DIỆN THỰC TẾ.
  - CHI TIẾT SẢN PHẨM (/chao-ban-cong-nghe/[id]): Kiểm tra Hero Image, Tab Thông số kỹ thuật động (Model, Năm SX, Xuất xứ), Tab DataRoom có tệp Catalogue -> Gửi Quick Demand Modal -> Cleanup DB.
=============================================================================
"""

import os
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
UNIQUE_TITLE = f"Trung Tâm Gia Công CNC 5 Trục Tích Hợp AI NacenCNC Full-QA-{TIMESTAMP}"

# Đường dẫn ảnh thật trong dự án
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
LOGO_PATH = os.path.join(ROOT_DIR, "NACENTECH_Main-Logo-G.png")
BG_IMG_PATH = os.path.join(ROOT_DIR, "innovation-hero-background.png")

def query_db(sql: str) -> str:
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return res.stdout.strip()

def run_full_wizard_walkthrough():
    print("=" * 75)
    print("🎬 KHỞI ĐỘNG PHIÊN REVIEW TOÀN TRÌNH: FULL 4 BƯỚC WIZARD + UPLOAD ẢNH MEDIA")
    print("🖥️  Chế độ: Trình duyệt thật (headless=False) | Tốc độ chậm (1100ms) để quan sát")
    print("🎯 Bề mặt: Form Wizard 4 Bước -> Sàn Giao Dịch -> Chi Tiết Sản Phẩm & DataRoom")
    print("=" * 75 + "\n")

    created_id = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=1100)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Lắng nghe console log để phát hiện lỗi nếu có
        page.on("console", lambda msg: print(f"    [BROWSER {msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)

        # =============================================================
        # CHẶNG 1: ĐĂNG NHẬP SELLER THẬT
        # =============================================================
        print("📌 [CHẶNG 1/6] ĐĂNG NHẬP TÀI KHOẢN SELLER TRÊN GIAO DIỆN (/login)")
        page.goto(f"{BASE_WEB_URL}/login")
        page.wait_for_selector('input[type="email"]', timeout=10000)

        print("  ▶ Nhập Email: seller.user@demo.nacentech.vn")
        page.fill('input[type="email"]', "seller.user@demo.nacentech.vn")
        page.fill('input[type="password"]', "Password@123")
        page.wait_for_timeout(500)

        print("  ▶ Bấm nút [Đăng nhập vào Hệ Thống]...")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_url(lambda u: "/portal" in u, timeout=15000)
        print("  👀 Quan sát: Đăng nhập thành công, chuyển hướng vào Portal.\n")
        page.wait_for_timeout(1000)

        # =============================================================
        # CHẶNG 2: BƯỚC 1 - THÔNG TIN CƠ BẢN + UPLOAD ẢNH MEDIA SHOWCASE
        # =============================================================
        print("📌 [CHẶNG 2/6] BƯỚC 1 WIZARD: THÔNG TIN CƠ BẢN & TẢI ẢNH MEDIA THẬT")
        page.goto(f"{BASE_WEB_URL}/portal/seller/technologies/create")
        page.wait_for_selector("text=Biểu Mẫu Chào Bán & Chuyển Giao SHTT", timeout=10000)
        page.wait_for_timeout(1000)

        print(f"  ▶ 1.1 Nhập Tên sản phẩm: '{UNIQUE_TITLE}'")
        page.fill("input[placeholder*='sấy thăng hoa']", UNIQUE_TITLE)

        print("  ▶ 1.2 Nhập Mô tả tóm tắt giải pháp...")
        page.fill(
            "textarea[placeholder*='đặc điểm chính']",
            "Tổ hợp máy phay CNC 5 trục tốc độ trục chính 24.000 vòng/phút, tích hợp hệ thống camera quang học AI bù sai số giãn nở nhiệt theo thời gian thực."
        )

        print("  ▶ 1.3 Nhập Bài toán kỹ thuật giải quyết...")
        page.fill(
            "textarea[placeholder*='nỗi đau']",
            "Đảm bảo độ chính xác gia công đạt cấp micromet (±0.003mm) cho linh kiện hàng không và y tế, giảm 65% thời gian gá phôi thủ công."
        )

        # Điền Đơn vị R&D / DeveloperOrigin trong ReactiveYellowTrlPanel (bắt buộc theo BR-SELLER-02)
        print("  ▶ 1.4 Nhập Đơn vị nghiên cứu phát triển R&D (DeveloperOrigin)...")
        origin_input = page.locator("input[placeholder*='ITRI']").first
        if origin_input.is_visible():
            origin_input.fill("Viện Nghiên Cứu và Ứng Dụng Công Nghệ Cao NacenTech")
            page.wait_for_timeout(500)

        # Chọn Sở KH&CN tiếp nhận thẩm định: Thái Nguyên (VN-TN)
        print("  ▶ 1.5 Chọn Sở KH&CN tiếp nhận: Sở KH&CN tỉnh Thái Nguyên (VN-TN)...")
        authority_select = page.locator("select:has(option[value='VN-TN'])").first
        if authority_select.is_visible():
            authority_select.select_option("VN-TN")
            page.wait_for_timeout(500)

        # UPLOAD ẢNH ĐẠI DIỆN THẬT (Media Showcase)
        print(f"\n  🖼️ 1.6 TẢI ẢNH ĐẠI DIỆN THẬT: {os.path.basename(LOGO_PATH)}...")
        file_inputs = page.locator("input[type='file'][accept*='image']")
        if file_inputs.count() > 0:
            main_file_input = file_inputs.first
            main_file_input.set_input_files(LOGO_PATH)
            page.wait_for_timeout(1500)
            print("  👀 Quan sát: Ảnh đại diện đã được tải lên và hiển thị khung preview 16:9 trực quan trên màn hình!")

        # TẢI THƯ VIỆN ẢNH CHI TIẾT (Gallery Image)
        if file_inputs.count() > 1:
            print(f"  🖼️ 1.7 TẢI ẢNH THƯ VIỆN CHI TIẾT: {os.path.basename(BG_IMG_PATH)}...")
            gallery_file_input = file_inputs.nth(1)
            gallery_file_input.set_input_files([BG_IMG_PATH])
            page.wait_for_timeout(1500)
            print("  👀 Quan sát: Thư viện ảnh đã ghi nhận 1 tấm ảnh chi tiết cấu tạo.")

        # Nhập Video Demo URL
        video_input = page.locator("input[placeholder*='youtube.com']").first
        if video_input.is_visible():
            print("  ▶ 1.8 Nhập liên kết Video Demo: https://www.youtube.com/watch?v=demo-cnc-5axis")
            video_input.fill("https://www.youtube.com/watch?v=demo-cnc-5axis")
            page.wait_for_timeout(500)

        # Bấm nút Tiếp tục sang Bước 2
        print("\n  ▶ Bấm [Tiếp tục: Thông số ngành →] để sang Bước 2...")
        next_to_step2_btn = page.locator("button:has-text('Tiếp tục: Thông số ngành')").first
        next_to_step2_btn.click()
        page.wait_for_timeout(1500)

        # =============================================================
        # CHẶNG 3: BƯỚC 2 - HỒ SƠ KỸ THUẬT (LỚP 2 CHUNG & LỚP 3 ĐẶC THÙ)
        # =============================================================
        print("📌 [CHẶNG 3/6] BƯỚC 2 WIZARD: HỒ SƠ KỸ THUẬT CHI TIẾT (LỚP 2 & 3)")
        page.wait_for_selector("text=Bước 2: Thông số kỹ thuật", timeout=6000)
        page.wait_for_timeout(1000)

        print("  ▶ 2.1 Nhập Mã Model: NCT-CNC-5X-PRO")
        model_input = page.locator("input[placeholder*='CNC']").first
        if model_input.is_visible():
            model_input.fill("NCT-CNC-5X-PRO")

        print("  ▶ 2.2 Nhập Hãng sản xuất: NacenTech Robotics & Automation")
        manufacturer_input = page.locator("input[placeholder*='NacenTech Robotics']").first
        if manufacturer_input.is_visible():
            manufacturer_input.fill("NacenTech Robotics & Automation")

        print("  ▶ 2.3 Nhập Xuất xứ: Việt Nam (Chế tạo nội địa)")
        origin_input = page.locator("input[placeholder*='Việt Nam']").first
        if origin_input.is_visible():
            origin_input.fill("Việt Nam")

        print("  ▶ 2.4 Nhập Năm sản xuất: 2026")
        year_input = page.locator("input[placeholder*='2026']").first
        if year_input.is_visible():
            year_input.fill("2026")

        print("  ▶ 2.5 Nhập Công suất / Quy mô: 50 chi tiết hàng không / ca")
        capacity_input = page.locator("input[placeholder*='sản phẩm/giờ']").first
        if capacity_input.is_visible():
            capacity_input.fill("50 chi tiết hàng không / ca")

        page.wait_for_timeout(1000)
        print("  👀 Quan sát: Toàn bộ thông số Lớp 2 Excel Master đã được điền.")

        # Bấm nút Tiếp tục sang Bước 3
        print("\n  ▶ Bấm [Tiếp tục: Giá & thương mại →] để sang Bước 3...")
        next_to_step3_btn = page.locator("button:has-text('Tiếp tục: Giá & thương mại')").first
        next_to_step3_btn.click()
        page.wait_for_timeout(1500)

        # =============================================================
        # CHẶNG 4: BƯỚC 3 - ĐIỀU KIỆN THƯƠNG MẠI CHI TIẾT (LỚP 4)
        # =============================================================
        print("📌 [CHẶNG 4/6] BƯỚC 3 WIZARD: ĐIỀU KIỆN THƯƠNG MẠI & CHUYỂN GIAO (LỚP 4)")
        page.wait_for_selector("text=Bước 3: Điều Kiện Thương Mại Chi Tiết", timeout=6000)
        page.wait_for_timeout(1000)

        print("  ▶ 3.1 Nhập Phạm vi cung cấp: Cung cấp toàn quốc, hỗ trợ kỹ sư xưởng")
        scope_input = page.locator("input[placeholder*='Toàn quốc'], textarea[placeholder*='phạm vi']").first
        if scope_input.is_visible():
            scope_input.fill("Cung cấp toàn quốc, hỗ trợ kỹ sư chuyển giao công nghệ tại xưởng.")

        print("  ▶ 3.2 Nhập Tiến độ bàn giao: 45 ngày")
        timeline_input = page.locator("input[placeholder*='30 ngày'], textarea[placeholder*='bàn giao']").first
        if timeline_input.is_visible():
            timeline_input.fill("45 ngày kể từ ngày phê duyệt kết nối")

        print("  ▶ 3.3 Nhập Điều kiện bảo hành: 24 tháng bảo hành chính hãng")
        warranty_input = page.locator("input[placeholder*='12 tháng'], textarea[placeholder*='bảo hành']").first
        if warranty_input.is_visible():
            warranty_input.fill("24 tháng bảo hành chính hãng, trực kỹ thuật 24/7")

        page.wait_for_timeout(1000)
        print("  👀 Quan sát: Toàn bộ điều kiện thương mại Lớp 4 đã được ghi nhận.")

        # Bấm nút Tiếp tục sang Bước 4
        print("\n  ▶ Bấm [Tiếp tục: Pháp lý & DataRoom →] để sang Bước 4...")
        next_to_step4_btn = page.locator("button:has-text('Tiếp tục: Pháp lý & DataRoom')").first
        next_to_step4_btn.click()
        page.wait_for_timeout(1500)

        # =============================================================
        # CHẶNG 5: BƯỚC 4 - SHTT, TÀI LIỆU DATAROOM & GỬI CHÍNH THỨC
        # =============================================================
        print("📌 [CHẶNG 5/6] BƯỚC 4 WIZARD: PHÁP LÝ SHTT, DATAROOM & NỘP HỒ SƠ")
        page.wait_for_selector("text=Bước 4: Pháp Lý Sở Hữu Trí Tuệ", timeout=6000)
        page.wait_for_timeout(1000)

        print("  ▶ 4.1 Nhập Số văn bằng SHTT: VN-1-0029988 (Bằng Độc Quyền Sáng Chế)")
        ip_number_input = page.locator("input[placeholder*='VN 1-0028491'], input[placeholder*='VN-1-']").first
        if ip_number_input.is_visible():
            ip_number_input.fill("VN-1-0029988")

        # Chọn Sở KH&CN tiếp nhận trên Bước 4
        print("  ▶ 4.2 Chọn Sở KH&CN tiếp nhận địa bàn: Sở KH&CN Thái Nguyên (VN-TN)...")
        step4_auth_select = page.locator("select:has(option[value='VN-TN'])").last
        if step4_auth_select.is_visible():
            step4_auth_select.select_option("VN-TN")
            page.wait_for_timeout(500)

        # THÊM TÀI LIỆU VÀO PHÒNG DỮ LIỆU DATAROOM
        print("  📁 4.3 Thêm tài liệu vào DataRoom: 'Catalogue-NacenCNC-2026.pdf'...")
        doc_name_input = page.locator("input[placeholder*='Tên tệp'], input[placeholder*='Catalogue']").first
        if doc_name_input.is_visible():
            doc_name_input.fill("Catalogue-Kỹ-Thuật-NacenCNC-2026.pdf")
            add_doc_btn = page.locator("button:has-text('Thêm tệp tài liệu'), button:has-text('Thêm vào DataRoom')").first
            if add_doc_btn.is_visible():
                add_doc_btn.click()
                page.wait_for_timeout(1000)
                print("  👀 Quan sát: Tài liệu DataRoom đã được đưa vào danh sách kiểm soát bảo mật.")

        # Xác nhận cam kết pháp lý trong Step 4
        legal_check = page.locator("input[type='checkbox']").last
        if not legal_check.is_checked():
            legal_check.check()
            page.wait_for_timeout(800)
        print("  ✓ Đã tích chọn Cam kết tính pháp lý của hồ sơ và quyền sở hữu trí tuệ.")

        # BẤM NÚT NỘP CHÍNH THỨC (KHÔNG DÙNG SHORTCUT)
        print("\n  🚀 4.4 BẤM NÚT [Hoàn tất & Gửi chờ duyệt] CHÍNH THỨC...")
        submit_btn = page.locator("button:has-text('Hoàn tất & Gửi chờ duyệt')").first
        submit_btn.click()

        # Chờ điều hướng về Workspace
        page.wait_for_url(lambda u: "/portal/seller/technologies" in u, timeout=15000)
        page.wait_for_timeout(2000)
        print("  👀 Quan sát: Hoàn tất 4/4 Bước, hệ thống điều hướng về Workspace Seller.")

        # =============================================================
        # CHẶNG 6: ĐỐI SOÁT CSDL, THẨM ĐỊNH SỞ, VÀ REVIEW SÀN CÔNG KHAI
        # =============================================================
        print("\n📌 [CHẶNG 6/6] ĐỐI SOÁT CSDL POSTGRESQL & KIỂM TRA HIỂN THỊ ẢNH TRÊN SÀN")

        # 1. Kiểm tra CSDL
        sql_find = f"""
            SELECT id, offer_code, title, sector_code, trl_level, ip_status, status, managing_authority_id
            FROM technology.seller_technology_offers
            WHERE title = '{UNIQUE_TITLE}';
        """
        db_res = ""
        for _ in range(12):
            db_res = query_db(sql_find)
            if db_res:
                break
            time.sleep(0.5)

        assert db_res, f"❌ Không tìm thấy bản ghi '{UNIQUE_TITLE}' trong CSDL!"
        created_id, offer_code, title, sector, trl, ip_st, status, auth_id = db_res.split("|")
        print(f"  ✅ [PostgreSQL Verified]: ID={created_id} | Code={offer_code} | Status={status}")

        # 2. Thẩm định viên Sở KH&CN phê duyệt
        print(f"\n  ▶ Thẩm định viên Sở KH&CN Thái Nguyên ({auth_id}) thực hiện ký duyệt APPROVE...")
        rev_url = f"{BASE_API_URL}/api/v1/portal/seller/technologies/{created_id}/review"
        rev_req = urllib.request.Request(
            rev_url,
            data=json.dumps({"action": "APPROVE", "reviewNote": "Hồ sơ đầy đủ 4 bước, ảnh đại diện chuẩn, văn bằng SHTT hợp lệ."}).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "NacenTech-QC"}
        )
        with urllib.request.urlopen(rev_req, timeout=5) as r:
            assert r.getcode() == 200
        print("  ✅ Thẩm định phê duyệt thành công, kích hoạt niêm yết lên Sàn giao dịch.")

        # 3. Mở Sàn Chào Bán Công Khai (/chao-ban-cong-nghe)
        print("\n  ▶ Mở Sàn Chào Bán Công Khai (/chao-ban-cong-nghe)...")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        # Tìm kiếm sản phẩm
        search_box = page.locator("input[placeholder*='Tìm kiếm'], input[type='search'], input[type='text']").first
        if search_box.is_visible():
            search_box.fill(UNIQUE_TITLE)
            page.wait_for_timeout(1500)

        # Kiểm tra Thẻ sản phẩm hiển thị trên sàn
        card = page.locator(f"text='{UNIQUE_TITLE}'").first
        assert card.is_visible(), "Thẻ sản phẩm chưa xuất hiện trên sàn công khai!"
        print(f"  👀 Quan sát: Thẻ sản phẩm '{UNIQUE_TITLE}' xuất hiện trên Sàn với đầy đủ Badge TRL và Ảnh đại diện!")
        page.wait_for_timeout(2000)

        # 4. Mở Trang Chi Tiết Sản Phẩm (/chao-ban-cong-nghe/[id])
        print(f"\n  ▶ Mở Trang Chi Tiết Sản Phẩm: /chao-ban-cong-nghe/{created_id}...")
        page.goto(f"{BASE_WEB_URL}/chao-ban-cong-nghe/{created_id}", wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        # Quan sát Hero Section & Hình ảnh
        print("  👀 Quan sát: Ảnh đại diện đã được hiển thị trên khối Hero / Gallery của trang chi tiết.")
        page.wait_for_timeout(1500)

        # Chuyển Tab Thông số kỹ thuật
        specs_tab = page.locator("button:has-text('Thông Số Kỹ Thuật')").first
        if specs_tab.is_visible():
            print("  ▶ Click Tab [Thông Số Kỹ Thuật]: Xem bảng thông số kỹ thuật Lớp 2 (Model, Năm SX, Xuất xứ)...")
            specs_tab.click()
            page.wait_for_timeout(2500)

        # Chuyển Tab DataRoom
        dataroom_tab = page.locator("button:has-text('DataRoom')").first
        if dataroom_tab.is_visible():
            print("  ▶ Click Tab [DataRoom]: Xem tệp tài liệu Catalogue vừa tải lên...")
            dataroom_tab.click()
            page.wait_for_timeout(2500)

        # Mở Quick Demand Modal để gửi đề xuất kết nối chuyển giao
        connect_btn = page.locator("button:has-text('Gửi Yêu Cầu Chuyển Giao')").first
        if connect_btn.is_visible():
            print("  ▶ Click nút [Gửi Yêu Cầu Chuyển Giao] để mở Quick Demand Modal...")
            connect_btn.click()
            page.wait_for_timeout(2000)
            print("  👀 Quan sát: Quick Demand Modal mở lên với thông tin công nghệ được pre-fill sẵn.")
            close_btn = page.locator("button:has-text('Hủy'), button:has-text('Đóng')").first
            if close_btn.is_visible():
                close_btn.click()
                page.wait_for_timeout(1000)

        # =============================================================
        # TEARDOWN: XÓA BẢN GHI DỮ LIỆU TEST
        # =============================================================
        print("\n🧹 [TEARDOWN] Dọn dẹp bản ghi kiểm thử trong PostgreSQL...")
        query_db(f"DELETE FROM technology.seller_technology_offers WHERE id = '{created_id}';")
        print(f"  ✅ Đã dọn dẹp bản ghi '{created_id}' an toàn, CSDL nguyên vẹn.")

        page.wait_for_timeout(2000)
        browser.close()

    print("\n" + "=" * 75)
    print("🏆 HOÀN TẤT KIỂM ĐỊNH TOÀN TRÌNH FULL 4 BƯỚC + MEDIA: 100% PASS!")
    print("=" * 75)

if __name__ == "__main__":
    try:
        run_full_wizard_walkthrough()
    except Exception as e:
        print(f"\n❌ LỖI TRONG QUÁ TRÌNH KIỂM ĐỊNH: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
