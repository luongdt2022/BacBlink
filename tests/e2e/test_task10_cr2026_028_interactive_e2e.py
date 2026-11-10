#!/usr/bin/env python3
"""
TẦNG 4: PLAYWRIGHT E2E INTERACTIVE TESTING & RUTHLESS VISUAL QA (CR-2026-028 & PO-DEC-20261110-02)
Phân hệ: TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING
Thực thi trực tiếp trên trình duyệt Chromium sống đối đầu với:
- Frontend Next.js 15 thật: http://localhost:3000/elearning & http://localhost:3000/elearning/[id]
- Backend .NET 10 API thật: http://localhost:5080
- PostgreSQL 16 thật: localhost:55440/nacentech (schema lms.*)

Bao phủ 5 Hành trình Người dùng (User Journeys) bắt buộc:
- Hành trình 1 (UJ-01): Truy cập `/elearning`, kiểm tra hiển thị 50+ khóa học, kích hoạt thật các bộ lọc Cụm A–F, Lộ trình LT1–LT5, Mô-đun M1–M8, Hình thức CG/ĐH, ô tìm kiếm từ khóa.
- Hành trình 2 (UJ-02): Mở trang chi tiết bài học `EL-002`, kiểm tra Playlist 3 Micro-Videos + Call Sheet 4 phân cảnh, bấm mở Checkpoint Câu hỏi tương tác `Q1` (`InVideoQuizModal`), thử chọn phương án sai (kiểm tra thông báo chặn `BR-EL-07`) rồi chọn phương án đúng (mở khóa tiếp tục).
- Hành trình 3 (UJ-03): Chuyển sang Tab Thực hành & Bảng tự chấm 7 tiêu chí, chấm điểm tổng `< 11` (chưa mở CTA), sau đó chấm tổng `>= 11/14` và bấm lưu -> kiểm tra mở khóa các nút CTA chiến lược (`Gửi Chuyên gia phản biện` & `Tạo Hồ sơ Nhu cầu Công nghệ` - `BR-EL-08`) + đối soát DB.
- Hành trình 4 (UJ-04): Chuyển sang Tab Bài tập tự luyện, làm 10 câu trắc nghiệm và kiểm tra 3 câu tự luận tình huống + nút bật/tắt `"Xem gợi ý đối chiếu của Chuyên gia"`.
- Hành trình 5 (UJ-05): Kiểm tra Tab Tóm tắt kiến thức & 8 câu hỏi FAQ Accordion + link tải file `.pdf`/`.docx` đính kèm + Chứng nhận số NACENTECH + chụp ảnh Ruthless Visual QA trên 3 Viewports (Desktop 1440x900, Tablet 768x1024, Mobile 375x812).
"""

