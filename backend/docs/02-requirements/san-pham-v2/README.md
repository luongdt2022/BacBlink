# Mô tả sản phẩm NacenTech ĐMST — V2

Mô tả bằng lời trải nghiệm người dùng của ba bề mặt NacenTech ĐMST: người dùng thấy gì, làm được gì, và chính xác điều gì xảy ra khi họ làm.

## Mục đích

Nhìn từ phía người dùng, NacenTech ĐMST là một máy trạng thái lớn. Người dùng đi qua nó bằng cách mở một trang, sửa các trường, và bấm gửi. Phần lớn hành vi đó được định nghĩa ngầm, nằm rải trong service layer .NET, trong facade `V1Compat`, trong hook React và trong chính hình dạng của form. Không có chỗ nào nói bằng tiếng Việt rõ ràng: "khi người dùng làm X thì điều này xảy ra, và nếu họ làm Y giữa chừng thì điều kia xảy ra."

Dự án này là chỗ đó.

Nó ra đời vào một thời điểm cụ thể: backend vừa được thay **một lần** từ NacenTwin/NestJS sang ASP.NET Core .NET 10 (`SourceCode/nacentech`), không có giai đoạn hai stack song song. Ba frontend chưa theo kịp. Vòng rà đầu tiên — [`bmad/BMAD_SOI_Vong1_2026-09-04.md`](bmad/BMAD_SOI_Vong1_2026-09-04.md) — dựng bản chạy thật, tạo dữ liệu mẫu qua chính API, và tìm ra rằng khoảng cách không nằm ở chỗ mọi người tưởng:

- **Không sửa được nội dung của bất kỳ đề bài hay tài sản công nghệ nào.** Mọi lệnh sửa tạo phiên bản mới trả 409 vĩnh viễn, với một thông điệp chỉ vào nguyên nhân sai. Đây là thao tác trung tâm của sản phẩm, và nó chỉ lộ ra khi có người bấm thật.
- `/api/v2` được ba middleware quảng cáo nhưng **chưa có endpoint nào** (đo: 0 trên 76 đường dẫn); bảy năng lực backend có mã chạy được nhưng không có đường HTTP tới người dùng.
- **Ba đường đọc làm lộ dữ liệu**: một đường công khai trả email và số điện thoại của tác giả cho người chưa đăng nhập; một đường ẩn danh đọc được cả bản nháp lẫn bản đã xoá mềm.
- Một endpoint mà bảng quản trị đang gọi trả **405**; và nút "Khoá tài khoản" bên cạnh nó thực ra gọi lệnh xoá.
- Năm khu vực của cổng người dùng là **vỏ không backend**, trong đó một biểu mẫu liên hệ báo gửi thành công cho tin nhắn bị vứt.
- **44 test đều xanh**, và không test nào chạm tới lỗi ở dòng đầu.

Toàn bộ danh sách, kèm bằng chứng đo và thứ tự sửa bắt buộc, ở [`bug-triage.md`](bug-triage.md).

Vì vậy bộ tài liệu này làm hai việc cùng lúc, và cấu trúc phản ánh đúng hai việc đó:

1. **Mô tả cái đang có** — [`admin/`](admin/), [`portal/`](portal/), [`landing/`](landing/), dựa trên [`nen-tang/`](nen-tang/). Viết từ ngoài vào, không mô tả mã.
2. **Đặc tả cái còn thiếu** — [`api-v2/`](api-v2/) (hợp đồng API chưa tồn tại) và [`moi/`](moi/) (màn hình chưa tồn tại). Cùng một khung tám mục, viết ở thì tương lai gần: đây là thứ sẽ được xây, mô tả ở mức người dùng chứ không phải mức thiết kế kỹ thuật.

Tài liệu dành cho những người cần hiểu hoặc thay đổi sản phẩm: thiết kế, kỹ sư, người viết nội dung, người kiểm thử, và bất kỳ ai đang đánh giá xem một hành vi có phải cố ý hay không.

### Đây không phải là gì

