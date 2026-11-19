import { useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';

interface NegotiateTechnologyPageProps {
  technologyId: string;
  technologyName?: string;
  onNavigate?: (itemId: string) => void;
  onBack: () => void;
  onSuccess: () => void;
}

export function NegotiateTechnologyPage({
  technologyId: _technologyId,
  technologyName = 'Công nghệ được chọn',
  onNavigate,
  onBack,
  onSuccess,
}: NegotiateTechnologyPageProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    transferType: '',
    usageScope: '',
    proposedFee: '',
    preliminaryTerms: '',
    additionalNotes: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // TODO: Submit to backend
    console.warn('Submitting negotiation proposal:', formData, attachments);
    setIsSubmitted(true);
  };

  const handleCancel = () => {
    onBack();
  };

  if (isSubmitted) {
    return (
      <DashboardLayout contentOnly activeMenuItem="marketplace" onNavigate={onNavigate}>
        <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-8 py-12">
          <div className="w-full max-w-2xl rounded-lg border border-[#e5e7eb] bg-white p-12 text-center shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#d1fae5]">
                <svg
                  className="size-8 text-[#059669]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-3 text-foreground">Hồ sơ đã được gửi thành công</h2>
            <p className="mb-8 text-muted-foreground">
              Đề xuất thương lượng của bạn đã được gửi đến đơn vị sở hữu công nghệ. Chúng tôi sẽ liên hệ với bạn để thảo luận chi tiết.
            </p>
            <button
              onClick={onSuccess}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Quay lại sàn giao dịch
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout contentOnly activeMenuItem="marketplace" onNavigate={onNavigate}>
      {/* Header */}
      <div className="border-b border-[#e5e7eb] bg-white px-8 py-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Quay lại sàn giao dịch
        </button>
        <div>
          <h1 className="mb-2 text-foreground">Thương lượng hợp tác / chuyển giao</h1>
          <p className="text-muted-foreground">
            Đề xuất phương án thương lượng đối với công nghệ đã thương mại hóa.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-[#f9fafb] px-8 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Technology Info */}
          <div className="mb-6 rounded-lg border border-[#e5e7eb] bg-white p-4">
            <p className="text-sm text-muted-foreground">Công nghệ được chọn:</p>
            <p className="font-medium text-foreground">{technologyName}</p>
          </div>

          {/* Form Container */}
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-8">
            <form className="space-y-8">
              {/* Thông tin bên đề xuất */}
              <div>
                <h3 className="mb-4 text-foreground">Thông tin bên đề xuất</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Tên đơn vị <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      placeholder="Nhập tên đơn vị"
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Người liên hệ <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        placeholder="Họ và tên"
                        className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Email <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Số điện thoại <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0123 456 789"
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Nội dung thương lượng */}
              <div>
                <h3 className="mb-4 text-foreground">Nội dung thương lượng</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Hình thức chuyển giao <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      name="transferType"
                      value={formData.transferType}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    >
                      <option value="">Chọn hình thức chuyển giao</option>
                      <option value="license">License (Cấp phép sử dụng)</option>
                      <option value="sale">Bán đứt quyền sở hữu</option>
                      <option value="cooperation">Hợp tác sản xuất</option>
                      <option value="joint-venture">Liên doanh</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Phạm vi quyền sử dụng <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      name="usageScope"
                      value={formData.usageScope}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Mô tả phạm vi quyền sử dụng: lãnh thổ, lĩnh vực ứng dụng, thời hạn..."
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Đề xuất mức phí <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      name="proposedFee"
                      value={formData.proposedFee}
                      onChange={handleInputChange}
                      placeholder="VD: 500 triệu VNĐ một lần / 2% doanh thu..."
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Điều khoản sơ bộ <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      name="preliminaryTerms"
                      value={formData.preliminaryTerms}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Nội dung các điều khoản sơ bộ: quyền và nghĩa vụ, bảo mật, hỗ trợ kỹ thuật..."
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tài liệu đính kèm */}
              <div>
                <h3 className="mb-4 text-foreground">Tài liệu đính kèm</h3>
                <div className="rounded-lg border-2 border-dashed border-[#d1d5db] bg-[#f9fafb] p-6 text-center">
                  <Upload className="mx-auto mb-3 size-10 text-[#9ca3af]" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    Kéo thả tệp vào đây hoặc{' '}
                    <label className="cursor-pointer font-medium text-primary hover:underline">
                      chọn tệp
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    PDF, DOC, DOCX, XLS, XLSX (tối đa 10MB)
                  </p>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-2"
                      >
                        <span className="text-sm text-foreground">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-muted-foreground hover:text-[#DC2626]"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-[#e5e7eb] pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-[#d1d5db] bg-white px-6 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Gửi đề xuất thương lượng
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
