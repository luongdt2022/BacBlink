# ADR-0009: Endpoint `/api/v2` đặt ở `apps/api/V2/`, không phân tán về từng module

- Trạng thái: ACCEPTED
- Ngày: 2026-09-04 (đề xuất và chốt)
- Liên quan: MOD-02, D2-148; `docs/02-requirements/san-pham-v2/HUONG-DAN-TRIEN-KHAI.md` mục "Phía backend"; sổ lỗi `docs/02-requirements/san-pham-v2/bug-triage.md` B-01, B-03

## Bối cảnh

`/api/v2` được quảng cáo nhưng có **0 endpoint**. Toàn bộ 95 attribute HTTP hiện có nằm ở `apps/api/V1Compat/`,
trải trên 24 tiền tố route, tất cả `/api/v1`. Ba middleware (`ApiExceptionMiddleware`, `V1SunsetMiddleware`,
`IdempotencyMiddleware`) đã cắm sẵn và `V1SunsetMiddleware` đang trả header `Link: </api/v2>` trỏ tới một bộ
đường dẫn 404.

Sáu năng lực có tầng dịch vụ hoàn chỉnh và không có cửa HTTP nào: hồ sơ vụ việc (8 thao tác), môi giới (6),
tra cứu kiểm toán, ảnh chụp chính sách, cấp và thu hồi quyền đọc, vòng ghép cặp. Chúng không thể đi qua
`V1Compat/` — chú thích ở `V1ControllerBase.cs:11` nói rõ nơi đó **không nhận endpoint mới**, và đó là điều
kiện để cả thư mục biến mất cùng facade tại sunset 31/03/2027.

Nên câu hỏi phải trả lời trước dòng mã đầu tiên là: endpoint mới đặt ở đâu. Sửa sau là di chuyển 18 nhóm
endpoint, nên đây là quyết định một chiều trên thực tế dù không phải trên lý thuyết.

### Ràng buộc đã đo được, không phải giả định

| Sự kiện | Đo ở đâu |
|---|---|
| `AddControllers` chỉ quét assembly khởi động | `Program.cs:74`; module muốn khai controller phải thêm `AddApplicationPart` cho từng assembly |
| `modules/*` hiện khai **0** endpoint | grep `ApiController\|MapPost\|MapGroup\|IEndpointRouteBuilder` trên `modules/**/*.cs` → 0 tệp |
| Middleware chống lặp **chỉ** chặn lệnh ghi | `IdempotencyMiddleware.cs:19` — `GET` trên `/api/v2` đi thẳng qua |
| Tài liệu OpenAPI tên "v2" đang chứa toàn đường v1 | `Program.cs:85` khai đúng một document tên `v2` |

Ràng buộc thứ ba là thứ định hình kế hoạch triển khai: **endpoint đọc thuần không phụ thuộc ADR-0004**, nên ba
nhóm `GET` có thể ra đời trước khi quy tắc khoá chống lặp được chốt.

## Lựa chọn

**A. Một thư mục `apps/api/V2/` song song `V1Compat/`.** `apps/api` giữ vai trò chủ mọi controller.

**B. Mỗi module tự đăng ký endpoint của mình.** `apps/api` đổi vai trò từ "chủ mọi controller" thành "chủ
pipeline"; mỗi module thêm một `IEndpointRouteBuilder` hoặc controller trong assembly của nó.

| | A — `apps/api/V2/` | B — module tự đăng ký |
|---|---|---|
| Khớp ranh giới module (MOD-02) | kém hơn: `apps/api` biết cả 12 module | tốt hơn: mỗi module tự lo bề mặt của mình |
| Việc phải làm trước khi viết endpoint đầu tiên | không có | đổi `AddControllers` sang duyệt `ModuleRegistry.All` thêm `AddApplicationPart`, và mỗi module thêm phụ thuộc vào ASP.NET Core |
| Kéo phụ thuộc web vào tầng module | không | có — `modules/*` hiện chỉ phụ thuộc kernel và EF |
| Chỗ đặt DTO của v2 | tập trung, dễ giữ nhất quán 18 nhóm | rải ra, dễ lệch hình dạng giữa các module |
| Đảo chiều sau này | A → B là **di chuyển tệp**, giữ nguyên route và test | B → A cũng là di chuyển tệp, nhưng phải gỡ phụ thuộc web khỏi 12 csproj |
| Sunset facade v1 | `V1Compat/` xoá được nguyên khối, `V2/` không đụng tới | như nhau |

## Quyết định

