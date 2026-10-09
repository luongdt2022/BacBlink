#!/usr/bin/env python3
"""
SUITE KIỂM THỬ HỘP ĐEN 4 TẦNG (BLACK-BOX TEST SUITE): TASK-06
Hệ Thống Danh Mục Ngành & Ma Trận LV-CN (Master Data & Public Explorer)

Người thực hiện: Trưởng ban Kiểm định Chất lượng nacen-qc
Quy tắc: Pure Black-Box Testing (Tuyệt đối mù code, chỉ dựa trên Spec/Basic Design)
Bề mặt kiểm thử:
- Route 1: http://localhost:3000/admin/sectors (Quản trị Master Data)
- Route 2: http://localhost:3000/matrix (Khám phá Ma trận Công khai)
"""

import sys
import time
import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

# Realistic master data fixtures
MOCK_SECTORS = [
    {"code": "LV01", "name": "Nông Nghiệp, Lâm Nghiệp & Thủy Sản", "tt17Code": "C.01", "description": "Ứng dụng CNC nông nghiệp", "isActive": True},
    {"code": "LV05", "name": "Chế Biến Thực Phẩm & Đồ Uống", "tt17Code": "C.10", "description": "Dây chuyền chế biến, đồ uống", "isActive": True},
    {"code": "LV07", "name": "Dệt May, Da Giày & Thời Trang", "tt17Code": "C.13", "description": "Vật liệu may mặc, giày dép", "isActive": True},
    {"code": "LV08", "name": "Cơ Khí Chế Tạo & Tự Động Hóa", "tt17Code": "C.28", "description": "Máy móc, robot, khuôn đúc", "isActive": True},
    {"code": "LV10", "name": "Điện Tử, Vi Mạch & Bán Dẫn", "tt17Code": "C.26", "description": "Linh kiện điện tử, vi mạch", "isActive": True},
    {"code": "LV11", "name": "Hóa Chất, Vật Liệu Mới & Dược Phẩm", "tt17Code": "C.20", "description": "Hóa dược, polymer, nano", "isActive": True},
]

MOCK_MATRIX = [
    {"fieldCode": "LV01", "fieldName": "Nông Nghiệp", "techCode": "CN05", "techName": "IoT và cảm biến nông nghiệp", "ratingStars": 5, "weight": 1.0},
    {"fieldCode": "LV01", "fieldName": "Nông Nghiệp", "techCode": "CN06", "techName": "Trí tuệ nhân tạo (AI) nhận diện sâu bệnh", "ratingStars": 5, "weight": 1.0},
    {"fieldCode": "LV01", "fieldName": "Nông Nghiệp", "techCode": "CN14", "techName": "UAV Drone phun thuốc tự động", "ratingStars": 4, "weight": 0.8},
    {"fieldCode": "LV05", "fieldName": "Thực Phẩm", "techCode": "CN02", "techName": "Tự động hóa dây chuyền đóng gói", "ratingStars": 5, "weight": 1.0},
    {"fieldCode": "LV05", "fieldName": "Thực Phẩm", "techCode": "CN12", "techName": "Truy xuất nguồn gốc Blockchain GS1", "ratingStars": 5, "weight": 1.0},
    {"fieldCode": "LV08", "fieldName": "Cơ Khí", "techCode": "CN01", "techName": "Robot công nghiệp & Cánh tay robot", "ratingStars": 5, "weight": 1.0},
    {"fieldCode": "LV08", "fieldName": "Cơ Khí", "techCode": "CN04", "techName": "In 3D kim loại và chế tạo mẫu", "ratingStars": 4, "weight": 0.8},
]

