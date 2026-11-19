# Detail Design — TASK-05 Expert Directory Delta v11

**CR:** [`CR-2026-005`](../change-requests/CR-2026-005-task05-directory-search.md)  
**Living spec:** [`spec.md`](../../specs/TASK-05_HO_SO_CHUYEN_GIA_KHCN/spec.md), mục 14.  
**Breaking change:** Không.

## API contracts

### API-EXP-DIR-002 — Public directory

`GET /api/v1/public/experts`

| Query | Kiểu | Ý nghĩa |
| :--- | :--- | :--- |
| `q` / `query` | string? | Tìm trong các trường public được phép; giữ `q` tương thích client hiện hữu và nhận thêm `query` theo contract trước đây; nếu cùng gửi cả hai, `q` ưu tiên |
| `degree` | string? | Lọc học vị |
| `sectorCode` | string? | Mã taxonomy ngành; kết quả chỉ khớp expertise sector |
| `provinceCode` | string? | Mã tỉnh đã xác thực; kết quả theo Person province scope |
| `acceptingConsultation` | bool? | Lọc trạng thái sẵn sàng tư vấn |
| `page`, `pageSize` | int | Phân trang; query cũ tiếp tục tương thích |

Response chỉ gồm expert public projection đã approved; không chứa CCCD, số điện thoại riêng hoặc email riêng.

### API-EXP-DIR-003 — Public province options

`GET /api/v1/governance/org-units/public-provinces`

Trả danh sách `{ code, name, region }` tối thiểu cho lựa chọn địa bàn. Không trả email, thông tin quản trị hay thống kê vận hành.

### API-EXP-DIR-004 — Consultation request

`POST /api/v1/public/experts/{expertCode}/consultation-requests`

Tái sử dụng endpoint hiện hữu. Client chỉ thông báo tiếp nhận sau response thành công theo contract hiện hành; copy nêu NacenTech/admin là đầu mối tiếp nhận/điều phối. Không bao gồm quy trình xử lý nhu cầu/cơ hội hậu tiếp nhận của TASK-08.

## Data contract

- Ngành: `GET /api/v1/sectors` là nguồn runtime; chỉ active taxonomy được trả về mới được hiển thị/đếm. Mười mã LV trong migration là baseline seed, không phải giới hạn hardcode tại client.
- Tỉnh: directory service dùng scope tỉnh được duyệt của Person. Profile không có scope thì không khớp bộ lọc tỉnh.
- DB: không thêm/sửa schema hay migration trong CR này.
- FE: gọi qua SDK dùng chung `frontend/src/lib/master-data-client.ts`; UI không hardcode danh sách sector/province.

## Surface and regression

| Surface | Contract/check |
| :--- | :--- |
| `/experts` | Filters, taxonomy count, pagination, 5 UX states, compact responsive UI, CTA |
| `/chuyen-gia` | Alias continues to render/navigate to directory |
| `/experts/[expertCode]` | Card destination and public projection regression |
| Owner/Admin/Zalo | No functional change; full relevant regression only |

Build/API/DB conformance is pending; do not treat this document as runtime evidence.


## Delta v12 — taxonomy ngành động toàn hệ thống

`GET /api/v1/sectors` là nguồn active-sector duy nhất cho các UI options, labels và counts. Client không có static fallback. Admin writes qua `POST /api/v1/master-data/sectors`; ngành tạo mới xuất hiện sau response thành công. Nâng hạng lưu taxonomy code; CV parser nhận option code/name runtime. `/api/v1/master-data/tt17` đọc active taxonomy `CATEGORY`. Matrix mapping vẫn là cấu hình tương thích riêng; `fieldName` được resolve theo code DB hiện hành, unknown code chỉ hiện code và không được tính như ngành active.

Cross-surface bao phủ Home, directory/detail, upgrade/CV, admin sector/category/matrix, admin sector RBAC scope, login, GOV và dashboard/nav. API empty/error phải hiện empty/error; không dùng static list/count.


### Cross-channel audit v12 - Zalo

Quick-intake consumes active SECTOR taxonomy through GET /api/v1/sectors. Remove the fixed 18-sector list and default code 01; require explicit selection, show loading/empty/error with retry, reject inactive codes before submit. Preserve the endpoint/payload. Task T108 remains open until verified.

### Delta v12 — đồng bộ quyết định thẩm định

