import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import ChinhSachPage from "./page";
import { cmsClient, type CmsArticlePage, type CmsArticleSummary, type CmsDocument } from "@/lib/cms-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/chinh-sach",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/cms-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/cms-client")>()),
  cmsClient: { articles: vi.fn(), documents: vi.fn() },
}));

const articlePage = (data: CmsArticleSummary[]): CmsArticlePage => ({
  data,
  total: data.length,
  page: 1,
  totalPages: 1,
  categories: [],
});

const policyArticle: CmsArticleSummary = {
  id: "a1",
  slug: "chinh-sach-mau",
  title: "Bài chính sách mẫu",
  categorySlug: "chinh-sach-moi",
  isFeatured: false,
  status: "PUBLISHED",
  tags: [],
  publishedAt: "2025-03-15T08:00:00Z",
};

const reportDoc: CmsDocument = {
  id: "doc1",
  docType: "BAO_CAO_NGANH",
  title: "Báo cáo ngành mẫu",
  fileUrl: "https://files.example.test/bao-cao.pdf",
  isPublic: true,
  sortOrder: 1,
  issuedOn: "2025-05-01",
};

describe("Chính sách & tri thức (/chinh-sach)", () => {
  beforeEach(() => {
    vi.mocked(cmsClient.articles).mockResolvedValue(articlePage([]));
    vi.mocked(cmsClient.documents).mockResolvedValue([]);
  });
  afterEach(cleanup);

  it("mỗi mục có section riêng; mục không có dữ liệu hiển thị 'Đang cập nhật'", async () => {
    render(<ChinhSachPage />);
    expect(await screen.findAllByText("Đang cập nhật")).toHaveLength(7);
    expect(screen.getAllByRole("region")).toHaveLength(7);
  });

  it("mục bài viết hiển thị bài với link tin tức và 'Xem tất cả' đúng category", async () => {
    vi.mocked(cmsClient.articles).mockImplementation(async (p) =>
      articlePage(p?.category === "chinh-sach-moi" ? [policyArticle] : []),
    );
    render(<ChinhSachPage />);
    const link = await screen.findByRole("link", { name: "Bài chính sách mẫu" });
    expect(link).toHaveAttribute("href", "/tin-tuc/chinh-sach-mau");
    const section = screen.getByRole("region", { name: "Chính sách mới" });
    expect(within(section).getByRole("link", { name: /Xem tất cả/ })).toHaveAttribute("href", "/tin-tuc?category=chinh-sach-moi");
    expect(cmsClient.articles).toHaveBeenCalledWith({ category: "chinh-sach-moi", limit: 3 });
  });

  it("mục tài liệu gộp các loại và link 'Xem tất cả' dùng loại đầu tiên; lỗi một mục không làm hỏng mục khác", async () => {
    vi.mocked(cmsClient.documents).mockImplementation(async (p) => {
      if (p?.type === "BAO_CAO_NGANH") return [reportDoc];
      if (p?.type === "DU_LIEU_CONG_NGHIEP") throw new Error("boom");
      return [];
    });
    render(<ChinhSachPage />);
    expect(await screen.findByRole("link", { name: "Tải về: Báo cáo ngành mẫu" })).toHaveAttribute("rel", "noopener noreferrer");
    expect(await screen.findByRole("alert")).toHaveTextContent("Chưa tải được mục này.");
    const camNang = screen.getByRole("region", { name: "Cẩm nang và biểu mẫu" });
    expect(within(camNang).getByRole("link", { name: /Xem tất cả/ })).toHaveAttribute("href", "/tai-lieu?loai=CAM_NANG");
    expect(cmsClient.documents).toHaveBeenCalledWith({ type: "CAM_NANG" });
    expect(cmsClient.documents).toHaveBeenCalledWith({ type: "BIEU_MAU" });
  });
});
