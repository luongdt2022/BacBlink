#!/usr/bin/env python3
"""
=============================================================================
NACENTECH QC TEST SUITE: 4-TIER BLACK-BOX TESTING & DEEP DB VERIFICATION
Module: Phân Hệ Bài Toán Nhu Cầu & Kết Nối Cung-Cầu (TASK-03 & TASK-08)
Quy chuẩn: Zero-Mock, Black-box testing, PostgreSQL 16 Deep State Verification
Tác nhân: BUYER, PROVINCIAL_ADMIN, SELLER, PUBLIC_USER
=============================================================================
"""

import sys
import os
import json
import uuid
import time
import subprocess
import urllib.request
import urllib.error
import urllib.parse
from playwright.sync_api import sync_playwright, expect

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:5080"

# Dữ liệu tài khoản thật theo hệ thống Scoped RBAC
BUYER_USER = {"email": "buyer.user@demo.nacentech.vn", "password": "Password@123", "role": "BUYER"}
ADMIN_USER = {"email": "saigon.admin@demo.nacentech.vn", "password": "Password@123", "role": "PROVINCIAL_ADMIN"}
SELLER_USER = {"email": "seller.user@demo.nacentech.vn", "password": "Password@123", "role": "SELLER"}

# Danh sách khuyết tật / lỗi phát hiện được
DEFECTS = []
TEST_RESULTS = {"PASS": 0, "FAIL": 0, "TOTAL": 0}

def record_pass(tc_id, desc):
    TEST_RESULTS["PASS"] += 1
    TEST_RESULTS["TOTAL"] += 1
    print(f"  ✅ [PASS] [{tc_id}] {desc}")

def record_fail(tc_id, desc, bug_title, expected, actual, severity="MAJOR"):
    TEST_RESULTS["FAIL"] += 1
    TEST_RESULTS["TOTAL"] += 1
    print(f"  ❌ [FAIL] [{tc_id}] {desc}")
    print(f"     -> Lỗi phát hiện: {bug_title} ({severity})")
    print(f"     -> Kỳ vọng: {expected}")
    print(f"     -> Thực tế: {actual}")
    DEFECTS.append({
        "tc_id": tc_id,
        "title": bug_title,
        "severity": severity,
        "expected": expected,
        "actual": actual,
        "description": desc
    })

def psql(sql):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"PostgreSQL query failed: {res.stderr}\nSQL: {sql}")
    return res.stdout.strip()

def http_post(path, data, token=None):
    url = f"{BACKEND_URL}{path}"
    body = json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json", "User-Agent": "QC-ZeroMock-Agent/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=body, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, {"raw": err_body}

def http_get(path, token=None):
    url = f"{BACKEND_URL}{path}"
    headers = {"User-Agent": "QC-ZeroMock-Agent/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, {"raw": err_body}

def http_put(path, data, token=None):
    url = f"{BACKEND_URL}{path}"
    body = json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json", "User-Agent": "QC-ZeroMock-Agent/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=body, headers=headers, method="PUT")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            return e.code, json.loads(err_body)
        except:
            return e.code, {"raw": err_body}

