import { X } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSubmit: () => void;
  onEmailChange: (v: string) => void;
}

export function InviteMemberModal({ isOpen, email, onClose, onSubmit, onEmailChange }: InviteMemberModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-foreground">Mời thành viên</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Email thành viên <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="example@email.com"
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
            Gửi lời mời
          </button>
        </div>
      </div>
    </div>
  );
}
