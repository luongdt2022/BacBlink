# infra — Hạ tầng & IaC

| Đường dẫn | Nội dung |
|---|---|
| `db/schema.sql` | Schema PostgreSQL đầy đủ (sinh từ migration của `packages/persistence`) |

Compose và image nằm ở root: [`docker-compose.yml`](../docker-compose.yml), [`Dockerfile`](../Dockerfile).

Ảnh PostgreSQL phải có extension `vector` (`pgvector/pgvector:pg16`) — chỉ mục tìm kiếm dùng pgvector cho kênh dense và `tsvector` có `unaccent` cho kênh từ khoá (ADR-0010).
