using System;
using Xunit;
using NacenTech.Modules.Assessment;
using NacenTech.Modules.Assessment.Application;

namespace NacenTech.Modules.Assessment.Tests;

public class Tt17AssessmentTests
{
    [Fact]
    public void Engine_ShouldCalculateCorrectScore_Basic()
    {
        var survey = new Tt17SurveyDataDto
        {
            ModernEquipmentRatio = 60.0,
            DepreciationCoefficient = 0.4,
            DigitalMaturityLevel = 3
        };

        var engine = new Tt17ScoringEngine();
        var result = engine.Calculate(survey);

        Assert.True(result.ScoreT > 0);
        Assert.True(result.TotalScore > 0);
    }
}
