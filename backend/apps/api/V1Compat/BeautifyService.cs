using System.Text.Json;
using NacenTech.Contracts.Ai;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Technology.Application;
using NacenTech.PolicyEngine;

namespace NacenTech.Api.V1Compat;

/// <summary>
/// `POST /intakes/{id}/beautify`: AI viết lại tiêu đề/nội dung. Đây là tác vụ `AI_FIRST_REVIEWED` (§24.8):
/// kết quả là bản nháp lưu vào trường `ai*`, nội dung gốc do người dùng nhập không bị thay.
/// AI không đổi trạng thái, không qualify, không quyết định gì (§24.2).
/// </summary>
public sealed class BeautifyService(
    IntakeFacade facade,
    IDemandService demands,
    ITechnologyService technologies,
    IMatchingPreferenceProvider preferences,
    NacenTech.Modules.Matching.Application.IMatchingService matching,
    ICompletionClient completions,
    ICurrentActor actor,
    IAuthorizationGate gate,
    ILogger<BeautifyService> log)
{
    public async Task<object> RunAsync(Guid id, Guid? requesterPersonId, CancellationToken ct)
    {
        var view = await facade.FindViewAsync(id, false, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        if (requesterPersonId is not null && view.OwnerPersonId != requesterPersonId)
            throw new NotFoundException($"Intake with ID {id} not found");
        if (string.IsNullOrWhiteSpace(view.Content))
            throw new UnprocessableException($"Intake {id} has no content to beautify");

        gate.Require(new AuthorizationRequest(Actions.SubjectBeautify, actor.PlatformRole,
            OrganizationRelation: view.OwnerPersonId is not null && view.OwnerPersonId == actor.PersonId
                ? OrganizationRelations.Owner : OrganizationRelations.None), "Intake", id);

        var prompt = view.Type == IntakeFacade.TypeChallenge
            ? B2bPrompts.BuildChallengePrompt(view.Title, view.Content!)
            : B2bPrompts.BuildMarketingPrompt(view.Title, view.Content!);

        BeautifyResult result;
        try
        {
            var completion = await completions.CompleteAsync(prompt, null, null, null, null, ct);
            result = JsonSerializer.Deserialize<BeautifyResult>(ExtractJson(completion.Text), Json)
                     ?? throw new InvalidOperationException("AI trả về JSON rỗng");
            if (string.IsNullOrWhiteSpace(result.Title) || string.IsNullOrWhiteSpace(result.Content))
                throw new InvalidOperationException("AI trả về thiếu title/content");
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Beautify thất bại cho intake {IntakeId}", id);
            throw new DomainInternalException("AI beautification failed. Intake data was not modified.");
        }

        if (view.Type == IntakeFacade.TypeChallenge) await demands.SetAiResultAsync(id, result.Title, result.Content, ct);
        else await technologies.SetAiResultAsync(id, result.Title, result.Content, ct);

        // Legacy tự chạy matching sau beautify khi người dùng bật auto (mặc định true nếu không có bản ghi).
        if (requesterPersonId is { } person && await preferences.AutoMatchingEnabledAsync(person, ct))
            await matching.RequestComputeMatchesAsync(view.Subject, ct);

        return new
        {
            id = view.Id,
            title = view.Title,
            aiProcessTitle = result.Title,
            aiProcessedContent = result.Content,
            aiProcessingStatus = "completed",
        };
    }

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private sealed record BeautifyResult(string Title, string Content);

    /// <summary>Model đôi khi bọc JSON trong ```json fences — cắt ra trước khi parse.</summary>
    private static string ExtractJson(string text)
    {
        var trimmed = text.Trim();
        if (trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            var firstNewline = trimmed.IndexOf('\n');
            if (firstNewline > 0) trimmed = trimmed[(firstNewline + 1)..];
            var fence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
            if (fence >= 0) trimmed = trimmed[..fence];
        }
        return trimmed.Trim();
    }
}

/// <summary>500 có kiểm soát cho lỗi phụ thuộc ngoài (AI provider).</summary>
public sealed class DomainInternalException(string message) : Exception(message);
