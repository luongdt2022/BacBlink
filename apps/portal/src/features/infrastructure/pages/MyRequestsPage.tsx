import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, X, QrCode, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface MyRequestsPageProps {
  onNavigate?: (itemId: string) => void;
  onBack?: () => void;
}

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface BookingRequest {
  id: string;
  equipmentName: string;
  projectName: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
}

const mockBookingRequests: BookingRequest[] = [
  {
    id: 'req1',
    equipmentName: 'Máy in 3D công nghiệp SLA',
    projectName: 'Hệ thống xử lý nước thải dệt nhuộm',
    projectId: '1',
    startDate: '10/02/2026',
    endDate: '15/02/2026',
    status: 'approved',
    createdAt: '05/02/2026',
  },
  {
    id: 'req2',
    equipmentName: 'Phòng Lab IoT & Sensors',
    projectName: 'Công nghệ AI phân tích dữ liệu',
    projectId: '2',
    startDate: '20/02/2026',
    endDate: '25/02/2026',
    status: 'pending',
    createdAt: '04/02/2026',
  },
  {
    id: 'req3',
    equipmentName: 'Máy quang phổ hấp thụ UV-Vis',
    projectName: 'Hệ thống IoT giám sát môi trường',
    projectId: '3',
    startDate: '01/02/2026',
    endDate: '05/02/2026',
    status: 'rejected',
    rejectionReason: 'Thiết bị đang trong kế hoạch bảo trì. Vui lòng đặt lịch vào tháng sau.',
    createdAt: '28/01/2026',
  },
  {
    id: 'req4',
    equipmentName: 'Máy CNC kim loại 5 trục',
    projectName: 'Sản xuất linh kiện ô tô điện',
    projectId: '4',
    startDate: '15/02/2026',
    endDate: '20/02/2026',
    status: 'approved',
    createdAt: '03/02/2026',
  },
];

const getRequestStatusConfig = (status: RequestStatus) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Chờ duyệt',
        bgColor: 'bg-[#ffedd5]',
        textColor: 'text-[#ea580c]',
        icon: Clock,
      };
    case 'approved':
      return {
        label: 'Đã duyệt',
        bgColor: 'bg-[#d1fae5]',
        textColor: 'text-[#059669]',
        icon: CheckCircle2,
      };
    case 'rejected':
      return {
        label: 'Từ chối',
        bgColor: 'bg-[#fee2e2]',
        textColor: 'text-[#dc2626]',
        icon: XCircle,
      };
  }
};

export function MyRequestsPage({ onNavigate, onBack }: MyRequestsPageProps) {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(mockBookingRequests);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);

  const handleCancelRequest = (requestId: string) => {
    setBookingRequests(bookingRequests.filter(req => req.id !== requestId));
    toast.success('Đã hủy yêu cầu thành công');
  };

  const handleShowQR = (request: BookingRequest) => {
    setSelectedRequest(request);
    setShowQRModal(true);
  };

  const handleNavigateToDealRoom = (projectId: string) => {
    onNavigate?.('deal-room');
    toast.info(`Chuyển tới phòng đàm phán dự án #${projectId}`);
  };

  return (
    <DashboardLayout contentOnly activeMenuItem="infrastructure" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border bg-white px-8 py-6">
          <div className="mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              <span>Quay lại Hạ tầng & PoC</span>
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Lịch sử yêu cầu của tôi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý các yêu cầu đặt lịch thiết bị và phòng Lab
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="rounded-lg border border bg-white">
            {bookingRequests.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#f9fafb] p-6">
                    <Clock className="size-12 text-[#9ca3af]" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Chưa có yêu cầu nào
                </h3>
                <p className="text-sm text-muted-foreground">
                  Các yêu cầu đặt lịch thiết bị sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border bg-[#f9fafb]">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Tên thiết bị
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Thuộc dự án
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
                    {bookingRequests.map((request) => {
                      const statusConfig = getRequestStatusConfig(request.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <tr key={request.id} className="border-b border last:border-0">
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">{request.equipmentName}</p>
                            <p className="mt-0.5 text-xs text-[#9ca3af]">
                              Tạo ngày: {request.createdAt}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleNavigateToDealRoom(request.projectId)}
                              className="flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/90 hover:underline"
                            >
                              <span>{request.projectName}</span>
                              <ExternalLink className="size-3.5" />
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                              {request.startDate} - {request.endDate}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`size-4 ${statusConfig.textColor}`} />
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                            {request.status === 'rejected' && request.rejectionReason && (
                              <div className="mt-2 rounded-lg bg-[#fef2f2] p-3">
                                <p className="text-xs text-[#dc2626]">
                                  <span className="font-semibold">Lý do từ chối:</span>
                                  <br />
                                  {request.rejectionReason}
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {request.status === 'pending' && (
                              <button
                                onClick={() => handleCancelRequest(request.id)}
                                className="rounded-lg border border-[#dc2626] bg-white px-4 py-2 text-sm font-medium text-[#dc2626] transition-colors hover:bg-[#fef2f2]"
                              >
                                Hủy yêu cầu
                              </button>
                            )}
                            {request.status === 'approved' && (
                              <button
                                onClick={() => handleShowQR(request)}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                              >
                                <QrCode className="size-4" />
                                <span>Lấy mã vào cửa</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-foreground">Mã vào cửa (QR Code)</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-6 flex justify-center">
              <div className="rounded-lg border-4 border-primary p-4">
                <div className="flex size-64 items-center justify-center bg-[#f9fafb]">
                  <QrCode className="size-32 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-[#e0f2fe] p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã booking:</span>
                    <span className="font-semibold text-primary">{selectedRequest.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thiết bị:</span>
                    <span className="font-medium text-foreground">{selectedRequest.equipmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium text-foreground">
                      {selectedRequest.startDate} - {selectedRequest.endDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#fffbeb] p-4">
                <p className="text-center text-sm text-[#92400e]">
                  <span className="font-semibold">Lưu ý:</span> Vui lòng xuất trình mã QR này tại quầy lễ tân để được cấp quyền truy cập.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  toast.success('Đã tải xuống mã QR');
                  setShowQRModal(false);
                }}
                className="flex-1 rounded-lg border border bg-white px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
              >
                Tải xuống
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
