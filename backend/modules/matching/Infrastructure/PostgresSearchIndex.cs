using System.Diagnostics;
using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Matching.Application;
using Npgsql;
using NpgsqlTypes;

namespace NacenTech.Modules.Matching.Infrastructure;

/// <summary>
/// Chỉ mục tìm kiếm **trong PostgreSQL** — thay Elasticsearch (ADR-0010, D2-26). Bảng chiếu
/// `matching.search_chunks`: mỗi dòng một đoạn, mang vector dense (`pgvector`, cosine, HNSW), vector sparse
/// (`sparsevec`, từ vựng đã học của BGE-M3), và hai `tsvector` sinh sẵn — một qua `unaccent`, một giữ dấu — từ
/// tiêu đề (trọng số A) và đoạn (trọng số B).
///
/// Bốn kênh thu hồi của chế độ đã sửa (§26.6.2), hợp nhất bằng RRF, không cộng điểm thô:
/// 1. **dense** — cosine trên pgvector;
/// 2. **từ khoá** — `phraseto_tsquery` trên chuỗi âm tiết có thứ tự: "công nghệ sinh học" **không** khớp tài liệu có
///    "công nghệ" và "học" rời nhau. Truy vấn có dấu tra trường **có dấu** (giữ phân biệt nghĩa), không dấu tra
///    trường `unaccent` ("cong nghe sinh hoc" khớp "công nghệ sinh học") — chiến lược hai trường của §26.6.6;
/// 3. **exact/trigram** — `ILIKE` xếp theo `word_similarity` (`pg_trgm`): số hiệu bằng sáng chế, mã sản phẩm, tên
///    tổ chức — ca mà kênh sparse *kém*;
/// 4. **sparse** — tích vô hướng trên `sparsevec`, chỉ khi truy vấn có sparse.
///
/// Văn bản vào chỉ mục và truy vấn đều qua <see cref="VietnameseText.Canonical"/> (NFC + một kiểu đặt dấu).
/// Chế độ cũ giữ hình dạng NestJS: cosine **cộng** ts_rank, lọc published/owner SAU top-K ở tầng dịch vụ.
/// Chỉ mục nằm trong cùng giao dịch với nội dung và **không chứa nội dung mật** (D2-143).
/// </summary>
public sealed class PostgresSearchIndex(DbContext db) : ISearchIndex
{
    private const int RrfK = 60;
    private const string Table = "matching.search_chunks";
    /// <summary>Trọng số D,C,B,A cho ts_rank_cd: tiêu đề (A) nặng gấp đôi đoạn (B). Ngoặc nhân đôi vì EF coi SQL thô là format string.</summary>
    private const string Weights = "'{{0.1,0.2,0.5,1.0}}'";

    /// <summary>Bảng do migration tạo, không tạo lúc chạy — schema là việc của migration, không của request.</summary>
    public Task EnsureIndexAsync(CancellationToken ct) => Task.CompletedTask;

