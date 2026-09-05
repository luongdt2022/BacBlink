import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BgeM3Provider } from '../ai/providers/bge-m3.provider';
import { Intake, IntakeStatus } from '../intakes/intake.entity';
import { IntakeChunk } from '../intakes/intake-chunk.entity';
import { IntakeSector } from '../intakes/intake-sector.entity';
import { LoggerService } from '../shared/logger/logger.service';
import { PgVectorService, type HardFilter } from './pgvector.service';
import { SearchDto, SearchHitDto, SearchResultDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
    @InjectRepository(IntakeChunk)
    private readonly chunkRepo: Repository<IntakeChunk>,
    @InjectRepository(IntakeSector)
    private readonly intakeSectorRepo: Repository<IntakeSector>,
    private readonly pgVector: PgVectorService,
    private readonly bgeM3: BgeM3Provider,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Called after chunk-embed finishes. Writes dense + sparse vectors onto the
   * chunk rows. Previously this pushed documents into Elasticsearch; the chunks
   * now carry their own vectors, so there is no second store to keep in sync.
   *
   * `precomputed` MUST be passed by the chunk-embed pipeline, which already has
   * both representations from a single BGE-M3 forward pass. Without it this
   * runs the model a second time over the same chunks. The re-embedding path
   * exists for reindexing, where no vectors are on hand.
   */
  async indexIntake(
    intakeId: string,
    precomputed?: Array<{
      index: number;
      embedding: number[];
      sparse: Record<string, number>;
    }>,
  ): Promise<void> {
    if (precomputed?.length) {
      await this.pgVector.writeVectors(
        precomputed.map((c) => ({
          intakeId,
          chunkIndex: c.index,
          dense: c.embedding,
          sparse: c.sparse,
        })),
      );
      this.logger.log(
        `Indexed intake ${intakeId} (${precomputed.length} chunks, reused embeddings)`,
        SearchService.name,
      );
      return;
    }

    const chunks = await this.chunkRepo.find({
      where: { intakeId },
      order: { index: 'ASC' },
    });
    if (chunks.length === 0) return;

    const embeddings = await this.bgeM3.embedHybrid(chunks.map((c) => c.text));

    await this.pgVector.writeVectors(
      chunks.map((c, i) => ({
        intakeId,
        chunkIndex: c.index,
        dense: embeddings[i].dense,
        sparse: embeddings[i].sparse,
      })),
    );

    this.logger.log(
      `Indexed intake ${intakeId} (${chunks.length} chunks, re-embedded)`,
      SearchService.name,
    );
  }

  async search(dto: SearchDto): Promise<SearchResultDto> {
    const {
      query,
      limit = 10,
      type,
      sectorIds,
      minScore = 0,
      statuses,
      excludeUserId,
    } = dto;

    const started = Date.now();

    // Same model as the chunks — a query embedded by anything else is not
    // comparable to what is stored.
    const [queryEmb] = await this.bgeM3.embedHybrid([query]);

    const filter: HardFilter = {
      type,
      sectorIds: sectorIds?.length ? sectorIds : undefined,
      statuses: statuses?.length ? statuses : undefined,
      excludeUserId,
    };

    const rows = await this.pgVector.search(
      query,
      queryEmb.dense,
      queryEmb.sparse,
      filter,
      limit,
    );

    const kept = rows.filter((r) => r.score >= minScore);
    if (kept.length === 0) {
      return { hits: [], total: 0, took: Date.now() - started };
    }

    const hits = await this.enrich(kept);

    this.logger.log(
      `Search "${query.slice(0, 60)}" -> ${hits.length} intakes in ${Date.now() - started}ms`,
      SearchService.name,
    );

    return { hits, total: hits.length, took: Date.now() - started };
  }

  /** Attaches title, type and sector names to the raw retrieval rows. */
  private async enrich(
    rows: Array<{
      intake_id: string;
      chunk_index: number;
      chunk_text: string;
      score: number;
    }>,
  ): Promise<SearchHitDto[]> {
    const ids = rows.map((r) => r.intake_id);

    const [intakes, sectorRows] = await Promise.all([
      this.intakeRepo.find({
        where: { id: In(ids) },
        select: ['id', 'title', 'aiProcessTitle', 'type'],
      }),
      this.intakeSectorRepo.find({
        where: { intakeId: In(ids) },
        relations: ['sector'],
      }),
    ]);

    const byId = new Map(intakes.map((i) => [i.id, i]));
    const sectorsByIntake = new Map<
      string,
      { ids: string[]; names: string[] }
    >();
    for (const s of sectorRows) {
      const entry = sectorsByIntake.get(s.intakeId) ?? { ids: [], names: [] };
      entry.ids.push(s.sectorId);
      if (s.sector?.name) entry.names.push(s.sector.name);
      sectorsByIntake.set(s.intakeId, entry);
    }

    return rows
      .filter((r) => byId.has(r.intake_id))
      .map((r) => {
        const intake = byId.get(r.intake_id)!;
        const sectors = sectorsByIntake.get(r.intake_id) ?? {
          ids: [],
          names: [],
        };
        return {
          intakeId: r.intake_id,
          title: intake.title,
          aiProcessTitle: intake.aiProcessTitle ?? null,
          matchedChunk: r.chunk_text,
          chunkIndex: r.chunk_index,
          score: r.score,
          intakeType: intake.type,
          sectorIds: sectors.ids,
          sectorNames: sectors.names,
        };
      });
  }

  /**
   * Convenience wrapper for the matching pipeline: published intakes only, of
   * the opposite type, never the requester's own.
   *
   * The filters are passed DOWN into the query rather than applied to the
   * result. Applying them afterwards — as the Elasticsearch path did — meant a
   * valid candidate that fell outside the first top-K was lost for good.
   */
  async searchForMatching(params: {
    query: string;
    type: string;
    sectorIds?: string[];
    excludeUserId?: string;
    limit?: number;
  }): Promise<SearchResultDto> {
    return this.search({
      query: params.query,
      type: params.type as SearchDto['type'],
      sectorIds: params.sectorIds,
      excludeUserId: params.excludeUserId,
      statuses: [IntakeStatus.PUBLISHED],
      limit: params.limit ?? 10,
      minScore: 0,
    });
  }
}
