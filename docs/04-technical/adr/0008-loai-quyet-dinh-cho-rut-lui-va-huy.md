# ADR-0008: Loại quyết định cho rút lui và huỷ

- Trạng thái: ACCEPTED
- Ngày: 2026-09-04 (đề xuất và chốt)
- Liên quan: §7.2, §7.4, §7.5, CASE-08; đặc tả `docs-v2/api-v2/case-va-quyet-dinh.md`

## Bối cảnh

Hồ sơ vụ việc có bốn loại quyết định: `APPROVE`, `REJECT`, `RETURN_FOR_REWORK`, `WAIVE`.

`CommercializationCase.Transition` áp ba luật về loại quyết định:

```csharp
if (backward && decision != RETURN_FOR_REWORK)            → REWORK_DECISION_REQUIRED
if (toStage == REJECTED && decision != REJECT)            → REJECT_DECISION_REQUIRED
if (!backward && toStage != REJECTED
    && decision is not (APPROVE or WAIVE))                → FORWARD_DECISION_REQUIRED
```

Ma trận chuyển có bốn giai đoạn kết thúc: `CLOSED`, `REJECTED`, `WITHDRAWN`, `CANCELLED`. Ba luật trên phủ
`REJECTED` và các bước tiến bình thường, nhưng **không phủ `WITHDRAWN` và `CANCELLED`**: hai giai đoạn đó là
chuyển tiến và không phải `REJECTED`, nên chúng rơi vào luật thứ ba và **bắt buộc mang `APPROVE` hoặc `WAIVE`**.

Hệ quả cụ thể: để rút lui một hồ sơ, người dùng phải chọn **"Chấp thuận"**. Để huỷ một hồ sơ đang thi công,
cũng vậy.

Điều này không sửa được bằng cách đổi nhãn ở giao diện. Loại quyết định được ghi vào `DecisionRecord`, và bản
ghi quyết định là dữ liệu **chỉ-ghi-thêm** (§7.2): không có đường sửa, quyết định mới chỉ thay thế quyết định
cũ bằng tham chiếu. Ai đọc dòng thời gian sáu tháng sau sẽ thấy một quyết định "Chấp thuận" ở đúng chỗ hồ sơ
bị rút lui, và không có cách nào phân biệt nó với một lần chấp thuận thật.

Nói cách khác: **đây là lỗi ghi vào dữ liệu, không phải lỗi ở màn hình.** Sửa muộn không sửa được quá khứ.

### Hai giai đoạn này không hiếm, và chúng không giống nhau

`WITHDRAWN` là đích hợp lệ từ **năm** giai đoạn đầu (`DISCOVERY`, `QUALIFICATION`, `MATCHING`, `DUE_DILIGENCE`,
`DEAL_DESIGN`); `CANCELLED` là đích từ `DEAL_DESIGN` và `EXECUTION`. Đây không phải hai ô hiếm gặp ở góc ma
trận — chúng là hai đường thoát chính của quy trình, và mọi hồ sơ không đi tới `CLOSED` sẽ đi qua một trong
bốn giai đoạn kết thúc.

Hai giai đoạn cũng mang hai nghĩa khác nhau. **Rút lui** là quyết định của phía đưa bài toán: họ thôi không
theo nữa. **Huỷ** xảy ra muộn hơn, sau khi đã có thiết kế thương vụ hoặc đang thi công, và thường do điều kiện
bên ngoài. Gộp hai thứ đó vào một loại quyết định là mất chính sự khác biệt mà người đọc dòng thời gian cần.

### Đính chính: cửa sổ rẻ đã hẹp lại, và lý do cũ không còn đúng

Bản đề xuất viết rằng chi phí thấp vì *"hôm nay chưa có hồ sơ vụ việc nào tồn tại, vì `/api/v2/cases/*` chưa
có endpoint"*. Câu đó **không còn đúng**: sprint 5 đã mở `POST /api/v2/cases`, và đo ngày 2026-09-04 thì bảng
`casework.commercialization_cases` đã có **1 hàng**.

Lý do đúng thì vẫn còn, và nó nằm ở bảng khác: `casework.decision_records` có **0 hàng**. Cột phải di trú khi
đổi bộ giá trị là `decision_records.decision`, không phải bảng hồ sơ. Chừng nào chưa có hồ sơ nào **chuyển
giai đoạn**, đổi kiểu liệt kê vẫn là một bản vá chứ chưa phải một cuộc di trú.

