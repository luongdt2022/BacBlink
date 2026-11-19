# ADR-0005: "Xoá người dùng" nghĩa là vô hiệu hoá

- Trạng thái: ACCEPTED
- Ngày: 2026-09-04 (đề xuất), 2026-09-05 (chốt)
- Liên quan: §26.1.8, D2-150; sổ lỗi `docs/02-requirements/san-pham-v2/bug-triage.md` B-02, B-25, B-26, B-39

## Bối cảnh

Bảng quản trị có một nút xoá người dùng. Nó gọi `DELETE /api/v1/admin/users/{id}`, và đo trên bản chạy ngày
2026-09-04 đường đó trả **405 Method Not Allowed** — route tồn tại cho `GET` và `PATCH`, không cho `DELETE`.

Đây không phải một controller quên khai báo. `IPersonService` **cũng không có** phương thức xoá. Năng lực này
thiếu ở cả hai tầng, và mô hình dữ liệu không có chỗ cho nó: `Person` chỉ có cờ `IsActive`, không có trạng
thái đã xoá, không có mốc thời gian xoá.

Hai chuyện nữa nằm cùng chỗ và phải quyết cùng lúc:

- **Nút "Khoá tài khoản" ở danh sách cũng gọi lệnh xoá**, không phải lệnh cập nhật (`useUsersList.ts:98` →
  `userService.ts:90`). Hôm nay vô hại vì 405 che cho nó. **Sửa 405 trước khi sửa nút này sẽ biến một nút
  khoá tài khoản thành một nút xoá.**
- **Hộp thoại tạo người dùng không có ô mật khẩu**, trong khi máy chủ bắt buộc mật khẩu
  (`PersonService.cs:74-76`, bỏ mặc định `12345678` của hệ cũ theo §26.1.8). Nghĩa là mọi lần tạo đều hỏng.

### Điều bản đề xuất chưa đo: một người dùng được tham chiếu từ 24 cột, và không cột nào là khoá ngoại

Đo lược đồ ngày 2026-09-05: **24 cột** trên 11 schema trỏ tới người dùng — chủ sở hữu đề bài và tài sản công
nghệ, tác giả câu chuyện, bên tham gia hồ sơ vụ việc, người ra quyết định trong bản ghi quyết định, người cấp
và người nhận phiếu đọc, người thao tác trong sự kiện kiểm toán, người mở khoá tạm — và **không cột nào có
ràng buộc khoá ngoại**. Đây là chủ ý của MOD-02: module chỉ trao đổi định danh, không tham chiếu bảng của
nhau.

Hệ quả cho lựa chọn "xoá thật": cơ sở dữ liệu **sẽ không ngăn** việc xoá một hàng người dùng, và sau đó 24 cột
ở 11 schema mang những định danh không còn phân giải được — trong đó có `decision_records.decided_by_actor_ref`
và `audit_events.actor_ref`, hai bảng chỉ-ghi-thêm mà cả kiến trúc dựng lên để làm căn cứ. Xoá thật không
"phá vỡ" tính chỉ-ghi-thêm theo nghĩa kỹ thuật — nó để lại bản ghi nguyên vẹn nhưng **trỏ vào hư không**, và
đó là dạng hỏng tệ hơn: nhìn như còn đủ, tra ra thì mất.

### Hai trong ba việc kèm theo đã xong trước khi ADR này chốt

Sprint 2 (2026-09-04) đã làm phần không cần quyết định: nút "Khoá tài khoản" chuyển sang `PATCH` đặt
`isActive = false` (B-26, đo thật trên trình duyệt: bản ghi còn nguyên, `is_active = f`), và hộp thoại tạo người
dùng có ô mật khẩu (B-25). Việc đó làm được vì một nút mang nhãn *khoá* gọi đúng lệnh *khoá* không phải là
quyết định sản phẩm. Phần cần quyết là: **có "xoá" hay không, và nếu có thì nó là gì.**

## Ba lựa chọn

| | Nghĩa là gì | Chi phí | Hệ quả |
|---|---|---|---|
| **A. Không có "xoá"; vô hiệu hoá là thao tác cuối** | Tài khoản bị tắt, không đăng nhập được, dữ liệu ở lại, tác giả nội dung cũ vẫn tra được tên. | Thấp nhất — `PATCH` đã chạy, giao diện đã đổi. | Không đáp ứng yêu cầu xoá dữ liệu cá nhân nếu sau này có. |
| **B. Ẩn danh hoá** | Xoá thông tin định danh (email, tên, điện thoại), giữ hàng và mọi tham chiếu. | Trung bình — cột trạng thái mới, một lệnh nghiệp vụ, và quyết định về việc tên tác giả cũ hiện thế nào. | Đáp ứng yêu cầu xoá dữ liệu cá nhân mà không gãy tham chiếu. Dòng kiểm toán vốn dùng mã nên không ảnh hưởng. |
| **C. Xoá thật** | Xoá hàng. | Cao — 24 cột ở 11 schema phải quyết xử lý thế nào, không có khoá ngoại nào giúp. | Bản ghi quyết định và sự kiện kiểm toán trỏ vào hư không. **Loại.** |

## Quyết định

