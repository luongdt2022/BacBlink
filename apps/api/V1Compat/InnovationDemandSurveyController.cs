using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Enterprise.Application;
using NacenTech.Modules.Enterprise.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Persistence;

namespace NacenTech.Api.V1Compat;

public class InnovationDemandSurveySubmitRequest
{
    public Guid? EnterpriseId { get; set; }
    public string? TaxCode { get; set; }
    public string? CompanyName { get; set; }
    public JsonElement? Answers { get; set; }
}

[ApiController]
[Route("api/v1/surveys/innovation-demand")]
public sealed class InnovationDemandSurveyController(
    IEnterpriseRepository enterpriseRepo,
    IEnterpriseService enterpriseService,
    NacenTechDbContext db,
    IUnitOfWork uow,
    IPersonService personService,
    IAuditWriter audit) : V1ControllerBase
{
    [HttpGet("prefill")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPrefill([FromQuery] string? taxCode, CancellationToken ct = default)
    {
        Enterprise? ent = null;
        bool isTaxCodeLocked = false;
        bool isAuthenticated = Actor.IsAuthenticated;

        // 1. Nếu người dùng đã đăng nhập: ưu tiên lấy theo tài khoản người dùng
        if (isAuthenticated)
        {
            ent = await enterpriseRepo.GetByOwnerPersonIdAsync(PersonId, ct);
            if (ent is null && !string.IsNullOrWhiteSpace(Actor.Email))
            {
                ent = await enterpriseRepo.GetByContactEmailAsync(Actor.Email, ct);
            }

            if (ent is not null)
            {
                // BR-02-015: Tài khoản đăng nhập đã liên kết doanh nghiệp -> Khóa trường MST
                isTaxCodeLocked = true;
            }
        }

        // 2. Nếu chưa tìm thấy theo user hoặc là khách vãng lai, nhưng có tham số taxCode
        if (ent is null && !string.IsNullOrWhiteSpace(taxCode))
        {
            var cleanTax = taxCode.Trim();
            ent = await enterpriseRepo.GetByTaxCodeAsync(cleanTax, ct);
            // Khách vãng lai tra cứu MST không bị khóa trường MST
            isTaxCodeLocked = false;
        }

        // 3. Nếu tìm thấy doanh nghiệp: trả về autofill DTO đầy đủ
        if (ent is not null)
        {
            var (_, hasMachinery, hasTraining) = await enterpriseRepo.GetSurveyAnswersAsync(ent.Id, ent.TaxCode ?? "", ct);

            var autofillDto = new
            {
                legalName = string.IsNullOrWhiteSpace(ent.LegalName) ? ent.Name : ent.LegalName,
                name = ent.Name,
                taxCode = ent.TaxCode,
                isTaxCodeLocked = isTaxCodeLocked,
                addressDetail = ent.AddressDetail,
                provinceCity = ent.ProvinceCity,
                mainSectorName = ent.MainSectorName,
                sectorCode = ent.SectorCode,
                ownershipType = ent.OwnershipType,
                workforceScale = ent.WorkforceScale,
                revenueRange = ent.RevenueRange,
                operatingZone = ent.OperatingZone,
                highQualificationRatio = ent.HighQualificationRatio,
                hasRdUnit = ent.HasRdUnit,
                hasMachineryUpgrade = hasMachinery,
                hasTechTraining = hasTraining,
                hasRdBudget = ent.HasRdBudget,
                isExporting = ent.IsExporting,
                inValueChain = ent.InValueChain,
                contactPerson = ent.ContactPerson,
                contactEmail = ent.ContactEmail,
                contactPhone = ent.ContactPhone,
                website = ent.Website
            };

            var existingEvaluationDto = new
            {
                hasEvaluated = ent.LatestInnovationScore.HasValue,
                latestScore = ent.LatestInnovationScore,
                latestTier = ent.LatestInnovationTier,
                tniScore = ent.TniScore,
                tniClassification = ent.TniClassification
            };

            return Ok(new
            {
                isAuthenticated = isAuthenticated,
                enterpriseId = ent.Id,
                isVerifiedProfile = ent.IsVerified,
                autofill = autofillDto,
                existingEvaluation = existingEvaluationDto
            });
        }

        // 4. Nếu không tìm thấy: trả về cấu trúc rỗng
        return Ok(new
        {
            isAuthenticated = isAuthenticated,
            enterpriseId = (Guid?)null,
            isVerifiedProfile = false,
            autofill = (object?)null,
            existingEvaluation = new
            {
                hasEvaluated = false,
                latestScore = (decimal?)null,
                latestTier = (string?)null,
                tniScore = (decimal?)null,
                tniClassification = (string?)null
            }
        });
    }

    [HttpPost("submit")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitSurvey([FromBody] InnovationDemandSurveySubmitRequest req, CancellationToken ct = default)
    {
        var answersElem = req.Answers;
        string? answersJson = answersElem.HasValue ? answersElem.Value.GetRawText() : null;

        // Trích xuất các trường định danh cơ bản từ payload hoặc từ answers JSON
        string taxCode = (req.TaxCode ?? TryGetString(answersElem, "c02_tax_code", "tax_code"))?.Trim() ?? "";
        string companyName = (req.CompanyName ?? TryGetString(answersElem, "c01_legal_name", "legal_name", "company_name"))?.Trim() ?? "";

        // =========================================================================
        // BR-02-015: INVARIANT KHÓA ĐỊNH DANH MÃ SỐ THUẾ KHI ĐÃ ĐĂNG NHẬP
        // =========================================================================
        if (Actor.IsAuthenticated)
        {
            var myEnterprise = await enterpriseRepo.GetByOwnerPersonIdAsync(PersonId, ct);
            if (myEnterprise is null && !string.IsNullOrWhiteSpace(Actor.Email))
            {
                myEnterprise = await enterpriseRepo.GetByContactEmailAsync(Actor.Email, ct);
            }

            if (myEnterprise is not null && !string.IsNullOrWhiteSpace(myEnterprise.TaxCode))
            {
                try
                {
                    InnovationSurveyInvariants.ValidateTaxCodeSubmission(
                        isAuthenticated: true,
                        authenticatedEnterpriseTaxCode: myEnterprise.TaxCode,
                        submissionTaxCode: taxCode);
                }
                catch (InvalidOperationException ex) when (ex.Message.Contains(InnovationSurveyInvariants.ErrTaxCodeMismatch))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new
                    {
                        code = InnovationSurveyInvariants.ErrTaxCodeMismatch,
                        message = ex.Message
                    });
                }
            }
        }

        if (string.IsNullOrWhiteSpace(companyName))
        {
            return BadRequest(new { message = "Tên doanh nghiệp không được để trống." });
        }

        // Tra cứu hoặc tạo mới thực thể Enterprise
        Enterprise? enterprise = null;
        if (!string.IsNullOrWhiteSpace(taxCode))
        {
            enterprise = await enterpriseRepo.GetByTaxCodeAsync(taxCode, ct);
        }

        if (enterprise is null && req.EnterpriseId.HasValue)
        {
            enterprise = await enterpriseRepo.GetByIdAsync(req.EnterpriseId.Value, ct);
        }

        if (enterprise is null)
        {
            enterprise = new Enterprise(Guid.NewGuid())
            {
                LegalName = companyName,
                Name = companyName,
                TaxCode = string.IsNullOrWhiteSpace(taxCode) ? null : taxCode,
                Status = "ACTIVE",
                VerificationStatus = "PENDING_VERIFICATION",
                OwnerPersonId = Actor.IsAuthenticated ? PersonId : null
            };
            await enterpriseRepo.AddAsync(enterprise, ct);
        }

        // Bóc tách các trường từ 43 câu hỏi để map vào thực thể Enterprise & DemandSurvey
        string? address = TryGetString(answersElem, "c03_address", "address");
        string? contactEmail = TryGetString(answersElem, "c04_contact_email", "email");
        string? contactPhone = TryGetString(answersElem, "c04_contact_phone", "phone");
        string? website = TryGetString(answersElem, "c04_website", "website");
        string? province = TryGetString(answersElem, "c05_province", "province_city");
        string? mainSector = TryGetString(answersElem, "c06_main_sector", "main_sector_name");
        string? ownership = TryGetString(answersElem, "c07_ownership", "ownership_type");
        string? workforce = TryGetString(answersElem, "c08_workforce", "workforce_scale");
        string? revenue = TryGetString(answersElem, "c09_revenue", "revenue_range");
        string? operatingZone = TryGetString(answersElem, "c10_operating_zone", "operating_zone");
        string? highQualRatio = TryGetString(answersElem, "c11_high_qual_ratio", "high_qualification_ratio");

        bool hasRdUnit = TryGetBool(answersElem, "c12_has_rd_unit", "has_rd_unit");
        bool hasTraining = TryGetBool(answersElem, "c13_has_training", "has_tech_training");
        bool hasMachinery = TryGetBool(answersElem, "c14_has_machinery_upgrade", "has_machinery_upgrade");
        bool hasRdBudget = TryGetBool(answersElem, "c15_has_rd_budget", "has_rd_budget");
        bool isExporting = TryGetBool(answersElem, "c35_is_exporting", "is_exporting");
        bool inValueChain = TryGetBool(answersElem, "c36_in_value_chain", "in_value_chain");

        List<string> bottlenecks = ExtractStringArray(answersElem, "c37_top_bottlenecks", "top_bottlenecks");
        List<string> supportNeeds = ExtractStringArray(answersElem, "c38_support_needs", "support_needs");
        List<string> impactOutcomes = ExtractStringArray(answersElem, "c23_impact_outcomes", "recorded_impacts");
        string? recommendations = TryGetString(answersElem, "c43_recommendations", "recommendations");

        // Đồng bộ dữ liệu vào Enterprise
        enterprise.HasRdUnit = hasRdUnit;
        enterprise.HasRdBudget = hasRdBudget;
        enterprise.IsExporting = isExporting;
        enterprise.InValueChain = inValueChain;

        if (!string.IsNullOrWhiteSpace(address)) enterprise.AddressDetail = address;
        if (!string.IsNullOrWhiteSpace(province)) enterprise.ProvinceCity = province;
        if (!string.IsNullOrWhiteSpace(mainSector)) enterprise.MainSectorName = mainSector;
        if (!string.IsNullOrWhiteSpace(ownership)) enterprise.OwnershipType = ownership;
        if (!string.IsNullOrWhiteSpace(workforce)) enterprise.WorkforceScale = workforce;
        if (!string.IsNullOrWhiteSpace(revenue)) enterprise.RevenueRange = revenue;
        if (!string.IsNullOrWhiteSpace(operatingZone)) enterprise.OperatingZone = operatingZone;
        if (!string.IsNullOrWhiteSpace(highQualRatio)) enterprise.HighQualificationRatio = highQualRatio;
        if (!string.IsNullOrWhiteSpace(contactEmail)) enterprise.ContactEmail = contactEmail;
        if (!string.IsNullOrWhiteSpace(contactPhone)) enterprise.ContactPhone = contactPhone;
        if (!string.IsNullOrWhiteSpace(website)) enterprise.Website = website;
        if (bottlenecks.Count > 0) enterprise.TopBottlenecksJson = JsonSerializer.Serialize(bottlenecks);
        if (supportNeeds.Count > 0) enterprise.SupportNeedsJson = JsonSerializer.Serialize(supportNeeds);

        // =========================================================================
        // BR-02-016: 1. KÍCH HOẠT INNOVATION RATING ENGINE (37 TIÊU CHÍ, 8 NHÓM)
        // =========================================================================
        var calcResult = InnovationRatingEngine.Calculate(
            enterprise,
            answersJson,
            hasMachineryUpgrade: hasMachinery,
            hasTechTraining: hasTraining);

        enterprise.LatestInnovationScore = calcResult.TotalScore;
        enterprise.LatestInnovationTier = calcResult.Classification;

        // Lưu bản ghi đánh giá ĐMST vào enterprise.innovation_evaluations
        var evalYear = DateTime.UtcNow.Year;
        var eval = await enterpriseRepo.GetInnovationEvaluationAsync(enterprise.TaxCode ?? "", evalYear, ct);
        if (eval is null)
        {
            eval = new EnterpriseInnovationEvaluation(Guid.NewGuid())
            {
                EnterpriseId = enterprise.Id,
                TaxCode = enterprise.TaxCode ?? "",
                EvaluationYear = evalYear,
                CriteriaVersion = "v1.0",
                TotalScore = calcResult.TotalScore,
                Classification = calcResult.Classification,
                GroupScoresJson = JsonSerializer.Serialize(calcResult.GroupScores),
                CriteriaDetailsJson = JsonSerializer.Serialize(calcResult.CriteriaDetails),
                Status = "APPROVED",
                ReviewedBy = "Hệ thống ĐMST Quốc gia (Tự động 43Q)",
                ReviewedAt = DateTimeOffset.UtcNow,
                Notes = "Đánh giá tự động từ Phiếu khảo sát 43 tiêu chuẩn ĐMST"
            };
            await enterpriseRepo.AddInnovationEvaluationAsync(eval, ct);
        }
        else
        {
            eval.TotalScore = calcResult.TotalScore;
            eval.Classification = calcResult.Classification;
            eval.GroupScoresJson = JsonSerializer.Serialize(calcResult.GroupScores);
            eval.CriteriaDetailsJson = JsonSerializer.Serialize(calcResult.CriteriaDetails);
            eval.Status = "APPROVED";
            eval.ReviewedBy = "Hệ thống ĐMST Quốc gia (Cập nhật 43Q)";
            eval.ReviewedAt = DateTimeOffset.UtcNow;
            eval.TouchEvaluation();
            await enterpriseRepo.UpdateInnovationEvaluationAsync(eval, ct);
        }

        // =========================================================================
        // BR-02-016: 2. TÍNH CHỈ SỐ NHU CẦU CÔNG NGHỆ (TNI - TECHNOLOGY NEED INDEX)
        // K (Cấp thiết 35%), L (Tác động 30%), N (Khả năng đầu tư 20%), O (Sẵn sàng 15%)
        // =========================================================================
        // K (Cấp thiết: 1 - 5): dựa trên rào cản C37
        int k = 2;
        if (bottlenecks.Count >= 3)
        {
            bool hasCritical = bottlenecks.Any(b => b.Contains("vốn", StringComparison.OrdinalIgnoreCase) || 
                                                    b.Contains("công nghệ", StringComparison.OrdinalIgnoreCase));
            k = hasCritical ? 5 : 4;
        }
        else if (bottlenecks.Count >= 2)
        {
            k = 3;
        }
        else if (bottlenecks.Count == 1)
        {
            k = 2;
        }
        else
        {
            k = 1;
        }

        // L (Tác động: 1 - 5): dựa trên số lượng kỳ vọng hiệu quả C23 và nhu cầu C38
        int totalImpactNeeds = impactOutcomes.Count + supportNeeds.Count;
        int l = totalImpactNeeds switch
        {
            >= 5 => 5,
            >= 3 => 4,
            >= 2 => 3,
            >= 1 => 2,
            _ => 1
        };

        // N (Khả năng đầu tư: 1 - 5): dựa trên doanh thu C09 và ngân sách R&D C15
        int nBase = 1;
        if (!string.IsNullOrWhiteSpace(revenue))
        {
            if (revenue.Contains("50 tỷ", StringComparison.OrdinalIgnoreCase)) nBase = 4;
            else if (revenue.Contains("10", StringComparison.OrdinalIgnoreCase)) nBase = 3;
            else if (revenue.Contains("3 đến", StringComparison.OrdinalIgnoreCase)) nBase = 2;
        }
        if (hasRdBudget) nBase += 1;
        int n = Math.Clamp(nBase, 1, 5);

        // O (Sẵn sàng: 1 - 5): dựa trên đào tạo C13, CĐS C24/C25, phỏng vấn C40, cập nhật C41
        int oBase = 1;
        if (hasTraining) oBase++;
        var digitalStrat = TryGetString(answersElem, "c24_digital_strategy");
        var digitalMat = TryGetString(answersElem, "c25_digital_maturity");
        if ((digitalStrat != null && digitalStrat.Contains("Đã có", StringComparison.OrdinalIgnoreCase)) ||
            (digitalMat != null && (digitalMat.Contains("Nâng cao", StringComparison.OrdinalIgnoreCase) || digitalMat.Contains("Toàn diện", StringComparison.OrdinalIgnoreCase))))
        {
            oBase++;
        }
        var willingInterview = TryGetString(answersElem, "c40_willing_interview");
        if (willingInterview != null && willingInterview.Contains("Sẵn sàng", StringComparison.OrdinalIgnoreCase))
        {
            oBase++;
        }
        var willingUpdate = TryGetString(answersElem, "c41_willing_update_db");
        if (willingUpdate != null && willingUpdate.Contains("Sẵn sàng", StringComparison.OrdinalIgnoreCase))
        {
            oBase++;
        }
        int o = Math.Clamp(oBase, 1, 5);

        var tniResult = TniCalculationEngine.Calculate(k, l, n, o);
        string tniClassStr = tniResult.Classification switch
        {
            TniClassification.VeryHigh => "VERY_HIGH",
            TniClassification.High => "HIGH",
            TniClassification.Medium => "MEDIUM",
            _ => "LOW"
        };

        enterprise.TniScore = tniResult.Score;
        enterprise.TniClassification = tniClassStr;
        await enterpriseRepo.UpdateAsync(enterprise, ct);

        // =========================================================================
        // BR-02-016: 3. LƯU BẢN GHI KHẢO SÁT VÀO demand.demand_surveys
        // =========================================================================
        var surveyCode = $"SUR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var survey = new DemandSurvey(
            surveyCode: surveyCode,
            surveyType: "INNOVATION_DEMAND",
            companyName: enterprise.Name,
            taxCode: enterprise.TaxCode,
            contactName: enterprise.ContactPerson ?? enterprise.Name,
            contactPhone: enterprise.ContactPhone ?? "",
            contactEmail: enterprise.ContactEmail ?? (Actor.Email ?? ""),
            businessType: enterprise.OwnershipType,
            enterpriseSize: enterprise.WorkforceScale,
            employeeScale: enterprise.WorkforceScale,
            revenueRange3y: enterprise.RevenueRange,
            topBottlenecks: bottlenecks,
            organizationId: enterprise.Id,
            createdBy: Actor.IsAuthenticated ? PersonId : null,
            province: enterprise.ProvinceCity,
            headquartersAddress: enterprise.AddressDetail,
            surveyedFacility: null,
            contactTitle: null,
            mainIndustry: enterprise.MainSectorName,
            mainProducts: null,
            confirmedByName: enterprise.ContactPerson ?? enterprise.Name,
            confirmedByTitle: null,
            pdpdConsentAt: DateTimeOffset.UtcNow,
            surveyDetails: answersJson
        );

        survey.SetInnovationDemandDetails(
            enterpriseId: enterprise.Id,
            surveyAnswers: answersJson,
            hasRdUnit: hasRdUnit,
            hasTechTraining: hasTraining,
            hasMachineryUpgrade: hasMachinery,
            hasRdBudget: hasRdBudget,
            isExporting: isExporting,
            inValueChain: inValueChain,
            supportNeeds: supportNeeds,
            recommendations: recommendations,
            tniScore: tniResult.Score,
            tniClassification: tniClassStr,
            surveyYear: evalYear
        );

        db.Set<DemandSurvey>().Add(survey);

        // Tự động cấp tài khoản BUYER cho người nộp phiếu nếu chưa đăng nhập và email hợp lệ
        if (!Actor.IsAuthenticated && !string.IsNullOrWhiteSpace(contactEmail))
        {
            var cleanEmail = contactEmail.Trim().ToLowerInvariant();
            var existingPerson = await personService.FindByEmailAsync(cleanEmail, ct);
            if (existingPerson is null)
            {
                try
                {
                    var initPass = $"Nacen@{DateTime.UtcNow:yyyy}!";
                    var fullName = enterprise.ContactPerson?.Trim() ?? "Đại diện Doanh nghiệp";
                    var parts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                    var lastName = parts.Length > 1 ? parts[0] : "";
                    var firstName = parts.Length > 1 ? parts[1] : parts[0];

                    var provisioned = await personService.ProvisionAsync(new ProvisionPersonCommand(
                        Email: cleanEmail,
                        Password: initPass,
                        FirstName: firstName,
                        LastName: string.IsNullOrEmpty(lastName) ? null : lastName,
                        Phone: contactPhone?.Trim(),
                        Organization: enterprise.Name,
                        PlatformRole: PlatformRoles.Buyer,
                        ScopeType: ScopeTypes.Global,
                        ScopeId: null,
                        IsActive: true
                    ), ct);

                    enterprise.OwnerPersonId = provisioned.Id;
                    await enterpriseRepo.UpdateAsync(enterprise, ct);
                }
                catch
                {
                    // Tránh chặn luồng nộp khảo sát nếu provisioning thất bại
                }
            }
        }

        await uow.CommitAsync(ct);

        // Trả về kết quả theo chuẩn hợp đồng API mục 6.2 của BD_DELTA_CR_020
        return StatusCode(StatusCodes.Status201Created, new
        {
            success = true,
            surveyId = survey.Id,
            enterpriseId = enterprise.Id,
            evaluationId = eval.Id,
            innovationScore = calcResult.TotalScore,
            innovationTier = calcResult.Classification,
            tniScore = tniResult.Score,
            tniClassification = tniClassStr,
            radarChart = calcResult.RadarChartData,
            results = new
            {
                totalScore = calcResult.TotalScore,
                classification = calcResult.Classification,
                classificationLabel = calcResult.ClassificationLabel,
                badgeName = calcResult.BadgeName,
                groupScores = calcResult.GroupScores,
                radarChartData = calcResult.RadarChartData,
                tni = new
                {
                    score = tniResult.Score,
                    classification = tniClassStr,
                    classificationName = tniResult.ClassificationName,
                    urgencyK = k,
                    impactL = l,
                    capacityN = n,
                    readinessO = o
                }
            },
            redirectUrl = $"/enterprises/{enterprise.TaxCode}?tab=innovation"
        });
    }

    #region Private Helpers

    private static string? TryGetString(JsonElement? root, params string[] propertyNames)
    {
        if (!root.HasValue || root.Value.ValueKind != JsonValueKind.Object) return null;
        foreach (var name in propertyNames)
        {
            if (root.Value.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.String)
            {
                var s = prop.GetString();
                if (!string.IsNullOrWhiteSpace(s)) return s.Trim();
            }
        }
        return null;
    }

    private static bool TryGetBool(JsonElement? root, params string[] propertyNames)
    {
        if (!root.HasValue || root.Value.ValueKind != JsonValueKind.Object) return false;
        foreach (var name in propertyNames)
        {
            if (root.Value.TryGetProperty(name, out var prop))
            {
                if (prop.ValueKind == JsonValueKind.True) return true;
                if (prop.ValueKind == JsonValueKind.False) return false;
                if (prop.ValueKind == JsonValueKind.String)
                {
                    var s = prop.GetString();
                    if (string.Equals(s, "true", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(s, "Có", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(s, "yes", StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private static List<string> ExtractStringArray(JsonElement? root, params string[] propertyNames)
    {
        var result = new List<string>();
        if (!root.HasValue || root.Value.ValueKind != JsonValueKind.Object) return result;
        foreach (var propertyName in propertyNames)
        {
            if (root.Value.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in prop.EnumerateArray())
                {
                    var s = item.GetString();
                    if (!string.IsNullOrWhiteSpace(s) && !result.Contains(s))
                    {
                        result.Add(s);
                    }
                }
            }
        }
        return result;
    }

    #endregion
}
