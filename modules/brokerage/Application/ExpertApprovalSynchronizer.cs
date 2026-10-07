using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Domain;

namespace NacenTech.Modules.Brokerage.Application;

public sealed class ExpertApprovalSynchronizer(DbContext db) : IExpertApprovalSynchronizer
{
    public async Task ApplyAsync(Guid personId, string profilePayloadJson, string action, string? reviewNote, CancellationToken ct)
    {
        Guid profileId = Guid.Empty;
        try
        {
            using var payload = JsonDocument.Parse(profilePayloadJson);
            if (payload.RootElement.ValueKind != JsonValueKind.Object)
                throw new ValidationException("Dữ liệu hồ sơ thẩm định chuyên gia không hợp lệ.");
            foreach (var property in payload.RootElement.EnumerateObject())
                if (property.Name.Equals("id", StringComparison.OrdinalIgnoreCase) && property.Value.ValueKind == JsonValueKind.String)
                    Guid.TryParse(property.Value.GetString(), out profileId);
        }
        catch (JsonException) { throw new ValidationException("Dữ liệu hồ sơ thẩm định chuyên gia không hợp lệ."); }
        var profile = await db.Set<ExpertProfile>().FirstOrDefaultAsync(x => x.Id == profileId && x.PersonId == personId, ct)
            ?? throw new NotFoundException("Không tìm thấy hồ sơ chuyên gia khớp yêu cầu thẩm định.");
        switch (action)
        {
            case "APPROVE": profile.Approve(reviewNote); break;
            case "REQUEST_CHANGES": profile.RequestChanges(reviewNote!); break;
            case "REJECT": profile.Reject(reviewNote!); break;
            case "REVOKE":
            case "REVOKE_EXPERT": profile.Reject(reviewNote!); break;
            default: return;
        }
        if (action != "APPROVE") profile.SetPublicListing(false, false, profile.PublicBio);
    }
}
