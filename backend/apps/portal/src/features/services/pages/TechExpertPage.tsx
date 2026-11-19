import { useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { PageHeader } from '@/shared/components/header/PageHeader';
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal';
import { ResponsivePageSection } from '@/shared/components/layout/ResponsivePageSection';
import { Eye, FileDown, Edit, Trash2, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type ExpertRequestStatus = 'draft' | 'receiving' | 'coordinating' | 'completed' | 'rejected';

export interface ExpertRequest {
  id: string;
  projectName: string;
  techField: string;
  submittedDate: string;
  status: ExpertRequestStatus;
}

const mockData: ExpertRequest[] = [
  {
    id: '1',
    projectName: 'Phát triển hệ thống AI chẩn đoán bệnh từ xa',
    techField: 'Công nghệ Y tế',
    submittedDate: '15/02/2026',
    status: 'completed',
  },
  {
    id: '2',
    projectName: 'Nghiên cứu vật liệu sinh học phân hủy',
    techField: 'Công nghệ Sinh học',
    submittedDate: '20/02/2026',
    status: 'coordinating',
  },
  {
    id: '3',
    projectName: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng',
    techField: 'Công nghệ Thông tin',
    submittedDate: '18/02/2026',
    status: 'receiving',
  },
  {
    id: '4',
    projectName: 'Hệ thống IoT giám sát nông nghiệp thông minh',
    techField: 'Công nghệ Nông nghiệp',
    submittedDate: '12/02/2026',
    status: 'draft',
  },
  {
    id: '5',
    projectName: 'Pin lithium thế hệ mới cho xe điện',
    techField: 'Năng lượng tái tạo',
    submittedDate: '08/02/2026',
    status: 'rejected',
  },
];

interface TechExpertPageProps {
  onNavigate?: (itemId: string) => void;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export function TechExpertPage({
  onNavigate,
  onCreate,
  onEdit,
  onViewDetail,
}: TechExpertPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | ExpertRequestStatus>('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null,
  });

  const filteredData =
    activeTab === 'all' ? mockData : mockData.filter((item) => item.status === activeTab);

  const tabs = [
    { id: 'all', label: 'Tất cả', count: mockData.length },
    { id: 'draft', label: 'Nháp', count: mockData.filter((i) => i.status === 'draft').length },
    {
      id: 'receiving',
      label: 'Đang tiếp nhận',
      count: mockData.filter((i) => i.status === 'receiving').length,
    },
    {
      id: 'coordinating',
      label: 'Đang phối hợp',
      count: mockData.filter((i) => i.status === 'coordinating').length,
    },
    {
      id: 'completed',
      label: 'Hoàn tất',
      count: mockData.filter((i) => i.status === 'completed').length,
    },
    {
      id: 'rejected',
      label: 'Không được chấp thuận',
      count: mockData.filter((i) => i.status === 'rejected').length,
    },
  ];

  const handleDelete = () => {
    toast.success('Đã xóa yêu cầu chuyên gia');
    setDeleteModal({ show: false, id: null });
  };

  const getStatusBadge = (status: ExpertRequestStatus) => {
    const config = {
      draft: { label: 'Nháp', className: 'bg-[#f3f4f6] text-muted-foreground' },
      receiving: { label: 'Đang tiếp nhận', className: 'bg-[#dbeafe] text-[#1e40af]' },
      coordinating: { label: 'Đang phối hợp', className: 'bg-[#fef3c7] text-[#92400e]' },
      completed: { label: 'Hoàn tất', className: 'bg-[#dcfce7] text-[#166534]' },
      rejected: { label: 'Không được chấp thuận', className: 'bg-[#fee2e2] text-[#991b1b]' },
    };

    const { label, className } = config[status];
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const renderActionButtons = (request: ExpertRequest) => (
    <div className="flex flex-wrap items-center gap-2">
      {request.status === 'draft' && (
        <>
          <button
            onClick={() => onEdit?.(request.id)}
            className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
            title="Chỉnh sửa"
          >
            <Edit className="size-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ show: true, id: request.id })}
            className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
            title="Xóa"
          >
            <Trash2 className="size-4" />
          </button>
        </>
      )}

      {request.status === 'receiving' && (
        <button
          onClick={() => onViewDetail?.(request.id)}
          className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
          title="Xem chi tiết"
        >
          <Eye className="size-4" />
        </button>
      )}

      {request.status === 'coordinating' && (
        <button
          onClick={() => onViewDetail?.(request.id)}
          className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-[#f9fafb]"
          title="Xem tiến độ"
        >
          <Clock className="size-4" />
          Xem tiến độ
        </button>
      )}

      {request.status === 'completed' && (
        <>
          <button
            onClick={() => onViewDetail?.(request.id)}
            className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
            title="Xem kết quả"
          >
            <Eye className="size-4" />
          </button>
          <button
            onClick={() => toast.success('Đang tải báo cáo...')}
            className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
            title="Tải báo cáo"
          >
            <FileDown className="size-4" />
          </button>
        </>
      )}

      {request.status === 'rejected' && (
        <>
          <button
            onClick={() => onViewDetail?.(request.id)}
            className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-[#f9fafb]"
            title="Xem lý do"
          >
            <Eye className="size-4" />
            Xem lý do
          </button>
          <button
            onClick={() => {
              toast.success('Đã gửi lại yêu cầu');
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-[#f9fafb]"
            title="Gửi lại yêu cầu"
          >
            <RotateCcw className="size-4" />
            Gửi lại
          </button>
        </>
      )}
    </div>
  );

  return (
    <DashboardLayout contentOnly activeMenuItem="service-tech-expert" onNavigate={onNavigate}>
      <div className="min-h-svh bg-[#f9fafb]">
        {/* Page Header */}
        <PageHeader
          title="Chuyên gia công nghệ dẫn dắt"
          description="Quản lý các yêu cầu đề nghị chuyên gia công nghệ hỗ trợ nghiên cứu và phát triển sản phẩm"
          actionLabel="Tạo yêu cầu chuyên gia"
          onAction={onCreate}
        />

        {/* Content */}
        <div className="responsive-page-container responsive-page-stack">
          {/* Filter Tabs */}
          <ResponsivePageSection className="p-3 sm:p-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-muted-foreground hover:bg-[#f3f4f6]'
                }`}
              >
                {tab.label}{' '}
                <span
                  className={`ml-1.5 ${
                    activeTab === tab.id ? 'text-white/80' : 'text-[#9ca3af]'
                  }`}
                >
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
          </ResponsivePageSection>

          <div className="space-y-3 md:hidden">
            {filteredData.length === 0 ? (
              <ResponsivePageSection className="px-4 py-10 text-center">
                <div className="text-sm text-[#9ca3af]">Không có yêu cầu nào</div>
              </ResponsivePageSection>
            ) : (
              filteredData.map((request) => (
                <ResponsivePageSection key={request.id} className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{request.projectName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{request.techField}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{request.submittedDate}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    {renderActionButtons(request)}
                  </div>
                </ResponsivePageSection>
              ))
            )}
          </div>

          {/* Table */}
          <ResponsivePageSection className="hidden overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-0 shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tên dự án / Ý tưởng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Lĩnh vực công nghệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-[#9ca3af]">Không có yêu cầu nào</div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((request) => (
                      <tr key={request.id} className="hover:bg-[#f9fafb]">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{request.projectName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">{request.techField}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">{request.submittedDate}</div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                        <td className="px-6 py-4">
                          {renderActionButtons(request)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ResponsivePageSection>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleDelete}
        title="Xóa yêu cầu chuyên gia"
        message="Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn tác."
      />
    </DashboardLayout>
  );
}
