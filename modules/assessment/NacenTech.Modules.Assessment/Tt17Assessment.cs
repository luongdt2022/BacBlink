using System;
using System.Text.Json;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Assessment;

public class Tt17Assessment : AggregateRoot
{
    public Guid EnterpriseId { get; private set; }
    public string EnterpriseName { get; private set; } = "";
    public string TaxCode { get; private set; } = "";
    public int AssessmentYear { get; private set; }
    public string ScopeType { get; private set; } = "PROVINCE";
    public string ScopeId { get; private set; } = "";
    public string IndustryCode { get; private set; } = "";
    public string Status { get; private set; } = "DRAFT"; // DRAFT, SUBMITTED, IN_REVIEW, CHANGES_REQUESTED, APPROVED

    // Lưu trữ Hybrid JSONB
    public string SurveyDataJson { get; private set; } = "{}";
    public string ScoresJson { get; private set; } = "{}";

    public Guid? ReviewerId { get; private set; }
    public string? ReviewNotes { get; private set; }
    public string? AuditTrailJson { get; private set; }

    public DateTimeOffset? SubmittedAtUtc { get; private set; }
    public DateTimeOffset? ApprovedAtUtc { get; private set; }

    private Tt17Assessment() { } // EF Core

    public Tt17Assessment(Guid enterpriseId, string enterpriseName, string taxCode, int assessmentYear, string scopeId, string industryCode)
    {
        if (enterpriseId == Guid.Empty)
            throw new ArgumentException("Mã doanh nghiệp không được để trống.", nameof(enterpriseId));
        if (string.IsNullOrWhiteSpace(scopeId))
            throw new ArgumentException("Phạm vi không được để trống.", nameof(scopeId));
        if (assessmentYear < 2000 || assessmentYear > DateTime.UtcNow.Year + 1)
            throw new ArgumentOutOfRangeException(nameof(assessmentYear), "Năm đánh giá không hợp lệ.");

        Id = Guid.NewGuid();
        EnterpriseId = enterpriseId;
        EnterpriseName = string.IsNullOrWhiteSpace(enterpriseName) ? "Doanh nghiệp sản xuất" : enterpriseName.Trim();
        TaxCode = string.IsNullOrWhiteSpace(taxCode) ? "0100000000" : taxCode.Trim();
        AssessmentYear = assessmentYear;
        ScopeType = "PROVINCE";
        ScopeId = scopeId.Trim();
        IndustryCode = string.IsNullOrWhiteSpace(industryCode) ? "C.10" : industryCode.Trim();
        Status = "DRAFT";
    }

    public void UpdateDraft(string surveyDataJson, string scoresJson)
    {
        if (Status is not "DRAFT" and not "CHANGES_REQUESTED")
            throw new InvalidOperationException("Chỉ được chỉnh sửa khi hồ sơ ở trạng thái Nháp hoặc Cần bổ sung.");

        SurveyDataJson = string.IsNullOrWhiteSpace(surveyDataJson) ? "{}" : surveyDataJson;
        ScoresJson = string.IsNullOrWhiteSpace(scoresJson) ? "{}" : scoresJson;
        Touch();
    }

    public void Submit(string finalScoresJson)
    {
        if (Status is not "DRAFT" and not "CHANGES_REQUESTED")
            throw new InvalidOperationException("Chỉ có thể nộp hồ sơ từ trạng thái Nháp hoặc Cần bổ sung.");

        ScoresJson = string.IsNullOrWhiteSpace(finalScoresJson) ? ScoresJson : finalScoresJson;
        Status = "SUBMITTED";
        SubmittedAtUtc = DateTimeOffset.UtcNow;
        Touch();
    }

    public void Review(string action, Guid reviewerId, string? notes, string? adjustedScoresJson)
    {
        if (Status is not "SUBMITTED" and not "IN_REVIEW")
            throw new InvalidOperationException("Hồ sơ chưa được nộp hoặc không ở trạng thái thẩm định.");

        ReviewerId = reviewerId;
        ReviewNotes = notes;

        var normalizedAction = action.Trim().ToUpperInvariant();
        switch (normalizedAction)
        {
            case "APPROVE":
                Status = "APPROVED";
                ApprovedAtUtc = DateTimeOffset.UtcNow;
                if (!string.IsNullOrWhiteSpace(adjustedScoresJson))
                {
                    ScoresJson = adjustedScoresJson;
                }
                break;

            case "REJECT":
                Status = "REJECTED";
                break;

            case "REQUEST_CHANGES":
                Status = "CHANGES_REQUESTED";
                break;

            default:
                throw new ArgumentException($"Hành động thẩm định '{action}' không hợp lệ.");
        }

        Touch();
    }
}
