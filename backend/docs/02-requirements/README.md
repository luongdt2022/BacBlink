# 02-requirements — Yêu cầu

Yêu cầu nghiệp vụ (business requirements) và yêu cầu hệ thống (functional/non-functional requirements).

| Thư mục | Nội dung |
|---|---|
| [`san-pham-v2/`](./san-pham-v2/) | Bộ mô tả sản phẩm V2 — 61 file, nguồn đúng cho **hành vi** sản phẩm |
| [`khao-sat/`](./khao-sat/) | Bộ câu hỏi khảo sát sản phẩm thực tế theo lĩnh vực (CSV) |

## Vì sao `san-pham-v2/` không bị tách nhỏ

Bộ này mô tả hành vi ba bề mặt (admin, portal, landing) từ phía người dùng, kèm đặc tả phần chưa xây. 61 file trong đó liên kết chéo nhau qua **1920 link tương đối** — tách theo chủ đề sẽ vỡ gần hết. Nó được giữ nguyên khối tại đây vì bản chất chính là đặc tả yêu cầu; các thư mục khác trỏ vào đúng phần của mình:

| Phần | Thuộc về | README trỏ tới |
|---|---|---|
| `api-v2/`, `nen-tang/`, `xuyen-suot/` | Kỹ thuật | [`04-technical`](../04-technical/README.md) |
| `bug-triage.md`, `verification/`, `bmad/` | Kiểm thử | [`05-testing`](../05-testing/README.md) |
| `HUONG-DAN-TRIEN-KHAI.md`, `BAN-GIAO.md` | Triển khai | [`06-deployment`](../06-deployment/README.md) |
| `admin/`, `portal/`, `landing/`, `moi/` | Yêu cầu | tại đây |

Bắt đầu đọc từ [`san-pham-v2/README.md`](./san-pham-v2/README.md).
