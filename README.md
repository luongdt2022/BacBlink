# NacenTwin

Nền tảng NacenTech ĐMST. Code chính là **backend ASP.NET Core (.NET 10)** tại `apps/api` + `apps/worker`, cùng ba frontend đang được chuyển sang. Backend này thay thế NacenTwin/NestJS **một lần** theo D2-17r — không có giai đoạn hai stack chạy song song; bản NestJS cũ nằm ở `legacy/` chỉ để tra cứu.

Kiến trúc đích: [`docs/04-technical/NACENTECH_ARCHITECTURE_V2.md`](./docs/04-technical/NACENTECH_ARCHITECTURE_V2.md) (V2.21).

## Chạy nhanh

```bash
# 1. PostgreSQL (ảnh phải có extension vector: pgvector/pgvector:pg16)
docker compose up -d postgres

# 2. Áp schema
dotnet tool install --global dotnet-ef --version 10.*
dotnet ef database update \
  --project packages/persistence/NacenTech.Persistence.csproj \
  --startup-project apps/api/NacenTech.Api.csproj \
  --connection "Host=localhost;Port=55440;Database=baclink_dev;Username=postgres;Password=postgres"

# 3. API (cổng 5199) và worker
cd apps/api && ASPNETCORE_URLS=http://127.0.0.1:5199 \
  ConnectionStrings__Postgres="Host=localhost;Port=55440;Database=baclink_dev;Username=postgres;Password=postgres" \
  Auth__SigningKey="doi-khoa-nay-va-dai-it-nhat-32-byte" dotnet run

cd apps/worker && ConnectionStrings__Postgres="..." dotnet run
```

`Auth:SigningKey` **không có giá trị mặc định**: thiếu là fail-fast. NacenTwin/NestJS dùng `fallback_secret` khi thiếu biến môi trường — đó là một trong các nợ an toàn tại §26.1.8 và không được mang sang.

## Cấu trúc thư mục

```
apps/         Ứng dụng triển khai được — .NET (api, worker) + 3 frontend
modules/      12 module nghiệp vụ Phase 1, mỗi module một schema PostgreSQL
packages/     Thư viện dùng chung của backend .NET
tests/        architecture, invariants, authorization, contracts, integration
tools/        ETL cutover, bench tìm kiếm
legacy/       Source cũ chỉ để tra cứu, không build, không deploy
infra/        Hạ tầng & schema DB
config/       Policy, profile, taxonomy có phiên bản
scripts/      Script tiện ích (xuất bản tài liệu)
docs/         Tài liệu dự án — xem bảng bên dưới
.github/      CI/CD
```

### apps/ — chi tiết

| Thư mục | Vai trò |
|---|---|
| `apps/api` | HTTP host: `/api/v2` (mới) và `/api/v1` (facade tương thích NestJS, sunset theo D2-148) |
| `apps/worker` | Outbox dispatcher, job queue, scheduled obligation (§26.5) |
| `apps/admin` | Dashboard quản trị (React/Vite) — chuyển từ `dmst-admin` |
| `apps/portal` | Cổng người dùng (React/Vite) — chuyển từ `dmst-user` |
| `apps/landing` | Trang giới thiệu (React/Vite) — chuyển từ `dmst-landing-page` |

### packages/ — chi tiết

| Thư mục | Vai trò |
|---|---|
| `packages/kernel` | Abstraction dùng chung: aggregate, UnitOfWork, actor, subject, storage, audit |
| `packages/contracts` | Canonical JSON (RFC 8785), Money, integration event, job, prompt |
| `packages/policy-engine` | `DecisionTable` có version, default DENY, trả `ruleId` (§23.2, D2-21) |
| `packages/persistence` | **Một** `DbContext` duy nhất, outbox/job/scheduler, migration (MOD-05) |
| `packages/test-kit` | Tiện ích dùng chung cho test |

### docs/

| Thư mục | Nội dung |
|---|---|
| `01-vision` | Đề xuất nền tảng, mục tiêu sản phẩm, proposal SotaTek |
| `02-requirements` | [`san-pham-v2/`](./docs/02-requirements/san-pham-v2/) — mô tả hành vi đầy đủ 3 frontend + đặc tả cái còn thiếu; bộ câu hỏi khảo sát |
| `03-uiux` | Sổ tay thương hiệu |
| `04-technical` | Kiến trúc V2, kiến trúc hệ thống chuẩn, 10 ADR, quy ước viết mã, glossary |
| `05-testing` | Sổ lỗi và tiêu chí nghiệm thu |
| `06-deployment` | Hướng dẫn triển khai, bàn giao |
| `07-references` | Phân tích mô hình Hàn Quốc, báo cáo rà soát 08/2026 |
| `99-archive` | Bản nháp cũ, tài liệu đã xuất bản (docx/pdf/html) |

> `docs/02-requirements/san-pham-v2/` được giữ nguyên khối thay vì tách theo chủ đề: 61 file trong đó liên kết chéo nhau qua 1920 link tương đối. Các thư mục `04-technical`, `05-testing`, `06-deployment` có README trỏ vào đúng phần tương ứng bên trong.

## Đọc trước khi sửa bất cứ thứ gì

