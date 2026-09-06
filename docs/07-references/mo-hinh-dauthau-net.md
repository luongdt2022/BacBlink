# Học từ DauThau.net — lớp mô hình tổng hợp dữ liệu công khai chưa có trong §34

> Trạng thái: quan sát đối chiếu, không đề xuất quyết định nào
> Ngày: 2026-09-06
> Phạm vi: cơ chế tạo doanh thu và cơ chế tạo dữ liệu của một nền tảng đấu thầu tư nhân Việt Nam
> Liên quan: §34.1.1, §34.11, §6.1, §9.4.2–9.4.3, §10.2, §19.6, §20.5.9, bất biến 56/102
> Thêm dòng vào bảng đối chiếu §34.11 phải qua Architecture Council

## 1. Phát hiện

`BenchmarkEvidenceRegister` tại §34 ([dòng 5324](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L5324)) hiện có venture client, managed scouting, IP-as-a-product, expert network, venture building và royalty capital. **Không có mô hình nào thuộc lớp "tổng hợp dữ liệu công khai rồi bán cảnh báo theo thuê bao".**

Đây là lớp mô hình có ít nhất một đại diện đang vận hành ở Việt Nam, cùng ngành giao dịch B2B/B2G, cùng bài toán "làm sao để bên có nhu cầu và bên có năng lực gặp nhau", và có bằng chứng bất lợi kiểm chứng được từ nguồn thứ ba. Việc register không có nó là khoảng trống của register, không phải bằng chứng rằng cơ chế đó không liên quan.

Hệ quả đúng của phát hiện này hẹp: NacenTech **không thể sao chép** cơ chế này vì thiếu điều kiện đầu vào (mục 5), nhưng có ba thứ học được và ba thứ phải cấm (mục 4 và 6).

## 2. Mô hình làm gì

DauThau.info ra mắt 2018, do Công ty CP Phát triển Nguồn mở Việt Nam (VINADES) phát triển. DauThau.Net là giai đoạn hai, tự mô tả là "mạng đấu thầu dành cho tư nhân đầu tiên tại Việt Nam".

| Cấu phần | Cơ chế | Ghi chú |
|---|---|---|
| Tổng hợp dữ liệu | Gom thông tin thầu công khai đã phân tán, chuẩn hóa, đánh chỉ mục theo ngành/vùng/giá trị | Dữ liệu vốn công khai; giá trị nằm ở việc **gom và chuẩn hóa**, không ở việc sở hữu |
| Cảnh báo theo hồ sơ | Nhà thầu khai lĩnh vực quan tâm, hệ thống đẩy tin phù hợp | Đây là sản phẩm thật được trả tiền, không phải trang tra cứu |
| Public Cloud (SaaS) | Tài khoản trên DauThau.Net, 4 gói dịch vụ | |
| Site Cloud (SaaS) | Bên mời thầu có địa chỉ truy cập riêng, tự trình bày và quản trị, 3 gói | Vẫn là cùng một hệ thống, khác cấu hình và tên miền |
| Quản lý nhà cung cấp | Bên mời thầu thêm/xóa NCC, theo dõi hoạt động, gửi thư mời thầu | NCC nằm sẵn trong danh sách của bên mời thầu được **tự động xác minh, miễn phí xác minh** |
| Nâng/hạ gói linh hoạt | Đổi gói giữa kỳ | |
| API | Truy vấn dữ liệu thầu theo thời gian thực | |

Quy mô operator-reported: hơn 80.000 tài khoản từ hơn 40.000 doanh nghiệp; hơn 40.000 nhà cung cấp trên hệ thống. Con số 40.000 xuất hiện ở hai vai khác nhau trong cùng bộ tài liệu tự công bố, nên chỉ dùng để hiểu **thứ hạng độ lớn**, không dùng để tính conversion hay so sánh.

## 3. Đăng ký vào register

