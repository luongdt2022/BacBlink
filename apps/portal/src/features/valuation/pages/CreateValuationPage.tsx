import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { FormWizard } from '@/shared/components/form/FormWizard';
import { Step1ValuationTechInfo } from '@/features/valuation/components/Step1ValuationTechInfo';
import { Step2ValuationScope } from '@/features/valuation/components/Step2ValuationScope';
import { Step3ValuationDocuments } from '@/features/valuation/components/Step3ValuationDocuments';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Bước 1', description: 'Thông tin công nghệ' },
  { id: 2, title: 'Bước 2', description: 'Phạm vi định giá' },
  { id: 3, title: 'Bước 3', description: 'Tài liệu & Xác nhận' },
];

interface FormData {
  step1: {
    name: string;
    field: string;
    description: string;
    patentNumber: string;
    trlLevel: number;
  };
  step2: {
    serviceType: 'patent' | 'ip-assessment' | 'professional-report' | '';
    additionalServices: string[];
  };
  step3: {
    documents: File[];
    notes: string;
  };
}

export interface EditValuationData {
  id: string;
  name: string;
  field: string;
  description: string;
  patentNumber: string;
  trlLevel: number;
  serviceType: 'patent' | 'ip-assessment' | 'professional-report' | '';
  additionalServices: string[];
  documents: File[];
  notes: string;
  status?: 'draft' | 'submitted' | 'reviewing' | 'completed' | 'rejected';
}

interface CreateValuationPageProps {
  onBack: () => void;
  onComplete?: () => void;
  editData?: EditValuationData | null;
  onNavigate?: (itemId: string) => void;
}

export function CreateValuationPage({
  onBack,
  onComplete,
  editData = null,
  onNavigate,
}: CreateValuationPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    editData
      ? {
          step1: {
            name: editData.name,
            field: editData.field,
            description: editData.description,
            patentNumber: editData.patentNumber,
            trlLevel: editData.trlLevel,
          },
          step2: {
            serviceType: editData.serviceType,
            additionalServices: editData.additionalServices,
          },
          step3: {
            documents: editData.documents,
            notes: editData.notes,
          },
        }
      : {
          step1: {
            name: '',
            field: '',
            description: '',
            patentNumber: '',
            trlLevel: 4,
          },
          step2: {
            serviceType: '',
            additionalServices: [],
          },
          step3: {
            documents: [],
            notes: '',
          },
        }
  );

  const updateStep1 = (data: typeof formData.step1) => {
    setFormData({ ...formData, step1: data });
  };

  const updateStep2 = (data: typeof formData.step2) => {
    setFormData({ ...formData, step2: data });
  };

  const updateStep3 = (data: typeof formData.step3) => {
    setFormData({ ...formData, step3: data });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    toast.success(editData ? 'Đã lưu thay đổi' : 'Đã lưu nháp');
    onComplete?.();
  };

  const handleSubmitClick = () => {
    // If editing a completed valuation, show confirmation modal
    if (editData && editData.status === 'completed') {
      setShowConfirmModal(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    toast.success(
      editData
        ? 'Đã cập nhật và gửi lại yêu cầu định giá'
        : 'Đã gửi yêu cầu định giá'
    );
    onComplete?.();
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        formData.step1.name &&
        formData.step1.field &&
        formData.step1.description
      );
    }
    if (currentStep === 2) {
      return formData.step2.serviceType !== '';
    }
    if (currentStep === 3) {
      return true; // Documents and notes are optional
    }
    return false;
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="service-valuation" onNavigate={onNavigate}>
      {/* Header */}
      <div className="border-b border-[#e5e7eb] bg-white px-8 py-5">
        <button
          onClick={onBack}
          className="mb-2 flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="size-5" />
          <span>Quay lại danh sách</span>
        </button>
        <h1 className="text-foreground">
          {editData ? 'Cập nhật yêu cầu định giá' : 'Tạo yêu cầu định giá'}
        </h1>
      </div>

      {/* Form Content */}
      <div className="bg-[#f9fafb] px-8 py-8">
        <FormWizard steps={steps} currentStep={currentStep}>
          {currentStep === 1 && (
            <Step1ValuationTechInfo data={formData.step1} onChange={updateStep1} />
          )}
          {currentStep === 2 && (
            <Step2ValuationScope data={formData.step2} onChange={updateStep2} />
          )}
          {currentStep === 3 && (
            <Step3ValuationDocuments data={formData.step3} onChange={updateStep3} />
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-[#e5e7eb] pt-6">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-5 py-2.5 text-[#4b5563] transition-colors hover:bg-[#f3f4f6]"
                >
                  <ChevronLeft className="size-5" />
                  <span>Quay lại</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Save Draft */}
              <button
                onClick={handleSaveDraft}
                className="rounded-lg border border-[#e5e7eb] bg-white px-5 py-2.5 text-[#4b5563] transition-colors hover:bg-[#f3f4f6]"
              >
                {editData ? 'Lưu thay đổi' : 'Lưu nháp'}
              </button>

              {/* Next or Submit */}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-white transition-colors ${
                    canProceed()
                      ? 'bg-primary hover:bg-primary/90'
                      : 'cursor-not-allowed bg-[#9ca3af]'
                  }`}
                >
                  <span>Tiếp tục</span>
                  <ChevronRight className="size-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitClick}
                  disabled={!canProceed()}
                  className={`rounded-lg px-5 py-2.5 text-white transition-colors ${
                    canProceed()
                      ? 'bg-primary hover:bg-primary/90'
                      : 'cursor-not-allowed bg-[#9ca3af]'
                  }`}
                >
                  {editData ? 'Cập nhật & Gửi lại' : 'Gửi yêu cầu định giá'}
                </button>
              )}
            </div>
          </div>
        </FormWizard>
      </div>

      {/* Confirmation Modal for Completed Request */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Xác nhận cập nhật yêu cầu?
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Việc thay đổi thông tin sẽ khiến yêu cầu này chuyển về trạng thái{' '}
              <strong className="text-[#ea580c]">"Chờ tiếp nhận"</strong> và{' '}
              <strong className="text-[#dc2626]">hủy hiệu lực báo cáo định giá trước đó</strong>.
              <br />
              <br />
              Bạn có chắc chắn không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Đồng ý cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}