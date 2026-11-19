using NacenTech.Kernel.Application;

namespace NacenTech.Contracts.Jobs;

/// <summary>
/// Job gửi mail theo template (thay BullMQ `mail-queue`). Template render ở integration module.
/// Context là dictionary string→string để serialize ổn định trong job_queue.
/// </summary>
public sealed record SendMailJob(string To, string Template, IReadOnlyDictionary<string, string> Context) : IJob;

public static class MailTemplates
{
    public const string AccountActivation = "account-activation";
    public const string Welcome = "welcome";
    public const string ResetPassword = "reset-password";
    public const string PasswordChanged = "password-changed";
    public const string CollaborationRequest = "collaboration-request";
}
