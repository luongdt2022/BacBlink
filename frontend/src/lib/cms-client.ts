import { API_BASE, readApiError } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

/** CR-BACLINK-009 · API-BL09-CMS-001 — client cho nội dung CMS (public đọc ẩn danh, admin cần token). */

export const CMS_CATEGORIES = [
  { slug: "all", label: "Tất cả" },
  { slug: "hoat-dong", label: "Hoạt động Hiệp hội" },
  { slug: "tin-hoi-vien", label: "Tin hội viên" },
  { slug: "hoat-dong-cac-ban", label: "Hoạt động các ban" },
  { slug: "chinh-sach-moi", label: "Chính sách mới" },
  { slug: "giai-thich-chinh-sach", label: "Giải thích chính sách" },
  { slug: "kien-nghi", label: "Ý kiến & kiến nghị của BACLINK" },
  { slug: "case-study", label: "Case study doanh nghiệp" },
  { slug: "chuoi-cung-ung", label: "Chuỗi cung ứng & ESG" },
  { slug: "ban-dan", label: "Bán dẫn & công nghệ cao" },
  { slug: "hop-tac-quoc-te", label: "Hợp tác quốc tế" },
  { slug: "truyen-thong-bao-chi", label: "Truyền thông & báo chí" },
] as const;

export const categoryLabel = (slug: string) => CMS_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

/** Bảy mục của hub "Chính sách & tri thức" (góp ý khách hàng, Menu 5). */
export const KNOWLEDGE_SECTIONS = [
  { key: "chinh-sach-moi", title: "Chính sách mới", kind: "article" as const, category: "chinh-sach-moi" },
  { key: "giai-thich-chinh-sach", title: "Giải thích chính sách", kind: "article" as const, category: "giai-thich-chinh-sach" },
  { key: "kien-nghi", title: "Ý kiến và kiến nghị của BACLINK", kind: "article" as const, category: "kien-nghi" },
  { key: "bao-cao-nganh", title: "Báo cáo ngành", kind: "document" as const, docType: "BAO_CAO_NGANH" },
  { key: "du-lieu-cong-nghiep", title: "Dữ liệu công nghiệp Bắc Ninh", kind: "document" as const, docType: "DU_LIEU_CONG_NGHIEP" },
  { key: "cam-nang-bieu-mau", title: "Cẩm nang và biểu mẫu", kind: "document" as const, docType: ["CAM_NANG", "BIEU_MAU"] },
  { key: "case-study", title: "Case study doanh nghiệp", kind: "article" as const, category: "case-study" },
] as const;

export const DOC_TYPE_LABEL: Record<string, string> = {
  DIEU_LE: "Điều lệ & quy chế",
  BAO_CAO_THUONG_NIEN: "Báo cáo thường niên",
  BAO_CAO_NGANH: "Báo cáo ngành",
  CAM_NANG: "Cẩm nang",
  BIEU_MAU: "Biểu mẫu",
  VAN_BAN_CHINH_SACH: "Văn bản chính sách",
  DU_LIEU_CONG_NGHIEP: "Dữ liệu công nghiệp",
};

export interface CmsArticleSummary {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  committeeCode?: string | null;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  author?: string | null;
  location?: string | null;
  sourceUrl?: string | null;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  tags: string[];
}

export interface CmsArticleBody {
  /** Bài mới (Admin viết) — Markdown. */
  markdown?: string;
  /** Bài chuyển từ news-data.ts — cấu trúc cũ. */
  lead?: string | null;
  paragraphs?: string[];
  takeaways?: string[];
  quote?: { text: string; speaker: string; title: string } | null;
  gallery?: { url: string; caption: string }[] | null;
}

export interface CmsArticle extends CmsArticleSummary {
  body: CmsArticleBody;
}

export interface CmsDocument {
  id: string;
  docType: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  committeeCode?: string | null;
  issuedOn?: string | null;
  isPublic: boolean;
  sortOrder: number;
}

export interface CmsMedia {
  id: string;
  kind: "IMAGE" | "VIDEO";
  album: string;
  title?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  takenOn?: string | null;
  isPublic: boolean;
  sortOrder: number;
}

export interface CmsFaq { id: string; question: string; answer: string; sortOrder: number; isPublic: boolean }
export interface CmsPartner { id: string; name: string; logoUrl?: string | null; website?: string | null; sortOrder: number; isPublic: boolean }

export interface CmsArticlePage {
  data: CmsArticleSummary[];
  total: number;
  page: number;
  totalPages: number;
  categories: { slug: string; count: number }[];
}

function auth(): HeadersInit {
  const t = authClient.getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function read<T>(path: string, init?: RequestInit, fallback = "Không tải được nội dung."): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(await readApiError(res, fallback));
  return (await res.json()) as T;
}

/** Phản hồi sai kiểu (proxy lỗi, API cũ...) không được làm sập giao diện. */
const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const qs = (o: Record<string, string | number | boolean | undefined | null>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json", ...auth() },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const cmsClient = {
  // ------------------------------------------------ public
  articles: (p: { category?: string; committee?: string; q?: string; featured?: boolean; page?: number; limit?: number } = {}) =>
    read<CmsArticlePage>(`/api/v1/public/cms/articles${qs(p)}`).then((r) => ({
      ...r,
      data: asArray<CmsArticleSummary>(r.data),
      categories: asArray<{ slug: string; count: number }>(r.categories),
    })),
  article: (slug: string) => read<{ data: CmsArticle }>(`/api/v1/public/cms/articles/${encodeURIComponent(slug)}`, undefined, "Không tìm thấy bài viết.").then((r) => r.data),
  documents: (p: { type?: string; committee?: string; q?: string } = {}) =>
    read<{ data: CmsDocument[] }>(`/api/v1/public/cms/documents${qs(p)}`).then((r) => asArray<CmsDocument>(r.data)),
  media: () => read<{ data: CmsMedia[] }>("/api/v1/public/cms/media").then((r) => asArray<CmsMedia>(r.data)),
  faqs: () => read<{ data: CmsFaq[] }>("/api/v1/public/cms/faqs").then((r) => asArray<CmsFaq>(r.data)),
  partners: () => read<{ data: CmsPartner[] }>("/api/v1/public/cms/partners").then((r) => asArray<CmsPartner>(r.data)),

  // ------------------------------------------------ admin (làm sau)
  admin: {
    list: (kind: "articles" | "documents" | "media" | "faqs" | "partners") =>
      read<{ data: unknown[] }>(`/api/v1/admin/cms/${kind}`, { headers: auth() }).then((r) => r.data),
    save: (kind: string, id: string | null, body: unknown) =>
      read(`/api/v1/admin/cms/${kind}${id ? `/${id}` : ""}`, jsonInit(id ? "PUT" : "POST", body)),
    remove: (kind: string, id: string) => read(`/api/v1/admin/cms/${kind}/${id}`, jsonInit("DELETE")),
    article: (id: string) => read<{ data: CmsArticle }>(`/api/v1/admin/cms/articles/${id}`, { headers: auth() }).then((r) => r.data),
  },
};

/** Một đoạn nội dung bài viết để hiển thị: ưu tiên Markdown (bài mới), sau đó cấu trúc cũ. */
export function articleParagraphs(b: CmsArticleBody): string[] {
  if (b.markdown?.trim()) return b.markdown.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  return [b.lead, ...(b.paragraphs ?? [])].filter((x): x is string => !!x);
}
