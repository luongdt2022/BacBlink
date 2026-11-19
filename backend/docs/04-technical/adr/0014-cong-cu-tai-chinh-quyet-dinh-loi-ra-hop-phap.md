# ADR-0014: Công cụ tài chính của hồ sơ quyết định lối ra hợp pháp

- Trạng thái: ACCEPTED
- Ngày: 2026-09-06
- Liên quan: [ADR-0013](0013-ban-giao-sang-quy-trinh-co-tham-quyen.md) (giai đoạn `HANDED_OVER`),
  §7.4 ma trận transition, §9.3 policy snapshot, §19 program/voucher/challenge funding,
  §23.2 và D2-21 (default DENY), §28 KPI khu vực công, CASE-14; Điều 50 Luật Đấu thầu 2023

## Bối cảnh

[ADR-0013](0013-ban-giao-sang-quy-trinh-co-tham-quyen.md) mở giai đoạn kết thúc `HANDED_OVER` với lý do: *"việc **chọn
nhà thầu** bắt buộc chạy trên Hệ thống mạng đấu thầu quốc gia (Điều 50 Luật Đấu thầu 2023)"*. Câu đó nói về **mua
sắm**, và nó đúng trong phạm vi mua sắm.

Nhưng ADR-0013 không nói ranh giới áp dụng của mình, nên nó dễ bị đọc rộng thành *"mọi hồ sơ dùng vốn nhà nước phải
bàn giao"*. Đọc như vậy là sai, và cái sai đi theo hai chiều cùng lúc:

- **Đọc rộng** thì loại bỏ nhầm cả nhiệm vụ KH&CN, tài trợ, đặt hàng, đồng tài trợ theo mốc, consortium, PPP và cơ
  chế thử nghiệm có kiểm soát — những công cụ mà pháp luật cho phép hợp tác công–tư và chạy thử nghiệm, tức là
  đúng những hồ sơ mà `EXECUTION` và `OUTCOME_VERIFICATION` sinh ra để phục vụ. Tài liệu kiến trúc chưa bao giờ
  gộp chúng: §19.1 liệt kê 15 loại `Program.type` tách bạch, §19.2 có `legalFormRef` với ví dụ *"PPP, đặt hàng, tài
  trợ, consortium... theo legal memo"*, §19 tách `Funding/incentive rail` khỏi `Regulatory-sandbox rail`, và [dòng 140](../NACENTECH_ARCHITECTURE_V2.md)
  cảnh báo thẳng rằng từ *"hybrid"* không tự động đồng nghĩa một hợp đồng PPP theo luật.
- **Đọc hẹp** thì không có gì chặn một hồ sơ mua sắm đi thẳng `DEAL_DESIGN → EXECUTION`.

Chiều thứ hai là chiều đang mở trong mã hôm nay. ADR-0013 thêm **lối ra** đúng nhưng không thêm **cổng** buộc ai đó
dùng lối ra ấy — và mô hình dữ liệu không có trường nào để cổng đó đọc.

### Sự kiện đã đo, không phải giả định

Đo ngày 2026-09-06 trên `main` tại `cc32d8d`; build sạch, 168/168 test xanh (7 · 37 · 16 · 37 · 71).

