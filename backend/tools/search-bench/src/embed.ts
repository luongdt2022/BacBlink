/** BGE-M3 client. Dense (1024-dim) + sparse lexical weights. */

const RAG_URL = process.env.BGE_M3_URL ?? 'http://localhost:8013';

/** BGE-M3 / XLM-RoBERTa vocabulary size. sparsevec dimension. */
export const SPARSE_DIM = 250002;

export interface Embedding {
  dense: number[];
  /** token id -> weight, already 1-indexed for pgvector sparsevec */
  sparse: Map<number, number>;
}

async function post(body: unknown): Promise<any> {
  const res = await fetch(`${RAG_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`BGE-M3 ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function embed(
  texts: string[],
  opts: { sparse?: boolean; batchSize?: number } = {},
): Promise<Embedding[]> {
  const { sparse = true, batchSize = 8 } = opts;
  const out: Embedding[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize);
    const data = await post({
      input: slice,
      batch_size: batchSize,
      return_dense: true,
      return_sparse: sparse,
      return_colbert: false,
    });

    for (let j = 0; j < slice.length; j++) {
      const m = new Map<number, number>();
      if (sparse && data.sparse?.[j]) {
        for (const [tok, w] of Object.entries<number>(data.sparse[j])) {
          const idx = Number(tok) + 1; // sparsevec is 1-indexed
          if (idx >= 1 && idx <= SPARSE_DIM && w > 0) m.set(idx, w);
        }
      }
      out.push({ dense: data.dense[j], sparse: m });
    }
    process.stdout.write(
      `\r  embedding ${Math.min(i + batchSize, texts.length)}/${texts.length}   `,
    );
  }
  process.stdout.write('\n');
  return out;
}

/** pgvector sparsevec literal: {idx:val,idx:val}/dim — indices must ascend. */
export function toSparsevec(sparse: Map<number, number>): string {
  // An all-zero sparsevec is written as an empty element set, not {1:0} —
  // pgvector rejects an explicit zero element.
  if (sparse.size === 0) return `{}/${SPARSE_DIM}`;
  const parts = [...sparse.entries()]
    .sort((a, b) => a[0] - b[0])
    // pgvector indexes sparsevec with at most 1000 non-zero elements.
    .slice(0, 1000)
    .map(([i, v]) => `${i}:${v}`);
  return `{${parts.join(',')}}/${SPARSE_DIM}`;
}

export async function waitForRag(timeoutMs = 900_000): Promise<void> {
  const start = Date.now();
  let lastErr = '';
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${RAG_URL}/health`);
      if (res.ok) return;
      lastErr = `status ${res.status}`;
    } catch (e: any) {
      lastErr = e.message;
    }
    process.stdout.write(
      `\r  waiting for BGE-M3 (${Math.round((Date.now() - start) / 1000)}s) — ${lastErr}    `,
    );
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`BGE-M3 not ready after ${timeoutMs}ms: ${lastErr}`);
}
