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
  ClipboardCheck,
  Clock,
  Cpu,
  FileDown,
  FileSearch,
  FileSignature,
  GraduationCap,
  Handshake,
  HeartHandshake,
  LineChart,
  MapPin,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
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
  title: string;
  field: string;
  owner: string;
  location: string;
  trl: string;
  image: string;
  type: "offers" | "demands";
};

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
          <span className="absolute left-4 top-4 inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            {item.field}
          </span>
        </Link>
        <div className="p-6">
          <Link href={detailHref}>
            <h3 className="text-card-title font-bold text-text-primary hover:text-brand-700 dark:text-white dark:hover:text-cyan-400 line-clamp-2 transition">
              {item.title}
            </h3>
          </Link>
          <p className="mt-3 text-sm text-text-secondary dark:text-slate-300 line-clamp-1">{item.owner}</p>
        </div>
      </div>
      <div className="px-6 pb-6 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-text-secondary dark:text-slate-400">
          <div className="flex items-center gap-3">
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
      fetchPublicOffers()
        .then((res) => {
          if (!cancelled) {
            const mapped: Listing[] = (res.data || []).map((o) => ({
              id: o.id,
              title: o.title,
              field: o.sectorName || "Khoa học & Công nghệ",
              owner: o.developerOrigin || "Chủ sở hữu công nghệ",
              location: o.managingAuthorityName || "Toàn quốc",
              trl: o.trlLevel ? `TRL ${o.trlLevel}` : "Đang hoàn thiện",
              image: getTechnologyImage(o.sectorCode, o.title),
              type: "offers",
            }));
            setOffers(mapped);
          }
        })
        .catch(() => {
          if (!cancelled) setOffers([]);
        }),

      portalClient
        .getPublicDemands()
        .then((list) => {
          if (!cancelled && Array.isArray(list)) {
            const mapped: Listing[] = list.map((d: any) => ({
              id: d.id,
              title: d.technicalProblem || d.stageName || "Bài toán công nghệ",
              field: d.sectorCode || "Nhu cầu ĐMST",
              owner: d.province || "Doanh nghiệp",
              location: d.province || "Toàn quốc",
              trl: d.budgetRange ? `Ngân sách: ${d.budgetRange}` : "Thương lượng",
              image: getTechnologyImage(d.sectorCode, d.technicalProblem || d.stageName),
              type: "demands",
            }));
            setDemands(mapped);
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
    if (q) {
      router.push(`/chao-ban-cong-nghe?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/chao-ban-cong-nghe");
    }
  };

  const handleKeywordClick = (kw: string) => {
    setQuery(kw);
    router.push(`/chao-ban-cong-nghe?q=${encodeURIComponent(kw)}`);
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
      <section className="relative overflow-hidden bg-brand-700 px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20 [@media(min-height:850px)]:lg:py-24 [@media(max-height:780px)]:py-9 [@media(max-height:780px)]:sm:py-11">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
              Sàn giao dịch công nghệ Quốc gia
            </span>
            <h1 className="mt-6 type-hero">
              Kết nối cung – cầu công nghệ, <br className="hidden sm:block" />
              thúc đẩy đổi mới sáng tạo
            </h1>
            <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-body sm:text-body-lg text-white/80">
              Nền tảng do Viện Đổi Mới Sáng Tạo Quốc Gia vận hành, giúp doanh nghiệp, nhà khoa học và nhà đầu tư tìm kiếm,
              chuyển giao và ứng dụng công nghệ một cách nhanh chóng, minh bạch.
            </p>

            <form className="mx-auto mt-6 sm:mt-8 flex max-w-xl flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm công nghệ, lĩnh vực, đơn vị chuyển giao..."
                  className="focus-ring h-12 w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-base text-text-primary shadow-lg placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="focus-ring h-12 rounded-xl bg-nacen-green-500 px-6 text-sm font-bold text-white transition hover:bg-nacen-green-600 shadow-md cursor-pointer"
              >
                Tìm kiếm
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
              <span className="text-white/60">Gợi ý tìm kiếm:</span>
              {["AI thị giác máy", "Năng lượng xanh", "Tự động hóa", "Vật liệu Nano"].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleKeywordClick(kw)}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-white/90 hover:bg-white/20 transition backdrop-blur-sm cursor-pointer"
                >
                  {kw}
                </button>
              ))}
              <span className="hidden sm:inline text-white/30">|</span>
              <Link
                href="/trien-lam"
                className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 transition ml-1"
              >
                <Sparkles className="size-3.5" /> Sàn Sự Kiện Techmart &rarr;
              </Link>
              <span className="hidden sm:inline text-white/30">|</span>
              <Link
                href="/huong-dan"
                className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-emerald-200 transition ml-1"
              >
                <BookOpen className="size-3.5" /> Hướng dẫn cho người mới &rarr;
              </Link>
            </div>
          </div>

          {/* REALTIME METRICS STRIP (Khối Thống kê thời gian thực có chuẩn 5 UX States) */}
          <div className="mx-auto mt-10 sm:mt-12 [@media(min-height:850px)]:mt-14 max-w-4xl">
            <Async
              state={statsState}
              loadingSkeleton={
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center bg-white/10 rounded-xl p-4">
                      <div className="h-8 w-24 bg-white/20 rounded mx-auto mb-2" />
                      <div className="h-4 w-32 bg-white/20 rounded mx-auto" />
                    </div>
                  ))}
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
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Link
                  href="/chao-ban-cong-nghe"
                  className="group block text-center rounded-xl bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-md"
                >
                  <dd className="text-3xl font-bold sm:text-4xl text-white group-hover:text-cyan-300 transition">
                    {statsData?.totalOffers !== undefined ? statsData.totalOffers.toLocaleString("vi-VN") : "0"}
                  </dd>
                  <dt className="mt-1.5 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition">
                    Công nghệ chào bán &rarr;
                  </dt>
                </Link>

                <Link
                  href="/nhu-cau-cong-nghe"
                  className="group block text-center rounded-xl bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-md"
                >
                  <dd className="text-3xl font-bold sm:text-4xl text-white group-hover:text-emerald-300 transition">
                    {statsData?.totalDemands !== undefined ? statsData.totalDemands.toLocaleString("vi-VN") : "0"}
                  </dd>
                  <dt className="mt-1.5 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition">
                    Nhu cầu đặt hàng &rarr;
                  </dt>
                </Link>

                <Link
                  href="/matrix"
                  className="group block text-center rounded-xl bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-md"
                >
                  <dd className="text-3xl font-bold sm:text-4xl text-white group-hover:text-amber-300 transition">
                    {statsData?.totalProvinces ?? 63}
                  </dd>
                  <dt className="mt-1.5 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition">
                    Tỉnh, thành kết nối &rarr;
                  </dt>
                </Link>

                <Link
                  href="/enterprises"
                  className="group block text-center rounded-xl bg-white/5 p-3.5 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-md"
                >
                  <dd className="text-3xl font-bold sm:text-4xl text-white group-hover:text-brand-200 transition">
                    {statsData?.totalEnterprises !== undefined
                      ? statsData.totalEnterprises.toLocaleString("vi-VN")
                      : "0"}
                  </dd>
                  <dt className="mt-1.5 text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition">
                    Doanh nghiệp tham gia &rarr;
                  </dt>
                </Link>
              </dl>
            </Async>
          </div>
        </div>
      </section>

      <main>
        {/* DÀNH CHO NGƯỜI DÙNG MỚI: HƯỚNG DẪN BẮT ĐẦU */}
        <section className="bg-gradient-to-b from-brand-50/60 via-slate-50/40 to-white py-12 sm:py-16 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 border-b border-border-default/60 dark:border-slate-800">
          <div className="page-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-nacen-green-50 px-3 py-1 text-xs font-bold text-nacen-green-700 border border-nacen-green-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <BookOpen className="size-3.5" />
                Dành Cho Người Dùng Mới
              </span>
              <h2 className="mt-3.5 type-section-title text-text-primary dark:text-white">
                Khám Phá Hệ Thống Theo Vai Trò Của Bạn
              </h2>
              <p className="mt-3 text-base text-text-secondary dark:text-slate-300">
                Hệ sinh thái NacenTwin được thiết kế chuyên biệt cho từng tác nhân. Chọn vai trò của bạn để xem quy trình và màn hình hướng dẫn tương ứng:
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Bên Mua */}
              <div className="group flex flex-col justify-between rounded-2xl border border-border-default bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
                    <Building2 className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-text-primary dark:text-white">
                    Bên Mua (Buyer)
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Doanh nghiệp khảo sát nhu cầu ĐMST 7 phần, đăng bài toán kỹ thuật, nhận gợi ý AI matching và đàm phán hợp đồng chuyển giao.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=BUYER"
                  className="focus-ring mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 dark:text-cyan-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Bên Mua</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Card 2: Bên Bán */}
              <div className="group flex flex-col justify-between rounded-2xl border border-border-default bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                    <Rocket className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-text-primary dark:text-white">
                    Bên Bán (Seller)
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Viện nghiên cứu, trường ĐH &amp; doanh nghiệp tạo hồ sơ chào bán công nghệ, thẩm định TRL 1-9 &amp; tình trạng sở hữu trí tuệ.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=SELLER"
                  className="focus-ring mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Bên Bán</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Card 3: Chuyên Gia */}
              <div className="group flex flex-col justify-between rounded-2xl border border-border-default bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-innovation-50 text-innovation-600 dark:bg-cyan-950/70 dark:text-cyan-300">
                    <GraduationCap className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-text-primary dark:text-white">
                    Chuyên Gia KH&amp;CN
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Nhà khoa học đăng ký nâng hạng, quét tự động CV bằng AI Parser, tham gia thẩm định năng lực TT17 và tư vấn kỹ thuật.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=EXPERT"
                  className="focus-ring mt-5 inline-flex items-center gap-1 text-xs font-bold text-innovation-600 hover:text-innovation-700 dark:text-cyan-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Chuyên Gia</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Card 4: Sở KH&CN */}
              <div className="group flex flex-col justify-between rounded-2xl border border-border-default bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-text-primary dark:text-white">
                    Cán Bộ Sở KH&amp;CN
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary dark:text-slate-300">
                    Cổng công vụ cấp tỉnh: phê duyệt công nghệ chào bán, quản lý danh bạ 304 DN ĐMST và tổ chức gian hàng Techmart.
                  </p>
                </div>
                <Link
                  href="/huong-dan#role=GOV"
                  className="focus-ring mt-5 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Xem hướng dẫn Sở KH&amp;CN</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* [TASK-01-CR19] Đã gỡ bỏ Banner Cẩm Nang Hướng Dẫn Chi Tiết khỏi Trang Chủ theo yêu cầu PO */}
          </div>
        </section>

        {/* VÌ SAO CHỌN NACENTWIN */}
        <section className="page-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="type-section-title text-text-primary dark:text-white">Vì sao chọn NacenTwin</h2>
            <p className="mt-3 text-base leading-7 text-text-secondary dark:text-slate-300">
              Nền tảng được xây dựng và vận hành bởi Viện Đổi Mới Sáng Tạo Quốc Gia, đảm bảo độ tin cậy cho mọi giao dịch.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([Icon, title, description]) => (
              <article
                key={title}
                className="rounded-xl border border-border-default bg-white p-6 transition hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-card-title font-bold text-text-primary dark:text-white">{title}</h3>
                <p className="mt-4 text-body text-text-secondary dark:text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CÔNG NGHỆ & NHU CẦU NỔI BẬT */}
        <section className="bg-surface-subtle py-16 dark:bg-slate-950/50 sm:py-20">
          <div className="page-container">
            <div>
              <h2 className="type-section-title text-text-primary dark:text-white">Công nghệ &amp; nhu cầu nổi bật</h2>
              <p className="mt-3 text-base text-text-secondary dark:text-slate-300">
                Cập nhật liên tục từ mạng lưới viện, trường, doanh nghiệp trên toàn quốc.
              </p>
            </div>
            <div className="mt-8 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setListingType("offers")}
                className={`focus-ring rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  listingType === "offers"
                    ? "bg-white text-brand-700 shadow-sm dark:bg-brand-950 dark:text-brand-200"
                    : "text-text-secondary hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                }`}
              >
                Chào bán công nghệ
              </button>
              <button
                type="button"
                onClick={() => setListingType("demands")}
                className={`focus-ring rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  listingType === "demands"
                    ? "bg-white text-brand-700 shadow-sm dark:bg-brand-950 dark:text-brand-200"
                    : "text-text-secondary hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                }`}
              >
                Nhu cầu đặt hàng
              </button>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {listings.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  <Cpu className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    Chưa có {listingType === "offers" ? "công nghệ chào bán" : "nhu cầu đặt hàng"} nào được công bố.
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Dữ liệu sẽ được cập nhật ngay khi hoàn tất thẩm định.
                  </p>
                </div>
              ) : (
                listings.map((item) => <ListingCard key={item.title} item={item} />)
              )}
            </div>
            <div className="mt-10 flex justify-center">
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
        <section className="page-container py-16 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Widget AI */}
            <section className="rounded-2xl bg-brand-700 p-6 text-white lg:col-span-5">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-white/10 text-innovation-50">
                  <Bot className="size-6" />
                </div>
                <h2 className="text-xl font-bold">Trợ Lý Ảo AI Nacentwin</h2>
              </div>
              <p className="mt-5 text-body sm:text-body-lg text-brand-100">
                Hỏi đáp tự động về mức độ TRL 1-9, định giá tham khảo mua/bán công nghệ và gợi ý chuyên gia tư vấn phù hợp nhất.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  "Công nghệ của tôi đạt mức TRL nào theo TT17?",
                  "Đề xuất định giá chuyển nhượng sáng chế Nano?",
                  "Tìm chuyên gia AI thị giác máy tính tại Hà Nội?",
                ].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleOpenAi(item)}
                    className="focus-ring w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left text-sm text-white transition hover:bg-white/20 hover:border-white/30"
                  >
                    💬 &ldquo;{item}&rdquo;
                  </button>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5">
                <span className="text-sm font-bold text-innovation-50">Tích hợp AI-to-Text OCR</span>
                <button
                  type="button"
                  onClick={() => handleOpenAi()}
                  className="focus-ring rounded-xl bg-nacen-green-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-nacen-green-600"
                >
                  Mở Trợ Lý AI
                </button>
              </div>
            </section>

            {/* Widget Lĩnh vực */}
            <section className="surface-card p-6 lg:col-span-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary dark:text-white">
                  {sectorsLoading || sectorsError ? "Lĩnh Vực Trọng Điểm" : `${sectors.length} Lĩnh Vực Trọng Điểm`}
                </h2>
                <Link
                  href="/matrix"
                  className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-200"
                >
                  Ma trận ngành &rarr;
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {sectorsLoading ? (
                  <p role="status" className="col-span-2 text-body">
                    Đang tải lĩnh vực...
                  </p>
                ) : sectorsError ? (
                  <div className="col-span-2">
                    <p role="alert" className="text-body text-status-danger">
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
                  <p className="col-span-2 text-body">Chưa có lĩnh vực đang hoạt động.</p>
                ) : (
                  sectors.map((sector) => (
                    <Link
                      href={`/experts?sector=${encodeURIComponent(sector.code)}`}
                      key={sector.code}
                      className="focus-ring flex items-center gap-2 rounded-xl bg-surface-page p-3 text-left text-sm font-medium text-slate-800 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-brand-950 dark:hover:text-brand-200"
                    >
                      <Cpu className="size-4 shrink-0 text-brand-700" />
                      <span className="truncate">{sector.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* Widget Dịch Vụ Viện */}
            <section className="surface-card p-6 lg:col-span-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-brand-700 dark:text-brand-200" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary dark:text-white">
                    Dịch Vụ Viện NacenTech
                  </h2>
                </div>
                <ul className="mt-6 space-y-4 text-body text-slate-600 dark:text-slate-300">
                  {[
                    "Cấp chứng nhận thang đo TRL 1-9 chính thức",
                    "Thẩm định giá trị tài sản trí tuệ & sáng chế",
                    "Tư vấn đăng ký Doanh nghiệp KH&CN",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-nacen-green-700 dark:text-nacen-green-200" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/khao-sat-nhu-cau"
                className="focus-ring mt-7 block w-full rounded-xl bg-nacen-green-500 py-3 text-center text-sm font-bold text-white transition hover:bg-nacen-green-600"
              >
                Đăng Ký Tư Vấn Thẩm Định
              </Link>
            </section>
          </div>
        </section>

        {/* QUY TRÌNH 6 BƯỚC */}
        <section className="page-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="type-section-title text-text-primary dark:text-white">Quy trình 6 bước</h2>
            <p className="mt-3 text-base text-text-secondary dark:text-slate-300">
              Minh bạch, rõ ràng từ lúc đăng tải đến khi công nghệ được ứng dụng thực tế.
            </p>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {processes.map(([Icon, title, description], index) => (
              <li
                key={title}
                className="rounded-xl border border-border-default bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <Icon className="size-6 text-nacen-green-700 dark:text-nacen-green-200" />
                </div>
                <h3 className="mt-5 text-card-title font-bold text-text-primary dark:text-white">{title}</h3>
                <p className="mt-3 text-body text-text-secondary dark:text-slate-300">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA BOTTOM BANNER */}
        <section className="page-container pb-16">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-nacen-green-500 to-nacen-green-700 px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <h2 className="type-section-title">Sẵn sàng đưa công nghệ của bạn đến gần hơn với thị trường?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-body text-nacen-green-50 sm:text-base">
              Tham gia mạng lưới hơn 10.000 doanh nghiệp, viện nghiên cứu và nhà đầu tư trên toàn quốc ngay hôm nay.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-nacen-green-700 transition hover:bg-nacen-green-50"
              >
                Đăng ký miễn phí <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dich-vu-khac"
                className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-white/35 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
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
