using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Persistence;

namespace NacenTech.Api.V1Compat;

// =========================================================================
// REQUEST & RESPONSE DTOs
// =========================================================================

public record CreateConnectionRequest(
    Guid? DemandId,
    Guid? OfferId,
    string SenderOrgName,
    string SenderRole, // BUYER | SELLER | BROKER
    string ReceiverOrgName,
    string Message,
    string? ProposedBudgetRange,
    Guid? BuyerOrganizationId = null,
    Guid? SellerOrganizationId = null,
    Guid? TargetOfferId = null
);

public record RespondConnectionRequest(
    string Action, // ACCEPT | REJECT
    string? Note = null,
    string? RejectionReason = null
);

// DTO chi tiết công nghệ mục tiêu
public sealed record TargetOfferSummaryDto(
    Guid OfferId,
    string OfferCode,
    string OfferTitle,
    int TrlLevel,
    string TrlStage,        // Lab (TRL 1-3) | Pilot (TRL 4-6) | Commercial (TRL 7-9)
    string IpStatus,        // PATENTED | PENDING | TRADE_SECRET | NONE
    string? SectorCode,
    string? SectorName,
    decimal? PriceMillionVnd
);

// DTO chi tiết hồ sơ doanh nghiệp bên mua
public sealed record BuyerEnterpriseProfileDto(
    Guid? EnterpriseId,
    Guid BuyerOrganizationId,
    string CompanyName,
    string? TaxCode,
    string? Industry,
    string? ProvinceCode,
    string? ProvinceName,
    string? Address,
    string? ScaleCategory,   // MICRO | SMALL | MEDIUM | LARGE
    int? EmployeeCountRange,
    string BuyerType = "ENTERPRISE",
    string? AcademicTitle = null,
    string? SpecializedField = null,
    string? ExpertProfileId = null
);

// DTO thông tin liên hệ được quản lý PDPD
public sealed record PdpdContactInfoDto(
    string ContactPersonName,
    string PhoneNumber,      // Masked "09****1234" nếu PENDING/REJECTED; Thật nếu ACCEPTED
    string Email,            // Masked "a***@domain.com" nếu PENDING/REJECTED; Thật nếu ACCEPTED
    string? IdentityNumber,  // "[Được bảo vệ theo NĐ 13/2023/NĐ-CP]" nếu PENDING; Thật nếu ACCEPTED
    bool IsMasked,
    string PdpdNotice
);

// DTO Danh Sách Yêu Cầu Kết Nối Nâng Cao (Enriched List DTO)
public sealed record ConnectionRequestEnrichedDto(
    Guid Id,
    string RequestCode,
    Guid SenderUserId,
    Guid? BuyerOrganizationId,
    string SenderOrgName,
    string SenderRole,
    Guid? ReceiverUserId,
    Guid? SellerOrganizationId,
    string ReceiverOrgName,
    Guid? DemandId,
    string? DemandCode,
    string? DemandTitle,
    Guid? TargetOfferId,
    string? OfferCode,
    string? OfferTitle,
    int? OfferTrlLevel,
    string? OfferIpStatus,
    string? SenderTaxCode,
    string? SenderIndustry,
    string? SenderProvince,
    string Message,
    string? ProposedBudgetRange,
    string Status,           // PENDING | ACCEPTED | REJECTED | EXPIRED
    string? RejectionReason,
    DateTime? SlaDeadline,
    bool IsSlaWarning,       // true nếu PENDING và thời gian còn lại < 12h hoặc đã quá 48h
    DateTime? RespondedAt,
    DateTime CreatedAt,
    string BuyerType = "ENTERPRISE",
    string? AcademicTitle = null,
    string? SpecializedField = null,
    string? ExpertProfileId = null
);

// DTO Chi Tiết Toàn Vẹn Yêu Cầu Kết Nối (Detail Modal DTO)
public sealed record ConnectionRequestDetailDto(
    Guid Id,
    string RequestCode,
    string Status,           // PENDING | ACCEPTED | REJECTED
    string? RejectionReason,
    string Message,
    string? ProposedBudgetRange,
    DateTime CreatedAt,
    DateTime? RespondedAt,
    DateTime? SlaDeadline,
    bool IsSlaWarning,
    Guid? CreatedOpportunityId,
    string? CreatedOpportunityCode,
    TargetOfferSummaryDto? TargetOffer,
    BuyerEnterpriseProfileDto BuyerProfile,
    PdpdContactInfoDto ContactInfo,
    string BuyerType = "ENTERPRISE",
    string? AcademicTitle = null,
    string? SpecializedField = null,
    string? ExpertProfileId = null
);

public record UpdateOpportunityStageRequest(
    string NewStage // SUGGESTED | INITIATED | NEGOTIATING | MOU_SIGNED | COMPLETED | CLOSED_LOST
);

public record SendDealDiscussionRequest(
    string? SenderName,
    string? SenderRole, // BUYER | SELLER | EXPERT
    string Message,
    string? AttachmentUrl
);

public record SaveMouRequest(
    string ScopeOfWork,
    int? PilotDurationMonths,
    int? DurationMonths,
    string? CommercialTerms,
    string? IntellectualPropertyTerms,
    string? Status // DRAFT | SIGNED
);

public record RecomputeRadarRequest(
    string? DemandCode = null
);

// =========================================================================
// CONTROLLER
// =========================================================================

