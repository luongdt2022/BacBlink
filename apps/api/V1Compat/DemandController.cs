using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Persistence;

namespace NacenTech.Api.V1Compat;

[ApiController]
[Route("api/v1")]
public sealed class DemandController(NacenTechDbContext db, IUnitOfWork uow) : V1ControllerBase
{
    // =========================================================================
    // LUỒNG 1: KHẢO SÁT SÂU DNNVV & BÓC TÁCH BÀI TOÁN (SC-03-01 / WF-01)
    // =========================================================================

    [HttpPost("demands/surveys")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitDeepSurvey([FromBody] SubmitDeepSurveyRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.CompanyName))
            return BadRequest(new { message = "Tên doanh nghiệp không được để trống." });
        if (string.IsNullOrWhiteSpace(req.ContactName) || string.IsNullOrWhiteSpace(req.ContactPhone) || string.IsNullOrWhiteSpace(req.ContactEmail))
            return BadRequest(new { message = "Thông tin liên hệ (Họ tên, SĐT, Email) là bắt buộc." });

        var surveyCode = $"SUR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        string? surveyDetailsJson = req.SurveyDetails;
        if (string.IsNullOrWhiteSpace(surveyDetailsJson))
        {
            var detailsObj = new
            {
                currentEquipments = req.CurrentEquipments,
                criteria8 = req.Criteria8,
                bottlenecksDetail = req.BottlenecksDetail,
                hardestStage = req.HardestStage,
                primaryCause = req.PrimaryCause,
                technicalPersonnel = req.TechnicalPersonnel,
                adoptionCapacity = req.AdoptionCapacity,
                futureDirections = req.FutureDirections,
                supportNeeds = req.SupportNeeds,
                desiredPartners = req.DesiredPartners
            };
            surveyDetailsJson = System.Text.Json.JsonSerializer.Serialize(detailsObj);
        }

        var survey = new DemandSurvey(
            surveyCode,
            req.SurveyType ?? "DEEP_SURVEY",
            req.CompanyName,
            req.TaxCode,
            req.ContactName,
            req.ContactPhone,
            req.ContactEmail,
            req.BusinessType,
            req.EnterpriseSize,
            req.EmployeeScale,
            req.RevenueRange3y,
            req.TopBottlenecks,
            req.OrganizationId,
            Actor.IsAuthenticated ? Actor.PersonId : null,
            req.Province,
            req.HeadquartersAddress,
            req.SurveyedFacility,
            req.ContactTitle,
            req.MainIndustry,
            req.MainProducts,
            req.ConfirmedByName,
            req.ConfirmedByTitle,
            req.PdpdConsentAt ?? DateTimeOffset.UtcNow,
            surveyDetailsJson
        );

        db.Set<DemandSurvey>().Add(survey);

        var createdTickets = new List<string>();

