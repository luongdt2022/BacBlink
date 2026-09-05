import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Globe, Lock, Shield, Upload, X, File, Video, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { RichTextEditor } from '@/shared/ui/rich-text-editor'
import {
  getIntakeById,
  createIntake,
  updateIntake,
  getSectors,
  getCategories,
  deleteAttachment,
  type Intake,
  type Sector,
  type Category,
  type IntakeStatus,
  type IntakeAttachment,
  type AiProcessingStatus,
} from '@/services/intakeService'
import { IntakeFormSidebar } from '@/features/intakes/components/IntakeFormSidebar'

interface ExistingFile extends IntakeAttachment {
  isExisting: true
}

function isImageFile(file: ExistingFile): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif']
  const extension = file.fileName.split('.').pop()?.toLowerCase() ?? ''

  return (
    file.mimeType?.startsWith('image/') ||
    file.fileType?.startsWith('image') ||
    imageExtensions.includes(extension)
  )
}

function isVideoFile(file: ExistingFile): boolean {
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v']
  const extension = file.fileName.split('.').pop()?.toLowerCase() ?? ''

  return (
    file.mimeType?.startsWith('video/') ||
    file.fileType?.startsWith('video') ||
    videoExtensions.includes(extension)
  )
}

interface FileAttachmentsSectionProps {
  uploadedFiles: { id: string; file: File; type: string; preview: string }[]
  existingFiles: ExistingFile[]
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveNewFile: (id: string) => void
  onRemoveExistingFile: (attachmentId: string) => Promise<void>
}

