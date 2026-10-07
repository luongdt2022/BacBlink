import { describe, expect, it } from "vitest";
import { getRoleDisplayName } from "./auth-client";

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
