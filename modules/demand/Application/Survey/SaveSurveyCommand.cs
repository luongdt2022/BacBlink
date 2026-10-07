using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;

namespace NacenTech.Modules.Demand.Application.Survey;

public record SaveSurveyCommand(Guid EnterpriseId, int Year, List<NeedItem> NeedItems, List<Bottleneck> Bottlenecks);

public class SaveSurveyCommandHandler
{
    // Mock repository or context for now
    public async Task Handle(SaveSurveyCommand command, CancellationToken cancellationToken)
    {
        var survey = new SurveySubmission(command.EnterpriseId, command.Year);
        survey.Update(command.NeedItems, command.Bottlenecks);
        
        // _context.Set<SurveySubmission>().Add(survey);
        // await _context.SaveChangesAsync();
        await Task.CompletedTask;
    }
}
