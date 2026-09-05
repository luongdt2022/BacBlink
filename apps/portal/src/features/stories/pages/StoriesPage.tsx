import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal';
import { Pagination } from '@/shared/components/Pagination';
import { PageHeader } from '@/shared/components/header/PageHeader';
import { ResponsivePageSection } from '@/shared/components/layout/ResponsivePageSection';
import { formatDateTime } from '@/shared/utils/date';
import {
  getMyStories,
  deleteStory,
  type StoryListItem,
  type StoryStatus,
  type StoryType,
} from '../api/story';

const LIMIT = 20;

type StatusFilter = 'all' | StoryStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'draft', label: 'Nháp' },
  { id: 'published', label: 'Đã công bố' },
];

const TYPE_LABELS: Record<StoryType, string> = {
  success: 'Thành công',
  failure: 'Thất bại',
};

export function StoriesPage() {
  const navigate = useNavigate();

  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<StoryType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<StoryListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  const loadStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: LIMIT,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      };
      const res = await getMyStories(params);
      setStories(res.data);
      setTotal(res.total);
    } catch {
      toast.error('Không thể tải danh sách câu chuyện');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteStory(deleteTarget.id);
      toast.success('Đã xóa câu chuyện');
      setDeleteTarget(null);
      void loadStories();
    } catch {
      toast.error('Không thể xóa câu chuyện');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTabChange = (tab: StatusFilter) => {
    setStatusFilter(tab);
    setPage(1);
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val as StoryType | 'all');
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Câu chuyện"
        description="Chia sẻ câu chuyện thành công và bài học rút ra từ thất bại"
        actionLabel="Tạo câu chuyện"
        onAction={() => navigate('/stories/create')}
      />

      <div className="responsive-page-container responsive-page-stack">
        {/* Tabs + filter bar */}
        <ResponsivePageSection className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-44 border border-gray-300 bg-white shadow-sm focus-visible:border-gray-400 focus-visible:ring-0">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="focus:bg-gray-100 focus:text-gray-900">Tất cả loại</SelectItem>
                <SelectItem value="success" className="focus:bg-gray-100 focus:text-gray-900">Thành công</SelectItem>
                <SelectItem value="failure" className="focus:bg-gray-100 focus:text-gray-900">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ResponsivePageSection>

        {/* Table */}
        <ResponsivePageSection className="overflow-hidden p-0">
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Chưa có câu chuyện nào</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/stories/create')}
              >
                Tạo câu chuyện đầu tiên
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Ngày tạo</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stories.map((story, idx) => (
                  <tr
                    key={story.id}
                    className="cursor-pointer hover:bg-primary/[0.04] transition-colors"
                    onClick={() => navigate(`/stories/${story.id}`)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{story.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={
                          story.type === 'success'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                        }
                      >
                        {TYPE_LABELS[story.type]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={
                          story.status === 'published'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                        }
                      >
                        {story.status === 'published' ? 'Công khai' : 'Nháp'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(story.createdAt)}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/stories/${story.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(story)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </ResponsivePageSection>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa câu chuyện"
        message={`Bạn có chắc chắn muốn xóa câu chuyện "${deleteTarget?.title ?? ''}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa'}
        cancelLabel="Hủy"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
