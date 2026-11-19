# Điều hướng và URL

Tài liệu này sở hữu danh sách route của ba bề mặt, cái gì nằm trong URL, và cái gì được khôi phục khi người dùng quay lại. Tài liệu của từng màn hình liên kết tới đây thay vì liệt kê lại.

## Bảng quản trị

Một route công khai (`/login`) và mọi thứ còn lại nằm dưới một lớp bảo vệ chung. Chưa đăng nhập thì bị đưa về `/login`; trong lúc lớp phiên còn đang xác nhận token, mọi route bảo vệ hiển thị một màn xám với dòng "Đang tải…".

| Route | Màn hình |
|---|---|
| `/login` | [Đăng nhập](../admin/dang-nhap.md) |
| `/` | Chuyển thẳng sang `/dashboard` |
| `/dashboard` | [Bảng điều khiển](../admin/bang-dieu-khien.md) |
| `/users` | [Danh sách người dùng](../admin/nguoi-dung.md) |
| `/user-profile/:id` | [Hồ sơ một người dùng](../admin/ho-so-nguoi-dung.md) |
| `/intakes`, `/intakes/create`, `/intakes/detail`, `/intakes/edit` | [Đề bài và công nghệ](../admin/de-bai-va-cong-nghe.md) — danh sách gộp |
| `/ips`, `/ips/create`, `/ips/detail`, `/ips/edit` | Tài sản công nghệ |
| `/challenges`, `/challenges/create`, `/challenges/detail`, `/challenges/edit` | Đề bài |
| `/implementations`, `/implementations/create`, `/implementations/detail` | [Hồ sơ triển khai](../admin/trien-khai.md) |
| `/categories` | [Lĩnh vực và danh mục](../admin/danh-muc.md) |
| `/stories`, `/stories/create`, `/stories/:id`, `/stories/:id/edit` | [Câu chuyện](../admin/cau-chuyen.md) |
| `*` | Trang không tìm thấy, nằm trong khung có thanh bên |

Hai kiểu đặt route sống chung ở đây và chúng hành xử khác nhau:

- **Câu chuyện dùng tham số đường dẫn**: `/stories/:id`. Sao chép URL rồi dán vào tab khác cho ra đúng câu chuyện đó.
- **Đề bài, công nghệ và hồ sơ triển khai dùng route tĩnh**: `/ips/detail`, `/challenges/edit`, `/implementations/detail` — **không có định danh trong đường dẫn**. Bản ghi đang xem được truyền qua trạng thái điều hướng hoặc query string chứ không qua đường dẫn.