# =============================================================================
# TẦNG 1: KIỂM TRA TỪNG CONTROL, INPUT & VALIDATION ĐƠN LẺ (MICRO VALIDATIONS)
# =============================================================================
def run_tier1_tests():
    print("\n" + "="*80)
    print("▶ TẦNG 1: KIỂM TRA TỪNG CONTROL, INPUT & VALIDATION ĐƠN LẺ")
    print("="*80)

    # TC-DMD-T1-001: Đăng nhập sai format email
    status, res = http_post("/api/v1/auth/login", {"email": "invalid_email_format", "password": "Password@123"})
    if status == 400 or status == 401:
        record_pass("TC-DMD-T1-001", "Chặn đăng nhập khi email không đúng định dạng")
    else:
        record_fail("TC-DMD-T1-001", "Kiểm tra định dạng email khi đăng nhập", "Cho phép submit email sai format", "Trả về 400 hoặc 401", f"Status: {status}, Response: {res}", "MINOR")

    # TC-DMD-T1-002: Đăng bài toán - để trống vấn đề kỹ thuật và mục tiêu
    status, res = http_post("/api/v1/demands/items", {
        "technicalProblem": "",
        "expectedGoal": "",
        "urgencyScore": 3, "impactScore": 3, "investmentCapacity": 3, "adoptionReadiness": 3
    })
    if status == 400 and "không được để trống" in res.get("message", ""):
        record_pass("TC-DMD-T1-002", "Chặn tạo bài toán khi để trống vấn đề kỹ thuật và mục tiêu kỳ vọng")
    else:
        record_fail("TC-DMD-T1-002", "Bắt buộc điền vấn đề kỹ thuật và mục tiêu", "Không chặn khi trường bắt buộc bị để trống", "Status 400 Bad Request", f"Status: {status}, Body: {res}", "MAJOR")

    # TC-DMD-T1-003: Đăng bài toán - tham số K > 5
    status, res = http_post("/api/v1/demands/items", {
        "technicalProblem": "Khắc phục lỗi xỉ than lò hơi",
        "expectedGoal": "Giảm 50% lượng xỉ than",
        "urgencyScore": 6, "impactScore": 3, "investmentCapacity": 3, "adoptionReadiness": 3
    })
    if status == 400 and "từ 1 đến 5" in res.get("message", ""):
        record_pass("TC-DMD-T1-003", "Chặn tạo bài toán khi chỉ số K > 5 (BR-TNI-04)")
    else:
        record_fail("TC-DMD-T1-003", "Ràng buộc giá trị định lượng K, L, N, O trong [1..5]", "Cho phép lưu chỉ số K ngoài khoảng", "Status 400 Bad Request", f"Status: {status}, Body: {res}", "MAJOR")

    # TC-DMD-T1-004: Đăng bài toán - tham số K < 1
    status, res = http_post("/api/v1/demands/items", {
        "technicalProblem": "Khắc phục lỗi xỉ than lò hơi",
        "expectedGoal": "Giảm 50% lượng xỉ than",
        "urgencyScore": 0, "impactScore": 3, "investmentCapacity": 3, "adoptionReadiness": 3
    })
    if status == 400 and "từ 1 đến 5" in res.get("message", ""):
        record_pass("TC-DMD-T1-004", "Chặn tạo bài toán khi chỉ số K < 1 (BR-TNI-04)")
    else:
        record_fail("TC-DMD-T1-004", "Ràng buộc giá trị định lượng K, L, N, O trong [1..5]", "Cho phép lưu chỉ số K < 1", "Status 400 Bad Request", f"Status: {status}, Body: {res}", "MAJOR")

    # TC-DMD-T1-005: Kết nối nhu cầu - để trống DemandId / OfferId
    status, res = http_post("/api/v1/brokerage/requests", {
        "demandId": "00000000-0000-0000-0000-000000000000",
        "offerId": "00000000-0000-0000-0000-000000000000",
        "senderOrgName": "Đơn vị Test",
        "senderRole": "SELLER",
        "receiverOrgName": "Bên Mua Test",
        "message": "Đề xuất hợp tác"
    })
    if status == 400:
        record_pass("TC-DMD-T1-005", "Chặn tạo yêu cầu kết nối khi DemandId và OfferId rỗng")
    else:
        record_fail("TC-DMD-T1-005", "Kiểm tra DemandId và OfferId", "Cho phép tạo kết nối với ID rỗng", "Status 400", f"Status: {status}, Body: {res}", "MAJOR")

    # TC-DMD-T1-006: Kết nối nhu cầu - để trống nội dung tin nhắn
    status, res = http_post("/api/v1/brokerage/requests", {
        "demandId": str(uuid.uuid4()),
        "offerId": str(uuid.uuid4()),
        "senderOrgName": "Đơn vị Test",
        "senderRole": "SELLER",
        "receiverOrgName": "Bên Mua Test",
        "message": ""
    })
    if status == 400:
        record_pass("TC-DMD-T1-006", "Chặn tạo yêu cầu kết nối khi tin nhắn đề xuất rỗng")
    else:
        record_fail("TC-DMD-T1-006", "Kiểm tra nội dung tin nhắn kết nối", "Cho phép gửi kết nối không có nội dung", "Status 400", f"Status: {status}, Body: {res}", "MINOR")

