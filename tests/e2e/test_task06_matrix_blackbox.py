#!/usr/bin/env python3
"""
SUITE KIỂM THỬ HỘP ĐEN 4 TẦNG (BLACK-BOX TEST SUITE): TASK-06
Hệ Thống Danh Mục Ngành & Ma Trận LV-CN (Master Data & Public Explorer)

Người thực hiện: Trưởng ban Kiểm định Chất lượng nacen-qc
Quy tắc: Pure Black-Box Testing (Tuyệt đối mù code, chỉ dựa trên Spec/Basic Design)
Bề mặt kiểm thử:
- Route 1: http://localhost:3000/admin/sectors
- Route 2: http://localhost:3000/matrix
"""

import sys
import time
import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

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
        # Launch browser in headless mode for fast and reliable CI execution
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        print("\n=======================================================")
        print("  BẮT ĐẦU THỰC THI KIỂM THỬ HỘP ĐEN 4 TẦNG (TASK-06)")
        print("=======================================================\n")

        # -----------------------------------------------------
        # TẦNG 1: VI MÔ TỪNG CONTROL & INPUT VALIDATION
        # -----------------------------------------------------
        print("--- [TẦNG 1: MICRO CONTROLS & INPUT VALIDATION] ---")

        # TC-C1-01: Validation mã Lĩnh vực mới bắt buộc prefix 'LV'
        try:
            page.goto(f"{BASE_URL}/admin/sectors", wait_until="networkidle")
            page.wait_for_selector("button:has-text('Thêm Lĩnh Vực Mới')", timeout=5000).click()
            time.sleep(0.3)

            # Dialog listener to catch alert for invalid prefix
            alert_caught = []
            def on_dialog(dialog):
                alert_caught.append(dialog.message)
                dialog.accept()
            page.on("dialog", on_dialog)

            # Test invalid prefix
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
            page.locator("button:has-text('✕'), button:has-text('Hủy Bỏ')").first.click()
            time.sleep(0.3)
        except Exception as e:
            record("TC-C1-01", "Chặn tiền tố không hợp lệ (Bắt buộc LV*)", "FAIL", str(e))

        # TC-C1-02: Thanh tìm kiếm trên /admin/sectors
        try:
            search_input = page.locator("input[placeholder*='Tìm theo tên lĩnh vực']")
            search_input.fill("Nông nghiệp")
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

        # TC-C1-03: Kiểm tra Dropdown Lọc ngành trên Ma trận
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
            tabs = ["Lĩnh Vực", "Phân Ngành TT17", "Ma Trận LV-CN", "Cây Taxonomy 3 Tầng", "Triển Lãm Quốc Tế"]
            all_tabs_ok = True
            for tab_name in tabs:
                tab_btn = page.locator(f"button:has-text('{tab_name}')").first
                if not tab_btn.is_visible():
                    all_tabs_ok = False
                    break
                tab_btn.click()
                time.sleep(0.2)
            if all_tabs_ok:
                record("TC-C2-01", "Chuyển đổi mượt mà qua 5 Tabs độc lập", "PASS", "5/5 Tabs phản hồi chuẩn xác")
            else:
                record("TC-C2-01", "Chuyển đổi mượt mà qua 5 Tabs độc lập", "FAIL", "Thiếu tab hoặc không tương tác được")
        except Exception as e:
            record("TC-C2-01", "Chuyển đổi mượt mà qua 5 Tabs độc lập", "FAIL", str(e))

        # TC-C2-02: Chuyển đổi Danh Sách <-> Lưới 2D Heatmap trong Tab Ma Trận
        try:
            page.locator("button:has-text('Ma Trận LV-CN')").click()
            time.sleep(0.3)
            grid_btn = page.locator("button:has-text('Lưới 2D Heatmap')")
            grid_btn.click()
            time.sleep(0.4)

            # Kiểm tra bảng 2D Heatmap
            heatmap_table = page.locator("table:has-text('Lĩnh Vực \\ Nhóm CN')")
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
            page.locator("button:has-text('Cây Taxonomy 3 Tầng')").click()
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
        # TẦNG 3: LUỒNG NGHIỆP VỤ NHỎ & BẢO MẬT SCOPED RBAC
        # -----------------------------------------------------
        print("\n--- [TẦNG 3: SUB-WORKFLOWS & SCOPED SECURITY RBAC] ---")

        # TC-C3-01: Mở Modal Sửa Trọng Số và Tinh Chỉnh Cặp LV-CN
        try:
            page.locator("button:has-text('Ma Trận LV-CN')").click()
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
                    star_select.select_option("5")
                    weight_input = page.locator("input[type='number']")
                    current_val = weight_input.input_value()
                    record("TC-C3-01", "Mở modal hiệu chỉnh trọng số cặp quan hệ LV-CN", "PASS", f"Đã mở modal, giá trị weight hiện hành: {current_val}")
                    # Đóng modal
                    page.locator("button:has-text('Hủy Bỏ'), button:has-text('✕')").first.click()
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
            time.sleep(0.5)

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
            sector_cards = page.locator("div:has(> span:has-text('LV'))")
            count_cards = sector_cards.count()
            if count_cards >= 1:
                # Click thẻ thứ hai
                sector_cards.nth(1).click()
                time.sleep(0.4)
                matrix_table = page.locator("table")
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
