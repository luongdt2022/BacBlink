/**
 * Loads the real DMST seed corpus straight out of the NestJS repo's seed files,
 * without booting NestJS/TypeORM. The seed modules are pure data arrays, so we
 * strip their imports, transpile the TS away, and evaluate the literals.
 *
 * Chunking mirrors production: stripHtml -> recursive split at 1500/150.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { transformSync } from 'esbuild';

export const SEED_DIR =
  'd:/Code/TakeOp/NacenTech/SourceCode/dmst-backend-main/dmst-backend-main/src/database/scripts/seed-intakes';

export const CHUNK_SIZE = 1500;
export const CHUNK_OVERLAP = 150;

export interface Intake {
  id: string;
  title: string;
  content: string;
  type: 'ip' | 'challenge';
  sectorNames: string[];
}

export interface Chunk {
  intakeId: string;
  chunkIndex: number;
  text: string;
  intakeTitle: string;
  intakeType: 'ip' | 'challenge';
  sectorNames: string[];
}

// --- seed extraction ---------------------------------------------------------

function evalSeedFile(path: string): any[] {
  const raw = readFileSync(path, 'utf8');

  // Drop imports and the `if (require.main === module)` runner tail.
  const body = raw
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*$/gm, '')
    .replace(/if\s*\(\s*require\.main\s*===\s*module\s*\)[\s\S]*$/m, '');

  const js = transformSync(body, {
    loader: 'ts',
    format: 'cjs',
    target: 'es2022',
  }).code;

  // Sandbox: provide the one enum the seeds reference, capture exports.
  // esbuild's cjs output REASSIGNS module.exports, so read it back from there.
  const IntakeType = { IP: 'ip', CHALLENGE: 'challenge' };
  const exportsObj: Record<string, any> = {};
  const moduleObj = { exports: exportsObj };
  // eslint-disable-next-line no-new-func
  new Function('exports', 'module', 'IntakeType', 'require', js)(
    exportsObj,
    moduleObj,
    IntakeType,
    () => ({}),
  );
  const ns: Record<string, any> = moduleObj.exports ?? exportsObj;

  // ALL_SEEDS is a concat of the others, so prefer it when present to avoid dupes.
  if (Array.isArray(ns.ALL_SEEDS)) return ns.ALL_SEEDS;

  const out: any[] = [];
  for (const [name, val] of Object.entries(ns)) {
    if (name === 'default' || name === '__esModule') continue;
    if (Array.isArray(val) && val.length && val[0]?.title) out.push(...val);
  }
  if (out.length === 0) {
    throw new Error(
      `no seed arrays extracted from ${path} (exports: ${Object.keys(ns).join(', ') || 'none'})`,
    );
  }
  return out;
}

export function loadIntakes(): Intake[] {
  const files = readdirSync(SEED_DIR)
    .filter((f) => /^\d\d-.*\.ts$/.test(f))
    .sort();

  const intakes: Intake[] = [];
  const seenTitles = new Set<string>();

  for (const f of files) {
    for (const s of evalSeedFile(join(SEED_DIR, f))) {
      if (!s?.title || !s?.content) continue;
      if (seenTitles.has(s.title)) continue; // seeds upsert on title in prod
      seenTitles.add(s.title);
      intakes.push({
        id: `intake-${String(intakes.length + 1).padStart(4, '0')}`,
        title: s.title,
        content: s.content,
        type: s.type === 'challenge' ? 'challenge' : 'ip',
        sectorNames: s.sectorNames ?? [],
      });
    }
  }
  return intakes;
}

// --- chunking (mirrors langchain RecursiveCharacterTextSplitter) -------------

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitRecursive(text: string, seps: string[]): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const [sep, ...rest] = seps;
  if (sep === undefined) {
    // No separator left — hard-cut.
    const out: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      out.push(text.slice(i, i + CHUNK_SIZE));
    }
    return out;
  }
  const parts = sep === '' ? [text] : text.split(sep);
  const pieces: string[] = [];
  for (const p of parts) {
    if (p.length > CHUNK_SIZE) pieces.push(...splitRecursive(p, rest));
    else if (p.length) pieces.push(p);
  }
  // Merge pieces back up to CHUNK_SIZE with CHUNK_OVERLAP carry-over.
  const merged: string[] = [];
  let buf = '';
  for (const p of pieces) {
    const cand = buf ? buf + sep + p : p;
    if (cand.length > CHUNK_SIZE && buf) {
      merged.push(buf);
      const carry = buf.slice(-CHUNK_OVERLAP);
      buf = carry + sep + p;
    } else {
      buf = cand;
    }
  }
  if (buf) merged.push(buf);
  return merged;
}

export function chunkIntake(intake: Intake): Chunk[] {
  const text = stripHtml(intake.content);
  const parts = splitRecursive(text, ['\n\n', '\n', ' ', '']);
  return parts.map((t, i) => ({
    intakeId: intake.id,
    chunkIndex: i,
    text: t.trim(),
    intakeTitle: intake.title,
    intakeType: intake.type,
    sectorNames: intake.sectorNames,
  }));
}

export function buildCorpus(): { intakes: Intake[]; chunks: Chunk[] } {
  const intakes = loadIntakes();
  const chunks = intakes.flatMap(chunkIntake).filter((c) => c.text.length > 0);
  return { intakes, chunks };
}
