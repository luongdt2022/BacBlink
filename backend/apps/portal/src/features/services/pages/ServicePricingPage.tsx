import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { type PricingPackage, PricingCard } from '@/features/services/components/PricingCard';

interface ServicePricingPageProps {
  onNavigate?: (itemId: string) => void;
  onSelectPackage: (packageId: string) => void;
}

const pricingPackages: PricingPackage[] = [
  {
    id: 'basic',
    name: 'Gói Cơ bản',
    price: 5000000,
    requestLimit: 3,
    duration: 30,
    features: [
      '3 yêu cầu tư vấn',
      'Hỗ trợ qua email',
      'Thời hạn sử dụng 30 ngày',
      'Báo cáo tư vấn cơ bản',
      'Phản hồi trong 5 ngày làm việc',
    ],
  },
  {
    id: 'advanced',
    name: 'Gói Nâng cao',
    price: 12000000,
    requestLimit: 10,
    duration: 60,
    isRecommended: true,
    features: [
      '10 yêu cầu tư vấn',
      'Hỗ trợ email + điện thoại',
      'Ưu tiên xử lý yêu cầu',
      'Thời hạn sử dụng 60 ngày',
      'Báo cáo tư vấn chi tiết',
      'Phản hồi trong 3 ngày làm việc',
      'Tư vấn định giá tài sản IP',
    ],
  },
  {
    id: 'enterprise',
    name: 'Gói Doanh nghiệp',
    price: 25000000,
    requestLimit: -1, // unlimited
    duration: 90,
    features: [
      'Không giới hạn yêu cầu tư vấn',
      'Chuyên gia riêng phụ trách',
      'Hỗ trợ 24/7 qua mọi kênh',
      'Thời hạn sử dụng 90 ngày',
      'Báo cáo chuyên sâu và phân tích',
      'Phản hồi ngay trong ngày',
      'Tư vấn chiến lược khai thác IP',
      'Hỗ trợ soạn thảo hợp đồng',
    ],
  },
];

export function ServicePricingPage({ onNavigate, onSelectPackage }: ServicePricingPageProps) {
  return (
    <DashboardLayout contentOnly activeMenuItem="service-ip-consulting" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border-[#e5e7eb] bg-white px-8 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">
              Chọn gói dịch vụ tư vấn phù hợp
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Lựa chọn gói dịch vụ phù hợp với nhu cầu khai thác và quản lý tài sản trí tuệ của
              bạn.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="px-8 py-16">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
            {pricingPackages.map((pkg) => (
              <PricingCard key={pkg.id} package={pkg} onSelect={onSelectPackage} />
            ))}
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="px-8 pb-16">
          <div className="mx-auto max-w-4xl rounded-xl border border-[#e5e7eb] bg-white p-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Lưu ý về quy trình đăng ký
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  Sau khi thanh toán, yêu cầu đăng ký của bạn sẽ được gửi đến quản trị viên để phê
                  duyệt.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  Thời gian xử lý phê duyệt thường trong vòng 1-2 ngày làm việc.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  Sau khi được phê duyệt, bạn có thể bắt đầu sử dụng dịch vụ với số lượng yêu cầu
                  theo gói đã chọn.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>Thời hạn gói dịch vụ được tính từ ngày phê duyệt thành công.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
