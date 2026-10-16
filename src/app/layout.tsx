import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Nunito_Sans, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { I18nProvider } from "@/components/common/i18n-provider";
import { ToastProvider } from "@/components/common/toast";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { AIAssistantWidget } from "@/components/home/AIAssistantWidget";
import { NavigationProgress } from "@/components/common/navigation-progress";

const nunitoSans = Nunito_Sans({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700"],
  variable: "--font-lora",
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
    <html lang="vi" className={`${nunitoSans.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <Navbar />
              <main className="flex-1 animate-page-enter">{children}</main>
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
