# Phân tích mô hình thương mại hóa công nghệ Hàn Quốc và định hướng áp dụng cho NacenTech

> Trạng thái: Đề xuất chiến lược để review  
> Phiên bản: 1.0  
> Ngày: 2026-09-01  
> Phạm vi: mô hình vận hành, thể chế, tài chính và lộ trình áp dụng; không phải ý kiến pháp lý

## 1. Kết luận điều hành

NacenTech có thể đi theo tầm nhìn rộng trong `proposal.md`, nhưng không nên được xây như một website marketplace tổng hợp. Mô hình phù hợp hơn là **hạ tầng điều phối toàn bộ vòng đời thương mại hóa công nghệ**, bắt đầu từ nhu cầu có ngân sách và kết thúc ở outcome được xác minh.

Điểm cần học từ Hàn Quốc không phải là giao diện hay AI matching. Thành công của hệ thống Hàn Quốc đến từ việc kết hợp đồng thời:

1. dữ liệu công nghệ hình thành từ R&D công được tập trung và chuẩn hóa;
2. nhu cầu thật của doanh nghiệp làm đầu vào;
3. mạng lưới môi giới công nghệ chuyên nghiệp;
4. đánh giá và định giá công nghệ;
5. bảo vệ IP và hợp đồng chuyển giao;
6. tài chính cho cả mua công nghệ, hoàn thiện công nghệ và sản xuất;
7. theo dõi kết quả thương mại hóa sau giao dịch.

Nếu NacenTech chỉ triển khai lớp phần mềm, xác suất hình thành thị trường bền vững vẫn thấp. Nếu có liên minh thể chế gồm cơ quan quản lý, NacenTech, NATIF/ngân hàng, viện–trường/TLO, tổ chức thẩm định và mạng lưới broker, xác suất thành công tăng đáng kể.

## 2. Hiểu đúng mô hình Hàn Quốc

### 2.1 National Technology Bank — hạ tầng dữ liệu

National Technology Bank (`NTB`) do Korea Institute for Advancement of Technology (`KIAT`) vận hành có nhiệm vụ thu thập, quản lý và phân phối thông tin công nghệ hình thành từ R&D quốc gia; liên kết các hệ thống thông tin và cung cấp tìm kiếm, phân tích sáng chế, hỗ trợ giao dịch.

NTB giải quyết bài toán **nguồn cung dữ liệu có cấu trúc**. Nó không tự mình giải quyết toàn bộ thương mại hóa.

### 2.2 Smart Tech-Bridge — hạ tầng giao dịch theo nhu cầu

Smart Tech-Bridge do Korea Technology Finance Corporation (`KOTEC`, còn gọi `KIBO`) vận hành. Nền tảng tự định vị là hệ thống giao dịch công nghệ **demand-based**, kết nối nhu cầu công nghệ của SME với công nghệ từ viện nghiên cứu, trường đại học và khu vực tư nhân.

Hệ thống hỗ trợ:

- tìm kiếm và matching công nghệ;
- kết nối broker chuyên trách;
- đánh giá công nghệ và giá trị tham chiếu;
- hợp đồng điện tử;
- bảo vệ công nghệ;
- kết nối tài chính;
- hỗ trợ sau chuyển giao và thương mại hóa.

Theo công bố của Chính phủ Hàn Quốc, Smart Tech-Bridge ghi nhận 1.627 giao dịch công nghệ trong năm 2023; số này tương đương 13,4% tổng số giao dịch công nghệ công được dẫn chiếu, và SME chiếm trên 99% giao dịch trên nền tảng.

### 2.3 Mạng lưới broker — lớp chuyển đổi quan trọng nhất

Smart Tech-Bridge không giả định doanh nghiệp tự tìm kiếm, tự hiểu bằng sáng chế và tự đàm phán. KOTEC duy trì nhân sự giao dịch công nghệ tại các trung tâm, đồng thời cho phép tổ chức môi giới tư nhân tham gia quy trình đồng môi giới.

Broker thực hiện các công việc mà phần mềm khó thay thế:

