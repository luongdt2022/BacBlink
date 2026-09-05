/** Offline smoke test: corpus extraction + golden set, no services needed. */
import { buildCorpus, chunkIntake, stripHtml } from './corpus.js';
import { PROBE_DOCS, BEHAVIOUR_CASES, buildKnownItemQueries } from './goldenset.js';

const { intakes } = buildCorpus();
const all = [...intakes, ...PROBE_DOCS];
const chunks = all.flatMap(chunkIntake).filter((c) => c.text);

console.log('=== corpus ===');
console.log(`intakes      : ${all.length} (${intakes.length} real + ${PROBE_DOCS.length} probes)`);
console.log(`  ip         : ${all.filter((i) => i.type === 'ip').length}`);
console.log(`  challenge  : ${all.filter((i) => i.type === 'challenge').length}`);
console.log(`chunks       : ${chunks.length}`);
const lens = chunks.map((c) => c.text.length).sort((a, b) => a - b);
console.log(`chunk chars  : min=${lens[0]} p50=${lens[Math.floor(lens.length / 2)]} max=${lens.at(-1)}`);
console.log(`chunks/intake: ${(chunks.length / all.length).toFixed(2)}`);

const sectors = new Set(all.flatMap((i) => i.sectorNames));
console.log(`sectors      : ${sectors.size}`);

console.log('\n=== sample titles ===');
for (const i of all.slice(0, 3)) console.log(`  - ${i.title}`);
console.log(`  ... (${all.length - 3} more)`);

const stripped = new Map(all.map((i) => [i.id, stripHtml(i.content)]));
const ki = buildKnownItemQueries(all, stripped);
console.log('\n=== golden set ===');
console.log(`behavioural cases : ${BEHAVIOUR_CASES.length}`);
console.log(`known-item queries: ${ki.length}`);
for (const k of ['title', 'title-noaccent', 'keywords', 'body-phrase']) {
  console.log(`  ${k.padEnd(16)}: ${ki.filter((q) => q.kind === k).length}`);
}
console.log('\n=== sample known-item queries ===');
for (const k of ['title-noaccent', 'keywords', 'body-phrase']) {
  const q = ki.find((x) => x.kind === k)!;
  console.log(`  [${k}] "${q.query.slice(0, 90)}${q.query.length > 90 ? '...' : ''}" -> ${q.expected}`);
}

// Probe sanity: the decoy must not literally contain the target phrase.
const decoy = stripped.get('probe-decoy-syllables')!.toLowerCase();
const target = stripped.get('probe-target-biotech')!.toLowerCase();
console.log('\n=== probe sanity ===');
console.log(`decoy contains "công nghệ sinh học" : ${decoy.includes('công nghệ sinh học')}  (must be false)`);
console.log(`decoy contains "công nghệ"          : ${decoy.includes('công nghệ')}  (must be true)`);
console.log(`decoy contains "học"                : ${decoy.includes('học')}  (must be true)`);
console.log(`target contains "công nghệ sinh học": ${target.includes('công nghệ sinh học')}  (must be true)`);
