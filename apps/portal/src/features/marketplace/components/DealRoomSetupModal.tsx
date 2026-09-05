import { useState } from 'react';
import { X, UserCheck, Mail, Phone } from 'lucide-react';

interface DealRoomSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    legalOption: 'nic' | 'own' | 'later';
    email?: string;
    phone?: string;
  }) => void;
  ipTitle?: string;
}

export function DealRoomSetupModal({ isOpen, onClose, onConfirm, ipTitle }: DealRoomSetupModalProps) {
  const [legalOption, setLegalOption] = useState<'nic' | 'own' | 'later'>('later');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { email?: string; phone?: string } = {};

    if (legalOption === 'own') {
      // Validate email
      if (!email.trim()) {
        newErrors.email = 'Vui lòng nhập email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      // Validate phone
      if (!phone.trim()) {
        newErrors.phone = 'Vui lòng nhập số điện thoại';
      } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    onConfirm({
      legalOption,
      email: legalOption === 'own' ? email : undefined,
      phone: legalOption === 'own' ? phone : undefined,
    });

    // Reset form
    setLegalOption('later');
    setEmail('');
    setPhone('');
    setErrors({});
  };

  const handleClose = () => {
    setLegalOption('later');
    setEmail('');
    setPhone('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <h2 className="text-lg font-medium text-foreground">
            Khởi tạo Phòng Đàm phán & Pháp lý
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-[#f3f4f6] hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {ipTitle && (
            <div className="mb-4 rounded-lg bg-[#eff6ff] px-4 py-3">
              <p className="text-sm text-[#1e40af]">
                <span className="font-medium">Công nghệ:</span> {ipTitle}
              </p>
            </div>
          )}

          <p className="mb-6 text-[#4b5563]">
            Bạn muốn thiết lập hỗ trợ pháp lý cho giao dịch này như thế nào?
          </p>

          {/* Radio Group */}
          <div className="space-y-4">
            {/* Option A: NIC Legal Expert */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-[#e5e7eb] p-4 transition-all hover:border-primary hover:bg-[#f0f7ff]">
              <input
                type="radio"
                name="legalOption"
                value="nic"
                checked={legalOption === 'nic'}
                onChange={(e) => setLegalOption(e.target.value as 'nic')}
                className="mt-1 size-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <UserCheck className="size-5 text-primary" />
                  <span className="font-medium text-foreground">
                    Thuê Chuyên gia Pháp lý của NIC
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Hệ thống sẽ tự động gán một Luật sư ngẫu nhiên hỗ trợ bạn.
                </p>
              </div>
            </label>

            {/* Option B: Own Legal Expert */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-[#e5e7eb] p-4 transition-all hover:border-primary hover:bg-[#f0f7ff]">
              <input
                type="radio"
                name="legalOption"
                value="own"
                checked={legalOption === 'own'}
                onChange={(e) => setLegalOption(e.target.value as 'own')}
                className="mt-1 size-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="size-5 text-primary" />
                  <span className="font-medium text-foreground">
                    Mời Chuyên gia Pháp lý riêng
                  </span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Gửi lời mời qua email cho chuyên gia pháp lý của bạn.
                </p>

                {/* Conditional Fields */}
                {legalOption === 'own' && (
                  <div className="space-y-3">
                    {/* Email Input */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#374151]">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((prev) => ({ ...prev, email: undefined }));
                          }}
                          placeholder="example@lawfirm.com"
                          className={`w-full rounded-lg border ${
                            errors.email ? 'border-red-500' : 'border-[#d1d5db]'
                          } bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#374151]">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setErrors((prev) => ({ ...prev, phone: undefined }));
                          }}
                          placeholder="0912345678"
                          className={`w-full rounded-lg border ${
                            errors.phone ? 'border-red-500' : 'border-[#d1d5db]'
                          } bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Option C: Decide Later */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-[#e5e7eb] p-4 transition-all hover:border-primary hover:bg-[#f0f7ff]">
              <input
                type="radio"
                name="legalOption"
                value="later"
                checked={legalOption === 'later'}
                onChange={(e) => setLegalOption(e.target.value as 'later')}
                className="mt-1 size-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <span className="mb-1 block font-medium text-foreground">
                  Quyết định sau (Bỏ qua)
                </span>
                <p className="text-sm text-muted-foreground">
                  Bạn có thể mời thành viên sau khi đã vào phòng đàm phán.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#e5e7eb] px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Xác nhận & Vào phòng chat
          </button>
        </div>
      </div>
    </div>
  );
}