- phân tích vấn đề kinh doanh thành nhu cầu công nghệ;
- tìm và sàng lọc công nghệ;
- liên hệ chủ sở hữu/TLO;
- tổ chức NDA và data room;
- điều phối đánh giá kỹ thuật;
- thương lượng phạm vi chuyển giao, giá, royalty và quyền IP;
- kết nối tài chính;
- theo giao dịch đến khi ký và triển khai.

AI chỉ giúp broker thu hẹp không gian tìm kiếm. AI không phải bên chịu trách nhiệm đưa thương vụ tới hợp đồng.

### 2.4 Technology evaluation và finance — động cơ tạo giao dịch

Lợi thế đặc biệt của KOTEC là kết hợp chức năng môi giới với năng lực đánh giá và tài chính công nghệ. Doanh nghiệp tiếp nhận IP có thể được xem xét hỗ trợ theo các giai đoạn:

1. **Acquisition** — tiền mua, license, phí ban đầu và đào tạo chuyển giao;
2. **Completion** — R&D bổ sung, mẫu thử, kiểm định và hoàn thiện sản phẩm;
3. **Commercialization** — cơ sở sản xuất, thiết bị và vốn vận hành.

Điều này giải quyết một thất bại thị trường quan trọng: doanh nghiệp có nhu cầu và tìm được công nghệ nhưng không có nguồn vốn phù hợp để mua và triển khai.

### 2.5 Technology trust và bảo vệ IP

KOTEC còn vận hành cơ chế technology trust cho một số patent. Cơ chế này hỗ trợ quản lý quyền, môi giới, thu phí chuyển giao và bảo vệ chủ sở hữu. Mức phí công khai của một số giao dịch trust nằm trong khoảng 8–15% tùy giá trị và chính sách áp dụng.

Điều đáng học không phải là sao chép pháp lý của trust, mà là nguyên tắc: **chủ công nghệ đưa tài sản tốt lên hệ thống khi họ nhận được bảo vệ và năng lực giao dịch mà tự làm bên ngoài không có**.

### 2.6 Căn cứ luật và phân vai rõ ràng

Hàn Quốc có luật thúc đẩy chuyển giao và thương mại hóa công nghệ, xác định mục tiêu chuyển công nghệ từ tổ chức nghiên cứu công sang khu vực tư nhân, đồng thời thúc đẩy giao dịch công nghệ tư nhân.

Kết quả là mỗi cấu phần có một chủ thể rõ ràng:

| Cấu phần | Chủ thể điển hình |
|---|---|
| Chính sách và luật chơi | Bộ quản lý |
| Hạ tầng dữ liệu R&D | KIAT/NTB |
| Giao dịch và tài chính | KOTEC/Smart Tech-Bridge |
| Chuẩn bị nguồn cung | TLO tại viện/trường |
| Đánh giá | KOTEC và tổ chức chuyên môn |
| Môi giới | KOTEC + tổ chức tư nhân |
| Vốn | KOTEC, quỹ và tổ chức tài chính |

## 3. Điều proposal NacenTech đã làm đúng

`proposal.md` đã nhận diện bốn lớp phù hợp với logic Hàn Quốc:

- `Data & Trust Backbone`;
- `Marketplace`;
- lớp dịch vụ giá trị gia tăng;
- `Intelligence Layer`.

Proposal cũng nhìn thấy các dịch vụ quan trọng như định giá IP, thẩm định kỹ thuật, PoC, tư vấn pháp lý, kết nối chuyên gia, lab và đào tạo.

Vì vậy, tầm nhìn dài hạn không cần thu hẹp thành một sàn đặt lịch thiết bị. Phần cần thay đổi là **đơn vị vận hành cốt lõi và thứ tự triển khai**.

## 4. Những điểm proposal cần sửa

### 4.1 Đổi đơn vị giá trị từ listing sang Commercialization Case

Đơn vị giá trị không phải hồ sơ công nghệ hoặc tài khoản người dùng. Đơn vị giá trị phải là một `CommercializationCase` có:

- một problem owner;
- nhu cầu đã chuẩn hóa;
- ngân sách hoặc đường tài chính;
- một hoặc nhiều công nghệ ứng viên;
- broker chịu trách nhiệm;
- tiêu chí stage-gate;
- hợp đồng hoặc pilot;
- outcome được xác minh;
- theo dõi sau thương mại hóa.

