import Image from "next/image"
import Link from "next/link"
import { Globe, Play, Mail, Phone, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const COLUMNS = [
  {
    title: "Về NacenTwin",
    links: ["Giới thiệu Viện", "Sứ mệnh & tầm nhìn", "Tin tức & sự kiện", "Tuyển dụng"],
  },
  {
    title: "Dịch vụ",
    links: ["Chào bán công nghệ", "Đăng nhu cầu đặt hàng", "Thẩm định TRL", "Tư vấn chuyển giao"],
  },
  {
    title: "Hỗ trợ",
    links: ["Câu hỏi thường gặp", "Hướng dẫn sử dụng", "Điều khoản dịch vụ", "Chính sách bảo mật"],
  },
]

export function SiteFooter() {
  return (
    <footer id="lien-he" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image
                src="/institute-icon.png"
                alt="Biểu trưng NacenTech"
                width={32}
                height={32}
                className="size-8 object-contain"
              />
              <span className="text-sm font-bold text-foreground">NacenTwin</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Nền tảng sàn giao dịch công nghệ do Viện Ứng dụng Công nghệ vận hành, kết nối cung – cầu công nghệ trên
              toàn quốc.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>Số 25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span>(024) 3822 1188</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                <span>lienhe@nacentwin.vn</span>
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-muted-foreground transition hover:text-primary">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Viện Ứng dụng Công nghệ (NacenTech). Đã đăng ký Bộ Công Thương.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              aria-label="Facebook"
              className="flex size-8 items-center justify-center rounded-full bg-white text-muted-foreground ring-1 ring-border transition hover:text-primary"
            >
              <Globe className="size-4" />
            </Link>
            <Link
              href="#"
              aria-label="Youtube"
              className="flex size-8 items-center justify-center rounded-full bg-white text-muted-foreground ring-1 ring-border transition hover:text-primary"
            >
              <Play className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
