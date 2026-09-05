# Từ vựng

Từ vựng dùng chung trong bộ tài liệu này. Khi một tài liệu dùng một trong các từ dưới đây, nó có đúng nghĩa này.

Nguyên tắc đặt tên: ưu tiên chữ tiếng Việt mà giao diện đang hiển thị; nếu giao diện chưa có chữ nào, dùng chữ tiếng Việt mô tả rồi ghi định danh trong mã ở ngoặc. Không đặt từ đồng nghĩa mới cho một khái niệm đã có ở đây.

## Bề mặt

**Bảng quản trị.** Ứng dụng React tại `dmst-admin-main`, chạy mặc định ở `http://localhost:5174`. Chỉ tài khoản có vai trò `ADMIN` vào được. Có 20 route, gom thành bảy khu vực: bảng điều khiển, người dùng, đề bài, tài sản công nghệ, hồ sơ triển khai, danh mục, câu chuyện. Trong tài liệu này gọi tắt là *admin*.

**Cổng người dùng.** Ứng dụng React tại `dmst-user-main`, chạy mặc định ở `http://localhost:5173`. Dành cho vai trò `USER`. Đây là bề mặt duy nhất mà người dùng cuối tự đăng ký và tự đăng nội dung. Trong tài liệu này gọi tắt là *cổng*.

**Trang giới thiệu.** Ứng dụng React tại `dmst-landing-page-main`, công khai, không cần đăng nhập. Bề mặt API của nó là đúng một tệp (`src/core/api/stories.ts`) và đọc từ `GET /api/v1/public/stories`.

**Vỏ.** Một khu vực giao diện có trang, có biểu mẫu, có điều hướng, nhưng **không có tệp nào gọi API**. Dữ liệu hiển thị là hằng số trong mã. Năm khu vực của cổng người dùng là vỏ: `deal-room`, `infrastructure`, `services`, `valuation`, `contact`. Bốn trong năm đã bị gỡ khỏi định tuyến; chỉ `contact` còn chạy. Vỏ khác *chưa xây*: vỏ đã có thiết kế và luồng màn hình, chỉ thiếu backend.

`marketplace` **không** phải vỏ, dù ba trang của nó không chứa lời gọi API nào: chúng nhập hàm từ tệp API của khu vực `intakes` và gọi `GET /api/v1/marketplace` cùng `GET /api/v1/marketplace/{id}`. Đây là lý do đếm khu vực vỏ bằng cách tìm lời gọi API *trong thư mục của khu vực* cho ra kết quả sai.

## Bản ghi

**Người (Person).** Một tài khoản. Có email duy nhất, họ tên, điện thoại, tổ chức, một *vai trò nền tảng*, và cờ đang hoạt động. Người mới đăng ký ở cổng là **chưa kích hoạt** cho tới khi bấm liên kết trong email; đăng nhập khi chưa kích hoạt trả mã `ACCOUNT_NOT_ACTIVATED`. Admin tạo người dùng thì **bắt buộc đặt mật khẩu** — khác NacenTwin cũ, vốn mặc định `12345678`.

**Đề bài (DemandBrief).** Một bài toán do bên có nhu cầu đăng. Ứng với `intakes(type=challenge)` của hệ cũ. Nội dung nằm trong *phiên bản đề bài*, bất biến; sửa tiêu đề hoặc phần mô tả bài toán tạo phiên bản mới chứ không ghi đè. Trạng thái chỉ có `DRAFT` và `PUBLISHED` — `QUALIFIED` không thuộc đề bài mà thuộc *giai đoạn* của hồ sơ vụ việc.

**Tài sản công nghệ (TechnologyAsset).** Một công nghệ, sáng chế hoặc giải pháp do bên cung đăng. Ứng với `intakes(type=ip)` của hệ cũ. Giống đề bài về phiên bản và trạng thái xuất bản, nhưng có thêm *mức chất lượng*.

