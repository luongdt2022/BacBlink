import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** BGE-M3 / XLM-RoBERTa vocabulary size — the sparsevec dimension. */
export const SPARSE_DIM = 250002;

/** pgvector indexes a sparsevec with at most this many non-zero elements. */
const SPARSE_MAX_NNZ = 1000;

export interface ChunkVectors {
  intakeId: string;
  chunkIndex: number;
  dense: number[];
  sparse: Record<string, number>;
}

export interface HardFilter {
  /** Only these intake types. */
  type?: string;
  /** Intake must belong to at least one of these sectors. */
  sectorIds?: string[];
  /** Intake status must be one of these. */
  statuses?: string[];
  /** Drop intakes owned by this user (self-matching). */
  excludeUserId?: string;
}

export interface RawHit {
  intake_id: string;
  chunk_index: number;
  chunk_text: string;
  score: number;
}

/**
 * All raw SQL for hybrid retrieval. Replaces ElasticsearchService.
 *
 * Two design points worth keeping when this is ported to .NET:
 *
 * 1. The hard filter runs BEFORE each channel's top-K, as a live join against
 *    `intakes` — not as metadata copied onto `intake_chunks`. A duplicated ACL
 *    is an ACL with lag, and a stale copy of a confidentiality level is a
 *    silent document leak rather than a ranking defect. Joining keeps the
 *    filter in the same snapshot as the data.
 *
 * 2. Channels are merged with Reciprocal Rank Fusion, which consumes RANKS.
 *    The Elasticsearch path this replaces let the engine ADD a cosine score
 *    (bounded ~1.0) to a BM25 score (unbounded), so BM25 dominated and the
 *    embedding was close to noise.
 */
@Injectable()
export class PgVectorService {
  private readonly logger = new Logger(PgVectorService.name);

  constructor(private readonly dataSource: DataSource) {}

  /** pgvector sparsevec literal: {idx:val,...}/dim, indices ascending, 1-based. */
  static toSparsevec(sparse: Record<string, number>): string {
    const entries = Object.entries(sparse)
      .map(([token, weight]) => [Number(token) + 1, Number(weight)] as const)
      .filter(
        ([i, w]) => Number.isFinite(w) && w > 0 && i >= 1 && i <= SPARSE_DIM,
      )
      // Keep the heaviest terms when a chunk exceeds what pgvector will index.
      .sort((a, b) => b[1] - a[1])
      .slice(0, SPARSE_MAX_NNZ)
      .sort((a, b) => a[0] - b[0]);

    if (entries.length === 0) return `{}/${SPARSE_DIM}`;
    return `{${entries.map(([i, w]) => `${i}:${w}`).join(',')}}/${SPARSE_DIM}`;
  }

  static toVector(dense: number[]): string {
    return JSON.stringify(dense);
  }

  /**
   * Writes dense and sparse vectors onto rows that already exist in
   * intake_chunks. The chunk rows themselves are inserted by IntakesService.
   */
  async writeVectors(vectors: ChunkVectors[]): Promise<void> {
    if (vectors.length === 0) return;

    await this.dataSource.transaction(async (manager) => {
      for (const v of vectors) {
        await manager.query(
          `UPDATE "intake_chunks"
              SET "emb" = $1::vector,
                  "emb_sparse" = $2::sparsevec
            WHERE "intake_id" = $3 AND "index" = $4`,
          [
            PgVectorService.toVector(v.dense),
            PgVectorService.toSparsevec(v.sparse),
            v.intakeId,
            v.chunkIndex,
          ],
        );
      }
    });

    this.logger.log(
      `Wrote ${vectors.length} vectors for intake ${vectors[0].intakeId}`,
    );
  }