- [`san-pham-v2/BAN-GIAO.md`](./docs/02-requirements/san-pham-v2/BAN-GIAO.md) — xây gì, theo thứ tự nào, quyết định phải ra trước
- [`san-pham-v2/bug-triage.md`](./docs/02-requirements/san-pham-v2/bug-triage.md) — 34 mục lỗi, 12 mức cao. Sửa cái nào thì cập nhật dòng đó **cùng PR**
- [`san-pham-v2/api-v2/`](./docs/02-requirements/san-pham-v2/api-v2/) — đặc tả 18 nhóm endpoint chưa tồn tại
- [`san-pham-v2/verification/api-v2-va-moi.md`](./docs/02-requirements/san-pham-v2/verification/api-v2-va-moi.md) — 487 tiêu chí nghiệm thu viết trước; chạy nhóm tương ứng **trước** khi nhận sprint
- [`docs/04-technical/CONVENTIONS.md`](./docs/04-technical/CONVENTIONS.md) — quy ước viết mã

## Điều gì được giữ nguyên từ bản NestJS

- **Hành vi API v1**: mã lỗi (`INVALID_CREDENTIALS`, `ACCOUNT_NOT_ACTIVATED`…), shape JSON, status code.
- **Python RAG/BGE-M3**: không đổi; embedding vẫn qua sidecar. **Elasticsearch đã gỡ** (ADR-0010): chỉ mục tìm kiếm là `matching.search_chunks` trong PostgreSQL — pgvector cho kênh dense, `tsvector` có `unaccent` cho kênh từ khoá, RRF ở chế độ đã sửa.
- **Chunking**: port `RecursiveCharacterTextSplitter` giữ nguyên biên chunk để so sánh chất lượng có nghĩa.
- **Prompt beautify**: giữ nguyên văn để đầu ra không đổi.
- **Mật khẩu**: bcrypt hash nhập nguyên dạng, rehash sang PBKDF2 ở lần đăng nhập đầu (D2-150).

## Điều gì đổi có chủ đích (KEEP_WITH_CHANGE)

| Thay đổi | Lý do |
|---|---|
| Endpoint `/ai/*` yêu cầu đăng nhập | Legacy để mở, ai cũng gọi được model bằng khóa hệ thống (§26.1.8) |
| Accept lời mời hợp tác không tự loại lời mời khác | AC 24: exclusivity phải có DecisionRecord riêng |
| Admin tạo user phải đặt mật khẩu | Legacy mặc định `12345678` |
| Sửa nội dung tạo version mới | §30.3: ghi đè làm mất căn cứ quyết định |
| Tài liệu mật đi qua data room + AccessGrant | Legacy chỉ có cột `confidential_level`, không kiểm soát ai đọc |
| Hàng đợi ở PostgreSQL thay BullMQ/Redis | D2-145: enqueue nằm trong cùng transaction với ghi dữ liệu |
| Xóa intake là soft delete | Legacy xóa cứng cả attachment |

## Cutover (§30.2)

```bash
# Chạy thử, không ghi
dotnet run --project tools/legacy-etl -- \
  --Etl:SourceConnectionString="Host=...;Database=dmst_poc;Username=...;Password=..." \
  --Etl:LegacyUploadsPath="/path/to/legacy/uploads" \
  --Etl:DryRun=true

# Chạy thật; exit code khác 0 nếu báo cáo đối soát chưa sạch
dotnet run --project tools/legacy-etl -- --Etl:SourceConnectionString="..." --Etl:LegacyUploadsPath="..."
```

Báo cáo ghi vào `artifacts/etl/`. Runbook đầy đủ chín bước ở §30.2 của tài liệu kiến trúc; ETL chỉ là bước 3–4.

## Test

```bash
dotnet test tests/architecture/NacenTech.Tests.Architecture.csproj   # MOD-01…05
dotnet test tests/invariants/NacenTech.Tests.Invariants.csproj       # ma trận §7.4, CASE-01…14
dotnet test tests/authorization/NacenTech.Tests.Authorization.csproj # AC 5/17/28
dotnet test tests/contracts/NacenTech.Tests.Contracts.csproj         # canonical hash (AC 31)
NACENTECH_TEST_PG="Host=localhost;Port=55440;Database=baclink_dev;Username=postgres;Password=postgres" \
  dotnet test tests/integration/NacenTech.Tests.Integration.csproj   # audit DENY, job dedup
```

Không đặt `NACENTECH_TEST_PG` thì integration test tự khởi PostgreSQL bằng Testcontainers.

## Còn thiếu so với kiến trúc đích

Phase 1 chỉ mở phần lõi. Chưa có trong mã: evaluation/deal/execution/outcome, finance/program/billing, expert network, professional services, adoption, evidence passport, partner network, government fabric, `CapabilityProfileVersion`, crypto-shredding, Object Lock. Đó là `SCALE_AFTER_EVIDENCE`/`DEFERRED_OPTION` theo §9.4.2 — có trong kiến trúc đích, không nằm trong release này.

## Phát hành

`.github/workflows/release.yml` build và đẩy ba ảnh lên GHCR khi push thẻ `v*` hoặc chạy tay:
`ghcr.io/nacentwin/nacentwin/{api,worker,legacy-etl}`. Cả ba dùng chung `Dockerfile` ở root, chọn bằng `--build-arg APP`.

Workflow dừng ở chỗ **có ảnh gắn thẻ**, không deploy — hạ tầng đích chưa chốt. Danh sách còn thiếu để lên production ở [`docs/06-deployment/README.md`](./docs/06-deployment/README.md#còn-thiếu-để-lên-được-production).

## Ghi chú

- **Không commit secret thật.** Các file `.env` của ba frontend và backend cũ đã **không** được đưa vào repo; chỉ có `.env.example`. Metadata key ghi ở [`docs/04-technical/keys.md`](./docs/04-technical/keys.md).
- `legacy/` không build, không deploy, không nhận PR sửa tính năng — chỉ đọc để đối chiếu khi migrate nghiệp vụ.
