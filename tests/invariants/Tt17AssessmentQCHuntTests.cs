using System;
using Xunit;
using Shouldly;
using NacenTech.Modules.Assessment;

namespace NacenTech.Tests.Invariants;

public class Tt17AssessmentQCHuntTests
{
    [Fact]
    public void Constructor_WithEmptyEnterpriseId_ShouldBeCaughtByQC()
    {
        // QC đang cố tình bắn một Guid Rỗng (Guid.Empty) để xem Dev có check không.
        // Kỳ vọng: Hệ thống PHẢI ném lỗi ArgumentException vì không thể có phiếu đánh giá của "Doanh nghiệp ma"
        
        Should.Throw<ArgumentException>(() => new Tt17Assessment(Guid.Empty, "Công ty ABC", "0101234567", 2026, "HN", "C.10"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_WithEmptyScopeType_ShouldBeCaughtByQC(string? emptyScope)
    {
        // QC cố tình bắn khoảng trắng hoặc null vào ScopeId
        // Kỳ vọng: Hệ thống PHẢI chặn lại!
        
        Should.Throw<ArgumentException>(() => new Tt17Assessment(Guid.NewGuid(), "Công ty ABC", "0101234567", 2026, emptyScope!, "C.10"));
    }
}
