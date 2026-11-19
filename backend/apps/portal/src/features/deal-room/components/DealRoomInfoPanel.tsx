import { UserPlus, Building2, Upload, Handshake, Calendar, Download, FileText, LogOut } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface PoCLog {
  id: string;
  date: string;
  title: string;
  result: string;
  file: { name: string; type: string; url: string };
}

interface DealRoomInfoPanelProps {
  pocLogs: PoCLog[];
  steps: Step[];
  onInvite: () => void;
  onInfra: () => void;
  onPoCResult: () => void;
  onComplete: () => void;
  onStepChange: (stepId: number) => void;
  onLeave: () => void;
}

function getFileIcon(_fileType: string) {
  return <FileText className="size-5 text-[#dc2626]" />;
}

export function DealRoomInfoPanel({
  pocLogs,
  steps,
  onInvite,
  onInfra,
  onPoCResult,
  onComplete,
  onStepChange,
  onLeave,
}: DealRoomInfoPanelProps) {
  return (
    <div className="w-96 border-l border-[#e5e7eb] bg-white">
      <div className="overflow-y-auto" style={{ height: '100vh' }}>
        {/* Section 1: Members */}
        <div className="border-b border-[#e5e7eb] p-6">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Thành viên trong phòng</h4>
          <div className="space-y-3">
            {[
              { name: 'Nguyễn Văn A', company: 'Tập đoàn Viettel', initials: 'NA', bg: 'bg-primary', badge: 'Admin' },
              { name: 'Trần Thị B', company: 'Viện Nghiên cứu', initials: 'TB', bg: 'bg-[#6366f1]', badge: null },
              { name: 'Lê Văn C', company: 'Kỹ thuật viên', initials: 'LC', bg: 'bg-[#ea580c]', badge: null },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-full ${member.bg} text-sm font-medium text-white`}>
                  {member.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.company}</p>
                </div>
                {member.badge && (
                  <span className="rounded-full bg-[#d1fae5] px-2 py-0.5 text-xs font-medium text-[#059669]">
                    {member.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onInvite}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e5e7eb] px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <UserPlus className="size-4" />
            <span>Thêm người / Mời thành viên</span>
          </button>
        </div>

        {/* Section 2: Progress & PoC */}
        <div className="border-b border-[#e5e7eb] p-6">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Tiến độ giao dịch</h4>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-3">
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 h-full w-0.5 ${
                      step.status === 'completed' ? 'bg-[#059669]' : 'bg-[#e5e7eb]'
                    }`}
                  />
                )}

                <button
                  onClick={() => onStepChange(step.id)}
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    step.status === 'completed'
                      ? 'border-[#059669] bg-[#059669]'
                      : step.status === 'active'
                      ? 'border-primary bg-primary'
                      : 'border-[#e5e7eb] bg-white'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.status === 'active' ? (
                    <svg className="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{step.id}</span>
                  )}
                </button>

                <div className="flex-1 pt-1">
                  <p
                    className={`font-medium ${
                      step.status === 'active'
                        ? 'text-primary'
                        : step.status === 'completed'
                        ? 'text-[#059669]'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button
              onClick={onInfra}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Building2 className="size-4" />
              <span>Thuê Hạ tầng</span>
            </button>
            <button
              onClick={onPoCResult}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Upload className="size-4" />
              <span>Cập nhật Kết quả</span>
            </button>
            <button
              onClick={onComplete}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#059669] bg-white px-4 py-2.5 text-sm font-medium text-[#059669] transition-colors hover:bg-[#d1fae5]"
            >
              <Handshake className="size-4" />
              <span>Hoàn thành Giao dịch</span>
            </button>
          </div>

          {/* PoC Log */}
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Nhật ký PoC</h4>
            <div className="space-y-3">
              {pocLogs.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="mx-auto mb-3 size-12 text-[#9ca3af]" />
                  <p className="text-sm text-muted-foreground">Chưa có nhật ký PoC</p>
                </div>
              ) : (
                pocLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
                    <p className="text-sm font-medium text-foreground">{log.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>{log.date}</span>
                    </p>
                    <p className="mb-3 text-sm text-[#4b5563]">{log.result}</p>
                    <button className="flex w-full items-center gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-[#f3f4f6]">
                      {getFileIcon(log.file.type)}
                      <span className="flex-1 text-left text-sm text-[#4b5563]">{log.file.name}</span>
                      <Download className="size-4 text-primary" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Files & Media */}
        <div className="p-6">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Files đã gửi</h4>
          <div className="space-y-2">
            {[
              { name: 'Hop_dong_goc.pdf', meta: '2.4 MB · 15/01/2026', color: 'text-[#dc2626]' },
              { name: 'Bao_cao_PoC_lan_1.pdf', meta: '1.8 MB · 22/01/2026', color: 'text-[#dc2626]' },
              { name: 'Bao_cao_PoC_lan_2.xlsx', meta: '856 KB · 28/01/2026', color: 'text-[#16a34a]' },
            ].map((file) => (
              <button key={file.name} className="flex w-full items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white p-3 transition-colors hover:bg-[#f9fafb]">
                <FileText className={`size-5 ${file.color}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.meta}</p>
                </div>
                <Download className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Media</h4>
            <div className="grid grid-cols-2 gap-2">
              {['from-primary to-primary/90', 'from-[#6366f1] to-[#4f46e5]', 'from-[#ea580c] to-[#dc2626]', 'from-[#059669] to-[#047857]'].map((gradient, i) => (
                <div key={i} className={`aspect-square rounded-lg bg-gradient-to-br ${gradient}`} />
              ))}
            </div>
          </div>

          {/* Leave Button */}
          <div className="mt-8 border-t border-[#e5e7eb] pt-6">
            <button
              onClick={onLeave}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#dc2626] bg-white px-4 py-3 text-sm font-medium text-[#dc2626] transition-colors hover:bg-[#fef2f2]"
            >
              <LogOut className="size-4" />
              <span>Rời khỏi cuộc trò chuyện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
