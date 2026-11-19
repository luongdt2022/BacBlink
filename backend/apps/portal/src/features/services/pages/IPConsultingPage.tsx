import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { FileText, TrendingUp, FileSignature, BookOpen, Phone, Mail, Users, Award, Target } from 'lucide-react';

interface IPConsultingPageProps {
  onNavigate?: (itemId: string) => void;
  onContactClick?: () => void;
  onRegisterService?: () => void;
}

export function IPConsultingPage({ onNavigate, onContactClick, onRegisterService }: IPConsultingPageProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const services = [
    {
      icon: TrendingUp,
      title: 'Định giá tiềm năng thương mại',
      description: 'Phân tích và đánh giá giá trị thị trường của tài sản trí tuệ, hỗ trợ ra quyết định đầu tư hiệu quả.',
    },
    {
      icon: FileSignature,
      title: 'Tư vấn chiến lược chuyển giao',
      description: 'Tư vấn quy trình và chiến lược chuyển giao công nghệ an toàn, tối ưu lợi ích cho cả hai bên.',
    },
    {
      icon: FileText,
      title: 'Hỗ trợ thỏa thuận hợp đồng',
      description: 'Soạn thảo và thẩm định hợp đồng khai thác IP, đảm bảo tuân thủ pháp lý và bảo vệ quyền lợi.',
    },
    {
      icon: BookOpen,
      title: 'Hỗ trợ khung khai thác IP',
      description: 'Xây dựng khung pháp lý và chiến lược khai thác tài sản trí tuệ bền vững và hiệu quả.',
    },
  ];

  const processSteps = [
    {
      number: 1,
      title: 'Tiếp nhận yêu cầu',
      description: 'Lắng nghe nhu cầu và thu thập thông tin ban đầu',
    },
    {
      number: 2,
      title: 'Phân tích và đánh giá',
      description: 'Nghiên cứu sâu tài sản trí tuệ và tiềm năng khai thác',
    },
    {
      number: 3,
      title: 'Tư vấn và khuyến nghị',
      description: 'Đề xuất giải pháp tối ưu và lộ trình thực hiện',
    },
    {
      number: 4,
      title: 'Hỗ trợ triển khai',
      description: 'Đồng hành xuyên suốt quá trình thực thi',
    },
  ];

  const metrics = [
    { value: '120+', label: 'Dự án tư vấn' },
    { value: '92%', label: 'Tỷ lệ thành công' },
    { value: '35+', label: 'Chuyên gia' },
    { value: '4.8/5', label: 'Đánh giá khách hàng' },
  ];

  const whyChooseUs = [
    {
      icon: Users,
      title: 'Chuyên gia hàng đầu',
      description: 'Đội ngũ chuyên gia giàu kinh nghiệm trong lĩnh vực sở hữu trí tuệ và chuyển giao công nghệ.',
    },
    {
      icon: Award,
      title: 'Phương pháp khoa học',
      description: 'Áp dụng phương pháp định giá và phân tích tiêu chuẩn quốc tế, đảm bảo tính chính xác và minh bạch.',
    },
    {
      icon: Target,
      title: 'Kết quả thực tế',
      description: 'Cam kết mang lại giá trị thực cho khách hàng với tỷ lệ thành công cao trong khai thác IP.',
    },
  ];

  return (
    <DashboardLayout contentOnly activeMenuItem="service-ip-consulting" onNavigate={onNavigate}>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#f0f9ff] to-white px-8 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">
              Tư vấn chuyên nghiệp khai thác tài sản trí tuệ
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Dịch vụ tư vấn chuyên sâu giúp bạn thỏa thuận, định giá và khai thác tài sản trí tuệ một cách hiệu quả, minh bạch và an toàn pháp lý.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onRegisterService}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Đăng ký dịch vụ
              </button>
              <button
                onClick={() => scrollToSection('service-details')}
                className="rounded-lg border border bg-white px-6 py-3 font-medium text-[#4b5563] shadow-sm transition-all hover:bg-[#f9fafb] hover:shadow-md"
              >
                Khám phá dịch vụ
              </button>
            </div>
          </div>
        </section>

        {/* Service Details Section */}
        <section id="service-details" className="bg-white px-8 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              Chi tiết dịch vụ tư vấn
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#e0f2fe]">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {service.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="bg-[#f9fafb] px-8 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              Quy trình tư vấn
            </h2>
            <div className="relative">
              {/* Desktop: Horizontal Timeline */}
              <div className="hidden md:block">
                <div className="mb-8 flex items-center justify-between">
                  {processSteps.map((step, index) => (
                    <div key={index} className="relative flex-1">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-md">
                          {step.number}
                        </div>
                        <h3 className="mb-2 text-center font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-center text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {index < processSteps.length - 1 && (
                        <div className="absolute left-[calc(50%+32px)] top-8 h-0.5 w-[calc(100%-64px)] bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile: Vertical Timeline */}
              <div className="md:hidden">
                <div className="space-y-6">
                  {processSteps.map((step, index) => (
                    <div key={index} className="relative flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                          {step.number}
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className="my-2 h-full w-0.5 bg-primary" />
                        )}
                      </div>
                      <div className="pb-6">
                        <h3 className="mb-1 font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="bg-white px-8 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              Kết quả đạt được
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-gradient-to-br from-[#e0f2fe] to-[#f0f9ff] p-6 text-center shadow-sm"
                >
                  <div className="mb-2 text-4xl font-bold text-primary">
                    {metric.value}
                  </div>
                  <div className="font-medium text-[#4b5563]">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-[#f9fafb] px-8 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              Tại sao chọn chúng tôi
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {whyChooseUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border bg-white p-6 text-center shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="flex size-16 items-center justify-center rounded-full bg-[#e0f2fe]">
                        <Icon className="size-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-br from-primary to-primary/90 px-8 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-white">
              Bắt đầu tư vấn ngay hôm nay
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:1900xxxx"
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-primary shadow-md transition-all hover:shadow-lg"
              >
                <Phone className="size-5" />
                Gọi ngay 1900 xxxx
              </a>
              <button
                onClick={onContactClick}
                className="flex items-center gap-2 rounded-lg border-2 border-white bg-transparent px-6 py-3 font-medium text-white transition-all hover:bg-white hover:text-primary"
              >
                <Mail className="size-5" />
                Gửi email cho chúng tôi
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}