"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Clock,
  Sparkles,
  Building2,
  Quote,
  CheckCircle2,
  Tag,
  ExternalLink,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import {
  getNewsBySlug,
  BACLINK_NEWS_ARTICLES,
  NewsArticle,
} from "@/lib/news-data";
import { useToast } from "@/components/common/toast";

export default function NewsDetailPage() {
  const routeParams = useParams();
  const slug = (routeParams?.slug as string) || "";
  const router = useRouter();
  const toast = useToast();

  const [copied, setCopied] = useState(false);

  const article = getNewsBySlug(slug);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Đã sao chép liên kết bài viết vào bộ nhớ tạm!", "Thành công");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-lg border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="size-16 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto grid place-items-center">
            <Newspaper className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Không tìm thấy bài viết
          </h2>
          <p className="text-sm text-slate-500">
            Tin tức hoặc sự kiện bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn khác.
          </p>
          <div className="pt-2">
            <Link
              href="/tin-tuc"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#053567] hover:bg-[#042447] text-white text-xs font-bold transition shadow-xs"
            >
              <ArrowLeft className="size-4" />
              <span>Quay lại trang Tin tức</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Related articles (excluding current)
  const relatedArticles = BACLINK_NEWS_ARTICLES.filter(
    (a) => a.id !== article.id && a.slug !== article.slug
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-16 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            <Link href="/" className="hover:text-[#053567] dark:hover:text-cyan-400 transition shrink-0">
              Trang chủ
            </Link>
            <ChevronRight className="size-3 text-slate-400 shrink-0" />
            <Link href="/tin-tuc" className="hover:text-[#053567] dark:hover:text-cyan-400 transition shrink-0">
              Tin tức
            </Link>
            <ChevronRight className="size-3 text-slate-400 shrink-0" />
            <span className="text-[#053567] dark:text-cyan-300 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {article.title}
            </span>
          </nav>

          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#053567] dark:hover:text-cyan-400 transition shrink-0"
          >
            <ArrowLeft className="size-3.5" />
            <span>Tất cả tin tức</span>
          </Link>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#053567]/10 text-[#053567] dark:bg-cyan-500/10 dark:text-cyan-300 border border-[#053567]/20 dark:border-cyan-500/20">
              {article.category}
            </span>
            {article.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                <Sparkles className="size-3" />
                Tin tiêu điểm
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {article.title}
          </h1>

          {/* Meta details */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 pb-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-y border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-amber-500" />
              <span>{article.publishedAt}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{article.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-indigo-500" />
              <span>{article.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-slate-400" />
              <span>5 phút đọc</span>
            </div>
          </div>
        </header>

        {/* Lead Paragraph */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border-l-4 border-[#053567] dark:border-cyan-400 shadow-xs border-r border-t border-b border-slate-200/80 dark:border-slate-800">
          <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
            &ldquo;{article.leadParagraph}&rdquo;
          </p>
        </div>

        {/* Primary Cover Image */}
        <div className="space-y-2.5">
          <div className="relative h-72 sm:h-96 md:h-[460px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 italic">
            {article.gallery?.[0]?.caption || article.title}
          </p>
        </div>

        {/* Key Takeaways Box (if present) */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 to-slate-50 dark:from-slate-900 dark:to-slate-800/80 p-6 border border-blue-100 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#053567] dark:text-cyan-300">
              <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Nội Dung Trọng Tâm & Kết Quả Đạt Được:</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {article.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="size-1.5 rounded-full bg-[#053567] dark:bg-cyan-400 mt-2 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Content Paragraphs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
          {article.contentParagraphs.map((para, index) => (
            <p key={index} className="leading-relaxed">
              {para}
            </p>
          ))}

          {/* Quote Block (if present) */}
          {article.quote && (
            <div className="my-8 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border-l-4 border-amber-500 dark:border-amber-400 space-y-3">
              <Quote className="size-6 text-amber-500 dark:text-amber-400 opacity-60" />
              <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-snug italic">
                &ldquo;{article.quote.text}&rdquo;
              </p>
              <div className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                — {article.quote.speaker}
                <span className="font-normal text-slate-500 dark:text-slate-400 block sm:inline sm:ml-2">
                  ({article.quote.title})
                </span>
              </div>
            </div>
          )}

          {/* Additional Gallery Photos */}
          {article.gallery && article.gallery.length > 1 && (
            <div className="my-8 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <span>Hình Ảnh Ghi Nhận Tại Hoạt Động</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {article.gallery.slice(1).map((pic, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="relative h-56 rounded-xl overflow-hidden bg-slate-900">
                      <Image
                        src={pic.url}
                        alt={pic.caption}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {pic.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="size-3.5 text-slate-400 shrink-0" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share & Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-xs font-semibold text-blue-700 dark:text-blue-300 transition"
              >
                <ExternalLink className="size-3.5" />
                <span>Xem bài gốc trên Facebook</span>
              </a>
            )}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép link</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-slate-500" />
                  <span>Sao chép link</span>
                </>
              )}
            </button>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.href : "https://baclink.org.vn"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#053567] hover:bg-[#042447] text-white text-xs font-semibold transition"
            >
              <Share2 className="size-3.5" />
              <span>Chia sẻ</span>
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold transition shadow-xs"
          >
            <ArrowLeft className="size-4" />
            <span>Quay lại Danh sách Tin tức</span>
          </Link>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Newspaper className="size-5 text-[#053567] dark:text-cyan-400" />
                <span>Tin Tức Liên Quan Khác</span>
              </h2>
              <Link
                href="/tin-tuc"
                className="text-xs font-bold text-[#053567] dark:text-cyan-400 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/tin-tuc/${rel.slug}`}
                  className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-900">
                    <Image
                      src={rel.thumbnail}
                      alt={rel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        {rel.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                        <Calendar className="size-3 text-amber-500" />
                        {rel.publishedAt}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#053567] dark:group-hover:text-cyan-400 transition-colors">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="pt-2 text-xs font-bold text-[#053567] dark:text-cyan-400 flex items-center gap-1">
                      <span>Đọc tiếp</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
