using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NacenTech.Kernel.Application;

namespace NacenTech.Kernel;

public static class KernelServiceCollectionExtensions
{
    public static IServiceCollection AddNacenTechKernel(this IServiceCollection services)
    {
        services.TryAddSingleton<IClock, SystemClock>();
        services.AddMemoryCache();
        services.TryAddSingleton<IRateLimiter, InMemoryRateLimiter>();
        services.TryAddScoped<ISubjectResolver, SubjectResolver>();
        return services;
    }
}
