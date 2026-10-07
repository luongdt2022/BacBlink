using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace NacenTech.Modules.Assessment.Application;

public record SaveAssessmentDraftCommand(
    Guid EnterpriseId,
    int Year,
    string ScopeType,
    List<MachineryItem> Machineries,
    List<EquipmentItem> Equipments,
    List<MaterialItem> Materials,
    List<EvaluationCriterion> Criteria
);

public class SaveAssessmentDraftCommandHandler
{
    public async Task Handle(SaveAssessmentDraftCommand command, CancellationToken cancellationToken)
    {
        var assessment = new Tt17Assessment(command.EnterpriseId, command.Year, command.ScopeType);
        assessment.UpdateDraft(command.Machineries, command.Equipments, command.Materials, command.Criteria);
        
        await Task.CompletedTask;
    }
}