    public async Task IndexChunksAsync(IReadOnlyList<IndexedChunk> chunks, CancellationToken ct)
    {
        if (chunks.Count == 0) return;

        const int batchSize = 50;
        for (var offset = 0; offset < chunks.Count; offset += batchSize)
        {
            var batch = chunks.Skip(offset).Take(batchSize).ToList();
            var sqlBuilder = new StringBuilder();
            sqlBuilder.Append($"""
                INSERT INTO {Table}
                    (subject_kind, subject_id, chunk_index, text, embedding, sparse, title, ai_title, sector_ids, sector_names, owner_person_id, is_published)
                VALUES

                """);

            var parameters = new List<NpgsqlParameter>();
            for (var i = 0; i < batch.Count; i++)
            {
                var c = batch[i];
                if (i > 0) sqlBuilder.AppendLine(",");
                sqlBuilder.Append($"(@kind{i}, @id{i}, @idx{i}, @text{i}, @vec{i}::vector, @sparse{i}::sparsevec, @title{i}, @aiTitle{i}, @sectorIds{i}, @sectorNames{i}, @owner{i}, @published{i})");

                parameters.Add(new NpgsqlParameter($"kind{i}", c.Subject.Kind));
                parameters.Add(new NpgsqlParameter($"id{i}", c.Subject.Id));
                parameters.Add(new NpgsqlParameter($"idx{i}", c.ChunkIndex));
                parameters.Add(new NpgsqlParameter($"text{i}", VietnameseText.Canonical(c.Text)));
                parameters.Add(new NpgsqlParameter($"vec{i}", VectorLiteral(c.Embedding)));
                parameters.Add(new NpgsqlParameter($"sparse{i}", NpgsqlDbType.Text) { Value = c.Sparse is { Count: > 0 } ? SparseLiteral(c.Sparse) : DBNull.Value });
                parameters.Add(new NpgsqlParameter($"title{i}", VietnameseText.Canonical(c.Title)));
                parameters.Add(new NpgsqlParameter($"aiTitle{i}", (object?)c.AiTitle ?? DBNull.Value));
                parameters.Add(new NpgsqlParameter($"sectorIds{i}", NpgsqlDbType.Array | NpgsqlDbType.Uuid) { Value = c.SectorIds.ToArray() });
                parameters.Add(new NpgsqlParameter($"sectorNames{i}", NpgsqlDbType.Array | NpgsqlDbType.Text) { Value = c.SectorNames.ToArray() });
                parameters.Add(new NpgsqlParameter($"owner{i}", NpgsqlDbType.Uuid) { Value = (object?)c.OwnerPersonId ?? DBNull.Value });
                parameters.Add(new NpgsqlParameter($"published{i}", c.IsPublished));
            }

            sqlBuilder.Append("""

                ON CONFLICT (subject_kind, subject_id, chunk_index) DO UPDATE SET
                    text = EXCLUDED.text, embedding = EXCLUDED.embedding, sparse = EXCLUDED.sparse, title = EXCLUDED.title, ai_title = EXCLUDED.ai_title,
                    sector_ids = EXCLUDED.sector_ids, sector_names = EXCLUDED.sector_names,
                    owner_person_id = EXCLUDED.owner_person_id, is_published = EXCLUDED.is_published
                """);

            await db.Database.ExecuteSqlRawAsync(sqlBuilder.ToString(), parameters.Cast<object>().ToArray(), ct);
        }
    }

    public Task DeleteSubjectAsync(SubjectRef subject, CancellationToken ct)
        => db.Database.ExecuteSqlRawAsync($"DELETE FROM {Table} WHERE subject_kind = @kind AND subject_id = @id",
            [new NpgsqlParameter("kind", subject.Kind), new NpgsqlParameter("id", subject.Id)], ct);

    public async Task DeleteSubjectsBatchAsync(string subjectKind, IReadOnlyList<Guid> subjectIds, CancellationToken ct)
    {
        if (subjectIds.Count == 0) return;
        await db.Database.ExecuteSqlRawAsync(
            $"DELETE FROM {Table} WHERE subject_kind = @kind AND subject_id = ANY(@ids)",
            [
                new NpgsqlParameter("kind", subjectKind),
                new NpgsqlParameter("ids", NpgsqlDbType.Array | NpgsqlDbType.Uuid) { Value = subjectIds.ToArray() }
            ], ct);
    }

    public async Task<RawSearchResult> SearchAsync(RawSearchRequest request, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var canonical = request with { QueryText = VietnameseText.Canonical(request.QueryText) };
        var hits = canonical.ScoringMode == ScoringModes.Corrected
            ? await CorrectedAsync(canonical, ct)
            : await LegacyAsync(canonical, ct);
        sw.Stop();
        return new RawSearchResult(hits, sw.ElapsedMilliseconds);
    }

    /// <summary>
    /// Parity hình dạng với NestJS: một điểm = cosine **cộng** ts_rank (hai đơn vị khác nhau, không trần); lọc
    /// cứng chỉ gồm kind/sector, còn published/owner lọc SAU khi cắt top-K ở tầng dịch vụ (lỗi §26.6.1 giữ nguyên
    /// có chủ đích để đo baseline). Từ khoá dạng `plainto` (AND các âm tiết, không phải cụm) — cũng là lỗi cũ.
    /// </summary>
    private async Task<List<RawSearchHit>> LegacyAsync(RawSearchRequest request, CancellationToken ct)
    {
        var (where, parameters) = Filters(request, includePublishedAndOwner: false);
        var hasVector = request.QueryVector.Length > 0;
        var dense = hasVector ? "(1 - (embedding <=> @vec::vector))" : "0";
        var sql = $"""
            SELECT {Columns}, ({dense} + ts_rank_cd({Weights}, tsv, plainto_tsquery('simple', matching.immutable_unaccent(@q)))) AS "Score"
            FROM {Table}
            {where}
            ORDER BY "Score" DESC
            LIMIT @limit
            """;
        parameters.Add(new NpgsqlParameter("q", request.QueryText));
        if (hasVector) parameters.Add(new NpgsqlParameter("vec", VectorLiteral(request.QueryVector)));
        parameters.Add(new NpgsqlParameter("limit", request.Size * 3));
        return await QueryAsync(sql, parameters, ct);
    }

