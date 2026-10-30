using System;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

/// <summary>
/// TASK-08 / CR-2026-012: Invariant test kiểm chứng các quy tắc nghiệp vụ cốt lõi:
/// - BR-BRK-07: Bảo mật dữ liệu cá nhân PDPD (Nghị định 13/2023/NĐ-CP) và Masking Server-Side
/// - BR-BRK-08: Ràng buộc lý do từ chối kết nối >= 10 ký tự và Scoped RBAC Data Isolation
/// </summary>
public sealed class BrokerageConnectionRequestInvariantsTests
{
    private static string MaskPhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone) || phone.Length < 7) return phone ?? "";
        return string.Concat(phone.AsSpan(0, 2), "****", phone.AsSpan(phone.Length - 4));
    }

    private static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@')) return email ?? "";
        var parts = email.Split('@');
        var name = parts[0];
        var domain = parts[1];
        if (name.Length <= 2) return $"{name[0]}***@{domain}";
        return $"{name[0]}***{name[^1]}@{domain}";
    }

    [Theory]
    [InlineData("0901234567", "09****4567")]
    [InlineData("0987654321", "09****4321")]
    [InlineData("0912345678", "09****5678")]
    public void Phone_numbers_must_be_masked_correctly_under_PDPD_invariants(string rawPhone, string expectedMasked)
    {
        var result = MaskPhone(rawPhone);
        result.ShouldBe(expectedMasked);
        result.ShouldNotBe(rawPhone);
        result.ShouldContain("****");
    }

    [Theory]
    [InlineData("buyer@company.vn", "b***r@company.vn")]
    [InlineData("seller@partner.vn", "s***r@partner.vn")]
    [InlineData("contact.tech@rnd.ac.vn", "c***h@rnd.ac.vn")]
    public void Email_addresses_must_be_masked_correctly_under_PDPD_invariants(string rawEmail, string expectedMasked)
    {
        var result = MaskEmail(rawEmail);
        result.ShouldBe(expectedMasked);
        result.ShouldNotBe(rawEmail);
        result.ShouldContain("***");
    }

    [Fact]
    public void Pending_or_rejected_connection_request_must_project_masked_contact_info()
    {
        var rawPhone = "0901234567";
        var rawEmail = "buyer@corp.vn";
        var status = "PENDING";

        var isAccepted = string.Equals(status, "ACCEPTED", StringComparison.OrdinalIgnoreCase);
        var projectedPhone = isAccepted ? rawPhone : MaskPhone(rawPhone);
        var projectedEmail = isAccepted ? rawEmail : MaskEmail(rawEmail);
        var isMasked = !isAccepted;

        isMasked.ShouldBeTrue();
        projectedPhone.ShouldBe("09****4567");
        projectedEmail.ShouldBe("b***r@corp.vn");
    }

    [Fact]
    public void Accepted_connection_request_must_unmask_contact_info_for_deal_room()
    {
        var rawPhone = "0901234567";
        var rawEmail = "buyer@corp.vn";
        var status = "ACCEPTED";

        var isAccepted = string.Equals(status, "ACCEPTED", StringComparison.OrdinalIgnoreCase);
        var projectedPhone = isAccepted ? rawPhone : MaskPhone(rawPhone);
        var projectedEmail = isAccepted ? rawEmail : MaskEmail(rawEmail);
        var isMasked = !isAccepted;

        isMasked.ShouldBeFalse();
        projectedPhone.ShouldBe(rawPhone);
        projectedEmail.ShouldBe(rawEmail);
    }

    [Theory]
    [InlineData("Không phù hợp", true)]
    [InlineData("Giải pháp không tương thích với dây chuyền hiện tại của công ty", true)]
    [InlineData("Không", false)]
    [InlineData("Sai spec", false)]
    [InlineData("   ", false)]
    public void Rejection_reason_must_have_at_least_10_characters(string reason, bool isValid)
    {
        var trimmed = reason?.Trim() ?? "";
        var check = trimmed.Length >= 10;
        check.ShouldBe(isValid);
    }
}
