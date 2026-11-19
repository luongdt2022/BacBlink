#!/usr/bin/env bash
API=http://127.0.0.1:5199
J(){ PYTHONIOENCODING=utf-8 python -c "import sys,json;d=json.load(sys.stdin);$1"; }
code(){ curl -s -o /tmp/b -w "%{http_code}" "$@"; }
K(){ python -c 'import uuid;print(uuid.uuid4())'; }
S=$(date +%s)
reg(){ curl -s -X POST $API/api/v1/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"password\":\"Matkhau@123\",\"confirmPassword\":\"Matkhau@123\",\"firstName\":\"X\"}" >/dev/null; }

reg "qt$S@example.com"; reg "mg$S@example.com"
docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "UPDATE identity.persons SET is_active=true WHERE email LIKE '%$S@example.com'" >/dev/null
docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "UPDATE identity.persons SET platform_role='ADMIN' WHERE email='qt$S@example.com'" >/dev/null
TA=$(curl -s -X POST $API/api/v1/admin/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"qt$S@example.com\",\"password\":\"Matkhau@123\"}" | J "print(d['accessToken'])")
TB=$(curl -s -X POST $API/api/v1/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"mg$S@example.com\",\"password\":\"Matkhau@123\"}" | J "print(d['accessToken'])")
OWNER=$(docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "SELECT id FROM identity.persons WHERE email='qt$S@example.com'" | tr -d ' \r')
BROKER=$(docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "SELECT id FROM identity.persons WHERE email='mg$S@example.com'" | tr -d ' \r')
A=(-H "Authorization: Bearer $TA" -H 'Content-Type: application/json')   # quan tri vien = chu bai toan
B=(-H "Authorization: Bearer $TB" -H 'Content-Type: application/json')   # moi gioi chinh

ID=$(curl -s -X POST $API/api/v2/cases "${A[@]}" -H "Idempotency-Key: $(K)" \
  -d "{\"track\":\"CHALLENGE_PILOT\",\"title\":\"Ho so vong doi $S\",\"problemOwnerPersonId\":\"$OWNER\",\"demandBriefId\":\"$(K)\",\"demandBriefVersionNo\":1,\"confidentialityLevel\":\"CONFIDENTIAL\"}" | J "print(d['id'])")
echo "caseId=$ID  chu bai toan=${OWNER:0:8}  moi gioi=${BROKER:0:8}"

echo
echo "════ QUYEN theo vai tro TRONG HO SO, khong theo vai tro nen tang ════"
echo "  quan tri vien (chu bai toan) chuyen giai doan -> $(code -X POST $API/api/v2/cases/$ID/transition "${A[@]}" -H "Idempotency-Key: $(K)" -H 'If-Match: "0"' -d '{"toStage":"WITHDRAWN","decision":"WITHDRAW","reasonCodes":["X"],"rationale":"thu"}')  (mong doi 403 — dung thiet ke)"
cat /tmp/b | J "print('    ruleId =', repr(d.get('ruleId')))"

echo "  gan moi gioi chinh -> $(code -X POST $API/api/v2/cases/$ID/lead-broker "${A[@]}" -H "Idempotency-Key: $(K)" -H 'If-Match: "0"' -d "{\"brokerPersonId\":\"$BROKER\"}")  (mong doi 200)"
V=$(cat /tmp/b | J "print(d['version'])"); echo "    version=$V"

echo
echo "════ ADR-0008  loai quyet dinh cho tung dich ════"
echo "  WITHDRAWN + APPROVE (luat cu cho qua) -> $(code -X POST $API/api/v2/cases/$ID/transition "${B[@]}" -H "Idempotency-Key: $(K)" -H "If-Match: \"$V\"" -d '{"toStage":"WITHDRAWN","decision":"APPROVE","reasonCodes":["X"],"rationale":"thu"}')  (mong doi 422)"
cat /tmp/b | J "print('    code =', repr(d.get('code')))"
echo "  buoc tien thuong + WITHDRAW           -> $(code -X POST $API/api/v2/cases/$ID/transition "${B[@]}" -H "Idempotency-Key: $(K)" -H "If-Match: \"$V\"" -d '{"toStage":"QUALIFICATION","decision":"WITHDRAW","reasonCodes":["X"],"rationale":"thu"}')  (mong doi 422)"
cat /tmp/b | J "print('    code =', repr(d.get('code')))"