    /// <summary>§26.6.2: lọc cứng TRƯỚC mọi thu hồi; các kênh chạy riêng; hợp nhất bằng RRF — không cộng điểm thô.</summary>
    private async Task<List<RawSearchHit>> CorrectedAsync(RawSearchRequest request, CancellationToken ct)
    {
        var (where, parameters) = Filters(request, includePublishedAndOwner: true);
        var and = where.Length == 0 ? "WHERE" : "AND";
        var k = request.Size * 3;
        var channels = new List<IReadOnlyList<RawSearchHit>>();

        if (request.QueryVector.Length > 0)
        {
            var denseSql = $"""
                SELECT {Columns}, (1 - (embedding <=> @vec::vector)) AS "Score"
                FROM {Table}
                {where}
                ORDER BY embedding <=> @vec::vector
                LIMIT @limit
                """;
            channels.Add(await QueryAsync(denseSql, [.. parameters, new NpgsqlParameter("vec", VectorLiteral(request.QueryVector)), new NpgsqlParameter("limit", k)], ct));
        }

        if (!string.IsNullOrWhiteSpace(request.QueryText))
        {
            // Hai trường: truy vấn có dấu → trường có dấu (giữ phân biệt "hòa"/"hoa"); không dấu → trường unaccent.
            var accented = VietnameseText.HasDiacritics(request.QueryText);
            var field = accented ? "tsv_vi" : "tsv";
            var tsquery = accented ? "phraseto_tsquery('simple', @q)" : "phraseto_tsquery('simple', matching.immutable_unaccent(@q))";
            var lexicalSql = $"""
                SELECT {Columns}, ts_rank_cd({Weights}, {field}, {tsquery}) AS "Score"
                FROM {Table}
                {where} {and} {field} @@ {tsquery}
                ORDER BY "Score" DESC
                LIMIT @limit
                """;
            channels.Add(await QueryAsync(lexicalSql, [.. parameters, new NpgsqlParameter("q", request.QueryText), new NpgsqlParameter("limit", k)], ct));

            // Exact/trigram: số hiệu, mã, tên riêng — khớp chuỗi con, xếp theo độ giống trigram.
            var exactSql = $"""
                SELECT {Columns}, GREATEST(word_similarity(@q, title), word_similarity(@q, text)) AS "Score"
                FROM {Table}
                {where} {and} (title ILIKE @like OR text ILIKE @like)
                ORDER BY "Score" DESC
                LIMIT @limit
                """;
            var like = "%" + request.QueryText.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_") + "%";
            channels.Add(await QueryAsync(exactSql, [.. parameters, new NpgsqlParameter("q", request.QueryText), new NpgsqlParameter("like", like), new NpgsqlParameter("limit", k)], ct));
        }

        if (request.QuerySparse is { Count: > 0 })
        {
            var sparseSql = $"""
                SELECT {Columns}, -(sparse <#> @sq::sparsevec) AS "Score"
                FROM {Table}
                {where} {and} sparse IS NOT NULL
                ORDER BY sparse <#> @sq::sparsevec
                LIMIT @limit
                """;
            channels.Add(await QueryAsync(sparseSql, [.. parameters, new NpgsqlParameter("sq", SparseLiteral(request.QuerySparse)), new NpgsqlParameter("limit", k)], ct));
        }

        return ReciprocalRankFusion(channels);
    }

    private static List<RawSearchHit> ReciprocalRankFusion(IReadOnlyList<IReadOnlyList<RawSearchHit>> channels)
    {
        var scores = new Dictionary<string, (RawSearchHit Hit, double Score)>();
        foreach (var list in channels)
        {
            for (var i = 0; i < list.Count; i++)
            {
                var hit = list[i];
                var key = $"{hit.Subject.Id}_{hit.ChunkIndex}";
                var contribution = 1.0 / (RrfK + i + 1);
                scores[key] = scores.TryGetValue(key, out var existing)
                    ? (existing.Hit, existing.Score + contribution)
                    : (hit, contribution);
            }
        }
        return scores.Values.OrderByDescending(v => v.Score).Select(v => v.Hit with { Score = v.Score }).ToList();
    }

