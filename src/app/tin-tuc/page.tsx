"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  Sparkles,
  Newspaper,
  Tag,
  Clock,
  ExternalLink,
  Building2,
  Users,
  Award,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  BACLINK_NEWS_ARTICLES,
  NEWS_CATEGORIES,
  getFeaturedNews,
  NewsArticle,
} from "@/lib/news-data";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const featuredArticle = useMemo(() => getFeaturedNews(), []);

  const filteredArticles = useMemo(() => {
    return BACLINK_NEWS_ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" || article.categorySlug === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case "ban-dan":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
      case "hop-tac-quoc-te":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
      case "hoat-dong":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800";
      case "chuoi-cung-ung":
        return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800";
      case "chuyen-doi-xanh":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header Banner - Deep Royal Blue */}
      <section className="relative overflow-hidden workspace-banner text-white pt-10 pb-14 border-b border-white/10 shadow-lg">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-white/70 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5 text-white/40" />
            <span className="text-amber-400 font-semibold">Tin tức & Hoạt động BACLINK</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-amber-300 border border-white/15 backdrop-blur-xs">
                <Sparkles className="size-3.5" />
                <span>Trang Thông Tin Chính Thức • Hiệp Hội BACLINK</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Tin Tức & Sự Kiện Hiệp Hội
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                Cập nhật các hoạt động xúc tiến đầu tư, hợp tác bán dẫn quốc tế, kết nối chuỗi cung ứng FDI và thông cáo chính thức từ Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh.
              </p>
            </div>

            {/* Link to Facebook Fanpage */}
            <div className="shrink-0">
              <a
                href="https://www.facebook.com/HHBaclink/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition shadow-xs backdrop-blur-xs group"
              >
                <span>Xem trên Fanpage BACLINK</span>
                <ExternalLink className="size-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Statistics Strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/15">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-amber-400">605+</div>
              <div className="text-xs text-white/70">Doanh nghiệp theo dõi</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-cyan-300">28</div>
              <div className="text-xs text-white/70">Ủy viên Ban Chấp Hành</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-white">40+</div>
              <div className="text-xs text-white/70">Nhà máy phụ trợ hạt nhân</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">1652</div>
              <div className="text-xs text-white/70">QĐ Thành Lập UBND Tỉnh</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Search & Category Filter */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tin tức, sự kiện, bán dẫn, đối tác quốc tế, địa điểm..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#053567] dark:focus:ring-cyan-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Results Counter */}
            <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium self-center">
              Hiển thị <strong className="text-slate-900 dark:text-white font-bold">{filteredArticles.length}</strong> bài viết
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">
            <Filter className="size-3.5 text-slate-400 mr-1 shrink-0" />
            {NEWS_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-[#053567] text-white shadow-xs dark:bg-cyan-600 dark:text-white"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Article Card (if no search or if matching) */}
        {!searchQuery && selectedCategory === "all" && featuredArticle && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-lg transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image Preview */}
              <div className="relative lg:col-span-7 h-64 sm:h-80 lg:h-auto min-h-[320px] overflow-hidden bg-slate-900">
                <Image
                  src={featuredArticle.thumbnail}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500 text-slate-950 shadow-md">
                    <Sparkles className="size-3" />
                    Tin Tiêu Điểm
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-xs border border-white/20">
                    {featuredArticle.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-amber-400" />
                    {featuredArticle.publishedAt}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-cyan-300" />
                    {featuredArticle.location}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{featuredArticle.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-slate-400" /> 5 phút đọc
                    </span>
                  </div>
                  <Link href={`/tin-tuc/${featuredArticle.slug}`}>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#053567] dark:group-hover:text-cyan-400 transition-colors">
                      {featuredArticle.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Key Takeaway snippet */}
                  {featuredArticle.keyTakeaways && featuredArticle.keyTakeaways.length > 0 && (
                    <div className="rounded-xl bg-blue-50/70 dark:bg-slate-800/80 p-3.5 border border-blue-100 dark:border-slate-700">
                      <div className="text-xs font-bold text-[#053567] dark:text-cyan-300 mb-1 flex items-center gap-1.5">
                        <Award className="size-3.5" /> Điểm mấu chốt:
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                        {featuredArticle.keyTakeaways[0]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {featuredArticle.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/tin-tuc/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#053567] hover:bg-[#042447] text-white text-xs sm:text-sm font-bold transition shadow-xs shrink-0 group-hover:gap-2.5"
                  >
                    <span>Đọc chi tiết</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* News Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="size-5 text-[#053567] dark:text-cyan-400" />
              <span>Danh Sách Tin Tức & Hoạt Động</span>
            </h2>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto grid place-items-center text-slate-400">
                <Search className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Không tìm thấy bài viết nào
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Không có tin tức nào phù hợp với từ khóa &quot;{searchQuery}&quot; hoặc chuyên mục đã chọn. Vui lòng thử tìm kiếm khác.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 rounded-xl bg-[#053567] text-white text-xs font-semibold hover:bg-[#042447] transition cursor-pointer"
              >
                Xem tất cả tin tức
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const colorClass = getCategoryColor(article.categorySlug);

                return (
                  <article
                    key={article.id}
                    className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Thumbnail Image */}
                    <Link
                      href={`/tin-tuc/${article.slug}`}
                      className="relative block h-48 sm:h-52 overflow-hidden bg-slate-900 shrink-0"
                    >
                      <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-xs ${colorClass}`}
                        >
                          {article.category}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-amber-400" />
                          {article.publishedAt}
                        </span>
                        <span className="flex items-center gap-1 max-w-[50%] truncate">
                          <MapPin className="size-3 text-cyan-300 shrink-0" />
                          <span className="truncate">{article.location}</span>
                        </span>
                      </div>
                    </Link>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <Link href={`/tin-tuc/${article.slug}`} className="block">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#053567] dark:group-hover:text-cyan-400 transition-colors">
                            {article.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Building2 className="size-3 text-slate-400" />
                          <span>BACLINK</span>
                        </div>

                        <Link
                          href={`/tin-tuc/${article.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#053567] dark:text-cyan-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group/link"
                        >
                          <span>Đọc chi tiết</span>
                          <ArrowRight className="size-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Official Banner / Call to Action */}
        <section className="rounded-3xl bg-gradient-to-r from-[#052b54] to-[#0a4682] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,#BE9C56_0,transparent_70%)] opacity-20 pointer-events-none" />
          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkles className="size-3.5" />
              <span>Gia Nhập Cộng Đồng Doanh Nghiệp Kinh Bắc</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
              Đồng Hành Cùng Mạng Lưới Sản Xuất Công Nghiệp BACLINK
            </h3>
            <p className="text-sm text-white/85 leading-relaxed">
              Các nhà máy, doanh nghiệp phụ trợ, đơn vị cơ khí chính xác và công nghệ cao có nhu cầu tham gia chuỗi cung ứng FDI vui lòng liên hệ Ban Xúc tiến Hiệp hội để được tư vấn tiêu chuẩn và hỗ trợ kết nối.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition shadow-md"
              >
                Đăng ký Hội viên BACLINK
              </Link>
              <a
                href="https://www.facebook.com/HHBaclink/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition"
              >
                Gửi tin nhắn qua Facebook
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
