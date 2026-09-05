# ADR-0006: Kiểm toán ghi gì ở đường thành công

- Trạng thái: ACCEPTED
- Ngày: 2026-09-04 (đề xuất), 2026-09-05 (chốt và cài đặt)
- Liên quan: ADR-0001, §21.4, §23.2, §16.2; sổ lỗi `docs-v2/bug-triage.md` B-29, B-30, B-43

## Bối cảnh

ADR-0001 đã chốt rằng kiểm toán ghi bằng transaction riêng, và lý do đó vẫn vững. Nhưng nó không nói **cái gì**
được ghi, và bản cài đặt hiện tại trả lời câu đó hẹp hơn nhiều người tưởng.

`DefaultAuthorizationGate.Require` ghi ở đúng hai trường hợp:

```csharp
if (decision.IsPermitted)
{
    if (request.DocumentClassification is not null && request.DocumentClassification != "PUBLIC")
        audit.Append(... "PERMIT" ...);   // chỉ đọc tài liệu mật
    return;
}
audit.Append(... "DENY" ...);              // mọi lượt bị từ chối
```

Hệ quả: **mọi hành động ghi thành công đều không để lại dòng nào.** Tạo hồ sơ vụ việc, chuyển giai đoạn, giao
việc cho môi giới, **cấp và thu hồi quyền đọc dữ liệu mật** — không việc nào sinh sự kiện kiểm toán. Nhật ký
hiện chỉ trả lời được "ai đã bị từ chối", không trả lời được "ai đã làm gì".

Điểm khiến quyết định này gấp: **khoảng trống không lấp ngược được.** Dòng kiểm toán của hôm qua đã không tồn
tại. Quyết muộn một tháng là mất một tháng dấu vết.

### Bốn câu hỏi của bản đề xuất — hai đã được trả lời trước khi ADR này chốt

Bản đề xuất đặt bốn câu. Sprint 4 (2026-09-04) trả lời hai câu bằng mã, vì chúng không cần quyết định sản
phẩm:

- **Câu 2 — lọc danh sách có sinh dòng từ chối không?** Có, **một dòng tổng hợp cho mỗi lượt liệt kê**, mang
  số tài liệu bị loại và phân bố theo mức mật (B-29). Không phải một dòng cho mỗi tài liệu — một bản ghi 40
  tài liệu mật không được đẻ 40 dòng mỗi lần ai đó mở trang.
- **Câu 3, nửa đầu — thời hạn lưu dấu vết thiết bị?** **90 ngày**, đội chốt ngày 2026-09-04, nằm trong cấu
  hình. Cơ chế cắt nay chạy thật và tự nối lượt kế tiếp (B-30; lượt đo cả vòng lộ ra lỗi không nối lượt sau,
  đã sửa).

Còn lại cho ADR này: câu 1, câu 4, và nửa sau của câu 3.

### Một câu thứ năm, lộ ra khi đo ngày 2026-09-05: từ vựng kết quả đang lệch giữa ba nơi

Cửa phân quyền ghi **`PERMIT`**. Đặc tả `api-v2/audit.md` nói kết quả là **`ALLOW`** hay `DENY`. Endpoint
`GET /api/v2/audit-events` (sprint 1) theo đặc tả và chỉ nhận `ALLOW|DENY` ở bộ lọc. Nghĩa là **lọc theo
`ALLOW` không bao giờ khớp dòng nào** — lượt đo sprint 1 ghi "ALLOW = 0 dòng" và đã hiểu nhầm đó là *chưa có
dòng nào*, trong khi thật ra là không dòng nào mang chữ đó. Ba tầng, ba từ, và không test nào so chúng với
nhau. Đo dữ liệu: bảng có 18 dòng, toàn `DENY`, **0 dòng `PERMIT`** — nên sửa từ vựng hôm nay không cần di trú.

## Quyết định

**Câu 1 — hành động ghi thành công có sinh dòng kiểm toán không? Có.** Với kết quả **`SUCCESS`**, phân biệt
với `ALLOW` của cửa phân quyền.

