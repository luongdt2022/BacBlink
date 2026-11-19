import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeVi, runSearch } from "./site-search";

vi.mock("@/lib/enterprise-client", () => ({
  fetchEnterprises: vi.fn(async () => ({ items: [{ id: "1", name: "Công ty Nhựa Yên Phong", taxCode: "2300900005", mainSectorName: "Nhựa", provinceCity: "Bắc Ninh" }] })),
}));
vi.mock("@/services/api/technology-offer", () => ({ fetchPublicOffers: vi.fn(async () => { throw new Error("down"); }) }));
vi.mock("@/lib/portal-client", () => ({
  portalClient: {
    getPublicDemands: vi.fn(async () => [{ id: "d1", stageName: "Cấp phôi nhựa tự động" }]),
    listEvents: vi.fn(async () => ({ data: [{ id: "e1", title: "Hội thảo Nhựa kỹ thuật", location: "Bắc Ninh", description: "", startDate: "2026-12-01" }], total: 1 })),
  },
}));
const articles = vi.fn();
vi.mock("@/lib/cms-client", async (orig) => {
  const real = await orig<typeof import("@/lib/cms-client")>();
  return { ...real, cmsClient: { ...real.cmsClient, articles: (...a: unknown[]) => articles(...a) } };
});

describe("site-search (REQ-BL08-SEARCH-004)", () => {
  afterEach(() => vi.clearAllMocks());

  it("normalizeVi bỏ dấu và đ", () => {
    expect(normalizeVi("Đào tạo Nhựa")).toBe("dao tao nhua");
  });

  it("gộp 4 nhóm (tin tức từ CMS), không dấu vẫn khớp, một nguồn lỗi không làm hỏng cả trang", async () => {
    articles.mockResolvedValue({ data: [{ slug: "a", title: "Tin về NHỰA", categorySlug: "hoat-dong" }], total: 1, page: 1, totalPages: 1, categories: [] });
    const groups = await runSearch("nhua");
    const byKey = Object.fromEntries(groups.map((g) => [g.key, g.hits]));
    expect(byKey.enterprises[0].href).toBe("/enterprises/2300900005");
    expect(byKey.opportunities.map((h) => h.href)).toEqual(["/nhu-cau-cong-nghe/d1"]);
    expect(byKey.events).toHaveLength(1);
    expect(byKey.news.map((h) => h.href)).toEqual(["/tin-tuc/a"]);
    expect(articles).toHaveBeenCalledWith(expect.objectContaining({ q: "nhua" }));
  });

  it("CMS lỗi → nhóm tin tức rỗng, các nhóm khác vẫn có", async () => {
    articles.mockRejectedValue(new Error("down"));
    const groups = await runSearch("nhua");
    expect(groups.find((g) => g.key === "news")!.hits).toEqual([]);
    expect(groups.find((g) => g.key === "enterprises")!.hits).toHaveLength(1);
  });
});
