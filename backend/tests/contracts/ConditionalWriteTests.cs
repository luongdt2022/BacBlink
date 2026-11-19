using NacenTech.Api.V2;
using NacenTech.Kernel.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// <summary>
/// B-40. Hợp đồng API hứa hai đường gửi lại số phiên bản — `expectedVersion` trong thân, và header `If-Match`
/// — nhưng chỉ đường thứ nhất có mã. Một client gửi `If-Match` đúng luật sẽ **tin rằng mình được bảo vệ**
/// trong khi máy chủ bỏ qua header và ghi đè; thiếu hẳn thì lộ ngay, có một nửa thì im lặng.
///
/// Bộ này canh nửa còn lại, và canh cả **luật khi hai đường mâu thuẫn** — chỗ dễ chọn hộ người gọi nhất.
/// </summary>
public sealed class ConditionalWriteTests
{
    [Fact]
    public void An_etag_carries_the_version_as_a_strong_validator()
        => ConditionalWrite.ETagFor(7).ShouldBe("\"7\"");

    [Theory]
    [InlineData("\"0\"", 0)]
    [InlineData("\"5\"", 5)]
    [InlineData("  \"42\"  ", 42)]
    public void A_well_formed_header_parses_to_its_version(string header, int expected)
        => ConditionalWrite.Parse(header).ShouldBe(expected);

    [Fact]
    public void An_absent_header_is_not_an_error_it_is_simply_absent()
    {
        ConditionalWrite.Parse(null).ShouldBeNull();
        ConditionalWrite.Parse("").ShouldBeNull();
        ConditionalWrite.Parse("   ").ShouldBeNull();
    }

    /// <summary>`*` là "bản ghi nào cũng được, miễn nó tồn tại" — bỏ kiểm tranh chấp một cách **có chủ ý**.</summary>
    [Fact]
    public void A_star_means_any_version()
        => ConditionalWrite.Parse("*").ShouldBe(ConditionalWrite.AnyVersion);

    /// <summary>
    /// Etag yếu bị từ chối chứ không được chấp nhận im lặng: RFC 9110 §13.1.1 nói `If-Match` dùng so sánh
    /// **mạnh**, nên nhận `W/"5"` là ngầm hứa một mức bảo vệ mà so sánh yếu không cho.
    /// </summary>
    [Fact]
    public void A_weak_etag_is_refused_rather_than_quietly_accepted()
    {
        var ex = Should.Throw<ValidationException>(() => ConditionalWrite.Parse("W/\"5\""));
        ex.Message.ShouldContain("yếu");
    }

    /// <summary>
    /// Danh sách bị từ chối chứ không lấy giá trị đầu. "Một trong hai phiên bản này" không có nghĩa nghiệp vụ
    /// nào trên một bản ghi, và đoán hộ người gọi là cách tạo ra một lần ghi đè im lặng.
    /// </summary>
    [Fact]
    public void A_list_of_etags_is_refused_rather_than_taking_the_first()
        => Should.Throw<ValidationException>(() => ConditionalWrite.Parse("\"3\", \"5\""));

    [Theory]
    [InlineData("5")]           // thiếu dấu nháy
    [InlineData("\"abc\"")]     // không phải số
    [InlineData("\"-1\"")]      // phiên bản âm
    [InlineData("\"\"")]        // rỗng
    public void A_malformed_header_is_a_validation_error(string header)
        => Should.Throw<ValidationException>(() => ConditionalWrite.Parse(header));

    // ─── Luật khi hai đường cùng có mặt ───────────────────────────────────────────────────────

    [Fact]
    public void Only_the_body_carries_the_version()
        => ConditionalWrite.Resolve(null, 4).ShouldBe(4);

    [Fact]
    public void Only_the_header_carries_the_version()
        => ConditionalWrite.Resolve("\"4\"", null).ShouldBe(4);

    [Fact]
    public void Both_agree_so_either_answer_is_the_same_answer()
        => ConditionalWrite.Resolve("\"4\"", 4).ShouldBe(4);

    /// <summary>
    /// Hai giá trị mâu thuẫn nghĩa là client đang nhầm lẫn về chính bản ghi nó định ghi. Không ưu tiên đường
    /// nào: im lặng chọn một trong hai là chọn hộ người gọi cái họ không yêu cầu, và cái giá là một lần ghi đè.
    /// </summary>
    [Fact]
    public void Both_present_but_disagreeing_is_refused_without_picking_a_winner()
    {
        var ex = Should.Throw<ValidationException>(() => ConditionalWrite.Resolve("\"9\"", 4));
        ex.Message.ShouldContain("9");
        ex.Message.ShouldContain("4");
    }

    /// <summary>`*` nhường cho giá trị cụ thể hơn: người gọi đã nói rõ phiên bản nào ở thân request.</summary>
    [Fact]
    public void A_star_yields_to_an_explicit_body_version()
        => ConditionalWrite.Resolve("*", 4).ShouldBe(4);

    [Fact]
    public void Neither_present_means_no_expectation()
        => ConditionalWrite.Resolve(null, null).ShouldBeNull();
}
