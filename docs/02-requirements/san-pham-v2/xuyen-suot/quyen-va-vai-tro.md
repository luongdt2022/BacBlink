# Quyền và vai trò

## Tóm tắt

Ai thấy gì trong NacenTech ĐMST được quyết bởi ba thứ chồng lên nhau, và chúng độc lập với nhau: **vai trò nền tảng** nằm trong token, **vai trò trong một hồ sơ vụ việc cụ thể** nằm trong bản ghi hồ sơ, và **cấp quyền đọc** là một phiếu riêng cho tài liệu mật. Một người có thể là `ADMIN` mà vẫn không đọc được một tệp mật; một người `USER` bình thường có thể chuyển giai đoạn một hồ sơ nếu họ là môi giới chính của hồ sơ đó.

Quyết định được ra bởi một **bảng quyết định có phiên bản**: các quy tắc xếp theo độ ưu tiên, quy tắc đầu tiên khớp thì thắng, và **không quy tắc nào khớp thì từ chối**. Mỗi quyết định trả về một *mã quy tắc* (`ruleId`) nói rõ dòng nào đã quyết. Lượt bị từ chối được ghi vào nhật ký kiểm toán kèm mã đó.

Đó là ở tầng dịch vụ. Ở cửa HTTP đang tồn tại — facade v1 — phần lớn việc kiểm quyền lại là một dòng lệnh đơn giản hơn hẳn: hoặc anh là `ADMIN`, hoặc anh nhận 403 với câu tiếng Anh `"Admin access required"`, không có mã quy tắc và không có dòng kiểm toán.

## Ba nguồn quyền, không phải một

| Nguồn | Ở đâu | Ai đổi được | Đi theo người sang chỗ khác? |
|---|---|---|---|
| Vai trò nền tảng | Claim `role` trong token — `ANONYMOUS`, `USER`, `ADMIN`, `SYSTEM` | Quản trị viên, khi tạo hoặc sửa tài khoản | Có, khắp hệ thống |
| Vai trò trong hồ sơ | Danh sách bên tham gia của một hồ sơ vụ việc — `PROBLEM_OWNER`, `LEAD_BROKER`, `CO_BROKER`, `PROVIDER`, `EVALUATOR`, `VERIFIER`, `SPONSOR` | Người phân công môi giới, hoặc người thêm bên tham gia | **Không.** Chỉ có hiệu lực trong đúng hồ sơ đó |
| Cấp quyền đọc | Một phiếu gắn vào một subject: cho ai, mục đích gì, mức trần nào, trong khoảng thời gian nào | Người có quyền cấp phiếu | **Không.** Chỉ đúng subject, đúng mức trần, đúng khoảng thời gian |

Chi tiết bốn vai trò nền tảng và cách token mang chúng nằm ở [`../nen-tang/xac-thuc-va-vai-tro.md`](../nen-tang/xac-thuc-va-vai-tro.md). Bảy vai trò trong hồ sơ và ba mức mật nằm ở [`../nen-tang/mo-hinh-du-lieu.md`](../nen-tang/mo-hinh-du-lieu.md).

Một hệ quả mà người thiết kế giao diện phải nhớ: **token không đủ để biết một người thấy gì**. Cùng một token, hai hồ sơ vụ việc khác nhau cho ra hai câu trả lời khác nhau. Không có cách nào tính trước danh sách quyền lúc đăng nhập rồi cache nó.

## Bảng quyết định

Mọi lượt kiểm quyền ở tầng dịch vụ đi qua cùng một bảng. Bảng có một số phiên bản (`authz-v1`) và một ngày hiệu lực, nạp từ tệp cấu hình chứ không viết cứng trong mã.

Cách bảng chạy:

1. Các dòng xếp theo **độ ưu tiên tăng dần**; cùng độ ưu tiên thì xếp theo mã quy tắc.
2. Dòng đầu tiên khớp mọi chiều điều kiện sẽ quyết — cho phép hay từ chối.
3. Không dòng nào khớp thì kết quả là **từ chối**, với mã quy tắc `DEFAULT_DENY`.

