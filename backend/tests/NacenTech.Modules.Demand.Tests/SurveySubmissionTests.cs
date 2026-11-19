using System;
using Xunit;
using NacenTech.Modules.Demand.Domain;
using System.Collections.Generic;

namespace NacenTech.Modules.Demand.Tests;

public class SurveySubmissionTests
{
    [Fact]
    public void Update_ShouldSetItemsAndTouch()
    {
        var survey = new SurveySubmission(Guid.NewGuid(), 2026);
        
        survey.Update(new List<NeedItem> { new NeedItem { Title = "A" } }, new List<Bottleneck> { new Bottleneck { Area = "B" } });
        
        Assert.Single(survey.NeedItems);
        Assert.Single(survey.Bottlenecks);
    }
}
