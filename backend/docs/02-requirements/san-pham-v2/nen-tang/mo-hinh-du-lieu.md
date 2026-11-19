# Mô hình dữ liệu

Tài liệu này sở hữu: bản ghi nào tồn tại, chúng có những trạng thái nào, và hồ sơ vụ việc đi qua 12 giai đoạn theo ma trận nào. Tài liệu khác liên kết tới đây thay vì vẽ lại bảng.

Định nghĩa một dòng của từng từ nằm ở [`../glossary.md`](../glossary.md). Ở đây là các con số và luật.

## Hai lớp bản ghi

Backend .NET chia bản ghi làm hai lớp, và sự chia này giải thích phần lớn khoảng cách giữa nó với ba frontend.

**Lớp một — có mặt ở giao diện hôm nay.** Người, đề bài, tài sản công nghệ, câu chuyện, lĩnh vực, danh mục, lời mời hợp tác, thông báo, tài liệu đính kèm. Tất cả đều được di trú một-đối-một từ NacenTwin và đều có đường HTTP qua facade v1.

**Lớp hai — có mã chạy được nhưng không có cửa.** Hồ sơ vụ việc, bản ghi quyết định, hồ sơ môi giới, phân công, cấp quyền đọc, ảnh chụp chính sách, vòng ghép cặp, sự kiện kiểm toán. Không bản ghi nào trong nhóm này có endpoint, và vì thế không màn hình nào chạm tới được.

## Người

Một tài khoản. Email là duy nhất. Trạng thái chỉ có hai bit: đã kích hoạt chưa, và còn hoạt động không. Vòng đời và các luật mật khẩu ở [`xac-thuc-va-vai-tro.md`](xac-thuc-va-vai-tro.md).

Ngoài hồ sơ, mỗi người có một bản ghi tuỳ chọn riêng, hiện chỉ chứa đúng một cờ: **tự động ghép cặp**. Bật thì hệ thống tự tính ứng viên khi nội dung đổi; tắt thì phải bấm tay.

## Đề bài và tài sản công nghệ

Hai loại nội dung chính, được người dùng đăng. Hệ cũ gộp cả hai vào một bảng `intakes` phân biệt bằng cột `type`; hệ mới tách hẳn thành hai module, nhưng facade v1 vẫn trình bày chúng như một để giao diện cũ không phải sửa.

| | Đề bài | Tài sản công nghệ |
|---|---|---|
| Từ hệ cũ | `intakes(type=challenge)` | `intakes(type=ip)` |
| Trạng thái xuất bản | `DRAFT`, `PUBLISHED` | `DRAFT`, `PUBLISHED` |
| Trường nội dung chính | Tiêu đề, phần mô tả bài toán | Tiêu đề, phần mô tả |
| Có thêm | — | **Mức chất lượng** |
| Nhãn | Nhiều lĩnh vực, một danh mục | Nhiều lĩnh vực, một danh mục |
| Trường AI | Tiêu đề do AI viết lại, nội dung do AI xử lý, trạng thái xử lý, trạng thái cắt đoạn | Như đề bài |
| Xoá | Xoá mềm | Xoá mềm |

Cả hai có **phiên bản**: sửa tiêu đề hoặc phần nội dung chính tạo một phiên bản mới bất biến chứ không ghi đè. Chi tiết ở [`luu-va-phien-ban.md`](luu-va-phien-ban.md).

Trạng thái xuất bản **chỉ có hai giá trị**. Không có `QUALIFIED`: việc một đề bài đã đủ điều kiện hay chưa là chuyện của *giai đoạn* trong hồ sơ vụ việc, không phải thuộc tính của bản thân đề bài. Dữ liệu di trú từ hệ cũ vì thế không được tự gắn trạng thái đó.

### Mức chất lượng của tài sản công nghệ

Bốn bậc, chỉ tài sản công nghệ có:

