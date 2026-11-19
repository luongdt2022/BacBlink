export interface Hit {
  intakeId: string;
  score: number;
  chunkText?: string;
}

/**
 * Reciprocal Rank Fusion. k=60 is the value from the original Cormack et al.
 * paper and the default in both Elasticsearch and most vector DBs.
 *
 * The point of RRF here is that it consumes RANKS, not scores — which is
 * exactly what production gets wrong today by letting Elasticsearch add a
 * cosine score (bounded ~1.0) to a BM25 score (unbounded).
 */
export function rrfFuse(lists: Hit[][], limit: number, k = 60): Hit[] {
  const acc = new Map<string, { score: number; text?: string }>();

  for (const list of lists) {
    list.forEach((hit, rank) => {
      const cur = acc.get(hit.intakeId) ?? { score: 0, text: hit.chunkText };
      cur.score += 1 / (k + rank + 1);
      if (!cur.text) cur.text = hit.chunkText;
      acc.set(hit.intakeId, cur);
    });
  }

  return [...acc.entries()]
    .map(([intakeId, v]) => ({
      intakeId,
      score: v.score,
      chunkText: v.text,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
