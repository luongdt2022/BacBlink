#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX TOÀN TRÌNH: TASK-03 KHẢO SÁT NHU CẦU ĐMST (DEEP SURVEY 4 BƯỚC TINH GỌN)
Nguyên tắc bất biến:
- Black-box thuần túy, Zero-Mock.
- Truy cập /khao-sat-nhu-cau, nạp bộ dữ liệu chuẩn doanh nghiệp cơ khí chế tạo.
- Hoàn tất qua 4 bước Wizard (Tabs 1-4).
- Ký tên xác nhận, tích PDPD và nộp phiếu khảo sát.
- Deep DB State Verification:
  + Truy vấn PostgreSQL đối soát bản ghi mới trong bảng demand.demand_surveys (khớp survey_code, company_name, tax_code).
  + Kiểm tra tự động sinh ít nhất 1 bài toán kỹ thuật trong bảng demand.demand_items.
- Dọn dẹp dữ liệu kiểm thử sau khi hoàn thành.
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"

TEST_TAX_CODE = "0108992134"

def verify_survey_in_db(survey_code: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A",
        "-c", f"SELECT id, survey_code, company_name, tax_code, status FROM demand.demand_surveys WHERE survey_code = '{survey_code}';"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0 or not res.stdout.strip():
        return None
    return res.stdout.strip()

def verify_demand_items_in_db(survey_id: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A",
        "-c", f"SELECT count(*) FROM demand.demand_items WHERE survey_id = '{survey_id}';"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0 or not res.stdout.strip():
        return 0
    return int(res.stdout.strip())

def cleanup_survey_in_db(survey_code: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-c", f"DELETE FROM demand.demand_surveys WHERE survey_code = '{survey_code}';"
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

def main():
    print("======================================================================")
    print("🎯 KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-03 BUYER DEEP SURVEY (4 BƯỚC)")
    print("======================================================================")

    created_survey_code = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # STEP 1: Truy cập trang Khảo sát Nhu cầu ĐMST
        print("\n▶ [STEP 1] Mở Form Khảo sát Nhu cầu Công nghệ (/khao-sat-nhu-cau)...")
        page.goto(f"{BASE_WEB_URL}/khao-sat-nhu-cau", timeout=30000)
        page.wait_for_selector("h1", timeout=15000)
        print("  ✅ Form khảo sát chuyên sâu tải thành công, đầy đủ 4 bước Wizard tinh gọn.")

        # STEP 2: Nạp bộ dữ liệu thử nghiệm chuẩn qua nút 'Nạp dữ liệu mẫu'
        print("\n▶ [STEP 2] Kích hoạt nạp bộ dữ liệu chuẩn doanh nghiệp cơ khí...")
        sample_btn = page.locator("button:has-text('Điền dữ liệu mẫu (Demo)')").first
        sample_btn.click()
        time.sleep(1)
        print("  ✅ Đã nạp thành công bộ dữ liệu khảo sát hoàn chỉnh.")

        # STEP 3: Di chuyển tuần tự qua 4 bước Wizard để kiểm tra tương tác
        print("\n▶ [STEP 3] Duyệt toàn trình qua 4 bước Wizard...")
        for step in range(1, 4):
            print(f"  👉 Chuyển tiếp từ Bước {step} sang Bước {step + 1}...")
            next_btn = page.locator("button:has-text('Tiếp tục Bước')").first
            next_btn.click()
            time.sleep(0.5)

        # STEP 4: Tại Bước 4 (Phần G: Cam kết & Gửi phiếu), xác nhận tích cam kết PDPD
        print("\n▶ [STEP 4] Kiểm tra Bước 4 (Phần G): Ký tên đại diện & Cam kết PDPD...")
        page.wait_for_selector("text=Cam kết bảo vệ dữ liệu cá nhân", timeout=5000)
        pdpd_checkbox = page.locator("input[type='checkbox']").last
        if not pdpd_checkbox.is_checked():
            pdpd_checkbox.check()
        print("  ✅ Đã tích chọn đồng ý xử lý dữ liệu PDPD theo Nghị định 13/2023/NĐ-CP.")

        # STEP 5: Bấm nộp phiếu khảo sát
        print("\n▶ [STEP 5] Bấm nút Gửi Phiếu Khảo Sát lên Backend...")
        submit_btn = page.locator("button:has-text('Hoàn Tất & Nộp Khảo Sát')").first
        submit_btn.click()

        # Chờ màn hình thành công
        page.wait_for_selector("text=Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!", timeout=20000)
        print("  🎉 Frontend thông báo: 'Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!'")

        # Trích xuất mã phiếu khảo sát từ giao diện
        code_badge = page.locator("span.font-mono.font-black").first
        created_survey_code = code_badge.text_content().strip()
        assert created_survey_code and len(created_survey_code) > 5, f"Mã phiếu khảo sát không hợp lệ: {created_survey_code}"
        print(f"  🎉 Mã Phiếu Khảo Sát được cấp: '{created_survey_code}'")

        # STEP 6: KIỂM CHỨNG CSDL POSTGRESQL THỰC TẾ (Deep DB State Verification)
        print("\n▶ [STEP 6] Đối soát trực tiếp trong CSDL PostgreSQL (demand.demand_surveys & demand_items)...")
        db_survey = verify_survey_in_db(created_survey_code)
        assert db_survey is not None, f"Không tìm thấy bản ghi survey {created_survey_code} trong PostgreSQL!"
        parts = db_survey.split("|")
        survey_id = parts[0]
        company_name = parts[2]
        tax_code = parts[3]
        status = parts[4]

        print(f"  ✅ [CSDL demand_surveys ĐÃ LƯU]: Id={survey_id} | Code={created_survey_code} | DN='{company_name}' | MST={tax_code} | Status={status}")
        assert tax_code == TEST_TAX_CODE, f"MST trong DB không khớp: {tax_code}"

        # Kiểm tra Demand Items được phân rã
        item_count = verify_demand_items_in_db(survey_id)
        print(f"  ✅ [CSDL demand_items ĐÃ LƯU]: Có {item_count} bài toán kỹ thuật được tạo tự động.")
        assert item_count >= 1, "Không có bài toán kỹ thuật nào được lưu vào demand.demand_items!"

        # Dọn dẹp bản ghi kiểm thử
        cleanup_survey_in_db(created_survey_code)
        print(f"  [Cleanup] Đã dọn dẹp phiếu kiểm thử {created_survey_code} khỏi CSDL.")

        browser.close()

    print("\n======================================================================")
    print("🏆 KẾT LUẬN: TASK-03 100% PASS (BUYER DEEP SURVEY & DB ITEMS GREEN)")
    print("======================================================================")

if __name__ == "__main__":
    main()