```yaml
BenchmarkEvidence:
  model: DauThau.info / DauThau.Net (VINADES)
  ownerType: PRIVATE
  mechanism: >
    Tổng hợp dữ liệu đấu thầu công khai đã phân tán → chuẩn hóa và đánh chỉ mục →
    bán thuê bao cảnh báo theo hồ sơ quan tâm → mở rộng sang SaaS cho bên mời thầu
    (Public Cloud và Site Cloud) và API dữ liệu
  evidenceGrade: E1_CLAIMED          # quy mô/độ bền: tự công bố, không có filing
  evidenceGradeAdverse: E0_ADVERSE   # xử phạt hành chính 2021, nguồn báo chí độc lập
  evidenceSource:
    - https://dauthau.net/vi/about/gioi-thieu-chung.html
    - https://dauthau.net/vi/banggia/gioi-thieu-cac-tinh-nang-cua-dauthau-net.html
    - https://congly.vn/dauthau-info-bi-co-quan-chuc-nang-yeu-cau-dong-cua-183335.html
  outcomeMetric: [số tài khoản trả phí, số doanh nghiệp, số gói dịch vụ, số NCC]
  attributionLimit: >
    Không có doanh thu, tỷ lệ gia hạn, churn hay unit economics được kiểm toán.
    Không có bằng chứng nhà thầu thắng thầu nhiều hơn nhờ dùng sản phẩm.
    Toàn bộ số liệu quy mô là operator-reported theo quy tắc 4 §34.1.1.
  transferabilityToVietnam: HIGH_FOR_MECHANISM / LOW_FOR_MODEL
  decision: LESSON_ONLY
  asOfDate: 2026-09-06
  nextReviewAt: 2027-09-06
```

`decision: LESSON_ONLY` chứ không phải `ADAPT_AND_PILOT`. Lý do ở mục 5: điều kiện đầu vào của mô hình này NacenTech không có, nên "pilot thử" sẽ pilot một thứ khác chứ không phải mô hình này.

Grade `E1` cho quy mô là hệ quả trực tiếp của quy tắc 2 §34.1.1: mô hình tư nhân phải chứng minh willingness-to-pay bằng revenue/repeat, không bằng số tài khoản. 80.000 tài khoản không nói tài khoản nào trả phí, trả bao nhiêu, gia hạn năm thứ hai bao nhiêu phần trăm.

## 4. Ba điều học được

**a. Sản phẩm là cảnh báo, không phải kho dữ liệu.** Dữ liệu thầu vốn công khai — ai cũng xem được. Thứ khách trả tiền là **không phải đi tìm**: khai hồ sơ quan tâm một lần, tin phù hợp tự đến. Bài học cho `matching`: giá trị nằm ở việc đẩy đúng thứ đến đúng người vào đúng lúc, không nằm ở kích thước catalog. Kiến trúc đã đồng thuận điều này ở nguyên tắc 2 "Case trước catalog", nhưng chưa có mô hình đăng ký cảnh báo/saved search/digest trong §10 hay §14.

**b. Cùng một core, khác cấu hình và tên miền — đúng như §9.4.4 đã chốt.** "Site Cloud" của DauThau.Net không phải fork: bên mời thầu được địa chỉ truy cập riêng và quyền tự trình bày, nhưng chạy trên cùng hệ thống. Đây là bằng chứng thực địa cho quyết định D2-141 ([dòng 4989](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L4989)) rằng khác biệt theo khách hàng đi qua profile/cấu hình, không qua source/database riêng. NacenTwin muốn có "workspace theo tổ chức" thì đây là hình dạng đúng, và kiến trúc đã cho phép sẵn.

**c. Nâng/hạ gói linh hoạt là yêu cầu vận hành, không phải tính năng phụ.** Thuê bao B2B sống bằng gia hạn. `ManagedServiceAgreement` đã ghi kỳ thanh toán, gia hạn, change và exit rule ([dòng 1123](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L1123)) — phần chưa có là cơ chế đổi gói giữa kỳ và hệ quả của nó lên quota đang chạy dở.

## 5. Vì sao không sao chép được

**Mô hình này sống bằng dữ liệu công khai. Dữ liệu của NacenTwin phần lớn là dữ liệu mật.**

Nhà thầu trả tiền cho DauThau.info vì thông tin mời thầu **được luật buộc công bố** — có một dòng dữ liệu công khai, liên tục, chi phí gom thấp hơn giá bán. NacenTech không có dòng tương đương: `DemandBrief` đến từ doanh nghiệp có bài toán và ngân sách, phần lớn là thông tin nhạy cảm, và bất biến 56 ([dòng 5073](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L5073)) cấm bán quyền đọc confidential demand. Không có phễu miễn phí thì không có mô hình thuê bao cảnh báo.