echo
echo "════ VER  lech phien ban -> 409, KHONG tao ban ghi quyet dinh ════"
BEFORE=$(docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "SELECT count(*) FROM casework.decision_records WHERE case_id='$ID'" | tr -d ' \r')
echo "  transition voi phien ban CU (0) -> $(code -X POST $API/api/v2/cases/$ID/transition "${B[@]}" -H "Idempotency-Key: $(K)" -H 'If-Match: "0"' -d '{"toStage":"QUALIFICATION","decision":"APPROVE","reasonCodes":["X"],"rationale":"thu"}')  (mong doi 409)"
cat /tmp/b | J "print('    code =', repr(d.get('code')), ' currentVersion =', d.get('currentVersion'))"
AFTER=$(docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "SELECT count(*) FROM casework.decision_records WHERE case_id='$ID'" | tr -d ' \r')
echo "    ban ghi quyet dinh: truoc=$BEFORE sau=$AFTER  (phai bang nhau)"

echo
echo "════ VONG DOI  chuyen giai doan that ════"
echo "  -> QUALIFICATION $(code -X POST $API/api/v2/cases/$ID/transition "${B[@]}" -H "Idempotency-Key: $(K)" -H "If-Match: \"$V\"" -d '{"toStage":"QUALIFICATION","decision":"APPROVE","reasonCodes":["DU_DIEU_KIEN"],"rationale":"da co moi gioi chinh"}')"
V=$(cat /tmp/b | J "print(d['version'])"); echo "    stage=$(cat /tmp/b | J "print(d['stage'])") version=$V"

echo
echo "════ HOLD  khoa mo chan moi chuyen giai doan ════"
echo "  mo khoa tam -> $(code -X POST $API/api/v2/cases/$ID/holds "${B[@]}" -H "Idempotency-Key: $(K)" -d '{"reason":"cho y kien phap che"}')"
V=$(cat /tmp/b | J "print(d['version'])"); HOLD=$(docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "SELECT id FROM casework.case_holds WHERE case_id='$ID' AND released_at IS NULL" | tr -d ' \r')
echo "    hasOpenHold=$(cat /tmp/b | J "print(d['hasOpenHold'])")"
echo "  transition khi con khoa -> $(code -X POST $API/api/v2/cases/$ID/transition "${B[@]}" -H "Idempotency-Key: $(K)" -H "If-Match: \"$V\"" -d '{"toStage":"MATCHING","decision":"APPROVE","reasonCodes":["X"],"rationale":"thu"}')  (mong doi 422)"
cat /tmp/b | J "print('    code =', repr(d.get('code')))"
echo "  go khoa -> $(code -X POST $API/api/v2/cases/$ID/holds/$HOLD/release "${B[@]}" -H "Idempotency-Key: $(K)" -d '{"rationale":"phap che da tra loi"}')"
V=$(cat /tmp/b | J "print(d['version'])")
echo "  transition lai -> $(code -X POST $API/api/v2/cases/$ID/transition "${B[@]}" -H "Idempotency-Key: $(K)" -H "If-Match: \"$V\"" -d '{"toStage":"MATCHING","decision":"APPROVE","reasonCodes":["OK"],"rationale":"da go khoa"}')"
cat /tmp/b | J "print('    stage =', d['stage'])"

echo
echo "════ DONG THOI GIAN ════"
curl -s "$API/api/v2/cases/$ID/timeline" "${B[@]}" | J "
for r in d: print('   ', r['fromStage'], '->', r['toStage'], '|', r['decision'], '|', r['rationale'][:35])"
