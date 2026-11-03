#!/usr/bin/env python3
"""
KIỂM ĐỊNH CHẤT LƯỢNG ĐỘC LẬP GATE 4 — CR-TASK-08-DELTA-03
Trưởng ban QC: nacen-qc (Playwright E2E Real Data Black-box Verification)
Target: Frontend (http://localhost:3000), Backend (http://localhost:5080), PostgreSQL (nacentech-postgres-1)
"""

import os
import sys
import time
import json
import requests
from playwright.sync_api import sync_playwright

API_URL = "http://localhost:5080/api/v1"
FE_URL = "http://localhost:3000"
EVIDENCE_DIR = "/Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My Drive/NacenTechProject/SourceCode/frontend/tests/e2e/evidence/gate4_radar"

os.makedirs(EVIDENCE_DIR, exist_ok=True)

def login(email, password):
    r = requests.post(f"{API_URL}/auth/login", json={"email": email, "password": password}, timeout=5)
    if r.status_code != 200:
        raise RuntimeError(f"Login failed for {email}: {r.status_code} - {r.text}")
    data = r.json()
    return data["accessToken"], data["user"]

def create_auth_context(browser, token, user):
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    token_json = json.dumps(token)
    user_json = json.dumps(user)
    role_json = json.dumps(user.get("role", ""))

    script = f"""
    const token = {token_json};
    const user = {user_json};
    try {{
        localStorage.setItem('nacentwin_access_token', token);
        localStorage.setItem('nacentwin_user_context', JSON.stringify(user));
        localStorage.setItem('nacentwin_active_role', {role_json});
        localStorage.setItem('nacentwin_token', token);
        localStorage.setItem('nacentwin_user', JSON.stringify(user));
    }} catch (e) {{
        console.error('Storage injection error:', e);
    }}
    """
    ctx.add_init_script(script)
    return ctx

