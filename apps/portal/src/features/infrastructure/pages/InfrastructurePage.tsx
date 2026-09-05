import { useState } from 'react';
import { Search, Filter, Plus, MapPin, ChevronRight, Building2, Package, Clock, PauseCircle, Bell } from 'lucide-react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { ResponsivePageSection } from '@/shared/components/layout/ResponsivePageSection';
import { toast } from 'sonner';

interface InfrastructurePageProps {
  onNavigate?: (itemId: string) => void;
  onViewDetail?: (id: string) => void;
  onViewMyRequests?: () => void;
  onViewMyAssets?: () => void;
  onCreateAsset?: () => void;
  onManageRentalRequests?: () => void;
  onViewOwnerEquipmentDetail?: (id: string) => void;
}

type EquipmentStatus = 'available' | 'busy' | 'maintenance';
type EquipmentType = 'lab' | 'testing' | 'manufacturing' | 'all';
type ListingStatus = 'approved' | 'pending';

interface Equipment {
  id: string;
  name: string;
  type: Exclude<EquipmentType, 'all'>;
  owner: string;
  status: EquipmentStatus;
  location: string;
  image: string;
  description: string;
}

interface MyEquipment {
  id: string;
  name: string;
  type: Exclude<EquipmentType, 'all'>;
  location: string;
  image: string;
  listingStatus: ListingStatus;
  isActive: boolean;
  totalBookings: number;
}

const mockEquipments: Equipment[] = [
  {
    id: '1',
    name: 'Máy in 3D công nghiệp SLA',
    type: 'manufacturing',
    owner: 'Phòng Lab ĐHBK Hà Nội',
    status: 'available',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1633525625265-6f5616cd0f90?w=400',
    description: 'Máy in 3D công nghệ SLA độ phân giải cao',
  },
  {
    id: '2',
    name: 'Phòng Lab Công nghệ sinh học',
    type: 'lab',
    owner: 'Viện Công nghệ sinh học - ĐHQG',
    status: 'available',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
    description: 'Phòng lab đầy đủ trang thiết bị cho nghiên cứu sinh học',
  },
  {
    id: '3',
    name: 'Máy quang phổ hấp thụ UV-Vis',
    type: 'testing',
    owner: 'Viện Hóa học - Viện KHCN',
    status: 'available',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
    description: 'Máy phân tích quang phổ độ chính xác cao',
  },
  {
    id: '4',
    name: 'Phòng Lab IoT & Sensors',
    type: 'lab',
    owner: 'Đại học Bách Khoa Hà Nội',
    status: 'busy',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    description: 'Trang thiết bị IoT, cảm biến và hệ thống tích hợp',
  },
  {
    id: '5',
    name: 'Máy CNC kim loại 5 trục',
    type: 'manufacturing',
    owner: 'Viện Cơ khí - ĐHBK TP.HCM',
    status: 'available',
    location: 'TP.HCM',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
    description: 'Máy CNC 5 trục gia công kim loại độ chính xác cao',
  },
  {
    id: '6',
    name: 'Thiết bị xử lý nước thải',
    type: 'testing',
    owner: 'Viện Môi trường - Viện KHCN',
    status: 'available',
    location: 'TP.HCM',
    image: 'https://images.unsplash.com/photo-1581093458791-9d42e4c7b1e7?w=400',
    description: 'Hệ thống xử lý và phân tích nước thải',
  },
  {
    id: '7',
    name: 'Phòng Lab Hóa học phân tích',
    type: 'lab',
    owner: 'Đại học Khoa học Tự nhiên',
    status: 'busy',
    location: 'TP.HCM',
    image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=400',
    description: 'Phòng lab chuyên về phân tích hóa học',
  },
  {
    id: '8',
    name: 'Máy đo phổ khối lượng LC-MS',
    type: 'testing',
    owner: 'Viện Dược liệu Quốc gia',
    status: 'available',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=400',
    description: 'Thiết bị phân tích định tính và định lượng',
  },
];

const mockMyEquipments: MyEquipment[] = [
  {
    id: 'my1',
    name: 'Máy in 3D công nghiệp SLA',
    type: 'manufacturing',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1633525625265-6f5616cd0f90?w=400',
    listingStatus: 'approved',
    isActive: true,
    totalBookings: 12,
  },
  {
    id: 'my2',
    name: 'Phòng Lab Công nghệ sinh học',
    type: 'lab',
    location: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
    listingStatus: 'approved',
    isActive: true,
    totalBookings: 8,
  },
  {
    id: 'my3',
    name: 'Thiết bị xử lý nước thải',
    type: 'testing',
    location: 'TP.HCM',
    image: 'https://images.unsplash.com/photo-1581093458791-9d42e4c7b1e7?w=400',
    listingStatus: 'pending',
    isActive: false,
    totalBookings: 0,
  },
  {
    id: 'my4',
    name: 'Máy CNC kim loại 5 trục',
    type: 'manufacturing',
    location: 'TP.HCM',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
    listingStatus: 'approved',
    isActive: true,
    totalBookings: 15,
  },
];

