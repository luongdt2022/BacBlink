#!/usr/bin/env python3
"""
=============================================================================
RUN_ALL_BLACKBOX_TESTS.PY — RUNNER KIỂM THỬ TỰ ĐỘNG 10 MODULES (NACENTWIN)
=============================================================================
Quy chuẩn vận hành:
- Kỷ luật Black-box thuần túy: Không mock API, không can thiệp bộ nhớ.
- Deep DB State Verification: Kiểm chứng trực tiếp CSDL PostgreSQL thật.
- Báo cáo chi tiết trạng thái, thời gian chạy và tỷ lệ đạt chuẩn Quality Gate.
=============================================================================
"""

import os
import sys
import time
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../frontend"))
E2E_DIR = os.path.join(FRONTEND_DIR, "tests/e2e")

SUITE = [
    ("TASK-00", "test_task00_auth_and_navigation_blackbox.py", "Platform Foundation, PDPD & 4-Role Navigation"),
    ("TASK-01", "test_task01_portal_and_techmart_blackbox.py", "Trang Chủ Portal & Triển Lãm Techmart Showcase"),
    ("TASK-02", "test_task02_enterprises_blackbox.py", "Hồ Sơ 304 Doanh Nghiệp ĐMST & Tra Cứu MST"),
    ("TASK-03", "test_task03_buyer_deep_survey_blackbox.py", "Khảo Sát Nhu Cầu DNNVV Chuyên Sâu (7 Phần Wizard)"),
    ("TASK-04", "test_task04_seller_tech_offer_blackbox.py", "Chào Bán Công Nghệ & Bộ Tứ SHTT (IP Quad)"),
    ("TASK-05", "test_task05_expert_profile_and_completeness_blackbox.py", "Hồ Sơ Chuyên Gia KH&CN & Profile Completeness"),
    ("TASK-06", "test_task06_master_data_tt17_blackbox.py", "Master Data TT17 & Danh Mục Phân Loại VSIC"),
    ("TASK-07", "test_task07_admin_governance_orgtree_blackbox.py", "Admin Quản Trị Phân Cấp & Cây Thư Mục 34 Tỉnh"),
    ("TASK-08", "test_task08_deal_room_blackbox.py", "Phòng Đàm Phán 3 Bên (Secure Deal Room & MOU)"),
    ("TASK-09", "test_task09_tt17_assessment_blackbox.py", "Tự Đánh Giá Trình Độ & Năng Lực Công Nghệ TT17"),
]

def main():
    print("=" * 80)
    print("🚀 BẮT ĐẦU CHẠY TOÀN BỘ RE-VERIFICATION SUITE CHO TẤT CẢ CÁC MODULES (NACENTWIN)")
    print("=" * 80)
    print(f"Tổng số modules đăng ký: {len(SUITE)}")
    print(f"Thư mục chứa kịch bản: {E2E_DIR}\n")

    results = []
    overall_start = time.time()

    for task_id, filename, desc in SUITE:
        file_path = os.path.join(E2E_DIR, filename)
        if not os.path.exists(file_path):
            print(f"❌ [MISSING] {task_id}: Không tìm thấy tệp {filename}")
            results.append((task_id, filename, desc, "MISSING", 0, "File not found"))
            continue

        print(f"▶ Đang chạy {task_id}: {desc} ({filename})...")
        start = time.time()
        proc = subprocess.run([sys.executable, file_path], capture_output=True, text=True)
        dur = round(time.time() - start, 2)

        if proc.returncode == 0:
            print(f"  ✅ [PASS] {task_id:<8} ({dur}s)")
            results.append((task_id, filename, desc, "PASS", dur, ""))
        else:
            print(f"  ❌ [FAIL] {task_id:<8} ({dur}s)")
            err_msg = (proc.stderr or proc.stdout).strip()
            print(f"     Chi tiết lỗi: {err_msg[-400:]}\n")
            results.append((task_id, filename, desc, "FAIL", dur, err_msg))

    total_duration = round(time.time() - overall_start, 2)
    passed_count = sum(1 for r in results if r[3] == "PASS")
    total_count = len(results)
    pass_rate = (passed_count / total_count * 100) if total_count > 0 else 0

    print("\n" + "=" * 80)
    print("📊 BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ ĐẦU CUỐI (QUALITY GATE 4 SIGN-OFF)")
    print("=" * 80)
    for task_id, filename, desc, status, dur, _ in results:
        icon = "✅ PASS" if status == "PASS" else "❌ FAIL"
        print(f" {icon} | {task_id:<8} | {dur:>6}s | {desc}")

    print("-" * 80)
    print(f"TỔNG KẾT: {passed_count}/{total_count} Modules Đạt Chuẩn ({pass_rate:.1f}%) | Tổng thời gian: {total_duration}s")
    print("=" * 80)

    if passed_count < total_count:
        sys.exit(1)
    else:
        print("\n🎉 QUALITY GATE 4 VERIFIED: 100% CÁC MODULES HOẠT ĐỘNG THÔNG SUỐT TỪ UI ĐẾN CSDL!")
        sys.exit(0)

if __name__ == "__main__":
    main()
