using NacenTech.Contracts.Jobs;
using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Integration.Application;

/// <summary>Thay `mail-queue` của BullMQ. Job chạy sau commit nên gửi mail không nằm trong transaction (MOD-03).</summary>
public sealed class SendMailJobHandler(IMailSender sender, IMailTemplateRenderer renderer) : IJobHandler<SendMailJob>
{
    public async Task HandleAsync(SendMailJob job, CancellationToken ct)
    {
        var html = renderer.Render(job.Template, job.Context);
        var subject = renderer.SubjectFor(job.Template, job.Context);
        await sender.SendAsync(new MailMessage(job.To, subject, html), ct);
    }
}
