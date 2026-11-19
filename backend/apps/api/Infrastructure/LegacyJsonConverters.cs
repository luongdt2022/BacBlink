using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace NacenTech.Api.Infrastructure;

/// <summary>NestJS/JS Date serialize dạng `2026-09-03T12:34:56.789Z`. Giữ đúng dạng này cho replay test khớp byte.</summary>
public sealed class JsDateTimeOffsetConverter : JsonConverter<DateTimeOffset>
{
    public override DateTimeOffset Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => DateTimeOffset.Parse(reader.GetString()!, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal);

    public override void Write(Utf8JsonWriter writer, DateTimeOffset value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture));
}

public sealed class NullableJsDateTimeOffsetConverter : JsonConverter<DateTimeOffset?>
{
    public override DateTimeOffset? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => reader.TokenType == JsonTokenType.Null ? null : DateTimeOffset.Parse(reader.GetString()!, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal);

    public override void Write(Utf8JsonWriter writer, DateTimeOffset? value, JsonSerializerOptions options)
    {
        if (value is null) writer.WriteNullValue();
        else writer.WriteStringValue(value.Value.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture));
    }
}

/// <summary>
/// DEFECT-13: Chuẩn hóa parse tiền tệ Việt Nam.
/// Hỗ trợ cả số nguyên, số thực, chuỗi có dấu chấm phân cách hàng nghìn (1.500.000.000),
/// dấu phẩy phân cách hàng nghìn (1,500,000,000) hoặc dấu phẩy thập phân (1.500.000,50).
/// </summary>
public sealed class VietnameseDecimalJsonConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetDecimal();
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var raw = reader.GetString();
            if (string.IsNullOrWhiteSpace(raw)) return 0m;
            return ParseVietnameseDecimal(raw);
        }

        throw new JsonException($"Không thể chuyển đổi token {reader.TokenType} sang decimal.");
    }

    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
        => writer.WriteNumberValue(value);

    public static decimal ParseVietnameseDecimal(string raw)
    {
        var clean = raw.Trim().Replace(" ", "").Replace("\u00A0", "");

        int lastDot = clean.LastIndexOf('.');
        int lastComma = clean.LastIndexOf(',');

        if (lastDot > -1 && lastComma > -1)
        {
            if (lastDot > lastComma)
            {
                clean = clean.Replace(",", "");
            }
            else
            {
                clean = clean.Replace(".", "").Replace(',', '.');
            }
        }
        else if (lastDot > -1)
        {
            int dotCount = clean.Count(c => c == '.');
            int charsAfterDot = clean.Length - 1 - lastDot;
            if (dotCount > 1 || charsAfterDot == 3)
            {
                clean = clean.Replace(".", "");
            }
        }
        else if (lastComma > -1)
        {
            int commaCount = clean.Count(c => c == ',');
            int charsAfterComma = clean.Length - 1 - lastComma;
            if (commaCount > 1 || charsAfterComma == 3)
            {
                clean = clean.Replace(",", "");
            }
            else
            {
                clean = clean.Replace(',', '.');
            }
        }

        if (decimal.TryParse(clean, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
        {
            return result;
        }

        throw new JsonException($"Chuỗi giá trị '{raw}' không thể phân tích cú pháp thành số thập phân hợp lệ.");
    }
}

public sealed class NullableVietnameseDecimalJsonConverter : JsonConverter<decimal?>
{
    public override decimal? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null) return null;
        if (reader.TokenType == JsonTokenType.Number) return reader.GetDecimal();
        if (reader.TokenType == JsonTokenType.String)
        {
            var raw = reader.GetString();
            if (string.IsNullOrWhiteSpace(raw)) return null;
            return VietnameseDecimalJsonConverter.ParseVietnameseDecimal(raw);
        }
        return null;
    }

    public override void Write(Utf8JsonWriter writer, decimal? value, JsonSerializerOptions options)
    {
        if (value.HasValue) writer.WriteNumberValue(value.Value);
        else writer.WriteNullValue();
    }
}

public static class LegacyJson
{
    public static readonly JsonSerializerOptions Options = Create();

    private static JsonSerializerOptions Create()
    {
        var o = new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.Never,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DictionaryKeyPolicy = null,
        };
        o.Converters.Add(new JsDateTimeOffsetConverter());
        o.Converters.Add(new NullableJsDateTimeOffsetConverter());
        o.Converters.Add(new VietnameseDecimalJsonConverter());
        o.Converters.Add(new NullableVietnameseDecimalJsonConverter());
        return o;
    }
}
