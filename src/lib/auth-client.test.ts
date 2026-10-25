import { describe, expect, it } from "vitest";
import { getRoleDisplayName, getWorkspacePath } from "./auth-client";

describe("getRoleDisplayName", () => {
  it.each([
    ["PUBLIC_USER", "Thành viên công chúng"],
    ["SELLER", "Nhà cung ứng công nghệ"],
    ["BUYER", "Bên có nhu cầu công nghệ"],
    ["INNOVATION_ENTITY", "Chủ thể đổi mới sáng tạo"],
    ["VERIFIED_EXPERT", "Chuyên gia KH&CN đã xác thực"],
    ["PROVINCIAL_ADMIN", "Quản trị viên cấp tỉnh"],
  ])("renders %s as a readable Vietnamese role", (role, label) => {
    expect(getRoleDisplayName(role)).toBe(label);
  });
});

describe("getWorkspacePath", () => {
  it.each([
    ["ADMIN", "/admin"],
    ["SUPER_ADMIN", "/admin"],
    ["OPERATOR_ADMIN", "/admin"],
    ["PROVINCIAL_ADMIN", "/gov"],
    ["SECTOR_ADMIN", "/gov"],
    ["CLUSTER_ADMIN", "/gov"],
    ["PROVINCE_OFFICER", "/gov"],
    ["BUYER", "/portal"],
    ["SELLER", "/portal"],
    ["EXPERT", "/portal"],
    ["VERIFIED_EXPERT", "/portal"],
    ["INNOVATION_ENTITY", "/portal"],
    ["PUBLIC_USER", "/portal"],
    [null, "/portal"],
  ])("routes role %s to workspace path %s", (role, path) => {
    expect(getWorkspacePath(role)).toBe(path);
  });
});
