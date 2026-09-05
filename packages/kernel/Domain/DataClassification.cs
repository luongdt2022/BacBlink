namespace NacenTech.Kernel.Domain;

/// <summary>
/// Phân loại dữ liệu §16.1 — **ba** mức. Ánh xạ từ NacenTwin: field/attachment không mức = PUBLIC,
/// level2 = CONFIDENTIAL, level3 = HIGHLY_CONFIDENTIAL (§30.1).
///
/// Mức thứ tư `Internal` đã bị bỏ theo ADR-0007. Nó từng nằm giữa `Public` và `Confidential`, không đường nào
/// tạo ra được, và hai tầng hiểu nó theo hai cách: phép kiểm "mật" xếp nó cùng `Public` nên danh sách hiện nó
/// cho mọi người, còn bảng quyết định không có luật nào cho nó nên đường mở từ chối bằng `DEFAULT_DENY`. Một
/// mức mật mà tên nói một đằng, hành vi nói một nẻo, và hai tầng nói hai nẻo khác nhau — là thứ tệ hơn không
/// có mức đó. Muốn có mức thứ tư thì phải trả lời "nội bộ với ai" trước, và đó là một ADR mới.
///
/// Lưu dưới dạng chuỗi, nên giá trị số ở đây không phải hợp đồng với cơ sở dữ liệu.
/// </summary>
public enum DataClassification
{
    Public = 0,
    Confidential = 2,
    HighlyConfidential = 3,
}

public static class DataClassificationExtensions
{
    /// <summary>Với ba mức, "mật" đồng nghĩa với "không phải công khai" — và đó là đúng nghĩa cần có.</summary>
    public static bool IsConfidential(this DataClassification c) => c >= DataClassification.Confidential;

    /// <summary>
    /// Mã đưa vào bảng quyết định (`documentClassification`). Đặt ở kernel để có **một** ánh xạ duy nhất và
    /// kiểm được từ bộ test bảng quyết định: mọi mã phát ra từ đây phải có luật gọi tên nó — xem ADR-0007,
    /// cổng done 2. Không có nhánh mặc định: một mức mới mà quên ánh xạ phải là lỗi biên dịch, không phải
    /// một chuỗi "PUBLIC" âm thầm.
    /// </summary>
    public static string ToCode(this DataClassification c) => c switch
    {
        DataClassification.Public => "PUBLIC",
        DataClassification.Confidential => "CONFIDENTIAL",
        DataClassification.HighlyConfidential => "HIGHLY_CONFIDENTIAL",
        _ => throw new ArgumentOutOfRangeException(nameof(c), c, "Mức mật chưa có mã trong bảng quyết định"),
    };

    /// <summary>Tên legacy: null | "level2" | "level3".</summary>
    public static string? ToLegacyLevel(this DataClassification c) => c switch
    {
        DataClassification.Confidential => "level2",
        DataClassification.HighlyConfidential => "level3",
        _ => null,
    };

    public static DataClassification FromLegacyLevel(string? level) => level switch
    {
        "level2" => DataClassification.Confidential,
        "level3" => DataClassification.HighlyConfidential,
        _ => DataClassification.Public,
    };
}
