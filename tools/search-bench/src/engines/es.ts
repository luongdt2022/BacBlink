/**
 * Elasticsearch engine, in two configurations:
 *
 *  es-current — byte-for-byte replica of what production does today
 *               (standard analyzer, knn + query scores ADDED, filter applied
 *               after top-K, minScore cutoff). This is the honest baseline.
 *
 *  es-fixed   — same engine, bugs removed (asciifolding analyzer, phrase
 *               matching, hard filter pushed into both channels, RRF fusion).
 *               Isolates "engine" from "bugs" — without this, any PG win is
 *               unattributable.
 *
 * Note: Elasticsearch's native `rrf` retriever is a paid-tier feature, so the
 * fusion for es-fixed is done client-side over an msearch. That is the honest
 * cost of RRF on a free Elasticsearch licence.
 */
import { Client } from '@elastic/elasticsearch';
import type { Chunk } from '../corpus.js';
import type { Embedding } from '../embed.js';
import { rrfFuse, type Hit } from '../fuse.js';

export const ES_URL = process.env.ES_URL ?? 'http://localhost:9210';
export const IDX_CURRENT = 'intake_chunks';
export const IDX_FIXED = 'intake_chunks_fixed';

export const es = new Client({ node: ES_URL, requestTimeout: 120_000 });

export interface Filter {
  type?: 'ip' | 'challenge';
  sectorNames?: string[];
}

// --- index setup -------------------------------------------------------------

/** Production mapping, copied verbatim from elasticsearch.service.ts. */
async function createCurrent() {
  await es.indices.create({
    index: IDX_CURRENT,
    mappings: {
      properties: {
        intake_id: { type: 'keyword' },
        chunk_index: { type: 'integer' },
        text: { type: 'text', analyzer: 'standard' },
        embedding: { type: 'dense_vector', dims: 1024, similarity: 'cosine' },
        intake_title: { type: 'text', analyzer: 'standard' },
        ai_process_title: { type: 'text', analyzer: 'standard' },
        intake_type: { type: 'keyword' },
        sector_ids: { type: 'keyword' },
        sector_names: { type: 'text', analyzer: 'standard' },
      },
    },
  });
}

/** Corrected mapping: adds a folded (diacritic-insensitive) sub-field. */
async function createFixed() {
  await es.indices.create({
    index: IDX_FIXED,
    settings: {
      analysis: {
        analyzer: {
          vi_folded: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding'],
          },
        },
      },
    },
    mappings: {
      properties: {
        intake_id: { type: 'keyword' },
        chunk_index: { type: 'integer' },
        text: {
          type: 'text',
          analyzer: 'standard',
          fields: { folded: { type: 'text', analyzer: 'vi_folded' } },
        },
        embedding: { type: 'dense_vector', dims: 1024, similarity: 'cosine' },
        intake_title: {
          type: 'text',
          analyzer: 'standard',
          fields: { folded: { type: 'text', analyzer: 'vi_folded' } },
        },
        intake_type: { type: 'keyword' },
        sector_names: {
          type: 'text',
          analyzer: 'standard',
          fields: { folded: { type: 'text', analyzer: 'vi_folded' } },
        },
        sector_keys: { type: 'keyword' },
      },
    },
  });
}

export async function resetIndices() {
  for (const idx of [IDX_CURRENT, IDX_FIXED]) {
    if (await es.indices.exists({ index: idx })) {
      await es.indices.delete({ index: idx });
    }
  }
  await createCurrent();
  await createFixed();
}

export async function indexChunks(chunks: Chunk[], embs: Embedding[]) {
  const BATCH = 200;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const slice = chunks.slice(i, i + BATCH);
    const ops: any[] = [];
    for (let j = 0; j < slice.length; j++) {
      const c = slice[j];
      const e = embs[i + j];
      const id = `${c.intakeId}_${c.chunkIndex}`;
      const base = {
        intake_id: c.intakeId,
        chunk_index: c.chunkIndex,
        text: c.text,
        embedding: e.dense,
        intake_title: c.intakeTitle,
        intake_type: c.intakeType,
        sector_names: c.sectorNames,
      };
      ops.push({ index: { _index: IDX_CURRENT, _id: id } });
      ops.push({ ...base, ai_process_title: null, sector_ids: c.sectorNames });
      ops.push({ index: { _index: IDX_FIXED, _id: id } });
      ops.push({ ...base, sector_keys: c.sectorNames });
    }
    const r = await es.bulk({ operations: ops, refresh: false });
    if (r.errors) {
      const bad = r.items.find((it: any) => it.index?.error);
      throw new Error(`ES bulk error: ${JSON.stringify(bad?.index?.error)}`);
    }
    process.stdout.write(
      `\r  ES indexed ${Math.min(i + BATCH, chunks.length)}/${chunks.length}   `,
    );
  }
  await es.indices.refresh({ index: [IDX_CURRENT, IDX_FIXED] });
  process.stdout.write('\n');
}

