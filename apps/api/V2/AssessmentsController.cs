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
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static string NormalizeScopeId(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "TP_BN";
        var s = raw.Trim();
        if (s.Equals("TP. Bắc Ninh", StringComparison.OrdinalIgnoreCase) || s.Equals("Bắc Ninh", StringComparison.OrdinalIgnoreCase)) return "TP_BN";
        if (s.Equals("TP. Từ Sơn", StringComparison.OrdinalIgnoreCase)) return "TU_SON";
        if (s.Equals("TX. Quế Võ", StringComparison.OrdinalIgnoreCase)) return "QUE_VO";
        if (s.Equals("TX. Thuận Thành", StringComparison.OrdinalIgnoreCase)) return "THUAN_THANH";
        if (s.Equals("H. Yên Phong", StringComparison.OrdinalIgnoreCase)) return "YEN_PHONG";
        if (s.Equals("H. Tiên Du", StringComparison.OrdinalIgnoreCase)) return "TIEN_DU";
        if (s.Equals("H. Gia Bình", StringComparison.OrdinalIgnoreCase)) return "GIA_BINH";
        if (s.Equals("H. Lương Tài", StringComparison.OrdinalIgnoreCase)) return "LUONG_TAI";
        if (s.Equals("Hà Nội", StringComparison.OrdinalIgnoreCase)) return "HN";
        if (s.Equals("Tiền Giang", StringComparison.OrdinalIgnoreCase)) return "TG";
        if (s.Equals("Ninh Thuận", StringComparison.OrdinalIgnoreCase)) return "NT";
        if (s.Equals("Hải Phòng", StringComparison.OrdinalIgnoreCase)) return "HP";
        if (s.Equals("Đà Nẵng", StringComparison.OrdinalIgnoreCase)) return "DN";
        return s.ToUpperInvariant();
    }

    private static string NormalizeIndustryCode(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "BACLINK_DEFAULT";
        var normalized = raw.Trim().ToUpperInvariant();
        if (Tt17ScoringEngine.Benchmarks.ContainsKey(normalized) || Tt17ScoringEngine.BaclinkIndustryMapping.ContainsKey(normalized))
        {
            return normalized;
        }
        return normalized.StartsWith("IND_", StringComparison.Ordinal) || normalized.StartsWith("C.", StringComparison.Ordinal)
            ? normalized
            : "BACLINK_DEFAULT";
    }

    private static Tt17AssessmentDto MapEntityToDto(Tt17Assessment entity)
    {
        Tt17SurveyDataDto? survey = null;
        Tt17ScoreResultDto? scores = null;

        try
        {
            if (!string.IsNullOrWhiteSpace(entity.SurveyDataJson))
            {
                survey = JsonSerializer.Deserialize<Tt17SurveyDataDto>(entity.SurveyDataJson, JsonOpts);
            }
        }
        catch
        {
            survey = new Tt17SurveyDataDto();
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(entity.ScoresJson))
            {
                scores = JsonSerializer.Deserialize<Tt17ScoreResultDto>(entity.ScoresJson, JsonOpts);
            }
        }
        catch
        {
            scores = null;
        }

        survey ??= new Tt17SurveyDataDto();
        if (
            scores == null ||
            scores.Criteria == null ||
            scores.Criteria.Count == 0 ||
            (scores.ScoreT == 0 && scores.ScoreE == 0 && scores.ScoreO == 0 && scores.ScoreR == 0 && scores.ScoreI == 0)
        )
        {
            scores = ScoringEngine.Calculate(survey, entity.IndustryCode);
        }

        return new Tt17AssessmentDto
        {
            Id = entity.Id,
            EnterpriseId = entity.EnterpriseId,
            EnterpriseName = entity.EnterpriseName,
            TaxCode = entity.TaxCode,
            AssessmentYear = entity.AssessmentYear,
            Status = entity.Status,
            ScopeType = entity.ScopeType,
            ScopeId = NormalizeScopeId(entity.ScopeId),
            IndustryCode = NormalizeIndustryCode(entity.IndustryCode),
            SurveyData = survey,
            ScoreResult = scores,
            ReviewNotes = entity.ReviewNotes,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            SubmittedAt = entity.SubmittedAtUtc ?? entity.CreatedAt,
            ApprovedAt = entity.ApprovedAtUtc
        };
    }

    private static IEnumerable<KeyValuePair<Guid, Tt17AssessmentDto>> SeedInitialAssessments()
    {
        return Enumerable.Empty<KeyValuePair<Guid, Tt17AssessmentDto>>();
    }

    private async Task<List<Tt17AssessmentDto>> LoadAllAssessmentsAsync(CancellationToken ct = default)
    {
        var dbEntities = await db.Set<Tt17Assessment>()
            .AsNoTracking()
            .OrderByDescending(x => x.UpdatedAt)
            .ToListAsync(ct);

        var result = new List<Tt17AssessmentDto>(dbEntities.Count + AssessmentsStore.Count);
        var seenIds = new HashSet<Guid>();

        foreach (var entity in dbEntities)
        {
            var dto = MapEntityToDto(entity);
            result.Add(dto);
            seenIds.Add(dto.Id);
        }

        foreach (var kv in AssessmentsStore)
        {
            if (!seenIds.Contains(kv.Key))
            {
                result.Add(kv.Value);
            }
        }

        return result;
    }

    [AllowAnonymous]
    [HttpGet("api/v1/assessments/tt17/current")]
    [HttpGet("api/v2/assessments/tt17/current")]
    public async Task<IActionResult> GetCurrentAssessment([FromQuery] int? year, CancellationToken ct = default)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var all = await LoadAllAssessmentsAsync(ct);
        var existing = all
            .OrderByDescending(x => x.AssessmentYear)
            .ThenByDescending(x => x.UpdatedAt)
            .FirstOrDefault();

        if (existing is null)
        {
            var newDto = new Tt17AssessmentDto
            {
                Id = Guid.NewGuid(),
                EnterpriseId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                EnterpriseName = "Doanh nghiệp Mẫu",
                TaxCode = "0100000000",
                AssessmentYear = targetYear,
                Status = "DRAFT",
                ScopeType = "GLOBAL",
                ScopeId = "TP_BN",
                IndustryCode = "BACLINK_DEFAULT",
                SurveyData = new Tt17SurveyDataDto { IndustryCode = "BACLINK_DEFAULT" },
                ScoreResult = ScoringEngine.Calculate(new Tt17SurveyDataDto { IndustryCode = "BACLINK_DEFAULT" }, "BACLINK_DEFAULT")
            };
            return Ok(new { success = true, data = newDto });
        }

        return Ok(new { success = true, data = existing });
    }

    [AllowAnonymous]
    [HttpGet("api/v1/assessments/tt17/history")]
    [HttpGet("api/v2/assessments/tt17/history")]
    public async Task<IActionResult> GetAssessmentHistory(CancellationToken ct = default)
    {
        var all = await LoadAllAssessmentsAsync(ct);
        var list = all
            .OrderByDescending(x => x.AssessmentYear)
            .ThenByDescending(x => x.UpdatedAt)
            .ToList();

        return Ok(new { success = true, data = list });
    }

    [AllowAnonymous]
    [HttpGet("api/v1/assessments/tt17/{id}")]
    [HttpGet("api/v2/assessments/tt17/{id}")]
    public async Task<IActionResult> GetAssessmentById(Guid id, CancellationToken ct = default)
    {
        var entity = await db.Set<Tt17Assessment>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            return Ok(new { success = true, data = MapEntityToDto(entity) });
        }

        if (AssessmentsStore.TryGetValue(id, out var dto))
        {
            return Ok(new { success = true, data = dto });
        }
        return NotFound(new { success = false, message = "Không tìm thấy hồ sơ đánh giá." });
    }

    [AllowAnonymous]
    [HttpPost("api/v1/assessments/tt17/calculate")]
    [HttpPost("api/v2/assessments/tt17/calculate")]
    public IActionResult CalculateScoreImmediately([FromBody] Tt17SurveyDataDto? survey)
    {
        var effectiveSurvey = survey ?? new Tt17SurveyDataDto { IndustryCode = "BACLINK_DEFAULT" };
        var result = ScoringEngine.Calculate(effectiveSurvey, NormalizeIndustryCode(effectiveSurvey.IndustryCode));
        return Ok(new { success = true, data = result });
    }

    [AllowAnonymous]
    [HttpPut("api/v1/assessments/tt17/draft")]
    [HttpPut("api/v2/assessments/tt17/draft")]
    [HttpPost("api/v1/assessments/tt17/draft")]
    [HttpPost("api/v2/assessments/tt17/draft")]
    public async Task<IActionResult> SaveAssessmentDraft([FromBody] SaveAssessmentDraftDto? payload, CancellationToken ct = default)
    {
        if (payload == null)
        {
            return BadRequest(new { success = false, message = "Dữ liệu lưu nháp không được để trống." });
        }

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
        existing.IndustryCode = NormalizeIndustryCode(!string.IsNullOrWhiteSpace(payload.IndustryCode) ? payload.IndustryCode : payload.SurveyData?.IndustryCode);
        existing.ScopeId = NormalizeScopeId(payload.ScopeId);
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
    public async Task<IActionResult> SubmitAssessment([FromBody] SaveAssessmentDraftDto? payload, CancellationToken ct = default)
    {
        if (payload == null)
        {
            return BadRequest(new { success = false, message = "Dữ liệu khảo sát không được để trống." });
        }

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
        existing.IndustryCode = NormalizeIndustryCode(!string.IsNullOrWhiteSpace(payload.IndustryCode) ? payload.IndustryCode : payload.SurveyData?.IndustryCode);
        existing.ScopeId = NormalizeScopeId(payload.ScopeId);
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


    private static bool ComputeHasRawSurvey(Tt17SurveyDataDto? s)
    {
        if (s is null) return false;
        return s.OriginalCostEquipment > 0
            || s.CurrentBookValueEquipment > 0
            || (s.Machineries is not null && s.Machineries.Count > 0)
            || s.DepreciationCoefficient > 0
            || s.ModernEquipmentRatio > 0
            || s.AutomationRatio > 0
            || s.TotalWorkforce > 0
            || s.DirectWorkers > 0
            || s.TrainedWorkers > 0
            || s.EnergyCostYear > 0
            || s.MaterialCostYear > 0
            || s.TrainingCost3Years > 0
            || s.ItExpenses3Years > 0
            || s.RdExpenses3Years > 0;
    }

    private static Tt17AssessmentDto ToSummaryDto(Tt17AssessmentDto x) => new()
    {
        Id = x.Id,
        EnterpriseId = x.EnterpriseId,
        EnterpriseName = x.EnterpriseName,
        TaxCode = x.TaxCode,
        AssessmentYear = x.AssessmentYear,
        Status = x.Status,
        ScopeType = x.ScopeType,
        ScopeId = x.ScopeId,
        IndustryCode = x.IndustryCode,
        HasRawSurvey = ComputeHasRawSurvey(x.SurveyData),
        SurveyData = new Tt17SurveyDataDto
        {
            CompanyName = x.SurveyData?.CompanyName ?? x.EnterpriseName,
            TaxCode = x.SurveyData?.TaxCode ?? x.TaxCode,
        },
        ScoreResult = x.ScoreResult is null
            ? new Tt17ScoreResultDto()
            : new Tt17ScoreResultDto
            {
                ScoreT = x.ScoreResult.ScoreT,
                ScoreE = x.ScoreResult.ScoreE,
                ScoreO = x.ScoreResult.ScoreO,
                ScoreR = x.ScoreResult.ScoreR,
                ScoreI = x.ScoreResult.ScoreI,
                TotalScore = x.ScoreResult.TotalScore,
                SyncCoefficient = x.ScoreResult.SyncCoefficient,
                Classification = x.ScoreResult.Classification,
                ClassificationLabel = x.ScoreResult.ClassificationLabel,
                Criteria = new List<CriterionScoreDto>(),
                Bottlenecks = x.ScoreResult.Bottlenecks ?? new List<string>()
            },
        ReviewNotes = x.ReviewNotes,
        CreatedAt = x.CreatedAt,
        UpdatedAt = x.UpdatedAt,
        SubmittedAt = x.SubmittedAt,
        ApprovedAt = x.ApprovedAt
    };

    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    [HttpGet("api/v1/gov/assessments/tt17")]
    [HttpGet("api/v2/gov/assessments/tt17")]
    public IActionResult GetGovAssessmentQueue(
        [FromQuery] string? scopeId,
        [FromQuery] string? status,
        [FromQuery] bool summary = false)
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Cổng Sở KH&CN (/api/v*/gov/assessments/tt17) đã ngừng hoạt động trên hệ thống BACLINK."
        });

    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    [HttpGet("api/v1/gov/assessments/tt17/dashboard")]
    [HttpGet("api/v2/gov/assessments/tt17/dashboard")]
    public IActionResult GetGovTt17DashboardDeprecated()
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Endpoint /api/v*/gov/assessments/tt17/dashboard đã ngừng hoạt động. Vui lòng sử dụng /api/v1/admin/assessments/tt17/dashboard."
        });

    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    [HttpGet("api/v1/admin/assessments/tt17/dashboard")]
    [HttpGet("api/v2/admin/assessments/tt17/dashboard")]
    public async Task<IActionResult> GetTt17Dashboard(
        [FromQuery] string? scopeId,
        [FromQuery] string? industryCode,
        [FromQuery] string? classification,
        CancellationToken ct = default)
    {
        var all = await LoadAllAssessmentsAsync(ct);

        var filtered = all.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(scopeId) && !scopeId.Trim().Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            var normalizedScope = NormalizeScopeId(scopeId);
            filtered = filtered.Where(x => NormalizeScopeId(x.ScopeId).Equals(normalizedScope, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(industryCode) && !industryCode.Trim().Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            filtered = filtered.Where(x => x.IndustryCode.Equals(industryCode.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(classification) && !classification.Trim().Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            filtered = filtered.Where(x => (x.ScoreResult?.Classification ?? "").Equals(classification.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        var items = filtered.ToList();
        var total = items.Count;

        var provinceNameMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["TP_BN"] = "TP. Bắc Ninh",
            ["TU_SON"] = "TP. Từ Sơn",
            ["QUE_VO"] = "TX. Quế Võ",
            ["THUAN_THANH"] = "TX. Thuận Thành",
            ["YEN_PHONG"] = "H. Yên Phong",
            ["TIEN_DU"] = "H. Tiên Du",
            ["GIA_BINH"] = "H. Gia Bình",
            ["LUONG_TAI"] = "H. Lương Tài",
            ["NGOAI_TINH"] = "Đối tác FDI / Ngoài tỉnh",
            ["TG"] = "Tỉnh Tiền Giang",
            ["NT"] = "Tỉnh Ninh Thuận",
            ["HN"] = "TP. Hà Nội",
            ["HP"] = "TP. Hải Phòng",
            ["DN"] = "TP. Đà Nẵng",
            ["SG"] = "TP. Hồ Chí Minh"
        };

        var byProvince = all
            .GroupBy(x => NormalizeScopeId(x.ScopeId))
            .Select(g =>
            {
                var pItems = g.ToList();
                var pCount = pItems.Count;
                return new
                {
                    scopeId = g.Key,
                    provinceName = provinceNameMap.TryGetValue(g.Key, out var pName) ? pName : $"Tỉnh/TP ({g.Key})",
                    count = pCount,
                    approvedCount = pItems.Count(x => x.Status == "APPROVED"),
                    submittedCount = pItems.Count(x => x.Status == "SUBMITTED"),
                    avgTotalScore = pCount > 0 ? Math.Round(pItems.Average(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0,
                    maxTotalScore = pCount > 0 ? Math.Round(pItems.Max(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0,
                    minTotalScore = pCount > 0 ? Math.Round(pItems.Min(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0,
                    avgScoreT = pCount > 0 ? Math.Round(pItems.Average(x => x.ScoreResult?.ScoreT ?? 0), 2) : 0,
                    avgScoreE = pCount > 0 ? Math.Round(pItems.Average(x => x.ScoreResult?.ScoreE ?? 0), 2) : 0,
                    avgScoreO = pCount > 0 ? Math.Round(pItems.Average(x => x.ScoreResult?.ScoreO ?? 0), 2) : 0,
                    avgScoreR = pCount > 0 ? Math.Round(pItems.Average(x => x.ScoreResult?.ScoreR ?? 0), 2) : 0,
                    avgScoreI = pCount > 0 ? Math.Round(pItems.Average(x => x.ScoreResult?.ScoreI ?? 0), 2) : 0,
                    avgSyncCoefficient = pCount > 0 ? Math.Round(pItems.Average(x => x.ScoreResult?.SyncCoefficient ?? 0), 3) : 0,
                    tienTienCount = pItems.Count(x => x.ScoreResult?.Classification == "TIEN_TIEN"),
                    trungBinhTienTienCount = pItems.Count(x => x.ScoreResult?.Classification == "TRUNG_BINH_TIEN_TIEN"),
                    trungBinhCount = pItems.Count(x => x.ScoreResult?.Classification == "TRUNG_BINH"),
                    lacHauCount = pItems.Count(x => x.ScoreResult?.Classification == "LAC_HAU" || x.ScoreResult?.Classification == "CAN_THAM_DINH")
                };
            })
            .OrderByDescending(x => x.count)
            .ToList();

        var classificationOrder = new[]
        {
            ("TIEN_TIEN", "Trình độ Tiên tiến (≥ 75đ)"),
            ("TRUNG_BINH_TIEN_TIEN", "Trung bình Tiên tiến (60–74đ)"),
            ("TRUNG_BINH", "Trình độ Trung bình (35–59đ)"),
            ("LAC_HAU", "Trình độ Lạc hậu (< 35đ)")
        };

        var byClassification = classificationOrder.Select(c =>
        {
            var matched = items.Where(x =>
                c.Item1 == "LAC_HAU"
                    ? (x.ScoreResult?.Classification == "LAC_HAU" || x.ScoreResult?.Classification == "CAN_THAM_DINH")
                    : x.ScoreResult?.Classification == c.Item1
            ).ToList();
            return new
            {
                classification = c.Item1,
                label = c.Item2,
                count = matched.Count,
                percentage = total > 0 ? Math.Round(matched.Count * 100.0 / total, 1) : 0,
                avgScore = matched.Count > 0 ? Math.Round(matched.Average(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0
            };
        }).ToList();

        var byIndustry = items
            .GroupBy(x => NormalizeIndustryCode(x.IndustryCode))
            .Select(g =>
            {
                var iItems = g.ToList();
                var iCount = iItems.Count;
                var benchmark = Tt17ScoringEngine.ResolveBenchmark(g.Key);
                return new
                {
                    industryCode = g.Key,
                    industryName = benchmark.IndustryName,
                    count = iCount,
                    percentage = total > 0 ? Math.Round(iCount * 100.0 / total, 1) : 0,
                    avgTotalScore = iCount > 0 ? Math.Round(iItems.Average(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0,
                    avgScoreT = iCount > 0 ? Math.Round(iItems.Average(x => x.ScoreResult?.ScoreT ?? 0), 2) : 0,
                    avgScoreE = iCount > 0 ? Math.Round(iItems.Average(x => x.ScoreResult?.ScoreE ?? 0), 2) : 0,
                    avgScoreO = iCount > 0 ? Math.Round(iItems.Average(x => x.ScoreResult?.ScoreO ?? 0), 2) : 0,
                    avgScoreR = iCount > 0 ? Math.Round(iItems.Average(x => x.ScoreResult?.ScoreR ?? 0), 2) : 0,
                    avgScoreI = iCount > 0 ? Math.Round(iItems.Average(x => x.ScoreResult?.ScoreI ?? 0), 2) : 0
                };
            })
            .OrderByDescending(x => x.count)
            .ToList();

        var allCriteria = items
            .Where(x => x.ScoreResult?.Criteria != null)
            .SelectMany(x => x.ScoreResult.Criteria)
            .GroupBy(c => c.Code)
            .Select(g =>
            {
                var cList = g.ToList();
                var first = cList.First();
                var avgAchieved = cList.Count > 0 ? Math.Round(cList.Average(c => c.AchievedScore), 2) : 0;
                var maxScore = first.MaxScore > 0 ? first.MaxScore : 1;
                var bottleneckCnt = cList.Count(c => c.IsBottleneck || c.AchievedScore < c.MaxScore * 0.5);
                return new
                {
                    code = g.Key,
                    group = first.Group,
                    name = first.Name,
                    maxScore = first.MaxScore,
                    avgScore = avgAchieved,
                    achievementRate = Math.Round(avgAchieved * 100.0 / maxScore, 1),
                    bottleneckCount = bottleneckCnt,
                    bottleneckRate = cList.Count > 0 ? Math.Round(bottleneckCnt * 100.0 / cList.Count, 1) : 0
                };
            })
            .OrderBy(c => c.code)
            .ToList();

        var topEnterprises = items
            .OrderByDescending(x => x.ScoreResult?.TotalScore ?? 0)
            .Take(15)
            .Select(x => new
            {
                id = x.Id,
                enterpriseName = x.EnterpriseName,
                taxCode = x.TaxCode,
                scopeId = x.ScopeId,
                industryCode = x.IndustryCode,
                status = x.Status,
                totalScore = x.ScoreResult?.TotalScore ?? 0,
                scoreT = x.ScoreResult?.ScoreT ?? 0,
                scoreE = x.ScoreResult?.ScoreE ?? 0,
                scoreO = x.ScoreResult?.ScoreO ?? 0,
                scoreR = x.ScoreResult?.ScoreR ?? 0,
                scoreI = x.ScoreResult?.ScoreI ?? 0,
                syncCoefficient = x.ScoreResult?.SyncCoefficient ?? 0,
                classification = x.ScoreResult?.Classification ?? "CAN_THAM_DINH"
            })
            .ToList();

        var bottomEnterprises = items
            .OrderBy(x => x.ScoreResult?.TotalScore ?? 0)
            .Take(15)
            .Select(x => new
            {
                id = x.Id,
                enterpriseName = x.EnterpriseName,
                taxCode = x.TaxCode,
                scopeId = x.ScopeId,
                industryCode = x.IndustryCode,
                status = x.Status,
                totalScore = x.ScoreResult?.TotalScore ?? 0,
                scoreT = x.ScoreResult?.ScoreT ?? 0,
                scoreE = x.ScoreResult?.ScoreE ?? 0,
                scoreO = x.ScoreResult?.ScoreO ?? 0,
                scoreR = x.ScoreResult?.ScoreR ?? 0,
                scoreI = x.ScoreResult?.ScoreI ?? 0,
                syncCoefficient = x.ScoreResult?.SyncCoefficient ?? 0,
                classification = x.ScoreResult?.Classification ?? "CAN_THAM_DINH"
            })
            .ToList();

        return Ok(new
        {
            success = true,
            data = new
            {
                totalAssessments = total,
                approvedCount = items.Count(x => x.Status == "APPROVED"),
                submittedCount = items.Count(x => x.Status == "SUBMITTED"),
                draftCount = items.Count(x => x.Status == "DRAFT"),
                changesRequestedCount = items.Count(x => x.Status == "CHANGES_REQUESTED"),
                avgTotalScore = total > 0 ? Math.Round(items.Average(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0,
                maxTotalScore = total > 0 ? Math.Round(items.Max(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0,
                minTotalScore = total > 0 ? Math.Round(items.Min(x => x.ScoreResult?.TotalScore ?? 0), 2) : 0,
                avgSyncCoefficient = total > 0 ? Math.Round(items.Average(x => x.ScoreResult?.SyncCoefficient ?? 0), 3) : 0,
                avgGroupScores = new
                {
                    scoreT = total > 0 ? Math.Round(items.Average(x => x.ScoreResult?.ScoreT ?? 0), 2) : 0,
                    maxT = 30,
                    scoreE = total > 0 ? Math.Round(items.Average(x => x.ScoreResult?.ScoreE ?? 0), 2) : 0,
                    maxE = 20,
                    scoreO = total > 0 ? Math.Round(items.Average(x => x.ScoreResult?.ScoreO ?? 0), 2) : 0,
                    maxO = 19,
                    scoreR = total > 0 ? Math.Round(items.Average(x => x.ScoreResult?.ScoreR ?? 0), 2) : 0,
                    maxR = 17,
                    scoreI = total > 0 ? Math.Round(items.Average(x => x.ScoreResult?.ScoreI ?? 0), 2) : 0,
                    maxI = 14
                },
                byProvince,
                byClassification,
                byIndustry,
                criteriaStats = allCriteria,
                topEnterprises,
                bottomEnterprises
            }
        });
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    [HttpPost("api/v1/gov/assessments/tt17/{id}/review")]
    [HttpPost("api/v2/gov/assessments/tt17/{id}/review")]
    public IActionResult ReviewAssessment(Guid id, [FromBody] ReviewAssessmentDto? payload)
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Cổng Sở KH&CN (/api/v*/gov/assessments/tt17/{id}/review) đã ngừng hoạt động trên hệ thống BACLINK."
        });
}