**Chọn A.** Hệ thống không có thao tác "xoá người dùng". Vô hiệu hoá là thao tác cuối trong vòng đời một tài
khoản, và nó đã chạy được.

Ba lý do, theo thứ tự sức nặng:

1. **Nút xoá đang nói dối về việc nó làm, và cách rẻ nhất để một nút thôi nói dối là bỏ nó.** Không có nhu cầu
   nào được ghi nhận cho việc xoá; có một nhu cầu thật cho việc khoá, và nó đã được đáp ứng.
2. **C bị loại bởi bằng chứng lược đồ, không phải bởi nguyên tắc.** 24 cột tham chiếu, 0 khoá ngoại, hai bảng
   chỉ-ghi-thêm trong số đó. Bất kỳ ai cài đặt C sẽ phải tự viết luật cho 24 chỗ, và luật cho hai chỗ cuối
   không tồn tại — bản ghi quyết định không được sửa.
3. **B không bị A chặn.** Ẩn danh hoá là bước tự nhiên kế tiếp *khi có yêu cầu pháp lý cụ thể*, và nó xây trên
   đúng mô hình mà A giữ nguyên. Chọn B bây giờ là xây một cơ chế xoá dữ liệu cá nhân trước khi có ai yêu cầu
   — và một cơ chế như thế cần câu trả lời cho "tên tác giả của câu chuyện đã xuất bản hiện thế nào sau khi
   ẩn danh", câu mà hôm nay chưa ai hỏi.

## Hệ quả

- **B-02 đóng với lý do "không xây"**, không phải "đã sửa". Đường `DELETE /api/v1/admin/users/{id}` tiếp tục
  trả 405 — và đó là câu trả lời đúng cho một phương thức không tồn tại. Không thêm endpoint `DELETE` nào ở v1
  lẫn v2.
- `deleteUser` trong `userService.ts` của bảng quản trị bị **xoá hẳn**, không chỉ đánh dấu. Sprint 2 giữ nó
  lại kèm chú thích cấm nối, "để lần sửa B-02 có chỗ bắt đầu" — ADR này nói lần sửa đó không có, nên chỗ bắt
  đầu ấy chỉ còn là một khẩu súng đã lên đạn trong một ngăn kéo có dán nhãn.
- Vòng đời tài khoản có đúng ba trạng thái: *chưa kích hoạt* → *đang hoạt động* ⇄ *đã khoá*. Không có trạng
  thái thứ tư.
- **B-39 vẫn mở** và không thuộc ADR này: "không tạo được tài khoản quản trị" là chuyện đầu vòng đời, "xoá
  nghĩa là gì" là chuyện cuối vòng đời. Đội đã xác nhận có tài khoản quản trị, nên B-39 là chấp nhận có ý thức.
- Khi có yêu cầu ẩn danh hoá thật, đó là **ADR mới**, không phải hoàn lại ADR này. Nó sẽ cần: một cột trạng
  thái, một lệnh nghiệp vụ có kiểm quyền và có kiểm toán, và một quyết định về cách hiện tên tác giả cũ.

## Cổng done

1. Không còn chỗ nào trong ba client gọi `DELETE` lên đường người dùng — grep `delete(` trên `userService.ts`
   của bảng quản trị trả **0**.
2. Mục nghiệm thu `NDUNG-03` giữ nguyên trạng thái *pass*: nút khoá vẫn đi `PATCH`, bản ghi vẫn còn sau khi
   bấm. Đây là mục đã đo trên trình duyệt ngày 2026-09-04 và là điều ADR này bảo vệ.

## Đã cài đặt

Ngày 2026-09-05. Phần mã của lựa chọn A gần như đã có từ sprint 2; ADR này khép nốt phần còn lại.

| Việc | Trạng thái |
|---|---|
| Nút "Khoá tài khoản" → `PATCH isActive=false` (B-26) | Xong 2026-09-04, đo trên trình duyệt: bản ghi còn nguyên, `is_active = f` |
| Ô mật khẩu trong hộp thoại tạo người dùng (B-25) | Xong 2026-09-04, đo trên trình duyệt |
| Xoá hẳn `deleteUser` khỏi `userService.ts` | Xong 2026-09-05 — `grep apiClient.delete` trong tệp đó: **0** |
| Không thêm endpoint `DELETE` | Giữ nguyên; 405 là câu trả lời đúng |
| B-02 | Đóng với lý do "không xây" |

Cổng done 1 đo được ngay: không còn lời gọi `DELETE` nào lên đường người dùng ở bảng quản trị. Cổng done 2 là
mục nghiệm thu `NDUNG-03` đã pass ngày 2026-09-04 và không có gì đổi để làm nó đỏ.

Không có test mới ở backend, và đó là chủ ý: ADR này **bỏ** một năng lực chứ không thêm. Thứ canh nó là sự
vắng mặt — không có `HttpDelete` nào trên `AdminUsersController`, không có `DeleteAsync` nào trên
`IPersonService` — và bài kiến trúc `V2_does_not_depend_on_the_v1_facade` bảo đảm không ai "tiện tay" thêm
một đường xoá ở v2 mà bỏ qua ADR này.
