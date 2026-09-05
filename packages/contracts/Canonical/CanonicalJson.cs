using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace NacenTech.Contracts.Canonical;

/// <summary>
/// RFC 8785 JSON Canonicalization Scheme (D2-23, §16.4). Dùng cho documentHash / packageHash / sourceHash.
/// `canonicalizationVersion` = "JCS-1" đi kèm mọi hash để tái tính sau nhiều năm.
/// </summary>
public static class CanonicalJson
{
    public const string Version = "JCS-1";

    public static string Canonicalize(JsonElement element)
    {
        var sb = new StringBuilder();
        Write(element, sb);
        return sb.ToString();
    }

    public static string Canonicalize(string json)
    {
        using var doc = JsonDocument.Parse(json);
        return Canonicalize(doc.RootElement);
    }

    public static string Canonicalize<T>(T value, JsonSerializerOptions? options = null)
    {
        var json = JsonSerializer.Serialize(value, options ?? DefaultOptions);
        return Canonicalize(json);
    }

    public static string Sha256Hex(string canonical)
        => Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(canonical)));

    public static string Hash<T>(T value, JsonSerializerOptions? options = null) => Sha256Hex(Canonicalize(value, options));

    public static readonly JsonSerializerOptions DefaultOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = false,
    };

    private static void Write(JsonElement el, StringBuilder sb)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                sb.Append('{');
                var first = true;
                // RFC 8785: sort by UTF-16 code units of the property name.
                foreach (var prop in el.EnumerateObject().OrderBy(p => p.Name, StringComparer.Ordinal))
                {
                    if (!first) sb.Append(',');
                    first = false;
                    WriteString(prop.Name, sb);
                    sb.Append(':');
                    Write(prop.Value, sb);
                }
                sb.Append('}');
                break;
            case JsonValueKind.Array:
                sb.Append('[');
                var firstItem = true;
                foreach (var item in el.EnumerateArray())
                {
                    if (!firstItem) sb.Append(',');
                    firstItem = false;
                    Write(item, sb);
                }
                sb.Append(']');
                break;
            case JsonValueKind.String:
                WriteString(el.GetString()!, sb);
                break;
            case JsonValueKind.Number:
                sb.Append(FormatNumber(el));
                break;
            case JsonValueKind.True:
                sb.Append("true");
                break;
            case JsonValueKind.False:
                sb.Append("false");
                break;
            case JsonValueKind.Null:
            case JsonValueKind.Undefined:
                sb.Append("null");
                break;
        }
    }

    private static string FormatNumber(JsonElement el)
    {
        // RFC 8785 dùng ES6 Number::toString. Số nguyên trong long giữ nguyên; số thực dùng "R" shortest round-trip.
        if (el.TryGetInt64(out var l)) return l.ToString(CultureInfo.InvariantCulture);
        var d = el.GetDouble();
        if (double.IsNaN(d) || double.IsInfinity(d)) throw new InvalidOperationException("JCS không cho phép NaN/Infinity");
        if (d == 0) return "0";
        var s = d.ToString("R", CultureInfo.InvariantCulture);
        // ES6 dùng chữ thường 'e' và bỏ '+' trong mũ: 1e21 chứ không phải 1E+21
        if (s.Contains('E'))
        {
            var parts = s.Split('E');
            var exp = int.Parse(parts[1], CultureInfo.InvariantCulture);
            s = parts[0] + "e" + (exp >= 0 ? "+" : "-") + Math.Abs(exp).ToString(CultureInfo.InvariantCulture);
            s = s.Replace("e+", "e+");
        }
        return s;
    }

    private static void WriteString(string s, StringBuilder sb)
    {
        sb.Append('"');
        foreach (var c in s)
        {
            switch (c)
            {
                case '"': sb.Append("\\\""); break;
                case '\\': sb.Append("\\\\"); break;
                case '\b': sb.Append("\\b"); break;
                case '\f': sb.Append("\\f"); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': sb.Append("\\r"); break;
                case '\t': sb.Append("\\t"); break;
                default:
                    if (c < 0x20) sb.Append("\\u").Append(((int)c).ToString("x4", CultureInfo.InvariantCulture));
                    else sb.Append(c);
                    break;
            }
        }
        sb.Append('"');
    }
}
