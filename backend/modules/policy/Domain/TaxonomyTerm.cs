using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Policy.Domain;

/// <summary>Sector/Category kế thừa từ NacenTwin. Xóa = deactivate để term đã gắn vào subject vẫn resolve được tên.</summary>
public sealed class TaxonomyTerm : AggregateRoot
{
    private TaxonomyTerm() { }

    public TaxonomyTerm(string kind, string name, string? code = null, string? metadataJson = null)
    {
        Kind = kind;
        Name = name;
        Code = code;
        MetadataJson = metadataJson ?? "{}";
        IsActive = true;
    }

    public string Kind { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Code { get; private set; }
    public string MetadataJson { get; private set; } = "{}";
    public bool IsActive { get; private set; }

    public void SetCode(string? code)
    {
        Code = code;
        Touch();
    }

    public void SetMetadata(string metadataJson)
    {
        MetadataJson = string.IsNullOrWhiteSpace(metadataJson) ? "{}" : metadataJson;
        Touch();
    }

    public void Rename(string name)
    {
        Name = name;
        Touch();
    }

    public void Deactivate()
    {
        IsActive = false;
        Touch();
    }

    public void ApplyImport(string kind, string name, bool isActive, string? code = null, string? metadataJson = null)
    {
        Kind = kind;
        Name = name;
        IsActive = isActive;
        Code = code;
        MetadataJson = metadataJson ?? "{}";
    }
}
