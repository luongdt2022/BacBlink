using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Identity.Application;

public sealed class PersonService(
    DbContext db,
    IUnitOfWork uow,
    ICurrentActor actor,
    IAuthorizationGate gate,
    IPasswordHasher hasher,
    IClock clock) : IPersonService
{
    public async Task<PersonDto> GetAsync(Guid id, CancellationToken ct)
    {
        RequireRead(id);
        return PersonMapper.ToDto(await LoadAsync(id, ct));
    }

    public async Task<PersonDto?> FindAsync(Guid id, CancellationToken ct)
    {
        var p = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return p is null ? null : PersonMapper.ToDto(p);
    }

    public async Task<PersonDto?> FindByEmailAsync(string email, CancellationToken ct)
    {
        var normalized = Person.Normalize(email);
        var p = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(x => x.Email == normalized, ct);
        return p is null ? null : PersonMapper.ToDto(p);
    }

    public async Task<IReadOnlyDictionary<Guid, PersonDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, PersonDto>();
        var list = await db.Set<Person>().AsNoTracking().Where(p => ids.Contains(p.Id)).ToListAsync(ct);
        return list.ToDictionary(p => p.Id, PersonMapper.ToDto);
    }

    /// <summary>Dùng bởi JwtBearer OnTokenValidated — không gate (chưa có actor context hoàn chỉnh).</summary>
    public Task<bool> IsActiveAsync(Guid id, CancellationToken ct)
        => db.Set<Person>().AsNoTracking().AnyAsync(p => p.Id == id && p.IsActive, ct);

    public async Task<PersonDto> UpdateProfileAsync(Guid id, UpdateProfileCommand command, CancellationToken ct)
    {
        RequireWriteSelf(id);
        var person = await LoadAsync(id, ct);
        person.UpdateProfile(command.FirstName, command.LastName, command.Phone, command.Organization);
        await uow.CommitAsync(ct);
        return PersonMapper.ToDto(person);
    }

    public async Task<PersonPreferencesDto> GetPreferencesAsync(Guid id, CancellationToken ct)
    {
        RequireRead(id);
        return PersonMapper.ToPreferences(await LoadAsync(id, ct));
    }

    public async Task<PersonPreferencesDto> UpdatePreferencesAsync(Guid id, bool? matchingAuto, CancellationToken ct)
    {
        RequireWriteSelf(id);
        var person = await LoadAsync(id, ct);
        if (matchingAuto is { } value) person.SetMatchingAuto(value, clock.UtcNow);
        await uow.CommitAsync(ct);
        return PersonMapper.ToPreferences(person);
    }

    public async Task<PersonDto> AdminCreateAsync(AdminCreatePersonCommand command, CancellationToken ct)
    {
        RequireAdmin(null);
        // KEEP_WITH_CHANGE so với legacy: bỏ mật khẩu mặc định "12345678" (nợ an toàn §26.1.8).
        if (string.IsNullOrWhiteSpace(command.Password))
            throw new ValidationException("password is required");

        var normalized = Person.Normalize(command.Email);
        if (await db.Set<Person>().AnyAsync(p => p.Email == normalized, ct))
            throw new ConflictException("Email already in use", AuthCodes.EmailAlreadyInUse);

        var person = Person.Register(normalized, hasher.Hash(command.Password), hasher.CurrentAlgorithm,
            command.FirstName, command.LastName, command.Phone, command.Organization, command.IsActive ?? true);
        db.Add(person);
        await uow.CommitAsync(ct);
        return PersonMapper.ToDto(person);
    }

    public async Task<PagedResult<PersonDto>> AdminListAsync(PageRequest page, string? search, string status, CancellationToken ct)
    {
        RequireAdmin(null);
        var q = db.Set<Person>().AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            q = q.Where(p =>
                (p.FirstName != null && EF.Functions.ILike(p.FirstName, pattern)) ||
                (p.LastName != null && EF.Functions.ILike(p.LastName, pattern)) ||
                EF.Functions.ILike(p.Email, pattern) ||
                (p.OrganizationName != null && EF.Functions.ILike(p.OrganizationName, pattern)));
        }

        q = status switch
        {
            "active" => q.Where(p => p.IsActive),
            "inactive" => q.Where(p => !p.IsActive),
            _ => q,
        };

        var total = await q.CountAsync(ct);
        var data = await q.OrderByDescending(p => p.CreatedAt).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<PersonDto>(data.Select(PersonMapper.ToDto).ToList(), total, page.Page, page.Limit);
    }

    public async Task<PersonDto> AdminUpdateAsync(Guid id, AdminUpdatePersonCommand command, CancellationToken ct)
    {
        RequireAdmin(id);
        var person = await LoadAsync(id, ct);
        person.UpdateProfile(command.FirstName, command.LastName, command.Phone, command.Organization);
        if (command.IsActive is { } active) person.SetActive(active);
        await uow.CommitAsync(ct);
        return PersonMapper.ToDto(person);
    }

    public async Task AdminResetPasswordAsync(Guid id, string newPassword, CancellationToken ct)
    {
        RequireAdmin(id);
        if (string.IsNullOrWhiteSpace(newPassword)) throw new ValidationException("newPassword is required");
        var person = await LoadAsync(id, ct);
        person.AdminResetPassword(hasher.Hash(newPassword), hasher.CurrentAlgorithm);
        await uow.CommitAsync(ct);
    }

    private async Task<Person> LoadAsync(Guid id, CancellationToken ct)
        => await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == id, ct) ?? throw new NotFoundException("User not found");

    private void RequireRead(Guid id)
    {
        var relation = actor.PersonId == id ? OrganizationRelations.Owner : OrganizationRelations.None;
        var action = relation == OrganizationRelations.Owner ? Actions.PersonReadSelf : Actions.PersonAdminManage;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole, OrganizationRelation: relation), "Person", id);
    }

    private void RequireWriteSelf(Guid id)
    {
        var relation = actor.PersonId == id ? OrganizationRelations.Owner : OrganizationRelations.None;
        var action = relation == OrganizationRelations.Owner ? Actions.PersonUpdateSelf : Actions.PersonAdminManage;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole, OrganizationRelation: relation), "Person", id);
    }

    private void RequireAdmin(Guid? id)
        => gate.Require(new AuthorizationRequest(Actions.PersonAdminManage, actor.PlatformRole), "Person", id);
}
