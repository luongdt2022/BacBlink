import { LogOut } from 'lucide-react';

interface LeaveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LeaveConfirmModal({ isOpen, onClose, onConfirm }: LeaveConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-[#fef2f2] p-4">
            <LogOut className="size-8 text-[#dc2626]" />
          </div>
        </div>

        <h2 className="mb-3 text-center text-xl font-medium text-foreground">
          Rời khỏi cuộc trò chuyện?
        </h2>

        <p className="mb-6 text-center text-muted-foreground">
          Bạn có chắc chắn muốn rời khỏi cuộc trò chuyện này? Bạn sẽ không còn quyền truy cập
          vào nội dung và không thể tham gia lại trừ khi được mời lại.
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
            className="flex-1 rounded-lg bg-[#dc2626] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#b91c1c]"
          >
            Rời khỏi
          </button>
        </div>
      </div>
    </div>
  );
}
