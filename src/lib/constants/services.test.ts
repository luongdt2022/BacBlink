import { describe, expect, it } from "vitest";
import { BUSINESS_SERVICES, getService } from "./services";
import { BACLINK_COMMITTEES } from "./organization";
import { MAIN_NAV } from "./navigation";

describe("8 dịch vụ (REQ-BL10-SERVICE-001)", () => {
  it("đủ 8 dịch vụ, slug duy nhất, mỗi dịch vụ trả lời đủ 4 câu hỏi", () => {
    expect(BUSINESS_SERVICES).toHaveLength(8);
    expect(new Set(BUSINESS_SERVICES.map((s) => s.slug)).size).toBe(8);
    BUSINESS_SERVICES.forEach((s) => {
      expect(s.forWhom.length).toBeGreaterThan(0);
      expect(s.problems.length).toBeGreaterThan(0);
      expect(s.support.length).toBeGreaterThan(0);
      expect(s.committeeCode).toBeTruthy();
    });
  });

  it("ban phụ trách tồn tại trong cơ cấu 9 ban; liên kết tự phục vụ là đường dẫn nội bộ", () => {
    const codes = new Set(BACLINK_COMMITTEES.map((c) => c.code));
    BUSINESS_SERVICES.forEach((s) => {
      expect(codes.has(s.committeeCode)).toBe(true);
      s.selfService.forEach((l) => expect(l.href.startsWith("/")).toBe(true));
    });
    expect(getService("khong-co")).toBeUndefined();
  });

  it("menu Dịch vụ liệt kê đủ 8 dịch vụ", () => {
    const menu = MAIN_NAV.find((m) => m.label === "Dịch vụ")!;
    BUSINESS_SERVICES.forEach((s) => expect(menu.children.some((c) => c.href === `/dich-vu/${s.slug}`)).toBe(true));
  });
});