### 4.2 Demand-first thay vì supply-first

NacenTech chỉ ingest lượng lớn dữ liệu sau khi đã xác định rõ các loại nhu cầu cần phục vụ. Nếu nhập hàng nghìn công nghệ trước khi có demand, hệ thống sẽ lặp lại mô hình danh bạ.

Thứ tự đúng:

1. thu thập nhu cầu có người chịu trách nhiệm và có ngân sách;
2. chuẩn hóa nhu cầu;
3. tìm công nghệ từ nhiều nguồn;
4. curate shortlist;
5. tổ chức giao dịch và hỗ trợ tài chính.

### 4.3 Tách hạ tầng công khỏi hoạt động thương mại

Không nên đặt mục tiêu toàn bộ hạ tầng quốc gia tự nuôi sống bằng subscription và success fee ngay từ đầu.

Mô hình tài chính hỗn hợp phù hợp hơn:

| Dòng doanh thu/kinh phí | Chi trả cho |
|---|---|
| Hợp đồng dịch vụ công/ngân sách | Chuẩn dữ liệu, tích hợp R&D công, audit, báo cáo chính sách |
| Phí quản lý chương trình | Vận hành challenge, voucher, PoC và portfolio |
| Phí môi giới/success fee | Tìm kiếm, điều phối và hoàn tất giao dịch |
| Phí chuyên môn | Đánh giá, định giá, pháp lý, IP, verification |
| Phí nền tảng giao dịch | Hợp đồng, evidence, hồ sơ quyết toán, workflow |
| Dữ liệu/báo cáo | Báo cáo tổng hợp và dịch vụ phân tích được phép |

### 4.4 Finance là một bounded context cấp một

Finance không được đặt ở cuối roadmap như tiện ích bổ sung. Ngay từ `CommercializationCase`, hệ thống phải biết:

- tổng nhu cầu vốn;
- vốn tự có;
- phần sponsor/voucher;
- khoản cần vay/bảo lãnh;
- điều kiện giải ngân;
- tình trạng hồ sơ tài chính;
- tổ chức tài chính đang xử lý.

NacenTech không tự phê duyệt tín dụng và không giữ tiền. Nó chuẩn hóa hồ sơ, xin consent, gửi sang đối tác và nhận trạng thái.

### 4.5 Technology Broker là nghề nghiệp, không phải quyền admin

Broker cần:

- hồ sơ năng lực và ngành chuyên sâu;
- xung đột lợi ích được khai báo;
- portfolio case;
- SLA;
- cơ chế chia phí;
- đánh giá dựa trên outcome;
- quyền truy cập data room theo từng case.

## 5. Ánh xạ Hàn Quốc sang Việt Nam

| Năng lực cần có | Đề xuất chủ thể tại Việt Nam | Vai trò của NacenTech |
|---|---|---|
| Chuẩn và chính sách | Bộ/cơ quan quản lý | Thực thi bằng policy version và gate |
| Dữ liệu R&D công | Cơ sở dữ liệu quốc gia, bộ/ngành, viện–trường | Ingest, chuẩn hóa, deduplicate, lineage |
| Chuẩn bị công nghệ | TLO/đơn vị chuyển giao tại viện–trường | Workbench và quality gate |
| Thu thập demand | Hiệp hội, tập đoàn, địa phương, broker | Demand intake và qualification |
| Môi giới | NacenTech + tổ chức tư vấn tư nhân | Broker network, assignment, fee sharing |
| Đánh giá/định giá | Tổ chức chuyên môn độc lập | Orchestration và evidence |
| Tài chính | NATIF, ngân hàng, quỹ bảo lãnh, sponsor | Finance application orchestration |
| Pilot | Doanh nghiệp, viện/lab, sponsor | Milestone, evidence, verification |
| Hợp đồng/IP | Các bên giao dịch, luật sư, CA | Data room, template, e-sign và audit |
| Theo dõi outcome | NacenTech + problem owner + evaluator | Outcome registry và báo cáo |

