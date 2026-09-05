import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ViewOnlyMDX } from '@/shared/components/ui/view-only-mdx';
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal';
import { formatDateTimeWithSeconds } from '@/shared/utils/date';
import { getStoryById, deleteStory, type Story } from '../api/story';

const TYPE_LABELS = { success: 'Thành công', failure: 'Thất bại' };

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        setIsLoading(true);
        const data = await getStoryById(id);
        setStory(data);
      } catch {
        toast.error('Không thể tải câu chuyện');
        navigate('/stories');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!story) return;
    try {
      setIsDeleting(true);
      await deleteStory(story.id);
      toast.success('Đã xóa câu chuyện');
      navigate('/stories');
    } catch {
      toast.error('Không thể xóa câu chuyện');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="min-h-[calc(100svh-var(--header-height))] bg-gray-50/50">
      <div className="responsive-page-container responsive-page-stack py-8">
        {/* Back */}
        <div>
          <button
            onClick={() => navigate('/stories')}
            className="mb-6 inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Quay lại danh sách</span>
          </button>

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{story.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge
                  variant="secondary"
                  className={
                    story.type === 'success'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200'
                  }
                >
                  {TYPE_LABELS[story.type]}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    story.status === 'published'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200'
                  }
                >
                  {story.status === 'published' ? 'Công khai' : 'Nháp'}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTimeWithSeconds(story.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/stories/${story.id}/edit`)}
                className="rounded-xl border-gray-200 h-10 px-6"
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="rounded-xl h-10 px-6"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <ViewOnlyMDX value={story.content} />
            </div>

            {story.type === 'failure' && story.lesson && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50/50 overflow-hidden">
                <div className="flex items-center gap-2 text-orange-800 px-8 pt-6 pb-0">
                  <Lightbulb className="h-5 w-5" />
                  <h2 className="text-base font-bold">Bài học rút ra</h2>
                </div>
                <div className="text-orange-900/80">
                  <ViewOnlyMDX value={story.lesson} />
                </div>
              </div>
            )}
          </div>

          {/* Metadata sidebar */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Thông tin thêm</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Người tạo:</span>
                  <span className="font-medium text-gray-900">Bạn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lần cuối cập nhật:</span>
                  <span className="font-medium text-gray-900">{formatDateTimeWithSeconds(story.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Xóa câu chuyện"
        message={`Bạn có chắc chắn muốn xóa câu chuyện "${story.title}" không? Hành động này không thể hoàn tác.`}
        confirmLabel={isDeleting ? 'Đang xóa...' : 'Xóa'}
        cancelLabel="Hủy"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
