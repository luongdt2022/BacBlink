import { Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const STATS = [
  { value: "1.200+", label: "Công nghệ chào bán" },
  { value: "850+", label: "Nhu cầu đặt hàng" },
  { value: "63", label: "Tỉnh, thành kết nối" },
  { value: "10.000+", label: "Doanh nghiệp tham gia" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.accent/25%),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/20">
            Sàn giao dịch công nghệ Quốc gia
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Kết nối cung – cầu công nghệ,
            <br />
            thúc đẩy đổi mới sáng tạo
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Nền tảng do Viện Ứng dụng Công nghệ vận hành, giúp doanh nghiệp, nhà khoa học và nhà đầu tư tìm kiếm,
            chuyển giao và ứng dụng công nghệ một cách nhanh chóng, minh bạch.
          </p>

          <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row" role="search">
            <label htmlFor="hero-search" className="sr-only">
              Tìm kiếm công nghệ, lĩnh vực hoặc đơn vị
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="hero-search"
                type="search"
                placeholder="Tìm công nghệ, lĩnh vực, đơn vị chuyển giao..."
                className="h-12 w-full rounded-lg border-0 bg-white pl-10 pr-4 text-sm text-foreground shadow-lg outline-none ring-1 ring-white/10 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <Button size="lg" type="submit" className="h-12 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
              Tìm kiếm
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              Chào bán công nghệ
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              Đăng nhu cầu đặt hàng
            </Button>
          </div>
        </div>

        <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</dd>
              <dt className="mt-1 text-xs font-medium text-white/70 sm:text-sm">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
