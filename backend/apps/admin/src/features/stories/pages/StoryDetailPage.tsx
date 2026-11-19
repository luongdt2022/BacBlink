import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ChevronLeft, Calendar, Lightbulb, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ViewOnlyMDX } from '@/shared/ui/view-only-mdx'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import {
  getStoryById,
  deleteStory,
  type Story,
} from '@/services/storyService'

const TYPE_LABELS = { success: 'Thành công', failure: 'Thất bại' }

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    void (async () => {
      try {
        setIsLoading(true)
        const data = await getStoryById(id)
        setStory(data)
      } catch {
        toast.error('Không thể tải câu chuyện')
        navigate('/stories')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [id, navigate])

  const handleDelete = async () => {
    if (!id) return
    try {
      setIsDeleting(true)
      await deleteStory(id)
      toast.success('Đã xóa câu chuyện')
      navigate('/stories')
    } catch {
      toast.error('Không thể xóa câu chuyện')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p>Đang tải thông tin câu chuyện...</p>
      </div>
    )
  }

  if (!story) return null

  return (
    <div className="mx-auto max-w-[1400px] p-6 space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <button
          onClick={() => navigate('/stories')}
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách
        </button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{story.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={story.type === 'success' ? 'success' : 'orange'}>
                {TYPE_LABELS[story.type]}
              </Badge>
              <Badge variant={story.status === 'published' ? 'info' : 'secondary'}>
                {story.status === 'published' ? 'Công khai' : 'Bản nháp'}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(story.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/stories/${story.id}/edit`)}
              className="rounded-xl border-2 h-10 px-6"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="rounded-xl h-10 px-6"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-lg">Chi tiết nội dung</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ViewOnlyMDX value={story.content} />
            </CardContent>
          </Card>

          {story.type === 'failure' && story.lesson && (
            <Card className="shadow-sm border-orange-200 bg-orange-50/20 overflow-hidden">
              <CardHeader className="bg-orange-100/30 border-b border-orange-200 py-4">
                <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                  <Lightbulb className="h-5 w-5" />
                  Bài học rút ra
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-orange-900/80">
                <ViewOnlyMDX value={story.lesson} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Người tạo</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand uppercase">
                    {(story.author?.name || 'A').charAt(0)}
                  </div>
                  <p className="text-sm font-medium">{story.author?.name ?? story.authorId.slice(0, 8)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Ngày tạo</p>
                <p className="text-sm font-medium">{new Date(story.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Cập nhật lần cuối</p>
                <p className="text-sm font-medium">{new Date(story.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Xóa câu chuyện"
        description={`Bạn có chắc chắn muốn xóa câu chuyện "${story.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
