"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
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
  Globe2,
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
  Zap,
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import { authClient, UserContext } from "@/lib/auth-client";
import { portalClient, PortalOverviewStats } from "@/lib/portal-client";
import { fetchPublicOffers } from "@/services/api/technology-offer";
import { Async, AsyncState } from "@/components/ui/async";
import { getTechnologyImage } from "@/lib/technology-media";
import { AppCard } from "@/components/ui/app-card";
import { AppBadge } from "@/components/ui/app-badge";
import { IndexVerificationBadge } from "@/components/common/IndexVerificationBadge";

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

const CONNECT_WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Khám Phá & Định Danh",
    subtitle: "Tạo tài khoản SSO dùng chung cho Doanh nghiệp & Nhà khoa học",
    description: "Khởi tạo hồ sơ ĐMST trực tuyến, định danh pháp nhân số và thiết lập quyền truy cập cổng kết nối công nghệ liên thông toàn quốc.",
    icon: FileSearch,
    color: "from-cyan-500 to-blue-600",
    badge: "Bước 1",
  },
  {
    step: "02",
    title: "Thẩm Định TRL & Pháp Lý",
    subtitle: "Kiểm duyệt TRL 1-9 & tình trạng sở hữu trí tuệ",
    description: "Hội đồng khoa học Viện NacenTech phối hợp cùng 34 Sở KH&CN thẩm định cấp độ sẵn sàng công nghệ, rà soát quyền bằng sáng chế và giải pháp hữu ích.",
    icon: ClipboardCheck,
    color: "from-blue-600 to-indigo-600",
    badge: "Bước 2",
  },
  {
    step: "03",
    title: "Khớp Nối AI & Đàm Phán",
    subtitle: "Gợi ý thông minh & phòng đàm phán trực tuyến bảo mật",
    description: "Thuật toán AI Matching phân tích ma trận 18 ngành TT17, tự động khớp nối bài toán của doanh nghiệp với công nghệ chào bán và mở phòng làm việc.",
    icon: Handshake,
    color: "from-indigo-600 to-emerald-600",
    badge: "Bước 3",
  },
  {
    step: "04",
    title: "Ký Kết Chuyển Giao & Hậu Kiểm",
    subtitle: "Ký MOU số hóa & đồng hành hỗ trợ kỹ thuật thực tế",
    description: "Hai bên xác lập thỏa thuận chuyển giao công nghệ chính thức, ký số hợp đồng và được đội ngũ chuyên gia Viện bảo trợ kỹ thuật trong suốt quá trình vận hành.",
    icon: Rocket,
    color: "from-emerald-600 to-teal-500",
    badge: "Bước 4",
  },
] as const;

const PARTNER_PILLARS = [
  {
    category: "Viện Nghiên Cứu & Trường Đại Học",
    description: "Nguồn cung công nghệ nguồn, sáng chế độc quyền và đội ngũ chuyên gia đầu ngành",
    partners: [
      "Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)",
      "Đại học Bách Khoa Hà Nội",
      "Đại học Quốc gia Hà Nội",
      "Đại học Quốc gia TP.HCM",
      "Viện Hàn lâm KH&CN Việt Nam",
      "Trường Đại học Dược Hà Nội",
    ],
  },
  {
    category: "Mạng Lưới 34 Sở KH&CN Trọng Điểm",
    description: "Đầu mối tiếp nhận, thẩm định và bảo trợ chuyển giao công nghệ tại từng địa phương",
    partners: [
      "Sở KH&CN TP. Hà Nội",
      "Sở KH&CN TP. Hồ Chí Minh",
      "Sở KH&CN TP. Đà Nẵng",
      "Sở KH&CN TP. Hải Phòng",
      "Sở KH&CN TP. Cần Thơ",
      "Sở KH&CN Tỉnh Đắk Lắk",
    ],
  },
  {
    category: "Doanh Nghiệp ĐMST & Tập Đoàn Tiên Phong",
    description: "Bên đặt hàng bài toán thực tế, tiếp nhận chuyển giao và ứng dụng công nghệ vào sản xuất",
    partners: [
      "Tập đoàn Công nghệ & Chế tạo",
      "Doanh nghiệp KH&CN Tiêu biểu",
      "Công ty Nông nghiệp CNC",
      "Hiệp hội Doanh nghiệp Đổi mới sáng tạo",
      "Nhà máy Dược phẩm Chuẩn GMP",
      "Các Quỹ Đầu tư ĐMST Quốc gia",
    ],
  },
] as const;

