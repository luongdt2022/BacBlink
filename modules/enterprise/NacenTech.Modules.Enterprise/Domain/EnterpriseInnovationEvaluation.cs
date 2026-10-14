using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Enterprise.Domain;

public class EnterpriseInnovationEvaluation : AggregateRoot
{
    public EnterpriseInnovationEvaluation() { }

    public EnterpriseInnovationEvaluation(Guid id)
    {
        Id = id;
    }

    public Guid EnterpriseId { get; set; }
    public string TaxCode { get; set; } = string.Empty;
    public int EvaluationYear { get; set; } = 2024;
    public string CriteriaVersion { get; set; } = "v1.0";
    public decimal TotalScore { get; set; } = 0.0m;
    public string Classification { get; set; } = "UNRATED"; // LEADING, DEVELOPING, POTENTIAL, UNRATED
    public string GroupScoresJson { get; set; } = "{}";
    public string CriteriaDetailsJson { get; set; } = "[]";
    public string Status { get; set; } = "DRAFT_CALCULATED"; // DRAFT_CALCULATED, SUBMITTED, APPROVED, REJECTED
    public string? ReviewedBy { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? Notes { get; set; }

    public void Approve(string reviewer, string? notes = null)
    {
        Status = "APPROVED";
        ReviewedBy = reviewer;
        ReviewedAt = DateTimeOffset.UtcNow;
        Notes = notes;
        Touch();
    }

    public void Reject(string reviewer, string reason)
    {
        Status = "REJECTED";
        ReviewedBy = reviewer;
        ReviewedAt = DateTimeOffset.UtcNow;
        Notes = reason;
        Touch();
    }

    public void Submit()
    {
        Status = "SUBMITTED";
        Touch();
    }

    public void TouchEvaluation() => Touch();
}
