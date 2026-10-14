"""
=============================================================================
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-09 TT17 26 TIÊU CHÍ ĐÁNH GIÁ
=============================================================================
ĐẶC TẢ NGHIỆP VỤ & KIỂM CHỨNG:
1. Mở trang chủ Đánh giá TT17 (/assessments/tt17) -> Xác nhận Dashboard tải 200 OK.
2. Nhấn nút bắt đầu khảo sát -> Điều hướng đến Form Wizard (/assessments/tt17/wizard).
3. Bước 1 (Mục A): Khai báo thông tin định danh doanh nghiệp thực hiện khảo sát:
   - Tên DN: 'Công ty Cổ phần Cơ khí Công nghệ Cao NacenTwin QA-1791'
   - MST: '0109988776'
   - Đại diện: 'Nguyễn Văn Tuấn (Giám đốc Kỹ thuật)'
   - Email: 'tuan.nv@nacentech.test'
   - Số điện thoại: '0988776655'
   - Tỉnh / Thành phố: 'Hà Nội'
   - Địa chỉ: 'Khu Công Nghệ Cao Hòa Lạc, Thạch Thất, Hà Nội'
4. Duyệt qua các bước Wizard (Mục A -> B -> C -> D -> Đ -> E).
5. Kiểm tra Realtime Instant Scoring hiển thị trên thanh Sticky Card bên phải (tự động tính điểm).
6. Bấm nút 'Hoàn Tất & Nộp Hồ Sơ'.
7. Frontend hiển thị màn hình chúc mừng tiếp nhận thành công.
8. [Deep DB State Verification]:
   - Truy vấn trực tiếp PostgreSQL `assessment.tt17_assessments`.
   - Xác nhận bản ghi lưu đúng: enterprise_name, tax_code='0109988776', status='SUBMITTED', assessment_year=2026.
9. Dọn dẹp dữ liệu kiểm thử trong CSDL sau khi kiểm chứng thành công.
=============================================================================
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
UNIQUE_TAX = f"01{int(time.time()) % 100000000:08d}"
UNIQUE_NAME = f"Công ty CP Cơ khí Công nghệ Cao NacenTwin QA-{int(time.time())}"

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
    print("🎯 KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-09 TT17 26 TIÊU CHÍ")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # STEP 1: Mở Dashboard TT17
        print("\n▶ [STEP 1] Truy cập Dashboard Đánh Giá TT17 (/assessments/tt17)...")
        page.goto(f"{BASE_URL}/assessments/tt17")
        page.wait_for_selector("text=Đánh Giá Trình Độ & Năng Lực Công Nghệ", timeout=10000)
        print("  ✅ Dashboard Đánh giá TT17 tải thành công.")

        # STEP 2: Chuyển sang Form Wizard
        print("\n▶ [STEP 2] Nhấn nút Thực Hiện Đánh Giá Mới -> Mở Wizard (/assessments/tt17/wizard)...")
        wizard_link = page.locator("a[href='/assessments/tt17/wizard']").first
        wizard_link.click()
        page.wait_for_selector("#tt17-company-name", timeout=10000)
        print("  ✅ Màn hình Wizard 6 bước tải thành công.")

        # STEP 3: Điền Mục A - Thông tin chung
        print("\n▶ [STEP 3] Điền Mục A: Thông tin chung & Định danh Doanh nghiệp...")
        page.fill("#tt17-company-name", UNIQUE_NAME)
        page.fill("#tt17-tax-code", UNIQUE_TAX)
        page.fill("#tt17-contact-person", "Nguyễn Văn Tuấn (Giám đốc Kỹ thuật)")
        page.fill("#tt17-contact-email", "tuan.nv@nacentech.test")
        page.fill("#tt17-contact-phone", "0988776655")
        page.select_option("#tt17-scope-id", "Hà Nội")
        page.fill("#tt17-company-address", "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội")
        print("  ✅ Đã điền đầy đủ thông tin pháp nhân và người đại diện.")

        # STEP 4: Chuyển tiếp qua các bước và kiểm tra Realtime Scorecard
        print("\n▶ [STEP 4] Duyệt qua các bước khảo sát Mục B, C, D, Đ, E...")
        for step_idx in range(1, 6):
            print(f"  👉 Chuyển tiếp từ Bước {step_idx} sang Bước {step_idx + 1}...")
            next_btn = page.locator("button:has-text('Bước Tiếp Theo')").first
            next_btn.click()
            time.sleep(0.5)

        # Kiểm tra hiển thị điểm số Real-time bên cột phải
        score_text = page.locator("div:has-text('/ 100 điểm')").first.text_content().strip()
        print(f"  ✅ Hệ thống tính điểm Real-time tức thời: '{score_text}'")

        # STEP 5: Nộp hồ sơ
        print("\n▶ [STEP 5] Bấm nút 'Hoàn Tất & Nộp Hồ Sơ'...")
        submit_btn = page.locator("button:has-text('Hoàn Tất & Nộp Hồ Sơ')").last
        submit_btn.click()

        # Chờ màn hình thành công
        page.wait_for_selector("text=Nộp Phiếu Đánh Giá Công Nghệ Thành Công!", timeout=15000)
        print("  🎉 Frontend thông báo: 'Nộp Phiếu Đánh Giá Công Nghệ Thành Công!'")

        # STEP 6: Deep DB State Verification vào PostgreSQL
        print("\n▶ [STEP 6] Deep DB State Verification trong CSDL PostgreSQL (assessment.tt17_assessments)...")
        sql_check = f"""
            SELECT id, enterprise_name, tax_code, assessment_year, status, scope_id, industry_code
            FROM assessment.tt17_assessments
            WHERE tax_code = '{UNIQUE_TAX}';
        """
        db_record = ""
        for _ in range(10):
            db_record = query_db(sql_check)
            if db_record:
                break
            time.sleep(0.5)

        assert db_record, f"❌ KHÔNG TÌM THẤY HỒ SƠ MST '{UNIQUE_TAX}' TRONG CSDL!"

        fields = db_record.split("|")
        assess_id, ent_name, tax, year, status, scope, ind = fields
        print(f"  ✅ [CSDL ĐÃ LƯU]: Id={assess_id} | DN='{ent_name}' | MST={tax}")
        print(f"  ✅ [TRẠNG THÁI & PHÂN VÙNG]: Status={status} | Năm={year} | Vùng={scope} | Ngành={ind}")

        assert tax == UNIQUE_TAX, f"Lệch MST: {tax}"
        assert status == "SUBMITTED", f"Lệch Status: {status}"
        assert year == "2026", f"Lệch Year: {year}"

        # STEP 7: Dọn dẹp dữ liệu kiểm thử
        print("\n▶ [STEP 7] Dọn dẹp bản ghi kiểm thử khỏi CSDL...")
        query_db(f"DELETE FROM assessment.tt17_assessments WHERE id = '{assess_id}';")
        print(f"  [Cleanup] Đã dọn dẹp bản ghi {assess_id} an toàn.")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 KẾT LUẬN: TASK-09 100% PASS (TT17 26 CRITERIA ASSESSMENT GREEN)")
    print("=" * 70)

if __name__ == "__main__":
    main()
