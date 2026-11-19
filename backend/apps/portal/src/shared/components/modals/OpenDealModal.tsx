import { X, MessageSquare } from 'lucide-react';

interface OpenDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ownerName: string;
}

export function OpenDealModal({ isOpen, onClose, onConfirm, ownerName }: OpenDealModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-[#e0f2fe] p-4">
            <MessageSquare className="size-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-xl font-medium text-foreground">
          Khởi tạo Đàm phán
        </h2>

        {/* Message */}
        <p className="mb-6 text-center text-muted-foreground">
          Hệ thống sẽ tạo phòng chat bảo mật với{' '}
          <span className="font-medium text-foreground">{ownerName}</span>.
        </p>

        {/* Actions */}
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
            Xác nhận & Vào phòng chat
          </button>
        </div>
      </div>
    </div>
  );
}
