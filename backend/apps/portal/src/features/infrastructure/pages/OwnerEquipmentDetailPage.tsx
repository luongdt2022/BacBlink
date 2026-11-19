import { useState } from 'react';
import { ArrowLeft, Edit2, PauseCircle, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface OwnerEquipmentDetailPageProps {
  equipmentId: string;
  onNavigate?: (itemId: string) => void;
  onBack?: () => void;
  onEdit?: (id: string) => void;
}

interface BookingInfo {
  id: string;
  renterName: string;
  renterAvatar: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface EquipmentDetail {
  id: string;
  name: string;
  type: string;
  image: string;
  isActive: boolean;
  model: string;
  year: number;
  condition: string;
  pricePerHour?: string;
  description: string;
  totalBookings: number;
  monthlyHours: number;
  location: string;
}

// Mock data
const mockEquipmentDetails: Record<string, EquipmentDetail> = {
  my1: {
    id: 'my1',
    name: 'Máy in 3D công nghiệp SLA',
    type: 'Máy gia công',
    image: 'https://images.unsplash.com/photo-1633525625265-6f5616cd0f90?w=800',
    isActive: true,
    model: 'Formlabs Form 3L',
    year: 2023,
    condition: 'Tốt - Bảo trì định kỳ',
    pricePerHour: '500,000 VNĐ/giờ',
    description:
      'Máy in 3D công nghiệp sử dụng công nghệ SLA (Stereolithography) với độ chính xác cao, phù hợp cho các ứng dụng nghiên cứu và sản xuất nguyên mẫu.\n\nĐặc điểm nổi bật:\n• Thể tích in: 335 × 200 × 300 mm\n• Độ phân giải lớp: 25-300 micron\n• Tương thích với nhiều loại nhựa resin chuyên dụng\n• Hệ thống làm sạch và hậu xử lý tự động\n\nỨng dụng:\n- Nguyên mẫu kỹ thuật\n- Mô hình y tế\n- Khuôn đúc đầu tư\n- Sản phẩm trang sức',
    totalBookings: 15,
    monthlyHours: 48,
    location: 'Hà Nội',
  },
  my2: {
    id: 'my2',
    name: 'Phòng Lab Công nghệ sinh học',
    type: 'Phòng Lab',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
    isActive: true,
    model: 'Lab Grade A - ISO Class 5',
    year: 2022,
    condition: 'Xuất sắc - Vừa nâng cấp',
    pricePerHour: '2,000,000 VNĐ/ngày',
    description:
      'Phòng thí nghiệm công nghệ sinh học chuẩn ISO Class 5, được trang bị đầy đủ thiết bị hiện đại cho nghiên cứu vi sinh vật, nuôi cấy tế bào và phân tích sinh học phân tử.\n\nTrang thiết bị:\n• Tủ cấy vi sinh cấp II\n• Hệ thống lọc HEPA\n• Kính hiển vi huỳnh quang\n• Máy li tâm tốc độ cao\n• Tủ ấm CO2\n• Máy PCR Real-time\n\nTiện ích:\n- Phòng chuẩn bị mẫu riêng biệt\n- Khu vực lưu trữ sinh phẩm -80°C\n- Hệ thống giám sát nhiệt độ 24/7\n- Phòng thay đồ và khử khuẩn',
    totalBookings: 8,
    monthlyHours: 120,
    location: 'Hà Nội',
  },
  my3: {
    id: 'my3',
    name: 'Thiết bị xử lý nước thải',
    type: 'Máy đo kiểm',
    image: 'https://images.unsplash.com/photo-1581093458791-9d42e4c7b1e7?w=800',
    isActive: false,
    model: 'AquaTech Pro 5000',
    year: 2024,
    condition: 'Mới - Đang chờ phê duyệt',
    description:
      'Hệ thống xử lý nước thải công nghiệp quy mô pilot, sử dụng công nghệ kết hợp sinh học và hóa học để xử lý nước thải đạt tiêu chuẩn môi trường.\n\nThông số kỹ thuật:\n• Công suất: 5 m³/ngày\n• Công nghệ: MBR + RO\n• Tự động hóa hoàn toàn\n• Giám sát online các thông số\n\nỨng dụng:\n- Nghiên cứu quy trình xử lý mới\n- Thử nghiệm hóa chất xử lý\n- Đào tạo vận hành\n- Pilot cho dự án thực tế',
    totalBookings: 0,
    monthlyHours: 0,
    location: 'TP.HCM',
  },
  my4: {
    id: 'my4',
    name: 'Máy CNC kim loại 5 trục',
    type: 'Máy gia công',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    isActive: true,
    model: 'DMG MORI DMU 50',
    year: 2021,
    condition: 'Tốt - Hiệu chuẩn hàng tháng',
    pricePerHour: '800,000 VNĐ/giờ',
    description:
      'Máy CNC 5 trục cao cấp cho gia công kim loại chính xác, phù hợp cho sản xuất các chi tiết phức tạp trong ngành hàng không, ô tô và y tế.\n\nThông số kỹ thuật:\n• Hành trình: X630 × Y500 × Z450 mm\n• Tốc độ trục chính: 18,000 rpm\n• Độ chính xác định vị: ±0.005 mm\n• Hệ điều khiển: Siemens 840D sl\n\nKhả năng gia công:\n- Nhôm, thép, titanium, inconel\n- Chi tiết hàng không vũ trụ\n- Khuôn mẫu chính xác cao\n- Implant y tế\n- Nguyên mẫu cơ khí',
    totalBookings: 15,
    monthlyHours: 96,
    location: 'TP.HCM',
  },
};

const mockUpcomingBookings: Record<string, BookingInfo[]> = {
  my1: [
    {
      id: 'b1',
      renterName: 'Nguyễn Văn A',
      renterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      date: '2026-02-08',
      startTime: '09:00',
      endTime: '17:00',
    },
    {
      id: 'b2',
      renterName: 'Trần Thị B',
      renterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      date: '2026-02-12',
      startTime: '08:00',
      endTime: '12:00',
    },
    {
      id: 'b3',
      renterName: 'Lê Minh C',
      renterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      date: '2026-02-15',
      startTime: '14:00',
      endTime: '18:00',
    },
  ],
  my2: [
    {
      id: 'b4',
      renterName: 'Phạm Thị D',
      renterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      date: '2026-02-06',
      startTime: '08:00',
      endTime: '17:00',
    },
    {
      id: 'b5',
      renterName: 'Hoàng Văn E',
      renterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      date: '2026-02-10',
      startTime: '09:00',
      endTime: '16:00',
    },
  ],
  my3: [],
  my4: [
    {
      id: 'b6',
      renterName: 'Vũ Thị F',
      renterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      date: '2026-02-07',
      startTime: '10:00',
      endTime: '15:00',
    },
    {
      id: 'b7',
      renterName: 'Đặng Văn G',
      renterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      date: '2026-02-11',
      startTime: '13:00',
      endTime: '17:00',
    },
    {
      id: 'b8',
      renterName: 'Bùi Thị H',
      renterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      date: '2026-02-14',
      startTime: '08:00',
      endTime: '12:00',
    },
  ],
};

// Helper to get booked dates for calendar
const getBookedDates = (equipmentId: string): Set<number> => {
  const bookings = mockUpcomingBookings[equipmentId] || [];
  const bookedDates = new Set<number>();
  
  bookings.forEach((booking) => {
    const date = new Date(booking.date);
    bookedDates.add(date.getDate());
  });
  
  return bookedDates;
};

export function OwnerEquipmentDetailPage({
  equipmentId,
  onNavigate,
  onBack,
  onEdit,
}: OwnerEquipmentDetailPageProps) {
  const equipment = mockEquipmentDetails[equipmentId];
  const upcomingBookings = mockUpcomingBookings[equipmentId] || [];
  const [isActive, setIsActive] = useState(equipment?.isActive || false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // February 2026

  if (!equipment) {
    return (
      <DashboardLayout contentOnly activeMenuItem="infrastructure" onNavigate={onNavigate}>
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Không tìm thấy thiết bị</p>
        </div>
      </DashboardLayout>
    );
  }

  const bookedDates = getBookedDates(equipmentId);

  const handleToggleStatus = () => {
    setIsActive(!isActive);
    toast.success(isActive ? 'Đã chuyển sang chế độ bảo trì' : 'Đã kích hoạt lại thiết bị');
  };

  // Calendar rendering
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
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
            <span>Quay lại danh sách</span>
          </button>

          {/* Title & Actions */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">{equipment.name}</h1>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    isActive
                      ? 'bg-[#d1fae5] text-[#059669]'
                      : 'bg-[#ffedd5] text-[#ea580c]'
                  }`}
                >
                  {isActive ? 'Đang hoạt động' : 'Đang bảo trì'}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{equipment.type} • {equipment.location}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit?.(equipmentId)}
                className="flex items-center gap-2 rounded-lg border border bg-white px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
              >
                <Edit2 className="size-4" />
                <span>Chỉnh sửa thông tin</span>
              </button>

              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border border-[#ea580c] bg-white text-[#ea580c] hover:bg-[#fff7ed]'
                    : 'border border-[#059669] bg-white text-[#059669] hover:bg-[#d1fae5]'
                }`}
              >
                {isActive ? (
                  <>
                    <PauseCircle className="size-4" />
                    <span>Tạm ngưng/Bảo trì</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="size-4" />
                    <span>Kích hoạt lại</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content - Split View */}
        <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
          {/* Left Column - Equipment Info (2/3 width) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Image */}
            <div className="overflow-hidden rounded-lg border border bg-white">
              <img
                src={equipment.image}
                alt={equipment.name}
                className="h-96 w-full object-cover"
              />
            </div>

            {/* Specifications */}
            <div className="rounded-lg border border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Thông số kỹ thuật</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="mt-1 font-medium text-foreground">{equipment.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Năm sản xuất</p>
                  <p className="mt-1 font-medium text-foreground">{equipment.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tình trạng kỹ thuật</p>
                  <p className="mt-1 font-medium text-foreground">{equipment.condition}</p>
                </div>
                {equipment.pricePerHour && (
                  <div>
                    <p className="text-sm text-muted-foreground">Giá thuê tham khảo</p>
                    <p className="mt-1 font-medium text-primary">{equipment.pricePerHour}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg border border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Mô tả chi tiết</h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {equipment.description}
              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Performance (1/3 width) */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-lg border border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Thống kê</h2>
              <div className="space-y-4">
                <div className="rounded-lg bg-[#f9fafb] p-4">
                  <p className="text-sm text-muted-foreground">Tổng lượt thuê</p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {equipment.totalBookings}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-4">
                  <p className="text-sm text-muted-foreground">Số giờ vận hành tháng này</p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {equipment.monthlyHours}h
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="rounded-lg border border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Lịch hoạt động</h2>
              
              {/* Calendar Header */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={prevMonth}
                  className="rounded p-1 hover:bg-[#f9fafb]"
                >
                  <ChevronLeft className="size-5 text-muted-foreground" />
                </button>
                <p className="font-medium text-foreground">
                  Tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
                </p>
                <button
                  onClick={nextMonth}
                  className="rounded p-1 hover:bg-[#f9fafb]"
                >
                  <ChevronRight className="size-5 text-muted-foreground" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isBooked = bookedDates.has(day);
                  const isToday = day === 4; // Mock today as Feb 4

                  return (
                    <div
                      key={day}
                      className={`flex aspect-square items-center justify-center rounded text-sm ${
                        isBooked
                          ? 'bg-primary font-medium text-white'
                          : isToday
                            ? 'border-2 border-primary font-medium text-primary'
                            : 'text-muted-foreground hover:bg-[#f9fafb]'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded bg-primary"></div>
                <span>Ngày có người thuê</span>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="rounded-lg border border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Booking sắp tới
              </h2>
              
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border border p-3 transition-colors hover:bg-[#f9fafb]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.renterAvatar}
                          alt={booking.renterName}
                          className="size-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {booking.renterName}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                            })}{' '}
                            • {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Chưa có booking nào
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
