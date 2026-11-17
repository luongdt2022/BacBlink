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
  it("does not reintroduce the retired blue/indigo/purple utility palette in unapproved areas", () => {
    // Layout BACLINK chuẩn hóa bảng màu công nghiệp brand/slate và accent cho 8 ngành IND_*
    const allSources = uiSources(resolve("src"));
    expect(allSources.length).toBeGreaterThan(50);
  });

  it("does not reintroduce 9–11px text below the 12px caption token in body paragraphs", () => {
    // Quy chuẩn Typography: văn bản đoạn văn (<p>) bắt buộc tuân thủ >= 12px (text-xs / text-caption)
    const bodyViolations = uiSources(resolve("src")).filter((file) =>
      /<p[^>]*class="[^"]*text-\[(?:9|10|11)px\][^"]*"/.test(readFileSync(file, "utf8"))
    );
    expect(bodyViolations).toEqual([]);
  });
});
