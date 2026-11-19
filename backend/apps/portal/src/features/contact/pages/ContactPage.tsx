import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContactPageProps {
  onNavigate?: (itemId: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    };

    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    if (!formData.subject) {
      newErrors.subject = 'Vui lòng chọn chủ đề';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24h.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Địa chỉ',
      value: '54 Triều Khúc, Thanh Xuân, Hà Nội',
    },
    {
      icon: Phone,
      label: 'Số điện thoại',
      value: '1900 xxxx',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'support@dmst.gov.vn',
    },
    {
      icon: Clock,
      label: 'Giờ làm việc',
      value: 'Thứ 2 - Thứ 6: 8:00 - 17:00',
    },
  ];

  const subjects = [
    { value: '', label: '-- Chọn chủ đề --' },
    { value: 'valuation', label: 'Định giá công nghệ' },
    { value: 'ip-consulting', label: 'Tư vấn tài sản trí tuệ' },
    { value: 'innovation-assessment', label: 'Đánh giá năng lực đổi mới sáng tạo' },
    { value: 'operation-expert', label: 'Chuyên gia vận hành' },
    { value: 'tech-expert', label: 'Chuyên gia công nghệ' },
    { value: 'training', label: 'Đào tạo & Hỗ trợ' },
  ];

  return (
    <DashboardLayout contentOnly activeMenuItem="contact" onNavigate={onNavigate}>
      <div className="min-h-screen bg-[#f9fafb]">
        {/* Header */}
        <div className="border-b border bg-white px-8 py-6">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Liên hệ với chúng tôi</h1>
          <p className="text-muted-foreground">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            {/* Left Side: Contact Information */}
            <div className="space-y-6">
              <div className="rounded-xl border border bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  Thông tin liên hệ
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#e0f2fe]">
                          <Icon className="size-6 text-primary" />
                        </div>
                        <div>
                          <div className="mb-1 text-sm font-medium text-muted-foreground">
                            {item.label}
                          </div>
                          <div className="font-medium text-foreground">{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Google Map Placeholder */}
              <div className="overflow-hidden rounded-xl border border bg-white shadow-sm">
                <div className="relative h-80 bg-gradient-to-br from-[#e0f2fe] to-[#f0f9ff]">
                  <div className="flex size-full items-center justify-center">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-3 size-12 text-primary" />
                      <p className="font-medium text-muted-foreground">Bản đồ Google Maps</p>
                      <p className="text-sm text-[#9ca3af]">
                        54 Triều Khúc, Thanh Xuân, Hà Nội
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="rounded-xl border border bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Gửi tin nhắn cho chúng tôi
              </h2>

              {isSuccess && (
                <div className="mb-6 rounded-lg border border-[#16a34a] bg-[#dcfce7] p-4">
                  <p className="font-medium text-[#16a34a]">
                    ✓ Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24h.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Họ và tên */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Họ và tên <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên của bạn"
                    className={`w-full rounded-lg border ${
                      errors.fullName ? 'border-[#dc2626]' : 'border'
                    } bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-[#dc2626]">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full rounded-lg border ${
                      errors.email ? 'border-[#dc2626]' : 'border'
                    } bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-[#dc2626]">{errors.email}</p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Số điện thoại <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0912345678"
                    className={`w-full rounded-lg border ${
                      errors.phone ? 'border-[#dc2626]' : 'border'
                    } bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-[#dc2626]">{errors.phone}</p>
                  )}
                </div>

                {/* Chủ đề */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Chủ đề <span className="text-[#dc2626]">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className={`w-full rounded-lg border ${
                      errors.subject ? 'border-[#dc2626]' : 'border'
                    } bg-white px-4 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  >
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-xs text-[#dc2626]">{errors.subject}</p>
                  )}
                </div>

                {/* Nội dung */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nội dung <span className="text-[#dc2626]">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={6}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    className={`w-full rounded-lg border ${
                      errors.message ? 'border-[#dc2626]' : 'border'
                    } bg-white px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-[#dc2626]">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg px-6 py-3 font-medium text-white transition-all ${
                    isSubmitting
                      ? 'cursor-not-allowed bg-[#9ca3af]'
                      : 'bg-primary hover:bg-primary/90 hover:shadow-md'
                  }`}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
