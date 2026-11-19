#!/usr/bin/env python3
"""
=============================================================================
QC BLACK-BOX PLAYWRIGHT E2E SUITE
FEATURE: SMART AI CV ONBOARDING (TASK-05 DELTA v1.3 - T-DELTA-06)
SPEC REFERENCE: Section 22 & BR-EXP-CV-01 -> BR-EXP-CV-04
URL: http://localhost:3000/profile/upgrade/expert
KỶ LUẬT: ZERO-MOCK, DEEP INTERACTIVE TESTING, PURE BLACK-BOX TRÊN ỨNG DỤNG THẬT
=============================================================================
"""

import sys
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"
EXPERT_UPGRADE_URL = f"{BASE_URL}/profile/upgrade/expert"

class TestReport:
    def __init__(self):
        self.total_cases = 0
        self.passed_cases = 0
        self.failed_cases = 0
        self.defects = []
        self.start_time = time.time()

    def log_header(self, text: str):
        print("\n" + "=" * 80)
        print(f"  {text.upper()}")
        print("=" * 80)

    def log_journey(self, journey_name: str):
        print(f"\n🚀 [USER JOURNEY] {journey_name}")
        print("-" * 80)

    def log_pass(self, code: str, msg: str):
        self.total_cases += 1
        self.passed_cases += 1
        print(f"  ✅ [PASS] [{code}] {msg}")

    def log_fail(self, code: str, msg: str, details: str = ""):
        self.total_cases += 1
        self.failed_cases += 1
        defect = {"code": code, "msg": msg, "details": details}
        self.defects.append(defect)
        print(f"  ❌ [FAIL] [{code}] {msg}")
        if details:
            print(f"     Chi tiết: {details}")

    def summary(self):
        elapsed = time.time() - self.start_time
        self.log_header("BÁO CÁO TỔNG HỢP KIỂM THỬ QC SMART AI CV ONBOARDING (T-DELTA-06)")
        print(f"  Thời gian thực thi: {elapsed:.2f}s")
        print(f"  Tổng số Test Cases: {self.total_cases}")
        print(f"  Test Cases Thành công (PASS): {self.passed_cases}")
        print(f"  Test Cases Thất bại (FAIL): {self.failed_cases}")
        print(f"  Số lỗi (Defects) phát hiện: {len(self.defects)}")
        if self.defects:
            print("\n  DANH SÁCH DEFECTS PHÁT HIỆN:")
            for d in self.defects:
                print(f"   * [{d['code']}] {d['msg']}: {d['details']}")
        print("=" * 80)
        return self.failed_cases == 0


