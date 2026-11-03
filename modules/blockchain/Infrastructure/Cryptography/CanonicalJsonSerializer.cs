using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace NacenTech.Modules.Blockchain.Infrastructure.Cryptography;

/// <summary>
/// Triển khai chuẩn hóa JSON đại số Canonical JSON theo RFC 8785 (JSON Canonicalization Scheme - JCS).
/// Đảm bảo tính tất định (Determinism) tuyệt đối: Hai payload JSON có cùng cấu trúc thuộc tính
/// dù sai khác về thứ tự key, khoảng trắng đều sinh ra chuỗi byte UTF-8 và mã băm SHA-256 trùng khớp 100%.
/// </summary>
public static class CanonicalJsonSerializer
{
    private static readonly JsonSerializerOptions DefaultOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public static string Serialize(object value)
    {
        byte[] bytes = SerializeToUtf8Bytes(value);
        return Encoding.UTF8.GetString(bytes);
    }

    public static byte[] SerializeToUtf8Bytes(object value)
    {
        ArgumentNullException.ThrowIfNull(value);

        if (value is JsonElement element)
        {
            return SerializeJsonElementToUtf8Bytes(element);
        }

        if (value is JsonDocument doc)
        {
            return SerializeJsonElementToUtf8Bytes(doc.RootElement);
        }

        if (value is string jsonStr)
        {
            using var parsedDoc = JsonDocument.Parse(jsonStr);
            return SerializeJsonElementToUtf8Bytes(parsedDoc.RootElement);
        }

        using var jsonDoc = JsonSerializer.SerializeToDocument(value, value.GetType(), DefaultOptions);
        return SerializeJsonElementToUtf8Bytes(jsonDoc.RootElement);
    }

    public static byte[] SerializeJsonElementToUtf8Bytes(JsonElement element)
    {
        var sb = new StringBuilder();
        WriteCanonicalElement(element, sb);
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public static string ComputeSha256Hex(object value)
    {
        byte[] bytes = SerializeToUtf8Bytes(value);
        byte[] hash = SHA256.HashData(bytes);
        return "0x" + Convert.ToHexStringLower(hash);
    }

    public static byte[] ComputeSha256(object value)
    {
        byte[] bytes = SerializeToUtf8Bytes(value);
        return SHA256.HashData(bytes);
    }

    private static void WriteCanonicalElement(JsonElement element, StringBuilder sb)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                WriteObject(element, sb);
                break;
            case JsonValueKind.Array:
                WriteArray(element, sb);
                break;
            case JsonValueKind.String:
                WriteString(element.GetString() ?? string.Empty, sb);
                break;
            case JsonValueKind.Number:
                WriteNumber(element, sb);
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
            default:
                throw new InvalidOperationException($"Unsupported JsonValueKind: {element.ValueKind}");
        }
    }

    private static void WriteObject(JsonElement element, StringBuilder sb)
    {
        sb.Append('{');
        var properties = new List<JsonProperty>();
        foreach (var prop in element.EnumerateObject())
        {
            properties.Add(prop);
        }

        // RFC 8785 3.2.3: Sắp xếp theo thứ tự mã byte UTF-8 của tên khóa (UTF-8 code unit lexicographical order)
        properties.Sort((a, b) => CompareUtf8CodeUnits(a.Name, b.Name));

        for (int i = 0; i < properties.Count; i++)
        {
            if (i > 0)
            {
                sb.Append(',');
            }

            WriteString(properties[i].Name, sb);
            sb.Append(':');
            WriteCanonicalElement(properties[i].Value, sb);
        }

        sb.Append('}');
    }

    private static void WriteArray(JsonElement element, StringBuilder sb)
    {
        sb.Append('[');
        int index = 0;
        foreach (var item in element.EnumerateArray())
        {
            if (index > 0)
            {
                sb.Append(',');
            }

            WriteCanonicalElement(item, sb);
            index++;
        }
        sb.Append(']');
    }

    private static void WriteString(string value, StringBuilder sb)
    {
        sb.Append('"');
        foreach (char c in value)
        {
            switch (c)
            {
                case '"':
                    sb.Append("\\\"");
                    break;
                case '\\':
                    sb.Append("\\\\");
                    break;
                case '\b':
                    sb.Append("\\b");
                    break;
                case '\f':
                    sb.Append("\\f");
                    break;
                case '\n':
                    sb.Append("\\n");
                    break;
                case '\r':
                    sb.Append("\\r");
                    break;
                case '\t':
                    sb.Append("\\t");
                    break;
                default:
                    if (c < 0x20)
                    {
                        // Ký tự điều khiển RFC 8785: \u00xx định dạng hex thường
                        sb.Append($"\\u{(int)c:x4}");
                    }
                    else
                    {
                        sb.Append(c);
                    }
                    break;
            }
        }
        sb.Append('"');
    }

    private static void WriteNumber(JsonElement element, StringBuilder sb)
    {
        if (element.TryGetInt64(out long longVal))
        {
            sb.Append(longVal.ToString(CultureInfo.InvariantCulture));
            return;
        }

        if (element.TryGetDecimal(out decimal decVal))
        {
            // Loại trừ -0.0
            if (decVal == 0m)
            {
                sb.Append('0');
                return;
            }

            // Loại bỏ trailing zeros sau dấu thập phân nếu có
            string decStr = (decVal / 1.000000000000000000000000000000000m).ToString(CultureInfo.InvariantCulture);
            sb.Append(decStr);
            return;
        }

        double dblVal = element.GetDouble();
        if (double.IsNaN(dblVal) || double.IsInfinity(dblVal))
        {
            throw new InvalidOperationException("RFC 8785 prohibits NaN and Infinity values.");
        }

        if (dblVal == 0.0)
        {
            sb.Append('0');
            return;
        }

        sb.Append(dblVal.ToString("r", CultureInfo.InvariantCulture));
    }

    private static int CompareUtf8CodeUnits(string a, string b)
    {
        byte[] bytesA = Encoding.UTF8.GetBytes(a);
        byte[] bytesB = Encoding.UTF8.GetBytes(b);

        int minLen = Math.Min(bytesA.Length, bytesB.Length);
        for (int i = 0; i < minLen; i++)
        {
            int cmp = bytesA[i].CompareTo(bytesB[i]);
            if (cmp != 0)
            {
                return cmp;
            }
        }

        return bytesA.Length.CompareTo(bytesB.Length);
    }
}
