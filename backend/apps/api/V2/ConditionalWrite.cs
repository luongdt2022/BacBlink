using NacenTech.Kernel.Domain;

namespace NacenTech.Api.V2;

/// <summary>
/// Ghi có điều kiện: `ETag` ở phản hồi, `If-Match` ở yêu cầu (§7.5, §22.1).
///
/// B-40: trước sprint 5, hợp đồng API hứa **hai** đường gửi lại số phiên bản — trường `expectedVersion` trong
/// thân request, và header `If-Match` — nhưng chỉ đường thứ nhất có mã. Không dòng nào đọc `If-Match`, không
/// dòng nào phát `ETag`, mà cấu hình CORS thì đã mở `ETag` cho một header không bao giờ được gửi.
///
/// Đó là khiếm khuyết nguy hiểm hơn một tính năng thiếu: thiếu hẳn thì lộ ngay, còn có một nửa thì client gửi
/// header đúng luật và **tin rằng mình được bảo vệ** trong khi máy chủ ghi đè. Lớp này đóng nửa còn lại.
/// </summary>
public static class ConditionalWrite
{
    /// <summary>Giá trị `ETag` cho một bản ghi có phiên bản. Dùng dạng mạnh — so sánh `If-Match` là so sánh mạnh.</summary>
    public static string ETagFor(int version) => $"\"{version}\"";

    /// <summary>
    /// Đọc `If-Match` thành số phiên bản.
    ///
    /// Trả `null` khi header vắng mặt. Trả <see cref="AnyVersion"/> cho `*` — nghĩa là "bản ghi nào cũng được,
    /// miễn là nó tồn tại", và người gọi phải hiểu đó là **bỏ kiểm tranh chấp một cách có chủ ý**.
    ///
    /// Header có nhiều giá trị (`"3", "5"`) bị từ chối chứ không lấy giá trị đầu: RFC cho phép danh sách, nhưng
    /// với ghi có điều kiện trên một bản ghi thì "một trong hai phiên bản này" không có nghĩa nghiệp vụ nào, và
    /// đoán hộ người gọi ở đây là cách tạo ra một lần ghi đè im lặng.
    /// </summary>
    public static int? Parse(string? headerValue)
    {
        if (string.IsNullOrWhiteSpace(headerValue)) return null;

        var raw = headerValue.Trim();
        if (raw == "*") return AnyVersion;

        if (raw.Contains(','))
            throw new ValidationException("If-Match phải mang đúng một giá trị; danh sách không dùng được cho ghi có điều kiện");

        // `W/"5"` là etag yếu. RFC 9110 §13.1.1 nói If-Match dùng so sánh MẠNH, nên etag yếu không hợp lệ ở
        // đây — chấp nhận nó là ngầm hứa một mức bảo vệ mà so sánh yếu không cho.
        if (raw.StartsWith("W/", StringComparison.Ordinal))
            throw new ValidationException("If-Match không nhận etag yếu (W/...); ghi có điều kiện cần so sánh mạnh");

        if (raw.Length < 2 || raw[0] != '"' || raw[^1] != '"')
            throw new ValidationException("If-Match phải có dạng \"<số phiên bản>\"");

        var inner = raw[1..^1];
        if (!int.TryParse(inner, out var version) || version < 0)
            throw new ValidationException("If-Match phải chứa một số phiên bản không âm");

        return version;
    }

    /// <summary>`If-Match: *` — chấp nhận mọi phiên bản. Không phải một số phiên bản hợp lệ, nên nằm ngoài miền giá trị.</summary>
    public const int AnyVersion = -1;

    /// <summary>
    /// Gộp hai đường gửi phiên bản thành một con số.
    ///
    /// Hợp đồng cho phép cả hai, nên phải có luật cho trường hợp cả hai cùng có mặt: **khớp nhau thì lấy, lệch
    /// nhau thì từ chối**. Không ưu tiên đường nào — hai giá trị mâu thuẫn nghĩa là client đang nhầm lẫn về
    /// chính bản ghi nó định ghi, và im lặng chọn một trong hai là chọn hộ người gọi cái họ không yêu cầu.
    /// </summary>
    public static int? Resolve(string? ifMatchHeader, int? expectedVersionFromBody)
    {
        var fromHeader = Parse(ifMatchHeader);

        if (fromHeader is null) return expectedVersionFromBody;
        if (expectedVersionFromBody is null) return fromHeader;
        if (fromHeader == AnyVersion) return expectedVersionFromBody;
        if (fromHeader == expectedVersionFromBody) return fromHeader;

        throw new ValidationException(
            $"If-Match (\"{fromHeader}\") và expectedVersion ({expectedVersionFromBody}) không khớp nhau");
    }
}
