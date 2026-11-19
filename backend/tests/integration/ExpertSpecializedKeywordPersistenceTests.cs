using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;
namespace NacenTech.Tests.Integration;
[Collection(PostgresCollection.Name)]
public sealed class ExpertSpecializedKeywordPersistenceTests(PostgresFixture fixture)
{
    [Fact]
    public async Task Keywords_roundtrip_Postgres_and_owner_public_projections_without_polluting_sectors()
    {
        Guid owner; string expertCode;
        await using (var provider = fixture.BuildProvider())
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var person = Person.Register($"keywords-{Guid.NewGuid():N}@test.local", "test-hash", "test", "Kiểm", "Thử", null, "Viện kiểm thử", true);
            owner = person.Id;
            var profile = new ExpertProfile(owner, "TS. Kiểm thử từ khóa", 1980, "male", null, null, "NONE", null,
                "DOCTOR", 2015, "Viện kiểm thử", null, null, null, ["TEST-SECTOR"], null, null, null, null,
                false, false, DateTimeOffset.UtcNow, specializedKeywords: [" LLM ", "Vật liệu nano", "llm"]);
            profile.Approve(); profile.SetPublicListing(true, false, null); expertCode = profile.ExpertCode;
            db.Add(person); db.Add(profile); await db.SaveChangesAsync();
        }
        await using var readProvider = fixture.BuildProvider();
        using var readScope = readProvider.CreateScope();
        var readDb = readScope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var persisted = await readDb.Set<ExpertProfile>().AsNoTracking().SingleAsync(profile => profile.ExpertCode == expertCode);
        persisted.SpecializedKeywords.ShouldBe(new[] { "LLM", "Vật liệu nano" });
        persisted.ExpertiseSectors.ShouldBe(new[] { "TEST-SECTOR" });
        var service = readScope.ServiceProvider.GetRequiredService<IExpertService>();
        var ownerDto = await service.GetMyProfileAsync(owner, CancellationToken.None);
        ownerDto.ShouldNotBeNull(); ownerDto.SpecializedKeywords.ShouldBe(persisted.SpecializedKeywords);
        var publicDto = await service.GetPublicDetailAsync(expertCode, CancellationToken.None);
        publicDto.ShouldNotBeNull(); publicDto.SpecializedKeywords.ShouldBe(persisted.SpecializedKeywords);
    }
}
