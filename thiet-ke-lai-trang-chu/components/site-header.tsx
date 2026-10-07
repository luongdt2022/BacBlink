"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "#gioi-thieu", label: "Giới thiệu" },
  { href: "#chao-ban", label: "Chào bán công nghệ" },
  { href: "#nhu-cau", label: "Nhu cầu đặt hàng" },
  { href: "#quy-trinh", label: "Quy trình" },
  { href: "#lien-he", label: "Liên hệ" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/institute-icon.png"
            alt="Biểu trưng NacenTech"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-foreground">NacenTwin</span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-accent sm:inline">
              Viện Ứng dụng Công nghệ
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Tìm kiếm công nghệ">
            <Search />
          </Button>
          <Button variant="outline">Đăng nhập</Button>
          <Button>Đăng ký</Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Button variant="outline" className="w-full">
                Đăng nhập
              </Button>
              <Button className="w-full">Đăng ký</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