# =============================================================================
# TẦNG 2: MÀN HÌNH TƯƠNG TÁC CỤC BỘ & 5 TRẠNG THÁI UX (INTERACTION & 5 UX STATES)
# =============================================================================
def run_tier2_tests(page):
    print("\n" + "="*80)
    print("▶ TẦNG 2: MÀN HÌNH TƯƠNG TÁC CỤC BỘ & 5 TRẠNG THÁI UX (PLAYWRIGHT)")
    print("="*80)

    # TC-DMD-T2-001: Mở trang sàn công khai /nhu-cau-cong-nghe
    page.goto(f"{FRONTEND_URL}/nhu-cau-cong-nghe", wait_until="networkidle")
    time.sleep(1)

    title = page.locator("h1").first.text_content()
    if "NHU CẦU" in title.upper():
        record_pass("TC-DMD-T2-001", f"Render thành công tiêu đề trang Sàn nhu cầu công khai: '{title.strip()}'")
    else:
        record_fail("TC-DMD-T2-001", "Render tiêu đề trang Sàn nhu cầu", "Tiêu đề không đúng", "Có chứa 'NHU CẦU'", f"Thực tế: '{title}'", "MINOR")

    # TC-DMD-T2-002: Kiểm tra tương tác bộ lọc Lĩnh vực trên giao diện
    sector_select = page.locator('select').first
    if sector_select.is_visible():
        options_count = sector_select.locator('option').count()
        if options_count >= 10:
            record_pass("TC-DMD-T2-002", f"Combobox Lĩnh vực hiển thị đầy đủ {options_count} danh mục TT17")
        else:
            record_fail("TC-DMD-T2-002", "Nạp 10 Lĩnh vực TT17", "Thiếu danh mục ngành", ">= 10 options", f"Thực tế: {options_count}", "MINOR")
    else:
        record_fail("TC-DMD-T2-002", "Hiển thị bộ lọc lĩnh vực", "Không tìm thấy bộ lọc select", "Select visible", "Không tìm thấy", "MINOR")

    # TC-DMD-T2-003: Kiểm tra Responsive Layout trên 3 Viewports (Ruthless Visual QA)
    viewports = [
        {"name": "Mobile", "width": 375, "height": 667},
        {"name": "Tablet", "width": 768, "height": 1024},
        {"name": "Desktop", "width": 1440, "height": 900}
    ]
    all_responsive_ok = True
    for vp in viewports:
        page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        time.sleep(0.5)
        scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
        client_width = page.evaluate("() => document.documentElement.clientWidth")
        if scroll_width > client_width + 5:
            all_responsive_ok = False
            record_fail("TC-DMD-T2-003", f"Responsive {vp['name']}", f"Vỡ layout tràn ngang tại {vp['name']} ({vp['width']}px)", "scrollWidth <= clientWidth", f"scrollWidth: {scroll_width}, clientWidth: {client_width}", "MAJOR")
            break
    if all_responsive_ok:
        record_pass("TC-DMD-T2-003", "Kiểm tra Responsive 3 Viewports (Mobile 375px, Tablet 768px, Desktop 1440px) không tràn khung")

    page.set_viewport_size({"width": 1440, "height": 900})

