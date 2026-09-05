import { PgVectorService, SPARSE_DIM } from './pgvector.service';

/**
 * toSparsevec turns BGE-M3's lexical weights into a pgvector sparsevec literal.
 * Every rule below is load-bearing: get the index base wrong and the sparse
 * channel silently retrieves against the wrong tokens, get the ordering wrong
 * and Postgres rejects the literal outright.
 */
describe('PgVectorService.toSparsevec', () => {
  const parse = (literal: string) => {
    const m = /^\{(.*)\}\/(\d+)$/.exec(literal);
    expect(m).not.toBeNull();
    const [, body, dim] = m!;
    return {
      dim: Number(dim),
      entries: body
        ? body.split(',').map((p) => {
            const [i, v] = p.split(':');
            return [Number(i), Number(v)] as const;
          })
        : [],
    };
  };

  it('emits an empty element set for no weights, never an explicit zero', () => {
    // pgvector rejects a zero-valued element, so `{1:0}` would be invalid.
    expect(PgVectorService.toSparsevec({})).toBe(`{}/${SPARSE_DIM}`);
  });

  it('shifts BGE-M3 token ids from 0-based to pgvector 1-based indexing', () => {
    const { entries } = parse(PgVectorService.toSparsevec({ '0': 0.5 }));
    expect(entries).toEqual([[1, 0.5]]);
  });

  it('always declares the BGE-M3 vocabulary size as the dimension', () => {
    expect(parse(PgVectorService.toSparsevec({ '7': 0.1 })).dim).toBe(
      SPARSE_DIM,
    );
    expect(SPARSE_DIM).toBe(250002);
  });

  it('orders elements by ascending index, whatever order they arrive in', () => {
    const { entries } = parse(
      PgVectorService.toSparsevec({ '10': 0.1, '2': 0.9, '77': 0.4 }),
    );
    expect(entries.map(([i]) => i)).toEqual([3, 11, 78]);
  });

  it('drops zero, negative and non-finite weights', () => {
    expect(
      PgVectorService.toSparsevec({
        '5': 0,
        '6': -0.3,
        '7': Number.NaN,
        '8': Number.POSITIVE_INFINITY,
      }),
    ).toBe(`{}/${SPARSE_DIM}`);
  });

  it('drops token ids that would fall outside the declared dimension', () => {
    // token id SPARSE_DIM would become index SPARSE_DIM + 1.
    const literal = PgVectorService.toSparsevec({
      [String(SPARSE_DIM)]: 0.9,
      '3': 0.2,
    });
    expect(parse(literal).entries).toEqual([[4, 0.2]]);
  });

  it('truncates to the 1000 non-zero elements pgvector will index, keeping the heaviest', () => {
    const weights: Record<string, number> = {};
    for (let i = 0; i < 1500; i++) {
      // Ascending weight, so the heaviest are the highest token ids.
      weights[String(i)] = (i + 1) / 1500;
    }

    const { entries } = parse(PgVectorService.toSparsevec(weights));

    expect(entries).toHaveLength(1000);
    // Kept the top 1000 by weight: token ids 500..1499 -> indices 501..1500.
    expect(entries[0][0]).toBe(501);
    expect(entries[entries.length - 1][0]).toBe(1500);
    // Still ascending by index after the truncation re-sort.
    const indices = entries.map(([i]) => i);
    expect([...indices].sort((a, b) => a - b)).toEqual(indices);
  });

  it('produces a literal Postgres can parse for a realistic chunk', () => {
    const weights: Record<string, number> = {};
    for (let i = 0; i < 180; i++) weights[String(i * 37)] = 0.01 + i / 1000;

    const literal = PgVectorService.toSparsevec(weights);

    expect(literal).toMatch(/^\{\d+:[\d.e-]+(,\d+:[\d.e-]+)*\}\/250002$/);
    expect(parse(literal).entries).toHaveLength(180);
  });
});

describe('PgVectorService.toVector', () => {
  it('serialises a dense vector as the array literal pgvector accepts', () => {
    expect(PgVectorService.toVector([0.1, -0.2, 0.3])).toBe('[0.1,-0.2,0.3]');
  });
});
