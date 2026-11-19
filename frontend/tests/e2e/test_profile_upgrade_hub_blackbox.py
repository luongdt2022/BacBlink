#!/usr/bin/env python3
"""
=============================================================================
QC BLACK-BOX & 4-TIER PLAYWRIGHT E2E SUITE
MODULE: PROFILE UPGRADE HUB (NÂNG HẠNG TÀI KHOẢN 4 LỰA CHỌN)
URL: http://localhost:3000/profile/upgrade
TÀI KHOẢN KIỂM THỬ THẬT: public.user@demo.nacentech.vn (PUBLIC_USER)
KỶ LUẬT: ZERO-MOCK, 100% INTERACTIVE TESTING & DEEP POSTGRESQL STATE VERIFICATION
CR-2026-021: ĐẶC TẢ GIAN HÀNG SELLER BẮT BUỘC ĐỊNH DANH PHÁP NHÂN (DOANH NGHIỆP / VIỆN TRƯỜNG)
=============================================================================
"""

import sys
import os
import time
import json
import tempfile
import subprocess
from datetime import datetime
from playwright.sync_api import sync_playwright, expect

BASE_WEB_URL = "http://localhost:3000"
TEST_USER_EMAIL = "public.user@demo.nacentech.vn"
TEST_USER_PASS = "Password@123"

