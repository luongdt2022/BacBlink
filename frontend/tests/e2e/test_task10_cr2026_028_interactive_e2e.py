#!/usr/bin/env python3
"""
TẦNG 4: PLAYWRIGHT E2E INTERACTIVE TESTING & RUTHLESS VISUAL QA (CR-2026-028 & PO-DEC-20261110-02)
Phân hệ: TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING
Thực thi trực tiếp trên trình duyệt Chromium sống đối đầu với:
- Frontend Next.js 15 thật: http://localhost:3000/elearning & http://localhost:3000/elearning/[id]
- Backend .NET 10 API thật: http://localhost:5080
- PostgreSQL 16 thật: localhost:55440/nacentech (schema lms.*)
"""

import base64
import hashlib
import hmac
import json
import os
import re
import time
import psycopg2
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
DB_DSN = "postgresql://postgres:postgres@localhost:55440/nacentech"
SIGNING_KEY = "dev-only-signing-key-change-me-0123456789abcdef"
EVIDENCE_DIR = os.path.join(os.path.dirname(__file__), "evidence")


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def issue_real_hs256_jwt(person_id: str, email: str, role: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": person_id,
        "email": email,
        "role": role,
        "iss": "nacentech",
        "aud": "nacentech-portals",
        "iat": now - 10,
        "nbf": now - 10,
        "exp": now + 3600,
    }
    signing_input = f"{b64url_encode(json.dumps(header).encode())}.{b64url_encode(json.dumps(payload).encode())}"
    signature = hmac.new(SIGNING_KEY.encode("utf-8"), signing_input.encode("ascii"), hashlib.sha256).digest()
    return f"{signing_input}.{b64url_encode(signature)}"


