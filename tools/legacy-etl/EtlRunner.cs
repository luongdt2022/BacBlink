using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Content.Application;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Technology.Application;

namespace NacenTech.Tools.LegacyEtl;

/// <summary>
/// ETL một lần từ NacenTwin sang .NET (§30.1/§30.2). Chạy lặp lại được (idempotent theo id legacy)
/// nên diễn tập nhiều lần trên cùng snapshot cho ra cùng kết quả.
/// Thứ tự bắt buộc: taxonomy → users → intakes → attachments/sections → chunks → matches → collaboration → notifications → stories.
/// </summary>
public sealed class EtlRunner(
    IServiceScopeFactory scopes,
    IOptions<EtlOptions> options,
    IObjectStorage storage,
    ILogger<EtlRunner> log)
{
    private readonly EtlOptions _options = options.Value;

    public async Task<ReconciliationReport> RunAsync(CancellationToken ct)
    {
        var batchId = Guid.CreateVersion7();
        var report = new ReconciliationReport
        {
            BatchId = batchId.ToString(),
            StartedAt = DateTimeOffset.UtcNow,
            SourceConnection = Redact(_options.SourceConnectionString),
            MappingVersion = _options.MappingVersion,
        };

        await using var source = new LegacyReader(_options.SourceConnectionString);

        await ImportTaxonomyAsync(source, report, batchId, "sectors", TaxonomyKinds.Sector, ct);
        await ImportTaxonomyAsync(source, report, batchId, "categories", TaxonomyKinds.Category, ct);
        await ImportUsersAsync(source, report, batchId, ct);
        await ImportIntakesAsync(source, report, batchId, ct);
        await ImportAttachmentsAsync(source, report, batchId, ct);
        await ImportConfidentialSectionsAsync(source, report, batchId, ct);
        await ImportChunksAsync(source, report, batchId, ct);
        await ImportMatchesAsync(source, report, batchId, ct);
        await ImportCollaborationRequestsAsync(source, report, batchId, ct);
        await ImportNotificationsAsync(source, report, batchId, ct);
        await ImportStoriesAsync(source, report, batchId, ct);

        report.CompletedAt = DateTimeOffset.UtcNow;
        return report;
    }

    // ─── Taxonomy ───────────────────────────────────────────────────────────────────────────

    private async Task ImportTaxonomyAsync(LegacyReader source, ReconciliationReport report, Guid batchId, string table, string kind, CancellationToken ct)
    {
        var line = report.Table(table, $"policy.TaxonomyTerm({kind})");
        if (!await source.TableExistsAsync(table, ct))
        {
            log.LogWarning("Bảng {Table} không tồn tại ở nguồn — bỏ qua", table);
            return;
        }
        line.SourceCount = await source.CountAsync(table, null, ct);

        await foreach (var row in source.QueryAsync($"SELECT id, name, is_active FROM {table}", ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var name = row.GetString(row.GetOrdinal("name"));
            var isActive = !row.IsDBNull(row.GetOrdinal("is_active")) && row.GetBoolean(row.GetOrdinal("is_active"));
            var hash = Hash(id, name, isActive);
            await ImportOneAsync(line, id.ToString(), async sp =>
            {
                var importer = sp.GetRequiredService<ITaxonomyImporter>();
                await importer.ImportTermAsync(new LegacyTaxonomyImport(id, kind, name, isActive, Legacy(table, id.ToString(), hash, batchId)), ct);
            });
        }

        await CountTargetAsync(line, async sp => await sp.GetRequiredService<ITaxonomyImporter>().CountAsync(kind, ct));
    }

    // ─── Users ──────────────────────────────────────────────────────────────────────────────

    private async Task ImportUsersAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("users", "identity.Person");
        line.SourceCount = await source.CountAsync("users", null, ct);

        var hasSettings = await source.TableExistsAsync("user_settings", ct);
        var sql = hasSettings
            ? """
              SELECT u.id, u.email, u.password, u.previous_password_hash, u.first_name, u.last_name, u.phone,
                     u.organization, u.role, u.is_active, u.created_at, u.updated_at,
                     COALESCE(s.matching_auto, false) AS matching_auto
                FROM users u LEFT JOIN user_settings s ON s.user_id = u.id
              """
            : """
              SELECT u.id, u.email, u.password, u.previous_password_hash, u.first_name, u.last_name, u.phone,
                     u.organization, u.role, u.is_active, u.created_at, u.updated_at, false AS matching_auto
                FROM users u
              """;

        await foreach (var row in source.QueryAsync(sql, ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var email = row.GetString(row.GetOrdinal("email"));
            var password = row.GetString(row.GetOrdinal("password"));

            // §30.3: bản ghi không map được rõ ràng đi vào review queue, không đoán.
            if (!password.StartsWith("$2", StringComparison.Ordinal))
            {
                report.Review("users", id.ToString(), "password hash không phải bcrypt — không import được credential (D2-150)");
                line.Skipped++;
                continue;
            }

            var import = new LegacyUserImport(
                id, email, password, row.GetStringOrNull("previous_password_hash"),
                row.GetStringOrNull("first_name"), row.GetStringOrNull("last_name"), row.GetStringOrNull("phone"),
                row.GetStringOrNull("organization"), row.GetString(row.GetOrdinal("role")),
                row.GetBoolean(row.GetOrdinal("is_active")), row.GetBoolean(row.GetOrdinal("matching_auto")),
                row.GetTimestamp("created_at"), row.GetTimestamp("updated_at"),
                Legacy("users", id.ToString(), Hash(id, email, password), batchId));

            await ImportOneAsync(line, id.ToString(), async sp =>
                await sp.GetRequiredService<IIdentityImporter>().ImportPersonAsync(import, ct));
        }

        await CountTargetAsync(line, async sp => await sp.GetRequiredService<IIdentityImporter>().CountPersonsAsync(ct));
    }

    // ─── Intakes → demand / technology ──────────────────────────────────────────────────────

    private async Task ImportIntakesAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var demandLine = report.Table("intakes(type=challenge)", "demand.DemandBrief");
        var techLine = report.Table("intakes(type=ip)", "technology.TechnologyAsset");
        demandLine.SourceCount = await source.CountAsync("intakes", "type = 'challenge'", ct);
        techLine.SourceCount = await source.CountAsync("intakes", "type = 'ip'", ct);

        const string sql = """
            SELECT i.id, i.title, i."aiProcessTitle" AS ai_process_title, i.content, i.ai_processed_content,
                   i.ai_processing_status, i.ai_chunking_status, i.status, i.type, i.user_id, i.category_id,
                   i.created_at, i.updated_at, i.deleted_at,
                   COALESCE(ARRAY_AGG(s."sectorId") FILTER (WHERE s."sectorId" IS NOT NULL), '{}') AS sector_ids
              FROM intakes i
              LEFT JOIN intake_sectors s ON s."intakeId" = i.id
             GROUP BY i.id
            """;

        await foreach (var row in source.QueryAsync(sql, ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var type = row.GetString(row.GetOrdinal("type"));
            var title = row.GetString(row.GetOrdinal("title"));
            var content = row.GetStringOrNull("content");
            var status = row.GetString(row.GetOrdinal("status")).Equals("published", StringComparison.OrdinalIgnoreCase)
                ? DemandStatuses.Published : DemandStatuses.Draft;
            var sectorIds = row.GetFieldValue<Guid[]>(row.GetOrdinal("sector_ids")).ToList();
            var legacy = Legacy("intakes", id.ToString(), Hash(id, title, content ?? string.Empty), batchId);
            var line = type == "challenge" ? demandLine : techLine;

            if (type == "challenge")
            {
                var import = new LegacyDemandImport(id, row.GetGuidOrNull("user_id"), title, content,
                    row.GetStringOrNull("ai_process_title"), row.GetStringOrNull("ai_processed_content"),
                    Upper(row.GetStringOrNull("ai_processing_status")), Upper(row.GetStringOrNull("ai_chunking_status")),
                    status, sectorIds, row.GetGuidOrNull("category_id"),
                    row.GetTimestamp("created_at"), row.GetTimestamp("updated_at"), row.GetTimestampOrNull("deleted_at"), legacy);
                await ImportOneAsync(line, id.ToString(), async sp =>
                    await sp.GetRequiredService<IDemandImporter>().ImportAsync(import, ct));
            }
            else if (type == "ip")
            {
                var import = new LegacyTechnologyImport(id, row.GetGuidOrNull("user_id"), title, content,
                    row.GetStringOrNull("ai_process_title"), row.GetStringOrNull("ai_processed_content"),
                    Upper(row.GetStringOrNull("ai_processing_status")), Upper(row.GetStringOrNull("ai_chunking_status")),
                    status, sectorIds, row.GetGuidOrNull("category_id"),
                    row.GetTimestamp("created_at"), row.GetTimestamp("updated_at"), row.GetTimestampOrNull("deleted_at"), legacy);
                await ImportOneAsync(line, id.ToString(), async sp =>
                    await sp.GetRequiredService<ITechnologyImporter>().ImportAsync(import, ct));
            }
            else
            {
                report.Review("intakes", id.ToString(), $"type '{type}' không nằm trong ip|challenge");
            }
        }

        await CountTargetAsync(demandLine, async sp => await sp.GetRequiredService<IDemandImporter>().CountAsync(ct));
        await CountTargetAsync(techLine, async sp => await sp.GetRequiredService<ITechnologyImporter>().CountAsync(ct));
    }

    // ─── Attachments → data room ────────────────────────────────────────────────────────────

    private async Task ImportAttachmentsAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("intake_attachments", "dataroom.Document(FILE)");
        line.SourceCount = await source.CountAsync("intake_attachments", null, ct);

        const string sql = """
            SELECT a.id, a.intake_id, a.file_name, a.file_path, a.file_type, a.mime_type, a.file_size,
                   a.confidential_level, a.created_at, i.type AS intake_type, i.user_id
              FROM intake_attachments a JOIN intakes i ON i.id = a.intake_id
            """;

        await foreach (var row in source.QueryAsync(sql, ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var intakeId = row.GetGuid(row.GetOrdinal("intake_id"));
            var intakeType = row.GetString(row.GetOrdinal("intake_type"));
            var subject = intakeType == "challenge" ? SubjectRef.Demand(intakeId) : SubjectRef.Technology(intakeId);
            var filePath = row.GetString(row.GetOrdinal("file_path"));
            var fileName = row.GetString(row.GetOrdinal("file_name"));
            var classification = DataClassificationExtensions.FromLegacyLevel(row.GetStringOrNull("confidential_level"));

            var copied = await CopyFileAsync(filePath, fileName, row.GetStringOrNull("mime_type"), ct);
            if (copied is null)
            {
                // §30.3: file thiếu hash/classification không vào data room confidential.
                report.Review("intake_attachments", id.ToString(), $"không tìm thấy file nguồn cho '{filePath}'");
                line.Skipped++;
                continue;
            }

            var import = new LegacyAttachmentImport(id, subject, row.GetGuidOrNull("user_id"), fileName, copied.Key,
                copied.ContentType, copied.Size, copied.Sha256, row.GetString(row.GetOrdinal("file_type")), classification,
                row.GetTimestamp("created_at"), Legacy("intake_attachments", id.ToString(), copied.Sha256, batchId));

            await ImportOneAsync(line, id.ToString(), async sp =>
                await sp.GetRequiredService<IDataRoomImporter>().ImportAttachmentAsync(import, ct));
        }

        await CountTargetAsync(line, async sp =>
            await sp.GetRequiredService<IDataRoomImporter>().CountDocumentsAsync(DocumentKinds.File, ct)
            + await sp.GetRequiredService<IDataRoomImporter>().CountDocumentsAsync(DocumentKinds.ProfilePicture, ct));
    }

    private async Task ImportConfidentialSectionsAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("intakes(confidential text)", "dataroom.Document(TEXT_SECTION)");

        const string sql = """
            SELECT id, type, user_id, created_at,
                   confidential_level_2_content, confidential_level_2_ai_processed_content,
                   confidential_level_3_content, confidential_level_3_ai_processed_content
              FROM intakes
             WHERE confidential_level_2_content IS NOT NULL
                OR confidential_level_2_ai_processed_content IS NOT NULL
                OR confidential_level_3_content IS NOT NULL
                OR confidential_level_3_ai_processed_content IS NOT NULL
            """;

        await foreach (var row in source.QueryAsync(sql, ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var subject = row.GetString(row.GetOrdinal("type")) == "challenge" ? SubjectRef.Demand(id) : SubjectRef.Technology(id);
            var owner = row.GetGuidOrNull("user_id");
            var createdAt = row.GetTimestamp("created_at");

            var sections = new (string Code, string? Text)[]
            {
                (TextSections.Level2Content, row.GetStringOrNull("confidential_level_2_content")),
                (TextSections.Level2AiProcessedContent, row.GetStringOrNull("confidential_level_2_ai_processed_content")),
                (TextSections.Level3Content, row.GetStringOrNull("confidential_level_3_content")),
                (TextSections.Level3AiProcessedContent, row.GetStringOrNull("confidential_level_3_ai_processed_content")),
            };

            foreach (var (code, text) in sections)
            {
                if (string.IsNullOrEmpty(text)) continue;
                line.SourceCount++;
                var import = new LegacyTextSectionImport(subject, owner, code, text, createdAt,
                    Legacy("intakes", $"{id}:{code}", Sha256(text), batchId));
                await ImportOneAsync(line, $"{id}:{code}", async sp =>
                    await sp.GetRequiredService<IDataRoomImporter>().ImportTextSectionAsync(import, ct));
            }
        }

        await CountTargetAsync(line, async sp =>
            await sp.GetRequiredService<IDataRoomImporter>().CountDocumentsAsync(DocumentKinds.TextSection, ct));
    }

    // ─── Chunks và matches ──────────────────────────────────────────────────────────────────

    private async Task ImportChunksAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("intake_chunks", "matching.ContentChunk");
        if (!await source.TableExistsAsync("intake_chunks", ct)) return;
        line.SourceCount = await source.CountAsync("intake_chunks", null, ct);

        const string sql = """
            SELECT c.id, c.intake_id, c.index, c.text, c.embedding, c.created_at, i.type AS intake_type
              FROM intake_chunks c JOIN intakes i ON i.id = c.intake_id
            """;

        await foreach (var row in source.QueryAsync(sql, ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var intakeId = row.GetGuid(row.GetOrdinal("intake_id"));
            var subject = row.GetString(row.GetOrdinal("intake_type")) == "challenge"
                ? SubjectRef.Demand(intakeId) : SubjectRef.Technology(intakeId);
            var embedding = row.GetFieldValue<double[]>(row.GetOrdinal("embedding")).Select(v => (float)v).ToArray();
            var text = row.GetString(row.GetOrdinal("text"));

            var import = new LegacyChunkImport(id, subject, row.GetInt32(row.GetOrdinal("index")), text, embedding,
                row.GetTimestamp("created_at"), Legacy("intake_chunks", id.ToString(), Sha256(text), batchId));

            await ImportOneAsync(line, id.ToString(), async sp =>
                await sp.GetRequiredService<IMatchingImporter>().ImportChunkAsync(import, ct));
        }

        await CountTargetAsync(line, async sp => await sp.GetRequiredService<IMatchingImporter>().CountChunksAsync(ct));
    }

    private async Task ImportMatchesAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("intake_matches", "matching.MatchCandidate");
        if (!await source.TableExistsAsync("intake_matches", ct)) return;
        line.SourceCount = await source.CountAsync("intake_matches", null, ct);

        const string sql = """
            SELECT id, ip_intake_id, challenge_intake_id, score, matched_chunk, chunk_index, computed_at, updated_at
              FROM intake_matches
            """;

        var bySubject = new Dictionary<SubjectRef, List<LegacyMatchImport>>();
        await foreach (var row in source.QueryAsync(sql, ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var ipId = row.GetGuid(row.GetOrdinal("ip_intake_id"));
            var challengeId = row.GetGuid(row.GetOrdinal("challenge_intake_id"));
            var matchedChunk = row.GetString(row.GetOrdinal("matched_chunk"));
            var import = new LegacyMatchImport(id, ipId, challengeId,
                row.GetDouble(row.GetOrdinal("score")), matchedChunk, row.GetInt32(row.GetOrdinal("chunk_index")),
                row.GetTimestamp("computed_at"), row.GetTimestamp("updated_at"),
                Legacy("intake_matches", id.ToString(), Sha256(matchedChunk), batchId));

            // Một hàng legacy xuất hiện ở round của cả hai phía (§30.1).
            Add(SubjectRef.Technology(ipId), import);
            Add(SubjectRef.Demand(challengeId), import);
        }

        foreach (var (subject, matches) in bySubject)
        {
            await ImportOneAsync(line, subject.ToString(), async sp =>
                await sp.GetRequiredService<IMatchingImporter>().ImportRoundAsync(subject, matches, ct), countAsImported: matches.Count);
        }

        await CountTargetAsync(line, async sp => await sp.GetRequiredService<IMatchingImporter>().CountCandidatesAsync(ct));
        // Mỗi hàng legacy tạo hai candidate (một cho mỗi phía) — nhân đôi để đối soát đúng.
        line.SourceCount *= 2;

        void Add(SubjectRef subject, LegacyMatchImport import)
        {
            if (!bySubject.TryGetValue(subject, out var list)) bySubject[subject] = list = [];
            list.Add(import);
        }
    }

    // ─── Collaboration, notification, stories ───────────────────────────────────────────────

    private async Task ImportCollaborationRequestsAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("collaboration_requests", "communication.CaseInvitation");
        if (!await source.TableExistsAsync("collaboration_requests", ct)) return;
        line.SourceCount = await source.CountAsync("collaboration_requests", null, ct);

        const string sql = """
            SELECT c.id, c.requester_intake_id, c.target_intake_id, c.requester_user_id, c.target_user_id,
                   c.status, c.message, c.created_at, c.updated_at,
                   ri.type AS requester_type, ti.type AS target_type
              FROM collaboration_requests c
              JOIN intakes ri ON ri.id = c.requester_intake_id
              JOIN intakes ti ON ti.id = c.target_intake_id
            """;

        await foreach (var row in source.QueryAsync(sql, ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var status = row.GetString(row.GetOrdinal("status"));
            var import = new LegacyCollaborationRequestImport(id,
                Subject(row.GetString(row.GetOrdinal("requester_type")), row.GetGuid(row.GetOrdinal("requester_intake_id"))),
                Subject(row.GetString(row.GetOrdinal("target_type")), row.GetGuid(row.GetOrdinal("target_intake_id"))),
                row.GetGuid(row.GetOrdinal("requester_user_id")), row.GetGuid(row.GetOrdinal("target_user_id")),
                status, row.GetStringOrNull("message"), row.GetTimestamp("created_at"), row.GetTimestamp("updated_at"),
                Legacy("collaboration_requests", id.ToString(), Hash(id, status, string.Empty), batchId));

            // §30.3: request còn PENDING tại cutover cần owner xử lý vì workflow cũ không còn tồn tại.
            if (status.Equals("pending", StringComparison.OrdinalIgnoreCase))
                report.Review("collaboration_requests", id.ToString(), "còn PENDING tại cutover — cần owner xử lý trước khi mở lại hệ thống");

            await ImportOneAsync(line, id.ToString(), async sp =>
                await sp.GetRequiredService<ICommunicationImporter>().ImportInvitationAsync(import, ct));
        }

        await CountTargetAsync(line, async sp => await sp.GetRequiredService<ICommunicationImporter>().CountInvitationsAsync(ct));
    }

    private async Task ImportNotificationsAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("notifications", "communication.Notification");
        if (!await source.TableExistsAsync("notifications", ct)) return;
        line.SourceCount = await source.CountAsync("notifications", null, ct);

        await foreach (var row in source.QueryAsync("SELECT id, user_id, type, payload, is_read, created_at FROM notifications", ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var payload = row.GetString(row.GetOrdinal("payload"));
            var import = new LegacyNotificationImport(id, row.GetGuid(row.GetOrdinal("user_id")),
                row.GetString(row.GetOrdinal("type")), payload, row.GetBoolean(row.GetOrdinal("is_read")),
                row.GetTimestamp("created_at"), Legacy("notifications", id.ToString(), Sha256(payload), batchId));

            await ImportOneAsync(line, id.ToString(), async sp =>
                await sp.GetRequiredService<ICommunicationImporter>().ImportNotificationAsync(import, ct));
        }

        await CountTargetAsync(line, async sp => await sp.GetRequiredService<ICommunicationImporter>().CountNotificationsAsync(ct));
    }

    private async Task ImportStoriesAsync(LegacyReader source, ReconciliationReport report, Guid batchId, CancellationToken ct)
    {
        var line = report.Table("stories", "content.Story");
        if (!await source.TableExistsAsync("stories", ct)) return;
        line.SourceCount = await source.CountAsync("stories", null, ct);

        await foreach (var row in source.QueryAsync(
            "SELECT id, author_id, title, type, content, lesson, status, is_hidden, created_at, updated_at FROM stories", ct))
        {
            var id = row.GetGuid(row.GetOrdinal("id"));
            var title = row.GetString(row.GetOrdinal("title"));
            var content = row.GetString(row.GetOrdinal("content"));
            var import = new LegacyStoryImport(id, row.GetGuid(row.GetOrdinal("author_id")), title,
                row.GetString(row.GetOrdinal("type")), content, row.GetStringOrNull("lesson"),
                row.GetString(row.GetOrdinal("status")), row.GetBoolean(row.GetOrdinal("is_hidden")),
                row.GetTimestamp("created_at"), row.GetTimestamp("updated_at"),
                Legacy("stories", id.ToString(), Hash(id, title, content), batchId));

            await ImportOneAsync(line, id.ToString(), async sp =>
                await sp.GetRequiredService<IContentImporter>().ImportStoryAsync(import, ct));
        }

        await CountTargetAsync(line, async sp => await sp.GetRequiredService<IContentImporter>().CountAsync(ct));
    }

    // ─── Hạ tầng ────────────────────────────────────────────────────────────────────────────

    private async Task ImportOneAsync(TableReconciliation line, string legacyId, Func<IServiceProvider, Task> action, int countAsImported = 1)
    {
        if (_options.DryRun)
        {
            line.Imported += countAsImported;
            return;
        }
        try
        {
            using var scope = scopes.CreateScope();
            await action(scope.ServiceProvider);
            line.Imported += countAsImported;
        }
        catch (Exception ex)
        {
            line.Fail(legacyId, ex);
            log.LogError(ex, "Import lỗi {Table} {LegacyId}", line.SourceTable, legacyId);
        }
    }

    private async Task CountTargetAsync(TableReconciliation line, Func<IServiceProvider, Task<int>> count)
    {
        if (_options.DryRun) return;
        using var scope = scopes.CreateScope();
        line.TargetCount = await count(scope.ServiceProvider);
    }

    /// <summary>Copy file từ `uploads/` sang object storage; trả null nếu không tìm thấy file nguồn.</summary>
    private async Task<StoredObject?> CopyFileAsync(string legacyPath, string fileName, string? mimeType, CancellationToken ct)
    {
        if (_options.SkipFiles) return new StoredObject(legacyPath, fileName, mimeType ?? "application/octet-stream", 0, Sha256(legacyPath));

        var relative = legacyPath;
        if (relative.StartsWith(_options.LegacyPublicBaseUrl, StringComparison.OrdinalIgnoreCase))
            relative = relative[_options.LegacyPublicBaseUrl.Length..];
        relative = relative.TrimStart('/');
        if (relative.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase)) relative = relative["uploads/".Length..];

        var full = Path.Combine(_options.LegacyUploadsPath, relative.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(full)) return null;

        var folder = Path.GetDirectoryName(relative)?.Replace(Path.DirectorySeparatorChar, '/') ?? "intakes";
        await using var stream = File.OpenRead(full);
        return await storage.PutAsync(stream, string.IsNullOrEmpty(folder) ? "intakes" : folder, fileName, mimeType ?? "application/octet-stream", ct);
    }

    private LegacyRef Legacy(string table, string legacyId, string hash, Guid batchId)
        => new(LegacyRef.NacenTwin, table, legacyId, hash, DateTimeOffset.UtcNow, _options.MappingVersion, batchId);

    private static SubjectRef Subject(string type, Guid id)
        => type == "challenge" ? SubjectRef.Demand(id) : SubjectRef.Technology(id);

    private static string? Upper(string? value) => value?.ToUpperInvariant();

    private static string Sha256(string text) => Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(text)));

    private static string Hash(params object[] parts) => Sha256(JsonSerializer.Serialize(parts));

    private static string Redact(string connectionString)
        => System.Text.RegularExpressions.Regex.Replace(connectionString, "(?i)(password|pwd)=[^;]*", "$1=***");
}
