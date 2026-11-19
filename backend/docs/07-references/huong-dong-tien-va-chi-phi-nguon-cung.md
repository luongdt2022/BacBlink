# Hướng dòng tiền và chi phí nguồn cung — §13.11 khác mọi mô hình trong §34

> Trạng thái: quan sát đối chiếu, không đề xuất quyết định nào
> Ngày: 2026-09-05
> Phạm vi: hướng dòng tiền giữa khách hàng, nền tảng và chuyên gia
> Liên quan: §13.11, §34.11.5, §20.5.4 dòng "Bàn điều hành/trợ lý AI riêng cho chuyên gia", §20.5.5, §20.5.9 gate H0, §20.5.6

## 1. Phát hiện

Mọi mô hình mạng chuyên gia trong §34 — kể cả các mô hình mới trong ngành dữ liệu huấn luyện AI — có **cùng một hướng dòng tiền**: khách hàng trả nền tảng, nền tảng trả chuyên gia. Nền tảng phải bỏ tiền để có nguồn cung.

§13.11 đi ngược hướng đó. Bàn điều hành bán cho chính chuyên gia, nên chuyên gia là bên trả tiền, và khách hàng của chuyên gia trả trực tiếp cho chuyên gia. Không mô hình nào trong §34 có hình dạng này.

Hệ quả đúng của quan sát này hẹp hơn vẻ ngoài của nó: nó có nghĩa **không có mô hình nào trong register so sánh được về kinh tế nguồn cung cho dòng sản phẩm này**, nên mọi suy luận kiểu "GLG/AlphaSights làm thế nên ta làm thế" không áp được. Nó **không** có nghĩa đây là dòng doanh thu chính hay là chỗ lợi nhuận của NacenX — mục 4 đặt lại đúng vị trí của nó trong mô hình kinh tế đã có ở §20.5.

## 2. Đối chiếu hướng dòng tiền

| Mô hình | Hướng dòng tiền | Ai trả để có nguồn cung | Grade bằng chứng |
|---|---|---|---|
| GLG, AlphaSights | khách → nền tảng → chuyên gia | nền tảng, theo cuộc gọi/buổi | `E1–E2` (§34.11.5) |
| Heidrick & Struggles | khách → nền tảng → chuyên gia | nền tảng, qua search/interim fee | `E3_VERIFIED` (filing 2024) |
| Upwork | khách → nền tảng → freelancer | nền tảng, qua take rate 18,7% | `E3_VERIFIED` (filing 2025) |
| Surge AI | khách → nền tảng → chuyên gia | nền tảng, theo giờ chuyên gia | `E1_CLAIMED` (tự công bố/báo chí) |
| Mercor | khách → nền tảng → chuyên gia | nền tảng, theo giờ/đơn vị việc | `E1_CLAIMED` (định giá vòng tư nhân) |
| Appen | khách → nền tảng → người làm | nền tảng, theo đơn vị việc | `E0_ADVERSE` (filing niêm yết) |
| **§13.11 Bàn điều hành** | **khách → chuyên gia → nền tảng** | **không ai — chuyên gia trả phí desk** | chưa có; chưa chạy pilot |

Dòng cuối cố ý không có grade. §13.11.6 đặc tả pilot 90 ngày với sáu chỉ số và cổng `STOP/REDESIGN`; chưa chạy nên chưa có gì xếp hạng. Gán `E1_CLAIMED` cho một mô hình chưa vận hành sẽ vi phạm §34.1.1.

Hai dòng `E3_VERIFIED` đáng chú ý: bằng chứng **mạnh nhất** trong nhóm này nằm ở hướng dòng tiền ngược lại. Đó là lý do quan sát ở mục 1 không được đọc thành lợi thế đã được chứng minh.

## 3. Hướng dòng tiền quyết định gì

Ba hệ quả trực tiếp của hướng, không phụ thuộc chất lượng vận hành:

**Chi phí thu hút nguồn cung.** Ở sáu mô hình trên, chi phí này dương và biến đổi — đúng loại "sàn chi phí biến đổi" mà §20.5.6 ghi là không giảm được bằng phần mềm. Ở §13.11 nó âm: chuyên gia trả để vào.

**Ai phải tạo ra cầu.** Sáu mô hình trên phải tự tìm khách cho chuyên gia. §13.11 không: theo §13.11.1, bàn điều hành nhận và sàng lọc yêu cầu "từ Web, Zalo, email và referral" — cầu chuyên gia đã có. Sản phẩm là thời gian trả lại cho chuyên gia, không phải khách hàng mới cho chuyên gia.

**Phân tán doanh thu.** Doanh thu theo số desk phân tán theo số chuyên gia trả phí thay vì tập trung vào vài người mua lớn. Appen ở dòng cuối bảng là ca có filing cho thấy hướng kia dẫn tới đâu khi cần khối lượng: 80% doanh thu từ 5 khách hàng.

## 4. Vị trí thật trong mô hình kinh tế §20.5

§20.5.4 đã có dòng này từ trước — nó là **một trong 18 dòng doanh thu**, biên `[TBD]`, kèm cảnh báo biên: *"thuê bao định kỳ tốt; giờ trợ lý người và chi phí AI/channel phải nằm trong quota"*. Chi phí nguồn cung âm không miễn trừ cảnh báo đó: giờ trợ lý người là chi phí biến đổi theo số desk.

