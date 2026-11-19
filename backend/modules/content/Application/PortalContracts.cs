using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Content.Application;

/// <summary>
/// Mã lỗi nghiệp vụ chuẩn RFC 7807 cho phân hệ Portal & Sự kiện Techmart (TASK-01)
/// </summary>
public static class PortalErrorCodes
{
    public const string EventNotFound = "ERR_EVENT_NOT_FOUND";
    public const string RegistrationClosed = "ERR_REGISTRATION_CLOSED";
    public const string InvalidContactInfo = "ERR_INVALID_CONTACT_INFO";
    public const string BiddingNotSupported = "ERR_BIDDING_NOT_SUPPORTED";
}

public static class TechmartEventStatuses
{
    public const string Upcoming = "UPCOMING";
    public const string Happening = "HAPPENING";
    public const string Closed = "CLOSED";
}

public static class EventRegistrationRoles
{
    public const string Visitor = "VISITOR";
    public const string Buyer = "BUYER";
    public const string SellerBooth = "SELLER_BOOTH";
}

public sealed record PortalOverviewStatsDto(
    int TotalOffers,
    int TotalDemands,
    int TotalEnterprises,
    int TotalExperts,
    int TotalProvinces,
    DateTimeOffset UpdatedAt,
    long TotalSuccessfulConnections = 0,
    decimal TotalEstimatedValueMillionVnd = 0m
);

public sealed record TechmartEventDto(
    Guid Id,
    string Title,
    string Description,
    string Location,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    string Status,
    int TechnologiesCount,
    string? PdfBrochureUrl,
    string? BannerUrl
);

public sealed record EventRegistrationRequestDto(
    Guid EventId,
    string OrganizationName,
    string ContactName,
    string PhoneNumber,
    string Email,
    string RoleType,
    string? Notes
);

public sealed record EventRegistrationResponseDto(
    string RegistrationCode,
    string Status,
    DateTimeOffset RegisteredAt
);

public sealed record AiQuickAssistRequestDto(
    string Prompt
);

public sealed record AiSuggestionItemDto(
    string Title,
    string Subtitle,
    string Url,
    string? Tag = null
);

public sealed record AiQuickAssistResponseDto(
    string Reply,
    string? SuggestedTopic,
    string? RedirectUrl,
    IReadOnlyList<AiSuggestionItemDto>? Suggestions = null
);

public interface IPortalOverviewService
{
    Task<PortalOverviewStatsDto> GetStatsAsync(CancellationToken ct = default);
}

public interface ITechmartEventService
{
    Task<PagedResult<TechmartEventDto>> ListEventsAsync(string? status, PageRequest page, CancellationToken ct = default);
    Task<TechmartEventDto?> GetEventByIdAsync(Guid id, CancellationToken ct = default);
    Task<EventRegistrationResponseDto> RegisterAsync(EventRegistrationRequestDto request, CancellationToken ct = default);
}

public interface IAiAssistantService
{
    Task<AiQuickAssistResponseDto> QuickAssistAsync(AiQuickAssistRequestDto request, CancellationToken ct = default);
}
