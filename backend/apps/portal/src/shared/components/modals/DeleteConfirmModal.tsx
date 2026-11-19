import { X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  ipName?: string;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onClose,
  onCancel,
  ipName,
  title = 'Xác nhận xóa',
  message,
  confirmLabel = 'Xóa',
  cancelLabel = 'Hủy',
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    onCancel?.();
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md cursor-default rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-7 text-gray-600">
            {message ??
              (ipName
                ? `Bạn có chắc chắn muốn xóa "${ipName}" không?`
                : 'Bạn có chắc chắn muốn xóa mục này không?')}
          </p>
          {ipName && !message && (
            <p className="mt-2 text-sm font-medium text-gray-900">{ipName}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
