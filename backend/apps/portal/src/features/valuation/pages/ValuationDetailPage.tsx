import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { ValuationStatusBadge } from '@/shared/components/badges/ValuationStatusBadge';
import { ChevronLeft, FileDown, File, User, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ValuationDetailPageProps {
  onBack: () => void;
  onNavigate?: (itemId: string) => void;
  valuationId?: string;
}

export function ValuationDetailPage({ onBack, onNavigate, valuationId: _valuationId }: ValuationDetailPageProps) {
  // Mock data - in real app, fetch based on valuationId
  const mockData = {
    id: '1',
    techName: 'Hệ thống chẩn đoán bệnh thông minh AI',
    field: 'Công nghệ Y tế',
    description: 'Hệ thống sử dụng AI và machine learning để phân tích hình ảnh y khoa, hỗ trợ bác sĩ chẩn đoán các bệnh lý phổ biến với độ chính xác cao. Công nghệ đã được thử nghiệm lâm sàng tại 5 bệnh viện lớn.',
    patentNumber: 'VN123456',
    trlLevel: 7,
    serviceType: 'professional-report',
    additionalServices: ['risk-analysis', 'cash-flow', 'market-comparison'],
    submittedDate: '15/02/2026',
    status: 'completed' as const,
    documents: [
      { name: 'Bang-sang-che-VN123456.pdf', size: '2.4 MB' },
      { name: 'Bao-cao-nghien-cuu.pdf', size: '5.1 MB' },
      { name: 'Phan-tich-thi-truong.xlsx', size: '1.8 MB' },
    ],
    notes: 'Mục đích định giá để đàm phán đầu tư với quỹ đầu tư mạo hiểm. Yêu cầu đánh giá tiềm năng thương mại hóa trong 3 năm tới.',
    expert: {
      name: 'TS. Trần Văn B',
      role: 'Chuyên gia định giá công nghệ',
    },
    completedDate: '22/02/2026',
    reportUrl: '#',
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      patent: 'Định giá sáng chế',
      'ip-assessment': 'Đánh giá tài sản trí tuệ',
      'professional-report': 'Báo cáo định giá chuyên nghiệp',
    };
    return labels[type] || type;
  };

  const getAdditionalServiceLabel = (id: string) => {
    const labels: Record<string, string> = {
      'risk-analysis': 'Phân tích rủi ro',
      'cash-flow': 'Dự báo dòng tiền',
      'market-comparison': 'So sánh thị trường',
      'independent-audit': 'Hỗ trợ thẩm định độc lập',
    };
    return labels[id] || id;
  };

  const handleDownloadReport = () => {
    toast.success(`Đang tải báo cáo định giá "${mockData.techName}"`);
  };

  const timelineSteps = [
    { id: 1, label: 'Chờ tiếp nhận', completed: true },
    { id: 2, label: 'Đang thẩm định', completed: true },
    { id: 3, label: 'Hoàn tất', completed: mockData.status === 'completed' },
  ];

  return (
    <DashboardLayout contentOnly activeMenuItem="service-valuation" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border-[#e5e7eb] bg-white px-8 py-5">
          <button
            onClick={onBack}
            className="mb-2 flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="size-5" />
            <span>Quay lại danh sách</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-foreground">{mockData.techName}</h1>
              <div className="flex items-center gap-3">
                <ValuationStatusBadge status={mockData.status} />
                <span className="text-sm text-muted-foreground">
                  Gửi ngày: {mockData.submittedDate}
                </span>
              </div>
            </div>
            {mockData.status === 'completed' && (
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 rounded-lg bg-[#16a34a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#15803d]"
              >
                <FileDown className="size-4" />
                Tải báo cáo PDF
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Section 1: Thông tin công nghệ */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Thông tin công nghệ
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Lĩnh vực</label>
                    <p className="mt-1 text-foreground">{mockData.field}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mô tả chi tiết</label>
                    <p className="mt-1 leading-relaxed text-foreground">{mockData.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Số bằng sáng chế</label>
                      <p className="mt-1 font-mono text-foreground">{mockData.patentNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mức độ TRL</label>
                      <p className="mt-1 text-foreground">TRL {mockData.trlLevel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Phạm vi định giá */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Phạm vi định giá
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Loại dịch vụ</label>
                    <p className="mt-1 text-foreground">
                      {getServiceTypeLabel(mockData.serviceType)}
                    </p>
                  </div>
                  {mockData.additionalServices.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Dịch vụ bổ sung
                      </label>
                      <ul className="mt-2 space-y-2">
                        {mockData.additionalServices.map((service) => (
                          <li
                            key={service}
                            className="flex items-center gap-2 text-sm text-foreground"
                          >
                            <CheckCircle2 className="size-4 text-[#16a34a]" />
                            {getAdditionalServiceLabel(service)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Tài liệu đính kèm */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Tài liệu đính kèm
                </h2>
                <div className="space-y-2">
                  {mockData.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <File className="size-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                      <button className="text-sm text-primary hover:underline">
                        Tải xuống
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Ghi chú */}
              {mockData.notes && (
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Ghi chú cho hội đồng định giá
                  </h2>
                  <p className="leading-relaxed text-[#4b5563]">{mockData.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-foreground">Tiến độ xử lý</h3>
                <div className="relative">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="relative pb-8 last:pb-0">
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`absolute left-3 top-6 h-full w-0.5 ${
                            step.completed ? 'bg-[#16a34a]' : 'bg-[#e5e7eb]'
                          }`}
                        />
                      )}
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                            step.completed
                              ? 'bg-[#16a34a] text-white'
                              : 'border-2 border-[#e5e7eb] bg-white'
                          }`}
                        >
                          {step.completed && <CheckCircle2 className="size-4" />}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              step.completed ? 'text-foreground' : 'text-[#9ca3af]'
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expert Info (if completed) */}
              {mockData.status === 'completed' && (
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-foreground">Chuyên gia phụ trách</h3>
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                      <User className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{mockData.expert.name}</p>
                      <p className="text-sm text-muted-foreground">{mockData.expert.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>Hoàn tất: {mockData.completedDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}