Mười ba chiều điều kiện được so khớp, trong đó chiều nào để trống trong quy tắc thì có nghĩa là "bất kỳ": hành động, vai trò nền tảng, quan hệ với bản ghi (`OWNER` / `SAME_ORGANIZATION` / `NONE`), vai trò trong hồ sơ, vai trò trong chương trình, hai loại uỷ quyền, mức mật của tài liệu, mục đích, đã kiểm cấp quyền đọc chưa, tình trạng xung đột lợi ích, và điều kiện rủi ro.

Các nhóm quy tắc, đọc từ trên xuống:

| Ưu tiên | Nhóm | Nói gì |
|---|---|---|
| 10–11 | Chặn tuyệt đối | Tài liệu mật không có phiếu đã kiểm thì **không đọc được, kể cả với `ADMIN`**. Người đang bị chặn vì xung đột lợi ích thì bị từ chối mọi hành động. |
| 100–104 | Chủ sở hữu | Chủ bản ghi đọc, sửa, xoá, xuất bản, nhờ AI viết lại, tính lại ghép cặp trên chính bản ghi của mình; trả lời lời mời gửi cho mình |
| 200 | Có phiếu | Người có cấp quyền đọc còn hiệu lực đọc được tài liệu mật |
| 300–301 | Công khai | Tài liệu mức `Public` và nội dung đã xuất bản đọc được không cần đăng nhập |
| 400–402 | Đã đăng nhập | Đọc và sửa hồ sơ của chính mình, quản lý thông báo của mình, tạo nội dung, tìm kiếm, đọc kết quả ghép cặp, gọi AI |
| 500 | Quản trị viên | Quản lý người dùng, đọc và sửa mọi nội dung, kiểm duyệt câu chuyện, quản lý lĩnh vực và danh mục, xem thống kê, **cấp quyền đọc** |
| 600–602 | Hồ sơ vụ việc | Môi giới chính và đồng môi giới **đọc và chuyển giai đoạn**; các bên tham gia khác chỉ đọc; quản trị viên tạo, đọc và phân công môi giới |
| 900 | Hệ thống | Worker và công cụ di trú được phép mọi hành động |

Ba điều đáng chú ý mà bảng này nói ra và giao diện phải phản ánh:

- **Quản trị viên không chuyển được giai đoạn hồ sơ.** Dòng 602 cho `ADMIN` quyền tạo, đọc và phân công môi giới, nhưng `case.transition` chỉ nằm ở dòng 600, và dòng 600 xét *vai trò trong hồ sơ*, không xét vai trò nền tảng. Một quản trị viên không phải môi giới của hồ sơ đó bấm nút chuyển giai đoạn sẽ bị từ chối.
- **Quản trị viên không đọc được tài liệu mật của người khác.** Dòng 10 đứng trước mọi dòng cho phép, và chú thích trong tệp cấu hình nói thẳng: "không grant hiệu lực thì không đọc tài liệu mật, kể cả admin". Đường duy nhất là tự cấp cho mình một phiếu — và việc cấp phiếu đó cũng bị ghi lại.
- **Quyền cấp phiếu và quyền đọc là hai chuyện khác nhau.** `ADMIN` cấp được phiếu (dòng 500) nhưng phiếu vẫn phải tồn tại thì mới đọc được.

> Ghi chú kỹ thuật: bảng quyết định là **tất định**. Cùng bộ quy tắc và cùng một yêu cầu luôn cho ra cùng một mã quy tắc, và mã quy tắc được ghi kèm số phiên bản bộ quy tắc (`authz-v1:OWNER_DOCUMENT_READ`). Đây là điều kiện để dựng lại một quyết định sau nhiều năm, khi bộ quy tắc đã đổi vài lần.

## Hai tầng, không phải một

