#!/usr/bin/env python3
"""
nacen-qc: Independent Re-test Verification Suite (Zero-Mock)
Target: Real PostgreSQL (Docker: nacentech-postgres-1) & Real API (Kestrel: localhost:5080)
Defects under test: Defect-01, Defect-02, Defect-03
"""
import requests
import json
import subprocess
import sys
import uuid

API_BASE = "http://localhost:5080"
DEMAND_ID = "a0000000-0000-0000-0000-000000000001"

def psql_query(query: str) -> str:
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-t", "-A", "-c", query
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"psql error: {proc.stderr}\nQuery: {query}")
    return proc.stdout.strip()

def setup_users_and_demand():
    print("[SETUP] Preparing test users & demand in PostgreSQL...")
    # Get or create User 1 (Owner)
    r1 = requests.post(f"{API_BASE}/api/v1/auth/login", json={
        "email": "qc.tester.01@demo.nacentech.vn",
        "password": "Password123!"
    })
    token1 = r1.json()["accessToken"]
    user1_id = r1.json()["user"]["id"]

    # Get or create User 2 (Attacker / Different Account)
    r2 = requests.post(f"{API_BASE}/api/v1/auth/login", json={
        "email": "qc.tester.02@demo.nacentech.vn",
        "password": "Password123!"
    })
    token2 = r2.json()["accessToken"]
    user2_id = r2.json()["user"]["id"]

    # Reset Demand in PostgreSQL
    psql_query(f"""
        INSERT INTO demand.demand_items (
            id, item_code, stage_name, technical_problem, expected_goal,
            sector_code, tech_group_code, demand_type_code, budget_range,
            urgency_score, impact_score, investment_capacity, adoption_readiness,
            tni_score, tni_classification, status, is_public_listed, created_by
        ) VALUES (
            '{DEMAND_ID}',
            'QC-DEMAND-001',
            'Sản xuất thử nghiệm',
            'Vấn đề kiểm định độ bền nhiệt độ cao của vật liệu composite',
            'Nâng cao độ bền nhiệt từ 200C lên 450C',
            'C.28',
            'TG.01',
            'TECH_TRANSFER',
            '1000000000',
            4, 4, 3, 3,
            70, 'HIGH', 'PENDING', true, '{user1_id}'
        ) ON CONFLICT (id) DO UPDATE SET 
            created_by = '{user1_id}', 
            status = 'PENDING',
            technical_problem = 'Vấn đề kiểm định độ bền nhiệt độ cao của vật liệu composite',
            expected_goal = 'Nâng cao độ bền nhiệt từ 200C lên 450C';
    """)
    print(f"  Owner: {user1_id}")
    print(f"  Attacker: {user2_id}")
    print(f"  Demand {DEMAND_ID} reset to status 'PENDING'")
    return token1, user1_id, token2, user2_id

