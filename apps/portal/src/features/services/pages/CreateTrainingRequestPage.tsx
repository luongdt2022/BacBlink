import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { FormWizard } from '@/shared/components/form/FormWizard';
import { Step1TrainingInfo } from '@/features/services/components/Step1TrainingInfo';
import { Step2TrainingRequirements } from '@/features/services/components/Step2TrainingRequirements';
import { Step3TrainingDocuments } from '@/features/services/components/Step3TrainingDocuments';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Bước 1', description: 'Thông tin chương trình' },
  { id: 2, title: 'Bước 2', description: 'Yêu cầu chi tiết' },
  { id: 3, title: 'Bước 3', description: 'Tài liệu & Ghi chú' },
];

interface FormData {
  step1: {
    programName: string;
    serviceType: 'training' | 'consulting' | 'technical-support' | '';
    targetAudience: string;
    participantCount: string;
  };
  step2: {
    objectives: string;
    duration: string;
    location: string;
    preferredTime: string;
    budget: string;
  };
  step3: {
    documents: File[];
    notes: string;
  };
}

interface CreateTrainingRequestPageProps {
  onBack: () => void;
  onComplete?: () => void;
  onNavigate?: (itemId: string) => void;
}

export function CreateTrainingRequestPage({
  onBack,
  onComplete,
  onNavigate,
}: CreateTrainingRequestPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    step1: {
      programName: '',
      serviceType: '',
      targetAudience: '',
      participantCount: '',
    },
    step2: {
      objectives: '',
      duration: '',
      location: '',
      preferredTime: '',
      budget: '',
    },
    step3: {
      documents: [],
      notes: '',
    },
  });

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
    toast.success('Đã lưu nháp');
    onComplete?.();
  };

  const handleSubmit = () => {
    toast.success('Đã gửi yêu cầu đào tạo & hỗ trợ');
    onComplete?.();
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        formData.step1.programName &&
        formData.step1.serviceType &&
        formData.step1.targetAudience
      );
    }
    if (currentStep === 2) {
      return formData.step2.objectives !== '';
    }
    if (currentStep === 3) {
      return true; // Documents and notes are optional
    }
    return false;
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="service-training" onNavigate={onNavigate}>
      {/* Header */}
      <div className="border-b border bg-white px-8 py-5">
        <button
          onClick={onBack}
          className="mb-2 flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="size-5" />
          <span>Quay lại danh sách</span>
        </button>
        <h1 className="text-foreground">Tạo yêu cầu Đào tạo & Hỗ trợ</h1>
      </div>

      {/* Form Content */}
      <div className="bg-[#f9fafb] px-8 py-8">
        <FormWizard steps={steps} currentStep={currentStep}>
          {currentStep === 1 && (
            <Step1TrainingInfo data={formData.step1} onChange={updateStep1} />
          )}
          {currentStep === 2 && (
            <Step2TrainingRequirements data={formData.step2} onChange={updateStep2} />
          )}
          {currentStep === 3 && (
            <Step3TrainingDocuments data={formData.step3} onChange={updateStep3} />
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border pt-6">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 rounded-lg border border bg-white px-5 py-2.5 text-[#4b5563] transition-colors hover:bg-[#f3f4f6]"
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
                className="rounded-lg border border bg-white px-5 py-2.5 text-[#4b5563] transition-colors hover:bg-[#f3f4f6]"
              >
                Lưu nháp
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
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className={`rounded-lg px-5 py-2.5 text-white transition-colors ${
                    canProceed()
                      ? 'bg-primary hover:bg-primary/90'
                      : 'cursor-not-allowed bg-[#9ca3af]'
                  }`}
                >
                  Gửi yêu cầu
                </button>
              )}
            </div>
          </div>
        </FormWizard>
      </div>
    </DashboardLayout>
  );
}
