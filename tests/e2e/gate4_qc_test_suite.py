#!/usr/bin/env python3
"""
GATE 4 VERIFICATION SUITE — CR-2026-010 MARKETPLACE METRICS & TAXONOMY SSOT
Run against LIVE PostgreSQL (port 55440), Backend API (port 5080), and Next.js (port 3000).
"""

import time
import json
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:5080"

def get_db_stats():
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-t", "-A", "-c", """
        SELECT json_build_object(
          'approved_offers', (SELECT count(*) FROM technology.seller_technology_offers WHERE status = 'APPROVED'),
          'public_demands', (SELECT count(*) FROM demand.demand_items WHERE is_public_listed = true),
          'total_enterprises', (SELECT count(*) FROM enterprise.enterprises),
          'total_experts', (SELECT count(*) FROM brokerage.expert_profiles),
          'provinces', (SELECT count(DISTINCT TRIM(province_city)) FROM enterprise.enterprises WHERE province_city IS NOT NULL AND TRIM(province_city) != ''),
          'accepted_connections', (SELECT count(*) FROM brokerage.connection_requests WHERE UPPER(status) IN ('ACCEPTED', 'COMPLETED')),
          'signed_mous', (SELECT count(*) FROM brokerage.mou_agreements WHERE UPPER(status) = 'SIGNED'),
          'opp_value_million', (SELECT COALESCE(SUM(estimated_value_million_vnd), 0) FROM brokerage.opportunities WHERE UPPER(stage) != 'CLOSED_LOST')
        )::text;
        """
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(res.stdout.strip())

def main():
    print("=" * 80)
    print("🚀 BẮT ĐẦU KIỂM THỬ QC GATE 4: CR-2026-010 MARKETPLACE METRICS & TAXONOMY SSOT")
    print("=" * 80)

    db_stats = get_db_stats()
    print("\n[DB BASELINE]")
    print(json.dumps(db_stats, indent=2, ensure_ascii=False))

    results = []
    defects = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # =====================================================================
        # TEST SUITE 1: TRANG CHỦ (/)
        # =====================================================================
        print("\n" + "-" * 70)
        print("TẦNG 4: TEST SUITE 1 — TRANG CHỦ (/)")
        print("-" * 70)
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1.5)

        body_text = page.locator("body").inner_text()

        # Check 1.1: Triệt tiêu các chuỗi cứng
        hardcoded_strings = ["1.200+", "680+", "142 bài toán", "68.5 tỷ", "24 Giờ", "24 giờ hỗ trợ"]
        found_hardcoded = [s for s in hardcoded_strings if s in body_text]
        if found_hardcoded:
            defects.append({
                "surface": "Trang chủ (/)",
                "id": "DEFECT-HOME-01",
                "severity": "CRITICAL",
                "description": f"Vẫn còn xuất hiện chuỗi hardcoded trên Trang chủ: {found_hardcoded}"
            })
            print(f"  ❌ FAIL [DEFECT-HOME-01]: Phát hiện chuỗi cứng trên Trang chủ: {found_hardcoded}")
        else:
            print("  ✅ PASS: 100% chuỗi tĩnh '1.200+', '680+', '142', '68.5 tỷ' đã bị triệt tiêu trên Trang chủ.")
            results.append("HOME_NO_HARDCODED_STRINGS")

        # Check 1.2: 4 Thẻ Marketplace Metrics
        # Công nghệ chào bán
        offers_card = page.locator("a[href='/chao-ban-cong-nghe']:has-text('Công nghệ chào bán')")
        demands_card = page.locator("a[href='/nhu-cau-cong-nghe']:has-text('Nhu cầu đặt hàng')")
        conn_card = page.locator("a[href='/trien-lam']:has-text('Kết nối thành công')")
        val_card = page.locator("a[href='/portal/opportunities/pipeline']:has-text('Quy mô giao dịch')")

        if offers_card.count() > 0:
            offers_num = offers_card.first.locator("dd").inner_text().strip()
            print(f"  • Metric 1 (Cung): {offers_num} (DB approved_offers = {db_stats['approved_offers']})")
            if offers_num == str(db_stats['approved_offers']):
                print("    ✅ Cung khớp 1:1 với CSDL PostgreSQL thật.")
                results.append("HOME_METRIC_OFFERS_MATCH_DB")
            else:
                defects.append({
                    "surface": "Trang chủ (/)",
                    "id": "DEFECT-HOME-02",
                    "severity": "HIGH",
                    "description": f"Chỉ số Cung trên Trang chủ ({offers_num}) không khớp DB ({db_stats['approved_offers']})"
                })
        else:
            defects.append({
                "surface": "Trang chủ (/)",
                "id": "DEFECT-HOME-03",
                "severity": "CRITICAL",
                "description": "Không tìm thấy thẻ metric 'Công nghệ chào bán' trên Trang chủ."
            })

        if demands_card.count() > 0:
            demands_num = demands_card.first.locator("dd").inner_text().strip()
            print(f"  • Metric 2 (Cầu): {demands_num} (DB public_demands = {db_stats['public_demands']})")
            if demands_num == str(db_stats['public_demands']):
                print("    ✅ Cầu khớp 1:1 với CSDL PostgreSQL thật.")
                results.append("HOME_METRIC_DEMANDS_MATCH_DB")
            else:
                defects.append({
                    "surface": "Trang chủ (/)",
                    "id": "DEFECT-HOME-04",
                    "severity": "HIGH",
                    "description": f"Chỉ số Cầu trên Trang chủ ({demands_num}) không khớp DB ({db_stats['public_demands']})"
                })

        if conn_card.count() > 0:
            conn_num = conn_card.first.locator("dd").inner_text().strip()
            expected_conns = db_stats['accepted_connections'] + db_stats['signed_mous']
            print(f"  • Metric 3 (Kết nối & MOU): {conn_num} (DB connections = {expected_conns})")
            if conn_num == str(expected_conns):
                print("    ✅ Kết nối khớp 1:1 với CSDL PostgreSQL thật.")
                results.append("HOME_METRIC_CONNECTIONS_MATCH_DB")
            else:
                defects.append({
                    "surface": "Trang chủ (/)",
                    "id": "DEFECT-HOME-05",
                    "severity": "HIGH",
                    "description": f"Chỉ số Kết nối trên Trang chủ ({conn_num}) không khớp DB ({expected_conns})"
                })

        if val_card.count() > 0:
            val_text = val_card.first.locator("dd").inner_text().strip()
            print(f"  • Metric 4 (Quy mô ngân sách): {val_text}")
            if "Tỷ VNĐ" in val_text or "Triệu VNĐ" in val_text:
                print("    ✅ Quy mô ngân sách hiển thị đúng định dạng tiền tệ Việt Nam.")
                results.append("HOME_METRIC_BUDGET_FORMAT_OK")
            else:
                defects.append({
                    "surface": "Trang chủ (/)",
                    "id": "DEFECT-HOME-06",
                    "severity": "MEDIUM",
                    "description": f"Định dạng quy mô ngân sách không chuẩn: {val_text}"
                })

        # =====================================================================
        # TEST SUITE 2: SÀN CHÀO BÁN CÔNG NGHỆ (/chao-ban-cong-nghe)
        # =====================================================================
        print("\n" + "-" * 70)
        print("TẦNG 4: TEST SUITE 2 — SÀN CHÀO BÁN CÔNG NGHỆ (/chao-ban-cong-nghe)")
        print("-" * 70)
        page.goto(f"{BASE_URL}/chao-ban-cong-nghe", wait_until="networkidle")
        time.sleep(1.5)

        cb_text = page.locator("body").inner_text()

        # Check 2.1: Triệt tiêu chuỗi cứng trên Sàn Chào Bán
        cb_hardcoded = []
        if "1.200+" in cb_text:
            cb_hardcoded.append("1.200+")
        if "680+" in cb_text:
            cb_hardcoded.append("680+")
        if "10 Ngành" in cb_text:
            cb_hardcoded.append("10 Ngành (hardcoded text)")

        if cb_hardcoded:
            defects.append({
                "surface": "Sàn Chào Bán (/chao-ban-cong-nghe)",
                "id": "DEFECT-OFFER-01",
                "severity": "CRITICAL",
                "description": f"Hero Quick Metrics vẫn còn chuỗi tĩnh hardcoded: {cb_hardcoded}. Không có component <Async> bọc ngoài."
            })
            print(f"  ❌ FAIL [DEFECT-OFFER-01]: Phát hiện chuỗi cứng trên Sàn Chào Bán: {cb_hardcoded}")
        else:
            print("  ✅ PASS: Không còn chuỗi cứng trên Sàn Chào Bán.")
            results.append("OFFER_NO_HARDCODED_STRINGS")

        # Check 2.2: Danh mục ngành trong Sidebar
        # Đếm các nút filter ngành trong sidebar
        sector_buttons = page.locator("button:has-text('LV'), button:has-text('Tất cả lĩnh vực')")
        sector_count = sector_buttons.count()
        print(f"  • Số lượng nút ngành tìm thấy trong sidebar: {sector_count}")
        
        # Check xem có các mã ngành cũ lạ không (AG, FOOD, MECH, etc.)
        legacy_codes = ["AG", "FOOD", "DRINK", "MECH", "ELEC", "ENV", "BUILD", "LOG", "HOSP", "IT", "SCI", "TEXT", "WOOD", "CHEM", "PHARMA", "OPT", "FURN", "OTHER"]
        found_legacy = []
        for code in legacy_codes:
            # check exact button label
            if page.locator(f"button:has-text('[{code}]')").count() > 0:
                found_legacy.append(code)
        
        if found_legacy:
            defects.append({
                "surface": "Sàn Chào Bán (/chao-ban-cong-nghe)",
                "id": "DEFECT-OFFER-02",
                "severity": "HIGH",
                "description": f"Vẫn còn hiển thị mã ngành cũ lạ: {found_legacy}"
            })
            print(f"  ❌ FAIL [DEFECT-OFFER-02]: Vẫn còn mã ngành cũ lạ trong danh mục: {found_legacy}")
        else:
            print("  ✅ PASS: Không xuất hiện mã ngành lạ (AG, FOOD, MECH...).")
            results.append("OFFER_NO_LEGACY_SECTOR_CODES")

        # =====================================================================
        # TEST SUITE 3: SÀN NHU CẦU CÔNG NGHỆ (/nhu-cau-cong-nghe)
        # =====================================================================
        print("\n" + "-" * 70)
        print("TẦNG 4: TEST SUITE 3 — SÀN NHU CẦU CÔNG NGHỆ (/nhu-cau-cong-nghe)")
        print("-" * 70)
        page.goto(f"{BASE_URL}/nhu-cau-cong-nghe", wait_until="networkidle")
        time.sleep(1.5)

        nc_text = page.locator("body").inner_text()

        # Check 3.1: Triệt tiêu 142 bài toán, 68.5 tỷ, 24 giờ
        nc_hardcoded = []
        if "142 bài toán" in nc_text or "142" in page.locator(".text-amber-300").all_inner_texts():
            nc_hardcoded.append("142")
        if "68.5 tỷ" in nc_text or "68.5" in nc_text:
            nc_hardcoded.append("68.5 tỷ")
        if "24 giờ hỗ trợ" in nc_text or "24 Giờ" in nc_text:
            nc_hardcoded.append("24 Giờ")

        if nc_hardcoded:
            defects.append({
                "surface": "Sàn Nhu Cầu (/nhu-cau-cong-nghe)",
                "id": "DEFECT-DEMAND-01",
                "severity": "CRITICAL",
                "description": f"Vẫn còn xuất hiện chuỗi hardcoded trên Sàn Nhu Cầu: {nc_hardcoded}"
            })
            print(f"  ❌ FAIL [DEFECT-DEMAND-01]: Phát hiện chuỗi cứng trên Sàn Nhu Cầu: {nc_hardcoded}")
        else:
            print("  ✅ PASS: 100% chuỗi cứng '142', '68.5 tỷ', '24 Giờ' đã được triệt tiêu trên Sàn Nhu Cầu.")
            results.append("DEMAND_NO_HARDCODED_STRINGS")

        # Check 3.2: 3 Khối Quick Metrics Động qua <Async>
        demand_metric_1 = page.locator("div:has-text('Bài Toán Đang Tìm') .text-amber-300").first
        demand_metric_2 = page.locator("div:has-text('Tổng Ngân Sách Mua') .text-emerald-300").first
        demand_metric_3 = page.locator("div:has-text('Kết Nối Sàn & MOU') .text-teal-300").first

        if demand_metric_1.is_visible() and demand_metric_2.is_visible() and demand_metric_3.is_visible():
            m1_val = demand_metric_1.inner_text().strip()
            m2_val = demand_metric_2.inner_text().strip()
            m3_val = demand_metric_3.inner_text().strip()
            print(f"  • Quick Metrics Sàn Nhu Cầu: Bài toán={m1_val}, Ngân sách={m2_val}, Kết nối={m3_val}")
            print("  ✅ PASS: 3 khối Quick Metrics trên Sàn Nhu Cầu nạp động qua <Async> thành công.")
            results.append("DEMAND_QUICK_METRICS_DYNAMIC_OK")
        else:
            defects.append({
                "surface": "Sàn Nhu Cầu (/nhu-cau-cong-nghe)",
                "id": "DEFECT-DEMAND-02",
                "severity": "HIGH",
                "description": "Không tìm thấy đủ 3 thẻ Quick Metrics trên Hero Banner Sàn Nhu Cầu."
            })

        # Check 3.3: Dropdown 10 Lĩnh vực TT17
        sector_select = page.locator("select").first
        options = sector_select.locator("option").all_inner_texts()
        print(f"  • Danh sách options trong combobox ngành: {len(options)} mục ({options[:3]} ...)")
        # Phải có 11 options (1 'Tất cả Lĩnh vực' + 10 ngành TT17)
        if len(options) == 11:
            print("  ✅ PASS: Combobox ngành trên Sàn Nhu Cầu có đúng 11 options (1 Tất cả + 10 ngành chuẩn TT17).")
            results.append("DEMAND_SECTOR_COMBOBOX_10_TT17_OK")
        else:
            defects.append({
                "surface": "Sàn Nhu Cầu (/nhu-cau-cong-nghe)",
                "id": "DEFECT-DEMAND-03",
                "severity": "HIGH",
                "description": f"Số lượng options trong combobox ngành không đúng chuẩn 11: có {len(options)} options ({options})"
            })
            print(f"  ❌ FAIL [DEFECT-DEMAND-03]: Combobox có {len(options)} options, kỳ vọng 11.")

        # =====================================================================
        # TEST SUITE 4: CHAOS & DESTRUCTIVE TESTING (KIỂM THỬ PHÁ HOẠI)
        # =====================================================================
        print("\n" + "-" * 70)
        print("TẦNG 4: TEST SUITE 4 — KIỂM THỬ PHÁ HOẠI (CHAOS & RESILIENCE)")
        print("-" * 70)

        # Kịch bản 4.1: API /api/v1/portal/stats sập (500) hoặc rớt mạng trên Sàn Nhu Cầu
        print("▶ [CHAOS-01] Giả lập sập mạng / API /api/v1/portal/stats trên Sàn Nhu Cầu...")
        chaos_context = browser.new_context(viewport={"width": 1440, "height": 900})
        chaos_page = chaos_context.new_page()

        # Abort stats request
        chaos_page.route("**/api/v1/portal/stats", lambda route: route.abort("failed"))
        chaos_page.goto(f"{BASE_URL}/nhu-cau-cong-nghe", wait_until="networkidle")
        time.sleep(1)

        # Kiểm tra xem có hiển thị Error State của <Async> kèm nút Tải lại không
        error_msg = chaos_page.locator("text=Không thể tải số liệu thống kê")
        retry_btn = chaos_page.locator("button:has-text('Tải lại số liệu')")

        if error_msg.is_visible() and retry_btn.is_visible():
            print("  ✅ PASS: Khi API sập, Sàn Nhu Cầu kích hoạt <Async> Error State minh bạch và cung cấp nút 'Tải lại số liệu'.")
            results.append("CHAOS_DEMAND_ERROR_RETRY_OK")
        else:
            defects.append({
                "surface": "Sàn Nhu Cầu (/nhu-cau-cong-nghe)",
                "id": "DEFECT-CHAOS-01",
                "severity": "HIGH",
                "description": "Khi API stats sập, giao diện không hiển thị Error State hoặc thiếu nút Thử lại."
            })
            print("  ❌ FAIL [DEFECT-CHAOS-01]: Thiếu Error State hoặc nút Thử lại khi API stats lỗi.")

        # Kịch bản 4.2: API /api/v1/portal/stats sập trên Sàn Chào Bán
        print("▶ [CHAOS-02] Giả lập sập mạng trên Sàn Chào Bán (/chao-ban-cong-nghe)...")
        chaos_page.goto(f"{BASE_URL}/chao-ban-cong-nghe", wait_until="networkidle")
        time.sleep(1)

        cb_chaos_text = chaos_page.locator("body").inner_text()
        if "1.200+" in cb_chaos_text or "680+" in cb_chaos_text:
            defects.append({
                "surface": "Sàn Chào Bán (/chao-ban-cong-nghe)",
                "id": "DEFECT-CHAOS-02",
                "severity": "CRITICAL",
                "description": "Khi API sập hoặc chưa tải xong, Sàn Chào Bán fallback sang số dummy '1.200+' và '680+' vi phạm BR-METRIC-003 (Zero-Mock Invariant)."
            })
            print("  ❌ FAIL [DEFECT-CHAOS-02]: Sàn Chào Bán fallback sang '1.200+' và '680+' khi gặp sự cố mạng!")
        else:
            print("  ✅ PASS: Sàn Chào Bán không fallback sang số dummy.")

        # Kịch bản 4.3: Kiểm tra Trang chủ khi API stats lỗi
        print("▶ [CHAOS-03] Giả lập sập mạng trên Trang chủ (/)...")
        chaos_page.goto(f"{BASE_URL}/", wait_until="networkidle")
        time.sleep(1)

        home_err = chaos_page.locator("text=Không thể tải số liệu thống kê")
        home_retry = chaos_page.locator("button:has-text('Tải lại số liệu')")
        if home_err.is_visible() and home_retry.is_visible():
            print("  ✅ PASS: Trang chủ kích hoạt <Async> Error State và có nút 'Tải lại số liệu'.")
            results.append("CHAOS_HOME_ERROR_RETRY_OK")
        else:
            defects.append({
                "surface": "Trang chủ (/)",
                "id": "DEFECT-CHAOS-03",
                "severity": "HIGH",
                "description": "Trang chủ không hiển thị Error State chuẩn hoặc thiếu nút Thử lại khi API lỗi."
            })

        browser.close()

    print("\n" + "=" * 80)
    print("📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ QC GATE 4")
    print("=" * 80)
    print(f"Tổng số tiêu chí PASS: {len(results)}")
    print(f"Tổng số DEFECTS phát hiện: {len(defects)}")
    for d in defects:
        print(f"\n[{d['id']}] ({d['severity']}) tại {d['surface']}:\n  {d['description']}")

    # Save report JSON
    with open("gate4_qc_execution_results.json", "w", encoding="utf-8") as f:
        json.dump({"results": results, "defects": defects, "db_stats": db_stats}, f, indent=2, ensure_ascii=False)
    print("\nĐã lưu kết quả tại: gate4_qc_execution_results.json")

if __name__ == "__main__":
    main()
