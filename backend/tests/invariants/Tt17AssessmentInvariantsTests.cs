using System;
using Xunit;
using Shouldly;
using NacenTech.Modules.Assessment;

namespace NacenTech.Tests.Invariants;

public class Tt17AssessmentInvariantsTests
{
    [Fact]
    public void Constructor_ShouldInitializeCorrectly_InDraftState()
    {
        var enterpriseId = Guid.NewGuid();
        var assessment = new Tt17Assessment(enterpriseId, "Công ty ABC", "0101234567", 2026, "HN", "C.10");

        assessment.EnterpriseId.ShouldBe(enterpriseId);
        assessment.AssessmentYear.ShouldBe(2026);
        assessment.ScopeId.ShouldBe("HN");
        assessment.Status.ShouldBe("DRAFT");
    }

    [Fact]
    public void Submit_ShouldChangeStatus_ToSubmitted()
    {
        var assessment = new Tt17Assessment(Guid.NewGuid(), "Công ty ABC", "0101234567", 2026, "HN", "C.10");
        assessment.Submit("{\"total\": 75.5}");

        assessment.Status.ShouldBe("SUBMITTED");
    }

    [Fact]
    public void Submit_WhenAlreadySubmitted_ShouldThrowException()
    {
        var assessment = new Tt17Assessment(Guid.NewGuid(), "Công ty ABC", "0101234567", 2026, "HN", "C.10");
        assessment.Submit("{\"total\": 75.5}");

        Should.Throw<InvalidOperationException>(() => assessment.Submit("{\"total\": 75.5}"))
            .Message.ShouldBe("Chỉ có thể nộp hồ sơ từ trạng thái Nháp hoặc Cần bổ sung.");
    }
    
    [Theory]
    [InlineData(1990)]
    [InlineData(3000)]
    public void Constructor_WhenYearIsInvalid_ShouldThrowException(int invalidYear)
    {
        Should.Throw<ArgumentOutOfRangeException>(() => new Tt17Assessment(Guid.NewGuid(), "Công ty ABC", "0101234567", invalidYear, "HN", "C.10"));
    }
}