| Sự kiện | Đo ở đâu |
|---|---|
| **Không trường nào trong mã ghi công cụ tài chính của hồ sơ.** Grep `FundingInstrument`, `PPP`, `sandbox`, `voucher`, `đặt hàng` trên `modules/`, `packages/`, `apps/api` → **0 kết quả** | grep toàn solution |
| `BudgetPathStatus` là **trường chết**: gán `UNKNOWN` ở hàm dựng và **không có setter nào** trong toàn solution. Bốn chỗ tham chiếu còn lại là khai báo, từ vựng, cột và ánh xạ DTO | `modules/case/Domain/CommercializationCase.cs:32` và `:45`; `CaseService.cs:189`; `Contracts.cs:106`; `Infrastructure/Persistence/Configurations.cs:19` |
| Từ vựng của `BudgetPathStatus` trả lời **ai trả tiền** (`OWNER_FUNDED`, `SPONSOR_FUNDED`, `FINANCE_REQUIRED`, `MIXED`), không trả lời **dưới công cụ pháp lý nào** | `modules/case/Application/Contracts.cs:106` |
| Policy snapshot **đã khai** cổng `BUDGET_PATH` cho `QUALIFICATION`, và hai cổng cho `EXECUTION` | `modules/policy/Application/PolicySnapshotService.cs:52` và `:56` |
| `Transition` **không đọc snapshot**. Nó kiểm đúng bốn thứ: ma trận, loại quyết định, hold mở, lead broker cho `QUALIFICATION` | `modules/case/Domain/CommercializationCase.cs:79-134` |
| `DEAL_DESIGN → EXECUTION` mở cho **mọi** hồ sơ, không phân biệt nguồn tiền | `modules/case/Application/Contracts.cs:207` |
| Snapshot được chốt trong **tầng dịch vụ** rồi mới gọi aggregate; `ResolveForCaseAsync` tự commit | `modules/case/Application/CaseService.cs:89-97`; `PolicySnapshotService.cs:27` |

Hai dòng đầu cộng lại là hình dạng quen: **một cổng đã được khai trong tài liệu chính sách đóng băng, nhưng trường
mà nó phải đọc chưa bao giờ được ghi, và không ai đọc tài liệu đó.** Đây đúng một hình dạng với `QualityLevel`
(B-36) — khác ở chỗ hệ quả của cái này là tuân thủ pháp luật, không phải chất lượng dữ liệu.

Hệ quả đo lường: §28 có `lawful purchase/adoption conversion` cho route khu vực công. ADR-0013 làm tử số tồn tại,
nhưng **mẫu số vẫn gộp hai làn khác nhau về bản chất** — làn mua sắm phải đo bằng bàn giao, làn tài trợ phải đo
bằng outcome đã xác minh. Không có trường phân biệt thì không tách được mẫu số, và một tỷ lệ gộp hai làn không nói
được điều gì về làn nào.

## Lựa chọn

**A. Suy công cụ tài chính từ `BudgetPathStatus` đang có.** Rẻ nhất: không thêm trường, chỉ cần viết setter còn
thiếu. Nhưng nó trả lời sai câu hỏi — `SPONSOR_FUNDED` không nói sponsor rót tiền bằng hợp đồng mua sắm hay bằng
tài trợ, mà đó chính xác là chỗ khác nhau về luật. Nhồi hai câu hỏi vào một trường là cách trường thứ hai lặng lẽ
biến mất. Loại.

**B. Một cờ nhị phân `RequiresProcurementHandover` trên hồ sơ.** Đủ để đóng cổng, và ít mã nhất. Nhưng nó vứt mất
thứ mà một cuộc kiểm toán vốn công hỏi đầu tiên: *hồ sơ này chạy dưới công cụ nào, theo văn bản nào*. Một cờ đúng
sai không trả lời được câu đó, và `DecisionRecord` là dữ liệu chỉ-ghi-thêm nên bổ sung muộn không sửa được quá khứ.
Loại.

**C. Hằng số trong mã ánh xạ công cụ → được thực thi tại chỗ hay không.** Đóng cổng và giữ được lý do. Nhưng nó
**đóng đinh một kết luận pháp lý vào mã nguồn**, do người viết mã quyết. Việc "nhiệm vụ KH&CN dùng ngân sách có
được chọn bên thực hiện tại đây không" là câu hỏi cho luật sư, không cho `switch`. Loại.

**D. Trường `FundingInstrument` + `LegalFormRef` trên hồ sơ; ánh xạ công cụ → lối ra hợp pháp là **dữ liệu có
phiên bản**, đóng băng vào policy snapshot; mỗi mục bắt buộc mang `legalBasisRef`.** Đắt hơn: hai cột mới, một
migration, một mục cấu hình có phiên bản, và một phép kiểm mới ở aggregate. Nhưng nó đặt quyết định pháp lý vào
đúng chỗ pháp lý — một tệp cấu hình có phiên bản, trỏ tới văn bản thật — và giữ cho mã chỉ thi hành.

## Quyết định

**D.** Chi tiết:

