# 06-deployment — Triển khai

Hướng dẫn triển khai, cấu hình CI/CD, mô tả môi trường (dev/staging/production).

## Đóng gói ảnh

[`.github/workflows/release.yml`](../../.github/workflows/release.yml) build và đẩy ba ảnh lên GitHub Container Registry khi push thẻ `v*` hoặc chạy tay:

| Ảnh | Từ | Vai trò |
|---|---|---|
| `ghcr.io/nacentwin/nacentwin/api` | `apps/api` | HTTP host `/api/v2` + facade `/api/v1` |
| `ghcr.io/nacentwin/nacentwin/worker` | `apps/worker` | Outbox dispatcher, job queue, scheduled obligation |
| `ghcr.io/nacentwin/nacentwin/legacy-etl` | `tools/legacy-etl` | ETL cutover một chiều (§30.2) |

Cả ba dùng chung [`Dockerfile`](../../Dockerfile) ở root, chọn bằng `--build-arg APP`. Ảnh chạy bằng user không đặc quyền `nacentech` (uid 10001), `config/` đi cùng ảnh vì rule set authorization là dữ liệu vận hành có phiên bản (§9.4.3).

Build tay:

```bash
docker build -t nacentech-api --build-arg APP=apps/api --build-arg ASSEMBLY=NacenTech.Api .
docker build -t nacentech-worker --build-arg APP=apps/worker --build-arg ASSEMBLY=NacenTech.Worker .
```

> [`.dockerignore`](../../.dockerignore) ở root loại ba frontend, `legacy/` và `docs/` khỏi build context. Không có nó, `node_modules` của ba app React (~1GB) bị gửi sang Docker daemon mỗi lần build backend.

## Môi trường dev / diễn tập cutover

[`docker-compose.yml`](../../docker-compose.yml) ở root: PostgreSQL (`pgvector/pgvector:pg16`, ADR-0010) + api + worker.

```bash
export AUTH_SIGNING_KEY="$(openssl rand -base64 32)"   # bắt buộc, không có mặc định
docker compose up -d
```

**Đây không phải cấu hình production.** Header của file ghi rõ: production cần S3 + Object Lock (D2-24), KMS, và secret không nằm trong file.

## Còn thiếu để lên được production

Không có cái nào trong repo, và không cái nào suy ra được từ mã — cần quyết định hạ tầng trước:

- **Nơi chạy**: chưa chốt (k8s? VM + compose? App Service?). `infra/` mới chỉ có `db/schema.sql`.
- **Quản lý secret**: `Auth:SigningKey`, `ConnectionStrings:Postgres`, thông tin SMTP. Compose đang đọc từ biến môi trường; production cần KMS/secret manager.
- **Lưu trữ tài liệu**: `ObjectStorage` hiện ghi xuống volume `/app/storage`. §26 và D2-24 yêu cầu S3 có Object Lock cho tài liệu vụ việc.
- **Sidecar embedding**: `Matching:EmbeddingBaseUrl` trỏ `host.docker.internal:8003` — mã nguồn ở [`legacy/dmst-rag-python`](../../legacy/dmst-rag-python/), chưa có ảnh phát hành.
- **Deploy ba frontend**: mỗi app còn `apps/<tên>/.github/workflows/deploy.yml` từ repo cũ — workflow lồng trong thư mục con **không được GitHub chạy**, và nội dung là deploy lên self-hosted runner của SotaTek (`/home/sotatek/projects/dmst/...`).
- **Migration khi phát hành**: `Api:MigrateOnStartup=true` hợp cho dev. Production nên tách bước migration ra khỏi lúc khởi động app.

## Tài liệu triển khai chi tiết nằm trong `san-pham-v2/`

Giữ nguyên khối để không vỡ ~1900 link chéo:

| Tài liệu | Nội dung |
|---|---|
| [`san-pham-v2/HUONG-DAN-TRIEN-KHAI.md`](../02-requirements/san-pham-v2/HUONG-DAN-TRIEN-KHAI.md) | Dựng bản chạy thật, cổng DONE, nghiệm thu trên trình duyệt |
| [`san-pham-v2/BAN-GIAO.md`](../02-requirements/san-pham-v2/BAN-GIAO.md) | Xây gì, theo thứ tự nào, quyết định phải ra trước |

Các nguồn khác: [chạy nhanh backend + cutover ETL](../../README.md#chạy-nhanh), [`infra/db/schema.sql`](../../infra/db/schema.sql), [`.github/workflows/`](../../.github/workflows/README.md).
