import { describe, it, expect } from "vitest";
import { resolveExpertActiveMenu } from "./expert-nav";

describe("resolveExpertActiveMenu (T131 & T135)", () => {
  it("resolves account route properly", () => {
    expect(resolveExpertActiveMenu("/portal/expert/account")).toBe("account");
    expect(resolveExpertActiveMenu("/portal/expert/account/settings")).toBe("account");
    expect(resolveExpertActiveMenu("/portal/expert/account?tab=security")).toBe("account");
  });

  it("resolves profile overview and fallback routes properly", () => {
    expect(resolveExpertActiveMenu("/portal/expert/profile")).toBe("profile");
    expect(resolveExpertActiveMenu("/portal")).toBe("profile");
    expect(resolveExpertActiveMenu("/portal/expert")).toBe("profile");
    expect(resolveExpertActiveMenu("/portal/expert/dashboard")).toBe("profile");
    expect(resolveExpertActiveMenu("")).toBe("profile");
  });

  it("resolves profile-edit route without colliding with profile", () => {
    expect(resolveExpertActiveMenu("/portal/expert/profile/edit")).toBe("profile-edit");
    expect(resolveExpertActiveMenu("/portal/expert/profile/edit/publications")).toBe("profile-edit");
  });

  it("resolves consultations route without colliding with projects or pipeline", () => {
    expect(resolveExpertActiveMenu("/portal/expert/consultations")).toBe("consultations");
    expect(resolveExpertActiveMenu("/portal/expert/consultations/REQ-CON-2026-081")).toBe("consultations");
    expect(resolveExpertActiveMenu("/portal/expert/consultations?tab=scheduled")).toBe("consultations");
    expect(resolveExpertActiveMenu("/portal/expert/consultations")).not.toBe("projects");
  });

  it("resolves radar route properly", () => {
    expect(resolveExpertActiveMenu("/portal/matching/radar")).toBe("radar");
    expect(resolveExpertActiveMenu("/portal/expert/radar")).toBe("radar");
    expect(resolveExpertActiveMenu("/portal/matching/radar?sector=01")).toBe("radar");
  });

  it("resolves projects route without colliding with consultations", () => {
    expect(resolveExpertActiveMenu("/portal/expert/projects")).toBe("projects");
    expect(resolveExpertActiveMenu("/portal/expert/projects/PRJ-EXP-2026-001")).toBe("projects");
    expect(resolveExpertActiveMenu("/portal/expert/projects")).not.toBe("consultations");
  });

  it("resolves contracts route properly without colliding with other routes (CR-2026-006)", () => {
    expect(resolveExpertActiveMenu("/portal/expert/contracts")).toBe("contracts");
    expect(resolveExpertActiveMenu("/portal/expert/contracts/HD-2026-001")).toBe("contracts");
    expect(resolveExpertActiveMenu("/portal/expert/contracts?tab=active")).toBe("contracts");
    expect(resolveExpertActiveMenu("/portal/expert/contracts")).not.toBe("projects");
    expect(resolveExpertActiveMenu("/portal/expert/contracts")).not.toBe("consultations");
    expect(resolveExpertActiveMenu("/portal/expert/contracts")).not.toBe("profile");
  });

  it("resolves orders-demands route properly without colliding with other routes (CR-2026-012 Delta v1.4)", () => {
    expect(resolveExpertActiveMenu("/portal/buyer/demands")).toBe("orders-demands");
    expect(resolveExpertActiveMenu("/portal/buyer/demands?tab=commercial")).toBe("orders-demands");
    expect(resolveExpertActiveMenu("/portal/buyer/demands?tab=demands")).toBe("orders-demands");
    expect(resolveExpertActiveMenu("/portal/orders")).toBe("orders-demands");
    expect(resolveExpertActiveMenu("/portal/buyer/demands")).not.toBe("projects");
    expect(resolveExpertActiveMenu("/portal/buyer/demands")).not.toBe("profile");
  });
});
