using NacenTech.Kernel.Domain;
using NacenTech.Modules.Content.Application;

namespace NacenTech.Modules.Content.Domain;

/// <summary>
/// Thực thể Sự kiện & Phiên Chào Giá Công Nghệ Techmart (TASK-01 Showcase)
/// </summary>
public sealed class TechmartEvent : AggregateRoot
{
    private TechmartEvent() { }

    public TechmartEvent(
        string title,
        string description,
        string location,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        string status,
        int technologiesCount,
        string? pdfBrochureUrl = null,
        string? bannerUrl = null)
    {
        Title = title;
        Description = description;
        Location = location;
        StartDate = startDate;
        EndDate = endDate;
        Status = status;
        TechnologiesCount = technologiesCount;
        PdfBrochureUrl = pdfBrochureUrl;
        BannerUrl = bannerUrl;
    }

    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Location { get; private set; } = string.Empty;
    public DateTimeOffset StartDate { get; private set; }
    public DateTimeOffset EndDate { get; private set; }
    public string Status { get; private set; } = TechmartEventStatuses.Upcoming;
    public int TechnologiesCount { get; private set; }
    public string? PdfBrochureUrl { get; private set; }
    public string? BannerUrl { get; private set; }

    public void Update(
        string title,
        string description,
        string location,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        string status,
        int technologiesCount,
        string? pdfBrochureUrl,
        string? bannerUrl)
    {
        Title = title;
        Description = description;
        Location = location;
        StartDate = startDate;
        EndDate = endDate;
        Status = status;
        TechnologiesCount = technologiesCount;
        PdfBrochureUrl = pdfBrochureUrl;
        BannerUrl = bannerUrl;
        Touch();
    }
}
