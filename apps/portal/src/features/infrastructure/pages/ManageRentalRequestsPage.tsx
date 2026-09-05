import { useState } from 'react';
import { ArrowLeft, ExternalLink, Check, X, QrCode, User } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface ManageRentalRequestsPageProps {
  onNavigate?: (itemId: string) => void;
  onBack?: () => void;
}

type RequestStatus = 'pending' | 'approved' | 'rejected';
type FilterTab = 'all' | 'pending' | 'approved' | 'history';

interface RentalRequest {
  id: string;
  renterName: string;
  renterAvatar: string;
  projectName: string;
  projectId: string;
  equipmentName: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  status: RequestStatus;
  requestedAt: string;
}

const mockRentalRequests: RentalRequest[] = [
  {
    id: 'req1',
    renterName: 'Nguyễn Văn A',
    renterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    projectName: 'Dự án AI Nhận diện khuôn mặt',
    projectId: 'proj1',
    equipmentName: 'Máy in 3D công nghiệp SLA',
    equipmentId: 'eq1',
    startDate: '2026-02-10 09:00',
    endDate: '2026-02-10 17:00',
    status: 'pending',
    requestedAt: '2026-02-04 10:30',
  },
  {
    id: 'req2',
    renterName: 'Trần Thị B',
    renterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    projectName: 'Nghiên cứu vật liệu Nano',
    projectId: 'proj2',
    equipmentName: 'Phòng Lab Công nghệ sinh học',
    equipmentId: 'eq2',
    startDate: '2026-02-12 08:00',
    endDate: '2026-02-12 18:00',
    status: 'pending',
    requestedAt: '2026-02-04 11:15',
  },
  {
    id: 'req3',
    renterName: 'Lê Minh C',
    renterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    projectName: 'Phát triển cảm biến IoT',
    projectId: 'proj3',
    equipmentName: 'Máy CNC kim loại 5 trục',
    equipmentId: 'eq3',
    startDate: '2026-02-08 13:00',
    endDate: '2026-02-08 16:00',
    status: 'pending',
    requestedAt: '2026-02-04 14:20',
  },
  {
    id: 'req4',
    renterName: 'Phạm Thị D',
    renterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    projectName: 'Hệ thống xử lý nước thông minh',
    projectId: 'proj4',
    equipmentName: 'Máy in 3D công nghiệp SLA',
    equipmentId: 'eq1',
    startDate: '2026-02-06 10:00',
    endDate: '2026-02-06 15:00',
    status: 'approved',
    requestedAt: '2026-02-03 09:00',
  },
  {
    id: 'req5',
    renterName: 'Hoàng Văn E',
    renterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    projectName: 'Thiết bị y tế thông minh',
    projectId: 'proj5',
    equipmentName: 'Phòng Lab Công nghệ sinh học',
    equipmentId: 'eq2',
    startDate: '2026-02-05 14:00',
    endDate: '2026-02-05 17:00',
    status: 'approved',
    requestedAt: '2026-02-02 16:30',
  },
  {
    id: 'req6',
    renterName: 'Vũ Thị F',
    renterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    projectName: 'Robot tự động hóa',
    projectId: 'proj6',
    equipmentName: 'Máy CNC kim loại 5 trục',
    equipmentId: 'eq3',
    startDate: '2026-02-01 09:00',
    endDate: '2026-02-01 12:00',
    status: 'rejected',
    requestedAt: '2026-02-01 08:00',
  },
];

const getStatusConfig = (status: RequestStatus) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Chờ duyệt',
        bgColor: 'bg-[#ffedd5]',
        textColor: 'text-[#ea580c]',
      };
    case 'approved':
      return {
        label: 'Đã duyệt',
        bgColor: 'bg-[#d1fae5]',
        textColor: 'text-[#059669]',
      };
    case 'rejected':
      return {
        label: 'Đã từ chối',
        bgColor: 'bg-[#fee2e2]',
        textColor: 'text-[#dc2626]',
      };
  }
};

