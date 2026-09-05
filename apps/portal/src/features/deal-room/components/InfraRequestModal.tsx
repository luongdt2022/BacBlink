import { X } from 'lucide-react';

interface InfraRequestModalProps {
  isOpen: boolean;
  formData: { facility: string; startDate: string; endDate: string };
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: string, value: string) => void;
}

export function InfraRequestModal({ isOpen, formData, onClose, onSubmit, onChange }: InfraRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-foreground">Đăng ký thuê Hạ tầng Thử nghiệm</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Chọn Phòng Lab/Thiết bị <span className="text-[#dc2626]">*</span>
            </label>
            <select
              value={formData.facility}
              onChange={(e) => onChange('facility', e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">-- Chọn --</option>
              <option value="lab1">Phòng Lab Công nghệ sinh học</option>
              <option value="lab2">Phòng Lab Hóa học phân tích</option>
              <option value="lab3">Thiết bị xử lý nước công nghiệp</option>
              <option value="lab4">Hệ thống IoT &amp; Sensors</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Ngày bắt đầu <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Ngày kết thúc <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-primary"
            />
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
            Gửi yêu cầu duyệt
          </button>
        </div>
      </div>
    </div>
  );
}
