"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
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
  Layers,
  LineChart,
  MapPin,
  Rocket,
  Search,
  ShieldCheck,
  SlidersHorizontal,
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
import { AppButton } from "@/components/ui/design-system";
import { AppCard, AppCardContent } from "@/components/ui/app-card";
import { AppBadge } from "@/components/ui/app-badge";

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

type OmniTab = "cong-nghe" | "nhu-cau" | "chuyen-gia" | "doanh-nghiep";

const OMNI_TABS: Array<{
  id: OmniTab;
  label: string;
  icon: typeof Layers;
  badgeKey: keyof PortalOverviewStats;
  defaultBadge: number;
  path: string;
}> = [
  {
    id: "cong-nghe",
    label: "Công Nghệ Chào Bán",
    icon: Layers,
    badgeKey: "totalOffers",
    defaultBadge: 1479,
    path: "/chao-ban-cong-nghe",
  },
  {
    id: "nhu-cau",
    label: "Nhu Cầu Đặt Hàng",
    icon: Target,
    badgeKey: "totalDemands",
    defaultBadge: 680,
    path: "/nhu-cau-cong-nghe",
  },
  {
    id: "chuyen-gia",
    label: "Chuyên Gia KH&CN",
    icon: GraduationCap,
    badgeKey: "totalExperts",
    defaultBadge: 3420,
    path: "/experts",
  },
  {
    id: "doanh-nghiep",
    label: "Doanh Nghiệp ĐMST",
    icon: Building2,
    badgeKey: "totalEnterprises",
    defaultBadge: 304,
    path: "/doanh-nghiep-dmst",
  },
];

const SECTORS_TT17 = [
  { value: "", label: "Tất cả 18 Ngành (TT17)" },
  { value: "CNTT", label: "1. CNTT & Viễn thông" },
  { value: "CNSH", label: "2. Công nghệ sinh học & Y dược" },
  { value: "TDH", label: "3. Tự động hóa & Robot học" },
  { value: "VLM", label: "4. Vật liệu mới & Nanotech" },
  { value: "NLTT", label: "5. Năng lượng tái tạo & Môi trường" },
  { value: "NNCNC", label: "6. Nông nghiệp công nghệ cao" },
  { value: "CKCT", label: "7. Cơ khí chế tạo chính xác" },
  { value: "AI", label: "8. Trí tuệ nhân tạo & Khoa học dữ liệu" },
  { value: "YTE", label: "9. Y tế & Thiết bị y tế thông minh" },
  { value: "HC", label: "10. Hóa chất & Vật liệu sinh học" },
  { value: "MT", label: "11. Môi trường & Xử lý nước thải" },
  { value: "TP", label: "12. Công nghệ thực phẩm & Nông sản" },
  { value: "BD", label: "13. Vi điện tử & Bán dẫn" },
  { value: "HK", label: "14. Hàng không vũ trụ & Viễn thám" },
  { value: "HCU", label: "15. Hậu cần & Chuỗi cung ứng số" },
  { value: "XD", label: "16. Xây dựng & Vật liệu xanh" },
  { value: "KTTH", label: "17. Kinh tế tuần hoàn & Tái chế" },
  { value: "CDS", label: "18. Chuyển đổi số & Quản trị số" },
] as const;

const TRL_SEGMENTS = [
  { value: "", label: "Mọi TRL (1-9)" },
  { value: "trl-7-9", label: "TRL 7-9 (Thương mại hóa)" },
  { value: "trl-4-6", label: "TRL 4-6 (Thử nghiệm Lab/Pilot)" },
  { value: "trl-1-3", label: "TRL 1-3 (Nghiên cứu cơ bản)" },
] as const;