```
UNREVIEWED → SELF_DECLARED → REVIEWED → TRANSACTION_READY
```

Mọi tài sản tạo mới, và mọi tài sản di trú từ hệ cũ, đều ở `UNREVIEWED`. **Không đường nào tự động gán `TRANSACTION_READY`** — nó phải đi qua một cổng có người quyết định. Cổng đó chưa tồn tại: không có endpoint nào đổi mức này và không có màn hình nào hiển thị nó. Xem [`../moi/cong-chat-luong-cong-nghe.md`](../moi/cong-chat-luong-cong-nghe.md).

Hệ quả hôm nay: mọi tài sản công nghệ trong hệ thống đều mang mức thấp nhất, và không ai nhìn thấy điều đó.

## Subject

Cách hệ thống trỏ tới một bản ghi mà không cần biết kiểu cụ thể, viết `KIND:id`. Bốn kiểu:

`DEMAND_BRIEF` · `TECHNOLOGY_ASSET` · `COMMERCIALIZATION_CASE` · `PERSON`

Ba thứ treo vào subject thay vì vào một bảng cụ thể: **tài liệu** trong phòng dữ liệu, **đoạn văn bản** trong chỉ mục tìm kiếm, và **lời mời hợp tác**. Nhờ vậy một tài liệu mật gắn được vào đề bài, vào công nghệ hay vào hồ sơ vụ việc bằng đúng một cơ chế.

Người dùng không bao giờ nhìn thấy chuỗi này. Nó xuất hiện ở đây vì nó giải thích vì sao lời mời hợp tác được phát biểu là "giữa hai subject" chứ không phải "giữa hai người": luật kiểm tra là **hai subject phải khác kiểu nhau** — một đề bài chỉ mời được một công nghệ và ngược lại, không mời được đề bài khác.

## Mức mật

Bốn mức, có thứ tự:

```
Public < Internal < Confidential < HighlyConfidential
```

Từ `Confidential` trở lên gọi là **mật**. Ánh xạ từ hệ cũ: không mức → `Public`, `level2` → `Confidential`, `level3` → `HighlyConfidential`.

Hệ cũ chỉ có một cột đánh dấu mức và **không kiểm soát ai được đọc**. Hệ mới đưa mọi tài liệu qua phòng dữ liệu và yêu cầu một *cấp quyền đọc* cho mọi thứ từ `Confidential` trở lên. Đây là một trong bảy thay đổi có chủ đích, và là thay đổi có hệ quả lớn nhất với giao diện: nội dung mà giao diện cũ hiển thị thẳng nay cần một phiếu quyền, và **chưa có màn hình nào cấp phiếu đó**.

## Tài liệu

Ba loại, gắn vào một subject:

| Loại | Là gì | Điểm riêng |
|---|---|---|
| `FILE` | Tệp tải lên | Có tên, kiểu nội dung, kích thước, khoá lưu trữ |
| `PROFILE_PICTURE` | Ảnh đại diện | Đặt ảnh mới **xoá ảnh cũ**, không giữ lịch sử |
| `TEXT_SECTION` | Một đoạn nội dung mật lưu dưới dạng văn bản | Mức mật suy ra từ mã đoạn, không do người đặt |

Bốn mã đoạn văn bản, giữ nguyên tên từ hệ cũ để facade ánh xạ một-đối-một: nội dung mức 2, bản do AI xử lý của mức 2, nội dung mức 3, bản do AI xử lý của mức 3. Hai mã đầu cho ra mức `Confidential`, hai mã sau cho ra `HighlyConfidential`.

Gỡ một đoạn văn bản không xoá nó; nó tạo một phiên bản mới rỗng. Lịch sử vẫn còn.

## Cấp quyền đọc

Một phiếu gồm: subject nào, cho ai, **mục đích** gì, **mức trần** tới đâu, hiệu lực từ khi nào tới khi nào, và đã thu hồi chưa.

