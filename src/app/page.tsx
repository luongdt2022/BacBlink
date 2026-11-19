"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Cpu,
  Flame,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { portalClient, PortalOverviewStats } from "@/lib/portal-client";
import { fetchPublicOffers } from "@/services/api/technology-offer";
import { Async, AsyncState } from "@/components/ui/async";
import { getTechnologyImage } from "@/lib/technology-media";
import { AppCard } from "@/components/ui/app-card";
import { IndexVerificationBadge } from "@/components/common/IndexVerificationBadge";
import { NeedRouter, EnterpriseFinder, ServicesGrid, UpcomingEvents, PolicyInsights, JoinBenefits, MemberStrip, PartnerStrip } from "@/components/home/home-blocks";
import { ORG } from "@/lib/constants/organization";

type Listing = {
  id?: string;
  itemCode?: string;
  title: string;
  field: string;
  owner: string;
  location: string;
  trlLevel?: number;
  trlVerificationStatus?: string;
  tniScore?: number;
  tniVerificationStatus?: string;
  verifiedAuthorityName?: string;
  budgetRange?: string;
  image: string;
  type: "offers" | "demands";
};





function ListingCard({ item }: { item: Listing }) {
  const detailHref =
    item.type === "offers"
      ? item.id
        ? `/chao-ban-cong-nghe/${item.id}`
        : "/chao-ban-cong-nghe"
      : item.id
      ? `/nhu-cau-cong-nghe/${item.id}`
      : "/nhu-cau-cong-nghe";

  return (
    <AppCard
      elevation={1}
      interactive
      className="group flex flex-col justify-between overflow-hidden p-0 md:p-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div>
        <Link href={detailHref} className="relative block aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          {/* Hàng huy hiệu đáy ảnh: đồng bộ phong cách & căn đều 2 bên như trang Công nghệ */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2">
            {/* Huy hiệu ngành KH&CN bên trái */}
            <span className="min-w-0 truncate rounded-full border border-white/20 bg-slate-900/75 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm backdrop-blur-md">
              {item.field}
            </span>
            {/* Huy hiệu Xác thực TRL / TNI bên phải */}
            <div className="shrink-0 flex items-center">
              {item.type === "offers" ? (
                <IndexVerificationBadge
                  type="TRL"
                  value={item.trlLevel}
                  status={item.trlVerificationStatus}
                  authorityName={item.verifiedAuthorityName}
                  variant="compact"
                  concise
                  translucent
                />
              ) : (
                <IndexVerificationBadge
                  type="TNI"
                  value={item.tniScore}
                  status={item.tniVerificationStatus}
                  authorityName={item.verifiedAuthorityName}
                  variant="compact"
                  translucent
                />
              )}
            </div>
          </div>
        </Link>

        <div className="p-4 sm:p-5">
          {item.itemCode && (
            <span className="font-mono text-[11px] font-bold text-brand-700 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 inline-block mb-2">
              {item.itemCode}
            </span>
          )}
          <Link href={detailHref}>
            <h3 className="text-base font-bold text-text-primary hover:text-brand-700 dark:text-white dark:hover:text-cyan-400 line-clamp-2 transition font-sans leading-snug">
              {item.title}
            </h3>
          </Link>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary dark:text-slate-300 line-clamp-1 font-sans">
            {item.owner}
          </p>
          {item.budgetRange && (
            <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Ngân sách dự kiến: {item.budgetRange}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-text-secondary dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px]">{item.location}</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={detailHref}
              className="btn-press inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:hover:bg-brand-900 dark:text-cyan-300 font-bold text-xs transition cursor-pointer"
            >
              {item.type === "offers" ? "Yêu Cầu Kết Nối" : "Đề Xuất Giải Pháp"}
            </Link>
            <Link
              href={detailHref}
              className="inline-flex items-center gap-0.5 font-bold text-brand-700 hover:text-brand-800 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              <span>Chi tiết</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AppCard>
  );
}

export default function HomePage() {
  const router = useRouter();

  // Search state cho Hero banner gốc
  const [query, setQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  const [listingType, setListingType] = useState<"offers" | "demands">("offers");
  const [offers, setOffers] = useState<Listing[]>([]);
  const [demands, setDemands] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  // Thống kê thời gian thực từ Portal API
  const [statsState, setStatsState] = useState<AsyncState>("loading");
  const [statsData, setStatsData] = useState<PortalOverviewStats | null>(null);
  const [statsVersion, setStatsVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setListingsLoading(true);

    Promise.all([
      fetchPublicOffers({ rotate: true, limit: 6 })
        .then((res) => {
          if (!cancelled) {
            const rawOffers = res.data || [];
            const seen = new Set<string>();
            const uniqueOffers: Listing[] = [];
            for (const o of rawOffers) {
              const key = (o.title || "").trim().toLowerCase();
              if (key && !seen.has(key)) {
                seen.add(key);
                uniqueOffers.push({
                  id: o.id,
                  itemCode: o.offerCode,
                  title: o.title,
                  field: o.sectorName || o.sectorCode || "Sản xuất công nghiệp",
                  owner: o.enterpriseName || o.developerOrigin || "Doanh nghiệp hội viên",
                  location: o.managingAuthorityName || "Bắc Ninh",
                  trlLevel: o.trlLevel || undefined,
                  trlVerificationStatus: o.trlVerificationStatus || undefined,
                  verifiedAuthorityName: o.verifiedAuthorityName || undefined,
                  image: getTechnologyImage(o.sectorCode, o.title, o.mainImageUrl),
                  type: "offers",
                });
              }
            }
            setOffers(uniqueOffers.slice(0, 6));
          }
        })
        .catch(() => {
          if (!cancelled) setOffers([]);
        }),

      portalClient
        .getPublicDemands({ rotate: true, limit: 6 })
        .then((list) => {
          if (!cancelled && Array.isArray(list)) {
            const seen = new Set<string>();
            const uniqueDemands: Listing[] = [];
            for (const d of list) {
              const key = (d.technicalProblem || d.stageName || "").trim().toLowerCase();
              if (key && !seen.has(key)) {
                seen.add(key);
                uniqueDemands.push({
                  id: d.id,
                  itemCode: d.itemCode,
                  title: d.technicalProblem || d.stageName || "Bài toán kỹ thuật sản xuất",
                  field: d.sectorCode || "Nhu cầu đặt hàng",
                  owner: d.province || "Doanh nghiệp",
                  location: d.province || "Bắc Ninh",
                  tniScore: d.tniScore,
                  tniVerificationStatus: d.tniVerificationStatus,
                  verifiedAuthorityName: d.verifiedAuthorityName,
                  budgetRange: d.budgetRange,
                  image: getTechnologyImage(d.sectorCode, d.technicalProblem || d.stageName),
                  type: "demands",
                });
              }
            }
            setDemands(uniqueDemands.slice(0, 6));
          }
        })
        .catch(() => {
          if (!cancelled) setDemands([]);
        }),
    ]).finally(() => {
      if (!cancelled) setListingsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatsState("loading");
    portalClient
      .getStats()
      .then((data) => {
        if (!cancelled) {
          setStatsData(data);
          setStatsState("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Lỗi nạp thống kê cổng thông tin:", err);
          setStatsState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [statsVersion]);

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const q = query.trim();
    router.push(q ? `/tim-kiem?q=${encodeURIComponent(q)}` : "/tim-kiem");
  };

  const listings = listingType === "offers" ? offers : demands;


  return (
    <div className="w-full bg-white dark:bg-slate-950 font-sans">
      {/* ========================================================================= */}
      {/* PHẦN TỪ BACKGROUND TRỞ LÊN: HERO BANNER BACLINK CHUẨN MÀU SẮC & KHẨU HIỆU */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#031e3d] via-[#053567] to-[#0a488f] px-4 py-8 text-white sm:py-14 lg:px-8 lg:py-16">
        {/* Ảnh nền ban tổ chức (chữ mờ "Vì nhau mà lớn…") — phủ lớp xanh để chữ nổi bật */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "url(/baclink-official-banner.jpg)", backgroundSize: "cover", backgroundPosition: "right center", opacity: 0.04 }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#053567]/80 via-[#053567]/55 to-[#053567]/80" />
        <div aria-hidden="true" className="baclink-hero-art pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            {/* Official BACLINK Slogan Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-300 shadow-sm backdrop-blur-md">
              <span className="text-amber-400">★</span>
              <span>VÌ NHAU MÀ LỚN • VÌ TỈNH MÀ BỀN • VÌ NƯỚC MÀ LÊN</span>
              <span className="text-amber-400">★</span>
            </div>

            <h1 className="mt-4 sm:mt-5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold font-sans uppercase tracking-normal sm:tracking-wide leading-snug sm:leading-tight text-white">
              <span className="block">KẾT NỐI CHUỖI CUNG ỨNG,</span>
              <span className="block mt-1.5 sm:mt-2">NÂNG TẦM CÔNG NGHIỆP BẮC NINH</span>
            </h1>

            {/* 3 Value Pillars from Official BACLINK */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                <span className="text-amber-400 text-xs">●</span> Điểm đến FDI số 1 Việt Nam
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                <span className="text-emerald-400 text-xs">●</span> Mạng lưới Công Nghiệp Xanh tiên phong
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                <span className="text-cyan-300 text-xs">●</span> Tinh Hoa Kinh Bắc tử tế &amp; nhân văn
              </span>
            </div>

            <form
              className="mx-auto mt-7 sm:mt-9 lg:mt-10 flex w-full max-w-3xl lg:max-w-4xl flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-2 sm:p-2.5 shadow-2xl transition"
              onSubmit={handleSearch}
            >
              {/* Ô nhập từ khóa tìm kiếm */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 size-4.5 sm:size-5 -translate-y-1/2 text-white/60" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm doanh nghiệp, sản phẩm, nhu cầu mua hàng, sự kiện..."
                  aria-label="Từ khóa tìm kiếm"
                  className="h-11 sm:h-12 w-full border-0 bg-transparent py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 text-sm sm:text-base text-white placeholder:text-white/65 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Nút Tìm kiếm */}
              <button
                type="submit"
                className="focus-ring h-11 sm:h-12 rounded-xl bg-white hover:bg-white/95 px-6 sm:px-7 text-sm sm:text-base font-bold text-brand-700 transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="size-4 text-brand-700" />
                <span>Tìm kiếm</span>
              </button>
            </form>
          </div>

          {/* REALTIME METRICS STRIP (Khối Thống kê thời gian thực có chuẩn 5 UX States) */}
          <div className="mx-auto mt-6 sm:mt-9 [@media(min-height:850px)]:mt-10 max-w-4xl">
            <Async
              state={statsState}
              loadingSkeleton={
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-1.5 sm:p-2 animate-pulse">
                  <div className="grid grid-cols-2 divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-white/10">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-3 sm:py-4 px-2">
                        <div className="h-7 sm:h-9 w-16 sm:w-20 bg-white/20 rounded-lg mb-2" />
                        <div className="h-3.5 sm:h-4 w-24 sm:w-28 bg-white/15 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              }
              errorContent={
                <div className="text-center p-4 bg-white/10 rounded-xl text-white">
                  <p className="text-xs text-rose-200">Không thể tải số liệu thống kê thời gian thực.</p>
                  <button
                    type="button"
                    onClick={() => setStatsVersion((v) => v + 1)}
                    className="mt-2 text-xs font-bold underline hover:text-white cursor-pointer"
                  >
                    Tải lại số liệu
                  </button>
                </div>
              }
            >
              <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-1 sm:p-1.5 shadow-xl shadow-brand-950/20">
                <dl className="grid grid-cols-2 divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-white/10">
                  <Link
                    href="/chao-ban-cong-nghe"
                    title="Sàn chào bán công nghệ"
                    aria-label="Công nghệ chào bán"
                    className="group flex flex-col items-center justify-center p-3 sm:py-4 px-2 sm:px-3 rounded-xl transition duration-200 hover:bg-white/[0.08]"
                  >
                    <dd className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-white group-hover:text-cyan-300 transition">
                      {statsData?.totalOffers !== undefined ? statsData.totalOffers.toLocaleString("vi-VN") : "0"}
                    </dd>
                    <dt className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-white/75 group-hover:text-white transition flex items-center justify-center gap-1">
                      <span>Công nghệ chào bán</span>
                      <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                    </dt>
                  </Link>

                  <Link
                    href="/nhu-cau-cong-nghe"
                    title="Bảng nhu cầu công nghệ"
                    aria-label="Nhu cầu đặt hàng"
                    className="group flex flex-col items-center justify-center p-3 sm:py-4 px-2 sm:px-3 rounded-xl transition duration-200 hover:bg-white/[0.08]"
                  >
                    <dd className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-white group-hover:text-emerald-300 transition">
                      {statsData?.totalDemands !== undefined ? statsData.totalDemands.toLocaleString("vi-VN") : "0"}
                    </dd>
                    <dt className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-white/75 group-hover:text-white transition flex items-center justify-center gap-1">
                      <span>Nhu cầu đặt hàng</span>
                      <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                    </dt>
                  </Link>

                  <Link
                    href="/tin-tuc"
                    title="Kết nối cung cầu và ký kết MOU"
                    aria-label="Kết nối thành công & MOU"
                    className="group flex flex-col items-center justify-center p-3 sm:py-4 px-2 sm:px-3 rounded-xl transition duration-200 hover:bg-white/[0.08]"
                  >
                    <dd className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-white group-hover:text-amber-300 transition">
                      {statsData?.totalSuccessfulConnections !== undefined
                        ? statsData.totalSuccessfulConnections.toLocaleString("vi-VN")
                        : "0"}
                    </dd>
                    <dt className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-white/75 group-hover:text-white transition flex items-center justify-center gap-1">
                      <span>Kết nối & MOU</span>
                      <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                    </dt>
                  </Link>

                  <Link
                    href="/portal/opportunities/pipeline"
                    title="Quy mô giao dịch và ngân sách kết nối"
                    aria-label="Quy mô giao dịch & Ngân sách"
                    className="group flex flex-col items-center justify-center p-3 sm:py-4 px-2 sm:px-3 rounded-xl transition duration-200 hover:bg-white/[0.08]"
                  >
                    <dd className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl text-white group-hover:text-brand-200 transition whitespace-nowrap">
                      {(() => {
                        const val = statsData?.totalEstimatedValueMillionVnd;
                        if (!val || val === 0) return "0 VNĐ";
                        if (val >= 1000) {
                          return `${(val / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} Tỷ VNĐ`;
                        }
                        return `${val.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} Triệu VNĐ`;
                      })()}
                    </dd>
                    <dt className="mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium text-white/75 group-hover:text-white transition flex items-center justify-center gap-1">
                      <span>Quy mô giao dịch</span>
                      <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                    </dt>
                  </Link>
                </dl>
              </div>
            </Async>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHẦN TỪ BACKGROUND TRẮNG TRỞ XUỐNG: GIAO DIỆN NÂNG CẤP SPRINT 3 CHUẨN      */}
      {/* ========================================================================= */}
      <main>
        {/* TIN TỨC & SỰ KIỆN HIỆP HỘI BACLINK (khôi phục từ bản trước) */}
        {/* 1. TIN TỨC & SỰ KIỆN NỔI BẬT HIỆP HỘI BACLINK                             */}
        {/* ========================================================================= */}
        <section className="bg-white py-12 sm:py-16 lg:py-20 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                  <Flame className="size-3.5 text-amber-600 dark:text-amber-400" />
                  Hoạt Động &amp; Hợp Tác Chiến Lược
                </span>
                <h2 className="mt-3 type-section-title text-text-primary dark:text-white">
                  Tin Tức &amp; Sự Kiện Hiệp Hội BACLINK
                </h2>
                <p className="mt-2 text-sm sm:text-base text-text-secondary dark:text-slate-300">
                  Cập nhật các chương trình ký kết quốc tế, xúc tiến công nghiệp bán dẫn và hoạt động hội viên Bắc Ninh.
                </p>
              </div>

              <Link
                href="/tin-tuc"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 dark:text-cyan-400 group shrink-0"
              >
                <span>Xem tất cả tin tức</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Grid 1 bài nổi bật lớn + 3 bài nhỏ */}
            <div className="mt-8 grid gap-6 lg:grid-cols-12 items-stretch">
              {/* Bài lớn tiêu điểm: Go Global Bắc Ninh 2026 */}
              <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 group">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src="/events/baclink-goglobal-1.jpg"
                    alt="Diễn đàn Go Global Bắc Ninh 2026"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-red-600/90 text-white px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider shadow">
                      Tiêu điểm
                    </span>
                    <span className="rounded-full bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-0.5 text-[11px] font-bold">
                      Chuỗi Cung Ứng &amp; ESG
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-brand-600" />
                        10/10/2026
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-red-500" />
                        Trung tâm Văn hóa Kinh Bắc, TP. Bắc Ninh
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                      Diễn Đàn Go Global Bắc Ninh 2026: Kiến Tạo Vị Thế Mới Cho Doanh Nghiệp Việt Trong Chuỗi Giá Trị Toàn Cầu
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      UBND TP Bắc Ninh chỉ đạo, Sở Công Thương, Hiệp hội Sản xuất Công nghiệp TP. Bắc Ninh (BACLINK) phối hợp Báo Dân trí tổ chức Diễn đàn Go Global 2026 quy tụ 300 khách mời, thúc đẩy doanh nghiệp nội địa vươn tầm chuỗi cung ứng FDI và thực hành chuẩn mực ESG.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Báo Dân Trí &amp; Nhân Dân đưa tin
                    </span>
                    <Link
                      href="/tin-tuc/dien-dan-go-global-bac-ninh-2026-ket-noi-chuoi-cung-ung-toan-cau"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-cyan-400 group-hover:underline"
                    >
                      <span>Chi tiết bài viết</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3 bài bên phải */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Tin 2: Ra mắt Hội Bán dẫn */}
                <Link
                  href="/tin-tuc/ra-mat-hoi-ban-dan-thanh-pho-bac-ninh"
                  className="group flex gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img
                      src="/events/baclink-semiconductor-launch.jpg"
                      alt="Ra mắt Hội Bán dẫn Bắc Ninh"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Bán Dẫn &amp; Công Nghệ Cao
                      </span>
                      <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                        Công Bố Quyết Định Thành Lập Và Ra Mắt Ban Lãnh Đạo Hội Bán Dẫn Thành Phố Bắc Ninh
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      <Calendar className="size-3 text-slate-400" />
                      <span>10/10/2026 • TT Văn Hóa Kinh Bắc</span>
                    </div>
                  </div>
                </Link>

                {/* Tin 3: Thăm Skyworks và Qorvo */}
                <Link
                  href="/tin-tuc/hoi-ban-dan-bac-ninh-lam-viec-skyworks-qorvo"
                  className="group flex gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img
                      src="/events/baclink-qorvo-1.jpg"
                      alt="Làm việc tại Qorvo và Skyworks"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                        Hợp Tác Công Nghệ Bán Dẫn
                      </span>
                      <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                        Hội Bán Dẫn Bắc Ninh Làm Việc Với Hai Tập Đoàn Bán Dẫn Skyworks Và Qorvo
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      <Calendar className="size-3 text-slate-400" />
                      <span>10/10/2026 • Skyworks &amp; Qorvo</span>
                    </div>
                  </div>
                </Link>

                {/* Tin 4: Ký kết KAISA Hàn Quốc */}
                <Link
                  href="/tin-tuc/baclink-hop-tac-nganh-ban-dan-kaisa-han-quoc"
                  className="group flex gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img
                      src="/events/baclink-event-1.jpg"
                      alt="Ký kết MOU KAISA Hàn Quốc"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Hợp Tác Quốc Tế
                      </span>
                      <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                        BACLINK Ký Kết MOU Ngành Bán Dẫn Với Hiệp Hội Fabless Hàn Quốc (KAISA)
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      <Calendar className="size-3 text-slate-400" />
                      <span>12/11/2026 • L7 West Lake</span>
                    </div>
                  </div>
                </Link>

                {/* Tin 5: Đại hội I BACLINK */}
                <Link
                  href="/tin-tuc/dai-hoi-thanh-lap-hiep-hoi-san-xuat-cong-nghiep-bac-ninh-khoa-1"
                  className="group flex gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-500/50 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img
                      src="/events/baclink-event-5.jpg"
                      alt="Đại hội 1 Hiệp hội BACLINK"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                        Kỷ Yếu Sự Kiện
                      </span>
                      <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                        Đại Hội Thành Lập Hiệp Hội Sản Xuất Công Nghiệp Tỉnh Bắc Ninh Khóa I (2025–2028)
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      <Calendar className="size-3 text-slate-400" />
                      <span>QĐ 1652/QĐ-UBND • TT Văn hóa Kinh Bắc</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* CR-BACLINK-008 · REQ-BL08-HOME-003 — 8 khối theo góp ý khách hàng (khối 1 = Hero ở trên) */}
        {/* 2. Bạn đang cần gì? */}
        <NeedRouter />
        {/* 3. Tìm doanh nghiệp hoặc nhà cung cấp */}
        <EnterpriseFinder />
        {/* 4. Cơ hội kinh doanh mới nhất */}
        {/* ========================================================================= */}
        {/* 2. LƯỚI THẺ LISTING CÔNG NGHỆ & NHU CẦU NỔI BẬT (T-01.33)                */}
        {/* ========================================================================= */}
        <section className="bg-slate-50/60 dark:bg-slate-950/50 py-10 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
          <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-cyan-300 dark:border-blue-800">
                  <Sparkles className="size-3.5 text-blue-600 dark:text-cyan-400" />
                  Cơ hội kinh doanh
                </span>
                <h2 className="mt-3 type-section-title text-text-primary dark:text-white">
                  Cơ hội kinh doanh mới nhất
                </h2>
                <p className="mt-2 text-sm sm:text-base text-text-secondary dark:text-slate-300">
                  Cập nhật liên tục từ các doanh nghiệp hội viên, nhà máy và khu công nghiệp tỉnh Bắc Ninh.
                </p>
              </div>

              {/* Bộ chuyển đổi Tab Cung - Cầu */}
              <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setListingType("offers")}
                  className={`btn-press rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                    listingType === "offers"
                      ? "bg-white text-brand-700 shadow-sm dark:bg-brand-950 dark:text-cyan-300"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Sản phẩm & năng lực ({offers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("demands")}
                  className={`btn-press rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                    listingType === "demands"
                      ? "bg-white text-brand-700 shadow-sm dark:bg-brand-950 dark:text-cyan-300"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Nhu cầu mua hàng ({demands.length})
                </button>
              </div>
            </div>

            {/* Bao bọc lưới danh sách qua component <Async> */}
            <div className="mt-8">
              <Async
                state={listingsLoading ? "loading" : listings.length === 0 ? "empty" : "success"}
                loadingSkeleton={
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse dark:bg-slate-900 dark:border-slate-800">
                        <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    ))}
                  </div>
                }
                emptyContent={
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                    <Cpu className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                    <p className="font-semibold text-base text-slate-700 dark:text-slate-200">
                      Chưa có {listingType === "offers" ? "công nghệ chào bán" : "nhu cầu đặt hàng"} nào được công bố.
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Dữ liệu sẽ được cập nhật ngay khi hoàn tất thẩm định bởi Ban Quản trị Hiệp hội BACLINK.
                    </p>
                  </div>
                }
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((item, idx) => (
                    <ListingCard key={`${item.type}-${item.id || item.itemCode || idx}-${idx}`} item={item} />
                  ))}
                </div>
              </Async>
            </div>

            <div className="mt-8 sm:mt-10 flex justify-center">
              <Link
                href={listingType === "offers" ? "/chao-ban-cong-nghe" : "/nhu-cau-cong-nghe"}
                className="btn-press inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-700 hover:bg-brand-50 hover:text-brand-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <span>Xem tất cả danh sách</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Dịch vụ dành cho doanh nghiệp */}
        <ServicesGrid />
        {/* 6. Sự kiện & đào tạo sắp tới */}
        <UpcomingEvents />
        {/* 7. Chính sách & thông tin ngành */}
        <PolicyInsights />
        {/* 8. Quyền lợi & Gia nhập */}
        <JoinBenefits />
        {/* Hội viên (dữ liệu thật đã xác thực) */}
        <MemberStrip />
        {/* Đối tác — chỉ hiện khi Admin đã nhập đối tác thật */}
        <PartnerStrip />
      </main>
    </div>
  );
}
