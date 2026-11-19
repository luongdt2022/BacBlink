import { useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { FormWizard } from '@/shared/components/form/FormWizard';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Bước 1', description: 'Thông tin đơn vị' },
  { id: 2, title: 'Bước 2', description: 'Chỉ tiêu đánh giá' },
  { id: 3, title: 'Bước 3', description: 'Tài liệu & Xác nhận' },
];

interface FormData {
  step1: {
    unitName: string;
    unitType: 'university' | 'research-institute' | 'enterprise' | 'startup' | '';
    address: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  step2: {
    rdCapacity: boolean;
    ipActivity: boolean;
    commercialization: boolean;
    innovationManagement: boolean;
    collaboration: boolean;
    technologyAdoption: boolean;
  };
  step3: {
    documents: File[];
    notes: string;
  };
}

interface CreateAssessmentPageProps {
  onBack: () => void;
  onComplete?: () => void;
  onNavigate?: (itemId: string) => void;
}

export function CreateAssessmentPage({
  onBack,
  onComplete,
  onNavigate,
}: CreateAssessmentPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    step1: {
      unitName: '',
      unitType: '',
      address: '',
      contactPerson: '',
      email: '',
      phone: '',
    },
    step2: {
      rdCapacity: true,
      ipActivity: true,
      commercialization: true,
      innovationManagement: false,
      collaboration: false,
      technologyAdoption: false,
    },
    step3: {
      documents: [],
      notes: '',
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Đã lưu nháp thành công');
    onComplete?.();
  };

  const handleSubmit = () => {
    toast.success('Đã gửi yêu cầu đánh giá thành công. Vui lòng chờ phê duyệt.');
    onComplete?.();
  };

  const updateStep1 = (data: Partial<FormData['step1']>) => {
    setFormData((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
  };

  const updateStep2 = (data: Partial<FormData['step2']>) => {
    setFormData((prev) => ({
      ...prev,
      step2: { ...prev.step2, ...data },
    }));
  };

  const updateStep3 = (data: Partial<FormData['step3']>) => {
    setFormData((prev) => ({
      ...prev,
      step3: { ...prev.step3, ...data },
    }));
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="service-innovation-assessment" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border bg-white px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Quay lại
            </button>
            <div className="h-5 w-px bg-[#e5e7eb]" />
            <h1 className="text-foreground">Tạo yêu cầu đánh giá năng lực đổi mới sáng tạo</h1>
          </div>
        </div>

        {/* Wizard */}
        <div className="px-8 py-8">
          <div className="mx-auto max-w-4xl">
            <FormWizard steps={steps} currentStep={currentStep}>
              {/* Step Content */}
              <div className="mt-8 rounded-xl border border bg-white p-8 shadow-sm">
                {currentStep === 1 && (
                  <Step1UnitInfo data={formData.step1} onChange={updateStep1} />
                )}
                {currentStep === 2 && (
                  <Step2Criteria data={formData.step2} onChange={updateStep2} />
                )}
                {currentStep === 3 && (
                  <Step3Documents
                    data={formData.step3}
                    onChange={updateStep3}
                    onSaveDraft={handleSaveDraft}
                    onSubmit={handleSubmit}
                  />
                )}
              </div>
            </FormWizard>

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="rounded-lg border border bg-white px-6 py-2.5 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Tiếp theo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Step 1: Unit Information
function Step1UnitInfo({
  data,
  onChange,
}: {
  data: FormData['step1'];
  onChange: (data: Partial<FormData['step1']>) => void;
}) {
  const unitTypes = [
    { value: 'university', label: 'Trường đại học' },
    { value: 'research-institute', label: 'Viện nghiên cứu' },
    { value: 'enterprise', label: 'Doanh nghiệp' },
    { value: 'startup', label: 'Startup' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Thông tin đơn vị</h2>
        <p className="text-sm text-muted-foreground">
          Cung cấp thông tin cơ bản về đơn vị cần đánh giá năng lực đổi mới sáng tạo
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            Tên đơn vị <span className="text-[#dc2626]">*</span>
          </label>
          <input
            type="text"
            value={data.unitName}
            onChange={(e) => onChange({ unitName: e.target.value })}
            className="w-full rounded-lg border border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Nhập tên đơn vị"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            Loại hình đơn vị <span className="text-[#dc2626]">*</span>
          </label>
          <select
            value={data.unitType}
            onChange={(e) =>
              onChange({ unitType: e.target.value as FormData['step1']['unitType'] })
            }
            className="w-full rounded-lg border border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Chọn loại hình</option>
            {unitTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            Địa chỉ <span className="text-[#dc2626]">*</span>
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full rounded-lg border border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Nhập địa chỉ đơn vị"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#4b5563]">
              Người liên hệ <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="text"
              value={data.contactPerson}
              onChange={(e) => onChange({ contactPerson: e.target.value })}
              className="w-full rounded-lg border border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Họ và tên người liên hệ"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4b5563]">
              Số điện thoại <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="w-full rounded-lg border border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0123456789"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#4b5563]">
            Email <span className="text-[#dc2626]">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full rounded-lg border border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="example@email.com"
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Assessment Criteria
function Step2Criteria({
  data,
  onChange,
}: {
  data: FormData['step2'];
  onChange: (data: Partial<FormData['step2']>) => void;
}) {
  const criteria = [
    {
      key: 'rdCapacity',
      label: 'Năng lực nghiên cứu và phát triển (R&D)',
      description: 'Đánh giá nguồn lực, đội ngũ và hoạt động R&D của đơn vị',
    },
    {
      key: 'ipActivity',
      label: 'Hoạt động sở hữu trí tuệ',
      description: 'Quản lý, bảo vệ và khai thác tài sản trí tuệ',
    },
    {
      key: 'commercialization',
      label: 'Năng lực thương mại hóa kết quả nghiên cứu',
      description: 'Chuyển giao và ứng dụng kết quả nghiên cứu vào thực tiễn',
    },
    {
      key: 'innovationManagement',
      label: 'Quản trị đổi mới và chiến lược công nghệ',
      description: 'Hệ thống quản lý và định hướng phát triển công nghệ',
    },
    {
      key: 'collaboration',
      label: 'Hợp tác trong nước và quốc tế',
      description: 'Mạng lưới đối tác và các hoạt động hợp tác nghiên cứu',
    },
    {
      key: 'technologyAdoption',
      label: 'Mức độ ứng dụng công nghệ',
      description: 'Áp dụng công nghệ tiên tiến vào hoạt động',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Chỉ tiêu đánh giá</h2>
        <p className="text-sm text-muted-foreground">
          Chọn các chỉ tiêu cần đánh giá cho đơn vị của bạn
        </p>
      </div>

      <div className="space-y-3">
        {criteria.map((criterion) => (
          <label
            key={criterion.key}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border p-4 transition-colors hover:bg-[#f9fafb]"
          >
            <input
              type="checkbox"
              checked={data[criterion.key as keyof FormData['step2']]}
              onChange={(e) =>
                onChange({ [criterion.key]: e.target.checked } as Partial<FormData['step2']>)
              }
              className="mt-1 size-5 shrink-0 accent-primary"
            />
            <div>
              <div className="font-medium text-foreground">{criterion.label}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{criterion.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// Step 3: Documents & Confirmation
function Step3Documents({
  data,
  onChange,
  onSaveDraft,
  onSubmit,
}: {
  data: FormData['step3'];
  onChange: (data: Partial<FormData['step3']>) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange({ documents: Array.from(e.target.files) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Tài liệu đính kèm</h2>
        <p className="text-sm text-muted-foreground">
          Tải lên các tài liệu minh chứng và thông tin bổ sung
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#4b5563]">
          Tài liệu minh chứng
        </label>
        <div className="rounded-lg border-2 border-dashed border p-8 text-center transition-colors hover:border-primary hover:bg-[#f9fafb]">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="mb-2 text-sm text-muted-foreground">
              Kéo thả file vào đây hoặc click để chọn file
            </div>
            <div className="text-xs text-[#9ca3af]">
              Hỗ trợ: PDF, DOC, DOCX, XLSX (Tối đa 10MB mỗi file)
            </div>
          </label>
        </div>
        {data.documents.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            Đã chọn {data.documents.length} file
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#4b5563]">Ghi chú</label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Thông tin bổ sung hoặc yêu cầu đặc biệt..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border pt-6">
        <button
          onClick={onSaveDraft}
          className="rounded-lg border border bg-white px-6 py-2.5 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f9fafb]"
        >
          Lưu nháp
        </button>
        <button
          onClick={onSubmit}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Gửi yêu cầu đánh giá
        </button>
      </div>
    </div>
  );
}
