# ADR-0011: Tín hiệu nhu cầu từ dữ liệu mời thầu công khai

- Trạng thái: ACCEPTED_WITH_LEGAL_GATE — mã được viết, kích hoạt bị chặn tới khi đóng cổng pháp lý ở mục "Cổng chặn kích hoạt"
- Ngày: 2026-09-06
- Quyết định bởi: chủ sản phẩm. Đã cuốn vào baseline **V2.21** ngày 2026-09-06 (bảng §1.3, `SourceRecord` §10.2)
- Liên quan: §1.1 (demand-first), §3 nguyên tắc 1/6/13, §10.2 `SourceRecord`, §11 qualification, §19.6 Government Innovation Fabric,
  bất biến 102 (§32), D2-87; `docs/07-references/mo-hinh-dauthau-net.md` mục 5; ADR-0012

## Bối cảnh

`docs/07-references/mo-hinh-dauthau-net.md` mục 5 kết luận: mô hình thuê bao cảnh báo sống được vì có một dòng dữ liệu
công khai được luật buộc công bố, và NacenTech không có dòng tương đương — nguồn duy nhất tương ứng là các rail của
`Government Innovation Fabric` (§19.6), hiện `SCALE_AFTER_EVIDENCE`/`DEFERRED_OPTION`, cần `InterAgencyMandateVersion`
thật chứ không chỉ cần mã. Lead time tính bằng quý.

Trong khi đó dữ liệu mời thầu công khai đã có sẵn trên thị trường dưới dạng sản phẩm có hợp đồng: DauThau.info bán gói
`API` truy vấn dữ liệu thầu thời gian thực trên CSDL thầu quốc gia 10 năm. Mua theo hợp đồng license giải quyết đúng bài
toán "không có phễu công khai" trong vài ngày thay vì vài quý, và vì có license nên tránh được tiền lệ đã đo ở mục 6c của
tài liệu trên (dauthau.info bị Sở TT&TT Hà Nội phạt 50 triệu đồng ngày 18/3/2021 vì tổng hợp lại nội dung mà không có
giấy phép, theo Nghị định 72/2013).

### Sự kiện đã đo, không phải giả định

| Sự kiện | Đo ở đâu |
|---|---|
| `SourceRecord` **chưa tồn tại trong mã** dù §10.2 đã đặc tả | `grep -rl SourceRecord modules packages --include=*.cs` → rỗng |
| Module `integration` **không có adapter vào**; chỉ có mail, object storage, LLM client | `modules/integration/Infrastructure/` — 4 tệp |
| `DemandBrief` và `TechnologyAsset` đã có domain; không có nguồn dữ liệu ngoài nào nạp vào chúng | `modules/demand/Domain/DemandBrief.cs`, `modules/technology/Domain/TechnologyAsset.cs` |
| Bề mặt v2 hiện có 20 endpoint trên 5 controller; không có nhóm nào cho nguồn dữ liệu ngoài | `apps/api/V2/` |
| NacenTwin không có dữ liệu thị trường nào ngoài dữ liệu người dùng tự nhập | toàn bộ `modules/` |

### Tín hiệu nào đáng giá

Không phải mọi thông báo mời thầu. Giá trị tập trung ở hai lớp, và lớp thứ hai là lý do chính của ADR này:

1. `TENDER_TECH_SIGNAL` — bên mời thầu vừa đăng gói thầu có yếu tố công nghệ. Nghĩa là tổ chức đó **có ngân sách và đang
   đầu tư**. Đây là lead cho cuộc hội thoại thượng nguồn, không phải cho việc giới thiệu nhà cung cấp.
2. `UNMET_TENDER` — gói thầu **không có nhà thầu tham gia**, phải gia hạn hoặc bị hủy. Có chủ, có ngân sách đã duyệt, có
   thời hạn, và thị trường không đáp ứng nổi. Đó chính là định nghĩa đầu vào của `CHALLENGE_PILOT` (§6.1) và là tín hiệu
   nhu cầu công nghệ chất lượng cao nhất tồn tại trong dữ liệu công khai Việt Nam.

