import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  FileText,
  Lightbulb,
  Upload,
  Save,
  Globe,
  Lock,
  Shield,
  X,
  File,
  Video,
  Camera,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { isImageFile, isVideoFile } from '@/shared/utils/file';
import {
  beautifyIntake,
  createIntake,
  deleteAttachment,
  getIntakeById,
  getSectors,
  getCategories,
  updateIntake,
  type Sector,
  type Category,
  type Intake,
  type IntakeStatus,
  type AiProcessingStatus,
  type IntakeType,
} from '../api/intake';
import { buildListPathByType } from '../utils/intakeRoutes';

interface UploadedFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document';
  preview?: string;
  isExisting?: boolean;
}

interface ExistingFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  fileSize: string;
  createdAt: string;
  confidentialLevel?: string | null;
  isExisting: true;
}

interface IntakeFormPageProps {
  isEdit?: boolean;
  intakeId?: string;
  forcedType?: IntakeType;
  backPath?: string;
  successPath?: string;
}

// ============================================== //
// Reusable File Attachments Section               //
// ============================================== //
interface FileAttachmentsSectionProps {
  uploadedFiles: UploadedFile[];
  existingFiles: ExistingFile[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveNewFile: (id: string) => void;
  onRemoveExistingFile: (attachmentId: string) => Promise<void>;
}

function FileAttachmentsSection({
  uploadedFiles,
  existingFiles,
  onFileUpload,
  onRemoveNewFile,
  onRemoveExistingFile,
}: FileAttachmentsSectionProps) {
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);

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
                  onClick={() => onRemoveExistingFile(file.id)}
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
                    onClick={() => setPreviewImage({ src: file.preview!, name: file.file.name })}
                    className="h-full w-full"
                  >
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </button>
                ) : (
                  <>
                    {file.type === 'video' && <Video className="mb-2 h-6 w-6 text-indigo-500" />}
                    {file.type === 'document' && file.file.name.toLowerCase().endsWith('.pdf') && (
                      <File className="mb-2 h-6 w-6 text-red-500" />
                    )}
                    {file.type === 'document' &&
                      file.file.name.toLowerCase().match(/\.(doc|docx)$/) && (
                        <FileText className="text-primary mb-2 h-6 w-6" />
                      )}
                  </>
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
                  onClick={() => onRemoveNewFile(file.id)}
                  className="absolute top-1 right-1 rounded-full bg-white p-1 text-gray-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  );
}

