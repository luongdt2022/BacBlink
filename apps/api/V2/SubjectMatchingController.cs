using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Technology.Application;
using NacenTech.PolicyEngine;

namespace NacenTech.Api.V2;

/// <summary>
/// Vòng ghép cặp và ứng viên của một subject — đặc tả `docs-v2/api-v2/matching.md`.
///
/// Phần đọc từ sprint 1; hai lệnh ghi (`POST .../match-rounds`, `POST .../index-jobs`) mở 2026-09-05 sau khi ADR-0004
/// chốt quy tắc khoá chống lặp — `IdempotencyMiddleware` đòi `Idempotency-Key` trên cả hai. `GET .../match-rounds` (liệt kê các vòng đã tính) từng **không có phương thức nào ở tầng dịch vụ** —
/// chỉ có đường lấy vòng mới nhất — nên sprint 1 không mở nó; mở một endpoint rỗng ruột còn tệ hơn không mở.
/// Phương thức đó có từ 2026-09-05, cùng hai đường đọc một vòng theo định danh, để trang so sánh dựng được.
/// </summary>
[Route("api/v2/subjects/{kind}/{id:guid}")]
public sealed class SubjectMatchingController(
    IMatchingService matching,
    IDemandService demands,
    ITechnologyService technologies,
    ICaseService cases,
    ISubjectResolver subjects,
    IAuthorizationGate gate) : V2ControllerBase
{
    /// <summary>
    /// Yêu cầu tính một vòng mới — **không tính ngay**: xếp một việc vào hàng đợi trong cùng giao dịch và trả
    /// 202. Ai gọi được: chủ sở hữu subject hoặc quản trị viên (`subject.compute_matches`); 422 khi subject chưa
    /// xuất bản hoặc không có nội dung để nhúng. Khoá chống lặp do middleware đòi (428 khi thiếu).
    /// </summary>
    [HttpPost("match-rounds")]
    public async Task<IActionResult> RequestRound(string kind, Guid id, CancellationToken ct)
    {
        var subject = await RequireComputableSubjectAsync(kind, id, ct);
        await matching.RequestComputeMatchesAsync(subject, ct);
        return Accepted(new { subject, queued = true, job = "compute-matches" });
    }

    /// <summary>Yêu cầu cắt đoạn, nhúng và lập chỉ mục lại — cùng luật với tính vòng.</summary>
    [HttpPost("index-jobs")]
    public async Task<IActionResult> RequestIndex(string kind, Guid id, CancellationToken ct)
    {
        var subject = await RequireComputableSubjectAsync(kind, id, ct);
        await matching.RequestChunkEmbedAsync(subject, ct);
        return Accepted(new { subject, queued = true, job = "chunk-embed" });
    }

    private async Task<SubjectRef> RequireComputableSubjectAsync(string kind, Guid id, CancellationToken ct)
    {
        var subject = ParseSubject(kind, id);
        var summary = await subjects.SummaryAsync(subject, ct) ?? throw new NotFoundException($"Subject {kind}/{id} not found");
        var isOwner = summary.OwnerPersonId is { } owner && owner == Actor.PersonId;
        gate.Require(new AuthorizationRequest(Actions.SubjectComputeMatches, Actor.PlatformRole,
            OrganizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None), "MatchRound", id);
        if (!summary.IsPublished)
            throw new UnprocessableException("Subject chưa xuất bản; chỉ nội dung đã xuất bản mới vào chỉ mục và được ghép cặp", "SUBJECT_NOT_PUBLISHED");
        var content = await subjects.ContentAsync(subject, ct);
        if (content is null || string.IsNullOrWhiteSpace(content.Body))
            throw new UnprocessableException("Subject không có nội dung để nhúng", "SUBJECT_NO_CONTENT");
        return subject;
    }
    /// <summary>
    /// Vòng đang dùng, kèm **bốn thông tin phải lộ ra**: phiên bản công cụ tìm kiếm, phiên bản mô hình nhúng,
    /// chế độ chấm điểm, và số ứng viên. Đây là chỗ v2 phải khác v1 một cách rõ ràng — v1 giấu cả bốn.
    ///
    /// Subject chưa có vòng nào **không phải lỗi** (đặc tả, mục "Vào màn"), nên trả **204** chứ không phải 404.
    /// Việc này cũng cho giao diện đúng phép phân biệt mà đặc tả nói đang thiếu: 204 là *chưa tính bao giờ*,
    /// còn 200 với số ứng viên bằng 0 là *đã tính và không tìm thấy ai*. Hai chuyện đó hiện đều trông như một
    /// danh sách rỗng.
    /// </summary>
    [HttpGet("match-rounds/latest")]
    public async Task<IActionResult> LatestRound(string kind, Guid id, CancellationToken ct)
    {
        var subject = await RequireReadableSubjectAsync(kind, id, ct);
        var round = await matching.GetLatestRoundAsync(subject, ct);
        return round is null ? NoContent() : Ok(round);
    }

    /// <summary>
    /// Mọi vòng đã tính cho subject, mới nhất trước, lọc được theo chế độ chấm điểm và phiên bản công cụ — hai
    /// bộ lọc mà đặc tả màn hình đặt trong URL. Không lọc theo điểm. Đây là đường mà chú thích ở đầu lớp từng
    /// nói "chưa có phương thức nào ở tầng dịch vụ"; phương thức đó có từ 2026-09-05, và trang so sánh hai vòng
    /// — mục đích chính của việc giữ vòng cũ — dựng được từ lúc đó.
    /// </summary>
    [HttpGet("match-rounds")]
    public async Task<IActionResult> ListRounds(string kind, Guid id, [FromQuery] string? scoringMode, [FromQuery] string? searchEngineVersion,
        [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        var subject = await RequireReadableSubjectAsync(kind, id, ct);
        var rounds = await matching.ListRoundsAsync(subject, new MatchRoundFilter(scoringMode, searchEngineVersion), PageRequest.Of(page, limit), ct);
        return Ok(Paged(rounds));
    }

    /// <summary>
    /// Một vòng theo định danh. Đường tuyệt đối (`/api/v2/match-rounds/{roundId}`) vì định danh vòng là toàn
    /// cục, không cần subject trong đường dẫn — nhưng quyền đọc **vẫn là quyền đọc subject của vòng**: đọc
    /// vòng ra, rồi hỏi đúng cửa mà mọi đường trong lớp này đi qua. Vòng không có, hoặc subject không đọc
    /// được, đều là 404 — một vòng chỉ tồn tại vì subject của nó tồn tại.
    /// </summary>
    [HttpGet("/api/v2/match-rounds/{roundId:guid}")]
    public async Task<IActionResult> GetRound(Guid roundId, CancellationToken ct)
    {
        var round = await RequireReadableRoundAsync(roundId, ct);
        return Ok(round);
    }

    /// <summary>Ứng viên của một vòng cụ thể, theo hạng tăng dần — để so hai vòng, không chỉ vòng đang dùng.</summary>
    [HttpGet("/api/v2/match-rounds/{roundId:guid}/candidates")]
    public async Task<IActionResult> RoundCandidates(Guid roundId, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        await RequireReadableRoundAsync(roundId, ct);
        return Ok(Paged(await matching.ListRoundCandidatesAsync(roundId, PageRequest.Of(page, limit), ct)));
    }

    private async Task<MatchRoundDto> RequireReadableRoundAsync(Guid roundId, CancellationToken ct)
    {
        var round = await matching.GetRoundAsync(roundId, ct) ?? throw new NotFoundException($"Match round {roundId} not found");
        var kindPath = round.Subject.Kind switch
        {
            SubjectKinds.DemandBrief => "demand-briefs",
            SubjectKinds.TechnologyAsset => "technology-assets",
            SubjectKinds.CommercializationCase => "commercialization-cases",
            _ => throw new NotFoundException($"Match round {roundId} not found"),
        };
        try
        {
            await RequireReadableSubjectAsync(kindPath, round.Subject.Id, ct);
        }
        catch (NotFoundException)
        {
            throw new NotFoundException($"Match round {roundId} not found");
        }
        return round;
    }

    /// <summary>Ứng viên của vòng đang dùng, có phân trang. Subject chưa có vòng nào thì trả danh sách rỗng.</summary>
    [HttpGet("match-candidates")]
    public async Task<IActionResult> Candidates(string kind, Guid id, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        var subject = await RequireReadableSubjectAsync(kind, id, ct);
        return Ok(Paged(await matching.ListCandidatesAsync(subject, PageRequest.Of(page, limit), ct)));
    }

    /// <summary>N ứng viên đầu, cho thẻ tóm tắt trên trang chi tiết.</summary>
    [HttpGet("match-candidates/top")]
    public async Task<IActionResult> TopCandidates(string kind, Guid id, [FromQuery] int? take, CancellationToken ct)
    {
        var n = take ?? 5;
        if (n is < 1 or > 50) throw new ValidationException("take must not be less than 1 and not greater than 50");
        var subject = await RequireReadableSubjectAsync(kind, id, ct);
        return Ok(await matching.TopCandidatesAsync(subject, n, ct));
    }

    /// <summary>
    /// Hai cửa, theo đúng cột "ai gọi được" của đặc tả: quy tắc `match_round.read`, **và** người gọi phải đọc
    /// được chính subject đó.
    ///
    /// Phép kiểm thứ hai cố ý hỏi lại service sở hữu subject thay vì dựng lại luật quyền ở đây — luật đọc một
    /// đề bài đã nằm trong `IDemandService.GetAsync` và không được có bản sao thứ hai. Không đọc được subject
    /// thì **404**, không phải 403: một vòng ghép cặp chỉ tồn tại vì subject của nó tồn tại.
    /// </summary>
    private async Task<SubjectRef> RequireReadableSubjectAsync(string kind, Guid id, CancellationToken ct)
    {
        var subject = ParseSubject(kind, id);
        gate.Require(new AuthorizationRequest(Actions.MatchRoundRead, Actor.PlatformRole), "MatchRound", id);

        try
        {
            switch (subject.Kind)
            {
                case SubjectKinds.DemandBrief: await demands.GetAsync(id, false, ct); break;
                case SubjectKinds.TechnologyAsset: await technologies.GetAsync(id, false, ct); break;
                case SubjectKinds.CommercializationCase: await cases.GetAsync(id, ct); break;
            }
        }
        catch (ForbiddenException)
        {
            throw new NotFoundException($"Subject {kind}/{id} not found");
        }

        return subject;
    }
}
