#!/usr/bin/env python3
"""
TẦNG 2 (API CONTRACT, BOUNDARY HUNTING & RBAC FUZZING) & TẦNG 3 (DEEP DB STATE VERIFICATION)
Phân hệ: TASK-10_HOC_LIEU_SO_VA_DAO_TAO_ELEARNING (CR-2026-028 & PO-DEC-20261110-02)
Thực thi trực tiếp trên:
- Backend .NET 10 API thật: http://localhost:5080
- PostgreSQL 16 thật: localhost:55440/nacentech (schema lms.*)
Kỷ luật: Zero-Mock, Zero-Hardcode, Deep DB State Verification.
"""

import base64
import hashlib
import hmac
import json
import sys
import time
import urllib.error
import urllib.request
import psycopg2

API_BASE = "http://localhost:5080"
DB_DSN = "postgresql://postgres:postgres@localhost:55440/nacentech"
SIGNING_KEY = "dev-only-signing-key-change-me-0123456789abcdef"


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def issue_real_hs256_jwt(person_id: str, email: str, role: str) -> str:
    """Ký JWT thật chuẩn HS256 khớp với cấu hình Auth của NacenTech.Api và bản ghi thật trong identity.persons."""
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


def http_request(method: str, path: str, body=None, token: str = None, extra_headers: dict = None):
    url = f"{API_BASE}{path}"
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if extra_headers:
        headers.update(extra_headers)
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            ctype = resp.headers.get("Content-Type", "")
            parsed = json.loads(raw.decode("utf-8")) if "application/json" in ctype and raw else raw
            return resp.status, dict(resp.headers), parsed
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            parsed = json.loads(raw.decode("utf-8")) if raw else {}
        except Exception:
            parsed = raw
        return e.code, dict(e.headers), parsed