**Chọn A.** Endpoint v2 đặt ở `apps/api/V2/`, một tệp controller cho mỗi nhóm năng lực, không nhận DTO của
`V1Compat/` và không dùng lại `V1Mappers`.

Ba lý do, theo thứ tự sức nặng:

1. **Đảo chiều A→B rẻ hơn B→A.** Sáu nhóm endpoint chưa viết là lúc chi phí sai thấp nhất, nhưng nếu vẫn phải
   chọn sai một lần thì nên chọn hướng mà việc sửa chỉ là di chuyển tệp. Lựa chọn B kéo phụ thuộc ASP.NET Core
   vào 12 `csproj`; gỡ ra sau là việc lớn hơn nhiều so với chuyển 18 tệp controller giữa hai thư mục.
2. **Nó không phải là việc đang cần làm.** Lựa chọn B là một cuộc tái cấu trúc vai trò của `apps/api`, và nó
   đứng chắn giữa hôm nay với sáu năng lực đang vô hình. Đổi kiến trúc host trong lúc chưa endpoint nào tồn tại
   để kiểm chứng nó là đổi mù.
3. **MOD-02 nói về phụ thuộc, không nói về vị trí tệp.** Ranh giới module được giữ bằng việc controller **chỉ**
   gọi public application interface của module — điều mà `tests/architecture/ModuleBoundaryTests.cs` đang canh.
   Đặt controller ở đâu không làm ranh giới đó chặt hay lỏng đi.

Kèm theo, ba quy tắc để lựa chọn này không mục ruỗng:

4. **`V2ControllerBase` riêng, không kế thừa `V1ControllerBase`.** Hai bề mặt có hình dạng lỗi khác nhau
   (`message` so với `detail`), phân trang khác nhau, và một trong hai sẽ bị xoá. Dùng chung lớp cơ sở là cách
   chắc chắn nhất để hành vi v1 rò sang v2.
5. **Không hàm ánh xạ nào dùng chung giữa `V1Compat/` và `V2/`.** B-19 đã cho thấy cái giá của việc dùng lại
   một hàm ánh xạ giữa hai đường có mức tin cậy khác nhau: `email` và `phone` của mọi tác giả đi ra Internet
   mà không ai thấy trong diff.
6. **Tách tài liệu OpenAPI.** `Program.cs:85` khai đúng một document tên `v2` đang chứa toàn đường `/api/v1`.
   Đổi nó thành `v1` và thêm một document `v2` thật — nếu không, "0 endpoint v2" sẽ tiếp tục đọc thành
   "76 endpoint v2" với người đọc tài liệu.

## Hệ quả

- Sáu nhóm endpoint viết được ngay, không chờ tái cấu trúc nào.
- **Ba nhóm đọc thuần đi trước được**: tra cứu kiểm toán, ảnh chụp chính sách, vòng ghép cặp. Chúng là `GET`
  trên tầng dịch vụ đã có, nên không chạm ADR-0004 (khoá chống lặp chỉ áp cho lệnh ghi) và không chạm ADR-0008
  (loại quyết định chỉ liên quan hồ sơ vụ việc). Đây là đường ngắn nhất từ "năng lực vô hình" tới "nhìn thấy
  được", và nó kiểm chứng luôn chính quyết định này trên ba ca dễ trước khi áp cho hồ sơ vụ việc và môi giới.
- `apps/api` tiếp tục biết tên cả 12 module. Chấp nhận có ý thức; nếu ngày nào đó nó thành vấn đề thật —
  không phải vấn đề trên lý thuyết — thì di chuyển sang B là một việc cơ học.
- `V1Compat/` không bị đụng tới, nên nó vẫn xoá được nguyên khối tại sunset.

## Cổng done

1. Một test kiến trúc khẳng định **không kiểu nào trong `apps/api/V2/` tham chiếu kiểu trong `apps/api/V1Compat/`**,
   và ngược lại. Không có nó, quy tắc 4 và 5 sẽ mục trong ba tháng — chúng là quy ước, và quy ước không được
   kiểm thì chỉ là lời khuyên.
2. Một test hợp đồng đếm đường dẫn theo tiền tố trong `openapi/v2.json` và khẳng định **không đường `/api/v1`
   nào lọt vào tài liệu v2**. Đây là phép đo đã phát hiện B-01; nó phải thành test chứ không phải thao tác tay.
3. Với mỗi nhóm endpoint mới: các dòng nghiệm thu tương ứng trong `docs/02-requirements/san-pham-v2/verification/api-v2-va-moi.md`
   chuyển từ `chưa có endpoint` sang kết quả đo thật.