Hệ quả của kiểu thứ hai: URL không chia sẻ được. Gửi `/ips/detail` cho đồng nghiệp thì họ không mở được bản ghi đó. Tải lại trang cũng mất bản ghi nếu định danh nằm trong trạng thái điều hướng. Xem [B-17](../bug-triage.md#b-17-route-chi-tiết-không-có-định-danh-trong-đường-dẫn).

**Đích đến sau đăng nhập không được dùng.** Lớp bảo vệ có ghi lại vị trí người dùng định tới khi đẩy họ về `/login`, nhưng trang đăng nhập không đọc nó và luôn chuyển sang `/dashboard`. Bấm một liên kết sâu khi phiên đã hết hạn thì hạ cánh sai chỗ. Xem [B-11](../bug-triage.md#b-11-đích-đến-sau-đăng-nhập-bị-ghi-lại-nhưng-không-được-dùng).

## Cổng người dùng

Sáu route công khai, phần còn lại nằm dưới lớp bảo vệ.

| Route | Màn hình |
|---|---|
| `/login`, `/register` | [Đăng ký và kích hoạt](../portal/dang-ky-va-kich-hoat.md) |
| `/verify-email`, `/activate-account` | Cùng một trang xác nhận email, hai đường vào |
| `/forgot-password`, `/reset-password` | Quên và đặt lại mật khẩu |
| `/` | Chuyển thẳng sang `/ips` |
| `/ips`, `/ips/create`, `/ips/:id`, `/ips/:id/edit` | [Công nghệ của tôi](../portal/de-bai-va-cong-nghe-cua-toi.md) |
| `/challenges`, `/challenges/create`, `/challenges/:id`, `/challenges/:id/edit` | Đề bài của tôi |
| `/stories`, `/stories/create`, `/stories/:id`, `/stories/:id/edit` | [Câu chuyện](../portal/cau-chuyen.md) |
| `/my/collaboration-requests` | [Lời mời hợp tác](../portal/loi-moi-hop-tac.md) |
| `/settings` | [Thông báo và cài đặt](../portal/thong-bao-va-cai-dat.md) |
| `/marketplace`, `/marketplace/ip/:id`, `/marketplace/challenge/:id` | [Chợ giao dịch](../portal/cho-giao-dich.md) — **vỏ, dữ liệu viết cứng** |
| `/contact` | [Liên hệ](../portal/khu-vuc-chua-co-backend.md) — vỏ |
| `*` khi đã đăng nhập | Chuyển về `/ips`, giữ trong khung chung |
| `*` khi chưa đăng nhập | Chuyển về `/login` |

Khác bảng quản trị, cổng người dùng dùng **tham số đường dẫn ở mọi màn chi tiết**. URL chia sẻ được và tải lại được.

Trang đích sau đăng nhập là `/ips`, không phải một bảng điều khiển. Cổng người dùng không có bảng điều khiển.

### Bốn khu vực bị gỡ khỏi định tuyến

`deal-room`, `infrastructure`, `services` và `valuation` có đủ trang và đủ hàm bọc route, nhưng khối định nghĩa route của chúng **bị comment lại**, kèm chú thích "Hidden until these sections are ready for use". Tổng cộng 24 route không tồn tại.

Đây là một quyết định đúng và có ý thức: không phát hành cái chưa có backend. Nó cũng có nghĩa là gõ thẳng `/deal-room` vào thanh địa chỉ sẽ rơi vào nhánh bắt-tất-cả và bị đưa về `/ips`, không phải trang không tìm thấy.

`marketplace` và `contact` thì **không** bị ẩn. Chúng đang chạy với dữ liệu viết cứng. Xem [`../portal/cho-giao-dich.md`](../portal/cho-giao-dich.md).

## Trang giới thiệu

Không có bộ định tuyến. Toàn bộ ứng dụng là một trang, cuộn theo mục. Không route nào, không tham số nào, không trạng thái nào nằm trong URL.

Có một bộ chuyển ngôn ngữ, và lựa chọn ngôn ngữ **không** nằm trong URL — nó là trạng thái trong bộ nhớ. Tải lại trang mất lựa chọn đó. Xem [`../landing/trang-chu-va-cau-chuyen.md`](../landing/trang-chu-va-cau-chuyen.md).

## Cái gì nằm trong URL

Tổng kết cho cả ba bề mặt:

| Thứ | Có trong URL? |
|---|---|
| Định danh bản ghi ở cổng người dùng | Có, trong đường dẫn |
| Định danh bản ghi ở bảng quản trị | Chỉ với câu chuyện. Các màn khác không có. |
| Số trang | Không ở bất kỳ đâu |
| Bộ lọc và từ khoá tìm | Không ở bất kỳ đâu |
| Tab đang mở trong màn hồ sơ người dùng | Không |
| Ngôn ngữ ở trang giới thiệu | Không |

Hệ quả chung: **bấm Back sau khi lọc hoặc phân trang không quay lại kết quả trước**. Nó rời khỏi màn hình. Người dùng lọc một danh sách dài, mở một bản ghi, rồi bấm Back sẽ thấy danh sách trở về trang 1 không lọc.

Không có màn hình nào khôi phục trạng thái lọc từ bất kỳ đâu — không URL, không lưu trữ cục bộ, không bộ nhớ phiên.

## Điều hướng thay chỗ và điều hướng thêm mục

Hai chỗ dùng điều hướng **thay chỗ** trong lịch sử thay vì thêm mục mới:

- Sau khi đăng nhập thành công. Bấm Back không quay lại trang đăng nhập.
- Mọi chuyển hướng mặc định (`/` sang `/dashboard` hoặc `/ips`, nhánh bắt-tất-cả). Bấm Back không rơi vào vòng lặp chuyển hướng.

Mọi điều hướng khác thêm mục mới.

## Tương tác với hệ thống khác

**Quyền và vai trò.** Lớp bảo vệ chỉ kiểm "đã đăng nhập chưa", không kiểm vai trò. Việc chỉ `ADMIN` vào được bảng quản trị được đảm bảo ở tầng đăng nhập — nó không cấp token cho vai trò khác — chứ không ở tầng định tuyến. Một token `USER` hợp lệ được nhét thủ công vào cookie `admin_token` sẽ qua được lớp bảo vệ và chỉ bị chặn ở từng lời gọi API. Xem [B-18](../bug-triage.md#b-18-lớp-bảo-vệ-của-admin-không-kiểm-vai-trò).

**Kiểm tra dữ liệu và cách hiện lỗi.** Không có tương tác.

**Thay đổi chưa lưu.** Không route nào chặn việc rời đi khi biểu mẫu còn bẩn.

**Cập nhật lạc quan và hoàn tác.** Không có tương tác.

**Ngoại tuyến.** Định tuyến là phía trình duyệt nên vẫn chạy khi mất mạng; chỉ dữ liệu là không tải được.

**Thông báo và toast.** Toast không tồn tại qua một lần điều hướng.

**Trạng thái lọc/tìm trong URL.** Đây là tài liệu sở hữu, và câu trả lời là: không có gì trong URL.

**Đa ngôn ngữ.** Chỉ trang giới thiệu có chuyển ngôn ngữ, và nó không nằm trong URL.

**Khả năng truy cập.** Chưa rà xem điều hướng có chuyển focus về đầu trang hay thông báo cho trình đọc màn hình sau mỗi lần đổi route không.

**Dấu vết kiểm toán.** Điều hướng không sinh sự kiện kiểm toán; chỉ lời gọi API mới sinh.

## Trường hợp biên

- **`/verify-email` và `/activate-account` là cùng một trang.** Hai đường vào tồn tại vì cấu hình phía máy chủ dựng liên kết kích hoạt bằng đường dẫn thứ hai, còn giao diện dùng đường dẫn thứ nhất ở nơi khác.
- **Route bắt-tất-cả của cổng người dùng đưa về `/ips`, không phải trang lỗi.** Người dùng gõ sai địa chỉ không biết là mình gõ sai; họ chỉ thấy mình ở một chỗ khác.
- **`/ips/detail` không chia sẻ được ở bảng quản trị**, trong khi `/ips/:id` chia sẻ được ở cổng người dùng. Cùng một loại dữ liệu, hai kiểu URL.
- **Bấm Back mất bộ lọc** ở mọi danh sách của cả ba bề mặt.
- **Gõ thẳng một route đã bị comment** ở cổng người dùng không cho trang lỗi; nó im lặng đưa về `/ips`.

## Câu hỏi mở và kiểm chứng

- Chưa dựng bất kỳ frontend nào, nên chưa xác nhận cách các route tĩnh của bảng quản trị truyền định danh: qua trạng thái điều hướng, qua query string, hay qua một kho trạng thái toàn cục. Điều này quyết định chuyện tải lại trang có mất bản ghi không.
- Chưa xác nhận điều gì hiện ra khi tải thẳng `/ips/detail` mà không có định danh.
- Chưa rà thanh bên của cả hai cổng để biết mục nào dẫn tới route nào, và có mục nào dẫn tới route đã bị comment không.
- Chưa kiểm focus và thông báo cho trình đọc màn hình sau mỗi lần đổi route.

Đối chiếu với SourceCode/dmst-admin-main, SourceCode/dmst-user-main và SourceCode/dmst-landing-page-main, bản chụp ngày 2026-09-04.
