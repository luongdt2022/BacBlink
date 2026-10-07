import { FileSearch, ClipboardCheck, Handshake, FileSignature, Rocket, HeartHandshake } from "lucide-react"

const STEPS = [
  {
    icon: FileSearch,
    title: "Đăng công nghệ / nhu cầu",
    description: "Chủ sở hữu công nghệ hoặc đơn vị có nhu cầu tạo hồ sơ, mô tả chi tiết trên nền tảng.",
  },
  {
    icon: ClipboardCheck,
    title: "Thẩm định & kiểm định",
    description: "Chuyên gia của Viện đánh giá mức độ sẵn sàng công nghệ (TRL) và tính pháp lý.",
  },
  {
    icon: Handshake,
    title: "Kết nối các bên liên quan",
    description: "Hệ thống gợi ý và kết nối bên chào bán với bên có nhu cầu phù hợp.",
  },
  {
    icon: FileSignature,
    title: "Đàm phán & ký kết",
    description: "Hai bên trao đổi trực tiếp, soạn thảo và ký kết hợp đồng chuyển giao.",
  },
  {
    icon: Rocket,
    title: "Triển khai chuyển giao",
    description: "Đội ngũ kỹ thuật hỗ trợ lắp đặt, chuyển giao và đào tạo vận hành công nghệ.",
  },
  {
    icon: HeartHandshake,
    title: "Hỗ trợ hậu chuyển giao",
    description: "Theo dõi vận hành, đánh giá hiệu quả và hỗ trợ xử lý phát sinh sau chuyển giao.",
  },
]

export function ProcessSection() {
  return (
    <section id="quy-trinh" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Quy trình 6 bước</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Minh bạch, rõ ràng từ lúc đăng tải đến khi công nghệ được ứng dụng thực tế.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="relative rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </div>
              <step.icon className="size-6 text-accent" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
