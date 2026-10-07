import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { I18nProvider } from "@/components/common/i18n-provider";
import { ToastProvider } from "@/components/common/toast";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PlatformSwitcher } from "@/components/common/platform-switcher";

const beVietnamPro = localFont({
  src: [
    { path: "../../public/fonts/be-vietnam-pro/400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/be-vietnam-pro/500.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/be-vietnam-pro/600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/be-vietnam-pro/700.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/be-vietnam-pro/800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NacenTwin — Nền Tảng Đổi Mới Sáng Tạo & Kết Nối Cung Cầu Công Nghệ",
  description: "Cổng dữ liệu số Quốc gia thuộc Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech - Bộ KH&CN)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnamPro.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <PlatformSwitcher />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
