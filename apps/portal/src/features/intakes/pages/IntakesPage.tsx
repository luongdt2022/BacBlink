import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, FileText, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { SearchInput } from '@/shared/components/SearchInput';
import { Badge } from '@/shared/components/ui/badge';
import { Pagination } from '@/shared/components/Pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal';
import { formatDateTime } from '@/shared/utils/date';
import { PageHeader } from '@/shared/components/header/PageHeader';
import { ResponsivePageSection } from '@/shared/components/layout/ResponsivePageSection';
import { StatusBadge, AiProcessingBadge } from '../components';
import {
  getMyIntakes,
  deleteIntake as deleteIntakeApi,
  type IntakeListItem,
  type IntakeStatus,
  type IntakeType,
} from '../api/intake';
import {
  buildCreatePathByType,
  buildDetailPathByType,
  buildEditPathByType,
  type IntakeNamespace,
} from '../utils/intakeRoutes';

type StatusFilter = 'all' | IntakeStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'draft', label: 'Nháp' },
  { id: 'published', label: 'Đã công bố' },
];

const PLACEHOLDER_IMAGE_SRC = '/placeholder-image.png';

function getAiStatusValue(status: IntakeListItem['aiProcessingStatus']): string | null {
  if (typeof status === 'string') return status;
  if (status && typeof status === 'object' && 'status' in status) {
    return (status as { status: string }).status;
  }
  return null;
}

const IntakeTableRow = memo(function IntakeTableRow({
  intake,
  stt,
  onRowClick,
  onEdit,
  onDelete,
}: {
  intake: IntakeListItem;
  stt: number;
  onRowClick: (intake: IntakeListItem) => void;
  onEdit: (intake: IntakeListItem) => void;
  onDelete: (intake: IntakeListItem) => void;
}) {
  const aiStatusValue = getAiStatusValue(intake.aiProcessingStatus);
  const isProcessing = aiStatusValue === 'processing' || aiStatusValue === 'PROCESSING';

  return (
    <tr
      className={`transition-all ${
        isProcessing
          ? 'cursor-not-allowed bg-muted/30 opacity-60'
          : 'hover:bg-primary/[0.04] cursor-pointer'
      }`}
      onClick={() => {
        if (!isProcessing) onRowClick(intake);
      }}
    >
      <td className="px-6 py-5 text-sm font-medium text-muted-foreground/60">{stt}</td>

      <td className="px-6 py-5">
        <img
          src={intake.profilePicUrl || PLACEHOLDER_IMAGE_SRC}
          alt={intake.title}
          className="h-10 w-10 rounded-xl border border-border object-cover shadow-sm"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMAGE_SRC;
          }}
        />
      </td>

      <td className="px-6 py-5">
        <span className="block max-w-sm truncate text-sm font-bold text-foreground">
          {intake.title}
        </span>
      </td>

      <td className="px-6 py-5">
        <Badge
          variant={intake.type === 'ip' ? 'secondary' : 'accent'}
          className="gap-2"
        >
          {intake.type === 'ip' ? (
            <FileText className="size-3.5" />
          ) : (
            <Lightbulb className="size-3.5" />
          )}
          {intake.type === 'ip' ? 'Cung' : 'Cầu'}
        </Badge>
      </td>

      <td className="px-6 py-5">
        <AiProcessingBadge status={aiStatusValue} hasContent={!!intake.aiProcessedContent} />
      </td>

      <td className="px-6 py-5">
        <StatusBadge status={intake.status} />
      </td>

      <td className="whitespace-nowrap px-6 py-5 text-sm text-muted-foreground">{formatDateTime(intake.createdAt)}</td>

      <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-xl p-2 transition-colors hover:bg-muted">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(intake);
              }}
              className="cursor-pointer"
            >
              <Pencil className="mr-3 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(intake);
              }}
              className="cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive"
            >
              <Trash2 className="mr-3 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
});

interface IntakesPageProps {
  forcedType?: IntakeType;
  namespace?: IntakeNamespace;
}

