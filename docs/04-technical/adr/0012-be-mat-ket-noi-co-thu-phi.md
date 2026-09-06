# ADR-0012: Bề mặt kết nối có thu phí cho công nghệ và mời thầu

- Trạng thái: ACCEPTED_WITH_LEGAL_AND_COUNCIL_GATE — **ADR này đổi baseline V2.20**; mã được viết, mở bán bị chặn tới khi đóng cổng ở mục "Cổng chặn mở bán"
- Ngày: 2026-09-06
- Quyết định bởi: chủ sản phẩm. Cần Product Council và Architecture Council phê chuẩn phần sửa §1, §34.16, §34.18.2 và D2-35
- Liên quan: §1 (dòng 58), §3 nguyên tắc 13/19, §9.4.1, §20.5.4, §20.5.9, §20.7, §34.16, §34.18.2, bất biến 56, D2-35;
  ADR-0011; `docs/02-requirements/san-pham-v2/portal/cho-giao-dich.md`; sổ lỗi B-15

## Bối cảnh

Kho này chứa **hai định vị mâu thuẫn nhau và chưa ai đóng**:

| Nguồn | Định vị |
|---|---|
| `docs/01-vision/de-xuat-nen-tang.md:96` và mô hình 3-3-8 | "tạo marketplace minh bạch cho đổi mới sáng tạo"; **8 dịch vụ kết nối cung cầu** |
| Cổng người dùng đang chạy | khu vực gắn nhãn **"Sàn giao dịch"**, ba route `/marketplace`, `/marketplace/ip/:id`, `/marketplace/challenge/:id`, đọc dữ liệu thật |
| `NACENTECH_ARCHITECTURE_V2.md:58` | "không được thiết kế như một catalog hoặc **sàn tự phục vụ**" |
| §34.16 dòng 5813, §34.18.2 dòng 5930, D2-35 | marketplace tự phục vụ là anti-pattern; "Directory/sàn giải pháp mở" 3–4/10, **không đầu tư ở baseline** |

V2.20 là baseline được duyệt và nó bác bỏ định vị của bản đề xuất. Nhưng sản phẩm đang chạy vẫn mang nhãn "Sàn giao dịch",
và chủ sản phẩm xác nhận định vị sàn kết nối cung–cầu — cho **cả công nghệ lẫn mời thầu** — là định vị mong muốn.
ADR này đóng mâu thuẫn đó thay vì để nó tiếp tục treo giữa hai tầng tài liệu.

### Sự kiện đã đo, không phải giả định

| Sự kiện | Đo ở đâu |
|---|---|
| `/marketplace` **không phải vỏ**: ba trang đọc dữ liệu thật qua `GET /api/v1/marketplace` và `/marketplace/{id}` | `bug-triage.md` B-04, `glossary.md:17` |
| Nút gửi đề xuất là **giả**: bấm hết hai bước ra toast xanh, **không có lời gọi mạng nào**, không ghi gì | `cho-giao-dich.md:92`, B-15 |
| Chợ giao dịch **bắt đăng nhập**, và chưa ai biết vì sao | `cho-giao-dich.md:164` — câu hỏi mở đã treo sẵn |
| Hai route dùng chung một đường API và **không kiểm kiểu**: mở một đề bài qua đường công nghệ sẽ hiện nhãn "Cầu" trong khung công nghệ | `cho-giao-dich.md:163` |
| Tên tổ chức có thật đang được gán bằng phép so chuỗi; **mọi đề bài đều thành "VinCommerce"** | `verification/portal-va-landing.md` CHO-01 |
| NacenTwin chưa có bất kỳ mã billing/entitlement nào | không có module tương ứng trong `modules/` |

Nói cách khác: bề mặt sàn đã tồn tại, đang chạy với dữ liệu bịa ở phần ghi, và chưa có mô hình thu tiền nào phía sau.
Quyết định này không tạo ra một bề mặt mới — nó biến bề mặt đang có thành sản phẩm thật hoặc gỡ nó đi.

## Ranh giới không nằm trong thẩm quyền của ADR này

