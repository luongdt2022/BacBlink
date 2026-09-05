# NacenTwin

Repo mới khởi tạo — khung thư mục dưới đây được dựng sẵn để chuẩn hoá cấu trúc trước khi bắt đầu code. Cấu trúc tham chiếu từ `AgenticCoreAI/ManageAgent`.

## Cấu trúc thư mục

```
docs/       Tài liệu dự án — xem chi tiết bên dưới
apps/       Các ứng dụng/dịch vụ triển khai được (API, web, worker, ...)
packages/   Thư viện/code dùng chung giữa các app
infra/      Hạ tầng, IaC (Docker, k8s, Terraform, ...)
scripts/    Script tiện ích cho dev/build/release
tests/      Test end-to-end / integration xuyên suốt nhiều app
.github/    Cấu hình GitHub (workflows CI/CD, issue template, ...)
```

### docs/ — đang dùng

| Thư mục | Mục đích |
|---|---|
| `01-vision` | Tầm nhìn, mục tiêu sản phẩm |
| `02-requirements` | Yêu cầu nghiệp vụ & hệ thống |
| `03-uiux` | UI/UX (bao gồm cả UX research và design system) |
| `04-technical` | Kiến trúc, ADR, API spec (bao gồm cả AI knowledge base và key/secret metadata) |
| `05-testing` | Kế hoạch & báo cáo kiểm thử |
| `06-deployment` | Hướng dẫn triển khai, CI/CD, môi trường |
| `07-references` | Tài liệu tham khảo, benchmark |
| `99-archive` | Lưu trữ tài liệu cũ/hết hiệu lực |

Đây là bộ rút gọn từ cấu trúc đầy đủ của ech-docs — chỉ giữ những mục dùng ngay từ đầu dự án.

### docs/ — chưa tạo, thêm khi thật sự cần

Không tạo sẵn vì hiện chưa có nội dung để đưa vào; thêm lại đúng tên khi phát sinh nhu cầu:

- `00-audit` — khi cần audit codebase/bảo mật chính thức
- `00-BCNCKT` — khi làm báo cáo nghiên cứu khả thi chính thức
- `00-print-bundle`, `_dist` — khi cần gộp/export tài liệu để in
- `08-operations` — khi đã vận hành thật, cần runbook
- `09-legal` — khi có hợp đồng/điều khoản cần theo dõi
- `10-content` — khi có nội dung/copywriting sản phẩm
- `10-partner-onboarding` — khi có đối tác cần onboarding
- `12-hdsd` — khi có sản phẩm để viết hướng dẫn sử dụng
- `13-product-description` — khi cần mô tả cho store/marketing
- `_logs` — log tự sinh, thường không cần tạo tay

## Trạng thái

- [ ] Chốt tech stack cho `apps/` và `packages/`
- [ ] Điền nội dung `docs/01-vision`
- [ ] Điền nội dung `docs/02-requirements`
- [ ] Thiết lập CI/CD trong `.github/workflows`

## Ghi chú

- **Không commit secret thật** vào repo — chỉ lưu metadata trong [`docs/04-technical/keys.md`](./docs/04-technical/keys.md) (tên key, nơi lưu trữ thật, người sở hữu).
