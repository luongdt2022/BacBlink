# Hợp đồng API v2 — quy ước chung

Thư mục này đặc tả bộ endpoint `/api/v2/*`. **Chưa có endpoint nào tồn tại** (đo 2026-09-04: 0 trên 76 đường dẫn trong tài liệu OpenAPI, và probe trực tiếp trả 404). Mọi câu trong thư mục này là một **yêu cầu**, không phải một quan sát.

Đây là nút chặn của toàn bộ đợt làm việc: bảy năng lực backend đã có mã chạy được nhưng không có cửa HTTP, nên không màn hình mới nào code được cho tới khi thư mục này thành mã.

## Tài liệu này dùng để làm gì

Nó nói **người dùng cần gì từ máy chủ**, không nói schema JSON trông ra sao. Khi endpoint được viết, tài liệu OpenAPI sinh tự động là nguồn đúng cho schema; thư mục này vẫn là nguồn đúng cho hành vi: cái gì bị từ chối, vì sao, và người dùng thấy gì khi bị từ chối.

Ba thứ mỗi tài liệu ở đây phải trả lời cho từng endpoint:

1. **Ai gọi được** — vai trò nền tảng nào, vai trò trong hồ sơ nào, và cần cấp quyền đọc gì.
2. **Bị từ chối khi nào và với mã gì** — mã lỗi ổn định, vì giao diện phân nhánh theo mã chứ không theo câu chữ.
3. **Ghi lại cái gì** — dòng kiểm toán nào, sự kiện nào phát ra, việc nền nào được xếp hàng.

## Cái gì đã có sẵn và không phải xây lại

Ba middleware đã cắm vào pipeline và đã chờ sẵn. Endpoint v2 được hưởng chúng ngay khi ra đời, và **phải** thiết kế để sống với chúng:

| Cơ chế | Hành vi đã có |
|---|---|
| Khoá chống lặp | Thiếu `Idempotency-Key` trên mọi `POST`/`PUT`/`PATCH`/`DELETE` → **428**. Cùng khoá khác thân → **422**. Cùng khoá cùng thân → phát lại phản hồi cũ kèm `Idempotent-Replayed: true`. |
| Hình dạng lỗi | Mọi lỗi ngoài `/api/v1` tự động thành `application/problem+json` theo RFC 9457, kèm `correlationId`, và kèm `code` / `ruleId` / `currentVersion` / `errors` tuỳ loại lỗi. |
| Kiểm tra dữ liệu | Sai model tự động thành problem details 400 với `detail` là các thông điệp nối bằng `; `. |

Chi tiết đầy đủ ở [`../nen-tang/hop-dong-api.md`](../nen-tang/hop-dong-api.md). Không tài liệu nào trong thư mục này được đặt lại các quy tắc đó.

## Quy ước đặt đường dẫn

Danh từ số nhiều, gạch nối, không động từ trong đường dẫn trừ khi đó là một chuyển trạng thái không map được vào động từ HTTP:

```
GET    /api/v2/cases
POST   /api/v2/cases
GET    /api/v2/cases/{id}
POST   /api/v2/cases/{id}/transition          ← chuyển giai đoạn, không phải PATCH
POST   /api/v2/cases/{id}/holds
POST   /api/v2/cases/{id}/holds/{holdId}/release
GET    /api/v2/cases/{id}/timeline
```

Lý do dùng một đường dẫn riêng cho chuyển giai đoạn thay vì `PATCH` trường giai đoạn: chuyển giai đoạn cần lý do, mã lý do và diễn giải, và nó sinh một bản ghi quyết định. Nó là một hành động, không phải một phép gán.

## Phân trang

Giữ nguyên hình dạng của v1 để giao diện dùng lại được bộ phân trang:

```json
{ "data": [ … ], "total": 137, "page": 2, "limit": 20, "totalPages": 7 }
```

Không có `success: true` ở v2 — mã trạng thái HTTP đã nói điều đó. Trang bắt đầu từ 1, `limit` mặc định 20, tối đa 100.

