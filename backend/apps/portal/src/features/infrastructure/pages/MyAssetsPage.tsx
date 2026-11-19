import { useState } from 'react';
import { ArrowLeft, Plus, Eye, Power, Settings } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface MyAssetsPageProps {
  onNavigate?: (itemId: string) => void;
  onBack?: () => void;
  onCreateAsset?: () => void;
}

type AssetStatus = 'active' | 'inactive' | 'pending';

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: AssetStatus;
  isAvailable: boolean;
  createdAt: string;
  totalBookings: number;
  image: string;
}

interface BookingHistory {
  id: string;
  assetId: string;
  requester: string;
  dealName: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'upcoming';
}

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Phòng Lab Công nghệ sinh học',
    type: 'Phòng Lab',
    location: 'Hà Nội',
    status: 'active',
    isAvailable: true,
    createdAt: '2025-12-01',
    totalBookings: 15,
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
  },
  {
    id: '2',
    name: 'Máy quang phổ hấp thụ UV-Vis',
    type: 'Máy đo kiểm',
    location: 'Hà Nội',
    status: 'active',
    isAvailable: false,
    createdAt: '2025-11-15',
    totalBookings: 8,
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
  },
  {
    id: '3',
    name: 'Thiết bị phân tích vi sinh',
    type: 'Máy đo kiểm',
    location: 'Hà Nội',
    status: 'pending',
    isAvailable: false,
    createdAt: '2026-01-28',
    totalBookings: 0,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
  },
];

const mockBookingHistory: BookingHistory[] = [
  {
    id: '1',
    assetId: '1',
    requester: 'TS. Nguyễn Văn A - Viện Nghiên cứu Y học',
    dealName: 'Dự án Hệ thống xử lý nước thải - Tập đoàn Viettel',
    startDate: '2026-02-10',
    endDate: '2026-02-12',
    status: 'upcoming',
  },
  {
    id: '2',
    assetId: '1',
    requester: 'PGS. Trần Thị B - Đại học Bách Khoa',
    dealName: 'Công nghệ AI phân tích dữ liệu - Vingroup',
    startDate: '2026-01-20',
    endDate: '2026-01-22',
    status: 'completed',
  },
  {
    id: '3',
    assetId: '2',
    requester: 'TS. Lê Văn C - Viện Hóa học',
    dealName: 'Hệ thống IoT giám sát môi trường - FPT Corporation',
    startDate: '2026-02-05',
    endDate: '2026-02-06',
    status: 'upcoming',
  },
];

const getStatusConfig = (status: AssetStatus) => {
  switch (status) {
    case 'active':
      return {
        label: 'Đang hoạt động',
        bgColor: 'bg-[#d1fae5]',
        textColor: 'text-[#059669]',
      };
    case 'inactive':
      return {
        label: 'Tạm dừng',
        bgColor: 'bg-[#e5e7eb]',
        textColor: 'text-muted-foreground',
      };
    case 'pending':
      return {
        label: 'Chờ duyệt',
        bgColor: 'bg-[#fef3c7]',
        textColor: 'text-[#d97706]',
      };
  }
};

export function MyAssetsPage({ onNavigate, onBack, onCreateAsset }: MyAssetsPageProps) {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleToggleAvailability = (assetId: string) => {
    setAssets(
      assets.map((asset) =>
        asset.id === assetId
          ? { ...asset, isAvailable: !asset.isAvailable }
          : asset
      )
    );
    toast.success('Đã cập nhật trạng thái thiết bị');
  };

  const handleViewHistory = (assetId: string) => {
    setSelectedAssetId(assetId);
    setShowHistoryModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const selectedAssetHistory = selectedAssetId
    ? mockBookingHistory.filter((booking) => booking.assetId === selectedAssetId)
    : [];

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId);

  return (
    <DashboardLayout contentOnly activeMenuItem="infrastructure" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb] p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại</span>
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Thiết bị của tôi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý các thiết bị bạn đã đăng ký lên hệ thống
            </p>
          </div>
          <button
            onClick={onCreateAsset}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>Đăng ký Thiết bị mới</span>
          </button>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const statusConfig = getStatusConfig(asset.status);
            return (
              <div
                key={asset.id}
                className="overflow-hidden rounded-lg border border bg-white transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[#f9fafb]">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-3 top-3 flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {asset.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{asset.type}</p>
                  </div>

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Địa điểm:</span>
                      <span className="font-medium text-foreground">{asset.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lượt đặt:</span>
                      <span className="font-medium text-foreground">{asset.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            asset.isAvailable ? 'text-[#059669]' : 'text-[#dc2626]'
                          }`}
                        >
                          {asset.isAvailable ? 'Sẵn sàng' : 'Bận/Bảo trì'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {asset.status === 'active' && (
                      <button
                        onClick={() => handleToggleAvailability(asset.id)}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          asset.isAvailable
                            ? 'border-[#dc2626] text-[#dc2626] hover:bg-[#fee2e2]'
                            : 'border-[#059669] text-[#059669] hover:bg-[#d1fae5]'
                        }`}
                      >
                        <Power className="size-4" />
                        <span>{asset.isAvailable ? 'Tắt sẵn sàng' : 'Bật sẵn sàng'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleViewHistory(asset.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border bg-white px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Eye className="size-4" />
                      <span>Xem lịch sử</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {assets.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border bg-white py-16">
            <div className="mb-4 rounded-full bg-[#f9fafb] p-4">
              <Settings className="size-8 text-[#9ca3af]" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Chưa có thiết bị nào
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Đăng ký thiết bị của bạn để chia sẻ với cộng đồng nghiên cứu
            </p>
            <button
              onClick={onCreateAsset}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span>Đăng ký Thiết bị mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Booking History Modal */}
      {showHistoryModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="border-b border p-6">
              <h2 className="text-xl font-semibold text-foreground">
                Lịch sử đặt lịch - {selectedAsset.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Danh sách các lần mượn/thuê thiết bị
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              {selectedAssetHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 rounded-full bg-[#f9fafb] p-4">
                    <Eye className="size-8 text-[#9ca3af]" />
                  </div>
                  <p className="text-sm text-muted-foreground">Chưa có lịch sử đặt lịch</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAssetHistory.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border border bg-[#f9fafb] p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{booking.requester}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{booking.dealName}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            booking.status === 'upcoming'
                              ? 'bg-[#e0f2fe] text-primary'
                              : 'bg-[#d1fae5] text-[#059669]'
                          }`}
                        >
                          {booking.status === 'upcoming' ? 'Sắp tới' : 'Đã hoàn thành'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(booking.startDate)}</span>
                        <span>→</span>
                        <span>{formatDate(booking.endDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border p-6">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
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