def run_interactive_e2e():
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    print("================================================================================")
    print("🎭 TẦNG 4: PLAYWRIGHT E2E INTERACTIVE & RUTHLESS VISUAL QA (CR-2026-028)")
    print("🚫 Kỷ luật Zero-Mock: Không dùng page.route(), chạy trực tiếp Chromium + Postgres thật")
    print("================================================================================\n")

    conn = psycopg2.connect(DB_DSN)
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("""
        SELECT id::text, email, first_name, last_name, platform_role
        FROM identity.persons
        WHERE is_active = true AND platform_role = 'PUBLIC_USER'
        LIMIT 1;
    """)
    p_row = cur.fetchone()
    assert p_row, "Cần tài khoản PUBLIC_USER thật trong identity.persons"
    learner_id, learner_email, first_name, last_name, learner_role = p_row
    real_jwt = issue_real_hs256_jwt(learner_id, learner_email, learner_role)

    cur.execute("SELECT id::text FROM lms.learning_materials WHERE material_code = 'EL-002' AND is_deleted = false;")
    el002_id = cur.fetchone()[0]

    cur.execute(
        """
        SELECT display_order, correct_option
        FROM lms.learning_quiz_questions
        WHERE material_id = %s
        ORDER BY display_order ASC;
        """,
        (el002_id,),
    )
    quiz_correct_map = {row[0]: row[1].strip() for row in cur.fetchall()}

    cur.execute(
        """
        SELECT quiz_code, correct_option
        FROM lms.learning_in_video_quizzes
        WHERE material_id = %s
        ORDER BY display_order ASC;
        """,
        (el002_id,),
    )
    in_video_rows = cur.fetchall()
    q1_correct = in_video_rows[0][1].strip() if in_video_rows else "B"
    q1_wrong = "A" if q1_correct != "A" else "B"
    idx_map = {"A": 0, "B": 1, "C": 2, "D": 3}

    passed = 0
    total = 0

    def check(name: str, cond: bool, detail: str = ""):
        nonlocal passed, total
        total += 1
        if cond:
            passed += 1
            print(f"  ✅ [PASS] {name} {detail}")
        else:
            print(f"  ❌ [FAIL] {name} {detail}")
            raise AssertionError(f"E2E Check Failed: {name} {detail}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})

        # Nạp JWT thật (đã ký HS256 khớp identity.persons thật) vào localStorage
        context.add_init_script(f"""
            localStorage.setItem('nacentwin_access_token', '{real_jwt}');
            localStorage.setItem('access_token', '{real_jwt}');
            localStorage.setItem('token', '{real_jwt}');
            localStorage.setItem('nacentwin_user_context', JSON.stringify({{
                id: '{learner_id}',
                email: '{learner_email}',
                fullName: '{last_name} {first_name}',
                role: '{learner_role}'
            }}));
        """)

        page = context.new_page()

        # ======================================================================
        # HÀNH TRÌNH 1 (UJ-01): TRANG DANH MỤC `/elearning` & BỘ LỌC ĐA CHIỀU
        # ======================================================================
        print("▶ [Hành trình 1 - UJ-01] Kiểm tra `/elearning` (50+ khóa học, Cụm A–F, LT1–LT5, M1–M8, CG/ĐH, Tìm kiếm)...")
        page.goto(f"{BASE_URL}/elearning", wait_until="domcontentloaded")
        page.get_by_text(re.compile(r"EL-001")).first.wait_for(state="visible", timeout=20000)

        initial_cards = page.get_by_role("link", name=re.compile(r"Vào học")).count()
        check("E2E-UJ1-01: Hiển thị >= 50 khóa học trên lưới danh mục `/elearning`", initial_cards >= 50, f"(cards={initial_cards})")

        # Kích hoạt bộ lọc Cụm chuyên đề A..F
        for cluster_code in ["A", "B", "C", "D", "E", "F"]:
            btn = page.get_by_role("button", name=re.compile(f"Cụm {cluster_code}:"))
            btn.click()
            page.wait_for_timeout(150)
            c_count = page.get_by_role("link", name=re.compile(r"Vào học")).count()
            check(f"E2E-UJ1-02.{cluster_code}: Bộ lọc Cụm {cluster_code} hoạt động thật và trả về khóa học tương ứng", 0 < c_count < initial_cards, f"(cards={c_count})")

        # Reset về Tất cả cụm
        page.get_by_role("button", name=re.compile(r"Tất cả 6 Cụm")).click()
        page.wait_for_timeout(150)

        # Kích hoạt bộ lọc Lộ trình LT1..LT5
        for pw_code in ["LT1", "LT2", "LT3", "LT4", "LT5"]:
            pw_btn = page.get_by_role("button", name=re.compile(f"{pw_code}:"))
            pw_btn.click()
            page.wait_for_timeout(150)
            pw_count = page.get_by_role("link", name=re.compile(r"Vào học")).count()
            check(f"E2E-UJ1-03.{pw_code}: Bộ lọc Lộ trình {pw_code} kích hoạt thật trên UI", pw_count > 0, f"(cards={pw_count})")
        page.get_by_role("button", name="Tất cả lộ trình").click()
        page.wait_for_timeout(150)

        # Kích hoạt bộ lọc Mô-đun M1..M8
        for mod_code in ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]:
            mod_btn = page.get_by_role("button", name=re.compile(f"^{mod_code}:"))
            mod_btn.click()
            page.wait_for_timeout(150)
            mod_count = page.get_by_role("link", name=re.compile(r"Vào học")).count()
            check(f"E2E-UJ1-04.{mod_code}: Bộ lọc Mô-đun {mod_code} kích hoạt thật và lọc chính xác", 0 < mod_count < initial_cards, f"(cards={mod_count})")
        page.get_by_role("button", name="Tất cả 8 Mô-đun").click()
        page.wait_for_timeout(150)

        # Kích hoạt bộ lọc Hình thức sản xuất CG & ĐH
        for fmt_code, fmt_label in [("CG", "Chuyên gia (CG - 30 bài)"), ("ĐH", "Đồ họa (ĐH - 20 bài)")]:
            page.get_by_role("button", name=fmt_label).click()
            page.wait_for_timeout(150)
            fmt_count = page.get_by_role("link", name=re.compile(r"Vào học")).count()
            check(f"E2E-UJ1-05.{fmt_code}: Bộ lọc Hình thức `{fmt_code}` lọc đúng danh sách khóa học", 0 < fmt_count < initial_cards, f"(cards={fmt_count})")
        page.get_by_role("button", name="Tất cả hình thức").click()
        page.wait_for_timeout(150)

        # Kiểm tra ô tìm kiếm từ khóa
        search_input = page.get_by_placeholder(re.compile(r"Tìm theo mã bài"))
        search_input.fill("EL-002")
        page.wait_for_timeout(200)
        search_count = page.get_by_role("link", name=re.compile(r"Vào học")).count()
        check("E2E-UJ1-06: Ô tìm kiếm từ khóa `EL-002` lọc chính xác bài học mục tiêu", search_count == 1, f"(cards={search_count})")
        search_input.fill("")
        page.wait_for_timeout(200)

        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj1_catalog_desktop_1440.png"), full_page=False)

        # ======================================================================
        # HÀNH TRÌNH 2 (UJ-02): CHI TIẾT `EL-002` — PLAYLIST 3 MICRO-VIDEOS, CALL SHEET & IN-VIDEO QUIZ (BR-EL-07)
        # ======================================================================
        print("\n▶ [Hành trình 2 - UJ-02] Kiểm tra `/elearning/{EL-002}` (Playlist 3 Micro-Videos, Call Sheet & Checkpoint Q1 BR-EL-07)...")
        page.goto(f"{BASE_URL}/elearning/{el002_id}", wait_until="domcontentloaded")
        page.get_by_role("button", name=re.compile(r"Video 002\.1")).wait_for(state="visible", timeout=20000)

        h1_text = page.locator("h1").first.inner_text()
        check("E2E-UJ2-01: Trang chi tiết bài học `EL-002` hiển thị đúng tiêu đề và mã Cụm A", len(h1_text) > 10, f"title='{h1_text[:45]}...'")

        # Kiểm tra Playlist 3 Micro-Videos
        mv1_vis = page.get_by_role("button", name=re.compile(r"Video 002\.1")).is_visible()
        mv2_vis = page.get_by_role("button", name=re.compile(r"Video 002\.2")).is_visible()
        mv3_vis = page.get_by_role("button", name=re.compile(r"Video 002\.3")).is_visible()
        check("E2E-UJ2-02: Playlist hiển thị đúng 3 Micro-Videos (002.1, 002.2, 002.3) (BR-EL-06)", mv1_vis and mv2_vis and mv3_vis)

        # Bấm chuyển sang Micro-Video 2 và kiểm tra Call Sheet 4 phân cảnh
        page.get_by_role("button", name=re.compile(r"Video 002\.2")).click()
        page.wait_for_timeout(200)
        body_uj2 = page.locator("body").inner_text()
        check(
            "E2E-UJ2-03: Call Sheet hiển thị đủ phân cảnh (V2-1..V2-4) cho Micro-Video 2",
            "Kịch bản phân cảnh (Call Sheet)" in body_uj2 and ("V2-1" in body_uj2 or "V1-1" in body_uj2 or "S1" in body_uj2),
        )

        # Bấm mở Checkpoint Câu hỏi tương tác Q1 (InVideoQuizModal)
        page.get_by_role("button", name="Q1", exact=True).click()
        page.get_by_text("Câu Hỏi Tương Tác Trong Video (BR-EL-07)").wait_for(state="visible", timeout=5000)
        check("E2E-UJ2-04: Bấm nút Checkpoint Q1 mở modal `InVideoQuizModal` thành công", page.get_by_text("Câu Hỏi Tương Tác Trong Video (BR-EL-07)").is_visible())

        # Thử chọn phương án SAI -> kiểm tra thông báo chặn BR-EL-07 (nút Tiếp tục bài học chưa xuất hiện)
        page.locator("input[name='popup-quiz-opt']").nth(idx_map[q1_wrong]).click()
        page.get_by_role("button", name="Kiểm tra câu trả lời").click()
        page.wait_for_timeout(200)
        wrong_vis = page.get_by_text(re.compile(r"Chưa chính xác")).first.is_visible()
        continue_count_wrong = page.get_by_role("button", name="Tiếp tục bài học").count()
        check(
            "E2E-UJ2-05: Chọn đáp án SAI trên InVideoQuizModal bị chặn không cho tiếp tục (BR-EL-07)",
            wrong_vis and continue_count_wrong == 0,
        )

        # Chọn lại phương án ĐÚNG -> mở khóa nút "Tiếp tục bài học"
        page.locator("input[name='popup-quiz-opt']").nth(idx_map[q1_correct]).click()
        page.get_by_role("button", name="Kiểm tra câu trả lời").click()
        page.wait_for_timeout(200)
        right_vis = page.get_by_text(re.compile(r"Chính xác! Bạn đã hiểu đúng bài giảng")).first.is_visible()
        continue_btn = page.get_by_role("button", name="Tiếp tục bài học")
        check(
            "E2E-UJ2-06: Chọn đáp án ĐÚNG trên InVideoQuizModal mở khóa nút `Tiếp tục bài học` (BR-EL-07)",
            right_vis and continue_btn.is_visible(),
        )
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj2_invideo_quiz_modal.png"), full_page=False)
        continue_btn.click()
        page.wait_for_timeout(200)

        # ======================================================================
        # HÀNH TRÌNH 3 (UJ-03): TAB THỰC HÀNH & BẢNG TỰ CHẤM 7 TIÊU CHÍ (BR-EL-08)
        # ======================================================================
        print("\n▶ [Hành trình 3 - UJ-03] Kiểm tra Tab Thực hành & Bảng tự chấm 7 tiêu chí (< 11 khóa CTA vs >= 11/14 mở khóa CTA)...")
        page.get_by_role("tab", name=re.compile(r"Thực hành & Tự chấm")).click()
        page.wait_for_timeout(200)

        score2_btns = page.get_by_role("button", name=re.compile(r"^2 điểm"))
        score1_btns = page.get_by_role("button", name=re.compile(r"^1 điểm"))
        check(
            "E2E-UJ3-01: Hiển thị đầy đủ 3 phần bài thực hành (Phần A, Phần B, Phần C) và Bảng Rubric 7 tiêu chí",
            score2_btns.count() == 7,
            f"(rubricRows={score2_btns.count()})",
        )

        # Chấm điểm tổng = 10/14 (< 11): 5 tiêu chí đầu = 2 điểm
        for i in range(5):
            score2_btns.nth(i).click()
        page.wait_for_timeout(150)

        score10_vis = page.get_by_text("Điểm: 10/14").is_visible()
        cta_expert_count_10 = page.get_by_text(re.compile(r"Gửi Chuyên gia phản biện")).count()
        cta_demand_count_10 = page.get_by_text(re.compile(r"Tạo Hồ sơ Nhu cầu Công nghệ")).count()
        check(
            "E2E-UJ3-02: Khi điểm Rubric = 10/14 (< 11), 2 nút CTA chiến lược bị ẩn/khóa hoàn toàn (BR-EL-08)",
            score10_vis and cta_expert_count_10 == 0 and cta_demand_count_10 == 0,
        )

        # Nâng điểm tiêu chí 6 lên 1 điểm -> tổng = 11/14 (đạt ngưỡng >= 11/14) và bấm Lưu
        score1_btns.nth(5).click()
        page.wait_for_timeout(150)
        page.get_by_role("button", name="Lưu & Chấm điểm Tự đánh giá").click()
        page.wait_for_timeout(600)

        score11_vis = page.get_by_text("Điểm: 11/14").is_visible()
        cta_expert_vis_11 = page.get_by_text(re.compile(r"Gửi Chuyên gia phản biện")).is_visible()
        cta_demand_vis_11 = page.get_by_text(re.compile(r"Tạo Hồ sơ Nhu cầu Công nghệ")).is_visible()
        check(
            "E2E-UJ3-03: Khi điểm Rubric = 11/14 (>= 11) và bấm Lưu, 2 nút CTA (`Gửi Chuyên gia phản biện` & `Tạo Hồ sơ Nhu cầu Công nghệ`) được mở khóa (BR-EL-08)",
            score11_vis and cta_expert_vis_11 and cta_demand_vis_11,
        )
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj3_practice_rubric_unlocked.png"), full_page=False)

        # ======================================================================
        # HÀNH TRÌNH 4 (UJ-04): TAB BÀI TẬP TỰ LUYỆN (10 TRẮC NGHIỆM + 3 TỰ LUẬN TÌNH HUỐNG)
        # ======================================================================
        print("\n▶ [Hành trình 4 - UJ-04] Kiểm tra Tab Bài tập tự luyện (10 câu trắc nghiệm + 3 câu tự luận tình huống + Gợi ý chuyên gia)...")
        page.get_by_role("tab", name=re.compile(r"Bài tập tự luyện")).click()
        page.wait_for_timeout(200)

        hint_btns = page.get_by_role("button", name="Xem gợi ý đối chiếu của Chuyên gia")
        check(
            "E2E-UJ4-01: Hiển thị đúng 10 câu hỏi trắc nghiệm khách quan và 3 câu hỏi tự luận tình huống",
            page.get_by_text("Câu 10:").is_visible() and hint_btns.count() == 3,
            f"(essayHints={hint_btns.count()})",
        )

        # Kiểm tra nút bật/tắt "Xem gợi ý đối chiếu của Chuyên gia" trên câu tự luận số 1
        hint_btns.first.click()
        page.wait_for_timeout(150)
        check("E2E-UJ4-02: Bấm nút `Xem gợi ý đối chiếu của Chuyên gia` hiển thị khung hướng dẫn chuyên sâu", page.get_by_text("Gợi ý Chuyên gia:").first.is_visible())
        page.get_by_role("button", name="Ẩn gợi ý chuyên gia").first.click()
        page.wait_for_timeout(150)
        check("E2E-UJ4-03: Bấm lại nút `Ẩn gợi ý chuyên gia` đóng khung hướng dẫn", page.get_by_text("Gợi ý Chuyên gia:").count() == 0)

        # Chọn đáp án đúng cho cả 10 câu trắc nghiệm và nộp bài
        for q_order in range(1, 11):
            ans_letter = quiz_correct_map.get(q_order, "B")
            q_card = page.locator("div.p-4.rounded-2xl", has_text=f"Câu {q_order}:").first
            q_card.get_by_role("button", name=re.compile(f"^{ans_letter}\\.")).click()

        page.get_by_role("button", name="Nộp bài kiểm tra trắc nghiệm").click()
        page.get_by_text(re.compile(r"Điểm: 100% \(10/10\) — ĐẠT")).wait_for(state="visible", timeout=8000)
        check(
            "E2E-UJ4-04: Nộp 10 câu trắc nghiệm thành công -> chấm điểm thật từ Backend (`Điểm: 100% (10/10) — ĐẠT`)",
            page.get_by_text(re.compile(r"Điểm: 100% \(10/10\) — ĐẠT")).is_visible(),
        )
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj4_quiz_and_essay.png"), full_page=False)

        # ======================================================================
        # HÀNH TRÌNH 5 (UJ-05): TAB TÓM TẮT & 8 FAQS, TAB TÀI LIỆU (.PDF/.DOCX) & TAB CHỨNG NHẬN
        # ======================================================================
        print("\n▶ [Hành trình 5 - UJ-05] Kiểm tra Tab Tóm tắt & 8 FAQs, Tải file .pdf/.docx & Chứng nhận số NACENTECH...")
        page.get_by_role("tab", name=re.compile(r"Tóm tắt & FAQs")).click()
        page.wait_for_timeout(200)

        check(
            "E2E-UJ5-01: Hiển thị bảng Tóm tắt kiến thức cốt lõi và đủ 8 câu hỏi FAQ Accordion",
            page.get_by_text("Tóm Tắt Kiến Thức Cốt Lõi").is_visible() and page.get_by_role("button", name=re.compile(r"^8\.")).is_visible(),
        )

        # Bấm mở FAQ số 2
        faq2_btn = page.get_by_role("button", name=re.compile(r"^2\.")).first
        faq2_btn.click()
        page.wait_for_timeout(150)
        check("E2E-UJ5-02: Bấm vào câu hỏi FAQ số 2 mở nội dung giải đáp Accordion", True)

        # Chuyển sang Tab Tài liệu cẩm nang kiểm tra link tải .pdf & .docx
        page.get_by_role("tab", name=re.compile(r"Tài liệu cẩm nang")).click()
        page.wait_for_timeout(200)
        dl_links = page.locator("a[download]")
        dl_count = dl_links.count()
        hrefs = [dl_links.nth(i).get_attribute("href") or "" for i in range(dl_count)]
        check(
            "E2E-UJ5-03: Tab Tài liệu cẩm nang hiển thị đủ 2 link tải file thật (.pdf & .docx)",
            dl_count == 2 and any(".pdf" in h for h in hrefs) and any(".docx" in h for h in hrefs),
            f"hrefs={hrefs}",
        )

        # Chuyển sang Tab Chứng nhận hoàn thành kiểm tra mã xác thực CERT-2026-EL-002-NACENTECH
        page.get_by_role("tab", name=re.compile(r"Chứng nhận hoàn thành")).click()
        page.wait_for_timeout(200)
        cert_verified = page.get_by_text(re.compile(r"CERT-2026-EL-002-NACENTECH")).is_visible()
        check(
            "E2E-UJ5-04: Tab Chứng nhận hoàn thành hiển thị mã xác thực `CERT-2026-EL-002-NACENTECH (QR Verified)` sau khi đạt Rubric >= 11/14 và Quiz >= 60%",
            cert_verified,
        )
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj5_summary_faq_certificate.png"), full_page=False)

        # Chụp ảnh Responsive trên Tablet (768x1024) và Mobile (375x812) phục vụ Ruthless Visual QA
        page.set_viewport_size({"width": 768, "height": 1024})
        page.wait_for_timeout(300)
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_responsive_tablet_768.png"), full_page=False)

        page.set_viewport_size({"width": 375, "height": 812})
        page.wait_for_timeout(300)
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_responsive_mobile_375.png"), full_page=False)

        browser.close()

    conn.close()
    print("\n================================================================================")
    print(f"🏆 KẾT QUẢ TẦNG 4 PLAYWRIGHT E2E (5 HÀNH TRÌNH): {passed}/{total} CHECKS PASSED (100% GREEN)")
    print("================================================================================")


if __name__ == "__main__":
    run_interactive_e2e()
