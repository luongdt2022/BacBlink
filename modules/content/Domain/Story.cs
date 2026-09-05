using NacenTech.Kernel.Domain;
using NacenTech.Modules.Content.Application;

namespace NacenTech.Modules.Content.Domain;

/// <summary>Câu chuyện thành công/thất bại. Content/read model (§30.1) — không tính là north-star outcome.</summary>
public sealed class Story : AggregateRoot
{
    private Story() { }

    public Story(Guid authorPersonId, string title, string type, string content, string? lesson, string status)
    {
        AuthorPersonId = authorPersonId;
        Title = title;
        Type = type;
        Content = content;
        Lesson = lesson;
        Status = status;
        IsHidden = false;
    }

    public Guid AuthorPersonId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Type { get; private set; } = StoryTypes.Success;
    public string Content { get; private set; } = string.Empty;
    public string? Lesson { get; private set; }
    public string Status { get; private set; } = StoryStatuses.Draft;
    public bool IsHidden { get; private set; }

    public void Update(string? title, string? type, string? content, string? lesson, bool clearLesson, string? status)
    {
        if (title is not null) Title = title;
        if (type is not null) Type = type;
        if (content is not null) Content = content;
        if (clearLesson) Lesson = null;
        else if (lesson is not null) Lesson = lesson;
        if (status is not null) Status = status;
        Touch();
    }

    public void SetHidden(bool hidden)
    {
        IsHidden = hidden;
        Touch();
    }

    public void ApplyImport(string title, string type, string content, string? lesson, string status, bool isHidden)
    {
        Title = title;
        Type = type;
        Content = content;
        Lesson = lesson;
        Status = status;
        IsHidden = isHidden;
    }
}
