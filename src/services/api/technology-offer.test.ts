import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  PROVINCIAL_AUTHORITIES_CATALOG,
  resolveDefaultAuthority,
  submitQuickDemand,
} from "./technology-offer";
import { authClient } from "@/lib/auth-client";

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

describe("submitQuickDemand (CR-TASK-03-DELTA-02 / Task 6.1)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("attaches Authorization Bearer token when user is logged in", async () => {
    vi.spyOn(authClient, "getToken").mockReturnValue("test-mock-jwt-token-123");

    let capturedHeaders: any = null;
    let capturedBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      capturedHeaders = init?.headers;
      capturedBody = JSON.parse(init?.body || "{}");
      return {
        ok: true,
        json: async () => ({
          success: true,
          itemId: "item-123",
          itemCode: "DMD-20261030-01",
          message: "Đăng bài toán nhu cầu công nghệ thành công.",
        }),
      };
    }) as any;

    const payload = {
      technicalProblem: "Cần đặt mua thiết bị chế biến chè",
      expectedGoal: "Nâng cao năng suất",
      needConsulting: true,
      urgencyScore: 4,
      impactScore: 4,
      investmentCapacity: 4,
      adoptionReadiness: 4,
      offerId: "tech-101",
      offerTitle: "Dây chuyền sấy chè",
      offerCode: "TECH-TN-01",
      isCommercialOrder: true,
    };

    const result = await submitQuickDemand(payload);

    expect(authClient.getToken).toHaveBeenCalled();
    expect(capturedHeaders["Authorization"]).toBe("Bearer test-mock-jwt-token-123");
    expect(capturedHeaders["Content-Type"]).toBe("application/json");
    expect(capturedBody.offerId).toBe("tech-101");
    expect(capturedBody.offerCode).toBe("TECH-TN-01");
    expect(capturedBody.isCommercialOrder).toBe(true);
    expect(result.success).toBe(true);
    expect(result.itemCode).toBe("DMD-20261030-01");
  });

  it("does not attach Authorization header when user is anonymous (no token)", async () => {
    vi.spyOn(authClient, "getToken").mockReturnValue(null);

    let capturedHeaders: any = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      capturedHeaders = init?.headers;
      return {
        ok: true,
        json: async () => ({
          success: true,
          itemId: "item-anon",
          itemCode: "DMD-ANON-01",
        }),
      };
    }) as any;

    const payload = {
      technicalProblem: "Bài toán R&D",
      expectedGoal: "Giải pháp",
      needConsulting: false,
      urgencyScore: 3,
      impactScore: 3,
      investmentCapacity: 3,
      adoptionReadiness: 3,
    };

    const result = await submitQuickDemand(payload);

    expect(capturedHeaders["Authorization"]).toBeUndefined();
    expect(result.success).toBe(true);
  });

  it("handles HTTP 401 Unauthorized or failure response gracefully", async () => {
    vi.spyOn(authClient, "getToken").mockReturnValue("expired-token");

    global.fetch = vi.fn().mockImplementation(async () => {
      return {
        ok: false,
        status: 401,
        json: async () => ({ message: "Phiên làm việc đã hết hạn." }),
      };
    }) as any;

    const result = await submitQuickDemand({
      technicalProblem: "Test",
      expectedGoal: "Goal",
      needConsulting: false,
      urgencyScore: 1,
      impactScore: 1,
      investmentCapacity: 1,
      adoptionReadiness: 1,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Phiên làm việc đã hết hạn.");
  });
});
