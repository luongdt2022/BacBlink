import { useState } from 'react';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface CreateAssetPageProps {
  onNavigate?: (itemId: string) => void;
  onBack?: () => void;
}

interface AssetFormData {
  name: string;
  type: string;
  location: string;
  description: string;
  specs: string[];
  operatingHours: string;
  priceInfo: string;
  image: File | null;
}

export function CreateAssetPage({ onNavigate, onBack }: CreateAssetPageProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    type: '',
    location: '',
    description: '',
    specs: [''],
    operatingHours: '',
    priceInfo: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSpec = () => {
    setFormData({ ...formData, specs: [...formData.specs, ''] });
  };

  const handleRemoveSpec = (index: number) => {
    const newSpecs = formData.specs.filter((_, i) => i !== index);
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleSpecChange = (index: number, value: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index] = value;
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.type || !formData.location || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Filter out empty specs
    const validSpecs = formData.specs.filter((spec) => spec.trim() !== '');
    if (validSpecs.length === 0) {
      toast.error('Vui lòng thêm ít nhất một thông số kỹ thuật');
      return;
    }

    toast.success('Thiết bị đã được gửi đến Admin để duyệt. Vui lòng chờ phê duyệt.');
    // TODO: Send data to backend
    setTimeout(() => {
      onBack?.();
    }, 1500);
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="infrastructure" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb] p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Đăng ký Thiết bị mới</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chia sẻ thiết bị/phòng lab của bạn với cộng đồng nghiên cứu
          </p>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border bg-white p-6">
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Hình ảnh thiết bị
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-64 w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => {
                        setFormData({ ...formData, image: null });
                        setImagePreview(null);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-white p-2 text-muted-foreground shadow-lg transition-colors hover:text-[#dc2626]"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border bg-[#f9fafb] transition-colors hover:border-primary">
                    <Upload className="mb-3 size-8 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium text-foreground">
                      Tải lên hình ảnh
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG tối đa 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Tên thiết bị/Phòng Lab <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Phòng Lab Công nghệ sinh học"
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Loại hình <span className="text-[#dc2626]">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">-- Chọn loại hình --</option>
                  <option value="lab">Phòng Lab</option>
                  <option value="testing">Máy đo kiểm</option>
                  <option value="manufacturing">Máy gia công</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Địa điểm <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Số 144 Xuân Thủy, Cầu Giấy, Hà Nội"
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Mô tả <span className="text-[#dc2626]">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Mô tả chi tiết về thiết bị, công dụng, đặc điểm nổi bật..."
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Specs */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Thông số kỹ thuật <span className="text-[#dc2626]">*</span>
                </label>
                <div className="space-y-2">
                  {formData.specs.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={spec}
                        onChange={(e) => handleSpecChange(index, e.target.value)}
                        placeholder="VD: Diện tích: 100m2"
                        className="flex-1 rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      {formData.specs.length > 1 && (
                        <button
                          onClick={() => handleRemoveSpec(index)}
                          className="rounded-lg border border bg-white p-2 text-[#dc2626] transition-colors hover:bg-[#fee2e2]"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddSpec}
                    className="flex items-center gap-2 rounded-lg border-2 border-dashed border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus className="size-4" />
                    <span>Thêm thông số</span>
                  </button>
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Giờ hoạt động
                </label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) =>
                    setFormData({ ...formData, operatingHours: e.target.value })
                  }
                  placeholder="VD: Thứ 2 - Thứ 6: 8:00 - 17:00"
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Price Info */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Chính sách giá
                </label>
                <input
                  type="text"
                  value={formData.priceInfo}
                  onChange={(e) => setFormData({ ...formData, priceInfo: e.target.value })}
                  placeholder="VD: Miễn phí cho các dự án hợp tác nghiên cứu"
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 rounded-lg bg-[#e0f2fe] p-4">
              <p className="text-sm text-primary">
                <span className="font-medium">Lưu ý:</span> Thiết bị sau khi đăng ký sẽ được
                Admin xét duyệt trước khi hiển thị trên Sàn Booking. Quá trình này thường mất
                1-2 ngày làm việc.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 rounded-lg border border bg-white px-4 py-3 font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary/90"
              >
                Gửi duyệt lên Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
