# SA Analyze — TASK-05 Delta v11 / CR-2026-005

**Phạm vi đối soát:** Chỉ obligations của Delta v11 và bổ sung API-EXP-DIR-005; không đánh giá lại các Delta cũ.  
**Trạng thái Gate 2:** BLOCKED cho đến khi API-EXP-DIR-005 được triển khai và kiểm chứng.

| Chiều | Kết quả | Bằng chứng / gap |
| :--- | :--- | :--- |
| Spec → Plan | PASS sau bổ sung alias `query` | `REQ-EXP-DIR-001` ghi contract `query`; `API-EXP-DIR-005` giữ `q` tương thích và quy định ưu tiên; plan/DD cập nhật tương ứng |
| Plan → Tasks | PASS | T088–T098 bao phủ docs, dynamic taxonomy, scope filters, FE, consultation, tests, QC và traceability; T098 được thêm cho gap alias |
| Tasks → Spec | PASS theo phạm vi | Mỗi task ánh xạ tới REQ/BR/API/UI/NFR Delta v11; T098 ánh xạ API-EXP-DIR-005 |
| API/Data alignment | BLOCKED | Hiện controller chỉ bind `q`; contract cũ yêu cầu `query`. Cần alias tương thích trước Gate 4. DB không đổi schema; baseline ngành active vẫn cần đo trên PostgreSQL/API thật |

## PO course-correction

- Basic Design yêu cầu danh bạ tìm kiếm/lọc công khai, hồ sơ public/approved, giữ PII kín và có CTA kết nối; Delta v11 phù hợp mục tiêu đó.
- Quyết định PO là đếm ngành active thực nhận từ DB/API, baseline đã chuẩn hóa 10; không hardcode con số trong UI.
- UI/search implementation có sửa trước khi `wf-delta` bản mới được nạp; tài liệu CR, upstream Basic/Detail Design và living spec/plan/tasks hiện đã được đồng bộ ngược. Không mở rộng sang owner/admin/Zalo hay quy trình xử lý hậu tiếp nhận TASK-08.
- Phát hiện drift kỹ thuật có thể kiểm chứng: `query` trong contract so với `q` ở client/controller. Recovery: hỗ trợ cả hai, ưu tiên `q`, bổ sung test contract.

## Điều kiện mở lại Gate 2

- [ ] Implement `query` alias không phá vỡ `q`.
- [ ] Kiểm tra API contract và hồi quy sau khi QC test plan được PO duyệt theo quy trình.
- [ ] Xác minh dynamic sector count từ PostgreSQL/API chạy thật.
