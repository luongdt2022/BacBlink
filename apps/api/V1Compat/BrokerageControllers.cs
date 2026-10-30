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
    int? EmployeeCountRange
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
    DateTime CreatedAt
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
    PdpdContactInfoDto ContactInfo
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

// =========================================================================
// CONTROLLER
// =========================================================================

[ApiController]
[Route("api/v1")]
public sealed class BrokerageControllers(NacenTechDbContext db) : V1ControllerBase
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

    // -------------------------------------------------------------------------
    // 1. RADAR GHÉP NỐI CUNG–CẦU
    // -------------------------------------------------------------------------
    [HttpGet("brokerage/radar")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRadarCandidates(
        [FromQuery] string? sector,
        [FromQuery] int? minScore,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        var sql = @"
            SELECT id, demand_id, demand_code, demand_title, buyer_organization_id, buyer_organization_name,
                   offer_id, offer_code, offer_title, seller_organization_id, seller_organization_name,
                   sector_code, match_score, tni_score, trl_level, ip_status, is_active, created_at
            FROM brokerage.match_candidates
            WHERE is_active = true";

        if (!string.IsNullOrWhiteSpace(sector))
        {
            sql += " AND sector_code = @sector";
            var p = cmd.CreateParameter();
            p.ParameterName = "@sector";
            p.Value = sector;
            cmd.Parameters.Add(p);
        }

        if (minScore.HasValue)
        {
            sql += " AND match_score >= @minScore";
            var p = cmd.CreateParameter();
            p.ParameterName = "@minScore";
            p.Value = minScore.Value;
            cmd.Parameters.Add(p);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (demand_title ILIKE @search OR offer_title ILIKE @search OR buyer_organization_name ILIKE @search OR seller_organization_name ILIKE @search)";
            var p = cmd.CreateParameter();
            p.ParameterName = "@search";
            p.Value = $"%{search}%";
            cmd.Parameters.Add(p);
        }

        sql += " ORDER BY match_score DESC, created_at DESC";
        cmd.CommandText = sql;

        var list = new List<object>();
        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            list.Add(new
            {
                id = reader.GetGuid(0),
                demandId = reader.GetGuid(1),
                demandCode = reader.GetString(2),
                demandTitle = reader.GetString(3),
                buyerOrganizationId = reader.IsDBNull(4) ? (Guid?)null : reader.GetGuid(4),
                buyerOrganizationName = reader.GetString(5),
                offerId = reader.GetGuid(6),
                offerCode = reader.GetString(7),
                offerTitle = reader.GetString(8),
                sellerOrganizationId = reader.IsDBNull(9) ? (Guid?)null : reader.GetGuid(9),
                sellerOrganizationName = reader.GetString(10),
                sectorCode = reader.GetString(11),
                matchScore = reader.GetInt32(12),
                tniScore = reader.GetInt32(13),
                trlLevel = reader.GetInt32(14),
                ipStatus = reader.GetString(15),
                isActive = reader.GetBoolean(16),
                createdAt = reader.GetDateTime(17)
            });
        }

        return Ok(Ok200(list));
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
                   cr.responded_at, cr.created_at
            FROM brokerage.connection_requests cr
            LEFT JOIN technology.seller_technology_offers o ON o.id = COALESCE(cr.target_offer_id, cr.offer_id)
            LEFT JOIN enterprise.enterprises ent ON ent.id = cr.buyer_organization_id OR ent.name = cr.sender_org_name OR ent.legal_name = cr.sender_org_name
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

            list.Add(new
            {
                id = reader.GetGuid(0),
                requestCode = reader.GetString(1),
                senderUserId = reader.GetGuid(2),
                buyerOrganizationId = reader.IsDBNull(3) ? (Guid?)null : reader.GetGuid(3),
                senderOrgName = reader.GetString(4),
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
                senderTaxCode = reader.IsDBNull(15) ? null : reader.GetString(15),
                senderIndustry = reader.IsDBNull(16) ? null : reader.GetString(16),
                senderProvince = reader.IsDBNull(17) ? null : reader.GetString(17),
                message = reader.GetString(18),
                proposedBudgetRange = reader.IsDBNull(19) ? null : reader.GetString(19),
                status = reader.GetString(20),
                rejectionReason = reader.IsDBNull(21) ? null : reader.GetString(21),
                slaDeadline,
                isSlaWarning,
                respondedAt = reader.IsDBNull(23) ? (DateTime?)null : reader.GetDateTime(23),
                createdAt = reader.GetDateTime(24)
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
                   opp.id AS created_opp_id, opp.opportunity_code AS created_opp_code
            FROM brokerage.connection_requests cr
            LEFT JOIN technology.seller_technology_offers o ON o.id = COALESCE(cr.target_offer_id, cr.offer_id)
            LEFT JOIN enterprise.enterprises ent ON ent.id = cr.buyer_organization_id OR ent.name = cr.sender_org_name OR ent.legal_name = cr.sender_org_name
            LEFT JOIN brokerage.opportunities opp ON opp.connection_request_id = cr.id
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
        var companyName = reader.GetString(18);
        var taxCode = reader.IsDBNull(20) ? null : reader.GetString(20);
        var industry = reader.IsDBNull(21) ? null : reader.GetString(21);
        var provinceCity = reader.IsDBNull(22) ? null : reader.GetString(22);
        var address = reader.IsDBNull(23) ? null : reader.GetString(23);
        var workforce = reader.IsDBNull(24) ? null : reader.GetString(24);

        var buyerProfile = new BuyerEnterpriseProfileDto(
            enterpriseId, buyerOrgId, companyName, taxCode, industry, null, provinceCity, address, workforce, null
        );

        var rawContactPerson = reader.IsDBNull(25) ? "Người đại diện kết nối" : reader.GetString(25);
        var rawPhone = reader.IsDBNull(26) ? "0901234567" : reader.GetString(26);
        var rawEmail = reader.IsDBNull(27) ? "buyer@company.vn" : reader.GetString(27);

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
            ContactInfo: contactInfo
        );

        return Ok(Ok200(detailDto));
    }

    [HttpPost("brokerage/requests")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateConnectionRequest(
        [FromBody] CreateConnectionRequest req,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.SenderOrgName))
            return BadRequest(new { message = "Đơn vị gửi kết nối không được để trống" });
        if (string.IsNullOrWhiteSpace(req.ReceiverOrgName))
            return BadRequest(new { message = "Đơn vị tiếp nhận không được để trống" });
        if (string.IsNullOrWhiteSpace(req.Message))
            return BadRequest(new { message = "Nội dung đề xuất kết nối không được để trống" });

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

        using var cmd = conn.CreateCommand();
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

        using (var reader = await cmd.ExecuteReaderAsync(ct))
        {
            if (await reader.ReadAsync(ct))
            {
                requestCode = reader.GetString(1);
                senderOrg = reader.GetString(2);
                receiverOrg = reader.GetString(3);
            }
        }

        if (requestCode == null)
            return NotFound(new { message = "Không tìm thấy yêu cầu kết nối" });

        // Nếu ACCEPTED -> Tự động sinh Opportunity trong Pipeline (BR-BRK-04)
        Guid? opportunityId = null;
        string? oppCode = null;
        if (newStatus == "ACCEPTED")
        {
            oppCode = $"DEAL-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";
            using var cmdOpp = conn.CreateCommand();
            cmdOpp.CommandText = @"
                INSERT INTO brokerage.opportunities (
                    id, opportunity_code, connection_request_id, title,
                    buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
                    seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
                    assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
                    created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), @oppCode, @reqId, @title,
                    @buyerOrg, 'Đại diện Bên Mua', '0901234567', 'buyer@company.vn',
                    @sellerOrg, 'Đại diện Bên Bán', '0987654321', 'seller@partner.vn',
                    'TS. Nguyễn Văn Hùng', 'SO_KHCN_HN', 'INITIATED', 1200,
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
            AddOppParam("@sellerOrg", receiverOrg);

            using var readerOpp = await cmdOpp.ExecuteReaderAsync(ct);
            if (await readerOpp.ReadAsync(ct))
            {
                opportunityId = readerOpp.GetGuid(0);
            }
        }

        return Ok(Ok200(new
        {
            requestId = id,
            status = newStatus,
            requestCode,
            createdOpportunityId = opportunityId,
            createdOpportunityCode = oppCode
        }));
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

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE brokerage.opportunities
            SET stage = @stage, updated_at = now()
            WHERE id = @id
            RETURNING id, opportunity_code, stage, updated_at;";

        var pId = cmd.CreateParameter();
        pId.ParameterName = "@id";
        pId.Value = id;
        cmd.Parameters.Add(pId);

        var pStage = cmd.CreateParameter();
        pStage.ParameterName = "@stage";
        pStage.Value = stage;
        cmd.Parameters.Add(pStage);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (await reader.ReadAsync(ct))
        {
            return Ok(Ok200(new
            {
                id = reader.GetGuid(0),
                opportunityCode = reader.GetString(1),
                stage = reader.GetString(2),
                updatedAt = reader.GetDateTime(3)
            }));
        }

        return NotFound(new { message = "Không tìm thấy cơ hội hợp tác" });
    }

    // -------------------------------------------------------------------------
    // 4. DEAL ROOM 1-1 & THẢO LUẬN & BIÊN BẢN MOU
    // -------------------------------------------------------------------------
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
        if (await reader.ReadAsync(ct))
        {
            return Ok(Ok200(new
            {
                id = reader.GetGuid(0),
                opportunityId = id,
                senderName = senderName,
                senderRole = senderRole,
                message = req.Message,
                attachmentUrl = req.AttachmentUrl,
                createdAt = reader.GetDateTime(1)
            }));
        }

        return BadRequest(new { message = "Lỗi khi ghi nhận thảo luận" });
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

        // Nếu MOU SIGNED -> Cập nhật stage cơ hội lên MOU_SIGNED (BR-BRK-06)
        if (mouStatus == "SIGNED")
        {
            using var cmdUpdateOpp = conn.CreateCommand();
            cmdUpdateOpp.CommandText = "UPDATE brokerage.opportunities SET stage = 'MOU_SIGNED', updated_at = now() WHERE id = @id";
            var pId = cmdUpdateOpp.CreateParameter();
            pId.ParameterName = "@id";
            pId.Value = id;
            cmdUpdateOpp.Parameters.Add(pId);
            await cmdUpdateOpp.ExecuteNonQueryAsync(ct);
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