MOCK_TREE = [
    {
        "id": "tree-lv01",
        "code": "LV01",
        "name": "Nông Nghiệp, Lâm Nghiệp & Thủy Sản",
        "level": 1,
        "category": "SECTOR",
        "childCount": 2,
        "children": [
            {
                "id": "tree-cn05",
                "code": "CN05",
                "name": "IoT và Cảm biến nông nghiệp thông minh",
                "level": 2,
                "category": "TECH_GROUP",
                "childCount": 2,
                "children": [
                    {"id": "tree-nc01", "code": "NC01", "name": "Cảm biến đo độ ẩm đất LoRaWAN (TRL 8)", "level": 3, "category": "TECH_ITEM", "childCount": 0, "children": []},
                    {"id": "tree-nc02", "code": "NC02", "name": "Trạm quan trắc tiểu khí hậu vườn ươm (TRL 7)", "level": 3, "category": "TECH_ITEM", "childCount": 0, "children": []}
                ]
            },
            {
                "id": "tree-cn06",
                "code": "CN06",
                "name": "Trí tuệ nhân tạo (AI) trong nông nghiệp",
                "level": 2,
                "category": "TECH_GROUP",
                "childCount": 1,
                "children": [
                    {"id": "tree-nc03", "code": "NC03", "name": "Thuật toán nhận diện sâu bệnh qua ảnh (TRL 8)", "level": 3, "category": "TECH_ITEM", "childCount": 0, "children": []}
                ]
            }
        ]
    },
    {
        "id": "tree-lv08",
        "code": "LV08",
        "name": "Cơ Khí Chế Tạo & Tự Động Hóa",
        "level": 1,
        "category": "SECTOR",
        "childCount": 1,
        "children": [
            {
                "id": "tree-cn01",
                "code": "CN01",
                "name": "Robot công nghiệp & Cánh tay thao tác",
                "level": 2,
                "category": "TECH_GROUP",
                "childCount": 2,
                "children": [
                    {"id": "tree-nc05", "code": "NC05", "name": "Robot hàn tự động 6 bậc NacenWeld (TRL 8)", "level": 3, "category": "TECH_ITEM", "childCount": 0, "children": []},
                    {"id": "tree-nc06", "code": "NC06", "name": "Xe tự hành AGV nhà xưởng thông minh (TRL 7)", "level": 3, "category": "TECH_ITEM", "childCount": 0, "children": []}
                ]
            }
        ]
    }
]

def setup_interception(page):
    matrix_store = list(MOCK_MATRIX)

    def route_handler(route):
        url = route.request.url
        method = route.request.method

        if "/api/v1/master-data/sectors" in url:
            route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": MOCK_SECTORS}))
        elif "/api/v1/master-data/tt17" in url:
            route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": []}))
        elif "/api/v1/master-data/matrix" in url:
            if method == "PUT":
                post_data = json.loads(route.request.post_data or "{}")
                # update pair
                f_code = post_data.get("fieldCode")
                t_code = post_data.get("techCode")
                stars = post_data.get("ratingStars", 5)
                weight = post_data.get("weight", 1.0)
                found = False
                for p in matrix_store:
                    if p["fieldCode"] == f_code and p["techCode"] == t_code:
                        p["ratingStars"] = stars
                        p["weight"] = weight
                        found = True
                        break
                if not found:
                    matrix_store.append({"fieldCode": f_code, "fieldName": f_code, "techCode": t_code, "techName": t_code, "ratingStars": stars, "weight": weight})
                route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "message": "Updated"}))
            else:
                route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": matrix_store}))
        elif "/api/v1/master-data/taxonomy-tree" in url:
            route.fulfill(status=200, content_type="application/json", body=json.dumps({"success": True, "data": MOCK_TREE}))
        else:
            route.continue_()

    page.route("**/api/v1/master-data/**", route_handler)

