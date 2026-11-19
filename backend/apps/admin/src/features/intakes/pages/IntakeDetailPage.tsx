import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  ChevronLeft,
  FileText,
  Lightbulb,
  Calendar,
  Tag,
  Image,
  Download,
  Paperclip,
  Lock,
  Shield,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import { ViewOnlyMDX } from '@/shared/ui/view-only-mdx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { getIntakeById, deleteIntake, type Intake } from '@/services/intakeService'
import { formatDateTimeFull } from '@/lib/utils'
import { AiProcessingBadge } from '@/features/intakes/components/AiProcessingBadge'

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

interface IntakeDetailPageProps {
  basePath?: string
}

export function IntakeDetailPage({ basePath = '/intakes' }: IntakeDetailPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [intake, setIntake] = useState<Intake | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getAiStatusValue = (
    value: Intake['aiProcessingStatus'] | { status: string } | string | null | undefined
  ) => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'status' in value) {
      return value.status
    }
    return null
  }

  useEffect(() => {
    if (id) {
      loadIntake(id)
    }
  }, [id])

  const loadIntake = async (intakeId: string) => {
    try {
      setIsLoading(true)
      const data = await getIntakeById(intakeId)
      setIntake(data)
    } catch (error) {
      console.error('Error loading intake:', error)
      toast.error('Có lỗi khi tải thông tin tiếp nhận')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (!intake) return
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!intake) return

    try {
      setIsDeleting(true)
      await deleteIntake(intake.id)
      toast.success('Đã xóa thông tin thành công')
      navigate(basePath)
    } catch (error) {
      console.error('Error deleting intake:', error)
      toast.error('Có lỗi khi xóa thông tin')
    } finally {
      setIsDeleting(false)
    }
  }

  const isImageAttachment = (attachment: {
    fileType: string
    mimeType: string
    fileName: string
  }) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif']
    const ext = attachment.fileName.split('.').pop()?.toLowerCase() ?? ''
    return (
      attachment.mimeType?.startsWith('image/') ||
      attachment.fileType?.startsWith('image') ||
      imageExtensions.includes(ext)
    )
  }

  const formatFileSize = (fileSize: string | number): string => {
    const size = typeof fileSize === 'string' ? parseFloat(fileSize) : fileSize
    if (isNaN(size)) return '0 KB'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  // Filter attachments by type
  const publicAttachments =
    intake?.attachments?.filter(
      (att) => !att.confidentialLevel && att.fileType !== 'profile_picture'
    ) || []
  const level2Attachments =
    intake?.attachments?.filter((att) => att.confidentialLevel === 'level2') || []
  const level3Attachments =
    intake?.attachments?.filter((att) => att.confidentialLevel === 'level3') || []
  const aiStatusValue = getAiStatusValue(intake?.aiProcessingStatus)
  const showAiProcessedContent = aiStatusValue === 'completed' || aiStatusValue === 'COMPLETED'

  // Filter image and non-image attachments for each level
  const filterAttachments = (attachments: typeof publicAttachments) => {
    const images = attachments.filter(isImageAttachment)
    const files = attachments.filter((a) => !isImageAttachment(a))
    return { images, files }
  }

  const renderFileList = (attachments: typeof publicAttachments, levelName?: string) => {
    const { images, files } = filterAttachments(attachments)

    return (
      <div className="space-y-6">
        {/* Images */}
        {images.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Image className="h-4 w-4" />
              Hình ảnh
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
                        {levelName && <span className="text-primary ml-2">({levelName})</span>}
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

        {/* Other Files */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Paperclip className="h-4 w-4" />
              Tài liệu khác
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
                      {levelName && <span className="text-primary ml-2">({levelName})</span>}
                    </p>
                  </div>
                  {attachment.filePath && (
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 hover:bg-gray-100 hover:text-gray-700 text-gray-500"
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
          <p className="text-sm text-gray-500 italic">Không có tài liệu đính kèm</p>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="mt-3 text-gray-500">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!intake) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy thông tin tiếp nhận</p>
          <Button variant="link" onClick={() => navigate(basePath)} className="text-primary mt-2">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(basePath)}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Profile Picture */}
              {intake.profilePicUrl && (
                <div className="shrink-0">
                  <img
                    src={intake.profilePicUrl}
                    alt="Profile"
                    className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{intake.title}</h1>
                <div className="mt-2 flex items-center gap-4">
                  <Badge variant={intake.type === 'ip' ? 'default' : 'secondary'}>
                    {intake.type === 'ip' ? 'IP' : 'Challenge'}
                  </Badge>
                  <AiProcessingBadge
                    status={aiStatusValue}
                    hasContent={!!intake.aiProcessedContent}
                  />
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
                    <span>{formatDateTime(intake.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`${basePath}/edit?id=${intake.id}`)}>
                Chỉnh sửa
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - 2 columns: tabs (left) + info (right) */}
        <div className="grid grid-cols-5 gap-6">
          {/* Left Column - Tabs */}
          <div className="col-span-4 rounded-lg border border-gray-200 bg-white">
            <Tabs defaultValue="public" className="w-full">
              <div className="border-b border-gray-200 p-4">
                <TabsList className="h-auto rounded-xl bg-gray-100 p-1">
                  <TabsTrigger
                    value="public"
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Globe className="h-4 w-4" />
                    Thông tin công khai
                  </TabsTrigger>
                  <TabsTrigger
                    value="level2"
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Lock className="h-4 w-4" />
                    Bảo mật mức 2
                  </TabsTrigger>
                  <TabsTrigger
                    value="level3"
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Shield className="h-4 w-4" />
                    Bảo mật mức 3
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Public Tab */}
              <TabsContent value="public" className="space-y-6 p-4">
                {/* Content Section */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Nội dung gốc
                  </h2>
                  <ViewOnlyMDX value={intake.content} />
                </div>

                {/* AI Processed Content Section */}
                {showAiProcessedContent && intake.aiProcessedContent && (
                  <div>
                    <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                      Nội dung sau xử lý
                    </h2>
                    <ViewOnlyMDX value={intake.aiProcessedContent} />
                  </div>
                )}

                {/* Attachments Section */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Tài liệu đính kèm ({publicAttachments.length})
                  </h2>
                  {renderFileList(publicAttachments)}
                </div>
              </TabsContent>

              {/* Level 2 Tab */}
              <TabsContent value="level2" className="space-y-6 p-4">
                {/* Content Section */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Nội dung gốc - Bảo mật mức 2
                  </h2>
                  <ViewOnlyMDX value={intake.confidentialLevel2Content || ''} />
                </div>

                {/* AI Processed Content Section */}
                {showAiProcessedContent && intake.confidentialLevel2AiProcessedContent && (
                  <div>
                    <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                      Nội dung sau xử lý
                    </h2>
                    <ViewOnlyMDX value={intake.confidentialLevel2AiProcessedContent} />
                  </div>
                )}

                {/* Attachments Section */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Tài liệu đính kèm ({level2Attachments.length})
                  </h2>
                  {renderFileList(level2Attachments, 'Mức 2')}
                </div>
              </TabsContent>

              {/* Level 3 Tab */}
              <TabsContent value="level3" className="space-y-6 p-4">
                {/* Content Section */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Nội dung gốc - Bảo mật mức 3
                  </h2>
                  <ViewOnlyMDX value={intake.confidentialLevel3Content || ''} />
                </div>

                {/* AI Processed Content Section */}
                {showAiProcessedContent && intake.confidentialLevel3AiProcessedContent && (
                  <div>
                    <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                      Nội dung sau xử lý
                    </h2>
                    <ViewOnlyMDX value={intake.confidentialLevel3AiProcessedContent} />
                  </div>
                )}

                {/* Attachments Section */}
                <div>
                  <h2 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                    Tài liệu đính kèm ({level3Attachments.length})
                  </h2>
                  {renderFileList(level3Attachments, 'Mức 3')}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Info Panel */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-medium text-gray-700">Thông tin</h3>

            <div className="space-y-4">
              {/* Type */}
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
                  {intake.type === 'ip' ? 'IP' : 'Challenge'}
                </p>
              </div>

              {/* Category */}
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

              {/* Created At */}
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Ngày tạo</span>
                </div>
                <p className="pl-5 text-sm font-medium text-gray-900">
                  {formatDateTimeFull(intake.createdAt)}
                </p>
              </div>

              {/* Updated At */}
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Cập nhật lần cuối</span>
                </div>
                <p className="pl-5 text-sm font-medium text-gray-900">
                  {formatDateTimeFull(intake.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Xóa thông tin tiếp nhận"
        description="Bạn có chắc chắn muốn xóa thông tin tiếp nhận này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  )
}
