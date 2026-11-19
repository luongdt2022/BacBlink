import type React from "react";
import { Building2, Calendar, Newspaper, ShoppingCart } from "lucide-react";
import { fetchEnterprises, type EnterpriseDirectoryItem } from "@/lib/enterprise-client";
import { fetchPublicOffers } from "@/services/api/technology-offer";
import { portalClient, type TechmartEvent } from "@/lib/portal-client";
import { cmsClient, categoryLabel } from "@/lib/cms-client";

/** Tìm kiếm chung toàn cổng — CR-BACLINK-008 · REQ-BL08-SEARCH-004 */
/** Bỏ dấu tiếng Việt để so khớp không phân biệt dấu. */
export function normalizeVi(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

export type Hit = { href: string; title: string; meta?: string };
export type Group = { key: string; label: string; icon: React.ComponentType<{ className?: string }>; hits: Hit[]; moreHref?: string };

export async function runSearch(q: string): Promise<Group[]> {
  const nq = normalizeVi(q);
  const settle = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);

  const [ents, offers, demands, events, newsRes] = await Promise.all([
    settle(fetchEnterprises({ q, pageSize: 6 }).then((r) => r.items), [] as EnterpriseDirectoryItem[]),
    settle(fetchPublicOffers({ search: q, limit: 6 }).then((r) => r.data), []),
    settle(portalClient.getPublicDemands({ q, limit: 6 }), [] as Array<{ id: string; stageName?: string; title?: string; sectorName?: string }>),
    settle(portalClient.listEvents("UPCOMING", 1, 50).then((r) => r.data), [] as TechmartEvent[]),
    settle(cmsClient.articles({ q, limit: 6 }).then((r) => r.data), [] as Awaited<ReturnType<typeof cmsClient.articles>>["data"]),
  ]);

  const news = newsRes;
  const evts = events.filter((e) => normalizeVi(`${e.title} ${e.location} ${e.description}`).includes(nq)).slice(0, 6);

  return [
    {
      key: "enterprises",
      label: "Doanh nghiệp hội viên",
      icon: Building2,
      moreHref: `/enterprises?q=${encodeURIComponent(q)}`,
      hits: ents.map((e) => ({ href: `/enterprises/${e.taxCode}`, title: e.name, meta: [e.mainSectorName, e.provinceCity].filter(Boolean).join(" · ") })),
    },
    {
      key: "opportunities",
      label: "Cơ hội kinh doanh",
      icon: ShoppingCart,
      moreHref: `/nhu-cau-cong-nghe`,
      hits: [
        ...demands.map((d) => ({ href: `/nhu-cau-cong-nghe/${d.id}`, title: d.stageName ?? d.title ?? "Nhu cầu mua hàng", meta: "Nhu cầu mua hàng" })),
        ...offers.map((o) => ({ href: `/chao-ban-cong-nghe/${o.id}`, title: o.title, meta: `Sản phẩm / năng lực · ${o.sectorName ?? ""}` })),
      ],
    },
    {
      key: "events",
      label: "Sự kiện sắp tới",
      icon: Calendar,
      moreHref: "/trien-lam",
      hits: evts.map((e) => ({ href: "/trien-lam", title: e.title, meta: `${new Date(e.startDate).toLocaleDateString("vi-VN")} · ${e.location}` })),
    },
    {
      key: "news",
      label: "Tin tức",
      icon: Newspaper,
      moreHref: "/tin-tuc",
      hits: news.map((a) => ({ href: `/tin-tuc/${a.slug}`, title: a.title, meta: categoryLabel(a.categorySlug) })),
    },
  ];
}

