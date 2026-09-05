import { useState } from 'react';
import { X, ChevronDown, FileText, MessageSquare, CheckCircle2 } from 'lucide-react';

interface ProposalData {
  challengeId: string | null;
  enterpriseName: string;
}

interface SubmitProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ipId: string, message: string) => void;
  proposalData: ProposalData | null;
}

// Mock User's IPs (Active/Listed only)
const mockUserIPs = [
  {
    id: '1',
    name: 'Hệ thống chẩn đoán bệnh thông minh AI',
    trlLevel: 'TRL 7',
    field: 'Công nghệ Y tế',
    status: 'listed',
  },
  {
    id: '3',
    name: 'Pin năng lượng mặt trời hiệu suất cao',
    trlLevel: 'TRL 8',
    field: 'Năng lượng tái tạo',
    status: 'listed',
  },
  {
    id: '7',
    name: 'Máy in 3D kim loại công nghiệp',
    trlLevel: 'TRL 7',
    field: 'Công nghệ Cơ khí',
    status: 'listed',
  },
];

export function SubmitProposalModal({ isOpen, onClose, onConfirm, proposalData }: SubmitProposalModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIPId, setSelectedIPId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isOpen) return null;

  const selectedIP = mockUserIPs.find((ip) => ip.id === selectedIPId);
  const enterpriseName = proposalData?.enterpriseName ?? 'Doanh nghiệp';

  const handleNext = () => {
    if (!selectedIPId) {
      alert('Vui lòng chọn một công nghệ/IP');
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!message.trim()) {
      alert('Vui lòng nhập thuyết minh sơ bộ');
      return;
    }
    onConfirm(selectedIPId, message);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedIPId('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="border-b border-[#e5e7eb] px-6 py-5">
          <h2 className="text-xl font-medium text-foreground">Nộp Giải pháp cho Doanh nghiệp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gửi hồ sơ ứng cử đến <span className="font-medium text-foreground">{enterpriseName}</span>
          </p>

          {/* Steps Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                step === 1 ? 'bg-primary text-white' : 'bg-[#e5e7eb]'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Chọn IP</span>
            </div>
            <div className="h-px w-8 bg-[#e5e7eb]" />
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                step === 2 ? 'bg-primary text-white' : 'bg-[#e5e7eb]'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Thuyết minh</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Chọn Công nghệ/IP của bạn <span className="text-red-500">*</span>
                </label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Chọn công nghệ phù hợp nhất để giải quyết bài toán của doanh nghiệp
                </p>

                {/* Custom Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-left transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {selectedIP ? (
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{selectedIP.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {selectedIP.trlLevel} • {selectedIP.field}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#9ca3af]">Chọn công nghệ/IP...</span>
                    )}
                    <ChevronDown className={`size-5 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown List */}
                  {showDropdown && (
                    <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-[#e5e7eb] bg-white shadow-lg">
                      {mockUserIPs.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Bạn chưa có Cung nào được niêm yết
                        </div>
                      ) : (
                        mockUserIPs.map((ip) => (
                          <button
                            key={ip.id}
                            onClick={() => {
                              setSelectedIPId(ip.id);
                              setShowDropdown(false);
                            }}
                            className="flex w-full items-start gap-3 border-b border-[#e5e7eb] p-4 text-left transition-colors hover:bg-[#f9fafb] last:border-0"
                          >
                            <FileText className="mt-1 size-5 shrink-0 text-primary" />
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{ip.name}</div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-primary">
                                  {ip.trlLevel}
                                </span>
                                <span>{ip.field}</span>
                              </div>
                            </div>
                            {selectedIPId === ip.id && (
                              <CheckCircle2 className="mt-1 size-5 text-primary" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedIP && (
                <div className="rounded-lg bg-[#f0f7ff] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                    <FileText className="size-4" />
                    <span>IP đã chọn</span>
                  </div>
                  <div className="text-sm text-[#4b5563]">
                    <div className="font-medium">{selectedIP.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {selectedIP.trlLevel} • {selectedIP.field}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Selected IP Summary */}
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">IP đã chọn</div>
                <div className="font-medium text-foreground">{selectedIP?.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedIP?.trlLevel} • {selectedIP?.field}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="size-4" />
                  <span>Thuyết minh sơ bộ <span className="text-red-500">*</span></span>
                </label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Mô tả ngắn gọn cách công nghệ của bạn có thể giải quyết bài toán
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ví dụ: Công nghệ của chúng tôi sử dụng phương pháp... có thể giúp giải quyết bài toán... với hiệu quả..."
                  className="min-h-[150px] w-full rounded-lg border border-[#e5e7eb] p-3 text-foreground placeholder:text-[#9ca3af] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-2 text-right text-xs text-muted-foreground">
                  {message.length} ký tự
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-[#e5e7eb] px-6 py-4">
          {step === 1 ? (
            <>
              <button
                onClick={handleClose}
                className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
              >
                Hủy
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedIPId}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
              >
                Tiếp tục
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
              >
                Gửi Hồ sơ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}