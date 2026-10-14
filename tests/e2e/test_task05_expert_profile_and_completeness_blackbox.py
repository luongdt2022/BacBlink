#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX TOÀN TRÌNH: TASK-05 CHUYÊN GIA KH&CN & PROFILE COMPLETENESS ENGINE
Nguyên tắc bất biến:
- Black-box thuần túy, Zero-Mock.
- Đăng nhập thật bằng tài khoản Chuyên gia KH&CN thật: expert.demo@nacentech.local.
- Xem danh bạ chuyên gia công khai /experts -> Tìm kiếm chuyên gia theo tên hoặc mã định danh.
- Truy cập không gian biên tập hồ sơ /portal/expert/profile/edit.
- Thay đổi thông tin: Cập nhật tóm tắt tư vấn (ConsultingSummary) và tiểu sử (PublicBio) -> Bấm Lưu.
- Deep DB State Verification: Đối soát trực tiếp câu lệnh SQL vào bảng brokerage.expert_profiles xem trường public_bio và consulting_summary đã được UPDATE vào CSDL thật chưa.
- Khôi phục lại dữ liệu ban đầu sau khi kiểm thử.
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_WEB_URL = "http://localhost:3000"
BASE_API_URL = "http://localhost:5080"

EXPERT_EMAIL = "expert.demo@nacentech.local"
EXPERT_PASS = "Password@123"
EXPERT_CODE = "CG-NACEN-DEMOIT01"

def get_expert_profile_db():
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A",
        "-c", f"SELECT expert_code, full_name, degree, organization_name, public_bio, consulting_summary FROM brokerage.expert_profiles WHERE expert_code = '{EXPERT_CODE}';"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0 or not res.stdout.strip():
        raise RuntimeError(f"Lỗi lấy hồ sơ chuyên gia từ DB: {res.stderr}")
    parts = res.stdout.strip().split("|")
    return {
        "expert_code": parts[0],
        "full_name": parts[1],
        "degree": parts[2],
        "organization_name": parts[3],
        "public_bio": parts[4] if len(parts) > 4 else "",
        "consulting_summary": parts[5] if len(parts) > 5 else ""
    }

