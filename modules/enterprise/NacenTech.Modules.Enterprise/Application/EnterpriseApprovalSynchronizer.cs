using System.Linq;
using System.Collections.Generic;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Application;

public sealed class EnterpriseApprovalSynchronizer(DbContext db) : IEnterpriseApprovalSynchronizer
{
    public async Task ApplyAsync(
        Guid personId,
        string? scopeId,
        string payloadJson,
        string action,
        string? reviewNote,
        CancellationToken ct)
    {
        string? taxCode = null;
        string? companyName = null;
        string? province = null;

        if (!string.IsNullOrWhiteSpace(payloadJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(payloadJson);
                if (doc.RootElement.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in doc.RootElement.EnumerateObject())
                    {
                        var propName = prop.Name;
                        if (prop.Value.ValueKind == JsonValueKind.String)
                        {
                            var val = prop.Value.GetString()?.Trim();
                            if (string.IsNullOrEmpty(val)) continue;

                            if (propName.Equals("taxCode", StringComparison.OrdinalIgnoreCase) ||
                                propName.Equals("tax_code", StringComparison.OrdinalIgnoreCase) ||
                                propName.Equals("mst", StringComparison.OrdinalIgnoreCase))
                            {
                                taxCode = val;
                            }
                            else if (propName.Equals("companyName", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("company_name", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("legalName", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("legal_name", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("orgName", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("org_name", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("name", StringComparison.OrdinalIgnoreCase))
                            {
                                companyName = val;
                            }
                            else if (propName.Equals("province", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("provinceCity", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("province_city", StringComparison.OrdinalIgnoreCase) ||
                                     propName.Equals("provinceId", StringComparison.OrdinalIgnoreCase))
                            {
                                province = val;
                            }
                        }
                    }
                }
            }
            catch (JsonException)
            {
                // Proceed with fallback extracted values if parsing fails
            }
        }

        Domain.Enterprise? ent = null;
        if (personId != Guid.Empty)
        {
            ent = await db.Set<Domain.Enterprise>().FirstOrDefaultAsync(x => x.OwnerPersonId == personId, ct);
        }

        if (ent == null && !string.IsNullOrWhiteSpace(taxCode))
        {
            ent = await db.Set<Domain.Enterprise>().FirstOrDefaultAsync(x => x.TaxCode == taxCode, ct);
        }

        var normalizedAction = action?.Trim().ToUpperInvariant() ?? string.Empty;

        switch (normalizedAction)
        {
            case "APPROVE":
                var note = reviewNote ?? "Phê duyệt BACLINK";
                if (ent != null)
                {
                    ent.OwnerPersonId = personId;
                    ent.IsVerified = true;
                    ent.VerificationStatus = "VERIFIED";
                    ent.IsBuyer = true;
                    ent.IsSeller = true;
                    ent.CapabilityTier = "DUAL";
                    if (string.IsNullOrWhiteSpace(ent.ActiveRole))
                    {
                        ent.ActiveRole = "BUYER";
                    }
                    ent.Approve(note);
                }
                else
                {
                    var resolvedName = !string.IsNullOrWhiteSpace(companyName) ? companyName : "Doanh nghiệp Hội viên BACLINK";
                    var resolvedProvince = province ?? scopeId ?? "BN";
                    ent = new Domain.Enterprise(Guid.NewGuid())
                    {
                        OwnerPersonId = personId,
                        TaxCode = taxCode,
                        Name = resolvedName,
                        LegalName = resolvedName,
                        ProvinceCity = resolvedProvince,
                        MainSectorName = "Công nghiệp hỗ trợ & Chuyển đổi số",
                        IsVerified = true,
                        VerificationStatus = "VERIFIED",
                        Status = "ACTIVE",
                        IsBuyer = true,
                        IsSeller = true,
                        CapabilityTier = "DUAL",
                        ActiveRole = "BUYER"
                    };
                    ent.Approve(note);
                    db.Set<Domain.Enterprise>().Add(ent);
                }
                if (ent != null) ApplyJoinPayload(ent, payloadJson);
                break;

            case "REJECT":
            case "REVOKE":
            case "REVOKE_EXPERT":
                if (ent != null)
                {
                    ent.IsVerified = false;
                    ent.VerificationStatus = "REJECTED";
                    ent.TouchEntity();
                }
                break;
        }
    }

    /// <summary>
    /// CR-BACLINK-008 · REQ-BL08-JOIN-005: chép dữ liệu wizard gia nhập vào hồ sơ doanh nghiệp.
    /// Người đại diện / trợ lý / sản phẩm nổi bật lưu trong ProfileDetailsJson.membershipApplication (không thêm cột).
    /// Chỉ ghi đè trường đang trống để không làm mất dữ liệu doanh nghiệp tự cập nhật.
    /// </summary>
    private static void ApplyJoinPayload(Domain.Enterprise ent, string payloadJson)
    {
        if (string.IsNullOrWhiteSpace(payloadJson)) return;
        Dictionary<string, string> p;
        try
        {
            using var doc = JsonDocument.Parse(payloadJson);
            if (doc.RootElement.ValueKind != JsonValueKind.Object) return;
            p = doc.RootElement.EnumerateObject()
                .Where(x => x.Value.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(x.Value.GetString()))
                .ToDictionary(x => x.Name, x => x.Value.GetString()!.Trim(), StringComparer.OrdinalIgnoreCase);
        }
        catch (JsonException) { return; }

        string? Get(string k) => p.TryGetValue(k, out var v) ? v : null;
        static bool Empty(string? v) => string.IsNullOrWhiteSpace(v);

        if (Empty(ent.SectorCode) && Get("sectorCode") is { } sc) ent.SectorCode = sc;
        if (Get("district") is { } d && (Empty(ent.ProvinceCity) || ent.ProvinceCity == "BN")) ent.ProvinceCity = d;
        if (Empty(ent.OperatingZone) && Get("industrialZone") is { } iz) ent.OperatingZone = iz;
        if (Empty(ent.Description) && Get("description") is { } desc) ent.Description = desc;
        if (Empty(ent.Website) && Get("website") is { } web) ent.Website = web;
        if (Empty(ent.ContactPerson) && Get("representativeName") is { } rn) ent.ContactPerson = rn;
        if (Empty(ent.ContactPhone) && Get("representativePhone") is { } rp) ent.ContactPhone = rp;
        if (Empty(ent.ContactEmail) && Get("representativeEmail") is { } re) ent.ContactEmail = re;
        if (Get("workforceScale") is { } ws && Empty(ent.WorkforceScale)) ent.WorkforceScale = ws;

        var details = new Dictionary<string, object?>();
        try
        {
            if (!string.IsNullOrWhiteSpace(ent.ProfileDetailsJson))
                details = JsonSerializer.Deserialize<Dictionary<string, object?>>(ent.ProfileDetailsJson) ?? new();
        }
        catch (JsonException) { details = new(); }

        details["membershipApplication"] = new Dictionary<string, string?>
        {
            ["representativeSalutation"] = Get("representativeSalutation"),
            ["representativeName"] = Get("representativeName"),
            ["representativeTitle"] = Get("representativeTitle"),
            ["representativePhone"] = Get("representativePhone"),
            ["representativeEmail"] = Get("representativeEmail"),
            ["assistantName"] = Get("assistantName"),
            ["assistantPhone"] = Get("assistantPhone"),
            ["assistantEmail"] = Get("assistantEmail"),
            ["highlightProducts"] = Get("highlightProducts"),
            ["tierCode"] = Get("tierCode"),
            ["acceptedCharterAt"] = Get("acceptedCharterAt"),
        };
        ent.ProfileDetailsJson = JsonSerializer.Serialize(details);
    }
}
