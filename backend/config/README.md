# config — Cấu hình vận hành có phiên bản

Đây là **dữ liệu vận hành**, không phải mã (§9.4.3: cấu hình có schema, có version, có effective date). Dockerfile `COPY config/` vào ảnh nên mọi thay đổi ở đây đi cùng một lần phát hành.

| Thư mục | Trạng thái | Nội dung |
|---|---|---|
| `policies/` | **Đang dùng** | `authorization-rules.v1.json` — `DecisionTable` của policy engine. Nạp qua `Authorization:RuleSetPath`, mặc định trỏ chính file này (xem [`RuleSetLoader.cs`](../packages/policy-engine/RuleSetLoader.cs)) |
| `profiles/` | **Trống, để dành** | `CapabilityProfileVersion` — thuộc `SCALE_AFTER_EVIDENCE` §9.4.2, chưa có trong Phase 1 |
| `taxonomies/` | **Trống, để dành** | Taxonomy có phiên bản; hiện taxonomy nằm trong DB, chưa tách ra file cấu hình |

Hai thư mục trống giữ `.gitkeep` để cấu trúc không biến mất khi clone — git không track thư mục rỗng, mà `Dockerfile` lại `COPY config/` nguyên khối.

Thêm rule mới thì sửa `policies/authorization-rules.v1.json`, **không** thêm `if` trong mã — xem [CONVENTIONS.md §3](../docs/04-technical/CONVENTIONS.md).