Nguồn công khai tương đương duy nhất mà NacenTech có thể tiếp cận là: nhiệm vụ KH&CN và kết quả nghiên cứu, chương trình/quỹ tài trợ, tiêu chuẩn–quy chuẩn mới, sandbox có thẩm quyền, gói mua sắm có yếu tố công nghệ. Đó chính là các rail của `Government Innovation Fabric` (§19.6, [dòng 2503](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L2503)) — hiện xếp `SCALE_AFTER_EVIDENCE`/`DEFERRED_OPTION` và **chưa có trong mã** ([README:139](../../README.md#L139)).

Hệ quả cho lộ trình: một wedge kiểu DauThau.net đòi kéo ít nhất một rail của fabric lên sớm, và rail đó cần `InterAgencyMandateVersion` thật chứ không chỉ cần code. Đây là hạng mục có lead time dài nhất trong nhóm, nên nếu có ý định làm thì phải khởi động sớm nhất, không phải triển khai sớm nhất.

## 6. Ba anti-pattern phải giữ nguyên lệnh cấm

**a. Phí xác minh gắn với quan hệ thương mại.** DauThau.Net miễn phí xác minh cho nhà cung cấp đã nằm trong danh sách của bên mời thầu. Cơ chế này hợp lý trong ngữ cảnh đấu thầu, nhưng ánh xạ thẳng sang NacenTech sẽ vi phạm bất biến 56 và [dòng 5575](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L5575): trạng thái xác minh không được phụ thuộc vào việc ai trả tiền hoặc ai quen ai. Ở NacenTech, `ExpertProfile`/`RightsEvidence`/`EvidencePassport` chỉ đổi trạng thái theo bằng chứng và issuer có thẩm quyền.

**b. Đấu giá giá.** Mô hình đấu thầu tối ưu theo giá. Chuyển giao công nghệ thì không: giá thấp không đại diện cho quyền IP, năng lực triển khai, rủi ro PoC hay outcome. Lệnh cấm ở [dòng 218](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L218) giữ nguyên.

**c. Tổng hợp dữ liệu công khai vẫn là hoạt động bị quản lý.** Ngày 18/3/2021, Sở TT&TT Hà Nội xử phạt VINADES 50 triệu đồng và yêu cầu thu hồi tên miền dauthau.info, vì trang hoạt động như trang thông tin điện tử tổng hợp mà chưa được cấp phép, có đăng lại tin bài của cơ quan báo chí (Nghị định 72/2013). Sản phẩm sau đó chuyển sang dauthau.asia và bổ sung yêu cầu đăng nhập.

Đây là bằng chứng `E0_ADVERSE` duy nhất trong hồ sơ này có nguồn độc lập, và là bài học đắt nhất: **"dữ liệu công khai" không đồng nghĩa "được tự do tổng hợp và phân phối lại".** Bất biến 102 ([dòng 5119](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L5119)) đã yêu cầu data-product register ghi nguồn, license, purpose và prohibited field trước khi mở dữ liệu/API thương mại. Vụ việc này cho thấy yêu cầu đó không phải thủ tục nội bộ — nó là điều kiện để sản phẩm không bị dừng. `SourceRecord` ([dòng 963](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L963)) đã có trường `license` và `authority level`; phần chưa có là quy trình pháp chế xác nhận trước khi bật bất kỳ nguồn tổng hợp nào.

## 7. Ba khoảng trống quan sát được trong kiến trúc

Ghi lại để Architecture Council xem xét; tài liệu này không đề xuất sửa.

| Khoảng trống | Vị trí | Ghi chú |
|---|---|---|
| §6.1 có bước "Provider application" nhưng §10 không có aggregate tương ứng | [dòng 465](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L465) so với §10.4 | Chưa có entity cho hồ sơ dự tuyển/đề xuất giải pháp, cửa sổ công bố có deadline, hay freeze tiêu chí tại thời điểm mở |
| `PUBLISHED` chưa được định nghĩa là "công khai với ai" | `apps/api/V1Compat/IntakesControllers.cs:392` — bề mặt chợ giao dịch mang `[Authorize]` | **Đã sửa 2026-09-06:** bản đầu ghi khoảng trống này là "thiếu trường `visibilityClass`". Sai — `DataClassification` và `Status` đã phủ việc phân loại; thứ chưa có là một quyết định về ngữ nghĩa của `PUBLISHED`, không phải một cột mới. Xem ADR-0012 quyết định 2 |
| Entitlement thương mại chưa có chỗ đứng tách khỏi capability profile | `ManagedServiceAgreement` [dòng 1123](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L1123) và `CapabilityProfileVersion` §9.4.2 | Profile là thẩm quyền, được governance/security/legal approve và bất biến sau publish (§9.4.3); entitlement là thứ khách đã mua, đổi theo phụ lục hợp đồng. Gộp hai thứ nghĩa là một hợp đồng bán hàng sửa được cấu hình quản trị |

## 8. Điều tài liệu này không kết luận

- Không kết luận DauThau.net có lãi, gia hạn tốt hay bền vững. Không có filing; toàn bộ số liệu quy mô là tự công bố.
- Không kết luận nhà thầu dùng sản phẩm này thắng thầu nhiều hơn. Không có nghiên cứu nào đo điều đó.
- Không đề xuất bán thuê bao cho phía cung ứng ở NacenTech. Hướng này đã được loại và tài liệu không mở lại.
- Không đề xuất mở discovery công khai hay đưa `Government Innovation Fabric` lên sớm. Mục 5 nêu điều kiện cần, không nêu khuyến nghị.
- Không thay đổi thứ tự ưu tiên nào. Gate H0 §20.5.9 và kết luận "khả thi thấp nếu success fee là nguồn chính trong 24 tháng đầu" ([dòng 141](../04-technical/NACENTECH_ARCHITECTURE_V2.md#L141)) vẫn là ràng buộc chi phối lộ trình.
- Không đề nghị đưa mô hình này vào bảng §34.11 như một pattern để áp dụng. V2.21 chỉ trỏ về tài liệu này từ
  §34.16 để ghi nhận register còn thiếu một lớp mô hình; `decision` vẫn là `LESSON_ONLY`.

## 9. Nguồn

- [DauThau.Net — Giới thiệu chung](https://dauthau.net/vi/about/gioi-thieu-chung.html) — operator-reported
- [DauThau.Net — Giới thiệu các tính năng và bảng giá](https://dauthau.net/vi/banggia/gioi-thieu-cac-tinh-nang-cua-dauthau-net.html) — operator-reported; mô hình Public Cloud/Site Cloud và số gói
- [DauThau.Net — Tính năng "Quản lý nhà cung cấp" cho gói Site Cloud](https://dauthau.net/vi/news/thong-bao/dauthau-net-ra-mat-tinh-nang-quan-ly-nha-cung-cap-cho-cac-goi-dich-vu-thuoc-mo-hinh-site-cloud-231.html) — operator-reported; cơ chế miễn phí xác minh
- [DauThau.Net — Cơ chế nâng cấp, hạ cấp gói dịch vụ](https://dauthau.net/vi/news/thong-bao/co-che-nang-cap-ha-cap-linh-hoat-cac-goi-dich-vu-tren-dauthau-net-299.html) — operator-reported
- [VINADES — DauThau.info, phần mềm khai thác thông tin thầu](https://vinades.vn/vi/san-pham/dauthau-info-phan-mem-khai-thac-thong-tin-thau.html) — operator-reported
- [Công lý — Dauthau.info bị cơ quan chức năng yêu cầu "đóng cửa"](https://congly.vn/dauthau-info-bi-co-quan-chuc-nang-yeu-cau-dong-cua-183335.html) — nguồn thứ ba; căn cứ cho `E0_ADVERSE`
- [ICT Vietnam — DauThau.INFO cung cấp thông tin, dữ liệu cho báo chí](https://ictvietnam.vn/dauthau-info-cung-cap-thong-tin-du-lieu-cho-bao-chi-33049.html) — nguồn thứ ba