> Ghi chú kỹ thuật: việc `limit` bị cắt xuống 100 một cách im lặng là hành vi có sẵn ở tầng dưới. v2 nên trả `limit` thật trong phản hồi (đã có trong hình dạng trên) để giao diện phát hiện được rằng nó không nhận đủ số dòng đã xin.

## Phiên bản và ghi có điều kiện

Bản ghi có tranh chấp trả `version` trong thân và `ETag` trong header. Lệnh ghi gửi lại số đó — trong thân request với tên `expectedVersion`, hoặc trong header `If-Match`.

Lệch → **409** với `code: "VERSION_CONFLICT"` và `currentVersion` là số hiện tại.

Bốn bản ghi cần cơ chế này: hồ sơ vụ việc, đề bài, tài sản công nghệ, hồ sơ môi giới. Ba bản ghi không cần vì không có tranh chấp thực tế: thông báo, sự kiện kiểm toán, ảnh chụp chính sách.

`ETag` đã nằm trong danh sách header mà cấu hình CORS cho trình duyệt đọc. Nó sẵn sàng.

## Mã lỗi ổn định

Giao diện phân nhánh theo `code`, không theo `detail`. Danh sách mã dùng chung:

| Mã | Mã trạng thái | Nghĩa |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Dữ liệu gửi lên không hợp lệ; xem `errors` |
| `UNAUTHORIZED` | 401 | Chưa đăng nhập, token hỏng hoặc hết hạn |
| `FORBIDDEN` | 403 | Đã đăng nhập nhưng bị chính sách chặn; xem `ruleId` |
| `NOT_FOUND` | 404 | Không tồn tại, hoặc người gọi không được biết là nó tồn tại |
| `CONFLICT` | 409 | Xung đột trạng thái |
| `VERSION_CONFLICT` | 409 | Lệch phiên bản; xem `currentVersion` |
| `UNPROCESSABLE` | 422 | Hiểu được nhưng luật nghiệp vụ từ chối |
| `RATE_LIMITED` | 429 | Quá giới hạn tần suất |

Mỗi module thêm mã riêng của nó, đặt tên theo luật bị vi phạm chứ không theo tầng kỹ thuật: `CASE_ON_HOLD`, `TRANSITION_NOT_ALLOWED`, `CAPACITY_EXCEEDED`. Danh sách đầy đủ nằm trong tài liệu của từng module.

## Không tồn tại và không được biết

Một luật xuyên suốt: khi người gọi không có quyền **đọc** một bản ghi, máy chủ trả **404**, không phải 403. Trả 403 sẽ tiết lộ rằng bản ghi đó tồn tại.

403 chỉ dùng khi người gọi *được phép biết bản ghi tồn tại* nhưng không được phép làm việc họ đang xin. Ví dụ: một bên tham gia hồ sơ vụ việc đọc được hồ sơ nhưng không chuyển giai đoạn được — đó là 403, kèm `ruleId`.

## Dòng kiểm toán

Mọi endpoint ghi dữ liệu ghi một dòng kiểm toán. Lượt bị chính sách từ chối cũng ghi, với kết quả `DENY` và mã quy tắc.

Dòng kiểm toán dùng **một giao dịch riêng**, không đi theo giao dịch của lệnh — cố ý, để dòng `DENY` không bị cuộn ngược cùng với ngoại lệ đã sinh ra nó. Hệ quả mà mọi endpoint v2 phải sống chung: **một lệnh thất bại vẫn để lại dòng kiểm toán**. Đặc tả của từng endpoint phải nói rõ nó ghi dòng nào ở đường thành công và dòng nào ở đường thất bại.

Endpoint chỉ đọc **không** ghi kiểm toán, trừ một ngoại lệ: đọc tài liệu mật trong phòng dữ liệu ghi một dòng kèm mục đích, vì đó là chỗ câu hỏi "ai đã xem cái này" cần có câu trả lời.