- **Không phải tài liệu API.** OpenAPI sinh tự động ở `http://127.0.0.1:5199/openapi/v2.json` khi API chạy. Thư mục `api-v2/` mô tả hợp đồng **chưa tồn tại**, ở mức người dùng cần gì chứ không phải mức schema; khi endpoint được viết, OpenAPI là nguồn đúng cho schema, tài liệu này vẫn là nguồn đúng cho hành vi.
- **Không tổ chức theo package.** 12 module backend và 3 repo frontend không được mô tả riêng. Một hành vi được mô tả một lần, ở chỗ người dùng gặp nó.
- **Không phải tài liệu thiết kế kỹ thuật.** Kiến trúc đích nằm ở [`../NACENTECH_ARCHITECTURE_V2.md`](../../04-technical/NACENTECH_ARCHITECTURE_V2.md). Chỗ nào chi tiết kỹ thuật cần thiết để hiểu trải nghiệm, nó xuất hiện trong block quote gắn nhãn `Ghi chú kỹ thuật:` và không ở chỗ nào khác.
- **Không phải sổ lỗi thứ hai.** Mọi khiếm khuyết nghi ngờ tập trung ở [`bug-triage.md`](bug-triage.md). Snapshot BMAD và các tài liệu tính năng chỉ trỏ mã lỗi, không chép danh sách.

## Quy ước

- Mô tả trải nghiệm, không mô tả mã. "Nút Lưu mờ đi cho tới khi máy chủ trả lời" chứ không phải "`isPending` khoá nút".
- Chi tiết kỹ thuật đi trong block quote, mở đầu bằng `Ghi chú kỹ thuật:`. Chỉ dùng khi cơ chế làm ra một kết quả người dùng không đoán được.
- Tiêu đề viết thường sau chữ đầu.
- Gọi tên nhất quán. [`glossary.md`](glossary.md) là nguồn đúng cho các từ như *hồ sơ vụ việc*, *đề bài*, *tài sản công nghệ*, *phiên bản*, *cấp quyền đọc*, *ảnh chụp chính sách*, *vòng ghép cặp*, *đã bẩn*.
- Hành vi gây bất ngờ thì nói thẳng, kèm lý do nếu mã hoặc chú thích có nói. Không làm mượt nó đi.
- **Chân trang.** Bốn thư mục mã nguồn **không phải git repo** (`git rev-parse` fail ở cả bốn, đo 2026-09-04). Vì vậy chân trang trích ngày chụp thư mục thay vì SHA: `Đối chiếu với SourceCode/{repo}, bản chụp ngày {ngày}.` Khi các repo được đưa vào git, đổi sang `commit {sha}` và ghi lý do đổi trong commit message.

## Việc phải làm

Mỗi tài liệu mô tả một tính năng. Tính năng có thể to (console hồ sơ vụ việc) hoặc bé (ô lọc trạng thái trên danh sách đề bài), nhưng mỗi cái được mô tả đầy đủ, gồm cả trường hợp biên và tương tác với tính năng khác.

### Khung tài liệu

Mọi tài liệu tính năng theo cùng một khung tám mục, để các tài liệu so sánh được với nhau và không bỏ sót gì.

1. **Tóm tắt.** Một đoạn mô tả tính năng ở mức trừu tượng. Ví dụ: "Trang đăng nhập admin nhận email và mật khẩu, và chỉ cho vào nếu tài khoản có vai trò ADMIN."
2. **Trường hợp đơn giản.** Đường đi thường gặp, viết thành văn.
3. **Tương tác, sự kiện theo sự kiện.** Năm pha của một vòng đời trang/biểu mẫu: **vào màn**, **rời đi không đổi gì**, **bắt đầu sửa**, **trong khi sửa**, **gửi đi**. Kèm một sơ đồ trạng thái Mermaid `stateDiagram-v2` gồm các trạng thái người dùng thực sự đi qua.
4. **Biến thể.** Bảng theo trục biến thể của sản phẩm này, hai cột "lúc vào màn" và "trong khi sửa".
5. **Huỷ và gián đoạn.** Cùng một danh sách trong mọi tài liệu, cùng thứ tự.
6. **Tương tác với hệ thống khác.** Cùng một danh sách mối quan tâm xuyên suốt, cùng thứ tự.
7. **Trường hợp biên.**
8. **Câu hỏi mở và kiểm chứng.** Chân trang và những gì chưa xác nhận được bằng tay.