- Grounding: TASK-05 User Story 3/REQ-EXP-DB-004 và TASK-07 FR-ADM-008/009: quyết định EXPERT phải cập nhật đồng thời yêu cầu, ExpertProfile và role trong cùng UnitOfWork; không chỉ cấp role.
- Identity sử dụng port Kernel `IExpertApprovalSynchronizer`; Brokerage cung cấp adapter, không tham chiếu chéo assembly module. Adapter chỉ thay đổi aggregate đang tracked và không commit. Payload xác định đúng profile Id và PersonId; thiếu/lệch profile chặn toàn bộ quyết định.
- APPROVE: `ExpertProfile.Approve`; giữ visibility lựa chọn owner. REJECT/REQUEST_CHANGES/REVOKE: gọi domain method tương ứng, tắt public listing khi rút trạng thái approved. Revoke hạ role như hợp đồng hiện có.
- Approval API chỉ cho cán bộ quản trị theo role/scope; scope không hợp lệ hoặc thiếu Id phải deny, CLUSTER_ADMIN chỉ sơ kiểm/forward.


### Runtime taxonomy admin CRUD and validation

GET master-data/sectors includes the persisted term id, code/name/status and stored metadata. Create returns the persisted DTO, not an echo of request flags. Rename uses existing PATCH /api/v1/admin/sectors/{id} (name only); deactivate uses existing DELETE and retains history. New expert upgrade/quick-intake sector codes must exist in the active taxonomy. Approval audit access requires the same actor scope as the approval itself.


### Canonical central-admin facade guard

Legacy RequireAdmin must accept ADMIN, SUPER_ADMIN and OPERATOR_ADMIN only when actor scope is GLOBAL with no scope id. This matches the existing ADMIN_MANAGE policy; it does not grant province/sector actors global CRUD. Cross-surface regression covers all inheriting V1 admin controllers. QC observed real signed SuperAdmin create failing 403 before this correction.

## Delta v13 — persisted Zalo draft handoff (2026-10-08)

US06/BR-EXP-009/015/017 and REQ-EXP-INT-003 require a real GET `/api/v1/experts/draft?token=...` projection and official submission of the original draft, preserving its active industry code. Token format is cryptographically random nonce + expiry + HMAC-SHA256 signature with purpose-separated key derived from configured Auth:SigningKey. TTL exactly72h from IClock; database magic_link_token column stores SHA256 hash only. Existing unsigned/raw stored tokens are invalid. GET does not consume; expired/tampered/unknown/consumed returns401 ERR_MAGIC_LINK_EXPIRED without disclosing existence. Response no-store and noPII beyond intake-owner fields; no CCCD/document storage paths/token/hash returned. Web reads persisted fields only; no AI completion claims when pipeline absent. Magic URL uses configured Auth:FrontendUrl.

Authenticated POST upgrade-request accepts optional draftToken. Host opens a transaction covering profile+approval commits; lock draft by hash before claim; preserve draftId/evidence, validate submission and consume hash/TTL atomically only on successful official submission. Errors roll back claim and preserve token. Profile owner checks prohibit relinking another user's draft. New draft status DRAFT; existing schema retained. Rate limiter protects anonymous draft reads. Developer realDB cases cover hash persistence, expiry/tampering/reuse, originalId claim and validation failure without consumption. Full ingestion/ZNS remains independently unimplemented and cannot be signed off as completed.

### Delta v12 — không mất từ khóa chuyên sâu

Grounding: TASK-05 spec v12 quy định specialized keywords tách khỏi ngành; Tags/CV hiện hữu không được gửi vào ExpertiseSectors. Contract thêm optional `specializedKeywords` (string array), lưu riêng `brokerage.expert_profiles.specialized_keywords` PostgreSQL text[]; backfill rỗng, không suy đoán từ sector data lịch sử. Domain trim/bỏ rỗng/deduplicate, không diễn giải từ khóa thành mã taxonomy. Owner/draft/admin/public projection giữ mảng riêng; search có thể tìm từ khóa chuyên môn đã công khai cùng các trường hiện hữu. Migration additive duy nhất cột này; không đổi sector schema.

Filename-only legacy POST `/experts/ai-cv-scan` returns501 `{success:false,code:"AI_CV_SCAN_UNAVAILABLE"}`. It cannot deriveCVfieldsfromfilename and no longer returns fabricated names/industries. Actual WebCVparser continues to submit filecontentto its configuredAIprovider. DraftGET sets Referrer-Policy:no-referrer.
