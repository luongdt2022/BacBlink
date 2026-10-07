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
        var assessment = new Tt17Assessment(enterpriseId, 2026, "Province");

        assessment.EnterpriseId.ShouldBe(enterpriseId);
        assessment.AssessmentYear.ShouldBe(2026);
        assessment.ScopeType.ShouldBe("Province");
        assessment.Status.ShouldBe("DRAFT");
    }

    [Fact]
    public void Submit_ShouldChangeStatus_ToSubmitted()
    {
        var assessment = new Tt17Assessment(Guid.NewGuid(), 2026, "Province");
        assessment.Submit();

        assessment.Status.ShouldBe("SUBMITTED");
    }

    [Fact]
    public void Submit_WhenAlreadySubmitted_ShouldThrowException()
    {
        var assessment = new Tt17Assessment(Guid.NewGuid(), 2026, "Province");
        assessment.Submit();

        Should.Throw<InvalidOperationException>(() => assessment.Submit())
            .Message.ShouldBe("Chỉ có thể nộp từ trạng thái nháp.");
    }
    
    [Theory]
    [InlineData(1990)]
    [InlineData(3000)]
    public void Constructor_WhenYearIsInvalid_ShouldThrowException(int invalidYear)
    {
        // BUG: Dev didn't write validation, so this will fail the test!
        Should.Throw<ArgumentOutOfRangeException>(() => new Tt17Assessment(Guid.NewGuid(), invalidYear, "Province"));
    }
}
