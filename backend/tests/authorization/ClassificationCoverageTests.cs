using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Persistence;
using NacenTech.PolicyEngine;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Authorization;

/// <summary>
/// Cổng done của ADR-0007.
///
/// Mức `Internal` từng rơi vào một cái lỗ mà không bài test nào quét tới: phép kiểm "mật" xếp nó cùng `Public`
/// nên danh sách hiện nó cho mọi người, còn bảng quyết định **không có luật nào gọi tên nó** nên đường mở từ
/// chối bằng `DEFAULT_DENY`. Bài vét cạn hiện có chỉ liệt kê hai mức mật trong mảng `Confidential`, nên nó
/// không nhìn thấy mức thứ ba nằm giữa.
///
/// Hai bài dưới đây bịt đúng cái lỗ đó, và bài thứ hai là thứ lẽ ra đã bắt được B-28 từ đầu.
/// </summary>
public sealed class ClassificationCoverageTests
{
    private static readonly DecisionTable Table = new(RuleSetLoader.FromFile(
        PersistenceServiceCollectionExtensions.ResolvePath("config/policies/authorization-rules.v1.json")));

    /// <summary>Ba mức, đúng tên. Đỏ ngay khi ai đó thêm lại `Internal` — hoặc thêm mức thứ tư mà chưa có ADR.</summary>
    [Fact]
    public void The_model_has_exactly_three_classification_levels()
    {
        var names = Enum.GetNames<DataClassification>().OrderBy(n => n).ToArray();
        names.ShouldBe(["Confidential", "HighlyConfidential", "Public"]);
    }

    /// <summary>
    /// Mọi mức mật đều phải có **luật gọi tên nó** trong bảng quyết định. Một yêu cầu đọc từ người không phải
    /// chủ sở hữu, không có phiếu, phải kết thúc ở một quy tắc có tên — không bao giờ ở `DEFAULT_DENY`.
    /// `DEFAULT_DENY` nghĩa là "bảng chưa nghĩ tới trường hợp này", và đó chính là lỗ mà `Internal` từng rơi vào.
    /// </summary>
    [Theory]
    [InlineData(DataClassification.Public, "PUBLIC_DOCUMENT_READ", Effect.Permit)]
    [InlineData(DataClassification.Confidential, "DENY_CONFIDENTIAL_WITHOUT_GRANT", Effect.Deny)]
    [InlineData(DataClassification.HighlyConfidential, "DENY_CONFIDENTIAL_WITHOUT_GRANT", Effect.Deny)]
    public void Every_level_resolves_to_a_named_rule_for_a_stranger(DataClassification level, string expectedRule, Effect expectedEffect)
    {
        var decision = Table.Evaluate(new AuthorizationRequest(
            Actions.DocumentRead, PlatformRoles.User,
            OrganizationRelation: OrganizationRelations.None,
            DocumentClassification: level.ToCode(),
            AccessGrantVerified: false));

        decision.RuleId.ShouldNotBe(DecisionTable.DefaultDenyRuleId,
            $"mức {level} không có luật nào trong bảng quyết định — đúng cái lỗ của B-28");
        decision.RuleId.ShouldContain(expectedRule);
        decision.Effect.ShouldBe(expectedEffect);
    }

    /// <summary>
    /// Bài vét cạn thật sự, không phụ thuộc danh sách mức viết tay: duyệt **mọi** giá trị của kiểu liệt kê.
    /// Danh sách viết tay là chính lý do bài vét cạn cũ bỏ sót `Internal`.
    /// </summary>
    [Fact]
    public void No_classification_level_falls_through_to_default_deny()
    {
        var uncovered = Enum.GetValues<DataClassification>()
            .Select(level => (level, decision: Table.Evaluate(new AuthorizationRequest(
                Actions.DocumentRead, PlatformRoles.User,
                OrganizationRelation: OrganizationRelations.None,
                DocumentClassification: level.ToCode(),
                AccessGrantVerified: false))))
            .Where(x => x.decision.RuleId == DecisionTable.DefaultDenyRuleId)
            .Select(x => x.level.ToString())
            .ToList();

        uncovered.ShouldBeEmpty($"mức mật không có luật nào gọi tên: {string.Join(", ", uncovered)}");
    }

    /// <summary>Ánh xạ mức → mã và phép kiểm "mật" phải đồng ý với nhau: mã mật ⇔ `IsConfidential`.</summary>
    [Fact]
    public void Code_mapping_and_confidentiality_check_agree()
    {
        foreach (var level in Enum.GetValues<DataClassification>())
        {
            var isPublicCode = level.ToCode() == "PUBLIC";
            level.IsConfidential().ShouldBe(!isPublicCode, $"{level}: mã và phép kiểm mật nói ngược nhau");
        }
    }
}
