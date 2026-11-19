import React from "react";
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
import { ContactModalHost } from "@/components/common/contact-modal";
import { ORG, ORG_DECISION_TEXT } from "@/lib/constants/organization";

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
  title: "BACLINK — Cổng Thông Tin & Kết Nối Chuỗi Cung Ứng Công Nghiệp Bắc Ninh",
  description: `${ORG.fullName} (BACLINK) - Thành lập theo ${ORG_DECISION_TEXT}`,
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <NavigationProgress />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              {/* CR-BACLINK-008: Gọi · Zalo · Lên đầu trang (trái) + Trợ lý AI (phải) */}
              <ContactModalHost />
              <AIAssistantWidget />
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
