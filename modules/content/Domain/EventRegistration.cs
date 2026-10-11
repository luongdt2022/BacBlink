using NacenTech.Kernel.Domain;
using NacenTech.Modules.Content.Application;

namespace NacenTech.Modules.Content.Domain;

/// <summary>
/// Thực thể Đơn Đăng Ký Tham Gia Phiên Chào Giá & Gian Hàng Techmart (TASK-01)
/// </summary>
public sealed class EventRegistration : AggregateRoot
{
    private EventRegistration() { }

    public EventRegistration(
        Guid eventId,
        string organizationName,
        string contactName,
        string phoneNumber,
        string email,
        string roleType,
        string? notes,
        string registrationCode)
    {
        EventId = eventId;
        OrganizationName = organizationName;
        ContactName = contactName;
        PhoneNumber = phoneNumber;
        Email = email;
        RoleType = roleType;
        Notes = notes;
        RegistrationCode = registrationCode;
        Status = "CONFIRMED";
    }

    public Guid EventId { get; private set; }
    public string OrganizationName { get; private set; } = string.Empty;
    public string ContactName { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string RoleType { get; private set; } = EventRegistrationRoles.Visitor;
    public string? Notes { get; private set; }
    public string RegistrationCode { get; private set; } = string.Empty;
    public string Status { get; private set; } = "CONFIRMED";
}