Ba thứ **không** đổi được bằng ADR, vì chúng là bất biến gắn với mandate công chứ không phải lựa chọn sản phẩm (§9.4.1:
bất biến nằm trong mã và test; không config, admin account hay feature flag nào bypass được):

1. **Không bán thứ hạng.** Bất biến 56 và dòng 5575: tổ chức trả phí không mua được thứ tự shortlist, kết luận
   evaluation, accreditation hay verified outcome. Nguyên tắc 19: *payer cannot buy truth*.
2. **Không bán quyền đọc nhu cầu mật.** Cùng bất biến 56, và nguyên tắc 13: *public data is not public access*.
3. **Không đấu giá giá công.** Non-goal dòng 218.

Vì vậy C được nhận **ở dạng: thu phí cho sự hiện diện và công cụ, không thu phí cho thứ hạng và quyền đọc dữ liệu mật.**
Nếu chủ sản phẩm muốn vượt cả ba ranh giới này thì đó không còn là quyết định kiến trúc — nó đổi phân vai
NacenTech–NacenX ở §4.2 và phải đi qua pháp chế và cơ quan giữ mandate công.

## Lựa chọn

**A. Giữ V2.20, gỡ nhãn "Sàn giao dịch".** Nhất quán với baseline nhưng trái định vị của chủ sản phẩm và bỏ phí một bề
mặt đã dựng.

**B. Giữ bề mặt, không thu phí.** Tránh mọi va chạm bất biến nhưng không trả lời câu hỏi mô hình kinh doanh, và §34.18.2
đã chấm loại sản phẩm này 3–4/10 chính vì nó không tự nuôi được.

**C. Bề mặt kết nối có thu phí, thu cho hiện diện và công cụ, thứ hạng giữ nguyên theo bằng chứng.** Đổi baseline, có
rủi ro hàng hóa hóa đã được cảnh báo, nhưng không đụng bất biến nào và giữ được định vị.

**D. Sàn đầy đủ: thu phí kết nối, thứ hạng trả tiền, tự tổ chức đấu giá.** Đụng cả ba ranh giới ở mục trên. Loại — không
phải vì kém hấp dẫn mà vì vượt thẩm quyền của ADR.

## Quyết định

**C.** Chi tiết:

1. **`/marketplace` thành bề mặt công khai có thật.** Danh sách và trang chi tiết mở, không bắt đăng nhập — đóng câu hỏi
   ở `cho-giao-dich.md:164`. Đăng nhập chỉ cần cho hành động: bày tỏ quan tâm, gửi đề xuất, mở hồ sơ đầy đủ.

2. **Chỉ nội dung phân loại `PUBLIC` mới lên sàn — bằng khái niệm đã có, không thêm khái niệm mới.**

   > **Đã sửa so với bản đầu (2026-09-06, sau khi đo mã).** Bản đầu của mục này nói thêm trường `visibilityClass`
   > vào `DemandBriefVersion` và `TechnologyPackageVersion`. Sai, và sai theo đúng kiểu ADR-0007 đã cảnh báo. Hệ
   > thống **đã có hai** khái niệm phủ việc này: `DataClassification` (`PUBLIC` | `CONFIDENTIAL` |
   > `HIGHLY_CONFIDENTIAL`, `packages/kernel/Domain/DataClassification.cs`) và `DemandBrief.Status`
   > (`DRAFT` | `PUBLISHED`). Thêm cái thứ ba là dựng lại đúng tình huống ADR-0007 phải gỡ: một mức mà tên nói một
   > đằng, hành vi nói một nẻo, và hai tầng hiểu hai kiểu.

   Câu hỏi thật không phải "thêm trường gì" mà là **`PUBLISHED` nghĩa là công khai với ai**. Hôm nay nó nghĩa là
   *hiển thị cho người đã đăng nhập*: `MarketplaceController` mang `[Authorize]` và lọc theo
   `Status == PUBLISHED` (`apps/api/V1Compat/IntakesControllers.cs:392`). Quyết định là mở bề mặt không cần đăng
   nhập, và cách làm là **một đường v2 mới**, không sửa v1 — hình dạng và điều kiện truy cập của `/api/v1` đã
   đóng băng tới sunset 31/03/2027, đổi nó sẽ làm hỏng golden replay của `tests/contracts`.

