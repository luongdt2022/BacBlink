import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, FolderKanban, RefreshCw, AlertCircle, FileText, Image as ImageIcon, Download, Paperclip } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { Badge } from '@/shared/components/ui/badge';
import { ViewOnlyMDX } from '@/shared/components/ui/view-only-mdx';
import { getMarketplaceIntakeById, type MarketplaceIntakeDetail } from '@/features/intakes/api/intake';

interface MarketplaceIPDetailPageProps {
  ipId: string;
  onBack: () => void;
  onOpenDealRoom: () => void;
  onNavigate?: (itemId: string) => void;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function MarketplaceIPDetailPage({ ipId, onBack, onNavigate }: MarketplaceIPDetailPageProps) {
  const [intake, setIntake] = useState<MarketplaceIntakeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getMarketplaceIntakeById(ipId)
      .then((data) => {
        if (!cancelled) setIntake(data);
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được thông tin. Vui lòng thử lại.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [ipId]);

  const publicContent = intake?.aiProcessedContent || intake?.content;
  const sectors = intake?.intakeSectors?.map((s) => s.sector.name) ?? [];
  const publicAttachments = intake?.attachments ?? [];

  const isImageAttachment = (attachment: { fileName: string; mimeType: string; fileType: string }) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'];
    const ext = attachment.fileName.split('.').pop()?.toLowerCase() ?? '';
    return (
      attachment.mimeType?.startsWith('image/') ||
      attachment.fileType?.startsWith('image') ||
      imageExtensions.includes(ext)
    );
  };

  const formatFileSize = (fileSize: string | number): string => {
    const size = typeof fileSize === 'string' ? parseFloat(fileSize) : fileSize;
    if (isNaN(size)) return '0 KB';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderAttachments = () => {
    if (publicAttachments.length === 0) return null;

    const images = publicAttachments.filter(isImageAttachment);
    const files = publicAttachments.filter((a) => !isImageAttachment(a));

    return (
      <div className="space-y-6">
        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <ImageIcon className="h-4 w-4" />
              Hình ảnh công khai
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {images.map((attachment) => (
                <div key={attachment.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 transition-colors hover:border-slate-300">
                  <a href={attachment.filePath} target="_blank" rel="noopener noreferrer" className="group relative block">
                    <img src={attachment.filePath} alt={attachment.fileName} className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </a>
                  <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-900" title={attachment.fileName}>{attachment.fileName}</p>
                      <p className="text-[10px] text-slate-500">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                    <a href={attachment.filePath} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700" title="Tải xuống">
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Paperclip className="h-4 w-4" />
              Tài liệu công khai
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {files.map((attachment) => (
                <div key={attachment.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <FileText className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900" title={attachment.fileName}>{attachment.fileName}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(attachment.fileSize)}</p>
                  </div>
                  {attachment.filePath && (
                    <a href={attachment.filePath} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Tải xuống">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="marketplace" onNavigate={onNavigate}>
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="size-4" />
            <span>Quay lại Sàn</span>
          </button>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-1/3 animate-pulse rounded-lg bg-slate-200" />
              <div className="mt-8 h-64 animate-pulse rounded-lg bg-slate-200" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <AlertCircle className="size-10 text-red-400" />
              <p className="text-slate-600">{error}</p>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                <RefreshCw className="size-4" />
                Thử lại
              </button>
            </div>
          ) : intake ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10">
                    {intake.type === 'ip' ? 'Cung' : 'Cầu'}
                  </Badge>
                  {sectors.map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {s}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-xl font-semibold leading-snug tracking-tight text-slate-950 sm:text-2xl">
                  {intake.aiProcessTitle || intake.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="size-4 text-slate-400" />
                    <span>Đơn vị đăng tải trên DMST</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-slate-400" />
                    <span>Cập nhật {formatDate(intake.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
                <h2 className="mb-6 text-base font-semibold text-slate-950">Thông tin công khai</h2>
                {publicContent ? (
                  <ViewOnlyMDX value={publicContent} />
                ) : (
                  <p className="text-sm text-slate-400">Chưa có nội dung công khai.</p>
                )}
                
                <div className="mt-8 border-t border-slate-100 pt-8">
                  <h2 className="mb-6 text-base font-semibold text-slate-950">Tài liệu đính kèm</h2>
                  {renderAttachments() || <p className="text-sm text-slate-400">Không có tài liệu đính kèm công khai.</p>}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
