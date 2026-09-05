import { useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { PageHeader } from '@/shared/components/header/PageHeader';
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal';
import { Eye, FileDown, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type AssessmentStatus = 'draft' | 'submitted' | 'reviewing' | 'completed' | 'rejected';

export interface AssessmentRequest {
  id: string;
  unitName: string;
  unitType: 'university' | 'research-institute' | 'enterprise' | 'startup';
  submittedDate: string;
  status: AssessmentStatus;
}

const mockData: AssessmentRequest[] = [
  {
    id: '1',
    unitName: 'Đại học Bách Khoa Hà Nội',
    unitType: 'university',
    submittedDate: '15/02/2026',
    status: 'completed',
  },
  {
    id: '2',
    unitName: 'Viện Nghiên cứu Công nghệ Cao',
    unitType: 'research-institute',
    submittedDate: '20/02/2026',
    status: 'reviewing',
  },
  {
    id: '3',
    unitName: 'Công ty TNHH FPT Software',
    unitType: 'enterprise',
    submittedDate: '10/02/2026',
    status: 'submitted',
  },
  {
    id: '4',
    unitName: 'Startup AI Vision Tech',
    unitType: 'startup',
    submittedDate: '05/02/2026',
    status: 'draft',
  },
  {
    id: '5',
    unitName: 'Trường Đại học Khoa học Tự nhiên',
    unitType: 'university',
    submittedDate: '01/02/2026',
    status: 'rejected',
  },
];

interface InnovationAssessmentPageProps {
  onNavigate?: (itemId: string) => void;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export function InnovationAssessmentPage({
  onNavigate,
  onCreate,
  onEdit,
  onViewDetail,
}: InnovationAssessmentPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | AssessmentStatus>('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null,
  });

  const getUnitTypeLabel = (type: AssessmentRequest['unitType']) => {
    const labels = {
      university: 'Trường đại học',
      'research-institute': 'Viện nghiên cứu',
      enterprise: 'Doanh nghiệp',
      startup: 'Startup',
    };
    return labels[type];
  };

  const getStatusBadge = (status: AssessmentStatus) => {
    const statusConfig = {
      draft: { label: 'Nháp', className: 'bg-[#f3f4f6] text-muted-foreground' },
      submitted: { label: 'Chờ tiếp nhận', className: 'bg-[#fef3c7] text-[#92400e]' },
      reviewing: { label: 'Đang đánh giá', className: 'bg-[#dbeafe] text-[#1e40af]' },
      completed: { label: 'Hoàn tất', className: 'bg-[#dcfce7] text-[#166534]' },
      rejected: { label: 'Bị từ chối', className: 'bg-[#fee2e2] text-[#991b1b]' },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const filteredData =
    activeTab === 'all' ? mockData : mockData.filter((item) => item.status === activeTab);

  const tabs = [
    { id: 'all', label: 'Tất cả', count: mockData.length },
    { id: 'draft', label: 'Nháp', count: mockData.filter((i) => i.status === 'draft').length },
    {
      id: 'submitted',
      label: 'Chờ tiếp nhận',
      count: mockData.filter((i) => i.status === 'submitted').length,
    },
    {
      id: 'reviewing',
      label: 'Đang đánh giá',
      count: mockData.filter((i) => i.status === 'reviewing').length,
    },
    {
      id: 'completed',
      label: 'Hoàn tất',
      count: mockData.filter((i) => i.status === 'completed').length,
    },
    {
      id: 'rejected',
      label: 'Bị từ chối',
      count: mockData.filter((i) => i.status === 'rejected').length,
    },
  ];

  const handleDelete = () => {
    toast.success('Đã xóa hồ sơ đánh giá');
    setDeleteModal({ show: false, id: null });
  };

  const handleDownloadPDF = (id: string, unitName: string) => {
    toast.success(`Đang tải báo cáo đánh giá "${unitName}"`);
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="service-innovation-assessment" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Page Header */}
        <PageHeader
          title="Đánh giá năng lực đổi mới sáng tạo"
          description="Quản lý và theo dõi các hồ sơ đánh giá năng lực đổi mới sáng tạo của bạn"
          actionLabel="Tạo yêu cầu đánh giá"
          onAction={onCreate}
        />

        {/* Content */}
        <div className="px-8 py-6">
          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'bg-white text-muted-foreground hover:bg-[#f3f4f6]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 ${activeTab === tab.id ? 'text-primary' : 'text-[#9ca3af]'}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Tên đơn vị
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Loại hình
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      Không có hồ sơ đánh giá nào
                    </td>
                  </tr>
                ) : (
                  filteredData.map((request) => (
                    <tr key={request.id} className="transition-colors hover:bg-[#f9fafb]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{request.unitName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-muted-foreground">
                          {getUnitTypeLabel(request.unitType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {request.submittedDate}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Draft */}
                          {request.status === 'draft' && (
                            <>
                              <button
                                onClick={() => onEdit?.(request.id)}
                                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-white transition-colors hover:bg-primary/90"
                              >
                                <Edit className="size-4" />
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={() => setDeleteModal({ show: true, id: request.id })}
                                className="rounded-lg p-2 text-[#dc2626] transition-colors hover:bg-[#fee2e2]"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}

                          {/* Submitted / Reviewing */}
                          {(request.status === 'submitted' || request.status === 'reviewing') && (
                            <button
                              onClick={() => onViewDetail?.(request.id)}
                              className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#4b5563] transition-colors hover:bg-[#f3f4f6]"
                            >
                              <Eye className="size-4" />
                              Xem chi tiết
                            </button>
                          )}

                          {/* Completed */}
                          {request.status === 'completed' && (
                            <>
                              <button
                                onClick={() => onViewDetail?.(request.id)}
                                className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#4b5563] transition-colors hover:bg-[#f3f4f6]"
                              >
                                <Eye className="size-4" />
                                Xem báo cáo
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(request.id, request.unitName)}
                                className="flex items-center gap-2 rounded-lg bg-[#16a34a] px-3 py-2 text-sm text-white transition-colors hover:bg-[#15803d]"
                              >
                                <FileDown className="size-4" />
                                Tải PDF
                              </button>
                            </>
                          )}

                          {/* Rejected */}
                          {request.status === 'rejected' && (
                            <button
                              onClick={() => onEdit?.(request.id)}
                              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-white transition-colors hover:bg-primary/90"
                            >
                              <Edit className="size-4" />
                              Chỉnh sửa & Gửi lại
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <DeleteConfirmModal
          isOpen={deleteModal.show}
          title="Xác nhận xóa hồ sơ đánh giá"
          message="Bạn có chắc chắn muốn xóa hồ sơ đánh giá này? Hành động này không thể hoàn tác."
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ show: false, id: null })}
        />
      )}
    </DashboardLayout>
  );
}
