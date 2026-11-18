"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/components/common/toast";
import {
  Share2,
  Layers,
  Compass,
  Newspaper,
  Rocket,
  Target,
  Building2,
  Briefcase,
  Home,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface SitemapLink {
  title: string;
  href: string;
  description: string;
  roleBadge: string;
}

interface SitemapSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  links: SitemapLink[];
}

const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    id: "home-overview",
    title: "1. Trang Chủ & Định Hướng Hệ Sinh Thái",
    subtitle: "Cổng thông tin trung tâm kết nối chuỗi cung ứng công nghiệp tỉnh Bắc Ninh",
    icon: Home,
    accentClass: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/70 dark:text-cyan-300 dark:border-brand-800",
    links: [
      {
        title: "Trang chủ Cổng thông tin BACLINK",
        href: "/",
        description: "Tìm kiếm đa danh mục, thống kê thời gian thực, tin tiêu điểm và quy trình kết nối 4 bước.",
        roleBadge: "Công khai",
      },
      {
        title: "Ma trận 8 Ngành Công nghiệp & Địa bàn KCN Bắc Ninh",
        href: "/matrix",
        description: "Tra cứu 8 ngành công nghiệp chủ lực (IND_*), trọng số ghép nối và 13+ KCN trọng điểm Bắc Ninh.",
        roleBadge: "Công khai",
      },
      {
        title: "Sơ đồ Cổng Thông Tin BACLINK (Sitemap)",
        href: "/wireframes",
        description: "Bản đồ điều hướng tổng thể toàn bộ phân hệ chức năng của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh.",
        roleBadge: "Công khai",
      },
    ],
  },
  {
    id: "about-guide",
    title: "2. Giới Thiệu Hiệp Hội & Cẩm Nang Hướng Dẫn",
    subtitle: "Thông tin pháp lý Quyết định 1652/QĐ-UBND, dịch vụ hỗ trợ hội viên và tài liệu hướng dẫn",
    icon: Compass,
    accentClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
    links: [
      {
        title: "Về Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)",
        href: "/gioi-thieu",
        description: "Tôn chỉ hoạt động, cơ cấu Ban Chấp hành khóa I (2025–2028) và 3 trụ cột phát triển chuỗi cung ứng.",
        roleBadge: "Công khai",
      },
      {
        title: "Cẩm nang Hướng dẫn Sử dụng Toàn trình",
        href: "/huong-dan",
        description: "Hướng dẫn thao tác chuẩn hóa cho 3 cấp tài khoản: Quản trị Hiệp hội, Doanh nghiệp Hội viên và Thành viên công chúng.",
        roleBadge: "Công khai",
      },
      {
        title: "Dịch vụ Hỗ trợ Hội viên & Tư vấn Kỹ thuật Công nghiệp",
        href: "/dich-vu-khac",
        description: "Bảo hộ SHTT, thẩm định & định giá công nghệ, tư vấn chuẩn hóa chuỗi cung ứng FDI (ISO/IATF/ESG) và hợp đồng chuyển giao.",
        roleBadge: "Công khai",
      },
    ],
  },
  {
    id: "news-events",
    title: "3. Tin Tức & Sự Kiện Xúc Tiến Hiệp Hội",
    subtitle: "Thông cáo chính thức, diễn đàn kết nối FDI và hợp tác công nghiệp bán dẫn quốc tế",
    icon: Newspaper,
    accentClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
    links: [
      {
        title: "Tất cả Tin tức & Hoạt động BACLINK",
        href: "/tin-tuc",
        description: "Tổng hợp tin tức sự kiện, Diễn đàn Go Global Bắc Ninh, Hội Bán dẫn và hoạt động kết nối nhà máy hội viên.",
        roleBadge: "Công khai",
      },
      {
        title: "Chuyên mục Bán dẫn & Công nghệ cao",
        href: "/tin-tuc?category=ban-dan",
        description: "Hoạt động hợp tác cùng Skyworks, Qorvo, KAISA Hàn Quốc và phát triển công nghiệp phụ trợ phòng sạch.",
        roleBadge: "Công khai",
      },
      {
        title: "Chuyên mục Hợp tác Quốc tế & FDI",
        href: "/tin-tuc?category=hop-tac-quoc-te",
        description: "Các chương trình ký kết MOU quốc tế và xúc tiến thương mại chuỗi giá trị toàn cầu.",
        roleBadge: "Công khai",
      },
    ],
  },
  {
    id: "supply-marketplace",
    title: "4. Sản Phẩm, Thiết Bị & Năng Lực Sản Xuất",
    subtitle: "Sàn công bố sản phẩm công nghiệp, dây chuyền tự động hóa và năng lực gia công phụ trợ",
    icon: Rocket,
    accentClass: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800",
    links: [
      {
        title: "Sàn Cung ứng Sản phẩm & Công nghệ",
        href: "/chao-ban-cong-nghe",
        description: "Danh mục máy móc, khuôn mẫu CNC, tự động hóa, phần mềm MES/ERP và giải pháp kỹ thuật TRL 1–9.",
        roleBadge: "Công khai",
      },
      {
        title: "Đăng Hồ sơ Chào bán Sản phẩm / Công nghệ mới",
        href: "/portal/seller/technologies/create",
        description: "Công bố sản phẩm, năng lực gia công và tài liệu kỹ thuật của doanh nghiệp hội viên lên Sàn BACLINK.",
        roleBadge: "Doanh nghiệp Hội viên",
      },
      {
        title: "Dịch vụ Thẩm định & Định giá Công nghệ",
        href: "/dich-vu-khac#dinh-gia-cong-nghe",
        description: "Hội đồng cố vấn kỹ thuật hỗ trợ đánh giá cấp độ sẵn sàng TRL 1–9 và xác định giá trị chuyển giao.",
        roleBadge: "Công khai",
      },
    ],
  },
  {
    id: "demand-marketplace",
    title: "5. Nhu Cầu Mua & Đặt Hàng Chuỗi Cung Ứng",
    subtitle: "Bảng bài toán kỹ thuật, đơn đặt hàng gia công linh kiện từ doanh nghiệp FDI và nội địa",
    icon: Target,
    accentClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
    links: [
      {
        title: "Bảng Nhu cầu Mua & Đặt hàng",
        href: "/nhu-cau-cong-nghe",
        description: "Tra cứu đơn đặt hàng linh kiện, khuôn gá JIG, tự động hóa dây chuyền và chuyển đổi xanh tại Bắc Ninh.",
        roleBadge: "Công khai",
      },
      {
        title: "Quản lý Bài toán Đặt hàng (Bên Mua)",
        href: "/portal/buyer/demands",
        description: "Tạo mới nhu cầu mua sắm, theo dõi hồ sơ chào giải pháp và mời đối tác vào phòng đàm phán.",
        roleBadge: "Doanh nghiệp Hội viên",
      },
      {
        title: "Tư vấn Chuẩn hóa Chuỗi cung ứng FDI (ISO / IATF / ESG)",
        href: "/dich-vu-khac#chuoi-cung-ung-fdi",
        description: "Đồng hành chuẩn hóa hệ thống quản lý chất lượng để đáp ứng tiêu chuẩn vendor cấp 1, cấp 2 của FDI.",
        roleBadge: "Công khai",
      },
    ],
  },
  {
    id: "members-advisors",
    title: "6. Danh Bạ Hội Viên, Ban Cố Vấn & Học Viện E-Learning",
    subtitle: "Mạng lưới nhà máy hội viên Bắc Ninh, chuyên gia cố vấn kỹ thuật và kho học liệu số công nghiệp",
    icon: Building2,
    accentClass: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800",
    links: [
      {
        title: "Danh bạ Doanh nghiệp Hội viên BACLINK",
        href: "/doanh-nghiep-dmst",
        description: "Tra cứu hồ sơ năng lực nhà máy, chứng chỉ chất lượng và thế mạnh gia công của doanh nghiệp hội viên.",
        roleBadge: "Công khai",
      },
      {
        title: "Cơ sở dữ liệu Doanh nghiệp Sản xuất Bắc Ninh",
        href: "/enterprises",
        description: "Tìm kiếm doanh nghiệp theo mã số thuế, ngành công nghiệp IND_* và địa bàn khu công nghiệp.",
        roleBadge: "Công khai",
      },
      {
        title: "Mạng lưới Ban Cố vấn Kỹ thuật BACLINK",
        href: "/experts",
        description: "Kết nối chuyên gia cố vấn tự động hóa, bán dẫn, cơ khí chính xác, Lean/5S, IATF 16949 và ESG.",
        roleBadge: "Công khai",
      },
      {
        title: "Học viện Đào tạo Trực tuyến E-Learning (LMS)",
        href: "/elearning",
        description: "Các khóa đào tạo quản trị sản xuất tinh gọn, kiểm soát chất lượng nhà máy và chuyển đổi số công nghiệp.",
        roleBadge: "Công khai & Hội viên",
      },
    ],
  },
  {
    id: "workspace-admin",
    title: "7. Không Gian Hội Viên & Quản Trị Hiệp Hội",
    subtitle: "Hệ thống tác nghiệp 3 cấp phân quyền (ADMIN – ENTERPRISE – PUBLIC_USER) và ký kết MOU số",
    icon: Briefcase,
    accentClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800",
    links: [
      {
        title: "Đăng nhập & Đăng ký Tài khoản BACLINK",
        href: "/login",
        description: "Xác thực tài khoản 3 cấp an toàn, tuân thủ bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.",
        roleBadge: "Tất cả vai trò",
      },
      {
        title: "Không gian Làm việc Hội viên (Workspace Portal)",
        href: "/portal",
        description: "Bàn làm việc tích hợp chế độ kép Bên Mua ↔ Bên Bán, hồ sơ nhà máy và sổ tay cố vấn kỹ thuật.",
        roleBadge: "Doanh nghiệp & Cố vấn",
      },
      {
        title: "Radar AI Ghép nối Cung - Cầu & Pipeline Cơ hội",
        href: "/portal/matching/radar",
        description: "Thuật toán ghép nối thông minh theo 8 ngành công nghiệp IND_*, quản lý Kanban đàm phán và ký MOU số.",
        roleBadge: "Doanh nghiệp & Cố vấn",
      },
      {
        title: "Trung tâm Quản trị Hiệp hội BACLINK (Admin Console)",
        href: "/admin",
        description: "Phê duyệt hồ sơ 1 cấp tập trung, quản trị thành viên, danh mục ngành công nghiệp và nhật ký kiểm toán.",
        roleBadge: "Quản trị Hiệp hội",
      },
    ],
  },
];

