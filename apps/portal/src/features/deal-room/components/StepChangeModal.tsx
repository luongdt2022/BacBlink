
interface Step {
  id: number;
  label: string;
  status: string;
}

interface StepChangeModalProps {
  isOpen: boolean;
  selectedStep: number | null;
  steps: Step[];
  onClose: () => void;
  onConfirm: () => void;
}

export function StepChangeModal({ isOpen, selectedStep, steps, onClose, onConfirm }: StepChangeModalProps) {
  if (!isOpen || selectedStep === null) return null;

  const selectedLabel = steps.find((s) => s.id === selectedStep)?.label ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-[#e0f2fe] p-4">
            <svg className="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="mb-3 text-center text-xl font-medium text-foreground">
          Xác nhận chuyển giai đoạn?
        </h2>

        <p className="mb-6 text-center text-muted-foreground">
          Bạn muốn chuyển sang giai đoạn{' '}
          <span className="font-medium text-foreground">"{selectedLabel}"</span>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
