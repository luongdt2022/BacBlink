using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Content.Domain;

namespace NacenTech.Modules.Content.Application;

public sealed class TechmartEventService(DbContext db, IUnitOfWork uow) : ITechmartEventService
{
    public async Task<PagedResult<TechmartEventDto>> ListEventsAsync(string? status, PageRequest page, CancellationToken ct = default)
    {
        var q = db.Set<TechmartEvent>().AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(status))
        {
            var normalized = status.ToUpperInvariant();
            q = q.Where(e => e.Status == normalized);
        }

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(e => e.StartDate)
            .Skip(page.Skip)
            .Take(page.Limit)
            .ToListAsync(ct);

        var dtos = items.Select(e => new TechmartEventDto(
            e.Id,
            e.Title,
            e.Description,
            e.Location,
            e.StartDate,
            e.EndDate,
            e.Status,
            e.TechnologiesCount,
            e.PdfBrochureUrl,
            e.BannerUrl
        )).ToList();

        return new PagedResult<TechmartEventDto>(dtos, total, page.Page, page.Limit);
    }

    public async Task<TechmartEventDto?> GetEventByIdAsync(Guid id, CancellationToken ct = default)
    {
        var e = await db.Set<TechmartEvent>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (e is null) return null;

        return new TechmartEventDto(
            e.Id,
            e.Title,
            e.Description,
            e.Location,
            e.StartDate,
            e.EndDate,
            e.Status,
            e.TechnologiesCount,
            e.PdfBrochureUrl,
            e.BannerUrl
        );
    }

    public async Task<EventRegistrationResponseDto> RegisterAsync(EventRegistrationRequestDto request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.ContactName) || string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            throw new ValidationException(PortalErrorCodes.InvalidContactInfo, "Họ tên liên hệ và số điện thoại không được để trống.");
        }

        var ev = await db.Set<TechmartEvent>().FirstOrDefaultAsync(x => x.Id == request.EventId, ct);
        if (ev is null)
        {
            throw new ValidationException(PortalErrorCodes.EventNotFound, "Không tìm thấy thông tin sự kiện Techmart.");
        }

        if (ev.Status == TechmartEventStatuses.Closed)
        {
            throw new ValidationException(PortalErrorCodes.RegistrationClosed, "Sự kiện Techmart này đã khép lại, không còn tiếp nhận đăng ký.");
        }

        // Sinh mã đăng ký duy nhất: TM-YYYYMM-XXXX
        var regCode = $"TM-{DateTime.UtcNow:yyyyMM}-{Random.Shared.Next(1000, 9999)}";

        var reg = new EventRegistration(
            request.EventId,
            request.OrganizationName,
            request.ContactName,
            request.PhoneNumber,
            request.Email,
            request.RoleType,
            request.Notes,
            regCode
        );

        db.Set<EventRegistration>().Add(reg);
        await uow.CommitAsync(ct);

        return new EventRegistrationResponseDto(
            reg.RegistrationCode,
            reg.Status,
            reg.CreatedAt
        );
    }
}