  /**
   * Four-channel retrieval fused with RRF, in one round trip.
   *
   * @param k per-channel candidate depth; each channel over-fetches k*3 chunks
   *          before collapsing to one row per intake.
   */
  async search(
    queryText: string,
    dense: number[],
    sparse: Record<string, number>,
    filter: HardFilter,
    limit: number,
    k = 50,
  ): Promise<RawHit[]> {
    const params = [
      PgVectorService.toVector(dense), // $1
      queryText, // $2
      PgVectorService.toSparsevec(sparse), // $3
      filter.type ?? null, // $4
      filter.sectorIds?.length ? filter.sectorIds : null, // $5
      filter.statuses?.length ? filter.statuses : null, // $6
      filter.excludeUserId ?? null, // $7
      k, // $8
      limit, // $9
    ];

    const sql = `
      WITH allowed AS (
        SELECT i."id"
          FROM "intakes" i
         WHERE ($4::text   IS NULL OR i."type"::text   = $4)
           AND ($6::text[] IS NULL OR i."status"::text = ANY($6))
           AND ($7::text   IS NULL OR i."user_id"::text IS DISTINCT FROM $7)
           AND ($5::text[] IS NULL OR EXISTS (
                 SELECT 1 FROM "intake_sectors" s
                  WHERE s."intake_id" = i."id"
                    AND s."sector_id"::text = ANY($5)))
      ),
      dense_raw AS (
        SELECT c."intake_id", c."index", c."text", c."emb" <=> $1::vector AS d
          FROM "intake_chunks" c
         WHERE c."emb" IS NOT NULL
           AND c."intake_id" IN (SELECT "id" FROM allowed)
         ORDER BY c."emb" <=> $1::vector
         LIMIT $8 * 3
      ),
      dense_r AS (
        SELECT "intake_id", "index", "text",
               ROW_NUMBER() OVER (ORDER BY d) AS rank
          FROM (SELECT DISTINCT ON ("intake_id") * FROM dense_raw
                 ORDER BY "intake_id", d) x
         ORDER BY d LIMIT $8
      ),
      sparse_raw AS (
        SELECT c."intake_id", c."index", c."text",
               c."emb_sparse" <#> $3::sparsevec AS d
          FROM "intake_chunks" c
         WHERE c."emb_sparse" IS NOT NULL
           AND c."intake_id" IN (SELECT "id" FROM allowed)
         ORDER BY c."emb_sparse" <#> $3::sparsevec
         LIMIT $8 * 3
      ),
      sparse_r AS (
        SELECT "intake_id", "index", "text",
               ROW_NUMBER() OVER (ORDER BY d) AS rank
          FROM (SELECT DISTINCT ON ("intake_id") * FROM sparse_raw
                 ORDER BY "intake_id", d) x
         ORDER BY d LIMIT $8
      ),
      lex_raw AS (
        SELECT c."intake_id", c."index", c."text",
               GREATEST(
                 ts_rank_cd(c."tsv",    phraseto_tsquery('simple', $2)),
                 ts_rank_cd(c."tsv_ua", phraseto_tsquery('simple', f_unaccent($2)))
               ) AS s
          FROM "intake_chunks" c
         WHERE c."intake_id" IN (SELECT "id" FROM allowed)
           AND (c."tsv"    @@ phraseto_tsquery('simple', $2)
             OR c."tsv_ua" @@ phraseto_tsquery('simple', f_unaccent($2)))
         ORDER BY s DESC
         LIMIT $8 * 3
      ),
      lex_r AS (
        SELECT "intake_id", "index", "text",
               ROW_NUMBER() OVER (ORDER BY s DESC) AS rank
          FROM (SELECT DISTINCT ON ("intake_id") * FROM lex_raw
                 ORDER BY "intake_id", s DESC) x
         ORDER BY s DESC LIMIT $8
      ),
      trgm_raw AS (
        SELECT c."intake_id", c."index", c."text",
               word_similarity(f_unaccent($2), c."searchable_ua") AS s
          FROM "intake_chunks" c
         WHERE c."intake_id" IN (SELECT "id" FROM allowed)
           AND f_unaccent($2) <% c."searchable_ua"
         ORDER BY s DESC
         LIMIT $8 * 3
      ),
      trgm_r AS (
        SELECT "intake_id", "index", "text",
               ROW_NUMBER() OVER (ORDER BY s DESC) AS rank
          FROM (SELECT DISTINCT ON ("intake_id") * FROM trgm_raw
                 ORDER BY "intake_id", s DESC) x
         ORDER BY s DESC LIMIT $8
      ),
      fused AS (
        SELECT * FROM dense_r
        UNION ALL SELECT * FROM sparse_r
        UNION ALL SELECT * FROM lex_r
        UNION ALL SELECT * FROM trgm_r
      )
      SELECT "intake_id",
             (array_agg("index" ORDER BY rank))[1]  AS chunk_index,
             (array_agg("text"  ORDER BY rank))[1]  AS chunk_text,
             SUM(1.0 / (60 + rank))::float          AS score
        FROM fused
       GROUP BY "intake_id"
       ORDER BY score DESC
       LIMIT $9
    `;

    const runner = this.dataSource.createQueryRunner();
    try {
      await runner.connect();
      await runner.startTransaction();
      // SET LOCAL only takes effect inside a transaction block — outside one it
      // is silently a no-op, which would leave HNSW unable to keep scanning
      // past filtered-out candidates. Order matters here.
      await runner.query(`SET LOCAL hnsw.iterative_scan = relaxed_order`);
      await runner.query(`SET LOCAL hnsw.ef_search = 100`);
      const rows: RawHit[] = await runner.query(sql, params);
      await runner.commitTransaction();
      return rows;
    } catch (err) {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }
}