Phân vai này cần được xác nhận bằng MoU/quy chế. Không nên giả định API hoặc dữ liệu sẽ tự có sau khi phần mềm hoàn thành.

## 6. Mô hình vận hành đề xuất

### 6.1 Ba tuyến giao dịch

NacenTech hỗ trợ ba tuyến nhưng mở tuần tự:

1. `CHALLENGE_PILOT` — doanh nghiệp/cơ quan có bài toán, tuyển giải pháp để PoC;
2. `TECHNOLOGY_TRANSFER` — mua, license hoặc nhận chuyển giao IP/know-how;
3. `SHARED_INFRASTRUCTURE` — dùng lab, thiết bị và chuyên gia để hoàn thiện công nghệ.

Ba tuyến dùng chung identity, demand, broker, data room, evidence, evaluation và outcome. Mỗi tuyến có sub-workflow và tiêu chí nghiệm thu riêng; không ép tất cả vào cùng một state machine chi tiết.

### 6.2 Stage-gate chung

```text
DISCOVERY
  → QUALIFICATION
  → MATCHING
  → DUE_DILIGENCE
  → DEAL_DESIGN
  → EXECUTION
  → OUTCOME_VERIFICATION
  → COMMERCIALIZATION_MONITORING
  → CLOSED
```

Mỗi cổng phải có người chịu trách nhiệm, bằng chứng đầu vào và quyết định có chữ ký/audit.

### 6.3 Cơ chế tạo demand

Demand không chỉ đến từ form tự đăng. Nguồn demand gồm:

- chương trình challenge có ngân sách;
- bài toán từ tập đoàn và hiệp hội;
- nhu cầu đổi mới công nghệ do broker phát hiện;
- yêu cầu tuân thủ/kiểm định;
- portfolio NATIF/ngân hàng cần giải pháp;
- bài toán phát triển địa phương được phân rã thành yêu cầu có thể mua.

## 7. Đề xuất pilot 12 tháng

### Phase 0 — Liên minh vận hành, 0–2 tháng

Điều kiện ra:

- một sponsor có ngân sách;
- một đối tác tài chính có đầu mối xử lý;
- 3–5 TLO/viện/trường;
- 10–20 doanh nghiệp có nhu cầu;
- 3–5 broker;
- một bộ tiêu chí qualification và outcome.

Không qua cổng này thì không xây platform đầy đủ.

### Phase 1 — Concierge pilot, 2–5 tháng

- xử lý case bằng broker và công cụ nội bộ;
- 20 demand được phỏng vấn;
- ít nhất 10 demand đạt qualification;
- 5 shortlist;
- 3 proposal/pilot agreement;
- ít nhất một hợp đồng có giá trị thật.

Mục tiêu là học quy trình, không phải tăng user/listing.

### Phase 2 — Transaction workspace, 5–9 tháng

- demand intake;
- broker workbench;
- technology packaging;
- matching có giải thích;
- data room/NDA;
- evaluation workflow;
- deal design;
- pilot milestone và outcome registry;
- finance referral.

### Phase 3 — Finance và mở rộng, 9–12 tháng

- tích hợp đối tác tài chính;
- hồ sơ tài chính chuẩn;
- chương trình voucher/challenge nếu có quy chế;
- e-contract;
- fee sharing cho broker;
- dashboard outcome.

## 8. KPI đúng

### KPI leading

- demand có problem owner và ngân sách;
- tỷ lệ demand đạt qualification;
- thời gian từ demand đến shortlist;
- số case có broker chịu trách nhiệm;
- số proposal được doanh nghiệp chấp nhận xem xét;

### KPI transaction

- số pilot agreement;
- số hợp đồng chuyển giao/license;
- tổng giá trị hợp đồng;
- vốn tư nhân và vốn đối ứng huy động;
- thời gian từ qualified demand đến hợp đồng;

### KPI outcome

- tỷ lệ pilot đạt tiêu chí;
- tỷ lệ công nghệ tiếp tục triển khai sau 6/12 tháng;
- doanh thu/chi phí tiết kiệm được xác minh;
- số sản phẩm đi từ pilot sang sản xuất;
- repeat rate của problem owner;

