using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Api.V2;
using NetArchTest.Rules;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// <summary>
/// Cổng done của [ADR-0009](../../docs/adr/0009-noi-dat-endpoint-v2.md).
///
/// ADR-0009 đặt ra ba quy tắc để lựa chọn "endpoint v2 nằm ở `apps/api/V2/`" không mục ruỗng: lớp cơ sở riêng,
/// không dùng chung hàm ánh xạ, và tài liệu OpenAPI tách đôi. Cả ba là **quy ước**, và quy ước không được kiểm
/// thì chỉ là lời khuyên — trong ba tháng sẽ có người tiện tay dùng lại `V1Mappers` vì nó đã có sẵn đúng cái
/// hình dạng cần. B-19 là ví dụ về cái giá của việc đó: một hàm ánh xạ dùng chung giữa hai đường có mức tin cậy
/// khác nhau đẩy `email` và `phone` của mọi tác giả ra Internet, và không ai thấy trong diff.
/// </summary>
public sealed class V2SurfaceBoundaryTests
{
    private const string V2Namespace = "NacenTech.Api.V2";
    private const string V1Namespace = "NacenTech.Api.V1Compat";

    private static readonly Assembly Api = typeof(V2ControllerBase).Assembly;

    [Fact]
    public void V2_does_not_depend_on_the_v1_facade()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespaceStartingWith(V2Namespace)
            .ShouldNot().HaveDependencyOn(V1Namespace)
            .GetResult();

        result.IsSuccessful.ShouldBeTrue(
            "Endpoint v2 dùng lại kiểu của facade v1 (ADR-0009 quy tắc 4 và 5). " +
            $"Kiểu vi phạm: {string.Join(", ", result.FailingTypeNames ?? [])}");
    }

    /// <summary>
    /// Chiều ngược lại cũng phải chặn. `V1Compat/` theo thiết kế **không nhận endpoint mới** và phải xoá được
    /// nguyên khối tại sunset 31/03/2027; một tham chiếu từ v1 sang v2 biến việc xoá đó thành một cuộc gỡ rối.
    /// </summary>
    [Fact]
    public void The_v1_facade_does_not_depend_on_v2()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespaceStartingWith(V1Namespace)
            .ShouldNot().HaveDependencyOn(V2Namespace)
            .GetResult();

        result.IsSuccessful.ShouldBeTrue(
            "Facade v1 tham chiếu sang v2 — nó sẽ không xoá được nguyên khối tại sunset. " +
            $"Kiểu vi phạm: {string.Join(", ", result.FailingTypeNames ?? [])}");
    }

    /// <summary>Không controller v2 nào được kế thừa lớp cơ sở của v1 (ADR-0009 quy tắc 4).</summary>
    [Fact]
    public void V2_controllers_all_derive_from_the_v2_base()
    {
        var controllers = ControllersIn(V2Namespace);
        controllers.ShouldNotBeEmpty("Không tìm thấy controller v2 nào — test này sẽ xanh giả nếu namespace đổi tên");

        foreach (var c in controllers)
        {
            typeof(V2ControllerBase).IsAssignableFrom(c).ShouldBeTrue($"{c.FullName} không kế thừa V2ControllerBase");
        }
    }

    /// <summary>
    /// Hai bề mặt phải phân vùng theo tiền tố đường dẫn, vì đó chính là điều kiện để hai tài liệu OpenAPI tách
    /// đôi được. Đây là phép đo đã phát hiện B-01 — tài liệu mang tên "v2" chứa 74 đường `/api/v1` và 0 đường
    /// v2 — nên nó phải là test, không phải một thao tác tay ai đó nhớ chạy.
    ///
    /// Phép kiểm **không đối xứng**, và đó là chủ ý. Chiều v2 chặt: mọi controller v2 phải nằm dưới `/api/v2`.
    /// Chiều v1 chỉ cấm lấn sang `/api/v2`, vì bề mặt cũ có đường cố ý nằm ngoài `/api/v1` —
    /// `FileContentController` phục vụ nội dung tệp tại `/files/{key}`, đúng địa chỉ đã nhúng trong nội dung đã
    /// phát hành. Ép nó vào `/api/v1` sẽ làm hỏng mọi liên kết tệp đang tồn tại. Đó là lý do bộ lọc tài liệu v1
    /// dùng "mọi thứ không phải v2" thay vì "mọi thứ bắt đầu bằng api/v1".
    /// </summary>
    [Fact]
    public void Route_prefixes_partition_cleanly_between_v1_and_v2()
    {
        var v2Routes = RoutesOf(V2Namespace);
        var v1Routes = RoutesOf(V1Namespace);

        v2Routes.ShouldNotBeEmpty("Bề mặt v2 rỗng — `/api/v2` lại trở về 0 endpoint (B-01)");

        foreach (var controller in ControllersIn(V2Namespace))
        {
            var routes = controller.GetCustomAttributes<RouteAttribute>().Select(r => r.Template).ToList();
            routes.ShouldContain(r => r.StartsWith("api/v2", StringComparison.Ordinal),
                $"Controller v2 {controller.Name} không khai đường dẫn nào bắt đầu bằng /api/v2");
        }

        foreach (var route in v1Routes)
            route.ShouldNotStartWith("api/v2", Case.Sensitive, $"Facade v1 lấn sang bề mặt v2: {route}");
    }

    private static List<Type> ControllersIn(string ns) => Api.GetTypes()
        .Where(t => t.Namespace == ns && !t.IsAbstract && t.GetCustomAttributes<RouteAttribute>().Any())
        .ToList();

    private static List<string> RoutesOf(string ns) => ControllersIn(ns)
        .SelectMany(t => t.GetCustomAttributes<RouteAttribute>())
        .Select(r => r.Template)
        .ToList();
}