def run_tier2_and_tier3():
    print("================================================================================")
    print("🛡️  TẦNG 2 & TẦNG 3: API CONTRACT, BOUNDARY HUNTING, RBAC FUZZING & DEEP DB AUDIT")
    print("================================================================================\n")

    conn = psycopg2.connect(DB_DSN)
    conn.autocommit = True
    cur = conn.cursor()

    # Lấy 3 tài khoản thật đang active trong bảng identity.persons (PUBLIC_USER, VERIFIED_EXPERT, ADMIN)
    cur.execute("""
        SELECT id::text, email, platform_role
        FROM identity.persons
        WHERE is_active = true AND platform_role = 'PUBLIC_USER'
        LIMIT 1;
    """)
    learner_row = cur.fetchone()
    assert learner_row, "Phải có ít nhất 1 tài khoản PUBLIC_USER thật trong identity.persons"
    learner_id, learner_email, learner_role = learner_row
    learner_jwt = issue_real_hs256_jwt(learner_id, learner_email, learner_role)

    cur.execute("""
        SELECT id::text, email, platform_role
        FROM identity.persons
        WHERE is_active = true AND platform_role = 'VERIFIED_EXPERT'
        LIMIT 1;
    """)
    expert_row = cur.fetchone()
    assert expert_row, "Phải có ít nhất 1 tài khoản VERIFIED_EXPERT thật trong identity.persons"
    expert_id, expert_email, expert_role = expert_row
    expert_jwt = issue_real_hs256_jwt(expert_id, expert_email, expert_role)

    passed = 0
    total = 0

    def check(name: str, condition: bool, detail: str = ""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  ✅ [PASS] {name} {detail}")
        else:
            print(f"  ❌ [FAIL] {name} {detail}")
            raise AssertionError(f"Test failed: {name} {detail}")

    # -------------------------------------------------------------------------
    # PHẦN 1: KIỂM ĐỊNH HỢP ĐỒNG API (ec-contract) TRÊN 50 KHÓA HỌC EL-001..EL-050
    # -------------------------------------------------------------------------
    print("▶ [1] Kiểm định Hợp đồng API (ec-contract) `/api/v1/lms/catalog` & `/api/v1/lms/catalog/{id}`...")
    status, _, catalog_res = http_request("GET", "/api/v1/lms/catalog?page=1&pageSize=100")
    check("CT-01: GET /api/v1/lms/catalog trả về 200 OK & success=true", status == 200 and catalog_res.get("success") is True)

    items = catalog_res.get("data", [])
    el_items = [x for x in items if str(x.get("materialCode", "")).startswith("EL-")]
    el_codes = sorted(x["materialCode"] for x in el_items)
    expected_codes = [f"EL-{i:03d}" for i in range(1, 51)]
    check(
        "CT-02: Đủ 100% 50 khóa học chuẩn hóa EL-001..EL-050 trên API Catalog",
        el_codes == expected_codes,
        f"(found={len(el_codes)}/50)",
    )

    clusters_found = sorted({x.get("clusterCode") for x in el_items if x.get("clusterCode")})
    check(
        "CT-03: Phủ kín 6 Cụm chuyên đề A, B, C, D, E, F (BR-EL-09)",
        clusters_found == ["A", "B", "C", "D", "E", "F"],
        f"clusters={clusters_found}",
    )

    modules_found = set()
    pathways_found = set()
    templates_found = set()
    formats_found = set()
    for x in el_items:
        rm_raw = x.get("learningRoadmapJson")
        assert rm_raw, f"Khóa {x['materialCode']} thiếu learningRoadmapJson trong DTO"
        rm = json.loads(rm_raw) if isinstance(rm_raw, str) else rm_raw
        if rm.get("moduleCode"):
            modules_found.add(rm["moduleCode"])
        for pw in rm.get("pathways", []):
            pathways_found.add(pw)
        for tc in rm.get("templateCodes", []):
            templates_found.add(tc)
        if rm.get("videoFormat"):
            formats_found.add(rm["videoFormat"])

    check(
        "CT-04: Phủ kín 8 Mô-đun đào tạo M1..M8 (REQ-EL-002)",
        sorted(modules_found) == [f"M{i}" for i in range(1, 9)],
        f"modules={sorted(modules_found)}",
    )
    check(
        "CT-05: Phủ kín 5 Lộ trình học theo vai trò LT1..LT5 (REQ-EL-002)",
        sorted(pathways_found) == [f"LT{i}" for i in range(1, 6)],
        f"pathways={sorted(pathways_found)}",
    )
    expected_bm = {f"BM{i:02d}" for i in range(1, 14)}
    expected_tdg = {f"TĐG{i:02d}" for i in range(1, 6)}
    check(
        "CT-06: Phủ kín 13 Biểu mẫu chuẩn (BM01..BM13) và 5 Công cụ tự đánh giá (TĐG01..TĐG05) (REQ-EL-009)",
        expected_bm.issubset(templates_found) and expected_tdg.issubset(templates_found),
        f"templates={sorted(templates_found)}",
    )
    check(
        "CT-07: Phủ đủ 2 hình thức sản xuất CG (Chuyên gia) & ĐH (Đồ họa)",
        formats_found == {"CG", "ĐH"},
        f"formats={sorted(formats_found)}",
    )

    # Kiểm tra chi tiết bài học EL-002 (Cụm A - Bước 2)
    el002 = next(x for x in el_items if x["materialCode"] == "EL-002")
    el002_id = el002["id"]
    status, _, detail_res = http_request("GET", f"/api/v1/lms/catalog/{el002_id}")
    check("CT-08: GET /api/v1/lms/catalog/{id} cho EL-002 trả về 200 OK", status == 200 and detail_res.get("success") is True)
    d = detail_res["data"]
    check(
        "CT-09: EL-002 có đúng 3 Micro-Videos (02.1, 02.2, 02.3) kèm Call Sheet 4 phân cảnh S1..S4 (BR-EL-06)",
        len(d.get("microVideos", [])) == 3 and all(v.get("callSheetJson") for v in d["microVideos"]),
        f"videos={len(d.get('microVideos', []))}",
    )
    check(
        "CT-10: EL-002 có In-Video Quizzes kèm CorrectOption & Explanation cho Formative Checkpoint (BR-EL-07)",
        len(d.get("inVideoQuizzes", [])) >= 2 and all(q.get("correctOption") in ("A", "B", "C", "D") for q in d["inVideoQuizzes"]),
        f"inVideoQuizzes={len(d.get('inVideoQuizzes', []))}",
    )
    check(
        "CT-11: EL-002 có đúng 7 tiêu chí Bảng tự chấm Rubric (0-1-2 điểm, tổng 14 điểm) (BR-EL-08)",
        len(d.get("practiceRubrics", [])) == 7,
        f"rubrics={len(d.get('practiceRubrics', []))}",
    )
    check(
        "CT-12: EL-002 có 10 câu trắc nghiệm cuối bài (đã che đáp án ' ' chống gian lận) + 3 câu tự luận tình huống",
        len(d.get("quizQuestions", [])) == 10 and all(q.get("correctOption") == " " for q in d["quizQuestions"]),
        f"quizQuestions={len(d.get('quizQuestions', []))}",
    )
    check(
        "CT-13: EL-002 có đúng 8 câu hỏi FAQ Accordion và 2 tệp đính kèm (.pdf & .docx)",
        len(d.get("faqs", [])) == 8 and len(d.get("attachments", [])) == 2,
        f"faqs={len(d.get('faqs', []))}, attachments={len(d.get('attachments', []))}",
    )

    # -------------------------------------------------------------------------
    # PHẦN 2: SĂN LỖI BIÊN (ec-hunt) — RUBRIC 10/14 vs 11/14, ĐIỂM ÂM, >14 & QUIZ 5/10 vs 6/10
    # -------------------------------------------------------------------------
    print("\n▶ [2] Săn Lỗi Biên (ec-hunt) trên API thật: Rubric (10/14 vs 11/14, âm, >14) & Quiz (5/10 vs 6/10)...")

    # 2.1 Rubric = 10/14 (sát ngưỡng dưới -> IsUnlockedCta = false)
    scores_10 = {"1": 2, "2": 2, "3": 2, "4": 2, "5": 2, "6": 0, "7": 0}
    st_10, _, res_10 = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/practice-evaluations",
        body={"rubricScores": scores_10, "practiceSubmissionText": "Bài thực hành biên dưới 10/14"},
        token=learner_jwt,
    )
    d_10 = res_10.get("data", {})
    check(
        "BH-01: Rubric biên dưới 10/14 -> 200 OK, totalScore=10, isUnlockedCta=False, unlockedExpertReviewCta=False (BR-EL-08)",
        st_10 == 200
        and d_10.get("totalScore") == 10
        and d_10.get("maxScore") == 14
        and d_10.get("isUnlockedCta") is False
        and d_10.get("unlockedExpertReviewCta") is False
        and d_10.get("unlockedDemandCreateCta") is False,
        f"resp={d_10}",
    )

    # 2.2 Rubric = 11/14 (đúng ngưỡng -> IsUnlockedCta = true)
    scores_11 = {"1": 2, "2": 2, "3": 2, "4": 2, "5": 2, "6": 1, "7": 0}
    st_11, _, res_11 = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/practice-evaluations",
        body={"rubricScores": scores_11, "practiceSubmissionText": "Bài thực hành đúng ngưỡng 11/14"},
        token=learner_jwt,
    )
    d_11 = res_11.get("data", {})
    check(
        "BH-02: Rubric biên chuẩn 11/14 -> 200 OK, totalScore=11, isUnlockedCta=True, mở khóa 2 CTA chiến lược (BR-EL-08)",
        st_11 == 200
        and d_11.get("totalScore") == 11
        and d_11.get("maxScore") == 14
        and d_11.get("isUnlockedCta") is True
        and d_11.get("unlockedExpertReviewCta") is True
        and d_11.get("unlockedDemandCreateCta") is True,
        f"resp={d_11}",
    )

    # 2.3 Rubric điểm âm (-1) -> bắt buộc chặn 400 Bad Request
    scores_neg = {"1": -1, "2": 2, "3": 2, "4": 2, "5": 2, "6": 2, "7": 2}
    st_neg, _, res_neg = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/practice-evaluations",
        body={"rubricScores": scores_neg},
        token=learner_jwt,
    )
    check("BH-03: Rubric điểm âm (-1) bị chặn 400 Bad Request", st_neg == 400, f"status={st_neg}")

    # 2.4 Rubric điểm vượt ngưỡng (>2 trên 1 tiêu chí / tổng > 14) -> bắt buộc chặn 400 Bad Request
    scores_over = {"1": 3, "2": 2, "3": 2, "4": 2, "5": 2, "6": 2, "7": 2}
    st_over, _, res_over = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/practice-evaluations",
        body={"rubricScores": scores_over},
        token=learner_jwt,
    )
    check("BH-04: Rubric điểm vượt trần (>2 / tổng 15>14) bị chặn 400 Bad Request", st_over == 400, f"status={st_over}")

    # 2.5 Rubric tiêu chí ngoài phạm vi 1..7 (tiêu chí số 8) -> bắt buộc chặn 400 Bad Request
    scores_invalid_key = {"1": 2, "8": 2}
    st_key, _, _ = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/practice-evaluations",
        body={"rubricScores": scores_invalid_key},
        token=learner_jwt,
    )
    check("BH-05: Rubric chứa tiêu chí số 8 (ngoài 1..7) bị chặn 400 Bad Request", st_key == 400, f"status={st_key}")

    # 2.6 Quiz cuối bài biên: 5/10 (50% < 60% -> passed=False) vs 6/10 (60% >= 60% -> passed=True)
    cur.execute(
        """
        SELECT id::text, display_order, correct_option
        FROM lms.learning_quiz_questions
        WHERE material_id = %s
        ORDER BY display_order ASC;
        """,
        (el002_id,),
    )
    q_rows = cur.fetchall()
    assert len(q_rows) == 10, f"EL-002 phải có 10 câu hỏi trắc nghiệm, thực tế={len(q_rows)}"

    def wrong_opt(correct: str) -> str:
        return "B" if correct.strip().upper() == "A" else "A"

    # Tạo bộ trả lời đúng 5/10 câu (50%)
    answers_5_of_10 = {}
    for idx, (qid, _, corr) in enumerate(q_rows):
        answers_5_of_10[qid] = corr.strip() if idx < 5 else wrong_opt(corr)

    st_q5, _, res_q5 = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/quiz-attempts",
        body={"answers": answers_5_of_10},
        token=learner_jwt,
    )
    dq5 = res_q5.get("data", {})
    check(
        "BH-06: Quiz biên dưới 5/10 (50% < 60%) -> 200 OK, scorePercent=50, passed=False, correctAnswers=5",
        st_q5 == 200 and dq5.get("scorePercent") == 50 and dq5.get("passed") is False and dq5.get("correctAnswers") == 5,
        f"resp={dq5}",
    )

    # Tạo bộ trả lời đúng 6/10 câu (60% == ngưỡng đạt 60%)
    answers_6_of_10 = {}
    for idx, (qid, _, corr) in enumerate(q_rows):
        answers_6_of_10[qid] = corr.strip() if idx < 6 else wrong_opt(corr)

    st_q6, _, res_q6 = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/quiz-attempts",
        body={"answers": answers_6_of_10},
        token=learner_jwt,
    )
    dq6 = res_q6.get("data", {})
    check(
        "BH-07: Quiz biên chuẩn 6/10 (60% >= 60%) -> 200 OK, scorePercent=60, passed=True, correctAnswers=6",
        st_q6 == 200
        and dq6.get("scorePercent") == 60
        and dq6.get("passed") is True
        and dq6.get("correctAnswers") == 6
        and dq6.get("totalQuestions") == 10,
        f"resp={dq6}",
    )

    # -------------------------------------------------------------------------
    # PHẦN 3: KIỂM TRA TẢI FILE .PDF/.DOCX THẬT & STREAM VIDEO HTTP 206 PARTIAL CONTENT
    # -------------------------------------------------------------------------
    print("\n▶ [3] Kiểm tra tải file đính kèm thực tế (.pdf & .docx) và phát video mẫu HTTP 206 Partial Content...")
    st_pdf, hdr_pdf, body_pdf = http_request("GET", "/files/lms/docs/tom-tat-kien-thuc-el-002.pdf")
    check(
        "FS-01: Tải file PDF thật `/files/lms/docs/tom-tat-kien-thuc-el-002.pdf` -> 200 OK, magic bytes %PDF",
        st_pdf == 200 and isinstance(body_pdf, bytes) and body_pdf.startswith(b"%PDF") and len(body_pdf) > 500,
        f"size={len(body_pdf) if isinstance(body_pdf, bytes) else 0} bytes",
    )

    st_docx, hdr_docx, body_docx = http_request("GET", "/files/lms/docs/phieu-thuc-hanh-el-002.docx")
    check(
        "FS-02: Tải file DOCX thật `/files/lms/docs/phieu-thuc-hanh-el-002.docx` -> 200 OK, magic bytes PK (ZIP/OOXML)",
        st_docx == 200 and isinstance(body_docx, bytes) and body_docx.startswith(b"PK") and len(body_docx) > 500,
        f"size={len(body_docx) if isinstance(body_docx, bytes) else 0} bytes",
    )

    st_vid, hdr_vid, body_vid = http_request(
        "GET",
        "/files/lms/videos/quan-tri-shtt.mp4",
        extra_headers={"Range": "bytes=0-1023"},
    )
    content_range = hdr_vid.get("Content-Range") or hdr_vid.get("content-range") or ""
    check(
        "FS-03: Phát video mẫu `/files/lms/videos/quan-tri-shtt.mp4` với Range: bytes=0-1023 -> 206 Partial Content",
        st_vid == 206 and content_range.startswith("bytes 0-1023/") and len(body_vid) == 1024,
        f"status={st_vid}, Content-Range={content_range}, bytes={len(body_vid)}",
    )

    # -------------------------------------------------------------------------
    # PHẦN 4: KIỂM THỬ PHÁ HOẠI & FUZZING PHÂN QUYỀN RBAC (ec-fuzz)
    # -------------------------------------------------------------------------
    print("\n▶ [4] Kiểm thử Phá hoại & Fuzzing Phân quyền RBAC (ec-fuzz: 401 Unauthorized & 403 Forbidden)...")
    st_unauth_rubric, _, _ = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/practice-evaluations",
        body={"rubricScores": scores_11},
        token=None,
    )
    check("FZ-01: Gọi POST practice-evaluations không có token -> bị chặn 401 Unauthorized", st_unauth_rubric == 401, f"status={st_unauth_rubric}")

    st_unauth_quiz, _, _ = http_request(
        "POST",
        f"/api/v1/lms/catalog/{el002_id}/quiz-attempts",
        body={"answers": answers_6_of_10},
        token=None,
    )
    check("FZ-02: Gọi POST quiz-attempts không có token -> bị chặn 401 Unauthorized", st_unauth_quiz == 401, f"status={st_unauth_quiz}")

    st_forbid_create, _, _ = http_request(
        "POST",
        "/api/v1/lms/materials",
        body={"title": "Hack Course", "lessonType": "COURSE", "durationMinutes": 10},
        token=learner_jwt,
    )
    check("FZ-03: Học viên (PUBLIC_USER) gọi POST /api/v1/lms/materials tạo khóa học -> bị chặn 403 Forbidden", st_forbid_create == 403, f"status={st_forbid_create}")

    st_forbid_delete, _, _ = http_request(
        "DELETE",
        f"/api/v1/lms/materials/{el002_id}",
        token=learner_jwt,
    )
    check("FZ-04: Học viên (PUBLIC_USER) gọi DELETE /api/v1/lms/materials/{id} -> bị chặn 403 Forbidden", st_forbid_delete == 403, f"status={st_forbid_delete}")

    st_idor_expert, _, _ = http_request(
        "POST",
        f"/api/v1/lms/materials/{el002_id}/unpublish",
        body={"reason": "IDOR unpublish attempt by non-owner expert"},
        token=expert_jwt,
    )
    check(
        "FZ-05: Chuyên gia khác (không phải chủ sở hữu EL-002) gọi POST /api/v1/lms/materials/{id}/unpublish -> bị chặn 403 Forbidden (Chống IDOR)",
        st_idor_expert == 403,
        f"status={st_idor_expert}",
    )

    # -------------------------------------------------------------------------
    # PHẦN 5: TẦNG 3 — ĐỐI SOÁT TRỰC TIẾP CSDL POSTGRESQL THẬT (DEEP DB STATE VERIFICATION)
    # -------------------------------------------------------------------------
    print("\n▶ [5] Tầng 3 — Truy vấn trực tiếp PostgreSQL (localhost:55440) đối soát dữ liệu ghi đĩa thật...")
    cur.execute(
        """
        SELECT total_score, max_score, is_unlocked_cta, expert_consultation_requested, demand_profile_created
        FROM lms.learner_practice_evaluations
        WHERE material_id = %s AND person_id = %s
        ORDER BY submitted_at DESC
        LIMIT 2;
        """,
        (el002_id, learner_id),
    )
    eval_rows = cur.fetchall()
    check(
        "DB-01: Bảng `lms.learner_practice_evaluations` lưu chính xác 2 bản ghi thực hành (11/14 unlocked=True & 10/14 unlocked=False)",
        len(eval_rows) >= 2 and eval_rows[0][0] == 11 and eval_rows[0][2] is True and eval_rows[1][0] == 10 and eval_rows[1][2] is False,
        f"rows={eval_rows}",
    )

    cur.execute(
        """
        SELECT score_percent, passed, correct_answers, total_questions
        FROM lms.learner_quiz_attempts
        WHERE material_id = %s AND person_id = %s
        ORDER BY submitted_at DESC
        LIMIT 2;
        """,
        (el002_id, learner_id),
    )
    attempt_rows = cur.fetchall()
    check(
        "DB-02: Bảng `lms.learner_quiz_attempts` lưu chính xác 2 lần nộp Quiz (60% passed=True & 50% passed=False)",
        len(attempt_rows) >= 2 and attempt_rows[0] == (60, True, 6, 10) and attempt_rows[1] == (50, False, 5, 10),
        f"rows={attempt_rows}",
    )

    cur.execute(
        """
        SELECT best_quiz_score, quiz_attempts_count, is_completed
        FROM lms.learner_progress
        WHERE material_id = %s AND person_id = %s;
        """,
        (el002_id, learner_id),
    )
    prog_row = cur.fetchone()
    check(
        "DB-03: Bảng `lms.learner_progress` cập nhật best_quiz_score >= 60 và is_completed = True",
        prog_row is not None and prog_row[0] >= 60 and prog_row[1] >= 2 and prog_row[2] is True,
        f"progress={prog_row}",
    )

    conn.close()
    print("\n================================================================================")
    print(f"🏆 KẾT QUẢ TẦNG 2 & TẦNG 3: {passed}/{total} TEST CASES PASSED (100% GREEN)")
    print("================================================================================")


if __name__ == "__main__":
    run_tier2_and_tier3()