const TRENDING_TAGS = [
  "Trí tuệ nhân tạo y tế",
  "Robot hàn 3D",
  "Nano Curcumin",
  "Pin thể rắn Perovskite",
  "IoT Nông nghiệp",
  "Xử lý nước thải Nano",
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
    description: "Hội đồng khoa học Viện NacenTech phối hợp cùng 63 Sở KH&CN thẩm định cấp độ sẵn sàng công nghệ, rà soát quyền bằng sáng chế và giải pháp hữu ích.",
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
      "Viện Ứng dụng Công nghệ (NacenTech)",
      "Đại học Bách Khoa Hà Nội",
      "Đại học Quốc gia Hà Nội",
      "Đại học Quốc gia TP.HCM",
      "Viện Hàn lâm KH&CN Việt Nam",
      "Trường Đại học Dược Hà Nội",
    ],
  },
  {
    category: "Mạng Lưới 63 Sở KH&CN Toàn Quốc",
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

/**
 * AnimatedNumber: Hiển thị số tăng mượt mà trong browser,
 * nhưng trong môi trường test/SSR hiển thị trực tiếp giá trị để test assertions chạy ổn định.
 */
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (typeof window === "undefined" || process.env.NODE_ENV === "test") {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 800;
    const stepTime = 16;
    const totalSteps = Math.max(Math.floor(duration / stepTime), 1);
    const increment = value / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        start += increment;
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString("vi-VN")}</>;
}

