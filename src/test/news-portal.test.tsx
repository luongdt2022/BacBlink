import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  BACLINK_NEWS_ARTICLES,
  getNewsBySlug,
  getFeaturedNews,
  NEWS_CATEGORIES,
} from "@/lib/news-data";
import NewsPage from "@/app/tin-tuc/page";
import NewsDetailPage from "@/app/tin-tuc/[slug]/page";

let mockSlug = "dien-dan-go-global-bac-ninh-2026-ket-noi-chuoi-cung-ung-toan-cau";

// Mock Next.js navigation and router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({
    slug: mockSlug,
  }),
  usePathname: () => "/tin-tuc",
}));

// Mock Next/Image
vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || "image"} />;
  },
}));

describe("BACLINK News Data & Functions", () => {
  it("contains at least 6 detailed articles cloned from Facebook", () => {
    expect(BACLINK_NEWS_ARTICLES.length).toBeGreaterThanOrEqual(6);
    BACLINK_NEWS_ARTICLES.forEach((article) => {
      expect(article.id).toBeDefined();
      expect(article.slug).toBeDefined();
      expect(article.title).toBeDefined();
      expect(article.category).toBeDefined();
      expect(article.publishedAt).toBeDefined();
      expect(article.thumbnail).toBeDefined();
      expect(article.contentParagraphs.length).toBeGreaterThan(0);
    });
  });

  it("getFeaturedNews returns a featured article", () => {
    const featured = getFeaturedNews();
    expect(featured).toBeDefined();
    expect(featured.title).toContain("Go Global");
  });

  it("getNewsBySlug correctly resolves article by slug or id", () => {
    const article = getNewsBySlug("dien-dan-go-global-bac-ninh-2026-ket-noi-chuoi-cung-ung-toan-cau");
    expect(article).toBeDefined();
    expect(article?.categorySlug).toBe("chuoi-cung-ung");

    const invalid = getNewsBySlug("non-existent-slug");
    expect(invalid).toBeUndefined();
  });

  it("NEWS_CATEGORIES defines all key business categories", () => {
    expect(NEWS_CATEGORIES.some((c) => c.slug === "all")).toBe(true);
    expect(NEWS_CATEGORIES.some((c) => c.slug === "ban-dan")).toBe(true);
    expect(NEWS_CATEGORIES.some((c) => c.slug === "chuoi-cung-ung")).toBe(true);
  });
});

describe("NewsPage Component (/tin-tuc)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders news page header and article cards", () => {
    render(<NewsPage />);

    expect(
      screen.getByRole("heading", { name: /Tin Tức & Sự Kiện Hiệp Hội/i })
    ).toBeInTheDocument();

    const matches = screen.getAllByText(/Go Global/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("filters articles when searching by keyword", () => {
    render(<NewsPage />);

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm tin tức/i);
    fireEvent.change(searchInput, { target: { value: "Skyworks" } });

    const matches = screen.getAllByText(/Skyworks/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe("NewsDetailPage Component (/tin-tuc/[slug])", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders full article content when valid slug is provided", () => {
    mockSlug = "dien-dan-go-global-bac-ninh-2026-ket-noi-chuoi-cung-ung-toan-cau";
    render(<NewsDetailPage />);

    const headings = screen.getAllByRole("heading", {
      name: /Diễn Đàn Go Global Bắc Ninh 2026/i,
    });
    expect(headings.length).toBeGreaterThan(0);

    expect(screen.getByText(/Nội Dung Trọng Tâm & Kết Quả Đạt Được/i)).toBeInTheDocument();
  });

  it("renders 404 message when slug does not exist", () => {
    mockSlug = "bai-viet-khong-ton-tai";
    render(<NewsDetailPage />);

    expect(screen.getByText(/Không tìm thấy bài viết/i)).toBeInTheDocument();
  });
});
