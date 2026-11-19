using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Content.Application;
using NacenTech.Modules.Content.Domain;

namespace NacenTech.Modules.Content.Infrastructure;

public sealed class ContentImporter(DbContext db, IUnitOfWork uow) : IContentImporter
{
    public async Task ImportStoryAsync(LegacyStoryImport import, CancellationToken ct)
    {
        var type = import.Type.Equals("failure", StringComparison.OrdinalIgnoreCase) ? StoryTypes.Failure : StoryTypes.Success;
        var status = import.Status.Equals("published", StringComparison.OrdinalIgnoreCase) ? StoryStatuses.Published : StoryStatuses.Draft;

        var existing = await db.Set<Story>().FirstOrDefaultAsync(s => s.Id == import.Id, ct);
        if (existing is null)
        {
            var story = new Story(import.AuthorPersonId, import.Title, type, import.Content, import.Lesson, status);
            story.OverrideId(import.Id);
            story.ApplyImport(import.Title, type, import.Content, import.Lesson, status, import.IsHidden);
            story.ApplyLegacy(import.Legacy, import.CreatedAt, import.UpdatedAt);
            db.Add(story);
        }
        else
        {
            existing.ApplyImport(import.Title, type, import.Content, import.Lesson, status, import.IsHidden);
            existing.ApplyLegacy(import.Legacy, import.CreatedAt, import.UpdatedAt);
        }
        await uow.CommitAsync(ct);
    }

    public Task<int> CountAsync(CancellationToken ct) => db.Set<Story>().AsNoTracking().CountAsync(ct);
}