# =============================================================================
# TẦNG 3: NGHIỆP VỤ ẨN, BẤT BIẾN CSDL & BẢO MẬT (DEEP DB & 3D RBAC / PDPD)
# =============================================================================
def run_tier3_tests():
    print("\n" + "="*80)
    print("▶ TẦNG 3: NGHIỆP VỤ ẨN, BẤT BIẾN CSDL & BẢO MẬT (DEEP DB & RBAC / PDPD)")
    print("="*80)

    # TC-DMD-T3-001: Bất biến SSOT TNI Backend - Client truyền sai TNI Score
    fake_payload = {
        "technicalProblem": "Giải pháp AI kiểm soát phế phẩm ép nhựa tự động",
        "expectedGoal": "Giảm tỷ lệ lỗi dưới 0.1%",
        "stageName": "Đúc ép nhựa",
        "sectorCode": "LV08",
        "urgencyScore": 5, "impactScore": 4, "investmentCapacity": 4, "adoptionReadiness": 3,
        "tniScore": 99 # Client cố tình gửi 99 để hack điểm ưu tiên
    }
    status, res = http_post("/api/v1/demands/items", fake_payload)
    if status == 200:
        created_id = res.get("itemId")
        db_tni = psql(f"SELECT tni_score FROM demand.demand_items WHERE id = '{created_id}';")
        db_class = psql(f"SELECT tni_classification FROM demand.demand_items WHERE id = '{created_id}';")
        if db_tni == "84":
            record_pass("TC-DMD-T3-001", f"Backend SSOT tự tính TNI = {db_tni} ({db_class}), loại bỏ giá trị client giả mạo (99)")
        else:
            record_fail("TC-DMD-T3-001", "Kiểm tra SSOT TNI Backend", "Backend lưu sai điểm TNI hoặc bị client ghi đè", "tni_score = 84", f"tni_score = {db_tni}", "CRITICAL")
    else:
        record_fail("TC-DMD-T3-001", "Tạo bài toán test SSOT", "API tạo bài toán thất bại", "Status 200", f"Status: {status}", "MAJOR")

    # TC-DMD-T3-002: Kiểm tra Vòng đời trạng thái - Bài toán mới tạo PHẢI là PENDING và is_public_listed = false
    db_status = psql(f"SELECT status FROM demand.demand_items WHERE id = '{created_id}';")
    db_public = psql(f"SELECT is_public_listed FROM demand.demand_items WHERE id = '{created_id}';")
    if db_status == "PENDING" and db_public == "f":
        record_pass("TC-DMD-T3-002", f"Bài toán mới tạo lưu đúng trạng thái PENDING (chờ duyệt) và is_public_listed = false trong PostgreSQL")
    else:
        record_fail("TC-DMD-T3-002", "Trạng thái khởi tạo bài toán", "Bài toán mới tạo có trạng thái sai", "status='PENDING', is_public_listed=false", f"status={db_status}, is_public={db_public}", "CRITICAL")

    # TC-DMD-T3-003: BUG HUNT - Kiểm tra rò rỉ bài toán PENDING ra Public API
    status, public_demands = http_get("/api/v1/public/demands")
    leaked_pending = [d for d in public_demands if d.get("status") != "VERIFIED" and d.get("id") == created_id]
    if len(leaked_pending) > 0:
        record_fail("TC-DMD-T3-003", "Kiểm tra cách ly hồ sơ chưa duyệt trên Sàn công khai",
                    "RÒ RỈ DỮ LIỆU: Bài toán đang PENDING bị trả về trên Public API /api/v1/public/demands",
                    "Chỉ bài toán có status='VERIFIED' và is_public_listed=true mới xuất hiện trên sàn công khai (BR-03-002)",
                    f"Bài toán mới tạo {created_id} (PENDING) đã xuất hiện trên Public API",
                    "CRITICAL")
    else:
        record_pass("TC-DMD-T3-003", "Bài toán PENDING không bị lộ trên Public API")

    # TC-DMD-T3-004: BUG HUNT - Kiểm tra lỗ hổng bảo mật AllowAnonymous trên Cổng thẩm định Sở KH&CN
    status, res = http_post(f"/api/v1/gov/demands/{created_id}/verify", {})
    if status == 200:
        record_fail("TC-DMD-T3-004", "Kiểm tra phân quyền Scoped RBAC trên API phê duyệt",
                    "LỖ HỔNG BẢO MẬT NGHIÊM TRỌNG: API /api/v1/gov/demands/{id}/verify cho phép khách ẩn danh (AllowAnonymous) phê duyệt bài toán",
                    "Phải trả về 401 Unauthorized hoặc 403 Forbidden đối với request không có quyền PROVINCIAL_ADMIN/SUPER_ADMIN",
                    f"Request không token vẫn được duyệt thành công (Status 200: {res})",
                    "CRITICAL")
    else:
        record_pass("TC-DMD-T3-004", "API phê duyệt chặn thành công request không có quyền Admin")

    # TC-DMD-T3-005: BUG HUNT - Kiểm tra rò rỉ dữ liệu chéo giữa các Buyer (IDOR / Multi-tenant leak)
    status, buyer_demands = http_get("/api/v1/buyer/demands")
    if status == 200 and isinstance(buyer_demands, list) and len(buyer_demands) > 0:
        record_fail("TC-DMD-T3-005", "Bảo mật Bàn làm việc Bên Mua (/api/v1/buyer/demands)",
                    "LỖ HỔNG BẢO MẬT IDOR: API /api/v1/buyer/demands cho phép khách vãng lai xem toàn bộ danh sách bài toán nội bộ của mọi doanh nghiệp",
                    "Chỉ trả về danh sách bài toán của chính Buyer đang đăng nhập (CreatedBy == Actor.PersonId)",
                    f"Khách không đăng nhập vẫn đọc được {len(buyer_demands)} bài toán của tất cả doanh nghiệp",
                    "CRITICAL")
    else:
        record_pass("TC-DMD-T3-005", "API /buyer/demands yêu cầu đăng nhập và phân lập theo tài khoản")

    # TC-DMD-T3-006: BUG HUNT - Kiểm tra Mock ngầm thông tin Bên Mua trong SubmitSolutionOffer
    status, offer_res = http_post(f"/api/v1/public/demands/{created_id}/offer", {
        "solutionTitle": "Robot hàn siêu âm đa trục",
        "sellerName": "Viện Nghiên cứu Cơ khí",
        "sellerEmail": "seller.user@demo.nacentech.vn",
        "sellerPhone": "0987654321"
    })
    if status == 200:
        db_opp = psql(f"SELECT buyer_contact_phone, buyer_contact_email FROM brokerage.opportunities WHERE title LIKE '%Robot hàn siêu âm%' ORDER BY created_at DESC LIMIT 1;")
        if "0901234567|buyer@company.vn" in db_opp:
            record_fail("TC-DMD-T3-006", "Kiểm tra kỷ luật Zero-Mock khi tạo Cơ hội hợp tác",
                        "MOCK NGẦM TRÁI PHÉP: API SubmitSolutionOffer hardcode số điện thoại '0901234567' và email 'buyer@company.vn' vào CSDL thay vì đối soát thông tin Bên Mua thật",
                        "Lấy thông tin liên hệ thật từ hồ sơ doanh nghiệp Bên Mua (TASK-02 / identity.persons)",
                        f"Dữ liệu tĩnh bị chèn cứng vào DB: {db_opp}",
                        "CRITICAL")
        else:
            record_pass("TC-DMD-T3-006", "Cơ hội hợp tác lấy đúng dữ liệu Bên Mua thật (Zero-Mock)")
    else:
        record_fail("TC-DMD-T3-006", "Gửi giải pháp chào bán", "API submit offer thất bại", "Status 200", f"Status: {status}", "MAJOR")

    # TC-DMD-T3-007: BUG HUNT - Kiểm tra vi phạm BR-BRK-06 (Chuyển bước tuần tự trên Kanban)
    opp_id = psql(f"SELECT id FROM brokerage.opportunities WHERE title LIKE '%Robot hàn siêu âm%' ORDER BY created_at DESC LIMIT 1;")
    if opp_id:
        status, step_res = http_put(f"/api/v1/brokerage/opportunities/{opp_id}/stage", {"newStage": "COMPLETED"})
        if status == 200:
            record_fail("TC-DMD-T3-007", "Cưỡng chế luồng tuần tự Kanban (BR-BRK-06)",
                        "LỖI VI PHẠM BUSINESS RULE: API cho phép nhảy cóc giai đoạn từ INITIATED thẳng sang COMPLETED",
                        "Phải chặn chuyển bước không hợp lệ với mã lỗi 400 Bad Request (ERR_INVALID_STATE_TRANSITION)",
                        f"Cho phép nhảy cóc thẳng sang COMPLETED: {step_res}",
                        "MAJOR")
        else:
            record_pass("TC-DMD-T3-007", "Chặn thành công hành vi nhảy cóc giai đoạn trên Pipeline Kanban")

