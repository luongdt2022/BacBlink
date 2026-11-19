# legacy — Source cũ, chỉ để tra cứu

**Không build, không deploy, không nhận PR sửa tính năng.** Chỉ đọc để đối chiếu khi migrate nghiệp vụ sang backend .NET.

| Thư mục | Nội dung | Trạng thái |
|---|---|---|
| `dmst-backend-nestjs/` | Backend NestJS cũ | Đã bị `apps/api` (.NET 10) thay thế **một lần** theo D2-17r |
| `dmst-rag-python/` | Service RAG/BGE-M3 (FastAPI) | Vẫn dùng làm sidecar embedding — hành vi giữ nguyên, xem [README chính](../README.md#điều-gì-được-giữ-nguyên-từ-bản-nestjs) |

File `.env` chứa giá trị thật **không** được đưa vào repo; chỉ có `.env.example`.

Khi cần biết hành vi nào được giữ và hành vi nào đổi có chủ đích, đọc [README chính](../README.md) thay vì đọc mã ở đây — mã cũ không phải nguồn đúng nữa.
