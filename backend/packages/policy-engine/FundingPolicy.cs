using System.Text.Json;
using System.Text.Json.Serialization;

namespace NacenTech.PolicyEngine;

/// <summary>
/// ADR-0014: **công cụ pháp lý** mà tiền của một hồ sơ đi vào. Đây là một trục khác với `BudgetPathStatus`
/// (*ai trả tiền*) và khác với `Program.type` của §19.1 (*chương trình tài trợ nào của sponsor*): nhiều loại
/// chương trình cùng ánh xạ về một công cụ, và một hồ sơ không thuộc chương trình nào vẫn phải có công cụ.
///
/// Từ vựng nằm ở đây chứ không ở module case vì hai module cần nó: module case ghi giá trị, module policy tra
/// luật để đóng băng vào ảnh chụp. Hai bản chép tay sẽ lệch nhau — cùng lý do `PlatformCapabilities` nằm ở kernel.
/// </summary>
public static class FundingInstruments
{
    /// <summary>Mặc định lúc tạo hồ sơ. Bị từ chối ở cổng `QUALIFICATION` — chưa khai thì chưa đủ điều kiện.</summary>
    public const string Undetermined = "UNDETERMINED";

    /// <summary>Bên mua trả bằng vốn tư.</summary>
    public const string Private = "PRIVATE";

    /// <summary>Mua sắm bằng vốn nhà nước — phạm vi Điều 50 Luật Đấu thầu 2023 và ADR-0013.</summary>
    public const string PublicProcurement = "PUBLIC_PROCUREMENT";

    /// <summary>Nhiệm vụ khoa học và công nghệ sử dụng ngân sách nhà nước.</summary>
    public const string RndTask = "RND_TASK";

    /// <summary>Tài trợ/hỗ trợ không hoàn lại, gồm voucher đổi mới sáng tạo (§19.1 `VOUCHER`, `*_GRANT`).</summary>
    public const string Grant = "GRANT";

    /// <summary>Chương trình đồng tài trợ công–tư trả theo mốc (§19.2 `HybridProgramAgreement`).</summary>
    public const string CoFundedProgram = "CO_FUNDED_PROGRAM";

    /// <summary>Thử nghiệm có kiểm soát theo văn bản cho phép.</summary>
    public const string RegulatorySandbox = "REGULATORY_SANDBOX";

    public static readonly IReadOnlySet<string> All = new HashSet<string>
    {
        Undetermined, Private, PublicProcurement, RndTask, Grant, CoFundedProgram, RegulatorySandbox,
    };

    /// <summary>
    /// `PRIVATE` là công cụ duy nhất không cần tham chiếu văn bản: không có văn bản công nào để trỏ tới. Mọi
    /// công cụ còn lại đều phát sinh từ một quyết định, hợp đồng hoặc văn bản cho phép — và một hồ sơ khai mình
    /// chạy bằng ngân sách mà không nói được theo văn bản nào là một lời khai không kiểm chứng được.
    /// </summary>
    public static bool RequiresLegalFormRef(string instrument)
        => instrument != Private && instrument != Undetermined;
}

/// <summary>
/// Một dòng của tập luật: công cụ này có được **chọn bên cung ứng và thực thi ngay trên nền tảng** hay không.
///
/// <paramref name="LegalBasisRef"/> là **bắt buộc** và đó là toàn bộ điểm của thiết kế này. Câu hỏi "nhiệm vụ
/// KH&amp;CN dùng ngân sách có được chọn bên thực hiện tại đây không" là câu hỏi cho luật sư, không cho một
/// `switch` trong mã. Bắt buộc tham chiếu nghĩa là đội không ship được một khẳng định pháp lý mà chưa ai ký.
/// </summary>
public sealed record FundingRule(
    string Instrument,
    bool ExecutionInPlatformPermitted,
    string LegalBasisRef,
    string? Description);

/// <summary>
/// Tập luật có phiên bản, nạp từ `config/policies/`. Cùng hình dạng với <see cref="RuleSet"/> của bảng quyết
/// định, và cùng luật nền: **ô không phủ = từ chối** (§23.2, D2-21). Công cụ không có dòng nào thì không được
/// thực thi tại chỗ — kể cả `UNDETERMINED`, nên nó không cần dòng riêng để bị chặn.
/// </summary>
public sealed class FundingPolicySet
{
    private readonly Dictionary<string, FundingRule> _byInstrument;

    public FundingPolicySet(string version, DateTimeOffset effectiveFrom, IReadOnlyList<FundingRule> rules)
    {
        Version = version;
        EffectiveFrom = effectiveFrom;
        Rules = rules;
        _byInstrument = rules.ToDictionary(r => r.Instrument, StringComparer.Ordinal);
    }

    public string Version { get; }
    public DateTimeOffset EffectiveFrom { get; }
    public IReadOnlyList<FundingRule> Rules { get; }

    public FundingRule? Find(string instrument)
        => _byInstrument.TryGetValue(instrument, out var rule) ? rule : null;

    /// <summary>Default DENY: không có dòng thì không được phép, và đó là câu trả lời chứ không phải lỗi.</summary>
    public bool IsExecutionInPlatformPermitted(string instrument)
        => Find(instrument)?.ExecutionInPlatformPermitted ?? false;
}

/// <summary>Nạp tập luật công cụ tài chính từ JSON versioned, cùng khuôn với <see cref="RuleSetLoader"/>.</summary>
public static class FundingPolicyLoader
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
    };

    public static FundingPolicySet FromJson(string json)
    {
        var dto = JsonSerializer.Deserialize<SetDto>(json, Options)
                  ?? throw new InvalidOperationException("Tập luật công cụ tài chính rỗng");
        if (string.IsNullOrWhiteSpace(dto.Version))
            throw new InvalidOperationException("Tập luật công cụ tài chính thiếu version");

        var rules = new List<FundingRule>();
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var r in dto.Rules)
        {
            if (!FundingInstruments.All.Contains(r.Instrument))
                throw new InvalidOperationException($"Công cụ tài chính không có trong từ vựng: {r.Instrument}");

            // Không có căn cứ thì không có luật. Một dòng thiếu tham chiếu văn bản sẽ trở thành một kết luận
            // pháp lý ẩn danh nằm trong ảnh chụp chính sách của mọi hồ sơ chạy sau nó.
            if (string.IsNullOrWhiteSpace(r.LegalBasisRef))
                throw new InvalidOperationException($"Dòng {r.Instrument} thiếu legalBasisRef — không nạp được");

            if (!seen.Add(r.Instrument))
                throw new InvalidOperationException($"Công cụ tài chính khai hai lần: {r.Instrument}");

            rules.Add(new FundingRule(r.Instrument, r.ExecutionInPlatformPermitted, r.LegalBasisRef, r.Description));
        }

        return new FundingPolicySet(dto.Version, dto.EffectiveFrom, rules);
    }

    public static FundingPolicySet FromFile(string path) => FromJson(File.ReadAllText(path));

    private sealed record SetDto(string Version, DateTimeOffset EffectiveFrom, List<RuleDto> Rules);

    private sealed record RuleDto(string Instrument, bool ExecutionInPlatformPermitted, string? LegalBasisRef, string? Description);
}
