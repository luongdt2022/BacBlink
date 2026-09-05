# workflows

| File | Chạy khi | Làm gì |
|---|---|---|
| `ci.yml` → `build-and-test` | push `main`, mọi PR | Restore → build Release → 5 nhóm test .NET (architecture, invariants, authorization, contracts, integration với PostgreSQL pgvector) → migration apply sạch |
| `ci.yml` → `frontend` | push `main`, mọi PR | Matrix `admin` / `portal` / `landing`: `npm ci` → `npm run build` → `npm test` (admin, portal) hoặc `npm run lint` (landing, chưa có test file) |
| `ci.yml` → `license-gate` | push `main`, mọi PR | Denylist package (§26.8.3) + báo cáo license |

## Chưa có

- **Deploy frontend**: mỗi app còn giữ `apps/<tên>/.github/workflows/deploy.yml` từ repo cũ — workflow lồng trong thư mục con **không được GitHub chạy**, và nội dung của chúng là deploy lên self-hosted runner của SotaTek (`/home/sotatek/projects/dmst/...`) nên không dùng lại được nguyên trạng.
- **Deploy**: chưa có workflow deploy cho backend .NET; `docker-compose.yml` ở root là môi trường dev/diễn tập, không phải production.