Không có phiếu thì tài liệu mật không hiện ra trong danh sách — không phải "hiện ra rồi báo lỗi khi bấm", mà là không có trong kết quả. Lượt bị từ chối được ghi vào nhật ký kiểm toán.

Mục đích tồn tại để câu hỏi "tại sao người này xem được cái này" có câu trả lời sau nhiều tháng. Nó được chép vào từng dòng kiểm toán mỗi lần người đó đọc.

## Hồ sơ vụ việc

Đơn vị công việc của môi giới. Đây là lõi của kiến trúc V2 và là bản ghi **hoàn toàn không có ở giao diện**.

Một hồ sơ có: mã hồ sơ, một *tuyến*, một *giai đoạn*, tiêu đề, chủ bài toán, môi giới chính (có thể chưa có), một đề bài kèm số phiên bản của đề bài đó, một ảnh chụp chính sách (có thể chưa có), mức mật, tình trạng đường ngân sách, hạn ra quyết định, cờ đang có hold, số phiên bản, và danh sách bên tham gia.

Việc hồ sơ ghim **số phiên bản của đề bài** chứ không chỉ định danh của nó là có chủ ý: đề bài sửa sau đó không làm đổi cái mà hồ sơ đang xử lý.

### Tuyến

Ba tuyến, quyết định bộ chính sách áp lên hồ sơ:

`CHALLENGE_PILOT` — thí điểm theo đề bài · `TECHNOLOGY_TRANSFER` — chuyển giao công nghệ · `SHARED_INFRASTRUCTURE` — hạ tầng dùng chung

### Bên tham gia

Bảy vai trò, **chỉ có hiệu lực trong hồ sơ đó**: `PROBLEM_OWNER`, `LEAD_BROKER`, `CO_BROKER`, `PROVIDER`, `EVALUATOR`, `VERIFIER`, `SPONSOR`. Mỗi bên có mốc bắt đầu và có thể có mốc kết thúc, nên lịch sử ai từng tham gia không bị mất khi họ rời đi.

### Tình trạng đường ngân sách

Sáu giá trị: `UNKNOWN` (mặc định), `OWNER_FUNDED`, `SPONSOR_FUNDED`, `FINANCE_REQUIRED`, `MIXED`, `CONFIRMED`.

### Mười hai giai đoạn

Tám giai đoạn tiến, bốn giai đoạn kết thúc:

```
DISCOVERY → QUALIFICATION → MATCHING → DUE_DILIGENCE → DEAL_DESIGN
          → EXECUTION → OUTCOME_VERIFICATION → COMMERCIALIZATION_MONITORING → CLOSED
```

Bốn giai đoạn kết thúc: `CLOSED`, `REJECTED`, `WITHDRAWN`, `CANCELLED`. Vào rồi thì **không đi đâu được nữa** — không có đường mở lại hồ sơ.

### Ma trận chuyển

Đây là bảng chịu lực nhất của toàn hệ thống. Chuyển nằm ngoài bảng này **bị từ chối bất kể người thao tác có quyền gì**.

| Từ | Được phép sang |
|---|---|
| `DISCOVERY` | `QUALIFICATION`, `REJECTED`, `WITHDRAWN` |
| `QUALIFICATION` | `MATCHING`, `DISCOVERY`, `REJECTED`, `WITHDRAWN` |
| `MATCHING` | `DUE_DILIGENCE`, `QUALIFICATION`, `REJECTED`, `WITHDRAWN` |
| `DUE_DILIGENCE` | `DEAL_DESIGN`, `MATCHING`, `REJECTED`, `WITHDRAWN` |
| `DEAL_DESIGN` | `EXECUTION`, `DUE_DILIGENCE`, `WITHDRAWN`, `CANCELLED` |
| `EXECUTION` | `OUTCOME_VERIFICATION`, `CANCELLED` |
| `OUTCOME_VERIFICATION` | `COMMERCIALIZATION_MONITORING`, `EXECUTION`, `CLOSED` |
| `COMMERCIALIZATION_MONITORING` | `CLOSED` |
| `CLOSED`, `REJECTED`, `WITHDRAWN`, `CANCELLED` | *(không đi đâu)* |