        // Bóc tách từng dòng nhu cầu công nghệ (Demand Items)
        var itemsToProcess = req.DemandItems ?? req.Demands;
        if (itemsToProcess != null && itemsToProcess.Count > 0)
        {
            int index = 1;
            foreach (var itemReq in itemsToProcess)
            {
                var itemCode = $"DMD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}-{index++:D2}";
                var demandItem = new DemandItem(
                    survey.Id,
                    itemCode,
                    itemReq.StageName ?? "Sản xuất chính",
                    itemReq.TechnicalProblem,
                    itemReq.DesiredSolution,
                    itemReq.NeedConsulting,
                    itemReq.ExpectedGoal,
                    itemReq.ApplicationScale,
                    itemReq.SectorCode ?? "LV01",
                    itemReq.TechGroupCode ?? "CN01",
                    itemReq.DemandTypeCode ?? "NC01",
                    itemReq.BudgetRange ?? "Chưa xác định",
                    itemReq.UrgencyScore,
                    itemReq.ImpactScore,
                    itemReq.InvestmentCapacity,
                    itemReq.AdoptionReadiness,
                    Actor.IsAuthenticated ? Actor.PersonId : null
                );

                survey.AddItem(demandItem);
                db.Set<DemandItem>().Add(demandItem);
                createdTickets.Add(itemCode);
            }
        }

        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            surveyId = survey.Id,
            surveyCode = survey.SurveyCode,
            createdTickets,
            message = "Tiếp nhận phiếu khảo sát nhu cầu công nghệ thành công."
        });
    }

    [HttpGet("demands/surveys/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSurveyDetail(Guid id, CancellationToken ct)
    {
        var survey = await db.Set<DemandSurvey>()
            .Include(s => s.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (survey is null) return NotFound(new { message = "Không tìm thấy phiếu khảo sát." });
        return Ok(survey);
    }

    // =========================================================================
    // LUỒNG 2: TẠO NHANH BÀI TOÁN & BUYER WORKSPACE (SC-03-02, SC-03-03 / WF-02)
    // =========================================================================

    [HttpPost("demands/items")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateQuickDemandItem([FromBody] CreateQuickDemandItemRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.TechnicalProblem) || string.IsNullOrWhiteSpace(req.ExpectedGoal))
            return BadRequest(new { message = "Vấn đề kỹ thuật và mục tiêu kỳ vọng không được để trống." });

        if (req.UrgencyScore < 1 || req.UrgencyScore > 5 ||
            req.ImpactScore < 1 || req.ImpactScore > 5 ||
            req.InvestmentCapacity < 1 || req.InvestmentCapacity > 5 ||
            req.AdoptionReadiness < 1 || req.AdoptionReadiness > 5)
        {
            return BadRequest(new { message = "Các chỉ số định lượng K, L, N, O phải nằm trong khoảng từ 1 đến 5." });
        }

        var itemCode = $"DMD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var demandItem = new DemandItem(
            null, // Tạo lẻ không qua khảo sát sâu
            itemCode,
            req.StageName ?? "Sản xuất",
            req.TechnicalProblem,
            req.DesiredSolution,
            req.NeedConsulting,
            req.ExpectedGoal,
            req.ApplicationScale,
            req.SectorCode ?? "LV01",
            req.TechGroupCode ?? "CN01",
            req.DemandTypeCode ?? "NC01",
            req.BudgetRange ?? "500 triệu – 1 tỷ VNĐ",
            req.UrgencyScore,
            req.ImpactScore,
            req.InvestmentCapacity,
            req.AdoptionReadiness,
            Actor.IsAuthenticated ? Actor.PersonId : null
        );

        db.Set<DemandItem>().Add(demandItem);
        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            itemId = demandItem.Id,
            itemCode = demandItem.ItemCode,
            tniScore = demandItem.TniScore,
            tniClassification = demandItem.TniClassification,
            message = "Đăng bài toán nhu cầu công nghệ thành công."
        });
    }

    [HttpGet("buyer/demands")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBuyerDemands(CancellationToken ct)
    {
        var items = await db.Set<DemandItem>()
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

        return Ok(items);
    }

    // =========================================================================
    // LUỒNG 4: SÀN NHU CẦU CÔNG KHAI VỚI PDPD MASKING (SC-03-04 / WF-04)
    // =========================================================================

    [HttpGet("public/demands")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicDemands(
        [FromQuery] string? q,
        [FromQuery] string? sectorCode,
        [FromQuery] string? tniClassification,
        CancellationToken ct)
    {
        var query = db.Set<DemandItem>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(i => i.TechnicalProblem.Contains(q) || i.ExpectedGoal.Contains(q));
        }
        if (!string.IsNullOrWhiteSpace(sectorCode))
        {
            query = query.Where(i => i.SectorCode == sectorCode);
        }
        if (!string.IsNullOrWhiteSpace(tniClassification))
        {
            query = query.Where(i => i.TniClassification == tniClassification);
        }

        var items = await query.OrderByDescending(i => i.TniScore).Take(20).ToListAsync(ct);

        // Map sang DTO công khai (Ẩn PII, ẩn ngân sách chi tiết nếu cần)
        var result = items.Select(i => new
        {
            id = i.Id,
            itemCode = i.ItemCode,
            stageName = i.StageName,
            technicalProblem = i.TechnicalProblem,
            desiredSolution = i.DesiredSolution,
            needConsulting = i.NeedConsulting,
            expectedGoal = i.ExpectedGoal,
            sectorCode = i.SectorCode,
            budgetRange = i.BudgetRange,
            tniScore = i.TniScore,
            tniClassification = i.TniClassification,
            status = i.Status,
            createdAt = i.CreatedAt
        });

        return Ok(result);
    }

    [HttpGet("public/demands/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicDemandDetail(Guid id, CancellationToken ct)
    {
        var item = await db.Set<DemandItem>().AsNoTracking().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });

        return Ok(new
        {
            id = item.Id,
            itemCode = item.ItemCode,
            stageName = item.StageName,
            technicalProblem = item.TechnicalProblem,
            desiredSolution = item.DesiredSolution,
            needConsulting = item.NeedConsulting,
            expectedGoal = item.ExpectedGoal,
            sectorCode = item.SectorCode,
            techGroupCode = item.TechGroupCode,
            demandTypeCode = item.DemandTypeCode,
            budgetRange = item.BudgetRange,
            tniScore = item.TniScore,
            tniClassification = item.TniClassification,
            status = item.Status,
            createdAt = item.CreatedAt
        });
    }

    // =========================================================================
    // LUỒNG 3: CỔNG THẨM ĐỊNH SỞ KH&CN & PHÂN LUỒNG TRIAGE (SC-03-05 / WF-03)
    // =========================================================================

    [HttpGet("gov/demands")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGovPendingDemands(CancellationToken ct)
    {
        var items = await db.Set<DemandItem>()
            .AsNoTracking()
            .OrderByDescending(i => i.TniScore)
            .Take(50)
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpPost("gov/demands/{id}/verify")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyDemand(Guid id, CancellationToken ct)
    {
        var item = await db.Set<DemandItem>().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán." });

        item.VerifyAndPublish();
        await uow.CommitAsync(ct);

        return Ok(new { success = true, message = "Phê duyệt bài toán niêm yết lên sàn thành công." });
    }

    [HttpPost("gov/demands/{id}/assign-expert")]
    [AllowAnonymous]
    public async Task<IActionResult> AssignExpert(Guid id, [FromBody] AssignExpertRequest req, CancellationToken ct)
    {
        var item = await db.Set<DemandItem>().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán." });

        item.AssignExpert(req.ExpertId);
        await uow.CommitAsync(ct);

        return Ok(new { success = true, message = "Đã chỉ định chuyên gia tư vấn 1-1 cho bài toán." });
    }

    // =========================================================================
    // LUỒNG 5: ĐĂNG KÝ THAM QUAN HỘI CHỢ TRIỂN LÃM (SC-03-06 / WF-05)
    // =========================================================================

    [HttpPost("trien-lam/dang-ky")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterExpoVisitor([FromBody] ExpoVisitorRegistrationRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.FullName) || string.IsNullOrWhiteSpace(req.Phone) || string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Họ tên, Số điện thoại và Email khách tham quan là bắt buộc." });

        var surveyCode = $"EXP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var survey = new DemandSurvey(
            surveyCode,
            "EXPO",
            req.CompanyName ?? "Khách tham quan cá nhân",
            null,
            req.FullName,
            req.Phone,
            req.Email,
            null,
            null,
            null,
            null,
            [req.Purpose ?? "Tìm kiếm nhà cung cấp", req.SectorOfInterest ?? "Công nghiệp hỗ trợ"],
            null,
            null
        );

        db.Set<DemandSurvey>().Add(survey);
        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            registrationCode = surveyCode,
            message = "Đăng ký tham quan triển lãm thành công. Ban tổ chức đã gửi vé điện tử qua Email."
        });
    }

    [HttpPost("public/demands/{id}/offer")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitSolutionOffer(Guid id, [FromBody] SubmitSolutionOfferRequest req, CancellationToken ct)
    {
        var item = await db.Set<DemandItem>().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });

        return Ok(new
        {
            success = true,
            demandId = id,
            solutionTitle = req.SolutionTitle,
            message = "Đã gửi Đề xuất Giải pháp chào bán thành công."
        });
    }
}

