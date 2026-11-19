# Hướng dẫn triển khai

Tài liệu này trả lời câu **mã đặt ở đâu và dựng thế nào** — thứ mà các tài liệu mô tả cố tình không nói, vì
chúng mô tả trải nghiệm chứ không mô tả mã.

Nó không thay thế đặc tả. Đặc tả nói *cái gì phải xảy ra*; tệp này nói *đặt tệp ở đâu để điều đó xảy ra*, và
liệt kê những cái bẫy đã đo được để không lặp lại.

## Ba repo, ba cấu trúc khác nhau

Đây là chỗ dễ sai nhất khi chuyển qua lại giữa các repo: chúng **không** dùng chung quy ước.

| | Bảng quản trị | Cổng người dùng | Trang giới thiệu |
|---|---|---|---|
| Client HTTP | `src/lib/api/client.ts` | `src/services/api/client.ts` | `src/core/api/stories.ts` |
| Lời gọi API | `src/services/*.ts` — gom theo **miền**, tách khỏi feature | `src/features/{khu vực}/api/*.ts` — nằm **trong** feature | một tệp duy nhất |
| Định tuyến | `src/app/router-config.tsx` — một mảng cấu hình | `src/app/router/routes.tsx` — JSX `<Routes>` | không có định tuyến |
| Phiên | `src/features/auth/context/AuthContext.tsx` | `src/app/providers/AuthProvider` | không có |
| Cookie | `src/lib/cookies.ts`, tên ở `src/lib/auth/constants.ts` | `src/shared/utils/authCookie.ts` | không có |
| Dùng chung | `src/shared/{components,layout,ui}` | `src/shared/` | `src/shared/`, `src/layout/` |

Hệ quả thực tế: **một lời gọi API mới ở bảng quản trị đặt ở `src/services/`, còn ở cổng người dùng đặt trong
thư mục của khu vực.** Đặt nhầm chỗ thì mã vẫn chạy nhưng lệch quy ước của repo đó, và người sau sẽ không tìm
thấy.

Đừng hợp nhất ba cấu trúc trong lúc làm việc khác. Nếu muốn hợp nhất, đó là một việc riêng có ADR riêng.

## Thêm một màn hình mới vào bảng quản trị

Tám màn hình trong [`moi/`](moi/) đều thuộc bảng quản trị. Trình tự:

1. **Kiểu dữ liệu** — `src/types/` nếu dùng chung, hoặc `src/features/{khu vực}/types.ts` nếu riêng. Hai
   khu vực hiện có (`users`, `implementations`) dùng cách thứ hai.
2. **Lời gọi API** — một tệp mới trong `src/services/`, đặt tên theo miền: `caseService.ts`, `auditService.ts`.
   Nhập `apiClient` từ `@/lib/api/client`.
3. **Hook danh sách** — `src/features/{khu vực}/hooks/use{X}List.ts`. Bốn khu vực hiện có đều theo mẫu này;
   đọc `useUsersList.ts` trước khi viết cái mới.
