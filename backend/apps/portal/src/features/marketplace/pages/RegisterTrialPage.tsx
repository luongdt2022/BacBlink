import { useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';

interface RegisterTrialPageProps {
  technologyId: string;
  technologyName?: string;
  onNavigate?: (itemId: string) => void;
  onBack: () => void;
  onSuccess: () => void;
}

export function RegisterTrialPage({
  technologyId: _technologyId,
  technologyName = 'Công nghệ được chọn',
  onNavigate,
  onBack,
  onSuccess,
}: RegisterTrialPageProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    trialPurpose: '',
    infrastructure: '',
    personnel: '',
    trialDuration: '',
    cooperationCommitment: false,
    additionalNotes: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    if (!formData.cooperationCommitment) {
      alert('Vui lòng xác nhận cam kết phối hợp trước khi gửi đăng ký.');
      return;
    }
    // TODO: Submit to backend
    console.warn('Submitting trial registration:', formData, attachments);
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
              Đăng ký thử nghiệm của bạn đã được gửi đến đơn vị sở hữu công nghệ. Chúng tôi sẽ liên hệ với bạn để sắp xếp kế hoạch thử nghiệm.
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
          <h1 className="mb-2 text-foreground">Đăng ký thử nghiệm công nghệ</h1>
          <p className="text-muted-foreground">
            Đăng ký tham gia thử nghiệm, đánh giá công nghệ trước thương mại hóa.
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
              {/* Thông tin tổ chức đăng ký */}
              <div>
                <h3 className="mb-4 text-foreground">Thông tin tổ chức đăng ký</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Tên tổ chức <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      placeholder="Nhập tên tổ chức"
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

              {/* Mục đích thử nghiệm */}
              <div>
                <h3 className="mb-4 text-foreground">Mục đích thử nghiệm</h3>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Mô tả mục đích <span className="text-[#DC2626]">*</span>
                  </label>
                  <textarea
                    name="trialPurpose"
                    value={formData.trialPurpose}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Mô tả mục đích và kỳ vọng từ việc thử nghiệm công nghệ..."
                    className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Năng lực triển khai */}
              <div>
                <h3 className="mb-4 text-foreground">Năng lực triển khai</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Cơ sở vật chất <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      name="infrastructure"
                      value={formData.infrastructure}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Mô tả cơ sở vật chất, trang thiết bị sẵn có để triển khai thử nghiệm..."
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Nhân sự tham gia <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      name="personnel"
                      value={formData.personnel}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Mô tả đội ngũ nhân sự, trình độ chuyên môn tham gia thử nghiệm..."
                      className="w-full rounded-lg border border-[#d1d5db] px-4 py-2.5 text-foreground placeholder-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Thời gian thử nghiệm đề xuất <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      name="trialDuration"
                      value={formData.trialDuration}
                      onChange={handleInputChange}
                      placeholder="VD: 3 tháng, 6 tháng..."
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

              {/* Cam kết phối hợp */}
              <div>
                <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="cooperationCommitment"
                      checked={formData.cooperationCommitment}
                      onChange={handleInputChange}
                      className="mt-1 size-4 rounded border-[#d1d5db] text-primary focus:ring-primary"
                      required
                    />
                    <div className="flex-1">
                      <span className="block font-medium text-foreground">
                        Cam kết phối hợp <span className="text-[#DC2626]">*</span>
                      </span>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tôi cam kết tuân thủ các quy định về bảo mật thông tin, báo cáo định kỳ kết quả thử nghiệm, và phối hợp chặt chẽ với đơn vị sở hữu công nghệ trong suốt quá trình thử nghiệm.
                      </p>
                    </div>
                  </label>
                </div>
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
                  Gửi đăng ký thử nghiệm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
