using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Enterprise.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TEST-02-009: Integration Tests cho Delta CR-2026-024-PART2 (T-02.38, T-02.39, T-02.40).
/// Kiểm thử liên thông Side Effects khi duyệt / thu hồi hồ sơ INSTITUTION (Role Upgrade & Entity Creation).
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class Task02DeltaV24ApprovalSideEffectTests(PostgresFixture fixture)
{
    private sealed record TestActor(
        Guid? PersonId,
        string Email,
        string PlatformRole,
        string ScopeType,
        string? ScopeId) : ICurrentActor
    {
        public bool IsAuthenticated => PersonId.HasValue;
        public string? IpAddress => "127.0.0.1";
        public string? UserAgent => "NacenTech-Integration-Harness";
        public string CorrelationId => Guid.NewGuid().ToString("N");
        public Guid RequirePersonId() => PersonId ?? throw new UnauthorizedException("Yêu cầu định danh.");
    }

    private static (Guid id, string email) NewUser() => (Guid.NewGuid(), $"test-user-{Guid.NewGuid():N}@nacentech.vn");

    private async Task<Person> SeedPersonAsync(
        NacenTechDbContext db,
        Guid id,
        string email,
        string role,
        string scopeType = ScopeTypes.Global,
        string? scopeId = null)
    {
        var person = Person.Register(
            email,
            "hash-1234567890",
            "PBKDF2_V3",
            "John",
            "Doe",
            "0912345678",
            "NacenTech Org",
            isActive: true,
            platformRole: role,
            scopeType: scopeType,
            scopeId: scopeId);

        typeof(Person).GetProperty(nameof(Person.Id))!.SetValue(person, id);
        person.Activate();
        db.Set<Person>().Add(person);
        await db.SaveChangesAsync();
        return person;
    }

    [Fact]
    public async Task InstitutionApproval_ApprovesSuccessfully_UpgradesRoleToInnovationEntity_AndCreatesVerifiedEnterprise()
    {
        // GIVEN: PostgreSQL provider thật với Cán bộ Sở Hà Nội
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (provAdminId, provAdminEmail) = NewUser();
        await SeedPersonAsync(db, provAdminId, provAdminEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");
        var provAdminActor = new TestActor(provAdminId, provAdminEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");

        var payload = new
        {
            taxCode = "0109999888",
            companyName = "CÔNG TY TNHH ĐỔI MỚI SÁNG TẠO HÀ NỘI",
            province = "HN"
        };

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.Institution,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload),
            DateTimeOffset.UtcNow.AddHours(24));

        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        // WHEN: Cán bộ Sở Hà Nội duyệt hồ sơ
        var reviewCmd = new ReviewApprovalRequestCommand("APPROVE", ReviewNote: "Hồ sơ doanh nghiệp ĐMST hợp lệ theo Quyết định Sở", ExpectedVersion: 1);
        var result = await service.ReviewRequestAsync(req.Id, reviewCmd, provAdminActor, "127.0.0.1", CancellationToken.None);

        // THEN: Hồ sơ chuyển trạng thái APPROVED
        result.ShouldNotBeNull();
        result.Status.ShouldBe(ApprovalStatuses.Approved);

        // THEN: Người nộp được thăng hạng lên vai trò INNOVATION_ENTITY phạm vi Tỉnh HN
        var updatedPerson = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(p => p.Id == userId);
        updatedPerson.ShouldNotBeNull();
        updatedPerson.PlatformRole.ShouldBe(PlatformRoles.InnovationEntity);
        updatedPerson.ScopeType.ShouldBe(ScopeTypes.Province);
        updatedPerson.ScopeId.ShouldBe("HN");

        // THEN: Bản ghi Enterprise được tự động tạo và kích hoạt VERIFIED
        var enterprise = await db.Set<Enterprise>().AsNoTracking().FirstOrDefaultAsync(e => e.TaxCode == "0109999888");
        enterprise.ShouldNotBeNull();
        enterprise.OwnerPersonId.ShouldBe(userId);
        enterprise.LegalName.ShouldBe("CÔNG TY TNHH ĐỔI MỚI SÁNG TẠO HÀ NỘI");
        enterprise.ProvinceCity.ShouldBe("HN");
        enterprise.IsVerified.ShouldBeTrue();
        enterprise.VerificationStatus.ShouldBe("VERIFIED");
        enterprise.Status.ShouldBe("ACTIVE");
    }

    [Fact]
    public async Task InstitutionApproval_RevokedBySuperAdmin_DemotesRoleToPublicUser_AndMarksEnterpriseRejected()
    {
        // GIVEN: Hồ sơ đã được duyệt trước đó, SuperAdmin thực hiện thu hồi
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (provAdminId, provAdminEmail) = NewUser();
        await SeedPersonAsync(db, provAdminId, provAdminEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");
        var provAdminActor = new TestActor(provAdminId, provAdminEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");

        var (superAdminId, superAdminEmail) = NewUser();
        await SeedPersonAsync(db, superAdminId, superAdminEmail, PlatformRoles.SuperAdmin, ScopeTypes.Global, null);
        var superAdminActor = new TestActor(superAdminId, superAdminEmail, PlatformRoles.SuperAdmin, ScopeTypes.Global, null);

        var payload = new
        {
            taxCode = "0107777666",
            companyName = "CÔNG TY CP CÔNG NGHỆ THỦ ĐÔ",
            province = "HN"
        };

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.Institution,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload),
            DateTimeOffset.UtcNow.AddHours(24));

        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        // 1. Cán bộ Sở duyệt trước
        var reviewCmd = new ReviewApprovalRequestCommand("APPROVE", ReviewNote: "Hồ sơ hợp lệ cấp cơ sở", ExpectedVersion: 1);
        await service.ReviewRequestAsync(req.Id, reviewCmd, provAdminActor, "127.0.0.1", CancellationToken.None);

        // 2. SuperAdmin phát hiện sai phạm và Thu hồi phê duyệt (REVOKE)
        var revokeCmd = new ReviewApprovalRequestCommand("REVOKE", ReviewNote: "Phát hiện gian lận báo cáo tài chính cần thu hồi khẩn cấp", ExpectedVersion: 2);
        var revokedResult = await service.ReviewRequestAsync(req.Id, revokeCmd, superAdminActor, "127.0.0.1", CancellationToken.None);

        revokedResult.Status.ShouldBe(ApprovalStatuses.Rejected);

        // THEN: Người dùng bị hạ cấp về vai trò PUBLIC_USER
        var demotedPerson = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(p => p.Id == userId);
        demotedPerson.ShouldNotBeNull();
        demotedPerson.PlatformRole.ShouldBe(PlatformRoles.PublicUser);
        demotedPerson.ScopeType.ShouldBe(ScopeTypes.Global);

        // THEN: Doanh nghiệp bị hủy xác thực
        var demotedEnterprise = await db.Set<Enterprise>().AsNoTracking().FirstOrDefaultAsync(e => e.TaxCode == "0107777666");
        demotedEnterprise.ShouldNotBeNull();
        demotedEnterprise.IsVerified.ShouldBeFalse();
        demotedEnterprise.VerificationStatus.ShouldBe("REJECTED");
    }

    [Fact]
    public async Task InstitutionApproval_ExistingEnterpriseWithTaxCode_LinksOwnerAndVerifies()
    {
        // GIVEN: Bản ghi Enterprise đã tồn tại từ trước trong DB (chưa verify, chưa có owner)
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        const string existingTaxCode = "0105555444";
        var existingEnt = new Enterprise(Guid.NewGuid())
        {
            TaxCode = existingTaxCode,
            Name = "CÔNG TY TIỀN THÂN",
            LegalName = "CÔNG TY TIỀN THÂN",
            ProvinceCity = "HN",
            MainSectorName = "Công nghệ thông tin",
            IsVerified = false,
            VerificationStatus = "DRAFT",
            Status = "ACTIVE"
        };
        db.Set<Enterprise>().Add(existingEnt);

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (provAdminId, provAdminEmail) = NewUser();
        await SeedPersonAsync(db, provAdminId, provAdminEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");
        var provAdminActor = new TestActor(provAdminId, provAdminEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");

        var payload = new
        {
            taxCode = existingTaxCode,
            companyName = "CÔNG TY TIỀN THÂN",
            province = "HN"
        };

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.Institution,
            ScopeTypes.Province,
            "HN",
            JsonSerializer.Serialize(payload),
            DateTimeOffset.UtcNow.AddHours(24));

        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        // WHEN: Duyệt hồ sơ
        var reviewCmd = new ReviewApprovalRequestCommand("APPROVE", ReviewNote: "Phê duyệt định danh doanh nghiệp", ExpectedVersion: 1);
        await service.ReviewRequestAsync(req.Id, reviewCmd, provAdminActor, "127.0.0.1", CancellationToken.None);

        // THEN: Enterprise cũ được liên kết với OwnerPersonId và chuyển sang VERIFIED
        var linkedEnterprise = await db.Set<Enterprise>().AsNoTracking().FirstOrDefaultAsync(e => e.Id == existingEnt.Id);
        linkedEnterprise.ShouldNotBeNull();
        linkedEnterprise.OwnerPersonId.ShouldBe(userId);
        linkedEnterprise.IsVerified.ShouldBeTrue();
        linkedEnterprise.VerificationStatus.ShouldBe("VERIFIED");
    }
}
