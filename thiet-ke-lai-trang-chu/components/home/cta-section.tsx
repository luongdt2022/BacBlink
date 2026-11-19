import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-accent px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.white/15%),transparent_50%)]"
        />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight text-accent-foreground sm:text-3xl">
            Sẵn sàng đưa công nghệ của bạn đến gần hơn với thị trường?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-accent-foreground/90 sm:text-base">
            Tham gia mạng lưới hơn 10.000 doanh nghiệp, viện nghiên cứu và nhà đầu tư trên toàn quốc ngay hôm nay.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="secondary" className="bg-white text-accent hover:bg-white/90">
              Đăng ký miễn phí
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent-foreground/30 bg-transparent text-accent-foreground hover:bg-white/10"
            >
              Liên hệ tư vấn
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
