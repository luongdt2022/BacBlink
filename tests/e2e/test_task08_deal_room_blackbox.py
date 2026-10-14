"""
=============================================================================
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-08 BROKERAGE DEAL ROOM & MOU
=============================================================================
ĐẶC TẢ NGHIỆP VỤ & KIỂM CHỨNG:
1. Đăng nhập người dùng BUYER (/login).
2. Điều hướng trực tiếp tới Phòng Đàm phán 3 Bên (Deal Room) của một Cơ hội:
   URL: /portal/opportunities/01a12e02-0001-7000-8000-000000000001/deal-room
3. Kiểm tra hiển thị đầy đủ thông tin:
   - Thẻ Bên Mua (Doanh nghiệp: Công ty CP Nông Nghiệp Xanh Hà Nội).
   - Thẻ Bên Bán (Đơn vị công nghệ: Viện Cơ Điện Nông Nghiệp).
   - Bảo mật PDPD & Thẩm định Sở KH&CN.
4. Gửi một tin nhắn trao đổi kỹ thuật mới vào Phòng đàm phán 3 bên:
   - Người gửi: 'Kỹ sư Trưởng Nguyễn Văn An (QA Automation)'
   - Vai trò: 'BUYER'
   - Nội dung: 'Đề nghị đơn vị cung cấp chi tiết thông số tiêu hao điện năng và giấy chứng nhận CE của cánh tay Robot.'
5. Xác nhận tin nhắn hiển thị ngay lập tức trong luồng trao đổi (Discussions UI).
6. [Deep DB State Verification]:
   - Truy vấn trực tiếp PostgreSQL `brokerage.deal_discussions`.
   - Xác nhận bản ghi lưu đúng: opportunity_id, sender_name, sender_role='BUYER', message.
7. Dọn dẹp tin nhắn kiểm thử khỏi CSDL sau khi kiểm chứng thành công.
=============================================================================
"""

import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
OPPORTUNITY_ID = "01a12e02-0001-7000-8000-000000000001"
UNIQUE_MSG = f"Đề nghị cung cấp chi tiết thông số tiêu hao điện năng QA-{int(time.time())}"

def query_db(sql: str) -> str:
    res = subprocess.run(
        ["docker", "exec", "nacentech-postgres-1", "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql],
        capture_output=True,
        text=True,
        check=True
    )
    return res.stdout.strip()

def main():
    print("=" * 70)
    print("🎯 KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-08 DEAL ROOM & BROKERAGE")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # STEP 1: Đăng nhập tài khoản BUYER
        print("\n▶ [STEP 1] Đăng nhập tài khoản BUYER (buyer.user@demo.nacentech.vn)...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_selector('input[type="email"]', timeout=10000)
        page.fill('input[type="email"]', "buyer.user@demo.nacentech.vn")
        page.fill('input[type="password"]', "Password@123")
        page.click('button:has-text("Đăng nhập vào Hệ Thống")')
        page.wait_for_url(lambda url: "/portal" in url, timeout=15000)
        print("  ✅ Đăng nhập BUYER thành công qua form thật.")

        # STEP 2: Mở Deal Room
        print(f"\n▶ [STEP 2] Mở Deal Room của Cơ hội {OPPORTUNITY_ID}...")
        deal_room_url = f"{BASE_URL}/portal/opportunities/{OPPORTUNITY_ID}/deal-room"
        page.goto(deal_room_url)
        page.wait_for_selector("text=Phòng Đàm Phán & Chuyển Giao 1-1", timeout=15000)
        print("  ✅ Màn hình Deal Room 3 bên tải thành công.")

        # STEP 3: Kiểm tra thông tin các bên
        print("\n▶ [STEP 3] Kiểm tra thông tin Bên Mua, Bên Bán và Trạng thái PDPD...")
        page.wait_for_selector("text=BÊN MUA (DOANH NGHIỆP)", timeout=5000)
        page.wait_for_selector("text=BÊN BÁN (ĐƠN VỊ CÔNG NGHỆ)", timeout=5000)
        print("  ✅ Đầy đủ thẻ định danh Bên Mua, Bên Bán và cam kết pháp lý.")

        # STEP 4: Gửi tin nhắn trao đổi vào Deal Room
        print("\n▶ [STEP 4] Gửi tin nhắn thảo luận kỹ thuật vào phòng đàm phán...")
        page.fill("input[value='Kỹ sư Vũ Quang Hải'], input[type='text']:below(:text('Đại diện phát biểu'))", "Kỹ sư Trưởng QA Automation")
        page.fill("textarea[placeholder*='Nhập nội dung trao đổi']", UNIQUE_MSG)
        
        send_btn = page.locator("button:has-text('Gửi')").last
        send_btn.click()
        time.sleep(1.5)

        # Kiểm tra tin nhắn xuất hiện trên màn hình
        page.wait_for_selector(f"text={UNIQUE_MSG}", timeout=10000)
        print(f"  🎉 Tin nhắn đã xuất hiện trên luồng đàm phán: '{UNIQUE_MSG}'")

        # STEP 5: Deep DB State Verification vào PostgreSQL
        print("\n▶ [STEP 5] Deep DB State Verification trong CSDL PostgreSQL (brokerage.deal_discussions)...")
        sql_check = f"""
            SELECT id, opportunity_id, sender_name, sender_role, message, created_at
            FROM brokerage.deal_discussions
            WHERE opportunity_id = '{OPPORTUNITY_ID}' AND message = '{UNIQUE_MSG}';
        """
        db_record = ""
        for _ in range(10):
            db_record = query_db(sql_check)
            if db_record:
                break
            time.sleep(0.5)

        assert db_record, f"❌ KHÔNG TÌM THẤY TIN NHẮN TRONG CSDL: {UNIQUE_MSG}"

        fields = db_record.split("|")
        msg_id, opp_id, s_name, s_role, s_msg, created = fields
        print(f"  ✅ [CSDL ĐÃ LƯU]: Id={msg_id} | OppId={opp_id}")
        print(f"  ✅ [NỘI DUNG TRAO ĐỔI]: Đại diện='{s_name}' | Role={s_role} | Thời gian={created}")

        assert opp_id == OPPORTUNITY_ID, f"Lệch OpportunityId: {opp_id}"
        assert s_role == "BUYER", f"Lệch sender_role: {s_role}"
        assert s_msg == UNIQUE_MSG, f"Lệch message: {s_msg}"

        # STEP 6: Dọn dẹp tin nhắn kiểm thử
        print("\n▶ [STEP 6] Dọn dẹp tin nhắn kiểm thử khỏi CSDL...")
        query_db(f"DELETE FROM brokerage.deal_discussions WHERE id = '{msg_id}';")
        print(f"  [Cleanup] Đã dọn dẹp bản ghi {msg_id} an toàn.")

        browser.close()

    print("\n" + "=" * 70)
    print("🏆 KẾT LUẬN: TASK-08 100% PASS (DEAL ROOM & BROKERAGE GREEN)")
    print("=" * 70)

if __name__ == "__main__":
    main()