Đọc bảng này cho ra vài luật mà giao diện phải phản ánh:

- **Từ chối chỉ có tới hết `DUE_DILIGENCE`.** Từ `DEAL_DESIGN` trở đi, đường ra là *rút lui* hoặc *huỷ*, không phải *từ chối*. Ngôn ngữ trên nút phải đổi theo giai đoạn.
- **Lùi được đúng một bậc**, và chỉ trong nửa đầu. `EXECUTION` không lùi được về `DEAL_DESIGN`.
- **`OUTCOME_VERIFICATION` là ngã ba**: đi tiếp sang theo dõi thương mại hoá, quay lại thi công, hoặc đóng thẳng.
- **`EXECUTION` không rút lui được**, chỉ huỷ. Đã bắt đầu làm thì đường ra khác đường ra lúc chưa làm.

### Ràng buộc ngoài ma trận

Bốn luật nữa, độc lập với ma trận:

1. **Hồ sơ đang có hold mở không chuyển được**, kể cả khi ô trong ma trận hợp lệ.
2. **Vào `QUALIFICATION` bắt buộc phải có môi giới chính.**
3. **Vào `QUALIFICATION` thì ảnh chụp chính sách được chốt.** Sau đó chính sách nền tảng đổi cũng không đổi ảnh chụp.
4. **Mỗi lần chuyển ghi một bản ghi quyết định** trong cùng giao dịch với việc đổi giai đoạn: từ đâu, sang đâu, quyết định gì, mã lý do, diễn giải, ai quyết, tham chiếu uỷ quyền, ảnh chụp chính sách nào đang áp.

Bốn loại quyết định: `APPROVE`, `REJECT`, `RETURN_FOR_REWORK`, `WAIVE`.

Bản ghi quyết định **chỉ ghi thêm**. Sửa một quyết định nghĩa là ghi một quyết định mới thay thế nó, và bản cũ vẫn còn trong dòng thời gian.

## Môi giới và phân công

Hồ sơ môi giới: trạng thái (`ACTIVE` / `SUSPENDED`), một **capacity**, danh sách lĩnh vực phụ trách, và số phân công đang hoạt động.

Phân công: hồ sơ nào, môi giới nào, vai trò `LEAD` hay `CO`, trạng thái `ACTIVE` hay `ENDED`, thời điểm giao, hạn cam kết, thời điểm kết thúc.

Giao thêm khi đã đầy capacity bị **từ chối thẳng** với mã `CAPACITY_EXCEEDED` — hồ sơ không bị âm thầm bỏ rơi.

## Câu chuyện

Kiểu `SUCCESS` hoặc `FAILURE`. Trạng thái `DRAFT` hoặc `PUBLISHED`. Thêm một cờ **bị ẩn** do quản trị viên đặt, độc lập với trạng thái.

Ba trạng thái nhìn thấy được, không phải hai: bản nháp (chỉ tác giả thấy), đã xuất bản (mọi người thấy), đã xuất bản nhưng bị ẩn (tác giả vẫn thấy trong danh sách của mình, công chúng không thấy). Trang giới thiệu lọc thêm theo vai trò tác giả, nên nó phân biệt được câu chuyện do người dùng viết với câu chuyện do quản trị viên đăng.

## Lĩnh vực và danh mục

Hai loại nhãn, `SECTOR` và `CATEGORY`, cùng một bảng, phân biệt bằng loại. Mỗi nhãn có tên và một cờ còn hiệu lực.

