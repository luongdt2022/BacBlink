import { describe, expect, it } from "vitest";
import { EN_ENTRY_COUNT, hasEnglish, tr } from "./i18n-public";
import { MAIN_NAV } from "./navigation";
import { BUSINESS_SERVICES } from "./services";

describe("i18n công khai (REQ-BL11-EN-001)", () => {
  it("tr: en tra từ điển, vi và chuỗi lạ giữ nguyên", () => {
    expect(tr("en", "Gia nhập BACLINK")).toBe("Join BACLINK");
    expect(tr("vi", "Gia nhập BACLINK")).toBe("Gia nhập BACLINK");
    expect(tr("en", "Chuỗi chưa có bản dịch")).toBe("Chuỗi chưa có bản dịch");
    expect(EN_ENTRY_COUNT).toBeGreaterThan(100);
  });

  it("mọi mục menu con và tiêu đề dịch vụ đều có bản tiếng Anh; menu cấp 1 có labelEn", () => {
    const missing = MAIN_NAV.flatMap((m) => m.children.map((c) => c.label)).filter((l) => !hasEnglish(l));
    expect(missing).toEqual([]);
    expect(BUSINESS_SERVICES.map((s) => s.title).filter((t) => !hasEnglish(t))).toEqual([]);
    MAIN_NAV.forEach((m) => expect(m.labelEn.length).toBeGreaterThan(0));
  });
});
