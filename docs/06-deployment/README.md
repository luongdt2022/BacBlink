# 06-deployment — Triển khai

Hướng dẫn triển khai, cấu hình CI/CD, mô tả môi trường (dev/staging/production).

## Nội dung hiện có nằm trong `san-pham-v2/`

Hai tài liệu triển khai/bàn giao là một phần của khối `docs/02-requirements/san-pham-v2/` (giữ nguyên khối để không vỡ ~1920 link chéo):

| Tài liệu | Nội dung |
|---|---|
| [`san-pham-v2/HUONG-DAN-TRIEN-KHAI.md`](../02-requirements/san-pham-v2/HUONG-DAN-TRIEN-KHAI.md) | Dựng bản chạy thật, cổng DONE, nghiệm thu trên trình duyệt |
| [`san-pham-v2/BAN-GIAO.md`](../02-requirements/san-pham-v2/BAN-GIAO.md) | Xây gì, theo thứ tự nào, quyết định phải ra trước |

Các nguồn khác:

- Chạy nhanh backend .NET + cutover ETL: [README chính](../../README.md#chạy-nhanh)
- Compose/Dockerfile: [`docker-compose.yml`](../../docker-compose.yml), [`Dockerfile`](../../Dockerfile) tại root
- Schema PostgreSQL: [`infra/db/schema.sql`](../../infra/db/schema.sql)
- CI: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
