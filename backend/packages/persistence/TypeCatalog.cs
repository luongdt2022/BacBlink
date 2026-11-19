using System.Collections.Concurrent;
using System.Reflection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Persistence;

/// <summary>Ánh xạ tên kiểu ↔ Type cho event/job trong outbox/job queue. Quét Contracts + mọi module.</summary>
public sealed class TypeCatalog
{
    private readonly ConcurrentDictionary<string, Type> _byName = new();

    public TypeCatalog(IEnumerable<Assembly> assemblies)
    {
        foreach (var asm in assemblies.Distinct())
        {
            Type[] types;
            try { types = asm.GetTypes(); }
            catch (ReflectionTypeLoadException ex) { types = ex.Types.Where(t => t is not null).ToArray()!; }
            foreach (var t in types)
            {
                if (t.IsAbstract || t.IsInterface) continue;
                if (typeof(IDomainEvent).IsAssignableFrom(t) || typeof(IJob).IsAssignableFrom(t))
                    _byName[TypeNames.Of(t)] = t;
            }
        }
    }

    public Type? Resolve(string name) => _byName.TryGetValue(name, out var t) ? t : null;
}
