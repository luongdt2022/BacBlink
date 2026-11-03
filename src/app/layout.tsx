import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { I18nProvider } from "@/components/common/i18n-provider";
import { ToastProvider } from "@/components/common/toast";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { AIAssistantWidget } from "@/components/home/AIAssistantWidget";
import { NavigationProgress } from "@/components/common/navigation-progress";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NacenTwin — Nền Tảng Đổi Mới Sáng Tạo & Kết Nối Cung Cầu Công Nghệ",
  description: "Cổng dữ liệu số Quốc gia thuộc Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech - Bộ KH&CN)",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/NACENTECH_Main-Logo-G.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/NACENTECH_Main-Logo-G.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              {/* Trợ lý ảo AI NacentTwin nổi toàn hệ thống trên tất cả các màn hình */}
              <AIAssistantWidget />
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
