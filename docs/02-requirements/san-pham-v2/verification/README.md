# Kiểm chứng bằng tay

> **Identity/RBAC supersession (29/09/2026):** các hướng dẫn kiểm thử trong bộ legacy này nói chỉ có `USER`/`ADMIN` không còn là tiêu chí nghiệm thu hiện hành. Dùng `SourceCode/specs/TASK-00_PLATFORM_FOUNDATION_VA_COMMON` (T-00.41–44) và Basic Design `TASK-07` cho ma trận 10 role/4 tầng, provision scope và E2E đăng ký/provision → đăng nhập.

Các tài liệu tính năng được viết từ mã nguồn và từ test. Thư mục này là quy trình đối chiếu chúng với sản phẩm đang chạy, mỗi lần một tuyên bố quan sát được.

## Có gì ở đây

| Tệp | Phủ |
|---|---|
| [nen-tang.md](nen-tang.md) | `nen-tang/*` |
| [admin.md](admin.md) | `admin/*` |
| [portal-va-landing.md](portal-va-landing.md) | `portal/*` và `landing/*` |
| [api-v2-va-moi.md](api-v2-va-moi.md) | `api-v2/*` và `moi/*` — **chỉ chạy được sau khi đã xây** |

Mỗi tệp có một bảng cho mỗi tài liệu. Mỗi dòng là một mục có mã ổn định (`DNHAP-07`, `CASE-12`), một mức ưu tiên, thứ cần có (thiết bị, vai trò, điều kiện mạng, người thứ hai), tuyên bố kèm liên kết tới mục trong tài liệu, thiết lập, các bước đánh số, kết quả mong đợi, và cột Kết quả cho người kiểm thử. Mục không kiểm được bằng tay nằm dưới mỗi tài liệu ở phần "Không kiểm được bằng tay".

Mức ưu tiên: **P1** là một sự kiện đã chốt, một tuyên bố mà nhiều tài liệu dựa vào, hoặc một lỗi nghi ngờ. **P2** là tuyên bố thường. **P3** là một con số, một màu, hoặc một khoảng thời gian.

Tổng cộng **1292 mục** trên 45 tiền tố: 51 ở `nen-tang.md`, 422 ở `admin.md`, 332 ở `portal-va-landing.md`, 487 ở `api-v2-va-moi.md`.

Tệp cuối khác ba tệp kia ở một chỗ: nó có thêm cột **Chặn bởi**, vì **không mục nào trong đó chạy được hôm nay** — `/api/v2` chưa có endpoint và tám màn hình `moi/` chưa tồn tại. Nó là tiêu chí nghiệm thu viết trước, dùng lúc nhận sprint, không phải danh mục cho lượt kiểm hôm nay. Đừng ghi `blocked` hàng loạt vào cột Kết quả của nó; cột Chặn bởi đã nói điều đó rồi.

## Cách dựng bề mặt

Đã dựng và đo được phần backend trong phiên 2026-09-04; phần frontend chưa dựng lần nào.

### Backend

```bash
cd d:/Code/TakeOp/NacenTech/SourceCode/nacentech

# 1. PostgreSQL. Biến này bắt buộc kể cả khi chỉ khởi động postgres — xem B-07.
export AUTH_SIGNING_KEY='dev-only-key-doi-khoa-nay-va-dai-it-nhat-32-byte'
docker compose up -d postgres

# 2. API, tự áp migration
cd apps/api
ASPNETCORE_URLS=http://127.0.0.1:5199 \
ConnectionStrings__Postgres='Host=localhost;Port=55440;Database=baclink_dev;Username=postgres;Password=postgres' \
Auth__SigningKey="$AUTH_SIGNING_KEY" \
Api__MigrateOnStartup=true \
Api__EnableSwaggerUi=true \
dotnet run
```

Kiểm tra: `GET http://127.0.0.1:5199/health` phải trả `200 {"status":"ok",…}`.

Cần thêm cho các mục về ghép cặp: sidecar nhúng ở cổng 8003 (Elasticsearch đã gỡ — ADR-0010; ảnh PostgreSQL phải là `pgvector/pgvector:pg16`). Cần thêm cho các mục về việc nền: `cd apps/worker && dotnet run` với cùng chuỗi kết nối.

### Ba frontend

