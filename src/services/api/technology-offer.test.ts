import { describe, expect, it } from "vitest";
import {
  PROVINCIAL_AUTHORITIES_CATALOG,
  resolveDefaultAuthority,
} from "./technology-offer";

describe("resolveDefaultAuthority & PROVINCIAL_AUTHORITIES_CATALOG (Delta v9)", () => {
  it("includes VN-TN (Sở KH&CN tỉnh Thái Nguyên) at top of PROVINCIAL_AUTHORITIES_CATALOG", () => {
    expect(PROVINCIAL_AUTHORITIES_CATALOG[0].id).toBe("VN-TN");
    expect(PROVINCIAL_AUTHORITIES_CATALOG[0].name).toContain("Thái Nguyên");
    expect(PROVINCIAL_AUTHORITIES_CATALOG.length).toBeGreaterThanOrEqual(25);
  });

  it("Level 1: resolves from userScopeId or user.scopeId (VN-TN, TN, Thái Nguyên)", () => {
    const r1 = resolveDefaultAuthority({ userScopeId: "VN-TN" });
    expect(r1.id).toBe("VN-TN");
    expect(r1.isAutoDetected).toBe(true);
    expect(r1.detectedFrom).toBe("user_scope");

    const r2 = resolveDefaultAuthority({ userScopeId: "TN" });
    expect(r2.id).toBe("VN-TN");

    const r3 = resolveDefaultAuthority({ scopeId: "VN-HP" });
    expect(r3.id).toBe("VN-HP");

    const r4 = resolveDefaultAuthority({ scopeId: "HCM" });
    expect(r4.id).toBe("VN-SG");
  });

  it("Level 2: resolves from profile province/provinceCity", () => {
    const r1 = resolveDefaultAuthority(null, { province: "Thái Nguyên" });
    expect(r1.id).toBe("VN-TN");
    expect(r1.isAutoDetected).toBe(true);
    expect(r1.detectedFrom).toBe("profile_province");

    const r2 = resolveDefaultAuthority(null, { provinceCity: "TP. Hồ Chí Minh" });
    expect(r2.id).toBe("VN-SG");

    const r3 = resolveDefaultAuthority(null, { province: "Đà Nẵng" });
    expect(r3.id).toBe("VN-DN");
  });

  it("Level 3: resolves from profile address/addressDetail", () => {
    const r1 = resolveDefaultAuthority(null, {
      address: "Xóm Chùa, xã Thịnh Đức, Thành phố Thái Nguyên, Tỉnh Thái Nguyên",
    });
    expect(r1.id).toBe("VN-TN");
    expect(r1.isAutoDetected).toBe(true);
    expect(r1.detectedFrom).toBe("profile_address");

    const r2 = resolveDefaultAuthority(null, {
      addressDetail: "Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
    });
    expect(r2.id).toBe("VN-HN");
  });

  it("Level 4: falls back to VN-HN when context is empty", () => {
    const r1 = resolveDefaultAuthority();
    expect(r1.id).toBe("VN-HN");
    expect(r1.name).toContain("Hà Nội");
    expect(r1.isAutoDetected).toBe(false);
    expect(r1.detectedFrom).toBe("fallback");

    const r2 = resolveDefaultAuthority(null, {});
    expect(r2.id).toBe("VN-HN");
  });
});