**Subject.** Cách hệ thống trỏ tới một bản ghi mà không cần biết kiểu cụ thể của nó, viết `KIND:id` (ví dụ `DEMAND_BRIEF:3f2a…`). Bốn kiểu: `DEMAND_BRIEF`, `TECHNOLOGY_ASSET`, `COMMERCIALIZATION_CASE`, `PERSON`. Tài liệu trong *phòng dữ liệu*, đoạn văn bản trong chỉ mục tìm kiếm và *lời mời hợp tác* đều gắn vào một subject chứ không vào một bảng cụ thể. Người dùng không bao giờ nhìn thấy chuỗi này; nó xuất hiện ở đây vì nó giải thích vì sao một tài liệu mật có thể treo vào một đề bài, một công nghệ hay một hồ sơ vụ việc bằng cùng một cơ chế.

**Hồ sơ vụ việc (CommercializationCase).** Đơn vị công việc của môi giới: một nỗ lực đưa một đề bài tới một kết quả thương mại hoá, đi qua các *giai đoạn* theo một *ma trận chuyển*. Có mã hồ sơ, một *tuyến*, một chủ bài toán, một *môi giới chính*, và một danh sách *bên tham gia*. **Chưa có màn hình nào và chưa có endpoint nào** — xem [`moi/console-ho-so-vu-viec.md`](moi/console-ho-so-vu-viec.md).

**Tuyến (Track).** Loại hồ sơ vụ việc, quyết định bộ chính sách áp lên nó: `CHALLENGE_PILOT` (thí điểm theo đề bài), `TECHNOLOGY_TRANSFER` (chuyển giao công nghệ), `SHARED_INFRASTRUCTURE` (hạ tầng dùng chung).

**Câu chuyện (Story).** Bài viết kể lại một lần thành công hoặc thất bại. Có kiểu `SUCCESS` hoặc `FAILURE`, trạng thái `DRAFT` hoặc `PUBLISHED`, và một cờ **bị ẩn** do admin đặt. Bị ẩn khác chưa xuất bản: tác giả vẫn thấy câu chuyện đã xuất bản của mình, nhưng công chúng thì không.

**Hồ sơ triển khai.** Khu vực `implementations` của admin: giải pháp, mốc thời gian, kết quả của một lần triển khai. Trong backend .NET chưa có module tương ứng; xem [`admin/trien-khai.md`](admin/trien-khai.md).

**Tài liệu (Document).** Một tệp hoặc một đoạn văn bản gắn vào một subject, có *mức mật* và số phiên bản. Ba loại: `FILE` (tệp tải lên), `PROFILE_PICTURE` (ảnh đại diện, thay ảnh mới thì xoá ảnh cũ), `TEXT_SECTION` (một đoạn nội dung mật lưu như văn bản, không phải tệp).

**Lĩnh vực và danh mục (Taxonomy).** Hai loại nhãn phân loại, `SECTOR` và `CATEGORY`, dùng để lọc và để thu hẹp phạm vi ghép cặp. Xoá một nhãn là **vô hiệu hoá** nó, không xoá thật: bản ghi đã gắn nhãn cũ vẫn hiển thị được tên nhãn.

## Trạng thái

**Đã bẩn.** Một biểu mẫu là đã bẩn kể từ lần sửa đầu tiên khác với giá trị vừa tải, cho tới lần lưu thành công tiếp theo. Sửa đi sửa lại về đúng giá trị cũ **không** làm nó sạch trở lại; chỉ một lần lưu thành công hoặc một lần *bỏ thay đổi* mới làm được. Xem [`xuyen-suot/thay-doi-chua-luu.md`](xuyen-suot/thay-doi-chua-luu.md).

**Đã lưu.** Máy chủ đã trả 2xx cho lần gửi, và bản ghi trả về đã thay chỗ dữ liệu trong biểu mẫu. Toast xanh không đủ để gọi là đã lưu; điều kiện là dữ liệu hiển thị đến từ phản hồi của máy chủ.

**Xuất bản.** Trạng thái `PUBLISHED` của đề bài, tài sản công nghệ hoặc câu chuyện. Chỉ bản ghi đã xuất bản mới vào chỉ mục tìm kiếm, mới xuất hiện ở chợ giao dịch, và mới nhận được lời mời hợp tác.

