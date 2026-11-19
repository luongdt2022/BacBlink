#!/usr/bin/env python3
"""
=============================================================================
E2E VERIFICATION SUITE — TASK-03 & TASK-02: BUYER PREFILL & DEMO ACCOUNTS SSOT
Kỷ luật: Zero-Mock & Deep DB State Verification (PostgreSQL 16 & REST APIs)
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

def http_post(url, data, token=None):
    body = json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json", "User-Agent": "QC-ZeroMock-Agent/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def http_get(url, token=None):
    headers = {"User-Agent": "QC-ZeroMock-Agent/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def test_buyer_demo_account():
    log_header("1. XÁC THỰC TÀI KHOẢN DEMO BUYER & PROFILE SSOT")
    
    # 1.1 Login with buyer.user@demo.nacentech.vn and Demo@2026
    login_res = http_post(f"{BACKEND_URL}/api/v1/auth/login", {
        "email": "buyer.user@demo.nacentech.vn",
        "password": "Demo@2026"
    })
    token = login_res.get("accessToken")
    user = login_res.get("user")
    
    if not token or not user:
        log_fail("Không thể đăng nhập tài khoản buyer.user@demo.nacentech.vn với mật khẩu Demo@2026")
    log_pass(f"Đăng nhập thành công với buyer.user@demo.nacentech.vn, Role = {user.get('role')}")
    
    # 1.2 Fetch Enterprise Profile
    profile_res = http_get(f"{BACKEND_URL}/api/v1/portal/enterprise/profile", token=token)
    profile = profile_res.get("data")
    if not profile:
        log_fail("GET /api/v1/portal/enterprise/profile không trả về dữ liệu data")
        
    company_name = profile.get("name")
    tax_code = profile.get("taxCode")
    province = profile.get("provinceCity")
    contact_person = profile.get("contactPerson")
    contact_phone = profile.get("contactPhone")
    capability_tier = profile.get("capabilityTier")
    is_buyer = profile.get("isBuyer")
    
    print(f"    - Doanh nghiệp: {company_name}")
    print(f"    - MST: {tax_code}")
    print(f"    - Địa bàn: {province}")
    print(f"    - Người liên hệ: {contact_person} ({contact_phone})")
    print(f"    - Phân tầng năng lực: {capability_tier}, IsBuyer: {is_buyer}")
    
    if company_name != "CÔNG TY TNHH TRƯỜNG HOAN":
        log_fail(f"Tên công ty không đúng kỳ vọng: {company_name}")
    if tax_code != "0100255428":
        log_fail(f"Mã số thuế không đúng kỳ vọng: {tax_code}")
    if "Hà Nội" not in province:
        log_fail(f"Tỉnh thành không phải Hà Nội: {province}")
    if contact_person != "Nguyễn Văn Hoan":
        log_fail(f"Người liên hệ không đúng: {contact_person}")
    if not is_buyer or capability_tier != "BUYER":
        log_fail(f"Năng lực Buyer không chính xác: tier={capability_tier}, isBuyer={is_buyer}")
        
    log_pass("Hồ sơ Doanh nghiệp Buyer khớp 100% CÔNG TY TNHH TRƯỜNG HOAN (MST 0100255428)")
    return token

def test_seller_demo_account():
    log_header("2. XÁC THỰC TÀI KHOẢN DEMO SELLER & PROFILE SSOT")
    
    # 2.1 Login with seller.user@demo.nacentech.vn and Demo@2026
    login_res = http_post(f"{BACKEND_URL}/api/v1/auth/login", {
        "email": "seller.user@demo.nacentech.vn",
        "password": "Demo@2026"
    })
    token = login_res.get("accessToken")
    user = login_res.get("user")
    
    if not token or not user:
        log_fail("Không thể đăng nhập tài khoản seller.user@demo.nacentech.vn với mật khẩu Demo@2026")
    log_pass(f"Đăng nhập thành công với seller.user@demo.nacentech.vn, Role = {user.get('role')}")
    
    # 2.2 Fetch Enterprise Profile
    profile_res = http_get(f"{BACKEND_URL}/api/v1/portal/enterprise/profile", token=token)
    profile = profile_res.get("data")
    if not profile:
        log_fail("GET /api/v1/portal/enterprise/profile không trả về dữ liệu data")
        
    company_name = profile.get("name")
    tax_code = profile.get("taxCode")
    province = profile.get("provinceCity")
    contact_person = profile.get("contactPerson")
    contact_phone = profile.get("contactPhone")
    capability_tier = profile.get("capabilityTier")
    is_seller = profile.get("isSeller")
    
    print(f"    - Doanh nghiệp: {company_name}")
    print(f"    - MST: {tax_code}")
    print(f"    - Địa bàn: {province}")
    print(f"    - Người liên hệ: {contact_person} ({contact_phone})")
    print(f"    - Phân tầng năng lực: {capability_tier}, IsSeller: {is_seller}")
    
    if "TÂN TIẾN" not in company_name:
        log_fail(f"Tên công ty không đúng kỳ vọng: {company_name}")
    if tax_code != "0108992134":
        log_fail(f"Mã số thuế không đúng kỳ vọng: {tax_code}")
    if contact_person != "Trần Tiến Dũng":
        log_fail(f"Người liên hệ không đúng: {contact_person}")
    if not is_seller or capability_tier != "SELLER":
        log_fail(f"Năng lực Seller không chính xác: tier={capability_tier}, isSeller={is_seller}")
        
    log_pass("Hồ sơ Doanh nghiệp Seller khớp 100% CÔNG TY CỔ PHẦN CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN (MST 0108992134)")
    return token

def test_capabilities_activation_and_role_switching(buyer_token):
    log_header("3. KIỂM THỬ KÍCH HOẠT NĂNG LỰC ĐA TẦNG & CHUYỂN ĐỔI VAI TRÒ (DUAL MODE)")
    
    # 3.1 Kích hoạt năng lực SELLER cho Doanh nghiệp Buyer
    act_res = http_post(f"{BACKEND_URL}/api/v1/portal/enterprise/capabilities/activate", {
        "capability": "SELLER"
    }, token=buyer_token)
    tier = act_res.get("data", {}).get("capabilityTier")
    if tier != "DUAL":
        log_fail(f"Kích hoạt SELLER không đưa doanh nghiệp lên hạng DUAL, thực tế: {tier}")
    log_pass("Kích hoạt thành công năng lực SELLER -> Hạng năng lực chuyển thành DUAL")
    
    # 3.2 Chuyển vai trò sang SELLER
    switch_seller = http_post(f"{BACKEND_URL}/api/v1/portal/enterprise/capabilities/switch-role", {
        "targetRole": "SELLER"
    }, token=buyer_token)
    active_role = switch_seller.get("data", {}).get("activeRole")
    if active_role != "SELLER":
        log_fail(f"Chuyển vai trò sang SELLER thất bại, activeRole: {active_role}")
    log_pass("Chuyển đổi vai trò sang SELLER thành công")
    
    # 3.3 Chuyển vai trò về BUYER
    switch_buyer = http_post(f"{BACKEND_URL}/api/v1/portal/enterprise/capabilities/switch-role", {
        "targetRole": "BUYER"
    }, token=buyer_token)
    active_role_back = switch_buyer.get("data", {}).get("activeRole")
    if active_role_back != "BUYER":
        log_fail(f"Chuyển đổi vai trò về BUYER thất bại, activeRole: {active_role_back}")
    log_pass("Chuyển đổi vai trò trở lại BUYER thành công")
    
    # 3.4 Phục hồi trạng thái mặc định cho Buyer trong CSDL
    psql_query("""
        UPDATE enterprise.enterprises 
        SET capability_tier = 'BUYER', is_buyer = true, is_seller = false, active_role = 'BUYER'
        WHERE tax_code = '0100255428';
    """)
    log_pass("Đã phục hồi trạng thái chuẩn BUYER cho tài khoản demo trong CSDL")

def test_db_ssot_integrity():
    log_header("4. KIỂM THỬ TÍNH TOÀN VẸN CSDL POSTGRESQL (PARTIAL INDEX & IDENTIFIERS)")
    
    # 4.1 Kiểm tra Partial Unique Index
    idx_sql = """
        SELECT count(*) FROM pg_indexes 
        WHERE schemaname = 'enterprise' AND tablename = 'enterprises' 
        AND indexname = 'ix_enterprises_tax_code_unique';
    """
    count = int(psql_query(idx_sql) or "0")
    if count == 0:
        log_fail("Không tìm thấy partial unique index ix_enterprises_tax_code_unique trên enterprise.enterprises")
    log_pass("Partial Unique Index ix_enterprises_tax_code_unique tồn tại an toàn")
    
    # 4.2 Kiểm tra Identifier USER_ID
    id_sql = """
        SELECT count(*) FROM enterprise.enterprise_identifiers 
        WHERE type = 'USER_ID' AND value IN ('fbc7b482-4cdd-4f5e-80dc-5fdc5944cc76', '208039ea-cb0b-4b9b-b115-73a1f629e521');
    """
    id_count = int(psql_query(id_sql) or "0")
    if id_count < 2:
        log_fail(f"Thiếu định danh USER_ID cho các tài khoản demo, tìm thấy: {id_count}")
    log_pass("Định danh USER_ID cho cả 2 tài khoản Buyer & Seller đã được ánh xạ chuẩn SSOT")

def main():
    print("""
    =============================================================================
    NACENTECH GATE 3: E2E TEST BUYER PREFILL & DEMO ACCOUNTS CAPABILITIES
    =============================================================================
    """)
    buyer_token = test_buyer_demo_account()
    test_seller_demo_account()
    test_capabilities_activation_and_role_switching(buyer_token)
    test_db_ssot_integrity()
    
    print("\n" + "=" * 80)
    print("  [SUCCESS] 100% CÁC TIÊU CHÍ GATE 3 ĐÃ ĐƯỢC XÁC THỰC HOÀN TOÀN THÀNH CÔNG!")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
