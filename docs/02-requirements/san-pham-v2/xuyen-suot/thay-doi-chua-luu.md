# Thay đổi chưa lưu

## Tóm tắt

Người dùng điền một biểu mẫu dài, bấm nhầm một liên kết ở thanh bên, và mọi thứ họ vừa gõ biến mất. Không có hộp thoại hỏi lại, không có dấu hiệu nào cho thấy có gì đó chưa lưu, không có bản nháp để quay lại.

Đó là hành vi của **cả ba bề mặt, ở mọi màn hình có biểu mẫu**. Không phải một màn hình bị bỏ sót; là chưa màn hình nào từng có. Không client nào đăng ký cảnh báo rời trang của trình duyệt, không client nào chặn chuyển route, không client nào theo dõi trạng thái *đã bẩn* của biểu mẫu, và không client nào ghi bản nháp xuống trình duyệt.

Điều này đáng chú ý vì cùng bộ mã đó lại **có** hộp thoại xác nhận cho việc xoá. Sản phẩm đã quyết rằng thao tác phá huỷ cần hỏi lại; nó chỉ chưa nhận ra rằng rời một biểu mẫu đang bẩn cũng là một thao tác phá huỷ.

Định nghĩa *đã bẩn* và *đã lưu* thuộc [`../nen-tang/luu-va-phien-ban.md`](../nen-tang/luu-va-phien-ban.md).

## Bốn đường mất dữ liệu

Xếp theo mức độ thường gặp.

### Một — bấm một liên kết trong ứng dụng

Chuyển route là chuyện của bộ định tuyến phía trình duyệt. Không route nào ở cả hai cổng có lớp chặn, nên biểu mẫu bị tháo khỏi màn hình cùng toàn bộ nội dung của nó. Người dùng không thấy bất kỳ nhịp dừng nào — trang mới hiện ra ngay như thể họ đã lưu xong.

Đây là đường thường gặp nhất vì thanh bên luôn hiện, và một cú bấm nhầm cách một biểu mẫu 600 dòng đúng một pixel.

### Hai — tải lại trang hoặc đóng tab

Trình duyệt có sẵn một cơ chế cảnh báo cho việc này, và nó chỉ hoạt động nếu ứng dụng đăng ký sử dụng. **Không client nào đăng ký.** Đóng tab là mất, không có câu hỏi nào.

### Ba — phiên hết hạn ở bảng quản trị

Bảng quản trị bắt lỗi phiên hết hạn ở một chỗ tập trung và phản ứng ngay lập tức: xoá cookie, dọn tài khoản khỏi bộ nhớ, đưa về trang đăng nhập. Chuỗi này chạy **ở giữa bất kỳ thao tác nào**, không cảnh báo, và nó tháo luôn màn hình đang mở.

Cái người dùng thấy: họ bấm Lưu sau hai mươi phút điền một biểu mẫu, và màn hình nhảy sang trang đăng nhập. Không có thông điệp nào nói phiên đã hết hạn. Sau khi đăng nhập lại, họ hạ cánh ở bảng điều khiển — không phải chỗ họ vừa đứng — với biểu mẫu trống.

