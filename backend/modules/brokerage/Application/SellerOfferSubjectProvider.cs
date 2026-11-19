using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Brokerage.Application;

public sealed class SellerOfferSubjectProvider(DbContext db) : ISubjectSummaryProvider, ISubjectContentProvider
{
    public string Kind => SubjectKinds.SellerOffer;

    public async Task<SubjectSummary?> GetAsync(Guid id, CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, offer_code, title, summary, problem_solved, sector_code, trl_level, ip_status, status, created_by, deleted_at
            FROM technology.seller_technology_offers
            WHERE id = @id LIMIT 1";

        var p = cmd.CreateParameter();
        p.ParameterName = "@id";
        p.Value = id;
        cmd.Parameters.Add(p);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return null;

        return ReadSummary(reader);
    }

    public async Task<IReadOnlyDictionary<Guid, SubjectSummary>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, SubjectSummary>();

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, offer_code, title, summary, problem_solved, sector_code, trl_level, ip_status, status, created_by, deleted_at
            FROM technology.seller_technology_offers
            WHERE id = ANY(@ids)";

        var p = cmd.CreateParameter();
        p.ParameterName = "@ids";
        p.Value = new List<Guid>(ids).ToArray();
        cmd.Parameters.Add(p);

        var dict = new Dictionary<Guid, SubjectSummary>();
        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            var summary = ReadSummary(reader);
            dict[summary.Ref.Id] = summary;
        }

        return dict;
    }

    async Task<SubjectContent?> ISubjectContentProvider.GetAsync(Guid id, CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, title, summary, problem_solved
            FROM technology.seller_technology_offers
            WHERE id = @id LIMIT 1";

        var p = cmd.CreateParameter();
        p.ParameterName = "@id";
        p.Value = id;
        cmd.Parameters.Add(p);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return null;

        var offerId = reader.GetGuid(0);
        var title = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
        var summary = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
        var problemSolved = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);

        var body = $"{summary}\n{problemSolved}".Trim();

        return new SubjectContent(SubjectRef.SellerOffer(offerId), title, body);
    }

    private static SubjectSummary ReadSummary(DbDataReader reader)
    {
        var id = reader.GetGuid(0);
        var title = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
        var status = reader.IsDBNull(8) ? string.Empty : reader.GetString(8);
        var createdBy = reader.IsDBNull(9) ? (Guid?)null : reader.GetGuid(9);
        var isDeleted = !reader.IsDBNull(10);

        var isPublished = (string.Equals(status, "APPROVED", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(status, "PUBLISHED", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(status, "ACTIVE", StringComparison.OrdinalIgnoreCase)) && !isDeleted;

        return new SubjectSummary(
            SubjectRef.SellerOffer(id),
            title,
            title,
            createdBy,
            isPublished,
            Array.Empty<Guid>()
        );
    }
}