    private static (string Where, List<NpgsqlParameter> Parameters) Filters(RawSearchRequest request, bool includePublishedAndOwner)
    {
        var clauses = new List<string>();
        var parameters = new List<NpgsqlParameter>();
        if (!string.IsNullOrEmpty(request.SubjectKind))
        {
            clauses.Add("subject_kind = @kind");
            parameters.Add(new NpgsqlParameter("kind", request.SubjectKind));
        }
        if (request.SectorIds is { Count: > 0 })
        {
            clauses.Add("sector_ids && @sectors");
            parameters.Add(new NpgsqlParameter("sectors", NpgsqlDbType.Array | NpgsqlDbType.Uuid) { Value = request.SectorIds.ToArray() });
        }
        if (includePublishedAndOwner)
        {
            if (request.PublishedOnly) clauses.Add("is_published = TRUE");
            if (request.ExcludeOwnerPersonId is { } owner)
            {
                clauses.Add("(owner_person_id IS NULL OR owner_person_id <> @owner)");
                parameters.Add(new NpgsqlParameter("owner", owner));
            }
        }
        return (clauses.Count == 0 ? string.Empty : "WHERE " + string.Join(" AND ", clauses), parameters);
    }

    private const string Columns = """
        subject_kind AS "SubjectKind", subject_id AS "SubjectId", chunk_index AS "ChunkIndex", text AS "Text",
        title AS "Title", ai_title AS "AiTitle", sector_ids AS "SectorIds", sector_names AS "SectorNames"
        """;

    private async Task<List<RawSearchHit>> QueryAsync(string sql, IReadOnlyList<NpgsqlParameter> parameters, CancellationToken ct)
    {
        var rows = await db.Database.SqlQueryRaw<Row>(sql, parameters.Cast<object>().ToArray()).ToListAsync(ct);
        return rows.Select(r => new RawSearchHit(
            new SubjectRef(r.SubjectKind, r.SubjectId), r.ChunkIndex, r.Text, r.Score, r.Title, r.AiTitle, r.SectorIds, r.SectorNames)).ToList();
    }

    /// <summary>Dạng chữ của pgvector: `[0.1,0.2,…]`. Gửi như text rồi ép kiểu ở SQL — không cần gói NuGet riêng.</summary>
    private static string VectorLiteral(float[] vector)
    {
        var sb = new StringBuilder(vector.Length * 10 + 2).Append('[');
        for (var i = 0; i < vector.Length; i++)
        {
            if (i > 0) sb.Append(',');
            sb.Append(vector[i].ToString("R", CultureInfo.InvariantCulture));
        }
        return sb.Append(']').ToString();
    }

    /// <summary>
    /// Dạng chữ của `sparsevec`: `{i:w,i:w}/dims`, chỉ số **1-based** và tăng dần. Mã token BGE-M3 là 0-based nên
    /// cộng 1. HNSW trên sparsevec chỉ nhận tối đa 1000 phần tử khác 0 — giữ 1000 trọng số lớn nhất; một đoạn
    /// 1500 ký tự hiếm khi vượt, nhưng vượt là lỗi ghi chứ không phải kết quả kém.
    /// </summary>
    internal static string SparseLiteral(IReadOnlyDictionary<int, float> sparse)
    {
        var top = sparse.Where(kv => kv.Key >= 0 && kv.Key < MatchingOptions.SparseDims && kv.Value > 0)
            .OrderByDescending(kv => kv.Value).Take(1000)
            .OrderBy(kv => kv.Key);
        var sb = new StringBuilder().Append('{');
        var first = true;
        foreach (var kv in top)
        {
            if (!first) sb.Append(',');
            first = false;
            sb.Append(kv.Key + 1).Append(':').Append(kv.Value.ToString("R", CultureInfo.InvariantCulture));
        }
        return sb.Append("}/").Append(MatchingOptions.SparseDims).ToString();
    }

    private sealed class Row
    {
        public string SubjectKind { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public int ChunkIndex { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? AiTitle { get; set; }
        public Guid[] SectorIds { get; set; } = [];
        public string[] SectorNames { get; set; } = [];
        public double Score { get; set; }
    }
}
