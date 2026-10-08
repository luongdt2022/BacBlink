using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Api.V1Compat;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Policy.Domain;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// Developer regression on real PostgreSQL; not a replacement for black-box QC.
[Collection(PostgresCollection.Name)]
public sealed class ExpertDraftHandoffPersistenceTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;
    private static string Token(QuickExpertIntakeResponse intake) => Uri.UnescapeDataString(new Uri(intake.MagicLinkUrl).Query.Split('=', 2)[1]);
    private static QuickExpertIntakeRequest Intake() => new("Chuyên gia nháp", "0900000000", $"draft-{Guid.NewGuid():N}@example.test", "DOCTOR", "Viện nghiên cứu", "LV91", ["CN01"], null, true);
    private static SubmitExpertUpgradeRequest Official(string token, bool consent = true) => new(
        "Chuyên gia hoàn thiện", 1980, "male", "NONE", null, "DOCTOR", 2010, "Viện nghiên cứu", null, null, null,
        ["LV91"], null, null, null, null, false, false, consent, true, "PROVINCE", "HP", token);

    [Fact]
    public async Task Signed_link_stores_only_hash_and_repeated_reads_preserve_original_sector()
    {
        var clock = new TestClock();
        await using var provider = fixture.BuildProvider(clock: clock);
        Guid profileId; string token;
        using (var scope = provider.CreateScope())
        {
            var service = scope.ServiceProvider.GetRequiredService<IExpertService>();
            var result = await service.SubmitQuickIntakeAsync(Intake(), Ct);
            token = Token(result);
            result.Status.ShouldBe("DRAFT");
            new Uri(result.MagicLinkUrl).Host.ShouldBe("localhost");
            var first = await service.GetDraftAsync(token, Ct);
            profileId = first.Id;
            first.SectorCode.ShouldBe("LV91");
            (await service.GetDraftAsync(token, Ct)).Id.ShouldBe(profileId);
        }
        using var verify = provider.CreateScope();
        var saved = await verify.ServiceProvider.GetRequiredService<DbContext>().Set<ExpertProfile>().AsNoTracking().SingleAsync(x => x.Id == profileId);
        saved.MagicLinkToken.ShouldNotBe(token);
        saved.MagicLinkToken!.Length.ShouldBe(64);
        saved.MagicLinkExpiresAtUtc.ShouldBe(clock.UtcNow.AddHours(72));
        saved.PersonId.ShouldBeNull();
    }

    [Fact]
    public async Task Tampered_and_expired_links_are_uniformly_rejected()
    {
        var clock = new TestClock();
        await using var provider = fixture.BuildProvider(clock: clock);
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IExpertService>();
        var token = Token(await service.SubmitQuickIntakeAsync(Intake(), Ct));
        var tampered = token[..^1] + (token[^1] == 'A' ? "B" : "A");
        (await Should.ThrowAsync<UnauthorizedException>(() => service.GetDraftAsync(tampered, Ct))).Code.ShouldBe("ERR_MAGIC_LINK_EXPIRED");
        clock.Advance(TimeSpan.FromHours(72));
        (await Should.ThrowAsync<UnauthorizedException>(() => service.GetDraftAsync(token, Ct))).Code.ShouldBe("ERR_MAGIC_LINK_EXPIRED");
        (await Should.ThrowAsync<UnauthorizedException>(() => service.GetDraftAsync("legacy-plaintext", Ct))).Code.ShouldBe("ERR_MAGIC_LINK_EXPIRED");
    }

    [Fact]
    public async Task Official_submit_claims_original_profile_once_and_invalidates_the_link()
    {
        var personId = Guid.NewGuid();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(personId), new TestClock());
        string token; Guid draftId;
        using (var scope = provider.CreateScope())
        {
            var service = scope.ServiceProvider.GetRequiredService<IExpertService>();
            token = Token(await service.SubmitQuickIntakeAsync(Intake(), Ct));
            draftId = (await service.GetDraftAsync(token, Ct)).Id;
            var submitted = await service.SubmitUpgradeAsync(personId, Official(token), Ct);
            submitted.Id.ShouldBe(draftId);
            submitted.PersonId.ShouldBe(personId);
        }
        using var verify = provider.CreateScope();
        var saved = await verify.ServiceProvider.GetRequiredService<DbContext>().Set<ExpertProfile>().AsNoTracking().SingleAsync(x => x.Id == draftId);
        saved.Status.ShouldBe("PENDING_REVIEW");
        saved.PersonId.ShouldBe(personId);
        saved.FullName.ShouldBe("Chuyên gia hoàn thiện");
        saved.MasteredTechCodes.ShouldBe(["CN01"]);
        saved.MagicLinkToken.ShouldBeNull(); saved.MagicLinkExpiresAtUtc.ShouldBeNull();
        (await Should.ThrowAsync<UnauthorizedException>(() => verify.ServiceProvider.GetRequiredService<IExpertService>().GetDraftAsync(token, Ct))).Code.ShouldBe("ERR_MAGIC_LINK_EXPIRED");
        (await Should.ThrowAsync<UnauthorizedException>(() => verify.ServiceProvider.GetRequiredService<IExpertService>().SubmitUpgradeAsync(Guid.NewGuid(), Official(token), Ct))).Code.ShouldBe("ERR_MAGIC_LINK_EXPIRED");
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Host_transaction_commits_claim_with_queue_or_rolls_back_both(bool failQueue)
    {
        var personId = Guid.NewGuid();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(personId), new TestClock());
        string token; Guid draftId;
        var code = "LV" + Guid.NewGuid().ToString("N")[..10].ToUpperInvariant();
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<DbContext>();
            db.Set<TaxonomyTerm>().Add(new TaxonomyTerm("SECTOR", "Ngành bàn giao thực", code));
            await scope.ServiceProvider.GetRequiredService<IUnitOfWork>().CommitAsync(Ct);
            var service = scope.ServiceProvider.GetRequiredService<IExpertService>();
            token = Token(await service.SubmitQuickIntakeAsync(Intake() with { SectorCode = code }, Ct));
            draftId = (await service.GetDraftAsync(token, Ct)).Id;
            var controller = new ExpertController(service, scope.ServiceProvider.GetRequiredService<IApprovalService>(),
                scope.ServiceProvider.GetRequiredService<IAuditWriter>(), scope.ServiceProvider.GetRequiredService<ITaxonomyService>(), db) {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider } }
            };
            var request = Official(token) with { ExpertiseSectors = [code], ScopeId = failQueue ? new string('X', 500) : "HP" };
            if (failQueue) await Should.ThrowAsync<DbUpdateException>(() => controller.SubmitUpgrade(request, Ct));
            else (await controller.SubmitUpgrade(request, Ct)).ShouldBeOfType<ObjectResult>().StatusCode.ShouldBe(201);
        }
        using var verify = provider.CreateScope();
        var persisted = await verify.ServiceProvider.GetRequiredService<DbContext>().Set<ExpertProfile>().AsNoTracking().SingleAsync(x => x.Id == draftId);
        var queued = await verify.ServiceProvider.GetRequiredService<DbContext>().Set<ApprovalRequest>().CountAsync(x => x.UserId == personId);
        queued.ShouldBe(failQueue ? 0 : 1);
        if (failQueue)
        {
            persisted.PersonId.ShouldBeNull(); persisted.Status.ShouldBe("DRAFT");
            (await verify.ServiceProvider.GetRequiredService<IExpertService>().GetDraftAsync(token, Ct)).Id.ShouldBe(draftId);
        }
        else { persisted.PersonId.ShouldBe(personId); persisted.MagicLinkToken.ShouldBeNull(); }
    }

    [Fact]
    public async Task Invalid_official_submission_does_not_consume_draft_link()
    {
        await using var provider = fixture.BuildProvider(clock: new TestClock());
        string token; Guid id;
        using (var scope = provider.CreateScope())
        {
            var service = scope.ServiceProvider.GetRequiredService<IExpertService>();
            token = Token(await service.SubmitQuickIntakeAsync(Intake(), Ct));
            id = (await service.GetDraftAsync(token, Ct)).Id;
            await Should.ThrowAsync<ValidationException>(() => service.SubmitUpgradeAsync(Guid.NewGuid(), Official(token, false), Ct));
        }
        using var verify = provider.CreateScope();
        (await verify.ServiceProvider.GetRequiredService<IExpertService>().GetDraftAsync(token, Ct)).Id.ShouldBe(id);
    }
}
