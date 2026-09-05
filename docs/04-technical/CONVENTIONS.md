# Quy ước mã nguồn NacenTech V2 (.NET 10)

Tài liệu gốc: [`NACENTECH_ARCHITECTURE_V2.md`](./NACENTECH_ARCHITECTURE_V2.md) (V2.20). Mọi quy ước dưới đây là hệ quả trực tiếp của §9.1, §9.2 (MOD-01…05), §23.2, §26.3, §26.7, D2-147.

## 1. Cấu trúc

- **Module là một project** `modules/<name>/NacenTech.Modules.<Name>.csproj`, namespace gốc `NacenTech.Modules.<Name>`.
- Trong module có ba thư mục/namespace: `Domain/` (C# thuần, **không** EF/ASP.NET type), `Application/` (service, DTO, interface public, event/job handler), `Infrastructure/` (EF `IEntityTypeConfiguration`, adapter HTTP/SMTP/disk).
- `Application/Contracts.cs` là **public application interface** của module (MOD-02). Module khác chỉ được dùng file này qua… không gì cả: module **không tham chiếu assembly module khác**. Lookup xuyên module đi qua Kernel (`ISubjectResolver`, `IPersonDirectory`, `ITaxonomyNameResolver`, `IMatchingPreferenceProvider`) và integration event trong `NacenTech.Contracts.Events`.
- Host (`apps/api`, `apps/worker`, `tools/legacy-etl`) và `packages/persistence` là những nơi duy nhất tham chiếu nhiều module.

## 2. Persistence (MOD-01, MOD-02, MOD-05)

- **Một DbContext duy nhất** `NacenTechDbContext` ở `packages/persistence`. Module **không** tạo DbContext; inject `Microsoft.EntityFrameworkCore.DbContext` (đã đăng ký trỏ về context chung) và dùng `db.Set<T>()`.
- Mỗi module có schema PostgreSQL riêng = `IModule.Schema`. Mọi `IEntityTypeConfiguration<T>` phải gọi `ToTable("ten_bang", "<schema>")`. Tên bảng/cột được chuyển snake_case tự động; đặt tên PascalCase trong C#.
- **Không** gọi `BeginTransaction`, **không** `SaveChanges` trực tiếp trong module. Kết thúc command bằng `await uow.CommitAsync(ct)` (`IUnitOfWork`). Một command = một commit.
- **Không** gọi HTTP/SMTP/đĩa bên trong command trước khi commit (MOD-03). Tác vụ ngoài đi qua `IJobQueue.Enqueue(job)` hoặc event trong outbox; worker thực hiện sau commit.
- Aggregate kế thừa `AggregateRoot` (`Version`, `CreatedAt`, `UpdatedAt`, `Legacy`). `Version` được UnitOfWork tự tăng; concurrency = `ConcurrencyException`.
- Phát sự kiện bằng `Raise(new XxxEvent(...))` trong aggregate với record từ `NacenTech.Contracts.Events`; UnitOfWork chuyển vào outbox cùng transaction.
- Kiểu cột: `jsonb` cho payload/document (`HasColumnType("jsonb")`), `Guid[]`/`float[]` map trực tiếp sang `uuid[]`/`real[]` (Npgsql).
- Không join xuyên schema trong write path (§9.1). Read model/reporting được phép projection riêng.

## 3. Authorization (§23.2, D2-21)

- Quyết định tại **application service**: `gate.Require(new AuthorizationRequest(Actions.X, actor.PlatformRole, organizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None, ...), "ObjectKind", id)`.
- `Actions` và `Purposes` ở `NacenTech.PolicyEngine`. Thêm action = thêm rule vào `config/policies/authorization-rules.v1.json`, không thêm `if`.
- Tài liệu mật: module dataroom kiểm AccessGrant bằng SQL (tầng 2) rồi truyền `accessGrantVerified: true`; **không** nạp grant vào DecisionTable.
- `ICurrentActor` là actor của request; worker dùng `SystemActor`.

## 4. Lỗi

- Chỉ ném exception trong `NacenTech.Kernel.Domain`: `NotFoundException`, `ForbiddenException`, `UnauthorizedException`, `ConflictException`, `UnprocessableException`, `ValidationException`, `RateLimitedException`, `ConcurrencyException`. Mã (`Code`) ổn định, facade v1 và API v2 map sang HTTP.

## 5. Sự kiện & job

- Handler: `IIntegrationEventHandler<TEvent>` / `IJobHandler<TJob>` đăng ký scoped trong `XModule.ConfigureServices`. Handler được gọi trong scope riêng và **không** tự commit — dispatcher commit sau khi mọi handler chạy xong. Handler phải idempotent theo `EventId`/business key.
- Job record implement `IJob`, serialize được bằng System.Text.Json (dùng string cho `SubjectRef` nếu cần: `subject.ToString()`/`SubjectRef.Parse`).

## 6. ETL (§30.1–30.3)

- Mỗi module có `Application/Importing.cs` với `I<Module>Importer`. Import giữ UUID legacy (`OverrideId`), timestamps gốc và `LegacyRef` (`ApplyLegacy`), **không** phát event, idempotent theo `Legacy.LegacyId` (gọi lại = cập nhật).

## 7. Kiểm thử

- `tests/architecture`: NetArchTest kiểm MOD-01…05, không phụ thuộc chéo module, Domain không dùng EF.
- `tests/invariants`: ma trận transition §7.4, DecisionTable exhaustive.
- `tests/contracts`: replay golden recording `/api/v1`.

## 8. License (§26.8)

Chỉ thêm package trong `Directory.Packages.props`; permissive only. Không MediatR≥13, AutoMapper≥15, FluentAssertions≥8, MassTransit v9, Duende, ABP.
