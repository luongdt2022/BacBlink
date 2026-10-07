using System;
using System.Collections.Generic;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Demand.Domain;

public sealed class SurveySubmission : AggregateRoot
{
    private SurveySubmission() { }

    public SurveySubmission(Guid enterpriseId, int year)
    {
        EnterpriseId = enterpriseId;
        Year = year;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid EnterpriseId { get; private set; }
    public int Year { get; private set; }
    
    // JSONB
    public List<NeedItem> NeedItems { get; private set; } = new();
    public List<Bottleneck> Bottlenecks { get; private set; } = new();

    public DateTime? SubmittedAt { get; private set; }
    
    public void Submit()
    {
        SubmittedAt = DateTime.UtcNow;
        Touch();
    }

    public void Update(List<NeedItem> needItems, List<Bottleneck> bottlenecks)
    {
        NeedItems = needItems ?? new List<NeedItem>();
        Bottlenecks = bottlenecks ?? new List<Bottleneck>();
        Touch();
    }
}

public class NeedItem
{
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public bool IsApproved { get; set; }
}

public class Bottleneck
{
    public string Area { get; set; } = default!;
    public string Detail { get; set; } = default!;
}