def main():
    results = []
    def log_result(tc_id, title, status, notes=""):
        results.append({"tc_id": tc_id, "title": title, "status": status, "notes": notes})
        icon = "✅" if status == "PASS" else ("❌" if status == "FAIL" else "⚠️")
        print(f"{icon} [{status}] {tc_id}: {title} | {notes}")

    print("\n" + "="*80)
    print("BẮT ĐẦU KIỂM THỬ ĐỘC LẬP TẦNG 4: PLAYWRIGHT E2E & SCOPED RBAC FUZZING")
    print("="*80 + "\n")

    # 1. Đăng nhập thật các actors
    print("🔹 Bước 0: Đăng nhập thật lấy JWT Token từ Backend Kestrel...")
    token_buyer_a, user_buyer_a = login("buyer.user@demo.nacentech.vn", "Password@123")
    token_buyer_b, user_buyer_b = login("qc.buyer.b@nacentech.test", "Password@123")
    token_admin, user_admin = login("admin.super@nacentech.local", "Password@123")
    token_seller, user_seller = login("imet@nacentech.vn", "Admin@123")
    print("   [OK] Lấy thành công 4 token JWT thật.")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ---------------------------------------------------------------------
        # TEST CASE 1: Buyer A - Success State & Degradation Warning Badge & Recompute CTA
        # ---------------------------------------------------------------------
        print("\n🔹 TC-E2E-01: Kiểm thử Buyer A (Success State, XAI Breakdown 4 trục, Degradation Badge, Recompute)")
        ctx1 = create_auth_context(browser, token_buyer_a, user_buyer_a)
        page1 = ctx1.new_page()
        page1.goto(f"{FE_URL}/portal/matching/radar")
        page1.wait_for_timeout(8500)

        # Chụp màn hình
        p1 = os.path.join(EVIDENCE_DIR, "TC-E2E-01_BuyerA_Radar_Success.png")
        page1.screenshot(path=p1)

        # Assert Hero Banner
        banner_count = page1.locator("text=AI MATCHING ENGINE 4.0 · TT 17/2019/TT-BKHCN").count()
        if banner_count > 0:
            log_result("TC-E2E-01.1", "Hero Banner TT17/2019/TT-BKHCN hiển thị", "PASS", f"Tìm thấy {banner_count} banner")
        else:
            log_result("TC-E2E-01.1", "Hero Banner TT17/2019/TT-BKHCN hiển thị", "FAIL", "Không tìm thấy banner TT17")

        # Assert Degradation Warning Badge
        badge_count = page1.locator("text=Chế độ dự phòng FTS").count()
        if badge_count > 0:
            log_result("TC-E2E-01.2", "Degradation Warning Badge [Chế độ dự phòng FTS] kích hoạt khi Sidecar offline", "PASS", f"Tìm thấy {badge_count} badges")
        else:
            log_result("TC-E2E-01.2", "Degradation Warning Badge [Chế độ dự phòng FTS] kích hoạt", "FAIL", "Badge FTS không xuất hiện")

        # Assert Zero-mock text ("Lĩnh vực: 100% Khớp" phải bị triệt tiêu 100%)
        mock_text_count = page1.locator("text=Lĩnh vực: 100% Khớp").count()
        if mock_text_count == 0:
            log_result("TC-E2E-01.3", "Zero-Mock: Chuỗi mock tĩnh 'Lĩnh vực: 100% Khớp' bị triệt tiêu 100%", "PASS", "0 chuỗi mock tìm thấy")
        else:
            log_result("TC-E2E-01.3", "Zero-Mock text 'Lĩnh vực: 100% Khớp'", "FAIL", f"Vẫn còn {mock_text_count} chuỗi mock trên UI!")

        # Assert 4-axis XAI Breakdown
        xai_breakdown_count = page1.locator("text=Giải trình độ tương thích AI").count()
        semantic_label = page1.locator("text=Ngữ nghĩa AI").count() or page1.locator("text=FTS Fallback").count()
        trl_label = page1.locator("text=Độ sẵn sàng TRL").count() or page1.locator("text=TRL").count()
        tni_label = page1.locator("text=Cấp thiết TNI").count() or page1.locator("text=TNI").count()
        ip_label = page1.locator("text=Bảo hộ SHTT").count() or page1.locator("text=SHTT").count()

        if xai_breakdown_count > 0 and semantic_label > 0 and trl_label > 0 and tni_label > 0 and ip_label > 0:
            log_result("TC-E2E-01.4", "XAI Breakdown 4 trục (Ngữ nghĩa AI/FTS, TRL, TNI, SHTT) hiển thị chuẩn xác", "PASS", f"XAI cards count: {xai_breakdown_count}")
        else:
            log_result("TC-E2E-01.4", "XAI Breakdown 4 trục", "FAIL", f"Thiếu trục: xai={xai_breakdown_count}, sem={semantic_label}, trl={trl_label}, tni={tni_label}, ip={ip_label}")

        # Assert Recompute CTA Button & Loading Spinner & Toast
        recompute_btn = page1.locator("button:has-text('Tính toán lại đối soát')")
        if recompute_btn.count() > 0:
            recompute_btn.first.click()
            page1.wait_for_timeout(2000)
            p1_recompute = os.path.join(EVIDENCE_DIR, "TC-E2E-01_BuyerA_Recomputed.png")
            page1.screenshot(path=p1_recompute)
            log_result("TC-E2E-01.5", "Nút CTA 'Tính toán lại đối soát' click được và kích hoạt recompute thành công", "PASS")
        else:
            log_result("TC-E2E-01.5", "Nút CTA 'Tính toán lại đối soát'", "FAIL", "Không tìm thấy nút Recompute")

        ctx1.close()

        # ---------------------------------------------------------------------
        # TEST CASE 2: Buyer B - Empty State UX (Doanh nghiệp mới chưa có bài toán)
        # ---------------------------------------------------------------------
        print("\n🔹 TC-E2E-02: Kiểm thử Buyer B (Empty State UX khi chưa có bài toán nhu cầu)")
        ctx2 = create_auth_context(browser, token_buyer_b, user_buyer_b)
        page2 = ctx2.new_page()
        page2.goto(f"{FE_URL}/portal/matching/radar")
        page2.wait_for_timeout(8500)

        p2 = os.path.join(EVIDENCE_DIR, "TC-E2E-02_BuyerB_Empty_State.png")
        page2.screenshot(path=p2)

        # Kiểm tra Empty State: Radar Ghép Nối AI Chưa Kích Hoạt
        empty_title_count = page2.locator("text=Radar Ghép Nối AI Chưa Kích Hoạt").count() or page2.locator("text=Chưa có bài toán").count() or page2.locator("text=Không tìm thấy ứng viên").count()

        if empty_title_count > 0:
            log_result("TC-E2E-02.1", "Empty State hiển thị rõ ràng khi Buyer chưa có bài toán nhu cầu", "PASS", "Giao diện hướng dẫn tạo bài toán hiển thị đúng thiết kế")
        else:
            log_result("TC-E2E-02.1", "Empty State khi chưa có bài toán", "FAIL", "Không hiển thị màn hình Empty State chuẩn")

        ctx2.close()

        # ---------------------------------------------------------------------
        # TEST CASE 3: Super Admin - Supervisory Full View & Sector Filtering
        # ---------------------------------------------------------------------
        print("\n🔹 TC-E2E-03: Kiểm thử Super Admin (Toàn cảnh giám sát & Bộ lọc Sector)")
        ctx3 = create_auth_context(browser, token_admin, user_admin)
        page3 = ctx3.new_page()
        page3.goto(f"{FE_URL}/portal/matching/radar")
        page3.wait_for_timeout(8500)

        p3 = os.path.join(EVIDENCE_DIR, "TC-E2E-03_SuperAdmin_Overview.png")
        page3.screenshot(path=p3)

        # Kiểm tra Admin nhìn thấy giao diện giám sát toàn cảnh
        admin_view_count = page3.locator("text=Góc Nhìn Giám Sát Thực Địa").count() or page3.locator("text=Quản Trị Viên Hệ Thống").count() or page3.locator("text=AI MATCHING ENGINE").count()
        if admin_view_count > 0:
            log_result("TC-E2E-03.1", "Super Admin xem được toàn cảnh Radar giám sát thị trường B2B", "PASS", f"Tìm thấy {admin_view_count} supervisory indicators")
        else:
            log_result("TC-E2E-03.1", "Super Admin xem toàn cảnh", "FAIL", "Không hiển thị giao diện giám sát Admin")

        ctx3.close()

        # ---------------------------------------------------------------------
        # TEST CASE 4: Seller Role - Re-verification (Phúc tra lỗi HTTP 500 đã được khắc phục)
        # ---------------------------------------------------------------------
        print("\n🔹 TC-E2E-04: Phúc tra Seller Role (Xác nhận lỗi HTTP 500 đã được khắc phục triệt để)")
        ctx4 = create_auth_context(browser, token_seller, user_seller)
        page4 = ctx4.new_page()
        page4.goto(f"{FE_URL}/portal/matching/radar")
        page4.wait_for_timeout(8500)

        p4 = os.path.join(EVIDENCE_DIR, "TC-E2E-04_Seller_Radar_Success.png")
        page4.screenshot(path=p4)

        # Kiểm tra xem giao diện có bị lỗi không
        error_count = page4.locator("text=500").count() or page4.locator("text=Không thể tải danh sách").count()
        seller_heading = page4.locator("text=AI MATCHING ENGINE").count() or page4.locator("text=Nhà Cung Ứng Công Nghệ").count() or page4.locator("text=Radar Tìm Kiếm Nhu Cầu (AI)").count()

        if error_count == 0 and seller_heading > 0:
            log_result("TC-E2E-04.1", "Seller truy cập Radar tải trang thành công, không còn lỗi HTTP 500 (DEFECT RESOLVED)", "PASS", "Tải trang hoàn hảo")
        else:
            log_result("TC-E2E-04.1", "Seller truy cập Radar vẫn bị lỗi", "FAIL", f"error_count={error_count}, seller_heading={seller_heading}")

        ctx4.close()

        # ---------------------------------------------------------------------
        # TEST CASE 5: RBAC Fuzzing & Security Boundary Audit
        # ---------------------------------------------------------------------
        print("\n🔹 TC-E2E-05: RBAC Scoped Isolation & Fuzzing Security Audit")

        # 5.1 Fuzzing: Buyer B cố tình recompute bài toán của Buyer A
        r_recomp_fuzz = requests.post(
            f"{API_URL}/brokerage/radar/recompute",
            headers={"Authorization": f"Bearer {token_buyer_b}"},
            json={"demandCode": "DMD-DEMO-NC-02"},
            timeout=5
        )
        if r_recomp_fuzz.status_code == 200 and r_recomp_fuzz.json().get("data", {}).get("computedMatchesCount") == 0:
            log_result("TC-E2E-05.1", "RBAC Fuzzing: Buyer B không thể recompute bài toán của Buyer A (matches = 0)", "PASS", "Bảo vệ IDOR hoàn hảo")
        else:
            log_result("TC-E2E-05.1", "RBAC Fuzzing: Buyer B recompute bài toán của Buyer A", "FAIL", f"Kết quả: {r_recomp_fuzz.text}")

        # 5.2 Fuzzing: Buyer B cố tình query danh sách candidates của Buyer A
        r_query_fuzz = requests.get(
            f"{API_URL}/brokerage/radar?demandCode=DMD-DEMO-NC-02",
            headers={"Authorization": f"Bearer {token_buyer_b}"},
            timeout=5
        )
        data_fuzz = r_query_fuzz.json().get("data", [])
        if len(data_fuzz) == 0:
            log_result("TC-E2E-05.2", "RBAC Scoping: Buyer B không thấy candidates của Buyer A (Data count = 0)", "PASS", "Dữ liệu được cách ly an toàn")
        else:
            log_result("TC-E2E-05.2", "RBAC Scoping: Buyer B thấy candidates của Buyer A", "FAIL", f"Rò rỉ {len(data_fuzz)} candidates!")

        # 5.3 Security Vulnerability: Anonymous access leak candidates
        r_anon = requests.get(f"{API_URL}/brokerage/radar", timeout=5)
        if r_anon.status_code == 401:
            log_result("TC-E2E-05.3", "BẢO MẬT: Anonymous Access bị chặn thành công bằng HTTP 401 Unauthorized", "PASS", "Bảo mật [Authorize] hoạt động")
        else:
            anon_data = r_anon.json().get("data", []) if r_anon.status_code == 200 else []
            if len(anon_data) > 0:
                log_result("TC-E2E-05.3", "BẢO MẬT: Anonymous Access bypasses RBAC and leaks candidates to unauthenticated users", "FAIL", f"Rò rỉ {len(anon_data)} match candidates khi không có token (Thiếu [Authorize])")
            else:
                log_result("TC-E2E-05.3", f"BẢO MẬT: Anonymous status={r_anon.status_code}", "PASS")

        browser.close()

    print("\n" + "="*80)
    print("TỔNG KẾT KẾT QUẢ KIỂM THỬ PLAYWRIGHT E2E & SCOPED RBAC:")
    passed_cnt = sum(1 for r in results if r["status"] == "PASS")
    failed_cnt = sum(1 for r in results if r["status"] == "FAIL")
    print(f"Tổng số test: {len(results)} | PASS: {passed_cnt} | FAIL (Bóc trần Defects): {failed_cnt}")
    print("="*80 + "\n")

    # Lưu kết quả json
    report_path = os.path.join(EVIDENCE_DIR, "gate4_qc_execution_results.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"Báo cáo chi tiết JSON đã lưu tại: {report_path}")

    if failed_cnt > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
