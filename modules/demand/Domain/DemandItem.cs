using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Demand.Domain;

public sealed class DemandItem : Entity
{
    private DemandItem() { }

    public DemandItem(
        Guid? surveyId,
        string itemCode,
        string stageName,
        string technicalProblem,
        string? desiredSolution,
        bool needConsulting,
        string expectedGoal,
        string? applicationScale,
        string sectorCode,
        string techGroupCode,
        string demandTypeCode,
        string budgetRange,
        int urgencyScore,
        int impactScore,
        int investmentCapacity,
        int adoptionReadiness,
        Guid? createdBy = null)
    {
        SurveyId = surveyId;
        ItemCode = itemCode;
        StageName = stageName;
        TechnicalProblem = technicalProblem;
        DesiredSolution = desiredSolution;
        NeedConsulting = needConsulting;
        ExpectedGoal = expectedGoal;
        ApplicationScale = applicationScale;
        SectorCode = sectorCode;
        TechGroupCode = techGroupCode;
        DemandTypeCode = demandTypeCode;
        BudgetRange = budgetRange;

        UrgencyScore = urgencyScore;
        ImpactScore = impactScore;
        InvestmentCapacity = investmentCapacity;
        AdoptionReadiness = adoptionReadiness;

        var tni = TniCalculationEngine.Calculate(urgencyScore, impactScore, investmentCapacity, adoptionReadiness);
        TniScore = tni.Score;
        TniClassification = tni.Classification.ToString();

        Status = DemandItemStatuses.Pending;
        IsPublicListed = false;
        CreatedBy = createdBy;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public Guid? SurveyId { get; private set; }
    public string ItemCode { get; private set; } = default!;
    public string StageName { get; private set; } = default!;
    public string TechnicalProblem { get; private set; } = default!;
    public string? DesiredSolution { get; private set; }
    public bool NeedConsulting { get; private set; }
    public string ExpectedGoal { get; private set; } = default!;
    public string? ApplicationScale { get; private set; }
    public string SectorCode { get; private set; } = default!;
    public string TechGroupCode { get; private set; } = default!;
    public string DemandTypeCode { get; private set; } = default!;
    public string BudgetRange { get; private set; } = default!;

    public int UrgencyScore { get; private set; }
    public int ImpactScore { get; private set; }
    public int InvestmentCapacity { get; private set; }
    public int AdoptionReadiness { get; private set; }
    public int TniScore { get; private set; }
    public string TniClassification { get; private set; } = default!;

    public string Status { get; private set; } = DemandItemStatuses.Pending;
    public bool IsPublicListed { get; private set; }
    public Guid? AssignedExpertId { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public void VerifyAndPublish()
    {
        Status = DemandItemStatuses.Verified;
        IsPublicListed = true;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AssignExpert(Guid expertId)
    {
        AssignedExpertId = expertId;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
