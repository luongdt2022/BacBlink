using System.Reflection;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Persistence;
using NetArchTest.Rules;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Architecture;

/// <summary>
/// MOD-01…05 (§9.2, D2-147). Đây là hàng rào thật của kiến trúc modular monolith:
/// không có test này thì ranh giới module mục ruỗng dần và việc tách service sau sẽ không còn rẻ.
/// </summary>
public sealed class ModuleBoundaryTests
{
    private static IReadOnlyList<Assembly> ModuleAssemblies => ModuleRegistry.All.Select(m => m.Assembly).Distinct().ToList();

    /// <summary>MOD-05: một DbContext duy nhất cho toàn hệ thống; module không được tạo context riêng.</summary>
    [Fact]
    public void Only_one_DbContext_exists()
    {
        var contexts = ModuleAssemblies.Append(typeof(NacenTechDbContext).Assembly)
            .SelectMany(a => a.GetTypes())
            .Where(t => typeof(DbContext).IsAssignableFrom(t) && !t.IsAbstract)
            .ToList();

        contexts.ShouldHaveSingleItem();
        contexts[0].ShouldBe(typeof(NacenTechDbContext));
    }

    /// <summary>MOD-02: module không tham chiếu assembly module khác; lookup xuyên module qua Kernel.</summary>
    [Fact]
    public void Modules_do_not_reference_other_modules()
    {
        var failures = new List<string>();
        foreach (var module in ModuleAssemblies)
        {
            var referenced = module.GetReferencedAssemblies()
                .Where(r => r.Name is not null && r.Name.StartsWith("NacenTech.Modules.", StringComparison.Ordinal))
                .Select(r => r.Name!)
                .Where(name => name != module.GetName().Name)
                .ToList();
            if (referenced.Count > 0) failures.Add($"{module.GetName().Name} → {string.Join(", ", referenced)}");
        }
        failures.ShouldBeEmpty($"Module tham chiếu chéo (MOD-02): {string.Join(" | ", failures)}");
    }

    /// <summary>Domain là C# thuần (§26.3): không có EF Core type trong namespace Domain.</summary>
    [Fact]
    public void Domain_layer_does_not_depend_on_EntityFrameworkCore()
    {
        foreach (var module in ModuleAssemblies)
        {
            var result = Types.InAssembly(module)
                .That().ResideInNamespaceMatching(@".*\.Domain($|\..*)")
                .ShouldNot().HaveDependencyOn("Microsoft.EntityFrameworkCore")
                .GetResult();
            result.IsSuccessful.ShouldBeTrue(
                $"{module.GetName().Name}: Domain phụ thuộc EF Core — {string.Join(", ", result.FailingTypeNames ?? [])}");
        }
    }

    /// <summary>Domain không phụ thuộc ASP.NET Core (HTTP là chuyện của host).</summary>
    [Fact]
    public void Domain_layer_does_not_depend_on_AspNetCore()
    {
        foreach (var module in ModuleAssemblies)
        {
            var result = Types.InAssembly(module)
                .That().ResideInNamespaceMatching(@".*\.Domain($|\..*)")
                .ShouldNot().HaveDependencyOn("Microsoft.AspNetCore")
                .GetResult();
            result.IsSuccessful.ShouldBeTrue(
                $"{module.GetName().Name}: Domain phụ thuộc ASP.NET Core — {string.Join(", ", result.FailingTypeNames ?? [])}");
        }
    }

    /// <summary>MOD-01/02: chỉ host mở transaction; service của module gọi IUnitOfWork.CommitAsync.</summary>
    [Fact]
    public void Modules_do_not_call_SaveChanges_or_BeginTransaction()
    {
        var forbidden = new[] { "SaveChanges", "SaveChangesAsync", "BeginTransaction", "BeginTransactionAsync" };
        var failures = new List<string>();

        foreach (var module in ModuleAssemblies)
        {
            foreach (var type in module.GetTypes())
            {
                foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.DeclaredOnly))
                {
                    var body = method.GetMethodBody();
                    if (body is null) continue;
                    var il = body.GetILAsByteArray();
                    if (il is null) continue;
                    foreach (var name in forbidden)
                    {
                        // Quét metadata token của call site rẻ hơn dùng thư viện disassembly; đủ để chặn hồi quy.
                        if (MethodReferenced(module, il, name)) failures.Add($"{type.FullName}.{method.Name} → {name}");
                    }
                }
            }
        }

        failures.ShouldBeEmpty($"Module gọi trực tiếp transaction/SaveChanges (MOD-01/02): {string.Join(" | ", failures.Distinct())}");
    }

    private static bool MethodReferenced(Assembly assembly, byte[] il, string methodName)
    {
        var module = assembly.Modules.First();
        for (var i = 0; i + 4 < il.Length; i++)
        {
            // 0x28 = call, 0x6F = callvirt; theo sau là metadata token 4 byte.
            if (il[i] is not (0x28 or 0x6F)) continue;
            var token = BitConverter.ToInt32(il, i + 1);
            try
            {
                var resolved = module.ResolveMethod(token);
                if (resolved is not null && resolved.Name == methodName &&
                    resolved.DeclaringType?.Namespace?.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.Ordinal) == true)
                {
                    return true;
                }
            }
            catch (Exception)
            {
                // Token không phải method reference — bỏ qua.
            }
        }
        return false;
    }

    /// <summary>Mỗi module khai báo schema riêng, không trùng nhau.</summary>
    [Fact]
    public void Module_schemas_are_unique()
    {
        var schemas = ModuleRegistry.All.Select(m => m.Schema).ToList();
        schemas.Distinct().Count().ShouldBe(schemas.Count);
        schemas.ShouldNotContain(NacenTechDbContext.PlatformSchema);
    }

    /// <summary>Mọi IModule trong registry đều có tên và assembly khớp nhau.</summary>
    [Fact]
    public void Modules_are_registered_consistently()
    {
        foreach (var module in ModuleRegistry.All)
        {
            module.Name.ShouldNotBeNullOrWhiteSpace();
            module.Assembly.ShouldNotBeNull();
            module.ShouldBeAssignableTo<IModule>();
        }
    }
}
