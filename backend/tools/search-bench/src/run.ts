/** Runs every engine config over both test families and prints the comparison. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Intake } from './corpus.js';
import { embed, waitForRag, type Embedding } from './embed.js';
import {
  BEHAVIOUR_CASES,
  buildKnownItemQueries,
  type KnownItemQuery,
} from './goldenset.js';
import * as ES from './engines/es.js';
import * as PG from './engines/pg.js';
import type { Hit } from './fuse.js';

const CACHE_DIR = new URL('../.cache/', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1',
);
const LIMIT = 10;

type EngineName = 'es-current' | 'es-fixed' | 'pg-2ch' | 'pg-hybrid';

const ENGINES: Record<
  EngineName,
  (q: string, e: Embedding) => Promise<Hit[]>
> = {
  'es-current': (q, e) => ES.searchCurrent(q, e, LIMIT),
  'es-fixed': (q, e) => ES.searchFixed(q, e, LIMIT),
  'pg-2ch': (q, e) => PG.search('2ch', q, e, LIMIT),
  'pg-hybrid': (q, e) => PG.search('hybrid', q, e, LIMIT),
};

const NAMES = Object.keys(ENGINES) as EngineName[];

// --- query embedding cache ---------------------------------------------------

async function embedQueries(queries: string[]): Promise<Map<string, Embedding>> {
  const path = `${CACHE_DIR}query-embeddings.json`;
  const cache = new Map<string, Embedding>();
  if (existsSync(path)) {
    for (const [q, v] of Object.entries<any>(
      JSON.parse(readFileSync(path, 'utf8')),
    )) {
      cache.set(q, { dense: v.d, sparse: new Map(v.s) });
    }
  }
  const missing = [...new Set(queries)].filter((q) => !cache.has(q));
  if (missing.length) {
    console.log(`  embedding ${missing.length} new queries...`);
    await waitForRag();
    const embs = await embed(missing, { sparse: true, batchSize: 8 });
    missing.forEach((q, i) => cache.set(q, embs[i]));
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(
      path,
      JSON.stringify(
        Object.fromEntries(
          [...cache.entries()].map(([q, e]) => [
            q,
            { d: e.dense, s: [...e.sparse.entries()] },
          ]),
        ),
      ),
    );
  } else {
    console.log(`  all ${queries.length} query embeddings cached`);
  }
  return cache;
}

// --- metrics -----------------------------------------------------------------

function pct(n: number, d: number) {
  return d === 0 ? '  n/a' : `${((n / d) * 100).toFixed(1).padStart(5)}%`;
}

function percentile(xs: number[], p: number) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

interface EngineResult {
  behaviour: Map<string, boolean>;
  recallAt: { 1: number; 5: number; 10: number };
  mrr: number;
  byKind: Map<string, { hit: number; total: number }>;
  starvation: number;
  latencies: number[];
  totalQueries: number;
}

async function runEngine(
  name: EngineName,
  kiQueries: KnownItemQuery[],
  qEmb: Map<string, Embedding>,
): Promise<EngineResult> {
  const fn = ENGINES[name];
  const res: EngineResult = {
    behaviour: new Map(),
    recallAt: { 1: 0, 5: 0, 10: 0 },
    mrr: 0,
    byKind: new Map(),
    starvation: 0,
    latencies: [],
    totalQueries: kiQueries.length,
  };

  // Family B — behavioural
  for (const c of BEHAVIOUR_CASES) {
    const e = qEmb.get(c.query)!;
    try {
      const hits = await fn(c.query, e);
      res.behaviour.set(c.id, c.check(hits.map((h) => h.intakeId)));
    } catch (err: any) {
      console.error(`  [${name}] case ${c.id} threw: ${err.message}`);
      res.behaviour.set(c.id, false);
    }
  }

  // Family A — known-item
  for (const q of kiQueries) {
    const e = qEmb.get(q.query)!;
    const t = process.hrtime.bigint();
    let hits: Hit[] = [];
    try {
      hits = await fn(q.query, e);
    } catch (err: any) {
      console.error(`  [${name}] query threw: ${err.message}`);
    }
    res.latencies.push(Number(process.hrtime.bigint() - t) / 1e6);

    const ids = hits.map((h) => h.intakeId);
    const rank = ids.indexOf(q.expected);
    if (rank === 0) res.recallAt[1]++;
    if (rank >= 0 && rank < 5) res.recallAt[5]++;
    if (rank >= 0 && rank < 10) res.recallAt[10]++;
    if (rank >= 0) res.mrr += 1 / (rank + 1);

    const k = res.byKind.get(q.kind) ?? { hit: 0, total: 0 };
    k.total++;
    if (rank >= 0 && rank < 10) k.hit++;
    res.byKind.set(q.kind, k);

    res.starvation += hits.length;
  }

  res.mrr /= kiQueries.length;
  res.starvation /= kiQueries.length;
  return res;
}

// --- report ------------------------------------------------------------------

function report(results: Map<EngineName, EngineResult>) {
  const pad = (s: string, n: number) => s.padEnd(n);
  const col = 12;

  console.log('\n\n════════════════════════════════════════════════════════════════════');
  console.log(' FAMILY B — BEHAVIOURAL PASS/FAIL  (absolute, baseline-independent)');
  console.log('════════════════════════════════════════════════════════════════════');
  console.log(
    pad('case', 32) + NAMES.map((n) => pad(n, col)).join(''),
  );
  console.log('─'.repeat(32 + col * NAMES.length));
  for (const c of BEHAVIOUR_CASES) {
    const row = NAMES.map((n) =>
      pad(results.get(n)!.behaviour.get(c.id) ? '  PASS' : '  FAIL', col),
    ).join('');
    console.log(pad(c.id, 32) + row);
  }
  console.log('─'.repeat(32 + col * NAMES.length));
  console.log(
    pad('TOTAL PASSED', 32) +
      NAMES.map((n) => {
        const r = results.get(n)!;
        const p = [...r.behaviour.values()].filter(Boolean).length;
        return pad(`  ${p}/${BEHAVIOUR_CASES.length}`, col);
      }).join(''),
  );

  console.log('\n\n════════════════════════════════════════════════════════════════════');
  console.log(' FAMILY A — KNOWN-ITEM RETRIEVAL');
  console.log('════════════════════════════════════════════════════════════════════');
  const first = results.get(NAMES[0])!;
  console.log(` ${first.totalQueries} queries, limit=${LIMIT}\n`);
  console.log(pad('metric', 32) + NAMES.map((n) => pad(n, col)).join(''));
  console.log('─'.repeat(32 + col * NAMES.length));

  const rows: [string, (r: EngineResult) => string][] = [
    ['Recall@1', (r) => pct(r.recallAt[1], r.totalQueries)],
    ['Recall@5', (r) => pct(r.recallAt[5], r.totalQueries)],
    ['Recall@10', (r) => pct(r.recallAt[10], r.totalQueries)],
    ['MRR', (r) => r.mrr.toFixed(3).padStart(6)],
    ['avg results returned (of 10)', (r) => r.starvation.toFixed(2).padStart(6)],
    ['latency p50 (ms)', (r) => percentile(r.latencies, 50).toFixed(1).padStart(6)],
    ['latency p95 (ms)', (r) => percentile(r.latencies, 95).toFixed(1).padStart(6)],
  ];
  for (const [label, f] of rows) {
    console.log(
      pad(label, 32) +
        NAMES.map((n) => pad(`  ${f(results.get(n)!)}`, col)).join(''),
    );
  }

  console.log('\n Recall@10 by query kind:');
  console.log('─'.repeat(32 + col * NAMES.length));
  const kinds = ['title', 'title-noaccent', 'keywords', 'body-phrase'];
  for (const k of kinds) {
    console.log(
      pad(`  ${k}`, 32) +
        NAMES.map((n) => {
          const s = results.get(n)!.byKind.get(k);
          return pad(s ? `  ${pct(s.hit, s.total)}` : '  n/a', col);
        }).join(''),
    );
  }
  console.log();
}

// --- main --------------------------------------------------------------------

async function main() {
  const corpus = JSON.parse(readFileSync(`${CACHE_DIR}corpus.json`, 'utf8'));
  const intakes: Intake[] = corpus.intakes;
  const strippedBody = new Map<string, string>(
    Object.entries(corpus.strippedBody),
  );

  const kiQueries = buildKnownItemQueries(intakes, strippedBody).filter(
    (q) => q.query.trim().length > 0,
  );

  console.log('=== Preparing query embeddings ===');
  const allQueries = [
    ...BEHAVIOUR_CASES.map((c) => c.query),
    ...kiQueries.map((q) => q.query),
  ];
  const qEmb = await embedQueries(allQueries);

  const results = new Map<EngineName, EngineResult>();
  for (const name of NAMES) {
    console.log(`\n=== Running ${name} ===`);
    const t = Date.now();
    results.set(name, await runEngine(name, kiQueries, qEmb));
    console.log(`  done in ${((Date.now() - t) / 1000).toFixed(1)}s`);
  }

  report(results);

  writeFileSync(
    `${CACHE_DIR}results.json`,
    JSON.stringify(
      Object.fromEntries(
        [...results.entries()].map(([n, r]) => [
          n,
          {
            behaviour: Object.fromEntries(r.behaviour),
            recallAt: r.recallAt,
            mrr: r.mrr,
            starvation: r.starvation,
            p50: percentile(r.latencies, 50),
            p95: percentile(r.latencies, 95),
            totalQueries: r.totalQueries,
          },
        ]),
      ),
      null,
      2,
    ),
  );

  await PG.pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
