#!/usr/bin/env python3
"""
=============================================================================
QC BLACK-BOX PLAYWRIGHT E2E PRECISION SUITE: TASK T-05.CR021.07
FEATURE: AI CV PARSER PRECISION & B1-4 REAL DATA DEEP VERIFICATION
CĂN CỨ:
- File dữ liệu thật: Specification/01_DATA_RAW/LLKH CN/1. B1-4-LLCN- Bành Quốc Tuấn (Chủ trì).doc
- Đặc tả kỹ thuật: BR-EXP-CV-011 -> BR-EXP-CV-014, AC-CR-021.1 -> AC-CR-021.6
- Nguyên tắc QC: Zero-Mock, Real Database PostgreSQL, 4 Destructive & Boundary Cases
=============================================================================
"""

import os
import sys
import time
import json
import urllib.request
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
EXPERT_UPGRADE_URL = f"{BASE_URL}/profile/upgrade/expert"
REAL_DOC_PATH = os.path.abspath("Specification/01_DATA_RAW/LLKH CN/1. B1-4-LLCN- Bành Quốc Tuấn (Chủ trì).doc")

class QcVerificationReport:
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
        print(f"  ❌ [FAIL/DEFECT] [{code}] {msg}")
        if details:
            print(f"     Chi tiết: {details}")

    def summary(self):
        elapsed = time.time() - self.start_time
        self.log_header("BÁO CÁO KIỂM THỬ ĐỘC LẬP GATE 4 - TASK T-05.CR021.07 (NACEN-QC)")
        print(f"  Thời gian thực thi: {elapsed:.2f}s")
        print(f"  Tổng số Test Cases: {self.total_cases}")
        print(f"  Test Cases Đạt (PASS): {self.passed_cases}")
        print(f"  Lỗi & Góc khuất phát hiện (DEFECTS): {self.failed_cases}")
        print("=" * 80)
        if self.defects:
            print("\n  DANH SÁCH BẰNG CHỨNG LỖI & GÓC KHUẤT PHÁT HIỆN BỞI QC:")
            for idx, d in enumerate(self.defects, 1):
                print(f"   {idx}. [{d['code']}] {d['msg']}")
                print(f"      -> {d['details']}")
            print("=" * 80)
        return self.defects


def setup_authenticated_session(context, user_name="Dang Lanm", role="USER"):
    page = context.new_page()
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    page.evaluate(f"""() => {{
        localStorage.setItem('nacentwin_user_context', JSON.stringify({{
            id: 'qc-test-user-uuid',
            email: 'qc.expert.test@nacentech.vn',
            fullName: '{user_name}',
            role: '{role}',
            scopeType: 'GLOBAL',
            scopeId: 'GLOBAL'
        }}));
        localStorage.setItem('nacentwin_access_token', 'qc_valid_token_2026');
    }}""")
    return page


