import { DataSource } from 'typeorm';
import { PgVectorService, SPARSE_DIM } from './pgvector.service';

/**
 * Exercises the retrieval SQL against a real PostgreSQL. The unit tests mock
 * PgVectorService away, which means the hard filter, the four channels and the
 * RRF fusion — the parts that actually decide what a user sees — are never
 * covered there. Everything asserted below lives in SQL.
 *
 * Dense and sparse vectors here are deterministic fakes. The lexical, trigram
 * and filtering behaviour under test does not depend on the embedding model, so
 * this stays runnable without BGE-M3. Semantic ranking is measured separately
 * in the search-bench harness, not here.
 *
 * Run with `npm run test:integration`. It is excluded from `npm test` because
 * it needs a migrated database; when none is reachable it FAILS rather than
 * skipping — a silently skipped integration suite is worse than none, since it
 * reports green while covering nothing.
 *
 * Requires the migration to have run (it uses public.f_unaccent and the vector
 * extension); DB_* env vars select the target, defaulting to the local dev one.
 */
const SCHEMA = 'search_it';

const DB = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5443),
  database: process.env.DB_NAME ?? 'dmst_poc',
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
};

const OWNER_A = '0a000000-0000-0000-0000-0000000000a1';
const OWNER_B = '0a000000-0000-0000-0000-0000000000b2';
const SECTOR_1 = '05000000-0000-0000-0000-000000000051';
const SECTOR_2 = '05000000-0000-0000-0000-000000000052';

const ID = {
  target: '11111111-1111-1111-1111-111111111111',
  decoy: '22222222-2222-2222-2222-222222222222',
  draft: '33333333-3333-3333-3333-333333333333',
  mine: '44444444-4444-4444-4444-444444444444',
  challenge: '55555555-5555-5555-5555-555555555555',
  ident: '66666666-6666-6666-6666-666666666666',
};

const DOCS: Array<[string, string, string, string, string, string]> = [
  // id, type, status, owner, sector, text
  [
    ID.target,
    'ip',
    'published',
    OWNER_A,
    SECTOR_1,
    'Quy trình ứng dụng công nghệ sinh học để lên men và tinh chế chế phẩm enzyme dùng trong nông nghiệp.',
  ],
  [
    ID.decoy,
    'ip',
    'published',
    OWNER_A,
    SECTOR_1,
    'Nền tảng công nghệ quản lý học liệu số. Hệ thống công nghệ trình chiếu giúp người học tra cứu tài liệu học tập mọi lúc.',
  ],
  [
    ID.draft,
    'ip',
    'draft',
    OWNER_A,
    SECTOR_1,
    'Bản nháp về công nghệ sinh học lên men enzyme chưa được xuất bản.',
  ],
  [
    ID.mine,
    'ip',
    'published',
    OWNER_B,
    SECTOR_1,
    'Hồ sơ công nghệ sinh học lên men enzyme của chính người đang tìm kiếm.',
  ],
  [
    ID.challenge,
    'challenge',
    'published',
    OWNER_A,
    SECTOR_2,
    'Cần tìm giải pháp công nghệ sinh học lên men enzyme cho nhà máy.',
  ],
  [
    ID.ident,
    'ip',
    'published',
    OWNER_A,
    SECTOR_1,
    'Sáng chế được cấp bằng độc quyền số VN1-0012345, mã sản phẩm thương mại NCT-BIO-2024-X7.',
  ],
];

/** Deterministic, model-free vectors — the assertions never depend on them. */
function fakeDense(seed: number): number[] {
  return Array.from({ length: 1024 }, (_, i) =>
    Math.sin(seed * 0.7 + i * 0.013),
  );
}
function fakeSparse(seed: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 0; i < 40; i++) {
    out[String((seed * 613 + i * 97) % (SPARSE_DIM - 2))] = 0.1 + (i % 7) / 20;
  }
  return out;
}

/**
 * Two DataSources on purpose. PgVectorService takes its own connection from the
 * pool, so a `SET search_path` issued on some other connection would not apply
 * to it — the service would query the real tables instead of the fixtures. The
 * service pool therefore carries search_path in its connection options, which
 * means the schema has to exist before that pool is created.
 */
let bootstrap: DataSource | null = null;
let ds: DataSource | null = null;
let service: PgVectorService;

