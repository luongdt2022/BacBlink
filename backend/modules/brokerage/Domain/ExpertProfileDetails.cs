using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Brokerage.Domain;

// Child records are deliberately normalized: each row remains searchable and auditable.
public sealed class ExpertDocument : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string DocumentType { get; private set; } = string.Empty;
    public string StorageKey { get; private set; } = string.Empty;
    public string Sha256 { get; private set; } = string.Empty;
    public string MimeType { get; private set; } = string.Empty;
    public long SizeBytes { get; private set; }
    public string MalwareScanStatus { get; private set; } = "PENDING";
    public bool IsActive { get; private set; } = true;
}

/// <summary>PII cấp 3; only ciphertext is persisted, never a plaintext bank/contact value.</summary>
public sealed class ExpertProfilePrivateDetail : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string? ResidentialAddressCiphertext { get; private set; }
    public string? BankAccountCiphertext { get; private set; }
    public string? BankNameCiphertext { get; private set; }
    public string? MinimumConsultingFeeCiphertext { get; private set; }
    public string? OrganizationLeaderCiphertext { get; private set; }
    public string? OrganizationLeaderPhoneCiphertext { get; private set; }
    public string? AssistantCiphertext { get; private set; }
    public string? CouncilAndCertificatesCiphertext { get; private set; }
}

public sealed class ExpertTrainingRecord : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string Level { get; private set; } = string.Empty;
    public string Institution { get; private set; } = string.Empty;
    public string? Major { get; private set; }
    public int? GraduationYear { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsPublic { get; private set; }
    public bool IsActive { get; private set; } = true;
}

public sealed class ExpertEmploymentRecord : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public DateOnly? FromDate { get; private set; }
    public DateOnly? ToDate { get; private set; }
    public string Organization { get; private set; } = string.Empty;
    public string? OrganizationAddress { get; private set; }
    public string? PositionTitle { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsPublic { get; private set; }
    public bool IsActive { get; private set; } = true;
}

public sealed class ExpertPublication : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? AuthorRole { get; private set; }
    public string? Journal { get; private set; }
    public int? PublishedYear { get; private set; }
    public string? Doi { get; private set; }
    public string? Indexing { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsPublic { get; private set; }
    public bool IsActive { get; private set; } = true;
}

public sealed class ExpertPatent : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? CertificateNumber { get; private set; }
    public int? GrantedYear { get; private set; }
    public DateOnly? GrantedAt { get; private set; }
    public string? Issuer { get; private set; }
    public int? TechnologyReadinessLevel { get; private set; }
    public string? Description { get; private set; }
    public bool IsPublic { get; private set; }
    public bool IsActive { get; private set; } = true;
}

public sealed class ExpertPracticalProject : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Scale { get; private set; }
    public string? ReceivingOrganization { get; private set; }
    public int? CompletionYear { get; private set; }
    public string? Outcome { get; private set; }
    public bool IsPublic { get; private set; }
    public bool IsActive { get; private set; } = true;
}

public sealed class ExpertResearchProject : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? ManagementLevel { get; private set; }
    public string? Role { get; private set; }
    public string? AcceptanceStatus { get; private set; }
    public int? StartYear { get; private set; }
    public int? EndYear { get; private set; }
    public string? LeadOrganization { get; private set; }
    public string? PartnerOrganization { get; private set; }
    public decimal? BudgetAmount { get; private set; }
    public bool IsPublic { get; private set; }
    public bool IsActive { get; private set; } = true;
}

public sealed class ExpertAward : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Form { get; private set; }
    public int? AwardedYear { get; private set; }
    public string? Description { get; private set; }
    public string? AwardLevel { get; private set; }
    public bool IsPublic { get; private set; }
    public bool IsActive { get; private set; } = true;
}

public sealed class ExpertAiIngestion : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public Guid? DocumentId { get; private set; }
    public string Status { get; private set; } = "PENDING";
    public string? Provider { get; private set; }
    public string? ModelVersion { get; private set; }
    public string? ResultJson { get; private set; }
    public decimal? Confidence { get; private set; }
    public string? ErrorCode { get; private set; }
}

public sealed class ExpertConsent : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string ConsentType { get; private set; } = string.Empty;
    public string PolicyVersion { get; private set; } = string.Empty;
    public DateTimeOffset AcceptedAtUtc { get; private set; }
    public string Source { get; private set; } = string.Empty;
}

public sealed class ExpertProfileStatusHistory : Entity
{
    public Guid ExpertProfileId { get; private set; }
    public string? FromStatus { get; private set; }
    public string ToStatus { get; private set; } = string.Empty;
    public string? Reason { get; private set; }
    public Guid? ChangedBy { get; private set; }
    public Guid? ApprovalRequestId { get; private set; }
    public DateTimeOffset ChangedAtUtc { get; private set; }
}
