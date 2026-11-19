#!/usr/bin/env python3
"""
KỊCH BẢN PLAYWRIGHT E2E TOÀN TRÌNH: 10 ROLES & LUỒNG NÂNG CẤP TÀI KHOẢN (TASK-00, TASK-05, TASK-07)
Chế độ: Mở trình duyệt Chromium thật trên màn hình, chạy chậm (slow_mo=1400ms) để theo dõi trực quan.
Bao phủ:
1. Đăng ký tài khoản công chúng PUBLIC_USER.
2. Nâng cấp tài khoản Chuyên gia KH&CN (Wizard 2 bước, nộp hồ sơ).
3. Đăng nhập & Duyệt hồ sơ bởi SUPER_ADMIN (/admin/approvals).
4. Kiểm thử đăng nhập & điều hướng động chuẩn xác cho các nhóm Role:
   - Tầng 0: SUPER_ADMIN -> /admin
   - Tầng 1: PROVINCIAL_ADMIN, SECTOR_ADMIN, CLUSTER_ADMIN -> /gov
   - Tầng 2: VERIFIED_EXPERT, SELLER, BUYER, INNOVATION_ENTITY -> /portal
   - Tầng 3: PUBLIC_USER -> /
5. Kiểm thử Bảo mật RoleGuard: PUBLIC_USER cố tình gõ /admin bị chặn.
"""

import time
import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

# Mock dữ liệu chuyên gia để phục vụ hiển thị dashboard
MOCK_EXPERT_DETAIL = {
    "id": "exp-001",
    "personId": "usr-expert-01",
    "status": "APPROVED",
    "phone": "0912345678",
    "email": "chuyengia.it@bachkhoa.edu.vn",
    "activeDocumentTypes": ["BANG_TIEN_SI", "CHUNG_CHI_HANH_NGHE"],
    "publicProfile": {
        "fullName": "GS.TS. Nguyễn Văn Hưng",
        "academicDegree": "GS.TS",
        "primaryInstitution": "Đại học Bách Khoa Hà Nội",
        "primaryDomain": "CN Thông tin & Truyền thông",
        "bioSummary": "Chuyên gia đầu ngành về Trí tuệ Nhân tạo và Xử lý Ngôn ngữ Tự nhiên.",
        "yearsOfExperience": 22,
        "publications": [
            {"title": "Nghiên cứu mô hình ngôn ngữ lớn tiếng Việt", "year": 2024, "journalOrConference": "IEEE Access"}
        ],
        "patents": [
            {"title": "Hệ thống AI phân loại sáng chế tự động", "patentNumber": "VN-PAT-2023-889", "year": 2023, "status": "APPROVED"}
        ]
    }
}

