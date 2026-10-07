import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NacenTwin — Sàn giao dịch công nghệ Quốc gia',
  description:
    'Nền tảng kết nối cung – cầu công nghệ do Viện Ứng dụng Công nghệ vận hành, giúp doanh nghiệp, nhà khoa học và nhà đầu tư chuyển giao, ứng dụng công nghệ nhanh chóng và minh bạch.',
  generator: 'v0.app',
  icons: {
    icon: '/institute-icon.png',
    apple: '/institute-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0d47a1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