// --- search ------------------------------------------------------------------

function dedupeByIntake(hits: any[]): Hit[] {
  const seen = new Map<string, Hit>();
  for (const h of hits) {
    const id = h._source.intake_id;
    const score = h._score ?? 0;
    const prev = seen.get(id);
    if (!prev || score > prev.score) {
      seen.set(id, { intakeId: id, score, chunkText: h._source.text });
    }
  }
  return [...seen.values()].sort((a, b) => b.score - a.score);
}

/**
 * Production behaviour, reproduced exactly: knn and query side by side (ES adds
 * the two scores), filter applied only as a term filter, minScore 2.0 cutoff.
 */
export async function searchCurrent(
  query: string,
  qEmb: Embedding,
  limit: number,
  filter: Filter = {},
  minScore = 2.0,
): Promise<Hit[]> {
  const f: object[] = [];
  if (filter.type) f.push({ term: { intake_type: filter.type } });
  if (filter.sectorNames?.length) {
    f.push({ terms: { sector_ids: filter.sectorNames } });
  }

  const res = await es.search({
    index: IDX_CURRENT,
    knn: {
      field: 'embedding',
      query_vector: qEmb.dense,
      k: limit * 3,
      num_candidates: limit * 10,
      filter: f.length ? { bool: { filter: f } } : undefined,
    },
    query: {
      bool: {
        should: [
          { match: { text: { query, boost: 1.0 } } },
          { match: { intake_title: { query, boost: 2.0 } } },
        ],
        filter: f,
        minimum_should_match: 0,
      },
    },
    size: limit * 3,
    _source: true,
  });

  return dedupeByIntake(res.hits.hits)
    .filter((h) => h.score >= minScore)
    .slice(0, limit);
}

/**
 * Corrected: hard filter inside every channel, phrase + folded lexical
 * matching, RRF fusion instead of raw score addition.
 */
export async function searchFixed(
  query: string,
  qEmb: Embedding,
  limit: number,
  filter: Filter = {},
): Promise<Hit[]> {
  const K = Math.max(limit * 5, 50);
  const f: object[] = [];
  if (filter.type) f.push({ term: { intake_type: filter.type } });
  if (filter.sectorNames?.length) {
    f.push({ terms: { sector_keys: filter.sectorNames } });
  }
  const filterClause = f.length ? { bool: { filter: f } } : undefined;

  const body: any[] = [
    // dense channel
    { index: IDX_FIXED },
    {
      knn: {
        field: 'embedding',
        query_vector: qEmb.dense,
        k: K,
        num_candidates: K * 4,
        filter: filterClause,
      },
      size: K,
      _source: ['intake_id', 'text'],
    },
    // lexical channel: phrase-first, folded fallback
    { index: IDX_FIXED },
    {
      query: {
        bool: {
          should: [
            { match_phrase: { text: { query, boost: 3.0, slop: 1 } } },
            { match_phrase: { 'text.folded': { query, boost: 2.5, slop: 1 } } },
            { match_phrase: { intake_title: { query, boost: 6.0, slop: 1 } } },
            {
              match_phrase: {
                'intake_title.folded': { query, boost: 5.0, slop: 1 },
              },
            },
            { match: { 'text.folded': { query, boost: 1.0 } } },
            { match: { 'intake_title.folded': { query, boost: 2.0 } } },
          ],
          filter: f,
          minimum_should_match: 1,
        },
      },
      size: K,
      _source: ['intake_id', 'text'],
    },
  ];

  const res: any = await es.msearch({ searches: body });
  const [dense, lexical] = res.responses.map((r: any) =>
    dedupeByIntake(r.hits?.hits ?? []),
  );

  return rrfFuse([dense, lexical], limit);
}