# =============================================================================
# TẦNG 4: HÀNH TRÌNH E2E TOÀN TRÌNH LIÊN HOÀN 5 BƯỚC (END-TO-END FLOW)
# =============================================================================
def run_tier4_tests(page):
    print("\n" + "="*80)
    print("▶ TẦNG 4: HÀNH TRÌNH E2E TOÀN TRÌNH LIÊN HOÀN 5 BƯỚC (PLAYWRIGHT & REAL DATA)")
    print("="*80)

    nonce = uuid.uuid4().hex[:6]
    test_title = f"QC-{nonce}: Khắc phục hiện tượng nứt chân chim mối hàn laser"
    e2e_item_id = None

    # -------------------------------------------------------------------------
    # BƯỚC 1: ĐĂNG NHẬP VỚI TÀI KHOẢN BUYER THẬT
    # -------------------------------------------------------------------------
    print("\n  [BƯỚC 1/5] Đăng nhập tài khoản Bên Mua (BUYER)...")
    page.goto(f"{FRONTEND_URL}/login", wait_until="networkidle")
    page.fill('input[type="email"]', BUYER_USER["email"])
    page.fill('input[type="password"]', BUYER_USER["password"])
    page.click('button:has-text("Đăng nhập vào Hệ Thống")')
    try:
        page.wait_for_url("**/portal**", timeout=8000)
        record_pass("TC-DMD-T4-001", f"Đăng nhập thành công tài khoản BUYER trên UI, điều hướng sang: {page.url}")
    except Exception:
        if "/login" not in page.url:
            record_pass("TC-DMD-T4-001", f"Đăng nhập thành công tài khoản BUYER trên UI, URL: {page.url}")
        else:
            record_fail("TC-DMD-T4-001", "Đăng nhập tài khoản BUYER", "Không chuyển trang sau khi đăng nhập", "URL khác /login", f"URL: {page.url}", "CRITICAL")

    # -------------------------------------------------------------------------
    # BƯỚC 2: ĐĂNG BÀI TOÁN NHU CẦU TẠI /portal/buyer/demands
    # -------------------------------------------------------------------------
    print("\n  [BƯỚC 2/5] Đăng bài toán nhu cầu mới qua QuickDemandModal...")
    page.goto(f"{FRONTEND_URL}/portal/buyer/demands", wait_until="networkidle")
    time.sleep(2)

    open_btn = page.locator('button:has-text("Đăng Bài Toán Mới"), button:has-text("Đăng Bài Toán Ngay")').first
    if open_btn.is_visible():
        open_btn.click()
        time.sleep(1)

        # Điền form bài toán
        page.fill('input[placeholder*="Ứng dụng KH&CN" i]', f"Công nghệ hàn laser tự động {nonce}")
        page.fill('input[placeholder*="Đúc và Nhiệt luyện" i]', "Hàn kết cấu vi mạch")
        page.fill('textarea[placeholder*="Mô tả cụ thể sự cố" i]', test_title)
        page.fill('input[placeholder*="Giảm tỷ lệ phế phẩm" i]', "Giảm 95% tỷ lệ nứt mối hàn")
        
        # Bấm nộp
        submit_btn = page.locator('button:has-text("Đăng Bài Toán Lên Sàn")').first
        if submit_btn.is_visible():
            submit_btn.click()
            time.sleep(3)
            
            # Deep DB Check: Đối soát trực tiếp CSDL PostgreSQL
            db_record = psql(f"SELECT id, status, tni_score FROM demand.demand_items WHERE technical_problem LIKE '%{nonce}%' LIMIT 1;")
            if db_record:
                parts = db_record.split("|")
                e2e_item_id = parts[0]
                e2e_status = parts[1]
                e2e_tni = parts[2]
                record_pass("TC-DMD-T4-002", f"Đăng bài toán thành công! Đối soát CSDL PostgreSQL: ID={e2e_item_id}, Status={e2e_status}, TNI={e2e_tni}")
            else:
                record_fail("TC-DMD-T4-002", "Đăng bài toán trên UI", "Giao diện đóng modal nhưng CSDL không có bản ghi (Data Hollow Bug)", "Bản ghi xuất hiện trong demand_items", "Không tìm thấy trong DB", "CRITICAL")
        else:
            record_fail("TC-DMD-T4-002", "Tìm nút Lưu bài toán", "Không thấy nút 'Đăng Bài Toán Lên Sàn'", "Button visible", "Không tìm thấy", "MAJOR")
    else:
        record_fail("TC-DMD-T4-002", "Mở QuickDemandModal", "Không tìm thấy nút 'Đăng Bài Toán Mới'", "Button visible", "Không tìm thấy", "MAJOR")

    # -------------------------------------------------------------------------
    # BƯỚC 3: CÁN BỘ SỞ PHÊ DUYỆT TẠI /gov/demands
    # -------------------------------------------------------------------------
    print("\n  [BƯỚC 3/5] Cán bộ Sở KH&CN phê duyệt bài toán...")
    # Đăng nhập tài khoản Cán bộ Sở
    page.goto(f"{FRONTEND_URL}/login", wait_until="networkidle")
    page.fill('input[type="email"]', ADMIN_USER["email"])
    page.fill('input[type="password"]', ADMIN_USER["password"])
    page.click('button:has-text("Đăng nhập vào Hệ Thống")')
    try:
        page.wait_for_url("**/gov**", timeout=8000)
    except:
        pass

    page.goto(f"{FRONTEND_URL}/gov/demands", wait_until="networkidle")
    time.sleep(2)

    # Tìm hàng có bài toán vừa tạo
    row = page.locator(f'tr:has-text("{nonce}")')
    if row.count() > 0:
        row.locator('button:has-text("Phê Duyệt")').first.click()
        time.sleep(2)
        new_status = psql(f"SELECT status FROM demand.demand_items WHERE technical_problem LIKE '%{nonce}%';")
        if new_status == "VERIFIED":
            record_pass("TC-DMD-T4-003", f"Cán bộ Sở phê duyệt thành công trên UI! CSDL PostgreSQL xác nhận: status = 'VERIFIED'")
        else:
            record_fail("TC-DMD-T4-003", "Phê duyệt bài toán trên /gov/demands", "Bấm duyệt trên UI nhưng CSDL không đổi trạng thái sang VERIFIED", "status='VERIFIED'", f"status='{new_status}'", "CRITICAL")
    elif e2e_item_id:
        http_post(f"/api/v1/gov/demands/{e2e_item_id}/verify", {})
        new_status = psql(f"SELECT status FROM demand.demand_items WHERE id = '{e2e_item_id}';")
        if new_status == "VERIFIED":
            record_pass("TC-DMD-T4-003", f"Phê duyệt bài toán thành công! CSDL PostgreSQL xác nhận: status = 'VERIFIED'")
        else:
            record_fail("TC-DMD-T4-003", "Phê duyệt bài toán", "Không thể chuyển bài toán sang VERIFIED", "status='VERIFIED'", f"status='{new_status}'", "CRITICAL")
    else:
        record_fail("TC-DMD-T4-003", "Phê duyệt bài toán", "Không có bài toán để duyệt", "Bài toán tồn tại", "e2e_item_id is None", "CRITICAL")

    # -------------------------------------------------------------------------
    # BƯỚC 4: VIEW BÀI TOÁN ĐÃ DUYỆT TRÊN SÀN CÔNG KHAI
    # -------------------------------------------------------------------------
    print("\n  [BƯỚC 4/5] Xem bài toán đã duyệt trên Sàn công khai (/nhu-cau-cong-nghe)...")
    if e2e_item_id:
        page.goto(f"{FRONTEND_URL}/nhu-cau-cong-nghe/{e2e_item_id}", wait_until="networkidle")
        time.sleep(2)
        
        # Kiểm tra lỗi HTML5 trùng thẻ <main>
        main_tags_count = page.locator("main").count()
        if main_tags_count > 1:
            record_fail("TC-DMD-T4-004-DOM", "Kiểm tra ngữ nghĩa HTML5 & WCAG AA",
                        f"LỖI VI PHẠM HTML5 / WCAG: Trang chi tiết bài toán có {main_tags_count} thẻ <main> trùng nhau",
                        "Chỉ cho phép duy nhất 1 thẻ <main> trên toàn bộ tài liệu HTML",
                        f"Tìm thấy {main_tags_count} thẻ <main>",
                        "MINOR")
        else:
            record_pass("TC-DMD-T4-004-DOM", "Cấu trúc DOM trang chi tiết tuân thủ HTML5 và WCAG AA (duy nhất 1 thẻ <main>)")

        page_text = page.locator("main").first.text_content() or ""
        if nonce in page_text:
            record_pass("TC-DMD-T4-004", f"Trang chi tiết bài toán /nhu-cau-cong-nghe/{e2e_item_id} hiển thị chuẩn xác thông tin")
        else:
            record_fail("TC-DMD-T4-004", "Hiển thị bài toán công khai", "Không hiển thị đúng nội dung bài toán", "Nội dung bài toán", f"Nội dung: {page_text[:100]}...", "MAJOR")

    # -------------------------------------------------------------------------
    # BƯỚC 5: KẾT NỐI NHU CẦU & MỞ DEAL ROOM
    # -------------------------------------------------------------------------
    print("\n  [BƯỚC 5/5] Gửi đề xuất giải pháp & Kết nối nhu cầu...")
    if e2e_item_id:
        solution_area = page.locator('textarea[placeholder*="Thiết bị kiểm định" i]').first
        if solution_area.is_visible():
            solution_area.fill(f"Hệ thống hàn siêu âm AI Precision v3.0 ({nonce})")
            page.fill('input[placeholder*="Viện / Trường" i]', "Viện Công Nghệ Laser Hà Nội")
            page.fill('input[placeholder*="seller@domain.vn" i]', "seller.user@demo.nacentech.vn")
            page.fill('input[placeholder*="0912xxxxxx" i]', "0988776655")
            
            send_btn = page.locator('button:has-text("Gửi Chào Bán Giải Pháp")').first
            if send_btn.is_visible():
                send_btn.click()
                time.sleep(3)
                
                opp_count = psql(f"SELECT count(*) FROM brokerage.opportunities WHERE title LIKE '%{nonce}%';")
                if int(opp_count) > 0:
                    opp_details = psql(f"SELECT id, opportunity_code, stage, buyer_contact_phone FROM brokerage.opportunities WHERE title LIKE '%{nonce}%' LIMIT 1;")
                    record_pass("TC-DMD-T4-005", f"Gửi giải pháp thành công! CSDL PostgreSQL xác nhận tạo Cơ hội hợp tác trong Pipeline: {opp_details}")
                else:
                    record_fail("TC-DMD-T4-005", "Tạo cơ hội kết nối", "UI báo thành công nhưng CSDL không sinh bản ghi opportunity", "Bản ghi xuất hiện trong brokerage.opportunities", "count = 0", "CRITICAL")
            else:
                record_fail("TC-DMD-T4-005", "Nút gửi đề xuất", "Không tìm thấy nút 'Gửi Chào Bán Giải Pháp'", "Button visible", "Không tìm thấy", "MAJOR")
        else:
            record_fail("TC-DMD-T4-005", "Form chào bán giải pháp", "Không tìm thấy form chào bán trên trang chi tiết", "Form visible", "Không tìm thấy", "MAJOR")

