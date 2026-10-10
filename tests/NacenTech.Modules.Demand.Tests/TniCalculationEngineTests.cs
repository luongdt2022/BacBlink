using System;
using Xunit;
using NacenTech.Modules.Demand.Domain;

namespace NacenTech.Modules.Demand.Tests;

public class TniCalculationEngineTests
{
    [Fact]
    public void Calculate_WithMinValues_ShouldReturnScore20AndLow()
    {
        // K=1, L=1, N=1, O=1 -> (35 + 30 + 20 + 15)/5 = 100/5 = 20
        var result = TniCalculationEngine.Calculate(1, 1, 1, 1);
        Assert.Equal(20, result.Score);
        Assert.Equal(TniClassification.Low, result.Classification);
        Assert.Equal("Nhu cầu thấp", result.ClassificationName);
    }

    [Fact]
    public void Calculate_WithMaxValues_ShouldReturnScore100AndVeryHigh()
    {
        // K=5, L=5, N=5, O=5 -> (175 + 150 + 100 + 75)/5 = 500/5 = 100
        var result = TniCalculationEngine.Calculate(5, 5, 5, 5);
        Assert.Equal(100, result.Score);
        Assert.Equal(TniClassification.VeryHigh, result.Classification);
        Assert.Equal("Nhu cầu rất cao", result.ClassificationName);
    }

    [Theory]
    [InlineData(5, 4, 4, 4, 87, TniClassification.VeryHigh)] // (175+120+80+60)/5 = 435/5 = 87
    [InlineData(4, 3, 3, 3, 67, TniClassification.High)]     // (140+90+60+45)/5 = 335/5 = 67
    [InlineData(3, 3, 2, 2, 53, TniClassification.Medium)]   // (105+90+40+30)/5 = 265/5 = 53
    [InlineData(2, 2, 2, 2, 40, TniClassification.Low)]      // (70+60+40+30)/5 = 200/5 = 40
    public void Calculate_StandardCases_ShouldMatchExpectedScoreAndClassification(
        int urgency, int impact, int investment, int readiness, int expectedScore, TniClassification expectedClassification)
    {
        var result = TniCalculationEngine.Calculate(urgency, impact, investment, readiness);
        Assert.Equal(expectedScore, result.Score);
        Assert.Equal(expectedClassification, result.Classification);
    }

    [Fact]
    public void Calculate_Threshold80_ShouldBeVeryHigh()
    {
        // Find inputs giving >= 80: K=4, L=4, N=4, O=4 -> (140+120+80+60)/5 = 400/5 = 80
        var result = TniCalculationEngine.Calculate(4, 4, 4, 4);
        Assert.Equal(80, result.Score);
        Assert.Equal(TniClassification.VeryHigh, result.Classification);
    }

    [Fact]
    public void Calculate_Threshold65_ShouldBeHigh()
    {
        // K=3, L=4, N=3, O=3 -> (105+120+60+45)/5 = 330/5 = 66 -> High
        var result = TniCalculationEngine.Calculate(3, 4, 3, 3);
        Assert.Equal(66, result.Score);
        Assert.Equal(TniClassification.High, result.Classification);
    }

    [Fact]
    public void Calculate_Threshold50_ShouldBeMedium()
    {
        // K=3, L=2, N=3, O=2 -> (105+60+60+30)/5 = 255/5 = 51 -> Medium
        var result = TniCalculationEngine.Calculate(3, 2, 3, 2);
        Assert.Equal(51, result.Score);
        Assert.Equal(TniClassification.Medium, result.Classification);
    }

    [Theory]
    [InlineData(0, 3, 3, 3)]
    [InlineData(6, 3, 3, 3)]
    [InlineData(3, 0, 3, 3)]
    [InlineData(3, 6, 3, 3)]
    [InlineData(3, 3, 0, 3)]
    [InlineData(3, 3, 6, 3)]
    [InlineData(3, 3, 3, 0)]
    [InlineData(3, 3, 3, 6)]
    public void Calculate_InvalidDimensionRange_ShouldThrowArgumentOutOfRangeException(
        int urgency, int impact, int investment, int readiness)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            TniCalculationEngine.Calculate(urgency, impact, investment, readiness));
    }
}