Không dùng số tài khoản, số listing hoặc lượt xem làm KPI thành công chính.

## 9. Điều chỉnh đánh giá cơ hội thành công

| Điều kiện | Đánh giá định tính |
|---|---|
| Chỉ xây marketplace và nhập dữ liệu | Thấp, khoảng 20–30% |
| Có sponsor và broker nhưng chưa có finance | Trung bình, khoảng 35–45% |
| Có demand, broker, TLO, evaluation và finance partner | Trung bình–khá, khoảng 50–60% |
| Có mandate dữ liệu, dòng chương trình lặp lại và outcome đã chứng minh | Có thể vượt 60% |

Các tỷ lệ này là đánh giá chiến lược có điều kiện, không phải dự báo thống kê.

## 10. Các quyết định cần chốt

1. NacenTech là hạ tầng công, SPV thương mại hay mô hình hai pháp nhân/two-ledger?
2. Cơ quan nào có quyền yêu cầu chia sẻ dữ liệu R&D công?
3. Ai là sponsor đầu tiên và quy mô ngân sách bao nhiêu?
4. Đối tác tài chính nào tham gia pilot?
5. TLO nào chịu trách nhiệm đóng gói và xác nhận quyền công nghệ?
6. Broker được chọn, trả phí và xử lý xung đột lợi ích thế nào?
7. Ai có thẩm quyền đánh giá và định giá?
8. Nguồn thu nào trả cho hạ tầng công; nguồn thu nào thuộc dịch vụ thương mại?
9. Ngành pilot đầu tiên là gì?
10. Outcome nào được coi là bằng chứng thương mại hóa thành công?

## 11. Kiểm chứng tuyên bố “10 tỷ USD”

`proposal.md` đang ghi Hàn Quốc đạt giá trị giao dịch 10 tỷ USD. Chưa có nguồn trong bộ tài liệu chứng minh đây là GMV của một marketplace cụ thể. Con số có thể bị trộn với technology trade quốc tế, venture investment hoặc tổng giá trị của hệ sinh thái.

Khuyến nghị thay bằng số liệu Smart Tech-Bridge có nguồn chính thức: 1.627 giao dịch năm 2023 và 13,4% tổng giao dịch công nghệ công được dẫn chiếu. Chỉ dùng số USD sau khi xác định rõ:

- phạm vi giao dịch;
- kỳ báo cáo;
- đơn vị phát hành;
- gross transaction value hay giá trị kinh tế tạo ra;
- có phải giao dịch qua platform hay toàn thị trường.

## 12. Nguồn tham khảo chính

- [KOTEC — Overview of Smart Tech-Bridge](https://tb.kibo.or.kr/ktbseng/overview/smart-tech-bridge/overviewOfSTB.do)
- [KOTEC — Technology transfer and financing](https://tb.kibo.or.kr/ktbseng/index.do)
- [KOTEC — IP acquisition guarantee](https://tb.kibo.or.kr/ktbs/board/info/menual/menual02.do)
- [KOTEC — Joint technology brokerage](https://tb.kibo.or.kr/ktbs/consignment/consignmentInfoView.do)
- [KOTEC — Technology trust](https://tb.kibo.or.kr/ktbs/trust-tech/trustTech01.do)
- [Government of Korea — Smart Tech-Bridge performance](https://www.korea.net/Government/Briefing-Room/Press-Releases/view?articleId=1051140&insttCode=A260117&type=N)
- [KIAT — National Technology Bank](https://www.kiat.or.kr/front/board/boardContentsView.do?MenuId=&board_id=90&contents_id=ad927463fbf646db919e53a3aa7dd0f6)
- [Vietnam — chức năng của NATIF](https://vbpl.vn/botaichinh/Pages/vbpq-toanvan.aspx?ItemID=183409)
- [Bộ KH&CN — hợp tác NATIF và ngân hàng](https://www.most.gov.vn/vn/tin-tuc/23256/tpbank-ky-thoa-thuan-hop-tac-cung-quy-doi-moi-cong-nghe-quoc-gia.aspx)