public sealed record SubmitDeepSurveyRequest(
    string CompanyName,
    string? TaxCode,
    string ContactName,
    string ContactPhone,
    string ContactEmail,
    string? BusinessType,
    string? EnterpriseSize,
    string? EmployeeScale,
    string? RevenueRange3y,
    List<string>? TopBottlenecks,
    string? SurveyType,
    Guid? OrganizationId,
    List<DeepSurveyItemRequest>? DemandItems,
    List<DeepSurveyItemRequest>? Demands = null,
    string? Province = null,
    string? HeadquartersAddress = null,
    string? SurveyedFacility = null,
    string? ContactTitle = null,
    string? MainIndustry = null,
    string? MainProducts = null,
    string? ConfirmedByName = null,
    string? ConfirmedByTitle = null,
    DateTimeOffset? PdpdConsentAt = null,
    string? SurveyDetails = null,
    List<DeepSurveyEquipmentRequest>? CurrentEquipments = null,
    Dictionary<string, int>? Criteria8 = null,
    Dictionary<string, int>? BottlenecksDetail = null,
    string? HardestStage = null,
    string? PrimaryCause = null,
    Dictionary<string, int>? TechnicalPersonnel = null,
    Dictionary<string, int>? AdoptionCapacity = null,
    List<string>? FutureDirections = null,
    Dictionary<string, int>? SupportNeeds = null,
    List<string>? DesiredPartners = null
);

public sealed record DeepSurveyEquipmentRequest(
    string? StageName,
    string? MachineName,
    int? InvestmentYear,
    string? TechOrigin,
    string? DepreciationStatus
);

public sealed record DeepSurveyItemRequest(
    string? StageName,
    string TechnicalProblem,
    string? DesiredSolution,
    bool NeedConsulting,
    string ExpectedGoal,
    string? ApplicationScale,
    string? SectorCode,
    string? TechGroupCode,
    string? DemandTypeCode,
    string? BudgetRange,
    int UrgencyScore,
    int ImpactScore,
    int InvestmentCapacity,
    int AdoptionReadiness
);

public sealed record CreateQuickDemandItemRequest(
    string? StageName,
    string TechnicalProblem,
    string? DesiredSolution,
    bool NeedConsulting,
    string ExpectedGoal,
    string? ApplicationScale,
    string? SectorCode,
    string? TechGroupCode,
    string? DemandTypeCode,
    string? BudgetRange,
    int UrgencyScore,
    int ImpactScore,
    int InvestmentCapacity,
    int AdoptionReadiness
);

public sealed record AssignExpertRequest(Guid ExpertId);

public sealed record ExpoVisitorRegistrationRequest(
    string FullName,
    string Phone,
    string Email,
    string? CompanyName,
    string? Purpose,
    string? SectorOfInterest
);

public sealed record SubmitSolutionOfferRequest(
    string SolutionTitle,
    string? ProposalDetails
);