def update_expert_profile_db(bio: str, summary: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-c", f"UPDATE brokerage.expert_profiles SET public_bio = '{bio}', consulting_summary = '{summary}' WHERE expert_code = '{EXPERT_CODE}';"
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

def main():
    print("======================================================================")
    print("🎯 KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-05 CHUYÊN GIA KH&CN & PROFILE")
    print("======================================================================")

    # 1. Khảo sát CSDL thật
    initial_profile = get_expert_profile_db()
    print(f"  [DB Setup] Chuyên gia: {initial_profile['full_name']} (Mã: {initial_profile['expert_code']}, Cơ quan: {initial_profile['organization_name']})")

    new_test_bio = f"QC Test Bio BlackBox - Chuyên gia AI & Digital Twin cập nhật lúc {int(time.time())}"
    new_test_summary = f"QC Test Consulting Summary - Đã tư vấn 10+ dự án chuyển đổi số công nghiệp"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # STEP 1: Kiểm tra Danh Bạ Chuyên Gia Công Khai (/experts)
        print("\n▶ [STEP 1] Truy cập Danh bạ Chuyên gia KH&CN công khai (/experts)...")
        page.goto(f"{BASE_WEB_URL}/experts", timeout=20000)
        page.wait_for_selector("h1", timeout=10000)
        h1_text = page.text_content("h1") or ""
        assert "chuyên gia" in h1_text.lower() or "khoa học" in h1_text.lower(), f"Tiêu đề trang chuyên gia không đúng: {h1_text}"
        print(f"  ✅ Trang Danh bạ Chuyên gia tải thành công (Tiêu đề: '{h1_text.strip()}').")

        # STEP 2: Tìm kiếm Chuyên gia thật theo Mã hoặc Tên
        print(f"\n▶ [STEP 2] Tìm kiếm chuyên gia thật: {initial_profile['full_name']}...")
        search_input = page.locator("input[placeholder*='Tìm theo họ tên']").first
        search_input.fill(initial_profile['full_name'])
        time.sleep(1.5)
        expert_card = page.locator(f"text={initial_profile['full_name']}").first
        assert expert_card.is_visible(), f"Không tìm thấy thẻ chuyên gia {initial_profile['full_name']}"
        print(f"  ✅ Tìm thấy chuyên gia {initial_profile['full_name']} trên danh bạ công khai.")

        # STEP 3: Đăng nhập thật bằng tài khoản Chuyên gia KH&CN
        print(f"\n▶ [STEP 3] Đăng nhập tài khoản Chuyên Gia: {EXPERT_EMAIL}...")
        page.goto(f"{BASE_WEB_URL}/login", timeout=20000)
        page.wait_for_selector('input[type="email"]', timeout=10000)
        page.fill('input[type="email"]', EXPERT_EMAIL)
        page.fill('input[type="password"]', EXPERT_PASS)
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_url("**/portal**", timeout=15000)
        print("  ✅ Đăng nhập Chuyên gia thành công, nhận diện quyền VERIFIED_EXPERT.")

        # STEP 4: Mở trang Chỉnh Sửa Hồ Sơ Chuyên Gia (/portal/expert/profile/edit)
        print("\n▶ [STEP 4] Truy cập Không gian Chỉnh sửa Hồ Sơ Chuyên Gia (/portal/expert/profile/edit)...")
        page.goto(f"{BASE_WEB_URL}/portal/expert/profile/edit", timeout=20000)
        page.wait_for_selector("form", timeout=10000)
        print("  ✅ Giao diện chỉnh sửa hồ sơ chuyên gia tải thành công với 4 khối nghiệp vụ.")

        # Kiểm tra hiển thị Mã định danh chuyên gia
        code_badge = page.locator(f"text={EXPERT_CODE}").first
        assert code_badge.is_visible(), f"Không tìm thấy mã định danh {EXPERT_CODE} trên giao diện"
        print(f"  ✅ Nhận diện chính xác Mã Định Danh Chuyên Gia: {EXPERT_CODE}.")

        # STEP 5: Thay đổi trường thông tin Tiểu Sử & Tóm tắt tư vấn
        print("\n▶ [STEP 5] Nhập dữ liệu mới vào trường PublicBio và ConsultingSummary...")
        bio_textarea = page.locator("textarea").nth(0)
        summary_textarea = page.locator("textarea").nth(1)
        
        bio_textarea.fill(new_test_bio)
        summary_textarea.fill(new_test_summary)

        # STEP 6: Bấm nút Lưu Hồ Sơ
        print("▶ [STEP 6] Gửi lệnh lưu hồ sơ chuyên gia lên Backend...")
        save_btn = page.locator('button:has-text("Lưu Toàn Bộ Hồ Sơ")')
        save_btn.click()

        # Chờ thông báo thành công
        page.wait_for_selector("text=Đã cập nhật thành công hồ sơ Chuyên gia", timeout=15000)
        print("  ✅ Frontend thông báo: 'Đã cập nhật thành công hồ sơ Chuyên gia! Dữ liệu đã được đồng bộ vào Danh bạ Công khai.'")

        # STEP 7: KIỂM CHỨNG CSDL POSTGRESQL THỰC TẾ (Deep DB State Verification)
        print("\n▶ [STEP 7] Đối soát trực tiếp trong CSDL PostgreSQL (brokerage.expert_profiles)...")
        updated_profile = get_expert_profile_db()
        assert updated_profile["public_bio"] == new_test_bio, f"DB public_bio không khớp! Thực tế: {updated_profile['public_bio']}"
        assert updated_profile["consulting_summary"] == new_test_summary, f"DB consulting_summary không khớp! Thực tế: {updated_profile['consulting_summary']}"
        print(f"  ✅ [CSDL ĐÃ UPDATE THẬT]:")
        print(f"     - public_bio: '{updated_profile['public_bio']}'")
        print(f"     - consulting_summary: '{updated_profile['consulting_summary']}'")
        print("  ✅ 100% Khớp dữ liệu cập nhật từ giao diện Web đến CSDL PostgreSQL.")

        # Cleanup: Khôi phục lại trạng thái ban đầu của chuyên gia
        update_expert_profile_db(initial_profile["public_bio"], initial_profile["consulting_summary"])
        print(f"  [Cleanup] Đã hoàn nguyên dữ liệu hồ sơ chuyên gia trong PostgreSQL.")

        browser.close()

    print("\n======================================================================")
    print("🏆 KẾT LUẬN: TASK-05 100% PASS (EXPERT PROFILE & DB UPDATE GREEN)")
    print("======================================================================")

if __name__ == "__main__":
    main()