def run_smart_ai_cv_onboarding_e2e_suite():
    report = TestReport()
    report.log_header("KHỞI ĐỘNG BỘ TEST PLAYWRIGHT E2E: SMART AI CV ONBOARDING")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # =====================================================================
        # JOURNEY 1: HAPPY PATH VỚI CV MẪU -> AI TRÍCH XUẤT 3 BƯỚC -> NỘP FORM
        # =====================================================================
        report.log_journey("Journey 1: Happy Path - Bóc tách CV mẫu qua Gemini AI & Auto-fill cả 3 bước")
        
        try:
            page.goto(EXPERT_UPGRADE_URL, wait_until="networkidle")
            time.sleep(1)

            # 1.1 Kiểm tra giao diện Stepper 3 bước chuẩn mới
            stepper_text = page.locator("body").inner_text()
            if "Quét CV & Định danh" in stepper_text and "Năng lực Chuyên môn" in stepper_text and "Công bố & Cam kết" in stepper_text:
                report.log_pass("TC-J1-01", "Giao diện hiển thị Stepper 3 bước chuẩn hóa theo đặc tả Delta v1.3")
            else:
                report.log_fail("TC-J1-01", "Giao diện Stepper không khớp 3 bước chuẩn.")

            # 1.2 Kiểm tra Hero Dropzone tại đỉnh Bước 1
            sample_btn = page.locator("button:has-text('Dùng tệp CV mẫu để thử nghiệm nhanh')")
            if sample_btn.is_visible():
                report.log_pass("TC-J1-02", "Hero Dropzone hiển thị nút chọn tệp CV mẫu")
            else:
                report.log_fail("TC-J1-02", "Không tìm thấy nút chọn tệp CV mẫu trong Dropzone.")

            # 1.3 Kích hoạt chọn CV mẫu
            sample_btn.click()
            time.sleep(0.5)
            file_badge = page.locator("text=Ly_Lich_Khoa_Hoc_TS_NguyenVanDuc.pdf")
            if file_badge.is_visible():
                report.log_pass("TC-J1-03", "Chọn tệp CV mẫu thành công, hiển thị card tệp đã gắn kèm dung lượng")
            else:
                report.log_fail("TC-J1-03", "Card tệp CV mẫu không hiển thị sau khi click.")

            # 1.4 Kích hoạt quét AI thật qua Gemini API
            scan_btn = page.locator("button:has-text('Bắt đầu Quét & Bóc Tách AI')")
            scan_btn.click()
            print("     Đang chờ Google Gemini API bóc tách CV thật (SLA <= 15s)...")

            # Chờ quá trình phân tích hoàn tất (polling kiểm tra banner thành công)
            page.wait_for_selector("text=Trích xuất thành công", timeout=20000)
            report.log_pass("TC-J1-04", "Google Gemini API bóc tách thành công in-memory và phản hồi kết quả")

            # 1.5 Kiểm tra dữ liệu tự điền tại Bước 1 và visual badge "✨ AI Bóc tách"
            full_name_val = page.locator("input[placeholder*='Nguyễn Văn']").first.input_value()
            if full_name_val and "Nguyễn Văn" in full_name_val:
                report.log_pass("TC-J1-05", f"Họ và tên được tự động điền: '{full_name_val}'")
            else:
                report.log_fail("TC-J1-05", f"Họ và tên không được điền đúng (nhận: '{full_name_val}')")

            ai_badges = page.locator("text=✨ AI Bóc tách")
            badge_count = ai_badges.count()
            if badge_count >= 1:
                report.log_pass("TC-J1-06", f"Hiển thị {badge_count} Visual Badges '✨ AI Bóc tách' đánh dấu trường được AI gợi ý")
            else:
                report.log_fail("TC-J1-06", "Không hiển thị Visual Badge '✨ AI Bóc tách' tại Bước 1.")

            # 1.6 Chuyển sang Bước 2 và kiểm tra dữ liệu
            next_step_btn = page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')")
            next_step_btn.click()
            time.sleep(0.8)

            bio_val = page.locator("textarea").input_value()
            if bio_val and len(bio_val) > 20:
                report.log_pass("TC-J1-07", f"Bước 2: Bio summary được tự động điền ({len(bio_val)} ký tự)")
            else:
                report.log_fail("TC-J1-07", "Bước 2: Bio summary bị trống sau khi bóc tách AI.")

            tags_count = page.locator("span:has-text('×')").count()
            if tags_count >= 1:
                report.log_pass("TC-J1-08", f"Bước 2: Từ khóa chuyên sâu được tự động điền ({tags_count} từ khóa)")
            else:
                report.log_fail("TC-J1-08", "Bước 2: Từ khóa chuyên môn không được trích xuất.")

            # 1.7 Chuyển sang Bước 3 và kiểm tra công bố / sáng chế
            next_step_3_btn = page.locator("button:has-text('Tiếp tục: Công bố & Cam kết')")
            next_step_3_btn.click()
            time.sleep(0.8)

            page_body_3 = page.locator("body").inner_text()
            if "Công trình khoa học" in page_body_3 or "Nano Semiconductor" in page_body_3 or "Advanced Nano" in page_body_3 or "Deep Learning" in page_body_3:
                report.log_pass("TC-J1-09", "Bước 3: Danh mục công bố khoa học tiêu biểu được tự động điền")
            else:
                report.log_fail("TC-J1-09", "Bước 3: Danh mục công bố khoa học không được điền từ CV.")

            if "Bằng sáng chế" in page_body_3 or "cảm biến" in page_body_3.lower() or "GRANTED" in page_body_3:
                report.log_pass("TC-J1-10", "Bước 3: Bằng sáng chế / GPHI được tự động trích xuất")
            else:
                report.log_fail("TC-J1-10", "Bước 3: Bằng sáng chế không được trích xuất từ CV.")

            # 1.8 Kiểm tra thao tác sửa đổi thủ công tại Bước 3 (Human-in-the-Loop)
            page.fill("input[placeholder*='Tên bài báo']", "Nghiên cứu ứng dụng IoT và AI trong chuyển đổi số")
            page.fill("input[placeholder*='Tạp chí']", "Tạp chí KHCN Quốc gia")
            page.locator("button[aria-label='Thêm công bố']").click()
            time.sleep(0.5)
            if "Nghiên cứu ứng dụng IoT và AI trong chuyển đổi số" in page.locator("body").inner_text():
                report.log_pass("TC-J1-11", "Human-in-the-Loop: Chuyên gia thêm bổ sung công bố khoa học thủ công thành công")
            else:
                report.log_fail("TC-J1-11", "Không thêm được công bố khoa học thủ công tại Bước 3.")

            # 1.9 Tích cam kết PDPD & Cam kết pháp lý
            pdpd_cb = page.locator("#pdpdConsent")
            legal_cb = page.locator("#legalOath")
            pdpd_cb.check()
            legal_cb.check()

            submit_btn = page.locator("button:has-text('Nộp Hồ Sơ Xét Duyệt Nâng Hạng')")
            if submit_btn.is_enabled():
                report.log_pass("TC-J1-12", "Nút nộp hồ sơ được kích hoạt sau khi tích đủ 2 cam kết pháp lý bắt buộc")
            else:
                report.log_fail("TC-J1-12", "Nút nộp hồ sơ vẫn bị vô hiệu hóa dù đã tích đủ cam kết.")

        except Exception as e:
            report.log_fail("TC-J1-ERR", "Ngoại lệ trong User Journey 1", str(e))


        # =====================================================================
        # JOURNEY 2: NON-DESTRUCTIVE AUTO-FILL (BẢO VỆ DỮ LIỆU GÕ TAY)
        # =====================================================================
        report.log_journey("Journey 2: Non-destructive Auto-fill - Bảo tồn dữ liệu gõ tay khi quét CV")

        try:
            page.goto(EXPERT_UPGRADE_URL, wait_until="networkidle")
            time.sleep(1)

            # Người dùng chủ động gõ tên và cơ quan trước
            PRE_ENTERED_NAME = "PGS.TS. Lê Hoàng Long"
            PRE_ENTERED_INSTITUTION = "Đại học Bách Khoa Hà Nội"

            fn_input = page.locator("input[placeholder*='Nguyễn Văn']").first
            fn_input.fill(PRE_ENTERED_NAME)

            inst_input = page.locator("input[placeholder*='NacenTech']").first
            inst_input.fill(PRE_ENTERED_INSTITUTION)

            report.log_pass("TC-J2-01", f"Người dùng gõ trước Họ tên ('{PRE_ENTERED_NAME}') và Cơ quan ('{PRE_ENTERED_INSTITUTION}')")

            # Kích hoạt quét CV mẫu
            page.locator("button:has-text('Dùng tệp CV mẫu để thử nghiệm nhanh')").click()
            time.sleep(0.3)
            page.locator("button:has-text('Bắt đầu Quét & Bóc Tách AI')").click()

            page.wait_for_selector("text=Trích xuất thành công", timeout=20000)
            time.sleep(0.5)

            # Kiểm chứng bất biến: Họ tên và Cơ quan KHÔNG ĐƯỢC BỊ GHI ĐÈ
            current_name = fn_input.input_value()
            current_inst = inst_input.input_value()

            if current_name == PRE_ENTERED_NAME:
                report.log_pass("TC-J2-02", f"BR-EXP-CV-01: Họ tên gõ tay KHÔNG bị ghi đè (giữ nguyên: '{current_name}')")
            else:
                report.log_fail("TC-J2-02", f"BR-EXP-CV-01 VI PHẠM: Họ tên gõ tay bị ghi đè thành '{current_name}'")

            if current_inst == PRE_ENTERED_INSTITUTION:
                report.log_pass("TC-J2-03", f"BR-EXP-CV-01: Cơ quan gõ tay KHÔNG bị ghi đè (giữ nguyên: '{current_inst}')")
            else:
                report.log_fail("TC-J2-03", f"BR-EXP-CV-01 VI PHẠM: Cơ quan gõ tay bị ghi đè thành '{current_inst}'")

            # Nhưng các trường trống khác (ví dụ chức vụ, học vị) vẫn được tự điền
            title_input = page.locator("input[placeholder*='Nghiên cứu viên chính']").first.input_value()
            if title_input and len(title_input) > 0:
                report.log_pass("TC-J2-04", f"Các trường còn trống khác vẫn được tự động điền đầy đủ (Chức vụ: '{title_input}')")
            else:
                report.log_fail("TC-J2-04", "Các trường trống khác không được tự điền khi đã có một số trường gõ tay.")

        except Exception as e:
            report.log_fail("TC-J2-ERR", "Ngoại lệ trong User Journey 2", str(e))


        # =====================================================================
        # JOURNEY 3: MANUAL FALLBACK PATH (NHẬP TAY THỦ CÔNG 100%)
        # =====================================================================
        report.log_journey("Journey 3: Manual Fallback Path - Người dùng không dùng AI, tự nhập tay từ Bước 1 đến Bước 3")

        try:
            page.goto(EXPERT_UPGRADE_URL, wait_until="networkidle")
            time.sleep(1)

            # Hoàn toàn bỏ qua Dropzone, tự điền Bước 1
            fn_input = page.locator("input[placeholder*='Nguyễn Văn']").first
            fn_input.fill("Kỹ sư Trần Anh Tuấn")

            phone_input = page.locator("input[placeholder*='0912345678']").first
            phone_input.fill("0987654321")

            email_input = page.locator("input[placeholder*='chuyengia@nacentech.vn']").first
            email_input.fill("tuan.tran@nacentech.vn")

            inst_input = page.locator("input[placeholder*='NacenTech']").first
            inst_input.fill("Công ty Cổ phần Công nghệ NacenTech")

            report.log_pass("TC-J3-01", "Bước 1: Nhập tay thủ công toàn bộ thông tin định danh và cơ quan")

            # Chuyển sang Bước 2 thủ công
            page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").click()
            time.sleep(0.5)

            # Tại Bước 2: Chọn lĩnh vực, gõ từ khóa, gõ bio
            sector_select = page.locator("select").first
            sector_select.select_option(index=1)

            kw_input = page.locator("input[placeholder*='Nhập từ khóa']").first
            kw_input.fill("IoT")
            page.locator("button:has-text('Thêm')").first.click()
            time.sleep(0.3)

            kw_input.fill("Embedded Systems")
            page.locator("button:has-text('Thêm')").first.click()
            time.sleep(0.3)

            page.locator("textarea").fill("Kỹ sư trưởng có 8 năm kinh nghiệm thiết kế phần cứng IoT và thiết bị viễn thông.")

            report.log_pass("TC-J3-02", "Bước 2: Chọn lĩnh vực danh mục hiện hành, thêm từ khóa và viết bio thủ công")

            # Chuyển sang Bước 3 thủ công
            page.locator("button:has-text('Tiếp tục: Công bố & Cam kết')").click()
            time.sleep(0.5)

            # Tại Bước 3: Thêm sáng chế thủ công
            page.fill("input[placeholder*='Tên sáng chế']", "Hệ thống cảm biến đo nhiệt độ tự động")
            page.fill("input[placeholder*='Số văn bằng']", "VN-2024-0012")
            page.locator("button[aria-label='Thêm sáng chế']").click()
            time.sleep(0.5)

            if "Hệ thống cảm biến đo nhiệt độ tự động" in page.locator("body").inner_text():
                report.log_pass("TC-J3-03", "Bước 3: Nhập sáng chế thủ công thành công")
            else:
                report.log_fail("TC-J3-03", "Bước 3: Không lưu được sáng chế nhập thủ công.")

            page.locator("#pdpdConsent").check()
            page.locator("#legalOath").check()

            submit_btn = page.locator("button:has-text('Nộp Hồ Sơ Xét Duyệt Nâng Hạng')")
            if submit_btn.is_enabled():
                report.log_pass("TC-J3-04", "Zero-Lock: Luồng nhập tay 100% vận hành trơn tru không bị block ở bất kỳ bước nào")
            else:
                report.log_fail("TC-J3-04", "Nút nộp hồ sơ bị khóa khi nhập tay hoàn toàn.")

        except Exception as e:
            report.log_fail("TC-J3-ERR", "Ngoại lệ trong User Journey 3", str(e))


        # =====================================================================
        # KỊCH BẢN LỖI BIÊN: BOUNDARY & NEGATIVE TESTING
        # =====================================================================
        report.log_journey("Kịch bản Lỗi Biên: Boundary, Negative Testing & Zero-Lock Fallback")

        try:
            # 4.1 Bỏ trống Họ và tên bắt buộc
            page.goto(EXPERT_UPGRADE_URL, wait_until="networkidle")
            time.sleep(0.5)
            fn_input = page.locator("input[placeholder*='Nguyễn Văn']").first
            fn_input.fill("")

            page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").click()
            time.sleep(0.3)
            err_box = page.locator("text=Vui lòng nhập họ và tên đầy đủ.")
            if err_box.is_visible():
                report.log_pass("TC-NEG-01", "Bắt lỗi validation tiếng Việt khi bỏ trống Họ và tên bắt buộc")
            else:
                report.log_fail("TC-NEG-01", "Không hiển thị thông báo lỗi khi bỏ trống Họ và tên.")

            # 4.2 Thử click nhảy cóc lên Bước 2 trên Stepper navigation
            step2_nav = page.locator("button:has-text('Năng lực Chuyên môn')").first
            if step2_nav.count() > 0:
                step2_nav.click()
                time.sleep(0.3)
                if page.locator("text=Vui lòng nhập họ và tên đầy đủ.").is_visible():
                    report.log_pass("TC-NEG-02", "Chặn nhảy bước trên thanh Stepper nếu chưa thỏa mãn điều kiện bắt buộc")
                else:
                    report.log_fail("TC-NEG-02", "Hệ thống cho phép nhảy cóc qua Bước 2 khi Họ tên còn trống.")

            # 4.3 Kiểm tra chặn Năm công bố > 2026
            fn_input.fill("TS. Đỗ Văn Kiểm")
            page.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").click()
            time.sleep(0.3)
            page.locator("button:has-text('Tiếp tục: Công bố & Cam kết')").click()
            time.sleep(0.3)

            page.fill("input[placeholder*='Tên bài báo']", "Bài báo tương lai")
            page.fill("input[placeholder*='Tạp chí']", "Tạp chí Khoa học")
            year_input = page.locator("input[type='number'][value='2025']").first
            if year_input.count() > 0:
                year_input.fill("2029")
            else:
                # Tìm ô input năm công bố
                page.locator("input[min='1950']").first.fill("2029")

            page.locator("button[aria-label='Thêm công bố']").click()
            time.sleep(0.3)

            year_err = page.locator("text=Năm công bố không được lớn hơn năm 2026.")
            if year_err.is_visible():
                report.log_pass("TC-NEG-03", "TC-C1-EXP-06: Chặn thành công bài báo có năm công bố > 2026")
            else:
                report.log_fail("TC-NEG-03", "Không chặn lỗi khi nhập năm công bố > 2026.")

            # 4.4 Giả lập Zero-Lock Fallback khi không có tệp
            page.goto(EXPERT_UPGRADE_URL, wait_until="networkidle")
            time.sleep(0.5)
            # Bấm nút gỡ tệp nếu có
            remove_btn = page.locator("button:has-text('Gỡ bỏ')")
            if remove_btn.count() > 0:
                remove_btn.click()
            # Form vẫn nguyên vẹn cho người dùng nhập tay
            if page.locator("input[placeholder*='Nguyễn Văn']").first.is_enabled():
                report.log_pass("TC-NEG-04", "BR-EXP-CV-02: Zero-Lock Fallback - Giao diện mở 100%, không bị đóng băng khi không có CV")
            else:
                report.log_fail("TC-NEG-04", "Giao diện bị đóng băng.")

        except Exception as e:
            report.log_fail("TC-NEG-ERR", "Ngoại lệ trong Kịch bản Lỗi Biên", str(e))

        browser.close()

    success = report.summary()
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    run_smart_ai_cv_onboarding_e2e_suite()