def psql_query(sql: str) -> str:
    """Truy vấn trực tiếp CSDL PostgreSQL container để đối soát Black-Box không qua mock"""
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-F", "|", "-c", sql
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

    # Chuẩn bị file tạm cho kiểm thử tải tệp (PDF hợp lệ và TXT không hợp lệ)
    temp_pdf = os.path.join(tempfile.gettempdir(), "test_seller_legal_doc.pdf")
    with open(temp_pdf, "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n00000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF\n")

    temp_txt = os.path.join(tempfile.gettempdir(), "test_seller_invalid_doc.txt")
    with open(temp_txt, "w", encoding="utf-8") as f:
        f.write("Tệp văn bản không đúng định dạng PDF phục vụ kịch bản kiểm thử phá hoại.")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Danh sách bắt alert dialog của trình duyệt
        alert_dialogs = []
        page.on("dialog", lambda dialog: (alert_dialogs.append(dialog.message), dialog.accept()))

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
        # CẤP 1 & 4 (HỒ SƠ DOANH NGHIỆP ĐMST): TRA CỨU MST & SUBMIT CSDL THẬT
        # =====================================================================
        log_header("Cấp 1 & 4: Hồ Sơ Doanh Nghiệp ĐMST (MST & Đối Soát PostgreSQL)")

        # Mở Modal Doanh nghiệp ĐMST
        page.click('button:has-text("Xác thực MST Doanh Nghiệp")')
        page.wait_for_selector('h3:has-text("Nâng Cấp Hồ Sơ — Doanh Nghiệp ĐMST")', timeout=3000)
        log_pass("Mở thành công Modal Doanh nghiệp ĐMST.")

        # Tra cứu MST trống
        page.click('button:has-text("Tra Cứu MST")')
        expect(page.locator("text=Vui lòng nhập Mã số thuế để tra cứu.")).to_be_visible()
        log_pass("Chặn tra cứu và hiển thị thông báo lỗi khi ô MST trống.")

        # Nhập MST 0109998888 và bấm Tra Cứu
        page.fill('input[placeholder="0101234567"]', "0109998888")
        page.click('button:has-text("Tra Cứu MST")')
        page.wait_for_selector('text=Đã tìm thấy dữ liệu doanh nghiệp hợp lệ từ CSDL ĐKKD Quốc Gia', timeout=4000)
        
        # Tên doanh nghiệp tự động điền
        company_input_val = page.input_value('input[placeholder="Công ty TNHH Phát Triển Công Nghệ & ĐMST"]')
        assert "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST QUỐC GIA" in company_input_val, f"Lỗi tên DN: {company_input_val}"
        log_pass(f"Tra cứu MST thành công và tự động điền tên DN: {company_input_val}")

        # Tick cam kết pháp lý & Nộp đơn
        page.check('input#legalPledgeEnt')
        page.click('button:has-text("Gửi Hồ Sơ Thẩm Định")')
        page.wait_for_selector('h4:has-text("Nộp Hồ Sơ Doanh Nghiệp ĐMST Thành Công")', timeout=6000)
        
        feedback_code = page.locator('span:has-text("REQ-INST-")').inner_text()
        assert feedback_code.startswith("REQ-INST-"), f"Mã tracking không hợp lệ: {feedback_code}"
        log_pass(f"Nhận mã hồ sơ Doanh nghiệp ĐMST thành công: {feedback_code}")

        # ĐỐI SOÁT CSDL POSTGRESQL THẬT
        db_count = psql_query(
            "SELECT count(*) FROM identity.approval_requests "
            "WHERE request_type='INSTITUTION' AND status='PENDING_REVIEW' "
            "AND user_id='9baa0040-f670-47ee-b1f7-02d7b41d5ac3';"
        )
        assert int(db_count) >= 1, f"LỖI CSDL: Không tìm thấy bản ghi INSTITUTION trong approval_requests! (count={db_count})"
        log_pass(f"ĐỐI SOÁT CSDL POSTGRESQL THÀNH CÔNG: Bản ghi INSTITUTION đã lưu trong identity.approval_requests (Tổng số: {db_count})")

        # =====================================================================
        # CR-2026-021: NÂNG CẤP KIỂM THỬ MODAL SELLER PHỦ KÍN 4 CẤP ĐỘ
        # =====================================================================
        log_header("CR-2026-021: NÂNG CẤP KIỂM THỬ MODAL SELLER PHỦ KÍN 4 CẤP ĐỘ")

        # Mở Modal Seller
        page.click('button:has-text("Đăng Ký Gian Hàng Seller")')
        page.wait_for_selector('h3:has-text("Đăng Ký Mở Gian Hàng — Bên Bán (Seller)")', timeout=3000)
        log_pass("Mở thành công Modal Seller.")

        # ---------------------------------------------------------------------
        # CẤP 1 & 2: VALIDATION, KỊCH BẢN PHÁ HOẠI & CHUYỂN TABS (DOANH NGHIỆP / VIỆN TRƯỜNG)
        # ---------------------------------------------------------------------
        log_header("Cấp 1 & 2: Kiểm thử Validation, Upload Sai Định Dạng & Chuyển Tabs")

        # Kiểm tra hiển thị mặc định: Tab Doanh nghiệp active, có input MST và Tên DN
        expect(page.locator('button[data-testid="seller-tab-enterprise"]')).to_be_visible()
        expect(page.locator('button[data-testid="seller-tab-institution"]')).to_be_visible()
        expect(page.locator('input[placeholder="0101234567"]')).to_be_visible()
        expect(page.locator('input[placeholder="CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST"]')).to_be_visible()
        log_pass("Mặc định Modal hiển thị đúng Tab Doanh nghiệp và các trường MST, Tên Đơn vị.")

        # Thử bấm Nộp đơn khi chưa nhập MST & chưa chọn file -> Client validation chặn submit
        alert_dialogs.clear()
        page.evaluate("document.querySelector('form.space-y-4').noValidate = true")
        page.click('button:has-text("Nộp Đơn Đăng Ký (SLA 24h)")')
        page.wait_for_timeout(500)
        assert any("Mã số thuế doanh nghiệp không được để trống" in msg for msg in alert_dialogs), \
            f"Lỗi: Không chặn khi thiếu MST! Alerts: {alert_dialogs}"
        log_pass("Cấp 1: Chặn submit thành công khi chưa điền MST hợp lệ (Alert kiểm soát biên).")

        # Kịch bản phá hoại: Upload file không phải PDF (.txt)
        page.set_input_files('input[data-testid="seller-file-input"]', temp_txt)
        page.wait_for_timeout(300)
        expect(page.locator("text=Tệp văn bản pháp lý minh chứng bắt buộc phải là định dạng PDF.")).to_be_visible()
        log_pass("Cấp 1 (Phá hoại): Chặn tệp không phải .pdf thành công và hiển thị cảnh báo đỏ chuẩn mực.")

        # Chuyển sang Tab 2 (Viện / Trường / R&D)
        page.click('button[data-testid="seller-tab-institution"]')
        page.wait_for_timeout(300)

        # Kiểm tra form chuyển đổi linh hoạt sang Số QĐ và Tên Viện/Trường
        expect(page.locator('input[placeholder="Ví dụ: 128/QĐ-BKHCN"]')).to_be_visible()
        expect(page.locator('input[placeholder="Ví dụ: Viện Hàn Lâm Khoa Học & Công Nghệ Việt Nam"]')).to_be_visible()
        log_pass("Cấp 2: Chuyển đổi linh hoạt sang Tab Viện / Trường R&D với các trường Số QĐ và Tên Viện.")

        # Thử bấm Nộp đơn khi chưa nhập Số QĐ ở Tab Viện/Trường -> Bị chặn
        alert_dialogs.clear()
        page.click('button:has-text("Nộp Đơn Đăng Ký (SLA 24h)")')
        page.wait_for_timeout(500)
        assert any("Số Quyết định thành lập / Giấy phép KH&CN không được để trống" in msg for msg in alert_dialogs), \
            f"Lỗi: Không chặn khi thiếu Số QĐ! Alerts: {alert_dialogs}"
        log_pass("Cấp 1 & 2: Chặn submit thành công khi Tab Viện/Trường thiếu Số Quyết định.")

        # ---------------------------------------------------------------------
        # CẤP 3: TRA CỨU MÃ SỐ THUẾ (MST) VÀ TỰ ĐỘNG ĐIỀN TÊN PHÁP NHÂN
        # ---------------------------------------------------------------------
        log_header("Cấp 3: Tra Cứu Mã Số Thuế (MST) Hợp Lệ & Tự Động Điền")

        # Chuyển lại Tab 1 (Doanh Nghiệp)
        page.click('button[data-testid="seller-tab-enterprise"]')
        page.wait_for_timeout(300)
        expect(page.locator('input[placeholder="0101234567"]')).to_be_visible()

        # Nhập MST 0101234567 và bấm Tra Cứu MST
        page.fill('input[placeholder="0101234567"]', "0101234567")
        page.click('button:has-text("Tra Cứu MST")')
        page.wait_for_selector('text=Đã tìm thấy dữ liệu doanh nghiệp hợp lệ từ CSDL ĐKKD Quốc Gia', timeout=4000)

        seller_org_val = page.input_value('input[placeholder="CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ ĐMST"]')
        assert "0101234567" in seller_org_val, f"Lỗi tên doanh nghiệp sau tra cứu: {seller_org_val}"
        log_pass(f"Cấp 3: Tra cứu MST thành công, tự động cập nhật tên pháp nhân: {seller_org_val}")

        # ---------------------------------------------------------------------
        # CẤP 4: NỘP ĐƠN THẬT & ĐỐI SOÁT CSDL POSTGRESQL THẬT (ZERO-MOCK)
        # ---------------------------------------------------------------------
        log_header("Cấp 4: Nộp Đơn Thật & Đối Soát PostgreSQL Thật (SLA 24h)")

        # Upload tệp PDF hợp lệ
        page.set_input_files('input[data-testid="seller-file-input"]', temp_pdf)
        page.wait_for_timeout(300)
        expect(page.locator("text=test_seller_legal_doc.pdf")).to_be_visible()
        log_pass("Đã tải lên tệp PDF hợp lệ (test_seller_legal_doc.pdf).")

        # Điền các trường dùng chung
        page.select_option('select >> nth=0', "LV08") # Lĩnh vực TT17: Tự động hóa & Robot
        page.select_option('select >> nth=1', "HN")   # Sở KH&CN TP. Hà Nội
        page.fill('textarea[placeholder*="Tóm tắt các sáng chế"]', "Doanh nghiệp công nghệ cao chuyên sản xuất robot công nghiệp và hệ thống cảm biến TRL 6-9.")
        page.check('input#sellerPledgeCheck') # Cam kết SHTT và quy chế sàn
        log_pass("Điền đầy đủ thông tin: Lĩnh vực TT17 (LV08), Sở KH&CN (HN), Mô tả năng lực và tick cam kết SHTT.")

        # Bấm Nộp đơn đăng ký mở gian hàng Seller
        page.click('button:has-text("Nộp Đơn Đăng Ký (SLA 24h)")')
        page.wait_for_selector('h4:has-text("Đăng Ký Mở Gian Hàng Seller Thành Công")', timeout=8000)

        seller_tracking_code = page.locator('span:has-text("REQ-SHOP-")').inner_text()
        assert seller_tracking_code.startswith("REQ-SHOP-"), f"Mã tracking Seller không hợp lệ: {seller_tracking_code}"
        log_pass(f"Nhận mã yêu cầu mở gian hàng Seller thành công từ hệ thống: {seller_tracking_code}")

        # =====================================================================
        # ĐỐI SOÁT TRỰC TIẾP CSDL POSTGRESQL THẬT (DEEP DB STATE VERIFICATION)
        # =====================================================================
        log_header("ĐỐI SOÁT SÂU TRỰC TIẾP CSDL POSTGRESQL THẬT (ZERO-MOCK)")
        
        sql_verify = """
        SELECT payload_json::text, status, sla_deadline_utc::text, created_at::text 
        FROM identity.approval_requests 
        WHERE request_type='SHOP' 
        ORDER BY created_at DESC LIMIT 1;
        """
        db_raw = psql_query(sql_verify)
        if not db_raw:
            log_fail("Không trích xuất được bản ghi SHOP nào từ identity.approval_requests!")
        
        parts = db_raw.split("|")
        if len(parts) < 4:
            log_fail(f"Dữ liệu bản ghi trả về không đủ 4 cột: {db_raw}")

        payload_json_str, status, sla_deadline_str, created_at_str = parts[0], parts[1], parts[2], parts[3]
        payload = json.loads(payload_json_str)

        print("\n  [BẰNG CHỨNG CSDL POSTGRESQL TRÍCH XUẤT]:")
        print(f"  - Request Type: SHOP")
        print(f"  - Status: {status}")
        print(f"  - Created At: {created_at_str}")
        print(f"  - SLA Deadline UTC: {sla_deadline_str}")
        print(f"  - Payload: {json.dumps(payload, ensure_ascii=False, indent=4)}")

        # 1. Kiểm tra trạng thái
        assert status == "PENDING_REVIEW", f"Lỗi: status không phải PENDING_REVIEW (Thực tế: {status})"
        log_pass("Trạng thái CSDL: PENDING_REVIEW (chờ phê duyệt)")

        # 2. Kiểm tra Payload JSON
        assert payload.get("entityType") == "ENTERPRISE", f"Lỗi entityType: {payload.get('entityType')}"
        log_pass("Payload entityType: ENTERPRISE (Doanh nghiệp)")

        assert payload.get("taxCode") == "0101234567", f"Lỗi taxCode: {payload.get('taxCode')}"
        log_pass("Payload taxCode: 0101234567 (Khớp mã số thuế đã tra cứu)")

        assert payload.get("legalDocUrl", "").endswith(".pdf"), f"Lỗi legalDocUrl không kết thúc bằng .pdf: {payload.get('legalDocUrl')}"
        log_pass(f"Payload legalDocUrl: {payload.get('legalDocUrl')} (Định dạng PDF chuẩn)")

        assert payload.get("pledgeAgreed") is True, f"Lỗi pledgeAgreed không phải True: {payload.get('pledgeAgreed')}"
        log_pass("Payload pledgeAgreed: True (Đã cam kết SHTT)")

        assert payload.get("mainSector") == "LV08", f"Lỗi mainSector: {payload.get('mainSector')}"
        log_pass("Payload mainSector: LV08 (Tự động hóa & Robot)")

        assert payload.get("province") == "HN", f"Lỗi province: {payload.get('province')}"
        log_pass("Payload province: HN (Sở KH&CN Hà Nội)")

        # 3. Kiểm tra SLA 24h
        try:
            def parse_pg_time(t_str):
                clean = t_str.split("+")[0].strip()
                if "." in clean:
                    return datetime.strptime(clean, "%Y-%m-%d %H:%M:%S.%f")
                return datetime.strptime(clean, "%Y-%m-%d %H:%M:%S")

            t_created = parse_pg_time(created_at_str)
            t_sla = parse_pg_time(sla_deadline_str)
            diff_hours = (t_sla - t_created).total_seconds() / 3600.0

            assert abs(diff_hours - 24.0) < 0.1, f"Lỗi SLA deadline: chênh lệch {diff_hours} giờ thay vì 24.0 giờ!"
            log_pass(f"SLA Deadline chuẩn xác tuyệt đối: {diff_hours:.2f} giờ kể từ thời điểm tạo ({created_at_str} -> {sla_deadline_str})")
        except Exception as e:
            log_fail(f"Lỗi khi đối soát thời hạn SLA: {e}")

        browser.close()

    # Dọn dẹp tệp tạm
    for p_file in [temp_pdf, temp_txt]:
        if os.path.exists(p_file):
            try:
                os.remove(p_file)
            except Exception:
                pass

    elapsed = round(time.time() - start_time, 2)
    log_header(f"TẤT CẢ 4 CẤP ĐỘ QC BLACK-BOX ĐÃ HOÀN TẤT VÀ PASS 100% (Thời gian: {elapsed}s)")

if __name__ == "__main__":
    run_profile_upgrade_hub_blackbox_suite()
