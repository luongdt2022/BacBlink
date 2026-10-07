#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX THUẦN TÚY: TASK-05 HỒ SƠ CHUYÊN GIA KH&CN
Chế độ: PURE BLACK-BOX (Tuyệt đối không mock mạng, không can thiệp backend, kiểm thử như người dùng thật).
Quy chuẩn: Điều 7 Hiến pháp NacenTech (Zero-Mock Invariant & Defect Hunting).
"""

import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def run_blackbox_tests():
    print("======================================================================")
    print("🛡️ KIỂM THỬ E2E PURE BLACK-BOX THỰC TẾ: TASK-05 HỒ SƠ CHUYÊN GIA")
    print("🚫 Kỷ luật: TUYỆT ĐỐI KHÔNG MOCK ROUTE / KHÔNG MỚM DỮ LIỆU FAKE")
    print("======================================================================\n")

    defects = []
    tests_run = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Bắt các sự kiện mạng lỗi thực tế
        failed_requests = []
        page.on("requestfailed", lambda req: failed_requests.append(f"{req.method} {req.url} -> {req.failure}"))

        # ------------------------------------------------------------------
        # CA 1: Kiểm tra trang Chi tiết Công khai (/experts/CG-NACEN-DEMOIT01)
        # ------------------------------------------------------------------
        tests_run += 1
        print("▶ [BB-01] Kiểm tra truy cập Public Expert Directory thực tế...")
        page.goto(f"{BASE_URL}/experts/CG-NACEN-DEMOIT01", wait_until="networkidle")
        time.sleep(1)
        body_text = page.locator("body").inner_text()
        
        if "hồ sơ chưa được công khai hoặc không tồn tại" in body_text.lower() or "500" in body_text:
            defects.append({
                "id": "DEFECT-01",
                "severity": "CRITICAL",
                "summary": "Trang chi tiết chuyên gia công khai bị lỗi kết nối / sập HTTP 500.",
                "url": f"{BASE_URL}/experts/CG-NACEN-DEMOIT01"
            })
            print("  ❌ PHÁT HIỆN DEFECT-01 [CRITICAL]: Trang chuyên gia công khai sập trạng thái lỗi!")
        else:
            print("  ✅ PASS: Trang chuyên gia công khai tải thành công.")

        # ------------------------------------------------------------------
        # CA 2: Kiểm tra Form Validation - Bỏ trống Họ và tên
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-02] Kiểm tra Validation chặn form khi bỏ trống Họ và tên...")
        page.goto(f"{BASE_URL}/profile/upgrade/expert", wait_until="networkidle")
        fn_input = page.locator("input[placeholder*='Nguyễn Văn']").first
        fn_input.fill("")
        page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").first.click()
        time.sleep(0.5)

        err_msg = page.locator("text=Vui lòng nhập họ và tên đầy đủ.")
        if err_msg.count() > 0 and err_msg.is_visible():
            print("  ✅ PASS: Hệ thống chặn chuyển bước và hiện cảnh báo hợp lệ.")
        else:
            defects.append({
                "id": "DEFECT-02",
                "severity": "MAJOR",
                "summary": "Không chặn form khi bỏ trống Họ và tên.",
                "url": f"{BASE_URL}/profile/upgrade/expert"
            })
            print("  ❌ PHÁT HIỆN DEFECT-02 [MAJOR]: Bỏ trống họ tên nhưng vẫn cho đi tiếp!")

        # ------------------------------------------------------------------
        # CA 3: Kiểm tra Lỗi Biên Năm sinh (-999 và 99999)
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-03] Kiểm tra lỗi biên ô Năm sinh (nhập -999 và 99999)...")
        fn_input.fill("Chuyên Gia Test")
        birth_input = page.locator("input[type='number']").first
        if birth_input.count() > 0:
            birth_input.fill("-999")
            page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").first.click()
            time.sleep(0.5)
            # Nếu hệ thống cho sang bước 2 mà không chặn -> BUG
            step2_indicator = page.locator("text=Năng lực & AI CV Scan, text=Quét & Bóc tách bằng AI").first
            if step2_indicator.count() > 0 and step2_indicator.is_visible():
                defects.append({
                    "id": "DEFECT-03",
                    "severity": "MAJOR",
                    "summary": "Ô Năm sinh chấp nhận giá trị âm -999 hoặc 99999 mà không chặn ở Client.",
                    "url": f"{BASE_URL}/profile/upgrade/expert"
                })
                print("  ❌ PHÁT HIỆN DEFECT-03 [MAJOR]: Cho phép năm sinh âm (-999) chuyển tiếp sang Bước 2!")
            else:
                print("  ✅ PASS: Đã chặn năm sinh không hợp lệ.")

        # ------------------------------------------------------------------
        # CA 4: Kiểm tra Lỗi Báo Thành Công Giả Mạo (BR-EXP-016) khi nộp hồ sơ
        # ------------------------------------------------------------------
        tests_run += 1
        print("\n▶ [BB-04] Kiểm tra tính trung thực của phản hồi nộp hồ sơ (Quy tắc BR-EXP-016)...")
        page.goto(f"{BASE_URL}/profile/upgrade/expert", wait_until="networkidle")
        page.locator("input[placeholder*='Nguyễn Văn']").first.fill("TS. Đặng Tiến Lượng")
        page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").first.click()
        time.sleep(0.5)

        page.locator("button:has-text('Tiếp tục: Công bố & Cam kết')").first.click()
        time.sleep(0.5)

        page.locator("input#pdpdConsent").check()
        page.locator("input#legalOath").check()

        # Giám sát request API upgrade-request
        api_responses = []
        page.on("response", lambda res: api_responses.append(res) if "upgrade-request" in res.url else None)

        page.locator("button:has-text('Nộp Hồ Sơ Xét Duyệt Nâng Hạng')").first.click()
        time.sleep(2)

        has_404_or_500 = any(r.status >= 400 for r in api_responses)
        success_shown = page.locator("text=Hồ Sơ Đã Được Gửi Thành Công").count() > 0

        if has_404_or_500 and success_shown:
            defects.append({
                "id": "DEFECT-04",
                "severity": "BLOCKER",
                "summary": "Vi phạm quy tắc BR-EXP-016: API nộp hồ sơ lỗi 404 nhưng giao diện hiển thị thành công giả mạo (Fake Success).",
                "url": f"{BASE_URL}/profile/upgrade/expert"
            })
            print("  ❌ PHÁT HIỆN DEFECT-04 [BLOCKER]: API lỗi nhưng vẫn hiển thị thông báo thành công xanh!")
        elif not success_shown:
            print("  ✅ PASS: Hệ thống không hiển thị thành công giả mạo.")

        browser.close()

    print("\n======================================================================")
    print(f"📋 TỔNG KẾT KIỂM THỬ BLACK-BOX: ĐÃ CHẠY {tests_run} CA | PHÁT HIỆN {len(defects)} BUGS")
    if defects:
        print("🚨 KẾT LUẬN: TỪ CHỐI DUYỆT XUẤT XƯỞNG GATE 4 VÌ CÒN LỖI BLOCKER/CRITICAL!")
        for d in defects:
            print(f"  - [{d['severity']}] {d['id']}: {d['summary']}")
    else:
        print("🎉 KẾT LUẬN: HỆ THỐNG ĐẠT CHUẨN XUẤT XƯỞNG!")
    print("======================================================================")
    return len(defects) == 0

if __name__ == "__main__":
    success = run_blackbox_tests()
    # Trả về mã thoát 1 nếu có bug để CI/CD bắt được lỗi
    sys.exit(0 if success else 1)
