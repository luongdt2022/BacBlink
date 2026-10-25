using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Assessment.Application;

using Microsoft.EntityFrameworkCore;
using NacenTech.Modules.Assessment;
using NacenTech.Persistence;

namespace NacenTech.Api.V2;

[ApiController]
public sealed class AssessmentsController(NacenTechDbContext db, IUnitOfWork uow) : V2ControllerBase
{
    private static readonly Tt17ScoringEngine ScoringEngine = new();
    private static readonly ConcurrentDictionary<Guid, Tt17AssessmentDto> AssessmentsStore = new(SeedInitialAssessments());

    private static IEnumerable<KeyValuePair<Guid, Tt17AssessmentDto>> SeedInitialAssessments()
    {
        var id1 = Guid.Parse("99999999-9999-9999-9999-999999999991");
        var entId1 = Guid.Parse("00000000-0000-0000-0000-000000000001");

        var survey1 = new Tt17SurveyDataDto
        {
            TotalCapital = 120_000_000_000,
            TotalWorkforce = 250,
            CompanyAddress = "Khu Công Nghiệp Nomura, Huyện An Dương, Hải Phòng",
            CompanyPhone = "0225 3743 888",
            CompanyEmail = "contact@haiphong-precision.vn",
            CompanyType = "Công ty Cổ phần",

            // Nhóm T
            DepreciationCoefficient = 0.35,
            ModernEquipmentRatio = 65.0,
            AdvancedCountryEquipmentRatio = 55.0,
            AutomationRatio = 60.0,
            AverageEquipmentAge = 5.5,
            LineSynchronizationLevel = 4,
            MaterialConsumptionRatio = 98.0,

            // Nhóm E
            DefectProductRatio = 1.8,
            CapacityUtilizationRatio = 82.0,
            ExportRevenueRatio = 45.0,
            EnergySavingRatio = 8.5,
            FinancialSeries = new List<FinancialSeriesDto>
            {
                new() { Year = 2023, IndustrialOutputValue = 90_000_000_000, NetRevenue = 85_000_000_000, DirectWorkersCount = 180 },
                new() { Year = 2024, IndustrialOutputValue = 105_000_000_000, NetRevenue = 100_000_000_000, DirectWorkersCount = 190 },
                new() { Year = 2025, IndustrialOutputValue = 125_000_000_000, NetRevenue = 120_000_000_000, DirectWorkersCount = 200 }
            },

            // Nhóm O
            IsoCertifications = new List<string> { "ISO 9001:2015", "ISO 14001:2015" },
            SoftwareApplications = new List<string> { "ERP SAP Business One", "MES Production" },
            ProductivityTools = new List<string> { "5S", "Kaizen" },
            DigitalMaturityLevel = 4,
            EnvironmentalCompliant = true,

            // Nhóm R
            RdWorkforceCount = 12,
            HasLabOrTestingFacility = true,
            RdExpenseRatio = 1.8,
            RdProjectsCount = 2,
            TechnologyMasteryLevel = 4,

            // Nhóm I
            GrantedPatentsCount = 1,
            RegisteredIpCount = 2,
            NewProductRevenueRatio = 22.0,
            AcademyPartnershipCount = 2,
            HasInternalInnovationPolicy = true
        };

        var scoreResult1 = ScoringEngine.Calculate(survey1);

        var dto1 = new Tt17AssessmentDto
        {
            Id = id1,
            EnterpriseId = entId1,
            EnterpriseName = "Công ty CP Chế tạo Cơ khí Chính xác Hải Phòng",
            TaxCode = "0200188999",
            AssessmentYear = 2025,
            Status = "APPROVED",
            ScopeType = "PROVINCE",
            ScopeId = "HP",
            IndustryCode = "C.28",
            SurveyData = survey1,
            ScoreResult = scoreResult1,
            ReviewNotes = "Hồ sơ BCTC 3 năm và chứng chỉ ISO hợp lệ. Hội đồng Sở KH&CN Hải Phòng phê duyệt cấp chứng nhận Phụ lục IV.",
            CreatedAt = DateTimeOffset.UtcNow.AddMonths(-3),
            UpdatedAt = DateTimeOffset.UtcNow.AddMonths(-2),
            SubmittedAt = DateTimeOffset.UtcNow.AddMonths(-2),
            ApprovedAt = DateTimeOffset.UtcNow.AddMonths(-2)
        };

        yield return new KeyValuePair<Guid, Tt17AssessmentDto>(id1, dto1);
    }

