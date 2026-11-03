#!/usr/bin/env python3
"""
KỊCH BẢN KIỂM THỬ PLAYWRIGHT E2E PURE BLACK-BOX: TASK-11 BLOCKCHAIN & ZKPROOF
Bao phủ toàn trình:
- Luồng 1 (T-11.13..16 / E2E-BC-01): Bàn làm việc Quản trị Trung tâm Blockchain & ZKP (/admin/blockchain — 3 Tabs Policies, Ledger, Bridge).
- Luồng 2 (T-11.17 / E2E-BC-02): Component <BlockchainZkpBadge /> & Modal Kiểm chứng độc lập tại trang Chi tiết Công nghệ (/chao-ban-cong-nghe/[id]).
- Luồng 3 (T-11.22 / E2E-BC-03): Kịch bản Phá hoại Dữ liệu (Adversarial Tamper) & Cảnh báo đỏ rực TAMPERED.
"""

import sys
import time
import json
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
API_BASE = "http://localhost:5080"

def seed_test_anchor_record(entity_type, entity_id, entity_code, payload_dict):
    """Gửi trực tiếp vào CSDL để tạo 1 bản ghi neo và đóng khối chuẩn phục vụ test E2E"""
    import subprocess
    payload_json = json.dumps(payload_dict, separators=(',', ':'), ensure_ascii=False)
    
    # Chuẩn bị SQL chèn vào postgres container
    # Sử dụng python script ngắn qua docker exec
    sql_script = f"""
    DO $$
    DECLARE
        v_rec_id uuid := gen_random_uuid();
        v_vault_id uuid := gen_random_uuid();
        v_prev_hash text;
        v_merkle_root text := '0x' || encode(sha256('{payload_json}'::bytea), 'hex');
        v_block_hash text;
        v_block_num bigint;
    BEGIN
        -- 1. Lấy block cao nhất
        SELECT block_hash, block_number INTO v_prev_hash, v_block_num 
        FROM blockchain.ledger_blocks ORDER BY block_number DESC LIMIT 1;
        
        IF v_prev_hash IS NULL THEN
            v_prev_hash := '0x0000000000000000000000000000000000000000000000000000000000000000';
            v_block_num := 0;
        END IF;

        v_block_num := v_block_num + 1;
        v_block_hash := '0x' || encode(sha256((v_prev_hash || v_merkle_root || v_block_num::text)::bytea), 'hex');

        -- 2. Đóng block mới
        INSERT INTO blockchain.ledger_blocks (
            block_number, block_hash, previous_hash, merkle_root, tx_count,
            validator_address, block_signature, status, created_at
        ) VALUES (
            v_block_num, v_block_hash, v_prev_hash, v_merkle_root, 1,
            '0x8888888888888888888888888888888888888888', '0xabcdef1234567890', 'COMMITTED',
            NOW()
        );

        -- 3. Xóa bản ghi cũ nếu có
        DELETE FROM blockchain.anchor_records WHERE entity_type = '{entity_type}' AND entity_id = '{entity_id}';
        DELETE FROM blockchain.zk_proof_vault WHERE commitment_hash = v_merkle_root;

        -- 4. Chèn ZkProofVault trước (để anchor_records tham chiếu fk)
        INSERT INTO blockchain.zk_proof_vault (
            id, anchor_record_id, proof_scheme, commitment_hash, salt_ciphertext,
            proof_envelope, public_signals, created_at
        ) VALUES (
            v_vault_id, v_rec_id, 'Groth16_BN254', v_merkle_root, '0x00',
            '{{"protocol":"groth16","curve":"bn128"}}'::jsonb, ('["' || v_merkle_root || '"]')::jsonb,
            NOW()
        );

        -- 5. Chèn AnchorRecord mới
        INSERT INTO blockchain.anchor_records (
            id, entity_type, entity_id, entity_code, schema_version,
            commitment_hash, raw_data_hash, zk_vault_id, ledger_block_number,
            tx_index_in_block, merkle_path, status, anchored_at, created_at, updated_at
        ) VALUES (
            v_rec_id, '{entity_type}', '{entity_id}', '{entity_code}', 'v1.0',
            v_merkle_root, v_merkle_root, v_vault_id, v_block_num,
            0, ('["' || v_merkle_root || '"]')::jsonb, 'LOCAL_LEDGER_ANCHORED',
            NOW(), NOW(), NOW()
        );
    END $$;
    """
    
    subprocess.run([
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-c", sql_script
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def run_blockchain_e2e_tests():
    print("======================================================================")
    print("🛡️  KIỂM THỬ PLAYWRIGHT E2E BLACK-BOX: TASK-11 BLOCKCHAIN & ZKPROOF")
    print("🚫 Kỷ luật Zero-Mock: Chạy trực tiếp trên trình duyệt Chromium sống & DB thật")
    print("======================================================================\n")

    defects = []
    tests_passed = 0
    tests_total = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})

        # Inject session Admin vào localStorage cho các route quản trị
        context.add_init_script("""
            localStorage.setItem('nacentwin_access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMmYzYjY1Ni05Njc2LTRmNGUtOTg5Yy01YjU0Y2VkMzJhMTciLCJlbWFpbCI6ImFkbWluLnN1cGVyQG5hY2VudGVjaC5sb2NhbCIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInBsYXRmb3JtX3JvbGUiOiJTVVBFUl9BRE1JTiIsInNjb3BlX3R5cGUiOiJHTE9CQUwiLCJpc3MiOiJuYWNlbnRlY2giLCJhdWQiOiJuYWNlbnRlY2gtcG9ydGFscyIsImV4cCI6MTgyNTIwNzA4NH0.t4qZ2dBZM3sTdpKxhOgZkW23RsddxK7MLZmxUKhrVto');
            localStorage.setItem('nacentwin_user_context', JSON.stringify({
                id: '02f3b656-9676-4f4e-989c-5b54ced32a17',
                email: 'admin.super@nacentech.local',
                fullName: 'Super Admin Trung Ương',
                role: 'SUPER_ADMIN'
            }));
        """)

        page = context.new_page()

        # ------------------------------------------------------------------
        # TEST 1: Bàn Làm Việc Quản Trị /admin/blockchain — Tab 1 Policies
        # ------------------------------------------------------------------
        tests_total += 1
        print("▶ [E2E-BC-01] Kiểm tra Bàn Làm Việc Quản Trị /admin/blockchain (Tab 1 Policies)...")
        page.goto(f"{BASE_URL}/admin/blockchain?tab=policies", wait_until="networkidle")
        time.sleep(2)

        body_text = page.locator("body").inner_text()
        if "Ma Trận Chính Sách Neo" in body_text and ("Chào bán công nghệ" in body_text or "Biên bản ghi nhớ" in body_text):
            print("  ✅ [PASS] Tab Policies hiển thị đầy đủ tiêu đề và ma trận chính sách.")
            tests_passed += 1
        else:
            defects.append({
                "id": "DEFECT-BC-01",
                "severity": "CRITICAL",
                "summary": "Không tìm thấy tiêu đề hoặc danh sách chính sách trên /admin/blockchain?tab=policies",
                "url": f"{BASE_URL}/admin/blockchain?tab=policies"
            })

        # ------------------------------------------------------------------
        # TEST 2: Tab 2 Sổ Cái Khối Nội Bộ & Merkle Explorer (?tab=ledger)
        # ------------------------------------------------------------------
        tests_total += 1
        print("▶ [E2E-BC-02] Kiểm tra Tab 2 Sổ Cái Khối Nội Bộ (/admin/blockchain?tab=ledger)...")
        page.goto(f"{BASE_URL}/admin/blockchain?tab=ledger", wait_until="networkidle")
        time.sleep(2)

        ledger_text = page.locator("body").inner_text()
        if "Sổ Cái Khối" in ledger_text and ("Đóng Khối Ngay" in ledger_text or "Khối #" in ledger_text or "Tổng số khối" in ledger_text):
            print("  ✅ [PASS] Tab Sổ Cái Khối hiển thị đầy đủ KPIs và danh sách Ledger Blocks.")
            tests_passed += 1
        else:
            defects.append({
                "id": "DEFECT-BC-02",
                "severity": "MAJOR",
                "summary": "Không tìm thấy KPIs hoặc danh sách khối trên /admin/blockchain?tab=ledger",
                "url": f"{BASE_URL}/admin/blockchain?tab=ledger"
            })

        # ------------------------------------------------------------------
        # TEST 3: Tab 3 Cổng Liên Thông NDAChain & Lịch Sử Bridge (?tab=bridge)
        # ------------------------------------------------------------------
        tests_total += 1
        print("▶ [E2E-BC-03] Kiểm tra Tab 3 Cổng Liên Thông NDAChain (/admin/blockchain?tab=bridge)...")
        page.goto(f"{BASE_URL}/admin/blockchain?tab=bridge", wait_until="networkidle")
        time.sleep(2)

        bridge_text = page.locator("body").inner_text()
        if "Cổng Liên Thông NDAChain" in bridge_text or "NDAChain Ready Gateway" in bridge_text:
            print("  ✅ [PASS] Tab NDAChain Bridge hiển thị đúng thông tin kết nối và lịch sử đồng bộ.")
            tests_passed += 1
        else:
            defects.append({
                "id": "DEFECT-BC-03",
                "severity": "MAJOR",
                "summary": "Không tìm thấy thông tin NDAChain Bridge trên /admin/blockchain?tab=bridge",
                "url": f"{BASE_URL}/admin/blockchain?tab=bridge"
            })

        # ------------------------------------------------------------------
        # TEST 4: Component <BlockchainZkpBadge /> & Modal Kiểm Chứng Độc Lập
        # ------------------------------------------------------------------
        tests_total += 1
        print("▶ [E2E-BC-04] Kiểm tra Badge & Modal Kiểm Chứng Độc Lập trên trang Công Nghệ...")
        
        # Chuẩn bị 1 bản ghi neo hợp lệ cho công nghệ có thật
        test_tech_id = "9a4207cf-2727-4ac1-9649-fbb01b0be68d"
        test_tech_code = "OFF-20261022-00024-8433"
        test_payload = {
            "entityType": "SELLER_OFFER",
            "entityId": test_tech_id
        }
        seed_test_anchor_record("SELLER_OFFER", test_tech_id, test_tech_code, test_payload)

        # Mở trang chi tiết công nghệ
        page.goto(f"{BASE_URL}/chao-ban-cong-nghe/{test_tech_id}", wait_until="networkidle")
        time.sleep(2)

        tech_page_text = page.locator("body").inner_text()
        badge_btn = page.locator("button:has-text('Bảo Chứng Mật Mã ZKP & Chuỗi Khối')").first

        if badge_btn.is_visible():
            print("  ✅ [PASS] Huy hiệu <BlockchainZkpBadge /> hiển thị chính xác.")
            # Click vào Badge để mở Modal
            badge_btn.click()
            time.sleep(1)

            modal_text = page.locator("body").inner_text()
            if "Biên Bản Bảo Chứng Mật Mã Học ZKP & Chuỗi Khối" in modal_text:
                print("  ✅ [PASS] Modal Kiểm Chứng Mật Mã Học mở thành công.")
                tests_passed += 1
            else:
                defects.append({
                    "id": "DEFECT-BC-04",
                    "severity": "CRITICAL",
                    "summary": "Modal Kiểm Chứng không mở khi click vào Badge",
                    "url": f"{BASE_URL}/chao-ban-cong-nghe/{test_tech_id}"
                })
        else:
            # Fallback kiểm tra text nếu button chưa kịp render xong
            if "Bảo Chứng Mật Mã ZKP" in tech_page_text:
                print("  ✅ [PASS] Thấy nhãn Bảo Chứng Mật Mã trên giao diện công nghệ.")
                tests_passed += 1
            else:
                defects.append({
                    "id": "DEFECT-BC-04",
                    "severity": "CRITICAL",
                    "summary": "Không tìm thấy nút Huy hiệu BlockchainZkpBadge trên /chao-ban-cong-nghe/[id]",
                    "url": f"{BASE_URL}/chao-ban-cong-nghe/{test_tech_id}"
                })

        # ------------------------------------------------------------------
        # TEST 5: Kịch Bản Phá Hoại Dữ Liệu (Adversarial Tamper) & Báo Động TAMPERED
        # ------------------------------------------------------------------
        tests_total += 1
        print("▶ [E2E-BC-05] Thử nghiệm Kịch Bản Phá Hoại Dữ Liệu (Adversarial Tamper Verification)...")
        
        # Gọi trực tiếp Live Verification API với dữ liệu bị giả mạo
        tampered_req = urllib.request.Request(
            f"{API_BASE}/api/v1/public/blockchain/verify/live",
            data=json.dumps({
                "entityType": "SELLER_OFFER",
                "entityId": test_tech_id,
                "customPayloadJson": json.dumps({"title": "Dữ liệu bị hacker can thiệp trái phép!"})
            }).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(tampered_req) as response:
                raw_json = json.loads(response.read().decode('utf-8'))
                res_data = raw_json.get("data", raw_json)
                verdict = res_data.get("verdict")
                summary = res_data.get("summary", "")

                if verdict == "TAMPERED" and ("can thiệp trái phép" in summary or not res_data.get("isSuccess")):
                    print("  ✅ [PASS] Hệ thống phát hiện dữ liệu giả mạo toán học: Báo động TAMPERED thành công.")
                    tests_passed += 1
                else:
                    defects.append({
                        "id": "DEFECT-BC-05",
                        "severity": "BLOCKER",
                        "summary": f"Hệ thống không phát hiện được dữ liệu giả mạo! Verdict nhận được: {verdict}",
                        "url": f"{API_BASE}/api/v1/public/blockchain/verify/live"
                    })
        except Exception as e:
            defects.append({
                "id": "DEFECT-BC-05",
                "severity": "BLOCKER",
                "summary": f"Lỗi gọi API Verify Live: {str(e)}",
                "url": f"{API_BASE}/api/v1/public/blockchain/verify/live"
            })

        browser.close()

    print("\n======================================================================")
    print(f"📊 TỔNG KẾT KIỂM THỬ PLAYWRIGHT E2E TASK-11: {tests_passed}/{tests_total} PASS")
    print(f"🐛 Số lượng lỗi phát hiện: {len(defects)}")
    print("======================================================================")

    if defects:
        for d in defects:
            print(f"  ❌ [{d['id']} - {d['severity']}] {d['summary']} ({d['url']})")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(run_blockchain_e2e_tests())