**Xoá mềm.** Đề bài và tài sản công nghệ bị xoá chỉ được đánh dấu thời điểm xoá; dữ liệu và tệp đính kèm vẫn còn. Hệ cũ xoá cứng cả tệp đính kèm; đây là một trong bảy thay đổi có chủ đích. Người dùng thường không thấy bản ghi đã xoá mềm; admin có thể yêu cầu thấy.

**Hold.** Một khoá tạm đặt lên hồ sơ vụ việc kèm lý do. Hồ sơ đang có hold mở **không chuyển giai đoạn được**, bất kể người thao tác có quyền gì. Gỡ hold cần một lý do riêng.

**Mức chất lượng (QualityLevel).** Của tài sản công nghệ: `UNREVIEWED` (mặc định khi tạo và khi di trú từ hệ cũ) → `SELF_DECLARED` → `REVIEWED` → `TRANSACTION_READY`. Không bản ghi nào được tự động gán `TRANSACTION_READY`; nó phải đi qua một cổng có người quyết định. **Chưa có màn hình và chưa có endpoint** để đổi mức này.

**Mức mật (DataClassification).** Ba mức, theo thứ tự: `Public`, `Confidential`, `HighlyConfidential`. Từ `Confidential` trở lên gọi là **mật** — tức mọi thứ không phải `Public`. Mức thứ tư `Internal` đã bị bỏ theo [ADR-0007](../../04-technical/adr/0007-muc-mat-internal.md): không đường nào tạo ra được nó, và hai tầng hiểu nó theo hai cách. Ánh xạ từ hệ cũ: không mức → `Public`, `level2` → `Confidential`, `level3` → `HighlyConfidential`.

**Cấp quyền đọc (AccessGrant).** Một phiếu cho phép một người đọc tài liệu mật của một subject, tới một *mức trần* nhất định, vì một *mục đích* đã ghi, trong một khoảng thời gian. Có thể thu hồi. Không có phiếu thì tài liệu mật không hiện ra, kể cả với người đã đăng nhập. Hệ cũ chỉ có một cột đánh dấu mức mật và không kiểm soát ai đọc.

**Ảnh chụp chính sách (PolicySnapshot).** Bản đóng băng của bộ quy tắc áp lên một hồ sơ vụ việc, chốt tại thời điểm hồ sơ vào giai đoạn `QUALIFICATION`. Sau đó chính sách nền tảng có đổi cũng không đổi ảnh chụp; muốn đổi phải tạo ảnh chụp mới thay thế cái cũ. Đây là thứ trả lời câu "lúc đó luật là gì".

## Vai trò và quyền

**Vai trò nền tảng.** Một trong `ANONYMOUS`, `USER`, `ADMIN`, `SYSTEM`. Nằm trong claim `role` của token. `SYSTEM` chỉ dùng cho worker và ETL, không có người thật đứng sau.

**Vai trò trong hồ sơ.** Khác vai trò nền tảng. Một người có thể là `PROBLEM_OWNER`, `LEAD_BROKER`, `CO_BROKER`, `PROVIDER`, `EVALUATOR`, `VERIFIER` hoặc `SPONSOR` **trong một hồ sơ vụ việc cụ thể**, và vai trò đó không đi theo họ sang hồ sơ khác. Quyền đọc tài liệu mật đến từ *cấp quyền đọc*, không đến từ token.

**Môi giới (Broker).** Một người có hồ sơ môi giới, gồm trạng thái (`ACTIVE` / `SUSPENDED`), một *capacity* và danh sách lĩnh vực phụ trách.

**Capacity.** Số hồ sơ vụ việc tối đa một môi giới được nhận cùng lúc. Giao thêm khi đã đầy bị **từ chối thẳng** với mã `CAPACITY_EXCEEDED`, chứ không im lặng bỏ rơi hồ sơ.

**Mục đích (Purpose).** Lý do được ghi lại khi một người được cấp quyền đọc dữ liệu mật, và được chép vào nhật ký kiểm toán mỗi lần họ đọc. Nó tồn tại để câu hỏi "tại sao người này xem được cái này" có câu trả lời sau nhiều tháng.

