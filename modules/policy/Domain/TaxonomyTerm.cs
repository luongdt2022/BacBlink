using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Policy.Domain;

/// <summary>Sector/Category kế thừa từ NacenTwin. Xóa = deactivate để term đã gắn vào subject vẫn resolve được tên.</summary>
public sealed class TaxonomyTerm : AggregateRoot
{
    private TaxonomyTerm() { }

    public TaxonomyTerm(string kind, string name)
    {
        Kind = kind;
        Name = name;
        IsActive = true;
    }

    public string Kind { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

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

    public void ApplyImport(string kind, string name, bool isActive)
    {
        Kind = kind;
        Name = name;
        IsActive = isActive;
    }
}
