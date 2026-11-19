#!/usr/bin/env bash
# Đo B-27 trên bản chạy, lần đầu: tìm kiếm KHÔNG trả bản nháp của người khác — với sidecar BGE-M3 thật (8003),
# chỉ mục PostgreSQL (ADR-0010), chế độ CORRECTED_SCORING + kênh sparse. Cùng lượt đo B-45 (ngưỡng theo chế độ:
# v1 gửi minScore mặc định 2.0 mà kết quả vẫn có) và nhãn engine `postgres-16/pgvector-rrf3` trong nhật ký truy vấn.
#
# Điều kiện: API ở 5199 với Matching__ScoringMode=CORRECTED_SCORING Matching__UseSparse=true, worker trong tiến
# trình (mặc định), sidecar ở 8003, container nacentech-postgres-1 (ảnh pgvector).
set -u
API=http://127.0.0.1:5199
S=$(date +%s)
PASS='Matkhau@123'
psql() { docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "$1"; }
ok=0; fail=0
check() { if [ "$2" = "1" ]; then echo "  PASS  $1${3:+ — $3}"; ok=$((ok+1)); else echo "  FAIL  $1${3:+ — $3}"; fail=$((fail+1)); fi; }
reg() { curl -s -o /dev/null -X POST $API/api/v1/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"password\":\"$PASS\",\"confirmPassword\":\"$PASS\",\"firstName\":\"B27\"}"; psql "UPDATE identity.persons SET is_active=true WHERE email='$1'" >/dev/null; curl -s -X POST $API/api/v1/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"password\":\"$PASS\"}" | python -c 'import json,sys; print(json.load(sys.stdin)["accessToken"])'; }

A=$(reg "b27a$S@example.com"); B=$(reg "b27b$S@example.com"); C=$(reg "b27c$S@example.com")
PHRASE="màng lọc sinh học xử lý nước thải dệt nhuộm $S"

# A: bản NHÁP của người khác — chính thứ B-27 nói bị lộ. B: bản đã XUẤT BẢN, cùng nội dung.
DRAFT=$(curl -s -X POST $API/api/v1/my/intakes -H "Authorization: Bearer $A" --form-string type=ip --form-string "title=Nháp $S" --form-string "content=<p>$PHRASE. Bản nháp chưa công bố.</p>" | python -c 'import json,sys; d=json.load(sys.stdin); print(d.get("id") or d["data"]["id"])')
PUB=$(curl -s -X POST $API/api/v1/my/intakes -H "Authorization: Bearer $B" --form-string type=ip --form-string "title=Đã xuất bản $S" --form-string "content=<p>$PHRASE. Đã công bố.</p>" --form-string status=published | python -c 'import json,sys; d=json.load(sys.stdin); print(d.get("id") or d["data"]["id"])')
echo "draft=$DRAFT published=$PUB"
check "dàn dựng: hai bản ghi cùng nội dung, một nháp một đã xuất bản" $([ -n "$DRAFT" ] && [ -n "$PUB" ] && echo 1 || echo 0)
[ -z "$DRAFT" ] || [ -z "$PUB" ] && { echo "Dàn dựng hỏng — dừng."; exit 2; }

# Chờ việc nền chunk-embed (sidecar thật, CPU) đưa cả hai vào bản chiếu.
for i in $(seq 1 60); do
  N=$(psql "SELECT count(*) FROM matching.search_chunks WHERE subject_id IN ('$DRAFT','$PUB')")
  [ "$N" -ge 2 ] && break; sleep 3
done
check "cả hai bản ghi đã vào matching.search_chunks (sidecar thật + worker)" $([ "${N:-0}" -ge 2 ] && echo 1 || echo 0) "$N dòng sau $((i*3))s"
SPARSE=$(psql "SELECT count(*) FROM matching.search_chunks WHERE subject_id IN ('$DRAFT','$PUB') AND sparse IS NOT NULL")
check "cột sparse có giá trị (kênh từ vựng đã học của BGE-M3)" $([ "${SPARSE:-0}" -ge 2 ] && echo 1 || echo 0) "$SPARSE dòng"
PUBFLAG=$(psql "SELECT is_published FROM matching.search_chunks WHERE subject_id='$DRAFT' LIMIT 1")
check "bản nháp mang is_published=false trong bản chiếu" $([ "$PUBFLAG" = "f" ] && echo 1 || echo 0)

# C tìm kiếm — v1 gửi minScore mặc định 2.0 (thang cũ). Trước B-45, ở chế độ đã sửa kết quả LUÔN rỗng.
# Thân JSON đi qua tệp UTF-8: curl -d trên Git Bash/Windows làm hỏng tiếng Việt trong JSON.
printf '{"query":"%s","limit":10}' "$PHRASE" > /tmp/b27-q1.json
RES=$(curl -s -X POST $API/api/v1/search -H "Authorization: Bearer $C" -H 'Content-Type: application/json; charset=utf-8' --data-binary @/tmp/b27-q1.json)
echo "$RES" | cut -c1-300
HAS_PUB=$(echo "$RES" | grep -c "$PUB"); HAS_DRAFT=$(echo "$RES" | grep -c "$DRAFT")
check "B-27: bản đã xuất bản CÓ trong kết quả" $([ "$HAS_PUB" -ge 1 ] && echo 1 || echo 0)
check "B-27: bản nháp của người khác KHÔNG có trong kết quả" $([ "$HAS_DRAFT" -eq 0 ] && echo 1 || echo 0)
check "B-45: chế độ đã sửa có kết quả dù v1 gửi ngưỡng thang cũ" $([ "$HAS_PUB" -ge 1 ] && echo 1 || echo 0)
LOG=$(psql "SELECT engine_version || ' ' || scoring_mode || ' min=' || min_score FROM matching.search_query_logs ORDER BY created_at DESC LIMIT 1")
check "nhật ký truy vấn ghi engine rrf3 + ngưỡng thật 0" $(echo "$LOG" | grep -q "postgres-16/pgvector-rrf3 CORRECTED_SCORING min=0" && echo 1 || echo 0) "$LOG"

# Tiếng Việt không dấu — ca §26.6.1 — trên mô hình thật.
printf '{"query":"mang loc sinh hoc nuoc thai det nhuom %s","limit":10}' "$S" > /tmp/b27-q2.json
RES2=$(curl -s -X POST $API/api/v1/search -H "Authorization: Bearer $C" -H 'Content-Type: application/json; charset=utf-8' --data-binary @/tmp/b27-q2.json)
check "không dấu vẫn tìm thấy bản đã xuất bản (unaccent + sparse + dense)" $([ "$(echo "$RES2" | grep -c "$PUB")" -ge 1 ] && echo 1 || echo 0)

echo; echo "════ TỔNG: $ok đạt, $fail hỏng ════"
[ "$fail" -eq 0 ]
