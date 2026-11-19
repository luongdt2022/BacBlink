import { describe, expect, it } from "vitest";
import {
  ROLES,
  getRedirectPathByRole,
  getRoleDisplayName,
  getWorkspacePath,
  normalizePlatformRole,
} from "./auth-client";

describe("ROLES & normalizePlatformRole (3-tier BACLINK RBAC)", () => {
  it("exposes standardized 3-tier roles", () => {
    expect(ROLES.ADMIN).toBe("ADMIN");
    expect(ROLES.ENTERPRISE).toBe("ENTERPRISE");
    expect(ROLES.PUBLIC_USER).toBe("PUBLIC_USER");
  });

  it.each([
    ["ADMIN", "ADMIN"],
    ["SUPER_ADMIN", "ADMIN"],
    ["OPERATOR_ADMIN", "ADMIN"],
    ["ENTERPRISE", "ENTERPRISE"],
    ["SELLER", "ENTERPRISE"],
    ["BUYER", "ENTERPRISE"],
    ["INNOVATION_ENTITY", "ENTERPRISE"],
    ["VERIFIED_EXPERT", "ENTERPRISE"],
    ["EXPERT", "ENTERPRISE"],
    ["PUBLIC_USER", "PUBLIC_USER"],
    ["USER", "PUBLIC_USER"],
    ["GUEST", "PUBLIC_USER"],
    ["PROVINCIAL_ADMIN", "PUBLIC_USER"],
    ["SECTOR_ADMIN", "PUBLIC_USER"],
    ["CLUSTER_ADMIN", "PUBLIC_USER"],
    [null, "PUBLIC_USER"],
    [undefined, "PUBLIC_USER"],
  ])("normalizes %s to %s", (raw, expected) => {
    expect(normalizePlatformRole(raw)).toBe(expected);
  });
});

describe("getRoleDisplayName", () => {
  it.each([
    ["ADMIN", "Quản trị viên"],
    ["ENTERPRISE", "Doanh nghiệp Hội viên"],
    ["PUBLIC_USER", "Thành viên công chúng"],
    ["SELLER", "Nhà cung ứng công nghệ"],
    ["BUYER", "Bên có nhu cầu công nghệ"],
  ])("renders %s as a readable Vietnamese role", (role, label) => {
    expect(getRoleDisplayName(role)).toBe(label);
  });
});

describe("getRedirectPathByRole & getWorkspacePath (Zero /gov routes)", () => {
  it.each([
    ["ADMIN", "/admin", "/admin"],
    ["SUPER_ADMIN", "/admin", "/admin"],
    ["OPERATOR_ADMIN", "/admin", "/admin"],
    ["ENTERPRISE", "/portal", "/portal"],
    ["BUYER", "/portal", "/portal"],
    ["SELLER", "/portal", "/portal"],
    ["PUBLIC_USER", "/", "/portal"],
    ["PROVINCIAL_ADMIN", "/", "/portal"],
    ["SECTOR_ADMIN", "/", "/portal"],
    ["CLUSTER_ADMIN", "/", "/portal"],
    [null, "/", "/portal"],
  ])("routes role %s to redirect=%s and workspace=%s", (role, expectedRedirect, expectedWorkspace) => {
    expect(getRedirectPathByRole(role)).toBe(expectedRedirect);
    expect(getWorkspacePath(role)).toBe(expectedWorkspace);
  });
});