export function IntakesPage({ forcedType, namespace }: IntakesPageProps = {}) {
  const navigate = useNavigate();

  const [intakes, setIntakes] = useState<IntakeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalByStatus, setTotalByStatus] = useState({ draft: 0, published: 0 });
  const [deleteIntake, setDeleteIntake] = useState<IntakeListItem | null>(null);
  const deleteTargetLabel = deleteIntake?.type === 'ip' ? 'Cung' : 'Cầu';
  const defaultNamespace: IntakeNamespace = namespace ?? (forcedType === 'challenge' ? 'challenges' : 'ips');
  const effectiveType: IntakeType = forcedType ?? (defaultNamespace === 'challenges' ? 'challenge' : 'ip');
  const createPath = buildCreatePathByType(effectiveType);
  const loadIntakes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMyIntakes({
        search: search || undefined,
        type: effectiveType,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: 10,
      });

      setIntakes(data.data);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
      setTotalByStatus(data.totalByStatus || { draft: 0, published: 0 });
    } catch (error) {
      console.error('Error loading intakes:', error);
      toast.error('Có lỗi khi tải danh sách đăng ký');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, statusFilter, effectiveType]);

  useEffect(() => {
    void loadIntakes();
  }, [loadIntakes]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch((prev) => (prev === searchInput ? prev : searchInput));
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, effectiveType]);

  const handleRowClick = useCallback(
    (intake: IntakeListItem) => {
      navigate(buildDetailPathByType(intake.type, intake.id));
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (intake: IntakeListItem) => {
      navigate(buildEditPathByType(intake.type, intake.id));
    },
    [navigate]
  );

  const handleDelete = useCallback((intake: IntakeListItem) => {
    setDeleteIntake(intake);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteIntake) return;

    try {
      await deleteIntakeApi(deleteIntake.id);
      toast.success('Đã xóa Cung & Cầu thành công');
      void loadIntakes();
    } catch (error) {
      console.error('Error deleting intake:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setDeleteIntake(null);
    }
  }, [deleteIntake, loadIntakes]);

  const getSTT = useCallback((index: number) => (page - 1) * 10 + index + 1, [page]);

  const tabCounts = useMemo(
    () => ({
      all: totalCount,
      draft: totalByStatus.draft,
      published: totalByStatus.published,
    }),
    [totalCount, totalByStatus]
  );

  return (
    <div className="min-h-full w-full">
      <PageHeader
        title={
          defaultNamespace === 'challenges' ? 'Danh sách Cầu' : 'Danh sách Cung'
        }
        description={
          defaultNamespace === 'challenges'
            ? 'Tạo, theo dõi và quản lý toàn bộ hồ sơ Cầu.'
            : 'Tạo, theo dõi và quản lý toàn bộ hồ sơ Cung.'
        }
        onAction={() => navigate(createPath)}
        actionLabel={defaultNamespace === 'challenges' ? 'Tạo Cầu mới' : 'Tạo Cung mới'}
      />

      <div className="responsive-page-container responsive-page-stack">
        <ResponsivePageSection className="p-6">
          <div className="mb-6 flex gap-2.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const count = tabCounts[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/50'
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-2 text-[10px] font-bold ${
                    statusFilter === tab.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
          </div>

          <div className="grid gap-3">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Tìm kiếm theo tiêu đề hồ sơ..."
            />
          </div>
        </ResponsivePageSection>

        {isLoading ? (
          <ResponsivePageSection className="overflow-hidden p-0">
            <div className="animate-pulse">
              <div className="h-12 bg-slate-100 sm:h-14"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-50"></div>
              ))}
            </div>
          </ResponsivePageSection>
        ) : intakes.length === 0 ? (
          <ResponsivePageSection className="overflow-hidden p-0">
            <div className="px-4 py-12 text-center sm:py-14">
              <p className="text-sm font-medium text-slate-500">Chưa có Cung hoặc Cầu nào</p>
              <Button
                variant="link"
                onClick={() => navigate(createPath)}
                className="text-primary mt-2"
              >
                {defaultNamespace === 'challenges' ? 'Tạo Cầu đầu tiên' : 'Tạo Cung đầu tiên'}
              </Button>
            </div>
          </ResponsivePageSection>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {intakes.map((intake, index) => {
                const aiStatusValue = getAiStatusValue(intake.aiProcessingStatus);
                const isProcessing = aiStatusValue === 'processing' || aiStatusValue === 'PROCESSING';

                return (
                  <ResponsivePageSection
                    key={intake.id}
                    className={`p-4 ${
                      isProcessing ? 'bg-slate-50/70 opacity-80' : 'cursor-pointer hover:bg-primary/[0.02]'
                    }`}
                  >
                    <div
                      className="flex items-start justify-between gap-3"
                      onClick={() => {
                        if (!isProcessing) {
                          handleRowClick(intake);
                        }
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500">#{getSTT(index)}</p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{intake.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{formatDateTime(intake.createdAt)}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-lg border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-slate-50"
                          >
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-lg border-slate-200">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(intake);
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(intake);
                            }}
                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={intake.type === 'ip' ? 'default' : 'secondary'}
                        className={`inline-flex items-center gap-1 ${
                          intake.type === 'ip'
                            ? 'border-blue-200 bg-blue-100 text-blue-700'
                            : 'border-purple-200 bg-purple-100 text-purple-700'
                        }`}
                      >
                        {intake.type === 'ip' ? <FileText className="h-3 w-3" /> : <Lightbulb className="h-3 w-3" />}
                        {intake.type === 'ip' ? 'Cung' : 'Cầu'}
                      </Badge>
                      <AiProcessingBadge status={aiStatusValue} hasContent={!!intake.aiProcessedContent} />
                      <StatusBadge status={intake.status} />
                    </div>
                  </ResponsivePageSection>
                );
              })}
            </div>

            <ResponsivePageSection className="hidden overflow-hidden p-0 md:block">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="w-16 whitespace-nowrap px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      STT
                    </th>
                    <th className="w-20 whitespace-nowrap px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Avatar
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Tiêu đề
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Loại
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Trạng thái AI
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Trạng thái
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Ngày tạo
                    </th>
                    <th className="whitespace-nowrap px-6 py-5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {intakes.map((intake, index) => (
                    <IntakeTableRow
                      key={intake.id}
                      intake={intake}
                      stt={getSTT(index)}
                      onRowClick={handleRowClick}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
              </div>
            </ResponsivePageSection>
            {totalPages > 1 && (
              <div className="py-1">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteIntake}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteIntake(null)}
        title={`Xóa ${deleteTargetLabel}`}
        message={`Bạn có chắc chắn muốn xóa ${deleteTargetLabel.toLowerCase()} "${deleteIntake?.title}" không? Hành động này không thể hoàn tác và sẽ xóa tất cả các tệp đính kèm liên quan.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
      />
    </div>
  );
}