3. **Ba loại nội dung trên sàn.** `TECHNOLOGY_LISTING` (công nghệ chào bán), `CHALLENGE_LISTING` (đề bài công khai),
   và `TENDER_SIGNAL_LISTING` — tín hiệu mời thầu công khai lấy từ ADR-0011. Loại thứ ba chỉ hiển thị và **dẫn về kênh
   chính thức**; NacenTwin không tổ chức đấu thầu, không nhận hồ sơ dự thầu và không chạy so giá.

4. **Thu phí ở ba chỗ, không chỗ nào là thứ hạng.**
   - `ListingSubscription`: quyền đăng và duy trì listing, số lượng theo gói, thời hạn, gia hạn.
   - Công cụ phía cung: hồ sơ năng lực điện tử có cấu trúc, không gian soạn đề xuất, data room riêng, hồ sơ bằng chứng.
   - Digest tín hiệu **chỉ trên nội dung `PUBLIC`**. Digest chứa nội dung mua theo license của ADR-0011 bị chặn tới khi
     điều khoản tái phân phối được xác nhận riêng.

5. **Thứ tự hiển thị không mua được, và điều đó phải chứng minh được bằng test.** Sắp xếp theo tiêu chí đã công bố
   (độ phù hợp, độ đầy đủ bằng chứng, thời gian). Trạng thái thanh toán **không phải** đầu vào của hàm sắp xếp, và có
   property test chứng minh đổi trạng thái thanh toán không đổi thứ tự với cùng dữ liệu. Baseline **không có** ô quảng
   cáo hay vị trí nổi bật; nếu sau này có thì phải gắn nhãn và tách khỏi kết quả tự nhiên.

6. **Xác minh không gắn với thanh toán.** Không sao chép cơ chế "nhà cung cấp quen thì tự động xác minh" đã ghi ở
   `docs/07-references/mo-hinh-dauthau-net.md` mục 6a. Trạng thái xác minh chỉ đổi theo bằng chứng và issuer có thẩm quyền.

7. **Sàn là kênh vào của case, không phải đường vòng qua case.** Bày tỏ quan tâm trên sàn tạo `CaseInvitation` hoặc một
   `DemandSignal`; nó **không** tạo `CommercializationCase` đã qualified, không tạo độc quyền, không tạo cam kết. Toàn bộ
   stage-gate §7 giữ nguyên. Đây là điểm giữ cho C không trượt thành D.

8. **Vận hành bởi NacenX theo `PlatformOperatingAgreement`, có tách bạch nhìn thấy được.** Phí listing là doanh thu dịch
   vụ thương mại của NacenX; nó phải nằm trong `CommercialServiceLedger` và tách khỏi mọi chức năng accreditation,
   evaluation và oversight thuộc NacenTech (§20.4, dòng 5603). Người bán gói không được là người duyệt xác minh.

## Cổng chặn mở bán

1. Pháp chế xác nhận việc bán quyền đăng listing trên nền tảng mang mandate công là hợp lệ theo `PlatformOperatingAgreement`,
   và xác nhận cách tách bạch ở điểm 8 là đủ.
2. Đăng ký data-product cho digest theo bất biến 102, kể cả khi digest chỉ chứa nội dung `PUBLIC`.
3. Entitlement/quota phải chạy trước khi có gói bán được — không có cơ chế cưỡng chế thì gói dịch vụ chỉ là lời hứa.
4. B-15 phải đóng: nút gửi đề xuất hiện là giả. **Không mở bán một bề mặt mà hành động chính của nó không ghi gì.**
5. CHO-01 phải đóng: tên tổ chức có thật đang bị gán bằng phép so chuỗi.

## Hệ quả

- **Baseline đổi.** §1 dòng 58, §34.16 dòng 5813, §34.18.2 dòng 5930 và D2-35 hiện mâu thuẫn với quyết định này. Chúng
  phải được sửa để ghi nhận: NacenTech có bề mặt kết nối tự phục vụ **có thu phí hiện diện**, đứng cạnh lõi case-led, và
  không thay lõi đó. Việc sửa thuộc Architecture Council; ADR này không tự sửa tài liệu baseline.
