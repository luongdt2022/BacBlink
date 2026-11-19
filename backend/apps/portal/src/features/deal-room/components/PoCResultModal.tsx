import { X } from 'lucide-react';

interface PoCResultModalProps {
  isOpen: boolean;
  formData: { result: string; file: File | null; confirmed: boolean };
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: string, value: string | File | boolean) => void;
}

export function PoCResultModal({ isOpen, formData, onClose, onSubmit, onChange }: PoCResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-foreground">Báo cáo Kết quả PoC</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Kết quả đo kiểm/Thông số <span className="text-[#dc2626]">*</span>
            </label>
            <textarea
              value={formData.result}
              onChange={(e) => onChange('result', e.target.value)}
              rows={4}
              placeholder="Nhập kết quả chi tiết..."
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              File báo cáo chi tiết <span className="text-[#dc2626]">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onChange('file', file);
                }}
                className="flex-1 text-sm text-muted-foreground"
                accept=".pdf,.xlsx,.xls,.doc,.docx"
              />
            </div>
            {formData.file && (
              <p className="mt-2 text-sm text-[#059669]">✓ {formData.file.name}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="poc-confirm"
              checked={formData.confirmed}
              onChange={(e) => onChange('confirmed', e.target.checked)}
              className="mt-1 size-4"
            />
            <label htmlFor="poc-confirm" className="text-sm text-[#4b5563]">
              Xác nhận kết quả trung thực <span className="text-[#dc2626]">*</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Lưu &amp; Chia sẻ
          </button>
        </div>
      </div>
    </div>
  );
}