const features = [
  [ShieldCheck, "Công nghệ được kiểm định", "Mỗi công nghệ đăng tải đều được Viện thẩm định mức độ sẵn sàng (TRL) và pháp lý sở hữu trí tuệ trước khi công bố."],
  [Handshake, "Kết nối trực tiếp, không trung gian", "Doanh nghiệp và nhà khoa học trao đổi, đàm phán chuyển giao trực tiếp trên nền tảng, tiết kiệm thời gian và chi phí."],
  [LineChart, "Dữ liệu minh bạch, cập nhật", "Theo dõi tiến độ giao dịch, lịch sử chuyển giao và đánh giá từ các bên theo thời gian thực."],
  [Clock, "Hỗ trợ 24/7 từ chuyên gia", "Đội ngũ chuyên gia của Viện đồng hành tư vấn kỹ thuật, pháp lý và tài chính cho từng giao dịch."],
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
  const toast = useToast();

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
                  field: o.sectorName || o.sectorCode || "Khoa học & Công nghệ",
                  owner: o.enterpriseName || o.developerOrigin || "Chủ sở hữu công nghệ",
                  location: o.managingAuthorityName || "Toàn quốc",
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
                  title: d.technicalProblem || d.stageName || "Bài toán công nghệ",
                  field: d.sectorCode || "Nhu cầu ĐMST",
                  owner: d.province || "Doanh nghiệp",
                  location: d.province || "Toàn quốc",
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

  const handleTrendingTagClick = (tag: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nacen:open-ai-assistant", { detail: { prompt: tag } }));
    }
  };

  const listings = listingType === "offers" ? offers : demands;

  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  useEffect(() => {
    setCurrentUser(authClient.getUser());
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-950 font-sans">
      {/* ========================================================================= */}
      {/* PHẦN TỪ BACKGROUND TRỞ LÊN: HERO BANNER GỐC THANH THOÁT                   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-brand-700 px-4 py-6 text-white sm:py-12 lg:px-8 lg:py-14 [@media(min-height:850px)]:lg:py-16 [@media(max-height:780px)]:py-5 [@media(max-height:780px)]:sm:py-8">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-brand-100">
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

      {/* ========================================================================= */}
      {/* PHẦN TỪ BACKGROUND TRẮNG TRỞ XUỐNG: GIAO DIỆN NÂNG CẤP SPRINT 3 CHUẨN      */}
      {/* ========================================================================= */}
      <main>
        {/* ========================================================================= */}
        {/* 1. LƯỚI THẺ LISTING CÔNG NGHỆ & NHU CẦU NỔI BẬT (T-01.33)                */}
        {/* ========================================================================= */}
        <section className="bg-slate-50/60 dark:bg-slate-950/50 py-10 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
          <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-cyan-300 dark:border-blue-800">
                  <Sparkles className="size-3.5 text-blue-600 dark:text-cyan-400" />
                  Cơ Sở Dữ Liệu Quốc Gia ĐMST
                </span>
                <h2 className="mt-3 type-section-title text-text-primary dark:text-white">
                  Công Nghệ &amp; Nhu Cầu Nổi Bật
                </h2>
                <p className="mt-2 text-sm sm:text-base text-text-secondary dark:text-slate-300">
                  Cập nhật liên tục từ mạng lưới viện, trường, doanh nghiệp và 34 Sở KH&amp;CN trên toàn quốc.
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
                  Công nghệ chào bán ({offers.length})
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
                  Nhu cầu đặt hàng ({demands.length})
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
                      Dữ liệu sẽ được cập nhật ngay khi hoàn tất thẩm định bởi Hội đồng Viện.
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

        {/* ========================================================================= */}
        {/* 2. QUY TRÌNH KẾT NỐI 4 BƯỚC TRỰC QUAN ĐMST (T-01.34)                      */}
        {/* ========================================================================= */}
        <section className="bg-white py-12 sm:py-16 lg:py-20 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Chuẩn Hóa Quy Trình Quốc Gia
              </span>
              <h2 className="mt-3.5 type-section-title text-text-primary dark:text-white">
                Quy Trình Kết Nối &amp; Chuyển Giao Công Nghệ 4 Bước
              </h2>
              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-text-secondary dark:text-slate-300">
                Minh bạch, bảo mật và được bảo trợ pháp lý bởi Viện Đổi Mới Sáng Tạo Quốc Gia cùng mạng lưới 34 Sở KH&amp;CN trọng điểm.
              </p>
            </div>

            <div className="mt-12 relative">
              {/* Đường kẻ tiến trình phát sáng nối liền 4 bước trên Desktop */}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-500 rounded-full opacity-60 z-0"
              />

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                {CONNECT_WORKFLOW_STEPS.map((wf) => {
                  const StepIcon = wf.icon;
                  return (
                    <article
                      key={wf.step}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        {/* Biểu tượng và số thứ tự */}
                        <div className="flex items-center justify-between">
                          <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${wf.color} text-white shadow-md`}>
                            <StepIcon className="size-6 text-white" />
                          </div>
                          <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700 group-hover:text-brand-500 transition">
                            {wf.step}
                          </span>
                        </div>

                        <span className="inline-block mt-4 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-cyan-400">
                          {wf.badge}
                        </span>
                        <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-white font-sans">
                          {wf.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-snug">
                          {wf.subtitle}
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          {wf.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Link
                          href="/huong-dan"
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-cyan-400 group-hover:translate-x-1 transition"
                        >
                          <span>Xem chi tiết bước</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. KHỐI MẠNG LƯỚI ĐỐI TÁC & 63 SỞ KH&CN (T-01.35)                          */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 sm:py-16 lg:py-20 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800">
                <Globe2 className="size-3.5 text-cyan-600" />
                Hệ Sinh Thái ĐMST Toàn Diện
              </span>
              <h2 className="mt-3.5 type-section-title text-text-primary dark:text-white">
                Mạng Lưới Đổi Mới Sáng Tạo &amp; Chuyển Giao Công Nghệ Toàn Quốc
              </h2>
              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-text-secondary dark:text-slate-300">
                Hội tụ sức mạnh từ 3 trụ cột vững chắc: Nguồn cung công nghệ từ Viện/Trường, Bảo trợ cấp tỉnh từ 34 Sở KH&amp;CN trọng điểm, và Động lực ứng dụng từ cộng đồng Doanh nghiệp ĐMST.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {PARTNER_PILLARS.map((pillar, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700 text-xs font-bold dark:bg-slate-800 dark:text-cyan-400">
                        0{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {pillar.category}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      {pillar.description}
                    </p>
                    <ul className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                      {pillar.partners.map((p, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={idx === 1 ? "/so-khcn" : idx === 0 ? "/experts" : "/doanh-nghiep-dmst"}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline"
                    >
                      <span>Khám phá danh bạ mạng lưới</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. HỆ THỐNG ĐÁNH GIÁ NĂNG LỰC & KHẢO SÁT CÔNG NGHỆ QUỐC GIA (TT17, TNI)     */}
        {/* ========================================================================= */}
        <section className="bg-white py-10 sm:py-14 lg:py-16 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-brand-700 dark:bg-blue-950/80 dark:text-cyan-300 border border-blue-200/80 dark:border-blue-800 shadow-2xs">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>CÔNG CỤ ĐO LƯỜNG &amp; THẨM ĐỊNH QUỐC GIA</span>
              </div>
              <h2 className="mt-3 type-section-title text-text-primary dark:text-white">
                Khảo Sát Nhu Cầu &amp; Đánh Giá Năng Lực Công Nghệ
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary dark:text-slate-300 max-w-2xl mx-auto">
                Hệ thống công cụ đo lường và định vị chuẩn hóa theo quy chuẩn Bộ Khoa học &amp; Công nghệ.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Khảo Sát Nhu Cầu TNI */}
              <AppCard
                elevation={1}
                interactive
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg dark:border-amber-900/40 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <AppBadge variant="warning" size="sm" className="font-bold flex items-center gap-1 shadow-2xs">
                      <Flame className="size-3 text-amber-600" />
                      <span>Chỉ số TNI</span>
                    </AppBadge>
                    <span className="font-mono text-xl font-black text-amber-400/80 dark:text-amber-500/50 group-hover:text-amber-500 transition">01</span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 shrink-0">
                      <Target className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans group-hover:text-amber-600 transition leading-snug">
                        Khảo Sát Nhu Cầu (TNI)
                      </h3>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Technology Needs Index</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    Bắt mạch nhu cầu doanh nghiệp, tự động tính toán chỉ số nhu cầu công nghệ và kết nối nguồn cung chuyển giao.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/khao-sat-nhu-cau"
                    className="btn-press flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600"
                  >
                    <span>Làm Khảo Sát TNI Ngay</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </AppCard>

              {/* Card 2: Đánh Giá Năng Lực TT17 */}
              <AppCard
                elevation={1}
                interactive
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg dark:border-brand-900/40 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <AppBadge variant="info" size="sm" className="font-bold flex items-center gap-1 shadow-2xs">
                      <FileCheck2 className="size-3 text-brand-700" />
                      <span>Thông tư 17/2019</span>
                    </AppBadge>
                    <span className="font-mono text-xl font-black text-brand-400/80 dark:text-brand-500/50 group-hover:text-brand-600 transition">02</span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 shrink-0">
                      <Award className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans group-hover:text-brand-700 transition leading-snug">
                        Đánh Giá Năng Lực TT17
                      </h3>
                      <p className="text-xs font-semibold text-brand-700 dark:text-cyan-400">26 Tiêu Chí • 5 Nhóm THIOC</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    Đánh giá trình độ và năng lực công nghệ doanh nghiệp theo Thông tư 17/2019/TT-BKHCN.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/assessments/tt17/wizard"
                    className="btn-press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-700 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-800"
                  >
                    <span>Tự Đánh Giá TT17 Ngay</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </AppCard>

              {/* Card 3: Khảo sát Đổi mới sáng tạo 43 câu */}
              <AppCard
                elevation={1}
                interactive
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-teal-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg dark:border-teal-900/40 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <AppBadge variant="success" size="sm" className="font-bold flex items-center gap-1 shadow-2xs">
                      <Sparkles className="size-3 text-teal-600" />
                      <span>43 Tiêu Chuẩn ĐMST</span>
                    </AppBadge>
                    <span className="font-mono text-xl font-black text-teal-400/80 dark:text-teal-500/50 group-hover:text-teal-600 transition">03</span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 shrink-0">
                      <ClipboardCheck className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans group-hover:text-teal-600 transition leading-snug">
                        Khảo Sát ĐMST (43 Câu)
                      </h3>
                      <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">8 Nhóm Năng Lực</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    Tự động chấm điểm 8 nhóm năng lực, tính toán chỉ số TNI tức thời và xuất hồ sơ Radar Chart.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/khao-sat-dmst"
                    className="btn-press flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-700"
                  >
                    <span>Làm Khảo Sát ĐMST Ngay</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </AppCard>

              {/* Card 4: Thang đo Mức độ Sẵn sàng Công nghệ TRL 1-9 */}
              <AppCard
                elevation={1}
                interactive
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg dark:border-emerald-900/40 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <AppBadge variant="neutral" size="sm" className="font-bold flex items-center gap-1 shadow-2xs">
                      <Rocket className="size-3 text-emerald-600" />
                      <span>Thang Đo TRL 1–9</span>
                    </AppBadge>
                    <span className="font-mono text-xl font-black text-emerald-400/80 dark:text-emerald-500/50 group-hover:text-emerald-600 transition">04</span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 shrink-0">
                      <Cpu className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans group-hover:text-emerald-600 transition leading-snug">
                        Thẩm Định Thang Đo TRL
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Technology Readiness Level</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    Chuẩn hóa 9 cấp độ hoàn thiện công nghệ từ phòng lab (TRL 1-3), thử nghiệm (TRL 4-6) đến thương mại hóa (TRL 7-9).
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/chao-ban-cong-nghe"
                    className="btn-press flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                  >
                    <span>Khám Phá Công Nghệ TRL</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </AppCard>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. VÌ SAO CHỌN NACENTWIN                                                  */}
        {/* ========================================================================= */}
        <section className="page-container py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="type-section-title text-text-primary dark:text-white">Vì sao chọn NacenTwin</h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base leading-relaxed sm:leading-7 text-text-secondary dark:text-slate-300">
              Nền tảng được xây dựng và vận hành bởi Viện Đổi Mới Sáng Tạo Quốc Gia, đảm bảo độ tin cậy cho mọi giao dịch.
            </p>
          </div>

          <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([Icon, title, desc]) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800 dark:text-cyan-400 dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-text-primary dark:text-white font-sans">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-text-secondary dark:text-slate-300 font-sans">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. GIA NHẬP HỆ SINH THÁI ĐMST & CTA CUỐI TRANG                             */}
        {/* ========================================================================= */}
        <section className="page-container pb-12 sm:pb-16">
          <div className="relative overflow-hidden rounded-2xl bg-brand-700 p-8 sm:p-12 text-white border border-white/10 shadow-md">
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 border border-white/20">
                <Rocket className="size-3.5" />
                Đồng Hành Đổi Mới Sáng Tạo
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight mt-4">
                Gia Nhập Hệ Sinh Thái Đổi Mới Sáng Tạo &amp; Chuyển Giao Công Nghệ Quốc Gia
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/85 max-w-2xl mx-auto">
                Kết nối ngay hôm nay để đưa sản phẩm nghiên cứu vào sản xuất thực tế, hoặc tìm kiếm giải pháp công nghệ nâng tầm doanh nghiệp.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link
                  href="/seller/technologies/new"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm sm:text-base font-bold text-brand-700 shadow-md hover:bg-slate-50 transition"
                >
                  <Rocket className="size-4 text-brand-700" />
                  <span>Đăng ký chào bán công nghệ</span>
                </Link>
                <Link
                  href="/nhu-cau-cong-nghe"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-5 py-3 text-sm sm:text-base font-semibold text-white border border-white/25 transition"
                >
                  <span>Gửi bài toán nhu cầu ĐMST</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
