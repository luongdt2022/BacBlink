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
        TniVerificationStatus = "SELF_DECLARED";
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
    // TniVerificationStatus: SELF_DECLARED, PENDING_VERIFICATION, VERIFIED_BY_GOV
    public string TniVerificationStatus { get; private set; } = "SELF_DECLARED";
    public string? VerifiedAuthorityName { get; private set; }
    public string? TniReviewNote { get; private set; }
    public Guid? AssignedExpertId { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public void VerifyAndPublish(string? authorityName = null)
    {
        Status = DemandItemStatuses.Verified;
        IsPublicListed = true;
        TniVerificationStatus = "VERIFIED_BY_GOV";
        if (!string.IsNullOrWhiteSpace(authorityName))
        {
            VerifiedAuthorityName = authorityName;
        }
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void VerifyTni(string decision, string? authorityName, string? note = null)
    {
        if (string.IsNullOrWhiteSpace(decision))
            throw new ArgumentException("Quyết định kiểm định TNI không được để trống.", nameof(decision));

        var norm = decision.Trim().ToUpperInvariant();
        string mappedStatus = norm switch
        {
            "VERIFIED_BY_GOV" or "VERIFIED" or "APPROVE" or "APPROVED" => "VERIFIED_BY_GOV",
            "PENDING_VERIFICATION" => "PENDING_VERIFICATION",
            "SELF_DECLARED" => "SELF_DECLARED",
            _ => throw new ArgumentException($"Quyết định kiểm định TNI không hợp lệ: '{decision}'. Chỉ chấp nhận: VERIFIED_BY_GOV, PENDING_VERIFICATION, SELF_DECLARED.", nameof(decision))
        };

        if (mappedStatus.Length > 30)
            throw new ArgumentException("Mã trạng thái TNI vượt quá độ dài tối đa 30 ký tự.", nameof(decision));

        TniVerificationStatus = mappedStatus;
        if (!string.IsNullOrWhiteSpace(authorityName)) VerifiedAuthorityName = authorityName;
        if (note != null) TniReviewNote = note;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AssignExpert(Guid expertId)
    {
        AssignedExpertId = expertId;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Update(
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
        int adoptionReadiness)
    {
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

        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Close()
    {
        Status = DemandItemStatuses.Closed;
        IsPublicListed = false;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