Chưa dựng lần nào. Trước khi chạy, **phải sửa cấu hình** — cả ba tệp `.env.example` trỏ về cổng NestJS cũ (xem [B-14](../bug-triage.md#b-14-ba-envexample-vẫn-trỏ-cổng-nestjs-cũ)):

```
VITE_API_BASE_URL=http://127.0.0.1:5199
VITE_API_PREFIX=api
VITE_API_VERSION=v1
```

Cổng mặc định: bảng quản trị 5174, cổng người dùng 5173. Cấu hình CORS của backend mặc định cho phép đúng hai địa chỉ đó; chạy ở cổng khác thì phải sửa `Cors:Origins`, nếu không mọi lời gọi bị trình duyệt chặn và triệu chứng trông giống hệt "backend chết".

**Trang giới thiệu chạy ở cổng thứ ba**, không nằm trong hai địa chỉ mặc định. Phải thêm nó vào `Cors:Origins` **trước** khi chạy bất kỳ mục `LANDING-` nào. Không thêm thì mục câu chuyện thành công biến mất khỏi trang — và đó **đúng là triệu chứng** mà `LANDING-01` đang đi tìm, nên bỏ qua bước này sẽ cho ra một kết quả `fail` sai.

### Dữ liệu để kiểm

Cơ sở dữ liệu sau khi migration là **rỗng**. Không có tài khoản quản trị nào. Trước khi kiểm được bất cứ thứ gì ở bảng quản trị, phải tạo một tài khoản `ADMIN` — và không có đường tự đăng ký thành `ADMIN`, nên bước này phải làm bằng SQL hoặc bằng công cụ di trú. Ghi lại cách đã làm vào phần Kết quả của lượt kiểm.

## Xác nhận bản đang kiểm

Bốn thư mục mã nguồn **không phải git repo**, nên không có mã commit để so. Mỗi tài liệu ghi chân trang dạng `bản chụp ngày {ngày}`. Trước khi chạy một lượt kiểm, ghi lại:

- ngày và giờ bắt đầu lượt kiểm;
- kết quả `dotnet build NacenTech.slnx` (phải là 0);
- số đường dẫn trong `GET /openapi/v2.json`, tách theo tiền tố — đây là dấu vân tay rẻ nhất của bản backend.

Ngày 2026-09-04 con số đó là **74 đường dẫn `/api/v1`, 2 đường dẫn health, 0 đường dẫn `/api/v2`**. Nếu lượt kiểm sau ra số khác, các tài liệu đang mô tả một bản khác và một số thất bại sẽ là do lệch bản chứ không phải khiếm khuyết.

## Cách chạy một lượt

1. Dựng bề mặt theo mục trên. Ghi lại cách lấy trạng thái sạch và cách dọn sau khi xong.
2. Xác nhận bản đang kiểm.
3. Mở tài liệu bên cạnh sản phẩm. Đọc mục được liên kết trước mỗi dòng: dòng là bản tóm tắt, mục trong tài liệu mới là tuyên bố.
4. Chạy hết P1 ở mọi tệp trước, rồi P2, rồi P3.
5. Ghi `pass`, `fail` hoặc `blocked` vào cột Kết quả, kèm một ghi chú cho mọi thứ không phải pass sạch. `fail` là điều tài liệu nói mà sản phẩm không làm. `blocked` là mục không chạy được (thiếu thiết bị, thiếu người thứ hai, hoặc một mục trước đó chặn đường).
6. Nộp mọi `fail` vào [`../bug-triage.md`](../bug-triage.md): nếu mục lỗi đã có, thêm một dòng **Trạng thái** trích mã mục kiểm; nếu chưa, thêm một mục mới với mã tiếp theo và ghi mã mục kiểm ở dòng "Nêu bởi". **Một `fail` không tự động là lỗi sản phẩm** — đôi khi tài liệu sai, và khi đó thứ phải sửa là tài liệu. Dòng Trạng thái phải nói rõ là cái nào.
7. Khi mọi mục P1 và P2 của một tài liệu đã pass hoặc đã được nộp, đổi dòng của nó trong [bảng phủ](../README.md#bảng-phủ) từ `đã soạn` sang `đã kiểm`.

Không bao giờ đánh số lại mã mục kiểm hay mã lỗi sau khi một lượt kiểm đã dùng chúng.

## Thiết bị và điều kiện

Các giá trị mà cột "Cần" dùng:

- **`chuột`** — thao tác chuột thường trên máy để bàn.
- **`bàn phím`** — chỉ dùng bàn phím, gồm cả thứ tự Tab và bẫy focus trong hộp thoại. Đây là điều kiện duy nhất bắt được lỗi khả năng truy cập.
- **`di động`** — khung nhìn hẹp. Quan trọng với trang đăng nhập (mảng thương hiệu biến mất) và mọi bảng danh sách.
- **`ADMIN`** / **`USER`** / **`khách`** — vai trò của tài khoản đang dùng. Cần **hai tài khoản riêng**, không phải một tài khoản đổi vai trò, vì vai trò được quyết lúc đăng nhập.
- **`hai trình duyệt`** — hai phiên khác nhau của hai người khác nhau. **Hai tab của cùng một trình duyệt không đủ** cho các mục về xung đột phiên bản: hai tab dùng chung cookie và chung bộ nhớ đệm, nên chúng không tái hiện được cảnh hai người thật.
- **`ngoại tuyến`** — ngắt mạng. Công tắc ngoại tuyến trong công cụ nhà phát triển **không** làm hỏng một request đang bay giống như rút cáp; với các mục về gián đoạn giữa chừng, phải rút thật hoặc chặn ở tường lửa.
- **`mạng chậm`** — điều tiết băng thông, để nhìn thấy trạng thái đang chờ. Không có nó thì mọi tuyên bố về "nút mờ đi trong lúc chờ" không quan sát được trên máy cục bộ.
- **`token hết hạn`** — cách rẻ nhất là chạy API với `Auth:AccessTokenMinutes` đặt xuống 2, đăng nhập, chờ, rồi thao tác. Đây là điều kiện cần cho các mục về [B-09](../bug-triage.md#b-09-cookie-sống-7-ngày-token-sống-24-giờ) và [B-12](../bug-triage.md#b-12-cổng-người-dùng-không-xử-lý-401).
- **`v1 đã dừng`** — chạy API với `Api:V1CompatEnabled=false` để mọi đường v1 trả 410. Đây là cách duy nhất kiểm được hành vi của ba client vào ngày dừng dịch vụ, và nên chạy **trước** khi ngày đó tới.

## Chạy bằng công cụ và bằng script

Bề mặt này chia làm hai nửa, và chúng kiểm được bằng hai cách rất khác nhau.

**Nửa API kiểm được bằng script.** Mã trạng thái, hình dạng thân, header và định tuyến đều đọc được bằng `curl` hoặc bằng một script. Toàn bộ [`nen-tang/hop-dong-api.md`](../nen-tang/hop-dong-api.md) và phần lớn [`api-v2/`](../api-v2/) thuộc nhóm này. Một lượt kiểm bằng script chạy được trong vài phút và nên được chạy lại mỗi lần backend đổi.

**Nửa giao diện phải nhìn.** Trang đăng nhập có chớp lên một nhịp không, dải đỏ hiển thị một mảng thông điệp ra sao, nút có thật sự mờ đi trong lúc chờ không, focus đi đâu sau khi hộp thoại đóng — không mục nào trong số đó đọc được từ mạng. Công cụ nhà phát triển thay được cho bảng điều khiển: tab Network cho biết một lần gửi đã gửi gì, tab Application cho biết cookie đã lưu gì. Nhưng **đừng dùng nó để thao tác**: sự kiện bàn phím tổng hợp có thể không tới lớp phím tắt, và một dòng lệnh đặt cookie không đi qua cùng đường mã với việc đăng nhập thật.

Một lượt kiểm bằng script **không đủ** để đánh dấu một tài liệu là `đã kiểm`. Nó kiểm được đầu ra, mã trạng thái và trạng thái đã lưu; nó không kiểm được cái hiện trên màn hình hay mất bao lâu để hiện.

## Kết quả tới nay

**18 trong 51 mục của [nen-tang.md](nen-tang.md) đã chạy**: 14 pass, 3 fail, 1 blocked. 33 mục còn lại của tệp đó chưa chạy — phần lớn cần trình duyệt, dữ liệu lớn hơn, hoặc điều kiện `v1 đã dừng`. Toàn bộ chạy bằng `curl` và truy vấn cơ sở dữ liệu, không qua trình duyệt. Ba mục fail đều xác nhận một lỗi đã nghi ngờ ([B-19](../bug-triage.md#b-19-apiv1publicstories-trả-email-và-số-điện-thoại-của-tác-giả-cho-người-chưa-đăng-nhập), [B-20](../bug-triage.md#b-20-đọc-một-bản-ghi-theo-định-danh-không-kiểm-quyền), [B-32](../bug-triage.md#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409)); mục blocked là [B-31](../bug-triage.md#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó), bị chính B-32 che.

Ba tệp danh mục còn lại chưa chạy mục nào.

**Không tài liệu nào được đánh dấu `đã kiểm`.** Lượt đã chạy chỉ phủ tầng API; nó không kiểm được cái gì hiện trên màn hình, focus đi đâu, hay mất bao lâu để hiện. Theo quy tắc ở [mục 7](#cách-chạy-một-lượt), một tài liệu chỉ chuyển trạng thái khi **mọi** mục P1 và P2 của nó đã pass hoặc đã được nộp — chưa tài liệu nào đạt.

Một lượt **đo backend** đã chạy ngày 2026-09-04 trên bản dựng tại chỗ. Nó bao gồm: dựng PostgreSQL và API, `dotnet build` (exit 0), `GET /health` (200), đếm đường dẫn trong `openapi/v2.json` theo tiền tố, năm probe `/api/v2/*`, một probe `DELETE /api/v1/admin/users/{id}`, và một lần đọc header đầy đủ của `GET /api/v1/sectors`.

Kết quả đi vào [BMAD vòng 1](../bmad/BMAD_SOI_Vong1_2026-09-04.md). Năm mục lỗi được xác nhận **bằng đo trên bản chạy**: [B-01](../bug-triage.md#b-01-apiv2-được-quảng-cáo-nhưng-chưa-có-endpoint-nào), [B-02](../bug-triage.md#b-02-xóa-người-dùng-trong-admin-trả-405), [B-03](../bug-triage.md#b-03-bảy-năng-lực-backend-không-có-đường-tới-người-dùng), [B-07](../bug-triage.md#b-07-docker-compose-up-postgres-fail-vì-biến-của-service-api), và ngày dừng dịch vụ v1 — máy chủ trả `Sunset: Wed, 31 Mar 2027 00:00:00 GMT`, nên đồng hồ trong [B-06](../bug-triage.md#b-06-client-chưa-có-idempotency-key-if-match-và-rfc-9457) đã chạy. Mười mục nữa được xác nhận **bằng đọc lại mã ở cả hai phía** trong cùng phiên; chúng mang dòng **Trạng thái** nói rõ đó là đọc mã chứ không phải đo.

Lượt đó **không** bao gồm: bất kỳ frontend nào (không repo nào được `npm install`), Elasticsearch và sidecar nhúng, worker, bất kỳ dữ liệu nào (cơ sở dữ liệu rỗng, nên chỉ đo được định tuyến chứ không đo được hình dạng dữ liệu thật hay phân trang), và bộ test.

**Lượt thứ hai, cùng ngày, có dữ liệu.** Một tài khoản được tạo qua chính API (đăng ký → lấy token kích hoạt từ bảng `identity.activation_tokens` → kích hoạt → nâng lên `ADMIN` bằng SQL, vì không có đường tự đăng ký thành quản trị viên), rồi một câu chuyện, một danh mục và ba bản ghi đề bài/công nghệ. Lượt này đo được ba điều mà lượt đầu không đo được:

- [B-19](../bug-triage.md#b-19-apiv1publicstories-trả-email-và-số-điện-thoại-của-tác-giả-cho-người-chưa-đăng-nhập) — **xác nhận**: đường công khai trả email và số điện thoại của tác giả cho request không có token.
- Ngày dừng dịch vụ v1 — **xác nhận**: `Sunset: Wed, 31 Mar 2027 00:00:00 GMT` có thật trên mọi phản hồi v1.
- [B-32](../bug-triage.md#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409) — **lỗi mới, không tài liệu nào dự đoán được**: mọi sửa đổi tạo phiên bản nội dung mới trả 409 vĩnh viễn. Tìm ra bằng cách bấm thật, không bằng cách đọc mã. Câu lệnh SQL gây lỗi chụp được bằng `log_statement='all'` trên PostgreSQL — kỹ thuật đó nên là bước chuẩn cho mọi lỗi 409 hoặc 500 khó hiểu trong các lượt sau.

Và một mục **không đo được vì bị che**: [B-31](../bug-triage.md#b-31-sửa-một-đề-bài-mà-không-gửi-kèm-nội-dung-mật-sẽ-xoá-sạch-nội-dung-mật-đó) không nổ được chừng nào B-32 còn đó. Phải đo lại ngay sau khi B-32 được sửa và **trước** khi bản sửa được phát hành.

Không tài liệu nào được đánh dấu `đã kiểm`, vì việc đánh dấu đó cần một lượt kiểm bằng tay trên giao diện, và chưa lượt nào chạy.
