import { describe, expect, it } from "vitest";
import { PROVINCES_34, PROVINCE_CODES_34, getProvinceByCode } from "./provinces";

describe("PROVINCES_34 (T058 - BR-ADMIN-34PROV)", () => {
  it("contains exactly 34 key innovation provinces plus ALL", () => {
    // Excluding "ALL", there must be exactly 34 provinces
    expect(PROVINCE_CODES_34).toHaveLength(34);
    expect(PROVINCES_34).toHaveLength(35);
  });

  it("includes ALL as the first item with proper wording", () => {
    expect(PROVINCES_34[0].code).toBe("ALL");
    expect(PROVINCES_34[0].name).toContain("34 Tỉnh / Thành phố trọng điểm ĐMST");
  });

  it("includes centrally-governed cities (HN, HP, DN, CT, SG)", () => {
    expect(getProvinceByCode("HN")?.name).toBe("Hà Nội");
    expect(getProvinceByCode("HP")?.name).toBe("Hải Phòng");
    expect(getProvinceByCode("DN")?.name).toBe("Đà Nẵng");
    expect(getProvinceByCode("CT")?.name).toBe("Cần Thơ");
    expect(getProvinceByCode("SG")?.name).toBe("TP. Hồ Chí Minh");
  });

  it("resolves provinces case-insensitively", () => {
    expect(getProvinceByCode("hn")?.name).toBe("Hà Nội");
    expect(getProvinceByCode("sg")?.name).toBe("TP. Hồ Chí Minh");
  });
});
