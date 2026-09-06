# ADR-0013: Giai đoạn kết thúc `HANDED_OVER` cho việc bàn giao sang quy trình có thẩm quyền

- Trạng thái: ACCEPTED
- Ngày: 2026-09-06
- Liên quan: §7.4 ma trận transition, §3 nguyên tắc 12 (append-only audit), §28 KPI khu vực công,
  non-goal [dòng 228](../NACENTECH_ARCHITECTURE_V2.md), D2-135, GIF-08; ADR-0008 (loại quyết định theo giai đoạn kết thúc);
  Điều 50 Luật Đấu thầu 2023

## Bối cảnh

Với người trả tiền dùng vốn nhà nước, việc **chọn nhà thầu bắt buộc chạy trên Hệ thống mạng đấu thầu quốc gia**
(Điều 50 Luật Đấu thầu 2023): không chỉ đăng thông báo mà cả nộp hồ sơ, đánh giá và phê duyệt kết quả. NacenTwin
làm phần thượng nguồn — chuẩn hoá bài toán, tìm giải pháp, thiết kế và chạy PoC, dựng bằng chứng — rồi dừng lại
và chuyển quyết định sang quy trình đó.

Ranh giới này đã có trong tài liệu ở non-goal dòng 228 và D2-135. Điều mới là: **nó không phải lựa chọn kiến trúc
cho cẩn thận, nó là luật.** Và mô hình dữ liệu không có chỗ nào ghi lại việc bàn giao đã xảy ra.

### Sự kiện đã đo, không phải giả định

| Sự kiện | Đo ở đâu |
|---|---|
| `Decisions` có sáu loại; **không** loại nào nghĩa là "đã bàn giao cho quy trình có thẩm quyền" | `modules/case/Application/Contracts.cs` — `APPROVE`, `REJECT`, `RETURN_FOR_REWORK`, `WAIVE`, `WITHDRAW`, `CANCEL` |
| `CLOSED` **chỉ** tới được từ `OUTCOME_VERIFICATION` và `COMMERCIALIZATION_MONITORING` | `TransitionMatrix.Allowed` |
| Từ `MATCHING`/`DUE_DILIGENCE` chỉ có `REJECTED` và `WITHDRAWN`; từ `DEAL_DESIGN` chỉ có `WITHDRAWN` và `CANCELLED` | cùng bảng |
| `DecisionRecord.MandateRef` đã tồn tại và đang nullable | `modules/case/Domain/CommercializationCase.cs` |

Hệ quả của ba dòng đầu: **mô hình không có lối ra thành công nào trước khi thực thi.** Một hồ sơ khu vực công đi
tới chỗ phải chọn bên cung ứng chỉ còn hai đường, cả hai đều sai:

1. **Đi tiếp** qua `DEAL_DESIGN` → `EXECUTION` như thể NacenTwin là nơi chọn nhà thầu — đúng thứ non-goal dòng 228
   cấm, và nay biết là trái luật.
2. **Đóng** bằng `WITHDRAW` hoặc `CANCEL` — ghi sai sự thật: một hồ sơ **thành công** bị đóng đinh vào dòng thời
   gian như bỏ dở. Đây chính xác là lỗi mà ADR-0008 đã phải sửa một lần cho `WITHDRAWN`/`CANCELLED`.

Hệ quả đo lường nghiêm trọng hơn vẻ ngoài. KPI §28 có `lawful purchase/adoption conversion` cho route khu vực công.
Với mô hình cũ nó **không tính được**: bàn giao trông giống hệt bỏ cuộc, nên tỷ lệ chuyển đổi của toàn bộ dòng khu
vực công bị hụt một cách hệ thống — và đó là con số dùng để quyết định có mở rộng dòng đó hay không.

## Lựa chọn

**A. Dùng lại `CLOSED`, thêm cạnh từ `MATCHING`/`DUE_DILIGENCE`/`DEAL_DESIGN`.** Rẻ nhất về số hằng số. Nhưng
`CLOSED` nghĩa là *đã đi hết vòng đời tại đây*; `CLOSED` từ `MATCHING` thì hoàn tất và bàn giao trông giống nhau,
chỉ `DecisionRecord` mới phân biệt được. Đó đúng là kiểu "một từ sai đóng đinh vào dòng thời gian" mà ADR-0008
phải gỡ. Loại.

**B. Chỉ thêm loại quyết định `HANDOVER_TO_AUTHORITY`, không thêm giai đoạn.** Đây là phương án tôi ước lượng ban
đầu và nó **sai vì một sự kiện chưa kiểm**: `CLOSED` không tới được từ các giai đoạn cần bàn giao, nên không có
đích hợp lệ nào để gắn loại quyết định mới vào. Loại.

