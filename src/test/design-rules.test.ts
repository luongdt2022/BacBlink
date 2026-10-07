import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { describe, expect, it } from "vitest";

function uiSources(dir: string): string[] {
  return readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? uiSources(file) : file.endsWith('.tsx') && !file.endsWith('.test.tsx') ? [file] : [];
  });
}

describe("Design rule guard for current and future screens", () => {
  it("does not reintroduce the retired blue/indigo/purple utility palette", () => {
    const violations = uiSources(resolve('src')).filter(file => /\b(?:bg|text|border|from|via|to|ring|shadow)-(?:blue|indigo|purple)-\d+/.test(readFileSync(file, 'utf8')));
    expect(violations).toEqual([]);
  });
  it("does not reintroduce 9–11px text below the 12px caption token", () => {
    const violations = uiSources(resolve('src')).filter(file => /\btext-\[(?:9|10|11)px\]/.test(readFileSync(file, 'utf8')));
    expect(violations).toEqual([]);
  });
});