**Từ chối được ghi lại.** Khi hệ thống từ chối một thao tác vì chính sách, nó ghi một dòng kiểm toán với kết quả `DENY` và mã quy tắc đã chặn. Mặc định của bảng quyết định là **DENY**: không có quy tắc nào cho phép thì từ chối.

## Tương tác

**Vòng đời biểu mẫu.** Đơn vị tương tác của bộ tài liệu này, năm pha, luôn theo thứ tự này:

1. **Vào màn** — route được mở, cái gì tải, cái gì được focus, cái gì điền sẵn.
2. **Rời đi không đổi gì** — người dùng bỏ đi trước khi sửa gì. Có ghi lại gì không.
3. **Bắt đầu sửa** — lần sửa đầu tiên. Biểu mẫu thành *đã bẩn*, nút nào sáng lên.
4. **Trong khi sửa** — kiểm tra dữ liệu chạy lúc nào, trường phụ thuộc, URL có đổi không.
5. **Gửi đi** — cái gì được gửi, cái gì bị khoá trong lúc chờ, đường thành công và đường thất bại, người dùng dừng ở đâu.

**Huỷ.** Người dùng chủ động bỏ: bấm nút Huỷ, hoặc nhấn Escape khi biểu mẫu ở trong hộp thoại. Huỷ **vứt bỏ** thay đổi chưa lưu; nó không bao giờ lưu một phần.

**Gián đoạn.** Một sự kiện xảy ra giữa chừng mà người dùng không chủ động gây ra: mất mạng, phiên hết hạn, bản ghi bị người khác đổi, trình duyệt tự điền. Khác *huỷ* ở chỗ ý định: gián đoạn không nói lên người dùng muốn gì, nên xử lý mặc định là **giữ lại** cái họ đang gõ.

**Hoàn tất.** Máy chủ đã nhận và ghi. Với v1, dấu hiệu là 2xx. Với v2, dấu hiệu là 2xx **hoặc** một phản hồi phát lại mang header `Idempotent-Replayed: true` — lần gửi trước đã hoàn tất rồi.

## Hợp đồng API

**Facade v1.** Toàn bộ 74 đường dẫn `/api/v1/*` mà backend .NET đang phục vụ, giữ nguyên hình dạng JSON, mã lỗi và mã trạng thái của NacenTwin/NestJS để ba frontend không phải sửa gì lúc cutover. Đây là **cửa HTTP duy nhất đang tồn tại** (đo 2026-09-04).

**API v2.** Bộ endpoint `/api/v2/*` mà kiến trúc đích quy định và ba middleware trong mã đã chuẩn bị sẵn — nhưng **chưa có endpoint nào được viết**. Thư mục [`api-v2/`](api-v2/) là đặc tả cho nó.

**Dừng dịch vụ v1 (sunset).** Mọi phản hồi `/api/v1/*` mang header `Deprecation: true` và `Link: </api/v2>; rel="successor-version"`. Nếu cấu hình có ngày dừng và hôm nay đã quá ngày đó, hoặc cờ tương thích bị tắt, mọi đường v1 trả **410 Gone** với thân `{"statusCode":410,"message":"API v1 đã ngừng (D2-148). Dùng /api/v2.","error":"Gone"}`. Đây là một chuyển đổi tức thời, không có giai đoạn nửa vời: xem [`xuyen-suot/di-tru-v1-sang-v2.md`](xuyen-suot/di-tru-v1-sang-v2.md).

**Khoá chống lặp (Idempotency-Key).** Header bắt buộc cho mọi `POST`/`PUT`/`PATCH`/`DELETE` trên `/api/v2`. Thiếu → **428**. Cùng khoá với thân request khác → **422**. Cùng khoá cùng thân → phát lại phản hồi cũ kèm header `Idempotent-Replayed: true`, không thực thi lại. Khoá có phạm vi theo người dùng, nên hai người dùng cùng một chuỗi khoá không đụng nhau.