export function IntakeFormPage({
  isEdit = false,
  intakeId,
  forcedType,
  backPath,
  successPath,
}: IntakeFormPageProps) {
  const navigate = useNavigate();
  const resolvedBackPath = backPath ?? buildListPathByType(forcedType ?? 'ip');
  const resolvedSuccessPath = successPath ?? resolvedBackPath;

  // Shared form state (sidebar)
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IntakeType>(forcedType ?? 'ip');
  const [sectorIds, setSectorIds] = useState<string[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<IntakeStatus>('draft');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [existingProfileImageUrl, setExistingProfileImageUrl] = useState<string | null>(null);

  // Tab: Thông tin công khai
  const [content, setContent] = useState('');
  const [aiProcessedContent, setAiProcessedContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);

  // Tab: Bảo mật mức 2
  const [confidentialLevel2Content, setConfidentialLevel2Content] = useState('');
  const [confidentialLevel2AiProcessedContent, setConfidentialLevel2AiProcessedContent] =
    useState('');
  const [uploadedFilesL2, setUploadedFilesL2] = useState<UploadedFile[]>([]);
  const [existingFilesL2, setExistingFilesL2] = useState<ExistingFile[]>([]);

  // Tab: Bảo mật mức 3
  const [confidentialLevel3Content, setConfidentialLevel3Content] = useState('');
  const [confidentialLevel3AiProcessedContent, setConfidentialLevel3AiProcessedContent] =
    useState('');
  const [uploadedFilesL3, setUploadedFilesL3] = useState<UploadedFile[]>([]);
  const [existingFilesL3, setExistingFilesL3] = useState<ExistingFile[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [aiProcessingStatus, setAiProcessingStatus] = useState<AiProcessingStatus>(null);
  const [aiContentEditorKey, setAiContentEditorKey] = useState(0);

  const showAiProcessedContent = aiProcessingStatus === 'completed';
  const isTypeLocked = !!forcedType;

  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Cleanup Object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
      uploadedFiles.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      uploadedFilesL2.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      uploadedFilesL3.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data for edit mode
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeId]);

  useEffect(() => {
    if (forcedType) {
      setType(forcedType);
    }
  }, [forcedType]);

  const refreshIntakeData = async () => {
    if (!isEdit || !intakeId) return;

    const intakeData = await getIntakeById(intakeId);
    populateFormFromIntake(intakeData);
  };

  const loadInitialData = async () => {
    try {
      const [sectorsData, categoriesData] = await Promise.all([getSectors(), getCategories()]);
      setSectors(sectorsData);
      setCategories(categoriesData);

      if (isEdit && intakeId) {
        const intakeData = await getIntakeById(intakeId);
        populateFormFromIntake(intakeData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Có lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const populateFormFromIntake = (data: Intake) => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setExistingProfileImageUrl(null);
    setUploadedFiles([]);
    setExistingFiles([]);
    setUploadedFilesL2([]);
    setExistingFilesL2([]);
    setUploadedFilesL3([]);
    setExistingFilesL3([]);
    setSectorIds([]);
    setTitle(data.title);
    if (forcedType && data.type !== forcedType) {
      toast.error('Dữ liệu không thuộc loại phù hợp với route hiện tại');
      navigate(resolvedBackPath, { replace: true });
      return;
    }
    setType(forcedType ?? data.type);
    setStatus(data.status || 'draft');
    setContent(data.content || '');
    setAiProcessedContent(data.aiProcessedContent || '');
    setAiProcessingStatus(data.aiProcessingStatus ?? null);

    // Profile picture
    if (data.profilePicUrl) {
      setExistingProfileImageUrl(data.profilePicUrl);
    }

    // Sectors
    if (data.intakeSectors && data.intakeSectors.length > 0) {
      setSectorIds(data.intakeSectors.map((s) => s.sectorId));
    }

    // Category
    if (data.category?.id) {
      setCategoryId(data.category.id);
    }

    // Existing files - filter by confidentialLevel and fileType
    if (data.attachments && data.attachments.length > 0) {
      // Public files (confidentialLevel = null, not profile_picture)
      const publicAttachments = data.attachments.filter(
        (att) => !att.confidentialLevel && att.fileType !== 'profile_picture'
      );
      setExistingFiles(
        publicAttachments.map((att) => ({
          id: att.id,
          fileName: att.fileName,
          filePath: att.filePath,
          fileType: att.fileType,
          mimeType: att.mimeType,
          fileSize: att.fileSize,
          createdAt: att.createdAt,
          isExisting: true,
        }))
      );

      // Level 2 files
      const level2Attachments = data.attachments.filter(
        (att) => att.confidentialLevel === 'level2'
      );
      setExistingFilesL2(
        level2Attachments.map((att) => ({
          id: att.id,
          fileName: att.fileName,
          filePath: att.filePath,
          fileType: att.fileType,
          mimeType: att.mimeType,
          fileSize: att.fileSize,
          createdAt: att.createdAt,
          isExisting: true,
        }))
      );

      // Level 3 files
      const level3Attachments = data.attachments.filter(
        (att) => att.confidentialLevel === 'level3'
      );
      setExistingFilesL3(
        level3Attachments.map((att) => ({
          id: att.id,
          fileName: att.fileName,
          filePath: att.filePath,
          fileType: att.fileType,
          mimeType: att.mimeType,
          fileSize: att.fileSize,
          createdAt: att.createdAt,
          isExisting: true,
        }))
      );
    }

    // Confidential level 2
    if (data.confidentialLevel2Content) {
      setConfidentialLevel2Content(data.confidentialLevel2Content);
    }
    if (data.confidentialLevel2AiProcessedContent) {
      setConfidentialLevel2AiProcessedContent(data.confidentialLevel2AiProcessedContent);
    }

    // Confidential level 3
    if (data.confidentialLevel3Content) {
      setConfidentialLevel3Content(data.confidentialLevel3Content);
    }
    if (data.confidentialLevel3AiProcessedContent) {
      setConfidentialLevel3AiProcessedContent(data.confidentialLevel3AiProcessedContent);
    }
  };

  // Profile image handling
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setExistingProfileImageUrl(null);
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImagePreview(null);
    setExistingProfileImageUrl(null);
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = '';
    }
  };

  // Sector handling
  const handleSectorChange = (sectorId: string, checked: boolean) => {
    if (checked) {
      setSectorIds((prev) => [...prev, sectorId]);
    } else {
      setSectorIds((prev) => prev.filter((id) => id !== sectorId));
    }
  };

  // Type handling
  const handleTypeChange = (newType: IntakeType) => {
    if (isTypeLocked) return;
    setType(newType);
  };

  // File upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const fileType: 'image' | 'video' | 'document' = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document';

      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileType,
      };

      if (fileType === 'image') {
        newFile.preview = URL.createObjectURL(file);
      }

      setUploadedFiles((prev) => [...prev, newFile]);
    });

    e.target.value = '';
  };

  const handleFileUploadL2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const fileType: 'image' | 'video' | 'document' = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document';
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileType,
      };
      if (fileType === 'image') newFile.preview = URL.createObjectURL(file);
      setUploadedFilesL2((prev) => [...prev, newFile]);
    });
    e.target.value = '';
  };

  const removeNewFileL2 = (id: string) => {
    setUploadedFilesL2((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleFileUploadL3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const fileType: 'image' | 'video' | 'document' = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document';
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileType,
      };
      if (fileType === 'image') newFile.preview = URL.createObjectURL(file);
      setUploadedFilesL3((prev) => [...prev, newFile]);
    });
    e.target.value = '';
  };

  const removeNewFileL3 = (id: string) => {
    setUploadedFilesL3((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const removeNewFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const removeExistingFile = async (attachmentId: string) => {
    try {
      if (!intakeId) return;
      await deleteAttachment(intakeId, attachmentId);
      setExistingFiles((prev) => prev.filter((f) => f.id !== attachmentId));
      toast.success('Đã xóa tệp đính kèm');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Có lỗi khi xóa tệp đính kèm');
    }
  };

  const removeExistingFileL2 = async (attachmentId: string) => {
    try {
      if (!intakeId) return;
      await deleteAttachment(intakeId, attachmentId);
      setExistingFilesL2((prev) => prev.filter((f) => f.id !== attachmentId));
      toast.success('Đã xóa tệp đính kèm');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Có lỗi khi xóa tệp đính kèm');
    }
  };

  const removeExistingFileL3 = async (attachmentId: string) => {
    try {
      if (!intakeId) return;
      await deleteAttachment(intakeId, attachmentId);
      setExistingFilesL3((prev) => prev.filter((f) => f.id !== attachmentId));
      toast.success('Đã xóa tệp đính kèm');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Có lỗi khi xóa tệp đính kèm');
    }
  };

  // Submit handlers
  const buildRequestData = () => {
    return {
      title,
      content,
      aiProcessedContent,
      type: forcedType ?? type,
      status,
      profilePicture: profileImageFile ?? undefined,
      sectorIds: sectorIds.length > 0 ? sectorIds : undefined,
      categoryId: categoryId || null,
      attachments: uploadedFiles.map((f) => f.file),
      confidentialLevel2Content: confidentialLevel2Content || undefined,
      confidentialLevel2AiProcessedContent: confidentialLevel2AiProcessedContent || undefined,
      confidentialLevel2Attachments: uploadedFilesL2.map((f) => f.file),
      confidentialLevel3Content: confidentialLevel3Content || undefined,
      confidentialLevel3AiProcessedContent: confidentialLevel3AiProcessedContent || undefined,
      confidentialLevel3Attachments: uploadedFilesL3.map((f) => f.file),
    };
  };

  const handleBeautify = async () => {
    if (!intakeId) return;
    const toastId = toast.loading('Hệ thống đang xử lý, vui lòng chờ giây lát...');
    setIsBeautifying(true);
    try {
      const result = await beautifyIntake(intakeId);
      // Apply returned data directly — no re-fetch needed, public endpoint omits these fields
      if (result.aiProcessedContent) setAiProcessedContent(result.aiProcessedContent);
      setAiProcessingStatus(result.aiProcessingStatus ?? 'completed');
      // Force-remount the AI content editor: MDXEditor is uncontrolled and ignores prop updates
      setAiContentEditorKey((k) => k + 1);
      toast.dismiss(toastId);
      toast.success('Làm đẹp dữ liệu thành công');
    } catch {
      toast.dismiss(toastId);
      toast.error('Không thể làm đẹp dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsBeautifying(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (status === 'published' && !content.trim()) {
      toast.error('Vui lòng nhập nội dung công khai');
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData = buildRequestData();

      if (status === 'draft') {
        if (isEdit && intakeId) {
          await updateIntake(intakeId, requestData);
          await refreshIntakeData();
          toast.success('Đã lưu nháp thành công. Đang chờ AI xử lý nội dung.', { duration: 5000 });
        } else {
          await createIntake(requestData);
          toast.success('Đã lưu nháp thành công. Đang chờ AI xử lý nội dung.', { duration: 5000 });
          navigate(resolvedSuccessPath);
        }
      } else {
        if (isEdit && intakeId) {
          // Preserve AI content before refresh: backend may auto-queue beautify and clear these fields
          const savedAiProcessedContent = aiProcessedContent;
          const savedAiProcessingStatus = aiProcessingStatus;
          await updateIntake(intakeId, requestData);
          await refreshIntakeData();
          if (savedAiProcessedContent) {
            setAiProcessedContent(savedAiProcessedContent);
            setAiProcessingStatus(savedAiProcessingStatus);
          }
          toast.success('Đã công bố thông tin thành công. Đang chờ AI xử lý nội dung.', {
            duration: 5000,
          });
        } else {
          await createIntake(requestData);
          toast.success('Đã công bố thông tin thành công. Đang chờ AI xử lý nội dung.', {
            duration: 5000,
          });
          navigate(resolvedSuccessPath);
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="mt-3 text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100svh-var(--header-height))] bg-gray-50">
      <div className="flex h-[calc(100svh-var(--header-height))]">
        <aside className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
          {/* Header */}
          <div className="p-4">
            <button
              onClick={() => navigate(resolvedBackPath)}
              className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">Quay lại</span>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Chỉnh sửa thông tin' : 'Tiếp nhận thông tin'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {type === 'challenge' ? 'Nhập thông tin về Cầu' : 'Nhập thông tin về Cung'}
            </p>

            {/* Status badge */}
            <div className="mt-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {status === 'published' ? 'Đã công bố' : 'Nháp'}
              </span>
            </div>
          </div>

          {/* Scrollable form fields */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="hover:border-primary group flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors"
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  {profileImagePreview || existingProfileImageUrl ? (
                    <img
                      src={profileImagePreview || existingProfileImageUrl || ''}
                      alt="Profile image"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Remove profile image button */}
                {(profileImagePreview || existingProfileImageUrl) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProfileImage();
                    }}
                    className="absolute -top-1 -right-1 rounded-full bg-white p-1 text-gray-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </div>
              <p className="mt-2 text-center text-xs text-gray-500">
                Ảnh đại diện
                <br />
                (tối đa 5MB)
              </p>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                className="mt-1.5"
              />
            </div>

            {/* Type */}
            {!isTypeLocked && (
              <div>
                <Label className="text-sm font-medium">
                  Loại <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('ip')}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      type === 'ip'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Cung
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('challenge')}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      type === 'challenge'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Lightbulb className="h-4 w-4" />
                    Cầu
                  </button>
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <Label className="text-sm font-medium">Danh mục</Label>
              <Select value={categoryId || ''} onValueChange={(val) => setCategoryId(val === '__none__' ? '' : val)}>
                <SelectTrigger className="mt-3 w-full border border-gray-300 bg-white shadow-sm focus-visible:border-gray-400 focus-visible:ring-0">
                  <SelectValue placeholder="-- Chọn danh mục --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="focus:bg-gray-100 focus:text-gray-900">-- Chọn danh mục --</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="focus:bg-gray-100 focus:text-gray-900">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 rounded-t-xl bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            {isEdit && intakeId && (
              <Button
                variant="outline"
                onClick={handleBeautify}
                disabled={isBeautifying || isSubmitting}
                className="w-full"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isBeautifying ? 'Đang xử lý...' : 'Làm đẹp dữ liệu'}
              </Button>
            )}
            {/* Status selector */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">Trạng thái</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    status === 'draft'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  Nháp
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    status === 'published'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Công khai
                </button>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSubmitting} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </aside>

        {/* ============================================== */}
        {/* MAIN CONTENT - 3 Tabs                       */}
        {/* ============================================== */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50">
          {/* Tabs wrapper — fills remaining height */}
          <div className="flex h-full min-h-0 flex-col">
            <Tabs defaultValue="public" className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 bg-white px-4 pt-4">
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

              <TabsContent value="public" className="mt-2 flex flex-1 flex-col overflow-hidden">
                {/* Nội dung gốc */}
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="shrink-0 bg-white p-4">
                    <h3 className="text-sm font-medium text-gray-700">Nội dung gốc</h3>
                  </div>
                  <div className="flex-1 overflow-auto px-4">
                    <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                  <>
                    {/* Nội dung sau xử lý */}
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="shrink-0 bg-white p-4">
                        <h3 className="text-sm font-medium text-gray-700">Nội dung sau xử lý</h3>
                      </div>
                      <div className="flex-1 overflow-auto px-4">
                        <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <RichTextEditor
                            key={aiContentEditorKey}
                            value={aiProcessedContent}
                            onChange={(val) => setAiProcessedContent(val || '')}
                            placeholder="Nội dung sau khi được xử lý ..."
                            className="!min-h-[300px]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Tài liệu đính kèm */}
                <FileAttachmentsSection
                  uploadedFiles={uploadedFiles}
                  existingFiles={existingFiles}
                  onFileUpload={handleFileUpload}
                  onRemoveNewFile={removeNewFile}
                  onRemoveExistingFile={removeExistingFile}
                />
              </TabsContent>

              {/* ============================================== */}
              {/* TAB 2: BẢO MẬT MỨC 2                         */}
              {/* ============================================== */}
              <TabsContent value="level2" className="mt-2 flex flex-1 flex-col overflow-hidden">
                {/* Nội dung gốc */}
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="shrink-0 bg-white p-4">
                    <h3 className="text-sm font-medium text-gray-700">Nội dung gốc</h3>
                  </div>
                  <div className="flex-1 overflow-auto px-4">
                    <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                  <>
                    {/* Nội dung sau xử lý */}
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="shrink-0 bg-white p-4">
                        <h3 className="text-sm font-medium text-gray-700">Nội dung sau xử lý</h3>
                      </div>
                      <div className="flex-1 overflow-auto px-4">
                        <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <RichTextEditor
                            value={confidentialLevel2AiProcessedContent}
                            onChange={(val) => setConfidentialLevel2AiProcessedContent(val || '')}
                            placeholder="Nội dung sau khi được xử lý..."
                            className="!min-h-[300px]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Tài liệu đính kèm */}
                <FileAttachmentsSection
                  uploadedFiles={uploadedFilesL2}
                  existingFiles={existingFilesL2}
                  onFileUpload={handleFileUploadL2}
                  onRemoveNewFile={removeNewFileL2}
                  onRemoveExistingFile={removeExistingFileL2}
                />
              </TabsContent>

              <TabsContent value="level3" className="mt-2 flex flex-1 flex-col overflow-hidden">
                {/* Nội dung gốc */}
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="shrink-0 bg-white p-4">
                    <h3 className="text-sm font-medium text-gray-700">Nội dung gốc</h3>
                  </div>
                  <div className="flex-1 overflow-auto px-4">
                    <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                  <>
                    {/* Nội dung sau xử lý */}
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="shrink-0 bg-white p-4">
                        <h3 className="text-sm font-medium text-gray-700">Nội dung sau xử lý</h3>
                      </div>
                      <div className="flex-1 overflow-auto px-4">
                        <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <RichTextEditor
                            value={confidentialLevel3AiProcessedContent}
                            onChange={(val) => setConfidentialLevel3AiProcessedContent(val || '')}
                            placeholder="Nội dung sau khi được xử lý..."
                            className="!min-h-[300px]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Tài liệu đính kèm */}
                <FileAttachmentsSection
                  uploadedFiles={uploadedFilesL3}
                  existingFiles={existingFilesL3}
                  onFileUpload={handleFileUploadL3}
                  onRemoveNewFile={removeNewFileL3}
                  onRemoveExistingFile={removeExistingFileL3}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
