using System;
using System.Text.Json;

namespace NacenTech.Modules.Assessment.Application;

public class Tt17ScoringService
{
    private readonly Tt17ScoringEngine _engine = new();

    public Tt17ScoreResultDto CalculateScore(Tt17Assessment assessment)
    {
        var survey = JsonSerializer.Deserialize<Tt17SurveyDataDto>(assessment.SurveyDataJson) ?? new();
        return _engine.Calculate(survey);
    }
}