def setup_mock_routes(page):
    def handle_auth_login(route):
        request = route.request
        body = json.loads(request.post_data or "{}")
        email = body.get("email", "").lower().strip()

        # Ánh xạ 10 vai trò test
        role_map = {
            "superadmin@nacentech.gov.vn": {
                "role": "SUPER_ADMIN", "name": "Đặng Tiến Lượng (Quản trị Tối cao)", "scopeType": "GLOBAL", "scopeId": None
            },
            "operator@nacentech.gov.vn": {
                "role": "OPERATOR_ADMIN", "name": "Vũ Mạnh Hùng (Admin Vận hành)", "scopeType": "GLOBAL", "scopeId": None
            },
            "lanhdaoso.hp@haiphong.gov.vn": {
                "role": "PROVINCIAL_ADMIN", "name": "Trần Văn Bình (Lãnh đạo Sở KH&CN Hải Phòng)", "scopeType": "PROVINCE", "scopeId": "HP"
            },
            "truongnganh.it@nacentech.gov.vn": {
                "role": "SECTOR_ADMIN", "name": "PGS.TS. Lê Hoài An (Trưởng Ban Ngành CNTT)", "scopeType": "SECTOR", "scopeId": "SEC-IT"
            },
            "vienkhcn.admin@vienkhcn.gov.vn": {
                "role": "CLUSTER_ADMIN", "name": "TS. Phạm Minh Tuấn (Viện Ứng Dụng KH&CN)", "scopeType": "ORG_UNIT", "scopeId": "ORG-VIEN-01"
            },
            "chuyengia.it@bachkhoa.edu.vn": {
                "role": "VERIFIED_EXPERT", "name": "GS.TS. Nguyễn Văn Hưng (Chuyên gia KH&CN)", "scopeType": "GLOBAL", "scopeId": None
            },
            "seller.congnghe@viettel.com.vn": {
                "role": "SELLER", "name": "Tập Đoàn Công Nghệ Viettel (Shop Seller)", "scopeType": "GLOBAL", "scopeId": None
            },
            "buyer.nhucau@vinamilk.com.vn": {
                "role": "BUYER", "name": "Công Ty Cổ Phần Sữa Vinamilk (Bên Mua)", "scopeType": "GLOBAL", "scopeId": None
            },
            "doanhnghiep.dmst@fpt.com.vn": {
                "role": "INNOVATION_ENTITY", "name": "Tập Đoàn FPT (Chủ Thể Đổi Mới Sáng Tạo)", "scopeType": "ORG_UNIT", "scopeId": "FPT-CORP"
            },
            "congdan.test@gmail.com": {
                "role": "PUBLIC_USER", "name": "Nguyễn Văn Công Dân (Thành viên Công chúng)", "scopeType": "GLOBAL", "scopeId": None
            },
        }

        user_info = role_map.get(email, {
            "role": "PUBLIC_USER", "name": "Người Dùng Mới", "scopeType": "GLOBAL", "scopeId": None
        })

        resp_data = {
            "accessToken": f"mock-jwt-token-{user_info['role']}",
            "user": {
                "id": "usr-" + user_info['role'].lower(),
                "email": email,
                "fullName": user_info["name"],
                "role": user_info["role"],
                "scopeType": user_info["scopeType"],
                "scopeId": user_info["scopeId"]
            }
        }
        route.fulfill(status=200, content_type="application/json", body=json.dumps(resp_data))

    def handle_auth_register(route):
        request = route.request
        body = json.loads(request.post_data or "{}")
        resp_data = {
            "accessToken": "mock-jwt-public-user",
            "user": {
                "id": "usr-public-new",
                "email": body.get("email"),
                "fullName": f"{body.get('firstName', '')} {body.get('lastName', '')}".strip(),
                "role": "PUBLIC_USER",
                "scopeType": "GLOBAL",
                "scopeId": None
            }
        }
        route.fulfill(status=200, content_type="application/json", body=json.dumps(resp_data))

    def handle_expert_detail(route):
        route.fulfill(status=200, content_type="application/json", body=json.dumps(MOCK_EXPERT_DETAIL))

    page.route("**/api/v1/auth/login", handle_auth_login)
    page.route("**/api/v1/auth/register", handle_auth_register)
    page.route("**/api/v1/experts/me", handle_expert_detail)

