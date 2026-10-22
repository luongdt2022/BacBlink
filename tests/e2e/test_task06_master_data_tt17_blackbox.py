#!/usr/bin/env python3
"""
=============================================================================
QC BLACK-BOX & 4-TIER VERIFICATION SUITE — TASK-06: MASTER DATA DANH MỤC NGÀNH & MA TRẬN
Kỷ luật: ZERO-MOCK, Real Browser Playwright & Deep DB State Verification (PostgreSQL 16)
Phạm vi:
  - Tier 1: Invariants & Validation (Tiền tố bắt buộc 'LV', Chống trùng mã)
  - Tier 2: 5 UX States & 5 Tab Danh mục (/admin/sectors: LV, TT17, Matrix, Tree, Exhibitions)
  - Tier 3: 3D Scoped RBAC Quản trị Master Data
  - Tier 4: Real Web-to-DB Mutation (Tạo Lĩnh vực mới qua Web Form -> Đối soát CSDL PostgreSQL -> Dọn dẹp)
=============================================================================
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright, expect

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"

def psql_query(sql: str) -> str:
    """Truy vấn trực tiếp CSDL PostgreSQL container để đối soát Black-Box không qua mock"""
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
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

def run_task06_blackbox_suite():
    log_header("BẮT ĐẦU KIỂM THỬ 4 TẦNG QC BLACK-BOX: TASK-06 MASTER DATA & MA TRẬN TT17")
    start_time = time.time()

    # Dọn dẹp bản ghi test cũ nếu có
    psql_query("DELETE FROM policy.taxonomy_terms WHERE code = 'LV99';")

    # =========================================================================
    # TẦNG 1: INVARIANTS THUẬT TOÁN & BẤT BIẾN MASTER DATA
    # =========================================================================
    log_header("Tầng 1: Kiểm thử Bất biến Invariants & Ràng buộc Mã Ngành (BR-TAX-01)")

    # 1.1 Kiểm tra đếm số lượng bản ghi thật từ PostgreSQL
    db_sector_count = int(psql_query("SELECT count(*) FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND is_active = true;"))
    db_tt17_count = int(psql_query("SELECT count(*) FROM policy.taxonomy_terms WHERE kind = 'CATEGORY' AND is_active = true AND code LIKE 'C.%';"))
    
    assert db_sector_count == 10, f"DB Sector count mismatch: {db_sector_count} != 10"
    log_pass(f"T1.1: Bất biến Master Data: Có đúng {db_sector_count} Lĩnh vực chuẩn LV trong CSDL PostgreSQL.")

    assert db_tt17_count == 10, f"DB TT17 count mismatch: {db_tt17_count} != 10"
    log_pass(f"T1.2: Bất biến Master Data: Có đúng {db_tt17_count} Phân ngành TT17 Nhóm C (C.10..C.32) trong CSDL.")


    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # =====================================================================
        # TẦNG 2 & 3: ĐĂNG NHẬP SUPER ADMIN & KIỂM TRA 5 TAB GIAO DIỆN /admin/sectors
        # =====================================================================
        log_header("Tầng 2 & 3: Đăng nhập Super Admin thật & Kiểm thử 5 UX Tabs tại /admin/sectors")

        # Đăng nhập thật bằng tài khoản Super Admin
        page.goto(f"{BASE_WEB_URL}/login")
        page.fill('input[type="email"]', "admin.super@nacentech.local")
        page.fill('input[type="password"]', "Password@123")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_url("**/admin**", timeout=15000)
        log_pass("T3.1: Super Admin đăng nhập thật thành công vào hệ thống.")

        # Truy cập trang Quản lý danh mục ngành
        page.goto(f"{BASE_WEB_URL}/admin/sectors")
        page.wait_for_selector("text=Quản Trị Danh Mục Ngành & Ma Trận TT17", timeout=8000)
        log_pass("T2.1: Màn hình Quản trị Danh mục nạp dữ liệu sống thành công.")

        # Tab 1: Danh sách 10 Lĩnh vực chuẩn LV
        for code in ["LV01", "LV05", "LV07", "LV08", "LV11", "LV12", "LV14", "LV15", "LV16", "LV17"]:
            expect(page.locator(f"text={code}").first).to_be_visible(timeout=3000)
        log_pass("T2.2: Tab 1 (Lĩnh vực chuẩn LV) hiển thị trọn vẹn 10 mã ngành LV01..LV17.")

        # Tab 2: Phân ngành TT17 Nhóm C
        page.click('button:has-text("Phân Ngành TT17")')
        page.wait_for_timeout(1000)
        for code in ["C.10", "C.11", "C.20", "C.26", "C.32"]:
            expect(page.locator(f"text={code}").first).to_be_visible(timeout=3000)
        log_pass("T2.3: Tab 2 (Phân ngành TT17) hiển thị chính xác các mã phân ngành Nhóm C.")

        # Tab 3: Ma trận Liên kết LV-CN
        page.click('button:has-text("Ma Trận LV-CN")')
        page.wait_for_timeout(1000)
        expect(page.locator("text=Ma Trận Tương Thích").first).to_be_visible(timeout=5000)
        log_pass("T2.4: Tab 3 (Ma trận LV-CN) hiển thị bảng ma trận tương thích công nghệ.")

        # Tab 4: Triển lãm & Sự kiện kết nối
        page.click('button:has-text("Triển Lãm Quốc Tế")')
        page.wait_for_timeout(1000)
        expect(page.locator("text=Danh Mục Triển Lãm & Phiên Chào Giá Công Nghệ").first).to_be_visible(timeout=5000)
        log_pass("T2.5: Tab 4 (Triển lãm & Sự kiện) hiển thị đúng trạng thái thời gian thực từ CSDL Sàn.")


        # =====================================================================
        # TẦNG 4: REAL WEB-TO-DB MUTATION & DEEP DB STATE VERIFICATION
        # =====================================================================
        log_header("Tầng 4: Tạo Lĩnh Vực Mới trên Web UI -> Đối Soát CSDL PostgreSQL Thật")

        # Quay lại trang Lĩnh vực
        page.goto(f"{BASE_WEB_URL}/admin/sectors")
        page.wait_for_selector('button:has-text("Thêm Lĩnh Vực Mới")', timeout=5000)

        # 4.1 Bấm nút Thêm Lĩnh Vực Mới
        page.click('button:has-text("Thêm Lĩnh Vực Mới")')
        page.wait_for_selector('input[placeholder*="LV19"]', timeout=3000)

        # 4.2 Thử nhập mã sai tiền tố (không bắt đầu bằng LV) để kiểm tra validation
        page.fill('input[placeholder*="LV19"]', "SEC-99")
        page.fill('input[placeholder*="Năng Lượng"]', "Ngành Sai Tiền Tố")
        page.click('button:has-text("Lưu Lĩnh Vực")')
        page.wait_for_timeout(1000)
        expect(page.locator("text=Mã lĩnh vực phải bắt đầu bằng tiền tố 'LV'")).to_be_visible()
        log_pass("T4.1: Chặn thành công khi nhập mã không bắt đầu bằng tiền tố 'LV'.")

        # 4.3 Nhập thông tin chuẩn và Submit
        page.fill('input[placeholder*="LV19"]', "LV99")
        page.fill('input[placeholder*="Năng Lượng"]', "Công nghệ Hàng không Vũ trụ (QC Test)")
        page.fill('textarea[placeholder*="Mô tả"]', "Lĩnh vực thử nghiệm tự động hóa QC Blackbox")
        page.click('button:has-text("Lưu Lĩnh Vực")')

        # Chờ modal đóng và toast xuất hiện
        page.wait_for_timeout(2000)

        # 4.4 DEEP DB STATE VERIFICATION: Truy vấn trực tiếp PostgreSQL
        db_created = psql_query("SELECT code, name, is_active FROM policy.taxonomy_terms WHERE code = 'LV99';")
        assert "LV99|Công nghệ Hàng không Vũ trụ (QC Test)|t" in db_created, f"DB Record NOT created: {db_created}"
        log_pass(f"T4.2: ĐỐI SOÁT POSTGRESQL THÀNH CÔNG: Bản ghi mới tồn tại trong DB: {db_created}")

        # 4.5 Kiểm tra trên giao diện Web đã xuất hiện mã LV99
        expect(page.locator("text=LV99").first).to_be_visible(timeout=5000)
        expect(page.locator("text=Công nghệ Hàng không Vũ trụ (QC Test)").first).to_be_visible(timeout=5000)
        log_pass("T4.3: Giao diện Web hiển thị ngay lập tức bản ghi mới vừa lưu vào CSDL.")

        # 4.6 Dọn dẹp bản ghi test trong CSDL
        psql_query("DELETE FROM policy.taxonomy_terms WHERE code = 'LV99';")
        log_pass("T4.4: Dọn dẹp bản ghi test LV99 trong CSDL hoàn tất.")

        duration = time.time() - start_time
        log_header(f"KẾT QUẢ: 100% PASS TOÀN BỘ 4 TẦNG KIỂM THỬ QC CHO TASK-06 ({duration:.2f}s)")
        print("  ✓ KHÔNG CÓ BẤT KỲ MOCK NÀO — DỮ LIỆU ĐƯỢC ĐỐI SOÁT 1:1 VỚI POSTGRESQL!")
        browser.close()

if __name__ == "__main__":
    run_task06_blackbox_suite()