Cửa sổ đó đóng vào **lần chuyển giai đoạn đầu tiên**, không phải lần tạo hồ sơ đầu tiên. Đó là lý do quyết
định này được chốt trước khi ba lệnh ghi còn lại của nhóm `cases` được viết.

## Ba lựa chọn

**A. Thêm hai loại quyết định: `WITHDRAW` và `CANCEL`.** Sáu loại, mỗi giai đoạn kết thúc có loại của nó. Rõ
nghĩa nhất khi đọc dòng thời gian. Cần thêm hai luật vào `Transition` và mở rộng bộ giá trị hợp lệ.

**B. Nới luật thứ ba cho hai giai đoạn đó, dùng `WAIVE`.** Không thêm loại mới; `WAIVE` mang nghĩa "miễn, cho
qua" và đọc đỡ sai hơn `APPROVE`. Rẻ nhất, nhưng vẫn không phân biệt được rút lui với huỷ, và `WAIVE` sẽ mang
hai nghĩa khác nhau tuỳ giai đoạn đích.

**C. Dùng mã lý do thay vì loại quyết định.** Giữ bốn loại, bắt buộc một mã lý do cụ thể khi đích là
`WITHDRAWN` hoặc `CANCELLED`. Dòng thời gian vẫn ghi "Chấp thuận" nhưng kèm mã lý do nói rõ. Không đổi bộ giá
trị, nhưng để nghĩa thật ở một trường phụ.

## Quyết định

**Chọn A.** Thêm `WITHDRAW` và `CANCEL` vào bộ loại quyết định, và buộc mỗi giai đoạn kết thúc đi kèm đúng
loại của nó.

Luật mới của `Transition`, thay cho ba luật cũ:

```csharp
if (backward && decision != RETURN_FOR_REWORK)            → REWORK_DECISION_REQUIRED
if (toStage == REJECTED  && decision != REJECT)           → REJECT_DECISION_REQUIRED
if (toStage == WITHDRAWN && decision != WITHDRAW)         → WITHDRAW_DECISION_REQUIRED   ← mới
if (toStage == CANCELLED && decision != CANCEL)           → CANCEL_DECISION_REQUIRED     ← mới
if (!backward && toStage is not (REJECTED|WITHDRAWN|CANCELLED)
    && decision is not (APPROVE or WAIVE))                → FORWARD_DECISION_REQUIRED
```

Hình dạng của bốn luật đầu giống nhau — *đích này đòi loại kia* — nên chúng được viết thành **một bảng tra
cứu**, không phải bốn nhánh `if` chép lại nhau. Luật thứ năm là nhánh mặc định cho mọi bước tiến còn lại.

Ba lý do, theo thứ tự sức nặng:

1. **B và C đều để nghĩa thật ở chỗ khác chỗ người đọc nhìn vào.** Dòng thời gian hiện loại quyết định; mã lý
   do là trường phụ, và `WAIVE` dùng cho hai đích khác nhau thì chính nó thành một trường mơ hồ. Một hệ thống
   ghi lại quyết định mà loại quyết định không nói đúng quyết định là hệ thống ghi sai, dù có ghi đủ.
2. **Bốn giai đoạn kết thúc và bốn loại quyết định lệch nhau là dấu hiệu mô hình chưa đủ**, không phải một
   đánh đổi có chủ đích — không tìm thấy chỗ nào trong mã hay tài liệu kiến trúc ghi lý do giữ nó như vậy.
3. **Chi phí chỉ tăng theo thời gian.** `decision_records` còn rỗng; sau lần chuyển giai đoạn đầu tiên, cùng
   thay đổi ấy là một cuộc di trú trên bảng chỉ-ghi-thêm — nơi không sửa được hàng cũ theo thiết kế.

Cái giá của A, nói rõ để không ai ngạc nhiên sau: bộ giá trị đi từ bốn lên sáu, nên mọi chỗ liệt kê loại quyết
định — giao diện, bản dịch, tài liệu — phải cập nhật. Đó là chi phí một lần và nó nằm ở chỗ nhìn thấy được.

## Hệ quả

