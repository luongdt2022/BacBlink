using System;
using Xunit;
using NacenTech.Modules.Assessment;
using NacenTech.Modules.Assessment.Application;
using System.Collections.Generic;

namespace NacenTech.Modules.Assessment.Tests;

public class Tt17AssessmentTests
{
    [Fact]
    public void Engine_ShouldCalculateCorrectScore()
    {
        var assessment = new Tt17Assessment(Guid.NewGuid(), 2026, "TEST");
        assessment.UpdateDraft(
            new List<MachineryItem>(), 
            new List<EquipmentItem>(), 
            new List<MaterialItem>(), 
            new List<EvaluationCriterion> { 
                new EvaluationCriterion { Code = "A", Score = 10 },
                new EvaluationCriterion { Code = "B", Score = 15 }
            });
        
        var service = new Tt17ScoringService();
        var score = service.CalculateScore(assessment);
        
        Assert.Equal(25, score);
    }
}
