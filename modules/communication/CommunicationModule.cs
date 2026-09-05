using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Contracts.Events;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Communication.Application;

namespace NacenTech.Modules.Communication;

public sealed class CommunicationModule : IModule
{
    public const string SchemaName = "communication";

    public string Name => "communication";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(CommunicationModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CommunicationOptions>(configuration.GetSection(CommunicationOptions.Section));
        services.AddScoped<IInvitationService, InvitationService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ICommunicationImporter, Infrastructure.CommunicationImporter>();

        // Notification + mail delivery từ event (thay fire-and-forget của NestJS bằng outbox at-least-once)
        services.AddScoped<IIntegrationEventHandler<MatchRoundCompleted>, MatchRoundCompletedHandler>();
        services.AddScoped<IIntegrationEventHandler<CaseInvitationCreated>, InvitationEventsHandler>();
        services.AddScoped<IIntegrationEventHandler<CaseInvitationAccepted>, InvitationEventsHandler>();
        services.AddScoped<IIntegrationEventHandler<CaseInvitationDeclined>, InvitationEventsHandler>();
        services.AddScoped<IIntegrationEventHandler<PersonRegistered>, IdentityMailHandler>();
        services.AddScoped<IIntegrationEventHandler<ActivationResent>, IdentityMailHandler>();
        services.AddScoped<IIntegrationEventHandler<AccountActivated>, IdentityMailHandler>();
        services.AddScoped<IIntegrationEventHandler<PasswordChanged>, IdentityMailHandler>();
        services.AddScoped<IIntegrationEventHandler<PasswordResetRequested>, IdentityMailHandler>();
    }
}