- `Decisions` thêm hai hằng số; `Transition` thêm hai luật và hai mã từ chối mới.
- Bảng ma trận trong [`docs-v2/nen-tang/mo-hinh-du-lieu.md`](../../../docs-v2/nen-tang/mo-hinh-du-lieu.md#ma-trận-chuyển)
  không đổi — ma trận nói về giai đoạn, không về loại quyết định.
- Đặc tả [`docs-v2/api-v2/case-va-quyet-dinh.md`](../../../docs-v2/api-v2/case-va-quyet-dinh.md) và màn hình
  [`docs-v2/moi/console-ho-so-vu-viec.md`](../../../docs-v2/moi/console-ho-so-vu-viec.md) phải cập nhật bảng
  "loại chuyển → quyết định bắt buộc", và console bớt được một chỗ khó xử: nhãn nút giờ khớp với thứ được ghi.
- Tổng số chuỗi cần dịch ở giao diện tăng từ 32 lên 34.
- Bộ test bất biến phải phủ hai ô mới: `WITHDRAWN` và `CANCELLED` với loại quyết định sai phải bị từ chối.
- **Không cần migration lược đồ.** `decision` là cột chuỗi, không phải kiểu liệt kê của PostgreSQL; thay đổi
  nằm ở luật miền, không ở bảng. Điều này chỉ đúng chừng nào `decision_records` còn rỗng — sau đó nó thành
  một cuộc di trú dữ liệu, và bảng ấy là chỉ-ghi-thêm.
- `ReleaseHold` vẫn ghi `WAIVE` với mã lý do `HOLD_RELEASED`. Nó không phải một chuyển giai đoạn — giai đoạn
  trước và sau bằng nhau — nên nó nằm ngoài bốn luật trên và cố ý không đổi.

## Cổng done

1. **Bốn bài bất biến**, mỗi giai đoạn kết thúc một cặp: chuyển sang `WITHDRAWN` với `WITHDRAW` phải **được
   chấp nhận**, và với `APPROVE` phải **bị từ chối** kèm đúng mã `WITHDRAW_DECISION_REQUIRED`. Tương tự cho
   `CANCELLED`. Bài "bị từ chối" quan trọng hơn bài "được chấp nhận": chính đường `APPROVE` là thứ hôm nay
   đang hợp lệ, và nó phải thôi hợp lệ.
2. **Một bài khẳng định luật cũ không bị nới ra**: chuyển tiến bình thường vẫn chỉ nhận `APPROVE` hoặc `WAIVE`,
   và `WITHDRAW` **không** dùng được cho một bước tiến thường. Thêm hai giá trị vào một kiểu liệt kê là cách
   dễ nhất để vô tình nới lỏng phần còn lại.
3. Chứng minh test bắt được lỗi: gỡ hai luật mới thì bài "bị từ chối" phải đỏ.

## Đã cài đặt

Ngày 2026-09-04, cùng ngày chốt.

| Quyết định | Chỗ cài đặt |
|---|---|
| Hai loại mới + bảng tra cứu `RequiredForStage` | `modules/case/Application/Contracts.cs`, `Decisions` |
| Bốn luật gộp thành một phép tra bảng | `modules/case/Domain/CommercializationCase.cs`, `Transition` |
| Cổng done | `tests/invariants/TerminalDecisionTypeTests.cs` (17 bài) |

Bộ bất biến đi từ **16 lên 33** bài; toàn bộ solution **82 → 99**, tất cả xanh.

Cổng done đã kiểm chứng theo cả hai chiều: quay `Transition` về luật cũ thì **đúng tám bài đỏ** — bốn bài
`WITHDRAWN` và bốn bài `CANCELLED` — trong khi mọi bài về bước tiến, bước lùi và `REJECTED` vẫn xanh. Đó là
bằng chứng bộ test bắt đúng thứ nó sinh ra để bắt, và không bắt nhầm phần còn lại.

Một hệ quả nằm ngoài dự kiến của bản đề xuất: `ReleaseHold` ghi `WAIVE` với mã lý do `HOLD_RELEASED` và **không
bị ảnh hưởng**, vì gỡ hold không phải một chuyển giai đoạn — giai đoạn trước và sau bằng nhau. Bốn luật chỉ áp
cho `Transition`, và ranh giới đó là chủ ý.
