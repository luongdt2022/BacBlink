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

public sealed class DemandItemSubjectProvider(DbContext db) : ISubjectSummaryProvider, ISubjectContentProvider
{
    public string Kind => SubjectKinds.DemandItem;

    public async Task<SubjectSummary?> GetAsync(Guid id, CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, item_code, stage_name, technical_problem, desired_solution, expected_goal,
                   sector_code, status, is_public_listed, created_by
            FROM demand.demand_items
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
            SELECT id, item_code, stage_name, technical_problem, desired_solution, expected_goal,
                   sector_code, status, is_public_listed, created_by
            FROM demand.demand_items
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
            SELECT id, item_code, stage_name, technical_problem, desired_solution, expected_goal
            FROM demand.demand_items
            WHERE id = @id LIMIT 1";

        var p = cmd.CreateParameter();
        p.ParameterName = "@id";
        p.Value = id;
        cmd.Parameters.Add(p);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return null;

        var itemId = reader.GetGuid(0);
        var itemCode = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
        var stageName = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
        var technicalProblem = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
        var desiredSolution = reader.IsDBNull(4) ? string.Empty : reader.GetString(4);
        var expectedGoal = reader.IsDBNull(5) ? string.Empty : reader.GetString(5);

        var title = string.IsNullOrWhiteSpace(stageName) ? itemCode : $"{itemCode} - {stageName}";
        var body = $"{technicalProblem}\n{desiredSolution}\n{expectedGoal}".Trim();

        return new SubjectContent(SubjectRef.DemandItem(itemId), title, body);
    }

    private static SubjectSummary ReadSummary(DbDataReader reader)
    {
        var id = reader.GetGuid(0);
        var itemCode = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
        var stageName = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
        var technicalProblem = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
        var status = reader.IsDBNull(7) ? string.Empty : reader.GetString(7);
        var isPublicListed = !reader.IsDBNull(8) && reader.GetBoolean(8);
        var createdBy = reader.IsDBNull(9) ? (Guid?)null : reader.GetGuid(9);

        var title = string.IsNullOrWhiteSpace(stageName) ? itemCode : $"{itemCode} - {stageName}";
        var displayTitle = technicalProblem.Length > 100 ? technicalProblem[..100] + "..." : technicalProblem;
        var isPublished = isPublicListed && (status == "VERIFIED" || status == "PUBLISHED" || status == "ACTIVE");

        return new SubjectSummary(
            SubjectRef.DemandItem(id),
            title,
            displayTitle,
            createdBy,
            isPublished,
            Array.Empty<Guid>()
        );
    }
}
