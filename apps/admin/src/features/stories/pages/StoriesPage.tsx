import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Eye, EyeOff, Pencil, Plus, Trash2, Filter, Search, MoreHorizontal, Clock, BookOpen } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import { Pagination } from '@/shared/components/Pagination'
import { Badge } from '@/shared/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { deleteStory } from '@/services/storyService'
import type { StoryListItem, StoryStatus } from '@/services/storyService'
import { useStoriesList } from '../hooks/useStoriesList'

const TYPE_LABELS = { success: 'Thành công', failure: 'Thất bại' }

const STATUS_TABS: { id: StoryStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'draft', label: 'Bản nháp' },
  { id: 'published', label: 'Đã công khai' },
]

export function StoriesPage() {
  const navigate = useNavigate()
  const { stories, page, totalPages, isLoading, type, status, setPage, setType, setStatus, refresh } = useStoriesList()
  const [deleteTarget, setDeleteTarget] = useState<StoryListItem | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteStory(deleteTarget.id)
      toast.success('Đã xóa câu chuyện')
      setDeleteTarget(null)
      refresh()
    } catch {
      toast.error('Không thể xóa câu chuyện')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Câu chuyện</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chia sẻ những trải nghiệm, thành công và bài học từ cộng đồng.
          </p>
        </div>
        <Button onClick={() => navigate('/stories/create')} className="gap-2 px-6 h-11 font-bold rounded-xl shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" />
          Tạo câu chuyện mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  status === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block" />

          {/* Type Filter */}
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full md:w-44 h-10 rounded-xl border-gray-200 bg-white">
              <SelectValue placeholder="Tất cả loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="success">Thành công</SelectItem>
              <SelectItem value="failure">Thất bại</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
             <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
             <p className="font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <div className="bg-gray-50 p-6 rounded-full">
              <BookOpen className="h-12 w-12 opacity-20" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">Chưa có câu chuyện nào</p>
              <p className="text-sm text-gray-500 mt-1">Hãy bắt đầu chia sẻ câu chuyện đầu tiên của bạn.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/stories/create')} className="mt-2 rounded-xl border-2">
               Tạo câu chuyện ngay
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 w-16">STT</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 min-w-[300px]">Tiêu đề</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Loại</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Ngày tạo</th>
                  <th className="px-6 py-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stories.map((story, idx) => (
                  <tr
                    key={story.id}
                    className="group hover:bg-primary/[0.04] transition-colors cursor-pointer"
                    onClick={() => navigate(`/stories/${story.id}`)}
                  >
                    <td className="px-6 py-5 text-sm text-gray-400 font-medium">{(page - 1) * 20 + idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                          {story.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        variant="secondary"
                        className={
                          story.type === 'success'
                            ? 'bg-green-100 text-green-700 border-green-200 font-bold'
                            : 'bg-orange-100 text-orange-700 border-orange-200 font-bold'
                        }
                      >
                        {TYPE_LABELS[story.type]}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        variant="secondary"
                        className={
                          story.status === 'published'
                            ? 'bg-blue-100 text-blue-700 border-blue-200 font-bold'
                            : 'bg-gray-100 text-gray-600 border-gray-200 font-bold'
                        }
                      >
                        {story.status === 'published' ? 'Công khai' : 'Nháp'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                         <Clock className="h-3.5 w-3.5" />
                         {new Date(story.createdAt).toLocaleDateString('vi-VN')}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end relative h-10 w-24 ml-auto">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0">
                          <button
                            title="Chỉnh sửa"
                            onClick={() => navigate(`/stories/${story.id}/edit`)}
                            className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            title="Xóa câu chuyện"
                            onClick={() => setDeleteTarget(story)}
                            className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <MoreHorizontal className="h-5 w-5 text-gray-300 group-hover:hidden absolute right-2" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Xóa câu chuyện"
        description={`Bạn có chắc chắn muốn xóa câu chuyện "${deleteTarget?.title ?? ''}"? Hành động này không thể hoàn tác và dữ liệu sẽ mất vĩnh viễn.`}
        confirmText="Xác nhận xóa"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
