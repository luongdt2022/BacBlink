using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Integration.Application;

namespace NacenTech.Modules.Integration.Infrastructure;

/// <summary>
/// Gửi mail qua SMTP. Chỉ được gọi từ job handler (sau commit), không gọi trong transaction (MOD-03).
/// DryRun mặc định true để môi trường dev/test không gửi thật.
/// </summary>
public sealed class SmtpMailSender(IOptions<MailOptions> options, ILogger<SmtpMailSender> log) : IMailSender
{
    private readonly MailOptions _options = options.Value;

    public async Task SendAsync(MailMessage message, CancellationToken ct)
    {
        if (_options.DryRun)
        {
            log.LogInformation("[DryRun] Mail tới {To}: {Subject}", message.To, message.Subject);
            return;
        }

        var mime = new MimeMessage();
        mime.From.Add(new MailboxAddress(_options.FromName, _options.From));
        mime.To.Add(MailboxAddress.Parse(message.To));
        mime.Subject = message.Subject;
        mime.Body = new BodyBuilder { HtmlBody = message.HtmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        var secure = _options.UseSsl ? SecureSocketOptions.SslOnConnect
            : _options.UseStartTls ? SecureSocketOptions.StartTls
            : SecureSocketOptions.None;
        await client.ConnectAsync(_options.Host, _options.Port, secure, ct);
        if (!string.IsNullOrEmpty(_options.User)) await client.AuthenticateAsync(_options.User, _options.Password, ct);
        await client.SendAsync(mime, ct);
        await client.DisconnectAsync(true, ct);
    }
}