Bảng quyết định không biết gì về từng phiếu cấp quyền cụ thể. Nó chỉ nhận một câu trả lời có hoặc không cho câu hỏi "người này đã có phiếu hợp lệ chưa", và câu trả lời đó được tính ở tầng dưới, bằng truy vấn dữ liệu: đúng subject, đúng người, chưa thu hồi, còn trong khoảng hiệu lực, và **mức trần của phiếu phải cao bằng hoặc cao hơn mức mật của tài liệu**.

Hệ quả cho danh sách tài liệu: tài liệu mà người xem không được đọc **không xuất hiện trong kết quả**. Nó không hiện ra rồi báo lỗi khi bấm; nó không có trong danh sách. Người dùng không có cách nào biết là có một tài liệu ở đó.

Mục đích của phiếu được lấy từ một danh sách đóng gồm 23 giá trị (thẩm định, đánh giá, hỗ trợ môi giới, kiểm toán, rà soát tài chính…). Gửi một mục đích ngoài danh sách bị từ chối như một lỗi kiểm tra dữ liệu, không phải như một lỗi quyền.

## Cửa HTTP hôm nay kiểm quyền kiểu khác

Đây là chỗ dễ hiểu nhầm nhất. Bảng quyết định ở trên là thứ tầng dịch vụ dùng. Nhưng phần lớn lời gọi mà ba client thực sự thực hiện đi qua facade v1, và facade có lớp kiểm quyền riêng của nó, thô hơn nhiều:

| Chỗ kiểm | Kiểm cái gì | Từ chối trông thế nào |
|---|---|---|
| Lớp bảo vệ route của bảng quản trị | **Chỉ kiểm đã đăng nhập chưa.** Không kiểm vai trò | Chuyển về `/login` |
| Bộ lọc `[Authorize]` của endpoint | Token có hợp lệ không | 401 |
| `RequireAdmin()` của facade | Vai trò nền tảng có đúng bằng `ADMIN` không | 403, thân `{"statusCode":403,"message":"Admin access required","error":"Forbidden"}` |
| Bảng quyết định ở tầng dịch vụ | 13 chiều điều kiện | 403, và ở v2 kèm `ruleId` |

Ba điều rút ra:

