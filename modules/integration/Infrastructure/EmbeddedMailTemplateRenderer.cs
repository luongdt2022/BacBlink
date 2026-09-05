using System.Net;
using System.Reflection;
using System.Text.RegularExpressions;
using NacenTech.Contracts.Jobs;
using NacenTech.Modules.Integration.Application;

namespace NacenTech.Modules.Integration.Infrastructure;

/// <summary>
/// Render template HTML nhúng trong assembly. Hỗ trợ đúng ba cấu trúc Handlebars mà template legacy dùng:
/// `{{var}}` (escape), `{{{var}}}` (raw) và `{{#if (eq var "value")}}…{{else}}…{{/if}}` / `{{#if var}}…{{/if}}`.
/// Đây là tập con cố ý: template mới phải nằm trong tập này để render luôn tiên đoán được.
/// </summary>
public sealed partial class EmbeddedMailTemplateRenderer : IMailTemplateRenderer
{
    private static readonly Assembly Asm = typeof(EmbeddedMailTemplateRenderer).Assembly;
    private readonly Dictionary<string, string> _cache = [];
    private readonly Lock _lock = new();

    public string Render(string template, IReadOnlyDictionary<string, string> context)
    {
        var source = Load(template);
        var rendered = RenderIfBlocks(source, context);
        return RenderVariables(rendered, context);
    }

    public string SubjectFor(string template, IReadOnlyDictionary<string, string> context) => template switch
    {
        MailTemplates.AccountActivation => "Xác nhận tài khoản DMST của bạn",
        MailTemplates.Welcome => "Chào mừng đến với DMST",
        MailTemplates.ResetPassword => "Đặt lại mật khẩu DMST",
        MailTemplates.PasswordChanged => "Thông báo thay đổi mật khẩu tài khoản",
        MailTemplates.CollaborationRequest => context.GetValueOrDefault("type") switch
        {
            "accepted" => "Yêu cầu hợp tác của bạn đã được chấp nhận",
            "rejected" => "Yêu cầu hợp tác của bạn đã bị từ chối",
            _ => "Bạn nhận được yêu cầu hợp tác mới",
        },
        _ => "NacenTech",
    };

    private string Load(string template)
    {
        lock (_lock)
        {
            if (_cache.TryGetValue(template, out var cached)) return cached;
            var name = $"NacenTech.Modules.Integration.MailTemplates.{template}.html";
            using var stream = Asm.GetManifestResourceStream(name)
                ?? throw new InvalidOperationException($"Không tìm thấy mail template '{template}' ({name})");
            using var reader = new StreamReader(stream);
            var text = reader.ReadToEnd();
            _cache[template] = text;
            return text;
        }
    }

    private static string RenderIfBlocks(string source, IReadOnlyDictionary<string, string> ctx)
    {
        // Xử lý lồng nhau bằng cách lặp tới khi không còn khối nào khớp.
        var current = source;
        for (var i = 0; i < 10; i++)
        {
            var next = IfBlockRegex().Replace(current, m =>
            {
                var condition = m.Groups["cond"].Value.Trim();
                var body = m.Groups["body"].Value;
                var elseBody = m.Groups["else"].Success ? m.Groups["else"].Value : string.Empty;
                return Evaluate(condition, ctx) ? body : elseBody;
            });
            if (next == current) break;
            current = next;
        }
        return current;
    }

    private static bool Evaluate(string condition, IReadOnlyDictionary<string, string> ctx)
    {
        var eq = EqRegex().Match(condition);
        if (eq.Success)
        {
            var key = eq.Groups["key"].Value;
            var value = eq.Groups["value"].Value;
            return string.Equals(ctx.GetValueOrDefault(key), value, StringComparison.Ordinal);
        }
        var raw = ctx.GetValueOrDefault(condition);
        return !string.IsNullOrEmpty(raw) && raw != "false";
    }

    private static string RenderVariables(string source, IReadOnlyDictionary<string, string> ctx)
    {
        var withRaw = RawVarRegex().Replace(source, m => ctx.GetValueOrDefault(m.Groups["key"].Value.Trim()) ?? string.Empty);
        return VarRegex().Replace(withRaw, m => WebUtility.HtmlEncode(ctx.GetValueOrDefault(m.Groups["key"].Value.Trim()) ?? string.Empty));
    }

    [GeneratedRegex(@"\{\{#if\s+(?<cond>[^}]+)\}\}(?<body>((?!\{\{#if)(?!\{\{/if\}\})(?!\{\{else\}\}).)*?)(\{\{else\}\}(?<else>((?!\{\{#if)(?!\{\{/if\}\}).)*?))?\{\{/if\}\}", RegexOptions.Singleline)]
    private static partial Regex IfBlockRegex();

    [GeneratedRegex(@"^\(\s*eq\s+(?<key>[A-Za-z0-9_]+)\s+""(?<value>[^""]*)""\s*\)$")]
    private static partial Regex EqRegex();

    [GeneratedRegex(@"\{\{\{(?<key>[A-Za-z0-9_]+)\}\}\}")]
    private static partial Regex RawVarRegex();

    [GeneratedRegex(@"\{\{(?!#|/|else)(?<key>[A-Za-z0-9_]+)\}\}")]
    private static partial Regex VarRegex();
}
