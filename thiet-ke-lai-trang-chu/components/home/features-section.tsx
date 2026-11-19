import { ShieldCheck, Handshake, LineChart, Clock } from "lucide-react"

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Công nghệ được kiểm định",
    description:
      "Mỗi công nghệ đăng tải đều được Viện thẩm định mức độ sẵn sàng (TRL) và pháp lý sở hữu trí tuệ trước khi công bố.",
  },
  {
    icon: Handshake,
    title: "Kết nối trực tiếp, không trung gian",
    description:
      "Doanh nghiệp và nhà khoa học trao đổi, đàm phán chuyển giao trực tiếp trên nền tảng, tiết kiệm thời gian và chi phí.",
  },
  {
    icon: LineChart,
    title: "Dữ liệu minh bạch, cập nhật",
    description: "Theo dõi tiến độ giao dịch, lịch sử chuyển giao và đánh giá từ các bên theo thời gian thực.",
  },
  {
    icon: Clock,
    title: "Hỗ trợ 24/7 từ chuyên gia",
    description: "Đội ngũ chuyên gia của Viện đồng hành tư vấn kỹ thuật, pháp lý và tài chính cho từng giao dịch.",
  },
]

export function FeaturesSection() {
  return (
    <section id="gioi-thieu" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Vì sao chọn NacenTwin
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Nền tảng được xây dựng và vận hành bởi Viện Ứng dụng Công nghệ, đảm bảo độ tin cậy cho mọi giao dịch.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