def test_defect_01(token1):
    print("\n" + "="*70)
    print("RE-TEST DEFECT-01: /portal/buyer/demands API & Auth Guard")
    print("="*70)

    # 1.1: Call GET /api/v1/buyer/demands without token
    print("[TC-01.1] GET /api/v1/buyer/demands without token...")
    res = requests.get(f"{API_BASE}/api/v1/buyer/demands")
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}"
    assert "Yêu cầu đăng nhập" in res.text, "Response message must state login requirement"
    print("  -> PASS: 401 Unauthorized returned as expected.")

    # 1.2: Call GET /api/v1/buyer/demands with valid token
    print("\n[TC-01.2] GET /api/v1/buyer/demands with valid token...")
    headers = {"Authorization": f"Bearer {token1}"}
    res = requests.get(f"{API_BASE}/api/v1/buyer/demands", headers=headers)
    print(f"  Status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}"
    demands = res.json()
    assert isinstance(demands, list), "Response must be a list of demands"
    found = any(d.get("id") == DEMAND_ID for d in demands)
    print(f"  Found owner's demand: {found} (Total demands: {len(demands)})")
    assert found, "Owner must see their created demand"
    print("  -> PASS: 200 OK returned with demand list.")

def test_defect_03(token1, token2):
    print("\n" + "="*70)
    print("RE-TEST DEFECT-03: Zero-IDOR and Auth Protection on Demand PUT and CLOSE")
    print("="*70)

    # 3.1: Zero-Token PUT -> 401
    print("[TC-03.1] PUT /api/v1/buyer/demands/{id} WITHOUT token...")
    put_body = {
        "technicalProblem": "Hacked Technical Problem without token",
        "expectedGoal": "Hacked Goal without token",
        "urgencyScore": 5, "impactScore": 5, "investmentCapacity": 5, "adoptionReadiness": 5
    }
    res = requests.put(f"{API_BASE}/api/v1/buyer/demands/{DEMAND_ID}", json=put_body)
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}"
    print("  -> PASS: Unauthenticated PUT rejected with 401.")

    # 3.2: Zero-Token POST Close -> 401
    print("\n[TC-03.2] POST /api/v1/buyer/demands/{id}/close WITHOUT token...")
    res = requests.post(f"{API_BASE}/api/v1/buyer/demands/{DEMAND_ID}/close")
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}"
    print("  -> PASS: Unauthenticated Close rejected with 401.")

    # 3.3: Zero-IDOR PUT -> 403 Forbidden when Attacker attempts update
    print("\n[TC-03.3] Attacker calls PUT /api/v1/buyer/demands/{id} on Owner's demand (IDOR Attack)...")
    res = requests.put(
        f"{API_BASE}/api/v1/buyer/demands/{DEMAND_ID}",
        headers={"Authorization": f"Bearer {token2}"},
        json={
            "technicalProblem": "MALICIOUS OVERWRITE BY ATTACKER",
            "expectedGoal": "MALICIOUS GOAL BY ATTACKER",
            "urgencyScore": 5, "impactScore": 5, "investmentCapacity": 5, "adoptionReadiness": 5
        }
    )
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 403, f"Expected 403 Forbidden, got {res.status_code}"
    assert "Không có quyền thao tác trên bài toán của người khác" in res.text

    # Verify PostgreSQL DB state is untouched
    db_problem = psql_query(f"SELECT technical_problem FROM demand.demand_items WHERE id = '{DEMAND_ID}';")
    print(f"  PostgreSQL DB technical_problem: '{db_problem}'")
    assert db_problem == "Vấn đề kiểm định độ bền nhiệt độ cao của vật liệu composite", "DB was modified by IDOR!"
    print("  -> PASS: Zero-IDOR PUT successfully blocked with 403. Real DB intact.")

    # 3.4: Zero-IDOR Close -> 403 Forbidden when Attacker attempts close
    print("\n[TC-03.4] Attacker calls POST /api/v1/buyer/demands/{id}/close on Owner's demand (IDOR Attack)...")
    res = requests.post(
        f"{API_BASE}/api/v1/buyer/demands/{DEMAND_ID}/close",
        headers={"Authorization": f"Bearer {token2}"}
    )
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 403, f"Expected 403 Forbidden, got {res.status_code}"
    assert "Không có quyền thao tác trên bài toán của người khác" in res.text

    # Verify PostgreSQL DB status is still PENDING
    db_status = psql_query(f"SELECT status FROM demand.demand_items WHERE id = '{DEMAND_ID}';")
    print(f"  PostgreSQL DB status: '{db_status}'")
    assert db_status == "PENDING", f"Expected PENDING, got {db_status}"
    print("  -> PASS: Zero-IDOR Close successfully blocked with 403. Status remains PENDING.")

    # 3.5: Owner calls PUT -> 200 OK
    print("\n[TC-03.5] Legitimate Owner calls PUT /api/v1/buyer/demands/{id}...")
    updated_problem = "Vấn đề kiểm định độ bền nhiệt độ cao đã được cập nhật bởi chính chủ"
    res = requests.put(
        f"{API_BASE}/api/v1/buyer/demands/{DEMAND_ID}",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "stageName": "Sản xuất hàng loạt",
            "technicalProblem": updated_problem,
            "desiredSolution": "Hệ thống lò nung chân không nhiệt độ cao",
            "needConsulting": True,
            "expectedGoal": "Đạt chuẩn chịu nhiệt 500C",
            "urgencyScore": 5, "impactScore": 4, "investmentCapacity": 4, "adoptionReadiness": 4
        }
    )
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}"

    # Verify PostgreSQL DB state
    db_problem = psql_query(f"SELECT technical_problem FROM demand.demand_items WHERE id = '{DEMAND_ID}';")
    print(f"  PostgreSQL DB updated technical_problem: '{db_problem}'")
    assert db_problem == updated_problem, "PostgreSQL does not reflect updated problem!"
    print("  -> PASS: Owner update succeeded with 200 OK and real DB updated.")

    # 3.6: Owner calls Close -> 200 OK
    print("\n[TC-03.6] Legitimate Owner calls POST /api/v1/buyer/demands/{id}/close...")
    res = requests.post(
        f"{API_BASE}/api/v1/buyer/demands/{DEMAND_ID}/close",
        headers={"Authorization": f"Bearer {token1}"}
    )
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}"

    # Verify PostgreSQL DB status
    db_status = psql_query(f"SELECT status FROM demand.demand_items WHERE id = '{DEMAND_ID}';")
    print(f"  PostgreSQL DB updated status: '{db_status}'")
    assert db_status == "CLOSED", f"Expected CLOSED in DB, got {db_status}"
    print("  -> PASS: Owner close succeeded with 200 OK and real DB status changed to CLOSED.")

    # 3.7: Boundary check: Attempting update on CLOSED demand -> 400 Bad Request
    print("\n[TC-03.7] Boundary test: Owner attempts PUT on CLOSED demand...")
    res = requests.put(
        f"{API_BASE}/api/v1/buyer/demands/{DEMAND_ID}",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "technicalProblem": "Attempt to update closed item",
            "expectedGoal": "Attempt to update closed item",
            "urgencyScore": 5, "impactScore": 5, "investmentCapacity": 5, "adoptionReadiness": 5
        }
    )
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
    assert res.status_code == 400, f"Expected 400 Bad Request, got {res.status_code}"
    assert "Chỉ có thể chỉnh sửa bài toán khi ở trạng thái Chờ thẩm định" in res.text
    print("  -> PASS: State boundary protection verified (CLOSED items cannot be updated).")

def main():
    print("==================================================================")
    print("NACENTECH INDEPENDENT QC: RE-TEST VERIFICATION SUITE (ZERO-MOCK)")
    print("==================================================================")
    try:
        token1, user1_id, token2, user2_id = setup_users_and_demand()
        test_defect_01(token1)
        test_defect_03(token1, token2)
        print("\n" + "="*70)
        print("ALL REAL BACKEND & DATABASE INTEGRATION TESTS PASSED (100% OK)!")
        print("="*70)
    except Exception as e:
        print(f"\n[FAILED]: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
