# ADR-0004: Quy tắc sinh `Idempotency-Key` ở phía client

- Trạng thái: ACCEPTED
- Ngày: 2026-09-04 (đề xuất và chốt)
- Liên quan: §22.1; sổ lỗi `docs-v2/bug-triage.md` B-06; đặc tả `docs-v2/api-v2/README.md`

## Bối cảnh

`IdempotencyMiddleware` đã cắm vào pipeline và bắt buộc header `Idempotency-Key` cho mọi `POST`, `PUT`,
`PATCH`, `DELETE` trên `/api/v2`. Hành vi đã có mã:

| Tình huống | Kết quả |
|---|---|
| Thiếu header | **428 Precondition Required** |
| Cùng khoá, cùng thân request | Phát lại phản hồi đã lưu kèm `Idempotent-Replayed: true`, **không thực thi lại** |
| Cùng khoá, thân request khác | **422 Unprocessable Entity** |

Ba chi tiết đổi cách viết mã ở client, và cả ba đã có trong bản cài đặt:

- Khoá bị **cắt còn 200 ký tự**. Hai khoá chỉ khác nhau sau ký tự thứ 200 bị coi là một.
- Khoá có **phạm vi theo người dùng**, nên hai người dùng cùng một chuỗi khoá không đụng nhau.
- Phản hồi **5xx không được ghi lại**; phản hồi **4xx thì có**. Gửi lại sau lỗi máy chủ là thật sự thử lại;
  gửi lại sau một lần bị 403 sẽ nhận lại đúng 403 kể cả khi quyền đã được cấp trong lúc đó.

Hiện **không client nào** sinh khoá này. Vì `/api/v2` chưa có endpoint nào, cơ chế chưa từng kích hoạt. Ngày
endpoint v2 đầu tiên ra đời, mọi lệnh ghi từ ba frontend sẽ trả 428 cho tới khi có quy tắc.

Quyết định này phải ra **trước** khi viết màn hình v2 đầu tiên, vì nó đổi cách viết nút gửi ở mọi biểu mẫu.

## Quyết định

1. **Một khoá cho mỗi lần bấm nút, không phải mỗi lần gọi.** Khoá được sinh tại thời điểm người dùng khởi
   động một thao tác và được giữ nguyên cho mọi lần thử lại của chính thao tác đó — thử lại tự động khi mất
   mạng, thử lại thủ công sau khi người dùng bấm lại nút "Thử lại" của cùng hộp thoại.
2. Sinh khoá mới khi và chỉ khi người dùng **bắt đầu một thao tác mới**: mở lại hộp thoại, sửa dữ liệu rồi
   gửi lại như một lệnh khác.
3. Khoá là một định danh ngẫu nhiên thuần, **không ghép từ nội dung**. Không nối đường dẫn, tham số hay dấu
   thời gian — đó là cách tạo ra hai khoá chỉ khác nhau ở phần đuôi và bị cắt thành một.
4. Bộ chặn HTTP dùng chung của mỗi client chịu trách nhiệm gắn header; màn hình chỉ cung cấp khoá. Màn hình
   không được tự gắn header, để không có chỗ nào quên.
5. Nhận `Idempotent-Replayed: true` được đối xử như **thành công**, không phải như một trường hợp lạ. Người
   dùng không cần biết lệnh của họ đã được phát lại.

## Hệ quả

- Một lệnh gửi bị gián đoạn giữa chừng — mất mạng, đóng tab, tải lại — không tạo ra hai bản ghi. Đây là lý do
  cơ chế tồn tại, và nó chỉ hoạt động nếu luật 1 được giữ.
- **Sinh khoá mới ở mỗi lần thử lại làm mất hết ý nghĩa của cơ chế.** Đây là cái bẫy dễ rơi nhất, vì thư viện
  HTTP thường sinh lại mọi thứ ở lần thử lại.
- Phát lại một lỗi 4xx cần một lối thoát ở giao diện: nếu người dùng bị 403 rồi được cấp quyền, họ phải **bắt
  đầu lại thao tác** để có khoá mới. Câu chữ ở màn hình phải nói điều đó, nếu không họ sẽ bấm lại và tưởng
  quyền chưa được cấp.
- Bộ chặn của cả ba client phải sửa cùng lúc với hai cơ chế còn lại của v2 (`If-Match` và bộ dịch problem
  details). Wire lẻ một cái thì hai cái kia vẫn chặn màn hình đầu tiên — xem B-06.

## Cổng done

Một test ở client khẳng định: hai lần thử lại của cùng một lần bấm gửi **cùng một** giá trị header; và một
lần bấm mới sinh giá trị khác.

## Đã cài đặt

Ngày 2026-09-04, ở **cả hai** client có lệnh ghi.

| Quyết định | Bảng quản trị | Cổng người dùng |
|---|---|---|
| 1, 2, 3 — một khoá mỗi lần bấm, ngẫu nhiên thuần | `src/lib/api/idempotency.ts` | `src/services/api/idempotency.ts` |
| 4 — bộ chặn gắn header, màn hình không tự gắn | `src/lib/api/client.ts` | `src/services/api/client.ts` |
| Cổng done | `src/lib/api/__tests__/idempotency.test.ts` | `src/services/api/__tests__/idempotency.test.ts` |

Hai repo trước đó **không có framework test nào** — `npm test` không tồn tại, dù `CLAUDE.md` của chúng nói có.
Đã thêm `vitest` (bản 3.x, vì bản 5 đòi `vite ≥ 6.4` còn hai repo đang ở 6.3.5) và script `test`. **19 bài mỗi
repo**, tất cả xanh.

Cổng done chạy thêm hai điều kiện mà bản đề xuất chưa nêu, và cả hai đến từ chi tiết đã đo của máy chủ: khoá
phải phân biệt được **sau khi bị cắt còn 200 ký tự**, và khoá không được mang dấu vết của nội dung lệnh.

### Ghi chú về hai cơ chế đi kèm

Luật 5 (phát lại được đối xử như thành công) **đã đo được** ngày 2026-09-04, ở `POST /api/v2/cases` — lệnh
ghi v2 đầu tiên. Thiếu khoá → 428; lần đầu → 201; cùng khoá cùng thân → **201 kèm `Idempotent-Replayed: true`**,
cùng định danh hồ sơ, và **đúng một hàng** trong cơ sở dữ liệu; cùng khoá khác thân → 422.

`If-Match` nay **được máy chủ đọc thật** (B-40, sửa cùng ngày theo lựa chọn (a)), và `ETag` được phát ở mọi
đường đọc bản ghi có tranh chấp. Khi cả header lẫn trường `expectedVersion` cùng có mặt: khớp nhau thì lấy,
lệch nhau thì từ chối — không ưu tiên đường nào.