Điểm ghi **không** ở cửa phân quyền — nó chỉ biết lệnh được phép, không biết lệnh có xong. Điểm ghi ở **tầng
lệnh, ngay sau `CommitAsync`**: nếu commit ném, không dòng nào được ghi; nếu commit xong, dòng được ghi bằng
kết nối riêng của `IsolatedAuditWriter` nên không bị cuộn ngược bởi bất cứ gì xảy ra sau. Đây là cách rẻ nhất
diễn đạt "đã xảy ra" mà không đụng `IUnitOfWork`: mỗi phương thức dịch vụ có ghi gọi một dòng sau commit.

Hệ quả của ADR-0001 phải nói ra và nay nói được bằng dữ liệu: một lệnh thất bại ở bước sau để lại dòng `ALLOW`
mà **không có** dòng `SUCCESS` đi kèm. Người đọc nhật ký phân biệt "được phép" với "đã xảy ra" bằng hai dòng,
không bằng suy đoán.

Phạm vi đợt này: bảy đường ghi mà bản đề xuất nêu đích danh — tạo hồ sơ, chuyển giai đoạn, gán môi giới, mở và
gỡ khoá tạm, cấp và thu hồi quyền đọc. Đường ghi khác (đề bài, tài sản, câu chuyện, người dùng) đi sau theo
cùng mẫu; chúng không nằm trong nhóm "không lấp ngược được" vì đã có phiên bản nội dung và sự kiện miền làm
dấu vết.

**Câu 3, nửa sau — thời hạn lưu của bản thân sự kiện? Vĩnh viễn, cho tới khi có ADR riêng.** Nhật ký là dữ
liệu chỉ-ghi-thêm; một cơ chế xoá sự kiện là quyết định về bằng chứng, không phải về dung lượng, và nó phải
đến từ một yêu cầu lưu trữ có tên. Quyết "không xoá" là một quyết định, khác với để ngỏ: nó có nghĩa là không
ai được xây cơ chế cắt sự kiện mà không có ADR mới.

**Câu 4 — lượt tra cứu nhật ký có tự ghi vào nhật ký không? Có.** Mỗi lượt tra thành công ghi một dòng
`SUCCESS` với hành động `stats.read`, đối tượng `AuditEvent`, và bộ lọc đã dùng trong phần chi tiết. Câu "ai
canh người canh gác" phải có câu trả lời ở đúng chỗ người ta sẽ tìm nó — trong chính nhật ký. Cái giá là
nhật ký dài thêm bằng chính hoạt động tra cứu; cách trả giá đúng là **bộ lọc theo hành động** (chưa có, xem
`api-v2/audit.md`), không phải bỏ ghi.

**Câu 5 — từ vựng kết quả. `ALLOW` / `DENY` / `SUCCESS`, đúng ba từ, khai một chỗ.** Cửa phân quyền đổi
`PERMIT` thành `ALLOW` để khớp đặc tả và khớp endpoint. Ba từ nằm trong `AuditOutcomes` ở kernel, và cả cửa
phân quyền, dịch vụ, endpoint lẫn client cùng đọc từ đó.

## Hệ quả

- Màn hình nhật ký hiện **ba** kết quả, không phải hai. Nhãn: *Cho phép*, *Từ chối*, *Đã thực hiện*. Bộ lọc
  "Xem các lượt bị từ chối" giữ nguyên nghĩa.
- Bảng nghiệm thu `api-v2-va-moi.md`: các dòng `AUDIT-*` nhắc `ALLOW` nay có dữ liệu để đo.
- Đặc tả `api-v2/audit.md` mục "Câu hỏi mở": *"Lượt tra nhật ký có nên được ghi không? Hiện không"* đổi thành
  *có*, và mô tả hình dạng dòng đó.
- Dải thường trực trên màn hình nhật ký đổi từ "có thể được ghi lại" sang **"được ghi lại"** — câu chữ mềm là
  dấu vết của một quyết định chưa ra; giờ nó đã ra.
- B-43 (từ vựng lệch) mở và đóng trong cùng ADR.