4. **Thành phần** — `src/features/{khu vực}/components/`. Bảng, bộ lọc, huy hiệu trạng thái, hộp thoại.
5. **Trang** — `src/features/{khu vực}/pages/`, cộng một `index.ts` xuất ra ngoài.
6. **Route** — thêm vào mảng trong `src/app/router-config.tsx`, **dùng tham số đường dẫn**: `/cases/:id`, không
   phải `/cases/detail`. Xem [B-17](bug-triage.md#b-17-route-chi-tiết-không-có-định-danh-trong-đường-dẫn) — kiểu
   route tĩnh là một lỗi đang tồn tại, đừng thêm cái mới.
7. **Mục thanh bên** — `src/shared/layout/`.

Giao diện dùng Tailwind và shadcn/ui; màu và kiểu chữ theo `docs/brand-guidelines.md` của chính repo đó.

## Client v2 dùng chung

Ba cơ chế phải đi cùng nhau. Wire lẻ một cái thì hai cái kia vẫn chặn màn hình đầu tiên
([B-06](bug-triage.md#b-06-client-chưa-có-idempotency-key-if-match-và-rfc-9457)).

Cả ba **thuộc về bộ chặn HTTP dùng chung**, không thuộc màn hình. Màn hình chỉ cung cấp dữ liệu; nếu một màn
hình phải tự nhớ gắn header thì sẽ có một màn hình quên.

### 1. Khoá chống lặp

Quy tắc ở [ADR-0004](../../04-technical/adr/0004-sinh-khoa-chong-lap-o-client.md): **một khoá cho
mỗi lần bấm nút**, dùng lại cho mọi lần thử lại của chính lần bấm đó.

Hình dạng: hàm gọi lệnh ghi nhận một khoá từ chỗ gọi; bộ chặn gắn nó vào header. Khoá là định danh ngẫu nhiên
thuần — **không ghép từ đường dẫn, tham số hay dấu thời gian**, vì khoá bị cắt còn 200 ký tự và hai khoá chỉ
khác nhau ở phần đuôi sẽ bị coi là một.

Thiếu header trên lệnh ghi `/api/v2` → **428**. Cùng khoá khác thân → **422**. Cùng khoá cùng thân → phát lại
kèm `Idempotent-Replayed: true`, và phát lại **được đối xử như thành công**.

### 2. Giữ số phiên bản

Bản ghi có tranh chấp trả `version` trong thân và `ETag` trong header. Lệnh ghi gửi lại số đó.

Bốn bản ghi cần: hồ sơ vụ việc, đề bài, tài sản công nghệ, hồ sơ môi giới. Ba bản ghi không cần: thông báo,
sự kiện kiểm toán, ảnh chụp chính sách.

Điều giao diện phải làm mà hiện không chỗ nào làm: **giữ số phiên bản từ lần đọc và gửi lại nó**, rồi khi
nhận 409 thì tải lại bản ghi và **giữ nguyên cái người dùng đang gõ**. Với console hồ sơ vụ việc, thứ đáng cứu
nhất là ô diễn giải — người dùng thường viết vài câu, và bắt viết lại là cách chắc chắn khiến lần sau họ viết
ngắn đi.

### 3. Dịch lỗi

Đây là chỗ dễ bỏ sót nhất, vì nó không gây lỗi biên dịch và chỉ hiện ra như một thông điệp vô nghĩa.

| | v1 | v2 |
|---|---|---|
| Kiểu nội dung | `application/json` | `application/problem+json` |
| Trường để hiển thị | `message` | **`detail`** |
| Mã nghiệp vụ | `code` (chỉ 12 mã xác thực) | `code` |
| Nhiều lỗi kiểm tra | `message` là **mảng** | `errors` là mảng |
| Mã tương quan | **không có** | `correlationId`, luôn có |
| Quy tắc đã chặn | không có | `ruleId` |
| Lệch phiên bản | không có | `currentVersion` |

Hàm trích thông điệp phải xử lý **cả ba hình dạng**: `detail` của v2, `message` chuỗi của v1, và `message`
mảng của v1. Hiện `getErrorMessage` ở bảng quản trị chỉ đọc `message`, nên nó sẽ rơi về câu mặc định của thư
viện HTTP ngay khi gọi v2 ([B-08](bug-triage.md#b-08-thông-điệp-lỗi-nhiều-trường-là-mảng-client-đối-xử-như-chuỗi)).

Thêm hai nhánh nữa vào cùng bộ chặn, vì chúng ở cùng chỗ và đồng hồ đã chạy tới **31/03/2027**:

- **410 Gone** — v1 đã dừng. Hiện không client nào có nhánh này; nó sẽ hiện ra như một lỗi lạ không giải
  thích được.
- Header **`Deprecation`, `Sunset`, `Link`** — đã được mở trong cấu hình CORS, chỉ chưa ai đọc. Đọc `Sunset`
  và cảnh báo khi gần tới hạn là cách rẻ nhất để không ai quên.

## Năm cái bẫy đã đo được — đừng lặp lại

Cả năm đều là mã đang chạy, không phải giả thuyết.

1. **Đừng đọc `response.data.message` làm câu hiển thị.** Nó là mảng khi có nhiều lỗi, và không tồn tại ở v2.
2. **Đừng để client không có nhánh 401.** Cổng người dùng hiện không có
   ([B-12](bug-triage.md#b-12-cổng-người-dùng-không-xử-lý-401)): bộ chặn thay lỗi bằng một `Error` chỉ mang
   thông điệp, nên **mã trạng thái bị vứt trước khi màn hình nhìn thấy nó**. Sau bộ chặn đó, không màn hình
   nào phân biệt được 410 với mất mạng, kể cả nếu muốn.
3. **Đừng đặt tuổi cookie khác tuổi token.** Token sống 24 giờ; cookie của bảng quản trị sống 7 ngày, của
   cổng người dùng sống **365 ngày**. Khoảng lệch là thời gian trình duyệt tin rằng còn đăng nhập trong khi
   máy chủ đã hết công nhận ([B-09](bug-triage.md#b-09-cookie-sống-7-ngày-token-sống-24-giờ)).
4. **Đừng viết cứng địa chỉ backend làm giá trị mặc định.** `src/services/api/client.ts:11` của cổng người
   dùng rơi về `http://localhost:3001` — cổng NestJS cũ — khi thiếu biến môi trường, và hỏng im lặng
   ([B-14](bug-triage.md#b-14-ba-envexample-vẫn-trỏ-cổng-nestjs-cũ)).
5. **Đừng để một biểu mẫu báo thành công khi không gửi gì.** `ContactPage.tsx:95` có chú thích
   `// Simulate API call` rồi `setTimeout`, và nó **đang chạy trên bản phát hành**
   ([B-15](bug-triage.md#b-15-marketplace-và-contact-đang-chạy-với-dữ-liệu-bịa)). Nếu một màn hình chưa có
   backend, gỡ route của nó — bốn khu vực khác của cổng người dùng đã làm đúng như vậy.

## Phía backend

Endpoint v2 mới đặt ở đâu là câu chưa có tiền lệ: `apps/api/V1Compat/` theo thiết kế **không nhận endpoint
mới** (chú thích ở `V1ControllerBase.cs:11`), và `modules/*` hiện không khai báo endpoint nào.

Quyết định đó chưa có ADR. Hai hướng: một thư mục `apps/api/V2/` song song với `V1Compat/`, hoặc mỗi module tự
đăng ký endpoint của mình. Hướng thứ hai khớp hơn với ranh giới module (MOD-02) nhưng đổi vai trò của
`apps/api` từ "chủ mọi controller" thành "chủ pipeline". **Chốt trước khi viết endpoint đầu tiên**, vì sửa sau
là di chuyển 18 nhóm endpoint.

Những thứ đã có và không phải xây lại: khoá chống lặp, hình dạng lỗi RFC 9457, header dừng dịch vụ, cửa phân
quyền, đơn vị công việc, outbox, hàng đợi việc. Chúng tự động áp cho mọi đường ngoài `/api/v1`.

## Chạy test ở frontend

Hai repo client **trước sprint 3 không có framework test nào** — `npm test` không tồn tại, dù `CLAUDE.md` của
chúng ghi `npm test && npm run lint`. Nay cả hai có `vitest`:

| | Bảng quản trị | Cổng người dùng |
|---|---|---|
| Chạy | `npm test` | `npm test` |
| Chỗ đặt | `src/lib/api/__tests__/` | `src/services/api/__tests__/` |
| Hiện có | 19 bài | 19 bài |

Phiên bản là `vitest@^3`, không phải bản mới nhất: bản 5 đòi `vite ≥ 6.4` còn cả hai repo đang ở 6.3.5. Nâng
`vite` là một việc riêng.

Trang giới thiệu vẫn chưa có test. Nó cũng đặt `"strict": false` trong `tsconfig.json`, nên lỗi kiểu ở đó
không được trình biên dịch bắt — xem [B-22](bug-triage.md#b-22-trang-giới-thiệu-có-thể-trắng-khi-tác-giả-câu-chuyện-không-tra-được).

## Nghiệm thu trên trình duyệt

Lượt đầu tiên chạy ngày 2026-09-04. Máy dựng **đã có Playwright 1.62 và Chromium** cài sẵn, nên không cần cài
thêm gì — chỉ cần trỏ `import` vào gói đã có thay vì cài lại vào repo.

Ba bước, và bước thứ hai là chỗ mất thời gian nếu làm sai:

1. Backend ở `5199`; ba client ở ba cổng **cố định**: cổng người dùng `5173`, bảng quản trị `5174`, trang giới
   thiệu `5175` (ghim trong `vite.config.ts` của từng repo, `strictPort` — chạy trùng cổng thì thất bại to
   tiếng thay vì lặng lẽ trôi sang cổng khác). Trang giới thiệu cần `VITE_API_URL=http://localhost:5199/api/v1`
   — **kèm `/api/v1`**, khác hai client kia; một `.env` chỉ ghi gốc máy chủ cho ra 404 im lặng.
2. Địa chỉ mở trình duyệt phải khớp **đúng từng ký tự** với một mục trong `Cors:Origins`. Từ 2026-09-05 mặc
   định có sáu mục — `localhost` và `127.0.0.1` cho cả ba cổng — nên hai dạng địa chỉ Vite in ra đều chạy
   ([B-41](bug-triage.md#b-41-corsorigins-khai-localhost-nên-mở-bằng-127001-là-hỏng-im-lặng) đã sửa). Đổi
   cổng hay dùng tên máy khác thì phải thêm vào danh sách; đi nhầm thì mọi lời gọi API fail với
   `net::ERR_FAILED` — không mã trạng thái, không thân lỗi — và triệu chứng trông hệt như "backend chết".
3. Chờ đúng thứ, không chờ `networkidle`. Đây là SPA: `waitForURL` chờ sự kiện `load` sẽ không bao giờ tới, và
   đọc URL ngay sau `networkidle` là đọc **trước** khi lớp bảo vệ kịp chuyển hướng. Dùng `waitForFunction` trên
   `location`, và với ngăn chi tiết thì chờ tới khi chữ "Đang tải…" biến mất — nếu không sẽ có hai phép kiểm
   đỏ vì lý do sai.

Bốn kịch bản đã có, đều ở [`verification/anh-chup/`](verification/anh-chup/README.md) và chạy bằng
`OUT_DIR=. node <kịch bản>` từ chính thư mục đó: `ui-verify.mjs` (bảng quản trị: nhật ký kiểm toán, người
dùng), `ui-portal.mjs` (cổng người dùng: phiên hết hạn), `ui-landing.mjs` (trang giới thiệu, cần cổng `5175`),
`ui-cases.mjs` (console hồ sơ vụ việc, ảnh chụp chính sách, vòng ghép cặp, B-38, B-42), `ui-rounds.mjs` (lịch
sử vòng, chi tiết vòng, so sánh hai vòng, cảnh báo đề bài có bản mới hơn — vòng được chèn thẳng vào PostgreSQL
vì máy này không có sidecar nhúng; chỉ mục tìm kiếm nay nằm trong PostgreSQL — ADR-0010). Mỗi kịch bản tự dàn
dựng dữ liệu của nó qua API và `psql` trong container `nacentech-postgres-1`, nên chạy lại bao nhiêu lần cũng được.

**Sidecar nhúng cục bộ** (cần cho mọi phép đo ghép cặp): ảnh `dmst-rag:pinned` và volume model
`search-bench_model_cache` (4,3 GB, BGE-M3) đã có trên máy dựng —

```bash
docker run -d --name nacentech-rag -p 8003:8000 -e MODEL_DEVICE=cpu -e MODEL_CACHE_DIR=/model_cache \
  -e APP_ENV=development -v search-bench_model_cache:/model_cache dmst-rag:pinned
# ~2 phút nạp model trên CPU; sau đó `docker start nacentech-rag` là đủ. Kiểm: curl http://127.0.0.1:8003/health
```

Để có `/rerank` (cross-encoder), mount thư mục `app` của repo sidecar vào container (ảnh pinned chưa có route
đó): thêm `-v "{đường dẫn tuyệt đối tới repo}/legacy/dmst-rag-python/app:/app/app"`. Lần gọi
`/rerank` đầu tải `BAAI/bge-reranker-v2-m3` (~2,2 GB) vào cùng volume; sau đó nạp trong vài giây.

Cấu hình đích của API: `Matching__ScoringMode=CORRECTED_SCORING Matching__UseSparse=true Matching__UseRerank=true`. Ngưỡng điểm theo chế
độ (B-45): `MatchMinScore` chỉ áp cho chế độ cũ, `MatchMinScoreCorrected` (mặc định 0) cho chế độ đã sửa.
`verify-b27.sh` là lượt đo mẫu.

**Bẫy tiếng Việt trong kịch bản đo:** `curl --form-string`/`-d` trên Git Bash/Windows gửi tiếng Việt thành `?`
hoặc mojibake — dữ liệu vào đã mất dấu thì mọi phép đo về dấu đều vô nghĩa. Kịch bản tạo dữ liệu tiếng Việt
viết bằng Node (`fetch` + `FormData`), không bằng bash.

Hai điều đáng giữ từ lượt đầu:

- **Có những mục chỉ đo được qua giao diện.** `NDUNG-03` (B-26) là ví dụ mẫu: máy chủ hoàn toàn khoẻ, cái sai
  nằm ở chỗ cái nút gọi lệnh nào. Không phép đo `curl` nào nói được điều đó.
- **Đếm hàng trong PostgreSQL trước và sau khi bấm.** Với một nút từng gọi nhầm lệnh xoá, "bản ghi vẫn còn"
  là khẳng định đáng giá hơn mọi thứ đọc được trên màn hình.

## Trước khi mở PR

1. `dotnet build NacenTech.slnx -m:1` — phải sạch. Cờ `-m:1` là bắt buộc: không có nó, MSBuild rơi vào
   `MSB4166` ("Child node exited prematurely") trên máy dựng hiện tại. Và dừng tiến trình `NacenTech.Api` đang
   chạy trước khi dựng, nếu không bước chép DLL fail với `MSB3027`.
2. Năm bộ test — hiện **59/59 xanh**; giữ nguyên con số, và **thêm test cho việc vừa làm**. Cổng done của
   [ADR-0003](../../04-technical/adr/0003-khoa-do-ung-dung-sinh.md#cổng-done) đã được lấp: từ sprint 0
   có ba bài *sửa-rồi-đọc-lại* chạm PostgreSQL thật ở `tests/integration/ContentVersioningTests.cs`. Khi viết
   test cho một lỗi, **chứng minh nó bắt được lỗi** — tắt bản vá, xem test đỏ, bật lại. Một test chưa từng đỏ
   vì đúng lý do thì không phải là cổng.
3. Chạy các dòng nghiệm thu của nhóm vừa xây trong
   [`verification/api-v2-va-moi.md`](verification/api-v2-va-moi.md). Chúng là định nghĩa "xong".
4. Sửa lỗi nào thì **cập nhật dòng đó trong [`bug-triage.md`](bug-triage.md) cùng lúc**, thêm dòng Trạng thái
   nói rõ đã sửa ở đâu.
5. `python {thư mục skill}/references/check-links.py .` trong `docs-v2` — hiện **2257 liên kết, 0 hỏng**, giữ
   nguyên con số 0. Hai cái bẫy của chính công cụ này, cả hai đều làm nó báo hỏng hàng loạt trên bộ tài liệu
   không ai đụng vào:
   - Đặt `PYTHONIOENCODING=utf-8`, nếu không nó chết với `UnicodeEncodeError` ngay khi in dòng đầu tiên.
   - Bản đang có trong máy chuẩn hoá bằng **`NFKD`** rồi lọc `isalnum()`, tức là **bóc sạch dấu tiếng Việt**
     (`sống` → `song`) trong khi anchor thật giữ dấu. Nó báo 1640/2221 liên kết hỏng, gần như toàn bộ là báo
     nhầm. GitHub **không** bóc dấu; đúng phải là `NFC`. Sửa một chữ đó rồi chạy lại thì ra 0. Nếu con số nhảy
     lên hàng nghìn, hãy nghi công cụ trước khi nghi tài liệu.

## Cách gỡ một lỗi khó hiểu

Kỹ thuật đã tìm ra lỗi nặng nhất của đợt rà, ghi lại vì nó sẽ dùng lại:

```bash
docker exec nacentech-postgres-1 psql -U postgres -d nacentech -c "ALTER SYSTEM SET log_statement='all'"
docker exec nacentech-postgres-1 psql -U postgres -d nacentech -c "SELECT pg_reload_conf()"
# tái hiện lỗi
docker logs nacentech-postgres-1 --since 30s | grep -A3 'UPDATE\|INSERT'
# xong thì trả về mặc định
docker exec nacentech-postgres-1 psql -U postgres -d nacentech -c "ALTER SYSTEM RESET log_statement"
```

Với mọi lỗi 409 hoặc 500 khó hiểu, đây nên là bước đầu tiên chứ không phải bước cuối. Câu lệnh SQL thật kèm
tham số nói ngay cái mà đọc mã mất hàng giờ mới đoán ra — và trong trường hợp
[B-32](bug-triage.md#b-32-mọi-sửa-đổi-tạo-phiên-bản-nội-dung-mới-đều-thất-bại-với-409), thông điệp lỗi đang
chỉ vào một nguyên nhân hoàn toàn sai.