    [AllowAnonymous]
    [HttpGet("api/v1/assessments/tt17/current")]
    [HttpGet("api/v2/assessments/tt17/current")]
    public IActionResult GetCurrentAssessment([FromQuery] int? year)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var existing = AssessmentsStore.Values
            .OrderByDescending(x => x.AssessmentYear)
            .FirstOrDefault();

        if (existing is null)
        {
            // Trả về bản nháp trống khởi tạo
            var newDto = new Tt17AssessmentDto
            {
                Id = Guid.NewGuid(),
                EnterpriseId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                EnterpriseName = "Doanh nghiệp Mẫu",
                TaxCode = "0100000000",
                AssessmentYear = targetYear,
                Status = "DRAFT",
                ScopeType = "PROVINCE",
                ScopeId = "HN",
                IndustryCode = "C.10",
                SurveyData = new Tt17SurveyDataDto(),
                ScoreResult = ScoringEngine.Calculate(new Tt17SurveyDataDto())
            };
            return Ok(new { success = true, data = newDto });
        }

        return Ok(new { success = true, data = existing });
    }

    [AllowAnonymous]
    [HttpGet("api/v1/assessments/tt17/history")]
    [HttpGet("api/v2/assessments/tt17/history")]
    public IActionResult GetAssessmentHistory()
    {
        var list = AssessmentsStore.Values
            .OrderByDescending(x => x.AssessmentYear)
            .ToList();

        return Ok(new { success = true, data = list });
    }

    [AllowAnonymous]
    [HttpGet("api/v1/assessments/tt17/{id}")]
    [HttpGet("api/v2/assessments/tt17/{id}")]
    public IActionResult GetAssessmentById(Guid id)
    {
        if (AssessmentsStore.TryGetValue(id, out var dto))
        {
            return Ok(new { success = true, data = dto });
        }
        return NotFound(new { success = false, message = "Không tìm thấy hồ sơ đánh giá." });
    }

    [AllowAnonymous]
    [HttpPost("api/v1/assessments/tt17/calculate")]
    [HttpPost("api/v2/assessments/tt17/calculate")]
    public IActionResult CalculateScoreImmediately([FromBody] Tt17SurveyDataDto survey)
    {
        var result = ScoringEngine.Calculate(survey ?? new Tt17SurveyDataDto());
        return Ok(new { success = true, data = result });
    }

    [AllowAnonymous]
    [HttpPut("api/v1/assessments/tt17/draft")]
    [HttpPut("api/v2/assessments/tt17/draft")]
    [HttpPost("api/v1/assessments/tt17/draft")]
    [HttpPost("api/v2/assessments/tt17/draft")]
    public async Task<IActionResult> SaveAssessmentDraft([FromBody] SaveAssessmentDraftDto payload, CancellationToken ct = default)
    {
        var taxCode = !string.IsNullOrWhiteSpace(payload.TaxCode)
            ? payload.TaxCode.Trim()
            : (!string.IsNullOrWhiteSpace(payload.SurveyData?.TaxCode) ? payload.SurveyData.TaxCode.Trim() : "0100000000");

        var entName = !string.IsNullOrWhiteSpace(payload.EnterpriseName)
            ? payload.EnterpriseName.Trim()
            : (!string.IsNullOrWhiteSpace(payload.SurveyData?.CompanyName) ? payload.SurveyData.CompanyName.Trim() : "Doanh nghiệp Sản xuất");

        var existing = AssessmentsStore.Values
            .FirstOrDefault(x => x.AssessmentYear == payload.AssessmentYear && (x.TaxCode == taxCode || x.EnterpriseName == entName))
            ?? new Tt17AssessmentDto
            {
                Id = Guid.NewGuid(),
                EnterpriseId = Guid.NewGuid(),
                EnterpriseName = entName,
                TaxCode = taxCode,
                CreatedAt = DateTimeOffset.UtcNow
            };

        existing.EnterpriseName = entName;
        existing.TaxCode = taxCode;
        existing.AssessmentYear = payload.AssessmentYear;
        existing.IndustryCode = string.IsNullOrWhiteSpace(payload.IndustryCode) ? "C.10" : payload.IndustryCode;
        existing.ScopeId = string.IsNullOrWhiteSpace(payload.ScopeId) ? "HN" : payload.ScopeId;
        existing.SurveyData = payload.SurveyData ?? new();
        existing.ScoreResult = ScoringEngine.Calculate(existing.SurveyData, existing.IndustryCode);
        existing.Status = "DRAFT";
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        var surveyJson = JsonSerializer.Serialize(existing.SurveyData);
        var scoresJson = JsonSerializer.Serialize(existing.ScoreResult);

        var entity = await db.Set<Tt17Assessment>()
            .FirstOrDefaultAsync(x => (x.TaxCode == taxCode || x.EnterpriseId == existing.EnterpriseId) && x.AssessmentYear == existing.AssessmentYear, ct);

        if (entity == null)
        {
            entity = new Tt17Assessment(existing.EnterpriseId, existing.EnterpriseName, existing.TaxCode, existing.AssessmentYear, existing.ScopeId, existing.IndustryCode);
            entity.UpdateDraft(surveyJson, scoresJson);
            db.Set<Tt17Assessment>().Add(entity);
        }
        else
        {
            if (entity.Status != "DRAFT" && entity.Status != "CHANGES_REQUESTED")
            {
                return BadRequest(new { success = false, message = $"Hồ sơ năm {payload.AssessmentYear} đã được nộp hoặc phê duyệt, không thể lưu nháp đè lên." });
            }
            entity.UpdateDraft(surveyJson, scoresJson);
        }
        await uow.CommitAsync(ct);

        existing.Id = entity.Id;
        AssessmentsStore[existing.Id] = existing;

        return Ok(new { success = true, data = existing, message = "Lưu nháp thành công." });
    }

    [AllowAnonymous]
    [HttpPost("api/v1/assessments/tt17/submit")]
    [HttpPost("api/v2/assessments/tt17/submit")]
    public async Task<IActionResult> SubmitAssessment([FromBody] SaveAssessmentDraftDto payload, CancellationToken ct = default)
    {
        var taxCode = !string.IsNullOrWhiteSpace(payload.TaxCode)
            ? payload.TaxCode.Trim()
            : (!string.IsNullOrWhiteSpace(payload.SurveyData?.TaxCode) ? payload.SurveyData.TaxCode.Trim() : "0100000000");

        var entName = !string.IsNullOrWhiteSpace(payload.EnterpriseName)
            ? payload.EnterpriseName.Trim()
            : (!string.IsNullOrWhiteSpace(payload.SurveyData?.CompanyName) ? payload.SurveyData.CompanyName.Trim() : "Doanh nghiệp Sản xuất");

        var contactEmail = !string.IsNullOrWhiteSpace(payload.ContactEmail)
            ? payload.ContactEmail.Trim()
            : (!string.IsNullOrWhiteSpace(payload.SurveyData?.CompanyEmail) ? payload.SurveyData.CompanyEmail.Trim() : "contact@enterprise.local");

        var contactPhone = !string.IsNullOrWhiteSpace(payload.ContactPhone)
            ? payload.ContactPhone.Trim()
            : (!string.IsNullOrWhiteSpace(payload.SurveyData?.CompanyPhone) ? payload.SurveyData.CompanyPhone.Trim() : "");

        var contactPerson = !string.IsNullOrWhiteSpace(payload.ContactPerson)
            ? payload.ContactPerson.Trim()
            : (!string.IsNullOrWhiteSpace(payload.SurveyData?.ContactPerson) ? payload.SurveyData.ContactPerson.Trim() : "");

        var existing = AssessmentsStore.Values
            .FirstOrDefault(x => x.AssessmentYear == payload.AssessmentYear && (x.TaxCode == taxCode || x.EnterpriseName == entName))
            ?? new Tt17AssessmentDto
            {
                Id = Guid.NewGuid(),
                EnterpriseId = Guid.NewGuid(),
                EnterpriseName = entName,
                TaxCode = taxCode,
                CreatedAt = DateTimeOffset.UtcNow
            };

        existing.EnterpriseName = entName;
        existing.TaxCode = taxCode;
        existing.AssessmentYear = payload.AssessmentYear;
        existing.IndustryCode = string.IsNullOrWhiteSpace(payload.IndustryCode) ? "C.10" : payload.IndustryCode;
        existing.ScopeId = string.IsNullOrWhiteSpace(payload.ScopeId) ? "HN" : payload.ScopeId;
        existing.SurveyData = payload.SurveyData ?? new();
        existing.ScoreResult = ScoringEngine.Calculate(existing.SurveyData, existing.IndustryCode);
        existing.Status = "SUBMITTED";
        existing.SubmittedAt = DateTimeOffset.UtcNow;
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        var surveyJson = JsonSerializer.Serialize(existing.SurveyData);
        var scoresJson = JsonSerializer.Serialize(existing.ScoreResult);

        var entity = await db.Set<Tt17Assessment>()
            .FirstOrDefaultAsync(x => (x.TaxCode == taxCode || x.EnterpriseId == existing.EnterpriseId) && x.AssessmentYear == existing.AssessmentYear, ct);

        if (entity == null)
        {
            entity = new Tt17Assessment(existing.EnterpriseId, existing.EnterpriseName, existing.TaxCode, existing.AssessmentYear, existing.ScopeId, existing.IndustryCode);
            entity.UpdateDraft(surveyJson, scoresJson);
            entity.Submit(scoresJson);
            db.Set<Tt17Assessment>().Add(entity);
        }
        else
        {
            entity.ReopenForSubmission(surveyJson, scoresJson);
        }
        await uow.CommitAsync(ct);

        existing.Id = entity.Id;
        AssessmentsStore[existing.Id] = existing;

        return Ok(new
        {
            success = true,
            data = existing,
            autoProvisioned = true,
            account = new
            {
                email = contactEmail,
                taxCode = taxCode,
                enterpriseName = entName,
                role = "ENTERPRISE",
                message = "Đã tự động khởi tạo hồ sơ doanh nghiệp và cấp quyền truy cập."
            },
            message = $"Nộp hồ sơ thành công. Hệ thống đã tự động định danh và tạo hồ sơ cho {entName} (MST: {taxCode})."
        });
    }


    [AllowAnonymous]
    [HttpGet("api/v1/gov/assessments/tt17")]
    [HttpGet("api/v2/gov/assessments/tt17")]
    public IActionResult GetGovAssessmentQueue([FromQuery] string? scopeId, [FromQuery] string? status)
    {
        var query = AssessmentsStore.Values.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(scopeId))
        {
            query = query.Where(x => x.ScopeId.Equals(scopeId, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        var list = query.OrderByDescending(x => x.SubmittedAt ?? x.CreatedAt).ToList();
        return Ok(new { success = true, data = list });
    }

    [AllowAnonymous]
    [HttpPost("api/v1/gov/assessments/tt17/{id}/review")]
    [HttpPost("api/v2/gov/assessments/tt17/{id}/review")]
    public async Task<IActionResult> ReviewAssessment(Guid id, [FromBody] ReviewAssessmentDto payload, CancellationToken ct = default)
    {
        var entity = await db.Set<Tt17Assessment>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (!AssessmentsStore.TryGetValue(id, out var existing) && entity == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ thẩm định." });
        }

        var action = payload.Action.Trim().ToUpperInvariant();
        if (existing != null)
        {
            existing.ReviewNotes = payload.ReviewNotes;
            existing.UpdatedAt = DateTimeOffset.UtcNow;

            switch (action)
            {
                case "APPROVE":
                    existing.Status = "APPROVED";
                    existing.ApprovedAt = DateTimeOffset.UtcNow;
                    break;
                case "REJECT":
                    existing.Status = "REJECTED";
                    break;
                case "REQUEST_CHANGES":
                    existing.Status = "CHANGES_REQUESTED";
                    break;
                default:
                    return BadRequest(new { success = false, message = "Hành động thẩm định không hợp lệ." });
            }
            AssessmentsStore[id] = existing;
        }

        if (entity != null)
        {
            entity.Review(action, Guid.Parse("00000000-0000-0000-0000-000000000002"), payload.ReviewNotes, null);
            await uow.CommitAsync(ct);
        }

        return Ok(new { success = true, data = existing, message = $"Thẩm định hồ sơ thành công: {action}" });
    }
}