- **Cảnh báo kinh tế giữ nguyên hiệu lực.** §34.18.2 chấm loại sản phẩm này 3–4/10 vì dễ bị AI/search hàng hóa hóa, và
  §24.8 dòng 3025 chấm mức chống hàng hóa hóa chỉ 3/10 nếu mô hình triển khai thành sàn hồ sơ/công cụ matching. Quyết định
  này đè lên cảnh báo đó chứ không bác bỏ nó. Vì vậy:
  - doanh thu listing áp quy tắc §20.5.4 — **không đạt biên mục tiêu sau 12 tháng thì đóng hoặc định giá lại**;
  - doanh thu listing **không được dùng để nới** gate H0 §20.5.9 (recurring phủ ≥ 65% chi phí cố định trước Phase 4A);
    nó chỉ được tính vào phần recurring sau khi đo được tỷ lệ gia hạn thật, không tính theo số đăng ký.
- **Rủi ro định vị vẫn có thật.** Khi NacenTwin xuất hiện như sàn kết nối, nó sẽ bị đo bằng thước của sản phẩm cùng loại:
  số nhà cung cấp, lượng dữ liệu, giá, tốc độ — bốn trục NacenTwin đang thua rõ. Giảm thiểu bằng cách không bán sàn như
  sản phẩm chính, và luôn đặt nó cạnh phần case-led là phần khác biệt thật.
- **Không** thêm `visibilityClass`; dùng `DataClassification` và `Status` đã có (xem quyết định 2). Mục 7 của
  `docs/07-references/mo-hinh-dauthau-net.md` ghi khoảng trống này theo cách sai và cần sửa lại: khoảng trống
  không phải "thiếu một trường", mà là "`PUBLISHED` chưa được định nghĩa là công khai với ai".
- Hai route `/marketplace/ip/:id` và `/marketplace/challenge/:id` phải kiểm kiểu; hiện dùng chung một đường API và không kiểm.

## Bất biến đề xuất bổ sung vào §32

- Trạng thái thanh toán không phải đầu vào của bất kỳ hàm sắp xếp, lọc hay chấm điểm nào trên bề mặt công khai; có
  property test chứng minh.
- Không nội dung nào có `visibilityClass` khác `PUBLIC` xuất hiện trên bề mặt không cần đăng nhập, ở bất kỳ trường nào
  kể cả tiêu đề và ảnh đại diện.
- Bày tỏ quan tâm trên sàn không tạo case đã qualified, không tạo độc quyền, không tạo cam kết pháp lý.
- Không có gói dịch vụ nào đổi được trạng thái xác minh của tổ chức, hồ sơ hay bằng chứng.

## Câu hỏi còn mở

- Giá và cấu trúc gói chưa có. §20.5.8 vẫn nợ số thật cho mọi dòng dịch vụ; gói listing không được đặt giá bằng cảm tính.
- Ai là người bán và người duyệt xác minh phải là hai vai khác nhau — chưa có định biên cho việc đó (§29).
- Chưa rõ `TENDER_SIGNAL_LISTING` có được phép hiển thị công khai theo license của ADR-0011 hay không. Nếu không, loại
  nội dung thứ ba chỉ dùng nội bộ cho broker và điểm 3 phải thu hẹp.
- Chưa quyết `/marketplace` có phải là nơi duy nhất cho ba loại nội dung, hay tách theo loại. Câu hỏi UX, chưa chặn.

## Cổng "done"

- `visibilityClass` có migration và ràng buộc; test chứng minh nội dung không phải `PUBLIC` không lọt ra endpoint công khai.
- Property test: đổi trạng thái thanh toán của mọi listing, thứ tự trả về không đổi.
- Test chứng minh bày tỏ quan tâm tạo `CaseInvitation`/`DemandSignal` chứ không tạo case ở stage sau `INTAKE`.
- B-15 và CHO-01 đóng, có bản ghi thật thay dữ liệu bịa.
- Entitlement/quota chạy được và có test cưỡng chế.
- Năm mục ở "Cổng chặn mở bán" đóng, có văn bản.
