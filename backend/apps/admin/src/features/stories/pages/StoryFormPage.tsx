import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ChevronLeft, Save, X, Info, FileText, Settings, Lightbulb, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { RichTextEditor } from '@/shared/ui/rich-text-editor'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import {
  getStoryById,
  createStory,
  updateStory,
  type StoryType,
  type StoryStatus,
} from '@/services/storyService'

export function StoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<StoryType>('success')
  const [content, setContent] = useState('')
  const [lesson, setLesson] = useState('')
  const [status, setStatus] = useState<StoryStatus>('draft')

  useEffect(() => {
    if (!isEdit) return
    void (async () => {
      try {
        setIsLoading(true)
        const data = await getStoryById(id)
        setTitle(data.title)
        setType(data.type)
        setContent(data.content)
        setLesson(data.lesson ?? '')
        setStatus(data.status)
      } catch {
        toast.error('Không thể tải câu chuyện')
        navigate('/stories')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [id, isEdit, navigate])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) return toast.error('Vui lòng nhập tiêu đề')
    if (!content.trim()) return toast.error('Vui lòng nhập nội dung')
    if (type === 'failure' && !lesson.trim()) return toast.error('Vui lòng nhập bài học rút ra')

    try {
      setIsSaving(true)
      const payload = {
        title: title.trim(),
        type,
        content,
        lesson: type === 'failure' ? lesson : null,
        status,
      }
      if (isEdit) {
        await updateStory(id, payload)
        toast.success('Đã cập nhật câu chuyện')
      } else {
        await createStory(payload)
        toast.success('Đã tạo câu chuyện')
      }
      navigate('/stories')
    } catch {
      toast.error(isEdit ? 'Không thể cập nhật câu chuyện' : 'Không thể tạo câu chuyện')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Đang tải thông tin câu chuyện...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-var(--header-height))] bg-gray-50/50">
      <div className="flex-1 pb-24">
        <div className="mx-auto max-w-[1400px] p-6 space-y-8">
          {/* Navigation & Header */}
          <div className="space-y-6">
            <button
              onClick={() => navigate('/stories')}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Quay lại danh sách
            </button>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {isEdit ? 'Chỉnh sửa câu chuyện' : 'Tạo câu chuyện mới'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Cập nhật lại thông tin câu chuyện của bạn' : 'Chia sẻ những trải nghiệm quý báu của bạn với cộng đồng'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-9 space-y-6">
              <Card className="shadow-sm border-gray-200 overflow-hidden">
                <CardHeader className="bg-white border-b py-4 px-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Nội dung câu chuyện
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Tiêu đề câu chuyện <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề hấp dẫn cho câu chuyện của bạn..."
                      maxLength={255}
                      className="h-11 rounded-xl bg-white border-gray-200 focus:border-primary/30 focus:ring-primary/20"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Nội dung chi tiết <span className="text-red-500">*</span>
                    </Label>
                    <div className="min-h-[320px] overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                      <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Kể lại câu chuyện của bạn một cách chi tiết..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson (failure only) */}
              {type === 'failure' && (
                <Card className="shadow-sm border-orange-200 bg-orange-50/30 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <CardHeader className="bg-orange-50/50 border-b border-orange-100 py-4 px-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                      <Lightbulb className="h-5 w-5" />
                      Bài học rút ra
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="min-h-[200px] overflow-hidden rounded-xl border border-orange-200 bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all shadow-inner">
                      <RichTextEditor
                        value={lesson}
                        onChange={setLesson}
                        placeholder="Bạn đã rút ra được kinh nghiệm gì từ thất bại này?"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar Settings */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="shadow-sm border-gray-200 sticky top-6">
                <CardHeader className="bg-white border-b py-4 px-6">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-primary" />
                    Cấu hình
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Loại câu chuyện <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setType('success')}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                          type === 'success'
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${type === 'success' ? 'bg-primary/20' : 'bg-gray-100'}`}>
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Thành công</p>
                          <p className="text-[11px] opacity-80 leading-tight">Chia sẻ thành quả đạt được</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setType('failure')}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                          type === 'failure'
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${type === 'failure' ? 'bg-orange-200' : 'bg-gray-100'}`}>
                          <Lightbulb className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Thất bại</p>
                          <p className="text-[11px] opacity-80 leading-tight">Bài học kinh nghiệm quý giá</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-primary/5 p-3 rounded-lg flex gap-2 text-[11px] text-primary/80 border border-primary/10 italic">
                      <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <p>Câu chuyện của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Actions */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-md py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-[1400px] px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                status === 'draft'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lưu nháp
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                status === 'published'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Công khai
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/stories')}
              className="h-10 px-6 rounded-xl border-gray-200 font-medium"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={() => { void handleSubmit() }}
              disabled={isSaving}
              className="h-10 px-8 rounded-xl shadow-lg shadow-primary/20 font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu câu chuyện
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

