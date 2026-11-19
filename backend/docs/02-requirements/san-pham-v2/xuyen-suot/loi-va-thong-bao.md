# Lỗi và thông báo

## Tóm tắt

Khi một việc hỏng, người dùng NacenTech ĐMST thấy một trong ba thứ: một câu tiếng Việt viết cứng trong giao diện không liên quan gì tới lỗi thật, một câu tiếng Anh do máy chủ gửi, hoặc không thấy gì cả. Cái họ gần như không bao giờ thấy là câu mà máy chủ thực sự viết cho họ.

Nguyên nhân nằm ở hai chỗ. Thứ nhất, máy chủ nói bằng **ba hình dạng lỗi khác nhau** tuỳ đường dẫn và tuỳ loại lỗi, và trường chứa câu để hiển thị đổi tên giữa chúng. Thứ hai, cả ba client đều rút thông điệp theo đúng một cách — đọc trường `message` — rồi phần lớn màn hình vứt nó đi và hiện một câu của riêng mình.

Các con số và hình dạng chuẩn thuộc [`../nen-tang/hop-dong-api.md`](../nen-tang/hop-dong-api.md). Tài liệu này nói về cái người dùng nhìn thấy.

## Ba hình dạng máy chủ đang gửi

### Hình dạng A — mười hai mã xác thực legacy

```json
{ "code": "INVALID_CREDENTIALS", "message": "…" }
```

Chỉ dùng cho 12 mã liên quan tới đăng nhập, đăng ký, kích hoạt và mật khẩu. Đây là hình dạng duy nhất mang một **mã máy đọc được** ở chỗ dễ tìm, và nó là hình dạng duy nhất một client đang khai thác đúng cách.

### Hình dạng B — mọi lỗi v1 còn lại

```json
{ "statusCode": 403, "message": "Admin access required", "error": "Forbidden" }
```

Trường `message` ở đây là **một chuỗi hoặc một mảng chuỗi**, và điều gì quyết định nó là chuyện nội bộ của máy chủ mà client không đoán được:

| Lỗi đến từ đâu | `message` là gì |
|---|---|
| Kiểm tra dữ liệu ở tầng khai báo (kiểu sai, thiếu trường, email sai định dạng) | **Luôn là mảng**, kể cả khi chỉ có một lỗi |
| Kiểm tra dữ liệu ở tầng nghiệp vụ với đúng một lỗi | Một chuỗi |
| Kiểm tra dữ liệu ở tầng nghiệp vụ với nhiều lỗi | Mảng |
| Mọi lỗi khác | Một chuỗi |

Một giao diện nhận `message` rồi đưa thẳng vào chỗ chờ một câu sẽ hiển thị sai ở nhóm thứ nhất và thứ ba — và nhóm thứ nhất là nhóm thường gặp nhất, vì nó là mọi lỗi biểu mẫu.

### Hình dạng C — problem details của v2

```json
{
  "status": 409,
  "title": "Conflict",
  "detail": "Bản ghi đã bị thay đổi bởi một yêu cầu khác. Tải lại và thử lại.",
  "instance": "/api/v2/cases/…/transition",
  "correlationId": "0HN7…",
  "code": "VERSION_CONFLICT",
  "currentVersion": 7
}
```

Bốn khác biệt có hậu quả trực tiếp lên giao diện:

1. **Câu để hiển thị nằm ở `detail`, không phải `message`.** Không có trường `message` nào trong hình dạng này.
2. **Danh sách lỗi từng trường nằm ở `errors`**, không phải ở `message` dạng mảng.
3. **`correlationId` luôn có.** Đây là chuỗi người dùng đọc cho bộ phận hỗ trợ, và không giao diện nào hiện nay có chỗ để hiện nó.
4. **`ruleId` xuất hiện khi bị chính sách chặn** và `currentVersion` khi lệch phiên bản. Hai trường này là thứ cho phép giao diện nói một câu cụ thể thay vì một câu chung.

