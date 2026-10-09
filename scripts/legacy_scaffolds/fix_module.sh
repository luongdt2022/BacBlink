#!/bin/bash
set -e
cat << 'CS' > SourceCode/backend/modules/enterprise/NacenTech.Modules.Enterprise/EnterpriseModule.cs
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Enterprise;

public sealed class EnterpriseModule : IModule
{
    public string Name => "Enterprise";
    public string Schema => "enterprise";
    public Assembly Assembly => typeof(EnterpriseModule).Assembly;
    
    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
    }
}
CS
cd SourceCode/backend/packages/persistence
dotnet build
