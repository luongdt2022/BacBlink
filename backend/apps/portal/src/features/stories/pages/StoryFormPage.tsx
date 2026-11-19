import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FileText, Lightbulb, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { ResponsivePageSection } from '@/shared/components/layout/ResponsivePageSection';
import {
  createStory,
  updateStory,
  getStoryById,
  type StoryType,
  type StoryStatus,
} from '../api/story';

interface StoryFormPageProps {
  storyId?: string;
  isEdit?: boolean;
  backPath?: string;
}

export function StoryFormPage({ storyId, isEdit = false, backPath = '/stories' }: StoryFormPageProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<StoryType>('success');
  const [content, setContent] = useState('');
  const [lesson, setLesson] = useState('');
  const [status, setStatus] = useState<StoryStatus>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !storyId) return;
    void (async () => {
      try {
        setIsLoading(true);
        const data = await getStoryById(storyId);
        setTitle(data.title);
        setType(data.type);
        setContent(data.content);
        setLesson(data.lesson ?? '');
        setStatus(data.status);
      } catch {
        toast.error('Không thể tải thông tin câu chuyện');
        navigate(backPath);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isEdit, storyId, navigate, backPath]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung câu chuyện');
      return;
    }
    if (type === 'failure' && !lesson.trim()) {
      toast.error('Vui lòng nhập bài học rút ra');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        type,
        content,
        lesson: type === 'failure' ? lesson : null,
        status,
      };

      if (isEdit && storyId) {
        await updateStory(storyId, payload);
        toast.success('Đã cập nhật câu chuyện');
      } else {
        await createStory(payload);
        toast.success('Đã tạo câu chuyện thành công');
      }
      navigate(backPath);
    } catch {
      toast.error(isEdit ? 'Không thể cập nhật câu chuyện' : 'Không thể tạo câu chuyện');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height))] items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col bg-gray-50/50">
      <div className="flex-1">
        <div className="responsive-page-container py-8">
          {/* Header section */}
          <div className="mb-8">
            <button
              onClick={() => navigate(backPath)}
              className="mb-6 inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Quay lại danh sách</span>
            </button>
            
            <div className="flex items-center gap-3">
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

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Main form fields */}
            <div className="lg:col-span-3 space-y-6">
              <ResponsivePageSection className="p-6">
                <div className="space-y-6">
                  {/* Tiêu đề */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Tiêu đề câu chuyện <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="h-11 bg-white border-gray-200 focus:border-primary/30 focus:ring-primary/20"
                      placeholder="Nhập tiêu đề hấp dẫn cho câu chuyện của bạn..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={255}
                    />
                  </div>

                  {/* Nội dung chính */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Nội dung chi tiết <span className="text-red-500">*</span>
                    </Label>
                    <div className="min-h-[320px] overflow-hidden rounded-xl border border-gray-200 bg-white ring-offset-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0 transition-all">
                      <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Kể lại câu chuyện của bạn một cách chi tiết..."
                      />
                    </div>
                  </div>
                </div>
              </ResponsivePageSection>

              {/* Bài học rút ra (chỉ khi type=failure) */}
              {type === 'failure' && (
                <ResponsivePageSection className="p-6 border-orange-100 bg-orange-50/30">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Lightbulb className="h-5 w-5" />
                      <Label className="text-sm font-semibold">
                        Bài học rút ra <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="min-h-[200px] overflow-hidden rounded-xl border border-orange-200 bg-white ring-offset-background focus-within:ring-2 focus-within:ring-orange-200 focus-within:ring-offset-0 transition-all">
                      <RichTextEditor
                        value={lesson}
                        onChange={setLesson}
                        placeholder="Bạn đã rút ra được kinh nghiệm gì từ thất bại này?"
                      />
                    </div>
                  </div>
                </ResponsivePageSection>
              )}
            </div>

            {/* Sidebar settings */}
            <div className="space-y-6">
              <ResponsivePageSection className="p-5">
                <div className="space-y-5">
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
                    <p className="text-[11px] text-gray-400 leading-relaxed italic">
                      * Các trường đánh dấu đỏ là bắt buộc. Câu chuyện của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.
                    </p>
                  </div>
                </div>
              </ResponsivePageSection>
            </div>
          </div>
        </div>
        
        {/* Spacer to prevent fixed bar from covering content */}
        <div className="h-20" />
      </div>

      {/* Bottom bar: fixed for guaranteed visibility, using sidebar width variable for desktop offset */}
      <div className="fixed bottom-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-md py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 left-0 lg:left-[var(--sidebar-width)]">
        <div className="responsive-page-container !py-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
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
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
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
              onClick={() => navigate(backPath)}
              className="hidden sm:inline-flex h-8.5 px-4 rounded-lg border-gray-200 text-xs"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="h-8.5 px-6 rounded-lg shadow-lg shadow-primary/20 text-xs font-bold"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang lưu...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-3.5 w-3.5" />
                  <span>Lưu câu chuyện</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