Cookie của bảng quản trị sống bảy ngày trong khi token chỉ sống 24 giờ, nên khoảng thời gian mà trình duyệt tưởng còn đăng nhập nhưng máy chủ đã hết công nhận là **sáu ngày**. Xem [B-09](../bug-triage.md#b-09-cookie-sống-7-ngày-token-sống-24-giờ) và [`../nen-tang/xac-thuc-va-vai-tro.md`](../nen-tang/xac-thuc-va-vai-tro.md).

### Bốn — phiên hết hạn ở cổng người dùng

Ngược lại hoàn toàn, và tệ theo kiểu khác. Cổng người dùng **không có nhánh xử lý phiên hết hạn nào**. Nội dung đang gõ được giữ nguyên — nhưng lời gọi lưu thất bại với một thông điệp không nói rằng cần đăng nhập lại, cookie vẫn còn đó, và mọi lần bấm Lưu tiếp theo cũng thất bại y như vậy.

Người dùng ngồi trước một biểu mẫu đầy đủ mà không lưu được và không biết vì sao. Cookie của cổng sống **365 ngày**, nên trạng thái này kéo dài cho tới khi họ tự xoá cookie hoặc tự đoán ra là phải đăng xuất rồi đăng nhập lại. Xem [B-12](../bug-triage.md#b-12-cổng-người-dùng-không-xử-lý-401).

Hai bề mặt, hai cách hỏng đối lập: một cái vứt dữ liệu và đẩy người dùng đi; một cái giữ dữ liệu nhưng không cho lưu.

## Những màn hình có nguy cơ cao nhất

| Bề mặt | Màn hình | Vì sao nguy hiểm |
|---|---|---|
| Bảng quản trị | Biểu mẫu đề bài và tài sản công nghệ | Biểu mẫu dài nhất của bề mặt, có tệp đính kèm chia theo ba mức mật. Tệp đã chọn nhưng chưa gửi cũng mất, và người dùng phải chọn lại từ máy |
| Bảng quản trị | Biểu mẫu câu chuyện | Trình soạn thảo văn bản dài, ảnh tải lên trong lúc soạn |
| Bảng quản trị | Hộp thoại tạo người dùng | Ở trong một hộp thoại, nên nhấn Escape đóng nó và vứt luôn nội dung |
| Cổng người dùng | Biểu mẫu đề bài và công nghệ | Biểu mẫu dài nhất trong cả ba bề mặt, nhiều bước, nhiều tệp |
| Cổng người dùng | Biểu mẫu câu chuyện | Như trên |
| Cổng người dùng | Trang cài đặt | Ngắn, nhưng đây là chỗ duy nhất một lần bấm nhầm làm mất một lựa chọn khó tìm lại |
| Trang giới thiệu | — | Không có biểu mẫu nào. Không có tương tác |

Hộp thoại là trường hợp riêng đáng nói: nhấn Escape trong một hộp thoại đóng nó ngay và vứt nội dung, và Escape là phím người dùng nhấn theo phản xạ để "quay lại" chứ không phải để "bỏ".

## Điều làm cho nó tệ hơn

**Không có chỉ báo nào.** Không dấu chấm trên tiêu đề tab, không dòng "chưa lưu" cạnh nút, không đổi màu nút Lưu. Người dùng không có cách nào biết mình đang ở trạng thái nguy hiểm. Ngay cả một người biết rõ rủi ro cũng không nhìn ra được là biểu mẫu này đã bẩn hay chưa.

**Không có bản nháp cục bộ.** Không client nào ghi nội dung biểu mẫu xuống trình duyệt. Mất là mất.

**Bộ lọc cũng mất, không chỉ biểu mẫu.** Không màn hình danh sách nào giữ trạng thái lọc, tìm hay số trang trong URL hay ở bất kỳ đâu. Lọc một danh sách dài, mở một bản ghi, bấm Back — danh sách trở về trang 1 không lọc. Đây là cùng một khoảng trống ở một dạng khác: công sức của người dùng không được coi là dữ liệu. Xem [`../nen-tang/dieu-huong-va-url.md`](../nen-tang/dieu-huong-va-url.md).

**Đích đến sau đăng nhập bị bỏ.** Lớp bảo vệ của bảng quản trị có ghi lại vị trí người dùng định tới, nhưng trang đăng nhập không đọc nó. Sau khi bị đẩy ra vì phiên hết hạn và đăng nhập lại, người dùng hạ cánh ở bảng điều khiển. Xem [B-11](../bug-triage.md#b-11-đích-đến-sau-đăng-nhập-bị-ghi-lại-nhưng-không-được-dùng).

## Đề xuất hành vi nhất quán

Bốn lớp, xếp theo công sức. Mỗi lớp có ích một mình; không lớp nào cần lớp sau.

**Lớp 1 — biết mình đang bẩn.** Mỗi biểu mẫu so nội dung hiện tại với nội dung vừa tải và giữ một cờ. Đây là điều kiện cho ba lớp còn lại, và tự nó đã cho phép một cải thiện rẻ: nút Lưu mờ đi khi không có gì để lưu, thay vì luôn bấm được.

Định nghĩa phải khớp với [`../nen-tang/luu-va-phien-ban.md`](../nen-tang/luu-va-phien-ban.md): bẩn kể từ lần sửa đầu tiên khác giá trị vừa tải, cho tới lần lưu thành công tiếp theo. Sửa rồi sửa lại về đúng giá trị cũ **không** làm nó sạch.

**Lớp 2 — chỉ báo nhìn thấy được.** Một dấu chấm cạnh tiêu đề màn hình hoặc một dòng "Có thay đổi chưa lưu" cạnh nút Lưu. Không phải một cảnh báo — chỉ là một sự thật hiển thị.

**Lớp 3 — hỏi lại trước khi rời đi.** Hai đường rời đi cần hai cơ chế khác nhau:

| Đường rời đi | Cơ chế | Câu chữ kiểm soát được? |
|---|---|---|
| Bấm liên kết trong ứng dụng, hoặc bấm Back | Lớp chặn của bộ định tuyến, hiện hộp thoại của chính ứng dụng | Có |
| Tải lại trang, đóng tab, gõ địa chỉ khác | Cảnh báo rời trang của trình duyệt | **Không** — trình duyệt hiện câu của nó, không hiện câu của ứng dụng |

Hộp thoại của lớp thứ nhất nên có ba lựa chọn, không phải hai: **Ở lại**, **Rời đi và bỏ thay đổi**, và nếu lớp 4 đã có thì **Lưu nháp rồi rời đi**. Tránh cặp "OK / Huỷ" — người dùng đọc "Huỷ" là huỷ cái gì thì không rõ.

Cảnh báo rời trang chỉ nên bật khi biểu mẫu thật sự bẩn. Bật nó thường trực biến nó thành tiếng ồn và người dùng học cách bấm qua.

**Lớp 4 — bản nháp cục bộ.** Ghi nội dung biểu mẫu xuống trình duyệt sau mỗi vài giây khi bẩn, xoá khi lưu thành công hoặc khi người dùng chủ động bỏ thay đổi. Vào lại màn hình có nháp thì hiện một dải: "Bạn có một bản nháp chưa lưu từ *lúc nào*." kèm hai nút **Khôi phục** và **Bỏ**.

Ba giới hạn phải nói rõ khi làm lớp này:

- **Tệp đính kèm đã chọn không lưu được vào nháp.** Trình duyệt không cho giữ tệp người dùng chọn qua một lần tải lại trang. Dải khôi phục phải nói rõ là tệp phải chọn lại.
- **Nháp là của một trình duyệt, không của một tài khoản.** Nó không đi theo người sang máy khác.
- **Nháp có thể cũ hơn dữ liệu trên máy chủ.** Khôi phục một bản nháp lên một bản ghi mà người khác đã sửa là chính xác tình huống ở [`dong-thoi-va-if-match.md`](dong-thoi-va-if-match.md), và phải xử lý cùng cách.

**Và một việc riêng, độc lập với bốn lớp trên: sửa hai đầu hỏng của phiên hết hạn.** Bảng quản trị không được vứt nội dung — thay vì đẩy thẳng về trang đăng nhập, nó nên giữ màn hình và hiện một hộp thoại đăng nhập lại tại chỗ, rồi gửi lại lệnh vừa hỏng. Cổng người dùng thì ngược lại, phải **có** nhánh xử lý phiên hết hạn thay vì để người dùng ngồi trước một biểu mẫu không lưu được.

## Huỷ và gián đoạn

| Sự kiện | Hôm nay | Nên là |
|---|---|---|
| Người dùng bấm Huỷ hoặc nhấn Escape | Vứt bỏ ngay, không hỏi. Escape trong hộp thoại cũng vứt | Hỏi lại khi bẩn. Đây là *huỷ* — người dùng chủ động, nên vứt bỏ là đúng, nhưng phải xác nhận |
| Người dùng đi chỗ khác trong app | Vứt bỏ im lặng | Hộp thoại ba lựa chọn của lớp 3 |
| Nút Back/Forward của trình duyệt | Vứt bỏ im lặng. Ở bảng quản trị còn tệ hơn: các màn chi tiết không mang định danh trong đường dẫn, nên Back có thể mở một màn không có bản ghi | Cùng hộp thoại như trên |
| Tải lại trang, hoặc đóng tab | Vứt bỏ im lặng | Cảnh báo rời trang của trình duyệt |
| Mất mạng, hoặc request quá hạn | Nội dung được giữ, lời gọi thất bại. **Đây là hành vi đúng và nó đã đúng sẵn** | Giữ nguyên, thêm nút Thử lại |
| Phiên hết hạn (401), hoặc v1 bị dừng (410 Gone) | 401 ở bảng quản trị vứt hết; ở cổng người dùng giữ hết nhưng không lưu được. 410 không có nhánh nào ở cả hai | Giữ nội dung ở cả hai; đăng nhập lại tại chỗ; 410 hiện màn chặn nói rõ ứng dụng đã cũ |
| Bản ghi bị đổi bởi tab khác hoặc người khác, hoặc bị xoá | Không phát hiện được, vì không client nào giữ số phiên bản | Giữ nội dung, hiện lựa chọn — xem [`dong-thoi-va-if-match.md`](dong-thoi-va-if-match.md) |
| Trình duyệt tự điền, hoặc trình quản lý mật khẩu ghi vào biểu mẫu | Giá trị được nhận bình thường, nhưng nó **làm biểu mẫu thành bẩn mà người dùng không chủ động gõ gì** | Cùng xử lý như gõ tay. Đây là lý do đừng cảnh báo rời trang quá sớm: tự điền trên một biểu mẫu người dùng chưa định sửa sẽ gây báo động giả |

Nguyên tắc chung, khớp với [`../glossary.md`](../glossary.md): **huỷ** là ý định của người dùng và được phép vứt bỏ sau khi xác nhận; **gián đoạn** không nói lên ý định gì và mặc định phải giữ lại.

## Tương tác với hệ thống khác

**Quyền và vai trò.** Bị từ chối lúc gửi giữ nguyên biểu mẫu — đúng. Bị đẩy ra vì phiên hết hạn thì không. Hai chuyện này đến từ hai chỗ khác nhau trong mã và hành xử khác nhau mà không có lý do sản phẩm nào.

**Kiểm tra dữ liệu và cách hiện lỗi.** Một lần gửi hỏng để lại biểu mẫu bẩn với nội dung nguyên vẹn. Thông điệp lỗi của lần thử trước **không** tự xoá khi người dùng sửa ô, nên họ có thể đang nhìn một câu nói về dữ liệu đã sửa xong. Xem [`loi-va-thong-bao.md`](loi-va-thong-bao.md).

**Thay đổi chưa lưu.** Đây là tài liệu sở hữu.

**Cập nhật lạc quan và hoàn tác.** Không có tương tác. Không màn hình nào hiển thị trước khi máy chủ xác nhận, nên không có thay đổi nào phải rút lại.

**Ngoại tuyến.** Không có hàng đợi ngoại tuyến. Bản nháp cục bộ của lớp 4 **không** phải hàng đợi ngoại tuyến: nó giữ nội dung để người dùng gửi lại bằng tay, không tự gửi. Ranh giới này nên giữ, vì tự gửi lại một lệnh cũ là chính xác chỗ cần khoá chống lặp và số phiên bản.

**Thông báo và toast.** Toast không sống qua một lần chuyển route. Một cảnh báo "chưa lưu" không được là toast.

**Trạng thái lọc/tìm trong URL.** Cùng một vấn đề ở dạng nhẹ hơn: công sức lọc và tìm cũng bị vứt khi rời màn hình. Đưa trạng thái lọc vào URL giải quyết được nó mà không cần bất kỳ lớp nào ở trên.

**Đa ngôn ngữ.** Câu chữ của hộp thoại rời trang phải viết ở phía ứng dụng bằng tiếng Việt; câu của cảnh báo rời trang thì do trình duyệt quyết và theo ngôn ngữ của trình duyệt, không theo ngôn ngữ của ứng dụng.

**Khả năng truy cập.** Hộp thoại xác nhận phải giữ focus bên trong nó và trả focus về đúng chỗ khi đóng. Chưa rà xem các hộp thoại xoá hiện có có làm đúng không.

**Dấu vết kiểm toán.** Không có tương tác. Nội dung chưa gửi không tồn tại với máy chủ, nên nó không sinh dòng kiểm toán nào và một lần mất dữ liệu **không để lại dấu vết ở bất kỳ đâu**.

## Trường hợp biên

- **Sửa rồi sửa lại về giá trị cũ vẫn là bẩn.** Theo định nghĩa đã chốt. Một người thử một tiêu đề khác rồi đổi về như cũ sẽ bị hỏi khi rời đi. Đây là chủ ý — so với giá trị đã tải, không theo dõi từng lần gõ — nhưng nó sẽ gây bất ngờ, và nếu số lần bất ngờ quá nhiều thì định nghĩa đáng được xem lại chứ không phải cài đặt.
- **Trình quản lý mật khẩu làm biểu mẫu thành bẩn mà không ai gõ gì.** Đặc biệt trên trang đăng nhập, nơi biểu mẫu vốn không cần khái niệm bẩn.
- **Tệp đã chọn không cứu được.** Đây là giới hạn của trình duyệt, không phải của thiết kế. Người dùng chọn năm tệp rồi mất phiên phải chọn lại cả năm.
- **Danh sách đề bài của bảng quản trị tự tải lại mỗi năm giây** khi có bản ghi đang được AI xử lý. Nó không đụng vào biểu mẫu nào, nhưng nó có nghĩa là dữ liệu đổi dưới chân người dùng ở màn danh sách, và một lớp chặn rời đi viết cẩu thả có thể tưởng nhầm đó là thay đổi của người dùng.
- **Hộp thoại đóng bằng Escape vứt nội dung ngay.** Escape là phím phản xạ; hộp thoại chứa biểu mẫu nên hỏi lại thay vì đóng thẳng.
- **Nháp cục bộ có thể chứa dữ liệu mật.** Nếu lớp 4 được xây, biểu mẫu có trường mật cần được loại khỏi nháp, hoặc nháp phải bị xoá khi đăng xuất. Máy dùng chung là chuyện có thật.

## Câu hỏi mở và kiểm chứng

- Chưa dựng frontend nào. Việc không có cảnh báo nào là kết luận đọc từ mã: không tìm thấy chỗ nào đăng ký cảnh báo rời trang, chặn route, hay theo dõi trạng thái bẩn ở cả ba repo. Cần một lượt kiểm bằng tay để chắc chắn, nhất là ở các biểu mẫu dài.
- Chưa quyết định lớp nào trong bốn lớp sẽ được xây, và cho những màn hình nào. Xây cả bốn cho mọi biểu mẫu là quá tay; xây lớp 1 và 3 cho hai biểu mẫu đề bài là mức tối thiểu hợp lý.
- Chưa quyết định bảng quản trị sẽ xử lý phiên hết hạn thế nào. Giữ màn hình và hỏi đăng nhập lại tại chỗ là hành vi tốt hơn hẳn, nhưng nó đổi một luồng đang chạy và cần được thiết kế chứ không sửa vá.
- Việc cổng người dùng **không có nhánh xử lý phiên hết hạn nào** đáng bị coi là lỗi hơn là một quyết định: không tìm thấy chú thích nào giải thích, và hệ quả là người dùng ngồi trước một biểu mẫu không lưu được mà không biết vì sao. Xem [B-12](../bug-triage.md#b-12-cổng-người-dùng-không-xử-lý-401).
- Chưa rõ dữ liệu nào trong biểu mẫu đề bài thuộc mức mật nào, nên chưa quyết được trường nào được phép nằm trong bản nháp cục bộ.
- Chưa đo hành vi của các hộp thoại hiện có với focus và trình đọc màn hình.

Đối chiếu với SourceCode/nacentech và ba repo frontend, bản chụp ngày 2026-09-04.