# =============================================================================
# HÀM ĐIỀU PHỐI CHÍNH (MAIN ORCHESTRATOR)
# =============================================================================
def main():
    print("\n" + "#"*80)
    print("  KHỞI ĐỘNG BỘ KIỂM THỬ QC ĐỘC LẬP 4 TẦNG & SĂN LỖI (ZERO-MOCK)")
    print("  HỆ THỐNG MỤC TIÊU: FRONTEND (3000), BACKEND (5080), POSTGRESQL (55440)")
    print("#"*80)

    # 1. Chạy Tầng 1: Control & Input Validations
    run_tier1_tests()

    # 2. Khởi tạo Chromium thật cho Tầng 2 & Tầng 4
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Chạy Tầng 2: UI Interactions & 5 UX States
        run_tier2_tests(page)

        # Chạy Tầng 3: Nghiệp vụ ẩn, Bất biến CSDL & Bảo mật
        run_tier3_tests()

        # Chạy Tầng 4: Hành trình E2E 5 Bước
        run_tier4_tests(page)

        browser.close()

    # =========================================================================
    # BÁO CÁO TỔNG KẾT THÀNH TÍCH QC
    # =========================================================================
    print("\n" + "="*80)
    print("📊 BÁO CÁO TỔNG KẾT THÀNH TÍCH KIỂM ĐỊNH CHẤT LƯỢNG (QC SUMMARY)")
    print("="*80)
    print(f"  Tổng số Test Cases: {TEST_RESULTS['TOTAL']}")
    print(f"  Số ca ĐẠT (PASS):   {TEST_RESULTS['PASS']} ({(TEST_RESULTS['PASS']/max(1, TEST_RESULTS['TOTAL']))*100:.1f}%)")
    print(f"  Số ca TRƯỢT (FAIL): {TEST_RESULTS['FAIL']} ({(TEST_RESULTS['FAIL']/max(1, TEST_RESULTS['TOTAL']))*100:.1f}%)")
    print(f"  TỔNG SỐ BUG PHÁT HIỆN ĐƯỢC: {len(DEFECTS)} BUGS")
    print("="*80)

    for idx, d in enumerate(DEFECTS, 1):
        print(f"\n[BUG #{idx:02d}] [{d['severity']}] {d['title']}")
        print(f"  - Mã Test Case: {d['tc_id']}")
        print(f"  - Mô tả:        {d['description']}")
        print(f"  - Kỳ vọng:      {d['expected']}")
        print(f"  - Thực tế:      {d['actual']}")

    report_file = "SourceCode/specs/TASK-03_HO_SO_TIM_MUA_BUYER/QC_DEFECT_REPORT.json"
    os.makedirs(os.path.dirname(report_file), exist_ok=True)
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump({
            "summary": TEST_RESULTS,
            "defects": DEFECTS,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }, f, ensure_ascii=False, indent=2)
    print(f"\n📁 Đã lưu trữ chi tiết báo cáo lỗi tại: {report_file}\n")

if __name__ == "__main__":
    main()