**C. Giai đoạn kết thúc `HANDED_OVER` + loại quyết định `HANDOVER_TO_AUTHORITY` + bắt buộc tham chiếu.**
Đắt hơn: đụng `Stages.All`, `Stages.Terminal`, ma trận §7.4 và bản đặc tả độc lập trong bộ test bất biến. Nhưng
đó là cái giá đúng cho một trạng thái kết thúc thật sự khác về nghĩa.

## Quyết định

**C.** Chi tiết:

1. **`Stages.HandedOver = "HANDED_OVER"`**, nằm trong `Stages.All` và `Stages.Terminal`. Không có cạnh đi ra.

2. **`Decisions.HandoverToAuthority = "HANDOVER_TO_AUTHORITY"`**, và `RequiredForStage[HandedOver]` trỏ về nó —
   cùng luật với `REJECTED`/`WITHDRAWN`/`CANCELLED` theo ADR-0008. `APPROVE` không lọt vào được, nên bàn giao và
   hoàn tất không thể trông giống nhau.

3. **Bốn cạnh mới, và chỉ bốn:** `MATCHING`, `DUE_DILIGENCE`, `DEAL_DESIGN` → `HANDED_OVER` (đã có ứng viên, bước
   tiếp theo là chọn); và `OUTCOME_VERIFICATION` → `HANDED_OVER` (PoC đã chạy và đã xác minh; mua ở quy mô thật là
   quy trình riêng — GIF-08).

   Không thêm từ `DISCOVERY`/`QUALIFICATION`: chưa tìm giải pháp nào thì không có gì để bàn giao, `WITHDRAWN` mới
   đúng. Không thêm từ `COMMERCIALIZATION_MONITORING`: chuyển giao đã xong.

4. **`mandateRef` bắt buộc** khi quyết định là `HANDOVER_TO_AUTHORITY`, kiểm ở **aggregate** chứ không ở biểu mẫu —
   ETL, job và mọi cửa API đều đi qua đó. Mã lỗi `HANDOVER_REFERENCE_REQUIRED`. Trường đã tồn tại và vẫn nullable
   cho mọi loại quyết định khác; chỉ loại này mới đòi.

## Hệ quả

- Bộ test bất biến giữ bản đặc tả ma trận **viết lại độc lập**, nên nó phải được sửa cùng lúc — đó là chủ đích của
  thiết kế test đó, không phải phiền toái. 33 → 37 bài.
- `lawful purchase/adoption conversion` (§28) tính được: mẫu số là hồ sơ khu vực công đã qualified, tử số là hồ sơ
  đạt `HANDED_OVER` hoặc `CLOSED`. Trước đây tử số không tồn tại.
- Giao diện cần một lối ra mới ở bốn giai đoạn trên, kèm ô nhập tham chiếu bắt buộc. Chưa làm.
- `HANDED_OVER` **không** phải bằng chứng đã trúng thầu hoặc đã mua. Nó chỉ nói NacenTwin đã chuyển việc ra ngoài
  và trỏ tới chỗ nhận. Kết quả của quy trình bên ngoài thuộc hệ thống của cơ quan đó (nguyên tắc 6, D2-135), và
  không được suy ra từ trường này.
- Không cần migration lược đồ: `Stage` và `Decision` lưu dạng chuỗi.

## Câu hỏi còn mở

- Hồ sơ bàn giao xong rồi bên ngoài chọn được nhà cung cấp thì có mở case mới để theo adoption không, hay nối bằng
  `originCaseId`? §6.4 đã cấm đổi track giữa vòng đời nhưng chưa nói về chuỗi sau bàn giao.
- `MandateRef` hiện là chuỗi tự do. Nếu sau này cần đối soát với hệ thống bên ngoài thì phải có định dạng — chưa
  cần cho tới khi có tích hợp thật.

## Cổng "done"

- `Handover_requires_an_external_reference`: thiếu tham chiếu, hoặc tham chiếu chỉ có khoảng trắng, đều bị chặn;
  có tham chiếu thì stage đổi và `DecisionRecord` giữ đúng tham chiếu và đúng loại quyết định.
- `Handed_over_rejects_a_generic_forward_decision`: `APPROVE` không vào được `HANDED_OVER`.
- `Handover_is_not_reachable_before_a_solution_search`: `DISCOVERY` và `QUALIFICATION` không có cạnh tới.
- `Matrix_matches_specification_exactly` và `Terminal_stages_have_no_outgoing_transition` xanh với bản đặc tả đã cập nhật.
- Toàn bộ 5 bộ test xanh: 7 + 37 + 16 + 37 + 65.
