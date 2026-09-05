using NacenTech.Contracts.Canonical;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// <summary>
/// AC 31 và D2-23: auditor phải tính lại được hash từ dữ liệu export và ra đúng giá trị hệ thống đã ghi.
/// Điều kiện là canonicalization xác định và ổn định qua thời gian (RFC 8785).
/// </summary>
public sealed class CanonicalJsonTests
{
    [Fact]
    public void Object_keys_are_sorted_by_code_unit()
    {
        var canonical = CanonicalJson.Canonicalize("""{"b":1,"a":2,"C":3}""");
        canonical.ShouldBe("""{"C":3,"a":2,"b":1}""");
    }

    [Fact]
    public void Array_order_is_preserved()
        => CanonicalJson.Canonicalize("""{"x":[3,1,2]}""").ShouldBe("""{"x":[3,1,2]}""");

    [Fact]
    public void Whitespace_does_not_change_hash()
    {
        var a = CanonicalJson.Sha256Hex(CanonicalJson.Canonicalize("""{ "a" : 1 , "b" : [ 2 ] }"""));
        var b = CanonicalJson.Sha256Hex(CanonicalJson.Canonicalize("""{"b":[2],"a":1}"""));
        a.ShouldBe(b);
    }

    [Fact]
    public void Nested_objects_are_canonicalized_recursively()
        => CanonicalJson.Canonicalize("""{"z":{"b":1,"a":2}}""").ShouldBe("""{"z":{"a":2,"b":1}}""");

    [Fact]
    public void Control_characters_are_escaped()
        => CanonicalJson.Canonicalize("{\"a\":\"line\\nbreak\"}").ShouldBe("{\"a\":\"line\\nbreak\"}");

    [Fact]
    public void Hash_is_stable_across_runs()
    {
        var value = new { caseId = "9f1b", stage = "QUALIFICATION", gates = new[] { "BUDGET_PATH", "LEAD_BROKER" } };
        var first = CanonicalJson.Hash(value);
        var second = CanonicalJson.Hash(value);
        first.ShouldBe(second);
        first.Length.ShouldBe(64);
    }

    [Fact]
    public void Canonicalization_version_is_recorded()
        => CanonicalJson.Version.ShouldBe("JCS-1");
}