function FileAttachmentsSection({
  uploadedFiles,
  existingFiles,
  onFileUpload,
  onRemoveNewFile,
  onRemoveExistingFile,
}: FileAttachmentsSectionProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null)

  const handleRequestRemoveExisting = (attachmentId: string) => {
    setPendingRemoveId(attachmentId)
    setShowRemoveConfirm(true)
  }

  const handleRequestRemoveNew = (fileId: string) => {
    setPendingRemoveId(fileId)
    setShowRemoveConfirm(true)
  }

  const handleConfirmRemove = async () => {
    if (!pendingRemoveId) return
    try {
      // Check if it's an existing file (has isExisting) or a new file
      const isExisting = existingFiles.some((f) => f.id === pendingRemoveId)
      if (isExisting) {
        await onRemoveExistingFile(pendingRemoveId)
      } else {
        onRemoveNewFile(pendingRemoveId)
      }
    } finally {
      setPendingRemoveId(null)
      setShowRemoveConfirm(false)
    }
  }

  return (
    <>
      <div className="bg-white">
        <div className="p-4">
          <h3 className="mb-1 text-sm font-medium text-gray-700">Tài liệu đính kèm</h3>
          <p className="mb-3 text-xs text-gray-500">
            Tải lên hình ảnh, video hoặc tài liệu (PDF, DOC, DOCX)
          </p>

          <div className="custom-scrollbar flex items-start gap-3 overflow-x-auto pb-2">
            {/* Upload Area */}
            <label className="hover:border-primary flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-50">
              <Upload className="mb-1 h-4 w-4 text-gray-400" />
              <span className="text-primary px-1 text-center text-[10px] leading-tight font-medium">
                Tải lên
              </span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={onFileUpload}
              />
            </label>

            {/* Existing Files */}
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="group relative flex h-20 w-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
              >
                {isImageFile(file) ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ src: file.filePath, name: file.fileName })}
                    className="h-full w-full"
                  >
                    <img
                      src={file.filePath}
                      alt={file.fileName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </button>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    {isVideoFile(file) ? (
                      <Video className="mb-2 h-6 w-6 text-indigo-500" />
                    ) : (
                      <File className="mb-2 h-6 w-6 text-gray-500" />
                    )}
                  </div>
                )}

                {/* File Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 p-1 backdrop-blur-sm">
                  <p className="truncate text-center text-[9px] font-medium text-gray-900">
                    {file.fileName}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRequestRemoveExisting(file.id)}
                  className="absolute top-1 right-1 rounded-full bg-white p-1 text-gray-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* New Uploaded Files */}
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="group relative flex h-20 w-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
              >
                {file.type === 'image' && file.preview ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ src: file.preview, name: file.file.name })}
                    className="h-full w-full"
                  >
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </button>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    {file.type === 'video' ? (
                      <Video className="mb-2 h-6 w-6 text-indigo-500" />
                    ) : file.file.name.toLowerCase().endsWith('.pdf') ? (
                      <File className="mb-2 h-6 w-6 text-red-500" />
                    ) : (
                      <FileText className="mb-2 h-6 w-6 text-primary" />
                    )}
                  </div>
                )}

                {/* File Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 p-1 backdrop-blur-sm">
                  <p className="truncate text-center text-[9px] font-medium text-gray-900">
                    {file.file.name}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRequestRemoveNew(file.id)}
                  className="absolute top-1 right-1 rounded-full bg-white p-1 text-gray-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        title="Xóa file"
        description="Bạn có chắc muốn xóa file này?"
        confirmText="Xóa"
        onConfirm={handleConfirmRemove}
        variant="danger"
      />
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{previewImage?.name ?? 'Xem ảnh đính kèm'}</DialogTitle>
            <DialogDescription>Preview ảnh đính kèm ở kích thước lớn.</DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="overflow-hidden rounded-xl bg-black/85">
              <img
                src={previewImage.src}
                alt={previewImage.name}
                className="max-h-[85vh] w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
        {previewImage && (
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="fixed top-4 right-4 z-[60] rounded-full bg-white/95 p-2 text-gray-700 shadow-md transition-colors hover:bg-white hover:text-black"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Đóng preview</span>
          </button>
        )}
      </Dialog>
    </>
  )
}

// ============================================== //
// Main Component                                //
// ============================================== //

interface IntakeFormPageProps {
  isEdit?: boolean
  intakeId?: string
  forcedType?: 'ip' | 'challenge'
  basePath?: string
}

export function IntakeFormPage({ isEdit = false, intakeId, forcedType, basePath = '/intakes' }: IntakeFormPageProps) {
  const navigate = useNavigate()
  const profileImageInputRef = useRef<HTMLInputElement>(null)

  // Sidebar state
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'ip' | 'challenge'>(forcedType ?? 'ip')
  const [sectorIds, setSectorIds] = useState<string[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [categoryId, setCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [existingProfileImageUrl, setExistingProfileImageUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<IntakeStatus>('draft')

  // Tab: Thông tin công khai
  const [content, setContent] = useState('')
  const [aiProcessedContent, setAiProcessedContent] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; file: File; type: string; preview: string }[]
  >([])
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])

  // Tab: Bảo mật mức 2
  const [confidentialLevel2Content, setConfidentialLevel2Content] = useState('')
  const [confidentialLevel2AiProcessedContent, setConfidentialLevel2AiProcessedContent] =
    useState('')
  const [uploadedFilesL2, setUploadedFilesL2] = useState<
    { id: string; file: File; type: string; preview: string }[]
  >([])
  const [existingFilesL2, setExistingFilesL2] = useState<ExistingFile[]>([])

  // Tab: Bảo mật mức 3
  const [confidentialLevel3Content, setConfidentialLevel3Content] = useState('')
  const [confidentialLevel3AiProcessedContent, setConfidentialLevel3AiProcessedContent] =
    useState('')
  const [uploadedFilesL3, setUploadedFilesL3] = useState<
    { id: string; file: File; type: string; preview: string }[]
  >([])
  const [existingFilesL3, setExistingFilesL3] = useState<ExistingFile[]>([])

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [aiProcessingStatus, setAiProcessingStatus] = useState<AiProcessingStatus>(null)

  const showAiProcessedContent =
    isEdit ||
    aiProcessingStatus === 'completed' ||
    (aiProcessingStatus as string | null) === 'COMPLETED'

  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const populateFormFromIntake = (data: Intake) => {
    setProfileImageFile(null)
    setProfileImagePreview(null)
    setExistingProfileImageUrl(null)
    setUploadedFiles([])
    setExistingFiles([])
    setUploadedFilesL2([])
    setExistingFilesL2([])
    setUploadedFilesL3([])
    setExistingFilesL3([])
    setSectorIds([])
    setTitle(data.title)
    setType(data.type)
    setStatus(data.status || 'draft')
    setContent(data.content || '')
    setAiProcessedContent(data.aiProcessedContent || '')
    setAiProcessingStatus(data.aiProcessingStatus ?? null)

    if (data.profilePicUrl) {
      setExistingProfileImageUrl(data.profilePicUrl)
    }

    if (data.intakeSectors?.length) {
      setSectorIds(data.intakeSectors.map((s) => s.sectorId))
    }

    if (data.category?.id) {
      setCategoryId(data.category.id)
    }

    if (data.confidentialLevel2Content) {
      setConfidentialLevel2Content(data.confidentialLevel2Content)
    }
    if (data.confidentialLevel2AiProcessedContent) {
      setConfidentialLevel2AiProcessedContent(data.confidentialLevel2AiProcessedContent)
    }
    if (data.confidentialLevel3Content) {
      setConfidentialLevel3Content(data.confidentialLevel3Content)
    }
    if (data.confidentialLevel3AiProcessedContent) {
      setConfidentialLevel3AiProcessedContent(data.confidentialLevel3AiProcessedContent)
    }

    if (data.attachments && data.attachments.length > 0) {
      const publicAttachments = data.attachments.filter(
        (att) => !att.confidentialLevel && att.fileType !== 'profile_picture'
      )
      const level2Attachments = data.attachments.filter((att) => att.confidentialLevel === 'level2')
      const level3Attachments = data.attachments.filter((att) => att.confidentialLevel === 'level3')

      setExistingFiles(publicAttachments.map((att) => ({ ...att, isExisting: true as const })))
      setExistingFilesL2(level2Attachments.map((att) => ({ ...att, isExisting: true as const })))
      setExistingFilesL3(level3Attachments.map((att) => ({ ...att, isExisting: true as const })))
    }
  }

  const refreshIntakeData = async () => {
    if (!isEdit || !intakeId) return

    const intakeData = await getIntakeById(intakeId)
    populateFormFromIntake(intakeData)
  }

  // Load data for edit mode
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const [sectorsData, categoriesData] = await Promise.all([getSectors(), getCategories()])
        setSectors(sectorsData)
        setCategories(categoriesData)

        if (isEdit && intakeId) {
          const data = await getIntakeById(intakeId)
          populateFormFromIntake(data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Có lỗi khi tải dữ liệu')
        navigateRef.current(basePath)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [isEdit, intakeId])

  // File upload handler (shared for all levels)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setUploaded: React.Dispatch<
      React.SetStateAction<{ id: string; file: File; type: string; preview: string }[]>
    >
  ) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files).map((file) => {
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document'
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileType,
        preview: fileType === 'image' ? URL.createObjectURL(file) : '',
      }
    })

    setUploaded((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  // Remove existing file (from server)
  const removeExistingFile = async (attachmentId: string) => {
    if (!intakeId) return
    try {
      await deleteAttachment(intakeId, attachmentId)
      setExistingFiles((prev) => prev.filter((f) => f.id !== attachmentId))
      toast.success('Đã xóa file')
    } catch {
      toast.error('Có lỗi khi xóa file')
    }
  }

  const removeExistingFileL2 = async (attachmentId: string) => {
    if (!intakeId) return
    try {
      await deleteAttachment(intakeId, attachmentId)
      setExistingFilesL2((prev) => prev.filter((f) => f.id !== attachmentId))
      toast.success('Đã xóa file')
    } catch {
      toast.error('Có lỗi khi xóa file')
    }
  }

  const removeExistingFileL3 = async (attachmentId: string) => {
    if (!intakeId) return
    try {
      await deleteAttachment(intakeId, attachmentId)
      setExistingFilesL3((prev) => prev.filter((f) => f.id !== attachmentId))
      toast.success('Đã xóa file')
    } catch {
      toast.error('Có lỗi khi xóa file')
    }
  }

  // Profile image handlers
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    setProfileImageFile(file)
    setProfileImagePreview(URL.createObjectURL(file))
    setExistingProfileImageUrl(null)
  }

  const removeProfileImage = () => {
    setProfileImageFile(null)
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview)
    }
    setProfileImagePreview(null)
    setExistingProfileImageUrl(null)
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = ''
    }
  }

  // Sector handling
  const handleSectorChange = (sectorId: string, checked: boolean) => {
    if (checked) {
      setSectorIds((prev) => [...prev, sectorId])
    } else {
      setSectorIds((prev) => prev.filter((id) => id !== sectorId))
    }
  }

  // Type handling
  const handleTypeChange = (newType: 'ip' | 'challenge') => {
    setType(newType)
  }

  const buildRequestData = () => {
    return {
      title,
      content,
      aiProcessedContent,
      type,
      status,
      avatar: profileImageFile ?? undefined,
      sectorIds: sectorIds.length > 0 ? sectorIds : undefined,
      categoryId: categoryId || null,
      attachments: uploadedFiles.map((f) => f.file),
      confidentialLevel2Content: confidentialLevel2Content || undefined,
      confidentialLevel2AiProcessedContent: confidentialLevel2AiProcessedContent || undefined,
      confidentialLevel2Attachments: uploadedFilesL2.map((f) => f.file),
      confidentialLevel3Content: confidentialLevel3Content || undefined,
      confidentialLevel3AiProcessedContent: confidentialLevel3AiProcessedContent || undefined,
      confidentialLevel3Attachments: uploadedFilesL3.map((f) => f.file),
    }
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }

    try {
      setIsSubmitting(true)
      const requestData = buildRequestData()
      requestData.status = 'draft'
      if (isEdit && intakeId) {
        await updateIntake(intakeId, requestData)
        await refreshIntakeData()
        toast.success('Đã lưu nháp thành công. Đang chờ AI xử lý nội dung.', {
          duration: 5000,
        })
      } else {
        await createIntake(requestData)
        toast.success('Đã lưu nháp thành công. Đang chờ AI xử lý nội dung.', {
          duration: 5000,
        })
        navigateRef.current(basePath)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }

    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung công khai')
      return
    }

    try {
      setIsSubmitting(true)
      const requestData = buildRequestData()
      requestData.status = 'published'
      if (isEdit && intakeId) {
        await updateIntake(intakeId, requestData)
        await refreshIntakeData()
        toast.success('Đã công bố thông tin thành công. Đang chờ AI xử lý nội dung.', {
          duration: 5000,
        })
      } else {
        await createIntake(requestData)
        toast.success('Đã công bố thông tin thành công. Đang chờ AI xử lý nội dung.', {
          duration: 5000,
        })
        navigateRef.current(basePath)
      }
    } catch (error) {
      console.error('Error publishing:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProfileImageSrc = () => {
    if (profileImagePreview) return profileImagePreview
    if (existingProfileImageUrl) return existingProfileImageUrl
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-3">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="flex h-[calc(100vh-0px)]">
        {/* Sidebar */}
        <IntakeFormSidebar
          isEdit={isEdit}
          title={title}
          setTitle={setTitle}
          type={type}
          setType={setType}
          forcedType={forcedType}
          basePath={basePath}
          sectors={sectors}
          sectorIds={sectorIds}
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          profileImagePreview={profileImagePreview}
          existingProfileImageUrl={existingProfileImageUrl}
          status={status}
          navigate={navigate}
          isSubmitting={isSubmitting}
          profileImageInputRef={profileImageInputRef}
          handleProfileImageChange={handleProfileImageChange}
          handleSectorChange={handleSectorChange}
          handleTypeChange={handleTypeChange}
          handleSaveDraft={handleSaveDraft}
          handlePublish={handlePublish}
          getProfileImageSrc={getProfileImageSrc}
          onRemoveProfileImage={removeProfileImage}
        />

        {/* ============================================== */}
        {/* MAIN CONTENT - 3 Tabs                       */}
        {/* ============================================== */}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0 bg-gray-50">
          <div className="flex flex-col h-full min-h-0">
            <Tabs defaultValue="public" className="flex flex-col flex-1 min-h-0">
              {/* Tab List */}
              <div className="bg-white px-4 pt-4 shrink-0">
                <TabsList className="bg-gray-100 h-auto p-1 rounded-xl">
                  <TabsTrigger
                    value="public"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5 px-4 py-2 rounded-lg"
                  >
                    <Globe className="w-4 h-4" />
                    Thông tin công khai
                  </TabsTrigger>
                  <TabsTrigger
                    value="level2"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5 px-4 py-2 rounded-lg"
                  >
                    <Lock className="w-4 h-4" />
                    Bảo mật mức 2
                  </TabsTrigger>
                  <TabsTrigger
                    value="level3"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5 px-4 py-2 rounded-lg"
                  >
                    <Shield className="w-4 h-4" />
                    Bảo mật mức 3
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Thông tin công khai */}
              <TabsContent value="public" className="flex-1 flex flex-col overflow-hidden mt-2">
                {/* Nội dung gốc */}
                <div className="flex flex-col min-h-0 flex-1">
                  <div className="p-4 bg-white shrink-0">
                    <h3 className="text-sm font-medium text-gray-700">Nội dung gốc</h3>
                  </div>
                  <div className="flex-1 overflow-auto px-4">
                    <div className="bg-white h-full rounded-lg border border-gray-200 overflow-hidden">
                      <RichTextEditor
                        value={content}
                        onChange={(val) => setContent(val || '')}
                        placeholder="Gõ '/' để chèn block, hoặc bắt đầu nhập nội dung..."
                        className="!min-h-[300px]"
                      />
                    </div>
                  </div>
                </div>

                {showAiProcessedContent && (
                  <div className="flex flex-col min-h-0 flex-1">
                    <div className="p-4 bg-white shrink-0">
                      <h3 className="text-sm font-medium text-gray-700">Nội dung sau xử lý</h3>
                    </div>
                    <div className="flex-1 overflow-auto px-4">
                      <div className="bg-white h-full rounded-lg border border-gray-200 overflow-hidden">
                        <RichTextEditor
                          value={aiProcessedContent}
                          onChange={(val) => setAiProcessedContent(val || '')}
                          placeholder="Nội dung sau khi được xử lý ..."
                          className="!min-h-[300px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tài liệu đính kèm */}
                <FileAttachmentsSection
                  uploadedFiles={uploadedFiles}
                  existingFiles={existingFiles}
                  onFileUpload={(e) => handleFileUpload(e, setUploadedFiles)}
                  onRemoveNewFile={(id) =>
                    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
                  }
                  onRemoveExistingFile={removeExistingFile}
                />
              </TabsContent>

              {/* TAB 2: Bảo mật mức 2 */}
              <TabsContent value="level2" className="flex-1 flex flex-col overflow-hidden mt-2">
                {/* Nội dung gốc */}
                <div className="flex flex-col min-h-0 flex-1">
                  <div className="p-4 bg-white shrink-0">
                    <h3 className="text-sm font-medium text-gray-700">Nội dung gốc</h3>
                  </div>
                  <div className="flex-1 overflow-auto px-4">
                    <div className="bg-white h-full rounded-lg border border-gray-200 overflow-hidden">
                      <RichTextEditor
                        value={confidentialLevel2Content}
                        onChange={(val) => setConfidentialLevel2Content(val || '')}
                        placeholder="Nhập nội dung bảo mật mức độ 2..."
                        className="!min-h-[300px]"
                      />
                    </div>
                  </div>
                </div>

                {showAiProcessedContent && (
                  <div className="flex flex-col min-h-0 flex-1">
                    <div className="p-4 bg-white shrink-0">
                      <h3 className="text-sm font-medium text-gray-700">Nội dung sau xử lý</h3>
                    </div>
                    <div className="flex-1 overflow-auto px-4">
                      <div className="bg-white h-full rounded-lg border border-gray-200 overflow-hidden">
                        <RichTextEditor
                          value={confidentialLevel2AiProcessedContent}
                          onChange={(val) => setConfidentialLevel2AiProcessedContent(val || '')}
                          placeholder="Nội dung sau khi được xử lý..."
                          className="!min-h-[300px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tài liệu đính kèm */}
                <FileAttachmentsSection
                  uploadedFiles={uploadedFilesL2}
                  existingFiles={existingFilesL2}
                  onFileUpload={(e) => handleFileUpload(e, setUploadedFilesL2)}
                  onRemoveNewFile={(id) =>
                    setUploadedFilesL2((prev) => prev.filter((f) => f.id !== id))
                  }
                  onRemoveExistingFile={removeExistingFileL2}
                />
              </TabsContent>

              {/* TAB 3: Bảo mật mức 3 */}
              <TabsContent value="level3" className="flex-1 flex flex-col overflow-hidden mt-2">
                {/* Nội dung gốc */}
                <div className="flex flex-col min-h-0 flex-1">
                  <div className="p-4 bg-white shrink-0">
                    <h3 className="text-sm font-medium text-gray-700">Nội dung gốc</h3>
                  </div>
                  <div className="flex-1 overflow-auto px-4">
                    <div className="bg-white h-full rounded-lg border border-gray-200 overflow-hidden">
                      <RichTextEditor
                        value={confidentialLevel3Content}
                        onChange={(val) => setConfidentialLevel3Content(val || '')}
                        placeholder="Nhập nội dung bảo mật mức độ 3..."
                        className="!min-h-[300px]"
                      />
                    </div>
                  </div>
                </div>

                {showAiProcessedContent && (
                  <div className="flex flex-col min-h-0 flex-1">
                    <div className="p-4 bg-white shrink-0">
                      <h3 className="text-sm font-medium text-gray-700">Nội dung sau xử lý</h3>
                    </div>
                    <div className="flex-1 overflow-auto px-4">
                      <div className="bg-white h-full rounded-lg border border-gray-200 overflow-hidden">
                        <RichTextEditor
                          value={confidentialLevel3AiProcessedContent}
                          onChange={(val) => setConfidentialLevel3AiProcessedContent(val || '')}
                          placeholder="Nội dung sau khi được xử lý..."
                          className="!min-h-[300px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tài liệu đính kèm */}
                <FileAttachmentsSection
                  uploadedFiles={uploadedFilesL3}
                  existingFiles={existingFilesL3}
                  onFileUpload={(e) => handleFileUpload(e, setUploadedFilesL3)}
                  onRemoveNewFile={(id) =>
                    setUploadedFilesL3((prev) => prev.filter((f) => f.id !== id))
                  }
                  onRemoveExistingFile={removeExistingFileL3}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
