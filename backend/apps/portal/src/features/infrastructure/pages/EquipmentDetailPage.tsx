import { useState } from 'react';
import { ArrowLeft, MapPin, Building2, Clock, X } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface EquipmentDetailPageProps {
  equipmentId: string;
  onNavigate?: (itemId: string) => void;
  onBack?: () => void;
}

interface BookingData {
  dealId: string;
  purpose: string;
  startDate: string;
  endDate: string;
}

// Mock deals data
const mockDeals = [
  { id: '1', name: 'Dự án Hệ thống xử lý nước thải - Tập đoàn Viettel' },
  { id: '2', name: 'Công nghệ AI phân tích dữ liệu - Vingroup' },
  { id: '3', name: 'Hệ thống IoT giám sát môi trường - FPT Corporation' },
];

// Mock booked dates (dates that are already reserved)
const mockBookedDates = [
  '2026-02-05',
  '2026-02-06',
  '2026-02-10',
  '2026-02-11',
  '2026-02-12',
  '2026-02-18',
  '2026-02-19',
];

export function EquipmentDetailPage({ equipmentId, onNavigate, onBack }: EquipmentDetailPageProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for future date-picker integration
  const [_selectedDates] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState<BookingData>({
    dealId: '',
    purpose: '',
    startDate: '',
    endDate: '',
  });

  // Mock equipment detail
  const equipment = {
    id: equipmentId,
    name: 'Phòng Lab Công nghệ sinh học',
    type: 'Phòng Lab',
    owner: 'Viện Công nghệ sinh học - ĐHQG',
    status: 'Sẵn sàng',
    location: 'Số 144 Xuân Thủy, Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
    description:
      'Phòng lab đầy đủ trang thiết bị cho nghiên cứu sinh học với diện tích 100m2, đạt chuẩn GMP.',
    specs: [
      'Diện tích: 100m2',
      'Tủ ấm CO2',
      'Tủ nuôi cấy tế bào',
      'Kính hiển vi quang học',
      'Máy ly tâm tốc độ cao',
      'Tủ âm -80°C',
      'Hệ thống khử khuẩn không khí',
    ],
    operatingHours: 'Thứ 2 - Thứ 6: 8:00 - 17:00',
    priceInfo: 'Miễn phí cho các dự án hợp tác nghiên cứu',
  };

  const handleCreateBooking = () => {
    if (!bookingData.dealId || !bookingData.purpose || !bookingData.startDate || !bookingData.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate dates
    if (new Date(bookingData.startDate) > new Date(bookingData.endDate)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    toast.success('Yêu cầu đã được gửi thành công. Vui lòng chờ phê duyệt.');
    setShowBookingModal(false);
    setBookingData({
      dealId: '',
      purpose: '',
      startDate: '',
      endDate: '',
    });
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = 2026;
    const month = 1; // February (0-indexed)
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBooked = mockBookedDates.includes(dateStr);
      const isPast = new Date(dateStr) < new Date();
      days.push({
        day,
        dateStr,
        isBooked,
        isPast,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <DashboardLayout contentOnly activeMenuItem="infrastructure" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb] p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Equipment Info */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border border bg-white">
              {/* Image */}
              <div className="relative h-96 overflow-hidden bg-[#f9fafb]">
                <img
                  src={equipment.image}
                  alt={equipment.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-sm font-medium text-[#059669]">
                    {equipment.status}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block rounded bg-[#e0f2fe] px-2 py-1 text-xs font-medium text-primary">
                    {equipment.type}
                  </span>
                </div>

                <h1 className="mb-4 text-2xl font-semibold text-foreground">{equipment.name}</h1>

                <div className="mb-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Đơn vị sở hữu</p>
                      <p className="text-sm text-muted-foreground">{equipment.owner}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Địa điểm</p>
                      <p className="text-sm text-muted-foreground">{equipment.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Giờ hoạt động</p>
                      <p className="text-sm text-muted-foreground">{equipment.operatingHours}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Mô tả</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{equipment.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Thông số kỹ thuật</h3>
                  <ul className="space-y-2">
                    {equipment.specs.map((spec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-[#f9fafb] p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Chính sách:</span>{' '}
                    {equipment.priceInfo}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calendar & Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Calendar */}
              <div className="rounded-lg border border bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Lịch khả dụng</h3>
                <p className="mb-4 text-sm text-muted-foreground">Tháng 2, 2026</p>

                {/* Calendar Grid */}
                <div className="mb-4">
                  {/* Week days header */}
                  <div className="mb-2 grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="flex items-center justify-center py-2 text-xs font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dayData, index) => {
                      if (!dayData) {
                        return <div key={`empty-${index}`} className="aspect-square"></div>;
                      }

                      const isDisabled = dayData.isBooked || dayData.isPast;

                      return (
                        <button
                          key={dayData.dateStr}
                          disabled={isDisabled}
                          className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                            isDisabled
                              ? 'cursor-not-allowed bg-[#f9fafb] text-[#9ca3af]'
                              : 'bg-white text-foreground hover:bg-[#e0f2fe] hover:text-primary'
                          } ${dayData.isBooked ? 'relative' : ''}`}
                        >
                          {dayData.day}
                          {dayData.isBooked && (
                            <div className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#dc2626]"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 border-t border pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="size-3 rounded bg-white border border"></div>
                    <span>Còn trống</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="size-3 rounded bg-[#f9fafb]"></div>
                    <span>Đã đặt / Quá hạn</span>
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Tạo Yêu cầu Mượn/Thuê
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-foreground">Đăng ký mượn thiết bị</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Thuộc Dự án/Deal nào? <span className="text-[#dc2626]">*</span>
                </label>
                <select
                  value={bookingData.dealId}
                  onChange={(e) => setBookingData({ ...bookingData, dealId: e.target.value })}
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">-- Chọn dự án --</option>
                  {mockDeals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Thông tin booking sẽ được gửi đến phòng chat của dự án
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Mục đích sử dụng <span className="text-[#dc2626]">*</span>
                </label>
                <textarea
                  value={bookingData.purpose}
                  onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                  rows={3}
                  placeholder="Mô tả mục đích sử dụng thiết bị..."
                  className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Thời gian bắt đầu <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Thời gian kết thúc <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                    className="w-full rounded-lg border border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 rounded-lg border border bg-white px-4 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateBooking}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
