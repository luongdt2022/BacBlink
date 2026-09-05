# AGENTS.md — NacenTwin

Repo này là **backend ASP.NET Core .NET 10** (root = solution `NacenTech.slnx`) cộng ba frontend React trong `apps/`. Đọc theo thứ tự:

1. [`README.md`](README.md) — chạy nhanh, cấu trúc, cái gì giữ / cái gì đổi so với bản NestJS
2. [`docs/04-technical/CONVENTIONS.md`](docs/04-technical/CONVENTIONS.md) — quy ước mã .NET (MOD-01…05, một DbContext, không gọi I/O trước commit…)
3. [`docs/02-requirements/san-pham-v2/BAN-GIAO.md`](docs/02-requirements/san-pham-v2/BAN-GIAO.md) — xây gì, theo thứ tự nào
4. [`docs/02-requirements/san-pham-v2/bug-triage.md`](docs/02-requirements/san-pham-v2/bug-triage.md) — sổ lỗi duy nhất; sửa mục nào thì cập nhật dòng đó **cùng PR**

## Quy tắc cứng

- **Không commit secret.** Chỉ `.env.example`; giá trị thật đi qua biến môi trường. `Auth:SigningKey` không có mặc định — thiếu là fail-fast, đúng như thiết kế.
- **`legacy/` chỉ đọc.** Không build, không sửa, không deploy. Backend NestJS đã bị thay **một lần**; muốn biết hành vi nào giữ/đổi thì đọc README, không đọc mã cũ.
- **Nguồn đúng cho hành vi** là `docs/02-requirements/san-pham-v2/`; **nguồn đúng cho schema API** là OpenAPI sinh tự động khi API chạy. Mã không phải nguồn đúng cho hành vi.
- **Quyết định kiến trúc** ghi ở `docs/04-technical/adr/` — thêm ADR mới theo số kế tiếp, không sửa ADR đã `ACCEPTED`.
- **Kiểm thử là cổng chặn**: `dotnet test` cả 5 project trong `tests/` phải xanh trước khi nhận PR; CI ở `.github/workflows/ci.yml` là điều kiện merge.
- Frontend: mỗi app có `AGENTS.md` riêng trong `apps/<tên>/`, đọc nó trước khi sửa app đó.

## Lệnh hay dùng

```bash
dotnet build NacenTech.slnx
dotnet test tests/architecture/NacenTech.Tests.Architecture.csproj
cd apps/admin && npm ci && npm run build && npm test
```
