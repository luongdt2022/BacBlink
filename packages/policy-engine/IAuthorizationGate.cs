using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.PolicyEngine;

/// <summary>
/// Enforcement point tại application service (§23.2). Endpoint filter chỉ là coarse gate.
/// Mọi DENY được ghi audit kèm ruleId; DENY trên tài liệu mật là bắt buộc audit.
/// </summary>
public interface IAuthorizationGate
{
    /// <summary>
    /// Hỏi bảng quyết định mà **không ghi audit** và không ném. Dùng khi cần *lọc* thay vì *chặn* — nhưng khi
    /// đó chỗ gọi phải tự ghi lại phần bị lọc, nếu không lượt bị loại sẽ không để lại vết nào (B-29).
    /// </summary>
    AuthorizationDecision Evaluate(AuthorizationRequest request);

    /// <summary>
    /// Ném `ForbiddenException(ruleId)` khi DENY. Ghi audit bằng **transaction riêng**, không theo UnitOfWork
    /// của command — chú thích ở đây trước đây nói ngược lại (B-24). Xem `IsolatedAuditWriter` để biết vì sao:
    /// từ chối luôn kết thúc bằng exception, nên dòng audit trong cùng transaction sẽ bị rollback cùng.
    /// </summary>
    void Require(AuthorizationRequest request, string objectKind, Guid? objectId, string? details = null);
}

public sealed class DefaultAuthorizationGate(DecisionTable table, ICurrentActor actor, IAuditWriter audit) : IAuthorizationGate
{
    public AuthorizationDecision Evaluate(AuthorizationRequest request) => table.Evaluate(request);

    public void Require(AuthorizationRequest request, string objectKind, Guid? objectId, string? details = null)
    {
        var decision = table.Evaluate(request);
        if (decision.IsPermitted)
        {
            if (request.DocumentClassification is not null && request.DocumentClassification != "PUBLIC")
            {
                // Đọc tài liệu mật được phép cũng ghi access log (§16.2). Từ vựng là ALLOW, không phải PERMIT
                // — ba tầng từng dùng ba từ khác nhau và không test nào so chúng (ADR-0006, câu 5).
                audit.Append(Entry(request, objectKind, objectId, AuditOutcomes.Allow, decision, details));
            }
            return;
        }

        audit.Append(Entry(request, objectKind, objectId, AuditOutcomes.Deny, decision, details));
        throw new ForbiddenException($"Không có quyền thực hiện '{request.Action}'", "FORBIDDEN") { RuleId = decision.RuleId };
    }

    private AuditEntry Entry(AuthorizationRequest r, string objectKind, Guid? objectId, string outcome, AuthorizationDecision d, string? details)
        => new(actor.PersonId, actor.PlatformRole, r.Action, objectKind, objectId, null, r.Purpose, outcome,
            $"{d.RuleSetVersion}:{d.RuleId}", actor.CorrelationId, actor.IpAddress, actor.UserAgent, details);
}