> Ghi chú kỹ thuật: hai lỗi của cơ chế khoá chống lặp — thiếu khoá (428) và cùng khoá khác thân (422) — được sinh trong middleware chứ không qua đường tạo thân lỗi thông thường, nên thân của chúng là chuỗi viết cứng và **không có `correlationId`**. Chúng cũng là hai thông điệp lỗi hiếm hoi của máy chủ viết bằng tiếng Việt sẵn.

## Ba client đọc lỗi thế nào

### Bảng quản trị

Một hàm duy nhất rút thông điệp, và nó chỉ nhìn vào một chỗ:

- Nếu thân lỗi có `message` là chuỗi thì lấy chuỗi đó.
- Nếu không thì lấy thông điệp mặc định của thư viện HTTP — `"Request failed with status code 409"`.

Với hình dạng C, `message` không tồn tại, nên **mọi lỗi v2 sẽ rơi về câu tiếng Anh mặc định của thư viện**, kể cả khi máy chủ gửi một câu tiếng Việt đầy đủ trong `detail`. Đây là hỏng hóc chắc chắn xảy ra ở lời gọi v2 đầu tiên.

Với hình dạng B và `message` là mảng, hàm này trả về mảng ở chỗ mã đang khai báo một chuỗi. Xem [B-08](../bug-triage.md#b-08-thông-điệp-lỗi-nhiều-trường-là-mảng-client-đối-xử-như-chuỗi).

Sau bước rút, mã trạng thái bị mất ở một số đường: hai tệp dịch vụ bọc lỗi lại thành một lỗi thường chỉ mang thông điệp, ba tệp còn lại thì không. Nghĩa là **cùng một mã trạng thái 409 hiện ra khác nhau tuỳ màn hình nào gọi**.

### Cổng người dùng

Bộ chặn phản hồi của cổng làm một việc quyết liệt hơn: nó **thay toàn bộ ngoại lệ bằng một lỗi thường chỉ mang thông điệp**. Sau bộ chặn, không màn hình nào còn nhìn thấy mã trạng thái, thân lỗi, hay header. Đây là lý do gốc khiến cổng không có nhánh 401 nào — không phải vì ai quên viết, mà vì không còn gì để rẽ nhánh.

Luồng xác thực là ngoại lệ, và nó là chỗ làm đúng nhất trong cả ba client: nó đọc `code`, tra một bảng ánh xạ sang **câu tiếng Việt viết sẵn**, và chỉ dùng câu của máy chủ khi không tra được. Đó là lý do đăng nhập sai mật khẩu ở cổng cho ra một câu tiếng Việt, trong khi cùng lỗi đó ở bảng quản trị cho ra một câu tiếng Anh.

Bảng ánh xạ ấy chỉ phủ luồng xác thực. Mọi khu vực khác của cổng không có nó.

### Trang giới thiệu

Lời gọi duy nhất kiểm `res.ok` rồi ném một lỗi mang câu tiếng Anh có nhét mã trạng thái. Câu đó **không bao giờ được hiển thị**: khi có lỗi, mục câu chuyện thành công trả về rỗng và biến mất khỏi trang. Người xem không phân biệt được "API hỏng" với "chưa có câu chuyện nào".

## Thông điệp tới người dùng bằng đường nào

Hai cổng dùng cùng một thư viện toast. Cách chúng dùng nó chia làm hai mẫu, và mẫu áp đảo là mẫu tệ hơn.

| Mẫu | Làm gì | Ở đâu |
|---|---|---|
| **Câu viết cứng** | Bắt lỗi mà không đọc nó, hiện một câu tiếng Việt cố định như "Có lỗi xảy ra, vui lòng thử lại" | Phần lớn màn hình của cả hai cổng: đề bài và công nghệ, danh mục, câu chuyện, thông báo, lời mời hợp tác, cài đặt |
| **Truyền câu của máy chủ** | Hiện `err.message` trong một dải lỗi trong trang, không phải toast | Bảng điều khiển, danh sách người dùng, hồ sơ người dùng, trang đăng nhập của cả hai cổng, trang cài đặt và chợ giao dịch của cổng |

Hệ quả của mẫu thứ nhất: **mọi công sức bỏ vào việc viết thông điệp lỗi ở máy chủ đều vô hình**. Máy chủ nói "Email đã được sử dụng", người dùng đọc "Có lỗi xảy ra, vui lòng thử lại". Máy chủ nói "API v1 đã ngừng", người dùng đọc đúng câu đó. Và một màn hình đoán hộ máy chủ: hộp thoại tạo người dùng của bảng quản trị hiện "Tạo người dùng thất bại. Email có thể đã được sử dụng." cho **mọi** lỗi, kể cả khi lỗi thật là thiếu quyền hay mất mạng.

Không cổng nào có một thành phần dải lỗi dùng chung, và không cổng nào có lớp bắt lỗi toàn cục cho lời gọi API. Mỗi màn hình tự quyết định, nên hai màn hình cạnh nhau xử lý cùng một lỗi theo hai kiểu.

## Tiếng Anh trên một giao diện tiếng Việt

Máy chủ trả thông điệp bằng hai ngôn ngữ, và ranh giới không đi theo loại lỗi mà đi theo tầng nào sinh ra lỗi:

| Nguồn | Ngôn ngữ | Ví dụ |
|---|---|---|
| Kiểm tra dữ liệu ở tầng khai báo | Tiếng Anh | `"email must be a valid email"` |
| Kiểm tra dữ liệu ở tầng nghiệp vụ | Tiếng Anh | `"title should not be empty"`, `"password is required"` |
| Mười hai mã xác thực legacy | Tiếng Anh | `"Activation link is invalid or has expired. Please request a new one."` |
| Từ chối ở facade v1 | Tiếng Anh | `"Admin access required"` |
| Từ chối ở bảng quyết định | Tiếng Việt lẫn tiếng Anh | `"Không có quyền thực hiện 'case.transition'"` |
| Lệch phiên bản | Tiếng Việt | `"Bản ghi đã bị thay đổi bởi một yêu cầu khác. Tải lại và thử lại."` |
| Dừng dịch vụ v1 | Tiếng Việt | `"API v1 đã ngừng (D2-148). Dùng /api/v2."` |
| Lỗi máy chủ | Tiếng Anh ở v1, tiếng Việt ở v2 | `"Internal server error"` / `"Lỗi nội bộ. Mã tương quan đã được ghi log."` |

Không có header thương lượng ngôn ngữ. Máy chủ không biết người dùng đang xem giao diện tiếng gì và không có bảng dịch nào ở phía nó.

Kết quả nhìn thấy được: giao diện tiếng Việt hoàn toàn lộ ra tiếng Anh **ngay ở màn hình đầu tiên** — trang đăng nhập, khi gõ sai định dạng email. Và cùng một lỗi đó cho ra câu tiếng Việt ở cổng người dùng nhưng câu tiếng Anh ở bảng quản trị, vì chỉ một trong hai có bảng ánh xạ theo mã.

Thông điệp lỗi tệp cũng là tiếng Anh và dài: từ chối một tệp `.exe` cho ra một câu liệt kê hết mọi kiểu tệp được phép.

## Huỷ và gián đoạn

Trong tài liệu này, "tương tác" là một thông điệp lỗi đang hiện trên màn hình.

| Sự kiện | Điều gì xảy ra với thông điệp |
|---|---|
| Người dùng bấm Huỷ hoặc nhấn Escape | Toast đóng được bằng cách bấm vào nó. Dải lỗi trong trang thì không có nút đóng ở bất kỳ màn hình nào. |
| Người dùng đi chỗ khác trong app | Toast **không sống qua một lần điều hướng**. Bấm gửi, gặp lỗi, rồi đổi trang ngay là mất thông điệp trước khi kịp đọc. Dải lỗi trong trang cũng mất cùng trang. |
| Nút Back/Forward của trình duyệt | Như trên. |
| Tải lại trang, hoặc đóng tab | Mọi thông điệp mất. Không có nhật ký lỗi nào ở phía client để xem lại. |
| Mất mạng, hoặc request quá hạn | Bảng quản trị: sau 30 giây hiện thông điệp mặc định tiếng Anh của thư viện HTTP. Cổng người dùng: **không đặt thời gian chờ**, nên lời gọi treo và không có thông điệp nào cho tới khi trình duyệt tự bỏ. |
| Phiên hết hạn (401), hoặc v1 bị dừng (410 Gone) | 401 ở bảng quản trị không hiện thông điệp nào — người dùng chỉ thấy mình bị đưa về trang đăng nhập. 410 ở cả ba client hiện ra như một lỗi lạ. |
| Bản ghi bị đổi bởi tab khác hoặc người khác (409), hoặc bị xoá | Không client nào có nhánh 409 ngoài một chỗ duy nhất ở cổng: đăng ký trùng email. Xem [`dong-thoi-va-if-match.md`](dong-thoi-va-if-match.md). |
| Trình duyệt tự điền, hoặc trình quản lý mật khẩu ghi vào biểu mẫu | Thông điệp lỗi của lần thử trước **không** bị xoá khi giá trị trong ô đổi. Nó chỉ biến mất ở lần gửi tiếp theo, nên người dùng có thể đang nhìn một câu nói về dữ liệu họ đã sửa xong. |

## Tương tác với hệ thống khác

**Quyền và vai trò.** Ở v2, `ruleId` cho phép giao diện phân biệt "anh chưa có phiếu đọc" với "anh không phải môi giới của hồ sơ này". Hôm nay cả hai đều hiện ra như một câu chung. Xem [`quyen-va-vai-tro.md`](quyen-va-vai-tro.md).

**Kiểm tra dữ liệu và cách hiện lỗi.** Đây là tài liệu sở hữu. Một chuyện chưa giải quyết được ở đâu: thông điệp kiểm tra dữ liệu không nói **trường nào** hỏng ở dạng máy đọc được, chỉ nói trong câu chữ tiếng Anh. Không giao diện nào tô đỏ được đúng ô sai; chúng chỉ hiện được cả câu.

**Thay đổi chưa lưu.** Một lỗi lúc gửi giữ nguyên biểu mẫu ở trạng thái bẩn. Đây là hành vi đúng, và nó nhất quán ở cả ba client — xem [`thay-doi-chua-luu.md`](thay-doi-chua-luu.md).

**Cập nhật lạc quan và hoàn tác.** Không có tương tác. Không màn hình nào hiển thị kết quả trước khi máy chủ xác nhận, nên không có lỗi nào phải rút một thay đổi đã hiện ra.

**Ngoại tuyến.** Mất mạng và bị từ chối hiện ra giống hệt nhau. Người dùng không biết nên thử lại hay nên sửa dữ liệu.

**Thông báo và toast.** Đây cũng là tài liệu sở hữu. Toast dùng cho phản hồi sau một hành động; dải lỗi trong trang dùng cho lỗi lúc tải. Ranh giới đó không được tuân thủ nhất quán ở màn hình nào.

**Trạng thái lọc/tìm trong URL.** Không có tương tác.

**Đa ngôn ngữ.** Xem mục [Tiếng Anh trên một giao diện tiếng Việt](#tiếng-anh-trên-một-giao-diện-tiếng-việt).

**Khả năng truy cập.** Chưa rà xem toast và dải lỗi có được đánh dấu là vùng thông báo cho trình đọc màn hình không. Nếu không, một người dùng trình đọc màn hình bấm gửi và không nghe thấy gì.

**Dấu vết kiểm toán.** Lỗi 500 ghi một dòng nhật ký ở phía máy chủ kèm mã tương quan; lỗi 4xx ghi ở mức thông tin. Mã tương quan là sợi dây duy nhất nối cái người dùng thấy với cái nhật ký ghi, và **không giao diện nào hiện nó ra**.

## Trường hợp biên

- **Cùng một lỗi, hai câu khác nhau ở hai cổng.** Đăng nhập sai mật khẩu cho ra tiếng Việt ở cổng người dùng và tiếng Anh ở bảng quản trị, vì chỉ cổng có bảng ánh xạ theo mã.
- **Thông điệp thành mảng.** Gõ `abc` vào ô email rồi gửi cho ra một mảng một phần tử ở chỗ giao diện chờ một chuỗi. Điều gì hiện ra trên màn hình chưa được đo.
- **Lỗi v2 sẽ rơi về câu mặc định của thư viện.** Không phải vì máy chủ im lặng, mà vì client đọc sai trường. Đây là hỏng hóc chắc chắn xảy ra, không phải rủi ro.
- **Một câu đoán hộ máy chủ.** Hộp thoại tạo người dùng nói "Email có thể đã được sử dụng" cho mọi lỗi. Câu này đúng phần lớn thời gian và sai vào đúng lúc quan trọng nhất.
- **Trang giới thiệu nuốt lỗi.** Mục câu chuyện thành công biến mất thay vì báo lỗi. Không ai báo cáo một mục không hiện ra.
- **Lỗi 500 không lộ gì, kể cả cho người vận hành đang nhìn màn hình.** Thân lỗi chỉ có một câu chung; chi tiết nằm trong nhật ký máy chủ, tra được bằng mã tương quan — mà giao diện không hiện.
- **Toast biến mất khi đổi trang.** Một lỗi xảy ra lúc gửi rồi giao diện chuyển trang ngay sau đó là một lỗi không ai đọc được.
- **Hai lỗi của khoá chống lặp không có mã tương quan.** Chúng là hai lỗi duy nhất của v2 không tra ngược được về nhật ký.

## Câu hỏi mở và kiểm chứng

- Chưa dựng frontend nào nên chưa đo được điều gì thực sự hiện ra khi `message` là mảng. Có thể là các phần tử ghép liền nhau, có thể là một chuỗi vô nghĩa. Cần đo.
- Chưa đo được thông điệp lỗi của v2 vì chưa có endpoint v2 nào. Mọi điều nói về hình dạng C đọc từ mã.
- Chưa rà hết 74 đường dẫn v1 để biết còn chỗ nào lệch hình dạng ngoài hai hình dạng đã biết. Mỗi chỗ lệch là một nhánh xử lý riêng ở client.
- Việc phần lớn màn hình **vứt thông điệp của máy chủ** đáng bị coi là một quyết định sản phẩm cần xem lại, không phải một lỗi kỹ thuật: nó nhất quán đến mức trông như cố ý. Nhưng nó khiến mọi thông điệp lỗi viết ở máy chủ trở nên vô dụng, kể cả thông điệp dừng dịch vụ (chưa cấp mã lỗi).
- Chưa quyết định giao diện sẽ hiện mã tương quan ở đâu. Nó là thứ duy nhất giúp bộ phận hỗ trợ tìm lại một sự cố, và hiện không có chỗ nào cho nó.
- Chưa quyết định thông điệp kiểm tra dữ liệu sẽ được dịch ở đâu: ở máy chủ theo header ngôn ngữ, hay ở client theo một bảng ánh xạ mã như luồng xác thực đang làm. Cách thứ hai chạy được ngay nhưng cần máy chủ trả mã cho từng lỗi trường, mà hiện nó không trả.
- Chưa xác nhận nhánh 401 và 409 trong luồng xác thực của cổng có thực sự chạy không: bộ chặn phản hồi thay ngoại lệ trước khi hàm bọc kiểm tra mã trạng thái, nên các nhánh đó có thể là mã chết (chưa cấp mã lỗi).

Đối chiếu với SourceCode/nacentech và ba repo frontend, bản chụp ngày 2026-09-04.