const getStatusConfig = (status: EquipmentStatus) => {
  switch (status) {
    case 'available':
      return {
        label: 'Sẵn sàng',
        bgColor: 'bg-[#d1fae5]',
        textColor: 'text-[#059669]',
      };
    case 'busy':
      return {
        label: 'Đang bận',
        bgColor: 'bg-[#e5e7eb]',
        textColor: 'text-muted-foreground',
      };
    case 'maintenance':
      return {
        label: 'Bảo trì',
        bgColor: 'bg-[#ffedd5]',
        textColor: 'text-[#ea580c]',
      };
  }
};

const getTypeLabel = (type: Exclude<EquipmentType, 'all'>) => {
  switch (type) {
    case 'lab':
      return 'Phòng Lab';
    case 'testing':
      return 'Máy đo kiểm';
    case 'manufacturing':
      return 'Máy gia công';
  }
};

export function InfrastructurePage({
  onNavigate,
  onViewDetail,
  onViewMyRequests,
  onViewMyAssets: _onViewMyAssets,
  onCreateAsset,
  onManageRentalRequests,
  onViewOwnerEquipmentDetail,
}: InfrastructurePageProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'my-assets'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterType, setFilterType] = useState<EquipmentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'all'>('all');
  
  // My Assets search
  const [myAssetsSearchQuery, setMyAssetsSearchQuery] = useState('');

  const filteredEquipments = mockEquipments.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === 'all' || equipment.location === filterLocation;
    const matchesType = filterType === 'all' || equipment.type === filterType;
    const matchesStatus = filterStatus === 'all' || equipment.status === filterStatus;
    return matchesSearch && matchesLocation && matchesType && matchesStatus;
  });

  // Filter my equipments
  const filteredMyEquipments = mockMyEquipments.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(myAssetsSearchQuery.toLowerCase()) ||
      equipment.id.toLowerCase().includes(myAssetsSearchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout contentOnly activeMenuItem="infrastructure" onNavigate={onNavigate}>
      <div className="min-h-svh bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Hạ tầng & PoC</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Kết nối các phòng Lab/Viện nghiên cứu với các dự án cần thử nghiệm
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-5 flex gap-5 overflow-x-auto pb-1 sm:mt-6 sm:gap-6">
            <button
              onClick={() => setActiveTab('search')}
              className={`relative shrink-0 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tra cứu & Đặt lịch
              {activeTab === 'search' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('my-assets')}
              className={`relative shrink-0 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'my-assets'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hạ tầng của tôi
              {activeTab === 'my-assets' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Tra cứu & Đặt lịch */}
        {activeTab === 'search' && (
          <div className="responsive-page-container responsive-page-stack">
            {/* Search Bar & Actions */}
            <ResponsivePageSection className="p-4">
              {/* Top Row: Search Input + My Requests Button */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm máy móc, phòng Lab, thiết bị đo kiểm..."
                    className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={onViewMyRequests}
                  className="flex min-h-[2.75rem] w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-[#e0f2fe] lg:w-auto lg:justify-start lg:py-3"
                >
                  <Clock className="size-4" />
                  <span className="whitespace-nowrap">Lịch sử yêu cầu của tôi</span>
                </button>
              </div>

              {/* Quick Filters */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
                {/* Location Filter */}
                <div className="flex min-w-0 items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="all">Tất cả khu vực</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP.HCM">TP.HCM</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex min-w-0 items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as EquipmentType)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="all">Tất cả loại thiết bị</option>
                    <option value="lab">Phòng Lab</option>
                    <option value="testing">Máy đo kiểm</option>
                    <option value="manufacturing">Máy gia công</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex min-w-0 items-center gap-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as EquipmentStatus | 'all')}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="available">Sẵn sàng</option>
                    <option value="busy">Đang bận</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>
            </ResponsivePageSection>

            {/* Results Count */}
            <div>
              <p className="text-sm text-muted-foreground">
                Tìm thấy <span className="font-medium text-foreground">{filteredEquipments.length}</span>{' '}
                thiết bị
              </p>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {filteredEquipments.map((equipment) => {
                const statusConfig = getStatusConfig(equipment.status);
                return (
                  <div
                    key={equipment.id}
                    className="overflow-hidden rounded-lg border border bg-white transition-shadow hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-[#f3f4f6]">
                      <img
                        src={equipment.image}
                        alt={equipment.name}
                        className="h-full w-full object-cover"
                      />
                      {/* Status Badge */}
                      <div className="absolute right-3 top-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Type Badge */}
                      <div className="mb-2">
                        <span className="inline-block rounded bg-[#e0f2fe] px-2 py-0.5 text-xs font-medium text-primary">
                          {getTypeLabel(equipment.type)}
                        </span>
                      </div>

                      {/* Equipment Name */}
                      <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {equipment.name}
                      </h3>

                      {/* Owner */}
                      <div className="mb-3 flex items-start gap-2">
                        <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{equipment.owner}</p>
                      </div>

                      {/* Location */}
                      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4" />
                        <span>{equipment.location}</span>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => onViewDetail?.(equipment.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                      >
                        <span>Xem chi tiết & Đặt lịch</span>
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredEquipments.length === 0 && (
              <ResponsivePageSection className="flex flex-col items-center justify-center border py-14 text-center sm:py-16">
                <div className="mb-4 rounded-full bg-[#f9fafb] p-4">
                  <Search className="size-8 text-[#9ca3af]" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Không tìm thấy thiết bị
                </h3>
                <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </ResponsivePageSection>
            )}
          </div>
        )}

        {/* Tab 2: Hạ tầng của tôi */}
        {activeTab === 'my-assets' && (
          <div className="responsive-page-container responsive-page-stack">
            {/* Action Bar - Single Row with Search + Buttons */}
            <ResponsivePageSection className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              {/* Search Input - Left Side */}
              <div className="relative w-full lg:max-w-[350px]">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  type="text"
                  value={myAssetsSearchQuery}
                  onChange={(e) => setMyAssetsSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên thiết bị hoặc mã tài sản..."
                  className="h-11 w-full rounded-lg border border py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Action Buttons - Right Side */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Manage Rental Requests Button with Badge */}
                <button
                  onClick={onManageRentalRequests}
                  className="relative flex items-center gap-2 rounded-lg border border bg-white px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#f9fafb]"
                >
                  <Bell className="size-4" />
                  <span>Quản lý Yêu cầu thuê</span>
                  {/* Notification Badge */}
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#dc2626] text-xs font-semibold text-white">
                    3
                  </span>
                </button>
                
                {/* Create Asset Button */}
                <button
                  onClick={onCreateAsset}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  <span>Đăng ký thiết bị</span>
                </button>
              </div>
            </div>
            </ResponsivePageSection>

            {/* Results Count */}
            <div>
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-medium text-foreground">{filteredMyEquipments.length}</span> /{' '}
                {mockMyEquipments.length} thiết bị
              </p>
            </div>

            {/* My Equipment Grid */}
            {filteredMyEquipments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {filteredMyEquipments.map((equipment) => {
                  const listingStatusConfig = equipment.listingStatus === 'approved' 
                    ? { label: 'Đã duyệt', bgColor: 'bg-[#d1fae5]', textColor: 'text-[#059669]' }
                    : { label: 'Chờ duyệt', bgColor: 'bg-[#ffedd5]', textColor: 'text-[#ea580c]' };

                  return (
                    <div
                      key={equipment.id}
                      className="overflow-hidden rounded-lg border border bg-white transition-shadow hover:shadow-lg"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-[#f3f4f6]">
                        <img
                          src={equipment.image}
                          alt={equipment.name}
                          className="h-full w-full object-cover"
                        />
                        
                        {/* Listing Status Badge */}
                        <div className="absolute right-3 top-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${listingStatusConfig.bgColor} ${listingStatusConfig.textColor}`}
                          >
                            {listingStatusConfig.label}
                          </span>
                        </div>

                        {/* Inactive Overlay */}
                        {!equipment.isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground">
                              Tạm ngưng
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Type Badge */}
                        <div className="mb-2">
                          <span className="inline-block rounded bg-[#e0f2fe] px-2 py-0.5 text-xs font-medium text-primary">
                            {getTypeLabel(equipment.type)}
                          </span>
                        </div>

                        {/* Equipment Name */}
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                          {equipment.name}
                        </h3>

                        {/* Location */}
                        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4" />
                          <span>{equipment.location}</span>
                        </div>

                        {/* Stats */}
                        {equipment.listingStatus === 'approved' && (
                          <div className="mb-4 rounded-lg bg-[#f9fafb] p-3">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{equipment.totalBookings}</span> lượt đặt lịch
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewOwnerEquipmentDetail?.(equipment.id)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-[#e0f2fe]"
                          >
                            <span>Xem chi tiết</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (equipment.isActive) {
                                toast.success('Đã tạm ngưng cho thuê thiết bị');
                              } else {
                                toast.success('Đã kích hoạt lại thiết bị');
                              }
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              equipment.isActive 
                                ? 'border border-[#ea580c] bg-white text-[#ea580c] hover:bg-[#fff7ed]'
                                : 'border border-[#059669] bg-white text-[#059669] hover:bg-[#d1fae5]'
                            }`}
                          >
                            <PauseCircle className="size-4" />
                            <span>{equipment.isActive ? 'Tạm ngưng' : 'Kích hoạt'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty State
              <ResponsivePageSection className="flex flex-col items-center justify-center border py-16 text-center sm:py-20">
                <div className="mb-4 rounded-full bg-[#f9fafb] p-6">
                  <Building2 className="size-12 text-[#9ca3af]" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  Chưa có thiết bị nào
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Đăng ký thiết bị của bạn để cho các nhà nghiên cứu khác thuê
                </p>
                <button
                  onClick={onCreateAsset}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  <span>Đăng ký Thiết bị mới</span>
                </button>
              </ResponsivePageSection>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
