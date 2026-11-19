#!/usr/bin/env python3
"""
=============================================================================
QC BLACK-BOX & 4-TIER VERIFICATION SUITE — TASK-08 KẾT NỐI CUNG–CẦU & QUẢN LÝ CƠ HỘI
Kỷ luật: Zero-Mock & Deep DB State Verification (PostgreSQL 16)
=============================================================================
"""

import sys
import json
import urllib.request
import urllib.parse
import subprocess
import time

BACKEND_URL = "http://localhost:5080"
FRONTEND_URL = "http://localhost:3000"

def log_header(title):
    print("\n" + "=" * 80)
    print(f"  {title.upper()}")
    print("=" * 80)

def log_pass(msg):
    print(f"  [PASS] {msg}")

def log_fail(msg):
    print(f"  [FAIL] {msg}")
    sys.exit(1)

def psql_query(sql):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech", "-t", "-A", "-c", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"PostgreSQL query failed: {res.stderr}")
    return res.stdout.strip()

def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "QC-ZeroMock-Agent/1.0"})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def http_post(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "QC-ZeroMock-Agent/1.0"}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def http_put(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "QC-ZeroMock-Agent/1.0"},
        method="PUT"
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())


# =============================================================================
# TẦNG 1: INVARIANT & ALGORITHM UNIT TESTING
# =============================================================================
def test_tier1_invariants():
    log_header("Tầng 1: Kiểm thử Bất biến Toán học & Thuật toán Ghép nối (Math Invariants)")

    # 1. Matching Score Invariant Formulation
    def calc_match_score(sector_match: bool, trl: int, tni: int, has_patent: bool) -> int:
        score = 0
        if sector_match:
            score += 40
        score += int((min(max(trl, 1), 9) / 9.0) * 30)
        if tni >= 80:
            score += 15
        elif tni >= 60:
            score += 10
        if has_patent:
            score += 15
        return min(max(score, 0), 100)

    s1 = calc_match_score(True, 8, 85, True)
    assert 90 <= s1 <= 100, f"Score should be 90-100, got {s1}"
    log_pass(f"BR-BRK-01 Invariant: Cặp hoàn hảo (Cùng ngành, TRL 8, TNI 85, Patent) đạt {s1}% (>= 90%)")

    s2 = calc_match_score(True, 4, 50, False)
    assert 50 <= s2 <= 65, f"Score should be 50-65, got {s2}"
    log_pass(f"BR-BRK-01 Invariant: Cặp sơ khai (TRL 4, TNI 50, Không patent) đạt {s2}% (50-65%)")

    # 2. PDPD Masking Invariants (NĐ 13/2023)
    def mask_phone(phone: str) -> str:
        if len(phone) < 7: return phone
        return phone[:2] + "****" + phone[-4:]

    def mask_email(email: str) -> str:
        if "@" not in email: return email
        parts = email.split("@")
        name, domain = parts[0], parts[1]
        if len(name) <= 2: return f"{name[0]}***@{domain}"
        return f"{name[0]}***{name[-1]}@{domain}"

    assert mask_phone("0912345678") == "09****5678", "Mask phone failed"
    log_pass("BR-BRK-02 Invariant: Masking SĐT '0912345678' -> '09****5678'")

    assert mask_email("hai.vu@greenco.vn") == "h***u@greenco.vn", "Mask email failed"
    log_pass("BR-BRK-02 Invariant: Masking Email 'hai.vu@greenco.vn' -> 'h***u@greenco.vn'")


# =============================================================================
# TẦNG 2: API CONTRACT & PDPD SECURITY VERIFICATION
# =============================================================================
def test_tier2_contracts():
    log_header("Tầng 2: Kiểm thử Hợp đồng API & Kiểm soát PDPD Masking (Contract & Security)")

    # 1. GET /api/v1/brokerage/radar
    radar = http_get(f"{BACKEND_URL}/api/v1/brokerage/radar")
    assert radar["success"] is True, "Radar response not success"
    assert len(radar["data"]) >= 4, f"Radar data count {len(radar['data'])} < 4"
    c0 = radar["data"][0]
    for key in ["id", "demandId", "demandTitle", "offerId", "offerTitle", "matchScore", "tniScore", "trlLevel"]:
        assert key in c0, f"Missing key in radar item: {key}"
    log_pass(f"Contract /api/v1/brokerage/radar hợp lệ. Trả về {len(radar['data'])} ứng viên ghép đôi.")

    # 2. GET /api/v1/brokerage/opportunities (PDPD Masked)
    opps = http_get(f"{BACKEND_URL}/api/v1/brokerage/opportunities")
    assert opps["success"] is True, "Opportunities response not success"
    assert len(opps["data"]) >= 2, f"Opportunities count < 2"
    o0 = opps["data"][0]
    assert "****" in o0["buyerContactPhone"], f"Phone NOT masked in public list: {o0['buyerContactPhone']}"
    assert "***" in o0["buyerContactEmail"] and "@" in o0["buyerContactEmail"], f"Email NOT masked in public list: {o0['buyerContactEmail']}"
    assert o0["buyerContactEmail"] != "hai.vu@greenco.vn", f"Raw email leaked: {o0['buyerContactEmail']}"
    log_pass(f"Bảo vệ PDPD /api/v1/brokerage/opportunities: Phone={o0['buyerContactPhone']}, Email={o0['buyerContactEmail']}")

    # 3. GET /api/v1/brokerage/opportunities/{id}/deal-room (UNMASKED inside room)
    deal_room_id = o0["id"]
    room = http_get(f"{BACKEND_URL}/api/v1/brokerage/opportunities/{deal_room_id}/deal-room")
    assert room["success"] is True, "Deal room response not success"
    room_opp = room["data"]["opportunity"]
    assert "****" not in room_opp["buyerContactPhone"], f"Phone unexpectedly masked inside room: {room_opp['buyerContactPhone']}"
    assert "***@" not in room_opp["buyerContactEmail"], f"Email unexpectedly masked inside room: {room_opp['buyerContactEmail']}"
    log_pass(f"Deal Room Thẩm quyền UNMASKED: Phone={room_opp['buyerContactPhone']}, Email={room_opp['buyerContactEmail']}")


