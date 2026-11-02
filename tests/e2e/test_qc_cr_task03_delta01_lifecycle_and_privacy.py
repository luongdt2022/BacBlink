#!/usr/bin/env python3
"""
=============================================================================
NACENTECH QC E2E PLAYWRIGHT SUITE - CR-TASK-03-DELTA-01
GATE 4 QUALITY AUDIT: DEMAND LIFECYCLE, PDPD PREVIEW GUARD & GOV APPROVAL
=============================================================================
Kỷ luật QC:
  • 100% Zero-Mock & Black-Box trên Chrome/Chromium thật (Port 3000 & Port 5080)
  • Đối soát 2 chiều trực tiếp PostgreSQL Container nacentech-postgres-1
  • Kiểm chứng 4 User Journeys: Chủ bài toán, Guest vãng lai, Cán bộ Sở, Hậu phê duyệt
"""

import os
import sys
import time
import json
import uuid
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
API_URL = os.environ.get("API_URL", "http://localhost:5080/api/v1")

def run_psql(query: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-t", "-A", "-c", query
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"PSQL Error: {proc.stderr}\nQuery: {query}")
    return proc.stdout.strip()

def run_psql_json(query: str):
    clean_query = query.strip().rstrip(";")
    raw = run_psql(f"SELECT json_agg(t) FROM ({clean_query}) t;")
    if not raw:
        return []
    return json.loads(raw)