**Xoá là vô hiệu hoá.** Nhãn đã gắn vào bản ghi cũ vẫn tra được tên. Danh sách chọn chỉ hiện nhãn còn hiệu lực; danh sách hiển thị vẫn hiện tên nhãn đã tắt.

Một bản ghi có **nhiều lĩnh vực** nhưng **một danh mục**.

## Vòng ghép cặp

Một lần tính ứng viên cho một subject, ghi lại: phiên bản công cụ tìm kiếm, phiên bản mô hình nhúng, chế độ chấm điểm, số ứng viên, thời điểm.

**Vòng cũ chỉ đọc.** Tính lại tạo vòng mới. Nhờ vậy so sánh được hai lần tính cách nhau vài tháng, và biết được kết quả đổi là do dữ liệu đổi hay do thuật toán đổi.

Ba giá trị phiên bản công cụ có ý nghĩa với người đọc: bản PostgreSQL (pgvector) chấm điểm kiểu cũ, bản PostgreSQL chấm điểm đã sửa, và bản **nhập từ hệ cũ** (hai nhãn Elasticsearch cũ chỉ còn là lịch sử từ ADR-0010) — vòng được di trú từ bảng match của NestJS chứ không phải tính lại.

Facade v1 chỉ trả danh sách ứng viên phẳng, không lộ ra vòng nào, chế độ nào, phiên bản nào. Toàn bộ thông tin này có trong dữ liệu và không tới được người dùng. Xem [`../moi/vong-ghep-cap.md`](../moi/vong-ghep-cap.md).

## Sự kiện kiểm toán

Một dòng **chỉ ghi thêm**, không có đường sửa và không có đường xoá. Gồm: ai (mã ẩn danh, không phải thông tin cá nhân), vai trò, hành động, loại đối tượng, định danh đối tượng, phiên bản đối tượng, mục đích, kết quả `PERMIT` hay `DENY`, mã quy tắc đã quyết, mã tương quan, thời điểm, chi tiết.

Ghi bằng **một giao dịch riêng**, không đi theo giao dịch của lệnh. Đây là một lựa chọn có chủ đích và lý do được ghi lại trong mã: từ chối truy cập luôn kết thúc bằng một ngoại lệ, nên dòng kiểm toán nằm chung giao dịch sẽ bị cuộn ngược cùng, và hệ thống im lặng đúng ở tình huống cần dấu vết nhất. Đường đọc tài liệu cũng không commit gì, nên cả lượt được phép đọc dữ liệu mật cũng sẽ mất.

Cái giá phải trả: **một lệnh thất bại vẫn để lại dòng kiểm toán**. Nhật ký vì thế có những dòng mô tả việc không xảy ra, và ai đọc nó phải đọc cả trường kết quả chứ không chỉ trường hành động. Xem [`../moi/nhat-ky-kiem-toan.md`](../moi/nhat-ky-kiem-toan.md).

Địa chỉ IP và trình duyệt được lưu kèm nhưng có **thời hạn riêng, ngắn hơn**; hết hạn thì hai trường đó bị cắt còn dòng kiểm toán vẫn nguyên.

## Cái chưa có trong mã

Kiến trúc đích còn nhiều thứ mà bản này cố ý chưa mở: đánh giá, thương vụ, thi công, kết quả; tài chính, chương trình, hoá đơn; mạng lưới chuyên gia; dịch vụ chuyên nghiệp; hộ chiếu bằng chứng; mạng lưới đối tác; hồ sơ năng lực có phiên bản; xoá bằng cách huỷ khoá mã hoá; khoá ghi trên kho đối tượng.

Điều này quan trọng khi đọc giao diện cổng người dùng: các khu vực `services`, `valuation`, `infrastructure` đang vẽ ra những thứ thuộc nhóm trên. Chúng không phải bị bỏ quên — chúng nằm ngoài phạm vi bản phát hành này. Xem [`../portal/khu-vuc-chua-co-backend.md`](../portal/khu-vuc-chua-co-backend.md).