export function ManageRentalRequestsPage({ onNavigate, onBack }: ManageRentalRequestsPageProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [requests, setRequests] = useState<RentalRequest[]>(mockRentalRequests);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);

  // Filter requests based on active tab
  const filteredRequests = requests.filter((req) => {
    switch (activeTab) {
      case 'pending':
        return req.status === 'pending';
      case 'approved':
        return req.status === 'approved';
      case 'history':
        return req.status === 'rejected';
      default:
        return true;
    }
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const handleApprove = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: 'approved' as RequestStatus } : req
      )
    );
    toast.success('Đã duyệt yêu cầu thuê thiết bị');
  };

  const handleReject = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: 'rejected' as RequestStatus } : req
      )
    );
    toast.error('Đã từ chối yêu cầu thuê thiết bị');
  };

  const handleGrantAccess = (request: RentalRequest) => {
    setSelectedRequest(request);
    setShowQRModal(true);
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="infrastructure" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border bg-white px-8 py-6">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            <span>Quay lại danh sách thiết bị</span>
          </button>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Hộp thư Yêu cầu thuê</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý các yêu cầu thuê thiết bị từ các nhà nghiên cứu khác
            </p>
          </div>

          {/* Tab Filters */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-muted-foreground hover:bg-[#f9fafb]'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-primary text-white'
                  : 'bg-white text-muted-foreground hover:bg-[#f9fafb]'
              }`}
            >
              Chờ duyệt
              {pendingCount > 0 && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === 'pending'
                      ? 'bg-white text-primary'
                      : 'bg-[#dc2626] text-white'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'bg-primary text-white'
                  : 'bg-white text-muted-foreground hover:bg-[#f9fafb]'
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-primary text-white'
                  : 'bg-white text-muted-foreground hover:bg-[#f9fafb]'
              }`}
            >
              Lịch sử
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Table */}
          {filteredRequests.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border bg-white">
              <table className="w-full">
                <thead className="border-b border bg-[#f9fafb]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Người thuê
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Thiết bị
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request, index) => {
                    const statusConfig = getStatusConfig(request.status);
                    return (
                      <tr
                        key={request.id}
                        className={`${
                          index !== filteredRequests.length - 1 ? 'border-b border' : ''
                        } transition-colors hover:bg-[#f9fafb]`}
                      >
                        {/* Renter Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <img
                              src={request.renterAvatar}
                              alt={request.renterName}
                              className="size-10 rounded-md object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground">{request.renterName}</p>
                              <button
                                onClick={() => {
                                  toast.info(`Xem dự án: ${request.projectName}`);
                                }}
                                className="mt-1 flex items-center gap-1 text-sm text-primary transition-colors hover:underline"
                              >
                                <span>{request.projectName}</span>
                                <ExternalLink className="size-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Equipment Column */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-foreground">
                            {request.equipmentName}
                          </p>
                        </td>

                        {/* Time Column */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">
                              {new Date(request.startDate).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="mt-0.5">
                              {new Date(request.startDate).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {new Date(request.endDate).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-right">
                          {request.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-[#059669] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#047857]"
                              >
                                <Check className="size-4" />
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-[#dc2626] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b91c1c]"
                              >
                                <X className="size-4" />
                                <span>Từ chối</span>
                              </button>
                            </div>
                          )}
                          {request.status === 'approved' && (
                            <button
                              onClick={() => handleGrantAccess(request)}
                              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                            >
                              <QrCode className="size-4" />
                              <span>Cấp quyền Access</span>
                            </button>
                          )}
                          {request.status === 'rejected' && (
                            <span className="text-sm text-[#9ca3af]">Không có hành động</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center rounded-lg border border bg-white py-16">
              <div className="mb-4 rounded-full bg-[#f9fafb] p-4">
                <User className="size-8 text-[#9ca3af]" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Không có yêu cầu nào
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'pending' && 'Chưa có yêu cầu nào đang chờ duyệt'}
                {activeTab === 'approved' && 'Chưa có yêu cầu nào được duyệt'}
                {activeTab === 'history' && 'Chưa có yêu cầu nào bị từ chối'}
                {activeTab === 'all' && 'Chưa có yêu cầu thuê thiết bị nào'}
              </p>
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Mã QR Access</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* QR Code */}
              <div className="mb-4 flex flex-col items-center">
                <div className="mb-4 rounded-lg border-2 border bg-white p-4">
                  <div className="size-48 bg-gradient-to-br from-primary to-[#00a3ff]"></div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Người thuê: <span className="font-medium text-foreground">{selectedRequest.renterName}</span>
                </p>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                  Thiết bị: <span className="font-medium text-foreground">{selectedRequest.equipmentName}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toast.success('Đã gửi mã QR qua email');
                    setShowQRModal(false);
                  }}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Gửi qua Email
                </button>
                <button
                  onClick={() => {
                    toast.success('Đã tải mã QR xuống máy');
                    setShowQRModal(false);
                  }}
                  className="flex-1 rounded-lg border border bg-white px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
                >
                  Tải xuống
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