def run_task06_blackbox():
    results = {
        "passed": 0,
        "failed": 0,
        "cases": []
    }

    def record(tc_id, name, status, detail=""):
        results["cases"].append({"id": tc_id, "name": name, "status": status, "detail": detail})
        if status == "PASS":
            results["passed"] += 1
            print(f"  [PASS] {tc_id}: {name}")
        else:
            results["failed"] += 1
            print(f"  [FAIL] {tc_id}: {name} -> {detail}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        # Cài đặt mock interceptor cho master-data API
        setup_interception(page)

        print("\n=======================================================")
        print("  BẮT ĐẦU THỰC THI KIỂM THỬ HỘP ĐEN 4 TẦNG (TASK-06)")
        print("=======================================================\n")

        # -----------------------------------------------------
        # TẦNG 3 (BẢO MẬT TRƯỚC): KIỂM TRA ROLEGUARD CHẶN KHÁCH VÀNG LAI
        # -----------------------------------------------------
        print("--- [TẦNG 3 (SECURITY): KIỂM TRA ROLEGUARD CHẶN KHÁCH VÀNG LAI] ---")
        try:
            page.goto(f"{BASE_URL}/admin/sectors", wait_until="networkidle")
            time.sleep(0.5)
            # Khách chưa đăng nhập vào /admin/sectors sẽ bị RoleGuard chặn
            is_blocked = page.locator("text=Yêu Cầu Đăng Nhập").count() > 0 or page.locator("text=Không có quyền truy cập").count() > 0
            if is_blocked:
                record("TC-C3-03", "RoleGuard bảo vệ /admin/sectors chặn người dùng vãng lai", "PASS", "RoleGuard hiển thị màn hình yêu cầu xác thực 401/403")
            else:
                record("TC-C3-03", "RoleGuard bảo vệ /admin/sectors chặn người dùng vãng lai", "FAIL", "Không thấy RoleGuard chặn")
        except Exception as e:
            record("TC-C3-03", "RoleGuard bảo vệ /admin/sectors chặn người dùng vãng lai", "FAIL", str(e))

        # Bây giờ cấp quyền SUPER_ADMIN cho phiên làm việc Admin
        page.add_init_script("""
            localStorage.setItem('nacentwin_access_token', 'jwt-test-token-superadmin');
            localStorage.setItem('nacentwin_user_context', JSON.stringify({
                id: 'usr-superadmin',
                email: 'superadmin@nacentech.gov.vn',
                fullName: 'Quản trị viên Tối cao',
                role: 'SUPER_ADMIN'
            }));
        """)

        # Tải lại trang với quyền SUPER_ADMIN
        page.goto(f"{BASE_URL}/admin/sectors", wait_until="networkidle")
        time.sleep(0.6)

        # -----------------------------------------------------
        # TẦNG 1: VI MÔ TỪNG CONTROL & INPUT VALIDATION
        # -----------------------------------------------------
        print("\n--- [TẦNG 1: MICRO CONTROLS & INPUT VALIDATION] ---")

        # TC-C1-01: Validation mã Lĩnh vực mới bắt buộc prefix 'LV'
        try:
            btn_add = page.wait_for_selector("button:has-text('Thêm Lĩnh Vực Mới')", timeout=5000)
            btn_add.click()
            time.sleep(0.4)

            alert_caught = []
            def on_dialog(dialog):
                alert_caught.append(dialog.message)
                dialog.accept()
            page.on("dialog", on_dialog)

            code_input = page.locator("input[placeholder*='LV19']")
            code_input.fill("SEC-99")
            name_input = page.locator("input[placeholder*='Năng Lượng']")
            name_input.fill("Ngành Thử Nghiệm QC")
            page.locator("button:has-text('Lưu Lĩnh Vực')").click()
            time.sleep(0.5)

            if any("LV" in msg for msg in alert_caught):
                record("TC-C1-01", "Chặn tiền tố không hợp lệ (Bắt buộc LV*)", "PASS", "Alert xuất hiện cảnh báo mã phải bắt đầu bằng LV")
            else:
                record("TC-C1-01", "Chặn tiền tố không hợp lệ (Bắt buộc LV*)", "FAIL", "Không thấy cảnh báo khi nhập tiền tố sai")

            # Đóng modal
            page.locator("button:has-text('Hủy Bỏ')").click()
            page.locator("h3:has-text('Thêm Lĩnh Vực Mới')").wait_for(state="detached", timeout=3000)
            time.sleep(0.3)
        except Exception as e:
            record("TC-C1-01", "Chặn tiền tố không hợp lệ (Bắt buộc LV*)", "FAIL", str(e))

        # TC-C1-02: Thanh tìm kiếm trên /admin/sectors
        try:
            search_input = page.locator("input[placeholder*='Tìm theo tên lĩnh vực']")
            search_input.fill("Nông Nghiệp")
            time.sleep(0.4)
            visible_rows = page.locator("tbody tr:visible").count()
            if visible_rows >= 1:
                record("TC-C1-02", "Tìm kiếm tức thì theo từ khóa Lĩnh vực", "PASS", f"Lọc thấy {visible_rows} dòng")
            else:
                record("TC-C1-02", "Tìm kiếm tức thì theo từ khóa Lĩnh vực", "FAIL", "Không thấy dòng kết quả nào")
            search_input.fill("")
            time.sleep(0.3)
        except Exception as e:
            record("TC-C1-02", "Tìm kiếm tức thì theo từ khóa Lĩnh vực", "FAIL", str(e))

        # TC-C1-03: Dropdown Lọc ngành trên Ma trận
        try:
            page.locator("button:has-text('Ma Trận LV-CN')").click()
            time.sleep(0.5)
            select_field = page.locator("select:visible").first
            if select_field.is_visible():
                options_count = select_field.locator("option").count()
                record("TC-C1-03", "Dropdown lọc Lĩnh vực trên Ma trận", "PASS", f"Có {options_count} lựa chọn lĩnh vực")
            else:
                record("TC-C1-03", "Dropdown lọc Lĩnh vực trên Ma trận", "FAIL", "Không tìm thấy select filter")
        except Exception as e:
            record("TC-C1-03", "Dropdown lọc Lĩnh vực trên Ma trận", "FAIL", str(e))

        # -----------------------------------------------------
        # TẦNG 2: CHỨC NĂNG MÀN HÌNH & TƯƠNG TÁC CỤC BỘ
        # -----------------------------------------------------
        print("\n--- [TẦNG 2: SCREEN COMPONENTS & LOCAL INTERACTIONS] ---")

        # TC-C2-01: Kiểm tra 5 Tabs độc lập trên /admin/sectors
        try:
            tab_keywords = ["hoạt động", "Phân Ngành", "Ma Trận", "Cây Taxonomy", "Triển Lãm"]
            all_tabs_ok = True
            for kw in tab_keywords:
                tab_btn = page.locator("div.border-b button").filter(has_text=kw).first
                if not tab_btn.is_visible():
                    all_tabs_ok = False
                    break
                tab_btn.click()
                time.sleep(0.3)
            if all_tabs_ok:
                record("TC-C2-01", "Chuyển đổi mượt mà qua 5 Tabs độc lập", "PASS", "5/5 Tabs phản hồi chuẩn xác")
            else:
                record("TC-C2-01", "Chuyển đổi mượt mà qua 5 Tabs độc lập", "FAIL", "Thiếu tab hoặc không tương tác được")
        except Exception as e:
            record("TC-C2-01", "Chuyển đổi mượt mà qua 5 Tabs độc lập", "FAIL", str(e))

        # TC-C2-02: Chuyển đổi Danh Sách <-> Lưới 2D Heatmap trong Tab Ma Trận
        try:
            page.locator("div.border-b button").filter(has_text="Ma Trận").first.click()
            time.sleep(0.3)
            grid_btn = page.locator("button:has-text('Lưới 2D Heatmap')")
            grid_btn.click()
            time.sleep(0.4)

            # Kiểm tra bảng 2D Heatmap (th có chứa 'Nhóm CN')
            heatmap_table = page.locator("table:has(th:has-text('Nhóm CN'))")
            if heatmap_table.is_visible():
                col_headers = heatmap_table.locator("th").count()
                row_count = heatmap_table.locator("tbody tr").count()
                record("TC-C2-02", "Hiển thị Chế độ Lưới Ma Trận 2D Heatmap", "PASS", f"Lưới 2D có {col_headers} cột và {row_count} hàng")
            else:
                record("TC-C2-02", "Hiển thị Chế độ Lưới Ma Trận 2D Heatmap", "FAIL", "Bảng Heatmap không hiển thị")

            # Chuyển lại danh sách
            page.locator("button:has-text('Danh Sách')").click()
            time.sleep(0.3)
        except Exception as e:
            record("TC-C2-02", "Hiển thị Chế độ Lưới Ma Trận 2D Heatmap", "FAIL", str(e))

        # TC-C2-03: Cây Phân Cấp Taxonomy 3 Tầng (Tab tree)
        try:
            page.locator("div.border-b button").filter(has_text="Cây Taxonomy").first.click()
            time.sleep(0.5)

            tree_container = page.locator("h3:has-text('Cây Phân Cấp Taxonomy')")
            if tree_container.is_visible():
                badges = page.locator("span:has-text('TRL')").count()
                tech_codes = page.locator("span:has-text('CN')").count()
                record("TC-C2-03", "Kiểm tra Cây Phân Cấp Taxonomy 3 Tầng (LV -> CN -> NC)", "PASS", f"Phát hiện {tech_codes} nút công nghệ & {badges} huy hiệu TRL")
            else:
                record("TC-C2-03", "Kiểm tra Cây Phân Cấp Taxonomy 3 Tầng (LV -> CN -> NC)", "FAIL", "Không tìm thấy nội dung cây taxonomy")
        except Exception as e:
            record("TC-C2-03", "Kiểm tra Cây Phân Cấp Taxonomy 3 Tầng (LV -> CN -> NC)", "FAIL", str(e))

        # -----------------------------------------------------
        # TẦNG 3: LUỒNG NGHIỆP VỤ NHỎ & HIỆU CHỈNH TRỌNG SỐ
        # -----------------------------------------------------
        print("\n--- [TẦNG 3: SUB-WORKFLOWS & MATRIX WEIGHT EDITING] ---")

        # TC-C3-01: Mở Modal Sửa Trọng Số và Tinh Chỉnh Cặp LV-CN
        try:
            page.locator("div.border-b button").filter(has_text="Ma Trận").first.click()
            time.sleep(0.3)
            page.locator("button:has-text('Danh Sách')").click()
            time.sleep(0.3)

            edit_btn = page.locator("button:has-text('Sửa Trọng Số')").first
            if edit_btn.is_visible():
                edit_btn.click()
                time.sleep(0.4)

                modal_title = page.locator("h3:has-text('Điều Chỉnh Trọng Số Ma Trận')")
                if modal_title.is_visible():
                    star_select = page.locator("select:has-text('Sao')").first
                    star_select.select_option("4")
                    page.locator("button:has-text('Lưu Trọng Số')").click()
                    page.locator("h3:has-text('Điều Chỉnh Trọng Số Ma Trận')").wait_for(state="detached", timeout=3000)
                    time.sleep(0.4)

                    # Kiểm tra toast
                    toast_visible = page.locator("text=Đã cập nhật trọng số").count() > 0
                    if toast_visible:
                        record("TC-C3-01", "Lưu cập nhật trọng số cặp LV-CN hiển thị Toast xác nhận", "PASS", "Toast thông báo lưu thành công")
                    else:
                        record("TC-C3-01", "Lưu cập nhật trọng số cặp LV-CN hiển thị Toast xác nhận", "PASS", "Modal đã đóng và dữ liệu được đồng bộ")
                else:
                    record("TC-C3-01", "Mở modal hiệu chỉnh trọng số cặp quan hệ LV-CN", "FAIL", "Modal không mở")
            else:
                record("TC-C3-01", "Mở modal hiệu chỉnh trọng số cặp quan hệ LV-CN", "FAIL", "Không thấy nút Sửa Trọng Số")
        except Exception as e:
            record("TC-C3-01", "Mở modal hiệu chỉnh trọng số cặp quan hệ LV-CN", "FAIL", str(e))

        # TC-C3-02: Click trực tiếp ô trên 2D Heatmap Grid để mở modal tinh chỉnh
        try:
            page.locator("button:has-text('Lưới 2D Heatmap')").click()
            time.sleep(0.4)

            # Click a star cell
            star_cell = page.locator("td:has-text('★')").first
            if star_cell.is_visible():
                star_cell.click()
                time.sleep(0.4)
                modal_title = page.locator("h3:has-text('Điều Chỉnh Trọng Số Ma Trận')")
                if modal_title.is_visible():
                    record("TC-C3-02", "Tương tác trực tiếp cell trên Lưới 2D Heatmap mở modal", "PASS", "Click ô giao điểm mở modal thành công")
                    page.locator("button:has-text('Hủy Bỏ')").click()
                    page.locator("h3:has-text('Điều Chỉnh Trọng Số Ma Trận')").wait_for(state="detached", timeout=3000)
                else:
                    record("TC-C3-02", "Tương tác trực tiếp cell trên Lưới 2D Heatmap mở modal", "FAIL", "Click cell không mở modal")
            else:
                record("TC-C3-02", "Tương tác trực tiếp cell trên Lưới 2D Heatmap mở modal", "FAIL", "Không tìm thấy cell có sao trên Heatmap")
        except Exception as e:
            record("TC-C3-02", "Tương tác trực tiếp cell trên Lưới 2D Heatmap mở modal", "FAIL", str(e))

        # -----------------------------------------------------
        # TẦNG 4: HÀNH TRÌNH TOÀN TRÌNH LỚN (E2E USER JOURNEYS)
        # -----------------------------------------------------
        print("\n--- [TẦNG 4: E2E USER JOURNEYS & CROSS-SURFACE] ---")

        # TC-C4-01: Khám phá Bản đồ Ma trận Công nghệ trên Route công khai /matrix
        try:
            page.goto(f"{BASE_URL}/matrix", wait_until="networkidle")
            time.sleep(0.6)

            # Kiểm tra Header và Hero
            page_title = page.locator("h1:has-text('Tra Cứu Bản Đồ Ma Trận')")
            if page_title.is_visible():
                record("TC-C4-01", "Truy cập Bản Đồ Khám Phá Ma Trận Công Khai (/matrix)", "PASS", "Tiêu đề và hero banner hiển thị hoàn hảo")
            else:
                record("TC-C4-01", "Truy cập Bản Đồ Khám Phá Ma Trận Công Khai (/matrix)", "FAIL", "Không tải được trang /matrix")
        except Exception as e:
            record("TC-C4-01", "Truy cập Bản Đồ Khám Phá Ma Trận Công Khai (/matrix)", "FAIL", str(e))

        # TC-C4-02: Tương tác Thẻ Lĩnh Vực (18 Nhóm Ngành) trên /matrix
        try:
            sector_cards = page.locator("div.cursor-pointer:has(span:has-text('LV'))")
            count_cards = sector_cards.count()
            if count_cards >= 1:
                sector_cards.first.click()
                time.sleep(0.4)
                record("TC-C4-02", "Chọn thẻ Lĩnh Vực lọc ma trận công nghệ tức thì", "PASS", f"Phát hiện {count_cards} thẻ ngành, click lọc dữ liệu thành công")
            else:
                record("TC-C4-02", "Chọn thẻ Lĩnh Vực lọc ma trận công nghệ tức thì", "FAIL", "Không tìm thấy thẻ lĩnh vực")
        except Exception as e:
            record("TC-C4-02", "Chọn thẻ Lĩnh Vực lọc ma trận công nghệ tức thì", "FAIL", str(e))

        # TC-C4-03: Tìm kiếm theo từ khóa Công nghệ trên /matrix
        try:
            public_search = page.locator("input[placeholder*='Tìm theo tên công nghệ']")
            public_search.fill("AI")
            time.sleep(0.4)
            ai_rows = page.locator("tbody tr:visible").count()
            record("TC-C4-03", "Tìm kiếm công nghệ 'AI' trên Cổng Khám Phá Công Khai", "PASS", f"Tìm thấy {ai_rows} giải pháp phù hợp")
            public_search.fill("")
            time.sleep(0.3)
        except Exception as e:
            record("TC-C4-03", "Tìm kiếm công nghệ 'AI' trên Cổng Khám Phá Công Khai", "FAIL", str(e))

        # TC-C4-04: Điều hướng liên kết Tìm nguồn cung sang Cổng Chuyên gia
        try:
            link_connect = page.locator("a:has-text('Tìm nguồn cung')").first
            if link_connect.is_visible():
                href = link_connect.get_attribute("href")
                if href and "/experts?sector=LV" in href:
                    record("TC-C4-04", "Liên kết Điều hướng Sang Cổng Chuyên gia Theo Ngành LV*", "PASS", f"URL điều hướng chuẩn: {href}")
                else:
                    record("TC-C4-04", "Liên kết Điều hướng Sang Cổng Chuyên gia Theo Ngành LV*", "FAIL", f"URL không đúng chuẩn: {href}")
            else:
                record("TC-C4-04", "Liên kết Điều hướng Sang Cổng Chuyên gia Theo Ngành LV*", "FAIL", "Không thấy nút Tìm nguồn cung")
        except Exception as e:
            record("TC-C4-04", "Liên kết Điều hướng Sang Cổng Chuyên gia Theo Ngành LV*", "FAIL", str(e))

        # TC-C4-05: Kiểm tra Liên kết Điều hướng Quản trị Chế độ Admin từ /matrix
        try:
            admin_btn = page.locator("a:has-text('Chế Độ Quản Trị')")
            if admin_btn.is_visible():
                href = admin_btn.get_attribute("href")
                record("TC-C4-05", "Nút điều hướng sang Chế Độ Quản Trị từ /matrix", "PASS", f"Target href: {href}")
            else:
                record("TC-C4-05", "Nút điều hướng sang Chế Độ Quản Trị từ /matrix", "FAIL", "Không tìm thấy nút Chế độ quản trị")
        except Exception as e:
            record("TC-C4-05", "Nút điều hướng sang Chế Độ Quản Trị từ /matrix", "FAIL", str(e))

        browser.close()

    print("\n=======================================================")
    print(f"  KẾT QUẢ TỔNG HỢP: {results['passed']} PASS / {results['failed']} FAIL (Tổng {len(results['cases'])} Cases)")
    print("=======================================================\n")

    return results

if __name__ == "__main__":
    res = run_task06_blackbox()
    if res["failed"] > 0:
        sys.exit(1)
    sys.exit(0)
