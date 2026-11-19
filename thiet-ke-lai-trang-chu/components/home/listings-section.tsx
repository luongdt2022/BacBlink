import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Listing = {
  title: string
  field: string
  owner: string
  location: string
  trl: string
  image: string
}

const OFFERS: Listing[] = [
  {
    title: "Hệ thống kiểm định chất lượng bằng thị giác máy AI",
    field: "Công nghiệp 4.0",
    owner: "Viện Ứng dụng Công nghệ",
    location: "Hà Nội",
    trl: "TRL 8 — Sẵn sàng thương mại",
    image: "/tech-ai-vision.png",
  },
  {
    title: "Công nghệ vi tảo sản xuất nhiên liệu sinh học",
    field: "Công nghệ sinh học",
    owner: "Trường Đại học Bách khoa",
    location: "TP. Hồ Chí Minh",
    trl: "TRL 6 — Thử nghiệm thực địa",
    image: "/tech-biotech.png",
  },
  {
    title: "Pin lưu trữ tích hợp cho hệ thống điện mặt trời áp mái",
    field: "Năng lượng sạch",
    owner: "Công ty CP Năng lượng Xanh",
    location: "Đà Nẵng",
    trl: "TRL 7 — Vận hành thí điểm",
    image: "/tech-solar.png",
  },
]

const DEMANDS: Listing[] = [
  {
    title: "Tìm giải pháp giám sát sâu bệnh bằng IoT cho vùng trồng lúa",
    field: "Nông nghiệp thông minh",
    owner: "Sở NN&PTNT Đồng Tháp",
    location: "Đồng Tháp",
    trl: "Ngân sách: 1,5 – 3 tỷ đồng",
    image: "/tech-agri.png",
  },
  {
    title: "Cần chuyển giao công nghệ xử lý nước thải công nghiệp chi phí thấp",
    field: "Môi trường",
    owner: "Khu công nghiệp Hòa Khánh",
    location: "Đà Nẵng",
    trl: "Ngân sách: 5 – 8 tỷ đồng",
    image: "/tech-solar.png",
  },
  {
    title: "Đặt hàng dây chuyền tự động hóa đóng gói dược phẩm",
    field: "Y tế - Dược phẩm",
    owner: "Công ty Dược phẩm Miền Trung",
    location: "Huế",
    trl: "Ngân sách: 3 – 5 tỷ đồng",
    image: "/tech-ai-vision.png",
  },
]

function ListingCard({ item, priority = false }: { item: Listing; priority?: boolean }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          fill
          priority={priority}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 bg-white text-primary shadow-sm">{item.field}</Badge>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.owner}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {item.location}
          </span>
          <span className="font-medium text-accent">{item.trl}</span>
        </div>
      </div>
    </div>
  )
}

export function ListingsSection() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Công nghệ &amp; nhu cầu nổi bật
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Cập nhật liên tục từ mạng lưới viện, trường, doanh nghiệp trên toàn quốc.
            </p>
          </div>
        </div>

        <Tabs defaultValue="offers" className="mt-10">
          <TabsList>
            <TabsTrigger id="chao-ban" value="offers">
              Chào bán công nghệ
            </TabsTrigger>
            <TabsTrigger id="nhu-cau" value="demands">
              Nhu cầu đặt hàng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {OFFERS.map((item) => (
                <ListingCard key={item.title} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="demands" className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DEMANDS.map((item) => (
                <ListingCard key={item.title} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-10 flex justify-center">
          <Button render={<Link href="#" />} nativeButton={false} variant="outline" size="lg">
            Xem tất cả
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
