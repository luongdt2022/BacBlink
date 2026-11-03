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
                var note = reviewNote ?? "Phê duyệt Sở";
                if (ent != null)
                {
                    ent.OwnerPersonId = personId;
                    ent.IsVerified = true;
                    ent.VerificationStatus = "VERIFIED";
                    ent.Approve(note);
                }
                else
                {
                    var resolvedName = !string.IsNullOrWhiteSpace(companyName) ? companyName : "Doanh nghiệp ĐMST";
                    var resolvedProvince = province ?? scopeId ?? "HN";
                    ent = new Domain.Enterprise(Guid.NewGuid())
                    {
                        OwnerPersonId = personId,
                        TaxCode = taxCode,
                        Name = resolvedName,
                        LegalName = resolvedName,
                        ProvinceCity = resolvedProvince,
                        MainSectorName = "Đổi mới sáng tạo & Chuyển đổi số",
                        IsVerified = true,
                        VerificationStatus = "VERIFIED",
                        Status = "ACTIVE"
                    };
                    ent.Approve(note);
                    db.Set<Domain.Enterprise>().Add(ent);
                }
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
}