Mục 5 quan trọng nhất. Hỏi cùng một bộ câu hỏi gián đoạn cho mọi tính năng là cách khoảng trống lộ ra.

#### Trục biến thể (mục 4 — cố định)

| Biến thể | Nghĩa |
|---|---|
| Vai trò | `ADMIN` · `USER` · khách chưa đăng nhập. Vai trò nằm trong claim `role` của JWT; sai vai trò khi đăng nhập trả `INVALID_CREDENTIALS` chứ không phải 403. |
| Trạng thái bản ghi | `DRAFT` / `PUBLISHED`; đã xoá mềm; đang có *hold* mở; `QualityLevel` của tài sản công nghệ. |
| Cấu hình backend | `Api:V1CompatEnabled`, `Api:V1SunsetDate`, `Matching:ScoringMode`, `Mail:DryRun`. Đổi được mà không deploy lại frontend. |
| Phím tắt của biểu mẫu | Enter, Ctrl/Cmd+Enter, Escape, thứ tự Tab. |

#### Danh sách gián đoạn (mục 5 — cố định, đúng thứ tự này ở mọi tài liệu)

1. Người dùng bấm Huỷ hoặc nhấn Escape
2. Người dùng đi chỗ khác trong app (đổi route, mở tab khác của cùng màn)
3. Nút Back/Forward của trình duyệt
4. Tải lại trang, hoặc đóng tab
5. Mất mạng, hoặc request quá hạn
6. Phiên hết hạn (401), hoặc v1 bị dừng (410 Gone)
7. Bản ghi bị đổi bởi tab khác hoặc người khác (409 khi `If-Match` lệch), hoặc bị xoá
8. Trình duyệt tự điền, hoặc trình quản lý mật khẩu ghi vào biểu mẫu

#### Mối quan tâm xuyên suốt (mục 6 — cố định, đúng thứ tự này)

**Quyền và vai trò.** **Kiểm tra dữ liệu và cách hiện lỗi.** **Thay đổi chưa lưu.** **Cập nhật lạc quan và hoàn tác.** **Ngoại tuyến.** **Thông báo và toast.** **Trạng thái lọc/tìm trong URL.** **Đa ngôn ngữ.** **Khả năng truy cập.** **Dấu vết kiểm toán.**

Mối quan tâm nào không liên quan thì vẫn viết một dòng "không có tương tác" — một dòng đó cho người đọc biết câu hỏi đã được hỏi.

### Phương pháp

Với mỗi tài liệu:

1. Đọc service layer của module tương ứng: `SourceCode/nacentech/modules/{module}/Application/` (đặc biệt `Contracts.cs`, nơi interface nói rõ điều kiện và mã lỗi trong chú thích XML).
2. Đọc facade tương ứng ở `SourceCode/nacentech/apps/api/V1Compat/`. Đây là thứ frontend thực sự gọi được hôm nay.
3. Đọc test ở `SourceCode/nacentech/tests/` — `invariants` và `authorization` gần với đặc tả chạy được của trường hợp biên.
4. Đọc UI: `src/features/{khu vực}/` của repo frontend tương ứng.
5. Thử chỗ nào còn mơ hồ trên bản chạy: dựng theo [`verification/README.md`](verification/README.md).
6. Ghi ngày chụp đã đối chiếu.

### Kiểm chứng

Soạn thảo thì đọc mã; kiểm chứng thì nhìn sản phẩm. Thư mục [`verification/`](verification/) chứa một danh mục cho mỗi cụm tài liệu, mỗi mục là một tuyên bố quan sát được, kèm thiết lập, các bước, kết quả mong đợi, mức ưu tiên và thiết bị cần. Người kiểm thử chạy chúng trên bề mặt thật, ghi `pass`, `fail` hoặc `blocked` vào cột Kết quả, và nộp mọi `fail` vào [`bug-triage.md`](bug-triage.md) kèm mã mục. Một tài liệu chỉ chuyển từ `đã soạn` sang `đã kiểm` khi mọi mục P1 và P2 của nó đã pass hoặc đã được nộp.

