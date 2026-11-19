# apps — Các ứng dụng/dịch vụ triển khai được

| Thư mục | Stack | Vai trò |
|---|---|---|
| `api/` | ASP.NET Core (.NET 10) | HTTP host: `/api/v2` (mới) và `/api/v1` (facade tương thích, sunset theo D2-148) |
| `worker/` | ASP.NET Core (.NET 10) | Outbox dispatcher, job queue, scheduled obligation (§26.5) |
| `admin/` | React + Vite | Dashboard quản trị — chuyển từ `dmst-admin` |
| `portal/` | React + Vite | Cổng người dùng — chuyển từ `dmst-user` |
| `landing/` | React + Vite | Trang giới thiệu — chuyển từ `dmst-landing-page` |

Ba frontend đang **chưa theo kịp** backend .NET. Hành vi hiện tại và khoảng cách còn lại được mô tả ở [`docs/02-requirements/san-pham-v2/`](../docs/02-requirements/san-pham-v2/); danh sách lỗi ở [`bug-triage.md`](../docs/02-requirements/san-pham-v2/bug-triage.md).

Mỗi frontend chỉ có `.env.example` trong repo — file `.env` thật không được commit.
