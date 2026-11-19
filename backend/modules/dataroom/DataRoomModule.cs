using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.DataRoom.Application;

namespace NacenTech.Modules.DataRoom;

public sealed class DataRoomModule : IModule
{
    public const string SchemaName = "dataroom";

    public string Name => "dataroom";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(DataRoomModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IDataRoomService, DataRoomService>();
        services.AddScoped<IDataRoomImporter, Infrastructure.DataRoomImporter>();
    }
}
