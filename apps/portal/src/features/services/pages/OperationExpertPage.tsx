import { useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { PageHeader } from '@/shared/components/header/PageHeader';
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal';
import { ResponsivePageSection } from '@/shared/components/layout/ResponsivePageSection';
import { Eye, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

type RequestStatus = 'draft' | 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';

export interface OperationExpertRequest {
  id: string;
  requestName: string;
  expertField: string;
  createdDate: string;
  status: RequestStatus;
}

const mockData: OperationExpertRequest[] = [
  {
    id: '1',
    requestName: 'Tối ưu hóa quy trình sản xuất linh kiện điện tử',
    expertField: 'Vận hành sản xuất',
    createdDate: '15/02/2026',
    status: 'approved',
  },
  {
    id: '2',
    requestName: 'Chuyển đổi số trong quản lý doanh nghiệp',
    expertField: 'Chuyển đổi số',
    createdDate: '20/02/2026',
    status: 'in-progress',
  },
  {
    id: '3',
    requestName: 'Tư vấn tối ưu chuỗi cung ứng logistics',
    expertField: 'Chuỗi cung ứng',
    createdDate: '18/02/2026',
    status: 'pending',
  },
  {
    id: '4',
    requestName: 'Hỗ trợ quản trị tài chính doanh nghiệp vừa và nhỏ',
    expertField: 'Tài chính',
    createdDate: '12/02/2026',
    status: 'draft',
  },
  {
    id: '5',
    requestName: 'Xây dựng hệ thống quản trị chiến lược',
    expertField: 'Quản trị doanh nghiệp',
    createdDate: '08/02/2026',
    status: 'completed',
  },
  {
    id: '6',
    requestName: 'Tư vấn chuyển đổi mô hình kinh doanh online',
    expertField: 'Chuyển đổi số',
    createdDate: '05/02/2026',
    status: 'rejected',
  },
];

interface OperationExpertPageProps {
  onNavigate?: (itemId: string) => void;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export function OperationExpertPage({
  onNavigate,
  onCreate,
  onEdit,
  onViewDetail,
}: OperationExpertPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null,
  });

  const handleDelete = () => {
    toast.success('Đã xóa yêu cầu kết nối chuyên gia');
    setDeleteModal({ show: false, id: null });
  };

  const getStatusBadge = (status: RequestStatus) => {
    const config = {
      draft: { label: 'Nháp', className: 'bg-[#f3f4f6] text-muted-foreground' },
      pending: { label: 'Chờ phê duyệt', className: 'bg-[#fef3c7] text-[#92400e]' },
      approved: { label: 'Đã phê duyệt', className: 'bg-[#dcfce7] text-[#166534]' },
      'in-progress': { label: 'Đang thực hiện', className: 'bg-[#dbeafe] text-[#1e40af]' },
      completed: { label: 'Hoàn thành', className: 'bg-[#dcfce7] text-[#166534]' },
      rejected: { label: 'Bị từ chối', className: 'bg-[#fee2e2] text-[#991b1b]' },
    };

    const { label, className } = config[status];
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const filteredData = mockData.filter((item) => {
    const matchesSearch = item.requestName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderActionButtons = (request: OperationExpertRequest) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onViewDetail?.(request.id)}
        className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
        title="Xem chi tiết"
      >
        <Eye className="size-4" />
      </button>

      {(request.status === 'draft' || request.status === 'rejected') && (
        <button
          onClick={() => onEdit?.(request.id)}
          className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
          title="Chỉnh sửa"
        >
          <Edit className="size-4" />
        </button>
      )}

      {request.status === 'draft' && (
        <button
          onClick={() => setDeleteModal({ show: true, id: request.id })}
          className="rounded-lg border border-[#e5e7eb] bg-white p-2 text-muted-foreground transition-colors hover:bg-[#f9fafb]"
          title="Xóa"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout contentOnly activeMenuItem="service-operation-expert" onNavigate={onNavigate}>
      <div className="min-h-svh bg-[#f9fafb]">
        <PageHeader
          title="Chuyên gia vận hành"
          description="Quản lý các yêu cầu kết nối chuyên gia vận hành và hỗ trợ doanh nghiệp"
          actionLabel="Tạo yêu cầu kết nối chuyên gia"
          onAction={onCreate}
        />

        <div className="responsive-page-container responsive-page-stack">
          <ResponsivePageSection className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên yêu cầu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#e5e7eb] py-2 pl-10 pr-4 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-muted-foreground">Trạng thái:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="h-11 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Tất cả</option>
                  <option value="draft">Nháp</option>
                  <option value="pending">Chờ phê duyệt</option>
                  <option value="approved">Đã phê duyệt</option>
                  <option value="in-progress">Đang thực hiện</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="rejected">Bị từ chối</option>
                </select>
              </div>
            </div>
          </ResponsivePageSection>

          <div className="space-y-3 md:hidden">
            {filteredData.length === 0 ? (
              <ResponsivePageSection className="px-4 py-10 text-center">
                <div className="mx-auto flex max-w-md flex-col items-center">
                  <div className="mb-4 text-5xl">📋</div>
                  <p className="mb-2 text-base font-medium text-foreground">
                    Bạn chưa có yêu cầu kết nối chuyên gia nào
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Không tìm thấy kết quả phù hợp với tìm kiếm của bạn.'
                      : 'Bắt đầu bằng cách tạo yêu cầu kết nối chuyên gia mới.'}
                  </p>
                </div>
              </ResponsivePageSection>
            ) : (
              filteredData.map((request) => (
                <ResponsivePageSection key={request.id} className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">{request.requestName}</p>
                    <div className="text-xs text-muted-foreground">{request.expertField}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{request.createdDate}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    {renderActionButtons(request)}
                  </div>
                </ResponsivePageSection>
              ))
            )}
          </div>

          <ResponsivePageSection className="hidden overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-0 shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tên yêu cầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Lĩnh vực chuyên gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ngày tạo
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
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="mx-auto flex max-w-md flex-col items-center">
                          <div className="mb-4 text-6xl">📋</div>
                          <p className="mb-2 text-lg font-medium text-foreground">
                            Bạn chưa có yêu cầu kết nối chuyên gia nào
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                              ? 'Không tìm thấy kết quả phù hợp với tìm kiếm của bạn.'
                              : 'Bắt đầu bằng cách tạo yêu cầu kết nối chuyên gia mới.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((request) => (
                      <tr key={request.id} className="hover:bg-[#f9fafb]">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{request.requestName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">{request.expertField}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">{request.createdDate}</div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                        <td className="px-6 py-4">{renderActionButtons(request)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ResponsivePageSection>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleDelete}
        title="Xóa yêu cầu kết nối chuyên gia"
        message="Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn tác."
      />
    </DashboardLayout>
  );
}
