using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Enterprise.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.Persistence.Workers;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// CR-BACLINK-008 · T-00.BL08.19 — vòng đời gia nhập & tư cách hội viên trên PostgreSQL thật.
/// REQ-BL08-JOIN-005, BR-BL08-MEMBER-LIFECYCLE-003, BR-BL08-ROLE-DECOUPLE-004, BR-BL08-CERT-NO-005, BR-BL08-JOIN-DEDUP-007.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class Task00BaclinkMembershipLifecycleTests(PostgresFixture fixture)
{
    private sealed record TestActor(Guid? PersonId, string Email, string PlatformRole) : ICurrentActor
    {
        public string ScopeType => ScopeTypes.Global;
        public string? ScopeId => null;
        public bool IsAuthenticated => PersonId.HasValue;
        public string? IpAddress => "127.0.0.1";
        public string? UserAgent => "BL08-Harness";
        public string CorrelationId => Guid.NewGuid().ToString("N");
        public Guid RequirePersonId() => PersonId ?? throw new UnauthorizedException("Yêu cầu định danh.");
    }

    private static readonly Random Rng = new();
    private static string NewTaxCode() => "23" + Rng.NextInt64(10_000_000, 99_999_999).ToString();

    private static async Task<Guid> SeedPersonAsync(NacenTechDbContext db, string role)
    {
        var id = Guid.NewGuid();
        var p = Person.Register($"bl08-{id:N}@baclink.test", "hash-1234567890", "PBKDF2_V3", "Test", "User", "0912345678",
            "BACLINK", isActive: true, platformRole: role, scopeType: ScopeTypes.Global, scopeId: null);
        typeof(Person).GetProperty(nameof(Person.Id))!.SetValue(p, id);
        p.Activate();
        db.Set<Person>().Add(p);
        await db.SaveChangesAsync();
        return id;
    }

    private static string JoinPayload(string taxCode, string tier = "OFFICIAL_S") => JsonSerializer.Serialize(new
    {
        taxCode,
        companyName = "Công ty TNHH Kiểm thử Gia nhập BL08",
        district = "H. Tiên Du",
        industrialZone = "KCN Tiên Sơn",
        sectorCode = "IND_MECH",
        description = "Gia công cơ khí chính xác phục vụ chuỗi cung ứng FDI",
        tierCode = tier,
        representativeSalutation = "Ông",
        representativeName = "Nguyễn Văn Đại Diện",
        representativeTitle = "Giám đốc",
        representativePhone = "0912000111",
        assistantName = "Trần Thị Trợ Lý",
        assistantPhone = "0912000222",
        highlightProducts = "Khuôn mẫu, JIG, chi tiết CNC",
        acceptedCharterAt = DateTimeOffset.UtcNow.ToString("O"),
    });

    private static async Task<(string Status, string? Cert, string Tier, DateOnly? ValidTo)> ReadMembershipAsync(NacenTechDbContext db, Guid ownerId)
    {
        var rows = await db.Database.SqlQuery<MembershipProbe>($"""
            SELECT m.status AS "Status", m.certificate_no AS "Cert", m.tier_code AS "Tier", m.valid_to AS "ValidTo"
            FROM enterprise.memberships m JOIN enterprise.enterprises e ON e.id = m.enterprise_id
            WHERE e.owner_person_id = {ownerId}
            """).ToListAsync();
        rows.Count.ShouldBe(1);
        return (rows[0].Status, rows[0].Cert, rows[0].Tier, rows[0].ValidTo);
    }

    private sealed record MembershipProbe(string Status, string? Cert, string Tier, DateOnly? ValidTo);

    private async Task<(Guid userId, Guid requestId)> SubmitAndApproveAsync(IServiceProvider sp, string taxCode, string tier = "OFFICIAL_S")
    {
        var db = sp.GetRequiredService<NacenTechDbContext>();
        var service = sp.GetRequiredService<IApprovalService>();
        var userId = await SeedPersonAsync(db, PlatformRoles.PublicUser);
        var adminId = await SeedPersonAsync(db, PlatformRoles.Admin);

        var submitted = await service.SubmitRequestAsync(
            new SubmitApprovalRequestCommand(userId, ApprovalRequestTypes.Enterprise, ScopeTypes.Global, null, JoinPayload(taxCode, tier)), CancellationToken.None);
        await service.ReviewRequestAsync(submitted.Id, new ReviewApprovalRequestCommand("APPROVE", 1, "Hồ sơ hợp lệ"),
            new TestActor(adminId, "admin@baclink.test", PlatformRoles.Admin), "127.0.0.1", CancellationToken.None);
        return (userId, submitted.Id);
    }

    [Fact]
    public async Task EnterpriseJoin_Submit_Then_Approve_Grants_Enterprise_Role_Profile_And_Active_Membership()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var tax = NewTaxCode();

        var (userId, _) = await SubmitAndApproveAsync(scope.ServiceProvider, tax);

        var person = await db.Set<Person>().AsNoTracking().SingleAsync(p => p.Id == userId);
        person.PlatformRole.ShouldBe(PlatformRoles.Enterprise);

        var ent = await db.Set<Enterprise>().AsNoTracking().SingleAsync(e => e.TaxCode == tax);
        ent.IsVerified.ShouldBeTrue();
        ent.CapabilityTier.ShouldBe("DUAL");
        ent.SectorCode.ShouldBe("IND_MECH");
        ent.OperatingZone.ShouldBe("KCN Tiên Sơn");
        ent.ContactPerson.ShouldBe("Nguyễn Văn Đại Diện");
        ent.ProfileDetailsJson.ShouldContain("Trần Thị Trợ Lý");
        ent.ProfileDetailsJson.ShouldContain("Khuôn mẫu, JIG");

        var m = await ReadMembershipAsync(db, userId);
        m.Status.ShouldBe("ACTIVE");
        m.Tier.ShouldBe("OFFICIAL_S");
        m.Cert.ShouldNotBeNull();
        m.Cert!.ShouldMatch(@"^BL-\d{4}-\d{4}$");
        m.ValidTo!.Value.Month.ShouldBe(12);
        m.ValidTo!.Value.Day.ShouldBe(31);
    }

    [Fact]
    public async Task Duplicate_Pending_Join_For_Same_TaxCode_Is_Rejected()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();
        var tax = NewTaxCode();
        var u1 = await SeedPersonAsync(db, PlatformRoles.PublicUser);
        var u2 = await SeedPersonAsync(db, PlatformRoles.PublicUser);

        await service.SubmitRequestAsync(new SubmitApprovalRequestCommand(u1, ApprovalRequestTypes.Enterprise, ScopeTypes.Global, null, JoinPayload(tax)), CancellationToken.None);
        var ex = await Should.ThrowAsync<ConflictException>(() =>
            service.SubmitRequestAsync(new SubmitApprovalRequestCommand(u2, ApprovalRequestTypes.Enterprise, ScopeTypes.Global, null, JoinPayload(tax)), CancellationToken.None));
        ex.Message.ShouldContain("đang chờ duyệt");
    }

    [Fact]
    public async Task Join_With_Invalid_TaxCode_Is_Rejected()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();
        var u = await SeedPersonAsync(db, PlatformRoles.PublicUser);
        await Should.ThrowAsync<ValidationException>(() =>
            service.SubmitRequestAsync(new SubmitApprovalRequestCommand(u, ApprovalRequestTypes.Enterprise, ScopeTypes.Global, null, JoinPayload("123")), CancellationToken.None));
    }

    [Fact]
    public async Task Activation_Is_Idempotent_And_Certificate_Numbers_Are_Unique_Sequential()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var activator = scope.ServiceProvider.GetRequiredService<IMembershipActivator>();

        var (u1, _) = await SubmitAndApproveAsync(scope.ServiceProvider, NewTaxCode());
        var (u2, _) = await SubmitAndApproveAsync(scope.ServiceProvider, NewTaxCode());

        var c1 = (await ReadMembershipAsync(db, u1)).Cert!;
        var again = await activator.ActivateForOwnerAsync(u1, null, null, CancellationToken.None);
        again.ShouldBe(c1);

        var c2 = (await ReadMembershipAsync(db, u2)).Cert!;
        c2.ShouldNotBe(c1);
        int.Parse(c2[^4..]).ShouldBeGreaterThan(int.Parse(c1[^4..]));
    }

    [Fact]
    public async Task Expiry_Worker_Expires_Then_Suspends_Without_Touching_Role_And_Reminds_Before_Expiry()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var (expiredUser, _) = await SubmitAndApproveAsync(scope.ServiceProvider, NewTaxCode());
        var (graceUser, _) = await SubmitAndApproveAsync(scope.ServiceProvider, NewTaxCode());
        var (soonUser, _) = await SubmitAndApproveAsync(scope.ServiceProvider, NewTaxCode());

        async Task SetValidTo(Guid owner, int daysFromToday, string status = "ACTIVE") =>
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                UPDATE enterprise.memberships m SET valid_to = current_date + {daysFromToday}, status = {status}, last_reminded_at = NULL
                FROM enterprise.enterprises e WHERE e.id = m.enterprise_id AND e.owner_person_id = {owner}
                """);
        await SetValidTo(expiredUser, -1);
        await SetValidTo(graceUser, -100, "EXPIRED");
        await SetValidTo(soonUser, 10);

        var worker = new MembershipExpiryWorker(provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<MembershipExpiryWorker>.Instance);
        var result = await worker.RunOnceAsync();

        (await ReadMembershipAsync(db, expiredUser)).Status.ShouldBe("EXPIRED");
        (await ReadMembershipAsync(db, graceUser)).Status.ShouldBe("SUSPENDED");
        (await ReadMembershipAsync(db, soonUser)).Status.ShouldBe("ACTIVE");
        result.Reminded.ShouldBeGreaterThanOrEqualTo(1);

        var roles = await db.Set<Person>().AsNoTracking().Where(p => p.Id == expiredUser || p.Id == graceUser).Select(p => p.PlatformRole).ToListAsync();
        roles.ShouldAllBe(r => r == PlatformRoles.Enterprise);

        var reminders = await db.Database.SqlQuery<int>($"""
            SELECT count(*)::int AS "Value" FROM communication.notifications WHERE person_id = {soonUser} AND type = 'membership_expiring'
            """).SingleAsync();
        reminders.ShouldBe(1);

        // Chạy lại ngay: không nhắc trùng trong 7 ngày
        await worker.RunOnceAsync();
        (await db.Database.SqlQuery<int>($"""
            SELECT count(*)::int AS "Value" FROM communication.notifications WHERE person_id = {soonUser} AND type = 'membership_expiring'
            """).SingleAsync()).ShouldBe(1);
    }

    [Fact]
    public async Task Revoke_Suspends_Membership()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();
        var (userId, requestId) = await SubmitAndApproveAsync(scope.ServiceProvider, NewTaxCode());
        var adminId = await SeedPersonAsync(db, PlatformRoles.Admin);
        var version = await db.Set<ApprovalRequest>().AsNoTracking().Where(r => r.Id == requestId).Select(r => r.Version).SingleAsync();

        await service.ReviewRequestAsync(requestId, new ReviewApprovalRequestCommand("REVOKE", version, "Vi phạm điều lệ hội viên"),
            new TestActor(adminId, "admin@baclink.test", PlatformRoles.Admin), "127.0.0.1", CancellationToken.None);

        (await ReadMembershipAsync(db, userId)).Status.ShouldBe("SUSPENDED");
    }

    [Fact]
    public async Task Concurrent_Activations_Never_Duplicate_Certificate_Numbers()
    {
        await using var provider = fixture.BuildProvider();
        var owners = new List<Guid>();
        using (var seed = provider.CreateScope())
        {
            var db = seed.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            for (var i = 0; i < 6; i++)
            {
                var owner = await SeedPersonAsync(db, PlatformRoles.Enterprise);
                var tax = NewTaxCode();
                await db.Database.ExecuteSqlInterpolatedAsync($"""
                    INSERT INTO enterprise.enterprises (id, subject_type, legal_name, name, tax_code, province_city, main_sector_name, status,
                        verification_status, is_verified, owner_person_id, address_info_json, profile_details_json, top_bottlenecks_json,
                        support_needs_json, capability_tier, is_buyer, is_seller, active_role, version, created_at, updated_at,
                        has_rd_unit, has_rd_budget, is_exporting, in_value_chain, is_contact_public)
                    VALUES ({Guid.NewGuid()}, 'ENTERPRISE', 'Song song', 'Song song', {tax}, 'Bắc Ninh', 'Cơ khí', 'ACTIVE',
                        'VERIFIED', true, {owner}, {"{}"}::jsonb, {"{}"}::jsonb, '[]'::jsonb, '[]'::jsonb, 'DUAL', true, true, 'BUYER', 1, now(), now(),
                        false, false, false, false, false)
                    """);
                owners.Add(owner);
            }
        }

        var certs = await Task.WhenAll(owners.Select(async o =>
        {
            using var scope = provider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<IMembershipActivator>().ActivateForOwnerAsync(o, null, null, CancellationToken.None);
        }));

        certs.ShouldAllBe(c => c != null);
        certs.Distinct().Count().ShouldBe(owners.Count);
    }
}
