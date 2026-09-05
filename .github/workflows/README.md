# workflows

| File | Chạy khi | Làm gì |
|---|---|---|
| `ci.yml` | push `main`, mọi PR | Restore → build Release → 5 nhóm test .NET (architecture, invariants, authorization, contracts, integration với PostgreSQL service) → migration apply sạch → gate license/denylist (§26.8.3) |

## Chưa có

- **CI cho ba frontend** (`apps/admin`, `apps/portal`, `apps/landing`): chưa có job `npm ci && npm run build && npm test`. Mỗi app còn giữ `apps/<tên>/.github/workflows/deploy.yml` từ repo cũ — workflow lồng trong thư mục con **không được GitHub chạy**, và nội dung của chúng là deploy lên self-hosted runner của SotaTek (`/home/sotatek/projects/dmst/...`) nên không dùng lại được nguyên trạng.
- **Deploy**: chưa có workflow deploy cho backend .NET; `docker-compose.yml` ở root là môi trường dev/diễn tập, không phải production.