## Tương tác với hệ thống khác

**Quyền và vai trò.** Vai trò trong hồ sơ vụ việc và vai trò nền tảng là hai thứ khác nhau; xem [`xac-thuc-va-vai-tro.md`](xac-thuc-va-vai-tro.md).

**Kiểm tra dữ liệu và cách hiện lỗi.** Ma trận chuyển là luật ở tầng dịch vụ; giao diện nên chỉ hiện những nút hợp lệ thay vì để người dùng bấm rồi bị từ chối.

**Thay đổi chưa lưu.** Xem [`luu-va-phien-ban.md`](luu-va-phien-ban.md).

**Cập nhật lạc quan và hoàn tác.** Không bản ghi nào hoàn tác được. Quay lại nghĩa là ghi thêm.

**Ngoại tuyến.** Không có tương tác.

**Thông báo và toast.** Bốn loại thông báo tồn tại: tìm được ứng viên, nhận lời mời, lời mời được chấp nhận, lời mời bị từ chối. Không có loại nào cho hồ sơ vụ việc.

**Trạng thái lọc/tìm trong URL.** Không có tương tác.

**Đa ngôn ngữ.** Tên giai đoạn, tuyến, vai trò và quyết định lưu bằng chuỗi tiếng Anh viết hoa. Giao diện phải tự dịch; không có bảng dịch nào ở phía máy chủ.

**Dấu vết kiểm toán.** Mọi bản ghi ở đây đều sinh sự kiện kiểm toán khi bị đổi.

## Trường hợp biên

- **Mức chất lượng không đổi được bằng bất kỳ cách nào** qua API hiện có. Mọi tài sản công nghệ đứng yên ở `UNREVIEWED`.
- **Giai đoạn kết thúc là một chiều.** Đóng nhầm một hồ sơ thì không mở lại được; đường duy nhất là tạo hồ sơ mới.
- **Hold thắng mọi quyền.** Người có quyền cao nhất vẫn không chuyển được giai đoạn khi còn hold mở.
- **Đề bài bị sửa sau khi hồ sơ đã ghim phiên bản.** Hồ sơ tiếp tục xử lý phiên bản cũ; giao diện phải nói rõ điều đó, nếu không hai người sẽ nhìn hai nội dung khác nhau mà tưởng là một.
- **Ảnh đại diện không có lịch sử** trong khi mọi tài liệu khác đều có.
- **Nhãn đã tắt vẫn hiện tên** ở bản ghi cũ nhưng không chọn được ở bản ghi mới. Người dùng thấy một nhãn ở màn hình xem mà không tìm thấy nó ở màn hình sửa.
- **`SubjectRef` phân tích từ chuỗi có thể ném lỗi định dạng.** Chuỗi hỏng trong dữ liệu di trú sẽ nổ ở chỗ đọc chứ không ở chỗ ghi.

## Câu hỏi mở và kiểm chứng

- Chưa có dữ liệu trong cơ sở dữ liệu nên chưa đo được hình dạng thật của bất kỳ bản ghi nào; toàn bộ tài liệu này đọc từ khai báo kiểu và chú thích.
- Chưa chạy bộ test bất biến, nơi ma trận chuyển được phủ hết mọi ô hợp lệ và ô bị cấm. Chạy nó là cách rẻ nhất để xác nhận bảng ở trên.
- Chưa rõ tình trạng đường ngân sách được đặt ở đâu: sáu giá trị tồn tại nhưng chưa thấy đường nào đổi nó.
- Chưa rõ hạn ra quyết định được ai đặt và có gì nhắc khi quá hạn.
- Việc không có loại thông báo nào cho hồ sơ vụ việc trong khi hồ sơ là lõi của hệ thống có vẻ là một thiếu sót hơn là một quyết định; cần hỏi lại khi thiết kế console.

Đối chiếu với SourceCode/nacentech, bản chụp ngày 2026-09-04.
