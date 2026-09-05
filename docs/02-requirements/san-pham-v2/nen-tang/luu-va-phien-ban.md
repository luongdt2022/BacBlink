# Lưu và phiên bản

Tài liệu này sở hữu bốn khái niệm mà mọi biểu mẫu dựa vào: khi nào một biểu mẫu là *đã bẩn*, khi nào một thay đổi là *đã lưu*, sửa nội dung tạo ra cái gì, và xoá nghĩa là gì.

## Đã bẩn và đã lưu

**Đã bẩn** bắt đầu ở lần sửa đầu tiên khác giá trị vừa tải, và kết thúc ở lần lưu thành công tiếp theo. Sửa đi sửa lại về đúng giá trị cũ không làm nó sạch: hệ thống so với giá trị đã tải, không so từng lần gõ.

**Đã lưu** nghĩa là máy chủ trả 2xx *và* dữ liệu trong phản hồi đã thay chỗ dữ liệu trong biểu mẫu. Một toast xanh không đủ. Điều kiện là cái đang hiển thị đến từ máy chủ, vì máy chủ có thể đã đổi nó — cắt khoảng trắng, gán mặc định, tăng số phiên bản.

Không màn hình nào trong ba bề mặt hiện có một chỉ báo "đã bẩn" rõ ràng: không có dấu chấm trên tiêu đề tab, không có hộp thoại xác nhận khi rời trang. Xem [`../xuyen-suot/thay-doi-chua-luu.md`](../xuyen-suot/thay-doi-chua-luu.md).

## Sửa nội dung tạo phiên bản mới

Đề bài và tài sản công nghệ giữ nội dung trong các **phiên bản bất biến**. Sửa tiêu đề hoặc phần nội dung chính không ghi đè bản cũ; nó tạo một bản mới và tăng số phiên bản hiện hành.

Đây là một trong bảy thay đổi có chủ đích so với NacenTwin, và lý do được ghi lại: ghi đè làm mất căn cứ của các quyết định đã ra dựa trên nội dung cũ.

