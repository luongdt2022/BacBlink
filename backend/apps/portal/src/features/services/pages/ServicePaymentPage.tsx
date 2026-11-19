import { useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { CreditCard, Building2, Wallet, ChevronRight } from 'lucide-react';

interface ServicePaymentPageProps {
  onNavigate?: (itemId: string) => void;
  packageId: string;
  onPaymentSuccess: () => void;
}

const packageDetails: Record<
  string,
  { name: string; price: number; requestLimit: number; duration: number }
> = {
  basic: {
    name: 'Gói Cơ bản',
    price: 5000000,
    requestLimit: 3,
    duration: 30,
  },
  advanced: {
    name: 'Gói Nâng cao',
    price: 12000000,
    requestLimit: 10,
    duration: 60,
  },
  enterprise: {
    name: 'Gói Doanh nghiệp',
    price: 25000000,
    requestLimit: -1,
    duration: 90,
  },
};

export function ServicePaymentPage({
  onNavigate,
  packageId,
  onPaymentSuccess,
}: ServicePaymentPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    paymentMethod: 'bank-transfer',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const packageInfo = packageDetails[packageId];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onPaymentSuccess();
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const paymentMethods = [
    {
      id: 'bank-transfer',
      name: 'Chuyển khoản ngân hàng',
      icon: Building2,
      description: 'Chuyển khoản qua tài khoản ngân hàng',
    },
    {
      id: 'e-wallet',
      name: 'Ví điện tử',
      icon: Wallet,
      description: 'Thanh toán qua Momo, ZaloPay, VNPay',
    },
    {
      id: 'credit-card',
      name: 'Thẻ ngân hàng',
      icon: CreditCard,
      description: 'Thanh toán bằng thẻ ATM/Visa/Mastercard',
    },
  ];

  return (
    <DashboardLayout contentOnly activeMenuItem="service-ip-consulting" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border-[#e5e7eb] bg-white px-8 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Chọn gói dịch vụ</span>
              <ChevronRight className="size-4" />
              <span className="text-foreground">Thanh toán</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Thanh toán dịch vụ</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {/* Order Summary - Left Side */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Thông tin đơn hàng</h2>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Gói dịch vụ</div>
                    <div className="mt-1 font-semibold text-foreground">{packageInfo.name}</div>
                  </div>

                  <div className="border-t border-[#e5e7eb] pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Số lượng yêu cầu</span>
                      <span className="font-medium text-foreground">
                        {packageInfo.requestLimit === -1
                          ? 'Không giới hạn'
                          : `${packageInfo.requestLimit} yêu cầu`}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Thời hạn</span>
                      <span className="font-medium text-foreground">
                        {packageInfo.duration} ngày
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#e5e7eb] pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold text-foreground">Tổng tiền</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {packageInfo.price.toLocaleString('vi-VN')}
                        </div>
                        <div className="text-sm text-muted-foreground">VNĐ</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-[#f0f9ff] p-4">
                  <p className="text-xs leading-relaxed text-[#4b5563]">
                    Sau khi thanh toán, yêu cầu của bạn sẽ được gửi đến quản trị viên để phê duyệt.
                    Thời gian xử lý thường trong vòng 1-2 ngày làm việc.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Form - Right Side */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-lg font-semibold text-foreground">
                    Thông tin khách hàng
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-medium text-[#4b5563]"
                      >
                        Họ và tên <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full rounded-lg border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          errors.fullName ? 'border-[#dc2626]' : 'border-[#e5e7eb]'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-[#dc2626]">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-[#4b5563]"
                      >
                        Email <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full rounded-lg border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          errors.email ? 'border-[#dc2626]' : 'border-[#e5e7eb]'
                        }`}
                        placeholder="example@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-[#dc2626]">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-[#4b5563]"
                      >
                        Số điện thoại <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full rounded-lg border px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          errors.phone ? 'border-[#dc2626]' : 'border-[#e5e7eb]'
                        }`}
                        placeholder="0123456789"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-[#dc2626]">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="organization"
                        className="mb-2 block text-sm font-medium text-[#4b5563]"
                      >
                        Tên tổ chức <span className="text-muted-foreground">(Không bắt buộc)</span>
                      </label>
                      <input
                        type="text"
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Tên công ty/tổ chức"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-lg font-semibold text-foreground">
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${
                            formData.paymentMethod === method.id
                              ? 'border-primary bg-[#f0f9ff]'
                              : 'border-[#e5e7eb] hover:border-[#cbd5e1]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                            className="mt-1 size-5 shrink-0 accent-primary"
                          />
                          <div className="flex flex-1 items-start gap-3">
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                                formData.paymentMethod === method.id
                                  ? 'bg-primary text-white'
                                  : 'bg-[#f3f4f6] text-muted-foreground'
                              }`}
                            >
                              <Icon className="size-5" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{method.name}</div>
                              <div className="mt-0.5 text-sm text-muted-foreground">
                                {method.description}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-primary py-3.5 font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Thanh toán & Đăng ký'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
