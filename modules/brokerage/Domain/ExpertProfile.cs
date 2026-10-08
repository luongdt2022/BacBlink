using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;

namespace NacenTech.Modules.Brokerage.Domain;

/// <summary>
/// TASK-05: Thực thể Hồ sơ Chuyên gia KH&CN chuẩn hóa theo 94 dòng dữ liệu Sheet C.gia
/// Quản lý thông tin định danh, học hàm, học vị, công trình và quy trình phê duyệt nâng hạng.
/// </summary>
public sealed class ExpertProfile : AggregateRoot
{
    private ExpertProfile() { }

    public ExpertProfile(
        Guid? personId,
        string fullName,
        int birthYear,
        string gender,
        string? idCardNumber,
        DateOnly? idCardDate,
        string academicRank,
        int? academicRankYear,
        string degree,
        int degreeYear,
        string organizationName,
        string? organizationAddress,
        string? researchTitle,
        string? positionTitle,
        IReadOnlyList<string> expertiseSectors,
        string? trainingHistoryJson,
        string? employmentHistoryJson,
        string? publicationsJson,
        string? consultingSummary,
        bool isProjectLeader,
        bool isMainContributor,
        DateTimeOffset pdpdConsentAtUtc,
        bool legalOath = true,
        IReadOnlyList<string>? specializedKeywords = null)
    {
        if (string.IsNullOrWhiteSpace(fullName)) throw new ValidationException("Họ và tên không được để trống.");
        if (string.IsNullOrWhiteSpace(degree)) throw new ValidationException("Học vị cao nhất là bắt buộc.");
        if (string.IsNullOrWhiteSpace(organizationName)) throw new ValidationException("Cơ quan công tác là bắt buộc.");
        if (pdpdConsentAtUtc == default) throw new ValidationException("Bắt buộc đồng ý cam kết PDPD theo Nghị định 13/2023/NĐ-CP.");
        if (!legalOath) throw new ValidationException("Bắt buộc cam kết tính chính xác của hồ sơ.");

        PersonId = personId;
        FullName = fullName.Trim();
        BirthYear = birthYear;
        Gender = gender;
        IdCardNumber = idCardNumber?.Trim();
        IdCardDate = idCardDate;
        AcademicRank = string.IsNullOrWhiteSpace(academicRank) ? "NONE" : academicRank.Trim();
        AcademicRankYear = academicRankYear;
        Degree = degree.Trim();
        DegreeYear = degreeYear;
        OrganizationName = organizationName.Trim();
        OrganizationAddress = organizationAddress?.Trim();
        ResearchTitle = researchTitle?.Trim();
        PositionTitle = positionTitle?.Trim();
        ExpertiseSectors = expertiseSectors.ToArray();
        SpecializedKeywords = (specializedKeywords ?? []).Where(keyword => !string.IsNullOrWhiteSpace(keyword)).Select(keyword => keyword.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        TrainingHistoryJson = trainingHistoryJson;
        EmploymentHistoryJson = employmentHistoryJson;
        PublicationsJson = publicationsJson;
        ConsultingSummary = consultingSummary?.Trim();
        IsProjectLeader = isProjectLeader;
        IsMainContributor = isMainContributor;
        PdpdConsentAtUtc = pdpdConsentAtUtc;
        LegalOath = legalOath;
        Status = ExpertStatuses.PendingReview;
        ExpertCode = CreateExpertCode(Id);
    }

    public Guid? PersonId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string ExpertCode { get; private set; } = string.Empty;
    public string VisibilityStatus { get; private set; } = ExpertVisibilityStatuses.Private;
    public bool IsAcceptingConsultation { get; private set; }
    public string? PublicBio { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public int BirthYear { get; private set; }
    public string Gender { get; private set; } = "male";
    /// <summary>Dữ liệu lịch sử/xác minh có thẩm quyền; không phải input hay projection Portal hiện tại.</summary>
    public string? IdCardNumber { get; private set; }
    public DateOnly? IdCardDate { get; private set; }
    public string AcademicRank { get; private set; } = "NONE";
    public int? AcademicRankYear { get; private set; }
    public string Degree { get; private set; } = "DOCTOR";
    public int DegreeYear { get; private set; }
    public string OrganizationName { get; private set; } = string.Empty;
    public string? OrganizationAddress { get; private set; }
    public string? ResearchTitle { get; private set; }
    public string? PositionTitle { get; private set; }
    public string[] ExpertiseSectors { get; private set; } = [];
    public string[] SpecializedKeywords { get; private set; } = [];
    public string[] MasteredTechCodes { get; private set; } = [];
    public string? TrainingHistoryJson { get; private set; }
    public string? EmploymentHistoryJson { get; private set; }
    public string? PublicationsJson { get; private set; }
    public string? ConsultingSummary { get; private set; }
    public string? CvFileUrl { get; private set; }
    public bool IsProjectLeader { get; private set; }
    public bool IsMainContributor { get; private set; }
    public DateTimeOffset PdpdConsentAtUtc { get; private set; }
    public bool LegalOath { get; private set; }
    public string Status { get; private set; } = ExpertStatuses.PendingReview;
    public string DraftSource { get; private set; } = "PORTAL";
    /// <summary>SHA256 hash of signed bearer token; never the raw token. Legacy rawvalues are invalid.</summary>
    public string? MagicLinkToken { get; private set; }
    public DateTimeOffset? MagicLinkExpiresAtUtc { get; private set; }
    public string? ReviewerNote { get; private set; }

    public static ExpertProfile CreateQuickIntake(
        string fullName,
        string phone,
        string email,
        string highestDegree,
        string organizationName,
        string sectorCode,
        IReadOnlyList<string> masteredTechCodes,
        string? cvFileUrl,
        DateTimeOffset pdpdConsentAtUtc)
    {
        if (string.IsNullOrWhiteSpace(fullName)) throw new ValidationException("Họ và tên không được để trống.");
        if (string.IsNullOrWhiteSpace(phone)) throw new ValidationException("Số điện thoại không được để trống.");
        if (string.IsNullOrWhiteSpace(email)) throw new ValidationException("Email công tác không được để trống.");
        if (string.IsNullOrWhiteSpace(highestDegree)) throw new ValidationException("Học vị cao nhất là bắt buộc.");
        if (string.IsNullOrWhiteSpace(organizationName)) throw new ValidationException("Cơ quan công tác là bắt buộc.");
        if (pdpdConsentAtUtc == default) throw new ValidationException("Bắt buộc đồng ý cam kết PDPD theo Nghị định 13/2023/NĐ-CP.");

        var id = Guid.NewGuid();
        return new ExpertProfile
        {
            Id = id,
            ExpertCode = CreateExpertCode(id),
            PersonId = null,
            FullName = fullName.Trim(),
            Phone = phone.Trim(),
            Email = email.Trim(),
            Degree = highestDegree.Trim(),
            DegreeYear = DateTime.UtcNow.Year,
            OrganizationName = organizationName.Trim(),
            ExpertiseSectors = string.IsNullOrWhiteSpace(sectorCode) ? [] : [sectorCode.Trim()],
            MasteredTechCodes = masteredTechCodes?.ToArray() ?? [],
            CvFileUrl = cvFileUrl,
            PdpdConsentAtUtc = pdpdConsentAtUtc,
            DraftSource = "ZALO_MINI_APP",
            Status = ExpertStatuses.Draft
        };
    }

    public void IssueDraftLink(string hash, DateTimeOffset expiresAt)
    {
        if (PersonId is not null || DraftSource != "ZALO_MINI_APP") throw new ValidationException("Chỉ hồ sơ sơ bộ được tạo liên kết.");
        MagicLinkToken = hash; MagicLinkExpiresAtUtc = expiresAt; Touch();
    }

    public void CompleteDraft(Guid personId, ExpertProfile validatedSubmission)
    {
        LinkToPerson(personId);
        FullName = validatedSubmission.FullName; BirthYear = validatedSubmission.BirthYear; Gender = validatedSubmission.Gender;
        AcademicRank = validatedSubmission.AcademicRank; AcademicRankYear = validatedSubmission.AcademicRankYear;
        Degree = validatedSubmission.Degree; DegreeYear = validatedSubmission.DegreeYear;
        OrganizationName = validatedSubmission.OrganizationName; OrganizationAddress = validatedSubmission.OrganizationAddress;
        ResearchTitle = validatedSubmission.ResearchTitle; PositionTitle = validatedSubmission.PositionTitle;
        SpecializedKeywords = validatedSubmission.SpecializedKeywords;
        ExpertiseSectors = validatedSubmission.ExpertiseSectors; TrainingHistoryJson = validatedSubmission.TrainingHistoryJson;
        EmploymentHistoryJson = validatedSubmission.EmploymentHistoryJson; PublicationsJson = validatedSubmission.PublicationsJson;
        ConsultingSummary = validatedSubmission.ConsultingSummary; IsProjectLeader = validatedSubmission.IsProjectLeader;
        IsMainContributor = validatedSubmission.IsMainContributor; PdpdConsentAtUtc = validatedSubmission.PdpdConsentAtUtc;
        LegalOath = validatedSubmission.LegalOath; Status = ExpertStatuses.PendingReview;
        MagicLinkToken = null; MagicLinkExpiresAtUtc = null; Touch();
    }

    public void Approve(string? note = null)
    {
        Status = ExpertStatuses.Approved;
        ReviewerNote = note;
        Touch();
    }

    /// <summary>Liên kết một lần profile đã được tiếp nhận với định danh account đã xác thực.</summary>
    public void LinkToPerson(Guid personId)
    {
        if (personId == Guid.Empty) throw new ValidationException("Định danh tài khoản chuyên gia không hợp lệ.");
        if (PersonId is not null && PersonId != personId)
            throw new ValidationException("Hồ sơ chuyên gia đã liên kết với một tài khoản khác.");
        PersonId = personId;
        Touch();
    }

    public void RequestChanges(string note)
    {
        if (string.IsNullOrWhiteSpace(note)) throw new ValidationException("Lý do yêu cầu bổ sung không được để trống.");
        Status = ExpertStatuses.ChangesRequested;
        ReviewerNote = note.Trim();
        Touch();
    }

    public void Reject(string note)
    {
        if (string.IsNullOrWhiteSpace(note)) throw new ValidationException("Lý do từ chối không được để trống.");
        Status = ExpertStatuses.Rejected;
        ReviewerNote = note.Trim();
        Touch();
    }

    /// <summary>Only an approved profile may be exposed by the public projection.</summary>
    public void SetPublicListing(bool isPublic, bool isAcceptingConsultation, string? publicBio)
    {
        if (isPublic && Status != ExpertStatuses.Approved)
            throw new ValidationException("Chỉ hồ sơ đã được phê duyệt mới được công khai.");

        VisibilityStatus = isPublic ? ExpertVisibilityStatuses.Public : ExpertVisibilityStatuses.Private;
        IsAcceptingConsultation = isPublic && isAcceptingConsultation;
        PublicBio = publicBio?.Trim();
        Touch();
    }

    private static string CreateExpertCode(Guid id) => $"CG-NACEN-{id.ToString("N")[..8].ToUpperInvariant()}";
}