## Thứ tự xây

Xếp theo phụ thuộc, không theo độ khó:

1. **[`identity-va-nguoi-dung.md`](identity-va-nguoi-dung.md)** — mọi thứ khác cần định danh người gọi. Gồm cả việc bù `DELETE` người dùng mà v1 đang thiếu.
2. **[`policy-va-taxonomy.md`](policy-va-taxonomy.md)** — lĩnh vực và danh mục là dữ liệu tra cứu của gần như mọi màn hình.
3. **[`demand-va-technology.md`](demand-va-technology.md)** — hai loại nội dung chính, cộng lịch sử phiên bản và cổng chất lượng mà v1 không có.
4. **[`case-va-quyet-dinh.md`](case-va-quyet-dinh.md)** — lõi. Phần khó nhất.
5. **[`brokerage.md`](brokerage.md)** — phụ thuộc hồ sơ vụ việc.
6. **[`dataroom-va-cap-quyen.md`](dataroom-va-cap-quyen.md)** và **[`audit.md`](audit.md)** — một cặp. Cấp quyền đọc mà không tra được ai đã đọc gì thì không ai dám bật.
7. **[`matching.md`](matching.md)** — độc lập, nhưng cần sidecar nhúng BGE-M3 (cổng 8003) chạy. Chỉ mục tìm kiếm nằm trong PostgreSQL từ ADR-0010, không cần dịch vụ nào khác.
8. **[`content-va-communication.md`](content-va-communication.md)** — câu chuyện, lời mời, thông báo. Đã có bản v1 chạy được, nên chuyển sau cùng.

## Cái v2 phải giữ nguyên từ v1

Không phải mọi thứ đều đổi. Ba thứ cố tình giữ:

- **Hình dạng phân trang**, để giao diện dùng lại bộ phân trang.
- **Ngữ nghĩa "sai vai trò khi đăng nhập trả `INVALID_CREDENTIALS`"**, vì nó là một quyết định bảo mật chứ không phải một lỗi kế thừa.
- **Tên trạng thái** (`DRAFT`, `PUBLISHED`, `PROCESSING`, `COMPLETED`, `FAILED`), để dữ liệu di trú không phải dịch.

## Cái v2 phải sửa so với v1

- **Thông điệp kiểm tra dữ liệu bằng tiếng Anh.** Facade v1 tái tạo nguyên văn thông điệp của thư viện NestJS cũ. v2 không có nghĩa vụ đó và nên trả tiếng Việt.
- **`DELETE /admin/users/{id}` thiếu.** Xem [B-02](../bug-triage.md#b-02-xóa-người-dùng-trong-admin-trả-405).
- **Không có đường xem lịch sử phiên bản** dù dữ liệu phiên bản có đủ.
- **Không có đường đổi mức chất lượng** của tài sản công nghệ.
- **Không có đường khôi phục** bản ghi đã xoá mềm.

## Câu hỏi mở

- Chưa quyết `/api/v2` sống song song với `/api/v1` bao lâu, và ngày dừng dịch vụ v1 đặt vào đâu. Cấu hình đã có chỗ cho ngày đó; chưa biết nó đã được đặt ở môi trường nào chưa.
- Chưa quyết v2 có phục vụ luôn ba frontend hiện tại hay chỉ phục vụ màn hình mới trong lúc màn hình cũ ở lại v1 tới ngày dừng. Hai lựa chọn cho ra hai khối lượng công việc rất khác nhau — xem [`../xuyen-suot/di-tru-v1-sang-v2.md`](../xuyen-suot/di-tru-v1-sang-v2.md).
- Chưa quyết giao diện sinh `Idempotency-Key` theo quy tắc nào. Đây là quyết định phải chốt **trước** khi viết màn hình đầu tiên, vì nó ảnh hưởng tới cách nút gửi được viết ở mọi biểu mẫu.

Đặc tả — chưa có mã. Dựa trên SourceCode/nacentech, bản chụp ngày 2026-09-04.
