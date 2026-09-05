import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { Quote, ArrowUpRight, TrendingUp, X } from 'lucide-react';
import { useSuccessStories } from '@/core/hooks/useSuccessStories';
import { Story, StorySource } from '@/core/api/stories';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

const STORIES_SOURCE = (import.meta.env.VITE_STORIES_SOURCE as StorySource) ?? 'all';

// Extract plain text from HTML or markdown content for card preview
function extractPlainText(content: string): string {
  let text = content.replace(/!\[.*?\]\(.*?\)/g, '');
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/^#+\s+/gm, '');
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Strip embedded HTML tags so MDXEditor receives clean markdown
function htmlToMarkdown(content: string): string {
  return content
    .replace(/<img[^>]+src="([^"]*)"[^>]*>/gi, '![]($1)')
    .replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * B-22: `story.author` có thể là `null` — máy chủ trả vậy khi tra danh bạ người dùng trượt. Hai chỗ trước đây
 * đọc thẳng `story.author.firstName`; với `strict: false` trong `tsconfig.json`, trình biên dịch không bao giờ
 * cảnh báo, nên lỗi chỉ lộ ra lúc chạy — và lộ ra bằng cách làm trắng cả trang công khai.
 */
function authorDisplayName(story: Story): string {
  const author = story.author;
  if (!author) return '—';
  const fullName = [author.firstName, author.lastName].filter(Boolean).join(' ');
  return fullName || author.organization || '—';
}

function StoryModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const displayName = authorDisplayName(story);
  const markdownContent = htmlToMarkdown(story.content);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-4 border-b border-border">
          <div className="flex-1 pr-8">
            <span
              className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${
                story.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
              }`}
            >
              {story.type === 'success' ? 'Thành công' : 'Thất bại'}
            </span>
            <h2 className="text-2xl font-bold text-foreground">{story.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{displayName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          <MDXEditor
            key={story.id}
            markdown={markdownContent}
            readOnly
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              imagePlugin({
                imageUploadHandler: async () => Promise.resolve(''),
              }),
              tablePlugin(),
            ]}
          />

          {story.lesson && (
            <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-primary">Bài học</p>
              </div>
              <p className="text-sm text-foreground font-medium">{story.lesson}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StoryCard({ story, index }: { story: Story; index: number }) {
  const [showModal, setShowModal] = useState(false);
  const displayName = authorDisplayName(story);
  const plainContent = extractPlainText(story.content);

  return (
    <>
      <motion.div
        key={story.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group flex flex-col p-8 rounded-3xl bg-white border border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-500 min-h-[340px]"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Quote className="w-6 h-6 fill-primary" />
            </div>
            <span
              className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                story.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
              }`}
            >
              {story.type === 'success' ? 'Thành công' : 'Thất bại'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {story.title}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">{displayName}</p>
        </div>

        <div className="flex-grow flex flex-col justify-between gap-4">
          <p className="text-sm text-foreground leading-relaxed line-clamp-6">{plainContent}</p>

          {story.lesson && (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-primary">Bài học</p>
              </div>
              <p className="text-sm text-foreground font-medium line-clamp-2">{story.lesson}</p>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="self-start text-xs font-bold text-primary hover:text-primary/70 underline underline-offset-4 decoration-1 transition-colors mt-1"
          >
            Xem chi tiết →
          </button>
        </div>
      </motion.div>

      {showModal && <StoryModal story={story} onClose={() => setShowModal(false)} />}
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col p-8 rounded-3xl bg-white border border-border animate-pulse min-h-[340px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-6 w-3/4 rounded bg-muted mb-2" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </div>
      <div className="space-y-3 flex-grow">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/6 rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="mt-4 p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function SuccessStoriesSection() {
  const { t } = useLanguage();
  const { stories, loading, error } = useSuccessStories(STORIES_SOURCE);

  if (!loading && (error || stories.length === 0)) return null;

  return (
    <section id="successStories" className="py-24 bg-muted/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-black uppercase tracking-wider"
            >
              {t.success.badge}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              {t.success.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl"
            >
              {t.success.subtitle}
            </motion.p>
          </div>

          {!loading && stories.length > 0 && (
            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              href="#"
              className="group flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-all underline underline-offset-8 decoration-2"
            >
              {t.success.more}
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {stories.map((story, i) => (
              <ErrorBoundary key={story.id} label={`story ${story.id}`}>
                <StoryCard story={story} index={i} />
              </ErrorBoundary>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