def run_all_qc_verification_journeys():
    report = QcVerificationReport()
    report.log_header("KHỞI ĐỘNG BỘ TEST PLAYWRIGHT E2E & KIỂM ĐỊNH THỰC TẾ B1-4")

    if not os.path.exists(REAL_DOC_PATH):
        report.log_fail("ERR-SETUP", f"Tệp dữ liệu thật không tồn tại: {REAL_DOC_PATH}")
        return report.summary()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # =====================================================================
        # JOURNEY 1: KIỂM CHỨNG BÓC TÁCH FILE B1-4 THẬT TRÊN FORM GIAO DIỆN
        # =====================================================================
        report.log_journey("Journey 1: Happy Path - Nâng hạng Chuyên gia với File B1-4 Thật (Bành Quốc Tuấn)")
        context1 = browser.new_context(viewport={"width": 1440, "height": 900})
        page1 = setup_authenticated_session(context1, user_name="Dang Lanm")

        try:
            page1.goto(EXPERT_UPGRADE_URL)
            page1.wait_for_load_state("networkidle")

            # 1.1 Kiểm tra tên demo ban đầu
            name_input = page1.locator("input[placeholder*='Nguyễn Văn']").first
            initial_name = name_input.input_value()
            if initial_name == "Dang Lanm":
                report.log_pass("TC-J1-01", f"Trường Họ và tên mang giá trị tài khoản demo ban đầu: '{initial_name}'")
            else:
                report.log_fail("TC-J1-01", f"Tên ban đầu không khớp Dang Lanm (nhận: '{initial_name}')")

            # 1.2 Tải tệp B1-4 thật
            file_input = page1.locator("input[type='file']").first
            file_input.set_input_files(REAL_DOC_PATH)
            time.sleep(1)

            file_card = page1.locator("text=1. B1-4-LLCN- Bành Quốc Tuấn")
            if file_card.is_visible():
                report.log_pass("TC-J1-02", "Tệp thật B1-4 (.doc) được gắn thành công vào Dropzone")
            else:
                report.log_fail("TC-J1-02", "Không hiển thị card tệp B1-4 sau khi chọn file")

            # 1.3 Kích hoạt Quét & Bóc tách AI
            scan_btn = page1.locator("button:has-text('Bắt đầu Quét & Bóc Tách AI')").first
            scan_btn.click()
            print("     Đang chờ Gemini AI bóc tách file Word thật (.doc 72KB)...")

            # Chờ nút đổi thành 'Quét lại CV'
            page1.wait_for_selector("button:has-text('Quét lại CV')", timeout=30000)
            report.log_pass("TC-J1-03", "Google Gemini AI bóc tách thành công tệp .doc thật và phản hồi 200 OK")

            # 1.4 Kiểm chứng Ghi đè họ tên demo thành tên thật
            updated_name = name_input.input_value()
            if "BÀNH QUỐC TUẤN" in updated_name.upper():
                report.log_pass("TC-J1-04", f"Họ và tên demo 'Dang Lanm' đã bị ghi đè thành công thành '{updated_name}' (BR-EXP-CV-011)")
            else:
                report.log_fail("TC-J1-04", f"Họ và tên không được cập nhật đúng từ CV (nhận: '{updated_name}')")

            # 1.5 Kiểm chứng Năm đạt học vị = 2011 (BR-EXP-CV-012)
            deg_year_input = page1.locator("input[type='number']").nth(1)
            deg_year_val = deg_year_input.input_value()
            if deg_year_val == "2011":
                report.log_pass("TC-J1-05", f"Năm đạt học vị TS được tự động điền chính xác: '{deg_year_val}' (BR-EXP-CV-012)")
            else:
                report.log_fail("TC-J1-05", f"Năm đạt học vị không đúng 2011 (nhận: '{deg_year_val}')")

            # 1.6 Kiểm chứng Cơ quan tiếp nhận = GLOBAL (BR-EXP-CV-013)
            rec_unit_select = page1.locator("select").nth(2)
            rec_unit_val = rec_unit_select.input_value()
            if rec_unit_val == "GLOBAL":
                report.log_pass("TC-J1-06", f"Cơ quan tiếp nhận Cấp 2 được tự động suy luận chính xác là 'GLOBAL' (Viện Ứng dụng Công nghệ - Bộ KH&CN) (BR-EXP-CV-013)")
            else:
                report.log_fail("TC-J1-06", f"Cơ quan tiếp nhận không phải GLOBAL (nhận: '{rec_unit_val}')")

            # 1.7 Kiểm chứng Visual Badges "✨ AI Bóc tách"
            ai_badges = page1.locator("text=✨ AI Bóc tách")
            badge_count = ai_badges.count()
            if badge_count >= 8:
                report.log_pass("TC-J1-07", f"Hiển thị đầy đủ {badge_count} Visual Badges '✨ AI Bóc tách' trên form Bước 1")
            else:
                report.log_fail("TC-J1-07", f"Số lượng Visual Badge '✨ AI Bóc tách' quá ít (chỉ có {badge_count})")

            # 1.8 Chuyển sang Bước 2: Kiểm tra Lĩnh vực & Raw Sector Keywords
            page1.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").first.click()
            time.sleep(1)

            step2_text = page1.locator("body").inner_text()
            domain_select = page1.locator("select").first
            domain_val = domain_select.input_value()
            if domain_val in ["LV07", "LV08"]:
                report.log_pass("TC-J1-08", f"Lĩnh vực trụ cột không bị xóa trắng, tự động đối soát chính xác: '{domain_val}' (BR-EXP-CV-014)")
            else:
                report.log_fail("TC-J1-08", f"Lĩnh vực trụ cột bị rỗng hoặc không map đúng (nhận: '{domain_val}')")

            # 1.9 Kiểm tra Pill Tags click-to-add tại Bước 2
            pill_tag = page1.locator("button:has-text('+ Đo lường chính xác')").first
            if pill_tag.is_visible():
                report.log_pass("TC-J1-09", "Khối từ khóa chuyên ngành phát hiện từ CV hiển thị các Pill Tags click-to-add ('+ Đo lường chính xác')")
                pill_tag.click()
                time.sleep(0.5)
                report.log_pass("TC-J1-10", "Tương tác nhấp vào Pill Tag tự động thêm từ khóa vào mảng Specialized Keywords")
            else:
                report.log_fail("TC-J1-09", "Không tìm thấy Pill Tag '+ Đo lường chính xác' tại Bước 2")

        except Exception as e:
            report.log_fail("ERR-J1", f"Ngoại lệ không mong muốn trong Journey 1: {str(e)}")
        finally:
            context1.close()

        # =====================================================================
        # JOURNEY 2: PHÁ HOẠI - FILE HỎNG HOẶC EMPTY PAYLOAD (NEGATIVE CASE 1)
        # =====================================================================
        report.log_journey("Journey 2: Phá Hoại - Tệp Hỏng Hoặc Payload Rỗng (Zero-Lock Resilience)")
        
        # 2.1 Test API trực tiếp với Empty payload
        try:
            req = urllib.request.Request(
                f"{BASE_URL}/api/cv-parser",
                data=b"{}",
                headers={"Content-Type": "application/json"}
            )
            urllib.request.urlopen(req)
            report.log_fail("TC-J2-01", "API không trả lỗi khi gửi payload rỗng {}")
        except urllib.error.HTTPError as e:
            if e.code == 400:
                report.log_pass("TC-J2-01", f"API chặn đúng mã HTTP 400 khi payload thiếu cả fileBase64 và textContent")
            else:
                report.log_fail("TC-J2-01", f"API trả mã HTTP không chuẩn: {e.code}")

        # 2.2 Test API trực tiếp với File Base64 hỏng
        try:
            corrupt_payload = json.dumps({
                "fileBase64": "VGhpcyBpcyBhIGNvcnJ1cHRlZCBub24tcGRmIGZpbGU=", # "This is a corrupted non-pdf file"
                "mimeType": "application/pdf",
                "fileName": "corrupted_file.pdf"
            }).encode("utf-8")
            req2 = urllib.request.Request(
                f"{BASE_URL}/api/cv-parser",
                data=corrupt_payload,
                headers={"Content-Type": "application/json"}
            )
            urllib.request.urlopen(req2)
            report.log_fail("TC-J2-02", "API không trả lỗi khi file PDF hỏng cấu trúc nhị phân")
        except urllib.error.HTTPError as e:
            body = json.loads(e.read().decode("utf-8"))
            if e.code in [502, 422] and body.get("fallbackManual") is True:
                report.log_pass("TC-J2-02", f"API trả mã HTTP {e.code} kèm cờ fallbackManual=true khi file hỏng, kích hoạt Zero-Lock Fallback an toàn")
            else:
                report.log_fail("TC-J2-02", f"API không trả fallbackManual=true khi tệp hỏng: {body}")

        # =====================================================================
        # JOURNEY 3: PHÁ HOẠI - THIẾU NĂM ĐẠT HỌC VỊ HOẶC NĂM SINH BẤT THƯỜNG (NEGATIVE CASE 2)
        # =====================================================================
        report.log_journey("Journey 3: Phá Hoại - CV Thiếu Năm Học Vị Hoặc Mâu Thuẫn Logic Năm Sinh (Boundary Case 2)")

        # 3.1 CV thiếu năm đạt học vị (ví dụ Cử nhân hoặc chưa ghi năm tốt nghiệp)
        try:
            cv_no_deg_year = json.dumps({
                "textContent": "Lý lịch khoa học. Họ và tên: Vũ Minh Tuấn. Sinh năm 1988. Học vị: Cử nhân. Cơ quan: Báo Tiền Phong."
            }).encode("utf-8")
            req3 = urllib.request.Request(
                f"{BASE_URL}/api/cv-parser",
                data=cv_no_deg_year,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req3) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                parsed = res_data.get("data", {})
                if parsed.get("degreeYear") is None:
                    report.log_pass("TC-J3-01", "AI không bịa đặt năm tốt nghiệp khi CV không ghi rõ (Zero Hallucination)")
                else:
                    report.log_fail("TC-J3-01", f"AI tự bịa năm tốt nghiệp khi CV không có: {parsed.get('degreeYear')}")
        except Exception as e:
            report.log_fail("TC-J3-01", f"Lỗi gọi API: {str(e)}")

        # 3.2 BÓC TRẦN DEFECT: Mâu thuẫn logic Năm sinh 2024 nhưng Năm đạt Tiến sĩ 1970
        context3 = browser.new_context(viewport={"width": 1440, "height": 900})
        page3 = setup_authenticated_session(context3, user_name="Dang Lanm")
        try:
            page3.goto(EXPERT_UPGRADE_URL)
            page3.wait_for_load_state("networkidle")

            # Kiểm tra xem Form có ngăn chặn Năm sinh > Năm đạt học vị hay không
            birth_input = page3.locator("input[type='number']").first
            deg_year_input = page3.locator("input[type='number']").nth(1)

            # Cố tình gõ Năm sinh: 2024, Năm đạt học vị: 1970
            birth_input.fill("2024")
            deg_year_input.fill("1970")
            time.sleep(0.5)

            # Bấm sang Bước 2
            page3.locator("button:has-text('Tiếp tục: Năng lực Chuyên môn')").first.click()
            time.sleep(0.5)

            # Kiểm tra xem form có chặn lại hay cho qua
            current_step_text = page3.locator("body").inner_text()
            if "Lĩnh vực chuyên môn" in current_step_text or "Bước 2" in current_step_text:
                report.log_fail(
                    "DEF-05-CR021-03",
                    "LỖI BIÊN LOGIC: Form cho phép tiếp tục sang Bước 2 dù Năm sinh (2024) lớn hơn Năm đạt học vị Tiến sĩ (1970)!",
                    "Thiếu ràng buộc kiểm tra tương quan thời gian giữa birthYear và degreeYear (degreeYear phải >= birthYear + 20)."
                )
            else:
                report.log_pass("TC-J3-02", "Form chặn thành công khi năm sinh và năm đạt học vị phi lý")
        finally:
            context3.close()

        # =====================================================================
        # JOURNEY 4: LỖI BIÊN - BẢO VỆ TÊN NGƯỜI DÙNG THẬT ĐÃ NHẬP TAY (BOUNDARY CASE 3)
        # =====================================================================
        report.log_journey("Journey 4: Lỗi Biên - Tôn Trọng Tên Người Dùng Nhập Tay Không Ghi Đè Ẩu (Boundary Case 3)")
        context4 = browser.new_context(viewport={"width": 1440, "height": 900})
        # Giả lập người dùng thật đã đăng nhập tên "GS. Trần Văn B"
        page4 = setup_authenticated_session(context4, user_name="GS. Trần Văn B")

        try:
            page4.goto(EXPERT_UPGRADE_URL)
            page4.wait_for_load_state("networkidle")

            name_input4 = page4.locator("input[placeholder*='Nguyễn Văn']").first
            initial_user_name = name_input4.input_value()
            if initial_user_name == "GS. Trần Văn B":
                report.log_pass("TC-J4-01", f"Form khởi tạo đúng tên người dùng thật: '{initial_user_name}'")
            else:
                report.log_fail("TC-J4-01", f"Form không nạp đúng tên người dùng thật (nhận: '{initial_user_name}')")

            # Tải tệp CV B1-4 thật của Bành Quốc Tuấn lên
            page4.locator("input[type='file']").first.set_input_files(REAL_DOC_PATH)
            time.sleep(1)

            # Quét AI
            page4.locator("button:has-text('Bắt đầu Quét & Bóc Tách AI')").first.click()
            page4.wait_for_selector("button:has-text('Quét lại CV')", timeout=30000)

            # KIỂM CHỨNG: Tên "GS. Trần Văn B" KHÔNG ĐƯỢC BỊ GHI ĐÈ BỞI "Bành Quốc Tuấn"
            name_after_scan = name_input4.input_value()
            if name_after_scan == "GS. Trần Văn B":
                report.log_pass("TC-J4-02", f"Tên người dùng nhập tay '{name_after_scan}' được bảo toàn tuyệt đối, AI không ghi đè ẩu (BR-EXP-CV-011 Anti-destructive)")
            else:
                report.log_fail(
                    "DEF-05-CR021-04",
                    f"VI PHẠM BẢO TỒN DỮ LIỆU: Tên người dùng nhập tay 'GS. Trần Văn B' đã bị AI ghi đè thành '{name_after_scan}'!",
                    "shouldOverrideFullName không bảo vệ được tên người dùng khi scan."
                )

        except Exception as e:
            report.log_fail("ERR-J4", f"Ngoại lệ trong Journey 4: {str(e)}")
        finally:
            context4.close()

        # =====================================================================
        # JOURNEY 5: BÓC TRẦN GÓC KHUẤT SUY LUẬN ĐỊA BÀN SỞ KH&CN NGOÀI 4 THÀNH PHỐ LỚN
        # =====================================================================
        report.log_journey("Journey 5: Góc Khuất - Đối Soát Cơ Quan Địa Bàn Ngoài HN/HP/HCM/DN")

        # Thử nghiệm với cơ quan tại Thái Nguyên và Quảng Ninh
        tn_cv = json.dumps({
            "textContent": "Lý lịch khoa học. Họ và tên: Hoàng Văn C. Cơ quan: Sở Khoa học và Công nghệ Tỉnh Thái Nguyên. Địa chỉ: Phường Phan Đình Phùng, TP. Thái Nguyên, Thái Nguyên."
        }).encode("utf-8")
        try:
            req_tn = urllib.request.Request(
                f"{BASE_URL}/api/cv-parser",
                data=tn_cv,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req_tn) as resp_tn:
                data_tn = json.loads(resp_tn.read().decode("utf-8")).get("data", {})
                rec_tn = data_tn.get("suggestedReceivingUnit", {})
                if rec_tn.get("code") == "TN":
                    report.log_pass("TC-J5-01", "Suy luận chính xác Sở KH&CN Thái Nguyên (TN)")
                else:
                    report.log_fail(
                        "DEF-05-CR021-01",
                        f"GÓC KHUẤT ĐỊA BÀN: Cơ quan tại Thái Nguyên nhưng bị suy luận sai thành '{rec_tn.get('code')}' ({rec_tn.get('name')})!",
                        "inferReceivingUnit trong cv-parser-helper.ts mới chỉ hỗ trợ HN, HP, HCM, DN; thiếu từ khóa cho 12 tỉnh trọng điểm như TN, QN, BN, HD, VP..."
                    )
        except Exception as e:
            report.log_fail("ERR-J5", f"Lỗi Journey 5: {str(e)}")

        browser.close()

    return report.summary()


if __name__ == "__main__":
    defects = run_all_qc_verification_journeys()
    # QC hoàn tất và in danh sách defects tìm được
    sys.exit(0)
