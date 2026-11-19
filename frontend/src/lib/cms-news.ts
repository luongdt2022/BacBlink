import { articleParagraphs, categoryLabel, type CmsArticle, type CmsArticleSummary } from "@/lib/cms-client";

/** Hình dạng bài tin dùng bởi giao diện /tin-tuc (giữ nguyên để không phải viết lại trang). CR-BACLINK-009. */
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  publishedAt: string;
  author: string;
  location: string;
  excerpt: string;
  thumbnail: string;
  leadParagraph: string;
  contentParagraphs: string[];
  keyTakeaways?: string[];
  quote?: { text: string; speaker: string; title: string };
  gallery: { url: string; caption: string }[];
  tags: string[];
  featured?: boolean;
  sourceUrl?: string;
}

const FALLBACK_THUMB = "/baclink-official-banner.jpg";

export function formatNewsDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("vi-VN");
}

export function summaryToNews(a: CmsArticleSummary): NewsArticle {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: categoryLabel(a.categorySlug),
    categorySlug: a.categorySlug,
    publishedAt: formatNewsDate(a.publishedAt),
    author: a.author ?? "Ban Truyền thông BACLINK",
    location: a.location ?? "",
    excerpt: a.excerpt ?? "",
    thumbnail: a.thumbnailUrl || FALLBACK_THUMB,
    leadParagraph: "",
    contentParagraphs: [],
    gallery: [],
    tags: a.tags ?? [],
    featured: a.isFeatured,
    sourceUrl: a.sourceUrl ?? undefined,
  };
}

export function fullToNews(a: CmsArticle): NewsArticle {
  const base = summaryToNews(a);
  const b = a.body ?? {};
  const paras = articleParagraphs(b);
  // Bài chuyển từ dữ liệu cũ: lead + paragraphs; bài Markdown mới: đoạn đầu đóng vai lead.
  const lead = b.markdown?.trim() ? (paras[0] ?? "") : (b.lead ?? "");
  const rest = b.markdown?.trim() ? paras.slice(1) : (b.paragraphs ?? []);
  return {
    ...base,
    leadParagraph: lead,
    contentParagraphs: rest,
    keyTakeaways: b.takeaways?.length ? b.takeaways : undefined,
    quote: b.quote ?? undefined,
    gallery: b.gallery ?? [],
  };
}