beforeAll(async () => {
  try {
    bootstrap = new DataSource({
      type: 'postgres',
      ...DB,
      synchronize: false,
      logging: false,
    });
    await bootstrap.initialize();
    await bootstrap.query(`SELECT 1`);
    await bootstrap.query(`SELECT public.f_unaccent('a')`);
  } catch (err) {
    throw new Error(
      `Integration tests need a migrated PostgreSQL at ${DB.host}:${DB.port}/${DB.database}. ` +
        `Start it with \`docker compose up -d postgres\` and run \`npm run migration:run\`. ` +
        `Original error: ${String(err)}`,
    );
  }

  await bootstrap.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
  await bootstrap.query(`CREATE SCHEMA ${SCHEMA}`);

  const ds0 = bootstrap;
  await ds0.query(`
    CREATE TABLE ${SCHEMA}.intakes (
      id uuid PRIMARY KEY, title text NOT NULL, ai_process_title text,
      type text NOT NULL, status text NOT NULL, user_id uuid)`);
  await ds0.query(`
    CREATE TABLE ${SCHEMA}.intake_sectors (
      intake_id uuid NOT NULL, sector_id uuid NOT NULL)`);
  await ds0.query(`
    CREATE TABLE ${SCHEMA}.intake_chunks (
      id bigserial PRIMARY KEY, intake_id uuid NOT NULL, "index" int NOT NULL,
      text text NOT NULL,
      emb vector(1024), emb_sparse sparsevec(${SPARSE_DIM}),
      tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED,
      tsv_ua tsvector GENERATED ALWAYS AS (to_tsvector('simple', public.f_unaccent(text))) STORED,
      searchable_ua text GENERATED ALWAYS AS (public.f_unaccent(text)) STORED)`);

  for (let i = 0; i < DOCS.length; i++) {
    const [id, type, status, owner, sector, text] = DOCS[i];
    await ds0.query(
      `INSERT INTO ${SCHEMA}.intakes (id,title,type,status,user_id) VALUES ($1,$2,$3,$4,$5)`,
      [id, text.slice(0, 40), type, status, owner],
    );
    await ds0.query(`INSERT INTO ${SCHEMA}.intake_sectors VALUES ($1,$2)`, [
      id,
      sector,
    ]);
    await ds0.query(
      `INSERT INTO ${SCHEMA}.intake_chunks (intake_id,"index",text,emb,emb_sparse)
       VALUES ($1,0,$2,$3::vector,$4::sparsevec)`,
      [
        id,
        text,
        PgVectorService.toVector(fakeDense(i + 1)),
        PgVectorService.toSparsevec(fakeSparse(i + 1)),
      ],
    );
  }

  await ds0.query(`ANALYZE ${SCHEMA}.intake_chunks`);

  ds = new DataSource({
    type: 'postgres',
    ...DB,
    synchronize: false,
    logging: false,
    // Every pooled connection resolves unqualified names to the fixtures first,
    // then public (where f_unaccent and the vector operators live).
    extra: { options: `-c search_path=${SCHEMA},public` },
  });
  await ds.initialize();
  service = new PgVectorService(ds);
}, 120_000);

afterAll(async () => {
  if (ds?.isInitialized) await ds.destroy();
  if (bootstrap?.isInitialized) {
    await bootstrap.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    await bootstrap.destroy();
  }
});

const runSearch = (query: string, filter = {}, limit = 10) =>
  service.search(query, fakeDense(99), fakeSparse(99), filter, limit);

describe('PgVectorService.search (real SQL)', () => {
  it('never returns a non-published intake when statuses is set', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme', {
      statuses: ['published'],
    });
    expect(rows.map((r) => r.intake_id)).not.toContain(ID.draft);
    expect(rows.length).toBeGreaterThan(0);
  }, 60_000);

  it('never returns an intake owned by the excluded user', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme', {
      statuses: ['published'],
      excludeUserId: OWNER_B,
    });
    expect(rows.map((r) => r.intake_id)).not.toContain(ID.mine);
  }, 60_000);

  it('restricts to the requested intake type', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme', {
      statuses: ['published'],
      type: 'challenge',
    });
    expect(rows.map((r) => r.intake_id)).toEqual([ID.challenge]);
  }, 60_000);

  it('restricts to the requested sectors', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme', {
      statuses: ['published'],
      sectorIds: [SECTOR_2],
    });
    expect(rows.map((r) => r.intake_id)).toEqual([ID.challenge]);
  }, 60_000);

  it('applies no filter at all when none is given', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme');
    expect(rows.map((r) => r.intake_id)).toContain(ID.draft);
  }, 60_000);

  it('ranks the exact phrase above a document that only repeats its syllables', async () => {
    // The decoy contains "công nghệ" and "học" but never the phrase itself.
    const rows = await runSearch('công nghệ sinh học lên men enzyme', {
      statuses: ['published'],
      excludeUserId: OWNER_B,
      type: 'ip',
    });
    const ids = rows.map((r) => r.intake_id);
    expect(ids).toContain(ID.target);
    const target = ids.indexOf(ID.target);
    const decoy = ids.indexOf(ID.decoy);
    if (decoy !== -1) expect(target).toBeLessThan(decoy);
  }, 60_000);

  it('finds an accented document from a query typed without diacritics', async () => {
    const rows = await runSearch('cong nghe sinh hoc len men enzyme', {
      statuses: ['published'],
      type: 'ip',
    });
    expect(rows.map((r) => r.intake_id)).toContain(ID.target);
  }, 60_000);

  it('matches a patent number exactly — proves the trigram channel is wired', async () => {
    const rows = await runSearch('VN1-0012345', { statuses: ['published'] });
    expect(rows[0]?.intake_id).toBe(ID.ident);
  }, 60_000);

  it('matches a product code exactly', async () => {
    const rows = await runSearch('NCT-BIO-2024-X7', {
      statuses: ['published'],
    });
    expect(rows[0]?.intake_id).toBe(ID.ident);
  }, 60_000);

  it('produces RRF scores, never BM25-scale ones', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme');
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r.score).toBeGreaterThan(0);
      // Four channels, k=60: hard ceiling is 4 * 1/61.
      expect(r.score).toBeLessThanOrEqual(4 / 61 + 1e-9);
    }
    // Any minScore carried over from the Elasticsearch era would empty this.
    expect(Math.max(...rows.map((r) => r.score))).toBeLessThan(1.5);
  }, 60_000);

  it('returns results ordered by descending score', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme');
    const scores = rows.map((r) => r.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  }, 60_000);

  it('returns one row per intake, not one per chunk', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme');
    const ids = rows.map((r) => r.intake_id);
    expect(new Set(ids).size).toBe(ids.length);
  }, 60_000);

  it('honours the limit', async () => {
    const rows = await runSearch('công nghệ sinh học lên men enzyme', {}, 2);
    expect(rows.length).toBeLessThanOrEqual(2);
  }, 60_000);

  it('returns nothing rather than throwing when a filter matches no intake', async () => {
    const rows = await runSearch('công nghệ sinh học', {
      sectorIds: ['05000000-0000-0000-0000-0000000000ff'],
    });
    expect(rows).toEqual([]);
  }, 60_000);
});
