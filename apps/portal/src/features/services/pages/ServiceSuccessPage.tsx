import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { CheckCircle2, Clock, FileText, Home } from 'lucide-react';

interface ServiceSuccessPageProps {
  onNavigate?: (itemId: string) => void;
  packageId: string;
  onGoHome: () => void;
}

const packageDetails: Record<
  string,
  { name: string; requestLimit: number; duration: number }
> = {
  basic: {
    name: 'Gói Cơ bản',
    requestLimit: 3,
    duration: 30,
  },
  advanced: {
    name: 'Gói Nâng cao',
    requestLimit: 10,
    duration: 60,
  },
  enterprise: {
    name: 'Gói Doanh nghiệp',
    requestLimit: -1,
    duration: 90,
  },
};

export function ServiceSuccessPage({
  onNavigate,
  packageId,
  onGoHome,
}: ServiceSuccessPageProps) {
  const packageInfo = packageDetails[packageId];

  return (
    <DashboardLayout contentOnly activeMenuItem="service-ip-consulting" onNavigate={onNavigate}>
      <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-8 py-12">
        <div className="w-full max-w-2xl">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#dcfce7] to-[#86efac] shadow-lg">
              <CheckCircle2 className="size-12 text-[#166534]" />
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-lg">
            {/* Title */}
            <h1 className="mb-3 text-center text-3xl font-bold text-foreground">
              Đăng ký thành công!
            </h1>
            <p className="mb-8 text-center leading-relaxed text-muted-foreground">
              Yêu cầu đăng ký của bạn đã được ghi nhận và đang chờ phê duyệt từ quản trị viên.
            </p>

            {/* Status Card */}
            <div className="mb-6 rounded-xl border border-[#fef3c7] bg-[#fffbeb] p-6">
              <div className="mb-4 flex items-center gap-3">
                <Clock className="size-6 text-[#92400e]" />
                <div>
                  <div className="font-semibold text-[#92400e]">Trạng thái: Chờ phê duyệt</div>
                  <div className="mt-1 text-sm text-[#78350f]">
                    Thời gian xử lý thường trong vòng 1-2 ngày làm việc
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="mb-8 space-y-4 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-6">
              <h2 className="font-semibold text-foreground">Thông tin gói đã đăng ký</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tên gói</span>
                  <span className="font-medium text-foreground">{packageInfo.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Số lượng yêu cầu</span>
                  <span className="font-medium text-foreground">
                    {packageInfo.requestLimit === -1
                      ? 'Không giới hạn'
                      : `${packageInfo.requestLimit} yêu cầu`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Thời hạn</span>
                  <span className="font-medium text-foreground">{packageInfo.duration} ngày</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Yêu cầu còn lại</span>
                  <span className="font-semibold text-primary">
                    {packageInfo.requestLimit === -1
                      ? 'Không giới hạn'
                      : packageInfo.requestLimit}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8 rounded-xl border border-[#e0f2fe] bg-[#f0f9ff] p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <FileText className="size-5 text-primary" />
                Bước tiếp theo
              </h2>
              <ul className="space-y-2.5 text-sm text-[#4b5563]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Quản trị viên sẽ xem xét và phê duyệt yêu cầu của bạn trong vòng 1-2 ngày làm
                    việc.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Bạn sẽ nhận được email thông báo khi yêu cầu được phê duyệt hoặc từ chối.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Sau khi được phê duyệt, bạn có thể bắt đầu tạo yêu cầu tư vấn theo gói dịch vụ
                    đã đăng ký.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Thời hạn sử dụng gói dịch vụ sẽ được tính từ ngày phê duyệt thành công.
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onGoHome}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-white transition-all hover:bg-primary/90"
              >
                <Home className="size-5" />
                Về trang chủ
              </button>
              <button
                onClick={() => onNavigate?.('service-ip-consulting')}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white py-3 font-medium text-[#4b5563] transition-all hover:bg-[#f9fafb]"
              >
                <FileText className="size-5" />
                Xem dịch vụ
              </button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Có câu hỏi về yêu cầu của bạn?{' '}
              <button
                onClick={() => onNavigate?.('contact')}
                className="font-medium text-primary hover:underline"
              >
                Liên hệ hỗ trợ
              </button>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