**Phiên bản lạc quan (If-Match).** Bản ghi có tranh chấp mang một số `version` tăng dần. Lệnh ghi gửi kèm số đó; nếu bản ghi đã đổi, máy chủ trả **409** kèm `currentVersion` là số hiện tại. Đây là cách hai người sửa một hồ sơ vụ việc không ghi đè nhau. Xem [`xuyen-suot/dong-thoi-va-if-match.md`](xuyen-suot/dong-thoi-va-if-match.md).

**Problem details.** Hình dạng lỗi của v2 theo RFC 9457: `application/problem+json` với `status`, `title`, `detail`, `instance`, cộng thêm `correlationId` luôn có, và tuỳ lỗi mà có `code`, `ruleId`, `currentVersion`, `errors`. Khác hẳn hình dạng của v1 — v1 trả `{code, message}` cho một số mã xác thực và `{statusCode, message, error}` cho phần còn lại.

**Trang kết quả.** Danh sách trả về gồm `data`, `total`, `page`, `limit`. Trang bắt đầu từ 1. Số dòng mặc định 20, tối đa 100 — gửi `limit` lớn hơn thì bị cắt xuống 100 chứ không báo lỗi.

## Ghép cặp

**Vòng ghép cặp (MatchRound).** Một lần tính toán ứng viên cho một subject, có ghi lại phiên bản công cụ tìm kiếm, phiên bản mô hình nhúng và chế độ chấm điểm đã dùng. Vòng cũ **chỉ đọc**; tính lại tạo vòng mới chứ không sửa vòng cũ. Nhờ vậy so sánh được hai lần tính cách nhau vài tháng.

**Ứng viên (MatchCandidate).** Một dòng trong một vòng ghép cặp: subject nào, điểm thô bao nhiêu, khớp ở đoạn văn bản nào, xếp hạng thứ mấy.

**Chế độ chấm điểm.** `LEGACY_SCORING` tái tạo đúng hành vi NestJS (cộng điểm knn và BM25, lọc cứng sau khi lấy top-K) để đo lại đường cơ sở; `CORRECTED_SCORING` lọc cứng trước, hai kênh thu hồi riêng, hợp nhất bằng RRF. Đổi được bằng cấu hình mà không deploy lại. Người dùng không chọn được chế độ; nó là cờ vận hành.

## Kiểm toán

**Sự kiện kiểm toán (AuditEvent).** Một dòng chỉ ghi thêm, không sửa không xoá, ghi lại: ai (mã ẩn danh, không phải PII), vai trò gì, hành động gì, trên đối tượng nào, phiên bản mấy, vì mục đích gì, kết quả `PERMIT` hay `DENY`, quy tắc nào đã quyết, mã tương quan, và thời điểm. Được ghi bằng **một giao dịch riêng**, cố ý tách khỏi giao dịch của lệnh — xem *kiểm toán tách giao dịch*.

**Kiểm toán tách giao dịch.** Dòng kiểm toán không đi theo giao dịch của lệnh mà dùng một kết nối ngắn hạn riêng. Lý do: từ chối truy cập luôn kết thúc bằng một ngoại lệ, nên nếu dòng kiểm toán nằm chung giao dịch thì nó bị cuộn ngược cùng — và hệ thống sẽ im lặng đúng ở tình huống cần dấu vết nhất. Đường đọc tài liệu cũng không commit gì, nên cả lượt được phép đọc dữ liệu mật cũng sẽ mất. Cái giá của lựa chọn này: một lệnh thất bại vẫn để lại dòng kiểm toán, nên nhật ký có những dòng mô tả việc **không** xảy ra. Đọc nhật ký phải đọc cả trường kết quả, không chỉ trường hành động.

**Mã tương quan (correlationId).** Một chuỗi gắn vào mọi phản hồi lỗi của v2 và vào mọi dòng kiểm toán của cùng một request. Đây là thứ người dùng đọc cho bộ phận hỗ trợ khi báo lỗi.

**Lưu vết thiết bị.** Địa chỉ IP và trình duyệt được ghi kèm sự kiện kiểm toán nhưng có thời hạn lưu riêng, ngắn hơn bản thân sự kiện; hết hạn thì hai trường đó bị cắt, dòng kiểm toán vẫn còn nguyên.
