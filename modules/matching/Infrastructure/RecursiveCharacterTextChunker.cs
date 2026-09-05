using NacenTech.Modules.Matching.Application;

namespace NacenTech.Modules.Matching.Infrastructure;

/// <summary>
/// Port `RecursiveCharacterTextSplitter` của LangChain (separators "\n\n", "\n", " ", "") để chunk
/// giữ nguyên biên như NacenTwin — chunk khác biên thì embedding khác, và so sánh chất lượng mất ý nghĩa.
/// </summary>
public sealed class RecursiveCharacterTextChunker : ITextChunker
{
    private static readonly string[] Separators = ["\n\n", "\n", " ", ""];

    public IReadOnlyList<string> Chunk(string text, int chunkSize, int chunkOverlap)
    {
        if (string.IsNullOrWhiteSpace(text)) return [];
        if (chunkOverlap >= chunkSize) throw new ArgumentException("chunkOverlap phải nhỏ hơn chunkSize");
        return Split(text, chunkSize, chunkOverlap, Separators);
    }

    private static List<string> Split(string text, int chunkSize, int chunkOverlap, IReadOnlyList<string> separators)
    {
        var finalChunks = new List<string>();

        var separator = separators[^1];
        var remainingSeparators = new List<string>();
        for (var i = 0; i < separators.Count; i++)
        {
            var s = separators[i];
            if (s.Length == 0) { separator = s; break; }
            if (text.Contains(s, StringComparison.Ordinal))
            {
                separator = s;
                remainingSeparators = separators.Skip(i + 1).ToList();
                break;
            }
        }

        var splits = SplitOnSeparator(text, separator);
        var goodSplits = new List<string>();

        foreach (var split in splits)
        {
            if (split.Length < chunkSize)
            {
                goodSplits.Add(split);
                continue;
            }

            if (goodSplits.Count > 0)
            {
                finalChunks.AddRange(MergeSplits(goodSplits, separator, chunkSize, chunkOverlap));
                goodSplits.Clear();
            }

            if (remainingSeparators.Count == 0) finalChunks.Add(split);
            else finalChunks.AddRange(Split(split, chunkSize, chunkOverlap, remainingSeparators));
        }

        if (goodSplits.Count > 0) finalChunks.AddRange(MergeSplits(goodSplits, separator, chunkSize, chunkOverlap));
        return finalChunks;
    }

    private static List<string> SplitOnSeparator(string text, string separator)
    {
        if (separator.Length == 0) return text.Select(c => c.ToString()).ToList();
        return text.Split(separator, StringSplitOptions.None).Where(s => s.Length > 0).ToList();
    }

    /// <summary>Gom split thành chunk gần chunkSize và giữ overlap ở đầu chunk tiếp theo (giống `mergeSplits`).</summary>
    private static List<string> MergeSplits(IReadOnlyList<string> splits, string separator, int chunkSize, int chunkOverlap)
    {
        var docs = new List<string>();
        var currentDoc = new List<string>();
        var total = 0;
        var separatorLen = separator.Length;

        foreach (var split in splits)
        {
            var len = split.Length;
            if (total + len + (currentDoc.Count > 0 ? separatorLen : 0) > chunkSize && currentDoc.Count > 0)
            {
                var doc = string.Join(separator, currentDoc).Trim();
                if (doc.Length > 0) docs.Add(doc);

                while (total > chunkOverlap ||
                       (total + len + (currentDoc.Count > 0 ? separatorLen : 0) > chunkSize && total > 0))
                {
                    total -= currentDoc[0].Length + (currentDoc.Count > 1 ? separatorLen : 0);
                    currentDoc.RemoveAt(0);
                    if (currentDoc.Count == 0) break;
                }
            }

            total += len + (currentDoc.Count > 0 ? separatorLen : 0);
            currentDoc.Add(split);
        }

        var last = string.Join(separator, currentDoc).Trim();
        if (last.Length > 0) docs.Add(last);
        return docs;
    }
}