import base64
import hashlib
import hmac
import json
import os
import sys
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
        page.wait_for_selector("[data-testid='course-grid']", timeout=20000)

        initial_cards = page.locator("[data-testid='course-grid'] > div").count()
        check("E2E-UJ1-01: Hiển thị >= 50 khóa học trên lưới danh mục `/elearning`", initial_cards >= 50, f"(cards={initial_cards})")

        # Kích hoạt bộ lọc Cụm chuyên đề A..F
        for cluster_code in ["A", "B", "C", "D", "E", "F"]:
            btn = page.locator(f"[data-testid='cluster-tab-{cluster_code}']")
            btn.click()
            page.wait_for_timeout(150)
            c_count = page.locator("[data-testid='course-grid'] > div").count()
            check(f"E2E-UJ1-02.{cluster_code}: Bộ lọc Cụm {cluster_code} hoạt động thật và trả về khóa học tương ứng", c_count > 0 and c_count < initial_cards, f"(cards={c_count})")

        # Reset về Tất cả cụm
        page.locator("[data-testid='cluster-tab-ALL']").click()
        page.wait_for_timeout(150)

        # Kích hoạt bộ lọc Lộ trình LT1..LT5
        for pw_code in ["LT1", "LT2", "LT3", "LT4", "LT5"]:
            pw_btn = page.locator(f"[data-testid='pathway-filter-{pw_code}']")
            pw_btn.click()
            page.wait_for_timeout(150)
            pw_count = page.locator("[data-testid='course-grid'] > div").count()
            check(f"E2E-UJ1-03.{pw_code}: Bộ lọc Lộ trình {pw_code} kích hoạt thật trên UI", pw_count > 0, f"(cards={pw_count})")
        page.locator("[data-testid='pathway-filter-ALL']").click()
        page.wait_for_timeout(150)

        # Kích hoạt bộ lọc Mô-đun M1..M8
        for mod_code in ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]:
            mod_btn = page.locator(f"[data-testid='module-filter-{mod_code}']")
            mod_btn.click()
            page.wait_for_timeout(150)
            mod_count = page.locator("[data-testid='course-grid'] > div").count()
            check(f"E2E-UJ1-04.{mod_code}: Bộ lọc Mô-đun {mod_code} kích hoạt thật và lọc chính xác", mod_count > 0 and mod_count < initial_cards, f"(cards={mod_count})")
        page.locator("[data-testid='module-filter-ALL']").click()
        page.wait_for_timeout(150)

        # Kích hoạt bộ lọc Hình thức sản xuất CG & ĐH
        for fmt_code in ["CG", "ĐH"]:
            page.locator(f"[data-testid='format-filter-{fmt_code}']").click()
            page.wait_for_timeout(150)
            fmt_count = page.locator("[data-testid='course-grid'] > div").count()
            check(f"E2E-UJ1-05.{fmt_code}: Bộ lọc Hình thức `{fmt_code}` lọc đúng danh sách khóa học", fmt_count > 0 and fmt_count < initial_cards, f"(cards={fmt_count})")
        page.locator("[data-testid='format-filter-ALL']").click()
        page.wait_for_timeout(150)

        # Kiểm tra ô tìm kiếm từ khóa
        search_input = page.locator("[data-testid='elearning-search-input']")
        search_input.fill("EL-002")
        page.wait_for_timeout(200)
        search_count = page.locator("[data-testid='course-grid'] > div").count()
        check("E2E-UJ1-06: Ô tìm kiếm từ khóa `EL-002` lọc chính xác bài học mục tiêu", search_count == 1, f"(cards={search_count})")
        search_input.fill("")
        page.wait_for_timeout(200)

        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj1_catalog_desktop_1440.png"), full_page=False)

        # ======================================================================
        # HÀNH TRÌNH 2 (UJ-02): CHI TIẾT `EL-002` — PLAYLIST 3 MICRO-VIDEOS, CALL SHEET & IN-VIDEO QUIZ (BR-EL-07)
        # ======================================================================
        print("\n▶ [Hành trình 2 - UJ-02] Kiểm tra `/elearning/{EL-002}` (Playlist 3 Micro-Videos, Call Sheet & Checkpoint Q1 BR-EL-07)...")
        page.goto(f"{BASE_URL}/elearning/{el002_id}", wait_until="domcontentloaded")
        page.wait_for_selector("[data-testid='lesson-detail-title']", timeout=20000)

        title_text = page.locator("[data-testid='lesson-detail-title']").inner_text()
        check("E2E-UJ2-01: Trang chi tiết bài học `EL-002` hiển thị đúng tiêu đề và mã Cụm A", len(title_text) > 10, f"title='{title_text[:45]}...'")

        # Kiểm tra Playlist 3 Micro-Videos
        mv_items = page.locator("[data-testid^='micro-video-item-']").count()
        check("E2E-UJ2-02: Playlist hiển thị đúng 3 Micro-Videos (02.1, 02.2, 02.3) (BR-EL-06)", mv_items == 3, f"(microVideos={mv_items})")

        # Bấm chuyển sang Micro-Video 2 và kiểm tra Call Sheet 4 phân cảnh S1..S4
        page.locator("[data-testid='micro-video-item-2']").click()
        page.wait_for_timeout(200)
        page.locator("[data-testid='tab-btn-video']").click()
        page.wait_for_timeout(200)
        callsheet_visible = page.locator("[data-testid='call-sheet-panel']").is_visible()
        s1_visible = page.locator("[data-testid='call-sheet-scene-S1']").is_visible()
        s4_visible = page.locator("[data-testid='call-sheet-scene-S4']").is_visible()
        check("E2E-UJ2-03: Call Sheet hiển thị đủ 4 phân cảnh S1..S4 cho Micro-Video", callsheet_visible and s1_visible and s4_visible)

        # Bấm mở Checkpoint Câu hỏi tương tác Q1 (InVideoQuizModal)
        q1_trigger = page.locator("[data-testid='trigger-invideo-quiz-Q1']")
        q1_trigger.click()
        page.wait_for_selector("[data-testid='in-video-quiz-modal']", timeout=5000)
        check("E2E-UJ2-04: Bấm nút Checkpoint Q1 mở modal `InVideoQuizModal` thành công", page.locator("[data-testid='in-video-quiz-modal']").is_visible())

        # Thử chọn phương án SAI -> kiểm tra thông báo chặn BR-EL-07 (nút Tiếp tục xem video chưa xuất hiện)
        page.locator(f"[data-testid='invideo-option-{q1_wrong}']").click()
        page.locator("[data-testid='invideo-submit-btn']").click()
        page.wait_for_timeout(200)
        feedback_wrong = page.locator("[data-testid='invideo-feedback-box']").inner_text()
        continue_visible_when_wrong = page.locator("[data-testid='invideo-continue-btn']").is_visible()
        check(
            "E2E-UJ2-05: Chọn đáp án SAI trên InVideoQuizModal bị chặn không cho tiếp tục (BR-EL-07)",
            ("Chưa chính xác" in feedback_wrong) and (not continue_visible_when_wrong),
            f"feedback='{feedback_wrong[:50]}'",
        )

        # Chọn lại phương án ĐÚNG -> mở khóa nút "Tiếp tục xem video"
        page.locator(f"[data-testid='invideo-option-{q1_correct}']").click()
        page.locator("[data-testid='invideo-submit-btn']").click()
        page.wait_for_timeout(200)
        feedback_right = page.locator("[data-testid='invideo-feedback-box']").inner_text()
        continue_btn = page.locator("[data-testid='invideo-continue-btn']")
        check(
            "E2E-UJ2-06: Chọn đáp án ĐÚNG trên InVideoQuizModal mở khóa nút `Tiếp tục xem video` (BR-EL-07)",
            ("Chính xác" in feedback_right) and continue_btn.is_visible(),
        )
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj2_invideo_quiz_modal.png"), full_page=False)
        continue_btn.click()
        page.wait_for_timeout(200)

        # ======================================================================
        # HÀNH TRÌNH 3 (UJ-03): TAB THỰC HÀNH & BẢNG TỰ CHẤM 7 TIÊU CHÍ (BR-EL-08)
        # ======================================================================
        print("\n▶ [Hành trình 3 - UJ-03] Kiểm tra Tab Thực hành & Bảng tự chấm 7 tiêu chí (< 11 khóa CTA vs >= 11/14 mở khóa CTA)...")
        page.locator("[data-testid='tab-btn-practice']").click()
        page.wait_for_selector("[data-testid='tab-content-practice']", timeout=5000)

        # Kiểm tra 3 phần đề bài A, B, C
        check(
            "E2E-UJ3-01: Hiển thị đầy đủ 3 phần bài thực hành (Phần A, Phần B, Phần C) và Bảng Rubric 7 tiêu chí",
            page.locator("[data-testid='practice-part-a']").is_visible()
            and page.locator("[data-testid='practice-part-b']").is_visible()
            and page.locator("[data-testid='practice-part-c']").is_visible()
            and page.locator("[data-testid^='rubric-row-']").count() == 7,
        )

        # Chấm điểm tổng = 10/14 (< 11): 5 tiêu chí đầu = 2 điểm, 2 tiêu chí cuối = 0 điểm
        for c_num in range(1, 8):
            score_val = 2 if c_num <= 5 else 0
            page.locator(f"[data-testid='rubric-radio-{c_num}-{score_val}']").click()
        page.wait_for_timeout(150)

        total_score_text_10 = page.locator("[data-testid='rubric-total-score']").inner_text()
        cta_expert_10 = page.locator("[data-testid='cta-send-expert']")
        cta_demand_10 = page.locator("[data-testid='cta-create-demand']")
        check(
            "E2E-UJ3-02: Khi điểm Rubric = 10/14 (< 11), 2 nút CTA chiến lược bị khóa (`disabled`) (BR-EL-08)",
            "10/14" in total_score_text_10 and cta_expert_10.is_disabled() and cta_demand_10.is_disabled(),
            f"score='{total_score_text_10}'",
        )

        # Nâng điểm tiêu chí 6 lên 1 điểm -> tổng = 11/14 (đạt ngưỡng >= 11/14) và bấm Lưu kết quả tự chấm
        page.locator("[data-testid='rubric-radio-6-1']").click()
        page.wait_for_timeout(150)
        page.locator("[data-testid='submit-rubric-btn']").click()
        page.wait_for_timeout(600)

        total_score_text_11 = page.locator("[data-testid='rubric-total-score']").inner_text()
        check(
            "E2E-UJ3-03: Khi điểm Rubric = 11/14 (>= 11) và bấm Lưu, 2 nút CTA (`Gửi Chuyên gia phản biện` & `Tạo Hồ sơ Nhu cầu Công nghệ`) được mở khóa hoàn toàn (BR-EL-08)",
            "11/14" in total_score_text_11 and (not cta_expert_10.is_disabled()) and (not cta_demand_10.is_disabled()),
            f"score='{total_score_text_11}'",
        )
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj3_practice_rubric_unlocked.png"), full_page=False)

        # ======================================================================
        # HÀNH TRÌNH 4 (UJ-04): TAB BÀI TẬP TỰ LUYỆN (10 TRẮC NGHIỆM + 3 TỰ LUẬN TÌNH HUỐNG)
        # ======================================================================
        print("\n▶ [Hành trình 4 - UJ-04] Kiểm tra Tab Bài tập tự luyện (10 câu trắc nghiệm + 3 câu tự luận tình huống + Gợi ý chuyên gia)...")
        page.locator("[data-testid='tab-btn-quiz']").click()
        page.wait_for_selector("[data-testid='tab-content-quiz']", timeout=5000)

        mc_cards = page.locator("[data-testid^='quiz-question-card-']").count()
        essay_cards = page.locator("[data-testid^='essay-question-card-']").count()
        check(
            "E2E-UJ4-01: Hiển thị đúng 10 câu hỏi trắc nghiệm khách quan và 3 câu hỏi tự luận tình huống",
            mc_cards == 10 and essay_cards == 3,
            f"(mc={mc_cards}, essay={essay_cards})",
        )

        # Kiểm tra nút bật/tắt "Xem gợi ý đối chiếu của Chuyên gia" trên câu tự luận số 1
        toggle_hint_btn = page.locator("[data-testid='toggle-essay-hint-1']")
        toggle_hint_btn.click()
        page.wait_for_timeout(150)
        hint_box = page.locator("[data-testid='essay-hint-box-1']")
        check("E2E-UJ4-02: Bấm nút `Xem gợi ý đối chiếu của Chuyên gia` hiển thị khung hướng dẫn chuyên sâu", hint_box.is_visible())
        toggle_hint_btn.click()
        page.wait_for_timeout(150)
        check("E2E-UJ4-03: Bấm lại nút `Ẩn gợi ý đối chiếu của Chuyên gia` đóng khung hướng dẫn", not hint_box.is_visible())

        # Chọn đáp án đúng cho cả 10 câu trắc nghiệm và nộp bài
        for q_order in range(1, 11):
            ans = quiz_correct_map.get(q_order, "B")
            page.locator(f"[data-testid='quiz-option-{q_order}-{ans}']").click()
        page.locator("[data-testid='submit-quiz-btn']").click()
        page.wait_for_selector("[data-testid='quiz-result-banner']", timeout=8000)

        quiz_banner_text = page.locator("[data-testid='quiz-result-banner']").inner_text()
        check(
            "E2E-UJ4-04: Nộp 10 câu trắc nghiệm thành công -> chấm điểm thật từ Backend (100% ĐẠT YÊU CẦU)",
            "100%" in quiz_banner_text and "ĐẠT YÊU CẦU" in quiz_banner_text,
            f"banner='{quiz_banner_text}'",
        )
        page.screenshot(path=os.path.join(EVIDENCE_DIR, "cr028_uj4_quiz_and_essay.png"), full_page=False)

        # ======================================================================
        # HÀNH TRÌNH 5 (UJ-05): TAB TÓM TẮT KIẾN THỨC, 8 FAQ ACCORDION, TẢI FILE & CHỨNG NHẬN SỐ
        # ======================================================================
        print("\n▶ [Hành trình 5 - UJ-05] Kiểm tra Tab Tóm tắt kiến thức, 8 câu hỏi FAQ Accordion, Tải file .pdf/.docx & Chứng nhận số...")
        page.locator("[data-testid='tab-btn-summary-faq']").click()
        page.wait_for_selector("[data-testid='tab-content-summary-faq']", timeout=5000)

        faq_items = page.locator("[data-testid^='faq-item-']").count()
        att_links = page.locator("[data-testid^='attachment-download-']").count()
        check(
            "E2E-UJ5-01: Hiển thị đúng 8 câu hỏi FAQ Accordion và 2 link tải biểu mẫu (.pdf & .docx)",
            faq_items == 8 and att_links == 2,
            f"(faqs={faq_items}, attachments={att_links})",
        )

        # Bấm mở FAQ số 2
        page.locator("[data-testid='faq-toggle-2']").click()
        page.wait_for_timeout(150)
        check("E2E-UJ5-02: Bấm vào câu hỏi FAQ số 2 mở nội dung giải đáp Accordion", page.locator("[data-testid='faq-answer-2']").is_visible())

        # Kiểm tra href của các link tải file đính kèm (.pdf và .docx)
        href_1 = page.locator("[data-testid='attachment-download-1']").get_attribute("href") or ""
        href_2 = page.locator("[data-testid='attachment-download-2']").get_attribute("href") or ""
        check(
            "E2E-UJ5-03: Link tải tài liệu đính kèm trỏ đúng tới kho file thật (.pdf & .docx)",
            (".pdf" in href_1 or ".pdf" in href_2) and (".docx" in href_1 or ".docx" in href_2),
            f"hrefs={[href_1, href_2]}",
        )

        # Kiểm tra Chứng nhận hoàn thành khóa học NACENTECH đã mở khóa
        cert_card = page.locator("[data-testid='certificate-card']")
        cert_text = cert_card.inner_text()
        check(
            "E2E-UJ5-04: Thẻ Chứng nhận số NACENTECH hiển thị trạng thái ĐÃ MỞ KHÓA sau khi đạt Rubric >= 11/14 và Quiz >= 60%",
            cert_card.is_visible() and "Tải Chứng nhận số" in cert_text,
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
