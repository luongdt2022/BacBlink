"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Cpu,
  FileCheck2,
  FileDown,
  FileSearch,
  FileSignature,
  Flame,
  GraduationCap,
  Handshake,
  HeartHandshake,
  LineChart,
  MapPin,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";
import { authClient, UserContext } from "@/lib/auth-client";
import { portalClient, PortalOverviewStats } from "@/lib/portal-client";
import { fetchPublicOffers } from "@/services/api/technology-offer";
import { Async, AsyncState } from "@/components/ui/async";
import { getTechnologyImage } from "@/lib/technology-media";

type Listing = {
  id?: string;
  itemCode?: string;
  title: string;
  field: string;
  owner: string;
  location: string;
  trl: string;
  image: string;
  type: "offers" | "demands";
};

const SEARCH_CATEGORIES = [
  { value: "all", label: "Tất cả danh mục", path: "/chao-ban-cong-nghe" },
  { value: "cong-nghe", label: "Công nghệ chào bán", path: "/chao-ban-cong-nghe" },
  { value: "nhu-cau", label: "Nhu cầu công nghệ & ĐMST", path: "/nhu-cau-cong-nghe" },
  { value: "chuyen-gia", label: "Chuyên gia & Nhà khoa học", path: "/experts" },
  { value: "doanh-nghiep", label: "Doanh nghiệp ĐMST", path: "/doanh-nghiep-dmst" },
  { value: "sang-che", label: "Sáng chế & Bằng độc quyền", path: "/chao-ban-cong-nghe" },
  { value: "trien-lam", label: "Sàn Triển lãm Techmart", path: "/trien-lam" },
  { value: "dao-tao", label: "Đào tạo & Chuyển giao tri thức", path: "/elearning" },
] as const;

const features = [
  [ShieldCheck, "Công nghệ được kiểm định", "Mỗi công nghệ đăng tải đều được Viện thẩm định mức độ sẵn sàng (TRL) và pháp lý sở hữu trí tuệ trước khi công bố."],
  [Handshake, "Kết nối trực tiếp, không trung gian", "Doanh nghiệp và nhà khoa học trao đổi, đàm phán chuyển giao trực tiếp trên nền tảng, tiết kiệm thời gian và chi phí."],
  [LineChart, "Dữ liệu minh bạch, cập nhật", "Theo dõi tiến độ giao dịch, lịch sử chuyển giao và đánh giá từ các bên theo thời gian thực."],
  [Clock, "Hỗ trợ 24/7 từ chuyên gia", "Đội ngũ chuyên gia của Viện đồng hành tư vấn kỹ thuật, pháp lý và tài chính cho từng giao dịch."],
] as const;

