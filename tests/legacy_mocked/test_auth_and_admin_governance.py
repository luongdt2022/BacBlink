"""
NacenTwin E2E Regression Test Suite: Authentication & Admin Governance
File: SourceCode/frontend/tests/e2e/test_auth_and_admin_governance.py
Phân hệ: TASK-00 (IAM) & TASK-07 (Scoped RBAC & Admin Governance)
Quy chuẩn: Tự động chạy trong CI/CD hoặc kiểm thử hồi quy trước khi Release/Hotfix.
"""

import json
import time
from playwright.sync_api import Page, expect

def test_full_auth_and_admin_regression(page: Page):
    # Dynamic Mocking API cho môi trường E2E Regression
    def handle_auth_api(route):
        url = route.request.url
        if "/api/v1/auth/register" in url:
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({"code": "REGISTER_SUCCESS", "message": "Đăng ký thành công!"})
            )
        elif "/api/v1/auth/login" in url:
            post_data = route.request.post_data_json or {}
            email = post_data.get("email", "")

            if "superadmin" in email:
                role = "SUPER_ADMIN"
                scope_type, scope_id = "GLOBAL", None
                name = "Quản trị viên Tối cao"
            elif "so.hp" in email:
                role = "PROVINCIAL_ADMIN"
                scope_type, scope_id = "PROVINCE", "HP"
                name = "Lãnh đạo Sở KH&CN Hải Phòng"
            elif "expert" in email:
                role = "VERIFIED_EXPERT"
                scope_type, scope_id = "GLOBAL", None
                name = "Chuyên gia KH&CN"
            elif "seller" in email:
                role = "SELLER"
                scope_type, scope_id = "GLOBAL", None
                name = "Doanh nghiệp Chào bán"
            else:
                role = "PUBLIC_USER"
                scope_type, scope_id = "GLOBAL", None
                name = "Thành viên Công chúng"

            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "accessToken": f"jwt-regression-token-{role}",
                    "user": {
                        "id": f"usr-{role.lower()}",
                        "email": email,
                        "fullName": name,
                        "role": role,
                        "scopeType": scope_type,
                        "scopeId": scope_id
                    }
                })
            )
        else:
            route.continue_()

    page.route("**/api/v1/auth/**", handle_auth_api)

    # 1. TEST ĐĂNG KÝ PUBLIC_USER (/register)
    page.goto("http://localhost:3000/register")
    page.locator('input[placeholder*="Nguyễn"]').fill("Đặng Tiến")
    page.locator('input[placeholder*="An"]').fill("Lượng")
    page.locator('input[type="email"]').fill("regression.tester@nacentech.vn")
    pw = page.locator('input[type="password"]')
    pw.nth(0).fill("SecurePass@2026")
    pw.nth(1).fill("SecurePass@2026")
    page.locator('input[type="checkbox"]').check()
    page.locator('button:has-text("Đăng ký thành viên")').click()
    expect(page.locator('text=Đăng ký thành công')).to_be_visible(timeout=5000)

    # 2. TEST ĐĂNG NHẬP & ĐIỀU HƯỚNG SUPER_ADMIN VÀO /admin
    page.goto("http://localhost:3000/login")
    page.locator('input[type="email"]').fill("superadmin@nacentech.gov.vn")
    page.locator('input[type="password"]').fill("AdminSecret2026!")
    page.locator('button:has-text("Đăng nhập vào Hệ Thống")').click()
    page.wait_for_url("**/admin**", timeout=8000)

    # 3. TEST HÀNG ĐỢI PHÊ DUYỆT (/admin/approvals)
    page.goto("http://localhost:3000/admin/approvals")
    expect(page.locator('text=Hàng Đợi Phê Duyệt').first).to_be_visible()
    page.locator('button[title*="Xem chi tiết hồ sơ"], button:has-text("Xem chi tiết")').first.click()
    approve_btn = page.locator('button:has-text("Phê duyệt Chính thức")').first
    expect(approve_btn).to_be_visible()
    approve_btn.click()
    expect(page.locator('text=Đã phê duyệt').first).to_be_visible()

    # 4. TEST QUẢN LÝ 10 ROLES (/admin/roles)
    page.goto("http://localhost:3000/admin/roles")
    expect(page.locator('text=Ma Trận 10 Vai Trò').first).to_be_visible()

    # 5. TEST CÂY 34 TỈNH THÀNH (/admin/org-tree)
    page.goto("http://localhost:3000/admin/org-tree")
    expect(page.locator('text=Cây Thư Mục 34 Tỉnh').first).to_be_visible()

    # 6. TEST ĐĂNG XUẤT AN TOÀN
    page.goto("http://localhost:3000/settings")
    page.locator('button:has-text("Đăng xuất")').first.click()
    page.locator('[role="dialog"] button:has-text("Đăng xuất"), .fixed button:has-text("Đăng xuất")').last.click()
    page.wait_for_url("http://localhost:3000/", timeout=8000)

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        test_full_auth_and_admin_regression(page)
        browser.close()
        print("✅ Toàn bộ bộ test E2E Regression đã thực thi thành công 100% trong headless mode!")