### Thứ tự làm

1. **Bản mẫu: [`admin/dang-nhap.md`](admin/dang-nhap.md).** Nhỏ, khép kín, có một tương tác thật với một luật kiểm tra. Dùng để chốt khung, giọng văn và độ sâu.
2. **Nền tảng: [`nen-tang/`](nen-tang/).** Mọi thứ khác trỏ về đây.
3. **[`api-v2/`](api-v2/).** Phần khó nhất và là nút chặn: không có hợp đồng này thì mọi spec màn hình mới đều treo lơ lửng.
4. **Còn lại.** [`moi/`](moi/), rồi [`admin/`](admin/), [`portal/`](portal/), [`landing/`](landing/), [`xuyen-suot/`](xuyen-suot/).

Tiến độ ở [bảng phủ](#bảng-phủ) bên dưới.

### Quyết định phạm vi

- **Ba bề mặt trong một repo tài liệu.** Phương pháp gốc nói một bề mặt một repo. Ở đây ba bề mặt dùng chung một backend, một bộ từ vựng và cùng một cuộc di trú v1→v2; tách ra thành ba repo sẽ nhân ba phần từ vựng và nền tảng mà không thêm gì. Bù lại: mỗi bề mặt là một thư mục riêng, và cột "Vai trò" trong bảng biến thể luôn nói rõ đang mô tả bề mặt nào.
- **Tài liệu cho thứ chưa tồn tại.** [`api-v2/`](api-v2/) và [`moi/`](moi/) mô tả hành vi sẽ được xây. Chúng theo cùng khung tám mục, nhưng chân trang ghi `Đặc tả — chưa có mã` thay vì ngày đối chiếu, và mọi tuyên bố trong đó là *yêu cầu*, không phải *quan sát*. Đây là chủ ý: người viết mã cần cùng một mức chi tiết cho cái sắp xây như cho cái đã có.
- **Sáu khu vực vỏ của cổng người dùng gộp làm một tài liệu.** `infrastructure`, `services`, `valuation`, `contact` chia chung đúng một sự thật — không có backend — nên bốn tài liệu gần giống hệt nhau sẽ chỉ làm loãng. `marketplace` và `deal-room` tách riêng vì `deal-room` là tiền thân UI của module `case`.
- **RAG nằm ngoài phạm vi** (Elasticsearch đã gỡ 2026-09-05 — chỉ mục tìm kiếm trong PostgreSQL, ADR-0010). `SourceCode/dmst-rag-master` và `search-bench` không được mô tả. Chúng ảnh hưởng đến chất lượng kết quả ghép cặp, không đến hành vi màn hình. [`api-v2/matching.md`](api-v2/matching.md) nói rõ ranh giới.
- **Hình dạng tương tác.** Đơn vị tương tác là vòng đời một trang/biểu mẫu, năm pha như trên. Danh sách gián đoạn và thứ tự mối quan tâm xuyên suốt cố định như khung ở trên.
- **Nền tảng và xuyên suốt bỏ được mục không áp dụng.** Năm tài liệu [`nen-tang/`](nen-tang/) là tài liệu tham chiếu: chúng sở hữu các con số, không mô tả một tương tác nào của riêng mình, nên chúng không có bảng huỷ/gián đoạn và phần lớn không có sơ đồ trạng thái. Bốn tài liệu [`xuyen-suot/`](xuyen-suot/) mô tả một chính sách áp lên nhiều màn hình chứ không phải một màn hình, nên chúng có bảng gián đoạn nhưng không có sơ đồ. Đây là chủ ý, không phải bỏ sót. **Mọi tài liệu trong `admin/`, `portal/`, `landing/`, `api-v2/` và `moi/` thì có đủ cả bốn**: tám mục, sơ đồ trạng thái, bảng gián đoạn tám dòng, và chân trang.
- **Không đánh số điều khoản.** Đây là tài liệu văn xuôi, không phải đặc tả đánh số. Neo tiêu đề là đủ để tham chiếu chéo. Mã `§x.y` và `D2-nn` khi xuất hiện là trích từ tài liệu kiến trúc, không phải hệ đánh số của repo này.

## Cấu trúc

```
README.md                        tệp này
BAN-GIAO.md                      bàn giao cho phiên viết mã: đọc gì, xây gì, theo thứ tự nào, quyết định phải ra trước
HUONG-DAN-TRIEN-KHAI.md          mã đặt ở đâu, client v2 dựng thế nào, năm cái bẫy đã đo được
goal.md                          chỉ dẫn thường trực cho người soạn
AGENTS.md, CLAUDE.md             cửa vào cho agent: đọc README.md rồi goal.md
glossary.md                      từ vựng dùng chung
bug-triage.md                    khiếm khuyết nghi ngờ, gộp theo nguyên nhân gốc

bmad/
  BMAD_SOI_Vong1_2026-09-04.md   snapshot Pha SOI vòng 1: đo trên bản chạy, bảy phát hiện, đề xuất sprint

nen-tang/
  mo-hinh-du-lieu.md             bản ghi là gì: người, đề bài, tài sản công nghệ, hồ sơ vụ việc, tài liệu, câu chuyện
  xac-thuc-va-vai-tro.md         đăng nhập, kích hoạt tài khoản, vai trò, phiên, giới hạn tần suất
  hop-dong-api.md                v1 facade và v2: hình dạng lỗi, Idempotency-Key, If-Match, header dừng dịch vụ
  dieu-huong-va-url.md           route của ba bề mặt, cái gì nằm trong URL, cái gì khôi phục khi quay lại
  luu-va-phien-ban.md            đã bẩn và đã lưu, sửa tạo phiên bản mới, xoá mềm, hold

admin/                           dmst-admin-main — hiện trạng
  dang-nhap.md                   BẢN MẪU: trang đăng nhập admin
  bang-dieu-khien.md             thống kê và biểu đồ
  nguoi-dung.md                  danh sách người dùng, tạo, sửa, đặt lại mật khẩu, xoá
  ho-so-nguoi-dung.md            trang hồ sơ một người dùng, năm tab
  de-bai-va-cong-nghe.md         danh sách và biểu mẫu đề bài (challenge) và tài sản công nghệ (IP)
  danh-muc.md                    lĩnh vực và danh mục
  cau-chuyen.md                  duyệt và ẩn/hiện câu chuyện
  trien-khai.md                  hồ sơ triển khai

portal/                          dmst-user-main — hiện trạng
  dang-ky-va-kich-hoat.md        đăng ký, kích hoạt qua email, quên/đặt lại mật khẩu
  de-bai-va-cong-nghe-cua-toi.md tạo và sửa đề bài / công nghệ của chính mình
  ket-qua-ghep-cap.md            xem kết quả ghép cặp và tìm đối tác
  loi-moi-hop-tac.md             gửi, nhận, chấp nhận, từ chối lời mời
  thong-bao-va-cai-dat.md        khay thông báo và trang cài đặt
  cau-chuyen.md                  viết và đăng câu chuyện
  cho-giao-dich.md               marketplace — vỏ, chưa nối API
  phong-thuong-thao.md           deal-room — vỏ, tiền thân UI của module case
  khu-vuc-chua-co-backend.md     hạ tầng, dịch vụ, định giá, liên hệ — bốn khu vực vỏ

landing/
  trang-chu-va-cau-chuyen.md     trang công khai, câu chuyện thành công, đổi ngôn ngữ

api-v2/                          ĐẶC TẢ — hợp đồng API chưa tồn tại
  README.md                      quy ước chung: đường dẫn, phân trang, lỗi, header bắt buộc
  identity-va-nguoi-dung.md      đăng nhập, hồ sơ, quản trị người dùng
  demand-va-technology.md        đề bài và tài sản công nghệ, phiên bản, cổng chất lượng
  case-va-quyet-dinh.md          hồ sơ vụ việc, chuyển giai đoạn, bản ghi quyết định, hold
  brokerage.md                   hồ sơ môi giới, phân công, capacity
  dataroom-va-cap-quyen.md       tài liệu phân loại mật, cấp và thu hồi quyền đọc
  audit.md                       tra cứu nhật ký kiểm toán
  policy-va-taxonomy.md          lĩnh vực, danh mục, ảnh chụp chính sách
  matching.md                    vòng ghép cặp, ứng viên, tìm kiếm lai
  content-va-communication.md    câu chuyện, lời mời, thông báo

moi/                             ĐẶC TẢ — màn hình chưa tồn tại
  console-ho-so-vu-viec.md       màn hình lõi: danh sách và chi tiết hồ sơ vụ việc, chuyển giai đoạn
  phan-cong-moi-gioi.md          hồ sơ môi giới và giao việc theo capacity
  phong-du-lieu-va-cap-quyen.md  tài liệu mật, cấp quyền đọc có thời hạn, thu hồi
  nhat-ky-kiem-toan.md           tra cứu ai đã làm gì, gồm cả lượt bị từ chối
  anh-chup-chinh-sach.md         xem chính sách đã đóng băng cho một hồ sơ
  vong-ghep-cap.md               so sánh các vòng ghép cặp và hai chế độ chấm điểm
  lich-su-phien-ban.md           xem và so sánh phiên bản của đề bài / công nghệ
  cong-chat-luong-cong-nghe.md   nâng hạ QualityLevel của tài sản công nghệ

xuyen-suot/
  di-tru-v1-sang-v2.md           kế hoạch chuyển ba client khỏi v1 trước ngày dừng dịch vụ
  quyen-va-vai-tro.md            ai thấy gì, và vì sao từ chối được ghi lại
  loi-va-thong-bao.md            mã lỗi v1, problem details v2, và cách hiện cho người dùng
  dong-thoi-va-if-match.md       hai người sửa một bản ghi
  thay-doi-chua-luu.md           rời trang khi biểu mẫu còn bẩn

verification/
  README.md                      cách dựng bề mặt, chạy một lượt kiểm, ghi kết quả
  nen-tang.md                    danh mục cho nen-tang/
  admin.md                       danh mục cho admin/
  portal-va-landing.md           danh mục cho portal/ và landing/
  api-v2-va-moi.md               danh mục cho api-v2/ và moi/ — chạy được sau khi xây
```

## Bảng phủ

Trạng thái là một trong `chưa bắt đầu`, `đã soạn`, `đã kiểm`.

| Tài liệu | Trạng thái |
| --- | --- |
| BAN-GIAO.md | đã soạn |
| HUONG-DAN-TRIEN-KHAI.md | đã soạn |
| glossary.md | đã soạn |
| goal.md | đã soạn |
| bug-triage.md | đã soạn |
| bmad/BMAD_SOI_Vong1_2026-09-04.md | đã soạn |
| nen-tang/mo-hinh-du-lieu.md | đã soạn |
| nen-tang/xac-thuc-va-vai-tro.md | đã soạn |
| nen-tang/hop-dong-api.md | đã soạn |
| nen-tang/dieu-huong-va-url.md | đã soạn |
| nen-tang/luu-va-phien-ban.md | đã soạn |
| admin/dang-nhap.md | đã soạn |
| admin/bang-dieu-khien.md | đã soạn |
| admin/nguoi-dung.md | đã soạn |
| admin/ho-so-nguoi-dung.md | đã soạn |
| admin/de-bai-va-cong-nghe.md | đã soạn |
| admin/danh-muc.md | đã soạn |
| admin/cau-chuyen.md | đã soạn |
| admin/trien-khai.md | đã soạn |
| portal/dang-ky-va-kich-hoat.md | đã soạn |
| portal/de-bai-va-cong-nghe-cua-toi.md | đã soạn |
| portal/ket-qua-ghep-cap.md | đã soạn |
| portal/loi-moi-hop-tac.md | đã soạn |
| portal/thong-bao-va-cai-dat.md | đã soạn |
| portal/cau-chuyen.md | đã soạn |
| portal/cho-giao-dich.md | đã soạn |
| portal/phong-thuong-thao.md | đã soạn |
| portal/khu-vuc-chua-co-backend.md | đã soạn |
| landing/trang-chu-va-cau-chuyen.md | đã soạn |
| api-v2/README.md | đã soạn |
| api-v2/identity-va-nguoi-dung.md | đã soạn |
| api-v2/demand-va-technology.md | đã soạn |
| api-v2/case-va-quyet-dinh.md | đã soạn |
| api-v2/brokerage.md | đã soạn |
| api-v2/dataroom-va-cap-quyen.md | đã soạn |
| api-v2/audit.md | đã soạn |
| api-v2/policy-va-taxonomy.md | đã soạn |
| api-v2/matching.md | đã soạn |
| api-v2/content-va-communication.md | đã soạn |
| moi/console-ho-so-vu-viec.md | đã soạn |
| moi/phan-cong-moi-gioi.md | đã soạn |
| moi/phong-du-lieu-va-cap-quyen.md | đã soạn |
| moi/nhat-ky-kiem-toan.md | đã soạn |
| moi/anh-chup-chinh-sach.md | đã soạn |
| moi/vong-ghep-cap.md | đã soạn |
| moi/lich-su-phien-ban.md | đã soạn |
| moi/cong-chat-luong-cong-nghe.md | đã soạn |
| xuyen-suot/di-tru-v1-sang-v2.md | đã soạn |
| xuyen-suot/quyen-va-vai-tro.md | đã soạn |
| xuyen-suot/loi-va-thong-bao.md | đã soạn |
| xuyen-suot/dong-thoi-va-if-match.md | đã soạn |
| xuyen-suot/thay-doi-chua-luu.md | đã soạn |
| verification/README.md | đã soạn |
| verification/nen-tang.md | đã soạn |
| verification/admin.md | đã soạn |
| verification/portal-va-landing.md | đã soạn |
| verification/api-v2-va-moi.md | đã soạn |

## Tham chiếu

Nguồn đúng là bốn thư mục mã nguồn tại `d:\Code\TakeOp\NacenTech\SourceCode\`. Không thư mục nào là git repo (đo 2026-09-04). Các vị trí quan trọng:

- `nacentech/apps/api/V1Compat/` — **13 file controller, toàn bộ cửa HTTP đang tồn tại.** Đây là thứ ba frontend thực sự gọi được.
- `nacentech/apps/api/Infrastructure/` — hình dạng lỗi, Idempotency-Key, header dừng dịch vụ v1, actor hiện tại.
- `nacentech/modules/{module}/Application/Contracts.cs` — interface service của 12 module. Chú thích XML trong đó nói rõ điều kiện từ chối và mã lỗi; đây là nguồn dày nhất cho hành vi.
- `nacentech/modules/{module}/Domain/` — bất biến ở mức domain.
- `nacentech/packages/policy-engine/` — bảng quyết định có phiên bản, mặc định DENY, trả `ruleId`.
- `nacentech/tests/invariants/`, `tests/authorization/` — gần với đặc tả chạy được của trường hợp biên.
- `nacentech/README.md` — bảy thay đổi hành vi có chủ đích so với NestJS, và danh sách những gì Phase 1 **chưa** mở.
- `dmst-admin-main/src/app/router-config.tsx` — 20 route của admin, danh sách màn hình đang có.
- `dmst-admin-main/src/services/` — 5 file service, mọi lời gọi API của admin.
- `dmst-user-main/src/features/` — 12 khu vực, trong đó 6 khu vực không nối API.
- `dmst-landing-page-main/src/core/api/stories.ts` — toàn bộ bề mặt API của landing page.
- [`../NACENTECH_ARCHITECTURE_V2.md`](../../04-technical/NACENTECH_ARCHITECTURE_V2.md) — kiến trúc đích V2.20, nơi các mã `§x.y` và `D2-nn` được định nghĩa.
