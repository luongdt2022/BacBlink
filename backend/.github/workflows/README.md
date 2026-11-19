# workflows

> **`ci.yml` đang tạm tắt chạy tự động** từ 2026-09-06 theo yêu cầu của chủ sản phẩm. Workflow không bị xoá và
> nội dung job giữ nguyên; chỉ trigger thu về `workflow_dispatch`. Bật lại bằng cách bỏ chú thích hai dòng
> `push`/`pull_request` ở đầu tệp — không cần sửa gì khác.
>
> Hệ quả cần biết: **không còn ai chạy test thay bạn**. Một PR có thể được merge mà chưa lần nào build. Cổng
> chặn duy nhất trong lúc này là chạy tay — xem `AGENTS.md`.

| File | Chạy khi | Làm gì |
|---|---|---|
| `ci.yml` → `build-and-test` | ~~push `main`, mọi PR~~ → **chỉ chạy tay** | Restore → build Release → 5 nhóm test .NET (architecture, invariants, authorization, contracts, integration với PostgreSQL pgvector) → migration apply sạch |
| `ci.yml` → `frontend` | ~~push `main`, mọi PR~~ → **chỉ chạy tay** | Matrix `admin` / `portal` / `landing`: `npm ci` → `npm run build` → `npm test` (admin, portal) hoặc `npm run lint` (landing, chưa có test file) |
| `ci.yml` → `license-gate` | ~~push `main`, mọi PR~~ → **chỉ chạy tay** | Denylist package (§26.8.3) + báo cáo license |
| `release.yml` → `images` | push thẻ `v*`, hoặc chạy tay | Build và đẩy 3 ảnh (`api`, `worker`, `legacy-etl`) lên `ghcr.io`, dùng chung `Dockerfile` ở root — **không đổi** |

`release.yml` dừng ở chỗ **có ảnh gắn thẻ**, không deploy lên máy chủ nào — hạ tầng đích chưa chốt. Danh sách còn thiếu để lên production ở [`docs/06-deployment/README.md`](../../docs/06-deployment/README.md#còn-thiếu-để-lên-được-production).

## Chưa có

- **Deploy frontend**: mỗi app còn giữ `apps/<tên>/.github/workflows/deploy.yml` từ repo cũ — workflow lồng trong thư mục con **không được GitHub chạy**, và nội dung của chúng là deploy lên self-hosted runner của SotaTek (`/home/sotatek/projects/dmst/...`) nên không dùng lại được nguyên trạng.
- **Deploy backend lên môi trường thật**: cần chốt nơi chạy + quản lý secret + lưu trữ S3 trước.