export default function SitemapPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SITEMAP_SECTIONS;

    return SITEMAP_SECTIONS.map((sec) => ({
      ...sec,
      links: sec.links.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.href.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.roleBadge.toLowerCase().includes(q)
      ),
    })).filter((sec) => sec.links.length > 0);
  }, [query]);

  const totalRoutes = useMemo(
    () => SITEMAP_SECTIONS.reduce((sum, sec) => sum + sec.links.length, 0),
    []
  );

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.info(
            `Đã sao chép liên kết Sơ đồ cổng BACLINK: ${shareUrl}`,
            "Sao chép thành công"
          );
        })
        .catch(() => {
          toast.info("Vui lòng sao chép trực tiếp từ thanh địa chỉ trình duyệt.", "Thông báo");
        });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden workspace-banner text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Layers className="size-3.5 text-amber-300" />
              <span>Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)</span>
            </div>
            <h1 className="type-page-title text-white">
              Sơ Đồ Cổng Thông Tin BACLINK (Sitemap)
            </h1>
            <p className="text-white/85 type-body">
              Cấu trúc điều hướng tổng thể gồm 7 nhóm chức năng cốt lõi và {totalRoutes} điểm truy cập chính thức phục vụ kết nối chuỗi cung ứng công nghiệp tỉnh Bắc Ninh.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold text-amber-300 border border-white/15">
                <CheckCircle2 className="size-3.5" /> 7 Nhóm Phân Hệ Chính
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold text-cyan-200 border border-white/15">
                <ShieldCheck className="size-3.5" /> Kiến Trúc 3 Cấp Phân Quyền
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer"
            >
              <Share2 className="size-4" />
              <span>Chia sẻ Sơ đồ cổng</span>
            </button>
            <Link
              href="/huong-dan"
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-brand-800 shadow-sm transition"
            >
              <Compass className="size-4" />
              <span>Xem Cẩm nang Hướng dẫn</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SEARCH & SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh trang chức năng, đường dẫn URL hoặc nhóm vai trò..."
              aria-label="Tìm kiếm trong sơ đồ cổng"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 self-center">
            Hiển thị <strong className="text-slate-900 dark:text-white">{filteredSections.length}</strong> / 7 nhóm chức năng
          </div>
        </div>

        <div className="space-y-6">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`grid size-10 shrink-0 place-items-center rounded-xl border ${section.accentClass}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {section.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {section.links.length} trang
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.links.map((link) => (
                    <Link
                      key={link.href + link.title}
                      href={link.href}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 hover:border-brand-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-slate-900 dark:text-cyan-300 border border-brand-200/70 dark:border-slate-700 truncate">
                            {link.href}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 dark:bg-slate-700 dark:text-slate-200 shrink-0">
                            {link.roleBadge}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-300 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {link.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-end text-xs font-bold text-brand-700 dark:text-cyan-400">
                        <span>Mở trang</span>
                        <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
