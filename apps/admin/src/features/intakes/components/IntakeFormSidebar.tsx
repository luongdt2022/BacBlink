import type { RefObject } from 'react'
import {
  Camera,
  ChevronLeft,
  FileText,
  Globe,
  Lightbulb,
  Save,
  X,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Checkbox } from '@/shared/ui/checkbox'
import type { Sector, Category, IntakeStatus } from '@/services/intakeService'

export interface IntakeFormSidebarProps {
  isEdit: boolean
  title: string
  setTitle: (value: string) => void
  type: 'ip' | 'challenge'
  setType: (value: 'ip' | 'challenge') => void
  forcedType?: 'ip' | 'challenge'
  basePath?: string
  sectors: Sector[]
  sectorIds: string[]
  categories: Category[]
  categoryId: string
  onCategoryChange: (id: string) => void
  profileImagePreview: string | null
  existingProfileImageUrl: string | null
  status: IntakeStatus
  navigate: (path: string) => void
  isSubmitting: boolean
  profileImageInputRef: RefObject<HTMLInputElement>
  handleProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSectorChange: (sectorId: string, checked: boolean) => void
  handleTypeChange: (newType: 'ip' | 'challenge') => void
  handleSaveDraft: () => void
  handlePublish: () => void
  getProfileImageSrc: () => string | null
  onRemoveProfileImage: () => void
}

export function IntakeFormSidebar({
  isEdit,
  title,
  setTitle,
  type,
  setType,
  forcedType,
  basePath = '/intakes',
  sectors,
  sectorIds,
  categories,
  categoryId,
  onCategoryChange,
  profileImagePreview,
  existingProfileImageUrl,
  status,
  navigate,
  isSubmitting,
  profileImageInputRef,
  handleProfileImageChange,
  handleSectorChange,
  handleTypeChange,
  handleSaveDraft,
  handlePublish,
  getProfileImageSrc,
  onRemoveProfileImage,
}: IntakeFormSidebarProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="p-4">
        <button
          onClick={() => navigate(basePath)}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Quay lại</span>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit
            ? forcedType === 'ip'
              ? 'Chỉnh sửa Cung'
              : forcedType === 'challenge'
                ? 'Chỉnh sửa Cầu'
                : 'Chỉnh sửa Cung & Cầu'
            : forcedType === 'ip'
              ? 'Tạo mới Cung'
              : forcedType === 'challenge'
                ? 'Tạo mới Cầu'
                : 'Tạo mới Cung & Cầu'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {isEdit
            ? forcedType === 'ip'
              ? 'Cập nhật thông tin về Cung'
              : forcedType === 'challenge'
                ? 'Cập nhật thông tin về Cầu'
                : 'Cập nhật thông tin về Cung hoặc Cầu'
            : forcedType === 'ip'
              ? 'Nhập thông tin để quản lý Cung'
              : forcedType === 'challenge'
                ? 'Nhập thông tin để quản lý Cầu'
                : 'Nhập thông tin để quản lý Cung hoặc Cầu'}
        </p>

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

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="group flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary"
              onClick={() => profileImageInputRef.current?.click()}
            >
              {getProfileImageSrc() ? (
                <img
                  src={getProfileImageSrc()!}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}

              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            {getProfileImageSrc() && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveProfileImage()
                }}
                className="absolute -right-1 -top-1 rounded-full bg-white p-1 text-gray-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
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

        {!forcedType && (
          <div>
            <Label className="text-sm font-medium">
              Loại <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('ip')
                  handleTypeChange('ip')
                }}
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
                onClick={() => {
                  setType('challenge')
                  handleTypeChange('challenge')
                }}
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

        <div>
          <Label className="text-sm font-medium">Danh mục</Label>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-200 p-4">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Đang lưu...' : 'Lưu nháp'}
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Globe className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Đang công bố...' : 'Công bố'}
        </Button>
      </div>
    </aside>
  )
}