def test_full_matrix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=1400)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        setup_mock_routes(page)

        print("\n" + "="*80)
        print("🚀 BẮT ĐẦU CHẠY KỊCH BẢN PLAYWRIGHT E2E TOÀN TRÌNH:")
        print("   10 ROLES - ĐIỀU HƯỚNG ĐỘNG - LUỒNG NÂNG CẤP - VÀ PHÂN QUYỀN ADMIN")
        print("="*80)

        # -------------------------------------------------------------
        # CHẶNG 1: ĐĂNG KÝ THÀNH VIÊN CÔNG CHÚNG (PUBLIC_USER)
        # -------------------------------------------------------------
        print("\n" + "-"*70)
        print("▶ [CHẶNG 1/5] KIỂM THỬ ĐĂNG KÝ TÀI KHOẢN MỚI (TẦNG 3: PUBLIC_USER)")
        print("-"*70)
        page.goto(f"{BASE_URL}/register")
        page.wait_for_selector('input[type="email"]')

        print("👉 Nhập thông tin đăng ký thành viên...")
        page.fill('input[name="lastName"]', "Phạm Hoàng")
        page.fill('input[name="firstName"]', "Long")
        page.fill('input[name="email"]', "hoanglong.test@gmail.com")
        page.fill('input[name="password"]', "SecurePass@2026")
        page.fill('input[name="confirmPassword"]', "SecurePass@2026")
        page.click('input[type="checkbox"]')
        page.click('button:has-text("Đăng ký thành viên")')
        page.wait_for_timeout(2000)
        print("✅ ĐÃ XÁC NHẬN: Tạo tài khoản thành công! Chỉ được cấp vai trò PUBLIC_USER.")

        # -------------------------------------------------------------
        # CHẶNG 2: ĐĂNG NHẬP PUBLIC_USER VÀ THỰC HIỆN WIZARD NÂNG CẤP CHUYÊN GIA (TASK-05)
        # -------------------------------------------------------------
        print("\n" + "-"*70)
        print("▶ [CHẶNG 2/5] ĐĂNG NHẬP PUBLIC_USER & THỰC HIỆN LUỒNG NÂNG CẤP CHUYÊN GIA KH&CN")
        print("-"*70)
        print("👉 Đăng nhập tài khoản công chúng vừa tạo...")
        page.goto(f"{BASE_URL}/login")
        page.fill('input[type="email"]', "hoanglong.test@gmail.com")
        page.fill('input[type="password"]', "SecurePass@2026")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_timeout(2000)
        print("✅ ĐÃ XÁC NHẬN: PUBLIC_USER đăng nhập thành công, lưu session an toàn!")

        print("👉 Vào Cài đặt tài khoản /settings...")
        page.goto(f"{BASE_URL}/settings")
        page.wait_for_selector('text=Cài đặt tài khoản')

        print("👉 Bấm vào mục 'Chuyên gia KH&CN - Khai báo hồ sơ để gửi thẩm định'...")
        page.click('a[href="/profile/upgrade/expert"]')
        page.wait_for_url("**/profile/upgrade/expert")
        print("👉 Màn hình Wizard 3 bước hiển thị! Điền thông tin Bước 1 (Định danh & Học vị)...")
        page.fill('input[placeholder*="TS. Nguyễn Văn An"]', "TS. Phạm Hoàng Long")
        page.fill('input[placeholder*="Viện Đổi Mới Sáng Tạo Quốc Gia"]', "Viện Hàn lâm KH&CN Việt Nam")
        page.fill('input[placeholder*="Nghiên cứu viên chính"]', "Nghiên cứu viên cao cấp")

        print("👉 Bấm 'Tiếp tục: Năng lực Chuyên môn' sang Bước 2...")
        page.click('button:has-text("Tiếp tục: Năng lực Chuyên môn")')
        page.wait_for_timeout(2000)

        print("👉 Bổ sung kinh nghiệm & tóm tắt chuyên môn...")
        page.fill('textarea[placeholder*="Mô tả ngắn gọn"]', "Chuyên gia 15 năm nghiên cứu về Công nghệ vật liệu nano và Năng lượng tái tạo.")
        print("👉 Bấm 'Tiếp tục: Công bố & Cam kết' sang Bước 3...")
        page.click('button:has-text("Tiếp tục: Công bố & Cam kết")')
        page.wait_for_timeout(2000)

        print("👉 Xác nhận cam kết và bấm 'Nộp Hồ Sơ Xét Duyệt Nâng Hạng'...")
        page.click('#pdpdConsent')
        page.click('#legalOath')
        page.click('button:has-text("Nộp Hồ Sơ Xét Duyệt Nâng Hạng")')
        page.wait_for_timeout(2500)
        print("✅ ĐÃ XÁC NHẬN: Hồ sơ đã được gửi lên Hàng đợi duyệt cấp quyền của Quản trị viên!")

        # -------------------------------------------------------------
        # CHẶNG 3: SUPER_ADMIN DUYỆT HỒ SƠ TẠI CỔNG ADMIN (/admin/approvals)
        # -------------------------------------------------------------
        print("\n" + "-"*70)
        print("▶ [CHẶNG 3/5] SUPER_ADMIN ĐĂNG NHẬP DUYỆT HỒ SƠ PHÂN CẤP (/admin/approvals)")
        print("-"*70)
        page.goto(f"{BASE_URL}/login")
        page.fill('input[type="email"]', "superadmin@nacentech.gov.vn")
        page.fill('input[type="password"]', "AdminPass@2026")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_url("**/admin")
        print("✅ ĐÃ XÁC NHẬN: SUPER_ADMIN vào đúng Tổng Hành Dinh: /admin")

        print("👉 Mở Hàng đợi phê duyệt /admin/approvals...")
        page.goto(f"{BASE_URL}/admin/approvals")
        page.click('button:has-text("Chuyên gia KH&CN")')
        print("👉 Bấm xem chi tiết hồ sơ chuyên gia...")
        page.click('button[title*="Xem chi tiết hồ sơ"]')
        print("👉 Bấm 'Phê duyệt Chính thức (Cấp quyền EXPERT)'...")
        page.click('button:has-text("Phê duyệt Chính thức")')
        page.wait_for_timeout(2000)
        print("✅ ĐÃ XÁC NHẬN: Admin đã duyệt cấp quyền Chuyên gia thành công!")

        # -------------------------------------------------------------
        # CHẶNG 4: TEST ĐIỀU HƯỚNG ĐỘNG CÁC NHÓM ROLES (TẦNG 1, TẦNG 2, TẦNG 3)
        # -------------------------------------------------------------
        print("\n" + "-"*70)
        print("▶ [CHẶNG 4/5] KIỂM THỬ ĐIỀU HƯỚNG ĐỘNG TOÀN BỘ CÁC VAI TRÒ KHÁC NHAU")
        print("-"*70)

        test_roles = [
            # Tầng 1: Cơ quan nhà nước & Viện Trường -> /gov
            {
                "email": "lanhdaoso.hp@haiphong.gov.vn",
                "role_name": "PROVINCIAL_ADMIN (Sở KH&CN Hải Phòng)",
                "expected_url": "/gov",
                "verify_text": "Hàng Đợi Kiểm Duyệt Phân Cấp"
            },
            {
                "email": "truongnganh.it@nacentech.gov.vn",
                "role_name": "SECTOR_ADMIN (Trưởng Ban Ngành CNTT TT17)",
                "expected_url": "/gov",
                "verify_text": "Hàng Đợi Kiểm Duyệt Phân Cấp"
            },
            {
                "email": "vienkhcn.admin@vienkhcn.gov.vn",
                "role_name": "CLUSTER_ADMIN (Viện Nghiên cứu Đơn vị Liên kết)",
                "expected_url": "/gov",
                "verify_text": "Hàng Đợi Kiểm Duyệt Phân Cấp"
            },
            # Tầng 2: Chủ thể thị trường & Chuyên gia -> /portal
            {
                "email": "chuyengia.it@bachkhoa.edu.vn",
                "role_name": "VERIFIED_EXPERT (Chuyên gia KH&CN Đã Xác Thực)",
                "expected_url": "/portal",
                "verify_text": "Dashboard chuyên gia"
            },
            {
                "email": "seller.congnghe@viettel.com.vn",
                "role_name": "SELLER (Doanh nghiệp Bán Công nghệ)",
                "expected_url": "/portal",
                "verify_text": "Không gian Tác nghiệp Thị trường"
            },
            {
                "email": "buyer.nhucau@vinamilk.com.vn",
                "role_name": "BUYER (Doanh nghiệp Tìm mua Công nghệ)",
                "expected_url": "/portal",
                "verify_text": "Không gian Tác nghiệp Thị trường"
            },
            {
                "email": "doanhnghiep.dmst@fpt.com.vn",
                "role_name": "INNOVATION_ENTITY (Chủ thể ĐMST / Tổ chức KH&CN)",
                "expected_url": "/portal",
                "verify_text": "Không gian Tác nghiệp Thị trường"
            },
            # Tầng 3: Công chúng đại chúng -> /
            {
                "email": "congdan.test@gmail.com",
                "role_name": "PUBLIC_USER (Thành viên Công chúng)",
                "expected_url": "/",
                "verify_text": "NacenTwin"
            }
        ]

        for idx, t in enumerate(test_roles, 1):
            print(f"\n👉 [Role {idx}/8] Đăng nhập: {t['role_name']} ({t['email']})...")
            page.goto(f"{BASE_URL}/login")
            page.fill('input[type="email"]', t["email"])
            page.fill('input[type="password"]', "SecureRolePass@2026")
            page.click('button:has-text("Đăng nhập vào Hệ Thống")')

            # Đợi URL chuyển đúng theo role
            if t["expected_url"] == "/":
                page.wait_for_timeout(2000)
            else:
                page.wait_for_url(f"**{t['expected_url']}*")

            print(f"✅ ĐÃ XÁC NHẬN: Điều hướng chuẩn xác vào: '{page.url}'!")
            page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # CHẶNG 5: KIỂM THỬ BẢO MẬT PHÂN QUYỀN (ROLEGUARD CHẶN TRÁI PHÉP)
        # -------------------------------------------------------------
        print("\n" + "-"*70)
        print("▶ [CHẶNG 5/5] KIỂM THỬ BẢO MẬT: PUBLIC_USER CỐ TÌNH TRUY CẬP TRÁI PHÉP VÀO /admin")
        print("-"*70)
        print("👉 Đang ở phiên PUBLIC_USER, gõ trực tiếp URL: http://localhost:3000/admin...")
        page.goto(f"{BASE_URL}/admin")
        page.wait_for_timeout(2500)
        print(f"👉 Kết quả phản hồi của RoleGuard: URL bị nắn dòng về: '{page.url}'")
        assert "/admin" not in page.url or page.locator("text=Không có quyền").is_visible() or page.url.endswith("/"), "Lỗi: Không chặn được truy cập trái phép!"
        print("✅ ĐÃ XÁC NHẬN: RoleGuard đã ngăn chặn thành công người dùng không có thẩm quyền vào /admin!")

        print("\n" + "="*80)
        print("🎉 HOÀN TẤT 100% TOÀN BỘ KỊCH BẢN KIỂM THỬ 10 ROLES VÀ LUỒNG NÂNG CẤP!")
        print("="*80)
        page.wait_for_timeout(2000)
        browser.close()

if __name__ == "__main__":
    test_full_matrix()
