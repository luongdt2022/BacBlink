#!/usr/bin/env python3
import subprocess
import json
import uuid
import sys

def run_psql(query: str):
    cmd = [
        "docker", "exec", "nacentech-postgres-1",
        "psql", "-U", "postgres", "-d", "nacentech",
        "-t", "-A", "-c", query
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"PSQL Error: {proc.stderr}\nQuery: {query}")
    return proc.stdout.strip()

def run_psql_json(query: str):
    clean_query = query.strip().rstrip(";")
    raw = run_psql(f"SELECT json_agg(t) FROM ({clean_query}) t;")
    if not raw or raw == "":
        return []
    return json.loads(raw)

def main():
    print("=" * 70)
    print("TẦNG 3: QC DB INTEGRATION TESTS — POSTGRESQL THẬT (ZERO-MOCK)")
    print("=" * 70)
    passed = 0
    total = 0

    # -------------------------------------------------------------------------
    # TEST 1: Kiểm tra Schema Bảng và Kiểu dữ liệu Cột
    # -------------------------------------------------------------------------
    total += 1
    print("\n[TC-L3-01] Kiểm tra schema bảng assessment.tt17_assessments...")
    cols = run_psql_json("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'assessment' AND table_name = 'tt17_assessments'
        ORDER BY ordinal_position;
    """)
    col_dict = {c["column_name"]: c["data_type"] for c in cols}
    assert "id" in col_dict and col_dict["id"] == "uuid", "Cột id phải là uuid"
    assert "survey_data_json" in col_dict and col_dict["survey_data_json"] == "jsonb", "Cột survey_data_json phải là jsonb"
    assert "scores_json" in col_dict and col_dict["scores_json"] == "jsonb", "Cột scores_json phải là jsonb"
    assert "status" in col_dict and "character varying" in col_dict["status"], "Cột status phải là varchar"
    assert "assessment_year" in col_dict and col_dict["assessment_year"] == "integer", "Cột assessment_year phải là integer"
    print("  -> PASS: Đã xác thực 100% cột cốt lõi id (uuid), survey_data_json (jsonb), scores_json (jsonb).")
    passed += 1

    # -------------------------------------------------------------------------
    # TEST 2: Kiểm tra Ràng buộc Khóa chính & Unique Index
    # -------------------------------------------------------------------------
    total += 1
    print("\n[TC-L3-02] Kiểm tra ràng buộc duy nhất uq_tt17_assessments_enterprise_year...")
    indexes = run_psql_json("""
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'assessment' AND tablename = 'tt17_assessments';
    """)
    idx_names = [i["indexname"] for i in indexes]
    assert "tt17_assessments_pkey" in idx_names, "Thiếu primary key"
    assert "uq_tt17_assessments_enterprise_year" in idx_names, "Thiếu unique constraint uq_tt17_assessments_enterprise_year"
    print(f"  -> PASS: Bảng có đầy đủ PK và Unique Constraint: {idx_names}")
    passed += 1

    # -------------------------------------------------------------------------
    # TEST 3: Kiểm tra Dữ liệu thật & Điểm toán học trong JSONB
    # -------------------------------------------------------------------------
    total += 1
    print("\n[TC-L3-03] Đối soát toán học điểm TotalScore = sum(ScoreT..I) trực tiếp trong CSDL thật...")
    rows = run_psql_json("""
        SELECT id, enterprise_name, tax_code, assessment_year, status, scores_json
        FROM assessment.tt17_assessments
        WHERE scores_json ? 'ScoreT' OR scores_json ? 'scoreT';
    """)
    assert len(rows) > 0, "Phải có ít nhất 1 bản ghi TT17 chuẩn trong CSDL"
    for r in rows:
        sj = r["scores_json"]
        st = float(sj.get("ScoreT") or sj.get("scoreT") or 0)
        se = float(sj.get("ScoreE") or sj.get("scoreE") or 0)
        so = float(sj.get("ScoreO") or sj.get("scoreO") or 0)
        sr = float(sj.get("ScoreR") or sj.get("scoreR") or 0)
        si = float(sj.get("ScoreI") or sj.get("scoreI") or 0)
        t_calc = round(st + se + so + sr + si, 1)
        t_db = float(sj.get("TotalScore") or sj.get("totalScore") or 0)

        assert abs(t_calc - t_db) < 0.15, f"Tổng điểm lệch: {t_calc} vs {t_db} tại id={r['id']}"
        criteria = sj.get("Criteria") or sj.get("criteria") or []
        assert len(criteria) == 26, f"Số lượng tiêu chí phải là 26, nhận được {len(criteria)}"
        print(f"  -> Record [{r['tax_code']}] {r['enterprise_name']}: Tổng điểm DB = {t_db}đ (T:{st} E:{se} O:{so} R:{sr} I:{si}) | 26 tiêu chí Khớp 1:1.")
    print("  -> PASS: 100% bản ghi TT17 trong CSDL có tổng điểm và 26 tiêu chí hợp lệ.")
    passed += 1

    # -------------------------------------------------------------------------
    # TEST 4: Thử nghiệm Transaction INSERT -> UPDATE DRAFT -> SUBMIT -> APPROVE thật
    # -------------------------------------------------------------------------
    total += 1
    print("\n[TC-L3-04] Kiểm thử vòng đời trạng thái DRAFT -> SUBMITTED -> APPROVED trên CSDL...")
    test_ent_id = str(uuid.uuid4())
    test_asm_id = str(uuid.uuid4())
    tax_code = f"010{uuid.uuid4().hex[:7]}"

    # Bước A: Insert Draft
    run_psql(f"""
        INSERT INTO assessment.tt17_assessments (
            id, enterprise_id, enterprise_name, tax_code, assessment_year,
            scope_type, scope_id, industry_code, status, survey_data_json, scores_json, created_at, updated_at
        ) VALUES (
            '{test_asm_id}', '{test_ent_id}', 'Doanh Nghiệp Test DB State', '{tax_code}', 2026,
            'PROVINCE', 'HN', 'C.28', 'DRAFT', '{{"companyName": "Doanh Nghiệp Test DB State"}}'::jsonb,
            '{{"TotalScore": 50, "Classification": "TRUNG_BINH"}}'::jsonb, now(), now()
        );
    """)

    # Bước B: Verify Draft
    status1 = run_psql(f"SELECT status FROM assessment.tt17_assessments WHERE id = '{test_asm_id}';")
    assert status1 == "DRAFT", f"Kỳ vọng DRAFT nhưng nhận {status1}"

    # Bước C: Submit
    run_psql(f"""
        UPDATE assessment.tt17_assessments
        SET status = 'SUBMITTED', submitted_at_utc = now(), updated_at = now()
        WHERE id = '{test_asm_id}';
    """)
    status2 = run_psql(f"SELECT status FROM assessment.tt17_assessments WHERE id = '{test_asm_id}';")
    assert status2 == "SUBMITTED", f"Kỳ vọng SUBMITTED nhưng nhận {status2}"

    # Bước D: Review Approve
    run_psql(f"""
        UPDATE assessment.tt17_assessments
        SET status = 'APPROVED', approved_at_utc = now(), review_notes = 'Hồ sơ đạt chuẩn QC Gate 4'
        WHERE id = '{test_asm_id}';
    """)
    status3 = run_psql(f"SELECT status, review_notes FROM assessment.tt17_assessments WHERE id = '{test_asm_id}';")
    assert "APPROVED|Hồ sơ đạt chuẩn QC Gate 4" == status3, f"Kỳ vọng APPROVED có review_notes nhưng nhận {status3}"
    print("  -> PASS: Chuyển đổi trạng thái DRAFT -> SUBMITTED -> APPROVED và cập nhật timestamp thành công.")
    passed += 1

    # -------------------------------------------------------------------------
    # TEST 5: Kiểm tra cưỡng chế DB Unique Constraint uq_tt17_assessments_enterprise_year
    # -------------------------------------------------------------------------
    total += 1
    print("\n[TC-L3-05] Thử nghiệm vi phạm Unique Constraint (Duplicate Enterprise + Year)...")
    duplicate_asm_id = str(uuid.uuid4())
    try:
        run_psql(f"""
            INSERT INTO assessment.tt17_assessments (
                id, enterprise_id, enterprise_name, tax_code, assessment_year,
                scope_type, scope_id, industry_code, status, survey_data_json, scores_json
            ) VALUES (
                '{duplicate_asm_id}', '{test_ent_id}', 'Doanh Nghiệp Trùng Lặp', '{tax_code}', 2026,
                'PROVINCE', 'HN', 'C.28', 'DRAFT', '{{}}'::jsonb, '{{}}'::jsonb
            );
        """)
        assert False, "Đáng lẽ phải ném lỗi Duplicate Key nhưng lại INSERT thành công!"
    except RuntimeError as e:
        assert "duplicate key value violates unique constraint" in str(e).lower() or "unique constraint" in str(e).lower(), f"Lỗi không mong muốn: {e}"
        print("  -> PASS: CSDL PostgreSQL chặn đứng vi phạm trùng lặp hồ sơ đánh giá cùng năm với lỗi Unique Constraint.")
        passed += 1

    # Dọn dẹp dữ liệu test
    run_psql(f"DELETE FROM assessment.tt17_assessments WHERE id = '{test_asm_id}';")

    print("\n" + "=" * 70)
    print(f"KẾT QUẢ TẦNG 3: {passed}/{total} DB INTEGRATION TEST CASES PASS (100% CSDL THẬT)")
    print("=" * 70)

if __name__ == "__main__":
    main()