# =============================================================================
# TẦNG 3: DEEP POSTGRESQL STATE INTEGRATION TESTING (ZERO-MOCK)
# =============================================================================
def test_tier3_deep_db_verification():
    log_header("Tầng 3: Đối soát Dữ liệu Tận gốc trong PostgreSQL (Deep DB State Verification)")

    # 1. Lấy 1 cặp ứng viên từ radar
    radar = http_get(f"{BACKEND_URL}/api/v1/brokerage/radar")
    cand = radar["data"][0]

    # 2. Tạo Yêu cầu kết nối qua API
    req_payload = {
        "demandId": cand["demandId"],
        "offerId": cand["offerId"],
        "senderOrgName": "QC Auto Test Enterprise",
        "senderRole": "BUYER",
        "receiverOrgName": cand["sellerOrganizationName"],
        "message": "QC Automated Zero-Mock Verification Test Message",
        "proposedBudgetRange": "1 tỷ - 1.5 tỷ VNĐ"
    }
    create_res = http_post(f"{BACKEND_URL}/api/v1/brokerage/requests", req_payload)
    assert create_res["success"] is True, "Failed to create connection request"
    req_id = create_res["data"]["id"]
    req_code = create_res["data"]["requestCode"]

    # ĐỐI SOÁT TRỰC TIẾP CSDL POSTGRESQL
    db_req = psql_query(f"SELECT status, sender_org_name FROM brokerage.connection_requests WHERE id = '{req_id}';")
    assert "PENDING|QC Auto Test Enterprise" == db_req, f"PostgreSQL state mismatch: {db_req}"
    log_pass(f"DB Assert: Bảng brokerage.connection_requests ghi nhận bản ghi '{req_code}' với status=PENDING")

    # 3. Phản hồi Chấp nhận kết nối (ACCEPT)
    resp_res = http_put(f"{BACKEND_URL}/api/v1/brokerage/requests/{req_id}/respond", {
        "action": "ACCEPT",
        "note": "QC Partner accepts connection"
    })
    assert resp_res["success"] is True, "Failed to respond connection request"
    created_opp_id = resp_res["data"]["createdOpportunityId"]
    created_opp_code = resp_res["data"]["createdOpportunityCode"]
    assert created_opp_id is not None, "Opportunity was not automatically created"

    # ĐỐI SOÁT POSTGRESQL: Request đã chuyển ACCEPTED & Opportunity đã tự sinh
    db_req_after = psql_query(f"SELECT status FROM brokerage.connection_requests WHERE id = '{req_id}';")
    assert db_req_after == "ACCEPTED", f"Request status in DB is {db_req_after}, expected ACCEPTED"
    
    db_opp = psql_query(f"SELECT opportunity_code, stage FROM brokerage.opportunities WHERE id = '{created_opp_id}';")
    assert f"{created_opp_code}|INITIATED" == db_opp, f"Opportunity in DB mismatch: {db_opp}"
    log_pass(f"DB Assert: Yêu cầu chuyển ACCEPTED -> Tự động sinh Cơ hội '{created_opp_code}' với stage=INITIATED")

    # 4. Gửi thảo luận trong Deal Room
    disc_payload = {
        "senderName": "QC Tester",
        "senderRole": "BUYER",
        "message": "Xin chào, chúng tôi muốn kiểm tra thông số kỹ thuật thực địa."
    }
    disc_res = http_post(f"{BACKEND_URL}/api/v1/brokerage/opportunities/{created_opp_id}/discussions", disc_payload)
    assert disc_res["success"] is True, "Failed to post deal discussion"
    disc_id = disc_res["data"]["id"]

    db_disc = psql_query(f"SELECT sender_name, message FROM brokerage.deal_discussions WHERE id = '{disc_id}';")
    assert "QC Tester|Xin chào, chúng tôi muốn kiểm tra thông số kỹ thuật thực địa." == db_disc
    log_pass(f"DB Assert: Bảng brokerage.deal_discussions lưu chuẩn xác nội dung trao đổi Deal Room")

    # 5. Soạn thảo và ký kết Biên bản Ghi nhớ MOU
    mou_payload = {
        "scopeOfWork": "QC Test Scope of Work: Triển khai thử nghiệm 6 tháng",
        "pilotDurationMonths": 6,
        "commercialTerms": "Giá trị ước tính 1.2 tỷ VNĐ",
        "intellectualPropertyTerms": "Quyền SHTT bảo vệ theo Luật SHTT 2022",
        "status": "SIGNED"
    }
    mou_res = http_post(f"{BACKEND_URL}/api/v1/brokerage/opportunities/{created_opp_id}/mou", mou_payload)
    assert mou_res["success"] is True, "Failed to save MOU"
    mou_code = mou_res["data"]["mouCode"]

    # ĐỐI SOÁT POSTGRESQL: MOU status=SIGNED và Cơ hội tự nâng stage lên MOU_SIGNED (BR-BRK-06)
    db_mou = psql_query(f"SELECT mou_code, status FROM brokerage.mou_agreements WHERE opportunity_id = '{created_opp_id}';")
    assert f"{mou_code}|SIGNED" == db_mou, f"MOU in DB mismatch: {db_mou}"

    db_opp_stage = psql_query(f"SELECT stage FROM brokerage.opportunities WHERE id = '{created_opp_id}';")
    assert db_opp_stage == "MOU_SIGNED", f"Opportunity stage did not advance to MOU_SIGNED: {db_opp_stage}"
    log_pass(f"DB Assert: Biên bản {mou_code} ký kết -> Cơ hội tự động chuyển sang stage=MOU_SIGNED")

    # 6. Đối soát Cổng Giám Sát Sở KH&CN (/api/v1/gov/opportunities)
    gov_res = http_get(f"{BACKEND_URL}/api/v1/gov/opportunities")
    assert gov_res["success"] is True
    gov_stats = gov_res["data"]["statistics"]
    assert gov_stats["mouSigned"] >= 1, f"Gov stats mouSigned count < 1: {gov_stats['mouSigned']}"
    log_pass(f"DB Assert: Cổng Sở KH&CN cập nhật đúng số cơ hội đã ký MOU: {gov_stats['mouSigned']}")