**Lớp bảo vệ route của bảng quản trị không kiểm vai trò.** Nó chỉ hỏi "có tài khoản trong bộ nhớ không". Việc chỉ `ADMIN` vào được bảng quản trị được bảo đảm ở *tầng đăng nhập* — máy chủ không cấp token cho vai trò khác qua đường đăng nhập admin — chứ không ở tầng định tuyến. Một token `USER` hợp lệ nhét thủ công vào cookie `admin_token` sẽ đi qua lớp bảo vệ, dựng được mọi màn hình, và chỉ bị chặn ở từng lời gọi API. Người đó thấy toàn bộ khung giao diện quản trị với mọi bảng trống và một loạt lỗi 403. Xem [B-18](../bug-triage.md#b-18-lớp-bảo-vệ-của-admin-không-kiểm-vai-trò).

**`RequireAdmin()` trả một câu tiếng Anh và không có mã quy tắc.** Nó ném thẳng một ngoại lệ "bị cấm" với thông điệp `"Admin access required"`, không đi qua bảng quyết định, nên **không có `ruleId` và không có dòng kiểm toán nào được ghi**. Từ chối ở tầng này là vô hình với nhật ký.

**Danh sách không đi qua bảng quyết định.** Các phương thức trả danh sách ở tầng dịch vụ cố ý không gọi bảng quyết định; chú thích trong mã nói rõ là facade tự chọn truy vấn phù hợp với từng endpoint (công khai, của tôi, của quản trị viên). Nghĩa là với danh sách, thứ quyết định người dùng thấy gì là **hình dạng truy vấn**, không phải bảng quy tắc. Một truy vấn viết sai ở facade sẽ lộ dữ liệu mà bảng quy tắc không hề biết.

## Từ chối được ghi lại

Khi bảng quyết định từ chối, hệ thống ghi một dòng kiểm toán trước khi ném lỗi. Dòng đó gồm: mã ẩn danh của người thao tác, vai trò nền tảng, hành động, loại và định danh đối tượng, mục đích, kết quả `DENY`, **mã quy tắc kèm phiên bản bộ quy tắc**, mã tương quan, địa chỉ IP, trình duyệt.

Lượt **được phép** đọc một tài liệu mật cũng được ghi, với kết quả `PERMIT`. Đọc tài liệu `Public` thì không ghi. Đây là chủ ý: nhật ký cần trả lời được "ai đã xem tài liệu mật nào", chứ không cần chép lại mọi lượt xem trang.

> Ghi chú kỹ thuật: dòng kiểm toán của một lượt bị từ chối được ghi bằng **một giao dịch riêng**, không đi theo giao dịch của lệnh bị từ chối. Lý do ghi thẳng trong mã: từ chối luôn kết thúc bằng một ngoại lệ, và nếu dòng kiểm toán nằm trong giao dịch của lệnh thì nó bị cuộn ngược cùng — hệ thống sẽ im lặng đúng ở tình huống cần dấu vết nhất. Đường đọc cũng không commit gì, nên lượt `PERMIT` trên tài liệu mật cũng sẽ mất nếu dùng chung giao dịch.

Không màn hình nào cho xem nhật ký này. Nó được ghi đầy đủ và không ai đọc được — xem [`../moi/nhat-ky-kiem-toan.md`](../moi/nhat-ky-kiem-toan.md).

## Người dùng thấy gì khi bị từ chối

Hôm nay, ở cả ba bề mặt: **một câu tiếng Anh, không nói tại sao, không nói phải làm gì**.

| Bề mặt | Nguồn câu chữ | Người dùng thấy |
|---|---|---|
| Bảng quản trị | `message` của thân lỗi v1 | `"Admin access required"` trong một toast hoặc một dải đỏ |
| Cổng người dùng | `message` của thân lỗi v1 | Cùng câu, ở bất cứ chỗ nào màn hình quyết định hiển thị lỗi |
| Trang giới thiệu | Không áp dụng | Chỉ gọi một endpoint công khai |

Từ chối đến từ bảng quyết định thì câu chữ là tiếng Việt: `"Không có quyền thực hiện 'case.transition'"` — một câu tiếng Việt có nhét tên hành động bằng tiếng Anh vào giữa. Không câu nào trong hai loại nói được điều người dùng cần biết: *xin quyền ở đâu*.

Ở v2, thân lỗi thêm `ruleId`, nghĩa là màn hình có đủ thông tin để hiện một câu khác nhau cho "anh chưa có phiếu đọc" và cho "anh không phải môi giới của hồ sơ này". Không client nào hiện đọc trường đó — xem [`loi-va-thong-bao.md`](loi-va-thong-bao.md).

## Huỷ và gián đoạn

Ở tài liệu này, "tương tác" là một thao tác đang chờ máy chủ trả lời về quyền.

| Sự kiện | Điều gì xảy ra |
|---|---|
| Người dùng bấm Huỷ hoặc nhấn Escape | Không ảnh hưởng. Không màn hình nào cho huỷ một lời gọi đang bay; Escape chỉ đóng hộp thoại đang mở, lời gọi vẫn chạy tới cùng và kết quả bị bỏ. |
| Người dùng đi chỗ khác trong app | Lời gọi bị bỏ. Nếu đó là một lệnh ghi đã tới máy chủ, quyết định cho phép hay từ chối vẫn xảy ra và vẫn được ghi kiểm toán; người dùng không thấy kết quả. |
| Nút Back/Forward của trình duyệt | Như trên. Thêm một chuyện: ở bảng quản trị, các màn chi tiết không mang định danh trong đường dẫn, nên quay lại có thể mở một màn không có bản ghi và không có lời gọi kiểm quyền nào chạy. |
| Tải lại trang, hoặc đóng tab | Không ảnh hưởng tới quyền. Vai trò được đọc lại từ token ở lần khởi động sau. |
| Mất mạng, hoặc request quá hạn | Không phân biệt được với bị từ chối: cả hai đều dừng ở một thông điệp lỗi. Người dùng không biết mình thiếu quyền hay thiếu mạng. |
| Phiên hết hạn (401), hoặc v1 bị dừng (410 Gone) | 401 ở bảng quản trị đẩy người dùng ra `/login` ngay; ở cổng người dùng không có nhánh nào bắt 401. 410 không có nhánh xử lý ở cả ba client. |
| Bản ghi bị đổi bởi tab khác hoặc người khác, hoặc bị xoá | Quyền có thể đổi giữa lúc màn hình đang mở: một phiếu cấp quyền bị thu hồi, một môi giới bị gỡ khỏi hồ sơ, một tài khoản bị vô hiệu hoá. Giao diện **không biết** cho tới lời gọi kế tiếp, và lời gọi đó trả 403 hoặc 401 mà không giải thích. |
| Trình duyệt tự điền, hoặc trình quản lý mật khẩu ghi vào biểu mẫu | Không ảnh hưởng. |

## Tương tác với hệ thống khác

**Quyền và vai trò.** Đây là tài liệu sở hữu cách quyết định được ra và được ghi lại. Vai trò nào tồn tại và token mang chúng thế nào thì thuộc [`../nen-tang/xac-thuc-va-vai-tro.md`](../nen-tang/xac-thuc-va-vai-tro.md).

**Kiểm tra dữ liệu và cách hiện lỗi.** Một mục đích ngoài danh sách đóng bị từ chối như lỗi kiểm tra dữ liệu (400), không phải lỗi quyền (403). Hai loại này hiện ra khác nhau và người dùng cần phân biệt được. Xem [`loi-va-thong-bao.md`](loi-va-thong-bao.md).

**Thay đổi chưa lưu.** Bị từ chối lúc gửi thì biểu mẫu vẫn bẩn và nội dung vẫn còn. Bị đẩy ra vì 401 thì mất hết — xem [`thay-doi-chua-luu.md`](thay-doi-chua-luu.md).

**Cập nhật lạc quan và hoàn tác.** Không màn hình nào hiển thị kết quả trước khi máy chủ xác nhận, nên không có trường hợp "hiện xong rồi rút lại vì thiếu quyền".

**Ngoại tuyến.** Không có tương tác. Không quyết định quyền nào tính được ở phía trình duyệt.

**Thông báo và toast.** Từ chối hiện ra bằng toast đỏ hoặc dải đỏ, tuỳ màn hình. Không màn hình nào phân biệt "không có quyền" với "lỗi mạng" trong cách hiện.

**Trạng thái lọc/tìm trong URL.** Không có tương tác.

**Đa ngôn ngữ.** Câu từ chối của facade v1 là tiếng Anh; câu từ chối của bảng quyết định là tiếng Việt có lẫn tên hành động tiếng Anh. Không có bảng dịch ở phía máy chủ và không có màn hình nào dịch lại.

**Khả năng truy cập.** Chưa rà xem thông điệp từ chối có được thông báo cho trình đọc màn hình không, hay chỉ hiện ra như một khối chữ đỏ.

**Dấu vết kiểm toán.** Đây là mối quan tâm gắn chặt nhất với tài liệu này: mọi quyết định của bảng đều để lại một dòng, và **chỉ quyết định của bảng**. Từ chối ở lớp `RequireAdmin()` của facade và ở lớp bảo vệ route không để lại gì.

## Trường hợp biên

- **Quản trị viên bị chặn ở chính thứ mình quản trị.** Đọc một tài liệu mật của người khác bị từ chối bởi quy tắc ưu tiên cao nhất, trước cả quy tắc cho phép quản trị viên. Không có đường vòng ngoài việc tự cấp phiếu.
- **Chuyển giai đoạn không mở cho vai trò nền tảng.** Nút chuyển giai đoạn trong một console hồ sơ vụ việc phải ẩn theo *vai trò trong hồ sơ*, không theo vai trò nền tảng — nếu không, quản trị viên sẽ thấy một nút luôn báo lỗi.
- **Hold thắng mọi quyền.** Hồ sơ đang có hold mở không chuyển giai đoạn được, kể cả khi bảng quyết định cho phép. Đây là luật ở tầng bản ghi, không ở tầng quyền — xem [`../nen-tang/luu-va-phien-ban.md`](../nen-tang/luu-va-phien-ban.md).
- **Vai trò `SYSTEM` được phép mọi hành động nhưng không có định danh người.** Bất kỳ đường nào chạy dưới vai trò này mà cần một người cụ thể sẽ ném lỗi thay vì âm thầm gán sai người, và dòng kiểm toán sinh ra sẽ không có mã người thao tác.
- **Một phiếu hết hạn không sinh thông báo nào.** Người đang mở màn hình vẫn thấy nội dung cũ trên màn cho tới lần tải lại; lần tải lại đó tài liệu biến mất khỏi danh sách, không có câu nào giải thích.
- **Không quy tắc nào phủ một hành động mới là từ chối im lặng.** Thêm một hành động ở tầng dịch vụ mà quên thêm dòng vào bảng thì nó rơi vào `DEFAULT_DENY` — an toàn, nhưng biểu hiện ra là một tính năng mới "không chạy" chứ không phải một lỗi rõ ràng.
- **Xung đột lợi ích ở trạng thái `BLOCKED` chặn mọi hành động**, kể cả đọc nội dung công khai, vì quy tắc chặn dùng hành động `*` ở độ ưu tiên 11.

## Câu hỏi mở và kiểm chứng

- Chưa chạy bộ kiểm quyền trong `tests/authorization/`. Đó là cách rẻ nhất để xác nhận bảng quy tắc ở trên khớp với hành vi thật, đặc biệt các dòng chặn tuyệt đối.
- Chưa rõ ai đặt tình trạng xung đột lợi ích và bằng đường nào. Bốn giá trị tồn tại trong mã nhưng chưa thấy chỗ nào ghi chúng, nên trên thực tế mọi yêu cầu hiện đi vào bảng với chiều này để trống.
- Chưa rõ vai trò trong chương trình, hai loại uỷ quyền và điều kiện rủi ro được nạp từ đâu. Chúng là chiều điều kiện hợp lệ của bảng nhưng chưa thấy nơi nào điền giá trị, nghĩa là mọi quy tắc dùng chúng hiện không bao giờ khớp.
- Việc `RequireAdmin()` từ chối mà **không ghi dòng kiểm toán nào** đáng bị coi là một khoảng trống chứ không phải một quyết định: đây là lớp kiểm quyền mà 100% lời gọi thật hôm nay đi qua, và nó là lớp duy nhất không để lại dấu vết (chưa cấp mã lỗi).
- Tài liệu nền tảng nói dòng kiểm toán nằm **trong cùng giao dịch** với dữ liệu; mã của bộ ghi kiểm toán thì mở một giao dịch riêng, kèm lý do viết rõ trong chú thích. Hai câu này cần được đối chiếu lại và chốt một cách nói, vì chúng dẫn tới hai kết luận khác nhau về việc có thể có dòng kiểm toán ghi một thay đổi đã bị cuộn ngược hay không (chưa cấp mã lỗi).
- Chưa xác nhận trên bản chạy rằng một token `USER` nhét vào cookie `admin_token` thực sự dựng được toàn bộ khung bảng quản trị. Cần một lượt kiểm bằng tay.
- Chưa quyết được sản phẩm sẽ hiện gì khi người dùng bị từ chối vì thiếu phiếu đọc: một câu "không có quyền", hay một nút "xin quyền" dẫn tới một luồng chưa tồn tại. Đây là quyết định sản phẩm, không phải quyết định kỹ thuật.

Đối chiếu với SourceCode/nacentech và ba repo frontend, bản chụp ngày 2026-09-04.