Giá trị của dòng này với P&L của NacenX là một số hạng cụ thể trong công thức §20.5.5:

```text
BreakEvenDealsPerYear = UncoveredAnnualFixedCashCost ÷ ContributionPerClosedDeal

UncoveredAnnualFixedCashCost =
    AnnualFixedCashCost − RecurringContributionAlreadyContracted
```

Thuê bao desk là một nguồn `RecurringContributionAlreadyContracted` — nó **giảm số deal cần để hoà vốn**, không tự nó là lợi nhuận. Đó là đúng chỗ ba kịch bản H0 của §20.5.9 phân biệt nhau:

| Kịch bản H0 | Recurring đã ký | Deal cần hoà vốn | Capacity | Kết luận |
|---|---:|---:|---:|---|
| A — success-fee-led | 3 | 50 | 21 | `NO_GO` |
| B — mixed recurring base | 10 | 20 | 34 | `CONDITIONAL_GO` |
| C — scaled recurring portfolio | 18 | 14 | 70 | `GO_IF_VALIDATED` |

Đơn vị tỷ VND/năm. §20.5.9 tự đánh giá mức sẵn sàng kinh tế hiện tại là `CONDITIONAL`, khoảng 5/10, và ghi rõ mô hình **khả thi thấp nếu success fee/transaction fee là nguồn chính trong 24 tháng đầu**. Gate H0 điểm 2 đặt ngưỡng cứng: trước Phase 4A, recurring contribution phủ tối thiểu 65% `AnnualFixedCashCost`.

**Độ nhạy — số giả định để trình bày phương pháp, không phải số đề xuất.** Kịch bản B cần 10 tỷ recurring contribution. Nếu một desk cho contribution khoảng 60 triệu/năm sau khi trừ giờ trợ lý người và chi phí AI/channel, cần khoảng 167 desk để phủ riêng số đó. Pilot §13.11.6 là 10–15 chuyên gia, tức cỡ 6–9%. Dòng này là **một chân của độ phủ recurring, không phải câu trả lời cho độ phủ đó**.

Biến quyết định sự sống của mô hình vẫn là `HoursPerClosedDeal` ở §20.5.2, và hướng dòng tiền không tác động tới nó. §20.5.6 liệt kê bốn cách hợp lệ để cải thiện biên — định giá đúng, chặt cổng qualification, tăng chuyển đổi, giảm giờ trên mỗi case — và cấm nới guardrail để lấy biên.

## 5. Điều tài liệu này không kết luận

- Không kết luận có bao nhiêu chuyên gia ở Việt Nam chịu trả phí desk, hay trả bao nhiêu. Đó là câu hỏi của pilot §13.11.6.
- Không kết luận dòng này có lãi. Ô biên của nó ở §20.5.4 là `[TBD]`, và §20.5.4 quy định dòng nào không đạt biên mục tiêu sau 12 tháng thì đóng hoặc định giá lại.
- Không kết luận chi phí nguồn cung âm là đủ. §13.11.4 và §13.11.5 liệt kê rủi ro xung đột vai trò, ủy quyền và cách ly dữ liệu; hướng dòng tiền không xử lý mục nào trong đó.
- Không thay bất kỳ giá trị `[TBD]` nào. Nghĩa vụ đo ở §20.5.8 vẫn nguyên: Phase 0 phải trả về `brokerHours[stage]`, `billableUtilization`, `concurrentCasesPerBroker`, `brokerLoadedRate`, giá của ít nhất ba dòng dịch vụ và tỷ lệ chuyển đổi thật từng stage.
- Không đề nghị sửa §34. Thêm dòng §13.11 vào bảng đối chiếu §34.11.5 phải qua Architecture Council và phải có bằng chứng từ pilot.
- Con số Surge và Mercor là tự công bố hoặc báo chí, ghi rõ là operator-reported theo quy tắc 4 §34.1.1.

## 6. Nguồn

Nguồn của GLG, AlphaSights, Heidrick & Struggles và Upwork đã có ở §35 của `NACENTECH_ARCHITECTURE_V2.md`. Bổ sung cho hai dòng chưa có trong register:

- [Inc. — Edwin Chen bootstrap Surge AI tới 1 tỷ USD doanh thu](https://www.inc.com/sam-blum/bootstrapped-to-1-billion-surge-ai-ceo-edwin-chen-on-how-he-did-it/91207937)
- [GetLatka — Surge AI đạt 1,2 tỷ USD doanh thu với khoảng 110 người](https://getlatka.com/blog/surgeai-revenue-valuation)
- [Computerworld — khách hàng rời Scale AI, lợi cho đối thủ như Mercor](https://www.computerworld.com/article/4009714/metas-14-3b-stake-triggers-scale-ai-customer-exodus-could-be-a-windfall-for-rivals-like-mercor.html)
- [Staffing Industry Analysts — Appen mất hợp đồng Google, doanh thu giảm](https://www.staffingindustry.com/news/global-daily-news/appen-h1-operating-revenue-falls-with-google-contract-termination)