function ListingCard({ item }: { item: Listing }) {
  const detailHref =
    item.type === "offers"
      ? item.id
        ? `/chao-ban-cong-nghe/${item.id}`
        : "/chao-ban-cong-nghe"
      : item.id
      ? `/nhu-cau-cong-nghe/${item.id}`
      : "/nhu-cau-cong-nghe";

  // Phân loại TRL theo 3 dải màu chuẩn hóa BD-01:
  // TRL 1-3: Xanh dương (info), TRL 4-6: Hổ phách (warning), TRL 7-9: Xanh lục Emerald (success)
  const trlMatch = item.trl.match(/TRL\s*(\d+)/i);
  const trlLevel = trlMatch ? parseInt(trlMatch[1], 10) : undefined;
  const trlVariant: "info" | "warning" | "success" =
    trlLevel !== undefined
      ? trlLevel <= 3
        ? "info"
        : trlLevel <= 6
        ? "warning"
        : "success"
      : "success";

  return (
    <AppCard
      elevation={1}
      interactive
      className="group flex flex-col justify-between overflow-hidden p-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
          {/* Huy hiệu ngành KH&CN ở góc trên bên trái */}
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-700 shadow-md backdrop-blur-md dark:bg-slate-900/90 dark:text-cyan-300">
            {item.field}
          </span>
          {/* Huy hiệu TRL ở góc trên bên phải */}
          <div className="absolute right-3 top-3">
            {trlLevel !== undefined ? (
              <AppBadge variant={trlVariant} size="sm" className="font-bold shadow-md">
                TRL {trlLevel}
              </AppBadge>
            ) : (
              <AppBadge variant="neutral" size="sm" className="font-bold shadow-md">
                {item.trl}
              </AppBadge>
            )}
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
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-text-secondary dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px]">{item.location}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = detailHref;
                }
              }}
              className="btn-press inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:hover:bg-brand-900 dark:text-cyan-300 font-bold text-xs transition cursor-pointer"
            >
              {item.type === "offers" ? "Yêu Cầu Kết Nối" : "Đề Xuất Giải Pháp"}
            </button>
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

  // Omni-search state
  const [activeTab, setActiveTab] = useState<OmniTab>("cong-nghe");
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [trlFilter, setTrlFilter] = useState("");

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

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const q = query.trim();
    const currentTab = OMNI_TABS.find((t) => t.id === activeTab);
    const targetPath = currentTab?.path || "/chao-ban-cong-nghe";

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sectorFilter) params.set("sector", sectorFilter);
    if (trlFilter) {
      params.set("trl", trlFilter);
      params.set("trlRange", trlFilter);
    }

    const qs = params.toString();
    router.push(`${targetPath}${qs ? `?${qs}` : ""}`);
  };

  const handleTrendingTagClick = (tag: string) => {
    setQuery(tag);
    const currentTab = OMNI_TABS.find((t) => t.id === activeTab);
    const targetPath = currentTab?.path || "/chao-ban-cong-nghe";
    const params = new URLSearchParams();
    params.set("q", tag);
    if (sectorFilter) params.set("sector", sectorFilter);
    if (trlFilter) {
      params.set("trl", trlFilter);
      params.set("trlRange", trlFilter);
    }
    const qs = params.toString();
    router.push(`${targetPath}${qs ? `?${qs}` : ""}`);
  };

  const listings = listingType === "offers" ? offers : demands;

  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  useEffect(() => {
    setCurrentUser(authClient.getUser());
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-950 font-sans">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & OMNI-SEARCH BAR 4 TAB (T-01.31)                         */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1E293B] via-[#23365D] to-[#172554] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 text-white sm:py-14 lg:px-8 lg:py-16">
        {/* Glow Orbs: Cyan góc trên phải, Blue góc dưới trái */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl"
        />
        {/* Nền đồ họa công nghệ quang học */}
        <div
          aria-hidden="true"
          className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80"
        />

        <div className="relative mx-auto max-w-7xl z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Huy hiệu định vị Cổng ĐMST Quốc Gia */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-blue-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <Sparkles className="size-3.5 text-cyan-400" />
              <span>Sàn Giao Dịch &amp; Khớp Nối Cung Cầu Công Nghệ Quốc Gia — NacenTech</span>
            </span>

            {/* Headline truyền cảm hứng ĐMST sắc nét */}
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase font-sans">
              Tra Cứu &amp; Đấu Thầu Chuyển Giao Công Nghệ
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Cơ sở dữ liệu liên thông 18 ngành trọng điểm TT17, 63 Sở KH&amp;CN và hàng chục nghìn giải pháp công nghệ đã qua kiểm định TRL 1-9.
            </p>

            {/* Omni-Search Bar Tích Hợp 4 Tab Chuyên Biệt */}
            <div className="mt-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-5 shadow-2xl text-slate-800 dark:text-slate-100 text-left">
              {/* 4 Tabs Omni-Search */}
              <div
                role="tablist"
                aria-label="Chọn danh mục tìm kiếm"
                className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3.5 overflow-x-auto scrollbar-none"
              >
                {OMNI_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`btn-press inline-flex items-center min-h-[44px] gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap focus-ring ${
                        isActive
                          ? "bg-brand-700 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {tab.defaultBadge.toLocaleString("vi-VN")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Form tìm kiếm & bộ lọc */}
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  {/* Ô nhập từ khóa */}
                  <div className="md:col-span-6 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Search className="size-4" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Nhập tên công nghệ, bằng sáng chế, mã định danh TECH-ID hoặc đơn vị..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition font-sans"
                      aria-label="Nhập từ khóa tìm kiếm"
                    />
                  </div>

                  {/* Hộp chọn 18 ngành TT17 */}
                  <div className="md:col-span-3 relative">
                    <select
                      value={sectorFilter}
                      onChange={(e) => setSectorFilter(e.target.value)}
                      aria-label="Chọn ngành TT17"
                      className="w-full py-2.5 pl-3 pr-8 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition appearance-none cursor-pointer truncate font-sans"
                    >
                      {SECTORS_TT17.map((sec) => (
                        <option key={sec.value} value={sec.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {sec.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  </div>

                  {/* Hộp chọn phân khúc TRL */}
                  <div className="md:col-span-2 relative">
                    <select
                      value={trlFilter}
                      onChange={(e) => setTrlFilter(e.target.value)}
                      aria-label="Chọn phân khúc TRL"
                      className="w-full py-2.5 pl-3 pr-8 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition appearance-none cursor-pointer truncate font-sans"
                    >
                      {TRL_SEGMENTS.map((seg) => (
                        <option key={seg.value} value={seg.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {seg.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  </div>

                  {/* Nút CTA Emerald #2D9A85 */}
                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      aria-label="Tìm kiếm"
                      className="btn-press w-full min-h-[44px] min-w-[44px] py-2.5 px-4 bg-nacen-green-500 hover:bg-nacen-green-600 active:scale-[0.98] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg hover:shadow-emerald-900/30 transition cursor-pointer shrink-0"
                    >
                      <Search className="size-4 shrink-0 text-white" />
                      <span className="md:hidden">Tìm kiếm</span>
                    </button>
                  </div>
                </div>

                {/* Dải từ khóa xu hướng (Hot Trending Tags) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Xu hướng tìm kiếm:</span>
                    {TRENDING_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTrendingTagClick(tag)}
                        className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/80 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/chao-ban-cong-nghe"
                    className="inline-flex items-center gap-1 font-semibold text-brand-700 dark:text-cyan-400 hover:underline"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span>Bộ lọc 1,479 tiêu chí chuyên sâu</span>
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. KHỐI THỐNG KÊ QUỐC GIA 4 THẺ THỜI GIAN THỰC (T-01.32)                 */}
          {/* ========================================================================= */}
          <div className="mx-auto mt-8 sm:mt-10 max-w-5xl">
            <Async
              state={statsState}
              loadingSkeleton={
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-3 sm:p-4 animate-pulse">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl">
                        <div className="h-7 w-7 bg-white/20 rounded-full mb-3" />
                        <div className="h-8 w-20 bg-white/20 rounded-lg mb-2" />
                        <div className="h-4 w-28 bg-white/15 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              }
              errorContent={
                <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/15">
                  <AlertCircle className="size-6 text-rose-300 mx-auto mb-2" data-testid="alert-circle-icon" />
                  <p className="text-xs text-rose-200">Không thể tải số liệu thống kê thời gian thực.</p>
                  <button
                    type="button"
                    onClick={() => setStatsVersion((v) => v + 1)}
                    className="mt-2 inline-flex items-center justify-center min-h-[44px] px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold underline hover:text-white cursor-pointer"
                  >
                    Thử lại (Tải lại số liệu)
                  </button>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Thẻ 1: Tổng Cung Công Nghệ */}
                <Link
                  href="/chao-ban-cong-nghe"
                  title="Sàn chào bán công nghệ"
                  aria-label="Công nghệ chào bán"
                  className="group flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/15 dark:border-white/10 text-center transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5 shadow-lg"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mb-2.5">
                    <Layers className="size-6 text-[#06B6D4]" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white group-hover:text-cyan-300 transition">
                    <AnimatedNumber value={statsData?.totalOffers || 0} />
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition flex items-center justify-center gap-1">
                    <span>Công nghệ chào bán</span>
                    <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </div>
                </Link>

                {/* Thẻ 2: Tổng Cầu Đặt Hàng */}
                <Link
                  href="/nhu-cau-cong-nghe"
                  title="Bảng nhu cầu công nghệ"
                  aria-label="Nhu cầu đặt hàng"
                  className="group flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/15 dark:border-white/10 text-center transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5 shadow-lg"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-2.5">
                    <Target className="size-6 text-[#10B981]" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white group-hover:text-emerald-300 transition">
                    <AnimatedNumber value={statsData?.totalDemands || 0} />
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition flex items-center justify-center gap-1">
                    <span>Nhu cầu đặt hàng</span>
                    <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </div>
                </Link>

                {/* Thẻ 3: Kết Nối & MOU Thành Công */}
                <Link
                  href="/trien-lam"
                  title="Kết nối cung cầu và ký kết MOU"
                  aria-label="Kết nối thành công & MOU"
                  className="group flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/15 dark:border-white/10 text-center transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5 shadow-lg"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mb-2.5">
                    <Handshake className="size-6 text-[#6366F1]" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white group-hover:text-amber-300 transition">
                    <AnimatedNumber value={statsData?.totalSuccessfulConnections || 0} />
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition flex items-center justify-center gap-1">
                    <span>Kết nối &amp; MOU</span>
                    <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </div>
                </Link>

                {/* Thẻ 4: Quy Mô Giao Dịch & Ngân Sách */}
                <Link
                  href="/portal/opportunities/pipeline"
                  title="Quy mô giao dịch và ngân sách kết nối"
                  aria-label="Quy mô giao dịch & Ngân sách"
                  className="group flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/15 dark:border-white/10 text-center transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5 shadow-lg"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-2.5">
                    <LineChart className="size-6 text-[#F59E0B]" />
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-white group-hover:text-brand-200 transition whitespace-nowrap">
                    {(() => {
                      const val = statsData?.totalEstimatedValueMillionVnd;
                      if (!val || val === 0) return "0 VNĐ";
                      if (val >= 1000) {
                        return `${(val / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} Tỷ VNĐ`;
                      }
                      return `${val.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} Triệu VNĐ`;
                    })()}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition flex items-center justify-center gap-1">
                    <span>Quy mô giao dịch</span>
                    <ArrowRight className="size-3 opacity-50 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </div>
            </Async>
          </div>
        </div>
      </section>

      <main>
        {/* ========================================================================= */}
        {/* 3. LƯỚI THẺ LISTING CÔNG NGHỆ & NHU CẦU NỔI BẬT (T-01.33)                */}
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
                  Cập nhật liên tục từ mạng lưới viện, trường, doanh nghiệp và 63 Sở KH&amp;CN trên toàn quốc.
                </p>
              </div>

              {/* Bộ chuyển đổi Tab Cung - Cầu */}
              <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setListingType("offers")}
                  className={`btn-press rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
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
                  className={`btn-press rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
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
        {/* 4. QUY TRÌNH KẾT NỐI 4 BƯỚC TRỰC QUAN ĐMST (T-01.34)                      */}
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
                Minh bạch, bảo mật và được bảo trợ pháp lý bởi Viện Ứng dụng Công nghệ cùng mạng lưới 63 Sở KH&amp;CN.
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
        {/* 5. KHỐI MẠNG LƯỚI ĐỐI TÁC & 63 SỞ KH&CN (T-01.35)                          */}
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
                Liên thông dữ liệu khoa học công nghệ giữa các viện nghiên cứu, trường đại học hàng đầu, 63 Sở KH&amp;CN và cộng đồng doanh nghiệp tiên phong.
              </p>
            </div>

            {/* 3 Trụ cột đối tác */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {PARTNER_PILLARS.map((pillar, idx) => (
                <div
                  key={pillar.category}
                  className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
                        {pillar.category}
                      </h3>
                      <span className="text-xs font-bold text-brand-600 dark:text-cyan-400">
                        0{idx + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                    <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {pillar.partners.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      Đang liên thông dữ liệu thời gian thực
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Widget Trợ lý ảo AI NacenTwin */}
            <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-800 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-2xl"
              />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-300">
                      <Sparkles className="size-4" />
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Trợ Lý Ảo AI NacenTwin (Đổi Mới Sáng Tạo)
                    </h3>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Hỏi đáp tự động về mức độ TRL 1-9 theo Thông tư 17, định giá tham khảo mua bán sáng chế và gợi ý chuyên gia KH&amp;CN tư vấn phù hợp nhất.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTrendingTagClick("Đánh giá TRL theo TT17")}
                      className="text-left px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition border border-white/10 cursor-pointer"
                    >
                      💬 &quot;Công nghệ của tôi đạt mức TRL nào theo chuẩn TT17?&quot;
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTrendingTagClick("Định giá chuyển nhượng sáng chế")}
                      className="text-left px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition border border-white/10 cursor-pointer"
                    >
                      💬 &quot;Định giá tham khảo chuyển nhượng sáng chế?&quot;
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTrendingTagClick("Chuyên gia AI")}
                      className="text-left px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition border border-white/10 cursor-pointer"
                    >
                      💬 &quot;Tìm chuyên gia AI thị giác máy tính tại Hà Nội?&quot;
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <Link
                    href="/portal"
                    className="btn-press w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition shadow-md"
                  >
                    <span>Mở Trợ Lý AI</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. HỆ THỐNG ĐÁNH GIÁ NĂNG LỰC & KHẢO SÁT TT17, TNI (BẢO TOÀN TÍNH NĂNG)    */}
        {/* ========================================================================= */}
        <section className="bg-white py-10 sm:py-16 lg:py-20 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>CÔNG CỤ ĐO LƯỜNG &amp; THẨM ĐỊNH QUỐC GIA</span>
              </div>
              <h2 className="mt-3.5 type-section-title text-text-primary dark:text-white">
                Khảo Sát Nhu Cầu &amp; Đánh Giá Năng Lực Công Nghệ
              </h2>
              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-text-secondary dark:text-slate-300">
                Hệ thống công cụ đo lường và định vị chuẩn hóa theo quy chuẩn Bộ Khoa học &amp; Công nghệ.
              </p>
            </div>

            <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Khảo Sát Nhu Cầu TNI */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-amber-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl dark:border-amber-900/40 dark:bg-slate-900">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Flame className="size-3 text-amber-600" />
                      Chỉ số TNI
                    </span>
                    <span className="text-xs font-bold text-amber-600/70 dark:text-amber-400/60">01</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
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
                    Bắt mạch nhu cầu doanh nghiệp, tự động tính toán chỉ số nhu cầu công nghệ và kết nối nguồn cung chuyển giao.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/khao-sat-nhu-cau"
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 shadow-xs"
                  >
                    <span>Làm Khảo Sát TNI Ngay</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>

              {/* Card 2: Đánh Giá Năng Lực TT17 */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-brand-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-xl dark:border-brand-900/40 dark:bg-slate-900">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      <FileCheck2 className="size-3 text-brand-700" />
                      Thông tư 17/2019
                    </span>
                    <span className="text-xs font-bold text-brand-600/70 dark:text-brand-400/60">02</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300">
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
                    Đánh giá trình độ và năng lực công nghệ doanh nghiệp theo Thông tư 17/2019/TT-BKHCN.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/assessments/tt17/wizard"
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800 shadow-xs"
                  >
                    <span>Tự Đánh Giá TT17 Ngay</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>

              {/* Card 3: Khảo sát Đổi mới sáng tạo 43 câu */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-teal-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl dark:border-teal-900/40 dark:bg-slate-900">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      <Sparkles className="size-3 text-teal-600" />
                      43 Tiêu Chuẩn ĐMST
                    </span>
                    <span className="text-xs font-bold text-teal-600/70 dark:text-teal-400/60">03</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">
                      <ClipboardCheck className="size-5 sm:size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-teal-600 transition">
                        Khảo Sát ĐMST (43 Câu)
                      </h3>
                      <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">8 Nhóm Năng Lực</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-text-secondary dark:text-slate-300">
                    Tự động chấm điểm 8 nhóm năng lực, tính toán chỉ số TNI tức thời và xuất hồ sơ Radar Chart.
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/khao-sat-dmst"
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 shadow-xs"
                  >
                    <span>Làm Khảo Sát ĐMST Ngay</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>

              {/* Card 4: Thang đo Mức độ Sẵn sàng Công nghệ TRL 1-9 */}
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-white p-4 sm:p-6 shadow-xs transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl dark:border-emerald-900/40 dark:bg-slate-900">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Rocket className="size-3 text-emerald-600" />
                      Thang Đo TRL 1–9
                    </span>
                    <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/60">04</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
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
                    Chuẩn hóa 9 cấp độ hoàn thiện công nghệ từ phòng lab (TRL 1-3), thử nghiệm (TRL 4-6) đến thương mại hóa (TRL 7-9).
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
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

        {/* ========================================================================= */}
        {/* 7. VÌ SAO CHỌN NACENTWIN                                                  */}
        {/* ========================================================================= */}
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
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 transition hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
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

        {/* ========================================================================= */}
        {/* 8. GLOBAL ECOSYSTEM CTA Ở ĐÁY TRANG (T-01.35)                             */}
        {/* ========================================================================= */}
        <section className="page-container pb-12 sm:pb-16">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 px-6 py-12 sm:px-12 sm:py-16 text-center text-white shadow-2xl border border-brand-700">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
            />
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-cyan-300 border border-white/20 mb-4">
                <Rocket className="size-3.5 text-cyan-400" />
                Tham Gia Mạng Lưới Quốc Gia
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-sans tracking-tight">
                Gia Nhập Hệ Sinh Thái Đổi Mới Sáng Tạo &amp; Chuyển Giao Công Nghệ Quốc Gia
              </h2>
              <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-300 leading-relaxed">
                Kết nối hơn 10.000 doanh nghiệp, nhà khoa học và viện nghiên cứu trên toàn quốc để hiện thực hóa các giải pháp công nghệ và thúc đẩy chuyển đổi số bền vững.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
                <Link
                  href="/chao-ban-cong-nghe"
                  className="btn-press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-nacen-green-500 hover:bg-nacen-green-600 px-6 py-3 text-sm font-bold text-white transition shadow-lg hover:shadow-emerald-900/40"
                >
                  <span>Đăng Ký Chào Bán Công Nghệ</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/nhu-cau-cong-nghe"
                  className="btn-press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white hover:bg-white/95 px-6 py-3 text-sm font-bold text-brand-900 transition shadow-lg"
                >
                  <span>Công Bố Nhu Cầu ĐMST</span>
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
