import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { PgVectorService } from './pgvector.service';
import { BgeM3Provider } from '../ai/providers/bge-m3.provider';
import { Intake, IntakeStatus, IntakeType } from '../intakes/intake.entity';
import { IntakeChunk } from '../intakes/intake-chunk.entity';
import { IntakeSector } from '../intakes/intake-sector.entity';
import { LoggerService } from '../shared/logger/logger.service';

describe('SearchService', () => {
  let service: SearchService;
  let pgVector: { search: jest.Mock; writeVectors: jest.Mock };
  let bgeM3: { embedHybrid: jest.Mock };
  let intakeRepo: { find: jest.Mock };
  let chunkRepo: { find: jest.Mock };
  let sectorRepo: { find: jest.Mock };

  const DENSE = Array.from({ length: 1024 }, () => 0.01);
  const SPARSE = { '5': 0.4, '9': 0.2 };

  beforeEach(async () => {
    pgVector = {
      search: jest.fn().mockResolvedValue([]),
      writeVectors: jest.fn(),
    };
    bgeM3 = {
      embedHybrid: jest
        .fn()
        .mockResolvedValue([{ dense: DENSE, sparse: SPARSE }]),
    };
    intakeRepo = { find: jest.fn().mockResolvedValue([]) };
    chunkRepo = { find: jest.fn().mockResolvedValue([]) };
    sectorRepo = { find: jest.fn().mockResolvedValue([]) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PgVectorService, useValue: pgVector },
        { provide: BgeM3Provider, useValue: bgeM3 },
        { provide: getRepositoryToken(Intake), useValue: intakeRepo },
        { provide: getRepositoryToken(IntakeChunk), useValue: chunkRepo },
        { provide: getRepositoryToken(IntakeSector), useValue: sectorRepo },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(SearchService);
  });

  describe('search', () => {
    it('embeds the query with the same model the chunks used', async () => {
      await service.search({ query: 'công nghệ sinh học' });
      expect(bgeM3.embedHybrid).toHaveBeenCalledWith(['công nghệ sinh học']);
    });

    it('pushes every hard filter down into the query rather than post-filtering', async () => {
      await service.search({
        query: 'x',
        type: IntakeType.CHALLENGE,
        sectorIds: ['s1', 's2'],
        statuses: [IntakeStatus.PUBLISHED],
        excludeUserId: 'u9',
        limit: 7,
      });

      const [, , , filter, limit] = pgVector.search.mock.calls[0];
      expect(filter).toEqual({
        type: IntakeType.CHALLENGE,
        sectorIds: ['s1', 's2'],
        statuses: [IntakeStatus.PUBLISHED],
        excludeUserId: 'u9',
      });
      expect(limit).toBe(7);
    });

    it('normalises empty filter arrays to undefined so the SQL treats them as "no filter"', async () => {
      await service.search({ query: 'x', sectorIds: [], statuses: [] });
      const [, , , filter] = pgVector.search.mock.calls[0];
      expect(filter.sectorIds).toBeUndefined();
      expect(filter.statuses).toBeUndefined();
    });

    it('returns nothing and does not enrich when every hit is below minScore', async () => {
      pgVector.search.mockResolvedValue([
        { intake_id: 'a', chunk_index: 0, chunk_text: 't', score: 0.01 },
      ]);

      const res = await service.search({ query: 'x', minScore: 0.05 });

      expect(res.hits).toEqual([]);
      expect(res.total).toBe(0);
      expect(intakeRepo.find).not.toHaveBeenCalled();
    });

    it('keeps hits on the RRF scale — the old BM25 default of 2.0 would reject everything', async () => {
      // Four channels cap at 4 * 1/61 ~= 0.0656.
      pgVector.search.mockResolvedValue([
        { intake_id: 'a', chunk_index: 0, chunk_text: 't', score: 0.0655 },
      ]);
      intakeRepo.find.mockResolvedValue([
        { id: 'a', title: 'T', aiProcessTitle: null, type: 'ip' },
      ]);

      const withDefault = await service.search({ query: 'x' });
      expect(withDefault.hits).toHaveLength(1);

      const withOldDefault = await service.search({
        query: 'x',
        minScore: 2.0,
      });
      expect(withOldDefault.hits).toHaveLength(0);
    });

    it('attaches title, type and sector names to raw retrieval rows', async () => {
      pgVector.search.mockResolvedValue([
        {
          intake_id: 'a',
          chunk_index: 3,
          chunk_text: 'đoạn khớp',
          score: 0.05,
        },
      ]);
      intakeRepo.find.mockResolvedValue([
        { id: 'a', title: 'Tiêu đề', aiProcessTitle: 'AI', type: 'ip' },
      ]);
      sectorRepo.find.mockResolvedValue([
        { intakeId: 'a', sectorId: 's1', sector: { name: 'Y tế' } },
      ]);

      const res = await service.search({ query: 'x' });

      expect(res.hits[0]).toMatchObject({
        intakeId: 'a',
        title: 'Tiêu đề',
        aiProcessTitle: 'AI',
        matchedChunk: 'đoạn khớp',
        chunkIndex: 3,
        intakeType: 'ip',
        sectorIds: ['s1'],
        sectorNames: ['Y tế'],
      });
    });

    it('drops rows whose intake no longer exists rather than emitting a broken hit', async () => {
      pgVector.search.mockResolvedValue([
        { intake_id: 'gone', chunk_index: 0, chunk_text: 't', score: 0.05 },
      ]);
      intakeRepo.find.mockResolvedValue([]);

      const res = await service.search({ query: 'x' });
      expect(res.hits).toEqual([]);
    });
  });

  describe('searchForMatching', () => {
    it('always restricts to published intakes and excludes the requester', async () => {
      await service.searchForMatching({
        query: 'q',
        type: IntakeType.CHALLENGE,
        excludeUserId: 'owner-1',
        sectorIds: ['s1'],
      });

      const [, , , filter] = pgVector.search.mock.calls[0];
      expect(filter.statuses).toEqual([IntakeStatus.PUBLISHED]);
      expect(filter.excludeUserId).toBe('owner-1');
      expect(filter.type).toBe(IntakeType.CHALLENGE);
    });

    it('uses a zero score floor so the RRF scale is not accidentally clipped', async () => {
      pgVector.search.mockResolvedValue([
        { intake_id: 'a', chunk_index: 0, chunk_text: 't', score: 0.001 },
      ]);
      intakeRepo.find.mockResolvedValue([
        { id: 'a', title: 'T', aiProcessTitle: null, type: 'challenge' },
      ]);

      const res = await service.searchForMatching({
        query: 'q',
        type: IntakeType.CHALLENGE,
      });
      expect(res.hits).toHaveLength(1);
    });
  });

  describe('indexIntake', () => {
    /**
     * Regression guard. BGE-M3 returns dense and sparse from one forward pass,
     * so the chunk-embed pipeline already holds both. An earlier revision threw
     * them away and re-embedded here, doubling the model cost of every intake.
     */
    it('reuses embeddings handed in by the chunk-embed pipeline', async () => {
      await service.indexIntake('i1', [
        { index: 0, embedding: DENSE, sparse: SPARSE },
        { index: 1, embedding: DENSE, sparse: {} },
      ]);

      expect(bgeM3.embedHybrid).not.toHaveBeenCalled();
      expect(chunkRepo.find).not.toHaveBeenCalled();
      expect(pgVector.writeVectors).toHaveBeenCalledWith([
        { intakeId: 'i1', chunkIndex: 0, dense: DENSE, sparse: SPARSE },
        { intakeId: 'i1', chunkIndex: 1, dense: DENSE, sparse: {} },
      ]);
    });

    it('re-embeds when nothing is handed in — the reindex path', async () => {
      chunkRepo.find.mockResolvedValue([{ index: 0, text: 'đoạn văn' }]);

      await service.indexIntake('i1');

      expect(bgeM3.embedHybrid).toHaveBeenCalledWith(['đoạn văn']);
      expect(pgVector.writeVectors).toHaveBeenCalledWith([
        { intakeId: 'i1', chunkIndex: 0, dense: DENSE, sparse: SPARSE },
      ]);
    });

    it('writes nothing when an intake has no chunks', async () => {
      chunkRepo.find.mockResolvedValue([]);
      await service.indexIntake('empty');
      expect(pgVector.writeVectors).not.toHaveBeenCalled();
    });
  });
});
