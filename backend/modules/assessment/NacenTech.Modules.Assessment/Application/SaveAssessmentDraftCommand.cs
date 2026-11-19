using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace NacenTech.Modules.Assessment.Application;

public record SaveAssessmentDraftCommand(
    Guid EnterpriseId,
    string EnterpriseName,
    string TaxCode,
    SaveAssessmentDraftDto Dto
);

public class SaveAssessmentDraftCommandHandler
{
    private readonly Tt17ScoringEngine _engine = new();

    public async Task<Tt17ScoreResultDto> Handle(SaveAssessmentDraftCommand command, CancellationToken cancellationToken)
    {
        var assessment = new Tt17Assessment(
            command.EnterpriseId,
            command.EnterpriseName,
            command.TaxCode,
            command.Dto.AssessmentYear,
            command.Dto.ScopeId,
            command.Dto.IndustryCode
        );

        var scoreResult = _engine.Calculate(command.Dto.SurveyData);

        var surveyJson = JsonSerializer.Serialize(command.Dto.SurveyData);
        var scoresJson = JsonSerializer.Serialize(scoreResult);

        assessment.UpdateDraft(surveyJson, scoresJson);

        await Task.CompletedTask;
        return scoreResult;
    }
}