1. **`FundingInstrument` trên `CommercializationCase`**, từ vựng đóng, bảy giá trị. Đây là một trục **khác**
   `Program.type` của §19.1: §19.1 mô tả *chương trình tài trợ của sponsor*, còn trường này trả lời *hồ sơ này
   chạy dưới công cụ pháp lý nào*. Nhiều `Program.type` cùng ánh xạ về một công cụ, và một hồ sơ không có chương
   trình nào vẫn phải có công cụ.

   | Giá trị | Nghĩa |
   |---|---|
   | `UNDETERMINED` | Mặc định lúc tạo. Chưa xác định. |
   | `PRIVATE` | Bên mua trả bằng vốn tư. |
   | `PUBLIC_PROCUREMENT` | Mua sắm bằng vốn nhà nước — phạm vi Điều 50 và ADR-0013. |
   | `RND_TASK` | Nhiệm vụ KH&CN sử dụng ngân sách nhà nước. |
   | `GRANT` | Tài trợ/hỗ trợ không hoàn lại, gồm voucher ĐMST (§19.1 `VOUCHER`, `FEASIBILITY_GRANT`, `PILOT_GRANT`). |
   | `CO_FUNDED_PROGRAM` | Chương trình đồng tài trợ công–tư trả theo mốc (§19.2 `HybridProgramAgreement`). |
   | `REGULATORY_SANDBOX` | Thử nghiệm có kiểm soát theo văn bản cho phép. |

2. **`LegalFormRef`** — tham chiếu tới văn bản thật (quyết định phê duyệt nhiệm vụ, hợp đồng tài trợ, thỏa thuận
   chương trình, văn bản cho phép thử nghiệm). **Bắt buộc với mọi công cụ trừ `PRIVATE`**, kiểm ở aggregate. Cùng
   một luật với `mandateRef` của ADR-0013 và cùng một lý do: một lời khai không kiểm chứng được, nằm vĩnh viễn
   trong dữ liệu chỉ-ghi-thêm, thì tệ hơn một trường bỏ trống.