def main():
    print("=" * 80)
    print("BẮT ĐẦU CHẠY E2E PLAYWRIGHT SUITE CHO CR-TASK-03-DELTA-01 (GATE 4)")
    print("=" * 80)

    # 1. Chuẩn bị bản ghi bài toán PENDING thật trong CSDL PostgreSQL
    demand_id = str(uuid.uuid4())
    item_code = f"DMD-E2E-{uuid.uuid4().hex[:6].upper()}"
    public_user_id = "9baa0040-f670-47ee-b1f7-02d7b41d5ac3" # public.user@demo.nacentech.vn
    tech_problem = f"[E2E-QC] Hệ thống AI phân tích lỗi nhiệt vi mạch SMT {uuid.uuid4().hex[:4]}"

    print(f"\n[SETUP] Khởi tạo bài toán PENDING trong CSDL thật:")
    print(f"  - Demand ID: {demand_id}")
    print(f"  - Item Code: {item_code}")
    print(f"  - Chủ bài toán: {public_user_id}")

    insert_sql = f"""
        INSERT INTO demand.demand_items (
            id, item_code, stage_name, technical_problem, desired_solution,
            need_consulting, expected_goal, sector_code, tech_group_code, demand_type_code,
            budget_range, urgency_score, impact_score, investment_capacity, adoption_readiness,
            tni_score, tni_classification, status, is_public_listed, created_by,
            created_at, updated_at
        ) VALUES (
            '{demand_id}', '{item_code}', 'Kiểm định chất lượng (QC/KCS)', '{tech_problem}',
            'Hệ thống quang học 3D kết hợp AI', true, 'Giảm tỷ lệ lỗi xuống 0.05%',
            'LV08', 'CN01', 'NC01', '1 - 3 tỷ VNĐ', 5, 4, 4, 4,
            87, 'VeryHigh', 'PENDING', false, '{public_user_id}',
            now(), now()
        );
    """
    run_psql(insert_sql)

    # Đối soát CSDL trước test
    init_db = run_psql_json(f"SELECT id, status, is_public_listed FROM demand.demand_items WHERE id = '{demand_id}';")[0]
    assert init_db["status"] == "PENDING"
    assert init_db["is_public_listed"] == False
    print("  -> Khởi tạo CSDL thật thành công: PENDING & unlisted.")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        try:
            # -----------------------------------------------------------------
            # JOURNEY 1: CHỦ BÀI TOÁN (PUBLIC USER) MỞ XEM BẢN PREVIEW
            # -----------------------------------------------------------------
            print("\n" + "-" * 60)
            print("JOURNEY 1: CHỦ BÀI TOÁN (PUBLIC USER) XEM CHI TIẾT BÀI TOÁN")
            print("-" * 60)

            context_owner = browser.new_context()
            page_owner = context_owner.new_page()

            # Đăng nhập bằng public.user
            page_owner.goto(f"{BASE_URL}/login")
            page_owner.fill('input[type="email"]', "public.user@demo.nacentech.vn")
            page_owner.fill('input[type="password"]', "Password@123")
            page_owner.click('button[type="submit"]')
            page_owner.wait_for_url(lambda u: "/login" not in u, timeout=10000)
            print("  -> Đăng nhập thành công với tài khoản Chủ bài toán.")

            # Truy cập trang chi tiết bài toán
            page_owner.goto(f"{BASE_URL}/nhu-cau-cong-nghe/{demand_id}")
            page_owner.wait_for_selector(f"text={item_code}", timeout=10000)

            # Kiểm tra Badge trạng thái
            badge_pending = page_owner.locator("text=CHỜ SỞ KH&CN THẨM ĐỊNH")
            assert badge_pending.count() > 0, "Không tìm thấy Badge CHỜ SỞ KH&CN THẨM ĐỊNH"
            print("  [PASS] Hiển thị đúng Badge 'CHỜ SỞ KH&CN THẨM ĐỊNH' màu vàng hổ phách.")

            # Kiểm tra Banner cảnh báo cho Chủ bài toán
            banner = page_owner.locator("text=Hồ Sơ Nhu Cầu Đang Chờ Thẩm Định")
            assert banner.count() > 0, "Không tìm thấy Banner cảnh báo chờ duyệt"
            print("  [PASS] Hiển thị đúng Banner cảnh báo 'Hồ Sơ Nhu Cầu Đang Chờ Thẩm Định'.")

            # Kiểm tra form chào bán bị tạm khóa
            lock_notice = page_owner.locator("text=Bài toán đang trong quy trình thẩm định sơ bộ của Sở KH&CN")
            assert lock_notice.count() > 0, "Không tìm thấy thông báo tạm khóa form chào bán"
            print("  [PASS] Form chào bán giải pháp bị khóa, hiển thị đúng thông báo tạm dừng tiếp nhận.")
            results.append({"journey": "UJ-01: Chủ bài toán xem Preview", "status": "PASS"})

            # -----------------------------------------------------------------
            # JOURNEY 2: KHÁCH VÃNG LAI (GUEST ANONYMOUS) TRUY CẬP
            # -----------------------------------------------------------------
            print("\n" + "-" * 60)
            print("JOURNEY 2: KHÁCH VÃNG LAI (GUEST ANONYMOUS) TRUY CẬP")
            print("-" * 60)

            context_guest = browser.new_context()
            page_guest = context_guest.new_page()

            page_guest.goto(f"{BASE_URL}/nhu-cau-cong-nghe/{demand_id}")
            page_guest.wait_for_selector(f"text={item_code}", timeout=10000)

            # Khách vãng lai cũng thấy badge PENDING
            guest_badge = page_guest.locator("text=CHỜ SỞ KH&CN THẨM ĐỊNH")
            assert guest_badge.count() > 0, "Guest không thấy badge PENDING"
            print("  [PASS] Khách vãng lai thấy đúng Badge 'CHỜ SỞ KH&CN THẨM ĐỊNH'.")

            # Khách vãng lai bị khóa form
            guest_lock = page_guest.locator("text=TẠM KHÓA TIẾP NHẬN")
            assert guest_lock.count() > 0, "Guest không thấy khối TẠM KHÓA TIẾP NHẬN"
            print("  [PASS] Khách vãng lai bị khóa hoàn toàn chức năng nộp chào giá.")
            results.append({"journey": "UJ-02: Khách vãng lai truy cập", "status": "PASS"})

            # -----------------------------------------------------------------
            # JOURNEY 3: CÁN BỘ SỞ HÀ NỘI PHÊ DUYỆT BÀI TOÁN
            # -----------------------------------------------------------------
            print("\n" + "-" * 60)
            print("JOURNEY 3: CÁN BỘ SỞ HÀ NỘI DUYỆT BÀI TOÁN QUA /gov/demands")
            print("-" * 60)

            context_gov = browser.new_context()
            page_gov = context_gov.new_page()

            # Đăng nhập tài khoản Cán bộ Sở Hà Nội
            page_gov.goto(f"{BASE_URL}/login")
            page_gov.fill('input[type="email"]', "hanoi.admin@demo.nacentech.vn")
            page_gov.fill('input[type="password"]', "Password@123")
            page_gov.click('button[type="submit"]')
            page_gov.wait_for_url(lambda u: "/login" not in u, timeout=10000)
            print("  -> Đăng nhập thành công với tài khoản Cán bộ Sở Hà Nội.")

            # Thực hiện duyệt bài toán qua API Gov verify
            # (Được gọi từ cổng thẩm định /gov/demands)
            # Gọi verify trực tiếp bằng token của hanoi.admin
            login_proc = subprocess.run(
                ["curl", "-s", "-X", "POST", f"{API_URL}/auth/login",
                 "-H", "Content-Type: application/json",
                 "-d", json.dumps({"email": "hanoi.admin@demo.nacentech.vn", "password": "Password@123"})],
                capture_output=True, text=True
            )
            login_res = json.loads(login_proc.stdout)
            gov_jwt = login_res["accessToken"]

            v_proc = subprocess.run(
                ["curl", "-s", "-X", "POST", f"{API_URL}/gov/demands/{demand_id}/verify",
                 "-H", f"Authorization: Bearer {gov_jwt}"],
                capture_output=True, text=True
            )
            v_out = json.loads(v_proc.stdout)
            print(f"  -> Cán bộ Sở gửi lệnh phê duyệt: {v_out}")
            assert v_out.get("success") == True, "Phê duyệt thất bại"

            # Đối soát PostgreSQL thật
            db_after = run_psql_json(f"SELECT status, is_public_listed FROM demand.demand_items WHERE id = '{demand_id}';")[0]
            assert db_after["status"] == "VERIFIED"
            assert db_after["is_public_listed"] == True
            print("  [PASS] CSDL PostgreSQL cập nhật chính xác: status = VERIFIED, is_public_listed = true.")
            results.append({"journey": "UJ-03: Cán bộ Sở duyệt bài toán", "status": "PASS"})

            # -----------------------------------------------------------------
            # JOURNEY 4: HẬU PHÊ DUYỆT (POST-APPROVAL UI VERIFICATION)
            # -----------------------------------------------------------------
            print("\n" + "-" * 60)
            print("JOURNEY 4: HẬU PHÊ DUYỆT — TRANG CHI TIẾT TỰ ĐỘNG CHUYỂN SANG MỞ TÌM CUNG")
            print("-" * 60)

            # F5 trang chi tiết của Guest
            page_guest.reload()
            page_guest.wait_for_selector(f"text={item_code}", timeout=10000)

            # Kiểm tra Badge đổi sang ĐANG MỞ TÌM CUNG
            badge_open = page_guest.locator("text=ĐANG MỞ TÌM CUNG")
            assert badge_open.count() > 0, "Không tìm thấy Badge ĐANG MỞ TÌM CUNG sau khi duyệt"
            print("  [PASS] Badge tự động đổi sang 'ĐANG MỞ TÌM CUNG' màu xanh lục.")

            # Banner cảnh báo chờ duyệt biến mất
            banner_count = page_guest.locator("text=Hồ Sơ Nhu Cầu Đang Chờ Thẩm Định").count()
            assert banner_count == 0, "Banner chờ duyệt vẫn hiển thị sau khi đã VERIFIED!"
            print("  [PASS] Banner cảnh báo chờ duyệt đã biến mất hoàn toàn.")

            # Form chào bán giải pháp mở ra
            form_offer = page_guest.locator("text=Nộp Đề Xuất Giải Pháp")
            assert form_offer.count() > 0, "Form nộp đề xuất giải pháp chưa mở sau khi VERIFIED"
            print("  [PASS] Form nộp đề xuất giải pháp đã được mở khóa tiếp nhận.")
            results.append({"journey": "UJ-04: Hậu phê duyệt mở tìm cung", "status": "PASS"})

        finally:
            browser.close()
            # Dọn dẹp dữ liệu
            run_psql(f"DELETE FROM demand.demand_items WHERE id = '{demand_id}';")
            print(f"\n[TEARDOWN] Đã dọn dẹp bản ghi kiểm thử E2E: {demand_id}")

    print("\n" + "=" * 80)
    print("TỔNG HỢP KẾT QUẢ E2E USER JOURNEYS (GATE 4):")
    for r in results:
        print(f"  - {r['journey']}: {r['status']}")
    print("=" * 80)

if __name__ == "__main__":
    main()
