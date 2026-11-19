import { describe, it, expect } from "vitest";
import { ORG, ORG_DECISION_TEXT, BACLINK_COMMITTEES, COMMITTEE_BLOCKS } from "./organization";

describe("ORG single source (BR-BL08-SINGLE-SOURCE-001)", () => {
  it("có đủ trường pháp nhân & liên hệ", () => {
    expect(ORG.decision.number).toMatch(/^\d+\/QĐ-UBND$/);
    // Liên hệ lấy từ web THT đã được gỡ: không được xuất hiện lại trong ORG khi chưa có kênh chính thức.
    expect(Object.keys(ORG)).not.toEqual(expect.arrayContaining(["phoneTel"]));
    expect(Object.keys(ORG)).not.toContain("email");
    expect(Object.keys(ORG)).not.toContain("zaloUrl");
    expect(ORG_DECISION_TEXT).toContain(ORG.decision.number);
  });

  it("9 ban thuộc đúng 4 khối, mã duy nhất, không bịa tên trưởng ban", () => {
    expect(BACLINK_COMMITTEES).toHaveLength(9);
    expect(new Set(BACLINK_COMMITTEES.map((c) => c.code)).size).toBe(9);
    expect(new Set(BACLINK_COMMITTEES.map((c) => c.block))).toEqual(new Set(Object.keys(COMMITTEE_BLOCKS)));
    BACLINK_COMMITTEES.forEach((c) => expect(c.head).toBeNull());
  });
});