## Cổng done

1. **Một test tích hợp** tạo hồ sơ vụ việc, chuyển giai đoạn, cấp và thu hồi một phiếu đọc, rồi đọc lại nhật
   ký: **đúng bốn dòng `SUCCESS`** với hành động và định danh đối tượng khớp, và mỗi dòng có `correlationId`.
2. **Một test tích hợp** cho hệ quả của ADR-0001: một lệnh được phép nhưng thất bại ở luật nghiệp vụ (chuyển
   giai đoạn với loại quyết định sai) để lại dòng `ALLOW`... *không* — cửa phân quyền chỉ ghi `ALLOW` cho đọc
   tài liệu mật, nên với lệnh ghi: **không dòng `SUCCESS` nào** sau một lệnh thất bại. Bài này canh đúng ranh
   giới "được phép ≠ đã xảy ra".
3. **Một test khẳng định cửa phân quyền không còn phát `PERMIT`**: chủ sở hữu mở tài liệu mật → dòng
   `ALLOW`. Kết hợp với `NormalizeOutcome` của endpoint nhận đúng ba từ, đây là thứ khép ba tầng lại.
4. Chứng minh test bắt được lỗi: bỏ dòng ghi sau commit ở `TransitionAsync` thì bài 1 đỏ.

## Đã cài đặt

Ngày 2026-09-05, cùng ngày chốt.

| Quyết định | Chỗ cài đặt |
|---|---|
| Câu 5 — ba từ, một chỗ | `AuditOutcomes` trong `packages/kernel/Application/IAuditWriter.cs`; cửa phân quyền, endpoint và client đọc từ đó |
| Câu 1 — `SUCCESS` sau commit, bảy đường | `CaseService.Succeeded` (5 lệnh); `DataRoomService.IssueGrantAsync` / `RevokeGrantAsync` |
| Câu 4 — tra nhật ký tự ghi | `AuditQuery.Viewed`, gọi **sau** truy vấn |
| Câu 3 (nửa sau) — sự kiện lưu vĩnh viễn | Không có mã cắt sự kiện, và không được thêm nếu không có ADR mới |
| Cổng done 1–3 | `tests/integration/AuditSuccessPathTests.cs` (5 bài) |
| Client | Ba kết quả với nhãn *Cho phép / Từ chối / Đã thực hiện*; dải thường trực nói rõ ba loại dòng |

Bộ tích hợp đi từ **13 lên 18** bài; toàn solution **106 → 111**, tất cả xanh. Không cần di trú: bảng có 18
dòng, toàn `DENY`, 0 dòng `PERMIT`.

Cổng done 4 kiểm chứng theo cả hai chiều: bỏ dòng `Succeeded(Actions.CaseTransition, …)` thì **đúng một bài
đỏ** — `Each_successful_case_command_leaves_exactly_one_success_row`, với thông điệp nói chuỗi hành động thiếu
`case.transition` — trong khi 17 bài còn lại vẫn xanh. Khôi phục thì 18/18.

Ba nhãn hành động mới (`case.hold_open`, `case.hold_release`, `access_grant.revoke`) nằm trong `Actions` để
dòng "đã xảy ra" nói đúng việc đã xảy ra, và **cố ý không có trong bộ luật**: cửa phân quyền vẫn hỏi
`case.transition` cho khoá tạm và `access_grant.issue` cho thu hồi. Bài vét cạn của `DecisionTableTests`
không quét ba nhãn này vì chúng không phải hành động của bảng — đó là ranh giới giữa *quyền* và *dấu vết*,
và nó được ghi ở chú thích ngay cạnh ba hằng số.

Một lỗi của chính lượt viết test, đáng ghi vì nó trông như lỗi driver: hàm trợ giúp mở `using var scope` rồi
trả `Task` ra ngoài mà không `await` — scope bị huỷ trong lúc truy vấn còn chạy, và Npgsql báo *"BindComplete
while expecting ReadyForQuery. Please file a bug."* Không phải bug của Npgsql; là DbContext bị dispose sớm.
