using NacenTech.Modules.Brokerage.Domain;
using Shouldly;
using Xunit;
namespace NacenTech.Tests.Invariants;
public sealed class ExpertSpecializedKeywordTests
{
    [Fact]
    public void Keywords_are_trimmed_deduplicated_and_separate_from_sectors()
    {
        var profile = Profile([" LLM ", "llm", "", "  ", "Vật liệu nano"]);
        profile.SpecializedKeywords.ShouldBe(new[] { "LLM", "Vật liệu nano" });
        profile.ExpertiseSectors.ShouldBe(new[] { "TEST-SECTOR" });
    }
    [Fact]
    public void Omitted_keywords_remain_empty_for_legacy_callers() => Profile(null).SpecializedKeywords.ShouldBeEmpty();
    private static ExpertProfile Profile(IReadOnlyList<string>? keywords) => new(
        Guid.NewGuid(), "TS. Kiểm thử", 1980, "male", null, null, "NONE", null, "DOCTOR", 2015,
        "Viện kiểm thử", null, null, null, ["TEST-SECTOR"], null, null, null, null, false, false,
        DateTimeOffset.UtcNow, specializedKeywords: keywords);
}