const processes = [
  [FileSearch, "Đăng công nghệ / nhu cầu", "Chủ sở hữu công nghệ hoặc đơn vị có nhu cầu tạo hồ sơ, mô tả chi tiết trên nền tảng."],
  [ClipboardCheck, "Thẩm định & kiểm định", "Chuyên gia của Viện đánh giá mức độ sẵn sàng công nghệ (TRL) và tính pháp lý."],
  [Handshake, "Kết nối các bên liên quan", "Hệ thống gợi ý và kết nối bên chào bán với bên có nhu cầu phù hợp."],
  [FileSignature, "Đàm phán & ký kết", "Hai bên trao đổi trực tiếp, soạn thảo và ký kết hợp đồng chuyển giao."],
  [Rocket, "Triển khai chuyển giao", "Đội ngũ kỹ thuật hỗ trợ lắp đặt, chuyển giao và đào tạo vận hành công nghệ."],
  [HeartHandshake, "Hỗ trợ hậu chuyển giao", "Theo dõi vận hành, đánh giá hiệu quả và hỗ trợ xử lý phát sinh sau chuyển giao."],
] as const;

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
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border-default bg-white transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div>
        <Link href={detailHref} className="relative block aspect-[16/9] overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 sm:left-4 sm:top-4 inline-flex rounded-full bg-white/95 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-brand-700 shadow-xs">
            {item.field}
          </span>
        </Link>
        <div className="p-4 sm:p-6">
          <Link href={detailHref}>
            <h3 className="text-base sm:text-card-title font-bold text-text-primary hover:text-brand-700 dark:text-white dark:hover:text-cyan-400 line-clamp-2 transition">
              {item.title}
            </h3>
          </Link>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-text-secondary dark:text-slate-300 line-clamp-1">{item.owner}</p>
        </div>
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 sm:pt-4 text-xs text-text-secondary dark:text-slate-400">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {item.location}
            </span>
            <span className="font-semibold text-nacen-green-700 dark:text-nacen-green-200">{item.trl}</span>
          </div>
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Chi tiết <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();

  // Search state
  const [query, setQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  const [listingType, setListingType] = useState<"offers" | "demands">("offers");
  const [offers, setOffers] = useState<Listing[]>([]);
  const [demands, setDemands] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [sectorsError, setSectorsError] = useState(false);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [sectorLoadVersion, setSectorLoadVersion] = useState(0);

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
            // Defense-in-depth: Deduplication by normalized title using Set
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
                  field: o.sectorName || o.sectorCode || "Khoa học & Công nghệ",
                  owner: o.enterpriseName || o.developerOrigin || "Chủ sở hữu công nghệ",
                  location: o.managingAuthorityName || "Toàn quốc",
                  trl: o.trlLevel ? `TRL ${o.trlLevel}` : "Đang hoàn thiện",
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
            // Defense-in-depth: Deduplication by normalized title using Set
            const seen = new Set<string>();
            const uniqueDemands: Listing[] = [];
            for (const d of list) {
              const key = (d.technicalProblem || d.stageName || "").trim().toLowerCase();
              if (key && !seen.has(key)) {
                seen.add(key);
                uniqueDemands.push({
                  id: d.id,
                  itemCode: d.itemCode,
                  title: d.technicalProblem || d.stageName || "Bài toán công nghệ",
                  field: d.sectorCode || "Nhu cầu ĐMST",
                  owner: d.province || "Doanh nghiệp",
                  location: d.province || "Toàn quốc",
                  trl: d.budgetRange ? `Ngân sách: ${d.budgetRange}` : "Thương lượng",
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

  useEffect(() => {
    let cancelled = false;
    setSectorsLoading(true);
    setSectorsError(false);
    getActiveSectors()
      .then((rows) => {
        if (!cancelled) setSectors(rows);
      })
      .catch(() => {
        if (!cancelled) setSectorsError(true);
      })
      .finally(() => {
        if (!cancelled) setSectorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sectorLoadVersion]);

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const q = query.trim();
    const matchedCategory = SEARCH_CATEGORIES.find((c) => c.value === searchCategory);
    const targetPath = matchedCategory?.path || "/chao-ban-cong-nghe";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (searchCategory !== "all") {
      if (searchCategory === "sang-che") {
        params.set("type", "patent");
      } else {
        params.set("category", searchCategory);
      }
    }
    const qs = params.toString();
    router.push(`${targetPath}${qs ? `?${qs}` : ""}`);
  };

  const listings = listingType === "offers" ? offers : demands;

  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  useEffect(() => {
    setCurrentUser(authClient.getUser());
  }, []);

  const handleOpenAi = (promptText?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nacen:open-ai-assistant", { detail: { prompt: promptText } }));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-950">
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-brand-700 px-4 py-6 text-white sm:py-12 lg:px-8 lg:py-14 [@media(min-height:850px)]:lg:py-16 [@media(max-height:780px)]:py-5 [@media(max-height:780px)]:sm:py-8">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-white">
              Sàn giao dịch công nghệ Quốc gia
            </span>
            <h1 className="mt-3.5 sm:mt-5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold font-sans uppercase tracking-normal sm:tracking-wide leading-snug sm:leading-tight text-white">
              <span className="block">KẾT NỐI CUNG – CẦU CÔNG NGHỆ,</span>
              <span className="block mt-1.5 sm:mt-2">THÚC ĐẨY ĐỔI MỚI SÁNG TẠO</span>
            </h1>

            <form
              className="mx-auto mt-7 sm:mt-9 lg:mt-10 flex w-full max-w-3xl lg:max-w-4xl flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-2 sm:p-2.5 shadow-2xl transition"
              onSubmit={handleSearch}
            >
              {/* Combobox danh mục chuẩn hệ sinh thái NacenTwin */}
              <div className="relative w-full sm:w-56 md:w-64 lg:w-72 shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="focus-ring h-11 sm:h-12 w-full appearance-none rounded-xl bg-white/20 hover:bg-white/25 border border-white/20 pl-3.5 sm:pl-4 pr-9 text-xs sm:text-sm font-medium text-white cursor-pointer truncate transition focus:bg-white/30 focus:outline-none"
                  aria-label="Chọn danh mục tìm kiếm"
                >
                  {SEARCH_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white py-1.5">
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/80" />
              </div>

              {/* Ô nhập từ khóa tìm kiếm */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 size-4.5 sm:size-5 -translate-y-1/2 text-white/60" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm"
                  className="h-11 sm:h-12 w-full border-0 bg-transparent py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 text-sm sm:text-base text-white placeholder:text-white/65 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Nút Tìm kiếm (Trắng chữ xanh đồng bộ theo mẫu ảnh 2) */}
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
                    className="mt-2 text-xs font-bold underline hover:text-white"
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
                    href="/trien-lam"
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

      <main>
        {/* DÀNH CHO NGƯỜI DÙNG MỚI: HƯỚNG DẪN BẮT ĐẦU */}
        <section className="bg-gradient-to-b from-brand-50/60 via-slate-50/40 to-white py-10 sm:py-16 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 border-b border-border-default/60 dark:border-slate-800">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-nacen-green-50 px-3 py-1 text-xs font-bold text-nacen-green-700 border border-nacen-green-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <BookOpen className="size-3.5" />
                Dành Cho Người Dùng Mới
              </span>
              <h2 className="mt-3.5 type-section-title text-text-primary dark:text-white">
                Khám Phá Hệ Thống Theo Vai Trò Của Bạn
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-text-secondary dark:text-slate-300">
                Hệ sinh thái NacenTwin được thiết kế chuyên biệt cho từng tác nhân. Chọn vai trò của bạn để xem quy trình và màn hình hướng dẫn tương ứng:
              </p>
            </div>

            <div className="mt-7 sm:mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Bên Mua */}
              <div className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
                    <Building2 className="size-5" />
                  </div>
                  <h3 className="mt-3.5 sm:mt-4 text-base font-bold text-text-primary dark:text-white">
                    Bên Mua (Buyer)
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Doanh nghiệp khảo sát nhu cầu ĐMST 7 phần, đăng bài toán kỹ thuật, nhận gợi ý AI matching và đàm phán hợp đồng chuyển giao.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=BUYER"
                  className="focus-ring mt-4 sm:mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 dark:text-cyan-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Bên Mua</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Card 2: Bên Bán */}
              <div className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                    <Rocket className="size-5" />
                  </div>
                  <h3 className="mt-3.5 sm:mt-4 text-base font-bold text-text-primary dark:text-white">
                    Bên Bán (Seller)
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Viện nghiên cứu, trường ĐH &amp; doanh nghiệp tạo hồ sơ chào bán công nghệ, thẩm định TRL 1-9 &amp; tình trạng sở hữu trí tuệ.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=SELLER"
                  className="focus-ring mt-4 sm:mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Bên Bán</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Card 3: Chuyên Gia */}
              <div className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-innovation-50 text-innovation-600 dark:bg-cyan-950/70 dark:text-cyan-300">
                    <GraduationCap className="size-5" />
                  </div>
                  <h3 className="mt-3.5 sm:mt-4 text-base font-bold text-text-primary dark:text-white">
                    Chuyên Gia KH&amp;CN
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Nhà khoa học đăng ký nâng hạng, quét tự động CV bằng AI Parser, tham gia thẩm định năng lực TT17 và tư vấn kỹ thuật.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=EXPERT"
                  className="focus-ring mt-4 sm:mt-5 inline-flex items-center gap-1 text-xs font-bold text-innovation-600 hover:text-innovation-700 dark:text-cyan-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Chuyên Gia</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Card 4: Sở KH&CN */}
              <div className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="mt-3.5 sm:mt-4 text-base font-bold text-text-primary dark:text-white">
                    Cán Bộ Sở KH&amp;CN
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Cổng công vụ cấp tỉnh: phê duyệt công nghệ chào bán, quản lý danh bạ 304 DN ĐMST và tổ chức gian hàng Techmart.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=GOV"
                  className="focus-ring mt-4 sm:mt-5 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Sở KH&amp;CN</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* [TASK-01-CR19] Đã gỡ bỏ Banner Cẩm Nang Hướng Dẫn Chi Tiết khỏi Trang Chủ theo yêu cầu PO */}
          </div>
        </section>

        {/* HỆ THỐNG ĐÁNH GIÁ NĂNG LỰC & KHẢO SÁT CÔNG NGHỆ QUỐC GIA (TT17, TNI, DN ĐMST, TRL) */}
        <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 sm:py-16 lg:py-20 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>CÔNG CỤ ĐO LƯỜNG &amp; THẨM ĐỊNH QUỐC GIA</span>
              </div>
              <h2 className="mt-3.5 sm:mt-4 type-section-title text-text-primary dark:text-white">
                Khảo Sát Nhu Cầu &amp; Đánh Giá Năng Lực Công Nghệ
              </h2>
              <p className="mt-2.5 sm:mt-3 text-sm sm:text-base leading-relaxed sm:leading-7 text-text-secondary dark:text-slate-300">
                Hệ thống công cụ đo lường và định vị chuẩn hóa theo quy chuẩn Bộ Khoa học &amp; Công nghệ, giúp doanh nghiệp, viện nghiên cứu và nhà khoa học đánh giá trình độ công nghệ, bắt mạch nhu cầu và kết nối chuyển giao trực tiếp.
              </p>
            </div>

            <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Khảo sát Nhu cầu Công nghệ & Chỉ số TNI */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-amber-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl dark:border-amber-900/40 dark:bg-slate-900">
                <div className="absolute -right-6 -top-6 size-28 rounded-full bg-amber-500/10 blur-xl transition group-hover:bg-amber-500/20" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Flame className="size-3 text-amber-600" />
                      Chỉ số TNI
                    </span>
                    <span className="text-xs font-bold text-amber-600/70 dark:text-amber-400/60">01</span>
                  </div>
                  <div className="mt-4 sm:mt-5 flex items-center gap-3">
                    <div className="grid size-11 sm:size-12 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                      <Target className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-amber-600 transition">
                        Khảo Sát Nhu Cầu (TNI)
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Technology Needs Index</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-text-secondary dark:text-slate-300">
                    Bắt mạch nhu cầu doanh nghiệp, tự động tính toán chỉ số nhu cầu công nghệ (TNI) và kết nối nguồn cung chuyển giao phù hợp.
                  </p>
                  <ul className="mt-3.5 sm:mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3.5 sm:pt-4 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-amber-600 shrink-0" />
                      <span>Form 4 bước tinh gọn &amp; Auto-lookup MST</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-amber-600 shrink-0" />
                      <span>Đo lường mức độ cấp thiết đổi mới</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/khao-sat-nhu-cau"
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 shadow-xs"
                  >
                    <span>Làm Khảo Sát TNI Ngay</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>

              {/* Card 2: Đánh giá Năng lực Doanh nghiệp theo TT17 */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-brand-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-xl dark:border-brand-900/40 dark:bg-slate-900">
                <div className="absolute -right-6 -top-6 size-28 rounded-full bg-brand-500/10 blur-xl transition group-hover:bg-brand-500/20" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      <FileCheck2 className="size-3 text-brand-700" />
                      Thông tư 17/2019
                    </span>
                    <span className="text-xs font-bold text-brand-600/70 dark:text-brand-400/60">02</span>
                  </div>
                  <div className="mt-4 sm:mt-5 flex items-center gap-3">
                    <div className="grid size-11 sm:size-12 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300">
                      <Award className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-brand-700 transition">
                        Đánh Giá Năng Lực TT17
                      </h3>
                      <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">26 Tiêu Chí • 5 Nhóm THIOC</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-text-secondary dark:text-slate-300">
                    Đánh giá trình độ và năng lực công nghệ doanh nghiệp theo Thông tư 17/2019/TT-BKHCN, xếp hạng Tiên tiến, Trung bình hoặc Lạc hậu.
                  </p>
                  <ul className="mt-3.5 sm:mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3.5 sm:pt-4 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-brand-600 shrink-0" />
                      <span>Tính điểm tự động 26 chỉ tiêu định lượng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-brand-600 shrink-0" />
                      <span>Cấp báo cáo thẩm định hồ sơ chính thức</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/assessments/tt17/wizard"
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800 shadow-xs"
                  >
                    <span>Tự Đánh Giá TT17 Ngay</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>

              {/* Card 3: Khảo sát Đổi mới sáng tạo 43 câu (CR-020) */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-teal-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl dark:border-teal-900/40 dark:bg-slate-900">
                <div className="absolute -right-6 -top-6 size-28 rounded-full bg-teal-500/10 blur-xl transition group-hover:bg-teal-500/20" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      <Sparkles className="size-3 text-teal-600" />
                      43 Tiêu Chuẩn ĐMST
                    </span>
                    <span className="text-xs font-bold text-teal-600/70 dark:text-teal-400/60">03</span>
                  </div>
                  <div className="mt-4 sm:mt-5 flex items-center gap-3">
                    <div className="grid size-11 sm:size-12 place-items-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">
                      <ClipboardCheck className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-teal-600 transition">
                        Khảo Sát ĐMST (43 Câu)
                      </h3>
                      <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">8 Nhóm Năng Lực • Chỉ Số TNI</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-text-secondary dark:text-slate-300">
                    Tự động chấm điểm 8 nhóm năng lực, tính toán chỉ số TNI tức thời và xuất hồ sơ Radar Chart trong 1-click.
                  </p>
                  <ul className="mt-3.5 sm:mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3.5 sm:pt-4 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-teal-600 shrink-0" />
                      <span>Autofill hồ sơ pháp nhân SSOT &amp; Khóa MST an toàn</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-teal-600 shrink-0" />
                      <span>Biểu đồ Radar Chart 8 trục &amp; Huy hiệu ĐMST</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <Link
                    href="/khao-sat-dmst"
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 shadow-xs"
                  >
                    <span>Làm Khảo Sát ĐMST Ngay</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/doanh-nghiep-dmst"
                    className="flex w-full items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 py-1"
                  >
                    <span>Xem bảng xếp hạng &amp; danh bạ DN &rarr;</span>
                  </Link>
                </div>
              </article>

              {/* Card 4: Thang đo Mức độ Sẵn sàng Công nghệ TRL 1-9 */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl dark:border-emerald-900/40 dark:bg-slate-900">
                <div className="absolute -right-6 -top-6 size-28 rounded-full bg-emerald-500/10 blur-xl transition group-hover:bg-emerald-500/20" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Rocket className="size-3 text-emerald-600" />
                      Thang Đo TRL 1–9
                    </span>
                    <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/60">04</span>
                  </div>
                  <div className="mt-4 sm:mt-5 flex items-center gap-3">
                    <div className="grid size-11 sm:size-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      <Cpu className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-emerald-600 transition">
                        Thẩm Định Thang Đo TRL
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Technology Readiness Level</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-text-secondary dark:text-slate-300">
                    Chuẩn hóa 9 cấp độ hoàn thiện công nghệ từ phòng lab (TRL 1-3), thử nghiệm (TRL 4-6) đến sẵn sàng thương mại hóa (TRL 7-9).
                  </p>
                  <ul className="mt-3.5 sm:mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3.5 sm:pt-4 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                      <span>Thẩm định độc lập bởi Hội đồng Viện</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                      <span>Gắn nhãn TRL và bảo hộ sở hữu trí tuệ</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/chao-ban-cong-nghe"
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-xs"
                  >
                    <span>Khám Phá Công Nghệ TRL</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* VÌ SAO CHỌN NACENTWIN */}
        <section className="page-container py-10 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="type-section-title text-text-primary dark:text-white">Vì sao chọn NacenTwin</h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base leading-relaxed sm:leading-7 text-text-secondary dark:text-slate-300">
              Nền tảng được xây dựng và vận hành bởi Viện Đổi Mới Sáng Tạo Quốc Gia, đảm bảo độ tin cậy cho mọi giao dịch.
            </p>
          </div>
          <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([Icon, title, description]) => (
              <article
                key={title}
                className="rounded-xl border border-border-default bg-white p-4 sm:p-6 transition hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="grid size-10 sm:size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 sm:mt-5 text-base sm:text-card-title font-bold text-text-primary dark:text-white">{title}</h3>
                <p className="mt-2 sm:mt-4 text-xs sm:text-body text-text-secondary dark:text-slate-300 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CÔNG NGHỆ & NHU CẦU NỔI BẬT */}
        <section className="bg-surface-subtle py-10 sm:py-16 lg:py-20 dark:bg-slate-950/50">
          <div className="page-container">
            <div>
              <h2 className="type-section-title text-text-primary dark:text-white">Công nghệ &amp; nhu cầu nổi bật</h2>
              <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-text-secondary dark:text-slate-300">
                Cập nhật liên tục từ mạng lưới viện, trường, doanh nghiệp trên toàn quốc.
              </p>
            </div>
            <div className="mt-6 sm:mt-8 flex w-full sm:w-auto sm:inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setListingType("offers")}
                className={`focus-ring flex-1 sm:flex-initial rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition text-center ${
                  listingType === "offers"
                    ? "bg-white text-brand-700 shadow-xs dark:bg-brand-950 dark:text-brand-200"
                    : "text-text-secondary hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                }`}
              >
                Chào bán công nghệ
              </button>
              <button
                type="button"
                onClick={() => setListingType("demands")}
                className={`focus-ring flex-1 sm:flex-initial rounded-lg px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition text-center ${
                  listingType === "demands"
                    ? "bg-white text-brand-700 shadow-xs dark:bg-brand-950 dark:text-brand-200"
                    : "text-text-secondary hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                }`}
              >
                Nhu cầu đặt hàng
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {listings.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  <Cpu className="mx-auto h-9 w-9 sm:h-10 sm:w-10 text-slate-400 mb-3" />
                  <p className="font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200">
                    Chưa có {listingType === "offers" ? "công nghệ chào bán" : "nhu cầu đặt hàng"} nào được công bố.
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Dữ liệu sẽ được cập nhật ngay khi hoàn tất thẩm định.
                  </p>
                </div>
              ) : (
                listings.map((item, idx) => (
                  <ListingCard key={`${item.type}-${item.id || item.itemCode || idx}-${idx}`} item={item} />
                ))
              )}
            </div>
            <div className="mt-8 sm:mt-10 flex justify-center">
              <Link
                href={listingType === "offers" ? "/chao-ban-cong-nghe" : "/nhu-cau-cong-nghe"}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-700 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Xem tất cả <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CỤM 3 WIDGET: TRỢ LÝ AI - LĨNH VỰC - DỊCH VỤ VIỆN */}
        <section className="page-container py-10 sm:py-16 lg:py-20">
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-12">
            {/* Widget AI */}
            <section className="rounded-xl sm:rounded-2xl bg-brand-700 p-4 sm:p-6 text-white lg:col-span-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 sm:size-11 place-items-center rounded-xl bg-white/10 text-innovation-50">
                  <Bot className="size-5 sm:size-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">Trợ Lý Ảo AI Nacentwin</h2>
              </div>
              <p className="mt-3.5 sm:mt-5 text-xs sm:text-body text-brand-100 leading-relaxed">
                Hỏi đáp tự động về mức độ TRL 1-9, định giá tham khảo mua/bán công nghệ và gợi ý chuyên gia tư vấn phù hợp nhất.
              </p>
              <div className="mt-5 sm:mt-7 space-y-2 sm:space-y-3">
                {[
                  "Công nghệ của tôi đạt mức TRL nào theo TT17?",
                  "Đề xuất định giá chuyển nhượng sáng chế Nano?",
                  "Tìm chuyên gia AI thị giác máy tính tại Hà Nội?",
                ].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleOpenAi(item)}
                    className="focus-ring w-full rounded-xl border border-white/15 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm text-white transition hover:bg-white/20 hover:border-white/30"
                  >
                    💬 &ldquo;{item}&rdquo;
                  </button>
                ))}
              </div>
              <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/15 pt-4 sm:pt-5">
                <span className="text-xs sm:text-sm font-bold text-innovation-50 text-center sm:text-left">Tích hợp AI-to-Text OCR</span>
                <button
                  type="button"
                  onClick={() => handleOpenAi()}
                  className="focus-ring rounded-xl bg-nacen-green-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-nacen-green-600 w-full sm:w-auto"
                >
                  Mở Trợ Lý AI
                </button>
              </div>
            </section>

            {/* Widget Lĩnh vực */}
            <section className="surface-card p-4 sm:p-6 rounded-xl sm:rounded-2xl lg:col-span-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary dark:text-white">
                  {sectorsLoading || sectorsError ? "Lĩnh Vực Trọng Điểm" : `${sectors.length} Lĩnh Vực Trọng Điểm`}
                </h2>
                <Link
                  href="/matrix"
                  className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-200"
                >
                  Ma trận ngành &rarr;
                </Link>
              </div>
              <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                {sectorsLoading ? (
                  <p role="status" className="col-span-2 text-xs sm:text-body">
                    Đang tải lĩnh vực...
                  </p>
                ) : sectorsError ? (
                  <div className="col-span-2">
                    <p role="alert" className="text-xs sm:text-body text-status-danger">
                      Không tải được danh mục lĩnh vực.
                    </p>
                    <button
                      className="focus-ring min-h-11 text-label text-brand-700"
                      onClick={() => setSectorLoadVersion((value) => value + 1)}
                    >
                      Thử lại
                    </button>
                  </div>
                ) : sectors.length === 0 ? (
                  <p className="col-span-2 text-xs sm:text-body">Chưa có lĩnh vực đang hoạt động.</p>
                ) : (
                  sectors.map((sector) => (
                    <Link
                      href={`/experts?sector=${encodeURIComponent(sector.code)}`}
                      key={sector.code}
                      className="focus-ring flex items-center gap-2 rounded-xl bg-surface-page p-2 sm:p-3 text-left text-xs sm:text-sm font-medium text-slate-800 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                    >
                      <Cpu className="size-3.5 sm:size-4 shrink-0 text-brand-700" />
                      <span className="truncate">{sector.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* Widget Dịch Vụ Viện */}
            <section className="surface-card p-4 sm:p-6 rounded-xl sm:rounded-2xl lg:col-span-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-brand-700 dark:text-brand-200" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary dark:text-white">
                    Dịch Vụ Viện NacenTech
                  </h2>
                </div>
                <ul className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 sm:size-4 shrink-0 text-nacen-green-700 dark:text-nacen-green-200" />
                    <Link href="/assessments/tt17/wizard" className="hover:text-brand-700 hover:underline">
                      Đánh giá năng lực công nghệ theo TT17
                    </Link>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 sm:size-4 shrink-0 text-nacen-green-700 dark:text-nacen-green-200" />
                    <Link href="/chao-ban-cong-nghe" className="hover:text-brand-700 hover:underline">
                      Chứng nhận mức độ sẵn sàng TRL 1-9
                    </Link>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 sm:size-4 shrink-0 text-nacen-green-700 dark:text-nacen-green-200" />
                    <Link href="/doanh-nghiep-dmst" className="hover:text-brand-700 hover:underline">
                      Đánh giá &amp; xếp hạng Doanh nghiệp ĐMST
                    </Link>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 sm:size-4 shrink-0 text-nacen-green-700 dark:text-nacen-green-200" />
                    <Link href="/khao-sat-nhu-cau" className="hover:text-brand-700 hover:underline">
                      Khảo sát &amp; tính toán chỉ số TNI nhu cầu
                    </Link>
                  </li>
                </ul>
              </div>
              <Link
                href="/khao-sat-nhu-cau"
                className="focus-ring mt-5 sm:mt-7 block w-full rounded-xl bg-nacen-green-500 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-bold text-white transition hover:bg-nacen-green-600 shadow-xs"
              >
                Đăng Ký Tư Vấn Thẩm Định
              </Link>
            </section>
          </div>
        </section>

        {/* QUY TRÌNH 6 BƯỚC */}
        <section className="page-container py-10 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="type-section-title text-text-primary dark:text-white">Quy trình 6 bước</h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-text-secondary dark:text-slate-300">
              Minh bạch, rõ ràng từ lúc đăng tải đến khi công nghệ được ứng dụng thực tế.
            </p>
          </div>
          <ol className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {processes.map(([Icon, title, description], index) => (
              <li
                key={title}
                className="rounded-xl border border-border-default bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 sm:size-11 place-items-center rounded-full bg-brand-700 text-xs sm:text-sm font-bold text-white shadow-xs">
                    {index + 1}
                  </span>
                  <Icon className="size-5 sm:size-6 text-nacen-green-700 dark:text-nacen-green-200" />
                </div>
                <h3 className="mt-4 sm:mt-5 text-base sm:text-card-title font-bold text-text-primary dark:text-white">{title}</h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-body text-text-secondary dark:text-slate-300 leading-relaxed">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA BOTTOM BANNER */}
        <section className="page-container pb-12 sm:pb-16">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-nacen-green-500 to-nacen-green-700 px-4 py-10 sm:px-12 sm:py-16 text-center text-white shadow-lg">
            <h2 className="type-section-title text-xl sm:text-2xl md:text-3xl">Sẵn sàng đưa công nghệ của bạn đến gần hơn với thị trường?</h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-xs sm:text-base text-nacen-green-50 leading-relaxed">
              Tham gia mạng lưới hơn 10.000 doanh nghiệp, viện nghiên cứu và nhà đầu tư trên toàn quốc ngay hôm nay.
            </p>
            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/register"
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-nacen-green-700 transition hover:bg-nacen-green-50 shadow-xs"
              >
                Đăng ký miễn phí <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dich-vu-khac"
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