3. **Ánh xạ công cụ → `EXECUTION` có phải đích hợp pháp không là dữ liệu, không phải mã.** Một mục có phiên bản
   trong `config/policies/`, mỗi dòng gồm `instrument`, `executionInPlatformPermitted`, `legalBasisRef`. Hai luật
   cứng:

   - **Dòng thiếu `legalBasisRef` không kích hoạt được.** Nó là lỗi cấu hình lúc nạp, không phải một giá trị mặc
     định êm ái. Đội không thể vô tình ship một khẳng định pháp lý mà chưa ai ký.
   - **Công cụ không có dòng nào → không được phép**, theo default DENY của §23.2/D2-21. `UNDETERMINED` vì thế bị
     từ chối mà không cần dòng riêng.

   Xuất xưởng **đúng hai dòng**, và cả hai đều là kết luận mà ADR khác đã dựng chứ không phải ADR này tự ra:

   - `PUBLIC_PROCUREMENT` → `false`, `legalBasisRef` trỏ Điều 50. ADR-0013 đã dựng kết luận này.
   - `PRIVATE` → `true`, `legalBasisRef` ghi rằng pháp luật đấu thầu về lựa chọn nhà thầu không điều chỉnh vốn tư.

   Bốn giá trị còn lại xuất xưởng **không có dòng nào**; đội điền theo legal memo. Xem
   [Câu hỏi còn mở](#câu-hỏi-còn-mở).

4. **Đóng băng vào policy snapshot khi vào `QUALIFICATION`.** `BuildDocument` thêm khối `fundingPath` mang công cụ
   của hồ sơ, kết luận đã tra, và `legalBasisRef` đã dùng. Snapshot bất biến theo CASE-14, nên luật áp cho một hồ
   sơ là luật tại thời điểm chốt — đổi cấu hình sau không đổi hồ sơ đang chạy.

5. **Aggregate tự đủ, không đọc module khác.** `SetPolicySnapshot(snapshotId)` đổi thành
   `FreezeFundingPath(snapshotId, executionPermitted)` — một phương thức, hai giá trị, **không tách được**. Giá trị
   `null` (chưa chốt) nghĩa là không được phép.

   Đây là lựa chọn có đánh đổi: cờ trên hồ sơ là **bản sao dẫn xuất** của thứ đã nằm trong snapshot. Cách kia là
   truyền luật vào `Transition` như tham số ở mọi chỗ gọi. Bản sao thắng vì `Transition` phải chạy được cho ETL và
   job — những đường không có snapshot để tra — và vì một tham số bắt buộc ở chỗ gọi là thứ thêm một chỗ gọi mới
   là quên. Không có nguy cơ lệch: hai giá trị ghi trong cùng một phương thức, snapshot bất biến, và supersede
   snapshot đã đòi `DecisionRecord` riêng theo CASE-14.

6. **Hai phép kiểm mới trong `Transition`**, cùng chỗ với các phép kiểm của ADR-0008 và ADR-0013:

   - Vào `QUALIFICATION`: `FundingInstrument` phải là **một giá trị trong từ vựng và khác `UNDETERMINED`**, và
     `LegalFormRef` không rỗng khi công cụ khác `PRIVATE`. Mã lỗi `FUNDING_INSTRUMENT_REQUIRED`. Đây là lần đầu
     cổng `BUDGET_PATH` mà snapshot đã khai từ đầu thực sự có hiệu lực.

     Bản đề xuất viết phép kiểm này là `!= UNDETERMINED`, và **cài đặt sửa lại** vì một sự kiện chỉ lộ ra khi
     sinh migration: EF mặc định điền `defaultValue: ""` cho một cột `string` không null thêm vào bảng có sẵn.
     Chuỗi rỗng khác `UNDETERMINED`, nên toàn bộ hồ sơ cũ sẽ đi thẳng qua cổng. Hai câu hỏi *"có khác chưa-khai
     không"* và *"có phải một công cụ đã khai không"* chỉ trùng nhau khi mọi giá trị trong cơ sở dữ liệu đều
     nằm trong từ vựng — và đó đúng là giả định mà một migration phá được, im lặng.
   - Vào `EXECUTION`: cờ đã đóng băng phải là `true`. Mã lỗi `EXECUTION_PATH_NOT_LAWFUL`, và thông điệp **nói tên
     lối ra đúng** — `HANDED_OVER` — chứ không chỉ từ chối. Một hồ sơ mua sắm bị chặn ở đây không phải hồ sơ hỏng;
     nó là hồ sơ đã tới đúng chỗ nó phải rời nền tảng.

7. **Ma trận §7.4 không đổi.** Bốn cạnh tới `HANDED_OVER` của ADR-0013 giữ nguyên, `DEAL_DESIGN → EXECUTION` giữ
   nguyên. Cổng nằm **trên** ma trận: ma trận nói *đi được về mặt vòng đời*, cổng nói *đi được về mặt luật*. Trộn
   hai thứ sẽ buộc phải sửa một ADR đã `ACCEPTED` và làm bản đặc tả ma trận viết lại độc lập trong bộ test bất biến
   phụ thuộc vào cấu hình pháp lý — đúng thứ thiết kế test đó tồn tại để tránh.

## Hệ quả

- **Cần migration**, khác ADR-0013: hai cột trên `case.commercialization_cases` (`funding_instrument`,
  `legal_form_ref`) và một cột cờ đã đóng băng. Hồ sơ đang có nhận `UNDETERMINED` — và vì `UNDETERMINED` bị từ chối
  ở `QUALIFICATION`, mọi hồ sơ cũ chưa qualified sẽ dừng lại cho tới khi có người điền. Đó là hành vi đúng, không
  phải hồi quy; hôm nay bảng `commercialization_cases` chưa có hồ sơ sản xuất nào nên chi phí bằng không, và cửa
  sổ rẻ nhất là **bây giờ** — cùng lý do đã đúng với ADR-0007 và ADR-0008.
- `BudgetPathStatus` **giữ nguyên nghĩa** *ai trả tiền* và vẫn là trường chết sau ADR này. Nó cần một setter thật
  hoặc bị gỡ; cả hai đều là quyết định riêng và không chặn ADR này. Một trường luôn `UNKNOWN` mà vẫn trả ra API là
  thứ đọc sai được — ghi ở [B-48](../../02-requirements/san-pham-v2/bug-triage.md#b-48-budgetpathstatus-không-có-đường-ghi-nên-cổng-budget_path-đã-khai-trong-ảnh-chụp-chính-sách-không-có-gì-để-đọc).
- §28 tách được mẫu số: làn `PUBLIC_PROCUREMENT` đo bằng tỷ lệ đạt `HANDED_OVER`; các làn còn lại đo bằng outcome
  đã xác minh. Trước ADR này hai làn bị gộp và tỷ lệ gộp không nói được về làn nào.
- **Snapshot vẫn commit trước khi transition được kiểm** (`ResolveForCaseAsync` tự commit). Một hồ sơ trượt cổng
  `FUNDING_INSTRUMENT_REQUIRED` sẽ để lại một snapshot đã chốt dù chưa vào `QUALIFICATION`. Hành vi này **có từ
  trước** ADR này, nhưng ADR này làm nó xảy ra thường xuyên hơn hẳn.
  **Đã quyết lúc cài đặt: dời phép kiểm lên trước lệnh resolve.** Nhưng không chép phép kiểm ra hai chỗ — nó là
  một phương thức của aggregate (`EnsureFundingPathDeclared`) mà tầng dịch vụ gọi trước khi resolve, và
  `Transition` gọi lại vì nó là chỗ ETL và job đi qua. Một cài đặt, hai chỗ gọi, không lệch được.
- Giao diện: console hồ sơ vụ việc cần ô chọn công cụ và ô nhập tham chiếu ở bước tạo, và thanh giai đoạn phải
  **tắt đích `EXECUTION`** cho hồ sơ có cờ `false` thay vì để người dùng bấm rồi nhận 422. Ma trận mà console chép
  từ `TransitionMatrix` nay không còn đủ để dựng thanh giai đoạn — nó cần thêm cờ từ hồ sơ. Chưa làm.
- ADR-0013 **không bị sửa và không sai**. ADR này chỉ nói ranh giới áp dụng của nó, và ranh giới đó nay là dữ liệu
  đọc được chứ không phải một câu trong phần Bối cảnh.

## Câu hỏi còn mở

- **Công cụ nào cho phép chọn bên thực hiện tại chỗ?** Đây là câu hỏi pháp lý, không phải kiến trúc, và ADR này cố
  ý **không** trả lời — nó chỉ dựng chỗ để câu trả lời được ghi kèm căn cứ. Cần legal memo cho ít nhất `RND_TASK`
  và `GRANT` trước khi làn đổi mới sáng tạo chạy được ca thật đầu tiên. Cho tới lúc đó chỉ `PRIVATE` chạy hết vòng.
- **Một hồ sơ đổi công cụ giữa vòng đời thì sao?** §6.4 cấm đổi track, chưa nói về công cụ. Hình dạng đúng có lẽ là
  supersede snapshot kèm `DecisionRecord` riêng theo CASE-14 — nhưng chưa có ca thật nào để kiểm, và đoán trước
  một cơ chế chưa ai cần là cách sinh ra cơ chế sai.
- **`LegalFormRef` hiện là chuỗi tự do**, cùng trạng thái với `MandateRef` và cùng lý do: chưa cần định dạng cho
  tới khi có tích hợp đối soát thật.
- Hồ sơ chạy bằng nhiều công cụ cùng lúc (đồng tài trợ công + tư trong một hồ sơ) có cần nhiều hơn một giá trị
  không? `CO_FUNDED_PROGRAM` đang giả định gói được vào một giá trị vì §19.2 đã đóng băng phần đóng góp trong
  `HybridProgramAgreement`. Nếu giả định này sai, nó sai theo hướng cần một tập hợp thay một giá trị.

## Cổng "done"

- `Qualification_requires_a_funding_instrument`: `UNDETERMINED` bị chặn; công cụ khác `PRIVATE` mà thiếu
  `LegalFormRef` bị chặn; đủ cả hai thì vào được và snapshot mang khối `fundingPath`.
- `Procurement_cannot_reach_execution`: hồ sơ `PUBLIC_PROCUREMENT` ở `DEAL_DESIGN` → `EXECUTION` trả 422
  `EXECUTION_PATH_NOT_LAWFUL`, và thông điệp nêu `HANDED_OVER`; cùng hồ sơ đó → `HANDED_OVER` kèm `mandateRef`
  thì đi được.
- `Execution_requires_a_frozen_lawful_path`: hồ sơ có cờ `null` bị chặn — default DENY, không phải cho qua.
- `Funding_rule_without_legal_basis_fails_to_load`: mục cấu hình thiếu `legalBasisRef` làm lỗi lúc nạp, không sinh
  ra một mặc định im lặng.
- `Frozen_funding_path_survives_a_config_change`: đổi cấu hình sau khi chốt không đổi kết luận của hồ sơ đang chạy.
- `Matrix_matches_specification_exactly` và `Terminal_stages_have_no_outgoing_transition` **vẫn xanh không sửa** —
  bằng chứng rằng cổng nằm trên ma trận chứ không nằm trong nó.
- Chứng minh test bắt được lỗi: tắt từng phép kiểm → đỏ đúng bài → bật lại → xanh.
- Toàn bộ 5 bộ test xanh.

## Đã cài đặt

Ngày 2026-09-06. Build sạch, **183/183** test xanh (7 · 49 · 16 · 37 · 74; trước ADR này là 168).

**Mã:** `packages/policy-engine/FundingPolicy.cs` (từ vựng, `FundingRule`, `FundingPolicySet`, loader) ·
`config/policies/funding-instruments.v1.json` (hai dòng) · `FundingPathResolution` và `IPolicySnapshotResolver`
ở kernel · `CommercializationCase` (`DeclareFundingPath`, `EnsureFundingPathDeclared`, `FreezeFundingPath`, hai
phép kiểm trong `Transition`) · `CaseService.DeclareFundingPathAsync` · khối `fundingPath` trong
`PolicySnapshotService.BuildDocument` · migration `FundingInstrumentOnCase` · `POST /api/v2/cases/{id}/funding-path`.

**Ba thứ lộ ra khi làm, không mục nào dự đoán trước:**

1. **EF sinh `defaultValue: ""` cho cột mới.** Xem mục Quyết định 6 — phép kiểm `!= UNDETERMINED` của bản đề xuất
   sẽ cho toàn bộ hồ sơ cũ đi thẳng qua cổng. Sửa hai đầu: migration điền `UNDETERMINED`, và phép kiểm hỏi từ
   vựng. Bài canh: `An_out_of_vocabulary_value_does_not_pass_the_gate`.

2. **Bài canh đầu tiên của mục đó tự nó hỏng** — nó xanh cả khi phép kiểm từ vựng bị gỡ, vì phép kiểm
   `LegalFormRef` ngay dưới ném **cùng một mã lỗi**. Chỉ lộ ra nhờ bước "tắt phép kiểm xem bài nào đỏ"; bài đã
   được siết lại để chỉ một nhánh có thể bắt nó. Đây là lý do bước đó là cổng done chứ không phải nghi thức.

3. **Không có đường sửa công cụ thì hồ sơ cũ kẹt vĩnh viễn.** Bản đề xuất chỉ khai công cụ lúc tạo. Nhưng mọi hồ
   sơ tạo trước ADR này mang `UNDETERMINED`, và `UNDETERMINED` bị chặn ở `QUALIFICATION` — không có
   `POST /cases/{id}/funding-path` thì chúng không đi tiếp được bằng bất kỳ đường nào.

**Chưa làm, và nói rõ vì sao:** ô chọn công cụ ở console và việc tắt đích `EXECUTION` trên thanh giai đoạn —
thanh đó chép ma trận từ `TransitionMatrix`, nay cần thêm cờ từ hồ sơ, nên nó là một thay đổi màn hình chứ không
phải một dòng sửa. Hôm nay người dùng bấm `EXECUTION` trên hồ sơ mua sắm sẽ nhận 422 với câu nói đúng việc phải
làm, không phải một lỗi câm.
