using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Lms.Domain;
using Npgsql;
using NpgsqlTypes;

namespace NacenTech.Modules.Lms.Application;

public interface ILmsRagIndexer
{
    Task IndexMaterialAsync(Guid materialId, CancellationToken ct = default);
    Task RemoveMaterialIndexAsync(Guid materialId, CancellationToken ct = default);
}

public sealed partial class LmsRagIndexer(
    DbContext db,
    IEmbeddingClient embeddingClient) : ILmsRagIndexer
{
    private const string Table = "matching.search_chunks";
    private const string SubjectKind = LearningMaterial.SubjectKind;

    public async Task IndexMaterialAsync(Guid materialId, CancellationToken ct = default)
    {
        var material = await db.Set<LearningMaterial>()
            .Include(x => x.Instructors)
            .Include(x => x.QuizQuestions)
            .Include(x => x.DbLinks)
            .FirstOrDefaultAsync(x => x.Id == materialId, ct);

        if (material is null || material.IsDeleted || material.Status != LmsStatuses.Published)
        {
            await RemoveMaterialIndexAsync(materialId, ct);
            return;
        }

        // Xóa index cũ trước khi nạp mới
        await RemoveMaterialIndexAsync(materialId, ct);

        // Chuẩn bị văn bản để chunking
        var fullText = BuildMaterialIndexText(material);
        var chunks = SplitIntoChunks(fullText, 800);
        if (chunks.Count == 0) return;

        // Sinh vector 1024 chiều (BAAI/bge-m3)
        var embeddingResult = await embeddingClient.EmbedAsync(chunks, ct);

        // Lưu vào matching.search_chunks
        for (var i = 0; i < chunks.Count; i++)
        {
            var chunkText = chunks[i];
            var embedding = embeddingResult.Embeddings[i];

            // Nếu embedding không đủ 1024 chiều, bù 0 để khớp pgvector(1024)
            if (embedding.Length != 1024)
            {
                var adjusted = new float[1024];
                Array.Copy(embedding, adjusted, Math.Min(embedding.Length, 1024));
                embedding = adjusted;
            }

            var vectorStr = "[" + string.Join(",", embedding.Select(v => v.ToString("G7", System.Globalization.CultureInfo.InvariantCulture))) + "]";

            var sql = $"""
                INSERT INTO {Table}
                    (subject_kind, subject_id, chunk_index, text, embedding, title, ai_title, owner_person_id, is_published)
                VALUES
                    (@kind, @subject_id, @chunk_index, @text, @embedding::vector, @title, @ai_title, @owner_id, true)
                ON CONFLICT (subject_kind, subject_id, chunk_index) DO UPDATE SET
                    text = EXCLUDED.text,
                    embedding = EXCLUDED.embedding,
                    title = EXCLUDED.title,
                    is_published = true,
                    owner_person_id = EXCLUDED.owner_person_id;
                """;

            var parameters = new[]
            {
                new NpgsqlParameter("kind", SubjectKind),
                new NpgsqlParameter("subject_id", material.Id),
                new NpgsqlParameter("chunk_index", i),
                new NpgsqlParameter("text", chunkText),
                new NpgsqlParameter("embedding", vectorStr),
                new NpgsqlParameter("title", material.Title),
                new NpgsqlParameter("ai_title", (object?)material.Title ?? DBNull.Value),
                new NpgsqlParameter("owner_id", material.CreatedBy)
            };

            await db.Database.ExecuteSqlRawAsync(sql, parameters, ct);
        }

        material.RecordRagIndexed(chunks.Count);
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveMaterialIndexAsync(Guid materialId, CancellationToken ct = default)
    {
        await db.Database.ExecuteSqlRawAsync(
            $"DELETE FROM {Table} WHERE subject_kind = @kind AND subject_id = @id",
            [new NpgsqlParameter("kind", SubjectKind), new NpgsqlParameter("id", materialId)],
            ct);
    }

    private static string BuildMaterialIndexText(LearningMaterial m)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"TIÊU ĐỀ HỌC LIỆU: {m.Title}");
        sb.AppendLine($"MÃ BÀI HỌC: {m.MaterialCode}");
        sb.AppendLine($"PHÂN LOẠI: {m.LessonType}");
        if (!string.IsNullOrWhiteSpace(m.SectorCode))
            sb.AppendLine($"LĨNH VỰC: {m.SectorCode}");
        sb.AppendLine($"THỜI LƯỢNG: {m.DurationMinutes} phút");

        var cleanDesc = HtmlStripRegex().Replace(m.DescriptionHtml ?? string.Empty, " ").Trim();
        sb.AppendLine($"NỘI DUNG: {cleanDesc}");

        if (m.Instructors.Count > 0)
        {
            sb.AppendLine("CHUYÊN GIA GIẢNG DẠY:");
            foreach (var inst in m.Instructors)
            {
                sb.AppendLine($"- {inst.FullName} ({inst.TitleDegree ?? "Chuyên gia"}) - {inst.OrgName}");
            }
        }

        if (m.QuizQuestions.Count > 0)
        {
            sb.AppendLine("CÂU HỎI VÀ TRI THỨC TRỌNG TÂM:");
            foreach (var q in m.QuizQuestions)
            {
                sb.AppendLine($"Câu hỏi: {q.QuestionText}");
                sb.AppendLine($"Giải thích: {q.Explanation}");
            }
        }

        if (m.DbLinks.Count > 0)
        {
            sb.AppendLine("LIÊN KẾT CƠ SỞ DỮ LIỆU:");
            foreach (var link in m.DbLinks)
            {
                sb.AppendLine($"- {link.DisplayLabel}: {link.TargetUrl}");
            }
        }

        return sb.ToString();
    }

    private static List<string> SplitIntoChunks(string text, int chunkSize)
    {
        var chunks = new List<string>();
        if (string.IsNullOrWhiteSpace(text)) return chunks;

        var words = text.Split([' ', '\r', '\n'], StringSplitOptions.RemoveEmptyEntries);
        var current = new StringBuilder();

        foreach (var word in words)
        {
            if (current.Length + word.Length + 1 > chunkSize && current.Length > 0)
            {
                chunks.Add(current.ToString());
                current.Clear();
            }
            if (current.Length > 0) current.Append(' ');
            current.Append(word);
        }

        if (current.Length > 0)
            chunks.Add(current.ToString());

        return chunks;
    }

    [GeneratedRegex("<.*?>")]
    private static partial Regex HtmlStripRegex();
}
