/**
 * Two independent test families, both objective — no human relevance judgments
 * needed, which is what makes this runnable today.
 *
 * A. Known-item retrieval. Queries are derived from a specific document, so the
 *    correct answer is known by construction. Gives Recall@k and MRR.
 *
 * B. Behavioural pass/fail. Hand-built Vietnamese cases with purpose-made probe
 *    documents. These are absolute: an engine either does the right thing or it
 *    does not, independent of any baseline.
 */
import type { Intake } from './corpus.js';

// --- probe documents injected into the corpus --------------------------------

export const PROBE_DOCS: Intake[] = [
  {
    id: 'probe-decoy-syllables',
    title: 'Ứng dụng công nghệ thông tin trong đào tạo và học liệu số',
    type: 'ip',
    sectorNames: ['Công nghệ thông tin'],
    // Contains "công nghệ" and "học" repeatedly but NEVER "công nghệ sinh học".
    content: `<p>Nền tảng ứng dụng công nghệ số phục vụ giảng dạy. Hệ thống công nghệ
      quản lý học liệu, hỗ trợ người học tra cứu tài liệu học tập. Công nghệ
      trình chiếu và công nghệ lưu trữ đám mây giúp việc học trở nên linh hoạt.
      Người học có thể học mọi lúc. Đội ngũ công nghệ liên tục cập nhật.
      Chương trình học được thiết kế theo năng lực của từng người học.</p>`,
  },
  {
    id: 'probe-target-biotech',
    title: 'Quy trình sản xuất chế phẩm bằng công nghệ sinh học',
    type: 'ip',
    sectorNames: ['Dược phẩm'],
    content: `<p>Dây chuyền ứng dụng công nghệ sinh học để lên men và tinh chế chế phẩm
      enzyme dùng trong nông nghiệp. Quy trình công nghệ sinh học khép kín, kiểm soát
      nhiệt độ và pH tự động, đạt hiệu suất thu hồi trên 85%. Sản phẩm đã được thử
      nghiệm tại ba tỉnh đồng bằng sông Cửu Long.</p>`,
  },
  {
    id: 'probe-identifiers',
    title: 'Vật liệu nano composite kháng khuẩn cho thiết bị y tế',
    type: 'ip',
    sectorNames: ['Y tế'],
    content: `<p>Sáng chế đã được cấp bằng độc quyền số VN1-0012345 ngày 12/03/2024.
      Mã sản phẩm thương mại NCT-BIO-2024-X7. Vật liệu nano composite phủ bề mặt
      dụng cụ y tế, ức chế trên 99% vi khuẩn Staphylococcus aureus. Đơn vị chủ trì
      là Viện Khoa học Vật liệu Ứng dụng.</p>`,
  },
  {
    id: 'probe-tone-placement',
    title: 'Hệ thống hoà giải tranh chấp trực tuyến cho doanh nghiệp',
    type: 'ip',
    sectorNames: ['Công nghệ thông tin'],
    content: `<p>Nền tảng hoà giải trực tuyến giúp các bên đạt thoả thuận mà không cần
      ra toà. Quy trình hoà giải được số hoá hoàn toàn, có chữ ký số và biên bản
      hoà giải điện tử hợp lệ. Hệ thống đã hoà giải thành công hơn 1.200 vụ việc.</p>`,
  },
];

// --- family B: behavioural pass/fail -----------------------------------------

export type CaseCheck = (ranked: string[]) => boolean;

export interface BehaviourCase {
  id: string;
  why: string;
  query: string;
  check: CaseCheck;
}

const topN = (ranked: string[], n: number) => ranked.slice(0, n);

export const BEHAVIOUR_CASES: BehaviourCase[] = [
  {
    id: 'phrase-not-bag-of-syllables',
    why: '"công nghệ sinh học" must not be satisfied by a doc that merely repeats "công nghệ" and "học" separately',
    query: 'công nghệ sinh học',
    check: (r) => {
      const target = r.indexOf('probe-target-biotech');
      const decoy = r.indexOf('probe-decoy-syllables');
      if (target === -1) return false;
      return decoy === -1 || target < decoy;
    },
  },
  {
    id: 'diacritics-stripped-query',
    why: '"cong nghe sinh hoc" typed without diacritics must still find the biotech doc',
    query: 'cong nghe sinh hoc',
    check: (r) => topN(r, 5).includes('probe-target-biotech'),
  },
  {
    id: 'diacritics-preserved-meaning',
    why: 'a fully accented query must not lose discrimination — accented query still ranks the real match above the decoy',
    query: 'quy trình công nghệ sinh học lên men enzyme',
    check: (r) => r[0] === 'probe-target-biotech',
  },
  {
    id: 'tone-mark-placement',
    why: '"hòa giải" (old orthography) and "hoà giải" (new) must reach the same document',
    query: 'hòa giải tranh chấp trực tuyến',
    check: (r) => topN(r, 5).includes('probe-tone-placement'),
  },
  {
    id: 'unicode-nfd-query',
    why: 'a query submitted in NFD (combining marks) must match NFC-indexed text',
    query: 'hoà giải tranh chấp trực tuyến'.normalize('NFD'),
    check: (r) => topN(r, 5).includes('probe-tone-placement'),
  },
  {
    id: 'english-inside-vietnamese',
    why: 'English technical terms embedded in Vietnamese text must be findable',
    query: 'Zero Trust Network Access',
    check: (r) => r.length > 0 && topN(r, 5).some((id) => id.startsWith('intake-')),
  },
  {
    id: 'patent-number-exact',
    why: 'a patent number must match exactly — this is where the sparse channel is weak, so it proves the exact/trigram channel is actually wired up',
    query: 'VN1-0012345',
    check: (r) => r[0] === 'probe-identifiers',
  },
  {
    id: 'product-code-exact',
    why: 'a product code must match exactly',
    query: 'NCT-BIO-2024-X7',
    check: (r) => r[0] === 'probe-identifiers',
  },
];

// --- family A: known-item retrieval ------------------------------------------

export interface KnownItemQuery {
  query: string;
  expected: string;
  kind: 'title' | 'title-noaccent' | 'body-phrase' | 'keywords';
}

function stripAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const STOP = new Set([
  'và','cho','của','các','một','trong','với','trên','từ','được','có','là',
  'tại','theo','đến','này','đó','những','khi','để','bằng','về','hệ','thống',
]);

function keywordsOf(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .slice(0, 5)
    .join(' ');
}

/** Pull a distinctive mid-document sentence — not the title, not the opening. */
function bodyPhrase(text: string): string | null {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 60 && s.length < 220);
  if (sentences.length < 3) return null;
  return sentences[Math.floor(sentences.length / 2)];
}

export function buildKnownItemQueries(
  intakes: Intake[],
  strippedBody: Map<string, string>,
): KnownItemQuery[] {
  const out: KnownItemQuery[] = [];
  for (const it of intakes) {
    out.push({ query: it.title, expected: it.id, kind: 'title' });
    out.push({
      query: stripAccents(it.title),
      expected: it.id,
      kind: 'title-noaccent',
    });
    out.push({
      query: keywordsOf(it.title),
      expected: it.id,
      kind: 'keywords',
    });
    const body = strippedBody.get(it.id);
    const phrase = body ? bodyPhrase(body) : null;
    if (phrase) {
      out.push({ query: phrase, expected: it.id, kind: 'body-phrase' });
    }
  }
  return out;
}