Nhà cung cấp dữ liệu có lớp thứ hai nhưng không có sản phẩm cho nó, vì khách hàng của họ là nhà thầu chứ không phải chủ
đầu tư. Đây là phần thị trường bỏ lại, không phải phần phải giành.

## Lựa chọn

**A. Chờ Government Innovation Fabric.** Đúng kiến trúc, không tốn phí license, nhưng lead time tính bằng quý và phụ
thuộc mandate liên cơ quan — thứ NacenTech chưa có. Trong thời gian đó NacenTwin không có nguồn demand nào ngoài nhập tay.

**B. Tự thu thập dữ liệu mời thầu công khai.** Chi phí kỹ thuật thấp, rủi ro pháp lý cao và đã có tiền lệ xử phạt. Vi phạm
nguyên tắc 6 (source authority) và bất biến 102 nếu không có purpose/license/lineage. Loại.

**C. Mua qua hợp đồng license, nạp thành tín hiệu có lineage, người chuyển thành demand.** Tốn phí thuê bao; phụ thuộc một
nhà cung cấp; nhưng có license, có lineage, và không đổi bất biến nào.

**D. Như C nhưng cho hệ thống tự tạo `DemandBrief` từ tín hiệu.** Nhanh hơn nhưng vi phạm nguyên tắc 1 và D2-87 — không ai
được tự tạo demand "đủ điều kiện" mà không có người có thẩm quyền xác nhận owner, mục tiêu, baseline và budget path. Loại.

## Quyết định

**C.** Chi tiết:

1. **Adapter ngoài biên, không phải module mới.** `TenderSignalAdapter` nằm trong `modules/integration`, theo đúng lớp
   thứ tư của §9.4.1: connector contract + inbox/idempotency + conformance test + **manual fallback**. Nhà cung cấp hỏng
   hoặc hết hợp đồng thì tín hiệu ngừng chảy; case đang chạy không bị ảnh hưởng và không có dữ liệu nào bị giả lập.

2. **`SourceRecord` được cài đặt trước, đây là điều kiện tiên quyết.** Đúng đặc tả §10.2: `source`, `externalId`,
   `fetchedAt`, `hash`, `license`, `authorityLevel`. Không tín hiệu nào vào hệ thống mà thiếu `SourceRecord`; ràng buộc
   ở tầng cơ sở dữ liệu, không phải ở tầng ứng dụng.

3. **`DemandSignal` là read-side, không phải aggregate nghiệp vụ.** Nó có `signalClass` (`TENDER_TECH_SIGNAL` |
   `UNMET_TENDER`), `sourceRecordId`, tổ chức liên quan, lĩnh vực đã ánh xạ taxonomy, và trạng thái xử lý. Nó **không**
   có stage, không có broker, không có `DecisionRecord`, không xuất hiện trong ma trận §7.4.

4. **Chuyển tín hiệu thành demand là hành động của người, có ghi vết.** `DemandSignal → DemandBrief` chỉ xảy ra khi
   người có mandate xác nhận problem owner, mục tiêu, baseline và budget path theo §11. Bản ghi chuyển đổi giữ
   `sourceRecordId` để mọi `DemandBrief` sinh từ tín hiệu đều truy được nguồn. Tín hiệu không được chuyển vẫn giữ lại
   kèm lý do — đó là dữ liệu về thị trường, không phải rác.

5. **Tín hiệu không phải nhu cầu đã qualified và không được hiển thị như vậy.** UI phải phân biệt rõ hai loại; báo cáo và
   KPI không được gộp số tín hiệu vào số demand (§28 cấm dùng activity metric làm north-star).

