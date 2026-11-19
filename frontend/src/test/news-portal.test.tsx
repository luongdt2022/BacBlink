import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import NewsPage from "@/app/tin-tuc/page";
import NewsDetailPage from "@/app/tin-tuc/[slug]/page";
import { fullToNews, summaryToNews } from "@/lib/cms-news";
import type { CmsArticle, CmsArticleSummary } from "@/lib/cms-client";

let mockSlug = "go-global-2026";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({ slug: mockSlug }),
  usePathname: () => "/tin-tuc",
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt || "image"} />,
}));
vi.mock("@/components/common/toast", () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));

const summary = (o: Partial<CmsArticleSummary>): CmsArticleSummary => ({
  id: o.slug ?? "x", slug: "x", title: "Bài", categorySlug: "hoat-dong", excerpt: "Tóm tắt", thumbnailUrl: "/a.jpg", author: "BTC", location: "Bắc Ninh",
  isFeatured: false, status: "PUBLISHED", publishedAt: "2026-10-10T00:00:00Z", tags: ["tag"], ...o,
});

const list = vi.fn();
const one = vi.fn();
vi.mock("@/lib/cms-client", async (orig) => {
  const real = await orig<typeof import("@/lib/cms-client")>();
  return { ...real, cmsClient: { ...real.cmsClient, articles: (...a: unknown[]) => list(...a), article: (...a: unknown[]) => one(...a) } };
});

const page = {
  data: [
    summary({ slug: "go-global-2026", title: "Diễn đàn Go Global", categorySlug: "chuoi-cung-ung", isFeatured: true }),
    summary({ slug: "ban-dan-1", title: "Ra mắt Hội Bán dẫn", categorySlug: "ban-dan" }),
  ],
  total: 2, page: 1, totalPages: 1,
  categories: [{ slug: "chuoi-cung-ung", count: 1 }, { slug: "ban-dan", count: 1 }],
};

describe("cms-news adapter", () => {
  it("summaryToNews điền giá trị mặc định an toàn", () => {
    const n = summaryToNews(summary({ thumbnailUrl: null, author: null, location: null, excerpt: null }));
    expect(n.thumbnail).toBeTruthy();
    expect(n.author).toBe("Ban Truyền thông BACLINK");
    expect(n.category).toBe("Hoạt động Hiệp hội");
    expect(n.publishedAt).toBe(new Date("2026-10-10T00:00:00Z").toLocaleDateString("vi-VN"));
  });

  it("fullToNews: bài cũ (lead+paragraphs) và bài Markdown mới", () => {
    const old = fullToNews({ ...summary({}), body: { lead: "Mở đầu", paragraphs: ["P1", "P2"], takeaways: ["K"] } } as CmsArticle);
    expect(old.leadParagraph).toBe("Mở đầu");
    expect(old.contentParagraphs).toEqual(["P1", "P2"]);
    expect(old.keyTakeaways).toEqual(["K"]);
    const md = fullToNews({ ...summary({}), body: { markdown: "Đoạn một\n\nĐoạn hai\n\nĐoạn ba" } } as CmsArticle);
    expect(md.leadParagraph).toBe("Đoạn một");
    expect(md.contentParagraphs).toEqual(["Đoạn hai", "Đoạn ba"]);
  });
});

describe("NewsPage (/tin-tuc) đọc từ CMS", () => {
  beforeEach(() => { list.mockReset().mockResolvedValue(page); });
  afterEach(cleanup);

  it("hiển thị bài, tab danh mục động và lọc theo danh mục", async () => {
    render(<NewsPage />);
    expect((await screen.findAllByText("Diễn đàn Go Global")).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Chuỗi cung ứng & ESG/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Bán dẫn & công nghệ cao/ }));
    await waitFor(() => expect(screen.queryByText("Diễn đàn Go Global")).not.toBeInTheDocument());
    expect(screen.getAllByText("Ra mắt Hội Bán dẫn").length).toBeGreaterThan(0);
  });

  it("tìm kiếm không có kết quả → thông báo; lỗi API → nút thử lại", async () => {
    render(<NewsPage />);
    await screen.findAllByText("Diễn đàn Go Global");
    fireEvent.change(screen.getByPlaceholderText(/Tìm kiếm/i), { target: { value: "khong-co-bai-nao" } });
    expect(await screen.findByText("Không tìm thấy bài viết nào")).toBeInTheDocument();
    cleanup();

    list.mockRejectedValue(new Error("boom"));
    render(<NewsPage />);
    expect(await screen.findByText(/Không tải được danh sách tin tức/)).toBeInTheDocument();
  });
});

describe("NewsDetailPage (/tin-tuc/[slug]) đọc từ CMS", () => {
  beforeEach(() => {
    mockSlug = "go-global-2026";
    list.mockReset().mockResolvedValue(page);
    one.mockReset().mockResolvedValue({ ...page.data[0], body: { lead: "Dẫn nhập chi tiết", paragraphs: ["Nội dung đoạn 1"], takeaways: ["Điểm chính A"], gallery: [] } });
  });
  afterEach(cleanup);

  it("hiển thị nội dung và bài liên quan (loại trừ chính nó)", async () => {
    render(<NewsDetailPage />);
    expect(await screen.findByText(/Dẫn nhập chi tiết/)).toBeInTheDocument();
    expect(screen.getByText("Nội dung đoạn 1")).toBeInTheDocument();
    expect(screen.getByText("Điểm chính A")).toBeInTheDocument();
    expect(one).toHaveBeenCalledWith("go-global-2026");
    expect(await screen.findByText("Ra mắt Hội Bán dẫn")).toBeInTheDocument();
  });

  it("slug không tồn tại → trang 'Không tìm thấy bài viết'", async () => {
    mockSlug = "khong-ton-tai";
    one.mockRejectedValue(new Error("Không tìm thấy bài viết."));
    render(<NewsDetailPage />);
    expect(await screen.findByText("Không tìm thấy bài viết")).toBeInTheDocument();
  });
});
