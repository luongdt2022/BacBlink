import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Download,
  FileText,
  Globe,
  Image,
  Lightbulb,
  Lock,
  Paperclip,
  RefreshCw,
  Shield,
  Sparkles,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/AuthProvider';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ViewOnlyMDX } from '@/shared/components/ui/view-only-mdx';
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal';
import { formatDateTimeWithSeconds } from '@/shared/utils/date';
import { computeMatches, deleteIntake, getIntakeById, type Intake, type IntakeType } from '../api/intake';
import { MatchesSection } from '../components/MatchesSection';
import { buildEditPathByType, buildListPathByType } from '../utils/intakeRoutes';

const DETAIL_TAB_PUBLIC = 'public';
const DETAIL_TAB_LEVEL2 = 'level2';
const DETAIL_TAB_LEVEL3 = 'level3';
const DETAIL_TAB_MATCHES = 'matches';

interface IntakeDetailPageProps {
  intakeId: string;
  expectedType?: IntakeType;
  backPath?: string;
  editPath?: string;
}

export function IntakeDetailPage({ intakeId, expectedType, backPath, editPath }: IntakeDetailPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const resolvedBackPath = backPath ?? buildListPathByType(expectedType ?? 'ip');

  const [intake, setIntake] = useState<Intake | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRematchDialog, setShowRematchDialog] = useState(false);
  const tabParam = searchParams.get('tab');
  const validTabs = [DETAIL_TAB_PUBLIC, DETAIL_TAB_LEVEL2, DETAIL_TAB_LEVEL3, DETAIL_TAB_MATCHES];
  const [activeTab, setActiveTab] = useState(
    validTabs.includes(tabParam ?? '') ? (tabParam as string) : DETAIL_TAB_PUBLIC,
  );
  const isOwner = Boolean(
    intake?.userId && currentUser?.id && intake.userId === currentUser.id,
  );

  useEffect(() => {
    if (intake && !isOwner && activeTab !== DETAIL_TAB_PUBLIC) {
      setActiveTab(DETAIL_TAB_PUBLIC);
    }
  }, [intake, isOwner, activeTab]);

  const loadIntake = useCallback(async (targetIntakeId: string) => {
    try {
      setIsLoading(true);
      const data = await getIntakeById(targetIntakeId);
      if (expectedType && data.type !== expectedType) {
        toast.error('Dữ liệu không khớp với route hiện tại');
        navigate(resolvedBackPath, { replace: true });
        return;
      }
      setIntake(data);
    } catch (error) {
      console.error('Error loading intake:', error);
      toast.error('Có lỗi khi tải thông tin tiếp nhận');
    } finally {
      setIsLoading(false);
    }
  }, [expectedType, navigate, resolvedBackPath]);

  useEffect(() => {
    void loadIntake(intakeId);
  }, [intakeId, loadIntake]);

  const executeMatchSearch = async () => {
    if (!intake) return;

    const toastId = toast.loading('Hệ thống đang xử lý, vui lòng chờ giây lát...');
    setIsMatching(true);

    try {
      await computeMatches(intake.id);
      await loadIntake(intake.id);
      setActiveTab(DETAIL_TAB_MATCHES);
      toast.dismiss(toastId);
      toast.success('Đã cập nhật kết quả tìm kiếm giải pháp phù hợp');
    } catch {
      toast.dismiss(toastId);
      toast.error('Không thể tìm kiếm kết quả. Vui lòng thử lại.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleComputeMatches = async () => {
    if (!intake || isMatching) return;

    if ((intake.matches?.length ?? 0) > 0) {
      setShowRematchDialog(true);
      return;
    }

    await executeMatchSearch();
  };

  const handleConfirmRematch = async () => {
    setShowRematchDialog(false);
    await executeMatchSearch();
  };

  const handleDelete = async () => {
    if (!intake) return;

    try {
      setIsDeleting(true);
      await deleteIntake(intake.id);
      toast.success('Đã xóa thông tin thành công');
      navigate(resolvedBackPath);
    } catch (error) {
      console.error('Error deleting intake:', error);
      toast.error('Có lỗi khi xóa thông tin');
    } finally {
      setIsDeleting(false);
    }
  };

  const isImageAttachment = (attachment: {
    fileType: string;
    mimeType: string;
    fileName: string;
  }) => {
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

  const publicAttachments =
    intake?.attachments?.filter(
      (att) => !att.confidentialLevel && att.fileType !== 'profile_picture'
    ) || [];
  const level2Attachments =
    intake?.attachments?.filter((att) => att.confidentialLevel === 'level2') || [];
  const level3Attachments =
    intake?.attachments?.filter((att) => att.confidentialLevel === 'level3') || [];
  const matches = intake?.matches ?? [];
  const hasMatches = matches.length > 0;
  const matchCount = matches.length;
  const matchTabLabel = intake?.type === 'challenge' ? 'Giải pháp phù hợp' : 'Nhu cầu phù hợp';
  const matchCtaLabel = hasMatches ? 'Tìm lại giải pháp phù hợp' : 'Tìm kiếm giải pháp phù hợp';
  const matchCtaDescription = hasMatches
    ? `Đang có ${matchCount} kết quả để bạn rà soát. Tìm lại để làm mới danh sách đề xuất mới nhất.`
    : 'Khởi chạy AI matching để hệ thống đề xuất các đối tượng phù hợp nhất cho hồ sơ này.';

  const filterAttachments = (attachments: typeof publicAttachments) => {
    const images = attachments.filter(isImageAttachment);
    const files = attachments.filter((a) => !isImageAttachment(a));
    return { images, files };
  };

  const renderFileList = (attachments: typeof publicAttachments, levelName?: string) => {
    const { images, files } = filterAttachments(attachments);

    return (
      <div className="space-y-6">
        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Image className="h-4 w-4" />
              Hình ảnh
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {images.map((attachment) => (
                <div
                  key={attachment.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50 transition-colors hover:border-gray-300"
                >
                  <a
                    href={attachment.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block"
                  >
                    <img
                      src={attachment.filePath}
                      alt={attachment.fileName}
                      className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </a>
                  <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-xs font-medium text-gray-900"
                        title={attachment.fileName}
                      >
                        {attachment.fileName}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                        {levelName && <span className="ml-2 text-primary">({levelName})</span>}
                      </p>
                    </div>
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      title="Tải xuống"
                    >
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
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Paperclip className="h-4 w-4" />
              Tài liệu khác
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {files.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:border-gray-300"
                >
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium text-gray-900"
                      title={attachment.fileName}
                    >
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)}
                      {levelName && <span className="ml-2 text-primary">({levelName})</span>}
                    </p>
                  </div>
                  {attachment.filePath && (
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && files.length === 0 && (
          <p className="italic text-sm text-gray-500">Không có tài liệu đính kèm</p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-3 text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy thông tin tiếp nhận</p>
          <Button variant="link" onClick={() => navigate(resolvedBackPath)} className="mt-2 text-primary">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-gray-50">
      <div className="responsive-page-container responsive-page-stack">
        <div>
          <button
            onClick={() => navigate(resolvedBackPath)}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              {intake.profilePicUrl && (
                <div className="shrink-0">
                  <img
                    src={intake.profilePicUrl}
                    alt="Profile"
                    className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">{intake.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4">
                  <Badge variant={intake.type === 'ip' ? 'default' : 'secondary'}>
                    {intake.type === 'ip' ? 'Cung' : 'Cầu'}
                  </Badge>
                  <Badge
                    variant={intake.status === 'published' ? 'default' : 'secondary'}
                    className={
                      intake.status === 'published'
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                    }
                  >
                    {intake.status === 'published' ? 'Đã công bố' : 'Nháp'}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTimeWithSeconds(intake.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            {isOwner && (
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="min-h-[2.75rem]"
                  onClick={() => navigate(editPath ?? buildEditPathByType(intake.type, intake.id))}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="min-h-[2.75rem]"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
          <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 p-4">
                <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
                  <TabsTrigger
                    value={DETAIL_TAB_PUBLIC}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Globe className="h-4 w-4" />
                    Thông tin công khai
                  </TabsTrigger>
                  {isOwner && (
                    <TabsTrigger
                      value={DETAIL_TAB_LEVEL2}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Lock className="h-4 w-4" />
                      Bảo mật mức 2
                    </TabsTrigger>
                  )}
                  {isOwner && (
                    <TabsTrigger
                      value={DETAIL_TAB_LEVEL3}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:px-4 sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Shield className="h-4 w-4" />
                      Bảo mật mức 3
                    </TabsTrigger>
                  )}
                  {isOwner && (
                    <TabsTrigger
                      value={DETAIL_TAB_MATCHES}
                      className="group ml-0 flex shrink-0 items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.05] px-3 py-2 text-xs text-primary shadow-sm transition-all hover:border-primary/25 hover:bg-primary/[0.08] sm:ml-auto sm:px-4 sm:text-sm data-[state=active]:border-primary/25 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-[0_10px_24px_rgba(14,165,233,0.10)]"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{matchTabLabel}</span>
                      {matchCount > 0 && (
                        <span className="rounded-full border border-primary/15 bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary group-data-[state=active]:bg-primary/10">
                          {matchCount}
                        </span>
                      )}
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value={DETAIL_TAB_PUBLIC} className="space-y-6 p-4">
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Nội dung gốc
                  </h2>
                  <ViewOnlyMDX value={intake.content} />
                </div>

                {intake.aiProcessedContent && (
                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Nội dung sau xử lý
                    </h2>
                    <ViewOnlyMDX value={intake.aiProcessedContent} />
                  </div>
                )}

                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Tài liệu đính kèm ({publicAttachments.length})
                  </h2>
                  {renderFileList(publicAttachments)}
                </div>
              </TabsContent>

              {isOwner && (
                <TabsContent value={DETAIL_TAB_LEVEL2} className="space-y-6 p-4">
                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Nội dung gốc - Bảo mật mức 2
                    </h2>
                    <ViewOnlyMDX value={intake.confidentialLevel2Content || ''} />
                  </div>

                  {intake.confidentialLevel2AiProcessedContent && (
                    <div>
                      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Nội dung sau xử lý
                      </h2>
                      <ViewOnlyMDX value={intake.confidentialLevel2AiProcessedContent} />
                    </div>
                  )}

                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Tài liệu đính kèm ({level2Attachments.length})
                    </h2>
                    {renderFileList(level2Attachments, 'Mức 2')}
                  </div>
                </TabsContent>
              )}

              {isOwner && (
                <TabsContent value={DETAIL_TAB_LEVEL3} className="space-y-6 p-4">
                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Nội dung gốc - Bảo mật mức 3
                    </h2>
                    <ViewOnlyMDX value={intake.confidentialLevel3Content || ''} />
                  </div>

                  {intake.confidentialLevel3AiProcessedContent && (
                    <div>
                      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Nội dung sau xử lý
                      </h2>
                      <ViewOnlyMDX value={intake.confidentialLevel3AiProcessedContent} />
                    </div>
                  )}

                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Tài liệu đính kèm ({level3Attachments.length})
                    </h2>
                    {renderFileList(level3Attachments, 'Mức 3')}
                  </div>
                </TabsContent>
              )}

              {isOwner && (
                <TabsContent value={DETAIL_TAB_MATCHES} className="p-4 pt-2">
                  <MatchesSection
                    matches={matches}
                    intakeType={intake.type}
                    parentIntakeId={intake.id}
                    parentIntakeStatus={intake.status}
                    countLabel={
                      hasMatches
                        ? `${matchCount} kết quả đang hiển thị`
                        : 'Sẵn sàng cho lần tìm kiếm đầu tiên'
                    }
                    emptyHint="Hiện chưa có đối tượng phù hợp nào được hệ thống ghi nhận cho hồ sơ này."
                    actionHint={`Dùng nút "${matchCtaLabel}" ở cột phải để bắt đầu hoặc làm mới kết quả`}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 xl:sticky xl:top-6 xl:h-fit">
            <h3 className="mb-4 text-sm font-medium text-gray-700">Thông tin</h3>

            {isOwner && intake.status === 'published' && (
              <div className="mb-4 overflow-hidden rounded-2xl border border-primary/10 bg-primary/[0.03] shadow-[0_18px_40px_rgba(14,165,233,0.08)]">
                <div className="border-b border-primary/10 px-4 py-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="size-3.5" />
                    Matching Hub
                  </div>
                  <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900">
                    {matchCtaLabel}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{matchCtaDescription}</p>
                </div>
                <div className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-white px-3 py-2.5 text-sm">
                    <span className="text-slate-500">
                      {hasMatches ? 'Kết quả hiện tại' : 'Trạng thái matching'}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {hasMatches ? `${matchCount} kết quả` : 'Chưa có kết quả'}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      void handleComputeMatches();
                    }}
                    disabled={isMatching}
                    className="h-11 w-full rounded-xl bg-primary text-white shadow-sm hover:bg-primary/90"
                  >
                    {isMatching ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : hasMatches ? (
                      <RefreshCw className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isMatching ? 'Đang làm mới kết quả...' : matchCtaLabel}
                  </Button>
                  <p className="text-xs leading-5 text-slate-500">
                    {hasMatches
                      ? 'Nếu bạn tìm lại, hệ thống sẽ cập nhật danh sách đề xuất mới nhất cho intake này.'
                      : 'Sau khi hoàn tất, kết quả sẽ xuất hiện trực tiếp trong tab matching ở bên trái.'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  {intake.type === 'ip' ? (
                    <FileText className="h-3.5 w-3.5" />
                  ) : (
                    <Lightbulb className="h-3.5 w-3.5" />
                  )}
                  <span>Loại</span>
                </div>
                <p className="pl-5 text-sm font-medium text-gray-900">
                  {intake.type === 'ip' ? 'Cung' : 'Cầu'}
                </p>
              </div>

              {intake.category && (
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Danh mục</span>
                  </div>
                  <div className="pl-5">
                    <Badge variant="default" className="text-xs">
                      {intake.category.name}
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Ngày tạo</span>
                </div>
                <p className="pl-5 text-sm font-medium text-gray-900">
                  {formatDateTimeWithSeconds(intake.createdAt)}
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Cập nhật lần cuối</span>
                </div>
                <p className="pl-5 text-sm font-medium text-gray-900">
                  {formatDateTimeWithSeconds(intake.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa thông tin này?"
        confirmLabel="Xóa"
        cancelLabel="Hủy"
      />

      <Dialog open={showRematchDialog} onOpenChange={setShowRematchDialog}>
        <DialogContent className="max-w-md rounded-2xl border border-slate-200 p-0">
          <div className="rounded-t-2xl bg-white px-6 py-5">
            <DialogHeader className="text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                <RefreshCw className="size-3.5" />
                Tìm kiếm lại
              </div>
              <DialogTitle className="text-xl tracking-tight text-slate-900">
                Làm mới danh sách kết quả phù hợp?
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-600">
                Đang có {matchCount} kết quả. Nếu tiếp tục, hệ thống sẽ chạy lại
                matching và cập nhật danh sách đề xuất mới nhất cho bạn.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4">
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRematchDialog(false)}>
                Giữ kết quả hiện tại
              </Button>
              <Button
                onClick={() => {
                  void handleConfirmRematch();
                }}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Xác nhận tìm kiếm lại
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