6. **Không tái phân phối.** Dữ liệu mua theo license chỉ dùng trong phạm vi license cho phép. Không xuất lại thành sản
   phẩm dữ liệu của NacenTwin, không đưa vào API công khai, không đưa vào digest cho bên thứ ba — cho tới khi điều khoản
   license được pháp chế xác nhận cụ thể cho từng mục đích đó. Xem ADR-0012 mục về digest.

## Cổng chặn kích hoạt

Mã được viết và test được, nhưng adapter **không được bật ở môi trường thật** cho tới khi cả bốn mục đóng:

1. Hợp đồng license với nhà cung cấp dữ liệu, ghi rõ phạm vi: đọc nội bộ, hiển thị lại, tạo tác phẩm phái sinh, thời hạn,
   và điều gì xảy ra với dữ liệu đã nạp khi hợp đồng chấm dứt.
2. Pháp chế xác nhận việc hiển thị lại dữ liệu này trong sản phẩm không rơi vào diện phải cấp phép theo quy định về
   thông tin điện tử tổng hợp. Tiền lệ 18/3/2021 là căn cứ để hỏi, không phải để suy đoán.
3. Đăng ký data-product theo bất biến 102: nguồn, license, purpose, prohibited field, retention và revocation.
4. Quyết định điều gì xảy ra khi hợp đồng chấm dứt: `SourceRecord` giữ lại như bằng chứng lineage của các `DemandBrief`
   đã sinh, còn `DemandSignal` chưa chuyển đổi thì xóa hay giữ. Đây là câu hỏi hợp đồng, không phải kỹ thuật.

## Hệ quả

- `modules/integration` có thêm hướng vào; cần inbox có idempotency key theo `(source, externalId, hash)` để nạp lại
  không sinh trùng.
- Ánh xạ taxonomy của nhà cung cấp sang taxonomy NacenTwin là công việc thật và sẽ sai ở biên. Ánh xạ phải là
  `ConfigurationSetVersion` có version và rollback (§9.4.3), không phải bảng cứng trong mã.
- Phụ thuộc một nhà cung cấp thương mại cho một đường dữ liệu. Chấp nhận được vì đây là nguồn bổ sung chứ không phải
  nguồn sống của case; nhưng contract phải có điều khoản xuất dữ liệu đã nạp khi chấm dứt.
- §10.2 và §34 cần cập nhật để ghi nhận nguồn tín hiệu ngoài. Việc sửa hai mục đó thuộc Architecture Council.
- `search_query_log` vẫn là đường găng riêng và không được thay thế bằng dữ liệu mua (§26.6.5 cấm golden set tự nghĩ ra).

## Câu hỏi còn mở

- Nhà cung cấp có bán gói API cho mục đích này không, và giá bao nhiêu. Chưa đàm phán.
- Dữ liệu "gói thầu bị hủy do không có nhà thầu" có được phân loại riêng trong API của họ không, hay phải suy ra từ
  chuỗi sự kiện gia hạn/hủy. Nếu phải suy ra thì logic suy diễn là tài sản của NacenTwin và phải có test.
- Tỷ lệ tín hiệu chuyển thành `DemandBrief` thật là bao nhiêu. Không có số nào để giả định; phải đo trong ba tháng đầu và
  đặt ngưỡng dừng nếu quá thấp.

## Cổng "done"

- `SourceRecord` có migration, ràng buộc NOT NULL cho `license` và `authorityLevel`, và test chứng minh không thể ghi
  `DemandSignal` thiếu `SourceRecord`.
- Test chứng minh nạp lại cùng `(source, externalId, hash)` không sinh bản ghi trùng.
- Test chứng minh không có đường mã nào tạo `DemandBrief` từ `DemandSignal` mà không đi qua xác nhận của người có mandate.
- Test chứng minh adapter hỏng không làm dừng bất kỳ thao tác nào trên case đang chạy.
- Bốn mục ở "Cổng chặn kích hoạt" đóng, có văn bản.