> **Cơ chế này hiện không chạy được.** Đo trên bản chạy ngày 2026-09-04: mọi lệnh sửa **tạo phiên bản mới** đều thất bại với 409, vĩnh viễn, trên cả hai loại bản ghi và cả hai bề mặt. Sửa nhãn, danh mục và trạng thái thì chạy; đổi tiêu đề, đổi phần mô tả, hay đổi một đoạn nội dung mật thì không. Nghĩa là hôm nay **không ai sửa được nội dung mình đã đăng**, và số phiên bản của mọi bản ghi trong hệ thống đứng yên ở 1. Xem [B-32](../bug-triage.md#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409). Phần còn lại của mục này mô tả cơ chế **như thiết kế**, tức là điều sẽ đúng sau khi lỗi đó được sửa.

Ba hệ quả mà giao diện phải phản ánh và hiện chưa phản ánh:

1. **Số phiên bản là thật và nó tăng.** Không màn hình nào hiển thị nó.
2. **Bản cũ vẫn còn.** Không màn hình nào cho xem lại hay so sánh. Xem [`../moi/lich-su-phien-ban.md`](../moi/lich-su-phien-ban.md).
3. **Hồ sơ vụ việc ghim một số phiên bản cụ thể** của đề bài. Đề bài sửa sau đó không đổi cái mà hồ sơ đang xử lý — hai người có thể nhìn hai nội dung khác nhau mà tưởng là một.

Không phải mọi lần sửa đều tạo phiên bản. Đổi nhãn lĩnh vực, đổi danh mục, hay đổi trạng thái xuất bản **không** tạo phiên bản mới; chỉ nội dung mới tạo. Vì vậy số phiên bản không phải là số lần bấm Lưu.

Chuyển từ nháp sang đã xuất bản phát ra một sự kiện riêng, khác với sự kiện "nội dung công khai đã đổi". Hai sự kiện này kích hoạt các việc khác nhau ở phía sau: đưa vào chỉ mục tìm kiếm, tính lại ứng viên ghép cặp.

## Không có hoàn tác

Không bản ghi nào hoàn tác được. Quay lại một nội dung cũ nghĩa là **ghi thêm một phiên bản nữa** mang nội dung đó.

Bản ghi quyết định của hồ sơ vụ việc cũng vậy: chỉ ghi thêm. Sửa một quyết định là ghi một quyết định mới thay thế nó, và bản cũ vẫn nằm trong dòng thời gian. Đây là chủ ý — dòng thời gian là căn cứ, không phải trạng thái hiện tại.

Sự kiện kiểm toán thì tuyệt đối không có đường sửa hay xoá, kể cả ở tầng dịch vụ.

## Xoá là xoá mềm

Xoá một đề bài hoặc một tài sản công nghệ chỉ đánh dấu thời điểm xoá. Dữ liệu ở lại, **tệp đính kèm cũng ở lại**. Hệ cũ xoá cứng cả tệp; đây là một trong bảy thay đổi có chủ đích.

Người dùng thường không thấy bản ghi đã xoá mềm trong bất kỳ danh sách nào. Truy vấn phía máy chủ có tham số cho phép lấy cả bản đã xoá, nhưng **không màn hình nào dùng nó**, nên trên thực tế bản ghi đã xoá là biến mất hoàn toàn khỏi giao diện — chỉ khác là nó vẫn chiếm dung lượng và vẫn tra được từ cơ sở dữ liệu.

Không có thùng rác, không có nút khôi phục, không có endpoint khôi phục.

Ba thứ **không** xoá mềm:

- **Ảnh đại diện**: đặt ảnh mới xoá ảnh cũ thật.
- **Lĩnh vực và danh mục**: xoá là vô hiệu hoá; bản ghi cũ vẫn tra được tên nhãn.
- **Đoạn văn bản mật**: gỡ nó tạo một phiên bản mới rỗng, không xoá lịch sử.

## Hold

Một khoá tạm trên hồ sơ vụ việc, kèm lý do. Hồ sơ đang có hold mở **không chuyển giai đoạn được**, bất kể người thao tác có quyền gì. Gỡ hold cần một lý do riêng, ghi lại được.

Đây là công cụ duy nhất trong hệ thống để nói "dừng lại, có gì đó không ổn" mà không phải từ chối hay huỷ hồ sơ. Không có endpoint và không có màn hình nào cho nó. Xem [`../moi/console-ho-so-vu-viec.md`](../moi/console-ho-so-vu-viec.md).

## Ghi dữ liệu và ghi việc nền là một

Khi một thao tác vừa đổi dữ liệu vừa cần một việc chạy nền (cắt đoạn văn bản, tính lại ứng viên, gửi thư), cả hai nằm trong **cùng một giao dịch**. Hàng đợi nằm trong cơ sở dữ liệu chứ không ở một hệ thống riêng — đây là một trong bảy thay đổi có chủ đích, thay cho hàng đợi Redis của hệ cũ.

Cái người dùng nhìn thấy từ quyết định này: **không có trạng thái nửa vời**. Không thể xảy ra chuyện nội dung đã lưu nhưng việc tính lại ứng viên bị mất, hay ngược lại việc chạy trên một nội dung chưa được ghi.

Cái nó không giải quyết: việc nền vẫn chạy sau, và giao diện vẫn phải hiển thị trạng thái đang xử lý. Đề bài và tài sản công nghệ có hai trường cho việc đó — trạng thái xử lý AI và trạng thái cắt đoạn, mỗi trường nhận `PROCESSING`, `COMPLETED` hoặc `FAILED`.

Dòng kiểm toán thì **không** nằm trong giao dịch đó — nó dùng một giao dịch riêng, cố ý, để sống sót qua việc lệnh bị cuộn ngược. Xem [`mo-hinh-du-lieu.md`](mo-hinh-du-lieu.md#sự-kiện-kiểm-toán).

## Tương tác với hệ thống khác

**Quyền và vai trò.** Ai được sửa cái gì nằm trong tài liệu của từng màn hình. Ở đây chỉ có một luật chung: sửa nội dung của người khác cần vai trò `ADMIN`, và khi đó việc kiểm quyền tác giả bị bỏ qua chứ không phải được thoả mãn — hai chuyện khác nhau khi đọc nhật ký kiểm toán.

**Kiểm tra dữ liệu và cách hiện lỗi.** Kiểm tra chạy trước khi tạo phiên bản. Một lần lưu hỏng không để lại phiên bản dở dang.

**Thay đổi chưa lưu.** Xem [`../xuyen-suot/thay-doi-chua-luu.md`](../xuyen-suot/thay-doi-chua-luu.md).

**Cập nhật lạc quan và hoàn tác.** Không có hoàn tác ở bất kỳ đâu. Cập nhật lạc quan không được hỗ trợ ở tầng API: không endpoint nào chấp nhận một thay đổi rồi báo lại sau.

**Ngoại tuyến.** Không có bản nháp cục bộ ở bất kỳ client nào. Đóng tab giữa chừng là mất.

**Thông báo và toast.** Lưu thành công hiện toast ở phần lớn màn hình; chi tiết ở từng tài liệu.

**Trạng thái lọc/tìm trong URL.** Không có tương tác.

**Đa ngôn ngữ.** Không có tương tác.

**Khả năng truy cập.** Không có tương tác.

**Dấu vết kiểm toán.** Mỗi lần lưu ghi một dòng, kèm **số phiên bản của đối tượng** tại thời điểm đó. Đây là thứ cho phép ghép một dòng kiểm toán với đúng phiên bản nội dung mà nó nói tới.

## Trường hợp biên

- **Số phiên bản không phải số lần lưu.** Đổi nhãn mười lần rồi đổi tiêu đề một lần cho ra phiên bản thứ hai, không phải thứ mười một.
- **Xoá mềm không giải phóng gì.** Tệp đính kèm của bản ghi đã xoá vẫn nằm trong kho và vẫn tải về được nếu ai đó còn giữ đường dẫn.
- **Không có đường khôi phục.** Bản ghi xoá nhầm chỉ lấy lại được bằng can thiệp cơ sở dữ liệu.
- **Hold thắng mọi quyền.** Không có đường vòng cho quản trị viên.
- **Gỡ một đoạn văn bản mật tạo một phiên bản rỗng**, nghĩa là lịch sử phiên bản có một mục trông như không có gì. Người đọc lịch sử cần biết mục rỗng nghĩa là "đã gỡ", không phải "chưa nhập".
- **Đề bài bị sửa sau khi hồ sơ đã ghim phiên bản** là chỗ dễ hiểu nhầm nhất trong toàn hệ thống, và hiện không có giao diện nào cảnh báo.

## Câu hỏi mở và kiểm chứng

- Chưa đo được việc tạo phiên bản trên bản chạy vì cơ sở dữ liệu rỗng. Toàn bộ tài liệu này đọc từ chú thích interface và tên phương thức.
- Chưa rõ chính xác trường nào tính là "nội dung" và trường nào không, ngoài tiêu đề và phần mô tả chính. Cần đọc phần thân của phương thức cập nhật để chốt danh sách.
- Chưa rõ ai đặt và ai gỡ hold được, và có giới hạn số hold mở cùng lúc không.
- Việc không có đường khôi phục bản ghi đã xoá mềm đáng bị đặt lại thành câu hỏi sản phẩm: dữ liệu đã được giữ lại rồi, chỉ thiếu một nút. Xem [B-16](../bug-triage.md#b-16-xoá-mềm-nhưng-không-có-đường-khôi-phục).

Đối chiếu với SourceCode/nacentech, bản chụp ngày 2026-09-04.