[ApiController]
[Route("api/v1")]
public sealed class BrokerageControllers(
    NacenTechDbContext db,
    IBrokerageMatchingEngineService? matchingEngine = null) : V1ControllerBase
{
    private static string MaskPhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 7) return phone ?? "";
        return string.Concat(phone.AsSpan(0, 2), "****", phone.AsSpan(phone.Length - 4));
    }

    private static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@')) return email ?? "";
        var parts = email.Split('@');
        var name = parts[0];
        var domain = parts[1];
        if (name.Length <= 2) return $"{name[0]}***@{domain}";
        return $"{name[0]}***{name[^1]}@{domain}";
    }

    private RadarUserContext ResolveRadarUserContext()
    {
        Guid? personId = null;
        try
        {
            if (Actor.IsAuthenticated && Actor.PersonId.HasValue)
            {
                personId = Actor.PersonId;
            }
        }
        catch
        {
            // Anonymous fallback
        }

        Guid? orgId = null;
        var orgClaim = User.FindFirst("organizationId")?.Value 
                       ?? User.FindFirst("org_id")?.Value 
                       ?? User.FindFirst("tenant_id")?.Value
                       ?? (Actor.ScopeType == ScopeTypes.OrgUnit ? Actor.ScopeId : null);

        if (Guid.TryParse(orgClaim, out var parsedOrgId))
        {
            orgId = parsedOrgId;
        }

        var provinceCode = User.FindFirst("provinceCode")?.Value 
                           ?? User.FindFirst("province")?.Value
                           ?? (Actor.ScopeType == ScopeTypes.Province ? Actor.ScopeId : null);

        var role = Actor.PlatformRole ?? PlatformRoles.PublicUser;

        return new RadarUserContext(personId, orgId, role, provinceCode);
    }

    private IBrokerageMatchingEngineService ResolveMatchingEngine()
        => matchingEngine ?? HttpContext.RequestServices.GetRequiredService<IBrokerageMatchingEngineService>();

    // -------------------------------------------------------------------------
    // 1. RADAR GHÉP NỐI CUNG–CẦU
    // -------------------------------------------------------------------------
    [HttpGet("brokerage/radar")]
    [Authorize]
    public async Task<IActionResult> GetRadarCandidates(
        [FromQuery] string? sector,
        [FromQuery] int? minScore,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] int? limit,
        CancellationToken ct)
    {
        var userContext = ResolveRadarUserContext();
        var engine = ResolveMatchingEngine();

        var effectiveSize = pageSize ?? limit;
        if (page.HasValue || effectiveSize.HasValue)
        {
            var safePage = Math.Max(1, page ?? 1);
            var safeSize = Math.Clamp(effectiveSize ?? 24, 1, 200);
            var (items, total) = await engine.GetRadarCandidatesPagedAsync(
                sector, minScore, search, userContext, safePage, safeSize, ct);
            var totalPages = (int)Math.Ceiling(total / (double)safeSize);
            return Ok(new
            {
                success = true,
                data = items,
                total,
                page = safePage,
                pageSize = safeSize,
                totalPages = totalPages == 0 ? 1 : totalPages,
            });
        }

        // Default safety cap for unpaginated callers (prevents 6.3MB JSON dumps)
        var (defaultItems, defaultTotal) = await engine.GetRadarCandidatesPagedAsync(
            sector, minScore, search, userContext, 1, 100, ct);
        return Ok(new
        {
            success = true,
            data = defaultItems,
            total = defaultTotal,
            page = 1,
            pageSize = 100,
            totalPages = Math.Max(1, (int)Math.Ceiling(defaultTotal / 100.0)),
        });
    }

    [HttpGet("brokerage/radar/summary")]
    [Authorize]
    public async Task<IActionResult> GetRadarSummary(CancellationToken ct)
    {
        var userContext = ResolveRadarUserContext();
        var engine = ResolveMatchingEngine();
        var totalCount = await engine.GetRadarSummaryAsync(userContext, ct);
        return Ok(Ok200(new { totalCount }));
    }

    [HttpPost("brokerage/radar/recompute")]
    [Authorize]
    public async Task<IActionResult> RecomputeRadar(
        [FromBody] RecomputeRadarRequest? request,
        CancellationToken ct)
    {
        var userContext = ResolveRadarUserContext();
        var engine = ResolveMatchingEngine();
        var result = await engine.RecomputeRadarForDemandAsync(request?.DemandCode, userContext, ct);
        return Ok(Ok200(result));
    }

    // -------------------------------------------------------------------------
    // 2. YÊU CẦU KẾT NỐI (CONNECTION REQUESTS)
    // -------------------------------------------------------------------------
    [HttpGet("brokerage/requests")]
    [AllowAnonymous]
    public async Task<IActionResult> GetConnectionRequests(
        [FromQuery] string? status,
        [FromQuery] string? scope,
        [FromQuery] string? organizationName,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        var sql = @"
            SELECT cr.id, cr.request_code, cr.sender_user_id, cr.buyer_organization_id, cr.sender_org_name, cr.sender_role,
                   cr.receiver_user_id, cr.seller_organization_id, cr.receiver_org_name,
                   cr.demand_id,
                   COALESCE(cr.target_offer_id, cr.offer_id) AS target_offer_id,
                   o.offer_code, o.title AS offer_title, o.trl_level AS offer_trl_level, o.ip_status AS offer_ip_status,
                   ent.tax_code AS sender_tax_code, ent.main_sector_name AS sender_industry, ent.province_city AS sender_province,
                   cr.message, cr.proposed_budget_range, cr.status, cr.rejection_reason, cr.sla_deadline,
                   cr.responded_at, cr.created_at,
                   p.platform_role AS person_platform_role, p.first_name AS person_first_name, p.last_name AS person_last_name,
                   ep.id AS expert_id, ep.academic_rank, ep.degree,
                   array_to_string(ep.expertise_sectors, ', ') AS expert_specialized_field
            FROM brokerage.connection_requests cr
            LEFT JOIN technology.seller_technology_offers o ON o.id = COALESCE(cr.target_offer_id, cr.offer_id)
            LEFT JOIN enterprise.enterprises ent ON ent.id = cr.buyer_organization_id OR ent.name = cr.sender_org_name OR ent.legal_name = cr.sender_org_name
            LEFT JOIN identity.persons p ON p.id = cr.sender_user_id
            LEFT JOIN brokerage.expert_profiles ep ON ep.person_id = cr.sender_user_id
            WHERE 1=1";

        if (!string.IsNullOrWhiteSpace(status) && !string.Equals(status, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            sql += " AND UPPER(cr.status) = @status";
            var p = cmd.CreateParameter();
            p.ParameterName = "@status";
            p.Value = status.Trim().ToUpperInvariant();
            cmd.Parameters.Add(p);
        }

        if (string.Equals(scope, "my", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrWhiteSpace(organizationName))
        {
            var orgFilter = organizationName?.Trim();
            if (!string.IsNullOrWhiteSpace(orgFilter))
            {
                sql += " AND (cr.receiver_org_name ILIKE @orgFilter OR cr.sender_org_name ILIKE @orgFilter)";
                var p = cmd.CreateParameter();
                p.ParameterName = "@orgFilter";
                p.Value = $"%{orgFilter}%";
                cmd.Parameters.Add(p);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (cr.request_code ILIKE @search OR cr.sender_org_name ILIKE @search OR cr.receiver_org_name ILIKE @search OR o.title ILIKE @search)";
            var p = cmd.CreateParameter();
            p.ParameterName = "@search";
            p.Value = $"%{search.Trim()}%";
            cmd.Parameters.Add(p);
        }

        sql += " ORDER BY cr.created_at DESC";
        cmd.CommandText = sql;

        var list = new List<object>();
        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            var isSlaWarning = false;
            DateTime? slaDeadline = null;
            if (!reader.IsDBNull(22))
            {
                slaDeadline = reader.GetDateTime(22);
                if (reader.GetString(20).ToUpperInvariant() == "PENDING")
                {
                    isSlaWarning = slaDeadline.Value <= DateTime.UtcNow.AddHours(12);
                }
            }

            var senderRole = reader.GetString(5);
            var personRole = reader.IsDBNull(25) ? null : reader.GetString(25);
            var personFirstName = reader.IsDBNull(26) ? null : reader.GetString(26);
            var personLastName = reader.IsDBNull(27) ? null : reader.GetString(27);
            var expertId = reader.IsDBNull(28) ? (Guid?)null : reader.GetGuid(28);
            var academicRank = reader.IsDBNull(29) ? null : reader.GetString(29);
            var degree = reader.IsDBNull(30) ? null : reader.GetString(30);
            var specializedField = reader.IsDBNull(31) ? null : reader.GetString(31);

            string buyerType = "ENTERPRISE";
            string? academicTitle = null;
            string? expertProfileId = null;

            var rawSenderOrgName = reader.GetString(4);
            var finalSenderOrgName = rawSenderOrgName;
            string? senderTaxCode = reader.IsDBNull(15) ? null : reader.GetString(15);
            string? senderIndustry = reader.IsDBNull(16) ? null : reader.GetString(16);

            var personFullName = $"{personLastName} {personFirstName}".Trim();

            if (string.Equals(personRole, "PUBLIC_USER", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(personRole, "GUEST", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(senderRole, "PUBLIC_USER", StringComparison.OrdinalIgnoreCase))
            {
                buyerType = "INDIVIDUAL";
                if (!string.IsNullOrWhiteSpace(personFullName))
                {
                    finalSenderOrgName = personFullName;
                }
                senderTaxCode = null;
                senderIndustry = null;
            }
            else if (string.Equals(personRole, "EXPERT", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(personRole, "VERIFIED_EXPERT", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(senderRole, "EXPERT", StringComparison.OrdinalIgnoreCase) ||
                     expertId.HasValue)
            {
                buyerType = "EXPERT";
                expertProfileId = expertId?.ToString();
                var titles = new List<string>();
                if (!string.IsNullOrWhiteSpace(academicRank)) titles.Add(academicRank);
                if (!string.IsNullOrWhiteSpace(degree)) titles.Add(degree);
                academicTitle = titles.Count > 0 ? string.Join(" / ", titles) : null;
                if (!string.IsNullOrWhiteSpace(personFullName))
                {
                    finalSenderOrgName = personFullName;
                }
            }
            else
            {
                buyerType = "ENTERPRISE";
            }

            list.Add(new
            {
                id = reader.GetGuid(0),
                requestCode = reader.GetString(1),
                senderUserId = reader.GetGuid(2),
                buyerOrganizationId = reader.IsDBNull(3) ? (Guid?)null : reader.GetGuid(3),
                senderOrgName = finalSenderOrgName,
                senderRole = reader.GetString(5),
                receiverUserId = reader.IsDBNull(6) ? (Guid?)null : reader.GetGuid(6),
                sellerOrganizationId = reader.IsDBNull(7) ? (Guid?)null : reader.GetGuid(7),
                receiverOrgName = reader.GetString(8),
                demandId = reader.IsDBNull(9) ? (Guid?)null : reader.GetGuid(9),
                targetOfferId = reader.IsDBNull(10) ? (Guid?)null : reader.GetGuid(10),
                offerId = reader.IsDBNull(10) ? (Guid?)null : reader.GetGuid(10),
                offerCode = reader.IsDBNull(11) ? null : reader.GetString(11),
                offerTitle = reader.IsDBNull(12) ? null : reader.GetString(12),
                offerTrlLevel = reader.IsDBNull(13) ? (int?)null : reader.GetInt32(13),
                offerIpStatus = reader.IsDBNull(14) ? null : reader.GetString(14),
                senderTaxCode,
                senderIndustry,
                senderProvince = reader.IsDBNull(17) ? null : reader.GetString(17),
                message = reader.GetString(18),
                proposedBudgetRange = reader.IsDBNull(19) ? null : reader.GetString(19),
                status = reader.GetString(20),
                rejectionReason = reader.IsDBNull(21) ? null : reader.GetString(21),
                slaDeadline,
                isSlaWarning,
                respondedAt = reader.IsDBNull(23) ? (DateTime?)null : reader.GetDateTime(23),
                createdAt = reader.GetDateTime(24),
                buyerType,
                academicTitle,
                specializedField,
                expertProfileId
            });
        }

        return Ok(Ok200(list));
    }

    [HttpGet("brokerage/requests/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetConnectionRequestById(
        Guid id,
        CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT cr.id, cr.request_code, cr.status, cr.rejection_reason, cr.message, cr.proposed_budget_range,
                   cr.created_at, cr.responded_at, cr.sla_deadline,
                   COALESCE(cr.target_offer_id, cr.offer_id) AS target_offer_id,
                   o.offer_code, o.title AS offer_title, o.trl_level AS offer_trl_level, o.ip_status AS offer_ip_status,
                   o.sector_code, o.sector_name, o.price_amount,
                   cr.buyer_organization_id, cr.sender_org_name,
                   ent.id AS enterprise_id, ent.tax_code, ent.main_sector_name, ent.province_city,
                   ent.address_detail, ent.workforce_scale, ent.contact_person, ent.contact_phone, ent.contact_email,
                   opp.id AS created_opp_id, opp.opportunity_code AS created_opp_code,
                   cr.sender_role,
                   p.platform_role AS person_platform_role, p.first_name AS person_first_name, p.last_name AS person_last_name,
                   p.phone AS person_phone, p.email AS person_email,
                   ep.id AS expert_id, ep.academic_rank, ep.degree, ep.organization_name AS expert_institution,
                   array_to_string(ep.expertise_sectors, ', ') AS expert_specialized_field,
                   ep.phone AS expert_phone, ep.email AS expert_email
            FROM brokerage.connection_requests cr
            LEFT JOIN technology.seller_technology_offers o ON o.id = COALESCE(cr.target_offer_id, cr.offer_id)
            LEFT JOIN enterprise.enterprises ent ON ent.id = cr.buyer_organization_id OR ent.name = cr.sender_org_name OR ent.legal_name = cr.sender_org_name
            LEFT JOIN brokerage.opportunities opp ON opp.connection_request_id = cr.id
            LEFT JOIN identity.persons p ON p.id = cr.sender_user_id
            LEFT JOIN brokerage.expert_profiles ep ON ep.person_id = cr.sender_user_id
            WHERE cr.id = @id";

        var p = cmd.CreateParameter();
        p.ParameterName = "@id";
        p.Value = id;
        cmd.Parameters.Add(p);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct))
        {
            return NotFound(new { message = "Không tìm thấy yêu cầu kết nối." });
        }

        var status = reader.GetString(2);
        var isAccepted = string.Equals(status, "ACCEPTED", StringComparison.OrdinalIgnoreCase);

        TargetOfferSummaryDto? targetOffer = null;
        if (!reader.IsDBNull(9))
        {
            var offerId = reader.GetGuid(9);
            var offerCode = reader.IsDBNull(10) ? "" : reader.GetString(10);
            var offerTitle = reader.IsDBNull(11) ? "" : reader.GetString(11);
            var trlLevel = reader.IsDBNull(12) ? 1 : reader.GetInt32(12);
            var trlStage = trlLevel >= 7 ? "Commercial" : trlLevel >= 4 ? "Pilot" : "Lab";
            var ipStatus = reader.IsDBNull(13) ? "NONE" : reader.GetString(13);
            var sectorCode = reader.IsDBNull(14) ? null : reader.GetString(14);
            var sectorName = reader.IsDBNull(15) ? null : reader.GetString(15);
            var priceMillionVnd = reader.IsDBNull(16) ? (decimal?)null : reader.GetDecimal(16);

            targetOffer = new TargetOfferSummaryDto(
                offerId, offerCode, offerTitle, trlLevel, trlStage, ipStatus, sectorCode, sectorName, priceMillionVnd
            );
        }

        var enterpriseId = reader.IsDBNull(19) ? (Guid?)null : reader.GetGuid(19);
        var buyerOrgId = reader.IsDBNull(17) ? (enterpriseId ?? Guid.Empty) : reader.GetGuid(17);
        var rawSenderOrgName = reader.GetString(18);

        var senderRole = reader.IsDBNull(30) ? "BUYER" : reader.GetString(30);
        var personRole = reader.IsDBNull(31) ? null : reader.GetString(31);
        var personFirstName = reader.IsDBNull(32) ? null : reader.GetString(32);
        var personLastName = reader.IsDBNull(33) ? null : reader.GetString(33);
        var personPhone = reader.IsDBNull(34) ? null : reader.GetString(34);
        var personEmail = reader.IsDBNull(35) ? null : reader.GetString(35);
        var expertId = reader.IsDBNull(36) ? (Guid?)null : reader.GetGuid(36);
        var academicRank = reader.IsDBNull(37) ? null : reader.GetString(37);
        var degree = reader.IsDBNull(38) ? null : reader.GetString(38);
        var expertInstitution = reader.IsDBNull(39) ? null : reader.GetString(39);
        var expertSpecializedField = reader.IsDBNull(40) ? null : reader.GetString(40);
        var expertPhone = reader.IsDBNull(41) ? null : reader.GetString(41);
        var expertEmail = reader.IsDBNull(42) ? null : reader.GetString(42);

        string buyerType = "ENTERPRISE";
        string companyName = rawSenderOrgName;
        string? taxCode = reader.IsDBNull(20) ? null : reader.GetString(20);
        string? industry = reader.IsDBNull(21) ? null : reader.GetString(21);
        string? provinceCity = reader.IsDBNull(22) ? null : reader.GetString(22);
        string? address = reader.IsDBNull(23) ? null : reader.GetString(23);
        string? workforce = reader.IsDBNull(24) ? null : reader.GetString(24);
        string? academicTitle = null;
        string? specializedField = null;
        string? expertProfileId = null;

        string rawContactPerson = reader.IsDBNull(25) ? "Người đại diện kết nối" : reader.GetString(25);
        string rawPhone = reader.IsDBNull(26) ? "0901234567" : reader.GetString(26);
        string rawEmail = reader.IsDBNull(27) ? "buyer@company.vn" : reader.GetString(27);

        var personFullName = $"{personLastName} {personFirstName}".Trim();

        if (string.Equals(personRole, "PUBLIC_USER", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(personRole, "GUEST", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(senderRole, "PUBLIC_USER", StringComparison.OrdinalIgnoreCase))
        {
            buyerType = "INDIVIDUAL";
            companyName = !string.IsNullOrWhiteSpace(personFullName) ? personFullName : rawSenderOrgName;
            taxCode = null;
            industry = null;
            workforce = null;
            rawContactPerson = !string.IsNullOrWhiteSpace(personFullName) ? personFullName : companyName;
            if (!string.IsNullOrWhiteSpace(personPhone)) rawPhone = personPhone;
            if (!string.IsNullOrWhiteSpace(personEmail)) rawEmail = personEmail;
        }
        else if (string.Equals(personRole, "EXPERT", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(personRole, "VERIFIED_EXPERT", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(senderRole, "EXPERT", StringComparison.OrdinalIgnoreCase) ||
                 expertId.HasValue)
        {
            buyerType = "EXPERT";
            expertProfileId = expertId?.ToString();
            var titles = new List<string>();
            if (!string.IsNullOrWhiteSpace(academicRank)) titles.Add(academicRank);
            if (!string.IsNullOrWhiteSpace(degree)) titles.Add(degree);
            academicTitle = titles.Count > 0 ? string.Join(" / ", titles) : null;
            specializedField = expertSpecializedField;
            companyName = !string.IsNullOrWhiteSpace(personFullName) ? personFullName : rawSenderOrgName;
            industry = expertInstitution ?? industry;
            taxCode = null;
            workforce = null;
            rawContactPerson = !string.IsNullOrWhiteSpace(personFullName) ? personFullName : companyName;
            rawPhone = expertPhone ?? personPhone ?? rawPhone;
            rawEmail = expertEmail ?? personEmail ?? rawEmail;
        }
        else
        {
            buyerType = "ENTERPRISE";
            if (!string.IsNullOrWhiteSpace(personPhone) && (reader.IsDBNull(26) || string.IsNullOrWhiteSpace(rawPhone)))
                rawPhone = personPhone;
            if (!string.IsNullOrWhiteSpace(personEmail) && (reader.IsDBNull(27) || string.IsNullOrWhiteSpace(rawEmail)))
                rawEmail = personEmail;
        }

        var buyerProfile = new BuyerEnterpriseProfileDto(
            enterpriseId, buyerOrgId, companyName, taxCode, industry, null, provinceCity, address, workforce, null,
            buyerType, academicTitle, specializedField, expertProfileId
        );

        var contactInfo = new PdpdContactInfoDto(
            rawContactPerson,
            isAccepted ? rawPhone : MaskPhone(rawPhone),
            isAccepted ? rawEmail : MaskEmail(rawEmail),
            isAccepted ? null : "[Được bảo vệ theo NĐ 13/2023/NĐ-CP]",
            !isAccepted,
            isAccepted
                ? "Thông tin liên hệ đã được mở khóa do yêu cầu kết nối đã được chấp thuận."
                : "Số điện thoại và Email được bảo vệ theo Nghị định 13/2023/NĐ-CP (PDPD) cho đến khi Bên Bán chấp thuận kết nối."
        );

        DateTime? slaDeadline = reader.IsDBNull(8) ? (DateTime?)null : reader.GetDateTime(8);
        var isSlaWarning = false;
        if (slaDeadline.HasValue && status.ToUpperInvariant() == "PENDING")
        {
            isSlaWarning = slaDeadline.Value <= DateTime.UtcNow.AddHours(12);
        }

        var detailDto = new ConnectionRequestDetailDto(
            Id: reader.GetGuid(0),
            RequestCode: reader.GetString(1),
            Status: status,
            RejectionReason: reader.IsDBNull(3) ? null : reader.GetString(3),
            Message: reader.GetString(4),
            ProposedBudgetRange: reader.IsDBNull(5) ? null : reader.GetString(5),
            CreatedAt: reader.GetDateTime(6),
            RespondedAt: reader.IsDBNull(7) ? (DateTime?)null : reader.GetDateTime(7),
            SlaDeadline: slaDeadline,
            IsSlaWarning: isSlaWarning,
            CreatedOpportunityId: reader.IsDBNull(28) ? (Guid?)null : reader.GetGuid(28),
            CreatedOpportunityCode: reader.IsDBNull(29) ? null : reader.GetString(29),
            TargetOffer: targetOffer,
            BuyerProfile: buyerProfile,
            ContactInfo: contactInfo,
            BuyerType: buyerType,
            AcademicTitle: academicTitle,
            SpecializedField: specializedField,
            ExpertProfileId: expertProfileId
        );

        return Ok(Ok200(detailDto));
    }

    [HttpPost("brokerage/requests")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateConnectionRequest(
        [FromBody] CreateConnectionRequest req,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.SenderOrgName) || req.SenderOrgName.Trim().Length < 3)
            return BadRequest(new { message = "Tên tổ chức gửi yêu cầu phải có ít nhất 3 ký tự." });
        if (string.IsNullOrWhiteSpace(req.ReceiverOrgName))
            return BadRequest(new { message = "Đơn vị tiếp nhận không được để trống" });
        if (string.IsNullOrWhiteSpace(req.Message) || req.Message.Trim().Length < 10)
            return BadRequest(new { message = "Nội dung đề xuất hợp tác phải có ít nhất 10 ký tự." });

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        var requestCode = $"REQ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var senderUserId = Guid.NewGuid();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO brokerage.connection_requests (
                id, request_code, sender_user_id, sender_org_name, sender_role,
                receiver_org_name, demand_id, offer_id, message, proposed_budget_range, status, created_at
            ) VALUES (
                gen_random_uuid(), @code, @senderUserId, @senderOrg, @senderRole,
                @receiverOrg, @demandId, @offerId, @message, @budget, 'PENDING', now()
            ) RETURNING id, created_at;";

        void AddParam(string name, object? val)
        {
            var p = cmd.CreateParameter();
            p.ParameterName = name;
            p.Value = val ?? DBNull.Value;
            cmd.Parameters.Add(p);
        }

        AddParam("@code", requestCode);
        AddParam("@senderUserId", senderUserId);
        AddParam("@senderOrg", req.SenderOrgName);
        AddParam("@senderRole", string.IsNullOrWhiteSpace(req.SenderRole) ? "BUYER" : req.SenderRole);
        AddParam("@receiverOrg", req.ReceiverOrgName);
        AddParam("@demandId", req.DemandId.HasValue && req.DemandId.Value != Guid.Empty ? req.DemandId.Value : DBNull.Value);
        AddParam("@offerId", req.OfferId.HasValue && req.OfferId.Value != Guid.Empty ? req.OfferId.Value : DBNull.Value);
        AddParam("@message", req.Message);
        AddParam("@budget", req.ProposedBudgetRange);

        Guid createdId = Guid.Empty;
        DateTime createdAt = DateTime.UtcNow;

        using (var reader = await cmd.ExecuteReaderAsync(ct))
        {
            if (await reader.ReadAsync(ct))
            {
                createdId = reader.GetGuid(0);
                createdAt = reader.GetDateTime(1);
            }
        }

        return StatusCode(201, Ok200(new
        {
            id = createdId,
            requestCode,
            senderOrgName = req.SenderOrgName,
            receiverOrgName = req.ReceiverOrgName,
            status = "PENDING",
            createdAt
        }));
    }

    [HttpPut("brokerage/requests/{id:guid}/respond")]
    [AllowAnonymous]
    public async Task<IActionResult> RespondConnectionRequest(
        Guid id,
        [FromBody] RespondConnectionRequest req,
        CancellationToken ct)
    {
        var action = req.Action.ToUpperInvariant();
        if (action != "ACCEPT" && action != "REJECT")
            return BadRequest(new { message = "Hành động chỉ nhận ACCEPT hoặc REJECT" });

        if (action == "REJECT" && !string.IsNullOrWhiteSpace(req.RejectionReason) && req.RejectionReason.Trim().Length < 10)
        {
            return BadRequest(new { message = "Lý do từ chối phải có ít nhất 10 ký tự để hỗ trợ đối tác cải thiện đề xuất." });
        }

        var newStatus = action == "ACCEPT" ? "ACCEPTED" : "REJECTED";

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await using var tx = await conn.BeginTransactionAsync(ct);
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = @"
                UPDATE brokerage.connection_requests
                SET status = @status,
                    response_note = @note,
                    rejection_reason = @rejectionReason,
                    responded_at = now()
                WHERE id = @id
                RETURNING id, request_code, sender_org_name, receiver_org_name, demand_id, offer_id, status;";

            var pId = cmd.CreateParameter();
            pId.ParameterName = "@id";
            pId.Value = id;
            cmd.Parameters.Add(pId);

            var pStatus = cmd.CreateParameter();
            pStatus.ParameterName = "@status";
            pStatus.Value = newStatus;
            cmd.Parameters.Add(pStatus);

            var pNote = cmd.CreateParameter();
            pNote.ParameterName = "@note";
            pNote.Value = (object?)req.Note ?? DBNull.Value;
            cmd.Parameters.Add(pNote);

            var pReason = cmd.CreateParameter();
            pReason.ParameterName = "@rejectionReason";
            pReason.Value = (object?)req.RejectionReason ?? DBNull.Value;
            cmd.Parameters.Add(pReason);

            string? requestCode = null;
            string? senderOrg = null;
            string? receiverOrg = null;
            Guid? demandId = null;

            using (var reader = await cmd.ExecuteReaderAsync(ct))
            {
                if (await reader.ReadAsync(ct))
                {
                    requestCode = reader.GetString(1);
                    senderOrg = reader.GetString(2);
                    receiverOrg = reader.GetString(3);
                    demandId = reader.IsDBNull(4) ? (Guid?)null : reader.GetGuid(4);
                }
            }

            if (requestCode == null)
            {
                await tx.RollbackAsync(ct);
                return NotFound(new { message = "Không tìm thấy yêu cầu kết nối" });
            }

            string? syncedDemandStatus = null;

            // Đồng bộ trạng thái 2 chiều sang demand.demand_items (ADR-0013 / CR-TASK-08-DELTA-02 / T047)
            if (demandId.HasValue && demandId.Value != Guid.Empty)
            {
                var targetDemandStatus = action == "ACCEPT" ? "PROCESSING" : "REJECTED";
                using var cmdDemand = conn.CreateCommand();
                cmdDemand.Transaction = tx;
                cmdDemand.CommandText = @"
                    UPDATE demand.demand_items
                    SET status = @status,
                        updated_at = now()
                    WHERE id = @demandId;";

                var pDemStatus = cmdDemand.CreateParameter();
                pDemStatus.ParameterName = "@status";
                pDemStatus.Value = targetDemandStatus;
                cmdDemand.Parameters.Add(pDemStatus);

                var pDemId = cmdDemand.CreateParameter();
                pDemId.ParameterName = "@demandId";
                pDemId.Value = demandId.Value;
                cmdDemand.Parameters.Add(pDemId);

                await cmdDemand.ExecuteNonQueryAsync(ct);
                syncedDemandStatus = targetDemandStatus;
            }

            // Nếu ACCEPTED -> Tự động sinh Opportunity trong Pipeline (BR-BRK-04)
            Guid? opportunityId = null;
            string? oppCode = null;
            if (newStatus == "ACCEPTED")
            {
                oppCode = $"DEAL-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";

                string buyerContactName = senderOrg ?? "Khách hàng Bên Mua";
                string buyerContactPhone = "";
                string buyerContactEmail = "";
                string? assignedExpert = null;

                // 1. Trích xuất thông tin liên hệ thật của Bên Mua từ connection_requests & demand_items
                using (var cmdReqDetail = conn.CreateCommand())
                {
                    cmdReqDetail.Transaction = tx;
                    cmdReqDetail.CommandText = @"
                        SELECT c.message, c.sender_user_id, d.need_consulting, d.technical_problem, d.desired_solution
                        FROM brokerage.connection_requests c
                        LEFT JOIN demand.demand_items d ON d.id = c.demand_id
                        WHERE c.id = @reqId;";
                    var pRId = cmdReqDetail.CreateParameter();
                    pRId.ParameterName = "@reqId";
                    pRId.Value = id;
                    cmdReqDetail.Parameters.Add(pRId);

                    using var rDetail = await cmdReqDetail.ExecuteReaderAsync(ct);
                    if (await rDetail.ReadAsync(ct))
                    {
                        var msg = rDetail.IsDBNull(0) ? "" : rDetail.GetString(0);
                        var senderUid = rDetail.IsDBNull(1) ? (Guid?)null : rDetail.GetGuid(1);
                        var needConsulting = !rDetail.IsDBNull(2) && rDetail.GetBoolean(2);
                        var techProb = rDetail.IsDBNull(3) ? "" : rDetail.GetString(3);
                        var desSol = rDetail.IsDBNull(4) ? "" : rDetail.GetString(4);

                        // Trích xuất: Người liên hệ: {name} ({phone}, {email})
                        var fullText = $"{msg} {techProb} {desSol}";
                        var match = System.Text.RegularExpressions.Regex.Match(
                            fullText,
                            @"Người liên hệ:\s*([^(]+?)\s*\(\s*([0-9+]+)\s*,\s*([^)]+?)\s*\)",
                            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                        if (match.Success)
                        {
                            buyerContactName = match.Groups[1].Value.Trim();
                            buyerContactPhone = match.Groups[2].Value.Trim();
                            buyerContactEmail = match.Groups[3].Value.Trim();
                        }

                        // Chỉ gán chuyên gia cố vấn nếu nhu cầu có yêu cầu tư vấn (need_consulting == true)
                        if (needConsulting)
                        {
                            assignedExpert = "TS. Nguyễn Văn Hùng";
                        }
                    }
                }

                using var cmdOpp = conn.CreateCommand();
                cmdOpp.Transaction = tx;
                cmdOpp.CommandText = @"
                    INSERT INTO brokerage.opportunities (
                        id, opportunity_code, connection_request_id, title,
                        buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
                        seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
                        assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
                        created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), @oppCode, @reqId, @title,
                        @buyerOrg, @buyerContactName, @buyerContactPhone, @buyerContactEmail,
                        @sellerOrg, 'Đại diện Bên Bán', '0987654321', 'seller@partner.vn',
                        @assignedExpert, 'SO_KHCN_HN', 'INITIATED', 1200,
                        now(), now()
                    ) RETURNING id;";

                void AddOppParam(string n, object? v)
                {
                    var p = cmdOpp.CreateParameter();
                    p.ParameterName = n;
                    p.Value = v ?? DBNull.Value;
                    cmdOpp.Parameters.Add(p);
                }

                AddOppParam("@oppCode", oppCode);
                AddOppParam("@reqId", id);
                AddOppParam("@title", $"Cơ hội hợp tác chuyển giao công nghệ giữa {senderOrg} và {receiverOrg}");
                AddOppParam("@buyerOrg", senderOrg);
                AddOppParam("@buyerContactName", buyerContactName);
                AddOppParam("@buyerContactPhone", buyerContactPhone);
                AddOppParam("@buyerContactEmail", buyerContactEmail);
                AddOppParam("@sellerOrg", receiverOrg);
                AddOppParam("@assignedExpert", assignedExpert);

                using var readerOpp = await cmdOpp.ExecuteReaderAsync(ct);
                if (await readerOpp.ReadAsync(ct))
                {
                    opportunityId = readerOpp.GetGuid(0);
                }
            }

            await tx.CommitAsync(ct);

            return Ok(Ok200(new
            {
                requestId = id,
                status = newStatus,
                requestCode,
                syncedDemandStatus,
                createdOpportunityId = opportunityId,
                createdOpportunityCode = oppCode
            }));
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    // -------------------------------------------------------------------------
    // 3. PIPELINE QUẢN LÝ CƠ HỘI (OPPORTUNITIES)
    // -------------------------------------------------------------------------
    [HttpGet("brokerage/opportunities")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOpportunities(
        [FromQuery] string? stage,
        [FromQuery] string? search,
        [FromQuery] string? scope,
        [FromQuery] string? organizationName,
        CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        var sql = @"
            SELECT id, opportunity_code, connection_request_id, title,
                   buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
                   seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
                   assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
                   created_at, updated_at
            FROM brokerage.opportunities
            WHERE 1=1";

        if (!string.IsNullOrWhiteSpace(stage))
        {
            sql += " AND stage = @stage";
            var p = cmd.CreateParameter();
            p.ParameterName = "@stage";
            p.Value = stage.ToUpper();
            cmd.Parameters.Add(p);
        }

        if (string.Equals(scope, "my", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrWhiteSpace(organizationName))
        {
            var orgFilter = organizationName?.Trim();
            if (!string.IsNullOrWhiteSpace(orgFilter))
            {
                sql += " AND (seller_org_name ILIKE @orgFilter OR buyer_org_name ILIKE @orgFilter)";
                var p = cmd.CreateParameter();
                p.ParameterName = "@orgFilter";
                p.Value = $"%{orgFilter}%";
                cmd.Parameters.Add(p);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (title ILIKE @search OR buyer_org_name ILIKE @search OR seller_org_name ILIKE @search OR opportunity_code ILIKE @search)";
            var p = cmd.CreateParameter();
            p.ParameterName = "@search";
            p.Value = $"%{search}%";
            cmd.Parameters.Add(p);
        }

        sql += " ORDER BY updated_at DESC, created_at DESC";
        cmd.CommandText = sql;

        var list = new List<object>();
        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            list.Add(new
            {
                id = reader.GetGuid(0),
                opportunityCode = reader.GetString(1),
                connectionRequestId = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2),
                title = reader.GetString(3),
                buyerOrgName = reader.GetString(4),
                buyerContactName = reader.GetString(5),
                buyerContactPhone = MaskPhone(reader.GetString(6)), // PDPD Masking cho danh sách chung
                buyerContactEmail = MaskEmail(reader.GetString(7)),
                sellerOrgName = reader.GetString(8),
                sellerContactName = reader.GetString(9),
                sellerContactPhone = MaskPhone(reader.GetString(10)),
                sellerContactEmail = MaskEmail(reader.GetString(11)),
                assignedExpertName = reader.IsDBNull(12) ? null : reader.GetString(12),
                managingAuthorityId = reader.IsDBNull(13) ? null : reader.GetString(13),
                stage = reader.GetString(14),
                estimatedValueMillionVnd = reader.IsDBNull(15) ? (int?)null : reader.GetInt32(15),
                createdAt = reader.GetDateTime(16),
                updatedAt = reader.GetDateTime(17)
            });
        }

        return Ok(Ok200(list));
    }

    [HttpPut("brokerage/opportunities/{id:guid}/stage")]
    public async Task<IActionResult> UpdateOpportunityStage(
        Guid id,
        [FromBody] UpdateOpportunityStageRequest req,
        CancellationToken ct)
    {
        var validStages = new[] { "SUGGESTED", "INITIATED", "NEGOTIATING", "MOU_SIGNED", "COMPLETED", "CLOSED_LOST" };
        var stage = req.NewStage.ToUpperInvariant();
        if (!validStages.Contains(stage))
            return BadRequest(new { message = $"Giai đoạn không hợp lệ. Các giai đoạn cho phép: {string.Join(", ", validStages)}" });

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        // Tuân thủ BR-BRK-06: Máy trạng thái hữu hạn (FSM) - Kiểm tra trạng thái hiện tại chống nhảy cóc
        using (var cmdCheck = conn.CreateCommand())
        {
            cmdCheck.CommandText = "SELECT stage FROM brokerage.opportunities WHERE id = @checkId;";
            var pCheckId = cmdCheck.CreateParameter();
            pCheckId.ParameterName = "@checkId";
            pCheckId.Value = id;
            cmdCheck.Parameters.Add(pCheckId);

            var currentStageObj = await cmdCheck.ExecuteScalarAsync(ct);
            if (currentStageObj == null)
                return NotFound(new { message = "Không tìm thấy cơ hội hợp tác" });

            var currentStage = currentStageObj.ToString()?.ToUpperInvariant() ?? "INITIATED";

            var allowedNextStages = currentStage switch
            {
                "SUGGESTED" => new[] { "INITIATED", "CLOSED_LOST" },
                "INITIATED" => new[] { "NEGOTIATING", "CLOSED_LOST" },
                "NEGOTIATING" => new[] { "MOU_SIGNED", "CLOSED_LOST" },
                "MOU_SIGNED" => new[] { "COMPLETED", "CLOSED_LOST" },
                _ => Array.Empty<string>()
            };

            if (!allowedNextStages.Contains(stage))
            {
                return BadRequest(new
                {
                    error = "ERR_INVALID_STATE_TRANSITION",
                    message = $"Không thể nhảy cóc từ giai đoạn {currentStage} sang {stage} theo quy tắc BR-BRK-06."
                });
            }
        }

        await using var tx = await conn.BeginTransactionAsync(ct);
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = @"
                UPDATE brokerage.opportunities
                SET stage = @stage, updated_at = now()
                WHERE id = @id
                RETURNING id, opportunity_code, connection_request_id, stage, updated_at;";

            var pId = cmd.CreateParameter();
            pId.ParameterName = "@id";
            pId.Value = id;
            cmd.Parameters.Add(pId);

            var pStage = cmd.CreateParameter();
            pStage.ParameterName = "@stage";
            pStage.Value = stage;
            cmd.Parameters.Add(pStage);

            Guid oppId = Guid.Empty;
            string oppCode = "";
            Guid? connReqId = null;
            string oppStage = "";
            DateTime updatedAt = DateTime.UtcNow;

            using (var reader = await cmd.ExecuteReaderAsync(ct))
            {
                if (await reader.ReadAsync(ct))
                {
                    oppId = reader.GetGuid(0);
                    oppCode = reader.GetString(1);
                    connReqId = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2);
                    oppStage = reader.GetString(3);
                    updatedAt = reader.GetDateTime(4);
                }
            }

            if (oppId == Guid.Empty)
            {
                await tx.RollbackAsync(ct);
                return NotFound(new { message = "Không tìm thấy cơ hội hợp tác" });
            }

            string? syncedDemandStatus = null;

            // Tra cứu connection_request_id -> demand_id và đồng bộ sang demand.demand_items (ADR-0013 / T048)
            if (connReqId.HasValue && connReqId.Value != Guid.Empty)
            {
                Guid? demandId = null;
                using (var cmdFindDemand = conn.CreateCommand())
                {
                    cmdFindDemand.Transaction = tx;
                    cmdFindDemand.CommandText = "SELECT demand_id FROM brokerage.connection_requests WHERE id = @reqId;";
                    var pReqId = cmdFindDemand.CreateParameter();
                    pReqId.ParameterName = "@reqId";
                    pReqId.Value = connReqId.Value;
                    cmdFindDemand.Parameters.Add(pReqId);

                    var res = await cmdFindDemand.ExecuteScalarAsync(ct);
                    if (res != null && res != DBNull.Value)
                    {
                        if (res is Guid g)
                        {
                            demandId = g;
                        }
                        else if (Guid.TryParse(res.ToString(), out var parsedGuid))
                        {
                            demandId = parsedGuid;
                        }
                    }
                }

                if (demandId.HasValue && demandId.Value != Guid.Empty)
                {
                    string? targetDemandStatus = null;
                    if (stage == "NEGOTIATING")
                    {
                        targetDemandStatus = "NEGOTIATING";
                    }
                    else if (stage == "MOU_SIGNED" || stage == "COMPLETED")
                    {
                        targetDemandStatus = "COMPLETED";
                    }

                    if (targetDemandStatus != null)
                    {
                        using var cmdUpdateDemand = conn.CreateCommand();
                        cmdUpdateDemand.Transaction = tx;
                        cmdUpdateDemand.CommandText = @"
                            UPDATE demand.demand_items
                            SET status = @dStatus, updated_at = now()
                            WHERE id = @demandId;";

                        var pDStatus = cmdUpdateDemand.CreateParameter();
                        pDStatus.ParameterName = "@dStatus";
                        pDStatus.Value = targetDemandStatus;
                        cmdUpdateDemand.Parameters.Add(pDStatus);

                        var pDemandId = cmdUpdateDemand.CreateParameter();
                        pDemandId.ParameterName = "@demandId";
                        pDemandId.Value = demandId.Value;
                        cmdUpdateDemand.Parameters.Add(pDemandId);

                        await cmdUpdateDemand.ExecuteNonQueryAsync(ct);
                        syncedDemandStatus = targetDemandStatus;
                    }
                }
            }

            await tx.CommitAsync(ct);

            return Ok(Ok200(new
            {
                id = oppId,
                opportunityCode = oppCode,
                stage = oppStage,
                syncedDemandStatus,
                updatedAt
            }));
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    // -------------------------------------------------------------------------
    // 4. DEAL ROOM 1-1 & THẢO LUẬN & BIÊN BẢN MOU
    // -------------------------------------------------------------------------
    [HttpGet("brokerage/opportunities/by-demand/{demandId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOpportunityByDemandId(Guid demandId, CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT o.id, o.opportunity_code, o.stage, o.title, o.buyer_org_name, o.seller_org_name
            FROM brokerage.opportunities o
            JOIN brokerage.connection_requests c ON c.id = o.connection_request_id
            WHERE c.demand_id = @demandId
            ORDER BY o.created_at DESC LIMIT 1;";

        var p = cmd.CreateParameter();
        p.ParameterName = "@demandId";
        p.Value = demandId;
        cmd.Parameters.Add(p);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (await reader.ReadAsync(ct))
        {
            var oppId = reader.GetGuid(0);
            var oppCode = reader.GetString(1);
            var stage = reader.GetString(2);
            var title = reader.GetString(3);
            var buyerOrg = reader.GetString(4);
            var sellerOrg = reader.GetString(5);

            return Ok(Ok200(new
            {
                opportunityId = oppId,
                opportunityCode = oppCode,
                stage,
                title,
                buyerOrgName = buyerOrg,
                sellerOrgName = sellerOrg,
                dealRoomUrl = $"/portal/opportunities/{oppId}/deal-room"
            }));
        }

        return NotFound(new
        {
            success = false,
            message = "Chưa có phòng đàm phán Deal Room nào được thiết lập cho đơn hàng này."
        });
    }

    [HttpGet("brokerage/opportunities/{id:guid}/deal-room")]
    public async Task<IActionResult> GetDealRoomDetails(Guid id, CancellationToken ct)
    {
        if (!Actor.IsAuthenticated || Actor.PersonId == null)
        {
            return Unauthorized(new { message = "Yêu cầu đăng nhập để truy cập Deal Room mật." });
        }

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        // Lấy thông tin chi tiết cơ hội (Full unmasked vì người dùng đang ở trong Deal Room có thẩm quyền)
        using var cmdOpp = conn.CreateCommand();
        cmdOpp.CommandText = @"
            SELECT id, opportunity_code, connection_request_id, title,
                   buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
                   seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
                   assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
                   created_at, updated_at
            FROM brokerage.opportunities
            WHERE id = @id;";
        var pId = cmdOpp.CreateParameter();
        pId.ParameterName = "@id";
        pId.Value = id;
        cmdOpp.Parameters.Add(pId);

        object? opportunity = null;
        using (var reader = await cmdOpp.ExecuteReaderAsync(ct))
        {
            if (await reader.ReadAsync(ct))
            {
                opportunity = new
                {
                    id = reader.GetGuid(0),
                    opportunityCode = reader.GetString(1),
                    connectionRequestId = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2),
                    title = reader.GetString(3),
                    buyerOrgName = reader.GetString(4),
                    buyerContactName = reader.GetString(5),
                    buyerContactPhone = reader.GetString(6), // UNMASKED inside deal room
                    buyerContactEmail = reader.GetString(7),
                    sellerOrgName = reader.GetString(8),
                    sellerContactName = reader.GetString(9),
                    sellerContactPhone = reader.GetString(10), // UNMASKED inside deal room
                    sellerContactEmail = reader.GetString(11),
                    assignedExpertName = reader.IsDBNull(12) ? null : reader.GetString(12),
                    managingAuthorityId = reader.IsDBNull(13) ? null : reader.GetString(13),
                    stage = reader.GetString(14),
                    estimatedValueMillionVnd = reader.IsDBNull(15) ? (int?)null : reader.GetInt32(15),
                    createdAt = reader.GetDateTime(16),
                    updatedAt = reader.GetDateTime(17)
                };
            }
        }

        if (opportunity == null) return NotFound(new { message = "Không tìm thấy Deal Room cho cơ hội này" });

        // Lấy lịch sử trao đổi discussions
        using var cmdDisc = conn.CreateCommand();
        cmdDisc.CommandText = @"
            SELECT id, sender_name, sender_role, message, attachment_url, created_at
            FROM brokerage.deal_discussions
            WHERE opportunity_id = @id
            ORDER BY created_at ASC;";
        var pDiscId = cmdDisc.CreateParameter();
        pDiscId.ParameterName = "@id";
        pDiscId.Value = id;
        cmdDisc.Parameters.Add(pDiscId);

        var discussions = new List<object>();
        using (var reader = await cmdDisc.ExecuteReaderAsync(ct))
        {
            while (await reader.ReadAsync(ct))
            {
                discussions.Add(new
                {
                    id = reader.GetGuid(0),
                    senderName = reader.GetString(1),
                    senderRole = reader.GetString(2),
                    message = reader.GetString(3),
                    attachmentUrl = reader.IsDBNull(4) ? null : reader.GetString(4),
                    createdAt = reader.GetDateTime(5)
                });
            }
        }

        // Lấy biên bản MOU nếu có
        using var cmdMou = conn.CreateCommand();
        cmdMou.CommandText = @"
            SELECT id, mou_code, scope_of_work, pilot_duration_months, commercial_terms,
                   intellectual_property_terms, status, signed_date, created_at
            FROM brokerage.mou_agreements
            WHERE opportunity_id = @id
            ORDER BY created_at DESC LIMIT 1;";
        var pMouId = cmdMou.CreateParameter();
        pMouId.ParameterName = "@id";
        pMouId.Value = id;
        cmdMou.Parameters.Add(pMouId);

        object? mou = null;
        using (var reader = await cmdMou.ExecuteReaderAsync(ct))
        {
            if (await reader.ReadAsync(ct))
            {
                mou = new
                {
                    id = reader.GetGuid(0),
                    mouCode = reader.GetString(1),
                    scopeOfWork = reader.GetString(2),
                    pilotDurationMonths = reader.GetInt32(3),
                    commercialTerms = reader.GetString(4),
                    intellectualPropertyTerms = reader.GetString(5),
                    status = reader.GetString(6),
                    signedDate = reader.IsDBNull(7) ? (DateTime?)null : reader.GetDateTime(7),
                    createdAt = reader.GetDateTime(8)
                };
            }
        }

        return Ok(Ok200(new
        {
            opportunity,
            discussions,
            mou
        }));
    }

    [HttpPost("brokerage/opportunities/{id:guid}/discussions")]
    [AllowAnonymous]
    public async Task<IActionResult> PostDiscussion(
        Guid id,
        [FromBody] SendDealDiscussionRequest req,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Message))
            return BadRequest(new { message = "Nội dung thảo luận không được để trống" });

        // Tuân thủ BR-BRK-07: Tự động trích xuất hoặc gán mặc định nếu thiếu senderName / senderRole
        var senderName = !string.IsNullOrWhiteSpace(req.SenderName)
            ? req.SenderName
            : (Actor.Email ?? "Đại diện Doanh nghiệp");
        var senderRole = !string.IsNullOrWhiteSpace(req.SenderRole)
            ? req.SenderRole
            : (Actor.PlatformRole != PlatformRoles.Anonymous ? Actor.PlatformRole : "BUYER");

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO brokerage.deal_discussions (
                id, opportunity_id, sender_name, sender_role, message, attachment_url, created_at
            ) VALUES (
                gen_random_uuid(), @oppId, @senderName, @senderRole, @message, @attachmentUrl, now()
            ) RETURNING id, created_at;";

        void AddParam(string n, object? v)
        {
            var p = cmd.CreateParameter();
            p.ParameterName = n;
            p.Value = v ?? DBNull.Value;
            cmd.Parameters.Add(p);
        }

        AddParam("@oppId", id);
        AddParam("@senderName", senderName);
        AddParam("@senderRole", senderRole);
        AddParam("@message", req.Message);
        AddParam("@attachmentUrl", req.AttachmentUrl);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        Guid createdDiscussionId = Guid.Empty;
        DateTime createdAt = DateTime.UtcNow;
        if (await reader.ReadAsync(ct))
        {
            createdDiscussionId = reader.GetGuid(0);
            createdAt = reader.GetDateTime(1);
        }

        if (createdDiscussionId == Guid.Empty)
        {
            return BadRequest(new { message = "Lỗi khi ghi nhận thảo luận" });
        }

        // Tự động chuyển cơ hội sang NEGOTIATING và đồng bộ demand.demand_items sang Bước 3 khi có trao đổi
        using (var cmdSyncDisc = conn.CreateCommand())
        {
            cmdSyncDisc.CommandText = @"
                UPDATE brokerage.opportunities 
                SET stage = 'NEGOTIATING', updated_at = now() 
                WHERE id = @oppId AND stage = 'INITIATED';

                UPDATE demand.demand_items
                SET status = 'NEGOTIATING', updated_at = now()
                WHERE id = (
                    SELECT c.demand_id 
                    FROM brokerage.connection_requests c 
                    JOIN brokerage.opportunities o ON o.connection_request_id = c.id 
                    WHERE o.id = @oppId
                ) AND status = 'PROCESSING';";

            var pSyncOppId = cmdSyncDisc.CreateParameter();
            pSyncOppId.ParameterName = "@oppId";
            pSyncOppId.Value = id;
            cmdSyncDisc.Parameters.Add(pSyncOppId);
            await cmdSyncDisc.ExecuteNonQueryAsync(ct);
        }

        return Ok(Ok200(new
        {
            id = createdDiscussionId,
            opportunityId = id,
            senderName = senderName,
            senderRole = senderRole,
            message = req.Message,
            attachmentUrl = req.AttachmentUrl,
            createdAt = createdAt
        }));
    }

    [HttpPost("brokerage/opportunities/{id:guid}/mou")]
    [AllowAnonymous]
    public async Task<IActionResult> SaveMou(
        Guid id,
        [FromBody] SaveMouRequest req,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.ScopeOfWork))
            return BadRequest(new { message = "Phạm vi hợp tác không được để trống" });

        // Tuân thủ BR-BRK-08: Dung sai DTO và gán mẫu điều khoản mặc định (Boilerplate Clauses)
        var duration = req.PilotDurationMonths ?? req.DurationMonths ?? 6;
        var commercial = !string.IsNullOrWhiteSpace(req.CommercialTerms)
            ? req.CommercialTerms
            : "Chi phí thử nghiệm thực địa do hai bên đồng tài trợ theo tiến độ thống nhất.";
        var ip = !string.IsNullOrWhiteSpace(req.IntellectualPropertyTerms)
            ? req.IntellectualPropertyTerms
            : "Quyền sở hữu trí tuệ gốc thuộc về bên tạo lập; dữ liệu phát sinh trong thử nghiệm thuộc quyền khai thác chung.";

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        var mouStatus = req.Status?.ToUpper() == "SIGNED" ? "SIGNED" : "DRAFT";
        DateTime? signedDate = mouStatus == "SIGNED" ? DateTime.UtcNow : null;
        var mouCode = $"MOU-{DateTime.UtcNow:yyyyMM}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO brokerage.mou_agreements (
                id, mou_code, opportunity_id, scope_of_work, pilot_duration_months,
                commercial_terms, intellectual_property_terms, status, signed_date, created_at
            ) VALUES (
                gen_random_uuid(), @code, @oppId, @scope, @duration,
                @commercial, @ip, @status, @signedDate, now()
            ) RETURNING id, mou_code, status, created_at;";

        void AddParam(string n, object? v)
        {
            var p = cmd.CreateParameter();
            p.ParameterName = n;
            p.Value = v ?? DBNull.Value;
            cmd.Parameters.Add(p);
        }

        AddParam("@code", mouCode);
        AddParam("@oppId", id);
        AddParam("@scope", req.ScopeOfWork);
        AddParam("@duration", duration);
        AddParam("@commercial", commercial);
        AddParam("@ip", ip);
        AddParam("@status", mouStatus);
        AddParam("@signedDate", signedDate);

        Guid createdMouId = Guid.Empty;
        string? code = null;
        string? status = null;

        using (var reader = await cmd.ExecuteReaderAsync(ct))
        {
            if (await reader.ReadAsync(ct))
            {
                createdMouId = reader.GetGuid(0);
                code = reader.GetString(1);
                status = reader.GetString(2);
            }
        }

        if (createdMouId == Guid.Empty || code == null)
            return BadRequest(new { message = "Lỗi khi lưu thỏa thuận MOU" });

        // Tự động đồng bộ máy trạng thái cơ hội và đơn hàng (ADR-0013 / Bước 3 & Bước 4)
        using (var cmdSyncMou = conn.CreateCommand())
        {
            if (mouStatus == "SIGNED")
            {
                // Khi ký kết chính thức MOU -> stage = MOU_SIGNED và demand_items = COMPLETED (Bước 4)
                cmdSyncMou.CommandText = @"
                    UPDATE brokerage.opportunities 
                    SET stage = 'MOU_SIGNED', updated_at = now() 
                    WHERE id = @id;

                    UPDATE demand.demand_items
                    SET status = 'COMPLETED', updated_at = now()
                    WHERE id = (
                        SELECT c.demand_id 
                        FROM brokerage.connection_requests c 
                        JOIN brokerage.opportunities o ON o.connection_request_id = c.id 
                        WHERE o.id = @id
                    );";
            }
            else
            {
                // Khi lưu dự thảo DRAFT MOU -> stage = NEGOTIATING và demand_items = NEGOTIATING (Bước 3)
                cmdSyncMou.CommandText = @"
                    UPDATE brokerage.opportunities 
                    SET stage = 'NEGOTIATING', updated_at = now() 
                    WHERE id = @id AND stage = 'INITIATED';

                    UPDATE demand.demand_items
                    SET status = 'NEGOTIATING', updated_at = now()
                    WHERE id = (
                        SELECT c.demand_id 
                        FROM brokerage.connection_requests c 
                        JOIN brokerage.opportunities o ON o.connection_request_id = c.id 
                        WHERE o.id = @id
                    ) AND status = 'PROCESSING';";
            }

            var pId = cmdSyncMou.CreateParameter();
            pId.ParameterName = "@id";
            pId.Value = id;
            cmdSyncMou.Parameters.Add(pId);
            await cmdSyncMou.ExecuteNonQueryAsync(ct);
        }

        return Ok(Ok200(new
        {
            id = createdMouId,
            mouCode = code,
            opportunityId = id,
            status,
            scopeOfWork = req.ScopeOfWork,
            pilotDurationMonths = req.PilotDurationMonths,
            signedDate
        }));
    }

    // -------------------------------------------------------------------------
    // 5. CỔNG GIÁM SÁT SỞ KH&CN (GOV OVERSIGHT)
    // -------------------------------------------------------------------------
    [HttpGet("gov/opportunities")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGovOpportunities(
        [FromQuery] string? authorityId,
        CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        // 1. Thống kê tổng hợp số lượng theo stage
        using var cmdStats = conn.CreateCommand();
        cmdStats.CommandText = @"
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE stage = 'SUGGESTED') as suggested_count,
                COUNT(*) FILTER (WHERE stage = 'INITIATED') as initiated_count,
                COUNT(*) FILTER (WHERE stage = 'NEGOTIATING') as negotiating_count,
                COUNT(*) FILTER (WHERE stage = 'MOU_SIGNED') as mou_signed_count,
                COUNT(*) FILTER (WHERE stage = 'COMPLETED') as completed_count,
                COUNT(*) FILTER (WHERE stage = 'CLOSED_LOST') as closed_lost_count,
                COALESCE(SUM(estimated_value_million_vnd), 0) as total_estimated_value
            FROM brokerage.opportunities;";

        object? stats = null;
        using (var reader = await cmdStats.ExecuteReaderAsync(ct))
        {
            if (await reader.ReadAsync(ct))
            {
                stats = new
                {
                    total = reader.GetInt64(0),
                    suggested = reader.GetInt64(1),
                    initiated = reader.GetInt64(2),
                    negotiating = reader.GetInt64(3),
                    mouSigned = reader.GetInt64(4),
                    completed = reader.GetInt64(5),
                    closedLost = reader.GetInt64(6),
                    totalEstimatedValueMillionVnd = reader.GetInt64(7)
                };
            }
        }

        // 2. Danh sách cơ hội kèm cờ cảnh báo SLA (> 48 giờ ở trạng thái INITIATED mà chưa chuyển đàm phán)
        using var cmdList = conn.CreateCommand();
        cmdList.CommandText = @"
            SELECT id, opportunity_code, title, buyer_org_name, seller_org_name,
                   assigned_expert_name, managing_authority_id, stage,
                   estimated_value_million_vnd, created_at, updated_at,
                   (stage = 'INITIATED' AND updated_at < now() - interval '48 hours') as is_sla_warning
            FROM brokerage.opportunities
            ORDER BY is_sla_warning DESC, updated_at DESC;";

        var items = new List<object>();
        using (var reader = await cmdList.ExecuteReaderAsync(ct))
        {
            while (await reader.ReadAsync(ct))
            {
                items.Add(new
                {
                    id = reader.GetGuid(0),
                    opportunityCode = reader.GetString(1),
                    title = reader.GetString(2),
                    buyerOrgName = reader.GetString(3),
                    sellerOrgName = reader.GetString(4),
                    assignedExpertName = reader.IsDBNull(5) ? null : reader.GetString(5),
                    managingAuthorityId = reader.IsDBNull(6) ? null : reader.GetString(6),
                    stage = reader.GetString(7),
                    estimatedValueMillionVnd = reader.IsDBNull(8) ? (int?)null : reader.GetInt32(8),
                    createdAt = reader.GetDateTime(9),
                    updatedAt = reader.GetDateTime(10),
                    isSlaWarning = reader.GetBoolean(11)
                });
            }
        }

        return Ok(Ok200(new
        {
            statistics = stats,
            opportunities = items
        }));
    }
}
