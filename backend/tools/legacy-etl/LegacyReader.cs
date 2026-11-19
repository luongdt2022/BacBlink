using Npgsql;

namespace NacenTech.Tools.LegacyEtl;

/// <summary>
/// Đọc trực tiếp PostgreSQL của NacenTwin. Chỉ SELECT — không có đường ghi ngược (§30.2 quy tắc 3).
/// Tên cột lấy đúng theo TypeORM entity của NestJS.
/// </summary>
public sealed class LegacyReader(string connectionString) : IAsyncDisposable
{
    private NpgsqlConnection? _connection;

    private async Task<NpgsqlConnection> OpenAsync(CancellationToken ct)
    {
        if (_connection is null)
        {
            _connection = new NpgsqlConnection(connectionString);
            await _connection.OpenAsync(ct);
        }
        return _connection;
    }

    public async Task<int> CountAsync(string table, string? where, CancellationToken ct)
    {
        var conn = await OpenAsync(ct);
        var sql = $"SELECT COUNT(*) FROM {table}" + (where is null ? string.Empty : $" WHERE {where}");
        await using var cmd = new NpgsqlCommand(sql, conn);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
    }

    public async IAsyncEnumerable<NpgsqlDataReader> QueryAsync(string sql, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        var conn = await OpenAsync(ct);
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.CommandTimeout = 600;
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) yield return reader;
    }

    /// <summary>Kiểm tra bảng có tồn tại không (schema NacenTwin đổi theo migration nào đã chạy).</summary>
    public async Task<bool> TableExistsAsync(string table, CancellationToken ct)
    {
        var conn = await OpenAsync(ct);
        await using var cmd = new NpgsqlCommand(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=@t)", conn);
        cmd.Parameters.AddWithValue("t", table);
        return (bool)(await cmd.ExecuteScalarAsync(ct))!;
    }

    public async ValueTask DisposeAsync()
    {
        if (_connection is not null) await _connection.DisposeAsync();
    }
}

public static class ReaderExtensions
{
    public static string? GetStringOrNull(this NpgsqlDataReader r, string column)
    {
        var i = r.GetOrdinal(column);
        return r.IsDBNull(i) ? null : r.GetString(i);
    }

    public static Guid? GetGuidOrNull(this NpgsqlDataReader r, string column)
    {
        var i = r.GetOrdinal(column);
        return r.IsDBNull(i) ? null : r.GetGuid(i);
    }

    public static long? GetInt64OrNull(this NpgsqlDataReader r, string column)
    {
        var i = r.GetOrdinal(column);
        return r.IsDBNull(i) ? null : r.GetInt64(i);
    }

    public static DateTimeOffset GetTimestamp(this NpgsqlDataReader r, string column)
    {
        var i = r.GetOrdinal(column);
        var value = r.GetFieldValue<DateTime>(i);
        return new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc));
    }

    public static DateTimeOffset? GetTimestampOrNull(this NpgsqlDataReader r, string column)
    {
        var i = r.GetOrdinal(column);
        if (r.IsDBNull(i)) return null;
        var value = r.GetFieldValue<DateTime>(i);
        return new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc));
    }

    public static bool HasColumn(this NpgsqlDataReader r, string column)
    {
        for (var i = 0; i < r.FieldCount; i++)
        {
            if (string.Equals(r.GetName(i), column, StringComparison.OrdinalIgnoreCase)) return true;
        }
        return false;
    }
}