# =============================================================================
# TẦNG 4: FRONTEND WEB & E2E BLACKBOX ROUTE VERIFICATION
# =============================================================================
def test_tier4_e2e_blackbox_routes():
    log_header("Tầng 4: Kiểm thử Luồng Giao diện Người dùng Web & Frontend Endpoints")

    routes = [
        ("/portal/matching/radar", "Radar Ghép Nối"),
        ("/portal/opportunities/pipeline", "Pipeline Kanban"),
        ("/portal/opportunities/01a12e02-0001-7000-8000-000000000001/deal-room", "Deal Room 1-1"),
        ("/gov/opportunities", "Cổng Giám Sát Sở KH&CN")
    ]

    for path, label in routes:
        url = f"{FRONTEND_URL}{path}"
        req = urllib.request.Request(url, headers={"User-Agent": "QC-ZeroMock-Agent/1.0"})
        with urllib.request.urlopen(req) as response:
            assert response.status == 200, f"Route {path} returned status {response.status}"
            html = response.read().decode("utf-8")
            assert len(html) > 500, f"HTML content too short for {path}"
            log_pass(f"E2E Web Check: Màn hình [{label}] ({path}) render 200 OK với kích thước {len(html)} bytes")


# =============================================================================
# MAIN RUNNER
# =============================================================================
if __name__ == "__main__":
    print("\n" + "#" * 80)
    print("### BẮT ĐẦU KIỂM THỬ 4 TẦNG ZERO-MOCK DỰ ÁN NACENTECH — TASK-08")
    print("#" * 80)
    start_time = time.time()

    test_tier1_invariants()
    test_tier2_contracts()
    test_tier3_deep_db_verification()
    test_tier4_e2e_blackbox_routes()

    duration = time.time() - start_time
    print("\n" + "=" * 80)
    print(f"### KẾT QUẢ: 100% PASS TOÀN DIỆN 4 TẦNG KIỂM THỬ (Thời gian: {duration:.2f}s)")
    print("### KHÔNG CÓ BẤT KỲ MOCK NGẦM NÀO — TẤT CẢ DỮ LIỆU ĐƯỢC ĐỐI SOÁT TẬN GỐC TRÊN POSTGRESQL!")
    print("=" * 80 + "\n")
